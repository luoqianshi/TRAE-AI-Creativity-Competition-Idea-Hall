// ========== 皮影戏工坊 - 主游戏逻辑 ==========

// 全局状态
const AppState = {
  currentScreen: 'home',
  selectedCharacters: [],
  selectedProps: [],
  selectedScene: 'default',
  stageActors: [],  // 舞台上的角色和道具 {id, type, charId, x, y, scale, action, opacity}
  nextActorId: 1,
  selectedActorId: null,
  duration: 10,
  soundEnabled: true,
  previewTimer: null
};

// ========== 工具函数 ==========
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

function switchScreen(screenId) {
  // 停止预览动画
  if (AppState.previewTimer) {
    cancelAnimationFrame(AppState.previewTimer);
    AppState.previewTimer = null;
  }

  $$('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + screenId);
  if (target) {
    target.classList.add('active');
    AppState.currentScreen = screenId;

    // 屏幕切换时的初始化
    if (screenId === 'stage') renderStage();
    if (screenId === 'culture') renderCultureCards();
    if (screenId === 'preview') startPreview();
  }

  window.scrollTo(0, 0);
}

function getCharacterSVG(charId) {
  const char = SHADOW_CHARACTERS[charId];
  return char ? char.svg : '';
}

function getPropSVG(propId) {
  const prop = SHADOW_PROPS[propId];
  return prop ? prop.svg : '';
}

// ========== 开场界面 ==========
function initHome() {
  $('#btnStart').addEventListener('click', () => switchScreen('select'));
  $('#btnCulture').addEventListener('click', () => switchScreen('culture'));
}

// ========== 角色选择界面 ==========
function initSelectScreen() {
  // Tab切换
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      $$('.select-panel').forEach(p => p.classList.add('hidden'));
      $('#panel-' + tab).classList.remove('hidden');
    });
  });

  renderCharacterGrid();
  renderPropsGrid();
  renderScenesGrid();

  $('#btnGoStage').addEventListener('click', () => {
    if (AppState.selectedCharacters.length === 0 && AppState.selectedProps.length === 0) {
      alert('请至少选择一个角色或道具！');
      return;
    }
    // 预填充舞台
    autoPopulateStage();
    switchScreen('stage');
  });
}

function renderCharacterGrid() {
  const grid = $('#characterGrid');
  grid.innerHTML = '';
  Object.values(SHADOW_CHARACTERS).forEach(char => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.charId = char.id;
    const isSelected = AppState.selectedCharacters.includes(char.id);
    if (isSelected) card.classList.add('selected');
    card.innerHTML = `
      <div class="card-icon">${char.svg}</div>
      <div class="card-name">${char.name}</div>
      <div class="card-desc">${char.desc}</div>
    `;
    card.addEventListener('click', () => toggleCharacter(char.id));
    grid.appendChild(card);
  });
  updateSelectSummary();
}

function renderPropsGrid() {
  const grid = $('#propsGrid');
  grid.innerHTML = '';
  Object.values(SHADOW_PROPS).forEach(prop => {
    const card = document.createElement('div');
    card.className = 'card';
    const isSelected = AppState.selectedProps.includes(prop.id);
    if (isSelected) card.classList.add('selected');
    card.innerHTML = `
      <div class="card-icon">${prop.svg}</div>
      <div class="card-name">${prop.name}</div>
    `;
    card.addEventListener('click', () => toggleProp(prop.id));
    grid.appendChild(card);
  });
  updateSelectSummary();
}

function renderScenesGrid() {
  const grid = $('#scenesGrid');
  grid.innerHTML = '';
  Object.values(SHADOW_SCENES).forEach(scene => {
    const card = document.createElement('div');
    card.className = 'card';
    if (AppState.selectedScene === scene.id) card.classList.add('selected');
    card.innerHTML = `
      <div class="card-icon" style="background:${scene.bg}; min-height:80px; border-radius:4px;"></div>
      <div class="card-name">${scene.name}</div>
    `;
    card.addEventListener('click', () => {
      AppState.selectedScene = scene.id;
      renderScenesGrid();
    });
    grid.appendChild(card);
  });
  updateSelectSummary();
}

function toggleCharacter(charId) {
  const idx = AppState.selectedCharacters.indexOf(charId);
  if (idx >= 0) AppState.selectedCharacters.splice(idx, 1);
  else AppState.selectedCharacters.push(charId);
  renderCharacterGrid();
}

function toggleProp(propId) {
  const idx = AppState.selectedProps.indexOf(propId);
  if (idx >= 0) AppState.selectedProps.splice(idx, 1);
  else AppState.selectedProps.push(propId);
  renderPropsGrid();
}

