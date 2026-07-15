/**
 * 智页AI - 代码生成与API合规校验模块
 */

class CodeGenerator {
  constructor(knowledgeGraph, aiClient) {
    this.kg = knowledgeGraph;
    this.ai = aiClient;
  }

  /**
   * 根据自然语言描述生成代码
   */
  async generateCode(description, options = {}) {
    const language = options.language || 'lua';
    const domain = options.domain || 'general';

    // 检索相关API和代码示例
    const apiNodes = this.kg.nodesArray().filter(n => n.type === 'api');
    const codeNodes = this.kg.nodesArray().filter(n => n.type === 'code');

    let context = '';
    if (apiNodes.length) {
      context += '【可用API】\n' + apiNodes.slice(0, 15).map(n => {
        return `- ${n.label}${n.meta.params ? `(${n.meta.params})` : ''}`;
      }).join('\n') + '\n\n';
    }
    if (codeNodes.length) {
      context += '【参考代码】\n' + codeNodes.slice(0, 3).map(n => {
        return `\`\`\`${n.meta.language || ''}\n${n.meta.code?.substring(0, 600) || ''}\n\`\`\``;
      }).join('\n\n') + '\n\n';
    }

    const systemPrompt = `你是${domain === 'minworld' ? '迷你世界' : ''}开发专家。根据用户需求和提供的API文档生成可直接运行的${language}代码。
规则：
1. 只使用文档中提供的API，不编造函数
2. 代码必须完整可运行，包含必要的变量定义
3. 添加中文注释说明关键逻辑
4. 处理常见边界情况`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `API文档信息：\n${context}\n\n需求：${description}\n\n请生成${language}代码：` }
    ];

    return this.ai.chat(messages, { temperature: 0.2, ...options });
  }

  /**
   * API合规校验：检查用户代码是否使用了正确的API
   */
  async validateCode(userCode, options = {}) {
    const language = options.language || 'lua';

    // 提取用户代码中的API调用
    const userApis = ZhiYeUtils.extractAPIInfo(userCode);
    const docApis = this.kg.nodesArray().filter(n => n.type === 'api');

    const validationResult = {
      valid: true,
      issues: [],
      suggestions: [],
      usedApis: [],
      unknownApis: []
    };

    for (const ua of userApis) {
      const matched = docApis.find(da => da.label === ua.name || da.label.endsWith('.' + ua.name));
      if (matched) {
        validationResult.usedApis.push({
          name: ua.name,
          params: ua.params,
          docParams: matched.meta.params,
          matched: true
        });
        // 参数校验
        if (matched.meta.params && ua.params) {
          const expectedCount = matched.meta.params.split(',').filter(p => p.trim()).length;
          const actualCount = ua.params.split(',').filter(p => p.trim()).length;
          if (expectedCount !== actualCount) {
            validationResult.valid = false;
            validationResult.issues.push({
              type: 'param_mismatch',
              api: ua.name,
              message: `参数数量不匹配：期望${expectedCount}个，实际${actualCount}个`,
              expected: matched.meta.params,
              actual: ua.params
            });
          }
        }
      } else {
        validationResult.unknownApis.push(ua.name);
        validationResult.valid = false;
        validationResult.issues.push({
          type: 'unknown_api',
          api: ua.name,
          message: `未在文档中找到API: ${ua.name}`
        });
      }
    }

    // 如果配置了AI校验，进一步用LLM分析
    if (options.aiCheck && this.ai) {
      const docContext = docApis.slice(0, 20).map(a => `- ${a.label}(${a.meta.params || ''})`).join('\n');
      const messages = [
        { role: 'system', content: '你是代码审查专家。检查以下代码是否符合API文档规范，指出潜在问题。' },
        { role: 'user', content: `API文档：\n${docContext}\n\n用户代码：\n\`\`\`${language}\n${userCode}\n\`\`\`\n\n请分析代码的API使用合规性，列出问题和建议（JSON格式）：` }
      ];
      try {
        const aiResult = await this.ai.chat(messages, { temperature: 0.1, maxTokens: 2000 });
        validationResult.aiAnalysis = aiResult;
      } catch (e) {
        validationResult.aiAnalysis = `AI分析失败: ${e.message}`;
      }
    }

    return validationResult;
  }

  /**
   * 代码补全：根据上下文和API文档补全代码
   */
  async completeCode(partialCode, options = {}) {
    const language = options.language || 'lua';
    const cursorContext = partialCode.substring(Math.max(0, partialCode.length - 500));

    const apiNodes = this.kg.nodesArray().filter(n => n.type === 'api');
    const relevantApis = apiNodes.filter(a => cursorContext.includes(a.label.split('.')[0]));

    const context = relevantApis.slice(0, 10).map(a => `- ${a.label}(${a.meta.params || ''})`).join('\n');

    const messages = [
      { role: 'system', content: `你是${language}代码补全助手。根据API文档补全代码。只输出补全部分，不要重复已有代码。` },
      { role: 'user', content: `可用API：\n${context}\n\n当前代码：\n\`\`\`${language}\n${partialCode}\n\`\`\`\n\n请从光标位置继续补全代码：` }
    ];

    return this.ai.chat(messages, { temperature: 0.2, ...options });
  }

  /**
   * 格式化校验结果为人类可读文本
   */
  formatValidationResult(result) {
    if (result.valid && result.issues.length === 0) {
      return '代码校验通过！所有API调用均符合文档规范。';
    }
    let text = `代码校验结果：${result.valid ? '通过' : '未通过'}\n\n`;
    if (result.issues.length) {
      text += '【问题】\n' + result.issues.map((issue, i) => `${i + 1}. [${issue.type}] ${issue.message}`).join('\n') + '\n\n';
    }
    if (result.suggestions.length) {
      text += '【建议】\n' + result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n\n';
    }
    if (result.unknownApis.length) {
      text += `【未知API】${result.unknownApis.join(', ')}\n`;
    }
    if (result.aiAnalysis) {
      text += `\n【AI深度分析】\n${result.aiAnalysis}`;
    }
    return text;
  }
}

// 全局导出
if (typeof window !== 'undefined') window.CodeGenerator = CodeGenerator;
if (typeof module !== 'undefined') module.exports = CodeGenerator;