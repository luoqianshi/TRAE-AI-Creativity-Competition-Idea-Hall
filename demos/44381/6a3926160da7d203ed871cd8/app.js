/**
 * 老师的多啦A梦 - 课堂管理小工具
 * 核心功能：点名、抽奖、积分、宠物养成、互动游戏、体感互动
 */

// ==================== 数据存储 ====================
const Storage = {
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// 初始化数据
let classes = Storage.get('classes') || [];
let prizes = Storage.get('prizes') || [];
let studentPoints = Storage.get('studentPoints') || {};
let pets = Storage.get('pets') || [];
let currentClass = null;
let rollCallInterval = null;

// ==================== 导航 ====================
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
});

// ==================== 班级管理与点名 ====================
function addClass() {
    const name = document.getElementById('className').value.trim();
    const listText = document.getElementById('studentList').value.trim();

    if (!name || !listText) {
        alert('请输入班级名称和学生名单！');
        return;
    }

    const students = listText.split(/[,，]/).map(s => s.trim()).filter(s => s);
    const newClass = {
        id: Date.now(),
        name,
        students,
        createdAt: new Date().toLocaleDateString()
    };

    classes.push(newClass);
    Storage.set('classes', classes);

    // 初始化学生积分
    students.forEach(student => {
        const key = `${name}_${student}`;
        if (!studentPoints[key]) {
            studentPoints[key] = {
                name: student,
                class: name,
                points: 0,
                history: []
            };
        }
    });
    Storage.set('studentPoints', studentPoints);

    document.getElementById('className').value = '';
    document.getElementById('studentList').value = '';
    renderClassList();
    updateClassSelects();
    alert(`班级「${name}」添加成功！共 ${students.length} 名学生`);
}

function renderClassList() {
    const container = document.getElementById('classList');
    if (classes.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">暂无班级，请先添加</p>';
        return;
    }

    container.innerHTML = classes.map(cls => `
        <div class="class-item ${currentClass?.id === cls.id ? 'active' : ''}" onclick="selectClass(${cls.id})">
            <div class="class-item-info">
                <h4>${cls.name}</h4>
                <p>${cls.students.length} 名学生</p>
            </div>
            <div class="class-item-actions">
                <button onclick="event.stopPropagation();deleteClass(${cls.id})">删除</button>
            </div>
        </div>
    `).join('');
}

function selectClass(id) {
    currentClass = classes.find(c => c.id === id);
    renderClassList();
    document.getElementById('selectedClass').innerHTML = `
        <h4>当前班级：${currentClass.name}</h4>
        <p>${currentClass.students.length} 名学生</p>
    `;
}

function deleteClass(id) {
    if (!confirm('确定要删除这个班级吗？')) return;
    classes = classes.filter(c => c.id !== id);
    if (currentClass?.id === id) currentClass = null;
    Storage.set('classes', classes);
    renderClassList();
    updateClassSelects();
}

// 点名功能
function startRollCall() {
    if (!currentClass) {
        alert('请先选择一个班级！');
        return;
    }
    if (rollCallInterval) return;

    const resultEl = document.querySelector('.result-name');
    rollCallInterval = setInterval(() => {
        const random = currentClass.students[Math.floor(Math.random() * currentClass.students.length)];
        resultEl.textContent = random;
    }, 80);
}

function stopRollCall() {
    if (!rollCallInterval) return;
    clearInterval(rollCallInterval);
    rollCallInterval = null;

    const resultEl = document.querySelector('.result-name');
    const selected = resultEl.textContent;

    // 添加到历史记录
    const history = document.getElementById('rollcallHistory');
    const item = document.createElement('span');
    item.className = 'history-item';
    item.textContent = selected;
    history.appendChild(item);
}

// ==================== 抽奖功能 ====================
function addPrize() {
    const name = document.getElementById('prizeName').value.trim();
    const count = parseInt(document.getElementById('prizeCount').value) || 1;

    if (!name) {
        alert('请输入奖品名称！');
        return;
    }

    prizes.push({ id: Date.now(), name, count, remaining: count });
    Storage.set('prizes', prizes);

    document.getElementById('prizeName').value = '';
    document.getElementById('prizeCount').value = '1';
    renderPrizeList();
}

