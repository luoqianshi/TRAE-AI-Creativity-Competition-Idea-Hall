// ========== 累积画像引擎 ==========

const PROFILE_LEVELS = {
  L1: { label: '基础画像', color: '#4E46DC', desc: '基于职业兴趣测评，了解你"喜欢做什么"' },
  L2: { label: '标准画像', color: '#0DB8A8', desc: '兴趣 + 价值观双维度，了解你"喜欢什么"且"看重什么"' },
  L3: { label: '深度画像', color: '#E8990A', desc: '增加人格特质维度，了解你的性格优势和工作风格' },
  L4: { label: '完整画像', color: '#DC5078', desc: '多维度综合分析，AI 报告精度最高，推荐最精准' }
};

function buildCumulativeProfile(assessmentHistory = null) {
  if (!assessmentHistory) {
    assessmentHistory = loadAssessmentHistory();
  }

  const profile = {
    level: 'L1',
    completedAssessments: [],
    dimensions: {},
    insights: [],
    aiPromptLevel: 1
  };

  if (assessmentHistory.riasec) {
    profile.completedAssessments.push('riasec');
    profile.dimensions.interest = {
      type: 'riasec',
      scores: assessmentHistory.riasec,
      topCodes: getTopRIASECCodes(assessmentHistory.riasec),
      summary: generateInterestSummary(assessmentHistory.riasec)
    };
    profile.level = 'L1';
    profile.aiPromptLevel = 1;
  }

  if (assessmentHistory.anchor) {
    profile.completedAssessments.push('anchor');
    profile.dimensions.values = {
      type: 'anchor',
      scores: assessmentHistory.anchor,
      topAnchors: getTopAnchors(assessmentHistory.anchor),
      summary: generateValuesSummary(assessmentHistory.anchor)
    };
    profile.level = 'L2';
    profile.aiPromptLevel = 2;
  }

  if (assessmentHistory.big5) {
    profile.completedAssessments.push('big5');
    profile.dimensions.personality = {
      type: 'big5',
      scores: assessmentHistory.big5,
      summary: generatePersonalitySummary(assessmentHistory.big5)
    };
    profile.level = 'L3';
    profile.aiPromptLevel = 3;
  }

  if (assessmentHistory.disc || assessmentHistory.gallup) {
    profile.completedAssessments.push(assessmentHistory.disc ? 'disc' : 'gallup');
    profile.level = 'L4';
    profile.aiPromptLevel = 4;
  }

  profile.insights = generateProfileInsights(profile);

  saveProfile(profile);

  return profile;
}

function getTopRIASECCodes(scores) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(e => e[0]);
}

