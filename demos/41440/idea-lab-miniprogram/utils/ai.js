// AI 算法模块 - 想法分类、评分、分析

const CATEGORIES = ['社会服务', '教育创新', '生活娱乐', '学习工作', '硬件交互'];

const KEYWORDS = {
  '社会服务': ['老人', '养老', '公益', '社区', '医疗', '健康', '助残', '文化', '非遗', '方言', '环保', '社会', '互助', '志愿', '陪伴', '独居'],
  '教育创新': ['学习', '教育', '孩子', '学生', '课程', '培训', '考试', '启蒙', '辅导', '学校', '编程', '教学', '知识'],
  '生活娱乐': ['美食', '旅行', '游戏', '购物', '健身', '宠物', '家居', '菜谱', '穿搭', '娱乐', '冰箱', '食材', '生活'],
  '学习工作': ['工作', '效率', '办公', '论文', '代码', '编程', '工具', '管理', '创业', '项目', '科研', '职场'],
  '硬件交互': ['硬件', '设备', '传感器', '机器人', 'AR', 'VR', '智能手环', '物联网', '芯片', '手环', '交互']
};

// 标签映射：每个分类对应首页的5个想法类型标签
const CATEGORY_TAGS = {
  '社会服务': ['产品创意', '问题发现'],
  '教育创新': ['学习心得', '产品创意'],
  '生活娱乐': ['产品创意', '优化想法'],
  '学习工作': ['学习心得', '优化想法'],
  '硬件交互': ['灵感闪现', '产品创意']
};

// 自动分类
function classifyIdea(text) {
  let maxScore = 0, best = '生活娱乐';
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    const score = words.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0);
    if (score > maxScore) { maxScore = score; best = cat; }
  }
  return best;
}

// 提取标签：返回 [分类, 想法类型1, 想法类型2]
function extractTags(text, category) {
  const tags = CATEGORY_TAGS[category] || ['产品创意'];
  return [category, tags[0], tags[1]];
}

// 计算评分
function calculateScore(text) {
  let score = 50;
  if (text.length > 20) score += 5;
  if (text.length > 50) score += 5;
  if (text.includes('AI')) score += 8;
  if (text.includes('用户') || text.includes('需求')) score += 5;
  if (text.includes('市场') || text.includes('商业')) score += 5;
  if (text.includes('解决') || text.includes('帮助')) score += 7;
  const keywords = ['创新', '智能', '个性化', '效率', '社交', '健康', '教育', '环保', '互助'];
  keywords.forEach(k => { if (text.includes(k)) score += 3; });
  return Math.min(98, Math.max(30, score + Math.floor(Math.random() * 10)));
}

// 分析想法内容，提取关键信息
function analyzeContent(idea) {
  const text = idea.content;
  const keywords = [];
  
  // 提取技术关键词
  const techWords = ['AI', '语音', '人脸识别', '智能', 'APP', '小程序', '机器人', '传感器', '算法', '大数据', '物联网', 'AR', 'VR', '区块链'];
  techWords.forEach(w => { if (text.includes(w)) keywords.push(w); });
  
  // 提取目标用户
  let targetUser = '普通用户';
  if (text.includes('老人') || text.includes('老年')) targetUser = '老年人群体';
  else if (text.includes('孩子') || text.includes('儿童') || text.includes('学生')) targetUser = '学生/儿童群体';
  else if (text.includes('科研') || text.includes('论文')) targetUser = '科研人员';
  else if (text.includes('社区')) targetUser = '社区居民';
  
  // 提取核心功能
  let coreFeature = '未明确';
  const featurePatterns = ['帮助', '解决', '通过', '实现', '提供', '设计'];
  for (const p of featurePatterns) {
    const idx = text.indexOf(p);
    if (idx !== -1) {
      const endIdx = text.indexOf('。', idx);
      if (endIdx !== -1) {
        coreFeature = text.substring(idx, endIdx + 1);
        break;
      }
    }
  }
  
  return { keywords, targetUser, coreFeature };
}

