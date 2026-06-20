/**
 * 专注力训练器 - 核心应用逻辑（多用户版）
 * 功能模块：用户管理、计时训练、舒尔特方格、任务管理、数据分析
 */

// ==================== 数据存储 ====================
const Storage = {
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// ==================== 用户管理系统 ====================
const UserManager = {
    users: Storage.get('focus_users', []),
    currentUserId: Storage.get('focus_current_user', null),

    // 获取当前用户对象
    getCurrentUser() {
        return this.users.find(u => u.id === this.currentUserId) || null;
    },

    // 获取当前用户的年龄组（用于舒尔特评级）
    getCurrentAgeGroup() {
        const user = this.getCurrentUser();
        if (!user) return '11-12';
        const age = user.age;
        if (age === 'adult') return 'adult';
        const a = parseInt(age);
        if (a <= 8) return '7-8';
        if (a <= 10) return '9-10';
        if (a <= 12) return '11-12';
        return 'adult';
    },

    // 获取当前用户年龄显示文本
    getCurrentAgeLabel() {
        const user = this.getCurrentUser();
        if (!user) return '';
        return user.age === 'adult' ? '18岁以上' : `${user.age}岁`;
    },

    // 获取当前用户性别显示文本
    getCurrentGenderLabel() {
        const user = this.getCurrentUser();
        if (!user) return '';
        return user.gender === 'male' ? '男' : '女';
    },

    save() {
        Storage.set('focus_users', this.users);
        Storage.set('focus_current_user', this.currentUserId);
    },

    // 添加用户
    addUser(name, age, gender) {
        const user = {
            id: Date.now().toString(),
            name: name.trim(),
            age,
            gender,
            createdAt: new Date().toISOString()
        };
        this.users.push(user);
        this.currentUserId = user.id;
        this.save();
        return user;
    },

    // 编辑用户
    editUser(id, name, age, gender) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            user.name = name.trim();
            user.age = age;
            user.gender = gender;
            this.save();
        }
    },

    // 删除用户及其所有数据
    deleteUser(id) {
        // 删除用户数据
        Storage.remove(`focus_tasks_${id}`);
        Storage.remove(`focus_daily_${id}`);
        Storage.remove(`focus_schulte_${id}`);
        Storage.remove(`focus_streak_${id}`);
        Storage.remove(`focus_last_date_${id}`);
        // 删除用户
        this.users = this.users.filter(u => u.id !== id);
        if (this.currentUserId === id) {
            this.currentUserId = this.users.length > 0 ? this.users[0].id : null;
        }
        this.save();
    },

    // 切换用户
    switchUser(id) {
        this.currentUserId = id;
        this.save();
    },

    // 初始化：如果没有用户，创建默认用户
    ensureDefaultUser() {
        if (this.users.length === 0) {
            this.addUser('小明', '10', 'male');
        }
        if (!this.currentUserId) {
            this.currentUserId = this.users[0].id;
            this.save();
        }
    }
};

// ==================== 按用户隔离的应用数据 ====================
function getUserData(key, defaultValue = null) {
    const uid = UserManager.currentUserId;
    if (!uid) return defaultValue;
    return Storage.get(`focus_${key}_${uid}`, defaultValue);
}

function setUserData(key, value) {
    const uid = UserManager.currentUserId;
    if (!uid) return;
    Storage.set(`focus_${key}_${uid}`, value);
}

const AppState = {
    get tasks() { return getUserData('tasks', []); },
    set tasks(v) { setUserData('tasks', v); },
    get dailyFocus() { return getUserData('daily', {}); },
    set dailyFocus(v) { setUserData('daily', v); },
    get schulteRecords() { return getUserData('schulte', []); },
    set schulteRecords(v) { setUserData('schulte', v); },
    get streak() { return getUserData('streak', 0); },
    set streak(v) { setUserData('streak', v); },
    get lastFocusDate() { return getUserData('last_date', ''); },
    set lastFocusDate(v) { setUserData('last_date', v); },

    save() {
        // 各字段通过 setter 已自动保存
    }
};

// ==================== 分类配置 ====================
const Categories = {
    study: { name: '学习', color: '#534AB7', bg: '#EEEDFE' },
    reading: { name: '阅读', color: '#185FA5', bg: '#E6F1FB' },
    art: { name: '艺术', color: '#993556', bg: '#FBEAF0' },
    sport: { name: '运动', color: '#639922', bg: '#EAF3DE' },
    life: { name: '生活', color: '#BA7517', bg: '#FAEEDA' },
    other: { name: '其他', color: '#888780', bg: '#F1EFE8' }
};

