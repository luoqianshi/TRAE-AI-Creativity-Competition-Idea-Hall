let currentAnswer = '';
let currentAnswer2 = '';
let currentAnswer3 = '';
let sidebarUserCollapsed = false;
let smsCooldownSeconds = 0;
let smsCooldownIntervalId = null;

const PAGE_ROUTES = {
  1: 'login.html',
  2: 'home.html',
  3: 'learn.html',
  4: 'learn-module-1.html',
  5: 'learn-lesson-1-1.html',
  6: 'practice.html',
  7: 'practice-module-1.html',
  8: 'practice-worksheet-1-1.html',
  9: 'wrongbook.html',
  10: 'wrongbook-module-1.html',
  11: 'wrongbook-fix-1.html',
  12: 'tools.html',
  13: 'tool-sticks.html',
  14: 'tool-counter.html',
  15: 'tool-decompose.html',
  16: 'tool-numberline.html',
  17: 'tool-beads10.html',
  18: 'tool-banana.html',
  19: 'tool-tenframe.html'
};

/**
 * 判断当前页面是否位于 src 目录内，用于兼容根目录 home.html 与 src 内页面的相对路径。
 */
function isInSrcDirectory() {
  const path = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
  return /\/src\/[^/]+$/.test(path);
}

/**
 * 解析静态资源路径：根目录 home.html 访问 src 资源，src 内页面继续访问同级资源。
 */
function resolveAssetPath(fileName) {
  return isInSrcDirectory() ? `./${fileName}` : `./src/${fileName}`;
}

/**
 * 解析页面跳转路径：home.html 保持根目录，其余页面迁移到 src 后按当前目录生成正确地址。
 */
function resolvePagePath(fileName) {
  if (fileName === 'home.html') {
    return isInSrcDirectory() ? '../home.html' : './home.html';
  }
  return isInSrcDirectory() ? `./${fileName}` : `./src/${fileName}`;
}

function normalizePageId(pageId) {
  if (typeof pageId === 'string') {
    const m = pageId.match(/^page-(\d+)$/);
    if (m) return Number(m[1]);
    const n = Number(pageId);
    if (!Number.isNaN(n)) return n;
  }
  return pageId;
}

function getCurrentPageId() {
  const el = document.querySelector('.page-container[id^="page-"]');
  if (!el || !el.id) return null;
  const m = el.id.match(/^page-(\d+)$/);
  return m ? Number(m[1]) : null;
}

function ensureSidebar() {
  const pid = getCurrentPageId();
  if (!pid || pid === 1) return;

  const app = document.getElementById('app');
  const content = document.getElementById('contentRoot');
  if (!app || !content) return;

  if (!document.getElementById('sidebarNav')) {
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebarNav';
    sidebar.className = 'hidden lg:flex sidebar-disabled fixed left-0 top-0 h-full w-56 bg-white/95 backdrop-blur-sm border-r border-indigo-100 z-50 flex-col';
    sidebar.innerHTML = `
      <div class="p-6 border-b border-indigo-100 flex items-start justify-between gap-3">
        <div class="flex flex-col gap-2">
          <img src="${resolveAssetPath('logo.png')}" alt="星童学" class="h-10 w-auto select-none" draggable="false">
          <p class="text-sm text-gray-500">小学计算训练平台</p>
        </div>
        <button id="sidebarToggleBtn" onclick="toggleSidebar()" class="p-2 hover:bg-indigo-100 rounded-xl transition" aria-label="收起左侧菜单">
          <i data-lucide="chevron-left" class="w-5 h-5 text-indigo-600"></i>
        </button>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <div class="sidebar-nav-item" onclick="goToPage(2)">
          <i data-lucide="home" class="w-5 h-5"></i>
          <span>首页</span>
        </div>
        <div class="sidebar-nav-item" onclick="goToPage(3)">
          <i data-lucide="book-open" class="w-5 h-5"></i>
          <span>学习</span>
        </div>
        <div class="sidebar-nav-item" onclick="goToPage(6)">
          <i data-lucide="pen-tool" class="w-5 h-5"></i>
          <span>练习</span>
        </div>
        <div class="sidebar-nav-item" onclick="goToPage(9)">
          <i data-lucide="file-x" class="w-5 h-5"></i>
          <span>错题本</span>
        </div>
        <div class="sidebar-nav-item" onclick="goToPage(12)">
          <i data-lucide="wrench" class="w-5 h-5"></i>
          <span>工具</span>
        </div>
      </nav>
      <div class="p-4 border-t border-indigo-100">
        <div class="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
          <div class="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center">
            <i data-lucide="user" class="w-5 h-5 text-indigo-600"></i>
          </div>
          <div>
            <p class="font-medium text-sm text-gray-800">小明同学</p>
            <p class="text-xs text-gray-500">学习中</p>
          </div>
        </div>
        <button class="clay-button w-full mt-3" style="background: linear-gradient(145deg, #FCA5A5, #F87171); border-color: #EF4444; color: white" onclick="logout()">
          <i data-lucide="log-out" class="w-5 h-5"></i>
          退出
        </button>
      </div>
    `;
    app.insertBefore(sidebar, app.firstChild);
  }

  if (!document.getElementById('sidebarToggleFloating')) {
    const btn = document.createElement('button');
    btn.id = 'sidebarToggleFloating';
    btn.setAttribute('onclick', 'toggleSidebar()');
    btn.className = 'sidebar-toggle sidebar-toggle-hidden fixed left-4 top-4 z-50 p-2 bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-xl shadow-md hover:bg-indigo-50 transition';
    btn.setAttribute('aria-label', '展开左侧菜单');
    btn.innerHTML = `<i data-lucide="chevron-right" class="w-5 h-5 text-indigo-600"></i>`;
    app.insertBefore(btn, content);
  }

  content.classList.add('lg:ml-56');
  content.classList.add('sidebar-offset-disabled');
}

function setSidebarEnabled(enabled) {
  const sidebar = document.getElementById('sidebarNav');
  const content = document.getElementById('contentRoot');
  const floatingToggle = document.getElementById('sidebarToggleFloating');
  if (!sidebar || !content) return;

  if (!enabled) {
    sidebar.classList.add('sidebar-disabled');
    content.classList.add('sidebar-offset-disabled');
    if (floatingToggle) floatingToggle.classList.add('sidebar-toggle-hidden');
    return;
  }

  sidebar.classList.toggle('sidebar-disabled', sidebarUserCollapsed);
  content.classList.toggle('sidebar-offset-disabled', sidebarUserCollapsed);
  if (floatingToggle) floatingToggle.classList.toggle('sidebar-toggle-hidden', !sidebarUserCollapsed);
}

function toggleSidebar() {
  const loginPage = document.getElementById('page-1');
  const isLoginActive = !!loginPage && loginPage.classList.contains('active');
  if (isLoginActive) return;

  sidebarUserCollapsed = !sidebarUserCollapsed;
  setSidebarEnabled(true);
  lucide.createIcons();
}

function logout() {
  sidebarUserCollapsed = false;
  goToPage(1);
}

function goToPage(pageId) {
  const pid = normalizePageId(pageId);
  const pageEl = document.getElementById(`page-${pid}`);
  if (!pageEl) {
    const url = PAGE_ROUTES[pid];
    if (url) window.location.href = resolvePagePath(url);
    return;
  }

  document.querySelectorAll('.page-container').forEach(p => p.classList.remove('active'));
  pageEl.classList.add('active');
  setSidebarEnabled(pid !== 1);
  if (pid === 1) resetLoginFlow();
  updateSidebarNav(pid);
  lucide.createIcons();
  if (pid === 13 && window.stickTool) window.stickTool.sync();
  if (pid === 14 && window.counterTool) window.counterTool.sync();
  if (pid === 15 && window.decomposeTool) window.decomposeTool.sync();
  if (pid === 16 && window.numberLineTool) window.numberLineTool.sync();
  if (pid === 17 && window.cube10Tool) window.cube10Tool.sync();
  if (pid === 18 && window.bananaTool) window.bananaTool.sync();
  if (pid === 19 && window.tenFrameTool) window.tenFrameTool.sync();
  window.scrollTo(0, 0);
}

function updateSidebarNav(pageId) {
  const pid = normalizePageId(pageId);
  const sidebarItems = document.querySelectorAll('.sidebar-nav-item');
  const pageToNav = {
    2: 0,
    3: 1,
    4: 1,
    5: 1,
    6: 2,
    7: 2,
    8: 2,
    9: 3,
    10: 3,
    11: 3,
    12: 4
  };
  const navIndex = (pid >= 12 && pid <= 19) ? 4 : pageToNav[pid];
  if (navIndex !== undefined && sidebarItems[navIndex]) {
    sidebarItems.forEach(item => item.classList.remove('active'));
    sidebarItems[navIndex].classList.add('active');
  }
}

window.stickTool = (() => {
  const state = { tens: 0, ones: 0, expr: '' };
  const effect = { flashOnes: false, flashTens: false, popLastTens: false, totalFlash: false, shakeOnes: false, shakeTens: false };
  let isPlaying = false;
  let playToken = 0;

  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));
  const setStepText = (msg) => {
    const el = $('stickStepText');
    if (el) el.textContent = msg;
  };

  function clampTotal(total) {
    if (Number.isNaN(total)) return 0;
    return Math.max(0, Math.min(100, total));
  }

  function getTotal() {
    return state.tens * 10 + state.ones;
  }

  function setTotal(total, expr) {
    const v = clampTotal(total);
    state.tens = Math.floor(v / 10);
    state.ones = v % 10;
    state.expr = expr || state.expr || '';
    render();
  }

  function render() {
    const tensArea = $('stickTensArea');
    const onesArea = $('stickOnesArea');
    const tensValue = $('stickTensValue');
    const onesValue = $('stickOnesValue');
    const totalValue = $('stickTotalValue');
    const exprEl = $('stickExpression');

    if (tensValue) tensValue.textContent = String(state.tens);
    if (onesValue) onesValue.textContent = String(state.ones);
    if (totalValue) totalValue.textContent = String(getTotal());
    if (exprEl) exprEl.textContent = state.expr ? state.expr : '—';

    const rodHtml = (count, isBundle) => Array.from({ length: count }, () => `<div class="stick-rod ${isBundle ? 'bundle' : 'single'}"></div>`).join('');
    
    // 更新所有可能的演示区域
    const areas = [
      { t: $('stickTensArea'), o: $('stickOnesArea') },
      { t: $('stickAddTensArea'), o: $('stickAddOnesArea') },
      { t: $('stickSubTensArea'), o: $('stickSubOnesArea') }
    ];

    areas.forEach(group => {
      if (group.t) group.t.innerHTML = rodHtml(state.tens, true);
      if (group.o) group.o.innerHTML = rodHtml(state.ones, false);
      
      if (group.t && effect.flashTens) {
        group.t.classList.remove('flash');
        void group.t.offsetWidth;
        group.t.classList.add('flash');
      }
      if (group.o && effect.flashOnes) {
        group.o.classList.remove('flash');
        void group.o.offsetWidth;
        group.o.classList.add('flash');
      }
      if (group.t && effect.shakeTens) {
        group.t.classList.remove('shake');
        void group.t.offsetWidth;
        group.t.classList.add('shake');
      }
      if (group.o && effect.shakeOnes) {
        group.o.classList.remove('shake');
        void group.o.offsetWidth;
        group.o.classList.add('shake');
      }
      if (group.t && effect.popLastTens) {
        const last = group.t.lastElementChild;
        if (last) {
          last.classList.remove('pop');
          void last.offsetWidth;
          last.classList.add('pop');
        }
      }
    });

    if (totalValue && effect.totalFlash) {
      totalValue.classList.remove('stick-total-flash');
      void totalValue.offsetWidth;
      totalValue.classList.add('stick-total-flash');
    }

    effect.flashOnes = false;
    effect.flashTens = false;
    effect.popLastTens = false;
    effect.totalFlash = false;
    effect.shakeOnes = false;
    effect.shakeTens = false;
  }

  function setButtonsEnabled(enabled) {
    const ids = [
      'stickBtnMinus10', 'stickBtnPlus10', 'stickBtnMinus1', 'stickBtnPlus1',
      'stickDemoAddCarry', 'stickDemoSubBorrow'
    ];
    ids.forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.disabled = !enabled;
      el.classList.toggle('opacity-50', !enabled);
      el.classList.toggle('cursor-not-allowed', !enabled);
    });
    
    // 停止按钮的状态与操作按钮相反
    ['stickDemoStop', 'stickDemoStop2'].forEach(id => {
      const btn = $(id);
      if (btn) {
        btn.disabled = enabled;
        btn.classList.toggle('opacity-50', enabled);
        btn.classList.toggle('cursor-not-allowed', enabled);
      }
    });
  }

  async function addOne(expr) {
    const beforeTotal = getTotal();
    if (beforeTotal >= 100) {
      effect.totalFlash = true;
      effect.shakeOnes = true;
      setStepText('已达到上限 100，不能再加。');
      render();
      return;
    }

    const onesBefore = state.ones;
    state.ones += 1;
    state.expr = expr || state.expr;

    if (state.ones === 10) {
      effect.flashOnes = true;
      render();
      await sleep(260);
      state.ones = 0;
      state.tens += 1;
      effect.flashTens = true;
      effect.popLastTens = true;
      render();
      return;
    }

    if (onesBefore !== state.ones) effect.flashOnes = true;
    render();
  }

  async function subOne(expr) {
    const beforeTotal = getTotal();
    if (beforeTotal <= 0) {
      effect.totalFlash = true;
      effect.shakeOnes = true;
      setStepText('当前为 0，不能再减。');
      render();
      return;
    }

    state.expr = expr || state.expr;

    if (state.ones > 0) {
      state.ones -= 1;
      effect.flashOnes = true;
      render();
      return;
    }

    if (state.tens > 0) {
      effect.shakeTens = true;
      effect.flashTens = true;
      render();
      await sleep(220);

      state.tens -= 1;
      state.ones = 10;
      effect.flashOnes = true;
      effect.flashTens = true;
      render();
      await sleep(260);

      state.ones -= 1;
      effect.flashOnes = true;
      render();
    }
  }

  async function addTen(expr) {
    const beforeTotal = getTotal();
    if (beforeTotal >= 100) {
      effect.totalFlash = true;
      effect.shakeTens = true;
      setStepText('已达到上限 100，不能再加 10。');
      render();
      return;
    }

    const next = clampTotal(beforeTotal + 10);
    if (next === beforeTotal) {
      effect.totalFlash = true;
      effect.shakeTens = true;
      setStepText('已达到上限 100，不能再加 10。');
      render();
      return;
    }

    state.tens = Math.floor(next / 10);
    state.ones = next % 10;
    state.expr = expr || state.expr;
    effect.flashTens = true;
    effect.popLastTens = true;
    render();
  }

  async function subTen(expr) {
    const beforeTotal = getTotal();
    if (beforeTotal <= 0) {
      effect.totalFlash = true;
      effect.shakeTens = true;
      setStepText('当前为 0，不能再减 10。');
      render();
      return;
    }

    const next = clampTotal(beforeTotal - 10);
    if (next === beforeTotal) {
      effect.totalFlash = true;
      effect.shakeTens = true;
      setStepText('当前不足 10，不能再减 10。');
      render();
      return;
    }

    state.tens = Math.floor(next / 10);
    state.ones = next % 10;
    state.expr = expr || state.expr;
    effect.flashTens = true;
    render();
  }

  async function playSteps(steps, exprPrefix) {
    isPlaying = true;
    playToken += 1;
    const token = playToken;
    setButtonsEnabled(false);
    const stepText = $('stickStepText');
    try {
      for (let i = 0; i < steps.length; i += 1) {
        if (!isPlaying || token !== playToken) return;
        const s = steps[i];
        if (stepText) stepText.textContent = s.tip || '';
        if (s.setTotal !== undefined) setTotal(s.setTotal, s.expr || exprPrefix || '');
        if (s.addOne) await addOne(s.expr || exprPrefix || '');
        if (s.subOne) await subOne(s.expr || exprPrefix || '');
        if (s.addTen) await addTen(s.expr || exprPrefix || '');
        if (s.subTen) await subTen(s.expr || exprPrefix || '');
        await sleep(s.waitMs || 420);
      }
    } finally {
      isPlaying = false;
      if (token === playToken) {
        setButtonsEnabled(true);
        if (stepText && !stepText.textContent) stepText.textContent = '提示：满十会自动合并成 1 捆；个位为 0 再减会自动拆 1 捆借位。';
      }
    }
  }

  function stop() {
    isPlaying = false;
    playToken += 1;
    setButtonsEnabled(true);
    const stepText = $('stickStepText');
    if (stepText) stepText.textContent = '已停止播放，可继续手动操作。';
  }

  function bind() {
    const btnMinus10 = $('stickBtnMinus10');
    const btnPlus10 = $('stickBtnPlus10');
    const btnMinus1 = $('stickBtnMinus1');
    const btnPlus1 = $('stickBtnPlus1');
    const btnSet = $('stickBtnSet');
    const demoAdd = $('stickDemoAddCarry');
    const demoSub = $('stickDemoSubBorrow');
    const demoStop = $('stickDemoStop');
    const demoStop2 = $('stickDemoStop2');

    if (btnMinus10) btnMinus10.addEventListener('click', async () => { if (!isPlaying) await subTen('—'); });
    if (btnPlus10) btnPlus10.addEventListener('click', async () => { if (!isPlaying) await addTen('—'); });
    if (btnMinus1) btnMinus1.addEventListener('click', async () => { if (!isPlaying) await subOne('—'); });
    if (btnPlus1) btnPlus1.addEventListener('click', async () => { if (!isPlaying) await addOne('—'); });

    if (btnSet) {
      btnSet.addEventListener('click', () => {
        const input = $('stickCustomInput');
        if (input) {
          const val = parseInt(input.value, 10);
          if (!isNaN(val)) setTotal(val);
        }
      });
    }

    if (demoAdd) demoAdd.addEventListener('click', async () => {
      if (isPlaying) return;
      const exprPrefix = '18 + 5';
      const steps = [
        { setTotal: 18, expr: `${exprPrefix} = 23`, tip: '初始化：18（1 捆 + 8 根）', waitMs: 520 },
        { addOne: true, expr: `${exprPrefix} = 23`, tip: '+1 → 19', waitMs: 420 },
        { addOne: true, expr: `${exprPrefix} = 23`, tip: '+1 → 20（满十合并）', waitMs: 620 },
        { addOne: true, expr: `${exprPrefix} = 23`, tip: '+1 → 21', waitMs: 420 },
        { addOne: true, expr: `${exprPrefix} = 23`, tip: '+1 → 22', waitMs: 420 },
        { addOne: true, expr: `${exprPrefix} = 23`, tip: '+1 → 23（完成）', waitMs: 520 }
      ];
      await playSteps(steps, `${exprPrefix} = 23`);
    });

    if (demoSub) demoSub.addEventListener('click', async () => {
      if (isPlaying) return;
      const exprPrefix = '32 - 7';
      const steps = [
        { setTotal: 32, expr: `${exprPrefix} = 25`, tip: '初始化：32（3 捆 + 2 根）', waitMs: 520 },
        { subOne: true, expr: `${exprPrefix} = 25`, tip: '-1 → 31', waitMs: 420 },
        { subOne: true, expr: `${exprPrefix} = 25`, tip: '-1 → 30（个位归零）', waitMs: 520 },
        { subOne: true, expr: `${exprPrefix} = 25`, tip: '-1 → 29（拆 1 捆借位）', waitMs: 700 },
        { subOne: true, expr: `${exprPrefix} = 25`, tip: '-1 → 28', waitMs: 420 },
        { subOne: true, expr: `${exprPrefix} = 25`, tip: '-1 → 27', waitMs: 420 },
        { subOne: true, expr: `${exprPrefix} = 25`, tip: '-1 → 26', waitMs: 420 },
        { subOne: true, expr: `${exprPrefix} = 25`, tip: '-1 → 25（完成）', waitMs: 520 }
      ];
      await playSteps(steps, `${exprPrefix} = 25`);
    });

    if (demoStop) demoStop.addEventListener('click', stop);
    if (demoStop2) demoStop2.addEventListener('click', stop);
  }

  function sync() {
    render();
    lucide.createIcons();
  }

  function init() {
    bind();
    setButtonsEnabled(true);
    setTotal(0, '—');
    setStepText('提示：满十会自动合并成 1 捆；个位为 0 再减会自动拆 1 捆借位。');
  }

  return { init, sync, setTotal, getTotal, stop };
})();

