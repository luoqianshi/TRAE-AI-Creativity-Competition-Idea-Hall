(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: Response time comparison ---
  var chart1 = echarts.init(document.getElementById('chart-response'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    backgroundColor: 'transparent',
    grid: { top: 40, right: 30, bottom: 50, left: 110 },
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      formatter: function(p) {
        return p[0].name + '<br/>' + p[0].marker + ' ' + p[0].seriesName + ': <strong>' + p[0].value + ' 分钟</strong>';
      }
    },
    xAxis: {
      type: 'value',
      name: '平均耗时（分钟）',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: ['传统模式（事后发现）', 'APP 模式（主动预警）'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13, fontWeight: 600 },
      axisTick: { show: false }
    },
    series: [{
      name: '响应耗时',
      type: 'bar',
      data: [
        { value: 240, itemStyle: { color: muted } },
        { value: 8, itemStyle: { color: accent } }
      ],
      barWidth: 36,
      label: {
        show: true,
        position: 'right',
        formatter: '{c} 分钟',
        color: ink,
        fontWeight: 600,
        fontSize: 12
      },
      itemStyle: { borderRadius: [0, 4, 4, 0] }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: Value composition radar ---
  var chart2 = echarts.init(document.getElementById('chart-value'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      appendToBody: true
    },
    legend: {
      data: ['传统模式', 'APP 模式'],
      bottom: 8,
      textStyle: { color: ink, fontSize: 12 },
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 8
    },
    radar: {
      indicator: [
        { name: '响应速度', max: 100 },
        { name: '沟通效率', max: 100 },
        { name: '资源调度', max: 100 },
        { name: '家庭安心', max: 100 },
        { name: '预防能力', max: 100 },
        { name: '社会成本', max: 100 }
      ],
      center: ['50%', '48%'],
      radius: '62%',
      axisName: { color: ink, fontSize: 12, fontWeight: 600 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: ['transparent', bg2] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [30, 40, 35, 35, 25, 40],
          name: '传统模式',
          itemStyle: { color: muted },
          lineStyle: { color: muted, width: 2 },
          areaStyle: { color: muted, opacity: 0.15 }
        },
        {
          value: [92, 88, 85, 95, 90, 80],
          name: 'APP 模式',
          itemStyle: { color: accent },
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent, opacity: 0.25 }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
