/**
 * ============================================================
 * 小学英语乐园 - 核心应用逻辑 (app.js)
 * 基于 2022 年义务教育英语课程标准
 * 纯 JavaScript 实现，不依赖任何框架
 * 文件编码: UTF-8
 * ============================================================
 */

// ============================================================
// 一、状态管理
// ============================================================

/** 用户状态对象 */
var userState = {
  name: '',
  grade: 1,          // 1=一级(1-2年级), 2=二级(3-4年级), 3=三级(5-6年级)
  stars: 0,
  wordsLearned: [],
  listeningDone: 0,
  readingDone: 0,
  gamesDone: 0,
  grammarDone: 0,
  phonicsDone: 0,
  achievements: [],
  skills: { lang: 0, culture: 0, think: 0, learn: 0 },
  streak: 0,          // 连续打卡天数
  lastLoginDate: '',   // 上次登录日期
  dailyCheckIn: false, // 今天是否已打卡
  totalDays: 0         // 总学习天数
};

/** 当前连击数（连续答对次数，用于连击奖励） */
var comboCount = 0;

/** 当前听力题索引 */
var currentListening = 0;

/** 当前口语单词索引 */
var currentSpeakIndex = 0;

/** 当前游戏类型 */
var currentGame = null;

/** 当前阅读级别 */
var currentReadingLevel = 'grade1';

/** 语音识别对象 */
var recognition = null;

/** 音频上下文（用于生成音效） */
var audioCtx = null;

/** 成就定义列表 */
var achievements = [
  { id: 'first_word',    name: '初次学习',   icon: '📖', desc: '学习第一个单词' },
  { id: 'ten_words',     name: '单词达人',   icon: '📚', desc: '学习10个单词' },
  { id: 'fifty_words',   name: '词汇高手',   icon: '🎓', desc: '学习50个单词' },
  { id: 'first_listen',  name: '听力新星',   icon: '👂', desc: '完成第一次听力练习' },
  { id: 'first_speak',   name: '开口说',     icon: '🎤', desc: '完成第一次口语练习' },
  { id: 'first_read',    name: '小读者',     icon: '📖', desc: '完成第一篇阅读' },
  { id: 'game_master',   name: '游戏高手',   icon: '🎮', desc: '完成一个游戏' },
  { id: 'grammar_star',  name: '语法新星',   icon: '📝', desc: '完成一次语法练习' },
  { id: 'phonics_star',  name: '拼读达人',   icon: '🔤', desc: '完成一次自然拼读' },
  { id: 'star_collector',name: '星星收集者', icon: '⭐', desc: '获得10颗星星' },
  { id: 'super_star',    name: '超级明星',   icon: '🌟', desc: '获得50颗星星' },
  { id: 'streak_3',      name: '坚持三天',   icon: '🔥', desc: '连续打卡3天' },
  { id: 'streak_7',      name: '一周达人',   icon: '💪', desc: '连续打卡7天' },
  { id: 'streak_30',     name: '月度冠军',   icon: '👑', desc: '连续打卡30天' },
  { id: 'all_modules',   name: '全能学霸',   icon: '🏅', desc: '每个模块都完成过' },
];

/** 资源数据（补充定义，当 data.js 中没有时使用） */
var resourceData = {
  songs: [
    { title: 'ABC Song', emoji: '🔤', desc: '经典字母歌，学习26个字母的发音和顺序', detail: '这是一首非常经典的英文儿歌，帮助小朋友认识26个英文字母。通过欢快的旋律，孩子们能轻松记住字母顺序和基本发音。' },
    { title: 'Twinkle Twinkle Little Star', emoji: '⭐', desc: '一闪一闪亮晶晶英文版', detail: '改编自法国歌曲的英文经典，歌词简单优美，适合初学者跟唱，学习 star, sky, diamond 等词汇。' },
    { title: 'Old MacDonald Had a Farm', emoji: '🐄', desc: '农场动物歌，认识各种动物', detail: '通过模仿各种动物的叫声，学习 cat, dog, cow, pig, duck 等动物名称和对应的声音。' },
    { title: 'Head, Shoulders, Knees and Toes', emoji: '👤', desc: '身体部位歌', detail: '一边唱一边摸对应身体部位，学习 head, shoulders, knees, toes, eyes, ears, mouth, nose 等词汇。' },
    { title: 'The Wheels on the Bus', emoji: '🚌', desc: '公交车上的轮子', detail: '关于公交车各种部件和声音的儿歌，学习 wheel, door, window, wiper, horn 等词汇。' },
    { title: 'If You Are Happy', emoji: '😊', desc: '如果你感到幸福', detail: '经典的情绪表达儿歌，学习 happy, clap, stomp, shout 等动作和情绪词汇。' },
    { title: 'Five Little Ducks', emoji: '🦆', desc: '五只小鸭子', detail: '通过小鸭子逐个回家的故事，学习数字 1-5 和减法概念。' },
    { title: 'Rain, Rain, Go Away', emoji: '🌧️', desc: '雨雨快走开', detail: '关于天气的儿歌，学习 rain, go away, come again, little children 等表达。' },
  ],
  stories: [
    { title: 'The Very Hungry Caterpillar', emoji: '🐛', desc: '好饿的毛毛虫 - 认识食物和数字', detail: '一只毛毛虫从蛋里孵化出来，非常饿，吃了很多东西。通过故事学习星期、数字和食物名称。' },
    { title: 'Brown Bear, Brown Bear', emoji: '🐻', desc: '棕色的熊 - 学习颜色和动物', detail: '艾瑞·卡尔经典绘本，通过重复句型学习颜色和动物：What do you see? I see a ... looking at me.' },
    { title: 'Goodnight Moon', emoji: '🌙', desc: '晚安月亮 - 睡前温馨故事', detail: '一只小兔子在睡前向房间里的每样东西说晚安，学习 bedroom, moon, stars, light 等词汇。' },
    { title: 'The Cat in the Hat', emoji: '🎩', desc: '戴帽子的猫 - Dr. Seuss 经典', detail: '苏斯博士的经典故事，讲述一只戴帽子的猫给两个孩子带来的一场冒险，适合有一定基础的孩子。' },
    { title: 'Where the Wild Things Are', emoji: '👹', desc: '野兽出没的地方', detail: '一个关于想象力和勇气的经典故事，学习 forest, boat, monster, king 等词汇。' },
    { title: 'The Rainbow Fish', emoji: '🌈', desc: '彩虹鱼 - 学会分享', detail: '一条美丽的彩虹鱼学会与朋友分享的故事，学习 colors, share, friend, happy 等词汇。' },
  ],
  videos: [
    { title: 'Peppa Pig 英文版', emoji: '🐷', desc: '小猪佩奇，日常生活英语', detail: '英国经典动画片，讲述小猪佩奇一家的日常生活，语言简单地道，非常适合小学生学习日常用语。' },
    { title: 'Dora the Explorer', emoji: '👧', desc: '爱探险的朵拉 - 互动式学习', detail: '朵拉每集都会教小朋友几个英语单词和短语，内容涉及颜色、数字、方向等基础知识。' },
    { title: 'Sesame Street', emoji: '🌈', desc: '芝麻街，经典英语启蒙', detail: '美国最经典的儿童教育节目之一，结合了字母、数字、社会情感等多方面学习内容。' },
    { title: 'Alphablocks', emoji: '🧱', desc: '字母积木 - 自然拼读动画', detail: 'BBC出品的自然拼读动画，26个字母化身积木小人，通过组合拼读来帮助孩子们学习拼读规则。' },
    { title: 'Numberblocks', emoji: '🔢', desc: '数字积木 - 数学启蒙动画', detail: '与Alphablocks同系列的数学启蒙动画，通过有趣的故事学习数字概念和基本运算。' },
    { title: 'Bluey', emoji: '🐕', desc: '布鲁伊 - 澳大利亚动画', detail: '讲述一只蓝色澳洲牧牛犬和家人的日常故事，语言自然生动，适合培养语感。' },
  ]
};

/**
 * 从 localStorage 加载用户状态
 */
function loadState() {
  try {
    var saved = localStorage.getItem('englishLearningState');
    if (saved) {
      var parsed = JSON.parse(saved);
      // 合并保存的数据到默认状态，确保新增字段有默认值
      for (var key in userState) {
        if (parsed[key] !== undefined) {
          userState[key] = parsed[key];
        }
      }
      // 确保 skills 子对象完整
      if (!userState.skills) userState.skills = { lang: 0, culture: 0, think: 0, learn: 0 };
      if (!userState.skills.lang) userState.skills.lang = 0;
      if (!userState.skills.culture) userState.skills.culture = 0;
      if (!userState.skills.think) userState.skills.think = 0;
      if (!userState.skills.learn) userState.skills.learn = 0;
    }
  } catch (e) {
    console.warn('加载用户状态失败:', e);
  }
}

/**
 * 保存用户状态到 localStorage
 */
function saveState() {
  try {
    localStorage.setItem('englishLearningState', JSON.stringify(userState));
    // 同步更新排行榜
    updateLeaderboard();
  } catch (e) {
    console.warn('保存用户状态失败:', e);
  }
}

/**
 * 获取排行榜数据
 * @returns {Array} 排行榜数组
 */
function getLeaderboard() {
  try {
    var data = localStorage.getItem('englishLeaderboard');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/**
 * 更新排行榜中当前用户的数据
 */
function updateLeaderboard() {
  try {
    var leaderboard = getLeaderboard();
    var existIdx = -1;
    for (var i = 0; i < leaderboard.length; i++) {
      if (leaderboard[i].name === userState.name) {
        existIdx = i;
        break;
      }
    }
    var entry = {
      name: userState.name,
      grade: userState.grade,
      stars: userState.stars,
      totalDays: userState.totalDays
    };
    if (existIdx >= 0) {
      leaderboard[existIdx] = entry;
    } else {
      leaderboard.push(entry);
    }
    // 按星星数降序排列
    leaderboard.sort(function(a, b) { return b.stars - a.stars; });
    localStorage.setItem('englishLeaderboard', JSON.stringify(leaderboard));
  } catch (e) {
    console.warn('更新排行榜失败:', e);
  }
}

/**
 * 获取今天的日期字符串 (YYYY-MM-DD)
 * @returns {string}
 */
function getTodayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/**
 * 获取年级对应的中文标签
 * @param {number} grade - 1/2/3
 * @returns {string}
 */
function getGradeLabel(grade) {
  var labels = ['', '一级', '二级', '三级'];
  return labels[grade] || '一级';
}

/**
 * 获取年级对应的年级范围描述
 * @param {number} grade
 * @returns {string}
 */
function getGradeRange(grade) {
  var ranges = ['', '1-2年级', '3-4年级', '5-6年级'];
  return ranges[grade] || '';
}

/**
 * 获取单词数据中某个年级及以下所有单词（扁平数组）
 * @returns {Array}
 */
function getGradeWords() {
  var words = [];
  var maxGrade = userState.grade === 1 ? 2 : (userState.grade === 2 ? 4 : 6);
  var topics = Object.keys(wordData);
  for (var t = 0; t < topics.length; t++) {
    var topic = wordData[topics[t]];
    if (Array.isArray(topic)) {
      for (var i = 0; i < topic.length; i++) {
        if (!topic[i].grade || topic[i].grade <= maxGrade) {
          words.push(topic[i]);
        }
      }
    }
  }
  return words;
}

/**
 * 获取单词数据中所有主题名称映射
 * @returns {Object}
 */
function getTopicNames() {
  var names = {
    numbers: '🔢 数字',
    greetings: '👋 问候语',
    classroom: '🎒 教室用品',
    nature: '🌿 自然',
    animals: '🐾 动物世界',
    food: '🍎 美味食物',
    colors: '🎨 缤纷颜色',
    family: '👨‍👩‍👧‍👦 我的家人',
    school: '🏫 学校生活',
    body: '👤 身体部位',
    weather: '🌤️ 天气',
    clothes: '👔 服装',
    hobbies: '🎯 兴趣爱好',
    places: '📍 场所',
    emotions: '😊 情感',
    occupations: '👨‍⚕️ 职业',
    travel: '✈️ 旅行',
    festivals: '🎉 节日',
    technology: '💻 科技',
    environment: '🌍 环境',
    food_cooking: '🍳 食物与烹饪',
    sports: '⚽ 运动'
  };
  return names;
}

// ============================================================
// 二、欢迎页面
// ============================================================

/**
 * 初始化欢迎页面
 * 处理年级选择、名字输入、继续学习功能、连续打卡显示
 */
function setupWelcomePage() {
  var selectedGrade = null;
  var gradeCards = document.querySelectorAll('.grade-card');
  var nameInput = document.getElementById('studentName');
  var startBtn = document.getElementById('startBtn');

  var saved = null;
  try {
    var s = localStorage.getItem('englishLearningState');
    if (s) saved = JSON.parse(s);
  } catch (e) {}

  if (saved && saved.name) {
    var streakInfo = '';
    if (saved.streak > 0) {
      streakInfo = '<p style="margin-top:15px; font-size:16px; opacity:0.9;">🔥 已连续打卡 ' + saved.streak + ' 天</p>';
    }
    var continueHtml = '<button class="start-btn" id="continueBtn" style="margin-top:15px; background:var(--primary); color:white;">继续学习 (' + saved.name + ') ✨</button>' + streakInfo;
    var wrapper = nameInput.parentElement;
    wrapper.insertAdjacentHTML('beforeend', continueHtml);

    var continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
      continueBtn.addEventListener('click', function() {
        loadState();
        checkStreakOnLogin();
        saveState();
        enterMainApp();
      });
    }
  }

  gradeCards.forEach(function(card) {
    card.addEventListener('click', function() {
      gradeCards.forEach(function(c) { c.style.border = 'none'; });
      card.style.border = '3px solid #FFD166';
      selectedGrade = parseInt(card.dataset.grade);
      checkCanStart();
    });
  });

  if (saved && saved.grade) {
    gradeCards.forEach(function(c) {
      c.style.border = 'none';
      if (parseInt(c.dataset.grade) === saved.grade) {
        c.style.border = '3px solid #FFD166';
        selectedGrade = saved.grade;
      }
    });
    if (saved.name && nameInput) {
      nameInput.value = saved.name;
    }
    checkCanStart();
  }

  nameInput.addEventListener('input', checkCanStart);

  function checkCanStart() {
    startBtn.disabled = !(selectedGrade && nameInput.value.trim());
  }

  startBtn.addEventListener('click', function() {
    userState.name = nameInput.value.trim();
    userState.grade = selectedGrade;
    userState.totalDays = (userState.totalDays || 0) + 1;
    userState.lastLoginDate = getTodayStr();
    userState.dailyCheckIn = true;
    saveState();
    enterMainApp();
  });

  function enterMainApp() {
    document.getElementById('welcome-page').classList.add('hidden');
    document.getElementById('main-app').classList.add('active');
    document.getElementById('userAvatar').textContent = userState.name ? userState.name[0] : '学';
    document.getElementById('gradeBadge').textContent = getGradeLabel(userState.grade);
    updateAllStats();
    renderDashboard();
    showReward('欢迎回来！', userState.name + '，准备好开始今天的学习了吗？', '⭐', 1);
  }
}

/**
 * 发送验证码（模拟短信验证）
 * 生成4位随机验证码并显示在页面上
 */
function sendCode() {
  var phoneInput = document.getElementById('phoneInput');
  var codeBtn = document.getElementById('codeBtn');
  var tip = document.getElementById('codeTip');
  var phone = phoneInput ? phoneInput.value.trim() : '';

  if (!phone || phone.length < 7) {
    if (tip) { tip.textContent = '请先输入正确的电话号码'; tip.style.color = '#E53E3E'; }
    return;
  }

  // 生成4位随机验证码
  currentCode = Math.floor(1000 + Math.random() * 9000).toString();

  // 模拟发送，直接在页面显示验证码（教育平台演示用）
  if (tip) {
    tip.innerHTML = '✅ 验证码已发送: <strong style="font-size:18px; color:var(--primary); letter-spacing:4px;">' + currentCode + '</strong> （请输入）';
    tip.style.color = 'var(--text-light)';
  }

  // 按钮倒计时60秒
  var count = 60;
  codeBtn.disabled = true;
  codeBtn.textContent = count + '秒';
  var timer = setInterval(function() {
    count--;
    if (count <= 0) {
      clearInterval(timer);
      codeBtn.disabled = false;
      codeBtn.textContent = '获取验证码';
    } else {
      codeBtn.textContent = count + '秒';
    }
  }, 1000);
}

/**
 * 检查并更新连续打卡（登录时调用）
 */
function checkStreakOnLogin() {
  var today = getTodayStr();
  if (userState.lastLoginDate === today) {
    // 今天已经登录过，不做额外处理
    return;
  }
  // 计算日期差
  var lastDate = new Date(userState.lastLoginDate);
  var todayDate = new Date(today);
  var diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // 连续打卡
    userState.streak = (userState.streak || 0) + 1;
  } else if (diffDays > 1) {
    // 打卡中断，重置
    userState.streak = 1;
  } else {
    // 首次或同天
    userState.streak = userState.streak || 1;
  }
  userState.totalDays = (userState.totalDays || 0) + 1;
  userState.lastLoginDate = today;
  userState.dailyCheckIn = false; // 还未打卡，需要手动打卡

  // 检查打卡相关成就
  if (userState.streak >= 3) checkAchievement('streak_3');
  if (userState.streak >= 7) checkAchievement('streak_7');
  if (userState.streak >= 30) checkAchievement('streak_30');
}

