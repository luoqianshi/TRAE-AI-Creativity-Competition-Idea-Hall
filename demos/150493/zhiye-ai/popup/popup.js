/**
 * 智页AI - Popup脚本
 */

document.addEventListener('DOMContentLoaded', async () => {
  const pageInfoEl = document.getElementById('page-info');

  // 获取当前页面信息
  try {
    const resp = await chrome.runtime.sendMessage({ action: 'getActiveTabInfo' });
    if (resp?.success) {
      pageInfoEl.innerHTML = `
        <div class="info-item">
          <span class="info-label">页面:</span>
          <span class="info-value" title="${resp.title}">${resp.title || '未知页面'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">知识节点:</span>
          <span class="info-value">${resp.nodeCount || 0} 个</span>
          ${resp.isTechDoc ? '<span class="info-tag">技术文档</span>' : ''}
        </div>
      `;
    } else {
      pageInfoEl.innerHTML = `<div class="info-loading">${resp?.error || '页面尚未加载完成，请刷新后重试'}</div>`;
    }
  } catch (err) {
    pageInfoEl.innerHTML = `<div class="info-loading">请先在页面中加载智页AI</div>`;
  }

  // 打开侧边栏
  document.getElementById('btn-open-sidebar').addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'openSidebar' });
    }
    window.close();
  });

  // 总结页面
  document.getElementById('btn-summarize').addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'askQuestion',
        question: '请总结当前页面的核心内容'
      });
    }
    window.close();
  });

  // 快速提问
  document.getElementById('btn-quick-ask').addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'openSidebar' });
    }
    window.close();
  });

  // 快捷提问按钮
  document.querySelectorAll('.quick-ask-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const q = btn.dataset.q;
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'askQuestion',
          question: q
        });
      }
      window.close();
    });
  });

  // 设置链接
  document.getElementById('link-options').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
    window.close();
  });
});