// Chat Tab — full AI conversation with Xingbao
const chatMessages = [];

function renderChatTab() {
  document.getElementById('tab-chat').innerHTML = `
    <h2 class="section-title">和星宝聊天 💬</h2>
    <p class="section-sub">星宝会认真听你说的每一句话</p>
    <div class="chat-window" id="chat-window">
      <div class="bubble-row">
        <div class="bubble-avatar">🌟</div>
        <div class="bubble bot">你好呀！我是星宝 🌟<br>今天有什么想和我说的吗？</div>
      </div>
    </div>
    <div class="chat-input-row">
      <textarea class="chat-textarea" id="chat-input-main" placeholder="说说你的想法…" rows="1"
        onkeydown="chatSend(event)"></textarea>
      <button class="send-btn" onclick="chatSendMsg()">➤</button>
    </div>
  `;
}

function appendBubble(role, text) {
  const win = document.getElementById('chat-window');
  const row = document.createElement('div');
  row.className = 'bubble-row' + (role === 'user' ? ' user' : '');

  if (role === 'assistant') {
    row.innerHTML = `<div class="bubble-avatar">🌟</div><div class="bubble bot">${text.replace(/\n/g,'<br>')}</div>`;
  } else {
    row.innerHTML = `<div class="bubble user">${text.replace(/\n/g,'<br>')}</div>`;
  }
  win.appendChild(row);
  win.scrollTop = win.scrollHeight;
  return row;
}

function appendTyping() {
  const win = document.getElementById('chat-window');
  const row = document.createElement('div');
  row.className = 'bubble-row';
  row.id = 'typing-row';
  row.innerHTML = `<div class="bubble-avatar">🌟</div>
    <div class="bubble bot"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  win.appendChild(row);
  win.scrollTop = win.scrollHeight;
}

async function chatSendMsg() {
  const input = document.getElementById('chat-input-main');
  const val = input.value.trim();
  if (!val) return;
  input.value = '';

  appendBubble('user', val);
  chatMessages.push({ role: 'user', content: val });
  AppData.addStar(1);

  appendTyping();

  try {
    const reply = await callClaude(
      chatMessages.slice(-10),
      XINGBAO_SYSTEM
    );
    document.getElementById('typing-row')?.remove();
    appendBubble('assistant', reply);
    chatMessages.push({ role: 'assistant', content: reply });
  } catch(e) {
    document.getElementById('typing-row')?.remove();
    appendBubble('assistant', '星宝刚才没有听清楚，能再说一次吗？ ❤️');
  }
}

function chatSend(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); chatSendMsg(); }
}
