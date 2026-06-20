// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Market Size Trend ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      formatter: function(params) {
        var p = params[0];
        return '<strong>' + p.name + '</strong><br/>市场规模：' + p.value + ' 亿元';
      }
    },
    grid: {
      left: '3%', right: '4%', top: '8%', bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['2020', '2021', '2022', '2023', '2024', '2025E', '2026E'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '亿元',
      nameTextStyle: { color: muted, fontSize: 12, padding: [0, 40, 0, 0] },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    series: [{
      type: 'bar',
      data: [380, 520, 680, 830, 980, 1100, 1200],
      barWidth: '42%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: function(params) {
          var idx = params.dataIndex;
          if (idx >= 5) {
            return accent + '55';
          }
          return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent2 }
          ]);
        }
      },
      label: {
        show: true,
        position: 'top',
        color: ink,
        fontSize: 12,
        fontWeight: 600,
        formatter: function(p) { return p.value; }
      }
    }]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });
})();
