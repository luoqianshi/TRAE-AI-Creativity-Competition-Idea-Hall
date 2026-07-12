// charts-v2.js - Creative Proposal charts
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var paper = style.getPropertyValue('--paper').trim();

  // --- Chart: Penetration comparison ---
  var chartPen = echarts.init(document.getElementById('chart-penetration'), null, { renderer: 'svg' });

  chartPen.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['18-35岁人群', '有情感困扰人群', '接受心理咨询', '残念回收站(目标)'],
      axisLabel: {
        color: muted,
        fontFamily: 'InstrumentSans, sans-serif',
        fontSize: 12,
        interval: 0
      },
      axisLine: {
        lineStyle: { color: rule }
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: {
        color: muted,
        fontFamily: 'IBMPlexMono, monospace',
        fontSize: 11
      },
      axisLabel: {
        color: muted,
        fontFamily: 'IBMPlexMono, monospace',
        fontSize: 11,
        formatter: function(val) {
          if (val >= 10000) return (val / 10000).toFixed(0) + '亿';
          if (val >= 1000) return (val / 1000).toFixed(0) + '万';
          return val;
        }
      },
      axisLine: { show: false },
      splitLine: {
        lineStyle: { color: rule, type: 'dashed' }
      }
    },
    series: [
      {
        type: 'bar',
        barWidth: '50%',
        data: [
          { value: 15000, itemStyle: { color: accent2 } },
          { value: 8000, itemStyle: { color: accent } },
          { value: 400, itemStyle: { color: muted } },
          { value: 3000, itemStyle: { 
            color: accent,
            opacity: 0.6,
            decal: {
              symbol: 'line',
              color: '#fff',
              size: 10,
              angle: 45
            }
          } }
        ],
        label: {
          show: true,
          position: 'top',
          color: ink,
          fontFamily: 'InstrumentSerif, serif',
          fontSize: 13,
          formatter: function(params) {
            if (params.value >= 10000) return (params.value / 10000).toFixed(0) + '亿';
            return (params.value / 1000).toFixed(0) + '万';
          }
        },
        itemStyle: {
          borderRadius: [3, 3, 0, 0]
        }
      }
    ]
  });

  window.addEventListener('resize', function() {
    chartPen.resize();
  });
})();
