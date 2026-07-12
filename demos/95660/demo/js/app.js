// TV Tracker Demo - Shared JS

// Sample data
const SAMPLE_MEDIA = [
  { id: 1, type: 'tv', title: '怪奇物语', original_title: 'Stranger Things', year: 2022, rating: 8.7, poster: 'https://image.tmdb.org/t/p/w500/56v2KjBlE4ML6QB2hN3O7giiDk9.jpg', backdrop: 'https://image.tmdb.org/t/p/original/56v2KjBlE4ML6QB2hN3O7giiDk9.jpg', tagline: '奇怪的事情正在发生', overview: '一个男孩神秘失踪后，引发了一系列超自然事件。小镇上的朋友们踏上了寻找真相的惊险旅程。', runtime: 51, genres: ['科幻', '悬疑', '剧情'], seasons: 4, episodes: 34 },
  { id: 2, type: 'movie', title: '奥本海默', original_title: 'Oppenheimer', year: 2023, rating: 8.1, poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', backdrop: 'https://image.tmdb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', tagline: '世界永远不会相同', overview: '讲述美国"原子弹之父"罗伯特·奥本海默在二战期间领导曼哈顿计划开发第一颗原子弹的故事。', runtime: 180, genres: ['传记', '剧情', '历史'] },
  { id: 3, type: 'movie', title: '芭比', original_title: 'Barbie', year: 2023, rating: 7.5, poster: 'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg', backdrop: 'https://image.tmdb.org/t/p/original/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg', tagline: '她无所不能', overview: '在芭比乐园中完美生活的芭比娃娃，因为一场存在主义危机而踏上真实世界的冒险之旅。', runtime: 114, genres: ['喜剧', '冒险', '奇幻'] },
  { id: 4, type: 'tv', title: '最后的生还者', original_title: 'The Last of Us', year: 2023, rating: 9.2, poster: 'https://image.tmdb.org/t/p/w500/1X7vow16X7CnCoexXh4H4F2yDJv.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1X7vow16X7CnCoexXh4H4F2yDJv.jpg', tagline: '当你失去了一切，你还能为什么而战？', overview: '在一场真菌感染摧毁人类文明20年后，幸存者乔尔被雇佣护送少女艾莉穿越疫区，展开一场决定人类命运的旅程。', runtime: 60, genres: ['剧情', '动作', '冒险'], seasons: 2, episodes: 9 },
  { id: 5, type: 'tv', title: '继承之战', original_title: 'Succession', year: 2023, rating: 8.8, poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', backdrop: 'https://image.tmdb.org/t/p/original/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', tagline: '金钱、权力与家族的终极博弈', overview: '罗伊家族是全球最大媒体娱乐集团的掌控者。当家族掌门人考虑退休时，他的四个子女开始了一场关于继承权的残酷争夺。', runtime: 60, genres: ['剧情'], seasons: 4, episodes: 39 },
  { id: 6, type: 'movie', title: '疾速追杀4', original_title: 'John Wick: Chapter 4', year: 2023, rating: 7.8, poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9pLEdb8VJJF0kKL.jpg', backdrop: 'https://image.tmdb.org/t/p/original/49WJfeN0moxb9pLEdb8VJJF0kKL.jpg', tagline: '复仇永无止境', overview: '约翰·威克发现了一条击败High Table的道路。但在他通往自由的路上，他必须面对一个新的敌人，这个敌人在全球拥有强大的联盟。', runtime: 169, genres: ['动作', '惊悚', '犯罪'] },
  { id: 7, type: 'movie', title: '银河护卫队3', original_title: 'Guardians of the Galaxy Vol. 3', year: 2023, rating: 8.0, poster: 'https://image.tmdb.org/t/p/w500/rktDFPbfHfGbF7x7Ovw5YsI0tJ9.jpg', backdrop: 'https://image.tmdb.org/t/p/original/rktDFPbfHfGbF7x7Ovw5YsI0tJ9.jpg', tagline: '最后一次冒险', overview: '银河护卫队成员们在Knowhere上安顿下来，但随着火箭浣熊动荡的过去重新浮现，他们的生活被打破了。', runtime: 150, genres: ['动作', '冒险', '科幻'] },
  { id: 8, type: 'tv', title: '龙之家族', original_title: 'House of the Dragon', year: 2022, rating: 8.5, poster: 'https://image.tmdb.org/t/p/w500/1N5cNS5DPyF2NpbkfoPE1x9VhKi.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1N5cNS5DPyF2NpbkfoPE1x9VhKi.jpg', tagline: '权力的游戏前传', overview: '讲述坦格利安家族的故事，以及导致"血龙狂舞"内战的事件。', runtime: 60, genres: ['剧情', '奇幻', '冒险'], seasons: 2, episodes: 10 },
  { id: 9, type: 'movie', title: '蜘蛛侠：纵横宇宙', original_title: 'Spider-Man: Across the Spider-Verse', year: 2023, rating: 8.9, poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', backdrop: 'https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', tagline: '每个宇宙都需要蜘蛛侠', overview: '布鲁克林的全职友好邻居蜘蛛侠与格温·史黛西重聚，跨越多元宇宙展开全新冒险。', runtime: 140, genres: ['动画', '动作', '冒险'] },
  { id: 10, type: 'movie', title: '沙丘2', original_title: 'Dune: Part Two', year: 2024, rating: 8.6, poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', tagline: '命运正在召唤', overview: '保罗·厄崔迪与弗雷曼人联手，向那些毁灭了他家人的人复仇。面对爱情和宇宙命运的抉择，他必须阻止可怕的预见成为现实。', runtime: 166, genres: ['科幻', '冒险', '剧情'] },
  { id: 11, type: 'tv', title: '黑暗荣耀', original_title: 'The Glory', year: 2022, rating: 8.3, poster: 'https://image.tmdb.org/t/p/w500/7a8Uusljx6J3vQeB5vMvSAdXbHy.jpg', backdrop: 'https://image.tmdb.org/t/p/original/7a8Uusljx6J3vQeB5vMvSAdXbHy.jpg', tagline: '复仇是一场漫长的旅程', overview: '曾在高中时期遭受严重校园暴力的文东恩，在多年后精心策划了一场复杂的复仇计划。', runtime: 60, genres: ['剧情', '悬疑', '惊悚'], seasons: 2, episodes: 16 },
  { id: 12, type: 'tv', title: '熊家餐馆', original_title: 'The Bear', year: 2022, rating: 8.7, poster: 'https://image.tmdb.org/t/p/w500/aDYwMnsT6r3ZPy91RZZMvnsJ58Q.jpg', backdrop: 'https://image.tmdb.org/t/p/original/aDYwMnsT6r3ZPy91RZZMvnsJ58Q.jpg', tagline: '厨房是战场', overview: '一位年轻的厨师从高端餐饮世界回到芝加哥，经营家族餐厅。他必须面对过去的阴影和餐厅的混乱。', runtime: 30, genres: ['剧情', '喜剧'], seasons: 2, episodes: 18 }
];

const CAST = [
  { name: '布莱恩·考克斯', role: 'Logan Roy', avatar: 'https://image.tmdb.org/t/p/w200/5Mvaj74q2i4iC5VrP4nGdNp62fQ.jpg' },
  { name: '杰瑞米·斯特朗', role: 'Kendall Roy', avatar: 'https://image.tmdb.org/t/p/w200/l4D9IqSzW1i7Y4m1l0gNLb9ScyH.jpg' },
  { name: '莎拉·斯努克', role: 'Shiv Roy', avatar: 'https://image.tmdb.org/t/p/w200/7SA0v6V6J6MHnjQ6dVE1M3lD8Vh.jpg' },
  { name: '基兰·卡尔金', role: 'Roman Roy', avatar: 'https://image.tmdb.org/t/p/w200/uX5C9VWn4QWIQf0s0Q3OKU6Fz8z.jpg' },
  { name: '马修·麦克费登', role: 'Tom Wambsgans', avatar: 'https://image.tmdb.org/t/p/w200/9yAFDeMSPJmN0Vn6S5xl0oqZa6n.jpg' },
  { name: '彼得·弗萊德曼', role: 'Greg Hirsch', avatar: 'https://image.tmdb.org/t/p/w200/3WxVFe58fT1N4yVxVhZLxSx9LqP.jpg' }
];

const VIDEOS = [
  { id: 1, title: '正式预告片', type: 'Trailer', thumb: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg' },
  { id: 2, title: '幕后花絮', type: 'Behind the Scenes', thumb: 'https://image.tmdb.org/t/p/w500/1X7vow16X7CnCoexXh4H4F2yDJv.jpg' },
  { id: 3, title: '角色介绍', type: 'Featurette', thumb: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' },
  { id: 4, title: 'IMAX版预告', type: 'Teaser', thumb: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9pLEdb8VJJF0kKL.jpg' }
];

// Calendar data
function getDateKey(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const options = { month: 'long', day: 'numeric', weekday: 'short' };
  return d.toLocaleDateString('zh-CN', options);
}

function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

function getRelativeDay(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '今天';
  if (diff === 1) return '明天';
  if (diff === -1) return '昨天';
  if (diff === 2) return '后天';
  return '';
}

// LocalStorage helpers
const STORAGE_KEYS = {
  WATCHLIST: 'tvtracker_watchlist',
  WATCHED: 'tvtracker_watched',
  HISTORY: 'tvtracker_history',
  SETTINGS: 'tvtracker_settings'
};

function getWatchlist() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]'); }
  catch (e) { return []; }
}

function saveWatchlist(list) {
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
}

function isInWatchlist(mediaId) {
  return getWatchlist().some(item => item.id === mediaId);
}

function getWatchStatus(mediaId) {
  const wl = getWatchlist();
  const item = wl.find(i => i.id === mediaId);
  return item ? item.status : null;
}

function toggleWatchlist(media, status = 'watchlist') {
  const wl = getWatchlist();
  const idx = wl.findIndex(i => i.id === media.id);
  if (idx >= 0) {
    wl.splice(idx, 1);
  } else {
    wl.push({ id: media.id, title: media.title, type: media.type, poster: media.poster, status, addedAt: Date.now() });
  }
  saveWatchlist(wl);
  showToast(isInWatchlist(media.id) ? '已加入追影列表' : '已从追影列表移除');
  return idx < 0;
}

function updateWatchStatus(mediaId, status) {
  const wl = getWatchlist();
  const item = wl.find(i => i.id === mediaId);
  if (item) {
    item.status = status;
    saveWatchlist(wl);
    showToast('状态已更新');
  }
}

// Watched episodes
function getWatched() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHED) || '{}'); }
  catch (e) { return {}; }
}

function saveWatched(data) {
  localStorage.setItem(STORAGE_KEYS.WATCHED, JSON.stringify(data));
}

function isEpisodeWatched(mediaId, season, episode) {
  const w = getWatched();
  return w[`${mediaId}_${season}_${episode}`] || false;
}

function toggleEpisodeWatched(mediaId, season, episode) {
  const w = getWatched();
  const key = `${mediaId}_${season}_${episode}`;
  if (w[key]) delete w[key];
  else w[key] = true;
  saveWatched(w);
  return !!w[key];
}

// Search history
function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]'); }
  catch (e) { return []; }
}

