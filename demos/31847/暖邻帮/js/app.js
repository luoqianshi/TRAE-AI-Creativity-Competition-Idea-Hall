// 暖邻帮 - 主应用逻辑

// 应用状态
const appState = {
  currentPage: 'home',
  currentRole: 'elderly', // elderly | volunteer | admin
  user: null,
  selectedTask: null,
  filters: {
    status: 'all',
    type: 'all',
    sort: 'newest'
  }
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// 初始化应用
function initApp() {
  // 检查本地存储的用户
  const savedUser = localStorage.getItem('warmNeighborUser');
  if (savedUser) {
    appState.user = JSON.parse(savedUser);
    appState.currentRole = appState.user.role;
  } else {
    // 使用默认用户
    appState.user = { ...currentUser };
  }

  // 绑定导航事件
  bindNavigationEvents();

  // 绑定模态框事件
  bindModalEvents();

  // 绑定表单事件
  bindFormEvents();

  // 显示首页
  showPage('home');

  // 初始化轮播图
  initCarousel();

  // 显示欢迎提示
  showToast('欢迎回来，' + appState.user.name, 'success');
}

// 绑定导航事件
function bindNavigationEvents() {
  // 底部导航
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page) {
        showPage(page);
        updateActiveNav(page);
      }
    });
  });

  // 顶部导航
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) {
        showPage(page);
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  // 移动端菜单按钮
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  // 紧急呼叫按钮
  const emergencyBtn = document.querySelector('.emergency-btn');
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', handleEmergencyCall);
  }
}

// 显示指定页面
function showPage(page) {
  appState.currentPage = page;

  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

  // 显示目标页面
  const targetPage = document.getElementById(`page-${page}`);
  if (targetPage) {
    targetPage.classList.remove('hidden');
    targetPage.classList.add('fade-in');

    // 渲染页面内容
    renderPageContent(page);
  }

  // 更新底部导航激活状态
  updateActiveNav(page);
}

// 渲染页面内容
function renderPageContent(page) {
  switch (page) {
    case 'home':
      renderHomePage();
      break;
    case 'tasks':
      renderTasksPage();
      break;
    case 'matching':
      renderMatchingPage();
      break;
    case 'profile':
      renderProfilePage();
      break;
    case 'messages':
      renderMessagesPage();
      break;
    case 'points':
      renderPointsPage();
      break;
    case 'notice':
      renderNoticePage();
      break;
    case 'volunteer':
      renderVolunteerPage();
      break;
    case 'admin':
      renderAdminPage();
      break;
  }
}

// 更新导航激活状态
function updateActiveNav(page) {
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });
}

