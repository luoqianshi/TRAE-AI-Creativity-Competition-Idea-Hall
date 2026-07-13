(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var green = style.getPropertyValue('--green').trim();

  // --- Chart 1: Market Sentiment Trend ---
  var chartSentiment = echarts.init(document.getElementById('chart-sentiment'), null, { renderer: 'svg' });
  chartSentiment.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['上涨家数', '下跌家数', '涨停家数', '跌停家数'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      icon: 'roundRect'
    },
    grid: { top: 20, right: 24, bottom: 40, left: 50 },
    xAxis: {
      type: 'category',
      data: ['03-17 周一', '03-18 周二', '03-19 周三', '03-20 周四', '03-21 周五', '03-23 周一'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: '涨跌家数',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11 }
      },
      {
        type: 'value',
        name: '涨停/跌停',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 }
      }
    ],
    color: [green, accent2, accent, accent2 + '88'],
    series: [
      {
        name: '上涨家数',
        type: 'bar',
        data: [2100, 1850, 1620, 1400, 980, 305],
        barWidth: '40%',
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '下跌家数',
        type: 'bar',
        data: [3200, 3450, 3680, 3900, 4320, 5172],
        barWidth: '40%',
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '涨停家数',
        type: 'line',
        yAxisIndex: 1,
        data: [85, 72, 68, 55, 48, 38],
        lineStyle: { width: 2.5 },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: accent }
      },
      {
        name: '跌停家数',
        type: 'line',
        yAxisIndex: 1,
        data: [12, 18, 25, 35, 52, 133],
        lineStyle: { width: 2.5, type: 'dashed' },
        symbol: 'diamond',
        symbolSize: 8,
        itemStyle: { color: accent2 + '88' }
      }
    ]
  });
  window.addEventListener('resize', function() { chartSentiment.resize(); });

  // --- Chart 2: Sector Distribution ---
  var chartSector = echarts.init(document.getElementById('chart-sector'), null, { renderer: 'svg' });
  chartSector.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      formatter: '{b}: {c} 家 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: muted, fontSize: 12 },
      icon: 'circle'
    },
    color: [accent, green, accent2, accent + '99', accent2 + '99', muted],
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: 'transparent',
          borderWidth: 3
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: ink
          },
          scaleSize: 8
        },
        data: [
          { value: 22, name: 'ST板块' },
          { value: 8, name: '重组/国资改革' },
          { value: 4, name: '绿色电力/光伏' },
          { value: 2, name: '机器人/人工智能' },
          { value: 1, name: '化工/周期' },
          { value: 1, name: '其他' }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartSector.resize(); });

  // --- Chart 3: High-position Stock PK ---
  var chartPK = echarts.init(document.getElementById('chart-pk'), null, { renderer: 'svg' });
  chartPK.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['晋级', '跌停'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      icon: 'roundRect'
    },
    grid: { top: 20, right: 24, bottom: 40, left: 50 },
    xAxis: {
      type: 'category',
      data: ['*ST景峰', '华电辽能', '大胜达', '深华发A', '韶能股份', '*ST春天', '*ST艾艾'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 11, rotate: 30 }
    },
    yAxis: {
      type: 'value',
      name: '板数',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    color: [green, accent2],
    series: [
      {
        name: '晋级',
        type: 'bar',
        stack: 'total',
        data: [9, 6, 4, 0, 0, 0, 0],
        barWidth: '50%',
        itemStyle: { borderRadius: [6, 6, 0, 0] },
        label: {
          show: true,
          position: 'inside',
          color: '#0b1219',
          fontWeight: 'bold',
          fontSize: 12,
          formatter: function(p) { return p.value > 0 ? p.value + '板' : ''; }
        }
      },
      {
        name: '跌停',
        type: 'bar',
        stack: 'total',
        data: [0, 0, 0, 5, 3, 5, 4],
        barWidth: '50%',
        itemStyle: { borderRadius: [6, 6, 0, 0] },
        label: {
          show: true,
          position: 'inside',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 12,
          formatter: function(p) { return p.value > 0 ? '×跌停' : ''; }
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartPK.resize(); });

})();