/**
 * 智页AI - Background Service Worker
 * 管理上下文菜单、跨标签通信、sidePanel
 */

chrome.runtime.onInstalled.addListener(() => {
  // 创建右键菜单
  chrome.contextMenus.create({
    id: 'zhiye-ask-selection',
    title: '💬 智页AI：提问选中内容',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'zhiye-explain-selection',
    title: '📖 智页AI：解释选中内容',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'zhiye-summarize-page',
    title: '📝 智页AI：总结页面',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'zhiye-open-sidebar',
    title: '🔍 打开智页AI侧边栏',
    contexts: ['page']
  });

  // 初始化默认配置
  chrome.storage.local.get('zhiye_ai_config', (data) => {
    if (!data.zhiye_ai_config) {
      chrome.storage.local.set({
        zhiye_ai_config: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          apiKey: '',
          baseUrl: '',
          temperature: 0.3,
          maxTokens: 4096
        }
      });
    }
  });
});

// 右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  switch (info.menuItemId) {
    case 'zhiye-ask-selection':
      chrome.tabs.sendMessage(tab.id, {
        action: 'askQuestion',
        question: info.selectionText
      });
      break;
    case 'zhiye-explain-selection':
      chrome.tabs.sendMessage(tab.id, {
        action: 'askQuestion',
        question: `请解释以下内容：\n\n${info.selectionText}`
      });
      break;
    case 'zhiye-summarize-page':
      chrome.tabs.sendMessage(tab.id, {
        action: 'askQuestion',
        question: '请总结当前页面的核心内容'
      });
      break;
    case 'zhiye-open-sidebar':
      chrome.tabs.sendMessage(tab.id, { action: 'openSidebar' });
      break;
  }
});

// 扩展图标点击
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch {
    // fallback: 发送消息给content script
    chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
  }
});

// 消息转发
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openOptions') {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'getActiveTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageInfo' }, (resp) => {
          sendResponse(resp || { success: false, error: '内容脚本未就绪' });
        });
      } else {
        sendResponse({ success: false, error: '无活动标签页' });
      }
    });
    return true;
  }

  if (request.action === 'sendToActiveTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, request.payload, sendResponse);
      } else {
        sendResponse({ success: false });
      }
    });
    return true;
  }

  return true;
});

// SidePanel配置
chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: true }).catch(() => {});

console.log('[智页AI] Background Service Worker 已启动');