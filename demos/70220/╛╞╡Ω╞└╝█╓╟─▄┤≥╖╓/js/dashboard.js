/* Dashboard 统计分析逻辑 */
bootstrapSubPage({
    el: '#app',
    data: {
        list: [],
        dimensions: [],
        ratings: [],
        sources: [],
        selectedDim: '',
        charts: {}
    },
    computed: {
        stats() {
            const total = this.list.length;
            const done = this.list.filter(r => r.analysis_status === '已完成').length;
            const pending = this.list.filter(r => r.analysis_status === '待分析').length;
            const analyzed = this.list.filter(r => r.analysis_status === '已完成');
            const sumScore = analyzed.reduce((s, r) => s + (Number(r.total_score) || 0), 0);
            const avgScore = analyzed.length > 0 ? sumScore / analyzed.length : 0;
            // 好评率（总分 > 0）
            const positiveCount = analyzed.filter(r => r.total_score > 0).length;
            const negativeCount = analyzed.filter(r => r.total_score < 0).length;
            const positiveRate = analyzed.length > 0 ? (positiveCount * 100 / analyzed.length).toFixed(1) : '0.0';
            const negativeRate = analyzed.length > 0 ? (negativeCount * 100 / analyzed.length).toFixed(1) : '0.0';

            // 各维度平均分
            const dimStats = {};
            this.dimensions.forEach(d => {
                const scores = [];
                analyzed.forEach(r => {
                    (r.dimensions || []).forEach(ds => {
                        if (ds.dimension === d.key) scores.push(Number(ds.score) || 0);
                    });
                });
                dimStats[d.key] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            });
            const dimArr = this.dimensions.map(d => ({ name: d.name, key: d.key, avg: dimStats[d.key] || 0 }));
            dimArr.sort((a, b) => a.avg - b.avg);
            const worstDim = dimArr[0] || null;
            const bestDim = dimArr[dimArr.length - 1] || null;

            return { total, done, pending, avgScore, positiveRate, negativeRate, negativeCount, worstDim, bestDim };
        },
        worstList() {
            if (!this.selectedDim) {
                return this.list.filter(r => r.total_score < 0).sort((a, b) => a.total_score - b.total_score).slice(0, 5);
            }
            const arr = [];
            this.list.forEach(r => {
                (r.dimensions || []).forEach(d => {
                    if (d.dimension === this.selectedDim && d.score < 0) {
                        arr.push({ ...r, dim_score: d.score });
                    }
                });
            });
            arr.sort((a, b) => a.dim_score - b.dim_score);
            return arr.slice(0, 5);
        }
    },
    async created() {
        this.dimensions = Store.get('config_dimensions', DEFAULT_DIMENSIONS).filter(d => d.enabled);
        this.ratings = Store.get('config_ratings', DEFAULT_RATINGS);
        this.sources = Store.get('config_sources', DEFAULT_SOURCES);
        await API.syncReviewsFromServer();
        this.list = Store.get('reviews_data', []);
        if (this.dimensions[0]) this.selectedDim = this.dimensions[0].key;
        this.$nextTick(() => this.renderCharts());
    },
    methods: {
        Utils,
        sentimentLabel,
        sentimentColor,
        renderCharts() {
            this.renderDimBar();
            this.renderSentimentPie();
            this.renderSourcePie();
            this.renderTrendLine();
            this.renderDimRadar();
        },
        getChart(refName) {
            const el = this.$refs[refName];
            if (!el) return null;
            if (!this.charts[refName]) {
                this.charts[refName] = echarts.init(el);
            }
            return this.charts[refName];
        },
        renderDimBar() {
            const chart = this.getChart('dimBar');
            if (!chart) return;
            const analyzed = this.list.filter(r => r.analysis_status === '已完成');
            const data = this.dimensions.map(d => {
                const scores = [];
                analyzed.forEach(r => {
                    (r.dimensions || []).forEach(ds => {
                        if (ds.dimension === d.key) scores.push(Number(ds.score) || 0);
                    });
                });
                return { name: d.name, avg: scores.length > 0 ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0 };
            });
            chart.setOption({
                tooltip: { trigger: 'axis', formatter: '{b}: {c} 分' },
                grid: { left: 50, right: 30, top: 30, bottom: 30 },
                xAxis: { type: 'category', data: data.map(d => d.name), axisLabel: { interval: 0 } },
                yAxis: { type: 'value', name: '平均分' },
                series: [{
                    type: 'bar',
                    data: data.map(d => ({
                        value: d.avg,
                        itemStyle: { color: d.avg > 0 ? '#67c23a' : (d.avg < 0 ? '#f56c6c' : '#909399') }
                    })),
                    label: { show: true, position: 'top', formatter: '{c}' }
                }]
            });
        },
        renderSentimentPie() {
            const chart = this.getChart('sentimentPie');
            if (!chart) return;
            const data = {};
            this.ratings.forEach(r => data[r.key] = 0);
            this.list.forEach(r => {
                if (r.overall_sentiment) data[r.overall_sentiment] = (data[r.overall_sentiment] || 0) + 1;
            });
            const arr = this.ratings.map(r => ({ name: r.name, value: data[r.key] || 0, itemStyle: { color: r.color } }));
            chart.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                legend: { bottom: 0, type: 'scroll' },
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '45%'],
                    label: { formatter: '{b}\n{c}条' },
                    data: arr
                }]
            });
        },
        renderSourcePie() {
            const chart = this.getChart('sourcePie');
            if (!chart) return;
            const data = {};
            this.list.forEach(r => {
                const key = r.source || '未知';
                data[key] = (data[key] || 0) + 1;
            });
            const arr = Object.keys(data).map(k => {
                const s = this.sources.find(x => x.key === k);
                return { name: s ? s.name : k, value: data[k] };
            });
            chart.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                legend: { bottom: 0, type: 'scroll' },
                series: [{
                    type: 'pie',
                    radius: '60%',
                    center: ['50%', '45%'],
                    label: { formatter: '{b}\n{c}条' },
                    data: arr
                }]
            });
        },
        renderTrendLine() {
            const chart = this.getChart('trendLine');
            if (!chart) return;
            // 按日期聚合
            const map = {};
            this.list.forEach(r => {
                if (!r.review_time) return;
                const day = Utils.formatDate(r.review_time);
                if (!map[day]) map[day] = { sum: 0, count: 0 };
                map[day].sum += Number(r.total_score) || 0;
                map[day].count++;
            });
            const days = Object.keys(map).sort();
            const avgData = days.map(d => +(map[d].sum / map[d].count).toFixed(2));
            const cntData = days.map(d => map[d].count);
            chart.setOption({
                tooltip: { trigger: 'axis' },
                legend: { data: ['平均分', '评价数'], bottom: 0 },
                grid: { left: 50, right: 50, top: 30, bottom: 40 },
                xAxis: { type: 'category', data: days },
                yAxis: [
                    { type: 'value', name: '平均分', position: 'left' },
                    { type: 'value', name: '评价数', position: 'right' }
                ],
                series: [
                    { name: '平均分', type: 'line', smooth: true, data: avgData, itemStyle: { color: '#409EFF' } },
                    { name: '评价数', type: 'bar', yAxisIndex: 1, data: cntData, itemStyle: { color: '#67c23a' } }
                ]
            });
        },
        renderDimRadar() {
            const chart = this.getChart('dimRadar');
            if (!chart) return;
            const analyzed = this.list.filter(r => r.analysis_status === '已完成');
            const dimAvgs = this.dimensions.map(d => {
                const scores = [];
                analyzed.forEach(r => {
                    (r.dimensions || []).forEach(ds => {
                        if (ds.dimension === d.key) scores.push(Number(ds.score) || 0);
                    });
                });
                return scores.length > 0 ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
            });
            chart.setOption({
                tooltip: {},
                radar: {
                    indicator: this.dimensions.map(d => ({ name: d.name, max: 10, min: -10 })),
                    radius: '65%'
                },
                series: [{
                    type: 'radar',
                    data: [{ value: dimAvgs, name: '平均得分' }],
                    areaStyle: { color: 'rgba(64,158,255,0.3)' },
                    lineStyle: { color: '#409EFF' },
                    itemStyle: { color: '#409EFF' }
                }]
            });
        }
    }
}, true);
