/* 评价明细列表逻辑 */
bootstrapSubPage({
    el: '#app',
    data: {
        loading: false,
        list: [],
        sources: [],
        ratings: [],

        search: { keyword: '', source: '', sentiment: '', dateRange: [], scoreRange: '' },
        currentPage: 1,
        pageSize: 20,

        detailDialog: false,
        current: null,

        editDialog: false,
        editForm: null
    },
    computed: {
        filtered() {
            let arr = this.list;
            const kw = this.search.keyword;
            if (kw) arr = arr.filter(r => (r.content || '').indexOf(kw) >= 0 || (r.order_no || '').indexOf(kw) >= 0);
            if (this.search.source) arr = arr.filter(r => r.source === this.search.source);
            if (this.search.sentiment) arr = arr.filter(r => r.overall_sentiment === this.search.sentiment);
            if (this.search.scoreRange === 'positive') arr = arr.filter(r => r.total_score > 0);
            if (this.search.scoreRange === 'zero') arr = arr.filter(r => r.total_score === 0);
            if (this.search.scoreRange === 'negative') arr = arr.filter(r => r.total_score < 0);
            if (this.search.dateRange && this.search.dateRange.length === 2) {
                const [start, end] = this.search.dateRange;
                arr = arr.filter(r => {
                    const t = Utils.formatDate(r.review_time);
                    return t >= start && t <= end + ' 23:59:59';
                });
            }
            return arr;
        },
        paged() {
            const start = (this.currentPage - 1) * this.pageSize;
            return this.filtered.slice(start, start + this.pageSize);
        }
    },
    created() {
        this.sources = Store.get('config_sources', DEFAULT_SOURCES);
        this.ratings = Store.get('config_ratings', DEFAULT_RATINGS);
        this.reload();
    },
    methods: {
        Utils,
        sentimentLabel,
        sentimentColor,
        async reload() {
            this.loading = true;
            try {
                await API.syncReviewsFromServer();
                this.list = Store.get('reviews_data', []);
            } finally {
                this.loading = false;
            }
        },
        sourceName(key) {
            const s = this.sources.find(x => x.key === key);
            return s ? s.name : (key || '-');
        },
        isManuallyAdjusted(row) {
            return (row.dimensions || []).some(d => d.is_manually_adjusted);
        },
        doSearch() {
            this.currentPage = 1;
        },
        resetSearch() {
            this.search = { keyword: '', source: '', sentiment: '', dateRange: [], scoreRange: '' };
            this.currentPage = 1;
        },
        viewDetail(row) {
            this.current = Utils.deepClone(row);
            this.detailDialog = true;
        },
        editRecord(row) {
            this.editForm = Utils.deepClone(row);
            this.editDialog = true;
        },
        onScoreChange(idx, val) {
            // 标记人工修正
            this.editForm.dimensions[idx].is_manually_adjusted = true;
            // 重算总分
            const total = this.editForm.dimensions.reduce((s, d) => s + (Number(d.score) || 0), 0);
            this.editForm.total_score = total;
        },
        saveEdit() {
            // 重算总分
            this.editForm.total_score = this.editForm.dimensions.reduce((s, d) => s + (Number(d.score) || 0), 0);
            this.editForm.updated_at = Utils.formatTime(new Date());
            // 找到原记录并替换
            const idx = this.list.findIndex(r => r.id === this.editForm.id);
            if (idx >= 0) {
                this.list[idx] = Utils.deepClone(this.editForm);
                Store.set('reviews_data', this.list);
                API.syncReviewsToServer();
                Logger.log('人工修正', `修正评价评分：${this.editForm.id}`);
                this.$message.success('已保存修正');
                this.editDialog = false;
            }
        },
        deleteRecord(idx) {
            this.$confirm('确认删除该评价记录？删除后不可恢复', '提示', { type: 'warning' }).then(() => {
                const target = this.paged[idx];
                const realIdx = this.list.findIndex(r => r.id === target.id);
                if (realIdx >= 0) {
                    this.list.splice(realIdx, 1);
                    Store.set('reviews_data', this.list);
                    API.syncReviewsToServer();
                    Logger.log('删除记录', `删除评价：${target.id}`);
                    this.$message.success('已删除');
                }
            }).catch(() => {});
        },
        exportData() {
            Utils.downloadJSON(this.filtered, 'reviews_export_' + Utils.formatDate(new Date()) + '.json');
        },
        triggerImport() {
            this.$refs.fileInput.click();
        },
        importData(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (Array.isArray(data)) {
                        this.list = data;
                        Store.set('reviews_data', this.list);
                        API.syncReviewsToServer();
                        this.$message.success(`已导入 ${data.length} 条`);
                        Logger.log('导入数据', `导入 ${data.length} 条评价记录`);
                    } else {
                        this.$message.error('文件格式不正确');
                    }
                } catch (err) {
                    this.$message.error('JSON 解析失败');
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        }
    }
});
