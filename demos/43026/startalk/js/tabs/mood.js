// Mood Tab
function renderMoodTab() {
  const emotions = [
    { emoji:'😊', name:'开心', color:'#EAF3DE', border:'#639922' },
    { emoji:'😭', name:'难过', color:'#E6F1FB', border:'#378ADD' },
    { emoji:'😡', name:'生气', color:'#FAECE7', border:'#D85A30' },
    { emoji:'😨', name:'害怕', color:'#FBEAF0', border:'#D4537E' },
    { emoji:'😴', name:'累了', color:'#FAEEDA', border:'#BA7517' },
    { emoji:'😕', name:'困惑', color:'#EEEDFE', border:'#7F77DD' }
  ];

  const html = `
    <h2 class="section-title">今天你感觉怎么样？</h2>
    <p class="section-sub">告诉星宝你的心情，它会一直陪着你 ❤️</p>
    <div class="emotion-grid" id="emotion-grid">
      ${emotions.map((e,i) => `
        <button class="emotion-btn" id="emobtn-${i}"
          onclick="selectEmotion(${i},'${e.emoji}','${e.name}','${e.color}','${e.border}')">
          <span class="emotion-emoji">${e.emoji}</span>
          <span class="emotion-name">${e.name}</span>
        </button>
      `).join('')}
    </div>
    <div id="mood-bubble" style="display:none">
      <div class="bubble-name" style="margin-left:0;margin-bottom:6px;font-size:12px;color:#888">🌟 星宝说：</div>
      <div class="card" style="background:#E6F1FB;border-color:#B5D4F4;padding:16px">
        <div id="mood-bubble-text" style="font-size:14px;line-height:1.8;color:#1a1a2e;white-space:pre-wrap"></div>
      </div>
    </div>
    <div id="mood-input-area" style="margin-top:12px;display:none">
      <div class="chat-input-row">
        <textarea class="chat-textarea" id="mood-input" placeholder="继续和星宝说说吧..." rows="1"
          onkeydown="moodSend(event)"></textarea>
        <button class="send-btn" onclick="moodSendMsg()">➤</button>
      </div>
    </div>
  `;
  document.getElementById('tab-mood').innerHTML = html;
}

async function selectEmotion(idx, emoji, name, color, border) {
  document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('emobtn-' + idx).classList.add('selected');

  AppData.logEmotion(emoji, name);
  AppData.addStar(1, document.getElementById('emobtn-' + idx));

  const bubble = document.getElementById('mood-bubble');
  const text = document.getElementById('mood-bubble-text');
  bubble.style.display = 'block';
  text.textContent = '星宝正在想…';
  document.getElementById('mood-input-area').style.display = 'block';

  try {
    const reply = await callClaude(
      [{ role: 'user', content: `我现在感觉${name} ${emoji}` }],
      XINGBAO_SYSTEM
    );
    text.textContent = reply;
  } catch(e) {
    text.textContent = `星宝知道了，你现在感到${name}。\n\n无论什么心情，星宝都会陪着你 ❤️`;
  }
}

async function moodSendMsg() {
  const input = document.getElementById('mood-input');
  const val = input.value.trim();
  if (!val) return;
  input.value = '';
  const text = document.getElementById('mood-bubble-text');
  text.textContent = '星宝正在想…';
  AppData.addStar(1);
  try {
    const reply = await callClaude(
      [{ role: 'user', content: val }],
      XINGBAO_SYSTEM
    );
    text.textContent = reply;
  } catch(e) {
    text.textContent = '谢谢你告诉星宝 ❤️\n星宝一直在这里陪着你。';
  }
}

function moodSend(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); moodSendMsg(); }
}
