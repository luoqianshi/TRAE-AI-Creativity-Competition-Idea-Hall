(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Personas ---
  var chartPersonas = echarts.init(document.getElementById('chart-personas'), null, { renderer: 'svg' });
  chartPersonas.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}%' },
    color: [accent, accent2, muted, accent + '99', accent2 + '99'],
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: bg2, borderWidth: 3 },
      label: { show: true, color: ink, fontSize: 14, formatter: '{b}\n{c}%' },
      labelLine: { lineStyle: { color: muted } },
      data: [
        { value: 45, name: '好奇探索者' },
        { value: 30, name: '伴侣与家庭成员' },
        { value: 25, name: '有睡眠困扰者' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartPersonas.resize(); });

  // --- Chart: Business Model Revenue ---
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    color: [accent, accent2],
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['第1年', '第2年', '第3年', '第4年', '第5年'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '预估收入（万元）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '订阅服务',
        type: 'bar',
        stack: 'total',
        data: [0, 80, 250, 500, 900],
        itemStyle: { borderRadius: [0, 0, 0, 0] }
      },
      {
        name: '广告与内容付费',
        type: 'bar',
        stack: 'total',
        data: [0, 20, 100, 280, 600],
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      }
    ],
    legend: { data: ['订阅服务', '广告与内容付费'], textStyle: { color: ink }, top: 0 }
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });
})();
