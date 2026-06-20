(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Revenue Model ---
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['年轻端订阅', 'B端企业合作', '政府/公益补贴'],
      bottom: 0,
      textStyle: { color: muted }
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
      data: ['第1年', '第2年', '第3年'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '收入（万元）',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    color: [accent, accent2, muted],
    series: [
      {
        name: '年轻端订阅',
        type: 'bar',
        stack: 'total',
        data: [30, 120, 350],
        itemStyle: { borderRadius: [0, 0, 0, 0] }
      },
      {
        name: 'B端企业合作',
        type: 'bar',
        stack: 'total',
        data: [5, 40, 150],
        itemStyle: { borderRadius: [0, 0, 0, 0] }
      },
      {
        name: '政府/公益补贴',
        type: 'bar',
        stack: 'total',
        data: [10, 25, 60],
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });
})();