// ============================================================
// 三、导航系统
// ============================================================

/**
 * 设置导航系统
 * 向侧边栏动态添加语法练习、自然拼读、数据统计入口
 * 为每个导航项绑定点击事件
 */
function setupNavigation() {
  var sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // 动态添加缺失的导航项
  var navItems = [
    { page: 'grammar',  icon: '📝', label: '语法练习' },
    { page: 'phonics',  icon: '🔤', label: '自然拼读' },
    { page: 'stats',    icon: '📊', label: '数据统计' }
  ];

  var existingPages = [];
  sidebar.querySelectorAll('.nav-item').forEach(function(item) {
    existingPages.push(item.dataset.page);
  });

  navItems.forEach(function(item) {
    if (existingPages.indexOf(item.page) === -1) {
      var div = document.createElement('div');
      div.className = 'nav-item';
      div.dataset.page = item.page;
      div.innerHTML = '<span class="nav-icon">' + item.icon + '</span><span>' + item.label + '</span>';
      sidebar.appendChild(div);
    }
  });

  // 绑定所有导航项的点击事件
  sidebar.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var page = item.dataset.page;
      if (page) navigateTo(page);
    });
  });
}

/**
 * 导航到指定页面
 * @param {string} page - 页面标识
 */
function navigateTo(page) {
  // 隐藏所有页面
  document.querySelectorAll('.page-section').forEach(function(s) {
    s.classList.remove('active');
  });

  // 高亮当前导航项
  document.querySelectorAll('.nav-item').forEach(function(n) {
    n.classList.remove('active');
  });
  var navItem = document.querySelector('.nav-item[data-page="' + page + '"]');
  if (navItem) navItem.classList.add('active');

  // 显示目标页面（动态创建不存在的页面）
  var pageEl = document.getElementById(page + '-page');
  if (!pageEl) {
    pageEl = createPageSection(page);
  }
  if (pageEl) pageEl.classList.add('active');

  // 初始化对应页面
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'words':     initWordsPage(); break;
    case 'listening': initListeningPage(); break;
    case 'speaking':  initSpeakingPage(); break;
    case 'reading':   initReadingPage(); break;
    case 'grammar':   initGrammarPage(); break;
    case 'phonics':   initPhonicsPage(); break;
    case 'games':     initGamesPage(); break;
    case 'resources': initResourcesPage(); break;
    case 'progress':  initProgressPage(); break;
    case 'stats':     initStatsPage(); break;
  }
}

/**
 * 动态创建不存在的页面 section
 * @param {string} page
 * @returns {HTMLElement}
 */
function createPageSection(page) {
  var main = document.querySelector('.main-content');
  if (!main) return null;

  var div = document.createElement('div');
  div.className = 'page-section';
  div.id = page + '-page';

  switch (page) {
    case 'grammar':
      div.innerHTML = '<h2 class="page-title"><span class="title-icon">📝</span> 语法练习</h2>' +
        '<div id="grammarContainer"></div>';
      break;
    case 'phonics':
      div.innerHTML = '<h2 class="page-title"><span class="title-icon">🔤</span> 自然拼读</h2>' +
        '<div id="phonicsContainer"></div>';
      break;
    case 'stats':
      div.innerHTML = '<h2 class="page-title"><span class="title-icon">📊</span> 数据统计（家长面板）</h2>' +
        '<div id="statsContainer"></div>';
      break;
  }

  main.appendChild(div);
  return div;
}

// ============================================================
// 四、单词学习模块
// ============================================================

/**
 * 初始化单词学习页面
 * 生成主题标签，按年级过滤显示可用主题
 */
function initWordsPage() {
  var topicsDiv = document.getElementById('wordTopics');
  if (!topicsDiv) return;

  var topicNames = getTopicNames();
  var maxGrade = userState.grade === 1 ? 2 : (userState.grade === 2 ? 4 : 6);
  var firstTopic = null;

  var html = '';
  var topics = Object.keys(wordData);
  for (var i = 0; i < topics.length; i++) {
    var key = topics[i];
    var words = wordData[key];
    if (!Array.isArray(words)) continue;

    // 检查该主题是否有当前年级及以下的单词
    var hasGradeWords = false;
    for (var j = 0; j < words.length; j++) {
      if (!words[j].grade || words[j].grade <= maxGrade) {
        hasGradeWords = true;
        break;
      }
    }
    if (!hasGradeWords) continue;

    var label = topicNames[key] || key;
    if (!firstTopic) firstTopic = key;
    html += '<button class="topic-tab' + (i === 0 ? ' active' : '') + '" data-topic="' + key + '" onclick="showWords(\'' + key + '\')">' + label + '</button>';
  }

  topicsDiv.innerHTML = html;
  if (firstTopic) showWords(firstTopic);
}

/**
 * 显示指定主题的单词卡片
 * @param {string} topic - 主题名
 */
