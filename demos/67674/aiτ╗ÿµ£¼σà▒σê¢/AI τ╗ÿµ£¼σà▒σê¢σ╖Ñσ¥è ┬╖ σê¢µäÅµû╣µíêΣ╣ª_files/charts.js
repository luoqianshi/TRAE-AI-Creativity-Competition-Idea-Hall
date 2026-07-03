(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var chartDom = document.getElementById('chart-radar');
  if (!chartDom) return;

  var chart = echarts.init(chartDom, null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true
    },
    legend: {
      data: ['传统绘本电商', '定制绘本服务', '通用AI故事工具', 'AI 绘本共创工坊'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 11 },
      itemWidth: 14,
      itemHeight: 10
    },
    radar: {
      indicator: [
        { name: '个性化程度', max: 10 },
        { name: '孩子参与度', max: 10 },
        { name: '成本优势', max: 10 },
        { name: '即时性', max: 10 },
        { name: '成长记录价值', max: 10 },
        { name: '完整体验', max: 10 }
      ],
      center: ['50%', '48%'],
      radius: '62%',
      axisName: {
        color: ink,
        fontSize: 12,
        fontWeight: 600
      },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [1, 1, 6, 3, 1, 5],
          name: '传统绘本电商',
          lineStyle: { color: muted, width: 2 },
          areaStyle: { color: muted + '15' },
          itemStyle: { color: muted }
        },
        {
          value: [4, 2, 2, 2, 3, 6],
          name: '定制绘本服务',
          lineStyle: { color: accent2, width: 2 },
          areaStyle: { color: accent2 + '15' },
          itemStyle: { color: accent2 }
        },
        {
          value: [6, 4, 9, 9, 2, 4],
          name: '通用AI故事工具',
          lineStyle: { color: '#B5701A', width: 2, type: 'dashed' },
          areaStyle: { color: '#B5701A15' },
          itemStyle: { color: '#B5701A' }
        },
        {
          value: [9, 9, 9, 10, 9, 9],
          name: 'AI 绘本共创工坊',
          lineStyle: { color: accent, width: 3 },
          areaStyle: { color: accent + '30' },
          itemStyle: { color: accent }
        }
      ]
    }]
  });

  window.addEventListener('resize', function() { chart.resize(); });
})();
