/* ============================================================
   坏情绪粉碎机 v2.0 · 主逻辑
   ============================================================ */

(function () {
  'use strict';

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');
  const input = $('#worry-input');
  const sendBtn = $('#send-btn');
  const sendArrow = $('#send-arrow');
  const sendLabel = $('#send-label');
  const quickTags = $$('.quick-tag');
  const emptyHint = $('#empty-hint');
  const emptyEmoji = $('#empty-emoji');
  const emptyTitle = $('#empty-title');
  const emptyDesc = $('#empty-desc');
  const toastWrap = $('#toast-wrap');
  const crackLayer = $('#crack-layer');
  const redFlash = $('#red-flash');
  const reportModal = $('#report-modal');
  const reportCard = $('#report-card');
  const helpModal = $('#help-modal');
  const diaryModal = $('#diary-modal');
  const diaryWriteModal = $('#diary-write-modal');
  const diaryDetailModal = $('#diary-detail-modal');
  const modeNormalBtn = $('#mode-normal');
  const modeAngerBtn = $('#mode-anger');
  const brandTitle = $('#brand-title');
  const brandSub = $('#brand-sub');
  const btnReportText = $('#btn-report-text');
  const reportComfort = $('#rpt-comfort');
  const reportLetterText = $('#rpt-letter-text');

  // ---------- Tokens ----------
  const PALETTE = ['#FF6B9D', '#95E1D3', '#FFD93D', '#C4B5FD', '#93C5FD', '#FB923C', '#FCA5A5', '#86EFAC'];
  const CLOUD_COLORS = [
    { body: '#FFE4EC', shadow: '#FFC2D4', accent: '#FF6B9D' },
    { body: '#E0F8F2', shadow: '#A8E6D3', accent: '#10B981' },
    { body: '#FFF4D2', shadow: '#FFE08A', accent: '#F59E0B' },
    { body: '#EDE4FE', shadow: '#D4C5FD', accent: '#8B5CF6' },
    { body: '#E0F0FE', shadow: '#B5D5FE', accent: '#3B82F6' },
    { body: '#FFE4D2', shadow: '#FFC9A0', accent: '#F97316' },
  ];
  // 暴躁模式专属颜色
  const ANGER_COLORS = [
    { body: '#FF3030', shadow: '#8B0000', accent: '#FFFF00' },
    { body: '#FF6B35', shadow: '#7F0000', accent: '#FFE066' },
    { body: '#DC143C', shadow: '#4A0000', accent: '#FFA500' },
  ];

  // ---------- 文案 ----------
  const QUOTES = {
    heal: [
      '会好的，慢慢来 🍃',
      '你已经做得很好了 ✨',
      '没关系，允许自己丧一会儿',
      '今天的你已经尽力了',
      '抱抱你，云朵会守护你',
      '雨下完之后总会有彩虹',
      '情绪只是过客，你是归人',
      '给心放个假吧',
      '先把自己哄开心了再说',
      '你值得被温柔以待',
    ],
    roast: [
      '它不值得占用你的内存 🗑️',
      '此烦恼的有效期：3秒',
      '呼～ 吹走啦，下一个',
      '小情绪已签收：拒收',
      '烦恼被你点开了"不再提醒"',
      '它飘走了，头也不回',
      '这团乌云被你打包成快递退回了',
      '情绪看到你，吓跑了',
    ],
    self: [
      'emo 是门玄学，咱掌握得不错',
      '打工人的 emo 都是限量版',
      '今日份的"丧"配额已用完',
      '恭喜你又击败了一个坏情绪',
      '云朵说：你笑起来真好看',
      '你把烦恼捏成星星啦',
      '这也算一项技能吧',
    ],
    hype: [
      '下一个烦恼也没那么厉害 💪',
      '留着力气好好生活',
      '云朵替你挡过了一劫',
      '你的韧性，比云朵还软',
      '甩开它，你自由了',
      '今天的你比昨天更轻了一点',
    ],
    work: [
      '老板没看见，KPI 也没看见，emo 也没看见',
      '加班费没给够，但你给情绪空间了',
      '打工人，打工魂，情绪管理最动人',
      '周五的云朵比周一轻一些',
      '工资可能迟到，放空永不缺席',
      '你是你自己的 CEO，emo 是临时工',
    ],
    anger: [
      '🔥 炸了炸了！',
      '💥 轰！！！',
      '⚡ 灰飞烟灭！',
      '💢 给我消失！',
      '🌋 怒气值 -999',
      '💀 已被砸成粉末',
      '🪓 一刀两断！',
      '🧨 砰！',
      '👊 暴击！',
      '⚔️ 斩！',
    ],
    angerRoast: [
      '这坨烂情绪：扑街',
      '它被你打成了粒子态',
      '撒气完毕，再来一个？',
      '老板看见都瑟瑟发抖',
      '生活：我要弄死你 你：先弄死这朵云',
      '气到云朵都要搬家了',
      '碎屏？没问题，再来！',
      '你比云朵硬多了',
    ],
  };

  // 暴躁模式自动填充的烦恼池（按场景分类）
  const ANGER_POOL = {
    work: [
      '加班到死', 'KPI 压垮', '改需求！', '老板画饼', '会议马拉松',
      'PPT 第八版', '背黑锅', '甲方是爷', '复盘会复盘', '周报写了 3 小时',
      '工资没涨', '同事内卷', '被抢功', '返工返工', 'deadline 是命',
    ],
    life: [
      '早起打卡', '堵车迟到', '外卖超时', '快递丢了', '网又崩了',
      '电费暴涨', '房租又涨', '空调坏了', '被门夹了', '蚊子咬了 8 个包',
      '闹钟没响', '忘带钥匙', '手机没电', '健身卡过期', '牙膏挤歪了',
    ],
    emotion: [
      'emo 了', '想哭', '破防了', '委屈', '焦虑爆表',
      '睡不着', '想家', '一个人好累', '被误解', '心好累',
      '生气！', '气炸了', '烦死了', '滚！', '去他的',
    ],
    random: [
      '我就是不开心', '今天很不爽', '想骂人', '谁来救救我',
      '够了够了', '我真的会谢', '破防破防破防', '毁灭吧赶紧的',
    ],
  };

  function getRandomAnger() {
    // 混合多个池
    const pools = Object.values(ANGER_POOL);
    const pool = pools[Math.floor(Math.random() * pools.length)];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // 温柔安慰文库（按情绪阶段分层）
  const COMFORT_LINES = {
    // 通用安慰
    general: [
      '你已经把那些不开心，<strong>全部炸得稀烂</strong>了。',
      '屏幕上的裂纹是你勇敢的痕迹，<strong>每一条都算数</strong>。',
      '没关系的。生气的时候，就<strong>允许自己生气</strong>。',
      '今天的你，<strong>很用力地活过</strong>了。',
      '把坏情绪都交出来，<strong>你已经做得很好了</strong>。',
      '砸碎它们之后，<strong>你的心就能空出位置</strong>。',
      '没有人规定你必须一直温柔，<strong>偶尔爆一下也没关系</strong>。',
      '<strong>你值得被这个世界温柔以待</strong>，哪怕它现在有点糟糕。',
      '那些让你抓狂的事，<strong>不会永远在那里</strong>。',
      '承认自己不好过，<strong>也是一种强大</strong>。',
    ],
    // 释放感
    release: [
      '看到没，<strong>再难的事，扛过去了就那么回事</strong>。',
      '刚才的每一拳，<strong>都替你的委屈出了气</strong>。',
      '怒气被你打成烟花，<strong>现在可以轻轻呼一口气了</strong>。',
      '今天的你，<strong>手撕了 100 个坏情绪</strong>。',
      '<strong>云朵被你戳爆，裂纹被你撕开</strong>，还有什么是搞不定的？',
      '你不是没有脾气，<strong>你只是把它们都用在了对的地方</strong>。',
    ],
    // 温柔劝解
    soothe: [
      '现在请你把肩膀放下来，<strong>深深呼一口气</strong>。',
      '把手机放在胸口，<strong>感受自己还在跳动的心</strong>。',
      '窗外有一阵风经过，<strong>它带走了刚才的碎屑</strong>。',
      '喝口水，<strong>让身体记得活着的感觉</strong>。',
      '今天的烂事，<strong>交给今天</strong>。明天再说。',
      '你最需要的，<strong>不是再努力一点，是再休息一点</strong>。',
    ],
    // 鼓励
    encourage: [
      '如果累了，<strong>就停下来</strong>。没人敢催你。',
      '你比自己以为的，<strong>强了不止一点点</strong>。',
      '不管今天发生了什么，<strong>你依然是独一无二的那个</strong>。',
      '这个世界很烂，<strong>但你不必跟着烂下去</strong>。',
      '能发泄出来，<strong>本身就是一种能力</strong>。',
      '<strong>你不是一个人在战斗</strong>，有这么多云朵陪着你。',
    ],
  };

  // 致你的一封信（随机一段）
  const LETTERS = [
    '你不是没有情绪，你只是习惯把柔软藏在最里面。今晚，请允许自己柔软一下。',
    '生活的难，从来不是因为你不够好，而是它本来就不容易。别再苛责自己了。',
    '你已经撑过那么多难熬的时刻了，这一次也一定会过去。我信你。',
    '允许自己停下来。允许自己不想努力。允许自己今天什么都不做。',
    '你不是一个人在夜里崩溃过，每个人都有过。你只是比别人更懂得去消化它。',
    '世界有时候会让人喘不过气，但请记得，你始终有选择：选择对自己好一点点。',
    '别再问"我是不是不够好"了。你已经很好了。是这个世界有时候太难。',
    '把那些在意你的人放心上，把不在意你的人，从今天开始，慢慢放下。',
    '今天的你很努力。虽然没人看见，但我看见了。',
    '无论多晚，都请你温柔对待那个还在熬夜的自己。',
  ];

  // ---------- 状态 ----------
  const state = {
    mode: 'normal',   // normal | anger
    clouds: [],
    particles: [],
    floaters: [],
    bombs: [],        // 暴躁模式震屏用
    count: window.MCStore.getCount(),
    today: window.MCStore.getToday(),
    combo: 0,
    comboTimer: null,
    startedAt: Date.now(),
    currentMood: '🌤️',
    sessionStart: Date.now(),
  };

  // ---------- Audio ----------
  let audioCtx = null;
  function getAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* noop */ }
    }
    return audioCtx;
  }
  function playPop(combo) {
    const ac = getAudio(); if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    const base = 520 + Math.min(combo || 1, 10) * 30;
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 1.4, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(base * 0.6, t + 0.18);
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    osc.start(t); osc.stop(t + 0.3);
  }
  function playWhoosh() {
    const ac = getAudio(); if (!ac) return;
    const t = ac.currentTime;
    const bufferSize = ac.sampleRate * 0.3;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.3);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    noise.connect(filter); filter.connect(gain); gain.connect(ac.destination);
    noise.start(t); noise.stop(t + 0.3);
  }
  function playBoom() {
    // 暴躁模式爆裂音
    const ac = getAudio(); if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.start(t); osc.stop(t + 0.4);
    // 噪音
    const bufferSize = ac.sampleRate * 0.3;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const ng = ac.createGain();
    ng.gain.setValueAtTime(0.15, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    noise.connect(ng); ng.connect(ac.destination);
    noise.start(t); noise.stop(t + 0.3);
  }
  function playAngerLoop() {
    // 暴躁模式持续低音
    if (state.mode !== 'anger') return;
    const ac = getAudio(); if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.value = 60;
    gain.gain.setValueAtTime(0.05, t);
    osc.start(t);
    setTimeout(() => { gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.3); osc.stop(ac.currentTime + 0.35); }, 1500);
  }

  // ---------- Canvas ----------
  let DPR = window.devicePixelRatio || 1;
  let W = 0, H = 0;
  function resizeCanvas() {
    DPR = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ---------- Floaters ----------
  function spawnFloater() {
    const emojis = ['✦', '✧', '◦', '○', '·', '◌', '✿', '❀'];
    state.floaters.push({
      x: Math.random() * W,
      y: H + 20,
      vy: -(0.2 + Math.random() * 0.3),
      vx: (Math.random() - 0.5) * 0.2,
      size: 8 + Math.random() * 14,
      alpha: 0.12 + Math.random() * 0.22,
      text: emojis[Math.floor(Math.random() * emojis.length)],
      color: state.mode === 'anger' ? '#FFD93D' : PALETTE[Math.floor(Math.random() * PALETTE.length)],
      life: 1,
    });
  }
  setInterval(spawnFloater, state.mode === 'anger' ? 300 : 600);
  for (let i = 0; i < 8; i++) setTimeout(spawnFloater, i * 100);

  // ---------- Cloud ----------
  class Cloud {
    constructor(text, x, y) {
      this.text = text || '';
      this.x = x;
      this.y = y;
      this.targetY = y;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = 0;
      this.r = 18;
      this.isAnger = state.mode === 'anger';
      this.color = this.isAnger
        ? ANGER_COLORS[Math.floor(Math.random() * ANGER_COLORS.length)]
        : CLOUD_COLORS[Math.floor(Math.random() * CLOUD_COLORS.length)];
      this.face = this.isAnger ? { eyes: 'angry', mouth: 'angry' } : pickFace(this.text);
      this.life = 1;
      this.wobble = Math.random() * Math.PI * 2;
      this.bornAt = Date.now();
    }
    update(dt) {
      this.wobble += dt * 2;
      this.y += (this.targetY - this.y) * 0.02;
      this.x += this.vx + Math.sin(this.wobble) * 0.15;
      this.vy += 0.005;
      this.vx *= 0.99;
      if (this.x < 60) this.x = 60;
      if (this.x > W - 60) this.x = W - 60;
      if (this.y > H - 60) this.y = H - 60;
    }
    draw() {
      const p = Math.min(1, (Date.now() - this.bornAt) / 380);
      const ease = 1 - Math.pow(1 - p, 3);
      const scale = 0.6 + 0.4 * ease + Math.sin(this.wobble) * 0.015;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(scale, scale);

      drawPixelCloud(0, 0, this.color);
      drawFace(0, -2, this.face, this.color.accent);

      if (this.text) {
        ctx.font = '500 12px Outfit, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const textW = ctx.measureText(this.text).width;
        const padX = 8, padY = 4;
        const ty = 26;
        ctx.fillStyle = this.isAnger ? 'rgba(20, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.92)';
        roundRect(ctx, -textW / 2 - padX, ty, textW + padX * 2, 20, 6);
        ctx.fill();
        ctx.strokeStyle = this.color.accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = this.isAnger ? '#FFE066' : '#2D2D44';
        ctx.fillText(this.text, 0, ty + padY);
      }

      ctx.restore();
    }
  }

  function pickFace(text) {
    const t = (text || '').toLowerCase();
    if (!t) return { eyes: 'dot', mouth: 'smile' };
    if (/(累|丧|emo|哭|难过|委屈|down)/.test(t)) return { eyes: 'sad', mouth: 'frown' };
    if (/(怒|气|烦|滚|恨|草|fxxk|shit)/.test(t)) return { eyes: 'angry', mouth: 'angry' };
    if (/(焦虑|紧张|怕|慌|deadline|kpi)/.test(t)) return { eyes: 'wide', mouth: 'small' };
    if (/(哈哈|开心|快乐|好|棒|爱|赞|nice|happy)/.test(t)) return { eyes: 'happy', mouth: 'smile' };
    return { eyes: 'dot', mouth: 'flat' };
  }

  function drawPixelCloud(cx, cy, color) {
    const s = 3;
    const shape = [
      '  11111  ',
      ' 1111111 ',
      '111111111',
      '111111111',
    ];
    const w = shape[0].length * s;
    const h = shape.length * s;
    const ox = -w / 2;
    const oy = -h / 2 + 2;

    ctx.fillStyle = color.shadow;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === '1') ctx.fillRect(ox + c * s + 2, oy + r * s + 2, s, s);
      }
    }
    ctx.fillStyle = color.body;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === '1') ctx.fillRect(ox + c * s, oy + r * s, s, s);
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let r = 0; r < 2; r++) {
      for (let c = 1; c < 4; c++) {
        if (shape[r] && shape[r][c] === '1') ctx.fillRect(ox + c * s, oy + r * s, s, s);
      }
    }
    ctx.fillStyle = color.accent;
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[0][c] === '1') ctx.fillRect(ox + c * s, oy - 1, s, 1);
    }
  }

  function drawFace(cx, cy, face, accent) {
    const s = 2;
    const offY = -1;
    ctx.fillStyle = '#2D2D44';
    if (face.eyes === 'dot') {
      ctx.fillRect(cx - 6, cy + offY, s, s);
      ctx.fillRect(cx + 4, cy + offY, s, s);
    } else if (face.eyes === 'sad') {
      ctx.fillRect(cx - 7, cy + offY + 1, 3, 1);
      ctx.fillRect(cx + 4, cy + offY + 1, 3, 1);
    } else if (face.eyes === 'happy') {
      ctx.fillRect(cx - 7, cy + offY + 1, 2, 1);
      ctx.fillRect(cx - 6, cy + offY, 1, 1);
      ctx.fillRect(cx + 5, cy + offY + 1, 2, 1);
      ctx.fillRect(cx + 5, cy + offY, 1, 1);
    } else if (face.eyes === 'angry') {
      ctx.fillRect(cx - 7, cy + offY, 1, 1);
      ctx.fillRect(cx - 6, cy + offY + 1, 2, 1);
      ctx.fillRect(cx + 4, cy + offY, 1, 1);
      ctx.fillRect(cx + 4, cy + offY + 1, 2, 1);
    } else if (face.eyes === 'wide') {
      ctx.fillRect(cx - 6, cy + offY - 1, 2, 3);
      ctx.fillRect(cx + 4, cy + offY - 1, 2, 3);
    }

    ctx.fillStyle = '#2D2D44';
    if (face.mouth === 'smile') {
      ctx.fillRect(cx - 2, cy + offY + 4, 5, 1);
      ctx.fillRect(cx - 3, cy + offY + 5, 1, 1);
      ctx.fillRect(cx + 3, cy + offY + 5, 1, 1);
    } else if (face.mouth === 'frown') {
      ctx.fillRect(cx - 3, cy + offY + 5, 1, 1);
      ctx.fillRect(cx + 3, cy + offY + 5, 1, 1);
      ctx.fillRect(cx - 2, cy + offY + 6, 5, 1);
    } else if (face.mouth === 'flat') {
      ctx.fillRect(cx - 2, cy + offY + 4, 5, 1);
    } else if (face.mouth === 'small') {
      ctx.fillRect(cx - 1, cy + offY + 4, 3, 1);
    } else if (face.mouth === 'angry') {
      ctx.fillRect(cx - 3, cy + offY + 4, 7, 1);
      ctx.fillRect(cx - 2, cy + offY + 5, 5, 1);
    }

    ctx.fillStyle = 'rgba(255, 107, 157, 0.45)';
    ctx.fillRect(cx - 9, cy + offY + 3, 3, 1);
    ctx.fillRect(cx + 6, cy + offY + 3, 3, 1);
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  // ---------- Particle ----------
  class Particle {
    constructor(x, y, opts = {}) {
      this.x = x; this.y = y;
      const angle = opts.angle !== undefined ? opts.angle : Math.random() * Math.PI * 2;
      const speed = opts.speed || (2 + Math.random() * 5);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 1;
      this.gravity = 0.12;
      this.size = opts.size || (3 + Math.random() * 4);
      this.color = opts.color || PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.life = 1;
      this.decay = 0.012 + Math.random() * 0.012;
      this.rotation = Math.random() * Math.PI;
      this.rotSpeed = (Math.random() - 0.5) * 0.25;
      this.shape = opts.shape || (Math.random() < 0.4 ? 'star' : (Math.random() < 0.5 ? 'square' : 'circle'));
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.vx *= 0.99;
      this.rotation += this.rotSpeed;
      this.life -= this.decay;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      if (this.shape === 'square') {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      } else if (this.shape === 'star') {
        drawStar(0, 0, this.size * 1.2, this.size * 0.5, 4);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
  function drawStar(cx, cy, R, r, n) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const rad = i % 2 === 0 ? R : r;
      const a = (i * Math.PI) / n - Math.PI / 2;
      const x = cx + Math.cos(a) * rad;
      const y = cy + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  // ---------- Burst ----------
  function burst(x, y, cloudColor) {
    const count = state.mode === 'anger' ? 60 : 36;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      state.particles.push(new Particle(x, y, {
        angle,
        speed: state.mode === 'anger' ? (3 + Math.random() * 7) : (2 + Math.random() * 5),
        color: state.mode === 'anger'
          ? (Math.random() < 0.5 ? cloudColor.accent : ['#FFD93D', '#FF6B35', '#FF3030', '#FFE066'][Math.floor(Math.random() * 4)])
          : (Math.random() < 0.5 ? cloudColor.accent : PALETTE[Math.floor(Math.random() * PALETTE.length)]),
      }));
    }
    for (let i = 0; i < (state.mode === 'anger' ? 10 : 5); i++) {
      state.particles.push(new Particle(x, y, {
        angle: Math.random() * Math.PI * 2,
        speed: 1 + Math.random() * 2,
        size: 8 + Math.random() * 6,
        shape: 'star',
        color: cloudColor.accent,
        decay: 0.015,
      }));
    }
  }

  // ---------- Crack screen ----------
  function showCrack() {
    if (state.mode !== 'anger') return;
    crackLayer.innerHTML = generateCrackSVG();
    crackLayer.classList.remove('show');
    void crackLayer.offsetWidth;
    crackLayer.classList.add('show');
  }
  function generateCrackSVG() {
    const w = window.innerWidth, h = window.innerHeight;
    const cx = w * (0.3 + Math.random() * 0.4);
    const cy = h * (0.3 + Math.random() * 0.4);
    const lines = [];
    const segs = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < segs; i++) {
      const angle = (i / segs) * Math.PI * 2 + Math.random() * 0.5;
      const len = 80 + Math.random() * 220;
      const x2 = cx + Math.cos(angle) * len;
      const y2 = cy + Math.sin(angle) * len;
      // 折线
      const midX = (cx + x2) / 2 + (Math.random() - 0.5) * 60;
      const midY = (cy + y2) / 2 + (Math.random() - 0.5) * 60;
      lines.push(`<polyline points="${cx},${cy} ${midX},${midY} ${x2},${y2}" stroke="white" stroke-width="2" fill="none" opacity="0.9"/>`);
      // 分支
      const branches = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < branches; j++) {
        const t = 0.3 + Math.random() * 0.5;
        const sx = cx + (x2 - cx) * t;
        const sy = cy + (y2 - cy) * t;
        const bAng = angle + (Math.random() - 0.5) * 1.5;
        const bLen = 20 + Math.random() * 60;
        const ex = sx + Math.cos(bAng) * bLen;
        const ey = sy + Math.sin(bAng) * bLen;
        lines.push(`<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="white" stroke-width="1.5" fill="none" opacity="0.7"/>`);
      }
    }
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${lines.join('')}</svg>`;
  }
  function flashRed() {
    if (state.mode !== 'anger') return;
    redFlash.classList.remove('flash');
    void redFlash.offsetWidth;
    redFlash.classList.add('flash');
  }
  function shakeScreen(hard) {
    document.body.classList.remove('anger-shake', 'anger-shake-hard');
    void document.body.offsetWidth;
    document.body.classList.add(hard ? 'anger-shake-hard' : 'anger-shake');
    setTimeout(() => document.body.classList.remove('anger-shake', 'anger-shake-hard'), 650);
  }

  // ---------- Add worry ----------
  function addWorry(text) {
    text = (text || '').trim().slice(0, 40);
    if (!text) return;
    if (state.clouds.length >= 12) {
      showToast('云朵太多啦，先戳几个再扔 ⛅');
      return;
    }
    const margin = 80;
    const cx = margin + Math.random() * Math.max(80, W - margin * 2);
    const cy = 80 + Math.random() * Math.max(80, H * 0.55);
    const cloud = new Cloud(text, cx, H + 60);
    cloud.targetY = cy;
    state.clouds.push(cloud);
    emptyHint.classList.add('hide');
    playWhoosh();

    if (state.count === 0 && state.clouds.length === 1) {
      setTimeout(() => showToast(state.mode === 'anger' ? '点击炸弹！轰！！！' : '点击云朵，戳破它 ✨', state.mode === 'anger' ? 'anger' : 'accent'), 600);
    }
  }

  // ---------- Hit test ----------
  function getHit(x, y) {
    for (let i = state.clouds.length - 1; i >= 0; i--) {
      const c = state.clouds[i];
      const dx = x - c.x, dy = y - c.y - 4;
      if (Math.abs(dx) < 50 && Math.abs(dy) < 40) return c;
    }
    return null;
  }

  // ---------- Pop ----------
  function popCloud(cloud, silent) {
    const idx = state.clouds.indexOf(cloud);
    if (idx < 0) return;
    state.clouds.splice(idx, 1);

    const isAnger = state.mode === 'anger';

    // 爆炸
    burst(cloud.x, cloud.y, cloud.color);
    if (isAnger) {
      playBoom();
      // 批量清空时只震一次（外部已震）
      if (!silent) {
        shakeScreen(state.combo >= 3);
        flashRed();
        if (state.count % 2 === 0) showCrack();
      }
    } else {
      playPop(state.combo + 1);
    }

    // 计数 + 存储
    state.count += 1;
    state.today += 1;
    window.MCStore.incCount(1);
    window.MCStore.addBurstItem(cloud.text, isAnger ? 'anger' : null);
    updateStats();

    // 连击
    state.combo += 1;
    clearTimeout(state.comboTimer);
    state.comboTimer = setTimeout(() => { state.combo = 0; updateStats(); }, isAnger ? 3000 : 2200);

    // Toast 文案（批量清空时不显示）
    if (!silent) {
      let quote;
      if (isAnger) {
        const pool = Math.random() < 0.6 ? QUOTES.anger : QUOTES.angerRoast;
        quote = pool[Math.floor(Math.random() * pool.length)];
      } else {
        const quoteType = pickQuoteType(cloud.text);
        const pool = QUOTES[quoteType];
        quote = pool[Math.floor(Math.random() * pool.length)];
      }
      const comboStr = state.combo > 1 ? ` · <span class="accent-text">${state.combo} 连击！</span>` : '';
      showToast(quote + comboStr, isAnger ? 'anger' : 'accent');
    }

    // 情绪分析（仅非暴躁模式 且非批量）
    if (!isAnger && !silent) {
      try {
        const a = window.MCAnalyzer.analyze(cloud.text);
        if (a.dominant) state.currentMood = a.dominant.emoji;
        $('#stat-mood').textContent = state.currentMood;
      } catch (e) { /* noop */ }
    } else if (isAnger && !silent) {
      state.currentMood = '💥';
      $('#stat-mood').textContent = state.currentMood;
    }

    // 5 个庆祝（仅在非批量时）
    if (!silent && state.count % 5 === 0) {
      setTimeout(() => {
        const msg = isAnger ? `已砸烂 ${state.count} 个！继续发泄 💥` : `已放空 ${state.count} 个坏情绪，你太棒了 🎉`;
        showToast(msg, isAnger ? 'anger' : 'accent');
      }, 1000);
    }
  }
  function pickQuoteType(text) {
    const t = (text || '').toLowerCase();
    if (!t) return Math.random() < 0.5 ? 'heal' : 'hype';
    if (/(累|丧|emo|哭|难过|委屈|down|不开心|抑郁)/.test(t)) return 'heal';
    if (/(怒|气|烦|滚|恨|草|傻|滚蛋|去死)/.test(t)) return 'roast';
    if (/(加班|工作|老板|kpi|deadline|ddl|ppt|周报|会议)/.test(t)) return 'work';
    if (/(哈哈|开心|快乐|好|棒|爱|赞|谢谢|nice)/.test(t)) return 'hype';
    return Math.random() < 0.4 ? 'heal' : (Math.random() < 0.5 ? 'self' : 'hype');
  }

  // ---------- Stats UI ----------
  function updateStats() {
    $('#stat-count').textContent = state.count;
    $('#stat-diary').textContent = window.MCStore.getDiaries().length;
    $('#stat-streak').textContent = parseInt(localStorage.getItem('mc_streak') || '0', 10);
  }

  // ---------- Toast ----------
  function showToast(html, type) {
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'anger' ? ' anger' : '');
    el.innerHTML = html;
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 300);
    }, 2200);
  }

  // ---------- Input ----------
  sendBtn.addEventListener('click', () => {
    if (state.mode === 'anger') {
      // 暴躁模式：直接添加 1-3 个随机炸弹
      const n = 1 + Math.floor(Math.random() * 3);
      quickBurst(n);
      return;
    }
    const v = input.value;
    if (!v.trim()) {
      showToast('写点啥再扔吧 ✏️', 'accent');
      input.focus();
      return;
    }
    addWorry(v);
    input.value = '';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendBtn.click(); }
  });
  quickTags.forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.tag;
      sendBtn.click();
    });
  });

  // 长按 send 按钮：持续生成炸弹（暴躁模式专属）
  let angerHoldTimer = null;
  let angerHoldInterval = null;
  function startAngerHold() {
    if (state.mode !== 'anger') return;
    // 立即加几个
    quickBurst(3);
    // 持续喷
    angerHoldTimer = setTimeout(() => {
      angerHoldInterval = setInterval(() => {
        quickBurst(2);
      }, 200);
    }, 400);
  }
  function stopAngerHold() {
    clearTimeout(angerHoldTimer);
    clearInterval(angerHoldInterval);
    angerHoldTimer = null;
    angerHoldInterval = null;
  }
  sendBtn.addEventListener('mousedown', startAngerHold);
  sendBtn.addEventListener('mouseup', stopAngerHold);
  sendBtn.addEventListener('mouseleave', stopAngerHold);
  sendBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startAngerHold();
    // 同时处理 touch 的 click
    if (state.mode === 'anger') e.stopPropagation();
  }, { passive: false });
  sendBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopAngerHold();
  });

  // ---------- Canvas click ----------
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
  }
  function handleHit(e) {
    const { x, y } = getPos(e);
    const hit = getHit(x, y);
    if (hit) popCloud(hit);
  }
  canvas.addEventListener('click', handleHit);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleHit(e); }, { passive: false });

  // ---------- Mode switch ----------
  function setMode(mode) {
    if (state.mode === mode) return;
    state.mode = mode;
    if (mode === 'anger') {
      document.body.classList.add('anger-mode');
      modeNormalBtn.classList.remove('active');
      modeAngerBtn.classList.add('active');
      sendArrow.textContent = '💥';
      sendLabel.textContent = '一键发泄';
      emptyEmoji.textContent = '💣';
      emptyTitle.textContent = '全部炸开！';
      emptyDesc.innerHTML = '按住 <strong style="color:#FFE066">「一键发泄」</strong> 火力全开<br>戳破每个红色炸弹 💥';
      // 隐藏输入框与快捷标签
      input.parentElement.style.display = 'none';
      $('#quick-tags').style.display = 'none';
      // 底部按钮变成「清空发泄」
      btnReportText.textContent = '清空发泄';
      // 清掉之前普通模式的云朵，全部换成红色炸弹
      state.clouds = [];
      // 自动铺满炸弹！
      autoFillAnger(8);
      playAngerLoop();
      shakeScreen(false);
      flashRed();
      setTimeout(() => { showToast('🔥 暴躁模式！直接开炸！', 'anger'); }, 300);
    } else {
      document.body.classList.remove('anger-mode');
      modeAngerBtn.classList.remove('active');
      modeNormalBtn.classList.add('active');
      sendArrow.textContent = '↗';
      sendLabel.textContent = '扔出去';
      emptyEmoji.textContent = '☁️';
      emptyTitle.textContent = '把烦恼扔进云朵里';
      emptyDesc.innerHTML = '写下你此刻的小情绪<br>云朵会替你暂时保管，直到被你戳破 ✨';
      // 显示输入框
      input.parentElement.style.display = '';
      $('#quick-tags').style.display = '';
      // 恢复按钮文案
      btnReportText.textContent = '今日发泄';
      // 暴躁模式的云朵全部清掉
      state.clouds = state.clouds.filter(c => !c.isAnger);
      if (state.clouds.length === 0) emptyHint.classList.remove('hide');
      showToast('☁️ 已回到治愈模式', 'accent');
    }
  }
  modeNormalBtn.addEventListener('click', () => setMode('normal'));
  modeAngerBtn.addEventListener('click', () => setMode('anger'));

  // 暴躁模式自动填充 N 个炸弹
  function autoFillAnger(n) {
    const usedTexts = new Set(state.clouds.map(c => c.text));
    let added = 0;
    let tries = 0;
    while (added < n && tries < n * 4) {
      tries++;
      let text = getRandomAnger();
      // 避免重复
      if (usedTexts.has(text)) continue;
      usedTexts.add(text);
      const margin = 70;
      const cx = margin + Math.random() * Math.max(80, W - margin * 2);
      const cy = 70 + Math.random() * Math.max(60, H * 0.55);
      const cloud = new Cloud(text, cx, H + 60);
      cloud.targetY = cy;
      state.clouds.push(cloud);
      added++;
    }
    emptyHint.classList.add('hide');
  }

  // 一键发泄：批量添加 1-3 个炸弹
  function quickBurst(count) {
    count = count || 1;
    autoFillAnger(count);
    // 每次生成都小震一下反馈
    if (count > 1) {
      shakeScreen(false);
      flashRed();
    }
  }

  // ---------- Header buttons ----------
  $('#btn-reset').addEventListener('click', () => {
    if (state.count === 0 && state.clouds.length === 0 && window.MCStore.getDiaries().length === 0) {
      showToast('一切从 0 开始 🌱');
      return;
    }
    if (!confirm('确定重新开始？\n这会清空你所有的"放空"记录和日记')) return;
    window.MCStore.resetAll();
    state.count = 0;
    state.today = 0;
    state.combo = 0;
    state.clouds = [];
    state.particles = [];
    location.reload();
  });
  $('#btn-help').addEventListener('click', () => helpModal.classList.add('show'));
  $('#btn-close-help').addEventListener('click', () => helpModal.classList.remove('show'));
  helpModal.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.classList.remove('show'); });

  // ---------- Bottom bar ----------
  $('#btn-diary').addEventListener('click', openDiaryList);
  $('#btn-report').addEventListener('click', () => {
    if (state.mode === 'anger') {
      // 暴躁模式：清空所有云朵
      clearAllClouds();
    } else {
      openReport();
    }
  });

  // 一键清空：逐个炸掉所有云朵
  function clearAllClouds() {
    if (state.clouds.length === 0) {
      // 已经是空的，直接弹报告
      openReport();
      return;
    }
    const total = state.clouds.length;
    showToast(`💥 一次性清空 ${total} 个炸弹！`, 'anger');
    // 先震屏 + 碎屏一次
    shakeScreen(true);
    flashRed();
    showCrack();
    playBoom();
    // 逐个延迟炸开（每个 80ms）
    const cloudsCopy = state.clouds.slice();
    cloudsCopy.forEach((c, i) => {
      setTimeout(() => {
        if (state.clouds.includes(c)) popCloud(c, true);
      }, i * 70);
    });
    // 全部炸完后弹报告
    setTimeout(() => {
      if (state.clouds.length === 0) {
        setTimeout(() => openReport(), 400);
      }
    }, cloudsCopy.length * 70 + 600);
  }

  // ---------- Diary 系统 ----------
  let editingId = null;
  let detailId = null;
  let chosenMood = '😐';

  function openDiaryList() {
    renderDiaryList();
    diaryModal.classList.add('show');
  }
  $('#btn-diary-close').addEventListener('click', () => diaryModal.classList.remove('show'));
  diaryModal.addEventListener('click', (e) => { if (e.target === diaryModal) diaryModal.classList.remove('show'); });

  $('#btn-diary-new').addEventListener('click', () => {
    openDiaryWrite(null);
  });

  function renderDiaryList() {
    const list = window.MCStore.getDiaries();
    const el = $('#diary-list');
    if (!list.length) {
      el.innerHTML = `<div class="diary-item-empty">
        <span class="big-emoji">📔</span>
        <div>还没有日记</div>
        <div style="margin-top:6px;font-size:12px">点右上角 <strong>+</strong> 写下第一篇吧</div>
      </div>`;
      return;
    }
    el.innerHTML = list.map(d => {
      const date = new Date(d.ts);
      const dateStr = `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
      const emos = d.emotions ? Object.entries(d.emotions)
        .filter(([k, v]) => v > 10)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k, v]) => `<span class="d-emotion">${window.MCAnalyzer.DICT[k].emoji} ${window.MCAnalyzer.DICT[k].label}</span>`)
        .join('') : '';
      return `<div class="diary-item" data-id="${d.id}">
        <div class="d-meta">
          <span class="d-mood">${d.mood}</span>
          <span>${dateStr}</span>
        </div>
        <div class="d-content">${escapeHtml(d.content)}</div>
        ${emos ? `<div class="d-emotions">${emos}</div>` : ''}
      </div>`;
    }).join('');
    el.querySelectorAll('.diary-item').forEach(item => {
      item.addEventListener('click', () => openDiaryDetail(item.dataset.id));
    });
  }

  function openDiaryWrite(id) {
    editingId = id;
    const isEdit = !!id;
    $('#dw-icon').textContent = isEdit ? '✏️' : '📝';
    $('#dw-title').textContent = isEdit ? '编辑日记' : '写日记';
    if (isEdit) {
      const d = window.MCStore.getDiary(id);
      if (d) {
        $('#diary-content').value = d.content;
        chosenMood = d.mood;
      }
    } else {
      $('#diary-content').value = '';
      chosenMood = window.MCAnalyzer.moodEmoji($('#worry-input').value) || '😐';
    }
    highlightMood();
    diaryWriteModal.classList.add('show');
    setTimeout(() => $('#diary-content').focus(), 100);
  }
  $('#btn-dw-close').addEventListener('click', closeDiaryWrite);
  $('#btn-dw-cancel').addEventListener('click', closeDiaryWrite);
  function closeDiaryWrite() { diaryWriteModal.classList.remove('show'); editingId = null; }

  $('#mood-pick').addEventListener('click', (e) => {
    const pill = e.target.closest('.mood-pill');
    if (!pill) return;
    chosenMood = pill.dataset.mood;
    highlightMood();
  });
  function highlightMood() {
    $$('.mood-pill').forEach(p => p.classList.toggle('active', p.dataset.mood === chosenMood));
  }

  $('#btn-dw-save').addEventListener('click', () => {
    const text = $('#diary-content').value.trim();
    if (!text) { showToast('写点什么吧 🤗'); return; }
    const analysis = window.MCAnalyzer.analyze(text);
    const item = editingId
      ? window.MCStore.updateDiary(editingId, { content: text, mood: chosenMood, emotions: analysis.scores })
      : window.MCStore.addDiary(text, chosenMood, analysis.scores);
    closeDiaryWrite();
    if (detailId) { diaryDetailModal.classList.remove('show'); detailId = null; }
    showToast(editingId ? '已更新 ✨' : '日记已保存，AI 分析完成 🧠');
    updateStats();
    if (diaryModal.classList.contains('show')) renderDiaryList();
    // 打卡
    window.MCStore.bumpStreak();
    updateStats();
  });

  function openDiaryDetail(id) {
    detailId = id;
    const d = window.MCStore.getDiary(id);
    if (!d) return;
    const date = new Date(d.ts);
    $('#dd-mood').textContent = d.mood;
    $('#dd-date').textContent = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    let html = `<div style="font-size:14px;line-height:1.8;color:var(--ink);white-space:pre-wrap;background:var(--bg-3);padding:14px 16px;border-radius:12px;margin-bottom:14px;">${escapeHtml(d.content)}</div>`;
    if (d.emotions) {
      const sorted = Object.entries(d.emotions).filter(([k, v]) => v > 0).sort((a, b) => b[1] - a[1]);
      const dom = window.MCAnalyzer.pickDominant(d.emotions);
      if (dom) {
        const roast = window.MCAnalyzer.roastSummary({ dominant: dom });
        html += `<div class="roast-box" style="margin-bottom:14px"><div class="roast-title">🤖 AI 分析</div><div class="roast-text"><strong>${dom.emoji} ${dom.label}</strong> · ${roast.text}</div></div>`;
      }
      html += `<div class="emotion-bars"><h4>📊 情绪维度</h4>`;
      sorted.forEach(([k, v]) => {
        const dict = window.MCAnalyzer.DICT[k];
        html += `<div class="emotion-bar-row">
          <div class="e-label">${dict.emoji} ${dict.label}</div>
          <div class="e-track"><div class="e-fill" style="width:${v}%;background:${dict.color}"></div></div>
          <div class="e-val">${v}</div>
        </div>`;
      });
      html += `</div>`;
    }
    $('#dd-content').innerHTML = html;
    diaryDetailModal.classList.add('show');
  }
  $('#btn-dd-close').addEventListener('click', () => { diaryDetailModal.classList.remove('show'); detailId = null; });
  $('#btn-dd-delete').addEventListener('click', () => {
    if (!confirm('确定删除这篇日记？')) return;
    window.MCStore.deleteDiary(detailId);
    diaryDetailModal.classList.remove('show');
    detailId = null;
    renderDiaryList();
    updateStats();
    showToast('已删除');
  });
  $('#btn-dd-edit').addEventListener('click', () => {
    const id = detailId;
    diaryDetailModal.classList.remove('show');
    detailId = null;
    openDiaryWrite(id);
  });
  diaryDetailModal.addEventListener('click', (e) => { if (e.target === diaryDetailModal) { diaryDetailModal.classList.remove('show'); detailId = null; } });

  // ---------- Report ----------
  function openReport() {
    const burstData = window.MCStore.getTodayBurst();
    const diaries = window.MCStore.getTodayDiaries();
    const items = burstData.items;
    const isAngerSession = burstData.items.some(i => i.mood === 'anger');

    // 如果什么都没有，提示一下
    if (items.length === 0 && state.today === 0) {
      showToast('先发泄一下或写篇日记再来领报告吧 ✨');
      return;
    }

    // 释放率
    const intensity = items.length + diaries.length * 2;
    const releasePct = Math.min(100, Math.round(intensity * 8 + (isAngerSession ? 20 : 0)));
    $('#rpt-pct').textContent = releasePct + '%';
    setTimeout(() => {
      $('#rpt-ring').style.strokeDashoffset = String(502 - (502 * releasePct / 100));
    }, 50);

    // 头部
    if (isAngerSession) {
      $('#rpt-badge').classList.add('anger');
      $('#rpt-badge').textContent = 'EXPLOSION · 爆炸报告';
      $('#rpt-title').textContent = '你已经炸完了，辛苦了';
      reportCard.classList.add('anger');
    } else {
      $('#rpt-badge').classList.remove('anger');
      $('#rpt-badge').textContent = 'TODAY · 今日发泄';
      $('#rpt-title').textContent = '今日发泄报告';
      reportCard.classList.remove('anger');
    }
    const d = new Date();
    $('#rpt-date').textContent = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

    // AI 犀利一句（保留简短）
    $('#rpt-roast').classList.toggle('anger', isAngerSession);
    $('#rpt-roast-title').textContent = isAngerSession ? '🔥 今日暴走总结' : '🤖 AI 一句话总结';
    if (isAngerSession) {
      $('#rpt-roast-text').textContent = '刚才那一下，替你的委屈出了气。这一秒，麻烦对自己温柔一点。';
    } else {
      const a = window.MCAnalyzer.analyzeMultiple(items.map(i => i.text).concat(diaries.map(d => d.content)));
      const roast = window.MCAnalyzer.roastSummary(a);
      $('#rpt-roast-text').textContent = roast.text;
    }

    // 安慰长文（分层 3-4 段）
    const lines = [];
    // 1. 通用安慰 1 段
    lines.push(pickRandom(COMFORT_LINES.general));
    // 2. 释放感 1-2 段
    lines.push(pickRandom(COMFORT_LINES.release));
    if (isAngerSession) lines.push(pickRandom(COMFORT_LINES.soothe));
    // 3. 鼓励 1 段
    lines.push(pickRandom(COMFORT_LINES.encourage));
    // 渲染（逐行动画）
    reportComfort.innerHTML = lines.map(l => `<div class="comfort-line">${l}</div>`).join('');
    const lineEls = reportComfort.querySelectorAll('.comfort-line');
    lineEls.forEach((el, i) => {
      setTimeout(() => el.classList.add('show'), 300 + i * 220);
    });

    // 致你的一封信
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    reportLetterText.textContent = letter;

    // 碎碎念（隐藏，原版）
    $('#rpt-burst-section').style.display = 'none';

    reportModal.classList.add('show');
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  $('#btn-close-report').addEventListener('click', () => reportModal.classList.remove('show'));
  reportModal.addEventListener('click', (e) => { if (e.target === reportModal) reportModal.classList.remove('show'); });

  $('#btn-share').addEventListener('click', () => {
    // "继续发泄"按钮：关闭报告，自动补充新炸弹
    reportModal.classList.remove('show');
    if (state.mode === 'anger') {
      // 延迟一下，让报告关闭动画完成
      setTimeout(() => {
        autoFillAnger(6 + Math.floor(Math.random() * 4));
        showToast('💥 新的炸弹已就位，继续炸！', 'anger');
        shakeScreen(false);
        flashRed();
      }, 250);
    } else {
      setTimeout(() => {
        if (state.clouds.length < 3) {
          showToast('☁️ 继续扔点云朵吧~');
        }
      }, 200);
    }
  });

  // ---------- Radar ----------
  function drawRadar(scores) {
    const c = $('#rpt-radar');
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = c.clientWidth || 280;
    const cssH = 220;
    c.width = cssW * dpr;
    c.height = cssH * dpr;
    c.style.height = cssH + 'px';
    const cctx = c.getContext('2d');
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cctx.clearRect(0, 0, cssW, cssH);

    const cx = cssW / 2, cy = cssH / 2;
    const R = Math.min(cssW, cssH) / 2 - 28;
    const axes = [
      { key: 'stress', label: '压力' },
      { key: 'anger',  label: '愤怒' },
      { key: 'anxiety',label: '焦虑' },
      { key: 'sadness',label: '悲伤' },
      { key: 'lonely', label: '孤独' },
      { key: 'joy',    label: '喜悦' },
    ];
    const n = axes.length;

    // 网格
    cctx.strokeStyle = 'rgba(45,45,68,0.1)';
    cctx.lineWidth = 1;
    for (let level = 1; level <= 4; level++) {
      cctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const r = (R * level) / 4;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) cctx.moveTo(x, y); else cctx.lineTo(x, y);
      }
      cctx.closePath();
      cctx.stroke();
    }

    // 轴
    cctx.strokeStyle = 'rgba(45,45,68,0.15)';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      cctx.beginPath();
      cctx.moveTo(cx, cy);
      cctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      cctx.stroke();
    }

    // 数据
    cctx.fillStyle = 'rgba(255, 107, 157, 0.25)';
    cctx.strokeStyle = '#FF6B9D';
    cctx.lineWidth = 2;
    cctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const v = (scores[axes[i].key] || 0) / 100;
      const r = R * v;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) cctx.moveTo(x, y); else cctx.lineTo(x, y);
    }
    cctx.closePath();
    cctx.fill();
    cctx.stroke();

    // 点
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const v = (scores[axes[i].key] || 0) / 100;
      const r = R * v;
      cctx.fillStyle = window.MCAnalyzer.DICT[axes[i].key].color;
      cctx.beginPath();
      cctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 3.5, 0, Math.PI * 2);
      cctx.fill();
    }

    // 标签
    cctx.fillStyle = '#2D2D44';
    cctx.font = '600 11px Outfit, sans-serif';
    cctx.textAlign = 'center';
    cctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const dict = window.MCAnalyzer.DICT[axes[i].key];
      const lx = cx + Math.cos(a) * (R + 18);
      const ly = cy + Math.sin(a) * (R + 18);
      cctx.fillText(dict.emoji + axes[i].label, lx, ly);
    }
  }

  // ---------- 工具 ----------
  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------- 键盘 ----------
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && document.activeElement !== input && document.activeElement !== $('#diary-content')) {
      e.preventDefault();
      openReport();
    }
    if (e.key === 'Escape') {
      $$('.modal-mask.show').forEach(m => m.classList.remove('show'));
    }
  });

  // 双击空白查看报告
  let lastTap = 0;
  canvas.addEventListener('dblclick', openReport);
  canvas.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      const { x, y } = getPos(e.changedTouches[0] || e);
      if (x !== undefined && y !== undefined) {
        const rect = canvas.getBoundingClientRect();
        const px = x - rect.left, py = y - rect.top;
        if (!getHit(px, py)) openReport();
      }
    }
    lastTap = now;
  });

  // ---------- Render loop ----------
  let lastT = performance.now();
  function frame(now) {
    const dt = Math.min(0.06, (now - lastT) / 1000);
    lastT = now;
    ctx.clearRect(0, 0, W, H);

    for (let i = state.floaters.length - 1; i >= 0; i--) {
      const f = state.floaters[i];
      f.x += f.vx; f.y += f.vy;
      f.life -= 0.002;
      if (f.life <= 0 || f.y < -20) { state.floaters.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = f.alpha * f.life;
      ctx.fillStyle = f.color;
      ctx.font = `${f.size}px Silkscreen, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    for (let i = state.clouds.length - 1; i >= 0; i--) {
      const c = state.clouds[i];
      c.update(dt);
      c.draw();
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.update();
      p.draw();
      if (p.life <= 0) state.particles.splice(i, 1);
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------- Init ----------
  updateStats();
  // 首次打开给个欢迎
  if (!localStorage.getItem('mc_welcomed_v2')) {
    setTimeout(() => {
      helpModal.classList.add('show');
      localStorage.setItem('mc_welcomed_v2', '1');
    }, 400);
  }

  // 暴露
  window.MoodCrusher = { reset: () => $('#btn-reset').click(), openReport, setMode, state };
})();