function saveHistory(list) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list));
}

function addHistory(query) {
  let h = getHistory();
  h = [query, ...h.filter(q => q !== query)].slice(0, 10);
  saveHistory(h);
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

// Toast notification
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2500);
}

// Search modal
const SEARCH_HTML = `
  <div class="search-overlay" id="searchOverlay" onclick="if(event.target.id==='searchOverlay')closeSearch()">
    <div class="search-modal">
      <div class="search-header">
        <div class="search-input-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="searchInput" placeholder="搜索电影、电视剧、演员..." oninput="handleSearchInput(this.value)" onkeydown="handleSearchKeydown(event)">
          <button class="search-btn" onclick="clearSearchInput()" id="searchClearBtn" style="display:none">清除</button>
        </div>
      </div>
      <div class="search-content" id="searchContent"></div>
    </div>
  </div>
`;

function openSearch() {
  if (!document.getElementById('searchOverlay')) {
    document.body.insertAdjacentHTML('beforeend', SEARCH_HTML);
  }
  document.getElementById('searchOverlay').style.display = 'flex';
  setTimeout(() => document.getElementById('searchInput').focus(), 50);
  renderSearchContent('');
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (overlay) overlay.style.display = 'none';
}

function clearSearchInput() {
  const input = document.getElementById('searchInput');
  input.value = '';
  renderSearchContent('');
  input.focus();
}

