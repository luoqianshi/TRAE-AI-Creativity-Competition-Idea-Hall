(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  
  // Chart: AI Matching Algorithm Comparison
  var chart1 = echarts.init(document.getElementById('chart-matching'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true
    },
    legend: {
      data: ['传统手动搜索', '标签匹配', 'AI向量匹配', 'Together双路召回'],
      bottom: 10,
      textStyle: { color: muted }
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
      data: ['匹配准确率', '用户满意度', '匹配速度', '推荐质量'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统手动搜索',
        type: 'bar',
        data: [25, 30, 20, 35],
        itemStyle: { color: muted }
      },
      {
        name: '标签匹配',
        type: 'bar',
        data: [55, 50, 60, 45],
        itemStyle: { color: accent2 + '99' }
      },
      {
        name: 'AI向量匹配',
        type: 'bar',
        data: [70, 65, 75, 60],
        itemStyle: { color: accent2 }
      },
      {
        name: 'Together双路召回',
        type: 'bar',
        data: [92, 88, 95, 90],
        itemStyle: { color: accent }
      }
    ]
  });
  window.addEventListener('resize', function() { chart1.resize(); });
})();