function updateSelectSummary() {
  $('#selectedCount').textContent = AppState.selectedCharacters.length;
  $('#selectedPropsCount').textContent = AppState.selectedProps.length;
  const scene = SHADOW_SCENES[AppState.selectedScene];
  $('#selectedScene').textContent = scene ? scene.name : '默认';
}

// 自动填充舞台
function autoPopulateStage() {
  AppState.stageActors = [];
  let xPos = 20;
  const step = Math.max(30, 50 / Math.max(1, AppState.selectedCharacters.length + AppState.selectedProps.length));

  AppState.selectedCharacters.forEach(charId => {
    const char = SHADOW_CHARACTERS[charId];
    AppState.stageActors.push({
      id: AppState.nextActorId++,
      type: 'character',
      charId: charId,
      name: char.name,
      x: xPos,
      y: 55,
      scale: 1,
      action: 'idle',
      opacity: 1
    });
    xPos += step;
  });

  AppState.selectedProps.forEach(propId => {
    const prop = SHADOW_PROPS[propId];
    AppState.stageActors.push({
      id: AppState.nextActorId++,
      type: 'prop',
      charId: propId,
      name: prop.name,
      x: xPos,
      y: 70,
      scale: 0.8,
      action: 'idle',
      opacity: 1
    });
    xPos += step;
  });
}

// ========== 舞台编辑 ==========
function initStageScreen() {
  $('#btnPreview').addEventListener('click', () => switchScreen('preview'));
  $('#btnReset').addEventListener('click', () => {
    if (confirm('确定要清空舞台吗？')) {
      AppState.stageActors = [];
      AppState.selectedActorId = null;
      renderStage();
    }
  });
  $('#btnBackSelect').addEventListener('click', () => switchScreen('select'));
}

function renderStage() {
  // 渲染素材库
  const library = $('#stageLibrary');
  library.innerHTML = '';

  if (AppState.selectedCharacters.length === 0 && AppState.selectedProps.length === 0) {
    const tip = document.createElement('div');
    tip.style.cssText = 'padding:10px; font-size:12px; color:#e8d9b8; text-align:center;';
    tip.textContent = '请先在角色选择中挑选素材';
    library.appendChild(tip);
  }

  AppState.selectedCharacters.forEach(charId => {
    const char = SHADOW_CHARACTERS[charId];
    const item = document.createElement('div');
    item.className = 'lib-item';
    item.innerHTML = `
      <div class="lib-item-icon" style="width:40px; height:60px;">${char.svg}</div>
      <div style="font-size:13px;">${char.name}（点击添加）</div>
    `;
    item.addEventListener('click', () => addCharacterToStage(charId));
    library.appendChild(item);
  });

  AppState.selectedProps.forEach(propId => {
    const prop = SHADOW_PROPS[propId];
    const item = document.createElement('div');
    item.className = 'lib-item';
    item.innerHTML = `
      <div class="lib-item-icon" style="width:40px; height:50px;">${prop.svg}</div>
      <div style="font-size:13px;">${prop.name}（点击添加）</div>
    `;
    item.addEventListener('click', () => addPropToStage(propId));
    library.appendChild(item);
  });

  // 渲染时间轴时长
  $('#duration').textContent = AppState.duration;

  // 渲染舞台角色
  renderStageActors();

  // 设置背景
  const scene = SHADOW_SCENES[AppState.selectedScene];
  const curtain = $('#stageCurtain');
  if (curtain && scene) {
    curtain.style.background = scene.bg;
  }
}

function addCharacterToStage(charId) {
  const char = SHADOW_CHARACTERS[charId];
  AppState.stageActors.push({
    id: AppState.nextActorId++,
    type: 'character',
    charId: charId,
    name: char.name,
    x: 30 + Math.random() * 40,
    y: 50 + Math.random() * 20,
    scale: 1,
    action: 'idle',
    opacity: 1
  });
  renderStageActors();
}

function addPropToStage(propId) {
  const prop = SHADOW_PROPS[propId];
  AppState.stageActors.push({
    id: AppState.nextActorId++,
    type: 'prop',
    charId: propId,
    name: prop.name,
    x: 30 + Math.random() * 40,
    y: 60 + Math.random() * 20,
    scale: 0.7,
    action: 'idle',
    opacity: 1
  });
  renderStageActors();
}

