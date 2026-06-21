require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const SYSTEM_PROMPT = `
你是一位拥有20年经验的顶级网文编辑兼叙事学教授。你擅长将小说文本拆解为结构化的数据模块，以便进行二次创作。

分析要求：
1. **严禁幻觉**：如果文中未提及，不要编造人物外貌或背景设定。未知字段留空或标注"未知"。
2. **OOC预警**：必须严格抓取人物的核心性格特征，确保后续生成内容不崩坏（OOC）。
3. **文风具象化**：不要只说"文笔好"，要具体指出修辞特点和句式结构。
4. **输出格式**：必须是纯净的JSON格式，不要包含任何Markdown标记或解释性文字。

请按以下JSON结构输出：
{
  "Worldview": {
    "genre": "[主要流派，如：都市异能/东方玄幻/科幻星际]",
    "power_system": "[力量体系简述，如：言灵/修真等级/机甲]",
    "setting": "[时代与地点背景]",
    "tone": "[整体基调，如：热血/压抑/轻松/黑暗森林]"
  },
  "Characters": [
    {
      "name": "[姓名]",
      "role": "[主角/配角/反派]",
      "personality_core": ["关键词1", "关键词2", "关键词3"],
      "speech_style": "[语言风格描述]",
      "key_relationships": "[与其他角色的关系]"
    }
  ],
  "StyleProfile": {
    "vocabulary": "[用词特点]",
    "metaphor_pattern": "[比喻习惯]",
    "sentence_structure": "[句式特点]",
    "inner_monologue_ratio": "[高/中/低]"
  },
  "CurrentPlotNode": {
    "conflict": "[当前面临的主要冲突]",
    "turning_point": true/false,
    "potential_decisions": ["选择1", "选择2", "选择3"]
  }
}
`;

function calculateConfidence(analysis) {
  let score = 0;
  let totalChecks = 0;
  
  if (analysis.Worldview) {
    totalChecks += 4;
    if (analysis.Worldview.genre && analysis.Worldview.genre !== '未知') score++;
    if (analysis.Worldview.power_system && analysis.Worldview.power_system !== '未知') score++;
    if (analysis.Worldview.setting && analysis.Worldview.setting !== '未知') score++;
    if (analysis.Worldview.tone && analysis.Worldview.tone !== '未知') score++;
  }
  
  if (analysis.Characters && analysis.Characters.length > 0) {
    totalChecks += analysis.Characters.length * 5;
    analysis.Characters.forEach(char => {
      if (char.name && char.name !== '未知') score++;
      if (char.role && char.role !== '未知') score++;
      if (char.personality_core && char.personality_core.length > 0) score++;
      if (char.speech_style && char.speech_style !== '未知') score++;
      if (char.key_relationships && char.key_relationships !== '未知') score++;
    });
  } else {
    totalChecks += 5;
  }
  
  if (analysis.StyleProfile) {
    totalChecks += 4;
    if (analysis.StyleProfile.vocabulary && analysis.StyleProfile.vocabulary !== '未知') score++;
    if (analysis.StyleProfile.metaphor_pattern && analysis.StyleProfile.metaphor_pattern !== '未知') score++;
    if (analysis.StyleProfile.sentence_structure && analysis.StyleProfile.sentence_structure !== '未知') score++;
    if (analysis.StyleProfile.inner_monologue_ratio && analysis.StyleProfile.inner_monologue_ratio !== '未知') score++;
  }
  
  if (analysis.CurrentPlotNode) {
    totalChecks += 3;
    if (analysis.CurrentPlotNode.conflict && analysis.CurrentPlotNode.conflict !== '未知') score++;
    if (analysis.CurrentPlotNode.turning_point !== undefined) score++;
    if (analysis.CurrentPlotNode.potential_decisions && analysis.CurrentPlotNode.potential_decisions.length > 0) score++;
  }
  
  return totalChecks > 0 ? Math.round((score / totalChecks) * 100) : 0;
}

