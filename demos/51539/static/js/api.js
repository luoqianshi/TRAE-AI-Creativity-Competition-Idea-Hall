/**
 * API request wrapper + toast notification utilities
 */

// ---- Toast ----
function showToast(msg, type) {
  type = type || 'info';
  var container = document.getElementById('toast-container');
  var el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(function() {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';
    setTimeout(function() { el.remove(); }, 300);
  }, 3000);
}

// ---- Modal helpers ----
function openModal(html) {
  var overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = '<div class="modal" onclick="event.stopPropagation()">' + html + '</div>';
  overlay.style.display = 'flex';
  // 延迟绑定避免触发按钮的事件冒泡误关弹窗
  setTimeout(function() {
    overlay.onclick = function(e) {
      if (e.target === overlay) closeModal();
    };
  }, 0);
}

function closeModal() {
  var overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
}

// ---- API helpers ----
async function apiGet(url) {
  try {
    var resp = await fetch(url);
    if (!resp.ok) {
      var err = await resp.json().catch(function() { return {error: '请求失败 (' + resp.status + ')'}; });
      throw new Error(err.error || '请求失败');
    }
    return await resp.json();
  } catch (e) {
    showToast(e.message, 'error');
    throw e;
  }
}

async function apiPost(url, data) {
  try {
    var resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!resp.ok) {
      var err = await resp.json().catch(function() { return {error: '请求失败 (' + resp.status + ')'}; });
      throw new Error(err.error || '请求失败');
    }
    return await resp.json();
  } catch (e) {
    showToast(e.message, 'error');
    throw e;
  }
}

async function apiPut(url, data) {
  try {
    var resp = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!resp.ok) {
      var err = await resp.json().catch(function() { return {error: '请求失败 (' + resp.status + ')'}; });
      throw new Error(err.error || '请求失败');
    }
    return await resp.json();
  } catch (e) {
    showToast(e.message, 'error');
    throw e;
  }
}

async function apiDelete(url) {
  try {
    var resp = await fetch(url, { method: 'DELETE' });
    if (!resp.ok) {
      var err = await resp.json().catch(function() { return {error: '请求失败 (' + resp.status + ')'}; });
      throw new Error(err.error || '请求失败');
    }
    return await resp.json();
  } catch (e) {
    showToast(e.message, 'error');
    throw e;
  }
}

async function apiUpload(file) {
  try {
    var fd = new FormData();
    fd.append('file', file);
    var resp = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!resp.ok) {
      var err = await resp.json().catch(function() { return {error: '上传失败 (' + resp.status + ')'}; });
      throw new Error(err.error || '上传失败');
    }
    return await resp.json();
  } catch (e) {
    showToast(e.message, 'error');
    throw e;
  }
}

// ---- Status label mappings ----
var EXPRESS_STATUS_LABELS = {
  'in_stock': '在库',
  'picked': '已取件',
  'collected': '已揽收',
  'returned': '已退回',
  'wasted': '已报损',
  'rejected': '已拒收'
};

var EXPRESS_STATUS_CLASSES = {
  'in_stock': 'badge-blue',
  'picked': 'badge-green',
  'collected': 'badge-green',
  'returned': 'badge-yellow',
  'wasted': 'badge-red',
  'rejected': 'badge-gray'
};

function statusBadge(status) {
  var label = EXPRESS_STATUS_LABELS[status] || status;
  var cls = EXPRESS_STATUS_CLASSES[status] || 'badge-gray';
  return '<span class="badge ' + cls + '">' + label + '</span>';
}

function orderStatusBadge(status) {
  var map = { 'completed': 'badge-green', 'refunded': 'badge-red', 'partially_refunded': 'badge-yellow' };
  var labels = { 'completed': '已完成', 'refunded': '已退款', 'partially_refunded': '部分退款' };
  var cls = map[status] || 'badge-gray';
  var label = labels[status] || status;
  return '<span class="badge ' + cls + '">' + label + '</span>';
}

// ---- Format helpers ----
function formatMoney(n) {
  return '¥' + (Number(n) || 0).toFixed(2);
}

function truncateMoney(n) {
  return Math.floor((Number(n) || 0) * 100) / 100;
}

function formatDate(iso) {
  if (!iso) return '-';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  var pad = function(n) { return n < 10 ? '0' + n : n; };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
         pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}

// datetime-local 控件的本地时间值 (yyyy-MM-ddTHH:mm) → UTC ISO 字符串
function localToUtcIso(localStr) {
  if (!localStr) return undefined;
  var d = new Date(localStr); // 浏览器按本地时区解析
  return d.toISOString();
}

// Date 对象 → datetime-local 输入框的本地时间值 (yyyy-MM-ddTHH:mm)
function toDatetimeLocalValue(d) {
  var pad = function(n) { return n < 10 ? '0' + n : n; };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

// UTC ISO 字符串 → datetime-local 输入框的本地时间值
function utcIsoToDatetimeLocal(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return toDatetimeLocalValue(d);
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
