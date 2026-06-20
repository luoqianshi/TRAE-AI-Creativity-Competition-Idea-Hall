(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Efficiency Comparison ---
  var chartEl = document.getElementById('chart-compare');
  if (chartEl) {
    var chart = echarts.init(chartEl, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        appendToBody: true,
        backgroundColor: '#fff',
        borderColor: rule,
        borderWidth: 1,
        textStyle: { color: ink, fontSize: 13 }
      },
      legend: {
        data: ['传统自学', '传统一对一辅导', '智学伴 AI'],
        top: 10,
        textStyle: { color: muted, fontSize: 13 },
        itemWidth: 16,
        itemHeight: 16,
        itemGap: 24
      },
      grid: {
        left: '8%',
        right: '8%',
        bottom: '10%',
        top: '25%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['答疑即时性', '个性化程度', '学习成本\n(反向)', '知识追踪', '可扩展性', '时间灵活度'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: {
          color: muted,
          fontSize: 12,
          interval: 0,
          lineHeight: 16
        },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLine: { show: false },
        axisLabel: { color: muted, fontSize: 12 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      series: [
        {
          name: '传统自学',
          type: 'bar',
          data: [20, 15, 70, 10, 80, 90],
          itemStyle: {
            color: muted,
            borderRadius: [6, 6, 0, 0]
          },
          barWidth: '18%'
        },
        {
          name: '传统一对一辅导',
          type: 'bar',
          data: [75, 80, 20, 50, 25, 30],
          itemStyle: {
            color: accent2,
            borderRadius: [6, 6, 0, 0]
          },
          barWidth: '18%'
        },
        {
          name: '智学伴 AI',
          type: 'bar',
          data: [95, 90, 90, 85, 95, 95],
          itemStyle: {
            color: accent,
            borderRadius: [6, 6, 0, 0]
          },
          barWidth: '18%'
        }
      ]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  }
})();
