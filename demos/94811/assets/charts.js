// assets/charts.js — ECharts radar chart for AI智序 product capability comparison
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var chartDom = document.getElementById('chart-radar');
  if (!chartDom) return;

  var chart = echarts.init(chartDom, null, { renderer: 'svg' });

  var option = {
    animation: false,
    tooltip: {
      appendToBody: true,
      trigger: 'item',
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      bottom: 0,
      textStyle: { color: ink, fontSize: 12 },
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 24
    },
    radar: {
      center: ['50%', '52%'],
      radius: '65%',
      indicator: [
        { name: 'AI智能拆解', max: 100 },
        { name: '场景适配', max: 100 },
        { name: '专注工具', max: 100 },
        { name: '数据复盘', max: 100 },
        { name: '轻量化', max: 100 },
        { name: '反焦虑设计', max: 100 }
      ],
      axisName: {
        color: ink,
        fontSize: 12,
        fontWeight: 500
      },
      splitArea: {
        areaStyle: {
          color: ['transparent', 'transparent']
        }
      },
      splitLine: {
        lineStyle: { color: rule }
      },
      axisLine: {
        lineStyle: { color: rule }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          name: 'AI智序',
          value: [95, 92, 90, 88, 95, 93],
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: {
            color: accent,
            width: 2.5
          },
          areaStyle: {
            color: accent + '26'
          },
          itemStyle: {
            color: accent
          }
        },
        {
          name: '传统Todo工具',
          value: [10, 15, 25, 40, 55, 10],
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: {
            color: muted,
            width: 2,
            type: 'dashed'
          },
          areaStyle: {
            color: muted + '18'
          },
          itemStyle: {
            color: muted
          }
        },
        {
          name: '通用AI助手',
          value: [60, 20, 5, 5, 40, 5],
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: {
            color: accent2,
            width: 2,
            type: 'dashed'
          },
          areaStyle: {
            color: accent2 + '18'
          },
          itemStyle: {
            color: accent2
          }
        }
      ]
    }]
  };

  chart.setOption(option);
  window.addEventListener('resize', function() { chart.resize(); });
})();