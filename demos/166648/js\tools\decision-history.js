// ========== 决策记录与回溯 ==========

var DECISION_HISTORY_KEY = 'cc_decision_history';
var MAX_HISTORY = 20;

// ========== 数据读写 ==========

function getDecisionHistory() {
  try {
    return JSON.parse(localStorage.getItem(DECISION_HISTORY_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveDecisionSnapshot(type, data) {
  var history = getDecisionHistory();
  var snapshot = {
    id: 'dec_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    type: type,
    data: data
  };
  history.unshift(snapshot);
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(DECISION_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {}
  return snapshot;
}

function deleteDecisionSnapshot(id) {
  var history = getDecisionHistory().filter(function(h) { return h.id !== id; });
  try {
    localStorage.setItem(DECISION_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {}
  renderDecisionHistory();
}

function clearDecisionHistory() {
  if (!confirm('确定清空所有决策记录？此操作不可撤销。')) return;
  try {
    localStorage.removeItem(DECISION_HISTORY_KEY);
  } catch (e) {}
  renderDecisionHistory();
}

// ========== 工具函数 ==========

function formatDecisionTime(iso) {
  var d = new Date(iso);
  var pad = function(n) { return n < 10 ? '0' + n : n; };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
         ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function getDecisionTypeLabel(type) {
  var map = { venn: '三圆交叉分析', balance: '决策平衡单', company: '公司类型匹配' };
  return map[type] || type;
}

function getDecisionTypeIcon(type) {
  var map = { venn: '🔄', balance: '⚖️', company: '🏢' };
  return map[type] || '📋';
}

// ========== 快照渲染 ==========

function renderVennSnapshot(data) {
  var html = '';
  if (data.triple && data.triple.length > 0) {
    html += '<div class="history-snapshot-row"><span class="history-snapshot-label">三圆交集：</span>';
    html += data.triple.map(function(t) { return '<span class="history-tag history-tag-triple">' + escapeHTML(t) + '</span>'; }).join('');
    html += '</div>';
  }
  if (data.careers && data.careers.length > 0) {
    var topCareers = data.careers.slice(0, 3);
    html += '<div class="history-snapshot-row"><span class="history-snapshot-label">推荐方向：</span>';
    topCareers.forEach(function(c, i) {
      var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
      html += '<span class="history-tag">' + medal + ' ' + escapeHTML(c.name || c) + ' ' + (c.score ? c.score + '分' : '') + '</span>';
    });
    html += '</div>';
  }
  if (!html) {
    html = '<div class="history-snapshot-empty">无关键数据</div>';
  }
  return html;
}

function renderBalanceSnapshot(data) {
  var html = '';
  if (data.ranking && data.ranking.length > 0) {
    html += '<div class="history-snapshot-row"><span class="history-snapshot-label">全局 Top 3：</span>';
    data.ranking.slice(0, 3).forEach(function(r, i) {
      var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
      html += '<span class="history-tag">' + medal + ' ' + escapeHTML(r.name) + ' ' + (r.percent ? r.percent + '%' : '') + '</span>';
    });
    html += '</div>';
  }
  if (data.careers && data.careers.length > 0) {
    html += '<div class="history-snapshot-row"><span class="history-snapshot-label">候选职业：</span>';
    html += data.careers.slice(0, 4).map(function(c) { return '<span class="history-tag">' + escapeHTML(c) + '</span>'; }).join('');
    if (data.careers.length > 4) html += '<span class="history-tag history-tag-more">+' + (data.careers.length - 4) + '</span>';
    html += '</div>';
  }
  if (!html) {
    html = '<div class="history-snapshot-empty">无关键数据</div>';
  }
  return html;
}

function renderCompanySnapshot(data) {
  var html = '';
  if (data.result && data.result.length > 0) {
    html += '<div class="history-snapshot-row"><span class="history-snapshot-label">匹配公司：</span>';
    html += data.result.slice(0, 3).map(function(c) { return '<span class="history-tag">' + escapeHTML(c.name || c) + '</span>'; }).join('');
    html += '</div>';
  }
  if (!html) {
    html = '<div class="history-snapshot-empty">无关键数据</div>';
  }
  return html;
}

function renderSnapshotContent(item) {
  if (item.type === 'venn') return renderVennSnapshot(item.data);
  if (item.type === 'balance') return renderBalanceSnapshot(item.data);
  if (item.type === 'company') return renderCompanySnapshot(item.data);
  return '<div class="history-snapshot-empty">未知类型</div>';
}

// ========== 主渲染 ==========

function renderDecisionHistory() {
  var container = document.getElementById('decisionHistoryContent');
  if (!container) return;

  var history = getDecisionHistory();

  if (history.length === 0) {
    container.innerHTML = '<div class="history-empty">' +
      '<div class="history-empty-icon">📭</div>' +
      '<div class="history-empty-title">暂无决策记录</div>' +
      '<div class="history-empty-desc">完成一次决策分析后，记录会自动保存到这里。</div>' +
    '</div>';
    return;
  }

  var html = '<div class="history-header">' +
    '<div>' +
      '<h3 class="history-title">📋 决策历史</h3>' +
      '<div class="history-count">共 ' + history.length + ' 条记录，最多保存 ' + MAX_HISTORY + ' 条</div>' +
    '</div>' +
    '<button class="btn-ghost-v5 history-clear-btn" onclick="clearDecisionHistory()">清空全部</button>' +
  '</div>';

  html += '<div class="history-list">';

  history.forEach(function(item) {
    var typeLabel = getDecisionTypeLabel(item.type);
    var typeIcon = getDecisionTypeIcon(item.type);

    html += '<div class="history-card">';
    html += '<div class="history-card-header">';
    html += '<span class="history-card-type">' + typeIcon + ' ' + typeLabel + '</span>';
    html += '<span class="history-card-time">' + formatDecisionTime(item.timestamp) + '</span>';
    html += '</div>';

    html += '<div class="history-card-body">';
    html += renderSnapshotContent(item);
    html += '</div>';

    html += '<div class="history-card-actions">';
    html += '<button class="btn-ghost-v5 history-load-btn" onclick="loadDecisionSnapshot(\'' + item.id + '\')">打开并查看</button>';
    html += '<button class="btn-ghost-v5 history-delete-btn" onclick="deleteDecisionSnapshot(\'' + item.id + '\')">删除</button>';
    html += '</div>';
    html += '</div>';
  });

  html += '</div>';
  container.innerHTML = html;
}

// ========== 加载快照回溯 ==========

function loadDecisionSnapshot(id) {
  var history = getDecisionHistory();
  var item = null;
  for (var i = 0; i < history.length; i++) {
    if (history[i].id === id) { item = history[i]; break; }
  }
  if (!item) return;

  // 切换到对应工具
  switchDecisionTool(item.type);

  // 等待 DOM 渲染后回填数据
  setTimeout(function() {
    if (item.type === 'venn') {
      var vennSkill = document.getElementById('vennSkill');
      var vennLove = document.getElementById('vennLove');
      var vennMoney = document.getElementById('vennMoney');
      if (vennSkill && item.data.skills) vennSkill.value = item.data.skills.join('\n');
      if (vennLove && item.data.loves) vennLove.value = item.data.loves.join('\n');
      if (vennMoney && item.data.moneys) vennMoney.value = item.data.moneys.join('\n');
      if (typeof generateVennAnalysis === 'function') generateVennAnalysis();
    } else if (item.type === 'balance') {
      // 回填候选职业、分数和权重
      if (item.data.careers && item.data.careers.length > 0) {
        balanceState.careers = item.data.careers.slice();
        if (item.data.scores) {
          balanceState.scores = {};
          Object.keys(item.data.scores).forEach(function(c) {
            balanceState.scores[c] = Object.assign({}, item.data.scores[c]);
          });
        }
        if (item.data.weights) {
          balanceState.weights = Object.assign({}, item.data.weights);
        }
        updateBalanceUI();
      }
      if (typeof calculateBalanceResult === 'function') calculateBalanceResult();
    }
  }, 100);
}