function renderPrizeList() {
    const container = document.getElementById('prizeList');
    if (prizes.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">暂无奖品，请先添加</p>';
        return;
    }

    container.innerHTML = prizes.map(p => `
        <div class="prize-item">
            <span>${p.name} (剩余 ${p.remaining}/${p.count})</span>
            <button onclick="deletePrize(${p.id})">删除</button>
        </div>
    `).join('');
}

function deletePrize(id) {
    prizes = prizes.filter(p => p.id !== id);
    Storage.set('prizes', prizes);
    renderPrizeList();
}

function startLottery() {
    const available = prizes.filter(p => p.remaining > 0);
    if (available.length === 0) {
        alert('没有可抽取的奖品了！');
        return;
    }

    const wheel = document.getElementById('lotteryWheel');
    const resultEl = document.getElementById('lotteryResult');

    wheel.classList.add('spinning');
    resultEl.textContent = '抽奖中...';

    setTimeout(() => {
        wheel.classList.remove('spinning');
        const winner = available[Math.floor(Math.random() * available.length)];
        winner.remaining--;
        Storage.set('prizes', prizes);
        renderPrizeList();

        resultEl.innerHTML = `🎉 恭喜获得：<strong>${winner.name}</strong>！`;
    }, 3000);
}

// ==================== 积分系统 ====================
function updateClassSelects() {
    const selects = ['pointsClassSelect', 'rankClassSelect'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        const currentVal = select.value;
        select.innerHTML = '<option value="">选择班级</option>' +
            classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        select.value = currentVal;
    });
}

function loadClassStudents() {
    const className = document.getElementById('pointsClassSelect').value;
    const select = document.getElementById('pointsStudentSelect');

    if (!className) {
        select.innerHTML = '<option value="">选择学生</option>';
        return;
    }

    const cls = classes.find(c => c.name === className);
    if (cls) {
        select.innerHTML = '<option value="">选择学生</option>' +
            cls.students.map(s => `<option value="${s}">${s}</option>`).join('');
    }
}

function addPoints() {
    const className = document.getElementById('pointsClassSelect').value;
    const student = document.getElementById('pointsStudentSelect').value;
    const value = parseInt(document.getElementById('pointsValue').value) || 0;
    const reason = document.getElementById('pointsReason').value.trim() || '加分';

    if (!className || !student || value <= 0) {
        alert('请完整填写信息！');
        return;
    }

    const key = `${className}_${student}`;
    if (!studentPoints[key]) {
        studentPoints[key] = { name: student, class: className, points: 0, history: [] };
    }

    studentPoints[key].points += value;
    studentPoints[key].history.push({ type: 'add', value, reason, time: new Date().toLocaleString() });
    Storage.set('studentPoints', studentPoints);

    alert(`已为 ${student} 增加 ${value} 分！\n当前积分：${studentPoints[key].points}`);
    updateLeaderboard();
}

function subtractPoints() {
    const className = document.getElementById('pointsClassSelect').value;
    const student = document.getElementById('pointsStudentSelect').value;
    const value = parseInt(document.getElementById('pointsValue').value) || 0;
    const reason = document.getElementById('pointsReason').value.trim() || '减分';

    if (!className || !student || value <= 0) {
        alert('请完整填写信息！');
        return;
    }

    const key = `${className}_${student}`;
    if (!studentPoints[key]) {
        studentPoints[key] = { name: student, class: className, points: 0, history: [] };
    }

    studentPoints[key].points = Math.max(0, studentPoints[key].points - value);
    studentPoints[key].history.push({ type: 'sub', value, reason, time: new Date().toLocaleString() });
    Storage.set('studentPoints', studentPoints);

    alert(`已为 ${student} 扣除 ${value} 分！\n当前积分：${studentPoints[key].points}`);
    updateLeaderboard();
}

function getRankMedal(points) {
    if (points >= 800) return { icon: '👑', name: '传奇学员', class: 'legendary' };
    if (points >= 501) return { icon: '💎', name: '钻石学员', class: 'platinum' };
    if (points >= 301) return { icon: '🥇', name: '黄金学员', class: 'gold' };
    if (points >= 101) return { icon: '🥈', name: '白银学员', class: 'silver' };
    return { icon: '🥉', name: '青铜学员', class: 'bronze' };
}

