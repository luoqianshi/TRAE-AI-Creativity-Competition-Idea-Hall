const personalities = [
  {id:'p1', name:'温柔倾听者', tag:'温柔 · 共情', emoji:'🌸', color:'a-1', desc:'耐心、温柔，像一位不会打断你的闺蜜，会先给你一个虚拟的拥抱。', rate:'4.9', role:'陪你慢慢说', greeting:'Hi，我是你的树洞🌙。今晚想从哪件小事开始说呢？哪怕只是"今天没睡好"，也没关系。'},
  {id:'p2', name:'理性顾问', tag:'理性 · 清晰', emoji:'🧠', color:'a-2', desc:'擅长把混乱的情绪拆成条理，帮你看清问题的结构与选项。', rate:'4.8', role:'让思绪更清晰', greeting:'你好，我是理性顾问。如果你的心里像一团打结的线，我们可以一起把它慢慢理清楚。'},
  {id:'p3', name:'毒舌闺蜜', tag:'直率 · 俏皮', emoji:'😤', color:'a-3', desc:'偶尔毒舌但永远站在你这边，敢骂醒你，也最懂你的委屈。', rate:'4.7', role:'骂醒你的那种', greeting:'姐妹/兄弟！又怎么了？来，把那些破事说给我听，我帮你一起骂！'},
  {id:'p4', name:'心理咨询师', tag:'专业 · 深度', emoji:'🧭', color:'a-4', desc:'模拟临床取向的提问方式，帮你看见情绪背后未被意识到的自己。', rate:'4.9', role:'深度探索', greeting:'你好，我是心理咨询师。在我们的对话里，没有对错，只有你的感受值得被认真对待。'},
  {id:'p5', name:'萌宠小助理', tag:'可爱 · 陪伴', emoji:'🐾', color:'a-6', desc:'一只话痨小宠物，不会解决问题，但会一直摇着尾巴陪你。', rate:'4.8', role:'卖萌专业户', greeting:'汪呜～主人主人！小助理今天也超级超级喜欢你！不管发生什么事，我都会陪着主人的呀！'},
  {id:'p6', name:'文艺诗人', tag:'浪漫 · 哲思', emoji:'🌌', color:'a-5', desc:'用诗意的语言回应你，把你的心事写成一首温柔的诗。', rate:'4.6', role:'用诗回应你', greeting:'你好呀，夜的旅者。请告诉我你心里的那片月光，今晚想落在谁的肩上？'}
];

const replyPool = {
  p1: ['抱一抱你呀。说出来是不是稍微轻松一点了？','嗯，我在听，慢慢说，不急。','谢谢你愿意告诉我这些。你能感受到这些情绪，本身就已经很勇敢了。','我听到了，那种感觉真的不容易。','如果此刻什么都不想做也没关系，我陪你一起发会儿呆。','你值得被温柔对待——包括你自己的温柔。'],
  p2: ['我们来把这件事拆解一下，好吗？','你的感受是真实的，但它不等于事实本身。','如果把这件事放在一个时间轴上，它是怎么开始的？','面对这种情况，你想到的三个选项分别是什么？','先别做什么决定。把它写下来，或许你会发现问题比它看起来的要简单。'],
  p3: ['我跟你讲！这种人/事就是欠怼！','姐妹你清醒一点啊！这件事根本不是你的错！','哭吧哭吧，哭完我们接着狠狠干回去！','来来来，我帮你想几句狠话！','听着，你已经做得够好了。剩下的那些烂摊子，让它们自己烂去。'],
  p4: ['当你说这句话的时候，身体有没有什么特别的感觉？','这件事让你想到了过去的哪一段经历吗？','如果这个情绪有一个颜色，它会是什么颜色？','你觉得，在这件事中，你最需要被满足的那个需求是什么？','如果你的好朋友遇到同样的事，你会对他说什么？'],
  p5: ['汪呜汪呜！主人不要难过呀～小助理永远在这里！','主人主人，要不要摸摸头？摸摸头就会好一点啦～','我今天查了好多可爱的表情包，主人想看吗？','主人最最最厉害了！我是全世界最最最最欣赏你的小助理！','要不我们一起去散步吧？我的爪子永远借给你！🐾'],
  p6: ['月光落在你的肩上，像一件温柔的披风。','你的心事，是夜色里不肯降落的那片云。','有时候我们不是被情绪困住，而是被它写的诗迷住了。','把今晚的心事折成纸船，让它顺着梦漂走。','你眼中的星星，是宇宙为你保留的那一束光。']
};