// ==================== 舒尔特方格评价标准 ====================
const SchulteStandards = {
    '3': {
        '7-8':   { excellent: 12, good: 20, average: 30 },
        '9-10':  { excellent: 10, good: 16, average: 24 },
        '11-12': { excellent: 8,  good: 13, average: 20 },
        'adult': { excellent: 6,  good: 10, average: 16 }
    },
    '4': {
        '7-8':   { excellent: 25, good: 40, average: 60 },
        '9-10':  { excellent: 20, good: 32, average: 48 },
        '11-12': { excellent: 16, good: 26, average: 40 },
        'adult': { excellent: 13, good: 22, average: 34 }
    },
    '5': {
        '7-8':   { excellent: 40, good: 60, average: 90 },
        '9-10':  { excellent: 35, good: 50, average: 70 },
        '11-12': { excellent: 30, good: 45, average: 60 },
        'adult': { excellent: 25, good: 35, average: 50 }
    },
    '6': {
        '7-8':   { excellent: 65, good: 95, average: 140 },
        '9-10':  { excellent: 55, good: 80, average: 115 },
        '11-12': { excellent: 48, good: 70, average: 100 },
        'adult': { excellent: 40, good: 58, average: 82 }
    }
};

function getSchulteRating(size, time, ageGroup) {
    const std = SchulteStandards[size] && SchulteStandards[size][ageGroup];
    if (!std) return { label: '再接再厉', emoji: '💪', color: '#BA7517' };
    if (time < std.excellent) return { label: '优秀', emoji: '🌟', color: '#0F6E56' };
    if (time < std.good)      return { label: '良好', emoji: '👍', color: '#185FA5' };
    if (time < std.average)   return { label: '合格', emoji: '😊', color: '#BA7517' };
    return { label: '再接再厉', emoji: '💪', color: '#E24B4A' };
}

function renderStandardsTable() {
    const table = document.getElementById('standardsTable');
    if (!table) return;
    const sizes = ['3', '4', '5', '6'];
    const ages = ['7-8', '9-10', '11-12', 'adult'];
    const ageLabels = { '7-8': '7-8岁', '9-10': '9-10岁', '11-12': '11-12岁', 'adult': '成人' };
    const sizeLabels = { '3': '3×3', '4': '4×4', '5': '5×5', '6': '6×6' };

    let html = '<tr><th>年龄段</th>';
    sizes.forEach(s => { html += `<th colspan="3">${sizeLabels[s]}</th>`; });
    html += '</tr><tr><th></th>';
    sizes.forEach(() => { html += '<th>优秀</th><th>良好</th><th>合格</th>'; });
    html += '</tr>';

    ages.forEach(age => {
        html += `<tr><td><strong>${ageLabels[age]}</strong></td>`;
        sizes.forEach(size => {
            const std = SchulteStandards[size][age];
            html += `<td>&lt;${std.excellent}s</td><td>&lt;${std.good}s</td><td>&lt;${std.average}s</td>`;
        });
        html += '</tr>';
    });
    table.innerHTML = html;
}

// ==================== 工具函数 ====================
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getToday() {
    return formatDate(new Date());
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(formatDate(d));
    }
    return days;
}

// ==================== 声音提醒 ====================
function playCompletionSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            const startTime = ctx.currentTime + i * 0.3;
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
        const finalOsc = ctx.createOscillator();
        const finalGain = ctx.createGain();
        finalOsc.connect(finalGain);
        finalGain.connect(ctx.destination);
        finalOsc.type = 'sine';
        finalOsc.frequency.value = 1046.5;
        const finalStart = ctx.currentTime + 0.9;
        finalGain.gain.setValueAtTime(0.35, finalStart);
        finalGain.gain.exponentialRampToValueAtTime(0.01, finalStart + 1.0);
        finalOsc.start(finalStart);
        finalOsc.stop(finalStart + 1.0);
    } catch (e) {}
}

// ==================== 用户管理 UI ====================
function initUserBar() {
    const selector = document.getElementById('userSelector');
    const addBtn = document.getElementById('addUserBtn');
    const editBtn = document.getElementById('editUserBtn');
    const delBtn = document.getElementById('delUserBtn');

    // 渲染用户选择器
    function renderSelector() {
        selector.innerHTML = UserManager.users.map(u =>
            `<option value="${u.id}" ${u.id === UserManager.currentUserId ? 'selected' : ''}>${u.name}</option>`
        ).join('');
        updateUserTag();
    }

    // 更新用户信息标签
    function updateUserTag() {
        const user = UserManager.getCurrentUser();
        const tag = document.getElementById('userInfoTag');
        if (user) {
            const ageLabel = user.age === 'adult' ? '18岁以上' : `${user.age}岁`;
            const genderLabel = user.gender === 'male' ? '男' : '女';
            tag.textContent = `${ageLabel} · ${genderLabel}`;
        } else {
            tag.textContent = '';
        }
    }

    // 更新舒尔特年龄显示
    function updateSchulteAgeDisplay() {
        const el = document.getElementById('schulteAgeDisplay');
        if (el) {
            const user = UserManager.getCurrentUser();
            if (user) {
                const ageLabel = user.age === 'adult' ? '18岁以上' : `${user.age}岁`;
                el.innerHTML = `评价标准基于 <span class="hl-blue">${user.name}</span> 的年龄（<span class="hl">${ageLabel}</span>）自动匹配`;
            }
        }
    }

    // 切换用户
    selector.addEventListener('change', () => {
        UserManager.switchUser(selector.value);
        onUserSwitched();
    });

    // 添加用户
    addBtn.addEventListener('click', () => openUserModal('add'));

    // 编辑用户
    editBtn.addEventListener('click', () => openUserModal('edit'));

    // 删除用户
    delBtn.addEventListener('click', () => {
        if (UserManager.users.length <= 1) {
            showToast('至少需要保留一个用户', 'error');
            return;
        }
        const user = UserManager.getCurrentUser();
        if (confirm(`确定要删除用户「${user.name}」吗？该用户的所有数据将被清除。`)) {
            UserManager.deleteUser(user.id);
            renderSelector();
            onUserSwitched();
            showToast('用户已删除');
        }
    });

    // 暴露渲染方法
    window._renderUserSelector = renderSelector;
    window._updateSchulteAgeDisplay = updateSchulteAgeDisplay;
    renderSelector();
}

