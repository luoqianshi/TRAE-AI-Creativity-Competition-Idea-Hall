/**
 * 智页AI - 结构化知识图谱模块
 * 将网页内容解析为实体-关系-实体的图结构
 */

class KnowledgeGraph {
  constructor() {
    this.nodes = new Map(); // id -> {id, type, label, content, meta}
    this.edges = new Map(); // id -> {id, source, target, relation, weight}
    this.docMeta = {};
  }

  /**
   * 从解析的网页内容构建知识图谱
   */
  static buildFromParsed(parsedData) {
    const kg = new KnowledgeGraph();
    kg.docMeta = {
      url: parsedData.url,
      title: parsedData.title,
      domain: parsedData.domain,
      timestamp: Date.now()
    };

    // 创建文档根节点
    const docNodeId = `doc_${ZhiYeUtils.uuid()}`;
    kg.addNode(docNodeId, 'document', parsedData.title, {
      url: parsedData.url,
      summary: parsedData.summary
    });

    // 添加标题层级节点
    parsedData.headings.forEach((h, idx) => {
      const hId = `heading_${idx}_${ZhiYeUtils.uuid().slice(0, 8)}`;
      kg.addNode(hId, 'heading', h.text, {
        level: h.level,
        tag: h.tag
      });
      kg.addEdge(docNodeId, hId, 'contains', 1.0);

      // 关联该标题下的段落
      const relatedParagraphs = parsedData.paragraphs.filter(p =>
        p.afterHeading === h.text || (p.element && h.element && p.element.compareDocumentPosition(h.element) & Node.DOCUMENT_POSITION_PRECEDING)
      );
      relatedParagraphs.forEach(p => {
        const pId = `para_${ZhiYeUtils.uuid().slice(0, 8)}`;
        kg.addNode(pId, 'paragraph', p.text.substring(0, 100), {
          fullText: p.text,
          wordCount: p.text.length
        });
        kg.addEdge(hId, pId, 'describes', 0.9);
      });
    });

    // 添加代码块节点
    parsedData.codeBlocks.forEach((cb, idx) => {
      const cbId = `code_${idx}_${ZhiYeUtils.uuid().slice(0, 8)}`;
      kg.addNode(cbId, 'code', cb.language ? `${cb.language}代码` : '代码片段', {
        language: cb.language,
        code: cb.code,
        isInline: cb.isInline
      });
      // 找到最近的标题并关联
      const nearestHeading = parsedData.headings.find(h =>
        cb.element && h.element && cb.element.compareDocumentPosition(h.element) & Node.DOCUMENT_POSITION_PRECEDING
      );
      const attachTo = nearestHeading
        ? kg.nodesArray().find(n => n.type === 'heading' && n.label === nearestHeading.text)?.id
        : docNodeId;
      kg.addEdge(attachTo || docNodeId, cbId, 'includes', 0.95);

      // 提取API信息并创建节点
      const apis = ZhiYeUtils.extractAPIInfo(cb.code);
      apis.forEach(api => {
        const apiId = `api_${api.name}_${ZhiYeUtils.uuid().slice(0, 6)}`;
        kg.addNode(apiId, 'api', api.name, {
          params: api.params,
          apiType: api.type,
          sourceCode: cb.code
        });
        kg.addEdge(cbId, apiId, 'defines', 1.0);
      });
    });

    // 添加表格节点（参数表、配置表等）
    parsedData.tables.forEach((tbl, idx) => {
      const tblId = `table_${idx}_${ZhiYeUtils.uuid().slice(0, 8)}`;
      kg.addNode(tblId, 'table', `表格_${idx + 1}`, {
        headers: tbl.headers,
        rows: tbl.rows,
        caption: tbl.caption
      });
      kg.addEdge(docNodeId, tblId, 'contains', 0.8);
    });

    // 添加列表节点
    parsedData.lists.forEach((lst, idx) => {
      const lstId = `list_${idx}_${ZhiYeUtils.uuid().slice(0, 8)}`;
      kg.addNode(lstId, 'list', lst.items[0]?.substring(0, 50) || '列表', {
        items: lst.items,
        listType: lst.type
      });
      const nearestHeading = parsedData.headings.find(h =>
        lst.element && h.element && lst.element.compareDocumentPosition(h.element) & Node.DOCUMENT_POSITION_PRECEDING
      );
      const attachTo = nearestHeading
        ? kg.nodesArray().find(n => n.type === 'heading' && n.label === nearestHeading.text)?.id
        : docNodeId;
      kg.addEdge(attachTo || docNodeId, lstId, 'enumerates', 0.85);
    });

    // 实体链接：建立语义关联
    kg.buildSemanticEdges();

    return kg;
  }

