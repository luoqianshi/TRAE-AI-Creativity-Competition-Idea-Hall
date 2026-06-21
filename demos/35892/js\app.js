/**
 * 家庭小柯南 - 核心应用逻辑
 * 离线运行、本地存储、双端隔离
 */
import { MYSTERIES } from './data-mysteries.js';
import { DRAWINGS } from './data-drawings.js';

// ============================================
// 存储管理
// ============================================
const Storage = {
    get(key, defaultVal = null) {
        try {
            const val = localStorage.getItem('conan_' + key);
            return val ? JSON.parse(val) : defaultVal;
        } catch { return defaultVal; }
    },
    set(key, val) {
        try { localStorage.setItem('conan_' + key, JSON.stringify(val)); } catch {}
    },
    remove(key) {
        try { localStorage.removeItem('conan_' + key); } catch {}
    }
};

// ============================================
// 应用状态
// ============================================
const AppState = {
    childName: '',
    childAge: 4,
    familyMembers: [],
    secretPattern: 'N',
    currentDay: 1,
    startDate: null,
    totalScore: 0,
    solvedCount: 0,
    animalCount: 0,
    drawingCount: 0,
    todayDrawings: 0,
    todayDrawDate: '',
    collectedAnimals: [],  // {id, emoji, name, color, timestamp}
    submissions: [],       // {id, mysteryId, day, reasoning, photo, score, status:'pending'|'graded', timestamp}
    settings: {
        rewardCase: '',
        rewardRoundup: '',
        drawCount: 3,
        keepAnim: true
    },
    isGraduated: false,
    initialized: false
};

function loadState() {
    const saved = Storage.get('state', null);
    if (saved) Object.assign(AppState, saved);
}

function saveState() {
    Storage.set('state', AppState);
}

// ============================================
// 日期与天数计算
// ============================================
function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function calcCurrentDay() {
    if (!AppState.startDate) return 1;
    const start = new Date(AppState.startDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(diff + 1, 1), 100);
}

function resetTodayDrawings() {
    const today = getTodayStr();
    if (AppState.todayDrawDate !== today) {
        AppState.todayDrawings = 0;
        AppState.todayDrawDate = today;
        saveState();
    }
}

// ============================================
// 屏幕路由
// ============================================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
}

// ============================================
// 音效指示器（视觉替代）
// ============================================
function showSFX(text, icon = '🔔') {
    const indicator = document.getElementById('sfx-indicator');
    const sfxText = document.getElementById('sfx-text');
    indicator.querySelector('.sfx-icon').textContent = icon;
    sfxText.textContent = text;
    indicator.style.display = 'flex';
    indicator.style.animation = 'none';
    indicator.offsetHeight; // reflow
    indicator.style.animation = 'sfxPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    setTimeout(() => { indicator.style.display = 'none'; }, 1500);
}

// ============================================
// 弹窗
// ============================================
function showModal(title, body, buttons = []) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    let btnHtml = buttons.map((b, i) =>
        `<button class="modal-btn ${b.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}" data-modal-btn="${i}">${b.text}</button>`
    ).join('');
    content.innerHTML = `
        <div class="modal-title">${title}</div>
        <div class="modal-body">${body}</div>
        <div class="modal-buttons">${btnHtml}</div>
    `;
    overlay.style.display = 'flex';
    buttons.forEach((b, i) => {
        content.querySelector(`[data-modal-btn="${i}"]`).addEventListener('click', () => {
            overlay.style.display = 'none';
            if (b.action) b.action();
        });
    });
}

