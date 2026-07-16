// ========== 成长轨迹可视化 ==========

// 初始化成长轨迹分析
function initAnalytics() {
  renderSkillRadar();
  renderSkillGrowthChart();
  renderTimelineChart();
  renderAchievementStats();
}

// 渲染技能成长曲线图
function renderSkillGrowthChart() {
  const canvas = document.getElementById('skillGrowthChart');
  const legendContainer = document.getElementById('growthChartLegend');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = (rect.height || 300) * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height || 300;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.clearRect(0, 0, width, height);

  const skills = getBlocks().filter(b => b.type === 'skill');
  const projects = getBlocks().filter(b => b.type === 'project');

  if (skills.length === 0) {
    ctx.fillStyle = '#666';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂无技能数据', width / 2, height / 2);
    if (legendContainer) legendContainer.innerHTML = '';
    return;
  }

  const skillNames = skills.map(s => s.name);
  const maxLevel = 5;
  const colors = ['#0DB8A8', '#4E46DC', '#E8990A', '#D36460', '#6B7C5C'];

  ctx.beginPath();
  ctx.strokeStyle = '#eee';
  ctx.lineWidth = 1;
  for (let i = 0; i <= maxLevel; i++) {
    const y = padding.top + (chartHeight / maxLevel) * (maxLevel - i);
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.strokeStyle = '#eee';
  for (let i = 0; i < skillNames.length; i++) {
    const x = padding.left + (chartWidth / (skillNames.length - 1 || 1)) * i;
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, height - padding.bottom);
    ctx.stroke();
  }

  ctx.fillStyle = '#333';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i < skillNames.length; i++) {
    const x = padding.left + (chartWidth / (skillNames.length - 1 || 1)) * i;
    ctx.fillText(skillNames[i], x, height - 20);
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= maxLevel; i++) {
    const y = padding.top + (chartHeight / maxLevel) * (maxLevel - i);
    ctx.fillText(i, padding.left - 10, y);
  }

  const growthTrend = [];
  skills.forEach((skill, idx) => {
    const level = skill.level || 3;
    let trend = 0;

    if (skill.createdAt) {
      const created = new Date(skill.createdAt);
      const now = new Date();
      const months = Math.max(1, (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth()));
      trend = level / months;
    }

    growthTrend.push({
      level,
      trend,
      name: skill.name,
      color: colors[idx % colors.length]
    });
  });

  if (skills.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = '#0DB8A8';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    growthTrend.forEach((point, idx) => {
      const x = padding.left + (chartWidth / (skills.length - 1)) * idx;
      const y = padding.top + (chartHeight / maxLevel) * (maxLevel - point.level);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  growthTrend.forEach((point, idx) => {
    const x = padding.left + (chartWidth / (skills.length - 1 || 1)) * idx;
    const y = padding.top + (chartHeight / maxLevel) * (maxLevel - point.level);

    ctx.beginPath();
    ctx.fillStyle = point.color;
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  if (legendContainer) {
    legendContainer.innerHTML = growthTrend.map((g, i) => `
      <div class="growth-legend-item">
        <span class="growth-legend-dot" style="background: ${g.color}"></span>
        <span class="growth-legend-label">${g.name} (${g.level}★)</span>
      </div>
    `).join('');
  }
}

// 渲染技能雷达图
function renderSkillRadar() {
  const canvas = document.getElementById('skillRadarChart');
  if (!canvas) return;

  const blocks = getBlocks().filter(b => b.type === 'skill');
  if (blocks.length === 0) {
    canvas.parentElement.innerHTML = '<div class="analytics-empty">暂无技能数据</div>';
    return;
  }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const radius = Math.min(centerX, centerY) - 40;

  const skills = blocks.slice(0, 8); // 最多显示8个技能
  const count = skills.length;
  const angleStep = (Math.PI * 2) / count;

  // 清空画布
  ctx.clearRect(0, 0, rect.width, rect.height);

  // 绘制网格
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(78, 70, 220, 0.15)';
    ctx.lineWidth = 1;
    for (let j = 0; j <= count; j++) {
      const angle = j * angleStep - Math.PI / 2;
      const r = (radius / 5) * i;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 绘制轴线
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep - Math.PI / 2;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(78, 70, 220, 0.2)';
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    ctx.stroke();

    // 标签
    const labelX = centerX + Math.cos(angle) * (radius + 20);
    const labelY = centerY + Math.sin(angle) * (radius + 20);
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(skills[i].name, labelX, labelY);
  }

  // 绘制数据区域
  ctx.beginPath();
  ctx.fillStyle = 'rgba(78, 70, 220, 0.2)';
  ctx.strokeStyle = '#4E46DC';
  ctx.lineWidth = 2;

  for (let i = 0; i <= count; i++) {
    const skill = skills[i % count];
    const level = skill.level || 3;
    const angle = (i % count) * angleStep - Math.PI / 2;
    const r = (radius / 5) * level;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 绘制数据点
  for (let i = 0; i < count; i++) {
    const skill = skills[i];
    const level = skill.level || 3;
    const angle = i * angleStep - Math.PI / 2;
    const r = (radius / 5) * level;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;

    ctx.beginPath();
    ctx.fillStyle = '#4E46DC';
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 渲染时间线图表
function renderTimelineChart() {
  const container = document.getElementById('timelineChart');
  if (!container) return;

  const docs = getParsedDocuments();
  const blocks = getBlocks();

  if (docs.length === 0 && blocks.length === 0) {
    container.innerHTML = '<div class="analytics-empty">暂无时间线数据</div>';
    return;
  }

  // 合并所有时间事件
  const events = [];

  docs.forEach(doc => {
    if (doc.date) {
      events.push({
        date: new Date(doc.date),
        title: doc.title,
        type: 'document',
        skills: doc.skills || []
      });
    }
  });

  blocks.forEach(block => {
    if (block.startDate || block.date) {
      events.push({
        date: new Date(block.startDate || block.date),
        title: block.name || block.title,
        type: block.type,
        skills: block.tags || []
      });
    }
  });

  // 按时间排序
  events.sort((a, b) => a.date - b.date);

  if (events.length === 0) {
    container.innerHTML = '<div class="analytics-empty">暂无时间线数据</div>';
    return;
  }

  // 按年月分组
  const groups = {};
  events.forEach(evt => {
    const key = `${evt.date.getFullYear()}年${evt.date.getMonth() + 1}月`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(evt);
  });

  container.innerHTML = Object.entries(groups).map(([month, evts]) => `
    <div class="analytics-timeline-month">
      <div class="analytics-timeline-label">${month}</div>
      <div class="analytics-timeline-events">
        ${evts.map(evt => `
          <div class="analytics-timeline-event event-${evt.type}">
            <div class="event-dot"></div>
            <div class="event-content">
              <div class="event-title">${evt.title}</div>
              <div class="event-date">${evt.date.getDate()}日</div>
              ${evt.skills.length ? `
                <div class="event-skills">
                  ${evt.skills.map(s => `<span class="event-skill">${s}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// 渲染成果统计
function renderAchievementStats() {
  const container = document.getElementById('achievementStats');
  if (!container) return;

  const docs = getParsedDocuments();
  const blocks = getBlocks();

  // 统计数据
  const stats = {
    totalDocs: docs.length,
    totalProjects: blocks.filter(b => b.type === 'project').length,
    totalSkills: blocks.filter(b => b.type === 'skill').length,
    totalAchievements: docs.reduce((sum, d) => sum + (d.achievements?.length || 0), 0)
      + blocks.filter(b => b.type === 'project').reduce((sum, p) => sum + (p.achievements?.length || 0), 0),
    skillDistribution: {}
  };

  // 技能分布
  blocks.filter(b => b.type === 'skill').forEach(s => {
    const level = s.level || 3;
    stats.skillDistribution[level] = (stats.skillDistribution[level] || 0) + 1;
  });

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${stats.totalDocs}</div>
        <div class="stat-label">工作文档</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.totalProjects}</div>
        <div class="stat-label">项目经历</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.totalSkills}</div>
        <div class="stat-label">掌握技能</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.totalAchievements}</div>
        <div class="stat-label">工作成果</div>
      </div>
    </div>

    ${Object.keys(stats.skillDistribution).length ? `
      <div class="skill-distribution">
        <h4>技能熟练度分布</h4>
        <div class="distribution-bars">
          ${[1, 2, 3, 4, 5].map(level => {
            const count = stats.skillDistribution[level] || 0;
            const total = stats.totalSkills;
            const pct = total > 0 ? (count / total * 100).toFixed(0) : 0;
            return `
              <div class="distribution-bar">
                <span class="bar-label">${getLevelLabel(level)}</span>
                <div class="bar-track">
                  <div class="bar-fill" style="width:${pct}%;background:${getLevelColor(level)}"></div>
                </div>
                <span class="bar-count">${count}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

// 生成成长报告
function generateGrowthReport() {
  const docs = getParsedDocuments();
  const blocks = getBlocks();

  const report = {
    period: getReportPeriod(docs, blocks),
    summary: generateReportSummary(docs, blocks),
    highlights: generateHighlights(docs, blocks),
    skillGrowth: analyzeSkillGrowth(docs, blocks),
    recommendations: generateRecommendations(docs, blocks)
  };

  return report;
}

// 获取报告周期
function getReportPeriod(docs, blocks) {
  const allDates = [
    ...docs.map(d => d.date).filter(Boolean),
    ...blocks.map(b => b.startDate || b.date).filter(Boolean)
  ].map(d => new Date(d));

  if (allDates.length === 0) return '暂无数据';

  const min = new Date(Math.min(...allDates));
  const max = new Date(Math.max(...allDates));

  return `${min.getFullYear()}.${min.getMonth() + 1} - ${max.getFullYear()}.${max.getMonth() + 1}`;
}

// 生成报告摘要
function generateReportSummary(docs, blocks) {
  const projectCount = blocks.filter(b => b.type === 'project').length;
  const skillCount = blocks.filter(b => b.type === 'skill').length;
  const achievementCount = docs.reduce((sum, d) => sum + (d.achievements?.length || 0), 0);

  return `在此期间，你参与了 ${projectCount} 个项目，掌握了 ${skillCount} 项技能，完成了 ${achievementCount} 项工作成果。`;
}

// 生成亮点
function generateHighlights(docs, blocks) {
  const highlights = [];

  // 找出成果最多的项目
  const projects = blocks.filter(b => b.type === 'project');
  const topProject = projects.sort((a, b) =>
    (b.achievements?.length || 0) - (a.achievements?.length || 0)
  )[0];

  if (topProject) {
    highlights.push({
      type: 'project',
      title: topProject.name,
      desc: `成果最多的项目，包含 ${topProject.achievements?.length || 0} 项关键成果`
    });
  }

  // 找出最高级技能
  const skills = blocks.filter(b => b.type === 'skill');
  const topSkill = skills.sort((a, b) => (b.level || 0) - (a.level || 0))[0];

  if (topSkill) {
    highlights.push({
      type: 'skill',
      title: topSkill.name,
      desc: `最高熟练度技能，达到 ${getLevelLabel(topSkill.level || 3)} 水平`
    });
  }

  return highlights;
}

// 分析技能成长
function analyzeSkillGrowth(docs, blocks) {
  // 按时间排序的技能记录
  const skillEvents = [];

  docs.forEach(doc => {
    (doc.skills || []).forEach(skill => {
      skillEvents.push({ skill, date: doc.date, source: 'document' });
    });
  });

  blocks.filter(b => b.type === 'skill').forEach(block => {
    skillEvents.push({
      skill: block.name,
      date: block.createdAt,
      level: block.level,
      source: 'block'
    });
  });

  // 统计每个技能的出现次数
  const skillCounts = {};
  skillEvents.forEach(evt => {
    skillCounts[evt.skill] = (skillCounts[evt.skill] || 0) + 1;
  });

  return Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));
}

// 生成建议
function generateRecommendations(docs, blocks) {
  const recs = [];

  // 检查是否有定期复盘
  const reviews = blocks.filter(b => b.type === 'review');
  if (reviews.length < 3) {
    recs.push('建议增加工作复盘频率，至少每月一次，有助于更好地总结经验');
  }

  // 检查是否有量化成果
  const projects = blocks.filter(b => b.type === 'project');
  const hasQuantified = projects.some(p =>
    (p.achievements || []).some(a => /\d/.test(a))
  );
  if (!hasQuantified) {
    recs.push('建议在项目成果中使用量化数据，如"提升40%"、"节省2天"等');
  }

  // 检查技能数量
  const skills = blocks.filter(b => b.type === 'skill');
  if (skills.length < 5) {
    recs.push('你的技能库还可以更丰富，建议记录更多工作中使用的技能');
  }

  return recs;
}
