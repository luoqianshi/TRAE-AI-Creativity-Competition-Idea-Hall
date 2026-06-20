(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Emotion Dimension Mapping ---
  var chartEmotion = echarts.init(document.getElementById('chart-emotion'), null, { renderer: 'svg' });

  var emotionData = [
    { name: '兴奋', value: [0.8, 0.9], symbolSize: 28 },
    { name: '开心', value: [0.7, 0.5], symbolSize: 24 },
    { name: '满足', value: [0.6, 0.2], symbolSize: 20 },
    { name: '平静', value: [0.0, 0.1], symbolSize: 18 },
    { name: '忧郁', value: [-0.5, 0.2], symbolSize: 20 },
    { name: '悲伤', value: [-0.7, 0.3], symbolSize: 22 },
    { name: '焦虑', value: [-0.3, 0.8], symbolSize: 26 },
    { name: '愤怒', value: [-0.6, 0.9], symbolSize: 28 },
    { name: '疲惫', value: [-0.2, -0.3], symbolSize: 18 },
    { name: '放松', value: [0.4, -0.2], symbolSize: 18 }
  ];

  chartEmotion.setOption({
    animation: false,
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: function(p) {
        return '<strong>' + p.data.name + '</strong><br/>愉悦度: ' + p.data.value[0].toFixed(2) + '<br/>唤醒度: ' + p.data.value[1].toFixed(2);
      },
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    grid: { top: 40, right: 40, bottom: 50, left: 60 },
    xAxis: {
      name: '效价（愉悦度）',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: muted, fontSize: 12 },
      type: 'value',
      min: -1,
      max: 1,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.3 } }
    },
    yAxis: {
      name: '唤醒度（强度）',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { color: muted, fontSize: 12 },
      type: 'value',
      min: -0.5,
      max: 1,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.3 } }
    },
    series: [{
      type: 'scatter',
      data: emotionData,
      itemStyle: {
        color: function(p) {
          var v = p.data.value[0];
          if (v > 0.3) return accent;
          if (v < -0.3) return accent2;
          return muted;
        },
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.3)'
      },
      label: {
        show: true,
        formatter: '{b}',
        position: 'top',
        color: ink,
        fontSize: 11
      }
    }]
  });

  window.addEventListener('resize', function() { chartEmotion.resize(); });
})();
