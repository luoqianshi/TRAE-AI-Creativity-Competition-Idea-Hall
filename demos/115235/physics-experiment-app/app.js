// ============================================================
// 初中物理实验 - 光学实验基础篇 App
// ============================================================

// ==================== 导航系统 ====================
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  if (page === 'home') {
    document.getElementById('page-home').classList.add('active');
  } else if (page === 'reflection') {
    document.getElementById('page-reflection').classList.add('active');
    reflection.init();
  } else if (page === 'mirror') {
    document.getElementById('page-mirror').classList.add('active');
    mirror.init();
  }
}

// ==================== 结果弹窗 ====================
function showResult(data) {
  const modal = document.getElementById('result-modal');
  const body = document.getElementById('result-body');
  let grade = '差';
  let gradeColor = '#FF6B6B';
  if (data.total >= 90) { grade = '优'; gradeColor = '#FFD700'; }
  else if (data.total >= 75) { grade = '良'; gradeColor = '#50C878'; }
  else if (data.total >= 60) { grade = '中'; gradeColor = '#4A90D9'; }

  let html = '<div class="result-score">';
  html += `<span class="score-number">${data.total}</span>`;
  html += `<span class="score-grade" style="color:${gradeColor}">${grade}</span>`;
  html += '<div class="score-label">总分 / 100</div></div>';

  data.items.forEach(item => {
    html += `<div class="result-item ${item.pass ? 'pass' : 'fail'}">`;
    html += `<h4>${item.pass ? '✅' : '❌'} ${item.name}：${item.score}/${item.max}</h4>`;
    html += '<ul class="result-detail">';
    item.details.forEach(d => html += `<li>${d}</li>`);
    html += '</ul></div>';
  });

  body.innerHTML = html;
  modal.classList.remove('hidden');
}

function closeResult() {
  document.getElementById('result-modal').classList.add('hidden');
}

// ==================== Canvas 工具 ====================
function setupCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = rect.width;
  const h = rect.height;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { canvas, ctx, w, h };
}

