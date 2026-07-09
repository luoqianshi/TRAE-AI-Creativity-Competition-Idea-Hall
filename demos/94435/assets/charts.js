(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var el = document.getElementById('chart-routing');
  if (!el || typeof echarts === 'undefined') return;

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
      top: 0,
      textStyle: { color: muted }
    },
    grid: {
      top: 54,
      left: 96,
      right: 28,
      bottom: 42
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: ['AI 直接回答', '快速验证', '深度验证'],
      axisLabel: { color: ink, fontWeight: 600 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [
      {
        name: '响应目标（秒）',
        type: 'bar',
        barWidth: 18,
        data: [2, 30, 90],
        itemStyle: {
          borderRadius: [0, 10, 10, 0],
          color: accent
        },
        label: {
          show: true,
          position: 'right',
          formatter: function(p) {
            return p.value === 2 ? '即时' : p.value + ' 秒';
          },
          color: ink
        }
      },
      {
        name: '专家参与强度（折算）',
        type: 'bar',
        barWidth: 18,
        data: [0, 50, 100],
        itemStyle: {
          borderRadius: [0, 10, 10, 0],
          color: accent2
        },
        label: {
          show: true,
          position: 'right',
          formatter: function(p) {
            return ['0 名专家', '1 名专家', '2 名专家'][p.dataIndex];
          },
          color: ink
        }
      }
    ],
    backgroundColor: bg2
  });

  window.addEventListener('resize', function() {
    chart.resize();
  });
})();
