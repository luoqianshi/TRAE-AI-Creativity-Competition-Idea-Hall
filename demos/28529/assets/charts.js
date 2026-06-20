(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();

  // --- Chart: AI Output Structure (Radar) ---
  var el = document.getElementById('chart-ai-output');
  if (el) {
    var chartAi = echarts.init(el, null, { renderer: 'svg' });
    chartAi.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true },
      radar: {
        indicator: [
          { name: '总体评分', max: 100 },
          { name: '配料解析', max: 100 },
          { name: '风险高亮', max: 100 },
          { name: '过敏原识别', max: 100 },
          { name: '特殊人群', max: 100 },
          { name: '科学依据', max: 100 }
        ],
        shape: 'polygon',
        splitNumber: 4,
        axisName: { color: muted, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [85, 92, 88, 95, 80, 90],
            name: '深度版评估',
            areaStyle: { color: accent + '33' },
            lineStyle: { color: accent, width: 2 },
            itemStyle: { color: accent }
          },
          {
            value: [70, 65, 60, 75, 50, 40],
            name: '基础版评估',
            areaStyle: { color: accent2 + '22' },
            lineStyle: { color: accent2, width: 2 },
            itemStyle: { color: accent2 }
          }
        ]
      }],
      legend: {
        bottom: 0,
        textStyle: { color: muted },
        data: ['深度版评估', '基础版评估']
      }
    });
    window.addEventListener('resize', function() { chartAi.resize(); });
  }
})();