window.counterTool = (() => {
  const MAX = 99999999;
  const POW10 = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000];
  const places = [
    { label: '个', aria: '个位' },
    { label: '十', aria: '十位' },
    { label: '百', aria: '百位' },
    { label: '千', aria: '千位' },
    { label: '万', aria: '万位' },
    { label: '十万', aria: '十万位' },
    { label: '百万', aria: '百万位' },
    { label: '千万', aria: '千万位' }
  ];

  const state = { digits: Array.from({ length: 8 }, () => 0) };
  let locked = false;

  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));
  function setHint(kind, msg) {
    const el = $('counterPvHint');
    if (!el) return;
    el.textContent = msg;
    el.style.color = 'rgba(100,116,139,1)';
    if (kind === 'bad') el.style.color = 'rgba(185,28,28,0.95)';
    if (kind === 'ok') el.style.color = 'rgba(5,150,105,0.95)';
  }

  function getTotal() {
    return state.digits.reduce((sum, d, i) => sum + d * POW10[i], 0);
  }

  function setFromTotal(total) {
    const v = Math.max(0, Math.min(MAX, Math.trunc(total || 0)));
    for (let i = 0; i < 8; i += 1) {
      state.digits[i] = Math.floor(v / POW10[i]) % 10;
    }
  }

  function getColumnEl(index) {
    const root = $('counterPvColumns');
    if (!root) return null;
    return root.querySelector(`.pv-column[data-index="${index}"]`);
  }

  function bounceTotal(mode) {
    const totalEl = $('counterPvTotal');
    if (!totalEl) return;
    const cls = mode === 'blocked' ? 'pv-total-blocked' : 'pv-total-bounce';
    totalEl.classList.remove('pv-total-bounce', 'pv-total-blocked');
    void totalEl.offsetWidth;
    totalEl.classList.add(cls);
  }

  function animateColumn(index, kind) {
    const el = getColumnEl(index);
    if (!el) return;
    const map = {
      flash: 'pv-col-flash',
      carry: 'pv-col-carry',
      borrow: 'pv-col-borrow'
    };
    const cls = map[kind] || 'pv-col-flash';
    el.classList.remove('pv-col-flash', 'pv-col-carry', 'pv-col-borrow');
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function formatTotal(n) {
    try {
      return n.toLocaleString('zh-CN');
    } catch (e) {
      return String(n);
    }
  }

  function render() {
    const root = $('counterPvColumns');
    const totalEl = $('counterPvTotal');
    if (!root || !totalEl) return;

    for (let i = 0; i < 8; i += 1) {
      const col = getColumnEl(i);
      if (!col) continue;
      const digit = state.digits[i];
      const chip = col.querySelector('.pv-digit-chip');
      if (chip) chip.textContent = String(digit);
      col.querySelectorAll('.pv-bead').forEach((b) => {
        const v = Number(b.dataset.val);
        b.classList.toggle('is-active', v === digit);
      });
    }

    totalEl.textContent = formatTotal(getTotal());
  }

  function build() {
    const root = $('counterPvColumns');
    if (!root || root.childElementCount) return;

    const columns = [];
    for (let display = 7; display >= 0; display -= 1) {
      const idx = display;
      const place = places[idx];
      const beadHtml = Array.from({ length: 10 }, (_, k) => {
        const v = 9 - k;
        return `<div class="pv-bead" data-val="${v}">${v}</div>`;
      }).join('');

      columns.push(
        `<div class="pv-column" data-index="${idx}">
          <div class="pv-place">${place.label}</div>
          <div class="pv-digit-chip">0</div>
          <div class="pv-rod" aria-hidden="true">
            <div class="pv-beads">${beadHtml}</div>
          </div>
          <button class="pv-btn pv-btn-plus" data-action="inc" data-index="${idx}" aria-label="${place.aria}加 1">
            <i data-lucide="plus" class="w-5 h-5"></i>
          </button>
          <button class="pv-btn pv-btn-minus" data-action="dec" data-index="${idx}" aria-label="${place.aria}减 1">
            <i data-lucide="minus" class="w-5 h-5"></i>
          </button>
        </div>`
      );
    }
    root.innerHTML = columns.join('');
    lucide.createIcons();
  }

  async function incAt(index) {
    if (locked) return;
    const delta = POW10[index];
    const before = getTotal();
    if (before + delta > MAX) {
      bounceTotal('blocked');
      animateColumn(index, 'borrow');
      setHint('bad', '已达到上限 99,999,999，无法继续增加该位。');
      return;
    }

    locked = true;
    let i = index;
    state.digits[i] += 1;
    animateColumn(i, 'flash');
    render();
    await sleep(160);

    while (state.digits[i] === 10) {
      state.digits[i] = 0;
      animateColumn(i, 'carry');
      render();
      await sleep(220);
      i += 1;
      if (i >= 8) {
        locked = false;
        bounceTotal('blocked');
        setHint('bad', '已达到上限 99,999,999，无法继续进位。');
        return;
      }
      state.digits[i] += 1;
      animateColumn(i, 'flash');
      render();
      await sleep(160);
    }

    bounceTotal('ok');
    setHint('ok', `已更新：${formatTotal(getTotal())}`);
    locked = false;
  }

  async function decAt(index) {
    if (locked) return;
    const delta = POW10[index];
    const before = getTotal();
    if (before - delta < 0) {
      bounceTotal('blocked');
      animateColumn(index, 'borrow');
      setHint('bad', '当前为 0 或该位无法借位，不能继续减少。');
      return;
    }

    locked = true;
    if (state.digits[index] > 0) {
      state.digits[index] -= 1;
      animateColumn(index, 'flash');
      render();
      bounceTotal('ok');
      setHint('ok', `已更新：${formatTotal(getTotal())}`);
      locked = false;
      return;
    }

    let j = index + 1;
    while (j < 8 && state.digits[j] === 0) j += 1;
    if (j >= 8) {
      bounceTotal('blocked');
      animateColumn(index, 'borrow');
      setHint('bad', '高位均为 0，无法借位。');
      locked = false;
      return;
    }

    animateColumn(j, 'borrow');
    render();
    await sleep(220);

    state.digits[j] -= 1;
    animateColumn(j, 'flash');
    render();
    await sleep(160);

    for (let k = j - 1; k >= index + 1; k -= 1) {
      state.digits[k] = 9;
      animateColumn(k, 'borrow');
      render();
      await sleep(160);
    }

    state.digits[index] = 9;
    animateColumn(index, 'flash');
    render();
    bounceTotal('ok');
    setHint('ok', `已更新：${formatTotal(getTotal())}`);
    locked = false;
  }

  function bind() {
    const root = $('counterPvColumns');
    if (!root || root.dataset.bound === '1') return;
    root.dataset.bound = '1';
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action][data-index]');
      if (!btn) return;
      const action = btn.dataset.action;
      const index = Number(btn.dataset.index);
      if (Number.isNaN(index) || index < 0 || index > 7) return;
      if (action === 'inc') incAt(index);
      if (action === 'dec') decAt(index);
    });
  }

  function sync() {
    build();
    bind();
    render();
    setHint('ok', `当前：${formatTotal(getTotal())}（横向滑动可查看高位）`);
    lucide.createIcons();
  }

  function init() {
    build();
    bind();
    setFromTotal(0);
    render();
    setHint('ok', '提示：点击每一列的 + / - 改变该位；满 10 自动进位，借位会从高位拆 1。');
  }

  return { init, sync, getTotal };
})();

