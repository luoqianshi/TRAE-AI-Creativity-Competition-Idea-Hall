(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  function emotionCurve() {
    var el = document.getElementById('chart-emotion');
    if (!el || !window.echarts) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      grid: { left: 28, right: 18, top: 28, bottom: 36, containLabel: true },
      xAxis: {
        type: 'category',
        data: ['离开', '适应', '失序', '停顿', '重建', '出发'],
        axisLabel: { color: muted },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        min: -5,
        max: 5,
        axisLabel: { color: muted },
        splitLine: { lineStyle: { color: rule } }
      },
      series: [{
        name: '情绪强度',
        type: 'line',
        smooth: true,
        symbolSize: 9,
        data: [-1, -2, -4, -2, 2, 4],
        lineStyle: { color: accent, width: 4 },
        itemStyle: { color: accent },
        areaStyle: { color: accent + '22' }
      }]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  }

  function scoreRadar() {
    var el = document.getElementById('chart-score');
    if (!el || !window.echarts) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: { appendToBody: true },
      color: [accent2],
      radar: {
        radius: '64%',
        center: ['50%', '54%'],
        indicator: [
          { name: '情绪感染力', max: 10 },
          { name: 'Demo 反差', max: 10 },
          { name: 'AI 创造性', max: 10 },
          { name: '可实现性', max: 10 },
          { name: '传播记忆点', max: 10 }
        ],
        axisName: { color: muted, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [{
          name: 'LifeCut',
          value: [9.5, 9, 9, 8, 9.5],
          areaStyle: { color: accent2 + '26' },
          lineStyle: { width: 3 },
          symbolSize: 6
        }]
      }]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  }

  emotionCurve();
  scoreRadar();
})();
