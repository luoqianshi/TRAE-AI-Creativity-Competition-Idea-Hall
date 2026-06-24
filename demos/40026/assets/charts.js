(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var chartEl = document.getElementById('chart-competitor');
  if (chartEl) {
    var chart = echarts.init(chartEl, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 13 }
      },
      legend: {
        data: ['彼此的伴', 'Nestify', '片羽集', 'DearMemory'],
        top: 10,
        textStyle: { color: muted, fontSize: 13 },
        itemWidth: 18,
        itemHeight: 12
      },
      radar: {
        indicator: [
          { name: '物品管理', max: 10 },
          { name: '回忆记录', max: 10 },
          { name: '书架隐喻', max: 10 },
          { name: '主题定制', max: 10 },
          { name: '老年友好', max: 10 },
          { name: '家庭共享', max: 10 }
        ],
        center: ['50%', '58%'],
        radius: '62%',
        axisName: {
          color: ink,
          fontSize: 13,
          fontWeight: 600
        },
        splitLine: {
          lineStyle: { color: rule, width: 1 }
        },
        splitArea: {
          areaStyle: {
            color: ['transparent', bg2, 'transparent', bg2, 'transparent']
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
            value: [9, 9, 10, 9, 9, 8],
            name: '彼此的伴',
            areaStyle: { color: accent + '40' },
            lineStyle: { color: accent, width: 2.5 },
            itemStyle: { color: accent },
            symbolSize: 7
          },
          {
            value: [8, 0, 0, 1, 3, 2],
            name: 'Nestify',
            areaStyle: { color: accent2 + '25' },
            lineStyle: { color: accent2, width: 2, type: 'dashed' },
            itemStyle: { color: accent2 },
            symbolSize: 6
          },
          {
            value: [0, 8, 0, 3, 2, 3],
            name: '片羽集',
            areaStyle: { color: muted + '15' },
            lineStyle: { color: muted, width: 2, type: 'dashed' },
            itemStyle: { color: muted },
            symbolSize: 6
          },
          {
            value: [0, 7, 0, 4, 2, 4],
            name: 'DearMemory',
            areaStyle: { color: '#D4A574' + '15' },
            lineStyle: { color: '#D4A574', width: 2, type: 'dashed' },
            itemStyle: { color: '#D4A574' },
            symbolSize: 6
          }
        ]
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  }
})();
