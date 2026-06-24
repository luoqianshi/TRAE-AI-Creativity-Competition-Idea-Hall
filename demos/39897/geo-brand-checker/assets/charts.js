(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- 雷达图: 品牌综合评分 ---
  var radar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  radar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: '口碑舆情', max: 100 },
        { name: '情感倾向', max: 100 },
        { name: '差异化标签', max: 100 },
        { name: '数据时效性', max: 100 },
        { name: '转化引导', max: 100 },
        { name: '信源权威', max: 100 },
        { name: '品牌提及', max: 100 },
        { name: '品牌排名', max: 100 },
        { name: '场景关联度', max: 100 },
        { name: '信源多源', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      radius: '65%',
      axisName: { color: muted, fontSize: 9 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [82, 75, 58, 64, 71, 88, 69, 73, 55, 62],
        name: '品牌评分',
        areaStyle: { color: accent + '33' },
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent }
      }]
    }]
  });
  window.addEventListener('resize', function() { radar.resize(); });

  // --- 折线图: 品牌曝光趋势 ---
  var trend = echarts.init(document.getElementById('chart-trend'), null, { renderer: 'svg' });
  trend.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: { data: ['你的品牌', '行业均值'], textStyle: { color: muted, fontSize: 10 }, top: 0 },
    grid: { top: 35, bottom: 25, left: 40, right: 10 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 10 }
    },
    series: [
      {
        name: '你的品牌',
        type: 'line',
        data: [320, 380, 420, 510, 580, 650],
        smooth: true,
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent },
        areaStyle: { color: accent + '22' }
      },
      {
        name: '行业均值',
        type: 'line',
        data: [300, 310, 340, 360, 390, 410],
        smooth: true,
        lineStyle: { color: accent2, width: 2, type: 'dashed' },
        itemStyle: { color: accent2 }
      }
    ]
  });
  window.addEventListener('resize', function() { trend.resize(); });

  // --- 柱状图: 竞品对比 ---
  var compare = echarts.init(document.getElementById('chart-compare'), null, { renderer: 'svg' });
  compare.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: { data: ['你的品牌', '竞品A', '竞品B'], textStyle: { color: muted, fontSize: 10 }, top: 0 },
    grid: { top: 35, bottom: 25, left: 40, right: 10 },
    xAxis: {
      type: 'category',
      data: ['提及', '情感', '差异', '权威', '场景'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 10 }
    },
    series: [
      {
        name: '你的品牌',
        type: 'bar',
        data: [69, 75, 58, 88, 55],
        itemStyle: { color: accent, borderRadius: [2, 2, 0, 0] }
      },
      {
        name: '竞品A',
        type: 'bar',
        data: [82, 68, 72, 65, 78],
        itemStyle: { color: accent2, borderRadius: [2, 2, 0, 0] }
      },
      {
        name: '竞品B',
        type: 'bar',
        data: [55, 60, 45, 50, 62],
        itemStyle: { color: muted, borderRadius: [2, 2, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { compare.resize(); });

  // --- 横向柱状图: 引用信息源排名 ---
  var source = echarts.init(document.getElementById('chart-source'), null, { renderer: 'svg' });
  source.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    grid: { top: 5, bottom: 25, left: 85, right: 35 },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 10 }
    },
    yAxis: {
      type: 'category',
      data: ['行业论坛', '知乎', '百科', '媒体报道', '公众号', '官网'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 10 }
    },
    series: [{
      type: 'bar',
      data: [12, 18, 28, 35, 42, 56],
      itemStyle: {
        color: function(params) {
          var colors = [accent + '44', accent + '66', accent + '88', accent + 'aa', accent + 'cc', accent];
          return colors[params.dataIndex];
        },
        borderRadius: [0, 2, 2, 0]
      },
      label: {
        show: true,
        position: 'right',
        color: muted,
        fontSize: 10,
        formatter: '{c}次'
      }
    }]
  });
  window.addEventListener('resize', function() { source.resize(); });
})();
