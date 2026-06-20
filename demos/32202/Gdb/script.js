const FATE_RANKS = ['凡人', '修士', '居士', '真人', '地仙', '天仙'];
const FATE_THRESHOLDS = [0, 100, 300, 600, 1000, 1500];

let currentUser = {
    cultivation: 0,
    merit: 0,
    fateRank: 0,
    level: 1,
    achievements: [],
    mainQuests: [],
    tasks: [],
    trialQuests: [],
    history: [],
    meritArchive: []
};

let pendingTask = null;
let currentPeriod = 'week';

function initApp() {
    loadData();
    updateUI();
    setupEventListeners();
    if (currentUser.tasks.length === 0 && currentUser.mainQuests.length === 0) {
        showWelcomeModal();
    }
}

function loadData() {
    const saved = localStorage.getItem('meritBookData');
    if (saved) {
        currentUser = JSON.parse(saved);
    } else {
        initDemoData();
    }
}

function initDemoData() {
    currentUser.tasks = [
        { id: 't1', name: '晨读学习', desc: '阅读30分钟', type: 'cultivation', difficulty: 1, reward: 10, deadline: getToday(), repeat: 'daily', completed: false, createdAt: getToday() },
        { id: 't2', name: '健身锻炼', desc: '运动1小时', type: 'cultivation', difficulty: 2, reward: 15, deadline: getToday(), repeat: 'daily', completed: false, createdAt: getToday() },
        { id: 't3', name: '社区志愿', desc: '参与社区服务', type: 'merit', difficulty: 2, reward: 20, deadline: getToday(), repeat: 'weekly', completed: false, createdAt: getToday() }
    ];
    currentUser.mainQuests = [
        { id: 'mq1', name: '学业精进', desc: '完成学业目标', stages: ['小学毕业', '初中毕业', '高中毕业', '大学毕业'], completedStages: [0], createdAt: getToday() }
    ];
    currentUser.history = [
        { id: 'h1', type: 'achievement', title: '初入修行', desc: '完成第一个任务', date: getToday(), icon: '🌟' },
        { id: 'h2', type: 'task', title: '晨读学习', desc: '获得10修为', date: getToday(), icon: '📚' }
    ];
    saveData();
}

function saveData() {
    localStorage.setItem('meritBookData', JSON.stringify(currentUser));
}

function updateUI() {
    updateFateCard();
    updateTodayTasks();
    updateMainQuest();
    updateRecentAchievements();
    updateBookTabs();
    updateMeritArchive();
}

