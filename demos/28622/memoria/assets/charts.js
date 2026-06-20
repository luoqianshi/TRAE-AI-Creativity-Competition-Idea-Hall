// assets/charts.js — ECharts trend chart for Memoria
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Internet penetration & death population trend ---
  var chartEl = document.getElementById('chart-trend');
  if (!chartEl) return;

  var chart = echarts.init(chartEl, null, { renderer: 'svg' });

  var years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  var internetRate = [59.6, 64.5, 70.4, 73.0, 75.6, 77.5, 79.3, 80.1]; // %
  var deathPop = [993, 998, 998, 1014, 1041, 1110, 1127, 1131]; // 万人

  chart.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#1a1d27',
      borderColor: '#2d3140',
      textStyle: { color: '#f0ebe3', fontSize: 13 },
      formatter: function(params) {
        var s = '<strong>' + params[0].axisValue + '年</strong><br/>';
        params.forEach(function(p) {
          s += p.marker + ' ' + p.seriesName + '：<strong>' + p.value + '</strong>' +
               (p.seriesIndex === 0 ? '%' : '万人') + '<br/>';
        });
        return s;
      }
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 16,
      itemHeight: 3
    },
    grid: {
      left: 50,
      right: 50,
      top: 50,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: '互联网普及率 (%)',
        nameTextStyle: { color: muted, fontSize: 11 },
        min: 50,
        max: 90,
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: muted, fontSize: 11 }
      },
      {
        type: 'value',
        name: '死亡人口 (万人)',
        nameTextStyle: { color: muted, fontSize: 11 },
        min: 900,
        max: 1200,
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: muted, fontSize: 11 }
      }
    ],
    series: [
      {
        name: '互联网普及率',
        type: 'line',
        yAxisIndex: 0,
        data: internetRate,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: accent },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '40' },
              { offset: 1, color: accent + '05' }
            ]
          }
        }
      },
      {
        name: '死亡人口',
        type: 'bar',
        yAxisIndex: 1,
        data: deathPop,
        barWidth: 24,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 + 'cc' },
              { offset: 1, color: accent2 + '33' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  });

  window.addEventListener('resize', function() { chart.resize(); });
})();
