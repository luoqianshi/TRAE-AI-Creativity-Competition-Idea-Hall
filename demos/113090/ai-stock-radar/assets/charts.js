// ============================================================
// 智盈A股 - ECharts 图表模块
// ============================================================

var ChartManager = (function() {
  var charts = {};
  var style, accent, accent2, ink, muted, rule, bg2, upColor, downColor, warnColor;

  function initTheme() {
    style = getComputedStyle(document.documentElement);
    accent = style.getPropertyValue('--accent').trim();
    accent2 = style.getPropertyValue('--accent2').trim();
    ink = style.getPropertyValue('--ink').trim();
    muted = style.getPropertyValue('--muted').trim();
    rule = style.getPropertyValue('--rule').trim();
    bg2 = style.getPropertyValue('--bg2').trim();
    upColor = style.getPropertyValue('--up').trim();
    downColor = style.getPropertyValue('--down').trim();
    warnColor = style.getPropertyValue('--warn').trim();
  }

  function getBaseGrid() {
    return { left: '8%', right: '5%', top: 40, bottom: 30 };
  }

  function getBaseAxis() {
    return {
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, fontFamily: 'JetBrainsMono' },
      splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.3 } }
    };
  }

  // --- 板块资金流向 ---
  function initSectorFlow() {
    var el = document.getElementById('chartSectorFlow');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    var data = MarketData.sectorFlow;
    var sorted = data.slice().sort(function(a,b) { return b.inflow - a.inflow; });

    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
      grid: { left: '15%', right: '8%', top: 20, bottom: 20 },
      xAxis: {
        type: 'value',
        ...getBaseAxis(),
        axisLabel: { ...getBaseAxis().axisLabel, formatter: '{value}亿' }
      },
      yAxis: {
        type: 'category',
        data: sorted.map(function(d) { return d.name; }).reverse(),
        ...getBaseAxis(),
        splitLine: { show: false }
      },
      series: [{
        type: 'bar',
        data: sorted.map(function(d) {
          return { value: d.inflow, itemStyle: { color: d.inflow >= 0 ? upColor : downColor } };
        }).reverse(),
        barWidth: 18,
        label: {
          show: true,
          position: 'right',
          formatter: function(p) { return p.value.toFixed(1) + '亿'; },
          color: muted, fontSize: 10, fontFamily: 'JetBrainsMono'
        }
      }]
    });
    charts.sectorFlow = chart;
    window.addEventListener('resize', function() { chart.resize(); });
  }

  // --- 指数走势 ---
  function initIndexTrend() {
    var el = document.getElementById('chartIndexTrend');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      grid: getBaseGrid(),
      xAxis: {
        type: 'category',
        data: IndexTrend.dates,
        ...getBaseAxis()
      },
      yAxis: [
        { type: 'value', name: '指数', ...getBaseAxis(), scale: true, min: 3900 },
        { type: 'value', name: '成交额(亿)', ...getBaseAxis(), splitLine: { show: false }, max: 5000 }
      ],
      series: [
        {
          name: '上证指数',
          type: 'line',
          data: IndexTrend.values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
            { offset: 0, color: 'rgba(0,212,255,0.15)' },
            { offset: 1, color: 'rgba(0,212,255,0)' }
          ]}},
          markLine: { data: [{ yAxis: 4000, lineStyle: { color: warnColor, type: 'dashed' }, label: { formatter: '4000点', color: warnColor } }] }
        },
        {
          name: '成交额',
          type: 'bar',
          yAxisIndex: 1,
          data: IndexTrend.volumes,
          barWidth: 12,
          itemStyle: { color: 'rgba(107,122,153,0.2)' }
        }
      ]
    });
    charts.indexTrend = chart;
    window.addEventListener('resize', function() { chart.resize(); });
  }

  // --- 板块资金时间趋势 ---
  function initSectorTimeline() {
    var el = document.getElementById('chartSectorTimeline');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { data: ['半导体','计算机','通信','新能源','金融'], textStyle: { color: muted, fontSize: 11 }, top: 0 },
      grid: { left: '8%', right: '5%', top: 40, bottom: 30 },
      xAxis: { type: 'category', data: SectorFlowTimeline.dates, ...getBaseAxis() },
      yAxis: { type: 'value', name: '亿元', ...getBaseAxis() },
      series: [
        { name: '半导体', type: 'line', smooth: true, data: SectorFlowTimeline.semiconductor, lineStyle: { color: upColor, width: 2 }, itemStyle: { color: upColor } },
        { name: '计算机', type: 'line', smooth: true, data: SectorFlowTimeline.computer, lineStyle: { color: accent, width: 2 }, itemStyle: { color: accent } },
        { name: '通信', type: 'line', smooth: true, data: SectorFlowTimeline.communication, lineStyle: { color: '#a855f7', width: 2 }, itemStyle: { color: '#a855f7' } },
        { name: '新能源', type: 'line', smooth: true, data: SectorFlowTimeline.newEnergy, lineStyle: { color: downColor, width: 2 }, itemStyle: { color: downColor } },
        { name: '金融', type: 'line', smooth: true, data: SectorFlowTimeline.finance, lineStyle: { color: warnColor, width: 2 }, itemStyle: { color: warnColor } }
      ]
    });
    charts.sectorTimeline = chart;
    window.addEventListener('resize', function() { chart.resize(); });
  }

  // --- 涨跌家数 ---
  function initBreadth() {
    var el = document.getElementById('chartBreadth');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    var b = MarketData.marketBreadth;

    chart.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, textStyle: { color: muted, fontSize: 11 } },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        data: [
          { value: b.up, name: '上涨', itemStyle: { color: upColor } },
          { value: b.down, name: '下跌', itemStyle: { color: downColor } },
          { value: b.flat, name: '平盘', itemStyle: { color: muted } }
        ],
        label: { color: ink, fontSize: 11, fontFamily: 'JetBrainsMono', formatter: '{b}\n{c}' },
        labelLine: { lineStyle: { color: muted } },
        itemStyle: { borderColor: bg2, borderWidth: 2 }
      }]
    });
    charts.breadth = chart;
    window.addEventListener('resize', function() { chart.resize(); });
  }

  // --- 预警分布 ---
  function initAlertDist() {
    var el = document.getElementById('chartAlertDist');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    var typeCount = {};
    AlertData.forEach(function(a) {
      typeCount[a.type] = (typeCount[a.type] || 0) + 1;
    });
    var pieData = Object.keys(typeCount).map(function(k) { return { value: typeCount[k], name: k }; });

    chart.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}次 ({d}%)' },
      legend: { bottom: 0, textStyle: { color: muted, fontSize: 10 }, type: 'scroll' },
      series: [{
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '45%'],
        data: pieData,
        label: { color: ink, fontSize: 11, formatter: '{b}\n{c}次' },
        labelLine: { lineStyle: { color: muted } },
        itemStyle: { borderColor: bg2, borderWidth: 2 },
        color: [upColor, accent, warnColor, '#a855f7', downColor, '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1']
      }]
    });
    charts.alertDist = chart;
    window.addEventListener('resize', function() { chart.resize(); });
  }

  // --- 雷达图 ---
  function initRadar(stockCode) {
    var el = document.getElementById('chartRadar');
    if (!el) return;
    if (charts.radar) { charts.radar.dispose(); }
    var chart = echarts.init(el, null, { renderer: 'svg' });
    var data = HealthCheckData[stockCode];
    if (!data) return;

    chart.setOption({
      animation: false,
      tooltip: { appendToBody: true },
      radar: {
        indicator: data.radar.map(function(d) { return { name: d.name, max: d.max }; }),
        center: ['50%', '52%'],
        radius: '68%',
        axisName: { color: ink, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: ['rgba(0,212,255,0.02)', 'rgba(0,212,255,0.05)'] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        data: [{
          value: data.radar.map(function(d) { return d.score; }),
          name: data.name,
          areaStyle: { color: 'rgba(0,212,255,0.15)' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        }]
      }]
    });
    charts.radar = chart;
    window.addEventListener('resize', function() { chart.resize(); });
  }

  // --- K线图 ---
  function initKline(containerId, klineData, stockName) {
    var el = document.getElementById(containerId);
    if (!el) return;
    if (charts.kline) { charts.kline.dispose(); }
    var chart = echarts.init(el, null, { renderer: 'svg' });

    var dates = klineData.map(function(d) { return d.date; });
    var ohlc = klineData.map(function(d) { return [d.open, d.close, d.high, d.low]; });
    var volumes = klineData.map(function(d) { return d.volume; });

    // 简单MACD计算
    var closes = klineData.map(function(d) { return d.close; });
    var ema12 = [], ema26 = [], dif = [], dea = [], macd = [];
    var e12 = closes[0], e26 = closes[0];
    for (var i = 0; i < closes.length; i++) {
      e12 = e12 * 11/13 + closes[i] * 2/13;
      e26 = e26 * 25/27 + closes[i] * 2/27;
      ema12.push(e12); ema26.push(e26);
      dif.push(e12 - e26);
    }
    var d9 = dif[0];
    for (var j = 0; j < dif.length; j++) {
      d9 = d9 * 8/10 + dif[j] * 2/10;
      dea.push(d9);
      macd.push((dif[j] - d9) * 2);
    }

    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'cross' } },
      grid: [
        { left: '8%', right: '5%', top: 30, height: '50%' },
        { left: '8%', right: '5%', top: '58%', height: '12%' },
        { left: '8%', right: '5%', top: '74%', height: '20%' }
      ],
      xAxis: [
        { type: 'category', data: dates, gridIndex: 0, ...getBaseAxis(), axisLabel: { show: false } },
        { type: 'category', data: dates, gridIndex: 1, ...getBaseAxis(), axisLabel: { show: false } },
        { type: 'category', data: dates, gridIndex: 2, ...getBaseAxis() }
      ],
      yAxis: [
        { scale: true, gridIndex: 0, ...getBaseAxis() },
        { gridIndex: 1, ...getBaseAxis(), splitLine: { show: false } },
        { gridIndex: 2, ...getBaseAxis() }
      ],
      series: [
        {
          name: 'K线', type: 'candlestick', data: ohlc, xAxisIndex: 0, yAxisIndex: 0,
          itemStyle: { color: upColor, color0: downColor, borderColor: upColor, borderColor0: downColor }
        },
        {
          name: '成交量', type: 'bar', data: volumes, xAxisIndex: 1, yAxisIndex: 1,
          itemStyle: { color: function(p) { return klineData[p.dataIndex].close >= klineData[p.dataIndex].open ? upColor : downColor; }, opacity: 0.6 }
        },
        {
          name: 'MACD', type: 'bar', data: macd, xAxisIndex: 2, yAxisIndex: 2,
          itemStyle: { color: function(p) { return p.value >= 0 ? upColor : downColor; } }
        },
        {
          name: 'DIF', type: 'line', data: dif, xAxisIndex: 2, yAxisIndex: 2,
          smooth: true, symbol: 'none', lineStyle: { color: accent, width: 1 }
        },
        {
          name: 'DEA', type: 'line', data: dea, xAxisIndex: 2, yAxisIndex: 2,
          smooth: true, symbol: 'none', lineStyle: { color: warnColor, width: 1 }
        }
      ]
    });
    charts.kline = chart;
    window.addEventListener('resize', function() { chart.resize(); });
  }

  // --- 资金流向图 (Modal内) ---
  function initFundFlow(containerId, stock) {
    var el = document.getElementById(containerId);
    if (!el) return;
    if (charts.fundFlow) { charts.fundFlow.dispose(); }
    var chart = echarts.init(el, null, { renderer: 'svg' });

    // 生成近5日资金流向数据
    var days = ['07-07','07-08','07-09','07-10','07-11'];
    var mainFlow = days.map(function(_, i) {
      return +(stock.mainForceInflow * (0.4 + Math.random() * 0.6)).toFixed(2);
    });
    var darkFlow = days.map(function(_, i) {
      return +(stock.darkPoolInflow * (0.3 + Math.random() * 0.7)).toFixed(2);
    });

    chart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { data: ['主力资金','暗盘资金'], textStyle: { color: muted, fontSize: 11 }, top: 0 },
      grid: { left: '10%', right: '5%', top: 35, bottom: 25 },
      xAxis: { type: 'category', data: days, ...getBaseAxis() },
      yAxis: { type: 'value', name: '亿元', ...getBaseAxis() },
      series: [
        { name: '主力资金', type: 'bar', data: mainFlow, itemStyle: { color: upColor }, barWidth: 15 },
        { name: '暗盘资金', type: 'bar', data: darkFlow, itemStyle: { color: accent }, barWidth: 15 }
      ]
    });
    charts.fundFlow = chart;
    window.addEventListener('resize', function() { chart.resize(); });
  }

  return {
    init: function() {
      initTheme();
      initSectorFlow();
      initIndexTrend();
      initSectorTimeline();
      initBreadth();
      initAlertDist();
      initRadar('002185');
    },
    initRadar: initRadar,
    initKline: initKline,
    initFundFlow: initFundFlow,
    getCharts: function() { return charts; }
  };
})();
