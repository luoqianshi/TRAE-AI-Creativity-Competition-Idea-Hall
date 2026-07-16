// ========== 测评引导模块 ==========

const ASSESSMENT_LIBRARY = {
  // 核心测评（P0）
  'riasec': { name: '霍兰德职业兴趣', questions: 42, duration: '8分钟', type: '兴趣', priority: 'P0', icon: '🎯', desc: '了解你的职业兴趣方向，生成Holland代码', theory: '基于John Holland的RIASEC六边形理论' },
  'anchor': { name: 'Schein职业锚', questions: 8, duration: '5分钟', type: '价值观', priority: 'P0', icon: '⚓', desc: '发现你的核心职业价值观和驱动力', theory: '基于Edgar Schein的职业锚理论' },
  // 人格测评（P1）
  'big5': { name: '大五人格', questions: 60, duration: '10分钟', type: '人格', priority: 'P1', icon: '🧠', desc: '从五个维度全面了解你的人格特质', theory: '基于IPIP-NEO-PI的五因子模型' },
  // 进阶测评（P2）
  'mbti': { name: 'MBTI性格类型', questions: 93, duration: '18分钟', type: '人格', priority: 'P2', icon: '🔮', desc: '探索你的16型性格，理解认知偏好', theory: '基于Jung的认知功能理论' },
  'disc': { name: 'DISC沟通风格', questions: 40, duration: '10分钟', type: '沟通', priority: 'P2', icon: '💬', desc: '识别你的行为风格，提升人际互动', theory: '基于William Marston的DISC模型' },
  'gallup': { name: '盖洛普优势', questions: 60, duration: '15分钟', type: '优势', priority: 'P2', icon: '⭐', desc: '发现你的天赋优势，聚焦核心竞争力', theory: '基于CliftonStrengths评估' },
  // 扩展测评（P3 - 新增）
  'values': { name: '职业价值观测评', questions: 16, duration: '4分钟', type: '价值观', priority: 'P3', icon: '💎', desc: '识别你在工作中最看重的价值要素', theory: '基于Super的工作价值观量表' },
  'maturity': { name: '职业成熟度', questions: 15, duration: '4分钟', type: '发展', priority: 'P3', icon: '🌱', desc: '评估你的职业规划准备度和决策能力', theory: '基于Crites的职业成熟度量表' },
  'aptitude': { name: '能力倾向测评', questions: 18, duration: '5分钟', type: '能力', priority: 'P3', icon: '📊', desc: '了解你在言语、逻辑、空间等方面的优势', theory: '基于GATB一般能力倾向测试' },
  'satisfaction': { name: '工作满意度', questions: 16, duration: '4分钟', type: '状态', priority: 'P3', icon: '😊', desc: '评估当前工作的满意程度和改进方向', theory: '基于JDI工作描述指数量表' }
};

// 测评分类
const ASSESSMENT_CATEGORIES = {
  '核心测评': ['riasec', 'anchor'],
  '人格测评': ['big5', 'mbti'],
  '风格与优势': ['disc', 'gallup'],
  '扩展测评': ['values', 'maturity', 'aptitude', 'satisfaction']
};

// 测评组合推荐规则
const RECOMMENDATION_RULES = {
  '快速探索': { duration: '5分钟', assessments: ['riasec'], desc: '快速了解职业兴趣方向' },
  '标准评估': { duration: '15分钟', assessments: ['riasec', 'anchor'], desc: '兴趣+价值观双维度评估' },
  '深度规划': { duration: '30分钟', assessments: ['big5', 'riasec', 'anchor'], desc: '人格+兴趣+价值观全面分析' },
  '团队适配': { duration: '25分钟', assessments: ['disc', 'riasec'], desc: '沟通风格+职业兴趣分析' },
  '职业转型': { duration: '25分钟', assessments: ['anchor', 'riasec', 'values'], desc: '价值观+兴趣+职业价值观综合评估' },
  '能力盘点': { duration: '20分钟', assessments: ['aptitude', 'gallup'], desc: '能力倾向+核心优势全面盘点' },
  '求职准备': { duration: '25分钟', assessments: ['maturity', 'riasec', 'satisfaction'], desc: '职业成熟度+兴趣方向+现状评估' }
};

