(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bgDeep = style.getPropertyValue('--bg-deep').trim();
  var starGold = style.getPropertyValue('--star-gold').trim();

  // --- Chart: Supply-Demand Gap ---
  var chart1 = echarts.init(document.getElementById('chart-gap'), null, { renderer: 'svg' });
  chart1.setOption({
    tooltip: { trigger: 'axis', appendToBody: true },
    animation: false,
    grid: { left: '3%', right: '4%', top: '12%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['自闭症儿童', '持证康复师', '年新增患者', '获得干预比例'],
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: rule + '44' } },
      axisLabel: { color: muted, fontSize: 10 }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 300, itemStyle: { color: accent, borderRadius: [6,6,0,0] } },
        { value: 5.8, itemStyle: { color: accent2, borderRadius: [6,6,0,0] } },
        { value: 15, itemStyle: { color: accent + '88', borderRadius: [6,6,0,0] } },
        { value: 28.3, itemStyle: { color: accent2 + '88', borderRadius: [6,6,0,0] } }
      ],
      barWidth: '50%',
      label: { show: true, position: 'top', color: ink, fontSize: 11, fontWeight: 700 }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: Market Growth ---
  var chart2 = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chart2.setOption({
    tooltip: { trigger: 'axis', appendToBody: true },
    animation: false,
    grid: { left: '3%', right: '4%', top: '12%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['2023', '2024', '2025', '2026E', '2027E', '2028E'],
      axisLabel: { color: muted, fontSize: 10 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '亿元',
      nameTextStyle: { color: muted, fontSize: 10 },
      splitLine: { lineStyle: { color: rule + '44' } },
      axisLabel: { color: muted, fontSize: 10 }
    },
    series: [{
      type: 'line',
      data: [85, 118, 139, 162, 195, 235],
      smooth: true,
      lineStyle: { color: accent, width: 3 },
      itemStyle: { color: accent },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: accent + '44' },
          { offset: 1, color: accent + '00' }
        ])
      },
      symbol: 'circle',
      symbolSize: 8
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();