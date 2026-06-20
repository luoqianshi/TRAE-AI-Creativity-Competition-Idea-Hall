(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Time Comparison (Bar) ---
  var chartTime = echarts.init(document.getElementById('chart-time-compare'), null, { renderer: 'svg' });
  chartTime.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['传统手抄方式', 'AI工具方式'], textStyle: { color: muted }, bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['错题录入', '分类整理', '分析诊断', '生成复习卷', '总耗时'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink }
    },
    yAxis: {
      type: 'value',
      name: '时间（分钟）',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '传统手抄方式',
        type: 'bar',
        data: [30, 45, 20, 60, 155],
        itemStyle: { color: muted, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: 'AI工具方式',
        type: 'bar',
        data: [2, 1, 1, 1, 5],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartTime.resize(); });

  // --- Chart: Radar (Capability) ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: { data: ['当前能力', '目标能力'], textStyle: { color: muted }, bottom: 0 },
    radar: {
      indicator: [
        { name: '代数运算', max: 100 },
        { name: '几何证明', max: 100 },
        { name: '函数分析', max: 100 },
        { name: '概率统计', max: 100 },
        { name: '数列极限', max: 100 },
        { name: '导数应用', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 13 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: true, areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      name: '能力评估',
      type: 'radar',
      data: [
        {
          value: [85, 55, 70, 45, 60, 50],
          name: '当前能力',
          itemStyle: { color: accent },
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 }
        },
        {
          value: [90, 85, 85, 80, 80, 80],
          name: '目标能力',
          itemStyle: { color: accent2 },
          areaStyle: { color: accent2 + '22' },
          lineStyle: { color: accent2, width: 2, type: 'dashed' }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
