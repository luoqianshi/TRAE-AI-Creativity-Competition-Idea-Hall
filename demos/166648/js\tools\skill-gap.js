// ========== 技能差距分析模块 ==========

// 技能评估框架
const skillFramework = {
  // 技能分类
  categories: [
    { id: 'soft', name: '通用软技能', skills: ['沟通表达', '团队协作', '问题解决', '时间管理', '学习能力'] },
    { id: 'industry', name: '行业知识', skills: ['行业趋势理解', '竞品分析', '用户洞察', '商业模式'] },
    { id: 'tool', name: '工具技能', skills: ['Office办公', '数据分析工具', '项目管理工具', '设计工具', '编程语言'] },
    { id: 'domain', name: '专业领域', skills: ['专业知识深度', '跨领域整合', '前沿技术跟踪', '行业认证'] },
    { id: 'cert', name: '认证资质', skills: ['学历背景', '职业资格证书', '行业认证', '语言能力'] }
  ],

  // 根据用户信息推断已有技能
  inferFromProfile: function(education, experience, riasecScores) {
    const eduLevel = { '高中': 1, '大专': 2, '本科': 3, '硕士': 4, '博士': 5 };
    const level = eduLevel[education] || 0;

    const expLevel = { '在校': 0, '0-1年': 1, '1-3年': 2, '3-5年': 3, '5-10年': 4, '10年以上': 5 };
    const exp = expLevel[experience] || 0;

    const inferred = {};

    // 通用软技能 - 基于工作经验
    inferred['沟通表达'] = Math.min(100, 40 + exp * 12);
    inferred['团队协作'] = Math.min(100, 35 + exp * 13);
    inferred['问题解决'] = Math.min(100, 30 + exp * 10 + (riasecScores.I || 0) * 5);
    inferred['时间管理'] = Math.min(100, 30 + exp * 12);
    inferred['学习能力'] = Math.min(100, 40 + level * 10 + exp * 5);

    // 行业知识 - 基于经验和RIASEC
    inferred['行业趋势理解'] = Math.min(100, 20 + exp * 12 + (riasecScores.I || 0) * 3);
    inferred['竞品分析'] = Math.min(100, 15 + exp * 10 + (riasecScores.E || 0) * 4);
    inferred['用户洞察'] = Math.min(100, 20 + exp * 8 + (riasecScores.S || 0) * 5);
    inferred['商业模式'] = Math.min(100, 15 + exp * 10 + (riasecScores.E || 0) * 5);

    // 工具技能 - 基于学历和经验
    inferred['Office办公'] = Math.min(100, 50 + level * 8);
    inferred['数据分析工具'] = Math.min(100, 20 + level * 10 + (riasecScores.I || 0) * 5);
    inferred['项目管理工具'] = Math.min(100, 15 + exp * 10 + (riasecScores.C || 0) * 4);
    inferred['设计工具'] = Math.min(100, 10 + (riasecScores.A || 0) * 8);
    inferred['编程语言'] = Math.min(100, 10 + level * 10 + (riasecScores.I || 0) * 5 + (riasecScores.R || 0) * 3);

    // 专业领域 - 基于学历
    inferred['专业知识深度'] = Math.min(100, 20 + level * 15);
    inferred['跨领域整合'] = Math.min(100, 15 + level * 8 + exp * 5);
    inferred['前沿技术跟踪'] = Math.min(100, 15 + (riasecScores.I || 0) * 8);
    inferred['行业认证'] = Math.min(100, 10 + level * 10 + exp * 5);

    // 认证资质 - 基于学历
    inferred['学历背景'] = Math.min(100, level * 20);
    inferred['职业资格证书'] = Math.min(100, 10 + exp * 8);
    inferred['语言能力'] = Math.min(100, 30 + level * 10);

    return inferred;
  },

  // 将职业的skills映射到框架中的技能
  mapCareerSkills: function(careerSkills, inferred) {
    return careerSkills.map(skill => ({
      name: skill,
      level: inferred[skill] || Math.floor(30 + Math.random() * 20),
      required: 70
    }));
  }
};

// 追问问题
const followUpQuestions = [
  {
    id: 'tool_proficiency',
    text: '你目前最熟练的工具或软件是什么？',
    options: ['Office套件', '数据分析工具(Excel/SQL)', '设计工具(PS/AI)', '编程工具', '项目管理工具']
  },
  {
    id: 'comm_skill',
    text: '你在团队中的沟通角色通常是？',
    options: ['主导发言和汇报', '参与讨论补充观点', '更多倾听和执行', '书面沟通优于口头']
  },
  {
    id: 'learning_style',
    text: '你学习新技能的主要方式？',
    options: ['在线课程自学', '实践项目驱动', '阅读文档书籍', '参加培训或讲座']
  },
  {
    id: 'industry_exp',
    text: '你对目标行业的了解程度？',
    options: ['深入了解(有实习/工作经验)', '有一定了解(关注行业动态)', '仅限表面认知', '完全不了解']
  }
];