window.decomposeTool = (() => {
  const items = {
    apple: { emoji: '🍎', label: '苹果' },
    grape: { emoji: '🍇', label: '葡萄' },
    soccer: { emoji: '⚽', label: '足球' }
  };

  const state = { total: 6, left: 3, right: 3, item: 'apple', mask: 'none' };
  const effect = { popLeft: false, popRight: false, bounceNodes: false };
  let bound = false;

  const $ = (id) => document.getElementById(id);

  function clamp(n, min, max) {
    const v = Number(n);
    if (Number.isNaN(v)) return min;
    return Math.max(min, Math.min(max, Math.trunc(v)));
  }

  function setEffect(flags) {
    effect.popLeft = !!flags.popLeft;
    effect.popRight = !!flags.popRight;
    effect.bounceNodes = !!flags.bounceNodes;
  }

  function normalize() {
    state.total = clamp(state.total, 1, 10);
    state.left = clamp(state.left, 0, state.total);
    state.right = state.total - state.left;
  }

  function pulse(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function buildChips() {
    const root = $('decompTotalChips');
    if (!root || root.childElementCount) return;
    const chips = [];
    for (let i = 1; i <= 10; i += 1) {
      chips.push(`<button type="button" class="decomp-chip" data-total="${i}" aria-label="整体数设为${i}">${i}</button>`);
    }
    root.innerHTML = chips.join('');
  }

  function buildTokens(side, count, stagger) {
    const meta = items[state.item] || items.apple;
    const label = meta.label;
    const emoji = meta.emoji;
    const parts = [];
    for (let i = 0; i < count; i += 1) {
      const delay = stagger ? ` style="animation-delay:${i * 26}ms"` : '';
      const popCls = stagger ? ' decomp-pop' : '';
      parts.push(`<button type="button" class="decomp-token${popCls}" data-side="${side}" aria-label="${side === 'left' ? '左边' : '右边'}实物：${label}"${delay}>${emoji}</button>`);
    }
    return parts.join('');
  }

  function setMask(mode) {
    const next = mode === 'left' || mode === 'right' ? mode : 'none';
    state.mask = next;
    clearFeedback();
    render();
  }

  function setItem(itemKey) {
    if (!items[itemKey]) return;
    state.item = itemKey;
    clearFeedback();
    setEffect({ popLeft: true, popRight: true, bounceNodes: true });
    render();
  }

  function setTotal(total, opts = {}) {
    const beforeTotal = state.total;
    state.total = clamp(total, 1, 10);
    if (state.total !== beforeTotal) clearFeedback();
    normalize();
    setEffect({ popLeft: true, popRight: true, bounceNodes: !!opts.bounce });
    render();
  }

  function setLeft(left, opts = {}) {
    const beforeLeft = state.left;
    state.left = clamp(left, 0, state.total);
    state.right = state.total - state.left;
    if (beforeLeft !== state.left) clearFeedback();
    setEffect({ popLeft: !!opts.pop, popRight: !!opts.pop, bounceNodes: !!opts.bounce });
    render();
  }

  function setRight(right, opts = {}) {
    const beforeRight = state.right;
    state.right = clamp(right, 0, state.total);
    state.left = state.total - state.right;
    if (beforeRight !== state.right) clearFeedback();
    setEffect({ popLeft: !!opts.pop, popRight: !!opts.pop, bounceNodes: !!opts.bounce });
    render();
  }

  function randomSplit() {
    const total = clamp(state.total, 1, 10);
    const left = Math.floor(Math.random() * (total + 1));
    state.left = left;
    state.right = total - left;
    clearFeedback();
    setEffect({ popLeft: true, popRight: true, bounceNodes: true });
    render();
  }

  function clearFeedback() {
    const box = $('decompFeedback');
    const text = $('decompFeedbackText');
    if (box) box.classList.remove('is-ok', 'is-bad');
    if (text) text.textContent = '提示：先遮蔽一侧，再输入答案进行校验';
  }

  function setFeedback(kind, msg) {
    const box = $('decompFeedback');
    const text = $('decompFeedbackText');
    if (!box || !text) return;
    box.classList.remove('is-ok', 'is-bad');
    if (kind === 'ok') box.classList.add('is-ok');
    if (kind === 'bad') box.classList.add('is-bad');
    text.textContent = msg;
    pulse(box, kind === 'bad' ? 'decomp-shake' : 'decomp-bounce');
  }

  function checkAnswer() {
    if (state.mask !== 'left' && state.mask !== 'right') {
      setFeedback('bad', '当前未遮蔽，请先选择“遮蔽左边/遮蔽右边”');
      return;
    }
    const input = $('decompAnswerInput');
    const raw = input ? String(input.value || '').trim() : '';
    const guess = clamp(raw, -999, 999);
    if (!raw || Number.isNaN(Number(raw))) {
      setFeedback('bad', '请输入 0-10 的数字');
      return;
    }
    if (guess < 0 || guess > 10) {
      setFeedback('bad', '请输入 0-10 的数字');
      return;
    }
    const expected = state.mask === 'left' ? state.left : state.right;
    if (guess === expected) {
      setFeedback('ok', '回答正确！');
      const node = $(state.mask === 'left' ? 'decompLeftNode' : 'decompRightNode');
      pulse(node, 'decomp-bounce');
    } else {
      setFeedback('bad', '回答不对，再试试：左 + 右 = 整体');
      const node = $(state.mask === 'left' ? 'decompLeftNode' : 'decompRightNode');
      pulse(node, 'decomp-shake');
    }
  }

  function render() {
    normalize();
    buildChips();

    const totalInput = $('decompTotalInput');
    const totalVal = $('decompTotalValue');
    const leftVal = $('decompLeftValue');
    const rightVal = $('decompRightValue');
    const leftCount = $('decompLeftCount');
    const rightCount = $('decompRightCount');
    const leftPanel = $('decompLeftPanel');
    const rightPanel = $('decompRightPanel');
    const leftArea = $('decompLeftArea');
    const rightArea = $('decompRightArea');
    const maskNone = $('decompMaskNone');
    const maskLeft = $('decompMaskLeft');
    const maskRight = $('decompMaskRight');
    const leftMinus = $('decompLeftMinus');
    const leftPlus = $('decompLeftPlus');
    const rightMinus = $('decompRightMinus');
    const rightPlus = $('decompRightPlus');
    const answerInput = $('decompAnswerInput');

    if (totalInput) totalInput.value = String(state.total);
    if (totalVal) totalVal.textContent = String(state.total);

    const leftMasked = state.mask === 'left';
    const rightMasked = state.mask === 'right';

    if (leftVal) leftVal.textContent = leftMasked ? '？' : String(state.left);
    if (rightVal) rightVal.textContent = rightMasked ? '？' : String(state.right);
    if (leftCount) leftCount.textContent = leftMasked ? '？' : String(state.left);
    if (rightCount) rightCount.textContent = rightMasked ? '？' : String(state.right);

    if (leftPanel) leftPanel.classList.toggle('decomp-masked', leftMasked);
    if (rightPanel) rightPanel.classList.toggle('decomp-masked', rightMasked);

    if (leftArea) leftArea.innerHTML = buildTokens('left', state.left, effect.popLeft);
    if (rightArea) rightArea.innerHTML = buildTokens('right', state.right, effect.popRight);

    if (maskNone) maskNone.classList.toggle('is-active', state.mask === 'none');
    if (maskLeft) maskLeft.classList.toggle('is-active', state.mask === 'left');
    if (maskRight) maskRight.classList.toggle('is-active', state.mask === 'right');

    if (leftMinus) leftMinus.disabled = leftMasked || state.left <= 0;
    if (leftPlus) leftPlus.disabled = leftMasked || state.left >= state.total;
    if (rightMinus) rightMinus.disabled = rightMasked || state.right <= 0;
    if (rightPlus) rightPlus.disabled = rightMasked || state.right >= state.total;

    const chipsRoot = $('decompTotalChips');
    if (chipsRoot) {
      chipsRoot.querySelectorAll('button[data-total]').forEach((b) => {
        const v = Number(b.dataset.total);
        b.classList.toggle('is-active', v === state.total);
      });
    }

    const picker = $('decompItemPicker');
    if (picker) {
      picker.querySelectorAll('button[data-item]').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.item === state.item);
      });
    }

    if (answerInput) {
      answerInput.disabled = state.mask === 'none';
      answerInput.classList.toggle('opacity-50', state.mask === 'none');
    }

    const totalNode = $('decompTotalNode');
    const leftNode = $('decompLeftNode');
    const rightNode = $('decompRightNode');
    if (effect.bounceNodes) {
      pulse(totalNode, 'decomp-bounce');
      pulse(leftNode, 'decomp-bounce');
      pulse(rightNode, 'decomp-bounce');
    }
    setEffect({ popLeft: false, popRight: false, bounceNodes: false });
    lucide.createIcons();
  }

  function bind() {
    if (bound) return;
    bound = true;

    const chipsRoot = $('decompTotalChips');
    if (chipsRoot) {
      chipsRoot.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-total]');
        if (!btn) return;
        const v = Number(btn.dataset.total);
        if (Number.isNaN(v)) return;
        setTotal(v, { bounce: true });
      });
    }

    const totalInput = $('decompTotalInput');
    if (totalInput) {
      totalInput.addEventListener('change', () => setTotal(totalInput.value, { bounce: true }));
      totalInput.addEventListener('blur', () => setTotal(totalInput.value, { bounce: false }));
    }

    const randomBtn = $('decompRandomBtn');
    if (randomBtn) randomBtn.addEventListener('click', () => randomSplit());

    const leftMinus = $('decompLeftMinus');
    const leftPlus = $('decompLeftPlus');
    const rightMinus = $('decompRightMinus');
    const rightPlus = $('decompRightPlus');
    if (leftMinus) leftMinus.addEventListener('click', () => setLeft(state.left - 1, { pop: true, bounce: true }));
    if (leftPlus) leftPlus.addEventListener('click', () => setLeft(state.left + 1, { pop: true, bounce: true }));
    if (rightMinus) rightMinus.addEventListener('click', () => setRight(state.right - 1, { pop: true, bounce: true }));
    if (rightPlus) rightPlus.addEventListener('click', () => setRight(state.right + 1, { pop: true, bounce: true }));

    const leftArea = $('decompLeftArea');
    const rightArea = $('decompRightArea');
    const onTokenClick = (e) => {
      const token = e.target.closest('.decomp-token[data-side]');
      if (!token) return;
      const side = token.dataset.side;
      if (side === 'left') {
        if (state.mask === 'left') return;
        if (state.left <= 0) return;
        setLeft(state.left - 1, { pop: true, bounce: true });
      }
      if (side === 'right') {
        if (state.mask === 'right') return;
        if (state.right <= 0) return;
        setRight(state.right - 1, { pop: true, bounce: true });
      }
    };
    if (leftArea) leftArea.addEventListener('click', onTokenClick);
    if (rightArea) rightArea.addEventListener('click', onTokenClick);

    const maskNone = $('decompMaskNone');
    const maskLeft = $('decompMaskLeft');
    const maskRight = $('decompMaskRight');
    if (maskNone) maskNone.addEventListener('click', () => setMask('none'));
    if (maskLeft) maskLeft.addEventListener('click', () => setMask('left'));
    if (maskRight) maskRight.addEventListener('click', () => setMask('right'));

    const picker = $('decompItemPicker');
    if (picker) {
      picker.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-item]');
        if (!btn) return;
        const itemKey = btn.dataset.item;
        setItem(itemKey);
      });
    }

    const checkBtn = $('decompCheckBtn');
    if (checkBtn) checkBtn.addEventListener('click', () => checkAnswer());

    const answerInput = $('decompAnswerInput');
    if (answerInput) {
      answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkAnswer();
      });
      answerInput.addEventListener('input', () => {
        const v = String(answerInput.value || '');
        if (v.length > 2) answerInput.value = v.slice(0, 2);
      });
    }
  }

  function sync() {
    buildChips();
    bind();
    render();
  }

  function init() {
    buildChips();
    bind();
    normalize();
    render();
  }

  return { init, sync, setTotal, setMask, setItem };
})();

