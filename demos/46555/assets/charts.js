(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Graduates Trend ---
  var chartGraduates = echarts.init(document.getElementById('chart-graduates'), null, { renderer: 'svg' });
  chartGraduates.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['2020', '2021', '2022', '2023', '2024', '2025', '2026（预计）'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      name: '万人',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    series: [{
      name: '毕业生人数',
      type: 'bar',
      barWidth: '45%',
      data: [874, 909, 1076, 1158, 1179, 1222, 1250],
      itemStyle: {
        color: accent,
        borderRadius: [6, 6, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        color: ink,
        fontWeight: 700,
        fontSize: 13,
        formatter: '{c}'
      }
    }]
  });
  window.addEventListener('resize', function() { chartGraduates.resize(); });
})();
