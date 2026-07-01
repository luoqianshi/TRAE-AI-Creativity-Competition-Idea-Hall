// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Market Growth (Bar + Line) ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#1e293b',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['智能运动装备 (亿元)', '体育科技增速 (%)'],
      top: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: { top: 40, bottom: 30, left: 60, right: 60 },
    xAxis: {
      type: 'category',
      data: ['2021', '2022', '2023', '2024', '2025E', '2026E', '2027E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: [
      {
        type: 'value',
        name: '亿元',
        nameTextStyle: { color: muted },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted }
      },
      {
        type: 'value',
        name: '%',
        nameTextStyle: { color: muted },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted }
      }
    ],
    series: [
      {
        name: '智能运动装备 (亿元)',
        type: 'bar',
        data: [320, 410, 530, 680, 850, 1050, 1300],
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '40%'
      },
      {
        name: '体育科技增速 (%)',
        type: 'line',
        yAxisIndex: 1,
        data: [22, 28, 29, 28, 25, 24, 24],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent2, width: 2 },
        itemStyle: { color: accent2, borderWidth: 2, borderColor: bg2 }
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart: Radar (Phase Capability) ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      backgroundColor: '#1e293b',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['Phase 1 原型', 'Phase 2 完善', 'Phase 3 优化', 'Phase 4 发布'],
      top: 0,
      textStyle: { color: muted, fontSize: 11 }
    },
    radar: {
      indicator: [
        { name: '姿态识别', max: 100 },
        { name: '球路分析', max: 100 },
        { name: '实时反馈', max: 100 },
        { name: '训练计划', max: 100 },
        { name: '云端报告', max: 100 },
        { name: '社区功能', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          name: 'Phase 1 原型',
          value: [85, 60, 50, 20, 10, 0],
          areaStyle: { opacity: 0.15 },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          name: 'Phase 2 完善',
          value: [90, 80, 85, 70, 30, 10],
          areaStyle: { opacity: 0.1 },
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 }
        },
        {
          name: 'Phase 3 优化',
          value: [95, 90, 90, 90, 85, 75],
          areaStyle: { opacity: 0.08 },
          lineStyle: { color: '#ffd166', width: 2 },
          itemStyle: { color: '#ffd166' }
        },
        {
          name: 'Phase 4 发布',
          value: [98, 95, 95, 95, 95, 90],
          areaStyle: { opacity: 0.06 },
          lineStyle: { color: '#ef476f', width: 2 },
          itemStyle: { color: '#ef476f' }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
