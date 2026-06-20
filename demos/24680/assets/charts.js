(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: 效率对比柱状图 ---
  var chart1 = echarts.init(
    document.getElementById('chart-efficiency'), null, { renderer: 'svg' }
  );
  chart1.setOption({
    color: [muted, accent],
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['传统方式', 'BoreAgent'],
      textStyle: { color: muted, fontSize: 12 },
      top: 5
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['检测时间\n(min)', '所需人力\n(人)', '数据准确率\n(%)', '报告生成\n(小时)'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, lineHeight: 16 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, opacity: 0.4 } }
    },
    series: [
      {
        name: '传统方式',
        type: 'bar',
        data: [55, 3, 85, 4],
        barWidth: '28%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: 'BoreAgent',
        type: 'bar',
        data: [15, 1, 98, 0.5],
        barWidth: '28%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        }
      }
    ],
    animation: false
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart 2: 多维能力雷达图 ---
  var chart2 = echarts.init(
    document.getElementById('chart-radar'), null, { renderer: 'svg' }
  );
  chart2.setOption({
    color: [muted, accent],
    tooltip: {
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['传统方式', 'BoreAgent'],
      textStyle: { color: muted, fontSize: 12 },
      top: 5
    },
    radar: {
      indicator: [
        { name: '检测速度', max: 100 },
        { name: '操作简便性', max: 100 },
        { name: '数据准确性', max: 100 },
        { name: '环境适应性', max: 100 },
        { name: '离线能力', max: 100 },
        { name: '成本效益', max: 100 }
      ],
      center: ['50%', '55%'],
      radius: '65%',
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, opacity: 0.4 } },
      splitArea: { show: false },
      axisName: { color: muted, fontSize: 11 }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [30, 25, 85, 40, 20, 50],
          name: '传统方式',
          areaStyle: { color: muted + '20' },
          lineStyle: { width: 2 }
        },
        {
          value: [90, 85, 98, 80, 100, 75],
          name: 'BoreAgent',
          areaStyle: { color: accent + '20' },
          lineStyle: { width: 2 }
        }
      ]
    }],
    animation: false
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
