(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: bg2,
        primaryTextColor: ink,
        primaryBorderColor: rule,
        lineColor: accent,
        secondaryColor: bg2,
        tertiaryColor: bg2
      }
    });
  }

  var el = document.getElementById('chart-time');
  if (!el || !window.echarts) return;

  var chart = echarts.init(el, null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    color: [accent, accent2],
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        var item = params[0];
        return item.name + '<br/>' + item.marker + item.value + ' 分钟';
      }
    },
    grid: { left: 80, right: 24, top: 24, bottom: 42 },
    xAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: ['手抄整理', 'AI拍照录入'],
      axisLabel: { color: ink, fontWeight: 600 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 12, itemStyle: { color: accent2 } },
        { value: 0.5, itemStyle: { color: accent } }
      ],
      barWidth: 34,
      label: {
        show: true,
        position: 'right',
        color: ink,
        formatter: function(p) {
          return p.value + ' 分钟';
        }
      }
    }]
  });
  window.addEventListener('resize', function() { chart.resize(); });
})();
