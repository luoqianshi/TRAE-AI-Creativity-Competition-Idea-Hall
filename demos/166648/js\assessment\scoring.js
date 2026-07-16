// ========== 结果计算 ==========
function calculateAndShowResults() {
  const scores = assessmentData.riasecScores;
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3).map(e => e[0]);
  const code3 = top3.join('');

  const anchorCounts = {};
  assessmentData.anchorAnswers.forEach((isA, i) => {
    const anchor = isA ? anchorMapping[i] : anchorMappingB[i];
    anchorCounts[anchor] = (anchorCounts[anchor] || 0) + 1;
  });
  const sortedAnchors = Object.entries(anchorCounts).sort((a, b) => b[1] - a[1]);
  const top2Anchors = sortedAnchors.slice(0, 2).map(e => e[0]);

  // ===== 四层匹配算法 =====

  // --- Layer 2: 职业锚价值观契合度映射 ---
  const anchorPreferenceMap = {
    '技术职能型':  { type: 'holland', codes: ['R', 'I'] },
    '技术研究型':  { type: 'holland', codes: ['R', 'I'] },
    '管理型':      { type: 'holland', codes: ['E'] },
    '企业竞争型':  { type: 'holland', codes: ['E'] },
    '自主独立型':  { type: 'trait',   check: (c) => c.stability !== '高' && c.techPace === '慢' },
    '生活方式型':  { type: 'trait',   check: (c) => c.stability !== '高' && c.techPace === '慢' },
    '安全稳定型':  { type: 'trait',   check: (c) => c.stability === '高' },
    '稳定深耕型':  { type: 'trait',   check: (c) => c.stability === '高' },
    '创业创造型':  { type: 'trait',   check: (c) => c.stability === '低' && c.techPace === '快' },
    '服务奉献型':  { type: 'holland', codes: ['S'] },
    '追求成就型':  { type: 'holland', codes: ['E'] },
    '纯粹挑战型':  { type: 'holland', codes: ['I'] },
    '独立创作型':  { type: 'holland', codes: ['A'] },
    '多元探索型':  { type: 'none' }
  };

  // --- Layer 3: 学历过滤映射 ---
  // 定义需要较高学历的职业（大专以下会扣分）
  const educationFilter = {
    '学术研究员': '硕士',
    '基金经理':   '硕士',
    '临床医生':   '硕士',
    '律师':       '本科',
    '临床研究员': '硕士',
    '算法工程师': '硕士',
    '数据科学家': '硕士'
  };

  // 学历等级（数值越大要求越高）
  const educationLevel = {
    '高中': 1, '大专': 2, '本科': 3, '硕士': 4, '博士': 5
  };
  const eduReqLevel = {
    '本科': 3, '硕士': 4
  };

  // --- Layer 4: 用户偏好权重 ---
  const prefBoostMap = {
    '发展空间': (c) => c.techPace === '快',
    '稳定性':   (c) => c.stability === '高',
    '成长空间': (c) => c.techPace === '快' || c.techPace === '中',
    '兴趣匹配': null
  };

  // --- 执行匹配 ---
  const userEdu = assessmentData.education || '';
  const userEduLevel = educationLevel[userEdu] || 0;
  const userPrefs = assessmentData.preferences || [];
  const topPref = userPrefs[0] || '';

  const matches = careerDB.map(career => {
    // ===== Layer 1: Holland 代码匹配 =====
    const cCode = career.code;
    let matchScore = 0;
    let layer1Desc = '';
    if (cCode === code3) { matchScore = 95; layer1Desc = 'Holland代码完全匹配'; }
    else if (cCode[0] === top3[0] && cCode[1] === top3[1]) { matchScore = 80; layer1Desc = 'Holland代码前两位匹配'; }
    else if (cCode[0] === top3[0] && cCode[2] === top3[2]) { matchScore = 70; layer1Desc = 'Holland代码首尾匹配'; }
    else if (cCode[0] === top3[0]) { matchScore = 60; layer1Desc = 'Holland代码首位匹配'; }
    else if (cCode[1] === top3[1]) { matchScore = 50; layer1Desc = 'Holland代码次位匹配'; }
    else if (cCode[2] === top3[2]) { matchScore = 40; layer1Desc = 'Holland代码末位匹配'; }

    if (matchScore === 0) return { ...career, matchScore: 0, matchReason: '' };

    // ===== Layer 2: 职业锚价值观契合度 =====
    let anchorBonus = 0;
    let anchorDesc = '';
    top2Anchors.forEach(anchor => {
      const pref = anchorPreferenceMap[anchor];
      if (!pref || pref.type === 'none') return;
      let matched = false;
      if (pref.type === 'holland') {
        matched = pref.codes.some(code => cCode.includes(code));
      } else if (pref.type === 'trait') {
        matched = pref.check(career);
      }
      if (matched) {
        anchorBonus += 5;
        if (!anchorDesc) anchorDesc = `符合你的${anchor}职业锚`;
      }
    });

    // ===== Layer 3: 基础信息过滤（学历） =====
    let eduPenalty = 0;
    let eduDesc = '';
    const reqEdu = educationFilter[career.name];
    if (reqEdu && userEdu && userEduLevel > 0) {
      const reqLevel = eduReqLevel[reqEdu] || 0;
      if (userEduLevel < reqLevel) {
        eduPenalty = 10;
        eduDesc = `该职业通常需要${reqEdu}及以上学历`;
      }
    }

    // ===== Layer 4: 用户偏好权重排序（支持多偏好） =====
    let prefBonus = 0;
    let prefDesc = '';
    const prefDescs = [];
    const prefWeights = [3, 2, 1];
    
    userPrefs.forEach((pref, idx) => {
      if (idx >= 3) return;
      if (pref && prefBoostMap[pref] !== undefined && prefBoostMap[pref] !== null) {
        const checkFn = prefBoostMap[pref];
        if (checkFn && checkFn(career)) {
          prefBonus += prefWeights[idx];
          prefDescs.push(`契合"${pref}"偏好(${prefWeights[idx]}分)`);
        }
      }
    });
    
    if (prefDescs.length > 0) {
      prefDesc = prefDescs.join('，');
    }

    // ===== 计算最终分数（cap在100以内） =====
    let finalScore = matchScore + anchorBonus - eduPenalty + prefBonus;
    if (finalScore > 100) finalScore = 100;
    if (finalScore < 0) finalScore = 0;

    // ===== 生成匹配原因 =====
    const reasons = [];
    reasons.push(`${layer1Desc}(${matchScore}分)`);
    if (anchorDesc) reasons.push(anchorDesc);
    if (prefDesc) reasons.push(prefDesc);
    if (eduDesc) reasons.push(eduDesc);
    const matchReason = reasons.join('，');

    return { ...career, matchScore: finalScore, matchReason };
  }).filter(c => c.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);

  renderResults(top3, code3, scores, top2Anchors, matches);

  if (typeof renderCorrelationInsights === 'function') {
    renderCorrelationInsights();
  }

  // 保存匹配结果到全局，供技能差距分析模块使用
  window._careerMatches = matches;

  // 构建累积画像
  if (typeof buildCumulativeProfile === 'function') {
    buildCumulativeProfile();
  }

  // 保存测评结果到后端（如果可用）
  if (typeof API !== 'undefined' && API.available) {
    API.saveAssessment({
      sessionId: API.sessionId,
      name: assessmentData.name || '',
      education: assessmentData.education || '',
      experience: assessmentData.experience || '',
      status: assessmentData.status || '',
      preferences: assessmentData.preferences || [],
      riasecScores: scores,
      top3: top3,
      code3: code3,
      topAnchors: top2Anchors,
      matches: matches.map(function(c) { return { name: c.name, matchScore: c.matchScore }; })
    });
  }

  navigateTo('result');
}
