// QuantBuddy 报名创意 · 图表（支持主题切换重绘）
(function () {
  var charts = [];

  function dispose() {
    charts.forEach(function (c) { try { c.dispose(); } catch (e) {} });
    charts = [];
  }

  function build() {
    dispose();
    var style = getComputedStyle(document.documentElement);
    var accent = style.getPropertyValue('--accent').trim();
    var accent2 = style.getPropertyValue('--accent2').trim();
    var ink = style.getPropertyValue('--ink').trim();
    var muted = style.getPropertyValue('--muted').trim();
    var rule = style.getPropertyValue('--rule').trim();
    var bg2 = style.getPropertyValue('--bg2').trim();
    var pos = style.getPropertyValue('--pos').trim();

    function init(id) {
      var el = document.getElementById(id);
      if (!el) return null;
      var c = echarts.init(el, null, { renderer: 'svg' });
      charts.push(c);
      return c;
    }
    var tip = { appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink } };

    // --- HERO: 核心机制 ---
    var cM = init('chart-mech');
    if (cM) cM.setOption({
      animation: false,
      tooltip: Object.assign({ trigger: 'item' }, tip),
      grid: { left: 6, right: 6, top: 8, bottom: 4, containLabel: true },
      xAxis: { type: 'value', max: 100, show: false },
      yAxis: { type: 'category', data: ['人校验/迭代', 'AI 生成/执行'], axisLabel: { color: ink, fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{
        type: 'bar', barWidth: 26,
        data: [ { value: 30, itemStyle: { color: accent2 } }, { value: 70, itemStyle: { color: accent } } ],
        label: { show: true, position: 'insideLeft', color: '#fff', fontSize: 11, formatter: function (p) { return p.value + '%'; } },
        itemStyle: { borderRadius: 5 }
      }]
    });

    // --- 01 AI 协作链路 ---
    var c1 = init('chart-flow');
    if (c1) c1.setOption({
      animation: false,
      tooltip: Object.assign({ trigger: 'axis', axisPointer: { type: 'shadow' } }, tip),
      grid: { left: 8, right: 30, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: 'value', max: 100, axisLabel: { color: muted, formatter: '{value}%' }, splitLine: { lineStyle: { color: rule } } },
      yAxis: { type: 'category', inverse: true, data: ['① 一句话想法', '② AI 生成代码', '③ 自动回测', '④ 大白话解读', '⑤ 人校验/调优'], axisLabel: { color: ink, fontSize: 12 }, axisLine: { lineStyle: { color: rule } } },
      series: [{
        type: 'bar', barWidth: 16,
        data: [
          { value: 100, itemStyle: { color: accent } },
          { value: 88, itemStyle: { color: accent } },
          { value: 76, itemStyle: { color: accent + 'cc' } },
          { value: 64, itemStyle: { color: accent + 'aa' } },
          { value: 92, itemStyle: { color: accent2 } }
        ],
        label: { show: true, position: 'insideLeft', color: '#fff', fontSize: 11, formatter: '{b}' },
        itemStyle: { borderRadius: 5 }
      }]
    });

    // --- 01 为什么必须是 VSCode (雷达) ---
    var c2 = init('chart-vscode');
    if (c2) c2.setOption({
      animation: false,
      tooltip: Object.assign({}, tip),
      legend: { data: ['VSCode 扩展', '黑箱网页工具'], textStyle: { color: muted, fontSize: 11 }, bottom: 0 },
      radar: {
        indicator: [ { name: '代码可见', max: 10 }, { name: '可调试', max: 10 }, { name: '可迭代', max: 10 }, { name: 'Git/生态', max: 10 }, { name: '本地隐私', max: 10 } ],
        radius: '60%', center: ['50%', '46%'], axisName: { color: ink, fontSize: 10.5 },
        splitLine: { lineStyle: { color: rule } }, splitArea: { areaStyle: { color: ['transparent', rule] } }, axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [
          { value: [10, 9, 10, 9, 9], name: 'VSCode 扩展', itemStyle: { color: accent }, areaStyle: { color: accent + '44' } },
          { value: [2, 2, 3, 2, 4], name: '黑箱网页工具', itemStyle: { color: muted }, areaStyle: { color: muted + '22' } }
        ]
      }]
    });

    // --- 02 目标用户构成 ---
    var c3 = init('chart-users');
    if (c3) c3.setOption({
      animation: false,
      tooltip: Object.assign({ trigger: 'item', formatter: '{b}: {d}%' }, tip),
      legend: { bottom: 0, textStyle: { color: muted, fontSize: 11 } },
      series: [{
        type: 'pie', radius: ['40%', '68%'], center: ['50%', '44%'],
        itemStyle: { borderColor: bg2, borderWidth: 2 },
        label: { color: ink, fontSize: 11, formatter: '{b}\n{d}%' },
        data: [
          { name: '技术型个人投资者', value: 50, itemStyle: { color: accent } },
          { name: '金融/计算机学生', value: 32, itemStyle: { color: accent2 } },
          { name: '量化入门爱好者', value: 18, itemStyle: { color: muted } }
        ]
      }]
    });

    // --- 02 当前痛点强度 ---
    var c4 = init('chart-pain');
    if (c4) c4.setOption({
      animation: false,
      tooltip: Object.assign({ trigger: 'axis', axisPointer: { type: 'shadow' } }, tip),
      grid: { left: 8, right: 28, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: 'value', max: 100, axisLabel: { color: muted, formatter: '{value}' }, splitLine: { lineStyle: { color: rule } } },
      yAxis: { type: 'category', inverse: true, data: ['查数据/调库', '写回测代码', '调试纠错', '读懂指标', '框架太多易放弃'], axisLabel: { color: ink, fontSize: 11.5 }, axisLine: { lineStyle: { color: rule } } },
      series: [{
        type: 'bar', barWidth: 14,
        data: [78, 90, 72, 65, 85],
        itemStyle: { color: accent2, borderRadius: 5 },
        label: { show: true, position: 'right', color: muted, fontSize: 10, formatter: '{c}' }
      }]
    });

    // --- mockup: 策略比较 ---
    var cC = init('chart-compare');
    var xdays = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    if (cC) cC.setOption({
      animation: false,
      tooltip: Object.assign({ trigger: 'axis' }, tip),
      legend: { data: ['原始版', '优化版(RSI)'], textStyle: { color: muted, fontSize: 10.5 }, top: 0, right: 0 },
      grid: { left: 6, right: 8, top: 28, bottom: 4, containLabel: true },
      xAxis: { type: 'category', data: xdays, boundaryGap: false, axisLabel: { color: muted, fontSize: 9.5, interval: 1 }, axisLine: { lineStyle: { color: rule } } },
      yAxis: { type: 'value', axisLabel: { color: muted, fontSize: 9.5, formatter: '{value}%' }, splitLine: { lineStyle: { color: rule } } },
      series: [
        { name: '原始版', type: 'line', smooth: true, symbol: 'none', data: [0, 3, -2, 4, 7, 3, 9, 6, 11, 8, 13, 10], lineStyle: { color: muted, width: 2 } },
        { name: '优化版(RSI)', type: 'line', smooth: true, symbol: 'none', data: [0, 2, 1, 5, 8, 7, 11, 10, 13, 12, 15, 15.6], lineStyle: { color: accent, width: 2.5 }, areaStyle: { color: accent + '22' } }
      ]
    });

    // --- 03 研究效率压缩 ---
    var c5 = init('chart-time');
    if (c5) c5.setOption({
      animation: false,
      tooltip: Object.assign({ trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: function (v) { return v + ' 分钟'; } }, tip),
      legend: { data: ['从零研究', 'QuantBuddy'], textStyle: { color: muted, fontSize: 11 }, top: 0 },
      grid: { left: 6, right: 10, top: 34, bottom: 4, containLabel: true },
      xAxis: { type: 'category', data: ['查数据', '写代码', '调试', '读懂指标'], axisLabel: { color: muted }, axisLine: { lineStyle: { color: rule } } },
      yAxis: { type: 'value', name: '分钟', nameTextStyle: { color: muted }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
      series: [
        { name: '从零研究', type: 'bar', data: [60, 90, 75, 45], itemStyle: { color: muted, borderRadius: [4, 4, 0, 0] } },
        { name: 'QuantBuddy', type: 'bar', data: [2, 1, 2, 1], itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] } }
      ]
    });

    // --- 03 AI 怎么用 ---
    var c6 = init('chart-ai');
    if (c6) c6.setOption({
      animation: false,
      tooltip: Object.assign({ trigger: 'item', formatter: '{b}: {d}%' }, tip),
      legend: { bottom: 0, textStyle: { color: muted, fontSize: 10.5 } },
      series: [{
        type: 'pie', radius: ['40%', '68%'], center: ['50%', '44%'],
        itemStyle: { borderColor: bg2, borderWidth: 2 },
        label: { color: ink, fontSize: 10.5, formatter: '{b}\n{d}%' },
        data: [
          { name: '翻译成策略代码', value: 35, itemStyle: { color: accent } },
          { name: '调用数据/回测', value: 30, itemStyle: { color: accent + 'bb' } },
          { name: '解读+提示风险', value: 20, itemStyle: { color: accent2 } },
          { name: '人校验微调', value: 15, itemStyle: { color: muted } }
        ]
      }]
    });
  }

  window.addEventListener('resize', function () { charts.forEach(function (c) { c.resize(); }); });
  // 暴露给主题切换调用
  window.QBRenderCharts = build;
  build();
})();
