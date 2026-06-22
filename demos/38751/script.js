const questions = [
    {
        question: "一个房间里有4个角，每个角有1只猫，每只猫面前有3只猫，一共有多少只猫？",
        options: ["4只", "8只", "12只", "16只"],
        answer: 0,
        category: "逻辑推理"
    },
    {
        question: "如果所有的狗都是动物，所有的动物都是生物，那么所有的狗都是生物吗？",
        options: ["是", "不是", "不确定", "取决于情况"],
        answer: 0,
        category: "逻辑推理"
    },
    {
        question: "找出规律：2, 6, 12, 20, ?",
        options: ["28", "30", "32", "36"],
        answer: 1,
        category: "数学计算"
    },
    {
        question: "一个正方形有几条对角线？",
        options: ["2条", "4条", "6条", "8条"],
        answer: 0,
        category: "空间想象"
    },
    {
        question: "小明有5个苹果，他给了小红2个，又买了3个，现在小明有几个苹果？",
        options: ["4个", "5个", "6个", "7个"],
        answer: 2,
        category: "数学计算"
    },
    {
        question: "找出与众不同的一个：老虎、狮子、豹子、大象",
        options: ["老虎", "狮子", "豹子", "大象"],
        answer: 3,
        category: "逻辑推理"
    },
    {
        question: "如果昨天是明天的话就好了，那么今天就是周五了。请问今天实际上是周几？",
        options: ["周三", "周四", "周五", "周日"],
        answer: 0,
        category: "逻辑推理"
    },
    {
        question: "一个立方体有几个面？",
        options: ["4个", "6个", "8个", "12个"],
        answer: 1,
        category: "空间想象"
    },
    {
        question: "3个人3天用3桶水，9个人9天用几桶水？",
        options: ["9桶", "18桶", "27桶", "36桶"],
        answer: 2,
        category: "数学计算"
    },
    {
        question: "找出规律：1, 1, 2, 3, 5, ?",
        options: ["6", "7", "8", "13"],
        answer: 2,
        category: "数学计算"
    },
    {
        question: "以下哪个图形可以通过折叠拼成一个立方体？",
        options: ["选项A", "选项B", "选项C", "选项D"],
        answer: 1,
        category: "空间想象"
    },
    {
        question: "所有的玫瑰都是花，有些花会凋谢，那么有些玫瑰会凋谢吗？",
        options: ["是", "不是", "不确定", "逻辑错误"],
        answer: 2,
        category: "逻辑推理"
    },
    {
        question: "一个圆形的桌子有8个人坐，每两个人之间的距离相等，一共有多少个间隔？",
        options: ["6个", "7个", "8个", "9个"],
        answer: 2,
        category: "数学计算"
    },
    {
        question: "找出规律：A, C, E, G, ?",
        options: ["H", "I", "J", "K"],
        answer: 1,
        category: "逻辑推理"
    },
    {
        question: "如果把一张纸对折一次是2层，对折两次是4层，对折三次是8层，对折十次是多少层？",
        options: ["512层", "1024层", "2048层", "4096层"],
        answer: 1,
        category: "数学计算"
    },
    {
        question: "以下哪个选项是正确的镜像？",
        options: ["选项A", "选项B", "选项C", "选项D"],
        answer: 2,
        category: "空间想象"
    },
    {
        question: "甲比乙大3岁，乙比丙小2岁，谁的年龄最大？",
        options: ["甲", "乙", "丙", "无法确定"],
        answer: 0,
        category: "逻辑推理"
    },
    {
        question: "一个三角形的三个内角之和是多少度？",
        options: ["90度", "180度", "270度", "360度"],
        answer: 1,
        category: "数学计算"
    },
    {
        question: "找出规律：1, 4, 9, 16, ?",
        options: ["20", "25", "30", "36"],
        answer: 1,
        category: "数学计算"
    },
    {
        question: "如果一个人在镜子面前举起右手，镜子里的人会举起哪只手？",
        options: ["右手", "左手", "双手", "不举手"],
        answer: 1,
        category: "空间想象"
    }
];

let currentQuestion = 0;
let answers = [];
let startTime = null;

function startTest() {
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.test-container').style.display = 'block';
    startTime = Date.now();
    showQuestion();
}

