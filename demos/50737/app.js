// ============================================
// 中国经典可视化学习引擎 - 交互逻辑（完整版）
// 包含全部 P0/P1/P2 功能：3D翻页、古道路径、每日一句、金句流、
// 未来自己、印章成就、搜索、收藏
// ============================================

// --- 状态管理 ---
let currentPath = 'all';
let currentCardIndex = 0;
let filteredCards = [...cards];

// --- 用户数据（localStorage 持久化）---
let favorites = new Set();
let notes = {};        // { cardId: [{text, date}] }
let viewedCards = new Set();
let lastDailyDate = null;

// --- 触摸手势 ---
let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 60;

// --- 3D 翻转动画状态 ---
let isFlipping = false;

// --- SVG 图标定义（中国风统一风格）---
const pathIcons = {
  book: '<svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="6" width="28" height="36" rx="3"/><path d="M16 14h12M16 22h12M16 30h6"/><circle cx="34" cy="40" r="5"/></svg>',
  eye: '<svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 24s8-12 20-12 20 12 20 12-8 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="6"/><path d="M24 18v-4M24 30v4"/></svg>',
  leaf: '<svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 40C8 20 20 8 40 8c0 20-12 32-32 32z"/><path d="M8 40C18 30 28 20 40 8"/><path d="M16 32c4-4 8-8 12-12" stroke-linecap="round"/></svg>',
  diamond: '<svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M24 4L40 20 24 44 8 20z"/><path d="M8 20h32"/><path d="M24 4l16 16M24 4L8 20"/></svg>'
};

// ============================================
// localStorage 工具
// ============================================
const STORAGE_KEY = 'classics_ai_data';

function loadUserData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.favorites) favorites = new Set(data.favorites);
      if (data.notes) notes = data.notes;
      if (data.viewedCards) viewedCards = new Set(data.viewedCards);
      if (data.lastDailyDate) lastDailyDate = data.lastDailyDate;
    }
  } catch (e) {
    console.warn('无法加载用户数据', e);
  }
}

function saveUserData() {
  try {
    const data = {
      favorites: Array.from(favorites),
      notes: notes,
      viewedCards: Array.from(viewedCards),
      lastDailyDate: lastDailyDate
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('无法保存用户数据', e);
  }
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  renderPathsRoad();
  filterByPath('all');
  initTouchGesture();
  renderGoldenQuotes();
  renderFavorites();

  // 滚动动画观察器
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in, .fade-in-left').forEach(el => {
    observer.observe(el);
  });

  // 检查是否已访问过（跳过开场）
  if (sessionStorage.getItem('intro-skipped')) {
    document.getElementById('intro-overlay').classList.add('hidden');
  }

  // 分享模态框点击遮罩关闭
  const shareModal = document.getElementById('share-modal');
  if (shareModal) {
    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) closeShareModal();
    });
  }

  // 每日一句模态框点击遮罩关闭
  const dailyModal = document.getElementById('daily-modal-overlay');
  if (dailyModal) {
    dailyModal.addEventListener('click', (e) => {
      if (e.target === dailyModal) closeDailyQuote();
    });
  }
});

// ============================================
// 开场过渡
// ============================================
function enterSite() {
  const overlay = document.getElementById('intro-overlay');
  overlay.classList.add('hidden');
  sessionStorage.setItem('intro-skipped', '1');
}

function skipIntro() {
  enterSite();
}

// ============================================
// P0-2: 学习路径 - 四条古道视觉化
// ============================================
function renderPathsRoad() {
  const container = document.getElementById('paths-road');
  if (!container) return;
  container.innerHTML = paths.map((p, i) => {
    const count = p.id === 'all' ? cards.length : cards.filter(c => c.path_tags.includes(p.id)).length;
    const iconSvg = pathIcons[p.icon] || pathIcons.book;
    const arrowSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return `
      <div class="road-path ${p.id === currentPath ? 'active' : ''}" 
           onclick="filterByPath('${p.id}')" data-path="${p.id}">
        <div class="road-stone">
          <div class="road-icon">${iconSvg}</div>
        </div>
        <div class="road-name">${p.name}</div>
        <div class="road-count">${count} 句精选</div>
        <div class="road-arrow">${arrowSvg}</div>
      </div>
    `;
  }).join('');
}

