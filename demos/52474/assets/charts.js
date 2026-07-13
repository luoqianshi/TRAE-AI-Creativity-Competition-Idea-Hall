(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Persona Pie ---
  var chartPersona = echarts.init(document.getElementById('chart-persona'), null, { renderer: 'svg' });
  chartPersona.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: { bottom: '0%', left: 'center', textStyle: { color: muted } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: bg2, borderWidth: 2 },
      label: { show: true, color: ink, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 35, name: '职场上班族', itemStyle: { color: accent } },
        { value: 28, name: '高校学生', itemStyle: { color: accent2 } },
        { value: 20, name: '备考人群', itemStyle: { color: muted } },
        { value: 17, name: '自由职业者', itemStyle: { color: accent + '99' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartPersona.resize(); });

  // --- Chart: Usage Scenarios Bar ---
  var chartScenario = echarts.init(document.getElementById('chart-scenario'), null, { renderer: 'svg' });
  chartScenario.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: { type: 'value', axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
    yAxis: { type: 'category', data: ['加班解压', '睡前放松', '课间休息', '心情烦躁', '通勤路上', '午休时刻'], axisLine: { lineStyle: { color: rule } }, axisLabel: { color: ink } },
    series: [{
      type: 'bar',
      data: [85, 78, 72, 68, 55, 50],
      itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] },
      barWidth: '60%',
      label: { show: true, position: 'right', color: muted, formatter: '{c}%' }
    }]
  });
  window.addEventListener('resize', function() { chartScenario.resize(); });
})();