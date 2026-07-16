// ========== AI 报告生成模块 ==========

// RIASEC 类型中文名映射
var typeNames = { R: '实用型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型' };

// RIASEC 类型特征描述
var typeDescriptions = {
  R: '动手能力强，喜欢与机械、工具、动植物打交道，偏好具体明确的任务',
  I: '好奇心强，善于分析和思考，喜欢研究和解决复杂问题',
  A: '富有创造力和想象力，追求自我表达，喜欢非结构化的活动',
  S: '乐于助人，善于沟通和合作，关心他人的福祉和发展',
  E: '有领导力和说服力，喜欢影响和激励他人，追求商业成功',
  C: '注重细节和秩序，做事有条理，喜欢规范化和数据化的工作'
};

// 职业锚中文名映射
var anchorNamesCN = {
  '技术职能型': '技术职能型',
  '技术研究型': '技术研究型',
  '管理型': '管理型',
  '企业竞争型': '企业竞争型',
  '自主独立型': '自主独立型',
  '生活方式型': '生活方式型',
  '安全稳定型': '安全稳定型',
  '稳定深耕型': '稳定深耕型',
  '创业创造型': '创业创造型',
  '服务奉献型': '服务奉献型',
  '追求成就型': '追求成就型',
  '纯粹挑战型': '纯粹挑战型',
  '独立创作型': '独立创作型',
  '多元探索型': '多元探索型'
};

// 生成本地模板报告（无API时降级使用）
function generateLocalReport(data) {
  var topType = typeNames[data.top3[0]] || '综合型';
  var secondType = typeNames[data.top3[1]] || '综合型';
  var thirdType = typeNames[data.top3[2]] || '综合型';
  var topAnchor = data.topAnchors[0] || '多元探索型';
  var secondAnchor = data.topAnchors[1] || '';

  // 职业画像
  var profile = '你的职业兴趣以' + topType + '为主导，' + secondType + '为辅助。';
  profile += typeDescriptions[data.top3[0]] || '';
  profile += '同时，你在' + secondType + '方面也有较强的倾向，这意味着你具备多维度的职业潜力。';
  profile += '你的职业锚以"' + topAnchor + '"为核心';
  if (secondAnchor) {
    profile += '，"' + secondAnchor + '"为辅助';
  }
  profile += '，这表明你在职业选择中更看重与之匹配的工作环境和价值实现方式。';

  // 核心优势分析
  var strengths = '**Holland 职业兴趣分析：**\n\n';
  strengths += '- **' + topType + '（' + data.top3[0] + '）**：得分最高，是你最突出的职业兴趣维度。' + (typeDescriptions[data.top3[0]] || '') + '\n';
  strengths += '- **' + secondType + '（' + data.top3[1] + '）**：得分第二高，是你重要的辅助兴趣维度。\n';
  strengths += '- **' + thirdType + '（' + data.top3[2] + '）**：得分第三，为你提供了额外的职业灵活性。\n\n';
  strengths += '**职业锚分析：**\n\n';
  strengths += '你的核心职业锚为"' + topAnchor + '"，这说明你在职业发展中';
  if (topAnchor === '技术职能型' || topAnchor === '技术研究型') {
    strengths += '更倾向于深耕专业技术领域，追求在专业领域的卓越成就。';
  } else if (topAnchor === '管理型' || topAnchor === '企业竞争型') {
    strengths += '具有领导和管理方面的强烈动机，适合承担决策和影响他人的角色。';
  } else if (topAnchor === '自主独立型' || topAnchor === '生活方式型') {
    strengths += '重视工作与生活的平衡，更倾向于有自主权的工作方式。';
  } else if (topAnchor === '安全稳定型' || topAnchor === '稳定深耕型') {
    strengths += '追求稳定和可预测的职业发展路径，重视长期职业安全感。';
  } else if (topAnchor === '创业创造型') {
    strengths += '具有创业精神和创新意识，适合在充满变化的环境中开拓新领域。';
  } else if (topAnchor === '服务奉献型') {
    strengths += '具有强烈的社会责任感，适合从事帮助他人、服务社会的职业。';
  } else {
    strengths += '具有多元化的职业追求，适合灵活多变的职业发展路径。';
  }

  // 发展建议
  var suggestions = '**基于你的测评数据，我们建议：**\n\n';
  suggestions += '1. **发挥核心优势**：重点发展与' + topType + '相关的技能和经验，这是你最有可能获得职业满足感的领域。\n\n';
  suggestions += '2. **拓展辅助能力**：在保持' + topType + '核心竞争力的同时，适当培养' + secondType + '方面的能力，增加职业灵活性。\n\n';
  suggestions += '3. **关注职业锚匹配**：在选择具体岗位和公司时，优先考虑与"' + topAnchor + '"职业锚相匹配的工作环境和企业文化。\n\n';
  suggestions += '4. **制定阶段性目标**：建议将长期职业目标分解为3-6个月的短期目标，逐步积累经验和技能。\n\n';
  suggestions += '5. **持续学习与反馈**：定期回顾和评估自己的职业发展方向，根据实际情况灵活调整策略。';

  // 注意事项
  var warnings = '**需要注意的方面：**\n\n';
  // 找出得分最低的类型
  var sortedScores = Object.entries(data.scores || {}).sort(function(a, b) { return a[1] - b[1]; });
  var lowestType = sortedScores[0] ? sortedScores[0][0] : 'C';
  var lowestName = typeNames[lowestType] || '常规型';
  warnings += '- **' + lowestName + '维度较弱**：你在' + lowestName + '方面的兴趣较低，在选择职业时应注意避免过度依赖这类能力的工作内容。\n\n';
  warnings += '- **避免盲目跟风**：职业选择应基于自身兴趣和优势，而非单纯追逐热门行业或高薪岗位。\n\n';
  warnings += '- **保持开放心态**：职业发展是一个动态过程，你的兴趣和能力可能会随着经验积累而变化，保持学习和探索的态度。\n\n';
  warnings += '- **寻求多元反馈**：除了自我评估，建议向导师、同事或职业咨询师获取外部视角，帮助更全面地认识自己。';

  return {
    profile: profile,
    strengths: strengths,
    suggestions: suggestions,
    warnings: warnings
  };
}

