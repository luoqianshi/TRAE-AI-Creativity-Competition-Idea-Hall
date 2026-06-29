(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // === Chart: 单工位年度节水与成本节约 ===
  var chartValue = echarts.init(document.getElementById('chart-value'), null, { renderer: 'svg' });

  var months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  var waterSaved = [1.2, 1.0, 1.1, 1.3, 1.5, 1.8, 2.0, 2.1, 1.9, 1.6, 1.3, 1.1]; // 吨/月
  var costSaved = [48, 40, 44, 52, 60, 72, 80, 84, 76, 64, 52, 44]; // 元/月

  chartValue.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 12 },
      formatter: function(params) {
        var s = '<strong>' + params[0].axisValue + '</strong><br/>';
        params.forEach(function(p) {
          s += '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + p.color + ';margin-right:6px;"></span>' + p.seriesName + '：<strong>' + p.value + (p.seriesIndex === 0 ? ' 吨' : ' 元') + '</strong><br/>';
        });
        return s;
      }
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 16
    },
    grid: {
      left: 50,
      right: 50,
      top: 40,
      bottom: 30
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '节水量(吨)',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      {
        type: 'value',
        name: '节省费用(元)',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '节水量',
        type: 'bar',
        data: waterSaved,
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '66' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '节省费用',
        type: 'line',
        yAxisIndex: 1,
        data: costSaved,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: accent2, width: 2 },
        itemStyle: { color: accent2, borderWidth: 2, borderColor: '#fff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent2 + '33' },
            { offset: 1, color: accent2 + '05' }
          ])
        }
      }
    ]
  });

  window.addEventListener('resize', function() { chartValue.resize(); });
})();
