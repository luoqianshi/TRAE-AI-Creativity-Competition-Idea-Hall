// ForgeClaw 创意提案 - 图表逻辑
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ---------- 图1：四种计费模式相对成本对比 ----------
  var costEl = document.getElementById('chart-cost');
  if (costEl) {
    var costChart = echarts.init(costEl, null, { renderer: 'svg' });
    costChart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true,
        formatter: function (p) { return p[0].name + '<br/>相对成本指数: <b>' + p[0].value + '</b>'; } },
      grid: { left: 8, right: 24, top: 40, bottom: 10, containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Token·无缓存', '按调用次数', '按提示词次数', 'Token·有缓存'],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: muted, fontSize: 12, interval: 0, rotate: 0 }
      },
      yAxis: {
        type: 'value', max: 105,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 12 }
      },
      series: [{
        type: 'bar',
        data: [
          { value: 100, itemStyle: { color: accent2 } },
          { value: 80, itemStyle: { color: accent2 + 'cc' } },
          { value: 65, itemStyle: { color: accent + '99' } },
          { value: 15, itemStyle: { color: accent } }
        ],
        barWidth: '46%',
        label: { show: true, position: 'top', color: ink, fontWeight: 600, fontSize: 13 },
        itemStyle: { borderRadius: [6, 6, 0, 0] }
      }]
    });
    window.addEventListener('resize', function () { costChart.resize(); });
  }

  // ---------- 图2：能力维度雷达对比 ----------
  var radarEl = document.getElementById('chart-radar');
  if (radarEl) {
    var radarChart = echarts.init(radarEl, null, { renderer: 'svg' });
    radarChart.setOption({
      animation: false,
      tooltip: { appendToBody: true },
      legend: {
        data: ['ForgeClaw', 'OpenHands', 'Cursor'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 },
        itemWidth: 14, itemHeight: 8
      },
      radar: {
        indicator: [
          { name: '成本优化', max: 10 },
          { name: '安全性', max: 10 },
          { name: '扩展性', max: 10 },
          { name: '上下文灵活度', max: 10 },
          { name: '安装便捷度', max: 10 },
          { name: '多智能体', max: 10 }
        ],
        center: ['50%', '48%'],
        radius: '62%',
        axisName: { color: ink, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: ['transparent', bg2] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          { value: [9, 9, 9, 10, 9, 9], name: 'ForgeClaw',
            itemStyle: { color: accent }, areaStyle: { color: accent + '22' }, lineStyle: { width: 2 } },
          { value: [6, 7, 8, 6, 6, 8], name: 'OpenHands',
            itemStyle: { color: accent2 }, areaStyle: { color: accent2 + '18' }, lineStyle: { width: 1.5 } },
          { value: [5, 6, 5, 7, 8, 4], name: 'Cursor',
            itemStyle: { color: muted }, areaStyle: { color: muted + '18' }, lineStyle: { width: 1.5, type: 'dashed' } }
        ]
      }]
    });
    window.addEventListener('resize', function () { radarChart.resize(); });
  }
})();
