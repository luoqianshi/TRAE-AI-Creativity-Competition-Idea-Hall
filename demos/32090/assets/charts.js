(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Scenario Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-scenarios'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    radar: {
      indicator: [
        { name: '宠物养护', max: 100 },
        { name: '植物培育', max: 100 },
        { name: '职业发展', max: 100 },
        { name: '阅读学习', max: 100 },
        { name: '情感修复', max: 100 },
        { name: '自我提升', max: 100 }
      ],
      axisName: { color: muted, fontSize: 12 },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [85, 70, 90, 75, 60, 95],
          name: '使用计划帮手前',
          areaStyle: { color: accent2 + '33' },
          lineStyle: { color: accent2 },
          itemStyle: { color: accent2 }
        },
        {
          value: [95, 90, 98, 92, 85, 98],
          name: '使用计划帮手后',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent },
          itemStyle: { color: accent }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: Feature Priority Bar ---
  var chartBar = echarts.init(document.getElementById('chart-features'), null, { renderer: 'svg' });
  chartBar.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
    yAxis: {
      type: 'category',
      data: ['智能提醒', '进度追踪', '习惯养成', '目标分解', '数据可视化', '社交监督'],
      axisLabel: { color: ink },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 92, itemStyle: { color: accent } },
        { value: 88, itemStyle: { color: accent } },
        { value: 85, itemStyle: { color: accent } },
        { value: 90, itemStyle: { color: accent } },
        { value: 78, itemStyle: { color: accent2 } },
        { value: 72, itemStyle: { color: accent2 } }
      ],
      barWidth: '60%',
      label: { show: true, position: 'right', color: ink, formatter: '{c}%' }
    }]
  });
  window.addEventListener('resize', function() { chartBar.resize(); });
})();
