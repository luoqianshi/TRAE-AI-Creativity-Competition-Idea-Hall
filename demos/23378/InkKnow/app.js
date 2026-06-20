/* =========================================================
   墨水屏桌面系统 1.0 —— 前端逻辑
   - 轮播切换
   - 模拟后端数据结构（便于后续替换为 fetch）
   ========================================================= */

/* -------------------- 模拟后端数据 -------------------- */
const mockData = {
  // Screen 2 · 日程待办
  timeline: [
    { time: '09:00', text: '团队早会', current: false },
    { time: '10:30', text: '产品需求评审', current: true },
    { time: '14:00', text: '架构设计讨论', current: false },
    { time: '16:00', text: '复盘本周重点', current: false }
  ],
  todo: [
    { text: '确认服务器续费配置', done: true  },
    { text: '回复重要邮件',         done: false },
    { text: '预定下周出差机票',     done: false }
  ],

  // Screen 3 · 习惯打卡（近 14 天）
  habits: [
    { name: '阅读',     days: [1,1,1,1,0,1,1,1,1,0,1,1,1,1] },
    { name: '运动',     days: [0,1,1,0,1,1,1,0,1,1,1,0,1,1] },
    { name: '深度工作', days: [1,1,1,1,1,1,0,1,1,1,1,1,1,1] }
  ]
};

/* -------------------- 渲染 Screen 2 · 日程 -------------------- */
function renderTimeline() {
  const box = document.getElementById('timeline');
  if (!box) return;
  box.innerHTML = mockData.timeline.map(item => `
    <div class="s2__t-row ${item.current ? 'is-current' : ''}">
      <span class="s2__t-time">${item.time}</span>
      <span class="s2__t-text">${item.text}</span>
      ${item.current ? `
        <svg class="s2__t-arrow" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l8 6-8 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>` : ''}
    </div>
  `).join('');
}

/* -------------------- 渲染 Screen 2 · 待办 -------------------- */
function renderTodo() {
  const box = document.getElementById('todoList');
  if (!box) return;
  box.innerHTML = mockData.todo.map(item => `
    <li class="${item.done ? 'is-done' : ''}">
      <span class="s2__todo-box">${item.done ? '✓' : ''}</span>
      <span class="s2__todo-text">${item.text}</span>
    </li>
  `).join('');
}

/* -------------------- 渲染 Screen 3 · 习惯打卡 -------------------- */
function renderHabits() {
  const rows = document.querySelectorAll('.s3__habit-row');
  rows.forEach((row, idx) => {
    const data = mockData.habits[idx];
    if (!data) return;
    const grid = row.querySelector('.s3__habit-grid');
    grid.innerHTML = data.days.map(v =>
      `<span class="s3__habit-cell ${v ? 'is-done' : 'is-pending'}"></span>`
    ).join('');
  });
}

/* -------------------- 渲染 Screen 4 · 相框装饰元素 -------------------- */
function renderPhoto() {
  const box = document.getElementById('photo');
  if (!box) return;
  box.innerHTML = `
    <div class="s4__sun"></div>
    <div class="s4__mountain"></div>
    <div class="s4__mountain s4__mountain--mid"></div>
    <div class="s4__mountain s4__mountain--front"></div>
  `;
}

/* -------------------- 轮播控制 -------------------- */
let currentPage = 0;
const totalPages = 4;
let autoplayTimer = null;

function goToPage(index) {
  currentPage = (index + totalPages) % totalPages;

  // 屏幕切换
  document.querySelectorAll('.screen').forEach((el, i) => {
    el.classList.toggle('is-active', i === currentPage);
  });

  // 分页指示器
  document.querySelectorAll('.pager__btn').forEach((btn, i) => {
    btn.classList.toggle('is-active', i === currentPage);
  });
}

function startAutoplay(intervalMs = 6000) {
  stopAutoplay();
  autoplayTimer = setInterval(() => goToPage(currentPage + 1), intervalMs);
}
function stopAutoplay() {
  if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
}

/* -------------------- 绑定交互 -------------------- */
function bindPager() {
  document.querySelectorAll('.pager__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.page, 10);
      goToPage(idx);
      // 手动点击后重置自动轮播
      startAutoplay();
    });
  });

  // 键盘左右切换
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { goToPage(currentPage + 1); startAutoplay(); }
    if (e.key === 'ArrowLeft')  { goToPage(currentPage - 1); startAutoplay(); }
  });

  // 鼠标悬停暂停（可选，便于调试）
  const device = document.getElementById('device');
  if (device) {
    device.addEventListener('mouseenter', stopAutoplay);
    device.addEventListener('mouseleave', () => startAutoplay());
  }
}

/* -------------------- 启动 -------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderTimeline();
  renderTodo();
  renderHabits();
  renderPhoto();
  bindPager();
  goToPage(0);
  startAutoplay(6000);
});
