// ========== 岗位 JD 库 ==========

const JD_LIBRARY = [
  {
    id: 'jd-fe-senior',
    name: '高级前端开发工程师',
    category: '互联网',
    experience: '3-5年',
    education: '本科',
    hardSkills: ['React', 'Vue', 'JavaScript', 'TypeScript', 'HTML/CSS', '性能优化', '工程化'],
    softSkills: ['团队协作', '沟通能力', '问题解决', '学习能力'],
    responsibilities: [
      '负责公司核心产品的前端架构设计和技术选型',
      '主导前端性能优化，提升页面加载速度和用户体验',
      '搭建前端工程化体系，提高团队开发效率',
      '带领小团队完成复杂项目开发，指导初级工程师成长'
    ],
    tags: ['前端', 'React', 'Vue', '工程化', '团队管理']
  },
  {
    id: 'jd-data-analyst',
    name: '数据分析师',
    category: '互联网',
    experience: '2-4年',
    education: '本科',
    hardSkills: ['SQL', 'Python', '数据可视化', '统计学', 'Excel', 'BI工具'],
    softSkills: ['逻辑分析', '业务理解', '报告撰写', '沟通表达'],
    responsibilities: [
      '负责业务数据监控和分析，输出数据报告',
      '通过数据分析发现业务问题，提出优化建议',
      '搭建数据指标体系，支持业务决策',
      '与产品、运营团队协作，推动数据驱动决策'
    ],
    tags: ['数据分析', 'SQL', 'Python', 'BI', '数据可视化']
  },
  {
    id: 'jd-product-manager',
    name: '产品经理',
    category: '互联网',
    experience: '2-4年',
    education: '本科',
    hardSkills: ['需求分析', '产品设计', '原型设计', '数据分析', '项目管理'],
    softSkills: ['用户思维', '商业意识', '跨部门沟通', '优先级判断'],
    responsibilities: [
      '负责产品规划和功能设计，输出产品需求文档',
      '与研发团队协作，推动产品迭代上线',
      '收集用户反馈，持续优化产品体验',
      '分析产品数据，制定产品策略'
    ],
    tags: ['产品', '需求分析', '原型设计', '项目管理']
  },
  {
    id: 'jd-backend-developer',
    name: '后端开发工程师',
    category: '互联网',
    experience: '3-5年',
    education: '本科',
    hardSkills: ['Java', 'Go', 'Python', '数据库', '分布式系统', 'API设计'],
    softSkills: ['系统思维', '问题排查', '技术选型', '团队协作'],
    responsibilities: [
      '负责后端服务架构设计和开发',
      '优化系统性能和稳定性',
      '设计和实现 RESTful API',
      '保障系统安全和数据一致性'
    ],
    tags: ['后端', 'Java', 'Go', '分布式', 'API']
  },
  {
    id: 'jd-algorithm-engineer',
    name: '算法工程师',
    category: '互联网',
    experience: '3-5年',
    education: '硕士',
    hardSkills: ['机器学习', '深度学习', 'Python', '数学建模', 'TensorFlow/PyTorch'],
    softSkills: ['科研能力', '创新思维', '论文阅读', '团队协作'],
    responsibilities: [
      '负责推荐系统、NLP或CV算法的研发',
      '优化算法模型，提升业务指标',
      '跟踪前沿技术，推动算法创新',
      '与业务团队协作，将算法落地到实际场景'
    ],
    tags: ['算法', '机器学习', '推荐系统', 'NLP', 'CV']
  },
  {
    id: 'jd-ui-designer',
    name: 'UI设计师',
    category: '互联网',
    experience: '2-3年',
    education: '本科',
    hardSkills: ['Figma', 'Sketch', 'Adobe Photoshop', '交互设计', '设计系统'],
    softSkills: ['审美能力', '用户体验', '沟通能力', '设计思维'],
    responsibilities: [
      '负责产品界面设计，输出高质量设计稿',
      '搭建和维护设计系统，保证设计一致性',
      '与产品、开发团队协作，推动设计落地',
      '关注设计趋势，提升产品视觉体验'
    ],
    tags: ['UI设计', 'Figma', '交互设计', '设计系统']
  },
  {
    id: 'jd-devops',
    name: 'DevOps工程师',
    category: '互联网',
    experience: '2-4年',
    education: '本科',
    hardSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', '监控运维'],
    softSkills: ['自动化思维', '问题排查', '应急响应', '团队协作'],
    responsibilities: [
      '负责基础设施建设和运维自动化',
      '搭建 CI/CD 流水线，提升部署效率',
      '保障系统高可用性和稳定性',
      '优化系统性能，降低运维成本'
    ],
    tags: ['DevOps', 'Docker', 'K8s', 'CI/CD', '运维']
  },
  {
    id: 'jd-marketing-manager',
    name: '市场营销经理',
    category: '互联网',
    experience: '3-5年',
    education: '本科',
    hardSkills: ['市场调研', '品牌推广', '数据分析', '渠道管理', '内容营销'],
    softSkills: ['市场敏锐度', '创意能力', '项目管理', '团队协作'],
    responsibilities: [
      '制定市场策略，提升品牌影响力',
      '策划和执行营销活动，推动用户增长',
      '分析营销数据，优化投放效果',
      '管理营销团队，达成业务目标'
    ],
    tags: ['市场营销', '品牌推广', '用户增长', '数据分析']
  },
  {
    id: 'jd-financial-analyst',
    name: '财务分析师',
    category: '金融',
    experience: '2-4年',
    education: '本科',
    hardSkills: ['财务建模', 'Excel', '数据分析', '财务报表', 'CPA/CMA'],
    softSkills: ['细心严谨', '逻辑分析', '报告撰写', '合规意识'],
    responsibilities: [
      '负责财务数据分析和预测',
      '编制财务报表和预算',
      '参与财务决策，提供专业建议',
      '协助完成审计和合规工作'
    ],
    tags: ['财务', 'Excel', '财务建模', 'CPA']
  },
  {
    id: 'jd-human-resources',
    name: '人力资源专员',
    category: '服务业',
    experience: '1-3年',
    education: '本科',
    hardSkills: ['招聘管理', '员工关系', '薪酬福利', '劳动法规', 'HRIS'],
    softSkills: ['沟通能力', '同理心', '组织协调', '保密意识'],
    responsibilities: [
      '负责公司招聘工作，筛选和面试候选人',
      '处理员工入职、离职等手续',
      '维护员工关系，解决员工问题',
      '协助组织员工培训和团建活动'
    ],
    tags: ['人力资源', '招聘', '员工关系', 'HRIS']
  },
  {
    id: 'jd-project-manager',
    name: '项目经理',
    category: '互联网',
    experience: '3-5年',
    education: '本科',
    hardSkills: ['项目管理', '进度管理', '风险管理', '敏捷开发', 'PMP'],
    softSkills: ['领导力', '沟通协调', '问题解决', '时间管理'],
    responsibilities: [
      '负责项目规划和进度控制',
      '协调跨部门资源，推动项目落地',
      '识别和管理项目风险',
      '确保项目按时、按质、按量完成'
    ],
    tags: ['项目管理', 'PMP', '敏捷', '风险管理']
  },
  {
    id: 'jd-sales-manager',
    name: '销售经理',
    category: '贸易零售',
    experience: '3-5年',
    education: '本科',
    hardSkills: ['客户开发', '商务谈判', '销售管理', '数据分析', 'CRM'],
    softSkills: ['沟通能力', '抗压能力', '客户导向', '结果导向'],
    responsibilities: [
      '负责销售团队管理，达成销售目标',
      '开发和维护客户关系',
      '策划销售策略，提升销售业绩',
      '分析销售数据，优化销售流程'
    ],
    tags: ['销售', '客户开发', '商务谈判', 'CRM']
  }
];

