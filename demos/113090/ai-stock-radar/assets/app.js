// ============================================================
// 智盈A股 - 应用逻辑
// ============================================================

(function() {
  'use strict';

  // --- 工具函数 ---
  function fmtNum(n, decimals) {
    decimals = decimals || 2;
    return Number(n).toFixed(decimals);
  }

  function getColorClass(val) {
    if (val > 0) return 'up';
    if (val < 0) return 'down';
    return '';
  }

  function getScoreColor(score) {
    if (score >= 85) return 'var(--up, #ef4444)';
    if (score >= 70) return 'var(--accent, #00d4ff)';
    if (score >= 60) return 'var(--warn, #fbbf24)';
    return 'var(--down, #22c55e)';
  }

  function getRecClass(rec) {
    if (rec.indexOf('推荐') >= 0 || rec.indexOf('关注') >= 0) return 'blue';
    if (rec.indexOf('中线') >= 0 || rec.indexOf('长线') >= 0) return 'green';
    return 'amber';
  }

  // --- Tab 切换 ---
  function initTabs() {
    var buttons = document.querySelectorAll('.tab-nav button');
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        buttons.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var tab = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
        var panel = document.getElementById('panel-' + tab);
        if (panel) panel.classList.add('active');

        // 延迟触发resize以确保图表正确渲染
        setTimeout(function() {
          window.dispatchEvent(new Event('resize'));
          if (tab === 'health') {
            var select = document.getElementById('healthSelect');
            if (select) switchHealthStock(select.value);
          }
        }, 50);
      });
    });
  }

  // --- 顶栏市场状态 ---
  function renderMarketStatus() {
    var bar = document.getElementById('marketStatusBar');
    var s = MarketData.sentiment;
    var html = '';
    html += '<div class="item"><span class="label">成交额</span><span class="value">' + s.turnover.toLocaleString() + '亿</span></div>';
    html += '<div class="item"><span class="label">北向资金</span><span class="value up">+' + s.northBound + '亿</span></div>';
    html += '<div class="item"><span class="label">涨停</span><span class="value up">' + s.limitUp + '</span></div>';
    html += '<div class="item"><span class="label">跌停</span><span class="value down">' + s.limitDown + '</span></div>';
    bar.innerHTML = html;
  }

  // --- 指数卡片 ---
  function renderIndexCards() {
    var grid = document.getElementById('indexGrid');
    var html = '';
    MarketData.indices.forEach(function(idx) {
      var cls = idx.changePct >= 0 ? 'up' : 'down';
      var arrow = idx.changePct >= 0 ? '▲' : '▼';
      html += '<div class="index-card">';
      html += '<div class="name">' + idx.name + '</div>';
      html += '<div class="value ' + cls + '">' + fmtNum(idx.value) + '</div>';
      html += '<div class="change ' + cls + '">' + arrow + ' ' + fmtNum(Math.abs(idx.change)) + ' (' + fmtNum(Math.abs(idx.changePct)) + '%)</div>';
      html += '<div class="meta"><span>成交 ' + idx.volume + '亿</span><span>金额 ' + idx.amount + '亿</span></div>';
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  // --- 市场情绪 ---
  function renderSentiment() {
    var s = MarketData.sentiment;
    document.getElementById('sentimentScore').textContent = s.score;
    document.getElementById('sentimentScore').style.color = getScoreColor(s.score);
    document.getElementById('sentimentLabel').textContent = s.label;
    document.getElementById('sentimentDesc').textContent = '— ' + s.description;
    document.getElementById('sentimentFill').style.width = s.score + '%';
  }

  // --- 宏观分析 ---
  function renderMacro() {
    var grid = document.getElementById('macroGrid');
    var macros = [MarketData.macro.fed, MarketData.macro.middleEast, MarketData.macro.chinaUS];
    var html = '';
    macros.forEach(function(m) {
      html += '<div class="macro-card ' + m.impactLevel + '">';
      html += '<div class="title">' + m.title + ' <span class="status">' + m.status + '</span></div>';
      html += '<div class="detail">' + m.detail + '</div>';
      html += '<div class="impact">影响: ' + m.impact + '</div>';
      html += '<ul class="key-points">';
      m.keyPoints.forEach(function(kp) {
        html += '<li>' + kp + '</li>';
      });
      html += '</ul>';
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  // --- 热门概念 ---
  function renderConcepts() {
    var list = document.getElementById('conceptList');
    var html = '';
    MarketData.hotConcepts.forEach(function(c) {
      var cls = c.change >= 0 ? 'up' : 'down';
      var sign = c.change >= 0 ? '+' : '';
      html += '<div class="concept-item">';
      html += '<div class="name">' + c.name + '</div>';
      html += '<div class="change ' + cls + '">' + sign + fmtNum(c.change) + '%</div>';
      html += '<div class="count">' + c.stocks + '只个股</div>';
      html += '</div>';
    });
    list.innerHTML = html;
  }

  // --- 短线股票卡片 ---
  function renderShortStocks() {
    var grid = document.getElementById('shortStockGrid');
    var html = '';
    ShortTermStocks.forEach(function(s) {
      var cls = s.changePct >= 0 ? 'up' : 'down';
      var rankCls = s.rank <= 3 ? 'top3' : '';
      var scoreColor = getScoreColor(s.score);
      html += '<div class="stock-card" onclick="showStockDetail(\'short\',\'' + s.code + '\')">';
      html += '<div class="rank-badge ' + rankCls + '">#' + s.rank + '</div>';
      html += '<div class="stock-header"><div><div class="stock-name">' + s.name + '</div><div class="stock-code">' + s.code + '</div></div></div>';
      html += '<div class="stock-sector">' + s.sector + '</div>';
      html += '<div class="price-row"><div class="price ' + cls + '">' + fmtNum(s.price) + '</div><div class="change-pct ' + cls + '">' + (s.changePct >= 0 ? '+' : '') + fmtNum(s.changePct) + '%</div></div>';
      html += '<div class="metrics">';
      html += '<div class="metric"><span class="label">量比</span><span class="val highlight">' + fmtNum(s.volumeRatio, 1) + '</span></div>';
      html += '<div class="metric"><span class="label">MACD</span><span class="val">' + s.macdSignal + '</span></div>';
      html += '<div class="metric"><span class="label">暗盘流入</span><span class="val highlight">' + s.darkPoolInflow + '亿</span></div>';
      html += '<div class="metric"><span class="label">主力流入</span><span class="val">' + s.mainForceInflow + '亿</span></div>';
      html += '<div class="metric"><span class="label">筹码密集</span><span class="val">' + s.chipConcentration + '%</span></div>';
      html += '<div class="metric"><span class="label">拉升信号</span><span class="val highlight">' + s.pullUpSignal + '</span></div>';
      html += '</div>';
      html += '<div class="signal-tags">';
      s.signals.slice(0, 3).forEach(function(sig) {
        html += '<span class="signal-tag">' + sig + '</span>';
      });
      html += '</div>';
      html += '<div class="score-circle" style="border-color:' + scoreColor + '; color:' + scoreColor + ';">' + s.score + '</div>';
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  // --- 中线股票卡片 ---
  function renderMidStocks() {
    var grid = document.getElementById('midStockGrid');
    var html = '';
    MidTermStocks.forEach(function(s) {
      var cls = s.changePct >= 0 ? 'up' : 'down';
      var rankCls = s.rank <= 3 ? 'top3' : '';
      var scoreColor = getScoreColor(s.trendScore);
      html += '<div class="stock-card" onclick="showStockDetail(\'mid\',\'' + s.code + '\')">';
      html += '<div class="rank-badge ' + rankCls + '">#' + s.rank + '</div>';
      html += '<div class="stock-header"><div><div class="stock-name">' + s.name + '</div><div class="stock-code">' + s.code + '</div></div></div>';
      html += '<div class="stock-sector">' + s.sector + '</div>';
      html += '<div class="price-row"><div class="price ' + cls + '">' + fmtNum(s.price) + '</div><div class="change-pct ' + cls + '">' + (s.changePct >= 0 ? '+' : '') + fmtNum(s.changePct) + '%</div></div>';
      html += '<div class="metrics">';
      html += '<div class="metric"><span class="label">筹码密集</span><span class="val highlight">' + s.chipConcentration + '%</span></div>';
      html += '<div class="metric"><span class="label">建仓天数</span><span class="val">' + s.mainForceDays + '日</span></div>';
      html += '<div class="metric"><span class="label">主力流入</span><span class="val">' + s.mainForceInflow + '亿</span></div>';
      html += '<div class="metric"><span class="label">仓位变化</span><span class="val highlight">' + s.positionChange + '</span></div>';
      html += '<div class="metric"><span class="label">PE</span><span class="val">' + s.pe + '</span></div>';
      html += '<div class="metric"><span class="label">趋势评分</span><span class="val highlight">' + s.trendScore + '</span></div>';
      html += '</div>';
      html += '<div class="signal-tags">';
      s.signals.slice(0, 3).forEach(function(sig) {
        html += '<span class="signal-tag">' + sig + '</span>';
      });
      html += '</div>';
      html += '<div class="score-circle" style="border-color:' + scoreColor + '; color:' + scoreColor + ';">' + s.trendScore + '</div>';
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  // --- 长线股票卡片 ---
  function renderLongStocks() {
    var grid = document.getElementById('longStockGrid');
    var html = '';
    LongTermStocks.forEach(function(s) {
      var cls = s.changePct >= 0 ? 'up' : 'down';
      var rankCls = s.rank <= 3 ? 'top3' : '';
      var scoreColor = getScoreColor(s.score);
      var peDisplay = s.pe > 0 ? s.pe : '亏损';
      html += '<div class="stock-card" onclick="showStockDetail(\'long\',\'' + s.code + '\')">';
      html += '<div class="rank-badge ' + rankCls + '">#' + s.rank + '</div>';
      html += '<div class="stock-header"><div><div class="stock-name">' + s.name + '</div><div class="stock-code">' + s.code + '</div></div></div>';
      html += '<div class="stock-sector">' + s.sector + '</div>';
      html += '<div class="price-row"><div class="price ' + cls + '">' + fmtNum(s.price) + '</div><div class="change-pct ' + cls + '">' + (s.changePct >= 0 ? '+' : '') + fmtNum(s.changePct) + '%</div></div>';
      html += '<div class="metrics">';
      html += '<div class="metric"><span class="label">PE</span><span class="val">' + peDisplay + '</span></div>';
      html += '<div class="metric"><span class="label">ROE</span><span class="val">' + s.roe + '%</span></div>';
      html += '<div class="metric"><span class="label">增速</span><span class="val highlight">' + s.growth + '%</span></div>';
      html += '<div class="metric"><span class="label">政策评分</span><span class="val highlight">' + s.policyScore + '</span></div>';
      html += '<div class="metric"><span class="label">护城河</span><span class="val">' + s.moatScore + '</span></div>';
      html += '<div class="metric"><span class="label">市值</span><span class="val">' + s.marketCap + '亿</span></div>';
      html += '</div>';
      html += '<div class="signal-tags">';
      s.signals.slice(0, 3).forEach(function(sig) {
        html += '<span class="signal-tag">' + sig + '</span>';
      });
      html += '</div>';
      html += '<div class="score-circle" style="border-color:' + scoreColor + '; color:' + scoreColor + ';">' + s.score + '</div>';
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  // --- 预警列表 ---
  function renderAlerts() {
    var list = document.getElementById('alertList');
    var html = '';
    AlertData.forEach(function(a) {
      var cls = a.level;
      html += '<div class="alert-item ' + cls + '">';
      html += '<div class="time">' + a.time + '</div>';
      html += '<div class="level-dot"></div>';
      html += '<div class="stock-info">';
      html += '<div class="name">' + a.name + ' <span style="color:var(--muted);font-size:0.7rem;">' + a.code + '</span></div>';
      html += '<div class="type">' + a.type + '</div>';
      html += '<div class="msg">' + a.message + '</div>';
      html += '</div>';
      html += '<div class="price">' + a.price + '</div>';
      html += '</div>';
    });
    list.innerHTML = html;
  }

  // --- 自选股表格 ---
  function renderWatchlist() {
    var table = document.getElementById('watchlistTable');
    var html = '<thead><tr>';
    html += '<th>股票</th><th>现价</th><th>涨跌%</th><th>预警价</th><th>止损价</th><th>状态</th>';
    html += '</tr></thead><tbody>';
    WatchList.forEach(function(w) {
      var cls = w.changePct >= 0 ? 'up' : 'down';
      var statusCls = w.status === '持有' ? 'hold' : (w.status === '建仓中' ? 'building' : 'watch');
      html += '<tr>';
      html += '<td>' + w.name + '<br><span style="color:var(--muted);font-size:0.7rem;">' + w.code + '</span></td>';
      html += '<td class="val">' + w.price + '</td>';
      html += '<td class="val ' + cls + '">' + (w.changePct >= 0 ? '+' : '') + w.changePct + '%</td>';
      html += '<td class="val">' + w.alert + '</td>';
      html += '<td class="val" style="color:var(--down);">' + w.stopLoss + '</td>';
      html += '<td><span class="status-badge ' + statusCls + '">' + w.status + '</span></td>';
      html += '</tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }

  // --- 股票体检 ---
  function renderHealthCheck(stockCode) {
    var data = HealthCheckData[stockCode];
    if (!data) return;

    // 评分显示
    var scoreDisplay = document.getElementById('healthScoreDisplay');
    var scoreColor = getScoreColor(data.overallScore);
    var recCls = getRecClass(data.recommendation);
    scoreDisplay.innerHTML = '<div class="big-score" style="color:' + scoreColor + ';">' + data.overallScore + '</div>' +
      '<div class="rec-label ' + recCls + '">' + data.recommendation + '</div>';

    // 股票信息
    var meta = document.getElementById('healthStockMeta');
    meta.innerHTML = '<div class="row"><span>股票名称</span><span>' + data.name + '</span></div>' +
      '<div class="row"><span>股票代码</span><span style="font-family:var(--font-mono);">' + data.code + '</span></div>' +
      '<div class="row"><span>所属板块</span><span>' + data.sector + '</span></div>' +
      '<div class="row"><span>当前价格</span><span style="font-family:var(--font-mono);color:' + (data.changePct >= 0 ? 'var(--up)' : 'var(--down)') + ';">' + data.price + '</span></div>' +
      '<div class="row"><span>涨跌幅</span><span style="font-family:var(--font-mono);color:' + (data.changePct >= 0 ? 'var(--up)' : 'var(--down)') + ';">' + (data.changePct >= 0 ? '+' : '') + data.changePct + '%</span></div>';

    // 八维度详情
    var details = document.getElementById('healthDetails');
    var html = '';
    Object.keys(data.details).forEach(function(dim) {
      var dimData = data.details[dim];
      var dimScoreColor = getScoreColor(dimData.score);
      html += '<div class="health-dim-card" style="border-left-color:' + dimScoreColor + ';">';
      html += '<div class="dim-header">';
      html += '<div class="dim-name">' + dim + '</div>';
      html += '<div style="display:flex;gap:8px;align-items:center;">';
      html += '<span class="dim-status" style="background:var(--bg2);color:' + dimScoreColor + ';">' + dimData.status + '</span>';
      html += '<span class="dim-score" style="color:' + dimScoreColor + ';">' + dimData.score + '</span>';
      html += '</div></div>';
      html += '<div class="dim-items">';
      dimData.items.forEach(function(item) {
        html += '<div class="item"><span class="lbl">' + item.label + '</span><span class="vl ' + item.rating + '">' + item.value + '</span></div>';
      });
      html += '</div></div>';
    });
    details.innerHTML = html;

    // 诊断报告
    document.getElementById('healthDiagnosis').textContent = data.diagnosis;

    // 雷达图
    ChartManager.initRadar(stockCode);
  }

  // --- 股票详情弹窗 ---
  window.showStockDetail = function(type, code) {
    var stock;
    if (type === 'short') {
      stock = ShortTermStocks.find(function(s) { return s.code === code; });
    } else if (type === 'mid') {
      stock = MidTermStocks.find(function(s) { return s.code === code; });
    } else if (type === 'long') {
      stock = LongTermStocks.find(function(s) { return s.code === code; });
    }
    if (!stock) return;

    var modal = document.getElementById('stockModal');
    var title = document.getElementById('modalTitle');
    var body = document.getElementById('modalBody');

    var cls = stock.changePct >= 0 ? 'up' : 'down';
    title.innerHTML = stock.name + ' <span style="color:var(--muted);font-size:0.8rem;">' + stock.code + '</span> <span style="color:var(--accent);font-size:0.75rem;padding:2px 8px;background:rgba(0,212,255,0.1);border-radius:4px;">' + stock.sector + '</span>';

    var html = '';

    // 基本信息网格
    html += '<div class="info-grid">';
    html += '<div class="info-item"><div class="lbl">现价</div><div class="vl" style="color:var(--' + (stock.changePct >= 0 ? 'up' : 'down') + ');">' + stock.price + '</div></div>';
    html += '<div class="info-item"><div class="lbl">涨跌幅</div><div class="vl" style="color:var(--' + (stock.changePct >= 0 ? 'up' : 'down') + ');">' + (stock.changePct >= 0 ? '+' : '') + stock.changePct + '%</div></div>';
    html += '<div class="info-item"><div class="lbl">量比</div><div class="vl" style="color:var(--accent);">' + (stock.volumeRatio || '-') + '</div></div>';
    html += '<div class="info-item"><div class="lbl">PE(TTM)</div><div class="vl">' + (stock.pe || '-') + '</div></div>';
    if (stock.darkPoolInflow !== undefined) {
      html += '<div class="info-item"><div class="lbl">暗盘流入</div><div class="vl" style="color:var(--accent);">' + stock.darkPoolInflow + '亿</div></div>';
    }
    if (stock.mainForceInflow !== undefined) {
      html += '<div class="info-item"><div class="lbl">主力流入</div><div class="vl" style="color:var(--up);">' + stock.mainForceInflow + '亿</div></div>';
    }
    if (stock.chipConcentration !== undefined) {
      html += '<div class="info-item"><div class="lbl">筹码密集度</div><div class="vl">' + stock.chipConcentration + '%</div></div>';
    }
    if (stock.macdSignal !== undefined) {
      html += '<div class="info-item"><div class="lbl">MACD信号</div><div class="vl" style="color:var(--accent);">' + stock.macdSignal + '</div></div>';
    }
    html += '</div>';

    // 信号标签
    if (stock.signals) {
      html += '<div><div class="chart-title" style="margin-bottom:8px;">AI分析信号</div><div style="display:flex;flex-wrap:wrap;gap:6px;">';
      stock.signals.forEach(function(sig) {
        html += '<span class="signal-tag" style="font-size:0.75rem;padding:4px 10px;">' + sig + '</span>';
      });
      html += '</div></div>';
    }

    // K线图
    if (stock.kline) {
      html += '<div class="chart-card"><div class="chart-title">K线图 / 成交量 / MACD</div><div class="chart-container" id="modalKline" style="min-height:400px;"></div></div>';
    }

    // 资金流向图
    if (stock.mainForceInflow !== undefined) {
      html += '<div class="chart-card"><div class="chart-title">近5日资金流向</div><div class="chart-container" id="modalFundFlow" style="min-height:200px;"></div></div>';
    }

    body.innerHTML = html;
    modal.classList.add('active');

    // 初始化图表
    setTimeout(function() {
      if (stock.kline) {
        ChartManager.initKline('modalKline', stock.kline, stock.name);
      }
      if (stock.mainForceInflow !== undefined) {
        ChartManager.initFundFlow('modalFundFlow', stock);
      }
    }, 50);
  };

  window.closeModal = function() {
    document.getElementById('stockModal').classList.remove('active');
  };

  // 点击遮罩关闭弹窗
  document.getElementById('stockModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  // ESC关闭弹窗
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });

  // --- 股票体检切换 ---
  window.switchHealthStock = function(code) {
    renderHealthCheck(code);
  };

  // --- 初始化 ---
  function init() {
    initTabs();
    renderMarketStatus();
    renderIndexCards();
    renderSentiment();
    renderMacro();
    renderConcepts();
    renderShortStocks();
    renderMidStocks();
    renderLongStocks();
    renderAlerts();
    renderWatchlist();
    renderHealthCheck('002185');
    ChartManager.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
