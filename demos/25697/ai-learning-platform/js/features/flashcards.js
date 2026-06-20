// ========== Flashcard System (Spaced Repetition) ==========

// 科目专属知识点卡片库
const subjectKnowledgeCards = {
    '数学': [
        { front: '勾股定理的公式是什么？', back: 'a² + b² = c²（直角三角形中，两条直角边的平方和等于斜边的平方）', difficulty: 'easy' },
        { front: '一元二次方程求根公式', back: 'x = (-b ± √(b²-4ac)) / 2a', difficulty: 'easy' },
        { front: '圆的面积公式', back: 'S = πr²', difficulty: 'easy' },
        { front: '球的体积公式', back: 'V = (4/3)πr³', difficulty: 'easy' },
        { front: '等差数列求和公式', back: 'Sₙ = n(a₁+aₙ)/2 = na₁ + n(n-1)d/2', difficulty: 'medium' },
        { front: '等比数列求和公式', back: 'Sₙ = a₁(1-qⁿ)/(1-q)，q≠1', difficulty: 'medium' },
        { front: 'sin30°等于多少？', back: 'sin30° = 1/2', difficulty: 'easy' },
        { front: 'log₂(8)等于多少？', back: 'log₂(8) = 3，因为2³=8', difficulty: 'easy' },
        { front: '排列数公式', back: 'A(n,m) = n!/(n-m)!', difficulty: 'medium' },
        { front: '组合数公式', back: 'C(n,m) = n!/(m!(n-m)!)', difficulty: 'medium' }
    ],
    '英语': [
        { front: '现在完成时的结构', back: 'have/has + 过去分词\n例：I have finished my homework.', difficulty: 'easy' },
        { front: '定语从句中which和who的区别', back: 'which指物，who指人\n例：The book which I bought / The man who helped me', difficulty: 'medium' },
        { front: '虚拟语气if从句的时态', back: '与现在事实相反：if + 过去式, would + 动词原形\n与过去事实相反：if + had done, would have done', difficulty: 'hard' },
        { front: '常见不可数名词', back: 'advice, news, information, furniture, homework, equipment, luggage, weather', difficulty: 'easy' },
        { front: '动词不定式作目的状语', back: 'To + 动词原形，放在句首或句末\n例：I went to the library to study.', difficulty: 'medium' },
        { front: '被动语态的结构', back: 'be + 过去分词\n一般现在时：am/is/are + done\n一般过去时：was/were + done', difficulty: 'medium' }
    ],
    '语文': [
        { front: '《静夜思》的作者是谁？', back: '李白（唐代）\n床前明月光，疑是地上霜。举头望明月，低头思故乡。', difficulty: 'easy' },
        { front: '"的、地、得"的用法区别', back: '的+名词：美丽的花\n地+动词：慢慢地走\n得+动词/形容词：跑得快', difficulty: 'easy' },
        { front: '比喻和拟人的区别', back: '比喻：用相似事物打比方（明喻/暗喻/借喻）\n拟人：把事物当作人来写（赋予人的动作/情感）', difficulty: 'medium' },
        { front: '议论文三要素', back: '论点、论据、论证', difficulty: 'easy' },
        { front: '常见修辞手法', back: '比喻、拟人、夸张、排比、对偶、反复、设问、反问、借代、对比', difficulty: 'medium' },
        { front: '文言文常见虚词"之"的用法', back: '1.结构助词"的" 2.代词"他/它" 3.动词"去/往" 4.助词"无义"', difficulty: 'hard' }
    ],
    '物理': [
        { front: '牛顿第二定律', back: 'F = ma（力=质量×加速度）', difficulty: 'easy' },
        { front: '万有引力公式', back: 'F = G·m₁m₂/r²（G=6.67×10⁻¹¹ N·m²/kg²）', difficulty: 'medium' },
        { front: '欧姆定律', back: 'U = IR（电压=电流×电阻）', difficulty: 'easy' },
        { front: '功的公式', back: 'W = Fs = Fscosθ（力×位移×夹角余弦）', difficulty: 'medium' },
        { front: '动能公式', back: 'Eₖ = ½mv²', difficulty: 'easy' },
        { front: '光的折射定律', back: 'n₁sinθ₁ = n₂sinθ₂（斯涅尔定律）', difficulty: 'hard' }
    ],
    '化学': [
        { front: '水的化学式', back: 'H₂O（由2个氢原子和1个氧原子组成）', difficulty: 'easy' },
        { front: '常见酸的化学式', back: '盐酸HCl、硫酸H₂SO₄、硝酸HNO₃、碳酸H₂CO₃', difficulty: 'easy' },
        { front: '质量守恒定律', back: '化学反应前后，物质总质量不变\n即：反应物总质量 = 生成物总质量', difficulty: 'medium' },
        { front: '摩尔质量的定义', back: '1摩尔物质的质量，单位g/mol\n例：H₂O的摩尔质量=18g/mol', difficulty: 'medium' },
        { front: '化学方程式配平原则', back: '1.原子种类不变 2.原子数目不变 3.电荷守恒', difficulty: 'hard' },
        { front: '常见氧化还原反应', back: '铁在氧气中燃烧：3Fe + 2O₂ → Fe₃O₄\n铁与硫酸铜：Fe + CuSO₄ → FeSO₄ + Cu', difficulty: 'hard' }
    ],
    '生物': [
        { front: '细胞的基本结构', back: '细胞膜、细胞质、细胞核\n植物细胞还有：细胞壁、叶绿体、液泡', difficulty: 'easy' },
        { front: '光合作用的总反应式', back: '6CO₂ + 6H₂O →(光照/叶绿体) C₆H₁₂O₆ + 6O₂', difficulty: 'medium' },
        { front: 'DNA的全称', back: '脱氧核糖核酸（Deoxyribonucleic Acid）\n双螺旋结构，由沃森和克里克发现', difficulty: 'easy' },
        { front: '有丝分裂的四个时期', back: '前期→中期→后期→末期\n特征：前期染色质→染色体，末期细胞质分裂', difficulty: 'hard' },
        { front: '孟德尔分离定律', back: '一对等位基因在形成配子时彼此分离\nF₂代性状分离比 3:1', difficulty: 'hard' }
    ],
    '历史': [
        { front: '中国第一个统一的封建王朝', back: '秦朝（公元前221年）\n建立者：秦始皇嬴政', difficulty: 'easy' },
        { front: '辛亥革命的年份', back: '1911年\n领导者：孙中山\n意义：推翻了清朝统治，结束了两千多年的封建帝制', difficulty: 'medium' },
        { front: '文艺复兴起源于哪个国家', back: '意大利（14世纪）\n核心思想：人文主义', difficulty: 'easy' },
        { front: '第一次世界大战的时间', back: '1914年-1918年\n导火索：萨拉热窝事件', difficulty: 'easy' },
        { front: '唐朝的开国皇帝', back: '李渊（618年建立唐朝）\n唐太宗李世民开创"贞观之治"', difficulty: 'medium' }
    ],
    '地理': [
        { front: '世界最大的大洋', back: '太平洋（面积约1.8亿平方公里）', difficulty: 'easy' },
        { front: '世界最高的山峰', back: '珠穆朗玛峰（8848.86米）\n位于中国与尼泊尔边境', difficulty: 'easy' },
        { front: '中国的四大高原', back: '青藏高原、内蒙古高原、黄土高原、云贵高原', difficulty: 'easy' },
        { front: '赤道的长度', back: '约40075公里（地球周长）', difficulty: 'easy' },
        { front: '地球自转一周的时间', back: '约24小时（23小时56分4秒为恒星日）', difficulty: 'medium' }
    ]
};

