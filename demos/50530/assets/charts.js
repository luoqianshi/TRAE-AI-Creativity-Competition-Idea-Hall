(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--paper-ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  function safeInit(id) {
    var el = document.getElementById(id);
    if (!el || typeof echarts === 'undefined') return null;
    return echarts.init(el, null, { renderer: 'svg' });
  }

  var radar = safeInit('chart-value-radar');
  if (radar) {
    radar.setOption({
      animation: false,
      color: [accent],
      tooltip: { appendToBody: true },
      radar: {
        radius: '64%',
        center: ['50%', '55%'],
        splitNumber: 4,
        axisName: { color: ink, fontSize: 12 },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule } },
        splitArea: {
          areaStyle: {
            color: [bg2, 'transparent']
          }
        },
        indicator: [
          { name: '情绪疗愈', max: 100 },
          { name: '城市记忆', max: 100 },
          { name: '社区互助', max: 100 },
          { name: '内容种草', max: 100 },
          { name: '商业延展', max: 100 },
          { name: '女性主体', max: 100 }
        ]
      },
      series: [{
        name: '概念潜力',
        type: 'radar',
        data: [{ value: [94, 88, 82, 90, 86, 96], name: 'WanderShe' }],
        areaStyle: { color: accent + '55' },
        lineStyle: { color: accent, width: 3 },
        symbolSize: 6,
        itemStyle: { color: accent }
      }]
    });
    window.addEventListener('resize', function() { radar.resize(); });
  }

  var loop = safeInit('chart-pain-loop');
  if (loop) {
    loop.setOption({
      animation: false,
      color: [accent, accent2],
      tooltip: { appendToBody: true, trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { top: 24, left: 18, right: 18, bottom: 24, containLabel: true },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: muted },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule } }
      },
      yAxis: {
        type: 'category',
        data: ['焦虑内耗', '攻略负担', '未知恐惧', '情感代入', '行动勇气'],
        axisLabel: { color: ink },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      series: [
        {
          name: '传统旅行内容',
          type: 'bar',
          barWidth: 12,
          data: [82, 88, 76, 42, 35],
          itemStyle: { color: accent2, borderRadius: [0, 8, 8, 0] }
        },
        {
          name: 'WanderShe 转化后',
          type: 'bar',
          barWidth: 12,
          data: [38, 30, 34, 86, 90],
          itemStyle: { color: accent, borderRadius: [0, 8, 8, 0] }
        }
      ],
      legend: {
        bottom: 0,
        textStyle: { color: ink },
        itemWidth: 12,
        itemHeight: 12
      }
    });
    window.addEventListener('resize', function() { loop.resize(); });
  }
})();
