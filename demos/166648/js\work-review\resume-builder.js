// ========== 简历智能生成器 ==========

const RESUME_TEMPLATES = {
  simple: { name: '简洁', desc: '清晰明了，适合大多数岗位' },
  professional: { name: '专业', desc: '稳重正式，适合传统行业' },
  creative: { name: '创意', desc: '设计感强，适合设计/市场岗位' },
  tech: { name: '技术', desc: '突出技能，适合技术岗位' },
  management: { name: '管理', desc: '强调领导力，适合管理岗位' }
};

// 初始化简历生成器
function initResumeBuilder() {
  renderTemplateSelector();
  renderBlockSelector();

  // 从 JD 解析页跳转过来时，自动填充 JD 文本
  const pendingJD = localStorage.getItem('pendingJDForResume');
  if (pendingJD) {
    const jdInput = document.getElementById('jobDescription');
    if (jdInput) {
      jdInput.value = pendingJD;
      localStorage.removeItem('pendingJDForResume');
      previewResume();

      // 滚动到 JD 区域并高亮提示
      setTimeout(() => {
        jdInput.style.transition = 'box-shadow 0.5s';
        jdInput.style.boxShadow = '0 0 0 3px rgba(78, 70, 220, 0.3)';
        setTimeout(() => {
          jdInput.style.boxShadow = '';
        }, 2000);
      }, 300);
    }
  }
}

// 渲染模板选择器
function renderTemplateSelector() {
  const container = document.getElementById('resumeTemplateSelector');
  if (!container) return;

  container.innerHTML = Object.entries(RESUME_TEMPLATES).map(([key, tmpl]) => `
    <div class="template-card ${key === 'simple' ? 'active' : ''}" data-template="${key}" onclick="selectTemplate('${key}')">
      <div class="template-preview">
        <div class="template-preview-mini template-${key}">
          <div class="mini-header"></div>
          <div class="mini-section"></div>
          <div class="mini-section"></div>
        </div>
      </div>
      <div class="template-name">${tmpl.name}</div>
      <div class="template-desc">${tmpl.desc}</div>
    </div>
  `).join('');
}

