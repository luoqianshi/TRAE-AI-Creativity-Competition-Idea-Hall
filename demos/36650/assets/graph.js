// assets/graph.js — Knowledge Graph visualization using ECharts force-directed graph
(function() {
  function renderGraph() {
    var el = document.getElementById('graphCanvas');
    if (!el) return;

    var style = getComputedStyle(document.documentElement);
    var accent = style.getPropertyValue('--accent').trim();
    var accent2 = style.getPropertyValue('--accent2').trim();
    var ink = style.getPropertyValue('--ink').trim();
    var muted = style.getPropertyValue('--muted').trim();
    var rule = style.getPropertyValue('--rule').trim();
    var bg2 = style.getPropertyValue('--bg2').trim();
    var bg = style.getPropertyValue('--bg').trim();

    var chart = echarts.init(el, null, { renderer: 'svg' });

    var graphData = {
      nodes: [
        { name: 'Go Gin 框架入门指南', category: 0, symbolSize: 38 },
        { name: 'Vue 3 Composition API', category: 1, symbolSize: 34 },
        { name: 'SQLite WAL 模式详解', category: 2, symbolSize: 30 },
        { name: 'JWT 认证最佳实践', category: 0, symbolSize: 28 },
        { name: '系统架构设计笔记', category: 3, symbolSize: 36 },
        { name: 'WebDAV 备份方案', category: 3, symbolSize: 24 },
        { name: '代码整洁之道', category: 4, symbolSize: 22 },
        { name: 'Markdown 编辑器选型', category: 1, symbolSize: 26 },
        { name: 'Go 语言基础', category: 0, symbolSize: 20 },
        { name: 'HTTP 协议', category: 0, symbolSize: 18 },
        { name: '数据库设计', category: 2, symbolSize: 22 },
        { name: '前端工程化', category: 1, symbolSize: 20 },
      ],
      links: [
        { source: 'Go Gin 框架入门指南', target: 'Vue 3 Composition API' },
        { source: 'Go Gin 框架入门指南', target: 'JWT 认证最佳实践' },
        { source: 'Go Gin 框架入门指南', target: 'SQLite WAL 模式详解' },
        { source: 'Go Gin 框架入门指南', target: '系统架构设计笔记' },
        { source: 'Go Gin 框架入门指南', target: 'Go 语言基础' },
        { source: 'Go Gin 框架入门指南', target: 'HTTP 协议' },
        { source: 'Vue 3 Composition API', target: '系统架构设计笔记' },
        { source: 'Vue 3 Composition API', target: 'Markdown 编辑器选型' },
        { source: 'Vue 3 Composition API', target: '前端工程化' },
        { source: 'SQLite WAL 模式详解', target: '数据库设计' },
        { source: 'SQLite WAL 模式详解', target: '系统架构设计笔记' },
        { source: 'JWT 认证最佳实践', target: '系统架构设计笔记' },
        { source: 'JWT 认证最佳实践', target: 'Go 语言基础' },
        { source: '系统架构设计笔记', target: 'WebDAV 备份方案' },
        { source: '系统架构设计笔记', target: '数据库设计' },
        { source: '代码整洁之道', target: 'Go 语言基础' },
        { source: '代码整洁之道', target: '系统架构设计笔记' },
        { source: 'Markdown 编辑器选型', target: '前端工程化' },
      ],
      categories: [
        { name: 'Go', itemStyle: { color: accent } },
        { name: 'Vue', itemStyle: { color: accent2 } },
        { name: '数据库', itemStyle: { color: '#f59e0b' } },
        { name: '架构', itemStyle: { color: '#22c55e' } },
        { name: '读书', itemStyle: { color: '#ec4899' } },
      ]
    };

    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        trigger: 'item',
        backgroundColor: bg,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 12, fontFamily: 'InstrumentSans, sans-serif' },
        formatter: function(params) {
          if (params.dataType === 'node') {
            return '<strong>' + params.name + '</strong><br/>' +
              '<span style="color:' + muted + '">' + graphData.categories[params.data.category].name + '</span>';
          }
          if (params.dataType === 'edge') {
            return params.data.source + ' → ' + params.data.target;
          }
        }
      },
      legend: {
        data: graphData.categories.map(function(c) { return c.name; }),
        bottom: 8,
        left: 'center',
        textStyle: { color: muted, fontSize: 11 },
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 16
      },
      series: [{
        type: 'graph',
        layout: 'force',
        data: graphData.nodes.map(function(n) {
          return {
            name: n.name,
            category: n.category,
            symbolSize: n.symbolSize,
            label: {
              show: n.symbolSize >= 28,
              position: 'bottom',
              distance: 6,
              fontSize: 10,
              color: ink,
              fontFamily: 'InstrumentSans, sans-serif'
            },
            itemStyle: {
              shadowBlur: 6,
              shadowColor: 'rgba(0,0,0,0.1)',
              borderColor: bg,
              borderWidth: 2
            }
          };
        }),
        links: graphData.links.map(function(l) {
          return {
            source: l.source,
            target: l.target,
            lineStyle: {
              color: rule,
              width: 1.5,
              curveness: 0.15
            }
          };
        }),
        categories: graphData.categories,
        roam: true,
        draggable: true,
        force: {
          repulsion: 180,
          edgeLength: [80, 160],
          gravity: 0.06
        },
        emphasis: {
          focus: 'adjacency',
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(0,0,0,0.2)'
          },
          lineStyle: {
            width: 2.5,
            color: accent
          }
        },
        lineStyle: {
          opacity: 0.6
        }
      }]
    });

    window.addEventListener('resize', function() { chart.resize(); });
  }

  // Expose globally
  window.renderGraph = renderGraph;
})();
