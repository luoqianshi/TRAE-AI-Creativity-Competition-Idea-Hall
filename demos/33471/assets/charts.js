(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var danger = style.getPropertyValue('--danger').trim();
  var warning = style.getPropertyValue('--warning').trim();

  // --- Chart: Market Comparison (Radar) ---
  var chartComparison = echarts.init(document.getElementById('chart-comparison'), null, { renderer: 'svg' });
  chartComparison.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['Windows 自带工具', '专业付费工具', 'Disken'],
      bottom: 10,
      textStyle: { color: muted },
      itemWidth: 16,
      itemHeight: 10
    },
    radar: {
      indicator: [
        { name: '搜索速度', max: 10 },
        { name: '可视化', max: 10 },
        { name: '健康监控', max: 10 },
        { name: '中文支持', max: 10 },
        { name: '易用性', max: 10 },
        { name: '无广告', max: 10 },
        { name: '性价比', max: 10 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: {
        areaStyle: {
          color: ['transparent', 'rgba(59,130,246,0.03)', 'transparent', 'rgba(59,130,246,0.03)']
        }
      },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [2, 1, 1, 10, 8, 10, 10],
          name: 'Windows 自带工具',
          lineStyle: { color: muted, width: 2 },
          areaStyle: { color: muted + '22' },
          itemStyle: { color: muted }
        },
        {
          value: [8, 9, 9, 3, 4, 5, 3],
          name: '专业付费工具',
          lineStyle: { color: warning, width: 2 },
          areaStyle: { color: warning + '22' },
          itemStyle: { color: warning }
        },
        {
          value: [10, 9, 8, 10, 10, 10, 9],
          name: 'Disken',
          lineStyle: { color: accent, width: 3 },
          areaStyle: { color: accent + '33' },
          itemStyle: { color: accent }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartComparison.resize(); });

  // --- Chart: Target Users (Pie) ---
  var chartUsers = echarts.init(document.getElementById('chart-users'), null, { renderer: 'svg' });
  chartUsers.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: { color: muted },
      itemWidth: 14,
      itemHeight: 14
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: bg2,
        borderWidth: 3
      },
      label: {
        show: true,
        color: ink,
        formatter: '{b}\n{c}%'
      },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 45, name: '电脑小白用户', itemStyle: { color: accent } },
        { value: 30, name: '效率追求者', itemStyle: { color: accent2 } },
        { value: 15, name: '个人家庭用户', itemStyle: { color: warning } },
        { value: 10, name: '其他用户', itemStyle: { color: muted } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartUsers.resize(); });
})();
