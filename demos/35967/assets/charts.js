(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 近视率趋势 ---
  var chart1 = echarts.init(document.getElementById('chart-myopia-trend'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '10%', right: '8%', top: '12%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '近视率 (%)',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: bg2 } }
    },
    series: [{
      name: '儿童近视率',
      type: 'line',
      data: [53.6, 55.0, 58.0, 60.0, 61.5, 62.8, 64.0],
      smooth: true,
      lineStyle: { color: accent, width: 3 },
      itemStyle: { color: accent },
      areaStyle: { color: accent + '22' },
      symbol: 'circle',
      symbolSize: 8
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: 产品功能雷达图 ---
  var chart2 = echarts.init(document.getElementById('chart-feature-radar'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: 'AI远眺检测', max: 100 },
        { name: '坐姿监测', max: 100 },
        { name: '环境光检测', max: 100 },
        { name: '积分激励', max: 100 },
        { name: '家长语音', max: 100 },
        { name: '隐私保护', max: 100 }
      ],
      axisName: { color: ink, fontSize: 13 },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [95, 85, 90, 88, 92, 98],
        name: 'AI护眼桌面伴侣',
        areaStyle: { color: accent + '33' },
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent }
      }]
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });

  // --- Chart: 护眼循环完成率对比 ---
  var chart3 = echarts.init(document.getElementById('chart-completion-compare'), null, { renderer: 'svg' });
  chart3.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['无辅助', '普通闹钟', 'AI护眼伴侣'], textStyle: { color: muted }, bottom: 0 },
    grid: { left: '10%', right: '8%', top: '12%', bottom: '18%' },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '完成率 (%)',
      nameTextStyle: { color: muted },
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: bg2 } }
    },
    series: [
      {
        name: '无辅助',
        type: 'bar',
        data: [15, 12, 10, 8],
        itemStyle: { color: muted + '66' }
      },
      {
        name: '普通闹钟',
        type: 'bar',
        data: [35, 30, 28, 25],
        itemStyle: { color: accent2 + '88' }
      },
      {
        name: 'AI护眼伴侣',
        type: 'bar',
        data: [65, 78, 85, 90],
        itemStyle: { color: accent }
      }
    ]
  });
  window.addEventListener('resize', function() { chart3.resize(); });
})();
