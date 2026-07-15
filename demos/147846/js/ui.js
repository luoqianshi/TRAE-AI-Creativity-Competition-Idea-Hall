/* ============================================================
   UI 模块 - 界面渲染与动画辅助
   包含倒计时、页面切换、胶囊列表渲染等
   ============================================================ */

const UI = (() => {
  // ---------- 图标映射 ----------
  const ICON_MAP = {
    star: '⭐',
    heart: '💖',
    envelope: '✉️'
  };

  // ---------- AI 寄语降级库 ----------
  const AI_MESSAGES = [
    '愿时光温柔，愿你初心不改。',
    '此刻的你，是否活成了当时期待的模样？',
    '时间是最好的礼物，打开它，拥抱自己。',
    '不要忘记，你曾经如此认真地生活过。',
    '每一个现在，都是未来的过去。',
    '愿你历经山河，仍觉人间值得。',
    '岁月不居，时节如流，愿君安好。',
    '你走过的路，都藏在声音里。',
    '给时间一点时间，让过去过去。',
    '有些话，只能对未来的自己说。',
    '别怕，未来的路，光一直都在。',
    '你在春天种下的种子，此刻正在发芽。',
    '愿你的每一天，都如初见般美好。',
    '所有的等待，都是为了更好的相遇。'
  ];

  /** 随机取一条寄语（AI 降级方案） */
  function getRandomAI() {
    return AI_MESSAGES[Math.floor(Math.random() * AI_MESSAGES.length)];
  }

  // ---------- 页面路由 ----------
  let pageHistory = [];

  /** 显示指定页面，支持路由历史 */
  function showPage(pageId, pushHistory = true) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageId);
    if (page) {
      page.classList.add('active');
      // 重新触发页面内动画
      page.style.animation = 'none';
      requestAnimationFrame(() => {
        page.style.animation = '';
      });
    }
    if (pushHistory) {
      pageHistory.push(pageId);
    }
  }

  /** 返回上一页 */
  function goBack() {
    if (pageHistory.length > 1) {
      pageHistory.pop(); // 当前页
      const prev = pageHistory[pageHistory.length - 1];
      showPage(prev, false);
    }
  }

  /** 获取当前页 ID */
  function getCurrentPage() {
    const active = document.querySelector('.page.active');
    return active ? active.id : 'page-list';
  }

  // ---------- Toast 提示 ----------
  let toastTimer = null;

  function showToast(message, duration = 2500) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // ---------- 格式化时间 ----------
  function formatDate(timestamp) {
    const d = new Date(timestamp);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${y}年${m}月${day}日`;
  }

  function formatShortDate(timestamp) {
    const d = new Date(timestamp);
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${m}月${day}日`;
  }

  // ---------- 倒计时 ----------
  let countdownTimer = null;

  function startCountdown(unlockTime, displayEls) {
    const { days, hours, minutes, seconds, container } = displayEls;
    stopCountdown();

    function tick() {
      const now = Date.now();
      const diff = unlockTime - now;

      if (diff <= 0) {
        // 已到解锁时间
        if (days) days.textContent = '00';
        if (hours) hours.textContent = '00';
        if (minutes) minutes.textContent = '00';
        if (seconds) seconds.textContent = '00';
        if (container) container.style.display = 'none';
        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      if (days) days.textContent = d.toString().padStart(2, '0');
      if (hours) hours.textContent = h.toString().padStart(2, '0');
      if (minutes) minutes.textContent = m.toString().padStart(2, '0');
      if (seconds) seconds.textContent = s.toString().padStart(2, '0');
    }

    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  // ---------- 计算剩余天数 ----------
  function getDaysUntil(unlockTime) {
    const diff = unlockTime - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / 86400000);
  }

  // ---------- 生成唯一ID ----------
  function generateId() {
    return Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  // ---------- 渲染胶囊列表 ----------
  function renderCapsuleList() {
    const container = document.getElementById('capsule-list');
    if (!container) return;

    const capsules = Storage.getCapsules();
    const now = Date.now();

    if (capsules.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <div class="empty-state-title">还没有胶囊</div>
          <div class="empty-state-desc">给未来的自己写一封信吧</div>
        </div>
      `;
      return;
    }

    let html = '';
    for (const cap of capsules) {
      const isLocked = now < cap.unlockTime;
      const icon = ICON_MAP[cap.coverIcon] || '⭐';
      const title = (cap.title || '未命名').substring(0, 20);
      const days = getDaysUntil(cap.unlockTime);

      html += `
        <div class="capsule-card" data-id="${cap.id}">
          <div class="capsule-card-cover" style="background: ${cap.coverColor}">
            <span>${icon}</span>
            ${isLocked ? '<span class="lock-badge">🔒</span>' : ''}
          </div>
          <div class="capsule-card-info">
            <div class="capsule-card-title">${title}</div>
            <div class="capsule-card-meta">${formatDate(cap.createTime)}</div>
          </div>
          <div class="capsule-card-status ${isLocked ? 'status-locked' : 'status-unlocked'}">
            ${isLocked ? `还有 ${days} 天解锁` : '点击打开'}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    // 绑定点击事件
    container.querySelectorAll('.capsule-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        App.openCapsuleDetail(id);
      });
    });
  }

  // ---------- 更新密码锁描述 ----------
  function updatePasswordDesc() {
    const settings = Storage.getSettings();
    const desc = document.getElementById('pwd-desc');
    if (desc) {
      desc.textContent = settings.password ? '已设置' : '未设置';
    }
  }

  // ---------- 应用主题 ----------
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    // 更新切换开关
    const toggle = document.getElementById('toggle-dark');
    if (toggle) toggle.checked = theme === 'dark';
    // 更新 meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = theme === 'dark' ? '#1E1A17' : '#FAF6F0';
    }
  }

  // ---------- 公开 API ----------
  return {
    ICON_MAP,
    getRandomAI,
    showPage,
    goBack,
    getCurrentPage,
    showToast,
    formatDate,
    formatShortDate,
    startCountdown,
    stopCountdown,
    getDaysUntil,
    generateId,
    renderCapsuleList,
    updatePasswordDesc,
    applyTheme
  };
})();
