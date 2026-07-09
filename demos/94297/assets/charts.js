(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Target User Radar ---
  var chartUsers = echarts.init(document.getElementById('chart-users'), null, { renderer: 'svg' });
  chartUsers.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true
    },
    legend: {
      bottom: 0,
      data: ['高压职场人群', '情绪困扰青少年', '康复期随访群体', '普通关注大众'],
      textStyle: { color: ink, fontSize: 12 }
    },
    radar: {
      indicator: [
        { name: '需求强度', max: 100 },
        { name: '使用频率', max: 100 },
        { name: '支付意愿', max: 100 },
        { name: '隐私敏感度', max: 100 },
        { name: '技术接受度', max: 100 },
        { name: '市场占比', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: muted,
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: rule }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: [bg2, 'rgba(255,255,255,0.5)']
        }
      },
      axisLine: {
        lineStyle: { color: rule }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [90, 75, 85, 70, 80, 35],
          name: '高压职场人群',
          itemStyle: { color: accent },
          areaStyle: { color: accent + '33' },
          lineStyle: { width: 2 }
        },
        {
          value: [85, 60, 40, 90, 95, 25],
          name: '情绪困扰青少年',
          itemStyle: { color: accent2 },
          areaStyle: { color: accent2 + '33' },
          lineStyle: { width: 2 }
        },
        {
          value: [95, 85, 70, 80, 65, 15],
          name: '康复期随访群体',
          itemStyle: { color: '#B8A1D9' },
          areaStyle: { color: '#B8A1D933' },
          lineStyle: { width: 2 }
        },
        {
          value: [60, 50, 55, 60, 75, 25],
          name: '普通关注大众',
          itemStyle: { color: '#8BC4A6' },
          areaStyle: { color: '#8BC4A633' },
          lineStyle: { width: 2 }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartUsers.resize(); });
})();
