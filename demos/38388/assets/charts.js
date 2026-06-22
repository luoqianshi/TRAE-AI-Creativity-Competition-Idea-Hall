(function() {
  'use strict';

  var root = document.documentElement;
  var style = getComputedStyle(root);
  var accent = style.getPropertyValue('--accent').trim() || '#6366f1';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#06b6d4';
  var ink = style.getPropertyValue('--ink').trim() || '#e2e8f0';
  var muted = style.getPropertyValue('--muted').trim() || '#7b89a6';
  var rule = style.getPropertyValue('--rule').trim() || '#1e2a45';
  var bg2 = style.getPropertyValue('--bg2').trim() || '#111827';
  var danger = style.getPropertyValue('--danger').trim() || '#ef4444';
  var warning = style.getPropertyValue('--warning').trim() || '#f59e0b';
  var success = style.getPropertyValue('--success').trim() || '#22c55e';

  // === Radar Chart ===
  var radarChart = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  radarChart.setOption({
    tooltip: {},
    radar: {
      indicator: [
        { name: 'HTTPS 配置', max: 100 },
        { name: 'SSL 证书', max: 100 },
        { name: '安全响应头', max: 100 },
        { name: '敏感路径', max: 100 },
        { name: 'CSP 策略', max: 100 },
        { name: 'HSTS', max: 100 },
        { name: 'XSS 检测', max: 100 },
        { name: 'SQLi 检测', max: 100 },
        { name: 'WAF 识别', max: 100 },
        { name: '修复指导', max: 100 }
      ],
      splitArea: { areaStyle: { color: ['rgba(99,102,241,0.02)', 'rgba(99,102,241,0.06)'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } },
      name: { textStyle: { color: muted, fontSize: 11 } }
    },
    series: [{
      type: 'radar',
      data: [{ value: [90, 85, 95, 80, 88, 92, 82, 78, 85, 90], name: '漏洞哨兵 V10' }],
      areaStyle: { color: 'rgba(99,102,241,0.2)' },
      lineStyle: { color: accent, width: 2 },
      itemStyle: { color: accent2 }
    }]
  });

  // === Bar Chart ===
  var barChart = echarts.init(document.getElementById('chart-bar'), null, { renderer: 'svg' });
  barChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['缺少 HTTPS', '缺少 HSTS', '缺少 CSP', '开放敏感路径', '缺少 X-Frame', '弱 SSL 配置', 'XSS 风险', 'SQLi 风险', '缺少 CORS', '信息泄露'],
      axisLabel: { color: muted, fontSize: 10, rotate: 30 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { alignWithLabel: true }
    },
    yAxis: {
      type: 'value',
      name: '检出频率',
      nameTextStyle: { color: muted, fontSize: 10 },
      axisLabel: { color: muted, fontSize: 10 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: [
        { value: 35, itemStyle: { color: danger } },
        { value: 52, itemStyle: { color: danger } },
        { value: 68, itemStyle: { color: danger } },
        { value: 28, itemStyle: { color: warning } },
        { value: 73, itemStyle: { color: danger } },
        { value: 41, itemStyle: { color: warning } },
        { value: 22, itemStyle: { color: warning } },
        { value: 18, itemStyle: { color: success } },
        { value: 45, itemStyle: { color: warning } },
        { value: 33, itemStyle: { color: warning } }
      ],
      barWidth: '60%',
      itemStyle: { borderRadius: [4, 4, 0, 0] }
    }]
  });

  // === Resize ===
  window.addEventListener('resize', function() {
    radarChart.resize();
    barChart.resize();
  });
})();