function openUserModal(mode) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    const nameInput = document.getElementById('userNameInput');
    const ageInput = document.getElementById('userAgeInput');
    const genderInput = document.getElementById('userGenderInput');

    if (mode === 'edit') {
        const user = UserManager.getCurrentUser();
        title.textContent = `编辑用户「${user.name}」`;
        nameInput.value = user.name;
        ageInput.value = user.age;
        genderInput.value = user.gender;
    } else {
        title.textContent = '添加新用户';
        nameInput.value = '';
        ageInput.value = '10';
        genderInput.value = 'male';
    }

    modal.classList.add('show');

    document.getElementById('userModalConfirm').onclick = () => {
        const name = nameInput.value.trim();
        if (!name) {
            showToast('请输入姓名', 'error');
            return;
        }
        if (mode === 'edit') {
            UserManager.editUser(UserManager.currentUserId, name, ageInput.value, genderInput.value);
            showToast('用户信息已更新');
        } else {
            UserManager.addUser(name, ageInput.value, genderInput.value);
            showToast(`用户「${name}」添加成功`);
        }
        modal.classList.remove('show');
        window._renderUserSelector();
        window._updateSchulteAgeDisplay();
        onUserSwitched();
    };

    document.getElementById('userModalCancel').onclick = () => modal.classList.remove('show');
}

// 切换用户后刷新所有模块
function onUserSwitched() {
    updateHeaderStats();
    TaskModule.render();
    SchulteModule.renderRecords();
    window._updateSchulteAgeDisplay();
}

// ==================== 导航切换 ====================
function initNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const section = tab.dataset.section;
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(`${section}-section`).classList.add('active');
            if (section === 'analysis') updateAnalysis();
        });
    });

    document.querySelectorAll('.sub-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const sub = tab.dataset.sub;
            document.querySelectorAll('.sub-section').forEach(s => {
                s.style.display = s.id === `${sub}-sub` ? 'block' : 'none';
            });
        });
    });
}

// ==================== 首页统计 ====================
function updateHeaderStats() {
    const today = getToday();
    const todaySeconds = AppState.dailyFocus[today] || 0;
    document.getElementById('todayFocus').textContent = Math.floor(todaySeconds / 60);
    document.getElementById('streakDays').textContent = AppState.streak;
    const completed = AppState.tasks.filter(t => t.done).length;
    document.getElementById('completedTasks').textContent = completed;
}

