/**
 * 在呀 ZÀIYA 官网交互脚本
 * 功能：Tab 切换、滚动动画、平滑滚动、Lucide 图标初始化
 */

document.addEventListener('DOMContentLoaded', function() {
  // 初始化 Lucide 图标
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Tab 切换功能
  initTabs();

  // 滚动显示动画
  initScrollReveal();

  // 平滑滚动到锚点
  initSmoothScroll();
});

/**
 * Tab 切换
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');

      // 移除所有 active 状态
      tabButtons.forEach(function(b) {
        b.classList.remove('active');
      });
      tabContents.forEach(function(c) {
        c.classList.remove('active');
        c.classList.add('hidden');
      });

      // 激活当前 tab
      this.classList.add('active');
      const targetContent = document.getElementById(tabId);
      if (targetContent) {
        targetContent.classList.remove('hidden');
        targetContent.classList.add('active');
      }
    });
  });
}

/**
 * 滚动显示动画（IntersectionObserver）
 */
function initScrollReveal() {
  // 检查是否支持 IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    // 不支持时直接显示所有元素
    document.querySelectorAll('.card').forEach(function(el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // 观察所有卡片
  document.querySelectorAll('.card').forEach(function(el) {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

/**
 * 平滑滚动到锚点
 */
function initSmoothScroll() {
  // 为滚动指示器添加点击事件
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', function() {
      const problemSection = document.getElementById('problem');
      if (problemSection) {
        problemSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
    scrollIndicator.style.cursor = 'pointer';
  }
}
