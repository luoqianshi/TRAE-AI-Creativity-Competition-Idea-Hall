(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Trend ---
  var chartTrend = echarts.init(document.getElementById('chart-trend'), null, { renderer: 'svg' });
  chartTrend.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: 'rgba(10,22,40,0.9)',
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['播放量', '点赞数', '评论数'],
      textStyle: { color: muted },
      bottom: 0
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7','Day 8','Day 9','Day 10',
             'Day 11','Day 12','Day 13','Day 14','Day 15','Day 16','Day 17','Day 18','Day 19','Day 20',
             'Day 21','Day 22','Day 23','Day 24','Day 25','Day 26','Day 27','Day 28','Day 29','Day 30'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, opacity: 0.3 } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '播放量',
        type: 'line',
        smooth: true,
        data: [12000,15000,18000,22000,28000,35000,42000,38000,45000,52000,58000,65000,72000,68000,75000,82000,88000,95000,102000,98000,105000,112000,118000,125000,132000,128000,135000,142000,148000,155000],
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '40' },
              { offset: 1, color: accent + '05' }
            ]
          }
        }
      },
      {
        name: '点赞数',
        type: 'line',
        smooth: true,
        data: [800,1200,1600,2100,2800,3500,4200,3800,4500,5200,5800,6500,7200,6800,7500,8200,8800,9500,10200,9800,10500,11200,11800,12500,13200,12800,13500,14200,14800,15500],
        lineStyle: { color: accent3, width: 2 },
        itemStyle: { color: accent3 }
      },
      {
        name: '评论数',
        type: 'line',
        smooth: true,
        data: [120,180,250,320,400,480,550,520,600,680,750,820,900,850,920,1000,1080,1150,1220,1180,1250,1320,1380,1450,1520,1480,1550,1620,1680,1750],
        lineStyle: { color: accent2, width: 2 },
        itemStyle: { color: accent2 }
      }
    ]
  });
  window.addEventListener('resize', function() { chartTrend.resize(); });
})();
