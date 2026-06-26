// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var warm = style.getPropertyValue('--warm').trim();

  // --- Chart: Pain Point Radar ---
  var chartPain = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });

  var painCategories = ['认知训练\n资源匮乏', '家属身心\n双重压力', '沟通鸿沟\n日益加深', '记忆消散\n与文化断裂'];
  var patientValues = [95, 60, 85, 90];
  var familyValues = [70, 95, 80, 75];

  chartPain.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['患者维度', '家属维度'],
      bottom: 5,
      textStyle: { color: muted, fontSize: 13 },
      itemWidth: 16,
      itemHeight: 10,
      itemGap: 24
    },
    radar: {
      indicator: [
        { name: painCategories[0], max: 100 },
        { name: painCategories[1], max: 100 },
        { name: painCategories[2], max: 100 },
        { name: painCategories[3], max: 100 }
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: {
        color: ink,
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 18
      },
      splitLine: {
        lineStyle: { color: rule, width: 1 }
      },
      splitArea: {
        show: true,
        areaStyle: { color: ['rgba(58,143,133,0.02)', 'rgba(58,143,133,0.04)', 'rgba(58,143,133,0.02)', 'rgba(58,143,133,0.04)'] }
      },
      axisLine: {
        lineStyle: { color: rule, width: 1 }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: patientValues,
          name: '患者维度',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: 'rgba(58,143,133,0.15)' },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: familyValues,
          name: '家属维度',
          lineStyle: { color: warm, width: 2 },
          areaStyle: { color: 'rgba(232,168,124,0.12)' },
          itemStyle: { color: warm },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    }]
  });

  window.addEventListener('resize', function() { chartPain.resize(); });
})();