function updateFateCard() {
    const totalScore = currentUser.cultivation + Math.floor(currentUser.merit * 0.5);
    let rank = 0;
    for (let i = FATE_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalScore >= FATE_THRESHOLDS[i]) {
            rank = i;
            break;
        }
    }
    currentUser.fateRank = rank;
    
    const nextThreshold = FATE_THRESHOLDS[Math.min(rank + 1, FATE_THRESHOLDS.length - 1)];
    const currentThreshold = FATE_THRESHOLDS[rank];
    const progress = ((totalScore - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    
    document.getElementById('fateRank').textContent = FATE_RANKS[rank];
    document.getElementById('fateLevel').textContent = `Lv.${Math.floor(totalScore / 100) + 1}`;
    document.getElementById('cultivationValue').textContent = `${currentUser.cultivation}`;
    document.getElementById('meritValue').textContent = `${currentUser.merit}`;
    
    const cultivationBar = document.getElementById('cultivationBar');
    const meritBar = document.getElementById('meritBar');
    
    cultivationBar.style.width = `${Math.min(100, (currentUser.cultivation % 100))}%`;
    meritBar.style.width = `${Math.min(100, (currentUser.merit % 100))}%`;
    
    updateBadges();
}

function updateBadges() {
    const badgeContainer = document.getElementById('fateBadge');
    const badges = [];
    
    if (currentUser.cultivation >= 100) badges.push({ name: '初窥门径', icon: '🌱' });
    if (currentUser.merit >= 50) badges.push({ name: '善心初显', icon: '❤️' });
    if (currentUser.tasks.filter(t => t.completed).length >= 10) badges.push({ name: '勤奋修行', icon: '💪' });
    
    badgeContainer.innerHTML = badges.map(b => `<span class="badge">${b.icon} ${b.name}</span>`).join('');
}

function updateTodayTasks() {
    const today = getToday();
    const todayTasks = currentUser.tasks.filter(t => {
        if (t.completed) return false;
        if (t.repeat === 'daily') return true;
        if (t.repeat === 'weekly') return isThisWeek(t.createdAt);
        if (t.repeat === 'monthly') return isThisMonth(t.createdAt);
        return t.deadline === today;
    });
    
    const container = document.getElementById('todayTasks');
    
    if (todayTasks.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">📝</span><p>今日暂无任务，快去创建吧</p></div>`;
        return;
    }
    
    container.innerHTML = todayTasks.map(task => `
        <div class="task-item" data-task-id="${task.id}" onclick="showCompleteModal('${task.id}')">
            <input type="checkbox" class="task-checkbox" onchange="handleTaskCheck(event, '${task.id}')">
            <div class="task-info">
                <div class="task-name">${task.name}</div>
                <div class="task-meta">${task.desc} · ${getTypeLabel(task.type)} · +${task.reward}${task.type === 'merit' ? '功德' : '修为'}</div>
            </div>
            <div class="task-reward">+${task.reward}</div>
        </div>
    `).join('');
}

function getTypeLabel(type) {
    const labels = { cultivation: '修为', merit: '功德', trial: '历劫' };
    return labels[type] || type;
}

function updateMainQuest() {
    const container = document.getElementById('mainQuest');
    
    if (currentUser.mainQuests.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">🎯</span><p>暂无主线任务</p></div>`;
        return;
    }
    
    const quest = currentUser.mainQuests[0];
    const progress = (quest.completedStages.length / quest.stages.length) * 100;
    
    container.innerHTML = `
        <div class="quest-title">${quest.name}</div>
        <div class="quest-progress"><div class="quest-progress-fill" style="width: ${progress}%"></div></div>
        <div class="quest-stages">
            ${quest.stages.map((stage, index) => `
                <span class="stage-tag ${quest.completedStages.includes(index) ? 'completed' : ''}">${stage}</span>
            `).join('')}
        </div>
    `;
}

function updateRecentAchievements() {
    const container = document.getElementById('recentAchievements');
    const recent = currentUser.history.filter(h => h.type === 'achievement').slice(-4);
    
    if (recent.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">🏆</span><p>暂无成就</p></div>`;
        return;
    }
    
    container.innerHTML = recent.map(item => `
        <div class="achievement-item">
            <div class="achievement-icon">${item.icon}</div>
            <div class="achievement-name">${item.title}</div>
        </div>
    `).join('');
}

function updateBookTabs() {
    updateBookMain();
    updateBookMerit();
    updateBookTrial();
    updateBookHistory();
}

function updateBookMain() {
    const container = document.getElementById('mainQuests');
    
    if (currentUser.mainQuests.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">🎯</span><p>暂无主线目标</p></div>`;
        return;
    }
    
    container.innerHTML = currentUser.mainQuests.map(quest => {
        const progress = (quest.completedStages.length / quest.stages.length) * 100;
        return `
            <div class="quest-item">
                <div class="quest-title">${quest.name}</div>
                <div class="quest-progress"><div class="quest-progress-fill" style="width: ${progress}%"></div></div>
                <div class="quest-stages">
                    ${quest.stages.map((stage, index) => `
                        <span class="stage-tag ${quest.completedStages.includes(index) ? 'completed' : ''}" onclick="completeStage('${quest.id}', ${index})">${stage}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function updateBookMerit() {
    const container = document.getElementById('meritTasks');
    const meritTasks = currentUser.tasks.filter(t => t.type === 'merit' && !t.completed);
    
    if (meritTasks.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">❤️</span><p>暂无功德任务</p></div>`;
        return;
    }
    
    container.innerHTML = meritTasks.map(task => `
        <div class="task-item" data-task-id="${task.id}" onclick="showCompleteModal('${task.id}')">
            <input type="checkbox" class="task-checkbox" onchange="handleTaskCheck(event, '${task.id}')">
            <div class="task-info">
                <div class="task-name">${task.name}</div>
                <div class="task-meta">${task.desc} · +${task.reward}功德</div>
            </div>
            <div class="task-reward">+${task.reward}</div>
        </div>
    `).join('');
}

function updateBookTrial() {
    const container = document.getElementById('trialTasks');
    
    if (currentUser.trialQuests.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">⚡</span><p>暂无历劫挑战</p></div>`;
        return;
    }
    
    container.innerHTML = currentUser.trialQuests.map(trial => `
        <div class="trial-card">
            <div class="trial-name">${trial.name}</div>
            <div class="trial-desc">${trial.desc}</div>
            <div class="trial-meta">
                <span>难度: ${'⭐'.repeat(trial.difficulty)}</span>
                <span>奖励: +${trial.reward * 2}修为/功德</span>
                <span>截止: ${trial.deadline}</span>
            </div>
            <button class="service-btn" onclick="showTrialModal('${trial.id}')">挑战</button>
        </div>
    `).join('');
}

function updateBookHistory() {
    const container = document.getElementById('timeline');
    
    if (currentUser.history.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">📜</span><p>暂无记录</p></div>`;
        return;
    }
    
    container.innerHTML = currentUser.history.map(item => `
        <div class="timeline-item">
            <div class="timeline-date">${formatDate(item.date)}</div>
            <div class="timeline-content">${item.icon} ${item.title} - ${item.desc}</div>
        </div>
    `).join('');
}

function updateMeritArchive() {
    const container = document.getElementById('meritArchive');
    
    if (currentUser.meritArchive.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">📋</span><p>暂无公益记录</p></div>`;
        return;
    }
    
    container.innerHTML = currentUser.meritArchive.map(item => `
        <div class="timeline-item">
            <div class="timeline-date">${formatDate(item.date)}</div>
            <div class="timeline-content">${item.icon} ${item.name} - ${item.desc}</div>
        </div>
    `).join('');
}

function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    document.querySelectorAll('.book-tab').forEach(btn => {
        btn.addEventListener('click', () => switchBookTab(btn.dataset.bookTab));
    });
    
    document.querySelectorAll('.replay-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPeriod = btn.dataset.period;
            updateReplay();
            btn.classList.add('active');
            document.querySelectorAll('.replay-tab').forEach(b => b !== btn && b.classList.remove('active'));
        });
    });
    
    document.querySelectorAll('.hall-tab').forEach(btn => {
        btn.addEventListener('click', () => filterServices(btn.dataset.category));
    });
    
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => applyTemplate(JSON.parse(btn.dataset.template)));
    });
    
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    
    document.querySelectorAll('.type-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.add('active');
            document.querySelectorAll('.type-tab').forEach(b => b !== btn && b.classList.remove('active'));
        });
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    if (tabId === 'replay') {
        updateReplay();
    }
}

