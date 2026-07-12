(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var green = style.getPropertyValue('--green').trim();
  var yellow = style.getPropertyValue('--yellow').trim();
  var red = style.getPropertyValue('--red').trim();

  var palette = [accent, accent2, muted, green, yellow, red, accent + '99', accent2 + '99'];

  // --- Chart: Competitor Radar ---
  var chartCompetitor = echarts.init(document.getElementById('chart-competitor'), null, { renderer: 'svg' });
  chartCompetitor.setOption({
    legend: {
      bottom: 10,
      textStyle: { color: muted, fontSize: 12 },
      itemGap: 16
    },
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    radar: {
      indicator: [
        { name: '食材录入便捷性', max: 5 },
        { name: '保质期提醒', max: 5 },
        { name: '菜谱推荐', max: 5 },
        { name: '硬件联动深度', max: 5 },
        { name: '性价比', max: 5 },
        { name: '跨品牌适配', max: 5 }
      ],
      radius: '60%',
      nameGap: 12,
      name: { textStyle: { color: ink, fontSize: 12 } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      animation: false,
      data: [
        {
          name: '海尔智家',
          value: [5, 5, 4, 5, 2, 1],
          lineStyle: { color: accent2 },
          areaStyle: { color: accent2 + '22' },
          itemStyle: { color: accent2 }
        },
        {
          name: '美的美居',
          value: [3, 4, 3, 3, 3, 1],
          lineStyle: { color: yellow },
          areaStyle: { color: yellow + '22' },
          itemStyle: { color: yellow }
        },
        {
          name: '三星 Family Hub',
          value: [5, 5, 5, 5, 1, 1],
          lineStyle: { color: blue },
          areaStyle: { color: '#3B82F6' + '22' },
          itemStyle: { color: '#3B82F6' }
        },
        {
          name: '本方案',
          value: [4, 5, 4, 2, 5, 5],
          lineStyle: { color: accent, width: 2.5 },
          areaStyle: { color: accent + '33' },
          itemStyle: { color: accent }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartCompetitor.resize(); });

  // --- Chart: Roadmap Gantt ---
  var chartRoadmap = echarts.init(document.getElementById('chart-roadmap'), null, { renderer: 'svg' });

  var phases = [
    { name: 'Phase 1\nMVP', start: 0, end: 8, color: accent },
    { name: 'Phase 2\n推荐引擎', start: 8, end: 16, color: yellow },
    { name: 'Phase 3\n个性化优化', start: 16, end: 24, color: green },
    { name: 'Phase 4\n生态扩展', start: 24, end: 32, color: accent2 }
  ];

  var tasks = [
    { phase: 0, name: '食材录入模块', start: 0, end: 4 },
    { phase: 0, name: '保质期提醒系统', start: 2, end: 6 },
    { phase: 0, name: '分区可视化', start: 4, end: 8 },
    { phase: 0, name: '面板端小程序开发', start: 0, end: 8 },
    { phase: 1, name: '推荐算法引擎', start: 8, end: 14 },
    { phase: 1, name: '菜谱数据库建设', start: 9, end: 13 },
    { phase: 1, name: '语音录入集成', start: 12, end: 16 },
    { phase: 1, name: '购物清单功能', start: 13, end: 16 },
    { phase: 2, name: '个性化推荐优化', start: 16, end: 20 },
    { phase: 2, name: '营养均衡计算', start: 17, end: 21 },
    { phase: 2, name: '多用户家庭模式', start: 19, end: 24 },
    { phase: 3, name: '跨品牌面板适配', start: 24, end: 28 },
    { phase: 3, name: '第三方菜谱源接入', start: 26, end: 30 },
    { phase: 3, name: 'IoT 联动拓展', start: 28, end: 32 }
  ];

  var seriesData = [];
  var yAxisData = [];

  tasks.forEach(function(task, idx) {
    yAxisData.push(task.name);
    seriesData.push({
      value: [task.start, idx, task.end - task.start],
      itemStyle: {
        color: phases[task.phase].color,
        borderRadius: [4, 4, 4, 4]
      }
    });
  });

  chartRoadmap.setOption({
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      formatter: function(p) {
        var task = tasks[p.dataIndex];
        return '<b>' + task.name + '</b><br/>第 ' + task.start + '-' + task.end + ' 周';
      }
    },
    grid: {
      left: 130,
      right: 40,
      top: 20,
      bottom: 50
    },
    xAxis: {
      type: 'value',
      name: '周',
      nameLocation: 'end',
      nameTextStyle: { color: muted },
      min: 0,
      max: 34,
      axisLabel: { color: muted, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      axisLabel: { color: ink, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'custom',
      renderItem: function(params, api) {
        var start = api.coord([api.value(0), api.value(1)]);
        var end = api.coord([api.value(0) + api.value(2), api.value(1)]);
        var height = api.size([0, 1])[1];
        var rectShape = echarts.graphic.clipRectByRect({
          x: start[0],
          y: start[1] - height * 0.3,
          width: end[0] - start[0],
          height: height * 0.6
        }, {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height
        });
        return rectShape && {
          type: 'rect',
          transition: ['shape'],
          shape: rectShape,
          style: api.style()
        };
      },
      encode: {
        x: [0, 2],
        y: 1
      },
      data: seriesData,
      animation: false
    }],
    markArea: {
      silent: true,
      label: { show: false }
    }
  });

  // Phase separators
  var markLineData = [];
  phases.forEach(function(p) {
    if (p.start > 0) {
      markLineData.push({ xAxis: p.start });
    }
  });
  chartRoadmap.setOption({
    series: [{
      markLine: {
        silent: true,
        lineStyle: { color: rule, type: 'solid', width: 1 },
        data: markLineData,
        symbol: 'none',
        label: { show: false }
      }
    }]
  });

  window.addEventListener('resize', function() { chartRoadmap.resize(); });

})();
