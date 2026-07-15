// 测试页面脚本

// 题目数据
const questions = [
    {
        id: 1,
        text: "在社交场合中，您通常：",
        description: "选择最符合您日常行为的选项",
        options: [
            {
                label: "主动与陌生人交谈",
                description: "享受结识新朋友，乐于与人交流",
                dimension: "E"
            },
            {
                label: "更愿意观察环境",
                description: "倾向于保持沉默，观察后再参与",
                dimension: "I"
            }
        ]
    },
    {
        id: 2,
        text: "在工作中，您更重视：",
        description: "选择更符合您工作偏好的选项",
        options: [
            {
                label: "具体的事实和数据",
                description: "关注细节，信赖实际经验",
                dimension: "S"
            },
            {
                label: "可能性和潜在机会",
                description: "重视创新思维和未来可能性",
                dimension: "N"
            }
        ]
    },
    {
        id: 3,
        text: "做重要决定时，您主要考虑：",
        description: "选择更符合您决策习惯的选项",
        options: [
            {
                label: "逻辑分析",
                description: "理性思考，基于事实和逻辑",
                dimension: "T"
            },
            {
                label: "情感因素",
                description: "考虑对人的影响和他人的感受",
                dimension: "F"
            }
        ]
    },
    {
        id: 4,
        text: "您更喜欢的生活方式是：",
        description: "选择更符合您生活态度的选项",
        options: [
            {
                label: "有计划和结构",
                description: "喜欢安排好时间，追求确定性",
                dimension: "J"
            },
            {
                label: "灵活和随性",
                description: "喜欢保持选择开放，适应性强",
                dimension: "P"
            }
        ]
    },
    {
        id: 5,
        text: "在团队合作中，您更倾向于：",
        description: "选择更符合您在团队中表现的选项",
        options: [
            {
                label: "积极参与讨论",
                description: "喜欢表达想法，推动讨论进展",
                dimension: "E"
            },
            {
                label: "深入思考后发言",
                description: "更愿意先思考，再提供有价值的意见",
                dimension: "I"
            }
        ]
    },
    {
        id: 6,
        text: "学习新知识时，您更喜欢：",
        description: "选择更符合您学习方式的选项",
        options: [
            {
                label: "逐步深入学习",
                description: "从基础开始，循序渐进地掌握",
                dimension: "S"
            },
            {
                label: "整体把握概念",
                description: "先了解全貌，再深入具体细节",
                dimension: "N"
            }
        ]
    },
    {
        id: 7,
        text: "评价一个想法时，您更看重：",
        description: "选择更符合您评价标准的选项",
        options: [
            {
                label: "逻辑一致性",
                description: "分析是否合理、符合逻辑",
                dimension: "T"
            },
            {
                label: "对人的影响",
                description: "考虑想法对人的积极影响",
                dimension: "F"
            }
        ]
    },
    {
        id: 8,
        text: "面对变化时，您通常：",
        description: "选择更符合您应对变化方式的选项",
        options: [
            {
                label: "制定应对计划",
                description: "喜欢提前准备，控制局面",
                dimension: "J"
            },
            {
                label: "灵活随机应变",
                description: "能够快速适应，即时调整",
                dimension: "P"
            }
        ]
    },
    {
        id: 9,
        text: "在工作中，您最享受：",
        description: "选择更符合您工作乐趣的选项",
        options: [
            {
                label: "与同事协作",
                description: "通过交流合作完成任务",
                dimension: "E"
            },
            {
                label: "独立思考工作",
                description: "专注于自己的思考和创作",
                dimension: "I"
            }
        ]
    },
    {
        id: 10,
        text: "处理复杂问题时，您倾向于：",
        description: "选择更符合您解决问题方式的选项",
        options: [
            {
                label: "分解成具体步骤",
                description: "一步一步解决，重视执行细节",
                dimension: "S"
            },
            {
                label: "寻找创新解决方案",
                description: "寻找突破性思路，重视可能性",
                dimension: "N"
            }
        ]
    }
];

// 全局变量
let currentQuestionIndex = 0;
let answers = {};
let scores = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
};

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    initializeTest();
});

function initializeTest() {
    updateProgress();
    showQuestion();
    updateNavigationButtons();
}

// 显示当前题目
function showQuestion() {
    const container = document.getElementById('questionContainer');
    const question = questions[currentQuestionIndex];
    
    container.innerHTML = `
        <div class="question-number">题目 ${question.id}</div>
        <h2 class="question-text">${question.text}</h2>
        ${question.description ? `<p class="question-description">${question.description}</p>` : ''}
        <div class="options">
            ${question.options.map((option, index) => `
                <div class="option ${answers[question.id - 1] === index ? 'selected' : ''}" 
                     onclick="selectOption(${index})">
                    <div class="option-label">${option.label}</div>
                    <div class="option-description">${option.description}</div>
                    <div class="option-selected">
                        <svg width="12" height="12" viewBox="0 0 12 12" class="check-icon">
                            <path d="M10 3l-6 6-4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 选择选项
function selectOption(optionIndex) {
    const question = questions[currentQuestionIndex];
    const option = question.options[optionIndex];
    
    // 记录答案 - 使用问题ID作为key而不是索引
    answers[currentQuestionIndex] = optionIndex;
    
    // 更新分数
    scores[option.dimension]++;
    
    // 更新UI
    updateQuestionUI();
    
    // 自动进入下一题（除了最后一题）
    if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
            nextQuestion();
        }, 500);
    }
}