function switchBookTab(tabId) {
    document.querySelectorAll('.book-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-book-tab="${tabId}"]`).classList.add('active');
    
    document.querySelectorAll('.book-page').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`book-${tabId}`).classList.add('active');
}

function handleTaskSubmit(e) {
    e.preventDefault();
    
    const type = document.querySelector('.type-tab.active').dataset.type;
    const task = {
        id: 't' + Date.now(),
        name: document.getElementById('taskName').value,
        desc: document.getElementById('taskDesc').value,
        type: type,
        difficulty: parseInt(document.getElementById('taskDifficulty').value),
        reward: parseInt(document.getElementById('taskReward').value),
        deadline: document.getElementById('taskDeadline').value || getToday(),
        repeat: document.getElementById('taskRepeat').value,
        completed: false,
        createdAt: getToday()
    };
    
    currentUser.tasks.push(task);
    saveData();
    updateUI();
    showNotification('任务创建成功！');
    
    document.getElementById('taskForm').reset();
    switchTab('home');
}

function applyTemplate(template) {
    document.getElementById('taskName').value = template.name;
    document.getElementById('taskDesc').value = template.desc;
    document.getElementById('taskDifficulty').value = template.difficulty;
    document.getElementById('taskReward').value = template.reward;
    document.getElementById('taskRepeat').value = template.repeat;
}

