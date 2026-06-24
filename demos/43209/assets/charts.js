(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 传统APP vs 单词随时记 对比 ---
  var chartComparison = echarts.init(document.getElementById('chart-comparison'), null, { renderer: 'svg' });
  chartComparison.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['传统背单词APP', '单词随时记'],
      bottom: 0,
      textStyle: { color: muted }
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
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '有效学习单词数',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '传统背单词APP',
        type: 'bar',
        data: [12, 8, 15, 5, 10, 20, 18],
        itemStyle: { color: muted + '66', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: '单词随时记',
        type: 'bar',
        data: [28, 32, 30, 35, 33, 40, 38],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartComparison.resize(); });

  // --- Chart: 一天碎片时间分布 ---
  var chartTimeline = echarts.init(document.getElementById('chart-timeline'), null, { renderer: 'svg' });
  chartTimeline.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['7:00', '8:00', '9:00', '12:00', '13:00', '18:00', '19:00', '21:00', '22:00', '23:00'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '碎片时间机会（分钟）',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '碎片时间',
        type: 'line',
        data: [5, 8, 3, 5, 4, 6, 5, 4, 5, 3],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '33' },
              { offset: 1, color: accent + '05' }
            ]
          }
        },
        markPoint: {
          data: [
            { name: '通勤', coord: ['8:00', 8], value: '通勤', itemStyle: { color: accent2 } },
            { name: '午休', coord: ['13:00', 4], value: '午休', itemStyle: { color: accent2 } },
            { name: '睡前', coord: ['22:00', 5], value: '睡前', itemStyle: { color: accent2 } }
          ],
          label: { color: ink, fontSize: 11 }
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartTimeline.resize(); });
})();
