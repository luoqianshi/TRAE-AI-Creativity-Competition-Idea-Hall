// ========== 雷达图绘制 ==========
function drawRadarChart(scores) {
  const canvas = document.getElementById('radarCanvas');
  const container = canvas.parentElement;
  const ctx = canvas.getContext('2d');

  // 响应式：检测容器宽度，按 devicePixelRatio 设置 canvas 尺寸
  const dpr = window.devicePixelRatio || 1;
  const containerWidth = container.clientWidth;
  const logicalSize = Math.min(containerWidth, 420);
  canvas.width = logicalSize * dpr;
  canvas.height = logicalSize * dpr;
  canvas.style.width = logicalSize + 'px';
  canvas.style.height = logicalSize + 'px';
  ctx.scale(dpr, dpr);

  const W = logicalSize;
  const H = logicalSize;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) / 2 - 50;
  const labels = ['R 实用型', 'I 研究型', 'A 艺术型', 'S 社会型', 'E 企业型', 'C 常规型'];
  const types = ['R', 'I', 'A', 'S', 'E', 'C'];
  const n = 6;

  const maxScore = 7;
  const values = types.map(t => Math.min(scores[t] / maxScore, 1));

  // 入场动画：使用 requestAnimationFrame 实现从中心向外展开（0.8秒）
  const duration = 800; // 毫秒
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // 使用 easeOutCubic 缓动函数
    const eased = 1 - Math.pow(1 - progress, 3);

    ctx.clearRect(0, 0, W, H);

    // 绘制四层同心圆及刻度标注
    for (let ring = 1; ring <= 4; ring++) {
      const r = R * ring / 4;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(78, 70, 220, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 刻度标注（25%/50%/75%/100%）
      const percentLabel = (ring * 25) + '%';
      ctx.fillStyle = 'rgba(78, 70, 220, 0.35)';
      ctx.font = '400 11px -apple-system, "PingFang SC", "Helvetica Neue", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(percentLabel, cx + 4, cy - r - 2);
    }

    // 绘制轴线
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
      ctx.strokeStyle = 'rgba(78, 70, 220, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 绘制数据区域（带动画）
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
      const r = R * Math.max(values[idx], 0.05) * eased;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(78, 70, 220, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#4E46DC';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 绘制数据点
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      const r = R * Math.max(values[i], 0.05) * eased;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#4E46DC';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 绘制标签和分数
    ctx.fillStyle = '#1A1830';
    ctx.font = '600 14px -apple-system, "PingFang SC", "Helvetica Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      const lr = R + 32;
      const x = cx + lr * Math.cos(angle);
      const y = cy + lr * Math.sin(angle);
      ctx.fillText(labels[i], x, y);
      ctx.font = '400 12px -apple-system, "PingFang SC", "Helvetica Neue", sans-serif';
      ctx.fillStyle = '#4E46DC';
      ctx.fillText(scores[types[i]] + '/' + maxScore, x, y + 18);
      ctx.font = '600 14px -apple-system, "PingFang SC", "Helvetica Neue", sans-serif';
      ctx.fillStyle = '#1A1830';
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}
