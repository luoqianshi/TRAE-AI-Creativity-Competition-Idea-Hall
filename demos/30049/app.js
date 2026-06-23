/* 心晴树洞 - 前端交互逻辑（纯 JS，无框架） */
(function () {
  'use strict';

  // ====== 状态 ======
  const state = {
    selectedMood: null,
    inputText: '',
    messages: [],
    plants: []
  };

  // ====== 情绪配置 ======
  const MOOD_CONFIG = {
    anxiety: { label: '焦虑', emoji: '🌼', color: 'anxiety' },
    grief:   { label: '委屈', emoji: '💧', color: 'grief' },
    sad:     { label: '难过', emoji: '🍂', color: 'sad' },
    angry:   { label: '烦躁', emoji: '🔥', color: 'angry' },
    lonely:  { label: '孤独', emoji: '🌙', color: 'lonely' },
    other:   { label: '其他', emoji: '🌱', color: 'other' }
  };

  // ====== AI 回复模板（按情绪分类）======
  const AI_TEMPLATES = {
    anxiety: [
      '能感受到你心里有点紧，先别急，我们一点点来 🌸',
      '焦虑的时候，身体也会跟着紧张，要不要先深呼吸 3 次？',
      '你愿意告诉我，是哪件事让你最担心吗？',
      '有时候担心是正常的，说明你真的很在乎。',
      '把担心的事一件一件写下来，有时候就没那么吓人了。',
      '别急，你已经很努力了，允许自己慢慢来。'
    ],
    grief: [
      '听起来你心里有点委屈，被这样对待真的不容易 💗',
      '委屈的时候，想哭就哭一会儿，没关系的。',
      '你愿意多说说发生了什么吗？我在这里听。',
      '你的感受是真实的，也是被允许的。',
      '被误解或被忽视，真的会让人很难受。',
      '抱抱你，这种感觉值得被认真对待 🤍'
    ],
    sad: [
      '难过是很自然的，不用急着变好 🍂',
      '能告诉我是什么让你这么难过吗？',
      '悲伤不会一直持续的，它会慢慢过去。',
      '你愿意对自己说一句温柔的话吗？',
      '有时候流泪也是一种休息，没关系的。',
      '我陪着你，难过也可以慢慢来。'
    ],
    angry: [
      '烦躁的时候，身体里好像有一团火，先试着呼一口气 🔥',
      '愤怒是一个信号，说明你很在意这件事。',
      '如果不开心，是可以表达出来的。',
      '想跺脚、想喊出来都可以，先让情绪流动一下。',
      '要不要先离开那个让你烦躁的环境 5 分钟？',
      '愤怒不是坏情绪，它在提醒你照顾好自己。'
    ],
    lonely: [
      '一个人的时候，真的很容易感觉到孤单 🌙',
      '即使周围有人，也可能感到孤独，这种感觉很真实。',
      '你愿意告诉我，最近有什么让你觉得孤单的事吗？',
      '其实现在你在说话，我就在陪着你。',
      '试着和自己喜欢的一首歌、一本书待一会儿，也会不那么孤单。',
      '孤独并不代表你不好，它只是一种情绪。'
    ],
    other: [
      '谢谢你愿意说出来，我在认真听 🌱',
      '不管是什么样的心情，被看见就是一件很好的事。',
      '你愿意再多说一点点吗？',
      '每一次开口，都是对自己的一次温柔。',
      '慢慢来，想说什么都可以。',
      '把心里的话说出来，有时候会轻松一些。'
    ]
  };

  // ====== 情绪整理页文案 ======
  const REFLECT_TEXTS = {
    anxiety: {
      feeling: '有点焦虑，心里好像堵着一团东西，胸口有点发紧。',
      reason:  '可能是最近考试/作业压力太大，或者有些事还没说出口。',
      steps:   ['深呼吸 3 次', '写 3 句想对自己说的话', '出去走 5 分钟']
    },
    grief: {
      feeling: '心里有点委屈，好像没有人真正理解我。',
      reason:  '可能最近被误解、被忽视，或是遇到了不公平的事。',
      steps:   ['抱一抱自己', '和信任的人说一句心里话', '喝一杯温水']
    },
    sad: {
      feeling: '有点难过，心里沉沉的，不太想说话。',
      reason:  '可能是离别、失望，或是对自己有一些不满意。',
      steps:   ['允许自己哭一会儿', '听一首温柔的歌', '对镜子说：辛苦你了']
    },
    angry: {
      feeling: '心里有点烦躁，像一团小火苗在烧。',
      reason:  '可能是事情不顺心，或是被人打扰到了边界。',
      steps:   ['用冷水洗一把脸', '用力吹气 10 秒', '写下让你最烦躁的一件事']
    },
    lonely: {
      feeling: '感到有点孤单，想找一个人聊聊却不知道说什么。',
      reason:  '可能最近和朋友/家人的联系比较少，或是环境发生了变化。',
      steps:   ['给一位朋友发一条消息', '做一件喜欢的小事', '走到窗边看看天空']
    },
    other: {
      feeling: '心里有一些说不太清楚的感受，总之不是很轻松。',
      reason:  '可能是生活里最近有一些变化，或者需要休息一下了。',
      steps:   ['做 3 次深呼吸', '写 3 件最近让你开心的小事', '给自己泡一杯喜欢的饮料']
    }
  };

  // ====== 安全关键词 ======
  const SAFETY_KEYWORDS = ['不想活', '自杀', '伤害自己', '自伤', '去死', '结束生命'];

  // ====== 工具函数 ======
  function $(id) { return document.getElementById(id); }
  function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickN(arr, n) {
    const copy = arr.slice();
    const result = [];
    for (let i = 0; i < n && copy.length > 0; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  }
  function containsSafetyKeyword(text) {
    return SAFETY_KEYWORDS.some((kw) => text.indexOf(kw) !== -1);
  }

  // ====== 页面切换 ======
  function switchPage(name) {
    document.body.setAttribute('data-page', name);
    if (name === 'reflect') triggerReflectCards();
    if (name === 'garden') renderGarden();
  }

  // ====== 首页：心情输入 ======
  const moodButtons = document.querySelectorAll('.mood-btn');
  moodButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      moodButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedMood = btn.dataset.mood;
    });
  });

  $('submitBtn').addEventListener('click', () => {
    const textarea = $('inputText');
    const text = (textarea.value || '').trim();
    if (!text) {
      textarea.focus();
      textarea.style.borderColor = '#FFB6C8';
      textarea.placeholder = '先写一点点吧，随便什么都可以～';
      return;
    }
    if (containsSafetyKeyword(text)) {
      showSafetyOverlay();
      return;
    }
    state.inputText = text;
    startChat(text);
  });

  // ====== 对话页 ======
  function startChat(userInput) {
    state.messages = [];
    const chatBox = $('chatBox');
    chatBox.innerHTML = '';

    const moodKey = state.selectedMood || 'other';

    // AI 开场白
    addMessage('ai', '嗨～我是树洞小晴，看到你来到这里啦 🌸');

    // 用户输入
    addMessage('user', userInput);

    // 随机 2 条 AI 温和回复（根据情绪）
    const replies = pickN(AI_TEMPLATES[moodKey] || AI_TEMPLATES.other, 2);
    replies.forEach((reply, index) => {
      setTimeout(() => addMessage('ai', reply), 900 * (index + 1));
    });

    switchPage('chat');
  }

  function addMessage(role, text) {
    const chatBox = $('chatBox');
    const div = document.createElement('div');
    div.className = 'message ' + role;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    state.messages.push({ role, text });
  }

  $('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('chatInput');
    const text = (input.value || '').trim();
    if (!text) return;

    if (containsSafetyKeyword(text)) {
      showSafetyOverlay();
      input.value = '';
      return;
    }

    addMessage('user', text);
    input.value = '';

    const moodKey = state.selectedMood || 'other';
    const reply = randomPick(AI_TEMPLATES[moodKey] || AI_TEMPLATES.other);
    setTimeout(() => addMessage('ai', reply), 700);
  });

  $('toReflectBtn').addEventListener('click', () => {
    buildReflect();
    switchPage('reflect');
  });

  // ====== 情绪整理页 ======
  function buildReflect() {
    const moodKey = state.selectedMood || 'other';
    const data = REFLECT_TEXTS[moodKey];

    const cardFeeling = $('cardFeeling');
    const cardReason = $('cardReason');
    const cardSteps = $('cardSteps');

    // 重置
    cardFeeling.classList.remove('show');
    cardReason.classList.remove('show');
    cardSteps.classList.remove('show');

    cardFeeling.querySelector('.card-body-text').textContent = data.feeling;
    cardReason.querySelector('.card-body-text').textContent = data.reason;

    const ul = cardSteps.querySelector('.steps-list');
    ul.innerHTML = '';
    data.steps.forEach((step) => {
      const li = document.createElement('li');
      li.textContent = step;
      ul.appendChild(li);
    });
  }

  function triggerReflectCards() {
    const cards = document.querySelectorAll('.page-reflect .fade-card');
    cards.forEach((card, index) => {
      setTimeout(() => card.classList.add('show'), 300 + index * 350);
    });
  }

  $('toGardenBtn').addEventListener('click', () => {
    addPlant();
    switchPage('garden');
  });

  // ====== 心情花园 ======
  function addPlant() {
    const moodKey = state.selectedMood || 'other';
    const config = MOOD_CONFIG[moodKey];

    // 用百分比定位（0-100），兼容不同容器宽度
    // 顶部 25% 留给太阳和云朵（不遮挡），底部 25% 留给草地
    let pos = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const leftPct = 5 + Math.random() * 85; // 5%~90%
      const topPct  = 25 + Math.random() * 50; // 25%~75%（避开顶部天空装饰和底部草地）
      const tooClose = state.plants.some((p) => {
        const dx = p.leftPct - leftPct;
        const dy = p.topPct - topPct;
        return Math.sqrt(dx * dx + dy * dy) < 12; // 12% 间距
      });
      if (!tooClose) {
        pos = { leftPct, topPct };
        break;
      }
    }
    if (!pos) {
      pos = { leftPct: 20 + Math.random() * 60, topPct: 35 + Math.random() * 40 };
    }

    state.plants.push({
      mood: moodKey,
      emoji: config.emoji,
      colorClass: config.color,
      leftPct: pos.leftPct,
      topPct: pos.topPct
    });
  }

  function renderGarden() {
    const garden = $('garden');
    const tip = $('gardenEmptyTip');

    // 先清空动态内容，但保留花园固定装饰（sun/cloud/ground）
    garden.innerHTML = '';
    // 重新插入固定装饰（如果后续想让装饰独立，可以放到 HTML 固定层）
    const sun = document.createElement('div');
    sun.className = 'garden-decor sun';
    sun.textContent = '☀️';
    garden.appendChild(sun);
    const c1 = document.createElement('div');
    c1.className = 'garden-decor cloud cloud1';
    c1.textContent = '☁️';
    garden.appendChild(c1);
    const c2 = document.createElement('div');
    c2.className = 'garden-decor cloud cloud2';
    c2.textContent = '☁️';
    garden.appendChild(c2);
    const ground = document.createElement('div');
    ground.className = 'garden-ground';
    garden.appendChild(ground);

    if (state.plants.length === 0) {
      tip.style.display = 'block';
      return;
    }
    tip.style.display = 'none';

    state.plants.forEach((plant, index) => {
      const div = document.createElement('div');
      div.className = 'plant ' + plant.colorClass;
      div.style.left = 'calc(' + plant.leftPct.toFixed(2) + '% - 26px)';
      div.style.top  = 'calc(' + plant.topPct.toFixed(2) + '% - 26px)';
      div.style.animationDelay = (index * 0.1) + 's';
      div.textContent = plant.emoji;
      garden.appendChild(div);
    });
  }

  $('restartBtn').addEventListener('click', () => {
    // 重置花园和状态
    state.plants = [];
    state.selectedMood = null;
    state.inputText = '';
    state.messages = [];

    moodButtons.forEach((b) => b.classList.remove('active'));
    const textarea = $('inputText');
    textarea.value = '';
    textarea.placeholder = '今天心情怎么样？可以随便说说～';
    textarea.style.borderColor = '';

    switchPage('input');
  });

  // ====== 顶部导航 ======
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;
      if (target === 'reflect') buildReflect();
      switchPage(target);
    });
  });

  // ====== 安全提醒覆盖层 ======
  function showSafetyOverlay() {
    const overlay = $('safetyOverlay');
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
  }

  $('safetyCloseBtn').addEventListener('click', () => {
    const overlay = $('safetyOverlay');
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
  });
})();
