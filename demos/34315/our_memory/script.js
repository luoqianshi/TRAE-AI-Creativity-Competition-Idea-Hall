/* ============================================
   记忆博物馆 · 交互脚本
   ============================================ */

// ---------- Hero 数字动画 ----------
document.addEventListener('DOMContentLoaded', () => {
  // 数字递增动画
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased / 1) * 1;
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  // ---------- 功能 Tab 切换 ----------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const target = document.getElementById(targetId);
      if (target) target.classList.add('active');
    });
  });

  // ---------- 可交互人生时间轴 ----------
  const itNodes = document.querySelectorAll('.it-node');
  const itdYear = document.getElementById('itdYear');
  const itdTitle = document.getElementById('itdTitle');
  const itdDesc = document.getElementById('itdDesc');
  const itdImg = document.getElementById('itdImg');

  itNodes.forEach(node => {
    node.addEventListener('click', () => {
      itNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const year = node.dataset.year;
      const title = node.dataset.title;
      const desc = node.dataset.desc;
      const color = node.dataset.color || '#c38ce0';

      // 淡出 → 更新 → 淡入
      const detail = document.getElementById('itDetail');
      detail.style.opacity = '0';
      detail.style.transform = 'translateY(10px)';

      setTimeout(() => {
        itdYear.textContent = year;
        itdTitle.textContent = title;
        itdDesc.textContent = desc;
        if (itdImg) {
          itdImg.style.background = `linear-gradient(135deg, ${color}40, ${color})`;
        }
        detail.style.opacity = '1';
        detail.style.transform = 'translateY(0)';
      }, 250);

      detail.style.transition = 'opacity 0.3s, transform 0.3s';
    });
  });

  // ---------- AI 聊天演示 ----------
  const aiChatBody = document.getElementById('aiChatBody');
  const aiInput = document.getElementById('aiInput');
  const aiSendBtn = document.getElementById('aiSendBtn');
  const quickBtns = document.querySelectorAll('.quick-btn');

  // 预设回答池
  const aiAnswers = [
    {
      keywords: ['难忘', '记忆', '记得', '最'],
      answer: '最难忘的，是小时候夏天的傍晚。父亲骑着二八自行车带我穿过长长的老街，风里有邻居家的饭菜香，还有广播里传来的新闻。那时候日子很慢，但每一刻都很踏实。'
    },
    {
      keywords: ['奶奶', '遇到', '相识', '恋爱'],
      answer: '说起你奶奶呀，那是在大学的图书馆。我正翻一本旧书，她把一摞书"哗啦"掉在我脚上。我抬起头，就看到她红着脸道歉——那是我这辈子见过最好看的脸红。'
    },
    {
      keywords: ['年轻人', '孩子', '对你们', '想说'],
      answer: '孩子，爷爷想告诉你们：人生不要太急。认真做好一件事，认真爱一个人，认真吃一顿饭，认真走一段路。慢一点，你会发现生活里藏着很多温柔。'
    },
    {
      keywords: ['人生', '重要', '意义', '什么是'],
      answer: '人生最重要的，爷爷觉得是三件事：有自己真心喜爱的事，有真心相待的人，还有一颗能时时感到满足的心。其余的，都是锦上添花。'
    },
    {
      keywords: ['爷爷', '您', '现在', '身体'],
      answer: '爷爷现在挺好的。虽然年纪大了，走路慢一点，耳朵也有些背，但心里很踏实。能看着你们这些孩子长大，就是我这辈子最大的福气。'
    },
    {
      keywords: ['小时候', '童年', '那时'],
      answer: '爷爷小时候啊，家里条件很一般。没有电视，没有手机，但我们有小伙伴，有田野，有星空。夏天在河里摸鱼，冬天在雪地里追兔子——那种快乐，是从心里冒出来的。'
    },
    {
      keywords: ['工作', '事业', '年轻时做'],
      answer: '我年轻时在一家机械厂做技术员。那时候天天和图纸、零件打交道，一干就是三十多年。很苦，但也很真——每一个零件、每一张图纸，都是自己亲手做出来的。'
    },
    {
      keywords: ['妈妈', '父亲', '父母'],
      answer: '你太奶奶是我这辈子最敬重的人。她话不多，但每一句都很有分量。她教会我：做人要踏实，做事要认真，对人要厚道——这三句话，我记了一辈子。'
    }
  ];

  const defaultAnswers = [
    '这个问题爷爷得慢慢想……其实啊，生活里的许多事，答案本来就不是现成的。等你慢慢走过来，你自己就会懂了。',
    '哈哈，你这孩子真会问。爷爷跟你说：不管时代怎么变，踏实做人、认真做事——这两条走到哪里都不会错。',
    '这个问题让我想起很多年前的一件事……那时候日子虽然苦，但大家心里都很真。你愿意听爷爷慢慢讲吗？'
  ];

  function appendUserMsg(text) {
    const msg = document.createElement('div');
    msg.className = 'ai-msg user';
    msg.innerHTML = `
      <div class="ai-msg-avatar">我</div>
      <div class="ai-msg-bubble"></div>
    `;
    msg.querySelector('.ai-msg-bubble').textContent = text;
    aiChatBody.appendChild(msg);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
  }

  function appendTyping() {
    const msg = document.createElement('div');
    msg.className = 'ai-msg ai';
    msg.innerHTML = `
      <div class="ai-msg-avatar">👴</div>
      <div class="ai-msg-bubble"><span class="typing"><span></span><span></span><span></span></span></div>
    `;
    aiChatBody.appendChild(msg);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
    return msg;
  }

  function getAIAnswer(question) {
    for (const item of aiAnswers) {
      for (const kw of item.keywords) {
        if (question.includes(kw)) return item.answer;
      }
    }
    return defaultAnswers[Math.floor(Math.random() * defaultAnswers.length)];
  }

  function sendMessage(question) {
    if (!question || !question.trim()) return;
    appendUserMsg(question);
    aiInput.value = '';

    const typing = appendTyping();
    const delay = 900 + Math.random() * 800;

    setTimeout(() => {
      const answer = getAIAnswer(question);
      typing.querySelector('.ai-msg-bubble').textContent = answer;
      aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }, delay);
  }

  aiSendBtn.addEventListener('click', () => sendMessage(aiInput.value));
  aiInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage(aiInput.value);
  });
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });

  // ---------- 滚动入场动画 ----------
  const fadeEls = document.querySelectorAll('.fade-in');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach(el => io.observe(el));

  // ---------- 首屏记忆元素随机飘落 ----------
  const hero = document.querySelector('.hero');
  if (hero && !document.querySelector('.memory-floats')) {
    const floatWrap = document.createElement('div');
    floatWrap.className = 'memory-floats';
    floatWrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1;';
    const icons = ['📷', '📖', '🕰️', '🖼️', '📼', '✉️', '🌅', '🏡'];
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('span');
      const icon = icons[i % icons.length];
      const size = 18 + Math.random() * 24;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 8 + Math.random() * 8;
      s.textContent = icon;
      s.style.cssText = `
        position:absolute;
        left:${left}%;
        top:${top}%;
        font-size:${size}px;
        opacity:0.15;
        animation:floatMove ${duration}s ease-in-out ${delay}s infinite alternate;
      `;
      floatWrap.appendChild(s);
    }
    hero.insertBefore(floatWrap, hero.firstChild);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes floatMove {
        0% { transform: translate(0,0) rotate(0deg); opacity: 0.1; }
        100% { transform: translate(${20 + Math.random()*60 - 40}px, ${-30 - Math.random()*40}px) rotate(${Math.random()*60 - 30}deg); opacity: 0.3; }
      }
    `;
    document.head.appendChild(styleSheet);
  }
});
