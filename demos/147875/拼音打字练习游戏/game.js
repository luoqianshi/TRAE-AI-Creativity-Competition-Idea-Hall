const easyChars = [
    { char: '一', pinyin: 'yi' },
    { char: '二', pinyin: 'er' },
    { char: '三', pinyin: 'san' },
    { char: '四', pinyin: 'si' },
    { char: '五', pinyin: 'wu' },
    { char: '六', pinyin: 'liu' },
    { char: '七', pinyin: 'qi' },
    { char: '八', pinyin: 'ba' },
    { char: '九', pinyin: 'jiu' },
    { char: '十', pinyin: 'shi' },
    { char: '大', pinyin: 'da' },
    { char: '小', pinyin: 'xiao' },
    { char: '人', pinyin: 'ren' },
    { char: '口', pinyin: 'kou' },
    { char: '手', pinyin: 'shou' },
    { char: '山', pinyin: 'shan' },
    { char: '水', pinyin: 'shui' },
    { char: '火', pinyin: 'huo' },
    { char: '土', pinyin: 'tu' },
    { char: '天', pinyin: 'tian' },
    { char: '日', pinyin: 'ri' },
    { char: '月', pinyin: 'yue' },
    { char: '木', pinyin: 'mu' },
    { char: '目', pinyin: 'mu' },
    { char: '田', pinyin: 'tian' },
    { char: '白', pinyin: 'bai' },
    { char: '云', pinyin: 'yun' },
    { char: '雨', pinyin: 'yu' },
    { char: '风', pinyin: 'feng' },
    { char: '花', pinyin: 'hua' },
    { char: '鸟', pinyin: 'niao' },
    { char: '虫', pinyin: 'chong' },
    { char: '鱼', pinyin: 'yu' },
    { char: '马', pinyin: 'ma' },
    { char: '牛', pinyin: 'niu' },
    { char: '羊', pinyin: 'yang' },
    { char: '狗', pinyin: 'gou' },
    { char: '猫', pinyin: 'mao' },
    { char: '鸡', pinyin: 'ji' },
    { char: '鸭', pinyin: 'ya' }
];

const mediumChars = [
    { char: '学', pinyin: 'xue' },
    { char: '校', pinyin: 'xiao' },
    { char: '老', pinyin: 'lao' },
    { char: '师', pinyin: 'shi' },
    { char: '同', pinyin: 'tong' },
    { char: '朋', pinyin: 'peng' },
    { char: '友', pinyin: 'you' },
    { char: '家', pinyin: 'jia' },
    { char: '门', pinyin: 'men' },
    { char: '窗', pinyin: 'chuang' },
    { char: '桌', pinyin: 'zhuo' },
    { char: '椅', pinyin: 'yi' },
    { char: '书', pinyin: 'shu' },
    { char: '本', pinyin: 'ben' },
    { char: '笔', pinyin: 'bi' },
    { char: '尺', pinyin: 'chi' },
    { char: '纸', pinyin: 'zhi' },
    { char: '包', pinyin: 'bao' },
    { char: '饭', pinyin: 'fan' },
    { char: '菜', pinyin: 'cai' },
    { char: '果', pinyin: 'guo' },
    { char: '面', pinyin: 'mian' },
    { char: '肉', pinyin: 'rou' },
    { char: '蛋', pinyin: 'dan' },
    { char: '奶', pinyin: 'nai' },
    { char: '茶', pinyin: 'cha' },
    { char: '酒', pinyin: 'jiu' },
    { char: '米', pinyin: 'mi' },
    { char: '豆', pinyin: 'dou' },
    { char: '糖', pinyin: 'tang' },
    { char: '盐', pinyin: 'yan' },
    { char: '油', pinyin: 'you' },
    { char: '酱', pinyin: 'jiang' },
    { char: '醋', pinyin: 'cu' },
    { char: '碗', pinyin: 'wan' },
    { char: '盘', pinyin: 'pan' },
    { char: '筷', pinyin: 'kuai' },
    { char: '勺', pinyin: 'shao' },
    { char: '杯', pinyin: 'bei' },
    { char: '壶', pinyin: 'hu' }
];

const hardChars = [
    { char: '复', pinyin: 'fu' },
    { char: '杂', pinyin: 'za' },
    { char: '难', pinyin: 'nan' },
    { char: '题', pinyin: 'ti' },
    { char: '知', pinyin: 'zhi' },
    { char: '识', pinyin: 'shi' },
    { char: '智', pinyin: 'zhi' },
    { char: '慧', pinyin: 'hui' },
    { char: '思', pinyin: 'si' },
    { char: '考', pinyin: 'kao' },
    { char: '分', pinyin: 'fen' },
    { char: '析', pinyin: 'xi' },
    { char: '理', pinyin: 'li' },
    { char: '解', pinyin: 'jie' },
    { char: '记', pinyin: 'ji' },
    { char: '忆', pinyin: 'yi' },
    { char: '创', pinyin: 'chuang' },
    { char: '造', pinyin: 'zao' },
    { char: '发', pinyin: 'fa' },
    { char: '明', pinyin: 'ming' },
    { char: '科', pinyin: 'ke' },
    { char: '技', pinyin: 'ji' },
    { char: '文', pinyin: 'wen' },
    { char: '化', pinyin: 'hua' },
    { char: '艺', pinyin: 'yi' },
    { char: '术', pinyin: 'shu' },
    { char: '音', pinyin: 'yin' },
    { char: '乐', pinyin: 'yue' },
    { char: '绘', pinyin: 'hui' },
    { char: '画', pinyin: 'hua' },
    { char: '书', pinyin: 'shu' },
    { char: '法', pinyin: 'fa' },
    { char: '运', pinyin: 'yun' },
    { char: '动', pinyin: 'dong' },
    { char: '健', pinyin: 'jian' },
    { char: '康', pinyin: 'kang' },
    { char: '体', pinyin: 'ti' },
    { char: '育', pinyin: 'yu' },
    { char: '锻', pinyin: 'duan' },
    { char: '炼', pinyin: 'lian' }
];