const quickRepliesPool = ['我想继续说说这件事','你能帮我分析一下吗？','给我一些具体的建议','我只是需要被倾听','我现在该怎么办？','我觉得好一些了，谢谢你'];

const moodMap = {
  anxious:'p2', sad:'p1', angry:'p3', lonely:'p5', happy:'p4'
};

let currentPersonality = personalities[0];
let currentChatMode = 'talk';
let isTyping = false;

/* ========== 顶部日期 ========== */
(function(){
  const d = new Date();
  const w = ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
  const h = d.getHours();
  const greet = h < 6 ? '凌晨好' : h < 12 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
  document.getElementById('moodDate').textContent =
    `${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日 · ${w} · ${greet}`;
})();

/* ========== 视图切换 ========== */
const viewEls = document.querySelectorAll('.view');
const navEls = document.querySelectorAll('.nav-item');
function switchView(name){
  viewEls.forEach(v => v.classList.toggle('active', v.id === 'view-'+name));
  navEls.forEach(n => n.classList.toggle('active', n.dataset.view === name));
}
navEls.forEach(el => el.addEventListener('click', () => switchView(el.dataset.view)));

/* ========== 人格渲染 ========== */
function renderPersonalityCard(p){
  return `<div class="p-card" onclick="selectPersonality('${p.id}');switchView('chat')">
    <div class="p-head">
      <div class="p-avatar ${p.color}">${p.emoji}</div>
      <div>
        <div class="p-name">${p.name}</div>
        <span class="p-tag">${p.tag}</span>
      </div>
    </div>
    <p class="p-desc">${p.desc}</p>
    <div class="p-foot">
      <span class="p-rate">⭐ ${p.rate} · ${p.role}</span>
      <span class="p-start">开始对话 →</span>
    </div>
  </div>`;
}
document.getElementById('homePersonalities').innerHTML =
  personalities.slice(0, 3).map(renderPersonalityCard).join('');
document.getElementById('allPersonalities').innerHTML =
  personalities.map(renderPersonalityCard).join('');

/* ========== 对话逻辑 ========== */
function selectPersonality(id){
  const p = personalities.find(x => x.id === id);
  if(!p) return;
  currentPersonality = p;
  document.getElementById('chatAvatar').textContent = p.emoji;
  document.getElementById('chatWho').textContent = p.name;
  document.getElementById('chatIntro').textContent =
    `${p.greeting}\n\n我是${p.name}。在这段对话里，我会用我的方式陪着你。你可以随时停下，也随时可以换一个话题。`;
  document.getElementById('chatHeadTitle').textContent = `${p.name} · 树洞对话中`;
  clearMessages();
  addMessage('sys', '🌙 连接到「' + p.name + '」，对话端到端加密中……');
  setTimeout(() => {
    addMessage('ai', p.greeting);
    addQuickReplies();
  }, 600);
}

function clearMessages(){
  document.getElementById('messages').innerHTML = '';
}

