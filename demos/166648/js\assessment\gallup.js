// ========== 盖洛普优势测评模块 (60题简版) ==========

const GALLUP_STRENGTHS = [
  { id: 'achievement', name: '成就', desc: '精力充沛，渴望有所作为' },
  { id: 'activator', name: '行动', desc: '善于将想法付诸行动' },
  { id: 'adaptability', name: '适应', desc: '灵活应对变化' },
  { id: 'analytical', name: '分析', desc: '善于分析问题和数据' },
  { id: 'arranger', name: '统筹', desc: '善于组织和协调资源' },
  { id: 'belief', name: '信仰', desc: '有坚定的价值观' },
  { id: 'command', name: '统率', desc: '善于领导和决策' },
  { id: 'communication', name: '沟通', desc: '善于表达和沟通' },
  { id: 'competition', name: '竞争', desc: '喜欢竞争和挑战' },
  { id: 'connectedness', name: '关联', desc: '相信万物互联' },
  { id: 'consistency', name: '公平', desc: '追求公平和一致' },
  { id: 'context', name: '回顾', desc: '从历史中学习' },
  { id: 'deliberative', name: '审慎', desc: '谨慎评估风险' },
  { id: 'developer', name: '开发', desc: '善于培养他人' },
  { id: 'discipline', name: '纪律', desc: '善于规划和执行' },
  { id: 'empathy', name: '共情', desc: '善于理解他人感受' },
  { id: 'focus', name: '专注', desc: '目标明确，专注执行' },
  { id: 'futuristic', name: '前瞻', desc: '关注未来可能性' },
  { id: 'harmony', name: '和谐', desc: '追求和谐与共识' },
  { id: 'ideation', name: '理念', desc: '富有想象力和创意' },
  { id: 'includer', name: '包容', desc: '善于接纳他人' },
  { id: 'individualization', name: '个别', desc: '关注个体差异' },
  { id: 'input', name: '搜集', desc: '喜欢收集信息' },
  { id: 'intellection', name: '思维', desc: '喜欢深度思考' },
  { id: 'learning', name: '学习', desc: '热爱学习和成长' },
  { id: 'maximizer', name: '完美', desc: '追求卓越和极致' },
  { id: 'positivity', name: '积极', desc: '乐观向上，充满活力' },
  { id: 'relator', name: '交往', desc: '注重深度关系' },
  { id: 'responsibility', name: '责任', desc: '勇于承担责任' },
  { id: 'restorative', name: '修复', desc: '善于解决问题' },
  { id: 'self-assurance', name: '自信', desc: '自信果断' },
  { id: 'significance', name: '影响力', desc: '渴望产生影响' },
  { id: 'strategic', name: '战略', desc: '善于规划和预见' },
  { id: 'teamwork', name: '团队合作', desc: '善于团队协作' },
  { id: 'woo', name: '取悦', desc: '善于结交新朋友' }
];

const GALLUP_QUESTIONS = generateGallupQuestions();

function generateGallupQuestions() {
  const questions = [];
  let id = 1;
  
  GALLUP_STRENGTHS.forEach((strength, idx) => {
    questions.push({
      id: id++,
      text: `我喜欢${strength.desc}`,
      strengthId: strength.id,
      reverse: false
    });
    
    questions.push({
      id: id++,
      text: `我不太喜欢${strength.desc}`,
      strengthId: strength.id,
      reverse: true
    });
  });
  
  return questions.slice(0, 60);
}

let gallupIndex = 0;
let gallupAnswers = [];

function startGallup() {
  gallupIndex = 0;
  gallupAnswers = [];
  renderGallupQuestion();
  navigateTo('assessment');
}

