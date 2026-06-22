(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 汉字难度分布 ---
  var chartDifficulty = echarts.init(document.getElementById('chart-difficulty'), null, { renderer: 'svg' });
  chartDifficulty.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c} 字 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: { color: ink, fontSize: 14 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: bg2,
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{c} 字',
        color: ink,
        fontSize: 13
      },
      labelLine: {
        lineStyle: { color: rule }
      },
      data: [
        { value: 25, name: '难度 1（简单）', itemStyle: { color: accent2 } },
        { value: 45, name: '难度 2（中等）', itemStyle: { color: accent } },
        { value: 30, name: '难度 3（困难）', itemStyle: { color: muted } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartDifficulty.resize(); });
})();
