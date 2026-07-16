// charts.js — WorkMate Proposal Visualizations
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // ===== Chart 1: Feature Radar — WorkMate vs Competitors =====
  var radarDom = document.getElementById('chart-feature-radar');
  if (radarDom) {
    var radarChart = echarts.init(radarDom, null, { renderer: 'svg' });
    radarChart.setOption({
      animation: false,
      backgroundColor: 'transparent',
      tooltip: {
        appendToBody: true,
        trigger: 'item'
      },
      legend: {
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 },
        data: ['WorkMate', 'Notion / 飞书', 'Trello / Jira', 'Excel / 记事本']
      },
      radar: {
        center: ['50%', '48%'],
        radius: '65%',
        indicator: [
          { name: '离线能力', max: 100 },
          { name: '笔记文档', max: 100 },
          { name: '任务管理', max: 100 },
          { name: '敏捷项目', max: 100 },
          { name: '日历联动', max: 100 },
          { name: '人力调度', max: 100 },
          { name: '数据隐私', max: 100 },
          { name: '全局检索', max: 100 }
        ],
        axisName: { color: muted, fontSize: 11 },
        splitArea: {
          areaStyle: { color: ['transparent', 'transparent'] }
        },
        splitLine: { lineStyle: { color: rule } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [100, 95, 95, 90, 95, 90, 100, 95],
            name: 'WorkMate',
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: accent, width: 2 },
            areaStyle: { color: accent + '33' },
            itemStyle: { color: accent }
          },
          {
            value: [10, 90, 55, 45, 35, 10, 5, 50],
            name: 'Notion / 飞书',
            symbol: 'circle',
            symbolSize: 5,
            lineStyle: { color: muted, width: 1.5, type: 'dashed' },
            areaStyle: { color: 'transparent' },
            itemStyle: { color: muted }
          },
          {
            value: [10, 20, 85, 85, 10, 15, 5, 30],
            name: 'Trello / Jira',
            symbol: 'circle',
            symbolSize: 5,
            lineStyle: { color: accent2 + '99', width: 1.5, type: 'dashed' },
            areaStyle: { color: 'transparent' },
            itemStyle: { color: accent2 + '99' }
          },
          {
            value: [100, 30, 15, 10, 15, 20, 90, 10],
            name: 'Excel / 记事本',
            symbol: 'circle',
            symbolSize: 5,
            lineStyle: { color: '#FBBF24', width: 1.5, type: 'dashed' },
            areaStyle: { color: 'transparent' },
            itemStyle: { color: '#FBBF24' }
          }
        ]
      }]
    });
    window.addEventListener('resize', function() { radarChart.resize(); });
  }

  // ===== Chart 2: Pain Point Severity Bar Chart =====
  var painDom = document.getElementById('chart-pain-points');
  if (painDom) {
    var painChart = echarts.init(painDom, null, { renderer: 'svg' });
    painChart.setOption({
      animation: false,
      backgroundColor: 'transparent',
      tooltip: {
        appendToBody: true,
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%', right: '8%', top: '8%', bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule } }
      },
      yAxis: {
        type: 'category',
        data: [
          '隐私泄露风险',
          '功能割裂严重',
          '数据互不联动',
          '重复录入低效',
          '无一体化工具'
        ],
        axisLabel: { color: ink, fontSize: 12, fontWeight: 600 },
        axisLine: { lineStyle: { color: 'transparent' } },
        axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        barWidth: 22,
        data: [
          { value: 95, itemStyle: { color: '#FB7185' } },
          { value: 88, itemStyle: { color: '#FBBF24' } },
          { value: 92, itemStyle: { color: accent2 } },
          { value: 85, itemStyle: { color: accent } },
          { value: 97, itemStyle: { color: '#2DD4BF' } }
        ],
        label: {
          show: true,
          position: 'right',
          color: ink,
          fontSize: 12,
          fontWeight: 600,
          formatter: '{c}%'
        }
      }]
    });
    window.addEventListener('resize', function() { painChart.resize(); });
  }
})();
