// assets/charts.js
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: 学习效率对比 (传统 vs AI 课堂笔记) ---
  var c1 = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  c1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      data: ['传统方式（分钟）', '使用 AI 课堂笔记（分钟）'],
      textStyle: { color: muted },
      bottom: 0
    },
    grid: { left: 70, right: 20, top: 30, bottom: 60 },
    xAxis: {
      type: 'category',
      data: ['听课跟记', '课后整理', '查找重点', '复习巩固', '总耗时'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '传统方式（分钟）',
        type: 'bar',
        data: [45, 60, 30, 60, 195],
        itemStyle: { color: accent2 + 'cc', borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top', color: ink, fontWeight: 600 }
      },
      {
        name: '使用 AI 课堂笔记（分钟）',
        type: 'bar',
        data: [45, 1, 2, 15, 63],
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top', color: ink, fontWeight: 600 }
      }
    ]
  });
  window.addEventListener('resize', function () { c1.resize(); });

  // --- Chart 2: 学生需求调研（虚拟问卷 N=120）---
  var c2 = echarts.init(document.getElementById('chart-needs'), null, { renderer: 'svg' });
  c2.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}%' },
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: 'var(--bg)', borderWidth: 2 },
      label: {
        color: ink,
        formatter: '{b}\n{d}%',
        fontSize: 12
      },
      data: [
        { value: 38, name: '录音太长懒得回听', itemStyle: { color: accent } },
        { value: 27, name: '上课记不全笔记', itemStyle: { color: accent2 } },
        { value: 18, name: '逐字稿没法直接复习', itemStyle: { color: accent + 'aa' } },
        { value: 11, name: '找不到重点知识', itemStyle: { color: accent2 + 'aa' } },
        { value: 6, name: '其他', itemStyle: { color: muted } }
      ]
    }]
  });
  window.addEventListener('resize', function () { c2.resize(); });

  // --- Chart 3: MVP 4 周开发节奏 ---
  var c3 = echarts.init(document.getElementById('chart-roadmap'), null, { renderer: 'svg' });
  c3.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    grid: { left: 110, right: 30, top: 20, bottom: 40 },
    xAxis: {
      type: 'value',
      max: 28,
      name: '天',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'category',
      data: ['上线灰度测试', '知识点卡片生成', '结构化笔记生成', '语音转写接入', '小程序框架搭建'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontWeight: 600 }
    },
    series: [
      {
        name: '占位',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: 'transparent' },
        data: [21, 14, 7, 3, 0]
      },
      {
        name: '开发周期',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: function (p) {
            var arr = [accent, accent2, accent, accent2, accent];
            return arr[p.dataIndex];
          },
          borderRadius: 4
        },
        label: { show: true, position: 'right', color: ink, formatter: '{c} 天' },
        data: [7, 7, 7, 4, 3]
      }
    ]
  });
  window.addEventListener('resize', function () { c3.resize(); });
})();
