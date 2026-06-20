// assets/charts.js
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

  var palette = [accent, accent2, accent3, '#a855f7', danger, success, muted, accent + '99', accent2 + '99'];

  // Common tooltip config
  var tooltip = {
    trigger: 'axis',
    appendToBody: true,
    backgroundColor: bg3,
    borderColor: rule,
    textStyle: { color: ink, fontSize: 13 }
  };

  // --- Chart: Investment Direction (Radar) ---
  var chartDirection = echarts.init(document.getElementById('chart-direction'), null, { renderer: 'svg' });
  chartDirection.setOption({
    tooltip: { trigger: 'item', appendToBody: true, backgroundColor: bg3, borderColor: rule, textStyle: { color: ink } },
    legend: {
      data: ['当前热度', '推荐关注'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemGap: 20
    },
    radar: {
      indicator: [
        { name: 'AI/算力', max: 100 },
        { name: '半导体', max: 100 },
        { name: '新能源', max: 100 },
        { name: '医药生物', max: 100 },
        { name: '消费复苏', max: 100 },
        { name: '红利高股息', max: 100 },
        { name: '黄金避险', max: 100 },
        { name: '军工航天', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [95, 88, 62, 55, 48, 72, 85, 58],
          name: '当前热度',
          areaStyle: { color: accent + '30' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [90, 82, 78, 70, 65, 68, 75, 72],
          name: '推荐关注',
          areaStyle: { color: accent2 + '30' },
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    }],
    animation: false
  });
  window.addEventListener('resize', function() { chartDirection.resize(); });

  // --- Chart: Valuation Scatter (PE vs Change) ---
  var chartValuation = echarts.init(document.getElementById('chart-valuation'), null, { renderer: 'svg' });
  var scatterData = [
    [6.2, 0.89, '招商银行'],
    [8.9, 1.35, '中国平安'],
    [15.8, -2.30, '隆基绿能'],
    [18.5, 3.12, '药明康德'],
    [22.1, 1.82, '宁德时代'],
    [25.4, -0.45, '比亚迪'],
    [28.6, 2.35, '贵州茅台'],
    [42.3, -1.65, '中芯国际'],
    [12.5, 4.20, '紫金矿业'],
    [9.8, 2.80, '中国神华'],
    [35.2, -0.85, '恒瑞医药'],
    [16.3, 5.15, '三一重工'],
    [20.5, 1.25, '美的集团'],
    [11.8, 3.60, '格力电器'],
    [55.0, 6.80, '寒武纪'],
    [48.5, -3.20, '金山办公']
  ];
  chartValuation.setOption({
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg3,
      borderColor: rule,
      textStyle: { color: ink },
      formatter: function(p) {
        return '<strong>' + p.data[2] + '</strong><br/>PE(TTM): ' + p.data[0] + '<br/>日涨幅: ' + (p.data[1] > 0 ? '+' : '') + p.data[1] + '%';
      }
    },
    grid: { left: 60, right: 30, top: 30, bottom: 50 },
    xAxis: {
      name: 'PE(TTM)',
      nameTextStyle: { color: muted, fontSize: 11 },
      type: 'value',
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: {
      name: '日涨幅(%)',
      nameTextStyle: { color: muted, fontSize: 11 },
      type: 'value',
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' }
    },
    series: [{
      type: 'scatter',
      data: scatterData.map(function(d) {
        return {
          value: [d[0], d[1]],
          name: d[2],
          symbolSize: Math.max(10, Math.min(25, Math.abs(d[1]) * 4 + 8)),
          itemStyle: {
            color: d[1] >= 0 ? accent : danger,
            opacity: 0.85
          }
        };
      }),
      label: {
        show: true,
        formatter: function(p) { return p.data.name; },
        position: 'top',
        color: muted,
        fontSize: 10
      }
    }],
    animation: false
  });
  window.addEventListener('resize', function() { chartValuation.resize(); });

  // --- Chart: Holdings Performance (Line) ---
  var chartHoldings = echarts.init(document.getElementById('chart-holdings'), null, { renderer: 'svg' });
  var dates = ['06-09', '06-10', '06-11', '06-12', '06-13', '06-16', '06-17', '06-18', '06-19'];
  chartHoldings.setOption({
    tooltip: tooltip,
    legend: {
      data: ['中国平安', '招商银行', '药明康德', '中芯国际', '隆基绿能'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 11 },
      itemGap: 16
    },
    grid: { left: 55, right: 30, top: 20, bottom: 50 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '收益率(%)',
      nameTextStyle: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' }
    },
    series: [
      {
        name: '中国平安',
        type: 'line',
        data: [0, 1.2, 2.5, 1.8, 3.2, 4.1, 3.8, 5.2, 6.5],
        smooth: true,
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: { color: palette[0] }
      },
      {
        name: '招商银行',
        type: 'line',
        data: [0, 0.5, 1.0, 0.8, 1.5, 2.0, 1.8, 2.5, 3.0],
        smooth: true,
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: { color: palette[1] }
      },
      {
        name: '药明康德',
        type: 'line',
        data: [0, -1.5, -0.8, 1.2, 2.8, 3.5, 5.0, 6.2, 8.1],
        smooth: true,
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: { color: palette[2] }
      },
      {
        name: '中芯国际',
        type: 'line',
        data: [0, 2.0, 1.5, 0.5, -1.0, -2.5, -1.8, -3.2, -4.5],
        smooth: true,
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: { color: palette[4] }
      },
      {
        name: '隆基绿能',
        type: 'line',
        data: [0, -0.5, -2.0, -1.5, -3.0, -2.8, -4.0, -3.5, -2.8],
        smooth: true,
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 5,
        itemStyle: { color: palette[5] }
      }
    ],
    animation: false
  });
  window.addEventListener('resize', function() { chartHoldings.resize(); });

  // --- Chart: Screener Industry Distribution (Pie) ---
  var chartScreener = echarts.init(document.getElementById('chart-screener'), null, { renderer: 'svg' });
  chartScreener.setOption({
    tooltip: { trigger: 'item', appendToBody: true, backgroundColor: bg3, borderColor: rule, textStyle: { color: ink }, formatter: '{b}: {c} 只 ({d}%)' },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: { color: muted, fontSize: 12 },
      itemGap: 12
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: bg2, borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: ink },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' }
      },
      data: [
        { value: 45, name: '科技/半导体', itemStyle: { color: accent } },
        { value: 32, name: '新能源', itemStyle: { color: accent2 } },
        { value: 28, name: '金融', itemStyle: { color: accent3 } },
        { value: 22, name: '医药生物', itemStyle: { color: '#a855f7' } },
        { value: 18, name: '消费', itemStyle: { color: danger } },
        { value: 15, name: '红利/高股息', itemStyle: { color: success } },
        { value: 12, name: '资源/周期', itemStyle: { color: muted } }
      ]
    }],
    animation: false
  });
  window.addEventListener('resize', function() { chartScreener.resize(); });

  // --- Chart: ETF Fund Flow (Stacked Bar) ---
  var chartEtf = echarts.init(document.getElementById('chart-etf'), null, { renderer: 'svg' });
  var etfDates = ['06-09', '06-10', '06-11', '06-12', '06-13', '06-16', '06-17', '06-18', '06-19'];
  chartEtf.setOption({
    tooltip: tooltip,
    legend: {
      data: ['半导体', 'AI主题', '黄金', '红利', '新能源车', '医疗'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 11 },
      itemGap: 14
    },
    grid: { left: 55, right: 20, top: 20, bottom: 55 },
    xAxis: {
      type: 'category',
      data: etfDates,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '资金流入(亿元)',
      nameTextStyle: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11 }
    },
    series: [
      {
        name: '半导体',
        type: 'bar',
        stack: 'total',
        data: [2.1, 3.5, 1.8, 4.2, 2.8, 5.1, 3.2, 4.8, 3.2],
        itemStyle: { color: accent }
      },
      {
        name: 'AI主题',
        type: 'bar',
        stack: 'total',
        data: [3.2, 4.1, 5.5, 3.8, 6.2, 4.5, 7.1, 5.3, 5.1],
        itemStyle: { color: accent2 }
      },
      {
        name: '黄金',
        type: 'bar',
        stack: 'total',
        data: [1.5, 2.0, 1.8, 2.5, 3.0, 2.8, 3.5, 4.0, 4.3],
        itemStyle: { color: accent3 }
      },
      {
        name: '红利',
        type: 'bar',
        stack: 'total',
        data: [2.8, 2.5, 3.0, 2.2, 2.5, 3.2, 2.8, 3.0, 2.5],
        itemStyle: { color: success }
      },
      {
        name: '新能源车',
        type: 'bar',
        stack: 'total',
        data: [1.0, 0.8, 1.5, 2.0, 1.2, 1.8, 2.2, 1.5, 1.8],
        itemStyle: { color: '#a855f7' }
      },
      {
        name: '医疗',
        type: 'bar',
        stack: 'total',
        data: [0.5, 1.2, 0.8, 1.5, 1.0, 1.8, 1.2, 1.5, 1.2],
        itemStyle: { color: danger }
      }
    ],
    animation: false
  });
  window.addEventListener('resize', function() { chartEtf.resize(); });
})();
