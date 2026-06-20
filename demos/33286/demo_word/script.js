// 艾宾浩斯遗忘曲线复习间隔（分钟）
const EBBINGHAUS_INTERVALS = [1, 5, 15, 30, 60, 120, 180, 360, 720, 1440, 2880, 4320, 5760, 7200];

// 单词数据结构
const wordData = [
    { word: 'abandon', phonetic: '/əˈbændən/', meaning: 'v. 放弃，抛弃；n. 放任，纵情', example: 'They had to abandon their lands to the invading forces.', exampleCn: '他们不得不把土地丢给入侵的军队。', tag: 'CET-4', status: 'mastered', reviewCount: 5, nextReview: Date.now() + 86400000 },
    { word: 'ability', phonetic: '/əˈbɪləti/', meaning: 'n. 能力，才能', example: 'She has the ability to learn languages quickly.', exampleCn: '她有快速学习语言的能力。', tag: 'CET-4', status: 'learning', reviewCount: 2, nextReview: Date.now() - 3600000 },
    { word: 'absence', phonetic: '/ˈæbsəns/', meaning: 'n. 缺席，不在', example: 'His absence from the meeting was noticed.', exampleCn: '他没来开会引起了注意。', tag: 'CET-4', status: 'new', reviewCount: 0, nextReview: null },
    { word: 'absolute', phonetic: '/ˈæbsəluːt/', meaning: 'adj. 绝对的，完全的', example: 'There is no absolute truth in this matter.', exampleCn: '这件事没有绝对的真相。', tag: 'CET-6', status: 'mastered', reviewCount: 4, nextReview: Date.now() + 172800000 },
    { word: 'absorb', phonetic: '/əbˈsɔːrb/', meaning: 'v. 吸收，吸引', example: 'Plants absorb carbon dioxide from the air.', exampleCn: '植物从空气中吸收二氧化碳。', tag: 'CET-4', status: 'learning', reviewCount: 1, nextReview: Date.now() - 7200000 },
    { word: 'abstract', phonetic: '/ˈæbstrækt/', meaning: 'adj. 抽象的；n. 摘要', example: 'This is an abstract concept.', exampleCn: '这是一个抽象概念。', tag: 'CET-6', status: 'new', reviewCount: 0, nextReview: null },
    { word: 'academic', phonetic: '/ˌækəˈdemɪk/', meaning: 'adj. 学术的；n. 学者', example: 'She has an academic background in physics.', exampleCn: '她有物理学的学术背景。', tag: 'CET-4', status: 'new', reviewCount: 0, nextReview: null },
    { word: 'accept', phonetic: '/əkˈsept/', meaning: 'v. 接受，认可', example: 'He accepted the job offer.', exampleCn: '他接受了这份工作邀请。', tag: 'CET-4', status: 'learning', reviewCount: 3, nextReview: Date.now() - 1800000 },
    { word: 'access', phonetic: '/ˈækses/', meaning: 'n. 通道，入口；v. 访问', example: 'The access to the building is restricted.', exampleCn: '进入大楼的通道受限。', tag: 'CET-4', status: 'mastered', reviewCount: 6, nextReview: Date.now() + 259200000 },
    { word: 'accident', phonetic: '/ˈæksɪdənt/', meaning: 'n. 事故，意外', example: 'He was injured in a car accident.', exampleCn: '他在一场车祸中受伤了。', tag: 'CET-4', status: 'new', reviewCount: 0, nextReview: null },
    { word: 'accompany', phonetic: '/əˈkʌmpəni/', meaning: 'v. 陪伴，伴随', example: 'She accompanied him to the doctor.', exampleCn: '她陪他去看医生。', tag: 'CET-6', status: 'new', reviewCount: 0, nextReview: null },
    { word: 'accomplish', phonetic: '/əˈkɑːmplɪʃ/', meaning: 'v. 完成，实现', example: 'We accomplished our goal ahead of schedule.', exampleCn: '我们提前完成了目标。', tag: 'CET-6', status: 'learning', reviewCount: 2, nextReview: Date.now() - 5400000 },
    { word: 'according', phonetic: '/əˈkɔːrdɪŋ/', meaning: 'prep. 根据，按照', example: 'According to the report, sales increased.', exampleCn: '根据报告，销售额有所增长。', tag: 'CET-4', status: 'mastered', reviewCount: 4, nextReview: Date.now() + 86400000 },
    { word: 'account', phonetic: '/əˈkaʊnt/', meaning: 'n. 账户，账目；v. 解释', example: 'I opened a bank account yesterday.', exampleCn: '我昨天开了一个银行账户。', tag: 'CET-4', status: 'learning', reviewCount: 1, nextReview: Date.now() - 900000 },
    { word: 'accurate', phonetic: '/ˈækjərət/', meaning: 'adj. 准确的，精确的', example: 'Please provide accurate information.', exampleCn: '请提供准确的信息。', tag: 'CET-4', status: 'new', reviewCount: 0, nextReview: null },
    { word: 'achieve', phonetic: '/əˈtʃiːv/', meaning: 'v. 实现，达到', example: 'She achieved her dream of becoming a doctor.', exampleCn: '她实现了当医生的梦想。', tag: 'CET-4', status: 'learning', reviewCount: 3, nextReview: Date.now() - 2700000 },
    { word: 'acquire', phonetic: '/əˈkwaɪər/', meaning: 'v. 获得，取得', example: 'He acquired a new skill.', exampleCn: '他获得了一项新技能。', tag: 'CET-6', status: 'new', reviewCount: 0, nextReview: null },
    { word: 'across', phonetic: '/əˈkrɔːs/', meaning: 'prep. 穿过；adv. 横过', example: 'She walked across the street.', exampleCn: '她穿过街道。', tag: 'CET-4', status: 'mastered', reviewCount: 5, nextReview: Date.now() + 172800000 },
    { word: 'action', phonetic: '/ˈækʃən/', meaning: 'n. 行动，动作', example: 'We need to take action immediately.', exampleCn: '我们需要立即采取行动。', tag: 'CET-4', status: 'mastered', reviewCount: 6, nextReview: Date.now() + 259200000 },
    { word: 'active', phonetic: '/ˈæktɪv/', meaning: 'adj. 积极的，活跃的', example: 'She leads an active lifestyle.', exampleCn: '她过着积极的生活方式。', tag: 'CET-4', status: 'learning', reviewCount: 2, nextReview: Date.now() - 4500000 },
];

