(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();
  var teal = style.getPropertyValue('--teal').trim();
  var purple = style.getPropertyValue('--purple').trim();
  var blue = style.getPropertyValue('--blue').trim();
  var orange = style.getPropertyValue('--orange').trim();

  // --- Chart: Pie ---
  var chartPie = echarts.init(document.getElementById('chart-pie'), null, { renderer: 'svg' });
  chartPie.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg3,
      borderColor: rule,
      textStyle: { color: ink },
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12
    },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: bg2,
        borderWidth: 3
      },
      label: {
        show: true,
        color: ink,
        fontSize: 12,
        formatter: '{b}\n{c}%'
      },
      labelLine: {
        lineStyle: { color: rule }
      },
      data: [
        { value: 25, name: '举证不能', itemStyle: { color: teal } },
        { value: 14.2, name: '严重违纪', itemStyle: { color: accent2 } },
        { value: 11.7, name: '法律关系错误', itemStyle: { color: purple } },
        { value: 8.3, name: '时效经过', itemStyle: { color: orange } },
        { value: 6.7, name: '渠道错误', itemStyle: { color: blue } },
        { value: 34.1, name: '其他因素', itemStyle: { color: muted } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartPie.resize(); });
})();
