(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Groups ---
  var chart1 = echarts.init(document.getElementById('chart-users'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['游戏玩家', '无障碍用户', '直播创作者', '双手忙碌场景'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '用户规模（亿人）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      name: '用户规模',
      type: 'bar',
      data: [
        { value: 5.2, itemStyle: { color: accent } },
        { value: 1.3, itemStyle: { color: accent2 } },
        { value: 0.8, itemStyle: { color: accent + '99' } },
        { value: 3.5, itemStyle: { color: accent2 + '99' } }
      ],
      barWidth: '50%',
      itemStyle: { borderRadius: [6, 6, 0, 0] },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}亿',
        color: ink,
        fontWeight: 600
      }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: Market Growth ---
  var chart2 = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      data: ['互动娱乐市场', '面部识别市场'],
      textStyle: { color: muted },
      top: 0
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['2022', '2023', '2024', '2025', '2026E', '2027E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '市场规模（亿美元）',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '互动娱乐市场',
        type: 'line',
        data: [1250, 1450, 1650, 1870, 2100, 2400],
        smooth: true,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '30' },
              { offset: 1, color: accent + '05' }
            ]
          }
        }
      },
      {
        name: '面部识别市场',
        type: 'line',
        data: [52, 67, 85, 108, 138, 175],
        smooth: true,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 + '30' },
              { offset: 1, color: accent2 + '05' }
            ]
          }
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
