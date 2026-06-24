// Social Training Tab
const scenarios = [
  {
    scene: '🧸',
    text: '小朋友抢走了你最喜欢的玩具，你会怎么办？',
    options: ['直接打他', '哭着跑走', '礼貌地说"请还给我"', '告诉老师或爸爸妈妈'],
    correct: [2, 3],
    feedback: '太棒了！用语言表达是最好的办法 🌟\n遇到问题，我们可以先说出自己的感受，也可以请大人帮忙。这样大家都会更开心！'
  },
  {
    scene: '🏫',
    text: '你想和同学一起玩游戏，但不知道怎么加入他们，你会怎么做？',
    options: ['站在旁边一直看', '直接推开别人加进去', '走过去说"我可以一起玩吗？"', '回家自己玩'],
    correct: [2],
    feedback: '非常好！主动问一句"我可以一起玩吗？"很勇敢！💪\n大多数小朋友都很愿意多一个伙伴，试试看吧！'
  },
  {
    scene: '😔',
    text: '你的好朋友今天看起来很难过，你想帮助他，怎么做？',
    options: ['假装没看见', '问他"你还好吗？"', '把好吃的分给他', '告诉他"我在这里陪你"'],
    correct: [1, 2, 3],
    feedback: '你真的很有爱心 ❤️\n问候朋友、分享好东西、陪伴他，这些都是很温暖的行为！你是个好朋友！'
  },
  {
    scene: '🎂',
    text: '同学过生日带来了蛋糕，你不太喜欢吃蛋糕，他问你"好不好吃？"',
    options: ['直接说"难吃"', '礼貌地说"谢谢你，你的生日快乐！"', '假装没听见', '说"还可以"然后微笑'],
    correct: [1, 3],
    feedback: '说得对！❤️\n即使不太喜欢，也可以礼貌地感谢朋友的分享。关注对方的心情，是很贴心的表现！'
  },
  {
    scene: '🚌',
    text: '在公交车上，你看到一位老奶奶站着，没有座位，你应该？',
    options: ['继续玩自己的', '让座给老奶奶', '假装睡着', '帮老奶奶拿东西'],
    correct: [1, 3],
    feedback: '你做到了！这就是关爱他人 🌟\n帮助有需要的人，会让我们感到快乐，也会让他们感到温暖。你是个有爱心的孩子！'
  }
];

let currentScenario = 0;
let scenarioAnswered = false;

function renderSocialTab() {
  document.getElementById('tab-social').innerHTML = `
    <h2 class="section-title">社交情景训练 🎭</h2>
    <p class="section-sub">一起来学习如何和大家相处吧！</p>
    <div id="social-content"></div>
  `;
  renderScenario();
}

function renderScenario() {
  if (currentScenario >= scenarios.length) {
    document.getElementById('social-content').innerHTML = `
      <div class="card" style="text-align:center;padding:40px 24px">
        <div style="font-size:56px;margin-bottom:16px">🎉</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:8px">所有情景完成啦！</div>
        <div style="font-size:14px;color:#888;margin-bottom:20px">你表现得非常棒，是个很有爱心的孩子！</div>
        <button class="btn-primary" onclick="restartSocial()">再练习一次</button>
      </div>
    `;
    return;
  }

  scenarioAnswered = false;
  const s = scenarios[currentScenario];
  const letters = ['A','B','C','D'];

  document.getElementById('social-content').innerHTML = `
    <div style="font-size:12px;color:#888;margin-bottom:12px">情景 ${currentScenario+1} / ${scenarios.length}</div>
    <div class="scenario-card">
      <div class="scenario-scene">${s.scene}</div>
      <div class="scenario-text">${s.text}</div>
      <div class="scenario-options">
        ${s.options.map((opt, i) => `
          <button class="option-btn" id="sopt-${i}" onclick="checkSocial(${i})" ${scenarioAnswered?'disabled':''}>
            <span class="option-letter">${letters[i]}</span>${opt}
          </button>
        `).join('')}
      </div>
      <div class="feedback-box" id="social-feedback"></div>
    </div>
    <button class="btn-next" id="social-next" style="display:none" onclick="nextScenario()">下一个情景 →</button>
  `;
}

function checkSocial(idx) {
  if (scenarioAnswered) return;
  scenarioAnswered = true;
  const s = scenarios[currentScenario];
  const letters = ['A','B','C','D'];

  s.options.forEach((_, i) => {
    const btn = document.getElementById('sopt-' + i);
    btn.disabled = true;
    if (s.correct.includes(i)) btn.classList.add('correct');
    else if (i === idx) btn.classList.add('wrong');
  });

  const isCorrect = s.correct.includes(idx);
  if (isCorrect) AppData.addStar(2, document.getElementById('sopt-' + idx));

  const feedback = document.getElementById('social-feedback');
  feedback.textContent = s.feedback;
  feedback.classList.add('visible');

  document.getElementById('social-next').style.display = 'block';
}

function nextScenario() {
  currentScenario++;
  renderScenario();
}

function restartSocial() {
  currentScenario = 0;
  renderScenario();
}
