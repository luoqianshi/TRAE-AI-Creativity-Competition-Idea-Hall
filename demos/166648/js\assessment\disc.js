// ========== DISC 测评模块 (40题) ==========

const DISC_QUESTIONS = [
  { id: 1, text: '我喜欢掌控局面', dimension: 'D', reverse: false },
  { id: 2, text: '我善于与人建立关系', dimension: 'I', reverse: false },
  { id: 3, text: '我喜欢稳定和安全', dimension: 'S', reverse: false },
  { id: 4, text: '我注重细节和准确性', dimension: 'C', reverse: false },
  { id: 5, text: '我做事果断', dimension: 'D', reverse: false },
  { id: 6, text: '我热情开朗', dimension: 'I', reverse: false },
  { id: 7, text: '我耐心可靠', dimension: 'S', reverse: false },
  { id: 8, text: '我善于分析', dimension: 'C', reverse: false },
  { id: 9, text: '我喜欢挑战', dimension: 'D', reverse: false },
  { id: 10, text: '我善于表达', dimension: 'I', reverse: false },
  { id: 11, text: '我不喜欢变化', dimension: 'S', reverse: false },
  { id: 12, text: '我追求完美', dimension: 'C', reverse: false },
  { id: 13, text: '我目标明确', dimension: 'D', reverse: false },
  { id: 14, text: '我善于说服他人', dimension: 'I', reverse: false },
  { id: 15, text: '我乐于助人', dimension: 'S', reverse: false },
  { id: 16, text: '我做事有条理', dimension: 'C', reverse: false },
  { id: 17, text: '我喜欢竞争', dimension: 'D', reverse: false },
  { id: 18, text: '我喜欢社交', dimension: 'I', reverse: false },
  { id: 19, text: '我善于倾听', dimension: 'S', reverse: false },
  { id: 20, text: '我谨慎小心', dimension: 'C', reverse: false },
  { id: 21, text: '我行动力强', dimension: 'D', reverse: false },
  { id: 22, text: '我充满活力', dimension: 'I', reverse: false },
  { id: 23, text: '我善于合作', dimension: 'S', reverse: false },
  { id: 24, text: '我善于思考', dimension: 'C', reverse: false },
  { id: 25, text: '我喜欢直接', dimension: 'D', reverse: false },
  { id: 26, text: '我善于沟通', dimension: 'I', reverse: false },
  { id: 27, text: '我喜欢按部就班', dimension: 'S', reverse: false },
  { id: 28, text: '我重视规则', dimension: 'C', reverse: false },
  { id: 29, text: '我喜欢领导', dimension: 'D', reverse: false },
  { id: 30, text: '我善于激励他人', dimension: 'I', reverse: false },
  { id: 31, text: '我不喜欢冲突', dimension: 'S', reverse: false },
  { id: 32, text: '我善于计划', dimension: 'C', reverse: false },
  { id: 33, text: '我喜欢结果导向', dimension: 'D', reverse: false },
  { id: 34, text: '我善于表达情感', dimension: 'I', reverse: false },
  { id: 35, text: '我喜欢和谐', dimension: 'S', reverse: false },
  { id: 36, text: '我善于研究', dimension: 'C', reverse: false },
  { id: 37, text: '我喜欢快速决策', dimension: 'D', reverse: false },
  { id: 38, text: '我善于交朋友', dimension: 'I', reverse: false },
  { id: 39, text: '我喜欢稳定的环境', dimension: 'S', reverse: false },
  { id: 40, text: '我善于评估风险', dimension: 'C', reverse: false }
];

let discIndex = 0;
let discAnswers = [];

const DISC_LABELS = { D: '支配型', I: '影响型', S: '稳健型', C: '服从型' };

const DISC_DESCRIPTIONS = {
  D: {
    strengths: ['果断', '自信', '目标导向', '行动力强'],
    weaknesses: ['缺乏耐心', '过于直接', '忽视细节', '不善于倾听'],
    communication: '直接、简洁、注重结果',
    career: ['管理', '销售', '创业', '领导岗位']
  },
  I: {
    strengths: ['热情', '善于社交', '乐观', '善于表达'],
    weaknesses: ['缺乏耐心', '注意力不集中', '情绪化', '不注重细节'],
    communication: '热情、友好、注重关系',
    career: ['市场', '销售', '培训', '公关']
  },
  S: {
    strengths: ['耐心', '可靠', '合作', '善于倾听'],
    weaknesses: ['害怕变化', '决策缓慢', '过于被动', '缺乏主见'],
    communication: '温和、支持、注重和谐',
    career: ['客服', '行政', '人事', '运营']
  },
  C: {
    strengths: ['细心', '严谨', '善于分析', '追求完美'],
    weaknesses: ['过于谨慎', '决策缓慢', '过于挑剔', '缺乏变通'],
    communication: '准确、详细、注重逻辑',
    career: ['技术', '财务', '审计', '数据分析']
  }
};

