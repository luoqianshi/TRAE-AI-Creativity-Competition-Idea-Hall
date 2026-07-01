(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Aging Trend ---
  var chartAging = echarts.init(document.getElementById('chart-aging'), null, { renderer: 'svg' });
  chartAging.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['60岁以上人口占比', '年死亡人数（百万）'],
      top: 0,
      textStyle: { color: muted }
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
      data: ['2020', '2025', '2030', '2035', '2040', '2045', '2050'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: [
      {
        type: 'value',
        name: '占比 (%)',
        min: 0,
        max: 40,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      {
        type: 'value',
        name: '死亡人数 (百万)',
        min: 8,
        max: 20,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '60岁以上人口占比',
        type: 'line',
        data: [18.7, 21.1, 25.5, 29.8, 33.2, 35.6, 38.5],
        smooth: true,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '44' },
              { offset: 1, color: accent + '05' }
            ]
          }
        }
      },
      {
        name: '年死亡人数（百万）',
        type: 'bar',
        yAxisIndex: 1,
        data: [9.9, 11.2, 13.5, 15.2, 16.8, 18.1, 19.3],
        itemStyle: {
          color: accent2 + '88',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '40%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartAging.resize(); });

})();
