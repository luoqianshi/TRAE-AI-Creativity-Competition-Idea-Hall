// ========== 结果页面渲染 ==========
function renderResults(top3, code3, scores, topAnchors, matches) {
  drawRadarChart(scores);

  renderResultProfileCard(top3, topAnchors, scores);

  // M4: 填充结果摘要
  const typeLabels = { R: '实用型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型' };
  const topMatch = matches.length > 0 ? matches[0] : null;
  const summaryEl = document.getElementById('resultSummaryText');
  if (summaryEl && topMatch) {
    summaryEl.textContent = '你的兴趣类型为 ' + top3.map(l => l + ' ' + (typeLabels[l] || '')).join('、') +
      '，职业锚倾向为' + topAnchors.join('、') +
      '。最匹配的职业方向是「' + topMatch.name + '」（匹配度 ' + topMatch.matchScore + '%），共为你推荐了 ' + matches.length + ' 个职业方向。';
  }

  document.getElementById('codeLetters').innerHTML = top3.map(l => `<div class="code-letter">${l}</div>`).join('');
  const desc = codeDescriptions[code3] || codeDescriptions['default'] || '你的兴趣类型独特，建议结合多个方向探索最适合的职业路径';
  document.getElementById('codeDesc').textContent = desc;

  document.getElementById('anchorResult').innerHTML = topAnchors.map(a => `<span class="anchor-tag">${a}</span>`).join('');

  document.getElementById('careerList').innerHTML = matches.map((c, i) => {
    const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : 'other';
    const prospectInfo = c.prospect ? `<div class="career-detail-section career-detail-prospect"><div class="career-detail-label">发展前景</div><div class="career-detail-content">${c.prospect}</div></div>` : '';
    const reasonInfo = c.matchReason ? renderMatchReasonTags(c.matchReason) : '';
    return `
      <div class="career-item">
        <div class="career-item-left">
          <div class="career-rank ${rankClass}">${i + 1}</div>
          <div class="career-info">
            <div class="career-name">${c.name}</div>
            <div class="career-meta">${c.industry} · ${c.type}</div>
            <div class="career-skills">${c.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
          </div>
        </div>
        <div class="career-item-right">
          <div class="career-match">${c.matchScore}<span>%</span></div>
          <button class="btn-detail" onclick="toggleCareerDetail(this, ${i})">展开详情</button>
        </div>
        <div class="career-detail-body" id="careerDetail${i}" style="display:none;">
          ${prospectInfo}
          ${reasonInfo}
        </div>
      </div>
    `;
  }).join('');
}

