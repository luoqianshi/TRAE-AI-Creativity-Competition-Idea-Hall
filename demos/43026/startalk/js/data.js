// Global state
const AppData = {
  totalStars: 0,
  emotionLog: [],   // [{emoji, name, timestamp}]
  chatHistory: [],  // for chat tab
  sessionCount: 0,

  addStar(n, originEl) {
    this.totalStars += n;
    this.save();
    updateStarDisplay();
    if (originEl) spawnStarPop(originEl, n);
  },

  logEmotion(emoji, name) {
    this.emotionLog.push({ emoji, name, ts: Date.now() });
    this.save();
  },

  save() {
    try {
      localStorage.setItem('startalk_stars', this.totalStars);
      localStorage.setItem('startalk_emotions', JSON.stringify(this.emotionLog.slice(-200)));
      localStorage.setItem('startalk_sessions', this.sessionCount);
    } catch(e) {}
  },

  load() {
    try {
      this.totalStars = parseInt(localStorage.getItem('startalk_stars') || '0');
      this.emotionLog = JSON.parse(localStorage.getItem('startalk_emotions') || '[]');
      this.sessionCount = parseInt(localStorage.getItem('startalk_sessions') || '0');
    } catch(e) {}
  }
};

function updateStarDisplay() {
  document.getElementById('total-stars').textContent = AppData.totalStars;
  if (typeof updateWallDisplay === 'function') updateWallDisplay();
}

function spawnStarPop(el, n) {
  const rect = el ? el.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2 };
  for (let i = 0; i < Math.min(n, 5); i++) {
    const pop = document.createElement('div');
    pop.className = 'star-pop';
    pop.textContent = '⭐';
    pop.style.left = (rect.left + Math.random() * rect.width) + 'px';
    pop.style.top = (rect.top + rect.height / 2) + 'px';
    pop.style.animationDelay = (i * 0.1) + 's';
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1400);
  }
}
