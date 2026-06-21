// assets/charts.js — ECharts chart logic for 食分准 report
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Radar (竞品对比) ---
  var radarEl = document.getElementById('chart-radar');
  if (radarEl) {
    var radar = echarts.init(radarEl, null, { renderer: 'svg' });
    radar.setOption({
      animation: false,
      tooltip: { appendToBody: true },
      legend: {
        data: ['薄荷健康', '蚂蚁阿福', 'MyFitnessPal', '食分准'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 }
      },
      radar: {
        indicator: [
          { name: '操作便捷性', max: 100 },
          { name: '分量估算', max: 100 },
          { name: '中式菜品覆盖', max: 100 },
          { name: 'AI 建议能力', max: 100 },
          { name: '数据准确性', max: 100 },
          { name: '用户留存率', max: 100 }
        ],
        shape: 'circle',
        splitNumber: 4,
        axisName: { color: ink, fontSize: 11 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [40, 30, 75, 50, 60, 45],
            name: '薄荷健康',
            lineStyle: { color: '#6b7280' },
            areaStyle: { color: 'rgba(107,114,128,0.1)' },
            itemStyle: { color: '#6b7280' }
          },
          {
            value: [60, 20, 50, 10, 40, 50],
            name: '蚂蚁阿福',
            lineStyle: { color: '#8b5cf6' },
            areaStyle: { color: 'rgba(139,92,246,0.1)' },
            itemStyle: { color: '#8b5cf6' }
          },
          {
            value: [35, 30, 30, 40, 55, 40],
            name: 'MyFitnessPal',
            lineStyle: { color: '#3b82f6' },
            areaStyle: { color: 'rgba(59,130,246,0.1)' },
            itemStyle: { color: '#3b82f6' }
          },
          {
            value: [95, 90, 85, 85, 88, 80],
            name: '食分准',
            lineStyle: { color: accent, width: 2.5 },
            areaStyle: { color: 'rgba(234,88,12,0.15)' },
            itemStyle: { color: accent }
          }
        ]
      }]
    });
    window.addEventListener('resize', function() { radar.resize(); });
  }

  // --- Chart: Market Trend (市场规模与渗透率) ---
  var marketEl = document.getElementById('chart-market');
  if (marketEl) {
    var market = echarts.init(marketEl, null, { renderer: 'svg' });
    market.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['市场规模（亿元）', '饮食管理渗透率（%）'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['2020', '2021', '2022', '2023', '2024', '2025E', '2026E'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          name: '规模（亿元）',
          nameTextStyle: { color: muted, fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: rule, type: 'dashed' } },
          axisLabel: { color: muted }
        },
        {
          type: 'value',
          name: '渗透率（%）',
          nameTextStyle: { color: muted, fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { color: muted, formatter: '{value}%' }
        }
      ],
      series: [
        {
          name: '市场规模（亿元）',
          type: 'bar',
          data: [8200, 9800, 11600, 13800, 16200, 18900, 22000],
          barWidth: '35%',
          itemStyle: {
            color: accent,
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: '饮食管理渗透率（%）',
          type: 'line',
          yAxisIndex: 1,
          data: [8.5, 11.2, 14.8, 19.3, 24.6, 30.5, 37.2],
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: accent2, width: 2.5 },
          itemStyle: { color: accent2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(22,163,74,0.2)' },
                { offset: 1, color: 'rgba(22,163,74,0.02)' }
              ]
            }
          }
        }
      ]
    });
    window.addEventListener('resize', function() { market.resize(); });
  }
})();
