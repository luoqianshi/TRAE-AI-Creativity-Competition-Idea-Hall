(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var chartAccuracy = echarts.init(document.getElementById('chart-accuracy'), null, { renderer: 'svg' });

  chartAccuracy.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true
    },
    legend: {
      data: ['默认 Tesseract（未预处理）', '四级流水线方案'],
      bottom: 0,
      textStyle: { color: ink }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '14%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['手机随拍', '扫描文档', '屏幕截图', '低光照翻拍'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontWeight: 600 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, formatter: '{value}%' }
    },
    series: [
      {
        name: '默认 Tesseract（未预处理）',
        type: 'bar',
        data: [62, 96, 78, 55],
        itemStyle: { color: muted, borderRadius: [4, 4, 0, 0] },
        barGap: '20%'
      },
      {
        name: '四级流水线方案',
        type: 'bar',
        data: [88, 99, 94, 84],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }
      }
    ]
  });

  window.addEventListener('resize', function() {
    chartAccuracy.resize();
  });
})();
