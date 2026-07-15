// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: progress ---
  var chartProgress = echarts.init(document.getElementById('chart-progress'), null, { renderer: 'svg' });
  chartProgress.setOption({
    backgroundColor: 'transparent',
    textStyle: { color: ink, fontFamily: 'ArsenalSC' },
    tooltip: {
      trigger: 'axis',
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      appendToBody: true
    },
    legend: {
      data: ['已实现', '计划中'],
      textStyle: { color: muted },
      top: 0,
      right: 0
    },
    grid: { top: 50, left: 60, right: 30, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['上传/下载', '版本管理', 'MCP 托管', '在线预览', '标签筛选', 'JWT 鉴权', 'Docker 部署', '社区评分', 'Skill 推荐'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, interval: 0, rotate: 30 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, formatter: '{value}%' }
    },
    series: [
      {
        name: '已实现',
        type: 'bar',
        stack: 'total',
        data: [100, 100, 100, 100, 100, 100, 100, 0, 0],
        itemStyle: { color: accent, borderRadius: [0, 0, 0, 0] },
        barWidth: 28
      },
      {
        name: '计划中',
        type: 'bar',
        stack: 'total',
        data: [0, 0, 0, 0, 0, 0, 0, 100, 100],
        itemStyle: { color: accent2 + '88', borderRadius: [4, 4, 0, 0] }
      }
    ],
    animation: false
  });

  window.addEventListener('resize', function() { chartProgress.resize(); });
})();
