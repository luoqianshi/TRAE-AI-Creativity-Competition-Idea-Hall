(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: Pain Points Distribution ---
  var chartPain = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });
  chartPain.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontFamily: 'Outfit, sans-serif' },
      appendToBody: true,
      formatter: function(params) {
        var p = params[0];
        return p.name + '<br/><span style="color:' + accent + '">' + p.value + '%</span> 的玩家反馈此痛点';
      }
    },
    grid: { left: '3%', right: '5%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'GeistMono, monospace', fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: ['主播代码与视频脱节', '场景匹配困难', '缺乏质量参考', '版本更新方案失效', '信息分散搜索成本高'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontFamily: 'Outfit, sans-serif', fontSize: 12 },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: [62, 68, 75, 81, 92],
      barWidth: '50%',
      itemStyle: {
        color: function(params) {
          var colors = [accent2, accent2, accent2, accent, accent];
          return colors[params.dataIndex];
        },
        borderRadius: [0, 4, 4, 0]
      },
      label: {
        show: true,
        position: 'right',
        color: muted,
        fontFamily: 'GeistMono, monospace',
        fontSize: 11,
        formatter: '{c}%'
      }
    }]
  });
  window.addEventListener('resize', function() { chartPain.resize(); });

  // --- Chart 2: Efficiency Improvement Comparison ---
  var chartValue = echarts.init(document.getElementById('chart-value'), null, { renderer: 'svg' });
  chartValue.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontFamily: 'Outfit, sans-serif' },
      appendToBody: true
    },
    legend: {
      data: ['当前方式', '使用枪境后'],
      textStyle: { color: muted, fontFamily: 'Outfit, sans-serif', fontSize: 12 },
      top: 0,
      itemWidth: 14,
      itemHeight: 14
    },
    grid: { left: '3%', right: '5%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['搜索耗时\n(分钟)', '方案对比\n(步骤数)', '质量保障\n(评分制)', '场景匹配\n(准确率%)', '版本时效\n(更新延迟天)'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'Outfit, sans-serif', fontSize: 11, interval: 0 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'GeistMono, monospace', fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '当前方式',
        type: 'bar',
        data: [12, 5, 0, 40, 14],
        barWidth: '30%',
        itemStyle: { color: accent + '80', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '使用枪境后',
        type: 'bar',
        data: [0.5, 1, 10, 95, 1],
        barWidth: '30%',
        itemStyle: { color: accent2, borderRadius: [4, 4, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { chartValue.resize(); });
})();
