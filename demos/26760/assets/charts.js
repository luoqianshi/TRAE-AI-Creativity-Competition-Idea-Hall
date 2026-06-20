(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 知识管理效率对比 ---
  var chart1 = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['传统方式', '知易系统'], textStyle: { color: ink } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['信息检索', '文档整理', '知识共享', '决策支持', '新人培训'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '效率指数',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: bg2 } }
    },
    series: [
      {
        name: '传统方式',
        type: 'bar',
        data: [35, 40, 30, 25, 20],
        itemStyle: { color: muted + '99' },
        barWidth: '30%'
      },
      {
        name: '知易系统',
        type: 'bar',
        data: [92, 88, 85, 90, 87],
        itemStyle: { color: accent },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: 用户痛点分布 ---
  var chart2 = echarts.init(document.getElementById('chart-painpoints'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: bg2, borderWidth: 2 },
      label: { show: true, color: ink },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      data: [
        { value: 35, name: '信息孤岛', itemStyle: { color: accent } },
        { value: 25, name: '检索困难', itemStyle: { color: accent2 } },
        { value: 20, name: '知识流失', itemStyle: { color: muted } },
        { value: 12, name: '协作低效', itemStyle: { color: accent + 'cc' } },
        { value: 8, name: '版本混乱', itemStyle: { color: accent2 + 'cc' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
