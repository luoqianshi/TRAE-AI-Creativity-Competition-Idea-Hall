// Aurora Demo - Interactive JavaScript
(function() {
  'use strict';

  // === Mirror Demo Data ===
  var mirrorData = {
    current: {
      avatar: '😊',
      label: '当前形象状态',
      progress: 25,
      metrics: [
        { icon: '⚖️', bg: 'rgba(139,92,246,0.1)', name: '体重', value: '68.5 kg', change: '--', cls: '' },
        { icon: '💪', bg: 'rgba(236,72,153,0.1)', name: '体脂率', value: '28.3%', change: '--', cls: '' },
        { icon: '🧘', bg: 'rgba(6,182,212,0.1)', name: '体态评分', value: '62 分', change: '--', cls: '' },
        { icon: '✨', bg: 'rgba(245,158,11,0.1)', name: '皮肤状态', value: '71 分', change: '--', cls: '' },
        { icon: '👗', bg: 'rgba(34,197,94,0.1)', name: '风格匹配', value: '58 分', change: '--', cls: '' }
      ]
    },
    '30': {
      avatar: '🙂',
      label: '30 天后预测效果',
      progress: 45,
      metrics: [
        { icon: '⚖️', bg: 'rgba(139,92,246,0.1)', name: '体重', value: '65.2 kg', change: '↓ 3.3 kg', cls: 'positive' },
        { icon: '💪', bg: 'rgba(236,72,153,0.1)', name: '体脂率', value: '25.8%', change: '↓ 2.5%', cls: 'positive' },
        { icon: '🧘', bg: 'rgba(6,182,212,0.1)', name: '体态评分', value: '72 分', change: '↑ 10 分', cls: 'positive' },
        { icon: '✨', bg: 'rgba(245,158,11,0.1)', name: '皮肤状态', value: '78 分', change: '↑ 7 分', cls: 'positive' },
        { icon: '👗', bg: 'rgba(34,197,94,0.1)', name: '风格匹配', value: '68 分', change: '↑ 10 分', cls: 'positive' }
      ]
    },
    '90': {
      avatar: '😄',
      label: '90 天后预测效果',
      progress: 70,
      metrics: [
        { icon: '⚖️', bg: 'rgba(139,92,246,0.1)', name: '体重', value: '61.0 kg', change: '↓ 7.5 kg', cls: 'positive' },
        { icon: '💪', bg: 'rgba(236,72,153,0.1)', name: '体脂率', value: '22.1%', change: '↓ 6.2%', cls: 'positive' },
        { icon: '🧘', bg: 'rgba(6,182,212,0.1)', name: '体态评分', value: '83 分', change: '↑ 21 分', cls: 'positive' },
        { icon: '✨', bg: 'rgba(245,158,11,0.1)', name: '皮肤状态', value: '86 分', change: '↑ 15 分', cls: 'positive' },
        { icon: '👗', bg: 'rgba(34,197,94,0.1)', name: '风格匹配', value: '81 分', change: '↑ 23 分', cls: 'positive' }
      ]
    },
    '180': {
      avatar: '🤩',
      label: '180 天后预测效果',
      progress: 92,
      metrics: [
        { icon: '⚖️', bg: 'rgba(139,92,246,0.1)', name: '体重', value: '58.5 kg', change: '↓ 10.0 kg', cls: 'positive' },
        { icon: '💪', bg: 'rgba(236,72,153,0.1)', name: '体脂率', value: '19.5%', change: '↓ 8.8%', cls: 'positive' },
        { icon: '🧘', bg: 'rgba(6,182,212,0.1)', name: '体态评分', value: '91 分', change: '↑ 29 分', cls: 'positive' },
        { icon: '✨', bg: 'rgba(245,158,11,0.1)', name: '皮肤状态', value: '93 分', change: '↑ 22 分', cls: 'positive' },
        { icon: '👗', bg: 'rgba(34,197,94,0.1)', name: '风格匹配', value: '92 分', change: '↑ 34 分', cls: 'positive' }
      ]
    }
  };

  // === Render Mirror Metrics ===
  function renderMetrics(period) {
    var data = mirrorData[period];
    var avatarEl = document.getElementById('mirrorAvatar');
    var labelEl = document.getElementById('mirrorLabel');
    var fillEl = document.getElementById('progressFill');
    var textEl = document.getElementById('progressText');
    var metricsEl = document.getElementById('mirrorMetrics');

    // Update avatar with animation
    avatarEl.style.transform = 'scale(0.8)';
    avatarEl.style.opacity = '0.5';
    setTimeout(function() {
      avatarEl.textContent = data.avatar;
      avatarEl.style.transform = 'scale(1)';
      avatarEl.style.opacity = '1';
    }, 200);

    labelEl.textContent = data.label;
    fillEl.style.width = data.progress + '%';
    textEl.textContent = data.progress + '%';

    // Render metric cards
    var html = '';
    data.metrics.forEach(function(m) {
      html += '<div class="metric-card">' +
        '<div class="metric-icon" style="background:' + m.bg + '">' + m.icon + '</div>' +
        '<div class="metric-info">' +
          '<h5>' + m.name + '</h5>' +
          '<div class="value">' + m.value + '</div>' +
          (m.cls ? '<div class="change ' + m.cls + '">' + m.change + '</div>' : '') +
        '</div>' +
      '</div>';
    });
    metricsEl.innerHTML = html;
  }

  // === Mirror Tab Switching ===
  var tabs = document.querySelectorAll('.mirror-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      renderMetrics(tab.getAttribute('data-period'));
    });
  });

  // Initial render
  renderMetrics('current');

  // === Navbar Scroll Effect ===
  var navbar = document.getElementById('navbar');
  var lastScroll = 0;
  window.addEventListener('scroll', function() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  });

  // === Scroll Fade-Up Animation ===
  var fadeEls = document.querySelectorAll('.fade-up');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(function(el) {
    observer.observe(el);
  });

  // === Smooth scroll for anchor links ===
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // === Avatar transition style ===
  var avatarEl = document.getElementById('mirrorAvatar');
  if (avatarEl) {
    avatarEl.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  }

})();