// 选择模板
function selectTemplate(key) {
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.template-card[data-template="${key}"]`)?.classList.add('active');
  selectedTemplate = key;
  previewResume();
}

let selectedTemplate = 'simple';
let selectedBlockIds = [];

// 渲染 Block 选择器
function renderBlockSelector() {
  const container = document.getElementById('resumeBlockSelector');
  if (!container) return;

  const blocks = getBlocks();

  if (blocks.length === 0) {
    container.innerHTML = '<div class="resume-empty-blocks">请先在工作档案中添加内容</div>';
    return;
  }

  container.innerHTML = blocks.map(block => `
    <div class="resume-block-option" data-id="${block.id}">
      <input type="checkbox" id="block-${block.id}" onchange="toggleBlockSelection('${block.id}')">
      <label for="block-${block.id}">
        <span class="block-option-type">${BLOCK_TYPES[block.type]?.label || block.type}</span>
        <span class="block-option-name">${block.name || block.title || '未命名'}</span>
      </label>
    </div>
  `).join('');
}

// 切换 Block 选择
function toggleBlockSelection(id) {
  const idx = selectedBlockIds.indexOf(id);
  if (idx > -1) {
    selectedBlockIds.splice(idx, 1);
  } else {
    selectedBlockIds.push(id);
  }
  previewResume();
}

// 预览简历
function previewResume() {
  const container = document.getElementById('resumePreview');
  if (!container) return;

  const blocks = getBlocks().filter(b => selectedBlockIds.includes(b.id));
  const jdText = document.getElementById('jobDescription')?.value || '';

  if (blocks.length === 0) {
    container.innerHTML = '<div class="resume-preview-empty">选择左侧内容生成简历预览</div>';
    return;
  }

  const html = generateResumeHTML(blocks, selectedTemplate, jdText);
  container.innerHTML = html;
}

// 生成简历 HTML
function generateResumeHTML(blocks, template, jdText) {
  const personal = getPersonalInfo();
  const projects = blocks.filter(b => b.type === 'project');
  const skills = blocks.filter(b => b.type === 'skill');
  const educations = blocks.filter(b => b.type === 'education');
  const certificates = blocks.filter(b => b.type === 'certificate');

  // 如果有 JD，进行匹配分析
  let matchAnalysis = '';
  if (jdText) {
    const match = analyzeJDMatch(blocks, jdText);
    matchAnalysis = `
      <div class="resume-match-analysis">
        <div class="match-score">匹配度：${match.score}%</div>
        <div class="match-details">
          ${match.matchedSkills.length ? `<div class="match-matched">匹配技能：${match.matchedSkills.join('、')}</div>` : ''}
          ${match.missingSkills.length ? `<div class="match-missing">建议补充：${match.missingSkills.join('、')}</div>` : ''}
        </div>
      </div>
    `;
  }

  return `
    <div class="resume resume-${template}">
      <div class="resume-header">
        <h1 class="resume-name">${personal.name || '姓名'}</h1>
        <div class="resume-contact">
          ${personal.phone ? `<span>${personal.phone}</span>` : ''}
          ${personal.email ? `<span>${personal.email}</span>` : ''}
          ${personal.location ? `<span>${personal.location}</span>` : ''}
        </div>
      </div>

      ${educations.length ? `
        <div class="resume-section">
          <h2 class="resume-section-title">教育背景</h2>
          ${educations.map(e => `
            <div class="resume-edu">
              <div class="resume-edu-header">
                <span class="resume-edu-school">${e.school}</span>
                <span class="resume-edu-time">${e.startDate || ''} - ${e.endDate || ''}</span>
              </div>
              <div class="resume-edu-major">${e.major}${e.degree ? ` · ${e.degree}` : ''}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${projects.length ? `
        <div class="resume-section">
          <h2 class="resume-section-title">项目经历</h2>
          ${projects.map(p => `
            <div class="resume-project">
              <div class="resume-project-header">
                <span class="resume-project-name">${p.name}</span>
                <span class="resume-project-time">${p.startDate || ''} - ${p.endDate || '至今'}</span>
              </div>
              <div class="resume-project-role">${p.role || ''}</div>
              <div class="resume-project-desc">${p.description || ''}</div>
              ${p.achievements?.length ? `
                <ul class="resume-project-achievements">
                  ${p.achievements.map(a => `<li>${highlightKeywords(a, jdText)}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${skills.length ? `
        <div class="resume-section">
          <h2 class="resume-section-title">专业技能</h2>
          <div class="resume-skills">
            ${skills.map(s => `
              <span class="resume-skill ${isSkillMatched(s.name, jdText) ? 'matched' : ''}">
                ${s.name}${s.level ? ` (${getLevelLabel(s.level)})` : ''}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${certificates.length ? `
        <div class="resume-section">
          <h2 class="resume-section-title">证书奖项</h2>
          ${certificates.map(c => `
            <div class="resume-cert">
              <span class="resume-cert-name">${c.name}</span>
              <span class="resume-cert-org">${c.organization || ''}</span>
              <span class="resume-cert-date">${c.date || ''}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${matchAnalysis}
    </div>
  `;
}

// 获取个人信息
function getPersonalInfo() {
  return JSON.parse(localStorage.getItem('personalInfo') || '{}');
}

// 分析 JD 匹配度
function analyzeJDMatch(blocks, jdText) {
  const jdSkills = extractJDSkills(jdText);
  const userSkills = blocks.filter(b => b.type === 'skill').map(s => s.name);
  const userSkillSet = new Set(userSkills);

  const matchedSkills = [];
  const missingSkills = [];

  jdSkills.forEach(skill => {
    if (userSkillSet.has(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const score = jdSkills.length > 0
    ? Math.round((matchedSkills.length / jdSkills.length) * 100)
    : 0;

  return { score, matchedSkills, missingSkills };
}

// 从 JD 提取技能
function extractJDSkills(jdText) {
  const skillKeywords = [
    'Python', 'Java', 'JavaScript', 'React', 'Vue', 'Node.js', 'SQL',
    '数据分析', '产品设计', '项目管理', '团队协作', '沟通协调',
    '机器学习', '深度学习', 'NLP', '计算机视觉', '大数据',
    'Excel', 'PPT', 'Word', 'Photoshop', 'Figma', 'Sketch',
    '运营', '市场', '销售', '客服', '人力资源', '财务',
    '英语', '日语', '韩语', '法语', '德语'
  ];

  const found = [];
  skillKeywords.forEach(skill => {
    if (jdText.includes(skill)) found.push(skill);
  });
  return found;
}

// 高亮关键词
function highlightKeywords(text, jdText) {
  if (!jdText) return text;
  const skills = extractJDSkills(jdText);
  let result = text;
  skills.forEach(skill => {
    if (text.includes(skill)) {
      result = result.replace(new RegExp(skill, 'g'), `<mark>${skill}</mark>`);
    }
  });
  return result;
}

// 判断技能是否匹配
function isSkillMatched(skillName, jdText) {
  if (!jdText) return false;
  return jdText.includes(skillName);
}

// 生成 PDF
function generateResumePDF() {
  const container = document.getElementById('resumePreview');
  if (!container || !container.innerHTML.trim()) {
    alert('请先生成简历预览');
    return;
  }

  // 使用 html2pdf.js 或打印到 PDF
  window.print();
}

// AI 优化简历
async function optimizeResume() {
  const jdText = document.getElementById('jobDescription')?.value;
  if (!jdText) {
    alert('请先粘贴目标岗位 JD');
    return;
  }

  const blocks = getBlocks().filter(b => selectedBlockIds.includes(b.id));

  // 调用 AI 优化
  const optimized = await callAIOptimize(blocks, jdText);

  // 更新预览
  const container = document.getElementById('resumePreview');
  if (container && optimized) {
    container.innerHTML = optimized.html;
  }
}

// 调用 AI 优化
async function callAIOptimize(blocks, jdText) {
  // 如果后端不可用，使用本地优化
  if (!API.isBackendAvailable) {
    return localOptimize(blocks, jdText);
  }

  try {
    const res = await fetch('/api/work-review/optimize-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks, jdText })
    });

    if (!res.ok) throw new Error('优化失败');
    return await res.json();
  } catch (err) {
    console.warn('AI优化失败，使用本地优化:', err);
    return localOptimize(blocks, jdText);
  }
}

// 本地优化（降级方案）
function localOptimize(blocks, jdText) {
  const jdSkills = extractJDSkills(jdText);

  // 重新排序技能：匹配的在前
  const skillBlocks = blocks.filter(b => b.type === 'skill');
  skillBlocks.sort((a, b) => {
    const aMatch = jdSkills.includes(a.name) ? 1 : 0;
    const bMatch = jdSkills.includes(b.name) ? 1 : 0;
    return bMatch - aMatch;
  });

  // 重新排序项目：匹配技能多的在前
  const projectBlocks = blocks.filter(b => b.type === 'project');
  projectBlocks.sort((a, b) => {
    const aMatches = (a.tags || []).filter(t => jdSkills.includes(t)).length;
    const bMatches = (b.tags || []).filter(t => jdSkills.includes(t)).length;
    return bMatches - aMatches;
  });

  // 生成优化后的 HTML
  const optimizedBlocks = [...skillBlocks, ...projectBlocks, ...blocks.filter(b => !['skill', 'project'].includes(b.type))];

  return {
    html: generateResumeHTML(optimizedBlocks, selectedTemplate, jdText),
    suggestions: generateSuggestions(blocks, jdText)
  };
}

// 生成优化建议
function generateSuggestions(blocks, jdText) {
  const jdSkills = extractJDSkills(jdText);
  const userSkills = new Set(blocks.filter(b => b.type === 'skill').map(s => s.name));
  const missing = jdSkills.filter(s => !userSkills.has(s));

  const suggestions = [];
  if (missing.length) {
    suggestions.push(`建议补充以下技能：${missing.join('、')}`);
  }

  // 检查是否有量化成果
  const projects = blocks.filter(b => b.type === 'project');
  const hasQuantified = projects.some(p =>
    (p.achievements || []).some(a => /\d+%?|\d+万|\d+万/.test(a))
  );
  if (!hasQuantified) {
    suggestions.push('建议在项目成果中使用量化数据（如"提升40%"）');
  }

  return suggestions;
}

// 显示优化建议
function showOptimizationTips() {
  const jdText = document.getElementById('jobDescription')?.value;
  if (!jdText) {
    alert('请先粘贴目标岗位 JD');
    return;
  }

  const blocks = getBlocks().filter(b => selectedBlockIds.includes(b.id));
  const suggestions = generateSuggestions(blocks, jdText);

  const modal = document.getElementById('resumeTipsModal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>简历优化建议</h3>
        <button class="modal-close" onclick="closeResumeTips()">&times;</button>
      </div>
      <div class="modal-body">
        ${suggestions.length ? `
          <ul class="optimization-tips">
            ${suggestions.map(s => `<li>${s}</li>`).join('')}
          </ul>
        ` : '<p>你的简历已经很完善了！</p>'}
      </div>
      <div class="modal-footer">
        <button class="btn-primary" onclick="closeResumeTips()">知道了</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

function closeResumeTips() {
  const modal = document.getElementById('resumeTipsModal');
  if (modal) modal.style.display = 'none';
}
