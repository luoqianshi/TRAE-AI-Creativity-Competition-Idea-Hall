/* ============================================================
 *  Meowdex · 主应用脚本
 *  状态机 + 路由 + 渲染 + 动效
 * ============================================================ */

(() => {
  'use strict';

  /* ---------- 状态 ---------- */
  const STORAGE_KEY = 'meowdex_v1';

  const initialState = () => ({
    coins:   PLAYER_SEED.coins,
    xp:      PLAYER_SEED.xp,
    hearts:  PLAYER_SEED.hearts,
    cans:    PLAYER_SEED.cans,
    tries:   PLAYER_SEED.tries,
    level:   PLAYER_SEED.level,
    name:    PLAYER_SEED.name,
    collected: [...PLAYER_SEED.collected],
    affection: { ...PLAYER_SEED.affection },
    sightings: PLAYER_SEED.sightings.map(s => ({ ...s })),
    pendingCatch: null,   // 当前识别到的猫
    activeTab: 'collection',
  });

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...initialState(), ...JSON.parse(raw) };
    } catch (_) {}
    return initialState();
  }
  function persist() {
    try {
      const { pendingCatch, activeTab, ...rest } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch (_) {}
  }
  function setState(patch) {
    state = { ...state, ...patch };
    persist();
  }

  /* ---------- 工具 ---------- */
  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const rand  = (a, b) => a + Math.random() * (b - a);
  const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);

  /* ---------- 真实猫咪图片（cataas.com） ---------- */
  /**
   * 生成一只猫的 <img> 标签
   * @param {Object} cat 来自 CATS_SEED
   * @param {string} pose 'sit' | 'walk' | 'lie'
   * @param {number} size 图片宽度（高度方形）
   * @param {string} shape 'square' | 'circle' | 'card' 容器形状
   */
  function catImg(cat, pose = 'sit', size = 400, shape = 'card') {
    if (!cat.cataasId) return catSVG(cat, pose);
    const url = cataasUrl(cat.cataasId, size, size);
    // 转义 cat.name 以防 XSS
    const safeName = String(cat.name).replace(/[<>&"']/g, c => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
    }[c]));
    // 用 dataset 携带 id + pose，加载失败时由全局 error 监听器替换为 SVG
    return `<img class="cat-photo cat-photo--${shape}" src="${url}" alt="${safeName}"
              loading="lazy" data-cat-id="${cat.id}" data-cat-pose="${pose}" />`;
  }

  /**
   * 全局兜底：任何 cat-photo 加载失败 → 替换为手绘 SVG
   * 用事件代理避免在 onerror 属性里塞长串 SVG（属性里的双引号极易出 bug）
   */
  function setupImageFallback() {
    document.addEventListener('error', (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      if (!img.classList.contains('cat-photo')) return;
      // 防止死循环
      img.onerror = null;
      img.removeAttribute('src');
      const catId = img.dataset.catId;
      const pose = img.dataset.catPose || 'sit';
      const cat = CATS_SEED.find(c => c.id === catId);
      if (!cat) return;
      // 用临时容器把 SVG 字符串转成真正的 DOM 节点
      const wrap = document.createElement('div');
      wrap.innerHTML = catSVG(cat, pose);
      const node = wrap.firstElementChild;
      if (node) {
        node.style.width = '100%';
        node.style.height = '100%';
        img.replaceWith(node);
      }
    }, true);  // capture 阶段才能捕获 img 的 error
  }

  /** 兼容旧接口：把猫渲染到容器里（用 <img>） */
  function renderCatInto(el, cat, pose = 'sit', size = 400, shape = 'card') {
    el.innerHTML = catImg(cat, pose, size, shape);
  }

  /* ---------- SVG 兜底（图片加载失败时使用） ---------- */
  function catSVG(cat, pose = 'sit') {
    const p = cat.palette;
    const body = p.body;
    const belly = p.belly;
    const accent = p.accent || '#2a1f17';
    const isTabby = cat.color.includes('tabby') || cat.color === 'ginger';
    const isTuxedo = cat.color === 'tuxedo';
    const isCalico = cat.color === 'calico';

    // 虎斑条纹
    const stripes = isTabby
      ? `<g opacity="0.32" stroke="${accent}" stroke-width="3" stroke-linecap="round" fill="none">
           <path d="M50 70 Q70 60 90 70" />
           <path d="M40 88 Q70 78 100 88" />
           <path d="M62 100 Q70 95 78 100" />
           <path d="M50 130 Q70 122 90 130" />
         </g>`
      : '';

    // 三花色块
    const calicoPatches = isCalico
      ? `<path d="M70 50 Q90 40 110 60 Q120 80 100 95 Q80 90 70 75 Z" fill="#2a1f17" opacity="0.85"/>
         <path d="M55 95 Q70 110 80 130 Q70 145 50 130 Q40 110 55 95 Z" fill="#fff" opacity="0.9"/>`
      : '';

    // 奶牛（tuxedo）白胸
    const tuxedo = isTuxedo
      ? `<path d="M55 110 Q70 100 85 110 Q90 130 80 145 Q70 152 60 145 Q50 130 55 110 Z" fill="#f4ecdb"/>`
      : '';

    // 姿势选择
    if (pose === 'walk') {
      return `
<svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g${cat.id}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${body}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${body}" stop-opacity="0.85"/>
    </radialGradient>
  </defs>
  <!-- 尾巴 -->
  <path d="M155 95 Q185 80 178 50 Q170 35 160 50" stroke="${body}" stroke-width="14" fill="none" stroke-linecap="round"/>
  <!-- 后腿 -->
  <ellipse cx="120" cy="135" rx="14" ry="20" fill="${body}"/>
  <ellipse cx="140" cy="138" rx="14" ry="18" fill="${body}"/>
  <!-- 身体 -->
  <ellipse cx="100" cy="110" rx="50" ry="32" fill="url(#g${cat.id})"/>
  ${stripes}
  <!-- 腹部 -->
  <ellipse cx="100" cy="125" rx="22" ry="14" fill="${belly}"/>
  <!-- 前腿 -->
  <ellipse cx="62" cy="138" rx="10" ry="18" fill="${body}"/>
  <ellipse cx="82" cy="142" rx="10" ry="18" fill="${body}"/>
  <!-- 头 -->
  <circle cx="55" cy="85" r="32" fill="${body}"/>
  <!-- 耳朵 -->
  <path d="M30 65 L25 35 L52 55 Z" fill="${body}"/>
  <path d="M80 65 L85 35 L58 55 Z" fill="${body}"/>
  <path d="M33 60 L31 45 L48 55 Z" fill="${accent}" opacity="0.3"/>
  <path d="M77 60 L79 45 L62 55 Z" fill="${accent}" opacity="0.3"/>
  <!-- 脸 -->
  ${tuxedo}
  <!-- 眼睛 -->
  <ellipse cx="42" cy="85" rx="3.5" ry="5" fill="${accent}"/>
  <ellipse cx="68" cy="85" rx="3.5" ry="5" fill="${accent}"/>
  <ellipse cx="42" cy="83" rx="1" ry="1.5" fill="#fff"/>
  <ellipse cx="68" cy="83" rx="1" ry="1.5" fill="#fff"/>
  <!-- 鼻子嘴 -->
  <path d="M53 95 L57 95 L55 99 Z" fill="#f4a48f"/>
  <path d="M55 99 Q50 105 47 102 M55 99 Q60 105 63 102" stroke="${accent}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <!-- 胡须 -->
  <g stroke="${accent}" stroke-width="1" stroke-linecap="round" opacity="0.5">
    <line x1="20" y1="98" x2="38" y2="96"/>
    <line x1="20" y1="103" x2="38" y2="100"/>
    <line x1="70" y1="96" x2="90" y2="98"/>
    <line x1="70" y1="100" x2="90" y2="103"/>
  </g>
  ${calicoPatches}
</svg>`;
    }

    if (pose === 'lie') {
      return `
<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
  <!-- 尾巴（卷曲） -->
  <path d="M170 90 Q185 70 175 55 Q165 50 160 60" stroke="${body}" stroke-width="13" fill="none" stroke-linecap="round"/>
  <!-- 身体（横躺） -->
  <ellipse cx="100" cy="90" rx="75" ry="28" fill="${body}"/>
  <ellipse cx="100" cy="100" rx="55" ry="14" fill="${belly}"/>
  ${stripes}
  <!-- 头 -->
  <circle cx="40" cy="70" r="28" fill="${body}"/>
  <!-- 耳朵 -->
  <path d="M22 50 L18 28 L42 50 Z" fill="${body}"/>
  <path d="M58 50 L62 28 L38 50 Z" fill="${body}"/>
  <path d="M24 47 L23 35 L37 48 Z" fill="${accent}" opacity="0.3"/>
  <path d="M56 47 L57 35 L43 48 Z" fill="${accent}" opacity="0.3"/>
  <!-- 眼睛（眯起） -->
  <path d="M28 70 Q33 74 38 70" stroke="${accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M44 70 Q49 74 54 70" stroke="${accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- 鼻子 -->
  <path d="M38 80 L42 80 L40 84 Z" fill="#f4a48f"/>
  <path d="M40 84 Q35 89 32 86 M40 84 Q45 89 48 86" stroke="${accent}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <!-- 爪子 -->
  <ellipse cx="148" cy="105" rx="10" ry="6" fill="${body}"/>
  <ellipse cx="165" cy="103" rx="9" ry="5" fill="${body}"/>
  ${calicoPatches}
</svg>`;
    }

    // sit (默认)
    return `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g${cat.id}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${body}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${body}" stop-opacity="0.85"/>
    </radialGradient>
  </defs>
  <!-- 尾巴 -->
  <path d="M150 130 Q180 110 175 70 Q170 50 158 70" stroke="${body}" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M150 130 Q180 110 175 70" stroke="${accent}" stroke-width="2" fill="none" opacity="0.3"/>
  <!-- 后腿（坐姿） -->
  <path d="M70 165 Q60 130 80 110 Q100 105 120 110 Q140 130 130 165 Z" fill="${body}"/>
  <!-- 身体 -->
  <ellipse cx="100" cy="140" rx="48" ry="42" fill="url(#g${cat.id})"/>
  <!-- 前腿 -->
  <ellipse cx="80" cy="172" rx="10" ry="14" fill="${body}"/>
  <ellipse cx="120" cy="172" rx="10" ry="14" fill="${body}"/>
  <!-- 腹部 -->
  <ellipse cx="100" cy="155" rx="22" ry="22" fill="${belly}"/>
  ${stripes}
  <!-- 头 -->
  <circle cx="100" cy="80" r="42" fill="${body}"/>
  <!-- 耳朵 -->
  <path d="M65 60 L55 22 L92 50 Z" fill="${body}"/>
  <path d="M135 60 L145 22 L108 50 Z" fill="${body}"/>
  <path d="M68 56 L62 32 L86 50 Z" fill="${accent}" opacity="0.3"/>
  <path d="M132 56 L138 32 L114 50 Z" fill="${accent}" opacity="0.3"/>
  ${tuxedo}
  ${calicoPatches}
  <!-- 眼睛 -->
  <ellipse cx="82" cy="80" rx="6" ry="9" fill="${accent}"/>
  <ellipse cx="118" cy="80" rx="6" ry="9" fill="${accent}"/>
  <ellipse cx="83" cy="76" rx="2" ry="3" fill="#fff"/>
  <ellipse cx="119" cy="76" rx="2" ry="3" fill="#fff"/>
  <!-- 鼻子嘴 -->
  <path d="M96 95 L104 95 L100 102 Z" fill="#f4a48f"/>
  <path d="M100 102 Q92 110 86 105 M100 102 Q108 110 114 105" stroke="${accent}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <!-- 胡须 -->
  <g stroke="${accent}" stroke-width="1" stroke-linecap="round" opacity="0.5">
    <line x1="50" y1="100" x2="78" y2="96"/>
    <line x1="50" y1="106" x2="78" y2="102"/>
    <line x1="122" y1="96" x2="150" y2="100"/>
    <line x1="122" y1="102" x2="150" y2="106"/>
  </g>
</svg>`;
  }

  /* ---------- 渲染：图鉴 ---------- */
  function renderCollection() {
    const grid = $('#collection-grid');
    grid.innerHTML = '';
    const tpl = $('#tpl-catcard');

    CATS_SEED.forEach((cat, i) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.style.animationDelay = `${i * 60}ms`;
      renderCatInto($('.catcard-cutout', node), cat, 'sit', 300, 'card');
      $('.catcard-name', node).textContent = cat.name;
      const aff = state.affection[cat.id] ?? 0;
      $('.catcard-affection-fill', node).style.width = `${aff}%`;
      if (state.pendingCatch === cat.id) {
        node.classList.add('is-new');
        // 翻入动画结束后清除标记
        setTimeout(() => { state.pendingCatch = null; persist(); }, 1200);
      }
      node.addEventListener('click', () => {
        location.hash = `#/cat/${cat.id}`;
      });
      grid.appendChild(node);
    });
  }

  function renderWatching() {
    $('#watching-count').textContent = Math.floor(2 + Math.random() * 3);
  }

  /* ---------- 渲染：猫咪档案 ---------- */
  function renderDetail(catId) {
    const cat = CATS_SEED.find(c => c.id === catId);
    if (!cat) { location.hash = '#/collection'; return; }
    const body = $('#detail-body');
    const aff = state.affection[cat.id] ?? 0;

    /* 解锁层级 */
    const stages = [
      { name: '路人',   min: 0,  icon: '👀' },
      { name: '熟人',   min: 30, icon: '🤝' },
      { name: '老朋友', min: 60, icon: '💛' },
      { name: '守护者', min: 90, icon: '👑' },
    ];
    const currentStage = stages.filter(s => aff >= s.min).pop();

    const infoCells = [
      { label: '昵称', value: cat.name, locked: false },
      { label: '毛色', value: cat.colorLabel, locked: aff < 30 },
      { label: '性格', value: cat.personality, locked: aff < 30 },
      { label: '常出没', value: cat.area, locked: aff < 60 },
      { label: '目击次数', value: `${cat.sightings + Math.floor(aff / 10)} 次`, locked: false },
      { label: '最近出现', value: cat.lastSeen, locked: aff < 60 },
    ];

    const photos = [
      { pose: 'sit' },
      { pose: 'walk' },
      { pose: 'lie' },
    ];

    body.innerHTML = `
      <section class="detail-hero">
        <div class="detail-hero-cutout">${catImg(cat, 'sit', 500, 'card')}</div>
        <h1 class="detail-name">${cat.name}</h1>
        <div class="detail-id">#${String(cat.sightings).padStart(5, '0')}</div>
        <div class="detail-tags">
          <span class="detail-tag">${cat.colorLabel}</span>
          <span class="detail-tag">${currentStage.icon} ${currentStage.name}</span>
          <span class="detail-tag">${cat.rarity}</span>
        </div>
      </section>

      <section class="aff-card">
        <div class="aff-head">
          <h3>亲密度</h3>
          <b>${aff}/100</b>
        </div>
        <div class="aff-bar"><span class="aff-bar-fill" style="width:${aff}%"></span></div>
        <div class="aff-stages">
          ${stages.map(s => `<span class="aff-stage ${aff >= s.min ? 'on' : ''}">${s.icon} ${s.name}</span>`).join('')}
        </div>
      </section>

      <div class="info-grid">
        ${infoCells.map(c => `
          <div class="info-cell ${c.locked ? 'locked' : ''}">
            <h4>${c.label}</h4>
            <p>${c.value}</p>
            ${c.locked ? '<span class="lock">🔒 亲密度解锁</span>' : ''}
          </div>
        `).join('')}
      </div>

      <h3 class="profile-h3" style="margin: 6px 4px 8px;">共拍到 ${photos.length} 张</h3>
      <div class="detail-photos">
        ${photos.map(ph => `<div class="detail-photo">${catImg(cat, ph.pose, 200, 'card')}</div>`).join('')}
      </div>

      <div class="fact-card">
        <h4>📖 猫的档案</h4>
        <p>${cat.fact}</p>
      </div>
    `;
  }

  /* ---------- 渲染：地图 ---------- */
  function renderMap() {
    const canvas = $('#map-canvas');
    canvas.innerHTML = '<div class="map-you" title="你在这里"></div>';
    const tpl = $('#tpl-mapdot');

    MAP_POINTS.forEach(pt => {
      const cat = CATS_SEED.find(c => c.id === pt.id);
      if (!cat) return;
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.style.left = pt.x + '%';
      node.style.top  = pt.y + '%';
      node.title = cat.name;
      node.addEventListener('click', () => {
        location.hash = `#/cat/${cat.id}`;
      });
      canvas.appendChild(node);
    });

    // 附近列表
    const list = $('#map-nearby-list');
    list.innerHTML = '';
    const tpl2 = $('#tpl-nearcard');
    const nearby = shuffle(MAP_POINTS).slice(0, 5);
    nearby.forEach(pt => {
      const cat = CATS_SEED.find(c => c.id === pt.id);
      const node = tpl2.content.firstElementChild.cloneNode(true);
      renderCatInto($('.nearcard-cutout', node), cat, 'sit', 200, 'card');
      $('.nearcard-name', node).textContent = cat.name;
      $('.nearcard-meta', node).textContent = `${cat.colorLabel} · ${cat.area.split(' / ')[0]}`;
      const dist = Math.floor(50 + Math.random() * 450);
      $('.nearcard-distance', node).textContent = `📍 ${dist}m`;
      node.addEventListener('click', () => {
        location.hash = `#/cat/${cat.id}`;
      });
      list.appendChild(node);
    });
    $('#nearby-count').textContent = nearby.length;
  }

  /* ---------- 渲染：Profile ---------- */
  function renderProfile() {
    $('#stat-coins').textContent  = state.coins;
    $('#stat-cans').textContent   = state.cans;
    $('#stat-hearts').textContent = state.hearts;
    $('#profile-name').textContent = state.name;
    $('#profile-collected').textContent = state.collected.length;
    $('#p-xp').textContent    = state.xp;
    $('#p-coins').textContent = state.coins;
    $('#p-cans').textContent  = state.cans;

    // 亲密度排行
    const aff = $('#affection-list');
    aff.innerHTML = '';
    const sorted = CATS_SEED.slice().sort((a, b) =>
      (state.affection[b.id] ?? 0) - (state.affection[a.id] ?? 0));
    const tpl = $('#tpl-catcard');
    sorted.slice(0, 5).forEach(cat => {
      const a = state.affection[cat.id] ?? 0;
      const node = document.createElement('div');
      node.className = 'aff-row';
      node.innerHTML = `
        <div class="aff-row-photo">${catImg(cat, 'sit', 120, 'card')}</div>
        <div class="aff-row-body">
          <div class="aff-row-name">${cat.name}</div>
          <div class="aff-row-bar"><span class="aff-row-fill" style="width:${a}%"></span></div>
        </div>
        <div class="aff-row-val">${a}</div>
      `;
      node.addEventListener('click', () => location.hash = `#/cat/${cat.id}`);
      aff.appendChild(node);
    });

    // 目击
    const sight = $('#sighting-list');
    sight.innerHTML = '';
    state.sightings.slice(0, 4).forEach(s => {
      const cat = CATS_SEED.find(c => c.id === s.id);
      if (!cat) return;
      const node = document.createElement('div');
      node.className = 'sight-row';
      node.innerHTML = `
        <div class="sight-icon">🐾</div>
        <div class="sight-body">
          <div class="sight-title">在「${s.place}」目击了 ${cat.name}</div>
          <div class="sight-time">${s.time} · ${cat.colorLabel}</div>
        </div>
      `;
      sight.appendChild(node);
    });
  }

  /* ---------- 相机：选择猫 + 投喂动画 + CAT FOUND ---------- */
  let cameraTargetCat = null;

  function pickRandomUncollectedOrAny() {
    // 优先未收集的，其次任意
    const uncollected = CATS_SEED.filter(c => !state.collected.includes(c.id));
    if (uncollected.length) return uncollected[Math.floor(Math.random() * uncollected.length)];
    return CATS_SEED[Math.floor(Math.random() * CATS_SEED.length)];
  }

  function openCameraWith(catId) {
    const cat = CATS_SEED.find(c => c.id === catId) ?? pickRandomUncollectedOrAny();
    cameraTargetCat = cat;
    const scene = $('#cam-cat');
    // 全屏背景图要够大，按手机实际尺寸请求（取 portrait 比例）
    renderCatInto(scene, cat, 'walk', 800, 'card');
  }

  function setupCamera() {
    // 关键：每次进入相机界面都把按钮的 pointer-events 恢复为 auto，
    // 避免上一轮 runCatchSequence 设了 none 后没有复位导致按钮永远点不到
    const catchBtn = $('#cam-catch-btn');
    catchBtn.style.pointerEvents = 'auto';
    catchBtn.style.opacity = '1';

    openCameraWith(null);

    // 重新绑定 click（用 onclick 避免多次进入时重复触发）
    catchBtn.onclick = () => {
      if (!cameraTargetCat) return;
      runCatchSequence(cameraTargetCat);
    };
  }

  function runCatchSequence(cat) {
    const stage   = $('#cam-stage');
    const can     = $('#can-projectile');
    const stars   = $('#stars-layer');
    const target  = $('#cam-target');
    const catchBtn = $('#cam-catch-btn');
    catchBtn.style.pointerEvents = 'none';

    // 1. 显示识别框
    target.hidden = false;

    // 2. 投罐头
    can.hidden = false;
    // 落点：屏幕中上部（猫的"身上"）
    const stageRect = stage.getBoundingClientRect();
    const targetX = 0;                           // 水平居中
    const targetY = stageRect.height * 0.42;    // 偏上 42%（猫身体位置）
    can.style.setProperty('--dx', `${targetX}px`);
    can.style.setProperty('--dy', `${targetY}px`);

    requestAnimationFrame(() => {
      can.classList.add('is-thrown');
    });

    // 3. 投出 700ms 后出星星
    setTimeout(() => {
      can.hidden = true;
      can.classList.remove('is-thrown');
      emitStars(stars, 14);
    }, 720);

    // 4. 1.4s 后弹 CAT FOUND
    setTimeout(() => {
      // 增加亲密度、金币、经验
      const oldAff = state.affection[cat.id] ?? 0;
      const newAff = clamp(oldAff + 10, 0, 100);
      const rewardXP = 100 + Math.floor(Math.random() * 60);
      const rewardCoin = 8 + Math.floor(Math.random() * 8);
      setState({
        coins: state.coins + rewardCoin,
        xp: state.xp + rewardXP,
        affection: { ...state.affection, [cat.id]: newAff },
        cans: Math.max(0, state.cans - 1),
        tries: Math.max(0, state.tries - 1),
      });
      // 入图鉴（首次）
      if (!state.collected.includes(cat.id)) {
        setState({ collected: [...state.collected, cat.id] });
      }
      // 加入目击
      const newSight = { id: cat.id, place: ['7号楼花坛','南门小卖部','中心花园','物业门口','北门快递柜'][Math.floor(Math.random()*5)], time: '刚刚' };
      const sightings = [newSight, ...state.sightings].slice(0, 8);
      setState({ sightings });
      // 保存 pendingCatch，让 Collection 翻入新卡
      setState({ pendingCatch: cat.id });

      showCatFound(cat, { rewardXP, rewardCoin });
    }, 1450);
  }

  function emitStars(host, count) {
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'star' + (Math.random() > 0.5 ? ' star--white' : '');
      s.textContent = '★';
      const x = rand(-60, 60);
      const y = rand(-40, -10);
      s.style.setProperty('--sx', x + 'px');
      s.style.setProperty('--sy', y + 'px');
      s.style.left = `calc(50% + ${x}px)`;
      s.style.top  = `calc(50% + ${y}px)`;
      s.style.animationDelay = (i * 50) + 'ms';
      host.appendChild(s);
      setTimeout(() => s.remove(), 1800);
    }
  }

  /* ---------- CAT FOUND 弹层 ---------- */
  function showCatFound(cat, rewards) {
    const ov = $('#overlay-catfound');
    renderCatInto($('#catfound-cutout'), cat, 'sit', 400, 'card');
    $('#catfound-name').textContent = cat.name;
    $('#catfound-tag').textContent  = cat.colorLabel;
    $('#catfound-tag2').textContent = cat.area.split(' / ')[0] + ' 常客';
    $('#catfound-id').textContent   = String(cat.sightings).padStart(6, '0');
    $$('.reward--xp b', ov)[0].textContent  = `+${rewards.rewardXP}`;
    $$('.reward--coin b', ov)[0].textContent = `+${rewards.rewardCoin}`;
    ov.hidden = false;

    $('#catfound-cta').onclick = () => {
      ov.hidden = true;
      // 恢复按钮可点（兜底：即使 setupCamera 还没跑到也保证可点）
      const cb = $('#cam-catch-btn');
      if (cb) { cb.style.pointerEvents = 'auto'; cb.style.opacity = '1'; }
      // 新猫 → 命名
      if (!cat.affection || (state.affection[cat.id] ?? 0) >= 90) {
        showName(cat, /*force*/ false);
      } else {
        location.hash = '#/collection';
      }
    };
    $('#catfound-skip').onclick = () => {
      ov.hidden = true;
      const cb = $('#cam-catch-btn');
      if (cb) { cb.style.pointerEvents = 'auto'; cb.style.opacity = '1'; }
      location.hash = '#/collection';
    };
  }

  function closeCatFound() {
    $('#overlay-catfound').hidden = true;
  }

  /* ---------- 命名弹层 ---------- */
  function showName(cat, force = false) {
    const ov = $('#overlay-name');
    renderCatInto($('#ov-name-photo'), cat, 'sit', 200, 'card');
    const input = $('#ov-name-input');
    input.value = '';
    const suggest = $('#ov-name-suggest');
    const pool = ['毛毛', '拿铁', '煎饼', '伯爵', '小凤', '条条', '奥丁', '雪团'];
    suggest.innerHTML = pool.slice(0, 5).map(n =>
      `<button class="ov-name-chip" type="button">${n}</button>`
    ).join('');
    $$('.ov-name-chip', suggest).forEach(b => {
      b.onclick = () => { input.value = b.textContent; };
    });
    ov.hidden = false;

    $('#ov-name-ok').onclick = () => {
      const v = input.value.trim() || cat.name;
      cat.name = v;       // 演示用：直接修改内存
      ov.hidden = true;
      location.hash = '#/collection';
    };
    $('#ov-name-skip').onclick = () => {
      ov.hidden = true;
      location.hash = '#/collection';
    };
  }

  /* ---------- 路由 ---------- */
  const screens = {
    splash:     $('.screen[data-screen="splash"]'),
    collection: $('.screen[data-screen="collection"]'),
    camera:     $('.screen[data-screen="camera"]'),
    detail:     $('.screen[data-screen="detail"]'),
    map:        $('.screen[data-screen="map"]'),
    profile:    $('.screen[data-screen="profile"]'),
    store:      $('.screen[data-screen="store"]'),
  };

  function showScreen(name) {
    Object.entries(screens).forEach(([k, el]) => {
      if (!el) return;
      el.hidden = (k !== name);
    });
    // 拍照/启动屏/弹层界面隐藏底部 Tab Bar
    const hideTabbar = (name === 'camera' || name === 'splash');
    $('#tabbar').classList.toggle('is-hidden', hideTabbar);
    state.activeTab = name === 'splash' ? state.activeTab : name;
  }

  function activateTab(tab) {
    $$('.tab', $('#tabbar')).forEach(b => {
      b.classList.toggle('is-active', b.dataset.tab === tab);
    });
  }

  function handleRoute() {
    const h = location.hash || '#/collection';
    closeCatFound();
    $('#overlay-name').hidden = true;

    if (h === '#/' || h === '' || h === '#/splash') {
      showScreen('splash');
      return;
    }
    if (h.startsWith('#/cat/')) {
      const id = h.replace('#/cat/', '');
      showScreen('detail');
      renderDetail(id);
      activateTab(null);
      return;
    }
    switch (h) {
      case '#/collection':
        showScreen('collection');
        renderCollection();
        renderWatching();
        activateTab('collection');
        break;
      case '#/camera':
        showScreen('camera');
        setupCamera();
        activateTab('camera');
        break;
      case '#/map':
        showScreen('map');
        renderMap();
        activateTab('map');
        break;
      case '#/profile':
        showScreen('profile');
        renderProfile();
        activateTab('profile');
        break;
      case '#/store':
        showScreen('store');
        activateTab('store');
        break;
      default:
        showScreen('collection');
        renderCollection();
        activateTab('collection');
    }
  }

  /* ---------- 事件绑定 ---------- */
  function bind() {
    // 启动屏按钮
    document.addEventListener('click', e => {
      const goEl = e.target.closest('[data-go]');
      if (goEl) {
        const target = goEl.dataset.go;
        location.hash = '#/' + target;
      }
    });

    // Tab 切换
    $$('.tab', $('#tabbar')).forEach(btn => {
      btn.addEventListener('click', () => {
        location.hash = '#/' + btn.dataset.tab;
      });
    });

    // 路由响应
    window.addEventListener('hashchange', handleRoute);
  }

  /* ---------- 启动 ---------- */
  function init() {
    setupImageFallback();  // 必须在首次 render 之前
    // 桌面端默认从 collection 起步
    if (!location.hash) location.hash = '#/collection';
    bind();
    handleRoute();
    // 重新拉一次以应用动画
    setTimeout(renderWatching, 15000);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
