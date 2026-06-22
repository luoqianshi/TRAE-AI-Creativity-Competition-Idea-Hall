// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Market Trend (Bar + Line) ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['中小型出口工厂数量（万家）', '建站渗透率（%）'],
      top: 5,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      left: '3%', right: '4%', bottom: '3%', top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['2020', '2021', '2022', '2023', '2024', '2025E', '2026E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: '工厂数量（万家）',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11 }
      },
      {
        type: 'value',
        name: '渗透率（%）',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' }
      }
    ],
    series: [
      {
        name: '中小型出口工厂数量（万家）',
        type: 'bar',
        barWidth: '35%',
        data: [32, 34, 36, 38, 40, 42, 45],
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '建站渗透率（%）',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: [18, 20, 22, 25, 30, 35, 42],
        lineStyle: { color: accent2, width: 2.5 },
        itemStyle: { color: accent2 },
        symbol: 'circle',
        symbolSize: 7
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart: Region Distribution (Pie) ---
  var chartRegion = echarts.init(document.getElementById('chart-region'), null, { renderer: 'svg' });
  chartRegion.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}万家 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted, fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: bg2,
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: ink,
          fontSize: 11
        },
        labelLine: {
          lineStyle: { color: rule }
        },
        data: [
          { value: 12, name: '广东珠三角' },
          { value: 10, name: '浙江长三角' },
          { value: 6, name: '江苏' },
          { value: 5, name: '山东' },
          { value: 4, name: '福建' },
          { value: 3, name: '其他地区' }
        ],
        color: [accent, accent2, muted, accent + '99', accent2 + '99', rule]
      }
    ]
  });
  window.addEventListener('resize', function() { chartRegion.resize(); });
})();
