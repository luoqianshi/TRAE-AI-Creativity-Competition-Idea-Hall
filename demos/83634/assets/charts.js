/**
 * charts.js — 自游人创意方案图表逻辑
 * 包含两个ECharts图表：
 *   1. 三大用户群体规模与增长趋势（柱状图+折线图）
 *   2. 用户痛点严重程度分布（雷达图）
 */
(function () {
  // 读取CSS变量，确保图表配色与主题一致
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ============================================================
  // 图1：三大用户群体规模与增长趋势
  // 双Y轴：左轴=群体规模（万人），右轴=年增长率（%）
  // ============================================================
  var chartUsers = echarts.init(
    document.getElementById('chart-users'),
    null,
    { renderer: 'svg' }
  );

  chartUsers.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      borderWidth: 1,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['群体规模（万人）', '年增长率（%）'],
      top: 5,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 16,
      itemHeight: 10
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '12%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['数字游民青年', '候鸟式旅居中年', '活力旅居养老族'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12, interval: 0 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '规模（万人）',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      {
        type: 'value',
        name: '增长率（%）',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '群体规模（万人）',
        type: 'bar',
        barWidth: '38%',
        data: [4000, 8000, 6000],
        itemStyle: {
          color: accent,
          borderRadius: [6, 6, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          color: ink,
          fontSize: 12,
          fontWeight: 600,
          formatter: '{c}万'
        }
      },
      {
        name: '年增长率（%）',
        type: 'line',
        yAxisIndex: 1,
        data: [15, 12, 18],
        itemStyle: { color: accent2 },
        lineStyle: { width: 2.5, color: accent2 },
        symbol: 'circle',
        symbolSize: 8,
        label: {
          show: true,
          position: 'top',
          color: accent2,
          fontSize: 12,
          fontWeight: 600,
          formatter: '{c}%'
        }
      }
    ]
  });

  window.addEventListener('resize', function () {
    chartUsers.resize();
  });

  // ============================================================
  // 图2：用户痛点严重程度分布
  // 雷达图：展示五大痛点在三大用户群体中的严重程度
  // ============================================================
  var chartPain = echarts.init(
    document.getElementById('chart-pain'),
    null,
    { renderer: 'svg' }
  );

  chartPain.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      borderWidth: 1,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['数字游民青年', '候鸟式旅居中年', '活力旅居养老族'],
      bottom: 5,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 16,
      itemHeight: 10
    },
    radar: {
      indicator: [
        { name: '信息碎片化', max: 10 },
        { name: '健康保障空白', max: 10 },
        { name: '社交孤立', max: 10 },
        { name: '养老选择受限', max: 10 },
        { name: '工作连续性差', max: 10 }
      ],
      center: ['50%', '48%'],
      radius: '62%',
      axisName: {
        color: ink,
        fontSize: 12,
        fontWeight: 600
      },
      splitLine: { lineStyle: { color: rule } },
      splitArea: {
        areaStyle: {
          color: ['rgba(45,122,95,0.02)', 'rgba(45,122,95,0.05)']
        }
      },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [9, 6, 8, 2, 9],
            name: '数字游民青年',
            itemStyle: { color: accent },
            lineStyle: { width: 2, color: accent },
            areaStyle: { color: 'rgba(45,122,95,0.15)' },
            symbolSize: 6
          },
          {
            value: [7, 7, 7, 5, 6],
            name: '候鸟式旅居中年',
            itemStyle: { color: accent2 },
            lineStyle: { width: 2, color: accent2 },
            areaStyle: { color: 'rgba(212,130,92,0.12)' },
            symbolSize: 6
          },
          {
            value: [6, 9, 9, 8, 3],
            name: '活力旅居养老族',
            itemStyle: { color: muted },
            lineStyle: { width: 2, color: muted },
            areaStyle: { color: 'rgba(122,115,107,0.10)' },
            symbolSize: 6
          }
        ]
      }
    ]
  });

  window.addEventListener('resize', function () {
    chartPain.resize();
  });
})();
