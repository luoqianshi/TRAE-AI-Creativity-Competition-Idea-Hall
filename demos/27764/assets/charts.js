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
    xAxis: { type: 'value', axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule, type: 'dashed' } } },
    yAxis: { type: 'category', data: ['食材浪费', '外卖吃腻', '营养不均衡', '决策时间长', '选择困难'], axisLine: { lineStyle: { color: rule } }, axisLabel: { color: ink } },
    series: [{
      type: 'bar',
      data: [
        { value: 52, itemStyle: { color: accent + '99' } },
        { value: 68, itemStyle: { color: accent + 'bb' } },
        { value: 55, itemStyle: { color: accent + 'aa' } },
        { value: 78, itemStyle: { color: accent + 'dd' } },
        { value: 85, itemStyle: { color: accent } }
      ],
      barWidth: '60%',
      label: { show: true, position: 'right', color: ink, formatter: '{c}%' }
    }]
  });
  window.addEventListener('resize', function() { chartPainPoints.resize(); });

  // --- Chart: Market Size ---
  var chartMarket = echarts.init(document.getElementById('chart-market-size'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
    xAxis: { type: 'category', data: ['2024', '2025', '2026E', '2027E', '2028E'], axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted } },
    yAxis: { type: 'value', name: '亿元', nameTextStyle: { color: muted }, axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule, type: 'dashed' } } },
    series: [{
      type: 'line',
      data: [3200, 3850, 4600, 5500, 6500],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: accent, width: 3 },
      itemStyle: { color: accent },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent + '44' }, { offset: 1, color: accent + '06' }] } },
      label: { show: true, position: 'top', color: ink, formatter: '{c}' }
    }]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart: Business Model ---
  var chartBusiness = echarts.init(document.getElementById('chart-business-model'), null, { renderer: 'svg' });
  chartBusiness.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    color: [accent, accent2, muted, accent + 'cc', accent2 + 'aa'],
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: bg2, borderWidth: 3 },
      label: { show: true, color: ink, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 35, name: '团购佣金' },
        { value: 25, name: '食材电商分成' },
        { value: 20, name: '会员订阅' },
        { value: 15, name: '广告收入' },
        { value: 5, name: '数据服务' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartBusiness.resize(); });
})();
