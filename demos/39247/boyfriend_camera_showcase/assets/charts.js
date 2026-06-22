(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Pain Points ---
  var chartPain = echarts.init(document.getElementById('chart-painpoints'), null, { renderer: 'svg' });
  chartPain.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true
    },
    legend: {
      data: ['学习成本', '即时效果', '操作复杂度'],
      bottom: 0,
      textStyle: { color: muted }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['小红书教程', '美图秀秀修图', '专业相机', '男友相机'],
      axisLabel: { color: ink, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      max: 10,
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '学习成本',
        type: 'bar',
        data: [7, 4, 9, 2],
        itemStyle: { color: accent },
        barWidth: '20%'
      },
      {
        name: '即时效果',
        type: 'bar',
        data: [3, 5, 8, 9],
        itemStyle: { color: accent2 },
        barWidth: '20%'
      },
      {
        name: '操作复杂度',
        type: 'bar',
        data: [5, 6, 9, 3],
        itemStyle: { color: accent3 },
        barWidth: '20%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartPain.resize(); });

  // --- Chart: Efficiency ---
  var chartEff = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEff.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['传统拍摄', '使用男友相机'],
      axisLabel: { color: ink, fontSize: 14 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 30, itemStyle: { color: muted } },
        { value: 5, itemStyle: { color: accent2 } }
      ],
      barWidth: '40%',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}分钟',
        color: ink,
        fontWeight: 700,
        fontSize: 14
      }
    }]
  });
  window.addEventListener('resize', function() { chartEff.resize(); });

  // --- Chart: Features ---
  var chartFeat = echarts.init(document.getElementById('chart-features'), null, { renderer: 'svg' });
  chartFeat.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: ink, fontSize: 12 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: bg2,
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 700
        }
      },
      data: [
        { value: 35, name: 'AI构图教练', itemStyle: { color: accent } },
        { value: 25, name: '姿势引导库', itemStyle: { color: accent2 } },
        { value: 20, name: '智能取景提示', itemStyle: { color: accent3 } },
        { value: 15, name: '光线预警系统', itemStyle: { color: accent + '99' } },
        { value: 5, name: '双人协同模式', itemStyle: { color: accent2 + '99' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartFeat.resize(); });

  // --- Chart: Tech Architecture ---
  var chartTech = echarts.init(document.getElementById('chart-tech'), null, { renderer: 'svg' });
  chartTech.setOption({
    animation: false,
    tooltip: {
      appendToBody: true
    },
    series: [{
      type: 'graph',
      layout: 'none',
      symbolSize: [120, 60],
      symbol: 'roundRect',
      roam: false,
      label: {
        show: true,
        color: ink,
        fontSize: 12,
        fontWeight: 700
      },
      edgeSymbol: ['circle', 'arrow'],
      edgeSymbolSize: [4, 8],
      data: [
        { name: '用户界面\nFlutter App', x: 200, y: 150, itemStyle: { color: bg2, borderColor: accent, borderWidth: 2 } },
        { name: '端侧AI\nTensorFlow Lite', x: 400, y: 80, itemStyle: { color: bg2, borderColor: accent2, borderWidth: 2 } },
        { name: '云端AI\n大模型服务', x: 400, y: 220, itemStyle: { color: bg2, borderColor: accent3, borderWidth: 2 } },
        { name: '多模态\n融合引擎', x: 600, y: 150, itemStyle: { color: accent, borderColor: accent, borderWidth: 2, label: { color: '#fff' } } }
      ],
      links: [
        { source: '用户界面\nFlutter App', target: '端侧AI\nTensorFlow Lite' },
        { source: '用户界面\nFlutter App', target: '云端AI\n大模型服务' },
        { source: '端侧AI\nTensorFlow Lite', target: '多模态\n融合引擎' },
        { source: '云端AI\n大模型服务', target: '多模态\n融合引擎' }
      ],
      lineStyle: {
        color: rule,
        width: 2,
        curveness: 0.2
      }
    }]
  });
  window.addEventListener('resize', function() { chartTech.resize(); });

})();