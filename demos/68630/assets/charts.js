(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Food Waste Structure ---
  var chartWaste = echarts.init(document.getElementById('chart-waste'), null, { renderer: 'svg' });
  chartWaste.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      bottom: '0%',
      left: 'center',
      textStyle: { color: muted, fontSize: 13 }
    },
    series: [
      {
        name: '食物浪费结构',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: bg2,
          borderWidth: 3
        },
        label: {
          show: true,
          color: ink,
          fontSize: 13,
          formatter: '{b}\n{d}%'
        },
        labelLine: {
          lineStyle: { color: rule }
        },
        data: [
          { value: 35, name: '果蔬类', itemStyle: { color: accent } },
          { value: 22, name: '谷物主食', itemStyle: { color: accent2 } },
          { value: 18, name: '肉禽蛋', itemStyle: { color: '#3B82F6' } },
          { value: 15, name: '乳制品', itemStyle: { color: '#8B5CF6' } },
          { value: 10, name: '其他', itemStyle: { color: muted + 'aa' } }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartWaste.resize(); });

  // --- Chart: Target User Persona ---
  var chartPersona = echarts.init(document.getElementById('chart-persona'), null, { renderer: 'svg' });
  chartPersona.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['精打细算族', '环保践行者', '品质尝鲜族', '社区家庭用户', '学生/年轻白领'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12, interval: 0 }
    },
    yAxis: {
      type: 'value',
      name: '占比 (%)',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '用户占比',
        type: 'bar',
        barWidth: '45%',
        itemStyle: {
          color: accent,
          borderRadius: [6, 6, 0, 0]
        },
        data: [32, 24, 18, 16, 10]
      }
    ]
  });
  window.addEventListener('resize', function() { chartPersona.resize(); });
})();
