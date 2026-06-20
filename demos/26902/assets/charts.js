(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Efficiency Comparison ---
  var chartEff = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEff.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['传统办案', '模法狮 AI SOP'],
      textStyle: { color: muted },
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['收案评估', '类案检索', '庭前准备', '庭审辅助', '文书草拟', '庭后复盘'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '时间（分钟）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '传统办案',
        type: 'bar',
        data: [120, 180, 150, 0, 240, 90],
        itemStyle: { color: muted + '80', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: '模法狮 AI SOP',
        type: 'bar',
        data: [15, 15, 30, 45, 60, 20],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartEff.resize(); });

  // --- Chart: Revenue Model ---
  var chartRev = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRev.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted }
    },
    series: [
      {
        name: '营收模式',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: bg2,
          borderWidth: 2
        },
        label: {
          show: true,
          color: ink,
          formatter: '{b}\n{c}%'
        },
        labelLine: {
          lineStyle: { color: rule }
        },
        data: [
          { value: 35, name: '律所团队版', itemStyle: { color: accent } },
          { value: 25, name: '个人会员', itemStyle: { color: accent2 } },
          { value: 20, name: '按量付费', itemStyle: { color: muted } },
          { value: 12, name: '公众版增值', itemStyle: { color: accent + '99' } },
          { value: 8, name: '其他', itemStyle: { color: accent2 + '99' } }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartRev.resize(); });
})();