function findSimilarJDs(parsedJD, limit = 5) {
  if (!parsedJD || !parsedJD.skills || parsedJD.skills.length === 0) {
    return JD_LIBRARY.slice(0, limit);
  }

  const userSkills = parsedJD.skills.map(s => s.toLowerCase().trim());

  const scoredJDs = JD_LIBRARY.map(jd => {
    let score = 0;
    let matchedSkills = [];

    jd.hardSkills.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      if (userSkills.some(us => us.includes(lowerSkill) || lowerSkill.includes(us))) {
        score += 3;
        matchedSkills.push(skill);
      }
    });

    jd.softSkills.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      if (userSkills.some(us => us.includes(lowerSkill) || lowerSkill.includes(us))) {
        score += 2;
        matchedSkills.push(skill);
      }
    });

    if (parsedJD.experience) {
      const expMatch = matchExperience(parsedJD.experience, jd.experience);
      if (expMatch) score += 5;
    }

    if (parsedJD.education && jd.education) {
      const eduMatch = matchEducation(parsedJD.education, jd.education);
      if (eduMatch) score += 3;
    }

    return { ...jd, matchScore: score, matchedSkills };
  });

  return scoredJDs
    .filter(jd => jd.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

function matchExperience(userExp, jdExp) {
  const expLevels = { '不限': 0, '应届': 1, '1年': 2, '2年': 3, '3年': 4, '5年': 5, '5年+': 6 };
  
  const userLevel = extractExpLevel(userExp);
  const jdLevel = extractExpLevel(jdExp);
  
  if (userLevel >= jdLevel) return true;
  return false;
}

function extractExpLevel(expStr) {
  if (!expStr) return 0;
  if (expStr.includes('不限')) return 0;
  if (expStr.includes('应届')) return 1;
  
  const match = expStr.match(/(\d+)年/);
  if (match) {
    const num = parseInt(match[1]);
    if (num >= 5) return 6;
    return num + 1;
  }
  return 0;
}

function matchEducation(userEdu, jdEdu) {
  const eduLevels = { '高中': 1, '大专': 2, '本科': 3, '硕士': 4, '博士': 5 };
  
  const userLevel = eduLevels[userEdu] || 0;
  const jdLevel = eduLevels[jdEdu] || 0;
  
  return userLevel >= jdLevel;
}

function getJDById(id) {
  return JD_LIBRARY.find(jd => jd.id === id);
}

function getJDsByCategory(category) {
  if (!category) return JD_LIBRARY;
  return JD_LIBRARY.filter(jd => jd.category.includes(category));
}

function getJDSkills() {
  const allSkills = new Set();
  JD_LIBRARY.forEach(jd => {
    jd.hardSkills.forEach(s => allSkills.add(s));
    jd.softSkills.forEach(s => allSkills.add(s));
  });
  return [...allSkills];
}