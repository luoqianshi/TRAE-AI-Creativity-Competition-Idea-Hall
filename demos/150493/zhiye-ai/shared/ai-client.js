/**
 * 智页AI - AI客户端模块
 * 支持多模型配置：OpenAI、Claude、Gemini、本地Ollama等
 */

class AIClient {
  constructor(config = {}) {
    this.provider = config.provider || 'openai';
    this.apiKey = config.apiKey || '';
    this.baseUrl = config.baseUrl || '';
    this.model = config.model || 'gpt-3.5-turbo';
    this.temperature = config.temperature ?? 0.3;
    this.maxTokens = config.maxTokens || 4096;
    this.timeout = config.timeout || 30000; // 默认30秒超时
  }

  /**
   * 带超时的fetch
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
        throw new Error('请求超时，请检查网络连接或API地址是否正确');
      }
      throw err;
    }
  }

  /**
   * 发送聊天请求
   */
  async chat(messages, options = {}) {
    const provider = options.provider || this.provider;
    switch (provider) {
      case 'openai':
      case 'azure':
        return this._callOpenAI(messages, options);
      case 'claude':
        return this._callClaude(messages, options);
      case 'gemini':
        return this._callGemini(messages, options);
      case 'ollama':
        return this._callOllama(messages, options);
      case 'custom':
        return this._callCustom(messages, options);
      default:
        throw new Error(`不支持的AI提供商: ${provider}`);
    }
  }

  async _callOpenAI(messages, options) {
    const baseUrl = this.baseUrl || 'https://api.openai.com/v1';
    const model = options.model || this.model;
    const resp = await this._fetchWithTimeout(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? this.temperature,
        max_tokens: options.maxTokens || this.maxTokens,
        stream: !!options.stream
      })
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`OpenAI API错误: ${resp.status} ${err}`);
    }
    if (options.stream) return this._handleStream(resp);
    const data = await resp.json();
    return data.choices[0].message.content;
  }

  async _callClaude(messages, options) {
    const baseUrl = this.baseUrl || 'https://api.anthropic.com/v1';
    const model = options.model || this.model;
    // Claude格式转换
    const systemMsg = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    const resp = await this._fetchWithTimeout(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        system: systemMsg?.content || '',
        messages: userMessages,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature ?? this.temperature,
        stream: !!options.stream
      })
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Claude API错误: ${resp.status} ${err}`);
    }
    if (options.stream) return this._handleStream(resp, 'claude');
    const data = await resp.json();
    return data.content[0].text;
  }

  async _callGemini(messages, options) {
    const model = options.model || this.model;
    const baseUrl = this.baseUrl || `https://generativelanguage.googleapis.com/v1beta/models/${model}`;
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    const resp = await this._fetchWithTimeout(`${baseUrl}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: options.temperature ?? this.temperature,
          maxOutputTokens: options.maxTokens || this.maxTokens
        }
      })
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Gemini API错误: ${resp.status} ${err}`);
    }
    const data = await resp.json();
    return data.candidates[0].content.parts[0].text;
  }

  async _callOllama(messages, options) {
    const baseUrl = this.baseUrl || 'http://localhost:11434';
    const model = options.model || this.model;
    const resp = await this._fetchWithTimeout(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: !!options.stream,
        options: {
          temperature: options.temperature ?? this.temperature,
          num_predict: options.maxTokens || this.maxTokens
        }
      })
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Ollama API错误: ${resp.status} ${err}`);
    }
    if (options.stream) return this._handleOllamaStream(resp);
    const data = await resp.json();
    return data.message.content;
  }

  async _callCustom(messages, options) {
    const baseUrl = this.baseUrl;
    const model = options.model || this.model;
    const resp = await this._fetchWithTimeout(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? this.temperature,
        max_tokens: options.maxTokens || this.maxTokens,
        stream: !!options.stream
      })
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`自定义API错误: ${resp.status} ${err}`);
    }
    if (options.stream) return this._handleStream(resp);
    const data = await resp.json();
    return data.choices[0].message.content;
  }

  /**
   * 处理SSE流
   */
  async *_handleStream(resp, type = 'openai') {
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.slice(5).trim();
        if (dataStr === '[DONE]') return;
        try {
          const data = JSON.parse(dataStr);
          if (type === 'claude') {
            if (data.type === 'content_block_delta') yield data.delta.text || '';
          } else {
            const content = data.choices?.[0]?.delta?.content;
            if (content) yield content;
          }
        } catch {
          // ignore parse error
        }
      }
    }
  }

  async *_handleOllamaStream(resp) {
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split('\n').filter(l => l.trim())) {
        try {
          const data = JSON.parse(line);
          if (data.message?.content) yield data.message.content;
          if (data.done) return;
        } catch {
          // ignore
        }
      }
    }
  }

  /**
   * 从配置加载实例
   */
  static async fromStorage() {
    const data = await ZhiYeUtils.storageGet('zhiye_ai_config');
    const config = data?.zhiye_ai_config || {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: '',
      baseUrl: '',
      temperature: 0.3,
      maxTokens: 4096
    };
    return new AIClient(config);
  }

  /**
   * 测试连接
   */
  async testConnection() {
    try {
      const resp = await this.chat([
        { role: 'user', content: 'Say "OK" only.' }
      ], { maxTokens: 10 });
      return { success: true, response: resp };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// 全局导出
if (typeof window !== 'undefined') window.AIClient = AIClient;
if (typeof module !== 'undefined') module.exports = AIClient;