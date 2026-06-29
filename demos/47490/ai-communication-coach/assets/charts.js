(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: 全球AI教育市场规模增长趋势 ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '12%', right: '8%', top: '12%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: ['2021', '2022', '2023', '2024', '2025', '2026E', '2027E', '2028E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '亿美元',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    series: [{
      type: 'bar',
      data: [25, 38, 55, 82, 130, 180, 255, 360],
      barWidth: '50%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: accent },
          { offset: 1, color: accent + '66' }
        ]),
        borderRadius: [6, 6, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        color: accent,
        fontWeight: 700,
        fontSize: 12,
        formatter: function(p) { return p.value; }
      }
    }]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart 2: 成本效率对比 ---
  var chartCost = echarts.init(document.getElementById('chart-cost'), null, { renderer: 'svg' });
  chartCost.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { bottom: 0, textStyle: { color: muted, fontSize: 12 } },
    grid: { left: '12%', right: '8%', top: '12%', bottom: '18%' },
    xAxis: {
      type: 'category',
      data: ['单次成本', '月训练10次', '月训练30次', '年训练365次'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: {
      type: 'log',
      name: '元（对数轴）',
      nameTextStyle: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 12 },
      min: 0.05
    },
    series: [
      {
        name: '传统教练',
        type: 'bar',
        data: [500, 5000, 15000, 182500],
        itemStyle: { color: muted + '88', borderRadius: [4, 4, 0, 0] },
        barGap: '20%',
        label: { show: true, position: 'top', color: muted, fontSize: 11, fontWeight: 600 }
      },
      {
        name: 'AI沟通教练',
        type: 'bar',
        data: [1, 10, 30, 365],
        itemStyle: { color: accent2, borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top', color: accent2, fontSize: 11, fontWeight: 600 }
      }
    ]
  });
  window.addEventListener('resize', function() { chartCost.resize(); });

  // --- Chart 3: 训练频次与成本关系 ---
  var chartFreq = echarts.init(document.getElementById('chart-freq'), null, { renderer: 'svg' });
  chartFreq.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { bottom: 0, textStyle: { color: muted, fontSize: 12 } },
    grid: { left: '12%', right: '8%', top: '12%', bottom: '18%' },
    xAxis: {
      type: 'category',
      data: ['1次/周', '3次/周', '7次/周', '14次/周', '30次/周'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '元/月',
      nameTextStyle: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    series: [
      {
        name: '传统教练',
        type: 'line',
        data: [2000, 6000, 14000, 28000, 60000],
        smooth: true,
        lineStyle: { color: muted, width: 3 },
        itemStyle: { color: muted },
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: { color: muted + '15' }
      },
      {
        name: 'AI教练',
        type: 'line',
        data: [4, 12, 28, 56, 120],
        smooth: true,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 },
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: { color: accent2 + '15' }
      }
    ]
  });
  window.addEventListener('resize', function() { chartFreq.resize(); });

  // --- Chart 4: 雷达图 ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: { bottom: 0, textStyle: { color: muted, fontSize: 12 }, itemGap: 24 },
    radar: {
      indicator: [
        { name: '倾听能力', max: 100 },
        { name: '提问能力', max: 100 },
        { name: '表达能力', max: 100 },
        { name: '共情能力', max: 100 },
        { name: '引导能力', max: 100 }
      ],
      radius: '58%',
      center: ['50%', '45%'],
      axisName: { color: ink, fontSize: 13, fontWeight: 700 },
      splitArea: { areaStyle: { color: ['transparent', bg2] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [62, 55, 70, 58, 52],
          name: '训练前',
          lineStyle: { color: muted, width: 2 },
          areaStyle: { color: muted + '18' },
          itemStyle: { color: muted },
          symbol: 'circle', symbolSize: 6
        },
        {
          value: [90, 85, 92, 88, 80],
          name: '训练30天后',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '22' },
          itemStyle: { color: accent },
          symbol: 'circle', symbolSize: 6
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
