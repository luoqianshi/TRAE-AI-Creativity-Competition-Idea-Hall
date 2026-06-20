/* ==========================================================================
   心语 · 无风险表白网站 · 核心逻辑
   ========================================================================== */

(function() {
  'use strict';

  /* ---------- 数据存储层 ---------- */
  const STORAGE_KEY = 'xinyu_secret_crush_v1';

  // 数据结构：
  // {
  //   currentUser: "1234",  // 当前登录的末4位
  //   users: {
  //     "1234": { registered: 1234567890, lastActive: 1234567890 },
  //     "5678": { ... }
  //   },
  //   confessions: [
  //     { id, from: "1234", to: "5678", message: "...", timestamp: 12345, read: false, matched: true/false }
  //   ],
  //   readMessages: { "1234": ["msgId1", "msgId2"] }
  // }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultData();
      const data = JSON.parse(raw);
      // 数据迁移 / 完整性检查
      if (!data.users) data.users = {};
      if (!data.confessions) data.confessions = [];
      if (!data.readMessages) data.readMessages = {};
      return data;
    } catch (e) {
      console.warn('数据读取失败，使用默认数据', e);
      return getDefaultData();
    }
  }

  function getDefaultData() {
    return {
      currentUser: null,
      users: {},
      confessions: [],
      readMessages: {}
    };
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('数据保存失败', e);
      showToast('数据保存失败：浏览器存储可能已满', 'error');
    }
  }

  let appData = loadData();

  /* ---------- 工具函数 ---------- */
  function generateId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;

    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + (type || '');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  /* ---------- 视图切换 ---------- */
  function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + viewName);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* ---------- 登录逻辑 ---------- */
  function handleLogin(code) {
    if (!/^\d{4}$/.test(code)) {
      showToast('请输入 4 位数字', 'error');
      return;
    }

    // 注册或登录用户
    if (!appData.users[code]) {
      appData.users[code] = {
        registered: Date.now(),
        lastActive: Date.now()
      };
    } else {
      appData.users[code].lastActive = Date.now();
    }

    appData.currentUser = code;
    saveData(appData);

    // 检查是否有新匹配需要庆祝
    const newMatches = checkNewMatches(code);
    switchView('dashboard');
    renderDashboard();

    if (newMatches > 0) {
      setTimeout(() => {
        showMatchCelebration(newMatches);
      }, 400);
    } else {
      showToast(`欢迎回来，${code}`, 'success');
    }
  }

  function handleLogout() {
    appData.currentUser = null;
    saveData(appData);
    document.getElementById('loginCode').value = '';
    document.getElementById('loginBtn').disabled = true;
    switchView('login');
    showToast('已安全退出');
  }

  /* ---------- 匹配检测 ---------- */
  function checkNewMatches(userCode) {
    // 找出所有 "发给当前用户" 且对方也表白了当前用户的记录
    // 标记为已匹配（matched = true），但只对新匹配计数
    let newMatchCount = 0;

    appData.confessions.forEach(c => {
      if (c.to === userCode && !c.matched) {
        // 查找对方是否也表白了 userCode
        const reciprocated = appData.confessions.find(
          other => other.from === userCode && other.to === c.from
        );
        if (reciprocated) {
          c.matched = true;
          reciprocated.matched = true;
          // 双向同时标记
          newMatchCount++;
        }
      }
    });

    // 同样要检查 from userCode 的那些
    appData.confessions.forEach(c => {
      if (c.from === userCode && !c.matched) {
        const reciprocated = appData.confessions.find(
          other => other.from === c.to && other.to === userCode
        );
        if (reciprocated) {
          c.matched = true;
          reciprocated.matched = true;
        }
      }
    });

    saveData(appData);
    return newMatchCount;
  }

  /* ---------- 表白逻辑 ---------- */
  function handleConfess(targetCode, message) {
    if (!/^\d{4}$/.test(targetCode)) {
      showToast('请输入有效的 4 位末号', 'error');
      return;
    }

    if (targetCode === appData.currentUser) {
      showToast('不能给自己表白哦 ~', 'error');
      return;
    }

    const trimmed = (message || '').trim();
    if (!trimmed) {
      showToast('写下一句表白话吧', 'error');
      return;
    }
    if (trimmed.length > 100) {
      showToast('表白话不能超过 100 字', 'error');
      return;
    }

    // 检查是否已向同一末4位表白过
    const existing = appData.confessions.find(
      c => c.from === appData.currentUser && c.to === targetCode
    );
    if (existing) {
      showToast(`你已经向 ${targetCode} 表白过啦 ~`, 'error');
      return;
    }

    // 创建表白记录
    const confession = {
      id: generateId(),
      from: appData.currentUser,
      to: targetCode,
      message: trimmed,
      timestamp: Date.now(),
      read: false,
      matched: false
    };
    appData.confessions.push(confession);

    // 检查是否形成匹配
    const reciprocated = appData.confessions.find(
      c => c.from === targetCode && c.to === appData.currentUser
    );

    let matched = false;
    if (reciprocated) {
      confession.matched = true;
      reciprocated.matched = true;
      matched = true;
    }

    saveData(appData);

    // 触发表白回馈
    if (matched) {
      // 弹出匹配庆祝
      setTimeout(() => {
        showMatchModal(targetCode, confession.message, reciprocated.message);
      }, 300);
    } else {
      // 提示已发送
      // 检查对方是否注册
      const targetExists = appData.users[targetCode];
      if (targetExists) {
        showToast(`表白已送达！${targetCode} 也已注册，等 TA 表白你吧`, 'success');
      } else {
        showToast(`表白已发送！告诉 ${targetCode} 来注册吧 ~`, 'success');
      }
    }

    // 清空表单
    document.getElementById('crushCode').value = '';
    document.getElementById('crushMessage').value = '';
    document.getElementById('charCounter').textContent = '0 / 100';

    // 刷新仪表板
    renderDashboard();
  }

  /* ---------- 匹配庆祝弹窗 ---------- */
  function showMatchModal(targetCode, myMessage, theirMessage) {
    const modal = document.getElementById('modal');
    modal.innerHTML = `
      <div class="match-celebration">
        <div class="match-icon">💕</div>
        <div class="match-text">双向暗恋<em>达成</em>！</div>
        <div class="match-subtext">
          你和 <strong style="color: var(--accent); font-family: 'JetBrainsMono', monospace;">${escapeHtml(targetCode)}</strong> 互相暗恋<br>
          这就是传说中的… 命中注定？
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #fff5f7, #fef0e8); border: 1px solid var(--accent-soft); border-radius: 14px; padding: 1.2rem 1.4rem; margin-bottom: 1rem;">
        <div style="font-size: 0.78rem; color: var(--muted); margin-bottom: 0.5rem; letter-spacing: 0.05em;">TA 对你说：</div>
        <div style="font-family: 'InstrumentSerif', serif; font-size: 1.15rem; font-style: italic; color: var(--ink); line-height: 1.6;">"${escapeHtml(theirMessage)}"</div>
      </div>

      <div style="background: var(--bg); border: 1px solid var(--rule-soft); border-radius: 14px; padding: 1.2rem 1.4rem; margin-bottom: 1.5rem;">
        <div style="font-size: 0.78rem; color: var(--muted); margin-bottom: 0.5rem; letter-spacing: 0.05em;">你曾对 TA 说：</div>
        <div style="font-family: 'InstrumentSerif', serif; font-size: 1.15rem; font-style: italic; color: var(--ink); line-height: 1.6;">"${escapeHtml(myMessage)}"</div>
      </div>

      <div style="text-align: center; color: var(--muted); font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.5rem;">
        💝 勇敢一点，<strong style="color: var(--accent);">去找 TA 吧</strong><br>
        既然心有灵犀，何不勇敢相认
      </div>

      <button class="btn btn-primary" onclick="document.getElementById('modalOverlay').classList.remove('active')">
        我知道了
      </button>
    `;
    document.getElementById('modalOverlay').classList.add('active');

    // 启动额外的爱心特效
    spawnHearts(20);
  }

  function showMatchCelebration(count) {
    if (count > 0) {
      showToast(`💕 你有 ${count} 个新的双向暗恋！`, 'success');
    }
  }

  /* ---------- 渲染仪表板 ---------- */
  function renderDashboard() {
    const me = appData.currentUser;
    if (!me) return;

    // 头部
    document.getElementById('userAvatar').textContent = me;
    document.getElementById('userCode').textContent = me;

    // 收到的表白（只显示已匹配的）
    const myReceived = appData.confessions
      .filter(c => c.to === me && c.matched)
      .sort((a, b) => b.timestamp - a.timestamp);

    // 我发出的表白
    const mySent = appData.confessions
      .filter(c => c.from === me)
      .sort((a, b) => b.timestamp - a.timestamp);

    // 统计
    document.getElementById('statSent').textContent = mySent.length;
    document.getElementById('statReceived').textContent = myReceived.length;
    document.getElementById('statMatched').textContent = myReceived.length;
    document.getElementById('receivedBadge').textContent = myReceived.length;
    document.getElementById('sentBadge').textContent = mySent.length;

    // 状态卡片
    renderStatus(myReceived.length, mySent.length);

    // 收到的表白列表
    renderReceivedList(myReceived);

    // 我的告白列表
    renderSentList(mySent);
  }

  function renderStatus(matchedCount, sentCount) {
    const statusIcon = document.querySelector('#statusArea .status-icon');
    const statusTitle = document.getElementById('statusTitle');
    const statusSubtitle = document.getElementById('statusSubtitle');

    if (matchedCount > 0) {
      statusIcon.textContent = '💖';
      statusTitle.innerHTML = `你已收获 <em style="color: var(--accent);">${matchedCount}</em> 份双向暗恋`;
      statusSubtitle.innerHTML = '点击下方"收到的表白"查看 TA 们的心意<br>愿你勇敢，把缘分说出口';
    } else if (sentCount > 0) {
      statusIcon.textContent = '💌';
      statusTitle.innerHTML = '你的心意正在路上…';
      statusSubtitle.innerHTML = '已经勇敢地迈出第一步<br>现在，静静等待对方也写下 TA 的心意吧';
    } else {
      statusIcon.textContent = '✨';
      statusTitle.innerHTML = '说出你藏在心底的那句话';
      statusSubtitle.innerHTML = '填写上方表单，勇敢地写下<br>属于你的第一句表白';
    }
  }

  function renderReceivedList(messages) {
    const container = document.getElementById('messagesList');
    if (messages.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-text">还没有收到表白</div>
          <div class="empty-state-sub">当有人暗恋你并表白了你的末4位，<br>且你们互相暗恋时，你会看到</div>
        </div>
      `;
      return;
    }

    container.innerHTML = messages.map(m => `
      <div class="message-card" data-id="${escapeHtml(m.id)}">
        <div class="message-meta">
          <span>来自末号</span>
          <span class="message-from">${escapeHtml(m.from)}</span>
          <span class="message-time">${formatTime(m.timestamp)}</span>
        </div>
        <div class="message-body">${escapeHtml(m.message)}</div>
      </div>
    `).join('');
  }

  function renderSentList(sentList) {
    const container = document.getElementById('confessList');
    if (sentList.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💭</div>
          <div class="empty-state-text">还没有发出表白</div>
          <div class="empty-state-sub">勇敢一点，写下第一句<br>属于你的真心话</div>
        </div>
      `;
      return;
    }

    container.innerHTML = sentList.map(c => {
      const statusClass = c.matched ? 'matched' : 'pending';
      const statusText = c.matched ? '💕 双向暗恋' : '⏳ 等待对方';
      return `
        <div class="confess-item">
          <div class="confess-target">
            <span class="confess-code">${escapeHtml(c.to)}</span>
            <span class="confess-text">"${escapeHtml(c.message)}"</span>
          </div>
          <span class="confess-status ${statusClass}">${statusText}</span>
        </div>
      `;
    }).join('');
  }

  /* ---------- 飘落爱心 ---------- */
  function spawnHearts(count) {
    const container = document.getElementById('floatingHearts');
    const symbols = ['♥', '❤', '💕', '💖', '💗'];
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart';
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      heart.style.left = Math.random() * 100 + '%';
      heart.style.fontSize = (16 + Math.random() * 24) + 'px';
      heart.style.animationDuration = (8 + Math.random() * 6) + 's';
      heart.style.animationDelay = (Math.random() * 2) + 's';
      heart.style.opacity = (0.2 + Math.random() * 0.3).toString();
      container.appendChild(heart);
      setTimeout(() => heart.remove(), 16000);
    }
  }

  function initFloatingHearts() {
    // 持续生成背景爱心
    setInterval(() => spawnHearts(2), 3000);
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    // 登录表单
    const loginCode = document.getElementById('loginCode');
    const loginBtn = document.getElementById('loginBtn');
    const loginForm = document.getElementById('loginForm');

    loginCode.addEventListener('input', (e) => {
      // 只允许数字
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
      loginBtn.disabled = e.target.value.length !== 4;
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin(loginCode.value);
    });

    // 帮助展开
    const helpToggle = document.getElementById('helpToggle');
    const helpContent = document.getElementById('helpContent');
    helpToggle.addEventListener('click', () => {
      helpContent.classList.toggle('open');
      helpToggle.textContent = helpContent.classList.contains('open')
        ? '✕ 收起说明'
        : 'ℹ️ 这怎么运作的？';
    });

    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', () => {
      if (confirm('确定要退出登录吗？你的数据会保留在本地浏览器中。')) {
        handleLogout();
      }
    });

    // 表白表单
    const crushCode = document.getElementById('crushCode');
    const crushMessage = document.getElementById('crushMessage');
    const charCounter = document.getElementById('charCounter');
    const confessForm = document.getElementById('confessForm');

    crushCode.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });

    crushMessage.addEventListener('input', (e) => {
      const len = e.target.value.length;
      charCounter.textContent = `${len} / 100`;
      if (len > 85) charCounter.classList.add('warn');
      else charCounter.classList.remove('warn');
    });

    confessForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleConfess(crushCode.value, crushMessage.value);
    });

    // 模态框点击外部关闭
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') {
        e.target.classList.remove('active');
      }
    });

    // ESC 关闭模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('modalOverlay').classList.remove('active');
      }
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    bindEvents();
    initFloatingHearts();

    // 检查是否已登录
    if (appData.currentUser && appData.users[appData.currentUser]) {
      // 自动登录
      const newMatches = checkNewMatches(appData.currentUser);
      switchView('dashboard');
      renderDashboard();
      if (newMatches > 0) {
        setTimeout(() => showMatchCelebration(newMatches), 500);
      }
    } else {
      switchView('login');
    }
  }

  // 暴露调试接口
  window.__xinyu = {
    data: () => appData,
    reset: () => {
      if (confirm('确定要清空所有本地数据吗？这将删除所有用户、表白和匹配记录。')) {
        localStorage.removeItem(STORAGE_KEY);
        appData = loadData();
        handleLogout();
        showToast('所有数据已清空');
      }
    }
  };

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
