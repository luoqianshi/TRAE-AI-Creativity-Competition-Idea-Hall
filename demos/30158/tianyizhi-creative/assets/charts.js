(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Timeline ---
  var chartTimeline = echarts.init(document.getElementById('chart-timeline'), null, { renderer: 'svg' });
  chartTimeline.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['先秦', '秦汉', '魏晋', '隋唐', '宋元', '明清', '民国', '1950s', '1970s', '1990s', '2010s', '2020s'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '收录事件数',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '古籍志异',
        type: 'bar',
        data: [45, 82, 156, 203, 278, 312, 89, 0, 0, 0, 0, 0],
        itemStyle: { color: accent },
        barWidth: '35%'
      },
      {
        name: '现代目击',
        type: 'bar',
        data: [0, 0, 0, 0, 0, 0, 12, 34, 67, 128, 245, 189],
        itemStyle: { color: accent2 },
        barWidth: '35%'
      }
    ],
    legend: {
      data: ['古籍志异', '现代目击'],
      textStyle: { color: muted },
      bottom: 0
    }
  });
  window.addEventListener('resize', function() { chartTimeline.resize(); });

  // --- Chart: Category Distribution ---
  var chartCategory = echarts.init(document.getElementById('chart-category'), null, { renderer: 'svg' });
  chartCategory.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    series: [
      {
        name: '现象分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        data: [
          { value: 312, name: '光学现象' },
          { value: 198, name: '生物异常' },
          { value: 156, name: '地质异常' },
          { value: 134, name: '声学现象' },
          { value: 98, name: '气象异常' },
          { value: 87, name: '不明飞行物' },
          { value: 65, name: '其他' }
        ],
        itemStyle: {
          color: function(params) {
            var colors = [accent, accent2, muted, accent + 'cc', accent2 + 'cc', accent + '99', muted + '99'];
            return colors[params.dataIndex % colors.length];
          }
        },
        label: { color: ink },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartCategory.resize(); });

  // --- Chart: Credibility Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: '多源验证', max: 100 },
        { name: '证据完整', max: 100 },
        { name: '地理一致', max: 100 },
        { name: '时间精确', max: 100 },
        { name: '描述清晰', max: 100 },
        { name: '历史匹配', max: 100 }
      ],
      axisName: { color: muted },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '可信度评估',
        type: 'radar',
        data: [
          {
            value: [85, 72, 90, 68, 78, 65],
            name: '典型事件A',
            areaStyle: { color: accent + '33' },
            lineStyle: { color: accent },
            itemStyle: { color: accent }
          },
          {
            value: [45, 38, 52, 30, 42, 28],
            name: '典型事件B',
            areaStyle: { color: accent2 + '33' },
            lineStyle: { color: accent2 },
            itemStyle: { color: accent2 }
          }
        ]
      }
    ],
    legend: {
      data: ['典型事件A', '典型事件B'],
      textStyle: { color: muted },
      bottom: 0
    }
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
