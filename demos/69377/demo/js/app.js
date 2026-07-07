import { civilizationsData, worldEventsData, categoryColors, comparisonDimensions } from './data.js';
import { TreeRenderer } from './explore.js';

const civilizations = civilizationsData.civilizations;
const worldEvents = worldEventsData.world_events;

// ===== 工具函数 =====
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function getCiv(id) { return civilizations.find(c => c.id === id); }
function getNode(civId, nodeId) { const c = getCiv(civId); return c ? c.nodes.find(n => n.id === nodeId) : null; }
function getEvent(id) { return worldEvents.find(e => e.id === id); }
function getCategoryName(cat) { const map = { politics: '政治', technology: '技术', culture: '文化', economy: '经济', military: '军事' }; return map[cat] || cat; }
function getCategoryColor(cat) { return categoryColors[cat] || '#888'; }

// ===== 状态 =====
let currentView = 'home';
let currentCivId = null;
let selectedNodeId = null;
let treeRenderer = null;
let compareState = { a: null, b: null, dim: 'technology' };

// ===== 路由 =====
function parseHash() {
  const hash = location.hash.replace('#', '') || 'home';
  if (hash.startsWith('explore/')) {
    return { view: 'explore', param: hash.replace('explore/', '') };
  }
  return { view: hash.split('?')[0], param: null };
}

function switchView(view, param) {
  currentView = view;
  $$('.view').forEach(v => v.classList.add('hidden'));
  $(`#${view}-view`)?.classList.remove('hidden');
  $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.view === view));

  if (view === 'home') renderHome();
  else if (view === 'explore') initExplore(param || 'china');
  else if (view === 'compare') initCompare();
  else if (view === 'events') initEvents();
  lucide.createIcons();
}

window.addEventListener('hashchange', () => {
  const { view, param } = parseHash();
  switchView(view, param);
});

// ===== 首页 =====
function renderHome() {
  const grid = $('#home-civ-grid');
  if (!grid || grid.children.length) return;

  civilizations.forEach(civ => {
    const card = document.createElement('div');
    card.className = 'civ-card animate-fade-in-up';
    card.innerHTML = `
      <div class="civ-card-color" style="background:${civ.color}"></div>
      <div class="civ-card-name">${civ.name}</div>
      <div class="civ-card-tagline">${civ.tagline}</div>
      <div class="civ-card-meta">
        <span>${civ.stats.total_nodes} 个节点</span>
        <span>${civ.stats.time_span}</span>
      </div>
    `;
    card.onclick = () => location.hash = `#explore/${civ.id}`;
    grid.appendChild(card);
  });

  // 锁定文明占位
  const locked = [
    { name: '古罗马', tagline: '法律与工程的帝国典范', nodes: 10 },
    { name: '古印度', tagline: '宗教与数学的南亚源泉', nodes: 9 },
    { name: '波斯', tagline: '宽容与驿道的洲际桥梁', nodes: 8 }
  ];
  locked.forEach(l => {
    const card = document.createElement('div');
    card.className = 'civ-card locked';
    card.innerHTML = `
      <div class="civ-card-name">${l.name}</div>
      <div class="civ-card-tagline">${l.tagline}</div>
      <div class="civ-card-meta"><span>即将开放 · 预计 ${l.nodes} 个节点</span></div>
    `;
    grid.appendChild(card);
  });

  // Hero 微缩动画
  playHeroAnimation();
}

