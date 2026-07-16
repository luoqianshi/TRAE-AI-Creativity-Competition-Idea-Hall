// ========== 大五人格测评模块 (简版60题) ==========

const BIG5_QUESTIONS = [
  { id: 1, text: '我是一个充满活力的人', dimension: 'E', reverse: false },
  { id: 2, text: '我喜欢学习新事物', dimension: 'O', reverse: false },
  { id: 3, text: '我做事有条理', dimension: 'C', reverse: false },
  { id: 4, text: '我容易相信别人', dimension: 'A', reverse: false },
  { id: 5, text: '我经常感到焦虑', dimension: 'N', reverse: false },
  { id: 6, text: '我喜欢社交活动', dimension: 'E', reverse: false },
  { id: 7, text: '我有丰富的想象力', dimension: 'O', reverse: false },
  { id: 8, text: '我信守承诺', dimension: 'C', reverse: false },
  { id: 9, text: '我对他人很友善', dimension: 'A', reverse: false },
  { id: 10, text: '我情绪起伏较大', dimension: 'N', reverse: false },
  { id: 11, text: '我喜欢独处', dimension: 'E', reverse: true },
  { id: 12, text: '我喜欢传统的方式', dimension: 'O', reverse: true },
  { id: 13, text: '我做事比较随意', dimension: 'C', reverse: true },
  { id: 14, text: '我对他人比较挑剔', dimension: 'A', reverse: true },
  { id: 15, text: '我情绪比较稳定', dimension: 'N', reverse: true },
  { id: 16, text: '我在社交场合中很活跃', dimension: 'E', reverse: false },
  { id: 17, text: '我对艺术很感兴趣', dimension: 'O', reverse: false },
  { id: 18, text: '我很勤奋', dimension: 'C', reverse: false },
  { id: 19, text: '我乐于帮助别人', dimension: 'A', reverse: false },
  { id: 20, text: '我容易生气', dimension: 'N', reverse: false },
  { id: 21, text: '我不太喜欢与人交往', dimension: 'E', reverse: true },
  { id: 22, text: '我不喜欢尝试新方法', dimension: 'O', reverse: true },
  { id: 23, text: '我经常拖延', dimension: 'C', reverse: true },
  { id: 24, text: '我不太关心别人的感受', dimension: 'A', reverse: true },
  { id: 25, text: '我很少感到紧张', dimension: 'N', reverse: true },
  { id: 26, text: '我很外向', dimension: 'E', reverse: false },
  { id: 27, text: '我喜欢思考抽象的概念', dimension: 'O', reverse: false },
  { id: 28, text: '我善于规划', dimension: 'C', reverse: false },
  { id: 29, text: '我善于合作', dimension: 'A', reverse: false },
  { id: 30, text: '我容易感到沮丧', dimension: 'N', reverse: false },
  { id: 31, text: '我比较内向', dimension: 'E', reverse: true },
  { id: 32, text: '我缺乏好奇心', dimension: 'O', reverse: true },
  { id: 33, text: '我缺乏自律', dimension: 'C', reverse: true },
  { id: 34, text: '我比较自私', dimension: 'A', reverse: true },
  { id: 35, text: '我心态很平和', dimension: 'N', reverse: true },
  { id: 36, text: '我喜欢结识新朋友', dimension: 'E', reverse: false },
  { id: 37, text: '我喜欢表达自己', dimension: 'O', reverse: false },
  { id: 38, text: '我做事认真负责', dimension: 'C', reverse: false },
  { id: 39, text: '我很有同情心', dimension: 'A', reverse: false },
  { id: 40, text: '我对事情容易感到担心', dimension: 'N', reverse: false },
  { id: 41, text: '我更喜欢自己做事', dimension: 'E', reverse: true },
  { id: 42, text: '我喜欢一成不变', dimension: 'O', reverse: true },
  { id: 43, text: '我不太注重细节', dimension: 'C', reverse: true },
  { id: 44, text: '我不太愿意妥协', dimension: 'A', reverse: true },
  { id: 45, text: '我很少感到不安', dimension: 'N', reverse: true },
  { id: 46, text: '我精力充沛', dimension: 'E', reverse: false },
  { id: 47, text: '我喜欢探索不同的观点', dimension: 'O', reverse: false },
  { id: 48, text: '我追求完美', dimension: 'C', reverse: false },
  { id: 49, text: '我愿意倾听别人的意见', dimension: 'A', reverse: false },
  { id: 50, text: '我容易感到压力', dimension: 'N', reverse: false },
  { id: 51, text: '我不太主动与人交流', dimension: 'E', reverse: true },
  { id: 52, text: '我不喜欢变化', dimension: 'O', reverse: true },
  { id: 53, text: '我不太遵守规则', dimension: 'C', reverse: true },
  { id: 54, text: '我比较固执', dimension: 'A', reverse: true },
  { id: 55, text: '我情绪很平稳', dimension: 'N', reverse: true },
  { id: 56, text: '我善于与人沟通', dimension: 'E', reverse: false },
  { id: 57, text: '我喜欢创新', dimension: 'O', reverse: false },
  { id: 58, text: '我很可靠', dimension: 'C', reverse: false },
  { id: 59, text: '我很随和', dimension: 'A', reverse: false },
  { id: 60, text: '我经常感到担心', dimension: 'N', reverse: false }
];

let big5Index = 0;
let big5Answers = [];

const BIG5_LABELS = {
  O: '开放性', C: '尽责性', E: '外向性', A: '宜人性', N: '神经质'
};