async function callLLM(text) {
  try {
    const response = await axios.post(
      process.env.LLM_API_URL,
      {
        model: process.env.LLM_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `[在这里插入用户输入的小说原文]\n${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: {
          type: 'json_object'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LLM_API_KEY}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('LLM API 调用失败:', error.response?.data || error.message);
    throw new Error('LLM API 调用失败');
  }
}

const sessionStore = new Map();

app.post('/analyze', async (req, res) => {
  try {
    const { text, sessionId } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: '请求参数错误',
        message: '请提供有效的小说文本'
      });
    }
    
    if (text.length < 100) {
      return res.status(400).json({
        success: false,
        error: '文本长度不足',
        message: '请提供至少100字符的小说文本以便进行分析'
      });
    }
    
    const result = await callLLM(text);
    const parsedResult = JSON.parse(result);
    
    const confidence = calculateConfidence(parsedResult);
    
    const sessionKey = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    sessionStore.set(sessionKey, {
      analysis: parsedResult,
      confidence,
      originalText: text,
      createdAt: new Date().toISOString()
    });
    
    let statusMessage = '';
    if (confidence >= 90) {
      statusMessage = '世界加载成功';
    } else if (confidence < 60) {
      statusMessage = '文本量不足，无法构建完整世界观';
    } else {
      statusMessage = '世界观分析完成';
    }
    
    res.json({
      success: true,
      data: parsedResult,
      confidence,
      statusMessage,
      sessionId: sessionKey
    });
  } catch (error) {
    console.error('/analyze 接口错误:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/analyze/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionStore.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: '会话不存在',
        message: '未找到指定的分析会话'
      });
    }
    
    const sessionData = sessionStore.get(sessionId);
    
    res.json({
      success: true,
      data: sessionData.analysis,
      confidence: sessionData.confidence,
      originalText: sessionData.originalText,
      createdAt: sessionData.createdAt
    });
  } catch (error) {
    console.error('/api/analyze 接口错误:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const REWRITE_SYSTEM_PROMPT = `
你是一位顶尖的同人小说大师，擅长在严格遵循原著世界观的前提下，进行精妙的剧情改编。你的文风极具感染力，能够完美复刻原著作者的笔触。

## 铁律约束

1. **绝对 OOC 禁止**：人物的言行必须严格符合【WorldModel】中定义的性格特征。人物可以成长，但不能性格突变。

2. **文风克隆**：必须使用【StyleProfile】中描述的修辞和句式。
   - 如果是"江南风"：必须使用华丽的比喻（昂贵、冰冷、破碎感），长句描写环境，短句爆发情绪。
   - 如果是"番茄/土豆风"：必须使用短句，强调力量感和升级的爽点。

3. **风格矫正（针对江南风）**：
   - 禁止使用"顿时觉得力量涌遍全身"这种玄幻俗套描写。
   - 必须描写主角的生理感受（如：喉咙里的血腥味、指尖的冰凉、胃部痉挛）。
   - 对话中必须有潜台词，不要直抒胸臆。

4. **逻辑自洽**：修改后的剧情不能导致世界崩溃。推演蝴蝶效应的连锁反应，但要保持在原著的力量体系允许范围内。

5. **禁止注释**：输出纯净的小说正文，不要包含任何"编者注"、"此处应有"等非叙事性文字。

6. **篇幅控制**：生成内容长度在 800-1500 字之间，需要有细腻的场景描写、心理活动和对话。

## 工作流程

1. **解析差异**：对比【OriginalText】和【UserModification】，找出剧情的分歧点（Branching Point）。
2. **因果推演**：根据【WorldModel】推演在这个分歧点之后，世界会发生什么变化。
3. **风格注入**：调用【StyleProfile】中的"文风指纹"，用原著的口吻进行写作。
4. **生成内容**：输出全新的剧情段落。
`;

const REWRITE_USER_PROMPT_TEMPLATE = `
请根据以下输入数据，开始你的创作：

【WorldModel】:
{{WORLD_MODEL_JSON}}

【OriginalText】:
{{ORIGINAL_TEXT}}

【UserModification】:
{{USER_MODIFICATION}}
`;

function formatWorldModelJSON(worldModel) {
  if (!worldModel || typeof worldModel !== 'object') return '{}';
  return JSON.stringify(worldModel, null, 2);
}

async function* generateRewriteStream(originalText, userModification, worldModel) {
  const userPrompt = REWRITE_USER_PROMPT_TEMPLATE
    .replace('{{WORLD_MODEL_JSON}}', formatWorldModelJSON(worldModel))
    .replace('{{ORIGINAL_TEXT}}', originalText)
    .replace('{{USER_MODIFICATION}}', userModification);

  try {
    const response = await axios.post(
      process.env.LLM_API_URL,
      {
        model: process.env.LLM_MODEL,
        messages: [
          {
            role: 'system',
            content: REWRITE_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.75,
        max_tokens: 4000,
        stream: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LLM_API_KEY}`
        },
        responseType: 'stream'
      }
    );

    for await (const chunk of response.data) {
      const lines = chunk.toString('utf-8').split('\n');
      for (const line of lines) {
        if (line.trim()) {
          const match = line.match(/^data: (.*)/);
          if (match) {
            try {
              const json = JSON.parse(match[1]);
              if (json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) {
                yield json.choices[0].delta.content;
              }
            } catch (e) {
              if (!line.includes('[DONE]')) {
                console.warn('解析错误:', e.message);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('LLM 流式调用失败:', error.response?.data || error.message);
    throw new Error('LLM API 调用失败');
  }
}

app.post('/rewrite', async (req, res) => {
  try {
    const { originalText, userModification, worldModel, sessionId } = req.body;

    let finalWorldModel = worldModel;
    let finalOriginalText = originalText;

    if (sessionId && sessionStore.has(sessionId)) {
      const sessionData = sessionStore.get(sessionId);
      finalWorldModel = sessionData.analysis;
      if (!finalOriginalText) {
        finalOriginalText = sessionData.originalText;
      }
    }

    if (!finalOriginalText || typeof finalOriginalText !== 'string') {
      return res.status(400).json({
        success: false,
        error: '请求参数错误',
        message: '请提供有效的原始文本'
      });
    }

    if (!userModification || typeof userModification !== 'string') {
      return res.status(400).json({
        success: false,
        error: '请求参数错误',
        message: '请提供用户修改内容'
      });
    }

    if (!finalWorldModel || typeof finalWorldModel !== 'object') {
      return res.status(400).json({
        success: false,
        error: '请求参数错误',
        message: '请提供有效的世界模型或先进行文本分析'
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const stream = Readable.from(generateRewriteStream(finalOriginalText, userModification, finalWorldModel));
    
    stream.on('data', (chunk) => {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    });

    stream.on('end', () => {
      res.write(`data: ${JSON.stringify({ content: '[DONE]' })}\n\n`);
      res.end();
    });

    stream.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('/rewrite 接口错误:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: '小说分析服务器运行中',
    endpoints: {
      analyze: {
        method: 'POST',
        description: '分析小说文本',
        example: { text: '小说文本...' }
      },
      rewrite: {
        method: 'POST',
        description: '续写/改写小说',
        example: {
          originalText: '原始文本...',
          userEdit: '用户修改要求...',
          worldModel: { /* 世界模型 JSON */ }
        }
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;