// 当前学习状态
let currentLearnIndex = 0;
let currentReviewIndex = 0;
let reviewWords = [];
let learnWords = [];

// DOM元素
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const learnWordEl = document.getElementById('learn-word');
const learnTranslationEl = document.getElementById('learn-translation');
const knowBtn = document.getElementById('know-btn');
const fuzzyBtn = document.getElementById('fuzzy-btn');
const unknownBtn = document.getElementById('unknown-btn');
const reviewWordEl = document.getElementById('review-word');
const reviewAnswerEl = document.getElementById('review-answer');
const reviewActionsEl = document.getElementById('review-actions');
const revealBtn = document.getElementById('reveal-btn');
const searchInput = document.getElementById('search-input');
const wordList = document.getElementById('word-list');
const newWordInput = document.getElementById('new-word');
const newMeaningInput = document.getElementById('new-meaning');
const addBtn = document.querySelector('.add-btn');
const filterBtns = document.querySelectorAll('.filter-btn');

// 初始化
function init() {
    // 获取待学习和待复习的单词
    learnWords = wordData.filter(w => w.status === 'new').slice(0, 20);
    reviewWords = wordData.filter(w => w.status !== 'new' && w.nextReview && Date.now() >= w.nextReview);
    
    // 更新复习数量
    document.querySelector('.count-num').textContent = reviewWords.length;
    
    // 显示第一个学习单词
    showLearnWord();
    
    // 显示第一个复习单词
    if (reviewWords.length > 0) {
        showReviewWord();
    }
}

