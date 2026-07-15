/**
 * 智页AI - 内容脚本主入口
 * 负责页面解析、知识图谱构建、同源图融合、向量存储、UI初始化
 */

(function() {
  'use strict';

  if (window.__ZHIYE_AI_INITIALIZED__) return;
  window.__ZHIYE_AI_INITIALIZED__ = true;

  let sidebarCtrl = null;
  let parser = null;
  let kg = null;
  let aiClient = null;
  let isBuilding = false;
  let buildCancelled = false;  // 标记构建是否被用户取消
  let lastBuiltUrl = '';       // 上次构建的URL
  let shouldBuild = false;  // 标记是否需要构建（用户打开侧边栏时才执行）
  let embeddingClient = null;
  let rerankerClient = null;

  /**
   * 代码语义切分器
   * 策略：
   * 1. 先按空行分割为"逻辑段落"（函数之间通常有空行分隔）
   * 2. 逐段累加，遇到以下"硬边界"时强制切分：
   *    - function/def/class/struct/interface 等函数/类声明行
   *    - 上一段末尾和当前段开头之间的括号不匹配（说明跨越了独立代码块）
   * 3. 软边界：累加后如果超过 maxSize，在最近的完整语句处切分
   * 4. 语句完整性检查：通过追踪括号、引号、Lua end 关键字状态，确保不在语句中间切断
   * 5. 兜底：如果实在无法找到完整边界，宁可超限存储也不截断到语句中间
   */
  function _splitCodeSemantic(code, maxSize = 800) {
    const lines = code.split('\n');
    // 按空行分组为逻辑段落
    const paragraphs = [];
    let currentPara = [];
    for (const line of lines) {
      if (line.trim() === '' && currentPara.length > 0) {
        paragraphs.push(currentPara.join('\n'));
        currentPara = [];
      } else {
        currentPara.push(line);
      }
    }
    if (currentPara.length > 0) {
      paragraphs.push(currentPara.join('\n'));
    }

    if (paragraphs.length === 0) return [code];

    // 检测是否为函数/类声明行（新代码块的开始）
    const blockStartRe = /^(?:\s*(?:function|def|class|struct|interface|module|namespace|export\s+(?:default\s+)?(?:function|class)|const\s+\w+\s*=\s*(?:function|\(|async)|let\s+\w+\s*=\s*(?:function|\(|async)|var\s+\w+\s*=\s*(?:function|\(|async)))/m;

    // 追踪括号和引号状态
    function getBracketState(text) {
      let depth = 0;
      let inString = false;
      let stringChar = '';
      let inLineComment = false;
      let inBlockComment = false;
      let blockCommentChar = '';

      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];

        if (inBlockComment) {
          if (blockCommentChar === '*' && ch === '*' && next === '/') {
            inBlockComment = false;
            i++; // skip /
          } else if (blockCommentChar === '-' && ch === ']' && text[i-1] === '-') {
            inBlockComment = false;
          }
          continue;
        }
        if (inLineComment) {
          if (ch === '\n') inLineComment = false;
          continue;
        }
        if (inString) {
          if (ch === '\\') { i++; continue; }
          if (ch === stringChar) inString = false;
          continue;
        }

        if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
        if (ch === '-' && next === '-') { inLineComment = true; i++; continue; }
        if (ch === '/' && next === '*') { inBlockComment = true; blockCommentChar = '*'; i++; continue; }
        if (ch === '=' && next === '[') { inBlockComment = true; blockCommentChar = '['; i++; continue; }

        if (ch === '"' || ch === "'" || ch === '`') {
          inString = true;
          stringChar = ch;
        }
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        if (ch === ')' || ch === ']' || ch === '}') depth--;
      }
      return depth;
    }

    // 追踪 Lua end 关键字深度（function/if/for/while/do...end 结构）
    function getLuaEndDepth(text) {
      let depth = 0;
      let inLineComment = false;
      let inBlockComment = false;
      let inString = false;
      let stringChar = '';

      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];

        if (inBlockComment) {
          if (ch === '*' && next === '/') { inBlockComment = false; i++; }
          continue;
        }
        if (inLineComment) {
          if (ch === '\n') inLineComment = false;
          continue;
        }
        if (inString) {
          if (ch === '\\') { i++; continue; }
          if (ch === stringChar) inString = false;
          continue;
        }

        if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
        if (ch === '-' && next === '-') { inLineComment = true; i++; continue; }
        if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
        if (ch === '=' && next === '[') { inBlockComment = true; i++; continue; }
        if (ch === '"' || ch === "'" || ch === '`') {
          inString = true;
          stringChar = ch;
          continue;
        }

        // 匹配关键字
        const remaining = text.substring(i);
        const openMatch = remaining.match(/^(function|if|for|while|repeat|do)\b/);
        if (openMatch) {
          depth++;
          i += openMatch[0].length - 1;
          continue;
        }
        if (remaining.match(/^end\b/)) {
          depth--;
          i += 2;
          continue;
        }
      }
      return depth;
    }

    // 找到最后一个完整语句的位置（括号深度为0且Lua end深度为0）
    function findLastCompleteStatement(text) {
      const bracketDepth = getBracketState(text);
      const luaEndDepth = getLuaEndDepth(text);

      // 两种深度都是0，整个文本完整
      if (bracketDepth === 0 && luaEndDepth === 0) return text.length;

      // 从后往前逐行剥离，找到两种深度都归零的位置
      const lines = text.split('\n');
      let bDepth = bracketDepth;
      let eDepth = luaEndDepth;

      for (let i = lines.length - 1; i >= 0; i--) {
        bDepth -= getBracketState(lines[i]);
        eDepth -= getLuaEndDepth(lines[i]);
        if (bDepth <= 0 && eDepth <= 0) {
          return lines.slice(0, i + 1).join('\n').length;
        }
      }
      return -1; // 无法找到完整边界
    }

    const result = [];
    let currentChunk = '';
    let currentDepth = 0;
    let currentLuaDepth = 0;

    for (let pi = 0; pi < paragraphs.length; pi++) {
      const para = paragraphs[pi];
      const paraDepth = getBracketState(para);
      const paraLuaDepth = getLuaEndDepth(para);
      const isBlockStart = blockStartRe.test(para);

      // 硬边界：函数/类声明开头，且当前chunk已有内容且深度已归零
      if (isBlockStart && currentChunk.length > 0 && currentDepth === 0 && currentLuaDepth === 0) {
        result.push(currentChunk.trim());
        currentChunk = para;
        currentDepth = paraDepth;
        currentLuaDepth = paraLuaDepth;
        continue;
      }

      // 硬边界：上一段括号已闭合，当前段落是新的独立块
      if (currentDepth === 0 && currentLuaDepth === 0 && currentChunk.length > 0 && (paraDepth > 0 || paraLuaDepth > 0) && !isBlockStart) {
        if (currentChunk.length + para.length + 1 <= maxSize) {
          currentChunk += '\n\n' + para;
          currentDepth = paraDepth;
          currentLuaDepth = paraLuaDepth;
          continue;
        }
      }

      // 合并到当前chunk
      const wouldBe = currentChunk ? currentChunk + '\n\n' + para : para;

      if (wouldBe.length <= maxSize) {
        currentChunk = wouldBe;
        currentDepth += paraDepth;
        currentLuaDepth += paraLuaDepth;
        continue;
      }

      // 超出大小限制
      if (currentChunk.length > 0) {
        if (currentChunk.length > maxSize) {
          // 找最后一个完整语句位置
          const cutPos = findLastCompleteStatement(currentChunk);
          if (cutPos > 0 && cutPos < currentChunk.length) {
            result.push(currentChunk.substring(0, cutPos).trim());
            const remainder = currentChunk.substring(cutPos).trim();
            if (remainder.length > 0) {
              const combined = remainder + '\n\n' + para;
              if (combined.length <= maxSize) {
                currentChunk = combined;
                currentDepth = getBracketState(combined);
                currentLuaDepth = getLuaEndDepth(combined);
              } else {
                const cutPos2 = findLastCompleteStatement(remainder);
                if (cutPos2 > 0) {
                  result.push(remainder.substring(0, cutPos2).trim());
                  currentChunk = remainder.substring(cutPos2).trim() + '\n\n' + para;
                  currentDepth = getBracketState(currentChunk);
                  currentLuaDepth = getLuaEndDepth(currentChunk);
                } else {
                  // 无法找到完整边界，将剩余部分和新段落合为一个整体（宁可超限不截断）
                  currentChunk = remainder + '\n\n' + para;
                  currentDepth = getBracketState(currentChunk);
                  currentLuaDepth = getLuaEndDepth(currentChunk);
                }
              }
            } else {
              currentChunk = para;
              currentDepth = paraDepth;
              currentLuaDepth = paraLuaDepth;
            }
          } else {
            // 无法找到完整语句边界，按空行切分
            const subParas = currentChunk.split(/\n\n+/);
            let subChunk = '';
            for (const sp of subParas) {
              if ((subChunk + '\n\n' + sp).length > maxSize && subChunk.length > 0) {
                result.push(subChunk.trim());
                subChunk = sp;
              } else {
                subChunk = subChunk ? subChunk + '\n\n' + sp : sp;
              }
            }
            currentChunk = subChunk + '\n\n' + para;
            currentDepth = getBracketState(currentChunk);
            currentLuaDepth = getLuaEndDepth(currentChunk);
          }
        } else {
          result.push(currentChunk.trim());
          currentChunk = para;
          currentDepth = paraDepth;
          currentLuaDepth = paraLuaDepth;
        }
        continue;
      }

      currentChunk = para;
      currentDepth = paraDepth;
      currentLuaDepth = paraLuaDepth;
    }

    if (currentChunk.trim()) {
      result.push(currentChunk.trim());
    }

    return result.length > 0 ? result : [code];
  }

  /**
   * 将解析结果填充到向量存储中（支持embedding向量化）
   * 使用 SmartTextSplitter 进行语义切分，标题不作为独立文档
   */
  async function populateVectorStore(parsed) {
    if (!sidebarCtrl?.vectorStore) return;
    const vs = sidebarCtrl.vectorStore;
    const url = location.href;
    const title = parsed.title || '';

    const splitter = new SmartTextSplitter(800, 100);
    const docs = [];

    // ========== 1. 段落（主要文本内容，标题作为上下文附加） ==========
    // 策略：每个段落独立存储，超过 maxSize 的段落才切分，避免不同段落内容被混合
    (parsed.paragraphs || []).forEach((p, i) => {
      if (p.text && p.text.trim().length > 10) {
        let text = p.text.trim();
        // 将最近的前置标题作为上下文附加
        if (p.afterHeading) {
          text = `${p.afterHeading}\n${text}`;
        }
        if (text.length <= 800) {
          docs.push({ id: `${url}_p_${i}`, text, meta: { type: 'paragraph', title, url, index: i } });
        } else {
          const chunks = splitter.splitText(text);
          chunks.forEach((chunk, idx) => {
            docs.push({ id: `${url}_p_${i}_${idx}`, text: chunk, meta: { type: 'paragraph', title, url, index: i, chunkIndex: idx } });
          });
        }
      }
    });

    // ========== 2. 代码块（语义切分：按函数/代码块边界切分，保持语句完整） ==========
    (parsed.codeBlocks || []).forEach((c, i) => {
      const prefix = c.language ? `[${c.language}]\n` : '';
      const text = (prefix + c.code).trim();
      if (text.length <= 5) return;

      if (text.length <= 800) {
        docs.push({ id: `${url}_c_${i}`, text, meta: { type: 'code', title, url, language: c.language } });
      } else {
        // 语义切分：按空行分组，每组是一个逻辑代码块
        const chunks = _splitCodeSemantic(text, 800);
        chunks.forEach((chunk, idx) => {
          docs.push({
            id: `${url}_c_${i}_${idx}`,
            text: chunk,
            meta: { type: 'code', title, url, language: c.language, chunkIndex: idx }
          });
        });
      }
    });

    // ========== 3. 表格（解析为键值行后按大小切分） ==========
    (parsed.tables || []).forEach((t, i) => {
      if (!t.rows || t.rows.length < 2) return;
      const header = t.rows[0];
      const rows = t.rows.slice(1);
      const keyValueLines = [];
      rows.forEach(row => {
        const parts = [];
        row.forEach((cell, j) => {
          if (cell && header[j]) {
            parts.push(`${header[j]}：${cell}`);
          }
        });
        if (parts.length > 0) {
          keyValueLines.push(parts.join('，'));
        }
      });

      let currentChunk = [];
      let currentLen = 0;
      let chunkIdx = 0;
      keyValueLines.forEach(line => {
        const lineLen = line.length + 1;
        if (currentLen + lineLen > 800 && currentChunk.length > 0) {
          docs.push({
            id: `${url}_t_${i}_${chunkIdx}`,
            text: currentChunk.join('\n'),
            meta: { type: 'table', title, url, chunkIndex: chunkIdx }
          });
          currentChunk = [];
          currentLen = 0;
          chunkIdx++;
        }
        currentChunk.push(line);
        currentLen += lineLen;
      });
      if (currentChunk.length > 0) {
        docs.push({
          id: `${url}_t_${i}_${chunkIdx}`,
          text: currentChunk.join('\n'),
          meta: { type: 'table', title, url, chunkIndex: chunkIdx }
        });
      }
    });

    // ========== 4. 列表（文本合并后用语义切分） ==========
    (parsed.lists || []).forEach((l, i) => {
      if (!l.items || l.items.length === 0) return;
      const text = l.items.map((item, j) => `${j + 1}. ${typeof item === 'string' ? item : item.text || ''}`).join('\n');
      if (text.trim().length <= 5) return;

      if (text.length <= 800) {
        docs.push({ id: `${url}_l_${i}`, text: text.trim(), meta: { type: 'list', title, url, ordered: l.ordered } });
      } else {
        const chunks = splitter.splitText(text);
        chunks.forEach((chunk, j) => {
          docs.push({
            id: `${url}_l_${i}_${j}`,
            text: chunk,
            meta: { type: 'list', title, url, ordered: l.ordered, chunkIndex: j }
          });
        });
      }
    });

    // ========== 5. 生成embedding并添加到向量库 ==========
    let embeddings = null;
    if (!embeddingClient) {
      embeddingClient = await EmbeddingClient.fromStorage();
    }
    if (embeddingClient && embeddingClient.apiKey) {
      try {
        sidebarCtrl.setBuildStatus('building', '正在生成文档向量...');
        const texts = docs.map(d => d.text);
        embeddings = await embeddingClient.embedBatch(texts);
        console.log(`[智页AI] Embedding生成完成: ${embeddings.length} 条`);
      } catch (err) {
        console.warn('[智页AI] Embedding生成失败，降级为纯BM25:', err.message);
      }
    }

    docs.forEach((doc, i) => {
      const emb = embeddings && embeddings[i] ? embeddings[i] : null;
      vs.addDocument(doc.id, doc.text, doc.meta, emb);
    });

    console.log(`[智页AI] 向量存储填充完成: ${docs.length} 条文档`);
  }

  async function init() {
    try {
      console.log('[智页AI] 开始初始化...');

      // 1. 先加载AI配置并初始化侧边栏（不阻塞）
      aiClient = await AIClient.fromStorage();
      sidebarCtrl = new SidebarController();
      await sidebarCtrl.init(parser, null, aiClient);
      // 不在这里触发构建覆盖层，等用户打开侧边栏时才开始构建

      // 2. 标记需要构建，但暂不执行（等用户第一次打开侧边栏）
      shouldBuild = true;
      console.log('[智页AI] UI已就绪，等待用户打开侧边栏后开始构建...');

      // 监听侧边栏打开事件（不一次性移除，支持取消后重新构建）
      window.addEventListener('zhiye-sidebar-opened', () => {
        const currentUrl = location.href;
        // 如果URL变化了，需要重新构建
        if (lastBuiltUrl && lastBuiltUrl !== currentUrl) {
          shouldBuild = true;
          console.log('[智页AI] 页面已切换，需要重新构建:', currentUrl);
        }
        if (shouldBuild && !isBuilding) {
          shouldBuild = false;
          lastBuiltUrl = currentUrl;
          // 立即设置构建状态，确保覆盖层先显示
          sidebarCtrl.setBuildStatus('parsing', '正在解析页面内容...');
          buildKnowledgeBaseAsync();
        }
      });

      // 监听重试构建事件
      window.addEventListener('zhiye-sidebar-retry-build', () => {
        if (!isBuilding) {
          sidebarCtrl.setBuildStatus('parsing', '正在解析页面内容...');
          buildKnowledgeBaseAsync();
        }
      });

      // 监听构建取消事件（用户在构建中关闭侧边栏）
      window.addEventListener('zhiye-sidebar-build-cancel', () => {
        if (isBuilding) {
          buildCancelled = true;
          console.log('[智页AI] 用户取消构建');
        }
      });

      // 监听URL变化（SPA导航等），侧边栏打开时自动构建新知识库
      _initUrlChangeWatcher();
    } catch (err) {
      console.error('[智页AI] 初始化失败:', err);
    }
  }

  /**
   * 初始化URL变化监听器，用于侧边栏已打开时自动检测页面切换
   */
  function _initUrlChangeWatcher() {
    let lastUrl = location.href;

    const checkUrlChange = async () => {
      const currentUrl = location.href;
      if (currentUrl === lastUrl) return;
      lastUrl = currentUrl;

      // 只有侧边栏打开时才处理
      if (!sidebarCtrl?.isOpen) return;

      console.log('[智页AI] 检测到URL变化:', currentUrl);

      // 检查是否已有该URL的知识库
      const data = await ZhiYeUtils.storageGet('zhiye_knowledge_bases');
      const kbs = data?.zhiye_knowledge_bases || {};

      if (kbs[currentUrl]) {
        // 已有知识库，加载并更新UI
        console.log('[智页AI] 该URL已有知识库，加载已有数据');
        await _loadExistingKnowledgeBase(currentUrl);
        return;
      }

      // 没有知识库，需要自动构建
      console.log('[智页AI] 新页面，自动触发知识库构建');
      if (!isBuilding) {
        shouldBuild = false;
        lastBuiltUrl = currentUrl;
        sidebarCtrl.setBuildStatus('parsing', '正在解析页面内容...');
        buildKnowledgeBaseAsync();
      }
    };

    // 定时轮询（处理hash变化、history API等）
    setInterval(checkUrlChange, 800);

    // 监听popstate（浏览器前进/后退）
    window.addEventListener('popstate', checkUrlChange);

    // Hook history.pushState / replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(checkUrlChange, 100);
    };
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(checkUrlChange, 100);
    };
  }

  /**
   * 加载已有知识库数据到侧边栏
   */
  async function _loadExistingKnowledgeBase(url) {
    try {
      const data = await ZhiYeUtils.storageGet('zhiye_knowledge_bases');
      const kbs = data?.zhiye_knowledge_bases || {};
      const kb = kbs[url];
      if (!kb) return;

      // 反序列化知识图谱
      if (kb.nodes && typeof KnowledgeGraph !== 'undefined') {
        kg = KnowledgeGraph.deserialize(kb);
      }

      // 加载融合图
      const fusedKG = await loadFusedKnowledgeGraph(url);
      if (fusedKG) {
        kg = fusedKG;
      }

      if (kg) {
        sidebarCtrl.kg = kg;
        sidebarCtrl.rag = new RAGEngine(kg, aiClient);
        sidebarCtrl.codeGen = new CodeGenerator(kg, aiClient);
      }

      // 更新解析器信息
      parser = { parsed: { title: kb.docMeta?.title || document.title, url } };
      sidebarCtrl.parser = parser;
      sidebarCtrl.updateWelcomeMessage();

      lastBuiltUrl = url;
      console.log('[智页AI] 已有知识库加载完成');
    } catch (e) {
      console.warn('[智页AI] 加载已有知识库失败:', e);
    }
  }

  async function buildKnowledgeBaseAsync() {
    if (isBuilding) return;
    isBuilding = true;
    buildCancelled = false;
    sidebarCtrl.setBuildStatus('parsing', '正在解析页面内容...');

    try {
      // 解析网页
      parser = new WebParser();
      const parsed = parser.parseDocument();
      console.log('[智页AI] 页面解析完成:', parsed.title, '| 段落:', parsed.paragraphs.length, '| 代码块:', parsed.codeBlocks.length);

      if (buildCancelled) { console.log('[智页AI] 构建已取消'); return; }

      sidebarCtrl.setBuildStatus('building', '正在构建知识图谱...');

      // 构建当前页面的知识图谱
      kg = KnowledgeGraph.buildFromParsed(parsed);
      console.log('[智页AI] 知识图谱构建完成:', kg.nodesArray().length, '节点,', kg.edgesArray().length, '关系');

      // 填充向量存储
      sidebarCtrl.setBuildStatus('vectorizing', '正在生成文档向量...');
      await populateVectorStore(parsed);

      if (buildCancelled) { console.log('[智页AI] 构建已取消'); return; }

      // 同源图融合：将当前页面图谱融合到同源组的融合图中
      sidebarCtrl.setBuildStatus('fusing', '正在融合同源知识图谱...');
      await fuseWithOriginGroup(kg, location.href);

      // 整合同组下所有已有的知识来源
      await _fuseAllGroupSources();

      if (buildCancelled) { console.log('[智页AI] 构建已取消'); return; }

      // 加载融合后的知识图谱（包含同源其他页面的知识）
      const fusedKG = await loadFusedKnowledgeGraph(location.href);
      if (fusedKG) {
        kg = fusedKG;
        console.log('[智页AI] 融合知识图谱加载完成:', kg.nodesArray().length, '节点,', kg.edgesArray().length, '关系');
      }

      // 更新侧边栏
      sidebarCtrl.parser = parser;
      sidebarCtrl.kg = kg;
      sidebarCtrl.rag = new RAGEngine(kg, aiClient);
      sidebarCtrl.codeGen = new CodeGenerator(kg, aiClient);
      sidebarCtrl.updateWelcomeMessage();

      // 双重检查：确保rag已正确初始化
      if (!sidebarCtrl.rag) {
        throw new Error('RAG引擎初始化失败');
      }

      sidebarCtrl.setBuildStatus('ready', '知识库就绪');

      // 保存
      await saveKnowledgeBase();
      await sidebarCtrl._saveVectorStore();

      // 通知background
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'pageParsed',
          data: {
            url: location.href,
            title: parsed.title,
            nodeCount: kg.nodesArray().length,
            isTechDoc: parser.isTechDoc()
          }
        });
      }

      console.log('[智页AI] 知识库构建完成');
    } catch (err) {
      console.error('[智页AI] 知识库构建失败:', err);
      // 友好错误信息，隐藏技术细节
      let userMsg = '知识库构建失败';
      if (err.message.includes('is not a function')) {
        userMsg = '知识图谱数据格式异常，请刷新页面后重试';
      }
      sidebarCtrl.setBuildStatus('error', userMsg);
    } finally {
      isBuilding = false;
      // 如果被取消，恢复shouldBuild使下次打开时重新构建
      if (buildCancelled) {
        shouldBuild = true;
        buildCancelled = false;
        // 清理构建状态
        sidebarCtrl.setBuildStatus('ready', '');
        sidebarCtrl.sidebar.classList.remove('zy-building');
      }
    }
  }

  /**
   * 同源图融合：将当前页面图谱融合到同源组的融合图中
   */
  async function fuseWithOriginGroup(newGraph, url) {
    if (!newGraph || typeof GraphFusion === 'undefined') return;

    const groupId = GraphFusion.getOriginGroup(url);
    console.log('[智页AI] 同源组:', groupId);

    // 读取已有的同源融合图
    const stored = await ZhiYeUtils.storageGet('zhiye_fused_graphs') || {};
    const fusedGraphs = stored.zhiye_fused_graphs || {};
    const existing = fusedGraphs[groupId];

    let fusedResult;
    if (existing) {
      // 反序列化已有图
      const existingGraph = KnowledgeGraph.deserialize(existing);
      // 融合（fuse是实例方法，需要创建实例）
      const fuser = new GraphFusion();
      const fusedPlain = fuser.fuse(existingGraph, newGraph, url);
      // 将纯对象转换回KnowledgeGraph实例
      fusedResult = new KnowledgeGraph();
      fusedResult.docMeta = existingGraph.docMeta || {};
      (fusedPlain.nodes || []).forEach(n => fusedResult.addNode(n.id, n.type, n.label, n.meta, n.sources || []));
      (fusedPlain.edges || []).forEach(e => fusedResult.addEdge(e.source, e.target, e.relation, e.weight));
      console.log('[智页AI] 图融合完成，融合后:', fusedResult.nodesArray().length, '节点');
    } else {
      // 首次构建，直接使用当前图并标记来源
      newGraph.nodesArray().forEach(n => {
        if (!n.sources) n.sources = [url];
      });
      fusedResult = newGraph;
      console.log('[智页AI] 首次创建同源融合图');
    }

    // 保存融合图
    fusedGraphs[groupId] = {
      ...fusedResult.serialize(),
      groupId,
      updatedAt: Date.now()
    };
    await ZhiYeUtils.storageSet({ zhiye_fused_graphs: fusedGraphs });
  }

  /**
   * 将同组下所有已有的知识来源融合到融合图中
   */
  async function _fuseAllGroupSources() {
    if (!kg || typeof GraphFusion === 'undefined') return;
    
    const groupId = GraphFusion.getOriginGroup(location.href);
    const stored = await ZhiYeUtils.storageGet('zhiye_knowledge_bases') || {};
    const kbs = stored.zhiye_knowledge_bases || {};
    
    // 获取同组下所有非当前URL且有实际节点数据的来源
    const groupSources = Object.entries(kbs).filter(([url, kb]) => {
      if (url === location.href) return false;
      if (!kb.groupId || kb.groupId !== groupId) return false;
      if (!kb.nodes || kb.nodes.length === 0) return false;
      return true;
    });
    
    if (groupSources.length === 0) return;
    
    console.log(`[智页AI] 检测到同组有 ${groupSources.length} 个已解析来源，开始整合...`);
    
    // 读取当前融合图
    const fusedStored = await ZhiYeUtils.storageGet('zhiye_fused_graphs') || {};
    const fusedGraphs = fusedStored.zhiye_fused_graphs || {};
    let fusedResult = fusedGraphs[groupId];
    
    let currentGraph;
    if (fusedResult) {
      currentGraph = KnowledgeGraph.deserialize(fusedResult);
    } else {
      return; // 没有融合图，不需要处理
    }
    
    const fuser = new GraphFusion();
    let changed = false;
    
    for (const [url, kb] of groupSources) {
      try {
        const sourceGraph = KnowledgeGraph.deserialize(kb);
        // 检查融合图中是否已包含该来源
        let hasSource = false;
        sourceGraph.nodesArray().forEach(n => {
          if (n.sources && n.sources.includes(url)) hasSource = true;
        });
        if (hasSource) continue; // 已融合，跳过
        
        // 融合
        const fusedPlain = fuser.fuse(currentGraph, sourceGraph, url);
        const merged = new KnowledgeGraph();
        merged.docMeta = currentGraph.docMeta || {};
        (fusedPlain.nodes || []).forEach(n => merged.addNode(n.id, n.type, n.label, n.meta, n.sources || []));
        (fusedPlain.edges || []).forEach(e => merged.addEdge(e.source, e.target, e.relation, e.weight));
        currentGraph = merged;
        changed = true;
        console.log(`[智页AI] 已融合来源: ${url}`);
      } catch (e) {
        console.warn(`[智页AI] 融合来源 ${url} 失败:`, e);
      }
    }
    
    if (changed) {
      fusedGraphs[groupId] = {
        ...currentGraph.serialize(),
        groupId,
        updatedAt: Date.now()
      };
      await ZhiYeUtils.storageSet({ zhiye_fused_graphs: fusedGraphs });
      console.log('[智页AI] 同组来源整合完成');
    }
  }

  /**
   * 加载同源融合后的知识图谱
   */
  async function loadFusedKnowledgeGraph(url) {
    if (typeof GraphFusion === 'undefined') return null;

    const groupId = GraphFusion.getOriginGroup(url);
    const stored = await ZhiYeUtils.storageGet('zhiye_fused_graphs') || {};
    const fusedGraphs = stored.zhiye_fused_graphs || {};
    const data = fusedGraphs[groupId];
    if (!data) return null;

    return KnowledgeGraph.deserialize(data);
  }

  /**
   * 保存知识库（按URL存储，同时记录同源组信息）
   */
  async function saveKnowledgeBase() {
    if (!kg) return;
    const url = location.href;
    const groupId = typeof GraphFusion !== 'undefined' ? GraphFusion.getOriginGroup(url) : url;

    const stored = await ZhiYeUtils.storageGet('zhiye_knowledge_bases') || {};
    const kbs = stored.zhiye_knowledge_bases || {};

    const serialized = kg.serialize();
    // 始终用当前页面的真实信息覆盖 docMeta（融合图的 docMeta 可能是其他页面的）
    if (!serialized.docMeta) serialized.docMeta = {};
    serialized.docMeta.url = url;
    serialized.docMeta.title = parser?.parsed?.title || document.title || url;

    kbs[url] = {
      ...serialized,
      url,
      groupId,
      updatedAt: Date.now()
    };

    // 限制存储条数（按同源组合并计算）
    const entries = Object.entries(kbs);
    if (entries.length > 30) {
      entries.sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0));
      const trimmed = Object.fromEntries(entries.slice(0, 30));
      await ZhiYeUtils.storageSet({ zhiye_knowledge_bases: trimmed });
    } else {
      await ZhiYeUtils.storageSet({ zhiye_knowledge_bases: kbs });
    }
  }

  // 监听来自popup/background的消息
  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      (async () => {
        switch (request.action) {
          case 'toggleSidebar':
            sidebarCtrl?.toggle();
            sendResponse({ success: true, isOpen: sidebarCtrl?.isOpen });
            break;
          case 'openSidebar':
            sidebarCtrl?.open();
            sendResponse({ success: true });
            break;
          case 'getPageInfo':
            sendResponse({
              success: true,
              title: parser?.parsed?.title,
              url: location.href,
              nodeCount: kg?.nodesArray().length || 0,
              isTechDoc: parser?.isTechDoc() || false,
              isBuilding
            });
            break;
          case 'askQuestion':
            sidebarCtrl?.open();
            if (request.question) {
              if (sidebarCtrl.inputEl) sidebarCtrl.inputEl.value = request.question;
              if (kg) {
                sidebarCtrl._sendMessage();
              } else {
                sidebarCtrl._addMessage('ai', '知识库正在构建中，请稍后再试...');
              }
            }
            sendResponse({ success: true });
            break;
          case 'getKnowledgeGraph':
            sendResponse({ success: true, data: kg?.serialize() });
            break;
          case 'removeKnowledgeSource':
            // 删除指定URL的知识，同时从融合图中移除
            if (request.url) {
              await removeKnowledgeSource(request.url);
              sendResponse({ success: true });
            } else {
              sendResponse({ success: false, error: '缺少url参数' });
            }
            break;
          default:
            sendResponse({ success: false, error: '未知操作' });
        }
      })();
      return true;
    });
  }

  /**
   * 删除指定URL的知识内容（包括向量库和融合图）
   */
  async function removeKnowledgeSource(url) {
    // 1. 从知识库存储中删除
    const stored = await ZhiYeUtils.storageGet('zhiye_knowledge_bases') || {};
    const kbs = stored.zhiye_knowledge_bases || {};
    delete kbs[url];
    await ZhiYeUtils.storageSet({ zhiye_knowledge_bases: kbs });

    // 2. 从向量库中删除该URL的所有文档
    if (sidebarCtrl?.vectorStore) {
      const allDocs = sidebarCtrl.vectorStore._documents || new Map();
      const toRemove = [];
      allDocs.forEach((doc, id) => {
        if (id.startsWith(url)) toRemove.push(id);
      });
      toRemove.forEach(id => sidebarCtrl.vectorStore.deleteDocument(id));
      await sidebarCtrl._saveVectorStore();
    }

    // 3. 从融合图中移除该来源
    if (typeof GraphFusion !== 'undefined') {
      const groupId = GraphFusion.getOriginGroup(url);
      const fusedStored = await ZhiYeUtils.storageGet('zhiye_fused_graphs') || {};
      const fusedGraphs = fusedStored.zhiye_fused_graphs || {};
      const data = fusedGraphs[groupId];
      if (data) {
        const graph = KnowledgeGraph.deserialize(data);
        const cleaned = GraphFusion.removeSource(graph, url);
        if (cleaned.nodes.length > 0) {
          fusedGraphs[groupId] = { ...cleaned, groupId, updatedAt: Date.now() };
        } else {
          delete fusedGraphs[groupId];
        }
        await ZhiYeUtils.storageSet({ zhiye_fused_graphs: fusedGraphs });
      }
    }

    // 4. 重置内存中的知识图谱和 RAG 引擎，并刷新知识图谱面板
    if (kg && (location.href === url || GraphFusion.getOriginGroup(location.href) === groupId)) {
      kg = null;
    }
    if (sidebarCtrl) {
      sidebarCtrl.kg = kg;
      sidebarCtrl.rag = null;
      sidebarCtrl.codeGen = null;
      // 如果当前正在查看知识库面板，重新渲染
      if (sidebarCtrl.currentTab === 'kb' && (sidebarCtrl.kbSubTab === 'graph' || sidebarCtrl.kbSubTab === 'vector')) {
        sidebarCtrl._renderKBPanel(sidebarCtrl.kbSubTab);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
