(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Potential ---
  var chartPotential = echarts.init(document.getElementById('chart-potential'), null, { renderer: 'svg' });
  chartPotential.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['闲置手机数量', '可转化机器人数量'],
      textStyle: { color: muted },
      bottom: 0
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
      data: ['2024', '2025', '2026', '2027', '2028'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '数量（百万部）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, opacity: 0.3 } }
    },
    series: [
      {
        name: '闲置手机数量',
        type: 'bar',
        data: [850, 920, 1000, 1080, 1150],
        itemStyle: { color: accent + '66' },
        barWidth: '30%'
      },
      {
        name: '可转化机器人数量',
        type: 'bar',
        data: [8.5, 18, 30, 45, 65],
        itemStyle: { color: accent },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartPotential.resize(); });

  // --- Chart: Architecture ---
  var chartArch = echarts.init(document.getElementById('chart-arch'), null, { renderer: 'svg' });
  chartArch.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: { focus: 'adjacency' },
        data: [
          { name: '旧手机（大脑）', itemStyle: { color: accent } },
          { name: '算力', itemStyle: { color: accent + 'cc' } },
          { name: '感知', itemStyle: { color: accent + 'cc' } },
          { name: '通信', itemStyle: { color: accent + 'cc' } },
          { name: '通用接口', itemStyle: { color: muted } },
          { name: '轮式底盘', itemStyle: { color: accent2 } },
          { name: '机械臂', itemStyle: { color: accent2 } },
          { name: '情绪底座', itemStyle: { color: accent2 } },
          { name: '自主巡逻', itemStyle: { color: ink } },
          { name: '桌面辅助', itemStyle: { color: ink } },
          { name: '情绪陪伴', itemStyle: { color: ink } }
        ],
        links: [
          { source: '旧手机（大脑）', target: '算力', value: 10 },
          { source: '旧手机（大脑）', target: '感知', value: 10 },
          { source: '旧手机（大脑）', target: '通信', value: 10 },
          { source: '算力', target: '通用接口', value: 10 },
          { source: '感知', target: '通用接口', value: 10 },
          { source: '通信', target: '通用接口', value: 10 },
          { source: '通用接口', target: '轮式底盘', value: 10 },
          { source: '通用接口', target: '机械臂', value: 10 },
          { source: '通用接口', target: '情绪底座', value: 10 },
          { source: '轮式底盘', target: '自主巡逻', value: 10 },
          { source: '机械臂', target: '桌面辅助', value: 10 },
          { source: '情绪底座', target: '情绪陪伴', value: 10 }
        ],
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.4
        },
        label: {
          color: ink,
          fontSize: 12
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartArch.resize(); });
})();
