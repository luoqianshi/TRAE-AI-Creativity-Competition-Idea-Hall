(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // ===== Chart 1: Age Distribution (Pie) =====
  var chartAge = echarts.init(document.getElementById('chart-age'), null, { renderer: 'svg' });
  chartAge.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted, fontSize: 13 },
      itemWidth: 14,
      itemHeight: 14
    },
    color: [accent, accent2, '#4A90D9', '#2ECC71', '#E04060', muted],
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: bg,
        borderWidth: 2
      },
      label: {
        show: true,
        color: ink,
        fontSize: 12,
        formatter: '{b}\n{d}%'
      },
      labelLine: {
        lineStyle: { color: rule }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.3)'
        }
      },
      data: [
        { value: 28, name: '18-24 岁' },
        { value: 35, name: '25-30 岁' },
        { value: 22, name: '31-35 岁' },
        { value: 8, name: '36-40 岁' },
        { value: 5, name: '41-45 岁' },
        { value: 2, name: '45 岁以上' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartAge.resize(); });

  // ===== Chart 2: Key Factors (Radar) =====
  var chartFactors = echarts.init(document.getElementById('chart-factors'), null, { renderer: 'svg' });
  chartFactors.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['Z 世代消费者', '传统消费者'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 13 },
      itemWidth: 14,
      itemHeight: 14
    },
    radar: {
      indicator: [
        { name: '价格透明度', max: 100 },
        { name: '款式多样性', max: 100 },
        { name: '品牌知名度', max: 100 },
        { name: '设计独特性', max: 100 },
        { name: '社交分享性', max: 100 },
        { name: '售后服务', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: muted,
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: rule }
      },
      splitArea: {
        areaStyle: {
          color: [bg2, bg]
        }
      },
      axisLine: {
        lineStyle: { color: rule }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [92, 85, 60, 88, 90, 55],
          name: 'Z 世代消费者',
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
          areaStyle: { color: accent, opacity: 0.15 }
        },
        {
          value: [50, 55, 90, 45, 30, 85],
          name: '传统消费者',
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 },
          areaStyle: { color: accent2, opacity: 0.15 }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartFactors.resize(); });

  // ===== Chart 3: Decision Cycle Comparison (Bar) =====
  var chartComparison = echarts.init(document.getElementById('chart-comparison'), null, { renderer: 'svg' });
  chartComparison.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['传统方式', '使用宝石搭子'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 13 },
      itemWidth: 14,
      itemHeight: 14
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
      data: ['信息搜集', '款式筛选', '价格对比', '最终决策', '总耗时'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '耗时（小时）',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统方式',
        type: 'bar',
        barWidth: '30%',
        itemStyle: { color: muted, borderRadius: [3, 3, 0, 0] },
        data: [3, 4, 2, 3, 12]
      },
      {
        name: '使用宝石搭子',
        type: 'bar',
        barWidth: '30%',
        itemStyle: { color: accent, borderRadius: [3, 3, 0, 0] },
        data: [0.1, 0.3, 0.1, 0.2, 0.7]
      }
    ]
  });
  window.addEventListener('resize', function() { chartComparison.resize(); });
})();
