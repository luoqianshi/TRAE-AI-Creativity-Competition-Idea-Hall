(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Time Distribution ---
  var chartTime = echarts.init(document.getElementById('chart-time'), null, { renderer: 'svg' });
  chartTime.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}小时 ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: { color: muted, fontSize: 13 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: bg2,
        borderWidth: 3
      },
      label: {
        show: true,
        formatter: '{b}\n{c}h',
        color: ink,
        fontSize: 13,
        fontWeight: 600
      },
      labelLine: {
        lineStyle: { color: rule }
      },
      data: [
        { value: 1.5, name: '有效亲子陪伴', itemStyle: { color: accent } },
        { value: 3.5, name: '工作/通勤', itemStyle: { color: accent2 } },
        { value: 2.0, name: '家务琐事', itemStyle: { color: muted } },
        { value: 2.5, name: '孩子独处/其他', itemStyle: { color: rule } },
        { value: 6.5, name: '睡眠', itemStyle: { color: '#D4C8BC' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartTime.resize(); });

  // --- Chart: Market Growth ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      top: '5%',
      textStyle: { color: muted, fontSize: 13 }
    },
    grid: {
      left: '8%',
      right: '5%',
      bottom: '10%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['2023', '2024', '2025', '2026E', '2027E', '2028E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 13 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '市场规模（亿元）',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '亲子教育市场',
        type: 'bar',
        barWidth: '28%',
        itemStyle: { color: accent, borderRadius: [6, 6, 0, 0] },
        data: [320, 385, 460, 550, 650, 780]
      },
      {
        name: 'AI陪伴细分',
        type: 'bar',
        barWidth: '28%',
        itemStyle: { color: accent2, borderRadius: [6, 6, 0, 0] },
        data: [25, 45, 78, 120, 180, 260]
      },
      {
        name: '增长率',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: ink, width: 2, type: 'dashed' },
        itemStyle: { color: ink, borderWidth: 2, borderColor: bg2 },
        data: [null, null, null, 54, 50, 44]
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });
})();
