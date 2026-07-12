let questionGenerator = new QuestionGenerator();

let practiceQuestions = [];
let currentPracticeIndex = 0;
let practiceCorrectCount = 0;
let practiceWrongQuestions = [];

let testQuestions = [];
let currentTestIndex = 0;
let testAnswers = {};
let testTimer = null;
let testTimeLeft = 300;

let wrongQuestions = JSON.parse(localStorage.getItem('wrongQuestions') || '[]');
let testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
let totalStats = JSON.parse(localStorage.getItem('totalStats') || '{"totalQuestions": 0, "correctAnswers": 0, "avgScore": 0}');

const gradeNames = {
    1: '小学一年级', 2: '小学二年级', 3: '小学三年级',
    4: '小学四年级', 5: '小学五年级', 6: '小学六年级',
    7: '初中一年级', 8: '初中二年级', 9: '初中三年级'
};

function switchMode(mode) {
    document.querySelectorAll('.mode-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(mode + '-mode').classList.add('active');
    document.querySelector(`button[onclick="switchMode('${mode}')"]`).classList.add('active');
    
    if (mode === 'wrong') loadWrongList();
    if (mode === 'analysis') loadAnalysis();
}

function updateDifficultyOptions() {
}

function getSettings() {
    return {
        grade: parseInt(document.getElementById('grade-select').value),
        difficulty: document.getElementById('difficulty-select').value,
        count: parseInt(document.getElementById('question-count').value),
        type: document.getElementById('question-type').value
    };
}

function renderQuestion(question, containerId) {
    const container = document.getElementById(containerId);
    let html = `<div class="question-title">${question.content}</div>`;
    
    switch (question.type) {
        case 'choice':
            html += `<div class="question-options">`;
            question.options.forEach((opt, idx) => {
                const labels = ['A', 'B', 'C', 'D'];
                html += `<div class="option-item" onclick="selectOption(this, '${opt}')">`;
                html += `<span class="option-label">${labels[idx]}</span>`;
                html += `<span>${opt}</span>`;
                html += `</div>`;
            });
            html += `</div>`;
            break;
        case 'fill':
            html += `<input type="text" class="fill-input" id="answer-input" placeholder="请输入答案">`;
            break;
        case 'calculate':
            html += `<input type="text" class="calculate-input" id="answer-input" placeholder="请输入计算结果">`;
            break;
        case 'application':
            html += `<div class="application-area">`;
            html += `<input type="text" class="application-input" id="answer-input" placeholder="请输入答案">`;
            html += `</div>`;
            break;
    }
    
    container.innerHTML = html;
}

function selectOption(element, value) {
    document.querySelectorAll('.option-item').forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');
}

function getSelectedAnswer() {
    const selectedOption = document.querySelector('.option-item.selected');
    if (selectedOption) {
        return selectedOption.querySelector('span:last-child').textContent;
    }
    const input = document.getElementById('answer-input');
    return input ? input.value.trim() : '';
}

function generatePracticeQuestions() {
    const settings = getSettings();
    practiceQuestions = questionGenerator.generateQuestions(settings.grade, settings.difficulty, settings.count, settings.type);
    currentPracticeIndex = 0;
    practiceCorrectCount = 0;
    
    updatePracticeProgress();
    renderQuestion(practiceQuestions[0], 'practice-question');
    document.getElementById('practice-feedback').style.display = 'none';
}

function updatePracticeProgress() {
    const progress = ((currentPracticeIndex) / practiceQuestions.length) * 100;
    document.getElementById('practice-progress').style.width = progress + '%';
    document.getElementById('practice-progress-text').textContent = `${currentPracticeIndex}/${practiceQuestions.length}`;
}

function checkPracticeAnswer() {
    if (currentPracticeIndex >= practiceQuestions.length) return;
    
    const question = practiceQuestions[currentPracticeIndex];
    const userAnswer = getSelectedAnswer();
    
    if (!userAnswer) {
        showFeedback('请先选择或输入答案！', 'incorrect');
        return;
    }
    
    const isCorrect = parseFloat(userAnswer) === parseFloat(question.answer);
    
    totalStats.totalQuestions++;
    
    if (isCorrect) {
        practiceCorrectCount++;
        totalStats.correctAnswers++;
        showFeedback(`正确！答案是 ${question.answer}`, 'correct');
        
        if (question.type === 'choice') {
            document.querySelectorAll('.option-item').forEach(item => {
                const optValue = item.querySelector('span:last-child').textContent;
                if (optValue === question.answer) {
                    item.classList.add('correct');
                }
            });
        }
    } else {
        showFeedback(`错误！正确答案是 ${question.answer}`, 'incorrect');
        
        if (question.type === 'choice') {
            document.querySelectorAll('.option-item').forEach(item => {
                const optValue = item.querySelector('span:last-child').textContent;
                if (optValue === question.answer) {
                    item.classList.add('correct');
                } else if (item.classList.contains('selected')) {
                    item.classList.add('incorrect');
                }
            });
        }
        
        const wrongItem = {
            ...question,
            userAnswer: userAnswer,
            timestamp: new Date().toISOString(),
            gradeName: gradeNames[question.grade]
        };
        practiceWrongQuestions.push(wrongItem);
        addWrongQuestion(wrongItem);
    }
    
    saveStats();
}

function showFeedback(message, type) {
    const feedback = document.getElementById('practice-feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
}

function nextPracticeQuestion() {
    if (currentPracticeIndex < practiceQuestions.length) {
        currentPracticeIndex++;
        updatePracticeProgress();
        
        if (currentPracticeIndex < practiceQuestions.length) {
            renderQuestion(practiceQuestions[currentPracticeIndex], 'practice-question');
            document.getElementById('practice-feedback').style.display = 'none';
        } else {
            showPracticeResult();
        }
    }
}

function showPracticeResult() {
    const container = document.getElementById('practice-question');
    const rate = ((practiceCorrectCount / practiceQuestions.length) * 100).toFixed(1);
    
    container.innerHTML = `
        <div class="result-panel">
            <div class="result-score">${practiceCorrectCount}/${practiceQuestions.length}</div>
            <div class="result-message">练习完成！正确率：${rate}%</div>
            <div class="result-details">
                <div class="detail-item">
                    <div class="detail-value">${practiceCorrectCount}</div>
                    <div class="detail-label">正确</div>
                </div>
                <div class="detail-item">
                    <div class="detail-value">${practiceQuestions.length - practiceCorrectCount}</div>
                    <div class="detail-label">错误</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('practice-feedback').style.display = 'none';
    
    if (practiceWrongQuestions.length > 0) {
        setTimeout(() => {
            if (confirm(`本次练习有 ${practiceWrongQuestions.length} 道错题，已加入错题本。是否查看错题本？`)) {
                switchMode('wrong');
            }
        }, 1000);
    }
}

function startTest() {
    const settings = getSettings();
    testQuestions = questionGenerator.generateQuestions(settings.grade, settings.difficulty, settings.count, settings.type);
    currentTestIndex = 0;
    testAnswers = {};
    testTimeLeft = 300;
    
    updateTestProgress();
    renderQuestion(testQuestions[0], 'test-question');
    document.getElementById('test-result').innerHTML = '';
    
    startTimer();
}

function startTimer() {
    clearInterval(testTimer);
    updateTimerDisplay();
    
    testTimer = setInterval(() => {
        testTimeLeft--;
        updateTimerDisplay();
        
        if (testTimeLeft <= 0) {
            clearInterval(testTimer);
            submitTest();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(testTimeLeft / 60);
    const seconds = testTimeLeft % 60;
    document.getElementById('test-timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTestProgress() {
    const progress = ((currentTestIndex) / testQuestions.length) * 100;
    document.getElementById('test-progress').style.width = progress + '%';
    document.getElementById('test-progress-text').textContent = `${currentTestIndex}/${testQuestions.length}`;
}

function nextTestQuestion() {
    if (currentTestIndex < testQuestions.length) {
        const currentQuestion = testQuestions[currentTestIndex];
        const userAnswer = getSelectedAnswer();
        
        if (userAnswer) {
            testAnswers[currentTestIndex] = userAnswer;
        }
        
        currentTestIndex++;
        updateTestProgress();
        
        if (currentTestIndex < testQuestions.length) {
            renderQuestion(testQuestions[currentTestIndex], 'test-question');
            
            if (testAnswers[currentTestIndex]) {
                if (currentQuestion.type === 'choice') {
                    document.querySelectorAll('.option-item').forEach(item => {
                        const optValue = item.querySelector('span:last-child').textContent;
                        if (optValue === testAnswers[currentTestIndex]) {
                            item.classList.add('selected');
                        }
                    });
                } else {
                    document.getElementById('answer-input').value = testAnswers[currentTestIndex];
                }
            }
        }
    }
}

function submitTest() {
    clearInterval(testTimer);
    
    let correctCount = 0;
    const wrongItems = [];
    
    testQuestions.forEach((question, idx) => {
        const userAnswer = testAnswers[idx] || '';
        const isCorrect = parseFloat(userAnswer) === parseFloat(question.answer);
        
        totalStats.totalQuestions++;
        
        if (isCorrect) {
            correctCount++;
            totalStats.correctAnswers++;
        } else {
            const wrongItem = {
                ...question,
                userAnswer: userAnswer,
                timestamp: new Date().toISOString(),
                gradeName: gradeNames[question.grade]
            };
            wrongItems.push(wrongItem);
            addWrongQuestion(wrongItem);
        }
    });
    
    const score = Math.round((correctCount / testQuestions.length) * 100);
    totalStats.avgScore = Math.round((totalStats.avgScore + score) / 2);
    
    saveStats();
    
    const historyItem = {
        date: new Date().toLocaleString('zh-CN'),
        grade: gradeNames[getSettings().grade],
        score: score,
        correct: correctCount,
        total: testQuestions.length
    };
    testHistory.unshift(historyItem);
    if (testHistory.length > 20) testHistory.pop();
    localStorage.setItem('testHistory', JSON.stringify(testHistory));
    
    showTestResult(score, correctCount, testQuestions.length);
}

function showTestResult(score, correct, total) {
    const container = document.getElementById('test-result');
    let message = '';
    
    if (score >= 90) message = '优秀！继续保持！';
    else if (score >= 80) message = '良好！再接再厉！';
    else if (score >= 60) message = '及格！还需努力！';
    else message = '需要多加练习！';
    
    container.innerHTML = `
        <div class="result-score">${score}分</div>
        <div class="result-message">${message}</div>
        <div class="result-details">
            <div class="detail-item">
                <div class="detail-value">${correct}</div>
                <div class="detail-label">正确</div>
            </div>
            <div class="detail-item">
                <div class="detail-value">${total - correct}</div>
                <div class="detail-label">错误</div>
            </div>
            <div class="detail-item">
                <div class="detail-value">${((correct / total) * 100).toFixed(1)}%</div>
                <div class="detail-label">正确率</div>
            </div>
        </div>
        <button class="btn btn-primary" onclick="startTest()">再测一次</button>
    `;
}

function addWrongQuestion(question) {
    const exists = wrongQuestions.some(q => q.content === question.content && q.userAnswer === question.userAnswer);
    if (!exists) {
        wrongQuestions.push(question);
        localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions));
    }
}

function loadWrongList() {
    const container = document.getElementById('wrong-list');
    
    if (wrongQuestions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">暂无错题，继续加油！</p>';
        return;
    }
    
    let html = '';
    wrongQuestions.forEach((question, idx) => {
        const date = new Date(question.timestamp).toLocaleDateString('zh-CN');
        html += `
            <div class="wrong-item">
                <div class="wrong-item-header">
                    <span>${question.gradeName}</span>
                    <span>${date}</span>
                </div>
                <div class="wrong-item-content">${question.content}</div>
                <div class="wrong-item-answer">
                    你的答案：<span class="wrong">${question.userAnswer || '未作答'}</span>
                    正确答案：<span class="correct">${question.answer}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function reviewWrongQuestions() {
    if (wrongQuestions.length === 0) {
        alert('暂无错题可复习');
        return;
    }
    
    practiceQuestions = [...wrongQuestions];
    currentPracticeIndex = 0;
    practiceCorrectCount = 0;
    practiceWrongQuestions = [];
    
    switchMode('practice');
    updatePracticeProgress();
    renderQuestion(practiceQuestions[0], 'practice-question');
    document.getElementById('practice-feedback').style.display = 'none';
}

function clearWrongQuestions() {
    if (confirm('确定要清空所有错题吗？')) {
        wrongQuestions = [];
        localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions));
        loadWrongList();
    }
}

function saveStats() {
    localStorage.setItem('totalStats', JSON.stringify(totalStats));
}

function loadAnalysis() {
    const correctRate = totalStats.totalQuestions > 0 
        ? ((totalStats.correctAnswers / totalStats.totalQuestions) * 100).toFixed(1) 
        : '0';
    
    document.getElementById('total-questions').textContent = totalStats.totalQuestions;
    document.getElementById('correct-rate').textContent = correctRate + '%';
    document.getElementById('avg-score').textContent = totalStats.avgScore;
    document.getElementById('wrong-count').textContent = wrongQuestions.length;
    
    renderChart();
    renderHistory();
}

function renderChart() {
    const canvas = document.getElementById('progress-chart');
    const ctx = canvas.getContext('2d');
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    if (testHistory.length === 0) {
        ctx.font = '16px Microsoft YaHei';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('暂无测试记录', width / 2, height / 2);
        return;
    }
    
    const scores = testHistory.slice(0, 10).reverse().map(h => h.score);
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        ctx.font = '12px Microsoft YaHei';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'right';
        ctx.fillText((100 - i * 20) + '', padding - 10, y + 4);
    }
    
    const barWidth = chartWidth / scores.length * 0.6;
    const gap = chartWidth / scores.length * 0.4;
    
    scores.forEach((score, idx) => {
        const x = padding + (chartWidth / scores.length) * idx + gap / 2;
        const barHeight = (score / 100) * chartHeight;
        const y = padding + chartHeight - barHeight;
        
        const gradient = ctx.createLinearGradient(x, y, x, padding + chartHeight);
        if (score >= 80) {
            gradient.addColorStop(0, '#28a745');
            gradient.addColorStop(1, '#20c997');
        } else if (score >= 60) {
            gradient.addColorStop(0, '#ffc107');
            gradient.addColorStop(1, '#fd7e14');
        } else {
            gradient.addColorStop(0, '#dc3545');
            gradient.addColorStop(1, '#e83e8c');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 5);
        ctx.fill();
        
        ctx.font = '12px Microsoft YaHei';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(score + '', x + barWidth / 2, padding + chartHeight + 20);
    });
}

function renderHistory() {
    const container = document.getElementById('history-list');
    
    if (testHistory.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">暂无测试记录</p>';
        return;
    }
    
    let html = '';
    testHistory.forEach(item => {
        html += `
            <div class="history-item">
                <span class="history-date">${item.date}</span>
                <span class="history-grade">${item.grade}</span>
                <span class="history-score">${item.score}分 (${item.correct}/${item.total})</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

switchMode('practice');