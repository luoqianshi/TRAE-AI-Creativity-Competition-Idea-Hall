/**
 * 学智云学习平台 - 题库练习组件
 */

const PracticeComponent = {
    currentQuestionIndex: 0,
    questions: [],
    selectedAnswer: null,
    isSubmitted: false,
    timer: null,
    timeSpent: 0,

    /**
     * 渲染题库练习页面
     * @returns {string} HTML字符串
     */
    render() {
        // 获取当前年级和科目
        const currentGrade = Storage.getCurrentGrade();
        const currentSubject = Storage.getCurrentSubject();

        // 获取题目列表
        this.questions = API.getQuestions({ grade: currentGrade, subject: currentSubject });

        if (this.questions.length === 0) {
            return `
                <div class="no-data-container">
                    <i class="el-icon-document" style="font-size: 48px; color: var(--text-light);"></i>
                    <p>暂无相关题目</p>
                    <p>请选择其他年级或科目</p>
                </div>
            `;
        }

        return `
            <!-- 题目筛选器 -->
            <div class="question-filter">
                <div class="filter-row">
                    <span class="filter-label">科目：</span>
                    <div class="filter-options">
                        ${this.renderSubjectFilters()}
                    </div>
                </div>
                <div class="filter-row">
                    <span class="filter-label">难度：</span>
                    <div class="filter-options">
                        ${this.renderDifficultyFilters()}
                    </div>
                </div>
            </div>

            <!-- 题目内容 -->
            <div class="question-card" id="questionCard">
                ${this.renderQuestion()}
            </div>
        `;
    },

    /**
     * 渲染学科筛选器
     * @returns {string} HTML字符串
     */
    renderSubjectFilters() {
        const currentGrade = Storage.getCurrentGrade();
        const currentSubject = Storage.getCurrentSubject();
        
        // 根据年级动态调整学科
        let subjects;
        if (currentGrade <= 6) {
            subjects = ['chinese', 'math', 'english', 'science'];
        } else {
            subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'science'];
        }

        return subjects.map(subject => `
            <button class="filter-option ${subject === currentSubject ? 'active' : ''}"
                    onclick="PracticeComponent.selectSubject('${subject}')">
                ${Helpers.getSubjectName(subject)}
            </button>
        `).join('');
    },

    /**
     * 渲染难度筛选器
     * @returns {string} HTML字符串
     */
    renderDifficultyFilters() {
        const difficulties = [
            { level: 'all', label: '全部' },
            { level: 1, label: '简单' },
            { level: 2, label: '较易' },
            { level: 3, label: '中等' },
            { level: 4, label: '较难' },
            { level: 5, label: '困难' }
        ];

        return difficulties.map(d => `
            <button class="filter-option ${d.level === 'all' ? 'active' : ''}" onclick="PracticeComponent.selectDifficulty('${d.level}')">
                ${d.label}
            </button>
        `).join('');
    },

    /**
     * 渲染当前题目
     * @returns {string} HTML字符串
     */
    renderQuestion() {
        const question = this.questions[this.currentQuestionIndex];

        if (!question) {
            return '<p class="no-data">题目加载失败</p>';
        }

        return `
            <div class="question-header">
                <div class="question-meta">
                    <span class="question-tag">${Helpers.getGradeName(question.grade)}</span>
                    <span class="question-tag">${Helpers.getSubjectName(question.subject)}</span>
                    <span class="question-tag">${question.knowledgePoint}</span>
                </div>
                <div class="question-difficulty">
                    <span class="difficulty-label">难度：</span>
                    ${Helpers.generateStarsHTML(question.difficulty)}
                </div>
            </div>

            <div class="question-content">
                ${question.content}
            </div>

            <div class="question-options" id="questionOptions">
                ${this.renderOptions(question.options)}
            </div>

            ${this.isSubmitted ? this.renderAnswerResult(question) : ''}

            <div class="question-footer">
                <div class="question-progress">
                    第 ${this.currentQuestionIndex + 1} / ${this.questions.length} 题
                </div>
                <div class="question-timer" id="questionTimer">
                    <i class="el-icon-time timer-icon"></i>
                    <span id="timerDisplay">00:00</span>
                </div>
                <div class="question-actions">
                    ${!this.isSubmitted ? `
                        <button class="action-btn submit-btn" onclick="PracticeComponent.submitAnswer()">提交答案</button>
                    ` : `
                        <button class="action-btn next-btn" onclick="PracticeComponent.nextQuestion()">下一题</button>
                        <button class="action-btn skip-btn" onclick="PracticeComponent.nextQuestion()">跳过</button>
                    `}
                </div>
            </div>
        `;
    },

    /**
     * 渲染选项
     * @param {array} options - 选项列表
     * @returns {string} HTML字符串
     */
    renderOptions(options) {
        return options.map(option => {
            const optionLetter = option.charAt(0);
            const isSelected = this.selectedAnswer === optionLetter;
            const isCorrect = this.isSubmitted && this.questions[this.currentQuestionIndex].answer === optionLetter;
            const isWrong = this.isSubmitted && isSelected && !isCorrect;

            return `
                <div class="option-item ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}"
                     onclick="PracticeComponent.selectOption('${optionLetter}')">
                    <div class="option-label">${optionLetter}</div>
                    <div class="option-text">${option.substring(2)}</div>
                </div>
            `;
        }).join('');
    },

    /**
     * 渲染答案结果
     * @param {object} question - 题目信息
     * @returns {string} HTML字符串
     */
    renderAnswerResult(question) {
        const correct = question.answer === this.selectedAnswer;

        return `
            <div class="answer-explanation">
                <div class="explanation-title">
                    <i class="el-icon ${correct ? 'el-icon-success' : 'el-icon-error'}"
                       style="color: ${correct ? 'var(--success-color)' : 'var(--error-color)'}"></i>
                    <span>${correct ? '回答正确！' : '回答错误'}</span>
                </div>
                <div class="correct-answer">
                    <i class="el-icon-check correct-icon"></i>
                    <span class="answer-text">正确答案：${question.answer}</span>
                </div>
                <div class="explanation-content">
                    ${question.explanation}
                </div>
            </div>
        `;
    },

    /**
     * 选择选项
     * @param {string} optionLetter - 选项字母
     */
    selectOption(optionLetter) {
        if (this.isSubmitted) return;

        this.selectedAnswer = optionLetter;
        const optionsContainer = document.getElementById('questionOptions');
        if (optionsContainer) {
            optionsContainer.innerHTML = this.renderOptions(this.questions[this.currentQuestionIndex].options);
        }
    },

    /**
     * 提交答案
     */
    submitAnswer() {
        if (!this.selectedAnswer) {
            Helpers.showMessage('请先选择答案', 'warning');
            return;
        }

        // 停止计时器
        this.stopTimer();

        // 获取当前题目
        const question = this.questions[this.currentQuestionIndex];

        // 提交答案到API
        const result = API.submitAnswer(question.id, this.selectedAnswer);

        if (result.success) {
            this.isSubmitted = true;

            // 重新渲染题目卡片
            const questionCard = document.getElementById('questionCard');
            if (questionCard) {
                questionCard.innerHTML = this.renderQuestion();
            }

            // 显示结果消息
            if (result.correct) {
                Helpers.showMessage('回答正确！', 'success');
            } else {
                Helpers.showMessage('回答错误，正确答案：' + result.correctAnswer, 'warning');
            }
        }
    },

    /**
     * 下一题
     */
    nextQuestion() {
        this.currentQuestionIndex++;

        if (this.currentQuestionIndex >= this.questions.length) {
            Helpers.showMessage('已完成所有题目！', 'success');
            Router.navigate('report');
            return;
        }

        // 重置状态
        this.selectedAnswer = null;
        this.isSubmitted = false;
        this.timeSpent = 0;

        // 重新渲染题目
        const questionCard = document.getElementById('questionCard');
        if (questionCard) {
            questionCard.innerHTML = this.renderQuestion();
        }

        // 开始计时
        this.startTimer();

        // 滚动到顶部
        Helpers.scrollToTop();
    },

    /**
     * 选择学科
     * @param {string} subject - 学科名称
     */
    selectSubject(subject) {
        Storage.setCurrentSubject(subject);
        Router.refresh();
    },

    /**
     * 选择难度
     * @param {string} difficulty - 难度等级
     */
    selectDifficulty(difficulty) {
        // 更新难度筛选状态
        const buttons = document.querySelectorAll('.filter-option');
        buttons.forEach(btn => {
            if (btn.textContent === Helpers.getDifficultyName(parseInt(difficulty))) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 重新获取题目
        const currentGrade = Storage.getCurrentGrade();
        const currentSubject = Storage.getCurrentSubject();
        const filter = { grade: currentGrade, subject: currentSubject };
        if (difficulty !== 'all') {
            filter.difficulty = parseInt(difficulty);
        }

        this.questions = API.getQuestions(filter);
        this.currentQuestionIndex = 0;
        this.selectedAnswer = null;
        this.isSubmitted = false;

        Router.refresh();
    },

    /**
     * 开始计时器
     */
    startTimer() {
        this.timer = setInterval(() => {
            this.timeSpent++;
            const timerDisplay = document.getElementById('timerDisplay');
            if (timerDisplay) {
                timerDisplay.textContent = Helpers.formatTimer(this.timeSpent);
            }
        }, 1000);
    },

    /**
     * 停止计时器
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
};

// 导出PracticeComponent对象
window.PracticeComponent = PracticeComponent;