// AuxetiCAD Proposal Charts
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  var colorPalette = [accent, accent2, accent + '99', accent2 + '99', accent + '66', accent2 + '66'];

  // --- Chart 1: Poisson Ratio Range ---
  var chart1 = echarts.init(document.getElementById('chart-poisson'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '15%', right: '8%', top: '5%', bottom: '5%' },
    xAxis: {
      type: 'value',
      name: '等效泊松比 ν',
      nameLocation: 'middle',
      nameGap: 30,
      min: -1.8,
      max: 0,
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } },
      nameTextStyle: { color: muted }
    },
    yAxis: {
      type: 'category',
      data: ['折纸型', '旋转正方形', '星形', '反手性', '手性', '双箭头', '凹角六边形', '十字形(专利)'],
      inverse: true,
      axisLabel: { color: ink },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: [
        { value: -1.0, itemStyle: { color: colorPalette[0] } },
        { value: -0.8, itemStyle: { color: colorPalette[1] } },
        { value: -1.5, itemStyle: { color: colorPalette[2] } },
        { value: -0.9, itemStyle: { color: colorPalette[3] } },
        { value: -1.2, itemStyle: { color: colorPalette[4] } },
        { value: -1.0, itemStyle: { color: colorPalette[5] } },
        { value: -0.6, itemStyle: { color: colorPalette[0] } },
        { value: -0.8, itemStyle: { color: accent, emphasis: { color: accent } } }
      ],
      barWidth: 18,
      label: {
        show: true,
        position: 'right',
        formatter: function(p) { return 'ν ≈ ' + p.value.toFixed(1); },
        color: muted,
        fontSize: 11
      },
      markLine: {
        silent: true,
        symbol: 'none',
        label: { color: accent2, fontSize: 10, formatter: 'ν = -0.5' },
        lineStyle: { color: accent2, type: 'dashed', width: 1 },
        data: [{ xAxis: -0.5 }]
      }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: Radar Comparison ---
  var chart2 = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      center: ['50%', '55%'],
      radius: '65%',
      indicator: [
        { name: '负泊松比\n强度', max: 5 },
        { name: '吸能效率', max: 5 },
        { name: '轻量化', max: 5 },
        { name: '可打印性', max: 5 },
        { name: '设计自由度', max: 5 },
        { name: '刚度可调', max: 5 }
      ],
      axisName: { color: muted, fontSize: 10 },
      splitArea: { areaStyle: { color: ['transparent', 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [4.5, 4.2, 3.8, 5, 4.5, 4.0],
          name: '十字形(专利)',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [3.5, 3.8, 3.5, 4.5, 3.2, 3.5],
          name: '凹角六边形',
          areaStyle: { color: accent2 + '22' },
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 },
          symbol: 'diamond',
          symbolSize: 6
        },
        {
          value: [4.0, 4.5, 4.2, 2.5, 3.8, 4.5],
          name: '星形',
          areaStyle: { color: accent + '88' + '22' },
          lineStyle: { color: accent + '99', width: 2 },
          itemStyle: { color: accent + '99' },
          symbol: 'triangle',
          symbolSize: 6
        },
        {
          value: [4.2, 3.0, 4.5, 3.5, 3.5, 3.8],
          name: '手性',
          areaStyle: { color: accent2 + '99' + '22' },
          lineStyle: { color: accent2 + '99', width: 2 },
          itemStyle: { color: accent2 + '99' },
          symbol: 'rect',
          symbolSize: 6
        }
      ]
    }],
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 11 },
      itemWidth: 12,
      itemHeight: 12
    }
  });
  window.addEventListener('resize', function() { chart2.resize(); });

  // --- Chart 3: Compare Radar ---
  var chart3 = echarts.init(document.getElementById('chart-compare'), null, { renderer: 'svg' });
  chart3.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      center: ['50%', '55%'],
      radius: '65%',
      indicator: [
        { name: '胞元库丰富度', max: 5 },
        { name: 'AI 集成度', max: 5 },
        { name: 'CAD 集成', max: 5 },
        { name: '易用性', max: 5 },
        { name: '仿真衔接', max: 5 },
        { name: '性价比', max: 5 }
      ],
      axisName: { color: muted, fontSize: 10 },
      splitArea: { areaStyle: { color: ['transparent', 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [5, 5, 5, 5, 4.5, 5],
          name: 'AuxetiCAD',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2.5 },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 7
        },
        {
          value: [3, 1, 2, 2, 3.5, 1],
          name: 'nTopology',
          areaStyle: { color: accent2 + '22' },
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 },
          symbol: 'diamond',
          symbolSize: 6
        },
        {
          value: [1, 1, 1, 3, 1, 2],
          name: 'Materialise Magics',
          areaStyle: { color: muted + '22' },
          lineStyle: { color: muted, width: 2 },
          itemStyle: { color: muted },
          symbol: 'triangle',
          symbolSize: 6
        },
        {
          value: [1, 1, 4, 2, 2, 2],
          name: '手动建模',
          areaStyle: { color: accent + '66' + '15' },
          lineStyle: { color: accent + '66', width: 2, type: 'dashed' },
          itemStyle: { color: accent + '66' },
          symbol: 'rect',
          symbolSize: 6
        }
      ]
    }],
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 11 },
      itemWidth: 12,
      itemHeight: 12
    }
  });
  window.addEventListener('resize', function() { chart3.resize(); });
})();