function renderStageActors() {
  const stageActorsDiv = $('#stageActors');
  stageActorsDiv.innerHTML = '';

  AppState.stageActors.forEach(actor => {
    const el = document.createElement('div');
    el.className = 'stage-actor';
    if (actor.id === AppState.selectedActorId) el.classList.add('selected');
    el.style.left = actor.x + '%';
    el.style.top = actor.y + '%';
    el.style.transform = `translate(-50%, -50%) scale(${actor.scale})`;

    const svg = actor.type === 'character' ? getCharacterSVG(actor.charId) : getPropSVG(actor.charId);
    el.innerHTML = `
      <div style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.6)); width: ${actor.type === 'character' ? '80px' : '60px'}; height: ${actor.type === 'character' ? '130px' : '90px'};">
        ${svg}
      </div>
      <div class="actor-delete-btn" title="删除">✕</div>
    `;

    // 点击选中
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('actor-delete-btn')) return;
      AppState.selectedActorId = actor.id;
      renderStageActors();
      renderActionEditor();
    });

    // 删除按钮
    const delBtn = el.querySelector('.actor-delete-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        AppState.stageActors = AppState.stageActors.filter(a => a.id !== actor.id);
        if (AppState.selectedActorId === actor.id) AppState.selectedActorId = null;
        renderStageActors();
        renderActionEditor();
      });
    }

    // 拖拽
    makeDraggable(el, actor);
    stageActorsDiv.appendChild(el);
  });

  renderActionEditor();
}

function makeDraggable(element, actor) {
  let isDragging = false;
  let startX, startY;

  const onMouseDown = (e) => {
    if (e.target.classList.contains('actor-delete-btn')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    e.preventDefault();
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    const stage = $('#stageScene');
    const rect = stage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    actor.x = Math.max(5, Math.min(95, x));
    actor.y = Math.max(10, Math.min(90, y));
    element.style.left = actor.x + '%';
    element.style.top = actor.y + '%';
  };

  const onMouseUp = () => { isDragging = false; };

  element.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  // 触屏支持
  element.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('actor-delete-btn')) return;
    const touch = e.touches[0];
    isDragging = true;
    startX = touch.clientX;
    startY = touch.clientY;
    e.preventDefault();
  });
  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const stage = $('#stageScene');
    const rect = stage.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    actor.x = Math.max(5, Math.min(95, x));
    actor.y = Math.max(10, Math.min(90, y));
    element.style.left = actor.x + '%';
    element.style.top = actor.y + '%';
  });
  document.addEventListener('touchend', onMouseUp);
}

function renderActionEditor() {
  const editor = $('#actionEditor');
  const actor = AppState.stageActors.find(a => a.id === AppState.selectedActorId);

  if (!actor) {
    editor.innerHTML = '<div class="editor-hint">💡 点击舞台上的角色/道具来设置动作与位置</div>';
    return;
  }

  const actionButtons = ACTION_TYPES.map(a => `
    <button class="action-btn ${actor.action === a.id ? 'active' : ''}" data-action="${a.id}">${a.icon} ${a.name}</button>
  `).join('');

  editor.innerHTML = `
    <div class="action-panel">
      <h4>🎭 ${actor.name}（${actor.type === 'character' ? '角色' : '道具'}）</h4>
      <div style="margin-bottom:15px; padding:10px; background:rgba(26,26,26,0.4); border-radius:4px; font-size:12px; color:#e8d9b8;">
        提示：在舞台上拖动该角色调整位置
      </div>
      <div class="action-row" style="flex-wrap:wrap;">
        <label style="min-width:70px;">动作：</label>
        <div class="action-btns" style="display:flex; gap:6px; flex-wrap:wrap;">
          ${actionButtons}
        </div>
      </div>
      <div class="action-row">
        <label style="min-width:70px;">大小：</label>
        <input type="range" min="0.5" max="1.5" step="0.1" value="${actor.scale}" id="scaleSlider" style="flex:1; max-width:200px;">
        <span style="font-size:12px; color:#e8d9b8;">${actor.scale.toFixed(1)}x</span>
      </div>
      <div class="action-row">
        <label style="min-width:70px;">位置 X：</label>
        <input type="range" min="5" max="95" step="1" value="${Math.round(actor.x)}" id="xSlider" style="flex:1; max-width:200px;">
        <span style="font-size:12px; color:#e8d9b8;">${Math.round(actor.x)}%</span>
      </div>
      <div class="action-row">
        <label style="min-width:70px;">位置 Y：</label>
        <input type="range" min="10" max="90" step="1" value="${Math.round(actor.y)}" id="ySlider" style="flex:1; max-width:200px;">
        <span style="font-size:12px; color:#e8d9b8;">${Math.round(actor.y)}%</span>
      </div>
    </div>
  `;

  // 绑定动作按钮
  $$('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      actor.action = btn.dataset.action;
      renderActionEditor();
      renderStageActors();
    });
  });

  // 缩放滑块
  const scaleSlider = $('#scaleSlider');
  if (scaleSlider) {
    scaleSlider.addEventListener('input', (e) => {
      actor.scale = parseFloat(e.target.value);
      renderStageActors();
      const span = scaleSlider.nextElementSibling;
      if (span) span.textContent = actor.scale.toFixed(1) + 'x';
    });
  }

  // X 位置滑块
  const xSlider = $('#xSlider');
  if (xSlider) {
    xSlider.addEventListener('input', (e) => {
      actor.x = parseFloat(e.target.value);
      renderStageActors();
      const span = xSlider.nextElementSibling;
      if (span) span.textContent = Math.round(actor.x) + '%';
    });
  }

  // Y 位置滑块
  const ySlider = $('#ySlider');
  if (ySlider) {
    ySlider.addEventListener('input', (e) => {
      actor.y = parseFloat(e.target.value);
      renderStageActors();
      const span = ySlider.nextElementSibling;
      if (span) span.textContent = Math.round(actor.y) + '%';
    });
  }
}

