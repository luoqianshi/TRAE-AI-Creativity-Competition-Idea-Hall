class RiddleGame {
    constructor() {
        this.currentLevel = 0;
        this.score = 0;
        this.correctCount = 0;
        this.hintsUsed = 0;
        this.maxHints = 2;
        this.gameRiddles = [];
        this.selectedDifficulty = '';
        this.startTime = 0;
        this.endTime = 0;
        this.highScore = this.loadHighScore();
        this.isTransitioning = false;
        this.currentTitle = '';
        
        this.initElements();
        this.bindEvents();
        this.updateHighScoreDisplay();
    }

    initElements() {
        this.homePage = document.getElementById('homePage');
        this.difficultyPage = document.getElementById('difficultyPage');
        this.gamePage = document.getElementById('gamePage');
        this.resultPage = document.getElementById('resultPage');

        this.highScoreEl = document.getElementById('highScore');
        this.startBtn = document.getElementById('startBtn');
        this.backToHome = document.getElementById('backToHome');
        this.diffBtns = document.querySelectorAll('.diff-btn');
        this.gameBackBtn = document.getElementById('gameBackBtn');

        this.currentLevelEl = document.getElementById('currentLevel');
        this.totalLevelsEl = document.getElementById('totalLevels');
        this.scoreEl = document.getElementById('score');
        this.difficultyTag = document.getElementById('difficultyTag');
        this.progressFill = document.getElementById('progressFill');
        this.categoryBadge = document.getElementById('categoryBadge');
        this.hintsLeftEl = document.getElementById('hintsLeft');
        this.riddleQuestion = document.getElementById('riddleQuestion');
        this.riddleCard = document.getElementById('riddleCard');

        this.explanationArea = document.getElementById('explanationArea');
        this.explanationText = document.getElementById('explanationText');

        this.answerInput = document.getElementById('answerInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.feedback = document.getElementById('feedback');

        this.hintBtn = document.getElementById('hintBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.hintDisplay = document.getElementById('hintDisplay');
        this.hintContent = document.getElementById('hintContent');

        this.resultTitle = document.getElementById('resultTitle');
        this.titleIcon = document.getElementById('titleIcon');
        this.finalScore = document.getElementById('finalScore');
        this.correctCountEl = document.getElementById('correctCount');
        this.timeTakenEl = document.getElementById('timeTaken');
        this.titleBadge = document.getElementById('titleBadge');
        this.titleDesc = document.getElementById('titleDesc');
        this.newRecord = document.getElementById('newRecord');

        this.restartBtn = document.getElementById('restartBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.homeBtn = document.getElementById('homeBtn');
        this.copyFeedback = document.getElementById('copyFeedback');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.showDifficultyPage());
        this.backToHome.addEventListener('click', () => this.showHomePage());
        this.gameBackBtn.addEventListener('click', () => {
            if (confirm('确定要退出当前游戏吗？')) {
                this.showHomePage();
            }
        });

        this.diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const level = btn.dataset.level;
                this.startGame(level);
            });
        });

        this.submitBtn.addEventListener('click', () => this.checkAnswer());
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        this.hintBtn.addEventListener('click', () => this.showHint());
        this.skipBtn.addEventListener('click', () => this.skipQuestion());

        this.restartBtn.addEventListener('click', () => this.showDifficultyPage());
        this.copyBtn.addEventListener('click', () => this.copyScore());
        this.homeBtn.addEventListener('click', () => this.showHomePage());
    }

    loadHighScore() {
        const saved = localStorage.getItem('mijingHighScore');
        return saved ? parseInt(saved) : 0;
    }

    saveHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem('mijingHighScore', score.toString());
            return true;
        }
        return false;
    }

    updateHighScoreDisplay() {
        this.highScoreEl.textContent = this.highScore;
    }

    showPage(page) {
        [this.homePage, this.difficultyPage, this.gamePage, this.resultPage].forEach(p => {
            p.classList.remove('active');
        });
        page.classList.add('active');
    }

    showHomePage() {
        this.showPage(this.homePage);
        this.updateHighScoreDisplay();
    }

    showDifficultyPage() {
        this.showPage(this.difficultyPage);
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    startGame(difficulty) {
        this.selectedDifficulty = difficulty;
        
        if (difficulty === 'mixed') {
            this.gameRiddles = this.shuffleArray(riddlesData).slice(0, 10);
        } else {
            const filtered = riddlesData.filter(r => r.level === difficulty);
            this.gameRiddles = this.shuffleArray(filtered).slice(0, 10);
        }

        this.currentLevel = 0;
        this.score = 0;
        this.correctCount = 0;
        this.startTime = Date.now();
        
        this.showPage(this.gamePage);
        this.loadLevel();
    }

    loadLevel() {
        if (this.currentLevel >= this.gameRiddles.length) {
            this.endGame();
            return;
        }

        const riddle = this.gameRiddles[this.currentLevel];
        
        this.currentLevelEl.textContent = this.currentLevel + 1;
        this.totalLevelsEl.textContent = this.gameRiddles.length;
        this.scoreEl.textContent = this.score;
        
        const diffNames = {
            easy: '简单',
            medium: '中等',
            hard: '困难',
            mixed: '混合'
        };
        this.difficultyTag.textContent = diffNames[this.selectedDifficulty];

        this.categoryBadge.textContent = riddle.category;
        this.hintsUsed = 0;
        this.hintsLeftEl.textContent = this.maxHints;
        this.riddleQuestion.textContent = riddle.question;

        this.answerInput.value = '';
        this.answerInput.focus();
        
        this.explanationArea.classList.remove('show');
        this.hintDisplay.classList.remove('show');
        this.hintContent.textContent = '';
        this.hideFeedback();
        
        this.enableGameButtons();

        const progress = (this.currentLevel / this.gameRiddles.length) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    checkAnswer() {
        if (this.isTransitioning) return;
        
        const userAnswer = this.answerInput.value.trim();
        
        if (!userAnswer) {
            this.showFeedback('请输入答案', 'incorrect');
            return;
        }

        const riddle = this.gameRiddles[this.currentLevel];
        
        const allAnswers = [riddle.answer, ...riddle.aliases];
        const isCorrect = allAnswers.some(answer => 
            answer.toLowerCase() === userAnswer.toLowerCase()
        );

        if (isCorrect) {
            this.handleCorrectAnswer(riddle);
        } else {
            this.handleIncorrectAnswer();
        }
    }

    handleCorrectAnswer(riddle) {
        this.isTransitioning = true;
        this.disableGameButtons();
        
        this.score += 10;
        this.correctCount++;
        this.scoreEl.textContent = this.score;
        
        this.showFeedback(`答对了！答案是 "${riddle.answer}"`, 'correct');
        this.showExplanation(riddle.explanation);
        
        setTimeout(() => {
            this.currentLevel++;
            this.loadLevel();
        }, 2500);
    }

    handleIncorrectAnswer() {
        const encouragement = [
            '不对哦，再想想！',
            '差一点点，继续加油！',
            '别灰心，多尝试几次！',
            '这个有点难，需要提示吗？'
        ];
        const randomEncouragement = encouragement[Math.floor(Math.random() * encouragement.length)];
        
        this.showFeedback(randomEncouragement, 'incorrect');
        this.shakeCard();
        
        setTimeout(() => {
            this.hideFeedback();
            this.riddleCard.classList.remove('shake');
        }, 500);
    }

    shakeCard() {
        this.riddleCard.classList.add('shake');
    }

    showHint() {
        if (this.isTransitioning) return;
        
        if (this.hintsUsed >= this.maxHints) {
            this.showFeedback('提示已用完', 'warning');
            return;
        }

        const riddle = this.gameRiddles[this.currentLevel];
        const hint = riddle.hints[this.hintsUsed];
        
        if (hint) {
            this.hintsUsed++;
            this.hintsLeftEl.textContent = this.maxHints - this.hintsUsed;
            this.score = Math.max(0, this.score - 2);
            this.scoreEl.textContent = this.score;
            
            this.hintContent.textContent = hint;
            this.hintDisplay.classList.add('show');
            
            if (this.hintsUsed >= this.maxHints) {
                this.hintBtn.disabled = true;
            }
        }
    }

    skipQuestion() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.disableGameButtons();
        
        const riddle = this.gameRiddles[this.currentLevel];
        
        this.showFeedback(`跳过！答案是 "${riddle.answer}"`, 'warning');
        this.showExplanation(riddle.explanation);
        
        setTimeout(() => {
            this.currentLevel++;
            this.loadLevel();
        }, 2500);
    }

    showExplanation(explanation) {
        this.explanationText.textContent = explanation;
        this.explanationArea.classList.add('show');
    }

    disableGameButtons() {
        this.submitBtn.disabled = true;
        this.hintBtn.disabled = true;
        this.skipBtn.disabled = true;
        this.answerInput.disabled = true;
    }

    enableGameButtons() {
        this.isTransitioning = false;
        this.submitBtn.disabled = false;
        this.hintBtn.disabled = false;
        this.skipBtn.disabled = false;
        this.answerInput.disabled = false;
    }

    showFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = `feedback show ${type}`;
    }

    hideFeedback() {
        this.feedback.classList.remove('show');
    }

    endGame() {
        this.endTime = Date.now();
        const timeTaken = this.formatTime(this.endTime - this.startTime);
        const isNewRecord = this.saveHighScore(this.score);

        this.progressFill.style.width = '100%';
        
        const titles = this.getTitle(this.score, this.correctCount, this.gameRiddles.length);
        this.currentTitle = titles.badge;
        
        this.titleIcon.textContent = titles.icon;
        this.resultTitle.textContent = titles.title;
        this.finalScore.textContent = this.score;
        this.correctCountEl.textContent = `${this.correctCount}/${this.gameRiddles.length}`;
        this.timeTakenEl.textContent = timeTaken;
        this.titleBadge.textContent = titles.badge;
        this.titleDesc.textContent = titles.desc;
        
        this.newRecord.style.display = isNewRecord ? 'block' : 'none';
        
        this.showPage(this.resultPage);
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}分${remainingSeconds}秒`;
    }

    getTitle(score, correct, total) {
        if (score >= 81) {
            return {
                icon: '🏆',
                title: '恭喜通关！',
                badge: '谜境大师',
                desc: '太厉害了！你已是猜谜界的顶级高手！'
            };
        } else if (score >= 61) {
            return {
                icon: '🌟',
                title: '挑战成功！',
                badge: '谜题行者',
                desc: '表现出色！在谜境中已走出很远的路程！'
            };
        } else if (score >= 31) {
            return {
                icon: '✨',
                title: '继续努力！',
                badge: '小有灵光',
                desc: '不错的成绩！你的智慧正在闪耀！'
            };
        } else {
            return {
                icon: '🌱',
                title: '初入谜馆',
                badge: '初入谜馆',
                desc: '欢迎来到谜境小馆！多练习会进步的！'
            };
        }
    }

    copyScore() {
        const diffName = this.selectedDifficulty === 'mixed' ? '混合挑战' : 
                         this.selectedDifficulty === 'easy' ? '简单' : 
                         this.selectedDifficulty === 'medium' ? '中等' : '困难';
        const title = this.currentTitle || '谜语新手';
        const shareText = `我在「谜境小馆」获得了「${title}」称号！挑战${diffName}难度，答对${this.correctCount}/${this.gameRiddles.length}题，得分${this.score}！快来挑战我吧！`;
        
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        
        textarea.select();
        textarea.setSelectionRange(0, shareText.length);
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.copyFeedback.classList.add('show');
                setTimeout(() => {
                    this.copyFeedback.classList.remove('show');
                }, 2000);
            } else {
                this.showFeedback('复制失败，请手动复制', 'warning');
            }
        } catch (err) {
            this.showFeedback('复制失败，请手动复制', 'warning');
        }
        
        document.body.removeChild(textarea);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RiddleGame();
});