(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var highlight = style.getPropertyValue('--highlight').trim();

  // --- Chart: Market Trend ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['市场规模', '增长率'], bottom: 0, textStyle: { color: muted } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['2020', '2021', '2022', '2023', '2024', '2025', '2026E'],
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
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { formatter: '{value}%', color: muted }
      }
    ],
    series: [
      {
        name: '市场规模',
        type: 'bar',
        data: [580, 620, 680, 710, 700, 752, 800],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '40%'
      },
      {
        name: '增长率',
        type: 'line',
        yAxisIndex: 1,
        data: [null, 6.9, 9.7, 4.4, -1.4, 7.4, 6.4],
        itemStyle: { color: accent2 },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart: Radar Comparison ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: { bottom: 0, textStyle: { color: muted } },
    radar: {
      indicator: [
        { name: '工具实用性', max: 10 },
        { name: '数据智能', max: 10 },
        { name: '社区活跃', max: 10 },
        { name: '用户体验', max: 10 },
        { name: '变现效率', max: 10 },
        { name: '小程序生态', max: 10 }
      ],
      shape: 'polygon',
      splitArea: { areaStyle: { color: [bg2, 'rgba(5,150,105,0.03)'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } },
      axisName: { color: muted, fontSize: 12 }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [9, 8, 6, 8, 7, 9],
          name: '今日宜钓',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          value: [7, 4, 5, 5, 5, 3],
          name: '钓鱼人APP',
          areaStyle: { color: accent2 + '22' },
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 }
        },
        {
          value: [6, 3, 3, 6, 4, 4],
          name: '钓鱼通APP',
          areaStyle: { color: muted + '22' },
          lineStyle: { color: muted, width: 2 },
          itemStyle: { color: muted }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: Revenue Pie ---
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}%' },
    legend: { bottom: 0, textStyle: { color: muted } },
    color: [accent, accent2, highlight, '#7C3AED'],
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg2, borderWidth: 3 },
      label: { show: true, formatter: '{b}\n{c}%', color: ink, fontSize: 13 },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 40, name: '渔具电商佣金' },
        { value: 25, name: '会员订阅服务' },
        { value: 20, name: '钓场预订抽成' },
        { value: 15, name: '品牌广告合作' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });
})();
