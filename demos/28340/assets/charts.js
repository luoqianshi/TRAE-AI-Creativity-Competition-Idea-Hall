(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Time Comparison ---
  var chartTime = echarts.init(document.getElementById('chart-time'), null, { renderer: 'svg' });
  chartTime.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['传统手动制作', 'Sheet2Slide AI生成'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 14, fontWeight: 600 }
    },
    yAxis: {
      type: 'value',
      name: '时间（分钟）',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 90, itemStyle: { color: muted + '80' } },
        { value: 5, itemStyle: { color: accent } }
      ],
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        formatter: function(p) { return p.value + '分钟'; },
        color: ink,
        fontSize: 14,
        fontWeight: 700
      }
    }]
  });
  window.addEventListener('resize', function() { chartTime.resize(); });

  // --- Chart: Market Potential ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    color: [accent, accent2, muted, accent + '99', accent2 + '99'],
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: bg2, borderWidth: 2 },
      label: { show: true, color: ink, fontSize: 13, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 45, name: '职场白领' },
        { value: 25, name: '学生群体' },
        { value: 20, name: '数据分析师' },
        { value: 10, name: '其他办公人群' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });
})();
