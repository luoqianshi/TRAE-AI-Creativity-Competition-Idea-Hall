(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Growth ---
  var chartGrowth = echarts.init(document.getElementById('chart-growth'), null, { renderer: 'svg' });
  chartGrowth.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['活跃项目数', '注册用户'],
      bottom: 0,
      textStyle: { color: muted }
    },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['第1月','第2月','第3月','第4月','第5月','第6月','第7月','第8月','第9月','第10月','第11月','第12月'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '活跃项目数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: accent },
        itemStyle: { color: accent, borderWidth: 2, borderColor: bg2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '33' },
              { offset: 1, color: accent + '05' }
            ]
          }
        },
        data: [50, 120, 280, 520, 850, 1300, 1900, 2700, 3800, 5200, 7000, 10000]
      },
      {
        name: '注册用户',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: accent2 },
        itemStyle: { color: accent2, borderWidth: 2, borderColor: bg2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 + '33' },
              { offset: 1, color: accent2 + '05' }
            ]
          }
        },
        data: [80, 200, 500, 950, 1600, 2500, 3700, 5200, 7200, 9800, 13000, 18000]
      }
    ]
  });
  window.addEventListener('resize', function() { chartGrowth.resize(); });
})();
