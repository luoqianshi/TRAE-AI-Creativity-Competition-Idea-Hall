// ========== 职业成熟度测评 ==========
// 基于 Crites 职业成熟度量表精简版

var MATURITY_QUESTIONS = [
  // 职业认知
  { id: 1,  text: '我清楚了解至少3种不同职业的工作内容和要求。', dim: 'awareness' },
  { id: 2,  text: '我能准确说出自己的优势、劣势和兴趣所在。', dim: 'awareness' },
  { id: 3,  text: '我了解当前就业市场的发展趋势和热门方向。', dim: 'awareness' },
  { id: 4,  text: '我清楚不同职业路径的发展阶段和能力要求。', dim: 'awareness' },
  { id: 5,  text: '我能客观评估一份工作与自身条件的匹配度。', dim: 'awareness' },
  // 职业规划
  { id: 6,  text: '我有明确的3-5年职业发展目标。', dim: 'planning' },
  { id: 7,  text: '我制定了为实现职业目标所需的学习和提升计划。', dim: 'planning' },
  { id: 8,  text: '我会定期回顾并调整自己的职业规划。', dim: 'planning' },
  { id: 9,  text: '我有意识地为未来职业发展积累资源和人脉。', dim: 'planning' },
  { id: 10, text: '我能识别职业发展中的关键节点和转折机会。', dim: 'planning' },
  // 决策能力
  { id: 11, text: '面对多个职业选择时，我能系统地比较利弊。', dim: 'decision' },
  { id: 12, text: '我能在信息不充分的情况下做出相对合理的职业决策。', dim: 'decision' },
  { id: 13, text: '我会主动收集有助于职业决策的信息和建议。', dim: 'decision' },
  { id: 14, text: '我能承受职业决策带来的不确定性和压力。', dim: 'decision' },
  { id: 15, text: '做出职业选择后，我能坚持执行而不轻易动摇。', dim: 'decision' }
];

var MATURITY_LABELS = {
  awareness: { label: '职业认知', icon: '🔍', desc: '对自我和职业世界的了解程度' },
  planning: { label: '职业规划', icon: '🗺️', desc: '设定目标并制定路径的能力' },
  decision: { label: '决策能力', icon: '⚖️', desc: '在不确定性中做出选择的能力' }
};

var maturityIndex = 0;
var maturityAnswers = [];

function startMaturity() {
  maturityIndex = 0;
  maturityAnswers = [];
  renderMaturityQuestion();
  navigateTo('assessment');
}

function renderMaturityQuestion() {
  var container = document.getElementById('assessmentContent');
  if (!container) return;

  var question = MATURITY_QUESTIONS[maturityIndex];
  var progress = ((maturityIndex + 1) / MATURITY_QUESTIONS.length) * 100;

  container.innerHTML =
    '<div class="assessment-header">' +
      '<div class="assessment-progress-bar"><div class="assessment-progress-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="assessment-progress-text">' + (maturityIndex + 1) + ' / ' + MATURITY_QUESTIONS.length + '</div>' +
      '<h2>职业成熟度测评</h2>' +
      '<p class="assessment-subtitle">评估你的职业规划准备度和决策能力</p>' +
    '</div>' +
    '<div class="question-card">' +
      '<div class="question-text">' + question.text + '</div>' +
      '<div class="question-options">' +
        '<button class="option-btn" onclick="answerMaturity(1)">非常不符合</button>' +
        '<button class="option-btn" onclick="answerMaturity(2)">不符合</button>' +
        '<button class="option-btn" onclick="answerMaturity(3)">一般</button>' +
        '<button class="option-btn" onclick="answerMaturity(4)">符合</button>' +
        '<button class="option-btn" onclick="answerMaturity(5)">非常符合</button>' +
      '</div>' +
    '</div>' +
    '<div class="assessment-footer">' +
      '<button class="btn-secondary" onclick="navigateTo(\'assessment-guide\')">退出测评</button>' +
    '</div>';
}

function answerMaturity(score) {
  var question = MATURITY_QUESTIONS[maturityIndex];
  maturityAnswers.push({ questionId: question.id, dimension: question.dim, score: score });
  maturityIndex++;
  if (maturityIndex < MATURITY_QUESTIONS.length) {
    renderMaturityQuestion();
  } else {
    calculateMaturityResults();
  }
}

function calculateMaturityResults() {
  var scores = { awareness: 0, planning: 0, decision: 0 };
  var counts = { awareness: 0, planning: 0, decision: 0 };

  maturityAnswers.forEach(function(a) {
    scores[a.dimension] += a.score;
    counts[a.dimension]++;
  });

  var avgScores = {};
  Object.keys(scores).forEach(function(d) {
    avgScores[d] = Math.round(scores[d] / counts[d] * 10) / 10;
  });

  var overall = Math.round((avgScores.awareness + avgScores.planning + avgScores.decision) / 3 * 10) / 10;

  localStorage.setItem('maturityScores', JSON.stringify(avgScores));
  markAssessmentCompleted('maturity');
  showMaturityResults(avgScores, overall);
}

function showMaturityResults(scores, overall) {
  var container = document.getElementById('assessmentContent');
  if (!container) return;

  var level = overall >= 4 ? '成熟' : overall >= 3 ? '发展中' : '起步期';
  var levelDesc = overall >= 4 ? '你已具备较成熟的职业认知和决策能力，可主动寻求更高挑战。'
                 : overall >= 3 ? '你已有一定基础，但在某些维度仍需加强。'
                 : '建议优先补足职业认知与规划基础，再做重大决策。';

  var html = '<div class="result-header"><h2>职业成熟度测评结果</h2><p>总体成熟度：<b>' + overall + ' / 5</b>（' + level + '）</p></div>';

  html += '<div class="result-insight"><p>' + levelDesc + '</p></div>';

  html += '<div class="result-grid">';
  Object.keys(scores).forEach(function(dim) {
    var info = MATURITY_LABELS[dim];
    var score = scores[dim];
    var lvl = score >= 4 ? 'high' : score >= 3 ? 'medium' : 'low';
    var color = score >= 4 ? '#0DB8A8' : score >= 3 ? '#E8990A' : '#DC5078';
    html +=
      '<div class="result-card">' +
        '<div class="result-card-header">' +
          '<span class="result-card-icon">' + info.icon + '</span>' +
          '<h4>' + info.label + '</h4>' +
          '<span class="result-card-score" style="color:' + color + '">' + score + '</span>' +
        '</div>' +
        '<div class="result-card-body">' +
          '<div class="result-score-bar"><div class="result-score-fill" style="width:' + (score / 5 * 100) + '%;background:' + color + '"></div></div>' +
          '<p>' + info.desc + (lvl === 'high' ? '（表现优异）' : lvl === 'medium' ? '（可进一步提升）' : '（需重点加强）') + '</p>' +
        '</div>' +
      '</div>';
  });
  html += '</div>';

  html +=
    '<div class="result-footer">' +
      '<button class="btn-primary" onclick="navigateTo(\'assessment-profile\')">查看画像</button>' +
      '<button class="btn-secondary" onclick="startNextAssessment()">继续测评</button>' +
      '<button class="btn-secondary" onclick="navigateTo(\'assessment-guide\')">返回引导</button>' +
    '</div>';

  container.innerHTML = html;
}
