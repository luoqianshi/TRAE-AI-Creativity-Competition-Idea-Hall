(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Pain Points Comparison ---
  var chartPainPoints = echarts.init(document.getElementById('chart-pain-points'), null, { renderer: 'svg' });
  chartPainPoints.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['传统笔记', 'AI知识图谱笔记'], bottom: 0, textStyle: { color: ink } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['整理时间', '复习效率', '知识关联度', '记忆留存率', '使用满意度'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统笔记',
        type: 'bar',
        data: [30, 35, 20, 40, 45],
        itemStyle: { color: muted + '99' },
        barWidth: '30%'
      },
      {
        name: 'AI知识图谱笔记',
        type: 'bar',
        data: [85, 90, 95, 80, 92],
        itemStyle: { color: accent },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartPainPoints.resize(); });

  // --- Chart: Knowledge Graph Demo ---
  var chartGraph = echarts.init(document.getElementById('chart-knowledge-graph'), null, { renderer: 'svg' });
  var graphData = {
    nodes: [
      { id: '0', name: '机器学习', symbolSize: 70, category: 0 },
      { id: '1', name: '神经网络', symbolSize: 55, category: 1 },
      { id: '2', name: '深度学习', symbolSize: 55, category: 1 },
      { id: '3', name: '监督学习', symbolSize: 45, category: 2 },
      { id: '4', name: '无监督学习', symbolSize: 45, category: 2 },
      { id: '5', name: 'CNN', symbolSize: 40, category: 3 },
      { id: '6', name: 'RNN', symbolSize: 40, category: 3 },
      { id: '7', name: 'Transformer', symbolSize: 45, category: 3 },
      { id: '8', name: '反向传播', symbolSize: 40, category: 1 },
      { id: '9', name: '梯度下降', symbolSize: 40, category: 1 },
      { id: '10', name: 'PyTorch', symbolSize: 35, category: 4 },
      { id: '11', name: 'TensorFlow', symbolSize: 35, category: 4 }
    ],
    links: [
      { source: '0', target: '1' },
      { source: '0', target: '2' },
      { source: '0', target: '3' },
      { source: '0', target: '4' },
      { source: '1', target: '2' },
      { source: '1', target: '8' },
      { source: '1', target: '9' },
      { source: '2', target: '5' },
      { source: '2', target: '6' },
      { source: '2', target: '7' },
      { source: '5', target: '10' },
      { source: '5', target: '11' },
      { source: '6', target: '10' },
      { source: '8', target: '9' },
      { source: '7', target: '10' }
    ],
    categories: [
      { name: '核心概念' },
      { name: '算法' },
      { name: '学习类型' },
      { name: '模型架构' },
      { name: '工具框架' }
    ]
  };
  chartGraph.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: { data: graphData.categories.map(function(a) { return a.name; }), bottom: 0, textStyle: { color: ink } },
    series: [{
      type: 'graph',
      layout: 'force',
      data: graphData.nodes,
      links: graphData.links,
      categories: graphData.categories,
      roam: true,
      label: { show: true, position: 'inside', color: '#fff', fontSize: 12 },
      force: { repulsion: 300, edgeLength: 80 },
      lineStyle: { color: 'source', curveness: 0.2 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 4 } }
    }]
  });
  window.addEventListener('resize', function() { chartGraph.resize(); });
})();
