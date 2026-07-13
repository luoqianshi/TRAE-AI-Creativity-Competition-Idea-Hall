// assets/charts.js — 交互逻辑 + ECharts 图表
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ===== Data =====
  var weekData = [
    { value: 520, name: '餐饮' },
    { value: 180, name: '交通' },
    { value: 340, name: '购物' },
    { value: 120, name: '娱乐' },
    { value: 80, name: '教育' },
    { value: 60, name: '其他' }
  ];

  var monthData = [
    { value: 1860, name: '餐饮' },
    { value: 480, name: '交通' },
    { value: 920, name: '购物' },
    { value: 380, name: '娱乐' },
    { value: 260, name: '教育' },
    { value: 220, name: '居住' },
    { value: 140, name: '医疗' },
    { value: 160, name: '其他' }
  ];

  var categoryIcons = {
    '餐饮': { emoji: '🍽️', bg: '#FEE2E2' },
    '交通': { emoji: '🚗', bg: '#DBEAFE' },
    '购物': { emoji: '🛍️', bg: '#FEE2E2' },
    '娱乐': { emoji: '🎮', bg: '#E0E7FF' },
    '教育': { emoji: '📚', bg: '#D4F0E3' },
    '医疗': { emoji: '🏥', bg: '#FEF3C7' },
    '居住': { emoji: '🏠', bg: '#DBEAFE' },
    '其他': { emoji: '📦', bg: '#F3F4F6' }
  };

  var sampleOCRResults = [
    { name: '咖啡 · 瑞幸', amount: 19.90, category: '餐饮', time: '15:42' },
    { name: '超市 · 盒马', amount: 67.30, category: '购物', time: '16:10' },
    { name: '打车 · 滴滴', amount: 23.50, category: '交通', time: '17:35' },
    { name: '电影票 · 万达', amount: 45.00, category: '娱乐', time: '19:00' }
  ];

  var sampleVoiceResults = [
    { name: '午餐 · 黄焖鸡', amount: 22.00, category: '餐饮', time: '12:30' },
    { name: '地铁 · 刷码', amount: 4.00, category: '交通', time: '13:05' },
    { name: '文具 · 得力', amount: 15.80, category: '教育', time: '14:20' }
  ];

  // ===== Current state =====
  var currentExpense = 2119.50;
  var currentBalance = 2380.50;
  var currentIncome = 4500.00;
  var ocrIndex = 0;
  var voiceIndex = 0;

  // ===== Pie Chart =====
  var pieChart = echarts.init(document.getElementById('mini-pie'), null, { renderer: 'svg' });

  function renderPie(data) {
    pieChart.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        formatter: '{b}: ¥{c} ({d}%)',
        backgroundColor: '#fff',
        borderColor: rule,
        borderWidth: 1,
        textStyle: { color: ink, fontSize: 12 }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          fontSize: 10,
          color: muted,
          formatter: '{b}\n{d}%'
        },
        labelLine: {
          length: 8,
          length2: 12,
          lineStyle: { color: rule }
        },
        emphasis: {
          label: { show: true, fontWeight: 'bold', fontSize: 11 }
        },
        color: [accent, accent2, '#60A5FA', '#F472B6', '#FBBF24', '#A78BFA', '#34D399', '#94A3B8'],
        data: data
      }]
    });
  }

  renderPie(weekData);

  window.addEventListener('resize', function() { pieChart.resize(); });

  // ===== Toggle Chart =====
  window.toggleChart = function(type) {
    if (type === 'week') {
      renderPie(weekData);
      showToast('📊 已切换为本周数据');
    } else {
      renderPie(monthData);
      showToast('📊 已切换为本月数据');
    }
  };

  // ===== Toast =====
  window.showToast = function(msg, isOrange) {
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast' + (isOrange ? ' orange' : '');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(function() {
      toast.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(function() { toast.remove(); }, 300);
    }, 2500);
  };

  // ===== Update balance display =====
  function updateBalance(amount) {
    currentExpense += amount;
    currentBalance -= amount;
    document.getElementById('balanceAmount').textContent = '¥' + currentBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    document.getElementById('expenseAmount').textContent = '¥' + currentExpense.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ===== Add transaction to list =====
  function addTransaction(record) {
    var txList = document.getElementById('txList');
    var icon = categoryIcons[record.category] || categoryIcons['其他'];
    var div = document.createElement('div');
    div.className = 'tx-item';
    div.style.animation = 'slideIn 0.4s ease-out';
    div.innerHTML =
      '<div class="tx-icon" style="background:' + icon.bg + ';">' + icon.emoji + '</div>' +
      '<div class="tx-info">' +
        '<div class="name">' + record.name + '</div>' +
        '<div class="time">' + record.time + ' · ' + (record.source || '手动录入') + '</div>' +
      '</div>' +
      '<div class="tx-amount expense">-¥' + record.amount.toFixed(2) + '</div>';
    txList.insertBefore(div, txList.firstChild);
  }

  // ===== Simulate OCR =====
  window.simulateOCR = function() {
    var banner = document.getElementById('autoBanner');
    var text = document.getElementById('autoText');

    text.textContent = '📸 正在拍摄小票...';
    banner.style.borderColor = accent2;

    setTimeout(function() {
      text.textContent = '🔍 OCR识别中...';
    }, 600);

    setTimeout(function() {
      text.textContent = '✅ 识别完成！';
      banner.style.borderColor = accent;

      var record = sampleOCRResults[ocrIndex % sampleOCRResults.length];
      record.source = 'AI识别';
      addTransaction(record);
      updateBalance(record.amount);
      showToast('✅ 已识别：' + record.name + ' ¥' + record.amount.toFixed(2));
      ocrIndex++;

      setTimeout(function() {
        text.textContent = 'AI 正在识别消费记录...';
      }, 2000);
    }, 1500);
  };

  // ===== Simulate Voice =====
  window.simulateVoice = function() {
    var banner = document.getElementById('autoBanner');
    var text = document.getElementById('autoText');

    text.textContent = '🎙️ 正在录音...';
    banner.style.borderColor = accent2;

    setTimeout(function() {
      text.textContent = '🧠 AI语义理解中...';
    }, 800);

    setTimeout(function() {
      text.textContent = '✅ 语音记账成功！';
      banner.style.borderColor = accent;

      var record = sampleVoiceResults[voiceIndex % sampleVoiceResults.length];
      record.source = '语音输入';
      addTransaction(record);
      updateBalance(record.amount);
      showToast('🎙️ 已记录：' + record.name + ' ¥' + record.amount.toFixed(2), true);
      voiceIndex++;

      setTimeout(function() {
        text.textContent = 'AI 正在识别消费记录...';
      }, 2000);
    }, 1800);
  };

  // ===== Modal =====
  window.openModal = function() {
    document.getElementById('addModal').classList.add('active');
  };
  window.closeModal = function() {
    document.getElementById('addModal').classList.remove('active');
  };

  window.addManualRecord = function() {
    var amount = parseFloat(document.getElementById('inputAmount').value);
    var category = document.getElementById('inputCategory').value;
    var note = document.getElementById('inputNote').value;

    if (!amount || amount <= 0) {
      showToast('⚠️ 请输入有效的金额');
      return;
    }

    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    var record = {
      name: (note || category) + ' · 手动',
      amount: amount,
      category: category,
      time: timeStr,
      source: '手动录入'
    };

    addTransaction(record);
    updateBalance(amount);
    showToast('✅ 记账成功：' + record.name + ' ¥' + amount.toFixed(2));
    closeModal();

    document.getElementById('inputAmount').value = '';
    document.getElementById('inputNote').value = '';
  };

  // Close modal on overlay click
  document.getElementById('addModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  // ===== AI Analysis =====
  window.simulateAIAnalysis = function() {
    var banner = document.getElementById('autoBanner');
    var text = document.getElementById('autoText');

    text.textContent = '🤖 正在生成AI分析报告...';
    banner.style.borderColor = accent2;

    var steps = [
      '📊 分析消费趋势中...',
      '📈 计算预算使用率...',
      '🎯 生成个性化建议...'
    ];

    steps.forEach(function(step, i) {
      setTimeout(function() {
        text.textContent = step;
      }, 800 * (i + 1));
    });

    setTimeout(function() {
      text.textContent = '✅ AI分析完成！';
      banner.style.borderColor = accent;

      showToast('🤖 AI分析：本月餐饮占比35%，建议控制在30%以内');
      setTimeout(function() {
        showToast('💡 建议：每日预算 ¥70，本周可节省 ¥85');
      }, 800);
      setTimeout(function() {
        showToast('⚠️ 预警：娱乐类消费已超预算15%', true);
      }, 1600);

      setTimeout(function() {
        text.textContent = 'AI 正在识别消费记录...';
      }, 5000);
    }, 3200);
  };
})();