// ==================== 计时训练模块 ====================
const TimerModule = {
    duration: 25 * 60,
    remaining: 25 * 60,
    interval: null,
    isRunning: false,
    isPaused: false,

    init() {
        const presets = document.querySelectorAll('.timer-preset');
        presets.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isRunning) return;
                presets.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.duration = parseInt(btn.dataset.time) * 60;
                this.remaining = this.duration;
                this.updateDisplay();
            });
        });

        document.getElementById('timerStartBtn').addEventListener('click', () => this.toggle());
        document.getElementById('timerResetBtn').addEventListener('click', () => this.reset());
    },

    toggle() { this.isRunning ? this.pause() : this.start(); },

    start() {
        if (this.remaining <= 0) this.remaining = this.duration;
        this.isRunning = true;
        this.isPaused = false;
        document.getElementById('timerStartBtn').textContent = '暂停';
        document.getElementById('timerStartBtn').classList.remove('btn-primary');
        document.getElementById('timerStartBtn').classList.add('btn-accent');
        document.getElementById('timerProgress').classList.add('active');
        this.interval = setInterval(() => {
            this.remaining--;
            this.updateDisplay();
            if (this.remaining <= 0) this.complete();
        }, 1000);
    },

    pause() {
        this.isRunning = false;
        this.isPaused = true;
        clearInterval(this.interval);
        document.getElementById('timerStartBtn').textContent = '继续';
        document.getElementById('timerStartBtn').classList.remove('btn-accent');
        document.getElementById('timerStartBtn').classList.add('btn-primary');
        document.getElementById('timerProgress').classList.remove('active');
    },

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.interval);
        this.remaining = this.duration;
        document.getElementById('timerStartBtn').textContent = '开始专注';
        document.getElementById('timerStartBtn').classList.remove('btn-accent');
        document.getElementById('timerStartBtn').classList.add('btn-primary');
        document.getElementById('timerProgress').classList.remove('active');
        this.updateDisplay();
    },

    complete() {
        this.isRunning = false;
        clearInterval(this.interval);
        const focusedMinutes = Math.floor(this.duration / 60);
        const today = getToday();
        AppState.dailyFocus[today] = (AppState.dailyFocus[today] || 0) + this.duration;
        const yesterday = formatDate(new Date(Date.now() - 86400000));
        if (AppState.lastFocusDate === yesterday) {
            AppState.streak++;
        } else if (AppState.lastFocusDate !== today) {
            AppState.streak = 1;
        }
        AppState.lastFocusDate = today;
        AppState.save();
        playCompletionSound();
        this.reset();
        updateHeaderStats();
        showToast(`🎉 专注完成！记录了 ${focusedMinutes} 分钟`);
    },

    updateDisplay() {
        document.getElementById('timerDisplay').textContent = formatTime(this.remaining);
        const circumference = 2 * Math.PI * 90;
        const offset = circumference * (1 - this.remaining / this.duration);
        document.getElementById('timerProgress').style.strokeDashoffset = offset;
    }
};

// ==================== 舒尔特方格模块 ====================
const SchulteModule = {
    size: 5,
    grid: [],
    currentNum: 1,
    startTime: 0,
    timerInterval: null,
    isPlaying: false,

    init() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.size = parseInt(btn.dataset.size);
                this.reset();
            });
        });
        document.getElementById('schulteStartBtn').addEventListener('click', () => this.startNewGame());
        renderStandardsTable();
        this.renderGrid();
        this.renderRecords();
    },

    startNewGame() {
        this.size = parseInt(document.querySelector('.difficulty-btn.active').dataset.size);
        this.currentNum = 1;
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        const nums = Array.from({ length: this.size * this.size }, (_, i) => i + 1);
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        this.grid = nums;
        document.getElementById('schulteTime').textContent = '0.0秒';
        document.getElementById('schulteNext').textContent = '下一步: 1';
        document.getElementById('schulteResult').style.display = 'none';
        this.renderGrid();
    },

    renderGrid() {
        const gridEl = document.getElementById('schulteGrid');
        gridEl.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        gridEl.innerHTML = '';

        // 动态计算格子尺寸，确保在手机上不溢出
        const vw = Math.min(window.innerWidth, 900);
        const appPadding = vw <= 480 ? 40 : vw <= 768 ? 48 : 56;
        const cardPadding = vw <= 480 ? 24 : vw <= 768 ? 32 : 40;
        const gridPadding = vw <= 480 ? 20 : vw <= 768 ? 24 : 32;
        const gapCount = this.size - 1;
        const gapSize = vw <= 480 ? 5 : vw <= 768 ? 6 : 8;
        const availableWidth = vw - appPadding - cardPadding - gridPadding - gapCount * gapSize;
        const cellSize = Math.min(60, Math.max(36, Math.floor(availableWidth / this.size)));

        this.grid.forEach((num) => {
            const cell = document.createElement('div');
            cell.className = 'schulte-cell';
            cell.textContent = num;
            cell.dataset.num = num;
            cell.style.width = cellSize + 'px';
            cell.style.height = cellSize + 'px';
            cell.style.fontSize = (cellSize <= 40 ? 13 : cellSize <= 50 ? 16 : 20) + 'px';
            cell.addEventListener('click', () => this.handleClick(num, cell));
            gridEl.appendChild(cell);
        });
    },

    handleClick(num, cell) {
        if (cell.classList.contains('correct')) return;
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.startTime = Date.now();
            this.timerInterval = setInterval(() => {
                document.getElementById('schulteTime').textContent = ((Date.now() - this.startTime) / 1000).toFixed(1) + '秒';
            }, 100);
        }
        if (num === this.currentNum) {
            cell.classList.add('correct');
            this.currentNum++;
            if (this.currentNum > this.size * this.size) this.complete();
            else document.getElementById('schulteNext').textContent = `下一步: ${this.currentNum}`;
        } else {
            cell.classList.add('wrong');
            setTimeout(() => cell.classList.remove('wrong'), 300);
        }
    },

    complete() {
        clearInterval(this.timerInterval);
        const time = (Date.now() - this.startTime) / 1000;
        const timeStr = time.toFixed(1);
        const ageGroup = UserManager.getCurrentAgeGroup();
        const user = UserManager.getCurrentUser();

        const record = { date: getToday(), size: this.size, time: parseFloat(timeStr), ageGroup };
        AppState.schulteRecords = [record, ...AppState.schulteRecords].slice(0, 50);
        AppState.save();

        const rating = getSchulteRating(String(this.size), time, ageGroup);
        const ageLabel = UserManager.getCurrentAgeLabel();

        document.getElementById('schulteResultTitle').innerHTML =
            `🎉 完成！<span style="color:${rating.color}; font-size: 20px;"> ${rating.emoji} ${rating.label}</span>`;
        document.getElementById('schulteResultDetail').innerHTML = `
            <div style="font-size: 16px; margin: 8px 0;">用时: <strong>${timeStr}秒</strong></div>
            <div style="font-size: 13px; color: var(--text-secondary);">
                ${this.size}×${this.size} 方格 · ${user.name}（${ageLabel}）标准
            </div>
        `;
        document.getElementById('schulteResult').style.display = 'block';
        this.renderRecords();
        showToast(`舒尔特方格完成！评级：${rating.emoji} ${rating.label}`);
    },

    renderRecords() {
        const list = document.getElementById('schulteRecordsList');
        const records = AppState.schulteRecords.slice(0, 15);
        if (records.length === 0) {
            list.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 12px;">暂无记录</div>';
            return;
        }
        list.innerHTML = records.map(r => {
            const rating = getSchulteRating(String(r.size), r.time, r.ageGroup || '11-12');
            return `<div class="schulte-record-item">
                <span>${r.date} · ${r.size}×${r.size}</span>
                <span><strong>${r.time}秒</strong> <span style="color:${rating.color}; font-size: 12px;">${rating.emoji}${rating.label}</span></span>
            </div>`;
        }).join('');
    },

    reset() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        document.getElementById('schulteTime').textContent = '0.0秒';
        document.getElementById('schulteNext').textContent = '下一步: 1';
        document.getElementById('schulteResult').style.display = 'none';
        this.startNewGame();
    }
};