function handleSearchInput(value) {
  document.getElementById('searchClearBtn').style.display = value.length ? 'inline-block' : 'none';
  renderSearchContent(value);
}

function handleSearchKeydown(e) {
  if (e.key === 'Escape') closeSearch();
  if (e.key === 'Enter' && e.target.value.trim()) {
    const results = searchMedia(e.target.value.trim());
    if (results.length > 0) {
      addHistory(e.target.value.trim());
      goToDetail(results[0].id);
    }
  }
}

function searchMedia(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  return SAMPLE_MEDIA.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.original_title.toLowerCase().includes(q)
  );
}

function renderSearchContent(query) {
  const content = document.getElementById('searchContent');
  if (!query) {
    const history = getHistory();
    if (history.length === 0) {
      content.innerHTML = `<div class="search-history"><div class="search-history-title">热门搜索</div><div class="history-tags">${['怪奇物语', '奥本海默', '蜘蛛侠', '继承之战', '沙丘'].map(h => `<button class="history-tag" onclick="executeSearch('${h}')">${h}</button>`).join('')}</div></div>`;
    } else {
      content.innerHTML = `<div class="search-history"><div class="search-history-title">搜索历史 <button onclick="clearHistory();renderSearchContent('');">清除</button></div><div class="history-tags">${history.map(h => `<button class="history-tag" onclick="executeSearch('${h}')">${h}</button>`).join('')}</div></div>`;
    }
    return;
  }
  const results = searchMedia(query);
  if (results.length === 0) {
    content.innerHTML = `<div class="empty-results"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p>未找到相关内容</p></div>`;
    return;
  }
  const movies = results.filter(r => r.type === 'movie');
  const shows = results.filter(r => r.type === 'tv');
  let html = '';
  if (shows.length) {
    html += `<div class="results-group"><div class="results-group-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>电视剧 (${shows.length})</div>${shows.map(m => renderSearchResultItem(m)).join('')}</div>`;
  }
  if (movies.length) {
    html += `<div class="results-group"><div class="results-group-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/></svg>电影 (${movies.length})</div>${movies.map(m => renderSearchResultItem(m)).join('')}</div>`;
  }
  content.innerHTML = html;
}

