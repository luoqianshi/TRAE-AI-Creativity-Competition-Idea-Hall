(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Pain Points (Bar) ---
  var chartPainPoints = echarts.init(document.getElementById('chart-pain-points'), null, { renderer: 'svg' });
  chartPainPoints.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
    yAxis: { type: 'category', data: ['教师时间冲突', '教室资源不足', '课程偏好难满足', '手工排课效率低', '临时调课困难'], axisLine: { lineStyle: { color: rule } }, axisLabel: { color: ink } },
    series: [{
      type: 'bar',
      data: [78, 65, 72, 88, 81],
      itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] },
      barWidth: '60%',
      label: { show: true, position: 'right', color: ink, formatter: '{c}%' }
    }]
  });
  window.addEventListener('resize', function() { chartPainPoints.resize(); });

  // --- Chart: Market Size (Line) ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['2023', '2024', '2025(E)', '2026(E)', '2027(E)'], axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted } },
    yAxis: { type: 'value', name: '亿元', nameTextStyle: { color: muted }, axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
    series: [{
      type: 'line',
      data: [12, 18, 28, 42, 58],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: accent, width: 3 },
      itemStyle: { color: accent },
      areaStyle: { color: accent + '33' },
      label: { show: true, position: 'top', color: ink }
    }]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart: Tech Architecture (Pie) ---
  var chartTech = echarts.init(document.getElementById('chart-tech'), null, { renderer: 'svg' });
  chartTech.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg2, borderWidth: 2 },
      label: { show: true, color: ink },
      data: [
        { value: 30, name: '约束求解引擎', itemStyle: { color: accent } },
        { value: 25, name: '智能推荐算法', itemStyle: { color: accent2 } },
        { value: 20, name: '自然语言交互', itemStyle: { color: muted } },
        { value: 15, name: '数据可视化', itemStyle: { color: accent + 'aa' } },
        { value: 10, name: '实时协同同步', itemStyle: { color: accent2 + 'aa' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartTech.resize(); });
})();