function showQuestion() {
    const question = questions[currentQuestion];
    const questionCard = document.querySelector('.question-card');
    
    questionCard.innerHTML = `
        <div class="question-number">第 ${currentQuestion + 1} / ${questions.length} 题</div>
        <div class="question-text">${question.question}</div>
        <div class="options">
            ${question.options.map((option, index) => `
                <button class="option-btn ${answers[currentQuestion] === index ? 'selected' : ''}" 
                        onclick="selectOption(${index})">
                    <span>${String.fromCharCode(65 + index)}</span>
                    <span>${option}</span>
                </button>
            `).join('')}
        </div>
    `;
    
    updateProgress();
    updateNavigation();
}

function selectOption(index) {
    answers[currentQuestion] = index;
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
        btn.classList.toggle('selected', i === index);
    });
    updateNavigation();
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.querySelector('.progress-fill').style.width = `${progress}%`;
}

function updateNavigation() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    prevBtn.disabled = currentQuestion === 0;
    
    if (currentQuestion === questions.length - 1) {
        nextBtn.textContent = '提交测试';
        nextBtn.classList.add('submit-btn');
    } else {
        nextBtn.textContent = '下一题';
        nextBtn.classList.remove('submit-btn');
    }
    
    nextBtn.disabled = answers[currentQuestion] === undefined;
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        calculateResult();
    }
}

function calculateResult() {
    let score = 0;
    const categoryScores = {
        '逻辑推理': { correct: 0, total: 0 },
        '数学计算': { correct: 0, total: 0 },
        '空间想象': { correct: 0, total: 0 }
    };
    
    questions.forEach((question, index) => {
        categoryScores[question.category].total++;
        if (answers[index] === question.answer) {
            score++;
            categoryScores[question.category].correct++;
        }
    });
    
    const rawScore = Math.round((score / questions.length) * 100);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    
    displayResult(rawScore, timeTaken, categoryScores);
}

function displayResult(score, timeTaken, categoryScores) {
    document.querySelector('.test-container').style.display = 'none';
    document.querySelector('.result-container').style.display = 'block';
    
    const resultCard = document.querySelector('.result-card');
    
    let category, icon, description;
    
    if (score >= 90) {
        category = '天才';
        icon = '🏆';
        description = '你的智商非常高！你具有卓越的逻辑思维能力和问题解决能力。继续保持和发展你的天赋！';
        categoryClass = 'category-genius';
    } else if (score >= 80) {
        category = '优秀';
        icon = '🌟';
        description = '你的智商高于平均水平！你有很好的分析能力和学习能力，是同龄人中的佼佼者。';
        categoryClass = 'category-excellent';
    } else if (score >= 70) {
        category = '良好';
        icon = '👍';
        description = '你的智商处于正常偏高水平，具有不错的认知能力和逻辑思维。继续努力可以做得更好！';
        categoryClass = 'category-good';
    } else if (score >= 60) {
        category = '中等';
        icon = '😊';
        description = '你的智商处于平均水平。通过学习和训练，你可以不断提升自己的能力。';
        categoryClass = 'category-average';
    } else {
        category = '待提升';
        icon = '💪';
        description = '每个人都有自己的闪光点，智商测试只是一个方面。通过持续学习和练习，你一定能不断进步！';
        categoryClass = 'category-below-average';
    }
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}分${secs}秒`;
    };
    
    resultCard.innerHTML = `
        <div class="result-icon">${icon}</div>
        <div class="result-title">你的智商测试结果</div>
        <div class="result-score">${score}</div>
        <div class="result-category ${categoryClass}">${category}</div>
        <div class="result-description">${description}</div>
        
        <div class="result-details">
            <div class="detail-item">
                <h4>答对题数</h4>
                <p>${score} / ${questions.length}</p>
            </div>
            <div class="detail-item">
                <h4>用时</h4>
                <p>${formatTime(timeTaken)}</p>
            </div>
            <div class="detail-item">
                <h4>正确率</h4>
                <p>${Math.round((score / questions.length) * 100)}%</p>
            </div>
        </div>
        
        <div class="result-details">
            <div class="detail-item">
                <h4>逻辑推理</h4>
                <p>${categoryScores['逻辑推理'].correct}/${categoryScores['逻辑推理'].total}</p>
            </div>
            <div class="detail-item">
                <h4>数学计算</h4>
                <p>${categoryScores['数学计算'].correct}/${categoryScores['数学计算'].total}</p>
            </div>
            <div class="detail-item">
                <h4>空间想象</h4>
                <p>${categoryScores['空间想象'].correct}/${categoryScores['空间想象'].total}</p>
            </div>
        </div>
        
        <button class="restart-btn" onclick="restartTest()">再测一次</button>
    `;
}

function restartTest() {
    currentQuestion = 0;
    answers = [];
    document.querySelector('.result-container').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
}