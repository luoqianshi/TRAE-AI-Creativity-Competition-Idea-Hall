// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();
  var red = style.getPropertyValue('--red').trim();
  var green = style.getPropertyValue('--green').trim();

  // === Simulated NAV data (2023-01 to 2026-06) ===
  var months = [];
  var navData = [1.0];
  var benchmarkData = [1.0];
  var baseDate = new Date(2023, 0, 1);

  // Generate realistic NAV curve
  var seed = 42;
  function seededRandom() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  for (var i = 0; i < 42; i++) {
    var d = new Date(baseDate);
    d.setMonth(d.getMonth() + i);
    months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));

    var monthlyReturn = (seededRandom() - 0.42) * 0.08;
    var benchReturn = (seededRandom() - 0.48) * 0.06;
    navData.push(navData[i] * (1 + monthlyReturn));
    benchmarkData.push(benchmarkData[i] * (1 + benchReturn));
  }

  // === Chart 1: NAV Curve ===
  var chartNav = echarts.init(document.getElementById('chart-nav'), null, { renderer: 'svg' });
  chartNav.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: 'rgba(22,27,34,0.95)',
      borderColor: rule,
      textStyle: { color: ink, fontFamily: 'GeistMono, monospace', fontSize: 12 }
    },
    legend: {
      data: ['策略净值', '沪深300'],
      top: 0, right: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: { top: 40, bottom: 30, left: 60, right: 20 },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 10, rotate: 45 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0.8,
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 10, formatter: function(v) { return v.toFixed(2); } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '策略净值',
        type: 'line',
        data: navData,
        smooth: true,
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(88,166,255,0.25)' },
            { offset: 1, color: 'rgba(88,166,255,0.02)' }
          ])
        },
        symbol: 'none'
      },
      {
        name: '沪深300',
        type: 'line',
        data: benchmarkData,
        smooth: true,
        lineStyle: { color: muted, width: 1.5, type: 'dashed' },
        itemStyle: { color: muted },
        symbol: 'none'
      }
    ]
  });
  window.addEventListener('resize', function() { chartNav.resize(); });

  // === Chart 2: Monthly Returns Heatmap ===
  var years = ['2023', '2024', '2025', '2026'];
  var monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  var heatmapData = [];

  for (var yi = 0; yi < years.length; yi++) {
    for (var mi = 0; mi < 12; mi++) {
      var idx = yi * 12 + mi;
      if (idx >= navData.length - 1) {
        heatmapData.push([mi, yi, '-']);
      } else {
        var ret = ((navData[idx + 1] / navData[idx]) - 1) * 100;
        heatmapData.push([mi, yi, parseFloat(ret.toFixed(2))]);
      }
    }
  }

  var chartHeatmap = echarts.init(document.getElementById('chart-heatmap'), null, { renderer: 'svg' });
  chartHeatmap.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: 'rgba(22,27,34,0.95)',
      borderColor: rule,
      textStyle: { color: ink, fontFamily: 'GeistMono, monospace', fontSize: 12 },
      formatter: function(p) {
        if (p.value[2] === '-') return years[p.value[1]] + ' ' + monthNames[p.value[0]] + ': N/A';
        var v = p.value[2];
        var clr = v >= 0 ? red : green;
        return '<span style="color:' + clr + '">' + years[p.value[1]] + ' ' + monthNames[p.value[0]] + ': ' + (v >= 0 ? '+' : '') + v.toFixed(2) + '%</span>';
      }
    },
    grid: { top: 10, bottom: 40, left: 55, right: 20 },
    xAxis: {
      type: 'category',
      data: monthNames,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 10 },
      axisTick: { show: false },
      splitArea: { show: false }
    },
    yAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false },
      splitArea: { show: false }
    },
    visualMap: {
      min: -8,
      max: 8,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      itemWidth: 12,
      itemHeight: 120,
      textStyle: { color: muted, fontSize: 10 },
      inRange: {
        color: ['#1a5c2a', '#1a3a2a', bg2, '#3a2a1a', '#5c2a1a']
      },
      outOfRange: { color: 'transparent' }
    },
    series: [{
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: true,
        fontSize: 10,
        fontFamily: 'GeistMono, monospace',
        formatter: function(p) {
          if (p.value[2] === '-') return '';
          var v = p.value[2];
          return (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
        },
        color: ink
      },
      itemStyle: {
        borderColor: rule,
        borderWidth: 2,
        borderRadius: 3
      },
      emphasis: {
        itemStyle: { borderColor: accent, borderWidth: 2 }
      }
    }]
  });
  window.addEventListener('resize', function() { chartHeatmap.resize(); });
})();
