(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var positive = style.getPropertyValue('--positive').trim();
  var negative = style.getPropertyValue('--negative').trim();

  // --- Chart: Loss Curve ---
  var chartLoss = echarts.init(document.getElementById('chart-loss'), null, { renderer: 'svg' });
  chartLoss.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    grid: { left: '8%', right: '6%', top: '12%', bottom: '12%' },
    xAxis: {
      type: 'category',
      data: ['Epoch 1', 'Epoch 2', 'Epoch 3', 'Epoch 4', 'Epoch 5'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: 'Loss',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, opacity: 0.3 } }
    },
    series: [{
      name: '训练 Loss',
      type: 'line',
      data: [0.512, 0.341, 0.258, 0.198, 0.162],
      smooth: true,
      lineStyle: { color: accent, width: 3 },
      itemStyle: { color: accent, borderWidth: 2, borderColor: bg2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: accent + '44' },
            { offset: 1, color: accent + '05' }
          ]
        }
      },
      symbol: 'circle',
      symbolSize: 8
    }]
  });
  window.addEventListener('resize', function() { chartLoss.resize(); });

  // --- Chart: Category Sentiment Distribution ---
  var chartCat = echarts.init(document.getElementById('chart-category'), null, { renderer: 'svg' });
  var categories = ['手机', '书籍', '平板', '水果', '洗发水', '衣服', '计算机', '酒店', '洗衣机', '热水器'];
  var posData = [72, 65, 58, 82, 55, 60, 68, 74, 52, 61];
  var negData = [28, 35, 42, 18, 45, 40, 32, 26, 48, 39];

  chartCat.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['正面', '负面'],
      textStyle: { color: muted },
      top: 8
    },
    grid: { left: '8%', right: '6%', top: '18%', bottom: '10%' },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, rotate: 0 }
    },
    yAxis: {
      type: 'value',
      name: '占比 (%)',
      max: 100,
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, opacity: 0.3 } }
    },
    series: [
      {
        name: '正面',
        type: 'bar',
        stack: 'total',
        data: posData,
        itemStyle: { color: positive + 'cc', borderRadius: [0, 0, 0, 0] },
        barWidth: '50%'
      },
      {
        name: '负面',
        type: 'bar',
        stack: 'total',
        data: negData,
        itemStyle: { color: negative + 'cc', borderRadius: [4, 4, 0, 0] },
        barWidth: '50%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartCat.resize(); });
})();
