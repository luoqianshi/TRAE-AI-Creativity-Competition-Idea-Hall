(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Sales Funnel ---
  var chartFunnel = echarts.init(document.getElementById('chart-funnel'), null, { renderer: 'svg' });
  chartFunnel.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}%' },
    series: [{
      type: 'funnel',
      left: '10%',
      top: 10,
      bottom: 10,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '20%',
      maxSize: '100%',
      sort: 'descending',
      gap: 4,
      label: { show: true, position: 'inside', color: '#fff', fontSize: 13, fontWeight: 600 },
      itemStyle: { borderWidth: 0 },
      data: [
        { value: 100, name: '新线索', itemStyle: { color: accent } },
        { value: 72, name: '已加微信', itemStyle: { color: accent + 'dd' } },
        { value: 55, name: '需求沟通', itemStyle: { color: accent + 'bb' } },
        { value: 40, name: '约看样板', itemStyle: { color: accent2 } },
        { value: 28, name: '看方案', itemStyle: { color: accent2 + 'dd' } },
        { value: 18, name: '定金已收', itemStyle: { color: '#E8A87C' } },
        { value: 12, name: '方案完善', itemStyle: { color: '#D4956B' } },
        { value: 10, name: '再看方案', itemStyle: { color: '#C08555' } },
        { value: 8, name: '已签约', itemStyle: { color: '#A87045' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartFunnel.resize(); });

  // --- Chart: Pain Points Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: '客户跟进遗漏', max: 100 },
        { name: '工期拖延', max: 100 },
        { name: '报价混乱', max: 100 },
        { name: '信息孤岛', max: 100 },
        { name: '材料管理失控', max: 100 },
        { name: '收款遗漏', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 12 },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [92, 85, 78, 95, 70, 75],
        name: '行业痛点严重度',
        areaStyle: { color: accent + '33' },
        lineStyle: { color: accent },
        itemStyle: { color: accent },
        symbol: 'circle',
        symbolSize: 6
      }]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: Efficiency Improvement Bar ---
  var chartBar = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartBar.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: 100, right: 40, top: 20, bottom: 30 },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%', color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: ['客户流失降低', '工期缩短', '信息查找效率', '报价准确率', '收款及时率'],
      axisLabel: { color: ink, fontSize: 13 },
      axisLine: { show: false }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 45, itemStyle: { color: accent } },
        { value: 35, itemStyle: { color: accent2 } },
        { value: 80, itemStyle: { color: accent + 'cc' } },
        { value: 60, itemStyle: { color: accent2 + 'cc' } },
        { value: 50, itemStyle: { color: '#E8A87C' } }
      ],
      barWidth: 28,
      label: { show: true, position: 'right', formatter: '{c}%', color: ink, fontWeight: 600 }
    }]
  });
  window.addEventListener('resize', function() { chartBar.resize(); });

})();
