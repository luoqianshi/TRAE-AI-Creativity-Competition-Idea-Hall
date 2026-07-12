(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Pain Points ---
  var chartPain = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });
  chartPain.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true,
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        color: muted,
        formatter: '{value}%'
      },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: ['重要客户冷场', '忘了聊过什么', '多人聚会记混', '换造型认不出', '叫错名字社死', '迎面装没看见'],
      axisLabel: {
        color: ink,
        fontSize: 13
      },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [{
      name: '用户遭遇比例',
      type: 'bar',
      data: [85, 78, 72, 68, 65, 60],
      barWidth: '60%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: accent2 },
          { offset: 1, color: accent }
        ]),
        borderRadius: [0, 6, 6, 0]
      },
      label: {
        show: true,
        position: 'right',
        color: accent,
        fontWeight: 600,
        formatter: '{c}%'
      }
    }]
  });
  window.addEventListener('resize', function() { chartPain.resize(); });
})();
