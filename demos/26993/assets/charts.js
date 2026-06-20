(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // --- Chart: Competitive Quadrant Map ---
  var chartCompetitive = echarts.init(document.getElementById('chart-competitive-map'), null, { renderer: 'svg' });

  var competitors = [
    { name: 'Ableton Live 12', x: 8.5, y: 8.0, size: 55, category: 'daw' },
    { name: 'FL Studio 2025', x: 7.0, y: 7.5, size: 48, category: 'daw' },
    { name: 'Logic Pro 12', x: 8.0, y: 9.0, size: 50, category: 'daw' },
    { name: 'Suno V5.5', x: 2.0, y: 2.0, size: 70, category: 'ai' },
    { name: 'Udio', x: 3.0, y: 2.5, size: 42, category: 'ai' },
    { name: 'AIVA', x: 3.5, y: 3.5, size: 35, category: 'ai' },
    { name: 'BandLab', x: 5.5, y: 4.0, size: 52, category: 'ai' },
    { name: 'Scaler 3', x: 5.0, y: 5.5, size: 38, category: 'theory' },
    { name: 'Hooktheory', x: 4.0, y: 5.0, size: 32, category: 'theory' },
    { name: 'Odesi', x: 4.5, y: 4.5, size: 28, category: 'theory' },
    { name: 'Soundtrap 2.0', x: 4.5, y: 3.5, size: 36, category: 'theory' },
    { name: 'GridTone\n(目标定位)', x: 7.5, y: 3.0, size: 60, category: 'us' }
  ];

  var categoryColors = {
    daw: accent,
    ai: '#f97316',
    theory: accent2,
    us: '#f43f5e'
  };

  var categoryLabels = {
    daw: '传统 DAW',
    ai: 'AI 生成器',
    theory: '乐理辅助',
    us: 'GridTone'
  };

  var seriesData = competitors.map(function(c) {
    return {
      name: c.name,
      value: [c.x, c.y, c.size],
      itemStyle: {
        color: categoryColors[c.category],
        opacity: c.category === 'us' ? 1 : 0.75,
        borderColor: c.category === 'us' ? '#f43f5e' : 'transparent',
        borderWidth: c.category === 'us' ? 3 : 0
      },
      label: {
        show: true,
        formatter: c.name,
        position: 'top',
        distance: 8,
        fontSize: 11,
        fontWeight: c.category === 'us' ? 700 : 400,
        color: c.category === 'us' ? '#f43f5e' : ink
      }
    };
  });

  chartCompetitive.setOption({
    animation: false,
    backgroundColor: 'transparent',
    grid: {
      left: 60,
      right: 40,
      top: 40,
      bottom: 60
    },
    xAxis: {
      name: '创作门槛 →',
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: { color: muted, fontSize: 12 },
      min: 0,
      max: 10,
      splitLine: { show: true, lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      name: '用户可控性 →',
      nameLocation: 'middle',
      nameGap: 45,
      nameTextStyle: { color: muted, fontSize: 12 },
      min: 0,
      max: 10,
      splitLine: { show: true, lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: function(p) {
        var cat = categoryLabels[competitors[p.dataIndex].category] || '';
        return '<strong>' + p.name.replace('\n', ' ') + '</strong><br/>类别：' + cat;
      }
    },
    series: [{
      type: 'scatter',
      symbolSize: function(data) { return data[2]; },
      data: seriesData,
      emphasis: {
        itemStyle: { opacity: 1, shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.3)' }
      }
    }],
    graphic: [
      {
        type: 'text',
        left: 80,
        top: 55,
        style: { text: '高门槛 + 高控制', fill: muted, fontSize: 11, opacity: 0.6 }
      },
      {
        type: 'text',
        right: 60,
        bottom: 75,
        style: { text: '低门槛 + 低控制', fill: muted, fontSize: 11, opacity: 0.6 }
      },
      {
        type: 'text',
        left: 80,
        bottom: 75,
        style: { text: '高门槛 + 低控制', fill: muted, fontSize: 11, opacity: 0.6 }
      },
      {
        type: 'text',
        right: 60,
        top: 55,
        style: { text: '低门槛 + 高控制', fill: '#f43f5e', fontSize: 11, fontWeight: 700, opacity: 0.8 }
      }
    ]
  });

  window.addEventListener('resize', function() { chartCompetitive.resize(); });
})();