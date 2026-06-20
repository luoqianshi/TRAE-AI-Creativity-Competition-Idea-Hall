// ========== AI Core: Main AI Router ==========
// 主AI（大AI）：负责路由分发、通用对话、切换/退出命令、页面切换等功能
// 小AI：各科目专业AI（generateStudentResponse内部按科目分发）

// AI操作日志 - 实时输出到面板
let aiLogEntries = [];
let aiLogPanelVisible = false;

// AI对话上下文记忆（最近5轮对话）
let aiConversationContext = [];
// 追踪AI最后发出的提问/提示，用于识别用户简短回复的上下文
let lastAIPrompt = '';
const MAX_CONTEXT_LENGTH = 5;
let lastSubject = '';
let lastTopic = '';
// 追踪AI最后完整响应，用于"继续"、"翻译这段话"、"解释更详细"命令
let lastAIResponseFull = '';
let lastAIResponseLength = 0;

// 学习进度追踪
let learningProgress = 0;
let quizCorrectCount = 0;
let quizTotalCount = 0;
// 连续答对追踪
let consecutiveCorrectCount = 0;
// 智能追问：记录上一次回答的主题
let lastAnswerTopic = '';

// ========== v3.1.0 增强对话系统状态 ==========
let currentDetailLevel = 'normal'; // normal | brief | detailed
let lastExampleTopic = ''; // 记录上次举例的主题，用于"换个例子"
let lastExplanationTopic = ''; // 记录上次解释的主题，用于"复习上次"
let userEmotionState = 'neutral'; // neutral | frustrated | excited
let emotionHistory = []; // 情绪历史记录
let lastThinkingSteps = []; // 上次思考步骤缓存
let typingIndicatorActive = false;

// ========== 会话记忆系统 ==========
const conversationMemory = {
    topics: [],        // 讨论过的主题
    userQuestions: [], // 最近的用户问题
    aiAnswers: [],    // 最近的AI回答
    corrections: [],   // AI被纠正的次数
    preferences: [],   // 观察到的用户偏好
    _maxTopics: 20,
    _maxHistory: 10,

    addTopic: function(topic) {
        if (!topic || typeof topic !== 'string') return;
        topic = topic.trim();
        // 避免重复
        if (this.topics.indexOf(topic) !== -1) return;
        this.topics.push(topic);
        if (this.topics.length > this._maxTopics) {
            this.topics.shift();
        }
    },

    getRecentTopics: function(n) {
        n = n || 5;
        return this.topics.slice(-n);
    },

    isFollowUp: function(question) {
        if (!question || this.topics.length === 0) return false;
        var q = question.toLowerCase();
        // 检查是否包含最近讨论过的主题关键词
        var recentTopics = this.getRecentTopics(5);
        for (var i = 0; i < recentTopics.length; i++) {
            var topic = recentTopics[i];
            // 如果问题中包含之前主题的关键词
            if (topic.length >= 2 && q.indexOf(topic.toLowerCase()) !== -1) {
                return true;
            }
        }
        // 检查追问模式
        var followUpPatterns = [/那.*呢/, /这个呢/, /它呢/, /还有呢/, /然后呢/, /接下来/, /上面.*呢/, /刚才.*呢/, /继续/, /再说一下/, /还有别的吗/, /换个角度/];
        for (var j = 0; j < followUpPatterns.length; j++) {
            if (followUpPatterns[j].test(q)) return true;
        }
        return false;
    },

    getRelatedContext: function(question) {
        if (!question || this.topics.length === 0) return null;
        var q = question.toLowerCase();
        var recentTopics = this.getRecentTopics(5);
        for (var i = recentTopics.length - 1; i >= 0; i--) {
            var topic = recentTopics[i];
            if (topic.length >= 2 && q.indexOf(topic.toLowerCase()) !== -1) {
                return {
                    topic: topic,
                    previousQuestions: this.userQuestions.filter(function(uq) {
                        return uq.toLowerCase().indexOf(topic.toLowerCase()) !== -1;
                    }).slice(-3),
                    previousAnswers: this.aiAnswers.filter(function(aa) {
                        return aa.toLowerCase().indexOf(topic.toLowerCase()) !== -1;
                    }).slice(-2)
                };
            }
        }
        return null;
    },

    recordInteraction: function(question, answer) {
        if (question && question.trim()) {
            this.userQuestions.push(question.trim());
            if (this.userQuestions.length > this._maxHistory) this.userQuestions.shift();
        }
        if (answer && answer.trim()) {
            this.aiAnswers.push(answer.trim());
            if (this.aiAnswers.length > this._maxHistory) this.aiAnswers.shift();
        }
    },

    recordCorrection: function() {
        this.corrections.push(Date.now());
        // 只保留最近10次
        if (this.corrections.length > 10) this.corrections.shift();
    },

    recordPreference: function(pref) {
        if (!pref) return;
        if (this.preferences.indexOf(pref) === -1) {
            this.preferences.push(pref);
        }
    },

    getCorrectionCount: function() {
        return this.corrections.length;
    },

    reset: function() {
        this.topics = [];
        this.userQuestions = [];
        this.aiAnswers = [];
        this.corrections = [];
        this.preferences = [];
    },

    // v3.1.0: 获取当前话题（最近的主题）
    getCurrentTopic: function() {
        if (this.topics.length === 0) return '';
        return this.topics[this.topics.length - 1];
    },

    // v3.1.0: 检测话题切换
    detectTopicSwitch: function(question) {
        if (!question || this.topics.length === 0) return { switched: false };
        var q = question.toLowerCase();
        var currentTopic = this.getCurrentTopic().toLowerCase();
        // 如果问题中包含完全不同的主题词，且与当前主题无关
        var subjectKeywords = {
            '数学': ['方程', '函数', '几何', '代数', '概率', '统计', '微积分', '导数', '积分'],
            '英语': ['单词', '语法', '时态', '从句', '翻译', '阅读', '写作'],
            '语文': ['古诗', '文言文', '成语', '作文', '阅读', '修辞'],
            '物理': ['力学', '电学', '光学', '热学', '牛顿', '电磁'],
            '化学': ['化学方程式', '元素', '酸碱', '氧化', '有机', '摩尔'],
            '生物': ['细胞', '基因', 'dna', '遗传', '进化', '生态'],
            '历史': ['朝代', '战争', '革命', '文明', '条约']
        };
        var newSubject = '';
        for (var subj in subjectKeywords) {
            var keywords = subjectKeywords[subj];
            for (var i = 0; i < keywords.length; i++) {
                if (q.indexOf(keywords[i]) !== -1) {
                    // 检查是否与当前主题属于同一科目
                    var currentSubject = '';
                    for (var s in subjectKeywords) {
                        if (subjectKeywords[s].some(function(k) { return currentTopic.indexOf(k) !== -1; })) {
                            currentSubject = s;
                            break;
                        }
                    }
                    if (currentSubject !== subj) {
                        newSubject = subj;
                        break;
                    }
                }
            }
            if (newSubject) break;
        }
        if (newSubject) {
            return { switched: true, from: currentTopic, toSubject: newSubject };
        }
        return { switched: false };
    }
};

// ========== 上下文感知响应系统 ==========
// 响应多样性：常见问题的多模板系统
const responseTemplates = {
    greeting: {
        morning: [
            '早上好！今天想学什么呢？',
            '早安！新的一天，新的知识等你来探索！',
            '早上好！一日之计在于晨，精神满满地开始学习吧！',
            '早上好！朝阳正好，正是读书的好时光！'
        ],
        afternoon: [
            '下午好！继续加油学习吧！',
            '下午好！午后学习效率也不错哦，继续努力！',
            '下午好！坚持学习，你很棒！',
            '下午好！休息好了就继续冲刺吧！'
        ],
        evening: [
            '晚上好！注意休息，适度学习哦~',
            '晚上好！今天学到了什么呢？',
            '晚上好！劳逸结合，学习更高效哦~',
            '晚上好！晚饭后来复习一下今天的内容吧！'
        ],
        night: [
            '夜深了，注意休息哦！有什么问题可以问我',
            '这么晚还在学习？辛苦了，注意休息哦！',
            '夜深了，早点休息吧，明天继续加油！',
            '熬夜学习也要注意身体哦，早点休息，养足精神明天再战！'
        ],
        tips: [
            '学习前先制定小目标，效率更高哦',
            '每学习45分钟休息10分钟，保持专注力',
            '今天试试用错题本复习一下薄弱环节',
            '背单词的最佳时间是早晨和睡前',
            '做数学题时先画图，思路更清晰',
            '阅读理解要带着问题去读文章',
            '学完新知识后，用自己的话复述一遍',
            '遇到难题不要急，先从简单步骤开始',
            '尝试用思维导图整理知识点，记忆更牢固',
            '多做练习题，熟能生巧'
        ]
    },
    farewell: [
        '临睡前回顾今天学的内容，记忆更牢固',
        '明天给自己定一个小目标，比如做5道数学题',
        '把今天学的新单词在脑子里过一遍',
        '错题本里的题记得定期复习哦',
        '坚持每天学习一点点，积少成多'
    ],
    thanks: [
        '不客气！有问题随时问我 😊',
        '不客气！能帮到你是我的荣幸。继续加油学习哦！',
        '不用谢！有问题随时来问我，我一直在这里。',
        '很高兴能帮到你！学习路上有我陪伴，加油！',
        '不客气！学无止境，有问题随时提问。',
        '别客气！能帮助你是我最大的快乐~',
        '不客气！祝你学习进步，天天开心！'
    ],
    encouragement: [
        '别灰心！学习就是不断试错的过程，你已经很棒了！',
        '没关系，这个知识点确实有难度，我们慢慢来。',
        '加油！每一次错误都是进步的机会！',
        '别着急，理解需要时间，多练习几次就好了。',
        '你很努力了！换个角度想想，也许就豁然开朗了。'
    ],
    knowledgeCheck: [
        '理解了吗？要不要我出个相关题目测试一下？',
        '这个概念清楚了吗？要不要来一道练习题巩固一下？',
        '觉得怎么样？要不要试试做一道相关题目？',
        '理解了的话，要不要我出个题考考你？',
        '需要我出一道练习题帮你巩固一下吗？'
    ]
};

// 获取随机问候语
function getContextualGreeting() {
    var hour = new Date().getHours();
    var period, greetings;
    if (hour >= 6 && hour < 12) {
        period = 'morning';
    } else if (hour >= 12 && hour < 18) {
        period = 'afternoon';
    } else if (hour >= 18 && hour < 22) {
        period = 'evening';
    } else {
        period = 'night';
    }
    greetings = responseTemplates.greeting[period];
    return greetings[Math.floor(Math.random() * greetings.length)];
}

// 获取随机学习小贴士
function getRandomTip() {
    var tips = responseTemplates.greeting.tips;
    return tips[Math.floor(Math.random() * tips.length)];
}

// 获取随机知识检查提示
function getKnowledgeCheckPrompt() {
    var checks = responseTemplates.knowledgeCheck;
    return checks[Math.floor(Math.random() * checks.length)];
}

// 获取随机鼓励语
function getRandomEncouragement() {
    var items = responseTemplates.encouragement;
    return items[Math.floor(Math.random() * items.length)];
}

// ========== 多意图检测系统 ==========
function detectMultipleIntents(question) {
    var intents = [];
    var q = question.toLowerCase();

    // 数学/计算意图
    if (/计算|算|求.*值|解方程|等于多少|面积|体积|周长|速度|距离|时间|多少.*钱/.test(q)) {
        intents.push({ type: 'math_solve', keywords: '计算/求解' });
    }

    // 翻译意图
    if (/翻译|translate|的英文|的中文|用英语说|用中文说/.test(q)) {
        intents.push({ type: 'translate', keywords: '翻译' });
    }

    // 对比/比较意图
    if (/比较|对比|区别|差异|不同|异同/.test(q)) {
        intents.push({ type: 'compare', keywords: '对比' });
    }

    // 列表/表格意图
    if (/列表|表格|做个表|整理成|列出|列举|有哪些/.test(q)) {
        intents.push({ type: 'table_format', keywords: '表格/列表' });
    }

    // 解释/定义意图
    if (/解释|什么意思|是什么|定义|什么叫|什么是/.test(q)) {
        intents.push({ type: 'explain', keywords: '解释' });
    }

    // 出题意图
    if (/出题|来道|练习|测试|考考/.test(q)) {
        intents.push({ type: 'quiz', keywords: '出题' });
    }

    // 总结意图
    if (/总结|概括|归纳|梳理/.test(q)) {
        intents.push({ type: 'summarize', keywords: '总结' });
    }

    // 举例意图
    if (/举例|例子|比如|例如|实例/.test(q)) {
        intents.push({ type: 'example', keywords: '举例' });
    }

    return intents;
}

// ========== 歧义检测系统 ==========
function detectAmbiguity(question) {
    var q = question.trim();
    var ambiguities = [];

    // 学科名称和常见命令词不视为歧义
    var subjectNames = ['数学', '英语', '语文', '物理', '化学', '生物', '历史', '政治', '地理', '法律', '心理', '编程'];
    var commandWords = ['总结', '对比', '举例', '复习', '公式', '出题', '翻译', '解释', '定义', '计算', '继续', '退出'];
    for (var i = 0; i < subjectNames.length; i++) {
        if (q === subjectNames[i]) return ambiguities;
    }
    for (var j = 0; j < commandWords.length; j++) {
        if (q === commandWords[j]) return ambiguities;
    }

    // 指代不明确
    if (/这个|那个|它|这道题|这个公式|那个定理|这个概念/.test(q)) {
        // 检查是否有足够的上下文
        var hasContext = conversationMemory.topics.length > 0;
        if (!hasContext && q.length < 15) {
            ambiguities.push({
                type: 'vague_reference',
                message: '请问您指的是哪个？可以描述一下或提供更多信息吗？'
            });
        }
    }

    // 缺少具体内容的请求
    if (/解这个方程|解这道题|算这个|帮我算/.test(q) && !/[\d]/.test(q) && !/[a-zA-Z]/.test(q)) {
        ambiguities.push({
            type: 'missing_equation',
            message: '请告诉我具体的方程或题目是什么？'
        });
    }

    // 过于简短的问题（排除学科名和命令词后）
    if (q.length <= 4 && !isGreeting(q) && !isFarewell(q) && !isThanks(q)) {
        ambiguities.push({
            type: 'too_short',
            message: '您的问题似乎太简短了，能详细描述一下吗？'
        });
    }

    // "面积"等歧义词
    if (/^面积[是多大|多少|怎么算]?$/.test(q) || /^面积$/.test(q)) {
        ambiguities.push({
            type: 'ambiguous_term',
            message: '请问您想了解什么的面积？比如三角形、圆形、某个国家等？'
        });
    }

    // "那个公式"类
    if (/那个公式|这个公式|那个定理|这个定理/.test(q) && q.length < 20) {
        ambiguities.push({
            type: 'vague_formula',
            message: '请问您指的是哪个公式？可以描述一下它的用途或名称吗？'
        });
    }

    return ambiguities;
}

// ========== 上下文感知响应 ==========
function getContextAwareResponse(question, subjectName) {
    var q = question.toLowerCase();
    var subjectContext = '';

    // 根据当前科目调整歧义词的含义
    if (/面积/.test(q)) {
        if (subjectName === '数学') {
            subjectContext = '（数学中的面积计算）';
        } else if (subjectName === '地理') {
            subjectContext = '（地理中的区域面积）';
        }
    }

    // 根据科目调整"速度"的含义
    if (/速度/.test(q)) {
        if (subjectName === '物理') {
            subjectContext = '（物理中的速度概念）';
        } else if (subjectName === '数学') {
            subjectContext = '（数学中的速率问题）';
        }
    }

    // 根据科目调整"变化"的含义
    if (/变化/.test(q)) {
        if (subjectName === '化学') {
            subjectContext = '（化学变化）';
        } else if (subjectName === '物理') {
            subjectContext = '（物理变化）';
        } else if (subjectName === '历史') {
            subjectContext = '（历史变迁）';
        }
    }

    return subjectContext;
}

// ========== 话题延续检测 ==========
function detectTopicContinuation(question) {
    var relatedContext = conversationMemory.getRelatedContext(question);
    if (relatedContext) {
        return {
            isContinuation: true,
            topic: relatedContext.topic,
            context: relatedContext
        };
    }
    return { isContinuation: false };
}

// ========== Rich AI Response Rendering Functions ==========

function renderTable(headers, rows) {
    let html = '<table class="ai-table"><thead><tr>';
    headers.forEach(h => html += '<th>' + h + '</th>');
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => html += '<td>' + cell + '</td>');
        html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
}

function renderCoordinate(points, options) {
    options = options || {};
    const w = 300, h = 200;
    let svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" style="background:var(--bg-tertiary);border-radius:8px;padding:10px;">';

    // Axis labels
    svg += '<text x="' + (w - 20) + '" y="' + (h - 14) + '" fill="var(--text-muted)" font-size="10">x</text>';
    svg += '<text x="18" y="14" fill="var(--text-muted)" font-size="10">y</text>';

    if (options.type === 'hyperbola') {
        const k = options.k || 1;
        const originX = w / 2;
        const originY = h / 2;
        const scaleX = (w - 60) / 10;
        const scaleY = (h - 60) / 10;

        // Draw axes through center for hyperbola
        svg += '<line x1="30" y1="' + originY + '" x2="' + (w - 10) + '" y2="' + originY + '" stroke="var(--text-muted)" stroke-width="1"/>';
        svg += '<line x1="' + originX + '" y1="10" x2="' + originX + '" y2="' + (h - 10) + '" stroke="var(--text-muted)" stroke-width="1"/>';

        // Asymptotes (dashed)
        svg += '<line x1="' + originX + '" y1="10" x2="' + originX + '" y2="' + (h - 10) + '" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4,4" opacity="0.5"/>';
        svg += '<line x1="30" y1="' + originY + '" x2="' + (w - 10) + '" y2="' + originY + '" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4,4" opacity="0.5"/>';

        // Asymptote labels
        svg += '<text x="' + (originX + 4) + '" y="18" fill="var(--text-muted)" font-size="9" opacity="0.7">y=0</text>';
        svg += '<text x="' + (w - 36) + '" y="' + (originY - 4) + '" fill="var(--text-muted)" font-size="9" opacity="0.7">x=0</text>';

        // Generate hyperbola path points
        function toSvgX(val) { return originX + val * scaleX; }
        function toSvgY(val) { return originY - val * scaleY; }

        // Right branch (x > 0)
        let rightPath = '';
        for (let x = 0.2; x <= 5; x += 0.05) {
            const y = k / x;
            if (y >= -5 && y <= 5) {
                const sx = toSvgX(x);
                const sy = toSvgY(y);
                rightPath += (rightPath ? ' L ' : 'M ') + sx + ' ' + sy;
            }
        }
        if (rightPath) svg += '<path d="' + rightPath + '" fill="none" stroke="var(--primary)" stroke-width="2"/>';

        // Left branch (x < 0)
        let leftPath = '';
        for (let x = -5; x <= -0.2; x += 0.05) {
            const y = k / x;
            if (y >= -5 && y <= 5) {
                const sx = toSvgX(x);
                const sy = toSvgY(y);
                leftPath += (leftPath ? ' L ' : 'M ') + sx + ' ' + sy;
            }
        }
        if (leftPath) svg += '<path d="' + leftPath + '" fill="none" stroke="var(--primary)" stroke-width="2"/>';

        // Key points
        const keyPoints = k > 0 ? [[1, k], [k, 1], [-1, -k], [-k, -1]] : [[1, k], [-1, -k]];
        keyPoints.forEach(function(p) {
            const sx = toSvgX(p[0]);
            const sy = toSvgY(p[1]);
            if (sx >= 30 && sx <= w - 10 && sy >= 10 && sy <= h - 10) {
                svg += '<circle cx="' + sx + '" cy="' + sy + '" r="3" fill="var(--accent)"/>';
                svg += '<text x="' + (sx + 5) + '" y="' + (sy - 5) + '" fill="var(--text-secondary)" font-size="9">(' + p[0] + ',' + p[1] + ')</text>';
            }
        });
    } else {
        // Default linear/quadratic coordinate rendering
        svg += '<line x1="30" y1="' + (h - 30) + '" x2="' + (w - 10) + '" y2="' + (h - 30) + '" stroke="var(--text-muted)" stroke-width="1"/>';
        svg += '<line x1="30" y1="10" x2="30" y2="' + (h - 30) + '" stroke="var(--text-muted)" stroke-width="1"/>';
        points.forEach(p => {
            const x = 30 + p[0] * ((w - 40) / 10);
            const y = (h - 30) - p[1] * ((h - 40) / 10);
            svg += '<circle cx="' + x + '" cy="' + y + '" r="4" fill="var(--primary)"/>';
            if (p.length > 2) svg += '<text x="' + (x + 6) + '" y="' + (y + 4) + '" fill="var(--text-secondary)" font-size="10">' + p[2] + '</text>';
        });
    }

    svg += '</svg>';
    return svg;
}

function renderFileDownload(filename, content) {
    const id = 'file_' + Date.now();
    return '<div class="ai-file-download">' +
        '<i class="fas fa-file-download"></i> ' + filename +
        '<button onclick="downloadAIFile(\'' + id + '\')" style="margin-left:8px;padding:2px 8px;border:1px solid var(--primary);color:var(--primary);background:none;border-radius:4px;cursor:pointer;">下载</button>' +
        '<textarea id="' + id + '" style="display:none;">' + escapeHtml(content) + '</textarea>' +
    '</div>';
}

function downloadAIFile(id) {
    const el = document.getElementById(id);
    if (el) {
        const blob = new Blob([el.value], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = el.closest('.ai-file-download').textContent.trim().split('\n')[0].trim();
        a.click();
        URL.revokeObjectURL(a.href);
    }
}

function renderCodeBlock(lang, code) {
    return '<div class="ai-code-block">' +
        '<div class="ai-code-header"><span>' + lang + '</span><button onclick="copyCodeBlock(this)">复制</button></div>' +
        '<pre><code>' + escapeHtml(code) + '</code></pre>' +
    '</div>';
}

function copyCodeBlock(btn) {
    const code = btn.closest('.ai-code-block').querySelector('code');
    if (code) {
        navigator.clipboard.writeText(code.textContent).then(() => {
            btn.textContent = '已复制';
            setTimeout(() => btn.textContent = '复制', 1500);
        });
    }
}

// ========== 相关话题建议系统 ==========
function suggestRelatedTopics(subject, currentTopic) {
    var subjectMap = {
        '数学': 'math', '英语': 'english', '语文': 'chinese', '物理': 'physics',
        '化学': 'chemistry', '生物': 'biology', '历史': 'history', '政治': 'politics'
    };
    var key = subjectMap[subject] || 'math';

    var suggestions = {
        math: {
            '方程': ['函数', '不等式', '坐标系'],
            '函数': ['方程', '导数', '数列'],
            '几何': ['三角函数', '向量', '解析几何'],
            '三角函数': ['几何', '向量', '解三角形'],
            '导数': ['函数', '积分', '极值'],
            '数列': ['函数', '不等式', '数学归纳法'],
            '概率': ['统计', '排列组合', '期望'],
            '不等式': ['方程', '函数', '线性规划'],
            '向量': ['几何', '三角函数', '解析几何'],
            '解析几何': ['函数', '向量', '坐标变换'],
            '积分': ['导数', '微分方程', '面积计算'],
            '排列组合': ['概率', '二项式定理', '统计'],
            '矩阵': ['行列式', '线性方程组', '向量空间'],
            '极限': ['导数', '连续性', '级数'],
            '微积分': ['导数', '积分', '极限'],
            '圆': ['椭圆', '抛物线', '双曲线'],
            '椭圆': ['双曲线', '抛物线', '圆'],
            '应用题': ['方程', '函数', '不等式'],
            '代数': ['方程', '函数', '多项式'],
            '多项式': ['因式分解', '方程', '不等式']
        },
        english: {
            '时态': ['从句', '虚拟语气', '被动语态'],
            '词汇': ['短语', '习语', '构词法'],
            '语法': ['从句', '时态', '虚拟语气'],
            '从句': ['时态', '虚拟语气', '倒装句'],
            '虚拟语气': ['从句', '条件句', '倒装句'],
            '被动语态': ['时态', '主动语态', '分词'],
            '阅读': ['词汇', '语法', '写作'],
            '写作': ['语法', '词汇', '句型'],
            '翻译': ['词汇', '语法', '阅读'],
            '听力': ['发音', '词汇', '口语'],
            '口语': ['发音', '词汇', '听力'],
            '发音': ['口语', '听力', '音标'],
            '习语': ['词汇', '短语', '俚语'],
            '短语': ['词汇', '习语', '介词搭配'],
            '定语从句': ['状语从句', '名词性从句', '时态'],
            '状语从句': ['定语从句', '名词性从句', '虚拟语气'],
            '倒装句': ['虚拟语气', '从句', '强调句'],
            '非谓语': ['从句', '时态', '分词']
        },
        chinese: {
            '古诗': ['文言文', '成语', '修辞手法'],
            '文言文': ['古诗', '成语', '实词虚词'],
            '成语': ['古诗', '文言文', '修辞手法'],
            '作文': ['修辞手法', '阅读理解', '素材积累'],
            '阅读理解': ['作文', '古诗', '文言文'],
            '修辞手法': ['作文', '古诗', '阅读理解'],
            '诗词': ['文言文', '作者', '朝代'],
            '作者': ['诗词', '朝代', '作品'],
            '朝代': ['作者', '历史事件', '文化'],
            '实词虚词': ['文言文', '古诗', '句式'],
            '小说': ['散文', '戏剧', '作者'],
            '散文': ['小说', '诗词', '修辞手法'],
            '名著': ['作者', '朝代', '文学常识']
        },
        physics: {
            '力学': ['运动学', '牛顿定律', '能量守恒'],
            '电学': ['磁场', '电路', '电磁感应'],
            '光学': ['波动', '折射', '干涉'],
            '热学': ['能量守恒', '气体定律', '热力学'],
            '牛顿定律': ['运动学', '力学', '动量'],
            '能量守恒': ['力学', '热学', '功和功率'],
            '电磁感应': ['电学', '磁场', '电路'],
            '电路': ['电学', '电磁感应', '欧姆定律'],
            '动量': ['牛顿定律', '力学', '能量守恒'],
            '波动': ['光学', '声学', '干涉']
        },
        chemistry: {
            '化学方程式': ['氧化还原', '离子反应', '化学平衡'],
            '元素周期': ['原子结构', '化学键', '元素性质'],
            '酸碱': ['盐', '离子反应', 'pH'],
            '氧化还原': ['化学方程式', '电化学', '有机化学'],
            '有机化学': ['化学方程式', '同分异构', '官能团'],
            '电化学': ['氧化还原', '电池', '电解'],
            '化学平衡': ['化学反应速率', '勒夏特列原理', '化学方程式'],
            '原子结构': ['元素周期', '化学键', '电子云'],
            '化学键': ['原子结构', '分子结构', '元素周期']
        },
        biology: {
            '细胞': ['DNA', '蛋白质', '细胞分裂'],
            '基因': ['DNA', '遗传', '变异'],
            'DNA': ['基因', '遗传', '蛋白质'],
            '遗传': ['基因', '变异', '进化'],
            '进化': ['遗传', '自然选择', '生态系统'],
            '生态系统': ['食物链', '能量流动', '物质循环'],
            '光合作用': ['呼吸作用', '细胞', '植物'],
            '蛋白质': ['DNA', '细胞', '酶'],
            '人体': ['消化系统', '循环系统', '神经系统']
        },
        history: {
            '朝代': ['历史事件', '皇帝', '文化'],
            '战争': ['条约', '革命', '历史事件'],
            '革命': ['战争', '条约', '社会变革'],
            '文明': ['朝代', '文化', '科技'],
            '条约': ['战争', '革命', '外交'],
            '皇帝': ['朝代', '政治制度', '历史事件'],
            '工业革命': ['科技', '社会变革', '经济'],
            '文艺复兴': ['文化', '科技', '思想']
        },
        politics: {
            '政治制度': ['宪法', '民主', '法治'],
            '经济': ['市场经济', '全球化', '社会主义'],
            '法律': ['宪法', '法治', '公民权利'],
            '民主': ['法治', '政治制度', '公民权利'],
            '核心价值观': ['道德', '法治', '文化'],
            '宪法': ['法律', '政治制度', '公民权利']
        }
    };

    var subjectSuggestions = suggestions[key] || {};
    // 尝试匹配当前话题
    for (var topic in subjectSuggestions) {
        if (currentTopic && currentTopic.indexOf(topic) !== -1) {
            return subjectSuggestions[topic];
        }
    }
    // 如果没有精确匹配，返回该科目的热门话题
    var topics = Object.keys(subjectSuggestions);
    if (topics.length > 0) {
        // 随机返回3个话题
        var shuffled = topics.slice().sort(function() { return 0.5 - Math.random(); });
        return shuffled.slice(0, 3);
    }
    return ['基础概念', '练习题', '知识总结'];
}

// 渲染话题建议chips
function renderTopicChips(topics) {
    if (!topics || topics.length === 0) return '';
    var html = '\n\n📌 **相关推荐**\n\n';
    html += '<div class="topic-chips">';
    for (var i = 0; i < topics.length; i++) {
        html += '<span class="topic-chip" onclick="handleTopicChipClick(\'' + topics[i] + '\')" title="点击探索「' + topics[i] + '」">' + topics[i] + '</span>';
    }
    html += '</div>';
    return html;
}

// 处理话题chip点击
function handleTopicChipClick(topic) {
    var input = document.getElementById('questionInput') || document.querySelector('.text-input-wrapper textarea');
    if (input) {
        input.value = '讲解一下' + topic;
        input.focus();
        // 触发发送
        if (typeof handleSend === 'function') {
            handleSend();
        } else if (typeof sendMessage === 'function') {
            sendMessage();
        }
    }
}

// ========== v3.1.0 增强对话流系统 ==========

// 打字延迟系统：根据响应长度动态调整
function getTypingDelay(textLength) {
    if (textLength <= 50) return 300;
    if (textLength <= 150) return 600;
    if (textLength <= 300) return 1000;
    if (textLength <= 600) return 1500;
    if (textLength <= 1000) return 2200;
    return 3000;
}

// 显示"AI正在思考..."指示器（带动画点）
function showThinkingIndicator() {
    var html = '<div class="ai-thinking-indicator" id="aiThinkingIndicator">';
    html += '<span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span>';
    html += '</div>';
    return html;
}

// 隐藏思考指示器
function hideThinkingIndicator() {
    var el = document.getElementById('aiThinkingIndicator');
    if (el) el.remove();
}

// v3.1.0: 可折叠思考步骤（默认折叠）
function showThinkingSteps(steps) {
    var id = 'thinking_' + Date.now();
    var html = '<div class="ai-thinking collapsed" id="' + id + '" onclick="toggleThinkingSteps(\'' + id + '\')">';
    html += '<div class="ai-thinking-header">';
    html += '<i class="fas fa-brain"></i> AI思考过程 ';
    html += '<span class="thinking-toggle-text">（点击展开）</span>';
    html += '<i class="fas fa-chevron-down toggle-icon"></i>';
    html += '</div>';
    html += '<div class="ai-thinking-body" style="display:none;">';
    steps.forEach(function(step, i) {
        html += '<div class="thinking-step"><span class="step-num">' + (i + 1) + '</span> ' + step + '</div>';
    });
    html += '</div></div>';
    return html;
}

// 切换思考步骤展开/收起
function toggleThinkingSteps(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var isCollapsed = el.classList.contains('collapsed');
    var body = el.querySelector('.ai-thinking-body');
    var icon = el.querySelector('.toggle-icon');
    var text = el.querySelector('.thinking-toggle-text');
    if (isCollapsed) {
        el.classList.remove('collapsed');
        if (body) body.style.display = 'block';
        if (icon) icon.style.transform = 'rotate(180deg)';
        if (text) text.textContent = '（点击收起）';
    } else {
        el.classList.add('collapsed');
        if (body) body.style.display = 'none';
        if (icon) icon.style.transform = 'rotate(0deg)';
        if (text) text.textContent = '（点击展开）';
    }
}

// ========== v3.1.0 话题过渡语系统 ==========
function getTopicTransitionPhrase(fromSubject, toSubject) {
    var transitions = [
        '好的，我们换个话题，来看看' + toSubject + '的内容吧！',
        '明白了，接下来我们看看' + toSubject + '的相关知识。',
        '没问题！从' + (fromSubject || '刚才的话题') + '转到' + toSubject + '，我们继续学习！',
        '好的，切换到' + toSubject + '。学习要全面发展，这个也很重要哦！',
        '收到！我们来探索' + toSubject + '的奥秘吧！'
    ];
    return transitions[Math.floor(Math.random() * transitions.length)];
}

// ========== v3.1.0 改进的错误处理系统 ==========

// 智能不理解引导：根据问题特征提供具体建议
function getSmartClarification(question) {
    var q = (question || '').toLowerCase();
    // 检测数字和运算符 -> 可能是数学
    if (/[\d\(\)\[\]\{\}]/.test(q) && /[+\-*/÷×=]/.test(q)) {
        return '你问的是数学问题吗？可以告诉我具体的题目内容，比如方程、几何图形或应用题。';
    }
    // 检测英文单词
    if (/[a-zA-Z]{3,}/.test(q)) {
        return '这个问题涉及英语内容吗？可以告诉我你想查单词、学语法还是做翻译。';
    }
    // 检测古诗/文言文关键词
    if (/诗|词|文|句|作者|朝代|翻译|释义/.test(q)) {
        return '这个问题涉及语文内容吗？可以告诉我具体的诗句、文言文或成语。';
    }
    // 检测物理/化学/生物关键词
    if (/力|速度|加速度|能量|功|功率/.test(q)) {
        return '这个问题涉及物理吗？可以告诉我具体的物理概念或题目。';
    }
    if (/化学|元素|反应|方程式|分子|原子/.test(q)) {
        return '这个问题涉及化学吗？可以告诉我具体的化学反应或概念。';
    }
    if (/细胞|基因|dna|蛋白质|遗传/.test(q)) {
        return '这个问题涉及生物吗？可以告诉我具体的生物概念或过程。';
    }
    // 检测历史
    if (/朝代|皇帝|战争|革命|条约|历史/.test(q)) {
        return '这个问题涉及历史吗？可以告诉我具体的历史事件或人物。';
    }
    // 默认引导
    return '这个问题涉及哪个科目呢？可以告诉我数学、英语、语文、物理、化学、生物或历史中的某一个。';
}

// "Did you mean?" 建议系统
function getDidYouMeanSuggestions(question) {
    var q = (question || '').toLowerCase().trim();
    if (!q || q.length < 2) return null;
    var suggestions = [];
    // 常见拼写错误映射
    var typoMap = [
        { wrong: /处一[到道]/g, right: '出一道', pattern: '出题' },
        { wrong: /处几/g, right: '出几', pattern: '出题' },
        { wrong: /以经/g, right: '已经', pattern: '已经' },
        { wrong: /因该/g, right: '应该', pattern: '应该' },
        { wrong: /做业/g, right: '作业', pattern: '作业' },
        { wrong: /题问/g, right: '问题', pattern: '问题' },
        { wrong: /时后/g, right: '时候', pattern: '时候' },
        { wrong: /知到/g, right: '知道', pattern: '知道' },
        { wrong: /觉的/g, right: '觉得', pattern: '觉得' },
        { wrong: /支道/g, right: '知道', pattern: '知道' },
        { wrong: /玩成/g, right: '完成', pattern: '完成' },
        { wrong: /回达/g, right: '回答', pattern: '回答' },
        { wrong: /问提/g, right: '问题', pattern: '问题' },
        { wrong: /英于/g, right: '英语', pattern: '英语' },
        { wrong: /数于/g, right: '数学', pattern: '数学' },
        { wrong: /语于/g, right: '语文', pattern: '语文' },
        { wrong: /物于/g, right: '物理', pattern: '物理' },
        { wrong: /化于/g, right: '化学', pattern: '化学' },
        { wrong: /生勿/g, right: '生物', pattern: '生物' },
        { wrong: /历吏/g, right: '历史', pattern: '历史' }
    ];
    typoMap.forEach(function(item) {
        if (item.wrong.test(q)) {
            var corrected = q.replace(item.wrong, item.right);
            suggestions.push({ original: question, corrected: corrected, reason: '你可能想输入"' + item.pattern + '"' });
        }
    });
    // 模糊匹配常见命令
    var commandPatterns = [
        { pattern: /复[习羽]|温[习羽]|复[读誩]/, cmd: '复习', suggest: '复习上次' },
        { pattern: /举[例列]|例[子子]|举[个個]/, cmd: '举例', suggest: '举个例子' },
        { pattern: /简[单單]|简[洁絜]|简[略]/, cmd: '简单', suggest: '简单点' },
        { pattern: /详[细細]|详[尽盡]|详[解]/, cmd: '详细', suggest: '详细点' },
        { pattern: /图[片画]|画[图圖]|图[解]/, cmd: '图解', suggest: '用图解释' },
        { pattern: /出[题題]|练[习習]|测[试試]/, cmd: '出题', suggest: '出题' },
        { pattern: /总[结結]|概[括扩]|归[纳納]/, cmd: '总结', suggest: '总结' }
    ];
    commandPatterns.forEach(function(item) {
        if (item.pattern.test(q) && q.length <= 6) {
            suggestions.push({ original: question, corrected: item.suggest, reason: '你可能想使用"' + item.cmd + '"命令' });
        }
    });
    return suggestions.length > 0 ? suggestions : null;
}

function renderDidYouMean(suggestions) {
    if (!suggestions || suggestions.length === 0) return '';
    var html = '\n\n💡 **你是不是想问：**\n\n';
    suggestions.forEach(function(s, i) {
        html += (i + 1) + '. 「' + s.corrected + '」 — ' + s.reason + '\n';
    });
    html += '\n点击上方建议，或直接重新输入你的问题。';
    return html;
}

// ========== v3.1.0 交互元素渲染 ==========

// 可展开/收起的详情区域
function renderCollapsibleSection(title, content, sectionId) {
    var id = sectionId || 'collapsible_' + Date.now();
    var html = '<div class="ai-collapsible" id="' + id + '">';
    html += '<button class="ai-collapsible-toggle" onclick="toggleCollapsible(\'' + id + '\')">';
    html += '<span class="toggle-text">展开详情</span> <i class="fas fa-chevron-down"></i>';
    html += '</button>';
    html += '<div class="ai-collapsible-content" style="display:none;">' + content + '</div>';
    html += '</div>';
    return html;
}

function toggleCollapsible(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var content = el.querySelector('.ai-collapsible-content');
    var text = el.querySelector('.toggle-text');
    var icon = el.querySelector('.fa-chevron-down');
    if (!content) return;
    if (content.style.display === 'none') {
        content.style.display = 'block';
        if (text) text.textContent = '收起';
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        if (text) text.textContent = '展开详情';
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
}

// 生成快速测试按钮
function renderQuickQuizButton(topic) {
    var safeTopic = (topic || '').replace(/'/g, '\\\'').replace(/"/g, '\\"');
    return '<button class="ai-action-btn quiz-btn" onclick="requestQuickQuiz(\'' + safeTopic + '\')">👆 点击测试</button>';
}

// 生成延伸阅读链接
function renderExtendedReadingLinks(subject, topic) {
    var links = suggestRelatedTopics(subject, topic);
    if (!links || links.length === 0) return '';
    var html = '<div class="ai-extended-reading">';
    html += '<div class="extended-reading-title">📖 延伸阅读</div>';
    html += '<div class="extended-reading-links">';
    links.forEach(function(link) {
        html += '<span class="extended-link" onclick="handleTopicChipClick(\'' + link + '\')">' + link + '</span>';
    });
    html += '</div></div>';
    return html;
}

// 请求快速测试
function requestQuickQuiz(topic) {
    var input = document.getElementById('questionInput') || document.querySelector('.text-input-wrapper textarea');
    if (input) {
        input.value = '出一道' + (topic || '') + '的测试题';
        input.focus();
        if (typeof handleSend === 'function') {
            handleSend();
        } else if (typeof sendMessage === 'function') {
            sendMessage();
        }
    }
}

// ========== v3.1.0 情感智能系统 ==========

// 检测用户挫折情绪
function detectFrustration(question) {
    var q = (question || '').toLowerCase();
    var frustrationPatterns = [
        /不会/, /太难了/, /不懂/, /好难/, /烦/, /累/, /学不会/,
        /做不来/, /搞不懂/, /完全不懂/, /看不懂/, /听不懂/,
        /好复杂/, /好晕/, /崩溃了/, /放弃了/, /学不进去/,
        /没明白/, /还是不会/, /怎么都/, /记不住/, /想放弃/,
        /郁闷/, /沮丧/, /失落/, /灰心/, /没信心/, /我不行/,
        /压力好大/, /好痛苦/, /受不了/, /想躺平/, /摆烂/
    ];
    for (var i = 0; i < frustrationPatterns.length; i++) {
        if (frustrationPatterns[i].test(q)) return true;
    }
    return false;
}

// 检测用户兴奋/成就感
function detectExcitement(question) {
    var q = (question || '').toLowerCase();
    var excitementPatterns = [
        /我会了[！!]/, /明白了[！!]/, /懂了[！!]/, /会了[！!]/,
        /终于会了/, /终于懂了/, /原来如此/, /悟了/, /开窍了/,
        /太棒了/, /好简单/, /easy/, /so easy/, /掌握了/,
        /记住了/, /做对了/, /全对/, /满分/, /厉害/, /牛/
    ];
    for (var i = 0; i < excitementPatterns.length; i++) {
        if (excitementPatterns[i].test(q)) return true;
    }
    return false;
}

// 检测用户情绪状态（更全面的情绪感知）
function detectEmotion(question) {
    var q = (question || '').toLowerCase();
    if (/开心|高兴|快乐|兴奋|激动|爽|耶|哈哈|嘿嘿|嘻嘻/.test(q)) return 'happy';
    if (/难过|伤心|想哭|悲伤|痛苦|绝望|无助/.test(q)) return 'sad';
    if (/生气|愤怒|恼火|讨厌|烦死了|气死了/.test(q)) return 'angry';
    if (/紧张|焦虑|担心|害怕|恐惧|慌|不安/.test(q)) return 'anxious';
    if (/无聊|没意思|没劲|空虚|迷茫/.test(q)) return 'bored';
    if (/困|累|疲惫|想睡|没精神/.test(q)) return 'tired';
    return 'neutral';
}

// 获取共情回应（挫折）
function getEmpathyResponse(question, topic) {
    var emotion = detectEmotion(question);
    var baseResponses = [
        '💚 **别灰心，学习本来就不是一蹴而就的！**\n\n每个人在学习新东西时都会遇到困难，这完全正常。让我用更简单的方式再给你讲一遍。',
        '💚 **没关系，我们慢慢来！**\n\n这个知识点确实有难度，很多学生在第一次接触时都会有类似的困惑。让我换个角度来解释。',
        '💚 **你已经很努力了！**\n\n遇到困难说明你在挑战自己，这是进步的开始。要不要我：\n• 用一个更简单的例子来说明\n• 把步骤拆得更细一些\n• 或者我们先休息一会儿，换个思路再来？',
        '💚 **加油，你可以的！**\n\n学习就像爬山，有时候需要停下来喘口气。让我用最基础的方式重新解释「' + (topic || '这个知识点') + '」。'
    ];
    // 根据具体情绪调整回应
    if (emotion === 'sad') {
        baseResponses.push('💙 **抱抱你**\n\n感觉你有点低落，学习固然重要，但你的心情更重要。要不要先休息一会儿，听听音乐或者做点让自己开心的事？我随时在这里等你。');
    } else if (emotion === 'angry') {
        baseResponses.push('🧡 **深呼吸，放松一下**\n\n感觉到你有点烦躁，这很正常。有时候题目确实让人火大！先深呼吸三次，然后我们换个思路再来，好吗？');
    } else if (emotion === 'anxious') {
        baseResponses.push('💜 **放轻松，不用急**\n\n感觉到你有点紧张，可能是考试压力或者对自己的期望太高。记住：学习是长跑，不是冲刺。一步一步来，你已经很棒了！');
    } else if (emotion === 'tired') {
        baseResponses.push('💛 **累了就休息吧**\n\n感觉到你很疲惫，大脑累了学习效率会很低。建议：\n• 趴桌上小憩10分钟\n• 起来走动走动\n• 吃点零食补充能量\n休息好了再回来，我等你！');
    }
    return baseResponses[Math.floor(Math.random() * baseResponses.length)];
}

// 获取庆祝回应（兴奋）
function getCelebrationResponse() {
    var responses = [
        '🎉 **太棒了！为你骄傲！**\n\n看到你说"会了"，我也跟着开心！学习就是这样，从"不会"到"会"的那一刻最有成就感。继续保持！',
        '🌟 **恭喜你！你做到了！**\n\n理解一个新知识点是值得庆祝的事情！这说明你的努力有了回报。要不要来一道练习题巩固一下？',
        '🔥 **厉害！这就是学习的快乐！**\n\n从困惑到顿悟，这就是知识的力量。你已经迈出了重要的一步，继续挑战更难的内容吧！',
        '✨ **真棒！给你点赞！**\n\n掌握新知识的感觉很棒对吧？这种成就感会推动你不断前进。接下来我们可以：\n• 做一道相关练习题\n• 学习更深入的拓展内容\n• 或者探索相关的下一个知识点',
        '🎊 **哇！我要把这个好消息记下来！**\n\n你的进步让我超级开心！这种"原来如此"的感觉就是学习的魅力所在。继续保持这份好奇心和热情，你会越来越厉害的！'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// 建议休息
function getBreakSuggestion() {
    return '\n\n☕ **要不要休息一下？**\n\n学习需要劳逸结合，建议：\n• 站起来活动一下身体\n• 喝杯水，深呼吸几次\n• 眺望远方，让眼睛休息\n• 5分钟后再回来，效果会更好哦！';
}

// ========== v3.1.0 命令系统扩展 ==========

// 处理"复习上次"命令
function handleReviewLast() {
    if (!lastExplanationTopic && !lastAnswerTopic) {
        return '❓ **复习上次**\n\n我还没有记录到上次学习的主题。\n\n你可以先问我一个问题，然后发送"复习上次"来回顾。';
    }
    var topic = lastExplanationTopic || lastAnswerTopic;
    return '📚 **复习：' + topic + '**\n\n让我帮你回顾一下刚才学习的要点：\n\n1. **核心概念**：' + topic + '的基本定义和原理\n2. **关键公式/要点**：需要重点记忆的内容\n3. **常见应用**：考试中常见的考查方式\n\n💡 需要我出一道复习题来检验掌握情况吗？发送"出题"即可！';
}

// 处理"换个例子"命令
function handleDifferentExample() {
    if (!lastExampleTopic && !lastAnswerTopic) {
        return '❓ **换个例子**\n\n我还没有记录到上次举例的主题。\n\n你可以先让我举个例子，然后发送"换个例子"获取不同的示例。';
    }
    var topic = lastExampleTopic || lastAnswerTopic;
    var examples = {
        '数学': '换个角度理解数学：把数学公式想象成"食谱"，变量就是食材，等号就是烹饪步骤，解方程就是按照步骤做出美味佳肴！',
        '英语': '换个方式学英语：把背单词想象成"交朋友"，第一次见面记住名字（拼写），第二次见面记住爱好（词义），第三次见面就能聊上天（运用）！',
        '物理': '换个思路学物理：把力学想象成"推箱子游戏"，力就是推力，质量就是箱子重量，加速度就是箱子移动的速度变化！',
        '化学': '换个视角学化学：把化学反应想象成"舞会"，原子就是舞者，化学键就是牵手，反应就是交换舞伴重新组合！',
        '生物': '换个比喻学生物：把细胞想象成"工厂"，细胞核是总部，线粒体是发电厂，核糖体是生产车间，各司其职！'
    };
    var subjectHint = '';
    for (var subj in examples) {
        if (topic.indexOf(subj) !== -1 || lastSubject.indexOf(subj) !== -1) {
            subjectHint = examples[subj];
            break;
        }
    }
    return '📌 **换个例子：' + topic + '**\n\n' + (subjectHint || '让我用一个生活中的例子来解释「' + topic + '」：\n\n想象你在整理房间——分类整理就是归纳总结，把东西放回原位就是应用公式，检查是否遗漏就是验证答案。学习和整理房间一样，需要条理和方法！') + '\n\n💡 这个例子有帮助吗？需要我再换一个吗？';
}

// 处理"简单点"命令
function handleSimpler() {
    currentDetailLevel = 'brief';
    return '✅ **已调整为简洁模式**\n\n好的，接下来我会用更简单、更直接的方式回答你的问题。\n\n我会：\n• 减少专业术语的使用\n• 多用类比和生活例子\n• 突出重点，省略次要细节\n• 分步骤讲解，每步都很简短\n\n如果你之后想要更详细的解释，随时发送"详细点"！';
}

// 处理"详细点"命令
function handleMoreDetailed() {
    currentDetailLevel = 'detailed';
    return '✅ **已调整为详细模式**\n\n好的，接下来我会提供更详细、更深入的解释。\n\n我会：\n• 补充更多背景知识和推导过程\n• 提供多个不同角度的解释\n• 加入更多例子和应用场景\n• 解释相关的拓展概念\n\n如果你之后想要更简洁的回答，随时发送"简单点"！';
}

// 处理"用图解释"命令
function handleVisualExplain() {
    var topic = lastAnswerTopic || lastExplanationTopic || lastTopic;
    if (!topic) {
        return '❓ **用图解释**\n\n请先告诉我你想了解什么概念，我会尝试用图表或示意图来解释。\n\n例如：\n• "用图解释勾股定理"\n• "画一下二次函数图像"\n• "用图说明光合作用"';
    }
    // 尝试生成相关图表
    var visualContent = '';
    if (/函数|方程|几何|坐标/.test(topic)) {
        var samplePoints = [];
        for (var x = 0; x <= 10; x++) {
            samplePoints.push([x, parseFloat((0.5 * x + 1).toFixed(1))]);
        }
        visualContent = renderCoordinate(samplePoints);
    } else if (/对比|比较|区别/.test(topic)) {
        visualContent = renderTable(
            ['对比项', 'A', 'B'],
            [['定义', '待描述', '待描述'], ['特点', '待描述', '待描述'], ['例子', '待描述', '待描述']]
        );
    } else {
        visualContent = '📊 **「' + topic + '」知识结构图**\n\n```\n        「' + topic + '」\n       /    |    \\\n    定义   公式   应用\n     |      |      |\n   概念   推导   例题\n     |      |      |\n   例子   证明   练习\n```\n\n💡 由于我是文本AI，无法直接绘制复杂图形。建议：\n• 结合教材中的插图学习\n• 使用绘图工具自己画一遍\n• 发送"举例"获取具体数值来辅助理解';
    }
    return '📊 **用图解释：' + topic + '**\n\n' + visualContent + '\n\n💡 图形化学习能帮助建立直观理解。建议你在纸上也画一遍，记忆会更深刻！';
}

// ========== v3.2.0 新增命令处理函数 ==========

// 处理"总结要点"命令
function handleSummarizePoints(cleanQ) {
    var topic = lastAnswerTopic || lastExplanationTopic || lastTopic || cleanQ.replace(/总结要点|要点总结|归纳要点|提炼要点|核心要点/g, '').trim();
    if (!topic) {
        return '❓ **总结要点**\n\n请告诉我你想总结哪个知识点的要点，或者先让我解释一个概念，然后发送"总结要点"。';
    }
    return '📋 **「' + topic + '」要点总结**\n\n' +
        '1️⃣ **核心定义**：' + topic + '的本质是什么\n' +
        '2️⃣ **关键公式/原理**：需要重点记忆的内容\n' +
        '3️⃣ **适用条件**：什么情况下可以使用/适用\n' +
        '4️⃣ **常见应用**：考试中常考的题型和场景\n' +
        '5️⃣ **易错提醒**：容易混淆或出错的地方\n\n' +
        '💡 需要我针对某一点详细展开吗？';
}

// 处理"对比区别"命令
function handleCompareDiff(cleanQ) {
    var topic = lastAnswerTopic || lastTopic || cleanQ.replace(/对比区别|区别.*对比|有什么不同|差异.*对比|比较.*区别/g, '').trim();
    if (!topic) {
        return '❓ **对比区别**\n\n请告诉我你想对比哪两个概念或事物的区别。\n\n例如：\n• "对比速度和速率的区别"\n• "比较DNA和RNA的不同"\n• "社会主义和资本主义的区别"';
    }
    return '⚖️ **「' + topic + '」对比分析**\n\n' +
        '| 对比维度 | A | B |\n' +
        '|---------|---|---|\n' +
        '| 定义 | 待描述 | 待描述 |\n' +
        '| 核心特点 | 待描述 | 待描述 |\n' +
        '| 适用场景 | 待描述 | 待描述 |\n' +
        '| 联系 | 待描述 | 待描述 |\n\n' +
        '💡 请告诉我具体要对比哪两个对象，我会为你填充表格内容。';
}

// 处理"举3个例子"命令
function handleGive3Examples(cleanQ) {
    var topic = lastAnswerTopic || lastTopic || cleanQ.replace(/举\s*3?\s*个例子|给.*三个例子|来三个例子|三个示例|举几个例子/g, '').trim();
    if (!topic) {
        return '❓ **举例子**\n\n请告诉我你想了解哪个知识点的例子。\n\n例如：\n• "举3个牛顿第一定律的例子"\n• "给我三个比喻修辞的例子"\n• "举几个化学平衡的例子"';
    }
    return '📝 **「' + topic + '」的3个例子**\n\n' +
        '**例子1（生活实例）**：\n用日常生活中的场景来说明' + topic + '...\n\n' +
        '**例子2（学科经典）**：\n教材或考试中常见的典型例题...\n\n' +
        '**例子3（拓展应用）**：\n' + topic + '在实际中的高级应用...\n\n' +
        '💡 需要我详细展开某个例子吗？或者"换个例子"获取不同的示例？';
}

// 处理"用表格整理"命令
function handleTableFormat(cleanQ) {
    var topic = lastAnswerTopic || lastTopic || cleanQ.replace(/用表格整理|整理成表格|做成表格|表格.*整理|列表整理/g, '').trim();
    if (!topic) {
        return '❓ **表格整理**\n\n请告诉我你想整理什么内容。\n\n例如：\n• "用表格整理英语时态"\n• "把化学元素周期表前20个整理成表格"\n• "用表格整理中国朝代"';
    }
    return '📊 **「' + topic + '」表格整理**\n\n' +
        '| 项目 | 内容1 | 内容2 | 内容3 |\n' +
        '|------|-------|-------|-------|\n' +
        '| 分类A | ... | ... | ... |\n' +
        '| 分类B | ... | ... | ... |\n' +
        '| 分类C | ... | ... | ... |\n\n' +
        '💡 请告诉我具体的分类维度，我会为你生成完整的表格。';
}

// 处理"画图说明"命令
function handleDrawExplain(cleanQ) {
    var topic = lastAnswerTopic || lastTopic || cleanQ.replace(/画图说明|画个图|用图说明|图示说明|画示意图/g, '').trim();
    if (!topic) {
        return '❓ **画图说明**\n\n请告诉我你想了解什么概念的图示。\n\n例如：\n• "画图说明光合作用过程"\n• "画一下食物链的示意图"\n• "用图说明血液循环"';
    }
    return '📐 **「' + topic + '」图示说明**\n\n' +
        '```\n' +
        '        ┌─────────────┐\n' +
        '        │   ' + topic.substring(0, 6) + '   │\n' +
        '        └──────┬──────┘\n' +
        '               │\n' +
        '      ┌────────┼────────┐\n' +
        '      ▼        ▼        ▼\n' +
        '   ┌─────┐  ┌─────┐  ┌─────┐\n' +
        '   │ 要素1 │  │ 要素2 │  │ 要素3 │\n' +
        '   └──┬──┘  └──┬──┘  └──┬──┘\n' +
        '      └────────┼────────┘\n' +
        '               ▼\n' +
        '        ┌─────────────┐\n' +
        '        │    结果/应用   │\n' +
        '        └─────────────┘\n' +
        '```\n\n' +
        '💡 由于我是文本AI，建议结合教材插图或自己手绘来加深理解。需要我描述图示的详细内容吗？';
}

// 处理"用简单的话解释"命令
function handleSimpleExplain(cleanQ) {
    var topic = lastAnswerTopic || lastTopic || cleanQ.replace(/用简单的话解释|简单解释|通俗解释|白话解释|用大白话|通俗.*说|简单.*说/g, '').trim();
    if (!topic) {
        return '❓ **简单解释**\n\n请告诉我你想了解什么概念，我会用最通俗的语言解释。\n\n例如：\n• "用简单的话解释相对论"\n• "通俗地说什么是量子力学"\n• "大白话解释一下通货膨胀"';
    }
    return '💬 **「' + topic + '」简单解释**\n\n' +
        '用最通俗的话说：\n\n' +
        topic + '就像...（生活类比）\n\n' +
        '举个例子：\n假设你在...（具体场景）\n那么' + topic + '就是...（对应解释）\n\n' +
        '一句话总结：\n' + topic + '的核心就是...（本质提炼）\n\n' +
        '💡 这样解释清楚了吗？需要我再换个角度说吗？';
}

// ========== 新命令处理函数：画图表、编题、划重点、做规划 ==========

// 画图表：生成ASCII图表
function handleDrawChart(cleanQ) {
    var topic = cleanQ.replace(/画图表|画个图表|生成图表|绘制图表|画个表格|画个图|图表展示/g, '').trim() || lastAnswerTopic || lastTopic;
    if (!topic) {
        return '📊 **图表生成**\n\n请告诉我你想生成什么图表？例如：\n• "画图表：函数 y=x² 的增长趋势"\n• "画个图表对比光合作用和呼吸作用"\n• "用图表展示数学知识体系"\n\n我会为你生成ASCII图表来直观展示数据或关系。';
    }
    // 生成简单柱状图/对比图
    var chartTitle = '📊 图表：「' + topic + '」';
    var chart = '\n' + chartTitle + '\n' + '━'.repeat(30) + '\n\n';
    chart += renderTable(
        ['项目', '数值', '等级'],
        [
            ['■ 类别一', '████████ 80%', '★★★★'],
            ['■ 类别二', '██████ 60%', '★★★☆'],
            ['■ 类别三', '████ 40%', '★★☆☆'],
            ['■ 类别四', '██ 20%', '★☆☆☆'],
        ]
    );
    chart += '\n\n📌 **图示说明**：横条长度表示相对大小，星级表示重要程度。\n\n💡 这是示例图表，请告诉我具体的数据或对比项，我会生成更精确的图表。';
    return chart;
}

// 编一道类似题
function handleSimilarProblem(cleanQ) {
    var topic = cleanQ.replace(/编题|编一道|出一道类似|类似.*题|同类型.*题|再出一道|同类题/g, '').trim() || lastAnswerTopic || lastTopic;
    if (!topic) {
        return '📝 **编题助手**\n\n请告诉我你想让我出什么类型的题？例如：\n• "编一道一元二次方程的题"\n• "出一道光合作用的选择题"\n• "类似刚才那道题再出一道"\n\n我会根据知识点出一道类似的题目来帮你巩固。';
    }
    if (!topic) topic = '当前知识点';
    var response = '📝 **同类练习题**\n\n';
    response += '题目：关于「' + topic + '」的一道练习题\n\n';
    response += '❓ **题目**：\n（请根据具体知识点填写题目内容）\n\n';
    response += '💡 **提示**：\n• 回忆刚才讲解的知识点\n• 注意题目中的关键条件\n• 先理清思路再作答\n\n';
    response += '请在下方输入你的答案，我会帮你批改！\n\n';
    response += '或者你也可以直接切换到对应的科目（如"切换到数学"），然后发送"出题"，我会生成更精确的练习题。';
    return response;
}

// 划重点：总结重点
function handleHighlight(cleanQ) {
    var topic = cleanQ.replace(/划重点|提炼重点|重点总结|考点总结|考试重点/g, '').trim() || lastAnswerTopic || lastTopic;
    if (!topic || topic.length < 1) {
        return '📌 **划重点**\n\n请告诉我想总结哪个知识点的重点？例如：\n• "划重点：三角函数公式"\n• "划重点：牛顿三大定律"\n• "划重点：化学反应类型"\n\n我会为你提炼出核心知识点和考试要点。';
    }
    var response = '📌 **「' + topic + '」重点总结**\n\n';
    response += '━━━━━━━━━━━━━━━━━━━━\n\n';
    response += '⭐ **核心要点**（必考/必会）\n\n';
    response += '1. 理解「' + topic + '」的基本定义和概念\n';
    response += '2. 掌握相关的公式、定理或原理\n';
    response += '3. 熟悉典型的题型和解题思路\n';
    response += '4. 注意常见的易错点和误区\n\n';
    response += '━━━━━━━━━━━━━━━━━━━━\n\n';
    response += '⚠️ **易错提醒**\n\n';
    response += '• 审题要仔细，不要遗漏关键条件\n';
    response += '• 答题要规范，步骤要完整\n';
    response += '• 做完后务必检查验证\n\n';
    response += '💡 如需更详细的重点梳理，请切换到对应的科目后提问。';
    return response;
}

// 做规划：制定学习计划
function handleMakePlan(cleanQ) {
    var topic = cleanQ.replace(/做规划|制定方案|学习方案|学习路线|学习路径|规划.*学习|安排.*学习|制定.*计划|定制计划/g, '').trim() || lastAnswerTopic || lastTopic;
    var response = '📋 **学习规划**\n\n';
    response += '以下是为' + (topic ? '「' + topic + '」' : '你') + '制定的学习计划模板：\n\n';
    response += '━━━━━━━━━━━━━━━━━━━━\n';
    response += '📅 **阶段一：基础打牢**（第1-3天）\n';
    response += '   ├ 了解基本概念和定义\n';
    response += '   ├ 掌握核心原理和公式\n';
    response += '   └ 完成基础练习题\n\n';
    response += '📅 **阶段二：巩固提升**（第4-7天）\n';
    response += '   ├ 深入学习重点难点\n';
    response += '   ├ 做综合应用题\n';
    response += '   └ 整理错题，查漏补缺\n\n';
    response += '📅 **阶段三：冲刺突破**（第8-10天）\n';
    response += '   ├ 模拟测试，检验水平\n';
    response += '   ├ 针对薄弱环节强化\n';
    response += '   └ 总复习，构建知识体系\n\n';
    response += '━━━━━━━━━━━━━━━━━━━━\n\n';
    response += '⏰ **每日建议**\n';
    response += '• 学习时间：45-60分钟/段\n';
    response += '• 休息间隔：每学25分钟休息5分钟（番茄工作法）\n';
    response += '• 复习安排：每天花10分钟回顾前一天内容\n\n';
    response += '💡 以上是通用计划模板。你可以：\n';
    response += '1. 切换到具体科目，获得更精确的学习计划\n';
    response += '2. 告诉我你的学习目标和时间安排，我帮你定制\n';
    response += '3. 随时调整计划，学习要灵活变通';
    return response;
}

// ========== 响应格式化增强 ==========
// 为知识响应添加emoji和结构化格式
function enhanceKnowledgeResponse(text, subject, topic) {
    // 在关键术语前后添加加粗（如果还没有的话）
    // 添加emoji标记
    if (!/💡/.test(text) && text.length > 100) {
        text = text.replace(/提示[:：]/g, '💡 提示：');
        text = text.replace(/注意[:：]/g, '⚠️ 注意：');
        text = text.replace(/重要[:：]/g, '📌 重要：');
    }

    // 为较长的响应添加结构化分隔
    if (text.length > 300 && !text.includes('---')) {
        // 在合适的位置添加分隔线
        var parts = text.split('\n\n');
        if (parts.length >= 3) {
            // 在最后两个部分之间添加分隔
            parts.splice(parts.length - 1, 0, '---');
            text = parts.join('\n\n');
        }
    }

    // v3.1.0: 为长解释添加可展开详情区域
    if (text.length > 500 && !text.includes('ai-collapsible')) {
        var briefEnd = text.indexOf('\n\n', 300);
        if (briefEnd === -1) briefEnd = text.indexOf('\n', 300);
        if (briefEnd > 300) {
            var brief = text.substring(0, briefEnd);
            var detail = text.substring(briefEnd);
            text = brief + '\n\n' + renderCollapsibleSection('详细内容', detail);
        }
    }

    // v3.1.0: 添加快速测试按钮（知识解释后）
    if (topic && text.length > 200 && !text.includes('quiz-btn')) {
        text += '\n\n' + renderQuickQuizButton(topic);
    }

    // 添加相关话题推荐
    var topicSuggestions = suggestRelatedTopics(subject, topic);
    if (topicSuggestions && topicSuggestions.length > 0) {
        text += renderTopicChips(topicSuggestions);
    }

    // v3.1.0: 添加延伸阅读链接
    if (subject && topic && !text.includes('ai-extended-reading')) {
        text += renderExtendedReadingLinks(subject, topic);
    }

    return text;
}

// ========== 连续答对鼓励系统 ==========
function getStreakEncouragement(count) {
    if (count === 3) {
        return '\n\n🔥 **连续答对3题！** 你进入状态了，继续保持！';
    } else if (count === 5) {
        return '\n\n🌟 **连续答对5题！** 太厉害了！你已经掌握了这个知识点！';
    } else if (count === 10) {
        return '\n\n🏆 **连续答对10题！** 你简直是学霸！今天的效率超高！';
    } else if (count > 10 && count % 5 === 0) {
        return '\n\n💎 **连续答对' + count + '题！** 不可思议！你的知识储备令人惊叹！';
    }
    return '';
}

// 注意：v3.1.0 的 showThinkingSteps 已在上文重新定义，此处保留旧版本作为兼容
// 新版本支持默认折叠和展开/收起切换

// ========== AI 理解增强系统 ==========
function preprocessQuestion(question) {
    const analysis = {
        originalQuestion: question,
        entities: [],
        questionType: 'general',
        responseFormat: 'concise',
        isFollowUp: false,
        detailLevel: 'normal',
        subjectHint: '',
        intent: '',
        hasMultiStep: false,
        multiStepCount: 0
    };

    // 1. 提取关键实体：数字、公式、专有名词、具体数值、人名、地名
    // 提取数字（含小数、分数、百分数、科学计数法）
    var numberMatches = question.match(/\d+\.?\d*%?|\d+\.?\d*[eE][+-]?\d+/g);
    if (numberMatches) {
        analysis.entities = analysis.entities.concat(numberMatches.map(function(n) { return { type: 'number', value: n }; }));
    }
    // 提取分数表达式 (如 1/2, 3/4)
    var fractionMatches = question.match(/\d+\/\d+/g);
    if (fractionMatches) {
        analysis.entities = analysis.entities.concat(fractionMatches.map(function(f) { return { type: 'fraction', value: f }; }));
    }
    // 提取数学公式/符号（增强：支持更多公式形式）
    var formulaMatches = question.match(/[a-zA-Z]\s*[=<>+\-*/^]\s*[\d.a-zA-Z()]+|[\d.]+\s*[=<>+\-*/^]\s*[\d.a-zA-Z()]+/g);
    if (formulaMatches) {
        analysis.entities = analysis.entities.concat(formulaMatches.map(function(f) { return { type: 'formula', value: f }; }));
    }
    // 提取人名（常见中文人名模式：2-4字，排除常见非人名词）
    var personMatches = question.match(/[\u4e00-\u9fa5]{2,4}(?=老师|同学|教授|博士|先生|女士|说|认为|提出|发现|发明)|李白|杜甫|苏轼|鲁迅|牛顿|爱因斯坦|居里夫人|达尔文|门捷列夫/g);
    if (personMatches) {
        analysis.entities = analysis.entities.concat(personMatches.map(function(p) { return { type: 'person', value: p }; }));
    }
    // 提取地名（常见地名后缀）
    var placeMatches = question.match(/[\u4e00-\u9fa5]{2,6}(?:国|省|市|县|区|镇|乡|村|山|河|江|湖|海|岛|洲|洋|平原|高原|盆地|沙漠|峡谷|半岛)/g);
    if (placeMatches) {
        analysis.entities = analysis.entities.concat(placeMatches.map(function(pl) { return { type: 'place', value: pl }; }));
    }
    // 提取中文专有名词（2-6字连续中文名词）
    var nounMatches = question.match(/[\u4e00-\u9fa5]{2,6}/g);
    if (nounMatches) {
        var commonWords = ['什么是', '为什么', '怎么', '如何', '请', '帮我', '解释', '计算', '求解', '分析', '比较', '说明', '列举', '定义', '翻译', '意思', '区别', '联系', '关系', '特点', '作用', '影响', '原因', '结果', '过程', '方法', '步骤', '原理', '公式', '定理', '定律', '概念', '分类', '类型', '形式', '结构', '功能', '意义', '价值', '背景', '条件', '因素', '问题', '答案', '题目', '练习', '考试', '测试', '作业', '一下', '一个', '一些', '可以', '需要', '进行', '使用', '通过', '根据', '关于', '对于', '因为', '所以', '虽然', '但是', '如果', '那么', '不仅', '而且', '要么', '或者', '以及', '还有', '另外', '此外', '同时', '然后', '接着', '最后', '最终', '总之', '综上所述', '例如', '比如', '像是', '就像', '正如', '好比', '相当于', '类似于', '不同于', '区别于', '相对于', '针对于', '针对于', '适合于', '适用于', '有利于', '有助于', '不利于', '无助于', '有利于', '有助于', '不利于', '无助于'];
        nounMatches.forEach(function(n) {
            if (commonWords.indexOf(n) === -1 && analysis.entities.length < 15) {
                // 避免与已提取的人名、地名重复
                var alreadyExists = analysis.entities.some(function(e) { return e.value === n; });
                if (!alreadyExists) {
                    analysis.entities.push({ type: 'noun', value: n });
                }
            }
        });
    }

    // 2. 识别问题类型与意图
    var q = question.toLowerCase();
    if (/计算|算|求.*值|解方程|等于多少|多少.*钱|面积|体积|周长|速度|距离|时间|求解|算出|得数/.test(q)) {
        analysis.questionType = 'calculation';
        analysis.responseFormat = 'step-by-step';
    } else if (/什么是|定义|概念|是什么|什么叫|解释一下|阐述/.test(q)) {
        analysis.questionType = 'definition';
        analysis.responseFormat = 'concise';
    } else if (/比较|对比|区别|差异|不同|相同|异同|versus|vs|有什么不同|有何区别|相比于|与.*相比/.test(q)) {
        analysis.questionType = 'comparison';
        analysis.responseFormat = 'table';
    } else if (/为什么|原因|为何|缘故|导致|怎么会|凭什么/.test(q)) {
        analysis.questionType = 'why';
        analysis.responseFormat = 'step-by-step';
    } else if (/怎么|如何|方法|步骤|怎样|怎么做|如何做|教程|攻略/.test(q)) {
        analysis.questionType = 'how';
        analysis.responseFormat = 'step-by-step';
    } else if (/如果|假设|假如|要是|倘若|假若/.test(q)) {
        analysis.questionType = 'whatif';
        analysis.responseFormat = 'concise';
    } else if (/列举|有哪些|说出|写出|给出|哪些|罗列|举例/.test(q)) {
        analysis.questionType = 'list';
        analysis.responseFormat = 'table';
    } else if (/分析|解析|剖析|解读|阐述|论述|探讨/.test(q)) {
        analysis.questionType = 'analysis';
        analysis.responseFormat = 'step-by-step';
    } else if (/证明|求证|论证|证.*明|证明题|求证题/.test(q)) {
        analysis.questionType = 'proof';
        analysis.responseFormat = 'step-by-step';
    } else if (/实验|实验题|实验设计|实验步骤|实验原理|实验现象|实验结论|探究实验/.test(q)) {
        analysis.questionType = 'experiment';
        analysis.responseFormat = 'step-by-step';
    } else if (/阅读|阅读理解|读后感|文章.*理解|段落.*意思|文本.*分析/.test(q)) {
        analysis.questionType = 'reading';
        analysis.responseFormat = 'step-by-step';
    } else if (/作文|写作|写文章|写.*文|作文指导|写作技巧|怎么写|如何写|随笔/.test(q)) {
        analysis.questionType = 'writing';
        analysis.responseFormat = 'step-by-step';
    } else if (/翻译|translate|翻成|译成|英译中|中译英/.test(q)) {
        analysis.questionType = 'translation';
        analysis.responseFormat = 'concise';
    } else if (/评价|点评|评论|看法|观点|你认为|你怎么看/.test(q)) {
        analysis.questionType = 'evaluation';
        analysis.responseFormat = 'step-by-step';
    } else if (/总结|归纳|概括|主旨|中心思想|主要内容|核心观点/.test(q)) {
        analysis.questionType = 'summary';
        analysis.responseFormat = 'concise';
    } else if (/推导|公式推导|推导过程|由.*推出|从.*得到|因.*所以/.test(q)) {
        analysis.questionType = 'derivation';
        analysis.responseFormat = 'step-by-step';
    } else if (/比较分析|对比分析|比较.*异同|对比.*差异|comparison|compare/.test(q)) {
        analysis.questionType = 'comparison';
        analysis.responseFormat = 'table';
    }

    // 2.5 增强意图识别：区分"求答案"、"求解释"、"求证明"、"求例子"
    if (/答案|结果是|等于|选哪个|选什么|正确答案|应该选|答案是/.test(q)) {
        analysis.intent = '求答案';
        analysis.responseFormat = 'step-by-step';
    } else if (/解释|讲解|说明|为什么|怎么回事|什么原理|怎么理解|如何理解/.test(q)) {
        analysis.intent = '求解释';
        analysis.responseFormat = 'step-by-step';
    } else if (/证明|求证|怎么证|如何证明|证明一下|证.*明/.test(q)) {
        analysis.intent = '求证明';
        analysis.responseFormat = 'step-by-step';
    } else if (/举个例子|举例说明|例如|比如|举个实例|能不能举|给.*例子/.test(q)) {
        analysis.intent = '求例子';
        analysis.responseFormat = 'step-by-step';
    } else if (/推导|怎么推|如何推导|推导.*过程|证明过程/.test(q)) {
        analysis.intent = '求推导';
        analysis.responseFormat = 'step-by-step';
    } else if (/概念|定义|什么意思|是什么|什么叫/.test(q)) {
        analysis.intent = '求概念';
        analysis.responseFormat = 'concise';
    } else if (/公式|公式推导|推导公式|因.*所以|因为.*所以|由.*可得|根据.*得/.test(q)) {
        analysis.intent = '求公式推导';
        analysis.responseFormat = 'step-by-step';
    } else if (/比较|对比|区别|异同|不同之处|相同之处|有什么.*不同|有什么.*异同/.test(q)) {
        analysis.intent = '求比较分析';
        analysis.responseFormat = 'table';
    } else if (/举例|例子|示例|比如|例如|举个|给.*例子|举个例子|举例说明/.test(q)) {
        analysis.intent = '求实例';
        analysis.responseFormat = 'step-by-step';
    }

    // 2.6 多步骤问题检测
    var multiStepPatterns = [
        /先.*然后.*最后/,
        /第一步.*第二步.*第三步/,
        /首先.*接着.*然后/,
        /先.*再.*最后/,
        /第一.*第二.*第三/,
        /1\..*2\..*3\./,
        /①.*②.*③/,
        /（1）.*（2）.*（3）/,
        /\(1\).*\(2\).*\(3\)/
    ];
    for (var msi = 0; msi < multiStepPatterns.length; msi++) {
        if (multiStepPatterns[msi].test(question)) {
            analysis.hasMultiStep = true;
            analysis.multiStepCount++;
        }
    }
    // 检测问题中是否包含多个问号或多个子问题
    var questionMarkCount = (question.match(/[?？]/g) || []).length;
    if (questionMarkCount >= 2) {
        analysis.hasMultiStep = true;
        analysis.multiStepCount = Math.max(analysis.multiStepCount, questionMarkCount);
    }
    // 检测是否包含"并"、"还有"、"另外"等连接多个问题的词
    if (/并.*[?？]|还有.*[?？]|另外.*[?？]|以及.*[?？]/.test(question)) {
        analysis.hasMultiStep = true;
        analysis.multiStepCount++;
    }

    // 3. 检查是否为追问
    if (aiConversationContext.length >= 2) {
        var followUpPatterns = [/那.*呢/, /这个呢/, /它呢/, /还有呢/, /然后呢/, /接下来/, /上面.*呢/, /刚才.*呢/, /继续/];
        for (var fi = 0; fi < followUpPatterns.length; fi++) {
            if (followUpPatterns[fi].test(q)) {
                analysis.isFollowUp = true;
                break;
            }
        }
        // 如果问题很短（<8字），也可能是追问
        if (q.length <= 8 && aiConversationContext.length >= 2) {
            analysis.isFollowUp = true;
        }
    }

    // 3.5 使用会话记忆增强追问检测（排除明确的数学计算问题）
    var isExplicitMath = /\d+\.?\d*\s*的\s*\d+\.?\d*\s*%/.test(question) ||
        /\d+\.?\d*\s*是\s*\d+\.?\d*\s*的百分之/.test(question) ||
        /\d+\.?\d*\s*比\s*\d+\.?\d*\s*[多少]/.test(question) ||
        /^\d+\/\d+\s*([+\-×*÷/]\s*\d+\/\d+\s*)+$/.test(question.trim());
    if (!analysis.isFollowUp && !isExplicitMath && conversationMemory.isFollowUp(question)) {
        analysis.isFollowUp = true;
        var relatedCtx = conversationMemory.getRelatedContext(question);
        if (relatedCtx) {
            analysis.followUpTopic = relatedCtx.topic;
        }
    }

    // 4. 调整详细程度
    // 用户明确要求简洁
    if (/简单|简短|简洁|一句话|概括|简要|简略|太长|太详细/.test(q)) {
        analysis.detailLevel = 'brief';
    }
    // 用户明确要求详细
    if (/详细|详解|深入|全面|展开|具体|透彻|仔细|完整|详尽/.test(q)) {
        analysis.detailLevel = 'detailed';
    }
    // 问题复杂度高（包含多个实体或较长），自动提升详细度
    if (analysis.entities.length >= 3 || question.length > 50 || analysis.hasMultiStep) {
        if (analysis.detailLevel === 'normal') {
            analysis.detailLevel = 'detailed';
        }
    }

    // 5. 推断科目提示
    var subjectKeywords = {
        '数学': [/方程|函数|几何|代数|三角|概率|统计|微积分|导数|积分|矩阵|向量|数列|不等式|多项式|因式分解|勾股|圆|椭圆|抛物线|双曲线|对数|指数|对数|平面|立体|解析|证明题/],
        '英语': [/english|英文|单词|语法|时态|从句|被动|虚拟|翻译|reading|writing|listening|speaking|vocabulary|grammar|pronunciation|phrase|idiom| tense|modal|conditional/],
        '语文': [/古诗|文言文|成语|修辞|作文|阅读理解|诗词|作者|朝代|文章|小说|散文|戏剧|记叙文|议论文|说明文|散文|修辞手法|中心思想|段落大意/],
        '物理': [/力学|电学|光学|热学|声学|磁学|牛顿|焦耳|安培|伏特|欧姆|电阻|电流|电压|功率|能量|动量|电磁|波动|原子|核物理|相对论/],
        '化学': [/化学方程式|元素周期|酸碱|氧化|还原|有机|无机|摩尔|溶液|电解|催化剂|反应|化学键|化合价|离子|分子|原子|同分异构|化学平衡/],
        '生物': [/细胞|基因|DNA|遗传|进化|生态系统|光合|呼吸|蛋白质|染色体|突变|酶|激素|神经|免疫|种群|群落|新陈代谢|有丝分裂|减数分裂/],
        '历史': [/朝代|战争|革命|帝国|文明|历史事件|条约|皇帝|国王|总统|辛亥革命|抗日战争|文艺复兴|工业革命|冷战|二战|古代史|近代史|现代史/],
        '地理': [/地球|气候|地形|地貌|经纬度|板块|季风|洋流|人口|城市|农业|工业|资源|环境|可持续发展|地图|经纬线|海拔|等高线|时区/],
        '政治': [/政治|经济|哲学|文化|社会|制度|法律|道德|价值观|社会主义|市场经济|民主|法治|公民|权利|义务|国家|政府|人大|政协|党建/],
        '科学': [/科学|实验|观察|假设|结论|物理|化学|生物|天文|地理|自然|探究|科学方法|假设|变量|控制|对照/]
    };
    for (var subj in subjectKeywords) {
        var keywords = subjectKeywords[subj];
        for (var ki = 0; ki < keywords.length; ki++) {
            if (keywords[ki].test(q)) {
                analysis.subjectHint = subj;
                break;
            }
        }
        if (analysis.subjectHint) break;
    }

    return analysis;
}

// 根据问题分析生成思考步骤
function generateThinkingSteps(question, analysis) {
    var subjectHint = analysis.subjectHint || '';
    var questionType = analysis.questionType;
    var entityStr = analysis.entities.length > 0 ? analysis.entities.map(function(e) { return e.value; }).join('、') : '暂无';

    // ========== 可视化思考路径（用箭头连接各阶段） ==========
    var thinkingPath = '';
    if (questionType === 'proof') {
        thinkingPath = '> **思考路径**：`已知` → `求证` → `证明` → `结论`';
    } else if (questionType === 'experiment') {
        thinkingPath = '> **思考路径**：`目的` → `原理` → `步骤` → `现象` → `结论`';
    } else if (questionType === 'writing') {
        thinkingPath = '> **思考路径**：`审题` → `立意` → `选材` → `结构` → `成文` → `修改`';
    } else if (questionType === 'comparison') {
        thinkingPath = '> **思考路径**：`确定比较对象` → `选择比较维度` → `逐项对比` → `归纳异同` → `得出结论`';
    } else if (questionType === 'why') {
        thinkingPath = '> **思考路径**：`明确结果` → `追溯直接原因` → `挖掘深层原因` → `理清因果链` → `总结`';
    } else if (questionType === 'how') {
        thinkingPath = '> **思考路径**：`明确目标` → `分解步骤` → `理清顺序` → `执行验证` → `总结优化`';
    } else if (questionType === 'calculation') {
        thinkingPath = '> **思考路径**：`提取数据` → `确定运算` → `逐步计算` → `验证结果`';
    } else if (questionType === 'analysis') {
        thinkingPath = '> **思考路径**：`整体感知` → `分解要素` → `深入剖析` → `综合归纳` → `形成观点`';
    }

    // 通用高阶思考维度（所有学科共用）
    var advancedThinking = [];
    if (analysis.hasMultiStep) {
        advancedThinking.push('🔄 **多步骤拆解** —— 将复杂问题分解为若干子任务，逐一攻克');
    }
    advancedThinking.push('🤔 **假设验证** —— 如果我的初步判断是正确的，那么应该满足什么条件？');
    advancedThinking.push('⚡ **反例思考** —— 是否存在不符合这个规律的特殊情况？');
    advancedThinking.push('🔄 **类比推理** —— 这个问题与哪些已知问题相似？可以借鉴什么思路？');
    advancedThinking.push('📊 **归纳总结** —— 从具体条件中提炼一般规律，形成通用解法');

    // 根据科目生成思考步骤 - 更自然、更像人类思维过程
    var thinkingMap = {
        '数学': [
            '🔍 **先看清题目** —— 嗯，这是一道「' + questionType + '」类型的数学题，让我先整体扫一遍...',
            '📋 **提取已知条件** —— 题目里给了这些关键信息：' + entityStr + '，我都记下来',
            '🎯 **明确所求目标** —— 题目到底要我求什么？结果应该是什么形式？',
            '🧮 **联想相关公式** —— 看到这类条件，我首先想到的是...可能需要用到某个定理或公式',
            '📐 **画图辅助思考** —— （如果是几何/函数题）让我在脑子里画个图，把已知条件标上去，看看能不能发现隐藏关系',
            '💡 **尝试解题路径** —— 从已知出发能推什么？从结论倒推需要什么？两边能不能接上？',
            '✏️ **逐步推导计算** —— 好，思路清晰了，一步一步来，注意符号和单位',
            '⚡ **验证与反思** —— 算出来的结果合理吗？有没有更简便的方法？如果条件变了会怎样？'
        ],
        '英语': [
            '🔍 **先读完整句子** —— 让我先把整个句子/段落通读一遍，把握整体意思',
            '📋 **提取关键词汇** —— 注意这些核心词：' + entityStr + '，它们往往是解题关键',
            '🌐 **语境分析** —— 这个词/句子出现在什么语境中？前后文提供了什么线索？',
            '💡 **识别语法考点** —— 这里考查的是时态？从句？还是固定搭配？让我定位一下',
            '📚 **调用知识储备** —— 对应的语法规则是什么？有没有例外情况需要注意？',
            '✏️ **组织语言答案** —— 按照英语的表达习惯构建答案，注意主谓一致和时态',
            '✅ **回读检查** —— 把答案放回原句读一遍，通顺吗？符合语法规则吗？'
        ],
        '语文': [
            '🔍 **理解题目要求** —— 这道题要我做什么？赏析？概括？还是分析作用？',
            '📖 **文本细读** —— 让我仔细读一遍材料，圈出关键词句、修辞手法、情感变化',
            '📋 **提取文本信息** —— 关键语句和手法有：' + entityStr + '，这些是要分析的要点',
            '💡 **联系知识背景** —— 作者是谁？什么时代？这篇文章的写作背景是什么？',
            '📚 **构建答题框架** —— 按照"观点+文本依据+分析+效果/作用"的思路来组织',
            '✏️ **组织规范表达** —— 用学科术语，分点作答，每一点都要有文本支撑',
            '✅ **检查完整性** —— 要点答全了吗？分析到位了吗？语言准确吗？'
        ],
        '物理': [
            '🔍 **想象物理情景** —— 闭上眼睛，想象题目描述的物理过程在真实世界中是怎样的',
            '📋 **提取已知条件** —— 明确已知物理量和待求量：' + entityStr + '，注意隐含条件',
            '💡 **联系物理定律** —— 这个过程涉及什么定律？牛顿定律？能量守恒？还是电磁感应？',
            '📐 **建立物理模型** —— 画示意图、建坐标系、标方向，把抽象问题可视化',
            '✏️ **列方程求解** —— 根据物理定律列出方程，代入数据，注意单位统一',
            '✅ **验证答案合理性** —— 结果的数量级对吗？物理意义说得通吗？极端情况下成立吗？'
        ],
        '化学': [
            '🔍 **分析化学问题** —— 这是什么类型的题目？无机？有机？计算？实验？',
            '📋 **识别关键物质** —— 反应物、生成物、反应条件：' + entityStr + '，特别注意催化剂和温度',
            '💡 **联系化学原理** —— 涉及氧化还原？离子反应？化学平衡？还是结构性质？',
            '📚 **书写化学方程式** —— 写出配平的方程式，标出条件和状态符号',
            '✏️ **定量计算分析** —— 根据方程式进行计算，注意物质的量和单位的转换',
            '✅ **验证答案** —— 方程式配平了吗？电子守恒吗？结果符合化学常识吗？'
        ],
        '生物': [
            '🔍 **定位知识层次** —— 这道题考查的是分子、细胞、个体还是生态层次？',
            '📋 **提取关键信息** —— 识别生物学术语和核心概念：' + entityStr,
            '💡 **联系生物学原理** —— 回忆相关的生理过程、遗传规律或生态原理',
            '📚 **构建知识联系** —— 把题目信息与教材知识建立对应关系，画出逻辑链',
            '✏️ **逻辑推理作答** —— 按照生物学逻辑组织答案，使用专业术语，注意因果关系',
            '✅ **检查准确性** —— 概念表述准确吗？逻辑链条完整吗？有没有遗漏的关键环节？'
        ],
        '历史': [
            '🔍 **明确时空范围** —— 这道题涉及什么时间？什么地点？什么国家/地区？',
            '📋 **提取关键要素** —— 时间、地点、人物、事件：' + entityStr,
            '💡 **回顾历史背景** —— 这个时期的政治、经济、文化背景是怎样的？',
            '📚 **梳理事件脉络** —— 按时间顺序或因果关系整理相关史实，建立联系',
            '✏️ **史论结合分析** —— 运用史实支撑观点，进行客观分析评价，避免主观臆断',
            '✅ **总结归纳** —— 提炼历史规律、经验教训或历史意义，升华到理论高度'
        ],
        '政治': [
            '🔍 **定位知识模块** —— 这道题考查的是经济、政治、文化还是哲学模块？',
            '📋 **提取材料信息** —— 从题目材料中提取关键信息和关键词：' + entityStr,
            '💡 **联系理论知识** —— 回忆教材中的基本概念、原理和观点',
            '📚 **理论与材料结合** —— 运用理论分析材料，做到有理有据，一一对应',
            '✏️ **规范组织答案** —— 按照"理论+材料分析+结论"的结构作答',
            '✅ **检查政治性** —— 观点正确吗？表述规范吗？符合主流价值观吗？'
        ],
        '科学': [
            '🔍 **分析问题本质** —— 明确问题的科学属性和考查方向',
            '📋 **提取关键信息** —— 识别题目中的数据、条件和变量：' + entityStr,
            '💡 **联系科学概念** —— 回忆相关的科学原理和定律',
            '📚 **建立分析框架** —— 确定变量关系、实验设计或推理路径',
            '✏️ **推理计算作答** —— 按照科学方法进行推理、计算或实验分析',
            '✅ **验证科学性** —— 检查结果是否符合科学原理和客观事实'
        ]
    };

    // 通用思考步骤 - 更像人类思维
    var generalSteps = [
        '🔍 **先理解问题** —— 用户在问什么？核心需求是什么？这是「' + questionType + '」类型的问题',
        '📋 **提取关键信息** —— 从问题中找出实体、数字、关键词：' + entityStr,
        '💡 **联想相关知识** —— 这个问题让我想到了哪些概念、原理或方法？',
        '🤔 **多角度思考** —— 有没有其他理解方式？是否存在特殊情况或例外？',
        '📚 **整合形成思路** —— 把零散的信息串联起来，形成完整的解答逻辑',
        '✏️ **组织回答结构** —— 按照"核心答案→详细解释→总结"的层次来组织',
        '✅ **检查与优化** —— 答案准确吗？清晰吗？有没有遗漏？'
    ];

    // 获取科目对应的步骤
    var steps = thinkingMap[subjectHint] || generalSteps;

    // 根据问题类型定制步骤
    if (questionType === 'calculation') {
        steps[0] = '🔍 **先看清题目** —— 这是一道计算题，让我先整体扫一遍，看看涉及哪些运算';
        if (analysis.entities.length > 0) {
            steps[1] = '📋 **提取已知条件** —— 题目中的数值和关系：' + entityStr;
        }
    } else if (questionType === 'definition') {
        steps[0] = '🔍 **先理解题意** —— 这道题要解释某个概念，让我先确定核心术语';
        if (analysis.entities.length > 0) {
            steps[1] = '📋 **定位关键概念** —— 题目涉及的核心概念：' + entityStr;
        }
    } else if (questionType === 'comparison') {
        steps[0] = '🔍 **明确比较对象** —— 这是一道对比题，需要先确定比较双方和比较维度';
        steps[1] = '📋 **提取比较对象** —— 明确需要比较的事物及其特征：' + entityStr;
    } else if (questionType === 'why') {
        steps[0] = '🔍 **追溯因果关系** —— 这是一道原因分析题，需要从结果倒推原因';
        steps[1] = '📋 **分析因果链条** —— 从结果出发，逆向寻找原因：' + entityStr;
    } else if (questionType === 'how') {
        steps[0] = '🔍 **梳理操作流程** —— 这是一道方法/步骤题，需要理清先后顺序';
        steps[1] = '📋 **明确目标条件** —— 确定起点状态和期望结果：' + entityStr;
    } else if (questionType === 'whatif') {
        steps[0] = '🔍 **分析假设影响** —— 这是一道假设分析题，需要分析条件变化的影响';
        steps[1] = '📋 **明确假设条件** —— 确定改变的条件和保持不变的变量：' + entityStr;
    } else if (questionType === 'list') {
        steps[0] = '🔍 **确定列举范围** —— 这是一道列举题，需要全面梳理相关知识点';
        steps[1] = '📋 **明确列举边界** —— 明确列举的主题和范围：' + entityStr;
    } else if (questionType === 'analysis') {
        steps[0] = '🔍 **深入剖析本质** —— 这是一道分析题，需要透过现象看本质';
        steps[1] = '📋 **分解问题结构** —— 将复杂问题拆解为若干子问题：' + entityStr;
    } else if (questionType === 'proof') {
        steps[0] = '🔍 **构建证明框架** —— 这是一道证明题，先搭好"已知→求证→证明→结论"的框架';
        steps[1] = '📋 **明确已知条件和求证目标** —— 区分题设条件和需要证明的结论：' + entityStr;
        steps.splice(2, 0,
            '📐 **回忆相关定理** —— 想想有哪些定理、公理、性质可以用来搭建证明链条',
            '🧩 **寻找证明路径** —— 从已知出发进行正向推理？还是从结论倒推寻找所需条件？',
            '📝 **书写证明过程** —— 每一步都要有依据，逻辑严密，符号规范',
            '✅ **验证证明完整性** —— 检查证明过程中是否有跳跃或遗漏，结论是否确实证出'
        );
    } else if (questionType === 'experiment') {
        steps[0] = '🔍 **明确实验目的** —— 这是一道实验题，按"目的→原理→步骤→现象→结论"来思考';
        steps[1] = '📋 **确定实验要素** —— 实验要验证什么、需要哪些器材、控制什么变量：' + entityStr;
        steps.splice(2, 0,
            '📐 **回顾实验原理** —— 这个实验基于什么科学原理？用到了什么公式或定律？',
            '📝 **设计实验步骤** —— 明确操作顺序、注意事项、数据记录方法',
            '🔬 **预测实验现象** —— 正常情况下应该观察到什么现象？异常可能是什么原因？',
            '📊 **分析得出结论** —— 根据现象和数据分析，得出实验结论'
        );
    } else if (questionType === 'reading') {
        steps[0] = '🔍 **通读把握主旨** —— 这是一道阅读理解题，需要先整体把握文本';
        steps[1] = '📋 **提取关键细节** —— 把握文章主旨，提取关键信息：' + entityStr;
    } else if (questionType === 'writing') {
        steps[0] = '🔍 **分析写作要求** —— 这是一道写作题，按"审题→立意→选材→结构→成文→修改"来规划';
        steps[1] = '📋 **明确体裁和主题** —— 确定文体（记叙/议论/说明）、主题方向、字数要求：' + entityStr;
        steps.splice(2, 0,
            '💡 **深入审题立意** —— 抓住题目的核心要求，确定中心思想和写作角度',
            '📚 **精心选材布局** —— 选择最合适的素材，安排详略，确保材料服务于中心思想',
            '📐 **搭建文章框架** —— 规划开头、主体段落、结尾的结构，写好提纲',
            '✏️ **组织语言成文** —— 注意语言表达，运用修辞手法，过渡自然流畅',
            '🔍 **修改完善润色** —— 检查错别字、语句通顺、逻辑连贯、标点规范'
        );
    }

    // 插入高阶思考维度（在步骤3之后）
    if (advancedThinking.length > 0 && steps.length >= 4) {
        var insertPos = Math.min(4, steps.length);
        steps.splice(insertPos, 0, ...advancedThinking);
    }

    // 如果是追问，添加上下文信息
    if (analysis.isFollowUp) {
        var followUpTopic = analysis.followUpTopic || '上文内容';
        steps.unshift('🔄 **识别追问** —— 用户基于「' + followUpTopic + '」继续提问，需要结合上文理解');
    }

    // 插入可视化思考路径（放在思考步骤的靠前位置）
    if (thinkingPath) {
        var pathInsertIndex = analysis.isFollowUp ? 1 : 0;
        steps.splice(pathInsertIndex, 0, '🗺️ ' + thinkingPath);
    }

    // 根据详细程度调整最后一步
    if (analysis.detailLevel === 'brief') {
        steps.push('📌 **最终整理** —— 提炼核心要点，用简洁的语言呈现答案');
    } else if (analysis.detailLevel === 'detailed') {
        steps.push('📌 **最终整理** —— 详细展开，补充示例、拓展和易错点，确保全面深入');
    } else {
        steps.push('📌 **最终整理** —— 清晰完整地呈现答案，确保易于理解');
    }

    return steps;
}

// Quiz Mode: 当前题目（不直接显示答案）
let currentQuiz = null; // { subject, question, answer, type, hint, options }

// 错题自动录入
function addErrorToBook(subjectId, question, userAnswer, correctAnswer, solution) {
    const items = state.role === 'student' ? state.subjects : state.projects;
    const item = items.find(i => i.id === subjectId);
    if (!item) return;
    if (!item.errors) item.errors = [];
    const error = {
        id: Date.now(),
        question: question,
        answer: correctAnswer,
        correction: '你的回答: ' + userAnswer,
        advice: solution || '复习相关知识点，多做类似题目巩固。',
        subject: item.name,
        date: new Date().toLocaleDateString('zh-CN'),
        mastered: false
    };
    item.errors.push(error);
    updateErrorCount();
    StorageManager.saveErrors(subjectId, item.errors);
    showToast('warning', '回答错误，已自动加入错题本');
}

// 检查用户回答是否匹配正确答案
function checkQuizAnswer(userInput) {
    if (!currentQuiz) return null;
    const input = userInput.trim();
    const answer = currentQuiz.answer.trim();

    // 选择题：匹配选项字母或选项文本
    if (currentQuiz.type === 'choice') {
        const optionMatch = input.match(/[A-Da-d]/);
        if (optionMatch) {
            const idx = optionMatch[0].toUpperCase().charCodeAt(0) - 65;
            const options = currentQuiz.options || [];
            if (idx < options.length && options[idx] === answer) return true;
            if (idx < options.length) return false;
        }
        if (currentQuiz.options) {
            for (const opt of currentQuiz.options) {
                if (opt === answer && input.includes(opt.substring(2))) return true;
            }
        }
    }

    // 填空/简答：模糊匹配
    if (input === answer) return true;
    if (answer.includes(input) && input.length >= answer.length * 0.5) return true;
    if (input.includes(answer)) return true;

    // 数字匹配（忽略单位）
    const inputNum = parseFloat(input.replace(/[^\d.]/g, ''));
    const answerNum = parseFloat(answer.replace(/[^\d.]/g, ''));
    if (!isNaN(inputNum) && !isNaN(answerNum) && Math.abs(inputNum - answerNum) < 0.01) {
        // 数字正确，检查单位是否可接受
        const inputUnit = input.replace(/[\d.\s]/g, '').toLowerCase();
        const answerUnit = answer.replace(/[\d.\s]/g, '').toLowerCase();
        // 单位等价映射
        const unitEquiv = {
            'km': ['千米', '公里', 'km', 'kilometer'],
            'm': ['米', 'm', 'meter'],
            'cm': ['厘米', 'cm', 'centimeter'],
            'mm': ['毫米', 'mm', 'millimeter'],
            'kg': ['千克', '公斤', 'kg', 'kilogram'],
            'g': ['克', 'g', 'gram'],
            't': ['吨', 't', 'ton'],
            'l': ['升', 'l', 'liter'],
            'ml': ['毫升', 'ml', 'milliliter'],
            'h': ['小时', '时', 'h', 'hour'],
            'min': ['分钟', '分', 'min', 'minute'],
            's': ['秒', 's', 'second'],
            '元': ['元', '块', '人民币'],
            '角': ['角', '毛'],
            '分': ['分'],
            '个': ['个', '只', '条', '本', '张', '件'],
            '天': ['天', '日'],
            '年': ['年', '岁'],
            '°': ['度', '°', '摄氏度', '℃'],
            '%': ['%', 'percent', '百分比', '百分之'],
        };
        // 如果输入没有单位，或者单位等价，都算对
        if (inputUnit === '' || answerUnit === '') return true;
        for (const [canonical, variants] of Object.entries(unitEquiv)) {
            const inputMatch = variants.some(v => inputUnit.includes(v.toLowerCase()));
            const answerMatch = variants.some(v => answerUnit.includes(v.toLowerCase()));
            if (inputMatch && answerMatch) return true;
        }
        // 数字对但单位不同，也算对（只是提示单位问题）
        return true;
    }

    return false;
}

function aiLog(action, detail) {
    const entry = { action, detail, time: Date.now() };
    aiLogEntries.push(entry);
    if (aiLogPanelVisible) {
        const content = document.getElementById('aiLogContent');
        if (content) {
            const div = document.createElement('div');
            div.className = 'ai-log-entry';
            div.innerHTML = '⚙️ <b>' + action + '</b>' + (detail ? '：' + escapeHtml(detail) : '');
            content.appendChild(div);
            content.scrollTop = content.scrollHeight;
        }
    }
}

function showAiLogPanel() {
    const panel = document.getElementById('aiLogPanel');
    const content = document.getElementById('aiLogContent');
    if (!panel || !content) return;
    content.innerHTML = '';
    aiLogEntries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'ai-log-entry';
        div.innerHTML = '⚙️ <b>' + entry.action + '</b>' + (entry.detail ? '：' + escapeHtml(entry.detail) : '');
        content.appendChild(div);
    });
    panel.style.display = '';
    panel.classList.remove('collapsed');
    aiLogPanelVisible = true;
}

function collapseAiLogPanel() {
    const panel = document.getElementById('aiLogPanel');
    if (panel) panel.classList.add('collapsed');
}

function hideAiLogPanel() {
    const panel = document.getElementById('aiLogPanel');
    if (panel) { panel.style.display = 'none'; panel.classList.remove('collapsed'); }
    aiLogPanelVisible = false;
}

function toggleAiLogPanel() {
    const panel = document.getElementById('aiLogPanel');
    if (panel) panel.classList.toggle('collapsed');
}

// 内联学科检测
function _detectSubjectInline(question) {
    if (!question) return null;
    const q = question.toLowerCase();
    const scores = { math: 0, english: 0, chinese: 0, physics: 0, chemistry: 0, biology: 0, history: 0, politics: 0, law: 0, mental: 0 };
    const keywords = {
        math: ['数学','计算','方程','函数','几何','代数','微积分','数列','概率','排列组合','鸡兔同笼','行程问题','工程问题','利润','浓度','折扣','百分比','分数','小数','约分','通分','最大公约数','最小公倍数','质数','合数','奇数','偶数'],
        english: ['英语','english','翻译','grammar','vocabulary','word','sentence','phrase','tense','passive','active','noun','verb','adjective','adverb','pronoun','preposition','conjunction','article','plural','singular','synonym','antonym','spelling','pronunciation','英译','汉译','单词','语法','时态','语态','从句','定语','状语','主语','谓语','宾语','介词','连词','冠词','复数','单数','同义词','反义词','拼写','发音','音标'],
        chinese: ['语文','古诗','诗词','文言文','成语','拼音','读音','作文','阅读','修辞','比喻','拟人','排比','夸张','对偶','设问','反问','借代','通感','反复','顶真','互文','用典','诗经','楚辞','唐诗','宋词','元曲','散文','小说','名著','作者','朝代','李白','杜甫','苏轼','鲁迅','朱自清'],
        physics: ['物理','力学','运动','速度','加速度','牛顿','力','重力','弹力','摩擦力','压强','浮力','功','功率','能量','动能','势能','机械能','动量','冲量','振动','波','声波','光','反射','折射','透镜','干涉','衍射','电磁','电场','磁场','电流','电压','电阻','欧姆','电路','电功率','电容','电感','变压器','热学','温度','热量','比热','内能','熵','原子','核','量子','相对论'],
        chemistry: ['化学','元素','原子','分子','离子','化学键','共价键','离子键','金属键','化学式','方程式','化合反应','分解反应','置换反应','复分解反应','氧化','还原','氧化还原','酸碱','盐','溶液','溶解度','饱和','摩尔','物质的量','浓度','ph','有机','烷烃','烯烃','炔烃','醇','醛','酮','酸','酯','聚合物','催化','电解','电镀'],
        biology: ['生物','细胞','基因','dna','rna','蛋白质','酶','激素','光合作用','呼吸作用','遗传','变异','进化','自然选择','生态系统','食物链','食物网','种群','群落','生产者','消费者','分解者','植物','动物','微生物','细菌','病毒','真菌','人体','消化','循环','呼吸','泌尿','神经','内分泌','免疫','生殖','胚胎','有丝分裂','减数分裂'],
        history: ['历史','朝代','皇帝','帝王','战争','战役','革命','起义','条约','古代','近代','现代','世界史','文明','考古','文物','遗址','秦始皇','汉武帝','唐太宗','成吉思汗','朱元璋','康熙','鸦片战争','甲午','辛亥革命','五四','抗战','二战','冷战','工业革命','文艺复兴','启蒙运动'],
        politics: ['政治','政治制度','宪法','法律','社会主义','资本主义','市场经济','计划经济','公有制','私有制','按劳分配','民主','法治','公平','正义','自由','平等','人权','公民','国家','政府','政党','人大','政协','民族','宗教','外交','国际关系','全球化','核心价值观','科学发展观','三个代表','马克思主义','毛泽东思想','邓小平理论'],
        law: ['法律','法规','劳动法','合同法','婚姻法','继承法','刑法','民法','知识产权','专利','商标','版权','消费者权益','维权','赔偿','起诉','诉讼','仲裁','调解','律师','法官','法院','检察院','警察','犯罪','违法','侵权','违约','责任','义务','权利','证据','判决','执行','取保候审','拘留','逮捕','缓刑','假释'],
        mental: ['心理','情绪','焦虑','抑郁','压力','紧张','害怕','恐惧','失眠','孤独','自卑','自信','自尊','人际','沟通','家庭','恋爱','失恋','学习压力','考试焦虑','厌学','网瘾','手机依赖','拖延','强迫症','恐惧症','自闭症','多动症','心理咨询','心理治疗','催眠','冥想','放松','正念']
    };
    for (const [subject, words] of Object.entries(keywords)) {
        for (const word of words) {
            if (q.includes(word.toLowerCase())) scores[subject] += word.length >= 4 ? 3 : (word.length >= 2 ? 2 : 1);
        }
    }
    if (/[\d\(\)]/.test(question) && /[+\-×*\/÷]/.test(question)) scores.math += 2;
    if (/^[a-zA-Z\s]+$/.test(question.trim()) && question.trim().length > 2) scores.english += 5;
    if (/[背默写].*?[诗词句]/.test(question)) scores.chinese += 3;
    let best = null, bestScore = 2;
    for (const [subj, score] of Object.entries(scores)) {
        if (score > bestScore) { bestScore = score; best = subj; }
    }
    return best;
}

// 同音字/错字纠正
function correctTypos(text) {
    if (!text) return text;
    const corrections = [
        { pattern: /给我处(一|几|两|三|多)/g, replacement: '给我出$1' },
        { pattern: /给我出一到/g, replacement: '给我出一道' },
        { pattern: /处一道/g, replacement: '出一道' }, { pattern: /处几/g, replacement: '出几' },
        { pattern: /来一到/g, replacement: '来一道' }, { pattern: /以经/g, replacement: '已经' },
        { pattern: /因该/g, replacement: '应该' }, { pattern: /做业/g, replacement: '作业' },
        { pattern: /题问/g, replacement: '问题' }, { pattern: /时后/g, replacement: '时候' },
        { pattern: /知到/g, replacement: '知道' }, { pattern: /觉的/g, replacement: '觉得' },
        { pattern: /支道/g, replacement: '知道' }, { pattern: /玩成/g, replacement: '完成' },
        { pattern: /回达/g, replacement: '回答' }, { pattern: /问提/g, replacement: '问题' },
        { pattern: /英于/g, replacement: '英语' }, { pattern: /数于/g, replacement: '数学' },
        { pattern: /语于/g, replacement: '语文' }, { pattern: /物于/g, replacement: '物理' },
        { pattern: /化于/g, replacement: '化学' }
    ];
    let corrected = text;
    for (const c of corrections) corrected = corrected.replace(c.pattern, c.replacement);
    return corrected;
}

// ========== User Preferences System ==========

function detectUserPreferences(question, aiResponse) {
    if (!question) return null;
    const q = question.trim();
    const patterns = [
        { regex: /请用[…\.\s]*(.+?)方式回答/, category: 'format' },
        { regex: /请用[…\.\s]*(.+?)格式/, category: 'format' },
        { regex: /用[…\.\s]*(.+?)格式/, category: 'format' },
        { regex: /用[…\.\s]*(.+?)方式/, category: 'format' },
        { regex: /给我[…\.\s]*(.+?)(?:回答|结果|内容)/, category: 'format' },
        { regex: /以后都[…\.\s]*(.+)/, category: 'persistent' },
        { regex: /每次都要[…\.\s]*(.+)/, category: 'persistent' },
        { regex: /记住我要[…\.\s]*(.+)/, category: 'persistent' },
        { regex: /不要[…\.\s]*(.+)/, category: 'negative' },
        { regex: /取消[…\.\s]*(.+)/, category: 'negative' },
        { regex: /去掉[…\.\s]*(.+)/, category: 'negative' },
        { regex: /详细一点/, category: 'detail', text: '回答要详细' },
        { regex: /简单一点/, category: 'detail', text: '回答要简单' },
        { regex: /举个例子/, category: 'detail', text: '回答要举例子' },
        { regex: /用英文/, category: 'language', text: '用英文回答' },
        { regex: /用中文/, category: 'language', text: '用中文回答' },
        { regex: /翻译成(.+)/, category: 'language' },
    ];

    for (const p of patterns) {
        const match = q.match(p.regex);
        if (match) {
            const text = p.text || match[1] || match[0];
            const prefId = 'pref_' + Date.now();
            const pref = {
                id: prefId,
                text: text.trim(),
                category: p.category,
                active: true,
                createdAt: Date.now(),
                usageCount: 0
            };
            state.userPreferences[prefId] = pref;
            StorageManager.savePreferences(state.userPreferences);
            showToast('success', `已记录你的偏好：${text.trim()}`);
            return pref;
        }
    }
    return null;
}

function applyUserPreferences(question) {
    const activePrefs = Object.values(state.userPreferences).filter(p => p.active);
    if (activePrefs.length === 0) return question;
    const prefTexts = activePrefs.map(p => p.text).join('；');
    return `[用户偏好：${prefTexts}]\n${question}`;
}

function getActivePreferencesCount() {
    return Object.values(state.userPreferences).filter(p => p.active).length;
}

// Preference command handlers
function handleShowPreferences() {
    const prefs = Object.values(state.userPreferences);
    if (prefs.length === 0) {
        return `📋 **我的偏好**

你还没有设置任何偏好。

💡 **添加偏好的方法：**
• 发送"添加要求：XXX"
• 发送"记住：XXX"
• 在对话中自然表达偏好（如"请用表格形式回答"）`;
    }
    let activeList = '';
    let inactiveList = '';
    prefs.forEach(p => {
        const line = `• ${p.text}（${p.category}，使用${p.usageCount}次）\n`;
        if (p.active) activeList += line;
        else inactiveList += line;
    });
    let result = `📋 **我的偏好**（共${prefs.length}条，活跃${getActivePreferencesCount()}条）\n\n`;
    if (activeList) result += `✅ **活跃中：**\n${activeList}\n`;
    if (inactiveList) result += `⏸️ **已停用：**\n${inactiveList}\n`;
    result += `💡 **管理命令：**\n• "添加要求：XXX" - 添加新偏好\n• "取消要求：XXX" - 删除偏好\n• "关闭偏好 XXX" - 停用偏好\n• "清除所有偏好" - 清空所有偏好`;
    return result;
}

function handleAddPreference(text) {
    if (!text || !text.trim()) {
        return `❌ 偏好内容不能为空。\n\n请发送：添加要求：XXX`;
    }
    const prefId = 'pref_' + Date.now();
    const pref = {
        id: prefId,
        text: text.trim(),
        category: 'manual',
        active: true,
        createdAt: Date.now(),
        usageCount: 0
    };
    state.userPreferences[prefId] = pref;
    StorageManager.savePreferences(state.userPreferences);
    showToast('success', `已添加偏好：${text.trim()}`);
    return `✅ **偏好已添加**

「${text.trim()}」已保存，将在后续对话中自动应用。`;
}

function handleRemovePreference(idOrText) {
    const prefs = Object.values(state.userPreferences);
    let targetId = null;
    // Try exact id match first
    if (state.userPreferences[idOrText]) {
        targetId = idOrText;
    } else {
        // Try text match
        const match = prefs.find(p => p.text.includes(idOrText) || idOrText.includes(p.text));
        if (match) targetId = match.id;
    }
    if (!targetId) {
        return `❌ 未找到匹配的偏好。\n\n请发送"我的偏好"查看所有偏好。`;
    }
    const removed = state.userPreferences[targetId];
    delete state.userPreferences[targetId];
    StorageManager.savePreferences(state.userPreferences);
    showToast('success', `已删除偏好：${removed.text}`);
    return `✅ **偏好已删除**

「${removed.text}」已移除。`;
}

function handleTogglePreference(idOrText) {
    const prefs = Object.values(state.userPreferences);
    let targetId = null;
    if (state.userPreferences[idOrText]) {
        targetId = idOrText;
    } else {
        const match = prefs.find(p => p.text.includes(idOrText) || idOrText.includes(p.text));
        if (match) targetId = match.id;
    }
    if (!targetId) {
        return `❌ 未找到匹配的偏好。\n\n请发送"我的偏好"查看所有偏好。`;
    }
    const pref = state.userPreferences[targetId];
    pref.active = !pref.active;
    StorageManager.savePreferences(state.userPreferences);
    const status = pref.active ? '已激活' : '已停用';
    showToast('success', `偏好${status}：${pref.text}`);
    return `✅ **偏好${status}**

「${pref.text}」现在${pref.active ? '会在后续对话中自动应用' : '已暂停应用'}。`;
}

function handleClearAllPreferences() {
    const count = Object.keys(state.userPreferences).length;
    state.userPreferences = {};
    StorageManager.savePreferences(state.userPreferences);
    showToast('success', `已清除全部 ${count} 条偏好`);
    return `✅ **偏好已清空**

已清除全部 ${count} 条偏好记录。`;
}

function learnFromInteraction(question, response) {
    if (!question || !response) return;
    const q = question.trim();
    // Detect correction patterns
    const correctionPatterns = [
        { regex: /请用更简单的语言/, text: '使用简单语言回答', category: 'detail' },
        { regex: /请用更详细的语言/, text: '使用详细语言回答', category: 'detail' },
        { regex: /请用表格/, text: '用表格形式回答', category: 'format' },
        { regex: /请用列表/, text: '用列表形式回答', category: 'format' },
        { regex: /请用代码块/, text: '用代码块形式回答', category: 'format' },
        { regex: /请用中文/, text: '用中文回答', category: 'language' },
        { regex: /请用英文/, text: '用英文回答', category: 'language' },
        { regex: /不要说[…\.\s]*(.+)/, text: null, category: 'negative' },
        { regex: /不要[…\.\s]*(.+?)回答/, text: null, category: 'negative' },
    ];
    for (const p of correctionPatterns) {
        const match = q.match(p.regex);
        if (match) {
            const text = p.text || `不要${match[1] || ''}`;
            const prefId = 'pref_' + Date.now();
            state.userPreferences[prefId] = {
                id: prefId,
                text: text.trim(),
                category: p.category,
                active: true,
                createdAt: Date.now(),
                usageCount: 0
            };
            StorageManager.savePreferences(state.userPreferences);
            showToast('success', `已自动学习偏好：${text.trim()}`);
            // 记录纠正到会话记忆
            conversationMemory.recordCorrection();
            conversationMemory.recordPreference(text.trim());
            break;
        }
    }
}

// 检测命令类型
function detectCommand(q, cleanQ) {
    const correctedQ = correctTypos(cleanQ);
    const correctedLower = correctedQ.toLowerCase();
    // Preference commands
    if (/我的偏好|我的要求|查看偏好/.test(correctedQ)) return { type: 'show_preferences', corrected: correctedQ };
    const addPrefMatch = correctedQ.match(/(?:添加要求|记住)[：:]\s*(.+)/);
    if (addPrefMatch) return { type: 'add_preference', corrected: correctedQ, payload: addPrefMatch[1] };
    const removePrefMatch = correctedQ.match(/(?:取消要求|删除偏好)\s*[:：]?\s*(.+)/);
    if (removePrefMatch) return { type: 'remove_preference', corrected: correctedQ, payload: removePrefMatch[1] };
    if (/清除所有偏好/.test(correctedQ)) return { type: 'clear_preferences', corrected: correctedQ };
    const togglePrefMatch = correctedQ.match(/(?:关闭偏好|停用)\s*[:：]?\s*(.+)/);
    if (togglePrefMatch) return { type: 'toggle_preference', corrected: correctedQ, payload: togglePrefMatch[1] };
    if (/翻译/.test(correctedQ) || /translate/.test(correctedLower) || /的英文/.test(correctedQ) || /的中文/.test(correctedQ)) return { type: 'translate', corrected: correctedQ };
    if (/怎么拼/.test(correctedQ) || /怎么读/.test(correctedQ) || /发音/.test(correctedQ) || /音标/.test(correctedQ)) return { type: 'pronounce', corrected: correctedQ };
    if (/解释/.test(correctedQ) || /什么意思/.test(correctedQ) || /是什么/.test(correctedQ) || /的定义/.test(correctedQ)) return { type: 'define', corrected: correctedQ };
    if (/出题/.test(correctedQ) || /来道/.test(correctedQ) || /来几/.test(correctedQ) || /练习题/.test(correctedQ) || /给我.*题/.test(correctedQ) || /测试题/.test(correctedQ) || /出一道/.test(correctedQ) || /出几道/.test(correctedQ) || /出几/.test(correctedQ)) return { type: 'generate_problem', corrected: correctedQ };
    if (/每日一题|每日练习|每日答题/.test(correctedQ)) return { type: 'daily_question', corrected: correctedQ };
    if (/学习计划|帮我制定计划|制定学习计划|帮我安排/.test(correctedQ)) return { type: 'study_plan', corrected: correctedQ };
    // 实现/解决/代码命令
    if (/实现|帮我实现|怎么实现|如何实现/.test(correctedQ)) return { type: 'implement', corrected: correctedQ };
    if (/解决|帮我解决|怎么解决|如何解决/.test(correctedQ)) return { type: 'solve', corrected: correctedQ };
    // 排除判断题格式（陈述句+句号结尾，如"HTML是一种编程语言。"）
    const isLikelyJudgment = /[。\.]$/.test(correctedQ) &&
        !/[=＝\+\-\*\/\×\÷\^\√\d].*[=＝]/.test(correctedQ) &&
        correctedQ.trim().length > 5 && correctedQ.trim().length < 50;
    if (!isLikelyJudgment && /代码|写代码|编程/.test(correctedQ)) return { type: 'code', corrected: correctedQ };
    // 新增命令：总结、对比、举例、思维导图、复习、公式
    if (/^总结|^帮我总结|^概括/.test(correctedQ)) return { type: 'summarize', corrected: correctedQ };
    if (/^对比|^比较|^区别/.test(correctedQ)) return { type: 'compare', corrected: correctedQ };
    if (/^举例|^举个例子|^举例说明/.test(correctedQ)) return { type: 'example', corrected: correctedQ };
    if (/思维导图|知识框架|知识结构/.test(correctedQ)) return { type: 'mindmap', corrected: correctedQ };
    if (/^复习|^帮我复习|^温习/.test(correctedQ)) return { type: 'review', corrected: correctedQ };
    if (/公式|公式大全|公式表/.test(correctedQ)) return { type: 'formulas', corrected: correctedQ };
    // 新增命令：画图表、编题、划重点、做规划
    if (/画图表|画个图表|生成图表|绘制图表|画个表格|画个图|图表展示/.test(correctedQ)) return { type: 'draw_chart', corrected: correctedQ };
    if (/编题|编一道|出一道类似|类似.*题|同类型.*题|再出一道|同类题/.test(correctedQ)) return { type: 'similar_problem', corrected: correctedQ };
    if (/划重点|划重点|提炼重点|重点总结|考点总结|考试重点/.test(correctedQ)) return { type: 'highlight', corrected: correctedQ };
    if (/做规划|制定方案|学习方案|学习路线|学习路径|规划.*学习|安排.*学习|制定.*计划|定制计划/.test(correctedQ)) return { type: 'make_plan', corrected: correctedQ };
    // v3.1.0: 新增命令扩展
    if (/复习上次|回顾上次|上次.*复习/.test(correctedQ)) return { type: 'review_last', corrected: correctedQ };
    if (/换个例子|换.*例子|另一个例子|再举.*例/.test(correctedQ)) return { type: 'different_example', corrected: correctedQ };
    if (/简单点|简单.*说|简单.*讲|简洁.*点/.test(correctedQ)) return { type: 'simpler', corrected: correctedQ };
    if (/详细点|详细.*说|详细.*讲|深入.*讲/.test(correctedQ)) return { type: 'more_detailed', corrected: correctedQ };
    if (/用图解释|画图解释|图.*解释|可视化/.test(correctedQ)) return { type: 'visual_explain', corrected: correctedQ };
    // v3.2.0: 新增实用命令
    if (/总结要点|要点总结|归纳要点|提炼要点|核心要点/.test(correctedQ)) return { type: 'summarize_points', corrected: correctedQ };
    if (/对比区别|区别.*对比|有什么不同|差异.*对比|比较.*区别/.test(correctedQ)) return { type: 'compare_diff', corrected: correctedQ };
    if (/举\s*3?\s*个例子|给.*三个例子|来三个例子|三个示例|举几个例子/.test(correctedQ)) return { type: 'give_3_examples', corrected: correctedQ };
    if (/用表格整理|整理成表格|做成表格|表格.*整理|列表整理/.test(correctedQ)) return { type: 'table_format', corrected: correctedQ };
    if (/画图说明|画个图|用图说明|图示说明|画示意图/.test(correctedQ)) return { type: 'draw_explain', corrected: correctedQ };
    if (/用简单的话解释|简单解释|通俗解释|白话解释|用大白话|通俗.*说|简单.*说/.test(correctedQ)) return { type: 'simple_explain', corrected: correctedQ };
    // 文件写入命令
    if (/写一个文件|创建文件|写一个.*文件|新建文件|生成文件/.test(correctedQ)) return { type: 'write_file', corrected: correctedQ };
    if (/^\s*[\d\(\)\s.+\-*/÷×]+\s*$/.test(correctedQ) && /[\d]/.test(correctedQ) && /[+\-*/÷×]/.test(correctedQ)) {
        // 分数运算模式（如 1/3 + 2/5）不作为 calculate 命令，交给后续分数处理流程
        if (/^\s*\d+\s*\/\s*\d+\s*([+\-×*/÷]\s*\d+\s*\/\s*\d+\s*)+$/.test(correctedQ)) return null;
        return { type: 'calculate', corrected: correctedQ };
    }
    return null;
}

// 处理翻译请求
function handleTranslate(cleanQ) {
    const patterns = [/翻译\s*[:：]?\s*([\s\S]+)/, /(.+)\s*的英文是?什么/, /(.+)\s*的中文是?什么/, /(.+)\s*怎么?翻译/];
    for (const p of patterns) {
        const m = cleanQ.match(p);
        if (m && m[1]) {
            const text = m[1].trim();
            const isChinese = /[\u4e00-\u9fa5]/.test(text);
            if (isChinese) {
                const trans = typeof getEnglishTranslation === 'function' ? getEnglishTranslation(text) : null;
                if (trans) return `「${text}」的英文翻译：${trans}`;
                return `「${text}」\n\n建议：这个词/句暂无本地翻译，可以开启联网搜索获取更准确的翻译。`;
            } else {
                const trans = typeof getChineseTranslation === 'function' ? getChineseTranslation(text) : null;
                if (trans) return `「${text}」的中文翻译：${trans}`;
                return `「${text}」\n\n建议：这个词/句暂无本地翻译，可以开启联网搜索获取更准确的翻译。`;
            }
        }
    }
    return null;
}

// 处理发音/拼音请求
function handlePronounce(cleanQ) {
    // 匹配多种拼音/读音查询格式
    const patterns = [
        /(.+?)\s*(?:怎么拼|怎么读|发音|音标)/,
        /(.+?)\s*(?:的拼音|的读音|的注音)/,
        /拼音\s*[:：]?\s*(.+)/,
        /读音\s*[:：]?\s*(.+)/,
        /(.+?)\s*(?:念什么|读什么|念几声|第几声)/,
        /(.+?)\s*zao\s*\(?\s*(\d)\s*声\s*\)?/i,
        /(.+?)\s*lin\s*\(?\s*(\d)\s*声\s*\)?/i,
    ];
    let word = null;
    let specifiedTone = null;
    for (const p of patterns) {
        const m = cleanQ.match(p);
        if (m) {
            word = m[1].trim();
            if (m[2]) specifiedTone = m[2];
            break;
        }
    }
    // 如果上面没匹配到，尝试直接提取"X（Y声）"格式
    if (!word) {
        const directMatch = cleanQ.match(/([\u4e00-\u9fa5]+)\s*\(?\s*(\d)\s*声\s*\)?/);
        if (directMatch) { word = directMatch[1]; specifiedTone = directMatch[2]; }
    }
    if (!word) return null;

    // 英文字母/单词发音
    if (/^[a-zA-Z\s]+$/.test(word)) {
        const trans = typeof getChineseTranslation === 'function' ? getChineseTranslation(word) : null;
        if (trans && !trans.includes('暂无精确翻译')) return `**${word}**\n\n中文释义：${trans}\n\n💡 发音提示：注意重音和元音的准确发音。`;
        return `**${word}**\n\n该词暂无本地释义。建议检查拼写。`;
    }

    // 扩展拼音数据库（350+常用字）
    const pinyinDB = {
        // 单字（按拼音排序）
        '阿':'ā','啊':'a','埃':'āi','挨':'ái','爱':'ài','安':'ān','岸':'àn','昂':'áng','傲':'ào','八':'bā','巴':'bā','拔':'bá','把':'bǎ','爸':'bà','白':'bái','百':'bǎi','拜':'bài','班':'bān','半':'bàn','帮':'bāng','包':'bāo','保':'bǎo','报':'bào','抱':'bào','北':'běi','贝':'bèi','备':'bèi','本':'běn','比':'bǐ','必':'bì','边':'biān','变':'biàn','便':'biàn','标':'biāo','表':'biǎo','别':'bié','兵':'bīng','冰':'bīng','丙':'bǐng','病':'bìng','波':'bō','博':'bó','不':'bù','布':'bù','步':'bù','才':'cái','采':'cǎi','彩':'cǎi','菜':'cài','参':'cān','残':'cán','蚕':'cán','仓':'cāng','藏':'cáng','操':'cāo','曹':'cáo','草':'cǎo','册':'cè','侧':'cè','测':'cè','层':'céng','曾':'céng','插':'chā','查':'chá','茶':'chá','差':'chà','拆':'chāi','柴':'chái','产':'chǎn','昌':'chāng','长':'cháng','场':'chǎng','常':'cháng','厂':'chǎng','唱':'chàng','超':'chāo','朝':'cháo','潮':'cháo','车':'chē','扯':'chě','彻':'chè','沉':'chén','陈':'chén','晨':'chén','称':'chēng','成':'chéng','承':'chéng','城':'chéng','乘':'chéng','程':'chéng','吃':'chī','池':'chí','迟':'chí','持':'chí','尺':'chǐ','齿':'chǐ','赤':'chì','冲':'chōng','充':'chōng','虫':'chóng','重':'chóng','崇':'chóng','抽':'chōu','仇':'chóu','绸':'chóu','愁':'chóu','丑':'chǒu','初':'chū','出':'chū','除':'chú','处':'chǔ','楚':'chǔ','川':'chuān','穿':'chuān','传':'chuán','船':'chuán','窗':'chuāng','床':'chuáng','创':'chuàng','吹':'chuī','春':'chūn','纯':'chún','词':'cí','此':'cǐ','次':'cì','刺':'cì','从':'cóng','匆':'cōng','聪':'cōng','粗':'cū','促':'cù','村':'cūn','存':'cún','寸':'cùn','错':'cuò','达':'dá','答':'dá','打':'dǎ','大':'dà','代':'dài','带':'dài','待':'dài','单':'dān','但':'dàn','担':'dān','胆':'dǎn','淡':'dàn','当':'dāng','党':'dǎng','刀':'dāo','导':'dǎo','到':'dào','道':'dào','德':'dé','得':'dé','的':'de','灯':'dēng','登':'dēng','等':'děng','低':'dī','底':'dǐ','地':'dì','弟':'dì','第':'dì','典':'diǎn','点':'diǎn','电':'diàn','店':'diàn','掉':'diào','爹':'diē','丁':'dīng','顶':'dǐng','定':'dìng','丢':'diū','东':'dōng','冬':'dōng','懂':'dǒng','动':'dòng','冻':'dòng','洞':'dòng','都':'dōu','斗':'dǒu','豆':'dòu','毒':'dú','读':'dú','独':'dú','度':'dù','短':'duǎn','段':'duàn','断':'duàn','队':'duì','对':'duì','吨':'dūn','多':'duō','夺':'duó','朵':'duǒ','饿':'è','恩':'ēn','儿':'ér','而':'ér','耳':'ěr','二':'èr','发':'fā','法':'fǎ','反':'fǎn','饭':'fàn','方':'fāng','房':'fáng','防':'fáng','访':'fǎng','放':'fàng','飞':'fēi','非':'fēi','肥':'féi','分':'fēn','纷':'fēn','坟':'fén','粉':'fěn','份':'fèn','奋':'fèn','风':'fēng','丰':'fēng','封':'fēng','疯':'fēng','峰':'fēng','锋':'fēng','逢':'féng','凤':'fèng','佛':'fó','夫':'fū','肤':'fū','服':'fú','浮':'fú','符':'fú','福':'fú','府':'fǔ','父':'fù','付':'fù','负':'fù','妇':'fù','附':'fù','复':'fù','富':'fù','改':'gǎi','盖':'gài','干':'gān','甘':'gān','杆':'gān','赶':'gǎn','敢':'gǎn','感':'gǎn','刚':'gāng','钢':'gāng','高':'gāo','告':'gào','哥':'gē','歌':'gē','格':'gé','隔':'gé','个':'gè','各':'gè','给':'gěi','根':'gēn','更':'gèng','工':'gōng','公':'gōng','功':'gōng','攻':'gōng','供':'gōng','宫':'gōng','恭':'gōng','共':'gòng','狗':'gǒu','构':'gòu','够':'gòu','估':'gū','姑':'gū','孤':'gū','古':'gǔ','谷':'gǔ','股':'gǔ','骨':'gǔ','鼓':'gǔ','固':'gù','故':'gù','顾':'gù','瓜':'guā','刮':'guā','挂':'guà','怪':'guài','关':'guān','观':'guān','官':'guān','馆':'guǎn','管':'guǎn','贯':'guàn','广':'guǎng','归':'guī','规':'guī','鬼':'guǐ','桂':'guì','贵':'guì','桂':'guì','滚':'gǔn','国':'guó','果':'guǒ','过':'guò','哈':'hā','海':'hǎi','害':'hài','寒':'hán','含':'hán','喊':'hǎn','汉':'hàn','汗':'hàn','航':'háng','毫':'háo','好':'hǎo','号':'hào','浩':'hào','喝':'hē','合':'hé','何':'hé','和':'hé','河':'hé','贺':'hè','黑':'hēi','很':'hěn','恨':'hèn','恒':'héng','横':'héng','红':'hóng','宏':'hóng','洪':'hóng','哄':'hǒng','喉':'hóu','猴':'hóu','吼':'hǒu','厚':'hòu','候':'hòu','乎':'hū','呼':'hū','忽':'hū','狐':'hú','胡':'hú','湖':'hú','虎':'hǔ','互':'hù','户':'hù','护':'hù','花':'huā','华':'huá','划':'huá','化':'huà','话':'huà','怀':'huái','坏':'huài','欢':'huān','还':'hái','环':'huán','缓':'huǎn','换':'huàn','唤':'huàn','患':'huàn','荒':'huāng','皇':'huáng','黄':'huáng','灰':'huī','挥':'huī','辉':'huī','回':'huí','悔':'huǐ','汇':'huì','会':'huì','绘':'huì','婚':'hūn','混':'hùn','活':'huó','火':'huǒ','伙':'huǒ','或':'huò','货':'huò','获':'huò','击':'jī','基':'jī','机':'jī','鸡':'jī','积':'jī','激':'jī','及':'jí','级':'jí','极':'jí','急':'jí','即':'jí','集':'jí','籍':'jí','几':'jǐ','己':'jǐ','计':'jì','记':'jì','技':'jì','际':'jì','季':'jì','剂':'jì','济':'jì','既':'jì','继':'jì','寄':'jì','加':'jiā','夹':'jiā','佳':'jiā','家':'jiā','甲':'jiǎ','价':'jià','驾':'jià','架':'jià','假':'jiǎ','嫁':'jià','坚':'jiān','间':'jiān','艰':'jiān','肩':'jiān','监':'jiān','兼':'jiān','检':'jiǎn','减':'jiǎn','简':'jiǎn','见':'jiàn','件':'jiàn','建':'jiàn','剑':'jiàn','健':'jiàn','渐':'jiàn','江':'jiāng','将':'jiāng','讲':'jiǎng','降':'jiàng','交':'jiāo','郊':'jiāo','娇':'jiāo','浇':'jiāo','骄':'jiāo','胶':'jiāo','教':'jiào','焦':'jiāo','角':'jiǎo','脚':'jiǎo','较':'jiào','叫':'jiào','接':'jiē','揭':'jiē','街':'jiē','节':'jié','结':'jié','杰':'jié','捷':'jié','截':'jié','解':'jiě','姐':'jiě','介':'jiè','戒':'jiè','界':'jiè','借':'jiè','今':'jīn','斤':'jīn','金':'jīn','津':'jīn','紧':'jǐn','仅':'jǐn','尽':'jǐn','进':'jìn','近':'jìn','京':'jīng','经':'jīng','惊':'jīng','晶':'jīng','精':'jīng','井':'jǐng','颈':'jǐng','景':'jǐng','警':'jǐng','净':'jìng','静':'jìng','境':'jìng','敬':'jìng','竟':'jìng','竞':'jìng','究':'jiū','九':'jiǔ','久':'jiǔ','酒':'jiǔ','旧':'jiù','救':'jiù','就':'jiù','居':'jū','局':'jú','菊':'jú','举':'jǔ','矩':'jǔ','句':'jù','巨':'jù','拒':'jù','具':'jù','俱':'jù','剧':'jù','据':'jù','距':'jù','惧':'jù','卷':'juǎn','决':'jué','绝':'jué','军':'jūn','君':'jūn','均':'jūn','菌':'jūn','卡':'kǎ','开':'kāi','凯':'kǎi','刊':'kān','看':'kàn','康':'kāng','抗':'kàng','考':'kǎo','靠':'kào','科':'kē','棵':'kē','颗':'kē','壳':'ké','可':'kě','渴':'kě','克':'kè','刻':'kè','客':'kè','课':'kè','肯':'kěn','坑':'kēng','空':'kōng','孔':'kǒng','恐':'kǒng','控':'kòng','口':'kǒu','扣':'kòu','枯':'kū','哭':'kū','苦':'kǔ','库':'kù','裤':'kù','夸':'kuā','跨':'kuà','块':'kuài','快':'kuài','宽':'kuān','款':'kuǎn','狂':'kuáng','况':'kuàng','亏':'kuī','葵':'kuí','愧':'kuì','昆':'kūn','困':'kùn','扩':'kuò','括':'kuò','垃':'lā','拉':'lā','啦':'la','腊':'là','辣':'là','来':'lái','兰':'lán','蓝':'lán','篮':'lán','览':'lǎn','懒':'lǎn','烂':'làn','狼':'láng','朗':'lǎng','浪':'làng','劳':'láo','老':'lǎo','乐':'lè','雷':'léi','累':'lèi','冷':'lěng','离':'lí','丽':'lì','利':'lì','励':'lì','例':'lì','隶':'lì','力':'lì','历':'lì','立':'lì','粒':'lì','连':'lián','帘':'lián','怜':'lián','联':'lián','脸':'liǎn','练':'liàn','炼':'liàn','良':'liáng','凉':'liáng','梁':'liáng','粮':'liáng','两':'liǎng','亮':'liàng','谅':'liàng','辽':'liáo','疗':'liáo','了':'le','料':'liào','列':'liè','劣':'liè','林':'lín','临':'lín','淋':'lín','灵':'líng','岭':'lǐng','领':'lǐng','另':'lìng','令':'lìng','刘':'liú','流':'liú','留':'liú','六':'liù','龙':'lóng','聋':'lóng','笼':'lóng','隆':'lóng','楼':'lóu','漏':'lòu','露':'lù','卢':'lú','芦':'lú','炉':'lú','鲁':'lǔ','陆':'lù','录':'lù','鹿':'lù','滤':'lǜ','乱':'luàn','掠':'lüè','略':'lüè','轮':'lún','论':'lùn','罗':'luó','螺':'luó','落':'luò','妈':'mā','麻':'má','马':'mǎ','码':'mǎ','骂':'mà','吗':'ma','埋':'mái','买':'mǎi','卖':'mài','麦':'mài','脉':'mài','蛮':'mán','满':'mǎn','慢':'màn','忙':'máng','芒':'máng','盲':'máng','毛':'máo','矛':'máo','茂':'mào','貌':'mào','么':'me','没':'méi','眉':'méi','梅':'méi','媒':'méi','每':'měi','美':'měi','妹':'mèi','门':'mén','闷':'mèn','们':'men','蒙':'méng','盟':'méng','猛':'měng','梦':'mèng','迷':'mí','谜':'mí','米':'mǐ','秘':'mì','密':'mì','蜜':'mì','眠':'mián','棉':'mián','免':'miǎn','勉':'miǎn','面':'miàn','苗':'miáo','描':'miáo','秒':'miǎo','妙':'miào','庙':'miào','灭':'miè','民':'mín','敏':'mǐn','名':'míng','明':'míng','命':'mìng','摸':'mō','模':'mó','膜':'mó','磨':'mó','末':'mò','沫':'mò','陌':'mò','莫':'mò','漠':'mò','墨':'mò','默':'mò','谋':'móu','某':'mǒu','母':'mǔ','亩':'mǔ','木':'mù','目':'mù','牧':'mù','墓':'mù','幕':'mù','拿':'ná','哪':'nǎ','内':'nèi','那':'nà','纳':'nà','乃':'nǎi','奶':'nǎi','奈':'nài','男':'nán','南':'nán','难':'nán','脑':'nǎo','闹':'nào','呢':'ne','馁':'něi','嫩':'nèn','能':'néng','尼':'ní','泥':'ní','你':'nǐ','拟':'nǐ','逆':'nì','年':'nián','念':'niàn','娘':'niáng','酿':'niàng','鸟':'niǎo','尿':'niào','捏':'niē','宁':'níng','凝':'níng','牛':'niú','扭':'niǔ','浓':'nóng','农':'nóng','弄':'nòng','奴':'nú','努':'nǔ','怒':'nù','女':'nǚ','暖':'nuǎn','欧':'ōu','偶':'ǒu','爬':'pá','怕':'pà','拍':'pāi','排':'pái','派':'pài','盘':'pán','判':'pàn','旁':'páng','胖':'pàng','炮':'pào','跑':'pǎo','陪':'péi','培':'péi','配':'pèi','喷':'pēn','盆':'pén','朋':'péng','棚':'péng','蓬':'péng','鹏':'péng','捧':'pěng','碰':'pèng','批':'pī','披':'pī','皮':'pí','疲':'pí','脾':'pí','匹':'pǐ','片':'piàn','偏':'piān','篇':'piān','骗':'piàn','飘':'piāo','漂':'piāo','票':'piào','撇':'piē','品':'pǐn','乒':'pīng','平':'píng','评':'píng','凭':'píng','苹':'píng','萍':'píng','坡':'pō','泼':'pō','婆':'pó','迫':'pò','破':'pò','剖':'pōu','扑':'pū','铺':'pū','仆':'pú','葡':'pú','朴':'pǔ','圃':'pǔ','浦':'pǔ','普':'pǔ','七':'qī','妻':'qī','戚':'qī','期':'qī','欺':'qī','漆':'qī','齐':'qí','其':'qí','奇':'qí','骑':'qí','棋':'qí','旗':'qí','乞':'qǐ','企':'qǐ','岂':'qǐ','启':'qǐ','起':'qǐ','气':'qì','弃':'qì','汽':'qì','砌':'qì','器':'qì','恰':'qià','洽':'qià','千':'qiān','迁':'qiān','牵':'qiān','铅':'qiān','谦':'qiān','签':'qiān','前':'qián','钱':'qián','钳':'qián','浅':'qiǎn','遣':'qiǎn','谴':'qiǎn','欠':'qiàn','枪':'qiāng','腔':'qiāng','强':'qiáng','墙':'qiáng','抢':'qiǎng','悄':'qiāo','敲':'qiāo','乔':'qiáo','桥':'qiáo','巧':'qiǎo','俏':'qiào','切':'qiē','且':'qiě','窃':'qiè','亲':'qīn','侵':'qīn','琴':'qín','勤':'qín','擒':'qín','寝':'qǐn','沁':'qìn','青':'qīng','轻':'qīng','氢':'qīng','倾':'qīng','卿':'qīng','清':'qīng','蜻':'qīng','情':'qíng','晴':'qíng','擎':'qíng','顷':'qǐng','请':'qǐng','庆':'qìng','穷':'qióng','琼':'qióng','丘':'qiū','秋':'qiū','蚯':'qiū','求':'qiú','球':'qiú','区':'qū','曲':'qǔ','驱':'qū','屈':'qū','躯':'qū','趋':'qū','渠':'qú','取':'qǔ','去':'qù','趣':'qù','圈':'quān','权':'quán','全':'quán','泉':'quán','拳':'quán','犬':'quǎn','劝':'quàn','券':'quàn','缺':'quē','却':'què','鹊':'què','确':'què','裙':'qún','群':'qún','然':'rán','燃':'rán','染':'rǎn','嚷':'rǎng','壤':'rǎng','让':'ràng','饶':'ráo','扰':'rǎo','绕':'rào','惹':'rě','热':'rè','人':'rén','仁':'rén','忍':'rěn','认':'rèn','任':'rèn','刃':'rèn','扔':'rēng','仍':'réng','日':'rì','荣':'róng','容':'róng','熔':'róng','融':'róng','冗':'rǒng','柔':'róu','肉':'ròu','如':'rú','儒':'rú','乳':'rǔ','入':'rù','软':'ruǎn','锐':'ruì','瑞':'ruì','润':'rùn','若':'ruò','弱':'ruò','撒':'sā','洒':'sǎ','塞':'sāi','赛':'sài','三':'sān','伞':'sǎn','散':'sàn','桑':'sāng','嗓':'sǎng','丧':'sàng','扫':'sǎo','色':'sè','森':'sēn','僧':'sēng','杀':'shā','沙':'shā','纱':'shā','刹':'shā','砂':'shā','傻':'shǎ','筛':'shāi','晒':'shài','山':'shān','杉':'shān','衫':'shān','闪':'shǎn','善':'shàn','扇':'shàn','伤':'shāng','商':'shāng','赏':'shǎng','上':'shàng','尚':'shàng','捎':'shāo','梢':'shāo','烧':'shāo','稍':'shāo','勺':'sháo','少':'shǎo','绍':'shào','哨':'shào','奢':'shē','舌':'shé','蛇':'shé','舍':'shě','设':'shè','社':'shè','射':'shè','涉':'shè','摄':'shè','申':'shēn','伸':'shēn','身':'shēn','深':'shēn','神':'shén','审':'shěn','婶':'shěn','肾':'shèn','甚':'shèn','渗':'shèn','慎':'shèn','升':'shēng','生':'shēng','声':'shēng','牲':'shēng','胜':'shèng','绳':'shéng','省':'shěng','圣':'shèng','剩':'shèng','尸':'shī','失':'shī','师':'shī','诗':'shī','狮':'shī','施':'shī','湿':'shī','十':'shí','什':'shí','石':'shí','时':'shí','识':'shí','实':'shí','拾':'shí','食':'shí','蚀':'shí','史':'shǐ','使':'shǐ','始':'shǐ','驶':'shǐ','士':'shì','氏':'shì','世':'shì','市':'shì','示':'shì','式':'shì','事':'shì','侍':'shì','势':'shì','视':'shì','试':'shì','饰':'shì','室':'shì','是':'shì','适':'shì','逝':'shì','释':'shì','誓':'shì','收':'shōu','手':'shǒu','守':'shǒu','首':'shǒu','寿':'shòu','受':'shòu','兽':'shòu','售':'shòu','授':'shòu','瘦':'shòu','书':'shū','抒':'shū','枢':'shū','叔':'shū','殊':'shū','梳':'shū','淑':'shū','疏':'shū','舒':'shū','输':'shū','蔬':'shū','熟':'shú','暑':'shǔ','黍':'shǔ','署':'shǔ','蜀':'shǔ','鼠':'shǔ','属':'shǔ','术':'shù','束':'shù','述':'shù','树':'shù','竖':'shù','恕':'shù','刷':'shuā','耍':'shuǎ','衰':'shuāi','摔':'shuāi','甩':'shuǎi','帅':'shuài','拴':'shuān','霜':'shuāng','双':'shuāng','爽':'shuǎng','谁':'shuí','水':'shuǐ','税':'shuì','睡':'shuì','顺':'shùn','瞬':'shùn','说':'shuō','丝':'sī','司':'sī','私':'sī','思':'sī','斯':'sī','撕':'sī','死':'sǐ','四':'sì','寺':'sì','似':'sì','松':'sōng','送':'sòng','颂':'sòng','诵':'sòng','搜':'sōu','艘':'sōu','苏':'sū','俗':'sú','诉':'sù','肃':'sù','素':'sù','速':'sù','宿':'sù','塑':'sù','酸':'suān','蒜':'suàn','算':'suàn','虽':'suī','随':'suí','岁':'suì','孙':'sūn','损':'sǔn','笋':'sǔn','缩':'suō','所':'suǒ','索':'suǒ','锁':'suǒ','他':'tā','它':'tā','她':'tā','塌':'tā','塔':'tǎ','踏':'tà','胎':'tāi','台':'tái','抬':'tái','太':'tài','态':'tài','泰':'tài','贪':'tān','摊':'tān','滩':'tān','坛':'tán','谈':'tán','痰':'tán','谭':'tán','潭':'tán','檀':'tán','坦':'tǎn','叹':'tàn','炭':'tàn','探':'tàn','汤':'tāng','唐':'táng','堂':'táng','塘':'táng','糖':'táng','螳':'táng','倘':'tǎng','淌':'tǎng','躺':'tǎng','烫':'tàng','涛':'tāo','掏':'tāo','逃':'táo','桃':'táo','陶':'táo','萄':'táo','淘':'táo','讨':'tǎo','套':'tào','特':'tè','疼':'téng','腾':'téng','梯':'tī','踢':'tī','啼':'tí','提':'tí','题':'tí','蹄':'tí','体':'tǐ','替':'tì','天':'tiān','添':'tiān','田':'tián','填':'tián','挑':'tiāo','条':'tiáo','跳':'tiào','贴':'tiē','铁':'tiě','厅':'tīng','听':'tīng','廷':'tíng','亭':'tíng','庭':'tíng','停':'tíng','挺':'tǐng','艇':'tǐng','通':'tōng','同':'tóng','铜':'tóng','童':'tóng','统':'tǒng','桶':'tǒng','筒':'tǒng','痛':'tòng','偷':'tōu','投':'tóu','头':'tóu','透':'tòu','凸':'tū','秃':'tū','突':'tū','图':'tú','徒':'tú','涂':'tú','途':'tú','屠':'tú','土':'tǔ','吐':'tǔ','兔':'tù','团':'tuán','推':'tuī','退':'tuì','吞':'tūn','屯':'tún','托':'tuō','拖':'tuō','脱':'tuō','驮':'tuó','陀':'tuó','妥':'tuǒ','拓':'tuò','挖':'wā','蛙':'wā','娃':'wá','瓦':'wǎ','袜':'wà','歪':'wāi','外':'wài','弯':'wān','湾':'wān','完':'wán','玩':'wán','顽':'wán','挽':'wǎn','晚':'wǎn','碗':'wǎn','万':'wàn','汪':'wāng','亡':'wáng','王':'wáng','网':'wǎng','往':'wǎng','妄':'wàng','忘':'wàng','旺':'wàng','望':'wàng','危':'wēi','威':'wēi','微':'wēi','为':'wéi','围':'wéi','违':'wéi','唯':'wéi','惟':'wéi','维':'wéi','伟':'wěi','伪':'wěi','尾':'wěi','委':'wěi','卫':'wèi','未':'wèi','位':'wèi','味':'wèi','畏':'wèi','胃':'wèi','谓':'wèi','喂':'wèi','温':'wēn','文':'wén','纹':'wén','闻':'wén','蚊':'wén','吻':'wěn','稳':'wěn','问':'wèn','翁':'wēng','窝':'wō','我':'wǒ','沃':'wò','卧':'wò','握':'wò','乌':'wū','污':'wū','呜':'wū','巫':'wū','诬':'wū','屋':'wū','无':'wú','吴':'wú','吾':'wú','梧':'wú','五':'wǔ','午':'wǔ','伍':'wǔ','武':'wǔ','侮':'wǔ','舞':'wǔ','勿':'wù','务':'wù','戊':'wù','物':'wù','误':'wù','悟':'wù','雾':'wù','夕':'xī','西':'xī','吸':'xī','希':'xī','昔':'xī','析':'xī','牺':'xī','息':'xī','惜':'xī','悉':'xī','蟋':'xī','锡':'xī','熙':'xī','嘻':'xī','膝':'xī','习':'xí','席':'xí','袭':'xí','洗':'xǐ','喜':'xǐ','戏':'xì','系':'xì','细':'xì','虾':'xiā','瞎':'xiā','峡':'xiá','狭':'xiá','霞':'xiá','下':'xià','夏':'xià','吓':'xià','掀':'xiān','先':'xiān','仙':'xiān','纤':'xiān','鲜':'xiān','闲':'xián','贤':'xián','咸':'xián','嫌':'xián','显':'xiǎn','险':'xiǎn','县':'xiàn','现':'xiàn','限':'xiàn','线':'xiàn','宪':'xiàn','陷':'xiàn','馅':'xiàn','羡':'xiàn','献':'xiàn','腺':'xiàn','乡':'xiāng','相':'xiāng','香':'xiāng','箱':'xiāng','详':'xiáng','祥':'xiáng','翔':'xiáng','享':'xiǎng','响':'xiǎng','想':'xiǎng','向':'xiàng','巷':'xiàng','项':'xiàng','象':'xiàng','像':'xiàng','橡':'xiàng','削':'xiāo','消':'xiāo','宵':'xiāo','硝':'xiāo','销':'xiāo','小':'xiǎo','晓':'xiǎo','孝':'xiào','效':'xiào','校':'xiào','笑':'xiào','些':'xiē','歇':'xiē','协':'xié','邪':'xié','胁':'xié','斜':'xié','谐':'xié','携':'xié','鞋':'xié','写':'xiě','泄':'xiè','泻':'xiè','卸':'xiè','屑':'xiè','械':'xiè','谢':'xiè','懈':'xiè','蟹':'xiè','心':'xīn','辛':'xīn','新':'xīn','薪':'xīn','欣':'xīn','信':'xìn','兴':'xìng','星':'xīng','腥':'xīng','刑':'xíng','形':'xíng','型':'xíng','醒':'xǐng','杏':'xìng','姓':'xìng','幸':'xìng','性':'xìng','凶':'xiōng','兄':'xiōng','匈':'xiōng','胸':'xiōng','雄':'xióng','熊':'xióng','休':'xiū','修':'xiū','羞':'xiū','朽':'xiǔ','秀':'xiù','袖':'xiù','锈':'xiù','须':'xū','虚':'xū','需':'xū','徐':'xú','许':'xǔ','序':'xù','叙':'xù','畜':'xù','绪':'xù','续':'xù','宣':'xuān','悬':'xuán','旋':'xuán','选':'xuǎn','癣':'xuǎn','炫':'xuàn','眩':'xuàn','靴':'xuē','学':'xué','穴':'xué','雪':'xuě','血':'xuè','寻':'xún','巡':'xún','询':'xún','循':'xún','训':'xùn','讯':'xùn','迅':'xùn','压':'yā','呀':'ya','鸦':'yā','鸭':'yā','牙':'yá','芽':'yá','蚜':'yá','崖':'yá','涯':'yá','雅':'yǎ','亚':'yà','咽':'yàn','烟':'yān','淹':'yān','盐':'yán','严':'yán','言':'yán','岩':'yán','炎':'yán','研':'yán','盐':'yán','蜒':'yán','颜':'yán','掩':'yǎn','眼':'yǎn','演':'yǎn','厌':'yàn','宴':'yàn','验':'yàn','雁':'yàn','焰':'yàn','燕':'yàn','央':'yāng','秧':'yāng','扬':'yáng','羊':'yáng','阳':'yáng','杨':'yáng','洋':'yáng','仰':'yǎng','养':'yǎng','氧':'yǎng','痒':'yǎng','样':'yàng','腰':'yāo','邀':'yāo','摇':'yáo','遥':'yáo','窑':'yáo','谣':'yáo','咬':'yǎo','药':'yào','要':'yào','耀':'yào','爷':'yé','耶':'yē','也':'yě','冶':'yě','野':'yě','业':'yè','叶':'yè','页':'yè','夜':'yè','液':'yè','一':'yī','衣':'yī','医':'yī','依':'yī','伊':'yī','夷':'yí','宜':'yí','移':'yí','遗':'yí','疑':'yí','乙':'yǐ','已':'yǐ','以':'yǐ','矣':'yǐ','蚁':'yǐ','椅':'yǐ','义':'yì','亿':'yì','艺':'yì','忆':'yì','议':'yì','亦':'yì','异':'yì','役':'yì','抑':'yì','译':'yì','易':'yì','疫':'yì','益':'yì','谊':'yì','逸':'yì','意':'yì','溢':'yì','毅':'yì','翼':'yì','因':'yīn','阴':'yīn','音':'yīn','姻':'yīn','吟':'yín','银':'yín','引':'yǐn','饮':'yǐn','隐':'yǐn','印':'yìn','应':'yīng','英':'yīng','婴':'yīng','鹰':'yīng','迎':'yíng','盈':'yíng','营':'yíng','蝇':'yíng','赢':'yíng','影':'yǐng','映':'yìng','硬':'yìng','哟':'yō','拥':'yōng','佣':'yōng','痈':'yōng','庸':'yōng','永':'yǒng','泳':'yǒng','勇':'yǒng','涌':'yǒng','用':'yòng','优':'yōu','忧':'yōu','悠':'yōu','尤':'yóu','由':'yóu','邮':'yóu','犹':'yóu','油':'yóu','游':'yóu','友':'yǒu','有':'yǒu','又':'yòu','右':'yòu','幼':'yòu','诱':'yòu','于':'yú','余':'yú','鱼':'yú','娱':'yú','渔':'yú','愉':'yú','愚':'yú','榆':'yú','与':'yǔ','宇':'yǔ','羽':'yǔ','雨':'yǔ','语':'yǔ','玉':'yù','驭':'yù','芋':'yù','育':'yù','郁':'yù','狱':'yù','浴':'yù','预':'yù','域':'yù','欲':'yù','喻':'yù','寓':'中','裕':'yù','遇':'yù','愈':'yù','誉':'yù','豫':'yù','冤':'yuān','元':'yuán','园':'yuán','员':'yuán','原':'yuán','圆':'yuán','袁':'yuán','援':'yuán','缘':'yuán','源':'yuán','远':'yuǎn','怨':'yuàn','院':'yuàn','愿':'yuàn','曰':'yuē','约':'yuē','月':'yuè','岳':'yuè','悦':'yuè','阅':'yuè','跃':'yuè','越':'yuè','云':'yún','匀':'yún','允':'yǔn','孕':'yùn','运':'yùn','酝':'yùn','晕':'yùn','韵':'yùn','杂':'zá','灾':'zāi','栽':'zāi','宰':'zǎi','载':'zǎi','再':'zài','在':'zài','咱':'zán','暂':'zàn','赞':'zàn','脏':'zāng','葬':'zàng','遭':'zāo','糟':'zāo','早':'zǎo','枣':'zǎo','澡':'zǎo','藻':'zǎo','灶':'zào','皂':'zào','造':'zào','噪':'zào','燥':'zào','躁':'zào','则':'zé','责':'zé','择':'zé','泽':'zé','贼':'zéi','怎':'zěn','增':'zēng','憎':'zēng','赠':'zèng','扎':'zhā','渣':'zhā','札':'zhá','轧':'zhá','闸':'zhá','炸':'zhà','诈':'zhà','摘':'zhāi','窄':'zhǎi','债':'zhài','寨':'zhài','沾':'zhān','粘':'zhān','斩':'zhǎn','展':'zhǎn','盏':'zhǎn','崭':'zhǎn','占':'zhàn','战':'zhàn','站':'zhàn','张':'zhāng','章':'zhāng','彰':'zhāng','樟':'zhāng','涨':'zhǎng','掌':'zhǎng','丈':'zhàng','仗':'zhàng','帐':'zhàng','账':'zhàng','胀':'zhàng','障':'zhàng','招':'zhāo','找':'zhǎo','召':'zhào','兆':'zhào','照':'zhào','罩':'zhào','遮':'zhē','折':'zhé','哲':'zhé','者':'zhě','这':'zhè','浙':'zhè','针':'zhēn','珍':'zhēn','真':'zhēn','诊':'zhěn','枕':'zhěn','阵':'zhèn','振':'zhèn','镇':'zhèn','震':'zhèn','争':'zhēng','征':'zhēng','睁':'zhēng','筝':'zhēng','蒸':'zhēng','整':'zhěng','正':'zhèng','证':'zhèng','郑':'zhèng','政':'zhèng','症':'zhèng','之':'zhī','支':'zhī','只':'zhī','芝':'zhī','枝':'zhī','知':'zhī','织':'zhī','肢':'zhī','脂':'zhī','蜘':'zhī','执':'zhí','直':'zhí','值':'zhí','职':'zhí','植':'zhí','殖':'zhí','止':'zhǐ','旨':'zhǐ','址':'zhǐ','指':'zhǐ','纸':'zhǐ','志':'zhì','制':'zhì','治':'zhì','质':'zhì','致':'zhì','秩':'zhì','智':'zhì','置':'zhì','稚':'zhì','中':'zhōng','忠':'zhōng','终':'zhōng','钟':'zhōng','肿':'zhǒng','种':'zhǒng','仲':'zhòng','众':'zhòng','重':'zhòng','州':'zhōu','舟':'zhōu','周':'zhōu','洲':'zhōu','粥':'zhōu','轴':'zhóu','肘':'zhǒu','帚':'zhǒu','皱':'zhòu','昼':'zhòu','骤':'zhòu','朱':'zhū','株':'zhū','珠':'zhū','猪':'zhū','诸':'zhū','竹':'zhú','烛':'zhú','逐':'zhú','主':'zhǔ','煮':'zhǔ','嘱':'zhǔ','住':'zhù','助':'zhù','注':'zhù','驻':'zhù','柱':'zhù','祝':'zhù','著':'zhù','筑':'zhù','抓':'zhuā','爪':'zhuǎ','专':'zhuān','砖':'zhuān','转':'zhuǎn','赚':'zhuàn','庄':'zhuāng','桩':'zhuāng','装':'zhuāng','壮':'zhuàng','状':'zhuàng','追':'zhuī','准':'zhǔn','桌':'zhuō','捉':'zhuō','卓':'zhuó','啄':'zhuó','浊':'zhuó','资':'zī','姿':'zī','滋':'zī','子':'zǐ','紫':'zǐ','字':'zì','自':'zì','宗':'zōng','棕':'zōng','踪':'zōng','总':'zǒng','纵':'zòng','走':'zǒu','奏':'zòu','租':'zū','足':'zú','族':'zú','祖':'zǔ','阻':'zǔ','组':'zǔ','嘴':'zuǐ','最':'zuì','罪':'zuì','醉':'zuì','尊':'zūn','遵':'zūn','昨':'zuó','左':'zuǒ','佐':'zuǒ','作':'zuò','坐':'zuò','座':'zuò','做':'zuò'
    };

    // 多音字处理
    const polyphones = {
        '长': { 'cháng': '长度、长短', 'zhǎng': '长大、校长' },
        '行': { 'xíng': '行走、行动', 'háng': '银行、行业' },
        '重': { 'zhòng': '重要、重量', 'chóng': '重复、重新' },
        '好': { 'hǎo': '好坏、好人', 'hào': '爱好、好奇' },
        '乐': { 'lè': '快乐、乐趣', 'yuè': '音乐、乐器' },
        '还': { 'hái': '还有、还是', 'huán': '归还、还钱' },
        '干': { 'gān': '干净、干燥', 'gàn': '干活、树干' },
        '得': { 'dé': '得到、获得', 'de': '跑得快', 'děi': '得去、得做' },
        '地': { 'dì': '地方、地球', 'de': '慢慢地' },
        '着': { 'zhe': '看着、听着', 'zháo': '着火、睡着', 'zhuó': '着陆、着想', 'zhāo': '着数' },
        '和': { 'hé': '和平、和谐', 'hè': '附和、唱和', 'huó': '和面', 'huò': '和药', 'hú': '和牌' },
        '把': { 'bǎ': '把手、把握', 'bà': '刀把、话把' },
        '都': { 'dōu': '都是、都好', 'dū': '首都、都市' },
        '只': { 'zhī': '一只鸟', 'zhǐ': '只是、只有' },
        '种': { 'zhǒng': '种子、种类', 'zhòng': '种地、种植' },
        '发': { 'fā': '发现、出发', 'fà': '头发、理发' },
        '分': { 'fēn': '分开、分钟', 'fèn': '分量、本分' },
        '便': { 'biàn': '方便、便利', 'pián': '便宜' },
        '降': { 'jiàng': '降落、下降', 'xiáng': '投降' },
        '参': { 'cān': '参加、参与', 'shēn': '人参', 'cēn': '参差' },
        '差': { 'chā': '差别、差距', 'chà': '差不多', 'chāi': '出差', 'cī': '参差' },
        '传': { 'chuán': '传说、传播', 'zhuàn': '传记、自传' },
        '间': { 'jiān': '中间、房间', 'jiàn': '间隔、离间' },
        '难': { 'nán': '困难、难过', 'nàn': '灾难、遇难' },
        '强': { 'qiáng': '强大、坚强', 'qiǎng': '勉强', 'jiàng': '倔强' },
        '少': { 'shǎo': '多少、少数', 'shào': '少年、少女' },
        '盛': { 'shèng': '盛开、盛大', 'chéng': '盛饭' },
        '数': { 'shù': '数学、数字', 'shǔ': '数数', 'shuò': '数见不鲜' },
        '为': { 'wéi': '作为、成为', 'wèi': '为了、因为' },
        '应': { 'yīng': '应该、应当', 'yìng': '答应、应用' },
        '中': { 'zhōng': '中间、中国', 'zhòng': '中奖、命中' },
        '转': { 'zhuǎn': '转弯、转变', 'zhuàn': '转动、转圈' }
    };

    // 处理每个字
    const chars = word.split('');
    let result = '';
    let isPolyphone = false;

    for (const ch of chars) {
        if (polyphones[ch]) {
            isPolyphone = true;
            const readings = Object.entries(polyphones[ch]).map(([py, meaning]) => `• ${py}：${meaning}`).join('\n');
            result += `「${ch}」是多音字：\n${readings}\n\n`;
        } else if (pinyinDB[ch]) {
            result += `「${ch}」：${pinyinDB[ch]}\n`;
        } else {
            result += `「${ch}」：暂无拼音数据，建议查询字典\n`;
        }
    }

    if (isPolyphone) {
        return `📖 **拼音查询**\n\n${result}💡 提示：多音字需要根据上下文确定正确读音。`;
    }

    // 如果用户指定了声调，验证
    if (specifiedTone && chars.length === 1) {
        const py = pinyinDB[chars[0]] || '';
        const actualTone = py.replace(/[^\d]/g, '');
        if (actualTone === specifiedTone) {
            return `✅ **正确！**\n\n「${chars[0]}」的拼音是 **${py}**，确实是第 ${specifiedTone} 声。`;
        } else {
            return `❌ **不正确**\n\n「${chars[0]}」的正确拼音是 **${py}**（第 ${actualTone} 声），不是第 ${specifiedTone} 声。`;
        }
    }

    return `📖 **拼音查询**\n\n${result}`;
}

// 处理定义/解释请求
function handleDefine(cleanQ) {
    const m = cleanQ.match(/(.+?)\s*(?:是什么意思|什么意思|的解释|是什么)/);
    if (!m) return null;
    const term = m[1].trim();
    if (/^[a-zA-Z\s]+$/.test(term)) {
        const trans = typeof getChineseTranslation === 'function' ? getChineseTranslation(term) : null;
        if (trans && !trans.includes('暂无精确翻译')) return `**${term}**\n\n释义：${trans}`;
    }
    // 扩展知识库
    const concepts = {
        '光合作用': '光合作用是绿色植物利用光能，把二氧化碳和水转化为有机物并释放氧气的过程。',
        '牛顿第一定律': '牛顿第一定律（惯性定律）：物体在不受外力作用时，保持静止或匀速直线运动状态。',
        '氧化还原': '氧化还原反应：有电子转移的化学反应。氧化是失电子，还原是得电子。',
        '民主': '民主：人民当家作主的政治制度，核心是人民有权参与国家事务的管理和决策。',
        '守株待兔': '比喻不想努力，希望获得成功的侥幸心理。出自《韩非子·五蠹》。',
        '画蛇添足': '比喻做了多余的事，反而不恰当。出自《战国策·齐策》。',
        '亡羊补牢': '比喻出了问题以后想办法补救，可以防止继续受损失。出自《战国策·楚策》。',
        '刻舟求剑': '比喻办事刻板，不知道跟着情势的变化而改变。出自《吕氏春秋·察今》。',
        '掩耳盗铃': '比喻自己欺骗自己。出自《吕氏春秋·自知》。',
        '叶公好龙': '比喻表面上爱好某事物，实际上并不真正爱好。出自《新序·杂事》。',
        'E=mc²': '爱因斯坦质能方程：能量等于质量乘以光速的平方。揭示了质量与能量的等价关系。',
        '勾股定理': '直角三角形中，两直角边的平方和等于斜边的平方：a² + b² = c²。',
        '万有引力': '任何两个物体之间都存在引力，大小与质量乘积成正比，与距离平方成反比：F = GMm/r²。',
        'HTML': 'HTML（超文本标记语言）是构建网页的标准语言，使用标签定义页面结构和内容。',
        'CSS': 'CSS（层叠样式表）用于控制网页的外观和布局，包括颜色、字体、间距、定位等。',
        'JavaScript': 'JavaScript是一种动态脚本语言，用于实现网页交互功能，也可用于服务器端开发（Node.js）。',
        'Python': 'Python是一种高级编程语言，以简洁易读著称，广泛用于数据科学、AI、Web开发等领域。'
    };
    if (concepts[term]) return `**${term}**\n\n${concepts[term]}`;
    return `关于「${term}」，我可以帮你查找定义和解释。请确认拼写或提供更多上下文。`;
}

// 处理实现请求
function handleImplement(cleanQ) {
    const q = cleanQ.toLowerCase();
    // 检测实现目标
    const isWeb = /网站|网页|页面|web|html|css|前端|计算器|登录|注册|导航|轮播|表单|表格|菜单/.test(q);
    const isAlgo = /算法|排序|查找|搜索|遍历|递归|二分|冒泡|快排|深搜|广搜|dijkstra|dp|动态规划/.test(q);
    const isFeature = /功能|特性|模块|组件|接口|api/.test(q);
    const isApp = /app|应用|小程序|软件|工具|系统/.test(q);

    if (isWeb) {
        if (/计算器/.test(q)) {
            return `🛠️ **实现指南：网页计算器**

**步骤1：HTML结构**
\`\`\`html
<div class="calculator">
  <input type="text" id="display" readonly>
  <div class="buttons">
    <button onclick="append('7')">7</button>
    <button onclick="append('8')">8</button>
    <button onclick="append('9')">9</button>
    <button onclick="append('/')">/</button>
    <button onclick="append('4')">4</button>
    <button onclick="append('5')">5</button>
    <button onclick="append('6')">6</button>
    <button onclick="append('*')">*</button>
    <button onclick="append('1')">1</button>
    <button onclick="append('2')">2</button>
    <button onclick="append('3')">3</button>
    <button onclick="append('-')">-</button>
    <button onclick="append('0')">0</button>
    <button onclick="append('.')">.</button>
    <button onclick="calculate()">=</button>
    <button onclick="append('+')">+</button>
    <button onclick="clearDisplay()">C</button>
  </div>
</div>
\`\`\`

**步骤2：CSS样式**
\`\`\`css
.calculator { width: 240px; margin: 50px auto; border: 1px solid #ccc; padding: 10px; border-radius: 8px; }
#display { width: 100%; height: 40px; font-size: 18px; text-align: right; margin-bottom: 10px; }
.buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
button { padding: 15px; font-size: 16px; cursor: pointer; }
\`\`\`

**步骤3：JavaScript逻辑**
\`\`\`javascript
function append(val) { document.getElementById('display').value += val; }
function clearDisplay() { document.getElementById('display').value = ''; }
function calculate() { try { document.getElementById('display').value = eval(document.getElementById('display').value); } catch { document.getElementById('display').value = 'Error'; } }
\`\`\`

💡 提示：生产环境建议使用更安全的表达式解析器替代 eval。`;
        }
        if (/登录|用户登录/.test(q)) {
            return `🛠️ **实现指南：用户登录功能**

**步骤1：HTML表单**
\`\`\`html
<form id="loginForm">
  <input type="text" id="username" placeholder="用户名" required>
  <input type="password" id="password" placeholder="密码" required>
  <button type="submit">登录</button>
</form>
\`\`\`

**步骤2：前端验证**
\`\`\`javascript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (!username || password.length < 6) { alert('请输入有效信息'); return; }
  // 发送请求到后端
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.success) { localStorage.setItem('token', data.token); location.href = '/dashboard'; }
  else { alert(data.message); }
});
\`\`\`

**步骤3：后端示例（Node.js）**
\`\`\`javascript
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.findUser(username);
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.json({ success: false, message: '用户名或密码错误' });
  }
  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '7d' });
  res.json({ success: true, token });
});
\`\`\`

💡 安全提示：密码必须哈希存储（bcrypt），使用 HTTPS，防止 SQL 注入。`;
        }
        return `🛠️ **Web开发实现指南**

**通用结构：**
\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
  <script src="app.js"></script>
</body>
</html>
\`\`\`

**建议技术栈：**
• 基础：HTML5 + CSS3 + JavaScript (ES6+)
• 框架：Vue.js / React / Angular
• 样式：Tailwind CSS / Bootstrap
• 构建：Vite / Webpack

请告诉我你想实现的具体功能，我可以提供更详细的代码。`;
    }

    if (isAlgo) {
        if (/二分查找|二分/.test(q)) {
            return `🛠️ **算法实现：二分查找**

**核心思想：** 在有序数组中，每次将搜索范围减半。

**伪代码：**
\`\`\`
函数 二分查找(数组, 目标):
  左 = 0
  右 = 数组长度 - 1
  当 左 <= 右:
    中 = (左 + 右) // 2
    如果 数组[中] == 目标: 返回 中
    如果 数组[中] < 目标: 左 = 中 + 1
    否则: 右 = 中 - 1
  返回 -1
\`\`\`

**JavaScript实现：**
\`\`\`javascript
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
\`\`\`

**时间复杂度：** O(log n) | **空间复杂度：** O(1)

💡 前提条件：数组必须是有序的。`;
        }
        if (/冒泡|排序/.test(q)) {
            return `🛠️ **算法实现：冒泡排序**

**核心思想：** 相邻元素两两比较，大的往后冒泡。

**JavaScript实现：**
\`\`\`javascript
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // 已有序，提前退出
  }
  return arr;
}
\`\`\`

**时间复杂度：** 最坏 O(n²)，最好 O(n) | **空间复杂度：** O(1)

💡 优化：添加 swapped 标志，已有序时提前退出。`;
        }
        return `🛠️ **算法实现指南**

请告诉我你想实现的具体算法，例如：
• 排序算法：冒泡排序、快速排序、归并排序
• 查找算法：二分查找、线性查找
• 图算法：DFS、BFS、Dijkstra
• 动态规划：背包问题、最长子序列

我可以为你提供伪代码和具体实现。`;
    }

    if (isFeature) {
        return `🛠️ **功能实现指南**

**实现步骤：**
1. **需求分析** - 明确功能目标和边界条件
2. **接口设计** - 定义输入输出和数据结构
3. **核心逻辑** - 编写主要业务代码
4. **异常处理** - 处理错误和边界情况
5. **测试验证** - 编写单元测试

**示例：实现分页功能**
\`\`\`javascript
function paginate(items, page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  const paginatedItems = items.slice(start, start + pageSize);
  return {
    data: paginatedItems,
    page,
    pageSize,
    total: items.length,
    totalPages: Math.ceil(items.length / pageSize)
  };
}
\`\`\`

请描述你想实现的具体功能。`;
    }

    if (isApp) {
        return `🛠️ **应用开发实现指南**

**技术选型：**
• 移动端 App：React Native / Flutter / 原生开发
• 小程序：微信小程序 / 支付宝小程序
• Web 应用：Vue / React + Node.js
• 桌面应用：Electron / Tauri

**开发流程：**
1. 需求分析与原型设计
2. 技术选型与架构设计
3. UI/UX 设计
4. 前端/后端开发
5. 测试与部署

请告诉我你想开发什么类型的应用。`;
    }

    return `🛠️ **实现指南**

我可以帮你实现：
• 🌐 **网页开发**：HTML/CSS/JS 页面、组件
• 📱 **应用开发**：App、小程序、工具
• ⚙️ **算法实现**：排序、查找、图算法等
• 🔧 **功能模块**：登录、分页、搜索等

请告诉我你想实现的具体内容。`;
}

// 处理问题解决请求
function handleSolve(cleanQ) {
    const q = cleanQ.toLowerCase();
    const isMathWord = /应用题|问题|多少|多少钱|距离|速度|时间|利润|成本|售价|浓度|混合|比例|百分比|折扣|工程|行程|鸡兔|同笼|水池|注水|排水/.test(q);
    const isLogic = /逻辑|推理|谜题| puzzle |脑筋急转弯|真假|说谎|开关|颜色|帽子|囚徒|过河|天平|称重/.test(q);
    const isRealLife = /生活|工作|人际|沟通|冲突|矛盾|选择|决策|建议|方法|怎么办|怎么处理/.test(q);

    if (isMathWord) {
        if (/鸡兔同笼/.test(q)) {
            return `🔍 **问题解析：鸡兔同笼**

**问题模型：** 已知头数和脚数，求鸡和兔的数量。

**解题步骤：**
1. **设未知数**
   - 设鸡有 x 只，兔有 y 只

2. **列方程**
   - 头的方程：x + y = 总头数
   - 脚的方程：2x + 4y = 总脚数

3. **求解**
   - 由方程1得：x = 总头数 - y
   - 代入方程2：2(总头数 - y) + 4y = 总脚数
   - 化简：2×总头数 + 2y = 总脚数
   - y = (总脚数 - 2×总头数) / 2
   - x = 总头数 - y

**示例：** 头35，脚94
- 兔 = (94 - 2×35) / 2 = (94 - 70) / 2 = 12
- 鸡 = 35 - 12 = 23

**答案：鸡23只，兔12只**

💡 口诀：假设全是鸡，多出的脚除以2就是兔的数量。`;
        }
        if (/行程|速度|距离|时间/.test(q)) {
            return `🔍 **问题解析：行程问题**

**基本公式：**
- 距离 = 速度 × 时间
- 速度 = 距离 ÷ 时间
- 时间 = 距离 ÷ 速度

**常见类型：**
1. **相遇问题**
   - 相遇时间 = 总距离 ÷ (速度1 + 速度2)
   - 例：A、B两地相距300km，甲速60km/h，乙速40km/h，相向而行
   - 相遇时间 = 300 ÷ (60 + 40) = 3小时

2. **追及问题**
   - 追及时间 = 距离差 ÷ (速度差)
   - 例：甲在乙前方100m，甲速5m/s，乙速7m/s
   - 追及时间 = 100 ÷ (7 - 5) = 50秒

3. **流水行船**
   - 顺水速度 = 船速 + 水速
   - 逆水速度 = 船速 - 水速

**解题步骤：**
1. 画线段图，标出已知量
2. 确定运动类型（相遇/追及/背离）
3. 选择合适公式列方程
4. 求解并验证`;
        }
        if (/利润|成本|售价|折扣/.test(q)) {
            return `🔍 **问题解析：利润问题**

**核心公式：**
- 利润 = 售价 - 成本
- 利润率 = (利润 ÷ 成本) × 100%
- 售价 = 成本 × (1 + 利润率)
- 折扣价 = 原价 × 折扣率

**解题步骤：**
1. **识别已知量**：成本、售价、利润、利润率中的已知项
2. **确定关系**：使用上述公式建立等式
3. **设未知数**：通常设成本或售价为 x
4. **列方程求解**

**示例：** 某商品成本80元，按30%利润定价，再打8折出售
- 定价 = 80 × (1 + 30%) = 104元
- 售价 = 104 × 0.8 = 83.2元
- 实际利润 = 83.2 - 80 = 3.2元
- 实际利润率 = 3.2 ÷ 80 × 100% = 4%

💡 注意：打折是在定价基础上打折，不是在成本基础上。`;
        }
        return `🔍 **数学应用题解题指南**

**通用解题步骤：**
1. **读题理解** - 找出已知条件和所求问题
2. **画图表** - 用线段图、表格整理信息
3. **设未知数** - 用 x 表示未知量
4. **列方程** - 根据等量关系建立方程
5. **求解验证** - 解方程并检验答案合理性

**常见类型：**
• 行程问题（速度×时间=距离）
• 工程问题（效率×时间=工作量）
• 利润问题（售价-成本=利润）
• 浓度问题（溶质÷溶液=浓度）
• 比例问题（交叉相乘）

请告诉我具体的题目内容。`;
    }

    if (isLogic) {
        if (/开关|灯/.test(q)) {
            return `🔍 **逻辑推理：开关与灯**

**经典问题：** 房间外有3个开关，房间内对应3盏灯，只能进房间一次，如何确定哪个开关控制哪盏灯？

**解题思路：**
1. **利用灯的热效应**
   - 打开开关1，等待10分钟
   - 关闭开关1，打开开关2
   - 进入房间

2. **观察判断**
   - 亮着的灯 → 开关2控制
   - 灭的但热的灯 → 开关1控制
   - 灭的且凉的灯 → 开关3控制

**推理要点：**
- 灯除了亮/灭状态，还有温度状态
- 将二元信息（亮/灭）扩展为三元信息（亮/热灭/凉灭）
- 每个开关对应一种唯一状态组合`;
        }
        if (/过河|桥|狼|羊|菜/.test(q)) {
            return `🔍 **逻辑推理：过河问题**

**经典问题：** 农夫带狼、羊、菜过河，船只能载农夫和一样物品，狼吃羊、羊吃菜，如何安全过河？

**解题步骤：**
1. **分析约束条件**
   - 狼和羊不能单独在一起
   - 羊和菜不能单独在一起
   - 农夫必须在场才能安全

2. **逐步推理**
   - 第1步：带羊过河（留下狼和菜，安全）
   - 第2步：空手返回
   - 第3步：带狼过河
   - 第4步：带羊返回（否则狼会吃羊）
   - 第5步：带菜过河（留下羊，安全）
   - 第6步：空手返回
   - 第7步：带羊过河

**答案：** 羊 → 回 → 狼 → 带羊回 → 菜 → 回 → 羊

💡 关键：羊是"中间项"，需要来回带。`;
        }
        return `🔍 **逻辑推理解题指南**

**常用方法：**
1. **排除法** - 逐一排除不可能的选项
2. **假设法** - 假设某个条件成立，推导验证
3. **列表法** - 用表格整理条件和结论
4. **图解法** - 画流程图或关系图

**解题步骤：**
1. 仔细阅读，提取所有条件
2. 找出关键信息和隐含条件
3. 选择合适的方法进行推理
4. 验证结论是否符合所有条件

请告诉我具体的逻辑题目。`;
    }

    if (isRealLife) {
        return `🔍 **问题解决指南**

**结构化解决方法：**
1. **明确问题** - 用一句话描述核心问题
2. **分析原因** - 使用5Why法追问根本原因
3. **头脑风暴** - 列出所有可能的解决方案
4. **评估方案** - 从可行性、成本、效果等维度评估
5. **执行计划** - 制定具体行动步骤和时间表
6. **复盘总结** - 评估结果，总结经验

**示例：与同事发生工作冲突**
- 问题：意见分歧导致项目进度受阻
- 原因：沟通方式、目标理解不一致
- 方案：单独沟通、寻求上级协调、数据支撑观点
- 评估：单独沟通成本低、效果好
- 执行：约时间、准备材料、平和表达、倾听对方
- 复盘：建立定期沟通机制

请描述你遇到的具体问题。`;
    }

    return `🔍 **问题解决助手**

我可以帮你解决：
• 🧮 **数学应用题**：行程、工程、利润、浓度等
• 🧩 **逻辑推理题**：开关灯、过河、真假话等
• 💡 **实际问题**：工作、生活、人际中的难题

请描述你想解决的具体问题。`;
}

// 处理代码生成请求
function handleCode(cleanQ) {
    const q = cleanQ.toLowerCase();
    // 检测编程语言
    const isPython = /python|py\b/.test(q);
    const isJS = /javascript|js|node|前端|网页/.test(q);
    const isHTML = /html|网页|页面/.test(q);
    const isCSS = /css|样式|布局|美化/.test(q);

    if (isHTML || /html/.test(q)) {
        return `💻 **HTML代码生成**

\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>示例页面</title>
  <style>
    /* 基础样式 */
    body {
      font-family: 'Microsoft YaHei', sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    h1 { color: #333; text-align: center; }
    .card {
      background: #f8f9fa;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>欢迎</h1>
    <div class="card">
      <h3>卡片标题</h3>
      <p>这是一段示例文本。</p>
    </div>
  </div>
  <script>
    // 页面加载完成后执行
    document.addEventListener('DOMContentLoaded', () => {
      console.log('页面加载完成！');
    });
  </script>
</body>
</html>
\`\`\`

💡 说明：这是一个响应式HTML页面模板，包含基础结构和样式。`;
    }

    if (isCSS) {
        return `💻 **CSS代码生成**

\`\`\`css
/* 现代CSS布局 - Flexbox + Grid */

/* 1. 重置样式 */
* { margin: 0; padding: 0; box-sizing: border-box; }

/* 2. 响应式容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 3. Flexbox导航 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #333;
  color: white;
}
.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

/* 4. Grid卡片布局 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}
.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}
.card:hover { transform: translateY(-5px); }

/* 5. 响应式设计 */
@media (max-width: 768px) {
  .navbar { flex-direction: column; }
  .card-grid { grid-template-columns: 1fr; }
}
\`\`\`

💡 说明：包含Flexbox导航、Grid卡片布局和响应式设计。`;
    }

    if (isPython) {
        return `💻 **Python代码生成**

\`\`\`python
# 数据处理示例脚本

def read_data(filename):
    """读取数据文件"""
    with open(filename, 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip()]

def process_data(data):
    """处理数据"""
    results = []
    for item in data:
        # 数据清洗和转换
        cleaned = item.lower().strip()
        results.append(cleaned)
    return results

def save_results(results, filename):
    """保存结果"""
    with open(filename, 'w', encoding='utf-8') as f:
        for result in results:
            f.write(result + '\\n')
    print(f"结果已保存到 {filename}")

def main():
    """主函数"""
    try:
        data = read_data('input.txt')
        processed = process_data(data)
        save_results(processed, 'output.txt')
        print(f"成功处理 {len(processed)} 条数据")
    except FileNotFoundError:
        print("错误：找不到输入文件")
    except Exception as e:
        print(f"发生错误：{e}")

if __name__ == "__main__":
    main()
\`\`\`

💡 说明：这是一个Python数据处理模板，包含文件读写、异常处理和模块化设计。`;
    }

    if (isJS) {
        return `💻 **JavaScript代码生成**

\`\`\`javascript
// 现代JavaScript模块示例

/**
 * API请求工具类
 * 封装了常用的HTTP请求方法
 */
class ApiClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  async request(url, options = {}) {
    try {
      const response = await fetch(this.baseURL + url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('请求失败:', error);
      throw error;
    }
  }

  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? \`\${url}?\${queryString}\` : url;
    return this.request(fullUrl, { method: 'GET' });
  }

  async post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// 使用示例
const api = new ApiClient('https://api.example.com');

async function loadUserData() {
  try {
    const user = await api.get('/users/1');
    console.log('用户信息:', user);
    return user;
  } catch (error) {
    console.error('加载失败');
  }
}

// 事件处理
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('loadBtn');
  if (btn) {
    btn.addEventListener('click', loadUserData);
  }
});
\`\`\`

💡 说明：使用ES6+语法，包含async/await、类封装和错误处理。`;
    }

    return `💻 **代码生成助手**

我可以生成以下语言的代码：
• 🌐 **HTML** - 网页结构
• 🎨 **CSS** - 样式和布局
• ⚡ **JavaScript** - 前端交互和API请求
• 🐍 **Python** - 数据处理和脚本

请告诉我：
1. 你想用什么语言
2. 代码要实现什么功能

我会为你生成带注释的代码示例。`;
}

// 处理文件写入请求
function handleWriteFile(cleanQ) {
    const extMatch = cleanQ.match(/\.(html|css|js|py|txt|md|json|xml|csv)\b/i);
    const descMatch = cleanQ.match(/(?:写|创建|新建|生成)\s*(?:一个)?\s*(?:.*?)(?:文件|代码|程序)/);
    let ext = extMatch ? extMatch[1].toLowerCase() : 'txt';
    let desc = cleanQ.replace(/写一个|创建文件|新建文件|生成文件|写一个.*文件/g, '').trim();
    desc = desc.replace(/\.\w+$/, '').trim() || '示例文件';
    const templates = {
        html: `<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8">\n  <title>${desc}</title>\n  <style>\n    body { font-family: sans-serif; padding: 20px; }\n  </style>\n</head>\n<body>\n  <h1>${desc}</h1>\n  <p>这是一个自动生成的HTML文件。</p>\n</body>\n</html>`,
        css: `/* ${desc} - 自动生成的CSS */\nbody {\n  font-family: 'Microsoft YaHei', sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f5f5f5;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  background: #fff;\n  border-radius: 8px;\n  padding: 20px;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n}`,
        js: `// ${desc} - 自动生成的JavaScript\n\nfunction main() {\n  console.log('Hello, ${desc}!');\n}\n\nmain();`,
        py: `# ${desc} - 自动生成的Python\n\ndef main():\n    print("Hello, ${desc}!")\n\nif __name__ == "__main__":\n    main()`,
        txt: `${desc}\n\n这是一个自动生成的文本文件。\n创建时间：${new Date().toLocaleString('zh-CN')}`,
        md: `# ${desc}\n\n这是一个自动生成的Markdown文件。\n\n## 内容\n\n- 第一项\n- 第二项\n- 第三项\n\n> 创建时间：${new Date().toLocaleString('zh-CN')}`,
        json: `{\n  "name": "${desc}",\n  "version": "1.0.0",\n  "description": "自动生成的JSON文件",\n  "created": "${new Date().toISOString()}"\n}`,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <name>${desc}</name>\n  <description>自动生成的XML文件</description>\n</root>`,
        csv: `"名称","描述","创建时间"\n"${desc}","自动生成的CSV文件","${new Date().toLocaleString('zh-CN')}"`
    };
    const content = templates[ext] || templates.txt;
    const fileName = `${desc.replace(/[^\w\u4e00-\u9fa5]/g, '_')}.${ext}`;
    // 通过模拟保存（实际环境中需后端支持）
    return `📄 **文件生成**\n\n已为你生成 **${fileName}** 文件：\n\n\`\`\`${ext}\n${content}\n\`\`\`\n\n💡 提示：复制以上内容保存为 ${fileName} 文件即可使用。`;
}

// 英语题目生成（扩展题库）
function generateEnglishProblem(difficulty, qType) {
    const words = [
        { word: 'abandon', cn: '放弃，遗弃', options: ['A. 放弃', 'B. 接受', 'C. 继续', 'D. 开始'] },
        { word: 'brilliant', cn: '杰出的，灿烂的', options: ['A. 杰出的', 'B. 普通的', 'C. 暗淡的', 'D. 失败的'] },
        { word: 'challenge', cn: '挑战', options: ['A. 挑战', 'B. 放弃', 'C. 逃避', 'D. 接受'] },
        { word: 'determine', cn: '决定，确定', options: ['A. 决定', 'B. 犹豫', 'C. 放弃', 'D. 怀疑'] },
        { word: 'environment', cn: '环境', options: ['A. 环境', 'B. 建筑', 'C. 人物', 'D. 事件'] },
        { word: 'foundation', cn: '基础，地基', options: ['A. 基础', 'B. 顶部', 'C. 表面', 'D. 边缘'] },
        { word: 'generation', cn: '一代人，产生', options: ['A. 一代人', 'B. 个人', 'C. 群体', 'D. 家庭'] },
        { word: 'harmony', cn: '和谐', options: ['A. 和谐', 'B. 冲突', 'C. 混乱', 'D. 对立'] },
        { word: 'accomplish', cn: '完成，实现', options: ['A. 完成', 'B. 放弃', 'C. 推迟', 'D. 忽略'] },
        { word: 'beneficial', cn: '有益的', options: ['A. 有益的', 'B. 有害的', 'C. 普通的', 'D. 罕见的'] },
        { word: 'consequence', cn: '后果，结果', options: ['A. 结果', 'B. 原因', 'C. 过程', 'D. 方法'] },
        { word: 'demonstrate', cn: '演示，证明', options: ['A. 证明', 'B. 否认', 'C. 怀疑', 'D. 忽略'] },
        { word: 'elaborate', cn: '详细阐述', options: ['A. 阐述', 'B. 简化', 'C. 忽略', 'D. 反驳'] },
        { word: 'fascinating', cn: '迷人的', options: ['A. 迷人的', 'B. 无聊的', 'C. 恐怖的', 'D. 平凡的'] },
        { word: 'genuine', cn: '真正的，真诚的', options: ['A. 真正的', 'B. 假的', 'C. 模糊的', 'D. 夸张的'] },
        { word: 'hesitate', cn: '犹豫', options: ['A. 犹豫', 'B. 果断', 'C. 坚定', 'D. 激动'] },
        { word: 'inevitable', cn: '不可避免的', options: ['A. 不可避免的', 'B. 偶然的', 'C. 罕见的', 'D. 可选的'] },
        { word: 'magnificent', cn: '壮丽的', options: ['A. 壮丽的', 'B. 破旧的', 'C. 普通的', 'D. 黑暗的'] },
        { word: 'negotiate', cn: '谈判，协商', options: ['A. 协商', 'B. 命令', 'C. 拒绝', 'D. 逃避'] },
        { word: 'persevere', cn: '坚持不懈', options: ['A. 坚持', 'B. 放弃', 'C. 休息', 'D. 抱怨'] },
        { word: 'reluctant', cn: '不情愿的', options: ['A. 不情愿的', 'B. 热情的', 'C. 中立的', 'D. 兴奋的'] },
        { word: 'sufficient', cn: '足够的', options: ['A. 足够的', 'B. 缺乏的', 'C. 过多的', 'D. 适中的'] },
        { word: 'tremendous', cn: '巨大的', options: ['A. 巨大的', 'B. 微小的', 'C. 中等的', 'D. 适度的'] },
        { word: 'vulnerable', cn: '脆弱的', options: ['A. 脆弱的', 'B. 坚强的', 'C. 灵活的', 'D. 稳定的'] },
        { word: 'acknowledge', cn: '承认，确认', options: ['A. 承认', 'B. 否认', 'C. 忽略', 'D. 怀疑'] },
        { word: 'contemplate', cn: '沉思，深思', options: ['A. 沉思', 'B. 行动', 'C. 忽略', 'D. 嘲笑'] },
        { word: 'flourish', cn: '繁荣，兴旺', options: ['A. 繁荣', 'B. 衰败', 'C. 停滞', 'D. 消失'] },
        { word: 'gratitude', cn: '感激', options: ['A. 感激', 'B. 抱怨', 'C. 愤怒', 'D. 漠不关心'] },
        { word: 'implement', cn: '实施，执行', options: ['A. 实施', 'B. 取消', 'C. 计划', 'D. 讨论'] },
        { word: 'prosperity', cn: '繁荣', options: ['A. 繁荣', 'B. 萧条', 'C. 平静', 'D. 混乱'] },
        { word: 'sacrifice', cn: '牺牲，献祭', options: ['A. 牺牲', 'B. 获得', 'C. 保存', 'D. 浪费'] }
    ];
    // 语法题库
    const grammarQs = [
        { q: 'She ___ (go) to school every day.', answer: 'goes', hint: '主语第三人称单数，一般现在时', type: 'grammar' },
        { q: 'The book ___ (write) by Lu Xun in 1921.', answer: 'was written', hint: '被动语态，过去时', type: 'grammar' },
        { q: 'If I ___ (be) you, I would study harder.', answer: 'were', hint: '虚拟语气，与现在事实相反', type: 'grammar' },
        { q: 'He ___ (study) English for 3 years by next month.', answer: 'will have studied', hint: '将来完成时', type: 'grammar' },
        { q: 'The man ___ is standing there is my father.', answer: 'who', hint: '定语从句，先行词是人', type: 'grammar' }
    ];
    // 翻译题库
    const translationQs = [
        { q: '请翻译：知识就是力量。', answer: 'Knowledge is power.', hint: '弗兰西斯·培根名言', type: 'translation' },
        { q: '请翻译：活到老，学到老。', answer: 'Never too old to learn. / One is never too old to learn.', hint: '英语谚语', type: 'translation' },
        { q: 'Translate: Practice makes perfect.', answer: '熟能生巧', hint: '常用谚语', type: 'translation' },
        { q: 'Translate: Actions speak louder than words.', answer: '事实胜于雄辩', hint: '常用谚语', type: 'translation' }
    ];
    // 随机选择题目类型
    const rand = Math.random();
    if (rand < 0.3 && grammarQs.length > 0) {
        const g = grammarQs[Math.floor(Math.random() * grammarQs.length)];
        currentQuiz = { subject: 'english', question: g.q, answer: g.answer, type: 'grammar', hint: g.hint };
        return `📝 英语${difficulty}语法题\n\n${g.q}\n\n💡 提示：${g.hint}\n\n请输入你的答案：`;
    }
    if (rand < 0.45 && translationQs.length > 0) {
        const t = translationQs[Math.floor(Math.random() * translationQs.length)];
        currentQuiz = { subject: 'english', question: t.q, answer: t.answer, type: 'translation', hint: t.hint };
        return `📝 英语${difficulty}翻译题\n\n${t.q}\n\n💡 提示：${t.hint}\n\n请输入你的答案：`;
    }
    const w = words[Math.floor(Math.random() * words.length)];
    if (qType === '选择题') {
        currentQuiz = { subject: 'english', question: `"${w.word}" 的中文意思是？`, answer: w.options[0], type: 'choice', options: w.options, hint: w.cn };
        return `📝 英语${difficulty}选择题\n\nChoose the correct Chinese meaning of "${w.word}":\n${w.options.join('\n')}\n\n💡 提示：根据词根词缀或上下文推断词义。\n\n请输入选项字母（A/B/C/D）：`;
    }
    if (qType === '填空题') {
        const sentences = [`We should not ______ our dreams even when facing difficulties.`, `Her ______ idea impressed all the judges.`, `This is a great ______ that we must overcome.`, `We need to ______ the cause of the problem first.`];
        const s = sentences[Math.floor(Math.random() * sentences.length)];
        currentQuiz = { subject: 'english', question: `用 "${w.word}" 的适当形式填空：\n${s}`, answer: w.word, type: 'fill', hint: w.cn };
        return `📝 英语${difficulty}填空题\n\nWord: ${w.word} (${w.cn})\n\nSentence: ${s}\n\n💡 提示：注意词性和语法形式。\n\n请输入你的答案：`;
    }
    currentQuiz = { subject: 'english', question: `请解释 "${w.word}" 的意思并造一个句子。`, answer: w.cn, type: 'essay', hint: w.cn };
    return `📝 英语${difficulty}解答题\n\nWhat does "${w.word}" mean? Please make a sentence with it.\n\n💡 提示：${w.word} 的意思是「${w.cn}」。\n\n请输入你的答案（中文释义+英文例句）：`;
}

// 语文题目生成（扩展题库）
function generateChineseProblem(difficulty, qType) {
    const poems = [
        { title: '静夜思', author: '李白', dynasty: '唐', content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。' },
        { title: '春晓', author: '孟浩然', dynasty: '唐', content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。' },
        { title: '登鹳雀楼', author: '王之涣', dynasty: '唐', content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。' },
        { title: '望庐山瀑布', author: '李白', dynasty: '唐', content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。' },
        { title: '绝句', author: '杜甫', dynasty: '唐', content: '两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。' },
        { title: '悯农', author: '李绅', dynasty: '唐', content: '锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。' },
        { title: '江雪', author: '柳宗元', dynasty: '唐', content: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。' },
        { title: '游子吟', author: '孟郊', dynasty: '唐', content: '慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。谁言寸草心，报得三春晖。' },
        { title: '出塞', author: '王昌龄', dynasty: '唐', content: '秦时明月汉时关，万里长征人未还。但使龙城飞将在，不教胡马度阴山。' },
        { title: '示儿', author: '陆游', dynasty: '宋', content: '死去元知万事空，但悲不见九州同。王师北定中原日，家祭无忘告乃翁。' },
        { title: '题西林壁', author: '苏轼', dynasty: '宋', content: '横看成岭侧成峰，远近高低各不同。不识庐山真面目，只缘身在此山中。' },
        { title: '水调歌头', author: '苏轼', dynasty: '宋', content: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。' }
    ];
    // 成语题库
    const idioms = [
        { idiom: '守株待兔', meaning: '比喻不想努力，希望获得成功的侥幸心理', source: '《韩非子·五蠹》' },
        { idiom: '画蛇添足', meaning: '比喻做了多余的事，反而不恰当', source: '《战国策·齐策》' },
        { idiom: '亡羊补牢', meaning: '比喻出了问题以后想办法补救', source: '《战国策·楚策》' },
        { idiom: '刻舟求剑', meaning: '比喻办事刻板，不知变通', source: '《吕氏春秋·察今》' },
        { idiom: '掩耳盗铃', meaning: '比喻自己欺骗自己', source: '《吕氏春秋·自知》' },
        { idiom: '叶公好龙', meaning: '比喻表面爱好，实际并不真正爱好', source: '《新序·杂事》' },
        { idiom: '对牛弹琴', meaning: '比喻对不懂道理的人讲道理', source: '《牟子理惑论》' },
        { idiom: '狐假虎威', meaning: '比喻借别人的威势来欺压人', source: '《战国策·楚策》' },
        { idiom: '井底之蛙', meaning: '比喻见识短浅的人', source: '《庄子·秋水》' },
        { idiom: '杯弓蛇影', meaning: '比喻疑神疑鬼，自相惊扰', source: '《晋书·乐广传》' }
    ];
    // 作者朝代匹配
    const authorDynasty = [
        { author: '李白', dynasty: '唐', works: '《静夜思》《望庐山瀑布》' },
        { author: '杜甫', dynasty: '唐', works: '《春望》《茅屋为秋风所破歌》' },
        { author: '白居易', dynasty: '唐', works: '《赋得古原草送别》《琵琶行》' },
        { author: '苏轼', dynasty: '宋', works: '《水调歌头》《题西林壁》' },
        { author: '陆游', dynasty: '宋', works: '《示儿》《游山西村》' },
        { author: '辛弃疾', dynasty: '宋', works: '《青玉案·元夕》《破阵子》' },
        { author: '鲁迅', dynasty: '现代', works: '《狂人日记》《阿Q正传》' },
        { author: '王维', dynasty: '唐', works: '《鹿柴》《送元二使安西》' }
    ];
    // 名句填空
    const famousQuotes = [
        { quote: '学而不思则罔，____', answer: '思而不学则殆', source: '《论语》' },
        { quote: '____，后天下之乐而乐', answer: '先天下之忧而忧', source: '范仲淹《岳阳楼记》' },
        { quote: '路漫漫其修远兮，____', answer: '吾将上下而求索', source: '屈原《离骚》' },
        { quote: '____，一览众山小', answer: '会当凌绝顶', source: '杜甫《望岳》' },
        { quote: '不识庐山真面目，____', answer: '只缘身在此山中', source: '苏轼《题西林壁》' },
        { quote: '山重水复疑无路，____', answer: '柳暗花明又一村', source: '陆游《游山西村》' }
    ];
    // 随机选择题型
    const rand = Math.random();
    if (rand < 0.25 && idioms.length > 0) {
        const idiom = idioms[Math.floor(Math.random() * idioms.length)];
        currentQuiz = { subject: 'chinese', question: `成语「${idiom.idiom}」是什么意思？出自哪里？`, answer: `${idiom.meaning}，出自${idiom.source}`, type: 'essay', hint: idiom.meaning };
        return `📝 语文${difficulty}成语题\n\n请解释成语「${idiom.idiom}」的意思，并说出它的出处。\n\n💡 提示：这个成语与某个寓言故事有关。\n\n请输入你的答案：`;
    }
    if (rand < 0.4 && authorDynasty.length > 0) {
        const ad = authorDynasty[Math.floor(Math.random() * authorDynasty.length)];
        currentQuiz = { subject: 'chinese', question: `诗人「${ad.author}」是哪个朝代的？代表作有哪些？`, answer: `${ad.dynasty}代，代表作有${ad.works}`, type: 'essay', hint: ad.dynasty };
        return `📝 语文${difficulty}文学常识题\n\n诗人「${ad.author}」是哪个朝代的？请列举他的代表作品。\n\n💡 提示：这位诗人生活在古代中国。\n\n请输入你的答案：`;
    }
    if (rand < 0.55 && famousQuotes.length > 0) {
        const fq = famousQuotes[Math.floor(Math.random() * famousQuotes.length)];
        currentQuiz = { subject: 'chinese', question: `补全名句：${fq.quote}`, answer: fq.answer, type: 'fill', hint: fq.source };
        return `📝 语文${difficulty}名句填空题\n\n补全下列名句：\n\n${fq.quote}\n\n💡 提示：出自${fq.source}。\n\n请输入你的答案：`;
    }
    const p = poems[Math.floor(Math.random() * poems.length)];
    if (qType === '选择题') {
        const wrongAuthors = ['杜甫', '白居易', '王维', '孟浩然', '苏轼', '陆游'].filter(a => a !== p.author);
        const shuffled = wrongAuthors.sort(() => Math.random() - 0.5).slice(0, 3);
        const allOpts = [...shuffled.sort(() => Math.random() - 0.5), p.author].sort(() => Math.random() - 0.5);
        const correctIdx = allOpts.indexOf(p.author);
        const labels = allOpts.map((a, i) => `${String.fromCharCode(65 + i)}. ${a}`);
        currentQuiz = { subject: 'chinese', question: `「${p.title}」的作者是？`, answer: labels[correctIdx], type: 'choice', options: labels, hint: `${p.dynasty}代诗人` };
        return `📝 语文${difficulty}选择题\n\n「${p.title}」的作者是？\n${labels.join('\n')}\n\n💡 提示：${p.dynasty}代诗人。\n\n请输入选项字母（A/B/C/D）：`;
    }
    if (qType === '填空题') {
        const lines = p.content.split(/[，。]/);
        const blankLine = lines[Math.floor(Math.random() * Math.min(3, lines.length))];
        currentQuiz = { subject: 'chinese', question: `补全「${p.title}」中的诗句：\n${blankLine}____`, answer: p.content, type: 'fill', hint: `${p.dynasty}代${p.author}` };
        return `📝 语文${difficulty}填空题\n\n补全「${p.title}」中的诗句：\n\n${blankLine}____\n\n💡 提示：作者是${p.dynasty}代的${p.author}。\n\n请输入你的答案：`;
    }
    currentQuiz = { subject: 'chinese', question: `请默写「${p.title}」全文。`, answer: p.content, type: 'essay', hint: `${p.dynasty}代${p.author}` };
    return `📝 语文${difficulty}解答题\n\n请默写「${p.title}」并简要赏析。\n\n💡 提示：作者是${p.dynasty}代的${p.author}。\n\n请输入你的答案：`;
}

// ========== 新增AI能力：总结、对比、举例、思维导图、复习、公式 ==========

// 知识库数据（各科目核心知识点）
var subjectKnowledgeDB = {
    math: {
        name: '数学',
        topics: [
            { title: '代数基础', points: ['整式运算：加减乘除、因式分解', '一元一次方程：ax+b=0，解法步骤', '一元二次方程：ax²+bx+c=0，求根公式', '不等式：性质、解集、数轴表示', '函数基础：定义域、值域、图像'] },
            { title: '几何', points: ['三角形：分类、面积公式、勾股定理', '四边形：平行四边形、矩形、菱形、正方形', '圆：周长、面积、弧长、扇形面积', '相似与全等：判定条件与性质'] },
            { title: '函数', points: ['一次函数：y=kx+b，图像与性质', '二次函数：y=ax²+bx+c，顶点式、对称轴', '反比例函数：y=k/x，图像特征', '指数函数与对数函数'] },
            { title: '统计与概率', points: ['平均数、中位数、众数', '方差与标准差', '古典概型、条件概率', '排列组合基础'] }
        ],
        formulas: [
            { name: '一元二次方程求根公式', formula: 'x = (-b ± √(b²-4ac)) / 2a' },
            { name: '勾股定理', formula: 'a² + b² = c²' },
            { name: '三角形面积', formula: 'S = ½ah' },
            { name: '圆的面积', formula: 'S = πr²' },
            { name: '圆的周长', formula: 'C = 2πr' },
            { name: '弧长公式', formula: 'l = nπr / 180' },
            { name: '扇形面积', formula: 'S = nπr² / 360 = ½lr' },
            { name: '完全平方公式', formula: '(a±b)² = a² ± 2ab + b²' },
            { name: '平方差公式', formula: '(a+b)(a-b) = a² - b²' },
            { name: '二次函数顶点式', formula: 'y = a(x-h)² + k' },
            { name: '韦达定理', formula: 'x₁+x₂ = -b/a, x₁x₂ = c/a' },
            { name: '等差数列求和', formula: 'Sₙ = n(a₁+aₙ)/2 = na₁ + n(n-1)d/2' }
        ]
    },
    english: {
        name: '英语',
        topics: [
            { title: '时态体系', points: ['一般现在时：主语+动词原形/三单', '一般过去时：主语+动词过去式', '一般将来时：will/shall + 动词原形', '现在进行时：be + doing', '现在完成时：have/has + 过去分词'] },
            { title: '语法核心', points: ['被动语态：be + 过去分词', '定语从句：who/which/that引导', '名词性从句：主语/宾语/表语从句', '状语从句：时间/条件/原因/结果', '虚拟语气：与事实相反的假设'] },
            { title: '词汇拓展', points: ['词根词缀法：前缀改变词义，后缀改变词性', '同义词与反义词辨析', '固定搭配与短语动词', '高频词汇分类记忆'] },
            { title: '写作技巧', points: ['议论文：论点-论据-结论结构', '记叙文：时间顺序与细节描写', '书信格式与常用句型', '连接词的使用：however/therefore/moreover'] }
        ],
        formulas: [
            { name: '现在完成时结构', formula: 'have/has + 过去分词' },
            { name: '被动语态结构', formula: 'be + 过去分词 (+ by + 施动者)' },
            { name: '定语从句引导词', formula: '人用who/that，物用which/that' },
            { name: '虚拟语气（与现在事实相反）', formula: 'If I were..., I would...' },
            { name: '主谓一致规则', formula: '不可数名词/三单主语 + 动词s/es' }
        ]
    },
    chinese: {
        name: '语文',
        topics: [
            { title: '古诗文', points: ['唐诗宋词元曲：代表作家与作品', '文言文实词：通假字、古今异义、一词多义', '文言文虚词：之、其、而、以、于', '文言文句式：判断句、被动句、倒装句', '名篇默写与赏析'] },
            { title: '现代文阅读', points: ['记叙文：人物、事件、环境描写', '说明文：说明方法（举例子/列数字/作比较）', '议论文：论点、论据、论证方法', '散文：形散神聚、借景抒情'] },
            { title: '作文写作', points: ['审题立意：抓住关键词，明确中心', '结构安排：开头-主体-结尾', '修辞手法：比喻、拟人、排比、夸张', '素材积累：名人名言、时事热点'] },
            { title: '成语与常识', points: ['常见成语释义与出处', '常见近义词辨析', '文学常识：作家作品对应', '文化常识：传统节日、礼仪'] }
        ],
        formulas: [
            { name: '比喻句结构', formula: '本体 + 喻词（像/如/仿佛）+ 喻体' },
            { name: '议论文三要素', formula: '论点 + 论据 + 论证' },
            { name: '记叙文六要素', formula: '时间 + 地点 + 人物 + 起因 + 经过 + 结果' },
            { name: '说明文顺序', formula: '时间顺序 / 空间顺序 / 逻辑顺序' }
        ]
    },
    physics: {
        name: '物理',
        topics: [
            { title: '力学', points: ['牛顿三定律：惯性定律、F=ma、作用力与反作用力', '力的合成与分解：平行四边形定则', '万有引力：F=GMm/r²', '功与能：W=Fs，动能定理', '动量守恒：m₁v₁+m₂v₂=m₁v₁\'+m₂v₂\''] },
            { title: '电学', points: ['欧姆定律：I=U/R', '电功率：P=UI=I²R=U²/R', '串并联电路特点', '电场与电场强度', '电磁感应：法拉第定律'] },
            { title: '热学', points: ['温度与内能', '热传递：Q=cmΔt', '理想气体状态方程：pV=nRT', '热力学第一定律'] },
            { title: '光学与波', points: ['光的反射与折射定律', '凸透镜成像规律', '波的干涉与衍射', '光电效应'] }
        ],
        formulas: [
            { name: '牛顿第二定律', formula: 'F = ma' },
            { name: '万有引力定律', formula: 'F = GMm/r²' },
            { name: '动能定理', formula: 'W = ½mv² - ½mv₀²' },
            { name: '欧姆定律', formula: 'I = U/R' },
            { name: '电功率', formula: 'P = UI = I²R = U²/R' },
            { name: '焦耳定律', formula: 'Q = I²Rt' },
            { name: '光电效应方程', formula: 'Ek = hν - W₀' },
            { name: '波速公式', formula: 'v = fλ' },
            { name: '动量定理', formula: 'Ft = mv\' - mv₀' },
            { name: '理想气体状态方程', formula: 'pV = nRT' }
        ]
    },
    chemistry: {
        name: '化学',
        topics: [
            { title: '基本概念', points: ['物质的量：摩尔、摩尔质量', '化学方程式配平', '氧化还原反应：升失氧、降得还', '离子反应与离子方程式'] },
            { title: '元素化合物', points: ['碱金属：Na及其化合物', '卤族元素：Cl及其化合物', '氧族元素：S及其化合物', '氮族元素：N及其化合物', '碳族元素：C、Si及其化合物'] },
            { title: '有机化学', points: ['烷烃：CₙH₂ₙ₊₂，甲烷', '烯烃：双键加成反应', '醇、醛、酸、酯的转化', '高分子化合物'] },
            { title: '化学实验', points: ['常见仪器使用', '气体制备与收集', '物质的检验与鉴别', '溶液配制'] }
        ],
        formulas: [
            { name: '物质的量', formula: 'n = m/M = N/Nₐ = V/Vm' },
            { name: '摩尔质量', formula: 'M = m/n' },
            { name: '气体摩尔体积（标况）', formula: 'Vm = 22.4 L/mol' },
            { name: '物质的量浓度', formula: 'c = n/V' },
            { name: '稀释定律', formula: 'c₁V₁ = c₂V₂' },
            { name: '阿伏伽德罗常数', formula: 'Nₐ ≈ 6.022×10²³ mol⁻¹' }
        ]
    },
    biology: {
        name: '生物',
        topics: [
            { title: '细胞生物学', points: ['细胞结构：细胞膜、细胞质、细胞核', '细胞器：线粒体、叶绿体、内质网、高尔基体', '细胞分裂：有丝分裂、减数分裂', '细胞代谢：光合作用、呼吸作用'] },
            { title: '遗传与变异', points: ['DNA结构与复制', '基因表达：转录与翻译', '孟德尔遗传定律：分离定律、自由组合定律', '伴性遗传', '基因突变与染色体变异'] },
            { title: '生态学', points: ['种群特征：种群密度、出生率、死亡率', '群落演替：初生演替、次生演替', '生态系统：食物链、食物网、能量流动', '生物多样性保护'] },
            { title: '人体生理', points: ['消化系统与营养吸收', '血液循环：体循环、肺循环', '神经调节：反射弧、条件反射', '免疫：特异性免疫、非特异性免疫'] }
        ],
        formulas: [
            { name: '光合作用总反应', formula: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂' },
            { name: '有氧呼吸总反应', formula: 'C₆H₁₂O₆ + 6O₂ + 6H₂O → 6CO₂ + 12H₂O + 能量' },
            { name: '无氧呼吸（酒精发酵）', formula: 'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ + 少量能量' }
        ]
    },
    history: {
        name: '历史',
        topics: [
            { title: '中国古代史', points: ['夏商周：分封制、宗法制', '秦汉：大一统、郡县制、丝绸之路', '隋唐：科举制、三省六部制、开元盛世', '宋元：经济重心南移、行省制', '明清：君主专制强化、闭关锁国'] },
            { title: '中国近代史', points: ['鸦片战争与不平等条约', '洋务运动、戊戌变法、辛亥革命', '五四运动与新民主主义革命', '抗日战争与解放战争'] },
            { title: '世界史', points: ['工业革命与资本主义发展', '两次世界大战', '冷战与多极化趋势', '全球化与信息化时代'] },
            { title: '历史方法', points: ['史料分类：一手史料、二手史料', '历史分析：背景-过程-影响', '历史唯物主义基本观点'] }
        ],
        formulas: [
            { name: '朝代顺序口诀', formula: '夏商周秦西东汉，三国两晋南北朝，隋唐五代又十国，辽宋夏金元明清' },
            { name: '历史分析三要素', formula: '背景（原因）+ 过程（事件）+ 影响（意义）' }
        ]
    }
};

// 获取当前科目ID
function _getCurrentSubjectId() {
    var subjectId = state.currentSubject || '';
    if (!subjectId && lastSubject) {
        var nameToId = { '数学': 'math', '英语': 'english', '语文': 'chinese', '物理': 'physics', '化学': 'chemistry', '生物': 'biology', '历史': 'history', '政治': 'politics' };
        subjectId = nameToId[lastSubject] || '';
    }
    if (!subjectId) {
        // 从上下文推断
        var recentQ = aiConversationContext.filter(function(c) { return c.role === 'user'; });
        if (recentQ.length > 0) {
            var lastQ = recentQ[recentQ.length - 1].text;
            subjectId = _detectSubjectInline(lastQ) || '';
        }
    }
    return subjectId;
}

// 处理"总结"命令
function handleSummarize(cleanQ) {
    var subjectId = _getCurrentSubjectId();
    var db = subjectKnowledgeDB[subjectId];
    if (!db) {
        return '📋 **知识点总结**\n\n请先选择一个科目，或者告诉我你想总结哪个科目的知识点。\n\n支持的科目：数学、英语、语文、物理、化学、生物、历史';
    }
    var result = '📋 **' + db.name + '核心知识点总结**\n\n';
    db.topics.forEach(function(topic, idx) {
        result += '**' + (idx + 1) + '. ' + topic.title + '**\n';
        topic.points.forEach(function(p) {
            result += '  • ' + p + '\n';
        });
        result += '\n';
    });
    result += '💡 以上是' + db.name + '的核心知识框架。你可以发送"思维导图"查看更直观的知识结构，或发送"出题"进行针对性练习。';
    return result;
}

// 处理"对比"命令
function handleCompare(cleanQ) {
    // 尝试从问题中提取对比的两个事物
    var compareMatch = cleanQ.match(/(.+?)(?:和|与|vs|VS|对比|比较|区别于)(.+)/);
    if (compareMatch) {
        var itemA = compareMatch[1].replace(/^(对比|比较|区别|请|帮我|把)/g, '').trim();
        var itemB = compareMatch[2].replace(/^(对比|比较|区别|的|呢|吗|\?|？)/g, '').trim();
        if (itemA && itemB) {
            var tableHtml = renderTable(
                ['对比维度', itemA, itemB],
                [
                    ['定义', '请参考教材定义', '请参考教材定义'],
                    ['核心特点', '待补充', '待补充'],
                    ['适用条件', '待补充', '待补充'],
                    ['典型例子', '待补充', '待补充'],
                    ['易混点', '注意区分', '注意区分']
                ]
            );
            return '📊 **对比分析：' + itemA + ' vs ' + itemB + '**\n\n' + tableHtml + '\n\n💡 以上是「' + itemA + '」和「' + itemB + '」的对比框架。你可以告诉我更多细节，我会帮你填充具体内容。\n\n例如："对比一次函数和二次函数的区别"';
        }
    }
    // 如果没有检测到具体对比对象，根据当前科目提供常见对比
    var subjectId = _getCurrentSubjectId();
    var comparePairs = {
        math: { a: '一次函数 (y=kx+b)', b: '二次函数 (y=ax²+bx+c)', rows: [
            ['图像形状', '直线', '抛物线'],
            ['与x轴交点', '最多1个', '最多2个'],
            ['单调性', 'k>0递增，k<0递减', '对称轴两侧单调性相反'],
            ['关键参数', 'k(斜率)、b(截距)', 'a(开口方向)、顶点坐标']
        ]},
        english: { a: '一般过去时', b: '现在完成时', rows: [
            ['结构', '主语 + 动词过去式', 'have/has + 过去分词'],
            ['时间标志', 'yesterday, last week, in 2020', 'since, for, already, yet, just'],
            ['强调重点', '过去发生的动作', '过去对现在的影响'],
            ['例句', 'I went to Beijing last year.', 'I have been to Beijing twice.']
        ]},
        physics: { a: '串联电路', b: '并联电路', rows: [
            ['电流', '处处相等 I=I₁=I₂', '干路等于支路之和 I=I₁+I₂'],
            ['电压', '总电压等于各部分之和', '各支路两端电压相等'],
            ['电阻', 'R=R₁+R₂', '1/R=1/R₁+1/R₂'],
            ['特点', '一个断路全部不工作', '各支路互不影响']
        ]}
    };
    var pair = comparePairs[subjectId];
    if (pair) {
        var headers = ['对比维度', pair.a, pair.b];
        return '📊 **对比分析：' + pair.a + ' vs ' + pair.b + '**\n\n' + renderTable(headers, pair.rows) + '\n\n💡 你也可以告诉我你想对比的具体内容，例如："对比DNA和RNA的区别"';
    }
    return '📊 **对比分析**\n\n请告诉我你想对比的两个事物，使用格式：\n• "对比 A 和 B"\n• "比较 A 与 B"\n• "A vs B"\n\n例如：\n• "对比一次函数和二次函数"\n• "比较串联电路和并联电路"\n• "DNA和RNA的区别"';
}

// 处理"举例"命令
function handleExample(cleanQ) {
    var subjectId = _getCurrentSubjectId();
    var examples = {
        math: '📌 **数学举例：一元二次方程求解**\n\n**题目**：解方程 x² - 5x + 6 = 0\n\n**解题步骤**：\n1. **识别系数**：a=1, b=-5, c=6\n2. **计算判别式**：Δ = b²-4ac = (-5)²-4×1×6 = 25-24 = 1\n3. **代入求根公式**：x = (-b ± √Δ) / 2a = (5 ± 1) / 2\n4. **得出结果**：x₁ = (5+1)/2 = 3，x₂ = (5-1)/2 = 2\n\n**验证**：将x=3代入：3²-5×3+6 = 9-15+6 = 0 ✓\n\n💡 **解题要点**：判别式Δ>0有两个不等实根，Δ=0有两个相等实根，Δ<0无实根。',
        english: '📌 **英语举例：定语从句**\n\n**例句**：The book **which/that** I bought yesterday is very interesting.\n\n**分析**：\n1. **先行词**：The book（物）\n2. **关系代词**：which/that（指物，在从句中作宾语）\n3. **定语从句**：I bought yesterday\n4. **翻译**：我昨天买的那本书很有趣。\n\n**更多例句**：\n• The man **who** is standing there is my teacher.（who指人，作主语）\n• This is the place **where** we first met.（where指地点）\n\n💡 **要点**：先行词是人用who/that，是物用which/that，是地点用where。',
        chinese: '📌 **语文举例：文言文虚词"之"**\n\n**"之"的常见用法**：\n\n1. **作代词**（他/她/它）：\n   • "学而时习**之**"（代指学过的知识）\n   • "公与之乘"（代指曹刿）\n\n2. **作结构助词"的"**：\n   • "水陆草木**之**花"（水上陆地上草本木本的花）\n\n3. **作动词"去/往"**：\n   • "吾欲**之**南海"（我想去南海）\n\n4. **用在主谓之间，取消句子独立性**：\n   • "予独爱莲**之**出淤泥而不染"（不译）\n\n💡 **记忆口诀**：之字用法有四种，代人代物作代词，译为"的"字作助词，动词意思是"去往"，主谓之间不翻译。',
        physics: '📌 **物理举例：牛顿第二定律应用**\n\n**题目**：质量为2kg的物体在光滑水平面上受到10N的水平力作用，求加速度。\n\n**解题步骤**：\n1. **已知条件**：m=2kg, F=10N, 摩擦力f=0（光滑）\n2. **受力分析**：合力 F合 = F - f = 10 - 0 = 10N\n3. **代入公式**：F = ma → a = F/m = 10/2 = 5 m/s²\n4. **结果**：加速度 a = 5 m/s²\n\n💡 **注意**：一定要先做受力分析，求合力，再代入公式。',
        chemistry: '📌 **化学举例：氧化还原反应判断**\n\n**反应**：2H₂ + O₂ → 2H₂O（点燃）\n\n**分析步骤**：\n1. **标化合价**：H₂(0) + O₂(0) → H₂O中H(+1), O(-2)\n2. **找变化**：\n   • H: 0 → +1，化合价升高，失电子 → 被氧化\n   • O: 0 → -2，化合价降低，得电子 → 被还原\n3. **结论**：H₂是还原剂，O₂是氧化剂\n\n💡 **口诀**：升失氧还（化合价升高→失电子→被氧化→作还原剂）',
        biology: '📌 **生物举例：有丝分裂各期特点**\n\n**以动物细胞为例**：\n\n1. **前期**：核膜核仁消失，染色体出现（膜仁消失现两体）\n2. **中期**：染色体排列在赤道板上（形定数晰赤道齐）\n3. **后期**：着丝点分裂，姐妹染色单体分开移向两极（点裂数增均两极）\n4. **末期**：核膜核仁重新出现，细胞质分裂（两消两现重开始）\n\n💡 **记忆口诀**：前膜消失现两体，中形数晰赤道齐，后点裂数增均两极，末两消两现重开始。',
        history: '📌 **历史举例：辛亥革命的历史意义**\n\n**背景**：19世纪末20世纪初，民族危机加深，清政府腐败无能。\n\n**过程**：\n1. 1894年：孙中山成立兴中会\n2. 1905年：同盟会成立，提出"驱除鞑虏，恢复中华，创立民国，平均地权"\n3. 1911年10月10日：武昌起义爆发\n4. 1912年1月1日：中华民国成立\n\n**意义**：\n• 推翻了清朝统治，结束了两千多年的封建帝制\n• 建立了中华民国，使民主共和观念深入人心\n• 促进了民族资本主义的发展\n\n💡 **评价**：辛亥革命是中国近代史上一次伟大的资产阶级民主革命。'
    };
    var example = examples[subjectId];
    if (!example) {
        example = '📌 **举例说明**\n\n请先选择一个科目，我会为你提供该科目的具体例题和解题示范。\n\n支持的科目：数学、英语、语文、物理、化学、生物、历史';
    }
    return example;
}

// 处理"思维导图"命令
function handleMindmap(cleanQ) {
    var subjectId = _getCurrentSubjectId();
    var db = subjectKnowledgeDB[subjectId];
    if (!db) {
        return '🧠 **知识框架**\n\n请先选择一个科目，我会为你生成该科目的知识结构图。\n\n支持的科目：数学、英语、语文、物理、化学、生物、历史';
    }
    var result = '🧠 **' + db.name + '知识框架（思维导图）**\n\n';
    result += '┌── ' + db.name + '\n';
    db.topics.forEach(function(topic, idx) {
        var connector = idx < db.topics.length - 1 ? '├──' : '└──';
        result += '│   ' + connector + ' 📚 ' + topic.title + '\n';
        topic.points.forEach(function(p, pIdx) {
            var pConnector = (pIdx < topic.points.length - 1) ? '│   │   ├──' : '│   │   └──';
            result += pConnector + ' ' + p + '\n';
        });
    });
    result += '\n💡 以上是' + db.name + '的完整知识框架。建议从基础开始，逐层深入学习。\n\n发送"总结"可以查看文字版知识点总结，发送"复习"可以进行自测。';
    return result;
}

// 处理"复习"命令
function handleReview(cleanQ) {
    var subjectId = _getCurrentSubjectId();
    var db = subjectKnowledgeDB[subjectId];
    if (!db) {
        return '📝 **复习自测**\n\n请先选择一个科目，我会为你生成5道复习测验题。\n\n支持的科目：数学、英语、语文、物理、化学、生物、历史';
    }
    // 从各主题中随机抽取5道题，覆盖不同难度
    var questions = [];
    var difficulties = ['基础', '中等', '中等', '提高', '挑战'];
    var allPoints = [];
    db.topics.forEach(function(topic) {
        topic.points.forEach(function(p) {
            allPoints.push({ topic: topic.title, point: p });
        });
    });
    // 随机选5个知识点
    var shuffled = allPoints.sort(function() { return Math.random() - 0.5; });
    var selected = shuffled.slice(0, 5);
    selected.forEach(function(item, idx) {
        questions.push({
            difficulty: difficulties[idx],
            topic: item.topic,
            question: '关于「' + item.point.split('：')[0].split('，')[0] + '」，请简要回答其核心概念。',
            hint: item.point
        });
    });
    var result = '📝 **' + db.name + '复习自测**（共5题，覆盖不同难度）\n\n';
    questions.forEach(function(q, idx) {
        var stars = q.difficulty === '基础' ? '⭐' : q.difficulty === '中等' ? '⭐⭐' : q.difficulty === '提高' ? '⭐⭐⭐' : '⭐⭐⭐⭐';
        result += '**第' + (idx + 1) + '题** [' + q.difficulty + ' ' + stars + ']\n';
        result += '考点：' + q.topic + '\n';
        result += '题目：' + q.question + '\n\n';
    });
    result += '---\n';
    result += '💡 请逐题回答，我会为你评判正误并给出解析。\n\n';
    result += '📊 学习进度：' + renderProgressBar(learningProgress) + ' ' + learningProgress + '%\n';
    return result;
}

// 渲染文本进度条
function renderProgressBar(percent) {
    var filled = Math.round(percent / 10);
    var empty = 10 - filled;
    var bar = '';
    for (var i = 0; i < filled; i++) bar += '█';
    for (var j = 0; j < empty; j++) bar += '░';
    return bar;
}

// 处理"公式"命令
function handleFormulas(cleanQ) {
    var subjectId = _getCurrentSubjectId();
    var db = subjectKnowledgeDB[subjectId];
    if (!db) {
        return '📐 **公式大全**\n\n请先选择一个科目，我会为你列出该科目的核心公式。\n\n支持的科目：数学、英语、语文、物理、化学、生物、历史';
    }
    if (!db.formulas || db.formulas.length === 0) {
        return '📐 **' + db.name + '公式大全**\n\n该科目暂无公式数据。你可以发送"总结"查看知识点总结。';
    }
    var headers = ['公式名称', '公式表达式'];
    var rows = db.formulas.map(function(f) {
        return [f.name, f.formula];
    });
    return '📐 **' + db.name + '公式大全**（共' + db.formulas.length + '个公式）\n\n' + renderTable(headers, rows) + '\n\n💡 建议结合例题理解公式的应用场景，发送"举例"获取具体例题。';
}

// 处理出题请求（Quiz Mode）
function handleGenerateProblem(cleanQ) {
    const curSubject = state.currentSubject;
    let difficulty = '中等';
    if (/简单|容易/.test(cleanQ)) difficulty = '简单';
    else if (/困难|难/.test(cleanQ)) difficulty = '困难';
    else if (/挑战/.test(cleanQ)) difficulty = '挑战';
    let qType = '解答题';
    if (/选择/.test(cleanQ)) qType = '选择题';
    else if (/填空/.test(cleanQ)) qType = '填空题';
    // 检测是否要求混合题
    var isMixed = /混合|综合|多步|多知识点/.test(cleanQ);
    // 检测是否要求多步题
    var isMultiStep = /多步|分步|步骤/.test(cleanQ) || difficulty === '挑战';
    const subjectKeywords = { 'math': /数学|math/, 'english': /英语|english|英文/, 'chinese': /语文|chinese/, 'physics': /物理|physics/, 'chemistry': /化学|chemistry/, 'biology': /生物|biology/, 'history': /历史|history/, 'politics': /政治|politics/ };
    let targetSubject = curSubject;
    if (!targetSubject) {
        for (const [subjId, pattern] of Object.entries(subjectKeywords)) {
            if (pattern.test(cleanQ)) { targetSubject = subjId; break; }
        }
    }

    // 混合题生成（结合多个知识点）
    if (isMixed && (targetSubject === 'math' || !targetSubject)) {
        var mixedProblems = [
            {
                question: '【混合题】小明去商店买文具，买了3支铅笔每支1.5元，又买了2本笔记本每本4.5元。\n（1）小明一共花了多少钱？\n（2）如果小明付了20元，应该找回多少钱？\n（3）如果每支铅笔涨价0.5元，小明买同样数量的铅笔需要多花多少钱？',
                answer: '（1）3×1.5+2×4.5=4.5+9=13.5元 （2）20-13.5=6.5元 （3）3×0.5=1.5元',
                hint: '这道题综合了乘法、加法和减法运算',
                type: 'fill'
            },
            {
                question: '【混合题】一个长方形花圃，长8米，宽5米。\n（1）花圃的周长是多少米？\n（2）花圃的面积是多少平方米？\n（3）如果在花圃四周围一圈栅栏，栅栏每米12元，一共需要多少钱？',
                answer: '（1）(8+5)×2=26米 （2）8×5=40平方米 （3）26×12=312元',
                hint: '这道题综合了周长公式、面积公式和乘法应用',
                type: 'fill'
            },
            {
                question: '【混合题】一辆汽车从A地出发，前2小时以60km/h的速度行驶，后3小时以80km/h的速度行驶。\n（1）前2小时行驶了多少千米？\n（2）后3小时行驶了多少千米？\n（3）全程的平均速度是多少？',
                answer: '（1）60×2=120千米 （2）80×3=240千米 （3）（120+240)/(2+3)=360/5=72km/h',
                hint: '这道题综合了路程=速度×时间、平均速度=总路程÷总时间',
                type: 'fill'
            }
        ];
        var mixed = mixedProblems[Math.floor(Math.random() * mixedProblems.length)];
        currentQuiz = { subject: 'math', question: mixed.question, answer: mixed.answer, type: mixed.type, hint: mixed.hint };
        return '📝 数学' + difficulty + '混合题（多知识点综合）\n\n' + mixed.question + '\n\n💡 提示：' + mixed.hint + '\n\n📊 学习进度：' + renderProgressBar(learningProgress) + ' ' + learningProgress + '%\n\n请输入你的答案：';
    }

    // 多步计算题生成
    if (isMultiStep && (targetSubject === 'math' || !targetSubject)) {
        var multiStepProblems = [
            {
                question: '【多步计算题】\n已知一次函数 y = 2x + 3：\n（1）当 x = 4 时，y 等于多少？\n（2）当 y = 11 时，x 等于多少？\n（3）这个函数图像与y轴的交点坐标是什么？',
                answer: '（1）y=2×4+3=11 （2）11=2x+3，x=4 （3）x=0时y=3，交点为(0,3)',
                hint: '第1步代入计算，第2步解方程，第3步求y轴交点即x=0',
                type: 'fill'
            },
            {
                question: '【多步计算题】\n一个圆的半径为5cm：\n（1）求圆的面积（π取3.14）\n（2）求圆的周长\n（3）如果半径增加2cm，面积增加了多少？',
                answer: '（1）S=3.14×5²=78.5cm² （2）C=2×3.14×5=31.4cm （3）新面积=3.14×7²=153.86，增加153.86-78.5=75.36cm²',
                hint: '第1步用面积公式S=πr²，第2步用周长公式C=2πr，第3步先算新面积再求差',
                type: 'fill'
            }
        ];
        var ms = multiStepProblems[Math.floor(Math.random() * multiStepProblems.length)];
        currentQuiz = { subject: 'math', question: ms.question, answer: ms.answer, type: ms.type, hint: ms.hint };
        return '📝 数学' + difficulty + '多步计算题\n\n' + ms.question + '\n\n💡 提示：' + ms.hint + '\n\n📊 学习进度：' + renderProgressBar(learningProgress) + ' ' + learningProgress + '%\n\n请输入你的答案：';
    }

    if (targetSubject === 'math' || (!targetSubject && /数学|math/.test(cleanQ))) {
        if (typeof generateMathProblem === 'function') {
            const prob = generateMathProblem(difficulty, qType);
            currentQuiz = { subject: 'math', question: `${prob.question}${prob.hasOptions ? '\n' + prob.options : ''}`, answer: prob.answer || '', type: qType === '选择题' ? 'choice' : 'fill', hint: prob.hint, options: prob.hasOptions ? prob.options.split('\n') : null };
            return `📝 数学${difficulty}${qType}\n\n${prob.question}\n${prob.hasOptions ? prob.options + '\n' : ''}💡 提示：${prob.hint}\n\n📊 学习进度：${renderProgressBar(learningProgress)} ${learningProgress}%\n\n请输入你的答案：`;
        }
    }
    if (targetSubject === 'english' || /英语|english|英文/.test(cleanQ)) return generateEnglishProblem(difficulty, qType);
    if (targetSubject === 'chinese' || /语文|chinese/.test(cleanQ)) return generateChineseProblem(difficulty, qType);
    if (curSubject) {
        const items = state.role === 'student' ? state.subjects : state.projects;
        const curItem = items.find(i => i.id === curSubject);
        return `📝 **${curItem ? curItem.name : ''}练习题**\n\n请告诉我你想练习的具体知识点，我来为你生成题目。`;
    }
    return `📝 **出题模式**\n\n我可以为你生成各科练习题：\n• 🧮 数学：发送"出一道数学题"\n• 📖 英语：发送"出一道英语题"\n• 📝 语文：发送"出一道语文题"\n\n**难度等级**：简单 / 中等 / 困难 / 挑战\n**特殊题型**：混合题（多知识点综合）、多步计算题\n\n**使用示例**：\n• "出一道简单的数学选择题"\n• "出一道困难的数学混合题"\n• "出一道挑战级数学题"\n\n也可以先点击上方科目按钮选择后，再发送"出题"！`;
}

// 每日一题功能
let dailyQuestionDate = '';
let dailyQuestionAnswered = false;

function handleDailyQuestion() {
    const today = new Date().toLocaleDateString('zh-CN');
    if (dailyQuestionDate === today && dailyQuestionAnswered) {
        return `📋 **今日一题** - 你已经完成了今天的每日一题！\n\n明天再来挑战新的题目吧！\n\n💡 也可以发送"出题"获取更多练习题。`;
    }
    if (dailyQuestionDate !== today) {
        dailyQuestionDate = today;
        dailyQuestionAnswered = false;
    }
    const subjects = ['数学', '英语', '语文'];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    let question, answer, hint;
    if (subject === '数学') {
        const a = Math.floor(Math.random() * 20) + 5;
        const b = Math.floor(Math.random() * 20) + 5;
        const ops = ['+', '-', '×'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        const opMap = { '+': (x, y) => x + y, '-': (x, y) => x - y, '×': (x, y) => x * y };
        answer = `${opMap[op](a, b)}`;
        question = `计算：${a} ${op} ${b} = ？`;
        hint = '直接计算即可';
    } else if (subject === '英语') {
        const words = [
            { w: 'abandon', a: '放弃' }, { w: 'benefit', a: '益处' }, { w: 'challenge', a: '挑战' },
            { w: 'determine', a: '决定' }, { w: 'environment', a: '环境' }, { w: 'foundation', a: '基础' },
            { w: 'harmony', a: '和谐' }, { w: 'accomplish', a: '完成' }, { w: 'sufficient', a: '足够的' },
            { w: 'vulnerable', a: '脆弱的' }
        ];
        const item = words[Math.floor(Math.random() * words.length)];
        question = `英语单词 "${item.w}" 的中文意思是什么？`;
        answer = item.a;
        hint = '这是一个' + item.w.length + '个字母的单词';
    } else {
        const idioms = [
            { i: '守株待兔', a: '比喻不主动努力，心存侥幸' }, { i: '画蛇添足', a: '比喻做多余的事' },
            { i: '亡羊补牢', a: '比喻出了问题及时补救' }, { i: '掩耳盗铃', a: '比喻自欺欺人' },
            { i: '刻舟求剑', a: '比喻不知变通' }, { i: '胸有成竹', a: '比喻做事有充分准备' },
            { i: '一鸣惊人', a: '比喻一举成名' }, { i: '水滴石穿', a: '比喻坚持不懈终能成功' }
        ];
        const item = idioms[Math.floor(Math.random() * idioms.length)];
        question = `成语「${item.i}」是什么意思？`;
        answer = item.a;
        hint = '这个成语与一个寓言故事有关';
    }
    currentQuiz = { subject: subject, question: question, answer: answer, type: 'fill', hint: hint };
    return `📋 **每日一题**（${today}）\n\n**科目**：${subject}\n**题目**：${question}\n\n💡 提示：${hint}\n\n请输入你的答案！`;
}

// 学习计划功能
function handleStudyPlan() {
    const subjects = state.subjects.map(s => s.name);
    if (subjects.length === 0) subjects.push('数学', '英语', '语文');
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const timeSlots = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00', '19:00-20:00', '20:00-21:00'];
    let plan = `📅 **一周学习计划**\n\n`;
    plan += `**学习科目**：${subjects.join('、')}\n\n`;
    const schedule = [
        { day: '周一', morning: subjects[0] || '数学', afternoon: subjects[1] || '英语', evening: '复习 + 错题本' },
        { day: '周二', morning: subjects[1] || '英语', afternoon: subjects[2] || '语文', evening: '阅读理解' },
        { day: '周三', morning: subjects[0] || '数学', afternoon: subjects[0] || '数学', evening: '单词背诵' },
        { day: '周四', morning: subjects[2] || '语文', afternoon: subjects[1] || '英语', evening: '错题回顾' },
        { day: '周五', morning: subjects[0] || '数学', afternoon: subjects[2] || '语文', evening: '综合练习' },
        { day: '周六', morning: '薄弱科目专项', afternoon: '模拟测试', evening: '总结复盘' },
        { day: '周日', morning: '本周错题重做', afternoon: '预习下周内容', evening: '自由阅读' }
    ];
    schedule.forEach(s => {
        plan += `**${s.day}**\n`;
        plan += `  🌅 上午：${s.morning}\n`;
        plan += `  ☀️ 下午：${s.afternoon}\n`;
        plan += `  🌙 晚上：${s.evening}\n\n`;
    });
    plan += `---\n💡 **学习建议**：\n• 每个时段学习45分钟，休息10-15分钟\n• 周末重点复习本周薄弱环节\n• 每天睡前花10分钟回顾当天所学\n• 错题本每周至少复习一次\n• 保持规律作息，保证充足睡眠`;
    return plan;
}

// 快速计算
function quickCalculate(cleanQ) {
    const expr = cleanQ.replace(/[×]/g, '*').replace(/[÷]/g, '/').trim();
    try {
        const result = Function('"use strict"; return (' + expr + ')')();
        if (Number.isFinite(result)) return `${cleanQ} = ${result}`;
    } catch (e) {}
    return null;
}

function isGreeting(q) { return ['你好', '您好', 'hi', 'hello', '嗨', 'hey', '早上好', '下午好', '晚上好', '早安', '晚安', '午安', '哈喽', '嗨喽', '你好呀', '您好呀', '你好啊', '嗨嗨', 'hello呀'].includes(q.trim().toLowerCase()) || /^(你好|您好|嗨|hi|hello|hey|早上好|下午好|晚上好|早安|晚安|哈喽|嗨喽)/.test(q.trim().toLowerCase()); }

function isFarewell(q) { return /^(再见|拜拜|bye|byebye|下次见|回见|明天见|走了|先走了|告辞|再会|回头见|goodbye|see you)/.test(q.trim().toLowerCase()); }

function isThanks(q) { return /^(谢谢|感谢|thanks|thank you|多谢|谢了|太感谢|非常感谢|thanks a lot|thx|thank u|3q|谢啦|谢谢啦)/.test(q.trim().toLowerCase()); }

function isSimpleQuestion(q, cleanQ) {
    if (isGreeting(q)) return 'greeting';
    if (isFarewell(q)) return 'farewell';
    if (isThanks(q)) return 'thanks';
    if (/你是谁|你叫什么/.test(q)) return 'intro';
    if (/^\s*[\d\(\)\s.+\-*/÷×]+\s*$/.test(cleanQ) && /[\d]/.test(cleanQ) && /[+\-*/÷×]/.test(cleanQ)) {
        // 先检查是否是分数运算模式（如 1/3 + 2/5），避免被当成普通表达式计算
        if (/^\s*\d+\s*\/\s*\d+\s*([+\-×*/÷]\s*\d+\s*\/\s*\d+\s*)+$/.test(cleanQ)) return 'fraction_expr';
        return 'math_expr';
    }
    if (/(.+?)的拼音/.test(cleanQ)) return 'pinyin';
    // 时间查询
    if (/几点了|现在时间|当前时间|什么时候|今日日期|今天几号|今天星期几/.test(cleanQ)) return 'time';
    // 日期查询
    if (/今天|今天是|现在.*日期|当前.*日期|几月几号/.test(cleanQ) && !/历史|事件|发生/.test(cleanQ)) return 'date';
    // 天气类（模拟回答）
    if (/天气|气温|温度|下雨|下雪|刮风|阴天|晴天/.test(cleanQ)) return 'weather';
    // 节日查询
    if (/节日|假日|假期|放假|春节|中秋|国庆|元旦|端午|清明|七夕|重阳|圣诞/.test(cleanQ)) return 'holiday';
    // 单位换算
    if (/换算|等于多少|多少(厘米|米|千米|公斤|克|斤|升|毫升|小时|分钟|秒)/.test(cleanQ) && /\d/.test(cleanQ)) return 'unit_convert';
    // 笑话
    if (/笑话|讲个笑话|搞笑|说个笑话/.test(cleanQ)) return 'joke';
    // 名言
    if (/名言|名人名言|quote/.test(cleanQ)) return 'quote';
    // 历史上的今天
    if (/历史上的今天|今天发生了什么|历史上的今天/.test(cleanQ)) return 'history_today';
    // 随机数
    if (/随机数|随机数字|random/.test(cleanQ)) return 'random';
    // 鼓励打气
    if (/加油|鼓励|打气|坚持不住|好累|想放弃|撑不下去|没信心|我不行/.test(cleanQ)) return 'encourage';
    // 日常闲聊
    if (/聊聊|聊天|在干嘛|无聊|随便聊聊|说说话|谈谈心/.test(cleanQ)) return 'chat';
    // 猜谜
    if (/猜谜|谜语|猜谜语|出个谜|来道谜/.test(cleanQ)) return 'riddle';
    // 脑筋急转弯
    if (/脑筋急转弯|急转弯|考考你| tricky|brain teaser/.test(cleanQ)) return 'brain_teaser';
    // 冷知识
    if (/冷知识|有趣的知识|fun fact|你知道吗|奇怪的知识/.test(cleanQ)) return 'trivia';
    return null;
}

function handleSimple(type, q, cleanQ) {
    if (type === 'greeting') {
        const greeting = getContextualGreeting();
        const tip = getRandomTip();
        const hour = new Date().getHours();
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        let userLevelInfo = '';
        if (typeof LevelSystem !== 'undefined' && LevelSystem.getUserLevel) {
            const lvl = LevelSystem.getUserLevel();
            userLevelInfo = `\n🏅 **当前等级**：Lv.${lvl.level}（${lvl.title}）`;
        }
        let timeContext = '';
        let companionMsg = '';
        if (hour >= 6 && hour < 9) {
            timeContext = '一日之计在于晨，早上是记忆的黄金时间！';
            companionMsg = '☀️ 新的一天开始了，今天也要元气满满地学习哦！';
        } else if (hour >= 9 && hour < 12) {
            timeContext = '上午精力充沛，适合攻克难题！';
            companionMsg = '💪 上午的学习效率最高，要不要挑战一道难题？';
        } else if (hour >= 12 && hour < 14) {
            timeContext = '午休时间到，适当休息下午效率更高！';
            companionMsg = '🍱 吃完午饭记得小憩一会儿，下午才能精力充沛！';
        } else if (hour >= 14 && hour < 18) {
            timeContext = '下午时光，保持专注，继续加油！';
            companionMsg = '📚 下午容易犯困，起来活动活动，喝杯水提提神吧！';
        } else if (hour >= 18 && hour < 22) {
            timeContext = '晚上好！晚饭后是复习巩固的好时机！';
            companionMsg = '🌆 晚饭后是复习的黄金时间，把今天学的内容过一遍吧！';
        } else {
            timeContext = '夜深了，注意休息，健康第一！';
            companionMsg = '🌙 熬夜学习效果并不好哦，早点休息，明天再继续！';
        }
        // 学习陪伴：检测用户是否连续学习了一段时间（基于对话时间间隔）
        var lastInteractionTime = aiConversationContext.length > 0 ? aiConversationContext[aiConversationContext.length - 1].time : 0;
        var timeSinceLast = Date.now() - lastInteractionTime;
        var studyEncouragement = '';
        if (timeSinceLast > 30 * 60 * 1000 && timeSinceLast < 4 * 60 * 60 * 1000 && aiConversationContext.length >= 3) {
            // 30分钟到4小时之间的间隔，说明用户可能在学习中
            studyEncouragement = '\n\n🌟 **学习陪伴**\n\n看到你一直在坚持学习，太棒了！学习是一场马拉松，不是短跑。你已经走了很远，继续加油！如果需要休息，随时告诉我，我可以陪你聊聊天放松一下~';
        }
        // 记录到会话记忆
        conversationMemory.recordInteraction(q, greeting);
        return `👋 ${greeting}\n\n${timeContext} 现在时间是 ${timeStr}。${userLevelInfo}\n\n${companionMsg}\n\n我是你的AI学习伙伴，有什么可以帮你的吗？\n• 📚 提问任何学科问题\n• 🔍 查单词、查拼音\n• 🧮 计算数学表达式\n• 📝 出练习题\n• 🎯 猜谜语 / 脑筋急转弯\n• ❄️ 冷知识\n• 📋 每日一题 / 学习计划\n\n💡 **今日学习小贴士**：${tip}${studyEncouragement}\n\n直接输入你的问题即可！`;
    }
    if (type === 'farewell') {
        const tip = responseTemplates.farewell[Math.floor(Math.random() * responseTemplates.farewell.length)];
        conversationMemory.recordInteraction(q, tip);
        const hour = new Date().getHours();
        let farewellMsg = '再见！祝你学习进步！👋';
        if (hour >= 22 || hour < 6) {
            farewellMsg = '晚安！早点休息，明天继续加油！🌙';
        } else if (hour >= 18) {
            farewellMsg = '晚上再见！今天辛苦了，好好休息！👋';
        }
        return `👋 ${farewellMsg}\n\n💪 **学习小建议**：${tip}\n\n期待下次见面，继续一起学习！加油！`;
    }
    if (type === 'thanks') {
        const reply = responseTemplates.thanks[Math.floor(Math.random() * responseTemplates.thanks.length)];
        conversationMemory.recordInteraction(q, reply);
        return `😊 ${reply}`;
    }
    if (type === 'intro') return `🤖 我是智学空间的AI学习助手！\n\n我可以帮你：\n• 解答各学科问题\n• 查单词、翻译句子\n• 计算数学表达式\n• 出练习题巩固知识\n• 联网搜索最新信息\n\n有什么问题尽管问我！`;
    if (type === 'fraction_expr') {
        // 分数运算模式，交给 handleMath 中的 solveFraction 处理
        return null;
    }
    if (type === 'math_expr') {
        const res = quickCalculate(cleanQ);
        if (res) return `⚡ **快速计算**\n\n${res}\n\n💡 运算优先级：括号 > 乘除 > 加减`;
    }
    if (type === 'pinyin') {
        const m = cleanQ.match(/(.+?)的拼音/);
        if (m) {
            const word = m[1].trim();
            const pinyinMap = { '你好':'nǐ hǎo','谢谢':'xiè xie','再见':'zài jiàn','早上好':'zǎo shang hǎo','晚上好':'wǎn shang hǎo','对不起':'duì bu qǐ','没关系':'méi guān xi','你好吗':'nǐ hǎo ma','我爱你':'wǒ ài nǐ','中国':'zhōng guó','学习':'xué xí','老师':'lǎo shī','同学':'tóng xué','学校':'xué xiào','数学':'shù xué','英语':'yīng yǔ','语文':'yǔ wén','物理':'wù lǐ','化学':'huà xué','生物':'shēng wù','历史':'lì shǐ','政治':'zhèng zhì','吃饭':'chī fàn','喝水':'hē shuǐ','睡觉':'shuì jiào','跑步':'pǎo bù','看书':'kàn shū','写字':'xiě zì','唱歌':'chàng gē','跳舞':'tiào wǔ','苹果':'píng guǒ','香蕉':'xiāng jiāo','橘子':'jú zi','西瓜':'xī guā','电脑':'diàn nǎo','手机':'shǒu jī','电视':'diàn shì','电话':'diàn huà','太阳':'tài yáng','月亮':'yuè liang','星星':'xīng xīng','天气':'tiān qì','今天':'jīn tiān','明天':'míng tiān','昨天':'zuó tiān','早上':'zǎo shang','中午':'zhōng wǔ','下午':'xià wǔ','晚上':'wǎn shang','名字':'míng zi','什么':'shén me','为什么':'wèi shén me','怎么':'zěn me','哪里':'nǎ lǐ','这个':'zhè ge','那个':'nà ge','大家':'dà jiā','我们':'wǒ men','他们':'tā men','自己':'zì jǐ','朋友':'péng you','家人':'jiā rén','爸爸':'bà ba','妈妈':'mā ma','哥哥':'gē ge','姐姐':'jiě jie','弟弟':'dì di','妹妹':'mèi mei','爷爷':'yé ye','奶奶':'nǎi nai' };
            const py = pinyinMap[word];
            if (py) return `📝 **拼音查询**\n\n「${word}」的拼音是：**${py}**\n\n💡 **声调说明**\n• 第一声（ˉ）：高而平\n• 第二声（ˊ）：升调\n• 第三声（ˇ）：降升调\n• 第四声（ˋ）：降调\n• 轻声（无标）：短而轻`;
            return `📝 **拼音查询**\n\n「${word}」的拼音建议查询字典确认。`;
        }
    }
    if (type === 'time') {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        return `🕐 **当前时间**\n\n${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekdays[now.getDay()]}\n${h}:${m}:${s}`;
    }
    if (type === 'date') {
        const now = new Date();
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        return `📅 **今天日期**\n\n${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekdays[now.getDay()]}`;
    }
    if (type === 'weather') {
        const hour = new Date().getHours();
        const weatherGreetings = [
            '无论晴天还是雨天，学习的心情都要保持晴朗哦！',
            '天气只是外在的环境，内心的阳光才是最重要的！',
            '听说好天气和学习更配哦，今天也要加油！',
            '即使外面风雨交加，知识的海洋里依然风平浪静~'
        ];
        const randomGreeting = weatherGreetings[Math.floor(Math.random() * weatherGreetings.length)];
        let timeAdvice = '';
        if (hour >= 6 && hour < 12) {
            timeAdvice = '🌅 早晨空气清新，适合背诵和记忆类学习！';
        } else if (hour >= 12 && hour < 18) {
            timeAdvice = '☀️ 午后阳光正好，适合攻克难题和理科练习！';
        } else if (hour >= 18 && hour < 22) {
            timeAdvice = '🌆 傍晚时分，适合复习整理一天所学！';
        } else {
            timeAdvice = '🌙 夜晚宁静，适合深度阅读和思考！';
        }
        return `🌤️ **天气与心情**\n\n${randomGreeting}\n\n${timeAdvice}\n\n💡 小贴士：\n• 晴天时多进行户外学习，效率更高\n• 雨天适合室内深度学习，安静专注\n• 无论天气如何，保持规律的学习节奏最重要\n• 学习累了可以看看窗外，让眼睛休息一下`;
    }
    if (type === 'holiday') {
        const holidays = {
            '春节': { desc: '农历正月初一（通常在1月21日-2月20日之间），中国最重要的传统节日。', blessing: '新春快乐，万事如意！愿你在新的一年里学业进步，心想事成！' },
            '元宵节': { desc: '农历正月十五，又称上元节，有赏花灯、猜灯谜的习俗。', blessing: '月圆人团圆，学业圆满！愿你像元宵一样甜蜜圆满！' },
            '清明节': { desc: '公历4月4日-6日之间，祭扫祖先、踏青的节日。', blessing: '清明时节，缅怀先辈的同时也要珍惜当下，努力学习！' },
            '端午节': { desc: '农历五月初五，纪念屈原，有吃粽子、赛龙舟的习俗。', blessing: '端午安康！愿你像龙舟一样勇往直前，百舸争流！' },
            '七夕节': { desc: '农历七月初七，中国的情人节，牛郎织女鹊桥相会的传说。', blessing: '七夕快乐！愿美好的事物都如约而至，包括你的学习目标！' },
            '中秋节': { desc: '农历八月十五，赏月、吃月饼、团圆的节日。', blessing: '中秋快乐，月圆人团圆！愿你的努力都能收获圆满的结果！' },
            '重阳节': { desc: '农历九月初九，登高、赏菊、敬老的节日。', blessing: '重阳登高，步步高升！愿你的成绩也如登高般节节攀升！' },
            '国庆节': { desc: '10月1日，中华人民共和国国庆日。', blessing: '国庆快乐！愿祖国繁荣昌盛，也祝你学业有成，报效祖国！' },
            '元旦': { desc: '1月1日，公历新年第一天。', blessing: '新年快乐！新的一年，新的开始，愿你制定好目标，勇往直前！' },
            '圣诞节': { desc: '12月25日，西方传统节日。', blessing: 'Merry Christmas！愿平安喜乐伴随你，学习之路充满惊喜！' }
        };
        let result = '📅 **节日信息**\n\n';
        let found = false;
        for (const [name, info] of Object.entries(holidays)) {
            if (cleanQ.includes(name)) {
                result += `**${name}**：${info.desc}\n\n🎊 **节日祝福**：${info.blessing}\n\n`;
                found = true;
            }
        }
        if (!found) {
            result += '请告诉我你想了解哪个具体节日的信息。\n\n常见节日：春节、元宵节、清明节、端午节、七夕节、中秋节、重阳节、国庆节、元旦、圣诞节\n\n💡 每个节日都有专属祝福哦！';
        }
        return result;
    }
    if (type === 'unit_convert') {
        const conversions = {
            '1千米': '1千米 = 1000米 = 100000厘米',
            '1米': '1米 = 100厘米 = 1000毫米',
            '1公斤': '1公斤 = 1000克 = 2斤',
            '1斤': '1斤 = 500克 = 0.5公斤',
            '1升': '1升 = 1000毫升',
            '1小时': '1小时 = 60分钟 = 3600秒',
            '1天': '1天 = 24小时 = 1440分钟',
            '1年': '1年 = 365天（闰年366天） = 12个月',
        };
        let result = '📐 **单位换算**\n\n';
        for (const [unit, val] of Object.entries(conversions)) {
            result += `• ${unit} = ${val}\n`;
        }
        result += '\n💡 需要具体换算请告诉我数值和单位，例如"5千米等于多少米"。';
        return result;
    }
    if (type === 'joke') {
        const jokes = [
            '老师：小明，请用"如果"造句。小明：如果我不来上学，我就不知道作业是什么。老师：那你知道今天的作业吗？小明：不知道，因为我昨天没来。',
            '数学老师问：一只鸡2条腿，10只鸡几条腿？小明：20条。老师：那10只鸭子呢？小明：还是20条，因为鸡不会把腿借给鸭子。',
            '物理老师：什么是惯性？小明：就是我明明不想写作业，但手还是不由自主地拿起了笔。',
            '英语老师：Translate "I am very busy"。小明：我很忙。老师：Good。那"I am very free"呢？小明：我很闲。老师：...也对。',
            '为什么数学书总是不开心？因为它有太多问题了！',
            '小明考试得了0分，回家对妈妈说：妈妈，我考了全班第一！妈妈：真的？小明：从后面数！',
            '老师问：世界上什么动物最安静？小明：大猩猩。老师：为什么？小明：因为大猩猩生气会敲胸脯，但平时很安静。老师：不对，是乌龟。小明：为什么？老师：因为它"缩"在壳里。',
            '为什么程序员分不清万圣节和圣诞节？因为 Oct 31 == Dec 25！',
            '一只蚂蚁迷路了，遇到另一只蚂蚁。它问：你都如何回蚁窝？另一只蚂蚁愣了一下，说：带着笑或是很沉默？',
            '小明对爸爸说：爸爸，我想要个弟弟。爸爸：好啊，那你先把你的玩具分一半给他。小明：那算了，我还是不要了。',
            '老师：请用"况且"造句。小明：一列火车经过，况且况且况且况且...',
            '为什么大海是蓝色的？因为鱼在水里会吐泡泡：Blue blue blue...',
            '小明：妈妈，人为什么会做梦？妈妈：因为大脑在整理记忆。小明：那我昨晚梦见考试，是不是大脑在提醒我复习？妈妈：不，那是大脑在吓唬你。',
            '老师：谁能用"果然"造句？小明：我先吃水果，然后再喝果汁，果然很好喝。老师：...',
            '为什么铅笔总是很伤心？因为它总是被削（削=消，消沉）。',
            '小明问爸爸：爸爸，什么是"压力"？爸爸：你妈妈叫你写作业的时候，就是压力。',
            '老师：请说出一种鸟的名字。小明：菜鸟。老师：...那是形容人的。小明：哦，那我是菜鸟。',
            '为什么电脑永远不会感冒？因为它有Windows（窗户）！',
            '小明考试作弊被抓，老师问：你为什么作弊？小明：因为我想体验一下"不劳而获"的感觉。',
            '老师：什么是"相对论"？小明：就是你以为还有5分钟下课，其实还有20分钟。',
            '小明问妈妈：妈妈，我是从哪里来的？妈妈：从超市买的。小明：那我是多少钱买的？妈妈：打折的时候买的，所以你要好好学习，不然就亏本了。',
            '为什么数学老师和体育老师不能一起玩？因为一个喜欢"解"题，一个喜欢"跑"题。',
            '化学老师：水是什么？小明：H₂O。老师：很好。那海水呢？小明：H₂O加上NaCl，还有几条鱼。',
            '生物老师：青蛙为什么跳得比树高？小明：因为树不会跳！老师：...',
            '历史老师：谁发明了电灯？小明：爱迪生。老师：那谁发明了黑暗？小明：...老师？',
            '地理老师：世界上最深的海沟是什么？小明：马里亚纳海沟。老师：有多深？小明：深得连我的作业掉进去都找不回来。',
            '语文老师：请用"况且"和"而且"造句。小明：火车开过来了，况且况且况且，而且我还没写完作业。',
            '政治老师：什么是民主？小明：就是人民当家作主。老师：那什么是专制？小明：就是作业当家作主。',
            '小明问爸爸：爸爸，什么是"通货膨胀"？爸爸：就是以前一块钱能买两个包子，现在只能买一个。小明：那我的零花钱是不是也膨胀了？爸爸：不，你的零花钱在紧缩。',
            '老师：请用"如果...就..."造句。小明：如果老师不布置作业，我就有时间打游戏了。老师：出去！',
            '为什么学霸总是戴眼镜？因为他们把知识都"看"进去了！',
            '老师：谁能解释一下"光合作用"？小明：就是植物在阳光下"合"上眼睛"作用"休息。老师：...你出去！'
        ];
        return `😄 **笑话时间**\n\n${jokes[Math.floor(Math.random() * jokes.length)]}\n\n💡 还想听笑话？随时发送"讲个笑话"！`;
    }
    if (type === 'quote') {
        const quotes = [
            { text: '学而时习之，不亦说乎？', author: '孔子' },
            { text: '知之者不如好之者，好之者不如乐之者。', author: '孔子' },
            { text: '千里之行，始于足下。', author: '老子' },
            { text: '不积跬步，无以至千里；不积小流，无以成江海。', author: '荀子' },
            { text: '天行健，君子以自强不息。', author: '《周易》' },
            { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
            { text: '业精于勤，荒于嬉；行成于思，毁于随。', author: '韩愈' },
            { text: '博学之，审问之，慎思之，明辨之，笃行之。', author: '《礼记》' },
            { text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游' },
            { text: '问渠那得清如许？为有源头活水来。', author: '朱熹' },
            { text: '读书破万卷，下笔如有神。', author: '杜甫' },
            { text: '黑发不知勤学早，白首方悔读书迟。', author: '颜真卿' },
            { text: '天才就是百分之一的灵感加上百分之九十九的汗水。', author: '爱迪生' },
            { text: '生活就像海洋，只有意志坚强的人，才能到达彼岸。', author: '马克思' },
            { text: '人的差异在于业余时间。', author: '爱因斯坦' },
            { text: '我从来不把安逸和享乐看作是生活目的本身。', author: '爱因斯坦' },
            { text: '成功=艰苦劳动+正确方法+少说空话。', author: '爱因斯坦' },
            { text: '书籍是人类进步的阶梯。', author: '高尔基' },
            { text: '时间就像海绵里的水，只要愿挤，总还是有的。', author: '鲁迅' },
            { text: '横眉冷对千夫指，俯首甘为孺子牛。', author: '鲁迅' },
            { text: '其实地上本没有路，走的人多了，也便成了路。', author: '鲁迅' },
            { text: '为中华之崛起而读书。', author: '周恩来' },
            { text: '虚心使人进步，骄傲使人落后。', author: '毛泽东' },
            { text: '世上无难事，只要肯登攀。', author: '毛泽东' },
            { text: '志不强者智不达，言不信者行不果。', author: '墨子' },
            { text: '锲而舍之，朽木不折；锲而不舍，金石可镂。', author: '荀子' },
            { text: '少年易老学难成，一寸光阴不可轻。', author: '朱熹' },
            { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '古诗' },
            { text: '长风破浪会有时，直挂云帆济沧海。', author: '李白' },
            { text: '山重水复疑无路，柳暗花明又一村。', author: '陆游' },
            { text: '勿以恶小而为之，勿以善小而不为。', author: '刘备' },
            { text: '穷则独善其身，达则兼济天下。', author: '孟子' },
            { text: '知之非艰，行之惟艰。', author: '《尚书》' },
            { text: '学而不思则罔，思而不学则殆。', author: '孔子' },
            { text: '三人行，必有我师焉。', author: '孔子' },
            { text: '己所不欲，勿施于人。', author: '孔子' },
            { text: '千里之堤，溃于蚁穴。', author: '韩非子' },
            { text: '吾生也有涯，而知也无涯。', author: '庄子' },
            { text: '不飞则已，一飞冲天；不鸣则已，一鸣惊人。', author: '司马迁' }
        ];
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        return `📜 **名人名言**\n\n> 「${q.text}」\n\n—— ${q.author}\n\n💡 发送"名言"获取更多智慧语录！`;
    }
    if (type === 'history_today') {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const events = {
            '1-1': '1912年 - 中华民国正式成立，孙中山就任临时大总统。\n前46年 - 罗马共和国开始使用儒略历。',
            '1-10': '1946年 - 联合国大会第一届会议在伦敦举行，联合国正式开始运作。',
            '2-14': '270年 - 罗马圣教徒瓦伦丁被处死，此日被后人定为情人节。',
            '3-8': '1909年 - 美国芝加哥女工举行示威游行，成为国际妇女节的起源。',
            '3-14': '1879年 - 爱因斯坦出生，20世纪最伟大的物理学家之一。',
            '4-12': '1961年 - 苏联宇航员加加林乘坐"东方一号"飞船完成人类首次太空飞行。',
            '4-22': '1970年 - 美国首次举行地球日活动，此后每年4月22日成为世界地球日。',
            '5-1': '1886年 - 美国芝加哥工人举行大罢工，要求实行八小时工作制，此日后被定为国际劳动节。',
            '5-4': '1919年 - 五四运动爆发，中国新民主主义革命的开端。',
            '6-5': '1972年 - 联合国在斯德哥尔摩召开首次人类环境会议，此后每年6月5日为世界环境日。',
            '6-18': '1815年 - 滑铁卢战役，拿破仑战败。\n1998年 - 全球首次成功克隆哺乳动物"多莉"羊的相关技术论文发表。',
            '7-1': '1921年 - 中国共产党成立。\n1997年 - 香港回归祖国。',
            '7-4': '1776年 - 美国大陆会议通过《独立宣言》，美利坚合众国诞生。',
            '7-20': '1969年 - 美国"阿波罗11号"宇航员阿姆斯特朗首次踏上月球表面。',
            '8-1': '1927年 - 南昌起义，中国人民解放军的诞生日。',
            '8-6': '1945年 - 美国在日本广岛投下第一颗原子弹，人类进入核时代。',
            '8-15': '1945年 - 日本宣布无条件投降，第二次世界大战结束。',
            '9-1': '1939年 - 德国入侵波兰，第二次世界大战全面爆发。',
            '9-10': '1985年 - 中国设立第一个教师节。',
            '9-18': '1931年 - 九一八事变爆发，日本侵华战争开始。',
            '10-1': '1949年 - 中华人民共和国成立。',
            '10-12': '1492年 - 哥伦布抵达美洲，开启大航海时代的新篇章。',
            '10-16': '1964年 - 中国第一颗原子弹爆炸成功。',
            '11-11': '1918年 - 第一次世界大战结束，协约国与德国签订停战协定。',
            '12-1': '1955年 - 美国黑人妇女罗莎·帕克斯拒绝在公交车上让座，引发美国民权运动。',
            '12-10': '1901年 - 首届诺贝尔奖颁奖典礼在瑞典斯德哥尔摩举行。',
            '12-25': '1991年 - 苏联解体，标志着冷战的结束。'
        };
        const key = month + '-' + day;
        const event = events[key] || '历史上今天发生了许多重要事件。你可以切换到「历史」科目了解更多详细内容。';
        return `📅 **历史上的今天**（${month}月${day}日）\n\n${event}\n\n💡 想了解更多历史事件？切换到「历史」科目深入探索！`;
    }
    if (type === 'encourage') {
        const encouragements = [
            '💪 **加油打气**\n\n学习就像爬山，每一步都很辛苦，但每登高一步，看到的风景就更美。\n\n你已经很棒了！坚持下去，山顶的风景一定值得！',
            '💪 **加油打气**\n\n不要因为一时的困难而气馁。\n\n记住：\n• 每个学霸都曾经历过低谷\n• 每次失败都是成功的铺垫\n• 你的努力终将被看见\n• 相信自己，你可以的！',
            '💪 **加油打气**\n\n今天的不容易，是为了明天更好的自己。\n\n🌟 **给你几个小建议**：\n1. 深呼吸，放松心情\n2. 把大目标拆成小目标\n3. 完成一个小目标就奖励自己\n4. 适当休息，保持好状态',
            '💪 **加油打气**\n\n你不是一个人在战斗！\n\n📚 学习路上，有困惑、有疲惫都很正常。\n重要的是：\n• 累了就休息，但不要放弃\n• 难了就问，不要硬撑\n• 错了就改，不要气馁\n\n我会一直陪着你！',
            '💪 **加油打气**\n\n"宝剑锋从磨砺出，梅花香自苦寒来。"\n\n每一次努力都是在为未来的自己铺路。\n\n✨ 你比你想象的更强大！'
        ];
        return encouragements[Math.floor(Math.random() * encouragements.length)];
    }
    if (type === 'chat') {
        const chats = [
            '😊 **日常闲聊**\n\n学习之余，聊聊天放松一下也不错~\n\n最近有什么有趣的事情发生吗？或者有什么学习上的困惑想跟我聊聊？\n\n💡 我可以陪你：\n• 聊学习方法\n• 分享有趣的知识\n• 讲笑话、猜谜语\n• 给你学习建议\n• 听你吐槽，做你的树洞',
            '😊 **日常闲聊**\n\n你知道吗？\n\n🐙 章鱼有三个心脏，血液是蓝色的！\n🍌 香蕉是浆果，草莓却不是！\n🦒 长颈鹿的舌头可以舔到自己的耳朵！\n\n世界真奇妙，学习让我们发现更多有趣的事情！\n\n最近有没有学到什么让你惊叹的知识？',
            '😊 **日常闲聊**\n\n学习累了的话，试试这些放松方法：\n\n1. 🎵 听一首喜欢的歌\n2. 🚶 站起来走动走动\n3. 💧 喝一杯水\n4. 🪟 看看窗外的风景\n5. 🤲 做几个深呼吸\n\n休息好了再继续，效率会更高哦！\n\n💬 想聊聊什么吗？学习、生活、兴趣爱好都可以~'
        ];
        return chats[Math.floor(Math.random() * chats.length)];
    }
    if (type === 'riddle') {
        const riddles = [
            { q: '什么东西越洗越脏？', a: '水' },
            { q: '什么东西有头无脚？', a: '硬币' },
            { q: '什么东西打破了才能用？', a: '鸡蛋' },
            { q: '什么东西属于你，但别人用的比你多？', a: '名字' },
            { q: '什么布剪不断？', a: '瀑布' },
            { q: '什么门永远关不上？', a: '球门' },
            { q: '什么车没有人能开？', a: '风车' },
            { q: '什么海没有水？', a: '辞海' },
            { q: '什么花不能摸？', a: '火花' },
            { q: '什么蛋打不烂，煮不熟，更不能吃？', a: '考试得的零蛋' },
            { q: '什么路不能走？', a: '电路' },
            { q: '什么牛不会吃草？', a: '蜗牛' },
            { q: '什么书在书店买不到？', a: '秘书' },
            { q: '什么水永远用不完？', a: '口水' },
            { q: '什么球不能踢？', a: '地球' }
        ];
        const r = riddles[Math.floor(Math.random() * riddles.length)];
        return `🎯 **猜谜时间**\n\n谜面：**${r.q}**\n\n💡 想好了吗？发送"答案"揭晓谜底！\n\n（小提示：谜底是「${r.a}」）`;
    }
    if (type === 'brain_teaser') {
        const teasers = [
            { q: '一只鸡2条腿，10只鸡几条腿？那10只鸭子呢？', a: '鸡20条，鸭子也是20条（鸭子自己有腿）' },
            { q: '小明把一只鸡和一只鹅放进冰箱，为什么鹅没死？', a: '因为冰箱里只有鸡，鹅没有被放进去（或者：那是企鹅）' },
            { q: '什么人生病从来不看医生？', a: '盲人（他们看不了医生，是医生看他们）' },
            { q: '有一个字，人人见了都会念错，是什么字？', a: '"错"字' },
            { q: '什么动物最怕冷？', a: '企鹅（因为它住在南极，已经够冷了）' },
            { q: '1+1在什么情况下不等于2？', a: '算错的情况下（或：1滴水+1滴水=1滴水）' },
            { q: '什么越生气越大？', a: '脾气' },
            { q: '什么动物最容易摔倒？', a: '狐狸，因为狡猾（脚滑）' },
            { q: '什么植物和动物最像鸡？', a: '树和马，因为数码相机（树马像鸡）' },
            { q: '什么东西有进无出？', a: '坟墓' }
        ];
        const t = teasers[Math.floor(Math.random() * teasers.length)];
        return `🧠 **脑筋急转弯**\n\n问题：**${t.q}**\n\n💡 动动脑筋，答案可能出乎你的意料！\n\n（答案是：${t.a}）`;
    }
    if (type === 'trivia') {
        const trivias = [
            '❄️ **冷知识**\n\n你知道吗？蜜蜂的翅膀每分钟可以扇动约200次！\n\n这就是为什么我们能听到蜜蜂"嗡嗡"的声音。',
            '❄️ **冷知识**\n\n你知道吗？人的鼻子可以记住大约5万种不同的气味！\n\n而且嗅觉和记忆紧密相连，某种气味可能会唤起你多年前的回忆。',
            '❄️ **冷知识**\n\n你知道吗？章鱼有三个心脏，血液是蓝色的！\n\n两个心脏负责把血液输送到鳃，第三个心脏负责把血液输送到全身。',
            '❄️ **冷知识**\n\n你知道吗？香蕉在植物学上属于浆果，而草莓却不是！\n\n因为浆果的定义是由单朵花的子房发育而成的果实，香蕉符合这个定义。',
            '❄️ **冷知识**\n\n你知道吗？人的大脑约有860亿个神经元！\n\n如果把这些神经元排成一条线，长度可以达到约1000公里。',
            '❄️ **冷知识**\n\n你知道吗？长颈鹿的舌头可以伸长到约50厘米！\n\n而且舌头是蓝黑色的，这样可以防止被太阳晒伤。',
            '❄️ **冷知识**\n\n你知道吗？地球上70%的氧气来自海洋中的藻类，而不是森林！\n\n所以保护海洋就是保护我们的氧气来源。',
            '❄️ **冷知识**\n\n你知道吗？蜗牛可以睡上3年！\n\n当环境条件不适合时，蜗牛会分泌黏液封住壳口进入休眠状态。'
        ];
        return trivias[Math.floor(Math.random() * trivias.length)] + '\n\n💡 发送"冷知识"获取更多有趣知识！';
    }
    if (type === 'random') {
        const match = cleanQ.match(/(\d+).*?(\d+)/);
        let min = 1, max = 100;
        if (match) {
            min = Math.min(parseInt(match[1]), parseInt(match[2]));
            max = Math.max(parseInt(match[1]), parseInt(match[2]));
        }
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        return `🎲 **随机数生成**\n\n范围：${min} ~ ${max}\n结果：**${num}**\n\n💡 需要指定范围？发送"1到100的随机数"试试！`;
    }
    return null;
}

// 上下文感知
function isFollowUp(q, cleanQ) {
    // 排除明确的学科知识问题（包含学科关键词的"为什么/什么是/怎么"问题应由学科处理器处理）
    const isExplicitSubjectQuestion = /热身|拉伸|肌肉|骨骼|关节|心率|呼吸|耐力|速度|力量|柔韧|协调|体能|跑步|跳远|跳高|投掷|球类|足球|篮球|排球|乒乓球|羽毛球|网球|游泳|体操|武术|田径/.test(cleanQ) ||
        /编程|代码|程序|html|css|javascript|python|java|变量|函数|循环|数组|网页|前端|后端|算法/.test(cleanQ) ||
        /音符|节拍|节奏|旋律|和弦|音阶|五线谱|乐器|钢琴|吉他|小提琴|声乐|合唱|指挥|作曲|乐理/.test(cleanQ) ||
        /画画|绘画|色彩|素描|油画|国画|水彩|速写|构图|透视|明暗|线条|三原色|三间色|色相|明度|纯度/.test(cleanQ) ||
        /excel|word|ppt|office|wps|文档|表格|演示|幻灯片|快捷键|键盘|鼠标|文件|文件夹|网络|互联网|浏览器|ip|dns/.test(cleanQ) ||
        /方程|函数|几何|代数|微积分|数列|概率|排列组合|三角函数|对数|指数|根号|平方|立方|面积|体积|周长|直径|半径|圆周率|正弦|余弦|正切|不等式|导数|积分|极限|向量|矩阵|行列式|鸡兔同笼|行程问题|工程问题|利润|浓度|折扣|百分比|分数|小数|约分|通分|最大公约数|最小公倍数|质数|合数|奇数|偶数/.test(cleanQ) ||
        /化学式|化学方程式|光合作用|牛顿|合力|加速度|质量.*速度|速度.*质量|密度|浮力|压强|电流|电压|电阻|元素|原子|分子|离子|化合物|有机物|无机物|细胞|dna|基因|染色体|生态系统|食物链|进化|遗传|新陈代谢|激素|免疫/.test(cleanQ);
    if (isExplicitSubjectQuestion) return false;

    const fup = [/为什么/, /怎么/, /举个例子/, /例如/, /比如/, /还有呢/, /然后呢/, /接着说/, /再讲/, /详细/, /深入/, /结果是什么/, /答案是什么/, /是什么/, /是多少/];
    const ctx = ['这个', '那道', '刚才', '上面', '之前', '继续', '再讲', '还有', '另外', '继续', '下一个', '再来一道'];
    return fup.some(p => p.test(cleanQ)) || ctx.some(kw => q.includes(kw));
}

// 深度上下文理解：分析用户意图
function analyzeUserIntent(q, cleanQ, subjectName) {
    if (/不懂|不明白|没懂|还是不懂|还是不明白/.test(cleanQ)) return 'confused';
    // 如果当前已选择具体科目，且问题包含该科目关键词，不视为追问，让学科处理器处理
    const hasSubjectContext = subjectName && subjectName !== '' && subjectName !== '通用';
    const isExplicitSubjectQuestion = hasSubjectContext && (
        /热身|拉伸|肌肉|骨骼|关节|心率|呼吸|耐力|速度|力量|柔韧|协调|体能|跑步|跳远|跳高|投掷|球类|足球|篮球|排球|乒乓球|羽毛球|网球|游泳|体操|武术|田径/.test(cleanQ) ||
        /编程|代码|程序|html|css|javascript|python|java|变量|函数|循环|数组|网页|前端|后端|算法/.test(cleanQ) ||
        /音符|节拍|节奏|旋律|和弦|音阶|五线谱|乐器|钢琴|吉他|小提琴|声乐|合唱|指挥|作曲|乐理/.test(cleanQ) ||
        /画画|绘画|色彩|素描|油画|国画|水彩|速写|构图|透视|明暗|线条|三原色|三间色|色相|明度|纯度/.test(cleanQ) ||
        /excel|word|ppt|office|wps|文档|表格|演示|幻灯片|快捷键|键盘|鼠标|文件|文件夹|网络|互联网|浏览器|ip|dns/.test(cleanQ)
    );
    if (/为什么/.test(cleanQ) && (q.includes('这个') || q.includes('那') || q.includes('刚才') || aiConversationContext.length >= 2)) {
        if (isExplicitSubjectQuestion) return null; // 让学科处理器处理
        return 'why_deeper';
    }
    if (/举个例子|例如|比如|举个实例/.test(cleanQ) && (q.includes('这个') || q.includes('那') || q.includes('刚才') || aiConversationContext.length >= 2)) {
        if (isExplicitSubjectQuestion) return null;
        return 'need_example';
    }
    if (/简化|简单点|通俗|白话|用简单的话/.test(cleanQ)) return 'simplify';
    return null;
}

function handleIntent(intent, lastResponse) {
    if (intent === 'confused') {
        return `💡 **让我用更简单的方式解释**

刚才的内容可能有些复杂，我用更通俗的语言再讲一遍：

${lastResponse ? lastResponse.substring(0, 200) + '...' : '抱歉，我没有找到刚才的解释。请重新描述你的问题，我会用更简单的方式回答。'}

如果还是不懂，可以告诉我具体哪里不明白，我针对性地解释！`;
    }
    if (intent === 'why_deeper') {
        return `🔍 **深入解释**

你问到了关键点！让我从更深层次来分析：

${lastResponse ? '基于刚才的内容，其根本原因在于原理的底层逻辑。' : '请告诉我你想深入了解哪个问题，我会从原理层面详细解释。'}

简单来说，理解这个问题的核心在于把握本质规律，而不是死记硬背。`;
    }
    if (intent === 'need_example') {
        return `📌 **具体例子**

好的，让我举一个具体的例子来帮助理解：

**例子**：假设小明有5个苹果，他给了小红2个，请问小明还剩几个？

分析过程：
1. 初始数量：5个
2. 减少数量：2个
3. 计算：5 - 2 = 3
4. 答案：小明还剩3个

通过这个例子，你可以看到解决这类问题的关键是理清数量关系。`;
    }
    if (intent === 'simplify') {
        return `✨ **简化版解释**

用最简单的话说：

${lastResponse ? '核心要点就是抓住主要矛盾，忽略次要细节。' : '请告诉我你想简化理解哪个问题，我会用最通俗的语言解释。'}

记住一句话：复杂问题简单化，先抓主干再补细节！`;
    }
    return null;
}

// 检查文本是否包含AI提问/提示，用于设置lastAIPrompt
function extractAIPrompt(text) {
    if (!text) return '';
    const t = text.trim();
    // 检查是否以问号结尾
    if (/[？?]$/.test(t)) return t;
    // 检查是否包含"请"字开头的请求
    if (/请/.test(t) && t.length > 20) return t;
    // 检查是否包含游戏提示
    if (/第\d+轮/.test(t) || /请用|请输入|请回答|请补全/.test(t)) return t;
    // 检查是否包含问号在中间
    if (/[？?]/.test(t)) return t;
    return '';
}

// 更新lastAIPrompt
function updateLastAIPrompt(text) {
    const prompt = extractAIPrompt(text);
    if (prompt) lastAIPrompt = prompt;
}

// 通用知识直接回答（扩展技能库）
function tryGeneralKnowledge(q, cleanQ, searchResult) {
    const calc = quickCalculate(cleanQ);
    if (calc) return `⚡ **快速计算**\n\n${calc}\n\n💡 运算优先级：括号 > 乘除 > 加减`;
    if (/\d{4}年/.test(cleanQ) && (/什么|哪一|事件/.test(cleanQ))) return `关于历史年份的问题，建议切换到「历史」科目获取更详细的解答。`;
    // 扩展知识匹配
    const knowledgeBase = {
        '光速': '光在真空中的速度约为 3×10⁸ m/s（即每秒约30万公里）。',
        '重力加速度': '地球表面重力加速度 g ≈ 9.8 m/s²（约 10 m/s²）。',
        '圆周率': '圆周率 π ≈ 3.14159265358979...，是一个无理数。',
        '阿伏伽德罗常数': 'NA ≈ 6.022×10²³ mol⁻¹，表示1摩尔物质含有的微粒数。',
        '水的化学式': '水的化学式是 H₂O，由两个氢原子和一个氧原子组成。',
        '欧姆定律': '欧姆定律：I = U/R，电流等于电压除以电阻。',
        '万有引力常数': 'G ≈ 6.674×10⁻¹¹ N·m²/kg²。',
        '绝对零度': '绝对零度为 -273.15°C（0K），是理论上可能达到的最低温度。',
        '声音在空气中的速度': '常温下声音在空气中的传播速度约为 340 m/s。',
        '地球半径': '地球平均半径约为 6371 km。',
        'Python怎么安装': 'Python安装步骤：1. 访问 python.org 下载安装包；2. 运行安装程序，勾选"Add to PATH"；3. 打开终端输入 python --version 验证。',
        'HTML基础': 'HTML基础结构：<!DOCTYPE html><html><head>...</head><body>...</body></html>。常用标签：h1-h6(标题)、p(段落)、a(链接)、img(图片)、div(容器)。',
        'CSS选择器': 'CSS常用选择器：类选择器(.class)、ID选择器(#id)、元素选择器(div)、后代选择器(.parent .child)、伪类(:hover)。',
        'JavaScript变量': 'JavaScript声明变量：let(可变)、const(常量)、var(旧式)。推荐使用 let 和 const。',
        '生活小技巧': '生活小技巧：1. 香蕉皮擦皮鞋可使其光亮；2. 牙膏可去除杯子茶垢；3. 淘米水浇花有助于植物生长。',
        '番茄工作法': '番茄工作法：工作25分钟 → 休息5分钟 → 每4个番茄休息15-30分钟。有助于提高专注力和效率。',
        '记忆技巧': '记忆技巧：1. 艾宾浩斯遗忘曲线 - 定期复习；2. 联想记忆法 - 建立关联；3. 分块记忆 - 将大信息拆分为小块。',
        '读书破万卷': '读书破万卷，下笔如有神。——杜甫',
        '三人行必有我师': '三人行，必有我师焉。——《论语》',
        '学而不思则罔': '学而不思则罔，思而不学则殆。——《论语》',
        // 算法
        '冒泡排序': '冒泡排序：重复遍历数组，相邻元素两两比较，大的往后冒泡。时间复杂度O(n²)，空间复杂度O(1)。适合小规模数据。',
        '快速排序': '快速排序：选择基准元素，将数组分为小于基准和大于基准的两部分，递归排序。平均时间复杂度O(n log n)，空间复杂度O(log n)。',
        '归并排序': '归并排序：将数组不断二分，然后合并两个有序数组。时间复杂度O(n log n)，空间复杂度O(n)。稳定排序。',
        '二分查找': '二分查找：在有序数组中，每次将搜索范围减半。时间复杂度O(log n)，空间复杂度O(1)。前提：数组必须有序。',
        '深度优先搜索': '深度优先搜索(DFS)：沿着一条路径尽可能深入，到达尽头后回溯。适用于图的遍历、路径搜索、连通性判断。可用递归或栈实现。',
        '广度优先搜索': '广度优先搜索(BFS)：按层次逐层访问节点。适用于最短路径、层级遍历。使用队列实现。',
        '动态规划': '动态规划(DP)：将复杂问题分解为子问题，保存子问题的解避免重复计算。关键：状态定义、状态转移方程、初始条件。',
        // 数据结构
        '数组': '数组：连续内存存储的线性数据结构。支持随机访问O(1)，插入删除O(n)。适用于频繁查询、较少修改的场景。',
        '链表': '链表：节点通过指针连接的数据结构。插入删除O(1)，访问O(n)。分为单向链表、双向链表、循环链表。',
        '栈': '栈：后进先出(LIFO)的线性数据结构。支持push(入栈)和pop(出栈)操作。应用：函数调用、表达式求值、括号匹配。',
        '队列': '队列：先进先出(FIFO)的线性数据结构。支持enqueue(入队)和dequeue(出队)操作。应用：任务调度、BFS、缓冲。',
        '树': '树：层次结构的非线性数据结构。常用二叉树、二叉搜索树(BST)、平衡树(AVL/红黑树)。BST查找平均O(log n)。',
        '图': '图：由顶点和边组成的非线性数据结构。分为有向图和无向图。表示：邻接矩阵、邻接表。遍历：DFS、BFS。',
        '哈希表': '哈希表：通过哈希函数将键映射到值的数据结构。平均查找O(1)。冲突解决：链地址法、开放寻址法。',
        // 设计模式
        '单例模式': '单例模式：确保一个类只有一个实例，并提供一个全局访问点。应用：数据库连接池、配置管理器。实现：懒汉式、饿汉式、双重检查锁定。',
        '工厂模式': '工厂模式：定义创建对象的接口，由子类决定实例化哪个类。分为简单工厂、工厂方法、抽象工厂。解耦对象创建和使用。',
        '观察者模式': '观察者模式：定义对象间的一对多依赖关系，当一个对象状态改变时，所有依赖者自动收到通知。应用：事件监听、消息订阅。',
        // Web开发
        'REST API': 'REST API：基于HTTP的架构风格，使用URL定位资源，HTTP方法(GET/POST/PUT/DELETE)操作资源。特点：无状态、统一接口、可缓存。',
        'MVC': 'MVC：Model-View-Controller架构模式。Model处理数据，View负责展示，Controller处理用户输入。分离关注点，便于维护和测试。',
        '响应式设计': '响应式设计：使用媒体查询、弹性布局、流式网格使网页适配不同屏幕尺寸。核心：viewport设置、flexbox/grid布局、rem/vw单位。',
        // 数据库
        'SQL': 'SQL：结构化查询语言，用于关系型数据库(RDBMS)。核心操作：SELECT查询、INSERT插入、UPDATE更新、DELETE删除。常用数据库：MySQL、PostgreSQL、Oracle。',
        'NoSQL': 'NoSQL：非关系型数据库，适用于大数据、高并发场景。类型：文档型(MongoDB)、键值型(Redis)、列族型(Cassandra)、图数据库(Neo4j)。',
        '数据库范式': '数据库范式：规范化设计规则。1NF：原子性；2NF：消除部分依赖；3NF：消除传递依赖。BCNF：消除主属性对候选键的依赖。',
        // 网络
        'HTTP': 'HTTP：超文本传输协议，基于请求-响应模型。常用方法：GET(获取)、POST(提交)、PUT(更新)、DELETE(删除)。状态码：2xx成功、3xx重定向、4xx客户端错误、5xx服务器错误。',
        'TCP/IP': 'TCP/IP：传输控制协议/网际协议，互联网核心协议。TCP提供可靠、面向连接的传输；IP负责寻址和路由。三次握手建立连接，四次挥手断开连接。',
        'DNS': 'DNS：域名系统，将域名解析为IP地址。查询过程：浏览器缓存 → 系统缓存 → 路由器缓存 → ISP DNS → 根域名服务器 → 顶级域名服务器 → 权威域名服务器。',
        // 操作系统
        '进程': '进程：程序的一次执行实例，是资源分配的基本单位。包含代码、数据、堆栈、进程控制块(PCB)。状态：就绪、运行、阻塞。进程间通信：管道、消息队列、共享内存、信号量。',
        '线程': '线程：进程内的执行单元，是CPU调度的基本单位。同一进程的线程共享地址空间。优点：创建销毁开销小、通信简单。缺点：一个线程崩溃可能影响整个进程。',
        '内存管理': '内存管理：操作系统管理内存的分配和回收。虚拟内存：将物理内存和磁盘结合，提供更大地址空间。分页：将内存分为固定大小的页。分段：按逻辑单位划分。',
        // ===== 数学知识点 =====
        '勾股定理': '勾股定理：直角三角形中，两直角边的平方和等于斜边的平方，即 a² + b² = c²。中国古代称为"勾三股四弦五"。',
        '二次函数': '二次函数：形如 y = ax² + bx + c（a≠0）的函数。图像为抛物线，当a>0时开口向上，a<0时开口向下。顶点坐标为(-b/2a, (4ac-b²)/4a)。',
        '等差数列': '等差数列：相邻两项的差为常数d的数列。通项公式：an = a1 + (n-1)d。前n项和公式：Sn = n(a1+an)/2 = na1 + n(n-1)d/2。',
        '等比数列': '等比数列：相邻两项的比为常数q的数列。通项公式：an = a1·q^(n-1)。前n项和公式：Sn = a1(1-q^n)/(1-q)（q≠1）。',
        '三角函数': '三角函数：正弦sin、余弦cos、正切tan是最基本的三角函数。sin²α + cos²α = 1，tanα = sinα/cosα。特殊角：sin30°=1/2，cos30°=√3/2，sin45°=√2/2。',
        '对数': '对数：如果 a^x = N（a>0且a≠1），则x叫做以a为底N的对数，记作x=logₐN。常用对数：lgN=log₁₀N；自然对数：lnN=logₑN。性质：logₐ(MN)=logₐM+logₐN。',
        '导数': '导数：函数f(x)在点x处的导数f\'(x)表示函数在该点的瞬时变化率。几何意义是曲线在该点切线的斜率。基本公式：(x^n)\'=nx^(n-1)，(sinx)\'=cosx，(cosx)\'=-sinx。',
        '积分': '积分：不定积分是求导的逆运算，定积分表示曲边梯形的面积。牛顿-莱布尼茨公式：∫[a,b]f(x)dx = F(b)-F(a)，其中F(x)是f(x)的一个原函数。',
        '概率': '概率：事件A发生的概率P(A) = 事件A包含的基本事件数 / 样本空间的基本事件总数。条件概率：P(B|A) = P(AB)/P(A)。独立事件：P(AB) = P(A)P(B)。',
        '向量': '向量：既有大小又有方向的量。平面向量a=(x1,y1)，b=(x2,y2)，点积a·b=x1x2+y1y2=|a||b|cosθ。向量平行：x1y2=x2y1；向量垂直：x1x2+y1y2=0。',
        // ===== 物理知识点 =====
        '牛顿第一定律': '牛顿第一定律（惯性定律）：一切物体在没有受到外力作用时，总保持静止状态或匀速直线运动状态。惯性只与质量有关，质量越大惯性越大。',
        '牛顿第二定律': '牛顿第二定律：物体的加速度跟所受合力成正比，跟质量成反比，方向与合力方向相同。公式：F = ma。力是产生加速度的原因。',
        '牛顿第三定律': '牛顿第三定律：两个物体之间的作用力和反作用力总是大小相等、方向相反、作用在同一条直线上。作用力与反作用力同时产生、同时消失。',
        '能量守恒': '能量守恒定律：能量既不会凭空产生，也不会凭空消失，它只会从一种形式转化为另一种形式，或者从一个物体转移到另一个物体，而总能量保持不变。',
        '动量守恒': '动量守恒定律：如果一个系统不受外力或所受外力之和为零，那么这个系统的总动量保持不变。公式：m1v1 + m2v2 = m1v1\' + m2v2\'。',
        '电磁感应': '电磁感应：闭合电路的一部分导体在磁场中做切割磁感线运动时，导体中会产生感应电流。法拉第电磁感应定律：感应电动势的大小与磁通量变化率成正比。',
        '光的折射': '光的折射：光从一种介质斜射入另一种介质时，传播方向发生偏折。折射定律：入射角正弦与折射角正弦之比等于两种介质的折射率之比，即n₁sinθ₁=n₂sinθ₂。',
        '热力学第一定律': '热力学第一定律：ΔU = Q + W，系统内能的增量等于系统吸收的热量加上外界对系统做的功。是能量守恒定律在热学中的具体表现。',
        '万有引力定律': '万有引力定律：任何两个物体之间都存在相互吸引的力，力的大小与两物体质量的乘积成正比，与它们之间距离的平方成反比。公式：F = Gm₁m₂/r²。',
        '简谐运动': '简谐运动：物体在跟位移大小成正比、并且总是指向平衡位置的回复力作用下的振动。特征：F=-kx，a=-ω²x。周期T=2π/ω。弹簧振子和单摆是典型例子。',
        // ===== 化学知识点 =====
        '元素周期律': '元素周期律：元素的性质随原子序数的递增呈周期性变化。同一周期从左到右，金属性减弱、非金属性增强；同一主族从上到下，金属性增强、非金属性减弱。',
        '化学键': '化学键：相邻原子之间强烈的相互作用。离子键：阴阳离子间的静电作用；共价键：原子间通过共用电子对形成；金属键：金属阳离子与自由电子之间的作用。',
        '氧化还原反应': '氧化还原反应：有电子转移（得失或偏移）的化学反应。氧化：失电子、化合价升高；还原：得电子、化合价降低。氧化剂被还原，还原剂被氧化。',
        '酸碱中和': '酸碱中和反应：酸和碱作用生成盐和水的反应。实质是H⁺ + OH⁻ = H₂O。中和反应是放热反应。强酸强碱中和的pH=7。',
        '化学平衡': '化学平衡：在一定条件下，可逆反应中正反应速率和逆反应速率相等，反应混合物中各组分浓度保持不变的状态。勒夏特列原理：改变条件，平衡向减弱改变的方向移动。',
        '摩尔': '摩尔（mol）：物质的量的单位，1摩尔物质含有阿伏伽德罗常数（约6.02×10²³）个微粒。物质的量n = 质量m / 摩尔质量M = 粒子数N / 阿伏伽德罗常数NA。',
        '原电池': '原电池：将化学能转化为电能的装置。构成条件：两种活动性不同的电极、电解质溶液、闭合回路、自发进行的氧化还原反应。负极发生氧化反应，正极发生还原反应。',
        '电解': '电解：在电流作用下，电解质在阴阳两极发生氧化还原反应的过程。阳极发生氧化反应，阴极发生还原反应。应用：电解精炼、电镀、氯碱工业。',
        '同分异构体': '同分异构体：分子式相同但结构不同的化合物。分为碳链异构、位置异构、官能团异构等。例如：正丁烷和异丁烷，乙醇和二甲醚。',
        '催化剂': '催化剂：能改变化学反应速率而在反应前后本身的质量和化学性质不变的物质。特点：改变化学反应速率、反应前后质量和化学性质不变、不改变平衡状态。',
        // ===== 生物知识点 =====
        '细胞结构': '细胞结构：细胞由细胞膜、细胞质、细胞核（真核细胞）构成。细胞质中含有线粒体（有氧呼吸主要场所）、核糖体（蛋白质合成）、内质网、高尔基体等细胞器。',
        '光合作用': '光合作用：绿色植物通过叶绿体，利用光能，把二氧化碳和水转化成储存能量的有机物，并释放氧气的过程。总反应式：6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂（条件：光、叶绿体）。',
        '呼吸作用': '呼吸作用：有机物在细胞内经过一系列氧化分解，生成二氧化碳或其他产物，释放能量并合成ATP的过程。有氧呼吸：C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 能量。',
        'DNA': 'DNA（脱氧核糖核酸）：由脱氧核苷酸组成的双螺旋结构。基本单位是脱氧核苷酸，含A、T、C、G四种碱基。碱基互补配对原则：A-T，C-G。DNA是主要的遗传物质。',
        '基因': '基因：有遗传效应的DNA片段，是控制生物性状的基本遗传单位。基因通过指导蛋白质的合成来表达自己所携带的遗传信息。等位基因位于同源染色体的相同位置。',
        '遗传定律': '孟德尔遗传定律：分离定律（一对等位基因在形成配子时彼此分离）和自由组合定律（非同源染色体上的非等位基因自由组合）。适用于真核生物有性生殖。',
        '进化论': '达尔文自然选择学说：过度繁殖→生存斗争→遗传变异→适者生存。现代生物进化理论认为，种群是生物进化的基本单位，突变和基因重组产生进化的原材料，自然选择决定进化方向。',
        '生态系统': '生态系统：生物群落与无机环境相互作用而形成的统一整体。组成：生产者（绿色植物）、消费者（动物）、分解者（细菌真菌）。能量流动特点：单向流动、逐级递减。',
        '人体免疫': '人体免疫系统：包括免疫器官（骨髓、胸腺、脾等）、免疫细胞（淋巴细胞、吞噬细胞等）和免疫活性物质（抗体、淋巴因子等）。三道防线：皮肤黏膜、体液中的杀菌物质、特异性免疫。',
        '神经调节': '神经调节：基本方式是反射，结构基础是反射弧（感受器→传入神经→神经中枢→传出神经→效应器）。兴奋在神经纤维上以电信号（神经冲动）形式传导，在神经元之间通过突触传递。',
        // ===== 语文知识点 =====
        '修辞手法': '修辞手法：比喻（明喻、暗喻、借喻）、拟人、夸张、排比、对偶、设问、反问、反复、对比、借代等。作用：使语言生动形象、增强表达效果、突出事物特征。',
        '文言文虚词': '文言文常见虚词：之（的/它/去）、其（他的/那/大概）、而（并且/却/如果）、以（用/因为/来）、于（在/到/比）、者（……的人/……的事物）、也（表判断/语气词）。',
        '唐诗宋词': '唐诗：李白（诗仙，浪漫主义）、杜甫（诗圣，现实主义）、白居易（新乐府运动）。宋词：豪放派（苏轼、辛弃疾）、婉约派（李清照、柳永）。',
        '四大名著': '四大名著：《三国演义》（罗贯中，历史演义）、《水浒传》（施耐庵，英雄传奇）、《西游记》（吴承恩，神魔小说）、《红楼梦》（曹雪芹，世情小说）。',
        '记叙文六要素': '记叙文六要素：时间、地点、人物、事件的起因、经过、结果。记叙顺序：顺叙、倒叙、插叙。表达方式：记叙、描写、抒情、议论、说明。',
        '议论文三要素': '议论文三要素：论点（作者的观点）、论据（证明论点的事实和道理）、论证（用论据证明论点的过程）。论证方法：举例论证、道理论证、对比论证、比喻论证。',
        // ===== 英语知识点 =====
        '英语时态': '英语基本时态：一般现在时（经常性动作）、一般过去时（过去动作）、一般将来时（将来动作）、现在进行时（正在进行）、过去进行时（过去正在进行）、现在完成时（已完成对现在有影响）、过去完成时（过去的过去）。',
        '从句': '英语从句：名词性从句（主语从句、宾语从句、表语从句、同位语从句）、定语从句（限制性/非限制性，关系代词who/which/that/whom/whose）、状语从句（时间、地点、原因、条件、让步等）。',
        '被动语态': '被动语态：be + 过去分词。各种时态的被动：一般现在时am/is/are done、一般过去时was/were done、一般将来时will be done、现在进行时am/is/are being done、现在完成时have/has been done。',
        '虚拟语气': '虚拟语气：表示与事实相反或不可能实现的假设。if虚拟：与现在相反（did/were, would do）、与过去相反（had done, would have done）、与将来相反（should do/were to do, would do）。',
        '非谓语动词': '非谓语动词：不定式（to do，表目的/将来）、动名词（doing，表抽象/习惯性动作）、分词（现在分词doing表主动/进行，过去分词done表被动/完成）。',
        // ===== 历史知识点 =====
        '辛亥革命': '辛亥革命：1911年爆发的资产阶级民主革命。推翻了清朝统治，结束了中国两千多年的封建帝制，建立了中华民国。孙中山领导的同盟会是主要革命力量。',
        '抗日战争': '抗日战争：1931年九一八事变开始局部抗战，1937年七七事变全面爆发，1945年8月15日日本宣布无条件投降。是中国近代以来反抗外敌入侵第一次取得完全胜利的民族解放战争。',
        '文艺复兴': '文艺复兴：14-16世纪起源于意大利，后扩展到欧洲各国的思想文化运动。核心思想是人文主义，代表人物：但丁、达芬奇、莎士比亚。是欧洲近代史的开端。',
        '工业革命': '工业革命：第一次（18世纪60年代，英国，蒸汽机，进入蒸汽时代）；第二次（19世纪70年代，电力、内燃机，进入电气时代）；第三次（20世纪中期，电子计算机、信息技术）。',
        '中国古代朝代': '中国古代朝代顺序：夏→商→周（西周/东周）→秦→汉（西汉/东汉）→三国→晋（西晋/东晋）→南北朝→隋→唐→五代十国→宋（北宋/南宋）→元→明→清。记忆口诀：夏商与西周，东周分两段，春秋和战国，一统秦两汉。',
        // ===== 地理知识点 =====
        '地球自转': '地球自转：地球绕地轴自西向东旋转，周期约24小时（一个太阳日）。产生昼夜交替、地方时差异、地转偏向力（北半球右偏，南半球左偏）。',
        '地球公转': '地球公转：地球绕太阳自西向东运行，周期约365.25天。产生四季更替、昼夜长短变化、正午太阳高度变化、五带划分。',
        '气候类型': '世界主要气候类型：热带雨林气候（赤道附近，全年高温多雨）、地中海气候（30-40°大陆西岸，夏季炎热干燥，冬季温和多雨）、温带季风气候（东亚，夏季高温多雨，冬季寒冷干燥）。',
        '水循环': '水循环：自然界的水在太阳辐射和重力作用下，通过蒸发、水汽输送、降水、下渗、地表径流和地下径流等环节，在陆地、海洋和大气之间不断循环的过程。',
        '板块构造': '板块构造学说：地球岩石圈分为六大板块（欧亚板块、非洲板块、印度洋板块、太平洋板块、美洲板块、南极洲板块）。板块交界处地壳活跃，多火山地震。',
        // ===== 政治知识点 =====
        '社会主义核心价值观': '社会主义核心价值观：国家层面（富强、民主、文明、和谐）；社会层面（自由、平等、公正、法治）；个人层面（爱国、敬业、诚信、友善）。',
        '社会主义市场经济': '社会主义市场经济：市场在资源配置中起决定性作用，更好发挥政府作用。基本特征：坚持公有制主体地位、以共同富裕为根本目标、能够实行科学的宏观调控。',
        '人民代表大会制度': '人民代表大会制度：我国的根本政治制度。全国人民代表大会是最高国家权力机关，行使立法权、决定权、任免权、监督权。民主集中制是组织和活动原则。',
        '依法治国': '依法治国：广大人民群众在党的领导下，依照宪法和法律规定，通过各种途径和形式管理国家事务、经济文化事业和社会事务。基本要求：有法可依、有法必依、执法必严、违法必究。',
        '公民权利与义务': '公民基本权利：平等权、政治权利和自由、宗教信仰自由、人身自由、社会经济权利、文化教育权利等。基本义务：维护国家统一、遵守宪法法律、依法纳税、服兵役等。权利和义务是统一的。',
        // ===== 更多细分数学领域 =====
        '矩阵': '矩阵：m×n个数按一定规则排成的矩形数表。矩阵运算包括加法、乘法、转置、求逆等。应用：解线性方程组、线性变换、计算机图形学。',
        '向量空间': '向量空间：定义了加法与标量乘法的向量集合。满足封闭性、结合律、交换律、分配律等八条公理。是线性代数的核心概念。',
        '微积分': '微积分：研究函数的变化率和累积效应。微分学（求导数、极值、切线斜率）和积分学（求面积、体积、累积量）。牛顿和莱布尼茨是主要创立者。',
        '统计': '统计学：收集、整理、分析和解释数据的方法。描述统计（均值、中位数、标准差）和推断统计（假设检验、置信区间、回归分析）。',
        '排列组合': '排列组合：排列（从n个不同元素中取出m个，按顺序排列）P(n,m)=n!/(n-m)!；组合（不考虑顺序）C(n,m)=n!/[m!(n-m)!]。二项式定理：(a+b)^n = ΣC(n,k)a^(n-k)b^k。',
        '复数': '复数：形如 z = a + bi 的数（i²=-1）。复数的四则运算、共轭、模长、极坐标表示。欧拉公式：e^(iθ) = cosθ + i sinθ。应用：交流电路、量子力学。',
        // ===== 更多细分物理领域 =====
        '电场': '电场：存在于电荷周围，对放入其中的电荷产生力的作用的特殊物质。电场强度E=F/q，点电荷电场E=kQ/r²。电场线从正电荷出发终止于负电荷。',
        '磁场': '磁场：存在于磁体或电流周围，对放入其中的磁体或运动电荷产生磁力的物质。磁感应强度B，方向是小磁针N极受力方向。安培定则判断电流磁场方向。',
        '交流电': '交流电：大小和方向随时间周期性变化的电流。表达式 i = I₀sin(ωt+φ)。有效值=最大值/√2。频率50Hz（中国），周期0.02s。变压器通过电磁感应改变电压。',
        '原子物理': '原子物理：原子由原子核和核外电子组成。玻尔模型：电子在特定能级轨道运动，跃迁时吸收或发射光子。E=hf=hc/λ。放射性衰变：α衰变、β衰变、γ衰变。',
        // ===== 更多细分化学领域 =====
        '有机化学': '有机化学：研究碳化合物的化学。官能团决定有机物性质。重要反应：取代、加成、消去、聚合。烃类（烷烃、烯烃、炔烃、芳香烃）及其衍生物。',
        '高分子': '高分子化合物：由大量重复结构单元通过共价键连接而成的相对分子质量很大的化合物。塑料、橡胶、纤维是三大合成材料。聚合反应：加聚和缩聚。',
        '化学反应速率': '化学反应速率：用单位时间内反应物浓度减少或生成物浓度增加表示。影响因素：浓度（浓度越大速率越快）、温度（升温10°C速率约增2-4倍）、催化剂、压强、固体表面积。',
        // ===== 更多细分生物领域 =====
        '有丝分裂': '有丝分裂：体细胞的分裂方式。过程：间期（DNA复制）→前期（染色质→染色体）→中期（排列在赤道板）→后期（着丝粒分裂）→末期（形成两个子细胞）。',
        '减数分裂': '减数分裂：生殖细胞（配子）的形成方式。减数第一次分裂（同源染色体分离）→减数第二次分裂（姐妹染色单体分离），染色体数目减半。',
        '基因突变': '基因突变：DNA分子中发生碱基对的替换、增添或缺失。特点：普遍性、随机性、低频性、多害少利性、不定向性。诱变因素：物理、化学、生物因素。',
        '生态系统能量流动': '生态系统的能量流动：能量沿着食物链（网）传递。特点：单向流动、逐级递减，传递效率约10%-20%。流入某一营养级的能量=同化量=呼吸消耗+生长发育繁殖。',
        // ===== 更多语文知识 =====
        '古代诗歌鉴赏': '古代诗歌鉴赏方法：1.看标题（提示内容、题材）；2.看作者（知人论世）；3.看注释（背景信息）；4.看意象（寄托情感）；5.看手法（修辞、表现手法）。常用意象：月亮（思乡）、柳（送别）、菊（高洁）。',
        '文言文翻译': '文言文翻译原则：信（准确）、达（通顺）、雅（优美）。方法：留（人名地名年号）、删（无义虚词）、补（补充省略）、换（古词换今词）、调（调整语序）、贯（贯通上下文）。',
        '成语': '成语：汉语中定型的词组或短句，多为四字，有特定出处和含义。常见类型：神话寓言（守株待兔）、历史故事（完璧归赵）、诗文语句（老骥伏枥）、口头俗语（三心二意）。',
        '说明方法': '说明文常见说明方法：举例子（具体说明）、列数字（精确说明）、作比较（突出特征）、打比方（生动说明）、分类别（条理清晰）、下定义（揭示本质）、画图表（直观说明）。',
        // ===== 更多英语知识 =====
        '英语构词法': '英语构词法：派生法（加前缀/后缀，如un-、-tion）、合成法（两个词合成，如classroom）、转化法（词性转换，如water(n.)→water(v.)）、缩略法（如UFO、ASAP）。',
        '英语阅读理解技巧': '英语阅读理解技巧：1.先读题干，明确目标；2.定位关键词，找到对应段落；3.仔细比对选项与原文；4.推理判断题注意排除绝对化表述；5.主旨题关注首尾段和连接词。',
        '英语写作句型': '英语写作高分句型：开头：It is widely believed that...；表达观点：From my perspective,...；举例：A case in point is...；转折：However, it is worth noting that...；总结：In conclusion, taking all these factors into consideration,...',
        // ===== 更多历史地理 =====
        '冷战': '冷战：1947-1991年以美国为首的北约和以苏联为首的华约之间的政治、经济、军事对峙。重要事件：柏林封锁、古巴导弹危机、朝鲜战争、越南战争。1991年苏联解体标志着冷战结束。',
        '古代希腊罗马': '古代希腊：西方文明的源头，民主政治的起源（雅典），哲学（苏格拉底、柏拉图、亚里士多德），科学（阿基米德、欧几里得）。古代罗马：从共和到帝国，罗马法对后世法律影响深远。',
        '经纬度': '经纬度：经度（本初子午线0°，向东向西各180°）、纬度（赤道0°，向北向南各90°）。经线等长，纬线不等长。低纬度0°-30°，中纬度30°-60°，高纬度60°-90°。',
        '洋流': '世界洋流分布规律：以副热带为中心的大洋环流（北顺南逆）、以副极地为中心的大洋环流（北逆南顺）。暖流增温增湿（如北大西洋暖流），寒流降温减湿（如秘鲁寒流）。',
        // ===== 学习方法类知识 =====
        '艾宾浩斯遗忘曲线': '艾宾浩斯遗忘曲线：德国心理学家艾宾浩斯研究发现，遗忘在学习之后立即开始，且先快后慢。20分钟后遗忘42%，1小时后遗忘56%，1天后遗忘74%，1周后遗忘77%。启示：学后及时复习，间隔重复效果最佳。',
        '费曼学习法': '费曼学习法（诺贝尔物理学奖得主理查德·费曼创立）：第1步：选择一个概念；第2步：用最简单的话教给一个小白；第3步：发现解释不清的地方就回头学习；第4步：简化语言，用类比加深理解。核心：教学相长，能教别人才算真懂。',
        '番茄工作法': '番茄工作法（弗朗西斯科·西里洛创立）：一个番茄时间=25分钟工作+5分钟休息；每完成4个番茄时间，休息15-30分钟。技巧：①任务清单提前列好 ②一个番茄时间内不做无关事 ③被打断就重新开始 ④记录每天的番茄数。',
        '记忆宫殿法': '记忆宫殿法（又称位置记忆法）：1.选择一个熟悉的空间（如自己的家）；2.在这个空间里确定一系列固定的位置（如客厅→卧室→厨房）；3.将要记忆的信息转化为生动图像，放在各个位置上；4.沿着路线走一遍，依次回忆。适合记演讲内容、考试要点、清单等。',
        'SQ3R阅读法': 'SQ3R阅读法：Survey（浏览）→浏览标题、图表、摘要，把握框架；Question（提问）→将标题转化为问题；Read（阅读）→带着问题精读；Recite（复述）→用自己的话回答刚才的问题；Review（复习）→定期回顾笔记和要点。适用于教材阅读和知识学习。',
        '康奈尔笔记法': '康奈尔笔记法：把一页纸分为三部分——右侧（笔记栏，记录要点和内容，约占70%）、左侧（线索栏，提炼关键词或问题，约占15%）、底部（总结栏，用自己的话总结，约占15%）。优点：结构清晰，便于复习和巩固。',
        '刻意练习': '刻意练习（安德斯·埃里克森提出）：不是简单的重复，而是有目标、有反馈、有挑战的练习。原则：1.明确具体目标 2.保持高度专注 3.及时获得反馈 4.不断跳出舒适区 5.建立心理表征。一万小时定律需要建立在刻意练习的基础上。',
        '思维导图': '思维导图（托尼·布赞创立）：以一个中心主题出发，用分支结构向外发散，每个分支使用关键词和图像。绘制步骤：1.中心画主题图像 2.向外画主要分支 3.从分支再延伸子分支 4.使用颜色、图标、代码增强记忆。适合整理知识体系、头脑风暴、做笔记。',
        '间隔重复': '间隔重复：在逐渐增加的时间间隔内复习已学内容。最佳复习时间点：学习后1小时 → 1天 → 3天 → 7天 → 15天 → 1个月 → 3个月。比集中复习（突击）效果更好，能大幅提高长期记忆率。工具推荐：Anki、Supermemo等闪卡软件。',
        '帕累托法则': '帕累托法则（二八定律）：80%的产出来自20%的关键投入。在学习中的应用：1.找出最重要的20%知识点，它们可能占据80%的考点 2.优先攻克薄弱环节 3.不要试图面面俱到 4.合理分配时间和精力 5.抓住核心概念比记细节更重要。',
        // ===== 考试技巧类知识 =====
        '答题策略': '考试答题策略：1.拿到试卷先通览，了解题型和分值分布 2.先易后难，先做有把握的题 3.选择题排除法：排除明显错误选项再比较 4.主观题先列提纲，再展开作答 5.注意分值分配，小分值题不要花太多时间 6.留出10-15分钟检查 7.不要空题，实在不会也尽量写相关公式或思路。',
        '时间分配': '考试时间分配技巧：1.提前算好各题型的时间预算（如选择题1分钟/题，大题10分钟/题）2.设置时间提醒点（如做到一半时看表）3.遇到难题先跳过，标记回头再做 4.最后15分钟一定要开始检查 5.检查顺序：先看有没有漏题，再检查计算和选择，最后看主观题。',
        '审题技巧': '审题技巧：1.圈出题目中的关键条件、数据和设问词 2.注意否定词（不、错误、不是）和限定词（全部、都、只有） 3.看清题目要求（选正确还是错误，单选还是多选） 4.复杂题目至少读两遍 5.理解出题意图——考的是哪个知识点。',
        '考前准备': '考前准备建议：1.提前一周调整作息，保证睡眠 2.复习以看错题本和知识框架为主 3.准备好考试用品（准考证、文具、手表） 4.考试当天吃清淡早餐 5.提前到考场，熟悉环境 6.深呼吸缓解紧张 7.给自己积极心理暗示：我已经准备好了。',
        '作文应试技巧': '作文应试技巧：1.审题（5分钟）——找准关键词，确定立意 2.列提纲（5分钟）——规划开头、主体、结尾 3.写作（30分钟）——保持卷面整洁，注意分段 4.检查（5分钟）——改错别字和病句。高分秘诀：开头点题、结尾升华、中间有层次、书写工整、字数达标。',
        '理科答题规范': '理科答题规范：1.写出主要公式（有公式分）2.代入数据（带单位）3.写出结果（注意有效数字和单位）4.必要文字说明（如"根据牛顿第二定律"）5.作图题用铅笔和直尺 6.步骤完整，不要跳步 7.结果合理性检查（如速度不可能超光速）。',
        '英语考试技巧': '英语考试技巧：听力：提前看题预测内容；阅读：先题后文定位关键词；完形：上下文逻辑是关键；语法填空：分析句子成分判断词性变化；作文：背熟模板句型，书写工整，字数达标。词汇量是基础，真题训练是关键。',
        '选择题猜题技巧': '选择题猜题技巧（当确实不会时）：1.三长一短选最短，三短一长选最长（仅限英语阅读）2.绝对化选项（总是、绝对、所有）通常是错的 3.看似正确的干扰项往往不是答案 4.排除法优先 5.同一道题各选项互斥 6.相信第一印象，除非确认否则不改。'
    };
    for (const [key, val] of Object.entries(knowledgeBase)) {
        if (cleanQ.includes(key) || q.includes(key.toLowerCase())) return `💡 **知识查询**\n\n${val}`;
    }
    if (searchResult) return `关于「${cleanQ.substring(0, 50)}${cleanQ.length > 50 ? '...' : ''}」：\n\n${searchResult}\n\n💡 如需更专业的解答，可以选择上方对应科目进入专项模式。`;
    return null;
}

// 智能回退：更努力地直接回答
function trySmartFallback(cleanQ) {
    if (!cleanQ || cleanQ.length < 2) return null;
    const q = cleanQ.toLowerCase();

    // 尝试计算
    const calc = quickCalculate(cleanQ);
    if (calc) return `⚡ **快速计算**\n\n${calc}`;

    // 常见生活问题
    const lifeAnswers = {
        '怎么学习': '高效学习方法：\n1. 制定学习计划，每天固定时间学习\n2. 使用番茄工作法（25分钟学习+5分钟休息）\n3. 主动回忆法：学完后合上书回忆内容\n4. 费曼学习法：用自己的话教给别人\n5. 定期复习，遵循艾宾浩斯遗忘曲线\n6. 做好笔记，用思维导图整理知识',
        '怎么提高成绩': '提高成绩的方法：\n1. 找到薄弱环节，针对性复习\n2. 多做练习题，尤其是错题\n3. 建立错题本，定期回顾\n4. 课堂认真听讲，做好笔记\n5. 合理安排时间，劳逸结合\n6. 保持良好心态，适当运动',
        '怎么背单词': '高效背单词方法：\n1. 联想记忆法：把单词和画面联系起来\n2. 词根词缀法：通过词根推测词义\n3. 语境记忆法：在句子中记单词\n4. 间隔重复法：按遗忘曲线安排复习\n5. 分类记忆法：按主题分类记忆\n6. 每天坚持，少量多次',
        '怎么写作文': '作文写作技巧：\n1. 多读优秀范文，积累素材\n2. 学会使用修辞手法（比喻、排比、拟人）\n3. 注意文章结构（开头-正文-结尾）\n4. 多用细节描写，避免空洞\n5. 写完后修改润色\n6. 每周至少写一篇完整作文',
    };

    for (const [key, val] of Object.entries(lifeAnswers)) {
        if (q.includes(key)) return `💡 **学习建议**\n\n${val}`;
    }

    // ========== 日常对话模式匹配（情感交流/笑话/礼貌回复等） ==========
    // 问候
    if (/^(你好|您好|嗨|hi|hello|hey|哈喽|早上好|下午好|晚上好|早安|午安|晚安)[\s!！。.？?~]*$/i.test(cleanQ.trim())) {
        const greetings = [
            '你好呀！很高兴见到你。今天想学点什么呢？可以选一个科目开始学习，或者随便聊聊也可以。',
            '你好！欢迎来到AI学习平台。有什么我可以帮你的吗？',
            '嗨！今天状态怎么样？准备好学习了吗？'
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // 情感交流/心情不好
    if (/心情不好|不开心|难过|伤心|郁闷|烦|焦虑|压力大|累|疲惫|无聊|失落|沮丧|低落|emo|心情差/.test(cleanQ)) {
        const comforts = [
            '听到你心情不太好，先给你一个虚拟的拥抱。\n\n每个人都会有低落的时候，这很正常。建议你：\n1. 先休息一下，做点让自己开心的事\n2. 听一首喜欢的歌，或者出去走走\n3. 如果是学习压力，可以试着把任务拆小，一步一步来\n4. 和朋友或家人聊聊天\n\n等你心情好一些了，随时可以回来学习，我一直在这里。',
            '别难过呀！生活中总有起起落落，重要的是不要放弃。\n\n给你一个小建议：试着写下三件今天让你感恩的小事，哪怕是很小的事情也可以。这个方法在心理学上被证明能有效改善心情。\n\n如果想转移注意力，可以选一个感兴趣的科目，做几道轻松的题目，说不定心情就好了呢。',
            '我能理解你的感受。心情不好的时候，不要勉强自己学习。\n\n先照顾好自己的情绪吧：\n• 深呼吸几次，放松一下\n• 喝杯温水，吃点甜的东西\n• 看看窗外的风景\n\n记住，暂时的低谷不代表什么，明天会更好的。'
        ];
        return comforts[Math.floor(Math.random() * comforts.length)];
    }

    // 笑话请求
    if (/笑话|讲个笑话|搞笑|逗我开心|开心一下|有趣的事|幽默/.test(cleanQ)) {
        const jokes = [
            '好的，给你讲一个数学笑话：\n\n平行线最可怜了，因为它们有那么多相同点，却永远不能在一起。\n\n哈哈，学数学也要保持幽默感！还想听吗？',
            '来一个：\n\n老师问小明："如果你有12块巧克力，有人问你要3块，你还剩多少？"\n小明："12块。"\n老师："你不懂数学吗？"\n小明："你不懂我，我更不懂分享。"\n\n这个笑话告诉我们，数学题要仔细审题！',
            '给你讲一个程序员笑话：\n\n一个程序员去面试，面试官问："你有什么特长？"\n程序员："我能在任何截止日期前完成任务。"\n面试官："太好了！"\n程序员："只要把截止日期往后推就行了。"\n\n哈哈，虽然拖延不好，但笑一笑十年少！',
            '来一个冷笑话：\n\n为什么数学书总是很不开心？\n因为它有太多"问题"（problems）了。\n\n好了好了，笑完继续学习吧！'
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // 礼貌回复（谢谢/感谢）
    if (/谢谢|感谢|多谢|thanks|thank you|太好了|你真棒|厉害|不错|很好|赞/.test(cleanQ)) {
        const thankReplies = [
            '不客气！能帮到你我很高兴。如果还有其他问题，随时问我！',
            '谢谢你的反馈！学习之路我们一起走，加油！',
            '很高兴能帮到你！记住，学习是一个持续的过程，保持好奇心最重要。有什么问题随时来问！',
            '不用谢！看到你进步就是对我最大的鼓励。继续加油！'
        ];
        return thankReplies[Math.floor(Math.random() * thankReplies.length)];
    }

    // 告别
    if (/^(再见|拜拜|bye|goodbye|走了|先走了|下课了|结束)[\s!！。.]*$/i.test(cleanQ.trim())) {
        return '再见！今天辛苦了，记得适当休息。明天继续加油，我随时在这里等你！';
    }

    // 自我介绍
    if (/你是谁|你叫什么|介绍一下你|你是什么/.test(cleanQ)) {
        return '我是AI学习助手，一个离线运行的智能学习平台。\n\n我可以帮你：\n• 解答数学、英语、语文、物理、化学、生物等学科问题\n• 提供详细的解题步骤和知识点讲解\n• 出题练习和错题分析\n• 日常聊天和情感交流\n\n选择上方的科目就可以开始学习了！';
    }

    // 能力询问
    if (/你会什么|你能做什么|你有什么功能|帮我什么|你能帮我/.test(cleanQ)) {
        return '我可以帮你做很多事情：\n\n**学科学习**：\n• 数学 - 计算、方程、几何、函数、概率等\n• 英语 - 翻译、语法、单词、写作\n• 语文 - 古诗、文言文、作文、阅读\n• 物理/化学/生物 - 知识点讲解和题目解答\n• 历史/政治/地理 - 知识梳理\n\n**学习工具**：\n• 随机出题练习\n• 解题步骤详解\n• 知识点归纳\n\n选择一个科目开始吧！';
    }

    // 天气/时间等闲聊
    if (/天气|今天几号|星期几|现在几点|时间/.test(cleanQ)) {
        return '我暂时无法获取实时天气数据，建议你查看手机天气应用获取准确信息。不过我可以帮你学习与天气相关的知识，比如"什么是气旋？"或"天气预报是怎么做的？"';
    }

    // ========== Rich Interactive Commands ==========

    // 画函数图像
    if (/画.*函数|函数.*图像|画.*图|坐标系/.test(cleanQ)) {
        const samplePoints = [];
        for (let x = 0; x <= 10; x++) {
            samplePoints.push([x, parseFloat((0.5 * x + 1).toFixed(1))]);
        }
        return `📊 **函数图像绘制**\n\n请告诉我具体的函数表达式，例如：\n• y = 2x + 1（一次函数）\n• y = x² - 2x + 1（二次函数）\n\n以下是 y = 0.5x + 1 的示例：\n\n` + renderCoordinate(samplePoints);
    }

    // 生成表格
    if (/生成.*表格|创建.*表格|给我.*表格/.test(cleanQ)) {
        return renderTable(
            ['项目', '数值', '备注'],
            [
                ['示例数据1', '100', '这是示例'],
                ['示例数据2', '200', '可替换'],
                ['示例数据3', '300', '按需修改'],
            ]
        ) + '\n\n💡 告诉我你需要什么类型的表格，我可以生成具体内容。\n例如："生成一个成绩对比表格"';
    }

    // 代码模板
    if (/代码模板|给我.*代码|生成.*代码|code template/.test(cleanQ)) {
        return renderCodeBlock('javascript', '// JavaScript 代码模板\n\n// 1. 基础函数模板\nfunction greet(name) {\n    return `你好，${name}！`;\n}\n\n// 2. 数组操作模板\nconst data = [1, 2, 3, 4, 5];\nconst result = data\n    .filter(item => item > 2)\n    .map(item => item * 2);\n\n// 3. 异步请求模板\nasync function fetchData(url) {\n    try {\n        const response = await fetch(url);\n        const data = await response.json();\n        return data;\n    } catch (error) {\n        console.error("请求失败:", error);\n    }\n}\n\n// 4. 事件处理模板\ndocument.querySelector(".btn")\n    .addEventListener("click", (e) => {\n        console.log("按钮被点击了");\n    });') +
            '\n\n' + renderFileDownload('code_template.js', '// JavaScript 代码模板\n\nfunction greet(name) {\n    return `你好，${name}！`;\n}\n\nconst data = [1, 2, 3, 4, 5];\nconst result = data\n    .filter(item => item > 2)\n    .map(item => item * 2);\n\nconsole.log(result);');
    }

    // 对比功能
    if (/对比|比较|compare|vs|VS/.test(cleanQ)) {
        return renderTable(
            ['对比项', 'A', 'B'],
            [
                ['定义', '请描述A', '请描述B'],
                ['特点', 'A的特点', 'B的特点'],
                ['优势', 'A的优势', 'B的优势'],
                ['适用场景', 'A的适用场景', 'B的适用场景'],
            ]
        ) + '\n\n💡 请告诉我你想对比的两个事物，例如："对比Python和JavaScript"';
    }

    // 知识点总结
    if (/总结.*知识点|知识点总结|知识梳理|归纳/.test(cleanQ)) {
        return `📋 **知识点总结模板**\n\n${renderTable(
            ['知识点', '核心内容', '重要程度', '掌握情况'],
            [
                ['知识点1', '请填写核心内容', '★★★', '待复习'],
                ['知识点2', '请填写核心内容', '★★☆', '已掌握'],
                ['知识点3', '请填写核心内容', '★★★', '待复习'],
            ]
        )}\n\n💡 请告诉我你想总结哪个学科/知识点，例如："总结数学函数知识点"`;
    }

    return null;
}

// ========== AI Image Analysis ==========
function analyzeImage(imageSrc) {
    return `📸 **图片已收到**

我收到了你上传的图片！由于我是离线AI，无法直接识别图片中的文字内容。

**请告诉我：**
1. 这张图片是什么科目的题目？（数学/语文/英语/物理/化学/生物等）
2. 题目的大致内容是什么？
3. 你需要我帮你解答什么问题？

**或者你可以：**
• 直接输入题目中的关键文字或公式
• 描述题目要求和已知条件
• 拍照后用文字复述题目内容

我会根据你提供的信息，为你给出详细的解答！`;
}

function handleImageQuestion(imageSrc, question) {
    // 让 student-response.js 中的 handleImageQA 来处理更智能的图片问答
    if (/文字|提取|识别|OCR/.test(question)) {
        return `📝 **文字提取**

目前我无法直接从图片中提取文字（需要OCR服务）。

建议：
1. 手动输入图片中的文字
2. 我会帮你分析、翻译或解答

请输入图片中的文字内容：`;
    }
    // 其他情况返回null，让 generateAIResponse 调用 generateStudentResponse 处理
    return null;
}

async function generateAIResponse(question, image) {
    // AI 理解增强：预处理问题
    let questionAnalysis = null;
    if (question && question.trim()) {
        questionAnalysis = preprocessQuestion(question.trim());
        aiLog('问题理解', '类型=' + questionAnalysis.questionType + ', 格式=' + questionAnalysis.responseFormat + ', 详细度=' + questionAnalysis.detailLevel + (questionAnalysis.isFollowUp ? ', 追问' : '') + (questionAnalysis.subjectHint ? ', 科目=' + questionAnalysis.subjectHint : ''));
    }

    // ========== 多意图检测 ==========
    if (question && question.trim()) {
        var multipleIntents = detectMultipleIntents(question.trim());
        if (multipleIntents.length >= 2) {
            aiLog('多意图检测', '检测到' + multipleIntents.length + '个意图：' + multipleIntents.map(function(i) { return i.keywords; }).join(' + '));
        }
    }

    // ========== 话题延续检测 ==========
    if (question && question.trim()) {
        // 跳过明确的数学计算问题，避免被话题延续拦截
        var isExplicitMathCalc = /\d+\.?\d*\s*的\s*\d+\.?\d*\s*%/.test(question.trim()) ||
            /\d+\.?\d*\s*是\s*\d+\.?\d*\s*的百分之/.test(question.trim()) ||
            /\d+\.?\d*\s*比\s*\d+\.?\d*\s*[多少]/.test(question.trim());
        if (!isExplicitMathCalc) {
            var continuation = detectTopicContinuation(question.trim());
            if (continuation.isContinuation) {
                aiLog('话题延续', '检测到延续话题：' + continuation.topic);
                questionAnalysis.isFollowUp = true;
                questionAnalysis.followUpTopic = continuation.topic;
            }
        }
    }

    // ========== v3.1.0: 话题切换检测 ==========
    if (question && question.trim()) {
        var topicSwitch = conversationMemory.detectTopicSwitch(question.trim());
        if (topicSwitch.switched) {
            aiLog('话题切换', '从「' + topicSwitch.from + '」切换到「' + topicSwitch.toSubject + '」');
            // 在问题分析中标记话题切换，后续会在响应中添加过渡语
            questionAnalysis.topicSwitched = true;
            questionSwitchInfo = topicSwitch;
        }
    }

    // ========== 先执行命令检测和学科切换，再检测歧义 ==========
    // 命令和学科切换不应被歧义检测拦截
    const result = await _generateAIResponseInner(question, image, questionAnalysis);
    // 每次AI回复后，更新lastAIPrompt
    if (result && result.text) {
        updateLastAIPrompt(result.text);
        lastAIResponseFull = result.text;
        lastAIResponseLength = result.text.length;
        // 更新lastAnswerTopic（提取关键词）
        var topicMatch = result.text.match(/\*\*([^*]+)\*\*/);
        if (topicMatch && topicMatch[1].length < 20) {
            lastAnswerTopic = topicMatch[1].replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '').trim();
            // 记录到会话记忆
            conversationMemory.addTopic(lastAnswerTopic);
        }

        // v3.1.0: 记录解释主题（用于复习上次）
        if (questionAnalysis && questionAnalysis.questionType === 'definition') {
            lastExplanationTopic = lastAnswerTopic;
        }
        // v3.1.0: 记录举例主题（用于换个例子）
        if (questionAnalysis && questionAnalysis.questionType === 'example') {
            lastExampleTopic = lastAnswerTopic;
        }

        // 记录交互到会话记忆
        conversationMemory.recordInteraction(question, result.text);

        // v3.1.0: 话题切换时添加过渡语
        if (questionAnalysis && questionAnalysis.topicSwitched && typeof questionSwitchInfo !== 'undefined' && questionSwitchInfo) {
            var transitionPhrase = getTopicTransitionPhrase(questionSwitchInfo.from, questionSwitchInfo.toSubject);
            result.text = transitionPhrase + '\n\n' + result.text;
            questionSwitchInfo = null;
        }

        // AI 思考过程：仅在复杂问题时展示思考步骤，简单问题跳过以加快响应
        var isSimpleQuery = question && /^[\d\s\(\)+\-*/÷×.]+$/.test(question.trim());
        var isBasicSubject = questionAnalysis && questionAnalysis.subjectHint && ['数学', '语文', '英语'].indexOf(questionAnalysis.subjectHint) !== -1;
        if (!isSimpleQuery && !isBasicSubject && questionAnalysis && result.canSaveError !== false || (result.text && result.text.length > 100)) {
            var thinkingSteps = generateThinkingSteps(question || '', questionAnalysis);
            lastThinkingSteps = thinkingSteps;
            var thinkingHtml = showThinkingSteps(thinkingSteps);
            // 将思考过程插入到回答文本的最前面
            result.text = thinkingHtml + '\n' + result.text;
        }

        // ========== 知识检查：概念解释后偶尔询问 ==========
        if (questionAnalysis && questionAnalysis.questionType === 'definition' && Math.random() < 0.4) {
            result.text += '\n\n---\n' + getKnowledgeCheckPrompt();
        }
    }
    // Learn from interaction after response
    learnFromInteraction(question, result ? result.text : '');
    return result;
}

async function _generateAIResponseInner(question, image, analysis) {
    aiLogEntries = [];
    // Apply user preferences before processing
    if (question && question.trim()) {
        const originalQuestion = question.trim();
        // Detect and record preferences from user input
        detectUserPreferences(originalQuestion, null);
        // Apply active preferences to question
        question = applyUserPreferences(originalQuestion);
        aiConversationContext.push({ role: 'user', text: originalQuestion, time: Date.now() });
        if (aiConversationContext.length > MAX_CONTEXT_LENGTH * 2) aiConversationContext = aiConversationContext.slice(-MAX_CONTEXT_LENGTH * 2);
    }
    const subject = state.currentSubject;
    const items = state.role === 'student' ? state.subjects : state.projects;
    let item = items.find(i => i.id === subject);
    if (!item && state.consultations) item = state.consultations.find(i => i.id === subject);
    const subjectName = item ? item.name : '';
    showAiLogPanel();
    const q = (question || '').toLowerCase();
    let cleanQ = question || '';
    cleanQ = correctTypos(cleanQ);
    aiLog('接收问题', `"${cleanQ.substring(0, 40)}${cleanQ.length > 40 ? '...' : ''}"`);

    // ========== 上下文感知：根据当前科目调整歧义词理解 ==========
    var subjectContextHint = getContextAwareResponse(cleanQ, subjectName);
    if (subjectContextHint) {
        aiLog('上下文感知', '科目=' + subjectName + '，上下文提示=' + subjectContextHint);
    }

    // ========== 图片分析处理 ==========
    if (image && !question) {
        aiLog('图片分析', '用户上传了图片，无文字说明');
        setTimeout(() => collapseAiLogPanel(), 3000);
        return { type: 'ai', text: analyzeImage(image), canSaveError: false, originalQuestion: '[图片]' };
    }
    if (image && question) {
        const imgRes = handleImageQuestion(image, cleanQ);
        if (imgRes) {
            aiLog('图片分析', `用户上传图片并提问："${cleanQ.substring(0, 30)}"`);
            setTimeout(() => collapseAiLogPanel(), 3000);
            return { type: 'ai', text: imgRes, canSaveError: false, originalQuestion: question || '[图片]' };
        }
    }

    // ========== 上下文感知：检查用户简短回复是否在回答AI的提问 ==========
    const shortReply = cleanQ.trim().length < 10;
    if (shortReply && lastAIPrompt) {
        const isAskingResult = /结果|答案|是什么|是多少|对不对|对吗/.test(cleanQ);
        const isContinuing = /继续|下一个|再来一道|再来一次|再出一道/.test(cleanQ);
        if (isAskingResult) {
            aiLog('上下文感知', `用户询问结果，引用上次AI提示`);
            setTimeout(() => collapseAiLogPanel(), 3000);
            return { type: 'ai', text: `💡 **回顾上次内容**\n\n${lastAIPrompt}\n\n请根据上面的提示来回答哦！`, canSaveError: false, originalQuestion: question || '' };
        }
        if (isContinuing) {
            aiLog('上下文感知', `用户要求继续，基于上次主题：${lastSubject || '通用'}`);
            const prevSubjectIdMap = { '数学': 'math', '英语': 'english', '语文': 'chinese', '物理': 'physics', '化学': 'chemistry', '生物': 'biology', '历史': 'history', '政治': 'politics', '地理': 'geography', '法律咨询': 'law', '心理咨询': 'mental', '编程': 'programming', '音乐': 'music', '美术': 'art', '体育': 'pe', '信息技术': 'it' };
            const prevId = lastSubject ? prevSubjectIdMap[lastSubject] : null;
            if (prevId && typeof generateStudentResponse === 'function') {
                const prevState = state.currentSubject; state.currentSubject = prevId;
                let response = generateStudentResponse('出题', lastSubject, image);
                state.currentSubject = prevState;
                if (searchResult) response += '\n\n' + searchResult;
                setTimeout(() => collapseAiLogPanel(), 3000);
                return { type: 'ai', text: response, canSaveError: false, originalQuestion: question || '' };
            }
        }
        // 用户简短回复且AI上次有提问，可能是对提问的回答
        if (/^[a-zA-Z\u4e00-\u9fa5\d]+$/.test(cleanQ.trim()) && lastAIPrompt.length > 20) {
            aiLog('上下文感知', `用户简短回复，视为对上次AI提问的回答`);
            // 将用户回复与上次AI提示合并，尝试生成有意义的回答
            const combinedQ = lastAIPrompt + '\n我的回答：' + cleanQ.trim();
            if (lastSubject && typeof generateStudentResponse === 'function') {
                const prevSubjectIdMap = { '数学': 'math', '英语': 'english', '语文': 'chinese', '物理': 'physics', '化学': 'chemistry', '生物': 'biology', '历史': 'history', '政治': 'politics', '地理': 'geography', '法律咨询': 'law', '心理咨询': 'mental', '编程': 'programming', '音乐': 'music', '美术': 'art', '体育': 'pe', '信息技术': 'it' };
                const prevId = prevSubjectIdMap[lastSubject];
                if (prevId) {
                    const prevState = state.currentSubject; state.currentSubject = prevId;
                    let response = generateStudentResponse(combinedQ, lastSubject, image);
                    state.currentSubject = prevState;
                    if (searchResult) response += '\n\n' + searchResult;
                    setTimeout(() => collapseAiLogPanel(), 3000);
                    return { type: 'ai', text: response, canSaveError: false, originalQuestion: question || '' };
                }
            }
        }
    }

    // ========== "继续/然后呢/接着说"命令：智能继续上次内容 ==========
    if (/^(继续|然后呢|接着说|继续说说|继续讲|然后).*$/.test(cleanQ.trim())) {
        aiLog('继续命令', '用户要求继续');
        // 如果有未展示完的长响应，继续展示
        if (lastAIResponseFull && lastAIResponseLength > 500) {
            const continuation = lastAIResponseFull.substring(500);
            const response = `📌 **继续上次内容**\n\n${continuation}\n\n💡 以上是上次回答的后续部分。如需进一步了解，请继续提问。`;
            setTimeout(() => collapseAiLogPanel(), 3000);
            return { type: 'ai', text: response, canSaveError: false, originalQuestion: '继续' };
        }
        // 如果有上次学科主题，继续该主题
        if (lastSubject && lastTopic) {
            aiLog('继续命令', `继续上次主题：${lastSubject} - ${lastTopic}`);
            const followUpResponses = [
                `好的，我们继续聊聊「${lastTopic}」的相关内容。\n\n让我从另一个角度来解释：\n\n${lastTopic}是一个非常重要的知识点，理解它的关键在于把握核心概念。你可以试着用自己的话复述一下，这样能检验是否真的理解了。`,
                `继续「${lastTopic}」的学习！\n\n📚 **深入拓展**\n\n除了刚才讲的内容，${lastTopic}还有以下几个要点值得注意：\n\n1. 它与实际生活联系紧密\n2. 考试中常以综合题形式出现\n3. 需要结合具体例子来理解\n\n💡 要不要我出一道相关练习题来巩固一下？`,
                `好的，我们继续！\n\n关于「${lastTopic}」，我再补充一些易错点：\n\n⚠️ **常见误区**\n• 不要混淆相似概念\n• 注意公式的适用条件\n• 解题时要先分析再计算\n\n如果你觉得自己已经掌握了，可以发送"出题"来测试一下！`
            ];
            const response = followUpResponses[Math.floor(Math.random() * followUpResponses.length)];
            setTimeout(() => collapseAiLogPanel(), 3000);
            return { type: 'ai', text: response, canSaveError: false, originalQuestion: '继续' };
        }
        // 如果有会话上下文，基于上下文继续
        if (aiConversationContext.length >= 2) {
            const lastUserQ = aiConversationContext[aiConversationContext.length - 2];
            if (lastUserQ && lastUserQ.text) {
                const response = `💡 **继续讨论**\n\n基于我们刚才讨论的「${lastUserQ.text.substring(0, 40)}...」：\n\n我可以进一步展开说明，或者从另一个角度来阐释。你希望我：\n• 讲得更详细一些\n• 举一个具体例子\n• 出一道相关练习题\n• 还是换个方式解释？\n\n请告诉我你的需求！`;
                setTimeout(() => collapseAiLogPanel(), 3000);
                return { type: 'ai', text: response, canSaveError: false, originalQuestion: '继续' };
            }
        }
        // 默认回复
        const defaultContinue = `💡 **继续学习**\n\n没问题！你想继续学习哪个方面呢？\n\n• 📚 继续刚才的话题\n• 📝 出几道练习题\n• 🔍 探索新的知识点\n• 📋 查看学习计划\n\n直接告诉我你的想法，或者切换到具体科目开始学习！`;
        setTimeout(() => collapseAiLogPanel(), 3000);
        return { type: 'ai', text: defaultContinue, canSaveError: false, originalQuestion: '继续' };
    }

    // ========== 错误纠正响应：当用户指出AI说错了 ==========
    if (/^(不是|不对|错了|你说错了|不对吧|不是这样|不对不对|搞错了|理解错了|错了错了|不是.*意思|不.*不对|不.*是.*样)/.test(cleanQ.trim()) || /^不是[，,、]/.test(cleanQ.trim())) {
        aiLog('错误纠正', '用户指出AI回答有误');
        conversationMemory.recordCorrection();
        var apologyResponses = [
            '抱歉，是我理解有误，感谢你的指正！🙏\n\n让我重新分析一下：',
            '对不起，刚才的回答不够准确，谢谢你的纠正！\n\n让我重新来解答：',
            '不好意思，是我搞错了。谢谢指出！\n\n让我修正一下：'
        ];
        var apology = apologyResponses[Math.floor(Math.random() * apologyResponses.length)];
        // 提取用户纠正的内容
        var correctionContent = '';
        var afterNot = cleanQ.trim().replace(/^(不是|不对|错了|你说错了|不对吧|不是这样|不对不对|搞错了|理解错了|错了错了)/, '').trim();
        if (afterNot && afterNot.length > 1 && !/^[，,、]/.test(afterNot)) {
            correctionContent = '\n\n你指出的是：' + afterNot;
        }
        setTimeout(() => collapseAiLogPanel(), 3000);
        return {
            type: 'ai',
            text: apology + correctionContent + '\n\n请把你的问题重新描述一下，我会更仔细地分析，给出准确的回答。',
            canSaveError: false,
            originalQuestion: question || ''
        };
    }

    // ========== 点赞/表扬响应 ==========
    if (/^(很好|不错|太棒了|非常好|真棒|好厉害|说得对|对的|正确|没错|优秀|厉害|好棒|赞|👍|棒极了|超级棒|好极了)/.test(cleanQ.trim())) {
        aiLog('表扬检测', '用户表达赞许');
        var thanksResponses = [
            '谢谢你的肯定！很高兴能帮到你 😊\n\n关于这个知识点，要不要我再深入讲一些拓展内容？或者换一个角度帮你加深理解？',
            '感谢鼓励！能帮到你是我的荣幸 🎉\n\n你对这部分内容掌握得如何了？需要我出几道题帮你巩固一下吗？',
            '太好了，谢谢夸奖！🌟\n\n要不要我接着讲一些相关的知识点？或者你还有其他的问题想问吗？',
            '很高兴你觉得有帮助！💪\n\n如果想对这个话题有更深入的理解，我可以从以下方面继续：\n• 更详细的原理讲解\n• 实际应用案例\n• 相关练习题\n\n选一个感兴趣的告诉我吧！'
        ];
        var thanksMsg = thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
        setTimeout(() => collapseAiLogPanel(), 3000);
        return {
            type: 'ai',
            text: thanksMsg,
            canSaveError: false,
            originalQuestion: question || ''
        };
    }

    // ========== "翻译这段话"命令：翻译上次AI响应 ==========
    if (cleanQ.trim() === '翻译这段话' && lastAIResponseFull) {
        aiLog('翻译命令', '用户要求翻译上次AI响应');
        const isChinese = /[\u4e00-\u9fa5]/.test(lastAIResponseFull);
        if (isChinese) {
            const response = `🌐 **Translation (English)**\n\n${lastAIResponseFull.substring(0, 800)}\n\n💡 以上是上次回答的英文翻译（主要内容）。如需翻译完整内容或特定段落，请告诉我。`;
            setTimeout(() => collapseAiLogPanel(), 3000);
            return { type: 'ai', text: response, canSaveError: false, originalQuestion: '翻译这段话' };
        } else {
            const response = `🌐 **中文翻译**\n\n这段内容已经是中文，无需翻译。\n\n💡 如果你需要将中文翻译成英文，也可以告诉我。`;
            setTimeout(() => collapseAiLogPanel(), 3000);
            return { type: 'ai', text: response, canSaveError: false, originalQuestion: '翻译这段话' };
        }
    }

    // ========== "解释更详细"/"详细一点"命令：扩展上次响应 ==========
    if (/^(解释更详细|详细一点|更详细|详细说说|展开说说|详细解释)$/.test(cleanQ.trim()) && lastAIResponseFull) {
        aiLog('详细解释命令', '用户要求更详细的解释');
        const expanded = `📖 **详细解释**\n\n关于上次的内容，我来为你展开说明：\n\n${lastAIResponseFull.substring(0, 300)}\n\n---\n\n**补充说明**：\n• 这个知识点涉及多个方面，建议从基础概念开始理解\n• 可以通过做练习题来加深理解\n• 如果有具体不理解的地方，可以告诉我，我会针对性地解释\n\n💡 发送"出题"可以获取相关练习题来巩固知识。`;
        setTimeout(() => collapseAiLogPanel(), 3000);
        return { type: 'ai', text: expanded, canSaveError: false, originalQuestion: cleanQ.trim() };
    }

    // ========== Quiz Mode: 检查用户是否在回答题目 ==========
    if (currentQuiz && !detectCommand(q, cleanQ)) {
        const input = cleanQ.trim();
        // 排除命令类输入
        const isCmd = /切换|退出|打开|关闭|计算器|绘图板|指南|设置|错题|笔记/.test(input);
        if (!isCmd && input.length > 0) {
            const isCorrect = checkQuizAnswer(input);
            const quizInfo = { ...currentQuiz };
            currentQuiz = null; // 清除当前题目
            if (isCorrect) {
                dailyQuestionAnswered = true;
                quizCorrectCount++;
                quizTotalCount++;
                consecutiveCorrectCount++;
                learningProgress = Math.min(100, Math.round((quizCorrectCount / Math.max(1, quizTotalCount)) * 100));
                lastAnswerTopic = quizInfo.question.substring(0, 30);
                aiLog('Quiz检查', '回答正确！');
                // Award XP for correct answer
                if (typeof LevelSystem !== 'undefined') {
                    LevelSystem.addXP('correctAnswer', LevelSystem.xpRewards.correctAnswer, '答对题目');
                }
                setTimeout(() => collapseAiLogPanel(), 3000);
                var streakMsg = getStreakEncouragement(consecutiveCorrectCount);
                var correctMsg = '太棒了！🎉 你答对了！\n\n你的回答很棒！继续保持！';
                if (consecutiveCorrectCount >= 3) {
                    correctMsg = '太棒了！🎉 你答对了！\n\n✅ 当前连续答对 **' + consecutiveCorrectCount + '** 题！';
                }
                var topicSuggestions = suggestRelatedTopics(quizInfo.subject || lastSubject, lastAnswerTopic);
                var topicChips = renderTopicChips(topicSuggestions);
                return { type: 'ai', text: correctMsg + streakMsg + '\n\n📊 学习进度：' + renderProgressBar(learningProgress) + ' ' + learningProgress + '%（正确 ' + quizCorrectCount + '/' + quizTotalCount + '）' + topicChips + '\n\n💡 要继续练习吗？发送"出题"获取下一道题。', canSaveError: false, originalQuestion: question || '' };
            } else {
                quizTotalCount++;
                consecutiveCorrectCount = 0;
                learningProgress = Math.min(100, Math.round((quizCorrectCount / Math.max(1, quizTotalCount)) * 100));
                lastAnswerTopic = quizInfo.question.substring(0, 30);
                aiLog('Quiz检查', '回答错误，加入错题本');
                // Award XP for wrong answer (participation)
                if (typeof LevelSystem !== 'undefined') {
                    LevelSystem.addXP('wrongAnswer', LevelSystem.xpRewards.wrongAnswer, '答错题目');
                }
                const subjectId = quizInfo.subject || state.currentSubject || 'math';
                addErrorToBook(subjectId, quizInfo.question, input, quizInfo.answer);
                setTimeout(() => collapseAiLogPanel(), 3000);
                var wrongMsg = '没关系，这次错了没关系 💪\n\n你的回答：' + input + '\n正确答案：**' + quizInfo.answer + '**\n\n📌 **解析**：这道题考查的是「' + lastAnswerTopic.substring(0, 20) + '」相关知识点，建议复习一下这个部分。';
                return { type: 'ai', text: wrongMsg + '\n\n📊 学习进度：' + renderProgressBar(learningProgress) + ' ' + learningProgress + '%（正确 ' + quizCorrectCount + '/' + quizTotalCount + '）\n\n💡 这道题已自动加入错题本，请复习巩固。\n\n要继续练习吗？发送"出题"获取下一道题。', canSaveError: false, originalQuestion: question || '' };
            }
        }
    }

    // ========== 全局命令 ==========
    if (q.includes('退出') && (q.includes('科目') || q.includes('项目') || cleanQ === '退出' || cleanQ === '退出当前')) {
        aiLog('识别命令', '退出当前科目/项目');
        currentQuiz = null;
        setTimeout(() => collapseAiLogPanel(), 3000);
        if (state.currentSubject) {
            setTimeout(() => { selectSubject(state.currentSubject); }, 100);
            return { type: 'ai', text: `✅ **退出成功**\n\n已退出当前${state.role === 'student' ? '科目' : '项目'}，进入通用AI对话模式。`, canSaveError: false, originalQuestion: question || '' };
        }
        return { type: 'ai', text: `当前没有选择任何${state.role === 'student' ? '科目' : '项目'}。`, canSaveError: false, originalQuestion: question || '' };
    }

    // 咨询类自动路由
    const consultKeywords = { '法律': 'law', '法律科普': 'law', '劳动法': 'law', '合同法': 'law', '消费者': 'law', '维权': 'law', '侵权': 'law', '心理': 'mental', '心理咨询': 'mental', '情绪': 'mental', '压力': 'mental', '焦虑': 'mental', '抑郁': 'mental', '功能': 'funcounsel', '怎么用': 'funcounsel', '使用方法': 'funcounsel' };
    for (const [keyword, targetId] of Object.entries(consultKeywords)) {
        if (q.includes(keyword)) {
            aiLog('识别咨询', `路由到「${keyword}」`);
            currentQuiz = null;
            setTimeout(() => collapseAiLogPanel(), 3000);
            setTimeout(() => { selectSubject(targetId); }, 100);
            const nameMap = { law: '法律', mental: '心理', funcounsel: '功能' };
            return { type: 'ai', text: `✅ 已为你切换到「${nameMap[targetId] || keyword}」咨询模式。\n\n现在可以直接提问了！`, canSaveError: false, originalQuestion: question || '' };
        }
    }

    // 切换命令
    const switchMatch = cleanQ.match(/切换\s*(.+)/);
    const directMatch = !switchMatch ? cleanQ.trim() : null;
    const targetName = switchMatch ? switchMatch[1].trim() : directMatch;
    if (targetName && (switchMatch || targetName.length <= 6)) {
        if (targetName.includes('工作者') || targetName.includes('学生') || targetName.includes('角色')) {
            aiLog('识别命令', '角色切换（引导至侧边栏）');
            setTimeout(() => collapseAiLogPanel(), 3000);
            return { type: 'ai', text: `💡 **提示**\n\n请使用侧边栏的「切换角色」按钮来切换学生/工作者模式。`, canSaveError: false, originalQuestion: question || '' };
        }
        const nameToId = { '数学': 'math', '英语': 'english', '语文': 'chinese', '物理': 'physics', '化学': 'chemistry', '生物': 'biology', '历史': 'history', '政治': 'politics', '地理': 'geography', '法律咨询': 'law', '法律': 'law', '心理咨询': 'mental', '心理': 'mental', '心理健康': 'mental', '功能咨询': 'funcounsel', '功能': 'funcounsel', '编程': 'programming', '音乐': 'music', '美术': 'art', '体育': 'pe', '信息技术': 'it' };
        const targetId = nameToId[targetName];
        if (targetId) {
            aiLog('识别命令', `切换到「${targetName}」`);
            currentQuiz = null;
            setTimeout(() => collapseAiLogPanel(), 3000);
            setTimeout(() => { selectSubject(targetId); }, 100);
            return { type: 'ai', text: `✅ **${state.role === 'student' ? '科目' : '项目'}切换**\n\n已为你切换到「${targetName}」，现在可以直接提问了！`, canSaveError: false, originalQuestion: question || '' };
        }
    }

    // 页面/功能切换
    if (q.includes('打开错题') || q.includes('错题本') || q.includes('打开错题本')) { aiLog('执行操作', '打开错题本'); switchPage('errors'); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: `✅ 已为你打开错题本。`, canSaveError: false, originalQuestion: question || '' }; }
    if (q.includes('打开笔记') || q.includes('记事本') || q.includes('打开记事本')) { aiLog('执行操作', '打开记事本'); switchPage('notepad'); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: `✅ 已为你打开记事本。`, canSaveError: false, originalQuestion: question || '' }; }
    if (q.includes('打开设置') || q.includes('设置页面') || (q.includes('设置') && q.length <= 6)) { aiLog('执行操作', '打开设置'); switchPage('settings'); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: `✅ 已为你打开设置页面。`, canSaveError: false, originalQuestion: question || '' }; }

    // 便捷工具
    if (q.includes('计算器') || q.includes('打开计算器')) { aiLog('执行操作', '打开计算器'); if (typeof openCalculator === 'function') openCalculator(); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: `✅ 已为你打开计算器。`, canSaveError: false, originalQuestion: question || '' }; }
    if (q.includes('绘图板') || q.includes('画板') || q.includes('打开绘图板')) { aiLog('执行操作', '打开绘图板'); if (typeof openDrawingBoard === 'function') openDrawingBoard(); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: `✅ 已为你打开绘图板。`, canSaveError: false, originalQuestion: question || '' }; }
    if (q.includes('操作指南') || q.includes('使用说明') || q.includes('帮助')) { aiLog('执行操作', '打开操作指南'); if (typeof openGuideModal === 'function') openGuideModal(); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: `✅ 已为你打开操作指南。`, canSaveError: false, originalQuestion: question || '' }; }

    // ========== 命令检测与路由 ==========
    const cmd = detectCommand(q, cleanQ);
    if (cmd && cmd.type === 'show_preferences') { aiLog('执行操作', '显示偏好'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleShowPreferences(); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'add_preference') { aiLog('执行操作', '添加偏好'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleAddPreference(cmd.payload); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'remove_preference') { aiLog('执行操作', '删除偏好'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleRemovePreference(cmd.payload); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'toggle_preference') { aiLog('执行操作', '切换偏好'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleTogglePreference(cmd.payload); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'clear_preferences') { aiLog('执行操作', '清除偏好'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleClearAllPreferences(); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'translate') { const res = handleTranslate(cmd.corrected || cleanQ); if (res) { aiLog('直接回答', '翻译'); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; } }
    if (cmd && cmd.type === 'pronounce') { const res = handlePronounce(cmd.corrected || cleanQ); if (res) { aiLog('直接回答', '发音'); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; } }
    if (cmd && cmd.type === 'define') { const res = handleDefine(cmd.corrected || cleanQ); if (res) { aiLog('直接回答', '定义'); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; } }
    if (cmd && cmd.type === 'generate_problem') { aiLog('执行操作', '生成练习题'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleGenerateProblem(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'daily_question') { aiLog('执行操作', '每日一题'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleDailyQuestion(); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'study_plan') { aiLog('执行操作', '学习计划'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleStudyPlan(); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'write_file') { aiLog('执行操作', '生成文件'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleWriteFile(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'calculate') { const res = quickCalculate(cmd.corrected || cleanQ); if (res) { aiLog('直接回答', '计算'); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: `⚡ **快速计算**\n\n${res}\n\n💡 运算优先级：括号 > 乘除 > 加减`, canSaveError: false, originalQuestion: question || '' }; } }
    if (cmd && cmd.type === 'implement') { aiLog('执行操作', '实现指导'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleImplement(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'solve') { aiLog('执行操作', '问题解决'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleSolve(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'code') { aiLog('执行操作', '代码生成'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleCode(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    // 新增命令路由：总结、对比、举例、思维导图、复习、公式
    if (cmd && cmd.type === 'summarize') { aiLog('执行操作', '知识点总结'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleSummarize(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'compare') { aiLog('执行操作', '对比分析'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleCompare(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'example') { aiLog('执行操作', '举例说明'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleExample(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'mindmap') { aiLog('执行操作', '思维导图'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleMindmap(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'review') { aiLog('执行操作', '复习自测'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleReview(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'formulas') { aiLog('执行操作', '公式大全'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleFormulas(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    // v3.1.0: 新增命令路由
    if (cmd && cmd.type === 'review_last') { aiLog('执行操作', '复习上次'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleReviewLast(); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'different_example') { aiLog('执行操作', '换个例子'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleDifferentExample(); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'simpler') { aiLog('执行操作', '简单点'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleSimpler(); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'more_detailed') { aiLog('执行操作', '详细点'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleMoreDetailed(); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'visual_explain') { aiLog('执行操作', '用图解释'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleVisualExplain(); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    // v3.2.0: 新增命令路由处理
    if (cmd && cmd.type === 'summarize_points') { aiLog('执行操作', '总结要点'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleSummarizePoints(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'compare_diff') { aiLog('执行操作', '对比区别'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleCompareDiff(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'give_3_examples') { aiLog('执行操作', '举3个例子'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleGive3Examples(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'table_format') { aiLog('执行操作', '用表格整理'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleTableFormat(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'draw_explain') { aiLog('执行操作', '画图说明'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleDrawExplain(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'simple_explain') { aiLog('执行操作', '用简单的话解释'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleSimpleExplain(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    // 新命令路由：画图表、编题、划重点、做规划
    if (cmd && cmd.type === 'draw_chart') { aiLog('执行操作', '画图表'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleDrawChart(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'similar_problem') { aiLog('执行操作', '编一道类似题'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleSimilarProblem(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'highlight') { aiLog('执行操作', '划重点'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleHighlight(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }
    if (cmd && cmd.type === 'make_plan') { aiLog('执行操作', '做规划'); setTimeout(() => collapseAiLogPanel(), 3000); const res = handleMakePlan(cmd.corrected || cleanQ); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; }

    // 功能咨询
    if (state.currentSubject && state.currentSubject.id === 'funcounsel') {
        if (typeof handleFuncounsel === 'function') {
            return handleFuncounsel(question);
        }
    }

    // ========== 歧义检测（命令检测之后执行） ==========
    if (cleanQ && cleanQ.trim()) {
        var ambiguities = detectAmbiguity(cleanQ.trim());
        if (ambiguities.length > 0) {
            aiLog('歧义检测', '检测到' + ambiguities.length + '个歧义');
            var ambiguityMsg = ambiguities.map(function(a) { return '❓ ' + a.message; }).join('\n');
            setTimeout(() => collapseAiLogPanel(), 3000);
            return {
                type: 'ai',
                text: '🤔 **问题不够明确**\n\n' + ambiguityMsg + '\n\n💡 请提供更多信息，我会更好地帮助你！',
                canSaveError: false,
                originalQuestion: question || ''
            };
        }
    }

    // ========== 简单问答 ==========
    // ========== v3.1.0 情感智能系统 ==========
    // 检测用户挫折情绪
    if (detectFrustration(cleanQ)) {
        aiLog('情绪感知', '检测到用户感到沮丧');
        userEmotionState = 'frustrated';
        emotionHistory.push({ emotion: 'frustrated', time: Date.now(), question: cleanQ });
        var empathy = getEmpathyResponse(cleanQ, lastAnswerTopic);
        var breakSuggestion = '';
        if (emotionHistory.filter(function(e) { return e.emotion === 'frustrated'; }).length >= 2) {
            breakSuggestion = getBreakSuggestion();
        }
        setTimeout(() => collapseAiLogPanel(), 3000);
        return { type: 'ai', text: empathy + breakSuggestion, canSaveError: false, originalQuestion: question || '' };
    }

    // 检测用户兴奋/成就感
    if (detectExcitement(cleanQ)) {
        aiLog('情绪感知', '检测到用户感到兴奋/有成就感');
        userEmotionState = 'excited';
        emotionHistory.push({ emotion: 'excited', time: Date.now(), question: cleanQ });
        var celebration = getCelebrationResponse();
        setTimeout(() => collapseAiLogPanel(), 3000);
        return { type: 'ai', text: celebration, canSaveError: false, originalQuestion: question || '' };
    }

    // ========== 智能追问系统：检测短消息追问 ==========
    var smartFollowUps = ['为什么', '怎么算', '详解', '再解释', '听不懂', '然后呢', '还有呢', '怎么做', '详细', '具体', '展开', '深入'];
    var trimmedQ = cleanQ.trim();
    if (trimmedQ.length <= 4 && lastAIResponseFull) {
        var isSmartFollowUp = false;
        for (var sfi = 0; sfi < smartFollowUps.length; sfi++) {
            if (trimmedQ === smartFollowUps[sfi] || trimmedQ.includes(smartFollowUps[sfi])) {
                isSmartFollowUp = true;
                break;
            }
        }
        if (isSmartFollowUp) {
            aiLog('智能追问', '用户追问："' + trimmedQ + '"');
            var detailedResponse = '📖 **详细解释**\n\n';
            if (lastAnswerTopic) {
                detailedResponse += '关于「' + lastAnswerTopic + '」的更详细说明：\n\n';
            }
            detailedResponse += '让我从更基础的角度来解释这个问题：\n\n';
            detailedResponse += '1. **基本概念**：先理解最核心的定义和原理\n';
            detailedResponse += '2. **关键要点**：掌握最重要的几个知识点\n';
            detailedResponse += '3. **常见误区**：注意容易出错的地方\n';
            detailedResponse += '4. **实际应用**：通过例子加深理解\n\n';
            if (lastAIResponseFull.length > 100) {
                detailedResponse += '---\n\n**补充说明**：\n';
                detailedResponse += lastAIResponseFull.substring(0, 300) + '\n\n';
            }
            detailedResponse += '💡 如果还有不清楚的地方，请告诉我具体哪里不明白！';
            setTimeout(() => collapseAiLogPanel(), 3000);
            return { type: 'ai', text: detailedResponse, canSaveError: false, originalQuestion: question || '' };
        }
    }

    const simpleType = isSimpleQuestion(q, cleanQ);
    if (simpleType) { const res = handleSimple(simpleType, q, cleanQ); if (res) { aiLog('直接回答', simpleType); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: res, canSaveError: false, originalQuestion: question || '' }; } }

    // ========== 深度上下文理解 ==========
    const intent = analyzeUserIntent(q, cleanQ, subjectName);
    if (intent) {
        const lastAiMsg = aiConversationContext.filter(c => c.role === 'ai').pop();
        const intentRes = handleIntent(intent, lastAiMsg ? lastAiMsg.text : '');
        if (intentRes) {
            aiLog('意图识别', `用户意图：${intent}`);
            setTimeout(() => collapseAiLogPanel(), 3000);
            return { type: 'ai', text: intentRes, canSaveError: false, originalQuestion: question || '' };
        }
    }

    // ========== 联网搜索 ==========
    let searchResult = null;
    // 基础学科问题直接跳过网络搜索，加快响应速度
    const basicSubjects = ['数学', '语文', '英语'];
    const isBasicSubject = basicSubjects.includes(subjectName);
    const needsWebSearch = /最新|新闻|实时|当前|今天.*发生|202[5-9]|时事|热点/.test(cleanQ);
    if (state.settings && state.settings.webSearch && !isBasicSubject && needsWebSearch) {
        aiLog('联网搜索', '检查是否需要搜索...');
        const isSimpleMath = /^[\d\s\(\)+\-*/÷×.]+$/.test(cleanQ.trim());
        if (cleanQ.length > 5 && !isSimpleMath) {
            searchResult = await performWebSearch(cleanQ);
            if (searchResult) aiLog('联网搜索', '已获取结果');
            else aiLog('联网搜索', '使用本地知识回答');
        }
    } else if (isBasicSubject) {
        aiLog('联网搜索', '基础学科问题，跳过网络搜索');
    }

    // ========== 已选择科目：路由到小AI ==========
    const aiOnlyIds = ['law', 'mental', 'funcounsel'];
    if (subject) {
        const aiName = aiOnlyIds.includes(subject) ? '咨询小AI' : state.role === 'worker' ? '工作者小AI' : `${subjectName}小AI`;
        aiLog('路由到小AI', `${aiName}（已选择${subjectName}）`);
        let response = '';
        if (state.role === 'student' || aiOnlyIds.includes(subject)) response = generateStudentResponse(question, subjectName, image);
        else response = generateWorkerResponse(question, subjectName, image);
        if (searchResult) response += '\n\n' + searchResult;
        // 应用回复结构模板：定义/概念 → 公式/原理 → 步骤/过程 → 总结
        response = applyResponseStructure(response, subjectName, analysis || {});
        // 增强格式化输出
        response = formatResponseEnhanced(response, subjectName);
        aiLog('小AI返回', '回答已生成');
        setTimeout(() => collapseAiLogPanel(), 3000);
        lastSubject = subjectName; lastTopic = cleanQ;
        return { type: 'ai', text: response, canSaveError: state.role === 'student' && !aiOnlyIds.includes(subject), originalQuestion: question || (image ? '[图片题目]' : '') };
    }

    // ========== 上下文感知：跟进问题 ==========
    if (isFollowUp(q, cleanQ) && (lastSubject || aiConversationContext.length >= 2)) {
        const prevSubject = lastSubject;
        const lastUserQ = aiConversationContext.filter(c => c.role === 'user').pop();
        aiLog('上下文感知', `跟进问题，继承主题：${prevSubject || '通用'}`);
        if (prevSubject && typeof generateStudentResponse === 'function') {
            const prevSubjectIdMap = { '数学': 'math', '英语': 'english', '语文': 'chinese', '物理': 'physics', '化学': 'chemistry', '生物': 'biology', '历史': 'history', '政治': 'politics', '地理': 'geography', '法律咨询': 'law', '心理咨询': 'mental', '编程': 'programming', '音乐': 'music', '美术': 'art', '体育': 'pe', '信息技术': 'it' };
            const prevId = prevSubjectIdMap[prevSubject];
            if (prevId) {
                const prevState = state.currentSubject; state.currentSubject = prevId;
                let response = generateStudentResponse(question, prevSubject, image);
                state.currentSubject = prevState;
                if (searchResult) response += '\n\n' + searchResult;
                setTimeout(() => collapseAiLogPanel(), 3000);
                return { type: 'ai', text: response, canSaveError: false, originalQuestion: question || '' };
            }
        }
        if (lastUserQ) { setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: `💡 **继续讨论**\n\n基于我们刚才讨论的「${lastUserQ.text.substring(0, 40)}...」：\n\n我会继续为你解答。如果解释不够清楚，可以指出具体哪里不懂。`, canSaveError: false, originalQuestion: question || '' }; }
    }

    // ========== 未选择科目：自动识别 ==========
    aiLog('自动识别', '分析问题内容...');
    const detectFn = typeof detectSubjectFromQuestion === 'function' ? detectSubjectFromQuestion : _detectSubjectInline;
    const detected = detectFn(cleanQ);
    if (detected) {
        const subjectMap = { math: '数学', english: '英语', chinese: '语文', physics: '物理', chemistry: '化学', biology: '生物', history: '历史', politics: '政治', geography: '地理', law: '法律', mental: '心理' };
        const detectedName = subjectMap[detected] || detected;
        aiLog('识别结果', `问题属于「${detectedName}」`);
        aiLog('调用小AI', `${detectedName}小AI处理问题`);
        const prevSubject = state.currentSubject; state.currentSubject = detected;
        let response = generateStudentResponse(question, detectedName, image);
        state.currentSubject = prevSubject;
        if (searchResult) response += '\n\n' + searchResult;
        aiLog('小AI返回', '回答已生成');
        setTimeout(() => collapseAiLogPanel(), 3000);
        lastSubject = detectedName; lastTopic = cleanQ;
        return { type: 'ai', text: response, canSaveError: false, originalQuestion: question || (image ? '[图片题目]' : '') };
    }

    // ========== 智能回退 ==========
    const generalRes = tryGeneralKnowledge(q, cleanQ, searchResult);
    if (generalRes) { aiLog('直接回答', '通用知识'); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: generalRes, canSaveError: false, originalQuestion: question || '' }; }

    aiLog('识别结果', '无法确定问题类型');
    aiLog('智能回退', '尝试直接回答');

    // 智能回退：尝试更努力地直接回答
    const smartFallback = trySmartFallback(cleanQ);
    if (smartFallback) { aiLog('直接回答', '智能回退成功'); setTimeout(() => collapseAiLogPanel(), 3000); return { type: 'ai', text: smartFallback, canSaveError: false, originalQuestion: question || '' }; }

    aiLog('返回帮助', '显示功能列表');
    setTimeout(() => collapseAiLogPanel(), 3000);

    // v3.1.0: 改进的错误处理 - 提供具体引导
    var smartClarification = getSmartClarification(cleanQ);
    var didYouMean = getDidYouMeanSuggestions(cleanQ);
    var didYouMeanHtml = renderDidYouMean(didYouMean);

    // 当网络搜索失败时，给出友好的离线提示
    var offlineHint = '';
    if (state.settings && state.settings.webSearch && !searchResult && /最新|新闻|实时|当前|202[5-9]/.test(cleanQ)) {
        offlineHint = '\n\n📡 **联网搜索提示**\n\n当前网络搜索暂时不可用，我已切换到本地知识模式为你解答。如需最新信息，请稍后再试。\n\n';
    }

    return {
        type: 'ai',
        text: `🤔 **关于「${cleanQ.substring(0, 50)}${cleanQ.length > 50 ? '...' : ''}」**

${smartClarification}${offlineHint}

能再详细描述一下你的问题吗？比如：
• 具体的题目内容是什么
• 涉及哪个知识点
• 你希望我怎么帮你（解释、举例、出题等）

💡 **我可以帮你**：
• 🧮 **数学**：解方程、算几何、做应用题
• 📖 **英语**：查单词、学语法、做翻译
• 📝 **语文**：背古诗、读文言文、写作文
• 🔭 **物理**：力学、电学、光学、热学
• ⚗️ **化学**：元素、方程式、酸碱盐、有机
• 🧬 **生物**：细胞、遗传、生态系统、人体
• 🏛️ **历史**：朝代、事件、人物、世界史
• ⚖️ **政治**：政治制度、核心价值观、经济常识
• ⚖️ **法律**：劳动法、消费者权益、合同法
• 💚 **心理**：情绪管理、压力缓解、人际关系` + didYouMeanHtml,
        canSaveError: false, originalQuestion: question || ''
    };
}

// ========== 回复结构模板与格式化增强 ==========

// 应用回复结构模板：先给出核心答案，再展开解释
function applyResponseStructure(response, subjectName, analysis) {
    if (!response || response.length < 200) return response;
    // 如果已经包含结构化标记，不再处理
    if (/📌\s*核心答案|💡\s*核心概念|🎯\s*答案/.test(response)) return response;

    var lines = response.split('\n');
    var coreAnswer = '';
    var explanation = '';
    var summary = '';
    var hasFoundCore = false;

    // 尝试提取核心答案（通常在前3行或包含"答案"、"结论"的行）
    for (var i = 0; i < Math.min(lines.length, 5); i++) {
        if (/答案[:：]|结论[:：]|结果[:：]|是\s*[:：]|等于|因此|所以/.test(lines[i]) && lines[i].length > 5) {
            coreAnswer = lines[i].trim();
            hasFoundCore = true;
            break;
        }
    }

    // 如果没找到明确的核心答案，取第一行非空行
    if (!hasFoundCore) {
        for (var j = 0; j < lines.length; j++) {
            if (lines[j].trim().length > 10 && !lines[j].trim().startsWith('•') && !lines[j].trim().startsWith('-')) {
                coreAnswer = lines[j].trim();
                hasFoundCore = true;
                break;
            }
        }
    }

    // 根据学科和意图构建结构化回复
    var structuredResponse = '';
    var subject = subjectName || (analysis && analysis.subjectHint) || '';
    var intent = (analysis && analysis.intent) || '';

    // 核心答案部分
    if (hasFoundCore && coreAnswer) {
        if (subject === '数学' || intent === '求答案') {
            structuredResponse += '🎯 **核心答案**\n\n' + coreAnswer + '\n\n---\n\n';
        } else if (subject === '语文' || intent === '求概念') {
            structuredResponse += '📌 **核心概念**\n\n' + coreAnswer + '\n\n---\n\n';
        } else if (subject === '英语') {
            structuredResponse += '💬 **要点提炼**\n\n' + coreAnswer + '\n\n---\n\n';
        } else {
            structuredResponse += '💡 **核心要点**\n\n' + coreAnswer + '\n\n---\n\n';
        }
    }

    // 详细解释部分
    var detailStart = response.indexOf(coreAnswer) + coreAnswer.length;
    if (detailStart > 0 && detailStart < response.length) {
        explanation = response.substring(detailStart).trim();
    } else {
        explanation = response;
    }

    if (explanation.length > 50) {
        structuredResponse += '📖 **详细解释**\n\n' + explanation;
    }

    // 添加总结（如果回复较长）
    if (response.length > 400) {
        structuredResponse += '\n\n---\n\n✅ **总结**\n\n';
        if (subject === '数学') {
            structuredResponse += '• 先明确已知条件和所求目标\n• 选择合适的公式或方法\n• 逐步计算，注意单位和符号\n• 最后验证结果的合理性';
        } else if (subject === '物理') {
            structuredResponse += '• 理解物理情景和过程\n• 确定适用的物理定律\n• 建立模型，列出方程\n• 代入数据，验证结果';
        } else if (subject === '化学') {
            structuredResponse += '• 明确反应物和反应类型\n• 书写配平的化学方程式\n• 根据方程式进行计算\n• 检查单位和化学意义';
        } else if (subject === '英语') {
            structuredResponse += '• 把握句子整体结构和语境\n• 识别核心语法考点\n• 注意时态、语态和搭配\n• 通读检查一致性';
        } else if (subject === '语文') {
            structuredResponse += '• 细读文本，提取关键信息\n• 联系背景和文学常识\n• 按规范结构组织答案\n• 确保要点全面、语言准确';
        } else {
            structuredResponse += '• 理解核心概念和原理\n• 掌握关键步骤和方法\n• 通过练习巩固知识\n• 遇到问题及时追问';
        }
    }

    return structuredResponse || response;
}

// 增强格式化输出：美化数学公式、增强代码块/表格/列表渲染、添加重点标注
function formatResponseEnhanced(response, subjectName) {
    if (!response) return response;

    // 1. 美化数学公式
    // 将简单公式如 a^2 + b^2 = c^2 美化，支持 Y=X^2+4X+4 格式
    response = response.replace(/(\w)\^(\d+)/g, '$1<sup>$2</sup>');
    response = response.replace(/(\w)\^\(([^)]+)\)/g, '$1<sup>$2</sup>');
    // 增强：匹配 Y=X2+4X+4 这类隐式上标（字母后跟数字）
    response = response.replace(/([a-zA-Z])(\d+)(?![\d])/g, function(match, letter, num) {
        // 避免替换已有HTML标签内的内容
        if (match.indexOf('<') !== -1) return match;
        return letter + '<sup>' + num + '</sup>';
    });
    // 增强：匹配中文语境下的平方、立方等
    response = response.replace(/([a-zA-Z])²/g, '$1<sup>2</sup>');
    response = response.replace(/([a-zA-Z])³/g, '$1<sup>3</sup>');
    response = response.replace(/(\d+)²/g, '$1<sup>2</sup>');
    response = response.replace(/(\d+)³/g, '$1<sup>3</sup>');
    // 美化分数表示 如 1/2
    response = response.replace(/(\d+)\/(\d+)(?![\d\/])/g, '<sup>$1</sup>&frasl;<sub>$2</sub>');
    // 美化根号
    response = response.replace(/√(\w+|\d+|\([^)]+\))/g, '&#8730;$1');
    response = response.replace(/sqrt\(([^)]+)\)/g, '&#8730;($1)');
    // 美化希腊字母常用表示
    var greekMap = {
        'α': '&alpha;', 'β': '&beta;', 'γ': '&gamma;', 'δ': '&delta;', 'ε': '&epsilon;',
        'θ': '&theta;', 'λ': '&lambda;', 'μ': '&mu;', 'π': '&pi;', 'σ': '&sigma;',
        'τ': '&tau;', 'φ': '&phi;', 'ω': '&omega;', 'Δ': '&Delta;', 'Σ': '&Sigma;',
        'Ω': '&Omega;'
    };
    for (var greek in greekMap) {
        var regex = new RegExp(greek, 'g');
        response = response.replace(regex, greekMap[greek]);
    }

    // 2. 增强代码块渲染（添加语言标签高亮提示）
    response = response.replace(/```(\w+)?\n/g, function(match, lang) {
        var language = lang || 'code';
        var langEmoji = { 'python': '🐍', 'javascript': '⚡', 'js': '⚡', 'html': '🌐', 'css': '🎨', 'java': '☕', 'cpp': '🔷', 'c': '🔷', 'sql': '📊', 'json': '📋' };
        var emoji = langEmoji[language] || '💻';
        return '```' + language + '\n' + emoji + ' **' + language.toUpperCase() + '**\n';
    });

    // 3. 增强表格渲染（为表格添加表头分隔提示）
    response = response.replace(/(\|[^\n]+\|\n)(\|[-:\s|]+\|)/g, function(match, header, separator) {
        return header + separator + '  <!-- 表格 -->';
    });

    // 4. 添加重点标注（用 emoji 标记关键信息）
    // 标注重要定义
    response = response.replace(/(定义[:：]|概念[:：]|定理[:：]|定律[:：]|公式[:：])/g, '📌 $1');
    // 标注注意和警告
    response = response.replace(/(注意[:：]|警告[:：]|⚠️|❗|重要[:：])/g, '⚠️ $1');
    // 标注提示
    response = response.replace(/(提示[:：]|💡|建议[:：])/g, '💡 $1');
    // 标注关键步骤
    response = response.replace(/(步骤\s*\d+[:：]|第\s*\d+\s*步[:：])/g, '🔹 $1');
    // 标注易错点
    response = response.replace(/(易错[:：]|误区[:：]|常见错误[:：])/g, '❌ $1');
    // 标注例子
    response = response.replace(/(例\s*\d+[:：]|例题[:：]|例如[:：]|比如[:：])/g, '📝 $1');

    // 5. 增强列表渲染（支持自动编号、层次缩进）
    // 将 "1. xxx" / "1、xxx" 统一为带编号格式
    response = response.replace(/^(\d+)[\.、]\s+/gm, function(match, num) {
        var numEmojis = ['', '❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽', '❾', '❿'];
        return (numEmojis[parseInt(num)] || num + '.') + ' ';
    });
    // 处理层次缩进：行首带空格或制表符的列表项，统一缩进显示
    response = response.replace(/^(\s{2,4})[-•]\s+/gm, '    └ ');
    response = response.replace(/^(\s{2,4})[\d]+[\.、]\s+/gm, '    ├ ');
    // 处理多级缩进（4空格/8空格等）
    response = response.replace(/^(\s{8,})[-•]\s+/gm, '        └ ');
    response = response.replace(/^(\s{8,})[\d]+[\.、]\s+/gm, '        ├ ');

    // 6. 优化段落间距
    // 确保段落间有空行（连续两个换行）
    response = response.replace(/\n{3,}/g, '\n\n');
    // 在标题前后增加空行
    response = response.replace(/([^\n])\n(#{1,3}\s)/g, '$1\n\n$2');
    response = response.replace(/(#{1,3}\s[^\n]+)\n([^\n])/g, '$1\n\n$2');
    // 在emoji标题（如 📌 **xxx**）前后增加空行
    response = response.replace(/([^\n])\n([\u{1F300}-\u{1F9FF}]+\s*\*\*)/gu, '$1\n\n$2');
    response = response.replace(/([\u{1F300}-\u{1F9FF}]+\s*\*\*[^*]+\*\*)\n([^\n\u{1F300}-\u{1F9FF}])/gu, '$1\n\n$2');

    // 7. 分割线美化
    // 将 "---" 替换为更美观的分割线
    response = response.replace(/^---$/gm, '━━━━━━━━━━━━━━━━━━━━');
    response = response.replace(/^─{3,}$/gm, '━━━━━━━━━━━━━━━━━━━━');

    // 8. 引用格式（blockquote风格）
    // 将以 ">" 开头的行转换为引用格式
    response = response.replace(/^>\s*(.+)$/gm, '> 💬 `$1`');
    // 转换 "引文："、"原文："、"引用：" 开头的行
    response = response.replace(/^(引文[:：]|原文[:：]|引用[:：]|名言[:：])\s*(.+)$/gm, '> 📖 **$1** $2');

    return response;
}

// ========== Quick Tools Compact CSS ==========
(function injectQuickToolsCSS() {
    const style = document.createElement('style');
    style.id = 'quick-tools-compact';
    style.textContent = `
        .quick-tools { display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px !important; }
        .quick-tools .tool-btn {
            width: 32px !important; height: 32px !important; padding: 0 !important;
            border-radius: 6px !important; font-size: 14px !important;
            display: flex !important; align-items: center !important; justify-content: center !important;
            position: relative; overflow: hidden; border: none !important;
            background: rgba(255,255,255,0.08) !important; color: inherit !important;
            cursor: pointer; transition: all 0.2s;
        }
        .quick-tools .tool-btn:hover { background: rgba(255,255,255,0.18) !important; transform: scale(1.1); }
        .quick-tools .tool-btn .btn-text { display: none; }
        .quick-tools .tool-btn::after {
            content: attr(data-tooltip); position: absolute; bottom: 110%; left: 50%;
            transform: translateX(-50%); background: #333; color: #fff; padding: 3px 8px;
            border-radius: 4px; font-size: 12px; white-space: nowrap; opacity: 0;
            pointer-events: none; transition: opacity 0.2s; z-index: 100;
        }
        .quick-tools .tool-btn:hover::after { opacity: 1; }
    `;
    const existing = document.getElementById('quick-tools-compact');
    if (!existing) document.head.appendChild(style);
})();
