// 爱懂我创意展示页所需 ECharts 图表逻辑
// 包含：
//   1. chart-radar：四维人格雷达图样例（展示 INTP 风格的实时画像）
//   2. chart-progress：四维置信度进度条形图（展示 AI 收敛过程）
//   3. chart-funnel：用户体验漏斗对比（传统 vs 爱懂我）
// 所有颜色从 :root CSS 变量读取，与全文主题一致；动画关闭以利打印
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ===== 雷达图：四维人格画像（INTP 偏向示例） =====
  var radarEl = document.getElementById('chart-radar');
  if (radarEl) {
    var radar = echarts.init(radarEl, null, { renderer: 'svg' });
    radar.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true },
      radar: {
        indicator: [
          { name: '外向 ↔ 内倾', max: 100 },
          { name: '感觉 ↔ 直觉', max: 100 },
          { name: '思考 ↔ 情感', max: 100 },
          { name: '判断 ↔ 感知', max: 100 }
        ],
        radius: '70%',
        axisName: { color: muted, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: [bg2, '#ffffff'] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              name: '当前画像',
              value: [78, 84, 30, 72],
              symbol: 'circle',
              symbolSize: 8,
              lineStyle: { color: accent, width: 2 },
              areaStyle: { color: accent + '33' },
              itemStyle: { color: accent }
            }
          ]
        }
      ]
    });
    window.addEventListener('resize', function () { radar.resize(); });
  }

  // ===== 置信度进度（横向条） =====
  var progEl = document.getElementById('chart-progress');
  if (progEl) {
    var prog = echarts.init(progEl, null, { renderer: 'svg' });
    prog.setOption({
      animation: false,
      tooltip: { appendToBody: true },
      grid: { top: 10, bottom: 30, left: 80, right: 30 },
      xAxis: {
        type: 'value',
        max: 100,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, formatter: '{value}%' },
        splitLine: { lineStyle: { color: rule } }
      },
      yAxis: {
        type: 'category',
        data: ['判断/感知 J·P', '思考/情感 T·F', '感觉/直觉 S·N', '外向/内倾 E·I'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: ink, fontSize: 12 }
      },
      series: [
        {
          type: 'bar',
          data: [80, 92, 88, 95],
          barWidth: 14,
          itemStyle: {
            color: function (p) {
              var v = p.value;
              return v >= 80 ? accent : accent2;
            },
            borderRadius: [0, 7, 7, 0]
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            color: ink,
            fontWeight: 600
          }
        }
      ]
    });
    window.addEventListener('resize', function () { prog.resize(); });
  }

  // ===== 用户体验漏斗对比（传统 vs 爱懂我） =====
  var funnelEl = document.getElementById('chart-funnel');
  if (funnelEl) {
    var funnel = echarts.init(funnelEl, null, { renderer: 'svg' });
    funnel.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}%' },
      legend: {
        data: ['传统 93 题问卷', '爱懂我 · 对话式'],
        top: 0,
        textStyle: { color: ink }
      },
      grid: { top: 50, bottom: 30, left: 80, right: 30 },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: muted, formatter: '{value}%' },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule } }
      },
      yAxis: {
        type: 'category',
        data: ['进入页面', '完成测评', '查看完整报告', '主动分享'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: ink, fontSize: 12 }
      },
      series: [
        {
          name: '传统 93 题问卷',
          type: 'bar',
          data: [100, 41, 28, 6],
          barWidth: 12,
          itemStyle: { color: accent2 + 'cc', borderRadius: [0, 6, 6, 0] }
        },
        {
          name: '爱懂我 · 对话式',
          type: 'bar',
          data: [100, 82, 71, 38],
          barWidth: 12,
          itemStyle: { color: accent, borderRadius: [0, 6, 6, 0] }
        }
      ]
    });
    window.addEventListener('resize', function () { funnel.resize(); });
  }
})();
