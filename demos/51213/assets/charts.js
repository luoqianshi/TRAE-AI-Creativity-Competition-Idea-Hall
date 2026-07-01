(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Flavor Radar ---
  var radarChart = echarts.init(document.getElementById('chart-flavor-radar'), null, { renderer: 'svg' });
  radarChart.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      data: ['本次冲煮', '目标风味'],
      bottom: 0,
      textStyle: { color: ink }
    },
    radar: {
      indicator: [
        { name: '酸度', max: 100 },
        { name: '甜感', max: 100 },
        { name: '醇厚度', max: 100 },
        { name: '余韵', max: 100 },
        { name: '清爽度', max: 100 },
        { name: '苦感控制', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      name: '风味对比',
      type: 'radar',
      data: [
        {
          value: [45, 35, 50, 40, 55, 30],
          name: '本次冲煮',
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
          areaStyle: { color: accent + '33' }
        },
        {
          value: [60, 70, 55, 65, 50, 60],
          name: '目标风味',
          lineStyle: { color: accent2, width: 2, type: 'dashed' },
          itemStyle: { color: accent2 },
          areaStyle: { color: accent2 + '22' }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { radarChart.resize(); });

  // --- Chart: Progress Curve ---
  var progressChart = echarts.init(document.getElementById('chart-progress'), null, { renderer: 'svg' });
  progressChart.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '8%', right: '8%', bottom: '12%', top: '12%' },
    xAxis: {
      type: 'category',
      data: ['第1次', '第3次', '第5次', '第7次', '第10次', '第12次', '第15次', '第18次', '第20次'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      min: 40,
      max: 95,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [{
      name: '综合评分',
      type: 'line',
      data: [48, 52, 58, 61, 68, 72, 78, 84, 88],
      smooth: true,
      lineStyle: { color: accent, width: 3 },
      itemStyle: { color: accent },
      areaStyle: { color: accent + '22' },
      symbolSize: 6
    }]
  });
  window.addEventListener('resize', function() { progressChart.resize(); });

  // --- Chart: Parameter Comparison ---
  var paramChart = echarts.init(document.getElementById('chart-params'), null, { renderer: 'svg' });
  paramChart.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
    legend: {
      data: ['调整前', '调整后'],
      bottom: 0,
      textStyle: { color: ink }
    },
    grid: { left: '12%', right: '8%', bottom: '15%', top: '10%' },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'category',
      data: ['闷蒸时间', '水流稳定性', '绕圈均匀度', '分段节奏', '总萃取时间'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink }
    },
    series: [
      {
        name: '调整前',
        type: 'bar',
        data: [40, 35, 45, 38, 50],
        itemStyle: { color: muted + '88', borderRadius: [0, 4, 4, 0] },
        barWidth: 14
      },
      {
        name: '调整后',
        type: 'bar',
        data: [78, 72, 80, 75, 82],
        itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] },
        barWidth: 14
      }
    ]
  });
  window.addEventListener('resize', function() { paramChart.resize(); });
})();