function showWords(topic) {
  // 更新标签激活状态
  document.querySelectorAll('#wordTopics .topic-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  var activeTab = document.querySelector('#wordTopics .topic-tab[data-topic="' + topic + '"]');
  if (activeTab) activeTab.classList.add('active');

  var grid = document.getElementById('wordGrid');
  if (!grid) return;

  var words = wordData[topic];
  if (!Array.isArray(words)) return;

  var maxGrade = userState.grade === 1 ? 2 : (userState.grade === 2 ? 4 : 6);

  var html = '';
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    // 按年级过滤
    if (w.grade && w.grade > maxGrade) continue;

    var isLearned = userState.wordsLearned.indexOf(w.en) >= 0;
    var phonetic = w.phonetic || '';
    var example = w.example || '';

    var enId = 'en_' + w.en.replace(/[^a-zA-Z]/g, '');
    var cnId = 'cn_' + w.en.replace(/[^a-zA-Z]/g, '');
    var exId = 'ex_' + w.en.replace(/[^a-zA-Z]/g, '');

    html += '<div class="word-card" style="cursor:default; ' + (isLearned ? 'border-color: #06D6A0; background: linear-gradient(135deg, #E6FAF5, #E6FFFA);' : '') + '">' +
      (isLearned ? '<div style="position:absolute; top:8px; left:8px; font-size:16px;">✅</div>' : '') +
      '<div class="word-image" style="cursor:pointer;" onclick="event.stopPropagation(); learnWord(\'' + w.en.replace(/'/g, "\\'") + '\', \'' + topic + '\')">' + (w.emoji || '') + '</div>' +
      '<div id="' + enId + '" class="word-en" style="cursor:pointer;" onclick="event.stopPropagation(); speak(\'' + w.en.replace(/'/g, "\\'") + '\', 2)">' + w.en + '</div>' +
      '<div id="' + cnId + '" class="word-cn" style="cursor:pointer;" onclick="event.stopPropagation(); speakCN(\'' + w.cn.replace(/'/g, "\\'") + '\')">' + w.cn + '</div>' +
      (phonetic ? '<div style="font-size:12px; color:var(--text-light); margin-top:4px;">' + phonetic + '</div>' : '') +
      (example ? '<div id="' + exId + '" style="font-size:11px; color:var(--text-light); margin-top:4px; font-style:italic; cursor:pointer; border-top:1px dashed #E2E8F0; padding-top:4px;" onclick="event.stopPropagation(); speak(\'' + example.replace(/'/g, "\\'") + '\', 1)">' + example + '</div>' : '') +
      '</div>';
  }
  grid.innerHTML = html;
}

/**
 * 学习一个单词
 * @param {string} word - 英文单词
 * @param {string} topic - 主题名
 */
function learnWord(word, topic) {
  var words = wordData[topic];
  if (!Array.isArray(words)) return;

  var w = null;
  for (var i = 0; i < words.length; i++) {
    if (words[i].en === word) { w = words[i]; break; }
  }
  if (!w) return;

  if (userState.wordsLearned.indexOf(word) < 0) {
    // 新单词：仅做数据记录+视觉反馈，不弹窗
    userState.wordsLearned.push(word);
    userState.stars += 1;
    userState.skills.lang = Math.min(100, (userState.skills.lang || 0) + 2);
    userState.skills.learn = Math.min(100, (userState.skills.learn || 0) + 1);
    saveState();
    updateAllStats();
    playSound('star');
    checkAchievement('first_word');
    if (userState.wordsLearned.length >= 10) checkAchievement('ten_words');
    if (userState.wordsLearned.length >= 50) checkAchievement('fifty_words');
    if (userState.stars >= 10) checkAchievement('star_collector');
    if (userState.stars >= 50) checkAchievement('super_star');
    // 刷新当前主题显示（卡片上自动出现 ✅ 标记）
    showWords(topic);
    // 左上角显示短暂的 +1 星星提示
    showToast('⭐ +1 新单词');
  } else {
    // 已学单词，再次发音
    speak(word);
  }
}

// ============================================================
// 五、听力练习模块
// ============================================================

/** 当前听力题目列表 */
var currentListeningList = [];
/** 当前听力题号 */
var currentListeningIndex = 0;

/**
 * 初始化听力练习页面
 * 从 listeningData 按年级筛选题目
 */
function initListeningPage() {
  // 根据年级获取对应的听力数据
  var gradeKey = 'grade' + userState.grade;
  if (listeningData[gradeKey] && listeningData[gradeKey].length > 0) {
    currentListeningList = listeningData[gradeKey].slice();
  } else {
    // 降级：尝试其他年级
    currentListeningList = [];
    var keys = Object.keys(listeningData);
    for (var i = 0; i < keys.length; i++) {
      if (Array.isArray(listeningData[keys[i]])) {
        currentListeningList = currentListeningList.concat(listeningData[keys[i]]);
      }
    }
  }

  // 随机打乱顺序
  currentListeningList = shuffleArray(currentListeningList);
  currentListeningIndex = 0;

  // 绑定播放按钮
  var playBtn = document.getElementById('playAudioBtn');
  if (playBtn) {
    playBtn.onclick = function() {
      if (currentListeningList.length > 0 && currentListeningIndex < currentListeningList.length) {
        var q = currentListeningList[currentListeningIndex];
        speak(q.audio_text || q.answer);
      }
    };
  }

  loadListeningQuestion();
}

/**
 * 加载当前听力题目
 */
function loadListeningQuestion() {
  var optsDiv = document.getElementById('listeningOptions');
  if (!optsDiv || currentListeningList.length === 0) return;

  var q = currentListeningList[currentListeningIndex];
  var total = currentListeningList.length;

  // 更新题号显示
  var audioPlayer = document.querySelector('.audio-player');
  if (audioPlayer) {
    var titleEl = audioPlayer.querySelector('p');
    if (titleEl) {
      titleEl.textContent = '🎧 第 ' + (currentListeningIndex + 1) + ' / ' + total + ' 题 - 仔细听，选择你听到的内容';
    }
  }

  var html = '';
  for (var i = 0; i < q.options.length; i++) {
    html += '<div class="quiz-option" onclick="checkListeningAnswer(this, \'' + q.options[i].charAt(0) + '\')">' + q.options[i] + '</div>';
  }
  optsDiv.innerHTML = html;
}

/**
 * 检查听力答案
 * @param {HTMLElement} el - 被点击的选项元素
 * @param {string} selected - 选择的答案字母 (A/B/C)
 */
function checkListeningAnswer(el, selected) {
  if (currentListeningList.length === 0) return;
  var q = currentListeningList[currentListeningIndex];
  var opts = document.querySelectorAll('#listeningOptions .quiz-option');

  // 禁用所有选项
  for (var i = 0; i < opts.length; i++) {
    opts[i].style.pointerEvents = 'none';
  }

  if (selected === q.answer) {
    // 答对
    playSound('correct');
    el.classList.add('correct');
    comboCount++;
    var bonusStars = comboCount >= 3 ? 3 : 2; // 连击奖励
    userState.listeningDone++;
    userState.stars += bonusStars;
    userState.skills.lang = Math.min(100, (userState.skills.lang || 0) + 3);
    saveState();
    updateAllStats();
    checkAchievement('first_listen');
    if (comboCount >= 3) {
      showReward('连击奖励 x' + comboCount + '！', '你连续答对 ' + comboCount + ' 题！获得 ' + bonusStars + ' 颗星星！', '⭐', bonusStars);
    } else {
      showReward('听力正确！', '太棒了！你答对了！+2星星', '⭐⭐', 2);
    }
    playSound('star');

    // 自动进入下一题
    setTimeout(function() {
      currentListeningIndex++;
      if (currentListeningIndex < currentListeningList.length) {
        loadListeningQuestion();
      } else {
        // 所有题目完成，重新开始
        currentListeningList = shuffleArray(currentListeningList);
        currentListeningIndex = 0;
        loadListeningQuestion();
      }
    }, 2000);
  } else {
    // 答错
    playSound('wrong');
    comboCount = 0;
    el.classList.add('wrong');
    // 高亮正确答案
    for (var i = 0; i < opts.length; i++) {
      if (q.options[i].charAt(0) === q.answer) {
        opts[i].classList.add('correct');
      }
    }
    // 1.5秒后重置
    setTimeout(function() {
      for (var i = 0; i < opts.length; i++) {
        opts[i].classList.remove('correct', 'wrong');
        opts[i].style.pointerEvents = 'auto';
      }
    }, 1500);
  }
}

// ============================================================
// 六、口语跟读模块
// ============================================================

/** 当前口语单词列表 */
var speakWordList = [];
/** 模拟模式标记 */
var isSimulateMode = false;

/**
 * 初始化口语跟读页面
 * 从 wordData 随机抽取当前年级单词
 */
function initSpeakingPage() {
  // 获取当前年级的单词
  speakWordList = getGradeWords();
  // 随机打乱
  speakWordList = shuffleArray(speakWordList);
  // 如果没有合适的单词，使用全部
  if (speakWordList.length === 0) {
    var all = [];
    var topics = Object.keys(wordData);
    for (var t = 0; t < topics.length; t++) {
      if (Array.isArray(wordData[topics[t]])) {
        all = all.concat(wordData[topics[t]]);
      }
    }
    speakWordList = shuffleArray(all);
  }
  currentSpeakIndex = 0;
  showSpeakWord();
  setupSpeechRecognition();
}

/**
 * 显示当前口语练习单词
 */
function showSpeakWord() {
  if (speakWordList.length === 0) return;
  var w = speakWordList[currentSpeakIndex % speakWordList.length];

  var wordEl = document.getElementById('speakWord');
  var phoneticEl = document.getElementById('speakPhonetic');
  var imageEl = document.getElementById('speakImage');
  var resultEl = document.getElementById('speakResult');

  if (wordEl) wordEl.textContent = w.en;
  if (phoneticEl) phoneticEl.textContent = w.phonetic || '';
  if (imageEl) imageEl.textContent = w.emoji || '';
  if (resultEl) resultEl.textContent = '';
}

/**
 * 下一个口语单词
 */
function nextSpeakWord() {
  currentSpeakIndex++;
  showSpeakWord();
}

/**
 * 设置语音识别
 */
function setupSpeechRecognition() {
  var micBtn = document.getElementById('speakMicBtn');
  if (!micBtn) return;

  // 移除旧的事件监听器（克隆节点方式）
  var newBtn = micBtn.cloneNode(true);
  micBtn.parentNode.replaceChild(newBtn, micBtn);

  // 检查浏览器是否支持
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    isSimulateMode = false;
  } else {
    isSimulateMode = true;
    // 添加模拟模式按钮
    var container = newBtn.parentElement;
    if (container) {
      var simBtn = document.createElement('button');
      simBtn.className = 'start-btn';
      simBtn.style.cssText = 'margin-top:10px; font-size:14px; padding:10px 20px; background:#A78BFA;';
      simBtn.textContent = '📝 模拟模式（浏览器不支持语音识别）';
      simBtn.onclick = function() { simulateSpeakResult(); };
      container.insertBefore(simBtn, container.querySelector('#speakResult'));
    }
  }

  newBtn.addEventListener('mousedown', startSpeaking);
  newBtn.addEventListener('mouseup', stopSpeaking);
  newBtn.addEventListener('mouseleave', stopSpeaking);
  newBtn.addEventListener('touchstart', function(e) { e.preventDefault(); startSpeaking(); });
  newBtn.addEventListener('touchend', function(e) { e.preventDefault(); stopSpeaking(); });
}

/**
 * 开始语音识别
 */
function startSpeaking(e) {
  if (e) e.preventDefault();
  var btn = document.getElementById('speakMicBtn');
  if (!btn) return;
  btn.classList.add('recording');

  if (recognition && !isSimulateMode) {
    try { recognition.start(); } catch(e) { /* 可能已在运行 */ }
    recognition.onresult = function(event) {
      var result = event.results[0][0].transcript.toLowerCase().trim();
      var target = (document.getElementById('speakWord') || {}).textContent || '';
      target = target.toLowerCase().trim();
      evaluateSpeakResult(result, target);
    };
    recognition.onerror = function() {
      btn.classList.remove('recording');
    };
  }
}

/**
 * 停止语音识别
 */
function stopSpeaking(e) {
  if (e) e.preventDefault();
  var btn = document.getElementById('speakMicBtn');
  if (btn) btn.classList.remove('recording');
  if (recognition && !isSimulateMode) {
    try { recognition.stop(); } catch(e) { /* 忽略 */ }
  }
}

/**
 * 模拟口语识别结果
 */
function simulateSpeakResult() {
  var target = (document.getElementById('speakWord') || {}).textContent || '';
  evaluateSpeakResult(target, target.toLowerCase());
}

/**
 * 评估口语识别结果
 * @param {string} result - 识别结果
 * @param {string} target - 目标单词
 */
function evaluateSpeakResult(result, target) {
  var resultDiv = document.getElementById('speakResult');
  if (!resultDiv) return;

  // 模糊匹配：允许部分匹配
  var isCorrect = result === target || target.indexOf(result) >= 0 || result.indexOf(target) >= 0;
  // 对于多词目标（如 "good morning"），检查每个词
  if (!isCorrect && target.indexOf(' ') >= 0) {
    var targetWords = target.split(' ');
    var resultWords = result.split(' ');
    var matchCount = 0;
    for (var i = 0; i < targetWords.length; i++) {
      for (var j = 0; j < resultWords.length; j++) {
        if (targetWords[i] === resultWords[j]) { matchCount++; break; }
      }
    }
    isCorrect = matchCount >= Math.ceil(targetWords.length * 0.6);
  }

  if (isCorrect) {
    resultDiv.textContent = '✅ 发音很棒！你说的是 "' + result + '"';
    resultDiv.style.color = '#06D6A0';
    playSound('correct');
    userState.stars += 2;
    userState.skills.lang = Math.min(100, (userState.skills.lang || 0) + 3);
    saveState();
    updateAllStats();
    checkAchievement('first_speak');
    showReward('口语练习完成！', '你的发音越来越标准了！+2星星', '⭐⭐', 2);
    playSound('star');
  } else {
    resultDiv.textContent = '🤔 你说的是 "' + result + '"，目标是 "' + target + '"，再试一次！';
    resultDiv.style.color = '#FF6B6B';
    playSound('wrong');
  }
}

// ============================================================
// 七、阅读天地模块
// ============================================================

/** 阅读理解的答案缓存 */
var readingAnswerCache = {};

/**
 * 初始化阅读天地页面
 * 从 readingData 按年级筛选，高年级可以看到低年级
 */
function initReadingPage() {
  var tabs = document.getElementById('readingTabs');
  if (!tabs) return;

  var gradeLabels = { 1: '🌱 一级阅读', 2: '🌿 二级阅读', 3: '🌳 三级阅读' };
  var html = '';

  // 显示当前年级及以下的所有级别
  for (var g = 1; g <= userState.grade; g++) {
    var activeClass = (g === userState.grade) ? ' active' : '';
    html += '<button class="topic-tab' + activeClass + '" data-level="grade' + g + '" onclick="showReading(\'grade' + g + '\')">' + gradeLabels[g] + '</button>';
  }
  tabs.innerHTML = html;
  showReading('grade' + userState.grade);
}

/**
 * 显示指定级别的阅读内容
 * @param {string} level - 级别 (grade1/grade2/grade3)
 */
function showReading(level) {
  // 更新标签激活状态
  document.querySelectorAll('#readingTabs .topic-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  var activeTab = document.querySelector('#readingTabs .topic-tab[data-level="' + level + '"]');
  if (activeTab) activeTab.classList.add('active');

  var contentDiv = document.getElementById('readingContent');
  if (!contentDiv) return;

  // 获取阅读数据
  var articles = [];
  if (readingData[level] && Array.isArray(readingData[level])) {
    articles = readingData[level];
  } else if (readingData[level.replace('grade', 'level')]) {
    articles = readingData[level.replace('grade', 'level')];
  }

  if (articles.length === 0) {
    contentDiv.innerHTML = '<div class="section-container" style="text-align:center; padding:40px;"><p style="font-size:18px; color:var(--text-light);">该级别暂无阅读材料</p></div>';
    return;
  }

  readingAnswerCache = {};
  var html = '';
  for (var idx = 0; idx < articles.length; idx++) {
    var art = articles[idx];
    html += '<div class="section-container">';
    html += '<h3 style="margin-bottom:16px; color:var(--primary-dark);">' + (art.title || '') + '</h3>';
    // 文章内容，关键词高亮
    var content = (art.content || '').replace(/\n/g, '<br>');
    html += '<div class="reading-passage">' + content + '</div>';
    // 问题
    if (art.questions && art.questions.length > 0) {
      for (var qIdx = 0; qIdx < art.questions.length; qIdx++) {
        var q = art.questions[qIdx];
        var answerKey = idx + '_' + qIdx;
        html += '<div class="reading-question">';
        html += '<div class="q-text">' + (qIdx + 1) + '. ' + q.q + '</div>';
        html += '<div class="q-options">';
        for (var oIdx = 0; oIdx < q.options.length; oIdx++) {
          html += '<div class="q-option" data-key="' + answerKey + '" data-idx="' + oIdx + '" onclick="checkReadingAnswer(this, \'' + answerKey + '\', ' + oIdx + ', \'' + q.answer + '\', ' + idx + ')">' + q.options[oIdx] + '</div>';
        }
        html += '</div></div>';
      }
    }
    html += '</div>';
  }
  contentDiv.innerHTML = html;
}

/**
 * 检查阅读理解答案
 * @param {HTMLElement} el - 选项元素
 * @param {string} answerKey - 题目唯一标识
 * @param {number} selectedIdx - 选择的选项索引
 * @param {string} correctAnswer - 正确答案
 * @param {number} articleIdx - 文章索引
 */
function checkReadingAnswer(el, answerKey, selectedIdx, correctAnswer, articleIdx) {
  // 防止重复作答
  if (readingAnswerCache[answerKey]) return;
  readingAnswerCache[answerKey] = true;

  var parent = el.parentElement;
  var options = parent.querySelectorAll('.q-option');

  // 禁用所有选项
  for (var i = 0; i < options.length; i++) {
    options[i].style.pointerEvents = 'none';
  }

  // 将正确答案字母转换为索引
  var correctIdx = correctAnswer.charCodeAt(0) - 65;
  if (isNaN(correctIdx) || correctIdx < 0) correctIdx = parseInt(correctAnswer);

  if (selectedIdx === correctIdx) {
    // 答对
    el.classList.add('selected');
    el.style.background = '#06D6A0';
    el.style.color = 'white';
    userState.stars += 1;
    userState.readingDone++;
    userState.skills.think = Math.min(100, (userState.skills.think || 0) + 3);
    userState.skills.culture = Math.min(100, (userState.skills.culture || 0) + 2);
    saveState();
    updateAllStats();
    checkAchievement('first_read');
    playSound('correct');
  } else {
    // 答错
    el.style.background = '#FF6B6B';
    el.style.color = 'white';
    // 高亮正确答案
    if (options[correctIdx]) {
      options[correctIdx].style.background = '#06D6A0';
      options[correctIdx].style.color = 'white';
    }
    playSound('wrong');
  }
}

// ============================================================
// 八、语法练习模块
// ============================================================

/** 当前语法专题索引 */
var currentGrammarTopic = -1;
/** 当前语法题目索引 */
var currentGrammarQIdx = 0;

/**
 * 初始化语法练习页面
 * 从 grammarData 按年级筛选，左侧列表+右侧内容
 */
function initGrammarPage() {
  var container = document.getElementById('grammarContainer');
  if (!container) return;

  // 按年级筛选语法专题
  var maxGrade = userState.grade === 1 ? 2 : (userState.grade === 2 ? 4 : 6);
  var filteredTopics = [];
  if (Array.isArray(grammarData)) {
    for (var i = 0; i < grammarData.length; i++) {
      if (!grammarData[i].grade || grammarData[i].grade <= maxGrade) {
        filteredTopics.push(grammarData[i]);
      }
    }
  }

  if (filteredTopics.length === 0) {
    container.innerHTML = '<div class="section-container" style="text-align:center; padding:40px;"><p style="color:var(--text-light);">当前年级暂无语法练习</p></div>';
    return;
  }

  var html = '<div style="display:flex; gap:20px; flex-wrap:wrap;">';
  // 左侧: 语法知识点列表
  html += '<div style="min-width:220px; max-width:260px; flex-shrink:0;">';
  html += '<div class="section-container" style="padding:16px;">';
  html += '<h3 style="margin-bottom:12px; font-size:16px;">📖 语法专题</h3>';
  for (var i = 0; i < filteredTopics.length; i++) {
    html += '<div class="nav-item" data-gidx="' + i + '" onclick="selectGrammarTopic(' + i + ')" style="margin:4px 0; padding:10px 16px; border-radius:8px; cursor:pointer; font-size:14px;' + (i === 0 ? ' background:var(--primary); color:white;' : '') + '">';
    html += filteredTopics[i].topic;
    html += '</div>';
  }
  html += '</div></div>';

  // 右侧: 内容展示区
  html += '<div style="flex:1; min-width:300px;" id="grammarDetail">';
  html += '</div>';
  html += '</div>';

  container.innerHTML = html;

  // 默认选中第一个专题
  if (filteredTopics.length > 0) {
    selectGrammarTopic(0);
  }
}

/**
 * 选择语法专题
 * @param {number} idx - 专题索引（在筛选后的数组中）
 */
function selectGrammarTopic(idx) {
  var maxGrade = userState.grade === 1 ? 2 : (userState.grade === 2 ? 4 : 6);
  var filteredTopics = [];
  if (Array.isArray(grammarData)) {
    for (var i = 0; i < grammarData.length; i++) {
      if (!grammarData[i].grade || grammarData[i].grade <= maxGrade) {
        filteredTopics.push(grammarData[i]);
      }
    }
  }

  if (idx < 0 || idx >= filteredTopics.length) return;
  currentGrammarTopic = idx;
  currentGrammarQIdx = 0;

  // 更新左侧高亮
  var items = document.querySelectorAll('#grammarContainer .nav-item[data-gidx]');
  items.forEach(function(item) {
    if (parseInt(item.dataset.gidx) === idx) {
      item.style.background = 'var(--primary)';
      item.style.color = 'white';
    } else {
      item.style.background = '';
      item.style.color = '';
    }
  });

  var topic = filteredTopics[idx];
  var contentDiv = document.getElementById('grammarDetail');
  if (!contentDiv) return;

  var typeLabel = { fill: '填空题', choice: '选择题', transform: '句型转换' };
  var html = '<div class="section-container">';
  // 语法讲解
  html += '<h3 style="color:var(--primary-dark); margin-bottom:12px;">' + topic.topic + '</h3>';
  html += '<div style="background:var(--bg); padding:20px; border-radius:12px; margin-bottom:24px; line-height:1.8; font-size:15px;">';
  html += '📝 <strong>语法讲解：</strong>' + (topic.explanation || '');
  html += '</div>';
  // 练习题标题
  html += '<h4 style="margin-bottom:16px;">✏️ 练习题（' + (typeLabel[topic.exercise_type] || topic.exercise_type) + '）</h4>';
  html += '<div id="grammarQuestions"></div>';
  html += '</div>';

  contentDiv.innerHTML = html;
  loadGrammarQuestion();
}

/**
 * 加载当前语法题目
 */
function loadGrammarQuestion() {
  var maxGrade = userState.grade === 1 ? 2 : (userState.grade === 2 ? 4 : 6);
  var filteredTopics = [];
  if (Array.isArray(grammarData)) {
    for (var i = 0; i < grammarData.length; i++) {
      if (!grammarData[i].grade || grammarData[i].grade <= maxGrade) {
        filteredTopics.push(grammarData[i]);
      }
    }
  }

  if (currentGrammarTopic < 0 || currentGrammarTopic >= filteredTopics.length) return;
  var topic = filteredTopics[currentGrammarTopic];
  if (!topic.questions || currentGrammarQIdx >= topic.questions.length) {
    // 所有题目完成
    completeGrammarExercise();
    return;
  }

  var q = topic.questions[currentGrammarQIdx];
  var qDiv = document.getElementById('grammarQuestions');
  if (!qDiv) return;

  var total = topic.questions.length;
  var html = '<p style="color:var(--text-light); margin-bottom:16px;">第 ' + (currentGrammarQIdx + 1) + ' / ' + total + ' 题</p>';
  html += '<p style="font-size:18px; font-weight:600; margin-bottom:20px; padding:16px; background:#FFF8F5; border-radius:12px;">' + q.q + '</p>';

  if (topic.exercise_type === 'fill' || topic.exercise_type === 'transform') {
    // 填空/转换题用选项方式呈现
    html += '<div class="quiz-options">';
    for (var i = 0; i < q.options.length; i++) {
      html += '<div class="quiz-option" onclick="checkGrammarAnswer(this, \'' + q.options[i].charAt(0) + '\')">' + q.options[i] + '</div>';
    }
    html += '</div>';
  } else {
    // 选择题
    html += '<div class="quiz-options">';
    for (var i = 0; i < q.options.length; i++) {
      html += '<div class="quiz-option" onclick="checkGrammarAnswer(this, \'' + q.options[i].charAt(0) + '\')">' + q.options[i] + '</div>';
    }
    html += '</div>';
  }

  qDiv.innerHTML = html;
}

/**
 * 检查语法答案
 * @param {HTMLElement} el - 选项元素
 * @param {string} selected - 选择的答案
 */
function checkGrammarAnswer(el, selected) {
  var maxGrade = userState.grade === 1 ? 2 : (userState.grade === 2 ? 4 : 6);
  var filteredTopics = [];
  if (Array.isArray(grammarData)) {
    for (var i = 0; i < grammarData.length; i++) {
      if (!grammarData[i].grade || grammarData[i].grade <= maxGrade) {
        filteredTopics.push(grammarData[i]);
      }
    }
  }

  if (currentGrammarTopic < 0 || currentGrammarTopic >= filteredTopics.length) return;
  var topic = filteredTopics[currentGrammarTopic];
  if (!topic.questions) return;
  var q = topic.questions[currentGrammarQIdx];
  var opts = document.querySelectorAll('#grammarQuestions .quiz-option');

  // 禁用所有选项
  for (var i = 0; i < opts.length; i++) {
    opts[i].style.pointerEvents = 'none';
  }

  if (selected === q.answer) {
    el.classList.add('correct');
    playSound('correct');
    comboCount++;
    setTimeout(function() {
      currentGrammarQIdx++;
      loadGrammarQuestion();
    }, 800);
  } else {
    el.classList.add('wrong');
    playSound('wrong');
    comboCount = 0;
    // 高亮正确答案
    for (var i = 0; i < opts.length; i++) {
      if (topic.questions[currentGrammarQIdx].options[i].charAt(0) === q.answer) {
        opts[i].classList.add('correct');
      }
    }
    setTimeout(function() {
      currentGrammarQIdx++;
      loadGrammarQuestion();
    }, 1500);
  }
}

/**
 * 完成语法练习后的处理
 */
function completeGrammarExercise() {
  var qDiv = document.getElementById('grammarQuestions');
  if (qDiv) {
    qDiv.innerHTML = '<div style="text-align:center; padding:30px;">' +
      '<div style="font-size:60px; margin-bottom:16px;">🎉</div>' +
      '<h3 style="color:var(--primary-dark);">练习完成！</h3>' +
      '<p style="color:var(--text-light); margin:12px 0;">你已经完成了这组语法练习</p>' +
      '<button class="start-btn" onclick="selectGrammarTopic(' + currentGrammarTopic + ')" style="font-size:16px; padding:12px 30px;">再练一次 🔄</button>' +
      '</div>';
  }
  userState.grammarDone++;
  userState.stars += 2;
  userState.skills.think = Math.min(100, (userState.skills.think || 0) + 4);
  saveState();
  updateAllStats();
  checkAchievement('grammar_star');
  showReward('语法练习完成！', '你获得了2颗星星！继续保持！', '⭐⭐', 2);
  playSound('star');
}

// ============================================================
// 九、自然拼读模块
// ============================================================

/** 当前拼读分类tab */
var currentPhonicsTab = 'letters';

/**
 * 初始化自然拼读页面
 * 从 phonicsData 读取，按分类显示
 */
function initPhonicsPage() {
  var container = document.getElementById('phonicsContainer');
  if (!container) return;

  // 分类数据
  var categories = classifyPhonics();

  var html = '<div class="topic-tabs" id="phonicsTabs">';
  var tabs = [
    { key: 'letters',  label: '🔤 字母发音' },
    { key: 'vowels',   label: '🅰️ 元音组合' },
    { key: 'consonants', label: '📍 辅音组合' },
    { key: 'magice',   label: '✨ Magic E' },
    { key: 'rcontrol', label: '🔄 R控制' }
  ];
  for (var i = 0; i < tabs.length; i++) {
    html += '<button class="topic-tab' + (i === 0 ? ' active' : '') + '" onclick="showPhonicsCategory(\'' + tabs[i].key + '\')">' + tabs[i].label + '</button>';
  }
  html += '</div>';
  html += '<div id="phonicsGrid"></div>';
  html += '<div id="phonicsExercise" style="margin-top:20px;"></div>';

  container.innerHTML = html;
  showPhonicsCategory('letters');
}

/**
 * 将 phonicsData 分类
 * @returns {Object}
 */
function classifyPhonics() {
  var categories = {
    letters: [],
    vowels: [],
    consonants: [],
    magice: [],
    rcontrol: []
  };

  if (!Array.isArray(phonicsData)) return categories;

  for (var i = 0; i < phonicsData.length; i++) {
    var p = phonicsData[i].pattern;
    if (p.indexOf('...e') >= 0) {
      categories.magice.push(phonicsData[i]);
    } else if (p === 'ar' || p === 'er' || p === 'ir' || p === 'or' || p === 'ur') {
      categories.rcontrol.push(phonicsData[i]);
    } else if (p.length <= 3 && /^[a-z]+$/.test(p.replace(/[^a-z]/g, ''))) {
      // 短的纯字母模式 -> 字母发音
      if (p.length <= 2 && !p.match(/(ai|ay|ee|ea|ie|oa|oo|ou|oi|oy|ow|ue|ui|ew|aw|au|ey|igh)/)) {
        categories.letters.push(phonicsData[i]);
      } else if (p.match(/(ai|ay|ee|ea|ie|oa|oo|ou|oi|oy|ow|ue|ui|ew|aw|au|ey|igh)/)) {
        categories.vowels.push(phonicsData[i]);
      } else {
        categories.letters.push(phonicsData[i]);
      }
    } else {
      categories.consonants.push(phonicsData[i]);
    }
  }

  return categories;
}

/**
 * 显示指定分类的自然拼读内容
 * @param {string} category - 分类名
 */
function showPhonicsCategory(category) {
  currentPhonicsTab = category;

  // 更新tab高亮
  document.querySelectorAll('#phonicsTabs .topic-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  // 通过文本内容匹配
  var allTabs = document.querySelectorAll('#phonicsTabs .topic-tab');
  allTabs.forEach(function(t) {
    if (t.textContent.indexOf(getPhonicsTabLabel(category)) >= 0) {
      t.classList.add('active');
    }
  });

  var categories = classifyPhonics();
  var items = categories[category] || [];
  var contentDiv = document.getElementById('phonicsGrid');
  if (!contentDiv) return;

  if (items.length === 0) {
    contentDiv.innerHTML = '<div class="section-container" style="text-align:center; padding:30px; color:var(--text-light);">该分类暂无内容</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    html += '<div class="section-container" style="margin-bottom:16px; padding:20px;">';
    // 规则标题
    html += '<div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">';
    html += '<span style="font-size:28px; font-weight:800; color:var(--primary-dark); background:var(--bg); padding:8px 16px; border-radius:12px; font-family:monospace;">' + item.pattern + '</span>';
    html += '<span style="font-size:22px; color:var(--accent); font-weight:700;">' + item.sound + '</span>';
    html += '</div>';
    // 例词列表
    html += '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;">';
    for (var j = 0; j < item.words.length; j++) {
      html += '<span style="background:var(--bg); padding:6px 14px; border-radius:20px; cursor:pointer; font-weight:600; transition:all 0.2s;" onclick="speak(\'' + item.words[j] + '\')" onmouseover="this.style.background=\'var(--primary)\'; this.style.color=\'white\'" onmouseout="this.style.background=\'var(--bg)\'; this.style.color=\'var(--text)\'">' + item.words[j] + ' 🔊</span>';
    }
    html += '</div>';
    // 例句
    html += '<div style="font-size:14px; color:var(--text-light); cursor:pointer; padding:8px 12px; background:#FFF8F5; border-radius:8px;" onclick="speak(\'' + item.example_sentence.replace(/'/g, "\\'") + '\')">';
    html += '💬 ' + item.example_sentence + ' 🔊';
    html += '</div>';
    html += '</div>';
  }

  contentDiv.innerHTML = html;

  // 显示互动练习
  showPhonicsExercise(category, items);
}

/**
 * 获取拼读分类标签文本
 * @param {string} category
 * @returns {string}
 */
function getPhonicsTabLabel(category) {
  var labels = { letters: '字母发音', vowels: '元音组合', consonants: '辅音组合', magice: 'Magic E', rcontrol: 'R控制' };
  return labels[category] || category;
}

/**
 * 显示拼读互动练习
 * @param {string} category
 * @param {Array} items
 */
function showPhonicsExercise(category, items) {
  var exDiv = document.getElementById('phonicsExercise');
  if (!exDiv || items.length === 0) return;

  // 随机选一个规则，给出单词让用户选择正确的发音规则
  var allWords = [];
  for (var i = 0; i < items.length; i++) {
    for (var j = 0; j < items[i].words.length; j++) {
      allWords.push({ word: items[i].words[j], pattern: items[i].pattern, sound: items[i].sound });
    }
  }
  allWords = shuffleArray(allWords);

  // 选3个不同规则的选项
  var options = [];
  var usedPatterns = {};
  for (var i = 0; i < items.length && options.length < 4; i++) {
    if (!usedPatterns[items[i].pattern]) {
      options.push({ pattern: items[i].pattern, sound: items[i].sound });
      usedPatterns[items[i].pattern] = true;
    }
  }

  if (allWords.length === 0 || options.length < 2) return;

  var target = allWords[0];
  var shuffledOptions = shuffleArray(options.slice());

  var html = '<div class="section-container">';
  html += '<h3 style="margin-bottom:16px;">🎮 拼读小练习</h3>';
  html += '<p style="margin-bottom:8px; font-size:16px;">这个单词应该用哪个发音规则？</p>';
  html += '<div style="font-size:36px; font-weight:800; color:var(--primary-dark); text-align:center; padding:20px; background:var(--bg); border-radius:16px; margin-bottom:20px; cursor:pointer;" onclick="speak(\'' + target.word + '\')">' + target.word + ' 🔊</div>';
  html += '<div class="quiz-options">';
  for (var i = 0; i < shuffledOptions.length; i++) {
    html += '<div class="quiz-option" onclick="checkPhonicsAnswer(this, \'' + shuffledOptions[i].pattern.replace(/'/g, "\\'") + '\', \'' + target.pattern.replace(/'/g, "\\'") + '\')">' + shuffledOptions[i].pattern + '  ' + shuffledOptions[i].sound + '</div>';
  }
  html += '</div>';
  html += '<button class="start-btn" onclick="showPhonicsCategory(\'' + category + '\')" style="margin-top:16px; font-size:14px; padding:10px 24px;">换一题 🔄</button>';
  html += '</div>';

  exDiv.innerHTML = html;
}

/**
 * 检查拼读答案
 * @param {HTMLElement} el
 * @param {string} selected
 * @param {string} correct
 */
function checkPhonicsAnswer(el, selected, correct) {
  var opts = el.parentElement.querySelectorAll('.quiz-option');
  for (var i = 0; i < opts.length; i++) {
    opts[i].style.pointerEvents = 'none';
  }

  if (selected === correct) {
    el.classList.add('correct');
    playSound('correct');
    userState.phonicsDone++;
    userState.stars += 1;
    userState.skills.lang = Math.min(100, (userState.skills.lang || 0) + 2);
    saveState();
    updateAllStats();
    checkAchievement('phonics_star');
  } else {
    el.classList.add('wrong');
    playSound('wrong');
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].textContent.indexOf(correct) >= 0) {
        opts[i].classList.add('correct');
      }
    }
  }
}

// ============================================================
// 十、互动游戏模块
// ============================================================

/**
 * 初始化游戏页面
 */
function initGamesPage() {
  var gameArea = document.getElementById('gameArea');
  if (gameArea) gameArea.innerHTML = '';

  // 动态添加新游戏卡片（如果不存在）
  var gamesGrid = document.querySelector('#games-page .modules-grid');
  if (gamesGrid) {
    var existingGames = gamesGrid.querySelectorAll('.module-card');
    var existingOnclicks = [];
    existingGames.forEach(function(c) {
      if (c.getAttribute('onclick')) existingOnclicks.push(c.getAttribute('onclick'));
    });

    // 检查是否已有新增游戏
    if (existingOnclicks.indexOf('startSpellingGame()') < 0) {
      var spellingCard = document.createElement('div');
      spellingCard.className = 'module-card';
      spellingCard.setAttribute('onclick', 'startSpellingGame()');
      spellingCard.innerHTML = '<div class="module-icon">🔤</div><div class="module-name">听音拼写</div><div class="module-desc">听发音，拼出正确的单词</div>';
      gamesGrid.appendChild(spellingCard);
    }
    if (existingOnclicks.indexOf('startMatchGame()') < 0) {
      var matchCard = document.createElement('div');
      matchCard.className = 'module-card';
      matchCard.setAttribute('onclick', 'startMatchGame()');
      matchCard.innerHTML = '<div class="module-icon">🔗</div><div class="module-name">英中配对</div><div class="module-desc">英文和中文连线配对</div>';
      gamesGrid.appendChild(matchCard);
    }
  }
}

/**
 * 记忆翻牌配对游戏
 */
function startMemoryGame() {
  currentGame = 'memory';
  var gameArea = document.getElementById('gameArea');
  if (!gameArea) return;

  var allWords = getGradeWords();
  var gameWords = allWords.slice(0, 6);
  if (gameWords.length < 4) gameWords = allWords.slice(0, Math.max(4, allWords.length));
  var cards = [];
  for (var i = 0; i < gameWords.length; i++) {
    cards.push({ en: gameWords[i].en, cn: gameWords[i].cn, emoji: gameWords[i].emoji || '', type: 'en' });
    cards.push({ en: gameWords[i].en, cn: gameWords[i].cn, emoji: gameWords[i].emoji || '', type: 'cn' });
  }
  cards = shuffleArray(cards);

  var flipped = [];
  var matched = 0;
  var totalPairs = gameWords.length;

  gameArea.innerHTML = '<div class="section-container">' +
    '<h3 style="margin-bottom:20px;">🃏 记忆翻牌 - 找出英文和中文的配对</h3>' +
    '<div class="memory-grid" id="memoryGrid" style="grid-template-columns:repeat(' + Math.min(4, cards.length) + ',1fr);"></div>' +
    '<p style="margin-top:20px; text-align:center; color:var(--text-light);">已配对: <span id="matchCount">0</span> / ' + totalPairs + '</p>' +
    '</div>';

  var grid = document.getElementById('memoryGrid');
  var html = '';
  for (var i = 0; i < cards.length; i++) {
    html += '<button class="memory-card" data-index="' + i + '" data-pair="' + cards[i].en + '" data-type="' + cards[i].type + '">❓</button>';
  }
  grid.innerHTML = html;

  grid.querySelectorAll('.memory-card').forEach(function(card) {
    card.addEventListener('click', function() {
      if (card.classList.contains('flipped') || card.classList.contains('matched') || flipped.length >= 2) return;

      var idx = parseInt(card.dataset.index);
      card.classList.add('flipped');
      var c = cards[idx];
      if (c.type === 'en') {
        card.textContent = (c.emoji || '') + ' ' + c.en;
      } else {
        card.textContent = (c.emoji || '') + ' ' + c.cn;
      }
      flipped.push(card);

      if (flipped.length === 2) {
        if (flipped[0].dataset.pair === flipped[1].dataset.pair && flipped[0].dataset.type !== flipped[1].dataset.type) {
          setTimeout(function() {
            flipped.forEach(function(c) {
              c.classList.remove('flipped');
              c.classList.add('matched');
              c.textContent = '✅';
            });
            matched++;
            var mc = document.getElementById('matchCount');
            if (mc) mc.textContent = matched;
            flipped = [];

            if (matched === totalPairs) {
              userState.gamesDone++;
              userState.stars += 5;
              userState.skills.think = Math.min(100, (userState.skills.think || 0) + 5);
              saveState();
              updateAllStats();
              checkAchievement('game_master');
              showReward('游戏通关！', '你的记忆力太棒了！+5星星', '⭐⭐⭐⭐⭐', 5);
              playSound('star');
            } else {
              playSound('correct');
            }
          }, 500);
        } else {
          setTimeout(function() {
            flipped.forEach(function(c) {
              c.classList.remove('flipped');
              c.textContent = '❓';
            });
            flipped = [];
          }, 1000);
        }
      }
    });
  });
}

/**
 * 字母拼词游戏
 */
function startScrambleGame() {
  currentGame = 'scramble';
  var gameArea = document.getElementById('gameArea');
  if (!gameArea) return;

  var allWords = getGradeWords();
  if (allWords.length === 0) return;

  var currentWord = null;
  var answer = [];

  function loadScramble() {
    // 随机选一个合适的单词（长度3-8）
    var suitable = allWords.filter(function(w) { return w.en.length >= 3 && w.en.length <= 8; });
    if (suitable.length === 0) suitable = allWords;
    currentWord = suitable[Math.floor(Math.random() * suitable.length)];
    answer = [];
    var letters = currentWord.en.split('').sort(function() { return Math.random() - 0.5; });

    gameArea.innerHTML = '<div class="section-container word-scramble">' +
      '<h3 style="margin-bottom:10px;">🔤 单词拼拼乐</h3>' +
      '<p style="color:var(--text-light); margin-bottom:10px;">提示: ' + currentWord.cn + ' ' + (currentWord.emoji || '') + '</p>' +
      (currentWord.phonetic ? '<p style="color:var(--text-light); margin-bottom:10px;">音标: ' + currentWord.phonetic + ' <span style="cursor:pointer;" onclick="speak(\'' + currentWord.en.replace(/'/g, "\\'") + '\')">🔊</span></p>' : '') +
      '<div class="scramble-letters" id="scrambleLetters"></div>' +
      '<div class="scramble-answer" id="scrambleAnswer"></div>' +
      '<div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">' +
      '<button class="start-btn" onclick="checkScramble()" style="font-size:16px; padding:12px 24px;">确认 ✅</button>' +
      '<button class="start-btn" onclick="clearScrambleAnswer()" style="font-size:16px; padding:12px 24px; background:#A78BFA;">清空 🗑️</button>' +
      '<button class="start-btn" onclick="startScrambleGame()" style="font-size:16px; padding:12px 24px; background:var(--bg);">换一题 🔄</button>' +
      '</div>' +
      '<div id="scrambleResult" style="margin-top:15px; font-weight:700;"></div>' +
      '</div>';

    var lettersDiv = document.getElementById('scrambleLetters');
    var lhtml = '';
    for (var i = 0; i < letters.length; i++) {
      lhtml += '<div class="scramble-letter" data-letter="' + letters[i] + '" data-index="' + i + '">' + letters[i].toUpperCase() + '</div>';
    }
    lettersDiv.innerHTML = lhtml;

    // 绑定字母点击事件
    lettersDiv.querySelectorAll('.scramble-letter').forEach(function(el) {
      el.addEventListener('click', function() {
        if (el.style.visibility === 'hidden') return;
        var letter = el.dataset.letter;
        var idx = parseInt(el.dataset.index);
        answer.push({ letter: letter, idx: idx });
        el.style.visibility = 'hidden';
        updateScrambleAnswerDisplay();
      });
    });

    updateScrambleAnswerDisplay();
  }

  window.checkScramble = function() {
    var result = '';
    for (var i = 0; i < answer.length; i++) result += answer[i].letter;
    var resultDiv = document.getElementById('scrambleResult');
    if (!resultDiv) return;
    if (result.toLowerCase() === currentWord.en.toLowerCase()) {
      resultDiv.textContent = '✅ 拼对了！太棒了！';
      resultDiv.style.color = '#06D6A0';
      playSound('correct');
      userState.gamesDone++;
      userState.stars += 3;
      userState.skills.learn = Math.min(100, (userState.skills.learn || 0) + 3);
      saveState();
      updateAllStats();
      checkAchievement('game_master');
      setTimeout(function() {
        showReward('拼词成功！', '你正确拼出了 "' + currentWord.en + '" +3星星', '⭐⭐⭐', 3);
        playSound('star');
      }, 300);
    } else {
      resultDiv.textContent = '❌ 再试试看！提示：' + currentWord.cn;
      resultDiv.style.color = '#FF6B6B';
      playSound('wrong');
    }
  };

  window.clearScrambleAnswer = function() {
    var lettersDiv = document.getElementById('scrambleLetters');
    if (lettersDiv) {
      lettersDiv.querySelectorAll('.scramble-letter').forEach(function(el) {
        el.style.visibility = 'visible';
      });
    }
    answer = [];
    updateScrambleAnswerDisplay();
  };

  function updateScrambleAnswerDisplay() {
    var ansDiv = document.getElementById('scrambleAnswer');
    if (!ansDiv) return;
    var html = '';
    for (var i = 0; i < answer.length; i++) {
      html += '<div class="answer-slot" data-ans-idx="' + i + '">' + answer[i].letter.toUpperCase() + '</div>';
    }
    ansDiv.innerHTML = html;

    // 绑定点击移除
    ansDiv.querySelectorAll('.answer-slot').forEach(function(el) {
      el.addEventListener('click', function() {
        var aIdx = parseInt(el.dataset.ansIdx);
        var removed = answer.splice(aIdx, 1)[0];
        var lettersDiv = document.getElementById('scrambleLetters');
        if (lettersDiv) {
          var letterEl = lettersDiv.querySelector('.scramble-letter[data-index="' + removed.idx + '"]');
          if (letterEl) letterEl.style.visibility = 'visible';
        }
        updateScrambleAnswerDisplay();
      });
    });
  }

  loadScramble();
}

/**
 * 句子填空游戏
 */
function startFillGame() {
  currentGame = 'fill';
  var gameArea = document.getElementById('gameArea');
  if (!gameArea) return;

  // 从已学单词和常见单词中生成填空题
  var allWords = getGradeWords();
  var sentences = [
    { text: 'The ___ is red.', answer: 'apple', hint: '🍎 一种水果' },
    { text: 'I have a pet ___.', answer: 'cat', hint: '🐱 一种动物' },
    { text: 'The sky is ___.', answer: 'blue', hint: '🔵 一种颜色' },
    { text: 'I go to ___ every day.', answer: 'school', hint: '🏫 学习的地方' },
    { text: 'My ___ cooks food for me.', answer: 'mother', hint: '👩 家庭成员' },
    { text: 'I like to ___ books.', answer: 'read', hint: '📖 一个动作' },
    { text: 'The ___ is very big.', answer: 'elephant', hint: '🐘 最大的动物' },
    { text: 'It is ___ today.', answer: 'sunny', hint: '☀️ 天气描述' },
  ];

  // 用实际单词替换部分句子
  if (allWords.length > 0) {
    for (var i = 0; i < Math.min(3, allWords.length); i++) {
      var w = allWords[Math.floor(Math.random() * allWords.length)];
      if (w.example) {
        sentences.push({ text: w.example, answer: w.en, hint: (w.emoji || '') + ' ' + w.cn });
      }
    }
  }

  var current = 0;

  function loadFill() {
    if (current >= sentences.length) {
      // 全部完成
      userState.gamesDone++;
      saveState();
      checkAchievement('game_master');
      showReward('挑战完成！', '你完成了所有填空题！+5星星', '⭐⭐⭐⭐⭐', 5);
      playSound('star');
      gameArea.innerHTML = '<div class="section-container" style="text-align:center; padding:30px;">' +
        '<div style="font-size:60px;">🎉</div><h3>填空挑战完成！</h3></div>';
      return;
    }

    var s = sentences[current];
    gameArea.innerHTML = '<div class="section-container">' +
      '<h3 style="margin-bottom:20px;">✏️ 填空挑战</h3>' +
      '<p style="font-size:20px; margin-bottom:20px; padding:20px; background:#FFF8F5; border-radius:12px;">' +
      s.text.replace('___', '<span style="display:inline-block; min-width:80px; border-bottom:2px solid var(--primary); text-align:center;">_____</span>') +
      '</p>' +
      '<p style="color:var(--text-light); margin-bottom:20px;">提示: ' + s.hint + '</p>' +
      '<div style="display:flex; gap:10px; justify-content:center; align-items:center;">' +
      '<input type="text" id="fillInput" style="padding:12px 20px; font-size:18px; border:2px solid #E2E8F0; border-radius:12px; width:200px; text-align:center;" placeholder="输入单词" onkeydown="if(event.key===\'Enter\')checkFillAnswer()">' +
      '<button class="start-btn" onclick="checkFillAnswer()" style="font-size:16px; padding:12px 24px;">提交 ✅</button>' +
      '</div>' +
      '<div id="fillResult" style="margin-top:15px; font-weight:700;"></div>' +
      '<p style="margin-top:20px; color:var(--text-light);">题目 ' + (current + 1) + ' / ' + sentences.length + '</p>' +
      '</div>';

    var fillInput = document.getElementById('fillInput');
    if (fillInput) fillInput.focus();
  }

  window.checkFillAnswer = function() {
    var input = document.getElementById('fillInput');
    var resultDiv = document.getElementById('fillResult');
    if (!input || !resultDiv) return;
    var val = input.value.toLowerCase().trim();

    if (val === sentences[current].answer.toLowerCase()) {
      resultDiv.textContent = '✅ 回答正确！';
      resultDiv.style.color = '#06D6A0';
      playSound('correct');
      userState.stars += 2;
      saveState();
      updateAllStats();
      setTimeout(function() {
        current++;
        loadFill();
      }, 1000);
    } else {
      resultDiv.textContent = '❌ 答案不对，再想想！提示：' + sentences[current].answer.charAt(0) + '...';
      resultDiv.style.color = '#FF6B6B';
      playSound('wrong');
    }
  };

  loadFill();
}

/**
 * 听音拼写游戏（新增）
 * 播放单词发音，用户拼出字母
 */
function startSpellingGame() {
  currentGame = 'spelling';
  var gameArea = document.getElementById('gameArea');
  if (!gameArea) return;

  var allWords = getGradeWords().filter(function(w) { return w.en.length >= 3 && w.en.length <= 8; });
  if (allWords.length === 0) return;

  var currentWord = allWords[Math.floor(Math.random() * allWords.length)];
  var totalRounds = 5;
  var currentRound = 0;
  var score = 0;

  function loadSpelling() {
    if (currentRound >= totalRounds) {
      gameArea.innerHTML = '<div class="section-container" style="text-align:center; padding:30px;">' +
        '<div style="font-size:60px; margin-bottom:16px;">🏆</div>' +
        '<h3 style="color:var(--primary-dark);">听音拼写完成！</h3>' +
        '<p style="font-size:18px; margin:12px 0;">你答对了 ' + score + ' / ' + totalRounds + ' 题</p>' +
        '<p style="color:var(--text-light);">获得 ' + (score * 2) + ' 颗星星</p>' +
        '<button class="start-btn" onclick="startSpellingGame()" style="margin-top:20px;">再玩一次 🔄</button>' +
        '</div>';
      userState.gamesDone++;
      userState.stars += score * 2;
      userState.skills.learn = Math.min(100, (userState.skills.learn || 0) + score * 2);
      saveState();
      updateAllStats();
      checkAchievement('game_master');
      if (score > 0) showReward('拼写完成！', '答对 ' + score + ' 题！+' + (score * 2) + '星星', '⭐', score * 2);
      return;
    }

    currentWord = allWords[Math.floor(Math.random() * allWords.length)];

    gameArea.innerHTML = '<div class="section-container" style="text-align:center;">' +
      '<h3 style="margin-bottom:20px;">🔤 听音拼写 - 第 ' + (currentRound + 1) + ' / ' + totalRounds + ' 题</h3>' +
      '<p style="color:var(--text-light); margin-bottom:12px;">提示: ' + currentWord.cn + ' ' + (currentWord.emoji || '') + '</p>' +
      (currentWord.phonetic ? '<p style="color:var(--text-light); margin-bottom:12px;">音标: ' + currentWord.phonetic + '</p>' : '') +
      '<div style="margin:20px 0;">' +
      '<button class="play-btn" style="width:80px; height:80px; font-size:36px; border-radius:50%; background:var(--primary); color:white; border:none; cursor:pointer;" onclick="speak(\'' + currentWord.en.replace(/'/g, "\\'") + '\')">🔊</button>' +
      '<p style="margin-top:8px; color:var(--text-light);">点击播放发音</p>' +
      '</div>' +
      '<input type="text" id="spellingInput" style="padding:14px 24px; font-size:22px; border:2px solid #E2E8F0; border-radius:12px; width:250px; text-align:center; letter-spacing:4px; font-weight:700;" placeholder="输入你听到的单词" autocomplete="off" onkeydown="if(event.key===\'Enter\')checkSpellingAnswer()">' +
      '<br>' +
      '<button class="start-btn" onclick="checkSpellingAnswer()" style="margin-top:16px; font-size:16px; padding:12px 30px;">提交 ✅</button>' +
      '<div id="spellingResult" style="margin-top:15px; font-weight:700; min-height:30px;"></div>' +
      '</div>';

    // 自动播放发音
    setTimeout(function() { speak(currentWord.en); }, 500);
    var inp = document.getElementById('spellingInput');
    if (inp) inp.focus();
  }

  window.checkSpellingAnswer = function() {
    var input = document.getElementById('spellingInput');
    var resultDiv = document.getElementById('spellingResult');
    if (!input || !resultDiv) return;
    var val = input.value.toLowerCase().trim();

    if (val === currentWord.en.toLowerCase()) {
      resultDiv.textContent = '✅ 拼写正确！"' + currentWord.en + '" - ' + currentWord.cn;
      resultDiv.style.color = '#06D6A0';
      playSound('correct');
      score++;
    } else {
      resultDiv.textContent = '❌ 正确答案是: ' + currentWord.en;
      resultDiv.style.color = '#FF6B6B';
      playSound('wrong');
    }

    setTimeout(function() {
      currentRound++;
      loadSpelling();
    }, 2000);
  };

  loadSpelling();
}

/**
 * 英文中文配对连连看（新增）
 */
function startMatchGame() {
  currentGame = 'match';
  var gameArea = document.getElementById('gameArea');
  if (!gameArea) return;

  var allWords = getGradeWords();
  var gameWords = shuffleArray(allWords).slice(0, 5);
  if (gameWords.length < 3) gameWords = shuffleArray(allWords).slice(0, Math.max(3, allWords.length));

  var selectedEn = null;
  var selectedCn = null;
  var matchedCount = 0;

  // 打乱英文和中文顺序
  var enList = shuffleArray(gameWords.slice());
  var cnList = shuffleArray(gameWords.slice());

  var html = '<div class="section-container">';
  html += '<h3 style="margin-bottom:20px;">🔗 英中配对连连看</h3>';
  html += '<p style="color:var(--text-light); margin-bottom:20px;">点击左边的英文，再点击右边对应的中文</p>';
  html += '<div style="display:flex; gap:30px; justify-content:center; flex-wrap:wrap;">';

  // 英文列
  html += '<div id="matchEnList" style="display:flex; flex-direction:column; gap:10px; min-width:160px;">';
  for (var i = 0; i < enList.length; i++) {
    html += '<div class="quiz-option match-en" data-word="' + enList[i].en + '" style="padding:12px 20px; text-align:center; cursor:pointer;">' + enList[i].en + '</div>';
  }
  html += '</div>';

  // 中文列
  html += '<div id="matchCnList" style="display:flex; flex-direction:column; gap:10px; min-width:160px;">';
  for (var i = 0; i < cnList.length; i++) {
    html += '<div class="quiz-option match-cn" data-word="' + cnList[i].en + '" style="padding:12px 20px; text-align:center; cursor:pointer;">' + (cnList[i].emoji || '') + ' ' + cnList[i].cn + '</div>';
  }
  html += '</div>';

  html += '</div>';
  html += '<p style="margin-top:20px; text-align:center; color:var(--text-light);">已配对: <span id="matchPairCount">0</span> / ' + gameWords.length + '</p>';
  html += '</div>';

  gameArea.innerHTML = html;

  // 绑定英文点击
  gameArea.querySelectorAll('.match-en').forEach(function(el) {
    el.addEventListener('click', function() {
      if (el.classList.contains('matched')) return;
      // 清除之前的英文选中
      gameArea.querySelectorAll('.match-en').forEach(function(e) { e.style.border = '2px solid #E2E8F0'; });
      el.style.border = '3px solid var(--primary)';
      el.style.background = '#FFF8F5';
      selectedEn = el.dataset.word;
      tryMatch();
    });
  });

  // 绑定中文点击
  gameArea.querySelectorAll('.match-cn').forEach(function(el) {
    el.addEventListener('click', function() {
      if (el.classList.contains('matched')) return;
      // 清除之前的中文选中
      gameArea.querySelectorAll('.match-cn').forEach(function(e) { e.style.border = '2px solid #E2E8F0'; });
      el.style.border = '3px solid var(--accent)';
      el.style.background = '#FFF0F0';
      selectedCn = el.dataset.word;
      tryMatch();
    });
  });

  function tryMatch() {
    if (!selectedEn || !selectedCn) return;

    var enEl = gameArea.querySelector('.match-en[data-word="' + selectedEn + '"]');
    var cnEl = gameArea.querySelector('.match-cn[data-word="' + selectedCn + '"]');

    if (selectedEn === selectedCn) {
      // 配对成功
      if (enEl) { enEl.classList.add('correct', 'matched'); enEl.style.border = ''; enEl.style.background = ''; }
      if (cnEl) { cnEl.classList.add('correct', 'matched'); cnEl.style.border = ''; cnEl.style.background = ''; }
      matchedCount++;
      var mc = document.getElementById('matchPairCount');
      if (mc) mc.textContent = matchedCount;
      playSound('correct');
      selectedEn = null;
      selectedCn = null;

      if (matchedCount === gameWords.length) {
        userState.gamesDone++;
        userState.stars += 4;
        userState.skills.learn = Math.min(100, (userState.skills.learn || 0) + 4);
        saveState();
        updateAllStats();
        checkAchievement('game_master');
        showReward('配对完成！', '你成功配对了所有单词！+4星星', '⭐⭐⭐⭐', 4);
        playSound('star');
      }
    } else {
      // 配对失败
      playSound('wrong');
      if (enEl) { enEl.style.border = '2px solid var(--accent)'; enEl.classList.add('shake'); }
      if (cnEl) { cnEl.style.border = '2px solid var(--accent)'; cnEl.classList.add('shake'); }
      setTimeout(function() {
        if (enEl) { enEl.style.border = '2px solid #E2E8F0'; enEl.style.background = ''; enEl.classList.remove('shake'); }
        if (cnEl) { cnEl.style.border = '2px solid #E2E8F0'; cnEl.style.background = ''; cnEl.classList.remove('shake'); }
        selectedEn = null;
        selectedCn = null;
      }, 800);
    }
  }
}

// ============================================================
// 十一、资源宝库
// ============================================================

/**
 * 初始化资源宝库页面
 * 英文儿歌、绘本故事、动画视频三个tab
 */
function initResourcesPage() {
  var tabs = document.getElementById('resourceTabs');
  if (!tabs) return;

  var types = ['songs', 'stories', 'videos'];
  var labels = ['🎵 英文儿歌', '📚 绘本故事', '📺 动画视频'];

  var html = '';
  for (var i = 0; i < types.length; i++) {
    html += '<button class="topic-tab' + (i === 0 ? ' active' : '') + '" data-type="' + types[i] + '" onclick="showResources(\'' + types[i] + '\')">' + labels[i] + '</button>';
  }
  tabs.innerHTML = html;
  showResources('songs');
}

/**
 * 显示指定类型的资源
 * @param {string} type - songs/stories/videos
 */
function showResources(type) {
  // 更新tab高亮
  document.querySelectorAll('#resourceTabs .topic-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  var activeTab = document.querySelector('#resourceTabs .topic-tab[data-type="' + type + '"]');
  if (activeTab) activeTab.classList.add('active');

  var grid = document.getElementById('resourceGrid');
  if (!grid) return;

  var data = resourceData[type] || [];
  var html = '';
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    html += '<div class="resource-card" onclick="showResourceDetail(\'' + type + '\', ' + i + ')">' +
      '<div class="resource-thumb">' + (r.emoji || '') + '</div>' +
      '<div class="resource-info">' +
      '<div class="resource-title">' + r.title + '</div>' +
      '<div class="resource-meta">' + (r.desc || '') + '</div>' +
      '</div></div>';
  }
  grid.innerHTML = html;
}

/**
 * 显示资源详情模态框
 * @param {string} type
 * @param {number} idx
 */
function showResourceDetail(type, idx) {
  var data = resourceData[type] || [];
  if (idx < 0 || idx >= data.length) return;
  var r = data[idx];

  var overlay = document.getElementById('rewardOverlay');
  var popup = overlay ? overlay.querySelector('.reward-popup') : null;
  if (!overlay || !popup) return;

  popup.innerHTML = '<div style="font-size:60px; margin-bottom:16px;">' + (r.emoji || '') + '</div>' +
    '<div class="reward-text" style="margin-bottom:12px;">' + r.title + '</div>' +
    '<p style="color:var(--text-light); line-height:1.8; margin-bottom:20px; text-align:left;">' + (r.detail || r.desc || '暂无详细介绍') + '</p>' +
    '<button class="start-btn" onclick="closeReward()" style="margin-top:10px; font-size:16px; padding:12px 30px;">关闭</button>';

  overlay.classList.add('active');
}

// ============================================================
// 十二、每日打卡功能
// ============================================================

/**
 * 执行每日打卡
 */
function dailyCheckIn() {
  var today = getTodayStr();
  if (userState.dailyCheckIn) {
    showReward('今天已打卡', '你今天已经打过卡了，明天再来吧！', '✅', 0);
    return;
  }

  userState.dailyCheckIn = true;
  userState.streak = (userState.streak || 0) + 1;
  userState.totalDays = (userState.totalDays || 0) + 1;
  userState.stars += 1;
  saveState();
  updateAllStats();
  renderDashboard();

  // 检查打卡成就
  if (userState.streak >= 3) checkAchievement('streak_3');
  if (userState.streak >= 7) checkAchievement('streak_7');
  if (userState.streak >= 30) checkAchievement('streak_30');

  showReward('打卡成功！', '连续打卡 ' + userState.streak + ' 天！+1星星', '🔥', 1);
  playSound('star');
}

/**
 * 渲染打卡日历（最近7天）
 * @returns {string} HTML字符串
 */
function renderCheckInCalendar() {
  var html = '<div style="display:flex; gap:8px; justify-content:center; margin:12px 0; flex-wrap:wrap;">';
  var today = new Date();

  for (var i = 6; i >= 0; i--) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    var isToday = (i === 0);
    var isChecked = (dateStr === userState.lastLoginDate && userState.dailyCheckIn) ||
                    (dateStr !== getTodayStr() && i < userState.streak);
    // 简化判断：最近 streak 天（不含今天如果未打卡）都标记为已打卡
    if (i === 0) {
      isChecked = userState.dailyCheckIn;
    } else if (i < userState.streak) {
      isChecked = true;
    } else {
      isChecked = false;
    }

    var bgColor = isChecked ? 'var(--primary)' : 'var(--bg)';
    var textColor = isChecked ? 'white' : 'var(--text-light)';
    var label = d.getDate() + '日';

    html += '<div style="text-align:center; padding:8px 12px; border-radius:10px; background:' + bgColor + '; color:' + textColor + '; min-width:48px;">';
    html += '<div style="font-size:11px;">' + (isToday ? '今天' : label) + '</div>';
    html += '<div style="font-size:18px;">' + (isChecked ? '✅' : '⬜') + '</div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// ============================================================
// 十三、排行榜
// ============================================================

/**
 * 渲染排行榜
 * @returns {string} HTML字符串
 */
function renderLeaderboard() {
  var leaderboard = getLeaderboard();
  if (leaderboard.length === 0) {
    return '<p style="color:var(--text-light); text-align:center;">暂无排行数据</p>';
  }

  var html = '<table style="width:100%; border-collapse:collapse; font-size:14px;">';
  html += '<thead><tr style="background:var(--bg);">';
  html += '<th style="padding:10px; text-align:left; border-radius:8px 0 0 0;">排名</th>';
  html += '<th style="padding:10px; text-align:left;">名字</th>';
  html += '<th style="padding:10px; text-align:center;">年级</th>';
  html += '<th style="padding:10px; text-align:center;">星星</th>';
  html += '<th style="padding:10px; text-align:center; border-radius:0 8px 0 0;">连续打卡</th>';
  html += '</tr></thead><tbody>';

  for (var i = 0; i < Math.min(leaderboard.length, 10); i++) {
    var entry = leaderboard[i];
    var isMe = entry.name === userState.name;
    var rowStyle = isMe ? 'background:#FFF8F5; font-weight:700;' : (i % 2 === 1 ? 'background:#FFF8F5;' : '');
    var rankIcon = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : (i + 1)));

    html += '<tr style="' + rowStyle + '">';
    html += '<td style="padding:10px;">' + rankIcon + '</td>';
    html += '<td style="padding:10px;">' + entry.name + (isMe ? ' (我)' : '') + '</td>';
    html += '<td style="padding:10px; text-align:center;">' + getGradeLabel(entry.grade || 1) + '</td>';
    html += '<td style="padding:10px; text-align:center;">⭐ ' + (entry.stars || 0) + '</td>';
    html += '<td style="padding:10px; text-align:center;">🔥 ' + (entry.streak || 0) + '天</td>';
    html += '</tr>';
  }

  html += '</tbody></table>';
  return html;
}

// ============================================================
// 十四、学习进度页
// ============================================================

/**
 * 初始化学习进度页面
 * 四大核心素养进度条 + 成就徽章 + 统计数据
 */
function initProgressPage() {
  // 计算各技能值
  var totalWords = 0;
  var topics = Object.keys(wordData);
  for (var t = 0; t < topics.length; t++) {
    if (Array.isArray(wordData[topics[t]])) totalWords += wordData[topics[t]].length;
  }

  var langSkill = Math.min((userState.skills.lang || 0), 100);
  var cultureSkill = Math.min((userState.skills.culture || 0), 100);
  var thinkSkill = Math.min((userState.skills.think || 0), 100);
  var learnSkill = Math.min((userState.skills.learn || 0), 100);

  // 如果技能值为0，用简化方式计算
  if (langSkill === 0 && userState.wordsLearned.length > 0) {
    langSkill = Math.min(userState.wordsLearned.length / Math.max(totalWords, 1) * 100 + userState.listeningDone * 5, 100);
  }
  if (cultureSkill === 0 && userState.readingDone > 0) {
    cultureSkill = Math.min(userState.readingDone * 15 + userState.wordsLearned.length * 2, 100);
  }
  if (thinkSkill === 0 && (userState.gamesDone > 0 || userState.grammarDone > 0)) {
    thinkSkill = Math.min((userState.gamesDone + userState.grammarDone) * 8, 100);
  }
  if (learnSkill === 0) {
    learnSkill = Math.min((userState.wordsLearned.length + userState.listeningDone + userState.readingDone + userState.gamesDone + userState.grammarDone + userState.phonicsDone) * 3, 100);
  }

  // 更新进度条
  var ids = [
    ['skillLang', 'barLang', langSkill],
    ['skillCulture', 'barCulture', cultureSkill],
    ['skillThink', 'barThink', thinkSkill],
    ['skillLearn', 'barLearn', learnSkill]
  ];
  for (var i = 0; i < ids.length; i++) {
    var labelEl = document.getElementById(ids[i][0]);
    var barEl = document.getElementById(ids[i][1]);
    if (labelEl) labelEl.textContent = Math.round(ids[i][2]) + '%';
    if (barEl) barEl.style.width = ids[i][2] + '%';
  }

  // 成就徽章
  var achGrid = document.getElementById('achievementGrid');
  if (achGrid) {
    var html = '';
    for (var i = 0; i < achievements.length; i++) {
      var a = achievements[i];
      var unlocked = userState.achievements.indexOf(a.id) >= 0;
      html += '<div class="achievement-item' + (unlocked ? ' unlocked' : '') + '" title="' + a.desc + '">';
      html += '<div class="achievement-icon">' + (unlocked ? a.icon : '🔒') + '</div>';
      html += '<div class="achievement-name">' + a.name + '</div>';
      html += '<div style="font-size:11px; color:var(--text-light); margin-top:4px;">' + a.desc + '</div>';
      html += '</div>';
    }
    achGrid.innerHTML = html;
  }
}

// ============================================================
// 十五、家长统计面板
// ============================================================

/**
 * 初始化家长统计面板
 * 本周/本月学习天数、各模块完成数量、薄弱环节分析、建议
 */
function initStatsPage() {
  var container = document.getElementById('statsContainer');
  if (!container) return;

  // 计算学习天数
  var today = new Date();
  var weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  var monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // 简化的学习天数计算（基于 totalDays 和 streak）
  var weekDays = Math.min(userState.streak, 7);
  var monthDays = Math.min(userState.totalDays, 30);

  // 各模块完成数量
  var modules = [
    { name: '单词学习', done: userState.wordsLearned.length, icon: '📚', total: '持续学习中' },
    { name: '听力练习', done: userState.listeningDone, icon: '👂', total: '每次+2星' },
    { name: '阅读理解', done: userState.readingDone, icon: '📖', total: '每次+1星' },
    { name: '互动游戏', done: userState.gamesDone, icon: '🎮', total: '每次+3-5星' },
    { name: '语法练习', done: userState.grammarDone, icon: '📝', total: '每次+2星' },
    { name: '自然拼读', done: userState.phonicsDone, icon: '🔤', total: '每次+1星' },
    { name: '口语跟读', done: 0, icon: '🎤', total: '持续练习中' },
  ];

  // 薄弱环节分析
  var weakModules = [];
  var totalDone = 0;
  for (var i = 0; i < modules.length; i++) totalDone += modules[i].done;
  var avg = totalDone / modules.length;

  for (var i = 0; i < modules.length; i++) {
    if (modules[i].done < avg * 0.5 && modules[i].done < 3) {
      weakModules.push(modules[i]);
    }
  }

  // 生成建议
  var suggestions = [];
  if (weakModules.length > 0) {
    suggestions.push('建议加强以下薄弱模块的练习：' + weakModules.map(function(m) { return m.name; }).join('、'));
  }
  if (userState.streak < 3) {
    suggestions.push('坚持每天打卡，培养学习习惯！');
  }
  if (userState.wordsLearned.length < 10) {
    suggestions.push('单词量还不够，建议每天学习5个新单词。');
  }
  if (userState.listeningDone < 3) {
    suggestions.push('听力练习不足，建议多听多练，提高听辨能力。');
  }
  if (userState.readingDone < 3) {
    suggestions.push('阅读量偏少，建议每天完成一篇阅读理解。');
  }
  if (suggestions.length === 0) {
    suggestions.push('学习非常全面，继续保持！可以尝试更高难度的内容。');
  }

  var html = '';

  // 基本统计卡片
  html += '<div class="dashboard-stats">';
  html += '<div class="stat-card"><div class="stat-icon">📅</div><div class="stat-label">本周学习</div><div class="stat-value">' + weekDays + '天</div></div>';
  html += '<div class="stat-card"><div class="stat-icon">📆</div><div class="stat-label">本月学习</div><div class="stat-value">' + monthDays + '天</div></div>';
  html += '<div class="stat-card"><div class="stat-icon">🔥</div><div class="stat-label">连续打卡</div><div class="stat-value">' + userState.streak + '天</div></div>';
  html += '<div class="stat-card"><div class="stat-icon">⭐</div><div class="stat-label">总星星数</div><div class="stat-value">' + userState.stars + '</div></div>';
  html += '</div>';

  // 各模块完成情况
  html += '<div class="section-container" style="margin-top:20px;">';
  html += '<h3 style="margin-bottom:16px;">📈 各模块完成情况</h3>';
  html += '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:12px;">';
  for (var i = 0; i < modules.length; i++) {
    var m = modules[i];
    var isWeak = false;
    for (var j = 0; j < weakModules.length; j++) {
      if (weakModules[j].name === m.name) { isWeak = true; break; }
    }
    html += '<div style="padding:16px; border-radius:12px; background:' + (isWeak ? '#FFF0F0' : 'var(--bg)') + '; border:1px solid ' + (isWeak ? 'var(--accent)' : '#E2E8F0') + ';">';
    html += '<div style="font-size:24px; margin-bottom:6px;">' + m.icon + '</div>';
    html += '<div style="font-weight:700; margin-bottom:4px;">' + m.name + '</div>';
    html += '<div style="font-size:24px; font-weight:800; color:var(--primary-dark);">' + m.done + '</div>';
    html += '<div style="font-size:12px; color:var(--text-light);">' + m.total + '</div>';
    if (isWeak) html += '<div style="color:var(--accent); font-size:12px; margin-top:4px;">⚠️ 需要加强</div>';
    html += '</div>';
  }
  html += '</div></div>';

  // 薄弱环节分析
  if (weakModules.length > 0) {
    html += '<div class="section-container" style="margin-top:20px; border-left:4px solid var(--accent);">';
    html += '<h3 style="margin-bottom:12px; color:var(--accent);">⚠️ 薄弱环节分析</h3>';
    html += '<p style="color:var(--text); line-height:1.8;">以下模块练习量较少，建议增加练习频次：</p>';
    html += '<ul style="margin:12px 0; padding-left:20px;">';
    for (var i = 0; i < weakModules.length; i++) {
      html += '<li style="margin-bottom:6px;">' + weakModules[i].icon + ' <strong>' + weakModules[i].name + '</strong>：已完成 ' + weakModules[i].done + ' 次</li>';
    }
    html += '</ul></div>';
  }

  // 学习建议
  html += '<div class="section-container" style="margin-top:20px; border-left:4px solid var(--primary);">';
  html += '<h3 style="margin-bottom:12px; color:var(--primary-dark);">💡 学习建议</h3>';
  html += '<ul style="padding-left:20px; line-height:2;">';
  for (var i = 0; i < suggestions.length; i++) {
    html += '<li>' + suggestions[i] + '</li>';
  }
  html += '</ul></div>';

  // 排行榜
  html += '<div class="section-container" style="margin-top:20px;">';
  html += '<h3 style="margin-bottom:16px;">🏆 排行榜</h3>';
  html += renderLeaderboard();
  html += '</div>';

  container.innerHTML = html;
}

// ============================================================
// 十六、奖励弹窗
// ============================================================

/**
 * 显示短暂的 Toast 提示（不弹窗，在角落一闪而过）
 * @param {string} text - 提示文字
 */
function showToast(text) {
  var toast = document.getElementById('toastTip');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastTip';
    toast.style.cssText = 'position:fixed; top:90px; left:50%; transform:translateX(-50%) scale(0.9); background:linear-gradient(135deg,#FF6B6B,#FF9F43); color:white; padding:10px 24px; border-radius:50px; font-weight:700; font-size:15px; z-index:2000; box-shadow:0 6px 20px rgba(255,107,107,0.3); opacity:0; transition:all 0.4s; pointer-events:none; white-space:nowrap;';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) scale(1)';
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) scale(0.9)';
  }, 1500);
}

/**
 * 显示奖励弹窗
 * @param {string} title - 标题
 * @param {string} desc - 描述
 * @param {string} starIcon - 星星图标
 * @param {number} count - 星星数量
 */
function showReward(title, desc, starIcon, count) {
  var overlay = document.getElementById('rewardOverlay');
  if (!overlay) return;

  var popup = overlay.querySelector('.reward-popup');
  if (popup) {
    // 保存自定义内容标记
    popup.setAttribute('data-custom', 'false');
    popup.innerHTML =
      '<div class="reward-icon">🎉</div>' +
      '<div class="reward-text" id="rewardText">' + title + '</div>' +
      '<div class="reward-stars" id="rewardStars">' + (starIcon || '⭐').repeat(count || 1) + '</div>' +
      '<p id="rewardDesc">' + desc + '</p>' +
      '<button class="start-btn" onclick="closeReward()" style="margin-top:20px; font-size:16px; padding:12px 30px;">继续加油 💪</button>';
  }

  overlay.classList.add('active');
}

/**
 * 关闭奖励弹窗
 */
function closeReward() {
  var overlay = document.getElementById('rewardOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    // 恢复默认弹窗结构
    var popup = overlay.querySelector('.reward-popup');
    if (popup) {
      popup.innerHTML =
        '<div class="reward-icon">🎉</div>' +
        '<div class="reward-text" id="rewardText"></div>' +
        '<div class="reward-stars" id="rewardStars"></div>' +
        '<p id="rewardDesc"></p>' +
        '<button class="start-btn" onclick="closeReward()" style="margin-top:20px;">继续加油 💪</button>';
    }
  }
}

// ============================================================
// 十七、音效系统
// ============================================================

/**
 * 初始化 AudioContext
 */
function initAudioContext() {
  try {
    if (!audioCtx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
  } catch (e) {
    console.warn('无法创建 AudioContext:', e);
  }
}

/**
 * 播放音效
 * @param {string} type - 音效类型: correct/wrong/star
 */
function playSound(type) {
  initAudioContext();
  if (!audioCtx) return;

  try {
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    var now = audioCtx.currentTime;

    switch (type) {
      case 'correct':
        // 正确音效: 上升音调短音
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);       // C5
        osc.frequency.linearRampToValueAtTime(784, now + 0.15); // G5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'wrong':
        // 错误音效: 下降音调短音
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(250, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'star':
        // 获得星星: 欢快短音 (三连音)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659, now);        // E5
        osc.frequency.setValueAtTime(784, now + 0.1);  // G5
        osc.frequency.setValueAtTime(1047, now + 0.2); // C6
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      default:
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
  } catch (e) {
    // 音效播放失败，静默处理
  }
}

// ============================================================
// 十八、语音合成 (speak 函数)
// 三层声音架构：词典真人录音 > Google Translate TTS > 系统 TTS女声
// ============================================================

/** 音频缓存 */
var audioCache = {};

/** 当前验证码（模拟短信验证） */
var currentCode = '';

/** 已选定的固定英文TTS女声（降级方案用） */
var selectedEnVoice = null;
/** 已选定的固定中文TTS女声（降级方案用） */
var selectedCnVoice = null;

/**
 * 初始化并锁定TTS声音，优先选择温暖自然的女声
 */
function initVoices() {
  if (!('speechSynthesis' in window)) return;

  function trySelect() {
    var voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return;

    // 英文声音：优先英式男声（与词典API英式男声一致）
    var enVoice = null;
    var preferred = ['Google UK English Male',
                     'Daniel',               // macOS英式男声
                     'Microsoft George',     // Windows英式男声
                     'Microsoft David',      // Windows美式男声
                     'Alex',                 // macOS美式男声
                     'Google US English Male',
                     'Oliver', 'Arthur', 'Ralph'];
    for (var i = 0; i < preferred.length; i++) {
      enVoice = voices.find(function(v) { return v.name.indexOf(preferred[i]) >= 0; });
      if (enVoice) break;
    }
    if (!enVoice) {
      enVoice = voices.find(function(v) {
        return v.lang.indexOf('en') === 0 && v.name.toLowerCase().indexOf('male') >= 0;
      });
    }
    if (!enVoice) enVoice = voices.find(function(v) { return v.lang === 'en-GB'; });
    if (!enVoice) enVoice = voices.find(function(v) { return v.lang.indexOf('en') === 0; });
    selectedEnVoice = enVoice || null;

    // 中文声音：优先男声
    var cnVoice = null;
    var cnP = ['Microsoft Kangkang',  // 康康，男声
               'Google 普通话',
               'Yunyang',              // 男声
               'Microsoft Huihui',
               'Ting-Ting',
               'Sin-ji'];
    for (var i = 0; i < cnP.length; i++) {
      cnVoice = voices.find(function(v) { return v.name.indexOf(cnP[i]) >= 0; });
      if (cnVoice) break;
    }
    if (!cnVoice) cnVoice = voices.find(function(v) { return v.lang.indexOf('zh') === 0; });
    selectedCnVoice = cnVoice || null;
  }

  trySelect();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = trySelect;
  }
}

/**
 * 朗读英文（单词/句子），统一用TTS英式男声，零延迟不卡顿
 * @param {string} text - 要朗读的文本
 * @param {number} repeatCount - 播放次数（默认2遍）
 */
function speak(text, repeatCount) {
  if (!text) return;
  stopAllAudio();
  var times = repeatCount || 2;
  speakWithTTS(text, times);
}

/**
 * 朗读中文，用TTS男声（与英文统一）
 */
function speakCN(text) {
  if (!text) return;
  stopAllAudio();
  speakCNTTS(text);
}

/**
 * 停止所有音频
 */
function stopAllAudio() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

/**
 * 请求 Free Dictionary API 获取真人发音
 * 英式优先，美式其次，有缓存
 * @param {string} word - 英文单词
 * @param {number} times - 播放次数
 */
function fetchDictAudio(word, times) {
  times = times || 2;
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word), true);
    xhr.timeout = 3000;
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (Array.isArray(data) && data.length > 0 && data[0].phonetics) {
            var p = data[0].phonetics, url = '';
            for (var i = 0; i < p.length; i++) { if (p[i].audio && p[i].audio.indexOf('-uk.mp3') > -1) { url = p[i].audio; break; } }
            if (!url) { for (var i = 0; i < p.length; i++) { if (p[i].audio && p[i].audio.indexOf('-us.mp3') > -1) { url = p[i].audio; break; } } }
            if (!url) { for (var i = 0; i < p.length; i++) { if (p[i].audio && p[i].audio.length > 0) { url = p[i].audio; break; } } }
            if (url) {
              if (url.indexOf('//') === 0) url = 'https:' + url;
              audioCache[word] = url;
              playCachedAudio(url, times);
              return;
            }
          }
        } catch (e) {}
      }
      // 词典无音频，降级到TTS男声
      speakWithTTS(word, times > 1);
    };
    xhr.onerror = function() { speakWithTTS(word, times > 1); };
    xhr.ontimeout = function() { speakWithTTS(word, times > 1); };
    xhr.send();
  } catch (e) { speakWithTTS(word, times > 1); }
}