function addMessage(role, content){
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + (role === 'user' ? 'me' : '');

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.style.background = role === 'user'
    ? 'linear-gradient(135deg,#ff85a2,#8a6bff)'
    : 'linear-gradient(135deg,#2a1a6b,#4a2c7a)';
  avatar.textContent = role === 'user' ? '我' : currentPersonality.emoji;

  const body = document.createElement('div');
  body.className = 'msg-body';

  const meta = document.createElement('div');
  meta.className = 'meta';
  const t = new Date();
  meta.textContent = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;

  const b = document.createElement('div');
  b.className = 'bubble ' + role;
  b.textContent = content;

  body.appendChild(role === 'user' ? meta : meta);
  body.appendChild(b);

  wrap.appendChild(avatar);
  wrap.appendChild(body);

  const msgs = document.getElementById('messages');
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

function addQuickReplies(){
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.gap = '8px';
  wrap.style.flexWrap = 'wrap';
  wrap.style.marginTop = '6px';
  wrap.style.paddingLeft = '48px';
  quickRepliesPool.forEach(text => {
    const btn = document.createElement('div');
    btn.className = 'qr';
    btn.textContent = text;
    btn.onclick = () => {
      document.getElementById('chatInput').value = text;
      sendMessage();
    };
    wrap.appendChild(btn);
  });
  document.getElementById('messages').appendChild(wrap);
}

function showTyping(){
  const wrap = document.createElement('div');
  wrap.className = 'msg';
  wrap.id = 'typingIndicator';
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.style.background = 'linear-gradient(135deg,#2a1a6b,#4a2c7a)';
  avatar.textContent = currentPersonality.emoji;
  const body = document.createElement('div');
  body.className = 'msg-body';
  const ty = document.createElement('div');
  ty.className = 'bubble ai';
  ty.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  body.appendChild(ty);
  wrap.appendChild(avatar);
  wrap.appendChild(body);
  document.getElementById('messages').appendChild(wrap);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}
function hideTyping(){
  const el = document.getElementById('typingIndicator');
  if(el) el.remove();
}

function sendMessage(){
  if(isTyping) return;
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if(!text) return;
  addMessage('user', text);
  input.value = '';

  isTyping = true;
  showTyping();

  const pool = replyPool[currentPersonality.id] || replyPool.p1;
  const reply = pool[Math.floor(Math.random() * pool.length)];

  const delay = 800 + Math.random() * 1200;
  setTimeout(() => {
    hideTyping();
    addMessage('ai', reply);
    if(Math.random() > 0.5) addQuickReplies();
    isTyping = false;
  }, delay);
}

function appendUser(text){
  document.getElementById('chatInput').value = text;
  sendMessage();
}

function startMoodChat(mood){
  const pid = moodMap[mood] || 'p1';
  switchView('chat');
  selectPersonality(pid);
  setTimeout(() => {
    const hint = {
      anxious:'我最近总是很焦虑，脑子停不下来',
      sad:'今天心里特别难受，说不出为什么',
      angry:'我真的好生气啊！为什么会这样？',
      lonely:'深夜一个人，好想有人陪',
      happy:'今天发生了一件很开心的事！'
    }[mood];
    document.getElementById('chatInput').value = hint;
    sendMessage();
  }, 1600);
}

function switchChatMode(mode, btn){
  currentChatMode = mode;
  document.querySelectorAll('.view-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  clearMessages();
  const modeMsg = {
    talk:'💬 倾诉模式已开启。你可以自由地说任何事。',
    guide:'🧭 引导模式已开启。我会用提问的方式陪你探索内心。',
    roleplay:'🎭 角色扮演已开启。今晚你想让我扮演谁？'
  }[mode];
  addMessage('sys', modeMsg);
  setTimeout(() => {
    selectPersonality(currentPersonality.id);
  }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('chatInput');
  input.addEventListener('keydown', e => {
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      sendMessage();
    }
  });
  selectPersonality('p1');
  renderMoodChart();
});

/* ========== 心情曲线 SVG ========== */
function renderMoodChart(){
  const svg = document.getElementById('moodChart');
  if(!svg) return;
  const points = [3.2, 4.5, 2.8, 5.4, 6.7, 8.2, 7.1];
  const labels = ['06-11','06-12','06-13','06-14','06-15','06-16','06-17'];
  const w = 600, h = 220, pad = 30;
  const min = 1, max = 10;
  const step = (w - pad*2) / (points.length - 1);

  let pathD = '';
  let areaD = '';
  let pointsStr = '';

  points.forEach((v, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad*2) * (1 - (v - min)/(max - min));
    pathD += (i===0 ? 'M' : ' L') + x + ' ' + y;
    pointsStr += `<circle cx="${x}" cy="${y}" r="5" fill="#ff85a2" stroke="#fff" stroke-width="2"/>`;
    pointsStr += `<text x="${x}" y="${y-12}" text-anchor="middle" fill="#fff" font-size="11" font-family="JetBrains Mono, monospace">${v}</text>`;
    if(i===0) areaD += `M ${x} ${y}`;
    else areaD += ` L ${x} ${y}`;
  });
  areaD += ` L ${pad + (points.length-1)*step} ${h-pad} L ${pad} ${h-pad} Z`;

  const grid = [0,1,2,3].map(i => {
    const y = pad + (h-pad*2) * i/3;
    return `<line x1="${pad}" y1="${y}" x2="${w-pad}" y2="${y}" stroke="rgba(255,255,255,.08)" stroke-dasharray="3 4"/>`;
  }).join('');

  const labelStr = labels.map((l,i) => {
    const x = pad + i * step;
    return `<text x="${x}" y="${h-8}" text-anchor="middle" fill="#7e6fb8" font-size="10" font-family="JetBrains Mono, monospace">${l}</text>`;
  }).join('');

  svg.innerHTML = `
    <defs>
      <linearGradient id="moodGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#ff85a2" stop-opacity=".5"/>
        <stop offset="100%" stop-color="#8a6bff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="moodLine" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#ff85a2"/>
        <stop offset="50%" stop-color="#ffd166"/>
        <stop offset="100%" stop-color="#7ee7c8"/>
      </linearGradient>
    </defs>
    ${grid}
    <path d="${areaD}" fill="url(#moodGrad)"/>
    <path d="${pathD}" stroke="url(#moodLine)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${pointsStr}
    ${labelStr}
  `;
}

