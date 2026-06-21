(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var red = style.getPropertyValue('--red').trim();
  var jade = style.getPropertyValue('--jade').trim();

  function chart(id) {
    var el = document.getElementById(id);
    if (!el || typeof echarts === 'undefined') return null;
    return echarts.init(el, null, { renderer: 'svg' });
  }

  var radar = chart('chart-radar');
  if (radar) {
    radar.setOption({
      animation: false,
      color: [accent, accent2],
      tooltip: { appendToBody: true },
      radar: {
        radius: '64%',
        center: ['50%', '54%'],
        axisName: { color: muted, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
        axisLine: { lineStyle: { color: rule } },
        indicator: [
          { name: 'AI Agent', max: 100 },
          { name: '古籍活化', max: 100 },
          { name: '教育意义', max: 100 },
          { name: '社会价值', max: 100 },
          { name: '创新性', max: 100 },
          { name: '用户体验', max: 100 },
          { name: '文化传承', max: 100 }
        ]
      },
      series: [{
        type: 'radar',
        data: [{
          value: [96, 95, 93, 92, 94, 91, 96],
          name: '一等奖冲刺能力',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 3 },
          itemStyle: { color: accent }
        }]
      }]
    });
    window.addEventListener('resize', function() { radar.resize(); });
  }

  var bars = chart('chart-bars');
  if (bars) {
    bars.setOption({
      animation: false,
      color: [accent, accent2, red, jade],
      tooltip: { appendToBody: true, trigger: 'axis' },
      grid: { left: 54, right: 24, top: 28, bottom: 82 },
      xAxis: {
        type: 'category',
        data: ['译文', '注释', '讲解', '背景', '字帖', '插画', '思辨', '任务'],
        axisLabel: { color: muted, interval: 0 },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: muted },
        splitLine: { lineStyle: { color: rule } }
      },
      series: [{
        name: '价值覆盖',
        type: 'bar',
        data: [94, 92, 93, 90, 88, 86, 95, 89],
        barWidth: '48%',
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: function(params) {
            var palette = [accent, accent, accent2, jade, accent, red, accent2, accent2];
            return palette[params.dataIndex];
          }
        }
      }]
    });
    window.addEventListener('resize', function() { bars.resize(); });
  }
})();