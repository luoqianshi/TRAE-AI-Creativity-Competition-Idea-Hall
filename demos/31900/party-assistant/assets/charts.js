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
      data: ['传统方式', '聚会精灵'],
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
      data: ['确定时间', '选择地点', '活动决策', '费用分摊', '照片整理', '整体耗时'],
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '时间（分钟）',
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统方式',
        type: 'bar',
        data: [45, 60, 90, 30, 40, 265],
        itemStyle: { color: muted + '99', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '聚会精灵',
        type: 'bar',
        data: [5, 8, 10, 3, 5, 31],
        itemStyle: { color: accent2, borderRadius: [4, 4, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { chartEfficiency.resize(); });
})();