// ============================================
// 边框贴纸管理
// ============================================
const StickerBorder = {
    container: null,

    init() {
        this.container = document.getElementById('sticker-border');
        this.renderAll();
    },

    renderAll() {
        this.container.innerHTML = '';
        const animals = AppState.collectedAnimals;
        const perimeter = this.getPerimeter();
        const count = animals.length;
        if (count === 0) return;

        const size = count > 60 ? Math.max(16, 28 - Math.floor(count / 15) * 2) : 28;

        animals.forEach((animal, i) => {
            const el = document.createElement('div');
            el.className = 'sticker-item';
            el.textContent = animal.emoji;
            el.style.fontSize = size + 'px';
            el.title = animal.name;
            el.dataset.index = i;

            const pos = this.getPosition(i, count, perimeter);
            el.style.left = pos.x + '%';
            el.style.top = pos.y + '%';
            el.style.transform = 'translate(-50%, -50%)';

            el.addEventListener('click', () => this.animateSticker(el));
            this.container.appendChild(el);
        });
    },

    getPerimeter() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        return 2 * (w + h);
    },

    getPosition(index, total, perimeter) {
        const step = perimeter / total;
        const dist = index * step;
        const w = window.innerWidth;
        const h = window.innerHeight;

        let x, y;
        if (dist < w) {
            x = dist; y = 0;
        } else if (dist < w + h) {
            x = w; y = dist - w;
        } else if (dist < 2 * w + h) {
            x = w - (dist - w - h); y = h;
        } else {
            x = 0; y = h - (dist - 2 * w - h);
        }
        return { x: (x / w) * 100, y: (y / h) * 100 };
    },

    addAnimal(animal) {
        AppState.collectedAnimals.push({
            id: animal.id,
            emoji: animal.emoji,
            name: animal.name,
            color: animal.color,
            timestamp: Date.now()
        });
        AppState.animalCount++;
        saveState();
        this.renderAll();
    },

    animateSticker(el) {
        el.classList.remove('animate');
        el.offsetHeight;
        el.classList.add('animate');
        setTimeout(() => el.classList.remove('animate'), 800);
    }
};

// ============================================
// 欢迎页 & 初始化
// ============================================
function initWelcome() {
    document.getElementById('btn-start').addEventListener('click', () => {
        if (AppState.initialized) {
            AppState.currentDay = calcCurrentDay();
            resetTodayDrawings();
            showScreen('screen-home');
            updateHomeScreen();
        } else {
            showScreen('screen-setup');
            initSetup();
        }
    });
}

// ============================================
// 家庭配置
// ============================================
const MEMBER_ROLES = ['父亲', '母亲', '兄弟', '姐妹', '祖辈', '其他'];
const MEMBER_EMOJIS = { '父亲': '👨', '母亲': '👩', '兄弟': '👦', '姐妹': '👧', '祖辈': '👴', '其他': '🧑' };

let setupMembers = [];

function initSetup() {
    // 年龄选择
    document.querySelectorAll('.age-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.age-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.childAge = parseInt(btn.dataset.age);
        });
    });

    // 初始化家庭成员
    setupMembers = [{ name: '', role: '父亲' }, { name: '', role: '母亲' }];
    renderSetupMembers();

    // 暗号选择
    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.secretPattern = btn.dataset.pattern;
        });
    });

    // 添加成员
    document.getElementById('btn-add-member').addEventListener('click', () => {
        setupMembers.push({ name: '', role: '其他' });
        renderSetupMembers();
    });

    // 完成配置
    document.getElementById('btn-setup-done').addEventListener('click', completeSetup);
}

