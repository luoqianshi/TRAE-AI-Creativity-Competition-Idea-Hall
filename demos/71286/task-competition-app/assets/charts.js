(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var red = '#ef4444';
  var bg = style.getPropertyValue('--bg').trim();

  // --- Chart 1: Competitive Radar ---
  var radar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  radar.setOption({
    tooltip: { appendToBody: true, backgroundColor: '#1e293b', borderColor: rule, textStyle: { color: ink } },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 13 },
      data: ['拖到最后算我输', 'Habitica', 'Forest', '番茄TODO']
    },
    radar: {
      indicator: [
        { name: '社交匹配', max: 5 },
        { name: '竞技激励', max: 5 },
        { name: '进度核验', max: 5 },
        { name: '段位成长', max: 5 },
        { name: '社群氛围', max: 5 },
        { name: '公平保障', max: 5 }
      ],
      shape: 'circle',
      splitArea: { areaStyle: { color: [bg, bg2] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } },
      axisName: { color: muted, fontSize: 12 }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [5, 5, 4, 5, 4, 4.5],
          name: '拖到最后算我输',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '33' },
          itemStyle: { color: accent }
        },
        {
          value: [2, 3, 1, 4, 2, 1.5],
          name: 'Habitica',
          lineStyle: { color: '#a78bfa', width: 1.5 },
          areaStyle: { color: '#a78bfa22' },
          itemStyle: { color: '#a78bfa' }
        },
        {
          value: [1, 1, 2, 1, 1, 1],
          name: 'Forest',
          lineStyle: { color: '#34d399', width: 1.5 },
          areaStyle: { color: '#34d39922' },
          itemStyle: { color: '#34d399' }
        },
        {
          value: [1, 1, 1, 1, 1.5, 1],
          name: '番茄TODO',
          lineStyle: { color: '#fb923c', width: 1.5 },
          areaStyle: { color: '#fb923c22' },
          itemStyle: { color: '#fb923c' }
        }
      ]
    }],
    animation: false
  });
  window.addEventListener('resize', function() { radar.resize(); });

  // --- Chart 2: Market Data Pie ---
  var pie = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  pie.setOption({
    tooltip: { appendToBody: true, trigger: 'item', backgroundColor: '#1e293b', borderColor: rule, textStyle: { color: ink } },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted, fontSize: 12 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg, borderWidth: 2 },
      label: { color: muted, fontSize: 12 },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 42, name: '大学生', itemStyle: { color: accent } },
        { value: 28, name: '备考群体', itemStyle: { color: accent2 } },
        { value: 18, name: '职场新人', itemStyle: { color: '#a78bfa' } },
        { value: 12, name: '其他', itemStyle: { color: muted + '88' } }
      ],
      animation: false
    }]
  });
  window.addEventListener('resize', function() { pie.resize(); });

  // --- Chart 3: Roadmap Timeline (Horizontal bar) ---
  var roadmap = echarts.init(document.getElementById('chart-roadmap'), null, { renderer: 'svg' });
  roadmap.setOption({
    tooltip: { appendToBody: true, backgroundColor: '#1e293b', borderColor: rule, textStyle: { color: ink } },
    grid: { left: 100, right: 40, top: 40, bottom: 40 },
    xAxis: {
      type: 'value',
      max: 12,
      axisLabel: { color: muted, formatter: '{value}月' },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: ['V2.0 成熟期', 'V1.5 扩张期', 'V1.0 MVP上线', '内测期'],
      axisLabel: { color: ink, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'bar',
      data: [
        { value: [9, 12], itemStyle: { color: '#a78bfa' } },
        { value: [6, 9], itemStyle: { color: accent2 } },
        { value: [3, 6], itemStyle: { color: accent } },
        { value: [0, 3], itemStyle: { color: '#34d399' } }
      ],
      barWidth: 24,
      label: {
        show: true,
        position: 'inside',
        formatter: function(p) { return p.value[0] + '-' + p.value[1] + '月'; },
        color: ink,
        fontSize: 11
      },
      itemStyle: { borderRadius: 4 },
      animation: false
    }]
  });
  window.addEventListener('resize', function() { roadmap.resize(); });
})();
