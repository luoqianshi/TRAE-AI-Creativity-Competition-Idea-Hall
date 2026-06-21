/**
 * 测验引擎模块
 * 处理各种题型的渲染和验证
 */
const QuizEngine = (function() {
    'use strict';

    // ==================== 题型类型 ====================
    const QUESTION_TYPES = {
        SINGLE: 'single',     // 单选题
        MULTIPLE: 'multiple', // 多选题
        BLANK: 'blank',      // 填空题
        COMPLETION: 'completion', // 代码补全
        OUTPUT: 'output'     // 输出预测
    };

    // ==================== 状态管理 ====================
    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let quizListeners = [];

    /**
     * 渲染测验区域
     */
    function renderQuiz(quizData, containerId = 'quiz-section') {
        const container = document.getElementById(containerId);
        if (!container || !quizData || !quizData.length) {
            container.innerHTML = '<div class="quiz-card"><p class="text-muted">本节暂无测验</p></div>';
            return;
        }

        currentQuiz = quizData;
        currentQuestionIndex = 0;
        userAnswers = {};

        const html = `
            <div class="quiz-card">
                <div id="quiz-header">
                    <h3 id="quiz-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                        章节小测
                    </h3>
                    <span id="quiz-progress">问题 1 / ${quizData.length}</span>
                </div>
                <div id="quiz-questions"></div>
                <div id="quiz-actions">
                    <button class="btn btn-secondary" id="quiz-prev-btn" disabled>
                        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                        上一题
                    </button>
                    <button class="btn btn-primary" id="quiz-next-btn">
                        下一题
                        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>
            </div>
            <div id="quiz-result" style="display: none;"></div>
        `;

        container.innerHTML = html;

        // 绑定事件
        bindQuizEvents();
        
        // 渲染第一题
        renderCurrentQuestion();
    }

    /**
     * 绑定测验事件
     */
    function bindQuizEvents() {
        const prevBtn = document.getElementById('quiz-prev-btn');
        const nextBtn = document.getElementById('quiz-next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => navigateQuestion(-1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentQuestionIndex === currentQuiz.length - 1) {
                    submitQuiz();
                } else {
                    navigateQuestion(1);
                }
            });
        }
    }

    /**
     * 渲染当前问题
     */
    function renderCurrentQuestion() {
        const questionsContainer = document.getElementById('quiz-questions');
        if (!questionsContainer) return;

        const question = currentQuiz[currentQuestionIndex];
        if (!question) return;

        // 更新进度
        document.getElementById('quiz-progress').textContent = 
            `问题 ${currentQuestionIndex + 1} / ${currentQuiz.length}`;

        // 更新按钮状态
        document.getElementById('quiz-prev-btn').disabled = currentQuestionIndex === 0;
        document.getElementById('quiz-next-btn').innerHTML = 
            currentQuestionIndex === currentQuiz.length - 1
                ? '提交测验 <svg width="16" height="16" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'
                : '下一题 <svg width="16" height="16" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';

        // 渲染问题
        questionsContainer.innerHTML = renderQuestion(question, currentQuestionIndex);

        // 绑定问题交互事件
        bindQuestionEvents(question);

        // 如果已有答案，恢复选择状态
        const savedAnswer = userAnswers[currentQuestionIndex];
        if (savedAnswer !== undefined) {
            restoreAnswer(question, savedAnswer);
        }
    }

    /**
     * 渲染单个问题
     */
    function renderQuestion(question, index) {
        // 兼容两种格式：新格式和旧格式
        const questionType = question.type || 'single';
        const typeClass = `question-type-${questionType}`;
        
        // 标准化选项格式
        let normalizedOptions = [];
        if (question.options && question.options.length > 0) {
            if (typeof question.options[0] === 'string') {
                // 旧格式：options: ['选项1', '选项2'], correct: 1
                normalizedOptions = question.options.map((text, i) => ({
                    text,
                    correct: i === question.correct
                }));
            } else {
                // 新格式：options: [{ text: '选项', correct: true }]
                normalizedOptions = question.options;
            }
        }
        
        let optionsHtml = '';
        
        switch (questionType) {
            case QUESTION_TYPES.SINGLE:
            case QUESTION_TYPES.MULTIPLE:
                optionsHtml = normalizedOptions.map((opt, i) => `
                    <div class="option-item" data-index="${i}" data-correct="${opt.correct || false}">
                        <div class="${questionType === QUESTION_TYPES.MULTIPLE ? 'option-checkbox' : 'option-radio'}">
                            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div class="option-content">${opt.text}</div>
                    </div>
                `).join('');
                break;

            case QUESTION_TYPES.BLANK:
                optionsHtml = `
                    <div class="blank-container">
                        <input type="text" class="question-blank-input" placeholder="在此输入答案..." />
                    </div>
                `;
                break;

            case QUESTION_TYPES.COMPLETION:
                optionsHtml = `
                    <div class="code-completion-hint">请在下方代码中补充缺失的部分</div>
                    <div id="quiz-completion-editor-${index}" class="quiz-completion-editor"></div>
                `;
                break;

            case QUESTION_TYPES.OUTPUT:
                optionsHtml = `
                    ${question.code ? `<div class="question-code">${escapeHtml(question.code)}</div>` : ''}
                    <div class="output-prediction-container">
                        <div class="diff-label">请预测上面代码的输出结果：</div>
                        <textarea class="output-prediction-input" placeholder="输入预测的输出..."></textarea>
                    </div>
                `;
                break;
        }

        return `
            <div class="quiz-question ${typeClass}" data-index="${index}">
                <div class="question-number">问题 ${index + 1}</div>
                <div class="question-text">${question.question}</div>
                ${question.code && questionType !== QUESTION_TYPES.OUTPUT ? 
                    `<div class="question-code">${escapeHtml(question.code)}</div>` : ''}
                <div class="question-options">${optionsHtml}</div>
                <div class="quiz-explanation"></div>
            </div>
        `;
    }

    /**
     * 绑定问题交互事件
     */
    function bindQuestionEvents(question) {
        const container = document.querySelector('.quiz-question');
        const questionType = question.type || 'single';

        switch (questionType) {
            case QUESTION_TYPES.SINGLE:
            case QUESTION_TYPES.MULTIPLE:
                container.querySelectorAll('.option-item').forEach(item => {
                    item.addEventListener('click', () => handleOptionClick(item, questionType));
                });
                break;

            case QUESTION_TYPES.BLANK:
                const blankInput = container.querySelector('.question-blank-input');
                if (blankInput) {
                    blankInput.addEventListener('input', (e) => {
                        userAnswers[currentQuestionIndex] = e.target.value;
                    });
                }
                break;

            case QUESTION_TYPES.COMPLETION:
                const editorId = `quiz-completion-editor-${currentQuestionIndex}`;
                setTimeout(() => initCompletionEditor(editorId), 100);
                break;

            case QUESTION_TYPES.OUTPUT:
                const outputInput = container.querySelector('.output-prediction-input');
                if (outputInput) {
                    outputInput.addEventListener('input', (e) => {
                        userAnswers[currentQuestionIndex] = e.target.value;
                    });
                }
                break;
        }
    }

    /**
     * 处理选项点击
     */
    function handleOptionClick(item, type) {
        const container = document.querySelector('.quiz-question');
        
        if (type === QUESTION_TYPES.SINGLE) {
            container.querySelectorAll('.option-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            userAnswers[currentQuestionIndex] = parseInt(item.dataset.index);
        } else {
            item.classList.toggle('selected');
            // 收集所有选中的索引
            const selected = [];
            container.querySelectorAll('.option-item.selected').forEach(i => {
                selected.push(parseInt(i.dataset.index));
            });
            userAnswers[currentQuestionIndex] = selected;
        }
    }

    /**
     * 恢复答案状态
     */
    function restoreAnswer(question, answer) {
        const container = document.querySelector('.quiz-question');
        const questionType = question.type || 'single';

        switch (questionType) {
            case QUESTION_TYPES.SINGLE:
                const item = container.querySelector(`.option-item[data-index="${answer}"]`);
                if (item) item.classList.add('selected');
                break;

            case QUESTION_TYPES.MULTIPLE:
                answer.forEach(idx => {
                    const item = container.querySelector(`.option-item[data-index="${idx}"]`);
                    if (item) item.classList.add('selected');
                });
                break;

            case QUESTION_TYPES.BLANK:
                const blankInput = container.querySelector('.question-blank-input');
                if (blankInput) blankInput.value = answer;
                break;

            case QUESTION_TYPES.OUTPUT:
                const outputInput = container.querySelector('.output-prediction-input');
                if (outputInput) outputInput.value = answer;
                break;
        }
    }

    /**
     * 初始化代码补全编辑器
     */
    function initCompletionEditor(editorId) {
        const container = document.getElementById(editorId);
        if (!container) return;

        const textarea = document.createElement('textarea');
        textarea.value = currentQuiz[currentQuestionIndex].template || '';
        container.appendChild(textarea);

        const editor = CodeMirror.fromTextArea(textarea, {
            mode: 'text/x-c++src',
            theme: 'monokai',
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            lineWrapping: true,
            height: '150px'
        });

        editor.on('change', () => {
            userAnswers[currentQuestionIndex] = editor.getValue();
        });
    }

    /**
     * 导航到问题
     */
    function navigateQuestion(direction) {
        currentQuestionIndex += direction;
        currentQuestionIndex = Math.max(0, Math.min(currentQuestionIndex, currentQuiz.length - 1));
        renderCurrentQuestion();
    }

    /**
     * 提交测验
     */
    function submitQuiz() {
        let correctCount = 0;
        const results = [];

        currentQuiz.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const result = checkAnswer(question, userAnswer);
            results.push(result);
            if (result.correct) correctCount++;
        });

        showQuizResult(correctCount, currentQuiz.length, results);
        
        // 通知监听器
        quizListeners.forEach(listener => listener({
            correctCount,
            totalCount: currentQuiz.length,
            score: Math.round((correctCount / currentQuiz.length) * 100),
            results
        }));
    }

    /**
     * 检查答案
     */
    function checkAnswer(question, userAnswer) {
        const questionType = question.type || 'single';
        
        // 标准化选项格式
        let normalizedOptions = [];
        let correctIndex = -1;
        
        if (question.options && question.options.length > 0) {
            if (typeof question.options[0] === 'string') {
                // 旧格式：options: ['选项1', '选项2'], correct: 1
                normalizedOptions = question.options.map((text, i) => ({
                    text,
                    correct: i === question.correct
                }));
                correctIndex = question.correct;
            } else {
                // 新格式：options: [{ text: '选项', correct: true }]
                normalizedOptions = question.options;
                correctIndex = question.options.findIndex(o => o.correct);
            }
        }
        
        switch (questionType) {
            case QUESTION_TYPES.SINGLE:
                return {
                    correct: userAnswer === correctIndex,
                    correctAnswer: normalizedOptions[correctIndex]?.text || '',
                    explanation: question.explanation
                };

            case QUESTION_TYPES.MULTIPLE:
                const correctIndices = normalizedOptions
                    .map((o, i) => o.correct ? i : -1)
                    .filter(i => i >= 0);
                const userIndices = userAnswer || [];
                const correct = correctIndices.length === userIndices.length &&
                    correctIndices.every(i => userIndices.includes(i));
                return {
                    correct,
                    correctAnswers: correctIndices.map(i => normalizedOptions[i].text),
                    explanation: question.explanation
                };

            case QUESTION_TYPES.BLANK:
                const isCorrect = userAnswer && 
                    userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();
                return {
                    correct: isCorrect,
                    correctAnswer: question.answer,
                    explanation: question.explanation
                };

            case QUESTION_TYPES.OUTPUT:
                const outputCorrect = userAnswer && 
                    normalizeOutput(userAnswer) === normalizeOutput(question.answer);
                return {
                    correct: outputCorrect,
                    correctAnswer: question.answer,
                    explanation: question.explanation
                };

            default:
                return { correct: false, explanation: '' };
        }
    }

    /**
     * 标准化输出比较
     */
    function normalizeOutput(str) {
        return str.toString()
            .replace(/\s+/g, ' ')
            .replace(/^\s+|\s+$/g, '')
            .toLowerCase();
    }

    /**
     * 显示测验结果
     */
    function showQuizResult(correctCount, totalCount, results) {
        const container = document.getElementById('quiz-result');
        const questionsContainer = document.getElementById('quiz-questions');
        const actionsContainer = document.getElementById('quiz-actions');
        
        const score = Math.round((correctCount / totalCount) * 100);
        let grade, message, scoreClass;

        if (score >= 90) {
            grade = 'A';
            message = '太棒了！你已经完全掌握了这部分内容！';
            scoreClass = 'excellent';
        } else if (score >= 70) {
            grade = 'B';
            message = '做得不错！继续加油！';
            scoreClass = 'good';
        } else if (score >= 60) {
            grade = 'C';
            message = '及格了，建议回顾一下错题。';
            scoreClass = 'pass';
        } else {
            grade = 'D';
            message = '需要加强学习，请重新阅读课程内容。';
            scoreClass = 'fail';
        }

        // 计算获得的XP
        const xpEarned = Math.round((score / 100) * 100 * totalCount);

        container.innerHTML = `
            <div id="quiz-score" class="${scoreClass}">${score}%</div>
            <div id="quiz-grade">等级: ${grade}</div>
            <div id="quiz-message">${message}</div>
            <div class="quiz-xp-earned">+${xpEarned} XP</div>
            <button class="btn btn-primary" id="quiz-review-btn" style="margin-top: 20px;">查看详细结果</button>
        `;

        container.style.display = 'block';
        questionsContainer.style.display = 'none';
        actionsContainer.style.display = 'none';

        // 保存结果
        currentQuizResults = { correctCount, totalCount, results, xpEarned, score };

        document.getElementById('quiz-review-btn').addEventListener('click', () => {
            showDetailedResults(results);
        });
    }

    let currentQuizResults = null;

    /**
     * 显示详细结果
     */
    function showDetailedResults(results) {
        const container = document.getElementById('quiz-result');
        
        let html = '<div style="max-height: 400px; overflow-y: auto;">';
        
        currentQuiz.forEach((question, index) => {
            const result = results[index];
            html += `
                <div class="quiz-question" style="margin-bottom: 16px;">
                    <div class="question-number">问题 ${index + 1}</div>
                    <div class="question-text">${question.question}</div>
                    <div class="option-item ${result.correct ? 'correct' : 'incorrect'}" style="cursor: default;">
                        <div class="option-radio"></div>
                        <div class="option-content">
                            ${result.correct ? '✓ 正确' : '✗ 错误'}
                            ${!result.correct ? `<br>正确答案: ${result.correctAnswer || result.correctAnswers?.join(', ')}` : ''}
                        </div>
                    </div>
                    <div class="quiz-explanation show">
                        <div class="explanation-title">解析</div>
                        <div class="explanation-content">${result.explanation}</div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        html += '<button class="btn btn-secondary" id="quiz-close-review-btn">关闭</button>';
        
        container.innerHTML = html;

        document.getElementById('quiz-close-review-btn').addEventListener('click', () => {
            container.style.display = 'none';
            document.getElementById('quiz-questions').style.display = 'block';
            document.getElementById('quiz-actions').style.display = 'flex';
        });
    }

    /**
     * HTML转义
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 添加测验结果监听器
     */
    function addResultListener(listener) {
        quizListeners.push(listener);
    }

    /**
     * 获取当前测验结果
     */
    function getCurrentResults() {
        return currentQuizResults;
    }

    // ==================== 导出 ====================
    return {
        QUESTION_TYPES,
        renderQuiz,
        submitQuiz,
        checkAnswer,
        addResultListener,
        getCurrentResults
    };
})();

// 导出到全局
window.QuizEngine = QuizEngine;
