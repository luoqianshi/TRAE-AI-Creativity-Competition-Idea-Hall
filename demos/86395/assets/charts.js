(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: Revenue & Net Profit Trend ---
  (function() {
    var chart1 = echarts.init(document.getElementById('chart-revenue-profit'), null, { renderer: 'svg' });
    chart1.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { data: ['营业收入', '净利润', '营收增速', '净利润增速'], bottom: 0, textStyle: { color: muted } },
      grid: { left: '8%', right: '8%', top: '12%', bottom: '15%' },
      xAxis: { type: 'category', data: ['2023', '2024', '2025', '2026Q1'], axisLabel: { color: muted }, axisLine: { lineStyle: { color: rule } } },
      yAxis: [
        { type: 'value', name: '金额(亿元)', nameTextStyle: { color: muted }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
        { type: 'value', name: '增速(%)', nameTextStyle: { color: muted }, axisLabel: { color: muted }, splitLine: { show: false } }
      ],
      series: [
        { name: '营业收入', type: 'bar', data: [4009, 3620, 4237, 1291], itemStyle: { color: accent }, barWidth: '28%' },
        { name: '净利润', type: 'bar', data: [441, 507, 722, 207], itemStyle: { color: accent2 }, barWidth: '28%' },
        { name: '营收增速', type: 'line', yAxisIndex: 1, data: [22.0, -9.7, 17.0, 52.5], lineStyle: { color: accent, type: 'dashed' }, itemStyle: { color: accent }, symbol: 'circle', symbolSize: 8 },
        { name: '净利润增速', type: 'line', yAxisIndex: 1, data: [43.6, 15.0, 42.3, 48.5], lineStyle: { color: accent2, type: 'dashed' }, itemStyle: { color: accent2 }, symbol: 'circle', symbolSize: 8 }
      ]
    });
    window.addEventListener('resize', function() { chart1.resize(); });
  })();

  // --- Chart 2: Business Segment Revenue Breakdown ---
  (function() {
    var chart2 = echarts.init(document.getElementById('chart-segment-revenue'), null, { renderer: 'svg' });
    chart2.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}亿元 ({d}%)' },
      legend: { bottom: 0, textStyle: { color: muted } },
      series: [{
        type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
        label: { color: ink, formatter: '{b}\n{d}%' },
        data: [
          { value: 3165, name: '动力电池系统', itemStyle: { color: accent } },
          { value: 624, name: '储能电池系统', itemStyle: { color: accent2 } },
          { value: 219, name: '电池材料及回收', itemStyle: { color: accent + 'cc' } },
          { value: 229, name: '其他业务', itemStyle: { color: muted } }
        ]
      }]
    });
    window.addEventListener('resize', function() { chart2.resize(); });
  })();

  // --- Chart 3: Global Battery Market Share 2025 ---
  (function() {
    var chart3 = echarts.init(document.getElementById('chart-market-share'), null, { renderer: 'svg' });
    chart3.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      grid: { left: '3%', right: '5%', top: '8%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', name: '市场份额(%)', nameTextStyle: { color: muted }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
      yAxis: { type: 'category', data: ['日韩企业', '国轩高科', '中创新航', 'LG新能源', '比亚迪', '宁德时代'], axisLabel: { color: ink }, axisLine: { lineStyle: { color: rule } } },
      series: [{
        type: 'bar', data: [
          { value: 5.7, itemStyle: { color: muted } },
          { value: 4.5, itemStyle: { color: muted } },
          { value: 5.3, itemStyle: { color: accent + '99' } },
          { value: 9.2, itemStyle: { color: accent2 + '99' } },
          { value: 16.4, itemStyle: { color: accent2 } },
          { value: 39.2, itemStyle: { color: accent } }
        ],
        label: { show: true, position: 'right', color: ink, formatter: '{c}%' }
      }]
    });
    window.addEventListener('resize', function() { chart3.resize(); });
  })();

  // --- Chart 4: Gross Margin & ROE Trend ---
  (function() {
    var chart4 = echarts.init(document.getElementById('chart-margin-roe'), null, { renderer: 'svg' });
    chart4.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { data: ['毛利率', '净利率', 'ROE'], bottom: 0, textStyle: { color: muted } },
      grid: { left: '8%', right: '5%', top: '12%', bottom: '15%' },
      xAxis: { type: 'category', data: ['2023', '2024', '2025', '2026Q1'], axisLabel: { color: muted }, axisLine: { lineStyle: { color: rule } } },
      yAxis: { type: 'value', name: '%', nameTextStyle: { color: muted }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
      series: [
        { name: '毛利率', type: 'line', data: [22.9, 24.4, 26.3, 24.8], lineStyle: { color: accent }, itemStyle: { color: accent }, symbol: 'circle', symbolSize: 10, areaStyle: { color: accent + '20' } },
        { name: '净利率', type: 'line', data: [11.0, 14.0, 18.1, 20.0], lineStyle: { color: accent2 }, itemStyle: { color: accent2 }, symbol: 'diamond', symbolSize: 10 },
        { name: 'ROE', type: 'line', data: [22.3, 24.0, 24.7, 25.0], lineStyle: { color: accent + '99' }, itemStyle: { color: accent + '99' }, symbol: 'triangle', symbolSize: 10 }
      ]
    });
    window.addEventListener('resize', function() { chart4.resize(); });
  })();

  // --- Chart 5: Valuation PE Band ---
  (function() {
    var chart5 = echarts.init(document.getElementById('chart-pe-band'), null, { renderer: 'svg' });
    chart5.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      grid: { left: '8%', right: '5%', top: '10%', bottom: '8%' },
      xAxis: { type: 'category', data: ['2021末', '2022末', '2023末', '2024Q1', '2024末', '2025Q2', '2025末', '2026Q1', '2026.06'], axisLabel: { color: muted, rotate: 30 }, axisLine: { lineStyle: { color: rule } } },
      yAxis: { type: 'value', name: 'PE(TTM)', nameTextStyle: { color: muted }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
      series: [
        { name: 'PE(TTM)', type: 'line', data: [120, 55, 20, 15, 22, 30, 26, 24, 23],
          lineStyle: { color: accent, width: 3 }, itemStyle: { color: accent }, areaStyle: { color: accent + '10' } },
        { name: '5年均值50.7x', type: 'line', data: [50.7, 50.7, 50.7, 50.7, 50.7, 50.7, 50.7, 50.7, 50.7],
          lineStyle: { color: accent2, type: 'dashed', width: 1.5 }, itemStyle: { color: 'transparent' }, symbol: 'none' },
        { name: '历史最低PE', type: 'line', data: [15, 15, 15, 15, 15, 15, 15, 15, 15],
          lineStyle: { color: muted, type: 'dotted', width: 1 }, itemStyle: { color: 'transparent' }, symbol: 'none' }
      ]
    });
    window.addEventListener('resize', function() { chart5.resize(); });
  })();

  // --- Chart 6: Policy Impact Assessment ---
  (function() {
    var chart6 = echarts.init(document.getElementById('chart-policy-impact'), null, { renderer: 'svg' });
    var scores = [
      ['电池安全新国标', 5],
      ['储能容量电价', 5],
      ['财政政策扩张', 5],
      ['LRS技术授权', 5],
      ['碳排放双控', 4],
      ['购置税减免调整', 3],
      ['电池回收EPR', 3],
      ['货币政策宽松', 3],
      ['欧洲本土化', 3],
      ['欧盟反补贴关税', 0],
      ['1260H军事清单', -2],
      ['欧盟新电池法', -1],
      ['印度本地化', 0],
      ['美国IRA FEOC', -2],
      ['中美地缘对抗', -4],
      ['美国关税升级', -4]
    ];
    chart6.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true, formatter: function(p) { return p[0].name + ': ' + (p[0].value > 0 ? '+' : '') + p[0].value; } },
      grid: { left: '3%', right: '8%', top: '8%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', name: '影响力度', min: -5, max: 5, nameTextStyle: { color: muted }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
      yAxis: { type: 'category', data: scores.map(function(d) { return d[0]; }).reverse(), axisLabel: { color: ink }, axisLine: { lineStyle: { color: rule } } },
      series: [{
        type: 'bar', data: scores.map(function(d) { return { value: d[1], itemStyle: { color: d[1] > 0 ? accent2 : d[1] < 0 ? accent : muted } }; }).reverse(),
        label: { show: true, position: 'right', color: ink, formatter: function(p) { return (p.value > 0 ? '+' : '') + p.value; } }
      }]
    });
    window.addEventListener('resize', function() { chart6.resize(); });
  })();

  // --- Chart 7: Analyst Consensus ---
  (function() {
    var chart7 = echarts.init(document.getElementById('chart-analyst'), null, { renderer: 'svg' });
    chart7.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true },
      legend: { bottom: 0, textStyle: { color: muted } },
      series: [{
        type: 'pie', radius: ['55%', '78%'], center: ['50%', '45%'],
        label: { color: ink, formatter: '{b}\n{d}%' },
        emphasis: { disabled: true },
        data: [
          { value: 27, name: '买入', itemStyle: { color: accent2 } },
          { value: 3, name: '增持', itemStyle: { color: accent } },
          { value: 0, name: '减持/卖出', itemStyle: { color: muted } }
        ]
      }]
    });
    window.addEventListener('resize', function() { chart7.resize(); });
  })();

  // --- Chart 8: Competitor Comparison ---
  (function() {
    var chart8 = echarts.init(document.getElementById('chart-competitor'), null, { renderer: 'svg' });
    chart8.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { data: ['PE(TTM)', '2025净利润增速(%)'], bottom: 0, textStyle: { color: muted } },
      grid: { left: '8%', right: '8%', top: '12%', bottom: '15%' },
      xAxis: { type: 'category', data: ['宁德时代', '比亚迪', '亿纬锂能', '国轩高科', '行业均值'], axisLabel: { color: muted }, axisLine: { lineStyle: { color: rule } } },
      yAxis: [
        { type: 'value', name: 'PE(TTM)', nameTextStyle: { color: muted }, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
        { type: 'value', name: '增速(%)', nameTextStyle: { color: muted }, axisLabel: { color: muted }, splitLine: { show: false } }
      ],
      series: [
        { name: 'PE(TTM)', type: 'bar', data: [22.8, 31.8, 27.6, 22.7, 47.4], itemStyle: { color: accent }, barWidth: '30%' },
        { name: '2025净利润增速(%)', type: 'line', yAxisIndex: 1, data: [42.3, 35, 15, 10, 15], lineStyle: { color: accent2 }, itemStyle: { color: accent2 }, symbol: 'circle', symbolSize: 10 }
      ]
    });
    window.addEventListener('resize', function() { chart8.resize(); });
  })();

})();