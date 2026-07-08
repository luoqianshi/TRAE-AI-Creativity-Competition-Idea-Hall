(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Persona Distribution ---
  var chart1 = echarts.init(document.getElementById('chart-user-persona'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}%'
    },
    legend: {
      bottom: '0%',
      left: 'center',
      textStyle: { color: muted, fontSize: 13 },
      itemWidth: 12,
      itemHeight: 12
    },
    color: [accent, accent2, '#C4A882', '#7BA3A8', '#B8A89A'],
    series: [
      {
        name: '用户画像',
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: bg2,
          borderWidth: 3
        },
        label: {
          show: true,
          color: ink,
          fontSize: 13,
          formatter: '{b}\n{c}%'
        },
        labelLine: {
          lineStyle: { color: rule },
          smooth: 0.2,
          length: 12,
          length2: 16
        },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.1)'
          }
        },
        data: [
          { value: 45, name: '独居/合租年轻人' },
          { value: 25, name: '年轻情侣/夫妻' },
          { value: 15, name: '小家庭主厨' },
          { value: 10, name: '健康饮食爱好者' },
          { value: 5, name: '环保践行者' }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chart1.resize(); });
})();
