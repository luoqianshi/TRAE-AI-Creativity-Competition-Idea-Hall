(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 愈见剧本六维能力雷达图 ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: {
      data: ['愈见剧本', '行业平均'],
      bottom: 0,
      textStyle: { color: muted }
    },
    radar: {
      indicator: [
        { name: '社会价值', max: 10 },
        { name: '创新性', max: 10 },
        { name: '可落地性', max: 10 },
        { name: '可持续性', max: 10 },
        { name: '技术可行性', max: 10 },
        { name: '市场潜力', max: 10 }
      ],
      axisName: { color: muted, fontSize: 12 },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [9, 9.5, 8, 8.5, 8, 9],
          name: '愈见剧本',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          value: [6, 5, 6, 5.5, 6, 6.5],
          name: '行业平均',
          areaStyle: { color: muted + '22' },
          lineStyle: { color: muted, width: 1, type: 'dashed' },
          itemStyle: { color: muted }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
