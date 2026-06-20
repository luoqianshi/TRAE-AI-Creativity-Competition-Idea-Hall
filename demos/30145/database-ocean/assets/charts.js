(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Memory Comparison ---
  var chartMemory = echarts.init(document.getElementById('chart-memory'), null, { renderer: 'svg' });
  chartMemory.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Database Ocean\n(Tauri)', 'DBeaver\n(Java/Eclipse)', 'Navicat\n(Native)', 'DataGrip\n(Java)', 'TablePlus\n(Native)'],
      axisLabel: { color: muted, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '内存占用 (MB)',
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 45, itemStyle: { color: accent } },
        { value: 380, itemStyle: { color: muted } },
        { value: 120, itemStyle: { color: muted } },
        { value: 520, itemStyle: { color: muted } },
        { value: 85, itemStyle: { color: muted } }
      ],
      barWidth: '50%',
      label: { show: true, position: 'top', color: ink, fontWeight: 600 }
    }]
  });
  window.addEventListener('resize', function() { chartMemory.resize(); });

  // --- Chart: Package Size Comparison ---
  var chartSize = echarts.init(document.getElementById('chart-size'), null, { renderer: 'svg' });
  chartSize.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c} MB ({d}%)' },
    legend: { bottom: 0, textStyle: { color: muted } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg2, borderWidth: 2 },
      label: { show: true, color: ink, formatter: '{b}\n{c} MB' },
      data: [
        { value: 18, name: 'Database Ocean', itemStyle: { color: accent } },
        { value: 180, name: 'DBeaver', itemStyle: { color: muted } },
        { value: 350, name: 'DataGrip', itemStyle: { color: rule } },
        { value: 85, name: 'Navicat', itemStyle: { color: accent2 } },
        { value: 65, name: 'TablePlus', itemStyle: { color: '#4a6fa5' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartSize.resize(); });

  // --- Chart: Tech Stack Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: { bottom: 0, textStyle: { color: muted } },
    radar: {
      indicator: [
        { name: '轻量性', max: 100 },
        { name: '跨平台', max: 100 },
        { name: '功能丰富', max: 100 },
        { name: '性能', max: 100 },
        { name: '开源免费', max: 100 },
        { name: '易用性', max: 100 }
      ],
      axisName: { color: muted },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [95, 95, 75, 90, 100, 88],
          name: 'Database Ocean',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          value: [40, 85, 95, 60, 100, 70],
          name: 'DBeaver',
          areaStyle: { color: muted + '22' },
          lineStyle: { color: muted, width: 2 },
          itemStyle: { color: muted }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