function loadSubjectCards(subject) {
    if (!subjectKnowledgeCards[subject]) {
        showToast('warning', '该科目暂无预置知识点卡片');
        return 0;
    }
    const cards = FlashcardManager.getCards();
    const existingFronts = new Set(cards.map(c => c.front));
    let count = 0;
    subjectKnowledgeCards[subject].forEach(item => {
        if (!existingFronts.has(item.front)) {
            FlashcardManager.createFlashcardSilent(subject, item.front, item.back, item.difficulty || 'medium');
            count++;
        }
    });
    if (count > 0) {
        FlashcardManager.save();
        FlashcardManager.renderCards();
        FlashcardManager.updateStats();
        showToast('success', '已导入' + subject + '知识点卡片' + count + '张');
    } else {
        showToast('info', subject + '知识点卡片已全部导入');
    }
    return count;
}

function showSubjectCardImporter() {
    // 已废弃：改为使用 toggleSubjectLibrary() 在页面内显示
    toggleSubjectLibrary();
}

function toggleSubjectLibrary() {
    const container = document.getElementById('subjectCardLibrary');
    if (!container) return;
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'block';
        renderSubjectCardLibrary();
    } else {
        container.style.display = 'none';
    }
}

function renderSubjectCardLibrary() {
    const container = document.getElementById('subjectCardLibrary');
    if (!container) return;

    const subjects = Object.keys(subjectKnowledgeCards);
    const cards = FlashcardManager.getCards();
    const existingFronts = new Set(cards.map(c => c.front));

    let html = '<div style="padding:12px 0;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">';
    html += '<h3 style="margin:0;font-size:14px;color:var(--text-primary);"><i class="fas fa-book" style="margin-right:6px;color:var(--primary);"></i>知识点卡片库</h3>';
    html += '<button onclick="toggleSubjectLibrary()" style="padding:4px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:12px;color:var(--text-muted);">收起</button>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;">';
    subjects.forEach(sub => {
        const allCards = subjectKnowledgeCards[sub];
        const imported = allCards.filter(c => existingFronts.has(c.front)).length;
        const remaining = allCards.length - imported;
        const allImported = remaining === 0;
        html += '<button onclick="loadSubjectCards(\'' + sub + '\');renderSubjectCardLibrary();" style="padding:12px 8px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;transition:all 0.2s;text-align:left;' + (allImported ? 'opacity:0.6;' : '') + '" onmouseover="this.style.borderColor=\'var(--primary)\';this.style.background=\'rgba(108,92,231,0.05)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.background=\'var(--bg-card)\'">';
        html += '<div style="font-weight:600;color:var(--text-primary);">' + sub + '</div>';
        html += '<div style="font-size:11px;color:var(--text-muted);">' + allCards.length + '张卡片' + (allImported ? ' (已全部导入)' : ' (可导入' + remaining + '张)') + '</div>';
        html += '</button>';
    });
    html += '</div>';
    html += '</div>';
    container.innerHTML = html;
}

