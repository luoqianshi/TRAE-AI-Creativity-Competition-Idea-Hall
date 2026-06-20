(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Journey Sankey ---
  var chartJourney = echarts.init(document.getElementById('chart-journey'), null, { renderer: 'svg' });
  chartJourney.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      data: [
        { name: '孩童打开应用' },
        { name: '象形识字学堂' },
        { name: '趣味识字训练' },
        { name: 'AI智能解析' },
        { name: '场景字义学习' },
        { name: '互动答疑' },
        { name: '字形配对' },
        { name: '听音认字' },
        { name: '笔顺临摹' },
        { name: 'AI测评反馈' },
        { name: '家长查看报告' },
        { name: '个性化计划调整' },
        { name: '完成学习闭环' }
      ],
      links: [
        { source: '孩童打开应用', target: '象形识字学堂', value: 40 },
        { source: '孩童打开应用', target: '趣味识字训练', value: 35 },
        { source: '象形识字学堂', target: 'AI智能解析', value: 20 },
        { source: '象形识字学堂', target: '场景字义学习', value: 12 },
        { source: '象形识字学堂', target: '互动答疑', value: 8 },
        { source: '趣味识字训练', target: '字形配对', value: 12 },
        { source: '趣味识字训练', target: '听音认字', value: 12 },
        { source: '趣味识字训练', target: '笔顺临摹', value: 11 },
        { source: 'AI智能解析', target: 'AI测评反馈', value: 20 },
        { source: '场景字义学习', target: 'AI测评反馈', value: 12 },
        { source: '互动答疑', target: 'AI测评反馈', value: 8 },
        { source: '字形配对', target: 'AI测评反馈', value: 12 },
        { source: '听音认字', target: 'AI测评反馈', value: 12 },
        { source: '笔顺临摹', target: 'AI测评反馈', value: 11 },
        { source: 'AI测评反馈', target: '家长查看报告', value: 35 },
        { source: 'AI测评反馈', target: '个性化计划调整', value: 40 },
        { source: '家长查看报告', target: '完成学习闭环', value: 35 },
        { source: '个性化计划调整', target: '完成学习闭环', value: 40 }
      ],
      lineStyle: { color: 'source', curveness: 0.5, opacity: 0.4 },
      itemStyle: { borderWidth: 0 },
      label: { color: ink, fontSize: 12, fontFamily: 'Outfit, sans-serif' },
      color: [accent, accent2, '#E8A87C', '#85C1E2', '#C5B8D4', '#F4B9A7', '#A8D8B9', '#F9E79F', '#D7BDE2', '#AED6F1', '#F5B7B1', '#A9DFBF', '#FAD7A0']
    }]
  });
  window.addEventListener('resize', function() { chartJourney.resize(); });

  // --- Chart: Value Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: {
      data: ['传统识字方式', '字趣童行'],
      bottom: 0,
      textStyle: { color: ink, fontFamily: 'Outfit, sans-serif' }
    },
    radar: {
      indicator: [
        { name: '学习趣味性', max: 100 },
        { name: '教学标准化', max: 100 },
        { name: '个性化程度', max: 100 },
        { name: '家长参与度', max: 100 },
        { name: '数据可追溯', max: 100 },
        { name: '使用成本低', max: 100 },
        { name: '护眼健康性', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted, fontFamily: 'Outfit, sans-serif' },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: true, areaStyle: { color: [bg2, 'white'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [30, 40, 20, 25, 15, 30, 20],
          name: '传统识字方式',
          areaStyle: { color: muted + '33' },
          lineStyle: { color: muted },
          itemStyle: { color: muted }
        },
        {
          value: [90, 95, 92, 88, 90, 95, 85],
          name: '字趣童行',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
