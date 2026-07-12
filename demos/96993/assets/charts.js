// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: Skill Radar (吉他自学) ---
  var radarEl = document.getElementById('chart-competency-radar');
  if (radarEl) {
    var radarChart = echarts.init(radarEl, null, { renderer: 'svg' });
    var indicators = [
      { name: '和弦转换', max: 100 },
      { name: '节奏感', max: 100 },
      { name: '指板音阶', max: 100 },
      { name: '识谱能力', max: 100 },
      { name: '拨弦技巧', max: 100 },
      { name: '乐理基础', max: 100 },
      { name: '弹唱配合', max: 100 },
      { name: '即兴演奏', max: 100 }
    ];
    radarChart.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        formatter: function(params) {
          return params.name + '<br/>' +
            params.value.map(function(v, i) { return indicators[i].name + ': ' + v; }).join('<br/>');
        }
      },
      legend: {
        data: ['目标水平', '当前水平'],
        bottom: 10,
        textStyle: { color: muted, fontSize: 13 }
      },
      radar: {
        indicator: indicators,
        shape: 'polygon',
        splitNumber: 5,
        axisName: { color: ink, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: {
          areaStyle: { color: ['transparent', bg2] }
        },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [90, 85, 88, 92, 86, 80, 90, 78],
            name: '目标水平',
            itemStyle: { color: accent },
            areaStyle: { color: accent, opacity: 0.15 },
            lineStyle: { color: accent, width: 2 }
          },
          {
            value: [55, 30, 20, 45, 50, 25, 15, 10],
            name: '当前水平',
            itemStyle: { color: accent2 },
            areaStyle: { color: accent2, opacity: 0.12 },
            lineStyle: { color: accent2, width: 2 }
          }
        ]
      }]
    });
    window.addEventListener('resize', function() { radarChart.resize(); });
  }

  // --- Chart 2: 8-Week Growth Trend ---
  var gapEl = document.getElementById('chart-gap-analysis');
  if (gapEl) {
    var gapChart = echarts.init(gapEl, null, { renderer: 'svg' });
    var weeks = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'];
    var chord   = [55, 58, 64, 70, 75, 80, 85, 88];
    var rhythm  = [30, 33, 40, 46, 52, 58, 63, 68];
    var scale   = [20, 24, 30, 35, 42, 48, 54, 60];
    var theory  = [25, 28, 34, 38, 44, 50, 56, 62];
    var singing = [15, 18, 22, 28, 34, 42, 50, 58];

    gapChart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['和弦转换', '节奏感', '指板音阶', '乐理基础', '弹唱配合'],
        bottom: 10,
        textStyle: { color: muted, fontSize: 11 },
        itemWidth: 14, itemHeight: 3
      },
      grid: {
        left: '3%', right: '4%', bottom: '16%', top: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: weeks,
        axisLabel: { color: muted, fontSize: 11 },
        axisLine: { lineStyle: { color: rule } },
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: muted, fontSize: 12 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLine: { show: false }
      },
      series: [
        {
          name: '和弦转换',
          type: 'line',
          data: chord,
          smooth: true,
          lineStyle: { color: accent, width: 2.5 },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: '节奏感',
          type: 'line',
          data: rhythm,
          smooth: true,
          lineStyle: { color: accent2, width: 2.5 },
          itemStyle: { color: accent2 },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: '指板音阶',
          type: 'line',
          data: scale,
          smooth: true,
          lineStyle: { color: '#f59e0b', width: 2 },
          itemStyle: { color: '#f59e0b' },
          symbol: 'circle',
          symbolSize: 5
        },
        {
          name: '乐理基础',
          type: 'line',
          data: theory,
          smooth: true,
          lineStyle: { color: '#a78bfa', width: 2 },
          itemStyle: { color: '#a78bfa' },
          symbol: 'circle',
          symbolSize: 5
        },
        {
          name: '弹唱配合',
          type: 'line',
          data: singing,
          smooth: true,
          lineStyle: { color: '#60a5fa', width: 2 },
          itemStyle: { color: '#60a5fa' },
          symbol: 'circle',
          symbolSize: 5
        }
      ]
    });
    window.addEventListener('resize', function() { gapChart.resize(); });
  }
})();