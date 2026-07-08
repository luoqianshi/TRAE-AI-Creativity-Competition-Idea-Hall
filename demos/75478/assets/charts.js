(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var ink2 = style.getPropertyValue('--ink2').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();

  // --- Chart: Before/After Metrics Comparison ---
  var chartMetrics = echarts.init(document.getElementById('chart-metrics'), null, { renderer: 'svg' });
  chartMetrics.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#1a1a1a',
      borderColor: 'rgba(255,255,255,0.15)',
      textStyle: { color: '#f5f5f7', fontSize: 13 }
    },
    legend: {
      data: ['部署前', '部署后'],
      textStyle: { color: muted },
      bottom: 0,
      itemGap: 24
    },
    grid: { left: 90, right: 30, top: 30, bottom: 50 },
    yAxis: {
      type: 'category',
      data: ['试穿转化率', '平均客单价', '顾客满意度', '复购率'],
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisLabel: { color: ink2, fontSize: 13 }
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [{
      name: '部署前',
      type: 'bar',
      data: [22, 380, 65, 28],
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: 'rgba(255,255,255,0.12)'
      },
      barWidth: '30%'
    }, {
      name: '部署后',
      type: 'bar',
      data: [45, 608, 92, 42],
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: accent },
          { offset: 1, color: accent2 }
        ])
      },
      barWidth: '30%'
    }]
  });
  window.addEventListener('resize', function() { chartMetrics.resize(); });

  // --- Chart: 12-Month Sales Growth ---
  var chartGrowth = echarts.init(document.getElementById('chart-growth'), null, { renderer: 'svg' });
  chartGrowth.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#1a1a1a',
      borderColor: 'rgba(255,255,255,0.15)',
      textStyle: { color: '#f5f5f7', fontSize: 13 }
    },
    legend: {
      data: ['月销售额（万元）', '环比增长率'],
      textStyle: { color: muted },
      bottom: 0,
      itemGap: 24
    },
    grid: { left: 60, right: 60, top: 30, bottom: 50 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisLabel: { color: muted }
    },
    yAxis: [
      {
        type: 'value',
        name: '万元',
        nameTextStyle: { color: muted },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } },
        axisLabel: { color: muted }
      },
      {
        type: 'value',
        name: '增长率',
        nameTextStyle: { color: muted },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted, formatter: '{value}%' }
      }
    ],
    series: [{
      name: '月销售额（万元）',
      type: 'bar',
      data: [18, 22, 28, 35, 42, 55, 62, 72, 78, 85, 92, 105],
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: accent },
          { offset: 1, color: accent + '44' }
        ])
      },
      barWidth: '45%'
    }, {
      name: '环比增长率',
      type: 'line',
      yAxisIndex: 1,
      data: [0, 22, 27, 25, 20, 31, 13, 16, 8, 9, 8, 14],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: accent3, width: 2.5 },
      itemStyle: { color: accent3, borderColor: bg, borderWidth: 2 }
    }]
  });
  window.addEventListener('resize', function() { chartGrowth.resize(); });
})();