function filterByPath(pathId) {
  currentPath = pathId;

  if (pathId === 'all') {
    filteredCards = [...cards];
  } else {
    filteredCards = cards.filter(c => c.path_tags.includes(pathId));
  }

  // 更新路径高亮
  document.querySelectorAll('.road-path').forEach(el => {
    el.classList.toggle('active', el.dataset.path === pathId);
  });

  // 更新描述
  const descEl = document.getElementById('cards-section-desc');
  if (descEl) {
    if (pathId === 'all') {
      descEl.textContent = '12 句最适合现代人理解的《道德经》精华';
    } else {
      const group = groups.find(g => g.id === pathId);
      descEl.textContent = group ? group.subtitle : '';
    }
  }

  // 重置到第一张
  currentCardIndex = 0;
  renderCard(false);
}

// ============================================
// P0-1: 卡片 3D 翻页动效 + 基础渲染
// ============================================
function renderCard(animate = true, direction = 'next') {
  const card = filteredCards[currentCardIndex];
  if (!card) return;

  const cardEl = document.getElementById('learning-card');
  if (!cardEl) return;

  // 标记已阅
  markCardAsViewed(card.id);

  // 更新印章进度
  renderSeals();

  // 更新收藏按钮状态
  updateFavoriteBtn();

  // 加载该卡片的笔记
  loadNotes(card.id);

  if (!animate || isFlipping) {
    updateCardContent(card);
    updateNavState();
    return;
  }

  isFlipping = true;

  // 3D 翻转出去
  const flipOutClass = direction === 'next' ? 'flip-out-left' : 'flip-out-right';
  cardEl.classList.add(flipOutClass);

  // 水墨扩散效果
  const ink = document.getElementById('ink-transition');
  if (ink) {
    ink.classList.add('active');
    setTimeout(() => ink.classList.remove('active'), 600);
  }

  setTimeout(() => {
    // 更新内容
    updateCardContent(card);
    updateNavState();

    // 移除 flip-out，添加 flip-in
    cardEl.classList.remove(flipOutClass);
    const flipInClass = direction === 'next' ? 'flip-in-right' : 'flip-in-left';
    cardEl.classList.add(flipInClass);

    setTimeout(() => {
      cardEl.classList.remove(flipInClass);
      isFlipping = false;
    }, 500);
  }, 450);
}