window.numberLineTool = (() => {
  const VB = { w: 1000, h: 220, padL: 56, padR: 44, baseY: 160 };
  const state = { rangeMax: 20, zoom: 1, center: 10, start: 0, end: 0, segments: [], stepMode: false, stepsText: '—' };
  let bound = false;
  let dragging = false;
  let dragStartX = 0;
  let dragStartCenter = 0;
  let dragMoved = false;
  let ignorePickUntil = 0;
  let playToken = 0;

  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));

  function clamp(n, min, max) {
    const v = Number(n);
    if (Number.isNaN(v)) return min;
    return Math.max(min, Math.min(max, v));
  }

  function clampInt(n, min, max) {
    return Math.trunc(clamp(n, min, max));
  }

  function getMinWidth() {
    return state.rangeMax === 20 ? 6 : 20;
  }

  function getView() {
    const minWidth = getMinWidth();
    const zoomMax = Math.max(1, state.rangeMax / minWidth);
    state.zoom = clamp(state.zoom, 1, zoomMax);
    const width = state.rangeMax / state.zoom;
    const half = width / 2;
    state.center = clamp(state.center, half, state.rangeMax - half);
    const min = state.center - half;
    const max = state.center + half;
    return { min, max, width, zoomMax };
  }

  function valueToX(v, view) {
    const innerW = VB.w - VB.padL - VB.padR;
    const t = (v - view.min) / (view.max - view.min);
    return VB.padL + innerW * t;
  }

  function setFeedback(kind, msg) {
    const el = $('nlFeedback');
    if (!el) return;
    el.textContent = msg;
    el.style.borderColor = 'rgba(99, 102, 241, 0.14)';
    el.style.background = 'rgba(255,255,255,0.8)';
    if (kind === 'ok') {
      el.style.borderColor = 'rgba(16, 185, 129, 0.35)';
      el.style.background = 'rgba(236, 253, 245, 0.8)';
    }
    if (kind === 'bad') {
      el.style.borderColor = 'rgba(239, 68, 68, 0.35)';
      el.style.background = 'rgba(254, 242, 242, 0.8)';
    }
  }

  function updateRangeButtons() {
    const b20 = $('nlRange20');
    const b100 = $('nlRange100');
    if (b20) {
      b20.classList.toggle('clay-button-primary', state.rangeMax === 20);
      b20.classList.toggle('clay-button-secondary', state.rangeMax !== 20);
    }
    if (b100) {
      b100.classList.toggle('clay-button-primary', state.rangeMax === 100);
      b100.classList.toggle('clay-button-secondary', state.rangeMax !== 100);
    }
  }

  function normalizeStartEnd() {
    state.start = clampInt(state.start, 0, state.rangeMax);
    state.end = clampInt(state.end, 0, state.rangeMax);
  }

  function clearJumps() {
    state.segments = [];
    state.end = state.start;
    state.stepsText = '—';
    render();
    setFeedback('ok', '已清空跳跃。');
  }

  function resetView() {
    state.zoom = 1;
    state.center = state.rangeMax / 2;
    render();
    setFeedback('ok', '已重置视窗。');
  }

  function centerOn(value) {
    const view = getView();
    const half = view.width / 2;
    state.center = clamp(value, half, state.rangeMax - half);
  }

  function centerIfOutOfView(value) {
    const view = getView();
    if (value < view.min + 0.8 || value > view.max - 0.8) centerOn(value);
  }

  function parseExpr(raw) {
    const s = String(raw || '').replace(/\s+/g, '');
    const m = s.match(/^(\d+)([+-])(\d+)$/);
    if (!m) return null;
    const a = Number(m[1]);
    const op = m[2];
    const b = Number(m[3]);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    const delta = op === '+' ? b : -b;
    return { a, b, op, delta, text: `${a}${op}${b}` };
  }

  function computeDeltas(a, delta, stepMode) {
    if (!stepMode) return [delta];
    if (delta === 0) return [0];
    const r = ((a % 10) + 10) % 10;
    if (delta > 0) {
      if (r === 0 || r + delta <= 10) return [delta];
      const d1 = 10 - r;
      const d2 = delta - d1;
      return d2 ? [d1, d2] : [d1];
    }
    const b = Math.abs(delta);
    if (r === 0 || r >= b) return [delta];
    const d1 = -r;
    const d2 = -(b - r);
    return d2 ? [d1, d2] : [d1];
  }

  function buildSegments(a, deltas) {
    const segs = [];
    let from = a;
    for (let i = 0; i < deltas.length; i += 1) {
      const d = deltas[i];
      const to = from + d;
      const label = d >= 0 ? `+${d}` : `${d}`;
      segs.push({ from, to, d, label });
      from = to;
    }
    return segs;
  }

  function buildStepsText(expr, deltas) {
    const parts = deltas.map((d) => (d >= 0 ? `+${d}` : `${d}`));
    if (!parts.length) return '—';
    if (parts.length === 1) return parts[0];
    return parts.join(' ');
  }

  function buildSvg(view) {
    const major = state.rangeMax === 20 ? 5 : 10;
    const minI = Math.max(0, Math.floor(view.min));
    const maxI = Math.min(state.rangeMax, Math.ceil(view.max));
    const ticks = [];
    for (let i = minI; i <= maxI; i += 1) {
      const x = valueToX(i, view);
      const isMajor = i % major === 0;
      const len = isMajor ? 18 : 10;
      const opacity = isMajor ? 0.85 : 0.55;
      const label = isMajor ? `<text x="${x}" y="${VB.baseY + 40}" text-anchor="middle" font-size="12" fill="rgba(71,85,105,0.95)" style="pointer-events:none">${i}</text>` : '';
      ticks.push(
        `<g data-val="${i}" style="cursor:pointer;opacity:${opacity}">
          <line x1="${x}" y1="${VB.baseY}" x2="${x}" y2="${VB.baseY + len}" stroke="rgba(99,102,241,0.35)" stroke-width="${isMajor ? 3 : 2}" />
          ${label}
        </g>`
      );
    }

    const segments = [];
    const lands = [];
    for (let i = 0; i < state.segments.length; i += 1) {
      const seg = state.segments[i];
      const x1 = valueToX(seg.from, view);
      const x2 = valueToX(seg.to, view);
      const dist = Math.abs(seg.to - seg.from);
      const arcH = clamp(42 + dist * 7, 46, 110);
      const midX = (x1 + x2) / 2;
      const ctrlY = VB.baseY - arcH;
      const kind = seg.d >= 0 ? 'plus' : 'minus';
      const path = `M ${x1} ${VB.baseY} Q ${midX} ${ctrlY} ${x2} ${VB.baseY}`;
      const lw = i === state.segments.length - 1 ? 6 : 5;

      const tagText = seg.label;
      const tagW = Math.max(34, 10 * tagText.length + 22);
      const tagX = midX - tagW / 2;
      const tagY = ctrlY - 16;
      const tag = `
        <g style="pointer-events:none">
          <rect x="${tagX}" y="${tagY}" width="${tagW}" height="24" rx="12" fill="rgba(255,255,255,0.92)" stroke="rgba(99,102,241,0.18)" stroke-width="2"></rect>
          <text x="${midX}" y="${tagY + 16}" text-anchor="middle" font-size="12" fill="rgba(30,41,59,0.95)" font-weight="700">${tagText}</text>
        </g>
      `;

      segments.push(`<path id="nlPath-${i}" class="nl-path ${kind}" d="${path}" stroke-width="${lw}"></path>${tag}`);

      const landOpacity = i === state.segments.length - 1 ? 1 : 0.55;
      lands.push(`<circle id="nlLand-${i}" class="nl-land" cx="${x2}" cy="${VB.baseY}" r="${i === state.segments.length - 1 ? 10 : 7}" fill="rgba(79,70,229,${i === state.segments.length - 1 ? 0.18 : 0.10})" stroke="rgba(79,70,229,${i === state.segments.length - 1 ? 0.85 : 0.55})" stroke-width="${i === state.segments.length - 1 ? 4 : 3}" opacity="${landOpacity}"></circle>`);
    }

    const startX = valueToX(state.start, view);
    const endX = valueToX(state.end, view);

    const startMark = `<g style="pointer-events:none">
      <circle cx="${startX}" cy="${VB.baseY}" r="10" fill="rgba(99,102,241,0.18)" stroke="rgba(99,102,241,0.85)" stroke-width="4"></circle>
      <circle cx="${startX}" cy="${VB.baseY}" r="4" fill="rgba(99,102,241,0.95)"></circle>
    </g>`;

    const endMark = `<g style="pointer-events:none">
      <circle cx="${endX}" cy="${VB.baseY}" r="4" fill="rgba(79,70,229,0.95)"></circle>
    </g>`;

    const baseLine = `<line x1="${VB.padL}" y1="${VB.baseY}" x2="${VB.w - VB.padR}" y2="${VB.baseY}" stroke="rgba(99,102,241,0.35)" stroke-width="6" stroke-linecap="round"></line>`;

    return `
      <svg viewBox="0 0 ${VB.w} ${VB.h}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${VB.w}" height="${VB.h}" fill="transparent"></rect>
        ${baseLine}
        ${ticks.join('')}
        ${segments.join('')}
        ${lands.join('')}
        ${startMark}
        ${endMark}
      </svg>
    `;
  }

  function animatePath(index) {
    const host = $('nlSvg');
    if (!host) return;
    const svg = host.querySelector('svg');
    if (!svg) return;
    const path = svg.querySelector(`#nlPath-${index}`);
    if (!path) return;
    try {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      path.style.transition = 'none';
      void path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset 520ms ease-out';
      path.style.strokeDashoffset = '0';
    } catch (e) { }
  }

  function pulseLand(index) {
    const host = $('nlSvg');
    if (!host) return;
    const svg = host.querySelector('svg');
    if (!svg) return;
    const land = svg.querySelector(`#nlLand-${index}`);
    if (!land) return;
    land.classList.remove('is-pulse');
    void land.getBoundingClientRect();
    land.classList.add('is-pulse');
  }

  function render() {
    normalizeStartEnd();
    const view = getView();
    updateRangeButtons();

    const info = $('nlViewInfo');
    const startText = $('nlStartText');
    const endText = $('nlEndText');
    const resultText = $('nlResultText');
    const stepsText = $('nlStepsText');

    if (info) info.textContent = `视窗：${Math.round(view.min)}–${Math.round(view.max)}`;
    if (startText) startText.textContent = String(state.start);
    if (endText) endText.textContent = String(state.end);
    if (resultText) resultText.textContent = `结果：${state.end}`;
    if (stepsText) stepsText.textContent = `步骤：${state.stepsText || '—'}`;

    const slider = $('nlZoomSlider');
    if (slider) {
      slider.max = String(view.zoomMax);
      slider.value = String(state.zoom);
    }

    const host = $('nlSvg');
    if (host) host.innerHTML = buildSvg(view);

    lucide.createIcons();
  }

  function setRange(max) {
    state.rangeMax = max === 100 ? 100 : 20;
    state.zoom = 1;
    state.center = state.rangeMax / 2;
    state.start = 0;
    state.end = 0;
    state.segments = [];
    state.stepsText = '—';
    render();
    setFeedback('ok', `已切换到 0–${state.rangeMax}。`);
  }

  function setZoom(nextZoom) {
    const view = getView();
    const next = clamp(nextZoom, 1, view.zoomMax);
    state.zoom = next;
    render();
  }

  function nudgeZoom(dir) {
    const view = getView();
    const step = state.rangeMax === 20 ? 0.25 : 0.35;
    const next = clamp(state.zoom + step * dir, 1, view.zoomMax);
    state.zoom = next;
    render();
  }

  function setStartValue(v) {
    state.start = clampInt(v, 0, state.rangeMax);
    state.end = state.start;
    state.segments = [];
    state.stepsText = '—';
    centerIfOutOfView(state.start);
    render();
  }

  async function playExpression(exprText, stepMode) {
    const parsed = parseExpr(exprText);
    if (!parsed) {
      setFeedback('bad', '表达式格式不对：请输入如“8+5”或“12-7”。');
      return;
    }
    if (parsed.a < 0 || parsed.a > state.rangeMax) {
      setFeedback('bad', `起点超出当前区间：请先切换到合适区间（当前 0–${state.rangeMax}）。`);
      return;
    }
    const deltas = computeDeltas(parsed.a, parsed.delta, !!stepMode);
    const segs = buildSegments(parsed.a, deltas);
    const end = segs.length ? segs[segs.length - 1].to : parsed.a;
    if (end < 0 || end > state.rangeMax) {
      setFeedback('bad', `落点超出当前区间：${end}（当前 0–${state.rangeMax}）。`);
      return;
    }

    playToken += 1;
    const token = playToken;

    state.stepMode = !!stepMode;
    state.start = parsed.a;
    state.end = parsed.a;
    state.segments = [];
    state.stepsText = buildStepsText(parsed.text, deltas);
    render();
    setFeedback('ok', `正在演示：${parsed.text}${state.stepMode ? `（${state.stepsText}）` : ''}`);

    await sleep(60);
    for (let i = 0; i < segs.length; i += 1) {
      if (token !== playToken) return;
      state.segments = segs.slice(0, i + 1);
      state.end = segs[i].to;
      centerIfOutOfView(state.end);
      render();
      animatePath(i);
      await sleep(120);
      pulseLand(i);
      await sleep(560);
    }
    setFeedback('ok', `完成：${parsed.text} = ${state.end}`);
  }

  function bindStageDrag() {
    const stage = $('nlStage');
    if (!stage || stage.dataset.boundDrag === '1') return;
    stage.dataset.boundDrag = '1';

    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartCenter = state.center;
      stage.classList.add('is-grabbing');
      stage.classList.remove('is-grab');
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const rect = stage.getBoundingClientRect();
      const widthPx = Math.max(1, rect.width);
      const view = getView();
      const deltaPx = e.clientX - dragStartX;
      if (!dragMoved && Math.abs(deltaPx) < 2) return;
      dragMoved = true;
      e.preventDefault();
      const deltaVal = -deltaPx * (view.max - view.min) / widthPx;
      state.center = dragStartCenter + deltaVal;
      render();
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      if (dragMoved) ignorePickUntil = Date.now() + 240;
      stage.classList.remove('is-grabbing');
      stage.classList.add('is-grab');
    };

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('pointerleave', endDrag);
  }

  function bindSvgPick() {
    const host = $('nlSvg');
    if (!host || host.dataset.boundPick === '1') return;
    host.dataset.boundPick = '1';
    host.addEventListener('click', (e) => {
      if (Date.now() < ignorePickUntil) return;
      const g = e.target && e.target.closest ? e.target.closest('g[data-val]') : null;
      if (!g) return;
      const v = Number(g.dataset.val);
      if (Number.isNaN(v)) return;
      setStartValue(v);
      const input = $('nlExprInput');
      if (input) input.value = `${v}+`;
      setFeedback('ok', `已将起点设为 ${v}。`);
    });
  }

  function bind() {
    if (bound) return;
    bound = true;

    const r20 = $('nlRange20');
    const r100 = $('nlRange100');
    if (r20) r20.addEventListener('click', () => setRange(20));
    if (r100) r100.addEventListener('click', () => setRange(100));

    const zoomIn = $('nlZoomIn');
    const zoomOut = $('nlZoomOut');
    if (zoomIn) zoomIn.addEventListener('click', () => nudgeZoom(1));
    if (zoomOut) zoomOut.addEventListener('click', () => nudgeZoom(-1));

    const slider = $('nlZoomSlider');
    if (slider) slider.addEventListener('input', () => setZoom(Number(slider.value)));

    const reset = $('nlResetView');
    if (reset) reset.addEventListener('click', resetView);

    const clear = $('nlClearBtn');
    if (clear) clear.addEventListener('click', clearJumps);

    const centerBtn = $('nlCenterOnStart');
    if (centerBtn) centerBtn.addEventListener('click', () => {
      centerOn(state.start);
      render();
    });

    const playBtn = $('nlPlayBtn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const input = $('nlExprInput');
        const step = $('nlStepMode');
        playExpression(input ? input.value : '', step ? step.checked : false);
      });
    }

    const exprInput = $('nlExprInput');
    if (exprInput) {
      exprInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const step = $('nlStepMode');
          playExpression(exprInput.value, step ? step.checked : false);
        }
      });
    }

    const demoAdd = $('nlDemoAdd');
    const demoSub = $('nlDemoSub');
    if (demoAdd) demoAdd.addEventListener('click', () => {
      const input = $('nlExprInput');
      const step = $('nlStepMode');
      if (input) input.value = '8+5';
      if (step) step.checked = true;
      if (state.rangeMax !== 20) setRange(20);
      playExpression('8+5', true);
    });
    if (demoSub) demoSub.addEventListener('click', () => {
      const input = $('nlExprInput');
      const step = $('nlStepMode');
      if (input) input.value = '12-7';
      if (step) step.checked = true;
      if (state.rangeMax !== 20) setRange(20);
      playExpression('12-7', true);
    });

    bindStageDrag();
    bindSvgPick();
  }

  function sync() {
    bind();
    render();
  }

  function init() {
    bind();
    setRange(20);
  }

  return { init, sync };
})();

