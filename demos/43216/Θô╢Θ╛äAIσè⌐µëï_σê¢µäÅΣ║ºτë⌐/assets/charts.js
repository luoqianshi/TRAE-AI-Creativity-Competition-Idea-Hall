(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accentGreen = style.getPropertyValue('--accent-green').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: 老年人使用AI的主要障碍 ---
  var chartBarriers = echarts.init(document.getElementById('chart-barriers'), null, { renderer: 'svg' });

  var barrierData = [
    { name: '界面字体太小看不清', value: 78 },
    { name: '操作步骤太多太复杂', value: 69 },
    { name: '老年人口音识别不准确', value: 56 },
    { name: '按钮太小按不准', value: 48 },
    { name: '不懂术语，不知道说什么', value: 42 }
  ];

  var optionBarriers = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: 100,
      right: 20,
      top: 8,
      bottom: 8
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: barrierData.map(item => item.name),
      axisLabel: { color: ink },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { lineStyle: { color: rule } }
    },
    series: [
      {
        type: 'bar',
        data: barrierData.map(item => item.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: accent },
            { offset: 1, color: accentGreen }
          ]),
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: ink
        },
        barWidth: 26
      }
    ]
  };

  chartBarriers.setOption(optionBarriers);
  window.addEventListener('resize', function() { chartBarriers.resize(); });

  // --- Chart 2: 中国老年人口增长趋势 ---
  var chartPopulation = echarts.init(document.getElementById('chart-population'), null, { renderer: 'svg' });

  var populationData = [
    { year: 2015, population: 2.22 },
    { year: 2018, population: 2.49 },
    { year: 2020, population: 2.64 },
    { year: 2022, population: 2.80 },
    { year: 2024, population: 2.88 },
    { year: 2025, population: 2.92 },
    { year: 2030, population: 3.50 },
    { year: 2035, population: 4.00 }
  ];

  var optionPopulation = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>60岁以上人口：{c}亿'
    },
    grid: {
      left: 50,
      right: 30,
      top: 30,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: populationData.map(item => item.year),
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '亿人',
      min: 2,
      max: 4.5,
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '老年人口',
        type: 'line',
        data: populationData.map(item => item.population),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: accent
        },
        itemStyle: {
          color: accent,
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent + '40' },
            { offset: 1, color: accent + '00' }
          ])
        }
      }
    ]
  };

  chartPopulation.setOption(optionPopulation);
  window.addEventListener('resize', function() { chartPopulation.resize(); });

})();