function renderSearchResultItem(m) {
  const status = getWatchStatus(m.id);
  const statusText = status === 'watching' ? '在追' : status === 'watched' ? '已看' : status === 'watchlist' ? '想看' : '';
  return `<div class="result-item" onclick="executeSearch('${m.title}');goToDetail(${m.id});">
    <img src="${m.poster}" class="result-poster" alt="">
    <div class="result-info">
      <div class="result-title">${m.title}</div>
      <div class="result-meta">${m.year} · ${m.type === 'movie' ? '电影' : '电视剧'} · ⭐ ${m.rating}${statusText ? ' · ' + statusText : ''}</div>
    </div>
  </div>`;
}

function executeSearch(query) {
  const input = document.getElementById('searchInput');
  input.value = query;
  addHistory(query);
  handleSearchInput(query);
}

// Navigation
function goToDetail(id) {
  closeSearch();
  window.location.href = `detail.html?id=${id}`;
}

// Formatters
function formatRuntime(minutes) {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}小时${m > 0 ? ' ' + m + '分钟' : ''}` : `${m}分钟`;
}

// Generate navigation HTML
function getNavHtml(activePage) {
  const pages = [
    { id: 'index', label: '首页', href: 'index.html', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>' },
    { id: 'home', label: '热门', href: 'home.html', icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
    { id: 'explore', label: '探索', href: 'explore.html', icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
    { id: 'calendar', label: '日历', href: 'calendar.html', icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    { id: 'myshows', label: '我的追剧', href: 'myshows.html', icon: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>' },
    { id: 'settings', label: '设置', href: 'settings.html', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>' }
  ];
  return `<nav class="nav">
    <a href="index.html" class="nav-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      TV Tracker
    </a>
    <div class="nav-links">
      ${pages.map(p => `<a href="${p.href}" class="${activePage === p.id ? 'active' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${p.icon}</svg>${p.label}</a>`).join('')}
    </div>
    <div class="nav-right">
      <button class="nav-search" onclick="openSearch()" title="搜索">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
      <div class="nav-user">
        <div class="nav-user-avatar">U</div>
      </div>
    </div>
  </nav>`;
}

// Initialize
function initApp(pageId) {
  // Insert nav
  document.body.insertAdjacentHTML('afterbegin', getNavHtml(pageId));
  
  // Close search on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !document.getElementById('searchOverlay')) {
      e.preventDefault();
      openSearch();
    }
  });
  
  // Close search on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.id === 'searchOverlay') closeSearch();
  });
}

// Tabs helper
function setupTabs(container, onChange) {
  container.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      container.querySelectorAll('[data-tab-content]').forEach(c => {
        c.style.display = c.dataset.tabContent === target ? 'block' : 'none';
      });
      if (onChange) onChange(target);
    });
  });
}

// Toggle switch helper
function setupToggles(container) {
  container.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle.classList.toggle('on');
    });
  });
}