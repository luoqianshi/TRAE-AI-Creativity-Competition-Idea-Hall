// Fit Arena 参赛创意书 - 图表脚本
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: 战斗力六维雷达 ---
  var radarEl = document.getElementById('chart-radar');
  if (radarEl) {
    var radar = echarts.init(radarEl, null, { renderer: 'svg' });
    radar.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink } },
      legend: {
        data: ['第 1 周档案', '第 4 周档案'],
        textStyle: { color: muted },
        top: 0
      },
      radar: {
        indicator: [
          { name: '力量', max: 100 },
          { name: '耐力', max: 100 },
          { name: '爆发', max: 100 },
          { name: '核心', max: 100 },
          { name: '敏捷', max: 100 },
          { name: '坚持', max: 100 }
        ],
        axisName: { color: ink, fontSize: 13 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: ['transparent', 'rgba(255,255,255,0.02)'] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [55, 48, 60, 42, 50, 30],
            name: '第 1 周档案',
            lineStyle: { color: accent2, width: 2 },
            areaStyle: { color: 'rgba(41,214,197,0.15)' },
            itemStyle: { color: accent2 }
          },
          {
            value: [78, 70, 82, 75, 65, 80],
            name: '第 4 周档案',
            lineStyle: { color: accent, width: 2.5 },
            areaStyle: { color: 'rgba(255,122,24,0.25)' },
            itemStyle: { color: accent }
          }
        ]
      }]
    });
    window.addEventListener('resize', function () { radar.resize(); });
  }

  // --- Chart 2: 数据来源可信度 ---
  var sourceEl = document.getElementById('chart-source');
  if (sourceEl) {
    var srcChart = echarts.init(sourceEl, null, { renderer: 'svg' });
    var sources = [
      { name: '摄像头实时识别', score: 9.2 },
      { name: '可穿戴设备', score: 8.8 },
      { name: 'GPS / 加速度计', score: 8.0 },
      { name: '产品内过程数据', score: 7.5 },
      { name: '手机健康数据', score: 6.5 },
      { name: '用户主动输入', score: 3.0 }
    ];
    srcChart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink }
      },
      grid: { left: 130, right: 40, top: 20, bottom: 30 },
      xAxis: {
        type: 'value',
        max: 10,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted },
        splitLine: { lineStyle: { color: rule } }
      },
      yAxis: {
        type: 'category',
        data: sources.map(function (s) { return s.name; }).reverse(),
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: ink, fontSize: 13 },
        axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        data: sources.map(function (s) { return s.score; }).reverse(),
        barWidth: 18,
        itemStyle: {
          color: function (params) {
            var v = params.value;
            if (v >= 8) return accent;
            if (v >= 6) return accent2;
            return muted;
          },
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          color: ink,
          fontFamily: 'JetBrainsMono, monospace',
          formatter: '{c}'
        }
      }]
    });
    window.addEventListener('resize', function () { srcChart.resize(); });
  }

  // --- Chart 3: Fit Arena vs Keep 对比 ---
  var compareEl = document.getElementById('chart-compare');
  if (compareEl) {
    var cmpChart = echarts.init(compareEl, null, { renderer: 'svg' });
    cmpChart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink } },
      legend: {
        data: ['Fit Arena', '主流健身 App（Keep 等）'],
        textStyle: { color: muted },
        top: 0
      },
      radar: {
        indicator: [
          { name: '游戏性', max: 10 },
          { name: '社交竞技', max: 10 },
          { name: '真实身体输入', max: 10 },
          { name: 'AI 能力', max: 10 },
          { name: '内容广度', max: 10 },
          { name: '用户基础', max: 10 }
        ],
        axisName: { color: ink, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: ['transparent', 'rgba(255,255,255,0.02)'] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [9, 9, 9, 8.5, 4, 2],
            name: 'Fit Arena',
            lineStyle: { color: accent, width: 2.5 },
            areaStyle: { color: 'rgba(255,122,24,0.22)' },
            itemStyle: { color: accent }
          },
          {
            value: [3, 4, 2, 5, 9, 9.5],
            name: '主流健身 App（Keep 等）',
            lineStyle: { color: accent2, width: 2 },
            areaStyle: { color: 'rgba(41,214,197,0.15)' },
            itemStyle: { color: accent2 }
          }
        ]
      }]
    });
    window.addEventListener('resize', function () { cmpChart.resize(); });
  }
})();
