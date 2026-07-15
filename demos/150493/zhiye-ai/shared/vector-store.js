/**
 * VectorStore - 纯前端向量存储模块
 * 基于 BM25 算法实现，不依赖任何外部库
 *
 * BM25 参数：k1 = 1.5, b = 0.75
 * 评分公式：score(q, d) = IDF(q) * (f(q,d) * (k1 + 1)) / (f(q,d) + k1 * (1 - b + b * |d| / avgdl))
 * IDF 公式：IDF(q) = log((N - df(q) + 0.5) / (df(q) + 0.5) + 1)
 *
 * 搜索时得分会除以「查询的最大可能 BM25 分数」归一化到 [0, 1] 区间。
 *
 * 同时支持向量检索与混合检索：
 * - 文档可携带 embedding（Float32Array 或普通数组）
 * - 向量检索基于余弦相似度计算，返回 TopK
 * - 混合检索（hybridSearch）融合 BM25 与向量分数，支持可选 Reranker 重排
 */

// 中文常见停用词表
const STOP_WORDS = new Set([
  // 中文停用词
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一',
  '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有',
  '看', '好', '自己', '这', '他', '她', '它', '们', '那', '些', '么', '什么',
  '与', '及', '或', '但', '而', '且', '对', '把', '被', '从', '让', '向',
  '给', '等', '能', '可以', '这个', '那个', '这些', '那些', '如果', '因为',
  '所以', '但是', '不过', '虽然', '还是', '已经', '可能', '应该', '需要',
  '不是', '没有', '没', '就是', '只是', '还是', '或者', '以及', '如何',
  '如何', '怎么', '哪', '为什么', '几', '多少', '吗', '呢', '吧', '啊',
  '哦', '嗯', '呀', '啦', '哈', '嘿', '噢', '唉',
  // 英文停用词
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up',
  'it', 'its', 'he', 'she', 'they', 'them', 'his', 'her', 'their',
  'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you',
  'your', 'what', 'which', 'who', 'whom',
]);

class VectorStore {
  constructor() {
    /** @type {Map<string, {id: string, text: string, meta: object, tokens: string[], tokenCount: number, tf: Object<string, number>, embedding?: Float32Array|number[]}>} */
    this._documents = new Map();
    /** @type {Map<string, number>} 词汇表 -> 包含该词的文档数量 */
    this._df = new Map(); // document frequency
    /** @type {number} 文档总数 */
    this._totalDocs = 0;
    /** @type {number} 所有文档的 token 总数（用于计算平均文档长度） */
    this._totalTokens = 0;
    /** @type {number} 平均文档长度 avgdl */
    this._avgDocLength = 0;
    /** @type {number} BM25 参数 k1：词频饱和控制 */
    this._k1 = 1.5;
    /** @type {number} BM25 参数 b：文档长度归一化控制 */
    this._b = 0.75;
  }

  /**
   * 添加文档到向量存储
   * @param {string} id - 文档唯一标识
   * @param {string} text - 文档文本内容
   * @param {object} [meta={}] - 文档元数据
   * @param {Float32Array|number[]} [embedding=null] - 文档向量嵌入（可选）
   */
  addDocument(id, text, meta = {}, embedding = null) {
    if (this._documents.has(id)) {
      // 如果已存在，先删除旧文档以更新 DF 与统计量
      this.deleteDocument(id);
    }

    const tokens = this._tokenize(text);
    const tokenCount = tokens.length;
    const tf = this._getTermFrequency(tokens);

    const doc = { id, text, meta, tokens, tokenCount, tf };
    if (embedding != null) {
      doc.embedding = embedding instanceof Float32Array ? embedding : new Float32Array(embedding);
    }

    this._documents.set(id, doc);
    this._totalDocs++;
    this._totalTokens += tokenCount;

    // 更新每个 token 的文档频率 (df)
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      this._df.set(token, (this._df.get(token) || 0) + 1);
    }

