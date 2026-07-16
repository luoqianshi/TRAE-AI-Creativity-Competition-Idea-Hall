// ========== 岗位详情页渲染模块 ==========

// 增强维度数据：按行业和类型派生
const enhancementData = {
  marketDemand: {
    '互联网': { level: '高', trend: '上升', desc: '数字化转型持续加速，AI和云原生领域需求激增' },
    '金融': { level: '中高', trend: '平稳', desc: '传统岗位收缩，但金融科技和风控方向需求增长' },
    '医疗': { level: '高', trend: '上升', desc: '人口老龄化和健康意识提升驱动需求持续增长' },
    '教育': { level: '中', trend: '平稳', desc: '素质教育和职业教育增长，学科教育调整期' },
    '制造业': { level: '中', trend: '上升', desc: '智能制造和工业4.0转型催生新型岗位需求' },
    '建筑业': { level: '中', trend: '平稳', desc: '从增量建设转向存量更新，BIM和绿色建筑是方向' },
    '政府': { level: '中', trend: '平稳', desc: '编制稳定但竞争激烈，数字化政务带来新机会' },
    '服务业': { level: '中', trend: '上升', desc: '消费升级带动专业服务和体验式服务增长' },
    '零售/电商': { level: '中高', trend: '上升', desc: '直播电商和跨境电商持续释放岗位需求' },
    '贸易零售': { level: '中', trend: '平稳', desc: '供应链数字化和跨境贸易带来结构性机会' },
    '多行业': { level: '中', trend: '平稳', desc: '跨行业通用型岗位，需求分布广泛' }
  },
  hotCities: {
    '互联网': ['北京', '上海', '深圳', '杭州', '广州', '成都'],
    '金融': ['上海', '北京', '深圳', '香港', '广州', '杭州'],
    '医疗': ['北京', '上海', '广州', '成都', '武汉', '南京'],
    '教育': ['北京', '上海', '广州', '深圳', '杭州', '南京'],
    '制造业': ['深圳', '苏州', '东莞', '佛山', '宁波', '无锡'],
    '建筑业': ['北京', '上海', '深圳', '广州', '成都', '武汉'],
    '政府': ['北京', '各省会城市'],
    '服务业': ['上海', '北京', '广州', '深圳', '成都', '杭州'],
    '零售/电商': ['杭州', '上海', '广州', '深圳', '北京', '成都'],
    '贸易零售': ['上海', '深圳', '广州', '宁波', '青岛', '厦门'],
    '多行业': ['北京', '上海', '广州', '深圳', '杭州', '成都']
  },
  jobSatisfaction: {
    '研究分析类': { score: 3.8, factors: ['智力挑战强', '成长空间大', '加班较多'] },
    '管理类': { score: 3.6, factors: ['影响力大', '收入上限高', '工作压力大'] },
    '设计创作类': { score: 3.7, factors: ['创意空间大', '作品有成就感', '需求波动大'] },
    '服务类': { score: 3.5, factors: ['助人有意义', '工作稳定', '晋升空间有限'] },
    '知识技能类': { score: 3.8, factors: ['技能复利强', '市场需求大', '技术更新快'] },
    '营销类': { score: 3.4, factors: ['收入弹性大', '成长快', '业绩压力大'] },
    '监督执行类': { score: 3.7, factors: ['稳定性高', '社会地位好', '工作节奏稳'] }
  },
  workIntensity: {
    '互联网': { level: '较高', desc: '996/大小周现象较普遍，项目节点加班多' },
    '金融': { level: '中高', desc: '投行/交易岗强度大，中后台相对平衡' },
    '医疗': { level: '高', desc: '轮班制，临床一线工作强度和精神压力都大' },
    '教育': { level: '中', desc: '有寒暑假，毕业班和培训机构强度较大' },
    '制造业': { level: '中', desc: '生产端有轮班，研发设计岗节奏较稳定' },
    '建筑业': { level: '中高', desc: '项目制工作，赶工期时强度大，驻场项目较多' },
    '政府': { level: '中低', desc: '相对规律，基层和应急岗位除外' },
    '服务业': { level: '中', desc: '排班制，节假日更忙，整体强度适中' },
    '零售/电商': { level: '中高', desc: '大促期间强度大，日常相对可控' },
    '贸易零售': { level: '中', desc: '业务驱动型，广交会展季等节点较忙' },
    '多行业': { level: '中', desc: '因行业和公司差异较大' }
  },
  growthPathYears: {
    '研究分析类': {初级: '0-2年', 中级: '2-5年', 高级: '5-10年', 专家: '10年+'},
    '管理类': {初级: '0-2年', 中级: '2-5年', 高级: '5-10年', 专家: '10年+'},
    '设计创作类': {初级: '0-2年', 中级: '2-5年', 高级: '5-8年', 专家: '8年+'},
    '服务类': {初级: '0-2年', 中级: '2-5年', 高级: '5-8年', 专家: '8年+'},
    '知识技能类': {初级: '0-2年', 中级: '2-5年', 高级: '5-8年', 专家: '10年+'},
    '营销类': {初级: '0-2年', 中级: '2-5年', 高级: '5-8年', 专家: '8年+'},
    '监督执行类': {初级: '0-3年', 中级: '3-6年', 高级: '6-12年', 专家: '12年+'}
  }
};

