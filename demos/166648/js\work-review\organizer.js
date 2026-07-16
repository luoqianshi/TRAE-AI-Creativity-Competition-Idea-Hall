// ========== 智能归纳引擎 ==========

// 归纳文档并生成双视图
function organizeDocument(item) {
  const docs = getParsedDocuments();
  const doc = docs.find(d => d.id === item.id);
  if (!doc) return;

  // 更新归纳状态
  doc.isOrganized = true;
  doc.organizedAt = new Date().toISOString();
  localStorage.setItem('workDocuments', JSON.stringify(docs));

  // 触发视图刷新
  if (currentView === 'work-archive') {
    renderTimelineView();
    renderModularView();
  }
}

// 渲染时间线视图
function renderTimelineView() {
  const container = document.getElementById('timelineView');
  if (!container) return;

  const docs = getParsedDocuments().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (docs.length === 0) {
    container.innerHTML = '<div class="organizer-empty">暂无工作文档，请先上传</div>';
    return;
  }

  // 按年月分组
  const groups = groupByMonth(docs);

  container.innerHTML = Object.entries(groups).map(([month, items]) => `
    <div class="timeline-month">
      <div class="timeline-month-label">${month}</div>
      <div class="timeline-items">
        ${items.map(doc => `
          <div class="timeline-item" onclick="showDocDetail('${doc.id}')">
            <div class="timeline-item-dot"></div>
            <div class="timeline-item-card">
              <div class="timeline-item-title">${doc.title}</div>
              <div class="timeline-item-date">${formatDate(doc.date)}</div>
              <div class="timeline-item-summary">${doc.summary?.substring(0, 100) || ''}...</div>
              <div class="timeline-item-tags">
                ${(doc.skills || []).map(s => `<span class="timeline-tag skill">${s}</span>`).join('')}
                ${(doc.projects || []).map(p => `<span class="timeline-tag project">${p}</span>`).join('')}
              </div>
              ${doc.achievements?.length ? `
                <div class="timeline-item-achievements">
                  ${doc.achievements.slice(0, 2).map(a => `<div class="achievement-mini">${a}</div>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// 渲染模块化视图
function renderModularView() {
  const container = document.getElementById('modularView');
  if (!container) return;

  const docs = getParsedDocuments();

  if (docs.length === 0) {
    container.innerHTML = '<div class="organizer-empty">暂无工作文档，请先上传</div>';
    return;
  }

  // 按模块分类
  const modules = {
    projects: { title: '项目经历', icon: '&#128188;', items: [] },
    skills: { title: '技能积累', icon: '&#128295;', items: [] },
    achievements: { title: '工作成果', icon: '&#127942;', items: [] },
    reviews: { title: '工作复盘', icon: '&#128221;', items: [] }
  };

  docs.forEach(doc => {
    // 项目
    (doc.projects || []).forEach(proj => {
      const existing = modules.projects.items.find(p => p.name === proj);
      if (existing) {
        existing.docs.push(doc);
      } else {
        modules.projects.items.push({ name: proj, docs: [doc] });
      }
    });

    // 技能
    (doc.skills || []).forEach(skill => {
      const existing = modules.skills.items.find(s => s.name === skill);
      if (existing) {
        existing.docs.push(doc);
        existing.count++;
      } else {
        modules.skills.items.push({ name: skill, docs: [doc], count: 1 });
      }
    });

    // 成果
    (doc.achievements || []).forEach(ach => {
      modules.achievements.items.push({ text: ach, doc });
    });

    // 复盘
    modules.reviews.items.push(doc);
  });

  container.innerHTML = Object.entries(modules).map(([key, mod]) => `
    <div class="modular-section">
      <div class="modular-section-header">
        <span class="modular-icon">${mod.icon}</span>
        <span class="modular-title">${mod.title}</span>
        <span class="modular-count">${mod.items.length}</span>
      </div>
      <div class="modular-items">
        ${key === 'projects' ? mod.items.map(p => `
          <div class="modular-item" onclick="showProjectDetail('${p.name}')">
            <div class="modular-item-name">${p.name}</div>
            <div class="modular-item-meta">${p.docs.length} 条相关记录</div>
          </div>
        `).join('') : ''}
        ${key === 'skills' ? mod.items.sort((a, b) => b.count - a.count).map(s => `
          <div class="modular-item">
            <div class="modular-item-name">${s.name}</div>
            <div class="modular-item-meta">出现 ${s.count} 次</div>
            <div class="skill-frequency-bar">
              <div class="skill-frequency-fill" style="width:${Math.min(s.count * 20, 100)}%"></div>
            </div>
          </div>
        `).join('') : ''}
        ${key === 'achievements' ? mod.items.slice(0, 10).map(a => `
          <div class="modular-item achievement-item">
            <div class="modular-item-text">${a.text}</div>
            <div class="modular-item-meta">来自：${a.doc.title}</div>
          </div>
        `).join('') : ''}
        ${key === 'reviews' ? mod.items.slice(0, 5).map(r => `
          <div class="modular-item" onclick="showDocDetail('${r.id}')">
            <div class="modular-item-name">${r.title}</div>
            <div class="modular-item-meta">${formatDate(r.date)}</div>
          </div>
        `).join('') : ''}
      </div>
    </div>
  `).join('');
}

// 按月分组
function groupByMonth(docs) {
  const groups = {};
  docs.forEach(doc => {
    const date = new Date(doc.date);
    const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(doc);
  });
  return groups;
}

// 获取洞察图标
function getInsightIcon(type) {
  const icons = {
    skill: '💡',
    achievement: '🏆',
    topic: '📊',
    length: '📝',
    default: '✨'
  };
  return icons[type] || icons.default;
}

// 显示文档详情
function showDocDetail(id) {
  const docs = getParsedDocuments();
  const doc = docs.find(d => d.id === id);
  if (!doc) return;

  const modal = document.getElementById('docDetailModal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${doc.title}</h3>
        <button class="modal-close" onclick="closeDocDetail()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="doc-detail-meta">
          <span class="doc-detail-date">${formatDate(doc.date)}</span>
          <span class="doc-detail-type">${doc.ext}</span>
        </div>
        <div class="doc-detail-summary">
          <h4>内容摘要</h4>
          <p>${doc.summary || '暂无摘要'}</p>
        </div>
        ${doc.projects?.length ? `
          <div class="doc-detail-section">
            <h4>相关项目</h4>
            <div class="doc-detail-tags">
              ${doc.projects.map(p => `<span class="doc-tag project">${p}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${doc.skills?.length ? `
          <div class="doc-detail-section">
            <h4>涉及技能</h4>
            <div class="doc-detail-tags">
              ${doc.skills.map(s => `<span class="doc-tag skill">${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${doc.achievements?.length ? `
          <div class="doc-detail-section">
            <h4>工作成果</h4>
            <ul class="doc-detail-achievements">
              ${doc.achievements.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${doc.keywords?.length ? `
          <div class="doc-detail-section">
            <h4>关键词</h4>
            <div class="doc-detail-tags">
              ${doc.keywords.map(k => `<span class="doc-tag keyword">${k}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${doc.suggestedTags?.length ? `
          <div class="doc-detail-section">
            <h4>建议标签</h4>
            <div class="doc-detail-tags">
              ${doc.suggestedTags.map(t => `<span class="doc-tag suggested">${t}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${doc.aiInsights?.length ? `
          <div class="doc-detail-section doc-ai-insights">
            <div class="doc-ai-header">
              <span class="doc-ai-icon">🤖</span>
              <h4>AI 智能归纳</h4>
            </div>
            <div class="doc-ai-content">
              ${doc.aiInsights.map(insight => `
                <div class="doc-ai-item" data-type="${insight.type}">
                  <span class="doc-ai-item-icon">${getInsightIcon(insight.type)}</span>
                  <div class="doc-ai-item-body">
                    <div class="doc-ai-item-title">${insight.title}</div>
                    <div class="doc-ai-item-text">${insight.content}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="deleteDoc('${doc.id}')">删除</button>
        <button class="btn-primary" onclick="closeDocDetail()">关闭</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

// 关闭文档详情
function closeDocDetail() {
  const modal = document.getElementById('docDetailModal');
  if (modal) modal.style.display = 'none';
}

// 删除文档
function deleteDoc(id) {
  if (!confirm('确定要删除这条记录吗？')) return;
  deleteDocument(id);
  closeDocDetail();
  renderTimelineView();
  renderModularView();
}

// 显示项目详情
function showProjectDetail(name) {
  const docs = getParsedDocuments().filter(d => (d.projects || []).includes(name));

  const modal = document.getElementById('docDetailModal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>项目：${name}</h3>
        <button class="modal-close" onclick="closeDocDetail()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="project-stats">
          <div class="project-stat">
            <div class="project-stat-num">${docs.length}</div>
            <div class="project-stat-label">相关文档</div>
          </div>
          <div class="project-stat">
            <div class="project-stat-num">${[...new Set(docs.flatMap(d => d.skills || []))].length}</div>
            <div class="project-stat-label">涉及技能</div>
          </div>
          <div class="project-stat">
            <div class="project-stat-num">${docs.flatMap(d => d.achievements || []).length}</div>
            <div class="project-stat-label">工作成果</div>
          </div>
        </div>
        <div class="project-timeline">
          <h4>项目历程</h4>
          ${docs.sort((a, b) => new Date(a.date) - new Date(b.date)).map(d => `
            <div class="project-timeline-item">
              <div class="project-timeline-date">${formatDate(d.date)}</div>
              <div class="project-timeline-title">${d.title}</div>
              <div class="project-timeline-summary">${d.summary?.substring(0, 80) || ''}...</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" onclick="closeDocDetail()">关闭</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

// 切换视图
function switchOrganizerView(view) {
  const timelineBtn = document.getElementById('viewTimelineBtn');
  const modularBtn = document.getElementById('viewModularBtn');
  const timelineView = document.getElementById('timelineView');
  const modularView = document.getElementById('modularView');

  if (view === 'timeline') {
    timelineBtn?.classList.add('active');
    modularBtn?.classList.remove('active');
    timelineView?.classList.add('active');
    modularView?.classList.remove('active');
    renderTimelineView();
  } else {
    modularBtn?.classList.add('active');
    timelineBtn?.classList.remove('active');
    modularView?.classList.add('active');
    timelineView?.classList.remove('active');
    renderModularView();
  }
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