function startDISC() {
  discIndex = 0;
  discAnswers = [];
  renderDISCQuestion();
  navigateTo('assessment');
}

function renderDISCQuestion() {
  const container = document.getElementById('assessmentContent');
  if (!container) return;

  const question = DISC_QUESTIONS[discIndex];
  const progress = ((discIndex + 1) / DISC_QUESTIONS.length) * 100;

  container.innerHTML = `
    <div class="assessment-header">
      <div class="assessment-progress-bar">
        <div class="assessment-progress-fill" style="width:${progress}%"></div>
      </div>
      <div class="assessment-progress-text">${discIndex + 1} / ${DISC_QUESTIONS.length}</div>
      <h2>DISC 沟通风格测评</h2>
      <p class="assessment-subtitle">请根据你的实际情况选择答案</p>
    </div>

    <div class="question-card">
      <div class="question-text">${question.text}</div>
      <div class="question-options">
        <button class="option-btn" onclick="answerDISC(1)">非常不符合</button>
        <button class="option-btn" onclick="answerDISC(2)">不符合</button>
        <button class="option-btn" onclick="answerDISC(3)">一般</button>
        <button class="option-btn" onclick="answerDISC(4)">符合</button>
        <button class="option-btn" onclick="answerDISC(5)">非常符合</button>
      </div>
    </div>

    <div class="assessment-footer">
      <button class="btn-secondary" onclick="navigateTo('assessment-guide')">退出测评</button>
    </div>
  `;
}

function answerDISC(score) {
  const question = DISC_QUESTIONS[discIndex];
  discAnswers.push({
    questionId: question.id,
    dimension: question.dimension,
    score: score
  });

  discIndex++;
  if (discIndex < DISC_QUESTIONS.length) {
    renderDISCQuestion();
  } else {
    calculateDISCResults();
  }
}

function calculateDISCResults() {
  const scores = { D: 0, I: 0, S: 0, C: 0 };
  
  discAnswers.forEach(a => {
    scores[a.dimension] += a.score;
  });

  let dominant = '';
  let maxScore = 0;
  Object.entries(scores).forEach(([key, val]) => {
    if (val > maxScore) {
      maxScore = val;
      dominant = key;
    }
  });

  localStorage.setItem('discScores', JSON.stringify(scores));
  markAssessmentCompleted('disc');

  showDISCResults(scores, dominant);
}

function showDISCResults(scores, dominant) {
  const container = document.getElementById('assessmentContent');
  if (!container) return;

  const desc = DISC_DESCRIPTIONS[dominant];
  const total = scores.D + scores.I + scores.S + scores.C;

  container.innerHTML = `
    <div class="result-header">
      <h2>DISC 沟通风格测评结果</h2>
      <p>你的主导沟通风格</p>
    </div>

    <div class="mbti-type-card">
      <div class="mbti-type-badge">${DISC_LABELS[dominant]}</div>
      <div class="mbti-type-desc">${desc ? desc.communication : ''}</div>
    </div>

    <div class="result-grid">
      ${Object.entries(scores).map(([dim, score]) => {
        const percentage = Math.round((score / total) * 100);
        const colors = { D: '#EF4444', I: '#F97316', S: '#0DB8A8', C: '#4E46DC' };
        return `
          <div class="result-card">
            <div class="result-card-header">
              <span class="result-card-icon">${getDISCIcon(dim)}</span>
              <h4>${DISC_LABELS[dim]}</h4>
              <span class="result-card-score" style="color:${colors[dim]}">${score}</span>
            </div>
            <div class="result-card-body">
              <div class="result-score-bar">
                <div class="result-score-fill" style="width:${percentage}%;background:${colors[dim]}"></div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    ${desc ? `
    <div class="result-detail">
      <h4>优势特点</h4>
      <div class="feature-grid">
        ${desc.strengths.map(s => `<span class="feature-tag positive">${s}</span>`).join('')}
      </div>
      <h4>待改进点</h4>
      <div class="feature-grid">
        ${desc.weaknesses.map(w => `<span class="feature-tag negative">${w}</span>`).join('')}
      </div>
      <h4>适合的职业方向</h4>
      <div class="feature-grid">
        ${desc.career.map(c => `<span class="feature-tag">${c}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    <div class="result-footer">
      <button class="btn-primary" onclick="navigateTo('assessment-profile')">查看画像</button>
      <button class="btn-secondary" onclick="startNextAssessment()">继续测评</button>
      <button class="btn-secondary" onclick="navigateTo('assessment-guide')">返回引导</button>
    </div>
  `;
}

function getDISCIcon(dim) {
  const icons = { D: '💪', I: '💬', S: '🤝', C: '📊' };
  return icons[dim] || '📈';
}