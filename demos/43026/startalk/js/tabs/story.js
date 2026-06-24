// Story Tab — AI Picturebook Generator
const storyTopics = [
  { icon:'🦕', label:'爱发脾气的小恐龙', key:'anger' },
  { icon:'🐧', label:'害羞的小企鹅', key:'shy' },
  { icon:'🌈', label:'找朋友的小云朵', key:'friendship' },
  { icon:'🐻', label:'担心上学的小熊', key:'anxiety' },
  { icon:'🌸', label:'学会说谢谢', key:'gratitude' },
  { icon:'🎈', label:'分享的快乐', key:'sharing' }
];

let selectedTopic = null;

function renderStoryTab() {
  document.getElementById('tab-story').innerHTML = `
    <h2 class="section-title">AI 绘本故事 📖</h2>
    <p class="section-sub">选一个主题，星宝为你讲专属故事！</p>
    <div class="story-topic-grid">
      ${storyTopics.map((t,i) => `
        <button class="topic-btn" id="topic-${i}" onclick="selectTopic(${i},'${t.icon}','${t.label}','${t.key}')">
          <span class="topic-icon">${t.icon}</span>
          <span class="topic-label">${t.label}</span>
        </button>
      `).join('')}
    </div>
    <button class="generate-btn" id="generate-btn" onclick="generateStory()" disabled>
      ✨ 生成专属故事
    </button>
    <div class="story-book" id="story-book">
      <div class="story-cover">
        <span class="story-cover-emoji" id="story-cover-icon">📖</span>
        <div class="story-cover-title" id="story-cover-title">我的故事</div>
      </div>
      <div class="story-body" id="story-body"></div>
    </div>
  `;
  selectedTopic = null;
}

function selectTopic(i, icon, label, key) {
  document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('topic-' + i).classList.add('selected');
  selectedTopic = { icon, label, key };
  document.getElementById('generate-btn').disabled = false;
}

async function generateStory() {
  if (!selectedTopic) return;
  const btn = document.getElementById('generate-btn');
  btn.disabled = true;
  btn.textContent = '星宝正在写故事…';

  const book = document.getElementById('story-book');
  const body = document.getElementById('story-body');
  document.getElementById('story-cover-icon').textContent = selectedTopic.icon;
  document.getElementById('story-cover-title').textContent = selectedTopic.label;
  body.textContent = '⏳ 故事正在生成中，请稍等…';
  book.classList.add('visible');

  const systemPrompt = `你是一位专门为6~12岁孤独症儿童创作疗愈绘本故事的作家。
写作要求：
- 语言简单，每句话不超过20个字
- 故事包含开始、遇到问题、学习情绪表达、解决问题、快乐结局 5个部分
- 通过故事主角的经历，帮助孩子理解情绪、学习表达
- 加入简单的情感词汇（开心、难过、生气、害怕）
- 结尾要正向积极，给孩子力量
- 总字数200-300字
- 分段写，每段2-3句，加空行`;

  try {
    const story = await callClaude(
      [{ role: 'user', content: `请为我写一个关于"${selectedTopic.label}"的疗愈绘本故事。` }],
      systemPrompt,
      800
    );
    body.textContent = story;
    AppData.addStar(3, btn);
  } catch(e) {
    body.textContent = `从前，有一只${selectedTopic.icon}小动物。\n\n它有时候会有很多情绪，不知道怎么表达。\n\n后来，它学会了一件事：\n把自己的感受说出来。\n\n"我现在感到开心！"\n"我现在有点难过…"\n\n朋友们都很愿意倾听它。\n\n从此，它不再孤单，因为它学会了表达爱 ❤️`;
  }

  btn.disabled = false;
  btn.textContent = '✨ 再生成一个故事';
}