// 发展路径数据（按职业类型分类）
const careerPaths = {
  '研究分析类': [
    { level: '初级', title: '分析专员/助理', years: '0-2年', desc: '执行标准化分析任务，学习工具和方法论' },
    { level: '中级', title: '分析师', years: '2-5年', desc: '独立负责分析项目，产出业务洞察' },
    { level: '高级', title: '高级分析师/专家', years: '5-8年', desc: '主导复杂分析项目，建立分析框架' },
    { level: '专家', title: '分析总监/首席分析师', years: '8年+', desc: '制定分析战略，管理团队，影响业务决策' }
  ],
  '管理类': [
    { level: '初级', title: '专员/助理', years: '0-2年', desc: '学习业务流程，协助项目管理' },
    { level: '中级', title: '经理/主管', years: '2-5年', desc: '独立管理项目或小团队' },
    { level: '高级', title: '高级经理/总监', years: '5-8年', desc: '负责部门级战略和大型项目' },
    { level: '专家', title: 'VP/合伙人', years: '8年+', desc: '参与公司战略决策，管理多条业务线' }
  ],
  '设计创作类': [
    { level: '初级', title: '初级设计师/助理', years: '0-2年', desc: '执行设计任务，积累作品和经验' },
    { level: '中级', title: '设计师/资深设计师', years: '2-5年', desc: '独立负责项目设计，形成个人风格' },
    { level: '高级', title: '设计总监/创意总监', years: '5-8年', desc: '主导品牌视觉体系，管理设计团队' },
    { level: '专家', title: '合伙人/独立工作室', years: '8年+', desc: '建立个人品牌或工作室，承接高端项目' }
  ],
  '服务类': [
    { level: '初级', title: '服务专员/助理', years: '0-2年', desc: '学习服务流程，积累客户沟通经验' },
    { level: '中级', title: '资深专员/主管', years: '2-5年', desc: '独立处理复杂服务场景，指导新人' },
    { level: '高级', title: '部门经理/高级顾问', years: '5-8年', desc: '制定服务标准，管理团队和客户关系' },
    { level: '专家', title: '总监/合伙人', years: '8年+', desc: '建立服务体系，影响行业服务标准' }
  ],
  '知识技能类': [
    { level: '初级', title: '初级工程师/技术员', years: '0-2年', desc: '掌握基础技能，在指导下完成任务' },
    { level: '中级', title: '工程师/高级工程师', years: '2-5年', desc: '独立解决技术问题，承担核心模块' },
    { level: '高级', title: '技术专家/架构师', years: '5-8年', desc: '主导技术方案设计，攻克技术难题' },
    { level: '专家', title: '技术总监/首席工程师', years: '8年+', desc: '制定技术战略，引领技术创新方向' }
  ],
  '营销类': [
    { level: '初级', title: '营销专员/助理', years: '0-2年', desc: '执行营销活动，学习市场分析方法' },
    { level: '中级', title: '营销经理/高级专员', years: '2-5年', desc: '独立策划营销方案，管理营销渠道' },
    { level: '高级', title: '营销总监/CMO', years: '5-8年', desc: '制定营销战略，管理品牌和增长' },
    { level: '专家', title: '合伙人/独立顾问', years: '8年+', desc: '建立个人影响力，提供战略咨询' }
  ],
  '监督执行类': [
    { level: '初级', title: '执行专员/助理', years: '0-2年', desc: '熟悉法规和流程，执行标准化任务' },
    { level: '中级', title: '主管/高级专员', years: '2-5年', desc: '独立处理复杂案件，监督执行质量' },
    { level: '高级', title: '部门负责人/总监', years: '5-8年', desc: '制定执行策略，管理团队和合规体系' },
    { level: '专家', title: '合伙人/首席官', years: '8年+', desc: '参与战略决策，建立行业影响力' }
  ]
};

