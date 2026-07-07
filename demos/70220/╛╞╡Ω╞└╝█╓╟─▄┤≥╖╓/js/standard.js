/* 评分标准管理逻辑 */
bootstrapSubPage({
    el: '#app',
    data: {
        activeTab: 'dimension',
        dimensions: [],
        ratings: [],
        sources: [],
        criteriaText: '',

        // 维度编辑
        dimDialog: false,
        dimForm: { id: '', key: '', name: '', description: '', keywords: '', enabled: true },

        // 等级编辑
        ratingDialog: false,
        ratingForm: { id: '', key: '', name: '', score: 0, color: '#bfbfbf', color_name: '', order: 1, description: '' },

        // 来源编辑
        sourceDialog: false,
        sourceForm: { id: '', key: '', name: '' },

        previewDialog: false
    },
    created() {
        this.loadData();
    },
    methods: {
        loadData() {
            this.dimensions = Store.get('config_dimensions', DEFAULT_DIMENSIONS);
            this.ratings = Store.get('config_ratings', DEFAULT_RATINGS);
            this.sources = Store.get('config_sources', DEFAULT_SOURCES);
            this.refreshCriteria();
        },
        refreshCriteria() {
            this.criteriaText = buildScoringCriteriaText();
        },
        saveAllDims() {
            Store.set('config_dimensions', this.dimensions);
            this.refreshCriteria();
            Logger.log('配置变更', '修改评分维度配置');
        },
        saveAllRatings() {
            Store.set('config_ratings', this.ratings);
            this.refreshCriteria();
            Logger.log('配置变更', '修改评分等级配置');
        },
        saveAllSources() {
            Store.set('config_sources', this.sources);
            Logger.log('配置变更', '修改评价来源配置');
        },

        // ===== 维度 =====
        openDimDialog(row) {
            if (row) {
                this.dimForm = Utils.deepClone(row);
            } else {
                this.dimForm = { id: '', key: '', name: '', description: '', keywords: '', enabled: true, order: this.dimensions.length + 1 };
            }
            this.dimDialog = true;
        },
        saveDim() {
            if (!this.dimForm.name || !this.dimForm.key) {
                this.$message.warning('维度名称和标识必填');
                return;
            }
            if (this.dimForm.id) {
                const idx = this.dimensions.findIndex(d => d.id === this.dimForm.id);
                if (idx >= 0) this.dimensions[idx] = Utils.deepClone(this.dimForm);
            } else {
                this.dimForm.id = Utils.uuid();
                if (!this.dimForm.order) this.dimForm.order = this.dimensions.length + 1;
                this.dimensions.push(Utils.deepClone(this.dimForm));
            }
            this.saveAllDims();
            this.dimDialog = false;
            this.$message.success('保存成功');
        },
        toggleDim(row) {
            row.enabled = !row.enabled;
            this.saveAllDims();
        },
        deleteDim(idx) {
            this.$confirm('确认删除该维度？已有评分记录的维度建议停用而非删除', '提示', { type: 'warning' }).then(() => {
                this.dimensions.splice(idx, 1);
                this.saveAllDims();
                this.$message.success('已删除');
            }).catch(() => {});
        },
        moveDim(idx, dir) {
            const newIdx = idx + dir;
            if (newIdx < 0 || newIdx >= this.dimensions.length) return;
            const tmp = this.dimensions[idx];
            this.$set(this.dimensions, idx, this.dimensions[newIdx]);
            this.$set(this.dimensions, newIdx, tmp);
            this.saveAllDims();
        },
        resetDims() {
            this.$confirm('恢复默认维度配置？将覆盖当前所有维度', '提示', { type: 'warning' }).then(() => {
                this.dimensions = Utils.deepClone(DEFAULT_DIMENSIONS);
                this.saveAllDims();
                this.$message.success('已恢复默认');
            }).catch(() => {});
        },
        exportDims() {
            Utils.downloadJSON(this.dimensions, 'dimensions.json');
        },
        importDims(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.dimensions = data;
                    this.saveAllDims();
                    this.$message.success('导入成功');
                } catch (err) {
                    this.$message.error('文件解析失败');
                }
            };
            reader.readAsText(file);
            return false;
        },

        // ===== 等级 =====
        openRatingDialog(row) {
            if (row) {
                this.ratingForm = Utils.deepClone(row);
            } else {
                this.ratingForm = {
                    id: '', key: '', name: '', score: 0,
                    color: '#bfbfbf', color_name: '灰色',
                    order: this.ratings.length + 1, description: ''
                };
            }
            this.ratingDialog = true;
        },
        saveRating() {
            if (!this.ratingForm.name || !this.ratingForm.key) {
                this.$message.warning('等级名称和标识必填');
                return;
            }
            if (this.ratingForm.id) {
                const idx = this.ratings.findIndex(r => r.id === this.ratingForm.id);
                if (idx >= 0) this.ratings[idx] = Utils.deepClone(this.ratingForm);
            } else {
                this.ratingForm.id = Utils.uuid();
                this.ratings.push(Utils.deepClone(this.ratingForm));
            }
            this.saveAllRatings();
            this.ratingDialog = false;
            this.$message.success('保存成功');
        },
        deleteRating(idx) {
            this.$confirm('确认删除该等级？', '提示', { type: 'warning' }).then(() => {
                this.ratings.splice(idx, 1);
                this.saveAllRatings();
                this.$message.success('已删除');
            }).catch(() => {});
        },
        resetRatings() {
            this.$confirm('恢复默认等级配置？', '提示', { type: 'warning' }).then(() => {
                this.ratings = Utils.deepClone(DEFAULT_RATINGS);
                this.saveAllRatings();
                this.$message.success('已恢复默认');
            }).catch(() => {});
        },
        applyTemplate(level) {
            this.$confirm(`应用 ${level} 级评分体系？将覆盖当前等级配置`, '提示', { type: 'warning' }).then(() => {
                this.ratings = this.generateTemplate(level);
                this.saveAllRatings();
                this.$message.success(`已应用 ${level} 级评分体系`);
            }).catch(() => {});
        },
        generateTemplate(level) {
            // 基于 7 级模板生成 5/7/9 级
            const full = [
                { key: 'strong_positive', name: '强好评', score: 10, color: '#52c41a', color_name: '深绿', order: 7, description: '客人明确且强烈地赞扬，使用强烈正面词汇' },
                { key: 'positive', name: '好评', score: 5, color: '#73d13d', color_name: '浅绿', order: 6, description: '客人表达满意或认可，语气较为正面' },
                { key: 'mild_positive', name: '弱好评', score: 2, color: '#b7eb8f', color_name: '黄绿', order: 5, description: '客人提及且倾向正面，但表述含糊' },
                { key: 'neutral', name: '中性', score: 0, color: '#bfbfbf', color_name: '灰色', order: 4, description: '客人提到该维度但未表达明显倾向' },
                { key: 'mild_negative', name: '弱差评', score: -2, color: '#ffc069', color_name: '浅红', order: 3, description: '客人提及且倾向负面，但表述轻微' },
                { key: 'negative', name: '差评', score: -5, color: '#ff9c6e', color_name: '红色', order: 2, description: '客人明确表达不满，指出具体问题' },
                { key: 'strong_negative', name: '强差评', score: -10, color: '#ff4d4f', color_name: '深红', order: 1, description: '客人强烈不满或愤怒，涉及严重体验损害' }
            ];
            let arr;
            if (level === 5) {
                // 5级：强好评/好评/中性/差评/强差评
                arr = full.filter(r => ['strong_positive','positive','neutral','negative','strong_negative'].includes(r.key));
            } else if (level === 7) {
                arr = full;
            } else if (level === 9) {
                // 9级：在7级基础上增加 极好评(+15) 和 极差评(-15)
                arr = [
                    { key: 'extreme_positive', name: '极好评', score: 15, color: '#389e0d', color_name: '暗深绿', order: 9, description: '客人极度赞赏，几乎找不出缺点' },
                    ...full,
                    { key: 'extreme_negative', name: '极差评', score: -15, color: '#cf1322', color_name: '暗深红', order: 0, description: '客人极度愤怒，扬言投诉或曝光' }
                ];
            }
            return arr.map(r => ({ ...r, id: Utils.uuid() }));
        },

        // ===== 模板 =====
        previewTemplate() {
            this.refreshCriteria();
            this.previewDialog = true;
        },
        copyTemplate() {
            navigator.clipboard.writeText(this.criteriaText).then(() => {
                this.$message.success('已复制到剪贴板');
            }).catch(() => {
                this.$message.warning('复制失败，请手动选择文本复制');
            });
        },

        // ===== 来源 =====
        openSourceDialog(row) {
            if (row) {
                this.sourceForm = Utils.deepClone(row);
            } else {
                this.sourceForm = { id: '', key: '', name: '' };
            }
            this.sourceDialog = true;
        },
        saveSource() {
            if (!this.sourceForm.name || !this.sourceForm.key) {
                this.$message.warning('来源名称和标识必填');
                return;
            }
            if (this.sourceForm.id) {
                const idx = this.sources.findIndex(s => s.id === this.sourceForm.id);
                if (idx >= 0) this.sources[idx] = Utils.deepClone(this.sourceForm);
            } else {
                this.sourceForm.id = Utils.uuid();
                this.sources.push(Utils.deepClone(this.sourceForm));
            }
            this.saveAllSources();
            this.sourceDialog = false;
            this.$message.success('保存成功');
        },
        deleteSource(idx) {
            this.$confirm('确认删除该来源？', '提示', { type: 'warning' }).then(() => {
                this.sources.splice(idx, 1);
                this.saveAllSources();
                this.$message.success('已删除');
            }).catch(() => {});
        }
    }
});
