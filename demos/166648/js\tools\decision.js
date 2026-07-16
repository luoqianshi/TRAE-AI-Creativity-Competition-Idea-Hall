// ========== 决策工具箱模块 ==========

// ========== 工具1：三圆交叉模型（增强版） ==========

// 示例关键词库
var VENN_EXAMPLES = {
  skill: ['编程', '数据分析', '写作', '设计', '演讲', '项目管理', '沟通协调', '逻辑思维', '外语', ' teaching', '摄影', '视频剪辑', '财务管理', '营销推广', '用户研究', '算法', '测试', '运营策划'],
  love: ['帮助他人', '创意设计', '自由', '解决问题', '持续学习', '团队合作', '影响他人', '打造产品', '分享知识', '探索未知', '美学追求', '社交互动', '独立思考', '被认可', '改变世界', '稳定生活'],
  money: ['人工智能', '新能源', '医疗健康', '教育科技', '金融科技', '跨境电商', '企业服务', '文娱消费', '智能制造', '碳中和', '生物科技', '元宇宙', 'SaaS', '直播电商', '银发经济', '宠物经济']
};

// 关键词同义词映射（用于智能匹配）
var SYNONYM_MAP = {
  '编程': ['写代码', '开发', '程序设计', 'coding'],
  '数据分析': ['数据处理', '数据挖掘', '统计分析'],
  '写作': ['文案', '内容创作', '写作表达'],
  '设计': ['UI设计', '视觉设计', '平面设计', '交互设计'],
  '演讲': ['表达', '演讲表达', '公众表达'],
  '项目管理': ['项目协调', '项目推进'],
  '沟通协调': ['沟通', '协调', '人际沟通'],
  '逻辑思维': ['分析思维', '逻辑分析'],
  '帮助他人': ['助人', '服务他人', '帮助人'],
  '创意设计': ['设计', '创意', '创新设计'],
  '解决问题': ['解决难题', '问题解决'],
  '持续学习': ['学习', '自我提升', '不断学习'],
  '团队合作': ['协作', '团队协作', '集体协作'],
  '影响他人': ['影响力', '感染他人'],
  '打造产品': ['做产品', '产品设计', '产品开发'],
  '分享知识': ['教学', '传授知识', '知识分享'],
  '人工智能': ['AI', '机器学习', '深度学习'],
  '新能源': ['清洁能源', '绿色能源'],
  '医疗健康': [' healthcare', '大健康', '生物医药'],
  '教育科技': ['EdTech', '在线教育', '教育'],
  '金融科技': ['FinTech', '金融', '科技金融'],
  '跨境电商': ['外贸', '国际电商', '跨境'],
  '企业服务': ['ToB', 'B端服务', '企业级服务'],
  '文娱消费': ['娱乐', '文化娱乐', '消费'],
  '智能制造': ['工业4.0', '制造业升级'],
  '生物科技': ['生物技术', '生物医药'],
  '直播电商': ['电商直播', '带货', '直播带货']
};

function findSynonyms(keyword) {
  var result = [keyword];
  for (var key in SYNONYM_MAP) {
    if (keyword.indexOf(key) !== -1 || key.indexOf(keyword) !== -1) {
      result = result.concat(SYNONYM_MAP[key]);
    }
    if (SYNONYM_MAP[key].indexOf(keyword) !== -1) {
      result = result.concat([key]);
      result = result.concat(SYNONYM_MAP[key]);
    }
  }
  return result.filter(function(v, i, self) { return self.indexOf(v) === i; });
}

function smartMatch(arr1, arr2) {
  var matches = [];
  arr1.forEach(function(item1) {
    var syns1 = findSynonyms(item1);
    arr2.forEach(function(item2) {
      var syns2 = findSynonyms(item2);
      var hasMatch = syns1.some(function(s1) {
        return syns2.some(function(s2) {
          return s1 === s2 || s1.indexOf(s2) !== -1 || s2.indexOf(s1) !== -1;
        });
      });
      if (hasMatch && matches.indexOf(item1) === -1) {
        matches.push(item1);
      }
    });
  });
  return matches;
}

