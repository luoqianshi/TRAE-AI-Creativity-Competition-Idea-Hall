(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Pain Trend ---
  var painChartEl = document.getElementById('chart-pain-trend');
  if (painChartEl) {
    var painChart = echarts.init(painChartEl, null, { renderer: 'svg' });
    var weeks = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'];
    var painScores = [7, 6.5, 6, 5.5, 5, 4, 3.5, 3];
    var exerciseCompletion = [60, 71, 85, 71, 100, 85, 100, 85];

    painChart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 12 }
      },
      legend: {
        data: ['疼痛评分(VAS)', '锻炼完成率(%)'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 11 },
        itemWidth: 16,
        itemHeight: 8
      },
      grid: { top: 20, left: 40, right: 40, bottom: 40 },
      xAxis: {
        type: 'category',
        data: weeks,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 10 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          name: 'VAS',
          min: 0,
          max: 10,
          nameTextStyle: { color: muted, fontSize: 10 },
          axisLine: { show: false },
          axisLabel: { color: muted, fontSize: 10 },
          splitLine: { lineStyle: { color: rule, type: 'dashed' } }
        },
        {
          type: 'value',
          name: '%',
          min: 0,
          max: 100,
          nameTextStyle: { color: muted, fontSize: 10 },
          axisLine: { show: false },
          axisLabel: { color: muted, fontSize: 10 },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '疼痛评分(VAS)',
          type: 'line',
          data: painScores,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: accent2, width: 2.5 },
          itemStyle: { color: accent2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: accent2 + '33' },
                { offset: 1, color: accent2 + '05' }
              ]
            }
          }
        },
        {
          name: '锻炼完成率(%)',
          type: 'bar',
          yAxisIndex: 1,
          data: exerciseCompletion,
          barWidth: '40%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: accent },
                { offset: 1, color: accent + '66' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    });

    window.addEventListener('resize', function() { painChart.resize(); });
  }
})();
