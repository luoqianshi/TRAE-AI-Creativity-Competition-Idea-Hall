(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Safety Issues ---
  var chartSafety = echarts.init(document.getElementById('chart-safety'), null, { renderer: 'svg' });
  chartSafety.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: ink }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: bg2,
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{c}%',
        color: ink
      },
      labelLine: {
        lineStyle: { color: muted }
      },
      data: [
        { value: 28, name: '食材来源不明', itemStyle: { color: accent } },
        { value: 22, name: '加工环境脏乱', itemStyle: { color: accent2 } },
        { value: 18, name: '过期变质食材', itemStyle: { color: muted } },
        { value: 15, name: '虚假宣传', itemStyle: { color: '#f59e0b' } },
        { value: 10, name: '配送污染', itemStyle: { color: '#ef4444' } },
        { value: 7, name: '其他', itemStyle: { color: rule } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartSafety.resize(); });
})();