function drawArrow(ctx, x, y, dx, dy, color) {
  const angle = Math.atan2(dy, dx);
  const headLen = 10;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - headLen * Math.cos(angle - 0.4), y - headLen * Math.sin(angle - 0.4));
  ctx.lineTo(x - headLen * Math.cos(angle + 0.4), y - headLen * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ============================================================
// 实验一：光的反射定律
// ============================================================
const reflection = {
  step: 1,
  currentAngle: 30,
  measuredAngle: null,
  records: [],
  maxRecords: 3,
  ready: false,
  mirrorPlaced: false,
  firstMeasureClick: true,

  init() {
    this.step = 1;
    this.currentAngle = 30;
    this.measuredAngle = null;
    this.records = [];
    this.mirrorPlaced = false;
    this.firstMeasureClick = true;
    document.getElementById('ref-angle-slider').value = 30;
    document.getElementById('ref-angle-display').textContent = '30';
    document.getElementById('ref-judge-btn').disabled = true;
    document.getElementById('ref-measure-btn').textContent = '📐 放置平面镜';
    this.updateStepUI();
    this.setHint('点击「放置平面镜」按钮开始实验');
    this.resetDataTable();
    setTimeout(() => {
      const r = setupCanvas('reflectionCanvas');
      if (r) {
        this.canvasW = r.w;
        this.canvasH = r.h;
        this.ctx = r.ctx;
        this.ready = true;
        this.drawReflection();
      }
      document.getElementById('ref-angle-slider').oninput = (e) => {
        this.currentAngle = parseInt(e.target.value);
        document.getElementById('ref-angle-display').textContent = this.currentAngle;
        if (this.step >= 2) this.drawReflection();
      };
    }, 100);
  },

  drawReflection() {
    if (!this.ready) return;
    const ctx = this.ctx;
    const w = this.canvasW;
    const h = this.canvasH;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const mirrorY = h * 0.78;
    const topY = h * 0.08;
    const rayLen = (mirrorY - topY) * 0.85;

    // 背景网格
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, mirrorY); ctx.stroke(); }
    for (let y = 0; y <= mirrorY; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // 平面镜
    ctx.save();
    const mirrorW = w * 0.8;
    ctx.fillStyle = '#B0BEC5';
    ctx.fillRect(cx - mirrorW/2, mirrorY - 2, mirrorW, 4);
    ctx.strokeStyle = '#78909C';
    ctx.lineWidth = 1;
    for (let x = cx - mirrorW/2 + 10; x < cx + mirrorW/2; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, mirrorY - 6); ctx.lineTo(x + 8, mirrorY + 2); ctx.stroke();
    }
    ctx.fillStyle = '#78909C';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('平面镜', cx, mirrorY + 18);
    ctx.restore();

    // 法线
    ctx.save();
    ctx.strokeStyle = '#90A4AE';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(cx, mirrorY); ctx.lineTo(cx, topY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#90A4AE';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('法线', cx, topY + 16);
    ctx.restore();

    const angleRad = this.currentAngle * Math.PI / 180;
    const incX = cx - Math.sin(angleRad) * rayLen;
    const incY = mirrorY - Math.cos(angleRad) * rayLen;
    const refX = cx + Math.sin(angleRad) * rayLen;
    const refY = mirrorY - Math.cos(angleRad) * rayLen;

    // 入射光线
    ctx.save();
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, mirrorY); ctx.lineTo(incX, incY); ctx.stroke();
    drawArrow(ctx, cx - Math.sin(angleRad) * rayLen * 0.5, mirrorY - Math.cos(angleRad) * rayLen * 0.5, -Math.sin(angleRad), -Math.cos(angleRad), '#FF6B6B');
    ctx.fillStyle = '#FF6B6B';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('入射光线', incX - 10, incY + 4);
    ctx.restore();

    // 反射光线
    ctx.save();
    ctx.strokeStyle = '#4A90D9';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, mirrorY); ctx.lineTo(refX, refY); ctx.stroke();
    drawArrow(ctx, cx + Math.sin(angleRad) * rayLen * 0.5, mirrorY - Math.cos(angleRad) * rayLen * 0.5, Math.sin(angleRad), -Math.cos(angleRad), '#4A90D9');
    ctx.fillStyle = '#4A90D9';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('反射光线', refX + 10, refY + 4);
    ctx.restore();

    // 入射角弧
    ctx.save();
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 1.5;
    const arcR = 35;
    ctx.beginPath(); ctx.arc(cx, mirrorY, arcR, -Math.PI/2, -(Math.PI/2 + angleRad)); ctx.stroke();
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    const la = -(Math.PI/2 + angleRad/2);
    ctx.fillText(`i = ${this.currentAngle}°`, cx + Math.cos(la) * (arcR + 18), mirrorY + Math.sin(la) * (arcR + 18) + 4);
    ctx.restore();

    // 反射角弧
    ctx.save();
    ctx.strokeStyle = '#4A90D9';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, mirrorY, arcR, -Math.PI/2, -(Math.PI/2 - angleRad)); ctx.stroke();
    ctx.fillStyle = '#4A90D9';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    const la2 = -(Math.PI/2 - angleRad/2);
    ctx.fillText(`r = ${this.currentAngle}°`, cx + Math.cos(la2) * (arcR + 18), mirrorY + Math.sin(la2) * (arcR + 18) + 4);
    ctx.restore();

    // 入射点
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(cx, mirrorY, 4, 0, 2 * Math.PI); ctx.fill();

    // 激光笔
    if (this.step >= 2) {
      ctx.save();
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔦', incX, incY - 8);
      ctx.restore();
    }

    // 量角器测量值
    if (this.measuredAngle !== null) {
      ctx.save();
      ctx.strokeStyle = '#FF9800';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(cx, mirrorY, 50, -Math.PI/2, -(Math.PI/2 + this.measuredAngle * Math.PI / 180)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#FF9800';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`测量: ${this.measuredAngle}°`, cx - 30, mirrorY - 60);
      ctx.restore();
    }
  },

  updateStepUI() {
    document.querySelectorAll('#ref-step-guide .step-item').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.remove('active', 'done');
      if (s < this.step) el.classList.add('done');
      else if (s === this.step) el.classList.add('active');
    });
    document.getElementById('ref-step-indicator').textContent = `步骤 ${this.step}/6`;
  },

  setHint(text) {
    document.getElementById('ref-hint-text').textContent = text;
  },

  setStep(s) {
    this.step = s;
    this.updateStepUI();
  },

  advanceStep() {
    if (this.step < 6) { this.step++; this.updateStepUI(); }
  },

  handleMeasure() {
    // 首次点击 = 放置平面镜
    if (this.firstMeasureClick) {
      this.firstMeasureClick = false;
      this.mirrorPlaced = true;
      this.setHint('✅ 平面镜已放置！请调整激光笔改变入射角');
      this.drawReflection();
      if (this.step === 1) this.advanceStep();
      document.getElementById('ref-measure-btn').textContent = '📐 测量角度';
      return;
    }

    // 后续点击 = 测量角度
    if (this.step < 2) {
      this.setHint('⚠️ 请先放置平面镜');
      return;
    }
    this.measuredAngle = this.currentAngle;
    this.drawReflection();
    this.setHint(`✅ 测量完成！入射角 = ${this.currentAngle}°，反射角 = ${this.currentAngle}°。点击「记录数据」保存`);
    if (this.step === 2 || this.step === 3) this.advanceStep();
  },

  handleRecord() {
    if (this.records.length >= this.maxRecords) {
      this.setHint('⚠️ 已记录3组数据，可以提交判断了！');
      return;
    }
    if (!this.measuredAngle) {
      this.setHint('⚠️ 请先测量角度！');
      return;
    }

    const idx = this.records.length;
    const measuredR = this.currentAngle + (Math.random() - 0.5) * 2;
    const record = { i: this.currentAngle, r: Math.round(measuredR * 10) / 10 };
    this.records.push(record);

    document.getElementById(`ref-i${idx+1}`).textContent = record.i;
    document.getElementById(`ref-r${idx+1}`).textContent = record.r;
    document.querySelector(`#ref-data-body tr:nth-child(${idx+1}) td:nth-child(4)`).textContent = Math.abs(record.i - record.r).toFixed(1);
    document.querySelector(`#ref-data-body tr:nth-child(${idx+1}) td:nth-child(5)`).textContent = '✅';

    this.setHint(`✅ 第${idx+1}组数据已记录！`);

    if (this.records.length < this.maxRecords) {
      const nextAngles = [45, 60, 15, 25, 50];
      this.currentAngle = nextAngles[idx];
      document.getElementById('ref-angle-slider').value = this.currentAngle;
      document.getElementById('ref-angle-display').textContent = this.currentAngle;
      this.measuredAngle = null;
      this.drawReflection();
      this.setHint(`🔄 请将入射角调整为 ${this.currentAngle}°，然后再次测量并记录`);
      if (this.step <= 4) this.advanceStep();
    } else {
      document.getElementById('ref-judge-btn').disabled = false;
      this.setStep(6);
      this.setHint('✅ 所有数据已记录！点击「提交判断」查看实验结果');
    }
  },

  handleJudge() {
    if (this.records.length < this.maxRecords) {
      this.setHint(`⚠️ 请先完成${this.maxRecords}组数据记录`);
      return;
    }

    let operScore = 0;
    let operDetails = [];
    let dataScore = 0;
    let dataDetails = [];
    let conclScore = 0;
    let conclDetails = [];

    // 操作判断 (40分)
    if (this.mirrorPlaced) { operScore += 10; operDetails.push('✅ 正确放置了平面镜'); }
    else { operDetails.push('❌ 未放置平面镜'); }

    if (this.measuredAngle !== null) { operScore += 10; operDetails.push('✅ 使用量角器测量了角度'); }
    else { operDetails.push('❌ 未测量角度'); }

    if (this.records.length >= 3) { operScore += 10; operDetails.push('✅ 完成了3组数据记录'); }
    else { operDetails.push('❌ 数据记录不完整'); }

    operScore += 10; operDetails.push('✅ 操作步骤规范正确');

    // 数据判断 (30分)
    let dataCorrectCount = 0;
    this.records.forEach((r, i) => {
      const diff = Math.abs(r.i - r.r);
      if (diff <= 2) {
        dataCorrectCount++;
        dataDetails.push(`✅ 第${i+1}组：|${r.i}° - ${r.r}°| = ${diff.toFixed(1)}° ≤ 2° ✓`);
      } else {
        dataDetails.push(`❌ 第${i+1}组：|${r.i}° - ${r.r}°| = ${diff.toFixed(1)}° > 2° ✗`);
      }
    });
    dataScore = Math.round((dataCorrectCount / this.maxRecords) * 30);

    // 结论判断 (30分)
    const allCorrect = this.records.every(r => Math.abs(r.i - r.r) <= 2);
    if (allCorrect) {
      conclScore = 30;
      conclDetails.push('✅ 反射角等于入射角（正确）');
      conclDetails.push('✅ 反射光线、入射光线分居法线两侧（正确）');
      conclDetails.push('✅ 三线共面（反射光线、入射光线和法线在同一平面内）');
    } else {
      conclScore = 15;
      conclDetails.push('⚠️ 部分数据偏差较大，结论不够准确');
      conclDetails.push('💡 提示：反射角应等于入射角');
    }

    const total = operScore + dataScore + conclScore;
    showResult({
      total,
      items: [
        { name: '操作判断', score: operScore, max: 40, pass: operScore >= 30, details: operDetails },
        { name: '数据判断', score: dataScore, max: 30, pass: dataScore >= 20, details: dataDetails },
        { name: '结论判断', score: conclScore, max: 30, pass: conclScore >= 20, details: conclDetails }
      ]
    });
  },

  resetDataTable() {
    for (let i = 1; i <= 3; i++) {
      document.getElementById(`ref-i${i}`).textContent = '-';
      document.getElementById(`ref-r${i}`).textContent = '-';
      const tr = document.querySelector(`#ref-data-body tr:nth-child(${i})`);
      if (tr) { tr.children[3].textContent = '-'; tr.children[4].textContent = '⏳'; }
    }
  }
};

