// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Time Comparison ---
  var chartTime = echarts.init(document.getElementById('chart-time'), null, { renderer: 'svg' });
  chartTime.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['传统人工', '通用AI', '标标必达'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      left: '3%', right: '4%', bottom: '15%', top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['文件解析', '大纲生成', '资质匹配', '方案撰写', '偏离表核对', '排版校对'],
      axisLabel: { color: muted, fontSize: 11, rotate: 20 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '小时',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统人工',
        type: 'bar',
        barWidth: '18%',
        itemStyle: { color: muted + '99', borderRadius: [4, 4, 0, 0] },
        data: [8, 6, 10, 24, 8, 6]
      },
      {
        name: '通用AI',
        type: 'bar',
        barWidth: '18%',
        itemStyle: { color: rule, borderRadius: [4, 4, 0, 0] },
        data: [4, 3, 6, 12, 5, 4]
      },
      {
        name: '标标必达',
        type: 'bar',
        barWidth: '18%',
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        data: [0.3, 0.2, 0.5, 1.2, 0.3, 0.5]
      }
    ]
  });
  window.addEventListener('resize', function() { chartTime.resize(); });

  // --- Chart: Risk Factors ---
  var chartRisk = echarts.init(document.getElementById('chart-risk'), null, { renderer: 'svg' });
  chartRisk.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted, fontSize: 12 },
      itemGap: 12
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#ffffff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 11,
          color: ink
        },
        labelLine: {
          lineStyle: { color: rule }
        },
        data: [
          { value: 28, name: '条款响应遗漏', itemStyle: { color: accent } },
          { value: 22, name: '格式不规范', itemStyle: { color: accent2 } },
          { value: 18, name: '资质资料缺失', itemStyle: { color: '#3b82f6' } },
          { value: 15, name: '技术参数偏离', itemStyle: { color: '#8b5cf6' } },
          { value: 10, name: '评分点未覆盖', itemStyle: { color: '#06b6d4' } },
          { value: 7, name: '其他', itemStyle: { color: muted } }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartRisk.resize(); });
})();
