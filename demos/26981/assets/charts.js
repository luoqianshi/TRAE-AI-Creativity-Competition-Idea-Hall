// 本草有方 AI · 创意方案图表
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- 图 1: 不同年龄段对中医日常调养的关注维度（雷达图）---
  var radarEl = document.getElementById('chart-age');
  if (radarEl) {
    var radar = echarts.init(radarEl, null, { renderer: 'svg' });
    radar.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true },
      legend: {
        data: ['年轻人 18-35', '中年人 36-55', '银发 56+'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 }
      },
      radar: {
        indicator: [
          { name: '熬夜 / 睡眠', max: 100 },
          { name: '久坐 / 肩颈', max: 100 },
          { name: '脾胃调理', max: 100 },
          { name: '慢病辅助', max: 100 },
          { name: '情绪压力', max: 100 },
          { name: '陪伴照护', max: 100 }
        ],
        axisName: { color: ink, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [88, 85, 60, 25, 78, 30],
            name: '年轻人 18-35',
            lineStyle: { color: accent2, width: 2 },
            itemStyle: { color: accent2 },
            areaStyle: { color: accent2 + '33' }
          },
          {
            value: [70, 75, 78, 65, 70, 50],
            name: '中年人 36-55',
            lineStyle: { color: muted, width: 2 },
            itemStyle: { color: muted },
            areaStyle: { color: muted + '22' }
          },
          {
            value: [60, 55, 80, 92, 55, 88],
            name: '银发 56+',
            lineStyle: { color: accent, width: 2 },
            itemStyle: { color: accent },
            areaStyle: { color: accent + '33' }
          }
        ]
      }]
    });
    window.addEventListener('resize', function () { radar.resize(); });
  }

  // --- 图 2: 银发群体居家健康场景中 AI 助手的价值占比（饼图）---
  var pieEl = document.getElementById('chart-elderly');
  if (pieEl) {
    var pie = echarts.init(pieEl, null, { renderer: 'svg' });
    pie.setOption({
      animation: false,
      tooltip: { trigger: 'item', formatter: '{b}: {d}%', appendToBody: true },
      legend: {
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 }
      },
      color: [accent, accent2, accent + 'aa', accent2 + 'aa', muted],
      series: [{
        type: 'pie',
        radius: ['38%', '68%'],
        center: ['50%', '46%'],
        avoidLabelOverlap: true,
        label: { color: ink, fontSize: 12, formatter: '{b}\n{d}%' },
        labelLine: { lineStyle: { color: rule } },
        data: [
          { value: 32, name: '日常调养建议' },
          { value: 22, name: '慢病饮食禁忌' },
          { value: 18, name: '子女远程关怀' },
          { value: 16, name: '名医问诊摘要' },
          { value: 12, name: '健康风险提醒' }
        ]
      }]
    });
    window.addEventListener('resize', function () { pie.resize(); });
  }
})();
