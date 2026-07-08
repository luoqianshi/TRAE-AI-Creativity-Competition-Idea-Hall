// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();
  var card = style.getPropertyValue('--card').trim();

  // --- Chart: Radar Comparison ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: card,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['微信群聊', '齐家 Kinfolk'],
      top: 0,
      textStyle: { color: muted, fontSize: 13 }
    },
    radar: {
      indicator: [
        { name: '信息组织', max: 100 },
        { name: '任务追踪', max: 100 },
        { name: '隐私分层', max: 100 },
        { name: '决策追溯', max: 100 },
        { name: '老人友好', max: 100 },
        { name: '数据自主', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: {
        show: true,
        areaStyle: { color: [bg2, card, bg2, card] }
      },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      name: '能力对比',
      type: 'radar',
      data: [
        {
          value: [20, 15, 10, 5, 25, 0],
          name: '微信群聊',
          areaStyle: { color: accent + '20' },
          lineStyle: { color: accent + '88', width: 2 },
          itemStyle: { color: accent + '88' }
        },
        {
          value: [95, 92, 88, 90, 85, 98],
          name: '齐家 Kinfolk',
          areaStyle: { color: accent2 + '25' },
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: Deploy Comparison ---
  var chartDeploy = echarts.init(document.getElementById('chart-deploy'), null, { renderer: 'svg' });
  chartDeploy.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      backgroundColor: card,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['便捷性', '数据安全', '成本'],
      top: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: { left: '3%', right: '4%', bottom: '6%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['云端托管', '本地私有化', '混合部署'],
      axisLabel: { color: muted, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value', max: 100,
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: '便捷性',
        type: 'bar', barWidth: '22%',
        itemStyle: { color: accent + 'aa', borderRadius: [4,4,0,0] },
        data: [95, 45, 75]
      },
      {
        name: '数据安全',
        type: 'bar', barWidth: '22%',
        itemStyle: { color: accent2 + 'aa', borderRadius: [4,4,0,0] },
        data: [30, 98, 80]
      },
      {
        name: '成本',
        type: 'bar', barWidth: '22%',
        itemStyle: { color: accent + '44', borderRadius: [4,4,0,0] },
        data: [40, 85, 60]
      }
    ]
  });
  window.addEventListener('resize', function() { chartDeploy.resize(); });
})();
