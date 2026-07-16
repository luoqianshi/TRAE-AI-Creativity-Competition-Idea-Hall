// ========== 工作满意度测评 ==========
// 基于 JDI 工作描述指数量表精简版

var SATISFACTION_QUESTIONS = [
  // 工作本身
  { id: 1,  text: '我目前的工作内容让我感到充实和有挑战。', dim: 'work' },
  { id: 2,  text: '我能从工作中获得成就感。', dim: 'work' },
  { id: 3,  text: '我的工作能发挥我的专长和能力。', dim: 'work' },
  { id: 4,  text: '我对目前的工作内容和职责总体上感到满意。', dim: 'work' },
  // 薪酬回报
  { id: 5,  text: '我的收入水平与我的付出和能力相匹配。', dim: 'reward' },
  { id: 6,  text: '公司的薪酬福利体系让我感到公平。', dim: 'reward' },
  { id: 7,  text: '我对目前的整体收入水平感到满意。', dim: 'reward' },
  { id: 8,  text: '相比行业水平，我的回报具有竞争力。', dim: 'reward' },
  // 人际关系
  { id: 9,  text: '我与同事之间关系融洽、互相信任。', dim: 'people' },
  { id: 10, text: '我的上级能给予我足够的支持和指导。', dim: 'people' },
  { id: 11, text: '团队氛围让我感到舒适和被接纳。', dim: 'people' },
  { id: 12, text: '我在工作中能获得有效的沟通和反馈。', dim: 'people' },
  // 发展前景
  { id: 13, text: '我能看到自己在当前公司的发展空间。', dim: 'growth' },
  { id: 14, text: '公司提供了有助于我成长的培训或学习机会。', dim: 'growth' },
  { id: 15, text: '我的晋升通道清晰且可达。', dim: 'growth' },
  { id: 16, text: '当前工作对我长远的职业发展有正面价值。', dim: 'growth' }
];

var SATISFACTION_LABELS = {
  work: { label: '工作本身', icon: '💼', desc: '工作内容、挑战与成就感' },
  reward: { label: '薪酬回报', icon: '💰', desc: '收入、福利与公平感' },
  people: { label: '人际关系', icon: '👥', desc: '同事、上级与团队氛围' },
  growth: { label: '发展前景', icon: '📈', desc: '晋升、学习与长远价值' }
};

var satisfactionIndex = 0;
var satisfactionAnswers = [];

function startSatisfaction() {
  satisfactionIndex = 0;
  satisfactionAnswers = [];
  renderSatisfactionQuestion();
  navigateTo('assessment');
}

function renderSatisfactionQuestion() {
  var container = document.getElementById('assessmentContent');
  if (!container) return;

  var question = SATISFACTION_QUESTIONS[satisfactionIndex];
  var progress = ((satisfactionIndex + 1) / SATISFACTION_QUESTIONS.length) * 100;

  container.innerHTML =
    '<div class="assessment-header">' +
      '<div class="assessment-progress-bar"><div class="assessment-progress-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="assessment-progress-text">' + (satisfactionIndex + 1) + ' / ' + SATISFACTION_QUESTIONS.length + '</div>' +
      '<h2>工作满意度测评</h2>' +
      '<p class="assessment-subtitle">结合你当前的工作状态进行评估（如暂无工作可按预期工作想象）</p>' +
    '</div>' +
    '<div class="question-card">' +
      '<div class="question-text">' + question.text + '</div>' +
      '<div class="question-options">' +
        '<button class="option-btn" onclick="answerSatisfaction(1)">非常不符合</button>' +
        '<button class="option-btn" onclick="answerSatisfaction(2)">不符合</button>' +
        '<button class="option-btn" onclick="answerSatisfaction(3)">一般</button>' +
        '<button class="option-btn" onclick="answerSatisfaction(4)">符合</button>' +
        '<button class="option-btn" onclick="answerSatisfaction(5)">非常符合</button>' +
      '</div>' +
    '</div>' +
    '<div class="assessment-footer">' +
      '<button class="btn-secondary" onclick="navigateTo(\'assessment-guide\')">退出测评</button>' +
    '</div>';
}

function answerSatisfaction(score) {
  var question = SATISFACTION_QUESTIONS[satisfactionIndex];
  satisfactionAnswers.push({ questionId: question.id, dimension: question.dim, score: score });
  satisfactionIndex++;
  if (satisfactionIndex < SATISFACTION_QUESTIONS.length) {
    renderSatisfactionQuestion();
  } else {
    calculateSatisfactionResults();
  }
}

function calculateSatisfactionResults() {
  var scores = { work: 0, reward: 0, people: 0, growth: 0 };
  var counts = { work: 0, reward: 0, people: 0, growth: 0 };

  satisfactionAnswers.forEach(function(a) {
    scores[a.dimension] += a.score;
    counts[a.dimension]++;
  });

  var avgScores = {};
  Object.keys(scores).forEach(function(d) {
    avgScores[d] = Math.round(scores[d] / counts[d] * 10) / 10;
  });

  var overall = Math.round((avgScores.work + avgScores.reward + avgScores.people + avgScores.growth) / 4 * 10) / 10;

  localStorage.setItem('satisfactionScores', JSON.stringify(avgScores));
  markAssessmentCompleted('satisfaction');
  showSatisfactionResults(avgScores, overall);
}

function showSatisfactionResults(scores, overall) {
  var container = document.getElementById('assessmentContent');
  if (!container) return;

  var level = overall >= 4 ? '高满意' : overall >= 3 ? '中等满意' : '低满意';
  var levelDesc = overall >= 4 ? '你目前的工作状态总体良好，可在薄弱维度上进一步优化。'
                 : overall >= 3 ? '工作体验有亮点也有不足，建议针对性改进低分维度。'
                 : '当前工作状态偏离预期较多，建议认真审视是否需要调整或转型。';

  var sorted = Object.keys(scores).map(function(k) { return { dim: k, score: scores[k] }; }).sort(function(a, b) { return b.score - a.score; });
  var weakest = sorted[sorted.length - 1];

  var html = '<div class="result-header"><h2>工作满意度测评结果</h2><p>总体满意度：<b>' + overall + ' / 5</b>（' + level + '）</p></div>';

  html += '<div class="result-insight"><p>' + levelDesc + '</p></div>';

  html += '<div class="result-grid">';
  sorted.forEach(function(item) {
    var info = SATISFACTION_LABELS[item.dim];
    var lvl = item.score >= 4 ? 'high' : item.score >= 3 ? 'medium' : 'low';
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
          '<p>' + info.desc + (lvl === 'high' ? '（满意）' : lvl === 'medium' ? '（一般）' : '（待改进）') + '</p>' +
        '</div>' +
      '</div>';
  });
  html += '</div>';

  html += '<div class="result-insight">';
  html += '<h3>💡 改进建议</h3>';
  html += '<p>当前最薄弱的维度是 <b>' + SATISFACTION_LABELS[weakest.dim].label + '</b>。建议优先在该维度寻找改善空间，若长期无法提升且与核心价值观冲突，可考虑借助决策平衡单评估是否转型。</p>';
  html += '</div>';

  html +=
    '<div class="result-footer">' +
      '<button class="btn-primary" onclick="navigateTo(\'assessment-profile\')">查看画像</button>' +
      '<button class="btn-secondary" onclick="startNextAssessment()">继续测评</button>' +
      '<button class="btn-secondary" onclick="navigateTo(\'assessment-guide\')">返回引导</button>' +
    '</div>';

  container.innerHTML = html;
}
