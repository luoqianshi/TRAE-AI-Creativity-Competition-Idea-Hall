(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();

  // --- Chart: Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      backgroundColor: bg3,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['传统人工巡检', '机器狗自主巡检'],
      bottom: 10,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 8
    },
    radar: {
      indicator: [
        { name: '巡检频率', max: 100 },
        { name: '覆盖范围', max: 100 },
        { name: '安全等级', max: 100 },
        { name: '数据准确度', max: 100 },
        { name: '响应速度', max: 100 },
        { name: '成本效益', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: muted,
        fontSize: 11
      },
      splitLine: {
        lineStyle: { color: rule }
      },
      splitArea: {
        show: false
      },
      axisLine: {
        lineStyle: { color: rule }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [30, 35, 20, 50, 25, 30],
          name: '传统人工巡检',
          lineStyle: { color: '#ef4444', width: 2 },
          areaStyle: { color: 'rgba(239,68,68,0.15)' },
          itemStyle: { color: '#ef4444' },
          symbol: 'circle',
          symbolSize: 5
        },
        {
          value: [95, 98, 100, 95, 98, 90],
          name: '机器狗自主巡检',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: 'rgba(6,214,160,0.15)' },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 5
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: Cost Comparison ---
  var chartCost = echarts.init(document.getElementById('chart-cost'), null, { renderer: 'svg' });
  chartCost.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      trigger: 'axis',
      backgroundColor: bg3,
      borderColor: rule,
      textStyle: { color: ink },
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['传统人工巡检', '机器狗自主巡检'],
      bottom: 10,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 8
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['第1年', '第2年', '第3年', '第4年', '第5年'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '万元',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    series: [
      {
        name: '传统人工巡检',
        type: 'bar',
        barWidth: '28%',
        itemStyle: {
          color: '#ef4444',
          borderRadius: [4, 4, 0, 0]
        },
        data: [120, 125, 130, 138, 145]
      },
      {
        name: '机器狗自主巡检',
        type: 'bar',
        barWidth: '28%',
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        data: [180, 60, 55, 50, 48]
      }
    ]
  });
  window.addEventListener('resize', function() { chartCost.resize(); });
})();