function updateLeaderboard() {
    const className = document.getElementById('rankClassSelect').value;
    const container = document.getElementById('rankList');

    if (!className) {
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">请选择班级查看排行</p>';
        return;
    }

    const students = Object.values(studentPoints)
        .filter(s => s.class === className)
        .sort((a, b) => b.points - a.points);

    if (students.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">该班级暂无积分记录</p>';
        return;
    }

    container.innerHTML = students.map((s, index) => {
        const medal = getRankMedal(s.points);
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'normal';
        return `
            <div class="rank-item">
                <div class="rank-number ${rankClass}">${index + 1}</div>
                <div class="rank-info">
                    <h4>${s.name} ${medal.icon}</h4>
                    <p>${medal.name}</p>
                </div>
                <div class="rank-points">${s.points} 分</div>
            </div>
        `;
    }).join('');
}

// ==================== 灵宠养成系统（重构版）====================
// 灵宠基础类型配置
const PET_SPECIES = [
    { baseEmoji: '🔥', type: '火系', namePrefix: '焰', desc: '热情似火的灵宠', color: '#ef4444' },
    { baseEmoji: '💧', type: '水系', namePrefix: '澜', desc: '沉稳智慧的灵宠', color: '#3b82f6' },
    { baseEmoji: '🌪️', type: '风系', namePrefix: '风', desc: '自由翱翔的灵宠', color: '#22d3ee' },
    { baseEmoji: '🪨', type: '土系', namePrefix: '岩', desc: '憨厚可爱的灵宠', color: '#a16207' },
    { baseEmoji: '✨', type: '幻系', namePrefix: '幻', desc: '神秘莫测的灵宠', color: '#a855f7' },
    { baseEmoji: '⚡', type: '雷系', namePrefix: '雷', desc: '威风凛凛的灵宠', color: '#f59e0b' },
    { baseEmoji: '☀️', type: '光系', namePrefix: '光', desc: '纯洁善良的灵宠', color: '#fbbf24' },
    { baseEmoji: '🌑', type: '暗系', namePrefix: '影', desc: '忠诚勇敢的灵宠', color: '#6366f1' }
];

// 等级阶段配置
const PET_STAGES = [
    { minLevel: 1,  maxLevel: 5,  stage: '幼体',  emoji: '🐣', suffix: '宝宝' },
    { minLevel: 6,  maxLevel: 15, stage: '成长',  emoji: '🦊', suffix: '少年' },
    { minLevel: 16, maxLevel: 29, stage: '成熟',  emoji: '🐺', suffix: '战士' },
    { minLevel: 30, maxLevel: 99, stage: '完全体', emoji: '🐉', suffix: '王者' }
];

// 获取灵宠当前阶段信息
function getPetStage(level) {
    for (const stage of PET_STAGES) {
        if (level >= stage.minLevel && level <= stage.maxLevel) {
            return stage;
        }
    }
    return PET_STAGES[0];
}

// 获取灵宠显示名称
function getPetDisplayName(pet) {
    const stage = getPetStage(pet.level);
    return `${pet.namePrefix}${stage.suffix}`;
}

// 获取灵宠显示emoji
function getPetDisplayEmoji(pet) {
    const stage = getPetStage(pet.level);
    return stage.emoji;
}

// 获取升级所需经验
function getExpForLevel(level) {
    return level * 100;
}

// 加载灵宠页面的班级学生选择
function loadPetClassStudents() {
    const className = document.getElementById('petClassSelect').value;
    const select = document.getElementById('petStudentSelect');

    if (!className) {
        select.innerHTML = '<option value="">选择主人</option>';
        return;
    }

    const cls = classes.find(c => c.name === className);
    if (cls) {
        select.innerHTML = '<option value="">选择主人</option>' +
            cls.students.map(s => {
                const key = `${className}_${s}`;
                const points = studentPoints[key]?.points || 0;
                return `<option value="${s}">${s} (积分:${points})</option>`;
            }).join('');
    }
}

