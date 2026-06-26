(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Efficiency Comparison ---
  var chartEff = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEff.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      appendToBody: true
    },
    legend: {
      data: ['传统审计', 'AI 智能审计'],
      textStyle: { color: muted },
      bottom: 0
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
      data: ['资料收集', '单据阅读', '数据比对', '外部核查', '底稿撰写', '总计'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '耗时（小时）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.5 } }
    },
    series: [
      {
        name: '传统审计',
        type: 'bar',
        data: [8, 24, 16, 12, 10, 70],
        itemStyle: { color: muted + '88', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: 'AI 智能审计',
        type: 'bar',
        data: [0.5, 0.5, 0.5, 0.5, 0.5, 2.5],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '66' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartEff.resize(); });

  // --- Chart: Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      appendToBody: true
    },
    legend: {
      data: ['传统审计模式', 'AI 智能审计'],
      textStyle: { color: muted },
      bottom: 0
    },
    radar: {
      indicator: [
        { name: '数据处理效率', max: 100 },
        { name: '风险识别精度', max: 100 },
        { name: '全量覆盖能力', max: 100 },
        { name: '报告生成速度', max: 100 },
        { name: '成本控制', max: 100 },
        { name: '动态监控', max: 100 },
        { name: '人力依赖度', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: {
        show: true,
        areaStyle: { color: [bg2, 'transparent', bg2, 'transparent'] }
      },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [30, 45, 25, 35, 40, 15, 90],
          name: '传统审计模式',
          itemStyle: { color: muted },
          lineStyle: { color: muted },
          areaStyle: { color: muted + '33' }
        },
        {
          value: [95, 92, 98, 96, 88, 90, 20],
          name: 'AI 智能审计',
          itemStyle: { color: accent },
          lineStyle: { color: accent, width: 2 },
          areaStyle: {
            color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
              { offset: 0, color: accent + '44' },
              { offset: 1, color: accent + '11' }
            ])
          }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();