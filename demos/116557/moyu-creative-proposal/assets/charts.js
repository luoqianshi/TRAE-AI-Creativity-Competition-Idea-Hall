// charts.js — 摸鱼战报创意方案图表
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var pink = style.getPropertyValue('--pink').trim();
  var green = style.getPropertyValue('--green').trim();
  var amber = style.getPropertyValue('--amber').trim();

  // ===== Chart 1: 用户痛点维度分布 (Radar) =====
  var painChart = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });
  painChart.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['有该工具', '无该工具'],
      textStyle: { color: muted, fontSize: 12 },
      bottom: 0
    },
    radar: {
      indicator: [
        { name: '产出可见性', max: 100 },
        { name: '工作可追溯性', max: 100 },
        { name: '负载透明度', max: 100 },
        { name: '汇报效率', max: 100 },
        { name: '成就感', max: 100 },
        { name: '任务分配公平性', max: 100 }
      ],
      center: ['50%', '45%'],
      radius: '65%',
      axisName: { color: ink, fontSize: 12 },
      splitArea: {
        areaStyle: { color: ['rgba(0,212,255,0.02)', 'rgba(0,212,255,0.04)'] }
      },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [85, 90, 80, 95, 88, 82],
          name: '有该工具',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          value: [25, 30, 15, 20, 22, 18],
          name: '无该工具',
          areaStyle: { color: pink + '33' },
          lineStyle: { color: pink, width: 2, type: 'dashed' },
          itemStyle: { color: pink }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { painChart.resize(); });

  // ===== Chart 2: 价值维度评估 (Bar) =====
  var valueChart = echarts.init(document.getElementById('chart-value'), null, { renderer: 'svg' });
  valueChart.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['效率提升', '组织价值', '社会价值', '商业价值'],
      axisLabel: { color: muted, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: [
        { value: 95, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: accent },
          { offset: 1, color: accent + '66' }
        ])}},
        { value: 85, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: amber },
          { offset: 1, color: amber + '66' }
        ])}},
        { value: 90, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: pink },
          { offset: 1, color: pink + '66' }
        ])}},
        { value: 75, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: green },
          { offset: 1, color: green + '66' }
        ])}}
      ],
      label: {
        show: true,
        position: 'top',
        formatter: '{c}分',
        color: ink,
        fontSize: 13,
        fontWeight: 700
      },
      itemStyle: {
        borderRadius: [6, 6, 0, 0]
      }
    }]
  });
  window.addEventListener('resize', function() { valueChart.resize(); });

})();