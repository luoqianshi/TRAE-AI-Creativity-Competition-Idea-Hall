// assets/charts.js — DataFusion Pro Demo
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // ===== Query Trend Chart =====
  var weekData = {
    categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    mysql: [320, 402, 351, 534, 490, 280, 307],
    postgres: [180, 234, 290, 330, 310, 150, 190],
    mongodb: [95, 120, 88, 145, 132, 78, 92],
    other: [42, 56, 38, 67, 58, 30, 44]
  };

  var monthData = {
    categories: ['第1周', '第2周', '第3周', '第4周'],
    mysql: [2684, 3120, 2945, 3380],
    postgres: [1680, 1920, 1840, 2100],
    mongodb: [750, 890, 820, 960],
    other: [335, 380, 350, 420]
  };

  function renderChart(data) {
    var chart = echarts.init(document.getElementById('chart-query-trend'), null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 12 },
        axisPointer: { type: 'cross', crossStyle: { color: muted } }
      },
      legend: {
        data: ['MySQL', 'PostgreSQL', 'MongoDB', '其他'],
        top: 0,
        textStyle: { color: muted, fontSize: 12 },
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 4
      },
      grid: { left: 48, right: 24, top: 40, bottom: 32 },
      xAxis: {
        type: 'category',
        data: data.categories,
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      series: [
        {
          name: 'MySQL',
          type: 'bar',
          stack: 'total',
          data: data.mysql,
          itemStyle: { color: accent, borderRadius: [0, 0, 0, 0] },
          barWidth: 28
        },
        {
          name: 'PostgreSQL',
          type: 'bar',
          stack: 'total',
          data: data.postgres,
          itemStyle: { color: accent2 }
        },
        {
          name: 'MongoDB',
          type: 'bar',
          stack: 'total',
          data: data.mongodb,
          itemStyle: { color: accent3 }
        },
        {
          name: '其他',
          type: 'bar',
          stack: 'total',
          data: data.other,
          itemStyle: { color: muted + '66', borderRadius: [4, 4, 0, 0] }
        }
      ]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  }

  // Initialize chart
  if (document.getElementById('chart-query-trend')) {
    renderChart(weekData);
  }

  // Expose updateChart globally
  window.updateChart = function(period) {
    renderChart(period === 'month' ? monthData : weekData);
  };

  // ===== Mock Query Results =====
  var mockUsers = [
    { id: 1001, username: 'zhang_wei', email: 'zhang.wei@example.com', created_at: '2024-01-15', order_count: 28, total_spent: '¥12,580.00' },
    { id: 1002, username: 'li_na', email: 'li.na@example.com', created_at: '2024-01-22', order_count: 35, total_spent: '¥18,340.50' },
    { id: 1003, username: 'wang_fang', email: 'wang.fang@example.com', created_at: '2024-02-03', order_count: 12, total_spent: '¥4,890.00' },
    { id: 1004, username: 'chen_jie', email: 'chen.jie@example.com', created_at: '2024-02-14', order_count: 42, total_spent: '¥24,100.00' },
    { id: 1005, username: 'liu_yang', email: 'liu.yang@example.com', created_at: '2024-02-28', order_count: 8, total_spent: '¥2,150.00' },
    { id: 1006, username: 'zhao_min', email: 'zhao.min@example.com', created_at: '2024-03-05', order_count: 19, total_spent: '¥8,720.00' },
    { id: 1007, username: 'sun_lei', email: 'sun.lei@example.com', created_at: '2024-03-12', order_count: 55, total_spent: '¥32,400.00' },
    { id: 1008, username: 'zhou_yu', email: 'zhou.yu@example.com', created_at: '2024-03-20', order_count: 15, total_spent: '¥6,330.00' },
    { id: 1009, username: 'wu_xia', email: 'wu.xia@example.com', created_at: '2024-04-01', order_count: 23, total_spent: '¥11,200.00' },
    { id: 1010, username: 'xu_hao', email: 'xu.hao@example.com', created_at: '2024-04-08', order_count: 31, total_spent: '¥15,880.00' },
    { id: 1011, username: 'huang_tao', email: 'huang.tao@example.com', created_at: '2024-04-15', order_count: 9, total_spent: '¥3,450.00' },
    { id: 1012, username: 'he_lan', email: 'he.lan@example.com', created_at: '2024-04-22', order_count: 47, total_spent: '¥28,900.00' },
    { id: 1013, username: 'ma_jun', email: 'ma.jun@example.com', created_at: '2024-05-01', order_count: 16, total_spent: '¥7,100.00' },
    { id: 1014, username: 'gao_xin', email: 'gao.xin@example.com', created_at: '2024-05-10', order_count: 38, total_spent: '¥21,500.00' },
    { id: 1015, username: 'lin_rui', email: 'lin.rui@example.com', created_at: '2024-05-18', order_count: 6, total_spent: '¥1,890.00' }
  ];

  function populateResults() {
    var tbody = document.getElementById('queryResultBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    mockUsers.forEach(function(u) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td style="font-family:GeistMono,monospace;color:var(--accent)">' + u.id + '</td>' +
        '<td style="font-weight:600">' + u.username + '</td>' +
        '<td style="color:var(--muted)">' + u.email + '</td>' +
        '<td>' + u.created_at + '</td>' +
        '<td style="text-align:center">' + u.order_count + '</td>' +
        '<td style="font-weight:600;color:var(--accent2)">' + u.total_spent + '</td>';
      tbody.appendChild(tr);
    });
  }
  populateResults();

})();

