/* assets/charts.js — 邻聚价值雷达图 */
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var el = document.getElementById('chart-value-radar');
  if (!el || typeof echarts === 'undefined') return;

  var chart = echarts.init(el, null, { renderer: 'svg' });

  chart.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: {
      data: ['传统邻里现状', '邻聚'],
      top: 6,
      itemGap: 24,
      textStyle: { color: ink, fontSize: 13 }
    },
    radar: {
      indicator: [
        { name: '邻里互动', max: 5 },
        { name: '社区治理', max: 5 },
        { name: '生活便利', max: 5 },
        { name: '情感温度', max: 5 },
        { name: '适老关怀', max: 5 },
        { name: '信任安全', max: 5 }
      ],
      center: ['50%', '58%'],
      radius: '62%',
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: ink,
        fontSize: 13,
        fontWeight: 600
      },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: ['transparent', bg2] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      emphasis: { focus: 'self' },
      data: [
        {
          value: [2, 3, 2, 1, 2, 3],
          name: '传统邻里现状',
          areaStyle: { color: muted + '33' },
          lineStyle: { color: muted, width: 2, type: 'dashed' },
          itemStyle: { color: muted }
        },
        {
          value: [5, 5, 4, 5, 5, 5],
          name: '邻聚',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2.5 },
          itemStyle: { color: accent }
        }
      ]
    }]
  });

  window.addEventListener('resize', function () { chart.resize(); });
})();
