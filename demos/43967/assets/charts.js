(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Growth Projection ---
  var chartGrowth = echarts.init(document.getElementById('chart-growth'), null, { renderer: 'svg' });
  chartGrowth.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '用户数(万)',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: bg2 } }
    },
    series: [{
      name: '预计用户数',
      type: 'line',
      data: [0.5, 1.2, 2.8, 5.5, 9.0, 14.0, 20.0, 28.0],
      smooth: true,
      lineStyle: { color: accent, width: 3 },
      itemStyle: { color: accent },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: accent + '40' },
            { offset: 1, color: accent + '05' }
          ]
        }
      }
    }]
  });
  window.addEventListener('resize', function() { chartGrowth.resize(); });

  // --- Chart: Pain Point Distribution ---
  var chartPain = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });
  chartPain.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted }
    },
    series: [{
      name: '用户痛点',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: bg2,
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold',
          color: ink
        }
      },
      data: [
        { value: 35, name: '缺乏专业知识', itemStyle: { color: accent } },
        { value: 25, name: '情绪影响决策', itemStyle: { color: accent2 } },
        { value: 20, name: '信息过载', itemStyle: { color: muted } },
        { value: 12, name: '时间不足', itemStyle: { color: accent + '99' } },
        { value: 8, name: '工具复杂', itemStyle: { color: accent2 + '99' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartPain.resize(); });

  // --- Chart: Feature Value Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: '学习效率', max: 100 },
        { name: '决策效率', max: 100 },
        { name: '风险控制', max: 100 },
        { name: '信息获取', max: 100 },
        { name: '情绪管理', max: 100 },
        { name: '收益提升', max: 100 }
      ],
      axisName: { color: muted },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      name: '价值评估',
      type: 'radar',
      data: [
        {
          value: [85, 78, 82, 90, 75, 70],
          name: '使用股神AI后',
          areaStyle: { color: accent + '30' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          value: [30, 35, 25, 40, 20, 30],
          name: '传统方式',
          areaStyle: { color: muted + '20' },
          lineStyle: { color: muted, width: 2 },
          itemStyle: { color: muted }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