// 追问回答对技能的调整系数
const followUpAdjustments = {
  tool_proficiency: {
    'Office套件': { 'Office办公': 20, '数据分析工具': 5 },
    '数据分析工具(Excel/SQL)': { 'Office办公': 10, '数据分析工具': 25, '编程语言': 10 },
    '设计工具(PS/AI)': { '设计工具': 25, 'Office办公': 5 },
    '编程工具': { '编程语言': 25, '数据分析工具': 10, '设计工具': 5 },
    '项目管理工具': { '项目管理工具': 25, 'Office办公': 10 }
  },
  comm_skill: {
    '主导发言和汇报': { '沟通表达': 20, '团队协作': 10, '用户洞察': 5 },
    '参与讨论补充观点': { '沟通表达': 10, '团队协作': 15, '用户洞察': 10 },
    '更多倾听和执行': { '团队协作': 15, '时间管理': 10, '沟通表达': 0 },
    '书面沟通优于口头': { '沟通表达': 10, '学习能力': 10, '时间管理': 5 }
  },
  learning_style: {
    '在线课程自学': { '学习能力': 20, '前沿技术跟踪': 10 },
    '实践项目驱动': { '问题解决': 15, '跨领域整合': 10, '学习能力': 10 },
    '阅读文档书籍': { '专业知识深度': 15, '学习能力': 15, '前沿技术跟踪': 10 },
    '参加培训或讲座': { '学习能力': 15, '行业认证': 10, '专业知识深度': 10 }
  },
  industry_exp: {
    '深入了解(有实习/工作经验)': { '行业趋势理解': 25, '竞品分析': 20, '用户洞察': 20, '商业模式': 15 },
    '有一定了解(关注行业动态)': { '行业趋势理解': 15, '竞品分析': 10, '用户洞察': 10, '商业模式': 8 },
    '仅限表面认知': { '行业趋势理解': 5, '竞品分析': 3, '用户洞察': 5, '商业模式': 3 },
    '完全不了解': { '行业趋势理解': 0, '竞品分析': 0, '用户洞察': 0, '商业模式': 0 }
  }
};

// 当前选中的职业索引和追问状态
let currentCareerIndex = -1;
let followUpAnswers = {};
let isInFollowUp = false;

// 显示追问面板
function showFollowUpQuestions(careerIndex) {
  currentCareerIndex = careerIndex;
  isInFollowUp = true;
  followUpAnswers = {};

  const section = document.getElementById('skillGapSection');
  const content = document.getElementById('skillGapContent');

  // 隐藏行动计划
  document.getElementById('actionPlanSection').style.display = 'none';

  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  let html = '<div class="followup-panel">';

  // 返回按钮 + 进度指示
  html += '<div class="followup-header">';
  html += '<button class="btn-back" onclick="closeFollowUpPanel()">&#8592; 返回推荐列表</button>';
  html += '<span class="followup-progress">问题 <span id="followupAnsweredCount">0</span>/' + followUpQuestions.length + '</span>';
  html += '</div>';

  html += '<p class="followup-intro">为了更准确地分析你的技能差距，请回答几个简短问题（可跳过）：</p>';

  followUpQuestions.forEach((q, qi) => {
    html += '<div class="followup-question" data-qid="' + q.id + '">';
    html += '<div class="followup-qnum">Q' + (qi + 1) + '</div>';
    html += '<div class="followup-qtext">' + q.text + '</div>';
    html += '<div class="followup-options">';
    q.options.forEach(opt => {
      html += '<button class="followup-opt-btn" data-qid="' + q.id + '" data-val="' + opt + '" onclick="selectFollowUpOption(this)">' + opt + '</button>';
    });
    html += '</div></div>';
  });

  html += '<div class="followup-actions">';
  html += '<button class="btn-secondary" onclick="skipFollowUp()">跳过，使用默认评估</button>';
  html += '<button class="btn-primary" onclick="submitFollowUp()">查看技能差距分析</button>';
  html += '</div></div>';

  content.innerHTML = html;
}

