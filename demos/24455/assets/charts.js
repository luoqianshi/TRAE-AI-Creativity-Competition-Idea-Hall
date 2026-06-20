// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 100小时内容分配 ---
  var chartContent = echarts.init(document.getElementById('chart-content'), null, { renderer: 'svg' });
  chartContent.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c} 小时 ({d}%)' },
    legend: { bottom: 0, textStyle: { color: muted, fontSize: 13 }, itemWidth: 14, itemHeight: 14 },
    series: [{
      type: 'pie',
      radius: ['38%', '68%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg2, borderWidth: 2 },
      label: { show: true, color: ink, fontSize: 13, formatter: '{b}\n{c}h' },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 35, name: '主线剧情', itemStyle: { color: accent } },
        { value: 25, name: '支线任务', itemStyle: { color: accent2 } },
        { value: 25, name: '经营系统', itemStyle: { color: '#E8A838' } },
        { value: 12, name: '社交系统', itemStyle: { color: '#6BC5A0' } },
        { value: 3, name: '多周目差异', itemStyle: { color: '#C084FC' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartContent.resize(); });

  // --- Chart: 核心玩法循环 ---
  var chartLoop = echarts.init(document.getElementById('chart-gameplay-loop'), null, { renderer: 'svg' });
  chartLoop.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    series: [{
      type: 'graph',
      layout: 'circular',
      circular: { rotateLabel: true },
      symbol: 'roundRect',
      symbolSize: [90, 36],
      roam: false,
      label: { show: true, color: ink, fontSize: 13, fontWeight: 600 },
      itemStyle: { color: accent, borderColor: bg2, borderWidth: 2, borderRadius: 6 },
      lineStyle: { color: rule, width: 2, curveness: 0.3 },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [0, 10],
      data: [
        { name: '接单', itemStyle: { color: accent } },
        { name: '选材', itemStyle: { color: accent2 } },
        { name: '组装', itemStyle: { color: '#E8A838' } },
        { name: '交付', itemStyle: { color: '#6BC5A0' } },
        { name: '赚钱', itemStyle: { color: '#C084FC' } },
        { name: '扩张', itemStyle: { color: '#F87171' } },
        { name: '解锁', itemStyle: { color: '#38BDF8' } }
      ],
      links: [
        { source: '接单', target: '选材' },
        { source: '选材', target: '组装' },
        { source: '组装', target: '交付' },
        { source: '交付', target: '赚钱' },
        { source: '赚钱', target: '扩张' },
        { source: '扩张', target: '解锁' },
        { source: '解锁', target: '接单' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartLoop.resize(); });

  // --- Chart: 技能树雷达图 ---
  var chartSkills = echarts.init(document.getElementById('chart-skills'), null, { renderer: 'svg' });
  chartSkills.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    radar: {
      indicator: [
        { name: '组装技术', max: 100 },
        { name: '经营管理', max: 100 },
        { name: '宣传营销', max: 100 },
        { name: '设计能力', max: 100 },
        { name: '社交能力', max: 100 },
        { name: '研发创新', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [90, 75, 60, 70, 80, 55],
          name: '匠人路线',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        },
        {
          value: [50, 95, 85, 60, 70, 40],
          name: '商业路线',
          areaStyle: { color: accent2 + '33' },
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 }
        }
      ]
    }],
    legend: { bottom: 0, textStyle: { color: muted, fontSize: 13 } }
  });
  window.addEventListener('resize', function() { chartSkills.resize(); });

  // --- Chart: 五幕时间线 ---
  var chartTimeline = echarts.init(document.getElementById('chart-timeline'), null, { renderer: 'svg' });
  chartTimeline.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    grid: { left: 120, right: 40, top: 30, bottom: 40 },
    xAxis: { type: 'value', max: 100, name: '游戏时长（小时）', nameTextStyle: { color: muted }, axisLabel: { color: muted }, axisLine: { lineStyle: { color: rule } }, splitLine: { lineStyle: { color: rule, type: 'dashed' } } },
    yAxis: { type: 'category', data: ['第五幕：结局', '第四幕：十字路口', '第三幕：名声渐起', '第二幕：小小工作室', '第一幕：打工仔的日子'], axisLabel: { color: ink, fontSize: 12 }, axisLine: { lineStyle: { color: rule } }, axisTick: { show: false } },
    series: [{
      type: 'bar',
      barWidth: 22,
      data: [
        { value: 20, itemStyle: { color: '#C084FC' } },
        { value: 25, itemStyle: { color: '#38BDF8' } },
        { value: 20, itemStyle: { color: '#6BC5A0' } },
        { value: 20, itemStyle: { color: accent2 } },
        { value: 15, itemStyle: { color: accent } }
      ],
      label: { show: true, position: 'right', color: ink, fontSize: 12, formatter: '{c}h' },
      itemStyle: { borderRadius: [0, 4, 4, 0] }
    }]
  });
  window.addEventListener('resize', function() { chartTimeline.resize(); });

  // --- Chart: 赚钱路径对比 ---
  var chartMoney = echarts.init(document.getElementById('chart-money-paths'), null, { renderer: 'svg' });
  chartMoney.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    legend: { top: 0, textStyle: { color: muted, fontSize: 12 } },
    grid: { left: 80, right: 30, top: 40, bottom: 60 },
    xAxis: { type: 'category', data: ['咖啡店', '奶茶店', '外卖骑手', '电脑维修', '视频剪辑', '编程接单', '3D打印代工'], axisLabel: { color: muted, fontSize: 11, rotate: 25 }, axisLine: { lineStyle: { color: rule } }, axisTick: { show: false } },
    yAxis: { type: 'value', name: '收入（元）', nameTextStyle: { color: muted }, axisLabel: { color: muted }, axisLine: { lineStyle: { color: rule } }, splitLine: { lineStyle: { color: rule, type: 'dashed' } } },
    series: [
      {
        name: '时薪',
        type: 'bar',
        barWidth: 18,
        data: [25, 22, 35, 60, 100, 150, 80],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '解锁门槛',
        type: 'bar',
        barWidth: 18,
        data: [0, 0, 0, 1, 2, 3, 3],
        itemStyle: { color: accent2, borderRadius: [4, 4, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { chartMoney.resize(); });
})();