const FlashcardManager = {
    cards: [],
    reviewQueue: [],
    currentReviewIndex: -1,
    isReviewing: false,
    currentFilter: 'all',

    // Spaced repetition intervals (in days) based on rating 1-5
    intervals: { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 },

    getCards() {
        return this.cards;
    },

    load() {
        const key = 'user_' + (state.currentUser?.id || 'guest') + '_flashcards';
        const data = localStorage.getItem(key);
        this.cards = data ? JSON.parse(data) : [];
        this.updateStats();
        this.renderCards();
    },

    save() {
        const key = 'user_' + (state.currentUser?.id || 'guest') + '_flashcards';
        localStorage.setItem(key, JSON.stringify(this.cards));
        this.updateStats();
    },

    createFlashcard(subject, front, back, difficulty) {
        if (!front.trim() || !back.trim()) {
            showToast('warning', '请填写正面和背面内容');
            return false;
        }
        const card = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            subject: subject,
            front: front.trim(),
            back: back.trim(),
            difficulty: difficulty || 'medium',
            createdAt: Date.now(),
            nextReview: Date.now(),
            interval: 0,
            rating: 0,
            reviewCount: 0,
            mastered: false
        };
        this.cards.push(card);
        this.save();
        this.renderCards();
        showToast('success', '卡片创建成功！');
        return true;
    },

    flipCard(id) {
        const cardEl = document.getElementById('reviewCard');
        if (cardEl) {
            cardEl.classList.toggle('flipped');
        }
    },

    rateCard(id, rating) {
        const card = this.cards.find(c => c.id === id);
        if (!card) return;

        card.rating = rating;
        card.reviewCount++;
        card.interval = this.intervals[rating] || 7;
        card.nextReview = Date.now() + card.interval * 24 * 60 * 60 * 1000;

        // Mark as mastered if rated 4+ and reviewed at least 3 times
        if (rating >= 4 && card.reviewCount >= 3) {
            card.mastered = true;
        } else {
            card.mastered = false;
        }

        this.save();
        this.renderCards();

        // Move to next card in review
        this.showNextReviewCard();
    },

    // 标记为已掌握（独立于评分）
    markAsMastered(id) {
        const card = this.cards.find(c => c.id === id);
        if (!card) return;
        card.mastered = !card.mastered;
        if (card.mastered) {
            card.nextReview = Date.now() + 365 * 24 * 60 * 60 * 1000; // 设为很久以后
            showToast('success', '已标记为已掌握！');
        } else {
            card.nextReview = Date.now();
            showToast('success', '已取消掌握标记，将重新进入复习');
        }
        this.save();
        this.renderCards();
    },

    getDueCards() {
        const now = Date.now();
        return this.cards.filter(c => c.nextReview <= now && !c.mastered);
    },

    startReview() {
        this.reviewQueue = this.getDueCards();
        if (this.reviewQueue.length === 0) {
            showToast('info', '没有待复习的卡片！');
            return;
        }
        this.isReviewing = true;
        this.currentReviewIndex = 0;
        document.getElementById('flashcardReviewArea').style.display = 'block';
        this.showCurrentReviewCard();
    },

    showCurrentReviewCard() {
        if (this.currentReviewIndex >= this.reviewQueue.length) {
            this.endReview();
            return;
        }
        const card = this.reviewQueue[this.currentReviewIndex];
        const frontEl = document.getElementById('reviewCardFront');
        const backEl = document.getElementById('reviewCardBack');
        const cardEl = document.getElementById('reviewCard');

        if (frontEl) frontEl.textContent = card.front;
        if (backEl) backEl.textContent = card.back;
        if (cardEl) cardEl.classList.remove('flipped');
    },

    showNextReviewCard() {
        this.currentReviewIndex++;
        if (this.currentReviewIndex >= this.reviewQueue.length) {
            this.endReview();
        } else {
            this.showCurrentReviewCard();
        }
    },

    endReview() {
        this.isReviewing = false;
        document.getElementById('flashcardReviewArea').style.display = 'none';
        showToast('success', '复习完成！共复习 ' + this.reviewQueue.length + ' 张卡片');
        this.reviewQueue = [];
        this.currentReviewIndex = -1;
    },

    deleteCard(id) {
        this.cards = this.cards.filter(c => c.id !== id);
        this.save();
        this.renderCards();
        showToast('success', '卡片已删除');
    },

    updateStats() {
        const totalEl = document.getElementById('totalFlashcards');
        const dueEl = document.getElementById('dueFlashcards');
        const masteredEl = document.getElementById('masteredFlashcards');
        const learningEl = document.getElementById('learningFlashcards');
        if (totalEl) totalEl.textContent = this.cards.length;
        if (dueEl) dueEl.textContent = this.getDueCards().length;
        if (masteredEl) masteredEl.textContent = this.cards.filter(c => c.mastered).length;
        if (learningEl) learningEl.textContent = this.cards.filter(c => !c.mastered).length;
    },

    getFilteredCards() {
        if (this.currentFilter === 'due') return this.getDueCards();
        if (this.currentFilter === 'mastered') return this.cards.filter(c => c.mastered);
        if (this.currentFilter === 'learning') return this.cards.filter(c => !c.mastered);
        return this.cards;
    },

    renderCards() {
        const container = document.getElementById('flashcardCards');
        const emptyEl = document.getElementById('emptyFlashcards');
        if (!container) return;

        const filtered = this.getFilteredCards();
        if (filtered.length === 0) {
            container.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        let html = '';
        filtered.forEach(card => {
            const nextDate = new Date(card.nextReview);
            const isDue = card.nextReview <= Date.now();
            const statusText = card.mastered ? '<span style="color:var(--success);">已掌握</span>' :
                               isDue ? '<span style="color:var(--accent);">待复习</span>' :
                               '<span style="color:var(--text-muted);">' + nextDate.toLocaleDateString('zh-CN') + '</span>';

            const masteredBtnClass = card.mastered ? 'btn-sm btn-primary' : 'btn-sm btn-secondary';
            const masteredBtnText = card.mastered ? '重新复习' : '标记为已掌握';

            const difficultyLabels = { easy: '简单', medium: '中等', hard: '困难' };
            const difficulty = card.difficulty || 'medium';
            const diffLabel = difficultyLabels[difficulty] || '中等';

            html += '<div class="error-card" style="border-left:3px solid var(--primary);position:relative;" ondblclick="FlashcardManager.flipCard(\'' + card.id + '\')">' +
                '<button class="flashcard-delete-btn" onclick="event.stopPropagation();FlashcardManager.deleteCard(\'' + card.id + '\')" title="删除"><i class="fas fa-times"></i></button>' +
                '<div class="error-card-header">' +
                '<span class="error-card-subject">' + card.subject + '</span>' +
                '<span class="card-difficulty ' + difficulty + '">' + diffLabel + '</span>' +
                statusText +
                '</div>' +
                '<div class="error-card-question" style="text-align:center;">' + escapeHtml(card.front) + '</div>' +
                '<div class="error-card-answer" style="display:none;text-align:center;">' + escapeHtml(card.back) + '</div>' +
                '<div class="error-card-actions">' +
                '<button class="btn-sm btn-secondary" onclick="event.stopPropagation();this.closest(\'.error-card\').querySelector(\'.error-card-answer\').style.display=this.closest(\'.error-card\').querySelector(\'.error-card-answer\').style.display===\'none\'?\'block\':\'none\'">查看答案</button>' +
                '<button class="' + masteredBtnClass + '" onclick="event.stopPropagation();FlashcardManager.markAsMastered(\'' + card.id + '\')">' + masteredBtnText + '</button>' +
                '</div></div>';
        });
        container.innerHTML = html;
    },

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderCards();
    },

    // 从聊天记录批量导入知识点为闪卡
    importFromChat() {
        const history = state.chatHistories[state.currentSubject] || [];
        if (history.length === 0) {
            showToast('warning', '当前科目没有聊天记录可以导入');
            return;
        }

        // 提取AI回答中的知识点
        let importCount = 0;
        const subjectName = getCurrentSubjectNameForFlashcard() || '通用';

        history.forEach(function(msg) {
            if (msg.type === 'ai' && msg.text && msg.text.length > 20 && msg.text.length < 500) {
                // 检查是否已存在相似的卡片
                const exists = FlashcardManager.cards.some(function(c) {
                    return c.front === msg.text.substring(0, 50) || c.back === msg.text.substring(0, 100);
                });
                if (!exists) {
                    // 从AI回答中提取简短的问题和答案
                    const question = msg.originalQuestion || '知识点 #' + (importCount + 1);
                    const answer = msg.text.substring(0, 200);
                    if (question.length > 0 && answer.length > 10) {
                        FlashcardManager.createFlashcardSilent(subjectName, question, answer);
                        importCount++;
                    }
                }
            }
        });

        if (importCount > 0) {
            FlashcardManager.save();
            FlashcardManager.renderCards();
            showToast('success', '已从聊天记录导入 ' + importCount + ' 张卡片！');
        } else {
            showToast('info', '没有找到可以导入的新知识点');
        }
    },

    // 静默创建卡片（不弹toast）
    createFlashcardSilent(subject, front, back, difficulty) {
        if (!front.trim() || !back.trim()) return false;
        const card = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + Math.random().toString(36).substr(2, 3),
            subject: subject,
            front: front.trim(),
            back: back.trim(),
            difficulty: difficulty || 'medium',
            createdAt: Date.now(),
            nextReview: Date.now(),
            interval: 0,
            rating: 0,
            reviewCount: 0,
            mastered: false
        };
        this.cards.push(card);
        return true;
    }
};