// ============================================================
// 实验二：平面镜成像特点
// ============================================================
const mirror = {
  step: 1,
  objectPos: 3.0,
  candleBPlaced: false,
  candleBX: 0,
  measured: false,
  records: [],
  maxRecords: 3,
  ready: false,
  mirrorPlaced: false,
  firstPlaceClick: true,

  init() {
    this.step = 1;
    this.objectPos = 3.0;
    this.candleBPlaced = false;
    this.measured = false;
    this.records = [];
    this.mirrorPlaced = false;
    this.firstPlaceClick = true;
    document.getElementById('mir-pos-slider').value = 3;
    document.getElementById('mir-pos-display').textContent = '3.0';
    document.getElementById('mir-judge-btn').disabled = true;
    document.getElementById('mir-place-btn').textContent = '📐 放置平面镜';
    this.updateStepUI();
    this.setHint('点击「放置平面镜」开始实验');
    this.resetDataTable();
    setTimeout(() => {
      const r = setupCanvas('mirrorCanvas');
      if (r) {
        this.canvasW = r.w;
        this.canvasH = r.h;
        this.ctx = r.ctx;
        this.ready = true;
        this.drawMirror();
      }
      document.getElementById('mir-pos-slider').oninput = (e) => {
        this.objectPos = parseFloat(e.target.value);
        document.getElementById('mir-pos-display').textContent = this.objectPos.toFixed(1);
        if (this.step >= 2) this.drawMirror();
      };
    }, 100);
  },

  drawMirror() {
    if (!this.ready) return;
    const ctx = this.ctx;
    const w = this.canvasW;
    const h = this.canvasH;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const mirrorTop = h * 0.1;
    const mirrorBottom = h * 0.82;
    const mirrorH = mirrorBottom - mirrorTop;
    const midY = mirrorTop + mirrorH / 2;

    // 背景网格
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // 白纸背景
    ctx.save();
    ctx.fillStyle = '#FFFDE7';
    ctx.fillRect(20, mirrorTop - 10, w - 40, mirrorH + 20);
    ctx.restore();

    // 平面镜
    ctx.save();
    const mirrorW = 6;
    const grad = ctx.createLinearGradient(cx - mirrorW/2, 0, cx + mirrorW/2, 0);
    grad.addColorStop(0, '#BBDEFB');
    grad.addColorStop(0.3, '#E3F2FD');
    grad.addColorStop(0.7, '#E3F2FD');
    grad.addColorStop(1, '#BBDEFB');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - mirrorW/2, mirrorTop, mirrorW, mirrorH);
    ctx.fillStyle = '#1565C0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('平面镜', cx, mirrorBottom + 18);
    ctx.restore();

    // 刻度尺
    ctx.save();
    ctx.strokeStyle = '#78909C';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#78909C';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let d = 0; d <= 8; d += 1) {
      const x1 = cx - d * 40; if (x1 >= 20) { ctx.beginPath(); ctx.moveTo(x1, mirrorBottom + 6); ctx.lineTo(x1, mirrorBottom + 14); ctx.stroke(); ctx.fillText(d + '', x1, mirrorBottom + 26); }
      const x2 = cx + d * 40; if (x2 <= w - 20) { ctx.beginPath(); ctx.moveTo(x2, mirrorBottom + 6); ctx.lineTo(x2, mirrorBottom + 14); ctx.stroke(); ctx.fillText(d + '', x2, mirrorBottom + 26); }
    }
    ctx.fillText('0', cx, mirrorBottom + 26);
    ctx.fillText('cm', w - 30, mirrorBottom + 26);
    ctx.restore();

    const objX = cx - this.objectPos * 40;

    // 蜡烛A
    if (this.step >= 2) {
      this.drawCandle(ctx, objX, midY, '#FF6B6B', '蜡烛A');
    }

    // 虚像
    if (this.step >= 3) {
      const imgX = cx + this.objectPos * 40;
      this.drawCandle(ctx, imgX, midY, 'rgba(255,107,107,0.3)', '虚像', true);
      ctx.save();
      ctx.strokeStyle = 'rgba(255,107,107,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(objX, midY); ctx.lineTo(imgX, midY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 蜡烛B
    if (this.candleBPlaced) {
      this.drawCandle(ctx, this.candleBX, midY, '#50C878', '蜡烛B');
    }

    // 距离标注
    if (this.measured) {
      ctx.save();
      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(objX, midY + 40); ctx.lineTo(cx, midY + 40); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#FF6B6B';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`物距 = ${this.objectPos.toFixed(1)}cm`, (objX + cx) / 2, midY + 56);

      if (this.candleBPlaced) {
        const imgX = cx + this.objectPos * 40;
        ctx.strokeStyle = '#4A90D9';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(cx, midY + 40); ctx.lineTo(imgX, midY + 40); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#4A90D9';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`像距 = ${this.objectPos.toFixed(1)}cm`, (cx + imgX) / 2, midY + 56);
      }
      ctx.restore();
    }
  },

  drawCandle(ctx, x, y, color, label, isVirtual) {
    ctx.save();
    const candleW = 14;
    const candleH = 40;
    const baseY = y + candleH / 2;
    if (isVirtual) ctx.globalAlpha = 0.5;

    ctx.fillStyle = color;
    ctx.fillRect(x - candleW/2, baseY - candleH, candleW, candleH);

    if (!isVirtual) {
      // 火焰
      ctx.fillStyle = '#FF9800';
      ctx.beginPath(); ctx.ellipse(x, baseY - candleH - 10, 5, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath(); ctx.ellipse(x, baseY - candleH - 8, 3, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,152,0,0.15)';
      ctx.beginPath(); ctx.arc(x, baseY - candleH - 10, 20, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = isVirtual ? '#999' : '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, baseY + 18);

    if (isVirtual) {
      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - candleW/2 - 2, baseY - candleH - 2, candleW + 4, candleH + 4);
      ctx.setLineDash([]);
    }
    ctx.restore();
  },

  updateStepUI() {
    document.querySelectorAll('#mir-step-guide .step-item').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.remove('active', 'done');
      if (s < this.step) el.classList.add('done');
      else if (s === this.step) el.classList.add('active');
    });
    document.getElementById('mir-step-indicator').textContent = `步骤 ${this.step}/7`;
  },

  setHint(text) {
    document.getElementById('mir-hint-text').textContent = text;
  },

  setStep(s) {
    this.step = s;
    this.updateStepUI();
  },

  advanceStep() {
    if (this.step < 7) { this.step++; this.updateStepUI(); }
  },

  handlePlace() {
    // 首次点击 = 放置平面镜
    if (this.firstPlaceClick) {
      this.firstPlaceClick = false;
      this.mirrorPlaced = true;
      this.setHint('✅ 平面镜已放置！🕯️ 蜡烛A已放置，请观察虚像');
      this.drawMirror();
      this.advanceStep(); // 步骤1→2
      setTimeout(() => {
        if (this.step === 2) {
          this.advanceStep(); // 步骤2→3
          this.drawMirror();
          this.setHint('👆 请点击「放置蜡烛B」将蜡烛B放在虚像位置');
        }
      }, 500);
      document.getElementById('mir-place-btn').textContent = '🕯️ 放置蜡烛B';
      return;
    }

    // 后续点击 = 放置蜡烛B
    if (this.step < 3) {
      this.setHint('⚠️ 请先观察虚像');
      return;
    }
    this.candleBX = this.canvasW / 2 + this.objectPos * 40;
    this.candleBPlaced = true;
    this.drawMirror();
    this.setHint('✅ 蜡烛B已放置在虚像位置！观察B是否与虚像完全重合。点击「测量距离」');
    if (this.step === 4) this.advanceStep();
  },

  handleMeasure() {
    if (!this.candleBPlaced) {
      this.setHint('⚠️ 请先放置蜡烛B');
      return;
    }
    this.measured = true;
    this.drawMirror();
    this.setHint(`📏 测量完成！物距 = ${this.objectPos.toFixed(1)}cm，像距 = ${this.objectPos.toFixed(1)}cm，像与物等大`);
    if (this.step <= 5) this.advanceStep();
  },

  handleRecord() {
    if (!this.measured) {
      this.setHint('⚠️ 请先测量距离');
      return;
    }
    if (this.records.length >= this.maxRecords) {
      this.setHint('⚠️ 已记录3组数据，可以提交判断了！');
      return;
    }

    const idx = this.records.length;
    const measuredV = this.objectPos + (Math.random() - 0.5) * 0.3;
    const record = { u: this.objectPos, v: Math.round(measuredV * 10) / 10 };
    this.records.push(record);

    document.getElementById(`mir-u${idx+1}`).textContent = record.u.toFixed(1);
    document.getElementById(`mir-v${idx+1}`).textContent = record.v.toFixed(1);
    document.querySelector(`#mir-data-body tr:nth-child(${idx+1}) td:nth-child(5)`).textContent = '✅';

    this.setHint(`✅ 第${idx+1}组数据已记录！`);

    if (this.records.length < this.maxRecords) {
      const nextPos = [2.0, 4.5, 1.5, 5.0][this.records.length];
      this.objectPos = nextPos;
      document.getElementById('mir-pos-slider').value = nextPos;
      document.getElementById('mir-pos-display').textContent = nextPos.toFixed(1);
      this.measured = false;
      this.candleBPlaced = false;
      this.drawMirror();
      this.setHint(`🔄 请将蜡烛A移动到 ${nextPos.toFixed(1)}cm 处，重新观察并放置蜡烛B`);
      if (this.step <= 6) this.advanceStep();
    } else {
      document.getElementById('mir-judge-btn').disabled = false;
      this.setStep(7);
      this.setHint('✅ 所有数据已记录！点击「提交判断」查看实验结果');
    }
  },

  handleJudge() {
    if (this.records.length < this.maxRecords) {
      this.setHint(`⚠️ 请先完成${this.maxRecords}组数据记录`);
      return;
    }

    let operScore = 0;
    let operDetails = [];
    let dataScore = 0;
    let dataDetails = [];
    let conclScore = 0;
    let conclDetails = [];

    // 操作判断 (40分)
    if (this.mirrorPlaced) { operScore += 10; operDetails.push('✅ 正确放置了平面镜'); }
    else { operDetails.push('❌ 未放置平面镜'); }
    if (this.candleBPlaced) { operScore += 10; operDetails.push('✅ 将蜡烛B与像的位置重合'); }
    operScore += 10; operDetails.push('✅ 使用刻度尺测量了物距和像距');
    if (this.records.length >= 3) { operScore += 10; operDetails.push('✅ 完成了3组数据记录'); }

    // 数据判断 (30分)
    let dataCorrectCount = 0;
    this.records.forEach((r, i) => {
      const diff = Math.abs(r.u - r.v);
      if (diff <= 0.5) {
        dataCorrectCount++;
        dataDetails.push(`✅ 第${i+1}组：|${r.u.toFixed(1)} - ${r.v.toFixed(1)}| = ${diff.toFixed(1)}cm ≤ 0.5cm ✓`);
      } else {
        dataDetails.push(`❌ 第${i+1}组：|${r.u.toFixed(1)} - ${r.v.toFixed(1)}| = ${diff.toFixed(1)}cm > 0.5cm ✗`);
      }
    });
    dataScore = Math.round((dataCorrectCount / this.maxRecords) * 30);

    // 结论判断 (30分)
    const allCorrect = this.records.every(r => Math.abs(r.u - r.v) <= 0.5);
    if (allCorrect) {
      conclScore = 30;
      conclDetails.push('✅ 像与物大小相等（正确）');
      conclDetails.push('✅ 像距等于物距（正确）');
      conclDetails.push('✅ 平面镜成虚像（正确）');
    } else {
      conclScore = 15;
      conclDetails.push('⚠️ 部分数据偏差较大');
      conclDetails.push('💡 提示：平面镜成像时，像距应等于物距，像与物等大');
    }

    const total = operScore + dataScore + conclScore;
    showResult({
      total,
      items: [
        { name: '操作判断', score: operScore, max: 40, pass: operScore >= 30, details: operDetails },
        { name: '数据判断', score: dataScore, max: 30, pass: dataScore >= 20, details: dataDetails },
        { name: '结论判断', score: conclScore, max: 30, pass: conclScore >= 20, details: conclDetails }
      ]
    });
  },

  resetDataTable() {
    for (let i = 1; i <= 3; i++) {
      document.getElementById(`mir-u${i}`).textContent = '-';
      document.getElementById(`mir-v${i}`).textContent = '-';
      const tr = document.querySelector(`#mir-data-body tr:nth-child(${i})`);
      if (tr) tr.children[4].textContent = '⏳';
    }
  }
};

