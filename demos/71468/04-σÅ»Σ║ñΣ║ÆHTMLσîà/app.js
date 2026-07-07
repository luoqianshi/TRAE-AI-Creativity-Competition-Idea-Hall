// 人生邮记周刊 · 报名贴 Demo · 交互
// 5 屏切换：锁屏 / 拍摄 / AI 命名 / 本周邮册 / 周末寄出
// v2：邮册用 L8 PRIMARY 形式（img.stamp-photo + mask）

const PAGES = ['lockscreen','shoot','naming','album','send'];

const STAMP_DATA = [
  { src: 'img/IMG_5266大.jpeg', label: '清晨咖啡的影子' },
  { src: 'img/IMG_5300大.jpeg', label: '窗台上的多肉' },
  { src: 'img/IMG_5312大.jpeg', label: '地铁里的陌生面孔' },
  { src: 'img/IMG_5494大.jpeg', label: '几何的黄昏', featured: true },
  { src: 'img/IMG_5684大.jpeg', label: '黄昏的回家路' },
  { src: 'img/IMG_5266大.jpeg', label: '被风吹皱的湖面' },
  { src: 'img/IMG_5312大.jpeg', label: '深夜读到的那句诗' }
];

function show(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('is-active'));
  document.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('is-active'));
  const page = document.getElementById(pageId);
  if (!page) return;
  page.classList.add('is-active');
  const tab = document.querySelector(`.demo-tab[data-page="${pageId}"]`);
  if (tab) tab.classList.add('is-active');
  // 锁屏专用底部条：只在锁屏页显示
  const lockBar = document.getElementById('lockBottomBar');
  if (lockBar) {
    if (pageId === 'lockscreen') lockBar.classList.remove('is-hidden');
    else lockBar.classList.add('is-hidden');
  }
  // 滚到顶部
  const content = document.querySelector('.phone-content');
  if (content) content.scrollTop = 0;
}

// 顶部 Tab 切换
document.querySelectorAll('.demo-tab').forEach(t => {
  t.addEventListener('click', () => show(t.dataset.page));
});

// 任何带 data-page 的元素都可点
document.querySelectorAll('[data-page]').forEach(el => {
  if (el.classList.contains('demo-tab')) return; // 已绑
  el.addEventListener('click', () => show(el.dataset.page));
});

// 拍摄页 → 点圆快门 → 命名
document.getElementById('shutterBtn')?.addEventListener('click', () => show('naming'));

// 命名页 → 选候选
document.querySelectorAll('.name-cand').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.name-cand').forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
  });
});

// 命名页 → 完成拍摄 → 邮册
document.getElementById('goAlbum')?.addEventListener('click', () => show('album'));

// 邮册页 → 准备寄出 → 寄出
document.getElementById('goSend')?.addEventListener('click', () => show('send'));

// 寄出页 → 确认生成
document.getElementById('confirmSend')?.addEventListener('click', () => {
  document.getElementById('thanks').hidden = false;
});

// 邮册邮票注入（L8 PRIMARY 形式：img.stamp-photo + mask）
function renderAlbum() {
  const grid = document.getElementById('albumGrid');
  if (!grid) return;
  grid.innerHTML = '';
  STAMP_DATA.forEach(s => {
    const wrap = document.createElement('div');
    wrap.className = 'stamp-wrapper' + (s.featured ? ' is-featured' : '');
    const stampCls = s.featured ? 'stamp-perforated stamp-md stamp-perforated--featured' : 'stamp-perforated stamp-md';
    const labelCls = s.featured ? 'album-stamp__label is-featured' : 'album-stamp__label';
    wrap.innerHTML = `
      <div class="${stampCls}">
        <img class="stamp-photo" src="${s.src}" alt="${s.label}">
      </div>
      <div class="${labelCls}">${s.label}</div>
    `;
    grid.appendChild(wrap);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  renderAlbum();
});
