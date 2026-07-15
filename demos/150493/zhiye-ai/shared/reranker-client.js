/**
 * 智页AI - 重排模型客户端模块
 * 支持多Rerank服务：Cohere Rerank、自定义API（兼容OpenAI格式或自定义格式）
 */

class RerankerClient {
  /**
   * 构造函数
   * @param {Object} config - 配置对象
   * @param {string} config.apiKey - API密钥
   * @param {string} config.baseUrl - 基础URL，Cohere默认 https://api.cohere.com/v1
   * @param {string} config.model - 模型名称，Cohere默认 rerank-english-v3.0
   * @param {number} config.timeout - 请求超时时间（毫秒），默认30000
   * @param {string} config.provider - 提供商类型，可选 'cohere' | 'custom' | 'openai'，默认 'cohere'
   * @param {number} config.topN - 返回Top N结果，默认返回全部
   */
  constructor(config = {}) {
    this.provider = config.provider || 'cohere';
    this.apiKey = config.apiKey || '';
    this.baseUrl = config.baseUrl || '';
    this.model = config.model || 'rerank-english-v3.0';
    this.timeout = config.timeout || 30000;
    this.topN = config.topN || null;
  }

  /**
   * 带超时的fetch
   * @param {string} url - 请求地址
   * @param {Object} options - fetch选项
   * @returns {Promise<Response>}
   */
  async _fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);
    try {
      const resp = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return resp;
    } catch (err) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error('Rerank请求超时，请检查网络连接或API地址是否正确');
      }
      throw err;
    }
  }

  /**
   * 对候选文档进行重排
   * @param {string} query - 查询语句
   * @param {string[]} documents - 候选文档列表
   * @returns {Promise<{index: number, score: number, text: string}[]>} - 按score降序排列的结果
   */
  async rerank(query, documents) {
    if (!query || typeof query !== 'string') {
      throw new Error('rerank的query参数必须是有效字符串');
    }
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new Error('rerank的documents参数必须是非空字符串数组');
    }

    // 过滤空文档，但保留原始索引用于映射
    const validDocs = documents
      .map((text, index) => ({ text: String(text), originalIndex: index }))
      .filter(item => item.text.trim().length > 0);

    if (validDocs.length === 0) {
      throw new Error('所有候选文档均为空');
    }

    switch (this.provider) {
      case 'cohere':
        return this._callCohereRerank(query, validDocs, documents);
      case 'openai':
        return this._callOpenAIRerank(query, validDocs, documents);
      case 'custom':
        return this._callCustomRerank(query, validDocs, documents);
      default:
        throw new Error(`不支持的Rerank提供商: ${this.provider}`);
    }
  }

  /**
   * 调用Cohere Rerank API
   * @param {string} query - 查询语句
   * @param {{text: string, originalIndex: number}[]} validDocs - 有效文档列表
   * @param {string[]} originalDocuments - 原始文档列表（用于映射文本）
   * @returns {Promise<{index: number, score: number, text: string}[]>}
   * @private
   */
  async _callCohereRerank(query, validDocs, originalDocuments) {
    const baseUrl = this.baseUrl || 'https://api.cohere.com/v1';
    const endpoint = baseUrl.endsWith('/rerank') ? baseUrl : `${baseUrl}/rerank`;
    const body = {
      model: this.model,
      query,
      documents: validDocs.map(d => d.text)
    };
    if (this.topN && this.topN > 0) {
      body.top_n = this.topN;
    }

    const resp = await this._fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Cohere Rerank API错误: ${resp.status} ${errText}`);
    }

    const data = await resp.json();
    // Cohere格式: results[].{index, relevance_score}
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Cohere Rerank API返回数据格式异常');
    }

    return data.results
      .map(item => {
        const docIndex = item.index;
        const originalIndex = validDocs[docIndex]?.originalIndex ?? docIndex;
        return {
          index: originalIndex,
          score: item.relevance_score ?? 0,
          text: originalDocuments[originalIndex]
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * 调用兼容OpenAI格式的Rerank API
   * @param {string} query - 查询语句
   * @param {{text: string, originalIndex: number}[]} validDocs - 有效文档列表
   * @param {string[]} originalDocuments - 原始文档列表（用于映射文本）
   * @returns {Promise<{index: number, score: number, text: string}[]>}
   * @private
   */
  async _callOpenAIRerank(query, validDocs, originalDocuments) {
    const baseUrl = this.baseUrl || 'https://api.openai.com/v1';
    const endpoint = baseUrl.endsWith('/rerank') ? baseUrl : `${baseUrl}/rerank`;
    const resp = await this._fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        query,
        documents: validDocs.map(d => d.text),
        top_n: this.topN || validDocs.length
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenAI Rerank API错误: ${resp.status} ${errText}`);
    }

    const data = await resp.json();
    // 兼容OpenAI格式: results[].{index, relevance_score}
    const results = data.results || data.data || [];
    if (!Array.isArray(results)) {
      throw new Error('OpenAI Rerank API返回数据格式异常');
    }

    return results
      .map(item => {
        const docIndex = item.index ?? 0;
        const originalIndex = validDocs[docIndex]?.originalIndex ?? docIndex;
        return {
          index: originalIndex,
          score: item.relevance_score ?? item.score ?? 0,
          text: originalDocuments[originalIndex]
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * 调用自定义Rerank API
   * 支持两种自定义格式：
   *   1. 兼容OpenAI格式（/rerank，返回results[].{index, relevance_score}）
   *   2. 自定义格式（POST {query, documents}，返回[{index, score}]）
   * @param {string} query - 查询语句
   * @param {{text: string, originalIndex: number}[]} validDocs - 有效文档列表
   * @param {string[]} originalDocuments - 原始文档列表（用于映射文本）
   * @returns {Promise<{index: number, score: number, text: string}[]>}
   * @private
   */
  async _callCustomRerank(query, validDocs, originalDocuments) {
    const baseUrl = this.baseUrl;
    if (!baseUrl) {
      throw new Error('自定义Rerank API需要配置baseUrl');
    }

    // 智能判断：如果baseUrl已包含/rerank结尾，不再拼接
    const endpoint = baseUrl.endsWith('/rerank') ? baseUrl : `${baseUrl}/rerank`;

    const resp = await this._fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        query,
        documents: validDocs.map(d => d.text)
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`自定义Rerank API错误: ${resp.status} ${errText}`);
    }

    const data = await resp.json();
    // 尝试兼容多种返回格式
    const results = data.results || data.data || (Array.isArray(data) ? data : []);
    if (!Array.isArray(results)) {
      throw new Error('自定义Rerank API返回数据格式异常');
    }

    return results
      .map(item => {
        const docIndex = item.index ?? 0;
        const originalIndex = validDocs[docIndex]?.originalIndex ?? docIndex;
        return {
          index: originalIndex,
          score: item.relevance_score ?? item.score ?? 0,
          text: originalDocuments[originalIndex]
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * 从chrome.storage读取配置并创建实例
   * @returns {Promise<RerankerClient>}
   */
  static async fromStorage() {
    const data = await ZhiYeUtils.storageGet('zhiye_reranker_config');
    const cfg = data?.zhiye_reranker_config || {};
    return new RerankerClient({
      provider: cfg.provider || 'cohere',
      apiKey: cfg.apiKey || '',
      baseUrl: cfg.baseUrl || '',
      model: cfg.model || 'rerank-english-v3.0',
      timeout: cfg.timeout || 30000,
      topN: cfg.topN || null
    });
  }

  /**
   * 测试Rerank连接
   * @returns {Promise<{success: boolean, topScore: number|null, error: string|null}>}
   */
  async testConnection() {
    try {
      const query = 'test query';
      const documents = ['This is a test document for reranking.', 'Another document.'];
      const results = await this.rerank(query, documents);
      return {
        success: true,
        topScore: results.length > 0 ? results[0].score : null,
        error: null
      };
    } catch (err) {
      return {
        success: false,
        topScore: null,
        error: err.message
      };
    }
  }
}

// 全局导出（浏览器环境）
if (typeof window !== 'undefined') window.RerankerClient = RerankerClient;
if (typeof module !== 'undefined') module.exports = RerankerClient;
