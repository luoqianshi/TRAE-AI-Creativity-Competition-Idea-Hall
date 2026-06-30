// ============================================
// 方案一 · 学习舱交互逻辑（v5）
// 24张卡片 + AI对话 + 语音 + 搜索 + 进度 + 复习 + 分享图片生成
// ============================================

// --- 状态 ---
let currentScope = 'all';
let currentTheme = null;
let currentCardIndex = 0;
let filteredCards = [...cards];
let isFlipping = false;
let activeTab = 'plain';

// --- 用户数据 ---
let favorites = new Set();
let notes = {};
let viewedCards = new Set();
let dailyAutoShow = true;
let completedGroups = new Set();

const STORAGE_KEY = 'classics_ai_v1';

// --- 分类定义 ---
const SCOPES = [
  { id: 'all', name: '全部课程', count: cards.length },
  { id: 'classic', name: '经典必读', count: 8 }
];

const THEMES = [
  { id: '颠覆认知', name: '认知篇', icon: 'eye' },
  { id: '生活智慧', name: '生活篇', icon: 'leaf' },
  { id: '入门基石', name: '入门篇', icon: 'book' }
];

const CLASSIC_IDS = ['a01','b01','c01','c04','a02','c03','a05','b05'];

// --- SVG 图标 ---
const icons = {
  book: '<svg width="18" height="18" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="6" width="28" height="36" rx="3"/><path d="M16 14h12M16 22h12M16 30h6"/></svg>',
  eye: '<svg width="18" height="18" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 24s8-12 20-12 20 12 20 12-8 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="6"/></svg>',
  leaf: '<svg width="18" height="18" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 40C8 20 20 8 40 8c0 20-12 32-32 32z"/><path d="M8 40C18 30 28 20 40 8"/></svg>'
};

// --- AI Mock 数据 ---
const aiMockQA = {
  'a01': [
    { q: '这句话和庄子的"得意忘言"有什么关系？', a: '老子的"道可道，非常道"和庄子的"得意忘言"都指向同一个核心：语言是工具，不是真相本身。庄子说"筌者所以在鱼，得鱼而忘筌"，捕鱼工具在捕到鱼后就可以放下了——语言也是如此，理解了道理，就不必执着于文字。' },
    { q: '为什么"名可名，非常名"？', a: '老子在这里区分了"名"（概念/标签）和"实"（事物本身）。当我们给一个东西命名时，其实是在做简化——把丰富的 reality 压缩成一个词。比如"爱"这个字，能涵盖多少种不同的情感？所以名字永远只是事物的影子，不是事物本身。' }
  ],
  'b01': [
    { q: '水真的"不争"吗？', a: '水其实也在"争"——它争的是最低的位置。但老子赞美的正是这种"向下的争"：水不争高处，而是争低处，所以它能容纳一切、滋养一切。这不是"不争"，而是"争的方式不同"。' },
    { q: ' "处众人之所恶"是不是太委屈自己了？', a: '老子说的不是"委屈"，而是"选择"。水可以选择流向任何地方，但它选择了最低处——因为那里是最能发挥作用的地方。这不是被迫，而是智慧。' }
  ],
  'c01': [
    { q: '"有无相生"是不是相对论？', a: '比相对论更基础。老子不是在说"观察角度不同"，而是在说"概念互相创造"。没有"无"的概念，"有"就不存在；没有"失败"的体验，"成功"也没有意义。它们不是两个东西，而是一个东西的两面。' }
  ]
};

const aiMockGeneral = [
  '这是一个非常深刻的问题。老子的智慧在于，他不直接给你答案，而是帮你破除对"答案"本身的执念。',
  '从现代心理学角度看，这句话揭示了人类认知的一个基本规律：我们理解的世界，永远是通过语言滤镜看到的世界。',
  '值得注意的是，老子不是在否定语言的价值，而是在提醒我们不要混淆"地图"和"领土"。',
  '两千多年后的今天，这句话在信息时代有了新含义：我们生活在海量文字和概念中，但真正的体验往往发生在语言到达之前。',
  '老子的辩证法告诉我们：看似对立的事物，往往是彼此存在的条件。没有黑夜，就没有白昼的概念。',
  '这个问题没有标准答案。老子的目的是让你"想"，而不是让你"记住"。思考的过程本身，就是学习。'
];

