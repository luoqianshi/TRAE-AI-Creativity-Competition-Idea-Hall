(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Pain Points ---
  var chartPain = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });
  chartPain.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['经期不规律', '痛经困扰', '情绪管理难', '健康数据分散', '缺乏个性化建议'],
      axisLabel: { color: muted, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '用户占比 (%)',
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      data: [68, 72, 55, 80, 75],
      type: 'bar',
      barWidth: '50%',
      itemStyle: {
        color: function(params) {
          var colors = [accent + 'cc', accent2 + 'cc', accent + '99', accent2 + '99', accent + 'dd'];
          return colors[params.dataIndex];
        },
        borderRadius: [6, 6, 0, 0]
      },
      label: { show: true, position: 'top', color: ink, fontWeight: 'bold' }
    }]
  });
  window.addEventListener('resize', function() { chartPain.resize(); });

  // --- Chart: Core Value Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: '经期预测', max: 100 },
        { name: '健康监测', max: 100 },
        { name: '个性化建议', max: 100 },
        { name: '情绪关怀', max: 100 },
        { name: '数据整合', max: 100 },
        { name: '使用便捷', max: 100 }
      ],
      axisName: { color: muted },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [92, 88, 85, 90, 95, 96],
        name: '悦己周期',
        areaStyle: { color: accent + '33' },
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent }
      }]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
