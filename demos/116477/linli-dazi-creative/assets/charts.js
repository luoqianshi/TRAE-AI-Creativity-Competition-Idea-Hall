(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Market Comparison (Bar Chart) ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true
    },
    legend: {
      data: ['传统养老机构', '互联网养老平台', '邻里搭子'],
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
      data: ['服务门槛', '费用成本', '社交属性', '使用便捷性', '信任度'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink }
    },
    yAxis: {
      type: 'value',
      max: 10,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    color: [muted, accent2, accent],
    series: [
      {
        name: '传统养老机构',
        type: 'bar',
        data: [3, 2, 3, 2, 6],
        barWidth: '20%',
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '互联网养老平台',
        type: 'bar',
        data: [5, 4, 2, 5, 5],
        barWidth: '20%',
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '邻里搭子',
        type: 'bar',
        data: [9, 9, 9, 9, 8],
        barWidth: '20%',
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart: Value Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: {
      data: ['传统养老平台', '邻里搭子'],
      bottom: 0,
      textStyle: { color: muted }
    },
    radar: {
      indicator: [
        { name: '使用门槛', max: 10 },
        { name: '社交温度', max: 10 },
        { name: '经济成本', max: 10 },
        { name: '响应速度', max: 10 },
        { name: '信任程度', max: 10 },
        { name: '可持续性', max: 10 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    color: [muted, accent],
    series: [{
      type: 'radar',
      data: [
        {
          value: [4, 3, 3, 5, 5, 4],
          name: '传统养老平台',
          areaStyle: { color: muted + '33' },
          lineStyle: { width: 2 }
        },
        {
          value: [9, 9, 9, 8, 8, 8],
          name: '邻里搭子',
          areaStyle: { color: accent + '33' },
          lineStyle: { width: 2 }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