// ============================================
// localStorage
// ============================================
function loadUserData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.favorites) favorites = new Set(data.favorites);
      if (data.notes) notes = data.notes;
      if (data.viewedCards) viewedCards = new Set(data.viewedCards);
      if (typeof data.dailyAutoShow === 'boolean') dailyAutoShow = data.dailyAutoShow;
      if (data.completedGroups) completedGroups = new Set(data.completedGroups);
    }
  } catch (e) { console.warn('load data fail', e); }
}

function saveUserData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      favorites: Array.from(favorites),
      notes: notes,
      viewedCards: Array.from(viewedCards),
      dailyAutoShow: dailyAutoShow,
      completedGroups: Array.from(completedGroups)
    }));
  } catch (e) { console.warn('save data fail', e); }
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  initPanelState();
  renderDailyHero();
  renderScopeList();
  renderThemeList();
  applyFilter();
  renderCard(false);
  renderProgress();
  renderFavList();
  initTouch();
  initKeyboard();
});

// ============================================
// 面板开关（面板现在常驻显示，无需切换）
// ============================================
function initPanelState() {
  // 面板常驻显示，无需初始化
}

function togglePanel() {
  // 面板常驻显示，保留函数签名以避免其他调用报错
}

// ============================================
// 每日推荐
// ============================================
function getDailyCard() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return cards[seed % cards.length];
}

