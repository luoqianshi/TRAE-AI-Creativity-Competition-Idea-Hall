(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Architecture Graph ---
  var chartArch = echarts.init(document.getElementById('chart-arch'), null, { renderer: 'svg' });
  var optionArch = {
    animation: false,
    tooltip: {
      trigger: 'item',
      formatter: '{b}',
      appendToBody: true
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        symbolSize: 72,
        roam: false,
        label: {
          show: true,
          fontSize: 13,
          fontWeight: 600,
          color: '#fff',
          formatter: '{b}'
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 10],
        data: [
          { name: '情绪陪伴\n养成', itemStyle: { color: accent }, x: 400, y: 100 },
          { name: '每日激励\n系统', itemStyle: { color: accent }, x: 200, y: 220 },
          { name: '习惯日志\n记录', itemStyle: { color: accent }, x: 600, y: 220 },
          { name: '结构化\n复盘', itemStyle: { color: accent2 }, x: 300, y: 360 },
          { name: 'AI 专属\n陪伴者', itemStyle: { color: accent2 }, x: 500, y: 360 },
          { name: '数据周报\n月报', itemStyle: { color: muted }, x: 400, y: 480 },
          { name: '专属电子\n徽章', itemStyle: { color: muted }, x: 150, y: 360 }
        ],
        links: [
          { source: '情绪陪伴\n养成', target: '每日激励\n系统', lineStyle: { color: rule, width: 2 } },
          { source: '情绪陪伴\n养成', target: '习惯日志\n记录', lineStyle: { color: rule, width: 2 } },
          { source: '每日激励\n系统', target: '结构化\n复盘', lineStyle: { color: rule, width: 2 } },
          { source: '习惯日志\n记录', target: 'AI 专属\n陪伴者', lineStyle: { color: rule, width: 2 } },
          { source: '结构化\n复盘', target: '数据周报\n月报', lineStyle: { color: rule, width: 2 } },
          { source: 'AI 专属\n陪伴者', target: '数据周报\n月报', lineStyle: { color: rule, width: 2 } },
          { source: '情绪陪伴\n养成', target: '专属电子\n徽章', lineStyle: { color: rule, width: 2 } }
        ],
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0.15
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 4 }
        }
      }
    ]
  };
  chartArch.setOption(optionArch);
  window.addEventListener('resize', function() { chartArch.resize(); });
})();