/**
 * 播放缓存的真人发音，支持指定播放次数
 * @param {string} url - MP3音频URL
 * @param {number} times - 播放次数
 */
function playCachedAudio(url, times) {
  times = times || 1;
  try {
    var audio = new Audio(url);
    audio.id = 'dictAudio';
    audio.volume = 1.0;
    var played = 1;
    audio.onended = function() {
      if (played < times) {
        played++;
        setTimeout(function() {
          var a2 = new Audio(url);
          a2.id = 'dictAudio' + played;
          a2.volume = 1.0;
          a2.onended = audio.onended;
          a2.play().catch(function() {});
          audio = a2;
        }, 800);
      }
    };
    audio.play().catch(function() { speakWithTTS(url.split('/').pop().replace(/-.{2}\.mp3$/, ''), times > 1); });
  } catch (e) { speakWithTTS(url, times > 1); }
}

/**
 * Google Translate TTS（谷歌翻译同款声音，自然人声）
 */
function playGoogleTTS(text, lang, playTwice) {
  try {
    var url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=' + lang + '&client=tw-ob&q=' + encodeURIComponent(text);
    var audio = new Audio(url);
    audio.id = 'gAudio';
    audio.volume = 1.0;
    audio.play().then(function() {
      if (playTwice) {
        audio.onended = function() {
          setTimeout(function() {
            var a2 = new Audio(url);
            a2.id = 'gAudio2';
            a2.volume = 1.0;
            a2.play().catch(function() {});
          }, 800);
        };
      }
    }).catch(function() {
      if (lang.indexOf('en') === 0) speakWithTTS(text, playTwice); else speakCNTTS(text);
    });
    setTimeout(function() {
      if (audio.readyState === 0 || audio.paused) {
        audio.pause();
        if (lang.indexOf('en') === 0) speakWithTTS(text, playTwice); else speakCNTTS(text);
      }
    }, 3000);
  } catch (e) {
    if (lang.indexOf('en') === 0) speakWithTTS(text, playTwice); else speakCNTTS(text);
  }
}