function renderGallupQuestion() {
  const container = document.getElementById('assessmentContent');
  if (!container) return;

  const question = GALLUP_QUESTIONS[gallupIndex];
  const progress = ((gallupIndex + 1) / GALLUP_QUESTIONS.length) * 100;

  container.innerHTML = `
    <div class="assessment-header">
      <div class="assessment-progress-bar">
        <div class="assessment-progress-fill" style="width:${progress}%"></div>
      </div>
      <div class="assessment-progress-text">${gallupIndex + 1} / ${GALLUP_QUESTIONS.length}</div>
      <h2>盖洛普优势测评</h2>
      <p class="assessment-subtitle">请根据你的实际情况选择答案</p>
    </div>

    <div class="question-card">
      <div class="question-text">${question.text}</div>
      <div class="question-options">
        <button class="option-btn" onclick="answerGallup(1)">非常不符合</button>
        <button class="option-btn" onclick="answerGallup(2)">不符合</button>
        <button class="option-btn" onclick="answerGallup(3)">一般</button>
        <button class="option-btn" onclick="answerGallup(4)">符合</button>
        <button class="option-btn" onclick="answerGallup(5)">非常符合</button>
      </div>
    </div>

    <div class="assessment-footer">
      <button class="btn-secondary" onclick="navigateTo('assessment-guide')">退出测评</button>
    </div>
  `;
}

function answerGallup(score) {
  const question = GALLUP_QUESTIONS[gallupIndex];
  gallupAnswers.push({
    questionId: question.id,
    strengthId: question.strengthId,
    score: question.reverse ? (6 - score) : score
  });

  gallupIndex++;
  if (gallupIndex < GALLUP_QUESTIONS.length) {
    renderGallupQuestion();
  } else {
    calculateGallupResults();
  }
}

function calculateGallupResults() {
  const scores = {};
  
  gallupAnswers.forEach(a => {
    if (!scores[a.strengthId]) scores[a.strengthId] = 0;
    scores[a.strengthId] += a.score;
  });

  const sorted = Object.entries(scores)
    .map(([id, score]) => {
      const strength = GALLUP_STRENGTHS.find(s => s.id === id);
      return { id, name: strength?.name || id, score, desc: strength?.desc || '' };
    })
    .sort((a, b) => b.score - a.score);

  const top5 = sorted.slice(0, 5);

  localStorage.setItem('gallupTop5', JSON.stringify(top5));
  localStorage.setItem('gallupScores', JSON.stringify(scores));
  markAssessmentCompleted('gallup');

  showGallupResults(top5, sorted);
}

function showGallupResults(top5, all) {
  const container = document.getElementById('assessmentContent');
  if (!container) return;

  container.innerHTML = `
    <div class="result-header">
      <h2>盖洛普优势测评结果</h2>
      <p>你的 Top5 优势</p>
    </div>

    <div class="gallup-top5">
      ${top5.map((strength, idx) => `
        <div class="gallup-card" style="animation-delay:${idx * 0.1}s">
          <div class="gallup-rank">${idx + 1}</div>
          <div class="gallup-info">
            <div class="gallup-name">${strength.name}</div>
            <div class="gallup-desc">${strength.desc}</div>
          </div>
          <div class="gallup-score">${strength.score}</div>
        </div>
      `).join('')}
    </div>

    <div class="result-detail">
      <h4>全部优势排序</h4>
      <div class="gallup-full-list">
        ${all.slice(0, 15).map((strength, idx) => `
          <div class="gallup-item">
            <span class="gallup-item-rank">${idx + 1}</span>
            <span class="gallup-item-name">${strength.name}</span>
            <div class="gallup-item-bar">
              <div class="gallup-item-fill" style="width:${(strength.score / 10) * 100}%"></div>
            </div>
            <span class="gallup-item-score">${strength.score}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="result-tips">
      <h4>💡 优势应用建议</h4>
      <ul>
        <li>专注于发挥你的 Top5 优势，这是你天然的优势领域</li>
        <li>寻找能够充分利用这些优势的工作环境和任务</li>
        <li>与团队成员的优势互补，形成更强的团队合力</li>
        <li>持续在优势领域深耕，形成不可替代的核心竞争力</li>
      </ul>
    </div>

    <div class="result-footer">
      <button class="btn-primary" onclick="navigateTo('assessment-profile')">查看画像</button>
      <button class="btn-secondary" onclick="startNextAssessment()">继续测评</button>
      <button class="btn-secondary" onclick="navigateTo('assessment-guide')">返回引导</button>
    </div>
  `;
}