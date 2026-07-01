/**
 * UniMate - AI Campus Life Navigator
 * Main Application Logic
 */

// App State
const AppState = {
  currentPage: 'login',
  isLoggedIn: false,
  tasks: [],
  schedules: [],
  chatHistory: [],
  packages: [],
  user: {
    name: '李明',
    avatar: '👦',
    major: '计算机科学与技术',
    grade: '2025级',
    completedTasks: 0,
    totalTasks: 0,
    askedQuestions: 0
  },
  currentPlan: null,
  completedSteps: new Set()
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadData();
  setupNavigation(); // Always bind nav events

  if (AppState.isLoggedIn) {
    enterApp();
  } else {
    setupLogin();
    switchPage('login'); // This will hide the nav bar
  }
}

function enterApp() {
  switchPage('home');
  renderHomePage();
  renderSchedulePage();
  renderProfilePage();
  setupChat();
  setupTaskInput();
  showToast('👋 欢迎回来，' + AppState.user.name + '！');
}

// ==================== LOGIN ====================
function setupLogin() {
  // Tab switching
  document.querySelectorAll('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.getElementById('login-form-student').classList.toggle('hidden', target !== 'student');
      document.getElementById('login-form-phone').classList.toggle('hidden', target !== 'phone');
    });
  });

  // Student ID login
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }

  // Phone login
  const phoneLoginBtn = document.getElementById('login-phone-btn');
  if (phoneLoginBtn) {
    phoneLoginBtn.addEventListener('click', handlePhoneLogin);
  }

  // Send code button
  const sendCodeBtn = document.getElementById('send-code-btn');
  if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', () => {
      sendCodeBtn.disabled = true;
      sendCodeBtn.textContent = '已发送 (60s)';
      showToast('📱 验证码已发送');
      let countdown = 60;
      const timer = setInterval(() => {
        countdown--;
        sendCodeBtn.textContent = `已发送 (${countdown}s)`;
        if (countdown <= 0) {
          clearInterval(timer);
          sendCodeBtn.disabled = false;
          sendCodeBtn.textContent = '获取验证码';
        }
      }, 1000);
    });
  }
}

function handleLogin() {
  const studentId = document.getElementById('login-student-id').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!studentId || !password) {
    showToast('❗ 请输入学号和密码');
    return;
  }

  // Demo validation
  if (studentId === '20250001' && password === '123456') {
    performLogin({ studentId, name: '李明' });
  } else {
    showToast('❌ 学号或密码错误，演示账号：20250001 / 123456');
  }
}

function handlePhoneLogin() {
  const phone = document.getElementById('login-phone').value.trim();
  const code = document.getElementById('login-code').value.trim();

  if (!phone || !code) {
    showToast('❗ 请输入手机号和验证码');
    return;
  }

  if (code === '888888') {
    performLogin({ phone, name: '李明' });
  } else {
    showToast('❌ 验证码错误，演示验证码：888888');
  }
}

function performLogin(loginInfo) {
  AppState.isLoggedIn = true;
  AppState.user.studentId = loginInfo.studentId || loginInfo.phone;
  saveData();

  showToast('🎉 登录成功！');

  // Simulate checking packages after login
  setTimeout(() => {
    checkPackagesAfterLogin();
    enterApp();
  }, 500);
}

// ==================== PACKAGE SYSTEM ====================
function checkPackagesAfterLogin() {
  // Simulate fetching packages from server
  const packages = MOCK_DATA.userPackages;
  AppState.packages = packages;

  if (packages.length > 0) {
    // Create a package pickup task
    const existingPackageTask = AppState.tasks.find(t => t.title === '取快递');
    if (!existingPackageTask) {
      const packageTask = {
        id: Date.now(),
        title: '取快递',
        category: '生活必备',
        priority: 'high',
        progress: 0,
        totalSteps: packages.length,
        steps: generatePackageSteps(packages),
        isPackageTask: true
      };
      AppState.tasks.unshift(packageTask);
      saveData();
      showToast(`📦 你有 ${packages.length} 个快递待取件，已自动创建任务！`);
    }
  }
}

function generatePackageSteps(packages) {
  return packages.map((pkg, index) => ({
    step: index + 1,
    action: `取 ${pkg.company} 快递（${pkg.description}）`,
    tips: `取件码：${pkg.pickupCode} | 运单号：${pkg.trackingNo}`,
    location: pkg.location,
    time: `到达时间：${pkg.arrivedAt}`,
    icon: pkg.icon
  }));
}

