// assets/charts.js — ECharts for Creative Furnace (v2 creative glow theme)
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var violet = style.getPropertyValue('--violet').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();

  // === Chart 1: CCI积分贡献对比 ===
  var chartCCI = echarts.init(document.getElementById('chart-cci'), null, { renderer: 'svg' });
  chartCCI.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['林溪（哼唱输入）', '墨白（水墨草图）'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'CCI积分',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      barWidth: '40%',
      data: [
        { value: 187, itemStyle: { color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: accent }, { offset: 1, color: accent + '66' }]
        }, borderRadius: [8, 8, 0, 0], shadowColor: 'rgba(240,168,48,0.4)', shadowBlur: 12 } },
        { value: 142, itemStyle: { color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: accent2 }, { offset: 1, color: accent2 + '66' }]
        }, borderRadius: [8, 8, 0, 0], shadowColor: 'rgba(45,212,191,0.4)', shadowBlur: 12 } }
      ],
      label: {
        show: true,
        position: 'top',
        formatter: '+{c} CCI',
        color: ink,
        fontSize: 13,
        fontWeight: 'bold'
      }
    }]
  });
  window.addEventListener('resize', function() { chartCCI.resize(); });

  // === Chart 2: 四维雷达图 ===
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['传统AI模式', '创意熔炉模式'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 8
    },
    radar: {
      indicator: [
        { name: '智能范式', max: 100 },
        { name: '表征方法', max: 100 },
        { name: '产权与激励', max: 100 },
        { name: '进化路径', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [35, 40, 20, 30],
          name: '传统AI模式',
          lineStyle: { color: muted, width: 2 },
          areaStyle: { color: muted + '33' },
          itemStyle: { color: muted },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [90, 85, 88, 92],
          name: '创意熔炉模式',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: {
            type: 'radial', x: 0.5, y: 0.5, r: 0.5,
            colorStops: [
              { offset: 0, color: 'rgba(240,168,48,0.25)' },
              { offset: 1, color: 'rgba(45,212,191,0.08)' }
            ]
          }},
          itemStyle: { color: accent, shadowColor: 'rgba(240,168,48,0.5)', shadowBlur: 8 },
          symbol: 'circle',
          symbolSize: 8
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // === Chart 3: 行业应用潜力 ===
  var chartIndustry = echarts.init(document.getElementById('chart-industry'), null, { renderer: 'svg' });
  chartIndustry.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      axisPointer: { type: 'shadow' }
    },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['数字艺术', '文学创作', '音乐生成', '教育/心理', 'AI伦理'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, interval: 0 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '应用潜力指数',
      nameTextStyle: { color: muted, fontSize: 11 },
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      barWidth: '38%',
      data: [
        { value: 92, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent }, { offset: 1, color: accent + '44' }] }, borderRadius: [6, 6, 0, 0], shadowColor: 'rgba(240,168,48,0.3)', shadowBlur: 10 } },
        { value: 78, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent2 }, { offset: 1, color: accent2 + '44' }] }, borderRadius: [6, 6, 0, 0], shadowColor: 'rgba(45,212,191,0.3)', shadowBlur: 10 } },
        { value: 85, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: violet }, { offset: 1, color: violet + '44' }] }, borderRadius: [6, 6, 0, 0], shadowColor: 'rgba(168,85,247,0.3)', shadowBlur: 10 } },
        { value: 70, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent + 'cc' }, { offset: 1, color: accent + '33' }] }, borderRadius: [6, 6, 0, 0] } },
        { value: 65, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: muted }, { offset: 1, color: muted + '33' }] }, borderRadius: [6, 6, 0, 0] } }
      ],
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        color: ink,
        fontSize: 12,
        fontWeight: 'bold'
      }
    }]
  });
  window.addEventListener('resize', function() { chartIndustry.resize(); });

  // === Chart 4: 挑战严重度与解决进度 ===
  var chartChallenges = echarts.init(document.getElementById('chart-challenges'), null, { renderer: 'svg' });
  chartChallenges.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['严重度', '当前解决进度'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 8
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['语义歧义', '文化误用风险', '跨平台兼容性', '用户参与门槛'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, interval: 0 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '严重度',
        type: 'bar',
        barWidth: '28%',
        barGap: '20%',
        data: [85, 90, 70, 60],
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent }, { offset: 1, color: accent + '55' }] },
          borderRadius: [4, 4, 0, 0],
          shadowColor: 'rgba(240,168,48,0.3)',
          shadowBlur: 8
        }
      },
      {
        name: '当前解决进度',
        type: 'bar',
        barWidth: '28%',
        data: [45, 30, 25, 40],
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent2 }, { offset: 1, color: accent2 + '55' }] },
          borderRadius: [4, 4, 0, 0],
          shadowColor: 'rgba(45,212,191,0.3)',
          shadowBlur: 8
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartChallenges.resize(); });

})();
