// Game Tab — Emotion Recognition
const gameQuestions = [
  { emoji:'😊', correct:0, options:['开心','生气','害怕','难过'] },
  { emoji:'😭', correct:1, options:['高兴','难过','生气','害怕'] },
  { emoji:'😡', correct:2, options:['开心','害怕','生气','惊讶'] },
  { emoji:'😨', correct:0, options:['害怕','开心','难过','累了'] },
  { emoji:'😴', correct:3, options:['开心','生气','害怕','累了'] },
  { emoji:'😲', correct:1, options:['开心','惊讶','难过','生气'] },
  { emoji:'🥰', correct:0, options:['幸福','难过','害怕','生气'] },
  { emoji:'😔', correct:2, options:['开心','害怕','难过','惊讶'] },
  { emoji:'😄', correct:3, options:['难过','害怕','生气','非常开心'] },
  { emoji:'🤗', correct:0, options:['热情友好','害怕','难过','生气'] }
];

let gameState = { q: 0, score: 0, answered: false };

function renderGameTab() {
  document.getElementById('tab-game').innerHTML = `
    <h2 class="section-title">表情认知游戏 🎮</h2>
    <p class="section-sub">认识各种表情，获得成长星星！</p>
    <div class="game-header">
      <div class="game-score-badge">⭐ <span id="game-score">0</span> 分</div>
      <div class="game-progress" id="game-progress">第 1 题 / 共 ${gameQuestions.length} 题</div>
    </div>
    <div id="game-content"></div>
  `;
  gameState = { q: 0, score: 0, answered: false };
  renderQuestion();
}

function renderQuestion() {
  if (gameState.q >= gameQuestions.length) {
    showGameResult();
    return;
  }

  gameState.answered = false;
  const q = gameQuestions[gameState.q];
  const letters = ['A','B','C','D'];
  document.getElementById('game-progress').textContent = `第 ${gameState.q+1} 题 / 共 ${gameQuestions.length} 题`;

  document.getElementById('game-content').innerHTML = `
    <div class="card" style="text-align:center;padding:24px">
      <span class="game-emoji-big">${q.emoji}</span>
      <p style="font-size:15px;font-weight:600;color:#1a1a2e;margin-bottom:20px">这个表情代表什么心情？</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${q.options.map((opt,i) => `
          <button class="option-btn" id="gopt-${i}" onclick="checkGame(${i})">
            <span class="option-letter">${letters[i]}</span>${opt}
          </button>
        `).join('')}
      </div>
      <div id="game-feedback" style="margin-top:14px;font-size:14px;font-weight:600;min-height:24px"></div>
    </div>
    <button class="btn-next" id="game-next" style="display:none" onclick="nextGameQ()">
      ${gameState.q + 1 < gameQuestions.length ? '下一题 →' : '查看结果 🎉'}
    </button>
  `;
}

function checkGame(idx) {
  if (gameState.answered) return;
  gameState.answered = true;
  const q = gameQuestions[gameState.q];

  q.options.forEach((_, i) => {
    const btn = document.getElementById('gopt-' + i);
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === idx) btn.classList.add('wrong');
  });

  const correct = idx === q.correct;
  const fb = document.getElementById('game-feedback');
  if (correct) {
    gameState.score++;
    fb.textContent = '✅ 答对了！真棒！';
    fb.style.color = '#3B6D11';
    AppData.addStar(1, document.getElementById('gopt-' + idx));
    document.getElementById('game-score').textContent = gameState.score;
  } else {
    fb.textContent = '❌ 再想想，正确答案已高亮';
    fb.style.color = '#D85A30';
  }

  document.getElementById('game-next').style.display = 'block';
}

function nextGameQ() {
  gameState.q++;
  renderQuestion();
}

function showGameResult() {
  const total = gameQuestions.length;
  const pct = Math.round((gameState.score / total) * 100);
  const medal = pct >= 90 ? '🥇' : pct >= 70 ? '🥈' : pct >= 50 ? '🥉' : '💪';

  document.getElementById('game-content').innerHTML = `
    <div class="card" style="text-align:center;padding:40px 24px">
      <div style="font-size:56px;margin-bottom:12px">${medal}</div>
      <div style="font-size:20px;font-weight:700;margin-bottom:6px">游戏结束！</div>
      <div style="font-size:16px;color:#378ADD;font-weight:600;margin-bottom:6px">${gameState.score} / ${total} 题答对</div>
      <div style="font-size:14px;color:#888;margin-bottom:24px">${pct >= 80 ? '你太棒了，星宝为你骄傲！🌟' : '继续练习，你会越来越好的！❤️'}</div>
      <button class="btn-primary" onclick="restartGame()">再玩一次</button>
    </div>
  `;
}

function restartGame() {
  gameState = { q: 0, score: 0, answered: false };
  document.getElementById('game-score').textContent = '0';
  renderQuestion();
}