/**
 * Web Speech API 英文朗读（锁定英式男声），支持指定播放次数
 * @param {string} text - 要朗读的文本
 * @param {number} times - 播放次数
 */
function speakWithTTS(text, times) {
  if (!('speechSynthesis' in window)) return;
  times = times || 1;
  window.speechSynthesis.cancel();

  function playOnce() {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.rate = 0.85;
    u.pitch = 1.0;
    u.volume = 1.0;
    if (selectedEnVoice) u.voice = selectedEnVoice;
    return u;
  }

  var remaining = times;
  function speakNext() {
    if (remaining <= 0) return;
    var u = playOnce();
    u.onend = function() {
      remaining--;
      if (remaining > 0) {
        setTimeout(speakNext, 800);
      }
    };
    window.speechSynthesis.speak(u);
  }
  speakNext();
}

/**
 * Web Speech API 中文降级（锁定女声）
 */
function speakCNTTS(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  var utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-CN';
  utter.rate = 0.85;
  utter.pitch = 1.1;
  utter.volume = 1.0;
  if (selectedCnVoice) utter.voice = selectedCnVoice;
  window.speechSynthesis.speak(utter);
}

// ============================================================
// 十九、初始化 & 仪表盘
// ============================================================

/**
 * 渲染仪表盘
 * 更新统计数据、打卡区域、排行榜等
 */
