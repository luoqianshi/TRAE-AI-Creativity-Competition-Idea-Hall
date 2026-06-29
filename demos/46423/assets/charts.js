(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Radar Comparison ---
  var radarEl = document.getElementById('chart-radar');
  if (radarEl) {
    var radar = echarts.init(radarEl, null, { renderer: 'svg' });
    radar.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        borderWidth: 1,
        textStyle: { color: ink, fontSize: 13 }
      },
      legend: {
        data: ['传统袖带血压计', '现有 PPG 智能手环', '心安（多模态融合）'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 },
        itemGap: 20
      },
      radar: {
        indicator: [
          { name: '连续监测能力', max: 10 },
          { name: '佩戴舒适度', max: 10 },
          { name: '测量精度', max: 10 },
          { name: '运动场景适应性', max: 10 },
          { name: '个性化算法', max: 10 },
          { name: '成本可及性', max: 10 }
        ],
        center: ['50%', '48%'],
        radius: '62%',
        axisName: {
          color: ink,
          fontSize: 12,
          padding: [3, 5]
        },
        splitLine: { lineStyle: { color: rule } },
        splitArea: {
          areaStyle: {
            color: ['transparent', 'rgba(56,189,248,0.03)', 'transparent', 'rgba(52,211,153,0.03)']
          }
        },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [2, 3, 9, 1, 1, 8],
            name: '传统袖带血压计',
            lineStyle: { color: muted, width: 2, type: 'dashed' },
            itemStyle: { color: muted },
            areaStyle: { color: 'rgba(139,151,176,0.08)' }
          },
          {
            value: [8, 9, 5, 4, 3, 7],
            name: '现有 PPG 智能手环',
            lineStyle: { color: accent2, width: 2 },
            itemStyle: { color: accent2 },
            areaStyle: { color: 'rgba(52,211,153,0.12)' }
          },
          {
            value: [9, 7, 8, 8, 9, 5],
            name: '心安（多模态融合）',
            lineStyle: { color: accent, width: 2.5 },
            itemStyle: { color: accent },
            areaStyle: { color: 'rgba(56,189,248,0.15)' }
          }
        ]
      }]
    });
    window.addEventListener('resize', function() { radar.resize(); });
  }
})();