window.cube10Tool = (() => {
  const MAX_TOTAL = 9999;
  const state = { ones: 0, tens: 0, hundreds: 0, thousands: 0 };
  let bound = false;
  let locked = false;
  let isPlaying = false;
  let playToken = 0;

  const three = {
    ones: { renderer: null, scene: null, camera: null, mesh: null, controls: null },
    tens: { renderer: null, scene: null, camera: null, mesh: null, controls: null },
    hundreds: { renderer: null, scene: null, camera: null, mesh: null, controls: null },
    thousands: { renderer: null, scene: null, camera: null, mesh: null, controls: null }
  };

  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));

  /**
   * 初始化指定层级的 Three.js 场景
   * @param {string} level - 层级名称 ('ones', 'tens', 'hundreds', 'thousands')
   */
  function initThree(level) {
    if (typeof THREE === 'undefined') {
      return;
    }
    const container = getItems(level);
    if (!container) return;
    
    if (container.clientWidth === 0) {
      setTimeout(() => initThree(level), 100);
      return;
    }

    if (three[level].renderer && container.contains(three[level].renderer.domElement)) {
      return;
    }

    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    // 默认高度恢复为 180px
    const defaultHeight = 180;
    container.style.height = `${defaultHeight}px`;
    container.style.minHeight = `${defaultHeight}px`;
    container.style.background = 'rgba(255, 255, 255, 0.4)';
    container.style.borderRadius = '12px';
    container.title = '鼠标左键旋转，右键平移，滚轮缩放';

    const width = container.clientWidth;
    const height = defaultHeight;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    
    // 设置初始视角
    if (level === 'ones') {
      camera.position.set(0, 10, 80);
    } else if (level === 'tens') {
      camera.position.set(0, 20, 120);
    } else if (level === 'hundreds') {
      // 百位（板）：纯平面正视视角
      camera.position.set(0, 0, 160);
    } else {
      // 千位（大块）：保持 3D 斜向视角以体现厚度
      camera.position.set(120, 120, 250);
    }
    
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 添加轨道控制器 OrbitControls
    let controls = null;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 1.5;
      controls.minDistance = 40;
      controls.maxDistance = 1000;
      
      // 如果是百位（板），禁用旋转，保持平面视角
      if (level === 'hundreds') {
        controls.enableRotate = false;
      }
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(100, 200, 150);
    scene.add(pointLight);

    three[level] = { renderer, scene, camera, mesh: null, controls, currentHeight: height };

    function animate() {
      if (!three[level].renderer) return;
      requestAnimationFrame(animate);
      if (three[level].controls) {
        three[level].controls.update();
      }
      three[level].renderer.render(three[level].scene, three[level].camera);
    }
    animate();
    
    window.addEventListener('resize', () => {
      if (three[level].renderer && three[level].camera) {
        const newWidth = container.clientWidth;
        const currentH = three[level].currentHeight || defaultHeight;
        three[level].camera.aspect = newWidth / currentH;
        three[level].camera.updateProjectionMatrix();
        three[level].renderer.setSize(newWidth, currentH);
      }
    });
  }

  /**
   * 更新指定层级的 3D 模型渲染
   * @param {string} level - 层级名称
   * @param {number} count - 当前数量
   */
  function updateThree(level, count) {
    if (typeof THREE === 'undefined') return;
    const { scene, mesh, renderer, camera } = three[level];
    if (!scene) return;

    if (mesh) {
      scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose());
        else mesh.material.dispose();
      }
    }

    const container = getItems(level);
    const defaultHeight = 180;
    let targetHeight = defaultHeight;

    // 针对百位和千位实现动态高度调整和换行逻辑
    if (level === 'hundreds' || level === 'thousands') {
      const rows = Math.ceil(count / 2); // 每行 2 个
      if (rows > 1) {
        // 每多出一行，高度增加 140px (针对 100/1000 的比例)
        targetHeight = defaultHeight + (rows - 1) * 140;
      }
      
      if (three[level].currentHeight !== targetHeight) {
        three[level].currentHeight = targetHeight;
        container.style.height = `${targetHeight}px`;
        container.style.minHeight = `${targetHeight}px`;
        renderer.setSize(container.clientWidth, targetHeight);
        camera.aspect = container.clientWidth / targetHeight;
        
        // 关键修复：当高度增加时，不改变物体的渲染大小（保持 PerspectiveCamera 的视角比例）
        // 我们通过调整相机 Z 轴位置来补偿高度变化，使串珠大小看起来一致
        if (level === 'hundreds') camera.position.z = 160 + (rows - 1) * 60;
        else camera.position.z = 250 + (rows - 1) * 80;
        
        camera.updateProjectionMatrix();
      }
    }

    if (count <= 0) {
      three[level].mesh = null;
      return;
    }

    const sphereGeom = new THREE.SphereGeometry(3.8, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.1,
      roughness: 0.4,
      emissive: 0x442200,
      emissiveIntensity: 0.15
    });

    const gap = 0.5;
    const size = 7.6 + gap;

    let instancedMesh;
    const dummy = new THREE.Object3D();

    if (level === 'ones') {
      instancedMesh = new THREE.InstancedMesh(sphereGeom, sphereMat, count);
      for (let i = 0; i < count; i++) {
        dummy.position.set((i - (count - 1) / 2) * size * 1.5, 0, 0);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
    } else if (level === 'tens') {
      instancedMesh = new THREE.InstancedMesh(sphereGeom, sphereMat, count * 10);
      let idx = 0;
      for (let i = 0; i < count; i++) {
        const xPos = (i - (count - 1) / 2) * size * 2.0;
        for (let j = 0; j < 10; j++) {
          dummy.position.set(xPos, (j - 4.5) * size, 0);
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(idx++, dummy.matrix);
        }
      }
    } else if (level === 'hundreds') {
      instancedMesh = new THREE.InstancedMesh(sphereGeom, sphereMat, count * 100);
      let idx = 0;
      const stepX = size * 13;
      const stepY = size * 15; // 换行间距
      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        // 每行显示 2 个，居中排列
        const offsetX = (col - 0.5) * stepX;
        const offsetY = (Math.floor((count - 1) / 2) / 2 - row / 1) * stepY; // 垂直居中
        
        for (let y = 0; y < 10; y++) {
          for (let x = 0; x < 10; x++) {
            dummy.position.set(offsetX + (x - 4.5) * size, offsetY + (y - 4.5) * size, 0);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(idx++, dummy.matrix);
          }
        }
      }
    } else if (level === 'thousands') {
      const shellIndices = [];
      for (let z = 0; z < 10; z++) {
        for (let y = 0; y < 10; y++) {
          for (let x = 0; x < 10; x++) {
            if (x === 0 || x === 9 || y === 0 || y === 9 || z === 0 || z === 9) {
              shellIndices.push({ x, y, z });
            }
          }
        }
      }
      
      const beadsPerBlock = shellIndices.length;
      instancedMesh = new THREE.InstancedMesh(sphereGeom, sphereMat, count * beadsPerBlock);
      let idx = 0;
      const stepX = size * 18;
      const stepY = size * 20; // 换行间距
      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const offsetX = (col - 0.5) * stepX;
        const offsetY = (Math.floor((count - 1) / 2) / 2 - row / 1) * stepY;

        for (const pos of shellIndices) {
          dummy.position.set(
            offsetX + (pos.x - 4.5) * size, 
            offsetY + (pos.y - 4.5) * size, 
            -pos.z * size
          );
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(idx++, dummy.matrix);
        }
      }
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);
    three[level].mesh = instancedMesh;
  }

  function getTotal() {
    return state.thousands * 1000 + state.hundreds * 100 + state.tens * 10 + state.ones;
  }

  function setFeedback(kind, msg) {
    const el = $('cube10Feedback');
    if (!el) return;
    el.textContent = msg;
    el.style.borderColor = 'rgba(99, 102, 241, 0.14)';
    el.style.background = 'rgba(255,255,255,0.8)';
    if (kind === 'ok') {
      el.style.borderColor = 'rgba(16, 185, 129, 0.35)';
      el.style.background = 'rgba(236, 253, 245, 0.8)';
    }
    if (kind === 'bad') {
      el.style.borderColor = 'rgba(239, 68, 68, 0.35)';
      el.style.background = 'rgba(254, 242, 242, 0.8)';
    }
  }

  function getBin(level) {
    const map = {
      ones: $('cube10BinOnes'),
      tens: $('cube10BinTens'),
      hundreds: $('cube10BinHundreds'),
      thousands: $('cube10BinThousands')
    };
    return map[level] || null;
  }

  function getItems(level) {
    const map = {
      ones: $('cube10ItemsOnes'),
      tens: $('cube10ItemsTens'),
      hundreds: $('cube10ItemsHundreds'),
      thousands: $('cube10ItemsThousands')
    };
    return map[level] || null;
  }

  function flashBin(level, kind) {
    const el = getBin(level);
    if (!el) return;
    const cls = kind === 'carry' ? 'is-carry' : (kind === 'borrow' ? 'is-borrow' : (kind === 'blocked' ? 'is-blocked' : 'is-flash'));
    el.classList.remove('is-flash', 'is-carry', 'is-borrow', 'is-blocked');
    void el.offsetWidth;
    el.classList.add(cls);
    window.setTimeout(() => {
      el.classList.remove(cls);
    }, 560);
  }

  function spawnFx(fromLevel, toLevel, mode) {
    const fx = $('cube10Fx');
    const fromEl = getBin(fromLevel);
    const toEl = getBin(toLevel);
    if (!fx || !fromEl || !toEl) return;

    const fxRect = fx.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const from = { x: a.left + a.width / 2, y: a.top + a.height / 2 };
    const to = { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    const item = document.createElement('div');
    item.className = 'cube10-fx-item';
    item.style.left = `${from.x - fxRect.left}px`;
    item.style.top = `${from.y - fxRect.top}px`;

    const piece = document.createElement('div');
    const clsFrom = fromLevel === 'ones' ? 'one' : (fromLevel === 'tens' ? 'ten' : (fromLevel === 'hundreds' ? 'hundred' : 'thousand'));
    const clsTo = toLevel === 'ones' ? 'one' : (toLevel === 'tens' ? 'ten' : (toLevel === 'hundreds' ? 'hundred' : 'thousand'));
    piece.className = `cube10-piece ${clsFrom}`;
    piece.style.transform = 'scale(0.92)';
    item.appendChild(piece);
    fx.appendChild(item);

    const duration = mode === 'merge' ? 520 : 560;
    const midLift = mode === 'merge' ? -26 : -18;
    item.animate(
      [
        { transform: 'translate(-50%, -50%) translate(0px, 0px) scale(1)', opacity: 1 },
        { transform: `translate(-50%, -50%) translate(${dx * 0.25}px, ${dy * 0.25 + midLift}px) scale(1.06)`, opacity: 1, offset: 0.35 },
        { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(0.92)`, opacity: 0.0 }
      ],
      { duration, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' }
    );

    if (mode === 'merge') {
      window.setTimeout(() => {
        piece.className = `cube10-piece ${clsTo}`;
      }, 180);
    }

    window.setTimeout(() => {
      item.remove();
    }, duration + 30);
  }

  function render() {
    const c1 = $('cube10CountOnes');
    const c10 = $('cube10CountTens');
    const c100 = $('cube10CountHundreds');
    const c1000 = $('cube10CountThousands');
    if (c1) c1.textContent = String(state.ones);
    if (c10) c10.textContent = String(state.tens);
    if (c100) c100.textContent = String(state.hundreds);
    if (c1000) c1000.textContent = String(state.thousands);

    const totalEl = $('cube10Total');
    const digitsEl = $('cube10Digits');
    const total = getTotal();
    if (totalEl) {
      try {
        totalEl.textContent = total.toLocaleString('zh-CN');
      } catch (e) {
        totalEl.textContent = String(total);
      }
    }
    if (digitsEl) digitsEl.textContent = `${state.thousands} / ${state.hundreds} / ${state.tens} / ${state.ones}`;

    // 如果加载了 Three.js 且已初始化，则进行 3D 渲染，否则回退到 CSS 渲染
    if (typeof THREE !== 'undefined' && three.ones.renderer) {
      updateThree('ones', state.ones);
      updateThree('tens', state.tens);
      updateThree('hundreds', state.hundreds);
      updateThree('thousands', state.thousands);
    } else {
      const onesRoot = getItems('ones');
      const tensRoot = getItems('tens');
      const hundredsRoot = getItems('hundreds');
      const thousandsRoot = getItems('thousands');

      if (onesRoot) {
        onesRoot.innerHTML = Array.from({ length: state.ones }, (_, i) => `<div class="cube10-piece one cube10-pop" style="animation-delay:${Math.min(i * 16, 120)}ms"></div>`).join('');
      }
      if (tensRoot) {
        tensRoot.innerHTML = Array.from({ length: state.tens }, (_, i) => `<div class="cube10-piece ten cube10-pop" style="animation-delay:${Math.min(i * 18, 140)}ms"></div>`).join('');
      }
      if (hundredsRoot) {
        hundredsRoot.innerHTML = Array.from({ length: state.hundreds }, (_, i) => `<div class="cube10-piece hundred cube10-pop" style="animation-delay:${Math.min(i * 18, 140)}ms"></div>`).join('');
      }
      if (thousandsRoot) {
        thousandsRoot.innerHTML = Array.from({ length: state.thousands }, (_, i) => `<div class="cube10-piece thousand cube10-pop" style="animation-delay:${Math.min(i * 18, 140)}ms"></div>`).join('');
      }
    }
  }

  function setTotal(total, tip) {
    const v = Math.max(0, Math.min(MAX_TOTAL, Math.trunc(total || 0)));
    state.thousands = Math.floor(v / 1000) % 10;
    state.hundreds = Math.floor(v / 100) % 10;
    state.tens = Math.floor(v / 10) % 10;
    state.ones = v % 10;
    render();
    if (tip) setFeedback('ok', tip);
  }

  async function carryFrom(level) {
    if (level === 'ones' && state.ones >= 10) {
      spawnFx('ones', 'tens', 'merge');
      flashBin('ones', 'carry');
      flashBin('tens', 'carry');
      // 内部合并逻辑也适当减慢，但仍比主步骤快一点
      await sleep(isPlaying ? 400 : 260);
      state.ones -= 10;
      state.tens += 1;
      render();
      await sleep(isPlaying ? 300 : 140);
      return carryFrom('tens');
    }
    if (level === 'tens' && state.tens >= 10) {
      spawnFx('tens', 'hundreds', 'merge');
      flashBin('tens', 'carry');
      flashBin('hundreds', 'carry');
      await sleep(isPlaying ? 400 : 280);
      state.tens -= 10;
      state.hundreds += 1;
      render();
      await sleep(isPlaying ? 300 : 140);
      return carryFrom('hundreds');
    }
    if (level === 'hundreds' && state.hundreds >= 10) {
      spawnFx('hundreds', 'thousands', 'merge');
      flashBin('hundreds', 'carry');
      flashBin('thousands', 'carry');
      await sleep(isPlaying ? 500 : 300);
      state.hundreds -= 10;
      state.thousands += 1;
      render();
      await sleep(isPlaying ? 300 : 160);
      if (state.thousands >= 10) {
        state.thousands = 9;
        state.hundreds = 9;
        state.tens = 9;
        state.ones = 9;
        render();
        setFeedback('bad', '已达到上限（9999）。');
        flashBin('thousands', 'blocked');
      }
    }
  }

  async function addAt(level, fromPlay = false) {
    if (locked || (!fromPlay && isPlaying)) return;
    if (getTotal() >= MAX_TOTAL) {
      flashBin('thousands', 'blocked');
      setFeedback('bad', '已达到上限（9999）。');
      return;
    }
    locked = true;

    if (level === 'ones') {
      state.ones += 1;
      flashBin('ones', 'flash');
      render();
      // 手动点击立即响应 (140ms)，演示动画慢速 (1000ms)
      await sleep(isPlaying ? 1000 : 140);
      await carryFrom('ones');
      setFeedback('ok', '已添加 1。');
    }
    if (level === 'tens') {
      state.tens += 1;
      flashBin('tens', 'flash');
      render();
      await sleep(isPlaying ? 1000 : 160);
      await carryFrom('tens');
      setFeedback('ok', '已添加 10。');
    }
    if (level === 'hundreds') {
      state.hundreds += 1;
      flashBin('hundreds', 'flash');
      render();
      await sleep(isPlaying ? 1000 : 180);
      await carryFrom('hundreds');
      setFeedback('ok', '已添加 100。');
    }
    if (level === 'thousands') {
      if (state.thousands >= 9) {
        flashBin('thousands', 'blocked');
        setFeedback('bad', '已达到上限（9999）。');
        locked = false;
        return;
      }
      state.thousands += 1;
      flashBin('thousands', 'flash');
      render();
      await sleep(isPlaying ? 1000 : 200);
      setFeedback('ok', '已添加 1000。');
    }

    locked = false;
  }

  async function borrowInto(target) {
    const s1 = isPlaying ? 400 : 240;
    const s2 = isPlaying ? 300 : 140;
    if (target === 'ones') {
      if (state.tens > 0) {
        spawnFx('tens', 'ones', 'break');
        flashBin('tens', 'borrow');
        flashBin('ones', 'borrow');
        await sleep(s1);
        state.tens -= 1;
        state.ones += 10;
        render();
        await sleep(s2);
        return true;
      }
      if (state.hundreds > 0) {
        spawnFx('hundreds', 'tens', 'break');
        flashBin('hundreds', 'borrow');
        flashBin('tens', 'borrow');
        await sleep(s1 + 20);
        state.hundreds -= 1;
        state.tens += 10;
        render();
        await sleep(s2 + 20);
        return borrowInto('ones');
      }
      if (state.thousands > 0) {
        spawnFx('thousands', 'hundreds', 'break');
        flashBin('thousands', 'borrow');
        flashBin('hundreds', 'borrow');
        await sleep(s1 + 40);
        state.thousands -= 1;
        state.hundreds += 10;
        render();
        await sleep(s2 + 40);
        return borrowInto('ones');
      }
      return false;
    }
    if (target === 'tens') {
      if (state.hundreds > 0) {
        spawnFx('hundreds', 'tens', 'break');
        flashBin('hundreds', 'borrow');
        flashBin('tens', 'borrow');
        await sleep(s1 + 20);
        state.hundreds -= 1;
        state.tens += 10;
        render();
        await sleep(s2 + 20);
        return true;
      }
      if (state.thousands > 0) {
        spawnFx('thousands', 'hundreds', 'break');
        flashBin('thousands', 'borrow');
        flashBin('hundreds', 'borrow');
        await sleep(s1 + 40);
        state.thousands -= 1;
        state.hundreds += 10;
        render();
        await sleep(s2 + 40);
        return borrowInto('tens');
      }
      return false;
    }
    if (target === 'hundreds') {
      if (state.thousands > 0) {
        spawnFx('thousands', 'hundreds', 'break');
        flashBin('thousands', 'borrow');
        flashBin('hundreds', 'borrow');
        await sleep(s1 + 40);
        state.thousands -= 1;
        state.hundreds += 10;
        render();
        await sleep(s2 + 40);
        return true;
      }
      return false;
    }
    return false;
  }

  async function subAt(level, fromPlay = false) {
    if (locked || (!fromPlay && isPlaying)) return;
    const before = getTotal();
    const need = level === 'ones' ? 1 : (level === 'tens' ? 10 : (level === 'hundreds' ? 100 : 1000));
    if (before - need < 0) {
      flashBin(level, 'blocked');
      setFeedback('bad', '数量不足，无法继续移除。');
      return;
    }

    locked = true;

    if (level === 'ones') {
      if (state.ones === 0) {
        const ok = await borrowInto('ones');
        if (!ok) {
          flashBin('ones', 'blocked');
          setFeedback('bad', '数量不足，无法继续移除。');
          locked = false;
          return;
        }
      }
      state.ones -= 1;
      flashBin('ones', 'flash');
      render();
      await sleep(isPlaying ? 1000 : 140);
      setFeedback('ok', '已移除 1。');
    }

    if (level === 'tens') {
      if (state.tens === 0) {
        const ok = await borrowInto('tens');
        if (!ok) {
          flashBin('tens', 'blocked');
          setFeedback('bad', '数量不足，无法继续移除。');
          locked = false;
          return;
        }
      }
      state.tens -= 1;
      flashBin('tens', 'flash');
      render();
      await sleep(isPlaying ? 1000 : 160);
      setFeedback('ok', '已移除 10。');
    }

    if (level === 'hundreds') {
      if (state.hundreds === 0) {
        const ok = await borrowInto('hundreds');
        if (!ok) {
          flashBin('hundreds', 'blocked');
          setFeedback('bad', '数量不足，无法继续移除。');
          locked = false;
          return;
        }
      }
      state.hundreds -= 1;
      flashBin('hundreds', 'flash');
      render();
      await sleep(isPlaying ? 1000 : 180);
      setFeedback('ok', '已移除 100。');
    }

    if (level === 'thousands') {
      state.thousands -= 1;
      flashBin('thousands', 'flash');
      render();
      await sleep(isPlaying ? 1000 : 200);
      setFeedback('ok', '已移除 1000。');
    }

    locked = false;
  }

  async function playSteps(steps) {
    if (isPlaying) return;
    isPlaying = true;
    playToken += 1;
    const token = playToken;
    $('cube10StopBtn')?.classList.remove('hidden');
    for (let i = 0; i < steps.length; i += 1) {
      if (!isPlaying || token !== playToken) break;
      const step = steps[i];
      if (step.tip) setFeedback('ok', step.tip);
      if (step.setTotal !== undefined) setTotal(step.setTotal, step.tip || '');
      if (step.add) await addAt(step.add, true);
      if (step.sub) await subAt(step.sub, true);
      // 一键演示，每个动作间隔延长到 1.5 秒
      await sleep(step.waitMs || 1500);
    }
    isPlaying = false;
  }

  function stop() {
    isPlaying = false;
    playToken += 1;
    setFeedback('bad', '已停止播放。');
  }

  function bind() {
    if (bound) return;
    bound = true;
    $('cube10Add1')?.addEventListener('click', () => addAt('ones'));
    $('cube10Sub1')?.addEventListener('click', () => subAt('ones'));
    $('cube10Add10')?.addEventListener('click', () => addAt('tens'));
    $('cube10Sub10')?.addEventListener('click', () => subAt('tens'));
    $('cube10Add100')?.addEventListener('click', () => addAt('hundreds'));
    $('cube10Sub100')?.addEventListener('click', () => subAt('hundreds'));
    $('cube10Add1000')?.addEventListener('click', () => addAt('thousands'));
    $('cube10Sub1000')?.addEventListener('click', () => subAt('thousands'));
    $('cube10ResetBtn')?.addEventListener('click', () => {
      if (locked || isPlaying) return;
      setTotal(0, '已重置为 0。');
    });
    $('cube10StopBtn')?.addEventListener('click', stop);
    $('cube10DemoCarry')?.addEventListener('click', () => {
      if (locked || isPlaying) return;
      playSteps([
        { setTotal: 999, tip: '初始化：999（9 板 + 9 柱 + 9 单块）', waitMs: 680 },
        { add: 'ones', tip: '执行：+1 → 触发 1→10→100→1000 连续合并', waitMs: 900 },
        { tip: '完成：999 + 1 = 1000', waitMs: 620 }
      ]);
    });
    $('cube10DemoBorrow')?.addEventListener('click', () => {
      if (locked || isPlaying) return;
      playSteps([
        { setTotal: 1000, tip: '初始化：1000（1 个大方块）', waitMs: 680 },
        { sub: 'ones', tip: '执行：-1 → 单块不足，自动拆解借位（1000→999）', waitMs: 900 },
        { tip: '完成：1000 - 1 = 999', waitMs: 620 }
      ]);
    });
  }

  function sync() {
    bind();
    initThree('ones');
    initThree('tens');
    initThree('hundreds');
    initThree('thousands');
    render();
    lucide.createIcons();
  }

  function init() {
    bind();
    initThree('ones');
    initThree('tens');
    initThree('hundreds');
    initThree('thousands');
    setTotal(0, '提示：用按钮操作十进制方块。');
    lucide.createIcons();
  }

  return { init, sync, setTotal, getTotal, stop };
})();

window.bananaTool = (() => {
  const MAX_TOTAL = 99;
  const state = { tens: 0, ones: 0, expr: '' };
  let bound = false;
  let locked = false;
  let isPlaying = false;
  let playToken = 0;

  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));

  function getTotal() {
    return state.tens * 10 + state.ones;
  }

  function clampTotal(total) {
    const v = Math.trunc(total || 0);
    return Math.max(0, Math.min(MAX_TOTAL, v));
  }

  function setFeedback(kind, msg) {
    const el = $('bananaFeedback');
    if (!el) return;
    el.textContent = msg;
    el.style.borderColor = 'rgba(99, 102, 241, 0.14)';
    el.style.background = 'rgba(255,255,255,0.8)';
    if (kind === 'ok') {
      el.style.borderColor = 'rgba(16, 185, 129, 0.35)';
      el.style.background = 'rgba(236, 253, 245, 0.8)';
    }
    if (kind === 'bad') {
      el.style.borderColor = 'rgba(239, 68, 68, 0.35)';
      el.style.background = 'rgba(254, 242, 242, 0.8)';
    }
  }

  function getBin(level) {
    const map = {
      ones: $('bananaBinOnes'),
      tens: $('bananaBinTens'),
      trash: $('bananaTrash'),
      stage: $('bananaStage')
    };
    return map[level] || null;
  }

  function getItems(level) {
    const map = {
      ones: $('bananaItemsOnes'),
      tens: $('bananaItemsTens')
    };
    return map[level] || null;
  }

  function flashBin(level, kind) {
    const el = getBin(level);
    if (!el) return;
    const cls = kind === 'carry' ? 'is-carry' : (kind === 'borrow' ? 'is-borrow' : (kind === 'blocked' ? 'is-blocked' : 'is-flash'));
    el.classList.remove('is-flash', 'is-carry', 'is-borrow', 'is-blocked');
    void el.offsetWidth;
    el.classList.add(cls);
    window.setTimeout(() => el.classList.remove(cls), 580);
  }

  function createPiece(kind) {
    const el = document.createElement('div');
    el.className = `banana-piece ${kind}`;
    if (kind === 'single') {
      el.textContent = '🍌';
    } else {
      el.textContent = '🍌🍌🍌';
      const badge = document.createElement('span');
      badge.className = 'banana-badge';
      badge.textContent = '10';
      el.appendChild(badge);
    }
    return el;
  }

  function spawnFx(fromLevel, toLevel, mode, label) {
    const fx = $('bananaFx');
    const fromEl = getBin(fromLevel);
    const toEl = getBin(toLevel);
    if (!fx || !fromEl || !toEl) return;

    const fxRect = fx.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const from = { x: a.left + a.width / 2, y: a.top + a.height / 2 };
    const to = { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    const item = document.createElement('div');
    item.className = 'banana-fx-item';
    item.style.left = `${from.x - fxRect.left}px`;
    item.style.top = `${from.y - fxRect.top}px`;

    const kind = (mode === 'break' || mode === 'drop') ? (toLevel === 'tens' ? 'bunch' : 'single') : (fromLevel === 'tens' ? 'bunch' : 'single');
    const piece = createPiece(kind);
    piece.style.transform = 'scale(0.96)';
    item.appendChild(piece);

    if (label) {
      const tag = document.createElement('div');
      tag.className = 'banana-fx-label';
      tag.textContent = label;
      item.appendChild(tag);
    }

    fx.appendChild(item);

    const duration = mode === 'merge' ? 560 : 520;
    const lift = mode === 'eat' ? -10 : -22;
    item.animate(
      [
        { transform: 'translate(-50%, -50%) translate(0px, 0px) scale(1)', opacity: 1 },
        { transform: `translate(-50%, -50%) translate(${dx * 0.35}px, ${dy * 0.35 + lift}px) scale(1.08)`, opacity: 1, offset: 0.38 },
        { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(0.92)`, opacity: 0.0 }
      ],
      { duration, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' }
    );

    if (mode === 'merge') {
      window.setTimeout(() => {
        piece.replaceWith(createPiece('bunch'));
      }, 210);
    }

    window.setTimeout(() => item.remove(), duration + 60);
  }

  function render() {
    const c10 = $('bananaCountTens');
    const c1 = $('bananaCountOnes');
    if (c10) c10.textContent = String(state.tens);
    if (c1) c1.textContent = String(state.ones);

    const totalEl = $('bananaTotal');
    const digitsEl = $('bananaDigits');
    const exprEl = $('bananaExpression');
    if (totalEl) totalEl.textContent = String(getTotal());
    if (digitsEl) digitsEl.textContent = `${state.tens} / ${state.ones}`;
    if (exprEl) exprEl.textContent = state.expr ? state.expr : '—';

    const onesRoot = getItems('ones');
    const tensRoot = getItems('tens');
    if (onesRoot) {
      onesRoot.innerHTML = Array.from({ length: state.ones }, (_, i) =>
        `<div class="banana-piece single banana-pop" draggable="true" data-level="ones" role="button" tabindex="0" aria-label="香蕉单根，按回车或空格吃掉 1 根" title="点击吃掉 1 根" style="animation-delay:${Math.min(i * 14, 110)}ms">🍌</div>`
      ).join('');
    }
    if (tensRoot) {
      tensRoot.innerHTML = Array.from({ length: state.tens }, (_, i) =>
        `<div class="banana-piece bunch banana-pop" draggable="true" data-level="tens" role="button" tabindex="0" aria-label="香蕉成串，按回车或空格吃掉 1 串（10）" title="点击吃掉 1 串(10)" style="animation-delay:${Math.min(i * 16, 130)}ms">🍌🍌🍌<span class="banana-badge">10</span></div>`
      ).join('');
    }
  }

  function setTotal(total, expr) {
    const v = clampTotal(total);
    state.tens = Math.floor(v / 10);
    state.ones = v % 10;
    state.expr = expr || state.expr || '';
    render();
  }

  async function carryFromOnes(token) {
    while (state.ones >= 10) {
      if (token !== undefined && token !== playToken) return;
      if (state.tens >= 9) {
        state.tens = 9;
        state.ones = 9;
        render();
        flashBin('tens', 'blocked');
        setFeedback('bad', '已达到上限（99）。');
        return;
      }
      spawnFx('ones', 'tens', 'merge', '扎成一串');
      flashBin('ones', 'carry');
      flashBin('tens', 'carry');
      await sleep(260);
      if (token !== undefined && token !== playToken) return;
      state.ones -= 10;
      state.tens += 1;
      render();
      await sleep(120);
    }
  }

  async function borrowIntoOnes(token) {
    if (state.tens <= 0) return false;
    spawnFx('tens', 'ones', 'break', '拆成10根');
    flashBin('tens', 'borrow');
    flashBin('ones', 'borrow');
    await sleep(260);
    if (token !== undefined && token !== playToken) return false;
    state.tens -= 1;
    state.ones += 10;
    render();
    await sleep(120);
    return true;
  }

  async function addAt(level, fromPlay = false, label) {
    if (locked) return;
    if (!fromPlay && isPlaying) {
      setFeedback('bad', '正在演示中，可点击“停止”后再操作。');
      return;
    }
    const delta = level === 'tens' ? 10 : 1;
    if (getTotal() + delta > MAX_TOTAL) {
      flashBin(level, 'blocked');
      setFeedback('bad', '已达到上限（99）。');
      return;
    }
    locked = true;
    const token = isPlaying ? playToken : undefined;

    if (label) spawnFx('stage', level, 'drop', label);
    if (level === 'ones') {
      state.ones += 1;
      flashBin('ones', 'flash');
      render();
      await sleep(140);
      await carryFromOnes(token);
      setFeedback('ok', '已添加 1 根香蕉。');
    } else {
      state.tens += 1;
      flashBin('tens', 'flash');
      render();
      await sleep(160);
      setFeedback('ok', '已添加 1 串香蕉（10）。');
    }
    locked = false;
  }

  async function subAt(level, fromPlay = false, label) {
    if (locked) return;
    if (!fromPlay && isPlaying) {
      setFeedback('bad', '正在演示中，可点击“停止”后再操作。');
      return;
    }
    locked = true;
    const token = isPlaying ? playToken : undefined;

    if (level === 'ones') {
      if (state.ones <= 0) {
        const ok = await borrowIntoOnes(token);
        if (!ok) {
          flashBin('ones', 'blocked');
          setFeedback('bad', '个位不够减，十位也没有成串可拆。');
          locked = false;
          return;
        }
      }
      if (label) spawnFx('ones', 'trash', 'eat', label);
      state.ones -= 1;
      flashBin('ones', 'flash');
      render();
      await sleep(140);
      if (state.ones >= 10) {
        state.tens += Math.floor(state.ones / 10);
        state.ones = state.ones % 10;
        if (state.tens > 9) state.tens = 9;
        render();
      }
      setFeedback('ok', '已吃掉 1 根香蕉。');
      locked = false;
      return;
    }

    if (state.tens <= 0) {
      flashBin('tens', 'blocked');
      setFeedback('bad', '十位区没有成串可减。');
      locked = false;
      return;
    }
    if (label) spawnFx('tens', 'trash', 'eat', label);
    state.tens -= 1;
    flashBin('tens', 'flash');
    render();
    await sleep(160);
    setFeedback('ok', '已吃掉 1 串香蕉（10）。');
    locked = false;
  }

  function encodeDrag(data) {
    try {
      return JSON.stringify(data);
    } catch (e) {
      return '';
    }
  }

  function decodeDrag(raw) {
    try {
      const v = JSON.parse(raw || '');
      if (!v || typeof v !== 'object') return null;
      return v;
    } catch (e) {
      return null;
    }
  }

  function stop() {
    if (!isPlaying) return;
    playToken += 1;
    isPlaying = false;
    locked = false;
    const fx = $('bananaFx');
    if (fx) fx.innerHTML = '';
    setFeedback('bad', '已停止演示。');
  }

  async function play18Add5() {
    if (locked || isPlaying) return;
    isPlaying = true;
    playToken += 1;
    const token = playToken;
    setTotal(0, '18 + 5');
    setFeedback('ok', '小猴子把香蕉搬来：先搬 18，再搬 5。');
    await sleep(420);
    if (token !== playToken) return;

    await addAt('tens', true, '搬来 1 串');
    await sleep(160);
    for (let i = 0; i < 8; i++) {
      if (token !== playToken) return;
      await addAt('ones', true, i === 0 ? '搬来 8 根' : undefined);
      await sleep(90);
    }
    await sleep(240);
    if (token !== playToken) return;
    setFeedback('ok', '再搬来 5 根香蕉，看看会不会“满十成串”。');
    await sleep(260);
    for (let i = 0; i < 5; i++) {
      if (token !== playToken) return;
      await addAt('ones', true, i === 0 ? '再搬来 5 根' : undefined);
      await sleep(90);
    }
    await sleep(420);
    if (token !== playToken) return;
    setFeedback('ok', `完成：18 + 5 = ${getTotal()}。`);
    isPlaying = false;
  }

  async function play32Sub7() {
    if (locked || isPlaying) return;
    isPlaying = true;
    playToken += 1;
    const token = playToken;
    setTotal(0, '32 - 7');
    setFeedback('ok', '小猴子先把 32 根香蕉搬来，然后吃掉 7 根。');
    await sleep(420);
    if (token !== playToken) return;

    for (let i = 0; i < 3; i++) {
      if (token !== playToken) return;
      await addAt('tens', true, i === 0 ? '搬来 3 串' : undefined);
      await sleep(100);
    }
    for (let i = 0; i < 2; i++) {
      if (token !== playToken) return;
      await addAt('ones', true, i === 0 ? '再搬来 2 根' : undefined);
      await sleep(90);
    }
    await sleep(260);
    if (token !== playToken) return;

    setFeedback('ok', '开始吃掉 7 根香蕉。个位不够时会自动拆一串继续吃。');
    await sleep(240);
    for (let i = 0; i < 7; i++) {
      if (token !== playToken) return;
      await subAt('ones', true, i === 0 ? '吃掉 7 根' : undefined);
      await sleep(110);
    }
    await sleep(420);
    if (token !== playToken) return;
    setFeedback('ok', `完成：32 - 7 = ${getTotal()}。`);
    isPlaying = false;
  }

  function bind() {
    if (bound) return;
    bound = true;

    $('bananaAdd1')?.addEventListener('click', () => addAt('ones'));
    $('bananaSub1')?.addEventListener('click', () => subAt('ones'));
    $('bananaAdd10')?.addEventListener('click', () => addAt('tens'));
    $('bananaSub10')?.addEventListener('click', () => subAt('tens'));

    $('bananaStopBtn')?.addEventListener('click', stop);
    $('bananaDemo18Add5')?.addEventListener('click', play18Add5);
    $('bananaDemo32Sub7')?.addEventListener('click', play32Sub7);

    $('bananaDragSingle')?.addEventListener('dragstart', (e) => {
      if (!e.dataTransfer) return;
      e.dataTransfer.setData('text/plain', encodeDrag({ type: 'add', level: 'ones' }));
      e.dataTransfer.effectAllowed = 'copy';
    });
    $('bananaDragBunch')?.addEventListener('dragstart', (e) => {
      if (!e.dataTransfer) return;
      e.dataTransfer.setData('text/plain', encodeDrag({ type: 'add', level: 'tens' }));
      e.dataTransfer.effectAllowed = 'copy';
    });

    ['ones', 'tens'].forEach(level => {
      const bin = getBin(level);
      if (!bin) return;
      bin.addEventListener('dragover', (e) => {
        e.preventDefault();
        bin.classList.add('is-drop');
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      });
      bin.addEventListener('dragleave', () => bin.classList.remove('is-drop'));
      bin.addEventListener('drop', async (e) => {
        e.preventDefault();
        bin.classList.remove('is-drop');
        const payload = decodeDrag(e.dataTransfer?.getData('text/plain'));
        if (!payload) return;
        if (payload.type === 'add') {
          if (payload.level !== level) {
            flashBin(level, 'blocked');
            setFeedback('bad', level === 'tens' ? '这里是十位区：请拖拽“成串(10)”到这里。' : '这里是个位区：请拖拽“单根(1)”到这里。');
            return;
          }
          await addAt(level);
        }
      });
    });

    const trash = getBin('trash');
    if (trash) {
      trash.addEventListener('dragover', (e) => {
        e.preventDefault();
        trash.classList.add('is-drop');
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      });
      trash.addEventListener('dragleave', () => trash.classList.remove('is-drop'));
      trash.addEventListener('drop', async (e) => {
        e.preventDefault();
        trash.classList.remove('is-drop');
        const payload = decodeDrag(e.dataTransfer?.getData('text/plain'));
        if (!payload || payload.type !== 'remove') return;
        await subAt(payload.level === 'tens' ? 'tens' : 'ones');
      });
    }

    const onDragStartPiece = (e) => {
      const t = e.target;
      if (!t || !(t instanceof HTMLElement)) return;
      const piece = t.closest('.banana-piece');
      if (!piece) return;
      const level = piece.getAttribute('data-level');
      if (!level) return;
      if (!e.dataTransfer) return;
      e.dataTransfer.setData('text/plain', encodeDrag({ type: 'remove', level }));
      e.dataTransfer.effectAllowed = 'move';
    };
    const onClickPiece = async (e) => {
      const t = e.target;
      if (!t || !(t instanceof HTMLElement)) return;
      const piece = t.closest('.banana-piece');
      if (!piece) return;
      const level = piece.getAttribute('data-level');
      if (!level) return;
      await subAt(level === 'tens' ? 'tens' : 'ones', false, '吃掉');
    };

    $('bananaItemsOnes')?.addEventListener('dragstart', onDragStartPiece);
    $('bananaItemsTens')?.addEventListener('dragstart', onDragStartPiece);
    $('bananaItemsOnes')?.addEventListener('click', onClickPiece);
    $('bananaItemsTens')?.addEventListener('click', onClickPiece);

    const onKeyEat = async (e) => {
      const t = e.target;
      if (!t || !(t instanceof HTMLElement)) return;
      if (!t.classList.contains('banana-piece')) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const level = t.getAttribute('data-level');
      if (!level) return;
      await subAt(level === 'tens' ? 'tens' : 'ones', false, '吃掉');
    };
    $('bananaItemsOnes')?.addEventListener('keydown', onKeyEat);
    $('bananaItemsTens')?.addEventListener('keydown', onKeyEat);
  }

  function sync() {
    bind();
    render();
    lucide.createIcons();
  }

  function init() {
    bind();
    setTotal(0, '');
    setFeedback('ok', '提示：用按钮或拖拽添加/移除香蕉。点击香蕉也可以“吃掉”。');
    lucide.createIcons();
  }

  return { init, sync, setTotal, getTotal, stop };
})();

