(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Pain Points ---
  var chartPainPoints = echarts.init(document.getElementById('chart-pain-points'), null, { renderer: 'svg' });
  chartPainPoints.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', color: muted }, axisLine: { lineStyle: { color: rule } }, splitLine: { lineStyle: { color: rule } } },
    yAxis: { type: 'category', data: ['信息过载', '知识遗忘', '整理耗时', '难以检索', '缺乏关联'], axisLabel: { color: ink }, axisLine: { lineStyle: { color: rule } } },
    series: [{
      type: 'bar',
      data: [
        { value: 78, itemStyle: { color: accent } },
        { value: 72, itemStyle: { color: accent } },
        { value: 65, itemStyle: { color: accent2 } },
        { value: 58, itemStyle: { color: accent2 } },
        { value: 52, itemStyle: { color: accent2 } }
      ],
      barWidth: '60%',
      label: { show: true, position: 'right', formatter: '{c}%', color: ink }
    }]
  });
  window.addEventListener('resize', function() { chartPainPoints.resize(); });

  // --- Chart: Market Growth ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['2023', '2024', '2025', '2026', '2027'], axisLabel: { color: muted }, axisLine: { lineStyle: { color: rule } } },
    yAxis: { type: 'value', name: '市场规模（亿美元）', nameTextStyle: { color: muted }, axisLabel: { color: muted }, axisLine: { lineStyle: { color: rule } }, splitLine: { lineStyle: { color: rule } } },
    series: [{
      type: 'line',
      data: [45, 62, 85, 115, 155],
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
})();
