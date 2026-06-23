(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true
    },
    legend: {
      data: ['阿根廷', '法国'],
      textStyle: { color: ink },
      bottom: 0
    },
    radar: {
      indicator: [
        { name: '进攻', max: 100 },
        { name: '防守', max: 100 },
        { name: '控球', max: 100 },
        { name: '传球', max: 100 },
        { name: '速度', max: 100 },
        { name: '体能', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: muted,
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: rule }
      },
      splitArea: {
        areaStyle: {
          color: [bg2, 'transparent']
        }
      },
      axisLine: {
        lineStyle: { color: rule }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [92, 78, 85, 88, 75, 82],
          name: '阿根廷',
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
          value: [88, 85, 80, 82, 90, 88],
          name: '法国',
          areaStyle: {
            color: accent2 + '33'
          },
          lineStyle: {
            color: accent2,
            width: 2
          },
          itemStyle: {
            color: accent2
          }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: Line ---
  var chartLine = echarts.init(document.getElementById('chart-line'), null, { renderer: 'svg' });
  chartLine.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true
    },
    legend: {
      data: ['阿根廷胜率', '法国胜率', '平局概率'],
      textStyle: { color: ink },
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['赛前7天', '赛前5天', '赛前3天', '赛前1天', '赛前6小时', '赛前1小时'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '阿根廷胜率',
        type: 'line',
        smooth: true,
        data: [42, 45, 48, 52, 55, 58],
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '44' },
              { offset: 1, color: accent + '00' }
            ]
          }
        }
      },
      {
        name: '法国胜率',
        type: 'line',
        smooth: true,
        data: [38, 36, 34, 32, 30, 28],
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 + '44' },
              { offset: 1, color: accent2 + '00' }
            ]
          }
        }
      },
      {
        name: '平局概率',
        type: 'line',
        smooth: true,
        data: [20, 19, 18, 16, 15, 14],
        lineStyle: { color: muted, width: 2, type: 'dashed' },
        itemStyle: { color: muted }
      }
    ]
  });
  window.addEventListener('resize', function() { chartLine.resize(); });
})();