function generatePackageResponse() {
  const packages = AppState.packages;
  if (!packages || packages.length === 0) {
    return '你目前没有待取快递包裹 📭\n\n如果有新快递到达，我会第一时间提醒你哦！';
  }

  let response = `你有 ${packages.length} 个快递待取件 📦\n\n`;
  packages.forEach((pkg, idx) => {
    response += `${idx + 1}. ${pkg.company}\n`;
    response += `   📍 ${pkg.location}\n`;
    response += `   🔑 取件码：${pkg.pickupCode}\n`;
    response += `   📝 ${pkg.description}\n`;
    response += `   ⏰ 到达：${pkg.arrivedAt}\n\n`;
  });
  response += '💡 已为你创建"取快递"任务，点击首页任务卡片可查看详细步骤！';
  return response;
}

function generateWeekendSpotsResponse() {
  const spots = MOCK_DATA.weekendSpots;
  let response = '为你推荐几个适合新生周末游玩的地方 🗺️\n\n';
  spots.forEach((spot, idx) => {
    response += `${spot.icon} ${spot.name}\n`;
    response += `   📍 ${spot.distance}\n`;
    response += `   🏷️ ${spot.tags.join(' · ')}\n`;
    response += `   ${spot.desc}\n`;
    response += `   💡 ${spot.tips}\n\n`;
  });
  response += '祝你周末愉快！需要我帮你规划出行路线吗？';
  return response;
}

// ==================== DATA MANAGEMENT ====================
function loadData() {
  const saved = localStorage.getItem('unimate_data');
  if (saved) {
    const data = JSON.parse(saved);
    AppState.isLoggedIn = data.isLoggedIn || false;
    AppState.tasks = data.tasks || [];
    AppState.chatHistory = data.chatHistory || [];
    AppState.completedSteps = new Set(data.completedSteps || []);
    AppState.packages = data.packages || [];
    AppState.user = { ...AppState.user, ...data.user };
  }
  AppState.schedules = MOCK_DATA.scheduleEvents.map(s => ({ ...s }));
}

function saveData() {
  const data = {
    isLoggedIn: AppState.isLoggedIn,
    tasks: AppState.tasks,
    chatHistory: AppState.chatHistory,
    completedSteps: Array.from(AppState.completedSteps),
    packages: AppState.packages,
    user: AppState.user
  };
  localStorage.setItem('unimate_data', JSON.stringify(data));
}

// ==================== NAVIGATION ====================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      switchPage(page);
    });
  });
}

function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');

  // Hide bottom nav on login page
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) {
    bottomNav.style.display = page === 'login' ? 'none' : 'flex';
  }

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  AppState.currentPage = page;

  if (page === 'home') renderHomePage();
  if (page === 'schedule') renderSchedulePage();
  if (page === 'profile') renderProfilePage();
  if (page === 'chat') scrollToBottom();

  window.scrollTo(0, 0);
}

