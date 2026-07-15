/**
 * 智页AI - 侧边栏UI控制器
 * 管理问答界面、划词菜单、知识库（向量+知识图谱）、可拖拽宽度
 */

class SidebarController {
  constructor() {
    this.sidebar = null;
    this.fab = null;
    this.contextMenu = null;
    this.tooltip = null;
    this.resizeHandle = null;
    this.isOpen = false;
    this.currentTab = 'chat';
    this.kbSubTab = 'vector'; // vector | graph | search | sources
    this.messages = [];
    this.kg = null;
    this.rag = null;
    this.codeGen = null;
    this.aiClient = null;
    this.parser = null;
    this.vectorStore = null;
    this.isTyping = false;
    this.buildStatusText = '就绪';
    this.minWidth = 400;
    this.currentWidth = 400;
    this.embeddingClient = null;
    this.rerankerClient = null;
    this.detailPopup = null;
  }

  async init(parser, kg, aiClient) {
    this.parser = parser;
    this.kg = kg;
    this.aiClient = aiClient;
    if (kg) {
      this.rag = new RAGEngine(kg, aiClient);
      this.codeGen = new CodeGenerator(kg, aiClient);
    }
    this.vectorStore = new VectorStore();

    this._createFAB();
    this._createSidebar();
    this._bindEvents();
    this._initResize();

    await this._loadHistory();
    await this._loadVectorStore();
    this._initEmbeddingClients();
  }

  _createFAB() {
    this.fab = ZhiYeUtils.createEl('button', { id: 'zhiye-ai-fab', title: '打开智页AI' }, ['AI']);
    document.body.appendChild(this.fab);
  }

  _createSidebar() {
    this.sidebar = ZhiYeUtils.createEl('div', { id: 'zhiye-ai-sidebar' });

    // Header（Tab移到标题右侧）
    const header = ZhiYeUtils.createEl('div', { class: 'zy-header' }, [
      ZhiYeUtils.createEl('div', { class: 'zy-header-left' }, [
        ZhiYeUtils.createEl('div', { class: 'zy-logo', text: '智' }),
        ZhiYeUtils.createEl('span', { class: 'zy-title', text: '智页AI' }),
        // Tab放在标题右侧同级
        ZhiYeUtils.createEl('div', { class: 'zy-header-tabs' }, [
          ZhiYeUtils.createEl('button', { class: 'zy-tab zy-active', 'data-tab': 'chat', text: 'AI问答' }),
          ZhiYeUtils.createEl('button', { class: 'zy-tab', 'data-tab': 'kb', text: '知识库' })
        ])
      ]),
      ZhiYeUtils.createEl('div', { class: 'zy-header-btns' }, [
        ZhiYeUtils.createEl('button', { class: 'zy-header-btn', id: 'zy-btn-clear', title: '清除记录' }, ['🗑']),
        ZhiYeUtils.createEl('button', { class: 'zy-header-btn', id: 'zy-btn-settings', title: '设置' }, ['⚙']),
        ZhiYeUtils.createEl('button', { class: 'zy-header-btn', id: 'zy-btn-close', title: '关闭' }, ['✕'])
      ])
    ]);

    // Content
    const content = ZhiYeUtils.createEl('div', { class: 'zy-content', id: 'zy-content' });

    // Build overlay (放在content和inputArea之间，独立于content渲染)
    const buildOverlay = ZhiYeUtils.createEl('div', { id: 'zy-build-overlay', class: 'zy-build-overlay', style: 'display:none' });

    // Input area - 大圆角容器，工具栏在内部底部，发送按钮浮动右下角
    const inputArea = ZhiYeUtils.createEl('div', { class: 'zy-input-area', id: 'zy-input-area' }, [
      ZhiYeUtils.createEl('div', { class: 'zy-input-container' }, [
        ZhiYeUtils.createEl('textarea', { class: 'zy-input', id: 'zy-input', placeholder: '输入问题，按Enter发送...', rows: '1' }),
        ZhiYeUtils.createEl('div', { class: 'zy-input-toolbar' }, [
          ZhiYeUtils.createEl('div', { class: 'zy-input-tools' }, [
            ZhiYeUtils.createEl('button', { class: 'zy-tool-btn zy-tool-active', 'data-mode': 'qa', text: '问答' }),
            ZhiYeUtils.createEl('button', { class: 'zy-tool-btn', 'data-mode': 'explain', text: '解释' }),
            ZhiYeUtils.createEl('button', { class: 'zy-tool-btn', 'data-mode': 'summary', text: '总结' }),
            ZhiYeUtils.createEl('button', { class: 'zy-tool-btn', 'data-mode': 'code', text: '代码' }),
            ZhiYeUtils.createEl('button', { class: 'zy-tool-btn', 'data-mode': 'api_check', text: 'API校验' })
          ]),
          ZhiYeUtils.createEl('button', { class: 'zy-send-btn', id: 'zy-send', title: '发送' }, [
            ZhiYeUtils.createEl('span', { class: 'zy-send-icon', text: '➤' }),
            ZhiYeUtils.createEl('span', { class: 'zy-send-spinner' })
          ])
        ])
      ])
    ]);

    // Resize handle (left edge)
    const resizeHandle = ZhiYeUtils.createEl('div', { class: 'zy-resize-handle', id: 'zy-resize-handle' });

    this.sidebar.append(resizeHandle, header, content, buildOverlay, inputArea);
    document.body.appendChild(this.sidebar);

    this.contentEl = content;
    this.inputEl = this.sidebar.querySelector('#zy-input');
    this.sendBtn = this.sidebar.querySelector('#zy-send');
    this.statusDot = null;
    this.statusText = null;
    this.thinkingMsgEl = null;

    this._renderTab('chat');
  }

  _createContextMenu() {
    this.contextMenu = ZhiYeUtils.createEl('div', { id: 'zhiye-ai-context-menu' }, [
      ZhiYeUtils.createEl('div', { class: 'zy-ctx-item', 'data-action': 'ask' }, ['💬 提问选中内容']),
      ZhiYeUtils.createEl('div', { class: 'zy-ctx-item', 'data-action': 'explain' }, ['📖 解释选中内容']),
      ZhiYeUtils.createEl('div', { class: 'zy-ctx-item', 'data-action': 'code' }, ['💻 生成相关代码']),
      ZhiYeUtils.createEl('div', { class: 'zy-ctx-divider' }),
      ZhiYeUtils.createEl('div', { class: 'zy-ctx-item', 'data-action': 'summarize' }, ['📝 总结页面'])
    ]);
    document.body.appendChild(this.contextMenu);
  }

  _createSelectionTooltip() {
    this.tooltip = ZhiYeUtils.createEl('div', { id: 'zhiye-ai-selection-tooltip', text: '💬 提问' });
    document.body.appendChild(this.tooltip);
  }

  /* ========== Resize drag ========== */

  _initResize() {
    this.resizeHandle = this.sidebar.querySelector('#zy-resize-handle');
    let startX, startW;
    const onMouseMove = (e) => {
      const delta = startX - e.clientX;
      const newW = Math.max(this.minWidth, Math.min(window.innerWidth * 0.7, startW + delta));
      this.currentWidth = newW;
      this.sidebar.style.width = newW + 'px';
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      // 保存宽度偏好
      ZhiYeUtils.storageSet({ zhiye_sidebar_width: this.currentWidth });
    };
    this.resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startX = e.clientX;
      startW = this.sidebar.offsetWidth;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    // Restore saved width
    ZhiYeUtils.storageGet('zhiye_sidebar_width').then(data => {
      if (data?.zhiye_sidebar_width && data.zhiye_sidebar_width > this.minWidth) {
        this.currentWidth = data.zhiye_sidebar_width;
        this.sidebar.style.width = this.currentWidth + 'px';
      }
    });
  }

