(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var rise = style.getPropertyValue('--rise').trim();
  var fall = style.getPropertyValue('--fall').trim();
  var warn = style.getPropertyValue('--warn').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var panel = style.getPropertyValue('--panel').trim();

  var stocks = [
    { code: '600519', name: '贵州茅台', sector: '白酒龙头', base: 1588.20, beta: 0.72, bias: 0.18 },
    { code: '300750', name: '宁德时代', sector: '新能源', base: 214.35, beta: 1.25, bias: 0.42 },
    { code: '002594', name: '比亚迪', sector: '汽车整车', base: 248.60, beta: 1.18, bias: 0.28 },
    { code: '688981', name: '中芯国际', sector: '半导体', base: 61.48, beta: 1.55, bias: 0.62 },
    { code: '601318', name: '中国平安', sector: '金融权重', base: 46.75, beta: 0.86, bias: -0.12 },
    { code: '300308', name: '中际旭创', sector: '算力光模块', base: 168.42, beta: 1.72, bias: 0.88 },
    { code: '000858', name: '五粮液', sector: '消费修复', base: 138.10, beta: 0.82, bias: 0.05 }
  ];

  var currentIndex = 3;
  var currentFrame = '1m';
  var cache = {};
  var kChart = echarts.init(document.getElementById('chartKline'), null, { renderer: 'svg' });
  var mChart = echarts.init(document.getElementById('chartMomentum'), null, { renderer: 'svg' });

  function seededNoise(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function fmt(n, digits) {
    return Number(n).toFixed(digits == null ? 2 : digits);
  }

  function money(n) {
    return '¥' + Number(n).toLocaleString('zh-CN', { maximumFractionDigits: 0 });
  }

  function frameConfig(frame) {
    if (frame === '5m') return { count: 86, step: 5, amp: 0.012, label: '5分' };
    if (frame === '15m') return { count: 78, step: 15, amp: 0.016, label: '15分' };
    if (frame === 'day') return { count: 100, step: 1440, amp: 0.025, label: '日线' };
    return { count: 120, step: 1, amp: 0.0075, label: '1分' };
  }

  function generateSeries(stock, frame) {
    var key = stock.code + '-' + frame;
    if (cache[key]) return cache[key];
    var cfg = frameConfig(frame);
    var categories = [];
    var values = [];
    var volumes = [];
    var price = stock.base;
    var start = new Date();
    start.setHours(9, 30, 0, 0);
    if (frame === 'day') {
      start = new Date();
      start.setDate(start.getDate() - cfg.count);
    }
    for (var i = 0; i < cfg.count; i += 1) {
      var wave = Math.sin((i + stock.beta * 6) / 9) * cfg.amp * stock.beta;
      var burst = (seededNoise(i * 17 + stock.base) - 0.5) * cfg.amp * 1.8;
      var trend = stock.bias * cfg.amp / 4;
      var open = price;
      var close = Math.max(0.5, open * (1 + wave + burst + trend));
      var high = Math.max(open, close) * (1 + seededNoise(i + stock.base) * cfg.amp * 1.2);
      var low = Math.min(open, close) * (1 - seededNoise(i * 3 + stock.base) * cfg.amp * 1.2);
      var vol = Math.round((8000 + seededNoise(i * 23 + stock.base) * 50000) * stock.beta * (1 + Math.abs(close - open) / open * 18));
      var t = new Date(start.getTime() + i * cfg.step * 60000);
      var label = frame === 'day'
        ? String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0')
        : String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
      categories.push(label);
      values.push([fmt(open), fmt(close), fmt(low), fmt(high)]);
      volumes.push([i, vol, close >= open ? 1 : -1]);
      price = close;
    }
    cache[key] = { categories: categories, values: values, volumes: volumes };
    return cache[key];
  }

  function closes(data) {
    return data.values.map(function (item) { return Number(item[1]); });
  }

  function ma(days, data) {
    var c = closes(data);
    return c.map(function (_, idx) {
      if (idx < days) return '-';
      var sum = 0;
      for (var i = 0; i < days; i += 1) sum += c[idx - i];
      return fmt(sum / days);
    });
  }

  function ema(values, period) {
    var k = 2 / (period + 1);
    var arr = [];
    values.forEach(function (v, idx) {
      arr.push(idx === 0 ? v : v * k + arr[idx - 1] * (1 - k));
    });
    return arr;
  }

  function macd(data) {
    var c = closes(data);
    var dif = ema(c, 12).map(function (v, i) { return v - ema(c, 26)[i]; });
    var dea = ema(dif, 9);
    var hist = dif.map(function (v, i) { return (v - dea[i]) * 2; });
    return { dif: dif.map(function (v) { return fmt(v, 3); }), dea: dea.map(function (v) { return fmt(v, 3); }), hist: hist.map(function (v) { return fmt(v, 3); }) };
  }

  function rsi(data, period) {
    var c = closes(data);
    return c.map(function (_, i) {
      if (i < period) return '-';
      var gain = 0;
      var loss = 0;
      for (var j = i - period + 1; j <= i; j += 1) {
        var diff = c[j] - c[j - 1];
        if (diff >= 0) gain += diff;
        else loss -= diff;
      }
      if (loss === 0) return 100;
      return fmt(100 - 100 / (1 + gain / loss), 1);
    });
  }

  function volumeRatio(data) {
    var vols = data.volumes.map(function (v) { return v[1]; });
    var last = vols[vols.length - 1];
    var avg = vols.slice(-21, -1).reduce(function (a, b) { return a + b; }, 0) / 20;
    return last / avg;
  }

  function analyze(data) {
    var c = closes(data);
    var last = c[c.length - 1];
    var prev = c[c.length - 2];
    var m5 = ma(Number(document.getElementById('fastMa').value), data);
    var m13 = ma(Number(document.getElementById('slowMa').value), data);
    var m34 = ma(34, data);
    var lastM5 = Number(m5[m5.length - 1]);
    var lastM13 = Number(m13[m13.length - 1]);
    var lastM34 = Number(m34[m34.length - 1]);
    var vr = volumeRatio(data);
    var r = Number(rsi(data, 14).slice(-1)[0]);
    var mac = macd(data);
    var mh = Number(mac.hist[mac.hist.length - 1]);
    var high20 = Math.max.apply(null, c.slice(-20));
    var rules = [
      { name: '快线站上慢线', ok: lastM5 > lastM13 },
      { name: '价格位于中期均线上方', ok: last > lastM34 },
      { name: '成交量达到阈值', ok: vr >= Number(document.getElementById('volGate').value) },
      { name: 'RSI 未进入极端过热', ok: r < 78 && r > 45 },
      { name: 'MACD 柱体转强', ok: mh > 0 },
      { name: '接近 20 根K线高点', ok: last >= high20 * 0.985 }
    ];
    var score = rules.reduce(function (sum, item) { return sum + (item.ok ? 100 / rules.length : 0); }, 0);
    score += Math.max(-8, Math.min(8, (last - prev) / prev * 900));
    score = Math.round(Math.max(0, Math.min(100, score)));
    return { rules: rules, score: score, vr: vr, rsi: r, macd: mac, m5: m5, m13: m13, m34: m34 };
  }

  function setText(id, text, className) {
    var el = document.getElementById(id);
    el.textContent = text;
    el.className = className || '';
  }

  function renderWatchlist() {
    var box = document.getElementById('watchlist');
    box.innerHTML = '';
    stocks.forEach(function (stock, idx) {
      var data = generateSeries(stock, currentFrame);
      var c = closes(data);
      var last = c[c.length - 1];
      var first = c[0];
      var pct = (last - first) / first * 100;
      var btn = document.createElement('button');
      btn.className = 'stock-btn' + (idx === currentIndex ? ' active' : '');
      btn.dataset.index = idx;
      btn.innerHTML =
        '<span><span class="stock-name">' + stock.name + '</span><br><span class="stock-code">' + stock.code + ' · ' + stock.sector + '</span></span>' +
        '<span class="stock-price ' + (pct >= 0 ? 'rise' : 'fall') + '">' + fmt(last) + '<br><span class="stock-meta">' + (pct >= 0 ? '+' : '') + fmt(pct) + '%</span></span>';
      btn.addEventListener('click', function () {
        currentIndex = Number(this.dataset.index);
        updateAll();
      });
      box.appendChild(btn);
    });
  }

  function renderCharts(stock, data, result) {
    var optionK = {
      animation: false,
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, appendToBody: true },
      legend: { data: ['K线', 'MA5', 'MA13', 'MA34', '成交量'], textStyle: { color: muted }, top: 2 },
      grid: [{ left: 48, right: 24, top: 44, height: '58%' }, { left: 48, right: 24, top: '74%', height: '16%' }],
      xAxis: [
        { type: 'category', data: data.categories, boundaryGap: true, axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted } },
        { type: 'category', data: data.categories, gridIndex: 1, boundaryGap: true, axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted } }
      ],
      yAxis: [
        { scale: true, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
        { scale: true, gridIndex: 1, axisLabel: { color: muted }, splitLine: { show: false } }
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1], start: 45, end: 100 },
        { show: true, xAxisIndex: [0, 1], type: 'slider', bottom: 6, height: 18, borderColor: rule, fillerColor: accent + '33', handleStyle: { color: accent }, textStyle: { color: muted } }
      ],
      series: [
        { name: 'K线', type: 'candlestick', data: data.values, itemStyle: { color: rise, color0: fall, borderColor: rise, borderColor0: fall } },
        { name: 'MA5', type: 'line', data: result.m5, smooth: true, showSymbol: false, lineStyle: { width: 1.6, color: accent } },
        { name: 'MA13', type: 'line', data: result.m13, smooth: true, showSymbol: false, lineStyle: { width: 1.6, color: warn } },
        { name: 'MA34', type: 'line', data: result.m34, smooth: true, showSymbol: false, lineStyle: { width: 1.6, color: accent2 } },
        { name: '成交量', type: 'bar', xAxisIndex: 1, yAxisIndex: 1, data: data.volumes.map(function (v) { return v[1]; }), itemStyle: { color: function (p) { return data.volumes[p.dataIndex][2] > 0 ? rise : fall; } } }
      ]
    };
    kChart.setOption(optionK, true);

    var optionM = {
      animation: false,
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { data: ['RSI14', 'DIF', 'DEA', 'MACD柱'], textStyle: { color: muted }, top: 0 },
      grid: { left: 42, right: 18, top: 40, bottom: 30 },
      xAxis: { type: 'category', data: data.categories, axisLine: { lineStyle: { color: rule } }, axisLabel: { color: muted } },
      yAxis: { type: 'value', scale: true, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule } } },
      color: [accent, warn, accent2, muted],
      series: [
        { name: 'RSI14', type: 'line', data: rsi(data, 14), showSymbol: false, smooth: true, lineStyle: { width: 1.8, color: accent } },
        { name: 'DIF', type: 'line', data: result.macd.dif, showSymbol: false, smooth: true, lineStyle: { width: 1.4, color: warn } },
        { name: 'DEA', type: 'line', data: result.macd.dea, showSymbol: false, smooth: true, lineStyle: { width: 1.4, color: accent2 } },
        { name: 'MACD柱', type: 'bar', data: result.macd.hist, itemStyle: { color: function (p) { return Number(p.value) >= 0 ? rise : fall; } } }
      ]
    };
    mChart.setOption(optionM, true);
  }

  function renderSignal(result) {
    var ring = document.getElementById('scoreRing');
    ring.style.setProperty('--score-angle', result.score * 3.6 + 'deg');
    document.getElementById('score').textContent = result.score;
    var text = '观望';
    var desc = '信号不足，等待趋势或量能确认';
    if (result.score >= 78) {
      text = '强势关注';
      desc = '趋势、量能与动能共振，可加入重点盯盘';
    } else if (result.score >= 62) {
      text = '试探机会';
      desc = '条件部分满足，适合小仓观察确认';
    } else if (result.score <= 38) {
      text = '回避';
      desc = '短线结构偏弱，优先控制风险';
    }
    document.getElementById('signalText').textContent = text;
    document.getElementById('signalDesc').textContent = desc;
    var list = document.getElementById('ruleList');
    list.innerHTML = '';
    result.rules.forEach(function (ruleItem) {
      var item = document.createElement('div');
      item.className = 'rule-item ' + (ruleItem.ok ? 'ok' : 'bad');
      item.innerHTML = '<span class="check">' + (ruleItem.ok ? '✓' : '!') + '</span><span>' + ruleItem.name + '</span><span class="small">' + (ruleItem.ok ? '通过' : '未过') + '</span>';
      list.appendChild(item);
    });
  }

  function renderMetrics(stock, data, result) {
    var c = closes(data);
    var last = c[c.length - 1];
    var first = c[0];
    var pct = (last - first) / first * 100;
    document.getElementById('selectedName').textContent = stock.name + ' ' + stock.code;
    document.getElementById('selectedMeta').textContent = stock.sector + ' · ' + frameConfig(currentFrame).label + '模拟行情 · 最新 ' + fmt(last);
    setText('mPrice', fmt(last), pct >= 0 ? 'metric-value rise' : 'metric-value fall');
    setText('mChange', (pct >= 0 ? '+' : '') + fmt(pct) + '%', pct >= 0 ? 'metric-value rise' : 'metric-value fall');
    setText('mVol', fmt(result.vr, 2) + 'x', result.vr >= 1.4 ? 'metric-value rise' : 'metric-value');
    setText('mMoney', result.score >= 60 ? '偏强' : result.score <= 40 ? '偏弱' : '中性', result.score >= 60 ? 'metric-value rise' : result.score <= 40 ? 'metric-value fall' : 'metric-value');
    document.getElementById('entryPrice').value = fmt(last);
    document.getElementById('stopPrice').value = fmt(last * 0.965);
  }

  function renderTrades(stock, data, result) {
    var tbody = document.getElementById('tradeRows');
    tbody.innerHTML = '';
    var c = closes(data);
    var rows = [];
    for (var i = Math.max(35, c.length - 42); i < c.length; i += 7) {
      var p = c[i];
      var prev = c[i - 1];
      var strong = p > prev && Number(result.m5[i]) > Number(result.m13[i]);
      rows.push({
        t: data.categories[i],
        action: strong ? '买入观察' : '减仓/等待',
        price: fmt(p),
        reason: strong ? '均线多头 + 放量' : '动能不足',
        pnl: strong ? '+' + fmt((c[Math.min(i + 5, c.length - 1)] - p) / p * 100) + '%' : fmt((p - prev) / prev * 100) + '%'
      });
    }
    rows.reverse().forEach(function (r) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + r.t + '</td><td>' + r.action + '</td><td>' + r.price + '</td><td>' + r.reason + '</td><td class="' + (r.pnl.indexOf('+') === 0 ? 'rise' : 'fall') + '">' + r.pnl + '</td>';
      tbody.appendChild(tr);
    });
  }

  function renderNews(stock, result) {
    var feed = document.getElementById('newsFeed');
    var templates = [
      ['09:36', stock.sector + '板块异动，短线资金出现试探性流入。'],
      ['10:12', stock.name + ' 量比升至 ' + fmt(result.vr, 2) + '，关注回踩不破均线。'],
      ['11:03', '策略提醒：信号评分 ' + result.score + '，避免追高，优先等待分时承接。'],
      ['13:27', '风控提醒：若跌破预设止损，系统建议立即降低暴露。'],
      ['14:42', '尾盘检查：确认成交量是否持续，否则突破有效性下降。']
    ];
    feed.innerHTML = '';
    templates.forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'news';
      div.innerHTML = '<time>' + item[0] + '</time><p>' + item[1] + '</p>';
      feed.appendChild(div);
    });
  }

  function calcPosition() {
    var capital = Number(document.getElementById('capital').value);
    var riskPct = Number(document.getElementById('riskPct').value) / 100;
    var entry = Number(document.getElementById('entryPrice').value);
    var stop = Number(document.getElementById('stopPrice').value);
    var out = document.getElementById('positionOutput');
    if (!capital || !riskPct || !entry || !stop || stop >= entry) {
      out.innerHTML = '<span>请确认资金、买入价和止损价；止损价必须低于买入价。</span>';
      return;
    }
    var riskMoney = capital * riskPct;
    var perShareRisk = entry - stop;
    var shares = Math.floor(riskMoney / perShareRisk / 100) * 100;
    var maxCostShares = Math.floor(capital * 0.2 / entry / 100) * 100;
    shares = Math.max(0, Math.min(shares, maxCostShares));
    var cost = shares * entry;
    var loss = shares * perShareRisk;
    out.innerHTML = '<span>建议股数：' + shares.toLocaleString('zh-CN') + ' 股</span><span>占用资金：' + money(cost) + '</span><span>预估最大亏损：' + money(loss) + '</span>';
  }

  function updateAll() {
    document.querySelectorAll('.tab').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.frame === currentFrame);
    });
    var stock = stocks[currentIndex];
    var data = generateSeries(stock, currentFrame);
    var result = analyze(data);
    renderWatchlist();
    renderMetrics(stock, data, result);
    renderSignal(result);
    renderCharts(stock, data, result);
    renderTrades(stock, data, result);
    renderNews(stock, result);
    calcPosition();
  }

  function tickClock() {
    var now = new Date();
    document.getElementById('clock').textContent = '本地时间 ' + now.toLocaleTimeString('zh-CN', { hour12: false });
  }

  document.getElementById('timeframeTabs').addEventListener('click', function (event) {
    if (!event.target.matches('button')) return;
    currentFrame = event.target.dataset.frame;
    updateAll();
  });
  document.getElementById('calcBtn').addEventListener('click', calcPosition);
  document.getElementById('rerunBtn').addEventListener('click', updateAll);
  ['capital', 'riskPct', 'entryPrice', 'stopPrice', 'fastMa', 'slowMa', 'volGate'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      if (id === 'capital' || id === 'riskPct' || id === 'entryPrice' || id === 'stopPrice') calcPosition();
    });
  });
  ['fastMa', 'slowMa', 'volGate'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', updateAll);
  });
  window.addEventListener('resize', function () {
    kChart.resize();
    mChart.resize();
  });

  tickClock();
  setInterval(tickClock, 1000);
  updateAll();
})();
