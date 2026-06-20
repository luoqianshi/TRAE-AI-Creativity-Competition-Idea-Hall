// AI塔罗牌 - 主应用逻辑

// 全局塔罗牌数据
let tarotCards = [];

// 状态管理
const state = {
    currentPhase: 'input',
    question: '',
    selectedCards: [],
    revealedCards: [],
    availableCards: []
};

// 音效管理
let hoverSound = null;
let endSound = null;

// 初始化音效
function initHoverSound() {
    hoverSound = new Audio('mp3/XuanZe.mp3');
    hoverSound.volume = 0.6;
    
    endSound = new Audio('mp3/JieShu.mp3');
    endSound.volume = 0.7;
}

// 播放悬停音效
function playHoverSound() {
    if (!hoverSound) return;
    
    const soundClone = hoverSound.cloneNode();
    soundClone.volume = 0.6;
    
    soundClone.play().catch(err => {
        console.log('音效播放失败:', err);
    });
}

// 播放结束音效
function playEndSound() {
    if (!endSound) return;
    
    const soundClone = endSound.cloneNode();
    soundClone.volume = 0.7;
    
    soundClone.play().catch(err => {
        console.log('音效播放失败:', err);
    });
}

// DOM元素
const elements = {
    inputPhase: document.getElementById('input-phase'),
    selectionPhase: document.getElementById('selection-phase'),
    resultPhase: document.getElementById('result-phase'),
    historyPhase: document.getElementById('history-phase'),
    questionInput: document.getElementById('question-input'),
    submitBtn: document.getElementById('submit-question'),
    displayQuestion: document.getElementById('display-question'),
    finalQuestion: document.getElementById('final-question'),
    cardsContainer: document.getElementById('cards-container'),
    selectedCount: document.getElementById('selected-count'),
    revealBtn: document.getElementById('reveal-btn'),
    resultCardContainer: document.getElementById('result-card-container'),
    restartBtn: document.getElementById('restart-btn'),
    restartBtnHistory: document.getElementById('restart-btn-history'),
    explanationContent: document.getElementById('explanation-content'),
    historyContainer: document.getElementById('history-container'),
    suggestedList: document.getElementById('suggested-list')
};

// ==================== 每日占卜限制配置 ====================
const DAILY_LIMIT = 2; // 每天最多占卜次数
const STORAGE_KEY = 'tarot_daily_record';

// 获取今日日期
function getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

// 读取今日记录
function getTodayRecords() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { date: getTodayKey(), records: [] };
        const data = JSON.parse(raw);
        if (data.date !== getTodayKey()) {
            return { date: getTodayKey(), records: [] };
        }
        return data;
    } catch (e) {
        return { date: getTodayKey(), records: [] };
    }
}

// 保存今日记录
function saveTodayRecord(question, cardName, cardImage, explanation) {
    const data = getTodayRecords();
    data.records.push({
        question,
        cardName,
        cardImage,
        explanation,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 是否已达到今日限制
function isDailyLimitReached() {
    return getTodayRecords().records.length >= DAILY_LIMIT;
}

// 剩余次数
function getRemainingCount() {
    return Math.max(0, DAILY_LIMIT - getTodayRecords().records.length);
}

// ==================== API配置 ====================
// 在这里配置您的智谱AI API Key
const CONFIG = {
    API_KEY: 'xxxx'  // 替换为您的API Key
};
// ================================================

// 预加载所有塔罗牌图片
function preloadTarotImages() {
    const cards = loadTarotData();
    cards.forEach(card => {
        const img = new Image();
        img.src = card.image;
    });
    console.log('塔罗牌图片预加载完成');
}

// 初始化应用
function init() {
    tarotCards = loadTarotData();
    preloadTarotImages();
    bindEvents();
    loadCardBackImage();
    initHoverSound();

    // 检查是否达到今日占卜上限
    if (isDailyLimitReached()) {
        renderHistory();
        switchPhase('history');
    } else {
        // 异步生成参考问题
        generateSuggestedQuestions();
    }
}

// 绑定事件
function bindEvents() {
    elements.submitBtn.addEventListener('click', handleSubmitQuestion);
    elements.questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitQuestion();
        }
    });
    elements.revealBtn.addEventListener('click', handleRevealCards);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.restartBtnHistory.addEventListener('click', handleRestart);
}