const DIAGNOSTIC_QUESTIONS = [
  {
    id: 'stage',
    question: '你当前处于什么职业阶段？',
    options: ['学生', '职场新人(0-3年)', '成长期(3-5年)', '转型期', '资深从业者(10年+)']
  },
  {
    id: 'goal',
    question: '你最想解决什么问题？',
    options: ['找方向', '确认选择', '准备跳槽', '提升竞争力']
  },
  {
    id: 'time',
    question: '你愿意花多长时间完成测评？',
    options: ['5分钟', '15分钟', '30分钟']
  }
];

let diagnosticAnswers = {};

function startAssessmentGuide() {
  diagnosticAnswers = {};
  renderAssessmentGuide();
  navigateTo('assessment-guide');
}

function renderAssessmentGuide() {
  const container = document.getElementById('assessmentGuideContent');
  if (!container) return;

  let html = '<div class="guide-header">';
  html += '<h2 class="guide-title">🎯 测评引导</h2>';
  html += '<p class="guide-subtitle">回答几个简单问题，为你推荐最合适的测评组合</p>';
  html += '</div>';

  html += '<div class="guide-questions">';
  DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
    html += '<div class="guide-question">';
    html += '<div class="guide-question-number">' + (idx + 1) + '</div>';
    html += '<div class="guide-question-text">' + q.question + '</div>';
    html += '<div class="guide-options">';
    q.options.forEach(opt => {
      const selected = diagnosticAnswers[q.id] === opt ? 'selected' : '';
      html += '<button class="guide-option-btn ' + selected + '" onclick="selectDiagnosticOption(\'' + q.id + '\', \'' + opt.replace(/'/g, "\\'") + '\')">' + opt + '</button>';
    });
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';

  const allAnswered = DIAGNOSTIC_QUESTIONS.every(q => diagnosticAnswers[q.id]);
  if (allAnswered) {
    const recommendation = recommendAssessment(
      diagnosticAnswers.stage,
      diagnosticAnswers.goal,
      diagnosticAnswers.time
    );
    html += renderRecommendation(recommendation);
  } else {
    html += '<div class="guide-hint">请回答完所有问题以获取推荐</div>';
  }

  container.innerHTML = html;
}

function selectDiagnosticOption(questionId, option) {
  diagnosticAnswers[questionId] = option;
  renderAssessmentGuide();
}

function recommendAssessment(stage, goal, time) {
  const timeMap = { '5分钟': '快速探索', '15分钟': '标准评估', '30分钟': '深度规划' };
  
  if (goal === '找方向') return RECOMMENDATION_RULES[timeMap[time]];
  if (goal === '确认选择') return RECOMMENDATION_RULES['标准评估'];
  if (goal === '准备跳槽') return RECOMMENDATION_RULES['深度规划'];
  if (goal === '提升竞争力') return RECOMMENDATION_RULES['标准评估'];
  if (stage === '转型期') return RECOMMENDATION_RULES['职业转型'];
  if (stage === '资深从业者') return RECOMMENDATION_RULES['深度规划'];
  if (stage === '学生') return RECOMMENDATION_RULES['标准评估'];
  
  return RECOMMENDATION_RULES[timeMap[time]];
}

function renderRecommendation(plan) {
  if (!plan) return '';
  
  let html = '<div class="guide-recommendation">';
  html += '<div class="guide-rec-title">为你推荐：' + plan.desc + '</div>';
  html += '<div class="guide-rec-duration">' + plan.duration + '</div>';
  
  html += '<div class="guide-rec-assessments">';
  plan.assessments.forEach(id => {
    const info = ASSESSMENT_LIBRARY[id];
    html += '<div class="guide-rec-item">';
    html += '<span class="guide-rec-icon">' + info.icon + '</span>';
    html += '<div class="guide-rec-info">';
    html += '<div class="guide-rec-name">' + info.name + '</div>';
    html += '<div class="guide-rec-detail">' + info.questions + '题 · ' + info.duration + '</div>';
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';

  html += '<div class="guide-rec-actions">';
  html += '<button class="btn-primary-v5" onclick="startRecommendedAssessment(\'' + JSON.stringify(plan.assessments).replace(/"/g, '\\"') + '\')">开始测评 →</button>';
  html += '<button class="btn-secondary-v5" onclick="showCustomAssessment()">自定义选择</button>';
  html += '</div>';
  
  html += '</div>';
  return html;
}

function startRecommendedAssessment(assessmentsJson) {
  const assessments = JSON.parse(assessmentsJson);
  window._currentAssessmentQueue = assessments;
  window._assessmentIndex = 0;
  startNextAssessment();
}

function startNextAssessment() {
  const queue = window._currentAssessmentQueue || [];
  const idx = window._assessmentIndex || 0;
  
  if (idx >= queue.length) {
    calculateAndShowResults();
    return;
  }
  
  const assessmentId = queue[idx];
  window._assessmentIndex = idx + 1;
  
  switch(assessmentId) {
    case 'riasec': startRIASEC(); break;
    case 'anchor': startAnchor(); break;
    case 'big5': startBig5(); break;
    case 'mbti': startMBTI(); break;
    case 'disc': startDISC(); break;
    case 'gallup': startGallup(); break;
    case 'values': startValues(); break;
    case 'maturity': startMaturity(); break;
    case 'aptitude': startAptitude(); break;
    case 'satisfaction': startSatisfaction(); break;
    default: startNextAssessment();
  }
}

function showCustomAssessment() {
  const container = document.getElementById('assessmentGuideContent');
  if (!container) return;
  
  let html = '<div class="custom-assessment">';
  html += '<div class="custom-header">';
  html += '<button class="btn-back" onclick="startAssessmentGuide()">← 返回</button>';
  html += '<h2 class="custom-title">自定义测评选择</h2>';
  html += '<p class="custom-subtitle">勾选你感兴趣的测评，完成后系统将生成综合分析报告</p>';
  html += '</div>';
  
  // 按分类展示测评
  Object.entries(ASSESSMENT_CATEGORIES).forEach(([category, ids]) => {
    html += '<div class="custom-category">';
    html += '<div class="custom-category-title">' + category + '</div>';
    html += '<div class="custom-grid">';
    ids.forEach(id => {
      const info = ASSESSMENT_LIBRARY[id];
      const isSelected = (window._currentAssessmentQueue || []).includes(id);
      html += '<div class="custom-card ' + (isSelected ? 'selected' : '') + '" onclick="toggleCustomSelect(\'' + id + '\')">';
      html += '<span class="custom-icon">' + info.icon + '</span>';
      html += '<div class="custom-name">' + info.name + '</div>';
      html += '<div class="custom-detail">' + info.questions + '题 · ' + info.duration + '</div>';
      html += '<div class="custom-desc">' + (info.desc || '') + '</div>';
      html += '<span class="custom-priority priority-' + info.priority.toLowerCase() + '">' + info.priority + '</span>';
      if (isSelected) html += '<span class="custom-check">✓</span>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';
  });
  
  // 已选测评概览
  const selected = window._currentAssessmentQueue || [];
  if (selected.length > 0) {
    html += '<div class="custom-summary">';
    html += '<div class="custom-summary-title">已选测评（' + selected.length + '个）</div>';
    html += '<div class="custom-summary-tags">';
    selected.forEach(id => {
      const info = ASSESSMENT_LIBRARY[id];
      if (info) {
        html += '<span class="custom-summary-tag">' + info.icon + ' ' + info.name + '</span>';
      }
    });
    html += '</div>';
    
    // 综合分析预览
    html += '<div class="custom-analysis-preview">';
    html += '<div class="custom-analysis-title">📊 综合分析将覆盖以下维度</div>';
    html += '<div class="custom-analysis-dims">';
    const analysisDims = new Set();
    selected.forEach(id => {
      const info = ASSESSMENT_LIBRARY[id];
      if (info) analysisDims.add(info.type);
    });
    Array.from(analysisDims).forEach(dim => {
      html += '<span class="custom-analysis-dim">' + dim + '</span>';
    });
    html += '</div>';
    
    // 推荐组合提示
    if (selected.length >= 3) {
      html += '<div class="custom-analysis-tip">💡 完成' + selected.length + '个测评后，系统将生成包含跨测评关联分析的综合画像报告</div>';
    } else if (selected.length === 2) {
      html += '<div class="custom-analysis-tip">💡 建议至少选择3个测评以获得更全面的综合分析</div>';
    }
    html += '</div>';
    
    html += '<div class="custom-actions">';
    html += '<button class="btn-primary-v5" onclick="startCustomAssessment()">开始测评 →</button>';
    html += '<button class="btn-secondary-v5" onclick="clearCustomSelection()">清空选择</button>';
    html += '</div>';
    html += '</div>';
  } else {
    html += '<div class="custom-empty">请选择至少一个测评开始</div>';
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function clearCustomSelection() {
  window._currentAssessmentQueue = [];
  showCustomAssessment();
}

function toggleCustomSelect(id) {
  if (!window._currentAssessmentQueue) window._currentAssessmentQueue = [];
  
  const idx = window._currentAssessmentQueue.indexOf(id);
  if (idx > -1) {
    window._currentAssessmentQueue.splice(idx, 1);
  } else {
    window._currentAssessmentQueue.push(id);
  }
  
  showCustomAssessment();
}

function startCustomAssessment() {
  if (!window._currentAssessmentQueue || window._currentAssessmentQueue.length === 0) {
    alert('请至少选择一个测评');
    return;
  }
  window._assessmentIndex = 0;
  startNextAssessment();
}

// ========== 测评库浏览页 ==========

function renderAssessmentLibrary() {
  const container = document.getElementById('libraryGrid');
  if (!container) return;

  const completedAssessments = getCompletedAssessments();

  let html = '';
  Object.entries(ASSESSMENT_CATEGORIES).forEach(([category, ids]) => {
    html += '<div class="library-category">';
    html += '<div class="library-category-title">' + category + '</div>';
    html += '<div class="library-grid">';
    ids.forEach(id => {
      const info = ASSESSMENT_LIBRARY[id];
      const isCompleted = completedAssessments.includes(id);
      const isCore = info.priority === 'P0';
      html += '<div class="library-card ' + (isCompleted ? 'completed' : '') + '">';
      html += '<div class="library-card-header">';
      html += '<span class="library-card-icon">' + info.icon + '</span>';
      html += '<span class="library-card-priority priority-' + info.priority.toLowerCase() + '">' + info.priority + '</span>';
      html += '</div>';
      html += '<div class="library-card-name">' + info.name + '</div>';
      html += '<div class="library-card-desc">' + info.desc + '</div>';
      html += '<div class="library-card-meta">';
      html += '<span class="library-meta-item">' + info.questions + '题</span>';
      html += '<span class="library-meta-item">' + info.duration + '</span>';
      html += '<span class="library-meta-item">' + info.type + '</span>';
      html += '</div>';
      html += '<div class="library-card-footer">';
      if (isCompleted) {
        html += '<span class="library-completed-badge">✓ 已完成</span>';
        html += '<button class="btn-secondary-v5 btn-sm" onclick="retakeAssessment(\'' + id + '\')">重新测评</button>';
      } else if (isCore) {
        html += '<button class="btn-primary-v5 btn-sm" onclick="startSingleAssessment(\'' + id + '\')">开始测评</button>';
      } else {
        html += '<span class="library-soon-badge">即将上线</span>';
      }
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';
  });

  container.innerHTML = html;
}

function getCompletedAssessments() {
  const progress = JSON.parse(localStorage.getItem('careerCompass_progress') || '{}');
  const completed = [];
  if (progress.riasecScores) completed.push('riasec');
  if (progress.anchorAnswers && progress.anchorAnswers.length > 0) completed.push('anchor');
  if (progress.big5Scores) completed.push('big5');
  if (progress.mbtiScores) completed.push('mbti');
  if (progress.discScores) completed.push('disc');
  if (progress.gallupScores) completed.push('gallup');
  return completed;
}

function startSingleAssessment(id) {
  window._currentAssessmentQueue = [id];
  window._assessmentIndex = 0;
  startNextAssessment();
}

function retakeAssessment(id) {
  if (confirm('重新测评将覆盖之前的结果，确定继续吗？')) {
    startSingleAssessment(id);
  }
}

// ========== 累积画像详情页 ==========

function renderAssessmentProfile() {
  const container = document.getElementById('profileContent');
  if (!container) return;

  const profile = typeof buildCumulativeProfile === 'function' ? buildCumulativeProfile() : null;
  const levelInfo = profile ? getProfileLevelInfo(profile.level) : PROFILE_LEVELS.L1;
  const completed = profile ? profile.completedAssessments : [];
  const totalAssessments = Object.keys(ASSESSMENT_LIBRARY).length;
  const progressPercent = Math.round((completed.length / totalAssessments) * 100);

  let html = '';

  // 顶部画像等级卡片
  html += '<div class="profile-header-card">';
  html += '<div class="profile-level-badge" style="background:' + levelInfo.color + '">' + (profile ? profile.level : 'L1') + '</div>';
  html += '<div class="profile-level-info">';
  html += '<h3>' + levelInfo.label + '</h3>';
  html += '<p>' + levelInfo.desc + '</p>';
  html += '</div>';
  html += '</div>';

  // 完成度进度条
  html += '<div class="profile-progress-section">';
  html += '<div class="profile-progress-header">';
  html += '<span>画像完整度</span>';
  html += '<span class="profile-progress-text">' + completed.length + ' / ' + totalAssessments + ' 项测评</span>';
  html += '</div>';
  html += '<div class="profile-progress-bar">';
  html += '<div class="profile-progress-fill" style="width:' + progressPercent + '%; background:' + levelInfo.color + '"></div>';
  html += '</div>';
  html += '</div>';

  // 各维度展示
  html += '<div class="profile-dimensions">';

  // 职业兴趣
  if (profile && profile.dimensions.interest) {
    const dim = profile.dimensions.interest;
    html += '<div class="profile-dim-card">';
    html += '<div class="profile-dim-header">';
    html += '<span class="profile-dim-icon">🎯</span>';
    html += '<span class="profile-dim-title">职业兴趣（Holland）</span>';
    html += '<span class="profile-dim-status completed">已完成</span>';
    html += '</div>';
    html += '<div class="profile-dim-content">';
    html += '<div class="profile-top-codes">';
    dim.topCodes.forEach((code, i) => {
      const typeLabels = { R: '实用型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型' };
      const colors = { R: '#EF4444', I: '#3B82F6', A: '#8B5CF6', S: '#10B981', E: '#F59E0B', C: '#6B7280' };
      html += '<div class="profile-code-item">';
      html += '<span class="profile-code-badge" style="background:' + colors[code] + '">' + code + '</span>';
      html += '<span class="profile-code-label">' + typeLabels[code] + '</span>';
      html += '</div>';
    });
    html += '</div>';
    html += '<p class="profile-dim-summary">' + dim.summary + '</p>';
    html += '</div></div>';
  } else {
    html += '<div class="profile-dim-card locked">';
    html += '<div class="profile-dim-header">';
    html += '<span class="profile-dim-icon">🎯</span>';
    html += '<span class="profile-dim-title">职业兴趣（Holland）</span>';
    html += '<span class="profile-dim-status">未解锁</span>';
    html += '</div>';
    html += '<div class="profile-dim-content">';
    html += '<p class="profile-dim-locked-text">完成霍兰德职业兴趣测评后解锁此维度分析</p>';
    html += '<button class="btn-primary-v5 btn-sm" onclick="navigateTo(\'assessment-guide\')">去测评 →</button>';
    html += '</div></div>';
  }

  // 职业价值观
  if (profile && profile.dimensions.values) {
    const dim = profile.dimensions.values;
    html += '<div class="profile-dim-card">';
    html += '<div class="profile-dim-header">';
    html += '<span class="profile-dim-icon">⚓</span>';
    html += '<span class="profile-dim-title">职业价值观（Schein）</span>';
    html += '<span class="profile-dim-status completed">已完成</span>';
    html += '</div>';
    html += '<div class="profile-dim-content">';
    html += '<div class="profile-top-anchors">';
    dim.topAnchors.forEach(anchor => {
      html += '<span class="profile-anchor-tag">' + anchor + '</span>';
    });
    html += '</div>';
    html += '<p class="profile-dim-summary">' + dim.summary + '</p>';
    html += '</div></div>';
  } else {
    html += '<div class="profile-dim-card locked">';
    html += '<div class="profile-dim-header">';
    html += '<span class="profile-dim-icon">⚓</span>';
    html += '<span class="profile-dim-title">职业价值观（Schein）</span>';
    html += '<span class="profile-dim-status">未解锁</span>';
    html += '</div>';
    html += '<div class="profile-dim-content">';
    html += '<p class="profile-dim-locked-text">完成Schein职业锚测评后解锁此维度分析</p>';
    html += '</div></div>';
  }

  // 人格特质
  if (profile && profile.dimensions.personality) {
    const dim = profile.dimensions.personality;
    html += '<div class="profile-dim-card">';
    html += '<div class="profile-dim-header">';
    html += '<span class="profile-dim-icon">🧠</span>';
    html += '<span class="profile-dim-title">人格特质（大五）</span>';
    html += '<span class="profile-dim-status completed">已完成</span>';
    html += '</div>';
    html += '<div class="profile-dim-content">';
    html += '<p class="profile-dim-summary">' + dim.summary + '</p>';
    html += '</div></div>';
  } else {
    html += '<div class="profile-dim-card locked">';
    html += '<div class="profile-dim-header">';
    html += '<span class="profile-dim-icon">🧠</span>';
    html += '<span class="profile-dim-title">人格特质（大五）</span>';
    html += '<span class="profile-dim-status">即将上线</span>';
    html += '</div>';
    html += '<div class="profile-dim-content">';
    html += '<p class="profile-dim-locked-text">大五人格测评即将上线，敬请期待</p>';
    html += '</div></div>';
  }

  // 沟通风格
  html += '<div class="profile-dim-card locked">';
  html += '<div class="profile-dim-header">';
  html += '<span class="profile-dim-icon">💬</span>';
  html += '<span class="profile-dim-title">沟通风格（DISC）</span>';
  html += '<span class="profile-dim-status">即将上线</span>';
  html += '</div>';
  html += '<div class="profile-dim-content">';
  html += '<p class="profile-dim-locked-text">DISC沟通风格测评即将上线，敬请期待</p>';
  html += '</div></div>';

  // 天赋优势
  html += '<div class="profile-dim-card locked">';
  html += '<div class="profile-dim-header">';
  html += '<span class="profile-dim-icon">⭐</span>';
  html += '<span class="profile-dim-title">天赋优势（盖洛普）</span>';
  html += '<span class="profile-dim-status">即将上线</span>';
  html += '</div>';
  html += '<div class="profile-dim-content">';
  html += '<p class="profile-dim-locked-text">盖洛普优势测评即将上线，敬请期待</p>';
  html += '</div></div>';

  html += '</div>';

  // 提升建议
  if (profile && profile.insights && profile.insights.length > 0) {
    html += '<div class="profile-insights">';
    html += '<h3 class="profile-insights-title">💡 画像洞察</h3>';
    html += '<div class="profile-insights-list">';
    profile.insights.forEach(insight => {
      const icons = { career_match: '🎯', stability: '🛡️', growth: '🚀', completion: '📈' };
      html += '<div class="profile-insight-item">';
      html += '<span class="profile-insight-icon">' + (icons[insight.type] || '✨') + '</span>';
      html += '<div class="profile-insight-content">';
      html += '<div class="profile-insight-title">' + insight.title + '</div>';
      html += '<div class="profile-insight-text">' + insight.content + '</div>';
      html += '</div></div>';
    });
    html += '</div></div>';
  }

  container.innerHTML = html;
}