  _bindEvents() {
    this.fab.addEventListener('click', () => this.toggle());
    this.sidebar.querySelector('#zy-btn-close').addEventListener('click', () => this.close());
    this.sidebar.querySelector('#zy-btn-settings').addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime) chrome.runtime.sendMessage({ action: 'openOptions' });
    });
    this.sidebar.querySelector('#zy-btn-clear').addEventListener('click', () => this._clearChatHistory());

    // Tab切换
    this.sidebar.querySelectorAll('.zy-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // 构建期间禁止切换tab
        if (this.sidebar.classList.contains('zy-building')) return;
        this.sidebar.querySelectorAll('.zy-tab').forEach(t => t.classList.remove('zy-active'));
        tab.classList.add('zy-active');
        this.currentTab = tab.dataset.tab;
        this._renderTab(this.currentTab);
      });
    });

    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // 构建期间禁止发送
        if (this.sidebar.classList.contains('zy-building')) {
          this._showToast('知识库构建中，请稍后再试');
          return;
        }
        this._sendMessage();
      }
    });
    this.sendBtn.addEventListener('click', () => this._sendMessage());

    // textarea 自动增高
    this.inputEl.addEventListener('input', () => {
      this.inputEl.style.height = 'auto';
      const newHeight = Math.min(this.inputEl.scrollHeight, 160);
      this.inputEl.style.height = newHeight + 'px';
    });

    // 模式按钮（高亮当前选中）
    this.sidebar.querySelectorAll('.zy-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sidebar.querySelectorAll('.zy-tool-btn').forEach(b => b.classList.remove('zy-tool-active'));
        btn.classList.add('zy-tool-active');
        this.inputEl.dataset.mode = btn.dataset.mode;
      });
    });

    // 不再监听划词和右键菜单（功能已移除）
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
  }

  toggle() { this.isOpen ? this.close() : this.open(); }
  open() {
    this.isOpen = true;
    this.fab.classList.add('hidden');
    // 使用 visibility + transition 而非 display，确保第二次打开时按钮先隐藏、侧边栏立即可见
    this.sidebar.classList.add('zy-open');
    // 等过渡完成后再聚焦
    setTimeout(() => { if (this.isOpen) this.inputEl.focus(); }, 50);
    // 通知content.js侧边栏已打开（触发构建）
    window.dispatchEvent(new CustomEvent('zhiye-sidebar-opened'));
  }
  close() {
    this.isOpen = false;
    this.sidebar.classList.remove('zy-open');
    if (this.contextMenu) this.contextMenu.style.display = 'none';
    if (this.tooltip) this.tooltip.style.display = 'none';
    // FAB通过CSS过渡显示，与侧边栏滑出动画同步
    this.fab.classList.remove('hidden');
    // 如果正在构建，通知取消构建
    if (this.sidebar.classList.contains('zy-building')) {
      window.dispatchEvent(new CustomEvent('zhiye-sidebar-build-cancel'));
    }
  }

  /* ========== Tab渲染 ========== */

  _renderTab(tab) {
    this.contentEl.innerHTML = '';
    const inputArea = this.sidebar.querySelector('#zy-input-area');
    switch (tab) {
      case 'chat':
        if (inputArea) inputArea.style.display = '';
        this._renderChatTab();
        break;
      case 'kb':
        if (inputArea) inputArea.style.display = 'none';
        this._renderKBTab();
        break;
    }
  }

  /* ---------- 问答 Tab ---------- */

  _renderChatTab() {
    // 已清空标记：不显示任何内容
    if (this._clearedHistory) {
      this.contentEl.innerHTML = '';
      return;
    }
    const messagesContainer = ZhiYeUtils.createEl('div', { class: 'zy-messages', id: 'zy-messages' });
    if (this.messages.length === 0) {
      messagesContainer.appendChild(ZhiYeUtils.createEl('div', { class: 'zy-message zy-message-ai' }, [
        ZhiYeUtils.createEl('div', { class: 'zy-avatar zy-avatar-ai', text: '智' }),
        ZhiYeUtils.createEl('div', { class: 'zy-bubble', html: this._getWelcomeMessage() })
      ]));
      const quickActions = ZhiYeUtils.createEl('div', { class: 'zy-quick-actions' }, [
        this._createQuickBtn('问', '快速问答', '基于当前页面内容提问', '页面有哪些核心内容？'),
        this._createQuickBtn('码', '生成代码', '根据文档生成可运行代码', '帮我生成一个基础示例代码'),
        this._createQuickBtn('总', '总结页面', '提炼页面核心内容', '总结这篇文档的核心内容'),
        this._createQuickBtn('检', 'API校验', '检查代码API合规性', '帮我检查代码的API使用')
      ]);
      messagesContainer.appendChild(quickActions);
    } else {
      this.messages.forEach(msg => messagesContainer.appendChild(this._createMessageEl(msg)));
    }
    this.contentEl.appendChild(messagesContainer);
    this._scrollToBottom();
  }

  _getWelcomeMessage() {
    const url = this.kg?.docMeta?.url || location.href;
    const isTech = this.parser?.isTechDoc();
    const nodeCount = this.kg?.nodesArray().length || 0;
    const apiCount = this.kg?.nodesArray().filter(n => n.type === 'api').length || 0;
    const vecCount = this.vectorStore?.getStats?.().documentCount || 0;

    // 同源融合信息
    const sources = new Set();
    this.kg?.nodesArray().forEach(n => {
      if (n.sources) n.sources.forEach(s => sources.add(s));
    });
    const sourceCount = sources.size || 1;
    const isFused = sourceCount > 1;

    if (!this.kg || nodeCount === 0) {
      return `你好，我是<b>智页AI</b>，基于知识图谱的智能问答助手。<br>
        <span style="color:var(--zy-text-secondary)">支持页面内容问答、总结与知识梳理。</span>`;
    }
    return `<b>已解析页面</b> · <b>${nodeCount}</b>节点 · <b>${apiCount}</b>API<br>
      <span style="font-size:12px;color:var(--zy-text-secondary)">${url}</span><br>
      ${isFused ? `<span style="font-size:12px;color:var(--zy-accent)">🔗 已融合 ${sourceCount} 个同源页面知识</span><br>` : ''}
      向量库：<b>${vecCount}</b>条文档 · BM25检索<br>
      ${isTech ? '检测到技术文档，支持API问答与代码生成。' : '支持页面内容问答、总结与知识梳理。'}<br>
      <span style="color:var(--zy-text-secondary)">输入问题开始对话。</span>`;
  }

  _createQuickBtn(icon, label, desc, query) {
    const btn = ZhiYeUtils.createEl('button', { class: 'zy-quick-btn' }, [
      ZhiYeUtils.createEl('span', { class: 'zy-quick-icon', text: icon }),
      ZhiYeUtils.createEl('span', { class: 'zy-quick-label', text: label }),
      ZhiYeUtils.createEl('span', { class: 'zy-quick-desc', text: desc })
    ]);
    btn.addEventListener('click', () => { this.inputEl.value = query; this._sendMessage(); });
    return btn;
  }

  /* ---------- 知识库 Tab ---------- */

  _renderKBTab() {
    const subtabs = [
      { key: 'vector', label: '向量库' },
      { key: 'graph', label: '知识图谱' },
      { key: 'search', label: '知识检索' },
      { key: 'sources', label: '知识来源' }
    ];
    this.contentEl.innerHTML = `
      <div class="zy-kb-subtabs">
        ${subtabs.map(t => `<button class="zy-kb-subtab ${t.key === this.kbSubTab ? 'zy-active' : ''}" data-subtab="${t.key}">${t.label}</button>`).join('')}
      </div>
      <div id="zy-kb-panel"></div>
    `;

    this.sidebar.querySelectorAll('.zy-kb-subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sidebar.querySelectorAll('.zy-kb-subtab').forEach(b => b.classList.remove('zy-active'));
        btn.classList.add('zy-active');
        this.kbSubTab = btn.dataset.subtab;
        this._renderKBPanel(btn.dataset.subtab);
      });
    });

    this._renderKBPanel(this.kbSubTab);
  }

  async _renderKBPanel(subtab) {
    const panel = this.contentEl.querySelector('#zy-kb-panel');
    if (!panel) return;
    panel.innerHTML = '';
    switch (subtab) {
      case 'vector': await this._renderVectorPanel(panel); break;
      case 'graph': await this._renderGraphPanel(panel); break;
      case 'search': this._renderSearchPanel(panel); break;
      case 'sources': this._renderSourcesPanel(panel); break;
    }
  }

  /* --- 向量库面板 --- */
  async _renderVectorPanel(panel) {
    // 按组加载所有知识来源的数据
    const groupId = typeof GraphFusion !== 'undefined' ? GraphFusion.getOriginGroup(location.href) : location.href;
    const data = await ZhiYeUtils.storageGet('zhiye_knowledge_bases') || {};
    const kbs = data.zhiye_knowledge_bases || {};
    
    // 找到同组所有来源
    const groupItems = Object.entries(kbs).filter(([url, kb]) => {
      const gid = kb.groupId || (typeof GraphFusion !== 'undefined' ? GraphFusion.getOriginGroup(url) : url);
      return gid === groupId;
    });
    
    // 统计：向量库使用内存中的vectorStore（已包含当前页面）
    let stats = this.vectorStore ? this.vectorStore.getStats() : { documentCount: 0, vocabularySize: 0, hasEmbeddingCount: 0 };
    
    // 文档列表从内存vectorStore读取（已包含当前页面的数据）
    const docs = this.vectorStore ? (this.vectorStore._documents || new Map()) : new Map();
    const docList = Array.from(docs.entries()).filter(([id, doc]) => doc.embedding && doc.embedding.length > 0).slice(0, 50);
    const typeIcons = { paragraph: '📄', heading: '📑', code: '💻', table: '📊', list: '📋', default: '📄' };

    let slicesHtml = '';
    if (docList.length === 0) {
      slicesHtml = '<div style="text-align:center;color:var(--zy-text-secondary);padding:20px;font-size:13px">暂无带向量的文档切片</div>';
    } else {
      slicesHtml = docList.map(([id, doc]) => {
        const meta = doc.meta || {};
        const type = meta.type || 'paragraph';
        const icon = typeIcons[type] || typeIcons.default;
        const fullText = doc.text || doc.content || '';
        const preview = fullText.substring(0, 80);
        const hasEmb = doc.embedding && doc.embedding.length > 0;
        const sourceUrl = meta.url || id;
        const pageTitle = meta.title || sourceUrl;
        const isCurrent = sourceUrl === location.href;
        // 只显示有意义的meta信息
        const metaParts = [];
        if (meta.language) metaParts.push(meta.language);
        if (meta.level) metaParts.push('H' + meta.level);
        return `
          <div class="zy-chunk-item" data-full-text="${this._escapeHtml(fullText)}">
            <span class="zy-chunk-icon">${icon}</span>
            <div class="zy-chunk-body">
              <div class="zy-chunk-text">${preview}${preview.length >= 80 ? '...' : ''}</div>
              <div class="zy-chunk-meta">
                <span class="zy-chunk-emb ${hasEmb ? 'has' : 'none'}">${hasEmb ? '🟢 向量' : '⚪ 无向量'}</span>
                ${metaParts.length ? '<span>' + metaParts.join(' · ') + '</span>' : ''}
                ${!isCurrent ? '<span style="color:var(--zy-text-secondary);font-size:10px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + this._escapeHtml(pageTitle) + '</span>' : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    panel.innerHTML = `
      <div class="zy-kb-card">
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <div class="zy-kg-stat"><b>${stats.documentCount || docs.size}</b> 文档</div>
          <div class="zy-kg-stat"><b>${stats.hasEmbeddingCount || 0}</b> 有向量</div>
          <div class="zy-kg-stat"><b>${stats.vocabularySize || 0}</b> 词汇</div>
          <div class="zy-kg-stat"><b>${groupItems.length}</b> 页面</div>
        </div>
      </div>
      <div class="zy-chunk-list" style="margin-top:10px;flex:1;max-height:none;overflow-y:auto">${slicesHtml}</div>
    `;
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.height = '100%';

    // 绑定点击显示完整内容弹窗
    panel.querySelectorAll('.zy-chunk-item').forEach(item => {
      item.addEventListener('click', () => {
        const fullText = item.getAttribute('data-full-text') || '';
        if (fullText) this._showDetailPopup('知识分块详情', fullText);
      });
    });
  }

  /* --- 知识图谱面板 --- */
  async _renderGraphPanel(panel) {
    // 优先加载融合图数据（展示同一组中所有来源的信息）
    let kgNodes = [];
    let kgEdges = [];
    const groupId = typeof GraphFusion !== 'undefined' ? GraphFusion.getOriginGroup(location.href) : location.href;
    try {
      const fusedData = await ZhiYeUtils.storageGet('zhiye_fused_graphs');
      const fusedGraphs = fusedData?.zhiye_fused_graphs || {};
      if (fusedGraphs[groupId]) {
        kgNodes = fusedGraphs[groupId].nodes || [];
        kgEdges = fusedGraphs[groupId].edges || [];
      }
    } catch (e) {}
    // 如果融合图没有数据，回退到当前页面的知识图谱
    if (kgNodes.length === 0 && this.kg) {
      kgNodes = this.kg.nodesArray();
      kgEdges = this.kg.edgesArray();
    }

    const stats = {
      nodes: kgNodes.length,
      edges: kgEdges.length,
      apis: kgNodes.filter(n => n.type === 'api').length,
      codes: kgNodes.filter(n => n.type === 'code').length
    };

    const isAiProcessing = this._aiFusingGraph || false;
    panel.innerHTML = `
      <div class="zy-kb-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div class="zy-kb-card-title" style="margin-bottom:0">知识图谱</div>
          <button id="zy-ai-fuse-btn" class="zy-tool-btn" style="border:1px solid var(--zy-primary);color:var(--zy-primary);${isAiProcessing ? 'opacity:0.5;cursor:not-allowed' : ''}" ${isAiProcessing ? 'disabled' : ''}>${isAiProcessing ? '⏳ 整合中...' : '🤖 AI整合'}</button>
        </div>
        <div class="zy-kg-stats">
          <div class="zy-kg-stat"><b>${stats.nodes}</b> 节点</div>
          <div class="zy-kg-stat"><b>${stats.edges}</b> 关系</div>
          <div class="zy-kg-stat"><b>${stats.apis}</b> API</div>
          <div class="zy-kg-stat"><b>${stats.codes}</b> 代码</div>
        </div>
        <div id="zy-kg-canvas-container" class="zy-kg-viz" style="position:relative;height:420px;min-height:300px;background:var(--zy-bg);border-radius:8px;overflow:hidden;margin-top:12px;flex:1">
          <div id="zy-kg-canvas-wrap" style="width:100%;height:100%;transform-origin:center center;transition:transform 0.2s ease;display:flex;align-items:center;justify-content:center">
            <div id="zy-kg-canvas" style="width:100%;height:100%;position:relative"></div>
          </div>
          <div id="zy-kg-legend" style="position:absolute;bottom:6px;left:6px;right:6px;display:flex;flex-wrap:wrap;gap:4px;z-index:4;pointer-events:none"></div>
          <div class="zy-kg-controls" style="position:absolute;top:8px;right:8px;display:flex;gap:4px;z-index:10;align-items:center">
            <button class="zy-kg-ctrl-btn" data-action="zoom-in" title="放大" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--zy-border);background:var(--zy-bg);color:var(--zy-text);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">+</button>
            <button class="zy-kg-ctrl-btn" data-action="zoom-out" title="缩小" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--zy-border);background:var(--zy-bg);color:var(--zy-text);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">-</button>
            <button class="zy-kg-ctrl-btn" data-action="zoom-reset" title="重置" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--zy-border);background:var(--zy-bg);color:var(--zy-text);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center">⟲</button>
          </div>
        </div>
      </div>
    `;
    this._renderKGCanvas(panel, kgNodes, kgEdges);

    // 缩放控制
    const container = panel.querySelector('#zy-kg-canvas-container');
    const wrap = panel.querySelector('#zy-kg-canvas-wrap');
    let scale = 1;
    const MIN_SCALE = 0.3;
    const MAX_SCALE = 3.0;

    const updateScale = (newScale) => {
      scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      wrap.style.transform = `scale(${scale})`;
    };

    panel.querySelectorAll('.zy-kg-ctrl-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'zoom-in') updateScale(scale + 0.2);
        else if (action === 'zoom-out') updateScale(scale - 0.2);
        else if (action === 'zoom-reset') updateScale(1);
      });
    });

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      updateScale(scale + delta);
    }, { passive: false });

    // AI整合按钮
    const aiFuseBtn = panel.querySelector('#zy-ai-fuse-btn');
    if (aiFuseBtn && !isAiProcessing) {
      aiFuseBtn.addEventListener('click', () => this._handleAIGraphFuse(groupId));
    }
  }

  /* --- 检索面板 --- */
  _renderSearchPanel(panel) {
    panel.innerHTML = `
      <div class="zy-kb-card">
        <div class="zy-kb-card-title">知识检索</div>
        <p style="font-size:12px;color:var(--zy-text-secondary);margin-bottom:10px">
          同时检索向量库和知识图谱，返回最相关的结果。
        </p>
        <div class="zy-input-box" style="margin-bottom:12px;border:1px solid var(--zy-border);border-radius:8px;padding:8px 12px;background:var(--zy-bg)">
          <input type="text" id="zy-search-input" placeholder="输入关键词检索..." style="border:none;outline:none;background:transparent;width:100%;font-size:13px;color:var(--zy-text)">
        </div>
        <div id="zy-search-results"></div>
      </div>
    `;
    const searchInput = panel.querySelector('#zy-search-input');
    const resultsEl = panel.querySelector('#zy-search-results');
    searchInput.addEventListener('input', ZhiYeUtils.debounce(() => {
      const query = searchInput.value.trim();
      if (!query) { resultsEl.innerHTML = ''; return; }

      let html = '';
      // 向量检索结果
      if (this.vectorStore) {
        const vecResults = this.vectorStore.search(query, 5);
        if (vecResults.length) {
          html += '<div style="font-size:12px;font-weight:600;color:var(--zy-accent);margin-bottom:6px">向量库匹配</div>';
          vecResults.forEach((r, idx) => {
            const text = r.text || '';
            html += `<div class="zy-search-result-item" data-idx="v${idx}" data-full-text="${this._escapeHtml(text)}" style="padding:8px;border:1px solid var(--zy-border);border-radius:8px;margin-bottom:6px;font-size:12px;cursor:pointer;transition:border-color 0.2s">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-weight:600;color:var(--zy-primary)">${r.meta?.title || r.id}</span>
                <span style="color:var(--zy-text-secondary);font-size:11px">${(r.score * 100).toFixed(1)}%</span>
              </div>
              <div class="zy-search-result-text" style="color:var(--zy-text-secondary);white-space:pre-wrap;word-break:break-word;line-height:1.6">${this._escapeHtml(text)}</div>
            </div>`;
          });
        }
      }
      // 知识图谱检索结果
      if (this.rag) {
        const kgResults = this.rag.search(query, 5);
        if (kgResults.length) {
          html += '<div style="font-size:12px;font-weight:600;color:var(--zy-accent);margin:10px 0 6px">知识图谱匹配</div>';
          kgResults.forEach((r, idx) => {
            const content = r.content || '';
            html += `<div class="zy-search-result-item" data-idx="k${idx}" data-full-text="${this._escapeHtml(content)}" style="padding:8px;border:1px solid var(--zy-border);border-radius:8px;margin-bottom:6px;font-size:12px;cursor:pointer;transition:border-color 0.2s">
              <div style="font-weight:600;color:var(--zy-primary);margin-bottom:4px">[${r.type}] ${r.label}</div>
              <div class="zy-search-result-text" style="color:var(--zy-text-secondary);white-space:pre-wrap;word-break:break-word;line-height:1.6">${this._escapeHtml(content)}</div>
            </div>`;
          });
        }
      }
      resultsEl.innerHTML = html || '<div style="text-align:center;color:var(--zy-text-secondary);padding:16px;font-size:13px">无匹配结果</div>';

      // 绑定点击显示完整内容弹窗
      resultsEl.querySelectorAll('.zy-search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const fullText = item.getAttribute('data-full-text') || '';
          if (fullText) this._showDetailPopup('检索结果详情', fullText);
        });
      });
    }, 300));
  }

  /* --- 知识来源面板 --- */
  _renderSourcesPanel(panel) {
    panel.innerHTML = `
      <div class="zy-kb-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div class="zy-kb-card-title" style="margin-bottom:0">知识来源管理</div>
          <button id="zy-add-source-btn" class="zy-tool-btn" style="border:1px solid var(--zy-primary);color:var(--zy-primary)">+ 添加地址</button>
        </div>
        <div id="zy-sources-list"></div>
      </div>
    `;
    const addBtn = panel.querySelector('#zy-add-source-btn');
    addBtn.addEventListener('click', () => {
      const url = prompt('输入要添加的网页地址：');
      if (url && url.startsWith('http')) {
        this._addSource(url);
      }
    });
    this._loadSourcesList();
  }

  async _loadSourcesList() {
    const listEl = this.contentEl.querySelector('#zy-sources-list');
    if (!listEl) return;
    const data = await ZhiYeUtils.storageGet('zhiye_knowledge_bases') || {};
    const kbs = data.zhiye_knowledge_bases || {};
    const entries = Object.entries(kbs).sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0));

    if (entries.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;color:var(--zy-text-secondary);padding:20px;font-size:13px">暂无知识来源<br>浏览网页时会自动构建</div>';
      return;
    }

    // 按同源组分组
    const groups = new Map();
    entries.forEach(([url, kb]) => {
      const groupId = kb.groupId || (typeof GraphFusion !== 'undefined' ? GraphFusion.getOriginGroup(url) : url);
      if (!groups.has(groupId)) groups.set(groupId, []);
      groups.get(groupId).push([url, kb]);
    });

    let html = '';
    let groupIndex = 0;
    for (const [groupId, items] of groups) {
      const pageCount = items.length;
      groupIndex++;
      const groupIdStr = `zy-source-group-${groupIndex}`;
      html += `
        <div class="zy-source-group" style="margin-bottom:12px;border:1px solid var(--zy-border);border-radius:10px;overflow:hidden;background:var(--zy-bg-secondary)">
          <div class="zy-source-group-header" data-group-target="${groupIdStr}" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:pointer;user-select:none">
            <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
              <span class="zy-source-group-arrow" style="transition:transform 0.2s;display:inline-block;transform:rotate(-90deg)">▼</span>
              <span style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${groupId}</span>
              <span style="font-size:11px;color:var(--zy-text-secondary);flex-shrink:0">${pageCount}页</span>
            </div>
            <button class="zy-source-group-del" data-group-id="${groupId}" title="删除整个组" style="margin-left:8px;width:28px;height:28px;border-radius:6px;border:none;background:transparent;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;color:var(--zy-text-secondary);opacity:0.5;transition:all 0.2s">🗑</button>
          </div>
          <div id="${groupIdStr}" class="zy-source-group-body" style="max-height:0;overflow:hidden;transition:max-height 0.3s ease">
            <div style="padding:0 12px 8px">
              ${items.map(([url, kb]) => {
                const title = kb.docMeta?.title || kb.pageTitle || (() => { try { return new URL(url).hostname } catch { return url } })();
                const nodeCount = kb.nodes?.length || 0;
                const date = kb.updatedAt ? new Date(kb.updatedAt).toLocaleString() : '';
                const isCurrent = url === location.href;
                return `
                  <div class="zy-source-item" data-url="${url}" style="border:1px solid var(--zy-border);padding:8px;border-radius:8px;transition:border-color 0.2s;display:flex;align-items:center;gap:8px;margin-bottom:6px">
                    <div style="flex:1;min-width:0">
                      <div style="font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${title} ${isCurrent ? '<span style="font-size:10px;background:var(--zy-primary);color:white;padding:1px 6px;border-radius:4px;margin-left:4px">当前</span>' : ''}</div>
                      <div style="font-size:11px;color:var(--zy-text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px">${url}</div>
                      <div style="font-size:11px;color:var(--zy-text-secondary);margin-top:2px">${nodeCount}节点 · ${date}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:4px;flex-shrink:0">
                      <button class="zy-source-goto" data-url="${url}" title="跳转到页面" style="background:transparent;border:none;cursor:pointer;font-size:16px;color:var(--zy-text-secondary);opacity:0.6;transition:opacity 0.2s;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px">🔗</button>
                      <button class="zy-source-del" data-url="${url}" title="删除此来源及其知识内容" style="background:transparent;border:none;cursor:pointer;font-size:16px;color:var(--zy-text-secondary);opacity:0.6;transition:opacity 0.2s;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px">🗑</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }
    listEl.innerHTML = html;

    // 展开/收起
    listEl.querySelectorAll('.zy-source-group-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.zy-source-group-del')) return;
        const targetId = header.dataset.groupTarget;
        const body = listEl.querySelector(`#${targetId}`);
        const arrow = header.querySelector('.zy-source-group-arrow');
        if (!body) return;
        if (body.style.maxHeight === '0px') {
          body.style.maxHeight = '9999px';
          if (arrow) arrow.style.transform = 'rotate(0deg)';
        } else {
          body.style.maxHeight = '0px';
          if (arrow) arrow.style.transform = 'rotate(-90deg)';
        }
      });
    });

    // 删除整个组
    listEl.querySelectorAll('.zy-source-group-del').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const groupId = btn.dataset.groupId;
        if (!confirm(`确定删除整个同源组？\n组ID: ${groupId}\n该组下所有页面的知识图谱和向量数据将一并移除。`)) return;
        for (const [gId, items] of groups) {
          if (gId === groupId) {
            for (const [url] of items) {
              await this._removeSource(url);
            }
            break;
          }
        }
        this._loadSourcesList();
      });
    });

    // 删除单个来源
    listEl.querySelectorAll('.zy-source-del').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = btn.dataset.url;
        if (!confirm(`确定删除此知识来源？\n${url}\n关联的知识图谱和向量数据将一并移除。`)) return;
        await this._removeSource(url);
        this._loadSourcesList();
      });
    });

    // 跳转到页面
    listEl.querySelectorAll('.zy-source-goto').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(btn.dataset.url, '_blank');
      });
    });
  }

  async _addSource(url) {
    const data = await ZhiYeUtils.storageGet('zhiye_knowledge_bases') || {};
    const kbs = data.zhiye_knowledge_bases || {};
    if (!kbs[url]) {
      const groupId = typeof GraphFusion !== 'undefined' ? GraphFusion.getOriginGroup(url) : url;
      kbs[url] = { docMeta: { title: '获取标题中...', url }, nodes: [], edges: [], updatedAt: Date.now(), groupId, pending: true };
      await ZhiYeUtils.storageSet({ zhiye_knowledge_bases: kbs });
      this._loadSourcesList();
      this._showToast('已添加地址，请在新标签页打开该网页以完成解析');
      // 异步获取页面实际标题
      this._fetchPageTitle(url).then(pageTitle => {
        if (pageTitle) {
          ZhiYeUtils.storageGet('zhiye_knowledge_bases').then(d => {
            const kbData = d?.zhiye_knowledge_bases || {};
            if (kbData[url]) {
              kbData[url].pageTitle = pageTitle;
              ZhiYeUtils.storageSet({ zhiye_knowledge_bases: kbData }).then(() => {
                this._loadSourcesList();
              });
            }
          });
        }
      });
    } else {
      this._showToast('该地址已在知识库中');
    }
  }

  async _fetchPageTitle(url) {
    try {
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      // 优先使用第一个 h1（更具体），其次使用 title 标签
      const h1 = doc.querySelector('h1');
      if (h1 && h1.textContent.trim()) {
        return h1.textContent.trim();
      }
      const title = doc.querySelector('title');
      if (title && title.textContent.trim()) {
        return title.textContent.trim();
      }
      return null; // 无法提取标题，返回 null 让后续解析填充
    } catch (err) {
      // CORS 或其他错误，不存储错误的标题，返回 null 让后续页面解析时使用真实标题
      return null;
    }
  }

  async _removeSource(url) {
    // 通过 content.js 的消息通道删除（联动融合图清理）
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'removeKnowledgeSource', url });
    }
    // 本地也做一次清理（兼容旧逻辑）
    const data = await ZhiYeUtils.storageGet('zhiye_knowledge_bases') || {};
    const kbs = data.zhiye_knowledge_bases || {};
    delete kbs[url];
    await ZhiYeUtils.storageSet({ zhiye_knowledge_bases: kbs });
    // 从向量库中移除
    if (this.vectorStore) {
      const allDocs = this.vectorStore._documents || new Map();
      const toRemove = [];
      allDocs.forEach((doc, id) => {
        if (id.startsWith(url)) toRemove.push(id);
      });
      toRemove.forEach(id => this.vectorStore.deleteDocument(id));
      await this._saveVectorStore();
    }
    // 从融合图中移除该来源（本地直接清理，不依赖消息通道）
    if (typeof GraphFusion !== 'undefined') {
      const groupId = GraphFusion.getOriginGroup(url);
      const fusedStored = await ZhiYeUtils.storageGet('zhiye_fused_graphs') || {};
      const fusedGraphs = fusedStored.zhiye_fused_graphs || {};
      const fusedData = fusedGraphs[groupId];
      if (fusedData) {
        const graph = KnowledgeGraph.deserialize(fusedData);
        const cleaned = GraphFusion.removeSource(graph, url);
        if (cleaned.nodes.length > 0) {
          fusedGraphs[groupId] = { ...cleaned, groupId, updatedAt: Date.now() };
        } else {
          delete fusedGraphs[groupId];
        }
        await ZhiYeUtils.storageSet({ zhiye_fused_graphs: fusedGraphs });
      }
    }
    // 重置内存中的知识图谱和 RAG 引擎
    const currentGroupId = typeof GraphFusion !== 'undefined' ? GraphFusion.getOriginGroup(location.href) : location.href;
    const removedGroupId = typeof GraphFusion !== 'undefined' ? GraphFusion.getOriginGroup(url) : url;
    if (location.href === url || currentGroupId === removedGroupId) {
      this.kg = null;
      this.rag = null;
      this.codeGen = null;
    }
    // 刷新当前知识库面板（统一通过 _renderKBPanel 重绘当前子标签页）
    if (this.currentTab === 'kb' && (this.kbSubTab === 'graph' || this.kbSubTab === 'vector')) {
      this._renderKBPanel(this.kbSubTab);
    }
  }

  /* ========== 知识图谱可视化 ========== */

  _renderKGCanvas(panel, nodes, edges) {
    const canvas = panel.querySelector('#zy-kg-canvas');
    if (!canvas) return;
    if (!nodes || nodes.length === 0) {
      canvas.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--zy-text-secondary);font-size:13px">暂无知识图谱数据</div>';
      return;
    }

    const typeColors = { api: '#f59e0b', code: '#22c55e', heading: '#8b5cf6', paragraph: '#64748b', table: '#0ea5e9', list: '#ec4899', document: '#2563eb' };

    // 渲染函数：确保容器有宽度后再绘制
    const render = () => {
      const W = canvas.clientWidth || 360;
      const H = canvas.clientHeight || 280;
      // 如果宽度为0，延迟重试
      if (W === 0 || H === 0) {
        requestAnimationFrame(render);
        return;
      }
      const cx = W / 2;
      const cy = H / 2;

      const vizNodes = nodes.slice(0, 30);
      const positions = new Map();

      // 力导向简化布局：多圈径向，自动适配容器大小
      const docNode = vizNodes.find(n => n.type === 'document');
      // 根据容器大小和节点数量动态计算最大半径
      const totalNodes = vizNodes.length;
      const maxRadius = Math.min(W, H) / 2 - 30; // 留30px边距
      const baseUnit = Math.max(30, Math.min(maxRadius / 4, 80)); // 每圈基础间距

      const groups = [
        { type: 'api', nodes: vizNodes.filter(n => n.type === 'api'), ring: 1, nodeR: Math.max(10, Math.min(16, maxRadius / 8)) },
        { type: 'code', nodes: vizNodes.filter(n => n.type === 'code'), ring: 2, nodeR: Math.max(10, Math.min(14, maxRadius / 9)) },
        { type: 'heading', nodes: vizNodes.filter(n => n.type === 'heading'), ring: 3, nodeR: Math.max(10, Math.min(13, maxRadius / 10)) },
        { type: 'other', nodes: vizNodes.filter(n => !['document', 'api', 'code', 'heading'].includes(n.type)), ring: 4, nodeR: Math.max(8, Math.min(10, maxRadius / 12)) }
      ];

      if (docNode) positions.set(docNode.id, { x: cx, y: cy, r: Math.max(12, Math.min(22, maxRadius / 5)) });

      groups.forEach(group => {
        const count = group.nodes.length;
        if (count === 0) return;
        const dist = baseUnit * group.ring + count * 2;
        // 均匀分布角度，不同组错开起始角度
        const startAngle = (group.ring - 1) * Math.PI / 6;
        group.nodes.forEach((n, i) => {
          const angle = startAngle + (2 * Math.PI * i) / count;
          positions.set(n.id, {
            x: cx + dist * Math.cos(angle),
            y: cy + dist * Math.sin(angle),
            r: group.nodeR
          });
        });
      });

      // 检测并解决重叠
      const posArr = [...positions.values()];
      for (let i = 0; i < posArr.length; i++) {
        for (let j = i + 1; j < posArr.length; j++) {
          const a = posArr[i], b = posArr[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.r + b.r + 4;
          if (dist < minDist && dist > 0) {
            const push = (minDist - dist) / 2;
            const nx = dx / dist, ny = dy / dist;
            a.x += nx * push; a.y += ny * push;
            b.x -= nx * push; b.y -= ny * push;
          }
        }
      }

      // 构建SVG（使用实际画布高度）
      let svgContent = `<svg width="${W}" height="${H}" style="position:absolute;top:0;left:0;width:100%;height:100%">`;
      edges.forEach(edge => {
        if (!positions.has(edge.source) || !positions.has(edge.target)) return;
        const s = positions.get(edge.source);
        const t = positions.get(edge.target);
        const opacity = Math.min(0.2 + edge.weight * 0.4, 0.6);
        svgContent += `<line x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}" stroke="#94a3b8" stroke-width="1" opacity="${opacity}" />`;
      });
      svgContent += '</svg>';

      let nodesHtml = '';
      vizNodes.forEach(node => {
        const pos = positions.get(node.id);
        if (!pos) return;
        const color = typeColors[node.type] || '#94a3b8';
        const label = node.label.length > 5 ? node.label.substring(0, 5) + '..' : node.label;
        nodesHtml += `
          <div class="kg-node" data-node-id="${node.id}" style="
            position:absolute;left:${pos.x - pos.r}px;top:${pos.y - pos.r}px;
            width:${pos.r * 2}px;height:${pos.r * 2}px;border-radius:50%;
            background:${color}22;border:2px solid ${color};
            display:flex;align-items:center;justify-content:center;
            font-size:${Math.max(8, pos.r - 5)}px;color:${color};
            cursor:pointer;z-index:2;
            text-align:center;padding:2px;line-height:1.1;
          ">${label}</div>`;
      });

      const legendItems = [...new Set(vizNodes.map(n => n.type))].map(t => {
        const c = typeColors[t] || '#94a3b8';
        return `<span style="display:inline-flex;align-items:center;gap:4px;margin-right:10px;font-size:11px;color:var(--zy-text-secondary)"><span style="width:8px;height:8px;border-radius:50%;background:${c}"></span>${t}</span>`;
      }).join('');

      canvas.innerHTML = svgContent + nodesHtml;
      // 图例写入独立的 legend 元素，不随 canvas 缩放
      const legendEl = panel.querySelector('#zy-kg-legend');
      if (legendEl) legendEl.innerHTML = legendItems;

      canvas.querySelectorAll('.kg-node').forEach(el => {
        el.addEventListener('click', () => {
          const node = nodes.find(n => n.id === el.dataset.nodeId);
          if (node) {
            const nodeInfo = [`类型: ${node.type}`, `名称: ${node.label}`];
            if (node.meta) {
              if (node.meta.content) nodeInfo.push(`内容:\n${node.meta.content}`);
              if (node.meta.summary) nodeInfo.push(`摘要: ${node.meta.summary}`);
              if (node.meta.code) nodeInfo.push(`代码:\n${node.meta.code}`);
              if (node.meta.heading) nodeInfo.push(`标题层级: ${node.meta.heading}`);
            }
            this._showDetailPopup(`节点详情 - ${node.label}`, nodeInfo.join('\n'));
          }
        });
      });
    };

    requestAnimationFrame(render);
  }

  _renderKGNodeList(panel) {
    const nodesEl = panel.querySelector('#zy-kg-nodes');
    if (!nodesEl || !this.kg) return;
    const typeIcons = { api: '🔧', code: '💻', heading: '📑', paragraph: '📄', table: '📊', list: '📋', document: '📄' };
    const typeColors = { api: '#f59e0b', code: '#22c55e', heading: '#8b5cf6', paragraph: '#64748b', table: '#0ea5e9', list: '#ec4899', document: '#2563eb' };
    this.kg.nodesArray().slice(0, 50).forEach(node => {
      const item = ZhiYeUtils.createEl('div', {
        style: `padding:8px 10px;border:1px solid var(--zy-border);border-radius:8px;margin-bottom:6px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:8px`
      }, [
        ZhiYeUtils.createEl('span', { style: `width:8px;height:8px;border-radius:50%;background:${typeColors[node.type] || '#94a3b8'};flex-shrink:0` }),
        ZhiYeUtils.createEl('span', { text: `${typeIcons[node.type] || '•'} [${node.type}] ${node.label}` })
      ]);
      item.addEventListener('click', () => {
        this.inputEl.value = `关于 "${node.label}" 的详细信息`;
        this.currentTab = 'chat';
        this.sidebar.querySelector('[data-tab="chat"]').click();
        this._sendMessage();
      });
      nodesEl.appendChild(item);
    });
  }

  /* ========== 消息处理 ========== */

  _createMessageEl(msg) {
    const isAI = msg.role === 'ai';
    return ZhiYeUtils.createEl('div', { class: `zy-message ${isAI ? 'zy-message-ai' : 'zy-message-user'}` }, [
      ZhiYeUtils.createEl('div', { class: `zy-avatar ${isAI ? 'zy-avatar-ai' : 'zy-avatar-user'}`, text: isAI ? '智' : '我' }),
      ZhiYeUtils.createEl('div', { class: 'zy-bubble', html: msg.html || this._markdownToHtml(msg.content) })
    ]);
  }

  _markdownToHtml(text) {
    const md = text || '';
    // 如果 marked 可用且未损坏，优先使用
    if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
      try {
        return marked.parse(md, { breaks: true });
      } catch (e) {}
    }
    // 内置轻量级 Markdown 解析器（备用）
    return this._simpleMarkdownToHtml(md);
  }

  _simpleMarkdownToHtml(md) {
    if (!md) return '';
    let html = md
      // 代码块
      .replace(/```([\w]*)([\s\S]*?)```/g, (_, lang, code) => `<pre class="zy-md-code-block"><code class="language-${lang || 'text'}">${this._escapeHtml(code.trim())}</code></pre>`)
      // 行内代码
      .replace(/`([^`]+)`/g, '<code class="zy-md-inline-code">$1</code>')
      // 粗体
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // 删除线
      .replace(/~~([^~]+)~~/g, '<del>$1</del>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="zy-md-link">$1</a>')
      // 分隔线
      .replace(/\n---\n/g, '\n<hr class="zy-md-hr">\n')
      .replace(/\n\*\*\*\n/g, '\n<hr class="zy-md-hr">\n')
      // 引用块
      .replace(/^> (.*$)/gim, '<blockquote class="zy-md-quote">$1</blockquote>')
      // 标题
      .replace(/^###### (.*$)/gim, '<h6 class="zy-md-h">$1</h6>')
      .replace(/^##### (.*$)/gim, '<h5 class="zy-md-h">$1</h5>')
      .replace(/^#### (.*$)/gim, '<h4 class="zy-md-h">$1</h4>')
      .replace(/^### (.*$)/gim, '<h3 class="zy-md-h">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="zy-md-h">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="zy-md-h">$1</h1>')
      // 无序列表
      .replace(/^\s*[-*+] (.*$)/gim, '<li class="zy-md-li">$1</li>')
      // 有序列表
      .replace(/^\s*\d+\. (.*$)/gim, '<li class="zy-md-li">$1</li>');

    // 包裹连续的 li 为 ul/ol
    html = html.replace(/(<li class="zy-md-li">.*?<\/li>\n?)+/g, match => {
      const isOrdered = /^\s*\d+\./.test(md.substring(md.indexOf(match.split('<li')[1]) - 10));
      const tag = isOrdered ? 'ol' : 'ul';
      return `<${tag} class="zy-md-list">${match}</${tag}>`;
    });

    // 段落处理：按空行分段
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      // 已经是块级元素则不再包裹
      if (/^<(h[1-6]|pre|blockquote|ul|ol|hr|div)/i.test(trimmed)) return trimmed;
      // 替换单个换行为 <br>
      const withBr = trimmed.replace(/\n/g, '<br>');
      return `<p class="zy-md-p">${withBr}</p>`;
    }).join('\n');

    return html;
  }

  _escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async _sendMessage() {
    // 构建期间禁止发送
    if (this.sidebar.classList.contains('zy-building')) {
      this._showToast('知识库构建中，请稍后再试');
      return;
    }
    const text = this.inputEl.value.trim();
    if (!text || this.isTyping) return;
    const mode = this.inputEl.dataset.mode || 'qa';
    this.inputEl.value = '';
    this.inputEl.style.height = 'auto';
    if (mode === 'api_check') {
      await this._handleAPICheckSend(text);
      return;
    }
    this._addMessage('user', text);
    this._setLoading(true);
    try {
      await this._ask(text, mode);
    } catch (err) {
      this._addMessage('ai', `请求出错: ${err.message}`);
    } finally {
      this._setLoading(false);
    }
  }

  async _ask(question, mode = 'qa') {
    if (!this.aiClient) {
      if (this.thinkingMsgEl) { this.thinkingMsgEl.remove(); this.thinkingMsgEl = null; }
      this._addMessage('ai', '请先配置AI模型（点击右上角设置）');
      return;
    }
    if (!this.rag) {
      if (this.thinkingMsgEl) { this.thinkingMsgEl.remove(); this.thinkingMsgEl = null; }
      if (this.sidebar.classList.contains('zy-building')) {
        this._addMessage('ai', '知识库正在构建中，请稍等构建完成后再提问。');
      } else {
        this._addMessage('ai', '知识库尚未就绪，请尝试刷新页面后重新打开侧边栏。');
      }
      return;
    }

    let bubble, msgEl;
    // 如果有思考中的消息，复用它
    if (this.thinkingMsgEl) {
      msgEl = this.thinkingMsgEl;
      bubble = msgEl.querySelector('.zy-bubble');
      bubble.innerHTML = '';
      this.thinkingMsgEl = null;
    } else {
      bubble = ZhiYeUtils.createEl('div', { class: 'zy-bubble', text: '' });
      msgEl = ZhiYeUtils.createEl('div', { class: 'zy-message zy-message-ai' }, [
        ZhiYeUtils.createEl('div', { class: 'zy-avatar zy-avatar-ai', text: '智' }),
        bubble
      ]);
      this._getMessagesContainer().appendChild(msgEl);
    }

    this._scrollToBottom();
    try {
      const stream = await this.rag.ask(question, { mode, stream: true });
      let fullText = '';
      let thinkingContent = '';
      let answerContent = '';
      let inThinking = false;
      let thinkingDone = false;

      // 创建思考区域容器
      const thinkingContainer = ZhiYeUtils.createEl('div', { class: 'zy-thinking-block', style: 'display:none' });
      const thinkingHeader = ZhiYeUtils.createEl('div', { class: 'zy-thinking-header' }, [
        ZhiYeUtils.createEl('span', { class: 'zy-thinking-icon', text: '💭' }),
        ZhiYeUtils.createEl('span', { class: 'zy-thinking-label', text: '思考中' }),
        ZhiYeUtils.createEl('span', { class: 'zy-thinking-dots-mini' }, [
          ZhiYeUtils.createEl('span'), ZhiYeUtils.createEl('span'), ZhiYeUtils.createEl('span')
        ]),
        ZhiYeUtils.createEl('span', { class: 'zy-thinking-toggle', text: '展开' })
      ]);
      const thinkingBody = ZhiYeUtils.createEl('div', { class: 'zy-thinking-body', style: 'display:none' });
      thinkingContainer.append(thinkingHeader, thinkingBody);
      bubble.appendChild(thinkingContainer);

      // 答案区域
      const answerContainer = ZhiYeUtils.createEl('div', { class: 'zy-answer-block' });
      bubble.appendChild(answerContainer);

      // 点击展开/收起思考过程
      thinkingHeader.addEventListener('click', () => {
        const isExpanded = thinkingBody.style.display !== 'none';
        thinkingBody.style.display = isExpanded ? 'none' : 'block';
        thinkingHeader.querySelector('.zy-thinking-toggle').textContent = isExpanded ? '展开' : '收起';
      });

      for await (const chunk of stream) {
        fullText += chunk;

        // 解析 thinking 标签
        let remaining = chunk;
        while (remaining.length > 0) {
          if (!inThinking && !thinkingDone) {
            const startIdx = remaining.indexOf('<thinking>');
            if (startIdx !== -1) {
              // 找到开始标签前的内容是答案
              const before = remaining.substring(0, startIdx);
              if (before) {
                answerContent += before;
                answerContainer.innerHTML = this._markdownToHtml(answerContent);
              }
              inThinking = true;
              thinkingContainer.style.display = 'block';
              remaining = remaining.substring(startIdx + 10); // '<thinking>'.length = 10
            } else {
              // 没有找到开始标签，全部作为答案（可能是部分标签）
              answerContent += remaining;
              answerContainer.innerHTML = this._markdownToHtml(answerContent);
              remaining = '';
            }
          } else if (inThinking) {
            const endIdx = remaining.indexOf('</thinking>');
            if (endIdx !== -1) {
              // 找到结束标签
              thinkingContent += remaining.substring(0, endIdx);
              thinkingBody.innerHTML = this._markdownToHtml(thinkingContent);
              inThinking = false;
              thinkingDone = true;
              // 更新思考标签状态
              thinkingHeader.querySelector('.zy-thinking-label').textContent = '已思考';
              thinkingHeader.querySelector('.zy-thinking-dots-mini').style.display = 'none';
              thinkingHeader.querySelector('.zy-thinking-toggle').style.display = 'inline';
              remaining = remaining.substring(endIdx + 11); // '</thinking>'.length = 11
            } else {
              // 还在思考中
              thinkingContent += remaining;
              thinkingBody.innerHTML = this._markdownToHtml(thinkingContent);
              remaining = '';
            }
          } else {
            // 思考结束后，剩余都是答案
            answerContent += remaining;
            answerContainer.innerHTML = this._markdownToHtml(answerContent);
            remaining = '';
          }
        }

        this._scrollToBottom();
      }

      // 如果模型没有输出 thinking 标签，隐藏思考区域
      if (!thinkingContent && !inThinking) {
        thinkingContainer.style.display = 'none';
      } else if (inThinking) {
        // 流结束但思考还没结束，标记完成
        thinkingHeader.querySelector('.zy-thinking-label').textContent = '已思考';
        thinkingHeader.querySelector('.zy-thinking-dots-mini').style.display = 'none';
        thinkingHeader.querySelector('.zy-thinking-toggle').style.display = 'inline';
      }

      this.messages.push({ role: 'ai', content: fullText, html: bubble.innerHTML });
      this._saveHistory();
    } catch (err) {
      bubble.innerHTML = `<span style="color:var(--zy-error)">请求出错: ${err.message}</span>`;
      this.messages.push({ role: 'ai', content: `请求出错: ${err.message}` });
      this._saveHistory();
    }
  }

  _addMessage(role, content) {
    this._clearedHistory = false;
    const msg = { role, content, timestamp: Date.now() };
    this.messages.push(msg);
    if (role === 'user') {
      const container = this._getMessagesContainer();
      container.appendChild(this._createMessageEl(msg));
      this._scrollToBottom();
    }
    this._saveHistory();
  }

  _getMessagesContainer() {
    let container = this.contentEl.querySelector('#zy-messages');
    if (!container) {
      // 如果当前不是chat tab，先切回chat再获取
      if (this.currentTab !== 'chat') {
        this._switchToChatTab();
      } else {
        this._renderChatTab();
      }
      container = this.contentEl.querySelector('#zy-messages');
    }
    return container;
  }

  _switchToChatTab() {
    this.currentTab = 'chat';
    this.sidebar.querySelectorAll('.zy-tab').forEach(t => t.classList.remove('zy-active'));
    this.sidebar.querySelector('.zy-tab[data-tab="chat"]')?.classList.add('zy-active');
    const inputArea = this.sidebar.querySelector('#zy-input-area');
    if (inputArea) inputArea.style.display = '';
    this._renderChatTab();
  }

  async _handleAPICheckSend(text) {
    // 将用户输入的文本作为待校验的代码
    this._addMessage('user', text);
    this._setLoading(true);
    try {
      // 显示"正在分析API合规性..."的思考消息
      if (this.thinkingMsgEl) {
        const bubble = this.thinkingMsgEl.querySelector('.zy-bubble');
        bubble.innerHTML = '<span class="zy-thinking-text">正在分析API合规性</span><span class="zy-thinking-dots"><span></span><span></span><span></span></span>';
      }
      if (this.codeGen) {
        const result = await this.codeGen.validateCode(text);
        // 将结果显示在消息区域（格式化输出：API匹配结果、参数检查、建议等）
        let html = '<div style="font-weight:600;margin-bottom:8px">API合规性检查结果</div>';
        if (result.apiMatches && result.apiMatches.length > 0) {
          html += '<div style="margin-bottom:8px"><div style="font-size:12px;color:var(--zy-primary);font-weight:600;margin-bottom:4px">API匹配结果</div>';
          result.apiMatches.forEach(match => {
            html += `<div style="padding:6px 8px;border:1px solid var(--zy-border);border-radius:6px;margin-bottom:4px;font-size:12px">
              <div style="font-weight:500">${match.name || match.api || '未知API'}</div>
              <div style="color:var(--zy-text-secondary);margin-top:2px">${match.description || ''}</div>
            </div>`;
          });
          html += '</div>';
        }
        if (result.paramChecks && result.paramChecks.length > 0) {
          html += '<div style="margin-bottom:8px"><div style="font-size:12px;color:var(--zy-primary);font-weight:600;margin-bottom:4px">参数检查</div>';
          result.paramChecks.forEach(check => {
            const statusColor = check.passed ? '#22c55e' : '#ef4444';
            const statusText = check.passed ? '通过' : '异常';
            html += `<div style="padding:6px 8px;border:1px solid var(--zy-border);border-radius:6px;margin-bottom:4px;font-size:12px">
              <div style="display:flex;justify-content:space-between"><span style="font-weight:500">${check.param || check.name || '参数'}</span><span style="color:${statusColor};font-weight:600">${statusText}</span></div>
              <div style="color:var(--zy-text-secondary);margin-top:2px">${check.message || ''}</div>
            </div>`;
          });
          html += '</div>';
        }
        if (result.suggestions && result.suggestions.length > 0) {
          html += '<div style="margin-bottom:8px"><div style="font-size:12px;color:var(--zy-accent);font-weight:600;margin-bottom:4px">建议</div><ul style="margin:0;padding-left:16px;font-size:12px">';
          result.suggestions.forEach(s => {
            html += `<li style="margin-bottom:2px">${s}</li>`;
          });
          html += '</ul></div>';
        }
        if (result.summary) {
          html += `<div style="font-size:12px;color:var(--zy-text-secondary);margin-top:8px;padding-top:8px;border-top:1px solid var(--zy-border)">${result.summary}</div>`;
        }
        this._addMessage('ai', html);
      } else {
        // 如果codeGen不可用，回退为普通问答模式
        await this._ask(`请检查以下代码的API调用是否合规：\n\n${text}`, 'api_check');
      }
    } catch (err) {
      this._addMessage('ai', `<span style="color:var(--zy-error)">API校验失败: ${err.message}</span>`);
    } finally {
      this._setLoading(false);
    }
  }

  /* ========== 划词 ========== */

  _handleSelection(e) {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text.length < 2) { this.tooltip.style.display = 'none'; return; }
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    this.tooltip.style.left = `${rect.left + rect.width / 2 - 30}px`;
    this.tooltip.style.top = `${rect.top - 36}px`;
    this.tooltip.style.display = 'block';
  }

  _getSelectionText() { return window.getSelection().toString().trim(); }

  _handleContextAction(action, text) {
    this.open();
    // 构建期间禁止操作
    if (this.sidebar.classList.contains('zy-building')) {
      this._showToast('知识库构建中，请稍后再试');
      return;
    }
    switch (action) {
      case 'ask': this.inputEl.value = text; this._sendMessage(); break;
      case 'explain': this._addMessage('user', `解释：${text}`); this._setLoading(true); this._ask(`请解释以下内容：\n\n${text}`, 'explain').finally(() => this._setLoading(false)); break;
      case 'code': this._addMessage('user', `生成代码：${text}`); this._setLoading(true); this._ask(`基于以下内容生成代码示例：\n\n${text}`, 'code').finally(() => this._setLoading(false)); break;
      case 'summarize': this._addMessage('user', '总结页面'); this._setLoading(true); this._ask('请总结当前页面的核心内容', 'summary').finally(() => this._setLoading(false)); break;
    }
  }

  /* ========== AI知识图谱整合 ========== */

  async _handleAIGraphFuse(groupId) {
    if (!this.aiClient) {
      this._showToast('请先配置AI模型（点击右上角设置）');
      return;
    }
    if (this._aiFusingGraph) return;
    this._aiFusingGraph = true;
    this._renderGraphPanel(this.contentEl.querySelector('#zy-kb-panel'));

    try {
      // 1. 读取融合图
      const fusedData = await ZhiYeUtils.storageGet('zhiye_fused_graphs');
      const fusedGraphs = fusedData?.zhiye_fused_graphs || {};
      const graphData = fusedGraphs[groupId];
      if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
        this._showToast('当前组没有知识图谱数据');
        this._aiFusingGraph = false;
        this._renderGraphPanel(this.contentEl.querySelector('#zy-kb-panel'));
        return;
      }

      const graph = KnowledgeGraph.deserialize(graphData);
      const nodes = graph.nodesArray();
      const edges = graph.edgesArray();

      // 2. 构建节点摘要信息
      const typeGroups = {};
      nodes.forEach(n => {
        if (!typeGroups[n.type]) typeGroups[n.type] = [];
        const meta = n.meta || {};
        typeGroups[n.type].push({
          id: n.id,
          label: n.label,
          content: (meta.content || meta.code || meta.summary || '').substring(0, 200),
          sources: n.sources || []
        });
      });

      // 3. 发送给AI进行整合分析
      const graphSummary = Object.entries(typeGroups).map(([type, items]) => {
        return `【${type}类型】(${items.length}个):\n` + items.slice(0, 30).map(i => `- ${i.label}: ${(i.content || '').substring(0, 100)}`).join('\n');
      }).join('\n\n');

      const edgeSummary = edges.slice(0, 50).map(e => `${e.source} --[${e.relation}]--> ${e.target}`).join('\n');

      const prompt = `你是一个知识图谱整合专家。以下是当前知识图谱的节点和关系数据：

