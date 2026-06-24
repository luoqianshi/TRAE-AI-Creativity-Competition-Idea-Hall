(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Ebbinghaus Forgetting Curve with Review Nodes ---
  var chartForgetting = echarts.init(document.getElementById('chart-forgetting'), null, { renderer: 'svg' });

  // Ebbinghaus curve: retention = 100 * e^(-t / 1.5) where t in days
  var dataCurve = [];
  var dataReview = [];
  var reviewDays = [1, 2, 4, 7, 15, 30];
  for (var i = 0; i <= 300; i++) {
    var t = i / 10;
    var retention = 100 * Math.exp(-t / 1.5);
    dataCurve.push([t, retention]);
    if (reviewDays.indexOf(Math.round(t * 10) / 10) !== -1) {
      dataReview.push([t, retention]);
    }
  }

  chartForgetting.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        var p = params[0];
        return '第 ' + p.value[0].toFixed(1) + ' 天<br>记忆留存率: ' + p.value[1].toFixed(1) + '%';
      }
    },
    grid: {
      left: '8%',
      right: '6%',
      top: '12%',
      bottom: '12%'
    },
    xAxis: {
      type: 'value',
      name: '天数',
      nameLocation: 'middle',
      nameGap: 28,
      min: 0,
      max: 30,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'value',
      name: '记忆留存率 (%)',
      nameLocation: 'middle',
      nameGap: 40,
      min: 0,
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '遗忘曲线',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: accent, width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '33' },
              { offset: 1, color: accent + '05' }
            ]
          }
        },
        data: dataCurve
      },
      {
        name: '智能复习节点',
        type: 'scatter',
        symbolSize: 14,
        itemStyle: { color: accent2, borderColor: '#fff', borderWidth: 2 },
        label: {
          show: true,
          position: 'top',
          formatter: function(p) {
            return '第' + Math.round(p.value[0]) + '天复习';
          },
          color: accent2,
          fontSize: 11,
          fontWeight: 600
        },
        data: dataReview
      }
    ]
  });

  window.addEventListener('resize', function() { chartForgetting.resize(); });
})();
