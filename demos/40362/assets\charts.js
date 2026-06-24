(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Pricing Comparison ---
  var chartPricing = echarts.init(document.getElementById('chart-pricing'), null, { renderer: 'svg' });
  chartPricing.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        var p = params[0];
        return p.name + '<br/>月均费用: ¥' + p.value;
      }
    },
    grid: {
      left: '12%',
      right: '8%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: ['小营养师AI', '薄荷健康', '小卡健康', 'Elavatine'],
      axisLabel: { color: muted, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '月均费用 (¥)',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11, formatter: '¥{value}' },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 6.9, itemStyle: { color: accent } },
        { value: 30, itemStyle: { color: muted + '66' } },
        { value: 24.8, itemStyle: { color: muted + '66' } },
        { value: 30.4, itemStyle: { color: muted + '66' } }
      ],
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        formatter: '¥{c}',
        color: ink,
        fontSize: 13,
        fontWeight: 'bold'
      },
      itemStyle: {
        borderRadius: [6, 6, 0, 0]
      }
    }]
  });
  window.addEventListener('resize', function() { chartPricing.resize(); });
})();
