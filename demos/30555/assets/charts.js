(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Dehydration Impact (Bar) ---
  var chartDehydration = echarts.init(document.getElementById('chart-dehydration'), null, { renderer: 'svg' });
  chartDehydration.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['注意力集中度', '短期记忆', '反应速度', '情绪稳定性', '工作效率'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      name: '下降幅度 (%)',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 25, itemStyle: { color: accent } },
        { value: 18, itemStyle: { color: accent } },
        { value: 15, itemStyle: { color: accent + 'cc' } },
        { value: 22, itemStyle: { color: accent + 'cc' } },
        { value: 20, itemStyle: { color: accent } }
      ],
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        color: ink,
        fontWeight: 'bold'
      }
    }]
  });
  window.addEventListener('resize', function() { chartDehydration.resize(); });

  // --- Chart: User Funnel (Funnel) ---
  var chartFunnel = echarts.init(document.getElementById('chart-funnel'), null, { renderer: 'svg' });
  chartFunnel.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}%'
    },
    color: [accent, accent + 'cc', accent + '99', accent + '77', accent + '55', accent + '33'],
    series: [{
      type: 'funnel',
      left: '10%',
      top: 20,
      bottom: 20,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside',
        formatter: '{b}\n{c}%',
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold'
      },
      labelLine: { show: false },
      itemStyle: { borderColor: bg2, borderWidth: 2 },
      emphasis: {
        label: { fontSize: 15 }
      },
      data: [
        { value: 100, name: '认知产品' },
        { value: 45, name: '下载安装' },
        { value: 32, name: '完成设置' },
        { value: 25, name: '首次记录' },
        { value: 18, name: '首次达标' },
        { value: 12, name: '连续21天' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartFunnel.resize(); });

  // --- Chart: Growth Projection (Line) ---
  var chartGrowth = echarts.init(document.getElementById('chart-growth'), null, { renderer: 'svg' });
  chartGrowth.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true
    },
    legend: {
      data: ['累计用户', '月活跃用户'],
      top: 0,
      textStyle: { color: ink }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['第1月', '第2月', '第3月', '第4月', '第5月', '第6月', '第7月', '第8月', '第9月', '第10月', '第11月', '第12月'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '用户数',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '累计用户',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '44' },
              { offset: 1, color: accent + '05' }
            ]
          }
        },
        data: [1000, 2500, 5000, 8500, 13000, 18000, 24000, 31000, 39000, 48000, 58000, 70000]
      },
      {
        name: '月活跃用户',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 + '44' },
              { offset: 1, color: accent2 + '05' }
            ]
          }
        },
        data: [800, 1800, 3200, 4800, 6500, 8200, 10000, 12000, 14200, 16500, 19000, 22000]
      }
    ]
  });
  window.addEventListener('resize', function() { chartGrowth.resize(); });
})();
