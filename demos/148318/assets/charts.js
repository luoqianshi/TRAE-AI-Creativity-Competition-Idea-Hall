(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: Learning Efficiency vs Unknown Word Ratio ---
  var chart1 = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        var p = params[0];
        return '陌生词比例: ' + p.axisValue + '%<br/>学习效率: ' + p.value + '%';
      }
    },
    grid: { top: 30, right: 24, bottom: 40, left: 50 },
    xAxis: {
      type: 'category',
      name: '陌生词比例 (%)',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: muted, fontSize: 12 },
      data: ['0', '5', '10', '15', '20', '25', '30', '35', '40'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '学习效率 (%)',
      nameTextStyle: { color: muted, fontSize: 12 },
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: [20, 45, 75, 95, 80, 60, 40, 25, 15],
      lineStyle: { width: 3, color: accent },
      itemStyle: { color: accent },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: accent + '30' },
            { offset: 1, color: accent + '05' }
          ]
        }
      },
      markPoint: {
        symbol: 'pin',
        symbolSize: 50,
        data: [{
          coord: ['15', 95],
          itemStyle: { color: accent2 },
          label: {
            formatter: '最佳区间',
            fontSize: 10,
            color: '#fff',
            fontWeight: 700
          }
        }]
      },
      markArea: {
        silent: true,
        itemStyle: {
          color: accent2 + '10',
          borderColor: accent2,
          borderWidth: 1,
          borderType: 'dashed'
        },
        data: [[
          { xAxis: '12' },
          { xAxis: '18' }
        ]]
      }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: FSRS vs Ebbinghaus Retention ---
  var chart2 = echarts.init(document.getElementById('chart-retention'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        var html = '第 ' + params[0].axisValue + ' 天<br/>';
        params.forEach(function(p) {
          html += p.marker + ' ' + p.seriesName + ': ' + p.value + '%<br/>';
        });
        return html;
      }
    },
    legend: {
      data: ['FSRS 算法', '传统艾宾浩斯'],
      top: 0,
      right: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 16,
      itemHeight: 8
    },
    grid: { top: 40, right: 24, bottom: 40, left: 50 },
    xAxis: {
      type: 'category',
      name: '天数',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: muted, fontSize: 12 },
      data: ['1', '2', '4', '7', '15', '30', '60', '90'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '记忆保持率 (%)',
      nameTextStyle: { color: muted, fontSize: 12 },
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: 'FSRS 算法',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: [100, 98, 96, 94, 90, 85, 78, 72],
        lineStyle: { width: 3, color: accent },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '25' },
              { offset: 1, color: accent + '05' }
            ]
          }
        }
      },
      {
        name: '传统艾宾浩斯',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: [100, 80, 65, 50, 35, 20, 10, 5],
        lineStyle: { width: 2, color: accent2, type: 'dashed' },
        itemStyle: { color: accent2 }
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
