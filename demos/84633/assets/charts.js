(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var years = ['2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'];
  var indicatorData = [1526,3482,4113,4665,5086,5382,5294,6475,10313,8124,8922,8267,14422,11833,12124,13338];
  var planData = [3590,9146,10658,9551,5086,14946,15672,16169,19931,16841,19368,19101,43824,37126,41383,38585];
  var paymentData = [5277,18633,20230,21723,34043,59156,71426,84523,96640,95970,89457,93407,93039,95380,106929,113277];

  // --- Chart: Data Growth Trend ---
  var chartTrend = echarts.init(document.getElementById('chart-trend'), null, { renderer: 'svg' });
  chartTrend.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'cross', crossStyle: { color: muted } }
    },
    legend: {
      data: ['单位指标', '用款计划', '支付业务'],
      textStyle: { color: ink },
      bottom: 0
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: bg2 } }
    },
    series: [
      {
        name: '单位指标',
        type: 'line',
        smooth: true,
        data: indicatorData,
        itemStyle: { color: accent },
        areaStyle: { color: accent + '22' },
        lineStyle: { width: 3 }
      },
      {
        name: '用款计划',
        type: 'line',
        smooth: true,
        data: planData,
        itemStyle: { color: accent2 },
        areaStyle: { color: accent2 + '22' },
        lineStyle: { width: 3 }
      },
      {
        name: '支付业务',
        type: 'line',
        smooth: true,
        data: paymentData,
        itemStyle: { color: muted },
        areaStyle: { color: muted + '22' },
        lineStyle: { width: 3 }
      }
    ]
  });
  window.addEventListener('resize', function() { chartTrend.resize(); });

  // --- Chart: 2025 Data Composition ---
  var chartPie = echarts.init(document.getElementById('chart-pie'), null, { renderer: 'svg' });
  chartPie.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}条 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: ink }
    },
    series: [
      {
        name: '数据构成',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: bg2,
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: ink
          }
        },
        labelLine: { show: false },
        data: [
          { value: 13338, name: '单位指标', itemStyle: { color: accent } },
          { value: 38585, name: '用款计划', itemStyle: { color: accent2 } },
          { value: 113277, name: '支付业务', itemStyle: { color: muted } }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartPie.resize(); });

  // --- Chart: Payment Growth Bar ---
  var chartBar = echarts.init(document.getElementById('chart-bar'), null, { renderer: 'svg' });
  chartBar.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, rotate: 45 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: bg2 } }
    },
    series: [
      {
        name: '支付业务',
        type: 'bar',
        data: paymentData,
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '60%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartBar.resize(); });

  // --- Chart: Execution Progress Gauge ---
  var chartGauge = echarts.init(document.getElementById('chart-gauge'), null, { renderer: 'svg' });
  chartGauge.setOption({
    animation: false,
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: { color: accent },
        progress: { show: true, width: 20 },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 20, color: [[1, bg2]] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: {
          show: true,
          offsetCenter: [0, '30%'],
          fontSize: 14,
          color: muted
        },
        detail: {
          valueAnimation: false,
          fontSize: 36,
          fontWeight: 'bold',
          offsetCenter: [0, '-10%'],
          formatter: '{value}%',
          color: ink
        },
        data: [{ value: 78.5, name: '2025年度预算执行进度' }]
      }
    ]
  });
  window.addEventListener('resize', function() { chartGauge.resize(); });

  // --- Chart: Pain Points Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: '查询效率', max: 100 },
        { name: '数据追踪', max: 100 },
        { name: '统计分析', max: 100 },
        { name: '数据分发', max: 100 },
        { name: '系统性能', max: 100 },
        { name: '协同能力', max: 100 }
      ],
      axisName: { color: muted },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '现状评估',
        type: 'radar',
        data: [
          {
            value: [25, 20, 30, 15, 20, 10],
            name: '现有Excel模式',
            itemStyle: { color: accent2 },
            areaStyle: { color: accent2 + '44' },
            lineStyle: { width: 2 }
          },
          {
            value: [95, 90, 88, 92, 85, 80],
            name: '系统建设目标',
            itemStyle: { color: accent },
            areaStyle: { color: accent + '44' },
            lineStyle: { width: 2 }
          }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
