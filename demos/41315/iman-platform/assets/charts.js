// assets/charts.js — iMAN Platform Tech Radar Chart
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Tech Radar Chart ---
  var chartRadar = echarts.init(document.getElementById('chart-tech-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true
    },
    legend: {
      data: ['iMAN平台', '行业平均'],
      bottom: 10,
      textStyle: { color: muted, fontSize: 13 },
      itemWidth: 16,
      itemHeight: 8
    },
    radar: {
      indicator: [
        { name: 'NLP自然语言处理', max: 100 },
        { name: '智能匹配算法', max: 100 },
        { name: '跨城协同能力', max: 100 },
        { name: '实时数据处理', max: 100 },
        { name: '安全与隐私保护', max: 100 },
        { name: '系统可扩展性', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 5,
      axisName: {
        color: ink,
        fontSize: 12,
        fontWeight: 600
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
          value: [92, 88, 95, 85, 82, 90],
          name: 'iMAN平台',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '30' },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [45, 50, 30, 55, 60, 48],
          name: '行业平均',
          lineStyle: { color: accent2, width: 2, type: 'dashed' },
          areaStyle: { color: accent2 + '15' },
          itemStyle: { color: accent2 },
          symbol: 'circle',
          symbolSize: 5
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
