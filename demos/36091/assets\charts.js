// MemoryLight 创意提案 - 数据图表
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ---- Chart 1: 银发经济与AI市场规模（2024-2027） ----
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      data: ['银发经济规模(万亿元)', 'AI+健康/陪伴市场(千亿元)'],
      textStyle: { color: muted },
      top: 0
    },
    grid: { top: 50, left: 50, right: 50, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['2024', '2025', '2026', '2027E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: [
      {
        type: 'value', name: '万亿', nameTextStyle: { color: muted },
        axisLine: { show: false }, splitLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted }
      },
      {
        type: 'value', name: '千亿', nameTextStyle: { color: muted },
        axisLine: { show: false }, splitLine: { show: false },
        axisLabel: { color: muted }
      }
    ],
    series: [
      {
        name: '银发经济规模(万亿元)', type: 'bar',
        data: [9.6, 10.8, 12.0, 13.5],
        itemStyle: { color: accent, borderRadius: [6, 6, 0, 0] },
        barWidth: 28
      },
      {
        name: 'AI+健康/陪伴市场(千亿元)', type: 'line',
        yAxisIndex: 1,
        data: [9.2, 12.5, 16.0, 21.0],
        smooth: true, symbol: 'circle', symbolSize: 10,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 }
      }
    ]
  });
  window.addEventListener('resize', function () { chartMarket.resize(); });

  // ---- Chart 2: 老人使用AI类应用的核心痛点 ----
  var chartPain = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });
  chartPain.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}%' },
    grid: { top: 20, left: 140, right: 30, bottom: 30 },
    xAxis: {
      type: 'value', max: 80,
      axisLine: { show: false }, splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, formatter: '{value}%' }
    },
    yAxis: {
      type: 'category',
      data: ['操作复杂', '担心被骗', '看不清字', '不会打字', '没人聊天', '记忆衰退'],
      axisLine: { show: false },
      axisLabel: { color: ink, fontSize: 13 }
    },
    series: [{
      type: 'bar',
      data: [72, 68, 61, 55, 48, 42],
      itemStyle: {
        color: function (p) {
          return p.dataIndex < 3 ? accent : accent2;
        },
        borderRadius: [0, 6, 6, 0]
      },
      label: { show: true, position: 'right', color: ink, formatter: '{c}%' },
      barWidth: 18
    }]
  });
  window.addEventListener('resize', function () { chartPain.resize(); });

  // ---- Chart 3: MVP -> 演进路线雷达图 ----
  var chartRoadmap = echarts.init(document.getElementById('chart-roadmap'), null, { renderer: 'svg' });
  chartRoadmap.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      data: ['MVP（2026Q3）', 'V1.0（2026Q4）', 'V2.0（2027H1）'],
      textStyle: { color: muted }, top: 0
    },
    radar: {
      indicator: [
        { name: '老照片识别', max: 10 },
        { name: '语音故事生成', max: 10 },
        { name: '家族图谱', max: 10 },
        { name: '亲情互动', max: 10 },
        { name: '硬件适老化', max: 10 },
        { name: '隐私安全', max: 10 }
      ],
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      name: { textStyle: { color: muted, fontSize: 12 } }
    },
    series: [{
      type: 'radar',
      data: [
        { name: 'MVP（2026Q3）', value: [7, 7, 4, 3, 5, 6], areaStyle: { color: accent + '33' }, lineStyle: { color: accent } },
        { name: 'V1.0（2026Q4）', value: [8, 9, 7, 7, 6, 8], areaStyle: { color: accent2 + '33' }, lineStyle: { color: accent2 } },
        { name: 'V2.0（2027H1）', value: [9, 10, 9, 9, 9, 9], areaStyle: { color: muted + '33' }, lineStyle: { color: muted } }
      ]
    }]
  });
  window.addEventListener('resize', function () { chartRoadmap.resize(); });
})();
