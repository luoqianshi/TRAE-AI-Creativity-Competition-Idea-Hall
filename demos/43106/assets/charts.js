(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Time Saved Comparison ---
  var chartTime = echarts.init(document.getElementById('chart-time'), null, { renderer: 'svg' });
  chartTime.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['传统阅读', 'PaperMind辅助'], textStyle: { color: muted }, bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['8页短篇', '10页常规', '12页标准', '15页长篇'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '阅读时间（分钟）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统阅读',
        type: 'bar',
        data: [90, 150, 210, 300],
        itemStyle: { color: muted + '66', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: 'PaperMind辅助',
        type: 'bar',
        data: [15, 20, 25, 35],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartTime.resize(); });

  // --- Chart: User Pain Points ---
  var chartPain = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });
  chartPain.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: ['术语障碍', '信息过载', '跨领域理解', '判断论文价值', '提取核心方法'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontWeight: 600 }
    },
    series: [{
      name: '困扰程度',
      type: 'bar',
      data: [88, 92, 85, 78, 82],
      itemStyle: {
        color: function(params) {
          var colors = [accent, accent2, accent + 'cc', accent2 + 'cc', accent + '99'];
          return colors[params.dataIndex];
        },
        borderRadius: [0, 4, 4, 0]
      },
      barWidth: '55%',
      label: { show: true, position: 'right', color: muted, formatter: '{c}%' }
    }]
  });
  window.addEventListener('resize', function() { chartPain.resize(); });
})();
