/* ==========================================
   繁星之火 — 交互脚本
   知识地图节点 · 题目状态 · 进度条 · 复习提醒 · 导航
   ========================================== */

(function () {
  'use strict';

  // ===== 导航栏高亮 =====
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section[id]');

  function updateActiveNav() {
    let current = '';
    sections.forEach(function (sec) {
      const top = sec.getBoundingClientRect().top;
      if (top <= 120) current = sec.getAttribute('id');
    });
    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === '#' + current) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ===== 知识地图节点详情 =====
  var nodeDetails = [
    {
      title: '集合定义',
      status: '已通关',
      statusClass: 'passed',
      desc: '集合就是把一些确定的对象放到一起，形成一个整体。核心是"确定性"——一个对象要么属于集合，要么不属于。',
      next: '已通过。下一个节点：集合表示。'
    },
    {
      title: '集合表示',
      status: '已通关',
      statusClass: 'passed',
      desc: '集合有两种表示方法：列举法（把元素一一列出）和描述法（用条件描述元素特征）。同一集合可以用不同方式表示。',
      next: '已通过。下一个节点：集合本体。'
    },
    {
      title: '集合本体',
      status: '训练中',
      statusClass: 'training',
      desc: '集合的三个核心性质：确定性（元素归属明确）、互异性（元素不重复）、无序性（元素顺序无关）。这是理解所有集合运算的基础。',
      next: '当前正在训练中。建议完成 10 道训练题后进入下一节点。'
    },
    {
      title: '基本关系',
      status: '理解中',
      statusClass: 'understanding',
      desc: '集合之间的关系包括：子集（A的所有元素都在B中）、真子集（A是B的子集且A≠B）、相等（互相包含）、空集（任何集合的子集）。',
      next: '理解中。完成后可进入基本运算。'
    },
    {
      title: '基本运算',
      status: '未开始',
      statusClass: 'pending',
      desc: '集合的三种基本运算：交集（A∩B，同时属于A和B的元素）、并集（A∪B，属于A或B的元素）、补集（在全集U中不属于A的元素）。',
      next: '尚未开始。请先完成基本关系。'
    },
    {
      title: '运算法则',
      status: '未开始',
      statusClass: 'pending',
      desc: '集合运算满足交换律、结合律和分配律，与数的运算类似但需要注意德摩根律等特殊规则。',
      next: '尚未开始。请先完成基本运算。'
    },
    {
      title: '应用训练',
      status: '未开始',
      statusClass: 'pending',
      desc: '综合运用集合知识解决实际问题，包括分类问题、逻辑推理和数学证明。',
      next: '尚未开始。请先完成运算法则。'
    },
    {
      title: '复习留痕',
      status: '待复习',
      statusClass: 'review',
      desc: '定期回顾已学知识，将学习记录归档到知识地图中。当前复习周期：第2/3/5/7/14天及下月末。',
      next: '请按时间轴完成复习任务。'
    }
  ];

  var mapBranches = document.querySelectorAll('.map-branch');
  var mapDetail = document.getElementById('mapDetail');

  mapBranches.forEach(function (branch) {
    branch.addEventListener('click', function () {
      // 移除所有选中状态
      mapBranches.forEach(function (b) { b.classList.remove('selected'); });
      // 添加选中状态
      branch.classList.add('selected');

      var nodeIndex = parseInt(branch.getAttribute('data-node'), 10);
      var detail = nodeDetails[nodeIndex];
      if (detail) {
        mapDetail.innerHTML =
          '<div class="detail-content">' +
            '<h4>' + detail.title + '</h4>' +
            '<span class="detail-status ' + detail.statusClass + '">' + detail.status + '</span>' +
            '<p class="detail-desc">' + detail.desc + '</p>' +
            '<p class="detail-next">' + detail.next + '</p>' +
          '</div>';
      }
    });
  });

  // ===== 题目训练：标记掌握 =====
  var masteredCount = 0;
  var totalCards = 10;
  var progressFill = document.getElementById('progressFill');
  var progressPercent = document.getElementById('progressPercent');

  window.markMastered = function (btn) {
    var card = btn.closest('.train-card');
    if (card.classList.contains('mastered')) return;

    card.classList.add('mastered');
    btn.classList.add('mastered');
    btn.textContent = '已掌握';

    var statusEl = card.querySelector('.train-status');
    statusEl.textContent = '已掌握';
    statusEl.classList.remove('undone');
    statusEl.classList.add('mastered-tag');

    masteredCount++;
    updateProgress();
  };

  function updateProgress() {
    var pct = (masteredCount / totalCards) * 100;
    progressFill.style.width = pct + '%';
    progressPercent.textContent = masteredCount + ' / ' + totalCards;
  }

  // ===== 复习提醒弹窗 =====
  var remindModal = document.getElementById('remindModal');

  window.showReminder = function () {
    remindModal.classList.add('show');
  };

  window.closeReminder = function () {
    remindModal.classList.remove('show');
  };

  // 点击遮罩关闭
  remindModal.addEventListener('click', function (e) {
    if (e.target === remindModal) {
      remindModal.classList.remove('show');
    }
  });

  // ESC 关闭弹窗
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && remindModal.classList.contains('show')) {
      remindModal.classList.remove('show');
    }
  });

  // ===== 平滑滚动（兼容） =====
  // HTML 已设置 scroll-behavior: smooth，此处处理锚点偏移
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offset = 70; // 导航栏高度
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

})();