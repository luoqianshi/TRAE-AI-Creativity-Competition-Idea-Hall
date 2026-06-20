(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Learning Effect Comparison ---
  var chartLearning = echarts.init(document.getElementById('chart-learning'), null, { renderer: 'svg' });
  chartLearning.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['自学', '银龄纽带帮扶'],
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
      data: ['视频通话', '扫码支付', '网上预约', '打车出行', '防骗识别', '综合掌握率'],
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '掌握率（%）',
      max: 100,
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '自学',
        type: 'bar',
        data: [15, 8, 5, 10, 3, 8],
        itemStyle: { color: muted + '99', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '银龄纽带帮扶',
        type: 'bar',
        data: [85, 78, 72, 80, 68, 77],
        itemStyle: { color: accent2, borderRadius: [4, 4, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { chartLearning.resize(); });
})();
