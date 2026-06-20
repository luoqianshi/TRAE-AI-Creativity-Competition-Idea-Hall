(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Competitive Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-competitive-radar'), null, { renderer: 'svg' });

  var dimensions = ['功能丰富度', '易用性', '模板质量', '微信整合', '免费程度'];

  chartRadar.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      trigger: 'item'
    },
    legend: {
      data: ['巧乐拼图小助手', 'Bebo Cam', 'Photo Polaroid AI', '本产品（目标）'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12, fontFamily: "'Lora', serif" },
      itemWidth: 16,
      itemHeight: 8
    },
    radar: {
      indicator: dimensions.map(function(name) {
        return { name: name, max: 5 };
      }),
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: ink,
        fontSize: 12,
        fontFamily: "'Lora', serif"
      },
      splitLine: {
        lineStyle: { color: rule }
      },
      splitArea: {
        show: false
      },
      axisLine: {
        lineStyle: { color: rule }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          name: '巧乐拼图小助手',
          value: [4, 3, 2, 5, 4],
          lineStyle: { color: muted, width: 1.5 },
          itemStyle: { color: muted },
          areaStyle: { color: muted + '22' }
        },
        {
          name: 'Bebo Cam',
          value: [3, 4, 5, 1, 3],
          lineStyle: { color: accent2 + 'cc', width: 1.5 },
          itemStyle: { color: accent2 + 'cc' },
          areaStyle: { color: accent2 + '22' }
        },
        {
          name: 'Photo Polaroid AI',
          value: [2, 3, 4, 1, 4],
          lineStyle: { color: muted + '88', width: 1.5, type: 'dashed' },
          itemStyle: { color: muted + '88' },
          areaStyle: { color: muted + '11' }
        },
        {
          name: '本产品（目标）',
          value: [4, 5, 4, 5, 5],
          lineStyle: { color: accent, width: 2.5 },
          itemStyle: { color: accent },
          areaStyle: { color: accent + '33' }
        }
      ]
    }]
  });

  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
