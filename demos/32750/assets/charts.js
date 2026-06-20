// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Time Comparison ---
  var chart1 = echarts.init(document.getElementById('chart-time-comparison'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        var tip = '<strong>' + params[0].name + '</strong><br/>';
        params.forEach(function(p) {
          tip += p.marker + ' ' + p.seriesName + ': <strong>' + p.value + ' 秒</strong><br/>';
        });
        return tip;
      }
    },
    legend: {
      data: ['手动输入 LaTeX', '研易记提取'],
      top: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      left: 50,
      right: 30,
      top: 50,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: ['简单公式\n(单行分数)', '中等公式\n(多行求和)', '复杂公式\n(矩阵嵌套)', '极复杂公式\n(多行分段函数)'],
      axisLabel: { color: muted, fontSize: 11, lineHeight: 16 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '秒',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '手动输入 LaTeX',
        type: 'bar',
        barWidth: '28%',
        itemStyle: {
          color: muted,
          borderRadius: [4, 4, 0, 0]
        },
        data: [120, 300, 600, 900]
      },
      {
        name: '研易记提取',
        type: 'bar',
        barWidth: '28%',
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        data: [3, 4, 5, 8]
      }
    ]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: User Growth ---
  var chart2 = echarts.init(document.getElementById('chart-user-growth'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        var tip = '<strong>' + params[0].name + '</strong><br/>';
        params.forEach(function(p) {
          tip += p.marker + ' ' + p.seriesName + ': <strong>' + p.value + '</strong><br/>';
        });
        return tip;
      }
    },
    legend: {
      data: ['注册用户', '月活跃用户'],
      top: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      left: 60,
      right: 30,
      top: 50,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: ['Q1\n(MVP)', 'Q2\n(V1.0)', 'Q3', 'Q4\n(V2.0)'],
      axisLabel: { color: muted, fontSize: 11, lineHeight: 16 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '人',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: {
        color: muted,
        fontSize: 11,
        formatter: function(val) {
          if (val >= 10000) return (val / 10000).toFixed(0) + 'w';
          if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
          return val;
        }
      },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '注册用户',
        type: 'bar',
        stack: 'total',
        barWidth: '35%',
        itemStyle: {
          color: accent,
          borderRadius: [0, 0, 0, 0]
        },
        data: [500, 3000, 8000, 20000]
      },
      {
        name: '月活跃用户',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent2, width: 2.5 },
        itemStyle: { color: accent2, borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 + '30' },
              { offset: 1, color: accent2 + '05' }
            ]
          }
        },
        data: [200, 1200, 4500, 14000]
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
