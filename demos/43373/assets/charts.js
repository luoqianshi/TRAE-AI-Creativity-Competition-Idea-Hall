(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Survey ---
  var chartSurvey = echarts.init(document.getElementById('chart-survey'), null, { renderer: 'svg' });
  chartSurvey.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink } },
    legend: { bottom: 0, textStyle: { color: muted } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: bg2, borderWidth: 2 },
      label: { show: true, color: ink, formatter: '{b}\n{d}%' },
      data: [
        { value: 58, name: '从不记账', itemStyle: { color: accent } },
        { value: 28, name: '偶尔手动记账', itemStyle: { color: accent2 } },
        { value: 10, name: '坚持手动记账', itemStyle: { color: muted } },
        { value: 4, name: '使用自动记账', itemStyle: { color: rule } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartSurvey.resize(); });

  // --- Chart: Value Model ---
  var chartValue = echarts.init(document.getElementById('chart-value'), null, { renderer: 'svg' });
  chartValue.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink } },
    radar: {
      indicator: [
        { name: '效率提升', max: 100 },
        { name: '用户体验', max: 100 },
        { name: '数据安全', max: 100 },
        { name: '商业潜力', max: 100 },
        { name: '社会价值', max: 100 },
        { name: '技术可行性', max: 100 }
      ],
      axisName: { color: muted },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [95, 90, 88, 85, 80, 92],
        name: '智账评分',
        areaStyle: { color: accent + '33' },
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent }
      }]
    }]
  });
  window.addEventListener('resize', function() { chartValue.resize(); });

  // --- Chart: Spending Structure ---
  var chartSpending = echarts.init(document.getElementById('chart-spending'), null, { renderer: 'svg' });
  chartSpending.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink } },
    legend: { bottom: 0, textStyle: { color: muted } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['餐饮', '交通', '购物', '娱乐', '居住', '医疗', '教育', '其他'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 3200, itemStyle: { color: accent } },
        { value: 1200, itemStyle: { color: accent2 } },
        { value: 2800, itemStyle: { color: accent + 'cc' } },
        { value: 900, itemStyle: { color: accent2 + 'cc' } },
        { value: 3500, itemStyle: { color: muted } },
        { value: 400, itemStyle: { color: rule } },
        { value: 600, itemStyle: { color: accent + '99' } },
        { value: 500, itemStyle: { color: accent2 + '99' } }
      ],
      barWidth: '50%',
      itemStyle: { borderRadius: [6, 6, 0, 0] }
    }]
  });
  window.addEventListener('resize', function() { chartSpending.resize(); });
})();
