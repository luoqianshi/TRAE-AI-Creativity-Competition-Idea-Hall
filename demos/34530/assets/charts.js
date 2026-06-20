(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg = style.getPropertyValue('--bg').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var surface = style.getPropertyValue('--surface').trim();
  var danger = style.getPropertyValue('--danger').trim();
  var warn = style.getPropertyValue('--warn').trim();

  // --- Chart: Deduction Graph (force layout) ---
  var deductionGraph = echarts.init(document.getElementById('deductionGraph'), null, { renderer: 'svg' });
  var graphCategories = [
    { name: '核心', itemStyle: { color: accent } },
    { name: '文本', itemStyle: { color: accent2 } },
    { name: '语音', itemStyle: { color: accent3 } },
    { name: '视觉', itemStyle: { color: warn } }
  ];
  var graphNodes = [
    { id: '0', name: '市场趋势', symbolSize: 48, category: 0, value: 100 },
    { id: '1', name: '行业报告A', symbolSize: 28, category: 1, value: 60 },
    { id: '2', name: '新闻舆情', symbolSize: 24, category: 1, value: 50 },
    { id: '3', name: '社交数据', symbolSize: 22, category: 1, value: 45 },
    { id: '4', name: '会议录音', symbolSize: 26, category: 2, value: 55 },
    { id: '5', name: '播客内容', symbolSize: 20, category: 2, value: 40 },
    { id: '6', name: '竞品截图', symbolSize: 24, category: 3, value: 50 },
    { id: '7', name: '产品视频', symbolSize: 22, category: 3, value: 45 },
    { id: '8', name: '用户反馈', symbolSize: 26, category: 1, value: 55 },
    { id: '9', name: '财报数据', symbolSize: 28, category: 1, value: 60 }
  ];
  var graphLinks = [
    { source: '0', target: '1' }, { source: '0', target: '2' },
    { source: '0', target: '3' }, { source: '0', target: '4' },
    { source: '0', target: '5' }, { source: '0', target: '6' },
    { source: '0', target: '7' }, { source: '0', target: '8' },
    { source: '0', target: '9' }, { source: '1', target: '9' },
    { source: '2', target: '8' }, { source: '4', target: '5' }
  ];
  deductionGraph.setOption({
    backgroundColor: 'transparent',
    tooltip: { show: true, appendToBody: true, backgroundColor: surface, borderColor: rule, textStyle: { color: ink } },
    animation: false,
    legend: { data: ['核心','文本','语音','视觉'], textStyle: { color: muted }, bottom: 0 },
    series: [{
      type: 'graph', layout: 'force', roam: true,
      symbol: 'circle',
      label: { show: true, color: ink, fontSize: 11, fontFamily: 'GeistMono, monospace' },
      edgeSymbol: ['none', 'arrow'], edgeSymbolSize: [0, 8],
      edgeLabel: { show: false },
      data: graphNodes,
      links: graphLinks,
      categories: graphCategories,
      lineStyle: { color: rule, width: 1.5, curveness: 0.2 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 2.5, color: accent } },
      force: { repulsion: 280, edgeLength: 90, gravity: 0.1 }
    }]
  });
  window.addEventListener('resize', function() { deductionGraph.resize(); });

  // --- Chart: Cognitive Load Trend ---
  var cognitiveChart = echarts.init(document.getElementById('cognitiveChart'), null, { renderer: 'svg' });
  var days = ['周一','周二','周三','周四','周五','周六','周日'];
  cognitiveChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: surface, borderColor: rule, textStyle: { color: ink } },
    animation: false,
    grid: { left: 48, right: 24, top: 24, bottom: 32 },
    xAxis: {
      type: 'category', data: days,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'GeistMono, monospace', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value', min: 0, max: 100,
      splitLine: { lineStyle: { color: rule, type: [4, 4] } },
      axisLabel: { color: muted, fontFamily: 'GeistMono, monospace', fontSize: 11 }
    },
    series: [
      {
        name: '认知负荷', type: 'line', smooth: true, symbol: 'circle', symbolSize: 8,
        data: [62, 74, 58, 81, 69, 45, 55],
        lineStyle: { color: accent, width: 2.5 },
        itemStyle: { color: accent, borderColor: bg, borderWidth: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
          { offset: 0, color: accent + '33' }, { offset: 1, color: accent + '05' }
        ]}}
      },
      {
        name: '专注深度', type: 'line', smooth: true, symbol: 'circle', symbolSize: 8,
        data: [55, 68, 72, 64, 78, 82, 70],
        lineStyle: { color: accent2, width: 2.5 },
        itemStyle: { color: accent2, borderColor: bg, borderWidth: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
          { offset: 0, color: accent2 + '33' }, { offset: 1, color: accent2 + '05' }
        ]}}
      }
    ],
    legend: { data: ['认知负荷','专注深度'], textStyle: { color: muted }, top: 0, right: 0 }
  });
  window.addEventListener('resize', function() { cognitiveChart.resize(); });

  // --- Chart: Knowledge Intake Distribution ---
  var intakeChart = echarts.init(document.getElementById('intakeChart'), null, { renderer: 'svg' });
  intakeChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', appendToBody: true, backgroundColor: surface, borderColor: rule, textStyle: { color: ink } },
    animation: false,
    series: [{
      type: 'pie', radius: ['42%', '72%'], center: ['50%', '52%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: surface, borderWidth: 3 },
      label: { show: true, color: muted, fontSize: 11, fontFamily: 'GeistMono, monospace', formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 35, name: '技术', itemStyle: { color: accent } },
        { value: 25, name: '商业', itemStyle: { color: accent2 } },
        { value: 20, name: '人文', itemStyle: { color: accent3 } },
        { value: 12, name: '艺术', itemStyle: { color: warn } },
        { value: 8, name: '其他', itemStyle: { color: muted } }
      ]
    }]
  });
  window.addEventListener('resize', function() { intakeChart.resize(); });

  // --- Chart: Learning Path Heatmap ---
  var heatmapChart = echarts.init(document.getElementById('heatmapChart'), null, { renderer: 'svg' });
  var hours = ['00','04','08','12','16','20'];
  var daysH = ['周一','周二','周三','周四','周五','周六','周日'];
  var heatData = [
    [0,0,2],[0,1,4],[0,2,6],[0,3,8],[0,4,5],[0,5,3],[0,6,1],
    [1,0,1],[1,1,3],[1,2,5],[1,3,7],[1,4,4],[1,5,2],[1,6,1],
    [2,0,3],[2,1,6],[2,2,9],[2,3,10],[2,4,8],[2,5,5],[2,6,3],
    [3,0,5],[3,1,7],[3,2,8],[3,3,9],[3,4,7],[3,5,4],[3,6,2],
    [4,0,4],[4,1,6],[4,2,7],[4,3,8],[4,4,6],[4,5,3],[4,6,2],
    [5,0,6],[5,1,8],[5,2,9],[5,3,10],[5,4,9],[5,5,7],[5,6,4]
  ];
  heatmapChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { appendToBody: true, backgroundColor: surface, borderColor: rule, textStyle: { color: ink } },
    animation: false,
    grid: { left: 48, right: 12, top: 8, bottom: 24 },
    xAxis: {
      type: 'category', data: hours,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'GeistMono, monospace', fontSize: 10 },
      axisTick: { show: false }, splitArea: { show: false }
    },
    yAxis: {
      type: 'category', data: daysH,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'GeistMono, monospace', fontSize: 10 },
      axisTick: { show: false }, splitArea: { show: false }
    },
    visualMap: {
      min: 0, max: 10,
      calculable: false,
      orient: 'horizontal', left: 'center', bottom: 0,
      itemWidth: 10, itemHeight: 80,
      inRange: { color: [bg2, accent2 + '88', accent] },
      textStyle: { color: muted, fontSize: 10 },
      show: false
    },
    series: [{
      type: 'heatmap', data: heatData,
      label: { show: false },
      itemStyle: { borderRadius: 3, borderColor: surface, borderWidth: 2 }
    }]
  });
  window.addEventListener('resize', function() { heatmapChart.resize(); });

  // --- Chart: Attention Fluctuation ---
  var attentionChart = echarts.init(document.getElementById('attentionChart'), null, { renderer: 'svg' });
  var timeLabels = [];
  var attentionData = [];
  for (var i = 0; i < 24; i++) {
    timeLabels.push(i + ':00');
    attentionData.push(Math.round(50 + 30 * Math.sin(i * 0.5) + Math.random() * 20));
  }
  attentionChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: surface, borderColor: rule, textStyle: { color: ink } },
    animation: false,
    grid: { left: 40, right: 12, top: 12, bottom: 24 },
    xAxis: {
      type: 'category', data: timeLabels,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'GeistMono, monospace', fontSize: 9, interval: 3 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value', min: 0, max: 100, show: false
    },
    series: [{
      type: 'bar', data: attentionData,
      itemStyle: {
        color: function(p) {
          var v = p.value;
          if (v >= 75) return accent;
          if (v >= 50) return accent3;
          return muted + '66';
        },
        borderRadius: [2, 2, 0, 0]
      },
      barWidth: '60%'
    }]
  });
  window.addEventListener('resize', function() { attentionChart.resize(); });

  // --- Chart: Prediction Path Simulation ---
  var predictionChart = echarts.init(document.getElementById('predictionChart'), null, { renderer: 'svg' });
  var months = ['T+1月','T+2月','T+3月','T+4月','T+5月','T+6月'];
  predictionChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: surface, borderColor: rule, textStyle: { color: ink } },
    animation: false,
    grid: { left: 56, right: 24, top: 24, bottom: 32 },
    xAxis: {
      type: 'category', data: months,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'GeistMono, monospace', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value', name: '预期收益指数',
      nameTextStyle: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: [4, 4] } },
      axisLabel: { color: muted, fontFamily: 'GeistMono, monospace', fontSize: 11 }
    },
    series: [
      {
        name: '技能深耕', type: 'line', smooth: true, symbol: 'circle', symbolSize: 8,
        data: [100, 108, 115, 122, 128, 135],
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent, borderColor: bg, borderWidth: 2 }
      },
      {
        name: '跨界转型', type: 'line', smooth: true, symbol: 'circle', symbolSize: 8,
        data: [100, 95, 102, 118, 132, 148],
        lineStyle: { color: accent2, width: 3, type: [6, 4] },
        itemStyle: { color: accent2, borderColor: bg, borderWidth: 2 }
      },
      {
        name: '创业探索', type: 'line', smooth: true, symbol: 'circle', symbolSize: 8,
        data: [100, 88, 92, 105, 125, 160],
        lineStyle: { color: accent3, width: 3, type: [2, 4] },
        itemStyle: { color: accent3, borderColor: bg, borderWidth: 2 }
      }
    ],
    legend: { data: ['技能深耕','跨界转型','创业探索'], textStyle: { color: muted }, top: 0, right: 0 }
  });
  window.addEventListener('resize', function() { predictionChart.resize(); });
})();
