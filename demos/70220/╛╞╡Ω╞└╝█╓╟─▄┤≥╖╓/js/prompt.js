/* Prompt 模板配置逻辑 */
bootstrapSubPage({
    el: '#app',
    data: {
        prompts: [],
        selectedKey: '',
        current: null,
        dialog: false,
        form: {},
        previewDialog: false,
        previewTab: 'system',
        previewUserPrompt: ''
    },
    created() {
        this.loadData();
    },
    methods: {
        loadData() {
            this.prompts = Store.get('config_prompts', DEFAULT_PROMPTS);
            if (this.prompts.length > 0) {
                const def = this.prompts.find(p => p.is_default) || this.prompts[0];
                this.current = Utils.deepClone(def);
                this.selectedKey = def.id;
            }
        },
        selectPrompt(id) {
            const p = this.prompts.find(x => x.id === id);
            if (p) this.current = Utils.deepClone(p);
        },
        openDialog(row) {
            if (row) {
                this.form = Utils.deepClone(row);
            } else {
                this.form = {
                    id: '', name: '', description: '',
                    system_prompt: '你是一位专业的酒店服务质量评估专家。',
                    user_prompt: '请根据以下评分标准对评价进行分析：\n\n{{scoring_criteria}}\n\n【评价内容】\n{{review_content}}',
                    output_format: 'JSON',
                    is_default: false
                };
            }
            this.dialog = true;
        },
        savePrompt() {
            if (!this.form.name) {
                this.$message.warning('模板名称必填');
                return;
            }
            if (this.form.id) {
                const idx = this.prompts.findIndex(p => p.id === this.form.id);
                if (idx >= 0) {
                    // 默认模板的 is_default 字段不能被取消
                    if (this.prompts[idx].is_default) this.form.is_default = true;
                    this.prompts[idx] = Utils.deepClone(this.form);
                }
            } else {
                this.form.id = Utils.uuid();
                this.prompts.push(Utils.deepClone(this.form));
            }
            Store.set('config_prompts', this.prompts);
            this.current = Utils.deepClone(this.form);
            this.selectedKey = this.form.id;
            this.dialog = false;
            this.$message.success('保存成功');
            Logger.log('配置变更', `保存 Prompt 模板：${this.form.name}`);
        },
        deletePrompt(id) {
            this.$confirm('确认删除该模板？', '提示', { type: 'warning' }).then(() => {
                const idx = this.prompts.findIndex(p => p.id === id);
                if (idx >= 0) {
                    this.prompts.splice(idx, 1);
                    Store.set('config_prompts', this.prompts);
                    if (this.current && this.current.id === id) {
                        this.current = this.prompts.length > 0 ? Utils.deepClone(this.prompts[0]) : null;
                    }
                    this.$message.success('已删除');
                }
            }).catch(() => {});
        },
        setDefault(id) {
            this.prompts.forEach(p => p.is_default = (p.id === id));
            Store.set('config_prompts', this.prompts);
            this.$message.success('已设为默认');
        },
        previewFull() {
            if (!this.current) return;
            this.previewUserPrompt = buildFinalPrompt(this.current, '示例评价：房间很大很干净，前台服务态度很好，早餐种类有点少，但整体住得挺舒服。');
            this.previewDialog = true;
        },
        autoGenerate() {
            this.$confirm('将根据当前评分标准自动生成 Prompt 模板，是否继续？', '提示', { type: 'info' }).then(() => {
                const criteria = buildScoringCriteriaText();
                const newPrompt = {
                    id: Utils.uuid(),
                    name: '自动生成模板_' + Utils.formatDate(new Date()),
                    description: '基于当前评分标准自动生成',
                    system_prompt:
                        '你是一位专业的酒店服务质量评估专家。你的任务是分析住客评价内容，根据提供的评分标准，识别评价涉及的服务维度，并给出量化的评分。请严格按照要求的输出格式返回结果。',
                    user_prompt:
`请根据以下评分标准，对这条酒店住客评价进行分析打分：

${criteria}

【待分析评价内容】
{{review_content}}

请以如下 JSON 格式返回结果（仅返回 JSON）：
{
  "overall_sentiment": "strong_positive|positive|mild_positive|neutral|mild_negative|negative|strong_negative",
  "identified_dimensions": [
    {
      "dimension": "维度英文标识",
      "dimension_name": "维度中文名称",
      "rating": "等级英文标识",
      "score": 分值数字,
      "reason": "判定理由",
      "evidence_text": "评价原文片段"
    }
  ],
  "summary": "一句话概括评价核心"
}`,
                    output_format: 'JSON',
                    is_default: false
                };
                this.prompts.push(newPrompt);
                Store.set('config_prompts', this.prompts);
                this.current = Utils.deepClone(newPrompt);
                this.selectedKey = newPrompt.id;
                this.$message.success('已生成新模板');
            }).catch(() => {});
        }
    }
});
