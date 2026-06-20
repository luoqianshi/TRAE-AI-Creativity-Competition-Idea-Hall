(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Score Dimensions ---
  var chart1 = echarts.init(document.getElementById('chart-score-dimensions'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted }
    },
    series: [
      {
        name: '评分维度',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: bg2,
          borderWidth: 2
        },
        label: {
          show: true,
          color: ink,
          formatter: '{b}\n{c}%'
        },
        labelLine: {
          lineStyle: { color: rule }
        },
        data: [
          { value: 40, name: '技能匹配度', itemStyle: { color: accent } },
          { value: 30, name: '经验匹配度', itemStyle: { color: accent2 } },
          { value: 15, name: '教育背景', itemStyle: { color: muted } },
          { value: 10, name: '近期相关性', itemStyle: { color: accent + '99' } },
          { value: 5, name: '稳定性', itemStyle: { color: accent2 + '99' } }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chart1.resize(); });
})();
