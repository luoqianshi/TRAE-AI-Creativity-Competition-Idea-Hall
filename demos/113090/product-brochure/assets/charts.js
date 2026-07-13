// ============================================================
// 智盈A股 - 产品推广介绍书 图表模块
// ============================================================

(function() {
  'use strict';

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var up = style.getPropertyValue('--up').trim();
  var down = style.getPropertyValue('--down').trim();
  var warn = style.getPropertyValue('--warn').trim();
  var gold = style.getPropertyValue('--gold').trim();

  var charts = [];

  // --- Chart 1: 核心分析因子权重分布 ---
  var el1 = document.getElementById('chart-factors');
  if (el1) {
    var chart1 = echarts.init(el1, null, { renderer: 'svg' });
    var factors = [
      { name: '暗盘资金流入', value: 15 },
      { name: '主力建仓分析', value: 14 },
      { name: '量比异动', value: 12 },
      { name: 'MACD信号', value: 11 },
      { name: '筹码密集度', value: 10 },
      { name: '拉升概率', value: 10 },
      { name: '北向资金', value: 8 },
      { name: '板块轮动', value: 6 },
      { name: '龙虎榜', value: 5 },
      { name: '美联储政策', value: 4 },
      { name: '中东地缘', value: 3 },
      { name: '中美关系', value: 2 }
    ];

    chart1.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        appendToBody: true,
        formatter: function(p) { return p[0].name + ': ' + p[0].value + '%'; }
      },
      grid: { left: '2%', right: '12%', top: 10, bottom: 10, containLabel: true },
      xAxis: {
        type: 'value',
        max: 20,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 10, fontFamily: 'JetBrainsMono', formatter: '{value}%' },
        splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.3 } }
      },
      yAxis: {
        type: 'category',
        data: factors.map(function(f) { return f.name; }).reverse(),
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: ink, fontSize: 11 },
        splitLine: { show: false }
      },
      series: [{
        type: 'bar',
        data: factors.map(function(f) {
          var color = accent;
          if (f.value >= 13) color = up;
          else if (f.value >= 10) color = accent;
          else if (f.value >= 5) color = accent2;
          else color = warn;
          return { value: f.value, itemStyle: { color: color, borderRadius: [0, 4, 4, 0] } };
        }).reverse(),
        barWidth: 16,
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: muted,
          fontSize: 10,
          fontFamily: 'JetBrainsMono'
        }
      }]
    });
    charts.push(chart1);
  }

  // --- Chart 2: 三策略选股准确率 ---
  var el2 = document.getElementById('chart-accuracy');
  if (el2) {
    var chart2 = echarts.init(el2, null, { renderer: 'svg' });
    var days = [];
    var shortData = [];
    var midData = [];
    var longData = [];
    for (var i = 1; i <= 30; i++) {
      days.push('D' + i);
      shortData.push(Math.round(60 + Math.random() * 25 + Math.sin(i / 3) * 5));
      midData.push(Math.round(65 + Math.random() * 20 + Math.cos(i / 4) * 5));
      longData.push(Math.round(70 + Math.random() * 15 + Math.sin(i / 5) * 4));
    }

    chart2.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true, formatter: function(params) {
        var html = params[0].axisValue + '<br/>';
        params.forEach(function(p) {
          html += p.marker + ' ' + p.seriesName + ': ' + p.value + '%<br/>';
        });
        return html;
      }},
      legend: {
        data: ['短线策略', '中线策略', '长线策略'],
        textStyle: { color: muted, fontSize: 11 },
        top: 0
      },
      grid: { left: '8%', right: '5%', top: 40, bottom: 30 },
      xAxis: {
        type: 'category',
        data: days,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 9, fontFamily: 'JetBrainsMono', interval: 4 },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 50,
        max: 100,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 10, fontFamily: 'JetBrainsMono', formatter: '{value}%' },
        splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.3 } }
      },
      series: [
        {
          name: '短线策略',
          type: 'line',
          data: shortData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: up, width: 2 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
            { offset: 0, color: 'rgba(239,68,68,0.1)' },
            { offset: 1, color: 'rgba(239,68,68,0)' }
          ]}}
        },
        {
          name: '中线策略',
          type: 'line',
          data: midData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
            { offset: 0, color: 'rgba(0,212,255,0.1)' },
            { offset: 1, color: 'rgba(0,212,255,0)' }
          ]}}
        },
        {
          name: '长线策略',
          type: 'line',
          data: longData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: gold, width: 2 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
            { offset: 0, color: 'rgba(245,158,11,0.1)' },
            { offset: 1, color: 'rgba(245,158,11,0)' }
          ]}}
        }
      ]
    });
    charts.push(chart2);
  }

  // --- Chart 3: 股票体检8维度雷达 ---
  var el3 = document.getElementById('chart-radar');
  if (el3) {
    var chart3 = echarts.init(el3, null, { renderer: 'svg' });
    chart3.setOption({
      animation: false,
      tooltip: { appendToBody: true },
      radar: {
        indicator: [
          { name: '资金面', max: 100 },
          { name: '技术面', max: 100 },
          { name: '基本面', max: 100 },
          { name: '估值', max: 100 },
          { name: '筹码', max: 100 },
          { name: '情绪', max: 100 },
          { name: '主力', max: 100 },
          { name: '风控', max: 100 }
        ],
        center: ['50%', '52%'],
        radius: '65%',
        axisName: { color: ink, fontSize: 11 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: ['rgba(0,212,255,0.02)', 'rgba(0,212,255,0.05)'] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [88, 75, 82, 68, 90, 72, 85, 78],
            name: '示例股票',
            areaStyle: { color: 'rgba(0,212,255,0.15)' },
            lineStyle: { color: accent, width: 2 },
            itemStyle: { color: accent }
          }
        ]
      }]
    });
    charts.push(chart3);
  }

  // --- Chart 4: 系统性能指标 ---
  var el4 = document.getElementById('chart-performance');
  if (el4) {
    var chart4 = echarts.init(el4, null, { renderer: 'svg' });
    chart4.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}分' },
      radar: {
        indicator: [
          { name: '加载速度', max: 100 },
          { name: '渲染性能', max: 100 },
          { name: '交互流畅度', max: 100 },
          { name: '响应式适配', max: 100 },
          { name: '代码可维护性', max: 100 },
          { name: '部署便捷性', max: 100 }
        ],
        center: ['50%', '52%'],
        radius: '65%',
        axisName: { color: ink, fontSize: 11 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: ['rgba(168,85,247,0.02)', 'rgba(168,85,247,0.05)'] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [95, 92, 88, 90, 85, 98],
            name: '性能评估',
            areaStyle: { color: 'rgba(168,85,247,0.15)' },
            lineStyle: { color: accent2, width: 2 },
            itemStyle: { color: accent2 }
          }
        ]
      }]
    });
    charts.push(chart4);
  }

  // --- Resize Handler ---
  window.addEventListener('resize', function() {
    charts.forEach(function(c) { c.resize(); });
  });

})();
