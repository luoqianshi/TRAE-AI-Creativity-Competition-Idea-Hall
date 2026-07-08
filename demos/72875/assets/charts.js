(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Efficiency Comparison ---
  var chartEff = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEff.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['普通工作方式', '番茄工作法'],
      top: 0,
      textStyle: { color: ink }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['任务完成时间', '中途分心次数', '任务准确率', '日有效工作时长'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      name: '相对指数',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '普通工作方式',
        type: 'bar',
        data: [100, 85, 72, 65],
        itemStyle: { color: muted + '66', borderRadius: [6, 6, 0, 0] },
        barWidth: '30%'
      },
      {
        name: '番茄工作法',
        type: 'bar',
        data: [75, 25, 91, 88],
        itemStyle: { color: accent, borderRadius: [6, 6, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartEff.resize(); });

  // --- Chart: Weekly Focus Trend ---
  var chartWeekly = echarts.init(document.getElementById('chart-weekly'), null, { renderer: 'svg' });
  chartWeekly.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true
    },
    legend: {
      data: ['使用前', '使用后'],
      top: 0,
      textStyle: { color: ink }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      name: '专注时长（小时）',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '使用前',
        type: 'line',
        data: [1.5, 2.0, 1.8, 2.2, 1.5, 3.0, 2.5],
        smooth: true,
        lineStyle: { color: muted + '99', width: 3 },
        itemStyle: { color: muted },
        areaStyle: { color: muted + '1a' }
      },
      {
        name: '使用后',
        type: 'line',
        data: [3.5, 4.0, 4.5, 4.2, 3.8, 5.5, 5.0],
        smooth: true,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: { color: accent + '1a' }
      }
    ]
  });
  window.addEventListener('resize', function() { chartWeekly.resize(); });
})();
