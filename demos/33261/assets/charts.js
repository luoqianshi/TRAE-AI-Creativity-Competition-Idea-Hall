// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: AI Workflow (Sankey-like flow) ---
  var workflowEl = document.getElementById('chart-workflow');
  if (workflowEl) {
    var chartWorkflow = echarts.init(workflowEl, null, { renderer: 'svg' });

    var stages = [
      '需求输入', '知识检索', '模板匹配', '代码生成', '人工审核'
    ];
    var details = [
      '自然语言描述\n设备配置与功能需求',
      'RAG语义检索\n向量+全文混合检索',
      '推荐匹配模板\n参数化配置',
      '框架代码生成\nAI辅助业务逻辑',
      '安全合规审查\n人工最终确认'
    ];

    chartWorkflow.setOption({
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        backgroundColor: '#fff',
        borderColor: rule,
        textStyle: { color: ink, fontSize: 13 }
      },
      series: [{
        type: 'graph',
        layout: 'none',
        symbol: 'roundRect',
        symbolSize: [120, 50],
        roam: false,
        label: {
          show: true,
          fontSize: 13,
          fontWeight: 700,
          color: ink,
          formatter: function(p) { return stages[p.dataIndex]; }
        },
        itemStyle: {
          color: bg2,
          borderColor: accent,
          borderWidth: 2,
          shadowBlur: 8,
          shadowColor: accent + '33'
        },
        lineStyle: {
          color: accent,
          width: 2,
          curveness: 0.3
        },
        emphasis: {
          itemStyle: {
            color: accent + '22',
            borderColor: accent,
            borderWidth: 3
          },
          label: { fontSize: 14 }
        },
        data: stages.map(function(name, i) {
          return {
            name: name,
            value: details[i],
            x: i * 200 + 100,
            y: 180
          };
        }),
        links: stages.slice(0, -1).map(function(name, i) {
          return {
            source: name,
            target: stages[i + 1]
          };
        })
      }]
    });

    window.addEventListener('resize', function() { chartWorkflow.resize(); });
  }

  // --- Chart: Core Metrics Improvement ---
  var metricsEl = document.getElementById('chart-metrics');
  if (metricsEl) {
    var chartMetrics = echarts.init(metricsEl, null, { renderer: 'svg' });

    var categories = ['新项目启动时间', '工程复用率', '检索命中率', 'AI代码可用率', '新人上手时间'];

    // Normalized to 0-100 scale for comparison
    // 启动时间: 3周=21天 -> 3天 -> 1天 (inverted: shorter is better)
    // 复用率: 15% -> 40% -> 60%
    // 检索命中率: 0% -> 60% -> 80%
    // AI代码可用率: 0% -> 0% -> 70%
    // 上手时间: 3月 -> 2月 -> 1月 (inverted: shorter is better)

    var baseline = [10, 15, 0, 0, 10];
    var mvp = [70, 40, 60, 0, 33];
    var v2 = [90, 60, 80, 70, 67];

    chartMetrics.setOption({
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: '#fff',
        borderColor: rule,
        textStyle: { color: ink, fontSize: 13 },
        formatter: function(params) {
          var idx = params[0].dataIndex;
          var lines = ['<strong>' + categories[idx] + '</strong>'];
          var rawLabels = [
            ['当前: 2-4周', 'MVP: 3天', 'V2: 1天'],
            ['当前: <15%', 'MVP: 40%', 'V2: 60%'],
            ['当前: —', 'MVP: 60%', 'V2: 80%'],
            ['当前: —', 'MVP: —', 'V2: 70%'],
            ['当前: 3个月', 'MVP: 2个月', 'V2: 1个月']
          ];
          params.forEach(function(p) {
            lines.push(p.marker + ' ' + rawLabels[idx][p.seriesIndex]);
          });
          return lines.join('<br/>');
        }
      },
      legend: {
        data: ['当前基线', 'MVP目标', 'V2目标'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 }
      },
      grid: {
        left: 40,
        right: 20,
        top: 20,
        bottom: 50
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          color: muted,
          fontSize: 11,
          interval: 0,
          rotate: 15
        },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          color: muted,
          fontSize: 11,
          formatter: '{value}%'
        },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          name: '当前基线',
          type: 'bar',
          data: baseline,
          itemStyle: {
            color: muted + '66',
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '18%',
          barGap: '30%'
        },
        {
          name: 'MVP目标',
          type: 'bar',
          data: mvp,
          itemStyle: {
            color: accent2,
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '18%'
        },
        {
          name: 'V2目标',
          type: 'bar',
          data: v2,
          itemStyle: {
            color: accent,
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '18%'
        }
      ],
      animation: false
    });

    window.addEventListener('resize', function() { chartMetrics.resize(); });
  }
})();
