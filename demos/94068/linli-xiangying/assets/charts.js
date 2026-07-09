(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var el = document.getElementById('chart-value');
  if (!el || !window.echarts) return;

  var chart = echarts.init(el, null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    color: [accent2, accent],
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      top: 0,
      textStyle: { color: muted }
    },
    grid: {
      left: 8,
      right: 12,
      top: 52,
      bottom: 8,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 5,
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: ['响应速度', '信息清晰度', '安全可追踪', '资源复用', '社区运营洞察'],
      axisLabel: { color: ink },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [
      {
        name: '传统微信群互助',
        type: 'bar',
        data: [2.2, 2.4, 1.8, 1.6, 1.4],
        itemStyle: { borderRadius: [0, 8, 8, 0] },
        label: { show: true, position: 'right', color: muted }
      },
      {
        name: '邻里响应',
        type: 'bar',
        data: [4.4, 4.3, 4.1, 3.9, 4.2],
        itemStyle: { borderRadius: [0, 8, 8, 0] },
        label: { show: true, position: 'right', color: ink }
      }
    ],
    backgroundColor: bg2
  });

  window.addEventListener('resize', function () {
    chart.resize();
  });
})();
