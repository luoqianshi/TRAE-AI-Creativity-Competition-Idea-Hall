(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Mood Trend (7 days) ---
  var chartMood = echarts.init(document.getElementById('chart-mood-trend'), null, { renderer: 'svg' });
  chartMood.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['孤独指数', '焦虑指数', '平静指数'],
      bottom: 0,
      textStyle: { color: muted }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['06-10', '06-11', '06-12', '06-13', '06-14', '06-15', '06-16'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '孤独指数',
        type: 'line',
        smooth: true,
        data: [35, 38, 42, 45, 55, 62, 78],
        lineStyle: { color: '#C0392B', width: 3 },
        itemStyle: { color: '#C0392B' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(192,57,43,0.25)' },
              { offset: 1, color: 'rgba(192,57,43,0.02)' }
            ]
          }
        }
      },
      {
        name: '焦虑指数',
        type: 'line',
        smooth: true,
        data: [28, 30, 25, 32, 40, 68, 45],
        lineStyle: { color: '#D68910', width: 3 },
        itemStyle: { color: '#D68910' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(214,137,16,0.25)' },
              { offset: 1, color: 'rgba(214,137,16,0.02)' }
            ]
          }
        }
      },
      {
        name: '平静指数',
        type: 'line',
        smooth: true,
        data: [55, 52, 50, 48, 38, 25, 30],
        lineStyle: { color: '#27AE60', width: 3 },
        itemStyle: { color: '#27AE60' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(39,174,96,0.25)' },
              { offset: 1, color: 'rgba(39,174,96,0.02)' }
            ]
          }
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartMood.resize(); });
})();
