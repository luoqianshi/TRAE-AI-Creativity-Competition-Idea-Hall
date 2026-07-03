// assets/charts.js — ECharts visualizations for AI Career Workbench
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var warn = style.getPropertyValue('--warn').trim();

  // === Chart 1: Revenue Structure (Pie) ===
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}万元 ({d}%)',
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      bottom: 10,
      left: 'center',
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20
    },
    color: [accent, accent2, accent3],
    series: [{
      name: '收入结构',
      type: 'pie',
      radius: ['40%', '68%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: bg2,
        borderWidth: 3
      },
      label: {
        show: true,
        position: 'outside',
        color: ink,
        fontSize: 12,
        formatter: '{b}\n{d}%'
      },
      labelLine: {
        show: true,
        lineStyle: { color: rule }
      },
      emphasis: {
        label: { fontSize: 14, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' }
      },
      data: [
        { value: 150, name: 'C端会员订阅' },
        { value: 105, name: 'B端企业服务' },
        { value: 45, name: '导师平台抽成' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });

  // === Chart 2: User Growth (Line + Bar) ===
  var chartGrowth = echarts.init(document.getElementById('chart-growth'), null, { renderer: 'svg' });
  chartGrowth.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      bottom: 5,
      left: 'center',
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 25
    },
    grid: { top: 40, left: 55, right: 100, bottom: 60 },
    xAxis: {
      type: 'category',
      data: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '新增用户(万)',
        nameTextStyle: { color: accent2, fontSize: 11 },
        axisLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.5 } },
        max: 10
      },
      {
        type: 'value',
        name: '累计用户(万)',
        nameTextStyle: { color: accent, fontSize: 11 },
        axisLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { show: false },
        max: 60
      },
      {
        type: 'value',
        name: '付费率(%)',
        nameTextStyle: { color: accent3, fontSize: 11 },
        axisLine: { show: false },
        axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' },
        splitLine: { show: false },
        max: 10,
        offset: 40
      }
    ],
    color: [accent2, accent, accent3],
    series: [
      {
        name: '新增用户(万)',
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 },
              { offset: 1, color: accent2 + '50' }
            ]
          }
        },
        data: [1.2, 1.8, 2.5, 3.0, 3.8, 4.5, 5.2, 5.8, 6.5, 7.0, 7.5, 8.0]
      },
      {
        name: '累计用户(万)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { width: 3, color: accent },
        itemStyle: { color: accent, borderColor: bg2, borderWidth: 2 },
        data: [1.2, 3.0, 5.5, 8.5, 12.3, 16.8, 22.0, 27.8, 34.3, 41.3, 48.8, 56.8]
      },
      {
        name: '付费转化率(%)',
        type: 'line',
        yAxisIndex: 2,
        smooth: true,
        symbol: 'diamond',
        symbolSize: 8,
        lineStyle: { width: 2, color: accent3, type: 'dashed' },
        itemStyle: { color: accent3 },
        data: [2.0, 2.5, 3.0, 3.5, 4.0, 4.8, 5.5, 6.0, 6.8, 7.2, 7.8, 8.0]
      }
    ]
  });
  window.addEventListener('resize', function() { chartGrowth.resize(); });

})();
