// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Achievement Treemap ---
  var chartAchieve = echarts.init(document.getElementById('chart-achieve'), null, { renderer: 'svg' });
  chartAchieve.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: function(p) { return '<strong>' + p.name + '</strong><br/>成就数量：' + p.value[2] + ' 个'; }
    },
    series: [{
      type: 'treemap',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        formatter: '{b}\n{c} 个成就',
        fontSize: 13,
        fontWeight: 600,
        color: '#fff'
      },
      itemStyle: { borderColor: '#fff', borderWidth: 3, gapWidth: 3 },
      levels: [{ itemStyle: { borderColor: '#fff', borderWidth: 3, gapWidth: 3 } }],
      data: [
        { name: '主线登顶', value: [3, 0, 3], itemStyle: { color: accent2 } },
        { name: '生死突破', value: [3, 0, 3], itemStyle: { color: '#DC2626' } },
        { name: '习惯坚持', value: [3, 0, 3], itemStyle: { color: accent } },
        { name: '惊喜突破', value: [3, 0, 3], itemStyle: { color: '#0EA5E9' } },
        { name: '治愈守护', value: [2, 0, 2], itemStyle: { color: '#8B5CF6' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartAchieve.resize(); });

  // --- Chart: Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      data: ['传统 Todo 工具', '普通 AI 待办', '「拾级」'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    radar: {
      indicator: [
        { name: '拆解深度', max: 100 },
        { name: '激励体系', max: 100 },
        { name: '使用门槛', max: 100 },
        { name: '容错能力', max: 100 },
        { name: '社交温度', max: 100 },
        { name: '新手友好度', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: true, areaStyle: { color: ['transparent', bg2] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [20, 30, 20, 10, 15, 25],
          name: '传统 Todo 工具',
          lineStyle: { color: muted },
          areaStyle: { color: muted + '33' },
          itemStyle: { color: muted }
        },
        {
          value: [50, 20, 40, 15, 10, 40],
          name: '普通 AI 待办',
          lineStyle: { color: accent2 },
          areaStyle: { color: accent2 + '33' },
          itemStyle: { color: accent2 }
        },
        {
          value: [95, 90, 95, 90, 85, 95],
          name: '「拾级」',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '33' },
          itemStyle: { color: accent }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
