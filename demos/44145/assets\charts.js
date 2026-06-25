// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Market Gap Analysis (Bubble Chart) ---
  var chartGap = echarts.init(document.getElementById('chart-gap'), null, { renderer: 'svg' });

  var categories = [
    '美发沙龙经营',
    '化妆/换装+经营',
    '美甲/SPA经营',
    '护肤/ASMR解压',
    '医美诊所经营'
  ];

  var data = [
    [85, 80, 50, '美发沙龙经营'],    // 高竞争, 高需求, 大体量
    [70, 75, 45, '化妆/换装+经营'],   // 中高竞争, 高需求, 中大体量
    [45, 55, 25, '美甲/SPA经营'],     // 中等竞争, 中需求, 中体量
    [25, 40, 15, '护肤/ASMR解压'],   // 低竞争, 中低需求, 小体量
    [10, 65, 8,  '医美诊所经营']     // 几乎空白, 高需求(潜在), 极小体量
  ];

  var optionGap = {
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: function(params) {
        return '<strong>' + params.data[3] + '</strong><br/>' +
          '竞争热度: ' + params.data[0] + '<br/>' +
          '市场需求: ' + params.data[1] + '<br/>' +
          '现有产品体量: ' + params.data[2];
      }
    },
    grid: {
      left: '12%',
      right: '8%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      name: '竞争热度 →',
      nameLocation: 'center',
      nameGap: 30,
      nameTextStyle: { color: muted, fontSize: 12 },
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      name: '市场需求 →',
      nameLocation: 'end',
      nameTextStyle: { color: muted, fontSize: 12 },
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'scatter',
      data: data,
      symbolSize: function(val) {
        return Math.max(val[2] * 1.2, 20);
      },
      itemStyle: {
        color: function(params) {
          var idx = params.dataIndex;
          if (idx === 4) return accent; // 医美 - accent highlight
          if (idx === 0) return '#E57373'; // 高竞争 - red
          if (idx === 1) return '#FFB74D'; // 中高 - orange
          if (idx === 2) return accent2;   // 中等 - gold
          return '#81C784'; // 低竞争 - green
        },
        opacity: 0.85,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.15)'
      },
      label: {
        show: true,
        formatter: function(params) {
          return params.data[3];
        },
        position: 'right',
        fontSize: 11,
        color: ink,
        fontWeight: 600,
        textBorderColor: '#fff',
        textBorderWidth: 2
      },
      markLine: {
        silent: true,
        lineStyle: { color: accent, type: 'dashed', width: 1.5, opacity: 0.6 },
        data: [
          { xAxis: 30, label: { formatter: '低竞争区', color: accent, fontSize: 10 } }
        ]
      },
      markArea: {
        silent: true,
        data: [[
          { xAxis: 0, yAxis: 50, itemStyle: { color: 'rgba(212,87,122,0.06)' } },
          { xAxis: 30, yAxis: 100 }
        ]],
        label: {
          show: true,
          position: 'insideTopLeft',
          formatter: '蓝海机会区',
          color: accent,
          fontSize: 13,
          fontWeight: 700
        }
      }
    }]
  };

  chartGap.setOption(optionGap);
  window.addEventListener('resize', function() { chartGap.resize(); });
})();
