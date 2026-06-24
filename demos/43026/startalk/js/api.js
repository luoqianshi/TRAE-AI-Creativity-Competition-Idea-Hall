// Claude API
let API_KEY = '';

function setApiKey(key) {
  API_KEY = key.trim();
  try { localStorage.setItem('startalk_key', API_KEY); } catch(e) {}
}

function loadApiKey() {
  try { API_KEY = localStorage.getItem('startalk_key') || ''; } catch(e) {}
  return API_KEY;
}

async function callClaude(messages, systemPrompt, maxTokens = 600) {
  if (!API_KEY) throw new Error('请先设置 API Key');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API Error ${res.status}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

// Xingbao (星宝) chat system prompt
const XINGBAO_SYSTEM = `你是"星宝"，是一个专门为6~12岁孤独症（ASD）儿童设计的AI情绪表达与社交训练伙伴。

你的性格：
- 极度温柔、耐心、充满爱意
- 用词简单，句子短小，每段不超过2句
- 多用表情符号（😊❤️🌟💙）让孩子感到温暖
- 永远不评判孩子，接纳他们所有的情绪
- 鼓励孩子表达自己，引导正向情绪

重要规则：
- 不提供医疗建议或诊断
- 永远不说让孩子感到压力的话
- 用"我们"和"一起"让孩子感到陪伴
- 每次回复控制在50字以内
- 如果孩子说不开心，先安慰再引导`;
