(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Cost-Benefit Comparison ---
  var chart = echarts.init(document.getElementById('chart-cost-benefit'), null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#111827',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['传统人工运营', 'AI智能运营'],
      top: 0,
      textStyle: { color: muted, fontSize: 13 }
    },
    grid: {
      top: 50,
      right: 30,
      bottom: 40,
      left: 60
    },
    xAxis: {
      type: 'category',
      data: ['日均运营时间\n(小时)', '月均运营成本\n(千元)', '日均发帖量', '帖子回复率\n(%)', '新用户\n月留存率(%)'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, interval: 0 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统人工运营',
        type: 'bar',
        barWidth: '28%',
        itemStyle: {
          color: muted,
          borderRadius: [4, 4, 0, 0]
        },
        data: [8, 5, 3, 15, 20]
      },
      {
        name: 'AI智能运营',
        type: 'bar',
        barWidth: '28%',
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        data: [0.5, 0.5, 50, 85, 65]
      }
    ]
  });
  window.addEventListener('resize', function() { chart.resize(); });
})();