function renderDailyHero() {
  const inner = document.getElementById('daily-hero-inner');
  if (!inner) return;
  const card = getDailyCard();
  const sunIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-linecap="round"/></svg>`;
  if (dailyAutoShow) {
    inner.classList.remove('collapsed');
    inner.innerHTML = `<span class="daily-icon">${sunIcon}</span><span class="daily-tag">今日精选</span><span class="daily-preview">${card.original_text}</span>`;
  } else {
    inner.classList.add('collapsed');
    inner.innerHTML = `<span class="daily-icon">${sunIcon}</span><span class="daily-preview" style="color:rgba(247,244,239,0.35);">查看今日精选</span>`;
  }
}

function showDaily() {
  const card = getDailyCard();
  document.getElementById('daily-badge').textContent = '今日精选 · ' + new Date().toLocaleDateString('zh-CN');
  document.getElementById('daily-original').textContent = card.original_text;
  document.getElementById('daily-plain').textContent = card.plain_text;
  document.getElementById('daily-aha').textContent = card.aha_moment;
  const toggle = document.getElementById('daily-auto-toggle');
  if (toggle) toggle.checked = dailyAutoShow;
  document.getElementById('daily-overlay').classList.add('show');
}

function closeDaily() {
  document.getElementById('daily-overlay').classList.remove('show');
}

function toggleDailyAuto() {
  const toggle = document.getElementById('daily-auto-toggle');
  dailyAutoShow = toggle ? toggle.checked : true;
  saveUserData();
  renderDailyHero();
}

// ============================================
// 筛选逻辑
// ============================================
function applyFilter() {
  let result = [...cards];
  if (currentScope === 'classic') result = result.filter(c => CLASSIC_IDS.includes(c.id));
  if (currentTheme) result = result.filter(c => c.group === currentTheme);
  filteredCards = result;
  currentCardIndex = 0;
}

function switchScope(scopeId) {
  currentScope = scopeId;
  applyFilter();
  if (filteredCards.length === 0) { currentTheme = null; applyFilter(); }
  renderScopeList(); renderThemeList(); renderCard(true, 'next');
}

function switchTheme(themeId) {
  currentTheme = currentTheme === themeId ? null : themeId;
  applyFilter();
  renderScopeList(); renderThemeList(); renderCard(true, 'next');
}

// ============================================
// 渲染分类
// ============================================
function renderScopeList() {
  const container = document.getElementById('scope-list');
  if (!container) return;
  container.innerHTML = SCOPES.map(s => {
    const active = s.id === currentScope ? 'active' : '';
    return `<div class="scope-option ${active}" onclick="switchScope('${s.id}')"><span>${s.name}</span><span class="scope-count">${s.count}句</span></div>`;
  }).join('');
}

function renderThemeList() {
  const container = document.getElementById('theme-list');
  if (!container) return;
  const baseCards = currentScope === 'classic' ? cards.filter(c => CLASSIC_IDS.includes(c.id)) : [...cards];
  container.innerHTML = THEMES.map(t => {
    const count = baseCards.filter(c => c.group === t.id).length;
    const icon = icons[t.icon] || '';
    const active = currentTheme === t.id ? 'active' : '';
    return `<div class="theme-option ${active}" onclick="switchTheme('${t.id}')"><span style="display:flex;align-items:center;gap:8px;">${icon} ${t.name}</span><span class="theme-count">${count}句</span></div>`;
  }).join('');
}

// ============================================
// 卡片渲染
// ============================================
function renderCard(animate = true, direction = 'next') {
  const card = filteredCards[currentCardIndex];
  if (!card) return;
  const main = document.getElementById('cabin-main');
  if (!main) return;

  if (!viewedCards.has(card.id)) {
    viewedCards.add(card.id);
    saveUserData();
    renderProgress();
    checkGroupCompletion();
  }

  updateFavBtn();

  // 更新页面标题
  if (card) document.title = `经典可见 · ${card.title}`;

  if (!animate || isFlipping) {
    updateContent(card); updatePageIndicator(); updateNavBtns(); return;
  }

  isFlipping = true;
  const ink = document.getElementById('ink-transition');
  if (ink) { ink.classList.add('active'); setTimeout(() => ink.classList.remove('active'), 500); }
  const outClass = direction === 'next' ? 'flip-out-left' : 'flip-out-right';
  main.classList.add(outClass);

  setTimeout(() => {
    updateContent(card); updatePageIndicator(); updateNavBtns();
    main.classList.remove(outClass);
    const inClass = direction === 'next' ? 'flip-in-right' : 'flip-in-left';
    main.classList.add(inClass);
    setTimeout(() => { main.classList.remove(inClass); isFlipping = false; }, 450);
  }, 420);
}

function updateContent(card) {
  const img = document.getElementById('card-image');
  if (img) { img.src = card.image_url; img.alt = card.title; }
  const chapter = document.getElementById('card-chapter');
  if (chapter) chapter.textContent = `${card.chapter} · ${card.group}`;
  const original = document.getElementById('card-original');
  if (original) original.textContent = card.original_text;
  const segmented = document.getElementById('card-segmented');
  if (segmented) segmented.textContent = card.segmented_text.replace(/\//g, '');
  document.getElementById('text-plain').textContent = card.plain_text;
  document.getElementById('text-mis').textContent = card.misunderstanding_note;
  document.getElementById('text-bg').textContent = card.background_note;
  document.getElementById('text-reflect').textContent = card.reflection_question;
  const aha = document.getElementById('aha-text');
  if (aha) aha.textContent = card.aha_moment;
  toggleTab('plain', true);

  // 停止语音
  stopVoice();
}

function updateNavBtns() {
  const prev = document.getElementById('btn-prev-img');
  const next = document.getElementById('btn-next-img');
  if (prev) prev.disabled = currentCardIndex === 0;
  if (next) next.disabled = currentCardIndex >= filteredCards.length - 1;
}

function updatePageIndicator() {
  const current = document.getElementById('page-current');
  const total = document.getElementById('page-total');
  if (current) current.textContent = String(currentCardIndex + 1).padStart(2, '0');
  if (total) total.textContent = filteredCards.length;
}

// ============================================
// 学习进度
// ============================================
function renderProgress() {
  const fill = document.getElementById('progress-bar-fill');
  const text = document.getElementById('progress-text');
  if (!fill || !text) return;
  const pct = Math.round((viewedCards.size / cards.length) * 100);
  fill.style.width = pct + '%';
  text.textContent = `${viewedCards.size}/${cards.length}`;
}

function checkGroupCompletion() {
  THEMES.forEach(t => {
    if (completedGroups.has(t.id)) return;
    const groupCards = cards.filter(c => c.group === t.id);
    const allViewed = groupCards.every(c => viewedCards.has(c.id));
    if (allViewed) {
      completedGroups.add(t.id);
      saveUserData();
      showCompletionAnimation(t.name);
    }
  });
}

function showCompletionAnimation(themeName) {
  const overlay = document.getElementById('completion-overlay');
  const text = document.getElementById('completion-text');
  if (!overlay || !text) return;
  text.innerHTML = `「${themeName}」通关<br><span style="font-size:1rem;color:rgba(247,244,239,0.6);">已学完该主题全部内容</span>`;
  overlay.classList.add('show');
  setTimeout(() => overlay.classList.remove('show'), 3000);
}

// ============================================
// 标签折叠
// ============================================
function toggleTab(tabId, force = false) {
  activeTab = tabId;
  document.querySelectorAll('.fold-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.fold-content').forEach(content => {
    content.classList.toggle('show', content.id === 'content-' + tabId);
  });
}

// ============================================
// 导航
// ============================================
function nextCard() {
  if (currentCardIndex < filteredCards.length - 1 && !isFlipping) {
    currentCardIndex++; renderCard(true, 'next');
  }
}
function prevCard() {
  if (currentCardIndex > 0 && !isFlipping) {
    currentCardIndex--; renderCard(true, 'prev');
  }
}
function goToCard(index) {
  if (index >= 0 && index < filteredCards.length && !isFlipping && index !== currentCardIndex) {
    const dir = index > currentCardIndex ? 'next' : 'prev';
    currentCardIndex = index; renderCard(true, dir);
  }
}
function randomCard() {
  if (isFlipping) return;
  let idx;
  do { idx = Math.floor(Math.random() * filteredCards.length); }
  while (idx === currentCardIndex && filteredCards.length > 1);
  const dir = idx > currentCardIndex ? 'next' : 'prev';
  currentCardIndex = idx; renderCard(true, dir);
}

// ============================================
// 收藏
// ============================================
function toggleFav() {
  const card = filteredCards[currentCardIndex];
  if (!card) return;
  if (favorites.has(card.id)) favorites.delete(card.id); else favorites.add(card.id);
  saveUserData(); updateFavBtn(); renderFavList();
}
function updateFavBtn() {
  const btn = document.getElementById('fav-btn');
  const card = filteredCards[currentCardIndex];
  if (!btn || !card) return;
  const isFav = favorites.has(card.id);
  btn.classList.toggle('active', isFav);
  btn.style.color = isFav ? '#C23A30' : '';
}
function renderFavList() {
  const container = document.getElementById('panel-favs');
  if (!container) return;
  const favCards = cards.filter(c => favorites.has(c.id));
  if (favCards.length === 0) { container.innerHTML = '暂无收藏'; return; }
  container.innerHTML = favCards.map(c => `
    <div class="panel-fav-item" onclick="jumpToCardById('${c.id}')">
      <div style="font-weight:500;margin-bottom:2px;">${c.original_text.slice(0, 16)}…</div>
      <div style="font-size:0.75rem;color:rgba(247,244,239,0.4);">${c.chapter} · ${c.group}</div>
    </div>
  `).join('');
}
function jumpToCardById(id) {
  const idx = filteredCards.findIndex(c => c.id === id);
  if (idx >= 0) {
    goToCard(idx);
    if (window.innerWidth <= 1023) {
      const panel = document.getElementById('right-panel');
      if (panel && panel.classList.contains('open')) togglePanel();
    }
  } else {
    currentScope = 'all'; currentTheme = null;
    applyFilter(); renderScopeList(); renderThemeList();
    const newIdx = filteredCards.findIndex(c => c.id === id);
    if (newIdx >= 0) {
      currentCardIndex = newIdx; renderCard(true, 'next');
      if (window.innerWidth <= 1023) {
        const panel = document.getElementById('right-panel');
        if (panel && panel.classList.contains('open')) togglePanel();
      }
    }
  }
}

// ============================================
// 笔记
// ============================================
function openNote() {
  const overlay = document.getElementById('note-overlay');
  const input = document.getElementById('note-input');
  const mini = document.getElementById('saved-notes-mini');
  const card = filteredCards[currentCardIndex];
  if (!overlay || !card) return;
  input.value = '';
  const cardNotes = notes[card.id] || [];
  mini.innerHTML = cardNotes.map(n => `
    <div class="saved-note-mini"><div>${n.text}</div><div class="note-mini-meta">${n.date}</div></div>
  `).join('');
  overlay.classList.add('show');
}
function closeNote() {
  document.getElementById('note-overlay').classList.remove('show');
}
function saveNote() {
  const input = document.getElementById('note-input');
  const text = input.value.trim();
  if (!text) return;
  const card = filteredCards[currentCardIndex];
  if (!card) return;
  if (!notes[card.id]) notes[card.id] = [];
  notes[card.id].push({ text, date: new Date().toLocaleString('zh-CN') });
  saveUserData(); openNote();
}

// ============================================
// 分享（真正生成图片）
// ============================================
function openShare() {
  const card = filteredCards[currentCardIndex];
  if (!card) return;
  document.getElementById('share-original').textContent = card.original_text;
  document.getElementById('share-plain').textContent = card.plain_text;
  document.getElementById('share-aha').textContent = card.aha_moment;
  document.getElementById('share-overlay').classList.add('show');
}
function closeShare() {
  document.getElementById('share-overlay').classList.remove('show');
}
function downloadShareImage() {
  const preview = document.getElementById('share-preview');
  if (!preview) return;
  if (typeof html2canvas === 'undefined') {
    alert('图片生成库加载中，请稍后再试');
    return;
  }
  html2canvas(preview, { scale: 2, backgroundColor: null }).then(canvas => {
    const link = document.createElement('a');
    link.download = '经典可见_' + new Date().getTime() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(err => {
    console.error(err);
    alert('图片生成失败，请重试');
  });
}

// ============================================
// AI 对话（Mock）
// ============================================
let aiChatHistory = [];

function openAiChat() {
  const overlay = document.getElementById('ai-overlay');
  const body = document.getElementById('ai-chat-body');
  const card = filteredCards[currentCardIndex];
  if (!overlay || !card) return;

  aiChatHistory = [];
  body.innerHTML = '';

  // 预设欢迎语
  addAiMessage('bot', `你好！我是 AI 解读助手。当前学习的是「${card.title}」——"${card.original_text}"。你可以问我关于这句话的任何问题。`);

  // 加载该卡片的预设 QA
  const qa = aiMockQA[card.id];
  if (qa && qa.length > 0) {
    qa.forEach(item => {
      addAiMessage('bot', `💡 常见问题：${item.q}\n\n${item.a}`, true);
    });
  }

  overlay.classList.add('show');
}

function closeAiChat() {
  document.getElementById('ai-overlay').classList.remove('show');
}

function addAiMessage(role, text, isPreset = false) {
  const body = document.getElementById('ai-chat-body');
  if (!body) return;
  const div = document.createElement('div');
  div.className = `ai-message ${role}`;
  div.textContent = text;
  if (isPreset) div.style.opacity = '0.7';
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function sendAiMessage() {
  const input = document.getElementById('ai-input');
  const text = input.value.trim();
  if (!text) return;
  addAiMessage('user', text);
  input.value = '';

  // Mock 回复逻辑
  setTimeout(() => {
    const card = filteredCards[currentCardIndex];
    const qa = aiMockQA[card.id] || [];
    let reply = '';

    // 尝试匹配预设问题
    const matched = qa.find(q => text.includes(q.q.slice(0, 6)));
    if (matched) {
      reply = matched.a;
    } else if (text.includes('什么意思') || text.includes('解释')) {
      reply = `这句话的核心是：${card.plain_text}\n\n老子的意图是让我们理解：${card.background_note.slice(0, 60)}...`;
    } else if (text.includes('误读') || text.includes('误解')) {
      reply = card.misunderstanding_note;
    } else if (text.includes('现代') || text.includes('今天')) {
      reply = card.modern_scene;
    } else {
      reply = aiMockGeneral[Math.floor(Math.random() * aiMockGeneral.length)];
    }

    addAiMessage('bot', reply);
  }, 600 + Math.random() * 400);
}

// ============================================
// 语音朗读
// ============================================
let voiceSynth = null;
let isSpeaking = false;

function toggleVoice() {
  const btn = document.getElementById('voice-btn');
  if (isSpeaking) { stopVoice(); return; }

  const card = filteredCards[currentCardIndex];
  if (!card) return;

  if (!window.speechSynthesis) {
    alert('您的浏览器不支持语音朗读');
    return;
  }

  voiceSynth = new SpeechSynthesisUtterance(card.original_text);
  voiceSynth.lang = 'zh-CN';
  voiceSynth.rate = 0.85;
  voiceSynth.onend = () => { isSpeaking = false; btn.classList.remove('active'); };
  window.speechSynthesis.speak(voiceSynth);
  isSpeaking = true;
  btn.classList.add('active');
}

function stopVoice() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  isSpeaking = false;
  const btn = document.getElementById('voice-btn');
  if (btn) btn.classList.remove('active');
}

// ============================================
// 搜索
// ============================================
let searchTimeout = null;

function handleSearch(value) {
  clearTimeout(searchTimeout);
  const results = document.getElementById('search-results');
  if (!value.trim()) { results.classList.remove('show'); return; }
  searchTimeout = setTimeout(() => {
    const q = value.trim().toLowerCase();
    const matches = cards.filter(c =>
      c.original_text.includes(q) ||
      c.plain_text.toLowerCase().includes(q) ||
      c.chapter.includes(q) ||
      c.title.includes(q)
    ).slice(0, 6);

    if (matches.length === 0) {
      results.innerHTML = '<div class="search-result-item">未找到匹配内容</div>';
    } else {
      results.innerHTML = matches.map(c => `
        <div class="search-result-item" onclick="jumpToCardById('${c.id}');hideSearchResults()">
          <div class="search-chapter">${c.chapter} · ${c.group}</div>
          <div>${c.original_text.slice(0, 24)}${c.original_text.length > 24 ? '…' : ''}</div>
        </div>
      `).join('');
    }
    results.classList.add('show');
  }, 200);
}

function showSearchResults() {
  const input = document.getElementById('top-search');
  if (input && input.value.trim()) {
    document.getElementById('search-results').classList.add('show');
  }
}

function hideSearchResults() {
  document.getElementById('search-results').classList.remove('show');
}

function hideSearchResultsDelay() {
  setTimeout(() => hideSearchResults(), 200);
}

// ============================================
// 复习模式
// ============================================
let reviewQueue = [];
let reviewIndex = 0;

function openReview() {
  const viewed = cards.filter(c => viewedCards.has(c.id));
  if (viewed.length === 0) { alert('请先学习一些内容再进入复习模式'); return; }

  // 随机打乱已学卡片
  reviewQueue = [...viewed].sort(() => Math.random() - 0.5);
  reviewIndex = 0;

  renderReviewCard();
  document.getElementById('review-overlay').classList.add('show');
}

function closeReview() {
  document.getElementById('review-overlay').classList.remove('show');
}

function renderReviewCard() {
  const card = reviewQueue[reviewIndex];
  if (!card) return;

  document.getElementById('review-original').textContent = card.original_text;
  const answer = document.getElementById('review-answer');
  answer.textContent = card.plain_text + '\n\n' + card.aha_moment;
  answer.classList.remove('show');

  document.querySelector('.btn-reveal').style.display = 'inline-block';
  document.querySelector('.btn-next-review').style.display = 'none';

  document.getElementById('review-progress').textContent =
    `复习进度：${reviewIndex + 1} / ${reviewQueue.length}`;
}

function revealReviewAnswer() {
  document.getElementById('review-answer').classList.add('show');
  document.querySelector('.btn-reveal').style.display = 'none';
  document.querySelector('.btn-next-review').style.display = 'inline-block';
}

function nextReviewCard() {
  reviewIndex++;
  if (reviewIndex >= reviewQueue.length) {
    reviewIndex = 0;
    reviewQueue.sort(() => Math.random() - 0.5);
  }
  renderReviewCard();
}

// ============================================
// 触摸 & 键盘
// ============================================
let touchStartX = 0;
function initTouch() {
  const main = document.getElementById('cabin-main');
  if (!main) return;
  main.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  main.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) diff > 0 ? nextCard() : prevCard();
  }, { passive: true });
}
function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextCard(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevCard(); }
  });
}

// 点击遮罩关闭弹层
document.addEventListener('click', e => {
  if (e.target.id === 'note-overlay') closeNote();
  if (e.target.id === 'share-overlay') closeShare();
  if (e.target.id === 'daily-overlay') closeDaily();
  if (e.target.id === 'ai-overlay') closeAiChat();
  if (e.target.id === 'review-overlay') closeReview();
});