// 关闭追问面板，回到推荐列表
function closeFollowUpPanel() {
  isInFollowUp = false;
  followUpAnswers = {};
  document.getElementById('skillGapSection').style.display = 'none';
  document.getElementById('actionPlanSection').style.display = 'none';
  // 滚动回职业推荐区域
  const careerSection = document.getElementById('careerList');
  if (careerSection) {
    careerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// 选择追问选项
function selectFollowUpOption(btn) {
  const qid = btn.getAttribute('data-qid');
  const val = btn.getAttribute('data-val');

  // 取消同组其他选中
  const siblings = btn.parentElement.querySelectorAll('.followup-opt-btn');
  siblings.forEach(b => b.classList.remove('selected'));

  btn.classList.add('selected');
  followUpAnswers[qid] = val;

  // 更新进度指示
  const countEl = document.getElementById('followupAnsweredCount');
  if (countEl) {
    countEl.textContent = Object.keys(followUpAnswers).length;
  }
}

// 跳过追问
function skipFollowUp() {
  followUpAnswers = {};
  isInFollowUp = false;
  showSkillGapAnalysis();
}

// 提交追问
function submitFollowUp() {
  isInFollowUp = false;
  showSkillGapAnalysis();
}

// 应用追问调整
function applyFollowUpAdjustments(inferred) {
  const adjusted = { ...inferred };

  Object.keys(followUpAnswers).forEach(qid => {
    const answer = followUpAnswers[qid];
    const adjustments = followUpAdjustments[qid];
    if (adjustments && adjustments[answer]) {
      Object.keys(adjustments[answer]).forEach(skill => {
        if (adjusted[skill] !== undefined) {
          adjusted[skill] = Math.min(100, adjusted[skill] + adjustments[answer][skill]);
        }
      });
    }
  });

  return adjusted;
}

// 展示技能差距分析
function showSkillGapAnalysis() {
  const matches = window._careerMatches;
  if (!matches || currentCareerIndex < 0 || currentCareerIndex >= matches.length) return;

  const career = matches[currentCareerIndex];
  const education = assessmentData.profile ? assessmentData.profile.education : '本科';
  const experience = assessmentData.profile ? assessmentData.profile.experience : '在校';
  const riasecScores = assessmentData.riasecScores || {};

  // 推断基础技能
  let inferred = skillFramework.inferFromProfile(education, experience, riasecScores);

  // 应用追问调整
  if (Object.keys(followUpAnswers).length > 0) {
    inferred = applyFollowUpAdjustments(inferred);
  }

  // 映射职业技能
  const careerSkills = skillFramework.mapCareerSkills(career.skills, inferred);

  // 渲染
  const content = document.getElementById('skillGapContent');
  let html = '';

  // 职业标题
  html += '<div class="skillgap-career-title">';
  html += '<span class="skillgap-career-name">' + career.name + '</span>';
  html += '<span class="skillgap-career-meta">' + career.industry + ' · 匹配度 ' + career.matchScore + '%</span>';
  html += '</div>';

  // 技能差距列表
  html += '<div class="skillgap-list">';
  careerSkills.forEach(skill => {
    const gap = skill.required - skill.level;
    const colorClass = skill.level >= 70 ? 'skill-green' : skill.level >= 40 ? 'skill-yellow' : 'skill-red';
    const statusText = skill.level >= 70 ? '已具备' : skill.level >= 40 ? '需提升' : '差距较大';
    const statusIcon = skill.level >= 70 ? '&#10003;' : skill.level >= 40 ? '&#9888;' : '&#10007;';

    html += '<div class="skillgap-item">';
    html += '<div class="skillgap-item-header">';
    html += '<span class="skillgap-name">' + skill.name + '</span>';
    html += '<span class="skillgap-status ' + colorClass + '">' + statusIcon + ' ' + statusText + '</span>';
    html += '</div>';
    html += '<div class="skillgap-bar-container">';
    html += '<div class="skillgap-bar-bg">';
    html += '<div class="skillgap-bar-fill ' + colorClass + '" style="width:' + skill.level + '%"></div>';
    html += '<div class="skillgap-bar-required" style="left:70%"></div>';
    html += '</div>';
    html += '<div class="skillgap-bar-labels">';
    html += '<span class="skillgap-current">当前 ' + skill.level + '%</span>';
    html += '<span class="skillgap-required">目标 ' + skill.required + '%</span>';
    html += '</div>';
    html += '</div></div>';
  });
  html += '</div>';

  // 差距总结
  const totalGap = careerSkills.reduce((sum, s) => sum + Math.max(0, s.required - s.level), 0);
  const avgGap = Math.round(totalGap / careerSkills.length);
  const readyCount = careerSkills.filter(s => s.level >= 70).length;

  html += '<div class="skillgap-summary">';
  html += '<div class="skillgap-summary-item">';
  html += '<div class="skillgap-summary-num">' + readyCount + '/' + careerSkills.length + '</div>';
  html += '<div class="skillgap-summary-label">已达标技能</div>';
  html += '</div>';
  html += '<div class="skillgap-summary-item">';
  html += '<div class="skillgap-summary-num">' + avgGap + '%</div>';
  html += '<div class="skillgap-summary-label">平均差距</div>';
  html += '</div>';
  html += '<div class="skillgap-summary-item">';
  html += '<div class="skillgap-summary-num">' + (careerSkills.length - readyCount) + '</div>';
  html += '<div class="skillgap-summary-label">待提升技能</div>';
  html += '</div>';
  html += '</div>';

  content.innerHTML = html;

  // 生成并展示行动计划
  showActionPlan(career, careerSkills);

  // 滚动到技能差距区域
  document.getElementById('skillGapSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
