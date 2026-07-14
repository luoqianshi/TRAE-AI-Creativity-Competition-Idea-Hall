(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var palette = [accent, accent2, accent3, muted, accent + '99', accent2 + '99', accent3 + '99'];

  // === Chart: Primary School (Pie) ===
  var chartPrimary = echarts.init(document.getElementById('chart-primary'), null, { renderer: 'svg' });
  chartPrimary.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}小时 ({d}%)'
    },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 13 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: {
        show: true,
        formatter: '{b}\n{c}h',
        fontSize: 12,
        color: ink
      },
      labelLine: { length: 15, length2: 10 },
      data: [
        { value: 2, name: '自主学习', itemStyle: { color: accent } },
        { value: 2, name: '兴趣拓展', itemStyle: { color: accent3 } },
        { value: 2, name: '户外运动', itemStyle: { color: accent2 } },
        { value: 1.5, name: '阅读', itemStyle: { color: '#8b5cf6' } },
        { value: 1.5, name: '家务/生活', itemStyle: { color: muted } },
        { value: 1, name: '自由支配', itemStyle: { color: '#f97316' } },
        { value: 14, name: '睡眠+三餐+洗漱', itemStyle: { color: bg2 } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartPrimary.resize(); });

  // === Chart: Middle School (Pie) ===
  var chartMiddle = echarts.init(document.getElementById('chart-middle'), null, { renderer: 'svg' });
  chartMiddle.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}小时 ({d}%)'
    },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 13 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: {
        show: true,
        formatter: '{b}\n{c}h',
        fontSize: 12,
        color: ink
      },
      labelLine: { length: 15, length2: 10 },
      data: [
        { value: 1.5, name: '巩固弱科', itemStyle: { color: '#ef4444' } },
        { value: 1.5, name: '预习新内容', itemStyle: { color: accent } },
        { value: 1, name: '英语/语文积累', itemStyle: { color: accent3 } },
        { value: 2, name: '拓展阅读/实践', itemStyle: { color: '#8b5cf6' } },
        { value: 1.5, name: '运动/兴趣', itemStyle: { color: accent2 } },
        { value: 1, name: '自由支配', itemStyle: { color: '#f97316' } },
        { value: 1, name: '家务/生活', itemStyle: { color: muted } },
        { value: 14.5, name: '睡眠+三餐+洗漱', itemStyle: { color: bg2 } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartMiddle.resize(); });

  // === Chart: Senior Art (Pie) ===
  var chartSeniorArt = echarts.init(document.getElementById('chart-senior-art'), null, { renderer: 'svg' });
  chartSeniorArt.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}小时 ({d}%)'
    },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 13 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: {
        show: true,
        formatter: '{b}\n{c}h',
        fontSize: 12,
        color: ink
      },
      labelLine: { length: 15, length2: 10 },
      data: [
        { value: 2, name: '历史/政治记忆', itemStyle: { color: '#8b5cf6' } },
        { value: 1.5, name: '语文/英语阅读', itemStyle: { color: accent } },
        { value: 1, name: '论述题训练', itemStyle: { color: '#ef4444' } },
        { value: 1, name: '写作练习', itemStyle: { color: accent3 } },
        { value: 1, name: '课外阅读', itemStyle: { color: accent2 } },
        { value: 0.5, name: '时政素材积累', itemStyle: { color: '#06b6d4' } },
        { value: 1, name: '运动/自由', itemStyle: { color: '#f97316' } },
        { value: 16, name: '睡眠+三餐+洗漱', itemStyle: { color: bg2 } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartSeniorArt.resize(); });

  // === Chart: Senior Science (Pie) ===
  var chartSeniorScience = echarts.init(document.getElementById('chart-senior-science'), null, { renderer: 'svg' });
  chartSeniorScience.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}小时 ({d}%)'
    },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 13 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: {
        show: true,
        formatter: '{b}\n{c}h',
        fontSize: 12,
        color: ink
      },
      labelLine: { length: 15, length2: 10 },
      data: [
        { value: 2, name: '数学攻坚', itemStyle: { color: accent } },
        { value: 1.5, name: '物理攻坚', itemStyle: { color: '#ef4444' } },
        { value: 1, name: '化学/生物', itemStyle: { color: accent3 } },
        { value: 0.5, name: '语文/英语', itemStyle: { color: accent2 } },
        { value: 0.5, name: '错题复盘', itemStyle: { color: '#8b5cf6' } },
        { value: 0.5, name: '限时训练', itemStyle: { color: '#06b6d4' } },
        { value: 1, name: '运动/自由', itemStyle: { color: '#f97316' } },
        { value: 17, name: '睡眠+三餐+洗漱', itemStyle: { color: bg2 } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartSeniorScience.resize(); });

  // === Chart: 8-Week Phases (Gantt-like Bar) ===
  var chartPhases = echarts.init(document.getElementById('chart-phases'), null, { renderer: 'svg' });
  chartPhases.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' }
    },
    grid: { left: 80, right: 40, top: 40, bottom: 40 },
    xAxis: {
      type: 'value',
      name: '暑假周数',
      nameTextStyle: { color: muted },
      min: 0, max: 8,
      axisLabel: { color: muted, formatter: '第{value}周' },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: ['收心期', '拓展期', '攻坚期', '适应期'],
      axisLabel: { color: ink, fontSize: 13 },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: [
        { value: [7, 8], itemStyle: { color: accent3 } },
        { value: [5, 7], itemStyle: { color: accent2 } },
        { value: [2, 5], itemStyle: { color: accent } },
        { value: [0, 2], itemStyle: { color: '#8b5cf6' } }
      ],
      label: {
        show: true,
        position: 'inside',
        formatter: function(p) {
          var labels = ['轻松', '适中', '高强度', '轻松'];
          return labels[p.dataIndex];
        },
        color: '#fff',
        fontSize: 13,
        fontWeight: 600
      },
      itemStyle: { borderRadius: [4, 4, 4, 4] }
    }]
  });
  window.addEventListener('resize', function() { chartPhases.resize(); });

})();
