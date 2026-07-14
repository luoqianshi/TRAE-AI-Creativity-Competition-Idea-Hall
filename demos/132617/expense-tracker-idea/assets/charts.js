(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Payment Channel Distribution ---
  var chart1 = echarts.init(document.getElementById('chart-payment-channel'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      bottom: '0%',
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: muted, fontSize: 12 }
    },
    color: [accent, accent2, '#3b82f6', '#ef4444', '#8b5cf6', '#10b981'],
    series: [
      {
        name: '支付渠道',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: bg2,
          borderWidth: 3
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: ink,
          fontSize: 13,
          fontWeight: 600
        },
        labelLine: {
          lineStyle: { color: rule },
          smooth: 0.2,
          length: 15,
          length2: 20
        },
        emphasis: {
          label: { show: true, fontSize: 15, fontWeight: 'bold' }
        },
        data: [
          { value: 42, name: '微信支付' },
          { value: 28, name: '支付宝' },
          { value: 12, name: '银行卡' },
          { value: 10, name: '抖音支付' },
          { value: 5, name: '京东支付' },
          { value: 3, name: '其他' }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chart1.resize(); });
})();
