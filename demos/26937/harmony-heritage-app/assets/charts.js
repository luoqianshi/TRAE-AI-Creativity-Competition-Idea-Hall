(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: Design Principle Priority Matrix (Radar) ---
  var chart1 = echarts.init(document.getElementById('chart-design-matrix'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      data: ['常规应用标准', '本应用银发标准'],
      bottom: 0,
      textStyle: { color: muted }
    },
    radar: {
      indicator: [
        { name: '字体可读性', max: 10 },
        { name: '触控容错', max: 10 },
        { name: '语音交互', max: 10 },
        { name: '视觉对比度', max: 10 },
        { name: '层级简洁度', max: 10 },
        { name: '反馈清晰度', max: 10 }
      ],
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: ink, fontSize: 13 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: true, areaStyle: { color: [bg2, '#fff'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [6, 5, 3, 5, 4, 5],
          name: '常规应用标准',
          lineStyle: { color: muted },
          itemStyle: { color: muted },
          areaStyle: { color: muted + '33' }
        },
        {
          value: [9, 9, 10, 10, 9, 9],
          name: '本应用银发标准',
          lineStyle: { color: accent },
          itemStyle: { color: accent },
          areaStyle: { color: accent + '33' }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: Scene-Function Match (Bar) ---
  var chart2 = echarts.init(document.getElementById('chart-scene-match'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true
    },
    legend: {
      data: ['功能匹配度', '用户场景频率'],
      bottom: 0,
      textStyle: { color: muted }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['3D 把玩', 'AI 鉴赏', '白噪音', '文化图谱', '数字博古架'],
      axisLabel: { color: ink, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: muted, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '功能匹配度',
        type: 'bar',
        data: [95, 90, 85, 80, 75],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: '用户场景频率',
        type: 'bar',
        data: [85, 75, 90, 60, 55],
        itemStyle: { color: accent2, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