// 领养灵宠
function adoptPet() {
    const className = document.getElementById('petClassSelect').value;
    const studentName = document.getElementById('petStudentSelect').value;

    if (!className || !studentName) {
        alert('请先选择班级和主人！');
        return;
    }

    const studentKey = `${className}_${studentName}`;
    const student = studentPoints[studentKey];

    if (!student || student.points < 500) {
        alert(`${studentName} 的积分不足！\n需要 500 积分，当前只有 ${student?.points || 0} 积分`);
        return;
    }

    // 扣除主人积分
    student.points -= 500;
    student.history.push({
        type: 'sub',
        value: 500,
        reason: '领养灵宠',
        time: new Date().toLocaleString()
    });
    Storage.set('studentPoints', studentPoints);

    // 生成随机灵宠
    const species = PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)];
    const pet = {
        id: Date.now(),
        ownerClass: className,
        ownerName: studentName,
        ownerKey: studentKey,
        ...species,
        level: 1,
        exp: 0,
        hunger: 80,
        mood: 80,
        energy: 100,
        totalFed: 0,
        totalWorked: 0,
        totalStudied: 0,
        adoptedAt: new Date().toLocaleDateString()
    };

    pets.push(pet);
    Storage.set('pets', pets);

    // 刷新主人选择列表（更新积分显示）
    loadPetClassStudents();
    updateLeaderboard();
    renderPetList();

    // 孵化动画
    const egg = document.getElementById('eggDisplay');
    egg.textContent = '✨';
    egg.style.animation = 'none';
    setTimeout(() => {
        egg.textContent = '🥚';
        egg.style.animation = '';
        const displayName = getPetDisplayName(pet);
        alert(`🎉 恭喜 ${studentName} 领养了 ${displayName}！\n${pet.desc}\n类型：${pet.type}\n已扣除 500 积分，剩余 ${student.points} 积分`);
    }, 1000);
}

// 渲染灵宠列表
function renderPetList() {
    const container = document.getElementById('petList');
    if (pets.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;grid-column:1/-1;">还没有灵宠，快去领养吧！</p>';
        return;
    }

    container.innerHTML = pets.map(pet => {
        const stage = getPetStage(pet.level);
        const displayName = getPetDisplayName(pet);
        const displayEmoji = getPetDisplayEmoji(pet);
        const expNeeded = getExpForLevel(pet.level);
        const expPercent = Math.min(100, Math.round((pet.exp / expNeeded) * 100));
        const ownerPoints = studentPoints[pet.ownerKey]?.points || 0;

        return `
        <div class="pet-card" onclick="showPetDetail(${pet.id})">
            <div class="pet-owner">👤 ${pet.ownerName} · ${pet.ownerClass}</div>
            <div class="pet-avatar">${displayEmoji}</div>
            <div class="pet-name">${displayName}</div>
            <div class="pet-stage">${stage.stage} · Lv.${pet.level}</div>
            <div class="pet-type">${pet.type} · ${pet.desc}</div>
            <div class="pet-level-bar">
                <div class="pet-level-progress" style="width:${expPercent}%"></div>
            </div>
            <div class="pet-stats">
                <div class="pet-stat">
                    <div class="pet-stat-label">饱食度</div>
                    <div class="pet-stat-value">${pet.hunger}%</div>
                </div>
                <div class="pet-stat">
                    <div class="pet-stat-label">心情</div>
                    <div class="pet-stat-value">${pet.mood}%</div>
                </div>
                <div class="pet-stat">
                    <div class="pet-stat-label">精力</div>
                    <div class="pet-stat-value">${pet.energy}%</div>
                </div>
                <div class="pet-stat">
                    <div class="pet-stat-label">主人积分</div>
                    <div class="pet-stat-value">${ownerPoints}</div>
                </div>
            </div>
            <div class="pet-actions">
                <button class="pet-btn-feed" onclick="event.stopPropagation();petAction(${pet.id}, 'feed')">🍖 喂养</button>
                <button class="pet-btn-study" onclick="event.stopPropagation();petAction(${pet.id}, 'study')">📚 学习</button>
            </div>
        </div>
    `}).join('');
}

