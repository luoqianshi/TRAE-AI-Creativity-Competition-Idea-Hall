// App Controller
const tabRenderers = {
  mood: renderMoodTab,
  chat: renderChatTab,
  social: renderSocialTab,
  game: renderGameTab,
  story: renderStoryTab,
  wall: renderWallTab
};

const renderedTabs = new Set();

function startApp() {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key || !key.startsWith('sk-')) {
    alert('请输入有效的 Anthropic API Key（以 sk- 开头）');
    return;
  }
  setApiKey(key);
  initMain();
}

function initMain() {
  AppData.load();
  document.getElementById('setup-screen').classList.remove('active');
  document.getElementById('main-screen').classList.add('active');
  AppData.sessionCount++;
  AppData.save();

  updateStarDisplay();
  switchTab('mood', document.querySelector('.nav-item'));
}

function switchTab(name, btn) {
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

  document.getElementById('tab-' + name).classList.add('active');
  if (btn) btn.classList.add('active');

  if (!renderedTabs.has(name)) {
    tabRenderers[name]();
    renderedTabs.add(name);
  }

  if (name === 'wall') updateWallDisplay();
}

// Init on load
window.addEventListener('DOMContentLoaded', () => {
  const savedKey = loadApiKey();
  if (savedKey) {
    document.getElementById('api-key-input').value = savedKey;
    initMain();
  }
});