window.tenFrameTool = (() => {
  const CELL_COUNT = 10
  const MAX_COUNT = 20
  const POINTER_THRESHOLD = 6
  const DEFAULT_BLUE = '#3B82F6'
  const DEFAULT_RED = '#EF4444'
  const PRESET_COLORS = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#d946ef',
    '#ec4899'
  ]

  const state = {
    tab: 'recognize',
    mode: 'one',
    fillMode: 'sequential',
    colorMode: 'uniform',
    leftBoard: createEmptyBoard(),
    rightBoard: createEmptyBoard(),
    manualColor: 'blue',
    leftOperand: 8,
    rightOperand: 5,
    operation: '+',
    statusText: '待开始',
    isPlaying: false
  }

  let bound = false
  let playToken = 0
  let pressState = null
  let activeDrag = null
  let snapTarget = null

  const $ = (id) => document.getElementById(id)
  const sleep = (ms) => new Promise(resolve => window.setTimeout(resolve, ms))

  /**
   * 创建一个空的十格阵盘面。
   */
  function createEmptyBoard() {
    return Array.from({ length: CELL_COUNT }, () => null)
  }

  /**
   * 生成数组的浅拷贝乱序版本，用于乱序填充十格阵。
   */
  function shuffleArray(list) {
    const next = [...list]
    for (let index = next.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
    }
    return next
  }

  /**
   * 将输入值收敛到整数范围内，避免出现 NaN 或越界状态。
   */
  function clampInt(value, min, max, fallback = min) {
    const num = Number(value)
    if (Number.isNaN(num)) return fallback
    return Math.max(min, Math.min(max, Math.round(num)))
  }

  /**
   * 根据当前模式返回需要展示的盘面列表。
   */
  function getBoardIds() {
    return state.mode === 'two' ? ['left', 'right'] : ['left']
  }

  /**
   * 获取指定盘面的当前状态数组。
   */
  function getBoard(boardId) {
    return boardId === 'left' ? state.leftBoard : state.rightBoard
  }

  /**
   * 写回指定盘面的状态数组。
   */
  function setBoard(boardId, nextBoard) {
    if (boardId === 'left') {
      state.leftBoard = nextBoard
      return
    }
    state.rightBoard = nextBoard
  }

  /**
   * 计算单盘中当前已填充的圆片数量。
   */
  function countFilled(boardId) {
    return getBoard(boardId).filter(Boolean).length
  }

  /**
   * 计算当前可见盘面的圆片总数。
   */
  function getTotalCount() {
    return countFilled('left') + (state.mode === 'two' ? countFilled('right') : 0)
  }

  /**
   * 获取当前手动操作所使用的语义颜色。
   */
  function getManualColorValue() {
    return state.manualColor === 'red' ? DEFAULT_RED : DEFAULT_BLUE
  }

  /**
   * 基于数量、填充顺序和配色模式构造新的盘面。
   */
  function buildBoardsByCount(count, fillMode, colorMode, primaryColor, modeOverride) {
    const left = createEmptyBoard()
    const right = createEmptyBoard()
    const normalizedCount = clampInt(count, 0, MAX_COUNT, 0)
    const resolvedMode = normalizedCount > 10 ? 'two' : modeOverride
    const totalCells = resolvedMode === 'two' ? 20 : 10
    let indices = Array.from({ length: totalCells }, (_, index) => index)
    if (fillMode === 'random') {
      indices = shuffleArray(indices)
    }
    const fillIndices = indices.slice(0, normalizedCount)
    fillIndices.forEach((index) => {
      const color = colorMode === 'random'
        ? PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
        : primaryColor
      if (index < 10) {
        left[index] = color
      } else {
        right[index - 10] = color
      }
    })
    return { left, right, mode: resolvedMode }
  }

  /**
   * 按给定数量重建盘面，并同步单双盘状态。
   */
  function applySetCount(nextCount, options = {}) {
    const fillMode = options.fillMode || state.fillMode
    const colorMode = options.colorMode || state.colorMode
    const mode = options.mode || state.mode
    const primaryColor = options.primaryColor || DEFAULT_BLUE
    const nextBoards = buildBoardsByCount(nextCount, fillMode, colorMode, primaryColor, mode)
    state.fillMode = fillMode
    state.colorMode = colorMode
    state.mode = nextBoards.mode
    state.leftBoard = nextBoards.left
    state.rightBoard = nextBoards.right
  }

  /**
   * 在当前 DOM 中定位指定格子，供拖拽和动画使用。
   */
  function getCellElement(boardId, index) {
    return document.querySelector(`.tf-cell[data-board-id="${boardId}"][data-index="${index}"]`)
  }

  /**
   * 给指定格子施加一次脉冲动画，突出盘面变化位置。
   */
  function pulseCell(boardId, index) {
    const cell = getCellElement(boardId, index)
    if (!cell) return
    cell.classList.remove('is-pulse')
    void cell.offsetWidth
    cell.classList.add('is-pulse')
    window.setTimeout(() => cell.classList.remove('is-pulse'), 340)
  }

  /**
   * 将按钮的选中态统一收敛到同一套 class 规则中。
   */
  function toggleActive(id, active) {
    const el = $(id)
    if (!el) return
    el.classList.toggle('is-active', active)
  }

  /**
   * 按当前状态刷新盘面卡片、控制区和状态文案。
   */
  function render() {
    const leftRoot = $('tenframeBoardLeft')
    const rightRoot = $('tenframeBoardRight')
    const rightWrap = $('tenframeBoardRightWrap')
    if (!leftRoot || !rightRoot || !rightWrap) return

    leftRoot.innerHTML = renderBoardCells('left')
    rightRoot.innerHTML = renderBoardCells('right')
    rightWrap.classList.toggle('is-hidden', state.mode !== 'two')

    const leftSummary = $('tenframeLeftSummary')
    const rightSummary = $('tenframeRightSummary')
    const totalCount = $('tenframeTotalCount')
    const modeLabel = $('tenframeModeLabel')
    const tabLabel = $('tenframeTabLabel')
    const hint = $('tenframeHint')
    const status = $('tenframeStatus')
    const countValue = $('tenframeCountValue')
    const countRange = $('tenframeCountRange')
    const leftOperand = $('tenframeLeftOperand')
    const rightOperand = $('tenframeRightOperand')
    const operationToggle = $('tenframeOperationToggle')
    const startDemo = $('tenframeStartDemo')

    if (leftSummary) leftSummary.textContent = `${countFilled('left')} / 10`
    if (rightSummary) rightSummary.textContent = `${countFilled('right')} / 10`
    if (totalCount) totalCount.textContent = String(getTotalCount())
    if (modeLabel) modeLabel.textContent = state.mode === 'two' ? '两盘' : '一盘'
    if (tabLabel) tabLabel.textContent = state.tab === 'math' ? '加减法' : '识数'
    if (hint) {
      hint.textContent = state.tab === 'math'
        ? '提示：点击空格可按当前手动颜色添加或移除圆片；点击“开始演示”查看加减过程。'
        : '提示：点击空格可添加或移除圆片；拖动已有圆片可以在空格之间移动。'
    }
    if (status) status.textContent = state.statusText
    if (countValue) countValue.textContent = String(getTotalCount())
    if (countRange) countRange.value = String(getTotalCount())
    if (leftOperand) leftOperand.value = String(state.leftOperand)
    if (rightOperand) rightOperand.value = String(state.rightOperand)
    if (operationToggle) {
      operationToggle.textContent = state.operation
      operationToggle.classList.toggle('is-active', state.operation === '+')
    }
    if (startDemo) startDemo.disabled = state.isPlaying

    toggleActive('tenframeTabRecognize', state.tab === 'recognize')
    toggleActive('tenframeTabMath', state.tab === 'math')
    toggleActive('tenframeRecognizeModeOne', state.mode === 'one')
    toggleActive('tenframeRecognizeModeTwo', state.mode === 'two')
    toggleActive('tenframeMathModeOne', state.mode === 'one')
    toggleActive('tenframeMathModeTwo', state.mode === 'two')
    toggleActive('tenframeFillSequential', state.fillMode === 'sequential')
    toggleActive('tenframeFillRandom', state.fillMode === 'random')
    toggleActive('tenframeColorUniform', state.colorMode === 'uniform')
    toggleActive('tenframeColorRandom', state.colorMode === 'random')
    toggleActive('tenframeManualBlue', state.manualColor === 'blue')
    toggleActive('tenframeManualRed', state.manualColor === 'red')

    const recognizePanel = $('tenframePanelRecognize')
    const mathPanel = $('tenframePanelMath')
    if (recognizePanel) recognizePanel.classList.toggle('hidden', state.tab !== 'recognize')
    if (mathPanel) mathPanel.classList.toggle('hidden', state.tab !== 'math')

    updateDragGhost()
  }

  /**
   * 输出指定盘面的十个格子 HTML。
   */
  function renderBoardCells(boardId) {
    return getBoard(boardId).map((color, index) => {
      const classes = ['tf-cell']
      if (color) classes.push('is-filled')
      if (snapTarget && snapTarget.boardId === boardId && snapTarget.index === index) {
        classes.push('is-snap')
      }
      return `
        <button
          type="button"
          class="${classes.join(' ')}"
          data-board-id="${boardId}"
          data-index="${index}"
          aria-label="${boardId === 'left' ? '左' : '右'}盘第 ${index + 1} 格"
        >
          ${color ? `<span class="tf-token" style="background:${color}"></span>` : ''}
        </button>
      `
    }).join('')
  }

  /**
   * 根据当前拖拽状态刷新悬浮圆片。
   */
  function updateDragGhost() {
    const ghost = $('tenframeDragGhost')
    if (!ghost) return
    if (!activeDrag) {
      ghost.classList.remove('is-active')
      ghost.style.background = 'transparent'
      return
    }
    ghost.classList.add('is-active')
    ghost.style.left = `${activeDrag.x}px`
    ghost.style.top = `${activeDrag.y}px`
    ghost.style.background = activeDrag.color
  }

  /**
   * 切换单双盘展示，并在超出一盘容量时给出兜底提示。
   */
  function setMode(nextMode) {
    if (state.isPlaying) return
    const total = getTotalCount()
    if (nextMode === 'one' && total > 10) {
      state.statusText = '当前数量超过 10，自动保持两盘展示。'
      state.mode = 'two'
      render()
      return
    }
    state.mode = nextMode
    render()
  }

  /**
   * 根据当前运算符限制左右操作数，避免出现非法演示状态。
   */
  function normalizeOperands() {
    state.leftOperand = clampInt(state.leftOperand, 0, MAX_COUNT, 0)
    state.rightOperand = clampInt(state.rightOperand, 0, MAX_COUNT, 0)
    if (state.operation === '+') {
      if (state.leftOperand + state.rightOperand > MAX_COUNT) {
        state.rightOperand = MAX_COUNT - state.leftOperand
      }
      return
    }
    if (state.rightOperand > state.leftOperand) {
      state.rightOperand = state.leftOperand
    }
  }

  /**
   * 点击格子时执行手动新增或移除圆片。
   */
  function toggleCell(boardId, index) {
    const board = [...getBoard(boardId)]
    board[index] = board[index] ? null : (state.tab === 'math' ? getManualColorValue() : DEFAULT_BLUE)
    setBoard(boardId, board)
    state.statusText = board[index] ? `已在${boardId === 'left' ? '左' : '右'}盘第 ${index + 1} 格放入圆片。` : `已清空${boardId === 'left' ? '左' : '右'}盘第 ${index + 1} 格。`
    render()
    pulseCell(boardId, index)
  }

  /**
   * 从坐标位置判断当前拖拽可吸附的目标空格。
   */
  function detectSnapTarget(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY)
    const cell = el && el.closest ? el.closest('.tf-cell') : null
    if (!cell) {
      snapTarget = null
      render()
      return
    }
    const boardId = cell.getAttribute('data-board-id')
    const index = Number(cell.getAttribute('data-index'))
    const occupied = Boolean(getBoard(boardId)[index])
    if (
      !boardId ||
      Number.isNaN(index) ||
      occupied ||
      (activeDrag && activeDrag.boardId === boardId && activeDrag.index === index)
    ) {
      snapTarget = null
      render()
      return
    }
    snapTarget = { boardId, index }
    render()
  }

  /**
   * 清理当前拖拽过程绑定的全局指针事件。
   */
  function cleanupPointerListeners() {
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerUp)
  }

  /**
   * 处理格子按下事件，区分点击与拖拽移动。
   */
  function handleCellPointerDown(event) {
    if (state.isPlaying) return
    const cell = event.target && event.target.closest ? event.target.closest('.tf-cell') : null
    if (!cell) return
    event.preventDefault()
    const boardId = cell.getAttribute('data-board-id')
    const index = Number(cell.getAttribute('data-index'))
    if (!boardId || Number.isNaN(index)) return
    const color = getBoard(boardId)[index]
    pressState = {
      boardId,
      index,
      startX: event.clientX,
      startY: event.clientY,
      allowDrag: Boolean(color),
      moved: false
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  /**
   * 在拖拽过程中更新悬浮圆片位置，并计算可放置目标。
   */
  function handlePointerMove(event) {
    if (!pressState) return
    const distance = Math.hypot(event.clientX - pressState.startX, event.clientY - pressState.startY)
    if (pressState.allowDrag && distance > POINTER_THRESHOLD) {
      pressState.moved = true
      if (!activeDrag) {
        const color = getBoard(pressState.boardId)[pressState.index]
        if (color) {
          activeDrag = {
            boardId: pressState.boardId,
            index: pressState.index,
            color,
            x: event.clientX,
            y: event.clientY
          }
        }
      }
    }
    if (!activeDrag) return
    activeDrag.x = event.clientX
    activeDrag.y = event.clientY
    detectSnapTarget(event.clientX, event.clientY)
    updateDragGhost()
  }

  /**
   * 在抬起指针时提交拖拽结果，或回退为点击切换。
   */
  function handlePointerUp() {
    cleanupPointerListeners()
    if (activeDrag && snapTarget) {
      const sourceBoard = [...getBoard(activeDrag.boardId)]
      const targetBoard = activeDrag.boardId === snapTarget.boardId ? sourceBoard : [...getBoard(snapTarget.boardId)]
      if (!targetBoard[snapTarget.index]) {
        sourceBoard[activeDrag.index] = null
        targetBoard[snapTarget.index] = activeDrag.color
        setBoard(activeDrag.boardId, sourceBoard)
        setBoard(snapTarget.boardId, targetBoard)
        state.statusText = `已将圆片移动到${snapTarget.boardId === 'left' ? '左' : '右'}盘第 ${snapTarget.index + 1} 格。`
      }
    } else if (pressState && !pressState.moved) {
      toggleCell(pressState.boardId, pressState.index)
    }
    const target = snapTarget
    pressState = null
    activeDrag = null
    snapTarget = null
    render()
    if (target) pulseCell(target.boardId, target.index)
  }

  /**
   * 开始执行当前加减法演示，并逐步刷新盘面状态。
   */
  async function startDemo() {
    if (state.isPlaying) return
    normalizeOperands()
    state.isPlaying = true
    playToken += 1
    const token = playToken
    const left = state.leftOperand
    const right = state.rightOperand
    const needsTwo = left > 10 || (state.operation === '+' && left + right > 10)
    const initBoards = buildBoardsByCount(left, 'sequential', 'uniform', DEFAULT_BLUE, needsTwo ? 'two' : 'one')
    state.mode = initBoards.mode
    state.leftBoard = initBoards.left
    state.rightBoard = initBoards.right
    state.statusText = '准备第一个数'
    render()
    await sleep(650)
    if (token !== playToken) return

    if (state.operation === '-') {
      let removed = 0
      state.statusText = '开始减去'
      render()
      for (let step = 0; step < right; step += 1) {
        const targetIndex = left - 1 - step
        if (targetIndex < 0) break
        const boardId = targetIndex < 10 ? 'left' : 'right'
        const index = targetIndex < 10 ? targetIndex : targetIndex - 10
        const board = [...getBoard(boardId)]
        board[index] = null
        setBoard(boardId, board)
        removed += 1
        state.statusText = `正在减去第 ${removed} 个圆片`
        render()
        pulseCell(boardId, index)
        await sleep(360)
        if (token !== playToken) return
      }
      state.isPlaying = false
      state.statusText = `演示完成：${left} - ${removed} = ${left - removed}`
      render()
      return
    }

    let added = 0
    state.statusText = '开始往上加'
    render()
    for (let step = 0; step < right; step += 1) {
      const targetIndex = left + step
      if (targetIndex >= MAX_COUNT) break
      const boardId = targetIndex < 10 ? 'left' : 'right'
      const index = targetIndex < 10 ? targetIndex : targetIndex - 10
      const board = [...getBoard(boardId)]
      board[index] = DEFAULT_RED
      setBoard(boardId, board)
      added += 1
      state.statusText = `正在添加第 ${added} 个圆片`
      render()
      pulseCell(boardId, index)
      await sleep(360)
      if (token !== playToken) return
    }
    state.isPlaying = false
    state.statusText = `演示完成：${left} + ${added} = ${left + added}`
    render()
  }

  /**
   * 为十格阵页面一次性绑定按钮、输入与指针事件。
   */
  function bind() {
    if (bound) return
    bound = true

    $('tenframeTabRecognize')?.addEventListener('click', () => {
      if (state.isPlaying) return
      state.tab = 'recognize'
      render()
    })
    $('tenframeTabMath')?.addEventListener('click', () => {
      if (state.isPlaying) return
      state.tab = 'math'
      render()
    })

    $('tenframeRecognizeModeOne')?.addEventListener('click', () => setMode('one'))
    $('tenframeRecognizeModeTwo')?.addEventListener('click', () => setMode('two'))
    $('tenframeMathModeOne')?.addEventListener('click', () => setMode('one'))
    $('tenframeMathModeTwo')?.addEventListener('click', () => setMode('two'))

    $('tenframeFillSequential')?.addEventListener('click', () => {
      if (state.isPlaying) return
      applySetCount(getTotalCount(), { fillMode: 'sequential' })
      render()
    })
    $('tenframeFillRandom')?.addEventListener('click', () => {
      if (state.isPlaying) return
      applySetCount(getTotalCount(), { fillMode: 'random' })
      render()
    })
    $('tenframeColorUniform')?.addEventListener('click', () => {
      if (state.isPlaying) return
      applySetCount(getTotalCount(), { colorMode: 'uniform' })
      render()
    })
    $('tenframeColorRandom')?.addEventListener('click', () => {
      if (state.isPlaying) return
      applySetCount(getTotalCount(), { colorMode: 'random' })
      render()
    })

    $('tenframeCountRange')?.addEventListener('input', (event) => {
      if (state.isPlaying) return
      applySetCount(event.target.value)
      render()
    })
    $('tenframeRandomCount')?.addEventListener('click', () => {
      if (state.isPlaying) return
      const randomValue = Math.floor(Math.random() * MAX_COUNT) + 1
      applySetCount(randomValue)
      state.statusText = `已生成随机数量 ${randomValue}。`
      render()
    })

    $('tenframeManualBlue')?.addEventListener('click', () => {
      if (state.isPlaying) return
      state.manualColor = 'blue'
      render()
    })
    $('tenframeManualRed')?.addEventListener('click', () => {
      if (state.isPlaying) return
      state.manualColor = 'red'
      render()
    })

    $('tenframeLeftOperand')?.addEventListener('input', (event) => {
      if (state.isPlaying) return
      state.leftOperand = clampInt(event.target.value, 0, MAX_COUNT, 0)
      normalizeOperands()
      render()
    })
    $('tenframeRightOperand')?.addEventListener('input', (event) => {
      if (state.isPlaying) return
      state.rightOperand = clampInt(event.target.value, 0, MAX_COUNT, 0)
      normalizeOperands()
      render()
    })
    $('tenframeOperationToggle')?.addEventListener('click', () => {
      if (state.isPlaying) return
      state.operation = state.operation === '+' ? '-' : '+'
      normalizeOperands()
      render()
    })
    $('tenframeStartDemo')?.addEventListener('click', startDemo)
    $('tenframeDemo8Add5')?.addEventListener('click', async () => {
      if (state.isPlaying) return
      state.tab = 'math'
      state.operation = '+'
      state.leftOperand = 8
      state.rightOperand = 5
      render()
      await startDemo()
    })
    $('tenframeDemo13Sub4')?.addEventListener('click', async () => {
      if (state.isPlaying) return
      state.tab = 'math'
      state.operation = '-'
      state.leftOperand = 13
      state.rightOperand = 4
      render()
      await startDemo()
    })

    $('tenframeBoardStage')?.addEventListener('pointerdown', handleCellPointerDown)
  }

  /**
   * 在页面重新进入或首次加载时同步渲染十格阵页面。
   */
  function sync() {
    if (!$('tenframeBoardLeft')) return
    bind()
    render()
    lucide.createIcons()
  }

  /**
   * 初始化十格阵默认盘面与状态文案。
   */
  function init() {
    if (!$('tenframeBoardLeft')) return
    bind()
    state.tab = 'recognize'
    state.mode = 'one'
    state.fillMode = 'sequential'
    state.colorMode = 'uniform'
    state.manualColor = 'blue'
    state.leftOperand = 8
    state.rightOperand = 5
    state.operation = '+'
    state.statusText = '待开始'
    applySetCount(8)
    render()
    lucide.createIcons()
  }

  return { init, sync, startDemo }
})()

