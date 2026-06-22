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
      data: ['使用前', '使用后'],
      top: 0,
      textStyle: { color: ink }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '48px', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['挂号就医', '用药管理', '扫码支付', '查询信息', '紧急求助'],
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
        name: '使用前',
        type: 'bar',
        data: [45, 15, 20, 25, 30],
        itemStyle: { color: muted + '99', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: '使用后',
        type: 'bar',
        data: [8, 2, 3, 3, 1],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartEff.resize(); });
})();
