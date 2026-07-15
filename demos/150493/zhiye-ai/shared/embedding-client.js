/**
 * 智页AI - Embedding客户端模块
 * 支持多Embedding服务：OpenAI、自定义API（兼容OpenAI格式）
 */

class EmbeddingClient {
  /**
   * 构造函数
   * @param {Object} config - 配置对象
   * @param {string} config.apiKey - API密钥
   * @param {string} config.baseUrl - 基础URL，OpenAI默认 https://api.openai.com/v1
   * @param {string} config.model - 模型名称，默认 text-embedding-3-small
   * @param {number} config.dimensions - 向量维度，默认1536
   * @param {number} config.timeout - 请求超时时间（毫秒），默认30000
   * @param {string} config.provider - 提供商类型，可选 'openai' | 'custom'，默认 'openai'
   */
  constructor(config = {}) {
    this.provider = config.provider || 'openai';
    this.apiKey = config.apiKey || '';
    this.baseUrl = config.baseUrl || '';
    this.model = config.model || 'text-embedding-3-small';
    this.dimensions = config.dimensions || null;
    this.timeout = config.timeout || 30000;
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
        throw new Error('Embedding请求超时，请检查网络连接或API地址是否正确');
      }
      throw err;
    }
  }

  /**
   * 单文本向量化
   * @param {string} text - 待向量化的文本
   * @returns {Promise<Float32Array>} - 向量结果
   */
  async embed(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('embed参数必须是有效字符串');
    }
    const result = await this.embedBatch([text]);
    return result[0];
  }

  /**
   * 批量文本向量化
   * @param {string[]} texts - 待向量化的文本数组
   * @returns {Promise<Float32Array[]>} - 向量数组
   */
  async embedBatch(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('embedBatch参数必须是非空字符串数组');
    }

    // OpenAI embedding API 单次最多支持2048个输入
    const BATCH_LIMIT = 2048;
    if (texts.length > BATCH_LIMIT) {
      // 分批处理
      const batches = [];
      for (let i = 0; i < texts.length; i += BATCH_LIMIT) {
        batches.push(texts.slice(i, i + BATCH_LIMIT));
      }
      const results = [];
      for (const batch of batches) {
        const batchResult = await this._callEmbeddingAPI(batch);
        results.push(...batchResult);
      }
      return results;
    }

    return this._callEmbeddingAPI(texts);
  }

  /**
   * 调用Embedding API
   * @param {string[]} texts - 文本数组
   * @returns {Promise<Float32Array[]>}
   * @private
   */
  async _callEmbeddingAPI(texts) {
    let baseUrl = this.baseUrl || 'https://api.openai.com/v1';
    // 智能判断：如果baseUrl已包含/embeddings结尾，不再拼接
    const endpoint = baseUrl.endsWith('/embeddings') ? baseUrl : `${baseUrl}/embeddings`;
    const body = {
      model: this.model,
      input: texts
    };
    // 如果指定了dimensions且模型支持，则传入
    if (this.dimensions && this.dimensions > 0) {
      body.dimensions = this.dimensions;
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
      // 自动降级：如果 dimensions 参数导致 400 错误，重试不带 dimensions
      if (resp.status === 400 && body.dimensions &&
          (errText.includes('parameter is invalid') || errText.includes('dimensions'))) {
        delete body.dimensions;
        const retryResp = await this._fetchWithTimeout(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(body)
        });
        if (!retryResp.ok) {
          const retryErr = await retryResp.text();
          throw new Error(`Embedding API错误: ${retryResp.status} ${retryErr}`);
        }
        const retryData = await retryResp.json();
        if (!retryData.data || !Array.isArray(retryData.data)) {
          throw new Error('Embedding API返回数据格式异常');
        }
        const sorted = retryData.data
          .filter(item => item.embedding && Array.isArray(item.embedding))
          .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
        return sorted.map(item => new Float32Array(item.embedding));
      }
      throw new Error(`Embedding API错误: ${resp.status} ${errText}`);
    }

    const data = await resp.json();
    // OpenAI格式: data.data[].embedding
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Embedding API返回数据格式异常');
    }

    // 按index排序，确保顺序与输入一致
    const sorted = data.data
      .filter(item => item.embedding && Array.isArray(item.embedding))
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    return sorted.map(item => new Float32Array(item.embedding));
  }

  /**
   * 从chrome.storage读取配置并创建实例
   * @returns {Promise<EmbeddingClient>}
   */
  static async fromStorage() {
    const data = await ZhiYeUtils.storageGet('zhiye_embedding_config');
    const cfg = data?.zhiye_embedding_config || {};
    return new EmbeddingClient({
      provider: cfg.provider || 'openai',
      apiKey: cfg.apiKey || '',
      baseUrl: cfg.baseUrl || '',
      model: cfg.model || 'text-embedding-3-small',
      dimensions: cfg.dimensions || null,
      timeout: cfg.timeout || 30000
    });
  }

  /**
   * 测试Embedding连接
   * @returns {Promise<{success: boolean, dimensions: number|null, error: string|null}>}
   */
  async testConnection() {
    try {
      const testText = 'test connection';
      const vector = await this.embed(testText);
      return {
        success: true,
        dimensions: vector.length,
        error: null
      };
    } catch (err) {
      return {
        success: false,
        dimensions: null,
        error: err.message
      };
    }
  }
}

// 全局导出（浏览器环境）
if (typeof window !== 'undefined') window.EmbeddingClient = EmbeddingClient;
if (typeof module !== 'undefined') module.exports = EmbeddingClient;
