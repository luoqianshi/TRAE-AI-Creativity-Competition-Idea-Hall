// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Radar ---
  var radarChart = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  radarChart.setOption({
    animation: false,
    tooltip: {
      appendToBody: true
    },
    legend: {
      data: ['当前工作流', 'SkillForge 方案'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    radar: {
      indicator: [
        { name: '配置效率', max: 100 },
        { name: '复用便捷性', max: 100 },
        { name: '调试体验', max: 100 },
        { name: '团队协作', max: 100 },
        { name: '上手难度\n(越高越易)', max: 100 },
        { name: '生态开放性', max: 100 }
      ],
      center: ['50%', '45%'],
      radius: '65%',
      axisName: {
        color: ink,
        fontSize: 12,
        fontWeight: 600
      },
      axisLine: { lineStyle: { color: rule } },
      splitArea: {
        areaStyle: { color: [bg2 + '00', bg2] }
      },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [25, 20, 18, 15, 30, 10],
          name: '当前工作流',
          areaStyle: { color: accent + '30' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          value: [92, 95, 85, 90, 80, 88],
          name: 'SkillForge 方案',
          areaStyle: { color: accent2 + '30' },
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { radarChart.resize(); });
})();