function renderVennTool() {
  var container = document.getElementById('vennContent');
  container.innerHTML = '' +
    '<div class="venn-intro">' +
      '<p class="venn-desc">填写三个维度的关键词，找到你的理想职业方向。系统支持<b>同义词智能匹配</b>，即使表述不同也能发现交集。</p>' +
    '</div>' +
    '<div class="venn-inputs">' +
      '<div class="venn-input-group">' +
        '<label class="venn-label venn-label-skill"><span class="venn-dot venn-dot-purple"></span>擅长什么</label>' +
        '<textarea class="venn-textarea" id="vennSkill" placeholder="每行一个关键词，例如：&#10;编程&#10;数据分析&#10;写作" rows="4"></textarea>' +
        '<div class="venn-example-tags">' +
          '<span class="venn-example-label">点击添加：</span>' +
          VENN_EXAMPLES.skill.slice(0, 6).map(function(k) {
            return '<button class="venn-example-tag" onclick="addVennExample(\'vennSkill\', \'' + escapeHTML(k).replace(/'/g, "\\'") + '\')">' + escapeHTML(k) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="venn-input-group">' +
        '<label class="venn-label venn-label-love"><span class="venn-dot venn-dot-teal"></span>喜欢/追求什么</label>' +
        '<textarea class="venn-textarea" id="vennLove" placeholder="每行一个关键词，例如：&#10;帮助他人&#10;创意设计&#10;自由" rows="4"></textarea>' +
        '<div class="venn-example-tags">' +
          '<span class="venn-example-label">点击添加：</span>' +
          VENN_EXAMPLES.love.slice(0, 6).map(function(k) {
            return '<button class="venn-example-tag" onclick="addVennExample(\'vennLove\', \'' + escapeHTML(k).replace(/'/g, "\\'") + '\')">' + escapeHTML(k) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="venn-input-group">' +
        '<label class="venn-label venn-label-money"><span class="venn-dot venn-dot-orange"></span>什么能赚钱/有前景</label>' +
        '<textarea class="venn-textarea" id="vennMoney" placeholder="每行一个关键词，例如：&#10;人工智能&#10;新能源&#10;医疗健康" rows="4"></textarea>' +
        '<div class="venn-example-tags">' +
          '<span class="venn-example-label">点击添加：</span>' +
          VENN_EXAMPLES.money.slice(0, 6).map(function(k) {
            return '<button class="venn-example-tag" onclick="addVennExample(\'vennMoney\', \'' + escapeHTML(k).replace(/'/g, "\\'") + '\')">' + escapeHTML(k) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="text-center" style="margin-top:24px;">' +
      '<button class="btn-primary-v5" onclick="generateVennAnalysis()">生成交集分析 →</button>' +
      '<button class="btn-secondary-v5" onclick="fillVennExample()" style="margin-left:12px;">填充示例</button>' +
    '</div>' +
    '<div id="vennResult" style="display:none;"></div>';
}

function addVennExample(textareaId, keyword) {
  var textarea = document.getElementById(textareaId);
  if (!textarea) return;
  var current = textarea.value.trim();
  if (current && current.indexOf(keyword) === -1) {
    textarea.value = current + '\n' + keyword;
  } else if (!current) {
    textarea.value = keyword;
  }
}

function fillVennExample() {
  document.getElementById('vennSkill').value = '编程\n数据分析\n逻辑思维';
  document.getElementById('vennLove').value = '解决问题\n持续学习\n打造产品';
  document.getElementById('vennMoney').value = '人工智能\n教育科技\n企业服务';
}

function generateVennAnalysis() {
  var skillText = document.getElementById('vennSkill').value.trim();
  var loveText = document.getElementById('vennLove').value.trim();
  var moneyText = document.getElementById('vennMoney').value.trim();

  if (!skillText && !loveText && !moneyText) {
    alert('请至少填写一个维度的内容');
    return;
  }

  var skills = skillText ? skillText.split('\n').map(function(s) { return s.trim(); }).filter(Boolean) : [];
  var loves = loveText ? loveText.split('\n').map(function(s) { return s.trim(); }).filter(Boolean) : [];
  var moneys = moneyText ? moneyText.split('\n').map(function(s) { return s.trim(); }).filter(Boolean) : [];

  // 提示填写建议
  var emptyCount = [skills, loves, moneys].filter(function(arr) { return arr.length === 0; }).length;
  if (emptyCount >= 2) {
    alert('建议至少填写两个维度，才能产生有意义的交集分析。可以尝试点击"填充示例"快速体验。');
    return;
  }

  var resultDiv = document.getElementById('vennResult');
  resultDiv.style.display = 'block';

  // 构建韦恩图
  var vennHTML = '<div class="venn-result-container">' +
    '<h3 class="venn-result-title">三圆交叉分析</h3>' +
    '<div class="venn-diagram">' +
      '<div class="venn-container">' +
        '<div class="venn-circle venn-circle-skill"></div>' +
        '<div class="venn-circle venn-circle-love"></div>' +
        '<div class="venn-circle venn-circle-money"></div>' +
        '<div class="venn-labels">' +
          '<div class="venn-circle-label venn-label-pos-skill">擅长（' + skills.length + '）</div>' +
          '<div class="venn-circle-label venn-label-pos-love">喜欢（' + loves.length + '）</div>' +
          '<div class="venn-circle-label venn-label-pos-money">赚钱（' + moneys.length + '）</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  // 分析交集 - 使用智能匹配
  var analysisHTML = '<div class="venn-analysis">';

  // 三圆交集
  var triple = findIntersection(skills, loves, moneys);
  var tripleSmart = smartMatch(smartMatch(skills, loves), moneys);
  var tripleAll = triple.concat(tripleSmart.filter(function(t) { return triple.indexOf(t) === -1; }));
  if (tripleAll.length > 0) {
    analysisHTML += '<div class="venn-analysis-item venn-analysis-triple">' +
      '<div class="venn-analysis-badge">三圆交集</div>' +
      '<div class="venn-analysis-title">理想职业方向</div>' +
      '<div class="venn-analysis-desc">同时满足"擅长 + 喜欢 + 能赚钱"的方向，这是你最值得投入的理想领域。</div>' +
      '<div class="venn-tags">' + tripleAll.map(function(t) { return '<span class="venn-tag venn-tag-triple">' + escapeHTML(t) + '</span>'; }).join('') + '</div>' +
    '</div>';
  }

  // 两圆交集：擅长 + 喜欢（智能匹配）
  var skillLove = smartMatch(skills, loves).filter(function(t) { return tripleAll.indexOf(t) === -1; });
  if (skillLove.length > 0) {
    analysisHTML += '<div class="venn-analysis-item venn-analysis-double">' +
      '<div class="venn-analysis-badge">擅长 + 喜欢</div>' +
      '<div class="venn-analysis-title">热爱且有能力</div>' +
      '<div class="venn-analysis-desc">你既擅长又喜欢，如果能找到变现路径，也是极佳方向。</div>' +
      '<div class="venn-tags">' + skillLove.map(function(t) { return '<span class="venn-tag venn-tag-double">' + escapeHTML(t) + '</span>'; }).join('') + '</div>' +
    '</div>';
  }

  // 两圆交集：擅长 + 赚钱
  var skillMoney = smartMatch(skills, moneys).filter(function(t) { return tripleAll.indexOf(t) === -1; });
  if (skillMoney.length > 0) {
    analysisHTML += '<div class="venn-analysis-item venn-analysis-double">' +
      '<div class="venn-analysis-badge">擅长 + 赚钱</div>' +
      '<div class="venn-analysis-title">能力变现</div>' +
      '<div class="venn-analysis-desc">你有能力且市场有需求，即使不是最爱，也值得认真考虑。</div>' +
      '<div class="venn-tags">' + skillMoney.map(function(t) { return '<span class="venn-tag venn-tag-double">' + escapeHTML(t) + '</span>'; }).join('') + '</div>' +
    '</div>';
  }

  // 两圆交集：喜欢 + 赚钱
  var loveMoney = smartMatch(loves, moneys).filter(function(t) { return tripleAll.indexOf(t) === -1; });
  if (loveMoney.length > 0) {
    analysisHTML += '<div class="venn-analysis-item venn-analysis-double">' +
      '<div class="venn-analysis-badge">喜欢 + 赚钱</div>' +
      '<div class="venn-analysis-title">兴趣变现</div>' +
      '<div class="venn-analysis-desc">你喜欢且有市场前景，如果能提升相关技能，潜力巨大。</div>' +
      '<div class="venn-tags">' + loveMoney.map(function(t) { return '<span class="venn-tag venn-tag-double">' + escapeHTML(t) + '</span>'; }).join('') + '</div>' +
    '</div>';
  }

  // 单圆独有
  var onlySkill = skills.filter(function(t) { return loves.indexOf(t) === -1 && moneys.indexOf(t) === -1 && skillLove.indexOf(t) === -1 && skillMoney.indexOf(t) === -1; });
  var onlyLove = loves.filter(function(t) { return skills.indexOf(t) === -1 && moneys.indexOf(t) === -1 && skillLove.indexOf(t) === -1 && loveMoney.indexOf(t) === -1; });
  var onlyMoney = moneys.filter(function(t) { return skills.indexOf(t) === -1 && loves.indexOf(t) === -1 && skillMoney.indexOf(t) === -1 && loveMoney.indexOf(t) === -1; });

  if (onlySkill.length > 0 || onlyLove.length > 0 || onlyMoney.length > 0) {
    analysisHTML += '<div class="venn-analysis-item venn-analysis-single">' +
      '<div class="venn-analysis-badge">独有区域</div>' +
      '<div class="venn-analysis-title">可作为备选</div>' +
      '<div class="venn-analysis-desc">这些关键词目前只满足一个维度，作为补充参考。</div>';
    if (onlySkill.length > 0) {
      analysisHTML += '<div class="venn-single-group"><span class="venn-single-label">仅擅长：</span>' +
        onlySkill.map(function(t) { return '<span class="venn-tag venn-tag-single">' + escapeHTML(t) + '</span>'; }).join('') + '</div>';
    }
    if (onlyLove.length > 0) {
      analysisHTML += '<div class="venn-single-group"><span class="venn-single-label">仅喜欢：</span>' +
        onlyLove.map(function(t) { return '<span class="venn-tag venn-tag-single">' + escapeHTML(t) + '</span>'; }).join('') + '</div>';
    }
    if (onlyMoney.length > 0) {
      analysisHTML += '<div class="venn-single-group"><span class="venn-single-label">仅赚钱：</span>' +
        onlyMoney.map(function(t) { return '<span class="venn-tag venn-tag-single">' + escapeHTML(t) + '</span>'; }).join('') + '</div>';
    }
    analysisHTML += '</div>';
  }

  // 无交集时的引导建议
  if (tripleAll.length === 0 && skillLove.length === 0 && skillMoney.length === 0 && loveMoney.length === 0) {
    analysisHTML += '<div class="venn-analysis-item venn-analysis-single">' +
      '<div class="venn-analysis-title">暂无直接交集</div>' +
      '<div class="venn-analysis-desc">三个维度之间暂无明显交集。建议尝试：</div>' +
      '<div class="venn-suggestion-list">' +
        '<div class="venn-suggestion-item">• 填写更具体的关键词（如"编程"比"技术"更易匹配）</div>' +
        '<div class="venn-suggestion-item">• 思考连接不同维度的可能性（如"写作" + "教育科技" = 教育内容创作）</div>' +
        '<div class="venn-suggestion-item">• 参考示例关键词，拓展你的思路</div>' +
      '</div>' +
    '</div>';
  }

  // 智能职业方向建议（基于匹配度评分）
  var careerRecommendations = generateVennCareerAdvice(skills, loves, moneys, tripleAll, skillLove, skillMoney, loveMoney);
  analysisHTML += renderVennCareerAdvice(careerRecommendations);

  analysisHTML += '</div></div>';
  resultDiv.innerHTML = vennHTML + analysisHTML;

  // 保存决策快照
  if (typeof saveDecisionSnapshot !== 'undefined') {
    saveDecisionSnapshot('venn', {
      skills: skills,
      loves: loves,
      moneys: moneys,
      triple: tripleAll,
      careers: careerRecommendations
    });
  }

  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 职业方向库（用于三元交叉匹配度评分）
var CAREER_DIRECTIONS = [
  {
    name: '产品经理',
    icon: '📱',
    relatedSkills: ['编程', '数据分析', '项目管理', '沟通协调', '用户研究', '设计'],
    relatedLoves: ['打造产品', '解决问题', '影响他人', '团队合作'],
    relatedMoneys: ['人工智能', '教育科技', '金融科技', '企业服务', 'SaaS']
  },
  {
    name: '数据科学家',
    icon: '📊',
    relatedSkills: ['数据分析', '编程', '算法', '逻辑思维', '外语'],
    relatedLoves: ['解决问题', '持续学习', '探索未知', '独立思考'],
    relatedMoneys: ['人工智能', '金融科技', '医疗健康', '生物科技']
  },
  {
    name: 'UX设计师',
    icon: '🎨',
    relatedSkills: ['设计', '用户研究', '沟通协调', '创意设计'],
    relatedLoves: ['创意设计', '美学追求', '帮助他人', '打造产品'],
    relatedMoneys: ['文娱消费', '教育科技', '元宇宙', 'SaaS']
  },
  {
    name: '内容创作者',
    icon: '✍️',
    relatedSkills: ['写作', '摄影', '视频剪辑', '设计', '演讲'],
    relatedLoves: ['创意设计', '分享知识', '自由', '被认可'],
    relatedMoneys: ['直播电商', '文娱消费', '教育科技', '跨境电商']
  },
  {
    name: '技术专家',
    icon: '⚙️',
    relatedSkills: ['编程', '算法', '测试', '逻辑思维'],
    relatedLoves: ['解决问题', '持续学习', '独立思考', '探索未知'],
    relatedMoneys: ['人工智能', '智能制造', '企业服务', 'SaaS']
  },
  {
    name: '创业者',
    icon: '🚀',
    relatedSkills: ['项目管理', '营销推广', '演讲', '沟通协调', '财务管理'],
    relatedLoves: ['打造产品', '影响他人', '改变世界', '自由'],
    relatedMoneys: ['人工智能', '新能源', '跨境电商', '直播电商']
  },
  {
    name: '教育工作者',
    icon: '📚',
    relatedSkills: ['写作', '演讲', '沟通协调', '外语'],
    relatedLoves: ['帮助他人', '分享知识', '被认可', '团队合作'],
    relatedMoneys: ['教育科技', '银发经济', '医疗健康']
  },
  {
    name: '咨询顾问',
    icon: '💼',
    relatedSkills: ['逻辑思维', '演讲', '写作', '项目管理', '沟通协调'],
    relatedLoves: ['解决问题', '持续学习', '影响他人', '被认可'],
    relatedMoneys: ['企业服务', '金融科技', '人工智能']
  }
];

// 计算单个职业方向的匹配度评分（0-100）
// 权重：技能 40 + 兴趣 30 + 市场 30
function scoreCareerDirection(direction, skills, loves, moneys) {
  var skillMatch = smartMatch(skills, direction.relatedSkills).length;
  var loveMatch = smartMatch(loves, direction.relatedLoves).length;
  var moneyMatch = smartMatch(moneys, direction.relatedMoneys).length;

  var skillScore = Math.min(skillMatch / 2, 1) * 40;
  var loveScore = Math.min(loveMatch / 2, 1) * 30;
  var moneyScore = Math.min(moneyMatch / 2, 1) * 30;
  var totalScore = Math.round(skillScore + loveScore + moneyScore);

  var reasons = [];
  if (skillMatch > 0) reasons.push('技能匹配' + skillMatch + '项');
  if (loveMatch > 0) reasons.push('兴趣匹配' + loveMatch + '项');
  if (moneyMatch > 0) reasons.push('市场方向匹配' + moneyMatch + '项');

  return {
    name: direction.name,
    icon: direction.icon,
    score: totalScore,
    skillMatch: skillMatch,
    loveMatch: loveMatch,
    moneyMatch: moneyMatch,
    reasons: reasons
  };
}

// 三元交叉→职业方向匹配度评分
// 返回 Top 5 推荐方向数组（按评分降序）
function generateVennCareerAdvice(skills, loves, moneys, triple, skillLove, skillMoney, loveMoney) {
  var allInput = skills.concat(loves).concat(moneys);
  if (allInput.length < 2) return [];

  var recommendations = [];
  CAREER_DIRECTIONS.forEach(function(dir) {
    var rec = scoreCareerDirection(dir, skills, loves, moneys);
    // 最低门槛：总分≥30 才进入推荐列表
    if (rec.score >= 30) {
      recommendations.push(rec);
    }
  });

  recommendations.sort(function(a, b) {
    return b.score - a.score;
  });

  return recommendations.slice(0, 5);
}

// 渲染职业方向推荐 HTML（由 generateVennAnalysis 调用）
function renderVennCareerAdvice(recommendations) {
  if (!recommendations || recommendations.length === 0) return '';

  var html = '<div class="venn-career-advice">' +
    '<div class="venn-career-advice-title">💡 职业方向匹配度推荐</div>' +
    '<div class="venn-career-advice-desc">基于你输入的关键词，从8个核心方向中计算匹配度（技能40分 + 兴趣30分 + 市场30分）</div>' +
    '<div class="venn-career-list">';

  recommendations.forEach(function(rec, idx) {
    var scoreColor = rec.score >= 70 ? '#0DB8A8' : rec.score >= 50 ? '#E8990A' : '#DC5078';
    var scoreLabel = rec.score >= 70 ? '高匹配' : rec.score >= 50 ? '中匹配' : '低匹配';
    var rankBadge = idx === 0 ? '<span class="venn-career-rank venn-career-rank-top">🥇</span>' :
                    idx === 1 ? '<span class="venn-career-rank">🥈</span>' :
                    idx === 2 ? '<span class="venn-career-rank">🥉</span>' : '';

    html += '<div class="venn-career-item' + (idx === 0 ? ' venn-career-item-top' : '') + '">' +
      rankBadge +
      '<span class="venn-career-icon">' + rec.icon + '</span>' +
      '<div class="venn-career-info">' +
        '<div class="venn-career-name">' + escapeHTML(rec.name) + '</div>' +
        '<div class="venn-career-reasons">' + (rec.reasons.length > 0 ? rec.reasons.join(' · ') : '关键词覆盖较少，仅供参考') + '</div>' +
      '</div>' +
      '<div class="venn-career-score">' +
        '<div class="venn-career-score-num" style="color:' + scoreColor + '">' + rec.score + '</div>' +
        '<div class="venn-career-score-label" style="color:' + scoreColor + '">' + scoreLabel + '</div>' +
      '</div>' +
    '</div>';
  });

  html += '</div>';

  // 行动建议
  html += '<div class="venn-action-plan">' +
    '<div class="venn-action-title">下一步行动建议</div>' +
    '<div class="venn-action-steps">' +
      '<div class="venn-action-step"><span class="venn-step-num">1</span>选择1-2个最感兴趣的方向深入了解</div>' +
      '<div class="venn-action-step"><span class="venn-step-num">2</span>查看相关行业的招聘要求和发展路径</div>' +
      '<div class="venn-action-step"><span class="venn-step-num">3</span>找到从业者交流，了解真实工作状态</div>' +
      '<div class="venn-action-step"><span class="venn-step-num">4</span>制定3个月的技能提升计划并开始执行</div>' +
    '</div>' +
  '</div>';

  html += '</div>';
  return html;
}

function findIntersection(arr1, arr2, arr3) {
  var result = arr1.filter(function(item) { return arr2.indexOf(item) !== -1; });
  if (arr3) {
    result = result.filter(function(item) { return arr3.indexOf(item) !== -1; });
  }
  return result;
}

function escapeHTML(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ========== 工具2：决策平衡单（8维度增强版） ==========

// 八大评估维度
var BALANCE_DIMENSIONS = [
  { key: 'income',       label: '收入前景',   desc: '薪资水平、涨幅空间、长期收入潜力',     color: '#6B7C5C', defaultWeight: 4 },
  { key: 'growth',       label: '成长空间',   desc: '晋升通道、技能提升、职业天花板高度',   color: '#8A9B7A', defaultWeight: 4 },
  { key: 'interest',     label: '兴趣匹配',   desc: '工作内容是否让你有热情和投入感',       color: '#D4A574', defaultWeight: 5 },
  { key: 'stability',    label: '工作稳定',   desc: '行业前景、裁员风险、职业周期长度',     color: '#7A9CC6', defaultWeight: 3 },
  { key: 'worklife',     label: '工作生活',   desc: '加班程度、通勤时间、自由支配时间',     color: '#C6A4D4', defaultWeight: 3 },
  { key: 'social',       label: '社会价值',   desc: '社会贡献、他人认可、行业影响力',       color: '#DC5078', defaultWeight: 3 },
  { key: 'skillfit',     label: '能力匹配',   desc: '现有技能匹配度、学习门槛、转型难度',   color: '#0DB8A8', defaultWeight: 4 },
  { key: 'environment',  label: '工作环境',   desc: '团队氛围、管理风格、企业文化适配',     color: '#E8990A', defaultWeight: 3 }
];

// 常见职业预设评分参考
var CAREER_PRESETS = {
  '产品经理':     { income: 8, growth: 7, interest: 7, stability: 6, worklife: 4, social: 6, skillfit: 6, environment: 6 },
  '前端开发':     { income: 8, growth: 8, interest: 7, stability: 6, worklife: 5, social: 5, skillfit: 7, environment: 6 },
  '后端开发':     { income: 8, growth: 8, interest: 6, stability: 6, worklife: 5, social: 5, skillfit: 7, environment: 6 },
  'UI设计师':     { income: 6, growth: 6, interest: 8, stability: 5, worklife: 5, social: 6, skillfit: 7, environment: 7 },
  '数据分析师':   { income: 7, growth: 8, interest: 7, stability: 7, worklife: 6, social: 6, skillfit: 6, environment: 6 },
  '运营专员':     { income: 5, growth: 6, interest: 6, stability: 5, worklife: 4, social: 7, skillfit: 6, environment: 5 },
  '市场营销':     { income: 6, growth: 7, interest: 6, stability: 5, worklife: 4, social: 7, skillfit: 5, environment: 5 },
  '项目管理':     { income: 7, growth: 7, interest: 6, stability: 7, worklife: 5, social: 6, skillfit: 6, environment: 6 },
  '人力资源':     { income: 5, growth: 5, interest: 5, stability: 7, worklife: 6, social: 7, skillfit: 5, environment: 6 },
  '财务会计':     { income: 5, growth: 4, interest: 4, stability: 8, worklife: 6, social: 5, skillfit: 6, environment: 5 },
  '教师':         { income: 4, growth: 5, interest: 7, stability: 8, worklife: 6, social: 8, skillfit: 6, environment: 6 },
  '公务员':       { income: 4, growth: 4, interest: 4, stability: 9, worklife: 7, social: 7, skillfit: 5, environment: 5 },
  '医生':         { income: 7, growth: 7, interest: 7, stability: 8, worklife: 2, social: 9, skillfit: 6, environment: 5 },
  '律师':         { income: 8, growth: 7, interest: 6, stability: 6, worklife: 3, social: 7, skillfit: 5, environment: 5 },
  '销售经理':     { income: 7, growth: 7, interest: 5, stability: 5, worklife: 3, social: 6, skillfit: 5, environment: 5 },
  '创业者':       { income: 3, growth: 9, interest: 8, stability: 2, worklife: 2, social: 6, skillfit: 5, environment: 4 },
  '自由职业':     { income: 4, growth: 6, interest: 8, stability: 3, worklife: 8, social: 5, skillfit: 6, environment: 7 },
  '算法工程师':   { income: 9, growth: 9, interest: 7, stability: 6, worklife: 4, social: 5, skillfit: 7, environment: 6 },
  '测试工程师':   { income: 6, growth: 5, interest: 5, stability: 6, worklife: 6, social: 5, skillfit: 6, environment: 6 },
  '运维工程师':   { income: 7, growth: 6, interest: 5, stability: 6, worklife: 4, social: 5, skillfit: 6, environment: 5 }
};

var balanceState = {
  careers: [],
  weights: {},
  scores: {},
  presetApplied: false
};

// 初始化权重
function initBalanceWeights() {
  BALANCE_DIMENSIONS.forEach(function(dim) {
    if (!balanceState.weights[dim.key]) {
      balanceState.weights[dim.key] = dim.defaultWeight;
    }
  });
}

function renderBalanceTool() {
  initBalanceWeights();
  var container = document.getElementById('balanceContent');
  container.innerHTML = '' +
    '<div class="balance-intro">' +
      '<p class="balance-desc">添加2-4个候选职业，从<b>8个维度</b>进行加权评分，做出更全面理性的选择。</p>' +
    '</div>' +
    '<div class="balance-career-input">' +
      '<label class="form-label">添加候选职业</label>' +
      '<div class="balance-add-row">' +
        '<input type="text" class="form-input" id="balanceCareerInput" placeholder="输入职业名称或选择下方推荐" maxlength="20" list="careerPresets">' +
        '<datalist id="careerPresets">' +
          Object.keys(CAREER_PRESETS).map(function(c) { return '<option value="' + escapeHTML(c) + '">'; }).join('') +
        '</datalist>' +
        '<button class="btn-secondary-v5" onclick="addBalanceCareer()" style="white-space:nowrap;">添加</button>' +
      '</div>' +
      '<div class="balance-preset-hint">常见职业：' +
        Object.keys(CAREER_PRESETS).slice(0, 8).map(function(c) {
          return '<button class="balance-preset-btn" onclick="quickAddCareer(\'' + escapeHTML(c).replace(/'/g, "\\'") + '\')">' + escapeHTML(c) + '</button>';
        }).join('') +
        '<button class="balance-preset-btn balance-preset-more" onclick="toggleAllPresets()">更多</button>' +
      '</div>' +
      '<div id="balanceAllPresets" style="display:none; margin-top:8px;">' +
        Object.keys(CAREER_PRESETS).slice(8).map(function(c) {
          return '<button class="balance-preset-btn" onclick="quickAddCareer(\'' + escapeHTML(c).replace(/'/g, "\\'") + '\')">' + escapeHTML(c) + '</button>';
        }).join('') +
      '</div>' +
      '<div id="balanceCareerTags" class="balance-career-tags"></div>' +
    '</div>' +
    '<div id="balanceWeightSection" style="display:none;">' +
      '<div class="balance-section-title">维度权重设置（1-5分）</div>' +
      '<p class="balance-section-hint">拖动滑块调整每个维度对你决策的重要性，5分为最重要</p>' +
      '<div class="balance-weights" id="balanceWeights"></div>' +
      '<div class="balance-weight-actions">' +
        '<button class="btn-secondary-v5 btn-sm" onclick="resetWeights()">重置默认</button>' +
        '<button class="btn-secondary-v5 btn-sm" onclick="setWeightPreset(\'balanced\')">均衡模式</button>' +
        '<button class="btn-secondary-v5 btn-sm" onclick="setWeightPreset(\'growth\')">成长优先</button>' +
        '<button class="btn-secondary-v5 btn-sm" onclick="setWeightPreset(\'stable\')">稳定优先</button>' +
      '</div>' +
    '</div>' +
    '<div id="balanceScoreSection" style="display:none;">' +
      '<div class="balance-section-title">维度评分（1-10分）</div>' +
      '<p class="balance-section-hint">为每个职业在每个维度打分。已为常见职业预填参考分数，可自行调整</p>' +
      '<div id="balanceScoreTable"></div>' +
      '<div class="text-center" style="margin-top:24px;">' +
        '<button class="btn-primary-v5" onclick="calculateBalanceResult()">计算结果 →</button>' +
      '</div>' +
    '</div>' +
    '<div id="balanceResult" style="display:none;"></div>';
}

function toggleAllPresets() {
  var div = document.getElementById('balanceAllPresets');
  if (div) div.style.display = div.style.display === 'none' ? 'block' : 'none';
}

function quickAddCareer(name) {
  var input = document.getElementById('balanceCareerInput');
  if (input) input.value = name;
  addBalanceCareer();
}

function addBalanceCareer() {
  var input = document.getElementById('balanceCareerInput');
  var name = input.value.trim();
  if (!name) return;
  if (balanceState.careers.length >= 4) {
    alert('最多添加4个候选职业');
    return;
  }
  if (balanceState.careers.indexOf(name) !== -1) {
    alert('该职业已添加');
    return;
  }
  balanceState.careers.push(name);

  // 如果有预设分数，使用预设；否则默认5分
  var preset = CAREER_PRESETS[name];
  if (preset) {
    balanceState.scores[name] = {};
    BALANCE_DIMENSIONS.forEach(function(dim) {
      balanceState.scores[name][dim.key] = preset[dim.key] || 5;
    });
  } else {
    balanceState.scores[name] = {};
    BALANCE_DIMENSIONS.forEach(function(dim) {
      balanceState.scores[name][dim.key] = 5;
    });
  }

  input.value = '';
  updateBalanceUI();
}

function removeBalanceCareer(name) {
  balanceState.careers = balanceState.careers.filter(function(c) { return c !== name; });
  delete balanceState.scores[name];
  updateBalanceUI();
}

function updateBalanceUI() {
  var tagsDiv = document.getElementById('balanceCareerTags');
  if (tagsDiv) {
    tagsDiv.innerHTML = balanceState.careers.map(function(c) {
      var hasPreset = CAREER_PRESETS[c] ? ' balance-career-tag-preset' : '';
      return '<span class="balance-career-tag' + hasPreset + '">' + escapeHTML(c) +
        '<button class="balance-tag-remove" onclick="removeBalanceCareer(\'' + escapeHTML(c).replace(/'/g, "\\'") + '\')">&times;</button></span>';
    }).join('');
  }

  var weightSection = document.getElementById('balanceWeightSection');
  var scoreSection = document.getElementById('balanceScoreSection');
  var resultDiv = document.getElementById('balanceResult');

  if (balanceState.careers.length < 2) {
    if (weightSection) weightSection.style.display = 'none';
    if (scoreSection) scoreSection.style.display = 'none';
    if (resultDiv) resultDiv.style.display = 'none';
    return;
  }

  renderBalanceWeights();
  renderBalanceScores();

  if (weightSection) weightSection.style.display = 'block';
  if (scoreSection) scoreSection.style.display = 'block';
}

function renderBalanceWeights() {
  var weightsDiv = document.getElementById('balanceWeights');
  if (!weightsDiv) return;

  weightsDiv.innerHTML = BALANCE_DIMENSIONS.map(function(dim) {
    return '<div class="balance-weight-row">' +
      '<div class="balance-weight-info">' +
        '<span class="balance-weight-label" style="color:' + dim.color + '">' + dim.label + '</span>' +
        '<span class="balance-weight-desc">' + dim.desc + '</span>' +
      '</div>' +
      '<div class="balance-weight-slider">' +
        '<input type="range" min="1" max="5" value="' + balanceState.weights[dim.key] + '" ' +
          'oninput="updateWeight(\'' + dim.key + '\', this.value)" class="balance-range">' +
        '<span class="balance-weight-value" id="weightVal_' + dim.key + '">' + balanceState.weights[dim.key] + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

function updateWeight(key, value) {
  balanceState.weights[key] = parseInt(value);
  var el = document.getElementById('weightVal_' + key);
  if (el) el.textContent = value;
}

function setWeightPreset(preset) {
  if (preset === 'balanced') {
    BALANCE_DIMENSIONS.forEach(function(dim) { balanceState.weights[dim.key] = 3; });
  } else if (preset === 'growth') {
    balanceState.weights.growth = 5;
    balanceState.weights.interest = 5;
    balanceState.weights.skillfit = 4;
    balanceState.weights.income = 4;
    balanceState.weights.stability = 2;
    balanceState.weights.worklife = 2;
    balanceState.weights.social = 2;
    balanceState.weights.environment = 3;
  } else if (preset === 'stable') {
    balanceState.weights.stability = 5;
    balanceState.weights.income = 4;
    balanceState.weights.worklife = 4;
    balanceState.weights.environment = 3;
    balanceState.weights.skillfit = 4;
    balanceState.weights.growth = 3;
    balanceState.weights.interest = 3;
    balanceState.weights.social = 3;
  }
  renderBalanceWeights();
}

function resetWeights() {
  BALANCE_DIMENSIONS.forEach(function(dim) {
    balanceState.weights[dim.key] = dim.defaultWeight;
  });
  renderBalanceWeights();
}

function renderBalanceScores() {
  var tableDiv = document.getElementById('balanceScoreTable');
  if (!tableDiv) return;

  var html = '<div class="balance-table-wrapper"><table class="balance-table">' +
    '<thead><tr><th class="balance-th-dim">维度</th>';

  balanceState.careers.forEach(function(c) {
    html += '<th class="balance-th-career">' + escapeHTML(c) + '</th>';
  });
  html += '</tr></thead><tbody>';

  BALANCE_DIMENSIONS.forEach(function(dim) {
    html += '<tr>' +
      '<td class="balance-td-dim">' +
        '<span class="balance-dim-dot" style="background:' + dim.color + '"></span>' +
        '<span class="balance-dim-name">' + dim.label + '</span>' +
        '<span class="balance-dim-weight">×' + balanceState.weights[dim.key] + '</span>' +
      '</td>';
    balanceState.careers.forEach(function(c) {
      var score = balanceState.scores[c][dim.key];
      html += '<td class="balance-td-score">' +
        '<input type="range" min="1" max="10" value="' + score + '" ' +
          'oninput="updateBalanceScore(\'' + escapeHTML(c).replace(/'/g, "\\'") + '\', \'' + dim.key + '\', this.value)" ' +
          'class="balance-range balance-range-score">' +
        '<span class="balance-score-value" id="scoreVal_' + c + '_' + dim.key + '">' + score + '</span>' +
      '</td>';
    });
    html += '</tr>';
  });

  // 加权总分预览行
  html += '<tr class="balance-total-row"><td class="balance-td-total">加权总分</td>';
  balanceState.careers.forEach(function(c) {
    var total = 0;
    BALANCE_DIMENSIONS.forEach(function(dim) {
      total += balanceState.scores[c][dim.key] * balanceState.weights[dim.key];
    });
    html += '<td class="balance-td-total-val">' + total + '</td>';
  });
  html += '</tr>';

  html += '</tbody></table></div>';
  tableDiv.innerHTML = html;
}

function updateBalanceScore(career, dim, value) {
  balanceState.scores[career][dim] = parseInt(value);
  var el = document.getElementById('scoreVal_' + career + '_' + dim);
  if (el) el.textContent = value;

  // 更新总分
  var total = 0;
  BALANCE_DIMENSIONS.forEach(function(d) {
    total += balanceState.scores[career][d.key] * balanceState.weights[d.key];
  });
  var totalCell = document.querySelector('.balance-total-row td:nth-child(' + (balanceState.careers.indexOf(career) + 2) + ')');
  if (totalCell) totalCell.textContent = total;
}

function calculateBalanceResult() {
  if (balanceState.careers.length < 2) {
    alert('请至少添加2个候选职业');
    return;
  }

  var resultDiv = document.getElementById('balanceResult');
  resultDiv.style.display = 'block';

  // 计算加权总分
  var results = balanceState.careers.map(function(career) {
    var total = 0;
    var details = {};
    var rawScores = {};
    BALANCE_DIMENSIONS.forEach(function(dim) {
      var raw = balanceState.scores[career][dim.key];
      var weighted = raw * balanceState.weights[dim.key];
      total += weighted;
      details[dim.key] = weighted;
      rawScores[dim.key] = raw;
    });
    return { name: career, total: total, details: details, rawScores: rawScores };
  });

  results.sort(function(a, b) { return b.total - a.total; });
  var maxScore = results[0].total;
  var minScore = results[results.length - 1].total;
  var scoreGap = maxScore - minScore;

  var dimColorMap = {};
  var dimLabelMap = {};
  BALANCE_DIMENSIONS.forEach(function(dim) {
    dimColorMap[dim.key] = dim.color;
    dimLabelMap[dim.key] = dim.label;
  });

  var html = '<div class="balance-result-container">' +
    '<h3 class="balance-result-title">综合评分结果</h3>';

  // 排名列表
  html += '<div class="balance-ranking">';
  results.forEach(function(r, idx) {
    var rankClass = idx === 0 ? 'balance-rank-first' : '';
    var barWidth = maxScore > 0 ? (r.total / maxScore * 100) : 0;
    html += '<div class="balance-rank-item ' + rankClass + '">' +
      '<div class="balance-rank-header">' +
        '<span class="balance-rank-num">' + (idx + 1) + '</span>' +
        '<span class="balance-rank-name">' + escapeHTML(r.name) + '</span>' +
        '<span class="balance-rank-score">' + r.total + '<span class="balance-rank-unit">分</span></span>' +
      '</div>' +
      '<div class="balance-rank-bar-bg">' +
        '<div class="balance-rank-bar-fill" style="width:' + barWidth + '%;"></div>' +
      '</div>';

    // 维度明细 - 显示前4个得分最高的维度
    var sortedDims = Object.keys(r.details).sort(function(a, b) { return r.details[b] - r.details[a]; });
    html += '<div class="balance-rank-details">';
    sortedDims.slice(0, 4).forEach(function(dim) {
      html += '<div class="balance-rank-detail">' +
        '<span class="balance-detail-dot" style="background:' + dimColorMap[dim] + '"></span>' +
        '<span class="balance-detail-label">' + dimLabelMap[dim] + '</span>' +
        '<span class="balance-detail-value">' + r.details[dim] + '</span>' +
      '</div>';
    });
    html += '</div></div>';
  });
  html += '</div>';

  // 八维度雷达对比
  html += '<div class="balance-radar-title">八维度雷达对比</div>';
  html += '<div class="balance-radar-container">';
  html += '<canvas id="balanceRadarChart" width="400" height="400"></canvas>';
  html += '</div>';

  // 维度条形图对比
  html += '<div class="balance-chart-title">维度得分对比</div>';
  html += '<div class="balance-chart">';
  var careerColors = ['#6B7C5C', '#0DB8A8', '#E8990A', '#DC5078'];
  BALANCE_DIMENSIONS.forEach(function(dim) {
    html += '<div class="balance-chart-row">' +
      '<div class="balance-chart-label">' + dim.label + '</div>' +
      '<div class="balance-chart-bars">';
    balanceState.careers.forEach(function(career, cIdx) {
      var score = balanceState.scores[career][dim.key];
      var width = score / 10 * 100;
      html += '<div class="balance-chart-bar-group">' +
        '<div class="balance-chart-bar" style="width:' + width + '%; background:' + careerColors[cIdx % careerColors.length] + ';"></div>' +
        '<span class="balance-chart-bar-value">' + score + '</span>' +
      '</div>';
    });
    html += '</div></div>';
  });
  html += '</div>';

  // 优劣势分析
  html += '<div class="balance-analysis-title">优劣势分析</div>';
  html += '<div class="balance-analysis-grid">';
  results.forEach(function(r, idx) {
    var sortedDims = Object.keys(r.rawScores).sort(function(a, b) { return r.rawScores[b] - r.rawScores[a]; });
    var strengths = sortedDims.slice(0, 2);
    var weaknesses = sortedDims.slice(-2).reverse();

    html += '<div class="balance-analysis-card' + (idx === 0 ? ' balance-analysis-best' : '') + '">' +
      '<div class="balance-analysis-name">' + escapeHTML(r.name) + '</div>' +
      '<div class="balance-analysis-strength">' +
        '<span class="balance-analysis-label">优势维度</span>' +
        '<div class="balance-analysis-tags">';
    strengths.forEach(function(dim) {
      html += '<span class="balance-analysis-tag balance-analysis-tag-up" style="border-color:' + dimColorMap[dim] + '; color:' + dimColorMap[dim] + '">' +
        dimLabelMap[dim] + ' ' + r.rawScores[dim] + '</span>';
    });
    html += '</div></div>' +
      '<div class="balance-analysis-weakness">' +
        '<span class="balance-analysis-label">待提升维度</span>' +
        '<div class="balance-analysis-tags">';
    weaknesses.forEach(function(dim) {
      html += '<span class="balance-analysis-tag balance-analysis-tag-down" style="border-color:' + dimColorMap[dim] + '; color:' + dimColorMap[dim] + '">' +
        dimLabelMap[dim] + ' ' + r.rawScores[dim] + '</span>';
    });
    html += '</div></div></div>';
  });
  html += '</div>';

  // 智能建议
  var advice = generateBalanceAdvice(results, scoreGap);
  html += '<div class="balance-suggestion">' +
    '<div class="balance-suggestion-icon">&#128161;</div>' +
    '<div class="balance-suggestion-text">' + advice + '</div>' +
  '</div>';

  // 全局职业推荐排序（基于用户权重，从CAREER_PRESETS中筛选Top 5）
  html += renderCareerRanking(balanceState.weights);

  html += '</div>';
  resultDiv.innerHTML = html;

  // 绘制雷达图
  drawBalanceRadar(results);

  // 保存决策快照
  if (typeof saveDecisionSnapshot !== 'undefined') {
    var careerRanking = rankCareerRecommendations(balanceState.weights);
    saveDecisionSnapshot('balance', {
      careers: balanceState.careers.slice(),
      scores: JSON.parse(JSON.stringify(balanceState.scores)),
      weights: Object.assign({}, balanceState.weights),
      ranking: careerRanking,
      results: results
    });
  }

  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function generateBalanceAdvice(results, gap) {
  var best = results[0];
  var second = results[1];
  var advice = '';

  if (gap < 10) {
    advice += '<strong>' + escapeHTML(best.name) + '</strong>和<strong>' + escapeHTML(second.name) + '</strong>得分非常接近（差距仅' + gap + '分），建议关注两者在关键维度上的差异。';
  } else if (gap < 30) {
    advice += '<strong>' + escapeHTML(best.name) + '</strong>在综合评分中领先，但差距不算悬殊。建议结合个人直觉做最终判断。';
  } else {
    advice += '<strong>' + escapeHTML(best.name) + '</strong>在综合评分中显著领先（领先' + gap + '分），是较为明确的选择。';
  }

  // 分析最佳职业的短板
  var sortedDims = Object.keys(best.rawScores).sort(function(a, b) { return best.rawScores[a] - best.rawScores[b]; });
  var weakest = sortedDims[0];
  if (best.rawScores[weakest] <= 4) {
    var dimLabel = BALANCE_DIMENSIONS.find(function(d) { return d.key === weakest; }).label;
    advice += '需要注意的是，' + escapeHTML(best.name) + '在<b>' + dimLabel + '</b>维度得分较低（' + best.rawScores[weakest] + '分），这可能成为后续发展中的短板。';
  }

  return advice;
}

function drawBalanceRadar(results) {
  var canvas = document.getElementById('balanceRadarChart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var cx = canvas.width / 2;
  var cy = canvas.height / 2;
  var radius = 150;
  var n = BALANCE_DIMENSIONS.length;
  var colors = ['#6B7C5C', '#0DB8A8', '#E8990A', '#DC5078'];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制网格
  for (var level = 1; level <= 5; level++) {
    var r = radius * level / 5;
    ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var angle = -Math.PI / 2 + i * 2 * Math.PI / n;
      var x = cx + r * Math.cos(angle);
      var y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(107, 124, 92, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 绘制轴线
  for (var i = 0; i < n; i++) {
    var angle = -Math.PI / 2 + i * 2 * Math.PI / n;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    ctx.strokeStyle = 'rgba(107, 124, 92, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 绘制标签
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = '#6B6B6B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (var i = 0; i < n; i++) {
    var angle = -Math.PI / 2 + i * 2 * Math.PI / n;
    var labelR = radius + 25;
    var lx = cx + labelR * Math.cos(angle);
    var ly = cy + labelR * Math.sin(angle);
    ctx.fillText(BALANCE_DIMENSIONS[i].label, lx, ly);
  }

  // 绘制每个职业的数据
  results.forEach(function(r, idx) {
    var color = colors[idx % colors.length];
    ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var angle = -Math.PI / 2 + i * 2 * Math.PI / n;
      var value = r.rawScores[BALANCE_DIMENSIONS[i].key] / 10;
      var x = cx + radius * value * Math.cos(angle);
      var y = cy + radius * value * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color + '20';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制数据点
    for (var i = 0; i < n; i++) {
      var angle = -Math.PI / 2 + i * 2 * Math.PI / n;
      var value = r.rawScores[BALANCE_DIMENSIONS[i].key] / 10;
      var x = cx + radius * value * Math.cos(angle);
      var y = cy + radius * value * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  });

  // 图例
  ctx.font = '12px Inter, sans-serif';
  ctx.textAlign = 'left';
  results.forEach(function(r, idx) {
    var color = colors[idx % colors.length];
    var ly = 20 + idx * 20;
    ctx.fillStyle = color;
    ctx.fillRect(10, ly - 6, 12, 12);
    ctx.fillStyle = '#6B6B6B';
    ctx.fillText(r.name, 28, ly);
  });
}

// ========== 工具3：公司类型匹配 ==========

var companyTypes = {
  '国企/体制内': {
    features: ['稳定性极高', '流程规范', '晋升节奏慢', '福利完善', '工作生活平衡较好'],
    fitAnchors: ['安全稳定型', '稳定深耕型', '生活方式型'],
    unfitAnchors: ['创业创造型', '企业竞争型', '纯粹挑战型'],
    pros: ['稳定有保障', '社会认可度高', '福利体系完善'],
    cons: ['收入增长有限', '创新空间小', '晋升论资排辈'],
    icon: '&#127963;'
  },
  '大厂/外企': {
    features: ['收入竞争力强', '平台资源丰富', '工作强度大', '晋升通道清晰', '培训体系完善'],
    fitAnchors: ['追求成就型', '技术职能型', '管理型'],
    unfitAnchors: ['生活方式型', '自主独立型'],
    pros: ['收入高', '履历加分', '技术栈先进'],
    cons: ['加班文化', '内卷竞争', '35岁焦虑'],
    icon: '&#127970;'
  },
  '小公司/创业团队': {
    features: ['扁平化管理', '成长空间大', '风险较高', '一人多岗', '股权激励可能'],
    fitAnchors: ['创业创造型', '自主独立型', '纯粹挑战型'],
    unfitAnchors: ['安全稳定型', '稳定深耕型'],
    pros: ['成长快', '灵活度高', '可能获得股权回报'],
    cons: ['稳定性差', '收入波动大', '制度不完善'],
    icon: '&#128640;'
  },
  '自由职业/远程': {
    features: ['时间自由', '收入不稳定', '需要自律', '客户导向', '持续学习'],
    fitAnchors: ['自主独立型', '生活方式型', '独立创作型'],
    unfitAnchors: ['安全稳定型', '管理型'],
    pros: ['时间自由', '地点灵活', '自主选择项目'],
    cons: ['收入不稳定', '缺乏团队支持', '自我管理要求高'],
    icon: '&#127968;'
  }
};

function renderCompanyTool() {
  var container = document.getElementById('companyContent');
  var hasAnchorResult = assessmentData.anchorAnswers.length >= 8;
  var topAnchors = [];

  if (hasAnchorResult) {
    // 计算用户的职业锚
    var anchorCounts = {};
    assessmentData.anchorAnswers.forEach(function(isA, i) {
      var anchor = isA ? anchorMapping[i] : anchorMappingB[i];
      anchorCounts[anchor] = (anchorCounts[anchor] || 0) + 1;
    });
    var sorted = Object.entries(anchorCounts).sort(function(a, b) { return b[1] - a[1]; });
    topAnchors = sorted.slice(0, 2).map(function(e) { return e[0]; });
  }

  var html = '<div class="company-intro">';

  if (hasAnchorResult && topAnchors.length > 0) {
    html += '<div class="company-user-anchors">' +
      '<div class="company-anchors-label">你的职业锚：<strong>' + topAnchors.map(function(a) { return escapeHTML(a); }).join('、') + '</strong></div>' +
      '<div class="company-anchors-hint">已根据你的职业锚结果为你标注匹配度</div>' +
    '</div>';
  } else {
    html += '<div class="company-no-anchor">' +
      '<p>完成职业锚测评后，系统将自动为你标注匹配度。</p>' +
      '<p>当前展示所有公司类型的对比信息。</p>' +
      '<button class="btn-secondary" onclick="navigateTo(\'assessment\')" style="margin-top:12px;">前往测评</button>' +
    '</div>';
  }

  html += '</div>';

  // 公司类型卡片网格
  html += '<div class="company-grid">';

  Object.keys(companyTypes).forEach(function(typeName) {
    var type = companyTypes[typeName];
    var matchPercent = 0;
    var matchLevel = '';
    var matchClass = '';

    if (hasAnchorResult && topAnchors.length > 0) {
      var fitCount = 0;
      topAnchors.forEach(function(anchor) {
        if (type.fitAnchors.indexOf(anchor) !== -1) fitCount++;
      });
      var unfitCount = 0;
      topAnchors.forEach(function(anchor) {
        if (type.unfitAnchors.indexOf(anchor) !== -1) unfitCount++;
      });

      if (fitCount > 0 && unfitCount === 0) {
        matchPercent = Math.min(95, 60 + fitCount * 20);
        matchLevel = '高度匹配';
        matchClass = 'company-match-high';
      } else if (fitCount > 0) {
        matchPercent = 70;
        matchLevel = '较为匹配';
        matchClass = 'company-match-mid';
      } else if (unfitCount > 0) {
        matchPercent = Math.max(20, 40 - unfitCount * 15);
        matchLevel = '匹配度低';
        matchClass = 'company-match-low';
      } else {
        matchPercent = 50;
        matchLevel = '一般';
        matchClass = 'company-match-neutral';
      }
    }

    html += '<div class="company-card ' + matchClass + '">' +
      '<div class="company-card-header">' +
        '<div class="company-card-icon">' + type.icon + '</div>' +
        '<div class="company-card-title">' + escapeHTML(typeName) + '</div>';

    if (hasAnchorResult && topAnchors.length > 0) {
      html += '<div class="company-match-badge ' + matchClass + '">' +
        '<span class="company-match-percent">' + matchPercent + '%</span>' +
        '<span class="company-match-level">' + matchLevel + '</span>' +
      '</div>';
    }

    html += '</div>';

    // 特征标签
    html += '<div class="company-features">' +
      type.features.map(function(f) { return '<span class="company-feature-tag">' + escapeHTML(f) + '</span>'; }).join('') +
    '</div>';

    // 适合/不适合的职业锚
    html += '<div class="company-anchor-info">' +
      '<div class="company-anchor-fit">' +
        '<span class="company-anchor-label company-anchor-label-fit">适合</span>' +
        '<span class="company-anchor-names">' + type.fitAnchors.map(function(a) { return escapeHTML(a); }).join('、') + '</span>' +
      '</div>' +
      '<div class="company-anchor-unfit">' +
        '<span class="company-anchor-label company-anchor-label-unfit">不适合</span>' +
        '<span class="company-anchor-names">' + type.unfitAnchors.map(function(a) { return escapeHTML(a); }).join('、') + '</span>' +
      '</div>' +
    '</div>';

    // 优缺点
    html += '<div class="company-pros-cons">' +
      '<div class="company-pros">' +
        '<div class="company-pros-label">优势</div>' +
        '<ul class="company-list">' + type.pros.map(function(p) { return '<li>' + escapeHTML(p) + '</li>'; }).join('') + '</ul>' +
      '</div>' +
      '<div class="company-cons">' +
        '<div class="company-cons-label">劣势</div>' +
        '<ul class="company-list">' + type.cons.map(function(c) { return '<li>' + escapeHTML(c) + '</li>'; }).join('') + '</ul>' +
      '</div>' +
    '</div>';

    html += '</div>';
  });

  html += '</div>';

  // 对比表格
  html += '<div class="company-compare-section">' +
    '<h3 class="company-compare-title">公司类型对比一览</h3>' +
    '<div class="company-compare-table-wrapper">' +
    '<table class="company-compare-table">' +
    '<thead><tr><th class="company-compare-th">维度</th>';

  Object.keys(companyTypes).forEach(function(name) {
    html += '<th class="company-compare-th">' + escapeHTML(name) + '</th>';
  });

  html += '</tr></thead><tbody>';

  var compareDims = ['稳定性', '收入水平', '成长空间', '工作强度', '创新自由'];
  var compareData = {
    '稳定性':    ['极高', '中等', '较低', '低'],
    '收入水平':  ['中等', '高', '波动大', '波动大'],
    '成长空间':  ['有限', '大', '很大', '自主决定'],
    '工作强度':  ['适中', '高', '较高', '自我驱动'],
    '创新自由':  ['低', '中等', '高', '极高']
  };

  compareDims.forEach(function(dim) {
    html += '<tr><td class="company-compare-td-dim">' + dim + '</td>';
    compareData[dim].forEach(function(val) {
      html += '<td class="company-compare-td">' + escapeHTML(val) + '</td>';
    });
    html += '</tr>';
  });

  html += '</tbody></table></div></div>';

  container.innerHTML = html;
}

// ========== 工具切换逻辑 ==========

function switchDecisionTool(tool) {
  // 切换标签
  document.querySelectorAll('.decision-tab').forEach(function(tab) {
    tab.classList.remove('active');
  });
  event.target.classList.add('active');

  // 切换内容
  document.querySelectorAll('.decision-tool').forEach(function(el) {
    el.classList.remove('active');
    el.style.display = 'none';
  });

  // 隐藏历史面板
  var historyContent = document.getElementById('decisionHistoryContent');
  if (historyContent) historyContent.style.display = 'none';

  if (tool === 'history') {
    if (historyContent) {
      historyContent.style.display = 'block';
      if (typeof renderDecisionHistory !== 'undefined') renderDecisionHistory();
    }
    return;
  }

  var targetId = 'tool-' + tool;
  var target = document.getElementById(targetId);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }

  // 按需渲染
  if (tool === 'venn' && !document.getElementById('vennContent').innerHTML) {
    renderVennTool();
  } else if (tool === 'balance' && !document.getElementById('balanceContent').innerHTML) {
    renderBalanceTool();
  } else if (tool === 'company') {
    renderCompanyTool();
  }
}

// ========== 初始化 ==========

function initDecisionTools() {
  renderVennTool();
  renderBalanceTool();
  renderCompanyTool();
}

// ========== 决策平衡单→全局职业推荐排序（Task 2） ==========
// 基于用户设置的权重，从 CAREER_PRESETS 中所有职业计算加权得分，排序展示 Top 5
// 与用户手动添加的候选职业互补：即使用户只添加2个，也能看到全局最优解

function rankCareerRecommendations(weights) {
  var ranked = [];

  Object.keys(CAREER_PRESETS).forEach(function(careerName) {
    var preset = CAREER_PRESETS[careerName];
    var totalScore = 0;
    var maxPossible = 0;

    BALANCE_DIMENSIONS.forEach(function(dim) {
      var w = weights[dim.key] || dim.defaultWeight;
      var score = preset[dim.key] || 3; // 缺失维度默认3分
      totalScore += w * score;
      maxPossible += w * 10; // 满分10分
    });

    var percent = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
    ranked.push({
      name: careerName,
      totalScore: Math.round(totalScore * 10) / 10,
      percent: percent,
      preset: preset
    });
  });

  ranked.sort(function(a, b) {
    return b.totalScore - a.totalScore;
  });

  return ranked.slice(0, 5); // 返回Top 5
}

function renderCareerRanking(weights) {
  var ranking = rankCareerRecommendations(weights);
  if (ranking.length === 0) return '';

  var html = '<div class="career-ranking-section">';
  html += '<div class="career-ranking-header">';
  html += '<h3 class="career-ranking-title">&#127942; 基于你的权重，全局推荐Top 5</h3>';
  html += '<p class="career-ranking-desc">从20个常见职业中，按你设置的权重计算出的最优方向（与上方候选职业互补参考）</p>';
  html += '</div>';
  html += '<div class="career-ranking-list">';

  ranking.forEach(function(item, idx) {
    var medal = idx === 0 ? '&#129351;' : idx === 1 ? '&#129352;' : idx === 2 ? '&#129353;' : (idx + 1);
    var percentColor = item.percent >= 80 ? '#0DB8A8' : item.percent >= 65 ? '#E8990A' : '#DC5078';

    html += '<div class="career-ranking-item' + (idx === 0 ? ' career-ranking-top' : '') + '">';
    html += '<div class="career-ranking-medal">' + medal + '</div>';
    html += '<div class="career-ranking-info">';
    html += '<div class="career-ranking-name">' + escapeHTML(item.name) + '</div>';
    html += '<div class="career-ranking-bar">';
    html += '<div class="career-ranking-bar-fill" style="width:' + item.percent + '%;background:' + percentColor + '"></div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="career-ranking-score" style="color:' + percentColor + '">' + item.percent + '%</div>';
    html += '</div>';
  });

  html += '</div>';
  html += '<div class="career-ranking-hint">&#128161; 点击"添加候选"可将推荐职业加入上方平衡单做详细对比</div>';
  html += '</div>';

  return html;
}
