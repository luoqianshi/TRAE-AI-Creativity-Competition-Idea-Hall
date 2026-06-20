/* ============================================================
   oRABS 讲解网页 — 主交互脚本
   功能：
   1. 滚动监听 — 导航高亮 / 滚动进入视口动画
   2. 数字计数动画（关键数据卡）
   3. 返回顶部按钮
   4. 公式卡片键盘焦点高亮
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 工具 ---------- */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* 减少动效偏好 */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1) 滚动监听：导航高亮 + 滚动进入视口动画
     ============================================================ */
  const navLinks   = $$('.primary-nav a');
  const sections   = navLinks
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  const setActiveNav = () => {
    const scrollY = window.scrollY + 120; // 偏移量（顶部导航高 64px）
    let currentId = sections[0]?.id;
    for (const sec of sections) {
      if (sec.offsetTop <= scrollY) currentId = sec.id;
    }
    navLinks.forEach(a => {
      const href = a.getAttribute('href').slice(1);
      a.classList.toggle('is-active', href === currentId);
    });
  };

  /* 滚动进入视口动画（IntersectionObserver） */
  const setupReveal = () => {
    if (prefersReduced) {
      $$('.reveal').forEach(el => el.classList.add('is-in'));
      return;
    }
    // 为可动画元素添加 .reveal 类（避免硬编码大量初始状态）
    const targets = [
      '.section-header', '.basis-card', '.param-card', '.glossary-item',
      '.formula-card', '.decision-card', '.bn-card', '.cons-card',
      '.verify-list li', '.ref-card', '.curve-figure',
      '.param-strip', '.sub-h3', '.prose'
    ];
    const reveal = $$(targets.join(','));
    reveal.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver(entries => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    reveal.forEach(el => io.observe(el));
  };

  /* ============================================================
     2) 数字计数动画
     ============================================================ */
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  const animateCount = (el) => {
    const target  = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix   = el.dataset.suffix || '';
    const duration = prefersReduced ? 0 : 1500;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = target * eased;
      el.textContent = current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(tick);
  };

  const setupCounters = () => {
    const counters = $$('.bn-value[data-target]');
    if (counters.length === 0) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(c => io.observe(c));
  };

  /* ============================================================
     3) 返回顶部按钮
     ============================================================ */
  const setupBackToTop = () => {
    const btn = $('#backToTop');
    if (!btn) return;
    const onScroll = () => {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  };

  /* ============================================================
     4) 平滑锚点跳转（兼容老浏览器）
     ============================================================ */
  const setupSmoothAnchors = () => {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const offset = 70; // 顶部导航偏移
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
        // 更新 URL hash
        history.replaceState(null, '', '#' + id);
      });
    });
  };

  /* ============================================================
     5) 表格行交互：键盘焦点高亮
     ============================================================ */
  const setupTableA11y = () => {
    $$('.data-table tbody tr').forEach(tr => {
      tr.setAttribute('tabindex', '0');
      tr.addEventListener('focus', () => tr.classList.add('is-focused'));
      tr.addEventListener('blur',  () => tr.classList.remove('is-focused'));
    });
  };

  /* ============================================================
     启动
     ============================================================ */
  const init = () => {
    setupReveal();
    setupCounters();
    setupBackToTop();
    setupSmoothAnchors();
    setupTableA11y();

    let scrollScheduled = false;
    window.addEventListener('scroll', () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(() => {
        setActiveNav();
        scrollScheduled = false;
      });
    }, { passive: true });
    setActiveNav();

    // 打印后重置状态
    window.addEventListener('afterprint', () => {
      $$('.bn-value[data-target]').forEach(el => {
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const suffix = el.dataset.suffix || '';
        el.textContent = target.toFixed(decimals) + suffix;
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
