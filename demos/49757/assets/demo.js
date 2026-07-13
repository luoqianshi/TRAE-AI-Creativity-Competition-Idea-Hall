(function() {
  function $(id) {
    return document.getElementById(id);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  var defaultState = {
    pain: '很多独立开发者每天刷 Reddit 和小红书找 SaaS 选题，但信息太碎，无法判断哪些抱怨真的值得做。',
    market: 'AI创业者 / Indie Hacker',
    keyword: 'SaaS选题、用户抱怨、App差评、MVP',
    painScore: 9,
    freq: 8,
    pay: 7,
    comp: 5,
    mvp: 4
  };

  function readState() {
    return {
      pain: $('pain-input').value.trim() || defaultState.pain,
      market: $('market-select').value,
      keyword: $('keyword-input').value.trim() || defaultState.keyword,
      painScore: Number($('pain-range').value),
      freq: Number($('freq-range').value),
      pay: Number($('pay-range').value),
      comp: Number($('comp-range').value),
      mvp: Number($('mvp-range').value)
    };
  }

  function activeSources() {
    return Array.prototype.slice.call(document.querySelectorAll('.source-chip.active')).map(function(btn) {
      return btn.getAttribute('data-source');
    });
  }

  function calcOpportunity(state) {
    var positive = state.painScore * 3.2 + state.freq * 2.8 + state.pay * 3.1;
    var negative = state.comp * 1.6 + state.mvp * 1.4;
    var sourceBonus = activeSources().length * 2.5;
    return Math.round(clamp(positive - negative + sourceBonus + 28, 18, 96));
  }

  function titleFor(score) {
    if (score >= 84) return '建议进入 MVP 验证';
    if (score >= 70) return '建议做小样本用户验证';
    if (score >= 55) return '建议先收窄用户场景';
    return '建议重新筛选痛点来源';
  }

  function textFor(score) {
    if (score >= 84) return '该方向具备高频痛点和明确付费理由，适合先做轻量报告生成器验证需求。';
    if (score >= 70) return '该方向值得验证，但需要进一步确认用户是否愿意为节省调研时间付费。';
    if (score >= 55) return '该方向有真实抱怨，但竞争或 MVP 难度需要被控制，建议先聚焦一个垂直人群。';
    return '当前信号偏弱，建议扩大数据来源，或寻找更高痛感、更明确预算的用户群。';
  }

  function renderSignals(state) {
    var list = $('signal-list');
    if (!list) return;
    var sources = activeSources();
    var items = [
      {
        title: '痛点主题',
        body: '关键词集中在“' + state.keyword + '”，适合聚类为“创业选题与需求验证”方向。'
      },
      {
        title: '来源覆盖',
        body: sources.length ? '当前模拟来源包括：' + sources.join('、') + '。' : '当前未选择来源，机会分会下降。'
      },
      {
        title: '竞争判断',
        body: state.comp >= 7 ? '竞争压力偏高，需要从更细的场景切入。' : '竞争压力可控，适合做轻量差异化产品。'
      }
    ];
    list.innerHTML = '';
    items.forEach(function(item) {
      var node = document.createElement('div');
      node.className = 'dynamic-item';
      node.innerHTML = '<strong>' + item.title + '</strong><span>' + item.body + '</span>';
      list.appendChild(node);
    });
  }

  function render() {
    var state = readState();
    var ids = {
      pain: 'pain-value',
      freq: 'freq-value',
      pay: 'pay-value',
      comp: 'comp-value',
      mvp: 'mvp-value'
    };
    $('pain-value').textContent = state.painScore;
    $('freq-value').textContent = state.freq;
    $('pay-value').textContent = state.pay;
    $('comp-value').textContent = state.comp;
    $('mvp-value').textContent = state.mvp;

    var score = calcOpportunity(state);
    $('opportunity-score').textContent = score;
    $('score-title').textContent = titleFor(score);
    $('score-text').textContent = textFor(score);
    $('score-ring').style.setProperty('--score-deg', Math.round(score / 100 * 360) + 'deg');
    $('opportunity-text').textContent = '面向' + state.market + '，从“' + state.pain + '”这类抱怨中提炼产品机会，优先验证用户是否愿意为更快找到高质量选题付费。';
    $('mvp-text').textContent = '先做一个关键词输入 + 多源痛点聚类 + 机会评分 + 报告导出的 Web 页面，避免过早开发复杂数据平台。';
    $('money-text').textContent = '第一步可用 Pro 报告包或月订阅收费，付费点放在深度报告、Watchlist 和导出能力。';
    renderSignals(state);
  }

  function reset() {
    $('pain-input').value = defaultState.pain;
    $('market-select').value = defaultState.market;
    $('keyword-input').value = defaultState.keyword;
    $('pain-range').value = defaultState.painScore;
    $('freq-range').value = defaultState.freq;
    $('pay-range').value = defaultState.pay;
    $('comp-range').value = defaultState.comp;
    $('mvp-range').value = defaultState.mvp;
    document.querySelectorAll('.source-chip').forEach(function(btn) {
      btn.classList.add('active');
    });
    render();
  }

  function bind() {
    ['pain-input', 'market-select', 'keyword-input', 'pain-range', 'freq-range', 'pay-range', 'comp-range', 'mvp-range'].forEach(function(id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    document.querySelectorAll('.source-chip').forEach(function(btn) {
      btn.addEventListener('click', function() {
        btn.classList.toggle('active');
        render();
      });
    });
    $('generate-btn').addEventListener('click', render);
    $('reset-btn').addEventListener('click', reset);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      bind();
      render();
    });
  } else {
    bind();
    render();
  }
})();