${graphSummary}

主要关系：
${edgeSummary}

请对这个知识图谱进行智能整合分析，输出以下JSON格式结果（不要输出其他任何内容，只输出JSON）：
{
  "merge_suggestions": [{"keep_id": "节点ID", "merge_ids": ["要合并的节点ID1", "节点ID2"], "reason": "合并原因"}],
  "new_relations": [{"source": "节点ID", "target": "节点ID", "relation": "关系类型", "reason": "新建关系原因"}],
  "summary": "整合后的知识图谱整体概述（200字以内）"
}

注意：
1. merge_suggestions是建议将语义相近的节点合并
2. new_relations是基于语义推理发现的新关联
3. 只使用已存在的节点ID
4. 如果没有发现需要合并或新建的内容，对应数组为空`;

      // 流式处理AI响应
      const messages = [
        { role: 'system', content: '你是一个知识图谱整合专家，只输出JSON格式结果。' },
        { role: 'user', content: prompt }
      ];

      let aiResponse = '';
      const stream = await this.aiClient.chat(messages, { stream: true, temperature: 0.2 });
      for await (const chunk of stream) {
        if (chunk.content) aiResponse += chunk.content;
      }

      // 4. 解析AI响应
      // 尝试提取JSON（AI可能包裹在代码块中）
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this._showToast('AI整合结果解析失败');
        this._aiFusingGraph = false;
        this._renderGraphPanel(this.contentEl.querySelector('#zy-kb-panel'));
        return;
      }

      const result = JSON.parse(jsonMatch[0]);

      // 5. 应用整合建议
      let mergeCount = 0;
      let newRelCount = 0;

      // 合并节点：将被合并节点的sources和neighbors转移到保留节点
      if (result.merge_suggestions && result.merge_suggestions.length > 0) {
        for (const merge of result.merge_suggestions) {
          const keepNode = graph.getNode(merge.keep_id);
          if (!keepNode) continue;
          for (const mergeId of merge.merge_ids) {
            const mergeNode = graph.getNode(mergeId);
            if (!mergeNode) continue;
            // 合并sources
            if (mergeNode.sources) {
              keepNode.sources = [...new Set([...(keepNode.sources || []), ...mergeNode.sources])];
            }
            // 重建边：将指向mergeNode的边重定向到keepNode
            const oldEdges = graph.edgesArray().filter(e => e.source === mergeId || e.target === mergeId);
            for (const edge of oldEdges) {
              const newSource = edge.source === mergeId ? merge.keep_id : edge.source;
              const newTarget = edge.target === mergeId ? merge.keep_id : edge.target;
              if (newSource !== newTarget && !graph.getEdge(newSource, newTarget)) {
                graph.addEdge(newSource, newTarget, edge.relation, edge.weight);
              }
            }
            // 删除被合并的节点
            graph.removeNode(mergeId);
            mergeCount++;
          }
        }
      }

      // 添加新关系
      if (result.new_relations && result.new_relations.length > 0) {
        for (const rel of result.new_relations) {
          if (graph.getNode(rel.source) && graph.getNode(rel.target) && !graph.getEdge(rel.source, rel.target)) {
            graph.addEdge(rel.source, rel.target, rel.relation, 0.6);
            newRelCount++;
          }
        }
      }

      // 6. 保存整合后的图谱
      if (mergeCount > 0 || newRelCount > 0) {
        fusedGraphs[groupId] = {
          ...graph.serialize(),
          groupId,
          updatedAt: Date.now(),
          aiFused: true,
          aiFuseSummary: result.summary || '',
          lastAiFuseAt: Date.now()
        };
        await ZhiYeUtils.storageSet({ zhiye_fused_graphs: fusedGraphs });

        // 更新内存中的kg
        this.kg = graph;
        if (typeof RAGEngine !== 'undefined') this.rag = new RAGEngine(graph, this.aiClient);
        if (typeof CodeGenerator !== 'undefined') this.codeGen = new CodeGenerator(graph, this.aiClient);

        this._showToast(`AI整合完成：合并${mergeCount}个节点，新增${newRelCount}条关系`);
      } else {
        this._showToast('AI分析完毕，当前图谱结构良好无需调整');
      }

      // 重新渲染图谱面板
      this._renderGraphPanel(this.contentEl.querySelector('#zy-kb-panel'));
    } catch (err) {
      console.error('[智页AI] AI知识图谱整合失败:', err);
      this._showToast('AI整合失败: ' + err.message);
    } finally {
      this._aiFusingGraph = false;
    }
  }

  /* ========== 工具方法 ========== */

  _setLoading(loading) {
    this.isTyping = loading;
    this.sendBtn.disabled = loading;
    if (loading) {
      this.sendBtn.classList.add('zy-send-loading');
      // 显示思考中消息
      if (!this.thinkingMsgEl) {
        this.thinkingMsgEl = this._createThinkingMessage();
        this._getMessagesContainer().appendChild(this.thinkingMsgEl);
        this._scrollToBottom();
      }
    } else {
      this.sendBtn.classList.remove('zy-send-loading');
      // 移除思考中消息
      if (this.thinkingMsgEl) {
        this.thinkingMsgEl.remove();
        this.thinkingMsgEl = null;
      }
    }
  }

  /* ========== 构建进度覆盖层 ========== */

  setBuildStatus(status, message) {
    this.buildStatusText = message;
    const overlay = this.sidebar.querySelector('#zy-build-overlay');
    if (!overlay) return;

    if (status === 'ready') {
      overlay.style.display = 'none';
      this.sidebar.classList.remove('zy-building');
      // 重新渲染当前tab的内容（构建期间内容被隐藏，需要恢复）
      this._renderTab(this.currentTab);
      return;
    }

    if (status === 'error') {
      // 构建失败：保持覆盖层显示错误信息，允许用户重试
      this.sidebar.classList.add('zy-building');
      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <div class="zy-build-overlay-inner">
          <div class="zy-build-overlay-icon" style="background:linear-gradient(135deg, var(--zy-error), var(--zy-warning))">!</div>
          <div class="zy-build-overlay-title">${message || '构建失败'}</div>
          <div class="zy-build-overlay-hint" style="margin-bottom:16px">点击下方按钮重新尝试</div>
          <button id="zy-build-retry-btn" style="padding:8px 20px;border:none;border-radius:8px;background:var(--zy-primary);color:white;cursor:pointer;font-size:13px">重新构建</button>
        </div>
      `;
      const retryBtn = overlay.querySelector('#zy-build-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          window.dispatchEvent(new CustomEvent('zhiye-sidebar-retry-build'));
        });
      }
      return;
    }

    // 构建中：显示覆盖层，禁止所有交互
    this.sidebar.classList.add('zy-building');
    overlay.style.display = 'flex';

    const steps = {
      parsing: { step: 1, total: 4, label: '正在解析页面内容...' },
      building: { step: 2, total: 4, label: '正在构建知识图谱...' },
      vectorizing: { step: 3, total: 4, label: '正在生成文档向量...' },
      fusing: { step: 4, total: 4, label: '正在融合同源知识...' }
    };
    const s = steps[status] || { step: 0, total: 4, label: message };
    const pct = Math.round((s.step / s.total) * 100);
    overlay.innerHTML = `
      <div class="zy-build-overlay-inner">
        <div class="zy-build-overlay-icon">智</div>
        <div class="zy-build-overlay-title">${message || '构建中...'}</div>
        <div class="zy-build-progress-bar"><div class="zy-build-progress-fill" style="width:${pct}%"></div></div>
        <div class="zy-build-overlay-step">步骤 ${s.step}/${s.total}</div>
        <div class="zy-build-overlay-hint">构建完成前功能暂不可用</div>
      </div>
    `;
  }

  _createThinkingMessage() {
    const bubble = ZhiYeUtils.createEl('div', { class: 'zy-bubble' });
    bubble.innerHTML = '<span class="zy-thinking-text">正在思考</span><span class="zy-thinking-dots"><span></span><span></span><span></span></span>';
    return ZhiYeUtils.createEl('div', { class: 'zy-message zy-message-ai', id: 'zy-thinking-msg' }, [
      ZhiYeUtils.createEl('div', { class: 'zy-avatar zy-avatar-ai', text: '智' }),
      bubble
    ]);
  }

  updateWelcomeMessage() {
    if (this.currentTab === 'chat' && this.messages.length === 0) this._renderChatTab();
  }

  _scrollToBottom() { this.contentEl.scrollTop = this.contentEl.scrollHeight; }

  _escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

  _showToast(message) {
    const toast = ZhiYeUtils.createEl('div', {
      class: 'zy-toast',
      text: message
    });
    Object.assign(toast.style, {
      position: 'absolute',
      bottom: '70px',
      left: '50%',
      transform: 'translateX(-50%) translateY(10px)',
      background: 'var(--zy-text)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: '100',
      opacity: '0',
      transition: 'all 0.3s ease',
      pointerEvents: 'none',
      whiteSpace: 'nowrap'
    });
    this.sidebar.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  /* ========== 悬停内容Tooltip ========== */

  /* ========== 详情弹窗组件 ========== */

  _getDetailPopup() {
    if (!this.detailPopup) {
      // 遮罩层
      this.detailPopupOverlay = ZhiYeUtils.createEl('div', { class: 'zy-detail-popup-overlay' });
      Object.assign(this.detailPopupOverlay.style, {
        position: 'fixed',
        left: 0, top: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: '2147483646',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center'
      });
      this.detailPopupOverlay.addEventListener('click', (e) => {
        if (e.target === this.detailPopupOverlay) this._hideDetailPopup();
      });

      // 弹窗容器
      this.detailPopup = ZhiYeUtils.createEl('div', { class: 'zy-detail-popup' });
      Object.assign(this.detailPopup.style, {
        background: 'var(--zy-bg-secondary, #1e1e28)',
        borderRadius: '12px',
        maxWidth: '80%',
        width: '480px',
        maxHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '1px solid var(--zy-border, rgba(255,255,255,0.1))',
        overflow: 'hidden'
      });

      // 弹窗头部
      const header = ZhiYeUtils.createEl('div', { class: 'zy-detail-popup-header' });
      Object.assign(header.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--zy-border, rgba(255,255,255,0.1))'
      });
      this.detailPopupTitle = ZhiYeUtils.createEl('div', { class: 'zy-detail-popup-title' });
      Object.assign(this.detailPopupTitle.style, {
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--zy-text, #fff)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: '1'
      });
      const closeBtn = ZhiYeUtils.createEl('button', { class: 'zy-detail-popup-close' });
      Object.assign(closeBtn.style, {
        width: '28px', height: '28px',
        borderRadius: '6px',
        border: 'none',
        background: 'transparent',
        color: 'var(--zy-text-secondary, #94a3b8)',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: '0'
      });
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', () => this._hideDetailPopup());
      header.appendChild(this.detailPopupTitle);
      header.appendChild(closeBtn);

      // 弹窗内容
      this.detailPopupContent = ZhiYeUtils.createEl('div', { class: 'zy-detail-popup-content' });
      Object.assign(this.detailPopupContent.style, {
        padding: '14px 16px',
        overflowY: 'auto',
        fontSize: '13px',
        lineHeight: '1.7',
        color: 'var(--zy-text, #e2e8f0)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        flex: '1'
      });

      this.detailPopup.appendChild(header);
      this.detailPopup.appendChild(this.detailPopupContent);
      this.detailPopupOverlay.appendChild(this.detailPopup);
      this.sidebar.appendChild(this.detailPopupOverlay);
    }
    return { overlay: this.detailPopupOverlay, popup: this.detailPopup, titleEl: this.detailPopupTitle, contentEl: this.detailPopupContent };
  }

  _showDetailPopup(title, content) {
    const { overlay, titleEl, contentEl } = this._getDetailPopup();
    titleEl.textContent = title;
    contentEl.textContent = content;
    overlay.style.display = 'flex';
  }

  _hideDetailPopup() {
    if (this.detailPopupOverlay) {
      this.detailPopupOverlay.style.display = 'none';
    }
  }

  /* ========== 向量库持久化 ========== */

  async _saveVectorStore() {
    if (this.vectorStore) {
      await ZhiYeUtils.storageSet({ zhiye_vector_store: this.vectorStore.serialize() });
    }
  }

  async _loadVectorStore() {
    try {
      const data = await ZhiYeUtils.storageGet('zhiye_vector_store');
      if (data?.zhiye_vector_store) {
        this.vectorStore = VectorStore.deserialize(data.zhiye_vector_store);
      }
    } catch (e) {
      console.warn('[智页AI] 加载向量库失败:', e);
    }
  }

  /* ========== Embedding/Reranker客户端初始化 ========== */

  async _initEmbeddingClients() {
    // 异步初始化embeddingClient和RerankerClient
    if (this.embeddingClient && this.rerankerClient) return;
    try {
      if (typeof EmbeddingClient !== 'undefined' && !this.embeddingClient) {
        this.embeddingClient = new EmbeddingClient();
        await this.embeddingClient.init?.();
      }
      if (typeof RerankerClient !== 'undefined' && !this.rerankerClient) {
        this.rerankerClient = new RerankerClient();
        await this.rerankerClient.init?.();
      }
    } catch (e) {
      console.warn('[智页AI] Embedding/Reranker客户端初始化失败:', e);
    }
  }

  /* ========== 对话持久化 ========== */

  async _saveHistory() {
    await ZhiYeUtils.storageSet({ [`zhiye_history_${location.href}`]: this.messages.slice(-50) });
  }

  async _loadHistory() {
    const data = await ZhiYeUtils.storageGet(`zhiye_history_${location.href}`);
    this.messages = data?.[`zhiye_history_${location.href}`] || [];
  }

  async _clearChatHistory() {
    if (!confirm('确定要清除当前页面的所有问答记录吗？')) return;
    this.messages = [];
    this._clearedHistory = true; // 标记已清空
    await ZhiYeUtils.storageSet({ [`zhiye_history_${location.href}`]: [] });
    if (this.currentTab === 'chat') {
      this._renderChatTab();
    }
    this._showToast('问答记录已清除');
  }
}

if (typeof window !== 'undefined') window.SidebarController = SidebarController;
if (typeof module !== 'undefined') module.exports = SidebarController;