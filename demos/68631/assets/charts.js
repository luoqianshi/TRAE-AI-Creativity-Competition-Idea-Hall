(function() {
  'use strict';

  // Read theme colors from CSS variables
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var muted2 = style.getPropertyValue('--muted2').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();
  var up = style.getPropertyValue('--up').trim();    // A-share: red = up
  var down = style.getPropertyValue('--down').trim(); // A-share: green = down

  // =============================================
  // Chart 1: K-line Training Demo (Candlestick)
  // =============================================
  function initKlineChart() {
    var el = document.getElementById('chart-kline');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    // Generate 300 simulated K-line data points
    var rawData = [];
    var basePrice = 15.0;
    var day = 1;
    for (var i = 0; i < 300; i++) {
      var open = basePrice;
      var volatility = 0.3 + Math.random() * 0.4;
      var trend = Math.sin(i / 30) * 0.15 + Math.cos(i / 50) * 0.1;
      var change = (Math.random() - 0.48 + trend) * volatility;
      var close = open + change;
      var high = Math.max(open, close) + Math.random() * 0.2;
      var low = Math.min(open, close) - Math.random() * 0.2;

      // Simulate limit up/down (10% for A-share)
      var limitUp = open * 1.10;
      var limitDown = open * 0.90;
      if (close > limitUp) close = limitUp;
      if (close < limitDown) close = limitDown;
      if (high > limitUp) high = limitUp;
      if (low < limitDown) low = limitDown;

      rawData.push({
        day: 'Day ' + day,
        open: parseFloat(open.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        high: parseFloat(high.toFixed(2))
      });
      basePrice = close;
      day++;
    }

    // Split: first 150 = revealed (full color), last 150 = hidden (gray)
    var revealedData = rawData.slice(0, 150).map(function(d) {
      return [d.open, d.close, d.low, d.high];
    });
    var hiddenData = rawData.slice(150).map(function(d) {
      return [d.open, d.close, d.low, d.high];
    });

    // Generate dates array for x-axis
    var xLabels = rawData.map(function(d, i) {
      return i + 1;
    });

    // Buy/Sell markers on revealed section
    var markers = [];
    // Buy at around day 30
    markers.push({
      name: '买入',
      coord: [29, rawData[29].low - 0.3],
      itemStyle: { color: up },
      label: { show: true, formatter: '买入', color: up, fontSize: 10, fontWeight: 600, position: 'bottom' }
    });
    // Sell at around day 80
    markers.push({
      name: '卖出',
      coord: [79, rawData[79].high + 0.3],
      itemStyle: { color: down },
      label: { show: true, formatter: '卖出', color: down, fontSize: 10, fontWeight: 600, position: 'top' }
    });
    // Buy at around day 120
    markers.push({
      name: '买入',
      coord: [119, rawData[119].low - 0.3],
      itemStyle: { color: up },
      label: { show: true, formatter: '买入', color: up, fontSize: 10, fontWeight: 600, position: 'bottom' }
    });

    var option = {
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: bg3,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 12 },
        formatter: function(params) {
          var p = params[0];
          if (!p || p.value === '-') return '';
          var idx = p.dataIndex;
          var d = rawData[idx];
          var color = d.close >= d.open ? up : down;
          var changePct = ((d.close - d.open) / d.open * 100).toFixed(2);
          return '<div style="font-family: monospace; font-size: 12px;">' +
            '第' + (idx + 1) + '根<br/>' +
            '开：<span style="color:' + color + '">' + d.open + '</span><br/>' +
            '收：<span style="color:' + color + '">' + d.close + '</span><br/>' +
            '低：<span style="color:' + muted + '">' + d.low + '</span><br/>' +
            '高：<span style="color:' + muted + '">' + d.high + '</span><br/>' +
            '涨跌：<span style="color:' + color + '">' + (changePct >= 0 ? '+' : '') + changePct + '%</span>' +
            '</div>';
        }
      },
      axisPointer: {
        link: [{ xAxisIndex: 'all' }],
        label: { backgroundColor: bg3, color: ink }
      },
      grid: [
        { left: '6%', right: '3%', top: '8%', height: '72%' }
      ],
      xAxis: {
        type: 'category',
        data: xLabels,
        boundaryGap: true,
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: {
          color: muted2,
          fontSize: 10,
          interval: 29,
          formatter: function(val) {
            return 'K' + (parseInt(val) + 1);
          }
        },
        splitLine: { show: false }
      },
      yAxis: {
        scale: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: muted2, fontSize: 10 },
        splitLine: { lineStyle: { color: rule, type: 'dashed', opacity: 0.5 } }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 20,
          bottom: 8,
          borderColor: rule,
          backgroundColor: bg2,
          fillerColor: 'rgba(240, 185, 11, 0.15)',
          handleStyle: { color: accent, borderColor: accent },
          textStyle: { color: muted2, fontSize: 10 },
          dataBackground: {
            lineStyle: { color: muted2 },
            areaStyle: { color: bg3 }
          }
        }
      ],
      series: [
        {
          name: '已揭示',
          type: 'candlestick',
          data: revealedData,
          itemStyle: {
            color: up,         // up candle (close > open) = red
            color0: down,      // down candle = green
            borderColor: up,
            borderColor0: down
          },
          markLine: {
            symbol: ['none', 'none'],
            label: {
              show: true,
              position: 'end',
              color: accent,
              fontSize: 11,
              fontWeight: 700,
              formatter: '◄ 当前位置 ►'
            },
            lineStyle: { color: accent, type: 'solid', width: 2 },
            data: [{ xAxis: 149 }]
          },
          markPoint: {
            symbol: 'pin',
            symbolSize: 40,
            data: markers
          }
        },
        {
          name: '待揭示',
          type: 'candlestick',
          data: hiddenData,
          itemStyle: {
            color: 'rgba(122, 132, 153, 0.3)',
            color0: 'rgba(122, 132, 153, 0.3)',
            borderColor: 'rgba(122, 132, 153, 0.4)',
            borderColor0: 'rgba(122, 132, 153, 0.4)'
          }
        }
      ]
    };

    chart.setOption(option);
    window.addEventListener('resize', function() { chart.resize(); });
  }

  // =============================================
  // Chart 2: Multi-dimensional Radar Comparison
  // =============================================
  function initRadarChart() {
    var el = document.getElementById('chart-radar');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    var option = {
      backgroundColor: 'transparent',
      animation: false,
      tooltip: {
        appendToBody: true,
        backgroundColor: bg3,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 12 }
      },
      legend: {
        data: ['实盘交易', '传统模拟盘', 'K线训练助手'],
        bottom: 10,
        textStyle: { color: muted, fontSize: 12 },
        itemWidth: 16,
        itemHeight: 10,
        itemGap: 20
      },
      radar: {
        indicator: [
          { name: '真实感', max: 10 },
          { name: '风险控制', max: 10 },
          { name: '低成本', max: 10 },
          { name: '复盘能力', max: 10 },
          { name: '规则还原', max: 10 },
          { name: '训练效率', max: 10 }
        ],
        center: ['50%', '48%'],
        radius: '65%',
        axisName: {
          color: ink,
          fontSize: 13,
          fontWeight: 600
        },
        splitArea: {
          areaStyle: {
            color: [bg2, bg3, bg2, bg3, bg2]
          }
        },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        emphasis: {
          lineStyle: { width: 3 }
        },
        data: [
          {
            value: [10, 1, 1, 2, 10, 2],
            name: '实盘交易',
            lineStyle: { color: up, width: 2 },
            areaStyle: { color: 'rgba(230, 57, 70, 0.15)' },
            itemStyle: { color: up },
            symbolSize: 6
          },
          {
            value: [4, 8, 9, 3, 5, 4],
            name: '传统模拟盘',
            lineStyle: { color: muted, width: 2 },
            areaStyle: { color: 'rgba(122, 132, 153, 0.15)' },
            itemStyle: { color: muted },
            symbolSize: 6
          },
          {
            value: [9, 10, 10, 10, 10, 10],
            name: 'K线训练助手',
            lineStyle: { color: accent, width: 2.5 },
            areaStyle: { color: 'rgba(240, 185, 11, 0.2)' },
            itemStyle: { color: accent },
            symbolSize: 7
          }
        ]
      }]
    };

    chart.setOption(option);
    window.addEventListener('resize', function() { chart.resize(); });
  }

  // =============================================
  // Initialize Mermaid
  // =============================================
  function initMermaid() {
    if (typeof mermaid === 'undefined') return;
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: bg3,
        primaryTextColor: ink,
        primaryBorderColor: accent,
        lineColor: accent2,
        secondaryColor: bg2,
        tertiaryColor: bg2,
        fontFamily: 'InstrumentSans, sans-serif',
        fontSize: '14px'
      },
      securityLevel: 'loose',
      flowchart: {
        curve: 'basis',
        padding: 20,
        nodeSpacing: 40,
        rankSpacing: 50
      }
    });
  }

  // =============================================
  // Boot
  // =============================================
  function boot() {
    initMermaid();
    if (typeof echarts !== 'undefined') {
      initKlineChart();
      initRadarChart();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
