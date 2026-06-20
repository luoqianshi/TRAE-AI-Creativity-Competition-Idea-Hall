(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Satisfaction ---
  var chartSatisfaction = echarts.init(document.getElementById('chart-satisfaction'), null, { renderer: 'svg' });
  chartSatisfaction.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['使用前满意度', '使用后满意度'],
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
      data: ['材料准备', '排队等待', '流程清晰度', '整体体验', '推荐意愿'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, formatter: '{value}%' }
    },
    series: [
      {
        name: '使用前满意度',
        type: 'bar',
        data: [35, 28, 32, 30, 25],
        itemStyle: { color: muted + '80', borderRadius: [6, 6, 0, 0] },
        barWidth: '30%'
      },
      {
        name: '使用后满意度',
        type: 'bar',
        data: [88, 82, 91, 87, 85],
        itemStyle: { color: accent, borderRadius: [6, 6, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartSatisfaction.resize(); });

  // --- Chart: User Growth ---
  var chartGrowth = echarts.init(document.getElementById('chart-growth'), null, { renderer: 'svg' });
  chartGrowth.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['第1月', '第2月', '第3月', '第4月', '第5月', '第6月', '第7月', '第8月', '第9月', '第10月', '第11月', '第12月'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '累计用户（万人）',
        type: 'line',
        data: [0.5, 1.2, 2.8, 5.5, 9.2, 14, 20, 28, 38, 50, 65, 85],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent, borderColor: bg2, borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '40' },
              { offset: 1, color: accent + '05' }
            ]
          }
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartGrowth.resize(); });
})();