// 生成基于想法内容的分析报告
function generateAnalysis(idea) {
  const content = analyzeContent(idea);
  const text = idea.content;
  
  // 根据想法内容计算三维评分
  let techScore = 50, marketScore = 50, resourceScore = 50;
  
  // 技术评分：技术关键词越多，技术可行性越高
  if (content.keywords.length >= 3) techScore += 20;
  else if (content.keywords.length >= 1) techScore += 10;
  if (text.includes('简单') || text.includes('容易')) techScore += 10;
  if (text.includes('复杂') || text.includes('困难')) techScore -= 10;
  
  // 市场评分：目标用户越明确，市场可行性越高
  if (content.targetUser !== '普通用户') marketScore += 15;
  if (text.includes('需求') || text.includes('问题')) marketScore += 10;
  if (text.includes('市场') || text.includes('用户')) marketScore += 10;
  
  // 资源评分：功能描述越详细，资源可行性越高
  if (text.length > 50) resourceScore += 15;
  if (text.includes('合作') || text.includes('伙伴')) resourceScore += 10;
  if (text.includes('低成本') || text.includes('简单')) resourceScore += 10;
  
  techScore = Math.min(95, Math.max(30, techScore + Math.floor(Math.random() * 10) - 5));
  marketScore = Math.min(95, Math.max(30, marketScore + Math.floor(Math.random() * 10) - 5));
  resourceScore = Math.min(95, Math.max(30, resourceScore + Math.floor(Math.random() * 10) - 5));
  const overallScore = Math.round((techScore + marketScore + resourceScore) / 3);
  
  // 生成核心洞察
  const insights = [
    `这个想法针对${content.targetUser}，核心功能是${content.coreFeature}。`,
    `想法中涉及${content.keywords.length > 0 ? content.keywords.join('、') : '基础'}技术，${techScore >= 70 ? '技术实现路径较为清晰' : techScore >= 50 ? '技术实现有一定挑战' : '技术实现需要进一步验证'}。`,
    `${marketScore >= 70 ? '目标用户明确，市场需求较为确定' : marketScore >= 50 ? '目标用户群体需要进一步细分' : '需要更多市场调研来验证需求'}。`
  ];
  
  // 生成市场调研（基于想法内容）
  const marketTexts = {
    '社会服务': `随着老龄化加剧，${content.targetUser}的服务需求持续增长。${text.includes('社区') ? '社区化服务模式' : '数字化服务模式'}成为趋势，政策支持力度大。`,
    '教育创新': `教育科技市场稳步增长，${content.targetUser}对个性化学习的需求日益增加。AI+教育成为热门赛道，市场规模预计持续扩大。`,
    '生活娱乐': `消费升级背景下，${content.targetUser}对便捷生活服务的需求旺盛。智能化、个性化产品接受度高，市场空间广阔。`,
    '学习工作': `效率工具市场增长迅速，远程办公普及后协作类工具需求增加。${content.targetUser}对提升工作效率的工具有强烈需求。`,
    '硬件交互': `AIoT市场快速发展，智能硬件渗透率持续提升。${content.targetUser}对智能化硬件产品的需求日益增长。`
  };
  
  // 生成竞品分析（基于想法内容）
  const competitorTexts = {
    '社会服务': `现有${text.includes('养老') ? '养老' : '社区'}服务产品多为基础功能型，缺乏智能化和个性化。通过${content.keywords[0] || 'AI'}技术可以实现差异化竞争。`,
    '教育创新': `市场上多为题库类和直播类产品，真正针对${content.targetUser}的个性化辅导产品较少，存在差异化空间。`,
    '生活娱乐': `该赛道竞争激烈，但针对${content.targetUser}的细分领域仍有创新机会。通过${content.keywords[0] || '智能化'}体验可以实现差异化。`,
    '学习工作': `Notion、飞书等大厂占据主流，但针对${content.targetUser}的垂直细分工具仍有创新空间。`,
    '硬件交互': `硬件赛道门槛高但壁垒也高，针对${content.targetUser}的${content.keywords[0] || '智能'}交互产品仍有市场空白。`
  };
  
  // 生成风险评估（基于想法内容）
  const risks = [];
  if (techScore < 60) risks.push({ level: 'high', text: `技术实现涉及${content.keywords.join('、')}，需要专业技术团队支持` });
  else if (techScore < 75) risks.push({ level: 'mid', text: '部分技术方案需要进一步验证可行性' });
  else risks.push({ level: 'low', text: '技术方案相对成熟，实现风险较低' });
  
  if (marketScore < 60) risks.push({ level: 'high', text: `${content.targetUser}的市场需求需要进一步验证` });
  else if (marketScore < 75) risks.push({ level: 'mid', text: '需要更精准的用户调研来确认需求' });
  else risks.push({ level: 'low', text: '目标用户明确，市场需求较为确定' });
  
  if (resourceScore < 60) risks.push({ level: 'mid', text: '项目需要较多资源投入，建议分阶段实施' });
  else risks.push({ level: 'low', text: '资源需求可控，可以稳步推进' });
  
  // 生成行动建议（基于想法内容）
  const suggestions = [
    `针对${content.targetUser}进行深度调研，验证${text.includes('解决') ? '问题' : '需求'}的真实性和紧迫性。`,
    `${techScore >= 70 ? '尽快' : '先'}开发${text.includes('MVP') ? '' : 'MVP（最小可行产品）'}，验证核心功能${content.coreFeature.substring(0, 20)}的可行性。`,
    `寻找${text.includes('技术') ? '技术' : '行业'}合作伙伴，弥补团队在${content.keywords.length > 0 ? content.keywords[0] : '产品'}方面的不足。`
  ];
  
  return {
    overallScore,
    techScore,
    marketScore,
    resourceScore,
    techDesc: techScore >= 70 ? '技术方案成熟，可实现性强' : techScore >= 50 ? '技术有一定挑战，需要专业团队' : '技术实现需要进一步验证',
    marketDesc: marketScore >= 70 ? '市场需求明确，用户群体清晰' : marketScore >= 50 ? '市场有一定需求，需要精准定位' : '市场需求需要进一步验证',
    resourceDesc: resourceScore >= 70 ? '资源需求可控，可稳步推进' : resourceScore >= 50 ? '资源投入适中，建议分阶段' : '需要较多资源，建议寻求合作',
    insight: insights.join('\n'),
    market: marketTexts[idea.category] || marketTexts['生活娱乐'],
    competitors: competitorTexts[idea.category] || competitorTexts['生活娱乐'],
    risks,
    suggestions
  };
}

