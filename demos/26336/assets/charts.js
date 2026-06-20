// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: 国考报名人数趋势 ---
  var chart1 = echarts.init(document.getElementById('chart-trend'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    grid: { left: '8%', right: '8%', top: '10%', bottom: '10%' },
    xAxis: {
      type: 'category',
      data: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '万人',
      min: 100,
      max: 400,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 12 },
      nameTextStyle: { color: muted, fontSize: 11 }
    },
    series: [{
      type: 'line',
      data: [143.7, 157.6, 202.0, 259.8, 303.3, 341.6, 371.8],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: accent, width: 3 },
      itemStyle: {
        color: accent,
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: accent + '33' },
          { offset: 1, color: accent + '05' }
        ])
      },
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: accent2, type: 'dashed', width: 1.5 },
        label: {
          color: accent2,
          fontSize: 11,
          formatter: '招录人数\n{c}万'
        },
        data: [{ yAxis: 3.97, label: { formatter: '2025招录\n3.97万' } }]
      }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: 雷达图 ---
  var chart2 = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12
    },
    radar: {
      center: ['50%', '52%'],
      radius: '65%',
      indicator: [
        { name: '备考效率', max: 100 },
        { name: '个性化程度', max: 100 },
        { name: '面试练习', max: 100 },
        { name: '申论批改', max: 100 },
        { name: '选岗精准度', max: 100 },
        { name: '信息获取', max: 100 }
      ],
      axisName: { color: muted, fontSize: 11 },
      splitArea: { areaStyle: { color: ['transparent', bg2] } },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          name: '局长AI',
          value: [92, 95, 90, 88, 93, 96],
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: accent, width: 2.5 },
          areaStyle: { color: accent + '22' },
          itemStyle: { color: accent }
        },
        {
          name: '传统备考',
          value: [55, 30, 20, 15, 40, 35],
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: muted, width: 2, type: 'dashed' },
          areaStyle: { color: muted + '15' },
          itemStyle: { color: muted }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();