// 灵宠操作
function petAction(petId, action) {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;

    const owner = studentPoints[pet.ownerKey];
    if (!owner) {
        alert('主人信息不存在！');
        return;
    }

    // 操作消耗（从主人积分扣除）
    const costs = { feed: 20, study: 30 };
    const cost = costs[action];

    if (owner.points < cost) {
        alert(`主人 ${pet.ownerName} 积分不足！\n需要 ${cost} 积分，当前只有 ${owner.points} 积分\n请让主人多赚积分再来！`);
        return;
    }

    // 扣除主人积分
    owner.points -= cost;
    owner.history.push({
        type: 'sub',
        value: cost,
        reason: `灵宠${action === 'feed' ? '喂养' : '学习'}`,
        time: new Date().toLocaleString()
    });
    Storage.set('studentPoints', studentPoints);

    let message = '';
    let leveledUp = false;

    switch(action) {
        case 'feed':
            pet.hunger = Math.min(100, pet.hunger + 25);
            pet.energy = Math.min(100, pet.energy + 15);
            pet.mood = Math.min(100, pet.mood + 10);
            pet.totalFed++;
            pet.exp += 15;
            message = `🍖 ${getPetDisplayName(pet)} 吃得很开心！\n饱食度 +25，精力 +15，心情 +10，经验 +15`;
            break;

        case 'study':
            pet.energy = Math.max(0, pet.energy - 20);
            pet.mood = Math.max(0, pet.mood - 5);
            pet.totalStudied++;
            pet.exp += 30;
            message = `📚 ${getPetDisplayName(pet)} 学习很努力！\n经验 +30，精力 -20，心情 -5`;
            break;
    }

    // 检查升级
    const expNeeded = getExpForLevel(pet.level);
    while (pet.exp >= expNeeded) {
        pet.exp -= expNeeded;
        pet.level++;
        leveledUp = true;

        // 升级恢复
        pet.hunger = Math.min(100, pet.hunger + 20);
        pet.mood = Math.min(100, pet.mood + 30);
        pet.energy = Math.min(100, pet.energy + 20);
    }

    if (leveledUp) {
        const newStage = getPetStage(pet.level);
        const oldStage = getPetStage(pet.level - 1);
        const displayName = getPetDisplayName(pet);
        const displayEmoji = getPetDisplayEmoji(pet);

        if (newStage.stage !== oldStage.stage) {
            message += `\n\n🎉🎉🎉 进化通知！🎉🎉🎉\n${displayEmoji} ${displayName} 进化到了 ${newStage.stage}阶段！`;
        } else {
            message += `\n\n⭐ ${displayName} 升级了！现在是 Lv.${pet.level}！`;
        }
    }

    // 自然衰减
    pet.hunger = Math.max(0, pet.hunger - 3);
    pet.mood = Math.max(0, pet.mood - 2);

    Storage.set('pets', pets);
    renderPetList();
    updateLeaderboard();

    // 刷新主人选择列表
    const currentClass = document.getElementById('petClassSelect').value;
    if (currentClass) loadPetClassStudents();

    alert(message + `\n\n💰 主人 ${pet.ownerName} 扣除 ${cost} 积分，剩余 ${owner.points} 积分`);
}

