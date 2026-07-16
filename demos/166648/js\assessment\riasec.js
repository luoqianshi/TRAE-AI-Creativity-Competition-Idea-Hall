// ========== RIASEC 题库 ==========
const riasecQuestions = [
  { id: 1, type: 'R', section: 'A', text: '用工具动手修理或组装设备', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 2, type: 'R', section: 'A', text: '操作机械或技术系统', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 3, type: 'R', section: 'A', text: '户外体力劳动或工程勘察', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 4, type: 'I', section: 'A', text: '收集数据并分析其中的规律', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 5, type: 'I', section: 'A', text: '阅读和研究感兴趣领域的深度文献', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 6, type: 'I', section: 'A', text: '解决没有标准答案的复杂问题', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 7, type: 'A', section: 'A', text: '用文字、图像或声音进行创作表达', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 8, type: 'A', section: 'A', text: '设计具有美感的作品或空间', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 9, type: 'A', section: 'A', text: '构思和讲述故事或概念', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 10, type: 'S', section: 'A', text: '向他人解释知识或技能直到他们理解', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 11, type: 'S', section: 'A', text: '在别人困惑或有困难时提供支持', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 12, type: 'S', section: 'A', text: '组织团队协作并协调分歧', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 13, type: 'E', section: 'A', text: '说服他人接受自己的方案或观点', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 14, type: 'E', section: 'A', text: '策划和推进一个完整的商业活动', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 15, type: 'E', section: 'A', text: '在竞争性环境中争取资源或目标', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 16, type: 'C', section: 'A', text: '整理和维护数据或档案系统', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 17, type: 'C', section: 'A', text: '按照既定流程和规范完成任务', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 18, type: 'C', section: 'A', text: '核查数字和信息确保准确无误', optionA: '感兴趣', optionB: '不感兴趣' },
  { id: 19, type: 'R', section: 'B', text: '我能独立完成技术性或机械性任务', optionA: '符合', optionB: '不符合' },
  { id: 20, type: 'R', section: 'B', text: '我习惯通过实际操作解决问题而不是讨论', optionA: '符合', optionB: '不符合' },
  { id: 21, type: 'I', section: 'B', text: '我能长时间专注于一个问题进行深入研究', optionA: '符合', optionB: '不符合' },
  { id: 22, type: 'I', section: 'B', text: '我善于从大量信息中提炼出核心结论', optionA: '符合', optionB: '不符合' },
  { id: 23, type: 'A', section: 'B', text: '我能以独特的方式表达想法并感染他人', optionA: '符合', optionB: '不符合' },
  { id: 24, type: 'A', section: 'B', text: '我对审美有自己的判断标准', optionA: '符合', optionB: '不符合' },
  { id: 25, type: 'S', section: 'B', text: '我能快速感受到他人的情绪和需求', optionA: '符合', optionB: '不符合' },
  { id: 26, type: 'S', section: 'B', text: '我在帮助他人的过程中获得满足感', optionA: '符合', optionB: '不符合' },
  { id: 27, type: 'E', section: 'B', text: '我能自然地影响他人并推动决策', optionA: '符合', optionB: '不符合' },
  { id: 28, type: 'E', section: 'B', text: '我在充满不确定性的环境中仍能快速行动', optionA: '符合', optionB: '不符合' },
  { id: 29, type: 'C', section: 'B', text: '我在遵循清晰规则的环境中效率最高', optionA: '符合', optionB: '不符合' },
  { id: 30, type: 'C', section: 'B', text: '我注重细节，很少因为疏忽出错', optionA: '符合', optionB: '不符合' },
  { id: 31, type: 'R', section: 'C', text: '工程技术员', optionA: '有吸引力', optionB: '没感觉' },
  { id: 32, type: 'R', section: 'C', text: '建筑师', optionA: '有吸引力', optionB: '没感觉' },
  { id: 33, type: 'I', section: 'C', text: '数据科学家', optionA: '有吸引力', optionB: '没感觉' },
  { id: 34, type: 'I', section: 'C', text: '医学研究员', optionA: '有吸引力', optionB: '没感觉' },
  { id: 35, type: 'A', section: 'C', text: '品牌设计师', optionA: '有吸引力', optionB: '没感觉' },
  { id: 36, type: 'A', section: 'C', text: '内容编辑', optionA: '有吸引力', optionB: '没感觉' },
  { id: 37, type: 'S', section: 'C', text: '职业培训师', optionA: '有吸引力', optionB: '没感觉' },
  { id: 38, type: 'S', section: 'C', text: '用户研究员', optionA: '有吸引力', optionB: '没感觉' },
  { id: 39, type: 'E', section: 'C', text: '市场总监', optionA: '有吸引力', optionB: '没感觉' },
  { id: 40, type: 'E', section: 'C', text: '创业者', optionA: '有吸引力', optionB: '没感觉' },
  { id: 41, type: 'C', section: 'C', text: '财务分析师', optionA: '有吸引力', optionB: '没感觉' },
  { id: 42, type: 'C', section: 'C', text: '运营专员', optionA: '有吸引力', optionB: '没感觉' },
];

