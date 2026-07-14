// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Time Saving (Before vs After) ---
  var chartTime = echarts.init(document.getElementById('chart-time-saving'), null, { renderer: 'svg' });
  chartTime.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['使用前', '使用后'],
      top: 10,
      textStyle: { color: muted, fontSize: 13 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 60,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['选衣决策', '衣物录入', '换季整理', '旅行打包'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '使用前',
        type: 'bar',
        barWidth: '30%',
        itemStyle: {
          color: muted,
          borderRadius: [4, 4, 0, 0]
        },
        data: [18, 5, 120, 45]
      },
      {
        name: '使用后',
        type: 'bar',
        barWidth: '30%',
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        data: [1, 0.05, 15, 5]
      }
    ]
  });
  window.addEventListener('resize', function() { chartTime.resize(); });

  // --- Chart: Repetitive Purchase Reduction Trend ---
  var chartRepeat = echarts.init(document.getElementById('chart-repeat-purchase'), null, { renderer: 'svg' });
  chartRepeat.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true
    },
    legend: {
      data: ['重复购买率'],
      top: 10,
      textStyle: { color: muted, fontSize: 13 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 60,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['第 1 月', '第 2 月', '第 3 月', '第 4 月', '第 5 月', '第 6 月'],
      boundaryGap: false,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '重复购买率 (%)',
      nameTextStyle: { color: muted, fontSize: 12 },
      min: 0,
      max: 45,
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 12, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '重复购买率',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent, borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent + '40' },
            { offset: 1, color: accent + '05' }
          ])
        },
        data: [38, 32, 25, 20, 17, 15]
      }
    ]
  });
  window.addEventListener('resize', function() { chartRepeat.resize(); });
})();
