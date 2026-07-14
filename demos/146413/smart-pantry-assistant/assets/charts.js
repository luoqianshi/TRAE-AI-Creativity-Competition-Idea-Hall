(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 食物浪费结构分析 (Pie) ---
  var wasteChart = echarts.init(document.getElementById('chart-waste'), null, { renderer: 'svg' });
  wasteChart.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {d}%'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted, fontSize: 13 },
      itemGap: 14
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#FEFCF9',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: ink },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' }
      },
      data: [
        { value: 35, name: '蔬菜水果', itemStyle: { color: accent2 } },
        { value: 22, name: '剩饭剩菜', itemStyle: { color: accent } },
        { value: 18, name: '肉禽蛋奶', itemStyle: { color: '#F5A623' } },
        { value: 12, name: '粮油调味', itemStyle: { color: '#7B68EE' } },
        { value: 8, name: '零食饮品', itemStyle: { color: '#FF8A80' } },
        { value: 5, name: '其他', itemStyle: { color: rule } }
      ]
    }]
  });
  window.addEventListener('resize', function() { wasteChart.resize(); });

  // --- Chart: 产品迭代计划 (Timeline Bar) ---
  var roadmapChart = echarts.init(document.getElementById('chart-roadmap'), null, { renderer: 'svg' });
  roadmapChart.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['AI拍照识别', '库存管理', '过期提醒', '菜谱推荐', '购物清单', '家庭共享', '电商对接', '数据月报'],
      axisLabel: { color: muted, fontSize: 11, rotate: 25 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [{
      type: 'bar',
      barWidth: '45%',
      data: [
        { value: 1, itemStyle: { color: accent } },
        { value: 1, itemStyle: { color: accent } },
        { value: 1, itemStyle: { color: accent } },
        { value: 2, itemStyle: { color: accent2 } },
        { value: 2, itemStyle: { color: accent2 } },
        { value: 2, itemStyle: { color: accent2 } },
        { value: 3, itemStyle: { color: '#F5A623' } },
        { value: 3, itemStyle: { color: '#F5A623' } }
      ],
      markArea: {
        silent: true,
        data: [
          [{ xAxis: 'AI拍照识别', itemStyle: { color: accent + '12' } }, { xAxis: '过期提醒' }],
          [{ xAxis: '菜谱推荐', itemStyle: { color: accent2 + '12' } }, { xAxis: '家庭共享' }],
          [{ xAxis: '电商对接', itemStyle: { color: '#F5A62315' } }, { xAxis: '数据月报' }]
        ]
      },
      label: {
        show: true,
        position: 'inside',
        formatter: function(p) {
          var phases = ['', 'MVP', '成长期', '成熟期'];
          return phases[p.value] || '';
        },
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold'
      }
    }]
  });
  window.addEventListener('resize', function() { roadmapChart.resize(); });

  // Initialize Mermaid
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose' });
  }
})();
