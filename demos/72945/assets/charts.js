// assets/charts.js
(function () {
  if (typeof echarts === 'undefined') return;

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();

  function initCompare() {
    var el = document.getElementById('chart-compare');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    var option = {
      animation: false,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
      legend: { data: ['连续定位导航', '分段到点确认'], textStyle: { color: muted } },
      grid: { left: 30, right: 20, top: 55, bottom: 30, containLabel: true },
      xAxis: {
        type: 'category',
        data: ['走错风险', '部署成本', '弱网可用', '无障碍友好'],
        axisLabel: { color: muted },
        axisLine: { lineStyle: { color: rule } }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 10,
        axisLabel: { color: muted },
        splitLine: { lineStyle: { color: rule } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [
        {
          name: '连续定位导航',
          type: 'bar',
          data: [7, 8, 3, 4],
          itemStyle: { color: accent2 }
        },
        {
          name: '分段到点确认',
          type: 'bar',
          data: [3, 5, 9, 8],
          itemStyle: { color: accent }
        }
      ]
    };

    chart.setOption(option);
    window.addEventListener('resize', function () { chart.resize(); });
  }

  initCompare();
})();

