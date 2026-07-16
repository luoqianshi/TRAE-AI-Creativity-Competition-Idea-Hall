// ========== 能力倾向测评 ==========
// 基于 GATB 一般能力倾向测试精简版

var APTITUDE_QUESTIONS = [
  // 言语理解
  { id: 1,  text: '我能准确理解复杂的文字说明和文档。', dim: 'verbal' },
  { id: 2,  text: '我擅长用清晰的语言表达想法和观点。', dim: 'verbal' },
  { id: 3,  text: '我能快速抓住一篇文章或演讲的核心要点。', dim: 'verbal' },
  // 逻辑推理
  { id: 4,  text: '我善于发现事物之间的逻辑关系和规律。', dim: 'logic' },
  { id: 5,  text: '面对复杂问题，我能拆解成可处理的子问题。', dim: 'logic' },
  { id: 6,  text: '我擅长识别论证中的漏洞或不合理之处。', dim: 'logic' },
  // 空间认知
  { id: 7,  text: '我能在脑海中想象物体旋转后的样子。', dim: 'spatial' },
  { id: 8,  text: '我看图纸、图表或地图时感到轻松。', dim: 'spatial' },
  { id: 9,  text: '我对色彩、比例和布局有较好的判断力。', dim: 'spatial' },
  // 数理能力
  { id: 10, text: '我能快速进行心算和数量比较。', dim: 'numerical' },
  { id: 11, text: '我善于从数据中发现趋势和异常。', dim: 'numerical' },
  { id: 12, text: '面对统计或财务报表，我能迅速抓住关键信息。', dim: 'numerical' },
  // 人际交往
  { id: 13, text: '我能敏锐察觉他人的情绪和需求。', dim: 'interpersonal' },
  { id: 14, text: '我擅长调解冲突、协调不同立场。', dim: 'interpersonal' },
  { id: 15, text: '我在陌生社交场合能较快建立联系。', dim: 'interpersonal' },
  // 内省能力
  { id: 16, text: '我清楚自己的情绪触发点和压力来源。', dim: 'intrapersonal' },
  { id: 17, text: '我能客观反思自己的行为和决策。', dim: 'intrapersonal' },
  { id: 18, text: '我清楚自己的长期动机和核心价值观。', dim: 'intrapersonal' }
];

var APTITUDE_LABELS = {
  verbal: { label: '言语理解', icon: '📖', desc: '文字理解与表达能力', careers: ['内容运营', '编辑', '法律', '教师', '产品经理'] },
  logic: { label: '逻辑推理', icon: '🔗', desc: '分析与推理能力', careers: ['程序员', '分析师', '咨询', '研究员'] },
  spatial: { label: '空间认知', icon: '🎨', desc: '空间想象与审美能力', careers: ['设计师', '建筑师', '工程师', '动画师'] },
  numerical: { label: '数理能力', icon: '🔢', desc: '数字处理与数据分析', careers: ['数据分析师', '财务', '量化交易', '运营'] },
  interpersonal: { label: '人际交往', icon: '💬', desc: '沟通协调与影响力', careers: ['销售', 'HR', '市场', '管理'] },
  intrapersonal: { label: '内省能力', icon: '🧭', desc: '自我认知与反思', careers: ['独立工作者', '创作者', '心理咨询', '创业者'] }
};

var aptitudeIndex = 0;
var aptitudeAnswers = [];

function startAptitude() {
  aptitudeIndex = 0;
  aptitudeAnswers = [];
  renderAptitudeQuestion();
  navigateTo('assessment');
}

