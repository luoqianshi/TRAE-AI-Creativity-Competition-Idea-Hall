(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim() || '#C41E3A';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#D4A843';
  var ink = style.getPropertyValue('--ink').trim() || '#F0F0F5';
  var muted = style.getPropertyValue('--muted').trim() || '#8A8A95';
  var rule = style.getPropertyValue('--rule').trim() || 'rgba(240,240,245,0.12)';
  var bg2 = style.getPropertyValue('--bg2').trim() || '#1A1A1F';

  // --- Chart: Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['当前水平', '目标水平'],
      bottom: 0,
      textStyle: { color: muted }
    },
    radar: {
      indicator: [
        { name: '开局深度', max: 100 },
        { name: '中局计算力', max: 100 },
        { name: '残局基本功', max: 100 },
        { name: '战术敏感度', max: 100 },
        { name: '时间管理', max: 100 },
        { name: '局面感知', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: {
        show: true,
        areaStyle: { color: ['transparent', 'rgba(240,240,245,0.02)'] }
      },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      name: '棋力评估',
      type: 'radar',
      data: [
        {
          value: [65, 48, 72, 55, 40, 58],
          name: '当前水平',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '33' },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [80, 75, 85, 78, 70, 80],
          name: '目标水平',
          lineStyle: { color: accent2, width: 2, type: 'dashed' },
          areaStyle: { color: 'transparent' },
          itemStyle: { color: accent2 },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
