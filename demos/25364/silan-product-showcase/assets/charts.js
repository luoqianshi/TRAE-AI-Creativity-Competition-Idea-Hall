// assets/charts.js - 思澜产品对比图
(function() {
  // Read theme colors
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent-2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // Chart: Comparison Radar
  var chartComp = echarts.init(document.getElementById('chart-comparison'), null, { renderer: 'svg' });

  var indicator = [
    { name: '跨项目累积', max: 5 },
    { name: '方法论骨架', max: 5 },
    { name: '个人风格学习', max: 5 },
    { name: '自动归档', max: 5 },
    { name: '端到端管道', max: 5 }
  ];

  chartComp.setOption({
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: '#ffffff',
      borderColor: rule,
      borderWidth: 1,
      textStyle: { color: ink, fontFamily: "'InstrumentSans', 'PingFang SC', sans-serif", fontSize: 13 },
      padding: 12
    },
    legend: {
      bottom: 0,
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 20,
      textStyle: {
        color: muted,
        fontFamily: "'InstrumentSans', 'PingFang SC', sans-serif",
        fontSize: 13
      }
    },
    radar: {
      indicator: indicator,
      center: ['50%', '46%'],
      radius: '68%',
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: ink,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'InstrumentSans', 'PingFang SC', sans-serif"
      },
      splitLine: {
        lineStyle: { color: rule, type: 'dashed' }
      },
      splitArea: {
        areaStyle: { color: ['rgba(238, 242, 255, 0.1)', 'rgba(238, 242, 255, 0.3)'] }
      },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      emphasis: { focus: 'series' },
      data: [
        {
          name: '思澜 SiLan',
          value: [5, 5, 4, 5, 4],
          symbolSize: 8,
          lineStyle: { color: accent, width: 3 },
          itemStyle: { color: accent },
          areaStyle: { color: accent, opacity: 0.25 }
        },
        {
          name: 'Notion AI',
          value: [2, 1, 1, 3, 2],
          symbolSize: 6,
          lineStyle: { color: muted, width: 1.5 },
          itemStyle: { color: muted },
          areaStyle: { color: muted, opacity: 0.08 }
        },
        {
          name: 'ChatGPT Memory',
          value: [3, 1, 1, 2, 2],
          symbolSize: 6,
          lineStyle: { color: '#94a3b8', width: 1.5 },
          itemStyle: { color: '#94a3b8' },
          areaStyle: { color: '#94a3b8', opacity: 0.08 }
        },
        {
          name: 'Obsidian + AI',
          value: [3, 1, 1, 2, 2],
          symbolSize: 6,
          lineStyle: { color: '#a8a29e', width: 1.5 },
          itemStyle: { color: '#a8a29e' },
          areaStyle: { color: '#a8a29e', opacity: 0.08 }
        },
        {
          name: 'Mem.ai',
          value: [3, 2, 2, 3, 2],
          symbolSize: 6,
          lineStyle: { color: accent2, width: 1.5, type: 'dashed' },
          itemStyle: { color: accent2 },
          areaStyle: { color: accent2, opacity: 0.05 }
        }
      ]
    }]
  });

  window.addEventListener('resize', function() { chartComp.resize(); });
})();
