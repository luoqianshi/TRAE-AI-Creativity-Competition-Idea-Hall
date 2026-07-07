// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var card = style.getPropertyValue('--card').trim();
  var success = style.getPropertyValue('--success').trim();

  // --- Chart: Efficiency Comparison ---
  var chartEfficiency = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEfficiency.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      backgroundColor: card,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['传统方案', '安心守护'],
      top: 0,
      textStyle: { color: muted, fontSize: 13 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '14%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['应急响应时间\n(分钟→秒)', '异常检测\n准确率(%)', '巡查效率\n(基准100)', '护理覆盖\n(基准100)', '家属信息\n透明度(基准100)'],
      axisLabel: {
        color: muted,
        fontSize: 12,
        interval: 0
      },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      max: 120,
      axisLabel: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: '传统方案',
        type: 'bar',
        barWidth: '30%',
        itemStyle: {
          color: accent2 + '99',
          borderRadius: [4, 4, 0, 0]
        },
        data: [5, 45, 60, 55, 30]
      },
      {
        name: '安心守护',
        type: 'bar',
        barWidth: '30%',
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        data: [100, 92, 100, 95, 95]
      }
    ]
  });
  window.addEventListener('resize', function() { chartEfficiency.resize(); });

  // --- Chart: Market Size Trend ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: card,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      formatter: function(params) {
        var p = params[0];
        return p.name + '年<br/>养老产业规模：<strong>' + p.value + '</strong> 亿元';
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['2020', '2021', '2022', '2023', '2024', '2025', '2026E', '2027E', '2028E'],
      axisLabel: { color: muted, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: muted,
        fontSize: 12,
        formatter: function(v) { return v >= 10000 ? (v / 10000).toFixed(0) + '万' : v; }
      },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: '市场规模',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: accent,
          width: 3
        },
        itemStyle: {
          color: accent,
          borderColor: card,
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '30' },
              { offset: 1, color: accent + '05' }
            ]
          }
        },
        data: [42000, 49000, 58000, 69000, 82000, 98000, 115000, 135000, 158000]
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });
})();
