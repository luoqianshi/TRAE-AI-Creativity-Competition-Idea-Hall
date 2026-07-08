(function() {
    'use strict';

    // 读取 CSS 变量
    var style = getComputedStyle(document.documentElement);
    var accent = '#00d4ff';
    var accent2 = '#ff9f43';
    var accent3 = '#2ecc71';
    var accent4 = '#e74c3c';
    var accent5 = '#a855f7';
    var ink = '#e2e8f0';
    var muted = '#94a3b8';
    var rule = '#1e293b';
    var bg2 = '#111827';

    // 通用图表配置
    var commonGrid = { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true };
    var commonTooltip = { trigger: 'item', backgroundColor: bg2, borderColor: rule, textStyle: { color: ink } };

    // ========== 图表1：项目进度分布（环形图） ==========
    var chartProgress = echarts.init(document.getElementById('chart-progress'), null, { renderer: 'svg' });
    chartProgress.setOption({
        animation: true,
        tooltip: {
            trigger: 'item',
            backgroundColor: bg2,
            borderColor: rule,
            textStyle: { color: ink },
            formatter: '{b}: {c}个 ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: '5%',
            top: 'center',
            textStyle: { color: muted, fontSize: 12 },
            itemWidth: 10,
            itemHeight: 10
        },
        series: [{
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 6, borderColor: bg2, borderWidth: 2 },
            label: { show: false },
            emphasis: {
                label: { show: true, fontSize: 14, fontWeight: 'bold', color: ink }
            },
            labelLine: { show: false },
            data: [
                { value: 34, name: '已完成', itemStyle: { color: accent3 } },
                { value: 48, name: '施工中', itemStyle: { color: accent } },
                { value: 22, name: '设计阶段', itemStyle: { color: accent2 } },
                { value: 16, name: '前期准备', itemStyle: { color: accent5 } },
                { value: 8, name: '已延期', itemStyle: { color: accent4 } }
            ]
        }]
    });
    window.addEventListener('resize', function() { chartProgress.resize(); });

    // ========== 图表2：各环节完成情况（柱状图） ==========
    var chartPhases = echarts.init(document.getElementById('chart-phases'), null, { renderer: 'svg' });
    chartPhases.setOption({
        animation: true,
        tooltip: {
            trigger: 'axis',
            backgroundColor: bg2,
            borderColor: rule,
            textStyle: { color: ink },
            axisPointer: { type: 'shadow' }
        },
        grid: commonGrid,
        xAxis: {
            type: 'category',
            data: ['立项', '设计', '采购', '施工', '验收', '交付'],
            axisLine: { lineStyle: { color: rule } },
            axisLabel: { color: muted, fontSize: 12 }
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { color: 'rgba(30,41,59,0.5)' } },
            axisLabel: { color: muted, fontSize: 11 }
        },
        series: [
            {
                name: '已完成',
                type: 'bar',
                stack: 'total',
                barWidth: '40%',
                itemStyle: { color: accent3, borderRadius: [0,0,0,0] },
                data: [128, 118, 95, 72, 45, 34]
            },
            {
                name: '进行中',
                type: 'bar',
                stack: 'total',
                itemStyle: { color: accent, borderRadius: [0,0,0,0] },
                data: [0, 10, 23, 28, 18, 12]
            },
            {
                name: '待开始',
                type: 'bar',
                stack: 'total',
                itemStyle: { color: 'rgba(148,163,184,0.3)', borderRadius: [4,4,0,0] },
                data: [0, 0, 10, 28, 65, 82]
            }
        ]
    });
    window.addEventListener('resize', function() { chartPhases.resize(); });

    // ========== 图表3：问题类型分布（饼图） ==========
    var chartIssues = echarts.init(document.getElementById('chart-issues'), null, { renderer: 'svg' });
    chartIssues.setOption({
        animation: true,
        tooltip: {
            trigger: 'item',
            backgroundColor: bg2,
            borderColor: rule,
            textStyle: { color: ink },
            formatter: '{b}: {c}个 ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: '2%',
            textStyle: { color: muted, fontSize: 11 },
            itemWidth: 10,
            itemHeight: 10
        },
        series: [{
            type: 'pie',
            radius: '65%',
            center: ['50%', '45%'],
            roseType: 'area',
            itemStyle: { borderRadius: 5, borderColor: bg2, borderWidth: 2 },
            label: { color: muted, fontSize: 11 },
            data: [
                { value: 28, name: '进度延误', itemStyle: { color: accent4 } },
                { value: 22, name: '材料问题', itemStyle: { color: accent2 } },
                { value: 18, name: '设计变更', itemStyle: { color: accent5 } },
                { value: 15, name: '人员调配', itemStyle: { color: accent } },
                { value: 12, name: '技术难题', itemStyle: { color: '#f59e0b' } },
                { value: 8, name: '外部因素', itemStyle: { color: muted } }
            ]
        }]
    });
    window.addEventListener('resize', function() { chartIssues.resize(); });

    // ========== 图表4：项目月度趋势（折线+柱状混合图） ==========
    var chartTrend = echarts.init(document.getElementById('chart-trend'), null, { renderer: 'svg' });
    chartTrend.setOption({
        animation: true,
        tooltip: {
            trigger: 'axis',
            backgroundColor: bg2,
            borderColor: rule,
            textStyle: { color: ink }
        },
        legend: {
            data: ['新立项', '已完成', '累计在建'],
            textStyle: { color: muted, fontSize: 12 },
            top: '2%'
        },
        grid: commonGrid,
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisLine: { lineStyle: { color: rule } },
            axisLabel: { color: muted, fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { color: 'rgba(30,41,59,0.5)' } },
            axisLabel: { color: muted, fontSize: 11 }
        },
        series: [
            {
                name: '新立项',
                type: 'bar',
                barWidth: '30%',
                itemStyle: { color: accent2, borderRadius: [3,3,0,0] },
                data: [8, 12, 15, 10, 14, 18, 16, 12, 10, 8, 3, 2]
            },
            {
                name: '已完成',
                type: 'bar',
                barWidth: '30%',
                itemStyle: { color: accent3, borderRadius: [3,3,0,0] },
                data: [3, 5, 4, 6, 5, 8, 7, 6, 5, 4, 3, 2]
            },
            {
                name: '累计在建',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { color: accent, width: 2 },
                itemStyle: { color: accent, borderWidth: 2, borderColor: bg2 },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(0,212,255,0.2)' },
                            { offset: 1, color: 'rgba(0,212,255,0)' }
                        ]
                    }
                },
                data: [45, 52, 63, 67, 76, 86, 95, 101, 106, 110, 110, 110]
            }
        ]
    });
    window.addEventListener('resize', function() { chartTrend.resize(); });

})();
