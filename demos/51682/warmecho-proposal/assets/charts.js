(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Growth (成长轨迹) ---
  var growthChart = echarts.init(document.getElementById('growth-chart'), null, { renderer: 'svg' });

  var months = ['1月', '2月', '3月', '4月', '5月', '6月'];
  var happyData = [12, 15, 10, 18, 22, 25];
  var anxiousData = [8, 6, 10, 5, 4, 3];

  growthChart.setOption({
    animation: false,
    backgroundColor: 'transparent',
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: bg2 } },
      axisLabel: { color: muted }
    },
    legend: {
      data: ['开心次数', '焦虑次数'],
      textStyle: { color: muted },
      bottom: 0,
      itemWidth: 14,
      itemHeight: 8
    },
    series: [
      {
        name: '开心次数',
        type: 'line',
        data: happyData,
        smooth: true,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: { color: accent + '33' }
      },
      {
        name: '焦虑次数',
        type: 'line',
        data: anxiousData,
        smooth: true,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 },
        areaStyle: { color: accent2 + '33' }
      }
    ]
  });
  window.addEventListener('resize', function() { growthChart.resize(); });
})();
