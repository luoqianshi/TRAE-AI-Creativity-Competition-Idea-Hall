(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Architecture Diagram ---
  var chart = echarts.init(document.getElementById('chart-arch'), null, { renderer: 'svg' });

  var layers = ['用户交互层', 'AI 能力层（Trae）', '输出产物层'];
  var modules = [
    ['系统诊断', '方案生成', '知识问答'],
    ['架构分析引擎', '代码转换引擎', '知识检索引擎'],
    ['改造方案文档', '迁移脚本代码', '测试验证报告']
  ];

  var data = [];
  for (var yi = 0; yi < layers.length; yi++) {
    for (var xi = 0; xi < modules[yi].length; xi++) {
      data.push([xi, yi, modules[yi][xi]]);
    }
  }

  chart.setOption({
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: function(p) {
        return '<b>' + layers[p.value[1]] + '</b><br/>' + p.value[2];
      }
    },
    grid: {
      top: 40,
      bottom: 50,
      left: 100,
      right: 40
    },
    xAxis: {
      type: 'category',
      data: ['诊断分析', '代码迁移', '知识管理'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: layers,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13, fontWeight: 600 },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    visualMap: {
      min: 0,
      max: 2,
      dimension: 1,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      show: false,
      inRange: {
        color: [accent2, accent, '#0d9488']
      }
    },
    series: [{
      type: 'heatmap',
      data: data,
      label: {
        show: true,
        fontSize: 12,
        color: '#fff',
        fontWeight: 600,
        formatter: function(p) { return p.value[2]; }
      },
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 3
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.2)'
        }
      }
    }]
  });

  window.addEventListener('resize', function() { chart.resize(); });
})();
