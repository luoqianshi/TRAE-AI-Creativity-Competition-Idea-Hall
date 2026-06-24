(function() {
  'use strict';

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  function initRadar() {
    var chart = echarts.init(document.getElementById('chart-value-radar'), null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true },
      radar: {
        indicator: [
          { name: '政策价值', max: 100 },
          { name: '用户价值', max: 100 },
          { name: '商业价值', max: 100 },
          { name: '社会价值', max: 100 }
        ],
        shape: 'polygon',
        splitNumber: 4,
        axisName: { color: ink, fontSize: 14, fontWeight: 600 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: [bg2, '#fff'] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [{
          value: [92, 88, 78, 95],
          name: '平台价值评估',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 8
        }]
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  }

  function initPainBar() {
    var chart = echarts.init(document.getElementById('chart-pain-bar'), null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['学业压力', '升学焦虑', '人际矛盾', '情绪内耗', '亲子隔阂', '自我认同'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted }
      },
      series: [{
        type: 'bar',
        data: [92, 85, 78, 82, 70, 75],
        barWidth: '45%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '66' }
          ]),
          borderRadius: [6, 6, 0, 0]
        },
        label: { show: true, position: 'top', color: ink, fontWeight: 600 }
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  }

  function initGrowthLine() {
    var chart = echarts.init(document.getElementById('chart-growth-line'), null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { data: ['韧性指数', '情绪稳定性', '干预组平均分'], bottom: 0, textStyle: { color: muted } },
      grid: { left: '3%', right: '4%', bottom: '12%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['第 1 周', '第 4 周', '第 8 周', '第 12 周', '第 16 周', '第 20 周', '第 24 周'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted }
      },
      yAxis: {
        type: 'value',
        min: 40,
        max: 100,
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted }
      },
      series: [
        {
          name: '韧性指数',
          type: 'line',
          data: [55, 62, 68, 73, 78, 83, 87],
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: accent, width: 3 },
          itemStyle: { color: accent },
          areaStyle: { color: accent + '22' }
        },
        {
          name: '情绪稳定性',
          type: 'line',
          data: [52, 58, 65, 70, 75, 80, 84],
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 }
        },
        {
          name: '干预组平均分',
          type: 'line',
          data: [50, 53, 55, 57, 58, 59, 60],
          smooth: false,
          symbol: 'none',
          lineStyle: { color: muted, type: 'dashed', width: 2 }
        }
      ]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  }

  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chart-value-radar')) initRadar();
    if (document.getElementById('chart-pain-bar')) initPainBar();
    if (document.getElementById('chart-growth-line')) initGrowthLine();
  });
})();