  addNode(id, type, label, meta = {}, sources = []) {
    this.nodes.set(id, { id, type, label, meta, neighbors: new Set(), sources: sources || [] });
  }

  addEdge(source, target, relation, weight = 0.5) {
    const id = `${source}->${target}:${relation}`;
    this.edges.set(id, { id, source, target, relation, weight });
    const sNode = this.nodes.get(source);
    const tNode = this.nodes.get(target);
    if (sNode) sNode.neighbors.add(target);
    if (tNode) tNode.neighbors.add(source);
  }

  nodesArray() {
    return Array.from(this.nodes.values());
  }

  edgesArray() {
    return Array.from(this.edges.values());
  }

  /**
   * 获取指定ID的节点
   */
  getNode(id) {
    return this.nodes.get(id);
  }

  /**
   * 获取指定源和目标之间的边（忽略关系类型）
   */
  getEdge(source, target) {
    for (const [, edge] of this.edges) {
      if (edge.source === source && edge.target === target) return edge;
    }
    return null;
  }

  /**
   * 删除指定ID的节点及其相关的所有边
   */
  removeNode(id) {
    // 删除节点
    this.nodes.delete(id);
    // 删除与该节点相关的所有边
    const edgesToRemove = [];
    for (const [key, edge] of this.edges) {
      if (edge.source === id || edge.target === id) {
        edgesToRemove.push(key);
      }
    }
    edgesToRemove.forEach(key => this.edges.delete(key));
    // 从其他节点的neighbors中移除该节点
    for (const [, node] of this.nodes) {
      if (node.neighbors) node.neighbors.delete(id);
    }
  }

  /**
   * 建立语义关联边
   */
  buildSemanticEdges() {
    const apiNodes = this.nodesArray().filter(n => n.type === 'api');
    const codeNodes = this.nodesArray().filter(n => n.type === 'code');
    const paraNodes = this.nodesArray().filter(n => n.type === 'paragraph');

    // API与代码块关联
    apiNodes.forEach(api => {
      codeNodes.forEach(code => {
        if (code.id !== api.meta.sourceCode && code.meta.code && code.meta.code.includes(api.label)) {
          this.addEdge(api.id, code.id, 'used_in', 0.9);
        }
      });
    });

    // 段落与API关联
    apiNodes.forEach(api => {
      paraNodes.forEach(para => {
        if (para.meta.fullText && para.meta.fullText.includes(api.label)) {
          this.addEdge(para.id, api.id, 'mentions', 0.75);
        }
      });
    });
  }

