// assets/charts.js — ECharts initialization for static charts
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // --- Radar Chart: 7 Dimensions ---
  var radarEl = document.getElementById('chart-radar');
  if (radarEl) {
    var radarChart = echarts.init(radarEl, null, { renderer: 'svg' });
    radarChart.setOption({
      animation: false,
      color: [accent],
      tooltip: { trigger: 'item', appendToBody: true },
      radar: {
        indicator: [
          { name: '信用与合规', max: 20 },
          { name: '财务健康度', max: 15 },
          { name: '经营稳定性', max: 15 },
          { name: '行业与市场', max: 10 },
          { name: '政策与落地', max: 15 },
          { name: '实控人治理', max: 15 },
          { name: '政商与基金', max: 10 }
        ],
        shape: 'circle',
        splitNumber: 4,
        axisName: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [16, 12, 13, 8, 11, 12, 7],
            name: '权重分配',
            areaStyle: { color: accent + '33' },
            lineStyle: { color: accent, width: 2 },
            itemStyle: { color: accent },
            symbol: 'circle',
            symbolSize: 6
          }
        ]
      }]
    });
    window.addEventListener('resize', function() { radarChart.resize(); });
  }

  // --- Workflow Chart ---
  var wfEl = document.getElementById('chart-workflow');
  if (wfEl) {
    var wfChart = echarts.init(wfEl, null, { renderer: 'svg' });
    var phases = [
      { name: 'Phase 0\n统一数据采集', agent: 'data-collection', color: '#3b82f6' },
      { name: 'Phase 0.5\n负面情报扫描', agent: 'negative-intel', color: '#ef4444' },
      { name: 'Phase 1\n全并行分析', agent: 'parallel-analysis', color: '#00d4aa' },
      { name: 'Phase 2\n风控与画像', agent: 'risk-portrait', color: '#f59e0b' },
      { name: 'Phase 3\n战略分析', agent: 'strategy', color: '#6366f1' },
      { name: 'Phase 4\n报告撰写', agent: 'report', color: '#22c55e' },
      { name: 'Phase 5\n质量审查', agent: 'quality', color: '#ec4899' },
      { name: 'Phase 6\n终稿发布', agent: 'final', color: '#a855f7' }
    ];

    var nodes = phases.map(function(p, i) {
      return {
        name: p.name,
        x: i * 130 + 60,
        y: 160,
        itemStyle: { color: p.color },
        label: { color: ink, fontSize: 10, lineHeight: 14 },
        symbolSize: [100, 50],
        symbol: 'roundRect'
      };
    });

    var links = [];
    for (var i = 0; i < phases.length - 1; i++) {
      links.push({
        source: phases[i].name,
        target: phases[i + 1].name,
        lineStyle: { color: rule, width: 2, curveness: 0 }
      });
    }

    // Parallel branch for Phase 1
    var subAgents = [
      { name: '企业情报', x: 390 + 60, y: 80 },
      { name: '政策适配', x: 390 + 60, y: 160 },
      { name: '行业研究', x: 390 + 60, y: 240 }
    ];
    subAgents.forEach(function(sa) {
      nodes.push({
        name: sa.name,
        x: sa.x,
        y: sa.y,
        itemStyle: { color: accent2 },
        label: { color: ink, fontSize: 9 },
        symbolSize: [80, 36],
        symbol: 'roundRect'
      });
      links.push({
        source: phases[2].name,
        target: sa.name,
        lineStyle: { color: accent2 + '66', width: 1.5, type: 'dashed' }
      });
    });

    wfChart.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true },
      series: [{
        type: 'graph',
        layout: 'none',
        data: nodes,
        links: links,
        roam: true,
        draggable: false,
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 3 }
        },
        lineStyle: { endArrow: true, arrowSize: 6 }
      }],
      grid: { left: 20, right: 20, top: 20, bottom: 20 }
    });
    window.addEventListener('resize', function() { wfChart.resize(); });
  }

  // Expose chart references for demo.js
  window._wfChart = wfChart;
  window._radarChart = radarChart;
  window._chartColors = { accent: accent, accent2: accent2, ink: ink, muted: muted, rule: rule, bg2: bg2 };
})();
