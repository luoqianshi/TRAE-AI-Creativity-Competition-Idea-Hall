// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();
  var card = style.getPropertyValue('--bg2').trim();
  var success = style.getPropertyValue('--success').trim();
  var danger = style.getPropertyValue('--danger').trim();

  // --- Chart: Efficiency Comparison ---
  var chartEff = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEff.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      backgroundColor: bg3,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['传统工具（Slack/微信）', '三体协作'],
      top: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: { left: '3%', right: '4%', bottom: '6%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['决策对齐\n时间', '信息追溯\n完整度(%)', '观点分歧\n发现速度', '会议频率\n(次/周)', '知识沉淀\n效率(%)'],
      axisLabel: { color: muted, fontSize: 11, interval: 0 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value', max: 120,
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: '传统工具（Slack/微信）',
        type: 'bar', barWidth: '28%',
        itemStyle: { color: accent2 + '88', borderRadius: [4,4,0,0] },
        data: [15, 25, 20, 85, 30]
      },
      {
        name: '三体协作',
        type: 'bar', barWidth: '28%',
        itemStyle: { color: accent + 'cc', borderRadius: [4,4,0,0] },
        data: [95, 98, 92, 25, 95]
      }
    ]
  });
  window.addEventListener('resize', function() { chartEff.resize(); });

  // --- Chart: Consensus Heatmap ---
  var chartCon = echarts.init(document.getElementById('chart-consensus'), null, { renderer: 'svg' });
  var members = ['李工', '王设计', '张PM', '赵架构', '陈测试'];
  var topics = ['Rust方案', 'Go方案', '性能优先', '开发效率', '学习成本', '团队经验'];

  var heatData = [];
  var consensusVals = [0.85, 0.60, 0.75, 0.45, 0.90, 0.55];
  topics.forEach(function(t, ti) {
    members.forEach(function(m, mi) {
      // Generate plausible values with some noise
      var base = consensusVals[ti];
      var val = Math.max(0, Math.min(1, base + (Math.sin(mi * 2.3 + ti * 1.7) * 0.15)));
      heatData.push([mi, ti, +val.toFixed(2)]);
    });
  });

  chartCon.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg3,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      formatter: function(p) {
        return members[p.value[0]] + ' × ' + topics[p.value[1]] + '<br/>观点一致性：<strong>' + (p.value[2]*100).toFixed(0) + '%</strong>';
      }
    },
    grid: { left: '10%', right: '12%', bottom: '10%', top: '6%', containLabel: false },
    xAxis: {
      type: 'category', data: members,
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category', data: topics,
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    visualMap: {
      min: 0, max: 1, calculable: false,
      orient: 'vertical', right: '2%', top: 'center',
      itemWidth: 14, itemHeight: 120,
      textStyle: { color: muted, fontSize: 10 },
      inRange: { color: [bg3 + 'ee', accent2 + '33', accent + '88', accent] },
      outOfRange: { color: 'transparent' }
    },
    series: [{
      type: 'heatmap',
      data: heatData,
      label: {
        show: true,
        formatter: function(p) { return (p.value[2]*100).toFixed(0) + '%'; },
        color: ink,
        fontSize: 11
      },
      itemStyle: { borderColor: rule, borderWidth: 2, borderRadius: 4 },
      emphasis: {
        itemStyle: { borderColor: accent, borderWidth: 2, shadowBlur: 10, shadowColor: accent + '66' }
      }
    }]
  });
  window.addEventListener('resize', function() { chartCon.resize(); });
})();
