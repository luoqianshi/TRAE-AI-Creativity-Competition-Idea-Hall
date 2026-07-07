(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 目标用户群体分布 ---
  var chartUser = echarts.init(document.getElementById('chart-user-distribution'), null, { renderer: 'svg' });
  chartUser.setOption({
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
      textStyle: { color: ink, fontSize: 13 },
      itemWidth: 14,
      itemHeight: 14
    },
    color: [accent, accent2, '#3B82F6', '#EC4899', '#8B5CF6'],
    series: [{
      name: '用户群体',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: bg2,
        borderWidth: 3
      },
      label: {
        show: true,
        formatter: '{b}\n{c}%',
        color: ink,
        fontSize: 12
      },
      labelLine: {
        lineStyle: { color: rule }
      },
      data: [
        { value: 35, name: '上班族（25-40岁）' },
        { value: 25, name: '减脂人群（20-35岁女性）' },
        { value: 20, name: '中老年及家属（50岁+）' },
        { value: 10, name: '孕产妇（25-35岁）' },
        { value: 10, name: '健身增肌人群（20-35岁）' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartUser.resize(); });

  // --- Chart: 健康饮食市场规模趋势 ---
  var chartMarket = echarts.init(document.getElementById('chart-market-trend'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['市场规模（亿元）', '增长率（%）'],
      top: 10,
      textStyle: { color: ink }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['2021', '2022', '2023', '2024', '2025E', '2026E', '2027E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: [
      {
        type: 'value',
        name: '亿元',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted }
      },
      {
        type: 'value',
        name: '增长率',
        min: 0,
        max: 25,
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted, formatter: '{value}%' }
      }
    ],
    color: [accent, accent2],
    series: [
      {
        name: '市场规模（亿元）',
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '66' }
          ])
        },
        data: [3200, 3650, 4200, 4850, 5600, 6450, 7400]
      },
      {
        name: '增长率（%）',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: accent2 },
        itemStyle: { color: accent2, borderWidth: 2, borderColor: '#fff' },
        data: [12.5, 14.1, 15.1, 15.5, 15.5, 15.2, 14.7]
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });
})();
