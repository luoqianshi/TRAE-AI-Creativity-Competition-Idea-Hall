/* ============================================================
 * 费曼录音转写官 · 图表渲染 v2（4个图表，基于真实数据）
 * 1. 知识卡片累计增长（柱状图）
 * 2. 知识类型分布（饼图）
 * 3. 学习阶段进度（玫瑰图）
 * 4. 本周打卡情况（柱状图）
 *
 * FIX:
 * - resize 监听器累积泄漏：使用单一 handler + WeakMap 管理
 * - 阶段逻辑从 app.js 的 FeynmanConfig 读取，不再硬编码
 * - chart 重建时先 dispose 再 init，避免 DOM 残留
 * ============================================================ */
window.FeynmanCharts = (function () {
  var chartInstances = {};   // id -> echarts instance
  var resizeHandler = null;  // 单一 resize handler

  function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function readFeynmanRecords() {
    try { var raw = localStorage.getItem('feynman_records_v1'); return raw ? JSON.parse(raw) : []; }
    catch(e) { return []; }
  }

  function readCheckInData() {
    try { var raw = localStorage.getItem('zikao_checkin_data'); return raw ? JSON.parse(raw) : {checkIns:[]}; }
    catch(e) { return {checkIns:[]}; }
  }

  function showEmpty(elId, msg) {
    var el = document.getElementById(elId);
    if (!el) return;
    // FIX: 先 dispose 旧实例
    if (chartInstances[elId]) {
      chartInstances[elId].dispose();
      delete chartInstances[elId];
    }
    el.innerHTML = '<div class="chart-empty"><span class="emoji">📊</span><p>'+msg+'</p></div>';
  }

  // FIX: 统一管理 chart 实例创建 + 单一 resize handler
  function getOrCreate(elId) {
    var el = document.getElementById(elId);
    if (!el) return null;
    // 清除 empty 占位
    if (el.querySelector('.chart-empty')) el.innerHTML = '';
    // 已存在则复用
    if (chartInstances[elId] && !chartInstances[elId].isDisposed()) {
      return chartInstances[elId];
    }
    // 旧实例已失效，清理
    if (chartInstances[elId]) {
      try { chartInstances[elId].dispose(); } catch(e) {}
      delete chartInstances[elId];
    }
    // 创建新实例
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chartInstances[elId] = chart;
    return chart;
  }

  // FIX: 单一 resize handler，遍历所有存活的 chart
  function ensureResizeHandler() {
    if (resizeHandler) return;
    resizeHandler = function() {
      for (var id in chartInstances) {
        if (chartInstances.hasOwnProperty(id)) {
          var c = chartInstances[id];
          if (c && !c.isDisposed()) {
            try { c.resize(); } catch(e) {}
          }
        }
      }
    };
    window.addEventListener('resize', resizeHandler);
  }

  /* ========== 1. 知识卡片累计增长 ========== */
  function renderBar(records) {
    if (!records.length) { showEmpty('chart-bar','还没有数据，去录音工作台生成第一张知识卡片吧'); return; }

    var byDate = {};
    records.forEach(function(r) { byDate[r.date] = (byDate[r.date]||0) + r.cards.length; });
    var dates = Object.keys(byDate).sort();
    if (!dates.length) { showEmpty('chart-bar','还没有数据'); return; }

    var cumulative = [], total = 0;
    dates.forEach(function(d) { total += byDate[d]; cumulative.push(total); });
    if (dates.length === 1) { dates.unshift('起始'); cumulative.unshift(0); }

    var xLabels = dates.map(function(d) { return d === '起始' ? d : d.substring(5).replace('-','.'); });
    var accent = getCSSVar('--accent'), accent2 = getCSSVar('--accent2');
    var ink = getCSSVar('--ink'), muted = getCSSVar('--muted'), rule = getCSSVar('--rule'), bg2 = getCSSVar('--bg2');
    var chart = getOrCreate('chart-bar');
    if (!chart) return;

    chart.setOption({
      tooltip: { trigger:'axis', appendToBody:true, backgroundColor:bg2, borderColor:rule, textStyle:{color:ink,fontSize:13},
        formatter: function(p) { return p[0].name+'<br/>累计知识卡片：<b style="color:'+accent+'">'+p[0].value+'</b> 张'; } },
      grid: { left:50, right:20, top:20, bottom:36 },
      xAxis: { type:'category', data:xLabels, axisLabel:{color:muted,fontSize:11}, axisLine:{lineStyle:{color:rule}}, axisTick:{show:false} },
      yAxis: { type:'value', name:'累计', nameTextStyle:{color:muted,fontSize:11}, axisLabel:{color:muted,fontSize:11}, axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:rule,type:'dashed'}} },
      series: [{ name:'累计知识卡片', type:'bar', data:cumulative,
        itemStyle: { color: { type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:accent},{offset:1,color:accent2}] }, borderRadius:[6,6,0,0] },
        barWidth:'55%',
        label: { show: cumulative.length<=12, position:'top', color:accent, fontSize:11, fontWeight:600 }
      }],
      animation: true, animationDuration: 600, animationEasing: 'cubicOut'
    }, true);
  }

  /* ========== 2. 知识类型分布 ========== */
  function renderPie(records) {
    var byType = {}, totalCards = 0;
    records.forEach(function(r) { r.cards.forEach(function(c) { totalCards++; (c.tags||['其他']).forEach(function(t) { byType[t]=(byType[t]||0)+1; }); }); });
    var types = Object.keys(byType);
    if (!types.length) { showEmpty('chart-pie','还没有数据，生成知识卡片后这里会显示类型分布'); return; }

    var accent = getCSSVar('--accent'), accent2 = getCSSVar('--accent2');
    var ink = getCSSVar('--ink'), muted = getCSSVar('--muted'), rule = getCSSVar('--rule'), bg2 = getCSSVar('--bg2');
    var palette = [accent, accent2, '#9b8ec4', '#c3bce0', '#a78bfa', '#818cf8'];
    var data = types.map(function(t,i) { return { value:byType[t], name:t, itemStyle:{color:palette[i%palette.length]} }; }).sort(function(a,b){return b.value-a.value;});
    var chart = getOrCreate('chart-pie');
    if (!chart) return;

    chart.setOption({
      tooltip: { trigger:'item', appendToBody:true, backgroundColor:bg2, borderColor:rule, textStyle:{color:ink,fontSize:13},
        formatter: function(p) { return p.name+'<br/>知识卡片：<b style="color:'+p.color+'">'+p.value+'</b> 张 ('+p.percent+'%)'; } },
      legend: { bottom:8, left:'center', textStyle:{color:muted,fontSize:12}, itemWidth:12, itemHeight:12, itemGap:16 },
      series: [{ name:'知识类型分布', type:'pie', radius:['40%','66%'], center:['50%','44%'], avoidLabelOverlap:true,
        itemStyle:{borderColor:bg2,borderWidth:3},
        label:{show:true,formatter:'{b}\n{d}%',color:ink,fontSize:12,fontWeight:600},
        labelLine:{lineStyle:{color:rule}},
        emphasis:{itemStyle:{shadowBlur:12,shadowColor:'rgba(102,126,234,0.3)'},label:{fontSize:14}},
        data:data
      }],
      animation:true, animationDuration:600, animationEasing:'cubicOut'
    }, true);
  }

  /* ========== 3. 学习阶段进度（玫瑰图） ========== */
  function renderPhase() {
    // FIX: 从 app.js 的 FeynmanConfig 读取，不再硬编码
    var cfg = window.FeynmanConfig;
    if (!cfg) { showEmpty('chart-phase','配置加载中…'); return; }
    var PHASES = cfg.PHASES;
    var today = new Date();
    var weekNum = cfg.getWeekNumber(today);

    var data = PHASES.map(function(p) {
      var phaseWeeks = p.weeks[1]-p.weeks[0]+1;
      var progress = 0;
      if (weekNum > p.weeks[1]) progress = 100;
      else if (weekNum >= p.weeks[0]) progress = Math.round(((weekNum-p.weeks[0]+1)/phaseWeeks)*100);
      return { name: p.icon+' '+p.name, value: Math.max(progress, 5), realProgress: progress, itemStyle:{color:p.color} };
    });

    var ink = getCSSVar('--ink'), muted = getCSSVar('--muted'), rule = getCSSVar('--rule'), bg2 = getCSSVar('--bg2');
    var chart = getOrCreate('chart-phase');
    if (!chart) return;

    chart.setOption({
      tooltip: { trigger:'item', appendToBody:true, backgroundColor:bg2, borderColor:rule, textStyle:{color:ink,fontSize:13},
        formatter: function(p) { return p.name+'<br/>完成进度：<b style="color:'+p.color+'">'+p.data.realProgress+'%</b>'; } },
      legend: { bottom:8, left:'center', textStyle:{color:muted,fontSize:11}, itemWidth:10, itemHeight:10, itemGap:12 },
      series: [{ name:'学习阶段进度', type:'pie', radius:['25%','70%'], center:['50%','44%'], roseType:'radius',
        itemStyle:{borderRadius:6,borderColor:bg2,borderWidth:2},
        label:{show:true,formatter:'{b}\n{d}%',color:ink,fontSize:11,fontWeight:600},
        labelLine:{lineStyle:{color:rule},length:8,length2:12},
        emphasis:{itemStyle:{shadowBlur:12,shadowColor:'rgba(0,0,0,0.15)'}},
        data:data
      }],
      animation:true, animationDuration:600, animationEasing:'cubicOut'
    }, true);
  }

  /* ========== 4. 本周打卡情况 ========== */
  function renderWeek() {
    var checkInData = readCheckInData();
    var checkIns = checkInData.checkIns || [];

    var today = new Date();
    var dow = today.getDay() || 7;
    var monday = new Date(today);
    monday.setDate(today.getDate() - dow + 1);

    var weekLabels = ['周一','周二','周三','周四','周五','周六','周日'];
    var weekData = [];
    var fmt = function(d) {
      return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
    };

    for (var i=0;i<7;i++) {
      var d = new Date(monday);
      d.setDate(monday.getDate()+i);
      var ds = fmt(d);
      var checked = checkIns.indexOf(ds) >= 0;
      var isFuture = d > today;
      weekData.push({ value: checked ? 1 : 0, checked: checked, isFuture: isFuture, date: ds, label: weekLabels[i] });
    }

    var ink = getCSSVar('--ink'), muted = getCSSVar('--muted'), rule = getCSSVar('--rule'), bg2 = getCSSVar('--bg2');
    var green = getCSSVar('--green');
    var chart = getOrCreate('chart-week');
    if (!chart) return;

    chart.setOption({
      tooltip: { trigger:'axis', appendToBody:true, backgroundColor:bg2, borderColor:rule, textStyle:{color:ink,fontSize:13},
        formatter: function(p) {
          var d = p[0].data;
          var status = d.checked ? '<b style="color:'+green+'">已打卡 ✓</b>' : (d.isFuture ? '<span style="color:'+muted+'">未到日期</span>' : '<span style="color:#ef4444">未打卡</span>');
          return d.date+' '+d.label+'<br/>'+status;
        }
      },
      grid: { left:40, right:20, top:20, bottom:30 },
      xAxis: { type:'category', data:weekLabels, axisLabel:{color:muted,fontSize:12}, axisLine:{lineStyle:{color:rule}}, axisTick:{show:false} },
      yAxis: { type:'value', max:1, axisLabel:{show:false}, axisLine:{show:false}, axisTick:{show:false}, splitLine:{show:false} },
      series: [{ name:'打卡状态', type:'bar', data: weekData.map(function(d) {
          return { value:d.value, checked:d.checked, isFuture:d.isFuture, date:d.date, label:d.label,
            itemStyle: { color: d.checked ? green : (d.isFuture ? '#e8e8f5' : '#f5d5d5'), borderRadius:[6,6,0,0] } };
        }),
        barWidth:'50%',
        label: { show:true, position:'top', formatter: function(p) { return p.data.checked ? '✓' : ''; }, color:green, fontSize:16, fontWeight:700 }
      }],
      animation:true, animationDuration:600, animationEasing:'cubicOut'
    }, true);
  }

  function render() {
    ensureResizeHandler();
    var records = readFeynmanRecords();
    renderBar(records);
    renderPie(records);
    renderPhase();
    renderWeek();
  }

  return { render: render };
})();