function renderDashboard() {
  updateAllStats();

  // 在仪表盘中添加打卡和排行榜区域（如果不存在）
  var dashboard = document.getElementById('dashboard-page');
  if (!dashboard) return;

  // 移除旧的动态区域
  var oldExtra = document.getElementById('dashboardExtra');
  if (oldExtra) oldExtra.remove();

  var extra = document.createElement('div');
  extra.id = 'dashboardExtra';
  extra.style.marginTop = '30px';

  var html = '';

  // 打卡区域
  html += '<div class="section-container" style="text-align:center;">';
  html += '<h3 style="margin-bottom:12px;">📅 每日打卡</h3>';
  html += '<p style="color:var(--text-light); margin-bottom:12px;">连续打卡 <strong style="color:var(--accent); font-size:24px;">' + (userState.streak || 0) + '</strong> 天 | 总学习 <strong style="color:var(--primary-dark); font-size:24px;">' + (userState.totalDays || 0) + '</strong> 天</p>';
  html += renderCheckInCalendar();
  if (!userState.dailyCheckIn) {
    html += '<button class="start-btn" onclick="dailyCheckIn()" style="margin-top:12px; font-size:16px; padding:12px 30px; background:linear-gradient(135deg, var(--primary), var(--accent)); color:white;">签到打卡 📅</button>';
  } else {
    html += '<p style="margin-top:12px; color:#06D6A0; font-weight:700;">✅ 今天已完成打卡</p>';
  }
  html += '</div>';

  // 排行榜（简要）
  var leaderboard = getLeaderboard();
  if (leaderboard.length > 0) {
    html += '<div class="section-container" style="margin-top:20px;">';
    html += '<h3 style="margin-bottom:12px;">🏆 排行榜 <span style="font-size:14px; font-weight:400; color:var(--text-light); cursor:pointer;" onclick="navigateTo(\'stats\')">查看详情 →</span></h3>';
    html += renderLeaderboard();
    html += '</div>';
  }

  // 模块快捷入口补充（语法、拼读）
  var hasGrammarCard = false;
  var hasPhonicsCard = false;
  var modulesGrid = dashboard.querySelector('.modules-grid');
  if (modulesGrid) {
    modulesGrid.querySelectorAll('.module-card').forEach(function(c) {
      var onclick = c.getAttribute('onclick') || '';
      if (onclick.indexOf('grammar') >= 0) hasGrammarCard = true;
      if (onclick.indexOf('phonics') >= 0) hasPhonicsCard = true;
    });

    if (!hasGrammarCard) {
      var gc = document.createElement('div');
      gc.className = 'module-card';
      gc.setAttribute('onclick', "navigateTo('grammar')");
      gc.innerHTML = '<div class="module-icon">📝</div><div class="module-name">语法练习</div><div class="module-desc">系统学习语法知识</div><div class="module-progress"><div class="module-progress-bar" style="width:' + Math.min(userState.grammarDone * 15, 100) + '%"></div></div>';
      modulesGrid.appendChild(gc);
    }
    if (!hasPhonicsCard) {
      var pc = document.createElement('div');
      pc.className = 'module-card';
      pc.setAttribute('onclick', "navigateTo('phonics')");
      pc.innerHTML = '<div class="module-icon">🔤</div><div class="module-name">自然拼读</div><div class="module-desc">学习发音规律</div><div class="module-progress"><div class="module-progress-bar" style="width:' + Math.min(userState.phonicsDone * 15, 100) + '%"></div></div>';
      modulesGrid.appendChild(pc);
    }
  }

  extra.innerHTML = html;
  dashboard.appendChild(extra);
}

