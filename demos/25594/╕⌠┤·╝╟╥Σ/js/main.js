/* ================================================
   隔代记忆 — 家族传承平台 Demo JS
   ================================================ */

// ===== Toast Notification =====
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== Demo Tab Switching =====
const demoTabs = document.querySelectorAll('.demo-tab');
const demoPanels = document.querySelectorAll('.demo-panel');

demoTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    demoTabs.forEach(t => t.classList.remove('active'));
    demoPanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panelId = 'panel-' + tab.dataset.panel;
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
  });
});

// ===== Chat Demo =====
const chatData = {
  childhood: [
    { role: 'ai', text: '奶奶，您好！😊 今天我们来聊聊您小时候的事情，轻松愉快地聊聊就好。\n\n您最早的记忆是什么呢？比如说，小时候家里住在哪里？' },
    { role: 'user', text: '我小时候住在乡下，一个特别小的村子，全村就二十几户人家。' },
    { role: 'ai', text: '二十几户人家的小村子，听起来好温馨啊！🏡\n\n那种村子一定大家都认识吧？您还记得那时候村里有什么特别好玩的地方吗？比如一棵大树、一条小河，或者一个小卖部？' },
    { role: 'user', text: '有！村口有一棵特别大的槐树，夏天大家都在树下乘凉、聊天、孩子们围着树跑。' },
    { role: 'ai', text: '那棵槐树一定很有故事！🌳\n\n您还记得树下都聊些什么吗？大人们聊农活，孩子们又玩些什么呢？' },
    { role: 'user', text: '大人们聊庄稼、聊天气、聊谁家娶媳妇了。孩子们就玩捉迷藏、拍纸牌。' },
    { role: 'ai', text: '拍纸牌！我听说过这个！🃏\n\n奶奶您小时候拍纸牌厉不厉害呀？有没有什么特别让您印象深刻的事情？\n\n（AI 正在整理这段故事...' },
  ],
  wedding: [
    { role: 'ai', text: '奶奶，今天我们来聊聊您和爷爷的故事，一定很浪漫吧 💒\n\n您还记得和爷爷是怎么认识的吗？' },
    { role: 'user', text: '我们是相亲认识的，那时候哪有自由恋爱啊，都是媒人介绍的。' },
    { role: 'ai', text: '那时候的相亲一定很特别！🤝\n\n您还记得第一次见面是在哪里吗？当时觉得爷爷这个人怎么样？' },
    { role: 'user', text: '第一次见面在镇上供销社，他穿着一身蓝色中山装，话不多，但看着挺老实的。' },
    { role: 'ai', text: '蓝色中山装，话不多、看着老实——爷爷年轻时的样子一定很帅气！📷\n\n后来是怎么决定结婚的呢？从相亲到结婚，中间过了多久？' },
  ],
  war: [
    { role: 'ai', text: '奶奶，我知道您经历过很不容易的年代...' },
    { role: 'user', text: '是啊，那时候苦啊，什么都缺。' },
    { role: 'ai', text: '🌾 那个年代确实很艰难。\n\n您能跟我讲讲，当时一天的生活大概是什么样的吗？从早到晚，都忙些什么？' },
    { role: 'user', text: '天不亮就起来干活了，喂猪、做饭、下地，晚上还要缝缝补补。' },
    { role: 'ai', text: '您一个人要做这么多事情，真是太不容易了！💪\n\n那时候有没有什么特别苦、但现在回想起来又觉得很珍贵的记忆？' },
  ],
  food: [
    { role: 'ai', text: '奶奶，今天我们来聊点轻松的——聊吃的！🍜\n\n您小时候最喜欢吃什么呀？有没有什么特别想念的味道？' },
    { role: 'user', text: '那时候哪有什么喜欢不喜欢，有得吃就不错了。但我妈做的面糊，我这辈子都忘不了。' },
    { role: 'ai', text: '面糊！听起来好朴素又温馨 🍜\n\n您还记得那面糊是怎么做的吗？里面都放些什么？' },
    { role: 'user', text: '就是玉米面，加点盐，熬成糊糊，配着咸菜吃。但我妈每次都给我们碗底卧一个鸡蛋。' },
    { role: 'ai', text: '碗底卧一个鸡蛋！😭 妈妈的爱都在这里面了。\n\n您后来有没有把这道面糊做给自己的孩子们吃过？他们喜欢吗？' },
  ],
  travel: [
    { role: 'ai', text: '奶奶，您出过远门吗？我特别好奇您年轻时候出远门是什么感觉 🚢\n\n您还记得第一次离开家乡是去哪里吗？' },
    { role: 'user', text: '第一次出远门是去县城，那时候觉得县城好大啊，眼睛都不够用了。' },
    { role: 'ai', text: '从乡下到县城，一定像打开了新世界的大门！🚪\n\n您还记得坐什么车去的吗？路上花了多长时间？' },
    { role: 'user', text: '走路去的，天没亮就出发，走到下午才到，脚都磨出泡了。' },
    { role: 'ai', text: '走了整整一天！现在开车半小时就到了 🏎️\n\n第一次到县城，最让您印象深刻的是什么？有没有什么现在还记忆犹新的场景？' },
  ],
};