// ==================== 事件绑定 ====================
document.addEventListener('DOMContentLoaded', () => {
  // 实验一按钮
  document.getElementById('ref-measure-btn').addEventListener('click', () => reflection.handleMeasure());
  document.getElementById('ref-record-btn').addEventListener('click', () => reflection.handleRecord());
  document.getElementById('ref-judge-btn').addEventListener('click', () => reflection.handleJudge());

  // 实验二按钮
  document.getElementById('mir-place-btn').addEventListener('click', () => mirror.handlePlace());
  document.getElementById('mir-measure-btn').addEventListener('click', () => mirror.handleMeasure());
  document.getElementById('mir-record-btn').addEventListener('click', () => mirror.handleRecord());
  document.getElementById('mir-judge-btn').addEventListener('click', () => mirror.handleJudge());

  // 窗口大小变化时重绘
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (document.getElementById('page-reflection').classList.contains('active')) {
        const r = setupCanvas('reflectionCanvas');
        if (r) { reflection.ctx = r.ctx; reflection.canvasW = r.w; reflection.canvasH = r.h; reflection.drawReflection(); }
      }
      if (document.getElementById('page-mirror').classList.contains('active')) {
        const r = setupCanvas('mirrorCanvas');
        if (r) { mirror.ctx = r.ctx; mirror.canvasW = r.w; mirror.canvasH = r.h; mirror.drawMirror(); }
      }
    }, 200);
  });
});