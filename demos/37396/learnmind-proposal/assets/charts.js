// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: AI Anxiety Sources (Horizontal Bar) ---
  var chartAnxiety = echarts.init(document.getElementById('chart-anxiety'), null, { renderer: 'svg' });
  chartAnxiety.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
    grid: { left: '3%', right: '12%', top: '3%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 70,
      axisLabel: { color: muted, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: [
        '害怕对AI产生情感依托',
        '担心思维能力被削弱',
        '担心过度依赖AI',
        '担心隐私数据泄露',
        '担心AI给出错误信息'
      ],
      axisLabel: { color: ink, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 53.7, itemStyle: { color: accent2 + 'cc' } },
        { value: 55.2, itemStyle: { color: accent2 + 'dd' } },
        { value: 62.3, itemStyle: { color: accent } },
        { value: 45.8, itemStyle: { color: accent2 + 'aa' } },
        { value: 58.1, itemStyle: { color: accent + 'cc' } }
      ],
      barWidth: '55%',
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: ink,
        fontSize: 12,
        fontWeight: 600
      },
      itemStyle: { borderRadius: [0, 4, 4, 0] }
    }]
  });
  window.addEventListener('resize', function() { chartAnxiety.resize(); });

  // --- Chart: Subject AI Usage (Radar) ---
  var chartSubjects = echarts.init(document.getElementById('chart-subjects'), null, { renderer: 'svg' });
  chartSubjects.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: {
      data: ['AI使用率', 'AI焦虑率'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    radar: {
      indicator: [
        { name: '文史哲', max: 60 },
        { name: '经管法', max: 60 },
        { name: '艺术教育', max: 60 },
        { name: '理工农医', max: 60 },
        { name: '大四学生', max: 60 }
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [52.7, 47.5, 43.1, 35.2, 48.6],
          name: 'AI使用率',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [48.4, 42.1, 38.5, 35.8, 43.5],
          name: 'AI焦虑率',
          areaStyle: { color: accent2 + '33' },
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartSubjects.resize(); });
})();
