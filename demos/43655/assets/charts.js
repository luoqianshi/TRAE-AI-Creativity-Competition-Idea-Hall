// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var accent4 = style.getPropertyValue('--accent4').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: 备考效率对比 ---
  var chart1 = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true
    },
    legend: {
      data: ['知途AI备考', '传统备考'],
      bottom: 0,
      textStyle: { color: ink }
    },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['计划制定', '薄弱点定位', '每日刷题', '错题整理', '进度追踪', '策略调整'],
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '效率评分 (满分100)',
      max: 100,
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '知途AI备考',
        type: 'bar',
        data: [95, 92, 88, 90, 93, 91],
        itemStyle: {
          color: accent,
          borderRadius: [6, 6, 0, 0]
        },
        barWidth: '35%'
      },
      {
        name: '传统备考',
        type: 'bar',
        data: [35, 28, 65, 22, 40, 30],
        itemStyle: {
          color: muted,
          borderRadius: [6, 6, 0, 0]
        },
        barWidth: '35%'
      }
    ]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: 知识薄弱点攻克率对比 ---
  var chart2 = echarts.init(document.getElementById('chart-mastery'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true
    },
    legend: {
      data: ['知途AI备考', '传统备考'],
      bottom: 0,
      textStyle: { color: ink }
    },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周'],
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '薄弱点攻克率 (%)',
      max: 100,
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '知途AI备考',
        type: 'line',
        data: [15, 32, 48, 65, 78, 88],
        smooth: true,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent + '33' },
            { offset: 1, color: accent + '05' }
          ])
        },
        symbol: 'circle',
        symbolSize: 8
      },
      {
        name: '传统备考',
        type: 'line',
        data: [8, 18, 25, 35, 42, 50],
        smooth: true,
        lineStyle: { color: muted, width: 2, type: 'dashed' },
        itemStyle: { color: muted },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: muted + '22' },
            { offset: 1, color: muted + '03' }
          ])
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });

  // --- Chart 3: 时间投入分布对比 ---
  var chart3 = echarts.init(document.getElementById('chart-time'), null, { renderer: 'svg' });
  chart3.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['规划时间', '有效学习', '错题整理', '重复劳动', '查找资料'],
      bottom: 0,
      textStyle: { color: ink }
    },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['知途AI备考', '传统备考'],
      axisLabel: { color: ink, fontSize: 12, fontWeight: 'bold' },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '时间占比 (%)',
      max: 100,
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '规划时间',
        type: 'bar',
        stack: 'total',
        data: [5, 25],
        itemStyle: { color: accent },
        barWidth: '50%'
      },
      {
        name: '有效学习',
        type: 'bar',
        stack: 'total',
        data: [75, 35],
        itemStyle: { color: accent4 },
        barWidth: '50%'
      },
      {
        name: '错题整理',
        type: 'bar',
        stack: 'total',
        data: [8, 15],
        itemStyle: { color: accent2 },
        barWidth: '50%'
      },
      {
        name: '重复劳动',
        type: 'bar',
        stack: 'total',
        data: [5, 15],
        itemStyle: { color: accent3 },
        barWidth: '50%'
      },
      {
        name: '查找资料',
        type: 'bar',
        stack: 'total',
        data: [7, 10],
        itemStyle: { color: muted },
        barWidth: '50%'
      }
    ]
  });
  window.addEventListener('resize', function() { chart3.resize(); });
})();