(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 需求类型分布 (Pie) ---
  var chartNeeds = echarts.init(document.getElementById('chart-needs'), null, { renderer: 'svg' });
  chartNeeds.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}%'
    },
    legend: {
      bottom: '5%',
      textStyle: { color: ink, fontSize: 13 }
    },
    color: [accent, accent2, '#E9C46A', '#457B9D', '#8A8580'],
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: bg2,
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        color: ink,
        fontSize: 12
      },
      labelLine: {
        lineStyle: { color: muted }
      },
      data: [
        { value: 32, name: '物品借用' },
        { value: 25, name: '技能求助' },
        { value: 18, name: '临时托管' },
        { value: 15, name: '闲置共享' },
        { value: 10, name: '社区活动' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartNeeds.resize(); });

  // --- Chart: 用户核心使用流程 (Sankey-ish via custom) ---
  var chartFlow = echarts.init(document.getElementById('chart-flow'), null, { renderer: 'svg' });
  chartFlow.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true
    },
    xAxis: {
      type: 'category',
      data: ['发布需求', '智能匹配', '确认互助', '完成服务', '评价反馈'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13, fontWeight: 600 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      show: false,
      max: 100
    },
    grid: { top: 30, bottom: 30, left: 40, right: 40 },
    series: [{
      type: 'bar',
      barWidth: 50,
      data: [
        { value: 100, itemStyle: { color: accent, borderRadius: [8, 8, 0, 0] } },
        { value: 85, itemStyle: { color: accent + 'cc', borderRadius: [8, 8, 0, 0] } },
        { value: 70, itemStyle: { color: accent + '99', borderRadius: [8, 8, 0, 0] } },
        { value: 65, itemStyle: { color: accent2 + 'cc', borderRadius: [8, 8, 0, 0] } },
        { value: 60, itemStyle: { color: accent2, borderRadius: [8, 8, 0, 0] } }
      ],
      label: {
        show: true,
        position: 'top',
        formatter: function(params) {
          var labels = ['100%', '85%', '70%', '65%', '60%'];
          return labels[params.dataIndex];
        },
        color: ink,
        fontSize: 12,
        fontWeight: 700
      }
    }]
  });
  window.addEventListener('resize', function() { chartFlow.resize(); });
})();