// 显示学习单词
function showLearnWord() {
    if (currentLearnIndex >= learnWords.length) {
        alert('今日新词已学完！');
        return;
    }
    
    const word = learnWords[currentLearnIndex];
    learnWordEl.textContent = word.word;
    learnTranslationEl.textContent = word.meaning;
    
    // 更新进度
    const progress = ((currentLearnIndex + 1) / learnWords.length * 100).toFixed(0);
    document.querySelector('.progress-fill').style.width = `${progress}%`;
    document.querySelector('.progress-text').textContent = `今日已学 ${currentLearnIndex + 1}/${learnWords.length} 词`;
    document.querySelector('.word-number').textContent = `${currentLearnIndex + 1}/${learnWords.length}`;
    document.querySelector('.word-tag').textContent = word.tag;
}

// 学习反馈处理
function handleLearnFeedback(level) {
    const word = learnWords[currentLearnIndex];
    
    // 根据反馈更新单词状态
    if (level === 'know') {
        // 认识：直接设置较高的复习间隔
        word.status = 'learning';
        word.reviewCount = 1;
        word.nextReview = Date.now() + EBBINGHAUS_INTERVALS[2] * 60000; // 15分钟后复习
    } else if (level === 'fuzzy') {
        // 模糊：设置较短的复习间隔
        word.status = 'learning';
        word.reviewCount = 1;
        word.nextReview = Date.now() + EBBINGHAUS_INTERVALS[0] * 60000; // 1分钟后复习
    } else {
        // 不认识：立即复习
        word.status = 'learning';
        word.reviewCount = 0;
        word.nextReview = Date.now() + EBBINGHAUS_INTERVALS[0] * 60000; // 1分钟后复习
    }
    
    // 移动到下一个单词
    currentLearnIndex++;
    showLearnWord();
}

// 显示复习单词
function showReviewWord() {
    if (currentReviewIndex >= reviewWords.length) {
        alert('今日复习已完成！');
        return;
    }
    
    const word = reviewWords[currentReviewIndex];
    reviewWordEl.textContent = word.word;
    reviewAnswerEl.style.display = 'none';
    reviewActionsEl.style.display = 'none';
    revealBtn.style.display = 'block';
    
    // 更新进度
    document.querySelector('.review-current').textContent = currentReviewIndex + 1;
    document.querySelector('.review-total').textContent = reviewWords.length;
}

// 复习反馈处理
function handleReviewFeedback(level) {
    const word = reviewWords[currentReviewIndex];
    const currentIntervalIndex = Math.min(word.reviewCount, EBBINGHAUS_INTERVALS.length - 1);
    
    if (level === 'know') {
        // 记得很牢：增加复习间隔
        word.reviewCount++;
        const nextIntervalIndex = Math.min(currentIntervalIndex + 1, EBBINGHAUS_INTERVALS.length - 1);
        word.nextReview = Date.now() + EBBINGHAUS_INTERVALS[nextIntervalIndex] * 60000;
        
        // 如果复习次数达到阈值，标记为已掌握
        if (word.reviewCount >= 5) {
            word.status = 'mastered';
        }
    } else if (level === 'fuzzy') {
        // 有点印象：保持当前间隔或稍微缩短
        const nextIntervalIndex = Math.max(currentIntervalIndex - 1, 0);
        word.nextReview = Date.now() + EBBINGHAUS_INTERVALS[nextIntervalIndex] * 60000;
    } else {
        // 完全忘记：重新开始学习
        word.reviewCount = 0;
        word.nextReview = Date.now() + EBBINGHAUS_INTERVALS[0] * 60000;
    }
    
    // 移动到下一个单词
    currentReviewIndex++;
    showReviewWord();
}

// 搜索单词
function searchWords(query) {
    const filtered = wordData.filter(w => 
        w.word.toLowerCase().includes(query.toLowerCase()) ||
        w.meaning.includes(query)
    );
    renderWordList(filtered);
}

