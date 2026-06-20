// Charts for 圈词本 proposal
(function() {
  if (typeof echarts === 'undefined') return;

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Ebbinghaus forgetting curve ---
  var ebbEl = document.getElementById('chart-ebb');
  if (ebbEl) {
    var chart = echarts.init(ebbEl, null, { renderer: 'svg' });

    // Time axis (days)
    var days = [0, 0.04, 0.25, 1, 2, 4, 7, 15];
    var dayLabels = ['学习当下', '20分钟', '6小时', '1天', '2天', '4天', '7天', '15天'];

    // No-review curve (classic Ebbinghaus): 100 -> 58 -> 44 -> 33 -> 28 -> 25 -> 22 -> 18
    var noReview = [100, 58, 44, 33, 28, 25, 22, 18];

    // With reviews at 1/2/4/7/15 days; each review boosts back near 100, then decays slower
    var withReview = [100, 58, 44, 95, 92, 90, 88, 87];

    chart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        formatter: function(params) {
          var html = params[0].axisValueLabel + '<br/>';
          params.forEach(function(p) {
            html += p.marker + ' ' + p.seriesName + '：<b>' + p.value + '%</b><br/>';
          });
          return html;
        }
      },
      legend: {
        data: ['未复盘留存率', '艾宾浩斯主动复盘留存率'],
        top: 0,
        textStyle: { color: ink, fontSize: 12 }
      },
      grid: { left: 50, right: 30, top: 50, bottom: 40 },
      xAxis: {
        type: 'category',
        data: dayLabels,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { color: muted, formatter: '{value}%' },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      series: [
        {
          name: '未复盘留存率',
          type: 'line',
          data: noReview,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: muted, width: 2, type: 'dashed' },
          itemStyle: { color: muted },
          areaStyle: { color: muted + '22' }
        },
        {
          name: '艾宾浩斯主动复盘留存率',
          type: 'line',
          data: withReview,
          smooth: false,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: accent2, width: 3 },
          itemStyle: { color: accent2 },
          areaStyle: { color: accent2 + '33' },
          markPoint: {
            data: [
              { name: '复盘1', coord: ['1天', 95], value: '↑ 复盘1' },
              { name: '复盘2', coord: ['2天', 92], value: '↑ 复盘2' },
              { name: '复盘3', coord: ['4天', 90], value: '↑ 复盘3' },
              { name: '复盘4', coord: ['7天', 88], value: '↑ 复盘4' },
              { name: '复盘5', coord: ['15天', 87], value: '↑ 复盘5' }
            ],
            symbol: 'pin',
            symbolSize: 38,
            itemStyle: { color: accent },
            label: {
              color: '#fff',
              fontSize: 9,
              formatter: '{b}'
            }
          }
        }
      ]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  }
})();
