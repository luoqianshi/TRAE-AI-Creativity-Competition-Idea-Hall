/* ===== Claude 指挥中心 — 前端 ===== */
(() => {
  const $ = (id) => document.getElementById(id);

  // 访问密钥：优先 URL ?key=，其次本地存储
  function initKey() {
    const u = new URL(location.href);
    const fromUrl = u.searchParams.get('key');
    if (fromUrl) {
      localStorage.setItem('mc_key', fromUrl);
      return fromUrl;
    }
    return localStorage.getItem('mc_key') || '';
  }
  let accessKey = initKey();
  const wsUrl = () =>
    (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws' +
    (accessKey ? '?key=' + encodeURIComponent(accessKey) : '');
  const apiUrl = (p) => p + (accessKey ? (p.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(accessKey) : '');

  // ---- 状态 ----
  const state = {
    ws: null,
    connected: false,
    sessions: [],
    active: null,            // 当前打开的 sessionId
    renderedIds: new Set(),  // 当前会话已渲染的消息 id（去重）
    unread: {},              // sessionId -> true
    statusMap: {},           // sessionId -> 'running'|'idle'
    reconnectDelay: 800,
  };

  // ---- WebSocket ----
  let authFailed = false;
  function connect() {
    const ws = new WebSocket(wsUrl());
    state.ws = ws;
    ws.onopen = () => {
      state.connected = true;
      state.reconnectDelay = 800;
      setConn('ok', '已连接');
      // 重连后恢复当前会话订阅
      if (state.active) send({ type: 'open', sessionId: state.active });
      send({ type: 'list' });
    };
    ws.onclose = (e) => {
      state.connected = false;
      if (e.code === 4001) { authFailed = true; setConn('off', '密钥错误'); promptKey(true); return; }
      setConn('off', '已断开');
      if (authFailed) return;
      setTimeout(connect, state.reconnectDelay);
      state.reconnectDelay = Math.min(state.reconnectDelay * 1.6, 6000);
    };
    ws.onerror = () => ws.close();
    ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.type === 'unauthorized') { authFailed = true; return; }
      handle(msg);
    };
  }

  function promptKey(wrong) {
    const modal = $('key-modal');
    modal.classList.remove('hidden');
    const input = $('key-input');
    input.value = accessKey || '';
    if (wrong) input.value = '';
    setTimeout(() => input.focus(), 100);
  }

  function send(obj) {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(obj));
  }

  function setConn(cls, label) {
    const el = $('conn');
    el.className = 'conn ' + cls;
    el.querySelector('.conn-label').textContent = label;
  }

  // ---- 处理服务端消息 ----
  function handle(msg) {
    switch (msg.type) {
      case 'sessions':
        state.sessions = msg.sessions;
        msg.sessions.forEach((s) => { state.statusMap[s.sessionId] = s.status; });
        renderList();
        updateChatHeaderStatus();
        break;
      case 'history':
        if (msg.sessionId === state.active) renderHistory(msg);
        break;
      case 'event':
        if (msg.sessionId === state.active) {
          appendMessage(msg.message);
        } else {
          state.unread[msg.sessionId] = true;
          renderList();
        }
        break;
      case 'status':
        state.statusMap[msg.sessionId] = msg.status;
        if (msg.sessionId === state.active) updateChatHeaderStatus();
        renderList();
        break;
      case 'turn_complete':
        if (msg.sessionId === state.active) setTyping(false);
        break;
      case 'created':
        toast('已创建会话，正在启动…');
        openSession(msg.sessionId, msg.cwd, '新会话');
        break;
      case 'remap':
        if (state.active === msg.from) state.active = msg.to;
        break;
      case 'log':
        if (msg.level === 'error') toast('⚠ ' + msg.text.slice(0, 120));
        break;
      case 'error':
        toast('⚠ ' + msg.message);
        break;
    }
  }

  // ---- 会话列表渲染 ----
  function renderList() {
    const q = $('search').value.trim().toLowerCase();
    const list = $('session-list');
    let items = state.sessions;
    if (q) items = items.filter((s) =>
      (s.title || '').toLowerCase().includes(q) || (s.cwd || '').toLowerCase().includes(q));
    if (!items.length) {
      list.innerHTML = '<div class="empty-hint">' + (q ? '无匹配会话' : '暂无会话，点下方新建一个吧') + '</div>';
      return;
    }
    list.innerHTML = '';
    for (const s of items) {
      const status = state.statusMap[s.sessionId] || s.status || 'idle';
      const el = document.createElement('div');
      el.className = 'session-item' + (s.sessionId === state.active ? ' active' : '');
      el.onclick = () => openSession(s.sessionId, s.cwd, s.title);
      const unread = state.unread[s.sessionId] && s.sessionId !== state.active;
      el.innerHTML = `
        <div class="si-top">
          <span class="status-dot ${status}"></span>
          <span class="si-title">${esc(s.title || s.sessionId.slice(0, 8))}</span>
          ${unread ? '<span class="unread-dot"></span>' : ''}
          ${status === 'running' ? '<span class="si-badge">运行中</span>' : ''}
        </div>
        <div class="si-meta">
          <span class="si-project">📁 ${esc(s.project || s.cwd || '')}</span>
          <span class="si-time">${relTime(s.mtime)}</span>
        </div>`;
      list.appendChild(el);
    }
  }

  // ---- 打开会话 ----
  function openSession(sessionId, cwd, title) {
    if (state.active && state.active !== sessionId) {
      send({ type: 'close', sessionId: state.active });
    }
    state.active = sessionId;
    state.unread[sessionId] = false;
    state.renderedIds = new Set();
    $('messages').innerHTML = '';
    $('ct-name').textContent = title || '会话';
    $('ct-cwd').textContent = cwd || '';
    $('chat-empty').classList.add('hidden');
    $('chat-view').classList.remove('hidden');
    document.body.classList.add('view-chat');
    updateChatHeaderStatus();
    renderList();
    send({ type: 'open', sessionId });
    $('input').focus();
  }

  function renderHistory(msg) {
    $('messages').innerHTML = '';
    state.renderedIds = new Set();
    if (msg.cwd) $('ct-cwd').textContent = msg.cwd;
    for (const m of msg.messages) appendMessage(m, true);
    scrollBottom(true);
    updateChatHeaderStatus();
  }

  // ---- 消息渲染 ----
  function appendMessage(m, noScroll) {
    if (!m || !m.id) return;
    if (state.renderedIds.has(m.id)) return;
    state.renderedIds.add(m.id);

    const wrap = document.createElement('div');
    const box = $('messages');
    const near = isNearBottom();

    if (m.kind === 'text' && m.role === 'user') {
      wrap.className = 'msg user';
      wrap.innerHTML = `<div class="msg-role">你</div><div class="bubble">${md(m.text)}</div>`;
    } else if (m.kind === 'text' && m.role === 'assistant') {
      wrap.className = 'msg assistant';
      wrap.innerHTML = `<div class="msg-role">Claude</div><div class="bubble">${md(m.text)}</div>`;
    } else if (m.kind === 'thinking') {
      wrap.className = 'msg thinking';
      wrap.innerHTML = `<div class="think-card">
        <div class="think-head">💭 思考过程 <span style="color:var(--text-faint)">(点击展开)</span></div>
        <div class="think-body" style="display:none">${esc(m.text)}</div></div>`;
      const card = wrap.querySelector('.think-card');
      card.querySelector('.think-head').onclick = () => {
        const b = card.querySelector('.think-body');
        b.style.display = b.style.display === 'none' ? 'block' : 'none';
      };
    } else if (m.kind === 'tool_use') {
      wrap.className = 'msg tool';
      const t = m.tool || {};
      const { ico, brief } = toolBrief(t);
      wrap.innerHTML = `<div class="tool-card">
        <div class="tool-head">
          <span class="tool-ico">${ico}</span>
          <span class="tool-name">${esc(t.name || '工具')}</span>
          <span class="tool-brief">${esc(brief)}</span>
          <span class="tool-chevron">▶</span>
        </div>
        <div class="tool-detail"><pre>${esc(pretty(t.input))}</pre></div>
      </div>`;
      const card = wrap.querySelector('.tool-card');
      card.querySelector('.tool-head').onclick = () => card.classList.toggle('open');
    } else if (m.kind === 'tool_result') {
      wrap.className = 'msg tool-result';
      const text = (m.text || '').trim() || '(无输出)';
      const short = text.length > 500 ? text.slice(0, 500) + ' …' : text;
      wrap.innerHTML = `<div class="result-card ${m.isError ? 'error' : ''}">
        <div class="result-head">${m.isError ? '✗ 结果(错误)' : '↳ 结果'} · ${text.split('\n').length} 行 <span style="color:var(--text-faint)">(点击展开)</span></div>
        <div class="result-body">${esc(text)}</div>
      </div>`;
      const card = wrap.querySelector('.result-card');
      card.querySelector('.result-head').onclick = () => card.classList.toggle('open');
    } else if (m.kind === 'result') {
      wrap.className = 'msg result-chip';
      const parts = [];
      if (m.result) {
        if (m.result.duration_ms) parts.push((m.result.duration_ms / 1000).toFixed(1) + 's');
        if (typeof m.result.cost === 'number') parts.push('$' + m.result.cost.toFixed(3));
        if (m.result.num_turns) parts.push(m.result.num_turns + ' 轮');
      }
      wrap.innerHTML = `<span class="result-chip-inner ${m.isError ? 'error' : ''}">
        ${m.isError ? '✗ 出错' : '✓ 完成'}${parts.length ? ' · ' + parts.join(' · ') : ''}</span>`;
    } else {
      return;
    }

    box.appendChild(wrap);
    if (!noScroll && near) scrollBottom();
  }

  function toolBrief(t) {
    const inp = t.input || {};
    const map = {
      Bash: ['⚡', inp.command], Read: ['📖', inp.file_path], Write: ['📝', inp.file_path],
      Edit: ['✏️', inp.file_path], Glob: ['🔍', inp.pattern], Grep: ['🔎', inp.pattern],
      WebFetch: ['🌐', inp.url], WebSearch: ['🌐', inp.query], Task: ['🤖', inp.description],
      TodoWrite: ['✅', '更新任务'], NotebookEdit: ['📓', inp.notebook_path],
    };
    const hit = map[t.name];
    if (hit) return { ico: hit[0], brief: String(hit[1] || '').replace(/\s+/g, ' ') };
    return { ico: '🔧', brief: pretty(inp).replace(/\s+/g, ' ').slice(0, 120) };
  }

  // ---- 头部状态 ----
  function updateChatHeaderStatus() {
    if (!state.active) return;
    const status = state.statusMap[state.active] || 'idle';
    $('ct-status').className = 'status-dot ' + status;
    const running = status === 'running';
    $('btn-stop').classList.toggle('hidden', !running);
    setTyping(running);
  }
  function setTyping(on) { $('typing-hint').classList.toggle('hidden', !on); }

  // ---- 发送 ----
  function doSend() {
    const input = $('input');
    const text = input.value.trim();
    if (!text || !state.active) return;
    send({ type: 'send', sessionId: state.active, text });
    input.value = '';
    autoGrow();
    setTyping(true);
    state.statusMap[state.active] = 'running';
    updateChatHeaderStatus();
  }

  // ---- 工具函数 ----
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function pretty(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    try { return JSON.stringify(v, null, 2); } catch { return String(v); }
  }
  // 轻量 markdown：代码块、行内代码、粗体、链接、段落
  function md(src) {
    let s = esc(src);
    const blocks = [];
    s = s.replace(/```([\s\S]*?)```/g, (_, code) => {
      blocks.push(code.replace(/^\n/, ''));
      return ` ${blocks.length - 1} `;
    });
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    s = s.replace(/ (\d+) /g, (_, i) => `<pre><code>${blocks[+i]}</code></pre>`);
    return s;
  }
  function relTime(ms) {
    if (!ms) return '';
    const d = Date.now() - ms, s = d / 1000;
    if (s < 60) return '刚刚';
    if (s < 3600) return Math.floor(s / 60) + ' 分钟前';
    if (s < 86400) return Math.floor(s / 3600) + ' 小时前';
    return Math.floor(s / 86400) + ' 天前';
  }
  function isNearBottom() {
    const b = $('messages');
    return b.scrollHeight - b.scrollTop - b.clientHeight < 120;
  }
  function scrollBottom(instant) {
    const b = $('messages');
    b.scrollTo({ top: b.scrollHeight, behavior: instant ? 'auto' : 'smooth' });
  }
  let toastTimer;
  function toast(text) {
    const t = $('toast');
    t.textContent = text;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 3200);
  }
  function autoGrow() {
    const el = $('input');
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  // ---- 事件绑定 ----
  function bind() {
    $('btn-send').onclick = doSend;
    $('input').addEventListener('input', autoGrow);
    $('input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    });
    $('btn-back').onclick = () => {
      document.body.classList.remove('view-chat');
    };
    $('btn-stop').onclick = () => {
      if (state.active) { send({ type: 'stop', sessionId: state.active }); toast('已发送停止信号'); }
    };
    $('btn-refresh').onclick = () => send({ type: 'list' });
    $('search').addEventListener('input', renderList);

    const openModal = () => {
      $('modal').classList.remove('hidden');
      fetch(apiUrl('/api/dirs')).then((r) => r.json()).then((d) => {
        const dl = $('dir-list');
        dl.innerHTML = (d.dirs || []).map((x) => `<option value="${esc(x)}">`).join('');
        if (!$('new-cwd').value && d.dirs && d.dirs[0]) $('new-cwd').value = d.dirs[0];
      }).catch(() => {});
      setTimeout(() => $('new-text').focus(), 100);
    };
    $('btn-new').onclick = openModal;
    $('btn-new-2').onclick = openModal;
    $('modal-cancel').onclick = () => $('modal').classList.add('hidden');
    $('modal').onclick = (e) => { if (e.target === $('modal')) $('modal').classList.add('hidden'); };
    $('modal-create').onclick = () => {
      const cwd = $('new-cwd').value.trim();
      const text = $('new-text').value.trim();
      if (!text) { toast('请填写首条指令'); return; }
      send({ type: 'create', cwd, text });
      $('modal').classList.add('hidden');
      $('new-text').value = '';
    };

    // 密钥弹窗提交
    const submitKey = () => {
      const k = $('key-input').value.trim();
      if (!k) { toast('请输入密钥'); return; }
      accessKey = k;
      localStorage.setItem('mc_key', k);
      authFailed = false;
      $('key-modal').classList.add('hidden');
      setConn('', '连接中');
      state.reconnectDelay = 800;
      connect();
    };
    $('key-submit').onclick = submitKey;
    $('key-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitKey(); });

    // 相对时间定时刷新
    setInterval(() => { if (state.sessions.length) renderList(); }, 30000);
  }

  bind();
  connect();
})();
