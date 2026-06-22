(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: 游戏化机制效果 ---
  var chart1 = echarts.init(document.getElementById('chart-gamification'), null, { renderer: 'svg' });
  chart1.setOption({
    tooltip: { trigger: 'axis', appendToBody: true },
    animation: false,
    grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['积分系统', '徽章成就', '排行榜', '连胜机制', '任务闯关', '社交竞争'],
      axisLabel: { color: ink, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '提升幅度 (%)',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 30, itemStyle: { color: accent + '99' } },
        { value: 63, itemStyle: { color: accent } },
        { value: 40, itemStyle: { color: accent + '99' } },
        { value: 52, itemStyle: { color: accent } },
        { value: 52, itemStyle: { color: accent } },
        { value: 40, itemStyle: { color: accent + '99' } }
      ],
      barWidth: '50%',
      label: { show: true, position: 'top', color: ink, fontSize: 12, formatter: '{c}%' }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: 功能价值分布 ---
  var chart2 = echarts.init(document.getElementById('chart-value'), null, { renderer: 'svg' });
  chart2.setOption({
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}%' },
    animation: false,
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '50%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
      label: { color: ink, fontSize: 12, formatter: '{b}\n{d}%' },
      emphasis: { label: { fontSize: 16, fontWeight: 'bold' } },
      data: [
        { value: 30, name: 'AI赋能', itemStyle: { color: accent } },
        { value: 25, name: '核心记录', itemStyle: { color: accent + 'cc' } },
        { value: 20, name: '家庭协作', itemStyle: { color: accent2 } },
        { value: 15, name: '社交娱乐', itemStyle: { color: accent2 + 'cc' } },
        { value: 10, name: '健康管理', itemStyle: { color: accent + '66' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });

  // --- Chart 3: 竞品雷达对比 ---
  var chart3 = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chart3.setOption({
    tooltip: { appendToBody: true },
    animation: false,
    legend: {
      data: ['下厨房', 'Noms', 'Fooday', '食友记', '味记(目标)'],
      bottom: 0,
      textStyle: { color: ink, fontSize: 11 }
    },
    radar: {
      center: ['50%', '50%'],
      radius: '65%',
      indicator: [
        { name: 'AI能力', max: 100 },
        { name: '家庭场景', max: 100 },
        { name: '游戏化', max: 100 },
        { name: '记录便捷', max: 100 },
        { name: '社交裂变', max: 100 },
        { name: '内容创作', max: 100 }
      ],
      axisName: { color: ink, fontSize: 11 }
    },
    series: [{
      type: 'radar',
      data: [
        { value: [70, 20, 40, 60, 30, 50], name: '下厨房', lineStyle: { color: muted }, areaStyle: { color: muted + '33' }, itemStyle: { color: muted } },
        { value: [85, 30, 70, 80, 50, 60], name: 'Noms', lineStyle: { color: accent2 }, areaStyle: { color: accent2 + '33' }, itemStyle: { color: accent2 } },
        { value: [80, 25, 75, 65, 55, 40], name: 'Fooday', lineStyle: { color: accent2 + '99' }, areaStyle: { color: accent2 + '22' }, itemStyle: { color: accent2 + '99' } },
        { value: [90, 20, 80, 70, 45, 30], name: '食友记', lineStyle: { color: accent + '99' }, areaStyle: { color: accent + '22' }, itemStyle: { color: accent + '99' } },
        { value: [95, 95, 85, 95, 70, 75], name: '味记(目标)', lineStyle: { color: accent, width: 2 }, areaStyle: { color: accent + '44' }, itemStyle: { color: accent } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart3.resize(); });
})();