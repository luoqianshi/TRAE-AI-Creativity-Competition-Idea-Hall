// web/app.js
const App = (() => {
  let currentTab = 'recipes';
  let favorites = [];
  let currentGroup = { name: '家庭聚餐', members: ['我', '妈妈', '爸爸'], votes: {} };
  let userPrefs = { flavor: [], allergens: [], budget: 50 };
  
  const loadFavorites = () => {
    const saved = localStorage.getItem('homechef_favs');
    if (saved) favorites = JSON.parse(saved);
  };
  
  const saveFavorites = () => {
    localStorage.setItem('homechef_favs', JSON.stringify(favorites));
  };
  
  const toggleFav = (id) => {
    const idx = favorites.indexOf(id);
    if (idx >= 0) favorites.splice(idx, 1);
    else favorites.push(id);
    saveFavorites();
    return favorites.includes(id);
  };
  
  const isFav = (id) => favorites.includes(id);
  
  const getRecipe = (id) => RECIPES.find(r => r.id === id);
  
  const renderTabbar = () => {
    const tabs = [
      { id: 'recipes', label: '菜谱', icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' },
      { id: 'wheel', label: '转盘', icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>' },
      { id: 'budget', label: '预算', icon: '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>' },
      { id: 'favorites', label: '收藏', icon: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>' },
      { id: 'profile', label: '我的', icon: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>' },
    ];
    return `<nav class="tabbar">${tabs.map(t => `<button class="tab-item${currentTab === t.id ? ' active' : ''}" onclick="App.switchTab('${t.id}')"><svg viewBox="0 0 24 24" fill="currentColor">${t.icon}</svg><span>${t.label}</span></button>`).join('')}</nav>`;
  };
  
  const renderRecipeCard = (r) => {
    const coverSvg = window.RecipeCovers.coverSvgFor(r.id, r.cover);
    return `<div class="r-card" onclick="App.goDetail('${r.id}')"><div class="r-cover">${coverSvg}</div><div class="r-info"><div><div class="r-name">${r.name}</div><div class="r-desc">${r.desc}</div><div class="r-tags">${r.tags.slice(0,2).map(t => `<span class="r-tag">${t}</span>`).join('')}</div></div><div class="r-meta"><span>${r.cost}元</span><span>${r.serves}人份</span></div></div></div>`;
  };
  
  const renderRecipes = () => {
    return `<div class="page"><div class="page-title">菜谱全书</div><div class="filter-bar"><button class="filter-tag active" onclick="App.filterRecipes('all')">全部</button><button class="filter-tag" onclick="App.filterRecipes('快手菜')">快手菜</button><button class="filter-tag" onclick="App.filterRecipes('硬菜')">硬菜</button><button class="filter-tag" onclick="App.filterRecipes('素食')">素食</button><button class="filter-tag" onclick="App.filterRecipes('汤品')">汤品</button><button class="filter-tag" onclick="App.filterRecipes('主食')">主食</button></div><div>${RECIPES.map(r => renderRecipeCard(r)).join('')}</div></div>`;
  };
  
  const renderDetail = (id) => {
    const r = getRecipe(id);
    if (!r) return renderRecipes();
    const coverSvg = window.RecipeCovers.coverSvgFor(r.id, r.cover);
    const isFavorite = isFav(id);
    return `<div class="page detail-page"><div class="detail-header"><div class="hero-deco">${r.cover}</div><div class="hero-deco">🍳</div><div class="hero-deco">🥢</div><div class="hero-cover">${coverSvg}</div><div class="detail-title">${r.name}</div><div class="detail-meta"><span>${r.category}</span><span>${r.cost}元</span><span>${r.serves}人份</span></div></div><div class="section"><div class="section-title">食材清单</div><div class="ingredients-list">${r.ingredients.map(i => `<div class="ing-item"><span class="ing-name">${i.name}</span><span class="ing-qty">${i.qty}${i.unit}</span></div>`).join('')}</div></div><div class="section"><div class="section-title">做法步骤</div><div class="steps-list">${r.steps.map((step, i) => {
      const stepSvg = window.StepSvgs.stepSvgFor(step);
      return `<div class="step-card" style="animation-delay:${i * 0.08}s"><div class="step-num">${i + 1}</div><div class="step-img">${stepSvg}</div><div class="step-text">${step}</div></div>`;
    }).join('')}</div></div><div class="action-bar"><button class="btn-fav${isFavorite ? ' active' : ''}" onclick="App.toggleDetailFav('${id}')">${isFavorite ? '❤️' : '🤍'}</button><button class="btn btn-primary" onclick="App.switchTab('budget')">加入预算</button><button class="btn btn-outline" onclick="App.switchTab('recipes')">返回列表</button></div></div>`;
  };
  
  const renderWheel = () => {
    const colors = ['#FFD86B', '#FF9A8B', '#6BCB77', '#4ECDC4', '#FF6B6B', '#A8E6CF', '#FFD93D', '#FF8787'];
    const segments = RECIPES.slice(0, 8);
    const angle = 360 / segments.length;
    return `<div class="page"><div class="page-title">菜品转盘</div><div class="wheel-container"><div class="wheel">${segments.map((r, i) => `<div class="wheel-segment" style="transform:rotate(${i * angle}deg); background:${colors[i % colors.length]}"><span style="display:block;transform:rotate(${angle/2}deg) translateY(-100px) translateX(40px); text-align:center; font-size:12px; color:#333; font-weight:600; width:80px;">${r.name}</span></div>`).join('')}</div><div class="wheel-center">🎯</div><div class="wheel-pointer"></div></div><button class="wheel-btn" onclick="App.spinWheel()">开始转动</button><div id="wheel-result" style="text-align:center; margin-top:20px; font-size:18px; font-weight:600;"></div></div>`;
  };
  
  const renderBudget = () => {
    return `<div class="page"><div class="page-title">预算菜谱</div><div class="form-row"><div class="form-group"><div class="form-label">预算金额</div><input type="number" class="form-input" id="budget-input" value="50" placeholder="请输入预算"></div><div class="form-group"><div class="form-label">用餐人数</div><input type="number" class="form-input" id="people-input" value="3" placeholder="请输入人数"></div></div><div class="form-group"><div class="form-label">用餐时段</div><select class="form-select" id="meal-input"><option value="dinner">晚餐</option><option value="lunch">午餐</option><option value="all">一日三餐</option></select></div><button class="btn btn-primary" style="width:100%; margin-top:8px;" onclick="App.generateBudget()">生成菜谱</button><div id="budget-result"></div></div>`;
  };
  
  const renderFavorites = () => {
    if (favorites.length === 0) {
      return `<div class="page"><div class="page-title">我的收藏</div><div class="fav-empty"><svg viewBox="0 0 24 24" fill="#ccc"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg><p>还没有收藏菜谱</p><p style="font-size:12px;">去菜谱全书看看吧~</p></div></div>`;
    }
    return `<div class="page"><div class="page-title">我的收藏 (${favorites.length})</div><div>${favorites.map(id => { const r = getRecipe(id); return r ? renderRecipeCard(r) : ''; }).join('')}</div></div>`;
  };
  
  const renderFridge = () => {
    return `<div class="page"><div class="page-title">冰箱推荐</div><div class="form-group"><div class="form-label">冰箱里有什么</div><textarea class="fridge-input" id="fridge-input" placeholder="例如：番茄、鸡蛋、土豆、葱花"></textarea></div><button class="btn btn-primary" style="width:100%;" onclick="App.generateFridge()">开始匹配</button><div id="fridge-result" class="fridge-result"></div></div>`;
  };
  
  const renderGroup = () => {
    return `<div class="page"><div class="page-title">家庭小组</div><div class="group-section"><div class="group-name">${currentGroup.name}</div><div class="group-members">${currentGroup.members.map(m => `<div class="member-avatar">${m[0]}</div>`).join('')}</div><button class="btn btn-outline" style="width:100%;" onclick="App.startGroupVote()">发起投票</button></div><div id="group-vote-area"></div></div>`;
  };
  
  const renderProfile = () => {
    return `<div class="page"><div class="page-title">我的</div><div class="profile-card"><div class="profile-avatar">👩‍🍳</div><div class="profile-info"><div class="profile-name">美食家</div><div class="profile-group">家庭主厨 · 3人组</div></div></div><div class="settings-list"><div class="settings-item" onclick="App.switchTab('budget')"><div class="settings-item-left">💰 预算设置</div><div class="settings-item-right">${userPrefs.budget}元/天</div></div><div class="settings-item" onclick="App.showPrefs()"><div class="settings-item-left">🌶️ 口味偏好</div><div class="settings-item-right">${userPrefs.flavor.length > 0 ? userPrefs.flavor.join(',') : '未设置'}</div></div><div class="settings-item" onclick="App.switchTab('group')"><div class="settings-item-left">👨‍👩‍👧 家庭小组</div><div class="settings-item-right">${currentGroup.members.length}人</div></div><div class="settings-item"><div class="settings-item-left">📝 关于我们</div><div class="settings-item-right">v1.0.0</div></div></div></div>`;
  };
  
  const filterRecipes = (tag) => {
    const filtered = tag === 'all' ? RECIPES : RECIPES.filter(r => r.tags.includes(tag) || r.category === tag);
    const html = `<div class="page"><div class="page-title">菜谱全书</div><div class="filter-bar"><button class="filter-tag${tag === 'all' ? ' active' : ''}" onclick="App.filterRecipes('all')">全部</button><button class="filter-tag${tag === '快手菜' ? ' active' : ''}" onclick="App.filterRecipes('快手菜')">快手菜</button><button class="filter-tag${tag === '硬菜' ? ' active' : ''}" onclick="App.filterRecipes('硬菜')">硬菜</button><button class="filter-tag${tag === '素食' ? ' active' : ''}" onclick="App.filterRecipes('素食')">素食</button><button class="filter-tag${tag === '汤品' ? ' active' : ''}" onclick="App.filterRecipes('汤品')">汤品</button><button class="filter-tag${tag === '主食' ? ' active' : ''}" onclick="App.filterRecipes('主食')">主食</button></div><div>${filtered.map(r => renderRecipeCard(r)).join('')}</div></div>`;
    document.getElementById('screen').innerHTML = html;
  };
  
  const generateBudget = () => {
    const budget = parseFloat(document.getElementById('budget-input').value) || 50;
    const people = parseInt(document.getElementById('people-input').value) || 3;
    const meal = document.getElementById('meal-input').value;
    
    let recipes = RECIPES.filter(r => !r.allergens.some(a => userPrefs.allergens.includes(a)));
    recipes.sort(() => Math.random() - 0.5);
    
    let result = [];
    let totalCost = 0;
    
    if (meal === 'all') {
      const breakfastBudget = budget * 0.2;
      const lunchBudget = budget * 0.4;
      const dinnerBudget = budget * 0.4;
      
      const breakfast = recipes.filter(r => r.category === '主食' || r.tags.includes('低预算')).filter(r => r.cost <= breakfastBudget).slice(0, 1);
      const lunch = recipes.filter(r => r.cost <= lunchBudget).slice(0, 2);
      const dinner = recipes.filter(r => r.cost <= dinnerBudget).slice(0, 2);
      
      result = [{ name: '早餐', recipes: breakfast }, { name: '午餐', recipes: lunch }, { name: '晚餐', recipes: dinner }];
      totalCost = [...breakfast, ...lunch, ...dinner].reduce((sum, r) => sum + r.cost, 0);
    } else {
      const maxCost = budget;
      const selected = recipes.filter(r => r.cost <= maxCost).slice(0, 3);
      result = [{ name: meal === 'lunch' ? '午餐' : '晚餐', recipes: selected }];
      totalCost = selected.reduce((sum, r) => sum + r.cost, 0);
    }
    
    const html = `<div class="budget-result"><div class="budget-title">💰 预算方案</div>${result.map(m => `<div class="meal-group"><div class="meal-name">${m.name}</div><div class="meal-recipes">${m.recipes.map(r => {
      const coverSvg = window.RecipeCovers.coverSvgFor(r.id, r.cover);
      return `<div class="meal-recipe" onclick="App.goDetail('${r.id}')"><div class="cover">${coverSvg}</div><div class="meal-recipe-info"><div class="meal-recipe-name">${r.name}</div><div class="meal-recipe-cost">${r.cost}元 · ${r.serves}人份</div></div></div>`;
    }).join('')}</div></div>`).join('')}<div class="budget-total"><span>总计</span><span>${totalCost.toFixed(0)}元</span></div></div>`;
    
    document.getElementById('budget-result').innerHTML = html;
  };
  
  const spinWheel = () => {
    const wheel = document.querySelector('.wheel');
    const resultDiv = document.getElementById('wheel-result');
    const rotation = Math.random() * 3600 + 720;
    wheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
    wheel.style.transform = `rotate(${rotation}deg)`;
    
    setTimeout(() => {
      const segments = RECIPES.slice(0, 8);
      const angle = 360 / segments.length;
      const actualRotation = rotation % 360;
      const index = Math.floor((360 - actualRotation) / angle) % segments.length;
      const winner = segments[index];
      resultDiv.innerHTML = `🎉 选中了：${winner.name}！`;
      setTimeout(() => App.goDetail(winner.id), 1500);
    }, 4000);
  };
  
  const generateFridge = () => {
    const input = document.getElementById('fridge-input').value;
    if (!input.trim()) return;
    
    const ingredients = input.split(/[,，、\s]+/).map(i => i.trim()).filter(i => i);
    
    let matches = RECIPES.map(r => {
      const matched = r.ingredients.filter(ing => ingredients.some(inp => ing.name.includes(inp) || inp.includes(ing.name)));
      return { ...r, matchCount: matched.length, matchRate: matched.length / r.ingredients.length };
    }).filter(r => r.matchCount > 0).sort((a, b) => b.matchRate - a.matchRate).slice(0, 5);
    
    const html = `<div><div class="section-title">匹配结果</div><div>${matches.map(r => {
      const coverSvg = window.RecipeCovers.coverSvgFor(r.id, r.cover);
      return `<div class="r-card" onclick="App.goDetail('${r.id}')"><div class="r-cover">${coverSvg}</div><div class="r-info"><div><div class="r-name">${r.name}</div><div class="match-score">匹配度 ${Math.round(r.matchRate * 100)}%</div><div class="r-tags">${r.tags.slice(0,2).map(t => `<span class="r-tag">${t}</span>`).join('')}</div></div><div class="r-meta"><span>${r.cost}元</span><span>${r.serves}人份</span></div></div></div>`;
    }).join('')}</div></div>`;
    
    document.getElementById('fridge-result').innerHTML = html;
  };
  
  const startGroupVote = () => {
    const candidates = RECIPES.sort(() => Math.random() - 0.5).slice(0, 5);
    currentGroup.votes = {};
    candidates.forEach(c => currentGroup.votes[c.id] = []);
    
    const html = `<div class="group-section"><div class="group-name">投票：今晚吃什么？</div><div class="group-vote-list">${candidates.map(r => {
      const coverSvg = window.RecipeCovers.coverSvgFor(r.id, r.cover);
      const voted = currentGroup.votes[r.id] && currentGroup.votes[r.id].includes('我');
      return `<div class="group-vote-item"><div class="cover">${coverSvg}</div><div class="group-vote-info"><div class="group-vote-name">${r.name}</div><div class="group-vote-count">${currentGroup.votes[r.id] ? currentGroup.votes[r.id].length : 0}票</div></div><button class="group-vote-btn" onclick="App.vote('${r.id}')">${voted ? '✓ 已投票' : '投票'}</button></div>`;
    }).join('')}</div></div>`;
    
    document.getElementById('group-vote-area').innerHTML = html;
  };
  
  const vote = (id) => {
    if (!currentGroup.votes[id]) currentGroup.votes[id] = [];
    if (!currentGroup.votes[id].includes('我')) {
      currentGroup.votes[id].push('我');
      startGroupVote();
    }
  };
  
  const toggleDetailFav = (id) => {
    const isFavorite = toggleFav(id);
    const btn = document.querySelector('.btn-fav');
    btn.innerHTML = isFavorite ? '❤️' : '🤍';
    btn.classList.toggle('active', isFavorite);
  };
  
  const switchTab = (tab) => {
    currentTab = tab;
    document.getElementById('tabbar').innerHTML = renderTabbar();
    let html = '';
    switch(tab) {
      case 'recipes': html = renderRecipes(); break;
      case 'wheel': html = renderWheel(); break;
      case 'budget': html = renderBudget(); break;
      case 'favorites': html = renderFavorites(); break;
      case 'profile': html = renderProfile(); break;
    }
    document.getElementById('screen').innerHTML = html;
  };
  
  const goDetail = (id) => {
    document.getElementById('screen').innerHTML = renderDetail(id);
  };
  
  const showPrefs = () => {
    alert('口味偏好设置：\n\n可选口味：咸鲜、微辣、酸辣、酸甜、清淡、蒜香\n\n当前偏好：' + (userPrefs.flavor.length > 0 ? userPrefs.flavor.join(', ') : '未设置'));
  };
  
  const init = () => {
    loadFavorites();
    document.getElementById('tabbar').innerHTML = renderTabbar();
    document.getElementById('screen').innerHTML = renderRecipes();
    
    setInterval(() => {
      const now = new Date();
      document.getElementById('sb-time').textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }, 1000);
  };
  
  return { init, switchTab, goDetail, toggleDetailFav, filterRecipes, generateBudget, spinWheel, generateFridge, startGroupVote, vote };
})();
window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