// Holland类型名称映射
var hollandTypeNames = { R: '实用型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型' };

// Holland类型颜色映射
var hollandColors = {
  R: { bg: 'rgba(232, 153, 10, 0.15)', color: '#c07a08' },
  I: { bg: 'rgba(78, 70, 220, 0.15)', color: '#4E46DC' },
  A: { bg: 'rgba(220, 80, 120, 0.15)', color: '#c04060' },
  S: { bg: 'rgba(13, 184, 168, 0.15)', color: '#0a9a8e' },
  E: { bg: 'rgba(240, 160, 40, 0.15)', color: '#c08a20' },
  C: { bg: 'rgba(100, 120, 180, 0.15)', color: '#5060a0' }
};

// 当前查看的职业索引（用于从详情页跳转技能差距）
var detailCareerIndex = -1;

// 打开岗位详情页
function openCareerDetail(careerIndex) {
  detailCareerIndex = careerIndex;

  // 获取职业数据
  var career = null;
  if (window._careerMatches && window._careerMatches[careerIndex]) {
    career = window._careerMatches[careerIndex];
  } else if (careerDB && careerDB[careerIndex]) {
    career = careerDB[careerIndex];
  }

  if (!career) return;

  // 渲染详情页
  renderCareerDetail(career);

  // 导航到详情视图
  navigateTo('career-detail');
}

// 渲染岗位详情页
function renderCareerDetail(career) {
  var container = document.getElementById('careerDetailContent');
  if (!container) return;

  var html = '';

  // 顶部标题栏
  html += '<div class="detail-top-bar">';
  html += '<button class="btn-back" onclick="goBackFromDetail()">&#8592; 返回结果</button>';
  html += '<h2 class="detail-title">' + career.name + '</h2>';
  html += '</div>';

  // Holland代码徽章 + 岗位概述
  html += '<div class="detail-hero">';
  html += '<div class="detail-hero-left">';
  html += renderHollandBadge(career.code);
  html += '</div>';
  html += '<div class="detail-hero-right">';
  html += '<div class="detail-section-label">岗位概述</div>';
  html += '<p class="detail-prospect">' + (career.prospect || '暂无概述信息') + '</p>';
  html += '</div>';
  html += '</div>';

  // 基本信息卡片
  html += '<div class="detail-card">';
  html += '<div class="detail-card-title">&#128196; 基本信息</div>';
  html += '<div class="detail-info-grid">';
  html += renderInfoItem('行业', career.industry);
  html += renderInfoItem('类型', career.type);
  html += renderInfoItem('入门门槛', career.entryBarrier);
  html += renderInfoItem('稳定性', career.stability);
  html += renderInfoItem('技术迭代', career.techPace);
  html += '</div>';
  html += '</div>';

  // 市场与环境（9维度增强）
  html += '<div class="detail-card">';
  html += '<div class="detail-card-title">&#128202; 市场与环境</div>';
  html += renderMarketEnvironment(career);
  html += '</div>';

  // 核心技能要求
  html += '<div class="detail-card">';
  html += '<div class="detail-card-title">&#127919; 核心技能要求</div>';
  html += '<div class="detail-skills-grid">';
  if (career.skills && career.skills.length > 0) {
    career.skills.forEach(function(skill) {
      html += '<span class="detail-skill-tag">' + skill + '</span>';
    });
  }
  html += '</div>';
  html += '</div>';

  // 发展路径
  html += '<div class="detail-card">';
  html += '<div class="detail-card-title">&#128200; 发展路径</div>';
  html += renderCareerPath(career.type);
  html += '</div>';

  // 工作特质
  html += '<div class="detail-card">';
  html += '<div class="detail-card-title">&#128188; 工作特质</div>';
  html += '<p class="detail-work-traits">' + (career.workTraits || '暂无工作特质信息') + '</p>';
  html += '</div>';

  // 适合人群
  html += '<div class="detail-card">';
  html += '<div class="detail-card-title">&#128101; 适合人群</div>';
  html += '<p class="detail-fit-audience">' + getFitAudience(career.code) + '</p>';
  html += '</div>';

  // AI时代影响评估
  html += '<div class="detail-card">';
  html += '<div class="detail-card-title">&#129302; AI时代影响评估</div>';
  html += renderAIImpact(career);
  html += '</div>';

  // 底部操作按钮
  html += '<div class="detail-actions">';
  html += '<button class="btn-primary" onclick="goToSkillGapFromDetail()">查看技能差距</button>';
  html += '<button class="btn-secondary" onclick="goToActionPlanFromDetail()">生成行动计划</button>';
  html += '</div>';

  container.innerHTML = html;
}

