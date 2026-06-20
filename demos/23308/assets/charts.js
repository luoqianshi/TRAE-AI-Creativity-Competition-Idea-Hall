// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Myopia Rate & Screen Time by Age ---
  var chart = echarts.init(document.getElementById('chart-myopia'), null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['近视率(%)', '日均手机使用时长(h)'],
      top: 5,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      left: 50,
      right: 50,
      bottom: 40,
      top: 50
    },
    xAxis: {
      type: 'category',
      data: ['6-8岁', '9-11岁', '12-14岁', '15-17岁', '18-25岁', '26-35岁', '36-50岁', '50岁以上'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '近视率(%)',
        nameTextStyle: { color: muted, fontSize: 11 },
        max: 100,
        axisLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      {
        type: 'value',
        name: '使用时长(h)',
        nameTextStyle: { color: muted, fontSize: 11 },
        max: 10,
        axisLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '近视率(%)',
        type: 'bar',
        yAxisIndex: 0,
        barWidth: '35%',
        data: [35, 55, 72, 80, 78, 65, 52, 45],
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '日均手机使用时长(h)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent2, width: 2.5 },
        itemStyle: { color: accent2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 + '30' },
              { offset: 1, color: accent2 + '05' }
            ]
          }
        },
        data: [1.5, 2.5, 4.0, 5.5, 7.0, 6.5, 5.0, 3.5]
      }
    ]
  });
  window.addEventListener('resize', function() { chart.resize(); });
})();