// 渲染首页
function renderHomePage() {
  const container = document.getElementById('home-content');
  if (!container) return;

  // 问候语
  const greeting = getGreeting();

  // 统计数据
  const stats = {
    volunteers: volunteers.length,
    tasksToday: tasks.filter(t => t.status === 'pending').length,
    completedMonth: tasks.filter(t => t.status === 'completed').length,
    activeElders: 156
  };

  container.innerHTML = `
    <!-- 欢迎横幅 -->
    <div class="welcome-banner" style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%); padding: 24px; border-radius: var(--radius-lg); margin-bottom: 24px; color: white;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">${greeting}</div>
          <div style="font-size: 24px; font-weight: 700;">${appState.user.name}</div>
          <div style="font-size: 14px; opacity: 0.8; margin-top: 8px;">${appState.user.address}</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 8px;">
            ${appState.user.avatar}
          </div>
          <div style="font-size: 12px; opacity: 0.9;">
            <span style="color: var(--accent-color);">⭐ ${appState.user.creditScore}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷功能 -->
    <div class="quick-actions">
      <div class="quick-action" onclick="openTaskModal('medicine')" style="background: linear-gradient(135deg, #FFF0EB 0%, #FFF5F2 100%);">
        <div class="quick-action-icon" style="background: #FFF0EB; color: var(--primary-color);">💊</div>
        <div class="quick-action-label">代买药</div>
      </div>
      <div class="quick-action" onclick="openTaskModal('hospital')" style="background: linear-gradient(135deg, #E8F8F5 0%, #F0FDF9 100%);">
        <div class="quick-action-icon" style="background: #E8F8F5; color: var(--success-color);">🏥</div>
        <div class="quick-action-label">陪诊挂号</div>
      </div>
      <div class="quick-action" onclick="openTaskModal('delivery')" style="background: linear-gradient(135deg, #E8F6F8 0%, #F0F9FF 100%);">
        <div class="quick-action-icon" style="background: #E8F6F8; color: #0984E3;">📦</div>
        <div class="quick-action-label">代取快递</div>
      </div>
      <div class="quick-action" onclick="openTaskModal('device')" style="background: linear-gradient(135deg, #FEF9E7 0%, #FFFBF0 100%);">
        <div class="quick-action-icon" style="background: #FEF9E7; color: #F39C12;">📱</div>
        <div class="quick-action-label">设备教学</div>
      </div>
      <div class="quick-action" onclick="openTaskModal('heavy')" style="background: linear-gradient(135deg, #F5E6F8 0%, #FAF0FC 100%);">
        <div class="quick-action-icon" style="background: #F5E6F8; color: #9B59B6;">🏋️</div>
        <div class="quick-action-label">搬运重物</div>
      </div>
      <div class="quick-action" onclick="openTaskModal('chat')" style="background: linear-gradient(135deg, #FCE4EC 0%, #FFF0F3 100%);">
        <div class="quick-action-icon" style="background: #FCE4EC; color: #E91E63;">💬</div>
        <div class="quick-action-label">聊天陪伴</div>
      </div>
      <div class="quick-action" onclick="openTaskModal('urgent')" style="background: linear-gradient(135deg, #FDEDEC 0%, #FFF5F5 100%); border: 2px solid var(--danger-color);">
        <div class="quick-action-icon" style="background: #FDEDEC; color: var(--danger-color);">🆘</div>
        <div class="quick-action-label">紧急求助</div>
      </div>
      <div class="quick-action" onclick="showPage('notice')" style="background: linear-gradient(135deg, #F0F9FF 0%, #F5FAFF 100%);">
        <div class="quick-action-icon" style="background: #F0F9FF; color: #0369A1;">📢</div>
        <div class="quick-action-label">社区公告</div>
      </div>
    </div>

    <!-- 数据统计 -->
    <div class="grid grid-4" style="margin-bottom: 32px;">
      <div class="stat-card">
        <div class="stat-icon orange">👥</div>
        <div class="stat-value">${stats.volunteers}</div>
        <div class="stat-label">可用志愿者</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">📋</div>
        <div class="stat-value">${stats.tasksToday}</div>
        <div class="stat-label">待接单任务</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">✅</div>
        <div class="stat-value">${stats.completedMonth}</div>
        <div class="stat-label">本月已完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow">👵</div>
        <div class="stat-value">${stats.activeElders}</div>
        <div class="stat-label">服务老人数</div>
      </div>
    </div>

    <!-- 最新任务 -->
    <div class="card" style="margin-bottom: 32px;">
      <div class="card-title">
        <div class="icon orange">📋</div>
        最新求助
        <a href="#" onclick="showPage('tasks'); return false;" style="margin-left: auto; font-size: 14px; color: var(--primary-color); text-decoration: none;">查看全部 →</a>
      </div>
      <div class="list" id="home-task-list">
        ${renderTaskList(tasks.filter(t => t.status === 'pending').slice(0, 3))}
      </div>
    </div>

    <!-- 社区公告 -->
    <div class="card">
      <div class="card-title">
        <div class="icon blue">📢</div>
        社区公告
        <a href="#" onclick="showPage('notice'); return false;" style="margin-left: auto; font-size: 14px; color: var(--primary-color); text-decoration: none;">更多公告 →</a>
      </div>
      <div>
        ${notices.slice(0, 3).map(notice => `
          <div class="notice-item" style="cursor: pointer;" onclick="showNoticeDetail('${notice.id}')">
            <div class="notice-badge">
              <div class="day">${new Date(notice.date).getDate()}</div>
              <div class="month">${new Date(notice.date).toLocaleDateString('zh-CN', { month: 'short' })}</div>
            </div>
            <div class="notice-content">
              <div class="notice-title">${notice.title}</div>
              <div class="notice-desc">${notice.content.substring(0, 50)}...</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 渲染任务列表
function renderTaskList(taskList) {
  if (taskList.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">暂无任务</div>
        <div class="empty-desc">当前没有需要处理的任务</div>
      </div>
    `;
  }

  return taskList.map(task => {
    const typeInfo = getTaskTypeInfo(task.type);
    const urgencyClass = task.urgency === 'urgent' ? 'urgent' : '';
    const urgencyLabel = task.urgency === 'urgent' ? '紧急' : '';

    return `
      <div class="task-card" style="cursor: pointer;" onclick="showTaskDetail('${task.id}')">
        <div class="task-header">
          <span class="task-type ${typeInfo.id} ${urgencyClass}">
            ${typeInfo.icon} ${typeInfo.name} ${urgencyLabel ? `· ${urgencyLabel}` : ''}
          </span>
          <span class="task-status ${task.status}">${getStatusText(task.status)}</span>
        </div>
        <div class="task-title">${task.title}</div>
        <div class="task-desc">${task.description}</div>
        <div class="task-meta">
          <div class="task-meta-left" style="display: flex; gap: 16px;">
            <span class="location">📍 ${task.elderAddress || '阳光小区'}</span>
          </div>
          <span class="time">⏰ ${getResponseTime(task)}</span>
        </div>
        ${task.status === 'pending' && appState.currentRole === 'volunteer' ? `
          <div class="task-actions">
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); acceptTask('${task.id}')">
              接单
            </button>
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); showAI匹配('${task.id}')">
              AI推荐
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// 渲染任务页面
function renderTasksPage() {
  const container = document.getElementById('tasks-content');
  if (!container) return;

  const filteredTasks = filterTasks(tasks);

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title">互助任务</div>
      <div class="page-subtitle">邻里互助，让温暖传递</div>
    </div>

    <!-- 过滤器 -->
    <div class="filter-group">
      <button class="filter-btn active" onclick="filterTasksByStatus('all', this)">全部</button>
      <button class="filter-btn" onclick="filterTasksByStatus('pending', this)">待接单</button>
      <button class="filter-btn" onclick="filterTasksByStatus('accepted', this)">进行中</button>
      <button class="filter-btn" onclick="filterTasksByStatus('completed', this)">已完成</button>
    </div>

    <div class="filter-group">
      <button class="filter-btn active" onclick="filterTasksByType('all', this)">全部类型</button>
      <button class="filter-btn" onclick="filterTasksByType('medicine', this)">💊 代买药</button>
      <button class="filter-btn" onclick="filterTasksByType('hospital', this)">🏥 陪诊挂号</button>
      <button class="filter-btn" onclick="filterTasksByType('delivery', this)">📦 代取快递</button>
      <button class="filter-btn" onclick="filterTasksByType('device', this)">📱 设备教学</button>
    </div>

    <div id="task-list-container">
      ${renderTaskList(filteredTasks)}
    </div>

    <!-- 发布任务按钮 -->
    <button class="btn btn-primary btn-lg btn-block" style="position: fixed; bottom: 100px; left: 20px; right: 20px; max-width: 400px; margin: 0 auto;" onclick="openTaskModal()">
      发布互助需求
    </button>
  `;
}

// 过滤任务
function filterTasks(taskList) {
  let filtered = [...taskList];

  if (appState.filters.status !== 'all') {
    filtered = filtered.filter(t => t.status === appState.filters.status);
  }

  if (appState.filters.type !== 'all') {
    filtered = filtered.filter(t => t.type === appState.filters.type);
  }

  // 排序
  if (appState.filters.sort === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (appState.filters.sort === 'urgent') {
    filtered.sort((a, b) => {
      const urgencyOrder = { urgent: 0, high: 1, normal: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  } else if (appState.filters.sort === 'reward') {
    filtered.sort((a, b) => b.reward - a.reward);
  }

  return filtered;
}

// 筛选任务（按状态）
function filterTasksByStatus(status, btn) {
  appState.filters.status = status;
  document.querySelectorAll('.filter-group:first-child .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const container = document.getElementById('task-list-container');
  if (container) {
    container.innerHTML = renderTaskList(filterTasks(tasks));
  }
}

// 筛选任务（按类型）
function filterTasksByType(type, btn) {
  appState.filters.type = type;
  document.querySelectorAll('.filter-group:nth-child(2) .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const container = document.getElementById('task-list-container');
  if (container) {
    container.innerHTML = renderTaskList(filterTasks(tasks));
  }
}

// 渲染AI匹配页面
function renderMatchingPage() {
  const container = document.getElementById('matching-content');
  if (!container) return;

  const pendingTasks = tasks.filter(t => t.status === 'pending');

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title">AI智能匹配</div>
      <div class="page-subtitle">智能算法，精准对接供需双方</div>
    </div>

    <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, #E8F8F5 0%, #F0FDF9 100%);">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 32px;">
          🤖
        </div>
        <div style="flex: 1;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">智能匹配引擎</div>
          <div style="font-size: 14px; color: var(--text-secondary);">基于距离、技能、信用等多维度智能计算，为您推荐最合适的志愿者</div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 20px;">
        <div style="text-align: center; padding: 12px; background: white; border-radius: var(--radius-md);">
          <div style="font-size: 20px; font-weight: 700; color: var(--primary-color);">35%</div>
          <div style="font-size: 12px; color: var(--text-secondary);">距离权重</div>
        </div>
        <div style="text-align: center; padding: 12px; background: white; border-radius: var(--radius-md);">
          <div style="font-size: 20px; font-weight: 700; color: var(--success-color);">25%</div>
          <div style="font-size: 12px; color: var(--text-secondary);">技能权重</div>
        </div>
        <div style="text-align: center; padding: 12px; background: white; border-radius: var(--radius-md);">
          <div style="font-size: 20px; font-weight: 700; color: #0984E3;">20%</div>
          <div style="font-size: 12px; color: var(--text-secondary);">信用权重</div>
        </div>
        <div style="text-align: center; padding: 12px; background: white; border-radius: var(--radius-md);">
          <div style="font-size: 20px; font-weight: 700; color: #F39C12;">20%</div>
          <div style="font-size: 12px; color: var(--text-secondary);">其他权重</div>
        </div>
      </div>
    </div>

    <div class="card-title" style="margin-bottom: 16px;">
      <div class="icon green">🎯</div>
      待匹配任务
    </div>

    <div class="list" id="matching-task-list">
      ${pendingTasks.length > 0 ? pendingTasks.map(task => {
        const typeInfo = getTaskTypeInfo(task.type);
        return `
          <div class="list-item" onclick="runAIMatching('${task.id}')" style="border-left: 4px solid ${typeInfo.color};">
            <div class="list-item-icon" style="background: ${typeInfo.color}20; color: ${typeInfo.color};">
              ${typeInfo.icon}
            </div>
            <div class="list-item-content">
              <div class="list-item-title">${task.title}</div>
              <div class="list-item-desc">${task.urgency === 'urgent' ? '🔥 紧急' : '普通'} · ${task.elderAddress}</div>
            </div>
            <div class="list-item-arrow">→</div>
          </div>
        `;
      }).join('') : `
        <div class="empty-state">
          <div class="empty-icon">🎯</div>
          <div class="empty-title">暂无待匹配任务</div>
          <div class="empty-desc">所有任务都已匹配完成</div>
        </div>
      `}
    </div>
  `;
}

// 运行AI匹配
async function runAIMatching(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  // 显示匹配弹窗
  const modal = document.getElementById('ai-matching-modal');
  const content = modal.querySelector('.modal-content');

  content.innerHTML = `
    <div class="ai-matching">
      <div class="ai-animation">🤖</div>
      <div class="ai-status" id="ai-status-text">正在分析任务需求...</div>
      <div class="ai-detail" id="ai-detail-text">请稍候</div>
      <div class="progress-bar" style="width: 100%; margin-top: 24px;">
        <div class="progress" id="ai-progress-bar" style="width: 0%;"></div>
      </div>
    </div>
  `;

  modal.classList.add('active');

  // 模拟AI匹配过程
  const steps = [
    { progress: 20, status: '正在分析任务需求...', detail: '任务类型：代买药' },
    { progress: 40, status: '正在筛选可用志愿者...', detail: '发现 4 位志愿者' },
    { progress: 60, status: '正在计算匹配分数...', detail: '多维度综合评估中' },
    { progress: 80, status: '正在生成推荐方案...', detail: '最优匹配已找到' },
    { progress: 100, status: '匹配完成！', detail: '推荐 3 位最佳志愿者' }
  ];

  for (const step of steps) {
    await delay(400);
    document.getElementById('ai-status-text').textContent = step.status;
    document.getElementById('ai-detail-text').textContent = step.detail;
    document.getElementById('ai-progress-bar').style.width = step.progress + '%';
  }

  await delay(500);

  // 显示匹配结果
  const matches = await aiMatchingEngine.findBestMatches(task, volunteers);

  content.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">🎯 AI匹配结果</div>
      <button class="modal-close" onclick="closeModal('ai-matching-modal')">×</button>
    </div>

    <div style="margin-bottom: 24px;">
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${task.title}</div>
      <div style="font-size: 14px; color: var(--text-secondary);">${task.description}</div>
    </div>

    <div class="match-card">
      <div class="match-header">
        <div class="match-score">
          <div class="match-score-value">${matches[0].score}</div>
          <div class="match-score-label">匹 配 度</div>
        </div>
        <div class="match-reason">
          ${matches[0].reasons.slice(0, 2).map(r => `<div>✓ ${r}</div>`).join('')}
        </div>
      </div>
      <div class="match-details">
        <div class="match-detail-item">
          <div class="match-detail-value">${matches[0].candidate.distance}</div>
          <div class="match-detail-label">距离</div>
        </div>
        <div class="match-detail-item">
          <div class="match-detail-value">⭐${matches[0].candidate.rating}</div>
          <div class="match-detail-label">好评率</div>
        </div>
        <div class="match-detail-item">
          <div class="match-detail-value">${matches[0].estimatedTime}</div>
          <div class="match-detail-label">到达时间</div>
        </div>
      </div>
    </div>

    <div style="margin-top: 24px;">
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-secondary);">推荐志愿者</div>
      ${matches.map((match, index) => `
        <div class="user-card" style="margin-bottom: 12px; ${index === 0 ? 'border: 2px solid var(--primary-color);' : ''}">
          <div class="user-avatar" style="${index === 0 ? 'background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);' : ''}">
            ${match.candidate.avatar}
          </div>
          <div class="user-info">
            <div class="user-name">${match.candidate.name} ${index === 0 ? '👑 推荐' : ''}</div>
            <div class="user-tags">
              ${match.candidate.skills.slice(0, 2).map(s => `<span class="tag">${s}</span>`).join('')}
              <span class="score-badge"><span class="icon">⭐</span>${match.candidate.creditScore}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 700; color: ${match.confidence.color};">${match.score}分</div>
            <div style="font-size: 12px; color: var(--text-secondary);">${match.confidence.text}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('ai-matching-modal')">取消</button>
      <button class="btn btn-primary" onclick="confirmMatching('${taskId}', '${matches[0].candidate.id}')">
        确认派单给 ${matches[0].candidate.name}
      </button>
    </div>
  `;
}

// 确认匹配
function confirmMatching(taskId, volunteerId) {
  const task = tasks.find(t => t.id === taskId);
  const volunteer = volunteers.find(v => v.id === volunteerId);

  if (task && volunteer) {
    task.status = 'accepted';
    task.volunteer = volunteer.name;
    task.acceptedAt = new Date().toLocaleString('zh-CN');

    closeModal('ai-matching-modal');
    showToast(`已成功派单给 ${volunteer.name}！`, 'success');

    // 返回任务页面
    setTimeout(() => {
      showPage('tasks');
    }, 1000);
  }
}

// 渲染个人中心页面
function renderProfilePage() {
  const container = document.getElementById('profile-content');
  if (!container) return;

  const user = appState.user;

  container.innerHTML = `
    <div style="text-align: center; padding: 32px 0;">
      <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%); display: flex; align-items: center; justify-content: center; font-size: 48px; margin: 0 auto 16px; color: white;">
        ${user.avatar}
      </div>
      <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">${user.name}</div>
      <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">${user.address}</div>

      <div style="display: inline-flex; align-items: center; gap: 16px; background: var(--bg-secondary); padding: 12px 24px; border-radius: var(--radius-full); box-shadow: var(--shadow-sm);">
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">${user.creditScore}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">信用分</div>
        </div>
        <div style="width: 1px; height: 40px; background: var(--border-color);"></div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: var(--success-color);">⭐⭐⭐⭐</div>
          <div style="font-size: 12px; color: var(--text-secondary);">信用等级</div>
        </div>
        <div style="width: 1px; height: 40px; background: var(--border-color);"></div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: #F39C12;">${user.points}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">互助积分</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div class="card-title">
        <div class="icon blue">📊</div>
        互助记录
      </div>
      <div class="grid grid-3">
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 32px; font-weight: 700; color: var(--primary-color);">${user.helpReceived}</div>
          <div style="font-size: 14px; color: var(--text-secondary);">接受帮助</div>
        </div>
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 32px; font-weight: 700; color: var(--success-color);">${user.helpHistory}</div>
          <div style="font-size: 14px; color: var(--text-secondary);">帮助他人</div>
        </div>
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 32px; font-weight: 700; color: #F39C12;">4.9</div>
          <div style="font-size: 14px; color: var(--text-secondary);">综合评分</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div class="card-title">
        <div class="icon orange">⚙️</div>
        账号设置
      </div>
      <div class="list">
        <div class="list-item" onclick="showProfileEdit()">
          <div class="list-item-icon" style="background: #FFF0EB; color: var(--primary-color);">👤</div>
          <div class="list-item-content">
            <div class="list-item-title">编辑个人信息</div>
            <div class="list-item-desc">修改头像、昵称、联系方式</div>
          </div>
          <div class="list-item-arrow">›</div>
        </div>
        <div class="list-item" onclick="showEmergencyContact()">
          <div class="list-item-icon" style="background: #FDEDEC; color: var(--danger-color);">📞</div>
          <div class="list-item-content">
            <div class="list-item-title">紧急联系人</div>
            <div class="list-item-desc">${user.emergencyContact}</div>
          </div>
          <div class="list-item-arrow">›</div>
        </div>
        <div class="list-item" onclick="showPage('points')">
          <div class="list-item-icon" style="background: #FEF9E7; color: #F39C12);">🎁</div>
          <div class="list-item-content">
            <div class="list-item-title">积分商城</div>
            <div class="list-item-desc">当前积分 ${user.points}，可兑换多种商品</div>
          </div>
          <div class="list-item-arrow">›</div>
        </div>
        <div class="list-item" onclick="switchRole()">
          <div class="list-item-icon" style="background: #E8F8F5; color: var(--success-color);">🔄</div>
          <div class="list-item-content">
            <div class="list-item-title">切换角色</div>
            <div class="list-item-desc">当前：${user.role === 'elderly' ? '老年人' : user.role === 'volunteer' ? '志愿者' : '管理员'}</div>
          </div>
          <div class="list-item-arrow">›</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">
        <div class="icon green">ℹ️</div>
        其他设置
      </div>
      <div class="list">
        <div class="list-item">
          <div class="list-item-icon" style="background: #F0F9FF; color: #0369A1;">🔔</div>
          <div class="list-item-content">
            <div class="list-item-title">消息通知</div>
            <div class="list-item-desc">接收任务推送、邻里互动等消息</div>
          </div>
          <div class="toggle active" onclick="this.classList.toggle('active')"></div>
        </div>
        <div class="list-item">
          <div class="list-item-icon" style="background: #F5F5F5; color: var(--text-secondary);">🌐</div>
          <div class="list-item-content">
            <div class="list-item-title">方言设置</div>
            <div class="list-item-desc">选择您熟悉的方言播报</div>
          </div>
          <div class="list-item-arrow">›</div>
        </div>
      </div>
    </div>
  `;
}

// 渲染积分页面
function renderPointsPage() {
  const container = document.getElementById('points-content');
  if (!container) return;

  const user = appState.user;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title">积分商城</div>
      <div class="page-subtitle">用积分兑换暖心好物</div>
    </div>

    <div class="card" style="background: linear-gradient(135deg, #FFF9E6 0%, #FFF3CC 100%); border: 2px solid var(--accent-color); margin-bottom: 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">我的积分</div>
          <div style="font-size: 36px; font-weight: 700; color: #B7791F;">${user.points}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; color: var(--text-secondary);">本月获取</div>
          <div style="font-size: 24px; font-weight: 700; color: var(--success-color);">+120</div>
        </div>
      </div>
    </div>

    <div class="card-title" style="margin-bottom: 16px;">
      <div class="icon orange">🎁</div>
      可兑换商品
    </div>

    <div class="grid grid-3">
      ${products.map(product => `
        <div class="card" style="text-align: center; cursor: pointer;" onclick="exchangeProduct('${product.id}')">
          <div style="font-size: 48px; margin-bottom: 12px;">${product.icon}</div>
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${product.name}</div>
          <div style="font-size: 24px; font-weight: 700; color: var(--primary-color); margin-bottom: 8px;">${product.points} 积分</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">剩余 ${product.stock} 件</div>
          <button class="btn btn-primary btn-sm ${user.points < product.points ? 'btn-disabled' : ''}" ${user.points < product.points ? 'disabled' : ''}>
            ${user.points < product.points ? '积分不足' : '立即兑换'}
          </button>
        </div>
      `).join('')}
    </div>

    <div class="card" style="margin-top: 24px;">
      <div class="card-title">
        <div class="icon green">📜</div>
        积分记录
      </div>
      <div class="timeline">
        ${pointRecords.map(record => `
          <div class="timeline-item ${record.type === 'spend' ? '' : 'completed'}">
            <div class="timeline-time">${record.date}</div>
            <div class="timeline-content">
              <span style="color: ${record.type === 'earn' ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight: 600;">
                ${record.type === 'earn' ? '+' : ''}${record.amount}
              </span>
              · ${record.reason}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 渲染消息页面
function renderMessagesPage() {
  const container = document.getElementById('messages-content');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title">消息中心</div>
      <div class="page-subtitle">邻里互动，温暖传递</div>
    </div>

    <div class="card">
      <div class="card-title">
        <div class="icon orange">💬</div>
        最新消息
      </div>
      <div class="list">
        <div class="list-item" style="border-left: 4px solid var(--success-color);">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
            👩
          </div>
          <div class="list-item-content">
            <div class="list-item-title" style="display: flex; align-items: center; gap: 8px;">
              李阿姨
              <span style="font-size: 12px; color: var(--text-light);">刚刚</span>
            </div>
            <div class="list-item-desc">您好，我已收到您的代买药需求，请问药品清单在哪里呢？</div>
          </div>
        </div>
        <div class="list-item">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #E8F8F5; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
            📢
          </div>
          <div class="list-item-content">
            <div class="list-item-title" style="display: flex; align-items: center; gap: 8px;">
              系统通知
              <span style="font-size: 12px; color: var(--text-light);">2小时前</span>
            </div>
            <div class="list-item-desc">您发布的水电费代缴任务已被王小明接单，预计15分钟内完成。</div>
          </div>
        </div>
        <div class="list-item">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #FEF9E7; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
            ⭐
          </div>
          <div class="list-item-content">
            <div class="list-item-title" style="display: flex; align-items: center; gap: 8px;">
              积分到账
              <span style="font-size: 12px; color: var(--text-light);">昨天</span>
            </div>
            <div class="list-item-desc">恭喜！您帮助王爷爷完成陪诊任务，获得20积分奖励。</div>
          </div>
        </div>
        <div class="list-item">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #E8F6F8; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
            🤝
          </div>
          <div class="list-item-content">
            <div class="list-item-title" style="display: flex; align-items: center; gap: 8px;">
              社区互助
              <span style="font-size: 12px; color: var(--text-light);">3天前</span>
            </div>
            <div class="list-item-desc">下周一将举办"邻里茶话会"，欢迎各位老年朋友参加，报名请拨打居委会电话。</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 渲染公告页面
function renderNoticePage() {
  const container = document.getElementById('notice-content');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title">社区公告</div>
      <div class="page-subtitle">邻里动态，一手掌握</div>
    </div>

    <div class="list">
      ${notices.map(notice => `
        <div class="card" style="margin-bottom: 16px; cursor: pointer;" onclick="showNoticeDetail('${notice.id}')">
          <div style="display: flex; gap: 16px;">
            <div class="notice-badge" style="flex-shrink: 0;">
              <div class="day">${new Date(notice.date).getDate()}</div>
              <div class="month">${new Date(notice.date).toLocaleDateString('zh-CN', { month: 'short' })}</div>
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 14px; font-weight: 600;">${notice.title}</span>
                <span class="tag" style="background: ${notice.type === 'activity' ? '#E8F8F5' : notice.type === 'service' ? '#FFF0EB' : '#E8F6F8'}; color: ${notice.type === 'activity' ? 'var(--success-color)' : notice.type === 'service' ? 'var(--primary-color)' : '#0984E3'};">
                  ${notice.type === 'activity' ? '🏃 活动' : notice.type === 'service' ? '🛠 服务' : '📢 通知'}
                </span>
              </div>
              <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">${notice.content}</div>
              <div style="font-size: 12px; color: var(--text-light); margin-top: 8px;">发布者：${notice.author}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 渲染志愿者页面
function renderVolunteerPage() {
  const container = document.getElementById('volunteer-content');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title">志愿者团队</div>
      <div class="page-subtitle">感谢每一位温暖有爱的邻居</div>
    </div>

    <div class="grid grid-4" style="margin-bottom: 32px;">
      <div class="stat-card">
        <div class="stat-icon orange">👥</div>
        <div class="stat-value">${volunteers.length}</div>
        <div class="stat-label">注册志愿者</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">⏱️</div>
        <div class="stat-value">156h</div>
        <div class="stat-label">本月服务时长</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">⭐</div>
        <div class="stat-value">4.8</div>
        <div class="stat-label">平均好评率</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow">🎯</div>
        <div class="stat-value">98%</div>
        <div class="stat-label">响应率</div>
      </div>
    </div>

    <div class="card-title" style="margin-bottom: 16px;">
      <div class="icon green">🌟</div>
      优秀志愿者
    </div>

    <div class="list">
      ${volunteers.map(vol => `
        <div class="user-card" style="margin-bottom: 16px;">
          <div class="user-avatar">${vol.avatar}</div>
          <div class="user-info">
            <div class="user-name">${vol.name}
              ${vol.creditLevel >= 5 ? '👑' : ''}
              <span style="font-size: 12px; color: var(--text-secondary); font-weight: normal;"> · ${vol.age}岁</span>
            </div>
            <div class="user-tags">
              ${vol.skills.slice(0, 3).map(s => `<span class="tag volunteer">${s}</span>`).join('')}
            </div>
            <div style="display: flex; gap: 16px; margin-top: 8px; font-size: 13px; color: var(--text-secondary);">
              <span>📍 ${vol.distance}</span>
              <span>✅ 已完成 ${vol.completedTasks} 次</span>
              <span>⭐ ${vol.rating}</span>
            </div>
          </div>
          <div style="text-align: center;">
            <div class="score-badge">
              <span class="icon">⭐</span>
              ${vol.creditScore}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <button class="btn btn-primary btn-lg btn-block" style="margin-top: 24px;" onclick="openVolunteerApplyModal()">
      申请成为志愿者
    </button>
  `;
}

// 渲染管理页面
function renderAdminPage() {
  const container = document.getElementById('admin-content');
  if (!container) return;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title">管理后台</div>
      <div class="page-subtitle">社区数据一目了然</div>
    </div>

    <div class="grid grid-4" style="margin-bottom: 32px;">
      <div class="stat-card">
        <div class="stat-icon orange">👵</div>
        <div class="stat-value">156</div>
        <div class="stat-label">注册老人</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">👨‍⚕️</div>
        <div class="stat-value">${volunteers.length}</div>
        <div class="stat-label">志愿者</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">📋</div>
        <div class="stat-value">${tasks.filter(t => t.status === 'pending').length}</div>
        <div class="stat-label">待处理任务</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow">✅</div>
        <div class="stat-value">${tasks.filter(t => t.status === 'completed').length}</div>
        <div class="stat-label">本月完成</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div class="card-title">
        <div class="icon blue">📊</div>
        任务统计
      </div>
      <div class="chart-container">
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; text-align: center;">
          ${['周一', '周二', '周三', '周四', '周五', '周六'].map((day, i) => `
            <div>
              <div style="height: 120px; background: linear-gradient(to top, var(--primary-color) 0%, var(--primary-light) ${30 + Math.random() * 70}%); border-radius: var(--radius-sm) var(--radius-sm) 0 0; margin-bottom: 8px;"></div>
              <div style="font-size: 14px; color: var(--text-secondary);">${day}</div>
              <div style="font-size: 16px; font-weight: 600;">${Math.floor(Math.random() * 20) + 5}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div class="card-title">
        <div class="icon green">📋</div>
        待审核志愿者申请
      </div>
      <div class="list">
        <div class="list-item">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #E8F8F5; display: flex; align-items: center; justify-content: center; font-size: 24px;">👨</div>
          <div class="list-item-content">
            <div class="list-item-title">张先生</div>
            <div class="list-item-desc">申请时间：2024-01-14 | 擅长：代取快递、搬运</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-success btn-sm" onclick="approveVolunteer('temp_001')">通过</button>
            <button class="btn btn-secondary btn-sm" onclick="rejectVolunteer('temp_001')">拒绝</button>
          </div>
        </div>
        <div class="list-item">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #FFF0EB; display: flex; align-items: center; justify-content: center; font-size: 24px;">👩</div>
          <div class="list-item-content">
            <div class="list-item-title">王女士</div>
            <div class="list-item-desc">申请时间：2024-01-13 | 擅长：陪诊挂号、代买药</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-success btn-sm" onclick="approveVolunteer('temp_002')">通过</button>
            <button class="btn btn-secondary btn-sm" onclick="rejectVolunteer('temp_002')">拒绝</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">
        <div class="icon orange">📢</div>
        发布公告
      </div>
      <div class="form-group">
        <label class="form-label">公告标题</label>
        <input type="text" class="form-input" placeholder="请输入公告标题">
      </div>
      <div class="form-group">
        <label class="form-label">公告类型</label>
        <select class="form-select">
          <option>📢 社区通知</option>
          <option>🏃 活动公告</option>
          <option>🛠 服务更新</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">公告内容</label>
        <textarea class="form-input" placeholder="请输入公告内容..."></textarea>
      </div>
      <button class="btn btn-primary" onclick="publishNotice()">发布公告</button>
    </div>
  `;
}

// 打开任务发布弹窗
function openTaskModal(taskType = null) {
  const modal = document.getElementById('task-modal');
  const typeSelect = document.getElementById('task-type-select');

  if (typeSelect && taskType) {
    typeSelect.value = taskType;
  }

  modal.classList.add('active');
}

// 打开志愿者申请弹窗
function openVolunteerApplyModal() {
  const modal = document.getElementById('volunteer-apply-modal');
  modal.classList.add('active');
}

// 接受任务
function acceptTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'accepted';
    task.volunteer = appState.user.name;
    task.acceptedAt = new Date().toLocaleString('zh-CN');

    showToast('任务接单成功！', 'success');

    // 刷新任务列表
    if (appState.currentPage === 'tasks') {
      renderTasksPage();
    } else if (appState.currentPage === 'home') {
      renderHomePage();
    }
  }
}

// 显示任务详情
function showTaskDetail(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const typeInfo = getTaskTypeInfo(task.type);

  const modal = document.getElementById('task-detail-modal');
  const content = modal.querySelector('.modal-content');

  content.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">任务详情</div>
      <button class="modal-close" onclick="closeModal('task-detail-modal')">×</button>
    </div>

    <div style="margin-bottom: 20px;">
      <span class="task-type ${typeInfo.id}" style="font-size: 16px;">
        ${typeInfo.icon} ${typeInfo.name}
        ${task.urgency === 'urgent' ? '<span style="color: var(--danger-color);">· 🔥 紧急</span>' : ''}
      </span>
    </div>

    <div class="card-title" style="font-size: 20px; margin-bottom: 16px;">
      ${task.title}
    </div>

    <div style="margin-bottom: 20px;">
      <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.8;">
        <div style="margin-bottom: 8px;">📝 <strong>需求描述：</strong></div>
        <div style="padding-left: 24px; margin-bottom: 12px;">${task.description}</div>
        ${task.remark ? `<div style="padding-left: 24px; color: var(--primary-color);">💡 备注：${task.remark}</div>` : ''}
      </div>
    </div>

    <div style="background: var(--bg-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px;">
      <div style="font-size: 14px; margin-bottom: 12px;">
        <span style="color: var(--text-secondary);">📍 地址：</span>
        <span style="font-weight: 600;">${task.elderAddress || '阳光小区'}</span>
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;">
        <span style="color: var(--text-secondary);">⏰ 期望时间：</span>
        <span style="font-weight: 600;">${task.preferredTime}</span>
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;">
        <span style="color: var(--text-secondary);">💰 奖励积分：</span>
        <span style="font-weight: 600; color: var(--primary-color);">${task.reward} 积分</span>
      </div>
      <div style="font-size: 14px;">
        <span style="color: var(--text-secondary);">📞 联系电话：</span>
        <span style="font-weight: 600;">${task.elderPhone}</span>
      </div>
    </div>

    ${task.status === 'pending' && appState.currentRole === 'volunteer' ? `
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('task-detail-modal')">关闭</button>
        <button class="btn btn-primary" onclick="acceptTask('${task.id}'); closeModal('task-detail-modal');">
          接单
        </button>
      </div>
    ` : ''}

    ${task.status === 'accepted' && task.volunteer ? `
      <div style="background: #E8F8F5; border-radius: var(--radius-md); padding: 16px; text-align: center;">
        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">已由</div>
        <div style="font-size: 20px; font-weight: 600; color: var(--success-color);">${task.volunteer}</div>
        <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">接单处理中</div>
      </div>
    ` : ''}
  `;

  modal.classList.add('active');
}

// 显示公告详情
function showNoticeDetail(noticeId) {
  const notice = notices.find(n => n.id === noticeId);
  if (!notice) return;

  const modal = document.getElementById('notice-detail-modal');
  const content = modal.querySelector('.modal-content');

  content.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">${notice.title}</div>
      <button class="modal-close" onclick="closeModal('notice-detail-modal')">×</button>
    </div>

    <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">
      📅 ${notice.date} · ${notice.author}
    </div>

    <div style="font-size: 16px; line-height: 1.8; color: var(--text-primary);">
      ${notice.content}
    </div>

    <div class="modal-footer">
      <button class="btn btn-primary" onclick="closeModal('notice-detail-modal')">我知道了</button>
    </div>
  `;

  modal.classList.add('active');
}

// 显示编辑个人信息
function showProfileEdit() {
  showToast('功能开发中...', 'warning');
}

// 显示紧急联系人
function showEmergencyContact() {
  showToast('功能开发中...', 'warning');
}

// 切换角色
function switchRole() {
  const roles = ['elderly', 'volunteer', 'admin'];
  const currentIndex = roles.indexOf(appState.currentRole);
  const nextIndex = (currentIndex + 1) % roles.length;
  appState.currentRole = roles[nextIndex];

  const roleNames = {
    elderly: '老年人',
    volunteer: '志愿者',
    admin: '管理员'
  };

  showToast(`已切换为${roleNames[appState.currentRole]}角色`, 'success');

  // 刷新页面
  renderPageContent(appState.currentPage);
}

// 兑换商品
function exchangeProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (appState.user.points < product.points) {
    showToast('积分不足，无法兑换', 'error');
    return;
  }

  if (product.stock <= 0) {
    showToast('该商品已兑完', 'error');
    return;
  }

  appState.user.points -= product.points;
  product.stock--;

  showToast(`恭喜！已成功兑换 ${product.name}`, 'success');
  renderPointsPage();
}

// 发布公告
function publishNotice() {
  showToast('公告发布成功！', 'success');
}

// 审核志愿者
function approveVolunteer(id) {
  showToast('志愿者申请已通过', 'success');
  renderAdminPage();
}

function rejectVolunteer(id) {
  showToast('已拒绝该申请', 'warning');
  renderAdminPage();
}

// 紧急呼叫
function handleEmergencyCall() {
  if (confirm('确认发起紧急求助吗？系统将立即通知附近志愿者和社区工作人员。')) {
    showToast('紧急求助已发出，救援人员正在赶来！', 'warning');

    // 模拟通知
    setTimeout(() => {
      showToast('李阿姨已响应，正赶往您的位置', 'success');
    }, 2000);
  }
}

// 绑定模态框事件
function bindModalEvents() {
  // 点击遮罩关闭
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
}

// 绑定表单事件
function bindFormEvents() {
  // 发布任务表单
  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleTaskSubmit();
    });
  }
}

// 处理任务提交
function handleTaskSubmit() {
  const formData = new FormData(document.getElementById('task-form'));
  const taskData = Object.fromEntries(formData);

  // 创建新任务
  const newTask = {
    id: 'task_' + Date.now(),
    type: taskData.type,
    title: taskData.title,
    description: taskData.description,
    elderName: appState.user.name,
    elderPhone: appState.user.phone,
    elderAddress: appState.user.address,
    reward: parseInt(taskData.reward) || 20,
    urgency: taskData.urgency || 'normal',
    status: 'pending',
    createdAt: new Date().toLocaleString('zh-CN'),
    preferredTime: taskData.preferredTime,
    remark: taskData.remark
  };

  tasks.unshift(newTask);

  closeModal('task-modal');
  showToast('任务发布成功！等待志愿者接单...', 'success');

  // 清空表单
  document.getElementById('task-form').reset();

  // 刷新页面
  renderHomePage();
}

// 关闭模态框
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// 显示吐司消息
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠'
  };

  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-message">${message}</div>
  `;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// 获取问候语
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '夜深了';
}

// 初始化轮播图
function initCarousel() {
  const carousel = document.querySelector('.carousel-inner');
  if (!carousel) return;

  let currentIndex = 0;
  const items = carousel.querySelectorAll('.carousel-item');
  const indicators = document.querySelectorAll('.carousel-indicator');

  // 自动轮播
  setInterval(() => {
    currentIndex = (currentIndex + 1) % items.length;
    updateCarousel();
  }, 5000);

  function updateCarousel() {
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === currentIndex);
    });
  }

  indicators.forEach((ind, i) => {
    ind.addEventListener('click', () => {
      currentIndex = i;
      updateCarousel();
    });
  });
}

// 切换移动端菜单
function toggleMobileMenu() {
  const nav = document.querySelector('.nav-links');
  nav.classList.toggle('mobile-open');
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 导出到全局
window.showPage = showPage;
window.filterTasksByStatus = filterTasksByStatus;
window.filterTasksByType = filterTasksByType;
window.openTaskModal = openTaskModal;
window.acceptTask = acceptTask;
window.showTaskDetail = showTaskDetail;
window.showNoticeDetail = showNoticeDetail;
window.openVolunteerApplyModal = openVolunteerApplyModal;
window.exchangeProduct = exchangeProduct;
window.publishNotice = publishNotice;
window.approveVolunteer = approveVolunteer;
window.rejectVolunteer = rejectVolunteer;
window.handleEmergencyCall = handleEmergencyCall;
window.closeModal = closeModal;
window.runAIMatching = runAIMatching;
window.confirmMatching = confirmMatching;
window.showProfileEdit = showProfileEdit;
window.showEmergencyContact = showEmergencyContact;
window.switchRole = switchRole;
window.renderTaskList = renderTaskList;