// charts.js — 草木志创意提案数据可视化
(function() {
  'use strict';

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // ---- Shared tooltip ----
  function baseTooltip() {
    return {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg,
      borderColor: rule,
      borderWidth: 1,
      textStyle: { color: ink, fontSize: 13 }
    };
  }

  // =============================================
  // 1. 市场数据图表 — 用户痛点认知度
  // =============================================
  var marketChart = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  marketChart.setOption({
    tooltip: baseTooltip(),
    radar: {
      indicator: [
        { name: '植物识别需求', max: 100 },
        { name: '深度知识需求', max: 100 },
        { name: '古籍理解需求', max: 100 },
        { name: '生态认知需求', max: 100 },
        { name: '学习工具需求', max: 100 },
        { name: '社区分享需求', max: 100 }
      ],
      shape: 'circle',
      center: ['50%', '50%'],
      radius: '65%',
      axisName: {
        color: muted,
        fontSize: 11
      },
      splitArea: {
        areaStyle: {
          color: [bg2 + '66']
        }
      },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [92, 78, 85, 88, 90, 72],
        name: '用户痛点强度',
        areaStyle: {
          color: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.7,
            colorStops: [
              { offset: 0, color: accent + '55' },
              { offset: 1, color: accent + '20' }
            ]
          }
        },
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent }
      }]
    }],
    animation: false
  });
  window.addEventListener('resize', function() { marketChart.resize(); });

  // =============================================
  // 2. 评审维度评估图表
  // =============================================
  var evalChart = echarts.init(document.getElementById('chart-evaluation'), null, { renderer: 'svg' });
  evalChart.setOption({
    tooltip: baseTooltip(),
    radar: {
      indicator: [
        { name: '创意创新性', max: 100 },
        { name: '技术可行性', max: 100 },
        { name: '场景落地价值', max: 100 },
        { name: '商业发展潜力', max: 100 },
        { name: '社会公益意义', max: 100 }
      ],
      center: ['50%', '50%'],
      radius: '65%',
      axisName: {
        color: ink,
        fontSize: 12,
        fontWeight: 600
      },
      splitArea: {
        areaStyle: {
          color: [bg2 + '88']
        }
      },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [90, 85, 92, 80, 95],
        name: '草木志评分',
        areaStyle: {
          color: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.7,
            colorStops: [
              { offset: 0, color: accent2 + '55' },
              { offset: 1, color: accent2 + '20' }
            ]
          }
        },
        lineStyle: { color: accent2, width: 2 },
        itemStyle: { color: accent2 }
      }]
    }],
    animation: false
  });
  window.addEventListener('resize', function() { evalChart.resize(); });

  // =============================================
  // 3. 奖励金额可视化
  // =============================================
  var awardsChart = echarts.init(document.getElementById('chart-awards'), null, { renderer: 'svg' });
  awardsChart.setOption({
    tooltip: baseTooltip(),
    grid: {
      left: 60,
      right: 60,
      bottom: 60,
      top: 40
    },
    xAxis: {
      type: 'category',
      data: ['报名奖励\n(价值99元)', '赛道大奖\n(5万元)', '公益附加\n(5万元)', '单项最高\n(35万元)', '冠军\n(30万元)', '总奖池\n(113万元)'],
      axisLabel: {
        color: muted,
        fontSize: 11,
        interval: 0
      },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '金额 / 万元',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: {
        color: muted,
        fontSize: 11,
        formatter: function(v) { return v >= 1 ? v + '万' : v; }
      },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 0.0099, itemStyle: { color: muted + '88' } },
        { value: 5, itemStyle: { color: accent } },
        { value: 5, itemStyle: { color: accent2 } },
        { value: 35, itemStyle: { color: accent2 } },
        { value: 30, itemStyle: { color: accent } },
        { value: 113, itemStyle: { color: accent } }
      ],
      barWidth: 40,
      label: {
        show: true,
        position: 'top',
        color: ink,
        fontSize: 12,
        fontWeight: 700,
        formatter: function(p) {
          var vals = [0.0099, 5, 5, 35, 30, 113];
          var labels = ['¥99', '¥5万', '¥5万', '¥35万', '¥30万', '¥113万'];
          return labels[p.dataIndex];
        }
      },
      itemStyle: {
        borderRadius: [4, 4, 0, 0]
      }
    }],
    animation: false
  });
  window.addEventListener('resize', function() { awardsChart.resize(); });

})();