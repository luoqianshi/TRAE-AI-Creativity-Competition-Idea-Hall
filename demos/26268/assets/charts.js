(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Journey Emotion Curve ---
  var chartJourney = echarts.init(document.getElementById('chart-journey'), null, { renderer: 'svg' });
  chartJourney.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        var p = params[0];
        return '<strong>' + p.name + '</strong><br/>情感指数: ' + p.value;
      }
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '15%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['发现产品', '上传素材', 'AI生成中', '封装盲盒', '等待解锁', '惊喜解锁', '分享传播'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '情感指数',
      nameTextStyle: { color: muted, fontSize: 12 },
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    series: [{
      name: '情感指数',
      type: 'line',
      smooth: 0.4,
      symbol: 'circle',
      symbolSize: 10,
      lineStyle: {
        color: accent,
        width: 3
      },
      itemStyle: {
        color: accent,
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: accent + '40' },
            { offset: 1, color: accent + '05' }
          ]
        }
      },
      data: [55, 65, 50, 75, 60, 95, 88],
      markPoint: {
        data: [
          { type: 'max', name: '峰值', itemStyle: { color: accent2 } }
        ],
        label: { color: '#fff', fontSize: 11 }
      }
    }]
  });
  window.addEventListener('resize', function() { chartJourney.resize(); });
})();
