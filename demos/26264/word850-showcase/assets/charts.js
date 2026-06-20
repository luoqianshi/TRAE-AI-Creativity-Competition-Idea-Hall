(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Vocabulary Coverage Efficiency ---
  var chartCoverage = echarts.init(document.getElementById('chart-coverage'), null, { renderer: 'svg' });
  chartCoverage.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true
    },
    legend: {
      data: ['850核心词覆盖度', '自然词汇增长曲线'],
      bottom: 0,
      textStyle: { color: muted }
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
      data: ['500词', '850词', '1500词', '3000词', '5000词', '10000词'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '日常语料覆盖率 (%)',
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '850核心词覆盖度',
        type: 'line',
        data: [78, 90, '-', '-', '-', '-'],
        smooth: true,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '33' },
              { offset: 1, color: accent + '05' }
            ]
          }
        },
        markPoint: {
          data: [
            { coord: ['850词', 90], value: '90%', itemStyle: { color: accent } }
          ],
          label: { color: '#fff', fontWeight: 'bold' }
        }
      },
      {
        name: '自然词汇增长曲线',
        type: 'line',
        data: [70, 78, 85, 90, 93, 96],
        smooth: true,
        lineStyle: { color: muted, width: 2, type: 'dashed' },
        itemStyle: { color: muted },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: muted + '22' },
              { offset: 1, color: muted + '05' }
            ]
          }
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartCoverage.resize(); });
})();