// 计算创意指数
function calculateCreativityIndex(ideas, todayStr) {
  const todayIdeas = ideas.filter(i => i.date === todayStr);
  const avgScore = todayIdeas.length > 0 ? Math.round(todayIdeas.reduce((s, i) => s + i.score, 0) / todayIdeas.length) : 0;
  const categories = new Set(todayIdeas.map(i => i.category)).size;
  const pinned = todayIdeas.some(i => i.pinned) ? 10 : 0;
  const ci = Math.min(100, Math.round(todayIdeas.length * 12 + avgScore * 0.4 + categories * 8 + pinned));
  return ci;
}

// 去重检测
function detectDuplicates(ideas) {
  const pairs = [];
  for (let i = 0; i < ideas.length; i++) {
    for (let j = i + 1; j < ideas.length; j++) {
      const sim = calcSimilarity(ideas[i].content, ideas[j].content);
      if (sim > 0.5) pairs.push({ a: ideas[i], b: ideas[j], sim });
    }
  }
  return pairs;
}

function calcSimilarity(a, b) {
  const setA = new Set(a.split(''));
  const setB = new Set(b.split(''));
  let inter = 0;
  setA.forEach(c => { if (setB.has(c)) inter++; });
  return inter / (Math.max(setA.size, setB.size) || 1);
}

module.exports = {
  CATEGORIES,
  classifyIdea,
  extractTags,
  calculateScore,
  generateAnalysis,
  calculateCreativityIndex,
  detectDuplicates
};
