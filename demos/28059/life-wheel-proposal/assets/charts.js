(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Life Wheel Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    color: [accent, accent2],
    radar: {
      indicator: [
        { name: 'Romance', max: 10 },
        { name: 'Family', max: 10 },
        { name: 'Friends', max: 10 },
        { name: 'Money', max: 10 },
        { name: 'Mission', max: 10 },
        { name: 'Growth', max: 10 },
        { name: 'Body', max: 10 },
        { name: 'Mind', max: 10 },
        { name: 'Soul', max: 10 }
      ],
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: true, areaStyle: { color: [bg2, '#ffffff'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [3, 6, 7, 5, 4, 5, 4, 6, 5],
          name: 'Initial Score',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          value: [7, 8, 8, 8, 7, 8, 8, 8, 7],
          name: 'Target Score',
          areaStyle: { color: accent2 + '22' },
          lineStyle: { color: accent2, width: 2, type: 'dashed' },
          itemStyle: { color: accent2 }
        }
      ]
    }],
    legend: {
      data: ['Initial Score', 'Target Score'],
      bottom: 0,
      textStyle: { color: ink }
    },
    tooltip: { trigger: 'item', appendToBody: true }
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: Monthly Progress ---
  var chartProgress = echarts.init(document.getElementById('chart-progress'), null, { renderer: 'svg' });
  chartProgress.setOption({
    animation: false,
    color: [accent, accent2, muted],
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, formatter: '{value}%' }
    },
    series: [
      {
        name: 'Plan Completion',
        type: 'line',
        data: [15, 25, 35, 45, 55, 65, 72, 78, 85, 90, 95, 98],
        smooth: true,
        lineStyle: { width: 3 },
        areaStyle: { color: accent + '22' }
      },
      {
        name: 'Score Growth',
        type: 'line',
        data: [5, 12, 20, 30, 40, 50, 58, 65, 72, 78, 85, 90],
        smooth: true,
        lineStyle: { width: 3, type: 'dashed' }
      }
    ],
    legend: {
      bottom: 0,
      textStyle: { color: ink }
    },
    tooltip: { trigger: 'axis', appendToBody: true }
  });
  window.addEventListener('resize', function() { chartProgress.resize(); });
})();
