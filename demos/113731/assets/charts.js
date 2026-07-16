(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // ── Chart 1: Power consumption comparison ──
  var chartPower = echarts.init(document.getElementById('chart-power'), null, { renderer: 'svg' });
  var hours = [];
  for (var i = 0; i < 24; i++) { hours.push(i + ':00'); }

  // Simulated power data (watts)
  var normalPower = [];
  var lowPower = [];
  for (var i = 0; i < 24; i++) {
    if (i >= 0 && i < 7) {
      normalPower.push(45 + Math.random() * 5);
      lowPower.push(3 + Math.random() * 1);
    } else if (i >= 7 && i < 9) {
      normalPower.push(50 + Math.random() * 8);
      lowPower.push(8 + Math.random() * 4);
    } else if (i >= 9 && i < 23) {
      normalPower.push(55 + Math.random() * 10);
      lowPower.push(35 + Math.random() * 8);
    } else {
      normalPower.push(48 + Math.random() * 6);
      lowPower.push(3 + Math.random() * 1);
    }
  }

  chartPower.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink, fontSize: 13 } },
    legend: { data: ['常规运行', 'CloudNAS 低功耗'], textStyle: { color: muted, fontSize: 12 }, top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
    xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted, fontSize: 11 } },
    yAxis: { type: 'value', name: '功耗 (W)', nameTextStyle: { color: muted }, axisLine: { lineStyle: { color: rule } }, splitLine: { lineStyle: { color: rule } }, axisLabel: { color: muted, fontSize: 11 } },
    series: [
      {
        name: '常规运行',
        type: 'line',
        data: normalPower,
        smooth: true,
        lineStyle: { color: muted, width: 2 },
        areaStyle: { color: muted, opacity: 0.1 },
        itemStyle: { color: muted },
        symbol: 'none'
      },
      {
        name: 'CloudNAS 低功耗',
        type: 'line',
        data: lowPower,
        smooth: true,
        lineStyle: { color: accent, width: 2.5 },
        areaStyle: { color: accent, opacity: 0.15 },
        itemStyle: { color: accent },
        symbol: 'none'
      }
    ]
  });
  window.addEventListener('resize', function() { chartPower.resize(); });

  // ── Chart 2: Radar comparison ──
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  var indicators = [
    { name: '部署便捷性', max: 100 },
    { name: '外网访问', max: 100 },
    { name: '成本优势', max: 100 },
    { name: '功能完整度', max: 100 },
    { name: '低功耗支持', max: 100 }
  ];

  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true, backgroundColor: bg2, borderColor: rule, textStyle: { color: ink, fontSize: 13 } },
    legend: {
      data: ['CloudNAS Skill', '群晖 DSM', 'Nextcloud', 'FRP'],
      textStyle: { color: muted, fontSize: 12 },
      top: 0
    },
    radar: {
      indicator: indicators,
      center: ['50%', '55%'],
      radius: '60%',
      axisName: { color: muted, fontSize: 12 },
      splitArea: { areaStyle: { color: [bg, bg2] } },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        { value: [95, 95, 98, 70, 90], name: 'CloudNAS Skill', lineStyle: { color: accent, width: 2 }, areaStyle: { color: accent, opacity: 0.15 }, itemStyle: { color: accent } },
        { value: [40, 55, 20, 95, 85], name: '群晖 DSM', lineStyle: { color: accent2, width: 2 }, areaStyle: { color: accent2, opacity: 0.1 }, itemStyle: { color: accent2 } },
        { value: [25, 45, 55, 95, 20], name: 'Nextcloud', lineStyle: { color: muted, width: 2 }, areaStyle: { color: muted, opacity: 0.08 }, itemStyle: { color: muted } },
        { value: [35, 60, 45, 25, 10], name: 'FRP', lineStyle: { color: '#ef4444', width: 2 }, areaStyle: { color: '#ef4444', opacity: 0.08 }, itemStyle: { color: '#ef4444' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });

  // ── Chart 3: Component maturity bar ──
  var chartMaturity = echarts.init(document.getElementById('chart-maturity'), null, { renderer: 'svg' });
  var components = ['Cloudflare Tunnel', 'Docker', 'Caddy', 'FileBrowser', 'Nextcloud', 'WebDAV', 'Wake-on-LAN'];
  var stars = [4.8, 5.0, 4.7, 4.5, 4.6, 4.9, 4.3];
  var githubK = [18.5, 72, 52, 24, 31, 15, 8.2];

  chartMaturity.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      formatter: function(p) {
        return p[0].name + '<br/>成熟度评分: ' + p[0].value + ' / 5.0<br/>GitHub Stars: ' + (githubK[p[0].dataIndex]).toFixed(1) + 'k';
      }
    },
    grid: { left: '3%', right: '10%', bottom: '3%', top: '6%', containLabel: true },
    xAxis: { type: 'value', max: 5, axisLine: { lineStyle: { color: rule } }, splitLine: { lineStyle: { color: rule } }, axisLabel: { color: muted, fontSize: 11 } },
    yAxis: { type: 'category', data: components, axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted, fontSize: 11 } },
    series: [{
      type: 'bar',
      data: stars.map(function(v, i) {
        return {
          value: v,
          itemStyle: {
            color: v >= 4.7 ? accent : (v >= 4.5 ? accent2 : muted),
            borderRadius: [0, 4, 4, 0]
          }
        };
      }),
      barWidth: '55%',
      label: {
        show: true,
        position: 'right',
        formatter: '{c}',
        color: ink,
        fontSize: 12
      }
    }]
  });
  window.addEventListener('resize', function() { chartMaturity.resize(); });
})();