(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Cost Comparison ---
  var chartCost = echarts.init(document.getElementById('chart-cost'), null, { renderer: 'svg' });
  chartCost.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['人工前台成本', '「声聆」成本'],
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
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '月度成本（元）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '人工前台成本',
        type: 'bar',
        data: [3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200],
        itemStyle: { color: muted + '66', borderRadius: [4, 4, 0, 0] },
        barWidth: '35%'
      },
      {
        name: '「声聆」成本',
        type: 'bar',
        data: [720, 720, 720, 720, 720, 720, 720, 720, 720, 720, 720, 720],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '35%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartCost.resize(); });
})();
