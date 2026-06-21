// assets/charts.js — DeepSeek Quota Guard 数据可视化
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();
  var warn = style.getPropertyValue('--warn').trim();
  var success = style.getPropertyValue('--success').trim();

  // ===== Chart 1: 近7日 Token 消耗趋势 =====
  var chartTrend = echarts.init(document.getElementById('chart-token-trend'), null, { renderer: 'svg' });
  var days = ['6/14', '6/15', '6/16', '6/17', '6/18', '6/19', '6/20'];
  chartTrend.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 12 },
      formatter: function(params) {
        var s = '<div style="font-weight:600;margin-bottom:4px">' + params[0].axisValue + '</div>';
        params.forEach(function(p) {
          s += '<div style="display:flex;align-items:center;gap:6px;margin:2px 0">'
            + '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + p.color + '"></span>'
            + '<span>' + p.seriesName + '：</span>'
            + '<span style="font-weight:600;font-family:monospace">' + (p.value / 10000).toFixed(1) + ' 万</span></div>';
        });
        return s;
      }
    },
    legend: {
      data: ['输入 Token', '输出 Token', '缓存命中'],
      top: 0,
      textStyle: { color: muted, fontSize: 11 },
      itemWidth: 16, itemHeight: 8
    },
    grid: { top: 40, right: 20, bottom: 30, left: 55 },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'Token 数',
      nameTextStyle: { color: muted, fontSize: 10 },
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 10, formatter: function(v) { return (v / 10000).toFixed(0) + '万'; } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '输入 Token',
        type: 'line',
        data: [3200000, 2800000, 4100000, 3600000, 5200000, 4800000, 3900000],
        smooth: true,
        lineStyle: { width: 2.5, color: accent },
        itemStyle: { color: accent },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent + '30' }, { offset: 1, color: accent + '05' }] } },
        symbol: 'circle', symbolSize: 6
      },
      {
        name: '输出 Token',
        type: 'line',
        data: [800000, 720000, 1050000, 920000, 1380000, 1250000, 980000],
        smooth: true,
        lineStyle: { width: 2.5, color: accent2 },
        itemStyle: { color: accent2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent2 + '25' }, { offset: 1, color: accent2 + '05' }] } },
        symbol: 'circle', symbolSize: 6
      },
      {
        name: '缓存命中',
        type: 'bar',
        data: [2100000, 1850000, 2900000, 2500000, 3800000, 3500000, 2800000],
        barWidth: '30%',
        itemStyle: { color: accent + '40', borderRadius: [3, 3, 0, 0] }
      }
    ]
  });
  window.addEventListener('resize', function() { chartTrend.resize(); });

  // ===== Chart 2: 各模型 Token 用量占比 =====
  var chartPie = echarts.init(document.getElementById('chart-model-pie'), null, { renderer: 'svg' });
  chartPie.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 12 },
      formatter: function(p) {
        return '<div style="font-weight:600;margin-bottom:4px">' + p.name + '</div>'
          + '<div>Token 用量：<span style="font-weight:600;font-family:monospace">' + (p.value / 10000).toFixed(0) + ' 万</span></div>'
          + '<div>占比：<span style="font-weight:600;font-family:monospace">' + p.percent + '%</span></div>';
      }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: muted, fontSize: 11 },
      itemWidth: 12, itemHeight: 12
    },
    series: [{
      type: 'pie',
      radius: ['42%', '72%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg, borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 'bold', color: ink },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' }
      },
      data: [
        { value: 15600000, name: 'DeepSeek V4-Pro', itemStyle: { color: accent } },
        { value: 8200000, name: 'DeepSeek V3', itemStyle: { color: accent2 } },
        { value: 4800000, name: 'DeepSeek Chat', itemStyle: { color: warn } },
        { value: 2400000, name: 'DeepSeek Coder', itemStyle: { color: success } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartPie.resize(); });

  // ===== Chart 3: 多 API Key 日均消耗对比 =====
  var chartKey = echarts.init(document.getElementById('chart-key-compare'), null, { renderer: 'svg' });
  var keyNames = ['sk-prod-***a1b2', 'sk-dev-***c3d4', 'sk-test-***e5f6', 'sk-research-***g7h8'];
  chartKey.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 12 },
      formatter: function(params) {
        var s = '<div style="font-weight:600;margin-bottom:4px">' + params[0].axisValue + '</div>';
        params.forEach(function(p) {
          s += '<div style="display:flex;align-items:center;gap:6px;margin:2px 0">'
            + '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + p.color + '"></span>'
            + '<span>' + p.seriesName + '：</span>'
            + '<span style="font-weight:600;font-family:monospace">' + (p.value / 10000).toFixed(1) + ' 万</span></div>';
        });
        return s;
      }
    },
    legend: {
      data: keyNames,
      top: 0,
      textStyle: { color: muted, fontSize: 11 },
      itemWidth: 16, itemHeight: 8
    },
    grid: { top: 45, right: 20, bottom: 30, left: 55 },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'Token 数',
      nameTextStyle: { color: muted, fontSize: 10 },
      axisLine: { show: false },
      axisLabel: { color: muted, fontSize: 10, formatter: function(v) { return (v / 10000).toFixed(0) + '万'; } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: keyNames[0],
        type: 'line',
        data: [1800000, 1600000, 2200000, 2000000, 2800000, 2600000, 2100000],
        smooth: true,
        lineStyle: { width: 2, color: accent },
        itemStyle: { color: accent },
        symbol: 'circle', symbolSize: 5
      },
      {
        name: keyNames[1],
        type: 'line',
        data: [900000, 750000, 1100000, 950000, 1400000, 1300000, 1050000],
        smooth: true,
        lineStyle: { width: 2, color: accent2 },
        itemStyle: { color: accent2 },
        symbol: 'circle', symbolSize: 5
      },
      {
        name: keyNames[2],
        type: 'line',
        data: [350000, 300000, 520000, 450000, 650000, 580000, 480000],
        smooth: true,
        lineStyle: { width: 2, color: warn },
        itemStyle: { color: warn },
        symbol: 'circle', symbolSize: 5
      },
      {
        name: keyNames[3],
        type: 'line',
        data: [150000, 150000, 280000, 200000, 350000, 320000, 270000],
        smooth: true,
        lineStyle: { width: 2, color: success },
        itemStyle: { color: success },
        symbol: 'circle', symbolSize: 5
      }
    ]
  });
  window.addEventListener('resize', function() { chartKey.resize(); });
})();
