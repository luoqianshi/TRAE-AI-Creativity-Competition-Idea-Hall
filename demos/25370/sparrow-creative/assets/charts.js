(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Service Dependencies & QPS ---
  var chartDeps = echarts.init(document.getElementById('chart-deps'), null, { renderer: 'svg' });
  chartDeps.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['理论 QPS', '实际压测 QPS'],
      textStyle: { color: muted },
      bottom: 0
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Gateway', 'User', 'Graph', 'AI', 'Trade'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: 'QPS',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, opacity: 0.3 } }
    },
    series: [
      {
        name: '理论 QPS',
        type: 'bar',
        data: [500, 300, 400, 50, 200],
        itemStyle: { color: accent + '80', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: '实际压测 QPS',
        type: 'bar',
        data: [450, 280, 380, 45, 180],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartDeps.resize(); });
})();