function playHeroAnimation() {
  const svg = $('#hero-svg');
  if (!svg) return;
  svg.innerHTML = '';
  const nodes = [
    { x: 160, y: 40, label: '甲骨文', r: 24 },
    { x: 160, y: 110, label: '秦统一', r: 28 },
    { x: 160, y: 180, label: '造纸术', r: 26 }
  ];
  nodes.forEach((n, i) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', n.x); circle.setAttribute('cy', n.y); circle.setAttribute('r', 0);
    circle.setAttribute('fill', i === 0 ? '#B7410E' : (i === 1 ? '#8B4513' : '#2E5984'));
    circle.setAttribute('opacity', 0);
    svg.appendChild(circle);
    setTimeout(() => {
      circle.style.transition = 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      circle.setAttribute('r', n.r); circle.setAttribute('opacity', 1);
    }, 200 + i * 200);
    if (i > 0) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', nodes[i-1].x); line.setAttribute('y1', nodes[i-1].y + nodes[i-1].r);
      line.setAttribute('x2', n.x); line.setAttribute('y2', n.y - n.r);
      line.setAttribute('stroke', '#8C8279'); line.setAttribute('stroke-width', 2);
      line.setAttribute('stroke-dasharray', '4 4'); line.setAttribute('opacity', 0);
      svg.appendChild(line);
      setTimeout(() => { line.style.transition = 'opacity 300ms'; line.setAttribute('opacity', 0.6); }, 200 + i * 200);
    }
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', n.x); text.setAttribute('y', n.y + 4);
    text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', '#F5F1E8');
    text.setAttribute('font-size', 10); text.setAttribute('font-family', 'Noto Sans SC');
    text.textContent = n.label; text.setAttribute('opacity', 0);
    svg.appendChild(text);
    setTimeout(() => { text.style.transition = 'opacity 300ms'; text.setAttribute('opacity', 1); }, 400 + i * 200);
  });
}