// 过滤单词
function filterWords(filter) {
    let filtered;
    switch(filter) {
        case 'new':
            filtered = wordData.filter(w => w.status === 'new');
            break;
        case 'learning':
            filtered = wordData.filter(w => w.status === 'learning');
            break;
        case 'mastered':
            filtered = wordData.filter(w => w.status === 'mastered');
            break;
        default:
            filtered = wordData;
    }
    renderWordList(filtered);
}

// 渲染单词列表
function renderWordList(words) {
    wordList.innerHTML = '';
    words.forEach(word => {
        const item = document.createElement('div');
        item.className = 'word-item';
        item.innerHTML = `
            <div class="word-info">
                <h4 class="word-name">${word.word}</h4>
                <p class="word-meaning">${word.meaning}</p>
            </div>
            <span class="word-status ${word.status}">${getStatusText(word.status)}</span>
        `;
        wordList.appendChild(item);
    });
}

// 获取状态文本
function getStatusText(status) {
    switch(status) {
        case 'new': return '未学习';
        case 'learning': return '学习中';
        case 'mastered': return '已掌握';
        default: return '未知';
    }
}

// 添加新词
function addNewWord() {
    const word = newWordInput.value.trim();
    const meaning = newMeaningInput.value.trim();
    
    if (!word || !meaning) {
        alert('请输入完整的单词和释义');
        return;
    }
    
    const newWord = {
        word: word,
        phonetic: '',
        meaning: meaning,
        example: '',
        exampleCn: '',
        tag: '自定义',
        status: 'new',
        reviewCount: 0,
        nextReview: null
    };
    
    wordData.unshift(newWord);
    learnWords.unshift(newWord);
    
    // 清空输入
    newWordInput.value = '';
    newMeaningInput.value = '';
    
    // 更新词汇库列表
    filterWords(document.querySelector('.filter-btn.active').dataset.filter);
    
    alert('单词添加成功！');
}

// 导航切换
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有活动状态
        navBtns.forEach(b => b.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        
        // 添加当前按钮活动状态
        btn.classList.add('active');
        
        // 显示对应区域
        const sectionId = btn.dataset.section;
        document.getElementById(sectionId).classList.add('active');
        
        // 如果切换到复习页且没有复习单词，自动填充演示数据
        if (sectionId === 'review' && reviewWords.length === 0) {
            reviewWords = wordData.filter(w => w.status !== 'new').slice(0, 5);
            document.querySelector('.count-num').textContent = reviewWords.length;
            showReviewWord();
        }
    });
});

// 学习反馈事件
knowBtn.addEventListener('click', () => handleLearnFeedback('know'));
fuzzyBtn.addEventListener('click', () => handleLearnFeedback('fuzzy'));
unknownBtn.addEventListener('click', () => handleLearnFeedback('unknown'));

// 复习事件
revealBtn.addEventListener('click', () => {
    revealBtn.style.display = 'none';
    reviewAnswerEl.style.display = 'block';
    
    const word = reviewWords[currentReviewIndex];
    document.querySelector('.answer-translation').textContent = word.meaning;
    document.querySelector('.answer-phonetic').textContent = word.phonetic;
    
    setTimeout(() => {
        reviewActionsEl.style.display = 'flex';
    }, 300);
});

document.querySelector('.review-know').addEventListener('click', () => handleReviewFeedback('know'));
document.querySelector('.review-fuzzy').addEventListener('click', () => handleReviewFeedback('fuzzy'));
document.querySelector('.review-forget').addEventListener('click', () => handleReviewFeedback('forget'));

// 搜索事件
searchInput.addEventListener('input', (e) => {
    searchWords(e.target.value);
});

// 过滤事件
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterWords(btn.dataset.filter);
    });
});

// 添加单词事件
addBtn.addEventListener('click', addNewWord);

// 初始化应用
init();