/**
 * 更新所有统计数据
 */
function updateAllStats() {
  var starCountEl = document.getElementById('starCount');
  if (starCountEl) starCountEl.textContent = userState.stars;

  var statWordsEl = document.getElementById('statWords');
  if (statWordsEl) statWordsEl.textContent = userState.wordsLearned.length;

  var statListeningEl = document.getElementById('statListening');
  if (statListeningEl) statListeningEl.textContent = userState.listeningDone;

  var statReadingEl = document.getElementById('statReading');
  if (statReadingEl) statReadingEl.textContent = userState.readingDone;

  var statStarsEl = document.getElementById('statStars');
  if (statStarsEl) statStarsEl.textContent = userState.stars;

  // 更新进度条
  var totalWords = 0;
  var topics = Object.keys(wordData);
  for (var t = 0; t < topics.length; t++) {
    if (Array.isArray(wordData[topics[t]])) totalWords += wordData[topics[t]].length;
  }

  var progressWordsEl = document.getElementById('progressWords');
  if (progressWordsEl) progressWordsEl.style.width = Math.min(userState.wordsLearned.length / Math.max(totalWords, 1) * 100, 100) + '%';

  var progressListeningEl = document.getElementById('progressListening');
  if (progressListeningEl) progressListeningEl.style.width = Math.min(userState.listeningDone * 15, 100) + '%';

  var progressSpeakingEl = document.getElementById('progressSpeaking');
  if (progressSpeakingEl) progressSpeakingEl.style.width = Math.min(userState.listeningDone * 10, 100) + '%';

  var progressReadingEl = document.getElementById('progressReading');
  if (progressReadingEl) progressReadingEl.style.width = Math.min(userState.readingDone * 20, 100) + '%';

  var progressGamesEl = document.getElementById('progressGames');
  if (progressGamesEl) progressGamesEl.style.width = Math.min(userState.gamesDone * 15, 100) + '%';

  // 更新年级标签
  var gradeBadgeEl = document.getElementById('gradeBadge');
  if (gradeBadgeEl) gradeBadgeEl.textContent = getGradeLabel(userState.grade);

  // 更新用户头像
  var avatarEl = document.getElementById('userAvatar');
  if (avatarEl && userState.name) avatarEl.textContent = '#' + userState.name;
}

