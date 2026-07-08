/**
 * 公考 AI 学习助手 - 原生 Canvas 图表封装
 */

const Charts = {
  // 获取设备像素比
  getDPR() {
    return window.devicePixelRatio || 1;
  },

  // 设置 Canvas 高清分辨率
  setupCanvas(canvas) {
    const dpr = this.getDPR();
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height };
  },

  // ============================================
  // 环形进度图
  // ============================================
  drawRing(canvas, percent, options = {}) {
    const { ctx, width, height } = this.setupCanvas(canvas);
    const { color = '#3b82f6', bgColor = '#e5e7eb', lineWidth = 8, size = Math.min(width, height) } = options;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = (size - lineWidth) / 2 - 4;

    ctx.clearRect(0, 0, width, height);

    // 背景圆环
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = bgColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 进度圆环
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * percent / 100);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    return { centerX, centerY, radius };
  },

  // 环形图带文字
  drawRingWithText(canvas, percent, options = {}) {
    const { centerX, centerY } = this.drawRing(canvas, percent, options);
    const { ctx, width, height } = this.setupCanvas(canvas);
    const { text = `${percent}%`, subtext = '', color = '#3b82f6' } = options;

    // 主文字
    ctx.font = 'bold 28px "PingFang SC", sans-serif';
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, centerX, centerY - (subtext ? 8 : 0));

    // 副文字
    if (subtext) {
      ctx.font = '12px "PingFang SC", sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(subtext, centerX, centerY + 18);
    }
  },

  // ============================================
  // 折线图
  // ============================================
  drawLine(canvas, dataPoints, labels, options = {}) {
    const { ctx, width, height } = this.setupCanvas(canvas);
    const {
      lineColor = '#3b82f6',
      fillColor = 'rgba(59, 130, 246, 0.1)',
      pointColor = '#3b82f6',
      gridColor = '#f3f4f6',
      textColor = '#9ca3af',
      lineWidth = 2,
      padding = { top: 20, right: 15, bottom: 30, left: 35 }
    } = options;

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    if (!dataPoints || dataPoints.length === 0) return;

    const maxValue = Math.max(...dataPoints) * 1.1;
    const minValue = Math.min(...dataPoints) * 0.9;
    const valueRange = maxValue - minValue || 1;

    // 绘制网格线
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
      const y = padding.top + (chartHeight / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Y轴标签
      const value = maxValue - (valueRange / gridCount) * i;
      ctx.font = '10px sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(value), padding.left - 6, y);
    }

    // 计算坐标点
    const points = dataPoints.map((value, index) => ({
      x: padding.left + (chartWidth / (dataPoints.length - 1 || 1)) * index,
      y: padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight
    }));

    // 绘制填充区域
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // 绘制线条
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i === 0) return;
      // 贝塞尔曲线平滑
      const prev = points[i - 1];
      const cp1x = prev.x + (p.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (p.x - prev.x) / 2;
      const cp2y = p.y;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p.x, p.y);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 绘制数据点
    points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = pointColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // X轴标签
      if (labels && labels[i]) {
        ctx.font = '10px sans-serif';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(labels[i], p.x, padding.top + chartHeight + 8);
      }
    });
  },

  // ============================================
  // 横向条形图
  // ============================================
  drawBar(canvas, items, options = {}) {
    const { ctx, width, height } = this.setupCanvas(canvas);
    const {
      barHeight = 20,
      barGap = 12,
      padding = { top: 10, right: 50, bottom: 10, left: 80 },
      textColor = '#374151',
      labelColor = '#6b7280',
      strongColor = '#22c55e',
      weakColor = '#f97316'
    } = options;

    ctx.clearRect(0, 0, width, height);

    if (!items || items.length === 0) return;

    const maxValue = Math.max(...items.map(i => i.value)) * 1.1;
    const chartWidth = width - padding.left - padding.right;

    items.forEach((item, index) => {
      const y = padding.top + index * (barHeight + barGap);
      const barWidth = (item.value / maxValue) * chartWidth;
      const color = item.level === 'strong' ? strongColor :
                    item.level === 'weak' ? weakColor : '#3b82f6';

      // 标签
      ctx.font = '12px "PingFang SC", sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, padding.left - 8, y + barHeight / 2);

      // 背景条
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(padding.left, y, chartWidth, barHeight);

      // 数据条（圆角）
      this.roundRect(ctx, padding.left, y, barWidth, barHeight, 4);
      ctx.fillStyle = color;
      ctx.fill();

      // 数值
      ctx.font = '12px sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${item.value}`, padding.left + barWidth + 6, y + barHeight / 2);
    });
  },

  // ============================================
  // 雷达图
  // ============================================
  drawRadar(canvas, dimensions, options = {}) {
    const { ctx, width, height } = this.setupCanvas(canvas);
    const {
      padding = 30,
      gridColor = '#e5e7eb',
      lineColor = '#3b82f6',
      fillColor = 'rgba(59, 130, 246, 0.2)',
      textColor = '#6b7280'
    } = options;

    ctx.clearRect(0, 0, width, height);

    const keys = Object.keys(dimensions);
    const count = keys.length;
    if (count === 0) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - padding;

    // 绘制网格
    const levels = 4;
    for (let i = 1; i <= levels; i++) {
      const r = (radius / levels) * i;
      ctx.beginPath();
      for (let j = 0; j < count; j++) {
        const angle = (Math.PI * 2 / count) * j - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 绘制轴线
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = gridColor;
      ctx.stroke();

      // 标签
      const labelX = centerX + Math.cos(angle) * (radius + 18);
      const labelY = centerY + Math.sin(angle) * (radius + 18);
      ctx.font = '11px "PingFang SC", sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(keys[i], labelX, labelY);
    }

    // 绘制数据区域
    const values = keys.map(k => dimensions[k]);
    const maxValue = 100;

    ctx.beginPath();
    values.forEach((value, i) => {
      const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
      const r = (value / maxValue) * radius;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 数据点
    values.forEach((value, i) => {
      const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
      const r = (value / maxValue) * radius;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  },

  // ============================================
  // 柱状图（简单）
  // ============================================
  drawColumn(canvas, data, options = {}) {
    const { ctx, width, height } = this.setupCanvas(canvas);
    const {
      barColor = '#3b82f6',
      padding = { top: 20, right: 10, bottom: 30, left: 10 },
      textColor = '#9ca3af'
    } = options;

    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) return;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = (chartWidth / data.length) * 0.6;
    const gap = (chartWidth / data.length) * 0.4;

    data.forEach((item, index) => {
      const x = padding.left + index * (barWidth + gap) + gap / 2;
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      // 柱子
      this.roundRect(ctx, x, y, barWidth, barHeight, 4);
      ctx.fillStyle = barColor;
      ctx.fill();

      // 标签
      ctx.font = '10px sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(item.label, x + barWidth / 2, padding.top + chartHeight + 6);

      // 数值
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#374151';
      ctx.textBaseline = 'bottom';
      ctx.fillText(item.value, x + barWidth / 2, y - 4);
    });
  },

  // ============================================
  // 日历热图
  // ============================================
  drawHeatmap(canvas, daysData, options = {}) {
    const { ctx, width, height } = this.setupCanvas(canvas);
    const {
      cellSize = 14,
      cellGap = 3,
      colors = ['#e5e7eb', '#dbeafe', '#93c5fd', '#3b82f6', '#1e3a8a'],
      padding = { top: 10, left: 30 }
    } = options;

    ctx.clearRect(0, 0, width, height);

    const cols = 7; // 一周7天
    const rows = Math.ceil(daysData.length / cols);

    daysData.forEach((day, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = padding.left + col * (cellSize + cellGap);
      const y = padding.top + row * (cellSize + cellGap);

      const colorIndex = Math.min(day.intensity, colors.length - 1);

      ctx.fillStyle = colors[colorIndex];
      ctx.fillRect(x, y, cellSize, cellSize);

      // 如果是今天，画边框
      if (day.isToday) {
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 1, y - 1, cellSize + 2, cellSize + 2);
      }
    });

    // 星期标签
    const weekLabels = ['一', '二', '三', '四', '五', '六', '日'];
    weekLabels.forEach((label, i) => {
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.fillText(label, padding.left + i * (cellSize + cellGap) + cellSize / 2, padding.top - 4);
    });
  },

  // ============================================
  // 辅助：圆角矩形
  // ============================================
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
};
