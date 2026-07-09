(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Health Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-health-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true
    },
    legend: {
      data: ['健康用户', '亚健康用户'],
      bottom: 0,
      textStyle: { color: muted }
    },
    radar: {
      indicator: [
        { name: '饮食健康', max: 100 },
        { name: '运动活力', max: 100 },
        { name: '压力管理', max: 100 },
        { name: '情绪健康', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: ink,
        fontSize: 14,
        fontWeight: 600
      },
      splitLine: {
        lineStyle: { color: rule }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: [bg2, 'rgba(255,154,139,0.03)']
        }
      },
      axisLine: {
        lineStyle: { color: rule }
      }
    },
    series: [{
      name: '健康评估',
      type: 'radar',
      data: [
        {
          value: [85, 78, 72, 88],
          name: '健康用户',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '33' },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [45, 32, 38, 55],
          name: '亚健康用户',
          lineStyle: { color: muted, width: 2 },
          areaStyle: { color: muted + '22' },
          itemStyle: { color: muted },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
