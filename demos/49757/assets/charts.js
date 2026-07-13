(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var surface = style.getPropertyValue('--surface').trim();
  var warn = style.getPropertyValue('--warn').trim();

  function initChart(id, option) {
    var el = document.getElementById(id);
    if (!el || typeof echarts === 'undefined') return null;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption(option);
    window.addEventListener('resize', function() { chart.resize(); });
    return chart;
  }

  initChart('chart-score-model', {
    animation: false,
    backgroundColor: surface,
    color: [accent, accent2, accent3, warn],
    tooltip: { trigger: 'item', appendToBody: true },
    radar: {
      radius: '66%',
      axisName: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: ['transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      indicator: [
        { name: '痛点强度', max: 10 },
        { name: '出现频率', max: 10 },
        { name: '付费意愿', max: 10 },
        { name: '竞争可控', max: 10 },
        { name: 'MVP 速度', max: 10 }
      ]
    },
    series: [{
      type: 'radar',
      data: [{
        value: [9, 8, 7, 6, 7],
        name: 'PainRadar 示例机会',
        areaStyle: { color: accent + '33' },
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent }
      }]
    }],
    graphic: [{
      type: 'text',
      left: 12,
      bottom: 8,
      style: {
        text: '注：图中为产品概念示例评分，用于说明模型结构。',
        fill: muted,
        font: '12px Instrument Sans'
      }
    }]
  });

  initChart('chart-efficiency', {
    animation: false,
    backgroundColor: surface,
    color: [accent3, accent],
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      bottom: 0,
      textStyle: { color: muted }
    },
    grid: { left: 44, right: 20, top: 28, bottom: 58 },
    xAxis: {
      type: 'category',
      data: ['信息收集', '痛点整理', '竞品判断', '报告生成'],
      axisLabel: { color: muted, interval: 0 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '相对耗时',
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '传统手动调研',
        type: 'bar',
        data: [9, 8, 7, 8],
        itemStyle: { borderRadius: [8, 8, 0, 0], color: accent3 }
      },
      {
        name: 'PainRadar 辅助',
        type: 'bar',
        data: [3, 2, 3, 2],
        itemStyle: { borderRadius: [8, 8, 0, 0], color: accent }
      }
    ]
  });
})();
