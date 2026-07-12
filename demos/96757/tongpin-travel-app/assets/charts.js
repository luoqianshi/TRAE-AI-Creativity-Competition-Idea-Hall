(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 伴游市场增长趋势 ---
  var chartGrowth = echarts.init(document.getElementById('chart-growth'), null, { renderer: 'svg' });
  chartGrowth.setOption({
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['订单量增速 (%)', '市场规模 (亿元)'], top: 0, textStyle: { color: muted, fontSize: 12 } },
    grid: { top: 50, right: 60, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: ['2021', '2022', '2023', '2024', '2025H1', '2026E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: [
      {
        type: 'value', name: '增速 (%)', nameTextStyle: { color: muted },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted }
      },
      {
        type: 'value', name: '市场规模 (亿元)', nameTextStyle: { color: muted },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { show: false },
        axisLabel: { color: muted }
      }
    ],
    series: [
      {
        name: '订单量增速 (%)', type: 'bar', barWidth: '32%',
        data: [45, 68, 120, 210, 320, 450],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '市场规模 (亿元)', type: 'line', yAxisIndex: 1,
        data: [3.2, 5.8, 12.5, 28.0, 48.0, 86.0],
        lineStyle: { color: accent2, width: 2.5 },
        itemStyle: { color: accent2 },
        symbol: 'circle', symbolSize: 7,
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent2 + '30' }, { offset: 1, color: accent2 + '05' }] } }
      }
    ]
  });
  window.addEventListener('resize', function() { chartGrowth.resize(); });

  // --- Chart: 用户画像分布 ---
  var chartPersona = echarts.init(document.getElementById('chart-persona'), null, { renderer: 'svg' });
  chartPersona.setOption({
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}% ({d}%)' },
    legend: { orient: 'vertical', right: 20, top: 'center', textStyle: { color: muted, fontSize: 13 } },
    series: [{
      type: 'pie', radius: ['42%', '70%'], center: ['38%', '50%'],
      avoidLabelOverlap: true,
      label: { show: true, color: ink, fontSize: 12, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 42, name: '22-25岁 大学生', itemStyle: { color: accent } },
        { value: 35, name: '26-30岁 白领', itemStyle: { color: accent2 } },
        { value: 15, name: '31-35岁 职场人', itemStyle: { color: accent + '99' } },
        { value: 8, name: '其他', itemStyle: { color: muted } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartPersona.resize(); });

  // --- Chart: 痛点严重度雷达图 ---
  var chartPain = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });
  chartPain.setOption({
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: '匹配效率低', max: 100 },
        { name: '安全无保障', max: 100 },
        { name: '信任成本高', max: 100 },
        { name: '行后无沉淀', max: 100 },
        { name: '体验碎片化', max: 100 },
        { name: '社交破冰难', max: 100 }
      ],
      shape: 'circle',
      axisName: { color: ink, fontSize: 12 },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [92, 88, 85, 78, 82, 90],
          name: '现状痛点',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '25' },
          itemStyle: { color: accent }
        },
        {
          value: [25, 20, 22, 30, 18, 20],
          name: '同频旅行方案',
          lineStyle: { color: accent2, width: 2, type: 'dashed' },
          areaStyle: { color: accent2 + '15' },
          itemStyle: { color: accent2 }
        }
      ]
    }],
    legend: { bottom: 0, textStyle: { color: muted } }
  });
  window.addEventListener('resize', function() { chartPain.resize(); });

  // --- Chart: 变现模式 ---
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    grid: { top: 30, right: 30, bottom: 30, left: 90 },
    xAxis: {
      type: 'value', name: '预期占比 (%)', nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'category',
      data: ['广告合作', '增值服务', '会员体系', '行程交易抽佣', '精准匹配服务'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13 }
    },
    series: [{
      type: 'bar', barWidth: '50%',
      data: [
        { value: 10, itemStyle: { color: muted } },
        { value: 15, itemStyle: { color: accent2 + '99' } },
        { value: 20, itemStyle: { color: accent2 } },
        { value: 25, itemStyle: { color: accent + 'cc' } },
        { value: 30, itemStyle: { color: accent } }
      ],
      label: { show: true, position: 'right', formatter: '{c}%', color: ink, fontSize: 12, fontWeight: 600 },
      itemStyle: { borderRadius: [0, 4, 4, 0] }
    }]
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });

})();