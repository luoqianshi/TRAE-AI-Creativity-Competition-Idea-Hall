(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Before vs After Efficiency ---
  var chartEff = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEff.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: 'rgba(17,24,39,0.95)',
      borderColor: rule,
      textStyle: { color: ink },
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['使用前', '使用后'],
      textStyle: { color: muted },
      bottom: 0
    },
    grid: { left: '8%', right: '8%', bottom: '15%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['新人上手周期(天)', '重复陌拜占比(%)', '客户流失率(%)', '合同回款逾期率(%)', '信息查询耗时(分钟)'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, interval: 0, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '数值',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(51,65,85,0.4)' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '使用前',
        type: 'bar',
        barWidth: '28%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#64748B' },
            { offset: 1, color: '#64748B44' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        data: [90, 75, 45, 35, 25]
      },
      {
        name: '使用后',
        type: 'bar',
        barWidth: '28%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '44' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        data: [14, 15, 8, 10, 3]
      }
    ]
  });
  window.addEventListener('resize', function() { chartEff.resize(); });

  // --- Chart: Sales Funnel ---
  var chartFunnel = echarts.init(document.getElementById('chart-funnel'), null, { renderer: 'svg' });
  chartFunnel.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: 'rgba(17,24,39,0.95)',
      borderColor: rule,
      textStyle: { color: ink },
      formatter: '{b}: {c} 家 ({d}%)'
    },
    color: [accent, '#3B82F6', '#6366F1', '#8B5CF6', '#A78BFA'],
    series: [
      {
        name: '客户转化漏斗',
        type: 'funnel',
        left: '10%',
        top: 20,
        bottom: 20,
        width: '45%',
        min: 0,
        max: 500,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          color: ink,
          fontSize: 12,
          formatter: '{b}\n{c}家'
        },
        itemStyle: {
          borderColor: rule,
          borderWidth: 1
        },
        data: [
          { value: 500, name: '潜在客户池' },
          { value: 320, name: '已拜访' },
          { value: 180, name: '意向客户' },
          { value: 95, name: '已报价' },
          { value: 48, name: '已签约' }
        ]
      },
      {
        name: '合同回款进度',
        type: 'funnel',
        left: '55%',
        top: 20,
        bottom: 20,
        width: '40%',
        min: 0,
        max: 48,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          color: ink,
          fontSize: 12,
          formatter: '{b}\n{c}份'
        },
        itemStyle: {
          borderColor: rule,
          borderWidth: 1
        },
        data: [
          { value: 48, name: '已签约合同' },
          { value: 42, name: '首付款到账' },
          { value: 35, name: '发货完成' },
          { value: 28, name: '验收通过' },
          { value: 25, name: '尾款结清' }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartFunnel.resize(); });
})();
