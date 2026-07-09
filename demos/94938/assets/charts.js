(function() {
  'use strict';

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Nutrition Radar ---
  var radarContainer = document.getElementById('nutritionRadar');
  if (radarContainer && typeof echarts !== 'undefined') {
    var chart = echarts.init(radarContainer, null, { renderer: 'svg' });

    chart.setOption({
      animation: false,
      color: [accent, accent2],
      tooltip: {
        trigger: 'item',
        appendToBody: true
      },
      legend: {
        bottom: 16,
        data: ['目标摄入', '当前摄入'],
        textStyle: { color: ink, fontSize: 14 }
      },
      radar: {
        indicator: [
          { name: '蛋白质', max: 100 },
          { name: '复合碳水', max: 100 },
          { name: '膳食纤维', max: 100 },
          { name: '维生素', max: 100 },
          { name: '优质脂肪', max: 100 },
          { name: '矿物质', max: 100 }
        ],
        shape: 'polygon',
        radius: '62%',
        axisName: {
          color: ink,
          fontSize: 14,
          fontWeight: 600
        },
        splitArea: {
          areaStyle: {
            color: [bg2, '#fff']
          }
        },
        axisLine: {
          lineStyle: { color: rule }
        },
        splitLine: {
          lineStyle: { color: rule }
        }
      },
      series: [{
        name: '营养摄入',
        type: 'radar',
        data: [
          {
            value: [85, 70, 80, 75, 60, 72],
            name: '目标摄入',
            areaStyle: { color: accent + '33' },
            lineStyle: { width: 3, color: accent },
            itemStyle: { color: accent }
          },
          {
            value: [62, 85, 45, 55, 70, 50],
            name: '当前摄入',
            areaStyle: { color: accent2 + '26' },
            lineStyle: { width: 3, color: accent2 },
            itemStyle: { color: accent2 }
          }
        ]
      }]
    });

    window.addEventListener('resize', function() {
      chart.resize();
    });
  }
})();
