// ==========================================
// 喵星日程 - 核心应用逻辑
// ==========================================

(function() {
  'use strict';

  // ========== 数据存储 ==========
  const STORAGE_KEY = 'kitty_schedule_data';

  // 分类配置
  const CATEGORIES = {
    work: { name: '工作', icon: '💼', color: '#C4956A' },
    study: { name: '学习', icon: '📚', color: '#6B8E6B' },
    life: { name: '生活', icon: '🏠', color: '#D2691E' },
    health: { name: '健康', icon: '💪', color: '#9370DB' },
    other: { name: '其他', icon: '📝', color: '#8B7355' }
  };

  // 猫咪类型配置（使用AI生成的图片）
  const CAT_TYPES = [
    { id: 'calico', name: '三花猫', image: 'assets/cat_calico.jpg' },
    { id: 'white', name: '白猫', image: 'assets/cat_white.jpg' },
    { id: 'black', name: '黑猫', image: 'assets/cat_black.jpg' },
    { id: 'tabby', name: '狸花猫', image: 'assets/cat_tabby.jpg' },
    { id: 'cow', name: '奶牛猫', image: 'assets/cat_cow.jpg' }
  ];

  // 默认数据
  let appData = {
    user: {
      name: '铲屎官',
      avatar: '👤',
      totalDays: 1,
      totalTasks: 0,
      totalEnergy: 0,
      lastLoginDate: ''
    },
    cat: {
      type: 'calico',
      name: '小花',
      hunger: 30,
      happiness: 50
    },
    energy: 0,
    todayEnergy: 0,
    todos: [],
    todayDate: '',
    achievements: []
  };

  let currentCategory = 'work';
  let pieChart = null;
  let recognition = null;
  let isRecording = false;
  let confirmCallback = null;

  // ========== 初始化 ==========
  function init() {
    loadData();
    checkNewDay();
    renderDate();
    renderTodos();
    renderCat();
    renderCatSelector();
    renderStats();
    renderProfile();
    setupEventListeners();
    initSpeechRecognition();
    updateEnergyDisplay();
  }

  // ========== 数据持久化 ==========
  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        appData = Object.assign(appData, parsed);
      }
    } catch (e) {
      console.error('加载数据失败:', e);
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
      console.error('保存数据失败:', e);
    }
  }

  function getTodayStr() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  }

  function checkNewDay() {
    const today = getTodayStr();
    if (appData.todayDate !== today) {
      // 新的一天
      if (appData.todayDate && appData.todayDate !== today) {
        // 有昨天的数据，更新统计
        const yesterdayCompleted = appData.todos.filter(t => t.completed).length;
        if (yesterdayCompleted > 0) {
          appData.user.totalDays++;
        }
      }
      // 重置今日数据
      appData.todos = [];
      appData.todayEnergy = 0;
      appData.todayDate = today;
      // 猫咪饥饿度下降
      appData.cat.hunger = Math.max(0, appData.cat.hunger - 20);
      saveData();
    }
  }

  // ========== 日期显示 ==========
  function renderDate() {
    const now = new Date();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 ${weekDays[now.getDay()]}`;
    
    const el = document.getElementById('todayDate');
    if (el) el.textContent = dateStr;
    
    const el2 = document.getElementById('statsDate');
    if (el2) el2.textContent = dateStr;
  }

  // ========== 页面切换 ==========
  window.switchPage = function(pageName) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageName);
    });
    // 页面显示
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById('page-' + pageName).classList.add('active');

    // 切换到统计页时刷新图表
    if (pageName === 'stats') {
      setTimeout(() => {
        renderPieChart();
        generateAIAnalysis();
      }, 100);
    }
  };

  // ========== 事件监听 ==========
  function setupEventListeners() {
    // 添加按钮
    document.getElementById('addBtn').addEventListener('click', addTodo);
    
    // 输入框回车
    document.getElementById('todoInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') addTodo();
    });

    // 分类选择
    document.querySelectorAll('.category-tag').forEach(tag => {
      tag.addEventListener('click', function() {
        document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.cat;
      });
    });

    // 语音按钮
    document.getElementById('voiceBtn').addEventListener('click', toggleVoiceInput);

    // 点击猫咪互动
    document.getElementById('catImageWrapper').addEventListener('click', petCat);
  }

  // ========== 语音输入 ==========
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('todoInput').value = transcript;
        stopRecording();
      };

      recognition.onerror = function() {
        stopRecording();
        alert('语音识别失败，请重试或使用文字输入');
      };

      recognition.onend = function() {
        stopRecording();
      };
    }
  }

  function toggleVoiceInput() {
    if (!recognition) {
      alert('您的浏览器不支持语音输入，请使用Chrome浏览器');
      return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      startRecording();
    }
  }

  function startRecording() {
    isRecording = true;
    document.getElementById('voiceBtn').classList.add('recording');
    try {
      recognition.start();
    } catch (e) {
      stopRecording();
    }
  }

  function stopRecording() {
    isRecording = false;
    document.getElementById('voiceBtn').classList.remove('recording');
  }

  // ========== 待办事项 ==========
  function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) {
      input.focus();
      return;
    }

    const todo = {
      id: Date.now(),
      text: text,
      category: currentCategory,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      energy: getEnergyForCategory(currentCategory)
    };

    appData.todos.unshift(todo);
    saveData();
    
    input.value = '';
    renderTodos();
    renderStats();
  }

  function getEnergyForCategory(cat) {
    const energies = { work: 10, study: 8, life: 5, health: 6, other: 3 };
    return energies[cat] || 5;
  }

  window.toggleTodo = function(id) {
    const todo = appData.todos.find(t => t.id === id);
    if (!todo) return;

    todo.completed = !todo.completed;
    
    if (todo.completed) {
      todo.completedAt = new Date().toISOString();
      // 增加能量
      appData.energy += todo.energy;
      appData.todayEnergy += todo.energy;
      appData.user.totalTasks++;
      appData.user.totalEnergy += todo.energy;
      // 增加猫咪幸福度
      appData.cat.happiness = Math.min(100, appData.cat.happiness + 2);
    } else {
      todo.completedAt = null;
      // 扣除能量
      appData.energy = Math.max(0, appData.energy - todo.energy);
      appData.todayEnergy = Math.max(0, appData.todayEnergy - todo.energy);
      appData.user.totalTasks = Math.max(0, appData.user.totalTasks - 1);
      appData.user.totalEnergy = Math.max(0, appData.user.totalEnergy - todo.energy);
    }

    saveData();
    renderTodos();
    renderStats();
    updateEnergyDisplay();
    updateCatMood();
    checkAchievements();
  };

  window.deleteTodo = function(id) {
    showConfirm('删除待办', '确定要删除这个待办事项吗？', function() {
      const index = appData.todos.findIndex(t => t.id === id);
      if (index > -1) {
        const todo = appData.todos[index];
        if (todo.completed) {
          appData.energy = Math.max(0, appData.energy - todo.energy);
          appData.todayEnergy = Math.max(0, appData.todayEnergy - todo.energy);
          appData.user.totalTasks = Math.max(0, appData.user.totalTasks - 1);
          appData.user.totalEnergy = Math.max(0, appData.user.totalEnergy - todo.energy);
        }
        appData.todos.splice(index, 1);
        saveData();
        renderTodos();
        renderStats();
        updateEnergyDisplay();
      }
    });
  };

  function renderTodos() {
    const list = document.getElementById('todoList');
    const empty = document.getElementById('emptyTodo');
    const completedCount = document.getElementById('completedCount');
    const totalCount = document.getElementById('totalCount');

    if (appData.todos.length === 0) {
      list.innerHTML = '';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      list.innerHTML = appData.todos.map(todo => {
        const cat = CATEGORIES[todo.category];
        const time = todo.completed && todo.completedAt 
          ? formatTime(todo.completedAt) 
          : formatTime(todo.createdAt);
        
        return `
          <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id})"></div>
            <div class="todo-content">
              <div class="todo-text">${escapeHtml(todo.text)}</div>
              <div class="todo-meta">
                <span class="todo-cat ${todo.category}">${cat.icon} ${cat.name}</span>
                <span class="todo-time">${time} · +${todo.energy}⚡</span>
              </div>
            </div>
            <div class="todo-delete" onclick="deleteTodo(${todo.id})">×</div>
          </li>
        `;
      }).join('');
    }

    const completed = appData.todos.filter(t => t.completed).length;
    const total = appData.todos.length;
    completedCount.textContent = completed;
    totalCount.textContent = total;

    // 更新进度环
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressCircle = document.getElementById('progressCircle');
    const progressPercent = document.getElementById('progressPercent');
    if (progressCircle) {
      progressCircle.style.setProperty('--progress', progress + '%');
    }
    if (progressPercent) {
      progressPercent.textContent = progress + '%';
    }
  }

  function formatTime(isoStr) {
    const d = new Date(isoStr);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ========== 能量显示 ==========
  function updateEnergyDisplay() {
    document.getElementById('energyValue').textContent = appData.energy;
  }

  // ========== 统计页面 ==========
  function renderStats() {
    const total = appData.todos.length;
    const completed = appData.todos.filter(t => t.completed).length;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statDone').textContent = completed;
    document.getElementById('statEnergy').textContent = appData.todayEnergy;
  }

  function renderPieChart() {
    const chartDom = document.getElementById('pieChart');
    if (!chartDom) return;

    if (!pieChart) {
      pieChart = echarts.init(chartDom, null, { renderer: 'svg' });
    }

    // 按分类统计已完成任务数
    const catStats = {};
    appData.todos.filter(t => t.completed).forEach(todo => {
      if (!catStats[todo.category]) {
        catStats[todo.category] = 0;
      }
      catStats[todo.category]++;
    });

    const data = Object.keys(catStats).length > 0 
      ? Object.entries(catStats).map(([cat, count]) => ({
          name: CATEGORIES[cat].name,
          value: count,
          itemStyle: { color: CATEGORIES[cat].color }
        }))
      : [{ name: '暂无数据', value: 1, itemStyle: { color: '#D4B896' } }];

    const style = getComputedStyle(document.documentElement);
    const ink = style.getPropertyValue('--ink').trim();
    const muted = style.getPropertyValue('--muted').trim();

    pieChart.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        formatter: '{b}: {c}个 ({d}%)'
      },
      legend: {
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 },
        itemWidth: 12,
        itemHeight: 12
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#FFFBF5',
          borderWidth: 2
        },
        label: {
          show: true,
          color: ink,
          fontSize: 12,
          formatter: '{d}%'
        },
        labelLine: {
          length: 8,
          length2: 8
        },
        data: data
      }]
    });

    window.addEventListener('resize', function() {
      if (pieChart) pieChart.resize();
    });
  }

  function generateAIAnalysis() {
    const container = document.getElementById('aiAnalysis');
    if (!container) return;

    const total = appData.todos.length;
    const completed = appData.todos.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (total === 0) {
      container.innerHTML = `
        <p>今天还没有添加待办事项哦～</p>
        <div class="ai-tip">💡 添加几个小任务，从简单的事情开始，慢慢积累成就感吧！</div>
      `;
      return;
    }

    if (completed === 0) {
      container.innerHTML = `
        <p>今天的任务清单已经准备好了！</p>
        <p>共有 <strong>${total}</strong> 个任务等待你去完成，加油！</p>
        <div class="ai-tip">🌟 建议从最简单的任务开始，快速获得成就感～</div>
      `;
      return;
    }

    // 分析各分类占比
    const catStats = {};
    appData.todos.filter(t => t.completed).forEach(todo => {
      if (!catStats[todo.category]) catStats[todo.category] = 0;
      catStats[todo.category]++;
    });

    let topCat = 'other';
    let topCount = 0;
    Object.entries(catStats).forEach(([cat, count]) => {
      if (count > topCount) {
        topCount = count;
        topCat = cat;
      }
    });

    // 生成分析文案
    let analysis = '';
    let tip = '';

    if (completionRate >= 80) {
      analysis = `<p>🎉 <strong>太棒了！</strong>今日完成率高达 <strong>${completionRate}%</strong>，效率超高！</p>
               <p>你完成了 <strong>${completed}/${total}</strong> 个任务，获得了 <strong>${appData.todayEnergy}</strong> 点能量～</p>
               <p>今天在「${CATEGORIES[topCat].name}」方面投入最多，完成了 ${topCount} 项任务。</p>`;
      tip = '✨ 保持这个节奏，你和小猫都会越来越棒的！';
    } else if (completionRate >= 50) {
      analysis = `<p>👍 <strong>不错哦！</strong>今日完成率 <strong>${completionRate}%</strong>，继续加油！</p>
                  <p>已完成 <strong>${completed}/${total}</strong> 个任务，还有 ${total - completed} 个待完成。</p>
                  <p>今天主要专注于「${CATEGORIES[topCat].name}」类任务。</p>`;
      tip = '💪 再加把劲，争取全部完成，小猫会更开心的！';
    } else {
      analysis = `<p>🐌 今日完成率 <strong>${completionRate}%</strong>，还有提升空间哦～</p>
                  <p>已完成 <strong>${completed}/${total}</strong> 个任务，不要灰心！</p>
                  <p>可以试着减少任务数量，保证完成质量。</p>`;
      tip = '🌱 每天进步一点点就好，小猫相信你！';
    }

    container.innerHTML = analysis + `<div class="ai-tip">${tip}</div>`;
  }

  // ========== 猫咪相关 ==========
  function renderCat() {
    const catType = CAT_TYPES.find(c => c.id === appData.cat.type) || CAT_TYPES[0];
    const catImage = document.getElementById('catImage');
    const catName = document.getElementById('catName');
    
    catImage.src = catType.image;
    catImage.alt = catType.name;
    catName.textContent = appData.cat.name;
    
    updateHungerBar();
    updateCatMood();
  }

  function renderCatSelector() {
    const selector = document.getElementById('catSelector');
    selector.innerHTML = CAT_TYPES.map(cat => `
      <div style="text-align:center;">
        <div class="cat-option ${appData.cat.type === cat.id ? 'active' : ''}" onclick="selectCat('${cat.id}')" title="${cat.name}">
          <img src="${cat.image}" alt="${cat.name}">
        </div>
        <div class="cat-option-label">${cat.name}</div>
      </div>
    `).join('');
  }

  window.selectCat = function(catId) {
    appData.cat.type = catId;
    const catType = CAT_TYPES.find(c => c.id === catId);
    if (catType && appData.cat.name === '小花') {
      appData.cat.name = catType.name;
    }
    saveData();
    renderCat();
    renderCatSelector();
  };

  function updateHungerBar() {
    const hungerFill = document.getElementById('hungerFill');
    const hungerPercent = document.getElementById('hungerPercent');
    if (hungerFill) hungerFill.style.width = appData.cat.hunger + '%';
    if (hungerPercent) hungerPercent.textContent = Math.round(appData.cat.hunger) + '%';
  }

  function updateCatMood() {
    const moodEl = document.getElementById('catMood');
    if (!moodEl) return;

    const hunger = appData.cat.hunger;
    const happiness = appData.cat.happiness;
    const avg = (hunger + happiness) / 2;

    let mood = '';
    if (avg >= 80) mood = '开心地喵喵叫～ 😺';
    else if (avg >= 60) mood = '满足地打着呼噜 😸';
    else if (avg >= 40) mood = '期待地看着你... 🐱';
    else if (avg >= 20) mood = '有点饿了... 😿';
    else mood = '可怜巴巴地叫着... 😿';

    moodEl.textContent = mood;
  }

  window.feedCat = function(type) {
    const costs = { small: 5, medium: 15, big: 30 };
    const hungerGains = { small: 10, medium: 25, big: 50 };
    const happinessGains = { small: 5, medium: 15, big: 30 };

    const cost = costs[type];
    if (appData.energy < cost) {
      showToast('能量不足！快去完成任务吧～');
      return;
    }

    if (appData.cat.hunger >= 100) {
      showToast('小猫已经吃饱啦！');
      return;
    }

    appData.energy -= cost;
    appData.cat.hunger = Math.min(100, appData.cat.hunger + hungerGains[type]);
    appData.cat.happiness = Math.min(100, appData.cat.happiness + happinessGains[type]);

    saveData();
    updateEnergyDisplay();
    updateHungerBar();
    updateCatMood();
    renderProfile();

    // 开心动画
    const catImgWrap = document.getElementById('catImageWrapper');
    catImgWrap.classList.add('happy');
    setTimeout(() => catImgWrap.classList.remove('happy'), 600);

    // 漂浮爱心
    showFloatingHearts();

    checkAchievements();
  };

  function petCat() {
    // 抚摸猫咪，增加一点幸福度
    appData.cat.happiness = Math.min(100, appData.cat.happiness + 1);
    saveData();
    updateCatMood();

    const catImgWrap = document.getElementById('catImageWrapper');
    catImgWrap.classList.add('happy');
    setTimeout(() => catImgWrap.classList.remove('happy'), 600);

    // 显示一个小爱心
    const catDisplay = document.getElementById('catDisplay');
    const heart = document.createElement('div');
    heart.className = 'heart-float';
    heart.textContent = '💕';
    heart.style.left = '45%';
    heart.style.top = '40%';
    catDisplay.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
  }

  function showFloatingHearts() {
    const catDisplay = document.getElementById('catDisplay');
    const emojis = ['❤️', '💕', '💖', '✨', '🌟'];
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'heart-float';
        heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        heart.style.left = (30 + Math.random() * 40) + '%';
        heart.style.top = '50%';
        catDisplay.appendChild(heart);
        setTimeout(() => heart.remove(), 1500);
      }, i * 150);
    }
  }

  function showToast(msg) {
    // 简单的提示
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(74, 55, 40, 0.9); color: white; padding: 12px 24px;
      border-radius: 12px; z-index: 300; font-size: 14px; font-weight: 600;
      animation: fadeIn 0.2s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 1500);
  }

  // ========== 个人中心 ==========
  function renderProfile() {
    document.getElementById('userName').textContent = appData.user.name;
    document.getElementById('totalDays').textContent = appData.user.totalDays;
    document.getElementById('totalTasks').textContent = appData.user.totalTasks;
    document.getElementById('totalEnergy').textContent = appData.user.totalEnergy;
  }

  window.editProfile = function() {
    document.getElementById('nameInput').value = appData.user.name;
    openModal('nameModal');
  };

  window.saveName = function() {
    const name = document.getElementById('nameInput').value.trim();
    if (name) {
      appData.user.name = name;
      saveData();
      renderProfile();
    }
    closeModal('nameModal');
  };

  window.showCatNameModal = function() {
    document.getElementById('catNameInput').value = appData.cat.name;
    openModal('catNameModal');
  };

  window.saveCatName = function() {
    const name = document.getElementById('catNameInput').value.trim();
    if (name) {
      appData.cat.name = name;
      saveData();
      renderCat();
    }
    closeModal('catNameModal');
  };

  window.showAchievements = function() {
    const list = document.getElementById('achievementList');
    const achievements = [
      { id: 'first', icon: '🌟', name: '初次见面', desc: '完成第一个任务', unlocked: appData.user.totalTasks >= 1 },
      { id: 'ten', icon: '🏅', name: '小有成就', desc: '完成10个任务', unlocked: appData.user.totalTasks >= 10 },
      { id: 'fifty', icon: '🏆', name: '任务达人', desc: '完成50个任务', unlocked: appData.user.totalTasks >= 50 },
      { id: 'week', icon: '📅', name: '七日打卡', desc: '连续打卡7天', unlocked: appData.user.totalDays >= 7 },
      { id: 'energy100', icon: '⚡', name: '能量满满', desc: '累计获得100能量', unlocked: appData.user.totalEnergy >= 100 },
      { id: 'catlove', icon: '🐱', name: '猫奴认证', desc: '喂猫10次', unlocked: (appData.feedCount || 0) >= 10 }
    ];

    list.innerHTML = achievements.map(a => `
      <div style="text-align:center; padding:8px; opacity: ${a.unlocked ? '1' : '0.3'};">
        <div style="font-size:32px;">${a.icon}</div>
        <div style="font-size:12px; font-weight:600; margin-top:4px;">${a.name}</div>
        <div style="font-size:10px; color: var(--muted);">${a.desc}</div>
      </div>
    `).join('');

    openModal('achievementModal');
  };

  window.showAbout = function() {
    openModal('aboutModal');
  };

  window.clearData = function() {
    showConfirm('清空数据', '确定要清空所有数据吗？此操作不可恢复！', function() {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });
  };

  // ========== 成就系统 ==========
  function checkAchievements() {
    // 简单的成就检查
    const newAchievements = [];
    if (appData.user.totalTasks >= 1 && !appData.achievements.includes('first')) {
      newAchievements.push('first');
    }
    if (appData.user.totalTasks >= 10 && !appData.achievements.includes('ten')) {
      newAchievements.push('ten');
    }
    if (appData.user.totalEnergy >= 100 && !appData.achievements.includes('energy100')) {
      newAchievements.push('energy100');
    }

    if (newAchievements.length > 0) {
      appData.achievements = [...appData.achievements, ...newAchievements];
      saveData();
      // 可以加个成就解锁提示
    }
  }

  // ========== 模态框 ==========
  function openModal(id) {
    document.getElementById(id).classList.add('show');
  }

  window.closeModal = function(id) {
    document.getElementById(id).classList.remove('show');
  };

  function showConfirm(title, text, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmText').textContent = text;
    confirmCallback = callback;
    openModal('confirmModal');
  }

  window.confirmAction = function() {
    if (confirmCallback) {
      confirmCallback();
      confirmCallback = null;
    }
    closeModal('confirmModal');
  };

  // ========== 启动 ==========
  document.addEventListener('DOMContentLoaded', init);

})();
