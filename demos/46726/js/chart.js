/* ============================================================
   错题闯关 · 轻量图表库
   使用 Canvas 绘制雷达图和折线图，无外部依赖
   ============================================================ */

// ---------- 雷达图 ----------
function drawRadar(canvasId, labels, values) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;
  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.min(W, H) / 2 - 35;
  const n = labels.length;
  const levels = 5;

  ctx.clearRect(0, 0, W, H);

  // 绘制网格
  for (let lv = 1; lv <= levels; lv++) {
    const r = (radius * lv) / levels;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = lv === levels ? 'rgba(102, 126, 234, 0.25)' : 'rgba(226, 232, 240, 0.8)';
    ctx.lineWidth = lv === levels ? 1.5 : 1;
    ctx.stroke();
  }

  // 绘制轴线
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 绘制数据区域
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const v = Math.min(100, Math.max(0, values[i]));
    const r = (radius * v) / 100;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, 'rgba(102, 126, 234, 0.45)');
  grad.addColorStop(1, 'rgba(118, 75, 162, 0.25)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 绘制数据点
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const v = Math.min(100, Math.max(0, values[i]));
    const r = (radius * v) / 100;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#667eea';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  // 绘制标签
  ctx.font = '11px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#4a5568';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + (radius + 18) * Math.cos(angle);
    const y = cy + (radius + 18) * Math.sin(angle);
    ctx.fillText(labels[i], x, y);
  }
}

// ---------- 折线图 ----------
function drawTrendChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;
  const padding = { top: 20, right: 15, bottom: 25, left: 30 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  ctx.clearRect(0, 0, W, H);

  const maxVal = Math.max(...data.map(d => d.count), 5);
  const step = chartH / Math.ceil(maxVal);

  // 绘制 Y 轴参考线
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= maxVal; i += Math.ceil(maxVal / 4)) {
    const y = padding.top + chartH - i * step;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(W - padding.right, y);
    ctx.stroke();
    // Y 轴标签
    ctx.fillStyle = '#a0aec0';
    ctx.font = '9px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(i, padding.left - 5, y);
  }

  // 绘制柱状图（答题数）
  const barW = chartW / data.length * 0.5;
  data.forEach((d, i) => {
    const x = padding.left + (chartW / data.length) * (i + 0.5) - barW / 2;
    const h = d.count * step;
    const y = padding.top + chartH - h;

    const bg = ctx.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
    bg.addColorStop(1, 'rgba(118, 75, 162, 0.5)');
    ctx.fillStyle = bg;

    // 圆角矩形
    const r = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  });

  // 绘制正确率折线
  ctx.strokeStyle = '#f5576c';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  data.forEach((d, i) => {
    const rate = d.count > 0 ? d.correct / d.count : 0;
    const x = padding.left + (chartW / data.length) * (i + 0.5);
    const y = padding.top + chartH - rate * maxVal * step;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // 绘制折线点
  data.forEach((d, i) => {
    const rate = d.count > 0 ? d.correct / d.count : 0;
    const x = padding.left + (chartW / data.length) * (i + 0.5);
    const y = padding.top + chartH - rate * maxVal * step;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f5576c';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  });

  // 绘制 X 轴标签
  ctx.fillStyle = '#4a5568';
  ctx.font = '10px -apple-system, "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  data.forEach((d, i) => {
    const x = padding.left + (chartW / data.length) * (i + 0.5);
    const y = H - padding.bottom + 8;
    ctx.fillText(d.day, x, y);
  });
}