    this._updateAvgDocLength();
  }

  /**
   * 搜索最相似的文档（纯 BM25，向后兼容）
   * @param {string} query - 查询文本
   * @param {number} [topK=5] - 返回前 K 个结果
   * @returns {Array<{id: string, score: number, text: string, meta: object}>}
   */
  search(query, topK = 5) {
    if (this._totalDocs === 0) return [];

    const queryTokens = this._tokenize(query);
    if (queryTokens.length === 0) return [];

    // 计算当前查询的最大可能 BM25 分数，用于归一化
    const maxPossible = this._getMaxPossibleScore(queryTokens);

    const results = [];

    for (const [id, doc] of this._documents) {
      const raw = this._computeBM25(queryTokens, doc);
      if (raw > 0) {
        const score = maxPossible > 0 ? raw / maxPossible : 0;
        results.push({
          id: doc.id,
          score: Math.min(score, 1),
          text: doc.text,
          meta: doc.meta,
        });
      }
    }

    // 按得分降序排序，取 topK
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * 向量相似度检索
   * @param {Float32Array|number[]} queryEmbedding - 查询向量
   * @param {number} [topK=5] - 返回前 K 个结果
   * @returns {Array<{id: string, score: number, text: string, meta: object}>}
   */
  _vectorSearch(queryEmbedding, topK = 5) {
    if (!queryEmbedding || !queryEmbedding.length) return [];

    const results = [];
    for (const [id, doc] of this._documents) {
      if (!doc.embedding || !doc.embedding.length) continue;
      const score = this._cosineSimilarity(queryEmbedding, doc.embedding);
      results.push({
        id: doc.id,
        score,
        text: doc.text,
        meta: doc.meta,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * 计算两个向量的余弦相似度
   * @param {Float32Array|number[]} a
   * @param {Float32Array|number[]} b
   * @returns {number} 0-1 之间的相似度
   */
  _cosineSimilarity(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
  }

  /**
   * 混合检索：融合 BM25 与向量相似度，支持可选 Reranker 重排
   * @param {string} query - 查询文本（用于 BM25）
   * @param {object} [options={}] - 配置项
   * @param {number} [options.topK=5] - 返回前 K 个结果
   * @param {number} [options.bm25Weight=0.4] - BM25 分数权重
   * @param {number} [options.vectorWeight=0.6] - 向量分数权重
   * @param {boolean} [options.useReranker=false] - 是否启用 Reranker
   * @param {object|Function} [options.rerankerClient=null] - Reranker 客户端（需实现 rerank 方法或为函数）
   * @param {Float32Array|number[]} [options.queryEmbedding=null] - 查询向量（用于向量检索）
   * @returns {Promise<Array<{id: string, score: number, text: string, meta: object, bm25Score?: number, vectorScore?: number, rerankScore?: number}>>}
   */
  async hybridSearch(query, options = {}) {
    const {
      topK = 5,
      bm25Weight = 0.4,
      vectorWeight = 0.6,
      useReranker = false,
      rerankerClient = null,
      queryEmbedding = null,
    } = options;

    // 检查是否具备向量检索条件
    let hasEmbeddingCount = 0;
    for (const doc of this._documents.values()) {
      if (doc.embedding && doc.embedding.length) {
        hasEmbeddingCount++;
      }
    }

    const canVectorSearch = hasEmbeddingCount > 0 && queryEmbedding != null && queryEmbedding.length > 0;

    if (!canVectorSearch) {
      // 自动降级为纯 BM25
      return this.search(query, topK).map(r => ({ ...r, bm25Score: r.score }));
    }

    // 获取全部 BM25 结果与全部向量结果
    const bm25Results = this.search(query, this._totalDocs);
    const vectorResults = this._vectorSearch(queryEmbedding, this._totalDocs);

    // 合并结果
    const mergedMap = new Map();

    for (const r of bm25Results) {
      mergedMap.set(r.id, {
        id: r.id,
        bm25Score: r.score,
        vectorScore: 0,
        text: r.text,
        meta: r.meta,
      });
    }

    for (const r of vectorResults) {
      if (mergedMap.has(r.id)) {
        mergedMap.get(r.id).vectorScore = r.score;
      } else {
        mergedMap.set(r.id, {
          id: r.id,
          bm25Score: 0,
          vectorScore: r.score,
          text: r.text,
          meta: r.meta,
        });
      }
    }

    // 加权融合
    const merged = [];
    for (const item of mergedMap.values()) {
      const score = bm25Weight * item.bm25Score + vectorWeight * item.vectorScore;
      merged.push({
        id: item.id,
        score,
        text: item.text,
        meta: item.meta,
        bm25Score: item.bm25Score,
        vectorScore: item.vectorScore,
      });
    }

    merged.sort((a, b) => b.score - a.score);
    let results = merged.slice(0, topK);

    // Reranker 重排
    if (useReranker && rerankerClient) {
      try {
        let reranked;
        const docsForRerank = results.map(r => ({ id: r.id, text: r.text, meta: r.meta }));
        if (typeof rerankerClient.rerank === 'function') {
          reranked = await rerankerClient.rerank(query, docsForRerank);
        } else if (typeof rerankerClient === 'function') {
          reranked = await rerankerClient(query, docsForRerank);
        }

        if (Array.isArray(reranked) && reranked.length > 0) {
          const rerankMap = new Map();
          for (const r of reranked) {
            const rid = r.id ?? r.document?.id;
            const rscore = r.score ?? r.relevance_score ?? r.rerankScore ?? 0;
            if (rid != null) rerankMap.set(rid, rscore);
          }

          results = results.map(r => {
            const rs = rerankMap.get(r.id);
            return rs != null
              ? { ...r, rerankScore: rs, score: rs }
              : { ...r, rerankScore: r.score, score: r.score };
          }).sort((a, b) => b.score - a.score);
        }
      } catch (err) {
        // Reranker 失败时静默回退，保留原有融合分数
      }
    }

    return results;
  }

  /**
   * 删除指定文档
   * @param {string} id - 文档唯一标识
   * @returns {boolean} 是否成功删除
   */
  deleteDocument(id) {
    const doc = this._documents.get(id);
    if (!doc) return false;

    // 更新 df：减去该文档中的 token 贡献
    const uniqueTokens = new Set(doc.tokens);
    for (const token of uniqueTokens) {
      const count = this._df.get(token);
      if (count !== undefined) {
        if (count <= 1) {
          this._df.delete(token);
        } else {
          this._df.set(token, count - 1);
        }
      }
    }

    this._documents.delete(id);
    this._totalDocs--;
    this._totalTokens -= doc.tokenCount;
    if (this._totalTokens < 0) this._totalTokens = 0;

    this._updateAvgDocLength();
    return true;
  }

  /**
   * 获取统计信息
   * @returns {{documentCount: number, vocabularySize: number, avgDocLength: number, hasEmbeddingCount: number}}
   */
  getStats() {
    let hasEmbeddingCount = 0;
    for (const doc of this._documents.values()) {
      if (doc.embedding && doc.embedding.length) {
        hasEmbeddingCount++;
      }
    }
    return {
      documentCount: this._totalDocs,
      vocabularySize: this._df.size,
      avgDocLength: this._avgDocLength,
      hasEmbeddingCount,
    };
  }

  /**
   * 分词：中文按单字/双字分词，英文按空格分词，去除停用词
   * @param {string} text - 待分词文本
   * @returns {string[]}
   */
  _tokenize(text) {
    if (!text || typeof text !== 'string') return [];

    // 转小写以统一处理
    text = text.toLowerCase().trim();

    const tokens = [];
    let i = 0;

    while (i < text.length) {
      const ch = text[i];

      if (this._isCJK(ch)) {
        // 收集连续 CJK 字符
        let j = i;
        while (j < text.length && this._isCJK(text[j])) {
          j++;
        }
        const segment = text.substring(i, j);

        // 单字分词
        for (let k = 0; k < segment.length; k++) {
          const char = segment[k];
          if (!STOP_WORDS.has(char)) {
            tokens.push(char);
          }
        }

        // 双字分词
        for (let k = 0; k < segment.length - 1; k++) {
          const bigram = segment[k] + segment[k + 1];
          if (!STOP_WORDS.has(bigram)) {
            tokens.push(bigram);
          }
        }

        i = j;
      } else if (this._isAlpha(ch)) {
        // 收集连续英文字母（含数字）
        let j = i;
        while (j < text.length && (this._isAlpha(text[j]) || this._isDigit(text[j]))) {
          j++;
        }
        const word = text.substring(i, j);
        if (word.length > 1 && !STOP_WORDS.has(word)) {
          tokens.push(word);
        }
        i = j;
      } else if (this._isDigit(ch)) {
        // 收集连续数字
        let j = i;
        while (j < text.length && this._isDigit(text[j])) {
          j++;
        }
        const num = text.substring(i, j);
        if (num.length > 0) {
          tokens.push(num);
        }
        i = j;
      } else {
        // 跳过标点、空格、特殊字符
        i++;
      }
    }

    return tokens;
  }

  /**
   * 判断字符是否为 CJK（中日韩）字符
   * @param {string} ch
   * @returns {boolean}
   */
  _isCJK(ch) {
    const code = ch.charCodeAt(0);
    return (
      (code >= 0x4e00 && code <= 0x9fff) ||   // CJK 统一汉字
      (code >= 0x3400 && code <= 0x4dbf) ||   // CJK 扩展 A
      (code >= 0x20000 && code <= 0x2a6df) || // CJK 扩展 B
      (code >= 0x3000 && code <= 0x303f) ||   // CJK 标点
      (code >= 0xff00 && code <= 0xffef)      // 全角字符
    );
  }

  /**
   * 判断字符是否为英文字母
   * @param {string} ch
   * @returns {boolean}
   */
  _isAlpha(ch) {
    const code = ch.charCodeAt(0);
    return (code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a);
  }

  /**
   * 判断字符是否为数字
   * @param {string} ch
   * @returns {boolean}
   */
  _isDigit(ch) {
    const code = ch.charCodeAt(0);
    return code >= 0x0030 && code <= 0x0039;
  }

  /**
   * 计算词频表
   * @param {string[]} tokens
   * @returns {Object<string, number>}
   */
  _getTermFrequency(tokens) {
    const tf = {};
    for (const token of tokens) {
      tf[token] = (tf[token] || 0) + 1;
    }
    return tf;
  }

  /**
   * 计算某个词项的 IDF（BM25 变体，始终非负）
   * IDF(q) = log((N - df(q) + 0.5) / (df(q) + 0.5) + 1)
   * @param {string} term
   * @returns {number}
   */
  _getIDF(term) {
    const df = this._df.get(term) || 0;
    return Math.log((this._totalDocs - df + 0.5) / (df + 0.5) + 1);
  }

  /**
   * 计算单篇文档针对查询的原始 BM25 分数
   * score = Σ IDF(q) * (f(q,d) * (k1+1)) / (f(q,d) + k1 * (1 - b + b * |d| / avgdl))
   * @param {string[]} queryTokens - 查询分词结果
   * @param {{tokens: string[], tokenCount: number, tf: Object<string, number>}} doc - 文档对象
   * @returns {number} 原始 BM25 分数
   */
  _computeBM25(queryTokens, doc) {
    const docTF = doc.tf;
    const docLen = doc.tokenCount;
    // 避免 avgdl 为 0 时除零（search 已保证有文档时调用）
    const avgdl = this._avgDocLength || 1;

    let score = 0;
    for (const q of queryTokens) {
      const f = docTF[q] || 0;
      if (f === 0) continue; // 该词在文档中未出现，贡献为 0
      const idf = this._getIDF(q);
      const denom = f + this._k1 * (1 - this._b + this._b * (docLen / avgdl));
      if (denom === 0) continue;
      score += (idf * (f * (this._k1 + 1))) / denom;
    }
    return score;
  }

  /**
   * 计算当前查询的最大可能 BM25 分数，用于归一化
   * 单个词项的最大贡献出现在 f(q,d) -> ∞ 且 |d|/avgdl -> 0 时，趋近于 IDF(q) * (k1 + 1)
   * 仅统计在语料中出现过（df > 0）的查询词，否则会过度膨胀分母
   * @param {string[]} queryTokens
   * @returns {number}
   */
  _getMaxPossibleScore(queryTokens) {
    let maxScore = 0;
    for (const q of queryTokens) {
      const df = this._df.get(q) || 0;
      if (df === 0) continue; // 不在任何文档中，实际贡献恒为 0
      const idf = this._getIDF(q);
      maxScore += idf * (this._k1 + 1);
    }
    return maxScore;
  }

  /**
   * 根据当前文档总数与 token 总数更新平均文档长度
   */
  _updateAvgDocLength() {
    this._avgDocLength = this._totalDocs > 0 ? this._totalTokens / this._totalDocs : 0;
  }

  /**
   * 序列化当前状态
   * 保存 avgDocLength 以及每个文档的 tokenCount；embedding 以普通数组形式存储（Float32Array 会被转为 Array）
   * @returns {string} JSON 字符串
   */
  serialize() {
    const data = {
      documents: [],
      df: Object.fromEntries(this._df),
      totalDocs: this._totalDocs,
      totalTokens: this._totalTokens,
      avgDocLength: this._avgDocLength,
      k1: this._k1,
      b: this._b,
    };

    for (const [id, doc] of this._documents) {
      const docData = {
        id: doc.id,
        text: doc.text,
        meta: doc.meta,
        tokens: doc.tokens,
        tokenCount: doc.tokenCount,
      };
      if (doc.embedding != null) {
        docData.embedding = Array.from(doc.embedding);
      }
      data.documents.push(docData);
    }

    return JSON.stringify(data);
  }

  /**
   * 反序列化恢复状态
   * @param {string} data - JSON 字符串
   * @returns {VectorStore}
   */
  static deserialize(data) {
    const parsed = JSON.parse(data);
    const store = new VectorStore();

    store._totalDocs = parsed.totalDocs || 0;
    store._df = new Map(Object.entries(parsed.df || {}));
    store._k1 = parsed.k1 != null ? parsed.k1 : 1.5;
    store._b = parsed.b != null ? parsed.b : 0.75;
    store._totalTokens = 0;

    for (const doc of parsed.documents || []) {
      const tokens = doc.tokens || [];
      const tokenCount = doc.tokenCount != null ? doc.tokenCount : tokens.length;
      const tf = store._getTermFrequency(tokens);
      const docObj = {
        id: doc.id,
        text: doc.text,
        meta: doc.meta || {},
        tokens,
        tokenCount,
        tf,
      };
      if (doc.embedding != null) {
        docObj.embedding = new Float32Array(doc.embedding);
      }
      store._documents.set(doc.id, docObj);
      store._totalTokens += tokenCount;
    }

    // 优先依据文档统计重新计算 avgdl，保证一致性；缺失时回退到序列化值
    store._updateAvgDocLength();
    if (store._avgDocLength === 0 && parsed.avgDocLength) {
      store._avgDocLength = parsed.avgDocLength;
    }

    return store;
  }
}

// 导出
if (typeof window !== 'undefined') window.VectorStore = VectorStore;
if (typeof module !== 'undefined') module.exports = VectorStore;
