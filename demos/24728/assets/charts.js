(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Radar - 能力雷达图 ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true
    },
    legend: {
      data: ['当前能力', '目标能力'],
      bottom: 0,
      textStyle: { color: muted }
    },
    radar: {
      indicator: [
        { name: '函数与极限', max: 100 },
        { name: '导数与微分', max: 100 },
        { name: '积分运算', max: 100 },
        { name: '线性代数', max: 100 },
        { name: '概率统计', max: 100 },
        { name: '微分方程', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: ink,
        fontSize: 13,
        fontWeight: 600
      },
      splitLine: {
        lineStyle: { color: rule }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: [bg2, 'rgba(74,144,217,0.03)']
        }
      },
      axisLine: {
        lineStyle: { color: rule }
      }
    },
    series: [{
      name: '能力评估',
      type: 'radar',
      data: [
        {
          value: [85, 72, 90, 65, 78, 55],
          name: '当前能力',
          areaStyle: {
            color: accent + '33'
          },
          lineStyle: {
            color: accent,
            width: 2
          },
          itemStyle: {
            color: accent
          }
        },
        {
          value: [90, 85, 90, 80, 85, 75],
          name: '目标能力',
          areaStyle: {
            color: accent2 + '22'
          },
          lineStyle: {
            color: accent2,
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: accent2
          }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
