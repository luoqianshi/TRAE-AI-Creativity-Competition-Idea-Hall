(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Test Duration Bar ---
  var chart1 = echarts.init(document.getElementById('chart-duration'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, formatter: '{b}: {c}ms' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['文件头解析', '数据表完整性', '站点名称', 'Excel导出', 'SQLite存储', '技能调度器', '月度统计', '风分析', '重试机制'],
      axisLabel: { color: muted, fontSize: 11, rotate: 20 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '耗时(ms)',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 81, itemStyle: { color: accent } },
        { value: 22, itemStyle: { color: accent } },
        { value: 38, itemStyle: { color: accent } },
        { value: 17, itemStyle: { color: accent2 } },
        { value: 32, itemStyle: { color: accent2 } },
        { value: 0, itemStyle: { color: muted } },
        { value: 1, itemStyle: { color: accent } },
        { value: 0, itemStyle: { color: muted } },
        { value: 0, itemStyle: { color: muted } }
      ],
      barWidth: '55%',
      label: { show: true, position: 'top', color: ink, fontSize: 11, formatter: '{c}' },
      itemStyle: { borderRadius: [4, 4, 0, 0] }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: Issue Levels Pie ---
  var chart2 = echarts.init(document.getElementById('chart-issues'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}项 ({d}%)' },
    legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: muted, fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      label: { show: true, formatter: '{b}\n{c}项', color: ink, fontSize: 12 },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 4, name: 'P0 Bug修复', itemStyle: { color: '#e04e4e' } },
        { value: 4, name: 'P1 功能完善', itemStyle: { color: '#e6a23c' } },
        { value: 4, name: 'P2 代码质量', itemStyle: { color: '#2d8a4e' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
