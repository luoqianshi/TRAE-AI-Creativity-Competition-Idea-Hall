(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Generate simulated gold price data (30 days) ---
  var dates = [];
  var prices = [];
  var basePrice = 550;
  var currentPrice = basePrice;
  var startDate = new Date(2026, 4, 18); // May 18, 2026

  for (var i = 0; i < 30; i++) {
    var d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push((d.getMonth() + 1) + '/' + d.getDate());

    var change = (Math.random() - 0.48) * 8;
    currentPrice += change;
    if (currentPrice < 530) currentPrice = 530;
    if (currentPrice > 580) currentPrice = 580;
    prices.push(parseFloat(currentPrice.toFixed(2)));
  }

  // --- Chart 1: Gold Price Trend Line ---
  var chartPrice = echarts.init(document.getElementById('chart-gold-price'), null, { renderer: 'svg' });
  chartPrice.setOption({
    animation: false,
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      min: 520,
      max: 590,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, formatter: '{value} 元/克' },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [{
      name: '黄金价格',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: prices,
      lineStyle: { color: accent, width: 2.5 },
      itemStyle: { color: accent },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: accent + '40' },
            { offset: 1, color: accent + '05' }
          ]
        }
      },
      markLine: {
        silent: true,
        lineStyle: { color: accent2, type: 'dashed' },
        data: [{ yAxis: 550, label: { formatter: '参考线 550', color: accent2 } }]
      }
    }]
  });
  window.addEventListener('resize', function() { chartPrice.resize(); });

  // --- Generate simulated K-line data ---
  var klineDates = [];
  var klineData = [];
  var klineStart = new Date(2026, 4, 18);
  var openPrice = 548;

  for (var j = 0; j < 20; j++) {
    var kd = new Date(klineStart);
    kd.setDate(klineStart.getDate() + j);
    klineDates.push((kd.getMonth() + 1) + '/' + kd.getDate());

    var volatility = Math.random() * 12 + 3;
    var trend = (Math.random() - 0.45) * 6;
    var open = openPrice;
    var close = open + trend;
    var low = Math.min(open, close) - Math.random() * volatility * 0.4;
    var high = Math.max(open, close) + Math.random() * volatility * 0.4;

    klineData.push([
      parseFloat(open.toFixed(2)),
      parseFloat(close.toFixed(2)),
      parseFloat(low.toFixed(2)),
      parseFloat(high.toFixed(2))
    ]);

    openPrice = close;
  }

  // Generate volume data
  var volumes = [];
  for (var v = 0; v < 20; v++) {
    volumes.push(Math.floor(Math.random() * 5000 + 2000));
  }

  // --- Chart 2: Gold K-line + Volume ---
  var chartKline = echarts.init(document.getElementById('chart-gold-kline'), null, { renderer: 'svg' });
  chartKline.setOption({
    animation: false,
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    grid: [
      { left: '3%', right: '4%', top: '10%', height: '55%', containLabel: true },
      { left: '3%', right: '4%', top: '72%', height: '18%', containLabel: true }
    ],
    xAxis: [
      {
        type: 'category',
        data: klineDates,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false, lineStyle: { color: rule } },
        axisLabel: { color: muted },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      },
      {
        type: 'category',
        gridIndex: 1,
        data: klineDates,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      }
    ],
    yAxis: [
      {
        scale: true,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, formatter: '{value} 元' },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '日K',
        type: 'candlestick',
        data: klineData,
        itemStyle: {
          color: '#e74c3c',
          color0: '#2ecc71',
          borderColor: '#e74c3c',
          borderColor0: '#2ecc71'
        }
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes,
        itemStyle: {
          color: function(params) {
            var dataIndex = params.dataIndex;
            var close = klineData[dataIndex][1];
            var open = klineData[dataIndex][0];
            return close >= open ? '#e74c3c' : '#2ecc71';
          }
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartKline.resize(); });
})();
