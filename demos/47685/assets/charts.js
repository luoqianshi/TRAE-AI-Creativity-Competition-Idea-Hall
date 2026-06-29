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
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      data: ['传统 ADB', '本方案 IAAGHS'],
      bottom: 0,
      textStyle: { color: muted }
    },
    radar: {
      indicator: [
        { name: '识别距离', max: 100 },
        { name: '响应速度', max: 100 },
        { name: '遮光精度', max: 100 },
        { name: '全天候能力', max: 100 },
        { name: '轨迹预测', max: 100 },
        { name: '可升级性', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: true, areaStyle: { color: [bg2, bg2] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [45, 35, 40, 30, 10, 15],
          name: '传统 ADB',
          lineStyle: { color: muted, width: 2 },
          areaStyle: { color: muted + '22' },
          itemStyle: { color: muted }
        },
        {
          value: [95, 92, 96, 88, 85, 90],
          name: '本方案 IAAGHS',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '33' },
          itemStyle: { color: accent }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { radarChart.resize(); });

  // --- Chart: Bar ---
  var barChart = echarts.init(document.getElementById('chart-bar'), null, { renderer: 'svg' });
  barChart.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['安装前事故率', '安装后事故率'],
      bottom: 0,
      textStyle: { color: muted }
    },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['城市主干道', '高速公路', '乡村道路', '弯道/坡道', '恶劣天气'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '事故率指数',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '安装前事故率',
        type: 'bar',
        barWidth: '30%',
        data: [100, 100, 100, 100, 100],
        itemStyle: { color: muted + '66', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '安装后事故率',
        type: 'bar',
        barWidth: '30%',
        data: [72, 68, 78, 65, 75],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { barChart.resize(); });
})();
