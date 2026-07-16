(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var radarEl = document.getElementById('radar-chart');
  if (!radarEl) return;

  var chart = echarts.init(radarEl, null, { renderer: 'svg' });

  var indicators = [
    { name: '时效性优势', max: 10 },
    { name: '用户刚需度', max: 10 },
    { name: '网络效应', max: 10 },
    { name: '商业可行性', max: 10 },
    { name: '社会价值', max: 10 },
    { name: '场景丰富度', max: 10 }
  ];

  chart.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      trigger: 'item'
    },
    legend: {
      data: ['任意门现在帮', '传统信息平台', '即时通讯工具'],
      bottom: 0,
      textStyle: {
        color: muted,
        fontSize: 12
      },
      itemWidth: 14,
      itemHeight: 8
    },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: ink,
        fontSize: 12,
        fontWeight: 500
      },
      splitLine: {
        lineStyle: {
          color: rule
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(167, 139, 250, 0.02)', 'rgba(167, 139, 250, 0.05)']
        }
      },
      axisLine: {
        lineStyle: {
          color: rule
        }
      },
      radius: '65%',
      center: ['50%', '45%']
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [10, 8, 9, 8, 9, 9],
          name: '任意门现在帮',
          itemStyle: { color: accent },
          areaStyle: {
            color: accent,
            opacity: 0.25
          },
          lineStyle: {
            width: 2,
            color: accent
          }
        },
        {
          value: [3, 7, 5, 8, 5, 6],
          name: '传统信息平台',
          itemStyle: { color: muted },
          areaStyle: {
            color: muted,
            opacity: 0.1
          },
          lineStyle: {
            width: 1,
            color: muted,
            type: 'dashed'
          }
        },
        {
          value: [7, 5, 6, 6, 4, 4],
          name: '即时通讯工具',
          itemStyle: { color: accent3 },
          areaStyle: {
            color: accent3,
            opacity: 0.1
          },
          lineStyle: {
            width: 1,
            color: accent3,
            type: 'dashed'
          }
        }
      ],
      emphasis: {
        lineStyle: { width: 3 },
        areaStyle: { opacity: 0.4 }
      }
    }]
  });

  window.addEventListener('resize', function() { chart.resize(); });
})();
