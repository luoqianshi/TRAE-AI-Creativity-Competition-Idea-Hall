// assets/charts.js — 轻触助行 创意方案图表
(function() {
  'use strict';

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 痛点头痛指数 (Radar) ---
  var painChart = document.getElementById('chart-pain');
  if (painChart) {
    var chart = echarts.init(painChart, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        trigger: 'axis'
      },
      legend: {
        data: ['手部残障人士', '帕金森患者', '高龄行动不便者', '康复期人群'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 }
      },
      radar: {
        indicator: [
          { name: '操作精度门槛', max: 10 },
          { name: '设备价格负担', max: 10 },
          { name: '设备适配灵活性', max: 10 },
          { name: '日常使用频率', max: 10 },
          { name: '独立操作需求', max: 10 }
        ],
        shape: 'circle',
        splitNumber: 4,
        axisName: {
          color: ink,
          fontSize: 12
        },
        splitLine: {
          lineStyle: { color: rule }
        },
        splitArea: {
          areaStyle: { color: [bg2] }
        },
        axisLine: {
          lineStyle: { color: rule }
        }
      },
      series: [{
        type: 'radar',
        data: [
          {
            name: '手部残障人士',
            value: [8.5, 7, 8, 9, 9.5],
            areaStyle: { color: accent + '33' },
            lineStyle: { color: accent, width: 2 },
            itemStyle: { color: accent }
          },
          {
            name: '帕金森患者',
            value: [9, 6, 8.5, 7, 8],
            areaStyle: { color: accent2 + '33' },
            lineStyle: { color: accent2, width: 2 },
            itemStyle: { color: accent2 }
          },
          {
            name: '高龄行动不便者',
            value: [7.5, 8, 7, 8.5, 9],
            areaStyle: { color: '#05966933' },
            lineStyle: { color: '#059669', width: 2 },
            itemStyle: { color: '#059669' }
          },
          {
            name: '康复期人群',
            value: [6, 6.5, 7.5, 6, 7],
            areaStyle: { color: '#8b5cf633' },
            lineStyle: { color: '#8b5cf6', width: 2 },
            itemStyle: { color: '#8b5cf6' }
          }
        ]
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  }
})();