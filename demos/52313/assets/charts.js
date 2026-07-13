// 图表逻辑
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 知识留存率对比 ---
  var chart1 = echarts.init(document.getElementById('chart-retention'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['传统收藏方式', '织知知识网络'],
      textStyle: { color: ink },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1天后', '3天后', '7天后', '14天后', '30天后'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '知识留存率 (%)',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '传统收藏方式',
        type: 'line',
        data: [65, 40, 25, 15, 8],
        smooth: true,
        lineStyle: { color: muted, width: 2 },
        itemStyle: { color: muted },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: muted + '33' },
              { offset: 1, color: muted + '05' }
            ]
          }
        }
      },
      {
        name: '织知知识网络',
        type: 'line',
        data: [85, 78, 72, 68, 62],
        smooth: true,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '44' },
              { offset: 1, color: accent + '08' }
            ]
          }
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: 用户痛点分布 ---
  var chart2 = echarts.init(document.getElementById('chart-painpoints'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: ink, fontSize: 13 }
    },
    series: [
      {
        name: '用户痛点分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: bg2,
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: ink
          }
        },
        labelLine: { show: false },
        data: [
          { value: 35, name: '收藏后从不回看', itemStyle: { color: accent } },
          { value: 28, name: '知识零散不成体系', itemStyle: { color: accent2 } },
          { value: 20, name: '找不到需要的信息', itemStyle: { color: '#8B5CF6' } },
          { value: 12, name: '整理成本太高', itemStyle: { color: '#F59E0B' } },
          { value: 5, name: '其他', itemStyle: { color: muted } }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });

  // --- Chart: 效率提升 ---
  var chart3 = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chart3.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '时间（分钟/周）',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: ['知识整理', '信息检索', '复习巩固', '内容输入'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13 }
    },
    series: [
      {
        name: '使用前',
        type: 'bar',
        data: [120, 80, 60, 180],
        itemStyle: { color: muted + '88', borderRadius: [0, 4, 4, 0] },
        barWidth: 16
      },
      {
        name: '使用后',
        type: 'bar',
        data: [15, 25, 45, 180],
        itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] },
        barWidth: 16
      }
    ]
  });
  window.addEventListener('resize', function() { chart3.resize(); });

})();
