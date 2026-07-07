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

  var categories = ['单据涉税识别', '税种判定', '税金估算', '申报表生成', '数据校验', '提交申报'];
  var traditionalData = [180, 120, 90, 150, 60, 30];
  var huitaxData = [5, 3, 2, 8, 2, 1];

  chartEff.setOption({
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
      data: ['传统手工操作（分钟）', '慧税系统（分钟）'],
      textStyle: { color: muted },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '48px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '耗时（分钟）',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统手工操作（分钟）',
        type: 'bar',
        data: traditionalData,
        itemStyle: {
          color: muted + '66',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '28%'
      },
      {
        name: '慧税系统（分钟）',
        type: 'bar',
        data: huitaxData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent2 }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '28%'
      }
    ]
  });

  window.addEventListener('resize', function() {
    chartEff.resize();
  });
})();