// 显示灵宠详情
function showPetDetail(petId) {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;

    const modal = document.getElementById('petModal');
    const content = document.getElementById('petModalContent');

    const stage = getPetStage(pet.level);
    const displayName = getPetDisplayName(pet);
    const displayEmoji = getPetDisplayEmoji(pet);
    const expNeeded = getExpForLevel(pet.level);
    const expPercent = Math.min(100, Math.round((pet.exp / expNeeded) * 100));
    const owner = studentPoints[pet.ownerKey];

    // 构建进化时间线
    const timelineHTML = PET_STAGES.map((s, idx) => {
        const isActive = pet.level >= s.minLevel;
        const isCurrent = pet.level >= s.minLevel && pet.level <= s.maxLevel;
        return `
            <div class="pet-evo-step ${isActive ? 'active' : ''}">
                <div class="evo-icon">${s.emoji}</div>
                <div class="evo-label">${s.stage}${isCurrent ? ' ✓' : ''}</div>
            </div>
            ${idx < PET_STAGES.length - 1 ? '<div class="evo-arrow">→</div>' : ''}
        `;
    }).join('');

    content.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:80px;margin-bottom:8px;">${displayEmoji}</div>
            <h2>${displayName}</h2>
            <div class="pet-detail-owner">
                <span>👤 主人：</span><strong>${pet.ownerName}</strong>
                <span>· ${pet.ownerClass}</span>
            </div>
            <p style="color:var(--text-secondary);margin-bottom:12px;">${pet.type} · ${stage.stage} · Lv.${pet.level} · ${pet.desc}</p>

            <div class="pet-evolution-timeline">
                ${timelineHTML}
            </div>

            <div style="background:var(--bg-dark);border-radius:12px;padding:20px;margin-bottom:16px;">
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-secondary);margin-bottom:4px;">
                        <span>经验值</span>
                        <span>${pet.exp} / ${expNeeded}</span>
                    </div>
                    <div class="pet-level-bar">
                        <div class="pet-level-progress" style="width:${expPercent}%"></div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                        <div style="color:var(--text-secondary);font-size:12px;">饱食度</div>
                        <div style="font-size:24px;font-weight:700;color:var(--success);">${pet.hunger}%</div>
                    </div>
                    <div>
                        <div style="color:var(--text-secondary);font-size:12px;">心情</div>
                        <div style="font-size:24px;font-weight:700;color:var(--warning);">${pet.mood}%</div>
                    </div>
                    <div>
                        <div style="color:var(--text-secondary);font-size:12px;">精力</div>
                        <div style="font-size:24px;font-weight:700;color:var(--info);">${pet.energy}%</div>
                    </div>
                    <div>
                        <div style="color:var(--text-secondary);font-size:12px;">主人积分</div>
                        <div style="font-size:24px;font-weight:700;color:var(--primary);">${owner?.points || 0}</div>
                    </div>
                </div>
            </div>

            <div style="background:var(--bg-dark);border-radius:12px;padding:16px;margin-bottom:16px;">
                <h4 style="color:var(--warning);margin-bottom:12px;font-size:14px;">📊 成长统计</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:13px;">
                    <div>
                        <div style="color:var(--text-secondary);">喂养次数</div>
                        <div style="font-size:20px;font-weight:700;">${pet.totalFed}</div>
                    </div>
                    <div>
                        <div style="color:var(--text-secondary);">学习次数</div>
                        <div style="font-size:20px;font-weight:700;">${pet.totalStudied}</div>
                    </div>
                    <div>
                        <div style="color:var(--text-secondary);">领养天数</div>
                        <div style="font-size:20px;font-weight:700;">${Math.max(1, Math.floor((Date.now() - new Date(pet.adoptedAt).getTime()) / 86400000))}</div>
                    </div>
                </div>
            </div>

            <p style="font-size:12px;color:var(--text-secondary);">领养时间：${pet.adoptedAt}</p>
        </div>
    `;

    modal.classList.add('active');
}

function closePetModal() {
    document.getElementById('petModal').classList.remove('active');
}

// ==================== 互动游戏 ====================
const GAMES = {
    knowledge: [
        {
            name: '知识抢答赛',
            desc: '老师出题，学生抢答，答对得分',
            rules: ['老师准备5-10道题目', '学生举手抢答', '答对加10分，答错不扣分', '累计得分最高者获胜']
        },
        {
            name: '词语接龙',
            desc: '用上一个词的最后字开头说新词',
            rules: ['第一个同学说一个词语', '下一个同学用最后一个字开头', '5秒内答不出淘汰', '坚持到最后者获胜']
        },
        {
            name: '快速问答',
            desc: '老师快速提问，学生轮流回答',
            rules: ['设定时间限制（如30秒）', '老师快速提问', '学生必须立刻回答', '答对最多者获胜']
        }
    ],
    warmup: [
        {
            name: '名字接龙',
            desc: '记住前面所有人的名字',
            rules: ['第1人说自己的名字', '第2人说第1人名字+自己名字', '依次累加', '说错或忘记者表演节目']
        },
        {
            name: '两真一假',
            desc: '说三件事，猜哪个是假的',
            rules: ['每人说三件关于自己的事', '其中两件真一件假', '其他人猜哪件是假的', '猜对得分']
        },
        {
            name: '快速自我介绍',
            desc: '用特定格式快速介绍自己',
            rules: ['格式：我是【特点】的【名字】', '如：我是爱打篮球的张三', '下一位要重复前一位的', '依次累加，说错淘汰']
        }
    ],
    team: [
        {
            name: '你画我猜',
            desc: '一人画，队友猜',
            rules: ['分组进行', '每组选1人看词画画', '队友根据画猜词', '限时2分钟，猜对最多者胜']
        },
        {
            name: '传话游戏',
            desc: '悄悄话传递，看最后是否走样',
            rules: ['分组排成纵队', '老师给第1人一句话', '悄悄传给下一个人', '最后一人说出听到的，最接近原话者胜']
        },
        {
            name: '合作拼图',
            desc: '团队协作完成拼图',
            rules: ['分组进行', '每组获得相同拼图', '限时完成', '最快完成且正确者胜']
        }
    ]
};

function generateGame() {
    const players = document.getElementById('gamePlayers').value;
    const type = document.getElementById('gameType').value;

    let gamePool = [];
    if (type === 'random') {
        gamePool = [...GAMES.knowledge, ...GAMES.warmup, ...GAMES.team];
    } else {
        gamePool = GAMES[type] || GAMES.knowledge;
    }

    const game = gamePool[Math.floor(Math.random() * gamePool.length)];
    const playerText = {
        '1': '1人挑战',
        '2': '2人对战',
        '3': '3人参与',
        '4': '4人参与',
        'group': '小组对抗',
        'all': '全班参与'
    };

    document.getElementById('gameDisplay').innerHTML = `
        <div class="game-card">
            <h3>${game.name}</h3>
            <div class="game-desc">
                <p>${game.desc}</p>
                <p style="margin-top:8px;color:var(--primary);">👥 参与人数：${playerText[players]}</p>
            </div>
            <div class="game-rules">
                <h4>游戏规则</h4>
                <ul>
                    ${game.rules.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
            <button onclick="generateGame()" class="btn-primary">换一个游戏</button>
        </div>
    `;
}

// ==================== 体感互动 ====================
const MOTION_CONTENT = {
    rhythm: {
        title: '🎵 律动操',
        icon: '🎵',
        desc: '跟随音乐节奏做动作，放松身心，唤醒活力',
        instructions: [
            '播放节奏明快的音乐',
            '老师带领学生做简单动作：拍手、跺脚、挥手',
            '逐渐加快节奏',
            '可以加入简单的舞蹈动作',
            '持续3-5分钟，让学生充分活动'
        ]
    },
    gesture: {
        title: '✋ 手势识别游戏',
        icon: '✋',
        desc: '通过手势进行互动游戏',
        instructions: [
            '老师出示手势（石头/剪刀/布）',
            '全班同时出手势',
            '输的一方做5个深蹲',
            '可以升级为团队对抗',
            '也可以用手势代表数字进行计算游戏'
        ]
    },
    ar: {
        title: '🥽 AR体感互动',
        icon: '🥽',
        desc: '利用摄像头进行增强现实互动',
        instructions: [
            '打开摄像头（需要浏览器权限）',
            '学生站在摄像头前',
            '根据屏幕提示做动作',
            '系统识别动作并给出反馈',
            '可以设置闯关模式增加趣味性'
        ]
    }
};

function showMotion(type) {
    const content = MOTION_CONTENT[type];
    const display = document.getElementById('motionDisplay');

    display.innerHTML = `
        <div class="motion-content">
            <h3>${content.title}</h3>
            <div class="motion-video-placeholder">${content.icon}</div>
            <p style="font-size:16px;color:var(--text-secondary);margin-bottom:20px;">${content.desc}</p>
            <div class="motion-instructions">
                <h4>操作指南</h4>
                <ol>
                    ${content.instructions.map(i => `<li>${i}</li>`).join('')}
                </ol>
            </div>
            ${type === 'ar' ? '<button onclick="startAR()" class="btn-primary" style="margin-top:20px;">启动摄像头</button>' : ''}
        </div>
    `;
}

function startAR() {
    const display = document.getElementById('motionDisplay');
    display.innerHTML = `
        <div class="motion-content">
            <h3>🥽 AR体感互动</h3>
            <div style="background:var(--bg-dark);border-radius:12px;padding:40px;text-align:center;margin:20px 0;">
                <div style="font-size:64px;margin-bottom:16px;">📷</div>
                <p>摄像头功能需要实际硬件支持</p>
                <p style="color:var(--text-secondary);margin-top:8px;">在实际部署时，可以接入 TensorFlow.js 手势识别</p>
            </div>
            <div class="motion-instructions">
                <h4>AR游戏示例</h4>
                <ol>
                    <li>手势猜谜：系统显示手势，学生模仿</li>
                    <li>虚拟接物：移动身体接住虚拟物体</li>
                    <li>镜像模仿：跟随屏幕上的动作</li>
                    <li>节奏打击：根据节奏做击打动作</li>
                </ol>
            </div>
        </div>
    `;
}

// ==================== 初始化 ====================
function init() {
    renderClassList();
    renderPrizeList();
    updateClassSelects();
    updatePetClassSelect();
    renderPetList();
    updateLeaderboard();
}

// 更新灵宠页面的班级选择
function updatePetClassSelect() {
    const select = document.getElementById('petClassSelect');
    if (!select) return;
    select.innerHTML = '<option value="">选择班级</option>' +
        classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
