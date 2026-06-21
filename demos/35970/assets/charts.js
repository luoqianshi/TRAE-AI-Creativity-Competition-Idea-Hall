// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // --- Chart: Speed Comparison ---
  var chartSpeed = echarts.init(document.getElementById('chart-speed'), null, { renderer: 'svg' });
  chartSpeed.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['Prism PDF (CPU)', 'Prism PDF (GPU)', '开源 OCR (GPU)', '在线 API'],
      textStyle: { color: muted, fontSize: 12 },
      top: 10
    },
    grid: {
      left: '3%', right: '4%', bottom: '3%', top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['简单文档', '含表格文档', '复杂跨页表格', '扫描件 OCR', '混合文档'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '页/分钟',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: 'Prism PDF (CPU)',
        type: 'bar',
        data: [12, 8, 5, 3, 6],
        itemStyle: { color: accent + '99', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: 'Prism PDF (GPU)',
        type: 'bar',
        data: [240, 160, 100, 60, 120],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '开源 OCR (GPU)',
        type: 'bar',
        data: [80, 40, 15, 50, 45],
        itemStyle: { color: accent2 + '99', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '在线 API',
        type: 'bar',
        data: [200, 120, 60, 100, 90],
        itemStyle: { color: muted, borderRadius: [4, 4, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { chartSpeed.resize(); });

  // --- Chart: Accuracy Comparison ---
  var chartAccuracy = echarts.init(document.getElementById('chart-accuracy'), null, { renderer: 'svg' });
  chartAccuracy.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      formatter: function(params) {
        var result = params[0].axisValue + '<br/>';
        params.forEach(function(p) {
          result += p.marker + ' ' + p.seriesName + ': ' + p.value + '%<br/>';
        });
        return result;
      }
    },
    legend: {
      data: ['Prism PDF', '在线 API 服务', '开源 OCR 工具'],
      textStyle: { color: muted, fontSize: 12 },
      top: 10
    },
    grid: {
      left: '3%', right: '4%', bottom: '3%', top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['简单表格', '合并单元格', '嵌套表格', '跨页续表', '混合复杂表格'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '准确率 (%)',
      nameTextStyle: { color: muted, fontSize: 11 },
      min: 50,
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: 'Prism PDF',
        type: 'line',
        data: [98, 95, 92, 90, 88],
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '40' },
              { offset: 1, color: accent + '05' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 8
      },
      {
        name: '在线 API 服务',
        type: 'line',
        data: [95, 78, 65, 55, 50],
        lineStyle: { color: accent3, width: 2 },
        itemStyle: { color: accent3 },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '开源 OCR 工具',
        type: 'line',
        data: [88, 60, 45, 35, 30],
        lineStyle: { color: muted, width: 2, type: 'dashed' },
        itemStyle: { color: muted },
        symbol: 'diamond',
        symbolSize: 6
      }
    ]
  });
  window.addEventListener('resize', function() { chartAccuracy.resize(); });
})();
