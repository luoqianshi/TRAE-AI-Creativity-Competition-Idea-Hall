// assets/charts.js — 5 张数据图,用于「小启 · 邻里」HTML 创意产物
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();      // 暖橙
  var accent2 = style.getPropertyValue('--accent2').trim();    // 墨绿
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();

  // ====== 图 1 · 中国独居人口趋势(2018-2035) ======
  var c1 = echarts.init(document.getElementById('chart-trend'), null, { renderer: 'svg' });
  c1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true,
      valueFormatter: v => v + ' 百万' },
    grid: { top: 30, right: 20, bottom: 50, left: 50 },
    legend: { bottom: 0, textStyle: { color: ink, fontFamily: 'InstrumentSans' } },
    xAxis: {
      type: 'category',
      data: ['2018', '2020', '2022', '2024', '2026E', '2028E', '2030E', '2035E'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontFamily: 'InstrumentSans' }
    },
    yAxis: {
      type: 'value', name: '百万人',
      nameTextStyle: { color: muted, fontFamily: 'InstrumentSans' },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: ink, fontFamily: 'InstrumentSans' }
    },
    color: [accent, accent2],
    series: [
      {
        name: '独居青年(20-39 岁)', type: 'line', smooth: true,
        data: [76, 92, 110, 125, 140, 152, 162, 178],
        lineStyle: { width: 3 },
        symbol: 'circle', symbolSize: 8,
        areaStyle: { color: accent + '22' }
      },
      {
        name: '独居老人(60+ 岁)', type: 'line', smooth: true,
        data: [18, 22, 28, 36, 45, 54, 62, 78],
        lineStyle: { width: 3 },
        symbol: 'circle', symbolSize: 8,
        areaStyle: { color: accent2 + '22' }
      }
    ]
  });
  window.addEventListener('resize', function() { c1.resize(); });

  // ====== 图 2 · 互助需求热力图(需求类型 × 时段) ======
  var c2 = echarts.init(document.getElementById('chart-heatmap'), null, { renderer: 'svg' });
  var hours = ['7-9', '9-11', '11-13', '13-15', '15-17', '17-19', '19-21', '21-23'];
  var needs = ['取快递', '代买菜', '水电维修', '陪同就医', '教手机', '情感陪伴', '紧急求助'];
  // 行 × 列: 0=7-9, ..., 7=21-23
  var data = [
    // 取快递: 早晚高峰
    [0,0,3],[1,0,5],[5,0,4],[6,0,3],
    [0,1,4],[1,1,3],[5,1,3],
    [0,2,3],[1,2,3],
    // 代买菜: 早高峰
    [0,3,2],[1,3,2],[4,3,2],
    // 水电维修: 工作日白天
    [1,4,2],[2,4,3],[3,4,4],
    [1,5,2],[2,5,2],[3,5,3],
    // 陪同就医: 上午
    [1,6,3],[2,6,3],[3,6,2],
    [1,7,2],
    // 教手机: 周末上午
    [1,8,3],[2,8,3],
    // 情感陪伴: 傍晚 + 晚间
    [5,9,4],[6,9,5],[7,9,4],
    // 紧急求助: 夜间
    [6,10,3],[7,10,4]
  ];
  c2.setOption({
    animation: false,
    tooltip: { appendToBody: true,
      formatter: function(p) { return needs[p.value[1]] + ' · ' + hours[p.value[0]] + '点 · 强度 ' + p.value[2]; } },
    grid: { top: 10, right: 10, bottom: 60, left: 90 },
    xAxis: { type: 'category', data: hours, splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontFamily: 'InstrumentSans', rotate: 30 } },
    yAxis: { type: 'category', data: needs, splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontFamily: 'InstrumentSans' } },
    visualMap: {
      min: 1, max: 5, calculable: false, orient: 'horizontal',
      left: 'center', bottom: 0,
      inRange: { color: [bg3, accent2 + '88', accent] },
      textStyle: { color: muted, fontFamily: 'InstrumentSans' }
    },
    series: [{
      type: 'heatmap', data: data,
      label: { show: true, color: '#fff', fontFamily: 'GeistMono', fontSize: 11,
        formatter: function(p) { return p.value[2]; } }
    }]
  });
  window.addEventListener('resize', function() { c2.resize(); });

  // ====== 图 3 · 商业模式:收入结构 ======
  var c3 = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  c3.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true,
      formatter: '{b}: {c} 亿 ({d}%)' },
    legend: { bottom: 0, textStyle: { color: ink, fontFamily: 'InstrumentSans' } },
    color: [accent, accent2, '#C8A87A', '#6E7E8E'],
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#F7EFE0', borderWidth: 3 },
      label: { color: ink, fontFamily: 'InstrumentSans',
        formatter: '{b}\n{c} 亿' },
      data: [
        { value: 1.8, name: '社区 SaaS / 政府订单' },
        { value: 1.2, name: '保险 / 应急增值' },
        { value: 0.6, name: '商家导流 / 团购' },
        { value: 0.3, name: '个人会员' }
      ]
    }]
  });
  window.addEventListener('resize', function() { c3.resize(); });

  // ====== 图 4 · 三年关键指标 ======
  var c4 = echarts.init(document.getElementById('chart-kpi'), null, { renderer: 'svg' });
  c4.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, textStyle: { color: ink, fontFamily: 'InstrumentSans' } },
    grid: { top: 30, right: 20, bottom: 50, left: 50 },
    xAxis: {
      type: 'category', data: ['Y1', 'Y2', 'Y3'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontFamily: 'InstrumentSans' }
    },
    yAxis: [
      { type: 'value', name: '签约社区',
        nameTextStyle: { color: muted, fontFamily: 'InstrumentSans' },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: ink, fontFamily: 'InstrumentSans' } },
      { type: 'value', name: 'ARR(千万元)',
        nameTextStyle: { color: muted, fontFamily: 'InstrumentSans' },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { show: false },
        axisLabel: { color: ink, fontFamily: 'InstrumentSans' } }
    ],
    color: [accent, accent2],
    series: [
      { name: '签约社区(个)', type: 'bar', data: [50, 400, 2000],
        itemStyle: { borderRadius: [4,4,0,0] },
        label: { show: true, position: 'top', color: ink, fontFamily: 'InstrumentSans' } },
      { name: 'ARR(千万元)', type: 'bar', yAxisIndex: 1, data: [3, 18, 39],
        itemStyle: { borderRadius: [4,4,0,0] },
        label: { show: true, position: 'top', color: ink, fontFamily: 'InstrumentSans' } }
    ]
  });
  window.addEventListener('resize', function() { c4.resize(); });

  // ====== 图 5 · 竞品差异化雷达 ======
  var c5 = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  c5.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: { bottom: 0, textStyle: { color: ink, fontFamily: 'InstrumentSans' } },
    color: [accent, accent2 + 'aa', '#6E7E8Eaa'],
    radar: {
      indicator: [
        { name: '匹配智能度', max: 10 },
        { name: '隐私 / 安全', max: 10 },
        { name: '语音交互', max: 10 },
        { name: '政府 / 物业协同', max: 10 },
        { name: '老人友好度', max: 10 },
        { name: '商业可持续', max: 10 }
      ],
      shape: 'polygon', splitNumber: 5,
      axisName: { color: ink, fontFamily: 'InstrumentSans', fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: [bg3, bg2] } }
    },
    series: [{
      type: 'radar',
      data: [
        { value: [9, 10, 10, 9, 9, 8], name: '小启 · 邻里',
          lineStyle: { width: 3 }, areaStyle: { color: accent + '22' } },
        { value: [5, 6, 7, 4, 5, 6], name: '社区团购平台',
          lineStyle: { width: 2, type: 'dashed' } },
        { value: [3, 4, 5, 6, 7, 4], name: '物业服务 App',
          lineStyle: { width: 2, type: 'dashed' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { c5.resize(); });
})();