function getTopAnchors(answers) {
  const anchorCounts = {};
  answers.forEach((isA, i) => {
    const anchor = isA ? anchorMapping[i] : anchorMappingB[i];
    anchorCounts[anchor] = (anchorCounts[anchor] || 0) + 1;
  });
  return Object.entries(anchorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(e => e[0]);
}

function generateInterestSummary(scores) {
  const typeLabels = { R: '实用型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型' };
  const top3 = getTopRIASECCodes(scores);
  return `你的职业兴趣类型为${top3.map(l => l + typeLabels[l]).join('、')}，${getInterestDescription(top3)}`;
}

function getInterestDescription(codes) {
  const descriptions = {
    R: '擅长动手操作和解决实际问题',
    I: '喜欢探索知识和分析研究',
    A: '富有创造力和艺术表达欲',
    S: '乐于帮助他人和与人交往',
    E: '具有领导才能和创业精神',
    C: '注重秩序和规范化流程'
  };
  return codes.map(c => descriptions[c]).join('，');
}

function generateValuesSummary(answers) {
  const topAnchors = getTopAnchors(answers);
  const anchorDescriptions = {
    '技术职能型': '追求技术专精和职业成长',
    '技术研究型': '热爱钻研和创新突破',
    '管理型': '追求影响力和团队领导',
    '企业竞争型': '渴望在竞争中获得成就',
    '自主独立型': '重视工作自主权和独立性',
    '生活方式型': '追求工作与生活的平衡',
    '安全稳定型': '看重职业稳定性和安全感',
    '稳定深耕型': '倾向在熟悉领域持续发展',
    '创业创造型': '勇于尝试和创造新事物',
    '服务奉献型': '乐于帮助他人和回馈社会',
    '追求成就型': '渴望通过努力获得认可',
    '纯粹挑战型': '享受克服困难的过程',
    '独立创作型': '追求艺术创作和自我表达',
    '多元探索型': '喜欢尝试不同领域和可能性'
  };
  return `你的核心价值观倾向为${topAnchors.join('、')}，${topAnchors.map(a => anchorDescriptions[a]).join('，')}`;
}

function generatePersonalitySummary(scores) {
  if (!scores) return '';
  const traits = ['开放性', '尽责性', '外向性', '宜人性', '神经质'];
  const descriptions = [];
  traits.forEach(trait => {
    const score = scores[trait];
    if (score > 60) descriptions.push(`${trait}较高`);
    else if (score < 40) descriptions.push(`${trait}较低`);
  });
  return descriptions.length > 0 ? `人格特质：${descriptions.join('，')}` : '';
}

function generateProfileInsights(profile) {
  const insights = [];

  if (profile.dimensions.interest) {
    const topCode = profile.dimensions.interest.topCodes[0];
    const matchCareers = careerDB.filter(c => c.code.startsWith(topCode)).slice(0, 3);
    if (matchCareers.length > 0) {
      insights.push({
        type: 'career_match',
        title: '推荐职业方向',
        content: `基于你的兴趣类型，推荐${matchCareers.map(c => c.name).join('、')}等职业方向`
      });
    }
  }

  if (profile.dimensions.values) {
    const topAnchor = profile.dimensions.values.topAnchors[0];
    if (topAnchor === '安全稳定型' || topAnchor === '稳定深耕型') {
      insights.push({
        type: 'stability',
        title: '稳定性偏好',
        content: '你的价值观倾向稳定，建议优先考虑体制内、国企或成熟行业岗位'
      });
    } else if (topAnchor === '创业创造型' || topAnchor === '自主独立型') {
      insights.push({
        type: 'growth',
        title: '成长偏好',
        content: '你的价值观倾向创新和独立，建议关注互联网、创业公司等快速成长领域'
      });
    }
  }

  const remaining = getRemainingAssessments(profile.completedAssessments);
  if (remaining.length > 0) {
    insights.push({
      type: 'completion',
      title: '完善画像',
      content: `完成${remaining.slice(0, 2).join('、')}测评，可提升画像深度至${getNextLevel(profile.level)}`
    });
  }

  return insights;
}

function getRemainingAssessments(completed) {
  const all = ['大五人格', 'DISC', '盖洛普优势', '职业满意度', '能力成熟度'];
  const mapping = { riasec: '职业兴趣', anchor: '职业锚' };
  const completedNames = completed.map(c => mapping[c] || c);
  return all.filter(a => !completedNames.includes(a));
}

function getNextLevel(current) {
  const levels = ['L1', 'L2', 'L3', 'L4'];
  const idx = levels.indexOf(current);
  return idx < levels.length - 1 ? PROFILE_LEVELS[levels[idx + 1]].label : '完整';
}

function loadAssessmentHistory() {
  const progress = JSON.parse(localStorage.getItem('careerCompass_progress') || '{}');
  return {
    riasec: progress.riasecScores || null,
    anchor: progress.anchorAnswers || null,
    big5: progress.big5Scores || null,
    disc: progress.discScores || null,
    gallup: progress.gallupScores || null
  };
}

function saveProfile(profile) {
  localStorage.setItem('careerCompass_profile', JSON.stringify(profile));
}

function loadProfile() {
  return JSON.parse(localStorage.getItem('careerCompass_profile') || 'null') || null;
}

function getProfileLevelInfo(level) {
  return PROFILE_LEVELS[level] || PROFILE_LEVELS.L1;
}

function compareProfiles(oldProfile, newProfile) {
  if (!oldProfile || oldProfile.level === newProfile.level) return null;

  const changes = [];
  const oldLevel = PROFILE_LEVELS[oldProfile.level];
  const newLevel = PROFILE_LEVELS[newProfile.level];

  changes.push(`画像深度从${oldLevel.label}提升至${newLevel.label}`);

  if (newProfile.dimensions.values && !oldProfile.dimensions.values) {
    changes.push('新增职业价值观维度分析');
  }
  if (newProfile.dimensions.personality && !oldProfile.dimensions.personality) {
    changes.push('新增人格特质维度分析');
  }

  return changes;
}