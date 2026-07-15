/**
 * 智页AI - 通用工具模块
 */

const ZhiYeUtils = {
  /**
   * 生成唯一ID
   */
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },

  /**
   * 防抖函数
   */
  debounce(fn, delay = 300) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * 文本分块
   */
  chunkText(text, chunkSize = 800, overlap = 100) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      chunks.push({
        id: this.uuid(),
        text: chunk,
        start,
        end,
        index: chunks.length
      });
      start += chunkSize - overlap;
    }
    return chunks;
  },

  /**
   * 简单文本相似度计算（余弦相似度简化版）
   */
  textSimilarity(a, b) {
    const tokensA = this.tokenize(a);
    const tokensB = this.tokenize(b);
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    return intersection.size / Math.sqrt(setA.size * setB.size);
  },

  /**
   * 中文分词简化版
   */
  tokenize(text) {
    // 去除标点并分词
    return text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 || /[\u4e00-\u9fa5]/.test(w));
  },

  /**
   * 提取代码块
   */
  extractCodeBlocks(text) {
    const regex = /```(\w+)?\n([\s\S]*?)```|`([^`]+)`/g;
    const blocks = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2] || match[3],
        isInline: !match[2]
      });
    }
    return blocks;
  },

  /**
   * 提取API信息（函数名、参数等）
   */
  extractAPIInfo(text) {
    const patterns = [
      // Lua函数: function name(args) 或 name = function(args)
      { regex: /(?:function\s+([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\s*\(([^)]*)\)|([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\s*=\s*function\s*\(([^)]*)\))/g, type: 'function' },
      // 通用API: name(args)
      { regex: /([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\s*\(([^)]*)\)/g, type: 'call' },
      // HTTP API: GET /path
      { regex: /(GET|POST|PUT|DELETE|PATCH)\s+([\/\w{}]+)/g, type: 'http' }
    ];

    const apis = [];
    for (const p of patterns) {
      let match;
      while ((match = p.regex.exec(text)) !== null) {
        const name = match[1] || match[3];
        const params = match[2] || match[4] || '';
        if (name && !apis.find(a => a.name === name)) {
          apis.push({ name, params, type: p.type });
        }
      }
    }
    return apis;
  },

  /**
   * 存储封装（chrome.storage.local）
   */
  async storageGet(key) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise(resolve => chrome.storage.local.get(key, resolve));
    }
    try {
      const data = localStorage.getItem(key);
      return { [key]: data ? JSON.parse(data) : null };
    } catch {
      return { [key]: null };
    }
  },

  async storageSet(data) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise(resolve => chrome.storage.local.set(data, resolve));
    }
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  /**
   * 创建DOM元素
   */
  createEl(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v);
    }
    for (const child of children) {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else el.appendChild(child);
    }
    return el;
  }
};

// 全局导出
if (typeof window !== 'undefined') window.ZhiYeUtils = ZhiYeUtils;
if (typeof module !== 'undefined') module.exports = ZhiYeUtils;

/**
 * SmartTextSplitter - 智能文本切分器
 * 基于语义分隔符的递归切分，支持滑动窗口与重叠
 *
 * 切分策略：
 * 1. 先按大粒度分隔符（\n\n）分割
 * 2. 超长片段递归使用下一级分隔符（\n、句号、逗号、空格）
 * 3. 最终强制按字符切分
 * 4. 清洗并过滤过短片段
 */
class SmartTextSplitter {
  constructor(chunkSize = 800, chunkOverlap = 100) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
    // 按优先级排序的语义分隔符
    this.separators = ['\n\n', '\n', '。', '！', '？', '；', '.', '!', '?', ';', '，', ',', ' ', ''];
    this.minChunkLength = 10;
  }

  /**
   * 切分单个文本为多个chunk
   * @param {string} text
   * @returns {string[]}
   */
  splitText(text) {
    if (!text || typeof text !== 'string') return [];
    const cleaned = this._cleanText(text);
    if (!cleaned) return [];

    const chunks = this._recursiveSplit(cleaned, this.separators);

    // 去重并过滤过短片段
    const result = [];
    const seen = new Set();
    for (const chunk of chunks) {
      const c = this._cleanText(chunk);
      if (!c || c.length < this.minChunkLength) continue;
      if (seen.has(c)) continue;
      seen.add(c);
      result.push(c);
    }

    return result;
  }

  /**
   * 切分多个文档（兼容旧接口）
   * @param {{pageContent:string, metadata:object}[]} documents
   * @returns {{pageContent:string, metadata:object}[]}
   */
  splitDocuments(documents) {
    const result = [];
    for (const doc of documents) {
      const chunks = this.splitText(doc.pageContent || '');
      for (const chunk of chunks) {
        result.push({
          pageContent: chunk,
          metadata: { ...(doc.metadata || {}) }
        });
      }
    }
    return result;
  }

  _cleanText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/\r/g, '\n')
      .replace(/[\u200b\ufeff\xa0]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  _recursiveSplit(text, separators) {
    const separator = separators[0];
    const nextSeparators = separators.slice(1);
    const parts = separator === '' ? text.split('') : text.split(separator);

    const chunks = [];
    let current = [];
    let currentLen = 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part.length > this.chunkSize) {
        // 先保存当前积累的 chunk
        if (current.length > 0) {
          const joined = separator === '' ? current.join('') : current.join(separator);
          if (joined) chunks.push(joined);
          current = [];
          currentLen = 0;
        }

        // 递归切分这个超长部分
        if (nextSeparators.length > 0) {
          const subChunks = this._recursiveSplit(part, nextSeparators);
          chunks.push(...subChunks);
        } else {
          chunks.push(...this._forceSplit(part));
        }
      } else {
        const sepLen = separator !== '' && i < parts.length - 1 ? separator.length : 0;
        const addLen = part.length + (current.length > 0 ? sepLen : 0);

        if (currentLen + addLen <= this.chunkSize) {
          current.push(part);
          currentLen += addLen;
        } else {
          if (current.length > 0) {
            const joined = separator === '' ? current.join('') : current.join(separator);
            if (joined) chunks.push(joined);
          }
          current = [part];
          currentLen = part.length;
        }
      }
    }

    if (current.length > 0) {
      const joined = separator === '' ? current.join('') : current.join(separator);
      if (joined) chunks.push(joined);
    }

    return chunks;
  }

  _forceSplit(text) {
    const chunks = [];
    for (let i = 0; i < text.length; i += this.chunkSize) {
      chunks.push(text.slice(i, i + this.chunkSize));
    }
    return chunks;
  }
}