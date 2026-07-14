// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Time Comparison (Bar Chart) ---
  var chartTime = echarts.init(document.getElementById('chart-time-compare'), null, { renderer: 'svg' });
  chartTime.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        var tip = '<div style="font-weight:600;margin-bottom:4px">' + params[0].name + '</div>';
        params.forEach(function(p) {
          tip += '<div style="display:flex;align-items:center;gap:6px">' +
            '<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + p.color + '"></span>' +
            '<span>' + p.seriesName + ': ' + p.value + ' 分钟</span></div>';
        });
        return tip;
      }
    },
    legend: {
      data: ['传统方式', '高项精讲'],
      top: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 10,
      itemGap: 20
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 48,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['单题错题分析', '章节漏洞定位', '跨题知识对比', '论文模板准备', '整体复习一轮'],
      axisLabel: { color: muted, fontSize: 11, interval: 0 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: muted, fontSize: 11, padding: [0, 0, 0, -10] },
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统方式',
        type: 'bar',
        barWidth: '28%',
        barGap: '20%',
        itemStyle: {
          color: muted,
          borderRadius: [4, 4, 0, 0]
        },
        data: [15, 45, 60, 5040, 7200]
      },
      {
        name: '高项精讲',
        type: 'bar',
        barWidth: '28%',
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        data: [2, 5, 10, 30, 4800]
      }
    ]
  });
  window.addEventListener('resize', function() { chartTime.resize(); });

  // --- Chart: Efficiency Gauge ---
  var chartEff = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });

  chartEff.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      formatter: function(params) {
        return '<b>' + params[0].name + '</b><br/>' +
          params[0].seriesName + ': ' + params[0].value + '%';
      }
    },
    series: [{
      name: '效率提升',
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      center: ['50%', '55%'],
      radius: '80%',
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 20,
          color: [
            [0.3, bg2],
            [0.7, accent + '66'],
            [1, accent]
          ]
        }
      },
      pointer: {
        itemStyle: { color: accent },
        width: 5,
        length: '60%'
      },
      axisTick: {
        distance: -20,
        length: 6,
        lineStyle: { color: rule, width: 1.5 }
      },
      splitLine: {
        distance: -24,
        length: 14,
        lineStyle: { color: rule, width: 2 }
      },
      axisLabel: {
        color: muted,
        distance: 30,
        fontSize: 11,
        formatter: function(val) { return val + '%'; }
      },
      anchor: {
        show: true,
        size: 16,
        itemStyle: { borderColor: accent, borderWidth: 2, color: '#fff' }
      },
      title: {
        show: true,
        offsetCenter: [0, '75%'],
        fontSize: 13,
        color: muted,
        fontFamily: 'WorkSans, PingFang SC, Microsoft YaHei, sans-serif'
      },
      detail: {
        valueAnimation: false,
        fontSize: 36,
        fontWeight: 700,
        offsetCenter: [0, '45%'],
        formatter: function(val) { return val + '%'; },
        color: accent,
        fontFamily: 'WorkSans, PingFang SC, Microsoft YaHei, sans-serif'
      },
      data: [{ value: 35, name: '预估整体复习效率提升' }]
    }]
  });
  window.addEventListener('resize', function() { chartEff.resize(); });

})();