function renderSetupMembers() {
    const container = document.getElementById('family-members');
    container.innerHTML = setupMembers.map((m, i) => `
        <div class="family-member-item" data-index="${i}">
            <span class="member-emoji">${MEMBER_EMOJIS[m.role] || '🧑'}</span>
            <div class="member-info">
                <input type="text" class="member-name-input" data-index="${i}" placeholder="称呼（如：妈妈、爸爸）" value="${m.name}" maxlength="10">
                <select class="member-role-select" data-index="${i}">
                    ${MEMBER_ROLES.map(r => `<option value="${r}" ${r === m.role ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </div>
            ${setupMembers.length > 2 ? `<button class="btn-remove-member" data-index="${i}">✕</button>` : ''}
        </div>
    `).join('');

    // 事件绑定
    container.querySelectorAll('.member-name-input').forEach(input => {
        input.addEventListener('input', (e) => {
            setupMembers[parseInt(e.target.dataset.index)].name = e.target.value;
        });
    });

    container.querySelectorAll('.member-role-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            setupMembers[idx].role = e.target.value;
            e.target.closest('.family-member-item').querySelector('.member-emoji').textContent = MEMBER_EMOJIS[e.target.value] || '🧑';
        });
    });

    container.querySelectorAll('.btn-remove-member').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setupMembers.splice(parseInt(e.target.dataset.index), 1);
            renderSetupMembers();
        });
    });
}

function completeSetup() {
    const childName = document.getElementById('input-child-name').value.trim();
    if (!childName) {
        showModal('提示', '请输入小侦探的名字！', [{ text: '好的', primary: true }]);
        return;
    }

    const validMembers = setupMembers.filter(m => m.name.trim());
    if (validMembers.length < 1) {
        showModal('提示', '请至少添加一位家庭成员！', [{ text: '好的', primary: true }]);
        return;
    }

    AppState.childName = childName;
    AppState.familyMembers = validMembers.map(m => ({ name: m.name.trim(), role: m.role }));
    AppState.startDate = getTodayStr();
    AppState.currentDay = 1;
    AppState.initialized = true;
    AppState.todayDrawDate = getTodayStr();
    saveState();

    showScreen('screen-home');
    updateHomeScreen();
}

// ============================================
// 主界面
// ============================================
function updateHomeScreen() {
    document.getElementById('home-child-name').textContent = AppState.childName;
    document.getElementById('home-day-label').textContent = `第 ${AppState.currentDay} 天`;
    document.getElementById('home-score').textContent = AppState.totalScore + ' 分';
    document.getElementById('stat-solved').textContent = AppState.solvedCount;
    document.getElementById('stat-animals').textContent = AppState.animalCount;
    document.getElementById('stat-drawings').textContent = AppState.drawingCount;

    // 今日谜题
    const mystery = MYSTERIES[AppState.currentDay - 1];
    if (mystery) {
        document.getElementById('mystery-title').textContent = mystery.title;
        document.getElementById('mystery-desc').textContent = mystery.description;
        document.getElementById('mystery-category').textContent = '📍 ' + mystery.category;
        document.getElementById('mystery-difficulty').textContent = '⭐'.repeat(mystery.difficulty);
    }

    // 绘画券
    const maxDraw = AppState.settings.drawCount > 0 ? AppState.settings.drawCount : 99;
    const remaining = Math.max(0, maxDraw - AppState.todayDrawings);
    document.getElementById('draw-tickets').textContent = remaining + ' 张券';
}

// ============================================
// 谜题/破案系统
// ============================================
function initMysterySystem() {
    // 进入破案
    document.getElementById('btn-go-mystery').addEventListener('click', () => {
        const mystery = MYSTERIES[AppState.currentDay - 1];
        if (!mystery) return;

        document.getElementById('mystery-id').textContent = '#' + mystery.id;
        document.getElementById('mystery-diff-badge').textContent = '⭐'.repeat(mystery.difficulty);
        document.getElementById('mystery-detail-title').textContent = mystery.title;
        document.getElementById('mystery-detail-desc').textContent = mystery.description;
        document.getElementById('mystery-hint').textContent = mystery.hint;
        document.getElementById('mystery-scene').textContent = mystery.scene;
        document.getElementById('mystery-reasoning').value = '';
        document.getElementById('mystery-photo-preview').style.display = 'none';
        showScreen('screen-mystery');
    });

    // 返回
    document.getElementById('btn-back-home').addEventListener('click', () => {
        showScreen('screen-home');
    });

    // 拍照
    document.getElementById('btn-take-photo').addEventListener('click', takePhoto);

    // 重拍
    document.getElementById('btn-retake-photo').addEventListener('click', takePhoto);

    // 提交推理
    document.getElementById('btn-submit-mystery').addEventListener('click', submitMystery);

    // 结果返回
    document.getElementById('btn-result-back').addEventListener('click', () => {
        showScreen('screen-home');
        updateHomeScreen();
    });
}

let currentPhoto = null;

function takePhoto() {
    // 创建隐藏的文件输入
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                currentPhoto = ev.target.result;
                document.getElementById('mystery-photo-img').src = currentPhoto;
                document.getElementById('mystery-photo-preview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    input.click();
}

function submitMystery() {
    const reasoning = document.getElementById('mystery-reasoning').value.trim();
    if (!reasoning) {
        showModal('提示', '小柯南，写下你的推理过程吧！', [{ text: '好的', primary: true }]);
        return;
    }

    const mystery = MYSTERIES[AppState.currentDay - 1];
    const submission = {
        id: Date.now(),
        mysteryId: mystery.id,
        day: AppState.currentDay,
        reasoning: reasoning,
        photo: currentPhoto || null,
        score: null,
        status: 'pending',
        timestamp: Date.now()
    };

    AppState.submissions.push(submission);
    saveState();

    // 检查是否已有评分（模拟自动评分，实际由家长评分）
    // 在演示模式下自动给10分
    showModal('推理已提交', '你的推理已提交，等待评判结果！<br>（演示模式自动评分）', [
        { text: '好的', primary: true, action: () => autoGradeSubmission(submission) }
    ]);
}

function autoGradeSubmission(submission) {
    // 演示模式：自动给10分
    submission.score = 10;
    submission.status = 'graded';
    saveState();
    showResult(10);
}

function showResult(score) {
    AppState.totalScore += score;
    AppState.solvedCount++;
    saveState();

    // 显示结果
    document.getElementById('result-score-value').textContent = score;
    document.getElementById('result-total-score').textContent = AppState.totalScore;

    if (score === 10) {
        document.getElementById('result-title').textContent = '真相只有一个！';
        document.getElementById('result-message').textContent = '完美！这就是侦探精神！';
        showSFX('真相只有一个！', '👓');
    } else if (score === 6) {
        document.getElementById('result-title').textContent = '找到了！';
        document.getElementById('result-message').textContent = '你找到了答案，这很好。但方法上还可以更棒。';
        showSFX('找到了！', '🔍');
    } else {
        document.getElementById('result-title').textContent = '再试试';
        document.getElementById('result-message').textContent = '再试试吧，这次方向不对。';
    }

    showScreen('screen-result');

    // 检查凑整
    setTimeout(() => checkRoundUp(), 500);
}

function checkRoundUp() {
    const ones = AppState.totalScore % 10;
    if (ones === 8 || ones === 9) {
        const bonus = 10 - ones;
        const target = AppState.totalScore + bonus;
        const randomAnimal = DRAWINGS[Math.floor(Math.random() * DRAWINGS.length)];

        setTimeout(() => {
            document.getElementById('roundup-target').textContent = target;
            document.getElementById('roundup-animal-name').textContent = randomAnimal.name;
            document.getElementById('roundup-animal').textContent = randomAnimal.emoji;
            document.getElementById('roundup-score-old').textContent = AppState.totalScore;
            document.getElementById('roundup-score-new').textContent = target;

            showScreen('screen-roundup');

            AppState.totalScore = target;
            StickerBorder.addAnimal(randomAnimal);
            saveState();

            showSFX('凑整奖励！', '🎉');

            setTimeout(() => {
                showScreen('screen-home');
                updateHomeScreen();
            }, 3000);
        }, 1000);
    }
}

// ============================================
// 画画系统
// ============================================
const DrawSystem = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    paths: [],
    currentPath: [],
    currentDrawing: null,
    strokeCount: 0,

    init() {
        this.canvas = document.getElementById('draw-canvas');
        this.ctx = this.canvas.getContext('2d');

        // 返回
        document.getElementById('btn-back-home-draw').addEventListener('click', () => {
            showScreen('screen-home');
            updateHomeScreen();
        });

        // 重新画
        document.getElementById('btn-clear-draw').addEventListener('click', () => this.clear());

        // 完成
        document.getElementById('btn-submit-draw').addEventListener('click', () => this.submit());

        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.onTouchEnd());

        // 鼠标事件（PC调试）
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
    },

    enter() {
        resetTodayDrawings();
        const maxDraw = AppState.settings.drawCount > 0 ? AppState.settings.drawCount : 99;
        const remaining = Math.max(0, maxDraw - AppState.todayDrawings);

        if (remaining <= 0) {
            showModal('今日券已用完', '小柯南，今天画得很棒啦！明天再来哦~', [
                { text: '好的', primary: true, action: () => showScreen('screen-home') }
            ]);
            return;
        }

        // 选择当前图形
        const drawIndex = AppState.drawingCount;
        if (drawIndex >= DRAWINGS.length) return;
        this.currentDrawing = DRAWINGS[drawIndex];

        document.getElementById('draw-tickets-remaining').textContent = `剩余 ${remaining - 1} 张券`;
        document.getElementById('draw-guide-name').textContent = this.currentDrawing.name;

        this.clear();
        showScreen('screen-draw');

        // 延迟绘制参考线（等canvas尺寸稳定）
        setTimeout(() => this.drawGuide(), 100);
    },

    resizeCanvas() {
        const wrapper = this.canvas.parentElement;
        const rect = wrapper.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    },

    drawGuide() {
        this.resizeCanvas();
        if (!this.currentDrawing || !this.currentDrawing.points) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 40;

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(108, 92, 231, 0.3)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const points = this.currentDrawing.points;
        ctx.beginPath();
        points.forEach((p, i) => {
            const x = padding + (p.x / 100) * (w - padding * 2);
            const y = padding + (p.y / 100) * (h - padding * 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制起始点提示
        if (points.length > 0) {
            const startX = padding + (points[0].x / 100) * (w - padding * 2);
            const startY = padding + (points[0].y / 100) * (h - padding * 2);
            ctx.fillStyle = 'rgba(108, 92, 231, 0.5)';
            ctx.beginPath();
            ctx.arc(startX, startY, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    },

    onTouchStart(e) {
        e.preventDefault();
        this.isDrawing = true;
        this.currentPath = [this.getPos(e)];
    },

    onTouchMove(e) {
        e.preventDefault();
        if (!this.isDrawing) return;
        const pos = this.getPos(e);
        this.currentPath.push(pos);
        this.drawStroke(this.currentPath);
    },

    onTouchEnd() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        if (this.currentPath.length > 2) {
            this.paths.push([...this.currentPath]);
        }
        this.currentPath = [];
        this.strokeCount++;
        this.checkCompletion();
    },

    onMouseDown(e) {
        this.isDrawing = true;
        this.currentPath = [this.getPos(e)];
    },

    onMouseMove(e) {
        if (!this.isDrawing) return;
        const pos = this.getPos(e);
        this.currentPath.push(pos);
        this.drawStroke(this.currentPath);
    },

    onMouseUp() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        if (this.currentPath.length > 2) {
            this.paths.push([...this.currentPath]);
        }
        this.currentPath = [];
        this.strokeCount++;
        this.checkCompletion();
    },

    drawStroke(path) {
        const ctx = this.ctx;
        // 重绘参考线
        this.drawGuide();

        // 绘制所有已完成的笔画
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        this.paths.forEach(p => {
            if (p.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(p[0].x, p[0].y);
            for (let i = 1; i < p.length; i++) {
                ctx.lineTo(p[i].x, p[i].y);
            }
            ctx.stroke();
        });

        // 绘制当前笔画
        if (path.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }
            ctx.stroke();
        }
    },

    checkCompletion() {
        // 简单判断：笔画覆盖了足够多的参考点
        if (this.strokeCount >= 1 && this.paths.length > 0) {
            document.getElementById('draw-encourage').textContent = '画得很好！完成后点击"完成！"吧~';
        }
    },

    clear() {
        this.paths = [];
        this.currentPath = [];
        this.strokeCount = 0;
        this.drawGuide();
        document.getElementById('draw-encourage').textContent = '';
    },

    submit() {
        if (this.paths.length === 0) {
            showModal('提示', '先画点什么吧！', [{ text: '好的', primary: true }]);
            return;
        }

        const animal = this.currentDrawing;
        AppState.drawingCount++;
        AppState.todayDrawings++;
        saveState();

        // 显示画画完成动画
        document.getElementById('draw-anim-animal').textContent = animal.emoji;
        document.getElementById('draw-anim-bubble-text').textContent = `谢谢你把我画出来！我是${animal.name}~`;
        showScreen('screen-draw-anim');

        showSFX(`${animal.name} 活过来了！`, '🎨');

        // 动画结束后，添加贴纸并返回
        setTimeout(() => {
            StickerBorder.addAnimal(animal);
            saveState();

            // 检查是否触发毕业典礼
            if (AppState.drawingCount >= 300 && !AppState.isGraduated) {
                triggerGraduation();
            } else {
                showScreen('screen-home');
                updateHomeScreen();
            }
        }, 3500);
    }
};

// ============================================
// 图形密码检测（家长后台入口）
// ============================================
const PatternDetector = {
    lastPaths: [],
    startTime: 0,

    init() {
        // 在画画界面添加长按检测
        const canvas = document.getElementById('draw-canvas');
        let pressTimer = null;

        canvas.addEventListener('touchstart', (e) => {
            this.startTime = Date.now();
            this.lastPaths = [];
        });

        canvas.addEventListener('touchend', () => {
            const duration = Date.now() - this.startTime;
            if (duration < 2000 && DrawSystem.paths.length > 0) {
                this.detectPattern(DrawSystem.paths);
            }
        });
    },

    detectPattern(paths) {
        // 将路径简化为方向序列
        const directions = this.getDirectionSequence(paths);
        const pattern = AppState.secretPattern;

        let matched = false;
        switch (pattern) {
            case 'N':
                matched = this.matchN(directions);
                break;
            case 'Z':
                matched = this.matchZ(directions);
                break;
            case 'V':
                matched = this.matchV(directions);
                break;
            case 'L':
                matched = this.matchL(directions);
                break;
            case 'triangle':
                matched = this.matchTriangle(directions);
                break;
            case 'circle':
                matched = this.matchCircle(paths);
                break;
        }

        if (matched) {
            showParentBackend();
        }
    },

    getDirectionSequence(paths) {
        const dirs = [];
        paths.forEach(path => {
            if (path.length < 2) return;
            for (let i = 1; i < path.length; i++) {
                const dx = path[i].x - path[i-1].x;
                const dy = path[i].y - path[i-1].y;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    if (Math.abs(dx) > Math.abs(dy)) {
                        dirs.push(dx > 0 ? 'R' : 'L');
                    } else {
                        dirs.push(dy > 0 ? 'D' : 'U');
                    }
                }
            }
        });
        return this.simplifyDirections(dirs);
    },

    simplifyDirections(dirs) {
        if (dirs.length === 0) return [];
        const result = [dirs[0]];
        for (let i = 1; i < dirs.length; i++) {
            if (dirs[i] !== result[result.length - 1]) {
                result.push(dirs[i]);
            }
        }
        return result;
    },

    matchN(dirs) {
        // N: 上 → 右下 → 上
        const str = dirs.join('');
        return str.includes('URD') || str.includes('ULDR') || str.includes('UD');
    },

    matchZ(dirs) {
        // Z: 右 → 左下 → 右
        const str = dirs.join('');
        return str.includes('RDL') || str.includes('RDLR') || str.includes('RD');
    },

    matchV(dirs) {
        // V: 右下 → 左下
        const str = dirs.join('');
        return str.includes('DL') || str.includes('RD') && str.includes('L');
    },

    matchL(dirs) {
        // L: 下 → 右
        const str = dirs.join('');
        return str.includes('DR');
    },

    matchTriangle(dirs) {
        // 三角：右 → 左下 → 右上 或类似
        const str = dirs.join('');
        return (str.includes('R') && str.includes('DL') && str.includes('U')) ||
               (str.includes('R') && str.includes('D') && str.includes('L') && str.includes('U'));
    },

    matchCircle(paths) {
        // 圆形：路径闭合
        if (paths.length === 0) return false;
        const path = paths[0];
        if (path.length < 10) return false;
        const start = path[0];
        const end = path[path.length - 1];
        const dist = Math.sqrt((start.x - end.x) ** 2 + (start.y - end.y) ** 2);
        return dist < 50;
    }
};

// ============================================
// 家长后台
// ============================================
function showParentBackend() {
    showScreen('screen-parent');
    renderGradingList();
    loadParentSettings();
    showSFX('进入后台', '📋');
}

function initParentBackend() {
    // 退出
    document.getElementById('btn-exit-parent').addEventListener('click', () => {
        showScreen('screen-home');
        updateHomeScreen();
    });

    // Tab切换
    document.querySelectorAll('.parent-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.parent-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.parent-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('parent-tab-' + tab.dataset.tab).classList.add('active');
        });
    });

    // 保存设置
    document.getElementById('btn-save-settings').addEventListener('click', () => {
        AppState.settings.rewardCase = document.getElementById('setting-reward-case').value;
        AppState.settings.rewardRoundup = document.getElementById('setting-reward-roundup').value;
        AppState.settings.drawCount = parseInt(document.getElementById('setting-draw-count').value);
        AppState.settings.keepAnim = document.getElementById('setting-keep-anim').checked;
        saveState();
        showModal('已保存', '设置已保存！', [{ text: '好的', primary: true }]);
    });
}

function renderGradingList() {
    const list = document.getElementById('grading-list');
    const pending = AppState.submissions.filter(s => s.status === 'pending');

    if (pending.length === 0) {
        list.innerHTML = '<div class="grading-empty">暂无待判卷内容</div>';
        return;
    }

    list.innerHTML = pending.map(sub => {
        const mystery = MYSTERIES.find(m => m.id === sub.mysteryId);
        return `
            <div class="grading-item" data-sub-id="${sub.id}">
                <div class="grading-item-header">
                    <span class="grading-item-id">待判卷 #${sub.id}</span>
                    <span class="grading-item-status">待评分</span>
                </div>
                <div class="grading-item-content">
                    "${sub.reasoning}"
                </div>
                ${sub.photo ? `<div class="grading-item-photo"><img src="${sub.photo}" alt="现场照片"></div>` : ''}
                <div class="grading-buttons">
                    <button class="grading-btn score-10" data-sub-id="${sub.id}" data-score="10">10分</button>
                    <button class="grading-btn score-6" data-sub-id="${sub.id}" data-score="6">6分</button>
                    <button class="grading-btn score-0" data-sub-id="${sub.id}" data-score="0">0分</button>
                </div>
            </div>
        `;
    }).join('');

    // 绑定评分按钮
    list.querySelectorAll('.grading-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const subId = parseInt(btn.dataset.subId);
            const score = parseInt(btn.dataset.score);
            gradeSubmission(subId, score);
        });
    });
}

function gradeSubmission(subId, score) {
    const sub = AppState.submissions.find(s => s.id === subId);
    if (sub) {
        sub.score = score;
        sub.status = 'graded';
        saveState();
        renderGradingList();
        showSFX(`已评分：${score}分`, '✅');
    }
}

function loadParentSettings() {
    document.getElementById('setting-reward-case').value = AppState.settings.rewardCase || '';
    document.getElementById('setting-reward-roundup').value = AppState.settings.rewardRoundup || '';
    document.getElementById('setting-draw-count').value = AppState.settings.drawCount;
    document.getElementById('setting-keep-anim').checked = AppState.settings.keepAnim;
}

// ============================================
// 100天毕业典礼
// ============================================
function triggerGraduation() {
    AppState.isGraduated = true;
    saveState();
    showScreen('screen-graduation');
    playGraduationCeremony();
}

function playGraduationCeremony() {
    const container = document.getElementById('graduation-container');
    const animals = AppState.collectedAnimals;
    const totalAnimals = animals.length || 60; // 至少显示一些

    // 第一幕：前奏（5秒）
    container.innerHTML = `
        <div class="grad-prologue">
            <div class="grad-prologue-text">第 100 天</div>
        </div>
    `;

    // 第二幕：底部动物跳出（10秒）
    setTimeout(() => {
        const bottomAnimals = animals.slice(0, Math.min(20, totalAnimals));
        let animalHtml = bottomAnimals.map((a, i) => `
            <div class="grad-animal" style="left:${10 + (i / bottomAnimals.length) * 80}%;bottom:0;animation-delay:${i * 0.1}s">${a.emoji}</div>
        `).join('');
        const bubbles = ['小柯南！', '恭喜你！', '100天啦！', '太棒了！'];
        let bubbleHtml = bubbles.map((b, i) => `
            <div class="grad-bubble" style="left:${20 + i * 20}%;bottom:30%;animation-delay:${0.5 + i * 0.3}s">${b}</div>
        `).join('');

        container.innerHTML = `
            <div class="grad-animals-batch" style="background:linear-gradient(180deg, #0a0a1a, #1a1a3e)">
                ${animalHtml}
                ${bubbleHtml}
            </div>
        `;
    }, 5000);

    // 第三幕：右侧动物（10秒）
    setTimeout(() => {
        const rightAnimals = animals.slice(20, Math.min(40, totalAnimals));
        let animalHtml = rightAnimals.map((a, i) => `
            <div class="grad-animal" style="right:0;top:${10 + (i / rightAnimals.length) * 70}%;animation-delay:${i * 0.1}s">${a.emoji}</div>
        `).join('');
        const bubbles = ['你太厉害了！', '每天3次从不偷懒！', '做鬼脸~', '棒！'];
        let bubbleHtml = bubbles.map((b, i) => `
            <div class="grad-bubble" style="right:${15 + i * 5}%;top:${20 + i * 15}%;animation-delay:${0.5 + i * 0.3}s">${b}</div>
        `).join('');

        container.innerHTML = `
            <div class="grad-animals-batch" style="background:linear-gradient(270deg, #0a0a1a, #1a1a3e)">
                ${animalHtml}
                ${bubbleHtml}
            </div>
        `;
    }, 15000);

    // 第四幕：顶部动物（10秒）
    setTimeout(() => {
        const topAnimals = animals.slice(40, Math.min(60, totalAnimals));
        let animalHtml = topAnimals.map((a, i) => `
            <div class="grad-animal" style="left:${10 + (i / topAnimals.length) * 80}%;top:0;animation-delay:${i * 0.1}s">${a.emoji}</div>
        `).join('');
        const bubbles = ['你是最棒的小柯南！', '谢谢你画出我们！', '鞠躬~', '100'];
        let bubbleHtml = bubbles.map((b, i) => `
            <div class="grad-bubble" style="left:${20 + i * 20}%;top:${30 + i * 10}%;animation-delay:${0.5 + i * 0.3}s">${b}</div>
        `).join('');

        container.innerHTML = `
            <div class="grad-animals-batch" style="background:linear-gradient(0deg, #0a0a1a, #1a1a3e)">
                ${animalHtml}
                ${bubbleHtml}
            </div>
        `;
    }, 25000);

    // 第五幕：左侧+鼓掌（10秒）
    setTimeout(() => {
        const leftAnimals = animals.slice(60, Math.min(80, totalAnimals));
        let animalHtml = leftAnimals.map((a, i) => `
            <div class="grad-animal" style="left:0;top:${10 + (i / leftAnimals.length) * 70}%;animation-delay:${i * 0.1}s">${a.emoji}</div>
        `).join('');
        const bubbles = ['我们全部一起！', '为你鼓掌！', '👏👏👏'];
        let bubbleHtml = bubbles.map((b, i) => `
            <div class="grad-bubble" style="left:${10 + i * 10}%;top:${20 + i * 15}%;animation-delay:${0.5 + i * 0.3}s">${b}</div>
        `).join('');

        container.innerHTML = `
            <div class="grad-animals-batch" style="background:linear-gradient(90deg, #0a0a1a, #1a1a3e)">
                ${animalHtml}
                ${bubbleHtml}
            </div>
        `;
    }, 35000);

    // 第六幕：全场大集合（10秒）
    setTimeout(() => {
        const allAnimals = animals.slice(0, Math.min(totalAnimals, 100));
        let confettiHtml = '';
        const colors = ['#FF6B6B', '#6C5CE7', '#FFD700', '#00B894', '#FF9FF3', '#54A0FF'];
        for (let i = 0; i < 50; i++) {
            const color = colors[i % colors.length];
            const left = Math.random() * 100;
            const delay = Math.random() * 3;
            confettiHtml += `<div class="grad-confetti" style="left:${left}%;background:${color};animation-delay:${delay}s"></div>`;
        }

        let animalFinaleHtml = allAnimals.slice(0, 60).map((a, i) => {
            const angle = (i / 60) * Math.PI * 2;
            const rx = 40 + Math.cos(angle) * 30;
            const ry = 40 + Math.sin(angle) * 30;
            return `<div style="position:absolute;left:${rx}%;top:${ry}%;font-size:24px;transform:translate(-50%,-50%);animation:stickerDance ${1 + Math.random()}s ease infinite">${a.emoji}</div>`;
        }).join('');

        container.innerHTML = `
            <div class="grad-grand-finale" style="background:radial-gradient(circle, rgba(255,215,0,0.3), #0a0a1a)">
                ${confettiHtml}
                ${animalFinaleHtml}
                <div class="grad-finale-text" style="position:absolute;top:15%;z-index:10">
                    🎉 恭喜你！<br>100天侦探之旅完成！
                </div>
                <div class="grad-heart-formation">
                    <div class="grad-heart-center">100</div>
                </div>
            </div>
        `;
        showSFX('100天侦探之旅完成！', '🎉');
    }, 45000);

    // 第七幕：奖状（5秒）
    setTimeout(() => {
        const familyAvatars = AppState.familyMembers.map(m =>
            MEMBER_EMOJIS[m.role] || '🧑'
        ).join('');

        container.innerHTML = `
            <div class="grad-certificate">
                <div class="certificate-card">
                    <div class="cert-title">🏆 荣誉奖状</div>
                    <div class="cert-recipient">授予 ${AppState.childName}</div>
                    <div class="cert-content">
                        圆满完成100天家庭侦探之旅<br>
                        你已经是最棒的小柯南！
                    </div>
                    <div class="cert-family">${familyAvatars}</div>
                    <div class="cert-actions">
                        <button class="cert-btn" onclick="saveCertificate()">📷 保存到相册</button>
                        <button class="cert-btn" onclick="window.print()">🖨️ 打印奖状</button>
                    </div>
                </div>
            </div>
        `;
    }, 55000);

    // 第八幕：落幕（5秒）
    setTimeout(() => {
        container.innerHTML = `
            <div class="grad-epilogue">
                <div class="grad-epilogue-text">
                    这100天，你让家里每个人都更温暖了。
                </div>
                <div class="grad-final-message">
                    🔍 任务完成。回家去吧。
                </div>
            </div>
        `;
    }, 60000);
}

function saveCertificate() {
    showModal('提示', '请截图保存奖状！', [{ text: '好的', primary: true }]);
}

// ============================================
// 主界面事件绑定
// ============================================
function initHomeActions() {
    document.getElementById('btn-go-draw').addEventListener('click', () => {
        DrawSystem.enter();
    });
}

// ============================================
// 应用初始化
// ============================================
function init() {
    loadState();

    if (AppState.initialized) {
        AppState.currentDay = calcCurrentDay();
        resetTodayDrawings();
    }

    initWelcome();
    initMysterySystem();
    DrawSystem.init();
    PatternDetector.init();
    initParentBackend();
    initHomeActions();
    StickerBorder.init();

    // 窗口大小变化时重新渲染贴纸
    window.addEventListener('resize', () => StickerBorder.renderAll());

    // 如果已初始化，直接显示欢迎页（点击开始后进入主页）
    if (AppState.initialized) {
        showScreen('screen-welcome');
    } else {
        showScreen('screen-welcome');
    }
}

// 启动
document.addEventListener('DOMContentLoaded', init);
