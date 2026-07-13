(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Wine Status Distribution ---
  var chartStatus = echarts.init(document.getElementById('chart-status'), null, { renderer: 'svg' });
  chartStatus.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink } },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted },
      itemWidth: 12,
      itemHeight: 12
    },
    series: [{
      name: '藏酒状态',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      label: { show: true, color: ink, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 9, name: '酒窖中', itemStyle: { color: accent } },
        { value: 3, name: '已开封', itemStyle: { color: accent2 } },
        { value: 2, name: '已饮完', itemStyle: { color: muted } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartStatus.resize(); });

  // --- Chart: Monthly Purchase Trend ---
  var chartPurchase = echarts.init(document.getElementById('chart-purchase'), null, { renderer: 'svg' });
  chartPurchase.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink } },
    legend: {
      data: ['购买数量', '购买金额'],
      top: '2%',
      textStyle: { color: muted }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: [
      {
        type: 'value',
        name: '数量（瓶）',
        nameTextStyle: { color: muted },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted }
      },
      {
        type: 'value',
        name: '金额（元）',
        nameTextStyle: { color: muted },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted }
      }
    ],
    series: [
      {
        name: '购买数量',
        type: 'bar',
        data: [2, 1, 3, 4, 2, 2],
        barWidth: '35%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '44' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '购买金额',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: [1200, 800, 2100, 3500, 1800, 1881],
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 },
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: accent2 + '33' }, { offset: 1, color: accent2 + '05' }]) }
      }
    ]
  });
  window.addEventListener('resize', function() { chartPurchase.resize(); });
})();
