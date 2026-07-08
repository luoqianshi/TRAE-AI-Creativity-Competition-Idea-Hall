(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // --- Chart 1: 垃圾举报时段分布 (Bar Chart) ---
  var chart1 = echarts.init(document.getElementById('chart-time-distribution'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-06:00'],
      axisLabel: { color: muted, fontSize: 11, rotate: 30 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '举报次数',
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      name: '举报次数',
      type: 'bar',
      data: [45, 12, 8, 6, 5, 18, 38, 32, 15],
      itemStyle: {
        color: function(params) {
          var colors = [accent, accent + 'cc', accent + '99', accent + '77', accent + '66', accent + '88', accent + 'bb', accent + 'aa', accent + '55'];
          return colors[params.dataIndex] || accent;
        },
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '50%'
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: 治理效果趋势 (Line Chart) ---
  var chart2 = echarts.init(document.getElementById('chart-trend'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['日均举报量', '处理率(%)'], top: '2%', textStyle: { color: muted } },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'],
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: [
      {
        type: 'value',
        name: '日均举报量',
        nameTextStyle: { color: muted },
        axisLabel: { color: muted },
        splitLine: { lineStyle: { color: rule } }
      },
      {
        type: 'value',
        name: '处理率(%)',
        nameTextStyle: { color: muted },
        axisLabel: { color: muted },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '日均举报量',
        type: 'line',
        data: [42, 38, 35, 30, 25, 20, 16, 12],
        smooth: true,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent + '33' }, { offset: 1, color: accent + '05' }] } }
      },
      {
        name: '处理率(%)',
        type: 'line',
        yAxisIndex: 1,
        data: [60, 72, 78, 85, 88, 92, 95, 98],
        smooth: true,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 }
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });

  // --- Chart 3: 问题类型分布 (Pie Chart) ---
  var chart3 = echarts.init(document.getElementById('chart-category'), null, { renderer: 'svg' });
  chart3.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: '5%', top: 'center', textStyle: { color: muted } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg, borderWidth: 2 },
      label: { show: true, color: muted, fontSize: 12 },
      data: [
        { value: 85, name: '楼道堆放垃圾', itemStyle: { color: accent } },
        { value: 62, name: '高空抛物', itemStyle: { color: accent2 } },
        { value: 48, name: '绿化带丢弃', itemStyle: { color: '#F59E0B' } },
        { value: 35, name: '停车场垃圾', itemStyle: { color: '#6366F1' } },
        { value: 22, name: '公共区域杂物', itemStyle: { color: '#EC4899' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart3.resize(); });

  // --- Chart 4: 各区域热点 (Radar Chart) ---
  var chart4 = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chart4.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: 'A栋', max: 50 },
        { name: 'B栋', max: 50 },
        { name: 'C栋', max: 50 },
        { name: 'D栋', max: 50 },
        { name: '中心花园', max: 50 },
        { name: '地下车库', max: 50 }
      ],
      shape: 'circle',
      splitArea: { areaStyle: { color: [bg2 + '66', bg2 + '33'] } },
      axisName: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [42, 28, 35, 15, 22, 38],
          name: '当前问题频次',
          areaStyle: { color: accent + '44' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          value: [20, 12, 18, 8, 10, 22],
          name: '治理后目标值',
          areaStyle: { color: accent2 + '44' },
          lineStyle: { color: accent2, width: 2, type: 'dashed' },
          itemStyle: { color: accent2 }
        }
      ]
    }],
    legend: { bottom: '2%', textStyle: { color: muted } }
  });
  window.addEventListener('resize', function() { chart4.resize(); });
})();
