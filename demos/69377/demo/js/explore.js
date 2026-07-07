const NS = 'http://www.w3.org/2000/svg';

export class TreeRenderer {
  constructor(svg, civilization, onSelect, onHover, onBranchToggle) {
    this.svg = svg;
    this.civ = civilization;
    this.onSelect = onSelect;
    this.onHover = onHover;
    this.onBranchToggle = onBranchToggle;
    this.mode = 'standard';
    this.selectedNodeId = null;
    this.expandedBranches = new Set();
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.nodePositions = new Map();

    this.bindEvents();
  }

  bindEvents() {
    const container = this.svg.parentElement;
    container.addEventListener('mousedown', e => {
      if (e.target.closest('.node-card') || e.target.closest('.branch-toggle')) return;
      this.isDragging = true;
      this.dragStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
      container.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.dragStart.x;
      this.panY = e.clientY - this.dragStart.y;
      this.updateTransform();
    });
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      container.style.cursor = 'grab';
    });
    container.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom = Math.max(0.5, Math.min(2.0, this.zoom * delta));
      this.updateTransform();
    }, { passive: false });
    container.addEventListener('dblclick', () => this.fitView());
  }

  updateTransform() {
    const g = this.svg.querySelector('.tree-root-group');
    if (g) g.setAttribute('transform', `translate(${this.panX},${this.panY}) scale(${this.zoom})`);
  }

  fitView() {
    const container = this.svg.parentElement;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this.nodePositions.forEach((pos) => {
      minX = Math.min(minX, pos.x - 80);
      minY = Math.min(minY, pos.y - 40);
      maxX = Math.max(maxX, pos.x + 80);
      maxY = Math.max(maxY, pos.y + 60);
    });
    const contentW = maxX - minX || 400;
    const contentH = maxY - minY || 300;
    const scale = Math.min(cw / contentW, ch / contentH, 1.2) * 0.85;
    this.zoom = Math.max(0.5, Math.min(2.0, scale));
    this.panX = (cw - contentW * this.zoom) / 2 - minX * this.zoom;
    this.panY = (ch - contentH * this.zoom) / 2 - minY * this.zoom;
    this.updateTransform();
  }

  destroy() {
    this.svg.innerHTML = '';
  }

  setMode(mode) {
    this.mode = mode;
    this.render(mode);
  }

  getVisibleNodes() {
    if (this.mode === 'milestones') {
      return this.civ.nodes.filter(n => n.layout.role === 'root' || n.layout.role === 'milestone');
    }
    return this.civ.nodes.filter(n => {
      if (n.layout.lane === 'main') return true;
      // branch visible if its parent milestone is expanded
      const parent = this.civ.nodes.find(p => p.unlocks.includes(n.id));
      if (!parent) return true;
      return this.expandedBranches.has(parent.id);
    });
  }

  computeLayout() {
    const visible = this.getVisibleNodes();
    const byLayer = new Map();
    visible.forEach(n => {
      const layer = n.layout.layer;
      if (!byLayer.has(layer)) byLayer.set(layer, []);
      byLayer.get(layer).push(n);
    });

    const positions = new Map();
    const layerHeight = 140;
    const centerX = 400;
    const laneOffset = 220;

    byLayer.forEach((nodes, layer) => {
      nodes.forEach(n => {
        let x = centerX;
        if (n.layout.lane === 'branch_1') x = centerX + laneOffset;
        if (n.layout.lane === 'branch_2') x = centerX - laneOffset;
        if (n.layout.lane === 'branch_3') x = centerX + laneOffset * 2;
        const y = 60 + layer * layerHeight;
        positions.set(n.id, { x, y, node: n });
      });
    });
    this.nodePositions = positions;
    return positions;
  }

  render(mode) {
    this.svg.innerHTML = '';
    this.mode = mode || this.mode;
    const positions = this.computeLayout();
    const g = document.createElementNS(NS, 'g');
    g.classList.add('tree-root-group');
    this.svg.appendChild(g);

    // Draw links
    this.civ.nodes.forEach(node => {
      const fromPos = positions.get(node.id);
      if (!fromPos) return;
      node.unlocks.forEach(uid => {
        const toPos = positions.get(uid);
        if (!toPos) return;
        const path = document.createElementNS(NS, 'path');
        const d = this.bezierPath(fromPos.x, fromPos.y + 32,
                                   toPos.x, toPos.y - 32);
        path.setAttribute('d', d);
        const isBranch = node.layout.lane !== toPos.node.layout.lane;
        path.classList.add(isBranch ? 'link-branch' : 'link-main');
        if (!isBranch) path.style.stroke = this.civ.color;
        else path.style.stroke = '#8C8279';
        path.dataset.from = node.id;
        path.dataset.to = uid;
        g.appendChild(path);
      });
    });

    // Draw nodes
    positions.forEach((pos, nodeId) => {
      const node = pos.node;
      const isRoot = node.layout.role === 'root';
      const foreign = document.createElementNS(NS, 'foreignObject');
      foreign.setAttribute('x', pos.x - 80);
      foreign.setAttribute('y', pos.y - 32);
      foreign.setAttribute('width', 160);
      foreign.setAttribute('height', 68);
      foreign.classList.add('node-foreign');
      foreign.dataset.nodeId = nodeId;

      const div = document.createElement('div');
      div.className = `node-card ${node.layout.role === 'milestone' ? 'node-card-milestone' : ''} ${isRoot ? 'node-card-root' : ''}`;
      div.style.setProperty('--theme-color', this.civ.color);
      if (this.selectedNodeId === nodeId) div.classList.add('selected');

      div.innerHTML = `
        <div class="node-card-category">
          <span style="width:6px;height:6px;border-radius:50%;background:${getCategoryColor(node.category)};display:inline-block"></span>
          ${getCategoryName(node.category)}${isRoot ? ' · 起点' : ''}
        </div>
        <div class="node-card-title">${node.title}</div>
        <div class="node-card-time">${node.time_label}</div>
      `;

      div.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectNode(nodeId);
      });
      div.addEventListener('mouseenter', (e) => {
        const rect = div.getBoundingClientRect();
        this.onHover(this.civ.id, nodeId, rect.left + rect.width / 2, rect.top);
      });
      div.addEventListener('mouseleave', () => this.onHover(this.civ.id, null, 0, 0));

      foreign.appendChild(div);
      g.appendChild(foreign);

      // Branch toggle button for milestones with branch children
      if (node.layout.role === 'milestone' || node.layout.role === 'root') {
        const branchChildren = this.civ.nodes.filter(n => n.prerequisites.includes(nodeId) && n.layout.lane !== 'main');
        const visibleBranchChildren = branchChildren.filter(n => positions.has(n.id));
        const hiddenBranchChildren = branchChildren.filter(n => !positions.has(n.id));
        if (branchChildren.length) {
          const hasHidden = hiddenBranchChildren.length > 0;
          const toggleG = document.createElementNS(NS, 'g');
          toggleG.style.cursor = 'pointer';
          const tx = pos.x + 70;
          const ty = pos.y + 10;
          const circle = document.createElementNS(NS, 'circle');
          circle.setAttribute('cx', tx); circle.setAttribute('cy', ty); circle.setAttribute('r', 10);
          circle.setAttribute('fill', hasHidden ? '#8C8279' : '#2C241B');
          const text = document.createElementNS(NS, 'text');
          text.setAttribute('x', tx); text.setAttribute('y', ty + 3);
          text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', '#fff');
          text.setAttribute('font-size', 12); text.setAttribute('font-family', 'Inter');
          text.textContent = hasHidden ? '+' : '−';
          toggleG.appendChild(circle);
          toggleG.appendChild(text);
          toggleG.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.expandedBranches.has(nodeId)) {
              this.expandedBranches.delete(nodeId);
            } else {
              this.expandedBranches.add(nodeId);
            }
            this.render(this.mode);
            this.onBranchToggle(nodeId, this.expandedBranches.has(nodeId));
          });
          g.appendChild(toggleG);
        }
      }
    });

    // Event overlays
    if (this.mode === 'events') {
      this.renderEventOverlays(g, positions);
    }

    this.updateTransform();
    if (!this.hasFitted) {
      setTimeout(() => { this.fitView(); this.hasFitted = true; }, 50);
    }
  }

  bezierPath(x1, y1, x2, y2) {
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  }

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    this.render(this.mode);
    this.onSelect(this.civ.id, nodeId);
  }

  clearSelection() {
    this.selectedNodeId = null;
    this.render(this.mode);
  }

  highlightEventNodes() {
    const eventNodeIds = new Set();
    this.civ.nodes.forEach(n => {
      if (n.world_event_links.length) eventNodeIds.add(n.id);
    });
    this.svg.querySelectorAll('.node-foreign').forEach(fo => {
      const card = fo.querySelector('.node-card');
      if (eventNodeIds.has(fo.dataset.nodeId)) {
        card.classList.add('animate-pulse');
        setTimeout(() => card.classList.remove('animate-pulse'), 3000);
      }
    });
  }

  renderEventOverlays(g, positions) {
    // Draw vertical time-axis lines for world events
    const events = [
      { id: 'writing_revolution', year: -3100, label: '书写革命' },
      { id: 'iron_age_diffusion', year: -500, label: '铁器传播' },
      { id: 'alexander_conquest_event', year: -334, label: '亚历山大' },
      { id: 'hellenistic_period', year: -200, label: '希腊化' }
    ];
    const minYear = Math.min(...this.civ.nodes.map(n => n.year));
    const maxYear = Math.max(...this.civ.nodes.map(n => n.year));
    const range = maxYear - minYear || 1;
    const axisX = 720;

    events.forEach(ev => {
      if (ev.year < minYear || ev.year > maxYear) return;
      const ratio = (ev.year - minYear) / range;
      const y = 60 + ratio * (this.civ.nodes.length * 140);
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', axisX); line.setAttribute('y1', y - 40);
      line.setAttribute('x2', axisX); line.setAttribute('y2', y + 40);
      line.setAttribute('stroke', '#D4A056'); line.setAttribute('stroke-width', 2);
      line.setAttribute('stroke-dasharray', '3 3');
      g.appendChild(line);
      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', axisX + 8); text.setAttribute('y', y);
      text.setAttribute('fill', '#D4A056'); text.setAttribute('font-size', 10);
      text.textContent = ev.label;
      g.appendChild(text);
    });
  }
}

function getCategoryColor(cat) {
  const map = { politics: '#8B4513', technology: '#2E5984', culture: '#7B5EA7', economy: '#2E7D32', military: '#B71C1C' };
  return map[cat] || '#888';
}

function getCategoryName(cat) {
  const map = { politics: '政治', technology: '技术', culture: '文化', economy: '经济', military: '军事' };
  return map[cat] || cat;
}