/**
 * 检查并解锁成就
 * @param {string} id - 成就ID
 */
function checkAchievement(id) {
  if (userState.achievements.indexOf(id) < 0) {
    userState.achievements.push(id);
    saveState();

    // 检查全能学霸成就
    if (id !== 'all_modules') {
      var allDone = userState.wordsLearned.length > 0 &&
                    userState.listeningDone > 0 &&
                    userState.readingDone > 0 &&
                    userState.gamesDone > 0 &&
                    userState.grammarDone > 0 &&
                    userState.phonicsDone > 0;
      if (allDone) checkAchievement('all_modules');
    }
  }
}

// ============================================================
// 工具函数
// ============================================================

/**
 * 随机打乱数组（Fisher-Yates 洗牌算法）
 * @param {Array} arr
 * @returns {Array}
 */
function shuffleArray(arr) {
  var result = arr.slice();
  for (var i = result.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

// ============================================================
// 全局初始化入口
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  // 加载保存的用户状态
  loadState();

  // 初始化固定TTS声音（锁定一个声音，避免人声不统一）
  initVoices();

  // 初始化音效系统（需要用户交互后才能使用）
  document.body.addEventListener('click', function initOnce() {
    initAudioContext();
    document.body.removeEventListener('click', initOnce);
  }, { once: true });

  // 设置欢迎页面
  setupWelcomePage();

  // 设置导航系统（动态添加缺失的导航项）
  setupNavigation();

  // 检查今日是否已打卡
  var today = getTodayStr();
  if (userState.lastLoginDate !== today) {
    // 今天是新的登录日
    checkStreakOnLogin();
    saveState();
  }

  // 始终显示欢迎页面，让用户主动选择进入
  // setupWelcomePage 中已处理：有旧记录时显示"继续学习"按钮
});