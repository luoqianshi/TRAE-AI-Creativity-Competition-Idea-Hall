(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var success = style.getPropertyValue('--success').trim();
  var warning = style.getPropertyValue('--warning').trim();

  // --- Chart: Radar - Interview Scoring ---
  var radarChart = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  radarChart.setOption({
    animation: true,
    animationDuration: 1500,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    radar: {
      indicator: [
        { name: '专业度', max: 100 },
        { name: '逻辑性', max: 100 },
        { name: '表达能力', max: 100 },
        { name: '应变能力', max: 100 },
        { name: '项目经验', max: 100 },
        { name: '岗位匹配', max: 100 }
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
        show: true,
        areaStyle: {
          color: ['rgba(6,182,212,0.03)', 'rgba(6,182,212,0.06)', 'rgba(6,182,212,0.09)', 'rgba(6,182,212,0.12)']
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
          value: [85, 78, 82, 75, 88, 80],
          name: '本次面试',
          areaStyle: {
            color: accent + '40'
          },
          lineStyle: {
            color: accent,
            width: 2
          },
          itemStyle: {
            color: accent,
            borderWidth: 2,
            borderColor: ink
          },
          symbol: 'circle',
          symbolSize: 8
        },
        {
          value: [70, 65, 68, 60, 75, 70],
          name: '首次面试',
          areaStyle: {
            color: accent2 + '20'
          },
          lineStyle: {
            color: accent2,
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: accent2,
            borderWidth: 2,
            borderColor: ink
          },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    }],
    legend: {
      data: ['本次面试', '首次面试'],
      bottom: 0,
      textStyle: { color: muted }
    }
  });
  window.addEventListener('resize', function() { radarChart.resize(); });

  // --- Chart: Gauge - Resume Competitiveness ---
  var gaugeChart = echarts.init(document.getElementById('chart-gauge'), null, { renderer: 'svg' });
  gaugeChart.setOption({
    animation: true,
    animationDuration: 2000,
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      itemStyle: {
        color: accent
      },
      progress: {
        show: true,
        width: 20,
        roundCap: true
      },
      pointer: {
        show: true,
        length: '60%',
        width: 6,
        itemStyle: { color: ink }
      },
      axisLine: {
        lineStyle: {
          width: 20,
          color: [[1, rule]]
        }
      },
      axisTick: {
        distance: -30,
        splitNumber: 5,
        lineStyle: { width: 1, color: muted }
      },
      splitLine: {
        distance: -35,
        length: 10,
        lineStyle: { width: 2, color: muted }
      },
      axisLabel: {
        distance: -20,
        color: muted,
        fontSize: 10
      },
      anchor: {
        show: true,
        size: 15,
        itemStyle: { borderColor: accent, borderWidth: 3, color: bg2 }
      },
      title: {
        show: true,
        offsetCenter: [0, '35%'],
        fontSize: 14,
        color: muted
      },
      detail: {
        valueAnimation: true,
        fontSize: 40,
        fontFamily: 'Tektur',
        offsetCenter: [0, '10%'],
        formatter: '{value}',
        color: accent,
        fontWeight: 'bold'
      },
      data: [{ value: 78, name: '竞争力评分' }]
    }]
  });
  window.addEventListener('resize', function() { gaugeChart.resize(); });

  // --- Chart: Line - Weekly Progress ---
  var progressChart = echarts.init(document.getElementById('chart-progress'), null, { renderer: 'svg' });
  progressChart.setOption({
    animation: true,
    animationDuration: 1500,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      axisPointer: {
        type: 'cross',
        crossStyle: { color: rule }
      }
    },
    legend: {
      data: ['专业度', '逻辑性', '表达能力', '综合评分'],
      top: 0,
      textStyle: { color: muted }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '专业度',
        type: 'line',
        smooth: true,
        data: [65, 68, 72, 75, 78, 80, 83, 85],
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '40' },
              { offset: 1, color: accent + '05' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 8
      },
      {
        name: '逻辑性',
        type: 'line',
        smooth: true,
        data: [58, 60, 63, 65, 68, 70, 74, 78],
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 + '30' },
              { offset: 1, color: accent2 + '05' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 8
      },
      {
        name: '表达能力',
        type: 'line',
        smooth: true,
        data: [62, 65, 68, 70, 73, 76, 79, 82],
        lineStyle: { color: success, width: 3 },
        itemStyle: { color: success },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: success + '30' },
              { offset: 1, color: success + '05' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 8
      },
      {
        name: '综合评分',
        type: 'line',
        smooth: true,
        data: [62, 64, 68, 70, 73, 75, 79, 82],
        lineStyle: { color: warning, width: 3, type: 'dashed' },
        itemStyle: { color: warning },
        symbol: 'diamond',
        symbolSize: 10
      }
    ]
  });
  window.addEventListener('resize', function() { progressChart.resize(); });
})();
