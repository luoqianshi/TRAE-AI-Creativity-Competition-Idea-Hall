// assets/charts.js — 味记市场与用户洞察数据可视化
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ===== Chart 1: 目标用户画像分布 (Pie) =====
  var chart1 = echarts.init(document.getElementById('chart-user-profile'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}%'
    },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 13 },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20
    },
    series: [{
      type: 'pie',
      radius: ['42%', '72%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{c}%',
        color: ink,
        fontSize: 13,
        lineHeight: 18
      },
      labelLine: {
        lineStyle: { color: rule }
      },
      data: [
        { value: 42, name: '美食爱好者', itemStyle: { color: accent } },
        { value: 31, name: '健身人群', itemStyle: { color: accent2 } },
        { value: 18, name: '旅行探索者', itemStyle: { color: '#E8A87C' } },
        { value: 9, name: '其他', itemStyle: { color: muted + '66' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // ===== Chart 2: 饮食记录频率与坚持率 (Bar + Line) =====
  var chart2 = echarts.init(document.getElementById('chart-usage'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      top: 0,
      textStyle: { color: muted, fontSize: 13 },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '14%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['手动记录\n(传统方式)', '健身App\n(手动录入)', '社交平台\n(随手发)', '味记\n(拍照记录)'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, lineHeight: 16 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '日均记录次数',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11 }
      },
      {
        type: 'value',
        name: '30天坚持率 (%)',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 },
        max: 100
      }
    ],
    series: [
      {
        name: '日均记录次数',
        type: 'bar',
        barWidth: '36%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: accent
        },
        data: [0.8, 1.5, 1.2, 2.8]
      },
      {
        name: '30天坚持率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent2, width: 2.5 },
        itemStyle: { color: accent2 },
        data: [15, 35, 22, 82]
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
