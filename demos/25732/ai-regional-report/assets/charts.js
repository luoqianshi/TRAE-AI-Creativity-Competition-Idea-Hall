(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 行业 AI 应用渗透率 ---
  var chart1 = echarts.init(document.getElementById('chart-penetration'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%', right: '4%', bottom: '3%', top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['政务服务', '医疗健康', '智慧交通', '教育培训', '工业制造', '金融科技', '农业', '文旅'],
      axisLabel: { color: muted, fontSize: 12, rotate: 20 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '渗透率 (%)',
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 78, itemStyle: { color: accent } },
        { value: 65, itemStyle: { color: accent2 } },
        { value: 62, itemStyle: { color: accent } },
        { value: 55, itemStyle: { color: accent2 } },
        { value: 48, itemStyle: { color: accent } },
        { value: 45, itemStyle: { color: accent2 } },
        { value: 32, itemStyle: { color: accent } },
        { value: 28, itemStyle: { color: accent2 } }
      ],
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        color: ink,
        fontSize: 11,
        fontWeight: 600
      }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: 区域 AI 发展成熟度雷达图 ---
  var chart2 = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: {
      data: ['A 市（一线城市）', 'B 市（新一线城市）', 'C 市（二线城市）'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    radar: {
      indicator: [
        { name: '政策支持', max: 100 },
        { name: '企业集聚', max: 100 },
        { name: '人才储备', max: 100 },
        { name: '应用场景', max: 100 },
        { name: '基础设施', max: 100 },
        { name: '资金投入', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [92, 88, 85, 90, 87, 95],
          name: 'A 市（一线城市）',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '33' },
          itemStyle: { color: accent }
        },
        {
          value: [78, 72, 68, 75, 70, 65],
          name: 'B 市（新一线城市）',
          lineStyle: { color: accent2, width: 2 },
          areaStyle: { color: accent2 + '33' },
          itemStyle: { color: accent2 }
        },
        {
          value: [55, 45, 50, 48, 42, 38],
          name: 'C 市（二线城市）',
          lineStyle: { color: muted, width: 2 },
          areaStyle: { color: muted + '22' },
          itemStyle: { color: muted }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
