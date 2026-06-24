(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var accentLight = style.getPropertyValue('--accent-light').trim();
  var accent2Light = style.getPropertyValue('--accent2-light').trim();

  // === Chart 1: 中国60岁以上人口增长趋势 ===
  var chart1 = echarts.init(document.getElementById('chart-population'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['60岁以上人口', '独居/空巢老人'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 16,
      itemHeight: 8
    },
    grid: { top: 30, left: 50, right: 30, bottom: 50 },
    xAxis: {
      type: 'category',
      data: ['2020', '2022', '2024', '2026(预)', '2028(预)', '2030(预)', '2035(预)'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '亿人',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisTick: { show: false }
    },
    series: [
      {
        name: '60岁以上人口',
        type: 'bar',
        data: [2.64, 2.80, 2.97, 3.21, 3.45, 3.71, 4.18],
        itemStyle: {
          color: accent,
          borderRadius: [6, 6, 0, 0]
        },
        barWidth: '35%'
      },
      {
        name: '独居/空巢老人',
        type: 'line',
        data: [1.05, 1.10, 1.18, 1.28, 1.38, 1.50, 1.82],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2Light },
              { offset: 1, color: 'rgba(91,140,123,0.05)' }
            ]
          }
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // === Chart 2: 银发经济市场规模预测 ===
  var chart2 = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      formatter: function(params) {
        var s = params[0].name + '年<br/>';
        params.forEach(function(p) {
          s += p.marker + ' ' + p.seriesName + ': ' + p.value + ' 万亿元<br/>';
        });
        return s;
      }
    },
    legend: {
      data: ['银发经济总规模', '智慧养老细分市场'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 16,
      itemHeight: 8
    },
    grid: { top: 30, left: 55, right: 30, bottom: 50 },
    xAxis: {
      type: 'category',
      data: ['2024', '2026', '2028', '2030', '2032', '2035'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '万亿元',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisTick: { show: false }
    },
    series: [
      {
        name: '银发经济总规模',
        type: 'line',
        data: [4.5, 5.8, 7.2, 8.6, 10.3, 12.0],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accentLight },
              { offset: 1, color: 'rgba(212,118,58,0.05)' }
            ]
          }
        }
      },
      {
        name: '智慧养老细分市场',
        type: 'bar',
        data: [0.35, 0.55, 0.82, 1.20, 1.75, 2.80],
        itemStyle: {
          color: accent2,
          borderRadius: [6, 6, 0, 0]
        },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
