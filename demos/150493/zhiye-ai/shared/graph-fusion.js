/**
 * 智页AI - 知识图谱融合引擎
 * 将多个来源的知识图谱进行实体消歧与融合，构建统一的融合知识图谱
 *
 * 核心能力：
 * 1. 同源URL识别与路径前缀分组（origin + 第一段路径）
 * 2. 多级实体消歧（Level1 精确匹配 / Level2 字符串相似度 / Level3 共现关系）
 * 3. 图融合（节点合并、边经 nodeMapping 重映射后合并、已存在关系增强权重）
 * 4. 增量更新（向已有融合图追加新页面，无需重建）
 * 5. 反向清理（删除某URL时移除仅属于该URL的节点，保留多来源节点）
 *
 * 图结构约定（与 knowledge-graph.js 保持一致）：
 *   node: {id, label, type, meta, sources?: string[]}
 *   edge: {source, target, relation, weight}
 *   graph: {nodes: node[], edges: edge[], sourceMeta?: {[url]: {originGroup, timestamp, nodeCount, edgeCount}}}
 */
class GraphFusion {
  constructor() {
    // Level2 字符串相似度阈值：归一化相似度 > 该值才视为同一实体
    this.similarityThreshold = 0.85;
    // Level3 共现关系合并所需的最小公共邻居数
    this.cooccurrenceMinOverlap = 1;
    // 已存在关系的权重增强因子（与新边权重相乘后做概率OR叠加）
    this.edgeWeightBoost = 0.3;
  }

  /* ============ 同源URL识别 ============ */

  /**
   * 提取URL的来源组ID（origin + 路径前缀）
   * 例：https://a.com/ugc-wiki/page1 -> https://a.com/ugc-wiki/
   *     https://a.com:8080/docs/intro -> https://a.com:8080/docs/
   * @param {string} url
   * @returns {string} 组ID（非法URL退化为原始字符串）
   */
  static getOriginGroup(url) {
    if (!url || typeof url !== 'string') return '';
    try {
      const u = new URL(url);
      const origin = u.origin; // protocol + host + port
      // 取第一段路径作为前缀分组（如 /ugc-wiki/）
      const segments = u.pathname.split('/').filter(Boolean);
      const prefix = segments.length > 0 ? '/' + segments[0] + '/' : '/';
      return origin + prefix;
    } catch (e) {
      // 非法URL，退化返回原始字符串
      return url;
    }
  }

  /**
   * 判断两个URL是否属于同一来源组
   */
  static isSameOriginGroup(url1, url2) {
    return GraphFusion.getOriginGroup(url1) === GraphFusion.getOriginGroup(url2);
  }

  /* ============ Levenshtein 距离（纯JS实现） ============ */

  /**
   * 计算两个字符串的Levenshtein编辑距离
   * 采用两行滚动数组优化空间为 O(min(m,n))
   * @param {string} a
   * @param {string} b
   * @returns {number} 编辑距离
   */
  static levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;

    let prev = new Array(n + 1);
    let curr = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;