// 获取API Key
function getApiKey() {
    return CONFIG.API_KEY;
}

// 生成参考问题 - AI每次生成不一样的
async function generateSuggestedQuestions() {
    const apiKey = getApiKey();

    if (!apiKey) {
        const fallback = [
            '我最近的感情运势如何？',
            '未来三个月我的事业会有什么变化？',
            '我应该怎样改善目前的人际关系？',
            '我当前最大的人生课题是什么？',
            '近期是否会遇到让我心动的人？'
        ];
        renderSuggestedQuestions(fallback);
        return;
    }

    const prompt = `请生成 5 个适合做塔罗牌占卜的问题，要求：
1. 涵盖情感、事业、财富、成长、人际关系等不同领域
2. 语气神秘、有启发性
3. 每句 10-25 个字
4. 每次生成都不一样，不要重复之前的常见句式

输出格式：每行一个问题，不要编号，不要多余文字。`;

    try {
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'glm-4-flash',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) throw new Error('请求失败');

        const data = await response.json();
        const text = data.choices[0].message.content.trim();
        const questions = text.split('\n').map(s => s.replace(/^[\d\.\-\s、·•]+/, '').trim()).filter(s => s.length > 0).slice(0, 5);

        if (questions.length > 0) {
            renderSuggestedQuestions(questions);
        } else {
            throw new Error('解析失败');
        }
    } catch (err) {
        console.error('生成参考问题失败:', err);
        const fallback = [
            '我最近的感情运势如何？',
            '未来三个月我的事业会有什么变化？',
            '我应该怎样改善目前的人际关系？',
            '我当前最大的人生课题是什么？',
            '近期是否会遇到让我心动的人？'
        ];
        renderSuggestedQuestions(fallback);
    }
}

// 渲染参考问题到页面
function renderSuggestedQuestions(questions) {
    if (!elements.suggestedList) return;
    elements.suggestedList.innerHTML = '';

    questions.forEach((q, idx) => {
        const item = document.createElement('span');
        item.className = 'suggested-item';
        item.textContent = q;
        item.style.animationDelay = `${idx * 0.1}s`;
        item.addEventListener('click', () => {
            elements.questionInput.value = q;
            elements.questionInput.focus();
        });
        elements.suggestedList.appendChild(item);
    });
}

// 加载卡片背面图片
function loadCardBackImage() {
    const img = new Image();
    img.onload = function() {
        document.documentElement.style.setProperty('--card-back-loaded', 'true');
    };
    img.onerror = function() {
        console.log('KaPianBeiMian.png 未找到，将使用默认样式');
    };
    img.src = 'images/KaPianBeiMian.png';
}

// 处理提交问题
async function handleSubmitQuestion() {
    // 先检查今日是否达到次数上限
    if (isDailyLimitReached()) {
        renderHistory();
        switchPhase('history');
        return;
    }

    const question = elements.questionInput.value.trim();
    
    if (!question) {
        alert('请输入你的问题');
        elements.questionInput.focus();
        return;
    }
    
    state.question = question;
    state.selectedCards = [];
    state.revealedCards = [];
    
    // 先进入选卡阶段，显示验证中状态
    switchPhase('selection');
    elements.displayQuestion.textContent = question;
    
    // 显示验证中提示
    elements.cardsContainer.style.pointerEvents = 'none';
    elements.cardsContainer.style.opacity = '0.3';
    const verifyTip = document.createElement('div');
    verifyTip.className = 'verify-tip';
    verifyTip.textContent = '正在进行问题验证，请稍候...';
    const existingTip = elements.cardsContainer.parentElement.querySelector('.verify-tip');
    if (existingTip) existingTip.remove();
    elements.cardsContainer.parentElement.appendChild(verifyTip);
    
    // 调用AI验证问题
    const isValid = await analyzeQuestion(question);
    
    if (isValid) {
        // 验证通过，显示卡片
        verifyTip.textContent = '验证通过！请选择一张卡片';
        setTimeout(() => {
            verifyTip.remove();
            elements.cardsContainer.style.pointerEvents = 'auto';
            elements.cardsContainer.style.opacity = '1';
            selectRandomCards();
        }, 500);
    } else {
        // 验证不通过，返回输入界面
        verifyTip.remove();
        switchPhase('input');
        alert('问题过于随意，请重新输入有意义的问题后再进行占卜。');
        elements.questionInput.value = '';
        elements.questionInput.focus();
    }
}