// ========== RIASEC 渲染 ==========
function renderRIASECQuestion() {
  if (riasecIndex >= 42) {
    currentPhase = 'C';
    anchorIndex = assessmentData.anchorAnswers.length;
    document.getElementById('phaseB').style.display = 'none';
    document.getElementById('phaseC').style.display = 'block';
    updatePhaseTabs();
    renderAnchorQuestion();
    updateProgress();
    return;
  }

  const q = riasecQuestions[riasecIndex];
  const sectionLabels = { A: '活动偏好', B: '能力自评', C: '职业直觉' };
  const typeLabels = { R: '实用型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型' };
  const currentAnswer = assessmentData.riasecAnswers[riasecIndex];
  const answeredCount = getAnsweredRIASECCount();
  const canGoPrev = riasecIndex > 0;
  const canGoNext = currentAnswer !== undefined;

  const html = `
    <div class="question-card">
      <span class="question-category cat-${q.type}">${typeLabels[q.type]} · ${sectionLabels[q.section]}</span>
      <div class="question-text">${q.text}</div>
      <div class="question-options">
        <button class="option-btn ${currentAnswer === true ? 'selected' : ''}" onclick="answerRIASEC(true)">
          <span class="option-icon">✓</span>
          <span class="option-text">${q.optionA}</span>
        </button>
        <button class="option-btn ${currentAnswer === false ? 'selected' : ''}" onclick="answerRIASEC(false)">
          <span class="option-icon">✕</span>
          <span class="option-text">${q.optionB}</span>
        </button>
      </div>
      <div class="question-nav">
        <button class="nav-btn nav-prev ${canGoPrev ? '' : 'disabled'}" onclick="prevRIASECQuestion()" ${canGoPrev ? '' : 'disabled'}>
          ← 上一题
        </button>
        <span class="nav-progress">${answeredCount}/42 已完成</span>
        <button class="nav-btn nav-next" onclick="goPhase('A')">
          返回基础信息
        </button>
      </div>
    </div>
  `;
  document.getElementById('riasecQuestionArea').innerHTML = html;
  updateProgress();
}

function answerRIASEC(value) {
  const prevAnswer = assessmentData.riasecAnswers[riasecIndex];
  if (prevAnswer === true) {
    const type = riasecQuestions[riasecIndex].type;
    assessmentData.riasecScores[type]--;
  }
  assessmentData.riasecAnswers[riasecIndex] = value;
  if (value) {
    const type = riasecQuestions[riasecIndex].type;
    assessmentData.riasecScores[type]++;
  }
  riasecIndex++;
  saveProgress();
  renderRIASECQuestion();
}

function prevRIASECQuestion() {
  if (riasecIndex > 0) {
    riasecIndex--;
    renderRIASECQuestion();
    updateProgress();
  }
}

function getAnsweredRIASECCount() {
  return assessmentData.riasecAnswers.filter(a => a !== undefined && a !== null).length;
}