let currentTopic = 'childhood';
let chatStep = 0;

const topicItems = document.querySelectorAll('.chat-topic-item');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const recordBtn = document.getElementById('recordBtn');

// Switch topic
topicItems.forEach(item => {
  item.addEventListener('click', () => {
    topicItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    currentTopic = item.dataset.topic;
    chatStep = 0;
    chatMessages.innerHTML = '';

    // Show initial AI message for this topic
    const topicChat = chatData[currentTopic];
    if (topicChat && topicChat.length > 0) {
      setTimeout(() => addMessage('ai', topicChat[0].text), 300);
    }
  });
});

// Add message to chat
function addMessage(role, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${role}`;
  const avatar = role === 'ai' ? '🤖' : '👵';
  msgDiv.innerHTML = `
    <div class="chat-avatar">${avatar}</div>
    <div class="chat-bubble">${text.split('\n').map(p => `<p>${p}</p>`).join('')}</div>
  `;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTyping() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message ai';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <div class="chat-avatar">🤖</div>
    <div class="chat-bubble">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

// Send message
function sendUserMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage('user', text);
  chatInput.value = '';
  chatStep++;

  // Get next AI response
  const topicChat = chatData[currentTopic];
  const nextMsg = topicChat[chatStep];

  if (nextMsg) {
    showTyping();
    setTimeout(() => {
      removeTyping();
      addMessage('ai', nextMsg.text);
    }, 1200 + Math.random() * 600);
  } else {
    // End of conversation
    showTyping();
    setTimeout(() => {
      removeTyping();
      addMessage('ai', '奶奶，您讲的这些故事太珍贵了！💖\n\n这段对话我已经完整记录下来了，稍后会帮您整理成家族故事。\n\n要不要继续聊别的故事？或者我们上传一张老照片，让我帮您修复一下？');
      showToast('💾 故事已记录到时间线');
    }, 1500);
  }
}

sendBtn.addEventListener('click', sendUserMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendUserMessage();
});

// ===== Record Button (Demo) =====
let isRecording = false;
recordBtn.addEventListener('click', () => {
  isRecording = !isRecording;
  if (isRecording) {
    recordBtn.classList.add('recording');
    chatInput.placeholder = '🎤 正在录音... 说话吧';
    showToast('🎤 开始录音（Demo 模式）');
    setTimeout(() => {
      chatInput.value = '唉，那时候的日子虽然苦，但大家都互相帮衬着...';
      chatInput.placeholder = '输入回复内容，或按住 🎤 语音输入...';
      isRecording = false;
      recordBtn.classList.remove('recording');
      showToast('✅ 语音已转文字');
    }, 3000);
  } else {
    recordBtn.classList.remove('recording');
    chatInput.placeholder = '输入回复内容，或按住 🎤 语音输入...';
  }
});

// ===== Photo Restore =====
function restorePhoto(type) {
  const beforeImg = document.getElementById('photoBefore');
  const afterImg = document.getElementById('photoAfter');

  const messages = {
    colorize: { text: '🎨 AI 正在分析黑白照片场景并上色...', filter: 'sepia(0) contrast(1.05)' },
    enhance: { text: '✨ AI 正在增强清晰度...', filter: 'contrast(1.15) brightness(1.05)' },
    inpaint: { text: '🔧 AI 正在修补破损区域...', filter: 'sepia(0.05) brightness(1.1)' },
  };

  const action = messages[type];
  showToast(action.text);

  // Reset and replay animation
  afterImg.style.transition = 'none';
  afterImg.style.filter = beforeImg.style.filter || 'sepia(0.7) contrast(0.85) brightness(0.9)';

  setTimeout(() => {
    afterImg.style.transition = 'filter 1.8s ease-out';
    afterImg.style.filter = action.filter;
  }, 100);
}

// ===== Initialize First Chat =====
setTimeout(() => {
  const topicChat = chatData[currentTopic];
  if (topicChat && topicChat.length > 0) {
    addMessage('ai', topicChat[0].text);
  }
}, 800);

// ===== Smooth scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== Feature card link to demo tab =====
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('click', (e) => {
    e.preventDefault();
    const href = card.getAttribute('href');
    if (href && href.startsWith('#demo-')) {
      const tabName = href.replace('#demo-', '');
      demoTabs.forEach(t => {
        if (t.dataset.panel === tabName) {
          t.click();
          setTimeout(() => {
            document.querySelector('#panel-' + tabName).scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      });
    }
  });
});

// ===== Nav active state on scroll =====
const sections = ['features', 'demo', 'how', 'about'];
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    }
  });
});

// ===== Book page interaction =====
document.querySelectorAll('.book-page').forEach(page => {
  page.addEventListener('click', () => {
    showToast('📖 正在预览故事详情页...');
  });
});
