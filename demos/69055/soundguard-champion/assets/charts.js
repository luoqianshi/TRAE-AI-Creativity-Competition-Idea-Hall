// ECharts for SoundGuard Champion
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();
  var danger = style.getPropertyValue('--danger').trim();
  var success = style.getPropertyValue('--success').trim();

  // --- Radar: Scene Coverage ---
  var radar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  radar.setOption({
    tooltip: { trigger: 'item', appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink, fontSize: 12 } },
    radar: {
      indicator: [
        { name: '交通安全', max: 100 },
        { name: '居家安全', max: 100 },
        { name: '社交沟通', max: 100 },
        { name: '工作场景', max: 100 },
        { name: '紧急求助', max: 100 },
        { name: '儿童安全', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: [bg, bg2] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [95, 90, 88, 85, 98, 92],
        name: 'SoundGuard 覆盖度',
        areaStyle: { color: accent + '33' },
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent },
        symbol: 'circle',
        symbolSize: 6
      }]
    }]
  });
  window.addEventListener('resize', function() { radar.resize(); });

  // --- Gauge: Risk Reduction ---
  var gauge = echarts.init(document.getElementById('chart-gauge'), null, { renderer: 'svg' });
  gauge.setOption({
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      radius: '85%',
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 18,
          color: [[0.3, danger], [0.7, accent2], [1, success]]
        }
      },
      pointer: {
        icon: 'path://M2090.36389,615.30999 L2046.693,615.30999 L2046.693,735.87999 L2035.693,735.87999 L2035.693,615.30999 Z',
        width: 8,
        length: '60%',
        offsetCenter: [0, '5%'],
        itemStyle: { color: ink }
      },
      axisTick: { length: 8, lineStyle: { color: 'auto', width: 1 } },
      splitLine: { length: 18, lineStyle: { color: 'auto', width: 2 } },
      axisLabel: { color: muted, fontSize: 10, distance: 22 },
      title: { offsetCenter: [0, '30%'], fontSize: 14, color: muted, fontFamily: 'InstrumentSans, sans-serif' },
      detail: {
        offsetCenter: [0, '55%'],
        fontSize: 42,
        fontWeight: 700,
        fontFamily: 'InstrumentSans, sans-serif',
        formatter: '{value}%',
        color: accent
      },
      data: [{ value: 82, name: '事故风险降低率' }]
    }]
  });
  window.addEventListener('resize', function() { gauge.resize(); });

  // --- Bar: Market Growth ---
  var market = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  market.setOption({
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink, fontSize: 12 } },
    grid: { left: '12%', right: '8%', bottom: '15%', top: '12%' },
    xAxis: {
      type: 'category',
      data: ['2022', '2023', '2024', '2025', '2026E', '2027E', '2028E'],
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '市场规模（亿元）',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: [120, 180, 260, 380, 520, 720, 1000],
      barWidth: '40%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: accent },
          { offset: 1, color: accent + '44' }
        ])
      },
      label: { show: true, position: 'top', color: ink, fontSize: 10, fontWeight: 600 }
    }]
  });
  window.addEventListener('resize', function() { market.resize(); });

  // --- Mixed: User Growth ---
  var growth = echarts.init(document.getElementById('chart-growth'), null, { renderer: 'svg' });
  growth.setOption({
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink, fontSize: 12 } },
    legend: { data: ['听障人口（百万）', 'SoundGuard覆盖（万）'], top: '5%', textStyle: { color: muted, fontSize: 11 }, itemGap: 20 },
    grid: { left: '10%', right: '10%', bottom: '15%', top: '20%' },
    xAxis: {
      type: 'category',
      data: ['Q1 26', 'Q2 26', 'Q3 26', 'Q4 26', 'Q1 27', 'Q2 27'],
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '百万',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLabel: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      {
        type: 'value',
        name: '万',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLabel: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '听障人口（百万）',
        type: 'bar',
        yAxisIndex: 0,
        barWidth: '30%',
        itemStyle: { borderRadius: [4, 4, 0, 0], color: accent + '66' },
        data: [27.0, 27.0, 27.1, 27.1, 27.2, 27.2]
      },
      {
        name: 'SoundGuard覆盖（万）',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2, borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent2 + '44' },
            { offset: 1, color: accent2 + '05' }
          ])
        },
        data: [0.5, 2, 8, 20, 50, 120]
      }
    ]
  });
  window.addEventListener('resize', function() { growth.resize(); });
})();
