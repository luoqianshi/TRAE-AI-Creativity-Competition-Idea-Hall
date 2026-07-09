(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: 青少年心理健康问题关键指标 ---
  var chart1 = echarts.init(document.getElementById('chart-mental-health'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    grid: { left: '18%', right: '12%', top: 40, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true,
      formatter: function(params) {
        return params[0].name + '<br/>' + params[0].value + '%';
      }
    },
    xAxis: {
      type: 'value',
      max: 50,
      axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: ['心理健康问题检出率', '抑郁检出率', '抑郁共病焦虑', '睡眠障碍', '共病强迫症', '重度抑郁占比'],
      axisLabel: { color: ink, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: [30.4, 24.6, 43.9, 39.2, 20.9, 7.4],
      itemStyle: {
        color: function(params) {
          var val = params.value;
          if (val >= 30) return accent;
          if (val >= 20) return accent2;
          return muted;
        },
        borderRadius: [0, 6, 6, 0]
      },
      barWidth: '55%',
      label: {
        show: true,
        position: 'right',
        color: ink,
        fontSize: 12,
        fontWeight: 600,
        formatter: '{c}%'
      }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: 情绪星球预期社会影响力指标 ---
  var chart2 = echarts.init(document.getElementById('chart-impact'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 11 },
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8
    },
    radar: {
      indicator: [
        { name: '情绪觉察习惯\n建立率', max: 100 },
        { name: '求助门槛\n降低度', max: 100 },
        { name: '早期风险\n发现率', max: 100 },
        { name: '专业资源\n触达率', max: 100 },
        { name: '用户留存\n与满意度', max: 100 },
        { name: '校园覆盖\n渗透率', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 11 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: ['transparent', bg2, 'transparent', bg2] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [75, 85, 70, 65, 80, 45],
          name: 'Phase 1-2 预期',
          itemStyle: { color: accent2 },
          lineStyle: { color: accent2, width: 2 },
          areaStyle: { color: accent2 + '33' },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [90, 95, 85, 80, 88, 70],
          name: 'Phase 3-4 目标',
          itemStyle: { color: accent },
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '33' },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
