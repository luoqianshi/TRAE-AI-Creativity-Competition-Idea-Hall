(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var warm = style.getPropertyValue('--accent-warm').trim();
  var gold = style.getPropertyValue('--accent-gold').trim();

  // --- Chart: Emotion Curve ---
  var chartEmotion = echarts.init(document.getElementById('chart-emotion'), null, { renderer: 'svg' });
  chartEmotion.setOption({
    animation: false,
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      formatter: function(params) {
        var p = params[0];
        var mood = p.value >= 0.6 ? '🎉 狂喜' : p.value >= 0.2 ? '😊 愉悦' : p.value >= -0.2 ? '🧘 平静' : p.value >= -0.6 ? '😤 焦躁' : '🤯 崩溃';
        return '<strong>' + p.name + '</strong><br/>情绪值: <span style="color:' + (p.value >= 0 ? accent : warm) + '">' + p.value + '</span><br/>' + mood;
      }
    },
    grid: { left: 60, right: 30, top: 40, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['09:12', '10:45', '11:30', '14:05', '15:40', '17:20', '18:00'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'JetBrainsMono, monospace' },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: -1,
      max: 1,
      interval: 0.5,
      splitLine: { lineStyle: { color: rule, type: [4, 4] } },
      axisLine: { show: false },
      axisLabel: {
        color: muted,
        formatter: function(v) {
          if (v === 1) return '🎉';
          if (v === 0.5) return '😊';
          if (v === 0) return '😐';
          if (v === -0.5) return '😤';
          if (v === -1) return '🤯';
          return v;
        }
      }
    },
    visualMap: {
      show: false,
      dimension: 1,
      pieces: [
        { gt: 0, lte: 1, color: accent },
        { gt: -0.2, lte: 0, color: muted },
        { gt: -1, lte: -0.2, color: warm }
      ]
    },
    series: [{
      name: '情绪值',
      type: 'line',
      smooth: 0.4,
      symbol: 'circle',
      symbolSize: 10,
      lineStyle: { width: 3 },
      areaStyle: {
        opacity: 0.15,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: accent },
          { offset: 1, color: 'transparent' }
        ])
      },
      data: [-0.72, -0.55, 0.23, 0.68, -0.81, 0.92, 0.45],
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: rule, type: 'dashed', width: 1 },
        data: [{ yAxis: 0 }],
        label: { show: false }
      },
      markPoint: {
        data: [
          { type: 'min', name: '最低', itemStyle: { color: warm }, label: { color: '#fff', formatter: '最低' } },
          { type: 'max', name: '最高', itemStyle: { color: accent }, label: { color: '#fff', formatter: '最高' } }
        ]
      }
    }]
  });
  window.addEventListener('resize', function() { chartEmotion.resize(); });

  // --- Chart: Emotion Pie ---
  var chartPie = echarts.init(document.getElementById('chart-pie'), null, { renderer: 'svg' });
  chartPie.setOption({
    animation: false,
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      formatter: '{b}: {c} 次 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: { color: ink },
      itemWidth: 14,
      itemHeight: 14
    },
    series: [{
      name: '情绪分布',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg2, borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          color: ink
        }
      },
      data: [
        { value: 2, name: '😤 焦躁/迷茫', itemStyle: { color: warm } },
        { value: 2, name: '🧘 平静/从容', itemStyle: { color: accent2 } },
        { value: 2, name: '😊 愉悦/狂喜', itemStyle: { color: accent } },
        { value: 1, name: '🤯 崩溃', itemStyle: { color: '#a371f7' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartPie.resize(); });
})();
