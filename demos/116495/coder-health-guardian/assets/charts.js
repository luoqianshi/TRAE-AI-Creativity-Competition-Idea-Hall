(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var palette = [accent, accent2, muted, accent + '99', accent2 + '99', muted + '99'];

  // --- Chart: Pain Distribution (Pie) ---
  var chartPain = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });
  chartPain.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: { bottom: 0, textStyle: { color: muted, fontSize: 12 } },
    color: palette,
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg2, borderWidth: 2 },
      label: { show: true, color: ink, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 76, name: '颈椎/腰椎问题' },
        { value: 68, name: '用眼疲劳' },
        { value: 54, name: '睡眠不足' },
        { value: 47, name: '手腕/肩颈酸痛' },
        { value: 42, name: '缺乏运动' },
        { value: 38, name: '饮食不规律' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartPain.resize(); });

  // --- Chart: Sitting Hours (Bar) ---
  var chartSitting = echarts.init(document.getElementById('chart-sitting'), null, { renderer: 'svg' });
  chartSitting.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      max: 12,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [{
      type: 'bar',
      data: [10.5, 11.2, 9.8, 10.8, 8.5],
      barWidth: '50%',
      itemStyle: { color: accent, borderRadius: [6, 6, 0, 0] },
      label: { show: true, position: 'top', color: ink, formatter: '{c}h' }
    }]
  });
  window.addEventListener('resize', function() { chartSitting.resize(); });

  // --- Chart: Health Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: { bottom: 0, data: ['使用前', '使用30天后'], textStyle: { color: muted, fontSize: 12 } },
    radar: {
      indicator: [
        { name: '用眼健康', max: 100 },
        { name: '坐姿评分', max: 100 },
        { name: '饮水达标', max: 100 },
        { name: '运动频率', max: 100 },
        { name: '休息规律', max: 100 },
        { name: '睡眠质量', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: true, areaStyle: { color: [bg2, 'rgba(13,148,136,0.03)'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [35, 40, 30, 25, 45, 50],
          name: '使用前',
          itemStyle: { color: muted },
          lineStyle: { color: muted, width: 2 },
          areaStyle: { color: muted + '33' }
        },
        {
          value: [72, 78, 85, 65, 80, 75],
          name: '使用30天后',
          itemStyle: { color: accent },
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '33' }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // --- Chart: Water Intake (Line) ---
  var chartWater = echarts.init(document.getElementById('chart-water'), null, { renderer: 'svg' });
  chartWater.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      max: 10,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '实际饮水',
        type: 'line',
        data: [4, 5, 3, 6, 4, 7, 6],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: accent },
        lineStyle: { color: accent, width: 3 },
        areaStyle: { color: accent + '22' }
      },
      {
        name: '推荐目标',
        type: 'line',
        data: [8, 8, 8, 8, 8, 8, 8],
        smooth: false,
        symbol: 'none',
        lineStyle: { color: accent2, width: 2, type: 'dashed' }
      }
    ],
    legend: { bottom: 0, textStyle: { color: muted, fontSize: 12 } }
  });
  window.addEventListener('resize', function() { chartWater.resize(); });
})();
