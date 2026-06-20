(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Needs Analysis ---
  var chart1 = echarts.init(document.getElementById('chart-needs'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['行程规划', '交通预订', '酒店预订', '景点门票', '餐饮推荐', '费用管理', '打卡分享'],
      axisLabel: { color: muted, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '需求强度',
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      data: [95, 88, 85, 82, 78, 75, 70],
      type: 'bar',
      barWidth: '50%',
      itemStyle: {
        color: function(params) {
          var colors = [accent, accent + 'dd', accent + 'bb', accent2, accent2 + 'dd', accent2 + 'bb', muted];
          return colors[params.dataIndex] || accent;
        },
        borderRadius: [4, 4, 0, 0]
      },
      label: { show: true, position: 'top', color: ink, fontSize: 12 }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: Feature Priority Matrix ---
  var chart2 = echarts.init(document.getElementById('chart-features'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    radar: {
      indicator: [
        { name: '可视化地图', max: 100 },
        { name: '智能行程', max: 100 },
        { name: '费用管理', max: 100 },
        { name: '打卡拍照', max: 100 },
        { name: '社交分享', max: 100 },
        { name: '离线使用', max: 100 }
      ],
      axisName: { color: muted, fontSize: 12 },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [95, 90, 85, 88, 82, 75],
          name: '旅游助手App',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          value: [60, 70, 65, 50, 55, 40],
          name: '传统旅游App',
          areaStyle: { color: muted + '22' },
          lineStyle: { color: muted, width: 2 },
          itemStyle: { color: muted }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });

  // --- Chart: Travel Timeline ---
  var chart3 = echarts.init(document.getElementById('chart-timeline'), null, { renderer: 'svg' });
  chart3.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: function(p) {
      return p.name + '<br/>' + p.value[2] + '分钟';
    }},
    grid: { left: '15%', right: '10%', top: '10%', bottom: '10%' },
    xAxis: {
      type: 'value',
      name: '时间（小时）',
      min: 8,
      max: 22,
      nameTextStyle: { color: muted },
      axisLabel: { color: muted, formatter: '{value}:00' },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: ['第1天', '第2天', '第3天'],
      axisLabel: { color: ink, fontSize: 13 },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        type: 'scatter',
        symbolSize: function(val) { return val[3] || 20; },
        data: [
          [9, 0, 120, 25, '出发前往机场'],
          [12, 0, 180, 30, '航班飞行'],
          [15, 0, 60, 20, '酒店入住'],
          [17, 0, 120, 25, '景点游览'],
          [20, 0, 90, 22, '晚餐'],
          [8.5, 1, 150, 28, '早餐+出发'],
          [11, 1, 180, 30, '博物馆'],
          [14.5, 1, 60, 20, '午餐'],
          [16, 1, 150, 28, '古城漫步'],
          [19, 1, 120, 25, '特色餐厅'],
          [9, 2, 180, 30, '自然景区'],
          [12.5, 2, 90, 22, '景区午餐'],
          [14.5, 2, 120, 25, '购物街区'],
          [17, 2, 60, 20, '返回酒店'],
          [19, 2, 120, 25, '告别晚餐']
        ],
        itemStyle: {
          color: function(params) {
            var colors = [accent, accent2, accent + 'cc', accent2 + 'cc', accent + 'aa'];
            return colors[params.dataIndex % colors.length];
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: function(p) { return p.data[4]; },
          color: ink,
          fontSize: 11
        }
      },
      {
        type: 'line',
        data: [
          [9, 0], [12, 0], [15, 0], [17, 0], [20, 0],
          [8.5, 1], [11, 1], [14.5, 1], [16, 1], [19, 1],
          [9, 2], [12.5, 2], [14.5, 2], [17, 2], [19, 2]
        ],
        lineStyle: { color: rule, type: 'dashed', width: 1 },
        symbol: 'none',
        silent: true
        }
      ]
    });
  window.addEventListener('resize', function() { chart3.resize(); });
})();