// ========== 渲染结果页画像卡片（联动累积画像系统） ==========
function renderResultProfileCard(top3, topAnchors, scores) {
  const container = document.getElementById('resultProfileCard');
  if (!container) return;

  const typeLabels = { R: '实用型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型' };

  let profileLevel = 'L1';
  let levelLabel = '基础画像';
  let levelColor = '#4E46DC';
  let levelDesc = '基于职业兴趣测评，了解你"喜欢做什么"';
  let completedCount = 1;

  if (typeof buildCumulativeProfile === 'function') {
    const profile = buildCumulativeProfile();
    profileLevel = profile.level;
    completedCount = profile.completedAssessments.length;

    if (typeof getProfileLevelInfo === 'function') {
      const levelInfo = getProfileLevelInfo(profileLevel);
      levelLabel = levelInfo.label;
      levelColor = levelInfo.color;
      levelDesc = levelInfo.desc;
    }
  } else if (topAnchors && topAnchors.length > 0) {
    completedCount = 2;
    profileLevel = 'L2';
    levelLabel = '标准画像';
    levelColor = '#0DB8A8';
    levelDesc = '兴趣 + 价值观双维度，了解你"喜欢什么"且"看重什么"';
  }

  const totalAssessments = typeof ASSESSMENT_LIBRARY !== 'undefined' ? Object.keys(ASSESSMENT_LIBRARY).length : 6;
  const progressPercent = Math.min(100, Math.round((completedCount / totalAssessments) * 100));

  const insights = generateQuickInsights(top3, topAnchors, scores, typeLabels);

  container.innerHTML = `
    <div class="rp-card" style="border-color:${levelColor}">
      <div class="rp-card-header">
        <div class="rp-level-badge" style="background:${levelColor}">${profileLevel}</div>
        <div class="rp-level-info">
          <h4>${levelLabel} <span class="rp-level-count">· 已完成 ${completedCount} 项测评</span></h4>
          <p class="rp-level-desc">${levelDesc}</p>
        </div>
        <button class="rp-view-full-btn" onclick="navigateTo('assessment-profile')">查看完整画像 →</button>
      </div>

      <div class="rp-progress">
        <div class="rp-progress-bar">
          <div class="rp-progress-fill" style="width:${progressPercent}%;background:${levelColor}"></div>
        </div>
        <span class="rp-progress-text">画像完成度 ${progressPercent}%</span>
      </div>

      <div class="rp-insights">
        <div class="rp-insights-title">💡 本次测评核心洞察</div>
        <div class="rp-insights-grid">
          ${insights.map(ins => `
            <div class="rp-insight-item">
              <span class="rp-insight-icon">${ins.icon}</span>
              <div class="rp-insight-content">
                <div class="rp-insight-title">${ins.title}</div>
                <div class="rp-insight-desc">${ins.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="rp-upgrade-hint">
        <span>🎯 完成更多测评可解锁深度画像分析</span>
        <button class="btn-secondary btn-sm" onclick="navigateTo('assessment-library')">浏览测评库</button>
      </div>
    </div>
  `;
}

// 生成快速洞察
function generateQuickInsights(top3, topAnchors, scores, typeLabels) {
  const insights = [];
  const topType = top3[0] || 'I';
  const topTypeLabel = typeLabels[topType] || '研究型';

  insights.push({
    icon: '🎯',
    title: '核心兴趣方向',
    desc: `你的主导职业兴趣类型为${topTypeLabel}（${topType}），在工作中寻求能够发挥${topTypeLabel}特质的活动机会。`
  });

  if (top3.length >= 2) {
    const secondType = top3[1];
    insights.push({
      icon: '🔗',
      title: '辅助兴趣维度',
      desc: `${typeLabels[secondType]}（${secondType}）是你的重要辅助维度，与${topTypeLabel}结合形成独特的职业优势组合。`
    });
  }

  if (topAnchors && topAnchors.length > 0) {
    const topAnchor = topAnchors[0];
    insights.push({
      icon: '⚓',
      title: '价值观驱动',
      desc: `你的核心职业锚为「${topAnchor}」，这是你在职业决策中最不愿放弃的核心价值观，选择职业时应以此为重要参考。`
    });
  } else {
    insights.push({
      icon: '⚓',
      title: '待完善：职业价值观',
      desc: '完成 Schein 职业锚测评，了解你在职业决策中最看重的因素，让推荐更精准。'
    });
  }

  const lowType = findLowestType(scores);
  if (lowType) {
    insights.push({
      icon: '⚠️',
      title: '需注意的方面',
      desc: `${typeLabels[lowType]}（${lowType}）维度得分相对较低，选择职业时应避免过度依赖该类能力的工作内容。`
    });
  }

  return insights;
}

function findLowestType(scores) {
  if (!scores) return null;
  let lowest = null;
  let minVal = Infinity;
  Object.entries(scores).forEach(([k, v]) => {
    if (v < minVal) { minVal = v; lowest = k; }
  });
  return lowest;
}

// 展开/折叠职业详情
function toggleCareerDetail(btn, index) {
  const detail = document.getElementById('careerDetail' + index);
  if (detail.style.display === 'none') {
    detail.style.display = 'block';
    btn.textContent = '收起详情';
  } else {
    detail.style.display = 'none';
    btn.textContent = '展开详情';
  }
}

// 渲染匹配原因标签（可视化展示）
function renderMatchReasonTags(reasonText) {
  const reasons = reasonText.split('，');
  const tagColors = {
    'Holland代码完全匹配': 'match-tag-code',
    'Holland代码前两位匹配': 'match-tag-code',
    'Holland代码首尾匹配': 'match-tag-code',
    'Holland代码首位匹配': 'match-tag-code',
    'Holland代码次位匹配': 'match-tag-code',
    'Holland代码末位匹配': 'match-tag-code',
    '符合你的': 'match-tag-anchor',
    '契合': 'match-tag-pref',
    '该职业通常需要': 'match-tag-warning'
  };
  
  const tags = reasons.map(reason => {
    let className = 'match-tag match-tag-default';
    for (const [keyword, cls] of Object.entries(tagColors)) {
      if (reason.includes(keyword)) {
        className = 'match-tag ' + cls;
        break;
      }
    }
    return `<span class="${className}">${reason}</span>`;
  }).join('');
  
  return `<div class="career-detail-section career-detail-reason"><div class="career-detail-label">匹配原因</div><div class="match-reason-tags">${tags}</div></div>`;
}

function collectAssessmentScoresForCorrelation() {
  const scores = {
    riasec: null,
    anchor: null,
    big5: null,
    mbti: null,
    disc: null,
    gallup: null,
    values: null,
    maturity: null,
    aptitude: null,
    satisfaction: null
  };

  let progress = null;
  try {
    progress = JSON.parse(localStorage.getItem('careerCompass_progress') || 'null');
  } catch (e) {}

  function getScore(key, directKey, isJson) {
    if (progress && progress[key]) {
      return progress[key];
    }
    try {
      const val = localStorage.getItem(directKey);
      if (val) {
        return isJson ? JSON.parse(val) : val;
      }
    } catch (e) {}
    return null;
  }

  scores.riasec = getScore('riasecScores', 'riasecScores', true);
  scores.big5 = getScore('big5Scores', 'big5Scores', true);
  scores.disc = getScore('discScores', 'discScores', true);
  scores.gallup = getScore('gallupScores', 'gallupTop5', true);
  scores.values = getScore('valuesScores', 'valuesScores', true);
  scores.maturity = getScore('maturityScores', 'maturityScores', true);
  scores.aptitude = getScore('aptitudeScores', 'aptitudeScores', true);
  scores.satisfaction = getScore('satisfactionScores', 'satisfactionScores', true);

  try {
    const mbti = localStorage.getItem('mbtiResult');
    if (mbti) scores.mbti = mbti;
  } catch (e) {}

  if (progress && progress.anchorAnswers) {
    try {
      const anchorMapping = ['管理型','自主独立型','安全稳定型','服务奉献型','挑战型','生活型','技术职能型','创业型'];
      const counts = {};
      progress.anchorAnswers.forEach((isA, i) => {
        const a = anchorMapping[i];
        if (a && isA) counts[a] = (counts[a] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) scores.anchor = sorted[0][0];
    } catch (e) {}
  } else {
    try {
      const anchor = localStorage.getItem('anchorResult');
      if (anchor) scores.anchor = anchor;
    } catch (e) {}
  }

  return scores;
}

function renderCorrelationInsights() {
  const container = document.getElementById('correlationSection');
  if (!container) return;

  if (typeof generateCorrelationInsights !== 'function') {
    container.style.display = 'none';
    return;
  }

  const scores = collectAssessmentScoresForCorrelation();
  const completedCount = Object.values(scores).filter(v => v !== null).length;

  if (completedCount < 2) {
    container.innerHTML = `
      <div class="correlation-empty">
        <div class="correlation-empty-icon">🔗</div>
        <div class="correlation-empty-title">完成更多测评解锁关联分析</div>
        <div class="correlation-empty-desc">已完成 ${completedCount} / 2 项测评，完成2项及以上可查看跨维度关联洞察</div>
        <button class="btn-secondary btn-sm" onclick="navigateTo('assessment-library')">去测评库</button>
      </div>
    `;
    return;
  }

  const insights = generateCorrelationInsights(scores);

  if (insights.length === 0) {
    container.innerHTML = `
      <div class="correlation-empty">
        <div class="correlation-empty-icon">✨</div>
        <div class="correlation-empty-title">继续探索你的职业画像</div>
        <div class="correlation-empty-desc">完成更多测评可发现更多维度间的关联模式</div>
      </div>
    `;
    return;
  }

  let html = '<div class="correlation-section">';
  html += '<h3 class="correlation-title">🔗 跨测评关联洞察</h3>';
  html += '<p class="correlation-desc">基于你完成的' + completedCount + '项测评，系统发现以下关联模式</p>';
  html += '<div class="correlation-list">';

  insights.forEach(function(insight) {
    html += '<div class="correlation-card">';
    html += '<div class="correlation-card-title">' + insight.title + '</div>';
    html += '<p class="correlation-card-insight">' + insight.insight + '</p>';
    if (insight.careers && insight.careers.length > 0) {
      html += '<div class="correlation-card-careers">';
      html += '<span class="correlation-careers-label">推荐方向：</span>';
      insight.careers.forEach(function(c) {
        html += '<span class="correlation-career-tag">' + c + '</span>';
      });
      html += '</div>';
    }
    html += '</div>';
  });

  html += '</div></div>';
  container.innerHTML = html;
}
