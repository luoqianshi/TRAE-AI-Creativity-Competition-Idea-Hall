// ============ 全局状态 ============
const state = {
    currentGrade: null,
    questions: [],
    userAnswers: {},
    isSubmitted: false,
    chatMode: 'teaching', // 'teaching' 或 'chat'
    settings: {
        volume: 80,
        brightness: 100,
        aiVoice: 'default',
        language: 'zh',
        hiddenFeatureUnlocked: false,
        apiKey: 'sk-1a38205f866c491a8712d4c23944355a' // 预设API Key
    },
    chatHistory: []
};

// ============ 多语言文本 ============
const i18n = {
    zh: {
        welcome: '你好呀！我是你的AI数学小助手~',
        title: 'AI数学小助手',
        subtitle: '快乐学数学，每天进步一点点！',
        selectGrade: '🎯 选择你的年级',
        grades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
        startPractice: '开始练习',
        chatWithAI: '和AI聊天',
        submit: '提交答案',
        retry: '再练一批',
        backHome: '返回首页',
        settings: '⚙️ 设置',
        volume: '🔊 音量',
        brightness: '☀️ 亮度',
        voice: '🎵 AI音色',
        language: '🌐 语言',
        redeemCode: '🎁 兑换码',
        redeem: '兑换',
        apiKey: '🔑 API Key',
        save: '保存',
        apiKeyHint: '需要DeepSeek API Key才能使用AI功能',
        practiceTitle: '数学练习',
        loading: 'AI小助手正在为你出题...',
        resultTitle: '练习完成！',
        correct: '正确',
        wrong: '错误',
        encouragement: '你真棒！继续加油哦~',
        analysis: '📖 答案解析',
        correctAnswer: '正确答案',
        enterAnswer: '请输入你的答案...',
        chatPlaceholder: '输入你想说的话...',
        chatWelcome: '你好呀！我是你的AI数学小助手~\n有什么数学问题都可以问我哦！无论是题目不会做，还是想聊聊学习上的烦恼，我都愿意陪你😊',
        hiddenFeatureUnlock: '🎉 恭喜解锁隐藏功能！'
    },
    en: {
        welcome: 'Hello! I\'m your AI Math Assistant~',
        title: 'AI Math Assistant',
        subtitle: 'Learn math happily, improve every day!',
        selectGrade: '🎯 Select Your Grade',
        grades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
        startPractice: 'Start Practice',
        chatWithAI: 'Chat with AI',
        submit: 'Submit Answers',
        retry: 'Practice More',
        backHome: 'Back Home',
        settings: '⚙️ Settings',
        volume: '🔊 Volume',
        brightness: '☀️ Brightness',
        voice: '🎵 AI Voice',
        language: '🌐 Language',
        redeemCode: '🎁 Redeem Code',
        redeem: 'Redeem',
        apiKey: '🔑 API Key',
        save: 'Save',
        apiKeyHint: 'DeepSeek API Key required for AI features',
        practiceTitle: 'Math Practice',
        loading: 'AI is generating questions for you...',
        resultTitle: 'Practice Complete!',
        correct: 'Correct',
        wrong: 'Wrong',
        encouragement: 'Great job! Keep it up!',
        analysis: '📖 Analysis',
        correctAnswer: 'Correct Answer',
        enterAnswer: 'Enter your answer...',
        chatPlaceholder: 'Type your message...',
        chatWelcome: 'Hello! I\'m your AI Math Assistant~\nFeel free to ask me any math questions! Whether you need help with problems or just want to chat about studying, I\'m here for you😊',
        hiddenFeatureUnlock: '🎉 Hidden feature unlocked!'
    },
    ja: {
        welcome: 'こんにちは！AI数学アシスタントだよ~',
        title: 'AI数学アシスタント',
        subtitle: '楽しく数学を学ぼう、毎日少しずつ上達！',
        selectGrade: '🎯 学年を選んでね',
        grades: ['1年生', '2年生', '3年生', '4年生', '5年生', '6年生'],
        startPractice: '練習を始める',
        chatWithAI: 'AIとおしゃべり',
        submit: '回答を送信',
        retry: 'もう一度練習',
        backHome: 'ホームへ戻る',
        settings: '⚙️ 設定',
        volume: '🔊 音量',
        brightness: '☀️ 明るさ',
        voice: '🎵 AIの声',
        language: '🌐 言語',
        redeemCode: '🎁 引き換えコード',
        redeem: '引き換え',
        apiKey: '🔑 APIキー',
        save: '保存',
        apiKeyHint: 'AI機能を使うにはDeepSeek APIキーが必要です',
        practiceTitle: '数学の練習',
        loading: 'AIが問題を作っています...',
        resultTitle: '練習完了！',
        correct: '正解',
        wrong: '不正解',
        encouragement: 'すごいね！これからも頑張って！',
        analysis: '📖 解説',
        correctAnswer: '正解',
        enterAnswer: '答えを入力してください...',
        chatPlaceholder: 'メッセージを入力してください...',
        chatWelcome: 'こんにちは！AI数学アシスタントだよ~\n数学の問題ならなんでも聞いてね！問題の解き方がわからなくても、勉強の悩みを話したくても、いつでも相談にのるよ😊',
        hiddenFeatureUnlock: '🎉 隠し機能を解禁しました！'
    }
};

