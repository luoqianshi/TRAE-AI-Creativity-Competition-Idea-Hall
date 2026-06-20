(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Market Forecast ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    grid: { left: '8%', right: '6%', bottom: '12%', top: '10%' },
    xAxis: {
      type: 'category',
      data: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '市场规模（亿美元）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      name: '市场规模',
      type: 'line',
      data: [28, 52, 95, 168, 290, 480, 750],
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
            { offset: 0, color: accent + '44' },
            { offset: 1, color: accent + '05' }
          ]
        }
      }
    }]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart: Task Distribution ---
  var chartTasks = echarts.init(document.getElementById('chart-tasks'), null, { renderer: 'svg' });
  chartTasks.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted },
      itemWidth: 14,
      itemHeight: 14
    },
    series: [{
      name: '可替代工作占比',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: bg2,
        borderWidth: 3
      },
      label: {
        show: true,
        color: ink,
        formatter: '{b}\n{d}%'
      },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 32, name: '邮件与沟通', itemStyle: { color: accent } },
        { value: 24, name: '文档与报告', itemStyle: { color: accent2 } },
        { value: 18, name: '会议与纪要', itemStyle: { color: muted } },
        { value: 14, name: '数据整理', itemStyle: { color: accent + 'aa' } },
        { value: 12, name: '社交运营', itemStyle: { color: accent2 + 'aa' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartTasks.resize(); });
})();
