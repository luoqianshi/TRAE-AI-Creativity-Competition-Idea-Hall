/**
 * 电工电子虚拟仿真教学软件 - UI交互控制器
 */

class CircuitUI {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.components = [];
    this.wires = [];
    this.selectedComponent = null;
    this.selectedWire = null;
    this.draggingComponent = null;
    this.dragOffset = { x: 0, y: 0 };
    this.wiring = null; // { fromComp, fromTerm, startX, startY }
    this.hoverTerminal = null;
    this.scale = 1;
    this.offset = { x: 0, y: 0 };
    this.analyzer = new CircuitAnalyzer();
    this.simulating = false;
    this.currentLesson = null;
    this.lessonProgress = 0;
    
    this.setupCanvas();
    this.bindEvents();
    this.render();
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    
    window.addEventListener('resize', () => {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
      this.render();
    });
  }

  bindEvents() {
    // 鼠标事件 - 绑定到canvas
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
    
    // 防止canvas上的拖拽默认行为
    this.canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    
    this.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const type = e.dataTransfer.getData('component-type');
      if (type) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offset.x) / this.scale;
        const y = (e.clientY - rect.top - this.offset.y) / this.scale;
        this.addComponent(type, x, y);
      }
    });
    
    // 键盘事件
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    
    // 滚轮缩放
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.scale *= delta;
      this.scale = Math.max(0.5, Math.min(3, this.scale));
      this.render();
    });
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - this.offset.x) / this.scale,
      y: (e.clientY - rect.top - this.offset.y) / this.scale
    };
  }

  onMouseDown(e) {
    const pos = this.getMousePos(e);
    
    // 检查是否点击了端子（开始连线）
    const terminal = this.findTerminalAt(pos.x, pos.y);
    if (terminal) {
      this.wiring = {
        fromComp: terminal.compId,
        fromTerm: terminal.termId,
        startX: terminal.x,
        startY: terminal.y,
        endX: pos.x,
        endY: pos.y
      };
      return;
    }
    
    // 检查是否点击了元件
    const component = this.findComponentAt(pos.x, pos.y);
    if (component) {
      this.selectComponent(component);
      this.draggingComponent = component;
      this.dragOffset = {
        x: pos.x - component.x,
        y: pos.y - component.y
      };
      return;
    }
    
    // 检查是否点击了连线
    const wire = this.findWireAt(pos.x, pos.y);
    if (wire) {
      this.selectWire(wire);
      return;
    }
    
    // 点击空白处，取消选择
    this.deselectAll();
  }

  onMouseMove(e) {
    const pos = this.getMousePos(e);
    
    // 更新连线预览
    if (this.wiring) {
      this.wiring.endX = pos.x;
      this.wiring.endY = pos.y;
      
      // 检查悬停的端子
      const terminal = this.findTerminalAt(pos.x, pos.y);
      if (terminal && terminal.compId !== this.wiring.fromComp) {
        this.hoverTerminal = terminal;
      } else {
        this.hoverTerminal = null;
      }
      
      this.render();
      return;
    }
    
    // 拖拽元件
    if (this.draggingComponent) {
      this.draggingComponent.x = pos.x - this.dragOffset.x;
      this.draggingComponent.y = pos.y - this.dragOffset.y;
      // 对齐到网格
      this.draggingComponent.x = Math.round(this.draggingComponent.x / 10) * 10;
      this.draggingComponent.y = Math.round(this.draggingComponent.y / 10) * 10;
      this.render();
      return;
    }
    
    // 更新悬停状态
    const terminal = this.findTerminalAt(pos.x, pos.y);
    if (terminal) {
      this.canvas.style.cursor = 'crosshair';
    } else if (this.findComponentAt(pos.x, pos.y)) {
      this.canvas.style.cursor = 'move';
    } else {
      this.canvas.style.cursor = 'default';
    }
  }

  onMouseUp(e) {
    const pos = this.getMousePos(e);
    
    // 完成连线
    if (this.wiring) {
      const terminal = this.findTerminalAt(pos.x, pos.y);
      if (terminal && terminal.compId !== this.wiring.fromComp) {
        // 创建连线
        this.wires.push({
          id: 'wire_' + Date.now(),
          fromComp: this.wiring.fromComp,
          fromTerm: this.wiring.fromTerm,
          toComp: terminal.compId,
          toTerm: terminal.termId
        });
        this.updateLessonProgress();
      }
      this.wiring = null;
      this.hoverTerminal = null;
      this.render();
      return;
    }
    
    // 结束拖拽
    if (this.draggingComponent) {
      this.draggingComponent = null;
    }
  }

  onDoubleClick(e) {
    const pos = this.getMousePos(e);
    const component = this.findComponentAt(pos.x, pos.y);
    if (component) {
      this.rotateComponent(component);
    }
  }

  onKeyDown(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.selectedComponent) {
        this.deleteComponent(this.selectedComponent);
      } else if (this.selectedWire) {
        this.deleteWire(this.selectedWire);
      }
    }
    
    if (e.key === 'r' || e.key === 'R') {
      if (this.selectedComponent) {
        this.rotateComponent(this.selectedComponent);
      }
    }
  }

  // ========== 元件操作 ==========
  
  addComponent(type, x, y) {
    const component = createComponent(type, x, y);
    if (component) {
      this.components.push(component);
      this.selectComponent(component);
      this.render();
      this.updateLessonProgress();
      return component;
    }
    return null;
  }

  deleteComponent(component) {
    // 删除相关连线
    this.wires = this.wires.filter(w => 
      w.fromComp !== component.id && w.toComp !== component.id
    );
    
    // 删除元件
    this.components = this.components.filter(c => c.id !== component.id);
    
    if (this.selectedComponent === component) {
      this.selectedComponent = null;
      this.updatePropertiesPanel();
    }
    
    this.render();
  }

  deleteWire(wire) {
    this.wires = this.wires.filter(w => w.id !== wire.id);
    if (this.selectedWire === wire) {
      this.selectedWire = null;
    }
    this.render();
  }

  rotateComponent(component) {
    component.rotation = (component.rotation + 90) % 360;
    this.render();
  }

  selectComponent(component) {
    this.selectedComponent = component;
    this.selectedWire = null;
    this.updatePropertiesPanel();
    this.render();
  }

  selectWire(wire) {
    this.selectedWire = wire;
    this.selectedComponent = null;
    this.render();
  }

  deselectAll() {
    this.selectedComponent = null;
    this.selectedWire = null;
    this.updatePropertiesPanel();
    this.render();
  }

  // ========== 查找方法 ==========

  findComponentAt(x, y) {
    // 从后往前找（先绘制的在下面）
    for (let i = this.components.length - 1; i >= 0; i--) {
      const comp = this.components[i];
      const dx = x - comp.x;
      const dy = y - comp.y;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 20) {
        return comp;
      }
    }
    return null;
  }

  findTerminalAt(x, y) {
    for (const comp of this.components) {
      const terminals = getTerminalPositions(comp);
      for (const term of terminals) {
        const dx = x - term.x;
        const dy = y - term.y;
        if (Math.sqrt(dx*dx + dy*dy) < 8) {
          return { compId: comp.id, termId: term.id, x: term.x, y: term.y };
        }
      }
    }
    return null;
  }

  findWireAt(x, y) {
    for (const wire of this.wires) {
      const fromComp = this.components.find(c => c.id === wire.fromComp);
      const toComp = this.components.find(c => c.id === wire.toComp);
      if (!fromComp || !toComp) continue;
      
      const fromTerm = getTerminalPositions(fromComp).find(t => t.id === wire.fromTerm);
      const toTerm = getTerminalPositions(toComp).find(t => t.id === wire.toTerm);
      if (!fromTerm || !toTerm) continue;
      
      // 检查点到线段的距离
      const dist = this.pointToLineDistance(x, y, fromTerm.x, fromTerm.y, toTerm.x, toTerm.y);
      if (dist < 5) {
        return wire;
      }
    }
    return null;
  }

  pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;
    let xx, yy;
    if (param < 0) {
      xx = x1; yy = y1;
    } else if (param > 1) {
      xx = x2; yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ========== 仿真控制 ==========

  runSimulation() {
    if (this.components.length === 0) return;
    
    this.simulating = true;
    this.updateStatusBar();
    
    // 构建拓扑并分析
    this.analyzer.buildTopology(this.components, this.wires);
    const result = this.analyzer.analyzeDC();
    
    if (result) {
      this.render();
      this.updateMeasurements();
      
      // 更新LED和蜂鸣器状态
      this.components.forEach(comp => {
        if (comp.type === 'led') {
          comp.state.on = comp.state.current > 0.001;
        }
        if (comp.type === 'buzzer') {
          comp.state.on = comp.state.current > 0.01;
        }
        // 检查熔断器
        if (comp.type === 'fuse') {
          const rating = comp.properties.rating || 1;
          if (Math.abs(comp.state.current) > rating * 1.5) {
            comp.properties.blown = '熔断';
          }
        }
      });
    }
    
    this.simulating = false;
    this.updateStatusBar();
  }

  stopSimulation() {
    this.simulating = false;
    this.components.forEach(comp => {
      comp.state.voltage = 0;
      comp.state.current = 0;
      comp.state.power = 0;
      if (comp.type === 'led') comp.state.on = false;
    });
    this.render();
    this.updateMeasurements();
    this.updateStatusBar();
  }

  clearCircuit() {
    this.components = [];
    this.wires = [];
    this.selectedComponent = null;
    this.selectedWire = null;
    this.render();
    this.updatePropertiesPanel();
    this.updateMeasurements();
  }

  // ========== 渲染 ==========

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // 清空画布
    ctx.clearRect(0, 0, w, h);
    
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.scale, this.scale);
    
    // 绘制连线
    this.renderWires(ctx);
    
    // 绘制连线预览
    if (this.wiring) {
      this.renderWirePreview(ctx);
    }
    
    // 绘制元件
    this.renderComponents(ctx);
    
    ctx.restore();
  }

  renderComponents(ctx) {
    this.components.forEach(comp => {
      const isSelected = this.selectedComponent === comp;
      const lib = ComponentLibrary[comp.type];
      
      ctx.save();
      
      // 选中高亮
      if (isSelected) {
        ctx.shadowColor = '#4fc3f7';
        ctx.shadowBlur = 10;
      }
      
      // LED发光效果
      if (comp.type === 'led' && comp.state.on) {
        ctx.shadowColor = '#ffeb3b';
        ctx.shadowBlur = 20;
      }
      
      // 绘制元件符号
      const symbolFn = ComponentSymbols[comp.type];
      if (symbolFn) {
        ctx.strokeStyle = lib.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const path = symbolFn(ctx, comp.x, comp.y, comp.width, comp.height);
        if (path) {
          ctx.stroke(path);
        }
      }
      
      // 绘制端子
      const terminals = getTerminalPositions(comp);
      terminals.forEach(term => {
        ctx.beginPath();
        ctx.arc(term.x, term.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#4fc3f7';
        ctx.fill();
        ctx.strokeStyle = '#1a1d29';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      
      // 绘制标签
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#8b95a5';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      
      let label = lib.name;
      if (comp.type === 'resistor') {
        label += `\n${formatValue(comp.properties.resistance, 'Ω')}`;
      } else if (comp.type === 'dcSource') {
        label += `\n${comp.properties.voltage}V`;
      } else if (comp.type === 'capacitor') {
        label += `\n${formatValue(comp.properties.capacitance, 'F')}`;
      } else if (comp.type === 'inductor') {
        label += `\n${formatValue(comp.properties.inductance, 'H')}`;
      } else if (comp.type === 'voltmeter') {
        label += `\n${formatValue(comp.state.voltage, 'V')}`;
      } else if (comp.type === 'ammeter') {
        label += `\n${formatValue(comp.state.current, 'A')}`;
      } else if (comp.type === 'multimeter') {
        label += `\n${comp.properties.mode}`;
      } else if (comp.type === 'signalGenerator') {
        label += `\n${comp.properties.waveform}`;
      } else if (comp.type === 'zenerDiode') {
        label += `\n${comp.properties.zenerVoltage}V`;
      } else if (comp.type === 'fuse') {
        label += `\n${comp.properties.blown}`;
      } else if (comp.type === 'ground') {
        label = 'GND';
      } else if (comp.type === 'buzzer') {
        label += comp.state.on ? '\n🔊' : '';
      } else if (comp.type === 'thermistor') {
        label += `\n${comp.properties.temperature}°C`;
      } else if (comp.type === 'photoresistor') {
        label += `\n${comp.properties.lightIntensity}%`;
      } else if (comp.type === 'transformer') {
        label += `\n${comp.properties.turnsRatio}:1`;
      } else if (comp.type === 'relay') {
        label += `\n${comp.properties.state}`;
      }
      
      const lines = label.split('\n');
      lines.forEach((line, i) => {
        ctx.fillText(line, comp.x, comp.y + 35 + i * 14);
      });
      
      // 绘制电流/电压指示（仿真中）
      if (this.simulating || comp.state.current !== 0) {
        ctx.fillStyle = '#ff9800';
        ctx.font = '10px monospace';
        ctx.fillText(
          `I=${formatValue(comp.state.current, 'A')}`,
          comp.x,
          comp.y - 30
        );
      }
      
      ctx.restore();
    });
  }

  renderWires(ctx) {
    this.wires.forEach(wire => {
      const fromComp = this.components.find(c => c.id === wire.fromComp);
      const toComp = this.components.find(c => c.id === wire.toComp);
      if (!fromComp || !toComp) return;
      
      const fromTerm = getTerminalPositions(fromComp).find(t => t.id === wire.fromTerm);
      const toTerm = getTerminalPositions(toComp).find(t => t.id === wire.toTerm);
      if (!fromTerm || !toTerm) return;
      
      const isSelected = this.selectedWire === wire;
      
      ctx.beginPath();
      ctx.moveTo(fromTerm.x, fromTerm.y);
      ctx.lineTo(toTerm.x, toTerm.y);
      ctx.strokeStyle = isSelected ? '#4fc3f7' : '#8b95a5';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();
      
      // 电流流动动画
      if (this.simulating) {
        ctx.beginPath();
        ctx.moveTo(fromTerm.x, fromTerm.y);
        ctx.lineTo(toTerm.x, toTerm.y);
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -Date.now() / 50;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }

  renderWirePreview(ctx) {
    if (!this.wiring) return;
    
    ctx.beginPath();
    ctx.moveTo(this.wiring.startX, this.wiring.startY);
    ctx.lineTo(this.wiring.endX, this.wiring.endY);
    ctx.strokeStyle = this.hoverTerminal ? '#4fc3f7' : '#8b95a5';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ========== UI更新 ==========

  updatePropertiesPanel() {
    const panel = document.getElementById('properties-content');
    if (!panel) return;
    
    if (!this.selectedComponent) {
      panel.innerHTML = '<p style="color: #8b95a5; text-align: center; padding: 20px;">请选择一个元件查看属性</p>';
      return;
    }
    
    const comp = this.selectedComponent;
    const lib = ComponentLibrary[comp.type];
    
    let html = `<div class="property-group">`;
    html += `<label class="property-label">元件类型</label>`;
    html += `<input class="property-input" value="${lib.name}" readonly>`;
    html += `</div>`;
    
    for (const [key, prop] of Object.entries(lib.properties)) {
      const value = comp.properties[key];
      html += `<div class="property-group">`;
      html += `<label class="property-label">${prop.label}</label>`;
      
      if (prop.options) {
        html += `<select class="property-input" data-prop="${key}">`;
        prop.options.forEach(opt => {
          html += `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt}</option>`;
        });
        html += `</select>`;
      } else {
        html += `<input class="property-input" type="number" data-prop="${key}" value="${value}">`;
      }
      
      if (prop.unit) {
        html += `<div class="property-unit">单位: ${prop.unit}</div>`;
      }
      html += `</div>`;
    }
    
    // 仿真状态
    if (comp.state.voltage !== 0 || comp.state.current !== 0) {
      html += `<div class="property-group" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border);">`;
      html += `<label class="property-label" style="color: #4fc3f7;">仿真结果</label>`;
      html += `<div style="background: #1a1d29; padding: 10px; border-radius: 4px; font-size: 12px;">`;
      html += `<div>电压: ${formatValue(comp.state.voltage, 'V')}</div>`;
      html += `<div>电流: ${formatValue(comp.state.current, 'A')}</div>`;
      html += `<div>功率: ${formatValue(comp.state.power, 'W')}</div>`;
      html += `</div></div>`;
    }
    
    panel.innerHTML = html;
    
    // 绑定属性修改事件
    panel.querySelectorAll('.property-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const prop = e.target.dataset.prop;
        let value = e.target.value;
        if (e.target.type === 'number') {
          value = parseFloat(value);
        }
        comp.properties[prop] = value;
        
        // 开关状态改变时自动运行仿真
        if (comp.type === 'switch' && prop === 'state') {
          this.runSimulation();
        }
        
        this.render();
        this.updateLessonProgress();
      });
    });
  }

  updateMeasurements() {
    const panel = document.getElementById('measurements-content');
    if (!panel) return;
    
    let html = '';
    
    // 电源信息
    const sources = this.components.filter(c => c.type === 'dcSource');
    sources.forEach(source => {
      html += `<div class="meter-display">`;
      html += `<div class="meter-value">${source.properties.voltage.toFixed(1)}<span class="meter-unit">V</span></div>`;
      html += `<div class="meter-label">电源电压</div>`;
      html += `</div>`;
      
      if (this.simulating || source.state.current !== 0) {
        html += `<div class="meter-display">`;
        html += `<div class="meter-value">${formatValue(source.state.current, 'A')}</div>`;
        html += `<div class="meter-label">输出电流</div>`;
        html += `</div>`;
        
        html += `<div class="meter-display">`;
        html += `<div class="meter-value">${formatValue(source.state.power, 'W')}</div>`;
        html += `<div class="meter-label">输出功率</div>`;
        html += `</div>`;
      }
    });
    
    if (html === '') {
      html = '<p style="color: #8b95a5; text-align: center; padding: 20px;">添加电源后运行仿真查看测量值</p>';
    }
    
    panel.innerHTML = html;
  }

  updateStatusBar() {
    const statusText = document.getElementById('status-text');
    const statusIndicator = document.getElementById('status-indicator');
    
    if (this.simulating) {
      statusText.textContent = '仿真运行中...';
      statusIndicator.classList.add('simulating');
    } else {
      statusText.textContent = `元件: ${this.components.length} | 连线: ${this.wires.length}`;
      statusIndicator.classList.remove('simulating');
    }
  }

  updateLessonProgress() {
    if (!this.currentLesson) return;
    
    const progress = getLessonProgress(this.currentLesson, this.components, this.wires);
    this.lessonProgress = progress.percentage;
    
    const progressBar = document.getElementById('lesson-progress');
    if (progressBar) {
      progressBar.style.width = progress.percentage + '%';
      progressBar.textContent = progress.percentage + '%';
    }
    
    // 更新步骤状态
    const lesson = getLesson(this.currentLesson);
    if (lesson) {
      lesson.steps.forEach((step, index) => {
        const stepEl = document.getElementById(`step-${index}`);
        if (stepEl) {
          const completed = step.check(this.components, this.wires);
          if (completed) {
            stepEl.classList.add('completed');
          }
        }
      });
    }
  }

  loadLesson(lessonId) {
    this.currentLesson = lessonId;
    const lesson = getLesson(lessonId);
    if (!lesson) return;
    
    // 清空当前电路
    this.clearCircuit();
    
    // 更新实验指导面板
    const panel = document.getElementById('lesson-content');
    if (panel) {
      let html = `<div class="lesson-title">${lesson.title}</div>`;
      html += `<div class="lesson-text">${lesson.description}</div>`;
      
      html += `<div style="margin: 12px 0;">`;
      html += `<span class="tag">${lesson.category}</span>`;
      html += `<span class="tag tag-green">${lesson.difficulty}</span>`;
      html += `</div>`;
      
      html += `<div style="margin: 16px 0;">`;
      html += `<div style="font-size: 12px; color: #8b95a5; margin-bottom: 6px;">实验目标</div>`;
      html += `<ul style="margin-left: 16px; font-size: 13px;">`;
      lesson.objectives.forEach(obj => {
        html += `<li style="margin-bottom: 4px;">${obj}</li>`;
      });
      html += `</ul></div>`;
      
      html += `<div style="margin: 16px 0;">`;
      html += `<div style="font-size: 12px; color: #8b95a5; margin-bottom: 6px;">操作步骤</div>`;
      html += `<ul class="lesson-steps">`;
      lesson.steps.forEach((step, index) => {
        html += `<li id="step-${index}" data-step="${index + 1}">${step.text}</li>`;
      });
      html += `</ul></div>`;
      
      html += `<div style="margin: 16px 0;">`;
      html += `<div style="font-size: 12px; color: #8b95a5; margin-bottom: 6px;">学习提示</div>`;
      html += `<ul style="margin-left: 16px; font-size: 12px; color: #8b95a5;">`;
      lesson.tips.forEach(tip => {
        html += `<li style="margin-bottom: 4px;">${tip}</li>`;
      });
      html += `</ul></div>`;
      
      panel.innerHTML = html;
    }
    
    // 更新进度条
    const progressContainer = document.getElementById('lesson-progress-container');
    if (progressContainer) {
      progressContainer.innerHTML = `
        <div style="background: #1a1d29; height: 20px; border-radius: 10px; overflow: hidden;">
          <div id="lesson-progress" style="background: #4fc3f7; height: 100%; width: 0%; transition: width 0.3s; text-align: center; font-size: 11px; line-height: 20px; color: #1a1d29;">0%</div>
        </div>
      `;
    }
    
    this.updateLessonProgress();
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CircuitUI;
}
