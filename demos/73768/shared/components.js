/**
 * 公考 AI 学习助手 - 共享 JS 组件
 */

// ============================================
// 底部导航生成器
// ============================================
function renderBottomNav(activePage) {
  const navItems = [
    { page: 'index', label: '首页', icon: 'home', href: 'index.html' },
    { page: 'exam-papers', label: '真题集', icon: 'book-open', href: 'exam-papers.html' },
    { page: 'wrongbook', label: '错题本', icon: 'rotate-ccw', href: 'wrongbook.html' },
    { page: 'dashboard', label: '数据', icon: 'bar-chart-3', href: 'dashboard.html' },
    { page: 'countdown', label: '我的', icon: 'user', href: 'countdown.html' }
  ];

  const navHtml = navItems.map(item => `
    <a href="${item.href}" class="nav-item ${item.page === activePage ? 'active' : ''}">
      <i data-lucide="${item.icon}" style="width:22px;height:22px;"></i>
      <span>${item.label}</span>
    </a>
  `).join('');

  return `<nav class="bottom-nav">${navHtml}</nav>`;
}

// ============================================
// 骨架屏生成器
// ============================================
const Skeleton = {
  // 卡片骨架
  card(count = 1) {
    return Array.from({ length: count }, () => `
      <div class="card" style="padding:16px;">
        <div class="skeleton" style="width:60%;height:18px;margin-bottom:12px;"></div>
        <div class="skeleton" style="width:100%;height:14px;margin-bottom:8px;"></div>
        <div class="skeleton" style="width:80%;height:14px;"></div>
      </div>
    `).join('');
  },

  // 列表骨架
  list(count = 3) {
    return Array.from({ length: count }, () => `
      <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);">
        <div class="skeleton" style="width:48px;height:48px;border-radius:var(--radius-sm);flex-shrink:0;"></div>
        <div style="flex:1;">
          <div class="skeleton" style="width:70%;height:16px;margin-bottom:8px;"></div>
          <div class="skeleton" style="width:40%;height:12px;"></div>
        </div>
      </div>
    `).join('');
  },

  // 任务骨架
  tasks(count = 3) {
    return Array.from({ length: count }, () => `
      <div style="display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--border);">
        <div class="skeleton" style="width:20px;height:20px;border-radius:50%;"></div>
        <div style="flex:1;">
          <div class="skeleton" style="width:80%;height:14px;margin-bottom:6px;"></div>
          <div class="skeleton" style="width:40%;height:10px;"></div>
        </div>
      </div>
    `).join('');
  }
};

// ============================================
// Modal 对话框
// ============================================
function showModal(options) {
  const { title, content, confirmText = '确定', cancelText = '取消', onConfirm, onCancel, showCancel = true } = options;

  // 移除已存在的 modal
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 150;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  `;

  modal.innerHTML = `
    <div class="modal-content" style="
      background: white;
      border-radius: var(--radius-lg);
      padding: 24px;
      width: 100%;
      max-width: 320px;
      animation: scaleIn 0.2s ease;
    ">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;text-align:center;">${title}</h3>
      <div style="font-size:14px;color:var(--text-secondary);margin-bottom:20px;text-align:center;line-height:1.6;">${content}</div>
      <div style="display:flex;gap:10px;">
        ${showCancel ? `<button class="btn btn-outline" style="flex:1;" id="modal-cancel">${cancelText}</button>` : ''}
        <button class="btn btn-primary" style="flex:1;" id="modal-confirm">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 事件绑定
  const confirmBtn = modal.querySelector('#modal-confirm');
  const cancelBtn = modal.querySelector('#modal-cancel');

  confirmBtn.addEventListener('click', () => {
    modal.remove();
    if (onConfirm) onConfirm();
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      modal.remove();
      if (onCancel) onCancel();
    });
  }

  // 点击遮罩关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      if (onCancel) onCancel();
    }
  });
}

// ============================================
// 下拉刷新模拟
// ============================================
function initPullRefresh(container, onRefresh) {
  let startY = 0;
  let isPulling = false;

  container.addEventListener('touchstart', (e) => {
    if (container.scrollTop === 0) {
      startY = e.touches[0].clientY;
      isPulling = true;
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0 && diff < 100) {
      container.style.transform = `translateY(${diff * 0.5}px)`;
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    if (!isPulling) return;
    isPulling = false;
    container.style.transition = 'transform 0.3s ease';
    container.style.transform = 'translateY(0)';
    setTimeout(() => {
      container.style.transition = '';
      if (onRefresh) onRefresh();
    }, 300);
  });
}

// ============================================
// 标签页切换
// ============================================
function initTabs(containerSelector, onChange) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const tabs = container.querySelectorAll('[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // 更新标签状态
      tabs.forEach(t => {
        t.classList.remove('active');
        t.style.color = '';
        t.style.borderBottom = '';
      });
      tab.classList.add('active');
      tab.style.color = 'var(--primary)';
      tab.style.borderBottom = '2px solid var(--primary)';

      // 更新内容
      const contents = document.querySelectorAll('[data-tab-content]');
      contents.forEach(c => {
        if (c.dataset.tabContent === target) {
          c.classList.remove('hidden');
          c.style.animation = 'fadeIn 0.3s ease';
        } else {
          c.classList.add('hidden');
        }
      });

      if (onChange) onChange(target);
    });
  });

  // 初始化第一个标签
  if (tabs.length > 0) {
    tabs[0].click();
  }
}

// ============================================
// 步骤条
// ============================================
function renderSteps(steps, currentStep) {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;">
      ${steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return `
          <div style="display:flex;align-items:center;flex:${isLast ? '0 0 auto' : '1'};">
            <div style="
              width:28px;
              height:28px;
              border-radius:50%;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:12px;
              font-weight:600;
              flex-shrink:0;
              ${isCompleted ? 'background:var(--success);color:white;' : isCurrent ? 'background:var(--primary);color:white;' : 'background:var(--border);color:var(--text-tertiary);'}
            ">
              ${isCompleted ? '<i data-lucide="check" style="width:16px;height:16px;"></i>' : index + 1}
            </div>
            ${!isLast ? `<div style="flex:1;height:2px;margin:0 6px;background:${isCompleted ? 'var(--success)' : 'var(--border)'};"></div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);margin-top:-8px;">
      ${steps.map(step => `<span style="flex:1;text-align:center;">${step}</span>`).join('')}
    </div>
  `;
}

// ============================================
// 展开/折叠
// ============================================
function initCollapsible() {
  document.querySelectorAll('[data-collapse-trigger]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const target = document.querySelector(trigger.dataset.collapseTrigger);
      if (!target) return;

      const isExpanded = target.style.display !== 'none';
      if (isExpanded) {
        target.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(() => {
          target.style.display = 'none';
          target.style.animation = '';
        }, 200);
      } else {
        target.style.display = 'block';
        target.style.animation = 'fadeInUp 0.3s ease';
      }

      // 旋转箭头
      const arrow = trigger.querySelector('[data-collapse-arrow]');
      if (arrow) {
        arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        arrow.style.transition = 'transform 0.2s ease';
      }
    });
  });
}

// ============================================
// 初始化所有页面通用逻辑
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // 初始化 Lucide 图标
  if (window.lucide) {
    lucide.createIcons();
  }

  // 初始化折叠组件
  initCollapsible();
});