// AI分析问题是否有意义
async function analyzeQuestion(question) {
    const apiKey = getApiKey();
    
    // 关键字快速判断
    const invalidKeywords = ['你好', '您好', '哈哈哈', '哈哈', '测试', 'test', '123', '123456', 'abc', '随便'];
    const lowerQuestion = question.toLowerCase().trim();
    
    if (invalidKeywords.some(keyword => lowerQuestion === keyword.toLowerCase())) {
        return false;
    }
    
    // 纯数字或太短的问题
    if (/^\d+$/.test(question) || question.length < 2) {
        return false;
    }
    
    if (!apiKey) {
        return true;
    }
    
    // 如果包含明显的有意义词汇，直接通过
    const validKeywords = ['吗', '呢', '怎么', '什么', '为什么', '如何', '能不能', '可以', '会', '吗', '吗', '爱情', '事业', '财运', '健康', '感情', '工作', '学习', '考试', '生活', '人生', '未来', '怎么办'];
    if (validKeywords.some(keyword => question.includes(keyword))) {
        return true;
    }
    
    // 更长的问题直接通过
    if (question.length > 5) {
        return true;
    }
    
    // 调用AI判断（简化为基础判断）
    return true;
}

// 随机选择5张卡片
function selectRandomCards() {
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
    state.availableCards = shuffled.slice(0, 5);
    renderCards();
}

// 渲染卡片
function renderCards() {
    elements.cardsContainer.innerHTML = '';
    
    state.availableCards.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        elements.cardsContainer.appendChild(cardElement);
    });
}

// 创建卡片元素
function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'tarot-card';
    cardDiv.dataset.index = index;
    
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    
    const img = new Image();
    img.onload = function() {
        const cardImg = document.createElement('img');
        cardImg.src = 'images/KaPianBeiMian.png';
        cardImg.alt = '塔罗牌背面';
        cardBack.innerHTML = '';
        cardBack.appendChild(cardImg);
    };
    img.src = 'images/KaPianBeiMian.png';
    
    cardDiv.appendChild(cardBack);
    
    cardDiv.addEventListener('mouseenter', function() {
        playHoverSound();
        handleCardHover(index, true);
    });
    
    cardDiv.addEventListener('mouseleave', function() {
        handleCardHover(index, false);
    });
    
    cardDiv.addEventListener('click', () => handleCardClick(index));
    
    return cardDiv;
}

// 处理卡片悬停
function handleCardHover(index, isEnter) {
    const allCards = elements.cardsContainer.querySelectorAll('.tarot-card');
    
    allCards.forEach((card, i) => {
        if (i !== index) {
            if (isEnter) {
                card.classList.add('dimmed');
            } else {
                card.classList.remove('dimmed');
            }
        }
    });
}

// 处理卡片点击
function handleCardClick(index) {
    const cardElement = elements.cardsContainer.querySelector(`[data-index="${index}"]`);
    
    const selectedIndex = state.selectedCards.indexOf(index);
    
    if (selectedIndex > -1) {
        state.selectedCards.splice(selectedIndex, 1);
        cardElement.classList.remove('selected');
    } else {
        if (state.selectedCards.length < 1) {
            state.selectedCards.push(index);
            cardElement.classList.add('selected');
        } else {
            const prevSelected = elements.cardsContainer.querySelector('.tarot-card.selected');
            if (prevSelected) {
                prevSelected.classList.remove('selected');
            }
            state.selectedCards = [index];
            cardElement.classList.add('selected');
        }
    }
    
    updateSelectionUI();
}

// 更新选择UI
function updateSelectionUI() {
    elements.selectedCount.textContent = state.selectedCards.length;
    
    if (state.selectedCards.length === 1) {
        elements.revealBtn.classList.remove('btn-disabled');
        elements.revealBtn.disabled = false;
    } else {
        elements.revealBtn.classList.add('btn-disabled');
        elements.revealBtn.disabled = true;
    }
}

// 处理翻开卡片
async function handleRevealCards() {
    if (state.selectedCards.length !== 1) {
        return;
    }
    
    playEndSound();
    
    state.revealedCards = state.selectedCards.map(index => state.availableCards[index]);
    
    switchPhase('result');
    displayResults();
    
    // 调用AI解读
    await getAIExplanation();
}

