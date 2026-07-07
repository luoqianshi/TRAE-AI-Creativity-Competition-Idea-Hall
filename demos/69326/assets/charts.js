(function() {
  var s = getComputedStyle(document.documentElement);
  var ac = s.getPropertyValue('--accent').trim();
  var ac2 = s.getPropertyValue('--accent2').trim();
  var muted = s.getPropertyValue('--muted').trim();
  var rule = s.getPropertyValue('--rule').trim();

  // Market chart
  var cm = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  cm.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: '#fff', borderColor: rule, textStyle: { color: '#1A1A2E' } },
    legend: { data: ['市场规模', '目标渗透率'], textStyle: { color: muted, fontSize: 11 }, bottom: 0, itemWidth: 14, itemHeight: 8 },
    grid: { left: '2%', right: '2%', bottom: '18%', top: '8%', containLabel: true },
    xAxis: { type: 'category', data: ['2021', '2022', '2023', '2024', '2025E', '2026E'], axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted, fontSize: 11 } },
    yAxis: [
      { type: 'value', name: '亿元', nameTextStyle: { color: muted, fontSize: 10 }, axisLine: { show: false }, axisLabel: { color: muted, fontSize: 10 }, splitLine: { lineStyle: { color: rule, opacity: 0.3 } } },
      { type: 'value', name: '%', nameTextStyle: { color: muted, fontSize: 10 }, axisLine: { show: false }, axisLabel: { color: muted, fontSize: 10, formatter: '{value}%' }, splitLine: { show: false } }
    ],
    series: [
      { name: '市场规模', type: 'bar', data: [280, 310, 350, 390, 440, 500], itemStyle: { color: ac + '22', borderColor: ac, borderWidth: 1 }, barWidth: '35%' },
      { name: '目标渗透率', type: 'line', yAxisIndex: 1, data: [0, 0.5, 1.2, 2.5, 5, 8], itemStyle: { color: ac2 }, lineStyle: { color: ac2, width: 2 }, symbol: 'circle', symbolSize: 6 }
    ]
  });
  window.addEventListener('resize', function() { cm.resize(); });

  // Radar chart
  var ce = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  ce.setOption({
    animation: false,
    tooltip: { appendToBody: true, backgroundColor: '#fff', borderColor: rule, textStyle: { color: '#1A1A2E' } },
    legend: { data: ['传统备考', 'AI精准备考'], textStyle: { color: muted, fontSize: 11 }, bottom: 0, itemWidth: 14, itemHeight: 8 },
    radar: {
      indicator: [
        { name: '时间利用率', max: 100 }, { name: '知识覆盖', max: 100 }, { name: '弱项识别', max: 100 },
        { name: '反馈速度', max: 100 }, { name: '个性化', max: 100 }, { name: '成本效益', max: 100 }
      ],
      axisName: { color: muted, fontSize: 11 },
      splitArea: { areaStyle: { color: ['transparent'] } },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } },
      radius: '65%'
    },
    series: [{
      type: 'radar',
      data: [
        { value: [35, 60, 25, 30, 20, 20], name: '传统备考', itemStyle: { color: muted }, lineStyle: { color: muted }, areaStyle: { color: muted + '18' } },
        { value: [90, 85, 95, 92, 88, 85], name: 'AI精准备考', itemStyle: { color: ac }, lineStyle: { color: ac, width: 2 }, areaStyle: { color: ac + '25' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { ce.resize(); });
})();
