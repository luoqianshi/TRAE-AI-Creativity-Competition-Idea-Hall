(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Journey Flow ---
  var chartJourney = echarts.init(document.getElementById('chart-journey'), null, { renderer: 'svg' });
  chartJourney.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      data: [
        { name: '记录当下' },
        { name: '照片' },
        { name: '文字' },
        { name: '语音' },
        { name: '存入时光杂货铺' },
        { name: '设定开启时间' },
        { name: '等待岁月沉淀' },
        { name: '未来开启' },
        { name: '重温感动' }
      ],
      links: [
        { source: '记录当下', target: '照片', value: 5 },
        { source: '记录当下', target: '文字', value: 5 },
        { source: '记录当下', target: '语音', value: 3 },
        { source: '照片', target: '存入时光杂货铺', value: 5 },
        { source: '文字', target: '存入时光杂货铺', value: 5 },
        { source: '语音', target: '存入时光杂货铺', value: 3 },
        { source: '存入时光杂货铺', target: '设定开启时间', value: 8 },
        { source: '设定开启时间', target: '等待岁月沉淀', value: 8 },
        { source: '等待岁月沉淀', target: '未来开启', value: 8 },
        { source: '未来开启', target: '重温感动', value: 8 }
      ],
      lineStyle: { color: 'source', curveness: 0.5 },
      itemStyle: { color: accent, borderColor: rule },
      label: { color: ink, fontSize: 14 }
    }]
  });
  window.addEventListener('resize', function() { chartJourney.resize(); });

  // --- Chart: Feature Priority ---
  var chartFeatures = echarts.init(document.getElementById('chart-features'), null, { renderer: 'svg' });
  chartFeatures.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    radar: {
      indicator: [
        { name: '照片存储', max: 100 },
        { name: '文字记录', max: 100 },
        { name: '语音留言', max: 100 },
        { name: '定时开启', max: 100 },
        { name: '情感分析', max: 100 },
        { name: '社交分享', max: 100 }
      ],
      axisName: { color: ink, fontSize: 13 },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [95, 90, 75, 100, 60, 50],
          name: '核心功能优先级',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartFeatures.resize(); });
})();
