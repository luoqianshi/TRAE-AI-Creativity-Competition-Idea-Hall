(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var chartEl = document.getElementById('chart-sleep-sedentary');
  if (!chartEl) return;

  var chart = echarts.init(chartEl, null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 12,
      axisLabel: { color: muted, formatter: '{value} 小时' },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: ['平均睡眠时长', '推荐睡眠下限', '日均静坐时间', 'JACC研究中位久坐时间'],
      axisLabel: { color: ink, fontWeight: 500 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 6.75, itemStyle: { color: accent } },
        { value: 7, itemStyle: { color: accent2 } },
        { value: 8.8, itemStyle: { color: accent } },
        { value: 9.4, itemStyle: { color: accent } }
      ],
      barWidth: '50%',
      label: {
        show: true,
        position: 'right',
        color: ink,
        formatter: '{c} h'
      }
    }]
  });

  window.addEventListener('resize', function() { chart.resize(); });
})();
