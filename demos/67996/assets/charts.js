(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var palette = [accent, accent2, muted, accent + '99', accent2 + '99'];

  // --- Chart 1: 各题停留时长分布 ---
  var chart1 = echarts.init(document.getElementById('chart-question-time'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: 'rgba(17,24,39,0.95)',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 12 }
    },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['第1题', '第2题', '第3题', '第4题', '第5题', '第6题', '第7题', '第8题', '第9题', '第10题'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.5 } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: [2.5, 3.1, 8.7, 2.0, 4.2, 12.5, 2.8, 3.5, 2.1, 5.0],
      itemStyle: {
        color: function(params) {
          return params.value > 8 ? accent2 : accent;
        },
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '60%'
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: 专注度实时曲线 ---
  var chart2 = echarts.init(document.getElementById('chart-focus'), null, { renderer: 'svg' });
  var focusData = [];
  var focusTimes = [];
  for (var i = 0; i <= 60; i += 5) {
    focusTimes.push(i + 'min');
    var base = 85;
    if (i > 20 && i < 30) base = 45;
    if (i > 40 && i < 45) base = 60;
    focusData.push(Math.max(30, Math.min(100, base + (Math.random() - 0.5) * 20)));
  }
  chart2.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: 'rgba(17,24,39,0.95)',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 12 }
    },
    grid: { left: 45, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: focusTimes,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      min: 0, max: 100,
      splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.5 } },
      axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' }
    },
    series: [{
      type: 'line',
      data: focusData,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: accent, width: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: accent + '40' },
            { offset: 1, color: accent + '05' }
          ]
        }
      }
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });

  // --- Chart 3: 科目时间分配 ---
  var chart3 = echarts.init(document.getElementById('chart-subject'), null, { renderer: 'svg' });
  chart3.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: 'rgba(17,24,39,0.95)',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 12 }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: muted, fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10
    },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: ink }
      },
      labelLine: { show: false },
      data: [
        { value: 45, name: '数学', itemStyle: { color: accent } },
        { value: 30, name: '语文', itemStyle: { color: accent2 } },
        { value: 20, name: '英语', itemStyle: { color: muted } },
        { value: 15, name: '物理', itemStyle: { color: accent + '99' } },
        { value: 10, name: '化学', itemStyle: { color: accent2 + '99' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart3.resize(); });

  // --- Chart 4: 知识点薄弱度排行 ---
  var chart4 = echarts.init(document.getElementById('chart-weakness'), null, { renderer: 'svg' });
  chart4.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: 'rgba(17,24,39,0.95)',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 12 }
    },
    grid: { left: 100, right: 30, top: 10, bottom: 20 },
    xAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.5 } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: {
      type: 'category',
      data: ['一元二次方程', '函数图像', '几何证明', '数列求和', '三角函数'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: ink, fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 92, itemStyle: { color: accent2 } },
        { value: 78, itemStyle: { color: accent2 + 'cc' } },
        { value: 65, itemStyle: { color: accent } },
        { value: 45, itemStyle: { color: accent + 'cc' } },
        { value: 32, itemStyle: { color: muted } }
      ],
      barWidth: '55%',
      itemStyle: { borderRadius: [0, 4, 4, 0] },
      label: {
        show: true,
        position: 'right',
        color: ink,
        fontSize: 11,
        formatter: '{c}%'
      }
    }]
  });
  window.addEventListener('resize', function() { chart4.resize(); });
})();
