(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Memory Retention Comparison ---
  var chartMemory = echarts.init(document.getElementById('chart-memory'), null, { renderer: 'svg' });
  chartMemory.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        var result = '<strong>第' + params[0].axisValue + '天</strong><br/>';
        params.forEach(function(item) {
          result += item.marker + ' ' + item.seriesName + ': ' + item.value + '%<br/>';
        });
        return result;
      }
    },
    legend: {
      data: ['传统背诵', '智背单词'],
      top: 0,
      textStyle: { color: ink }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1', '3', '5', '7', '10', '14', '21', '30'],
      name: '天数',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '记忆留存率(%)',
      min: 0,
      max: 100,
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统背诵',
        type: 'line',
        data: [85, 60, 45, 35, 28, 22, 18, 15],
        smooth: true,
        lineStyle: { color: muted, width: 2 },
        itemStyle: { color: muted },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: muted + '33' },
              { offset: 1, color: muted + '05' }
            ]
          }
        }
      },
      {
        name: '智背单词',
        type: 'line',
        data: [90, 82, 78, 75, 72, 70, 68, 65],
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
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartMemory.resize(); });
})();
