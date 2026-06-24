// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Pet Tech Market Growth ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: '#fff', borderColor: rule, textStyle: { color: ink, fontSize: 13 } },
    legend: { data: ['宠物科技市场（亿美元）', '宠物护理市场（亿美元）'], bottom: 0, textStyle: { color: muted, fontSize: 12 } },
    grid: { top: 30, right: 30, bottom: 50, left: 60 },
    xAxis: { type: 'category', data: ['2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032'], axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted, fontSize: 11 } },
    yAxis: { type: 'value', name: '亿美元', nameTextStyle: { color: muted, fontSize: 11 }, axisLine: { lineStyle: { color: rule } }, splitLine: { lineStyle: { color: rule, type: 'dashed' } }, axisLabel: { color: muted, fontSize: 11 } },
    series: [
      {
        name: '宠物科技市场（亿美元）',
        type: 'bar',
        data: [158, 180, 205, 234, 267, 305, 348, 398, 455],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 36
      },
      {
        name: '宠物护理市场（亿美元）',
        type: 'line',
        data: [2594, 2734, 2913, 3102, 3303, 3518, 3747, 3992, 4278],
        itemStyle: { color: accent2 },
        lineStyle: { width: 2.5 },
        symbol: 'circle',
        symbolSize: 6,
        smooth: true
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart: Competitor Comparison Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true, backgroundColor: '#fff', borderColor: rule, textStyle: { color: ink, fontSize: 13 } },
    legend: { data: ['万籁·灵犀', 'MeowTalk', 'Traini', 'PettiChat'], bottom: 0, textStyle: { color: muted, fontSize: 11 } },
    radar: {
      indicator: [
        { name: '物种覆盖', max: 5 },
        { name: '双向互动', max: 5 },
        { name: '健康预警', max: 5 },
        { name: 'GPS追踪', max: 5 },
        { name: '个性化适配', max: 5 },
        { name: '多模态融合', max: 5 }
      ],
      shape: 'circle',
      splitNumber: 5,
      axisName: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        { value: [5, 5, 5, 5, 5, 4], name: '万籁·灵犀', lineStyle: { color: accent, width: 2 }, areaStyle: { color: accent + '33' }, itemStyle: { color: accent } },
        { value: [1, 1, 1, 0, 2, 1], name: 'MeowTalk', lineStyle: { color: '#888', width: 1.5 }, areaStyle: { color: '#888222' }, itemStyle: { color: '#888' } },
        { value: [1, 3, 2, 3, 2, 3], name: 'Traini', lineStyle: { color: accent2, width: 1.5 }, areaStyle: { color: accent2 + '22' }, itemStyle: { color: accent2 } },
        { value: [2, 4, 1, 3, 2, 3], name: 'PettiChat', lineStyle: { color: '#e8a838', width: 1.5 }, areaStyle: { color: '#e8a83822' }, itemStyle: { color: '#e8a838' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: Revenue Model ---
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, backgroundColor: '#fff', borderColor: rule, textStyle: { color: ink, fontSize: 13 } },
    legend: { bottom: 0, textStyle: { color: muted, fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, color: ink, fontSize: 12, formatter: '{b}\n{d}%' },
      data: [
        { value: 55, name: '订阅收入', itemStyle: { color: accent } },
        { value: 20, name: 'AI训练服务', itemStyle: { color: accent2 } },
        { value: 15, name: '硬件销售', itemStyle: { color: '#e8a838' } },
        { value: 10, name: '商品推荐佣金', itemStyle: { color: muted } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });
})();