    for (let i = 1; i <= m; i++) {
      curr[0] = i;
      for (let j = 1; j <= n; j++) {
        // 使用 charCodeAt 比较，避免逐字符取子串的开销
        const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(
          prev[j] + 1,        // 删除
          curr[j - 1] + 1,    // 插入
          prev[j - 1] + cost  // 替换
        );
      }
      // 交换两行
      const tmp = prev;
      prev = curr;
      curr = tmp;
    }
    return prev[n];
  }

  /**
   * 归一化相似度 = 1 - levenshtein / max(len(a), len(b))
   * 取值范围 [0, 1]，越接近1越相似
   */
  static normalizedSimilarity(a, b) {
    if (a === b) return 1;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - GraphFusion.levenshtein(a, b) / maxLen;
  }

  /* ============ 内部工具 ============ */

  /**
   * 生成唯一ID（优先复用 ZhiYeUtils.uuid，否则自带降级实现）
   */
  static _uuid() {
    if (typeof ZhiYeUtils !== 'undefined' && ZhiYeUtils && typeof ZhiYeUtils.uuid === 'function') {
      return ZhiYeUtils.uuid();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  /**
   * 创建空的融合图
   */
  static createEmpty() {
    return { nodes: [], edges: [], sourceMeta: {} };
  }

  /**
   * 规范化图结构并深拷贝（避免污染输入参数）
   * fuse / removeSource 均基于此返回全新对象
   */
  _cloneGraph(graph) {
    if (!graph) return GraphFusion.createEmpty();
    // 兼容 KnowledgeGraph 实例（nodes/edges 为 Map）和纯对象（nodes/edges 为 Array）
    const rawNodes = typeof graph.nodesArray === 'function'
      ? graph.nodesArray()
      : (Array.isArray(graph.nodes) ? graph.nodes : []);
    const rawEdges = typeof graph.edgesArray === 'function'
      ? graph.edgesArray()
      : (Array.isArray(graph.edges) ? graph.edges : []);
    return {
      nodes: rawNodes.map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
        meta: { ...(n.meta || {}) },
        sources: [...(n.sources || [])]
      })),
      edges: rawEdges.map(e => ({
        source: e.source,
        target: e.target,
        relation: e.relation,
        weight: e.weight
      })),
      sourceMeta: { ...(graph.sourceMeta || {}) }
    };
  }

  /**
   * 节点合并：将 newNode 并入已存在的 existing 节点
   * - sources 数组追加来源URL（去重）
   * - meta 合并：已有键不覆盖，仅补充缺失键
   */
  _mergeNode(result, existingId, newNode, sourceUrl) {
    const existing = result.nodes.find(n => n.id === existingId);
    if (!existing) return;
    existing.sources = existing.sources || [];
    if (sourceUrl && !existing.sources.includes(sourceUrl)) {
      existing.sources.push(sourceUrl);
    }
    if (newNode.meta) {
      existing.meta = existing.meta || {};
      for (const [k, v] of Object.entries(newNode.meta)) {
        // 仅在缺失或为空时补充，避免覆盖既有信息
        if (existing.meta[k] === undefined || existing.meta[k] === null || existing.meta[k] === '') {
          existing.meta[k] = v;
        }
      }
    }
  }

  /**
   * Level 1 + Level 2 匹配：基于标签
   * Level 1: 类型一致且标签忽略大小写完全相同（精确匹配，命中即返回）
   * Level 2: 类型一致且归一化相似度 > 阈值（取相似度最高者）
   * @returns 匹配到的已有节点ID，未匹配返回 null
   */
  _matchByLabel(result, newNode) {
    const newLabel = (newNode.label || '').toLowerCase();
    let bestSimId = null;
    let bestSim = this.similarityThreshold; // 严格大于阈值才接受

    for (const node of result.nodes) {
      if (node.type !== newNode.type) continue;
      const nodeLabel = (node.label || '').toLowerCase();

      // Level 1: 精确匹配（最高优先级，命中即返回）
      if (nodeLabel === newLabel) {
        return node.id;
      }

      // Level 2: 字符串相似度匹配
      const sim = GraphFusion.normalizedSimilarity(nodeLabel, newLabel);
      if (sim > bestSim) {
        bestSim = sim;
        bestSimId = node.id;
      }
    }
    return bestSimId;
  }

  /**
   * Level 3 匹配：共现关系合并
   * 同类型节点且在相同上下文（共享已映射邻居）中出现
   * @param {Array} newEdges 新图边集合
   * @param {Map} nodeMapping 新节点ID -> 融合图节点ID 的映射
   * @param {Map} existingNeighborsMap 融合图节点ID -> 邻居集合（预计算缓存）
   * @returns 匹配到的已有节点ID，未匹配返回 null
   */
  _matchByCooccurrence(result, newNode, newEdges, nodeMapping, existingNeighborsMap) {
    // 收集新节点在新图中的邻居
    const newNeighborIds = new Set();
    for (const e of newEdges) {
      if (e.source === newNode.id) newNeighborIds.add(e.target);
      if (e.target === newNode.id) newNeighborIds.add(e.source);
    }
    // 将邻居经 nodeMapping 映射到融合图节点
    const mappedNeighbors = new Set();
    newNeighborIds.forEach(nid => {
      const mapped = nodeMapping.get(nid);
      if (mapped) mappedNeighbors.add(mapped);
    });
    if (mappedNeighbors.size === 0) return null;

    // 在融合图中查找同类型、且与这些邻居存在共现的候选节点，取重叠数最高者
    let bestMatch = null;
    let bestOverlap = 0;
    for (const node of result.nodes) {
      if (node.type !== newNode.type) continue;
      const existingNeighbors = existingNeighborsMap.get(node.id) || new Set();
      let overlap = 0;
      mappedNeighbors.forEach(mn => {
        if (existingNeighbors.has(mn)) overlap++;
      });
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestMatch = node.id;
      }
    }
    return bestOverlap >= this.cooccurrenceMinOverlap ? bestMatch : null;
  }

  /* ============ 核心：图融合 ============ */

  /**
   * 将 newGraph 融合到 existingGraph 中（增量更新）
   * 流程：
   *   1. 深拷贝已有图
   *   2. Phase 1&2：基于标签的精确/相似度匹配，命中节点合并 sources
   *   3. Phase 3：基于共现关系匹配剩余节点
   *   4. 未匹配节点添加到融合图（sources = [sourceUrl]）
   *   5. 关系边经 nodeMapping 重映射后合并，已存在关系增强权重
   *   6. 更新来源元信息 sourceMeta
   *
   * @param {object} existingGraph 已有融合图
   * @param {object} newGraph 新来源图
   * @param {string} sourceUrl 新图来源URL
   * @returns {object} 融合后的新图（不修改输入参数）
   */
  fuse(existingGraph, newGraph, sourceUrl) {
    const result = this._cloneGraph(existingGraph);
    // KnowledgeGraph 的 nodes 是 Map，需要用 nodesArray() / edgesArray()
    const newNodes = (newGraph && typeof newGraph.nodesArray === 'function') ? newGraph.nodesArray()
      : (newGraph && newGraph.nodes) || [];
    const newEdges = (newGraph && typeof newGraph.edgesArray === 'function') ? newGraph.edgesArray()
      : (newGraph && newGraph.edges) || [];
    const originGroup = GraphFusion.getOriginGroup(sourceUrl);

    // nodeMapping: 新图节点ID -> 融合图中节点ID
    const nodeMapping = new Map();

    // ---- Phase 1 & 2: 精确匹配 + 字符串相似度 ----
    for (const newNode of newNodes) {
      const matchedId = this._matchByLabel(result, newNode);
      if (matchedId) {
        nodeMapping.set(newNode.id, matchedId);
        this._mergeNode(result, matchedId, newNode, sourceUrl);
      }
    }

    // ---- Phase 3: 共现关系合并 ----
    // 预计算融合图中各节点的邻居集合（Phase 3 期间仅合并元数据，图拓扑不变，可安全复用）
    const existingNeighborsMap = new Map();
    for (const node of result.nodes) {
      existingNeighborsMap.set(node.id, new Set());
    }
    for (const e of result.edges) {
      if (existingNeighborsMap.has(e.source)) existingNeighborsMap.get(e.source).add(e.target);
      if (existingNeighborsMap.has(e.target)) existingNeighborsMap.get(e.target).add(e.source);
    }
    for (const newNode of newNodes) {
      if (nodeMapping.has(newNode.id)) continue; // 已在 Phase 1&2 命中
      const matchedId = this._matchByCooccurrence(
        result, newNode, newEdges, nodeMapping, existingNeighborsMap
      );
      if (matchedId) {
        nodeMapping.set(newNode.id, matchedId);
        this._mergeNode(result, matchedId, newNode, sourceUrl);
      }
    }

    // ---- 未匹配节点：作为新节点添加到融合图 ----
    for (const newNode of newNodes) {
      if (nodeMapping.has(newNode.id)) continue;
      const newId = GraphFusion._uuid();
      result.nodes.push({
        id: newId,
        label: newNode.label,
        type: newNode.type,
        meta: { ...(newNode.meta || {}) },
        sources: [sourceUrl]
      });
      nodeMapping.set(newNode.id, newId);
    }

    // ---- 合并关系边（通过 nodeMapping 重映射）----
    for (const newEdge of newEdges) {
      const mappedSource = nodeMapping.get(newEdge.source);
      const mappedTarget = nodeMapping.get(newEdge.target);
      if (!mappedSource || !mappedTarget) continue;
      if (mappedSource === mappedTarget) continue; // 跳过合并产生的自环

      // 查找是否已存在相同（源、目标、关系）的边
      const existing = result.edges.find(e =>
        e.source === mappedSource &&
        e.target === mappedTarget &&
        e.relation === newEdge.relation
      );
      if (existing) {
        // 已存在：增强权重（概率OR式叠加，结果恒 < 1）
        const boost = (newEdge.weight || 0) * this.edgeWeightBoost;
        existing.weight = 1 - (1 - existing.weight) * (1 - boost);
      } else {
        result.edges.push({
          source: mappedSource,
          target: mappedTarget,
          relation: newEdge.relation,
          weight: newEdge.weight
        });
      }
    }

    // ---- 更新来源元信息 ----
    result.sourceMeta = result.sourceMeta || {};
    result.sourceMeta[sourceUrl] = {
      originGroup,
      timestamp: Date.now(),
      nodeCount: newNodes.length,
      edgeCount: newEdges.length
    };

    return result;
  }

  /* ============ 反向清理 ============ */

  /**
   * 从融合图中移除指定来源URL
   * - 仅属于该URL的节点：移除
   * - 多来源节点：保留，从 sources 中剔除该URL
   * - 连接到被移除节点的边：一并移除
   * @param {object} graph 融合图
   * @param {string} url 要移除的来源URL
   * @returns {object} 清理后的新图（不修改输入参数）
   */
  removeSource(graph, url) {
    const result = this._cloneGraph(graph);
    const nodesToRemove = new Set();

    // 处理节点：区分"仅属于该URL"与"多来源"
    result.nodes.forEach(node => {
      const sources = node.sources || [];
      if (sources.includes(url)) {
        const remaining = sources.filter(s => s !== url);
        if (remaining.length === 0) {
          // 仅属于该URL：标记移除
          nodesToRemove.add(node.id);
        } else {
          // 多来源：保留，更新 sources
          node.sources = remaining;
        }
      }
    });

    // 移除节点
    result.nodes = result.nodes.filter(n => !nodesToRemove.has(n.id));

    // 移除连接到被删节点的边
    result.edges = result.edges.filter(e =>
      !nodesToRemove.has(e.source) && !nodesToRemove.has(e.target)
    );

    // 清理来源元信息
    if (result.sourceMeta) {
      delete result.sourceMeta[url];
    }

    return result;
  }

  /* ============ 融合统计 ============ */

  /**
   * 返回融合统计信息
   * @param {object} graph 融合图
   * @returns {object} 统计结果
   *   {sourceCount, nodeCount, edgeCount, multiSourceNodeCount, originGroups, typeDistribution}
   */
  getFusedStats(graph) {
    const nodes = (graph && graph.nodes) || [];
    const edges = (graph && graph.edges) || [];
    const sourceSet = new Set();

    // 来源集合：合并节点 sources 与 sourceMeta 两处记录
    nodes.forEach(n => (n.sources || []).forEach(s => sourceSet.add(s)));
    if (graph && graph.sourceMeta) {
      Object.keys(graph.sourceMeta).forEach(s => sourceSet.add(s));
    }

    // 按来源组聚合
    const originGroups = {};
    sourceSet.forEach(url => {
      const group = GraphFusion.getOriginGroup(url);
      originGroups[group] = (originGroups[group] || 0) + 1;
    });

    // 多来源节点数（被融合过的节点）
    const multiSourceNodeCount = nodes.filter(n => (n.sources || []).length > 1).length;

    // 节点类型分布
    const typeDistribution = {};
    nodes.forEach(n => {
      typeDistribution[n.type] = (typeDistribution[n.type] || 0) + 1;
    });

    return {
      sourceCount: sourceSet.size,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      multiSourceNodeCount,
      originGroups,
      typeDistribution
    };
  }
}

// 全局导出
if (typeof window !== 'undefined') window.GraphFusion = GraphFusion;
if (typeof module !== 'undefined') module.exports = GraphFusion;
