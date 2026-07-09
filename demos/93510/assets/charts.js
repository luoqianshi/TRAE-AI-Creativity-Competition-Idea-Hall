(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Global AI Nutrition Market Size ---
  var chartMarket = echarts.init(document.getElementById('chart-market-size'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['AI个性化营养平台', 'AI生成膳食计划'],
      bottom: 0,
      textStyle: { color: muted }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '亿美元',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: 'AI个性化营养平台',
        type: 'bar',
        data: [14, 18, 23, 29, 37, 47, 59, 76, null],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: 'AI生成膳食计划',
        type: 'bar',
        data: [13.4, 15.9, 18.9, 22.5, 26.8, 31.9, null, null, 53.7],
        itemStyle: { color: accent2, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart: Tech Architecture (Sankey) ---
  var chartTech = echarts.init(document.getElementById('chart-tech-arch'), null, { renderer: 'svg' });
  chartTech.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: function(params) {
        return params.name;
      }
    },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      nodeAlign: 'left',
      data: [
        { name: '用户输入', itemStyle: { color: accent } },
        { name: 'AI视觉识别引擎', itemStyle: { color: accent2 } },
        { name: '个性化控糖模型', itemStyle: { color: accent2 } },
        { name: '血糖趋势预测', itemStyle: { color: accent2 } },
        { name: '智能健康陪伴', itemStyle: { color: accent2 } },
        { name: '食物营养数据库', itemStyle: { color: muted } },
        { name: '用户健康档案', itemStyle: { color: muted } },
        { name: '饮食分析报告', itemStyle: { color: '#F59E0B' } },
        { name: '个性化建议', itemStyle: { color: '#F59E0B' } },
        { name: '血糖变化预测', itemStyle: { color: '#F59E0B' } },
        { name: 'AI对话陪伴', itemStyle: { color: '#F59E0B' } }
      ],
      links: [
        { source: '用户输入', target: 'AI视觉识别引擎', value: 3 },
        { source: '用户输入', target: '个性化控糖模型', value: 2 },
        { source: '用户输入', target: '智能健康陪伴', value: 2 },
        { source: '食物营养数据库', target: 'AI视觉识别引擎', value: 3 },
        { source: '用户健康档案', target: '个性化控糖模型', value: 2 },
        { source: '用户健康档案', target: '血糖趋势预测', value: 2 },
        { source: 'AI视觉识别引擎', target: '饮食分析报告', value: 3 },
        { source: '个性化控糖模型', target: '个性化建议', value: 2 },
        { source: '血糖趋势预测', target: '血糖变化预测', value: 2 },
        { source: '智能健康陪伴', target: 'AI对话陪伴', value: 2 },
        { source: '个性化控糖模型', target: '血糖趋势预测', value: 1 }
      ],
      lineStyle: {
        color: 'source',
        curveness: 0.5,
        opacity: 0.4
      },
      label: {
        color: ink,
        fontSize: 12,
        fontFamily: 'WorkSans, "PingFang SC", "Microsoft YaHei", sans-serif'
      }
    }]
  });
  window.addEventListener('resize', function() { chartTech.resize(); });

  // --- Chart: Revenue Structure (Pie) ---
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted }
    },
    series: [{
      name: '收入结构',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: bg2,
        borderWidth: 3
      },
      label: {
        show: true,
        formatter: '{b}\n{c}%',
        color: ink,
        fontSize: 12
      },
      labelLine: {
        lineStyle: { color: rule }
      },
      data: [
        { value: 45, name: 'C端会员订阅', itemStyle: { color: accent } },
        { value: 25, name: '医疗机构合作', itemStyle: { color: accent2 } },
        { value: 18, name: '健康食品推荐', itemStyle: { color: '#34D399' } },
        { value: 12, name: '保险合作分成', itemStyle: { color: '#6EE7B7' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });

})();