// 打字机效果
var typewriterTimer = null;
function typewriterEffect(element, text, speed, callback) {
  if (typewriterTimer) clearInterval(typewriterTimer);
  element.textContent = '';
  var index = 0;
  typewriterTimer = setInterval(function() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
      if (callback) callback();
    }
  }, speed || 20);
}

// 简单的 Markdown 解析（支持 **粗体** 和换行）
function parseSimpleMarkdown(text) {
  var html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  return html;
}

// 渲染AI报告到页面
function renderAIReport(report) {
  var container = document.getElementById('aiReportContent');
  if (!container) return;

  var html = '';
  html += '<div class="ai-report-card">';
  html += '  <div class="ai-report-card-title">你的职业画像</div>';
  html += '  <div class="ai-report-card-body" id="aiReportProfile"></div>';
  html += '</div>';

  html += '<div class="ai-report-card">';
  html += '  <div class="ai-report-card-title">核心优势分析</div>';
  html += '  <div class="ai-report-card-body" id="aiReportStrengths"></div>';
  html += '</div>';

  html += '<div class="ai-report-card">';
  html += '  <div class="ai-report-card-title">发展建议</div>';
  html += '  <div class="ai-report-card-body" id="aiReportSuggestions"></div>';
  html += '</div>';

  html += '<div class="ai-report-card">';
  html += '  <div class="ai-report-card-title">注意事项</div>';
  html += '  <div class="ai-report-card-body" id="aiReportWarnings"></div>';
  html += '</div>';

  html += '<div class="ai-report-actions">';
  html += '  <button class="btn-ai-regenerate" onclick="generateAIReport()">重新生成</button>';
  html += '  <button class="btn-ai-save" onclick="saveAIReport()">保存报告</button>';
  html += '</div>';

  container.innerHTML = html;

  // 逐个卡片使用打字机效果
  var sections = [
    { id: 'aiReportProfile', text: report.profile },
    { id: 'aiReportStrengths', text: report.strengths },
    { id: 'aiReportSuggestions', text: report.suggestions },
    { id: 'aiReportWarnings', text: report.warnings }
  ];

  var currentSection = 0;
  function showNextSection() {
    if (currentSection >= sections.length) return;
    var section = sections[currentSection];
    var el = document.getElementById(section.id);
    if (el) {
      el.innerHTML = parseSimpleMarkdown(section.text);
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'all 0.4s ease';
      setTimeout(function() {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 50);
    }
    currentSection++;
    if (currentSection < sections.length) {
      setTimeout(showNextSection, 600);
    }
  }
  showNextSection();

  // 保存报告到全局
  window._lastAIReport = report;
}

// 显示加载状态
function showAIReportLoading() {
  var container = document.getElementById('aiReportContent');
  if (!container) return;
  container.innerHTML = '<div class="ai-report-loading">' +
    '<div class="ai-report-loading-spinner"></div>' +
    '<p>AI 正在分析你的测评数据，生成个性化报告...</p>' +
    '</div>';
}

// 生成AI报告（主入口）
async function generateAIReport() {
  var container = document.getElementById('aiReportContent');
  if (!container) return;

  // 检查是否有测评数据
  var scores = assessmentData.riasecScores || {};
  var hasScores = Object.values(scores).some(function(v) { return v > 0; });
  if (!hasScores) {
    container.innerHTML = '<div class="ai-report-placeholder">' +
      '<p>请先完成职业测评，AI才能为你生成个性化分析报告。</p>' +
      '<button class="btn-ai-generate" onclick="navigateTo(\'assessment\')">前往测评</button>' +
      '</div>';
    return;
  }

  showAIReportLoading();

  // 准备数据
  var sorted = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
  var top3 = sorted.slice(0, 3).map(function(e) { return e[0]; });

  var anchorCounts = {};
  assessmentData.anchorAnswers.forEach(function(isA, i) {
    var anchor = isA ? anchorMapping[i] : anchorMappingB[i];
    anchorCounts[anchor] = (anchorCounts[anchor] || 0) + 1;
  });
  var sortedAnchors = Object.entries(anchorCounts).sort(function(a, b) { return b[1] - a[1]; });
  var topAnchors = sortedAnchors.slice(0, 2).map(function(e) { return e[0]; });

  var reportData = {
    top3: top3,
    scores: scores,
    topAnchors: topAnchors,
    name: assessmentData.name || '',
    education: assessmentData.education || '',
    experience: assessmentData.experience || '',
    status: assessmentData.status || '',
    preferences: assessmentData.preferences || []
  };

  // 尝试调用后端API
  if (typeof API !== 'undefined' && API.available) {
    var result = await API.generateAIReport(
      API.sessionId,
      'career_analysis',
      reportData
    );
    if (result && result.report) {
      renderAIReport(result.report);
      return;
    }
  }

  // 降级到本地模板报告
  setTimeout(function() {
    var localReport = generateLocalReport(reportData);
    renderAIReport(localReport);
  }, 800);
}

// 保存AI报告
function saveAIReport() {
  var report = window._lastAIReport;
  if (!report) {
    alert('暂无报告可保存');
    return;
  }
  try {
    localStorage.setItem('cc_ai_report', JSON.stringify({
      timestamp: Date.now(),
      report: report
    }));
    alert('报告已保存到本地');
  } catch (e) {
    alert('保存失败，请重试');
  }
}
