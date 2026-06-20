(function() {
  var el = document.getElementById('chart-effort');
  if (!el || !window.echarts) return;

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var chart = echarts.init(el, null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    color: [accent, accent2],
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      bottom: 0,
      textStyle: { color: muted }
    },
    grid: {
      left: 20,
      right: 20,
      top: 24,
      bottom: 56,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        color: muted,
        formatter: '{value}%'
      },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: ['接口盘点', '影响分析', '测试准备', '报告整理', '迁移草稿'],
      axisLabel: { color: ink },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [
      {
        name: '人工耗时感知',
        type: 'bar',
        data: [92, 86, 78, 72, 64],
        barWidth: 16,
        itemStyle: {
          color: accent,
          borderRadius: [0, 10, 10, 0]
        }
      },
      {
        name: '适合智能体辅助程度',
        type: 'bar',
        data: [88, 82, 76, 90, 68],
        barWidth: 16,
        itemStyle: {
          color: accent2,
          borderRadius: [0, 10, 10, 0]
        }
      }
    ],
    backgroundColor: bg2
  });

  window.addEventListener('resize', function() {
    chart.resize();
  });
})();
