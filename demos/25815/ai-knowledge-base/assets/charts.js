(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Pain Points Analysis ---
  var chart1 = echarts.init(document.getElementById('chart-painpoints'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['知识碎片化', '盲区难发现', '复习效率低', '缺乏关联'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      name: '严重程度 (1-10)',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 9, itemStyle: { color: accent } },
        { value: 8.5, itemStyle: { color: accent + 'cc' } },
        { value: 8, itemStyle: { color: accent2 } },
        { value: 7.5, itemStyle: { color: accent2 + 'cc' } }
      ],
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        color: ink,
        fontWeight: 'bold'
      }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });
})();
