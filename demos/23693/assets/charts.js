(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Asset Allocation (Conservative) ---
  var chartAllocation = echarts.init(document.getElementById('chart-allocation'), null, { renderer: 'svg' });
  chartAllocation.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted, fontSize: 12 }
    },
    color: [
      accent,
      accent2,
      '#818cf8',
      '#fbbf24',
      '#f87171',
      '#a78bfa',
      '#22d3ee'
    ],
    series: [
      {
        name: '资产配置',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
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
          { value: 35, name: '全美股票 (VTI)' },
          { value: 20, name: '全美债券 (BND)' },
          { value: 15, name: '发达市场 (VEA)' },
          { value: 10, name: '新兴市场 (VWO)' },
          { value: 10, name: '黄金 (GLD)' },
          { value: 7, name: '纳斯达克100 (QQQ)' },
          { value: 3, name: '现金' }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartAllocation.resize(); });

})();
