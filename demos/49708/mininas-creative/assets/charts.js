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
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['MiniNAS', 'Nextcloud', '公有云盘', '群晖/威联通'],
      textStyle: { color: muted },
      bottom: 0
    },
    radar: {
      indicator: [
        { name: '部署简易度', max: 100 },
        { name: '硬件要求低', max: 100 },
        { name: '数据隐私性', max: 100 },
        { name: '功能专注度', max: 100 },
        { name: '维护成本低', max: 100 },
        { name: '费用可控性', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 13 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: {
        show: true,
        areaStyle: { color: [bg2, 'transparent', bg2, 'transparent'] }
      },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [95, 95, 100, 95, 95, 90],
          name: 'MiniNAS',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          value: [60, 60, 95, 40, 55, 95],
          name: 'Nextcloud',
          areaStyle: { color: accent2 + '22' },
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 }
        },
        {
          value: [100, 100, 30, 55, 100, 30],
          name: '公有云盘',
          areaStyle: { color: muted + '22' },
          lineStyle: { color: muted, width: 2 },
          itemStyle: { color: muted }
        },
        {
          value: [45, 30, 100, 35, 50, 35],
          name: '群晖/威联通',
          areaStyle: { color: '#ef444422' },
          lineStyle: { color: '#ef4444', width: 2 },
          itemStyle: { color: '#ef4444' }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
