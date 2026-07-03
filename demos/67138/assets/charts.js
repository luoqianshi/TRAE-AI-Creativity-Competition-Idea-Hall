(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim() || '#0D7377';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#FF9F43';
  var ink = style.getPropertyValue('--ink').trim() || '#1A1A1A';
  var muted = style.getPropertyValue('--muted').trim() || '#5A5A5A';
  var rule = style.getPropertyValue('--rule').trim() || '#E0DDD5';
  var bg2 = style.getPropertyValue('--surface').trim() || '#FFFFFF';

  // --- Chart: Pain Distribution ---
  var chart1 = echarts.init(document.getElementById('chart-pain-distribution'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: { bottom: 0, textStyle: { color: muted } },
    color: [accent, accent2, '#E74C3C', '#3498DB', '#9B59B6'],
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg2, borderWidth: 2 },
      label: { show: true, color: ink, formatter: '{b}\n{d}%' },
      data: [
        { value: 28, name: '居家应急求助难' },
        { value: 24, name: '独居老人帮扶缺位' },
        { value: 18, name: '邻里互助渠道闭塞' },
        { value: 16, name: '社区隐患上报低效' },
        { value: 14, name: '便民服务鱼龙混杂' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: Radar Innovation ---
  var chart2 = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: '赛事适配度', max: 100 },
        { name: '技术创新性', max: 100 },
        { name: '本土差异化', max: 100 },
        { name: '落地可行性', max: 100 },
        { name: '社会公益性', max: 100 },
        { name: '人群普惠性', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [95, 85, 98, 92, 96, 94],
        name: '本项目',
        areaStyle: { color: accent + '33' },
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent }
      }]
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });

  // --- Chart: Value Impact ---
  var chart3 = echarts.init(document.getElementById('chart-value'), null, { renderer: 'svg' });
  chart3.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['民生便利', '治理效率', '安全保障', '社区融合', '成本控制'],
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
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: [
        { value: 92, itemStyle: { color: accent } },
        { value: 85, itemStyle: { color: accent } },
        { value: 88, itemStyle: { color: accent } },
        { value: 78, itemStyle: { color: accent } },
        { value: 95, itemStyle: { color: accent2 } }
      ],
      label: { show: true, position: 'top', color: ink, formatter: '{c}' },
      itemStyle: { borderRadius: [4, 4, 0, 0] }
    }]
  });
  window.addEventListener('resize', function() { chart3.resize(); });
})();