  /**
   * 基于查询找到最相关的子图（使用 TF-IDF 风格评分）
   */
  querySubgraph(query, maxDepth = 2, topK = 5) {
    const queryTokens = ZhiYeUtils.tokenize(query.toLowerCase());
    if (queryTokens.length === 0) {
      return { nodes: this.nodesArray().slice(0, topK), edges: [], seedScores: [] };
    }

    const allNodes = this.nodesArray();
    const totalNodes = allNodes.length || 1;

    // 预计算每个 token 的文档频率（DF）
    const df = new Map();
    queryTokens.forEach(token => {
      let count = 0;
      allNodes.forEach(node => {
        const text = `${node.label} ${JSON.stringify(node.meta)}`.toLowerCase();
        if (text.includes(token)) count++;
      });
      df.set(token, count);
    });

    // 计算节点得分
    const scoredNodes = allNodes.map(node => {
      const nodeText = `${node.label} ${JSON.stringify(node.meta)}`.toLowerCase();
      const nodeTextLen = nodeText.length || 1;
      let tfidfScore = 0;
      let exactMatches = 0;

      queryTokens.forEach(token => {
        // 计算 token 在节点文本中的出现次数（TF）
        let tf = 0;
        let pos = nodeText.indexOf(token);
        while (pos !== -1) {
          tf++;
          pos = nodeText.indexOf(token, pos + 1);
        }
        // IDF: log((N - df + 0.5) / (df + 0.5) + 1)
        const tokenDf = df.get(token) || 0;
        const idf = Math.log((totalNodes - tokenDf + 0.5) / (tokenDf + 0.5) + 1);
        // TF 归一化（除以文本长度，避免长文本占优）
        const normalizedTf = tf * 100 / nodeTextLen;
        tfidfScore += normalizedTf * idf;
        if (tf > 0) exactMatches++;
      });

      // 精确匹配 boost（匹配到的查询词越多，分数越高）
      const coverageBoost = exactMatches / queryTokens.length;
      let score = tfidfScore * (1 + coverageBoost);

      // 类型权重 boost（更精细）
      const typeBoosts = {
        api: query.match(/api|接口|方法|函数/i) ? 2.0 : 1.0,
        code: query.match(/代码|示例|demo|sample/i) ? 2.0 : 1.0,
        heading: query.match(/介绍|概述|什么是|简介/i) ? 1.5 : 1.0,
        table: query.match(/参数|配置|属性|字段/i) ? 1.8 : 1.0,
        document: 1.2
      };
      score *= (typeBoosts[node.type] || 1.0);

      // 标签精确匹配 boost（查询词直接出现在标签中）
      const labelLower = node.label.toLowerCase();
      queryTokens.forEach(token => {
        if (labelLower.includes(token)) score *= 1.5;
      });

      return { node, score };
    }).filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, topK);

    const subNodes = new Map();
    const subEdges = new Map();

    // BFS扩展子图（优先从高分节点扩展）
    const visited = new Set();
    const queue = scoredNodes.map(s => ({ nodeId: s.node.id, depth: 0 }));

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift();
      if (visited.has(nodeId) || depth > maxDepth) continue;
      visited.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (!node) continue;
      subNodes.set(nodeId, node);

      // 收集关联边（按权重排序，优先扩展重要关系）
      const relatedEdges = this.edgesArray().filter(e =>
        (e.source === nodeId && !visited.has(e.target)) ||
        (e.target === nodeId && !visited.has(e.source))
      ).sort((a, b) => (b.weight || 0) - (a.weight || 0));

      relatedEdges.forEach(edge => {
        subEdges.set(edge.id, edge);
        if (edge.source === nodeId) {
          queue.push({ nodeId: edge.target, depth: depth + 1 });
        } else {
          queue.push({ nodeId: edge.source, depth: depth + 1 });
        }
      });
    }

    return {
      nodes: Array.from(subNodes.values()),
      edges: Array.from(subEdges.values()),
      seedScores: scoredNodes
    };
  }

  /**
   * 序列化为JSON
   */
  serialize() {
    return {
      docMeta: this.docMeta,
      nodes: this.nodesArray().map(n => ({
        id: n.id,
        type: n.type,
        label: n.label,
        meta: n.meta,
        sources: n.sources || []
      })),
      edges: this.edgesArray()
    };
  }

  /**
   * 从JSON反序列化
   */
  static deserialize(data) {
    const kg = new KnowledgeGraph();
    kg.docMeta = data.docMeta || {};
    (data.nodes || []).forEach(n => kg.addNode(n.id, n.type, n.label, n.meta, n.sources || []));
    (data.edges || []).forEach(e => kg.addEdge(e.source, e.target, e.relation, e.weight));
    return kg;
  }
}

// 全局导出
if (typeof window !== 'undefined') window.KnowledgeGraph = KnowledgeGraph;
if (typeof module !== 'undefined') module.exports = KnowledgeGraph;