// ==================== HOME PAGE ====================
function renderHomePage() {
  const taskList = document.getElementById('task-list');
  if (!taskList) return;

  let html = '';

  // Package alert card
  if (AppState.packages.length > 0) {
    const uncollected = AppState.packages.length;
    html += `
      <div class="package-alert" onclick="openPackagePlan()">
        <div class="package-alert-header">
          <span class="package-alert-icon">📦</span>
          <span class="package-alert-title">你有待取快递</span>
          <span class="package-alert-count">${uncollected}个</span>
        </div>
        <div class="package-alert-desc">
          ${AppState.packages.map(p => `📍 ${p.location} · ${p.company}`).join('<br>')}
        </div>
      </div>
    `;
  }

  if (AppState.tasks.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">还没有任务计划</div>
        <div class="empty-state-hint">在上方输入框告诉我你想做什么</div>
      </div>
    `;
    taskList.innerHTML = html;
    return;
  }

  html += AppState.tasks.map(task => `
    <div class="task-card" onclick="openPlan(${task.id})">
      <div class="task-card-header">
        <div>
          <div class="task-card-title">${task.title}</div>
          <div class="task-card-meta">
            <span class="task-category ${getCategoryClass(task.category)}">${task.category}</span>
            <span class="task-priority">${getPriorityLabel(task.priority)}</span>
          </div>
        </div>
      </div>
      <div class="task-progress-bar">
        <div class="task-progress-fill" style="width: ${(task.progress / task.totalSteps * 100)}%"></div>
      </div>
      <div class="task-progress-text">${task.progress}/${task.totalSteps} 步骤已完成</div>
    </div>
  `).join('');

  taskList.innerHTML = html;
}

function openPackagePlan() {
  const task = AppState.tasks.find(t => t.title === '取快递');
  if (task) {
    openPlan(task.id);
  }
}

function getCategoryClass(category) {
  const map = { '入学必办': 'must', '生活必备': 'life', '学习相关': 'study', '活动安排': 'activity', '社团活动': 'activity' };
  return map[category] || 'must';
}

function getPriorityLabel(priority) {
  const map = { high: '高优先级', medium: '中优先级', low: '低优先级' };
  return map[priority] || '';
}

// ==================== TASK INPUT ====================
function setupTaskInput() {
  const input = document.getElementById('task-input');
  const sendBtn = document.getElementById('send-btn');

  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') processTaskInput();
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', processTaskInput);
  }

  document.querySelectorAll('.quick-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      if (input) {
        input.value = tag.textContent;
        processTaskInput();
      }
    });
  });
}

function processTaskInput() {
  const input = document.getElementById('task-input');
  const value = input.value.trim();
  if (!value) return;

  input.value = '';
  showProcessingState();

  setTimeout(() => {
    const breakdown = findBreakdown(value);
    if (breakdown) {
      const taskId = Date.now();
      const newTask = {
        id: taskId,
        title: breakdown.title,
        category: breakdown.category || '入学必办',
        priority: breakdown.priority || 'medium',
        progress: 0,
        totalSteps: breakdown.steps.length,
        steps: breakdown.steps
      };
      AppState.tasks.unshift(newTask);
      saveData();
      hideProcessingState();
      renderHomePage();
      openPlan(taskId);
      showToast('✨ AI已为你拆解好任务步骤！');
    } else {
      hideProcessingState();
      const taskId = Date.now();
      AppState.tasks.unshift({
        id: taskId,
        title: value,
        category: '自定义任务',
        priority: 'medium',
        progress: 0,
        totalSteps: 3,
        steps: generateGenericSteps(value)
      });
      saveData();
      renderHomePage();
      showToast('💡 已添加任务，点击卡片查看详情');
    }
  }, 1200);
}

function findBreakdown(input) {
  const keywords = Object.keys(MOCK_DATA.taskBreakdowns);
  for (const keyword of keywords) {
    if (input.includes(keyword)) {
      return {
        title: keyword,
        category: getCategoryByKeyword(keyword),
        priority: getPriorityByKeyword(keyword),
        steps: MOCK_DATA.taskBreakdowns[keyword]
      };
    }
  }
  return null;
}

function getCategoryByKeyword(keyword) {
  const map = {
    '新生报到': '入学必办',
    '办理饭卡': '生活必备',
    '图书馆认证': '学习相关',
    '英语分级考试': '学习相关',
    '军训动员大会': '活动安排',
    '百团大战': '社团活动'
  };
  return map[keyword] || '其他';
}

function getPriorityByKeyword(keyword) {
  const map = {
    '新生报到': 'high',
    '办理饭卡': 'high',
    '图书馆认证': 'medium',
    '英语分级考试': 'high',
    '军训动员大会': 'medium',
    '百团大战': 'low'
  };
  return map[keyword] || 'medium';
}

function generateGenericSteps(title) {
  return [
    { step: 1, action: `准备${title}所需材料`, tips: '建议提前查询具体要求', location: '-', time: '提前准备', icon: '📋' },
    { step: 2, action: `前往相关地点办理${title}`, tips: '注意开放时间和地点', location: '学校相关部门', time: '工作时间', icon: '🏃' },
    { step: 3, action: `确认${title}办理完成`, tips: '保存好相关凭证', location: '-', time: '-', icon: '✅' }
  ];
}

function showProcessingState() {
  const container = document.getElementById('task-list');
  if (container) {
    container.innerHTML = `
      <div class="ai-processing">
        <div class="ai-processing-dots">
          <div class="ai-processing-dot"></div>
          <div class="ai-processing-dot"></div>
          <div class="ai-processing-dot"></div>
        </div>
        <span>AI正在拆解任务...</span>
      </div>
    `;
  }
}

function hideProcessingState() {}

// ==================== PLAN DETAIL ====================
function openPlan(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  AppState.currentPlan = task;
  renderPlanPage(task);
  switchPage('plan');
}

function renderPlanPage(task) {
  document.getElementById('plan-title').textContent = task.title;
  document.getElementById('plan-category').textContent = task.category;
  document.getElementById('plan-steps-count').textContent = `${task.totalSteps}个步骤`;

  const stepsContainer = document.getElementById('steps-container');
  stepsContainer.innerHTML = task.steps.map((step, index) => {
    const stepId = `${task.id}-${index}`;
    const isCompleted = AppState.completedSteps.has(stepId);
    return `
      <div class="step-item ${isCompleted ? 'completed' : ''}" data-step-id="${stepId}">
        <div class="step-number">${isCompleted ? '✓' : step.step}</div>
        <div class="step-content" onclick="toggleStepDetails(this)">
          <div class="step-header">
            <div class="step-action">${step.action}</div>
            <div class="step-check" onclick="event.stopPropagation(); toggleStepComplete('${stepId}')">
              ${isCompleted ? '✓' : ''}
            </div>
          </div>
          <div class="step-details">
            <div class="step-detail-row">
              <span class="step-detail-icon">💡</span>
              <span>${step.tips}</span>
            </div>
            <div class="step-detail-row">
              <span class="step-detail-icon">📍</span>
              <span>${step.location}</span>
            </div>
            <div class="step-detail-row">
              <span class="step-detail-icon">⏰</span>
              <span>${step.time}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('back-btn').onclick = () => switchPage('home');
}

function toggleStepDetails(element) {
  element.classList.toggle('expanded');
}

function toggleStepComplete(stepId) {
  const stepElement = document.querySelector(`[data-step-id="${stepId}"]`);
  if (!stepElement) return;

  const isCompleted = AppState.completedSteps.has(stepId);

  if (isCompleted) {
    AppState.completedSteps.delete(stepId);
    stepElement.classList.remove('completed');
    stepElement.querySelector('.step-number').textContent = stepId.split('-')[1];
    stepElement.querySelector('.step-check').innerHTML = '';
  } else {
    AppState.completedSteps.add(stepId);
    stepElement.classList.add('completed');
    stepElement.querySelector('.step-number').textContent = '✓';
    stepElement.querySelector('.step-check').innerHTML = '✓';
    showToast('🎉 步骤完成！继续保持！');
  }

  if (AppState.currentPlan) {
    const task = AppState.tasks.find(t => t.id === AppState.currentPlan.id);
    if (task) {
      const completedCount = task.steps.filter((_, idx) =>
        AppState.completedSteps.has(`${task.id}-${idx}`)
      ).length;
      task.progress = completedCount;

      if (completedCount === task.totalSteps && completedCount > 0) {
        celebrate();
        showToast('🏆 恭喜！任务全部完成！');
      }
    }
  }

  saveData();
  renderHomePage();
}

// ==================== CHAT ====================
function setupChat() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');

  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', sendChatMessage);
  }

  document.querySelectorAll('.preset-question').forEach(q => {
    q.addEventListener('click', () => {
      if (input) {
        input.value = q.textContent;
        sendChatMessage();
      }
    });
  });

  renderChatMessages();
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';

  addChatMessage('user', message);
  AppState.user.askedQuestions++;
  saveData();

  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();
    const response = generateResponse(message);
    addChatMessage('bot', response);
    saveData();
  }, 800);
}

