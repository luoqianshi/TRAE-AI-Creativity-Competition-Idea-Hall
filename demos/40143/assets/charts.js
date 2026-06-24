// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Competitive Radar (v2.0 - focused on stage classification) ---
  var chartCompetitive = echarts.init(document.getElementById('chart-competitive'), null, { renderer: 'svg' });
  chartCompetitive.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    radar: {
      indicator: [
        { name: '按阶段归类', max: 5 },
        { name: '找"第一次"', max: 5 },
        { name: 'AI理解照片', max: 5 },
        { name: '隐私安全', max: 5 },
        { name: '家庭共享', max: 5 },
        { name: '浏览体验', max: 5 }
      ],
      shape: 'circle',
      splitNumber: 5,
      axisName: { color: ink, fontSize: 11 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [1, 1, 2, 1, 4, 2],
          name: '亲宝宝',
          lineStyle: { color: '#E57373' },
          itemStyle: { color: '#E57373' },
          areaStyle: { color: 'rgba(229,115,115,0.1)' }
        },
        {
          value: [1, 1, 1, 1, 4, 1],
          name: '时光小屋',
          lineStyle: { color: '#4FC3F7' },
          itemStyle: { color: '#4FC3F7' },
          areaStyle: { color: 'rgba(79,195,247,0.1)' }
        },
        {
          value: [5, 5, 5, 5, 4, 5],
          name: '宝贝成长树',
          lineStyle: { color: accent, width: 2.5 },
          itemStyle: { color: accent },
          areaStyle: { color: 'rgba(74,124,89,0.15)' }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartCompetitive.resize(); });

  // --- Chart: Revenue Structure ---
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      trigger: 'item',
      formatter: '{b}: {c}万元 ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: {
        show: true,
        fontSize: 12,
        color: ink,
        formatter: '{b}\n{d}%'
      },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 420, name: '订阅收入', itemStyle: { color: accent } },
        { value: 180, name: '实物周边', itemStyle: { color: accent2 } },
        { value: 60, name: '增值服务', itemStyle: { color: '#81C784' } },
        { value: 40, name: '其他', itemStyle: { color: rule } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });
})();
