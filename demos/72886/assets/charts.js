(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Target User Distribution ---
  var chartUsers = echarts.init(document.getElementById('chart-users'), null, { renderer: 'svg' });
  chartUsers.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      bottom: '0%',
      left: 'center',
      textStyle: { color: muted },
      itemGap: 16
    },
    color: [accent, accent2, muted, accent + 'cc', accent2 + 'cc'],
    series: [
      {
        name: '目标用户群体',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: bg2,
          borderWidth: 2
        },
        label: {
          show: true,
          color: ink,
          formatter: '{b}\n{d}%'
        },
        labelLine: {
          lineStyle: { color: rule }
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 20,
            shadowColor: accent + '66'
          }
        },
        data: [
          { value: 30, name: '学生与研究者' },
          { value: 25, name: '知识工作者' },
          { value: 25, name: '创作者与博主' },
          { value: 20, name: '开发者' }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartUsers.resize(); });
})();
