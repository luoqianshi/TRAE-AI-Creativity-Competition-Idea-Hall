(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Efficiency Comparison ---
  var chartEfficiency = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEfficiency.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['传统人工模式', '智能体模式'],
      top: 10,
      textStyle: { color: ink }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['方案生成时间', '个性化程度', '风险筛查覆盖率', '服务可及性', '方案迭代频率'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '相对指数',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '传统人工模式',
        type: 'bar',
        data: [30, 40, 50, 25, 20],
        itemStyle: { color: muted + '99', borderRadius: [4, 4, 0, 0] },
        barWidth: '28%'
      },
      {
        name: '智能体模式',
        type: 'bar',
        data: [95, 92, 96, 98, 90],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '66' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '28%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartEfficiency.resize(); });
})();
