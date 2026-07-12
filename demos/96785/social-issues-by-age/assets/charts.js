(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Teen Mental Health ---
  var chartMental = echarts.init(document.getElementById('chart-mental-health'), null, { renderer: 'svg' });
  chartMental.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['小学生', '初中生', '高中生'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      max: 50,
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { formatter: '{value}%', color: muted }
    },
    series: [{
      name: '抑郁检出率',
      type: 'bar',
      data: [10, 30, 40],
      itemStyle: {
        color: function(params) {
          var colors = [accent + '99', accent + 'cc', accent];
          return colors[params.dataIndex];
        },
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '45%',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        color: ink,
        fontWeight: 'bold'
      }
    }]
  });
  window.addEventListener('resize', function() { chartMental.resize(); });
})();
