(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var danger = style.getPropertyValue('--danger').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();

  function axisStyle() {
    return {
      axisLine: { lineStyle: { color: rule } },
      axisTick: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    };
  }

  function initCapabilityChart() {
    var el = document.getElementById('chart-capability');
    if (!el) return null;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      color: [danger, accent],
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        axisPointer: { type: 'shadow' }
      },
      legend: {
        top: 0,
        textStyle: { color: muted }
      },
      grid: {
        top: 48,
        left: 8,
        right: 12,
        bottom: 8,
        containLabel: true
      },
      xAxis: Object.assign({
        type: 'value',
        max: 100,
        splitLine: { lineStyle: { color: rule } }
      }, axisStyle()),
      yAxis: Object.assign({
        type: 'category',
        data: ['覆盖范围', '问题留存', '整改追踪', '数据汇总', '跨校监管'],
        axisLabel: { color: ink }
      }, axisStyle()),
      series: [
        {
          name: '传统线下巡课',
          type: 'bar',
          barWidth: 12,
          data: [34, 28, 22, 25, 18],
          itemStyle: { borderRadius: [0, 8, 8, 0] }
        },
        {
          name: '在线督导巡课平台',
          type: 'bar',
          barWidth: 12,
          data: [88, 92, 90, 86, 84],
          itemStyle: { borderRadius: [0, 8, 8, 0] }
        }
      ]
    });
    window.addEventListener('resize', function() { chart.resize(); });
    return chart;
  }

  function initProcessChart() {
    var el = document.getElementById('chart-process');
    if (!el) return null;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      color: [accent, accent2, accent3, danger, muted],
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        formatter: function(params) {
          return params.name + '：' + params.value + '%';
        }
      },
      radar: {
        center: ['50%', '56%'],
        radius: '68%',
        splitNumber: 4,
        axisName: { color: ink, fontWeight: 700 },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule } },
        splitArea: {
          areaStyle: {
            color: [bg2, bg3]
          }
        },
        indicator: [
          { name: '直播抽查', max: 100 },
          { name: '评课打分', max: 100 },
          { name: '问题留痕', max: 100 },
          { name: '整改派发', max: 100 },
          { name: '复查归档', max: 100 },
          { name: '报表分析', max: 100 }
        ]
      },
      series: [
        {
          name: '功能覆盖',
          type: 'radar',
          data: [
            {
              value: [95, 90, 92, 88, 86, 90],
              name: '平台功能覆盖度',
              areaStyle: { color: accent + '26' },
              lineStyle: { color: accent, width: 3 },
              itemStyle: { color: accent }
            }
          ]
        }
      ]
    });
    window.addEventListener('resize', function() { chart.resize(); });
    return chart;
  }

  initCapabilityChart();
  initProcessChart();
})();