function switchState(pageId, state) {
  const pid = normalizePageId(pageId);
  const page = document.getElementById(`page-${pid}`);
  if (!page) return;
  page.querySelectorAll(`[id^="page-${pid}-"]`).forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(`page-${pid}-${state}`);
  if (target) target.classList.remove('hidden');
}

/**
 * 显示滑块验证码弹窗，并重置滑块状态
 */
function showVerificationModal() {
  const modal = document.getElementById('verificationModal');
  if (!modal) return;
  modal.classList.add('active');

  const handle = document.getElementById('sliderHandle');
  const fill = document.getElementById('sliderFill');
  const status = document.getElementById('sliderStatus');
  if (handle) handle.style.left = '4px';
  if (fill) fill.style.width = '0%';
  if (status) status.innerHTML = '向右滑动完成验证';

  initSlider();
}

/**
 * 关闭滑块验证码弹窗
 */
function closeVerificationModal() {
  const modal = document.getElementById('verificationModal');
  if (!modal) return;
  modal.classList.remove('active');
}

let isSliderInitialized = false;

/**
 * 初始化滑块验证码组件，绑定拖拽事件，并在验证成功后触发登录流程
 */
function initSlider() {
  if (isSliderInitialized) return;
  
  const slider = document.querySelector('.slider-track');
  const handle = document.getElementById('sliderHandle');
  const fill = document.getElementById('sliderFill');
  const status = document.getElementById('sliderStatus');
  if (!slider || !handle || !fill || !status) return;
  
  isSliderInitialized = true;
  let isDragging = false;
  let startX;
  
  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - handle.offsetLeft;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let sliderWidth = slider.offsetWidth - handle.offsetWidth;
    let x = e.clientX - startX;
    x = Math.max(0, Math.min(x, sliderWidth));
    handle.style.left = x + 'px';
    fill.style.width = (x / sliderWidth * 100) + '%';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    let sliderWidth = slider.offsetWidth - handle.offsetWidth;
    const x = parseInt(handle.style.left) || 0;
    if (x >= sliderWidth * 0.9) {
      handle.style.left = sliderWidth + 'px';
      fill.style.width = '100%';
      status.innerHTML = '<span class="text-green-500">验证成功！</span>';
      setTimeout(() => {
        closeVerificationModal();
        switchState(1, 'loading');
        processLogin();
      }, 500);
    } else {
      handle.style.left = '4px';
      fill.style.width = '0%';
    }
  });
}