function addChatMessage(sender, text) {
  const messagesContainer = document.getElementById('chat-messages');
  const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  messageDiv.innerHTML = `
    <div class="message-avatar">${sender === 'user' ? AppState.user.avatar : '🤖'}</div>
    <div>
      <div class="message-bubble">${formatMessage(text)}</div>
      <div class="message-time">${time}</div>
    </div>
  `;

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();

  AppState.chatHistory.push({ sender, text, time });
}

function formatMessage(text) {
  return text.replace(/\n/g, '<br>');
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById('chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  messagesContainer.appendChild(typingDiv);
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

function scrollToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function generateResponse(message) {
  const lowerMsg = message.toLowerCase();

  // Package queries
  if (lowerMsg.includes('快递') || lowerMsg.includes('包裹') || lowerMsg.includes('取件')) {
    return generatePackageResponse();
  }

  // Weekend spots queries
  if (lowerMsg.includes('周末') || lowerMsg.includes('玩') || lowerMsg.includes('景点') ||
      lowerMsg.includes('去哪') || lowerMsg.includes('推荐') || lowerMsg.includes('旅游') ||
      lowerMsg.includes('游玩') || lowerMsg.includes('附近')) {
    return generateWeekendSpotsResponse();
  }

  // Knowledge base
  for (const [key, value] of Object.entries(MOCK_DATA.qaKnowledge)) {
    if (lowerMsg.includes(key.toLowerCase())) {
      return value;
    }
  }

  const defaults = [
    '这个问题很有趣！虽然我的知识库还在完善中，但你可以问问学长学姐，或者去教务处咨询。需要我帮你查找相关信息吗？',
    '作为你的AI校园助手，我会尽力帮你！这个问题我暂时了解不多，建议查看学校官网或联系相关部门。还有其他我可以帮你的吗？',
    '收到你的问题！这方面的详细信息建议：\n1. 查看新生手册\n2. 咨询辅导员\n3. 在班级群问问\n\n需要我帮你规划其他任务吗？'
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
}

function renderChatMessages() {
  const container = document.getElementById('chat-messages');
  if (!container || AppState.chatHistory.length === 0) return;

  container.innerHTML = '';
  AppState.chatHistory.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.sender}`;
    messageDiv.innerHTML = `
      <div class="message-avatar">${msg.sender === 'user' ? AppState.user.avatar : '🤖'}</div>
      <div>
        <div class="message-bubble">${formatMessage(msg.text)}</div>
        <div class="message-time">${msg.time}</div>
      </div>
    `;
    container.appendChild(messageDiv);
  });
  scrollToBottom();
}

// ==================== SCHEDULE ====================
function renderSchedulePage() {
  const scheduleList = document.getElementById('schedule-list');
  if (!scheduleList) return;

  const grouped = {};
  AppState.schedules.forEach(event => {
    if (!grouped[event.date]) grouped[event.date] = [];
    grouped[event.date].push(event);
  });

  let html = '';
  Object.entries(grouped).forEach(([date, events]) => {
    const dateLabel = formatDate(date);
    html += `<div class="schedule-date-badge">${dateLabel}</div>`;
    html += events.map(event => `
      <div class="schedule-item type-${event.type}">
        <div class="schedule-time">
          <span class="schedule-time-start">${event.startTime}</span>
          <span class="schedule-time-end">${event.endTime}</span>
        </div>
        <div class="schedule-content">
          <div class="schedule-title">${event.title}</div>
          <div class="schedule-location">📍 ${event.location}</div>
          <div class="schedule-desc">${event.description}</div>
        </div>
      </div>
    `).join('');
  });

  scheduleList.innerHTML = html;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24));

  if (diff === 0) return '今天';
  if (diff === 1) return '明天';
  if (diff === 2) return '后天';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// ==================== PROFILE ====================
function renderProfilePage() {
  const completedTasks = AppState.tasks.filter(t => t.progress === t.totalSteps).length;
  const totalTasks = AppState.tasks.length;
  const askedQuestions = AppState.user.askedQuestions;

  document.getElementById('stat-tasks').textContent = completedTasks;
  document.getElementById('stat-plans').textContent = totalTasks;
  document.getElementById('stat-questions').textContent = askedQuestions;

  const badgesGrid = document.getElementById('badges-grid');
  if (badgesGrid) {
    badgesGrid.innerHTML = MOCK_DATA.badges.map(badge => {
      const isUnlocked = badge.unlocked ||
        (badge.id === 2 && completedTasks >= 3) ||
        (badge.id === 3 && askedQuestions >= 5) ||
        (badge.id === 4 && completedTasks >= 5) ||
        (badge.id === 6 && completedTasks === totalTasks && totalTasks > 0);

      return `
        <div class="badge-item ${isUnlocked ? '' : 'locked'}">
          <span class="badge-icon">${badge.icon}</span>
          <div class="badge-name">${badge.name}</div>
          <div class="badge-desc">${badge.desc}</div>
        </div>
      `;
    }).join('');
  }
}

// ==================== UTILITIES ====================
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function celebrate() {
  const container = document.createElement('div');
  container.className = 'celebration';

  const emojis = ['🎉', '✨', '🎊', '🌟', '💫', '🎈', '🏆', '🎀'];
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'celebration-particle';
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 1 + 's';
    particle.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
    container.appendChild(particle);
  }

  document.body.appendChild(container);
  setTimeout(() => container.remove(), 3000);
}

// Global functions
window.openPlan = openPlan;
window.switchPage = switchPage;
window.toggleStepComplete = toggleStepComplete;
window.toggleStepDetails = toggleStepDetails;
window.openPackagePlan = openPackagePlan;
