// assets/charts.js — StockPulse 实时股价监控
(function() {
  'use strict';

  // ===== CSS Variables =====
  var style = getComputedStyle(document.documentElement);
  function cv(name) { return style.getPropertyValue(name).trim(); }
  var accent = cv('--accent');
  var accent2 = cv('--accent2');
  var ink = cv('--ink');
  var muted = cv('--muted');
  var rule = cv('--rule');
  var bg2 = cv('--bg2');
  var bg3 = cv('--bg3');
  var green = cv('--green');
  var red = cv('--red');

  // ===== 模拟股票数据 =====
  var stocks = [
    { code: '600519', name: '贵州茅台', sector: 'consumer', basePrice: 1688.50, pe: 28.5, cap: '2.12万亿' },
    { code: '000858', name: '五粮液', sector: 'consumer', basePrice: 152.30, pe: 22.1, cap: '5908亿' },
    { code: '601318', name: '中国平安', sector: 'finance', basePrice: 48.65, pe: 9.8, cap: '8860亿' },
    { code: '600036', name: '招商银行', sector: 'finance', basePrice: 35.20, pe: 7.2, cap: '8870亿' },
    { code: '000001', name: '平安银行', sector: 'finance', basePrice: 11.85, pe: 5.6, cap: '2300亿' },
    { code: '300750', name: '宁德时代', sector: 'tech', basePrice: 198.40, pe: 25.3, cap: '8630亿' },
    { code: '002594', name: '比亚迪', sector: 'tech', basePrice: 268.50, pe: 30.2, cap: '7800亿' },
    { code: '601012', name: '隆基绿能', sector: 'energy', basePrice: 22.15, pe: 12.5, cap: '1670亿' },
    { code: '600900', name: '长江电力', sector: 'energy', basePrice: 28.90, pe: 18.8, cap: '7050亿' },
    { code: '601899', name: '紫金矿业', sector: 'energy', basePrice: 17.35, pe: 15.2, cap: '4560亿' },
    { code: '000725', name: '京东方A', sector: 'tech', basePrice: 4.85, pe: 35.6, cap: '1780亿' },
    { code: '002475', name: '立讯精密', sector: 'tech', basePrice: 36.80, pe: 28.9, cap: '2620亿' },
    { code: '600887', name: '伊利股份', sector: 'consumer', basePrice: 28.50, pe: 18.5, cap: '1820亿' },
    { code: '000333', name: '美的集团', sector: 'consumer', basePrice: 62.30, pe: 13.2, cap: '4320亿' },
    { code: '601985', name: '中国核电', sector: 'energy', basePrice: 9.25, pe: 16.8, cap: '1740亿' },
    { code: '300059', name: '东方财富', sector: 'finance', basePrice: 16.80, pe: 32.5, cap: '2680亿' },
    { code: '002415', name: '海康威视', sector: 'tech', basePrice: 32.50, pe: 21.3, cap: '3040亿' },
    { code: '601166', name: '兴业银行', sector: 'finance', basePrice: 18.20, pe: 5.1, cap: '3780亿' },
    { code: '600276', name: '恒瑞医药', sector: 'tech', basePrice: 45.60, pe: 42.5, cap: '2910亿' },
    { code: '000568', name: '泸州老窖', sector: 'consumer', basePrice: 138.20, pe: 19.8, cap: '2020亿' }
  ];

  // ===== 大盘指数数据 =====
  var indices = [
    { name: '上证指数', code: '000001.SH', baseValue: 3150.28 },
    { name: '深证成指', code: '399001.SZ', baseValue: 10285.60 },
    { name: '创业板指', code: '399006.SZ', baseValue: 2038.45 },
    { name: '科创50', code: '000688.SH', baseValue: 968.30 }
  ];

  // ===== 状态 =====
  var currentFilter = 'all';
  var currentSector = 'all';
  var searchKeyword = '';
  var selectedStock = null;
  var currentPeriod = '1d';
  var mainChartInstance = null;
  var sparklineCharts = {};

  // ===== 初始化股票实时数据 =====
  function initStockData() {
    stocks.forEach(function(s) {
      var change = (Math.random() - 0.45) * 8; // -3.6% ~ +4.4%
      s.changePercent = parseFloat(change.toFixed(2));
      s.price = parseFloat((s.basePrice * (1 + change / 100)).toFixed(2));
      s.open = parseFloat((s.basePrice * (1 + (Math.random() - 0.5) * 2 / 100)).toFixed(2));
      s.high = parseFloat((Math.max(s.price, s.open) * (1 + Math.random() * 1.5 / 100)).toFixed(2));
      s.low = parseFloat((Math.min(s.price, s.open) * (1 - Math.random() * 1.5 / 100)).toFixed(2));
      s.volume = Math.floor(Math.random() * 500000 + 50000);
      s.amount = parseFloat((s.volume * s.price / 10000).toFixed(2));
      s.turnover = parseFloat((Math.random() * 5 + 0.5).toFixed(2));
      // 生成历史K线数据
      s.history = generateHistory(s.basePrice, 60);
    });
  }

  function generateHistory(basePrice, days) {
    var data = [];
    var price = basePrice * (0.85 + Math.random() * 0.1);
    for (var i = 0; i < days; i++) {
      var change = (Math.random() - 0.48) * 4;
      var open = price;
      var close = price * (1 + change / 100);
      var high = Math.max(open, close) * (1 + Math.random() * 1.5 / 100);
      var low = Math.min(open, close) * (1 - Math.random() * 1.5 / 100);
      var vol = Math.floor(Math.random() * 400000 + 80000);
      var d = new Date();
      d.setDate(d.getDate() - (days - i));
      data.push({
        date: (d.getMonth() + 1) + '/' + d.getDate(),
        open: parseFloat(open.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        volume: vol
      });
      price = close;
    }
    return data;
  }

  // ===== 初始化大盘数据 =====
  function initIndexData() {
    indices.forEach(function(idx) {
      var change = (Math.random() - 0.45) * 3;
      idx.changePercent = parseFloat(change.toFixed(2));
      idx.value = parseFloat((idx.baseValue * (1 + change / 100)).toFixed(2));
      idx.sparkline = [];
      var v = idx.baseValue * 0.995;
      for (var i = 0; i < 30; i++) {
        v += (Math.random() - 0.48) * idx.baseValue * 0.003;
        idx.sparkline.push(parseFloat(v.toFixed(2)));
      }
      idx.sparkline.push(idx.value);
    });
  }

  // ===== 渲染大盘概览 =====
  function renderMarketOverview() {
    var container = document.getElementById('marketOverview');
    container.innerHTML = '';
    indices.forEach(function(idx, i) {
      var isUp = idx.changePercent >= 0;
      var cls = isUp ? 'up' : 'down';
      var arrow = isUp ? '&#9650;' : '&#9660;';
      var card = document.createElement('div');
      card.className = 'market-card';
      card.innerHTML =
        '<div class="market-card-header">' +
          '<span class="market-card-name">' + idx.name + '</span>' +
          '<span class="market-card-change ' + cls + '">' + arrow + ' ' + (isUp ? '+' : '') + idx.changePercent + '%</span>' +
        '</div>' +
        '<div class="market-card-value ' + cls + '">' + idx.value.toFixed(2) + '</div>' +
        '<div class="market-card-sparkline" id="sparkline-' + i + '"></div>';
      container.appendChild(card);
    });
    // 渲染迷你图
    setTimeout(function() { renderSparklines(); }, 50);
  }

  function renderSparklines() {
    indices.forEach(function(idx, i) {
      var el = document.getElementById('sparkline-' + i);
      if (!el) return;
      if (sparklineCharts['sparkline-' + i]) {
        sparklineCharts['sparkline-' + i].dispose();
      }
      var chart = echarts.init(el, null, { renderer: 'svg' });
      sparklineCharts['sparkline-' + i] = chart;
      var isUp = idx.changePercent >= 0;
      chart.setOption({
        animation: false,
        grid: { top: 0, bottom: 0, left: 0, right: 0 },
        xAxis: { type: 'category', show: false, data: idx.sparkline.map(function(_, j) { return j; }) },
        yAxis: { type: 'value', show: false, min: function(v) { return v.min - (v.max - v.min) * 0.1; }, max: function(v) { return v.max + (v.max - v.min) * 0.1; } },
        series: [{
          type: 'line',
          data: idx.sparkline,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 1.5, color: isUp ? green : red },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: (isUp ? green : red) + '40' },
            { offset: 1, color: (isUp ? green : red) + '05' }
          ])}
        }]
      });
    });
  }

  // ===== 渲染股票列表 =====
  function renderStockList() {
    var container = document.getElementById('stockList');
    container.innerHTML = '';
    var filtered = stocks.filter(function(s) {
      // 涨跌筛选
      if (currentFilter === 'up' && s.changePercent <= 3) return false;
      if (currentFilter === 'down' && s.changePercent >= -3) return false;
      // 板块筛选
      if (currentSector !== 'all' && s.sector !== currentSector) return false;
      // 搜索
      if (searchKeyword) {
        var kw = searchKeyword.toLowerCase();
        if (s.name.toLowerCase().indexOf(kw) === -1 && s.code.indexOf(kw) === -1) return false;
      }
      return true;
    });

    filtered.forEach(function(s) {
      var isUp = s.changePercent >= 0;
      var cls = isUp ? 'up' : 'down';
      var itemClass = 'stock-item';
      if (s.changePercent > 3) itemClass += ' big-up';
      else if (s.changePercent < -3) itemClass += ' big-down';
      if (selectedStock && selectedStock.code === s.code) itemClass += ' active';

      var div = document.createElement('div');
      div.className = itemClass;
      div.setAttribute('data-code', s.code);
      div.innerHTML =
        '<div>' +
          '<div class="stock-item-name">' + s.name + '</div>' +
          '<div class="stock-item-code">' + s.code + '</div>' +
        '</div>' +
        '<div class="stock-item-price ' + cls + '">' + s.price.toFixed(2) + '</div>' +
        '<div class="stock-item-change ' + cls + '">' + (isUp ? '+' : '') + s.changePercent.toFixed(2) + '%</div>';
      div.addEventListener('click', function() { selectStock(s); });
      container.appendChild(div);
    });
  }

  // ===== 选股 =====
  function selectStock(s) {
    selectedStock = s;
    renderStockList();
    updateChartHeader();
    renderMainChart();
    updateDetail();
  }

  function updateChartHeader() {
    if (!selectedStock) return;
    var s = selectedStock;
    var isUp = s.changePercent >= 0;
    var cls = isUp ? 'up' : 'down';
    document.getElementById('chartStockName').textContent = s.name + ' (' + s.code + ')';
    document.getElementById('chartStockPrice').textContent = s.price.toFixed(2);
    document.getElementById('chartStockPrice').className = 'chart-stock-price ' + cls;
    var changeText = (isUp ? '+' : '') + s.changePercent.toFixed(2) + '%';
    var changeAmount = (isUp ? '+' : '') + (s.price - s.basePrice).toFixed(2);
    document.getElementById('chartStockChange').textContent = changeText + '  ' + changeAmount;
    document.getElementById('chartStockChange').className = 'chart-stock-change ' + cls;
  }

  function updateDetail() {
    if (!selectedStock) return;
    var s = selectedStock;
    document.getElementById('dOpen').textContent = s.open.toFixed(2);
    var hEl = document.getElementById('dHigh');
    hEl.textContent = s.high.toFixed(2);
    hEl.className = 'detail-value up';
    var lEl = document.getElementById('dLow');
    lEl.textContent = s.low.toFixed(2);
    lEl.className = 'detail-value down';
    document.getElementById('dVol').textContent = (s.volume / 10000).toFixed(1) + '万手';
    document.getElementById('dAmount').textContent = s.amount.toFixed(0) + '万';
    document.getElementById('dTurnover').textContent = s.turnover + '%';
    document.getElementById('dPE').textContent = s.pe.toFixed(1);
    document.getElementById('dCap').textContent = s.cap;
  }

  // ===== 渲染主图表 =====
  function renderMainChart() {
    if (!selectedStock) return;
    var el = document.getElementById('mainChart');
    if (mainChartInstance) mainChartInstance.dispose();
    mainChartInstance = echarts.init(el, null, { renderer: 'svg' });

    var s = selectedStock;
    var history = s.history;
    var dates = history.map(function(d) { return d.date; });
    var ohlc = history.map(function(d) { return [d.open, d.close, d.low, d.high]; });
    var volumes = history.map(function(d) { return d.volume; });

    var option = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        axisPointer: { type: 'cross', crossStyle: { color: muted } },
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 12 },
        formatter: function(params) {
          var kline = params[0];
          var vol = params[1];
          if (!kline || !kline.data) return '';
          var d = kline.data;
          var color = d[1] >= d[0] ? green : red;
          return '<div style="font-size:12px">' +
            '<div style="margin-bottom:4px;font-weight:600">' + kline.axisValue + '</div>' +
            '<div>开盘: <span style="color:' + color + '">' + d[1].toFixed(2) + '</span></div>' +
            '<div>收盘: <span style="color:' + color + '">' + d[0].toFixed(2) + '</span></div>' +
            '<div>最低: <span style="color:' + red + '">' + d[2].toFixed(2) + '</span></div>' +
            '<div>最高: <span style="color:' + green + '">' + d[3].toFixed(2) + '</span></div>' +
            '<div>成交量: ' + (vol ? vol.data : '--') + '</div>' +
          '</div>';
        }
      },
      grid: [
        { left: 60, right: 20, top: 20, height: '60%' },
        { left: 60, right: 20, top: '78%', height: '16%' }
      ],
      xAxis: [
        { type: 'category', data: dates, gridIndex: 0, axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted, fontSize: 10 }, splitLine: { show: false } },
        { type: 'category', data: dates, gridIndex: 1, axisLine: { lineStyle: { color: rule } }, axisLabel: { show: false }, splitLine: { show: false } }
      ],
      yAxis: [
        { type: 'value', gridIndex: 0, scale: true, splitLine: { lineStyle: { color: rule, type: 'dashed' } }, axisLabel: { color: muted, fontSize: 10 }, axisLine: { show: false } },
        { type: 'value', gridIndex: 1, scale: true, splitLine: { show: false }, axisLabel: { show: false }, axisLine: { show: false } }
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1], start: 50, end: 100 },
        { type: 'slider', xAxisIndex: [0, 1], start: 50, end: 100, bottom: 4, height: 16, borderColor: rule, fillerColor: accent + '30', handleStyle: { color: accent }, textStyle: { color: muted, fontSize: 10 } }
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: ohlc,
          itemStyle: {
            color: green,
            color0: red,
            borderColor: green,
            borderColor0: red
          }
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumes.map(function(v, i) {
            return {
              value: v,
              itemStyle: { color: history[i].close >= history[i].open ? green + '80' : red + '80' }
            };
          })
        }
      ]
    };

    mainChartInstance.setOption(option);
  }

  // ===== 实时数据更新 =====
  function updateStockPrices() {
    stocks.forEach(function(s) {
      var delta = (Math.random() - 0.5) * s.basePrice * 0.003;
      var oldPrice = s.price;
      s.price = parseFloat((s.price + delta).toFixed(2));
      s.changePercent = parseFloat(((s.price - s.basePrice) / s.basePrice * 100).toFixed(2));
      s.high = Math.max(s.high, s.price);
      s.low = Math.min(s.low, s.price);
      s.volume += Math.floor(Math.random() * 500);
      s.amount = parseFloat((s.volume * s.price / 10000).toFixed(2));
    });

    indices.forEach(function(idx) {
      var delta = (Math.random() - 0.48) * idx.baseValue * 0.001;
      idx.value = parseFloat((idx.value + delta).toFixed(2));
      idx.changePercent = parseFloat(((idx.value - idx.baseValue) / idx.baseValue * 100).toFixed(2));
      idx.sparkline.push(idx.value);
      if (idx.sparkline.length > 31) idx.sparkline.shift();
    });

    renderMarketOverview();
    renderStockList();
    if (selectedStock) {
      updateChartHeader();
      updateDetail();
    }
  }

  // ===== 时间显示 =====
  function updateTime() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('timeDisplay').textContent = h + ':' + m + ':' + s;
  }

  // ===== 主题切换 =====
  document.querySelectorAll('.theme-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.theme-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var theme = btn.getAttribute('data-theme');
      document.body.setAttribute('data-theme', theme);
      // 刷新CSS变量
      setTimeout(function() {
        style = getComputedStyle(document.documentElement);
        accent = cv('--accent');
        accent2 = cv('--accent2');
        ink = cv('--ink');
        muted = cv('--muted');
        rule = cv('--rule');
        bg2 = cv('--bg2');
        bg3 = cv('--bg3');
        green = cv('--green');
        red = cv('--red');
        // 重新渲染图表
        renderSparklines();
        if (selectedStock) renderMainChart();
      }, 100);
    });
  });

  // ===== 筛选按钮 =====
  document.querySelectorAll('[data-filter]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-filter]').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderStockList();
    });
  });

  document.querySelectorAll('[data-sector]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-sector]').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentSector = btn.getAttribute('data-sector');
      renderStockList();
    });
  });

  // ===== 搜索 =====
  document.getElementById('searchInput').addEventListener('input', function(e) {
    searchKeyword = e.target.value.trim();
    renderStockList();
  });

  // ===== K线周期切换 =====
  document.querySelectorAll('.period-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.period-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentPeriod = btn.getAttribute('data-period');
      // 模拟不同周期数据
      if (selectedStock) {
        var daysMap = { '1m': 1, '1d': 60, '1w': 120, '1M': 250 };
        selectedStock.history = generateHistory(selectedStock.basePrice, daysMap[currentPeriod] || 60);
        renderMainChart();
      }
    });
  });

  // ===== 购买渠道管理 =====
  var channelModal = document.getElementById('channelModal');
  var channelInput = document.getElementById('channelInput');

  document.getElementById('addChannelBtn').addEventListener('click', function() {
    channelModal.classList.add('show');
    channelInput.value = '';
    channelInput.focus();
  });

  document.getElementById('cancelChannel').addEventListener('click', function() {
    channelModal.classList.remove('show');
  });

  document.getElementById('confirmChannel').addEventListener('click', function() {
    var name = channelInput.value.trim();
    if (!name) return;
    var channelList = document.getElementById('channelList');
    var tag = document.createElement('span');
    tag.className = 'channel-tag';
    tag.innerHTML = name + ' <span class="remove" data-channel="' + name + '">&times;</span>';
    channelList.appendChild(tag);
    bindRemoveChannel(tag.querySelector('.remove'));
    channelModal.classList.remove('show');
  });

  channelInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('confirmChannel').click();
  });

  channelModal.addEventListener('click', function(e) {
    if (e.target === channelModal) channelModal.classList.remove('show');
  });

  function bindRemoveChannel(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      var tag = el.parentElement;
      tag.style.transition = 'opacity 0.2s';
      tag.style.opacity = '0';
      setTimeout(function() { tag.remove(); }, 200);
    });
  }

  document.querySelectorAll('.channel-tag .remove').forEach(bindRemoveChannel);

  // ===== Resize =====
  window.addEventListener('resize', function() {
    if (mainChartInstance) mainChartInstance.resize();
    Object.keys(sparklineCharts).forEach(function(k) {
      if (sparklineCharts[k]) sparklineCharts[k].resize();
    });
  });

  // ===== 启动 =====
  initStockData();
  initIndexData();
  renderMarketOverview();
  renderStockList();
  selectStock(stocks[0]);
  updateTime();

  setInterval(updateTime, 1000);
  setInterval(updateStockPrices, 3000);

})();
