(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Asset Distribution (Pie) ---
  var chartAsset = echarts.init(document.getElementById('chart-asset'), null, { renderer: 'svg' });
  chartAsset.setOption({
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}张 ({d}%)'
    },
    color: [accent, accent2, '#F5A623', '#4A90D9', '#9B6BCD', '#E8734A', '#3BA57B', '#D4623A'],
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: '#FFFDF9',
        borderWidth: 3
      },
      label: {
        show: true,
        fontSize: 13,
        color: ink,
        formatter: '{b}\n{d}%'
      },
      labelLine: {
        length: 12,
        length2: 16
      },
      data: [
        { value: 5, name: '餐饮美食' },
        { value: 4, name: '出行代驾' },
        { value: 3, name: '生活服务' },
        { value: 3, name: '超市便利' },
        { value: 3, name: '休闲娱乐' },
        { value: 2, name: '医疗健康' },
        { value: 2, name: '教育培训' },
        { value: 1, name: '其他' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartAsset.resize(); });

  // --- Chart: Monthly Waste Trend (Line + Bar) ---
  var chartWaste = echarts.init(document.getElementById('chart-waste'), null, { renderer: 'svg' });
  chartWaste.setOption({
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['浪费金额', '挽回金额'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: {
      top: 20, right: 20, bottom: 40, left: 50
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '元',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '浪费金额',
        type: 'bar',
        barWidth: '35%',
        itemStyle: { color: accent + 'cc', borderRadius: [4, 4, 0, 0] },
        data: [220, 180, 260, 150, 200, 180]
      },
      {
        name: '挽回金额',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent2 + '30' },
              { offset: 1, color: accent2 + '05' }
            ]
          }
        },
        data: [0, 0, 0, 120, 180, 160]
      }
    ]
  });
  window.addEventListener('resize', function() { chartWaste.resize(); });

})();