// ============ DOM元素 ============
const elements = {
    // 页面
    homePage: document.getElementById('homePage'),
    practicePage: document.getElementById('practicePage'),
    chatPage: document.getElementById('chatPage'),
    
    // 首页
    welcomeBubble: document.getElementById('welcomeBubble'),
    heroTitle: document.querySelector('.hero-title'),
    heroSubtitle: document.querySelector('.hero-subtitle'),
    sectionTitle: document.querySelector('.section-title'),
    gradeGrid: document.getElementById('gradeGrid'),
    startPracticeBtn: document.getElementById('startPracticeBtn'),
    goChatBtn: document.getElementById('goChatBtn'),
    
    // 练习页
    currentGradeText: document.getElementById('currentGradeText'),
    questionProgress: document.getElementById('questionProgress'),
    questionsContainer: document.getElementById('questionsContainer'),
    submitBtn: document.getElementById('submitBtn'),
    practiceFooter: document.getElementById('practiceFooter'),
    resultPanel: document.getElementById('resultPanel'),
    resultEmoji: document.getElementById('resultEmoji'),
    scoreNumber: document.getElementById('scoreNumber'),
    correctCount: document.getElementById('correctCount'),
    wrongCount: document.getElementById('wrongCount'),
    encouragementText: document.getElementById('encouragementText'),
    resultSummary: document.getElementById('resultSummary'),
    retryBtn: document.getElementById('retryBtn'),
    goChatFromResultBtn: document.getElementById('goChatFromResultBtn'),
    backHomeFromResultBtn: document.getElementById('backHomeFromResultBtn'),
    backToHomeBtn: document.getElementById('backToHomeBtn'),
    
    // 聊天页
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    backToHomeFromChatBtn: document.getElementById('backToHomeFromChatBtn'),
    teachingModeBtn: document.getElementById('teachingModeBtn'),
    chatModeBtn: document.getElementById('chatModeBtn'),
    
    // 设置
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    brightnessSlider: document.getElementById('brightnessSlider'),
    brightnessValue: document.getElementById('brightnessValue'),
    voiceSelect: document.getElementById('voiceSelect'),
    languageSelect: document.getElementById('languageSelect'),
    redeemCodeInput: document.getElementById('redeemCodeInput'),
    redeemBtn: document.getElementById('redeemBtn'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
    
    // Toast
    hiddenFeatureToast: document.getElementById('hiddenFeatureToast')
};

// ============ 初始化 ============
function init() {
    loadSettings();
    applySettings();
    renderGradeCards();
    bindEvents();
    updateLanguage();
}

// ============ 本地存储 ============
function saveSettings() {
    localStorage.setItem('mathAI_settings', JSON.stringify(state.settings));
}

function loadSettings() {
    const saved = localStorage.getItem('mathAI_settings');
    if (saved) {
        const savedSettings = JSON.parse(saved);
        // 保留预设的API Key（如果本地存储中没有）
        const defaultApiKey = state.settings.apiKey;
        state.settings = { ...state.settings, ...savedSettings };
        // 如果本地存储的API Key为空，使用预设的
        if (!state.settings.apiKey) {
            state.settings.apiKey = defaultApiKey;
        }
    }
}

// ============ 设置相关 ============
function applySettings() {
    // 亮度
    document.body.style.filter = `brightness(${state.settings.brightness}%)`;
    
    // 更新UI
    elements.volumeSlider.value = state.settings.volume;
    elements.volumeValue.textContent = state.settings.volume + '%';
    elements.brightnessSlider.value = state.settings.brightness;
    elements.brightnessValue.textContent = state.settings.brightness + '%';
    elements.voiceSelect.value = state.settings.aiVoice;
    elements.languageSelect.value = state.settings.language;
    elements.apiKeyInput.value = state.settings.apiKey;
    
    // 隐藏功能
    if (state.settings.hiddenFeatureUnlocked) {
        document.body.classList.add('hidden-feature');
    }
    
    // 如果有预设API Key，显示已配置提示
    if (state.settings.apiKey) {
        const hint = document.querySelector('.setting-hint');
        if (hint) {
            hint.textContent = '✅ API Key 已配置，AI功能已就绪';
            hint.style.color = '#2E8B57';
        }
    }
}

function updateLanguage() {
    const t = i18n[state.settings.language];
    
    elements.welcomeBubble.textContent = t.welcome;
    elements.heroTitle.textContent = t.title;
    elements.heroSubtitle.textContent = t.subtitle;
    elements.sectionTitle.textContent = t.selectGrade;
    elements.startPracticeBtn.querySelector('span:last-child').textContent = t.startPractice;
    elements.goChatBtn.querySelector('span:last-child').textContent = t.chatWithAI;
    elements.submitBtn.querySelector('span:last-child').textContent = t.submit;
    elements.retryBtn.querySelector('span:last-child').textContent = t.retry;
    elements.backHomeFromResultBtn.querySelector('span:last-child').textContent = t.backHome;
    elements.goChatFromResultBtn.querySelector('span:last-child').textContent = t.chatWithAI;
    
    // 更新年级卡片文字
    const gradeCards = elements.gradeGrid.querySelectorAll('.grade-card');
    gradeCards.forEach((card, index) => {
        card.querySelector('.grade-text').textContent = t.grades[index];
    });
    
    // 更新设置弹窗
    document.querySelector('.modal-header h2').textContent = t.settings;
    const settingLabels = document.querySelectorAll('.setting-item label');
    settingLabels[0].textContent = t.volume;
    settingLabels[1].textContent = t.brightness;
    settingLabels[2].textContent = t.voice;
    settingLabels[3].textContent = t.language;
    settingLabels[4].textContent = t.redeemCode;
    settingLabels[5].textContent = t.apiKey;
    elements.redeemBtn.textContent = t.redeem;
    elements.saveApiKeyBtn.textContent = t.save;
    document.querySelector('.setting-hint').textContent = t.apiKeyHint;
    elements.redeemCodeInput.placeholder = t.redeemCode;
    elements.apiKeyInput.placeholder = t.apiKey;
    
    // 更新聊天欢迎消息
    const firstMessage = elements.chatMessages.querySelector('.message-assistant .message-bubble');
    if (firstMessage && state.chatHistory.length === 0) {
        const lines = t.chatWelcome.split('\n');
        firstMessage.innerHTML = lines.map(l => `<p>${l}</p>`).join('');
    }
    
    elements.chatInput.placeholder = t.chatPlaceholder;
}

// ============ 页面切换 ============
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    if (pageName === 'home') {
        elements.homePage.classList.add('active');
    } else if (pageName === 'practice') {
        elements.practicePage.classList.add('active');
    } else if (pageName === 'chat') {
        elements.chatPage.classList.add('active');
        scrollChatToBottom();
    }
}