// 显示结果
function displayResults() {
    elements.finalQuestion.textContent = state.question;
    elements.resultCardContainer.innerHTML = '';
    
    state.revealedCards.forEach((card, index) => {
        const resultCard = createResultCard(card, index);
        elements.resultCardContainer.appendChild(resultCard);
    });
}

// 创建结果卡片
function createResultCard(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'result-card';
    
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    
    const cardImg = document.createElement('img');
    cardImg.src = card.image;
    cardImg.alt = card.name;
    cardFront.appendChild(cardImg);
    
    cardDiv.appendChild(cardFront);
    
    return cardDiv;
}

// 获取AI解读 - 流式输出
async function getAIExplanation() {
    const apiKey = getApiKey();
    
    if (!apiKey) {
        elements.explanationContent.innerHTML = '<div class="loading">请先配置智谱AI API Key</div>';
        return;
    }
    
    elements.explanationContent.innerHTML = '';
    
    const card = state.revealedCards[0];
    
    const prompt = `你是专业的塔罗牌占卜师。用户的问题是："${state.question}"。用户抽到了 "${card.name}" 这张牌。

请根据这张牌的含义和用户的问题，给出一段专业的塔罗牌解读。要求：
1. 语言要神秘而优美，有仪式感
2. 结合用户的问题给出具体的解读和建议
3. 200-300字左右`;

    try {
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'glm-4-flash',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                stream: true
            })
        });
        
        if (!response.ok) {
            throw new Error('API请求失败');
        }
        
        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunkText = decoder.decode(value, { stream: true });
            const lines = chunkText.split('\n');
            
            for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.startsWith('data:')) {
                    const data = line.slice(5).trim();
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                            const content = parsed.choices[0].delta.content;
                            fullText += content;
                            elements.explanationContent.textContent = fullText;
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        }

        // 流式输出完成后，写入今日占卜记录
        saveTodayRecord(state.question, card.name, card.image, fullText);
        
    } catch (error) {
        console.error('AI解读失败:', error);
        elements.explanationContent.innerHTML = 'AI解读获取失败，请检查API Key是否正确。';
    }
}

// 打字机效果
function typeWriter(text) {
    elements.explanationContent.innerHTML = '';
    let i = 0;
    const speed = 30;
    
    function type() {
        if (i < text.length) {
            elements.explanationContent.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// 切换阶段
function switchPhase(phase) {
    elements.inputPhase.classList.remove('active');
    elements.selectionPhase.classList.remove('active');
    elements.resultPhase.classList.remove('active');
    if (elements.historyPhase) elements.historyPhase.classList.remove('active');
    
    switch (phase) {
        case 'input':
            elements.inputPhase.classList.add('active');
            break;
        case 'selection':
            elements.selectionPhase.classList.add('active');
            break;
        case 'result':
            elements.resultPhase.classList.add('active');
            break;
        case 'history':
            if (elements.historyPhase) elements.historyPhase.classList.add('active');
            break;
    }
    
    state.currentPhase = phase;
}

// 处理重新开始
function handleRestart() {
    state.question = '';
    state.selectedCards = [];
    state.revealedCards = [];
    state.availableCards = [];
    
    elements.questionInput.value = '';
    elements.explanationContent.innerHTML = '';
    
    // 重新开始时再次检查次数
    if (isDailyLimitReached()) {
        renderHistory();
        switchPhase('history');
    } else {
        switchPhase('input');
    }
}

// 渲染历史记录
function renderHistory() {
    const data = getTodayRecords();
    const container = elements.historyContainer;
    container.innerHTML = '';

    if (data.records.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--secondary-color);">暂无占卜记录</p>';
        return;
    }

    data.records.forEach((record, idx) => {
        const item = document.createElement('div');
        item.className = 'history-item';

        item.innerHTML = `
            <div class="history-item-left">
                <div class="history-time">第 ${idx + 1} 次 · ${record.time}</div>
                <div class="history-question">问题：${record.question}</div>
                <div class="history-card">
                    <div class="history-card-image">
                        <img src="${record.cardImage}" alt="${record.cardName}">
                    </div>
                    <div class="history-card-name">${record.cardName}</div>
                </div>
            </div>
            <div class="history-item-right">
                <div class="history-explanation-title">AI解读</div>
                <div class="history-explanation-content">${record.explanation}</div>
            </div>
        `;

        container.appendChild(item);
    });
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);
