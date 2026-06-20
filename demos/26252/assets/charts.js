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
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['传统查攻略方式', 'AI游戏助手'],
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
      data: ['查阅攻略', '手动计算', '配装调整', '验证测试', '总计'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '耗时（分钟）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统查攻略方式',
        type: 'bar',
        data: [12, 8, 15, 10, 45],
        itemStyle: { color: muted + '88' },
        barWidth: '30%'
      },
      {
        name: 'AI游戏助手',
        type: 'bar',
        data: [0.5, 0.2, 2, 1, 3.7],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent2 }
          ])
        },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartEfficiency.resize(); });
})();