// ==================== 任务列表模块 ====================
const TaskModule = {
    filter: 'all',
    categoryFilter: '',
    timingTasks: {},

    init() {
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filter = btn.dataset.filter;
                this.render();
            });
        });
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.categoryFilter = e.target.value;
            this.render();
        });
        this.render();
        setInterval(() => this.updateTimingDisplay(), 1000);
    },

    addTask() {
        const input = document.getElementById('taskInput');
        const name = input.value.trim();
        if (!name) { showToast('请输入任务名称', 'error'); return; }
        const task = {
            id: Date.now(),
            name,
            done: false,
            category: document.getElementById('categorySelect').value,
            createdAt: new Date().toISOString(),
            timeSpent: 0,
            doneAt: null
        };
        AppState.tasks = [task, ...AppState.tasks];
        AppState.save();
        input.value = '';
        this.render();
        updateHeaderStats();
        showToast('任务添加成功');
    },

    toggleTask(id) {
        const task = AppState.tasks.find(t => t.id === id);
        if (task) {
            if (this.timingTasks[id]) this.stopTiming(id);
            task.done = !task.done;
            task.doneAt = task.done ? new Date().toISOString() : null;
            AppState.tasks = AppState.tasks;
            AppState.save();
            this.render();
            updateHeaderStats();
        }
    },

    deleteTask(id) {
        if (this.timingTasks[id]) delete this.timingTasks[id];
        AppState.tasks = AppState.tasks.filter(t => t.id !== id);
        AppState.save();
        this.render();
        updateHeaderStats();
        showToast('任务已删除');
    },

    startTiming(id) {
        if (this.timingTasks[id]) return;
        this.timingTasks[id] = Date.now();
        this.render();
        showToast('⏱️ 开始计时');
    },

    stopTiming(id) {
        if (!this.timingTasks[id]) return;
        const minutes = Math.max(1, Math.round((Date.now() - this.timingTasks[id]) / 60000));
        const task = AppState.tasks.find(t => t.id === id);
        if (task) {
            task.timeSpent += minutes;
            AppState.tasks = AppState.tasks;
            AppState.save();
        }
        delete this.timingTasks[id];
        this.render();
        updateHeaderStats();
        showToast(`⏱️ 计时结束，本次 ${minutes} 分钟`);
    },

    editTime(id) {
        const task = AppState.tasks.find(t => t.id === id);
        if (!task) return;
        const modal = document.getElementById('modal');
        const input = document.getElementById('modalInput');
        document.getElementById('modalTitle').textContent = `修正「${task.name}」的专注时长`;
        input.value = task.timeSpent;
        modal.classList.add('show');
        document.getElementById('modalConfirm').onclick = () => {
            const v = parseInt(input.value);
            if (!isNaN(v) && v >= 0) {
                task.timeSpent = v;
                AppState.tasks = AppState.tasks;
                AppState.save();
                this.render();
                updateHeaderStats();
                showToast(`时长已修正为 ${v} 分钟`);
            }
            modal.classList.remove('show');
        };
        document.getElementById('modalCancel').onclick = () => modal.classList.remove('show');
    },

    updateTimingDisplay() {
        document.querySelectorAll('.task-timing-live').forEach(el => {
            const taskId = parseInt(el.dataset.taskId);
            if (this.timingTasks[taskId]) {
                const elapsed = Math.floor((Date.now() - this.timingTasks[taskId]) / 1000);
                el.textContent = `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`;
            }
        });
    },

    getFilteredTasks() {
        let tasks = AppState.tasks;
        if (this.filter === 'active') tasks = tasks.filter(t => !t.done);
        else if (this.filter === 'completed') tasks = tasks.filter(t => t.done);
        if (this.categoryFilter) tasks = tasks.filter(t => t.category === this.categoryFilter);
        return tasks;
    },

    render() {
        const list = document.getElementById('taskList');
        const empty = document.getElementById('emptyState');
        const tasks = this.getFilteredTasks();
        if (tasks.length === 0) {
            list.style.display = 'none';
            empty.style.display = 'block';
            return;
        }
        list.style.display = 'flex';
        empty.style.display = 'none';
        list.innerHTML = tasks.map(task => {
            const cat = Categories[task.category];
            const isTiming = !!this.timingTasks[task.id];
            const isDone = task.done;
            let timingBtn = '';
            if (!isDone) {
                timingBtn = isTiming
                    ? `<button class="task-btn task-btn-wide task-btn-stop" onclick="TaskModule.stopTiming(${task.id})"><span class="task-timing-live" data-task-id="${task.id}">00:00</span> 停止</button>`
                    : `<button class="task-btn task-btn-wide task-btn-start" onclick="TaskModule.startTiming(${task.id})">▶ 开始</button>`;
            }
            let timeDisplay = task.timeSpent > 0
                ? `<span class="task-time task-time-editable" onclick="TaskModule.editTime(${task.id})" title="点击修正时长">⏱️ ${task.timeSpent}分钟 ✏️</span>` : '';
            return `<div class="task-item" style="${isTiming ? 'border-left: 3px solid var(--accent);' : ''}">
                <div class="task-checkbox ${isDone ? 'checked' : ''}" onclick="TaskModule.toggleTask(${task.id})"></div>
                <div class="task-content">
                    <div class="task-name ${isDone ? 'done' : ''}">${task.name}</div>
                    <div class="task-meta">
                        <span class="task-category" style="background: ${cat.bg}; color: ${cat.color};">${cat.name}</span>
                        ${timeDisplay}
                        ${isTiming ? '<span class="task-timing">● 计时中</span>' : ''}
                    </div>
                </div>
                <div class="task-actions">
                    ${timingBtn}
                    <button class="task-btn" onclick="TaskModule.deleteTask(${task.id})" title="删除">🗑️</button>
                </div>
            </div>`;
        }).join('');
        this.updateTimingDisplay();
    }
};

