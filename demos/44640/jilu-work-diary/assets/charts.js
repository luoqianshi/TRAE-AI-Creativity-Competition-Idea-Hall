(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Time Distribution ---
  var chartTimeDist = echarts.init(document.getElementById('chart-time-dist'), null, { renderer: 'svg' });
  chartTimeDist.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}h ({d}%)'
    },
    legend: {
      bottom: '0%',
      left: 'center',
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12
    },
    series: [
      {
        name: '时间分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: bg2,
          borderWidth: 3
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
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        },
        data: [
          { value: 3.5, name: 'Coding' },
          { value: 2.0, name: '会议沟通' },
          { value: 1.5, name: '文档写作' },
          { value: 1.0, name: '需求评审' },
          { value: 1.0, name: '学习提升' },
          { value: 1.0, name: '其他事务' }
        ],
        color: [accent, accent2, '#D49A6E', '#B88A5E', '#A87A4E', muted]
      }
    ]
  });
  window.addEventListener('resize', function() { chartTimeDist.resize(); });
})();
