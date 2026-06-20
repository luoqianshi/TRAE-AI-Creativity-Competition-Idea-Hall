// assets/charts.js — Memory Ark (记忆方舟) Charts
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // --- Chart 1: Forgetting Curve with Review Intervention ---
  var chartForgetting = echarts.init(document.getElementById('chart-forgetting'), null, { renderer: 'svg' });

  var hours = ['0h', '1h', '9h', '1d', '2d', '6d', '15d', '31d'];
  var noReview = [100, 44, 36, 34, 28, 25, 21, 21];
  var withReview = [100, 92, 85, 80, 75, 68, 62, 58];

  chartForgetting.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      formatter: function(params) {
        var s = '<strong>' + params[0].axisValue + '</strong><br/>';
        params.forEach(function(p) {
          s += p.marker + ' ' + p.seriesName + ': <strong>' + p.value + '%</strong><br/>';
        });
        return s;
      }
    },
    legend: {
      data: ['无复习（自然遗忘）', '有复习（记忆方舟）'],
      top: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      left: 50,
      right: 30,
      top: 45,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '记忆保持率 (%)',
      nameTextStyle: { color: muted, fontSize: 11 },
      min: 0,
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '无复习（自然遗忘）',
        type: 'line',
        data: noReview,
        smooth: true,
        lineStyle: { color: '#ff6b6b', width: 2.5 },
        itemStyle: { color: '#ff6b6b' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255,107,107,0.15)' },
              { offset: 1, color: 'rgba(255,107,107,0.02)' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '有复习（记忆方舟）',
        type: 'line',
        data: withReview,
        smooth: true,
        lineStyle: { color: accent, width: 2.5 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,212,170,0.15)' },
              { offset: 1, color: 'rgba(0,212,170,0.02)' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  });
  window.addEventListener('resize', function() { chartForgetting.resize(); });

  // --- Chart 2: Knowledge Mastery Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });

  chartRadar.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['当前掌握度', '目标掌握度'],
      top: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    radar: {
      indicator: [
        { name: 'Python基础', max: 100 },
        { name: '数据结构', max: 100 },
        { name: '机器学习', max: 100 },
        { name: '深度学习', max: 100 },
        { name: 'NLP', max: 100 },
        { name: '项目实战', max: 100 }
      ],
      shape: 'polygon',
      radius: '60%',
      axisName: { color: muted, fontSize: 11 },
      splitArea: {
        areaStyle: {
          color: [bg, bg2, bg, bg2, bg]
        }
      },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [85, 72, 55, 40, 35, 60],
            name: '当前掌握度',
            lineStyle: { color: accent, width: 2 },
            itemStyle: { color: accent },
            areaStyle: { color: 'rgba(0,212,170,0.15)' }
          },
          {
            value: [95, 90, 85, 80, 75, 90],
            name: '目标掌握度',
            lineStyle: { color: accent2, width: 2, type: 'dashed' },
            itemStyle: { color: accent2 },
            areaStyle: { color: 'rgba(240,165,0,0.08)' }
          }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Mermaid Init ---
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#1c2333',
        primaryTextColor: '#e6edf3',
        primaryBorderColor: '#00d4aa',
        lineColor: '#8b949e',
        secondaryColor: '#161b22',
        tertiaryColor: '#0d1117',
        fontSize: '13px'
      },
      securityLevel: 'loose'
    });
  }
})();
