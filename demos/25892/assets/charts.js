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
      data: ['传统方式', '食物拯救站(AI调配)'],
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
      data: ['信息触达率', '匹配成功率', '领取转化率', '商家处理效率', '用户满意度'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, formatter: '{value}%' }
    },
    series: [
      {
        name: '传统方式',
        type: 'bar',
        data: [25, 18, 12, 30, 45],
        itemStyle: { color: muted + 'aa', borderRadius: [4, 4, 0, 0] },
        barWidth: '28%'
      },
      {
        name: '食物拯救站(AI调配)',
        type: 'bar',
        data: [78, 72, 65, 85, 88],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '28%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartEff.resize(); });
})();
