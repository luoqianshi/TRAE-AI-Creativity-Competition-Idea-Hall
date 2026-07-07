/* AI 模型配置页逻辑 */
bootstrapSubPage({
    el: '#app',
    data: {
        models: [],
        strategy: Store.get('call_strategy', DEFAULT_STRATEGY),

        dialog: false,
        form: {},

        keyDialog: false,
        keyForm: { key: '', name: '', api_key: '' },

        testing: false
    },
    created() {
        this.loadModels();
    },
    methods: {
        async loadModels() {
            const resp = await API.loadProxyConfig();
            if (resp.success) {
                this.models = resp.data.models || [];
            } else {
                // 代理未启动时，显示本地默认配置
                this.models = Utils.deepClone(DEFAULT_MODELS_FOR_DISPLAY);
                this.$message.warning('代理服务未启动，无法读取模型配置');
            }
        },
        openDialog(row) {
            if (row) {
                this.form = { ...row, api_key: '' };
                if (row.id) this.form.id = row.id;
            } else {
                this.form = {
                    id: '', key: '', name: '', api_url: '', model: '',
                    api_key: '', max_tokens: 2048, temperature: 0.1,
                    timeout: 30, enabled: true, remark: ''
                };
            }
            this.dialog = true;
        },
        async saveModel() {
            if (!this.form.name || !this.form.key || !this.form.api_url) {
                this.$message.warning('名称、标识、API 地址必填');
                return;
            }
            // 确保是新增还是更新
            const exists = this.models.find(m => m.key === this.form.key);
            let newModels;
            if (exists) {
                newModels = this.models.map(m => m.key === this.form.key ? Utils.deepClone(this.form) : m);
            } else {
                newModels = [...this.models, Utils.deepClone(this.form)];
            }
            // 不把 has_api_key 字段提交
            newModels = newModels.map(m => {
                const { has_api_key, ...rest } = m;
                return rest;
            });
            const resp = await API.saveProxyConfig({ models: newModels });
            if (resp.success) {
                this.$message.success('保存成功');
                this.dialog = false;
                this.loadModels();
                Logger.log('配置变更', `保存模型配置：${this.form.name}`);
            } else {
                this.$message.error(resp.message || '保存失败');
            }
        },
        async deleteModel(idx) {
            this.$confirm('确认删除该模型配置？', '提示', { type: 'warning' }).then(async () => {
                const target = this.models[idx];
                const newModels = this.models.filter((_, i) => i !== idx).map(m => {
                    const { has_api_key, ...rest } = m;
                    return rest;
                });
                const resp = await API.saveProxyConfig({ models: newModels });
                if (resp.success) {
                    this.$message.success('已删除');
                    this.loadModels();
                    Logger.log('配置变更', `删除模型配置：${target.name}`);
                }
            }).catch(() => {});
        },
        setApiKey(row) {
            this.keyForm = { key: row.key, name: row.name, api_key: '' };
            this.keyDialog = true;
        },
        async saveApiKey() {
            if (!this.keyForm.api_key) {
                this.$message.warning('请输入 API Key');
                return;
            }
            const resp = await API.setApiKey(this.keyForm.key, this.keyForm.api_key);
            if (resp.success) {
                this.$message.success('API Key 已保存');
                this.keyDialog = false;
                this.loadModels();
            } else {
                this.$message.error(resp.message || '保存失败');
            }
        },
        async testConn(row) {
            this.testing = true;
            try {
                const resp = await API.testConnection(row.key);
                if (resp.success) {
                    this.$message.success(`「${row.name}」连接成功`);
                } else {
                    this.$message.error(`「${row.name}」连接失败：${resp.message}`);
                }
            } finally {
                this.testing = false;
            }
        },
        saveStrategy() {
            Store.set('call_strategy', this.strategy);
            this.$message.success('策略已保存');
            Logger.log('配置变更', '更新调用策略');
        }
    }
});

// 代理未启动时的展示用默认模型（不含 Key）
const DEFAULT_MODELS_FOR_DISPLAY = [
    { key: 'deepseek', name: 'DeepSeek', api_url: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat', max_tokens: 2048, temperature: 0.1, timeout: 30, enabled: true, has_api_key: false, remark: '默认主模型' },
    { key: 'qwen', name: '通义千问', api_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', model: 'qwen-plus', max_tokens: 2048, temperature: 0.1, timeout: 30, enabled: false, has_api_key: false, remark: '阿里云通义千问' },
    { key: 'glm', name: '智谱GLM', api_url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash', max_tokens: 2048, temperature: 0.1, timeout: 30, enabled: false, has_api_key: false, remark: '智谱GLM-4-Flash' },
    { key: 'kimi', name: 'Kimi', api_url: 'https://api.moonshot.cn/v1/chat/completions', model: 'moonshot-v1-8k', max_tokens: 2048, temperature: 0.1, timeout: 30, enabled: false, has_api_key: false, remark: '月之暗面Kimi' },
    { key: 'spark', name: '讯飞星火', api_url: 'https://spark-api-open.xf-yun.com/v1/chat/completions', model: 'generalv3.5', max_tokens: 2048, temperature: 0.1, timeout: 30, enabled: false, has_api_key: false, remark: '讯飞星火V3.5' }
];
