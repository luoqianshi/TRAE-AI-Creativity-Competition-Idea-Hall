// ProjectSim AI — Interactive Prototype Charts & Logic
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();
  var danger = style.getPropertyValue('--danger').trim();
  var success = style.getPropertyValue('--success').trim();
  var warning = style.getPropertyValue('--warning').trim();

  var charts = [];

  function initChart(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    var c = echarts.init(el, null, { renderer: 'svg' });
    charts.push(c);
    return c;
  }

  var tooltipBase = {
    backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0', fontSize: 12 },
    appendToBody: true
  };

  // ====== PAGE: Dashboard ======

  // Gantt Chart
  var ganttChart = initChart('chart-gantt');
  if (ganttChart) {
    var tasks = [
      { name: '需求分析', start: 0, dur: 16, critical: true, progress: 100 },
      { name: '架构设计', start: 16, dur: 26, critical: true, progress: 100 },
      { name: 'UI设计', start: 16, dur: 15, critical: false, progress: 100 },
      { name: '前端开发', start: 42, dur: 36, critical: true, progress: 65 },
      { name: '后端开发', start: 42, dur: 41, critical: true, progress: 55 },
      { name: '数据库设计', start: 16, dur: 13, critical: false, progress: 100 },
      { name: 'API开发', start: 57, dur: 29, critical: true, progress: 40 },
      { name: '集成测试', start: 83, dur: 19, critical: false, progress: 10 },
      { name: 'UAT测试', start: 102, dur: 13, critical: false, progress: 0 },
      { name: '部署上线', start: 115, dur: 9, critical: false, progress: 0 }
    ];
    ganttChart.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'item', formatter: function(p) { var t = tasks[p.dataIndex]; return '<b>' + t.name + '</b><br/>工期: ' + t.dur + '天<br/>进度: ' + t.progress + '%<br/>' + (t.critical ? '<span style="color:#ef4444">关键路径</span>' : '非关键'); }}),
      grid: { left: 80, right: 30, top: 20, bottom: 30 },
      xAxis: { type: 'value', max: 128, axisLabel: { color: muted, fontSize: 10, formatter: function(v) { return '第' + v + '天'; }}, splitLine: { lineStyle: { color: rule, type: 'dashed' }}, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'category', data: tasks.map(function(t){return t.name;}).reverse(), axisLabel: { color: muted, fontSize: 10 }, axisLine: { lineStyle: { color: rule }}, splitLine: { show: false }},
      series: [{
        type: 'custom', renderItem: function(params, api) {
          var idx = params.dataIndex;
          var t = tasks[idx];
          var y = api.coord([0, params.dataIndex + 0.5])[1];
          var h = api.size([0, 1])[1] * 0.5;
          var xStart = api.coord([t.start, 0])[0];
          var xEnd = api.coord([t.start + t.dur * t.progress / 100, 0])[0];
          var xFull = api.coord([t.start + t.dur, 0])[0];
          return { type: 'group', children: [
            { type: 'rect', shape: { x: xStart, y: y - h/2, width: xFull - xStart, height: h }, style: { fill: t.critical ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.1)', stroke: t.critical ? 'rgba(239,68,68,0.4)' : 'rgba(6,182,212,0.3)', lineWidth: 1 }},
            { type: 'rect', shape: { x: xStart, y: y - h/2, width: xEnd - xStart, height: h }, style: { fill: t.critical ? 'rgba(239,68,68,0.6)' : 'rgba(6,182,212,0.5)' }, z: 1 }
          ]};
        }, data: tasks.map(function(t, i) { return i; }), encode: { x: 0, y: 1 }, z: 10
      }]
    });
  }

  // Risk Heatmap
  var riskHeatmap = initChart('chart-risk-heatmap');
  if (riskHeatmap) {
    var riskData = [];
    var impacts = ['极低','低','中','高','极高'];
    var probs = ['极低','低','中','高','极高'];
    var vals = [[0,0,3],[0,1,1],[0,2,0],[0,3,0],[0,4,0],[1,0,8],[1,1,4],[1,2,2],[1,3,1],[1,4,0],[2,0,5],[2,1,6],[2,2,2],[2,3,1],[2,4,0],[3,0,1],[3,1,4],[3,2,3],[3,3,2],[3,4,1],[4,0,3],[4,1,5],[4,2,2],[4,3,1],[4,4,0]];
    riskHeatmap.setOption({
      tooltip: Object.assign({}, tooltipBase, { formatter: function(p){ return impacts[p.value[0]] + '影响 × ' + probs[p.value[1]] + '概率<br/>风险数: ' + p.value[2]; }}),
      grid: { left: 50, right: 20, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: probs, axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }}, splitArea: { show: false }},
      yAxis: { type: 'category', data: impacts.reverse(), axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }}, splitArea: { show: false }},
      visualMap: { min: 0, max: 8, show: false, inRange: { color: [bg3, 'rgba(16,185,129,0.3)', 'rgba(245,158,11,0.5)', 'rgba(239,68,68,0.6)', 'rgba(239,68,68,0.9)'] }, outOfRange: { color: 'transparent' }},
      series: [{ type: 'heatmap', data: vals.map(function(v){return [v[0], 4-v[1], v[2]];}), label: { show: true, color: ink, fontSize: 10, fontWeight: 600 }, itemStyle: { borderColor: rule, borderWidth: 1 }}]
    });
  }

  // Resource Overview
  var resOverview = initChart('chart-resource-overview');
  if (resOverview) {
    var weeks = ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12','W13','W14','W15','W16'];
    resOverview.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'axis' }),
      legend: { data: ['高级工程师','中级工程师','DBA','设计师'], textStyle: { color: muted, fontSize: 10 }, top: 0 },
      grid: { left: 50, right: 20, top: 35, bottom: 30 },
      xAxis: { type: 'category', data: weeks, axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }}, splitLine: { show: false }},
      yAxis: { type: 'value', name: '人数', nameTextStyle: { color: muted, fontSize: 10 }, axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }}},
      series: [
        { name: '高级工程师', type: 'bar', stack: 'res', data: [1,1,2,2,2,3,3,3,2,2,2,2,1,1,1,0], itemStyle: { color: accent }},
        { name: '中级工程师', type: 'bar', stack: 'res', data: [0,1,2,2,3,3,3,2,2,2,1,1,1,0,0,0], itemStyle: { color: accent2 }},
        { name: 'DBA', type: 'bar', stack: 'res', data: [0,0,1,1,2,1,1,1,1,0,0,0,0,0,0,0], itemStyle: { color: warning }},
        { name: '设计师', type: 'bar', stack: 'res', data: [1,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0], itemStyle: { color: success }},
        { name: '高级工程师上限', type: 'line', data: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], lineStyle: { color: danger, type: 'dashed', width: 1 }, symbol: 'none', markArea: { silent: true, data: [[{ yAxis: 2, itemStyle: { color: 'rgba(239,68,68,0.06)' }}, { yAxis: 4 }]] }}
      ]
    });
  }

  // ====== PAGE: CPM / PERT ======

  // Network Diagram (using graph)
  var netChart = initChart('chart-network');
  if (netChart) {
    netChart.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'item' }),
      series: [{
        type: 'graph', layout: 'none', roam: true,
        draggable: true,
        symbolSize: [60, 30],
        label: { show: true, color: ink, fontSize: 10, formatter: function(p){ return p.data.name; }},
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 8],
        edgeLabel: { show: true, color: muted, fontSize: 9, formatter: function(p){ return p.data.dur + 'd'; }},
        lineStyle: { color: rule, width: 1.5, curveness: 0.1 },
        itemStyle: { borderColor: rule, borderWidth: 1.5 },
        data: [
          { name: 'A\n需求', x: 100, y: 200, critical: true, itemStyle: { color: 'rgba(239,68,68,0.2)', borderColor: danger }},
          { name: 'B\n架构', x: 250, y: 200, critical: true, itemStyle: { color: 'rgba(239,68,68,0.2)', borderColor: danger }},
          { name: 'C\nUI', x: 250, y: 340, itemStyle: { color: 'rgba(6,182,212,0.15)', borderColor: accent }},
          { name: 'D\n前端', x: 430, y: 200, critical: true, itemStyle: { color: 'rgba(239,68,68,0.2)', borderColor: danger }},
          { name: 'E\n后端', x: 430, y: 340, critical: true, itemStyle: { color: 'rgba(239,68,68,0.2)', borderColor: danger }},
          { name: 'F\n数据库', x: 430, y: 80, itemStyle: { color: 'rgba(6,182,212,0.15)', borderColor: accent }},
          { name: 'G\nAPI', x: 610, y: 270, critical: true, itemStyle: { color: 'rgba(239,68,68,0.2)', borderColor: danger }},
          { name: 'H\n集成测试', x: 720, y: 150, itemStyle: { color: 'rgba(6,182,212,0.15)', borderColor: accent }},
          { name: 'I\nUAT', x: 820, y: 200, itemStyle: { color: 'rgba(6,182,212,0.15)', borderColor: accent }},
          { name: 'J\n上线', x: 920, y: 200, itemStyle: { color: 'rgba(6,182,212,0.15)', borderColor: accent }}
        ],
        links: [
          { source: 'A\n需求', target: 'B\n架构', dur: '16' },
          { source: 'A\n需求', target: 'C\nUI', dur: '16' },
          { source: 'B\n架构', target: 'D\n前端', dur: '26' },
          { source: 'B\n架构', target: 'E\n后端', dur: '26' },
          { source: 'B\n架构', target: 'F\n数据库', dur: '26' },
          { source: 'C\nUI', target: 'D\n前端', dur: '15' },
          { source: 'F\n数据库', target: 'E\n后端', dur: '13' },
          { source: 'D\n前端', target: 'G\nAPI', dur: '36' },
          { source: 'E\n后端', target: 'G\nAPI', dur: '41' },
          { source: 'G\nAPI', target: 'H\n集成测试', dur: '29' },
          { source: 'H\n集成测试', target: 'I\nUAT', dur: '19' },
          { source: 'I\nUAT', target: 'J\n上线', dur: '13' }
        ]
      }]
    });
  }

  // CPM Gantt with slack
  var cpmGantt = initChart('chart-cpm-gantt');
  if (cpmGantt) {
    var cpmTasks = [
      { name: 'A.需求分析', est:0, dur:16, lst:0, tf:0, critical:true },
      { name: 'B.架构设计', est:16, dur:26, lst:16, tf:0, critical:true },
      { name: 'C.UI设计', est:16, dur:15, lst:25, tf:9, critical:false },
      { name: 'D.前端开发', est:42, dur:36, lst:42, tf:0, critical:true },
      { name: 'E.后端开发', est:42, dur:41, lst:42, tf:0, critical:true },
      { name: 'F.数据库', est:16, dur:13, lst:70, tf:57, critical:false },
      { name: 'G.API开发', est:83, dur:29, lst:83, tf:0, critical:true },
      { name: 'H.集成测试', est:102, dur:19, lst:102, tf:0, critical:true },
      { name: 'I.UAT测试', est:112, dur:13, lst:112, tf:0, critical:true },
      { name: 'J.部署上线', est:115, dur:9, lst:115, tf:0, critical:true }
    ];
    cpmGantt.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'item', formatter: function(p) { var t = cpmTasks[p.dataIndex]; return '<b>' + t.name + '</b><br/>EST: 第' + t.est + '天<br/>工期: ' + t.dur + '天<br/>总时差: ' + t.tf + '天<br/>' + (t.critical ? '<span style="color:#ef4444">关键活动</span>' : '时差可利用: ' + t.tf + '天'); }}),
      legend: { data: ['关键路径', '非关键(含时差)', '总时差区间'], textStyle: { color: muted, fontSize: 10 }, top: 0 },
      grid: { left: 100, right: 30, top: 35, bottom: 30 },
      xAxis: { type: 'value', max: 128, axisLabel: { color: muted, fontSize: 9, formatter: function(v){return '第'+v+'天';}}, splitLine: { lineStyle: { color: rule, type: 'dashed' }}, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'category', data: cpmTasks.map(function(t){return t.name;}).reverse(), axisLabel: { color: muted, fontSize: 10 }, axisLine: { lineStyle: { color: rule }} },
      series: [
        { name: '非关键(含时差)', type: 'custom', renderItem: function(params, api) { var t = cpmTasks[params.dataIndex]; if (t.critical) return; var y = api.coord([0, params.dataIndex + 0.5])[1]; var h = api.size([0,1])[1]*0.4; var x1 = api.coord([t.lst, 0])[0]; var x2 = api.coord([t.lst + t.dur + t.tf, 0])[0]; return { type: 'rect', shape: { x: x1, y: y-h/2, width: x2-x1, height: h }, style: { fill: 'rgba(100,116,139,0.1)', stroke: rule, lineWidth: 1, lineDash: [3,3] }}; }, data: cpmTasks.map(function(t,i){return i;}), z: 1 },
        { name: '关键路径', type: 'custom', renderItem: function(params, api) { var t = cpmTasks[params.dataIndex]; var y = api.coord([0, params.dataIndex + 0.5])[1]; var h = api.size([0,1])[1]*0.45; var x1 = api.coord([t.est, 0])[0]; var x2 = api.coord([t.est + t.dur, 0])[0]; return { type: 'rect', shape: { x: x1, y: y-h/2, width: x2-x1, height: h }, style: { fill: t.critical ? 'rgba(239,68,68,0.6)' : 'rgba(6,182,212,0.5)' }}; }, data: cpmTasks.map(function(t,i){return i;}), z: 2 },
        { name: '总时差区间', type: 'custom', renderItem: function(params, api) { var t = cpmTasks[params.dataIndex]; if (t.critical || t.tf === 0) return; var y = api.coord([0, params.dataIndex + 0.5])[1]; var h = api.size([0,1])[1]*0.2; var x1 = api.coord([t.est, 0])[0]; var x2 = api.coord([t.est + t.tf, 0])[0]; return { type: 'rect', shape: { x: x2, y: y-h/2, width: x1 === x2 ? 2 : (api.coord([t.est + t.dur, 0])[0] - x2), height: h }, style: { fill: 'rgba(245,158,11,0.4)' }}; }, data: cpmTasks.map(function(t,i){return i;}), z: 3 }
      ]
    });
  }

  // ====== PAGE: Monte Carlo ======

  // MC Histogram + S Curve
  var mcHist = initChart('chart-mc-histogram');
  if (mcHist) {
    var bins = [], sCurve = [];
    var base = 115, count = 0;
    for (var d = 115; d <= 180; d++) {
      var v = Math.round(Math.exp(-0.5 * Math.pow((d - 140) / 12, 2)) * 1000 + Math.random() * 80);
      bins.push([d - 115, v]);
      count += v;
      sCurve.push([(d - 115) * 100 / 65, (count / 10000 * 100).toFixed(1)]);
    }
    mcHist.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'axis' }),
      legend: { data: ['频次分布', '累积概率(S曲线)'], textStyle: { color: muted, fontSize: 10 }, top: 0 },
      grid: { left: 55, right: 55, top: 35, bottom: 35 },
      xAxis: [
        { type: 'value', name: '工期(天)', nameTextStyle: { color: muted }, axisLabel: { color: muted, fontSize: 9, formatter: function(v){return Math.round(v)+115;}}, splitLine: { lineStyle: { color: rule, type: 'dashed' }}, axisLine: { lineStyle: { color: rule }}, min: 0, max: 65 },
        { type: 'value', name: '累积概率%', nameTextStyle: { color: muted }, axisLabel: { color: muted, fontSize: 9, formatter: '{value}%'}, splitLine: { show: false }, axisLine: { lineStyle: { color: rule }}, min: 0, max: 100 }
      ],
      yAxis: [
        { type: 'value', name: '频次', nameTextStyle: { color: muted }, axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }} },
        { type: 'value', name: '概率%', nameTextStyle: { color: muted }, axisLabel: { color: muted, fontSize: 9 }, splitLine: { show: false } }
      ],
      series: [
        { name: '频次分布', type: 'bar', xAxisIndex: 0, yAxisIndex: 0, data: bins, itemStyle: { color: accent + '88', borderColor: accent, borderWidth: 1 }, barWidth: '80%' },
        { name: '累积概率(S曲线)', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: sCurve, smooth: true, lineStyle: { color: accent2, width: 2 }, symbol: 'none', areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent2 + '30' }, { offset: 1, color: accent2 + '05' }]}} }
      ]
    });
  }

  // Tornado Chart
  var tornado = initChart('chart-tornado');
  if (tornado) {
    var sensData = [
      { name: 'E.后端开发', corr: 0.82 },
      { name: 'D.前端开发', corr: 0.75 },
      { name: 'G.API开发', corr: 0.68 },
      { name: 'B.架构设计', corr: 0.55 },
      { name: 'H.集成测试', corr: 0.38 },
      { name: 'A.需求分析', corr: 0.28 },
      { name: 'C.UI设计', corr: 0.15 },
      { name: 'F.数据库', corr: 0.10 },
      { name: 'I.UAT测试', corr: 0.05 },
      { name: 'J.部署上线', corr: 0.02 }
    ];
    tornado.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'axis', formatter: function(p){ return p[0].name + '<br/>相关系数: ' + sensData[p[0].dataIndex].corr; }}),
      grid: { left: 100, right: 40, top: 10, bottom: 30 },
      xAxis: { type: 'value', max: 1, axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }}, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'category', data: sensData.map(function(d){return d.name;}).reverse(), axisLabel: { color: muted, fontSize: 10 }, axisLine: { lineStyle: { color: rule }} },
      series: [{ type: 'bar', data: sensData.map(function(d){return d.corr;}).reverse(), itemStyle: { color: function(p){ return p.value > 0.6 ? danger : p.value > 0.3 ? warning : accent + '88'; }}, barWidth: '60%', label: { show: true, color: ink, fontSize: 10, position: 'right', formatter: function(p){return p.value;} } }]
    });
  }

  // ====== PAGE: Resource ======

  // Resource Before Leveling
  var resBefore = initChart('chart-res-before');
  if (resBefore) {
    resBefore.setOption(makeResBar([8,10,12,10,10,14,15,14,12,10,8,6,5,4,3,2], 8, '均衡前'));
  }

  // Resource After Leveling
  var resAfter = initChart('chart-res-after');
  if (resAfter) {
    resAfter.setOption(makeResBar([7,8,9,9,9,10,10,10,9,9,8,7,6,5,4,3], 8, '均衡后'));
  }

  function makeResBar(data, cap, title) {
    var weeks = [];
    for (var i = 1; i <= 16; i++) weeks.push('W' + i);
    return {
      tooltip: Object.assign({}, tooltipBase, { trigger: 'axis' }),
      grid: { left: 40, right: 20, top: 15, bottom: 30 },
      xAxis: { type: 'category', data: weeks, axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'value', axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }} },
      series: [
        { name: title, type: 'bar', data: data, itemStyle: { color: function(p) { return p.value > cap ? danger + '88' : accent + '88'; }, borderColor: function(p) { return p.value > cap ? danger : accent; }, borderWidth: 1 }, barWidth: '60%' },
        { name: '容量上限', type: 'line', data: Array(16).fill(cap), lineStyle: { color: danger, type: 'dashed' }, symbol: 'none', markArea: { silent: true, data: [[{ yAxis: cap, itemStyle: { color: 'rgba(239,68,68,0.06)' }}, { yAxis: 20 }]] }}
      ]
    };
  }

  // Resource Matrix
  var resMatrix = initChart('chart-res-matrix');
  if (resMatrix) {
    var roles = ['高级工程师','中级工程师','DBA','设计师'];
    var phases = ['需求分析','架构设计','开发阶段','测试阶段','部署阶段'];
    var matrixData = [];
    var mv = [[2,1,0,1],[3,2,1,0],[4,3,1,0],[2,2,0,0],[1,0,0,0]];
    for (var ri = 0; ri < 4; ri++) for (var pi = 0; pi < 5; pi++) matrixData.push([pi, ri, mv[pi][ri]]);
    resMatrix.setOption({
      tooltip: Object.assign({}, tooltipBase, { formatter: function(p){ return phases[p.value[0]] + ' × ' + roles[p.value[1]] + '<br/>需求: ' + p.value[2] + '人'; }}),
      grid: { left: 80, right: 40, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: phases, axisLabel: { color: muted, fontSize: 9, rotate: 15 }, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'category', data: roles, axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      visualMap: { min: 0, max: 4, show: false, inRange: { color: [bg3, accent + '40', accent + '80', accent2 + '80', accent2] }},
      series: [{ type: 'heatmap', data: matrixData, label: { show: true, color: ink, fontSize: 11, fontWeight: 600, formatter: function(p){return p.value[2] === 0 ? '-' : p.value[2];}}, itemStyle: { borderColor: rule, borderWidth: 1 }}]
    });
  }

  // Resource Constrained Scheduling
  var resConstrained = initChart('chart-res-constrained');
  if (resConstrained) {
    var ct = [
      { name: 'A.需求分析', start: 0, dur: 16, delay: 0 },
      { name: 'B.架构设计', start: 16, dur: 26, delay: 0 },
      { name: 'C.UI设计', start: 25, dur: 15, delay: 9 },
      { name: 'D.前端开发', start: 42, dur: 36, delay: 0 },
      { name: 'E.后端开发', start: 50, dur: 41, delay: 8 },
      { name: 'F.数据库', start: 70, dur: 13, delay: 54 },
      { name: 'G.API开发', start: 91, dur: 29, delay: 8 },
      { name: 'H.集成测试', start: 120, dur: 19, delay: 18 },
      { name: 'I.UAT测试', start: 131, dur: 13, delay: 19 },
      { name: 'J.部署上线', start: 136, dur: 9, delay: 21 }
    ];
    resConstrained.setOption({
      tooltip: Object.assign({}, tooltipBase, { formatter: function(p){ var t = ct[p.dataIndex]; return '<b>' + t.name + '</b><br/>开始: 第' + t.start + '天<br/>工期: ' + t.dur + '天<br/>延迟: +' + t.delay + '天'; }}),
      grid: { left: 100, right: 30, top: 15, bottom: 30 },
      xAxis: { type: 'value', max: 155, axisLabel: { color: muted, fontSize: 9, formatter: function(v){return '第'+v+'天';}}, splitLine: { lineStyle: { color: rule, type: 'dashed' }}, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'category', data: ct.map(function(t){return t.name;}).reverse(), axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      series: [{
        type: 'custom', renderItem: function(params, api) { var t = ct[params.dataIndex]; var y = api.coord([0, params.dataIndex + 0.5])[1]; var h = api.size([0,1])[1]*0.5; var x1 = api.coord([t.start, 0])[0]; var x2 = api.coord([t.start + t.dur, 0])[0]; return { type: 'rect', shape: { x: x1, y: y-h/2, width: x2-x1, height: h }, style: { fill: t.delay > 10 ? danger + '88' : t.delay > 0 ? warning + '88' : accent + '88', stroke: t.delay > 10 ? danger : t.delay > 0 ? warning : accent, lineWidth: 1 }}; }, data: ct.map(function(t,i){return i;}), z: 2
      }]
    });
  }

  // Resource Conflict Heatmap
  var resConflict = initChart('chart-res-conflict');
  if (resConflict) {
    var cData = [];
    var cRoles = ['前端', '后端', 'DBA', '测试', '设计'];
    var cWeeks = ['W4','W5','W6','W7','W8','W9','W10','W11','W12','W13'];
    var cv = [[0,0,0,0,0,0,0,0,0,0],[0,0,2,3,3,2,0,0,0,0],[0,1,2,1,0,0,0,0,0,0],[0,0,0,0,0,1,2,3,3,2],[1,1,0,0,0,0,0,0,0,0]];
    for (var ci = 0; ci < 5; ci++) for (var cj = 0; cj < 10; cj++) if (cv[ci][cj] > 0) cData.push([cj, ci, cv[ci][cj]]);
    resConflict.setOption({
      tooltip: Object.assign({}, tooltipBase, { formatter: function(p){ return cRoles[p.value[1]] + ' × ' + cWeeks[p.value[0]] + '<br/>冲突人数: ' + p.value[2]; }}),
      grid: { left: 60, right: 40, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: cWeeks, axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'category', data: cRoles, axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      visualMap: { min: 1, max: 3, show: false, inRange: { color: ['rgba(245,158,11,0.4)', 'rgba(245,158,11,0.7)', 'rgba(239,68,68,0.8)'] }},
      series: [{ type: 'heatmap', data: cData, label: { show: true, color: ink, fontSize: 11, fontWeight: 600 }, itemStyle: { borderColor: rule, borderWidth: 1 } }]
    });
  }

  // ====== PAGE: Agile ======

  // Burndown
  var burndown = initChart('chart-burndown');
  if (burndown) {
    var bdDays = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','D14'];
    burndown.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'axis' }),
      legend: { data: ['理想线', '实际线', 'AI预测区间'], textStyle: { color: muted, fontSize: 10 }, top: 0 },
      grid: { left: 50, right: 30, top: 35, bottom: 30 },
      xAxis: { type: 'category', data: bdDays, axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'value', name: '剩余SP', nameTextStyle: { color: muted, fontSize: 10 }, axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }} },
      series: [
        { name: '理想线', type: 'line', data: [42,39,36,33,29,26,23,19,16,13,9,6,3,0], smooth: false, lineStyle: { color: muted, type: 'dashed' }, symbol: 'none' },
        { name: '实际线', type: 'line', data: [42,41,40,37,35,34,31,28,25,null,null,null,null,null], smooth: true, lineStyle: { color: accent, width: 2 }, symbol: 'circle', symbolSize: 6, itemStyle: { color: accent }},
        { name: 'AI预测区间', type: 'line', data: [null,null,null,null,null,null,null,null,25,22,18,14,8,2], smooth: true, lineStyle: { color: accent2, type: 'dashed', width: 1 }, symbol: 'none',
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent2 + '20' }, { offset: 1, color: accent2 + '05' }]}}
        }
      ]
    });
  }

  // CFD
  var cfd = initChart('chart-cfd');
  if (cfd) {
    var cfdDates = [];
    for (var cd = 1; cd <= 20; cd++) cfdDates.push('D' + cd);
    cfd.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'axis' }),
      legend: { data: ['Done','In Review','In Progress','Backlog'], textStyle: { color: muted, fontSize: 10 }, top: 0 },
      grid: { left: 50, right: 20, top: 35, bottom: 30 },
      xAxis: { type: 'category', data: cfdDates, axisLabel: { color: muted, fontSize: 8 }, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'value', axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }} },
      series: [
        { name: 'Done', type: 'line', stack: 'total', data: [0,2,5,8,10,12,15,18,20,22,25,27,30,32,35,37,40,42,44,46], areaStyle: { color: success + '50' }, lineStyle: { color: success }, symbol: 'none', itemStyle: { color: success }},
        { name: 'In Review', type: 'line', stack: 'total', data: [3,3,3,4,4,3,3,3,4,4,3,3,2,3,3,2,2,2,1,1], areaStyle: { color: accent2 + '50' }, lineStyle: { color: accent2 }, symbol: 'none', itemStyle: { color: accent2 }},
        { name: 'In Progress', type: 'line', stack: 'total', data: [8,10,10,10,9,10,10,9,8,8,7,8,8,7,6,7,6,5,5,4], areaStyle: { color: accent + '50' }, lineStyle: { color: accent }, symbol: 'none', itemStyle: { color: accent }},
        { name: 'Backlog', type: 'line', stack: 'total', data: [50,48,45,40,39,37,34,32,30,28,27,24,22,20,18,16,14,13,12,11], areaStyle: { color: muted + '30' }, lineStyle: { color: muted }, symbol: 'none', itemStyle: { color: muted }}
      ]
    });
  }

  // Velocity
  var velocity = initChart('chart-velocity');
  if (velocity) {
    var sprints = ['S1','S2','S3','S4','S5','S6','S7(预测)','S8(预测)'];
    velocity.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'axis' }),
      legend: { data: ['实际速率', '预测速率', '平均线'], textStyle: { color: muted, fontSize: 10 }, top: 0 },
      grid: { left: 50, right: 30, top: 35, bottom: 30 },
      xAxis: { type: 'category', data: sprints, axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'value', name: '故事点(SP)', nameTextStyle: { color: muted, fontSize: 10 }, axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }} },
      series: [
        { name: '实际速率', type: 'bar', data: [38,35,42,40,44,null,null], itemStyle: { color: accent + '88', borderColor: accent, borderWidth: 1 }, barWidth: '50%' },
        { name: '预测速率', type: 'bar', data: [null,null,null,null,null,42,40,42], itemStyle: { color: accent2 + '55', borderColor: accent2, borderWidth: 1, borderType: 'dashed' }, barWidth: '50%' },
        { name: '平均线', type: 'line', data: [39.8,39.8,39.8,39.8,39.8,39.8,39.8,39.8], lineStyle: { color: warning, type: 'dashed' }, symbol: 'none' }
      ]
    });
  }

  // ====== PAGE: EVM ======

  // EVM S Curve
  var evmScurve = initChart('chart-evm-scurve');
  if (evmScurve) {
    var evmMonths = ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10'];
    var pv = [98,196,294,392,490,588,686,784,882,980];
    var ev = [90,180,270,375,468,558,639,null,null,null];
    var ac = [95,200,290,395,498,590,680,null,null,null];
    evmScurve.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'axis' }),
      legend: { data: ['PV 计划价值','EV 挣值','AC 实际成本'], textStyle: { color: muted, fontSize: 10 }, top: 0 },
      grid: { left: 55, right: 30, top: 35, bottom: 30 },
      xAxis: { type: 'category', data: evmMonths, axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'value', name: '万元', nameTextStyle: { color: muted, fontSize: 10 }, axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }} },
      series: [
        { name: 'PV 计划价值', type: 'line', data: pv, smooth: true, lineStyle: { color: muted, type: 'dashed', width: 2 }, symbol: 'circle', symbolSize: 6, itemStyle: { color: muted }},
        { name: 'EV 挣值', type: 'line', data: ev, smooth: true, lineStyle: { color: success, width: 2.5 }, symbol: 'circle', symbolSize: 7, itemStyle: { color: success }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: success + '15' }, { offset: 1, color: success + '02' }]}}},
        { name: 'AC 实际成本', type: 'line', data: ac, smooth: true, lineStyle: { color: danger, width: 2.5 }, symbol: 'circle', symbolSize: 7, itemStyle: { color: danger }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: danger + '15' }, { offset: 1, color: danger + '02' }]}}}
      ]
    });
  }

  // CPI/SPI Trend
  var cpiSpi = initChart('chart-evm-cpi-spi');
  if (cpiSpi) {
    var espiMonths = ['M1','M2','M3','M4','M5','M6','M7'];
    cpiSpi.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'axis' }),
      legend: { data: ['CPI','SPI'], textStyle: { color: muted, fontSize: 10 }, top: 0 },
      grid: { left: 45, right: 30, top: 35, bottom: 30 },
      xAxis: { type: 'category', data: espiMonths, axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'value', min: 0.85, max: 1.05, axisLabel: { color: muted, fontSize: 9, formatter: function(v){return v.toFixed(2);}}, splitLine: { lineStyle: { color: rule, type: 'dashed' }} },
      series: [
        { name: 'CPI', type: 'line', data: [0.95,0.90,0.93,0.95,0.94,0.95,0.94], lineStyle: { color: danger, width: 2 }, symbol: 'circle', symbolSize: 7, itemStyle: { color: danger }},
        { name: 'SPI', type: 'line', data: [0.92,0.92,0.92,0.96,0.96,0.95,0.93], lineStyle: { color: accent, width: 2 }, symbol: 'circle', symbolSize: 7, itemStyle: { color: accent }},
        { type: 'line', markLine: { silent: true, data: [{ yAxis: 1.0, label: { formatter: '基准1.0', color: muted, fontSize: 10 }, lineStyle: { color: muted, type: 'dashed' }}] }, symbol: 'none', data: [] }
      ]
    });
  }

  // EVM Quadrant
  var evmQuad = initChart('chart-evm-quadrant');
  if (evmQuad) {
    var wbs = [
      { name: '需求分析', cpi: 1.05, spi: 1.02 },
      { name: '架构设计', cpi: 0.88, spi: 0.85 },
      { name: 'UI设计', cpi: 1.02, spi: 0.95 },
      { name: '前端开发', cpi: 0.92, spi: 0.90 },
      { name: '后端开发', cpi: 0.95, spi: 0.92 },
      { name: '数据库', cpi: 1.08, spi: 1.10 },
      { name: 'API开发', cpi: 0.90, spi: 0.88 },
      { name: '集成测试', cpi: 0.93, spi: 0.94 },
      { name: 'UAT测试', cpi: 1.00, spi: 0.98 },
      { name: '部署上线', cpi: 1.01, spi: 1.00 }
    ];
    evmQuad.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'item', formatter: function(p){ var t = wbs[p.dataIndex]; return '<b>' + t.name + '</b><br/>CPI: ' + t.cpi + '<br/>SPI: ' + t.spi; }}),
      grid: { left: 55, right: 40, top: 20, bottom: 40 },
      xAxis: { type: 'value', name: 'SPI 进度绩效', nameLocation: 'middle', nameTextStyle: { color: muted, fontSize: 10 }, min: 0.8, max: 1.15, axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }}, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'value', name: 'CPI 成本绩效', nameTextStyle: { color: muted, fontSize: 10 }, min: 0.8, max: 1.15, axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }}, axisLine: { lineStyle: { color: rule }} },
      series: [{
        type: 'scatter', data: wbs.map(function(t){return [t.spi, t.cpi];}),
        symbolSize: 18,
        label: { show: true, color: ink, fontSize: 9, formatter: function(p){return wbs[p.dataIndex].name;}, position: 'right' },
        itemStyle: { color: function(p) { var t = wbs[p.dataIndex]; return (t.cpi >= 1 && t.spi >= 1) ? success : (t.cpi < 1 && t.spi < 1) ? danger : warning; }, borderColor: rule, borderWidth: 1 },
        markLine: { silent: true, data: [
          { xAxis: 1.0, lineStyle: { color: muted, type: 'dashed' }, label: { show: false }},
          { yAxis: 1.0, lineStyle: { color: muted, type: 'dashed' }, label: { show: false }}
        ]},
        markArea: { silent: true, data: [
          [{ xAxis: 1.0, yAxis: 1.0, itemStyle: { color: success + '10' }, label: { show: true, formatter: '优秀', color: success, fontSize: 11, fontWeight: 600 }}, { xAxis: 1.15, yAxis: 1.15 }],
          [{ xAxis: 0.8, yAxis: 1.0, itemStyle: { color: warning + '08' }, label: { show: true, formatter: '进度落后', color: warning, fontSize: 10 }}, { xAxis: 1.0, yAxis: 1.15 }],
          [{ xAxis: 1.0, yAxis: 0.8, itemStyle: { color: accent + '08' }, label: { show: true, formatter: '成本超支', color: accent, fontSize: 10 }}, { xAxis: 1.15, yAxis: 1.0 }],
          [{ xAxis: 0.8, yAxis: 0.8, itemStyle: { color: danger + '10' }, label: { show: true, formatter: '高风险', color: danger, fontSize: 11, fontWeight: 600 }}, { xAxis: 1.0, yAxis: 1.0 }]
        ]}
      }]
    });
  }

  // ====== PAGE: SD / DES ======

  // SD CLD (Causal Loop Diagram)
  var sdCld = initChart('chart-sd-cld');
  if (sdCld) {
    sdCld.setOption({
      tooltip: Object.assign({}, tooltipBase),
      series: [{
        type: 'graph', layout: 'force', roam: true, draggable: true,
        force: { repulsion: 300, gravity: 0.1, edgeLength: [100, 200] },
        symbolSize: 50,
        label: { show: true, color: ink, fontSize: 10, formatter: function(p){return p.data.label;}},
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        edgeLabel: { show: true, color: function(p){return p.data.sign === '+' ? success : danger;}, fontSize: 12, fontWeight: 700, formatter: function(p){return p.data.sign;}},
        lineStyle: { color: rule, width: 2, curveness: 0.2 },
        itemStyle: { borderColor: accent, borderWidth: 2, color: bg2 },
        data: [
          { name: 'scope', label: '项目范围' },
          { name: 'complexity', label: '复杂度' },
          { name: 'workload', label: '工作量' },
          { name: 'duration', label: '工期' },
          { name: 'cost', label: '成本' },
          { name: 'pressure', label: '进度压力' },
          { name: 'quality', label: '质量' },
          { name: 'rework', label: '返工量' },
          { name: 'morale', label: '团队士气' }
        ],
        links: [
          { source: 'scope', target: 'complexity', sign: '+' },
          { source: 'complexity', target: 'workload', sign: '+' },
          { source: 'workload', target: 'duration', sign: '+' },
          { source: 'workload', target: 'cost', sign: '+' },
          { source: 'duration', target: 'pressure', sign: '+' },
          { source: 'pressure', target: 'quality', sign: '-', lineStyle: { color: danger }},
          { source: 'quality', target: 'rework', sign: '-', lineStyle: { color: danger }},
          { source: 'rework', target: 'workload', sign: '+', lineStyle: { color: danger }},
          { source: 'pressure', target: 'morale', sign: '-', lineStyle: { color: danger }},
          { source: 'morale', target: 'productivity', sign: '+' },
          { source: 'cost', target: 'pressure', sign: '+', lineStyle: { color: warning }},
        ],
        categories: [{ name: '存量' }, { name: '流量' }]
      }]
    });
  }

  // SD Simulation
  var sdSim = initChart('chart-sd-simulation');
  if (sdSim) {
    var sdDays = [];
    for (var sd = 0; sd <= 128; sd += 2) sdDays.push(sd);
    var backlogData = [], scopeData = [], progressData = [], costData = [];
    for (var si = 0; si < sdDays.length; si++) {
      var t = sdDays[si];
      backlogData.push([t, Math.round(50 * Math.exp(-t / 40) + 5)]);
      scopeData.push([t, Math.round(100 * (1 - Math.exp(-t / 30)) * (1 + 0.1 * Math.sin(t / 10)))]);
      progressData.push([t, Math.round(100 * (1 - Math.exp(-t / 25)))]);
      costData.push([t, Math.round(980 * (1 - Math.exp(-t / 35)) * (1 + 0.03 * t / 128))]);
    }
    sdSim.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'axis' }),
      legend: { data: ['剩余范围', '范围蔓延', '完成进度', '累计成本(百万元)'], textStyle: { color: muted, fontSize: 10 }, top: 0 },
      grid: { left: 50, right: 50, top: 35, bottom: 30 },
      xAxis: { type: 'value', name: '天数', nameTextStyle: { color: muted, fontSize: 10 }, axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }} },
      yAxis: { type: 'value', axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }} },
      series: [
        { name: '剩余范围', type: 'line', data: backlogData, smooth: true, lineStyle: { color: danger, width: 2 }, symbol: 'none' },
        { name: '范围蔓延', type: 'line', data: scopeData, smooth: true, lineStyle: { color: warning, width: 2 }, symbol: 'none', areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: warning + '15' }, { offset: 1, color: warning + '02' }]}}},
        { name: '完成进度', type: 'line', data: progressData, smooth: true, lineStyle: { color: success, width: 2.5 }, symbol: 'none' },
        { name: '累计成本(百万元)', type: 'line', data: costData, smooth: true, lineStyle: { color: accent2, type: 'dashed', width: 2 }, symbol: 'none' }
      ]
    });
  }

  // DES Timeline
  var desTimeline = initChart('chart-des-timeline');
  if (desTimeline) {
    var desEvents = [
      { name: '需求变更#1', time: 18, dur: 5, impact: 3 },
      { name: '人员请假', time: 30, dur: 3, impact: 1 },
      { name: '缺陷爆发', time: 45, dur: 8, impact: 4 },
      { name: '需求变更#2', time: 58, dur: 4, impact: 2 },
      { name: '外部依赖延迟', time: 72, dur: 6, impact: 3 },
      { name: '技术债务爆发', time: 85, dur: 7, impact: 5 },
      { name: '需求变更#3', time: 100, dur: 3, impact: 2 }
    ];
    desTimeline.setOption({
      tooltip: Object.assign({}, tooltipBase, { formatter: function(p){ var e = desEvents[p.dataIndex]; return '<b>' + e.name + '</b><br/>第' + e.time + '天触发<br/>持续: ' + e.dur + '天<br/>影响等级: ' + e.impact + '/5'; }}),
      grid: { left: 90, right: 30, top: 10, bottom: 30 },
      xAxis: { type: 'value', name: '项目天数', nameTextStyle: { color: muted, fontSize: 10 }, axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }}, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'category', data: desEvents.map(function(e){return e.name;}).reverse(), axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      series: [{
        type: 'custom', renderItem: function(params, api) { var e = desEvents[params.dataIndex]; var y = api.coord([0, params.dataIndex + 0.5])[1]; var h = api.size([0,1])[1]*0.5; var x1 = api.coord([e.time, 0])[0]; var x2 = api.coord([e.time + e.dur, 0])[0]; return { type: 'rect', shape: { x: x1, y: y-h/2, width: x2-x1, height: h }, style: { fill: e.impact >= 4 ? danger + '88' : e.impact >= 3 ? warning + '88' : accent + '88', borderColor: e.impact >= 4 ? danger : e.impact >= 3 ? warning : accent, borderWidth: 1, radius: 3 }}; }, data: desEvents.map(function(e,i){return i;}), z: 2
      }]
    });
  }

  // DES Impact
  var desImpact = initChart('chart-des-impact');
  if (desImpact) {
    desImpact.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'axis' }),
      grid: { left: 100, right: 30, top: 10, bottom: 30 },
      xAxis: { type: 'value', name: '影响(天)', nameTextStyle: { color: muted, fontSize: 10 }, axisLabel: { color: muted, fontSize: 9 }, splitLine: { lineStyle: { color: rule, type: 'dashed' }}, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'category', data: ['需求变更#3','外部依赖延迟','需求变更#2','人员请假','需求变更#1','缺陷爆发','技术债务爆发'].reverse(), axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      series: [{ type: 'bar', data: [2, 5, 3, 1, 4, 6, 8].reverse(), itemStyle: { color: function(p){ return p.value >= 6 ? danger + '88' : p.value >= 4 ? warning + '88' : accent + '88'; }}, barWidth: '50%', label: { show: true, color: ink, fontSize: 10, position: 'right', formatter: function(p){return '+' + p.value + '天';} } }]
    });
  }

  // Sensitivity Analysis
  var sensitivity = initChart('chart-sensitivity');
  if (sensitivity) {
    var sensParams = [
      { name: '后端开发工期', range: [-15, 18] },
      { name: '需求变更频率', range: [-8, 14] },
      { name: '高级工程师可用性', range: [-12, 10] },
      { name: '前端开发工期', range: [-6, 12] },
      { name: '集成复杂度', range: [-4, 10] },
      { name: '测试效率', range: [-5, 7] },
      { name: '架构设计工期', range: [-3, 5] },
      { name: '外部依赖延迟', range: [-2, 6] }
    ];
    sensitivity.setOption({
      tooltip: Object.assign({}, tooltipBase, { formatter: function(p){ var s = sensParams[p.dataIndex]; return '<b>' + s.name + '</b><br/>工期影响: ' + s.range[0] + ' ~ +' + s.range[1] + ' 天'; }}),
      grid: { left: 120, right: 40, top: 10, bottom: 30 },
      xAxis: { type: 'value', min: -20, max: 20, axisLabel: { color: muted, fontSize: 9, formatter: function(v){return (v>0?'+':'')+v+'天';}}, splitLine: { lineStyle: { color: rule, type: 'dashed' }}, axisLine: { lineStyle: { color: rule }} },
      yAxis: { type: 'category', data: sensParams.map(function(s){return s.name;}).reverse(), axisLabel: { color: muted, fontSize: 9 }, axisLine: { lineStyle: { color: rule }} },
      series: [
        { name: '最大缩短', type: 'bar', stack: 'sens', data: sensParams.map(function(s){return s.range[0];}).reverse(), itemStyle: { color: success + '88', borderColor: success, borderWidth: 1 }},
        { name: '最大延长', type: 'bar', stack: 'sens2', data: sensParams.map(function(s){return s.range[1];}).reverse(), itemStyle: { color: danger + '88', borderColor: danger, borderWidth: 1 }}
      ]
    });
  }

  // ====== PAGE: AI Architecture ======

  // RAG Stats
  var ragStats = initChart('chart-rag-stats');
  if (ragStats) {
    ragStats.setOption({
      tooltip: Object.assign({}, tooltipBase, { trigger: 'item' }),
      series: [{
        type: 'pie', radius: ['45%', '70%'], center: ['50%', '50%'],
        label: { show: true, color: ink, fontSize: 10 },
        data: [
          { value: 138, name: '历史项目', itemStyle: { color: accent }},
          { value: 82, name: '行业规范', itemStyle: { color: accent2 }},
          { value: 58, name: '风险案例', itemStyle: { color: warning }},
          { value: 50, name: '最佳实践', itemStyle: { color: success }}
        ]
      }]
    });
  }

  // Routing Flow
  var routingFlow = initChart('chart-routing-flow');
  if (routingFlow) {
    routingFlow.setOption({
      tooltip: Object.assign({}, tooltipBase),
      series: [{
        type: 'graph', layout: 'none', roam: true,
        symbol: 'roundRect', symbolSize: [110, 50],
        label: { show: true, color: ink, fontSize: 10, formatter: function(p){return p.data.label;}},
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 8],
        edgeLabel: { show: true, color: muted, fontSize: 8, formatter: function(p){return p.data.cond;}},
        lineStyle: { color: rule, width: 1.5, curveness: 0.15 },
        data: [
          { name: 'input', label: '用户输入', x: 80, y: 200, itemStyle: { color: bg2, borderColor: accent } },
          { name: 'slm', label: 'SLM\n意图+分类', x: 250, y: 200, itemStyle: { color: 'rgba(6,182,212,0.15)', borderColor: accent } },
          { name: 'router', label: '动态路由', x: 430, y: 200, itemStyle: { color: 'rgba(245,158,11,0.15)', borderColor: warning } },
          { name: 'rule', label: '规则引擎\nCPM/EVM/...', x: 620, y: 100, itemStyle: { color: 'rgba(16,185,129,0.15)', borderColor: success } },
          { name: 'llm', label: 'LLM\n深度推理', x: 620, y: 300, itemStyle: { color: 'rgba(139,92,246,0.15)', borderColor: accent2 } },
          { name: 'rag', label: 'RAG\n知识检索', x: 780, y: 300, itemStyle: { color: 'rgba(6,182,212,0.1)', borderColor: accent } },
          { name: 'merge', label: '输出融合\n校验+过滤', x: 780, y: 100, itemStyle: { color: 'rgba(16,185,129,0.15)', borderColor: success } },
          { name: 'output', label: '最终输出', x: 950, y: 200, itemStyle: { color: bg2, borderColor: accent } }
        ],
        links: [
          { source: 'input', target: 'slm', cond: '原始数据' },
          { source: 'slm', target: 'router', cond: '意图+置信度' },
          { source: 'router', target: 'rule', cond: '简单/确定性', lineStyle: { color: success }},
          { source: 'router', target: 'llm', cond: '复杂/低置信度', lineStyle: { color: accent2 }},
          { source: 'llm', target: 'rag', cond: '上下文增强' },
          { source: 'rule', target: 'merge', cond: '确定性结果' },
          { source: 'llm', target: 'merge', cond: '生成结果', lineStyle: { color: accent2 }},
          { source: 'rag', target: 'merge', cond: '知识增强' },
          { source: 'merge', target: 'output', cond: '校验通过' }
        ]
      }]
    });
  }

  // Resize handler
  window.addEventListener('resize', function() {
    charts.forEach(function(c) { c.resize(); });
  });

  // ====== NAVIGATION ======

  window.switchPage = function(pageId) {
    var pages = document.querySelectorAll('.page');
    var navItems = document.querySelectorAll('.nav-item');
    pages.forEach(function(p) { p.classList.remove('active'); });
    navItems.forEach(function(n) { n.classList.remove('active'); });
    var target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    navItems.forEach(function(n) {
      if (n.getAttribute('data-page') === pageId) n.classList.add('active');
    });
    var titles = {
      'dashboard': ['项目仪表盘', '总览 / 项目仪表盘'],
      'cpm-pert': ['关键路径 / PERT', '仿真引擎 / 关键路径 / PERT'],
      'monte-carlo': ['蒙特卡洛模拟', '仿真引擎 / 蒙特卡洛模拟'],
      'resource': ['资源调度优化', '仿真引擎 / 资源调度优化'],
      'agile': ['敏捷预测', '仿真引擎 / 敏捷预测'],
      'evm': ['挣值成本管控', '仿真引擎 / 挣值成本管控'],
      'sd-des': ['系统动力学 / 离散事件', '仿真引擎 / 系统动力学 / 离散事件'],
      'ai-advisor': ['AI 推演顾问', 'AI 智能体 / AI 推演顾问'],
      'ai-arch': ['架构设计', 'AI 智能体 / 架构设计']
    };
    var t = titles[pageId] || ['', ''];
    document.getElementById('pageTitle').textContent = t[0];
    document.getElementById('pageBreadcrumb').textContent = t[1];
    setTimeout(function() { charts.forEach(function(c) { c.resize(); }); }, 100);
  };

  // Nav clicks
  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var page = this.getAttribute('data-page');
      if (page) switchPage(page);
    });
  });

  // Tab switching
  document.querySelectorAll('.tab-item').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var tabGroup = this.parentElement;
      var targetTab = this.getAttribute('data-tab');
      tabGroup.querySelectorAll('.tab-item').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      // Find sibling tab panels
      var parent = tabGroup.parentElement;
      parent.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
      var targetPanel = document.getElementById('tab-' + targetTab);
      if (targetPanel) targetPanel.classList.add('active');
      setTimeout(function() { charts.forEach(function(c) { c.resize(); }); }, 100);
    });
  });

  // ====== AI Chat ======

  var aiResponses = {
    '关键路径如果去掉UI设计活动会怎样？': function() {
      return {
        engine: '规则引擎(CPM) + SLM分析',
        text: '<b>关键路径变更分析结果：</b><br><br>' +
          '当前关键路径: A → B → D → E → G → H → I → J (128天)<br><br>' +
          '去掉UI设计活动(C)后：<br>' +
          '&#8226; C活动本身不在关键路径上(总时差=9天)，<strong>对关键路径无直接影响</strong><br>' +
          '&#8226; 但C活动是D活动(前端开发)的前驱之一，D活动当前EST仍由B决定(B→D=26天 > A→C→D=31天)<br>' +
          '&#8226; <strong>结论：去掉UI设计后，关键路径不变，总工期仍为128天</strong><br><br>' +
          '<span style="color:var(--warning)">注意：</span>去掉UI设计可能影响前端开发质量，间接增加返工风险。建议保留UI设计活动，但可缩短其工期。'
      };
    },
    '如果增加2名前端工程师，工期影响多大？': function() {
      return {
        engine: '规则引擎(资源受限调度) + SLM',
        text: '<b>资源调整推演结果：</b><br><br>' +
          '当前高级工程师资源：第6-8周需求3人，可用2人，缺口1人<br><br>' +
          '增加2名前端工程师后（假设1名高级+1名中级）：<br>' +
          '&#8226; <strong>W6-W8资源缺口消除</strong>：高级工程师可用=3人，满足需求<br>' +
          '&#8226; 前端开发并行度提升，工期从36天缩减至<strong>约28天</strong><br>' +
          '&#8226; API开发可提前启动（依赖前端交付），工期从29天缩减至<strong>约24天</strong><br>' +
          '&#8226; <strong>总工期预估缩短8-10天</strong>，从128天降至约118-120天<br><br>' +
          '<span style="color:var(--success)">成本影响：</span>增加2名前端工程师约增加成本¥15-20万，但工期缩短可节省管理成本约¥8万。净ROI约1.5:1。'
      };
    },
    '当前最大的3个风险和应对建议？': function() {
      return {
        engine: 'SLM(风险评分) + LLM(策略生成) + RAG(历史案例)',
        text: '<b>Top 3 关键风险及应对建议：</b><br><br>' +
          '<strong style="color:var(--danger)">1. 高级工程师资源瓶颈 (概率85%, 影响8天)</strong><br>' +
          '&#8226; 影响：W6-W8前端+后端并行开发受阻，工期延长8天<br>' +
          '&#8226; <strong>应对A</strong>：紧急调配1名高级工程师（内部借调/外包）<br>' +
          '&#8226; <strong>应对B</strong>：将非关键活动(C.UI设计、F.数据库)推迟至W9后，释放资源<br>' +
          '&#8226; <em>RAG案例参考：类似项目"XX云平台"通过外包DBA解决资源冲突，工期影响降至2天</em><br><br>' +
          '<strong style="color:var(--warning)">2. 架构设计延迟传导 (概率70%, 影响5天)</strong><br>' +
          '&#8226; 影响：已延迟5天，关键路径后移<br>' +
          '&#8226; <strong>应对A</strong>：并行推进部分模块的详细设计(需评审确认接口稳定性)<br>' +
          '&#8226; <strong>应对B</strong>：增加架构评审频次(周→日)，快速阻断设计偏差<br><br>' +
          '<strong style="color:var(--accent)">3. 成本超支趋势 (概率75%, 影响¥71万)</strong><br>' +
          '&#8226; CPI=0.94持续走低，EAC=¥1051万超BAC约7.2%<br>' +
          '&#8226; <strong>应对A</strong>：第8周前开展成本审查，识别超支根因<br>' +
          '&#8226; <strong>应对B</strong>：冻结需求范围(No-change period)，控制scope creep'
      };
    },
    '预测项目最终的效能指数？': function() {
      return {
        engine: 'SLM(预测模型) + 规则引擎(EVM推演)',
        text: '<b>项目效能预测 (EPI)：</b><br><br>' +
          '当前EPI: <strong>0.89</strong> (较上周-0.03，呈下降趋势)<br><br>' +
          '基于多因子回归模型预测：<br>' +
          '&#8226; <strong>乐观场景(P20)</strong>：EPI = 0.93 — 资源补充到位，需求冻结<br>' +
          '&#8226; <strong>基准场景(P50)</strong>：EPI = 0.87 — 维持现状，小幅恶化<br>' +
          '&#8226; <strong>悲观场景(P80)</strong>：EPI = 0.78 — 资源冲突未解决，需求持续变更<br><br>' +
          '<strong>效能影响因子排序：</strong><br>' +
          '1. 资源利用率 (权重28%) — 当前75%，目标≥85%<br>' +
          '2. 关键路径达成率 (权重22%) — 当前67%<br>' +
          '3. 需求稳定性 (权重18%) — 已变更12次<br>' +
          '4. 质量指标 (权重16%) — 缺陷密度2.3个/千行<br>' +
          '5. 成本效率 (权重10%) — CPI=0.94<br>' +
          '6. 团队效能 (权重6%) — 速率波动±15%<br><br>' +
          '<span style="color:var(--warning)">建议：</span>优先解决资源瓶颈和需求变更两个高权重因子，可将EPI提升至0.91以上。'
      };
    }
  };

  function addAIMessage(text, isUser, engine) {
    var container = document.getElementById('aiMessages');
    var msgDiv = document.createElement('div');
    msgDiv.className = 'ai-msg' + (isUser ? ' user-msg' : '');
    if (isUser) {
      msgDiv.innerHTML = '<div class="ai-msg-avatar user">&#128100;</div>' +
        '<div class="ai-msg-body"><div class="ai-msg-name">你</div><div class="ai-msg-text">' + text + '</div></div>';
    } else {
      var engineTag = engine ? '<div style="font-size:10px;color:var(--muted);margin-top:8px">推理引擎: ' + engine + '</div>' : '';
      msgDiv.innerHTML = '<div class="ai-msg-avatar ai">&#10024;</div>' +
        '<div class="ai-msg-body"><div class="ai-msg-name">ProjectSim AI</div><div class="ai-msg-text">' + text + engineTag + '</div></div>';
    }
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  }

  function addTypingIndicator() {
    var container = document.getElementById('aiMessages');
    var typingDiv = document.createElement('div');
    typingDiv.className = 'ai-msg';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<div class="ai-msg-avatar ai">&#10024;</div>' +
      '<div class="ai-msg-body"><div class="ai-msg-text"><div class="typing-indicator"><span></span><span></span><span></span></div></div></div>';
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
  }

  function removeTypingIndicator() {
    var el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  window.sendAIMessage = function() {
    var input = document.getElementById('aiInput');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addAIMessage(text, true);
    addTypingIndicator();

    setTimeout(function() {
      removeTypingIndicator();
      var response = aiResponses[text];
      if (response) {
        addAIMessage(response.text(), false, response.engine);
      } else {
        addAIMessage(
          '我理解你的问题是关于"' + text + '"。<br><br>' +
          '基于当前项目数据分析，我需要调用以下推理模块：<br>' +
          '&#8226; <span style="color:var(--accent)">SLM</span> — 意图解析与参数提取<br>' +
          '&#8226; <span style="color:var(--warning)">规则引擎</span> — CPM/资源约束仿真计算<br>' +
          '&#8226; <span style="color:var(--accent2)">LLM</span> — 策略建议生成<br><br>' +
          '<em style="color:var(--muted)">[原型演示模式 — 完整推理功能需连接后端服务]</em>',
          false,
          'SLM + 规则引擎 + LLM'
        );
      }
    }, 1200 + Math.random() * 800);
  };

  window.quickAsk = function(question) {
    document.getElementById('aiInput').value = question;
    sendAIMessage();
  };

  // Enter key to send
  document.getElementById('aiInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAIMessage();
    }
  });

  // PERT recalculate (demo animation)
  window.runPERT = function() {
    var btn = event.target;
    btn.textContent = '计算中...';
    btn.disabled = true;
    setTimeout(function() {
      btn.textContent = '重新计算';
      btn.disabled = false;
    }, 1500);
  };

  // Gantt view toggle (demo)
  window.toggleGanttView = function(view) {
    var tags = event.target.parentElement.querySelectorAll('.tag');
    tags.forEach(function(t) { t.classList.remove('active'); });
    event.target.classList.add('active');
  };

  // Responsive menu
  function checkResponsive() {
    var menuBtn = document.getElementById('menuBtn');
    if (window.innerWidth <= 768) {
      menuBtn.style.display = 'flex';
    } else {
      menuBtn.style.display = 'none';
      document.getElementById('sidebar').classList.remove('open');
    }
  }
  window.addEventListener('resize', checkResponsive);
  checkResponsive();

})();