function updateCardContent(card) {
  // 计数器
  const counterEl = document.getElementById('card-counter');
  if (counterEl) {
    counterEl.innerHTML = `<span class="current-num">${currentCardIndex + 1}</span> / ${filteredCards.length}`;
  }

  // 图片
  const imgEl = document.getElementById('card-image');
  if (imgEl) {
    imgEl.src = card.image_url;
    imgEl.alt = card.title;
  }

  // 章节
  const chapterEl = document.getElementById('card-chapter');
  if (chapterEl) chapterEl.textContent = `${card.chapter} · ${card.group}`;

  // 原文
  const originalEl = document.getElementById('card-original');
  if (originalEl) originalEl.textContent = card.original_text;

  // 断句
  const segmentedEl = document.getElementById('card-segmented');
  if (segmentedEl) segmentedEl.innerHTML = card.segmented_text.replace(/\//g, '<br>');

  // 白话
  const plainEl = document.getElementById('layer-plain');
  if (plainEl) plainEl.textContent = card.plain_text;

  // 现代场景
  const sceneEl = document.getElementById('layer-scene');
  if (sceneEl) {
    const textEl = sceneEl.querySelector('.scene-text');
    if (textEl) textEl.textContent = card.modern_scene;
  }

  // 背景提示
  const bgEl = document.getElementById('layer-background');
  if (bgEl) {
    const textEl = bgEl.querySelector('.insight-text');
    if (textEl) textEl.textContent = card.background_note;
  }

  // 误读提醒
  const misEl = document.getElementById('layer-mis');
  if (misEl) {
    const textEl = misEl.querySelector('.mis-text');
    if (textEl) textEl.textContent = card.misunderstanding_note;
  }

  // 反思题
  const refEl = document.getElementById('layer-ref');
  if (refEl) {
    const textEl = refEl.querySelector('.ref-text');
    if (textEl) textEl.textContent = card.reflection_question;
  }

  // 顿悟时刻
  const ahaEl = document.getElementById('aha-text');
  if (ahaEl) ahaEl.textContent = card.aha_moment;
}

function updateNavState() {
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  if (prevBtn) prevBtn.disabled = currentCardIndex === 0;
  if (nextBtn) nextBtn.disabled = currentCardIndex === filteredCards.length - 1;
}

// ============================================
// P1-6: 印章成就系统
// ============================================
function markCardAsViewed(cardId) {
  if (!viewedCards.has(cardId)) {
    viewedCards.add(cardId);
    saveUserData();
  }
}

function renderSeals() {
  const container = document.getElementById('seal-progress');
  if (!container) return;

  // 基于当前筛选的卡片渲染印章
  container.innerHTML = filteredCards.map((card, i) => {
    const isSealed = viewedCards.has(card.id);
    const sealText = isSealed ? '阅' : (i + 1);
    return `
      <div class="seal-item ${isSealed ? 'sealed' : ''}" 
           onclick="goToCard(${i})" title="${card.title}">
        ${sealText}
      </div>
    `;
  }).join('');

  // 检查是否全部集齐
  const allViewed = filteredCards.every(c => viewedCards.has(c.id));
  const banner = document.getElementById('seal-complete-banner');
  if (banner) {
    banner.classList.toggle('visible', allViewed && filteredCards.length > 0);
  }
}

function goToCard(index) {
  if (index >= 0 && index < filteredCards.length && !isFlipping) {
    const direction = index > currentCardIndex ? 'next' : 'prev';
    currentCardIndex = index;
    renderCard(true, direction);
  }
}

// ============================================
// 卡片导航
// ============================================
function nextCard() {
  if (currentCardIndex < filteredCards.length - 1 && !isFlipping) {
    currentCardIndex++;
    renderCard(true, 'next');
  }
}

function prevCard() {
  if (currentCardIndex > 0 && !isFlipping) {
    currentCardIndex--;
    renderCard(true, 'prev');
  }
}

function randomCard() {
  if (isFlipping) return;

  if (currentPath === 'all') {
    filteredCards = [...cards];
  }

  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * filteredCards.length);
  } while (newIndex === currentCardIndex && filteredCards.length > 1);

  const direction = newIndex > currentCardIndex ? 'next' : 'prev';
  currentCardIndex = newIndex;

  // 旋转动画
  const btn = document.getElementById('btn-random');
  if (btn) {
    btn.classList.add('spin');
    setTimeout(() => btn.classList.remove('spin'), 500);
  }

  renderCard(true, direction);
}

function scrollToCards() {
  const section = document.getElementById('cards-section');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// 触摸手势支持
// ============================================
function initTouchGesture() {
  const cardEl = document.getElementById('learning-card');
  if (!cardEl) return;

  cardEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  cardEl.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
}

function handleSwipe() {
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > SWIPE_THRESHOLD) {
    if (diff > 0) {
      nextCard();
    } else {
      prevCard();
    }
  }
}

// ============================================
// P0-3: 每日一句浮窗
// ============================================
function getDailyQuote() {
  const today = new Date().toDateString();
  // 使用日期作为种子生成固定索引
  const dateNum = new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate();
  const index = dateNum % cards.length;
  return { card: cards[index], date: today };
}

