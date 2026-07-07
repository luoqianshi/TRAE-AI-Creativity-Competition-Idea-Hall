// assets/charts.js — Life Replay ECharts visualizations
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var palette = [accent, '#6366f1', '#ec4899', accent2, muted];

  // ── Pie: Weekly Time Allocation ──
  var pieChart = echarts.init(document.getElementById('chart-pie'), null, { renderer: 'svg' });
  pieChart.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}h ({d}%)' },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontFamily: 'Outfit', fontSize: 12 },
      itemGap: 16
    },
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg2, borderWidth: 2 },
      label: {
        color: ink,
        fontFamily: 'Outfit',
        fontSize: 12,
        formatter: '{b}\n{d}%'
      },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 32, name: '工作', itemStyle: { color: accent } },
        { value: 12, name: '学习', itemStyle: { color: '#6366f1' } },
        { value: 8, name: '社交', itemStyle: { color: '#ec4899' } },
        { value: 10, name: '娱乐', itemStyle: { color: accent2 } },
        { value: 6, name: '其他', itemStyle: { color: muted } }
      ]
    }]
  });
  window.addEventListener('resize', function() { pieChart.resize(); });

  // ── Line: Daily Efficiency Score ──
  var lineChart = echarts.init(document.getElementById('chart-line'), null, { renderer: 'svg' });
  lineChart.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: '#1a2236', borderColor: rule, textStyle: { color: ink, fontFamily: 'Outfit' } },
    grid: { top: 30, right: 20, bottom: 40, left: 50 },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'Outfit', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      min: 40,
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: muted, fontFamily: 'JetBrains Mono', fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '效率评分',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent, borderColor: bg2, borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '40' },
              { offset: 1, color: accent + '05' }
            ]
          }
        },
        data: [72, 68, 81, 75, 88, 55, 62]
      },
      {
        name: '目标线',
        type: 'line',
        symbol: 'none',
        lineStyle: { color: accent2, width: 1.5, type: 'dashed' },
        data: [80, 80, 80, 80, 80, 80, 80]
      }
    ]
  });
  window.addEventListener('resize', function() { lineChart.resize(); });

  // ── Heatmap: Weekly Activity Heatmap ──
  var heatChart = echarts.init(document.getElementById('chart-heatmap'), null, { renderer: 'svg' });
  var hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
               '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  var days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  var heatData = [];
  // Simulated data: [x-hour, y-day, intensity 0-10]
  var raw = [
    // Mon
    [1,0,1],[6,0,2],[7,0,4],[8,0,5],[9,0,8],[10,0,9],[11,0,7],[12,0,3],[13,0,8],[14,0,9],[15,0,8],[16,0,6],[17,0,3],[18,0,2],[19,0,5],[20,0,7],[21,0,6],[22,0,3],[23,0,1],
    // Tue
    [1,1,2],[6,1,2],[7,1,3],[8,1,4],[9,1,7],[10,1,8],[11,1,6],[12,1,3],[13,1,7],[14,1,8],[15,1,7],[16,1,5],[17,1,4],[18,1,2],[19,1,4],[20,1,6],[21,1,5],[22,1,4],[23,1,2],
    // Wed
    [7,2,5],[8,2,6],[9,2,9],[10,2,10],[11,2,8],[12,2,3],[13,2,9],[14,2,10],[15,2,9],[16,2,7],[17,2,3],[18,2,2],[19,2,6],[20,2,8],[21,2,7],[22,2,3],
    // Thu
    [6,3,2],[7,3,4],[8,3,5],[9,3,7],[10,3,8],[11,3,5],[12,3,3],[13,3,7],[14,3,8],[15,3,7],[16,3,6],[17,3,4],[18,3,2],[19,3,5],[20,3,7],[21,3,6],[22,3,4],[23,3,1],
    // Fri
    [7,4,5],[8,4,6],[9,4,9],[10,4,10],[11,4,7],[12,4,3],[13,4,8],[14,4,10],[15,4,9],[16,4,6],[17,4,3],[18,4,2],[19,4,6],[20,4,8],[21,4,7],[22,4,5],[23,4,2],
    // Sat
    [9,5,3],[10,5,4],[11,5,3],[12,5,2],[14,5,4],[15,5,5],[16,5,4],[19,5,6],[20,5,7],[21,5,8],[22,5,6],[23,5,3],
    // Sun
    [8,6,3],[9,6,4],[10,6,4],[11,6,3],[13,6,3],[14,6,5],[15,6,4],[19,6,5],[20,6,6],[21,6,7],[22,6,5],[23,6,2]
  ];

  // Fill missing cells
  days.forEach(function(_, yi) {
    hours.forEach(function(_, xi) {
      var found = raw.find(function(d) { return d[0] === xi && d[1] === yi; });
      heatData.push(found ? [xi, yi, found[2]] : [xi, yi, '-']);
    });
  });

  heatChart.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      backgroundColor: '#1a2236',
      borderColor: rule,
      textStyle: { color: ink, fontFamily: 'Outfit', fontSize: 12 },
      formatter: function(p) {
        if (p.value[2] === '-') return days[p.value[1]] + ' ' + hours[p.value[0]] + ':00 — 无活动';
        return days[p.value[1]] + ' ' + hours[p.value[0]] + ':00<br/>活动强度: <strong>' + p.value[2] + '/10</strong>';
      }
    },
    grid: { top: 30, right: 30, bottom: 50, left: 60 },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'JetBrains Mono', fontSize: 10 },
      splitArea: { show: false }
    },
    yAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontFamily: 'Outfit', fontSize: 11 },
      splitArea: { show: false }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      itemHeight: 12,
      itemWidth: 16,
      textStyle: { color: muted, fontFamily: 'Outfit', fontSize: 11 },
      inRange: { color: [bg2, '#1a3a4a', accent + '99', accent, accent2] },
      outOfRange: { color: 'transparent' }
    },
    series: [{
      type: 'heatmap',
      data: heatData,
      label: {
        show: false,
        color: ink,
        fontSize: 9,
        formatter: function(p) { return p.value[2] === '-' ? '' : p.value[2]; }
      },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.4)' }
      },
      itemStyle: { borderRadius: 3, borderColor: bg2, borderWidth: 1 }
    }]
  });
  window.addEventListener('resize', function() { heatChart.resize(); });
})();
