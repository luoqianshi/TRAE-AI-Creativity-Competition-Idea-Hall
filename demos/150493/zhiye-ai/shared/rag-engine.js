/**
 * 智页AI - RAG检索增强生成引擎
 * 基于结构化知识图谱的检索增强
 */

class RAGEngine {
  constructor(knowledgeGraph, aiClient) {
    this.kg = knowledgeGraph;
    this.ai = aiClient;
    this.maxContextTokens = 6000;
  }

  /**
   * 执行知识图谱增强问答
   */
  async ask(question, options = {}) {
    // 1. 知识图谱检索相关子图
    const subgraph = this.kg.querySubgraph(question, options.maxDepth || 2, options.topK || 8);

    // 2. 构建结构化上下文
    const context = this._buildContextFromSubgraph(subgraph, question);

    // 3. 构建系统提示词
    const showThinking = options.showThinking !== false;
    const systemPrompt = this._buildSystemPrompt(options.mode || 'qa', showThinking);

    // 4. 组装消息：system -> 历史上下文 -> 当前问题
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // 插入历史对话上下文（如果有）
    if (options.history && options.history.length > 0) {
      messages.push(...options.history);
    }

    messages.push({
      role: 'user',
      content: `基于以下网页知识库内容回答问题：\n\n${context}\n\n用户问题：${question}`
    });

    // 5. 调用AI
    if (options.stream) {
      return this.ai.chat(messages, { stream: true });
    }
    return this.ai.chat(messages);
  }

  /**
   * 从子图构建结构化上下文文本
   */
  _buildContextFromSubgraph(subgraph, query) {
    const sections = [];

    // 文档元信息
    if (this.kg.docMeta.title) {
      sections.push(`【文档】${this.kg.docMeta.title}\nURL: ${this.kg.docMeta.url || '当前页面'}`);
    }

    // 按类型组织节点
    const byType = {};
    subgraph.nodes.forEach(n => {
      if (!byType[n.type]) byType[n.type] = [];
      byType[n.type].push(n);
    });

    // API节点（最核心）
    if (byType.api?.length) {
      sections.push('【相关API】\n' + byType.api.map(n => {
        const params = n.meta.params ? `参数: ${n.meta.params}` : '';
        return `- ${n.label} ${params}`;
      }).join('\n'));
    }

    // 代码节点
    if (byType.code?.length) {
      sections.push('【代码示例】\n' + byType.code.map(n => {
        const lang = n.meta.language || '';
        return `[${lang}]\n${n.meta.code?.substring(0, 800) || ''}`;
      }).join('\n---\n'));
    }

    // 标题节点
    if (byType.heading?.length) {
      sections.push('【相关章节】\n' + byType.heading.map(n => `${'#'.repeat(n.meta.level || 1)} ${n.label}`).join('\n'));
    }

    // 段落节点
    if (byType.paragraph?.length) {
      sections.push('【相关内容】\n' + byType.paragraph.map(n => n.meta.fullText || n.label).join('\n\n'));
    }

    // 表格节点
    if (byType.table?.length) {
      sections.push('【参数表格】\n' + byType.table.map(n => {
        const headers = n.meta.headers?.join(' | ') || '';
        const rows = n.meta.rows?.map(r => r.join(' | ')).join('\n') || '';
        return `${n.meta.caption || ''}\n${headers}\n${rows}`;
      }).join('\n---\n'));
    }

    // 列表节点
    if (byType.list?.length) {
      sections.push('【要点列表】\n' + byType.list.map(n => n.meta.items?.join('\n') || '').join('\n'));
    }

    // 关联网络
    if (subgraph.edges.length) {
      const keyRelations = subgraph.edges
        .filter(e => e.weight > 0.9)
        .map(e => {
          const s = subgraph.nodes.find(n => n.id === e.source);
          const t = subgraph.nodes.find(n => n.id === e.target);
          if (s && t) return `${s.label} --${e.relation}--> ${t.label}`;
          return null;
        })
        .filter(Boolean)
        .slice(0, 10);
      if (keyRelations.length) {
        sections.push('【知识关联】\n' + keyRelations.join('\n'));
      }
    }

    // 根据查询意图确定内容优先级
    const queryLower = query.toLowerCase();
    const isCodeQuery = /代码|示例|demo|sample|用法|如何使用/i.test(query);
    const isAPIQuery = /api|接口|方法|函数|参数/i.test(query);
    const isConceptQuery = /介绍|概述|什么是|原理|概念/i.test(query);
    const isConfigQuery = /配置|参数|属性|字段|选项/i.test(query);

    // 类型优先级排序（根据查询意图动态调整）
    let typePriority = ['api', 'code', 'table', 'heading', 'paragraph', 'list', 'document'];
    if (isCodeQuery) typePriority = ['code', 'api', 'heading', 'paragraph', 'table', 'list', 'document'];
    if (isAPIQuery) typePriority = ['api', 'table', 'code', 'heading', 'paragraph', 'list', 'document'];
    if (isConceptQuery) typePriority = ['heading', 'paragraph', 'list', 'api', 'code', 'table', 'document'];
    if (isConfigQuery) typePriority = ['table', 'api', 'heading', 'paragraph', 'code', 'list', 'document'];

    // 按优先级重新排列 sections
    const reordered = [];
    for (const type of typePriority) {
      const idx = sections.findIndex(s => s && s.startsWith(`【${this._getTypeLabel(type)}】`));
      if (idx !== -1) {
        reordered.push(sections[idx]);
        sections[idx] = null;
      }
    }
    // 剩余部分（如关联网络）放最后
    sections.filter(Boolean).forEach(s => reordered.push(s));

    let contextText = reordered.join('\n\n');

    // 智能截断：分段截断，优先保留前面的部分（前面是更相关的类型）
    const maxLen = this.maxContextTokens * 2;
    if (contextText.length > maxLen) {
      const sectionTexts = contextText.split('\n\n');
      let truncated = '';
      for (const section of sectionTexts) {
        if ((truncated + section).length > maxLen * 0.85) {
          truncated += '\n\n...[更多内容已截断]';
          break;
        }
        truncated += (truncated ? '\n\n' : '') + section;
      }
      contextText = truncated;
    }

    return contextText;
  }