// ==================== 数据分析模块 ====================
let focusChart, categoryChart, schulteChart;

function initCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { font: { size: 11 } }, grid: { display: false } },
            y: { ticks: { font: { size: 11 } }, grid: { color: '#f0f0f0' } }
        }
    };
    focusChart = new Chart(document.getElementById('focusChart'), {
        type: 'bar',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderRadius: 6 }] },
        options: commonOptions
    });
    categoryChart = new Chart(document.getElementById('categoryChart'), {
        type: 'bar',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderRadius: 6 }] },
        options: { ...commonOptions, indexAxis: 'y', scales: { x: { ticks: { font: { size: 11 } }, grid: { color: '#f0f0f0' } }, y: { ticks: { font: { size: 11 } }, grid: { display: false } } } }
    });
    schulteChart = new Chart(document.getElementById('schulteChart'), {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: '#534AB7', backgroundColor: 'rgba(83,74,183,0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#534AB7' }] },
        options: commonOptions
    });
}

function updateAnalysis() {
    const user = UserManager.getCurrentUser();
    if (!user) return;

    // 用户头部信息
    const ageLabel = UserManager.getCurrentAgeLabel();
    const genderLabel = UserManager.getCurrentGenderLabel();
    document.getElementById('analysisUserHeader').innerHTML =
        `👤 <strong>${user.name}</strong> 的专属分析报告 · ${ageLabel} · ${genderLabel}`;

    const days = getLast7Days();
    const dayLabels = days.map(d => d.slice(5));
    const focusData = days.map(d => Math.floor((AppState.dailyFocus[d] || 0) / 60));
    const hasData = focusData.some(v => v > 0);

    focusChart.data.labels = dayLabels;
    focusChart.data.datasets[0].data = focusData;
    focusChart.data.datasets[0].backgroundColor = focusData.map(v => v > 0 ? '#534AB7' : '#E8E6E1');
    focusChart.update();

    const catTimes = {};
    AppState.tasks.forEach(t => { if (t.timeSpent > 0) catTimes[t.category] = (catTimes[t.category] || 0) + t.timeSpent; });
    const catKeys = Object.keys(Categories);
    categoryChart.data.labels = catKeys.map(k => Categories[k].name);
    categoryChart.data.datasets[0].data = catKeys.map(k => catTimes[k] || 0);
    categoryChart.data.datasets[0].backgroundColor = catKeys.map(k => Categories[k].color);
    categoryChart.update();

    const schulte5 = AppState.schulteRecords.filter(r => r.size === 5).slice(0, 8).reverse();
    schulteChart.data.labels = schulte5.map(r => r.date.slice(5));
    schulteChart.data.datasets[0].data = schulte5.map(r => r.time);
    schulteChart.update();

    const totalMinutes = focusData.reduce((a, b) => a + b, 0);
    const avgMinutes = Math.round(totalMinutes / 7);
    const best5 = AppState.schulteRecords.filter(r => r.size === 5).sort((a, b) => a.time - b.time)[0];
    const totalTasks = AppState.tasks.length;
    const completedTasks = AppState.tasks.filter(t => t.done).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    document.getElementById('totalFocusTime').textContent = totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}小时${totalMinutes % 60}分钟` : `${totalMinutes}分钟`;
    document.getElementById('avgFocusTime').textContent = `${avgMinutes}分钟`;
    document.getElementById('bestSchulte').textContent = best5 ? `${best5.time}秒` : '-';
    document.getElementById('taskCompletion').textContent = `${completionRate}%`;

    updateEvaluation(user, avgMinutes, completionRate, best5, hasData);
}

function updateEvaluation(user, avgMinutes, completionRate, best5, hasData) {
    const container = document.getElementById('evaluationContent');
    const name = user.name;
    const ageLabel = UserManager.getCurrentAgeLabel();
    const genderLabel = UserManager.getCurrentGenderLabel();
    const genderCall = user.gender === 'male' ? '他' : '她';
    const ageGroup = UserManager.getCurrentAgeGroup();
    const isChild = user.age !== 'adult' && parseInt(user.age) <= 12;

    if (!hasData && AppState.schulteRecords.length === 0 && AppState.tasks.length === 0) {
        container.innerHTML = `<div class="evaluation-item">
            <div class="evaluation-item-title">📊 数据样本较少</div>
            <div class="evaluation-item-desc">${name}还没有训练记录。随着使用时间增加，系统将根据${ageLabel}${genderCall}的年龄特点提供<span class="hl">个性化分析</span>和改进建议。</div>
        </div>`;
        return;
    }

    const issues = [];

    // 专注时长评估（个性化）
    if (avgMinutes === 0) {
        issues.push({
            title: '⚠️ 专注时长偏低',
            desc: `${name}近7天没有专注记录。建议${genderCall}每天进行至少<span class="hl-red">15分钟</span>的计时训练，逐步建立专注习惯。可以从<span class="hl">15分钟</span>开始，慢慢增加到25分钟。`
        });
    } else if (avgMinutes < 10) {
        issues.push({
            title: '💡 专注时长有待提升',
            desc: `${name}日均专注<span class="hl-red">${avgMinutes}分钟</span>，低于推荐值。建议增加到每天<span class="hl">25分钟</span>以上，可以尝试番茄工作法，每25分钟休息5分钟。`
        });
    } else if (avgMinutes >= 45) {
        issues.push({
            title: '🌟 专注时长优秀',
            desc: `${name}日均专注<span class="hl-green">${avgMinutes}分钟</span>，表现很棒！保持这个节奏，注意适当休息，避免疲劳。`
        });
    } else {
        issues.push({
            title: '📈 专注时长良好',
            desc: `${name}日均专注<span class="hl-blue">${avgMinutes}分钟</span>，处于正常范围。继续坚持，争取突破<span class="hl">45分钟</span>大关！`
        });
    }

    // 完成率评估
    if (AppState.tasks.length > 0 && completionRate < 50) {
        issues.push({
            title: '📋 任务完成率较低',
            desc: `${name}当前任务完成率仅<span class="hl-red">${completionRate}%</span>。建议将大任务拆分成小任务，每完成一个就给${genderCall}一个小奖励，提升成就感。`
        });
    } else if (AppState.tasks.length > 0 && completionRate >= 80) {
        issues.push({
            title: '✅ 任务完成率优秀',
            desc: `${name}的任务完成率达到<span class="hl-green">${completionRate}%</span>，执行力很强！`
        });
    }

    // 舒尔特评估（按年龄个性化）
    if (AppState.schulteRecords.length > 0) {
        const recent5 = AppState.schulteRecords.filter(r => r.size === 5).slice(0, 5);
        if (recent5.length >= 3) {
            const times = recent5.map(r => r.time);
            const best = Math.min(...times);
            const rating = getSchulteRating('5', best, ageGroup);
            const improving = times[0] < times[times.length - 1];
            const std = SchulteStandards['5'][ageGroup];

            if (!improving) {
                issues.push({
                    title: '🎯 舒尔特成绩待提升',
                    desc: `${name}最近5×5最佳成绩为<span class="hl">${best}秒</span>（${ageLabel}标准：优秀&lt;${std.excellent}s）。建议每天练习<span class="hl">2-3次</span>，保持规律训练。`
                });
            } else {
                issues.push({
                    title: '🚀 舒尔特进步明显',
                    desc: `${name}的舒尔特方格成绩在稳步提升！当前最佳<span class="hl-green">${best}秒</span>（${rating.emoji} ${rating.label}），继续保持每日训练！`
                });
            }
        }
    }

    // 偏科检查
    const catCounts = {};
    AppState.tasks.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
    const total = AppState.tasks.length;
    if (total > 5) {
        for (const [cat, count] of Object.entries(catCounts)) {
            if (count / total > 0.6) {
                issues.push({
                    title: '⚖️ 任务类型偏单一',
                    desc: `${name}的<span class="hl-warn">${Categories[cat].name}</span>类任务占比过高（${Math.round(count/total*100)}%）。建议增加其他类型的任务，保持全面发展。`
                });
                break;
            }
        }
    }

    // 连续习惯
    if (AppState.streak === 0 && hasData) {
        issues.push({
            title: '🔥 建立连续习惯',
            desc: `${name}的连续专注天数已中断。建议每天固定时间进行训练，连续<span class="hl">21天</span>可以建立稳定习惯。`
        });
    } else if (AppState.streak >= 7) {
        issues.push({
            title: '🔥 连续打卡很棒',
            desc: `${name}已连续专注<span class="hl-green">${AppState.streak}天</span>！习惯正在形成中，继续保持！`
        });
    }

    // 儿童特别建议
    if (isChild) {
        issues.push({
            title: '🧒 儿童训练提示',
            desc: `${name}今年${ageLabel}，正处于专注力发展的关键期。建议每次训练<span class="hl">不超过30分钟</span>，多结合<span class="hl-blue">游戏化训练</span>（如舒尔特方格），家长可以陪伴训练并给予鼓励。`
        });
    }

    if (issues.length === 0) {
        issues.push({
            title: '✨ 整体表现良好',
            desc: `${name}的专注力训练进展顺利！继续保持当前节奏，定期查看数据分析，持续优化训练计划。`
        });
    }

    container.innerHTML = issues.map(issue => `
        <div class="evaluation-item">
            <div class="evaluation-item-title">${issue.title}</div>
            <div class="evaluation-item-desc">${issue.desc}</div>
        </div>
    `).join('');
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    UserManager.ensureDefaultUser();
    initUserBar();
    initNavigation();
    updateHeaderStats();
    TimerModule.init();
    SchulteModule.init();
    TaskModule.init();
    initCharts();

    // 首次访问生成演示数据
    if (AppState.tasks.length === 0 && Object.keys(AppState.dailyFocus).length === 0) {
        generateDemoData();
    }
});

function generateDemoData() {
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (i > 0) AppState.dailyFocus[formatDate(d)] = [900, 1200, 1500, 600, 1800, 2100][6 - i] || 1200;
    }
    const demoTasks = [
        { name: '完成数学作业', category: 'study', done: true, timeSpent: 25 },
        { name: '阅读绘本20分钟', category: 'reading', done: true, timeSpent: 20 },
        { name: '练习钢琴', category: 'art', done: false, timeSpent: 0 },
        { name: '跳绳100下', category: 'sport', done: true, timeSpent: 15 },
        { name: '整理书包', category: 'life', done: false, timeSpent: 0 },
        { name: '背诵古诗', category: 'study', done: true, timeSpent: 10 }
    ];
    demoTasks.forEach((t, i) => {
        AppState.tasks.push({
            id: Date.now() + i, name: t.name, done: t.done, category: t.category,
            createdAt: new Date(Date.now() - i * 86400000).toISOString(),
            timeSpent: t.timeSpent, doneAt: t.done ? new Date(Date.now() - i * 86400000).toISOString() : null
        });
    });
    for (let i = 0; i < 8; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i * 2);
        AppState.schulteRecords.push({
            date: formatDate(d), size: 5,
            time: parseFloat((35 + Math.random() * 20 - i * 1.5).toFixed(1)),
            ageGroup: UserManager.getCurrentAgeGroup()
        });
    }
    AppState.streak = 3;
    AppState.lastFocusDate = formatDate(new Date(today.getTime() - 86400000));
    AppState.save();
    updateHeaderStats();
}
