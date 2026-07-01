/**
 * Shared express form submission logic.
 * Used by: express.html (modal forms) and workbench.html (Tab3/Tab5 inline forms).
 * Eliminates ~120 lines of duplicate code between the two pages.
 */
var ExpressForms = (function() {
  var defaults = {
    deadlineDays: 10,
    receiveFee: 0,
    sendFee: 0
  };
  var loaded = false;
  var initQueue = [];

  function applyDefaults() {
    fillDeadline('in-deadline');
    fillReceiveFee('in-fee');
    fillSendFee('send-fee');
  }

  function fillDeadline(inputId) {
    var el = document.getElementById(inputId);
    if (!el) return;
    var d = new Date(Date.now() + defaults.deadlineDays * 86400000);
    el.value = toDatetimeLocalValue(d);
  }

  function fillReceiveFee(inputId) {
    var el = document.getElementById(inputId);
    if (el && defaults.receiveFee > 0) el.setAttribute('value', defaults.receiveFee);
    if (el && defaults.receiveFee > 0) el.value = defaults.receiveFee;
  }

  function fillSendFee(inputId) {
    var el = document.getElementById(inputId);
    if (el && defaults.sendFee > 0) el.setAttribute('value', defaults.sendFee);
    if (el && defaults.sendFee > 0) el.value = defaults.sendFee;
  }

  function init(onReady) {
    if (loaded) {
      if (onReady) onReady(defaults);
      return;
    }
    initQueue.push(onReady);
    if (initQueue.length > 1) return; // already fetching

    apiGet('/api/settings/deadline-default').then(function(data) {
      defaults.deadlineDays = data.default_deadline_days || 10;
      defaults.receiveFee = data.default_receive_fee || 0;
      defaults.sendFee = data.default_send_fee || 0;
      loaded = true;
      var q = initQueue.slice();
      initQueue = [];
      q.forEach(function(cb) { if (cb) cb(defaults); });
    }).catch(function(e) {
      console.error(e);
      loaded = true; // mark loaded even on error, use defaults
      var q = initQueue.slice();
      initQueue = [];
      q.forEach(function(cb) { if (cb) cb(defaults); });
    });
  }

  /**
   * Submit a receive-in form.
   * opts: { uploadedUrl, remarksContainerId, trackingInputId, feeInputId, deadlineInputId, onSuccess }
   */
  function submitReceive(opts) {
    if (!opts.uploadedUrl) { showToast('请先上传照片', 'error'); return; }
    var remarks = [];
    try {
      remarks = JSON.parse(document.getElementById(opts.remarksContainerId).getAttribute('data-remarks') || '[]');
    } catch(e) {}
    var data = {
      photo_url: opts.uploadedUrl,
      tracking_number: document.getElementById(opts.trackingInputId).value.trim() || undefined,
      remarks: remarks,
      display_fee: document.getElementById(opts.feeInputId).value ? truncateMoney(parseFloat(document.getElementById(opts.feeInputId).value)) : undefined,
      deadline_time: localToUtcIso(document.getElementById(opts.deadlineInputId).value) || undefined
    };
    apiPost('/api/express/in', data).then(function() {
      showToast('收件入库成功', 'success');
      if (opts.onSuccess) opts.onSuccess();
    }).catch(function(e) { showToast(e.message || '收件入库失败', 'error'); });
  }

  /**
   * Submit a send-out form.
   * opts: { uploadedUrl, remarksContainerId, trackingInputId, feeInputId, onSuccess }
   */
  function submitSend(opts) {
    if (!opts.uploadedUrl) { showToast('请先上传照片', 'error'); return; }
    var remarks = [];
    try {
      remarks = JSON.parse(document.getElementById(opts.remarksContainerId).getAttribute('data-remarks') || '[]');
    } catch(e) {}
    var data = {
      photo_url: opts.uploadedUrl,
      tracking_number: document.getElementById(opts.trackingInputId).value.trim() || undefined,
      remarks: remarks,
      display_fee: document.getElementById(opts.feeInputId).value ? truncateMoney(parseFloat(document.getElementById(opts.feeInputId).value)) : undefined
    };
    apiPost('/api/express/send', data).then(function() {
      showToast('发快递成功', 'success');
      if (opts.onSuccess) opts.onSuccess();
    }).catch(function(e) { showToast(e.message || '发快递失败', 'error'); });
  }

  return {
    init: init,
    fillDeadline: fillDeadline,
    fillReceiveFee: fillReceiveFee,
    fillSendFee: fillSendFee,
    applyDefaults: applyDefaults,
    submitReceive: submitReceive,
    submitSend: submitSend,
    get defaults() { return defaults; }
  };
})();
