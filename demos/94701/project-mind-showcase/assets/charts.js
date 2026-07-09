(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Radar Comparison ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 10
    },
    radar: {
      indicator: [
        { name: '预操作判断', max: 10 },
        { name: '事件溯源', max: 10 },
        { name: '跨平台', max: 10 },
        { name: 'AI 复盘', max: 10 },
        { name: '模板系统', max: 10 },
        { name: '打包导出', max: 10 },
        { name: 'Git 友好', max: 10 }
      ],
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: ink, fontSize: 12, fontWeight: 600 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: true, areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [10, 9, 9, 9, 8, 9, 9],
          name: 'ProjectMind',
          lineStyle: { color: accent, width: 2.5 },
          itemStyle: { color: accent },
          areaStyle: { color: accent + '33' }
        },
        {
          value: [2, 2, 3, 5, 7, 2, 8],
          name: 'Cline Memory Bank',
          lineStyle: { color: accent2, width: 1.5 },
          itemStyle: { color: accent2 },
          areaStyle: { color: accent2 + '22' }
        },
        {
          value: [2, 2, 9, 7, 2, 7, 3],
          name: 'ai-memory',
          lineStyle: { color: muted, width: 1.5, type: 'dashed' },
          itemStyle: { color: muted },
          areaStyle: { color: muted + '15' }
        },
        {
          value: [6, 8, 7, 5, 2, 2, 8],
          name: 'ProjectMem',
          lineStyle: { color: '#8b5cf6', width: 1.5, type: 'dotted' },
          itemStyle: { color: '#8b5cf6' },
          areaStyle: { color: '#8b5cf633' }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
