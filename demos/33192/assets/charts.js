// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 市场规模对比 ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['编程教育', '游戏化学习', '青少年内容', '心理健康'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: { top: 30, right: 20, bottom: 50, left: 50 },
    xAxis: {
      type: 'category',
      data: ['2022', '2023', '2024', '2025E', '2026E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '市场规模（亿元）',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    series: [
      {
        name: '编程教育',
        type: 'bar',
        stack: 'total',
        data: [125, 180, 260, 380, 520],
        itemStyle: { color: accent, borderRadius: [0, 0, 0, 0] }
      },
      {
        name: '游戏化学习',
        type: 'bar',
        stack: 'total',
        data: [80, 120, 175, 250, 340],
        itemStyle: { color: accent2 }
      },
      {
        name: '青少年内容',
        type: 'bar',
        stack: 'total',
        data: [60, 95, 140, 200, 280],
        itemStyle: { color: accent + '88' }
      },
      {
        name: '心理健康',
        type: 'bar',
        stack: 'total',
        data: [35, 55, 85, 130, 190],
        itemStyle: { color: accent2 + '88', borderRadius: [4, 4, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart: 竞品雷达图 ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['星芽 StarSeed', 'Scratch', '编程猫', '洪恩识字'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    radar: {
      indicator: [
        { name: '编程教育', max: 100 },
        { name: '游戏化体验', max: 100 },
        { name: '内容生态', max: 100 },
        { name: '心理健康', max: 100 },
        { name: 'AI 能力', max: 100 },
        { name: '社交协作', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [90, 92, 88, 95, 93, 90],
          name: '星芽 StarSeed',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '30' },
          itemStyle: { color: accent }
        },
        {
          value: [85, 60, 40, 20, 15, 70],
          name: 'Scratch',
          lineStyle: { color: '#4C97FF', width: 1.5 },
          areaStyle: { color: '#4C97FF20' },
          itemStyle: { color: '#4C97FF' }
        },
        {
          value: [80, 70, 50, 25, 55, 55],
          name: '编程猫',
          lineStyle: { color: '#FF6B35', width: 1.5 },
          areaStyle: { color: '#FF6B3520' },
          itemStyle: { color: '#FF6B35' }
        },
        {
          value: [30, 85, 60, 15, 40, 30],
          name: '洪恩识字',
          lineStyle: { color: '#9B59B6', width: 1.5 },
          areaStyle: { color: '#9B59B620' },
          itemStyle: { color: '#9B59B6' }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: 商业模式收入占比 ---
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: { color: muted, fontSize: 12 }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: ink }
      },
      data: [
        { value: 40, name: '星芽会员', itemStyle: { color: accent } },
        { value: 30, name: '学校合作', itemStyle: { color: accent2 } },
        { value: 15, name: '内容授权', itemStyle: { color: accent + '88' } },
        { value: 15, name: '赛事活动', itemStyle: { color: accent2 + '88' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });

  // --- Chart: 用户增长预测 ---
  var chartGrowth = echarts.init(document.getElementById('chart-growth'), null, { renderer: 'svg' });
  chartGrowth.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['注册用户（万）', '日活用户（万）', '合作学校（所）'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: { top: 30, right: 60, bottom: 50, left: 55 },
    xAxis: {
      type: 'category',
      data: ['M6', 'M12', 'M18', 'M24', 'M30', 'M36'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    yAxis: [
      {
        type: 'value',
        name: '用户数（万）',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 12 }
      },
      {
        type: 'value',
        name: '学校数（所）',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted, fontSize: 12 }
      }
    ],
    series: [
      {
        name: '注册用户（万）',
        type: 'line',
        smooth: true,
        data: [0.05, 5, 25, 50, 120, 200],
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent + '40' }, { offset: 1, color: accent + '05' }] } },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '日活用户（万）',
        type: 'line',
        smooth: true,
        data: [0.01, 0.8, 5, 10, 30, 55],
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent2 + '30' }, { offset: 1, color: accent2 + '05' }] } },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '合作学校（所）',
        type: 'bar',
        yAxisIndex: 1,
        data: [5, 50, 150, 300, 420, 500],
        itemStyle: { color: accent + '55', borderRadius: [3, 3, 0, 0] },
        barWidth: 20
      }
    ]
  });
  window.addEventListener('resize', function() { chartGrowth.resize(); });
})();