function renderAptitudeQuestion() {
  var container = document.getElementById('assessmentContent');
  if (!container) return;

  var question = APTITUDE_QUESTIONS[aptitudeIndex];
  var progress = ((aptitudeIndex + 1) / APTITUDE_QUESTIONS.length) * 100;

  container.innerHTML =
    '<div class="assessment-header">' +
      '<div class="assessment-progress-bar"><div class="assessment-progress-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="assessment-progress-text">' + (aptitudeIndex + 1) + ' / ' + APTITUDE_QUESTIONS.length + '</div>' +
      '<h2>能力倾向测评</h2>' +
      '<p class="assessment-subtitle">了解你在不同能力维度上的优势</p>' +
    '</div>' +
    '<div class="question-card">' +
      '<div class="question-text">' + question.text + '</div>' +
      '<div class="question-options">' +
        '<button class="option-btn" onclick="answerAptitude(1)">非常不符合</button>' +
        '<button class="option-btn" onclick="answerAptitude(2)">不符合</button>' +
        '<button class="option-btn" onclick="answerAptitude(3)">一般</button>' +
        '<button class="option-btn" onclick="answerAptitude(4)">符合</button>' +
        '<button class="option-btn" onclick="answerAptitude(5)">非常符合</button>' +
      '</div>' +
    '</div>' +
    '<div class="assessment-footer">' +
      '<button class="btn-secondary" onclick="navigateTo(\'assessment-guide\')">退出测评</button>' +
    '</div>';
}

function answerAptitude(score) {
  var question = APTITUDE_QUESTIONS[aptitudeIndex];
  aptitudeAnswers.push({ questionId: question.id, dimension: question.dim, score: score });
  aptitudeIndex++;
  if (aptitudeIndex < APTITUDE_QUESTIONS.length) {
    renderAptitudeQuestion();
  } else {
    calculateAptitudeResults();
  }
}

function calculateAptitudeResults() {
  var scores = { verbal: 0, logic: 0, spatial: 0, numerical: 0, interpersonal: 0, intrapersonal: 0 };
  var counts = { verbal: 0, logic: 0, spatial: 0, numerical: 0, interpersonal: 0, intrapersonal: 0 };

  aptitudeAnswers.forEach(function(a) {
    scores[a.dimension] += a.score;
    counts[a.dimension]++;
  });

  var avgScores = {};
  Object.keys(scores).forEach(function(d) {
    avgScores[d] = Math.round(scores[d] / counts[d] * 10) / 10;
  });

  localStorage.setItem('aptitudeScores', JSON.stringify(avgScores));
  markAssessmentCompleted('aptitude');
  showAptitudeResults(avgScores);
}

function showAptitudeResults(scores) {
  var container = document.getElementById('assessmentContent');
  if (!container) return;

  var sorted = Object.keys(scores).map(function(k) { return { dim: k, score: scores[k] }; }).sort(function(a, b) { return b.score - a.score; });
  var top1 = sorted[0];
  var top2 = sorted[1];

  var html = '<div class="result-header"><h2>能力倾向测评结果</h2><p>你的核心优势是 <b>' + APTITUDE_LABELS[top1.dim].label + '</b> 与 <b>' + APTITUDE_LABELS[top2.dim].label + '</b></p></div>';

  html += '<div class="result-grid">';
  sorted.forEach(function(item) {
    var info = APTITUDE_LABELS[item.dim];
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
          '<p>' + info.desc + '</p>' +
          '<p class="result-career-hint">相关方向：' + info.careers.join(' · ') + '</p>' +
        '</div>' +
      '</div>';
  });
  html += '</div>';

  html += '<div class="result-insight">';
  html += '<h3>💡 能力组合建议</h3>';
  html += '<p>' + APTITUDE_LABELS[top1.dim].label + ' + ' + APTITUDE_LABELS[top2.dim].label + ' 的组合在以下方向有较强优势：' +
    APTITUDE_LABELS[top1.dim].careers.concat(APTITUDE_LABELS[top2.dim].careers).filter(function(v, i, self) { return self.indexOf(v) === i; }).slice(0, 5).join('、') + '。</p>';
  html += '</div>';

  html +=
    '<div class="result-footer">' +
      '<button class="btn-primary" onclick="navigateTo(\'assessment-profile\')">查看画像</button>' +
      '<button class="btn-secondary" onclick="startNextAssessment()">继续测评</button>' +
      '<button class="btn-secondary" onclick="navigateTo(\'assessment-guide\')">返回引导</button>' +
    '</div>';

  container.innerHTML = html;
}