// 渲染Holland代码徽章
function renderHollandBadge(code) {
  if (!code || code.length < 2) return '';
  var html = '<div class="holland-badge">';
  for (var i = 0; i < Math.min(code.length, 3); i++) {
    var letter = code[i];
    var colors = hollandColors[letter] || { bg: 'rgba(150,150,150,0.15)', color: '#666' };
    var typeName = hollandTypeNames[letter] || '';
    html += '<div class="holland-badge-item" style="background:' + colors.bg + '; color:' + colors.color + '">';
    html += '<span class="holland-letter">' + letter + '</span>';
    html += '<span class="holland-type-name">' + typeName + '</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// 渲染基本信息项
function renderInfoItem(label, value) {
  if (!value) return '';
  return '<div class="detail-info-item"><span class="detail-info-label">' + label + '</span><span class="detail-info-value">' + value + '</span></div>';
}

// 渲染发展路径阶梯图
function renderCareerPath(type) {
  var path = careerPaths[type] || careerPaths['知识技能类'];
  var html = '<div class="career-path-steps">';

  path.forEach(function(step, index) {
    var isLast = index === path.length - 1;
    var levelColors = ['#4E46DC', '#0DB8A8', '#E8990A', '#dc5078'];
    var color = levelColors[index] || '#4E46DC';

    html += '<div class="career-path-step">';
    html += '<div class="career-path-dot" style="background:' + color + '"></div>';
    if (!isLast) {
      html += '<div class="career-path-line" style="background: linear-gradient(180deg, ' + color + ', ' + (levelColors[index + 1] || color) + ')"></div>';
    }
    html += '<div class="career-path-content">';
    html += '<div class="career-path-level" style="color:' + color + '">' + step.level + '</div>';
    html += '<div class="career-path-title">' + step.title + '</div>';
    html += '<div class="career-path-years">' + step.years + '</div>';
    html += '<div class="career-path-desc">' + step.desc + '</div>';
    html += '</div>';
    html += '</div>';
  });

  html += '</div>';
  return html;
}

// 市场与环境9维度渲染
function renderMarketEnvironment(career) {
  var industryKey = career.industry || '多行业';
  var typeKey = career.type || '研究分析类';

  var demand = enhancementData.marketDemand[industryKey] || enhancementData.marketDemand['多行业'];
  var hotCities = enhancementData.hotCities[industryKey] || enhancementData.hotCities['多行业'];
  var satisfaction = enhancementData.jobSatisfaction[typeKey] || { score: 3.5, factors: ['工作稳定'] };
  var intensity = enhancementData.workIntensity[industryKey] || enhancementData.workIntensity['多行业'];
  var growthYears = enhancementData.growthPathYears[typeKey] || {初级: '0-2年', 中级: '2-5年', 高级: '5-8年', 专家: '8年+'};

  var demandTrendIcon = demand.trend === '上升' ? '📈' : demand.trend === '下降' ? '📉' : '➡️';
  var satisfactionPercent = Math.round((satisfaction.score / 5) * 100);

  var html = '';

  // 4维度指标卡片区
  html += '<div class="market-metrics-grid">';

  // 市场需求
  html += '<div class="metric-card">';
  html += '<div class="metric-icon">📊</div>';
  html += '<div class="metric-body">';
  html += '<div class="metric-label">市场需求</div>';
  html += '<div class="metric-value">' + demand.level + ' <span class="metric-trend">' + demandTrendIcon + ' ' + demand.trend + '</span></div>';
  html += '<div class="metric-desc">' + demand.desc + '</div>';
  html += '</div></div>';

  // 职业满意度
  html += '<div class="metric-card">';
  html += '<div class="metric-icon">😊</div>';
  html += '<div class="metric-body">';
  html += '<div class="metric-label">职业满意度</div>';
  html += '<div class="metric-value">' + satisfaction.score + ' <span class="metric-unit">/ 5.0</span></div>';
  html += '<div class="metric-bar"><div class="metric-bar-fill" style="width:' + satisfactionPercent + '%"></div></div>';
  html += '<div class="metric-factors">' + satisfaction.factors.map(function(f) { return '<span class="factor-tag">' + f + '</span>'; }).join('') + '</div>';
  html += '</div></div>';

  // 工作强度
  html += '<div class="metric-card">';
  html += '<div class="metric-icon">⚡</div>';
  html += '<div class="metric-body">';
  html += '<div class="metric-label">工作强度</div>';
  html += '<div class="metric-value">' + intensity.level + '</div>';
  html += '<div class="metric-desc">' + intensity.desc + '</div>';
  html += '</div></div>';

  // 成长周期
  html += '<div class="metric-card">';
  html += '<div class="metric-icon">🚀</div>';
  html += '<div class="metric-body">';
  html += '<div class="metric-label">成长周期</div>';
  html += '<div class="metric-growth-list">';
  html += '<div class="growth-item"><span class="growth-level">初级</span><span class="growth-year">' + growthYears.初级 + '</span></div>';
  html += '<div class="growth-item"><span class="growth-level">中级</span><span class="growth-year">' + growthYears.中级 + '</span></div>';
  html += '<div class="growth-item"><span class="growth-level">高级</span><span class="growth-year">' + growthYears.高级 + '</span></div>';
  html += '</div>';
  html += '</div></div>';

  html += '</div>';

  // 热门就业城市
  html += '<div class="hot-cities-section">';
  html += '<div class="section-sub-title">🏙️ 热门就业城市</div>';
  html += '<div class="hot-cities-list">';
  hotCities.forEach(function(city, idx) {
    html += '<span class="city-tag ' + (idx < 3 ? 'city-top' : '') + '">' + (idx < 3 ? '🥇🥈🥉'[idx] : '') + ' ' + city + '</span>';
  });
  html += '</div>';
  html += '</div>';

  return html;
}

// AI时代影响评估
function renderAIImpact(career) {
  var impact = getAIImpact(career);

  var riskColorClass = '';
  var riskBgClass = '';
  if (impact.risk === '低') {
    riskColorClass = 'ai-risk-low';
    riskBgClass = 'ai-risk-bg-low';
  } else if (impact.risk === '中') {
    riskColorClass = 'ai-risk-mid';
    riskBgClass = 'ai-risk-bg-mid';
  } else {
    riskColorClass = 'ai-risk-high';
    riskBgClass = 'ai-risk-bg-high';
  }

  var html = '<div class="ai-impact-container">';
  html += '<div class="ai-impact-row">';
  html += '<span class="ai-impact-label">AI替代风险</span>';
  html += '<span class="ai-risk-tag ' + riskColorClass + '">' + impact.risk + '</span>';
  html += '</div>';
  html += '<p class="ai-impact-desc ' + riskBgClass + '">' + impact.riskDesc + '</p>';
  html += '<div class="ai-impact-row" style="margin-top:16px;">';
  html += '<span class="ai-impact-label">AI辅助机会</span>';
  html += '</div>';
  html += '<p class="ai-impact-opportunity">' + impact.opportunity + '</p>';
  html += '</div>';

  return html;
}

// 计算AI时代影响
function getAIImpact(career) {
  var risk = '中';
  var riskDesc = '';
  var opportunity = '';

  if (career.type === '知识技能类' && career.techPace === '快') {
    risk = '低';
    riskDesc = '技术岗位受AI替代风险较低，但需持续学习AI工具提升效率，保持技术竞争力';
    opportunity = '掌握AI辅助开发工具（如Copilot、ChatGPT）可大幅提升生产力，将重复编码工作自动化';
  } else if (career.type === '管理类') {
    risk = '低';
    riskDesc = '管理和决策岗位需要人际判断和复杂沟通，AI难以替代核心能力';
    opportunity = '利用AI进行数据驱动的管理决策，提升团队效能和战略规划质量';
  } else if (career.type === '研究分析类') {
    risk = '低';
    riskDesc = '研究分析需要深度思考和创新能力，AI可作为辅助工具但难以替代分析洞察力';
    opportunity = '利用AI加速数据收集和初步分析，将更多精力投入深度洞察和策略建议';
  } else if (career.type === '设计创作类') {
    risk = '中';
    riskDesc = 'AI可以辅助生成设计素材和内容，但原创创意和品牌策略能力仍不可替代';
    opportunity = '学习使用AI设计工具（如Midjourney、Figma AI）提升创作效率，聚焦高价值创意工作';
  } else if (career.type === '营销类') {
    risk = '中';
    riskDesc = 'AI可以自动化部分营销执行工作，但策略制定和客户关系管理仍需人工';
    opportunity = '利用AI进行精准用户画像和投放优化，提升营销ROI和客户触达效率';
  } else if (career.type === '服务类' && career.stability === '高') {
    risk = '低';
    riskDesc = '需要人际互动和情感交流的服务岗位受AI影响较小';
    opportunity = '利用AI优化服务流程和客户管理，提升服务质量和效率';
  } else if (career.type === '服务类') {
    risk = '中';
    riskDesc = '部分标准化服务流程可能被AI辅助，但人际沟通和情感支持仍是核心';
    opportunity = '学习使用AI工具提升服务效率，同时强化人际沟通等AI难以替代的能力';
  } else if (career.type === '监督执行类') {
    risk = '低';
    riskDesc = '法规执行和监督工作需要专业判断和责任承担，AI替代风险较低';
    opportunity = '利用AI辅助文书处理和信息检索，提升工作效率和准确性';
  } else {
    risk = '中';
    riskDesc = 'AI时代下，持续学习和技能升级是应对变化的关键';
    opportunity = '积极拥抱AI工具，将其作为提升工作效率的助手而非威胁';
  }

  return { risk: risk, riskDesc: riskDesc, opportunity: opportunity };
}

// 适合人群推断（基于Holland代码）
function getFitAudience(code) {
  if (!code || code.length < 2) return '暂无适合人群分析';

  var primary = hollandTypeNames[code[0]] || '';
  var secondary = hollandTypeNames[code[1]] || '';
  var tertiary = code.length >= 3 ? hollandTypeNames[code[2]] : '';

  var descriptions = {
    R: '喜欢动手实践、操作工具和设备，偏好具体明确的工作成果',
    I: '善于分析思考、探索未知，对研究和解决问题有浓厚兴趣',
    A: '富有创造力和想象力，追求美感和自我表达，不拘泥于常规',
    S: '关心他人、乐于助人，善于沟通和建立人际关系',
    E: '具有领导力和说服力，喜欢影响他人、追求成就和影响力',
    C: '注重细节和规范，善于组织和规划，偏好有序的工作环境'
  };

  var text = '特别适合<strong>' + primary + '</strong>主导、<strong>' + secondary + '</strong>为辅的人群。';
  text += descriptions[code[0]] ? descriptions[code[0]] + '。' : '';
  if (tertiary) {
    text += '同时具备一定的<strong>' + tertiary + '</strong>特质会更有优势。';
  }
  text += '如果你在工作中能发挥这些特质，会更容易获得成就感和职业满足感。';

  return text;
}

// 从详情页返回结果页
function goBackFromDetail() {
  navigateTo('result');
}

// 从详情页跳转到技能差距分析
function goToSkillGapFromDetail() {
  if (detailCareerIndex >= 0) {
    currentCareerIndex = detailCareerIndex;
    navigateTo('result');
    // 延迟执行以确保结果页已渲染
    setTimeout(function() {
      showFollowUpQuestions(detailCareerIndex);
    }, 100);
  }
}

// 从详情页跳转到行动计划
function goToActionPlanFromDetail() {
  if (detailCareerIndex >= 0) {
    currentCareerIndex = detailCareerIndex;
    navigateTo('result');
    setTimeout(function() {
      skipFollowUp();
    }, 100);
  }
}
