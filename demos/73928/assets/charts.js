// silicon-carbon-smart-manufacturing charts
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ── Chart 1: AI Engine Radar ──
  var radarEl = document.getElementById('chart-ai-radar');
  if (radarEl) {
    var radar = echarts.init(radarEl, null, { renderer: 'svg' });
    radar.setOption({
      animation: false,
      tooltip: { appendToBody: true },
      legend: {
        data: ['工艺参数推荐', '质量预测', '异常检测', '相关性分析'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 }
      },
      radar: {
        indicator: [
          { name: '数据需求量', max: 100 },
          { name: '预测精度', max: 100 },
          { name: '可解释性', max: 100 },
          { name: '实时性', max: 100 },
          { name: '实施难度', max: 100 },
          { name: '业务价值', max: 100 }
        ],
        shape: 'circle',
        splitNumber: 5,
        axisName: { color: ink, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [85, 88, 72, 60, 78, 92],
            name: '工艺参数推荐',
            lineStyle: { color: accent, width: 2 },
            areaStyle: { color: accent + '30' },
            itemStyle: { color: accent }
          },
          {
            value: [90, 85, 65, 55, 82, 90],
            name: '质量预测',
            lineStyle: { color: accent2, width: 2 },
            areaStyle: { color: accent2 + '30' },
            itemStyle: { color: accent2 }
          },
          {
            value: [70, 75, 80, 92, 55, 85],
            name: '异常检测',
            lineStyle: { color: '#10B981', width: 2 },
            areaStyle: { color: 'rgba(16,185,129,0.18)' },
            itemStyle: { color: '#10B981' }
          },
          {
            value: [80, 70, 95, 70, 45, 78],
            name: '相关性分析',
            lineStyle: { color: '#F59E0B', width: 2 },
            areaStyle: { color: 'rgba(245,158,11,0.18)' },
            itemStyle: { color: '#F59E0B' }
          }
        ]
      }]
    });
    window.addEventListener('resize', function() { radar.resize(); });
  }

  // ── Chart 2: Score Bar ──
  var barEl = document.getElementById('chart-score-bar');
  if (barEl) {
    var bar = echarts.init(barEl, null, { renderer: 'svg' });
    bar.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['当前方案', '优化后方案'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 }
      },
      grid: {
        left: 80,
        right: 40,
        top: 20,
        bottom: 48
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: muted, formatter: '{value}分' },
        splitLine: { lineStyle: { color: rule } },
        axisLine: { lineStyle: { color: rule } }
      },
      yAxis: {
        type: 'category',
        data: ['AI融合度', '完成度', '实用性', '创新性'],
        axisLabel: { color: ink, fontSize: 13 },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      series: [
        {
          name: '当前方案',
          type: 'bar',
          data: [35, 60, 55, 50],
          barWidth: 22,
          itemStyle: {
            color: muted + '55',
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: muted,
            fontSize: 12,
            formatter: '{c}分'
          }
        },
        {
          name: '优化后方案',
          type: 'bar',
          data: [85, 78, 82, 80],
          barWidth: 22,
          itemStyle: {
            color: accent,
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: accent,
            fontSize: 12,
            fontWeight: 600,
            formatter: '{c}分'
          }
        }
      ]
    });
    window.addEventListener('resize', function() { bar.resize(); });
  }
})();
