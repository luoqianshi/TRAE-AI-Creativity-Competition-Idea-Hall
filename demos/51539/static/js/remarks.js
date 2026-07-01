/**
 * 统一备注编辑器模块
 * 
 * 标准化 CSS 类名：.remark-row / .remark-key / .remark-val
 * 
 * API：
 *   RemarksEditor.render(containerId, existing)  — 渲染编辑器（清空+填充已有数据+追加空行）
 *   RemarksEditor.addRow(containerId)             — 追加一个空行
 *   RemarksEditor.collect(containerId)             — 遍历 DOM 返回 [{key, value}, ...]
 *   RemarksEditor.refresh(containerId)            — 更新容器的 data-remarks 属性
 */
(function() {
  var RemarkRow = 'remark-row flex gap-8';
  var RemarkKey = 'form-input remark-key';
  var RemarkVal = 'form-input remark-val';

  function el(id) {
    return document.getElementById(id);
  }

  function addRow(containerId) {
    var container = el(containerId);
    if (!container) return;
    var row = document.createElement('div');
    row.className = RemarkRow;
    row.innerHTML =
      '<input class="' + RemarkKey + '" placeholder="键">' +
      '<input class="' + RemarkVal + '" placeholder="值">' +
      '<button type="button" class="btn btn-danger btn-xs">&times;</button>';
    row.querySelector('button').addEventListener('click', function() {
      row.remove();
      refresh(containerId);
    });
    row.querySelectorAll('input').forEach(function(inp) {
      inp.addEventListener('input', function() { refresh(containerId); });
    });
    container.appendChild(row);
    refresh(containerId);
  }

  function refresh(containerId) {
    var container = el(containerId);
    if (!container) return;
    var items = container.querySelectorAll('.remark-row');
    var list = [];
    items.forEach(function(row) {
      var keyEl = row.querySelector('.remark-key');
      var valEl = row.querySelector('.remark-val');
      if (keyEl && valEl && (keyEl.value.trim() || valEl.value.trim())) {
        list.push({key: keyEl.value.trim(), value: valEl.value.trim()});
      }
    });
    container.setAttribute('data-remarks', JSON.stringify(list));
  }

  function collect(containerId) {
    var container = el(containerId);
    if (!container) return [];
    var rows = container.querySelectorAll('.remark-row');
    var result = [];
    rows.forEach(function(row) {
      var keyEl = row.querySelector('.remark-key');
      var valEl = row.querySelector('.remark-val');
      if (keyEl && valEl) {
        var k = keyEl.value.trim();
        var v = valEl.value.trim();
        if (k || v) result.push({key: k, value: v});
      }
    });
    return result;
  }

  function render(containerId, existing) {
    var container = el(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (existing && existing.length) {
      existing.forEach(function(r) {
        var row = document.createElement('div');
        row.className = RemarkRow;
        row.innerHTML =
          '<input class="' + RemarkKey + '" value="' + escapeHtml(r.key || '') + '" placeholder="键">' +
          '<input class="' + RemarkVal + '" value="' + escapeHtml(r.value || '') + '" placeholder="值">' +
          '<button type="button" class="btn btn-danger btn-xs">&times;</button>';
        row.querySelector('button').addEventListener('click', function() {
          row.remove();
          refresh(containerId);
        });
        row.querySelectorAll('input').forEach(function(inp) {
          inp.addEventListener('input', function() { refresh(containerId); });
        });
        container.appendChild(row);
      });
    }
    addRow(containerId);
  }

  window.RemarksEditor = {
    render: render,
    addRow: addRow,
    collect: collect,
    refresh: refresh
  };
})();