// ============ 年级选择 ============
function renderGradeCards() {
    const t = i18n[state.settings.language];
    const emojis = ['🌟', '🌈', '🎈', '🚀', '💎', '🏆'];
    
    elements.gradeGrid.innerHTML = '';
    
    for (let i = 1; i <= 6; i++) {
        const card = document.createElement('div');
        card.className = 'grade-card';
        card.dataset.grade = i;
        card.innerHTML = `
            <span class="grade-emoji">${emojis[i - 1]}</span>
            <span class="grade-text">${t.grades[i - 1]}</span>
        `;
        card.addEventListener('click', () => selectGrade(i));
        elements.gradeGrid.appendChild(card);
    }
}

function selectGrade(grade) {
    state.currentGrade = grade;
    
    document.querySelectorAll('.grade-card').forEach(card => {
        card.classList.remove('selected');
        if (parseInt(card.dataset.grade) === grade) {
            card.classList.add('selected');
        }
    });
    
    elements.startPracticeBtn.disabled = false;
}

// ============ 出题功能 ============
async function generateQuestions(isRetry = false, wrongQuestions = []) {
    const t = i18n[state.settings.language];
    
    elements.questionsContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>${t.loading}</p>
        </div>
    `;
    elements.submitBtn.style.display = 'none';
    elements.resultPanel.classList.add('hidden');
    state.isSubmitted = false;
    state.userAnswers = {};
    state.questions = [];
    
    // 如果有API Key，调用AI出题
    if (state.settings.apiKey) {
        try {
            const questions = await callAIForQuestions(isRetry, wrongQuestions);
            state.questions = questions;
        } catch (error) {
            console.error('AI出题失败，使用本地题目:', error);
            state.questions = generateMockQuestions(state.currentGrade);
        }
    } else {
        // 没有API Key，使用模拟题目
        state.questions = generateMockQuestions(state.currentGrade);
    }
    
    renderQuestions();
    elements.submitBtn.style.display = 'flex';
    updateProgress();
}

function generateMockQuestions(grade) {
    const questionTypes = [
        '计算题', '应用题', '填空题', '判断题', '选择题',
        '几何题', '分数题', '小数题', '周长题', '面积题'
    ];
    
    const questions = [];
    
    for (let i = 0; i < 10; i++) {
        const type = questionTypes[i % questionTypes.length];
        const difficulty = grade;
        
        let content, answer, analysis;
        
        if (type === '计算题') {
            const a = Math.floor(Math.random() * (10 * difficulty)) + 1;
            const b = Math.floor(Math.random() * (10 * difficulty)) + 1;
            const ops = ['+', '-', '×', '÷'];
            const op = ops[Math.floor(Math.random() * Math.min(2 + difficulty, 4))];
            
            let result;
            if (op === '+') result = a + b;
            else if (op === '-') result = Math.max(a, b) - Math.min(a, b);
            else if (op === '×') result = a * b;
            else result = a;
            
            content = op === '-' 
                ? `计算：${Math.max(a, b)} ${op} ${Math.min(a, b)} = ?`
                : `计算：${a} ${op} ${b} = ?`;
            answer = String(result);
            analysis = `这是一道${type}。\n\n解题步骤：\n1. 题目是 ${op === '-' ? Math.max(a, b) + ' ' + op + ' ' + Math.min(a, b) : a + ' ' + op + ' ' + b}\n2. 通过运算得出答案\n3. 最终答案是：${result}`;
        } else if (type === '应用题') {
            const items = ['苹果', '书', '铅笔', '糖果', '玩具'];
            const item = items[Math.floor(Math.random() * items.length)];
            const num1 = Math.floor(Math.random() * (5 * difficulty)) + 3;
            const num2 = Math.floor(Math.random() * (5 * difficulty)) + 2;
            
            content = `小明有${num1}个${item}，妈妈又给了他${num2}个，请问小明现在一共有多少个${item}？`;
            answer = String(num1 + num2);
            analysis = `这是一道${type}。\n\n解题步骤：\n1. 小明原来有${num1}个${item}\n2. 妈妈又给了${num2}个\n3. 用加法计算：${num1} + ${num2} = ${num1 + num2}\n4. 所以小明现在一共有 ${num1 + num2} 个${item}`;
        } else if (type === '填空题') {
            const base = Math.floor(Math.random() * (10 * difficulty)) + 5;
            const gap = Math.floor(Math.random() * 5) + 1;
            content = `找规律填空：${base}, ${base + gap}, ${base + gap * 2}, ____, ${base + gap * 4}`;
            answer = String(base + gap * 3);
            analysis = `这是一道找规律的${type}。\n\n解题步骤：\n1. 观察数列：${base}, ${base + gap}, ${base + gap * 2}, ...\n2. 发现每一项都比前一项多${gap}\n3. 所以第四项 = ${base + gap * 2} + ${gap} = ${base + gap * 3}`;
        } else if (type === '判断题') {
            const a = Math.floor(Math.random() * (10 * difficulty)) + 1;
            const b = Math.floor(Math.random() * (10 * difficulty)) + 1;
            const isCorrect = Math.random() > 0.5;
            const sum = isCorrect ? a + b : a + b + 1;
            
            content = `判断对错：${a} + ${b} = ${sum} （对的打√，错的打×）`;
            answer = isCorrect ? '√' : '×';
            analysis = `这是一道${type}。\n\n解题步骤：\n1. 先计算 ${a} + ${b} = ${a + b}\n2. 题目中写的是 ${sum}\n3. 因为 ${a + b} ${isCorrect ? '=' : '≠'} ${sum}，所以答案是 ${isCorrect ? '对的√' : '错的×'}`;
        } else if (type === '选择题') {
            const a = Math.floor(Math.random() * (10 * difficulty)) + 1;
            const b = Math.floor(Math.random() * (10 * difficulty)) + 1;
            const correct = a + b;
            const options = [correct, correct + 1, correct - 1, correct + 2];
            options.sort(() => Math.random() - 0.5);
            
            content = `选择题：${a} + ${b} = ?\nA. ${options[0]}\nB. ${options[1]}\nC. ${options[2]}\nD. ${options[3]}`;
            const correctIndex = options.indexOf(correct);
            const correctLetter = ['A', 'B', 'C', 'D'][correctIndex];
            answer = correctLetter;
            analysis = `这是一道${type}。\n\n解题步骤：\n1. 计算 ${a} + ${b} = ${correct}\n2. 看选项中哪个等于${correct}\n3. 正确答案是 ${correctLetter}. ${correct}`;
        } else if (type === '几何题') {
            const sides = ['三角形', '正方形', '长方形', '圆形'];
            const shape = sides[Math.floor(Math.random() * Math.min(difficulty, sides.length))];
            
            if (shape === '三角形') {
                content = '一个三角形有几条边？';
                answer = '3';
                analysis = `这是一道关于三角形的${type}。\n\n解题步骤：\n1. 三角形是由三条线段围成的图形\n2. 所以三角形有3条边\n3. 答案是：3条`;
            } else if (shape === '正方形') {
                content = '一个正方形有几个角？';
                answer = '4';
                analysis = `这是一道关于正方形的${type}。\n\n解题步骤：\n1. 正方形有四条边，四个角\n2. 每个角都是直角\n3. 答案是：4个角`;
            } else if (shape === '长方形') {
                content = '长方形的对边相等吗？';
                answer = '相等';
                analysis = `这是一道关于长方形的${type}。\n\n解题步骤：\n1. 长方形有四条边\n2. 相对的两条边长度相等\n3. 所以答案是：相等`;
            } else {
                content = '圆有多少条对称轴？';
                answer = '无数';
                analysis = `这是一道关于圆的${type}。\n\n解题步骤：\n1. 把圆沿着任意一条直径对折，两边都能完全重合\n2. 圆有无数条直径\n3. 所以圆有无数条对称轴`;
            }
        } else if (type === '分数题') {
            const denominator = Math.floor(Math.random() * 5) + 3;
            const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
            
            content = `分数 ${numerator}/${denominator} 读作什么？`;
            answer = `${denominator}分之${numerator}`;
            analysis = `这是一道${type}。\n\n解题步骤：\n1. 分数的读法：先读分母，再读"分之"，最后读分子\n2. 分母是${denominator}，分子是${numerator}\n3. 所以 ${numerator}/${denominator} 读作：${denominator}分之${numerator}`;
        } else if (type === '小数题') {
            const integer = Math.floor(Math.random() * 10) + 1;
            const decimal = Math.floor(Math.random() * 10);
            
            content = `小数 ${integer}.${decimal} 中的${decimal}在什么位上？`;
            answer = '十分位';
            analysis = `这是一道${type}。\n\n解题步骤：\n1. 小数点右边第一位是十分位\n2. ${decimal}在小数点右边第一位\n3. 所以${decimal}在十分位上`;
        } else if (type === '周长题') {
            const length = Math.floor(Math.random() * 8) + 3;
            const width = Math.floor(Math.random() * 6) + 2;
            
            content = `一个长方形的长是${length}厘米，宽是${width}厘米，周长是多少厘米？`;
            answer = String((length + width) * 2);
            analysis = `这是一道${type}。\n\n解题步骤：\n1. 长方形周长公式：周长 = (长 + 宽) × 2\n2. 代入数值：(${length} + ${width}) × 2 = ${length + width} × 2 = ${(length + width) * 2}\n3. 所以周长是 ${(length + width) * 2} 厘米`;
        } else {
            const side = Math.floor(Math.random() * 9) + 2;
            
            content = `一个正方形的边长是${side}厘米，面积是多少平方厘米？`;
            answer = String(side * side);
            analysis = `这是一道${type}。\n\n解题步骤：\n1. 正方形面积公式：面积 = 边长 × 边长\n2. 代入数值：${side} × ${side} = ${side * side}\n3. 所以面积是 ${side * side} 平方厘米`;
        }
        
        questions.push({
            id: i + 1,
            type: type,
            content: content,
            answer: answer,
            analysis: analysis
        });
    }
    
    return questions;
}

// ============ 渲染题目 ============
function renderQuestions() {
    const t = i18n[state.settings.language];
    
    elements.questionsContainer.innerHTML = '';
    
    state.questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="question-header">
                <span class="question-number">${q.id}</span>
                <span class="question-type">${q.type}</span>
            </div>
            <div class="question-content">${escapeHtml(q.content)}</div>
            <input 
                type="text" 
                class="answer-input" 
                id="answer-${q.id}" 
                placeholder="${t.enterAnswer}"
                ${state.isSubmitted ? 'disabled' : ''}
            >
            <div class="analysis-section" id="analysis-${q.id}">
                <div class="analysis-title">
                    <span>${t.analysis}</span>
                    <span class="result-icon" id="result-icon-${q.id}"></span>
                </div>
                <div class="correct-answer">
                    <strong>${t.correctAnswer}：</strong>${escapeHtml(q.answer)}
                </div>
                <div class="analysis-content">${escapeHtml(q.analysis)}</div>
            </div>
        `;
        elements.questionsContainer.appendChild(card);
        
        // 绑定输入事件
        const input = card.querySelector('.answer-input');
        input.addEventListener('input', (e) => {
            state.userAnswers[q.id] = e.target.value;
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

function updateProgress() {
    const answered = Object.keys(state.userAnswers).length;
    elements.questionProgress.textContent = `${answered}/${state.questions.length}`;
}

// ============ 提交与批改 ============
function submitAnswers() {
    const t = i18n[state.settings.language];
    state.isSubmitted = true;
    
    let correctCount = 0;
    const wrongQuestions = [];
    
    state.questions.forEach(q => {
        const userAnswer = (state.userAnswers[q.id] || '').trim();
        const correctAnswer = q.answer.trim();
        const isCorrect = checkAnswer(userAnswer, correctAnswer);
        
        q.userAnswer = userAnswer;
        q.isCorrect = isCorrect;
        
        if (isCorrect) {
            correctCount++;
        } else {
            wrongQuestions.push(q);
        }
        
        // 更新UI
        const input = document.getElementById(`answer-${q.id}`);
        const analysis = document.getElementById(`analysis-${q.id}`);
        const resultIcon = document.getElementById(`result-icon-${q.id}`);
        
        if (input) {
            input.disabled = true;
            input.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (analysis) {
            analysis.classList.add('show');
        }
        if (resultIcon) {
            resultIcon.textContent = isCorrect ? '✓' : '✗';
            resultIcon.classList.add(isCorrect ? 'correct' : 'wrong');
        }
    });
    
    // 计算分数
    const score = Math.round((correctCount / state.questions.length) * 100);
    
    // 显示结果
    showResult(score, correctCount, state.questions.length - correctCount, wrongQuestions);
}

function checkAnswer(userAnswer, correctAnswer) {
    if (!userAnswer) return false;
    
    // 去除空格，转小写
    const user = userAnswer.toLowerCase().replace(/\s/g, '');
    const correct = correctAnswer.toLowerCase().replace(/\s/g, '');
    
    // 完全匹配
    if (user === correct) return true;
    
    // 数字匹配（去除单位等）
    const userNum = user.match(/[\d.]+/g);
    const correctNum = correct.match(/[\d.]+/g);
    
    if (userNum && correctNum && userNum.length === correctNum.length) {
        let allMatch = true;
        for (let i = 0; i < userNum.length; i++) {
            if (parseFloat(userNum[i]) !== parseFloat(correctNum[i])) {
                allMatch = false;
                break;
            }
        }
        if (allMatch) return true;
    }
    
    return false;
}

function showResult(score, correctCount, wrongCount, wrongQuestions) {
    const t = i18n[state.settings.language];
    
    elements.resultEmoji.textContent = score >= 90 ? '🎉' : score >= 70 ? '😊' : score >= 60 ? '💪' : '📚';
    elements.scoreNumber.textContent = score;
    elements.correctCount.textContent = correctCount;
    elements.wrongCount.textContent = wrongCount;
    
    // 生成鼓励语
    let encouragement = '';
    if (score >= 90) {
        encouragement = '太棒了！你真是个数学小天才！🌟\n继续保持这个状态，你会越来越厉害的！';
    } else if (score >= 70) {
        encouragement = '做得不错！👍\n再仔细一点，你就能拿到更高的分数了，加油！';
    } else if (score >= 60) {
        encouragement = '及格了！继续努力！💪\n错题没关系，看懂解析，下次一定能做对！';
    } else {
        encouragement = '别灰心，慢慢来~ 📚\n每道错题都是进步的机会，看完解析再试试看！';
    }
    elements.encouragementText.textContent = encouragement;
    
    // 总结
    let summaryHtml = '<h3>📊 本次总结</h3>';
    summaryHtml += `<p>你一共做了${state.questions.length}道题，答对了${correctCount}道，答错了${wrongCount}道。</p>`;
    
    if (wrongQuestions.length > 0) {
        const wrongTypes = [...new Set(wrongQuestions.map(q => q.type))];
        summaryHtml += `<p>需要加强的题型：${wrongTypes.join('、')}</p>`;
        summaryHtml += '<p>点击"再练一批"，我们来针对性练习一下吧！</p>';
    } else {
        summaryHtml += '<p>全部答对了！你太厉害了！🎉</p>';
        summaryHtml += '<p>要不要挑战一下更难的题目？';
    }
    
    elements.resultSummary.innerHTML = summaryHtml;
    
    // 保存错题用于强化练习
    state.wrongQuestions = wrongQuestions;
    
    // 显示结果面板
    elements.resultPanel.classList.remove('hidden');
    elements.practiceFooter.style.display = 'none';
    
    // 滚动到顶部
    elements.resultPanel.scrollTop = 0;
}

// ============ AI对话 ============
function sendMessage() {
    const input = elements.chatInput;
    const message = input.value.trim();
    
    if (!message) return;
    
    // 添加用户消息
    addChatMessage('user', message);
    input.value = '';
    input.style.height = 'auto';
    
    // 添加AI回复
    if (state.settings.apiKey) {
        // 调用AI
        addChatMessage('assistant', '', true);
        callAIForChat(message);
    } else {
        // 模拟回复
        setTimeout(() => {
            const replies = [
                '这个问题问得好！让我来想想... 🤔',
                '嗯嗯，我明白你的意思~',
                '数学确实有时候会让人头疼，但只要多练习就一定会进步的！💪',
                '你今天学习了什么呀？',
                '有不会的题目随时问我哦！',
                '学习累了要记得休息一下眼睛~'
            ];
            const reply = replies[Math.floor(Math.random() * replies.length)];
            addChatMessage('assistant', reply);
        }, 1000);
    }
}

function addChatMessage(role, content, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${role}`;
    
    const avatar = role === 'assistant' ? '🦊' : '😊';
    
    if (isLoading) {
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-bubble" id="loading-message">
                <div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
            </div>
        `;
        messageDiv.id = 'temp-message';
    } else {
        const lines = content.split('\n');
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-bubble">
                ${lines.map(l => `<p>${escapeHtml(l)}</p>`).join('')}
            </div>
        `;
    }
    
    elements.chatMessages.appendChild(messageDiv);
    scrollChatToBottom();
    
    return messageDiv;
}

function scrollChatToBottom() {
    setTimeout(() => {
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }, 100);
}

// ============ DeepSeek API ============
async function callAIForQuestions(isRetry = false, wrongQuestions = []) {
    if (!state.settings.apiKey) {
        throw new Error('No API Key');
    }
    
    const grade = state.currentGrade;
    const lang = state.settings.language;
    
    let systemPrompt = '';
    let userPrompt = '';
    
    if (lang === 'zh') {
        systemPrompt = '你是一位专业的小学数学老师，擅长用简单易懂的方式讲解数学知识。请用JSON格式返回题目。';
        
        if (isRetry && wrongQuestions.length > 0) {
            const wrongTypes = [...new Set(wrongQuestions.map(q => q.type))].join('、');
            userPrompt = `请为小学${grade}年级出10道数学题，重点考察${wrongTypes}相关的题型，难度适中。\n\n要求：\n1. 每道题要有不同的考察方向\n2. 每道题包含：题目类型(type)、题目内容(content)、正确答案(answer)、详细解析(analysis)\n3. 返回JSON数组格式，每个元素包含id, type, content, answer, analysis字段\n4. 解析要详细，适合小学生理解`;
        } else {
            userPrompt = `请为小学${grade}年级出10道不同考察方向的数学题。\n\n要求：\n1. 题型包括：计算题、应用题、填空题、判断题、选择题、几何题等\n2. 每道题包含：题目类型(type)、题目内容(content)、正确答案(answer)、详细解析(analysis)\n3. 返回JSON数组格式，每个元素包含id, type, content, answer, analysis字段\n4. 解析要详细，适合小学生理解`;
        }
    } else if (lang === 'en') {
        systemPrompt = 'You are a professional elementary school math teacher. Return questions in JSON format.';
        
        if (isRetry && wrongQuestions.length > 0) {
            userPrompt = `Generate 10 math questions for Grade ${grade} elementary school students. Focus on these types: ${wrongQuestions.map(q => q.type).join(', ')}.\n\nRequirements:\n1. Each question should test different skills\n2. Each question should include: type, content, answer, analysis\n3. Return as JSON array with fields: id, type, content, answer, analysis\n4. Analysis should be clear and easy for kids to understand`;
        } else {
            userPrompt = `Generate 10 math questions for Grade ${grade} elementary school students.\n\nRequirements:\n1. Different question types: calculation, word problems, fill-in-the-blank, true/false, multiple choice, geometry, etc.\n2. Each question should include: type, content, answer, analysis\n3. Return as JSON array with fields: id, type, content, answer, analysis\n4. Analysis should be clear and easy for kids to understand`;
        }
    } else {
        systemPrompt = 'あなたはプロの小学校の数学の先生です。問題をJSON形式で返してください。';
        
        if (isRetry && wrongQuestions.length > 0) {
            userPrompt = `小学${grade}年生向けの数学の問題を10問作成してください。特に${wrongQuestions.map(q => q.type).join('、')}の問題を中心に。\n\n要件：\n1. それぞれ異なるスキルを問う問題\n2. 各問題にはtype、content、answer、analysisを含める\n3. id、type、content、answer、analysisフィールドを持つJSON配列で返す\n4. 解説は子供にもわかりやすく`;
        } else {
            userPrompt = `小学${grade}年生向けの数学の問題を10問作成してください。\n\n要件：\n1. 計算問題、文章問題、穴埋め問題、正誤問題、選択問題、図形問題など、色々な種類の問題\n2. 各問題にはtype、content、answer、analysisを含める\n3. id、type、content、answer、analysisフィールドを持つJSON配列で返す\n4. 解説は子供にもわかりやすく`;
        }
    }
    
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.settings.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        let content = data.choices[0].message.content;
        
        // 提取JSON
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            content = jsonMatch[0];
        }
        
        const questions = JSON.parse(content);
        return questions.map((q, i) => ({
            id: i + 1,
            type: q.type || '数学题',
            content: q.content,
            answer: q.answer,
            analysis: q.analysis
        }));
        
    } catch (error) {
        console.error('DeepSeek API error:', error);
        throw error;
    }
}

async function callAIForChat(message) {
    if (!state.settings.apiKey) {
        addChatMessage('assistant', '请先在设置中配置DeepSeek API Key哦~');
        return;
    }
    
    const lang = state.settings.language;
    const voiceType = state.settings.aiVoice;
    const mode = state.chatMode;
    
    let systemPrompt = '';
    
    if (lang === 'zh') {
        if (mode === 'teaching') {
            // 教学模式：严格的数学教学
            const voiceStyles = {
                default: '你是一位专业的小学数学AI老师，名叫"小数"。你的职责是教授数学知识，回答必须与数学相关。',
                gentle: '你是一位温柔的数学老师，专注于数学教学。用耐心和鼓励的方式讲解数学概念。',
                energetic: '你是一位充满活力的数学老师，专注于数学教学。用有趣生动的方式讲解数学知识。',
                cute: '你是一位可爱的数学小伙伴，专注于帮助学生学习数学。'
            };
            systemPrompt = voiceStyles[voiceType] || voiceStyles.default;
            systemPrompt += '\n\n【重要规则】\n';
            systemPrompt += '1. 只回答数学相关的问题（计算、几何、应用题、数学概念等）\n';
            systemPrompt += '2. 如果用户问非数学问题，礼貌地引导回数学话题\n';
            systemPrompt += '3. 讲解要详细，步骤要清晰，适合小学生理解\n';
            systemPrompt += '4. 多用例子和比喻来解释抽象概念\n';
            systemPrompt += '5. 回答完数学问题后，鼓励学生继续学习';
        } else {
            // 聊天模式：自由聊天
            const voiceStyles = {
                default: '你是一位友善的AI小伙伴，名叫"小数"。你可以和学生自由聊天，分享学习和生活中的趣事。',
                gentle: '你是一位温柔的大姐姐，可以自由聊天，关心学生的学习和生活。',
                energetic: '你是一位充满活力的大哥哥，可以自由聊天，分享有趣的事情。',
                cute: '你是一位可爱的小朋友伙伴，可以自由聊天，像朋友一样相处。'
            };
            systemPrompt = voiceStyles[voiceType] || voiceStyles.default;
            systemPrompt += '\n\n【聊天规则】\n';
            systemPrompt += '1. 可以自由聊各种话题（学习、生活、兴趣爱好等）\n';
            systemPrompt += '2. 保持友善和鼓励的态度\n';
            systemPrompt += '3. 如果学生遇到困难，给予安慰和建议\n';
            systemPrompt += '4. 聊天的同时，适时关心学生的学习情况';
        }
    } else if (lang === 'en') {
        if (mode === 'teaching') {
            systemPrompt = 'You are a professional elementary school math AI teacher. ONLY answer math-related questions. If asked about other topics, politely guide the conversation back to mathematics.';
        } else {
            systemPrompt = 'You are a friendly AI companion for elementary school students. You can chat freely about various topics while being supportive and encouraging.';
        }
    } else {
        if (mode === 'teaching') {
            systemPrompt = 'あなたは小学校のプロのAI数学の先生です。数学に関連する質問にのみ答えてください。';
        } else {
            systemPrompt = 'あなたは小学生のためのフレンドリーなAIお友達です。様々な話題について自由にチャットできます。';
        }
    }
    
    // 构建消息历史
    const messages = [{ role: 'system', content: systemPrompt }];
    
    // 添加最近的对话历史（最多20条）
    const recentHistory = state.chatHistory.slice(-20);
    recentHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
    });
    
    messages.push({ role: 'user', content: message });
    
    // 保存到历史
    state.chatHistory.push({ role: 'user', content: message });
    
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.settings.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                temperature: mode === 'teaching' ? 0.5 : 0.8,
                stream: false
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        // 移除加载消息，添加实际回复
        const tempMsg = document.getElementById('temp-message');
        if (tempMsg) {
            tempMsg.remove();
        }
        
        addChatMessage('assistant', reply);
        state.chatHistory.push({ role: 'assistant', content: reply });
        
    } catch (error) {
        console.error('DeepSeek API error:', error);
        
        const tempMsg = document.getElementById('temp-message');
        if (tempMsg) {
            tempMsg.remove();
        }
        
        addChatMessage('assistant', '抱歉，我现在有点累了，请稍后再试吧~ 😴');
    }
}

// ============ 兑换码 ============
function checkRedeemCode(code) {
    // 隐藏功能兑换码
    const hiddenCode = '王某某是单身狗';
    
    if (code === hiddenCode) {
        state.settings.hiddenFeatureUnlocked = true;
        document.body.classList.add('hidden-feature');
        saveSettings();
        showToast();
        return true;
    }
    
    return false;
}

function showToast() {
    const t = i18n[state.settings.language];
    elements.hiddenFeatureToast.querySelector('span').textContent = t.hiddenFeatureUnlock;
    elements.hiddenFeatureToast.classList.remove('hidden');
    
    setTimeout(() => {
        elements.hiddenFeatureToast.classList.add('hidden');
    }, 3000);
}

// ============ 事件绑定 ============
function bindEvents() {
    // 年级选择已在渲染时绑定
    
    // 开始练习
    elements.startPracticeBtn.addEventListener('click', () => {
        if (!state.currentGrade) return;
        
        const t = i18n[state.settings.language];
        elements.currentGradeText.textContent = t.grades[state.currentGrade - 1];
        
        showPage('practice');
        generateQuestions();
    });
    
    // 提交答案
    elements.submitBtn.addEventListener('click', submitAnswers);
    
    // 再练一批
    elements.retryBtn.addEventListener('click', () => {
        elements.resultPanel.classList.add('hidden');
        elements.practiceFooter.style.display = 'flex';
        generateQuestions(true, state.wrongQuestions || []);
    });
    
    // 返回首页
    elements.backToHomeBtn.addEventListener('click', () => {
        showPage('home');
    });
    
    elements.backHomeFromResultBtn.addEventListener('click', () => {
        elements.resultPanel.classList.add('hidden');
        elements.practiceFooter.style.display = 'flex';
        showPage('home');
    });
    
    // 聊天页面
    elements.goChatBtn.addEventListener('click', () => {
        showPage('chat');
    });
    
    elements.goChatFromResultBtn.addEventListener('click', () => {
        elements.resultPanel.classList.add('hidden');
        elements.practiceFooter.style.display = 'flex';
        showPage('chat');
    });
    
    elements.backToHomeFromChatBtn.addEventListener('click', () => {
        showPage('home');
    });
    
    // 发送消息
    elements.sendBtn.addEventListener('click', sendMessage);
    
    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 自动调整输入框高度
    elements.chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // 模式切换
    elements.teachingModeBtn.addEventListener('click', () => {
        state.chatMode = 'teaching';
        elements.teachingModeBtn.classList.add('active');
        elements.chatModeBtn.classList.remove('active');
        
        // 清空聊天历史并显示提示
        state.chatHistory = [];
        elements.chatMessages.innerHTML = `
            <div class="message message-assistant">
                <div class="message-avatar">🦊</div>
                <div class="message-bubble">
                    <p>已切换到📚教学模式！</p>
                    <p>我会专注于帮你学习数学，有什么数学问题都可以问我哦~</p>
                </div>
            </div>
        `;
    });
    
    elements.chatModeBtn.addEventListener('click', () => {
        state.chatMode = 'chat';
        elements.chatModeBtn.classList.add('active');
        elements.teachingModeBtn.classList.remove('active');
        
        // 清空聊天历史并显示提示
        state.chatHistory = [];
        elements.chatMessages.innerHTML = `
            <div class="message message-assistant">
                <div class="message-avatar">🦊</div>
                <div class="message-bubble">
                    <p>已切换到💬聊天模式！</p>
                    <p>我们可以自由聊天啦~ 无论是学习还是生活，都可以和我说哦！😊</p>
                </div>
            </div>
        `;
    });
    
    // 设置弹窗
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.remove('hidden');
    });
    
    elements.closeSettingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.add('hidden');
    });
    
    document.querySelector('.modal-overlay').addEventListener('click', () => {
        elements.settingsModal.classList.add('hidden');
    });
    
    // 音量
    elements.volumeSlider.addEventListener('input', (e) => {
        state.settings.volume = parseInt(e.target.value);
        elements.volumeValue.textContent = state.settings.volume + '%';
        saveSettings();
    });
    
    // 亮度
    elements.brightnessSlider.addEventListener('input', (e) => {
        state.settings.brightness = parseInt(e.target.value);
        elements.brightnessValue.textContent = state.settings.brightness + '%';
        document.body.style.filter = `brightness(${state.settings.brightness}%)`;
        saveSettings();
    });
    
    // 音色
    elements.voiceSelect.addEventListener('change', (e) => {
        state.settings.aiVoice = e.target.value;
        saveSettings();
    });
    
    // 语言
    elements.languageSelect.addEventListener('change', (e) => {
        state.settings.language = e.target.value;
        saveSettings();
        updateLanguage();
        renderGradeCards();
        
        // 重新绑定年级卡片点击事件
        document.querySelectorAll('.grade-card').forEach(card => {
            card.addEventListener('click', () => selectGrade(parseInt(card.dataset.grade)));
        });
        
        if (state.currentGrade) {
            document.querySelectorAll('.grade-card').forEach(card => {
                if (parseInt(card.dataset.grade) === state.currentGrade) {
                    card.classList.add('selected');
                }
            });
        }
    });
    
    // 兑换码
    elements.redeemBtn.addEventListener('click', () => {
        const code = elements.redeemCodeInput.value.trim();
        if (code) {
            const success = checkRedeemCode(code);
            if (!success) {
                alert('兑换码无效哦~');
            }
            elements.redeemCodeInput.value = '';
        }
    });
    
    // 保存API Key
    elements.saveApiKeyBtn.addEventListener('click', () => {
        state.settings.apiKey = elements.apiKeyInput.value.trim();
        saveSettings();
        alert('API Key 已保存！');
    });
}

// ============ 启动 ============
init();
