// charts.js — ECharts + Mermaid initialization for 解压日记 pitch page
(function() {
  // ---- Mermaid init ----
  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: '#faf6f0',
        primaryTextColor: '#28201a',
        primaryBorderColor: '#e6dccc',
        lineColor: '#8a7d70',
        fontFamily: 'Bricolage, PingFang SC, system-ui, sans-serif',
        fontSize: '14px'
      }
    });
  }

  if (!window.echarts) return;

  var style = getComputedStyle(document.documentElement);
  var accent  = style.getPropertyValue('--accent').trim()  || '#ef5a3d';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#5b6ee0';
  var calm    = style.getPropertyValue('--calm').trim()    || '#7aa890';
  var warn    = style.getPropertyValue('--warn').trim()    || '#f0b429';
  var ink     = style.getPropertyValue('--ink').trim()     || '#28201a';
  var muted   = style.getPropertyValue('--muted').trim()   || '#8a7d70';
  var rule    = style.getPropertyValue('--rule').trim()    || '#e6dccc';
  var bg2     = style.getPropertyValue('--bg2').trim()     || '#f1ebe1';

  // ---- Chart 1: emotion distribution radar ----
  var el1 = document.getElementById('chart-emotion');
  if (el1) {
    var chart1 = echarts.init(el1, null, { renderer: 'svg' });
    chart1.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true },
      radar: {
        indicator: [
          { name: '愉悦', max: 100 },
          { name: '平静', max: 100 },
          { name: '焦虑', max: 100 },
          { name: '愤怒', max: 100 },
          { name: '低落', max: 100 },
          { name: '疲惫', max: 100 },
          { name: '感动', max: 100 }
        ],
        radius: '65%',
        splitNumber: 4,
        axisName: { color: ink, fontSize: 12, fontWeight: 600 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: [bg2, '#ffffff'] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            name: '本月',
            value: [62, 78, 45, 38, 52, 60, 70],
            areaStyle: { color: 'rgba(239,90,61,0.18)' },
            lineStyle: { color: accent, width: 2 },
            itemStyle: { color: accent }
          },
          {
            name: '上月',
            value: [45, 60, 65, 55, 70, 75, 50],
            areaStyle: { color: 'rgba(91,110,224,0.12)' },
            lineStyle: { color: accent2, width: 2, type: 'dashed' },
            itemStyle: { color: accent2 }
          }
        ]
      }],
      legend: { data: ['本月', '上月'], bottom: 0, textStyle: { color: muted, fontSize: 11 } }
    });
    window.addEventListener('resize', function() { chart1.resize(); });
  }

  // ---- Chart 2: weekly emotion intensity (line) ----
  var el2 = document.getElementById('chart-trend');
  if (el2) {
    var chart2 = echarts.init(el2, null, { renderer: 'svg' });
    chart2.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      grid: { left: 40, right: 20, top: 30, bottom: 50 },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        max: 100,
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11 }
      },
      legend: { data: ['情绪强度', '安抚触发线'], bottom: 0, textStyle: { color: muted, fontSize: 11 } },
      series: [
        {
          name: '情绪强度',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: [55, 72, 88, 65, 92, 48, 40],
          lineStyle: { color: accent, width: 3 },
          itemStyle: { color: accent },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(239,90,61,0.35)' },
              { offset: 1, color: 'rgba(239,90,61,0.02)' }
            ])
          },
          markPoint: {
            symbol: 'pin',
            symbolSize: 50,
            data: [{ type: 'max', name: '峰值' }],
            itemStyle: { color: accent }
          }
        },
        {
          name: '安抚触发线',
          type: 'line',
          data: [80, 80, 80, 80, 80, 80, 80],
          lineStyle: { color: accent2, type: 'dashed', width: 1.5 },
          itemStyle: { color: accent2 },
          symbol: 'none'
        }
      ]
    });
    window.addEventListener('resize', function() { chart2.resize(); });
  }
})();
