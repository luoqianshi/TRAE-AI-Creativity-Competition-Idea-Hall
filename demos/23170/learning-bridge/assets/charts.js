/* ══════════════════════════════════════
   学思桥 - ECharts 图表模块
   ══════════════════════════════════════ */

;(function () {
  'use strict';

  /* ── helpers ── */
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  const C = {
    accent:  cssVar('--accent')  || '#6c9fff',
    accent2: cssVar('--accent2') || '#ff8a65',
    accent3: cssVar('--accent3') || '#69f0ae',
    accent4: cssVar('--accent4') || '#ce93d8',
    warn:    cssVar('--warn')    || '#ffd54f',
    ink:     cssVar('--ink')     || '#e8eaed',
    muted:   cssVar('--muted')   || '#8b8fa3',
    bg:      cssVar('--bg')      || '#0f1117',
    bg2:     cssVar('--bg2')     || '#1a1d27',
    bg3:     cssVar('--bg3')     || '#242838',
    rule:    cssVar('--rule')    || '#2d3148'
  };

  function makeChart(dom) {
    return echarts.init(dom, null, { renderer: 'svg' });
  }

  const _resizeHandlers = [];
  window.addEventListener('resize', function () {
    _resizeHandlers.forEach(function (fn) { fn(); });
  });

  function autoResize(chart) {
    var fn = function () { chart.resize(); };
    _resizeHandlers.push(fn);
    return fn;
  }

  /* ═══════════════════════════════
     1. initOverviewCharts
     ═══════════════════════════════ */
  window.initOverviewCharts = function () {
    var dom = document.getElementById('chart-gap-compare');
    if (!dom) return;
    var chart = makeChart(dom);
    autoResize(chart);

    var categories = ['认知策略差距', '元认知能力差距', '逻辑推理差距', '资源管理差距', '学习动机差距'];
    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: C.bg2, borderColor: C.rule, textStyle: { color: C.ink } },
      legend: { data: ['改善难度', '投入成本', '技术可缩小程度'], textStyle: { color: C.muted }, top: 10 },
      grid: { left: 120, right: 30, top: 50, bottom: 30 },
      xAxis: { type: 'value', max: 100, axisLine: { lineStyle: { color: C.rule } }, axisLabel: { color: C.muted }, splitLine: { lineStyle: { color: C.rule, opacity: 0.3 } } },
      yAxis: { type: 'category', data: categories, axisLine: { lineStyle: { color: C.rule } }, axisLabel: { color: C.ink } },
      series: [
        { name: '改善难度', type: 'bar', data: [72, 58, 65, 45, 52], itemStyle: { color: C.accent2 }, barWidth: 14, barGap: '30%' },
        { name: '投入成本', type: 'bar', data: [60, 50, 55, 38, 44], itemStyle: { color: C.warn }, barWidth: 14 },
        { name: '技术可缩小程度', type: 'bar', data: [80, 70, 62, 55, 40], itemStyle: { color: C.accent3 }, barWidth: 14 }
      ]
    });
  };

  /* ═══════════════════════════════
     2. initPaperCharts(paper)
     ═══════════════════════════════ */
  window.initPaperCharts = function (paper) {
    /* ── Pie ── */
    var pieDom = document.getElementById('chart-error-pie');
    if (pieDom) {
      var pieChart = makeChart(pieDom);
      autoResize(pieChart);

      var ERROR_LABELS = {
        knowledge:'知识缺失', misread:'审题失误', confusion:'思路混乱',
        mechanical:'机械运算', careless:'粗心大意', concept:'概念模糊', time:'时间不足'
      };
      var pieColors = [C.accent, C.accent2, C.accent3, C.accent4, C.warn, '#e8eaed', '#8b8fa3'];
      var pieData = Object.entries(paper.errors)
        .filter(function (e) { return e[1] > 0; })
        .map(function (e, i) { return { name: ERROR_LABELS[e[0]] || e[0], value: e[1], itemStyle: { color: pieColors[i % pieColors.length] } }; });

      pieChart.setOption({
        animation: false,
        tooltip: { trigger: 'item', appendToBody: true, backgroundColor: C.bg2, borderColor: C.rule, textStyle: { color: C.ink }, formatter: '{b}: {c} ({d}%)' },
        series: [{
          type: 'pie', radius: ['40%', '70%'], center: ['50%', '55%'],
          label: { color: C.muted, fontSize: 11 },
          labelLine: { lineStyle: { color: C.rule } },
          data: pieData
        }]
      });
    }

    /* ── Heatmap ── */
    var heatDom = document.getElementById('chart-knowledge-heat');
    if (heatDom) {
      var heatChart = makeChart(heatDom);
      autoResize(heatChart);

      // Simulated knowledge points with mastery levels
      var subjects = ['函数', '方程', '几何', '概率', '向量', '数列', '三角', '不等式'];
      var dims = ['理解', '应用', '综合'];
      var heatData = [];
      var baseSeed = paper.score;
      for (var i = 0; i < subjects.length; i++) {
        for (var j = 0; j < dims.length; j++) {
          var val = Math.max(10, Math.min(100, baseSeed - 10 + Math.floor(Math.random() * 30) - j * 12));
          heatData.push([i, j, val]);
        }
      }

      heatChart.setOption({
        animation: false,
        tooltip: {
          appendToBody: true, backgroundColor: C.bg2, borderColor: C.rule, textStyle: { color: C.ink },
          formatter: function (p) { return subjects[p.data[0]] + ' · ' + dims[p.data[1]] + ': ' + p.data[2] + '%'; }
        },
        grid: { left: 70, right: 40, top: 10, bottom: 40 },
        xAxis: { type: 'category', data: subjects, axisLabel: { color: C.muted, fontSize: 10 }, axisLine: { lineStyle: { color: C.rule } } },
        yAxis: { type: 'category', data: dims, axisLabel: { color: C.muted, fontSize: 11 }, axisLine: { lineStyle: { color: C.rule } } },
        visualMap: { min: 10, max: 100, orient: 'vertical', right: 0, top: 'center', itemHeight: 120, textStyle: { color: C.muted, fontSize: 10 }, inRange: { color: [C.accent2, C.warn, C.accent3] } },
        series: [{
          type: 'heatmap', data: heatData,
          label: { show: true, color: C.ink, fontSize: 10, formatter: function (p) { return p.data[2]; } },
          itemStyle: { borderColor: C.bg2, borderWidth: 2 }
        }]
      });
    }
  };

  /* ═══════════════════════════════
     3. initDiagnosisRadar(scores)
     ═══════════════════════════════ */
  window.initDiagnosisRadar = function (scores) {
    var dom = document.getElementById('chart-radar');
    if (!dom || !scores) return;
    var chart = makeChart(dom);
    autoResize(chart);

    var indicators = [
      { name: '认知策略', max: 100 },
      { name: '元认知能力', max: 100 },
      { name: '逻辑推理', max: 100 },
      { name: '资源管理', max: 100 },
      { name: '学习动机', max: 100 }
    ];

    chart.setOption({
      animation: false,
      tooltip: { appendToBody: true, backgroundColor: C.bg2, borderColor: C.rule, textStyle: { color: C.ink } },
      radar: {
        indicator: indicators,
        shape: 'polygon',
        splitNumber: 4,
        axisName: { color: C.ink, fontSize: 12 },
        splitLine: { lineStyle: { color: C.rule } },
        splitArea: { areaStyle: { color: ['transparent'] } },
        axisLine: { lineStyle: { color: C.rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [scores.cognition, scores.metacognition, scores.logic, scores.resource, scores.motivation],
            name: '问卷诊断',
            lineStyle: { color: C.accent, width: 2 },
            areaStyle: { color: C.accent, opacity: 0.2 },
            itemStyle: { color: C.accent },
            symbol: 'circle', symbolSize: 6
          }
        ]
      }]
    });
  };

  /* ═══════════════════════════════
     4. initMethodCharts
     ═══════════════════════════════ */
  window.initMethodCharts = function () {
    var dom = document.getElementById('chart-method-matrix');
    if (!dom) return;
    var chart = makeChart(dom);
    autoResize(chart);

    var methods = ['费曼学习法', '主动回忆法', '间隔重复法', '错题归因法', '番茄工作法', '思维导图法', '一题多解法', '小目标渐进法'];
    var dims = ['认知策略', '元认知能力', '逻辑推理', '资源管理', '学习动机'];
    var dimKeys = ['cognition', 'metacognition', 'logic', 'resource', 'motivation'];

    var matchData = [
      [0.9,0.6,0.7,0.3,0.5], [0.85,0.8,0.4,0.3,0.6], [0.8,0.5,0.3,0.7,0.5],
      [0.7,0.9,0.6,0.5,0.4], [0.3,0.6,0.2,0.95,0.7], [0.7,0.5,0.9,0.3,0.4],
      [0.6,0.4,0.95,0.2,0.5], [0.3,0.5,0.2,0.6,0.95]
    ];

    var heatData = [];
    for (var i = 0; i < methods.length; i++) {
      for (var j = 0; j < dims.length; j++) {
        heatData.push([j, i, Math.round(matchData[i][j] * 100)]);
      }
    }

    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true, backgroundColor: C.bg2, borderColor: C.rule, textStyle: { color: C.ink },
        formatter: function (p) { return methods[p.data[1]] + ' · ' + dims[p.data[0]] + ': ' + p.data[2] + '%'; }
      },
      grid: { left: 110, right: 50, top: 10, bottom: 40 },
      xAxis: { type: 'category', data: dims, axisLabel: { color: C.muted, fontSize: 11 }, axisLine: { lineStyle: { color: C.rule } } },
      yAxis: { type: 'category', data: methods, axisLabel: { color: C.muted, fontSize: 10 }, axisLine: { lineStyle: { color: C.rule } } },
      visualMap: { min: 20, max: 100, orient: 'vertical', right: 0, top: 'center', itemHeight: 140, textStyle: { color: C.muted, fontSize: 10 }, inRange: { color: [C.bg3, C.accent, C.accent3] } },
      series: [{
        type: 'heatmap', data: heatData,
        label: { show: true, color: C.ink, fontSize: 9, formatter: function (p) { return p.data[2]; } },
        itemStyle: { borderColor: C.bg2, borderWidth: 2 }
      }]
    });
  };

  /* ═══════════════════════════════
     5. initPlanCharts
     ═══════════════════════════════ */
  window.initPlanCharts = function () {
    var dom = document.getElementById('chart-progress');
    if (!dom) return;
    var chart = makeChart(dom);
    autoResize(chart);

    var weeks = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'];
    var knowledgeMastery = [42, 48, 55, 62, 68, 73, 77, 80];
    var methodProficiency = [30, 38, 50, 58, 65, 72, 76, 82];

    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: C.bg2, borderColor: C.rule, textStyle: { color: C.ink } },
      legend: { data: ['知识掌握度', '方法熟练度'], textStyle: { color: C.muted }, top: 10 },
      grid: { left: 50, right: 30, top: 50, bottom: 30 },
      xAxis: { type: 'category', data: weeks, axisLine: { lineStyle: { color: C.rule } }, axisLabel: { color: C.muted } },
      yAxis: { type: 'value', min: 0, max: 100, axisLine: { lineStyle: { color: C.rule } }, axisLabel: { color: C.muted }, splitLine: { lineStyle: { color: C.rule, opacity: 0.3 } } },
      series: [
        {
          name: '知识掌握度', type: 'line', data: knowledgeMastery,
          lineStyle: { color: C.accent, width: 2 },
          itemStyle: { color: C.accent },
          symbol: 'circle', symbolSize: 6,
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(108,159,255,0.25)' },
            { offset: 1, color: 'rgba(108,159,255,0.02)' }
          ])}
        },
        {
          name: '方法熟练度', type: 'line', data: methodProficiency,
          lineStyle: { color: C.accent3, width: 2 },
          itemStyle: { color: C.accent3 },
          symbol: 'circle', symbolSize: 6,
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(105,240,174,0.25)' },
            { offset: 1, color: 'rgba(105,240,174,0.02)' }
          ])}
        }
      ]
    });
  };

})();
