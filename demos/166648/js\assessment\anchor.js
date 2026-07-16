// ========== 职业锚题库 ==========
const anchorQuestions = [
  { id: 1, optionA: '成为某一专业领域公认的权威专家', optionB: '管理团队通过别人的工作实现目标' },
  { id: 2, optionA: '工作收入较低但完全自由安排时间和方式', optionB: '受到诸多约束但工作非常稳定有保障' },
  { id: 3, optionA: '在成熟的大公司里按部就班晋升', optionB: '从零开始创办自己的事业' },
  { id: 4, optionA: '做一份对社会有直接贡献的工作', optionB: '接受一项前所未有的高难度挑战' },
  { id: 5, optionA: '追求职业成就和社会地位', optionB: '拥有充裕的个人时间和健康生活' },
  { id: 6, optionA: '在充满竞争的商业环境中获胜', optionB: '用专业知识解决复杂的技术难题' },
  { id: 7, optionA: '带领团队完成一个有影响力的项目', optionB: '独立完成一件代表个人最高水平的作品' },
  { id: 8, optionA: '在一个稳定组织中长期深耕积累', optionB: '不断尝试新的领域和角色' },
];

const anchorMapping = [
  '技术职能型', '自主独立型', '安全稳定型', '服务奉献型',
  '追求成就型', '企业竞争型', '管理型', '稳定深耕型'
];
const anchorMappingB = [
  '管理型', '安全稳定型', '创业创造型', '纯粹挑战型',
  '生活方式型', '技术研究型', '独立创作型', '多元探索型'
];

// ========== 职业锚渲染 ==========
function renderAnchorQuestion() {
  if (anchorIndex >= 8) {
    calculateAndShowResults();
    return;
  }

  const q = anchorQuestions[anchorIndex];
  const currentAnswer = assessmentData.anchorAnswers[anchorIndex];
  const answeredCount = getAnsweredAnchorCount();
  const canGoPrev = anchorIndex > 0 || currentPhase === 'C';

  const html = `
    <div class="question-card anchor-question">
      <span class="question-category" style="background:rgba(232,153,10,0.15);color:#c07a08;">职业锚 · 价值观测评</span>
      <div class="question-text">${anchorIndex + 1}/8 以下两种情境，哪个更接近你？</div>
      <div class="anchor-options">
        <div class="anchor-option ${currentAnswer === true ? 'selected' : ''}" onclick="answerAnchor(true, this)">
          <div class="anchor-option-label">A</div>
          <div class="anchor-option-text">${q.optionA}</div>
        </div>
        <div class="anchor-option ${currentAnswer === false ? 'selected' : ''}" onclick="answerAnchor(false, this)">
          <div class="anchor-option-label">B</div>
          <div class="anchor-option-text">${q.optionB}</div>
        </div>
      </div>
      <div class="question-nav">
        <button class="nav-btn nav-prev ${canGoPrev ? '' : 'disabled'}" onclick="prevAnchorQuestion()" ${canGoPrev ? '' : 'disabled'}>
          ← 上一题
        </button>
        <span class="nav-progress">${answeredCount}/8 已完成</span>
        <button class="nav-btn nav-next" onclick="goPhase('B')">
          返回兴趣测评
        </button>
      </div>
    </div>
  `;
  document.getElementById('anchorQuestionArea').innerHTML = html;
  updateProgress();
}

function answerAnchor(isA, el) {
  assessmentData.anchorAnswers[anchorIndex] = isA;
  anchorIndex++;
  saveProgress();
  renderAnchorQuestion();
}

function prevAnchorQuestion() {
  if (anchorIndex > 0) {
    anchorIndex--;
    renderAnchorQuestion();
    updateProgress();
  } else if (currentPhase === 'C') {
    goPhase('B');
  }
}

function getAnsweredAnchorCount() {
  return assessmentData.anchorAnswers.filter(a => a !== undefined && a !== null).length;
}
