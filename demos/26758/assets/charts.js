(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Revenue Structure ---
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      textStyle: { color: muted, fontSize: 13 }
    },
    color: [accent, accent2, muted, accent + '99'],
    series: [
      {
        name: '收入结构',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{c}%',
          color: ink,
          fontSize: 13,
          fontWeight: 600
        },
        labelLine: {
          lineStyle: { color: rule }
        },
        data: [
          { value: 45, name: '硬件销售' },
          { value: 30, name: '订阅服务' },
          { value: 15, name: '教育电商佣金' },
          { value: 10, name: '增值服务' }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });
})();
