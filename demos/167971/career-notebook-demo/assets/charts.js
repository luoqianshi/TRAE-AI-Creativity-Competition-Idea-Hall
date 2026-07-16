(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg = style.getPropertyValue('--bg').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ===== Chart 1: Efficiency comparison =====
  var chartEff = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEff.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontFamily: 'InstrumentSans, sans-serif' }
    },
    legend: {
      data: ['传统分散流程', 'career notebook'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 20
    },
    grid: { left: 48, right: 24, top: 24, bottom: 48 },
    xAxis: {
      type: 'category',
      data: ['查信息', '找项目', '做项目', '写简历'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '天',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统分散流程',
        type: 'bar',
        data: [3, 7, 21, 3],
        itemStyle: {
          color: accent2,
          borderRadius: [6, 6, 0, 0]
        },
        barWidth: '28%',
        label: {
          show: true,
          position: 'top',
          color: accent2,
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'DMMono, monospace'
        }
      },
      {
        name: 'career notebook',
        type: 'bar',
        data: [0.5, 1, 11, 0.5],
        itemStyle: {
          color: accent,
          borderRadius: [6, 6, 0, 0]
        },
        barWidth: '28%',
        label: {
          show: true,
          position: 'top',
          color: accent,
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'DMMono, monospace'
        }
      }
    ]
  });
  window.addEventListener('resize', function () { chartEff.resize(); });

  // ===== Chart 2: Radar - capability before/after =====
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontFamily: 'InstrumentSans, sans-serif' }
    },
    legend: {
      data: ['项目前', '项目后'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 20
    },
    radar: {
      indicator: [
        { name: '岗位认知', max: 100 },
        { name: '数据分析', max: 100 },
        { name: '项目交付', max: 100 },
        { name: '表达包装', max: 100 },
        { name: '面试准备', max: 100 }
      ],
      center: ['50%', '48%'],
      radius: '62%',
      axisName: {
        color: ink,
        fontSize: 12,
        fontWeight: 700
      },
      splitArea: {
        areaStyle: {
          color: [bg, bg2],
          opacity: 0.6
        }
      },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [40, 30, 25, 35, 20],
            name: '项目前',
            areaStyle: { color: accent2 + '33' },
            lineStyle: { color: accent2, width: 2 },
            itemStyle: { color: accent2 },
            symbolSize: 5
          },
          {
            value: [82, 75, 78, 85, 70],
            name: '项目后',
            areaStyle: { color: accent + '33' },
            lineStyle: { color: accent, width: 2 },
            itemStyle: { color: accent },
            symbolSize: 5
          }
        ]
      }
    ]
  });
  window.addEventListener('resize', function () { chartRadar.resize(); });
})();
