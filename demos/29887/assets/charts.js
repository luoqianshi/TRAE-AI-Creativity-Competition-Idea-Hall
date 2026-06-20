(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Evaluation Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-evaluation-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: '独特性', max: 100 },
        { name: '痛点契合', max: 100 },
        { name: '创新性', max: 100 },
        { name: '可行性', max: 100 },
        { name: '市场潜力', max: 100 },
        { name: '技术难度', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 13 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [85, 78, 90, 72, 88, 65],
          name: '创意评分示例',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: Price Range Bar ---
  var chartPrice = echarts.init(document.getElementById('chart-price-range'), null, { renderer: 'svg' });
  chartPrice.setOption({
    animation: false,
    tooltip: { appendToBody: true, formatter: function(p) { return p.name + ': ¥' + p.value; } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['D级(60以下)', 'C级(60-70)', 'B级(70-85)', 'A级(85-95)', 'S级(95+)'],
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '价格区间 (元)',
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 500, itemStyle: { color: muted } },
        { value: 2000, itemStyle: { color: accent2 + 'aa' } },
        { value: 8000, itemStyle: { color: accent2 } },
        { value: 25000, itemStyle: { color: accent + 'cc' } },
        { value: 80000, itemStyle: { color: accent } }
      ],
      barWidth: '50%',
      label: { show: true, position: 'top', color: ink, formatter: '¥{c}' }
    }]
  });
  window.addEventListener('resize', function() { chartPrice.resize(); });

  // --- Chart: User Flow Funnel ---
  var chartFunnel = echarts.init(document.getElementById('chart-user-flow'), null, { renderer: 'svg' });
  chartFunnel.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    color: [accent, accent + 'cc', accent + '99', accent2, muted],
    series: [{
      type: 'funnel',
      left: '10%',
      top: 20,
      bottom: 20,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: { show: true, position: 'inside', color: '#fff', fontSize: 13 },
      data: [
        { value: 100, name: '发布创意' },
        { value: 85, name: 'AI评估' },
        { value: 70, name: '定价上架' },
        { value: 45, name: '被企业采购' },
        { value: 30, name: '成功变现' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartFunnel.resize(); });
})();
