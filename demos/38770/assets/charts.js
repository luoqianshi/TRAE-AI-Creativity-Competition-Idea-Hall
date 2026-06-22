(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: MVP Gantt Chart ---
  var chartGantt = echarts.init(document.getElementById('chart-gantt'), null, { renderer: 'svg' });
  
  var categories = ['Week 4: 内测调优', 'Week 3: 空间记忆', 'Week 2: 核心链路', 'Week 1: 基础架构'];
  var data = [
    { name: 'Week 1: 基础架构', value: [0, 0, 1, 100], itemStyle: { color: accent } },
    { name: 'Week 2: 核心链路', value: [1, 1, 2, 100], itemStyle: { color: accent } },
    { name: 'Week 3: 空间记忆', value: [2, 2, 3, 100], itemStyle: { color: accent } },
    { name: 'Week 4: 内测调优', value: [3, 3, 4, 100], itemStyle: { color: accent } }
  ];

  // Custom render for gantt-like bars
  function renderGanttItem(params, api) {
    var categoryIndex = api.value(0);
    var start = api.coord([api.value(1), categoryIndex]);
    var end = api.coord([api.value(2), categoryIndex]);
    var height = api.size([0, 1])[1] * 0.6;
    var rectShape = echarts.graphic.clipRectByRect({
      x: start[0],
      y: start[1] - height / 2,
      width: end[0] - start[0],
      height: height
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
      style: api.style({ fill: accent, radius: 6 })
    };
  }

  chartGantt.setOption({
    animation: false,
    tooltip: {
      formatter: function(params) {
        var labels = [
          'Flutter 双端 App 基础路由与 UI 框架',
          '老人端录音 -> 大模型 API -> JSON 提取 -> 子女端展示',
          '拍照+语音+AI 绑定闭环，语音搜物功能',
          '3-5 个真实家庭灰度测试，优化方言识别与 AI 提取准确率'
        ];
        return '<strong>' + params.name + '</strong><br/>' + labels[params.value[0]];
      },
      appendToBody: true
    },
    grid: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 120
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 4,
      interval: 1,
      axisLabel: {
        formatter: function(value) {
          var weeks = ['', 'Week 1', 'Week 2', 'Week 3', 'Week 4'];
          return weeks[value] || '';
        },
        color: muted,
        fontSize: 12
      },
      splitLine: {
        show: true,
        lineStyle: { color: rule, type: 'dashed' }
      },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        color: ink,
        fontSize: 13,
        fontWeight: 600
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    series: [{
      type: 'custom',
      renderItem: renderGanttItem,
      itemStyle: {
        opacity: 0.85
      },
      encode: {
        x: [1, 2],
        y: 0
      },
      data: data
    }]
  });

  window.addEventListener('resize', function() { chartGantt.resize(); });
})();