// ===== Page Navigation =====
function switchPage(page) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  var pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  var titles = { dashboard: '仪表盘', query: 'SQL 查询', joint: '联合查询', security: '安全防护', updates: '系统更新' };
  document.getElementById('pageTitle').textContent = titles[page] || page;
  // Highlight nav
  document.querySelectorAll('.nav-item').forEach(function(n) {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').indexOf(page) > -1) {
      n.classList.add('active');
    }
  });
}

// ===== Toast Notifications =====
function showToast(type, message) {
  var container = document.getElementById('toastContainer');
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  var icons = {
    success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
    error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
  };
  toast.innerHTML = (icons[type] || icons.info) + '<span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

// ===== Modal =====
function openModal(name) {
  document.getElementById('modal-' + name).classList.add('active');
}
function closeModal(name) {
  document.getElementById('modal-' + name).classList.remove('active');
}

// ===== Database Type Selection (Modal) =====
var defaultPorts = { mysql: '3306', postgres: '5432', mongodb: '27017', redis: '6379', elasticsearch: '9200', clickhouse: '8123' };
function selectDbType(el, type) {
  document.querySelectorAll('.db-type-option').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
  document.getElementById('connPort').value = defaultPorts[type] || '3306';
}

// ===== Test Connection =====
function testConnection() {
  showToast('info', '正在测试连接...');
  setTimeout(function() { showToast('success', '连接测试成功！延迟 12ms'); }, 1500);
}

// ===== Save Connection =====
function saveConnection() {
  var name = document.getElementById('connName').value;
  if (!name) { showToast('error', '请输入连接名称'); return; }
  showToast('success', '数据库连接 "' + name + '" 已保存');
  closeModal('addConnection');
}

// ===== SQL Editor =====
function selectDb(el, db) {
  document.querySelectorAll('.db-selector').forEach(function(d) { d.style.borderColor = 'var(--rule)'; });
  el.style.borderColor = 'var(--accent)';
  var dbNames = { mysql: 'MySQL 8.0', postgres: 'PostgreSQL 15', mongodb: 'MongoDB 7.0', redis: 'Redis 7.2', elasticsearch: 'Elasticsearch 8.11', clickhouse: 'ClickHouse 24.1' };
  showToast('info', '已切换到 ' + dbNames[db]);
}

function executeQuery() {
  showToast('info', '正在执行查询...');
  var info = document.getElementById('resultInfo');
  if (info) info.innerHTML = '<span style="color:var(--accent)"><span class="spin" style="display:inline-block;width:12px;height:12px;border:2px solid var(--accent);border-top-color:transparent;border-radius:50%;margin-right:6px;vertical-align:middle;"></span>执行中...</span>';
  setTimeout(function() {
    if (info) info.innerHTML = '<span>15 行结果</span><span>执行时间: 0.045s</span><span>' + new Date().toLocaleString('zh-CN') + '</span>';
    showToast('success', '查询执行成功，返回 15 行结果');
  }, 1200);
}

function formatSQL() {
  showToast('success', 'SQL 已格式化');
}

function clearEditor() {
  document.getElementById('sqlInput').value = '';
  showToast('info', '编辑器已清空');
}

function switchResultTab(el, tab) {
  document.querySelectorAll('.result-tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  var content = document.getElementById('resultContent');
  if (tab === 'messages') {
    content.innerHTML = '<div style="padding:20px;font-size:0.82rem;color:var(--muted);"><div style="margin-bottom:8px;color:var(--success);">[OK] 查询执行成功</div><div style="margin-bottom:8px;">使用索引: idx_users_status_created (命中 1,284 行)</div><div style="margin-bottom:8px;">扫描行数: 1,284 | 返回行数: 15</div><div>执行计划: Index Scan → Filter → Aggregate → Sort → Limit</div></div>';
  } else if (tab === 'history') {
    content.innerHTML = '<div style="padding:12px;font-size:0.82rem;"><div style="padding:10px 0;border-bottom:1px solid var(--rule);"><div style="color:var(--ink);font-weight:600;">SELECT users WHERE status...</div><div style="color:var(--muted);font-size:0.72rem;margin-top:2px;">MySQL | 0.032s | 14:32:05</div></div><div style="padding:10px 0;border-bottom:1px solid var(--rule);"><div style="color:var(--ink);font-weight:600;">SELECT COUNT(*) FROM orders...</div><div style="color:var(--muted);font-size:0.72rem;margin-top:2px;">PostgreSQL | 0.018s | 14:28:11</div></div><div style="padding:10px 0;"><div style="color:var(--ink);font-weight:600;">db.articles.find({status:...</div><div style="color:var(--muted);font-size:0.72rem;margin-top:2px;">MongoDB | 0.005s | 14:15:33</div></div></div>';
  } else {
    content.innerHTML = '<div class="table-wrap"><table><thead><tr><th>id</th><th>username</th><th>email</th><th>created_at</th><th>order_count</th><th>total_spent</th></tr></thead><tbody id="queryResultBody"></tbody></table></div>';
    // Re-populate
    (function() {
      var mockUsers = [
        { id: 1001, username: 'zhang_wei', email: 'zhang.wei@example.com', created_at: '2024-01-15', order_count: 28, total_spent: '¥12,580.00' },
        { id: 1002, username: 'li_na', email: 'li.na@example.com', created_at: '2024-01-22', order_count: 35, total_spent: '¥18,340.50' },
        { id: 1003, username: 'wang_fang', email: 'wang.fang@example.com', created_at: '2024-02-03', order_count: 12, total_spent: '¥4,890.00' },
        { id: 1004, username: 'chen_jie', email: 'chen.jie@example.com', created_at: '2024-02-14', order_count: 42, total_spent: '¥24,100.00' },
        { id: 1005, username: 'liu_yang', email: 'liu.yang@example.com', created_at: '2024-02-28', order_count: 8, total_spent: '¥2,150.00' }
      ];
      var tbody = document.getElementById('queryResultBody');
      if (!tbody) return;
      mockUsers.forEach(function(u) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td style="font-family:GeistMono,monospace;color:var(--accent)">' + u.id + '</td><td style="font-weight:600">' + u.username + '</td><td style="color:var(--muted)">' + u.email + '</td><td>' + u.created_at + '</td><td style="text-align:center">' + u.order_count + '</td><td style="font-weight:600;color:var(--accent2)">' + u.total_spent + '</td>';
        tbody.appendChild(tr);
      });
    })();
  }
}

// ===== Joint Query =====
function toggleSource(el) {
  el.classList.toggle('selected');
}

function toggleFieldSelect(el) {
  el.style.background = el.style.background ? '' : 'rgba(59,130,246,0.15)';
}

function executeJointQuery() {
  showToast('info', '正在执行跨库联合查询...');
  setTimeout(function() {
    showToast('success', '联合查询完成，返回 100 行结果（MySQL: 50行, PostgreSQL: 50行）');
  }, 2000);
}

// ===== System Update =====
function startUpdate() {
  var progress = document.getElementById('updateProgress');
  var bar = document.getElementById('updateProgressBar');
  var status = document.getElementById('updateStatus');
  var detail = document.getElementById('updateDetail');
  var btn = document.getElementById('updateBtn');
  progress.style.display = 'block';
  btn.disabled = true;
  btn.style.opacity = '0.5';
  btn.style.cursor = 'not-allowed';

  var pct = 0;
  var stages = [
    { to: 30, label: '正在下载更新包...', detail: '正在下载更新包 v2.5.0' },
    { to: 60, label: '正在验证完整性...', detail: '正在验证更新包完整性' },
    { to: 85, label: '正在安装更新...', detail: '正在安装更新 v2.5.0' },
    { to: 100, label: '正在重启服务...', detail: '正在重启服务' }
  ];
  var stageIdx = 0;

  var interval = setInterval(function() {
    if (stageIdx >= stages.length) {
      clearInterval(interval);
      status.textContent = '更新完成！';
      status.style.color = 'var(--success)';
      detail.textContent = 'DataFusion Pro 已更新至 v2.5.0';
      btn.textContent = '已更新至 v2.5.0';
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.onclick = function() { showToast('info', '当前已是最新版本'); };
      showToast('success', '系统已成功更新至 v2.5.0');
      return;
    }
    var stage = stages[stageIdx];
    pct += 2;
    if (pct >= stage.to) {
      pct = stage.to;
      stageIdx++;
    }
    bar.style.width = pct + '%';
    status.textContent = stage.label;
    detail.textContent = stage.detail + ' (' + pct + '%)';
  }, 80);
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    executeQuery();
  }
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(function(m) {
      m.classList.remove('active');
    });
  }
});

// ===== Canvas Node Dragging =====
(function() {
  var nodes = document.querySelectorAll('.canvas-node');
  nodes.forEach(function(node) {
    var isDragging = false;
    var startX, startY, origLeft, origTop;
    node.addEventListener('mousedown', function(e) {
      if (e.target.closest('.canvas-node-field')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseInt(node.style.left) || 0;
      origTop = parseInt(node.style.top) || 0;
      node.style.zIndex = '10';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      node.style.left = (origLeft + dx) + 'px';
      node.style.top = (origTop + dy) + 'px';
    });
    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        node.style.zIndex = '';
      }
    });
  });
})();
