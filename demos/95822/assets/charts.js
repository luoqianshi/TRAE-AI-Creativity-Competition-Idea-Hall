(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: Birth Rate Trend ---
  var chart1 = echarts.init(document.getElementById('chart-birth-rate'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    color: [accent],
    grid: { top: 30, right: 30, bottom: 50, left: 60 },
    tooltip: {
      appendToBody: true,
      trigger: 'axis',
      formatter: function(params) {
        return params[0].name + '年<br/>出生人口: <b>' + params[0].value + ' 万</b>';
      }
    },
    xAxis: {
      type: 'category',
      data: ['2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 11, rotate: 45 }
    },
    yAxis: {
      type: 'value',
      name: '万人',
      min: 600,
      max: 1800,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    series: [{
      type: 'line',
      data: [1592, 1604, 1635, 1640, 1687, 1655, 1786, 1723, 1523, 1465, 1200, 1062, 956, 902, 954, 792],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 3, color: accent },
      itemStyle: { color: accent },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: accent + '40' },
          { offset: 1, color: accent + '05' }
        ])
      },
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: accent2, type: 'dashed', width: 1.5 },
        label: { color: accent2, fontSize: 10, formatter: '800万' },
        data: [{ yAxis: 800 }]
      }
    }]
  });

  // --- Chart 2: Reasons for not having children ---
  var chart2 = echarts.init(document.getElementById('chart-reasons'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    color: [accent, accent2, accent + '99', accent2 + '99', muted],
    grid: { top: 10, right: 30, bottom: 20, left: 20 },
    tooltip: {
      appendToBody: true,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        return params[0].name + '<br/>占比: <b>' + params[0].value + '%</b>';
      }
    },
    xAxis: {
      type: 'value',
      max: 70,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: ['教育成本高', '购房压力', '时间精力不够', '生育对身体影响', '收入压力'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: ink, fontSize: 12, fontWeight: 500 }
    },
    series: [{
      type: 'bar',
      data: [49.4, 45.2, 50.3, 41.8, 58.07],
      barWidth: 22,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: function(params) {
          var colors = [accent, accent2, accent + '99', accent2 + '99', muted];
          return colors[params.dataIndex];
        }
      },
      label: {
        show: true,
        position: 'right',
        color: ink,
        fontSize: 11,
        fontWeight: 600,
        formatter: '{c}%'
      }
    }]
  });

  window.addEventListener('resize', function() {
    chart1.resize();
    chart2.resize();
  });
})();