function showCompleteModal(taskId) {
    const task = currentUser.tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;
    
    pendingTask = task;
    document.getElementById('modalTitle').textContent = '完成任务';
    document.getElementById('confirmMessage').textContent = `确认完成「${task.name}」？`;
    document.getElementById('confirmIcon').textContent = task.type === 'merit' ? '❤️' : '📚';
    document.getElementById('rewardPreview').innerHTML = `
        <p>奖励: +${task.reward} ${task.type === 'merit' ? '功德值' : '修为值'}</p>
    `;
    document.getElementById('confirmBtn').onclick = confirmTask;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function showTrialModal(trialId) {
    const trial = currentUser.trialQuests.find(t => t.id === trialId);
    if (!trial) return;
    
    pendingTask = trial;
    document.getElementById('modalTitle').textContent = '挑战确认';
    document.getElementById('confirmMessage').textContent = `确认挑战「${trial.name}」？`;
    document.getElementById('confirmIcon').textContent = '⚡';
    document.getElementById('rewardPreview').innerHTML = `
        <p>成功奖励: +${trial.reward * 2}修为/功德</p>
        <p>失败惩罚: 小幅命格负面影响</p>
    `;
    document.getElementById('confirmBtn').onclick = confirmTrial;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    pendingTask = null;
}

function confirmTask() {
    if (!pendingTask) return;
    
    const task = pendingTask;
    
    if (task.type === 'cultivation') {
        currentUser.cultivation += task.reward;
    } else {
        currentUser.merit += task.reward;
    }
    
    task.completed = true;
    
    addHistory('task', task.name, `获得${task.reward}${task.type === 'merit' ? '功德' : '修为'}`, task.type === 'merit' ? '❤️' : '📚');
    
    checkAchievements();
    updateFateCard();
    saveData();
    updateUI();
    
    showNotification(`完成任务！获得 +${task.reward}${task.type === 'merit' ? '功德' : '修为'}`);
    closeModal();
    
    if (task.repeat !== 'none') {
        const newTask = { ...task, id: 't' + Date.now(), completed: false };
        currentUser.tasks.push(newTask);
        saveData();
    }
}

function confirmTrial() {
    if (!pendingTask) return;
    
    const trial = pendingTask;
    const success = Math.random() > 0.3;
    
    if (success) {
        currentUser.cultivation += trial.reward;
        currentUser.merit += trial.reward;
        addHistory('achievement', '渡劫成功', `获得${trial.reward * 2}修为功德`, '⚡');
        showNotification(`🎉 渡劫成功！获得 +${trial.reward * 2}修为功德`);
    } else {
        addHistory('task', '渡劫失败', '再接再厉', '💫');
        showNotification('😔 渡劫失败，再接再厉！');
    }
    
    currentUser.trialQuests = currentUser.trialQuests.filter(t => t.id !== trial.id);
    checkAchievements();
    updateFateCard();
    saveData();
    updateUI();
    closeModal();
}

function handleTaskCheck(e, taskId) {
    e.stopPropagation();
    if (e.target.checked) {
        showCompleteModal(taskId);
        e.target.checked = false;
    }
}

function completeStage(questId, stageIndex) {
    const quest = currentUser.mainQuests.find(q => q.id === questId);
    if (!quest || quest.completedStages.includes(stageIndex)) return;
    
    quest.completedStages.push(stageIndex);
    addHistory('achievement', quest.name, `完成阶段: ${quest.stages[stageIndex]}`, '🎯');
    currentUser.cultivation += 20;
    
    checkAchievements();
    updateFateCard();
    saveData();
    updateUI();
    
    showNotification(`完成阶段「${quest.stages[stageIndex]}」！获得 +20修为`);
}

function checkAchievements() {
    const totalTasks = currentUser.tasks.filter(t => t.completed).length;
    const totalMerit = currentUser.merit;
    const totalCultivation = currentUser.cultivation;
    
    if (totalTasks === 1 && !currentUser.achievements.includes('first_task')) {
        addAchievement('first_task', '初入修行', '完成第一个任务', '🌟');
    }
    if (totalTasks >= 10 && !currentUser.achievements.includes('ten_tasks')) {
        addAchievement('ten_tasks', '勤修苦练', '完成10个任务', '💪');
    }
    if (totalMerit >= 100 && !currentUser.achievements.includes('hundred_merit')) {
        addAchievement('hundred_merit', '功德圆满', '累计100功德', '❤️');
    }
    if (totalCultivation >= 200 && !currentUser.achievements.includes('two_hundred_cultivation')) {
        addAchievement('two_hundred_cultivation', '脱胎换骨', '累计200修为', '✨');
    }
}

function addAchievement(id, title, desc, icon) {
    currentUser.achievements.push(id);
    addHistory('achievement', title, desc, icon);
    showNotification(`🏆 获得成就: ${title}`);
}

function addHistory(type, title, desc, icon) {
    currentUser.history.unshift({
        id: 'h' + Date.now(),
        type: type,
        title: title,
        desc: desc,
        icon: icon,
        date: getToday()
    });
    if (currentUser.history.length > 50) {
        currentUser.history.pop();
    }
}

function showWelcomeModal() {
    document.getElementById('modalTitle').textContent = '欢迎来到功德簿';
    document.getElementById('confirmMessage').textContent = '开始你的修行之旅吧！设定第一个主线目标。';
    document.getElementById('confirmIcon').textContent = '📜';
    document.getElementById('rewardPreview').innerHTML = '<p>人生如修行，每一步都算数</p>';
    document.getElementById('confirmBtn').onclick = () => {
        closeModal();
        switchTab('create');
    };
    document.getElementById('modalOverlay').style.display = 'flex';
}

function showCreateModal() {
    switchTab('create');
}

function createMainQuest() {
    const name = prompt('输入主线目标名称：');
    if (!name) return;
    
    const quest = {
        id: 'mq' + Date.now(),
        name: name,
        desc: '人生重要目标',
        stages: ['起步阶段', '成长阶段', '突破阶段', '圆满阶段'],
        completedStages: [],
        createdAt: getToday()
    };
    
    currentUser.mainQuests.push(quest);
    saveData();
    updateUI();
    showNotification('主线目标创建成功！');
}

function createTrialQuest() {
    const name = prompt('输入历劫挑战名称：');
    if (!name) return;
    
    const trial = {
        id: 'tr' + Date.now(),
        name: name,
        desc: '高难度挑战任务',
        difficulty: 5,
        reward: 50,
        deadline: getDateDaysLater(7),
        createdAt: getToday()
    };
    
    currentUser.trialQuests.push(trial);
    saveData();
    updateUI();
    showNotification('历劫挑战创建成功！');
}

function startService(btn) {
    const serviceData = JSON.parse(btn.parentElement.dataset.service);
    
    document.getElementById('modalTitle').textContent = '参与公益服务';
    document.getElementById('confirmMessage').textContent = `确认参与「${serviceData.name}」？`;
    document.getElementById('confirmIcon').textContent = '❤️';
    document.getElementById('rewardPreview').innerHTML = `<p>完成后获得: +${serviceData.reward}功德值</p>`;
    document.getElementById('confirmBtn').onclick = () => {
        completeService(serviceData);
    };
    document.getElementById('modalOverlay').style.display = 'flex';
}

function completeService(service) {
    currentUser.merit += service.reward;
    
    currentUser.meritArchive.unshift({
        id: 'ma' + Date.now(),
        name: service.name,
        desc: service.desc,
        reward: service.reward,
        date: getToday(),
        icon: '❤️'
    });
    
    addHistory('task', service.name, `获得${service.reward}功德`, '❤️');
    checkAchievements();
    updateFateCard();
    saveData();
    updateUI();
    
    showNotification(`参与公益！获得 +${service.reward}功德`);
    closeModal();
}

function filterServices(category) {
    document.querySelectorAll('.hall-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    const services = {
        volunteer: [
            { id: '1', name: '社区助老帮扶', desc: '陪伴社区老人聊天、帮助日常事务', reward: 20, type: 'volunteer', icon: '👴' },
            { id: '2', name: '校园支教', desc: '为贫困地区学生提供课外辅导', reward: 30, type: 'volunteer', icon: '📚' },
            { id: '3', name: '无偿献血', desc: '参与无偿献血活动', reward: 25, type: 'volunteer', icon: '🩸' }
        ],
        donation: [
            { id: '4', name: '爱心捐款', desc: '向慈善机构捐款', reward: 50, type: 'donation', icon: '💰' },
            { id: '5', name: '物资捐赠', desc: '捐赠衣物、书籍等物资', reward: 35, type: 'donation', icon: '📦' }
        ],
        community: [
            { id: '6', name: '社区清洁', desc: '参与社区环境卫生清理', reward: 15, type: 'community', icon: '🧹' },
            { id: '7', name: '邻里互助', desc: '帮助邻居解决生活困难', reward: 20, type: 'community', icon: '🤝' }
        ],
        environment: [
            { id: '8', name: '植树造林', desc: '参与植树活动', reward: 25, type: 'environment', icon: '🌳' },
            { id: '9', name: '垃圾分类', desc: '参与垃圾分类宣传', reward: 15, type: 'environment', icon: '♻️' },
            { id: '10', name: '节能减排', desc: '践行低碳生活方式', reward: 20, type: 'environment', icon: '💡' }
        ]
    };
    
    const html = services[category].map(s => `
        <div class="service-card" data-service='${JSON.stringify(s)}'>
            <div class="service-icon">${s.icon}</div>
            <div class="service-info">
                <h4>${s.name}</h4>
                <p>${s.desc}</p>
            </div>
            <div class="service-reward">+${s.reward} 功德</div>
            <button class="service-btn" onclick="startService(this)">参与</button>
        </div>
    `).join('');
    
    document.getElementById('hallContent').innerHTML = `<div class="service-list">${html}</div>`;
}

function updateReplay() {
    const stats = calculateStats(currentPeriod);
    
    document.getElementById('statCultivation').textContent = stats.cultivation;
    document.getElementById('statMerit').textContent = stats.merit;
    document.getElementById('statComplete').textContent = `${stats.completionRate}%`;
    document.getElementById('statTotal').textContent = stats.totalTasks;
    
    updateTypeDistribution(stats.typeDist);
    updateGrowthChart(stats.growthData);
    updateFateComment(stats);
}

function calculateStats(period) {
    const now = new Date();
    let startDate;
    
    switch (period) {
        case 'week':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
        case 'year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
    }
    
    const completedTasks = currentUser.tasks.filter(t => {
        if (!t.completed) return false;
        return new Date(t.createdAt) >= startDate;
    });
    
    const cultivation = completedTasks.filter(t => t.type === 'cultivation').reduce((sum, t) => sum + t.reward, 0);
    const merit = completedTasks.filter(t => t.type === 'merit').reduce((sum, t) => sum + t.reward, 0);
    const totalTasks = currentUser.tasks.filter(t => new Date(t.createdAt) >= startDate).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
    
    const typeDist = {
        cultivation: completedTasks.filter(t => t.type === 'cultivation').length,
        merit: completedTasks.filter(t => t.type === 'merit').length,
        trial: currentUser.trialQuests.filter(t => new Date(t.createdAt) >= startDate).length
    };
    
    const growthData = generateGrowthData(period);
    
    return { cultivation, merit, completionRate, totalTasks, typeDist, growthData };
}

function generateGrowthData(period) {
    const data = [];
    const now = new Date();
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTasks = currentUser.tasks.filter(t => 
            t.completed && t.createdAt === dateStr
        );
        
        data.push({
            date: `${date.getMonth() + 1}/${date.getDate()}`,
            value: dayTasks.reduce((sum, t) => sum + t.reward, 0)
        });
    }
    
    return data;
}

