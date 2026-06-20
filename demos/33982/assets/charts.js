(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Efficiency Comparison ---
  var chartEff = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEff.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['传统人工扒谱', 'AI智能扒谱'],
      textStyle: { color: muted },
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['简单曲目', '中等曲目', '复杂曲目'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '时间（分钟）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统人工扒谱',
        type: 'bar',
        data: [60, 180, 360],
        itemStyle: { color: muted + 'aa', borderRadius: [4, 4, 0, 0] },
        barGap: '20%'
      },
      {
        name: 'AI智能扒谱',
        type: 'bar',
        data: [0.5, 0.8, 1.2],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { chartEff.resize(); });
})();
