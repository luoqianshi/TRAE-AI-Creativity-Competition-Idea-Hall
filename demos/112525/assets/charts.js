(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Nutrition Radar ---
  var chartNutrition = echarts.init(document.getElementById('chart-nutrition'), null, { renderer: 'svg' });
  chartNutrition.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      data: ['健身后推荐套餐', '普通外卖均值'],
      bottom: 0,
      textStyle: { color: ink }
    },
    radar: {
      indicator: [
        { name: '热量控制', max: 100 },
        { name: '蛋白质', max: 100 },
        { name: '优质碳水', max: 100 },
        { name: '膳食纤维', max: 100 },
        { name: '脂肪控制', max: 100 },
        { name: '营养均衡', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      name: '营养对比',
      type: 'radar',
      data: [
        {
          value: [85, 92, 78, 80, 88, 90],
          name: '健身后推荐套餐',
          itemStyle: { color: accent },
          areaStyle: { color: accent + '33' },
          lineStyle: { width: 2 }
        },
        {
          value: [45, 55, 60, 35, 40, 42],
          name: '普通外卖均值',
          itemStyle: { color: accent2 },
          areaStyle: { color: accent2 + '33' },
          lineStyle: { width: 2 }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartNutrition.resize(); });
})();
