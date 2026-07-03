(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: User Age Distribution (Pie) ---
  var chartAge = echarts.init(document.getElementById('chart-age'), null, { renderer: 'svg' });
  chartAge.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center',
      textStyle: { color: muted, fontSize: 13 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fafaf8',
        borderWidth: 3
      },
      label: {
        show: true,
        formatter: '{b}\n{c}%',
        fontSize: 12,
        color: ink
      },
      labelLine: {
        lineStyle: { color: rule }
      },
      data: [
        { value: 42.66, name: '00后', itemStyle: { color: accent } },
        { value: 36.80, name: '90后', itemStyle: { color: accent2 } },
        { value: 16.18, name: '80后', itemStyle: { color: muted } },
        { value: 4.36, name: '其他', itemStyle: { color: rule } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartAge.resize(); });

  // --- Chart 2: Revenue Structure (Bar) ---
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: {
      top: 40,
      bottom: 60,
      left: 50,
      right: 20
    },
    xAxis: {
      type: 'category',
      data: ['增值服务\n（置顶/推广）', '交易佣金\n（高价值物品）', '社区合作\n（物业/高校）', '广告收入\n（品牌合作）', '数据服务\n（市场洞察）'],
      axisLabel: { color: muted, fontSize: 11, interval: 0 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '收入占比（%）',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      barWidth: '45%',
      data: [
        { value: 35, itemStyle: { color: accent, borderRadius: [6, 6, 0, 0] } },
        { value: 25, itemStyle: { color: accent2, borderRadius: [6, 6, 0, 0] } },
        { value: 20, itemStyle: { color: accent, borderRadius: [6, 6, 0, 0] } },
        { value: 12, itemStyle: { color: accent2, borderRadius: [6, 6, 0, 0] } },
        { value: 8, itemStyle: { color: muted, borderRadius: [6, 6, 0, 0] } }
      ],
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        fontSize: 12,
        fontWeight: 'bold',
        color: ink
      }
    }]
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });

  // --- Chart 3: Carbon Impact (Gauge + Bar combo) ---
  var chartImpact = echarts.init(document.getElementById('chart-impact'), null, { renderer: 'svg' });
  chartImpact.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: {
      top: 50,
      bottom: 60,
      left: 120,
      right: 40
    },
    xAxis: {
      type: 'value',
      name: '数值',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: [
        '闲置书籍循环利用\n（万册/年）',
        '电子产品延寿\n（万台/年）',
        '碳减排贡献\n（万吨CO2/年）',
        '用户环保参与度\n（%）'
      ],
      axisLabel: { color: ink, fontSize: 11, interval: 0 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: [
        {
          value: 850,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: accent },
                { offset: 1, color: accent2 }
              ]
            },
            borderRadius: [0, 6, 6, 0]
          }
        },
        {
          value: 320,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: accent },
                { offset: 1, color: accent2 }
              ]
            },
            borderRadius: [0, 6, 6, 0]
          }
        },
        {
          value: 150,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: accent },
                { offset: 1, color: accent2 }
              ]
            },
            borderRadius: [0, 6, 6, 0]
          }
        },
        {
          value: 78,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: accent2 },
                { offset: 1, color: accent }
              ]
            },
            borderRadius: [0, 6, 6, 0]
          }
        }
      ],
      label: {
        show: true,
        position: 'right',
        formatter: '{c}',
        fontSize: 12,
        fontWeight: 'bold',
        color: ink
      }
    }]
  });
  window.addEventListener('resize', function() { chartImpact.resize(); });

  // Initialize Mermaid
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose' });
  }
})();
