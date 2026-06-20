(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Problem Data ---
  var chartProblem = echarts.init(document.getElementById('chart-problem'), null, { renderer: 'svg' });
  chartProblem.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      data: ['重复用药率', '漏服误服率', '用药依从性'],
      bottom: 0,
      textStyle: { color: muted }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['全国平均', '农村地区', '乡镇老人', '多药联用(5种+)', '多药联用(8种+)'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, formatter: '{value}%' }
    },
    series: [
      {
        name: '重复用药率',
        type: 'bar',
        data: [25, 32, 38, 45, 52],
        itemStyle: { color: accent, borderRadius: [6, 6, 0, 0] },
        barWidth: '20%'
      },
      {
        name: '漏服误服率',
        type: 'bar',
        data: [30, 38, 42, 48, 55],
        itemStyle: { color: accent2, borderRadius: [6, 6, 0, 0] },
        barWidth: '20%'
      },
      {
        name: '用药依从性',
        type: 'bar',
        data: [72, 64, 58, 50, 42],
        itemStyle: { color: '#f59e0b', borderRadius: [6, 6, 0, 0] },
        barWidth: '20%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartProblem.resize(); });

  // --- Chart: Innovation Comparison ---
  var chartInnovation = echarts.init(document.getElementById('chart-innovation'), null, { renderer: 'svg' });
  chartInnovation.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    legend: {
      data: ['传统方式', '放心AI方案'],
      bottom: 0,
      textStyle: { color: muted }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['重复用药识别', '漏服率', '误服拦截', '异常发现时效'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
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
        name: '传统方式',
        type: 'bar',
        data: [20, 42, 15, 10],
        itemStyle: { color: '#cbd5e1', borderRadius: [6, 6, 0, 0] },
        barWidth: '30%'
      },
      {
        name: '放心AI方案',
        type: 'bar',
        data: [95, 21, 80, 95],
        itemStyle: { color: accent, borderRadius: [6, 6, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartInnovation.resize(); });

  // --- Chart: Tech Architecture Flow (Sankey) ---
  var chartTech = echarts.init(document.getElementById('chart-tech'), null, { renderer: 'svg' });
  chartTech.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      data: [
        { name: '医生端(Web)' },
        { name: '老人端(小程序)' },
        { name: '子女端(小程序)' },
        { name: 'FastAPI后端' },
        { name: 'PaddleOCR' },
        { name: '药品数据库' },
        { name: '冲突检测引擎' },
        { name: '本地存储' },
        { name: '加密同步' }
      ],
      links: [
        { source: '医生端(Web)', target: 'FastAPI后端', value: 5 },
        { source: '老人端(小程序)', target: 'FastAPI后端', value: 5 },
        { source: '子女端(小程序)', target: 'FastAPI后端', value: 3 },
        { source: 'FastAPI后端', target: 'PaddleOCR', value: 4 },
        { source: 'FastAPI后端', target: '药品数据库', value: 5 },
        { source: 'FastAPI后端', target: '冲突检测引擎', value: 4 },
        { source: 'FastAPI后端', target: '本地存储', value: 6 },
        { source: '本地存储', target: '加密同步', value: 3 }
      ],
      lineStyle: { color: 'gradient', curveness: 0.5 },
      itemStyle: { color: accent, borderColor: accent2 },
      label: { color: ink, fontSize: 11 }
    }]
  });
  window.addEventListener('resize', function() { chartTech.resize(); });

  // --- Chart: Business Model Revenue ---
  var chartBusiness = echarts.init(document.getElementById('chart-business'), null, { renderer: 'svg' });
  chartBusiness.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted }
    },
    series: [{
      name: '收入来源',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: bg2,
        borderWidth: 3
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        color: ink,
        fontSize: 12
      },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      data: [
        { value: 65, name: '政府/县域医共体', itemStyle: { color: accent } },
        { value: 25, name: '子女订阅', itemStyle: { color: accent2 } },
        { value: 10, name: '数据服务', itemStyle: { color: '#f59e0b' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartBusiness.resize(); });
})();
