(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Cost Breakdown ---
  var chartCost = echarts.init(document.getElementById('chart-cost'), null, { renderer: 'svg' });
  chartCost.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Vercel 托管', 'Supabase', '高德地图', '百度 OCR', '域名'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '月费用（元）',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 0, itemStyle: { color: accent } },
        { value: 0, itemStyle: { color: accent } },
        { value: 0, itemStyle: { color: accent } },
        { value: 25, itemStyle: { color: accent2 } },
        { value: 4, itemStyle: { color: muted } }
      ],
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        formatter: '{c} 元',
        color: ink,
        fontWeight: 'bold'
      },
      itemStyle: { borderRadius: [8, 8, 0, 0] }
    }]
  });
  window.addEventListener('resize', function() { chartCost.resize(); });

  // --- Chart: Algorithm Weight ---
  var chartAlgo = echarts.init(document.getElementById('chart-algorithm'), null, { renderer: 'svg' });
  chartAlgo.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {d}%'
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: { color: ink, fontSize: 13 }
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
        formatter: '{b}\n{d}%',
        color: ink,
        fontSize: 13,
        fontWeight: 'bold'
      },
      labelLine: {
        lineStyle: { color: rule }
      },
      data: [
        { value: 70, name: '价格因素', itemStyle: { color: accent } },
        { value: 30, name: '距离因素', itemStyle: { color: accent2 } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartAlgo.resize(); });
})();
