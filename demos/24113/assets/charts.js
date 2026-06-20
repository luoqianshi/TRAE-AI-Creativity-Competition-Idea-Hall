(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var el = document.getElementById('chart-capability');
  if (!el || !window.echarts) return;

  var chart = echarts.init(el, null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    color: [accent, accent2, accent + '99'],
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        return params.map(function(item) {
          return item.marker + item.name + '：' + item.value + '%';
        }).join('<br>');
      }
    },
    grid: {
      left: 24,
      right: 24,
      top: 24,
      bottom: 24,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: muted, formatter: '{value}%' },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: ['数据接入', '负荷预测', '价格判断', '策略模拟', '风险预警', '复盘归因'],
      axisLabel: { color: ink },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: [90, 82, 76, 88, 84, 72],
      barWidth: 18,
      itemStyle: {
        borderRadius: [0, 8, 8, 0],
        color: function(params) {
          return params.dataIndex % 2 === 0 ? accent : accent2;
        }
      },
      label: {
        show: true,
        position: 'right',
        color: muted,
        formatter: '{c}%'
      }
    }],
    backgroundColor: bg2
  });

  window.addEventListener('resize', function() {
    chart.resize();
  });
})();
