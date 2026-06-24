(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Survey (Pie) ---
  var chartSurvey = echarts.init(document.getElementById('chart-survey'), null, { renderer: 'svg' });
  chartSurvey.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {d}%' },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted },
      itemWidth: 12,
      itemHeight: 12
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      label: { show: true, color: ink, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 35, name: 'B站/视频平台', itemStyle: { color: accent } },
        { value: 22, name: '搜索引擎', itemStyle: { color: accent2 } },
        { value: 18, name: '贴吧/论坛', itemStyle: { color: muted } },
        { value: 12, name: 'Wiki 百科', itemStyle: { color: accent + 'aa' } },
        { value: 8, name: '游戏内指引', itemStyle: { color: accent2 + 'aa' } },
        { value: 5, name: '其他', itemStyle: { color: rule } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartSurvey.resize(); });

  // --- Chart: Market Growth (Bar + Line) ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      data: ['市场规模', '玩家数量(亿)'],
      textStyle: { color: muted },
      bottom: 0
    },
    grid: { left: '8%', right: '8%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['2021', '2022', '2023', '2024', '2025', '2026E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: [
      {
        type: 'value',
        name: '市场规模(亿美元)',
        nameTextStyle: { color: muted },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted }
      },
      {
        type: 'value',
        name: '玩家数量(亿人)',
        nameTextStyle: { color: muted },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted }
      }
    ],
    series: [
      {
        name: '市场规模',
        type: 'bar',
        barWidth: '35%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '44' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        data: [1803, 1844, 1877, 1920, 1960, 2050]
      },
      {
        name: '玩家数量(亿)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2, borderColor: bg2, borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent2 + '33' },
            { offset: 1, color: accent2 + '05' }
          ])
        },
        data: [29.6, 30.5, 31.2, 32.0, 32.8, 33.5]
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });
})();
