// Stars Wall Tab
const milestones = [
  { icon:'🎨', name:'专属头像解锁', desc:'累计 10 颗星星', target:10, id:'m10' },
  { icon:'📖', name:'AI 绘本故事', desc:'累计 25 颗星星', target:25, id:'m25' },
  { icon:'🎮', name:'游戏高手称号', desc:'累计 50 颗星星', target:50, id:'m50' },
  { icon:'🌈', name:'彩虹守护者', desc:'累计 80 颗星星', target:80, id:'m80' },
  { icon:'🏅', name:'成长勋章', desc:'累计 100 颗星星', target:100, id:'m100' }
];

function renderWallTab() {
  document.getElementById('tab-wall').innerHTML = `
    <h2 class="section-title">我的星星墙 ⭐</h2>
    <p class="section-sub">每次训练都会获得星星，加油！</p>
    <div class="stars-hero">
      <div class="stars-emoji-row" id="wall-star-row">⭐</div>
      <div class="stars-count" id="wall-count">0</div>
      <div class="stars-unit">颗成长星星</div>
      <div class="progress-wrap">
        <div class="progress-fill" id="wall-progress" style="width:0%"></div>
      </div>
      <div class="next-milestone" id="wall-next-label">距离下一里程碑还需 10 颗</div>
    </div>
    <div class="milestones-list">
      ${milestones.map(m => `
        <div class="milestone-row">
          <span class="milestone-icon">${m.icon}</span>
          <div class="milestone-info">
            <div class="milestone-name">${m.name}</div>
            <div class="milestone-req">${m.desc}</div>
          </div>
          <span class="badge badge-todo" id="badge-${m.id}">未解锁</span>
        </div>
      `).join('')}
    </div>
  `;
  updateWallDisplay();
}

function updateWallDisplay() {
  const n = AppData.totalStars;
  const wallCount = document.getElementById('wall-count');
  const wallRow = document.getElementById('wall-star-row');
  const wallProg = document.getElementById('wall-progress');
  const wallNext = document.getElementById('wall-next-label');
  if (!wallCount) return;

  wallCount.textContent = n;
  wallRow.textContent = '⭐'.repeat(Math.min(n, 15)) + (n > 15 ? ` +${n-15}` : '');

  const nextTarget = milestones.find(m => m.target > n)?.target || milestones[milestones.length-1].target;
  const prevTarget = milestones.filter(m => m.target <= n).pop()?.target || 0;
  const pct = Math.min(((n - prevTarget) / (nextTarget - prevTarget)) * 100, 100);
  wallProg.style.width = pct + '%';

  const diff = nextTarget - n;
  wallNext.textContent = diff > 0 ? `距离下一里程碑还需 ${diff} 颗` : '🎉 所有里程碑已达成！';

  milestones.forEach(m => {
    const badge = document.getElementById('badge-' + m.id);
    if (!badge) return;
    if (n >= m.target) {
      badge.className = 'badge badge-done';
      badge.textContent = '✅ 已解锁';
    } else {
      badge.className = 'badge badge-todo';
      badge.textContent = '未解锁';
    }
  });
}
