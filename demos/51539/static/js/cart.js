/**
 * 共享购物车模块
 * 提供 addToCart / removeFromCart / updateQty / toggleGift / calcTotal / renderCart / doCheckout
 * 以及临时商品弹窗、图片上传、商品搜索和渲染
 * 
 * 用法:
 *   CartModule.init({
 *     searchInput: 'search-input',
 *     searchBtn: 'search-btn',
 *     productGrid: 'product-grid',
 *     cartBody: 'cart-body',
 *     cartTotal: 'cart-total',
 *     checkoutBtn: 'checkout-btn',
 *     tempBtn: 'temp-product-btn',
 *     uploadBtn: 'checkout-upload-btn',
 *     uploadInput: 'checkout-file-input',
 *     attachmentsContainer: 'cart-attachments',
 *     itemUnit: '件商品'   // products 页面用 '单位商品'
 *   });
 */
var CartModule = (function() {
  var cart = [];
  var checkoutAttachments = [];
  var config = {};

  function init(cfg) {
    config = cfg;
    cart = [];
    checkoutAttachments = [];
    bindSearchEvents();
    bindCheckoutEvent();
    bindTempBtn();
    renderCart();
  }

  // ---- DOM helpers ----
  function el(id) { return document.getElementById(id); }

  // ---- Upload ----
  function handleUpload(input) {
    var file = input.files[0];
    if (!file) return;
    var btn = el(config.uploadBtn);
    if (btn) { btn.disabled = true; btn.textContent = '上传中...'; }
    apiUpload(file).then(function(res) {
      checkoutAttachments = [res.file_url];
      var container = el(config.attachmentsContainer);
      container.innerHTML = '<div style="display:inline-block;position:relative;margin:4px;">' +
        '<img src="' + escapeHtml(res.file_url) + '" style="width:48px;height:48px;object-fit:cover;border-radius:4px;border:1px solid var(--gray-300);" onerror="this.style.display=\'none\'">' +
        '<span onclick="CartModule.clearAttachments()" style="position:absolute;top:-6px;right:-6px;cursor:pointer;background:var(--red-500);color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;line-height:18px;text-align:center;">\u00d7</span>' +
        '</div>';
      if (btn) btn.textContent = '更换照片';
      showToast('上传成功', 'success');
    }).catch(function() {
      input.value = '';
    }).finally(function() {
      if (btn) btn.disabled = false;
    });
  }

  function clearAttachments() {
    checkoutAttachments = [];
    el(config.attachmentsContainer).innerHTML = '';
    var btn = el(config.uploadBtn);
    if (btn) btn.textContent = '上传凭证';
  }

  // ---- Product Search ----
  function searchProducts(keyword) {
    var grid = el(config.productGrid);
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--gray-400);padding:40px;">搜索中...</div>';
    apiGet('/api/products?keyword=' + encodeURIComponent(keyword) + '&active=1').then(function(data) {
      var products = data.products || data || [];
      if (!products.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--gray-400);padding:40px;">没有找到商品</div>';
        return;
      }
      renderProducts(products);
    }).catch(function() {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--gray-400);padding:40px;">搜索失败</div>';
    });
  }

  function bindSearchEvents() {
    el(config.searchBtn).addEventListener('click', function() {
      var kw = el(config.searchInput).value.trim();
      if (!kw) { showToast('请输入搜索关键词', 'info'); return; }
      searchProducts(kw);
    });
    el(config.searchInput).addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var kw = this.value.trim();
        if (!kw) { showToast('请输入搜索关键词', 'info'); return; }
        searchProducts(kw);
      }
    });
  }

  function renderProducts(products) {
    var html = '';
    products.forEach(function(p) {
      var remarksHtml = '';
      var remarks = p.remarks || [];
      if (remarks.length) {
        remarksHtml = '<div class="prod-remarks">' + remarks.map(function(r) { return escapeHtml(r.key) + ':' + escapeHtml(r.value); }).join(' ') + '</div>';
      }
      html += '<div class="product-item" data-product=\'' + JSON.stringify({
        product_code: p.product_code,
        product_name: p.name,
        price: p.price,
        unit: p.unit || '',
        credential_required: !!p.credential_required,
        is_loose: !!p.is_loose
      }) + '\'>' +
        '<div class="prod-name">' + escapeHtml(p.name) + (p.is_loose ? ' <span class="badge badge-green" style="font-size:10px;padding:0 4px;">散装</span>' : '') + '</div>' +
        '<div class="prod-price">' + formatMoney(p.price) + '</div>' +
        '<div class="prod-stock">库存：' + (p.stock != null ? p.stock : '-') + '</div>' +
        remarksHtml +
        (p.credential_required ? '<span class="badge badge-red" style="margin-top:4px;display:inline-block">需凭证</span>' : '') +
      '</div>';
    });
    el(config.productGrid).innerHTML = html;
    var items = el(config.productGrid).querySelectorAll('.product-item');
    items.forEach(function(item) {
      item.addEventListener('click', function() {
        var prod = JSON.parse(this.getAttribute('data-product'));
        addToCart(prod.product_code, prod.product_name, Number(prod.price), prod.unit, !!prod.credential_required, !!prod.is_loose);
      });
    });
  }

  // ---- Cart Operations ----
  function addToCart(code, name, price, unit, credential_required, is_loose) {
    var isTemp = code.indexOf('TEMP_') === 0;
    if (isTemp) {
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].product_code === code) { cart[i].price = price; renderCart(); return; }
      }
      cart.push({
        product_code: code, product_name: name, quantity: 0, price: price,
        unit: unit || '', line_type: 'sale',
        is_temporary: true,
        credential_required: !!credential_required,
        is_loose: false
      });
      renderCart();
      return;
    }
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].product_code === code && cart[i].line_type === 'sale') { existing = cart[i]; break; }
    }
    if (existing) { existing.quantity += 1; }
    else {
      cart.push({
        product_code: code, product_name: name, quantity: 1, price: price,
        unit: unit || '', line_type: 'sale',
        is_temporary: false,
        credential_required: !!credential_required,
        is_loose: !!is_loose
      });
    }
    renderCart();
    // 检查当天过期批次
    apiGet('/api/products/' + code + '/has-expired-batch?today=1').then(function(res) {
      if (res && res.has_expired) {
        openModal(
          '<div class="modal-header">' +
            '<div class="modal-title">过期提示</div><button class="modal-close" onclick="closeModal()">&times;</button>' +
          '</div>' +
          '<div style="text-align:center;padding:20px 0;">' +
            '<p style="color:var(--red-500);font-size:16px;font-weight:600;margin-bottom:8px;">该商品有已过期批次</p>' +
            '<p style="color:var(--gray-500);">系统将自动报损，请知晓</p>' +
          '</div>' +
          '<div class="modal-footer"><button class="btn btn-primary" onclick="closeModal()">确定</button></div>'
        );
      }
    }).catch(function() {});
  }

  function removeFromCart(index) { cart.splice(index, 1); renderCart(); }

  function updateQty(index, qty) {
    if (cart[index] && cart[index].is_temporary) { renderCart(); return; }
    qty = parseFloat(qty);
    if (isNaN(qty) || qty <= 0) { renderCart(); return; }
    if (!cart[index].is_loose && qty !== Math.floor(qty)) {
      qty = Math.floor(qty);
    }
    cart[index].quantity = qty;
    renderCart();
  }

  function toggleGift(index) {
    cart[index].line_type = cart[index].line_type === 'gift' ? 'sale' : 'gift';
    renderCart();
  }

  function calcTotal() {
    var total = 0, count = 0;
    cart.forEach(function(item) {
      if (item.line_type === 'sale') {
        total += item.is_temporary ? item.price : item.price * item.quantity;
      }
      if (!item.is_temporary) {
        count += item.quantity;
      }
    });
    return { total: total, count: count };
  }

  function renderCart() {
    var body = el(config.cartBody);
    var totalEl = el(config.cartTotal);
    var btn = el(config.checkoutBtn);
    var unit = config.itemUnit || '件商品';
    if (!cart.length) {
      body.innerHTML = '<div class="cart-empty">购物车为空</div>';
      btn.disabled = true;
      totalEl.innerHTML = '总计：<span>0 ' + unit + '</span> ¥0.00';
      return;
    }
    var html = '';
    cart.forEach(function(item, i) {
      var lineTotal = item.is_temporary ? item.price : truncateMoney(item.price * item.quantity);
      var nameHtml = escapeHtml(item.is_temporary ? '临时商品' : item.product_name);
      if (item.line_type === 'gift') nameHtml += '<span class="gift-tag">赠品</span>';
      if (item.is_temporary) nameHtml += '<span class="temp-tag">临时</span>';
      if (item.credential_required) nameHtml += '<span class="badge badge-red" style="margin-left:4px;font-size:11px;padding:1px 6px">需凭证</span>';
      html += '<div class="cart-item">' +
        '<div class="cart-item-name">' + nameHtml + '</div>' +
        (item.is_temporary
          ? '<span class="cart-item-price">' + formatMoney(item.price) + '</span>'
          : '<div class="cart-item-price">' + formatMoney(item.price) + '</div>') +
        (item.is_temporary
          ? '<span class="cart-item-qty" style="display:inline-block;width:50px;text-align:center;">-</span>'
          : '<input type="number" class="cart-item-qty" value="' + item.quantity + '" min="0.01" step="' + (item.is_loose ? 'any' : '1') + '" data-idx="' + i + '">') +
        (item.is_temporary ? '' : '<span class="cart-item-unit">' + escapeHtml(item.unit || '') + '</span>') +
        '<div class="cart-item-price" style="min-width:60px;text-align:right;">' + formatMoney(lineTotal) + '</div>' +
        '<button class="btn btn-xs btn-outline" data-gift-idx="' + i + '">赠品</button>' +
        '<button class="cart-item-del" data-del-idx="' + i + '">&times;</button>' +
      '</div>';
    });
    body.innerHTML = html;

    body.querySelectorAll('.cart-item-qty').forEach(function(inp) {
      inp.addEventListener('change', function() { updateQty(parseInt(this.dataset.idx), this.value); });
    });
    body.querySelectorAll('[data-del-idx]').forEach(function(btn) {
      btn.addEventListener('click', function() { removeFromCart(parseInt(this.dataset.delIdx)); });
    });
    body.querySelectorAll('[data-gift-idx]').forEach(function(btn) {
      btn.addEventListener('click', function() { toggleGift(parseInt(this.dataset.giftIdx)); });
    });

    var t = calcTotal();
    btn.disabled = false;
    totalEl.innerHTML = '总计：<span>' + t.count + ' ' + unit + '</span> ' + formatMoney(t.total);
  }

  // ---- Checkout ----
  function bindCheckoutEvent() {
    el(config.checkoutBtn).addEventListener('click', doCheckout);
  }

  function doCheckout() {
    if (!cart.length) return;
    var needCredential = false;
    cart.forEach(function(item) { if (item.credential_required) needCredential = true; });
    if (needCredential && !checkoutAttachments.length) {
      showToast('订单包含凭证商品，请上传凭证', 'error');
      return;
    }
    var lines = cart.map(function(item) {
      return {
        product_code: item.product_code, product_name: item.product_name,
        quantity: item.quantity, price: item.price, unit: item.unit,
        line_type: item.line_type, is_temporary: item.is_temporary
      };
    });
    var btn = el(config.checkoutBtn);
    btn.disabled = true; btn.textContent = '结账中...';
    var body = { lines: lines };
    if (checkoutAttachments.length) body.attachments = checkoutAttachments.slice();
    apiPost('/api/checkout', body).then(function(result) {
      var msg = '<div class="modal-header">' +
        '<div class="modal-title">结账成功</div><button class="modal-close" onclick="closeModal()">&times;</button>' +
        '</div>' +
        '<div style="text-align:center;padding:20px 0;">' +
        '<p style="font-size:28px;font-weight:700;margin-bottom:8px;">' + formatMoney(result.total_amount) + '</p>' +
        '<p style="color:var(--gray-500);">订单号：' + escapeHtml(result.order_no) + '</p>' +
        '</div>' +
        '<div class="modal-footer"><button class="btn btn-primary" onclick="closeModal()">确定</button></div>';
      openModal(msg);
      cart = [];
      checkoutAttachments = [];
      el(config.attachmentsContainer).innerHTML = '';
      var upBtn = el(config.uploadBtn);
      if (upBtn) upBtn.textContent = '上传凭证';
      renderCart();
      btn.textContent = '结账';
      if (typeof config.onCheckoutSuccess === 'function') config.onCheckoutSuccess(result);
    }).catch(function() {
      btn.disabled = false; btn.textContent = '结账';
    });
  }

  // ---- Temporary Product ----
  function bindTempBtn() {
    el(config.tempBtn).addEventListener('click', function() {
      var html = '<div class="modal-header"><div class="modal-title">临时商品</div><button class="modal-close" onclick="closeModal()">&times;</button></div>' +
        '<div class="form-group"><label class="form-label">单价（元）</label><input type="number" class="form-input" id="tmp-price" placeholder="请输入单价" min="0" step="0.01"></div>' +
        '<div class="modal-footer"><button class="btn btn-outline" onclick="closeModal()">取消</button><button class="btn btn-primary" id="tmp-confirm">确定</button></div>';
      openModal(html);
      document.getElementById('tmp-confirm').addEventListener('click', function() {
        var price = truncateMoney(parseFloat(document.getElementById('tmp-price').value));
        if (isNaN(price) || price < 0) { showToast('请输入有效单价', 'info'); return; }
        addToCart('TEMP_' + Date.now(), 'TEMP_' + Date.now(), price, '', false, false);
        closeModal();
        showToast('临时商品已添加', 'success');
      });
    });
  }

  // ---- Public API ----
  return {
    init: init,
    handleUpload: handleUpload,
    clearAttachments: clearAttachments,
    addToCart: addToCart,
    searchProducts: searchProducts
  };
})();
