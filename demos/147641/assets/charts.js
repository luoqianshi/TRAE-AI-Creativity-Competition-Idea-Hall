(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // === Mermaid Init ===
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose' });
  }

  // === Chart 1: Radar — Subject Ability Scores ===
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: {
      data: ['当前能力值', '4周前能力值'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    radar: {
      indicator: [
        { name: '数学', max: 10 },
        { name: '英语', max: 10 },
        { name: '物理', max: 10 },
        { name: '化学', max: 10 },
        { name: '语文', max: 10 },
        { name: '生物', max: 10 }
      ],
      shape: 'circle',
      splitNumber: 5,
      axisName: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [4.2, 7.5, 5.8, 6.1, 8.0, 7.2],
          name: '当前能力值',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent, opacity: 0.2 },
          itemStyle: { color: accent }
        },
        {
          value: [2.8, 7.0, 5.2, 5.5, 7.8, 6.8],
          name: '4周前能力值',
          lineStyle: { color: accent2, width: 2, type: 'dashed' },
          areaStyle: { color: accent2, opacity: 0.1 },
          itemStyle: { color: accent2 }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // === Chart 2: Line — Weekly Subject Time Trends ===
  var chartTrend = echarts.init(document.getElementById('chart-trend'), null, { renderer: 'svg' });
  var weeks = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'];
  chartTrend.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true
    },
    legend: {
      data: ['数学', '英语', '物理', '语文'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      left: '3%', right: '4%', bottom: '15%', top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: weeks,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    series: [
      {
        name: '数学',
        type: 'line',
        smooth: true,
        data: [140, 135, 125, 118, 112, 105, 100, 95],
        lineStyle: { color: '#ef4444', width: 2 },
        itemStyle: { color: '#ef4444' },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '英语',
        type: 'line',
        smooth: true,
        data: [60, 58, 55, 55, 52, 50, 48, 47],
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '物理',
        type: 'line',
        smooth: true,
        data: [90, 88, 85, 82, 80, 78, 75, 73],
        lineStyle: { color: accent2, width: 2 },
        itemStyle: { color: accent2 },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '语文',
        type: 'line',
        smooth: true,
        data: [45, 44, 43, 42, 42, 40, 40, 39],
        lineStyle: { color: '#8b5cf6', width: 2 },
        itemStyle: { color: '#8b5cf6' },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  });
  window.addEventListener('resize', function() { chartTrend.resize(); });

  // === Chart 3: Area Line — Math Ability Improvement ===
  var chartImprove = echarts.init(document.getElementById('chart-improve'), null, { renderer: 'svg' });
  var days = ['Day1', 'Day5', 'Day10', 'Day15', 'Day20', 'Day25', 'Day30', 'Day35', 'Day40', 'Day45', 'Day50', 'Day55', 'Day60'];
  var mathAbility = [2.8, 2.9, 3.1, 3.0, 3.3, 3.5, 3.4, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2];
  var mathTime = [140, 138, 132, 135, 128, 122, 125, 118, 115, 112, 108, 105, 100];

  chartImprove.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true
    },
    legend: {
      data: ['数学能力值', '数学耗时(分钟)'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      left: '3%', right: '4%', bottom: '15%', top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '能力值',
        nameTextStyle: { color: muted, fontSize: 11 },
        min: 0,
        max: 10,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11 }
      },
      {
        type: 'value',
        name: '分钟',
        nameTextStyle: { color: muted, fontSize: 11 },
        min: 80,
        max: 160,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 }
      }
    ],
    series: [
      {
        name: '数学能力值',
        type: 'line',
        smooth: true,
        data: mathAbility,
        lineStyle: { color: accent, width: 2.5 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '40' },
              { offset: 1, color: accent + '05' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '数学耗时(分钟)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: mathTime,
        lineStyle: { color: '#ef4444', width: 2, type: 'dashed' },
        itemStyle: { color: '#ef4444' },
        symbol: 'diamond',
        symbolSize: 6
      }
    ]
  });
  window.addEventListener('resize', function() { chartImprove.resize(); });

})();
