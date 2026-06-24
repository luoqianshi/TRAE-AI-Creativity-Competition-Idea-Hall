(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Galaxy Dashboard (Radar) ---
  var chartGalaxy = echarts.init(document.getElementById('chart-galaxy-dashboard'), null, { renderer: 'svg' });
  chartGalaxy.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    radar: {
      indicator: [
        { name: '健康', max: 100 },
        { name: '认知', max: 100 },
        { name: '情绪', max: 100 },
        { name: '社交', max: 100 },
        { name: '运动', max: 100 },
        { name: '睡眠', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 14 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: true, areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [85, 72, 90, 68, 75, 88],
        name: '今日成长指数',
        areaStyle: { color: accent + '33' },
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent },
        symbol: 'circle',
        symbolSize: 8
      }]
    }]
  });
  window.addEventListener('resize', function() { chartGalaxy.resize(); });

  // --- Chart: Weekly Growth Trend ---
  var chartTrend = echarts.init(document.getElementById('chart-weekly-trend'), null, { renderer: 'svg' });
  chartTrend.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['健康', '认知', '情绪'], textStyle: { color: muted }, bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '健康',
        type: 'line',
        smooth: true,
        data: [78, 82, 85, 80, 88, 90, 85],
        lineStyle: { color: '#4ECDC4', width: 3 },
        itemStyle: { color: '#4ECDC4' },
        areaStyle: { color: '#4ECDC433' }
      },
      {
        name: '认知',
        type: 'line',
        smooth: true,
        data: [65, 70, 68, 75, 72, 80, 72],
        lineStyle: { color: '#FFD166', width: 3 },
        itemStyle: { color: '#FFD166' },
        areaStyle: { color: '#FFD16633' }
      },
      {
        name: '情绪',
        type: 'line',
        smooth: true,
        data: [85, 80, 90, 88, 85, 92, 90],
        lineStyle: { color: '#FF6B6B', width: 3 },
        itemStyle: { color: '#FF6B6B' },
        areaStyle: { color: '#FF6B6B33' }
      }
    ]
  });
  window.addEventListener('resize', function() { chartTrend.resize(); });

  // --- Chart: Family Engagement Distribution ---
  var chartEngage = echarts.init(document.getElementById('chart-family-engage'), null, { renderer: 'svg' });
  chartEngage.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}小时 ({d}%)' },
    legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: muted } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: bg2, borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold', color: ink } },
      data: [
        { value: 2.3, name: '妈妈', itemStyle: { color: accent } },
        { value: 1.5, name: '爸爸', itemStyle: { color: '#4ECDC4' } },
        { value: 1.8, name: '奶奶', itemStyle: { color: '#FFD166' } },
        { value: 0.5, name: '爷爷', itemStyle: { color: '#95E1D3' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartEngage.resize(); });

  // --- Chart: Milestone Timeline ---
  var chartMilestone = echarts.init(document.getElementById('chart-milestone'), null, { renderer: 'svg' });
  chartMilestone.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: function(p) { return p.name + '<br/>' + p.value[2]; } },
    grid: { left: '3%', right: '8%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, formatter: '{yyyy}-{MM}' },
      splitLine: { show: true, lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 5,
      axisLine: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    series: [{
      type: 'scatter',
      symbolSize: function(val) { return val[3] * 8; },
      data: [
        ['2023-06-15', 1, '第一次翻身', 5],
        ['2023-09-20', 2, '第一次爬行', 6],
        ['2024-01-10', 3, '第一次站立', 7],
        ['2024-03-05', 4, '第一次走路', 8],
        ['2024-06-18', 2, '第一次叫妈妈', 6],
        ['2024-09-01', 3, '第一次自己吃饭', 5],
        ['2024-12-20', 4, '第一次系鞋带', 7],
        ['2025-02-14', 1, '第一次画画', 4],
        ['2025-04-10', 2, '第一次骑平衡车', 6],
        ['2025-06-01', 3, '第一次讲故事', 5]
      ],
      itemStyle: {
        color: function(p) {
          var colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#95E1D3', '#A8D8EA'];
          return colors[p.dataIndex % colors.length];
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: function(p) { return p.value[2]; },
        color: muted,
        fontSize: 11
      }
    }]
  });
  window.addEventListener('resize', function() { chartMilestone.resize(); });
})();
