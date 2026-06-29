// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 目标用户群体规模估算 ---
  var chart1 = echarts.init(document.getElementById('chart-user-groups'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['通勤上班族', '旅行游客', '带娃家长/孕妇/老人', '外卖骑手/快递员', '肠胃敏感人群'],
      axisLabel: { color: muted, fontSize: 11, rotate: 15 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '亿人',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: [3.2, 2.5, 1.8, 0.9, 1.5],
      itemStyle: {
        color: accent,
        borderRadius: [6, 6, 0, 0]
      },
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        color: ink,
        fontSize: 12,
        fontWeight: 700,
        formatter: '{c}'
      }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: 找厕所平均耗时对比 ---
  var chart2 = echarts.init(document.getElementById('chart-time-compare'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      data: ['传统方式', '使用急所'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 10
    },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['步行街', '商场', '景区', '陌生街道', '公园'],
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
      max: 12
    },
    series: [
      {
        name: '传统方式',
        type: 'bar',
        data: [8, 6, 10, 11, 7],
        itemStyle: {
          color: accent2,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%'
      },
      {
        name: '使用急所',
        type: 'bar',
        data: [0.5, 0.3, 0.5, 0.8, 0.4],
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%'
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