  _getTypeLabel(type) {
    const labels = { api: '相关API', code: '代码示例', table: '参数表格', heading: '相关章节', paragraph: '相关内容', list: '要点列表', document: '文档', relation: '知识关联' };
    return labels[type] || type;
  }

  /**
   * 构建系统提示词
   */
  _buildSystemPrompt(mode, showThinking = true) {
    const baseRules = `你是智页AI，一个基于结构化知识图谱的网页智能问答助手。你的回答遵循以下规则：
1. 严格基于提供的知识库内容回答，不编造不存在的信息
2. 如果知识库中没有足够信息，明确告知用户
3. 技术文档问答时，优先引用代码示例和API说明
4. 回答简洁准确，优先使用中文
5. 涉及代码时保持原语言格式，确保可运行性`;
    const thinkingRule = showThinking ? '\n6. 回答前先思考，将思考过程放在<thinking>标签中，然后给出最终答案' : '';
    const base = baseRules + thinkingRule;

    const modePrompts = {
      qa: `${base}\n模式：问答模式。请先在<thinking>标签中梳理思路，再给出最终答案，必要时分点说明。`,
      code: `${base}\n模式：代码生成模式。只输出代码，附带简要注释，不要多余解释。`,
      explain: `${base}\n模式：解释模式。用通俗易懂的语言解释概念，适合新手理解。`,
      summary: `${base}\n模式：总结模式。提炼核心要点，用结构化方式呈现。`,
      api_check: `${base}\n模式：API校验模式。检查代码中的API调用是否符合文档规范，指出问题并给出修正建议。`
    };

    return modePrompts[mode] || modePrompts.qa;
  }

  /**
   * 快速检索（不调用AI）
   */
  search(query, topK = 5) {
    const subgraph = this.kg.querySubgraph(query, 1, topK);
    return subgraph.nodes.map(n => ({
      type: n.type,
      label: n.label,
      content: n.meta.fullText || n.meta.code || n.meta.items?.join('\n') || n.label,
      meta: n.meta
    }));
  }

  /**
   * 多轮对话（保留上下文）
   */
  async chat(messages, options = {}) {
    const lastQuestion = messages[messages.length - 1].content;
    const subgraph = this.kg.querySubgraph(lastQuestion, options.maxDepth || 2, options.topK || 6);
    const context = this._buildContextFromSubgraph(subgraph, lastQuestion);

    const systemPrompt = this._buildSystemPrompt(options.mode || 'qa');
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: `当前页面知识库：\n${context}` },
      ...messages
    ];

    if (options.stream) {
      return this.ai.chat(fullMessages, { stream: true });
    }
    return this.ai.chat(fullMessages);
  }
}

// 全局导出
if (typeof window !== 'undefined') window.RAGEngine = RAGEngine;
if (typeof module !== 'undefined') module.exports = RAGEngine;