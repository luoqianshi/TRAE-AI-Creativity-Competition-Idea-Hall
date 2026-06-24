(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Market Gap Radar ---
  var chartGap = echarts.init(document.getElementById('chart-market-gap'), null, { renderer: 'svg' });
  chartGap.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    radar: {
      indicator: [
        { name: '过程自动留痕', max: 100 },
        { name: '多类型作业支持', max: 100 },
        { name: '教育场景专用', max: 100 },
        { name: '客观贡献量化', max: 100 },
        { name: '异常自动检测', max: 100 },
        { name: '可申诉证据链', max: 100 }
      ],
      axisName: { color: muted },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        { value: [30, 25, 40, 35, 20, 30], name: '现有产品平均水平', itemStyle: { color: muted }, areaStyle: { color: muted + '33' } },
        { value: [95, 90, 95, 90, 88, 92], name: '本产品目标', itemStyle: { color: accent }, areaStyle: { color: accent + '33' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartGap.resize(); });

  // --- Chart: Contribution Timeline ---
  var chartTimeline = echarts.init(document.getElementById('chart-timeline'), null, { renderer: 'svg' });
  chartTimeline.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['成员A', '成员B', '成员C', '成员D'], textStyle: { color: muted } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周'], axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted } },
    yAxis: { type: 'value', name: '贡献指数', axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
    series: [
      { name: '成员A', type: 'line', data: [12, 18, 25, 30, 35, 42], itemStyle: { color: accent }, lineStyle: { width: 3 } },
      { name: '成员B', type: 'line', data: [10, 15, 20, 22, 25, 28], itemStyle: { color: accent2 }, lineStyle: { width: 3 } },
      { name: '成员C', type: 'line', data: [8, 10, 12, 12, 12, 12], itemStyle: { color: muted }, lineStyle: { width: 3, type: 'dashed' } },
      { name: '成员D', type: 'line', data: [5, 5, 6, 6, 6, 6], itemStyle: { color: '#e74c3c' }, lineStyle: { width: 3, type: 'dashed' } }
    ]
  });
  window.addEventListener('resize', function() { chartTimeline.resize(); });

  // --- Chart: Feature Priority ---
  var chartPriority = echarts.init(document.getElementById('chart-priority'), null, { renderer: 'svg' });
  chartPriority.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
    yAxis: { type: 'category', data: ['申诉与复议', '冲突预警', '贡献度报告', '智能分析', '自动留痕'], axisLine: { lineStyle: { color: rule } }, axisLabel: { color: ink } },
    series: [{
      type: 'bar',
      data: [
        { value: 75, itemStyle: { color: accent + 'cc' } },
        { value: 82, itemStyle: { color: accent + 'dd' } },
        { value: 90, itemStyle: { color: accent + 'ee' } },
        { value: 88, itemStyle: { color: accent + 'f0' } },
        { value: 95, itemStyle: { color: accent } }
      ],
      barWidth: '60%',
      label: { show: true, position: 'right', color: ink }
    }]
  });
  window.addEventListener('resize', function() { chartPriority.resize(); });
})();