function updateTypeDistribution(dist) {
    const total = dist.cultivation + dist.merit + dist.trial;
    const max = Math.max(total, 1);
    
    const html = [
        { label: '修为', value: dist.cultivation, color: '#D4AF37' },
        { label: '功德', value: dist.merit, color: '#8B0000' },
        { label: '历劫', value: dist.trial, color: '#4A90D9' }
    ].map(item => `
        <div class="dist-bar">
            <div class="dist-label">${item.label}</div>
            <div class="dist-bar-inner">
                <div class="dist-fill" style="height: ${(item.value / max) * 100}%; background: ${item.color}"></div>
            </div>
            <div class="dist-value">${item.value}</div>
        </div>
    `).join('');
    
    document.getElementById('typeDistribution').innerHTML = html;
}

function updateGrowthChart(data) {
    const canvas = document.getElementById('growthCanvas');
    const ctx = canvas.getContext('2d');
    
    const width = canvas.width || 600;
    const height = canvas.height || 180;
    
    ctx.clearRect(0, 0, width, height);
    
    if (data.length === 0) return;
    
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        
        ctx.fillStyle = '#A0A0A0';
        ctx.font = '10px Noto Sans SC';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxValue - (maxValue / 4) * i), padding.left - 10, y + 4);
    }
    
    ctx.fillStyle = '#A0A0A0';
    ctx.font = '10px Noto Sans SC';
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
        const x = padding.left + (chartWidth / (data.length - 1)) * i;
        if (i % Math.ceil(data.length / 7) === 0) {
            ctx.fillText(d.date, x, height - 10);
        }
    });
    
    ctx.beginPath();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    data.forEach((d, i) => {
        const x = padding.left + (chartWidth / (data.length - 1)) * i;
        const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    data.forEach((d, i) => {
        const x = padding.left + (chartWidth / (data.length - 1)) * i;
        const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.fillStyle = '#D4AF37';
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateFateComment(stats) {
    let comment = '';
    let advice = '';
    
    if (stats.completionRate >= 80) {
        comment = '修行精进，功德圆满！此周期你勤奋刻苦，诸事顺遂，命格稳步提升。';
        advice = '建议继续保持精进，可尝试更高难度的历劫挑战，突破当前境界。';
    } else if (stats.completionRate >= 50) {
        comment = '修行尚可，仍需努力。此周期有得有失，需更加专注方能更进一步。';
        advice = '建议制定更明确的每日计划，保持规律作息，持之以恒必有所成。';
    } else {
        comment = '修行懈怠，需加勉励。此周期任务完成率较低，当自省反思。';
        advice = '建议从简单任务开始，逐步建立信心，积少成多，厚积薄发。';
    }
    
    if (stats.merit >= stats.cultivation) {
        comment += ' 尤为值得称道的是你的功德积累，善心可嘉！';
    }
    
    document.getElementById('fateComment').innerHTML = `
        <p class="comment-text">${comment}</p>
        <p class="comment-advice">${advice}</p>
    `;
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function exportData() {
    const dataStr = JSON.stringify(currentUser, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `功德簿数据_${getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('数据导出成功！');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                currentUser = { ...currentUser, ...imported };
                saveData();
                updateUI();
                showNotification('数据导入成功！');
            } catch (err) {
                showNotification('数据格式错误！');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function getDateDaysLater(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function isThisWeek(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    return date >= startOfWeek;
}

function isThisMonth(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

document.addEventListener('DOMContentLoaded', initApp);