// ========== 预览播放 ==========
function startPreview() {
  const previewStage = $('#previewStage');
  if (!previewStage) return;

  const scene = SHADOW_SCENES[AppState.selectedScene];
  if (scene) {
    previewStage.style.background = scene.bg;
  }

  const actorsDiv = $('#previewActors');
  actorsDiv.innerHTML = '';

  // 创建预览元素
  const previewElements = AppState.stageActors.map(actor => {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.left = actor.x + '%';
    el.style.top = actor.y + '%';
    el.style.transform = `translate(-50%, -50%) scale(${actor.scale})`;
    el.style.transition = 'transform 0.5s ease, left 1s ease, top 1s ease, opacity 0.5s';

    const svg = actor.type === 'character' ? getCharacterSVG(actor.charId) : getPropSVG(actor.charId);
    el.innerHTML = `<div style="filter: drop-shadow(2px 2px 8px rgba(0,0,0,0.5)); width: ${actor.type === 'character' ? '80px' : '60px'}; height: ${actor.type === 'character' ? '130px' : '90px'};">${svg}</div>`;
    actorsDiv.appendChild(el);

    return { element: el, actor: actor, baseX: actor.x, baseY: actor.y };
  });

  // 动画
  let startTime = null;
  const duration = AppState.duration * 1000;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = elapsed / duration;

    if (progress >= 1) {
      startTime = timestamp;
    }

    previewElements.forEach((pe, idx) => {
      const t = (elapsed / 1000) + idx;
      const action = pe.actor.action;
      let scale = pe.actor.scale;
      let offsetX = 0;
      let offsetY = 0;
      let rotate = 0;

      switch (action) {
        case 'idle':
          offsetY = Math.sin(t * 2) * 1;
          break;
        case 'walk':
          offsetX = Math.sin(t * 3) * 5;
          offsetY = Math.abs(Math.sin(t * 6)) * 2;
          break;
        case 'bow':
          rotate = Math.sin(t * 2) * 10;
          break;
        case 'dance':
          offsetX = Math.sin(t * 4) * 8;
          offsetY = Math.cos(t * 3) * 5;
          rotate = Math.sin(t * 3) * 15;
          break;
        case 'fight':
          offsetX = Math.sin(t * 8) * 10;
          rotate = Math.sin(t * 8) * 20;
          break;
        case 'talk':
          offsetY = Math.sin(t * 5) * 1.5;
          scale = pe.actor.scale * (1 + Math.sin(t * 5) * 0.03);
          break;
        case 'wave':
          offsetX = Math.sin(t * 4) * 3;
          rotate = Math.sin(t * 4) * 8;
          break;
        case 'jump':
          offsetY = -Math.abs(Math.sin(t * 2)) * 15;
          break;
      }

      const newX = pe.baseX + offsetX;
      const newY = pe.baseY + offsetY;
      pe.element.style.left = Math.max(5, Math.min(95, newX)) + '%';
      pe.element.style.top = Math.max(10, Math.min(90, newY)) + '%';
      pe.element.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`;
    });

    AppState.previewTimer = requestAnimationFrame(animate);
  }

  AppState.previewTimer = requestAnimationFrame(animate);

  // 渲染剧情文字
  renderStoryText();

  // 控制按钮
  const replayBtn = $('#btnReplay');
  const backBtn = $('#btnBackStage');
  const shareBtn = $('#btnShare');

  // 重置按钮事件
  const newReplay = replayBtn.cloneNode(true);
  const newBack = backBtn.cloneNode(true);
  const newShare = shareBtn.cloneNode(true);
  replayBtn.parentNode.replaceChild(newReplay, replayBtn);
  backBtn.parentNode.replaceChild(newBack, backBtn);
  shareBtn.parentNode.replaceChild(newShare, shareBtn);

  newReplay.addEventListener('click', () => {
    if (AppState.previewTimer) cancelAnimationFrame(AppState.previewTimer);
    startPreview();
  });
  newBack.addEventListener('click', () => switchScreen('stage'));
  newShare.addEventListener('click', () => {
    const text = '我在「皮影戏工坊」中创作了一段非遗皮影戏，快来体验吧！🎭';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('分享文案已复制到剪贴板！');
      }).catch(() => alert(text));
    } else {
      alert(text);
    }
  });
}

function renderStoryText() {
  const storyDiv = $('#previewStory');
  if (!storyDiv) return;

  // 生成剧情文字描述
  const actors = AppState.stageActors.filter(a => a.type === 'character');
  if (actors.length === 0) {
    storyDiv.innerHTML = '<p style="font-family:KaiTi, serif; color:#e8d9b8; text-align:center;">🎭 舞台上的皮影正随着灯光摇曳...</p>';
    return;
  }

  const descriptions = {
    'scholar': '书生手持诗书',
    'lady': '佳人翩翩起舞',
    'warrior': '将军威风凛凛',
    'immortal': '仙人仙风道骨',
    'clown': '丑角诙谐有趣',
    'princess': '公主雍容华贵'
  };

  const actionDesc = {
    'idle': '静静伫立',
    'walk': '缓步而行',
    'bow': '躬身作揖',
    'dance': '翩翩起舞',
    'fight': '奋勇而战',
    'talk': '娓娓而谈',
    'wave': '挥手致意',
    'jump': '轻盈跳跃'
  };

  let lines = [];
  actors.forEach(a => {
    const desc = descriptions[a.charId] || a.name;
    const act = actionDesc[a.action] || '演绎故事';
    lines.push(`${desc}，在幕布之后${act}。`);
  });

  storyDiv.innerHTML = `
    <div style="font-family:KaiTi, 'STKaiti', serif; font-size:16px; color:#e8d9b8; line-height:2.2; letter-spacing:2px;">
      🎭 戏幕拉开，灯影摇曳。<br/>
      ${lines.map(l => `　　${l}`).join('<br/>')}<br/>
      　　一出精彩的皮影戏正在上演，千年非遗，光影流传。
    </div>
  `;
}

// ========== 文化科普界面 ==========
function renderCultureCards() {
  const container = $('#cultureCards');
  container.innerHTML = '';
  CULTURE_CARDS.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'culture-card';
    cardEl.innerHTML = `
      <h3>${card.title}</h3>
      <div class="subtitle">${card.subtitle}</div>
      <p>${card.content}</p>
    `;
    container.appendChild(cardEl);
  });

  // 按钮
  const btn = $('#btnFromCultureStart');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = 'true';
    btn.addEventListener('click', () => switchScreen('select'));
  }
}

// ========== 音效系统（简单版） ==========
function playClickSound() {
  if (!AppState.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

// ========== 顶部导航 & 音效 ==========
function initTopBar() {
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const screen = btn.dataset.screen;
      if (screen === 'home') switchScreen('home');
      else if (screen === 'select') switchScreen('select');
      else if (screen === 'stage') switchScreen('stage');
      else if (screen === 'culture') switchScreen('culture');
    });
  });

  const soundToggle = $('#soundToggle');
  const soundIcon = $('#soundIcon');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      AppState.soundEnabled = !AppState.soundEnabled;
      soundIcon.textContent = AppState.soundEnabled ? '🔊' : '🔇';
    });
  }
}

// ========== 页面初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  initTopBar();
  initHome();
  initSelectScreen();
  initStageScreen();
  renderCultureCards();

  // 点击音效
  document.addEventListener('click', (e) => {
    if (e.target.matches('button, .card, .lib-item, .stage-actor, .action-btn')) {
      playClickSound();
    }
  });

  // 点击空白区域取消选中
  document.addEventListener('click', (e) => {
    if (AppState.currentScreen === 'stage') {
      const stage = $('#stageScene');
      const editor = $('#actionEditor');
      if (stage && !stage.contains(e.target) && editor && !editor.contains(e.target)) {
        // 不在舞台和动作编辑器中点击
        const sidebar = document.querySelector('.stage-sidebar');
        if (sidebar && !sidebar.contains(e.target)) {
          AppState.selectedActorId = null;
          renderStageActors();
          renderActionEditor();
        }
      }
    }
  });
});