function openDailyQuote() {
  const { card, date } = getDailyQuote();

  const badge = document.getElementById('daily-badge');
  const original = document.getElementById('daily-original');
  const plain = document.getElementById('daily-plain');
  const aha = document.getElementById('daily-aha');

  if (badge) badge.textContent = '今日精选 · ' + date;
  if (original) original.textContent = card.original_text;
  if (plain) plain.textContent = card.plain_text;
  if (aha) aha.textContent = card.aha_moment;

  const overlay = document.getElementById('daily-modal-overlay');
  if (overlay) {
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  lastDailyDate = date;
  saveUserData();
}

function closeDailyQuote() {
  const overlay = document.getElementById('daily-modal-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }
}

// ============================================
// P1-4: 金句模式信息流
// ============================================
function renderGoldenQuotes() {
  const container = document.getElementById('gq-container');
  if (!container) return;

  container.innerHTML = cards.map(card => `
    <div class="gq-card fade-in">
      <div class="gq-tag">${card.group}</div>
      <div class="gq-mis">${card.misunderstanding_note}</div>
      <div class="gq-aha">${card.aha_moment}</div>
    </div>
  `).join('');

  // 为新增卡片也添加滚动动画观察
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  container.querySelectorAll('.gq-card').forEach(el => observer.observe(el));
}

// ============================================
// P1-5: 给未来的自己
// ============================================
function saveNote() {
  const card = filteredCards[currentCardIndex];
  if (!card) return;

  const input = document.getElementById('future-self-input');
  if (!input) return;

  const text = input.value.trim();
  if (!text) {
    alert('请先写下你的感悟');
    return;
  }

  if (!notes[card.id]) notes[card.id] = [];
  notes[card.id].unshift({
    text: text,
    date: new Date().toLocaleString('zh-CN')
  });

  saveUserData();
  input.value = '';
  loadNotes(card.id);
}

function loadNotes(cardId) {
  const container = document.getElementById('saved-notes');
  if (!container) return;

  const cardNotes = notes[cardId] || [];
  if (cardNotes.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = cardNotes.map((note, i) => `
    <div class="saved-note-item">
      <button class="note-delete" onclick="deleteNote('${cardId}', ${i})" title="删除">&#x2715;</button>
      <div class="note-text">${escapeHtml(note.text)}</div>
      <div class="note-meta">${note.date}</div>
    </div>
  `).join('');
}

function deleteNote(cardId, index) {
  if (notes[cardId]) {
    notes[cardId].splice(index, 1);
    if (notes[cardId].length === 0) delete notes[cardId];
    saveUserData();
    loadNotes(cardId);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// P2-7: 搜索功能
// ============================================
function handleSearch(query) {
  const clearBtn = document.getElementById('search-clear');
  const resultsCount = document.getElementById('search-results-count');

  if (clearBtn) clearBtn.classList.toggle('visible', query.length > 0);

  if (!query.trim()) {
    if (resultsCount) resultsCount.textContent = '';
    // 恢复当前路径筛选
    filterByPath(currentPath);
    return;
  }

  const q = query.toLowerCase();
  const results = cards.filter(c =>
    c.original_text.toLowerCase().includes(q) ||
    c.plain_text.toLowerCase().includes(q) ||
    c.aha_moment.toLowerCase().includes(q) ||
    c.misunderstanding_note.toLowerCase().includes(q) ||
    c.title.toLowerCase().includes(q)
  );

  if (resultsCount) {
    resultsCount.textContent = `找到 ${results.length} 条结果`;
  }

  // 切换到搜索结果
  filteredCards = results;
  currentCardIndex = 0;

  // 更新计数器和内容（不带动画）
  updateCardContent(filteredCards[0]);
  updateNavState();
  renderSeals();
  updateFavoriteBtn();
  if (filteredCards[0]) loadNotes(filteredCards[0].id);

  // 路径高亮重置
  document.querySelectorAll('.road-path').forEach(el => el.classList.remove('active'));
}

function clearSearch() {
  const input = document.getElementById('search-input');
  if (input) {
    input.value = '';
    handleSearch('');
  }
}

// ============================================
// P2-8: 收藏/标记
// ============================================
function toggleFavorite() {
  const card = filteredCards[currentCardIndex];
  if (!card) return;

  if (favorites.has(card.id)) {
    favorites.delete(card.id);
  } else {
    favorites.add(card.id);
  }

  saveUserData();
  updateFavoriteBtn();
  renderFavorites();
}

function updateFavoriteBtn() {
  const btn = document.getElementById('card-favorite-btn');
  const card = filteredCards[currentCardIndex];
  if (!btn || !card) return;

  btn.classList.toggle('favorited', favorites.has(card.id));
}

function renderFavorites() {
  const grid = document.getElementById('favorites-grid');
  const empty = document.getElementById('favorites-empty');
  if (!grid) return;

  const favCards = cards.filter(c => favorites.has(c.id));

  if (favCards.length === 0) {
    grid.innerHTML = empty ? empty.outerHTML : '';
    return;
  }

  grid.innerHTML = favCards.map(card => `
    <div class="favorite-mini-card" onclick="jumpToCard('${card.id}')">
      <div class="fm-original">${card.original_text}</div>
      <div class="fm-aha">${card.aha_moment}</div>
    </div>
  `).join('');
}

function jumpToCard(cardId) {
  // 找到卡片在所有卡片中的位置
  const allIndex = cards.findIndex(c => c.id === cardId);
  if (allIndex === -1) return;

  // 切换到全部路径
  filterByPath('all');
  currentCardIndex = allIndex;

  // 滚动到卡片区
  const section = document.getElementById('cards-section');
  if (section) section.scrollIntoView({ behavior: 'smooth' });

  renderCard(false);
}

// ============================================
// 分享功能
// ============================================
function openShareModal() {
  const card = filteredCards[currentCardIndex];
  if (!card) return;

  const original = document.getElementById('share-original');
  const plain = document.getElementById('share-plain');
  const aha = document.getElementById('share-aha');

  if (original) original.textContent = card.original_text;
  if (plain) plain.textContent = card.plain_text;
  if (aha) aha.textContent = card.aha_moment;

  const modal = document.getElementById('share-modal');
  if (modal) {
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
}

function closeShareModal() {
  const modal = document.getElementById('share-modal');
  if (modal) {
    modal.classList.remove('visible');
    document.body.style.overflow = '';
  }
}

// 下载分享图
function downloadShareImage() {
  const card = filteredCards[currentCardIndex];
  if (!card) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const w = 1080;
  const h = 1920;
  canvas.width = w;
  canvas.height = h;

  // 宣纸色背景
  ctx.fillStyle = '#F5F0E8';
  ctx.fillRect(0, 0, w, h);

  // 顶部装饰
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(80, 120, 60, 3);

  // 品牌标签
  ctx.fillStyle = '#5D3A1A';
  ctx.font = '26px "STKaiti", "KaiTi", serif';
  ctx.textAlign = 'left';
  ctx.fillText('经典可见 · 道德经', 80, 180);

  // 章节信息
  ctx.fillStyle = 'rgba(93,58,26,0.5)';
  ctx.font = '22px sans-serif';
  ctx.fillText(card.chapter + ' · ' + card.group, 80, 240);

  // 分隔线
  ctx.fillStyle = 'rgba(139,69,19,0.2)';
  ctx.fillRect(80, 280, w - 160, 1);

  // 原文（大字书法风）
  ctx.fillStyle = '#2C1810';
  ctx.font = '48px "STKaiti", "KaiTi", "Kaiti SC", serif';
  ctx.textAlign = 'center';
  wrapText(ctx, card.original_text, w / 2, 400, w - 200, 78);

  // 白话翻译
  const plainY = getWrappedTextHeight(ctx, card.plain_text, w - 200, 30) + 480;
  ctx.fillStyle = 'rgba(44,24,16,0.65)';
  ctx.font = '30px sans-serif';
  wrapText(ctx, card.plain_text, w / 2, plainY, w - 200, 50);

  // 顿悟时刻
  const ahaY = Math.max(plainY + 180, h - 500);
  ctx.fillStyle = 'rgba(139,69,19,0.2)';
  ctx.fillRect(80, ahaY, w - 160, 1);

  ctx.fillStyle = '#8B4513';
  ctx.font = '22px "STKaiti", "KaiTi", serif';
  ctx.textAlign = 'center';
  ctx.fillText('顿悟时刻', w / 2, ahaY + 60);

  ctx.fillStyle = '#2C1810';
  ctx.font = '36px sans-serif';
  wrapText(ctx, card.aha_moment, w / 2, ahaY + 120, w - 200, 58);

  // 底部品牌
  ctx.fillStyle = 'rgba(93,58,26,0.35)';
  ctx.font = '18px sans-serif';
  ctx.fillText('经典可见 · 中国经典可视化学习引擎', w / 2, h - 80);

  // 下载
  const link = document.createElement('a');
  link.download = '经典可见_' + card.title + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Canvas 文字换行工具
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('');
  let line = '';
  let currentY = y;

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = chars[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY;
}

function getWrappedTextHeight(ctx, text, maxWidth, fontSize) {
  ctx.font = fontSize + 'px sans-serif';
  const chars = text.split('');
  let line = '';
  let lines = 1;

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      lines++;
      line = chars[i];
    } else {
      line = testLine;
    }
  }
  return lines * (fontSize * 1.5);
}

// ============================================
// 键盘快捷键
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeShareModal();
    closeDailyQuote();
  }
  if (e.key === 'ArrowLeft') prevCard();
  if (e.key === 'ArrowRight') nextCard();
  if (e.key === 'r' || e.key === 'R') randomCard();
  if (e.key === 's' || e.key === 'S') {
    const shareModal = document.getElementById('share-modal');
    if (shareModal && !shareModal.classList.contains('visible')) {
      e.preventDefault();
      openShareModal();
    }
  }
});