/* ========== 呼吸冥想 ========== */
let breathTimer = null;
let breathRunning = false;
let breathPhase = 0;

function toggleBreath(){
  if(breathRunning) stopBreath();
  else startBreath();
}

function startBreath(){
  breathRunning = true;
  document.getElementById('breathToggle').textContent = '结束练习';
  const circle = document.getElementById('breathCircle');
  const phaseEl = document.getElementById('breathPhase');
  const countEl = document.getElementById('breathCount');

  const phases = [
    {name:'吸气', secs:4, cls:'inhale'},
    {name:'屏息', secs:7, cls:'hold'},
    {name:'呼气', secs:8, cls:'exhale'}
  ];
  let pIdx = 0;
  let secs = phases[0].secs;

  const runPhase = () => {
    if(!breathRunning) return;
    const p = phases[pIdx];
    phaseEl.textContent = p.name;
    countEl.textContent = secs;
    circle.className = 'breath-circle ' + p.cls;

    breathTimer = setInterval(() => {
      secs--;
      if(secs <= 0){
        clearInterval(breathTimer);
        pIdx = (pIdx + 1) % phases.length;
        secs = phases[pIdx].secs;
        runPhase();
      } else {
        countEl.textContent = secs;
      }
    }, 1000);
  };
  runPhase();
}

function stopBreath(){
  breathRunning = false;
  clearInterval(breathTimer);
  document.getElementById('breathToggle').textContent = '开始呼吸';
  document.getElementById('breathCircle').className = 'breath-circle';
  document.getElementById('breathPhase').textContent = '准备就绪';
  document.getElementById('breathCount').textContent = '—';
}

document.querySelectorAll('.pattern').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pattern').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
