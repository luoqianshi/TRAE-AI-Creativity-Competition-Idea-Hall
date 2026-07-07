(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Users Distribution ---
  var chartUsers = echarts.init(document.getElementById('chart-users'), null, { renderer: 'svg' });
  chartUsers.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      bottom: '0%',
      textStyle: { color: muted },
      itemWidth: 12,
      itemHeight: 12
    },
    series: [{
      type: 'pie',
      radius: ['40%', '68%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: bg2,
        borderWidth: 3
      },
      label: {
        show: true,
        color: muted,
        formatter: '{b}\n{d}%'
      },
      labelLine: {
        lineStyle: { color: rule }
      },
      data: [
        { value: 28, name: '摄影爱好者', itemStyle: { color: accent } },
        { value: 22, name: '短视频博主', itemStyle: { color: accent2 } },
        { value: 20, name: '电商美工', itemStyle: { color: '#2dd4bf' } },
        { value: 18, name: '设计新人', itemStyle: { color: '#60a5fa' } },
        { value: 12, name: '学生从业者', itemStyle: { color: '#f472b6' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartUsers.resize(); });

  // --- Chart: Pain Points ---
  var chartPain = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });
  chartPain.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.4 } }
    },
    yAxis: {
      type: 'category',
      data: ['学习门槛高', '重复操作耗时', '教程不完整', '无自动提取工具'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontWeight: 600 },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 72, itemStyle: { color: '#f472b6', borderRadius: [0, 6, 6, 0] } },
        { value: 85, itemStyle: { color: '#60a5fa', borderRadius: [0, 6, 6, 0] } },
        { value: 78, itemStyle: { color: '#2dd4bf', borderRadius: [0, 6, 6, 0] } },
        { value: 92, itemStyle: { color: accent, borderRadius: [0, 6, 6, 0] } }
      ],
      barWidth: '50%',
      label: {
        show: true,
        position: 'right',
        color: muted,
        formatter: '{c}%'
      }
    }]
  });
  window.addEventListener('resize', function() { chartPain.resize(); });

  // --- Chart: Efficiency Comparison ---
  var chartEff = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEff.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      axisPointer: { type: 'shadow' }
    },
    legend: {
      top: '0%',
      textStyle: { color: muted }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['单张调色', '批量10张', '批量50张', '批量100张'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontWeight: 600 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '时间（分钟）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.4 } }
    },
    series: [
      {
        name: '传统手动调色',
        type: 'bar',
        data: [30, 300, 1500, 3000],
        itemStyle: { color: muted + '66', borderRadius: [6, 6, 0, 0] },
        barWidth: '30%'
      },
      {
        name: '调色工坊',
        type: 'bar',
        data: [0.08, 0.8, 4, 8],
        itemStyle: { color: accent, borderRadius: [6, 6, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartEff.resize(); });
})();