// ===== 探索页 =====
function initExplore(civId) {
  currentCivId = civId;
  selectedNodeId = null;
  const civ = getCiv(civId);
  if (!civ) { location.hash = '#home'; return; }

  renderCivNav();
  renderDefaultPanel(civ);
  if (treeRenderer) treeRenderer.destroy();
  treeRenderer = new TreeRenderer($('#tree-svg'), civ, onNodeSelect, onNodeHover, onBranchToggle);
  treeRenderer.render('standard');

  // 视图模式切换
  $$('.view-mode-btn').forEach(btn => {
    btn.onclick = () => {
      $$('.view-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      treeRenderer.setMode(btn.dataset.mode);
    };
  });

  // 适应屏幕
  $('#btn-fit').onclick = () => treeRenderer.fitView();

  // 事件提示条关闭
  $('#event-toast-close').onclick = hideEventToast;
  $('#event-toast-action').onclick = () => treeRenderer.highlightEventNodes();

  // 详情面板返回
  $('#panel-back').onclick = () => {
    selectedNodeId = null;
    $('#panel-node').classList.add('hidden');
    $('#panel-default').classList.remove('hidden');
    treeRenderer.clearSelection();
  };

  // Section toggle
  $$('.section-toggle').forEach(t => {
    t.onclick = () => {
      const target = $(`#${t.dataset.target}`);
      const isOpen = target.classList.contains('open');
      target.classList.toggle('open', !isOpen);
      t.classList.toggle('expanded', !isOpen);
    };
  });

  lucide.createIcons();
}

function renderCivNav() {
  const list = $('#civ-nav-list');
  const locked = $('#civ-nav-locked');
  list.innerHTML = ''; locked.innerHTML = '';
  civilizations.forEach(civ => {
    const item = document.createElement('div');
    item.className = 'civ-nav-item' + (civ.id === currentCivId ? ' active' : '');
    item.innerHTML = `
      <div class="civ-nav-dot" style="background:${civ.color}"></div>
      <div class="civ-nav-info">
        <div class="civ-nav-name">${civ.name}</div>
        <div class="civ-nav-era">${civ.era}</div>
      </div>
    `;
    item.onclick = () => location.hash = `#explore/${civ.id}`;
    list.appendChild(item);
  });
  const lockItems = ['古罗马', '古印度', '波斯'];
  lockItems.forEach(name => {
    const item = document.createElement('div');
    item.className = 'civ-nav-item';
    item.innerHTML = `<div class="civ-nav-dot" style="background:#ccc"></div><div class="civ-nav-info"><div class="civ-nav-name">${name}</div><div class="civ-nav-era">即将开放</div></div>`;
    locked.appendChild(item);
  });
}

function renderDefaultPanel(civ) {
  $('#panel-civ-color').style.background = civ.color;
  $('#panel-civ-name').textContent = civ.name;
  $('#panel-civ-era').textContent = civ.era;
  $('#panel-civ-desc').textContent = civ.description;
  const stats = $('#panel-civ-stats');
  stats.innerHTML = `
    <div class="panel-stat"><span class="panel-stat-label">节点数</span><span class="panel-stat-value">${civ.stats.total_nodes}</span></div>
    <div class="panel-stat"><span class="panel-stat-label">时间跨度</span><span class="panel-stat-value">${civ.stats.time_span}</span></div>
    <div class="panel-stat"><span class="panel-stat-label">核心分支</span><span class="panel-stat-value">${civ.stats.key_branches.join('、')}</span></div>
    <div class="panel-stat"><span class="panel-stat-label">世界事件关联</span><span class="panel-stat-value">${civ.stats.world_connections} 个</span></div>
  `;
  $('#panel-default').classList.remove('hidden');
  $('#panel-node').classList.add('hidden');
}

function onNodeSelect(civId, nodeId) {
  selectedNodeId = nodeId;
  const node = getNode(civId, nodeId);
  if (!node) return;
  renderNodePanel(node);
  showEventToastIfNeeded(node);
}

function onNodeHover(civId, nodeId, x, y) {
  const tooltip = $('#node-tooltip');
  if (!nodeId) { tooltip.classList.remove('show'); return; }
  const node = getNode(civId, nodeId);
  if (!node) return;
  tooltip.innerHTML = `
    <div class="node-tooltip-title">${node.title}</div>
    <div class="node-tooltip-time">${node.time_label}</div>
    <div class="node-tooltip-summary">${node.summary}</div>
  `;
  const rect = $('.canvas-area').getBoundingClientRect();
  tooltip.style.left = (x - rect.left + 16) + 'px';
  tooltip.style.top = (y - rect.top + 16) + 'px';
  tooltip.classList.add('show');
}

function onBranchToggle(nodeId, expanded) {
  // branch toggle handled by TreeRenderer internally
}

function renderNodePanel(node) {
  $('#panel-default').classList.add('hidden');
  $('#panel-node').classList.remove('hidden');

  const catColor = getCategoryColor(node.category);
  const pill = $('#node-category-pill');
  pill.textContent = getCategoryName(node.category) + (node.subcategory ? ' · ' + node.subcategory : '');
  pill.style.background = catColor + '1A';
  pill.style.color = catColor;

  $('#node-detail-title').textContent = node.title;
  $('#node-detail-time').textContent = node.time_label;
  $('#node-detail-summary').textContent = node.summary;

  const tags = $('#impact-tags');
  tags.innerHTML = node.impact_tags.map(t => `<span class="impact-tag">${t}</span>`).join('');

  $('#detail-desc').innerHTML = `<p>${node.detail}</p>`;

  const connections = [];
  if (node.prerequisites.length) {
    connections.push('<div style="margin-bottom:8px"><strong>前置节点：</strong></div>');
    node.prerequisites.forEach(pid => {
      const n = getNode(currentCivId, pid);
      if (n) connections.push(`<div style="padding:6px 10px;background:rgba(140,130,121,0.08);border-radius:6px;margin-bottom:6px;cursor:pointer" onclick="location.hash='#explore/${currentCivId}?node=${n.id}'">${n.title} <span style="color:#8C8279;font-size:0.8rem">${n.time_label}</span></div>`);
    });
  }
  if (node.unlocks.length) {
    connections.push('<div style="margin-bottom:8px;margin-top:12px"><strong>解锁节点：</strong></div>');
    node.unlocks.forEach(uid => {
      const n = getNode(currentCivId, uid);
      if (n) connections.push(`<div style="padding:6px 10px;background:rgba(140,130,121,0.08);border-radius:6px;margin-bottom:6px;cursor:pointer" onclick="location.hash='#explore/${currentCivId}?node=${n.id}'">${n.title} <span style="color:#8C8279;font-size:0.8rem">${n.time_label}</span></div>`);
    });
  }
  if (node.world_event_links.length) {
    connections.push('<div style="margin-bottom:8px;margin-top:12px"><strong>关联世界事件：</strong></div>');
    node.world_event_links.forEach(eid => {
      const ev = getEvent(eid);
      if (ev) connections.push(`<div style="padding:6px 10px;background:rgba(212,160,86,0.1);border-radius:6px;margin-bottom:6px">${ev.title} <span style="color:#8C8279;font-size:0.8rem">${ev.time_label}</span></div>`);
    });
  }
  $('#detail-connections').innerHTML = connections.join('');

  const sources = node.sources.map(s => `<div style="margin-bottom:6px"><a href="${s.url}" target="_blank">${s.label}</a></div>`).join('');
  $('#detail-sources').innerHTML = `<div style="margin-bottom:8px"><span style="display:inline-block;padding:2px 10px;border-radius:11px;background:${node.confidence === 'high' ? 'rgba(58,125,68,0.12)' : 'rgba(201,162,39,0.12)'};color:${node.confidence === 'high' ? '#3A7D44' : '#C9A227'};font-size:0.75rem;font-weight:500">可信度：${node.confidence === 'high' ? '高' : '中'}</span></div>${sources}`;

  // Reset toggles
  $$('.section-toggle').forEach(t => t.classList.remove('expanded'));
  $$('.section-content').forEach(c => c.classList.remove('open'));
}

function showEventToastIfNeeded(node) {
  if (!node.world_event_links.length) { hideEventToast(); return; }
  const ev = getEvent(node.world_event_links[0]);
  if (!ev) return;
  $('#event-toast-text').innerHTML = `<strong>${ev.title}</strong> · ${ev.time_label}`;
  $('#event-toast').classList.add('show');
}

function hideEventToast() {
  $('#event-toast').classList.remove('show');
}

// ===== 对照页 =====
function initCompare() {
  renderCompareSlots();
  const modalClose = $('#modal-close');
  if (modalClose) modalClose.onclick = closeCivPicker;
  const dims = $('#dim-tabs');
  dims.innerHTML = comparisonDimensions.map(d =>
    `<button class="dim-tab ${compareState.dim === d.id ? 'active' : ''}" data-dim="${d.id}">${d.name}</button>`
  ).join('');
  $$('.dim-tab').forEach(t => {
    t.onclick = () => { compareState.dim = t.dataset.dim; initCompare(); renderComparison(); };
  });
  if (compareState.a && compareState.b) renderComparison();
  lucide.createIcons();
}

function renderCompareSlots() {
  const slots = $('#compare-slots');
  slots.innerHTML = '';
  ['a', 'b'].forEach(slot => {
    const civ = compareState[slot] ? getCiv(compareState[slot]) : null;
    const div = document.createElement('div');
    div.className = 'compare-slot' + (civ ? ' filled' : '');
    if (civ) {
      div.style.setProperty('--theme-color', civ.color);
      div.innerHTML = `<div class="slot-civ-name" style="color:${civ.color}">${civ.name}</div><div class="slot-civ-era">${civ.era}</div>`;
    } else {
      div.innerHTML = `<span class="slot-placeholder">选择文明 ${slot.toUpperCase()}</span>`;
    }
    div.onclick = () => openCivPicker(slot);
    slots.appendChild(div);
  });
  const vs = document.createElement('div');
  vs.className = 'compare-vs'; vs.textContent = 'VS';
  slots.appendChild(vs);
}

function openCivPicker(slot) {
  const modal = $('#civ-picker-modal');
  const grid = $('#modal-civ-grid');
  grid.innerHTML = civilizations.map(c => `
    <div class="modal-civ-option" data-civ="${c.id}">
      <div class="modal-civ-dot" style="background:${c.color}"></div>
      <div style="font-weight:600;font-size:0.9rem">${c.name}</div>
    </div>
  `).join('');
  $$('.modal-civ-option').forEach(opt => {
    opt.onclick = () => {
      compareState[slot] = opt.dataset.civ;
      if (compareState.a === compareState.b) {
        alert('请选择两个不同的文明进行对照'); compareState[slot] = null; return;
      }
      closeCivPicker();
      initCompare();
    };
  });
  modal.classList.add('show');
}

function closeCivPicker() {
  $('#civ-picker-modal').classList.remove('show');
}

function renderComparison() {
  const civA = getCiv(compareState.a);
  const civB = getCiv(compareState.b);
  if (!civA || !civB) return;
  $('#compare-dimensions').classList.remove('hidden');

  const dim = comparisonDimensions.find(d => d.id === compareState.dim);
  const nodesA = civA.nodes.filter(dim.filter).sort((a, b) => a.year - b.year);
  const nodesB = civB.nodes.filter(dim.filter).sort((a, b) => a.year - b.year);

  const content = $('#compare-content');
  content.innerHTML = `
    <div class="compare-col">
      <div class="compare-col-header">
        <div class="compare-col-name" style="color:${civA.color}">${civA.name}</div>
        <div class="compare-col-color" style="background:${civA.color}"></div>
      </div>
      <div class="compare-col-nodes">${nodesA.map(n => compareNodeHTML(n)).join('')}</div>
    </div>
    <div class="compare-col">
      <div class="compare-col-header">
        <div class="compare-col-name" style="color:${civB.color}">${civB.name}</div>
        <div class="compare-col-color" style="background:${civB.color}"></div>
      </div>
      <div class="compare-col-nodes">${nodesB.map(n => compareNodeHTML(n)).join('')}</div>
    </div>
  `;

  const conclusion = document.createElement('div');
  conclusion.className = 'compare-conclusion';
  conclusion.textContent = generateConclusion(civA, civB, nodesA, nodesB, dim.name);
  content.appendChild(conclusion);
}

function compareNodeHTML(node) {
  return `
    <div class="compare-node-item">
      <div class="compare-node-time">${node.time_label}</div>
      <div class="compare-node-title">${node.title}</div>
      <div class="compare-node-summary">${node.summary}</div>
    </div>
  `;
}

function generateConclusion(civA, civB, nodesA, nodesB, dimName) {
  if (!nodesA.length && !nodesB.length) return `两文明在${dimName}维度上暂无可直接对照的节点。`;
  const timeA = nodesA.length ? nodesA[0].time_label : '';
  const timeB = nodesB.length ? nodesB[0].time_label : '';
  return `${civA.name}与${civB.name}在${dimName}维度上各有特色。${nodesA.length ? civA.name + '的' + nodesA[0].title : ''}与${nodesB.length ? civB.name + '的' + nodesB[0].title : ''}展现了不同文明面对相似挑战时的独特路径。`;
}

// ===== 事件联动页 =====
function initEvents() {
  const timeline = $('#events-timeline');
  timeline.innerHTML = worldEvents.map(ev => `
    <div class="event-timeline-item" data-event="${ev.id}">
      <div class="event-tl-type">${getEventTypeName(ev.type)}</div>
      <div class="event-tl-title">${ev.title}</div>
      <div class="event-tl-time">${ev.time_label}</div>
    </div>
  `).join('');

  $$('.event-timeline-item').forEach(item => {
    item.onclick = () => {
      $$('.event-timeline-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      renderEventDetail(item.dataset.event);
    };
  });

  if (worldEvents.length) renderEventDetail(worldEvents[0].id);
}

function getEventTypeName(type) {
  const map = { trade: '贸易', war: '战争', migration: '迁徙', technology_diffusion: '技术扩散', cultural_exchange: '文化交流' };
  return map[type] || type;
}

function renderEventDetail(eventId) {
  const ev = getEvent(eventId);
  if (!ev) return;
  const detail = $('#events-detail');
  const affectedCivs = ev.affected_civilizations.map(cid => {
    const c = getCiv(cid);
    return c ? `<span class="event-affected-civ" style="border-color:${c.color}40">${c.name}</span>` : '';
  }).join('');

  let linkedNodesHtml = '';
  for (const [civId, nodeIds] of Object.entries(ev.linked_nodes)) {
    const civ = getCiv(civId);
    if (!civ) continue;
    const chips = nodeIds.map(nid => {
      const node = getNode(civId, nid);
      return node ? `<span class="event-node-chip" onclick="location.hash='#explore/${civId}?node=${nid}'">${civ.name} · ${node.title}</span>` : '';
    }).join('');
    linkedNodesHtml += `<div style="margin-bottom:8px"><strong style="color:${civ.color}">${civ.name}</strong></div><div style="margin-bottom:16px">${chips}</div>`;
  }

  detail.innerHTML = `
    <div class="event-detail-title">${ev.title}</div>
    <div class="event-detail-time">${ev.time_label}</div>
    <div class="event-detail-desc">${ev.description}</div>
    <div class="event-detail-impact"><strong>影响概要：</strong>${ev.impact_summary}</div>
    <div style="margin-bottom:12px"><strong>受影响文明：</strong></div>
    <div class="event-affected-civs">${affectedCivs}</div>
    <div class="event-linked-nodes">
      <h4>关联节点</h4>
      ${linkedNodesHtml}
    </div>
  `;
}

// ===== 初始化 =====
const { view, param } = parseHash();
switchView(view, param);
