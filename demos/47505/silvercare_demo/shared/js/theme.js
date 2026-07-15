function switchTheme(mode) {
  document.body.className = mode === 'standard' ? 'theme-standard' : 'theme-accessible';
  localStorage.setItem('theme_mode', mode);
  
  // 更新主题切换按钮状态
  document.querySelectorAll('.theme-btn').forEach(btn => {
    const btnMode = btn.getAttribute('data-theme');
    if (btnMode === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function getCurrentTheme() {
  return localStorage.getItem('theme_mode') || 'accessible';
}

function initTheme() {
  const savedTheme = getCurrentTheme();
  document.body.className = savedTheme === 'standard' ? 'theme-standard' : 'theme-accessible';
}

// 在页面加载时初始化主题
document.addEventListener('DOMContentLoaded', initTheme);