// 更新题目UI
function updateQuestionUI() {
    const options = document.querySelectorAll('.option');
    const question = questions[currentQuestionIndex];
    
    options.forEach((option, index) => {
        if (answers[currentQuestionIndex] === index) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// 更新进度
function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const currentQuestionSpan = document.getElementById('currentQuestion');
    const totalQuestionsSpan = document.getElementById('totalQuestions');
    
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    
    currentQuestionSpan.textContent = currentQuestionIndex + 1;
    totalQuestionsSpan.textContent = questions.length;
}

// 更新导航按钮
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // 清除之前的监听器
    prevBtn.onclick = null;
    nextBtn.onclick = null;
    
    // 更新上一题按钮
    prevBtn.disabled = currentQuestionIndex === 0;
    prevBtn.onclick = previousQuestion;
    
    // 如果是最后一题，显示"提交测试"
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.textContent = '提交测试';
        nextBtn.onclick = submitTest;
    } else {
        nextBtn.innerHTML = `下一题
                    <svg width="16" height="16" viewBox="0 0 16 16" class="nav-icon">
                        <path d="M8 4l4 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`;
        nextBtn.onclick = nextQuestion;
    }
}

// 下一题
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        updateProgress();
        showQuestion();
        updateNavigationButtons();
    }
}

// 上一题
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        updateProgress();
        showQuestion();
        updateNavigationButtons();
    }
}

// 提交测试
function submitTest() {
    // 检查是否所有题目都已回答
    const allAnswered = Object.keys(answers).length === questions.length;
    if (!allAnswered) {
        alert('请完成所有题目后再提交测试。');
        return;
    }
    
    console.log('Submitting test, answers:', answers);
    console.log('Scores:', scores);
    
    // 跳转到等待页面
    window.location.href = 'waiting.html';
}