const difficultyConfig = {
    easy: {
        timePerChar: 10,
        totalChars: 20,
        pointsPerCorrect: 10,
        timeBonus: 2,
        data: easyChars
    },
    medium: {
        timePerChar: 7,
        totalChars: 30,
        pointsPerCorrect: 15,
        timeBonus: 3,
        data: mediumChars
    },
    hard: {
        timePerChar: 5,
        totalChars: 40,
        pointsPerCorrect: 20,
        timeBonus: 5,
        data: hardChars
    }
};

let currentLevel = 'easy';
let gameState = {
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    currentIndex: 0,
    timeLeft: 0,
    timer: null,
    currentChar: null,
    shuffledData: []
};

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const difficultyInfo = document.getElementById('difficulty-info');
const startBtn = document.getElementById('start-btn');
const pinyinInput = document.getElementById('pinyin-input');
const characterDisplay = document.getElementById('character-display');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('current-level');
const feedback = document.getElementById('feedback');
const restartBtn = document.getElementById('restart-btn');

const difficultyInfoContent = {
    easy: '简单汉字，每字10秒，共20字',
    medium: '常见汉字，每字7秒，共30字',
    hard: '复杂汉字，每字5秒，共40字'
};

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentLevel = btn.dataset.level;
        difficultyInfo.textContent = difficultyInfoContent[currentLevel];
    });
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    endScreen.classList.remove('active');
    startScreen.classList.add('active');
});

pinyinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkInput();
    }
});

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function startGame() {
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    const config = difficultyConfig[currentLevel];
    gameState = {
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        currentIndex: 0,
        timeLeft: config.timePerChar,
        timer: null,
        currentChar: null,
        shuffledData: shuffleArray(config.data)
    };

    scoreDisplay.textContent = '0';
    nextChar();
    pinyinInput.focus();
}

function nextChar() {
    const config = difficultyConfig[currentLevel];
    
    if (gameState.currentIndex >= config.totalChars) {
        endGame();
        return;
    }

    gameState.currentChar = gameState.shuffledData[gameState.currentIndex % gameState.shuffledData.length];
    
    characterDisplay.textContent = gameState.currentChar.char;
    characterDisplay.classList.remove('correct', 'wrong');
    pinyinInput.value = '';
    pinyinInput.classList.remove('correct', 'wrong');
    feedback.textContent = '';
    feedback.classList.remove('correct', 'wrong');
    
    gameState.timeLeft = config.timePerChar;
    updateTimer();
    
    levelDisplay.textContent = `${gameState.currentIndex + 1}/${config.totalChars}`;

    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimer();
        
        if (gameState.timeLeft <= 0) {
            handleTimeout();
        }
    }, 1000);
}

function updateTimer() {
    timerDisplay.textContent = gameState.timeLeft;
    timerDisplay.style.color = gameState.timeLeft <= 3 ? '#f44336' : '#333';
}

function checkInput() {
    const input = pinyinInput.value.trim().toLowerCase();
    if (!input) return;

    if (input === gameState.currentChar.pinyin) {
        handleCorrect();
    } else {
        handleWrong();
    }
}

function handleCorrect() {
    clearInterval(gameState.timer);
    const config = difficultyConfig[currentLevel];
    
    const basePoints = config.pointsPerCorrect;
    const timeBonus = Math.floor(gameState.timeLeft * config.timeBonus);
    
    gameState.score += basePoints + timeBonus;
    gameState.correctCount++;
    
    characterDisplay.classList.add('correct');
    pinyinInput.classList.add('correct');
    feedback.textContent = `正确！+${basePoints + timeBonus}分`;
    feedback.classList.add('correct');
    
    scoreDisplay.textContent = gameState.score;
    
    setTimeout(() => {
        gameState.currentIndex++;
        nextChar();
    }, 600);
}

function handleWrong() {
    gameState.wrongCount++;
    
    characterDisplay.classList.add('wrong');
    pinyinInput.classList.add('wrong');
    feedback.textContent = `错误！正确答案: ${gameState.currentChar.pinyin}`;
    feedback.classList.add('wrong');
    
    setTimeout(() => {
        pinyinInput.classList.remove('wrong');
        feedback.classList.remove('wrong');
        feedback.textContent = '';
    }, 1200);
}

function handleTimeout() {
    clearInterval(gameState.timer);
    gameState.wrongCount++;
    
    characterDisplay.classList.add('wrong');
    feedback.textContent = `时间到！正确答案: ${gameState.currentChar.pinyin}`;
    feedback.classList.add('wrong');
    
    setTimeout(() => {
        gameState.currentIndex++;
        nextChar();
    }, 1200);
}

function endGame() {
    clearInterval(gameState.timer);
    
    gameScreen.classList.remove('active');
    endScreen.classList.add('active');
    
    const totalCount = gameState.correctCount + gameState.wrongCount;
    const accuracy = totalCount > 0 ? Math.round((gameState.correctCount / totalCount) * 100) : 0;
    
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-accuracy').textContent = `${accuracy}%`;
}