// UI Functions
function createFlashcardUI() {
    const subject = document.getElementById('flashcardSubject').value;
    const front = document.getElementById('flashcardFront').value;
    const back = document.getElementById('flashcardBack').value;
    const difficulty = document.getElementById('flashcardDifficulty') ? document.getElementById('flashcardDifficulty').value : 'medium';
    if (FlashcardManager.createFlashcard(subject, front, back, difficulty)) {
        document.getElementById('flashcardFront').value = '';
        document.getElementById('flashcardBack').value = '';
    }
}

function startReviewFlashcards() {
    FlashcardManager.startReview();
}

function flipReviewCard() {
    FlashcardManager.flipCard();
}

function rateReviewCard(rating) {
    if (FlashcardManager.reviewQueue.length === 0) return;
    const card = FlashcardManager.reviewQueue[FlashcardManager.currentReviewIndex];
    if (card) {
        FlashcardManager.rateCard(card.id, rating);
    }
}

function filterFlashcards(filter) {
    const btns = document.querySelectorAll('#flashcardFilters .error-filter');
    btns.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    FlashcardManager.setFilter(filter);
}

function importFlashcardsFromChat() {
    FlashcardManager.importFromChat();
}

function getCurrentSubjectNameForFlashcard() {
    if (!state.currentSubject) return '通用';
    const items = state.role === 'student' ? state.subjects : state.projects;
    const item = items.find(i => i.id === state.currentSubject);
    return item ? item.name : '通用';
}

// Load flashcards on init
document.addEventListener('DOMContentLoaded', function() {
    FlashcardManager.load();
});
