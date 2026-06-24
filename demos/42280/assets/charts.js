// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Market Trend ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['独居人口（万人）', '情绪经济规模（万亿元）'],
      top: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['2020', '2021', '2022', '2023', '2024', '2025E', '2026E', '2027E', '2028E', '2029E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: '万人',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11 }
      },
      {
        type: 'value',
        name: '万亿元',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 }
      }
    ],
    series: [
      {
        name: '独居人口（万人）',
        type: 'bar',
        yAxisIndex: 0,
        data: [5800, 6200, 6600, 7000, 7400, 7700, 8000, 8300, 8600, 8900],
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%'
      },
      {
        name: '情绪经济规模（万亿元）',
        type: 'line',
        yAxisIndex: 1,
        data: [1.2, 1.4, 1.6, 1.8, 2.3, 2.7, 3.1, 3.5, 4.0, 4.6],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2, borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 + '40' },
              { offset: 1, color: accent2 + '05' }
            ]
          }
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });
})();
