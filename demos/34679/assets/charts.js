(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  var tooltipStyle = {
    backgroundColor: bg,
    borderColor: rule,
    borderWidth: 1,
    textStyle: { color: ink, fontSize: 13 },
    extraCssText: 'box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); border-radius: 6px;'
  };

  // Chart 1: 用户痛点分布（饼图）
  var chart1 = echarts.init(document.getElementById('chart-painpoints'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    color: [accent, accent2, '#f59e0b', '#10b981'],
    tooltip: { trigger: 'item', ...tooltipStyle, appendToBody: true,
      formatter: '{b}<br/>占比 {d}%' },
    legend: { bottom: 0, textStyle: { color: muted, fontSize: 12 }, itemWidth: 10, itemHeight: 10 },
    series: [{
      name: '用户痛点',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: bg, borderWidth: 2, borderRadius: 4 },
      label: { color: ink, fontSize: 12, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 38, name: '信息割裂，需手动同步' },
        { value: 27, name: '缺乏智能预警与冲突检测' },
        { value: 22, name: '临时变动通知滞后' },
        { value: 13, name: '多平台切换效率低' }
      ]
    }]
  });

  // Chart 2: 效率提升对比（条形图）
  var chart2 = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'axis', ...tooltipStyle, appendToBody: true,
      axisPointer: { type: 'shadow' },
      formatter: function(p) { return p[0].name + '<br/>' + p[0].marker + '用时 ' + p[0].value + ' 分钟'; } },
    grid: { top: 30, right: 30, bottom: 30, left: 130 },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: ['传统手动整理', '使用智汇日程后'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 12, fontWeight: 600 },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 15, itemStyle: { color: muted, borderRadius: [0, 4, 4, 0] } },
        { value: 0, itemStyle: { color: accent, borderRadius: [0, 4, 4, 0] } }
      ],
      barWidth: 28,
      label: { show: true, position: 'right', color: ink, fontSize: 12, fontWeight: 600,
        formatter: function(p) { return p.value + ' min'; } }
    }]
  });

  // Chart 3: 用户群体画像（雷达图）
  var chart3 = echarts.init(document.getElementById('chart-persona'), null, { renderer: 'svg' });
  chart3.setOption({
    animation: false,
    tooltip: { ...tooltipStyle, appendToBody: true },
    radar: {
      indicator: [
        { name: '多平台日程依赖', max: 100 },
        { name: '时间敏感度', max: 100 },
        { name: '临时变动频率', max: 100 },
        { name: '通勤复杂度', max: 100 },
        { name: '提醒方式偏好', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 12, fontWeight: 600 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: [bg, bg2] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          name: '高校学生',
          value: [92, 85, 78, 70, 88],
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent, opacity: 0.18 },
          itemStyle: { color: accent }
        },
        {
          name: '职场新人',
          value: [80, 95, 88, 90, 75],
          lineStyle: { color: accent2, width: 2 },
          areaStyle: { color: accent2, opacity: 0.18 },
          itemStyle: { color: accent2 }
        }
      ]
    }],
    legend: { bottom: 0, textStyle: { color: muted, fontSize: 12 } }
  });

  // Chart 4: 系统架构流程（漏斗图）
  var chart4 = echarts.init(document.getElementById('chart-flow'), null, { renderer: 'svg' });
  chart4.setOption({
    animation: false,
    tooltip: { ...tooltipStyle, appendToBody: true,
      formatter: '{b}<br/>{c} 个模块' },
    series: [{
      type: 'funnel',
      left: '10%', right: '10%', top: 10, bottom: 10,
      width: '80%',
      min: 0, max: 100,
      sort: 'descending',
      gap: 4,
      label: { show: true, position: 'inside', color: '#fff', fontSize: 12, fontWeight: 600 },
      itemStyle: { borderColor: bg, borderWidth: 2 },
      data: [
        { value: 100, name: '多源数据接入', itemStyle: { color: accent } },
        { value: 80, name: '统一事件模型', itemStyle: { color: accent } },
        { value: 60, name: 'AI 智能处理', itemStyle: { color: accent2 } },
        { value: 40, name: '冲突检测与路径规划', itemStyle: { color: accent2 } },
        { value: 20, name: '个性化提醒输出', itemStyle: { color: '#f59e0b' } }
      ]
    }]
  });

  // Resize
  [chart1, chart2, chart3, chart4].forEach(function(c) {
    window.addEventListener('resize', function() { c.resize(); });
  });
})();
