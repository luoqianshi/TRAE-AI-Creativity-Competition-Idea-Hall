(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Performance ---
  var chartPerf = echarts.init(document.getElementById('chart-performance'), null, { renderer: 'svg' });
  chartPerf.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['CPU 模式', 'GPU 加速'],
      textStyle: { color: muted },
      bottom: 0
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
      data: ['轻薄本\n(i5/核显)', '办公本\n(i7/核显)', '游戏本\n(i7+RTX3060)', '工作站\n(i9+RTX4080)', '服务器\n(A100)'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '照片/秒',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, opacity: 0.5 } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: 'CPU 模式',
        type: 'bar',
        data: [2.5, 4.2, 8.5, 12.0, 18.0],
        itemStyle: { color: accent + '88', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: 'GPU 加速',
        type: 'bar',
        data: [0, 0, 45, 85, 220],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartPerf.resize(); });
})();
