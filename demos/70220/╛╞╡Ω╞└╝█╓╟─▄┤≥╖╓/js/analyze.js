/* 评价测试分析逻辑（单条 + 批量） */
bootstrapSubPage({
    el: '#app',
    data: {
        activeTab: 'single',
        sources: [],
        models: [],
        prompts: [],
        ratings: [],

        // 单条
        form: {
            source: '', order_no: '', review_time: '',
            content: '', model_key: '', prompt_id: ''
        },
        analyzing: false,
        result: null,

        // 维度修正
        editDimDialog: false,
        editDimForm: {},
        editDimIndex: -1,

        showRawDialog: false,

        // 批量
        batchList: [],
        batchModelKey: '',
        batchPromptId: '',
        batchRunning: false,
        batchStopFlag: false
    },
    computed: {
        totalScore() {
            if (!this.result || !this.result.parsed || !this.result.parsed.identified_dimensions) return 0;
            return this.result.parsed.identified_dimensions.reduce((s, d) => s + (Number(d.score) || 0), 0);
        },
        batchStats() {
            const done = this.batchList.filter(x => x.status === 'done').length;
            const fail = this.batchList.filter(x => x.status === 'fail').length;
            return { done, fail };
        },
        batchProgress() {
            if (this.batchList.length === 0) return 0;
            const finished = this.batchList.filter(x => x.status === 'done' || x.status === 'fail').length;
            return Math.round(finished * 100 / this.batchList.length);
        }
    },
    created() {
        this.sources = Store.get('config_sources', DEFAULT_SOURCES);
        this.prompts = Store.get('config_prompts', DEFAULT_PROMPTS);
        this.ratings = Store.get('config_ratings', DEFAULT_RATINGS);
        // 默认选择
        const defPrompt = this.prompts.find(p => p.is_default) || this.prompts[0];
        if (defPrompt) this.form.prompt_id = defPrompt.id;
        this.batchPromptId = defPrompt ? defPrompt.id : '';
        this.loadModels();
    },
    methods: {
        Utils,
        sentimentLabel,
        sentimentColor,
        calcTotal(parsed) {
            if (!parsed || !parsed.identified_dimensions) return 0;
            return parsed.identified_dimensions.reduce((s, d) => s + (Number(d.score) || 0), 0);
        },
        async loadModels() {
            const resp = await API.loadProxyConfig();
            if (resp.success) {
                this.models = resp.data.models || [];
                const usable = this.models.find(m => m.enabled && m.has_api_key);
                if (usable) {
                    this.form.model_key = usable.key;
                    this.batchModelKey = usable.key;
                } else {
                    const firstEnabled = this.models.find(m => m.enabled);
                    if (firstEnabled) {
                        this.form.model_key = firstEnabled.key;
                        this.batchModelKey = firstEnabled.key;
                    }
                }
            } else if (!resp._suppressed) {
                this.$message.warning('代理服务未启动，请先启动 node proxy/proxy.js');
            }
        },
        fillExample() {
            this.form.content = '这家酒店真的太棒了！房间很大很干净，床特别舒服，空调温度也合适。前台小姐姐热情周到，办理入住很快。早餐种类有点少，希望能丰富一些。位置非常好，出门就是地铁站，去景点也方便。整体住得很满意，下次还会再来！';
            this.form.source = 'ctrip';
            this.form.order_no = 'ORD' + Date.now();
            this.form.review_time = Utils.formatTime(new Date());
        },
        clearForm() {
            this.form.content = '';
            this.form.order_no = '';
            this.result = null;
        },
        async analyze() {
            if (!this.form.content || !this.form.content.trim()) {
                this.$message.warning('请输入评价内容');
                return;
            }
            if (!this.form.model_key) {
                this.$message.warning('请选择模型');
                return;
            }
            if (!this.form.prompt_id) {
                this.$message.warning('请选择 Prompt 模板');
                return;
            }
            this.analyzing = true;
            this.result = null;
            try {
                const promptTpl = this.prompts.find(p => p.id === this.form.prompt_id);
                const resp = await API.analyze(
                    this.form.model_key,
                    promptTpl.system_prompt,
                    promptTpl.user_prompt,
                    this.form.content
                );
                this.result = resp.data || resp;
                if (resp.success) {
                    this.$message.success('分析完成');
                    Logger.log('评分分析', `单条分析：${Utils.truncate(this.form.content, 50)}`);
                } else {
                    this.$message.error(resp.message || '分析失败');
                }
            } finally {
                this.analyzing = false;
            }
        },
        saveResult() {
            if (!this.result || !this.result.parsed) {
                this.$message.warning('无可保存的结果');
                return;
            }
            const reviews = Store.get('reviews_data', []);
            const record = {
                id: Utils.uuid(),
                content: this.form.content,
                source: this.form.source,
                order_no: this.form.order_no,
                review_time: this.form.review_time || Utils.formatTime(new Date()),
                analysis_status: '已完成',
                ai_raw_response: this.result.raw,
                overall_sentiment: this.result.parsed.overall_sentiment,
                total_score: this.totalScore,
                summary: this.result.parsed.summary,
                model: this.result.model,
                elapsed_ms: this.result.elapsed_ms,
                dimensions: (this.result.parsed.identified_dimensions || []).map(d => ({
                    dimension: d.dimension,
                    dimension_name: d.dimension_name,
                    rating: d.rating,
                    score: d.score,
                    reason: d.reason,
                    evidence_text: d.evidence_text,
                    is_manually_adjusted: false,
                    original_ai_score: d.score
                })),
                created_at: Utils.formatTime(new Date()),
                updated_at: Utils.formatTime(new Date())
            };
            reviews.unshift(record);
            Store.set('reviews_data', reviews);
            API.syncReviewsToServer();
            Logger.log('保存评分', `保存评价评分结果：${record.id}`);
            this.$message.success('已保存到评价明细');
        },
        editDimScore(idx) {
            const dim = this.result.parsed.identified_dimensions[idx];
            this.editDimForm = Utils.deepClone(dim);
            this.editDimIndex = idx;
            this.editDimDialog = true;
        },
        saveDimEdit() {
            this.result.parsed.identified_dimensions[this.editDimIndex] = Utils.deepClone(this.editDimForm);
            // 重算总分
            this.result.parsed.identified_dimensions[this.editDimIndex].is_manually_adjusted = true;
            this.editDimDialog = false;
            this.$message.success('已修正');
        },

        // ===== 批量 =====
        importBatchFile(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                let rows = [];
                if (file.name.toLowerCase().endsWith('.json')) {
                    try {
                        const parsed = JSON.parse(text);
                        rows = Array.isArray(parsed) ? parsed : [parsed];
                    } catch (err) {
                        this.$message.error('JSON 解析失败');
                        return false;
                    }
                } else {
                    rows = Utils.csvToJSON(text);
                }
                this.batchList = rows.map(r => ({
                    id: Utils.uuid(),
                    content: r['评价内容'] || r.content || r['content'] || '',
                    source: r['评价来源'] || r.source || r['source'] || '',
                    order_no: r['订单号'] || r.order_no || r['order_no'] || '',
                    review_time: r['评价时间'] || r.review_time || r['review_time'] || '',
                    status: 'pending',
                    result: null,
                    error: ''
                })).filter(x => x.content);
                this.$message.success(`已导入 ${this.batchList.length} 条评价`);
                Logger.log('批量导入', `导入 ${this.batchList.length} 条评价`);
            };
            reader.readAsText(file, 'utf-8');
            return false;
        },
        downloadTemplate() {
            const example = [
                { '评价内容': '房间很干净，前台服务态度很好', '评价来源': '携程', '订单号': 'ORD001', '评价时间': '2024-01-15' },
                { '评价内容': '早餐种类太少了，房间空调不制冷', '评价来源': '美团', '订单号': 'ORD002', '评价时间': '2024-01-16' }
            ];
            Utils.exportCSV(example, 'batch_import_template.csv');
        },
        async runBatch() {
            if (!this.batchModelKey) { this.$message.warning('请选择模型'); return; }
            if (!this.batchPromptId) { this.$message.warning('请选择 Prompt 模板'); return; }

            this.batchRunning = true;
            this.batchStopFlag = false;
            const promptTpl = this.prompts.find(p => p.id === this.batchPromptId);
            const strategy = Store.get('call_strategy', DEFAULT_STRATEGY);
            const concurrency = strategy.concurrency || 5;

            // 待处理队列
            const queue = this.batchList.filter(x => x.status === 'pending' || x.status === 'fail');
            const runItem = async (item) => {
                if (this.batchStopFlag) return;
                item.status = 'running';
                try {
                    const resp = await API.analyze(
                        this.batchModelKey,
                        promptTpl.system_prompt,
                        promptTpl.user_prompt,
                        item.content
                    );
                    if (resp.success && resp.data && resp.data.parsed) {
                        item.result = resp.data;
                        item.status = 'done';
                        item.error = '';
                    } else {
                        item.status = 'fail';
                        item.error = resp.message || '解析失败';
                    }
                } catch (e) {
                    item.status = 'fail';
                    item.error = e.message;
                }
            };

            // 简易并发控制
            for (let i = 0; i < queue.length; i += concurrency) {
                if (this.batchStopFlag) break;
                const batch = queue.slice(i, i + concurrency);
                await Promise.all(batch.map(runItem));
            }

            this.batchRunning = false;
            // 自动保存成功的到评价明细
            this.saveBatchToReviews();
            if (this.batchStopFlag) {
                this.$message.info('已停止');
            } else {
                this.$message.success('批量分析完成');
            }
        },
        stopBatch() {
            this.batchStopFlag = true;
        },
        retryFailed() {
            this.batchList.forEach(x => {
                if (x.status === 'fail') x.status = 'pending';
            });
            this.$message.success('已加入重试队列');
        },
        saveBatchToReviews() {
            const reviews = Store.get('reviews_data', []);
            const done = this.batchList.filter(x => x.status === 'done' && x.result && x.result.parsed);
            done.forEach(item => {
                const total = this.calcTotal(item.result.parsed);
                const record = {
                    id: Utils.uuid(),
                    content: item.content,
                    source: item.source,
                    order_no: item.order_no,
                    review_time: item.review_time || Utils.formatTime(new Date()),
                    analysis_status: '已完成',
                    ai_raw_response: item.result.raw,
                    overall_sentiment: item.result.parsed.overall_sentiment,
                    total_score: total,
                    summary: item.result.parsed.summary,
                    model: item.result.model,
                    elapsed_ms: item.result.elapsed_ms,
                    dimensions: (item.result.parsed.identified_dimensions || []).map(d => ({
                        dimension: d.dimension,
                        dimension_name: d.dimension_name,
                        rating: d.rating,
                        score: d.score,
                        reason: d.reason,
                        evidence_text: d.evidence_text,
                        is_manually_adjusted: false,
                        original_ai_score: d.score
                    })),
                    created_at: Utils.formatTime(new Date()),
                    updated_at: Utils.formatTime(new Date())
                };
                reviews.unshift(record);
            });
            Store.set('reviews_data', reviews);
            API.syncReviewsToServer();
            if (done.length > 0) {
                Logger.log('批量保存', `批量保存 ${done.length} 条评分结果`);
            }
        },
        exportBatch() {
            const rows = this.batchList.map((item, i) => ({
                '序号': i + 1,
                '评价内容': item.content,
                '来源': item.source,
                '订单号': item.order_no,
                '状态': item.status,
                '总分': item.result && item.result.parsed ? this.calcTotal(item.result.parsed) : '',
                '失败原因': item.error || ''
            }));
            Utils.exportCSV(rows, 'batch_result_' + Utils.formatDate(new Date()) + '.csv');
        }
    }
});
