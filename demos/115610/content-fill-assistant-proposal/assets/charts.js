(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var chartEl = document.getElementById('chart-types');
  if (!chartEl || typeof echarts === 'undefined') return;

  var chart = echarts.init(chartEl, null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}<br/>{c} 种 ({d}%)'
    },
    legend: {
      bottom: 10,
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: muted, fontSize: 13 }
    },
    series: [{
      name: '数据类型来源',
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: bg2,
        borderWidth: 3
      },
      label: {
        show: true,
        formatter: '{b}\n{c} 种',
        color: ink,
        fontSize: 13,
        fontWeight: 600
      },
      labelLine: {
        lineStyle: { color: rule }
      },
      data: [
        { value: 9, name: '静态数据', itemStyle: { color: accent } },
        { value: 9, name: '动态生成', itemStyle: { color: accent2 } }
      ]
    }]
  });

  window.addEventListener('resize', function() { chart.resize(); });
})();
