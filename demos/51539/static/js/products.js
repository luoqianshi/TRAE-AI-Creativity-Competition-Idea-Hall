// ==========================================
// Tab Switching
// ==========================================
(function() {
  var tabNav = document.getElementById('tab-nav');
  var tabBtns = tabNav.querySelectorAll('button');
  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tabBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var tabId = this.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(function(el) { el.classList.remove('active'); });
      document.getElementById(tabId).classList.add('active');
    });
  });
})();

// ==========================================
// Tab 1: 收银台 (Checkout) - 使用共享 CartModule
// ==========================================
CartModule.init({
  searchInput: 'search-input',
  searchBtn: 'search-btn',
  productGrid: 'product-grid',
  cartBody: 'cart-body',
  cartTotal: 'cart-total',
  checkoutBtn: 'checkout-btn',
  tempBtn: 'temp-product-btn',
  uploadBtn: 'checkout-upload-btn',
  uploadInput: 'checkout-file-input',
  attachmentsContainer: 'cart-attachments',
  itemUnit: '单位商品'
});

// ==========================================
// Tab 2: 商品管理 (Product Management)
// ==========================================
(function() {
  var products = [];

  async function loadProducts() {
    var keyword = document.getElementById('searchKeyword').value.trim();
    var active = document.getElementById('filterActive').checked;
    var params = [];
    if (keyword) params.push('keyword=' + encodeURIComponent(keyword));
    if (active) params.push('active=1');
    var url = '/api/products' + (params.length ? '?' + params.join('&') : '');

    try {
      var data = await apiGet(url);
      products = data.products || data || [];
      renderTable();
    } catch (e) {
      // error already shown by apiGet
    }
  }

  function renderTable() {
    var tbody = document.getElementById('productTableBody');
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:32px;color:#999;">暂无商品数据</td></tr>';
      return;
    }
    var html = '';
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      var isActive = !p.is_discontinued;
      var isStockZero = (p.stock != null && p.stock <= 0);
      var statusHtml;
      if (p.is_discontinued && isStockZero) {
        statusHtml = '<span class="badge badge-orange">补货</span>';
      } else if (p.is_discontinued) {
        statusHtml = '<span class="badge badge-red">下架</span>';
      } else {
        statusHtml = '<span class="badge badge-green">上架</span>';
      }
      var perishHtml = p.is_perishable ? '<span class="badge badge-green">是</span>' : '<span class="badge badge-gray">否</span>';
      var looseHtml = p.is_loose ? '<span class="badge badge-green">是</span>' : '<span class="badge badge-gray">否</span>';
      var credHtml = p.credential_required ? '<span class="badge badge-red">需要</span>' : '<span class="badge badge-gray">无需</span>';
      var stock = (p.stock != null) ? p.stock : '-';
      var actions = '';
      if (p.is_discontinued && isStockZero) {
        actions += '<button class="btn btn-success btn-sm" onclick="window._restockProduct(\'' + escapeHtml(p.product_code) + '\')">补货并上架</button> ';
      }
      if (isActive) {
        actions += '<button class="btn btn-success btn-sm" onclick="window._restockProduct(\'' + escapeHtml(p.product_code) + '\')">补货</button> ';
        actions += '<button class="btn btn-outline btn-sm" onclick="window._editProduct(\'' + escapeHtml(p.product_code) + '\')">编辑</button> ';
        actions += '<button class="btn btn-warning btn-sm" onclick="window._discontinueProduct(\'' + escapeHtml(p.product_code) + '\')">下架</button> ';
      } else {
        actions += '<button class="btn btn-outline btn-sm" onclick="window._editProduct(\'' + escapeHtml(p.product_code) + '\')">编辑</button> ';
        if (!isStockZero) {
          actions += '<button class="btn btn-warning btn-sm" onclick="window._relistProduct(\'' + escapeHtml(p.product_code) + '\')">上架</button> ';
        }
      }
      actions += '<button class="btn btn-outline btn-sm" onclick="viewBatches(\'' + escapeHtml(p.product_code) + '\')">批次</button> ';
      actions += '<button class="btn btn-danger btn-sm" onclick="window._deleteProduct(\'' + escapeHtml(p.product_code) + '\')">删除</button>';

      html += '<tr>';
      html += '<td>' + escapeHtml(p.product_code) + '</td>';
      html += '<td>' + escapeHtml(p.name) + '</td>';
      html += '<td>' + formatMoney(p.price) + '</td>';
      html += '<td>' + escapeHtml(p.unit || '') + '</td>';
      html += '<td>' + stock + '</td>';
      html += '<td>' + perishHtml + '</td>';
      html += '<td>' + looseHtml + '</td>';
      html += '<td>' + credHtml + '</td>';
      var remarks = p.remarks;
      var remarksHtml = '';
      if (Array.isArray(remarks) && remarks.length) {
        remarksHtml = remarks.map(function(r) { return '<span class="badge badge-gray" style="margin:1px">' + escapeHtml(r.key||'') + ': ' + escapeHtml(r.value||'') + '</span>'; }).join(' ');
      } else if (typeof remarks === 'string' && remarks.trim()) {
        remarksHtml = '<span class="text-muted">' + escapeHtml(remarks) + '</span>';
      } else {
        remarksHtml = '<span class="text-muted">-</span>';
      }
      html += '<td style="max-width:180px;font-size:12px">' + remarksHtml + '</td>';
      html += '<td>' + statusHtml + '</td>';
      html += '<td>' + actions + '</td>';
      html += '</tr>';
    }
    tbody.innerHTML = html;
  }

  function findProduct(code) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].product_code === code) return products[i];
    }
    return null;
  }

  async function viewBatches(code) {
    try {
      var batches = await apiGet('/api/products/' + encodeURIComponent(code) + '/batches');
    } catch (e) {
      return;
    }
    var product = findProduct(code);
    var title = product ? product.name : code;
    var now = new Date().toISOString();
    var html = '<div class="modal-header"><h3 class="modal-title">' + escapeHtml(title) + ' - 批次清单</h3><button type="button" class="modal-close" onclick="closeModal()">&times;</button></div>';
    if (!batches || !batches.length) {
      html += '<div style="text-align:center;padding:32px;color:#999;">暂无批次数据</div>';
    } else {
      html += '<div class="table-wrap"><table class="table"><thead><tr><th>批次号</th><th>库存</th><th>生产日期</th><th>过期日期</th><th>状态</th><th>操作</th></tr></thead><tbody>';
      for (var i = 0; i < batches.length; i++) {
        var b = batches[i];
        var expired = b.expiry_time && b.expiry_time <= now;
        var depleted = (b.stock != null && b.stock <= 0);
        var statusBadge;
        if (expired) {
          statusBadge = '<span class="badge badge-red">过期</span>';
        } else if (depleted) {
          statusBadge = '<span class="badge badge-gray">耗尽</span>';
        } else {
          statusBadge = '<span class="badge badge-green">在售</span>';
        }
        var actionHtml = '-';
        if (b.stock > 0) {
          actionHtml = '<button class="btn btn-danger btn-xs" onclick="window._wasteBatch(\'' + escapeHtml(b.batch_no) + '\',' + b.stock + ',\'' + escapeHtml(code) + '\')">报损</button>';
        }
        html += '<tr>';
        html += '<td>' + escapeHtml(b.batch_no) + '</td>';
        html += '<td>' + (b.stock != null ? b.stock : '-') + '</td>';
        html += '<td>' + (b.production_time ? formatDate(b.production_time).substring(0, 10) : '-') + '</td>';
        html += '<td>' + (b.expiry_time ? formatDate(b.expiry_time).substring(0, 10) : '-') + '</td>';
        html += '<td>' + statusBadge + '</td>';
        html += '<td>' + actionHtml + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table></div>';
    }
    openModal(html, 'lg');
  }
  window.viewBatches = viewBatches;

  window._wasteBatch = function(batchNo, maxQty, productCode) {
    var prod = findProduct(productCode);
    var isLoose = prod && prod.is_loose;
    var step = isLoose ? 'any' : '1';
    var minVal = isLoose ? '0.01' : '1';
    var html = '' +
      '<div class="modal-header">' +
        '<h3 class="modal-title">手动报损 - ' + escapeHtml(batchNo) + '</h3>' +
        '<button type="button" class="modal-close" onclick="closeModal()">&times;</button>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">报损数量</label>' +
        '<input type="number" class="form-input" id="waste-qty"' +
          ' value="' + maxQty + '" min="' + minVal + '" max="' + maxQty + '" step="' + step + '">' +
        '<div style="margin-top:4px;font-size:12px;color:var(--gray-500);">' +
          '当前库存: <b>' + maxQty + '</b> | 可报损范围: ' + minVal + ' ~ ' + maxQty +
          (isLoose ? '' : ' (仅整数)') +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">报损原因（选填）</label>' +
        '<input type="text" class="form-input" id="waste-reason" placeholder="如：破损、变质...">' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="btn btn-outline" onclick="closeModal()">取消</button>' +
        '<button class="btn btn-danger" id="waste-submit-btn">确认报损</button>' +
      '</div>';
    openModal(html, 'md');

    document.getElementById('waste-submit-btn').addEventListener('click', function() {
      var qty = parseFloat(document.getElementById('waste-qty').value) || 0;
      var reason = document.getElementById('waste-reason').value.trim();
      if (qty <= 0 || qty > maxQty) {
        showToast('请输入有效数量', 'error');
        return;
      }
      if (!isLoose && qty !== Math.floor(qty)) {
        showToast('该商品非散装，数量必须为整数', 'error');
        return;
      }
      var btn = document.getElementById('waste-submit-btn');
      btn.disabled = true;
      btn.textContent = '提交中...';
      apiPost('/api/batches/' + encodeURIComponent(batchNo) + '/waste', {
        quantity: qty,
        reason: reason || undefined
      }).then(function() {
        showToast('已报损 ' + qty + '，剩余 ' + (maxQty - qty));
        closeModal();
        viewBatches(productCode);
      }).catch(function(err) {
        showToast('报损失败: ' + (err.message || '未知错误'), 'error');
        btn.disabled = false;
        btn.textContent = '确认报损';
      });
    });
  };

  window.openCreateModal = function() {
    var html = '' +
      '<div class="modal-header">' +
        '<h3 class="modal-title">新增商品</h3>' +
        '<button type="button" class="modal-close" onclick="closeModal()">&times;</button>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">名称 <span style="color:red">*</span></label>' +
        '<input type="text" id="prodName" class="form-input" required>' +
      '</div>' +
      '<div class="flex gap-8">' +
        '<div class="form-group" style="flex:1">' +
          '<label class="form-label">单价</label>' +
          '<input type="number" id="prodPrice" class="form-input" step="0.01" min="0" value="0">' +
        '</div>' +
        '<div class="form-group" style="flex:1">' +
          '<label class="form-label">单位</label>' +
          '<input type="text" id="prodUnit" class="form-input" placeholder="如：个、瓶、斤">' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-checkbox">' +
          '<input type="checkbox" id="prodPerishable"> 易腐商品' +
        '</label>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-checkbox">' +
          '<input type="checkbox" id="prodCredential"> 需要凭证' +
        '</label>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-checkbox">' +
          '<input type="checkbox" id="prodLoose"> 散装（允许小数数量）' +
        '</label>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">备注</label>' +
        '<div id="createRemarks">' +
          '<div class="remark-row flex gap-8" style="margin-bottom:8px">' +
            '<input type="text" class="form-input remark-key" placeholder="键" style="flex:1">' +
            '<input type="text" class="form-input remark-val" placeholder="值" style="flex:2">' +
            '<button type="button" class="btn btn-danger btn-xs kv-del" onclick="this.parentElement.remove()">&times;</button>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="btn btn-outline btn-sm" onclick="RemarksEditor.addRow(\'createRemarks\')">+ 添加备注</button>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button type="button" class="btn btn-outline" onclick="closeModal()">取消</button>' +
        '<button type="button" class="btn btn-primary" onclick="window._submitCreate()">保存</button>' +
      '</div>';
    openModal(html);
  };

  window._submitCreate = async function() {
    var name = document.getElementById('prodName').value.trim();
    if (!name) { showToast('请输入商品名称', 'error'); return; }
    var data = {
      name: name,
      price: truncateMoney(parseFloat(document.getElementById('prodPrice').value) || 0),
      unit: document.getElementById('prodUnit').value.trim(),
      is_perishable: document.getElementById('prodPerishable').checked,
      credential_required: document.getElementById('prodCredential').checked,
      is_loose: document.getElementById('prodLoose').checked,
      remarks: RemarksEditor.collect('createRemarks')
    };
    try {
      await apiPost('/api/products', data);
      showToast('商品创建成功', 'success');
      closeModal();
      loadProducts();
    } catch (e) {
      // error shown by apiPost
    }
  };

  window._editProduct = function(code) {
    var p = findProduct(code);
    if (!p) return;
    var checkedPerish = p.is_perishable ? ' checked' : '';
    var checkedCred = p.credential_required ? ' checked' : '';
    var html = '' +
      '<div class="modal-header">' +
        '<h3 class="modal-title">编辑商品</h3>' +
        '<button class="modal-close" onclick="closeModal()">&times;</button>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">名称 <span style="color:red">*</span></label>' +
        '<input type="text" id="editName" class="form-input" value="' + escapeHtml(p.name) + '" required>' +
      '</div>' +
      '<div class="flex gap-8">' +
        '<div class="form-group" style="flex:1">' +
          '<label class="form-label">单价</label>' +
          '<input type="number" id="editPrice" class="form-input" step="0.01" min="0" value="' + (p.price || 0) + '">' +
        '</div>' +
        '<div class="form-group" style="flex:1">' +
          '<label class="form-label">单位</label>' +
          '<input type="text" id="editUnit" class="form-input" value="' + escapeHtml(p.unit || '') + '">' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-checkbox">' +
          '<input type="checkbox" id="editPerishable"' + checkedPerish + '> 易腐商品' +
        '</label>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-checkbox">' +
          '<input type="checkbox" id="editCredential"' + checkedCred + '> 需要凭证' +
        '</label>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-checkbox">' +
          '<input type="checkbox" id="editLoose"' + (p.is_loose ? ' checked' : '') + '> 散装（允许小数数量）' +
        '</label>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">备注</label>' +
        '<div id="editRemarks"></div>' +
        '<button type="button" class="btn btn-outline btn-sm" onclick="RemarksEditor.addRow(\'editRemarks\')">+ 添加备注</button>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button type="button" class="btn btn-outline" onclick="closeModal()">取消</button>' +
        '<button type="button" class="btn btn-primary" onclick="window._submitEdit(\'' + escapeHtml(code) + '\')">保存</button>' +
      '</div>';
    openModal(html);
    var exRemarks = Array.isArray(p.remarks) ? p.remarks : [];
    for (var i = 0; i < exRemarks.length; i++) {
      RemarksEditor.addRow('editRemarks');
      var rows = document.getElementById('editRemarks').querySelectorAll('.remark-row');
      var lastRow = rows[rows.length - 1];
      lastRow.querySelector('.remark-key').value = exRemarks[i].key || '';
      lastRow.querySelector('.remark-val').value = exRemarks[i].value || '';
    }
  };

  window._submitEdit = async function(code) {
    var name = document.getElementById('editName').value.trim();
    if (!name) { showToast('请输入商品名称', 'error'); return; }
    var data = {
      name: name,
      price: truncateMoney(parseFloat(document.getElementById('editPrice').value) || 0),
      unit: document.getElementById('editUnit').value.trim(),
      is_perishable: document.getElementById('editPerishable').checked,
      credential_required: document.getElementById('editCredential').checked,
      is_loose: document.getElementById('editLoose').checked,
      remarks: RemarksEditor.collect('editRemarks')
    };
    try {
      await apiPut('/api/products/' + code, data);
      showToast('商品更新成功', 'success');
      closeModal();
      loadProducts();
    } catch (e) {
      // error shown by apiPut
    }
  };

  window._discontinueProduct = async function(code) {
    if (!confirm('确定要下架该商品吗？')) return;
    try {
      await apiPost('/api/products/' + code + '/discontinue');
      showToast('商品已下架', 'success');
      loadProducts();
    } catch (e) {}
  };

  window._relistProduct = async function(code) {
    if (!confirm('确定要重新上架该商品吗？')) return;
    try {
      await apiPost('/api/products/' + code + '/relist');
      showToast('商品已上架', 'success');
      loadProducts();
    } catch (e) {}
  };

  window._deleteProduct = async function(code) {
    if (!confirm('确定要删除该商品吗？此操作不可恢复。')) return;
    try {
      await apiDelete('/api/products/' + code);
      showToast('商品已删除', 'success');
      loadProducts();
    } catch (e) {}
  };

  window._restockProduct = function(code) {
    var p = findProduct(code);
    if (!p) return;
    var perishFields = '';
    if (p.is_perishable) {
      perishFields = '' +
        '<div class="form-group">' +
          '<label class="form-label">生产时间</label>' +
          '<input type="datetime-local" id="restockProductionTime" class="form-input">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">过期时间</label>' +
          '<input type="datetime-local" id="restockExpiryTime" class="form-input">' +
        '</div>';
    }
    var html = '' +
      '<div class="modal-header">' +
        '<h3 class="modal-title">补货 - ' + escapeHtml(p.name) + '</h3>' +
        '<button class="modal-close" onclick="closeModal()">&times;</button>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">商品编码</label>' +
        '<input type="text" class="form-input" value="' + escapeHtml(p.product_code) + '" readonly>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label">数量 <span style="color:red">*</span></label>' +
        '<input type="number" id="restockQuantity" class="form-input" min="1" value="1" required>' +
      '</div>' +
      perishFields +
      '<div class="modal-footer">' +
        '<button type="button" class="btn btn-outline" onclick="closeModal()">取消</button>' +
        '<button type="button" class="btn btn-success" onclick="window._submitRestock(\'' + escapeHtml(code) + '\', ' + (p.is_perishable ? 'true' : 'false') + ')">确认补货</button>' +
      '</div>';
    openModal(html);
  };

  window._submitRestock = async function(code, isPerishable) {
    var quantity = parseInt(document.getElementById('restockQuantity').value) || 0;
    if (quantity <= 0) { showToast('请输入有效数量', 'error'); return; }
    var data = {
      product_code: code,
      quantity: quantity
    };
    if (isPerishable) {
      var pt = document.getElementById('restockProductionTime').value;
      var et = document.getElementById('restockExpiryTime').value;
      if (pt) data.production_time = localToUtcIso(pt);
      if (et) data.expiry_time = localToUtcIso(et);
    }
    try {
      await apiPost('/api/restock', data);
      showToast('补货成功', 'success');
      closeModal();
      loadProducts();
    } catch (e) {}
  };

  // Make loadProducts accessible for search button
  window.loadProducts = loadProducts;

  loadProducts();
})();
