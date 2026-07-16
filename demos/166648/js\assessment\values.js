// ========== 职业价值观测评 ==========
// 基于 Super 工作价值观量表精简版

var VALUES_QUESTIONS = [
  { id: 1,  text: '工作中能不断取得新成就，让我很有成就感。', dim: 'achievement' },
  { id: 2,  text: '我希望工作能提供稳定的收入和长期保障。', dim: 'security' },
  { id: 3,  text: '与同事融洽相处、有良好的人际氛围对我很重要。', dim: 'relationships' },
  { id: 4,  text: '我希望能自主安排工作方式和节奏。', dim: 'autonomy' },
  { id: 5,  text: '看到自己的工作成果产生实际影响，我会非常满足。', dim: 'achievement' },
  { id: 6,  text: '工作内容和回报可预期、不经常变动，让我更安心。', dim: 'security' },
  { id: 7,  text: '我重视工作中建立的友谊和团队归属感。', dim: 'relationships' },
  { id: 8,  text: '我希望能自由选择解决问题的方法，而非被严格规定。', dim: 'autonomy' },
  { id: 9,  text: '我享受攻克难题后带来的成就感。', dim: 'achievement' },
  { id: 10, text: '完善的福利和退休保障是我择业时重点考虑的因素。', dim: 'security' },
  { id: 11, text: '和谐的上下级关系比高薪更重要。', dim: 'relationships' },
  { id: 12, text: '我倾向在被授权而非被监督的环境中工作。', dim: 'autonomy' },
  { id: 13, text: '我希望自己的努力能被组织和社会认可。', dim: 'achievement' },
  { id: 14, text: '相比高风险高回报，我更倾向稳定可预期的发展路径。', dim: 'security' },
  { id: 15, text: '工作之外能有一群志同道合的伙伴很重要。', dim: 'relationships' },
  { id: 16, text: '能独立决策并对结果负责，是我理想的工作状态。', dim: 'autonomy' }
];

var VALUES_LABELS = {
  achievement: { label: '成就感', icon: '🏆', desc: '重视成果、认可与挑战' },
  security: { label: '安全感', icon: '🛡️', desc: '重视稳定、保障与可预期' },
  relationships: { label: '人际关系', icon: '🤝', desc: '重视团队、友谊与归属' },
  autonomy: { label: '自主性', icon: '🕊️', desc: '重视自由、独立与决策权' }
};

var valuesIndex = 0;
var valuesAnswers = [];

function startValues() {
  valuesIndex = 0;
  valuesAnswers = [];
  renderValuesQuestion();
  navigateTo('assessment');
}

function renderValuesQuestion() {
  var container = document.getElementById('assessmentContent');
  if (!container) return;

  var question = VALUES_QUESTIONS[valuesIndex];
  var progress = ((valuesIndex + 1) / VALUES_QUESTIONS.length) * 100;

  container.innerHTML =
    '<div class="assessment-header">' +
      '<div class="assessment-progress-bar"><div class="assessment-progress-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="assessment-progress-text">' + (valuesIndex + 1) + ' / ' + VALUES_QUESTIONS.length + '</div>' +
      '<h2>职业价值观测评</h2>' +
      '<p class="assessment-subtitle">根据你对以下描述的认同程度选择</p>' +
    '</div>' +
    '<div class="question-card">' +
      '<div class="question-text">' + question.text + '</div>' +
      '<div class="question-options">' +
        '<button class="option-btn" onclick="answerValues(1)">非常不认同</button>' +
        '<button class="option-btn" onclick="answerValues(2)">不认同</button>' +
        '<button class="option-btn" onclick="answerValues(3)">一般</button>' +
        '<button class="option-btn" onclick="answerValues(4)">认同</button>' +
        '<button class="option-btn" onclick="answerValues(5)">非常认同</button>' +
      '</div>' +
    '</div>' +
    '<div class="assessment-footer">' +
      '<button class="btn-secondary" onclick="navigateTo(\'assessment-guide\')">退出测评</button>' +
    '</div>';
}

function answerValues(score) {
  var question = VALUES_QUESTIONS[valuesIndex];
  valuesAnswers.push({ questionId: question.id, dimension: question.dim, score: score });
  valuesIndex++;
  if (valuesIndex < VALUES_QUESTIONS.length) {
    renderValuesQuestion();
  } else {
    calculateValuesResults();
  }
}

function calculateValuesResults() {
  var scores = { achievement: 0, security: 0, relationships: 0, autonomy: 0 };
  var counts = { achievement: 0, security: 0, relationships: 0, autonomy: 0 };

  valuesAnswers.forEach(function(a) {
    scores[a.dimension] += a.score;
    counts[a.dimension]++;
  });

  var avgScores = {};
  Object.keys(scores).forEach(function(d) {
    avgScores[d] = Math.round(scores[d] / counts[d] * 10) / 10;
  });

  localStorage.setItem('valuesScores', JSON.stringify(avgScores));
  markAssessmentCompleted('values');
  showValuesResults(avgScores);
}

function showValuesResults(scores) {
  var container = document.getElementById('assessmentContent');
  if (!container) return;

  // 排序找出主导价值观
  var sorted = Object.keys(scores).map(function(k) { return { dim: k, score: scores[k] }; }).sort(function(a, b) { return b.score - a.score; });
  var dominant = sorted[0];

  var html = '<div class="result-header"><h2>职业价值观测评结果</h2><p>你的主导价值观是 <b>' + VALUES_LABELS[dominant.dim].label + '</b></p></div>';

  html += '<div class="result-grid">';
  sorted.forEach(function(item) {
    var info = VALUES_LABELS[item.dim];
    var level = item.score >= 4 ? 'high' : item.score >= 3 ? 'medium' : 'low';
    var color = item.score >= 4 ? '#0DB8A8' : item.score >= 3 ? '#E8990A' : '#DC5078';
    html +=
      '<div class="result-card">' +
        '<div class="result-card-header">' +
          '<span class="result-card-icon">' + info.icon + '</span>' +
          '<h4>' + info.label + '</h4>' +
          '<span class="result-card-score" style="color:' + color + '">' + item.score + '</span>' +
        '</div>' +
        '<div class="result-card-body">' +
          '<div class="result-score-bar"><div class="result-score-fill" style="width:' + (item.score / 5 * 100) + '%;background:' + color + '"></div></div>' +
          '<p>' + info.desc + (level === 'high' ? '（高度重视）' : level === 'medium' ? '（中等重视）' : '（较少关注）') + '</p>' +
        '</div>' +
      '</div>';
  });
  html += '</div>';

  html += '<div class="result-insight">';
  html += '<h3>💡 价值观应用建议</h3>';
  html += '<p>择业时优先考察能体现你 <b>' + VALUES_LABELS[dominant.dim].label + '</b> 价值的环境。当多项价值观分数接近时，说明你的价值观较均衡，可结合职业锚测评进一步厘清优先级。</p>';
  html += '</div>';

  html +=
    '<div class="result-footer">' +
      '<button class="btn-primary" onclick="navigateTo(\'assessment-profile\')">查看画像</button>' +
      '<button class="btn-secondary" onclick="startNextAssessment()">继续测评</button>' +
      '<button class="btn-secondary" onclick="navigateTo(\'assessment-guide\')">返回引导</button>' +
    '</div>';

  container.innerHTML = html;
}