// 计算结果
function calculateResult() {
    const { E, I, S, N, T, F, J, P } = scores;
    
    const first = E > I ? 'E' : 'I';
    const second = S > N ? 'S' : 'N';
    const third = T > F ? 'T' : 'F';
    const fourth = J > P ? 'J' : 'P';
    
    const type = first + second + third + fourth;
    
    // 结果数据库
    const results = {
        'INTJ': {
            name: '建筑师',
            category: '分析家',
            description: '富有想象力和战略性的思想家，一切皆在计划之中。',
            characteristics: '独立自主、战略思维强、追求完美、目标导向',
            careers: '建筑师、工程师、战略规划师、研究员、律师',
            relationships: '重视深度友谊，欣赏志同道合的人',
            dimension: 'analyst'
        },
        'INTP': {
            name: '思想家',
            category: '分析家',
            description: '创新的发明家，对知识有着不懈的渴望。',
            characteristics: '逻辑思维强、独立思考、好奇心旺盛、完美主义',
            careers: '科学家、研究员、程序员、哲学家、理论家',
            relationships: '需要理解和支持，欣赏智力对话',
            dimension: 'analyst'
        },
        'ENTJ': {
            name: '指挥官',
            category: '分析家',
            description: '大胆、富有想象力和意志强烈的领导者，总能完成任务。',
            characteristics: '领导力强、目标明确、决策果断、组织能力佳',
            careers: 'CEO、项目经理、咨询师、律师、军官',
            relationships: '直接有效，重视伙伴关系',
            dimension: 'analyst'
        },
        'ENTP': {
            name: '辩论家',
            category: '分析家',
            description: '聪明好奇的思想家，不会拒绝任何智力挑战。',
            characteristics: '创新思维、适应力强、善于沟通、乐观开朗',
            careers: '企业家、记者、顾问、销售、培训师',
            relationships: '社交能力强，享受智力交锋',
            dimension: 'analyst'
        },
        'INFJ': {
            name: '提倡者',
            category: '外交家',
            description: '安静而神秘，鼓舞人心的理想主义者。',
            characteristics: '富有同情心、洞察力强、价值观坚定、创造力佳',
            careers: '心理咨询师、作家、教育家、社会工作者、艺术家',
            relationships: '深度亲密，重视真诚的连接',
            dimension: 'diplomat'
        },
        'ENFP': {
            name: '竞选者',
            category: '外交家',
            description: '热情、有创造力、善于社交的自由精神。',
            characteristics: '热情洋溢、创造力强、社交能力强、灵活变通',
            careers: '记者、演员、销售、培训师、心理咨询师',
            relationships: '社交广泛，重视人际关系',
            dimension: 'diplomat'
        },
        'ENFJ': {
            name: '主人公',
            category: '外交家',
            description: '有魅力、鼓舞人心的领导者，有能力吸引听众。',
            characteristics: '善于激励他人、组织能力强、富有同情心、沟通力佳',
            careers: '教师、HR、培训师、咨询师、NGO工作者',
            relationships: '重视团队和谐，善于营造氛围',
            dimension: 'diplomat'
        },
        'INFP': {
            name: '调停者',
            category: '外交家',
            description: '诗意、善良、利他的人，总是热心帮助他人。',
            characteristics: '价值观坚定、创造力强、同理心强、追求意义',
            careers: '艺术家、作家、心理咨询师、社工、研究员',
            relationships: '重视深度连接，价值观相似很重要',
            dimension: 'diplomat'
        },
        'ISTJ': {
            name: '物流师',
            category: '守护者',
            description: '实用、事实导向，可靠性毋庸置疑。',
            characteristics: '责任心强、注重细节、传统保守、可靠性高',
            careers: '会计、审计师、行政人员、项目经理、工程师',
            relationships: '重视承诺，稳定可靠',
            dimension: 'guardian'
        },
        'ISFJ': {
            name: '守卫者',
            category: '守护者',
            description: '非常专注、热心、总是准备保护所爱的人。',
            characteristics: '服务精神强、细心负责、传统稳重、善于合作',
            careers: '护士、老师、秘书、客服、社工',
            relationships: '温暖关怀，善于照顾他人',
            dimension: 'guardian'
        },
        'ESTJ': {
            name: '总经理',
            category: '守护者',
            description: '出色的管理者，在管理事务或人员方面无与伦比。',
            characteristics: '组织能力强、目标明确、决策果断、执行力佳',
            careers: '管理者、军官、警察、行政主管、销售经理',
            relationships: '重视责任和承诺，社交得体',
            dimension: 'guardian'
        },
        'ESFJ': {
            name: '执政官',
            category: '守护者',
            description: '非常关心他人、社交能力强、总是乐于帮助他人。',
            characteristics: '善于合作、关心他人、传统保守、组织能力强',
            careers: '教师、护士、HR、接待员、社区工作者',
            relationships: '重视和谐，善于营造舒适氛围',
            dimension: 'guardian'
        },
        'ISTP': {
            name: '鉴赏家',
            category: '探险家',
            description: '大胆而实际的实验家，擅长使用各种工具。',
            characteristics: '动手能力强、适应性强、独立思考、冷静客观',
            careers: '工程师、技师、程序员、飞行员、运动员',
            relationships: '重视独立空间，行动胜过言语',
            dimension: 'explorer'
        },
        'ISFP': {
            name: '探险家',
            category: '探险家',
            description: '灵活、有魅力的艺术家，时刻准备探索新的可能性。',
            characteristics: '艺术天赋、价值观坚定、谦逊温和、适应性强',
            careers: '艺术家、设计师、摄影师、音乐家、作家',
            relationships: '重视真实体验，理解重要',
            dimension: 'explorer'
        },
        'ESTP': {
            name: '企业家',
            category: '探险家',
            description: '聪明、精力充沛、善于感知的人，真正享受生活。',
            characteristics: '行动导向、适应性强、社交活跃、实用主义',
            careers: '销售员、企业家、运动员、娱乐主持人、警察',
            relationships: '社交积极，享受当下',
            dimension: 'explorer'
        },
        'ESFP': {
            name: '娱乐家',
            category: '探险家',
            description: '自发的、精力充沛、热情洋溢的人，生活在他们周围决不无聊。',
            characteristics: '热情开朗、善于社交、实用主义、团队精神',
            careers: '演员、主持人、销售、旅游从业者、活动策划',
            relationships: '善于营造欢乐氛围，重视团队合作',
            dimension: 'explorer'
        }
    };
    
    return results[type] || results['INTJ']; // 默认返回INTJ
}

// 重新开始测试
function restartTest() {
    // 重置所有状态
    currentQuestionIndex = 0;
    answers = {};
    scores = {
        E: 0, I: 0,
        S: 0, N: 0,
        T: 0, F: 0,
        J: 0, P: 0
    };
    
    // 显示测试内容，隐藏结果页面
    document.querySelector('.test-content').style.display = 'block';
    document.getElementById('resultsPage').style.display = 'none';
    
    // 重新初始化
    initializeTest();
}

// 分享结果
function shareResult() {
    const result = calculateResult();
    const shareText = `我的MBTI人格类型是：${result.type} - ${result.name}！${result.description}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'MBTI人格测试结果',
            text: shareText,
            url: window.location.origin
        });
    } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(shareText).then(() => {
            alert('结果已复制到剪贴板！');
        });
    }
}

// 返回上一页
function goBack() {
    if (confirm('确定要返回吗？当前进度将会丢失。')) {
        window.history.back();
    }
}