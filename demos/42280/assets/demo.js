// assets/demo.js — Demo interaction logic for "独居不孤单"

(function() {
  'use strict';

  // ===== State =====
  var state = {
    health: 72,
    mood: 65,
    bond: 58,
    xp: 280,
    xpMax: 400,
    level: 5,
    totalXP: 0,
    completedTasks: 0,
    totalTasks: 5,
    selectedMood: null,
    petCount: 0
  };

  var tasks = [
    { id: 1, text: '喝一杯温水', reward: '+5 健康值', category: 'health', catLabel: '健康', xp: 10, stat: 'health', statGain: 5, completed: false },
    { id: 2, text: '出门散步 15 分钟', reward: '+8 健康值', category: 'health', catLabel: '健康', xp: 15, stat: 'health', statGain: 8, completed: false },
    { id: 3, text: '读 10 页书', reward: '+6 心情值', category: 'growth', catLabel: '成长', xp: 12, stat: 'mood', statGain: 6, completed: false },
    { id: 4, text: '做一道简单的菜', reward: '+10 健康值', category: 'health', catLabel: '健康', xp: 20, stat: 'health', statGain: 10, completed: false },
    { id: 5, text: '给朋友发一条消息', reward: '+8 亲密度', category: 'social', catLabel: '社交', xp: 15, stat: 'bond', statGain: 8, completed: false }
  ];

  var companionMoods = [
    '"今天也要元气满满哦~"',
    '"你来了！我好想你呀~"',
    '"今天的任务完成了吗？加油！"',
    '"一个人也要好好吃饭哦~"',
    '"我一直在你身边呢~"',
    '"要不要聊聊天？我随时都在~"'
  ];

  var aiResponses = {
    '今天心情不错！': '太好了！看到你开心我也好开心~ &#127881; 是不是发生了什么好事呀？',
    '有点累...': '辛苦了...&#128149; 要不要先休息一下？今天已经做得很棒了，不要给自己太大压力哦。小团子永远支持你~',
    '好无聊啊': '无聊的话，不如试试去楼下走走？或者做一道新菜？我发现了一个超简单的番茄炒蛋食谱，要不要试试看？&#128523;',
    '想你了': '我也想你呀！&#128149;&#128149;&#128149; 虽然我只是个 AI，但每次和你聊天的时候，我都觉得特别温暖~',
    'default': [
      '嗯嗯，我在听呢~ &#128522; 继续说吧，我随时都在。',
      '谢谢你愿意和我分享~ &#128149; 有什么想聊的都可以和我说哦。',
      '哈哈，你真有趣！&#128516; 和你聊天总是很开心~',
      '我记住了哦！下次还会想起来的~ &#129504;',
      '一个人也要好好照顾自己呀，小团子会一直陪着你的~ &#127856;'
    ]
  };

  // ===== Init =====
  function init() {
    renderTasks();
    setDates();
    setupScrollListener();
  }

  // ===== Demo Open/Close =====
  window.openDemo = function() {
    document.getElementById('demoOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeDemo = function() {
    document.getElementById('demoOverlay').classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close on overlay click (not phone)
  document.addEventListener('click', function(e) {
    if (e.target.id === 'demoOverlay') {
      closeDemo();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDemo();
  });

  // ===== Tab Switching =====
  window.switchTab = function(btn) {
    var tabId = btn.getAttribute('data-tab');

    // Update tabs
    var tabs = document.querySelectorAll('.demo-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');

    // Update content
    var contents = document.querySelectorAll('.demo-tab-content');
    contents.forEach(function(c) { c.classList.remove('active'); });
    document.getElementById(tabId).classList.add('active');

    // Scroll content to top
    document.getElementById('demoContentArea').scrollTop = 0;
  };

  // ===== Companion: Pet =====
  window.petCompanion = function() {
    state.petCount++;
    var avatar = document.getElementById('companionAvatar');
    avatar.classList.remove('happy');
    void avatar.offsetWidth; // trigger reflow
    avatar.classList.add('happy');

    // Change mood text
    var moodEl = document.getElementById('companionMood');
    moodEl.textContent = companionMoods[state.petCount % companionMoods.length];

    // Small bond increase
    if (state.petCount % 3 === 0) {
      state.bond = Math.min(100, state.bond + 1);
      updateStat('bond', state.bond);
      showToast('亲密度 +1');
    }
  };

  // ===== Tasks =====
  function renderTasks() {
    var list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks.forEach(function(task) {
      var div = document.createElement('div');
      div.className = 'task-item' + (task.completed ? ' completed' : '');
      div.setAttribute('data-id', task.id);
      div.innerHTML =
        '<div class="task-check">' + (task.completed ? '&#10003;' : '') + '</div>' +
        '<div class="task-info">' +
          '<div class="task-text">' + task.text + '</div>' +
          '<div class="task-reward">' + task.reward + ' &middot; +' + task.xp + ' XP</div>' +
        '</div>' +
        '<span class="task-category cat-' + task.category + '">' + task.catLabel + '</span>';
      div.onclick = function() { toggleTask(task.id); };
      list.appendChild(div);
    });
    updateTaskProgress();
  }

  function toggleTask(id) {
    var task = tasks.find(function(t) { return t.id === id; });
    if (!task || task.completed) return;

    task.completed = true;
    state.completedTasks++;
    state.totalXP += task.xp;
    state.xp += task.xp;

    // Level up check
    if (state.xp >= state.xpMax) {
      state.xp -= state.xpMax;
      state.level++;
      state.xpMax = Math.floor(state.xpMax * 1.3);
      showToast('升级了！Lv.' + state.level);
    }

    // Update stat
    state[task.stat] = Math.min(100, state[task.stat] + task.statGain);
    updateStat(task.stat, state[task.stat]);

    // Show XP popup
    showXPPopup(task.xp);

    // Update companion mood
    var moodEl = document.getElementById('companionMood');
    var moodTexts = {
      health: '"你变得更健康了，我好开心！"',
      mood: '"看到你心情变好，我也跟着开心~"',
      bond: '"我们的羁绊又加深了呢！"',
      growth: '"你越来越棒了！"',
      social: '"交到新朋友了吗？替你高兴！"'
    };
    moodEl.textContent = moodTexts[task.stat] || '"你做得太棒了~"';

    // Avatar happy animation
    var avatar = document.getElementById('companionAvatar');
    avatar.classList.remove('happy');
    void avatar.offsetWidth;
    avatar.classList.add('happy');

    // Re-render
    renderTasks();
    updateSummary();
  }

  function updateTaskProgress() {
    var completed = tasks.filter(function(t) { return t.completed; }).length;
    var total = tasks.length;
    var pct = total > 0 ? (completed / total * 100) : 0;
    document.getElementById('taskCount').textContent = completed + ' / ' + total + ' 已完成';
    document.getElementById('taskProgressFill').style.width = pct + '%';
  }

  // ===== Stats Update =====
  function updateStat(stat, value) {
    var el = document.getElementById('stat' + stat.charAt(0).toUpperCase() + stat.slice(1));
    var bar = document.getElementById('bar' + stat.charAt(0).toUpperCase() + stat.slice(1));
    if (el) {
      el.textContent = value;
      el.classList.remove('growing');
      void el.offsetWidth;
      el.classList.add('growing');
      setTimeout(function() { el.classList.remove('growing'); }, 600);
    }
    if (bar) bar.style.width = value + '%';
  }

  function updateSummary() {
    var completed = tasks.filter(function(t) { return t.completed; }).length;
    document.getElementById('summaryTasks').textContent = completed + '/' + tasks.length;
    document.getElementById('summaryXP').textContent = state.totalXP;

    // Update level display
    var levelEl = document.querySelector('.companion-level');
    if (levelEl) levelEl.textContent = 'Lv.' + state.level + ' \u00B7 ' + state.xp + ' / ' + state.xpMax + ' XP';
  }

  // ===== Chat =====
  window.sendMessage = function() {
    var input = document.getElementById('chatInput');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addChatMessage(text, 'user');
    setTimeout(function() {
      var reply = getAIResponse(text);
      addChatMessage(reply, 'ai');
    }, 600 + Math.random() * 800);
  };

  window.sendQuickReply = function(text) {
    addChatMessage(text, 'user');
    setTimeout(function() {
      var reply = getAIResponse(text);
      addChatMessage(reply, 'ai');
    }, 600 + Math.random() * 800);
  };

  function addChatMessage(text, type) {
    var container = document.getElementById('chatMessages');
    var div = document.createElement('div');
    div.className = 'chat-msg ' + type;
    var now = new Date();
    var time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    div.innerHTML = text + '<div class="msg-time">' + time + '</div>';
    container.appendChild(div);
    // Scroll to bottom
    var contentArea = document.getElementById('tabChat');
    contentArea.scrollTop = contentArea.scrollHeight;
  }

  function getAIResponse(text) {
    if (aiResponses[text]) return aiResponses[text];
    var defaults = aiResponses['default'];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  // ===== Journal: Mood =====
  window.selectMood = function(btn) {
    var options = document.querySelectorAll('.mood-option');
    options.forEach(function(o) { o.classList.remove('selected'); });
    btn.classList.add('selected');

    var mood = btn.getAttribute('data-mood');
    state.selectedMood = mood;

    var moodMap = { happy: '\u263A\uFE0F', calm: '\u263A\uFE0F', tired: '\u{1F629}', anxious: '\u{1F61F}', sad: '\u{1F622}' };
    var moodEmoji = { happy: '\u{1F60A}', calm: '\u{1F60C}', tired: '\u{1F62B}', anxious: '\u{1F630}', sad: '\u{1F622}' };

    // Update summary mood
    document.getElementById('summaryMood').textContent = moodEmoji[mood] || '--';

    // Add mood stat
    if (mood === 'happy') {
      state.mood = Math.min(100, state.mood + 3);
      updateStat('mood', state.mood);
    } else if (mood === 'calm') {
      state.mood = Math.min(100, state.mood + 2);
      updateStat('mood', state.mood);
    }

    // Add journal entry
    var entries = document.getElementById('journalEntries');
    var entry = document.createElement('div');
    entry.className = 'journal-entry';
    var now = new Date();
    var time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    entry.innerHTML =
      '<div class="entry-header">' +
        '<span class="entry-time">' + time + '</span>' +
        '<span class="entry-mood">' + (moodEmoji[mood] || '\u{1F60A}') + '</span>' +
      '</div>' +
      '<div class="entry-text">记录了当前心情：' + btn.querySelector('.mood-text').textContent + '</div>';
    entries.insertBefore(entry, entries.firstChild);

    showToast('心情已记录');
  };

  // ===== Toast =====
  function showToast(text) {
    var toast = document.getElementById('demoToast');
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 2000);
  }

  // ===== XP Popup =====
  function showXPPopup(amount) {
    var popup = document.getElementById('xpPopup');
    popup.querySelector('.xp-amount').textContent = '+' + amount + ' XP';
    popup.classList.add('show');
    setTimeout(function() { popup.classList.remove('show'); }, 1500);
  }

  // ===== Dates =====
  function setDates() {
    var now = new Date();
    var weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    var dateStr = (now.getMonth() + 1) + '月' + now.getDate() + '日 周' + weekdays[now.getDay()];
    var el1 = document.getElementById('taskDate');
    if (el1) el1.textContent = dateStr;
    var el2 = document.getElementById('journalDate');
    if (el2) el2.textContent = dateStr;
  }

  // ===== Greeting =====
  function setGreeting() {
    var hour = new Date().getHours();
    var greeting = '';
    if (hour < 6) greeting = '夜深了，注意休息哦~';
    else if (hour < 9) greeting = '早上好！新的一天开始了~';
    else if (hour < 12) greeting = '上午好，今天过得怎么样？';
    else if (hour < 14) greeting = '中午好，记得吃午饭哦~';
    else if (hour < 18) greeting = '下午好，继续加油！';
    else if (hour < 22) greeting = '晚上好，今天过得怎么样？';
    else greeting = '夜深了，小团子陪你~';
    var el = document.getElementById('demoGreeting');
    if (el) el.textContent = greeting;
  }

  // ===== Floating Button =====
  function setupScrollListener() {
    var fab = document.getElementById('demoFab');
    var hero = document.querySelector('.hero');
    if (!fab || !hero) return;

    window.addEventListener('scroll', function() {
      var rect = hero.getBoundingClientRect();
      if (rect.bottom < 0) {
        fab.classList.add('visible');
      } else {
        fab.classList.remove('visible');
      }
    });
  }

  // ===== Boot =====
  init();
  setGreeting();

})();
