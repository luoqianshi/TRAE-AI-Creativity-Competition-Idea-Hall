(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var cycleEl = document.getElementById('chart-cycle');
  if (!cycleEl || typeof echarts === 'undefined') {
    return;
  }

  var cycleChart = echarts.init(cycleEl, null, { renderer: 'svg' });
  cycleChart.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      formatter: function (params) {
        var data = {
          '传统方式': '通常需要 3-5 次重复暴露后，才有机会纠正同类错误',
          '错误博物馆目标': '希望将同类错误的纠正次数缩短到 1-2 次'
        };
        var name = params[0] ? params[0].axisValue : '';
        return '<strong>' + name + '</strong><br>' + data[name];
      }
    },
    grid: {
      left: 90,
      right: 30,
      top: 24,
      bottom: 24,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 5.5,
      splitNumber: 5,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } },
      name: '暴露次数',
      nameTextStyle: { color: muted, padding: [8, 0, 0, 0] }
    },
    yAxis: {
      type: 'category',
      data: ['传统方式', '错误博物馆目标'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: ink, fontWeight: 600 }
    },
    series: [
      {
        type: 'bar',
        stack: 'range',
        silent: true,
        itemStyle: { color: 'transparent' },
        emphasis: { disabled: true },
        data: [3, 1]
      },
      {
        type: 'bar',
        stack: 'range',
        barWidth: 28,
        data: [2, 1],
        label: {
          show: true,
          position: 'inside',
          color: '#ffffff',
          fontWeight: 700,
          formatter: function (params) {
            return params.dataIndex === 0 ? '3-5 次' : '1-2 次';
          }
        },
        itemStyle: {
          borderRadius: [0, 999, 999, 0],
          color: function (params) {
            return params.dataIndex === 0 ? accent2 : accent;
          }
        }
      }
    ]
  });

  window.addEventListener('resize', function () {
    cycleChart.resize();
  });
})();