const BIG5_DESCRIPTIONS = {
  O: {
    high: '你富有想象力和创造力，对新观念和新体验持开放态度，喜欢探索和学习。',
    medium: '你在开放性方面比较平衡，既能接受新事物，也能保持一定的传统。',
    low: '你更倾向于传统和熟悉的方式，喜欢确定性和稳定性。'
  },
  C: {
    high: '你自律、可靠、有组织，善于规划和执行，追求成就和完美。',
    medium: '你在尽责性方面比较平衡，既能完成任务，也能灵活应对变化。',
    low: '你更倾向于灵活和随性，不太喜欢严格的计划和约束。'
  },
  E: {
    high: '你外向、活跃、善于社交，喜欢与人交往，从社交中获得能量。',
    medium: '你在内外向方面比较平衡，既能享受社交，也能享受独处。',
    low: '你内向、安静，更喜欢独处或小范围交流，从内部世界获得能量。'
  },
  A: {
    high: '你友善、合作、富有同情心，善于理解和关心他人。',
    medium: '你在宜人性方面比较平衡，既能关心他人，也能维护自己的利益。',
    low: '你更倾向于独立和竞争，不太在意他人的感受。'
  },
  N: {
    high: '你情绪敏感，容易感到焦虑和压力，但也可能更富有同理心和创造力。',
    medium: '你情绪比较稳定，既能感受情绪，也能控制情绪。',
    low: '你情绪稳定，心态平和，不容易受到外界影响。'
  }
};

function startBig5() {
  big5Index = 0;
  big5Answers = [];
  renderBig5Question();
  navigateTo('assessment');
}

function renderBig5Question() {
  const container = document.getElementById('assessmentContent');
  if (!container) return;

  const question = BIG5_QUESTIONS[big5Index];
  const progress = ((big5Index + 1) / BIG5_QUESTIONS.length) * 100;

  container.innerHTML = `
    <div class="assessment-header">
      <div class="assessment-progress-bar">
        <div class="assessment-progress-fill" style="width:${progress}%"></div>
      </div>
      <div class="assessment-progress-text">${big5Index + 1} / ${BIG5_QUESTIONS.length}</div>
      <h2>大五人格测评</h2>
      <p class="assessment-subtitle">请根据你的实际情况选择答案</p>
    </div>

    <div class="question-card">
      <div class="question-text">${question.text}</div>
      <div class="question-options">
        <button class="option-btn" onclick="answerBig5(1)">非常不符合</button>
        <button class="option-btn" onclick="answerBig5(2)">不符合</button>
        <button class="option-btn" onclick="answerBig5(3)">一般</button>
        <button class="option-btn" onclick="answerBig5(4)">符合</button>
        <button class="option-btn" onclick="answerBig5(5)">非常符合</button>
      </div>
    </div>

    <div class="assessment-footer">
      <button class="btn-secondary" onclick="navigateTo('assessment-guide')">退出测评</button>
    </div>
  `;
}

function answerBig5(score) {
  const question = BIG5_QUESTIONS[big5Index];
  big5Answers.push({
    questionId: question.id,
    dimension: question.dimension,
    score: question.reverse ? (6 - score) : score
  });

  big5Index++;
  if (big5Index < BIG5_QUESTIONS.length) {
    renderBig5Question();
  } else {
    calculateBig5Results();
  }
}

function calculateBig5Results() {
  const scores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const counts = { O: 0, C: 0, E: 0, A: 0, N: 0 };

  big5Answers.forEach(a => {
    scores[a.dimension] += a.score;
    counts[a.dimension]++;
  });

  const avgScores = {};
  Object.keys(scores).forEach(d => {
    avgScores[d] = Math.round(scores[d] / counts[d] * 10) / 10;
  });

  localStorage.setItem('big5Scores', JSON.stringify(avgScores));
  markAssessmentCompleted('big5');

  showBig5Results(avgScores);
}

function showBig5Results(scores) {
  const container = document.getElementById('assessmentContent');
  if (!container) return;

  let resultHtml = '<div class="result-header"><h2>大五人格测评结果</h2><p>基于你的回答，以下是你的人格特征分析</p></div>';

  resultHtml += '<div class="result-grid">';
  Object.entries(scores).forEach(([dim, score]) => {
    const level = score >= 4 ? 'high' : score >= 3 ? 'medium' : 'low';
    const color = score >= 4 ? '#0DB8A8' : score >= 3 ? '#E8990A' : '#DC5078';
    
    resultHtml += `
      <div class="result-card">
        <div class="result-card-header">
          <span class="result-card-icon">${getBig5Icon(dim)}</span>
          <h4>${BIG5_LABELS[dim]}</h4>
          <span class="result-card-score" style="color:${color}">${score}</span>
        </div>
        <div class="result-card-body">
          <div class="result-score-bar">
            <div class="result-score-fill" style="width:${(score / 5) * 100}%;background:${color}"></div>
          </div>
          <p>${BIG5_DESCRIPTIONS[dim][level]}</p>
        </div>
      </div>
    `;
  });
  resultHtml += '</div>';

  resultHtml += `
    <div class="result-footer">
      <button class="btn-primary" onclick="navigateTo('assessment-profile')">查看画像</button>
      <button class="btn-secondary" onclick="startNextAssessment()">继续测评</button>
      <button class="btn-secondary" onclick="navigateTo('assessment-guide')">返回引导</button>
    </div>
  `;

  container.innerHTML = resultHtml;
}

function getBig5Icon(dim) {
  const icons = { O: '🎨', C: '📋', E: '👥', A: '❤️', N: '🌊' };
  return icons[dim] || '📊';
}