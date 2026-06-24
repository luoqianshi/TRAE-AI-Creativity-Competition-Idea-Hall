// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Market Trend (Bar + Line) ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['网文市场规模（亿元）', '创作者数量（万人）'],
      top: 5,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      left: '3%', right: '4%', bottom: '3%', top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['2020', '2021', '2022', '2023', '2024', '2025E', '2026E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: '市场规模（亿元）',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11 }
      },
      {
        type: 'value',
        name: '创作者（万人）',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 }
      }
    ],
    series: [
      {
        name: '网文市场规模（亿元）',
        type: 'bar',
        barWidth: '35%',
        data: [188, 212, 238, 256, 276, 300, 328],
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '创作者数量（万人）',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: [1450, 1600, 1750, 1900, 2050, 2200, 2400],
        lineStyle: { color: accent2, width: 2.5 },
        itemStyle: { color: accent2 },
        symbol: 'circle',
        symbolSize: 7
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart: Survey (Horizontal Bar) ---
  var chartSurvey = echarts.init(document.getElementById('chart-survey'), null, { renderer: 'svg' });
  chartSurvey.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%', right: '10%', bottom: '3%', top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: [
        '担心 AI 写得没有灵魂',
        '担心平台判定抄袭',
        '价格太贵不值得',
        '不会用，上手太复杂',
        '试过但效果不好',
        '非常愿意尝试',
        '愿意尝试，能提效就行'
      ],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: ink, fontSize: 11 }
    },
    series: [
      {
        type: 'bar',
        barWidth: '60%',
        data: [
          { value: 35, itemStyle: { color: muted, borderRadius: [0, 4, 4, 0] } },
          { value: 28, itemStyle: { color: muted, borderRadius: [0, 4, 4, 0] } },
          { value: 22, itemStyle: { color: muted, borderRadius: [0, 4, 4, 0] } },
          { value: 18, itemStyle: { color: muted, borderRadius: [0, 4, 4, 0] } },
          { value: 45, itemStyle: { color: accent2 + '99', borderRadius: [0, 4, 4, 0] } },
          { value: 62, itemStyle: { color: accent2, borderRadius: [0, 4, 4, 0] } },
          { value: 92, itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] } }
        ],
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: ink,
          fontSize: 11
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartSurvey.resize(); });
})();