function handleLoginClick() {
  const phone = document.getElementById('phoneInput')?.value?.trim() || '';
  const password = document.getElementById('passwordInput')?.value?.trim() || '';

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    alert('请输入有效的11位手机号码');
    return;
  }
  if (password.length < 6) {
    alert('密码长度不能少于6位');
    return;
  }

  showVerificationModal();
}

/**
 * 向后端发送实际的登录请求
 * @param {string} phone 手机号
 * @param {string} password 密码
 * @returns {Promise} 返回包含登录凭证和过期时间的 Promise
 */
function realBackendLogin(phone, password) {
  const formData = new URLSearchParams();
  formData.append('username', phone);
  formData.append('password', password);

  return fetch('http://localhost:8000/api/v1/login/access-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(errData => {
        throw new Error(errData.detail || '账号或密码错误');
      });
    }
    return response.json();
  })
  .then(data => {
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: data.access_token,
        expiresIn: 30 * 24 * 60 * 60 * 1000
      }
    };
  });
}

/**
 * 处理完整的登录流程，调用真实后端接口并保存 token
 */
function processLogin() {
  const phoneEl = document.getElementById('phoneInput');
  const passwordEl = document.getElementById('passwordInput');
  const phone = phoneEl ? phoneEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value.trim() : '';

  realBackendLogin(phone, password)
    .then(res => {
      if (res.code === 200) {
        localStorage.setItem('mathui_token', res.data.token);
        console.log('Token stored:', res.data.token);
        goToPage(2);
      }
    })
    .catch(err => {
      alert(err.message);
      switchState(1, 'normal');
    });
}

function resetLoginFlow() {
  const phone = document.getElementById('phoneInput');
  const password = document.getElementById('passwordInput');
  if (phone) phone.value = '';
  if (password) password.value = '';
}

function inputAnswer(num) {
  currentAnswer += num;
  document.getElementById('answerDisplay').textContent = currentAnswer;
}

function deleteAnswer() {
  currentAnswer = currentAnswer.slice(0, -1);
  document.getElementById('answerDisplay').textContent = currentAnswer;
}

function setAnswer(val) {
  currentAnswer = val;
  document.getElementById('answerDisplay').textContent = currentAnswer;
}

function submitAnswer() {
  if (currentAnswer === '5') {
    alert('回答正确！🎉');
  } else {
    alert('回答错误，请再试一次！');
  }
}

function inputAnswer2(num) {
  currentAnswer2 += num;
  document.getElementById('answerDisplay2').textContent = currentAnswer2;
}

function deleteAnswer2() {
  currentAnswer2 = currentAnswer2.slice(0, -1);
  document.getElementById('answerDisplay2').textContent = currentAnswer2;
}

function submitAnswer2() {
  if (currentAnswer2 === '15') {
    alert('回答正确！🎉');
  } else {
    alert('回答错误，正确答案是15');
  }
}

function inputAnswer3(num) {
  currentAnswer3 += num;
  document.getElementById('answerDisplay3').textContent = currentAnswer3;
}

function deleteAnswer3() {
  currentAnswer3 = currentAnswer3.slice(0, -1);
  document.getElementById('answerDisplay3').textContent = currentAnswer3;
}

function submitAnswer3() {
  if (currentAnswer3 === '16') {
    alert('回答正确！🎉 题目已从错题本移除');
    goToPage(10);
  } else {
    alert('回答错误，请再想想');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  sidebarUserCollapsed = false;
  const pid = getCurrentPageId();
  ensureSidebar();
  setSidebarEnabled(pid !== 1);
  if (pid === 1) resetLoginFlow();
  if (pid) updateSidebarNav(pid);
  lucide.createIcons();
  if (pid === 13 && window.stickTool) window.stickTool.init();
  if (pid === 14 && window.counterTool) window.counterTool.init();
  if (pid === 15 && window.decomposeTool) window.decomposeTool.init();
  if (pid === 16 && window.numberLineTool) window.numberLineTool.init();
  if (pid === 17 && window.cube10Tool) window.cube10Tool.init();
  if (pid === 18 && window.bananaTool) window.bananaTool.init();
  if (pid === 19 && window.tenFrameTool) window.tenFrameTool.init();
});
