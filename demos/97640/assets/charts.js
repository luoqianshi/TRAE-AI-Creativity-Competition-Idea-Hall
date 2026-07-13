(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Radar (选课决策影响因素) ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      data: ['重要程度', '当前信息满足度'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    radar: {
      indicator: [
        { name: '给分松紧', max: 100 },
        { name: '考勤严格度', max: 100 },
        { name: '作业量', max: 100 },
        { name: '期末难度', max: 100 },
        { name: '课程干货', max: 100 },
        { name: '老师风格', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 13, fontWeight: 600 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: true, areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      name: '选课决策因素',
      type: 'radar',
      data: [
        {
          value: [92, 88, 85, 90, 78, 82],
          name: '重要程度',
          itemStyle: { color: accent },
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '33' }
        },
        {
          value: [35, 30, 28, 32, 25, 22],
          name: '当前信息满足度',
          itemStyle: { color: accent2 },
          lineStyle: { color: accent2, width: 2 },
          areaStyle: { color: accent2 + '33' }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: Bar (功能优先级与复杂度) ---
  var chartBar = echarts.init(document.getElementById('chart-bar'), null, { renderer: 'svg' });
  chartBar.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['用户价值', '实现复杂度'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['课程检索', '标签系统', '评价展示', 'AI总结', '评分体系'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    series: [
      {
        name: '用户价值',
        type: 'bar',
        barWidth: '28%',
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        data: [95, 88, 92, 85, 78]
      },
      {
        name: '实现复杂度',
        type: 'bar',
        barWidth: '28%',
        itemStyle: { color: accent2, borderRadius: [4, 4, 0, 0] },
        data: [45, 55, 40, 75, 35]
      }
    ]
  });
  window.addEventListener('resize', function() { chartBar.resize(); });
})();
