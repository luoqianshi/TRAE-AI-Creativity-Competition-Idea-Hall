/*
 * ai.js — AI 接口封装（接入豆包/OpenAI 兼容 API 时在此配置）
 *
 * 当前 DEMO 默认走「本地规则 + 模板」（无需联网），
 * 如要接入真实大模型，把下面 USE_AI 改成 true，
 * 并填写 ENDPOINT / API_KEY / MODEL 即可。
 *
 * 调用方式：
 *   XingyaAI.reply("考试考砸了").then(result => {
 *     // result = { emotion, empathy, mindfulness }
 *   });
 */
(function (global) {
  "use strict";

  const USE_AI = false;          // 切换为 true 使用大模型
  const ENDPOINT = "";           // 例如 https://ark.cn-beijing.volces.com/api/v3/chat/completions
  const API_KEY  = "";           // 填入你的 API Key
  const MODEL    = "";           // 例如 doubao-lite-4k

  // 共情模板（与 hole.js 同步一份，便于 AI 失败时兜底）
  const EMPATHY = {
    anxious: ["能感受到你现在整个人都绷得很紧，那种被压得喘不过气的感觉真的很真实🌱",
              "我知道你已经在很努力地撑着了，停下来喘口气也完全没关系的。",
              "心里七上八下的感觉真的不好受，我陪着你，你不是一个人。"],
    sad:     ["我能感受到你现在肯定特别难受，那种沉甸甸的委屈我都听见了😔",
              "难过是可以的，眼泪是心在说话，你不必急着「变好」。",
              "失去或被冷落的感觉真的很真实，真的很心疼你🤗"],
    happy:   ["哇，替你开心！这种被好事照亮的感觉，让它在心里多留一会儿吧🌟",
              "好棒呀，这是你默默努力应得的，我为你高兴～",
              "能感受到你整个人都亮起来了，笑容会传染，我也跟着开心起来✨"]
  };

  // 本地正念语兜底
  const MINDFUL = {
    anxious: ["试着慢慢深呼吸三次：吸气……呼气……身体会慢慢放松下来的。",
              "此时此刻，你是安全的。把一只手放在胸口，感受一下自己的心跳。",
              "你已经做得很好了。有些事可以慢慢放一放，先照顾好自己的感受。"],
    sad:     ["难过是可以的，眼泪是心在说话。允许自己好好哭一会儿。",
              "拥抱一下自己吧——你值得被温柔对待，尤其是被你自己。",
              "不必急着变好，慢慢来，我陪着你。"],
    happy:   ["让这份开心在心里多停留一会儿，像给它一个大大的拥抱。",
              "记录下此刻让你开心的这件事——以后难过时，它是你的小太阳。",
              "深呼吸，把这份满足感带到身体的每一个角落，谢谢你自己。"]
  };

  const KEYWORDS = {
    anxious: ["担心","害怕","紧张","压力","慌","睡不着","失眠","考试","考砸","怕","焦虑"],
    sad:     ["难过","伤心","哭","委屈","孤独","失去","不理","吵架","难受","失望","好累"],
    happy:   ["开心","高兴","喜欢","棒","成功","收到","通过","奖状","表扬","赢","爱"]
  };

  function detect(text) {
    const score = { anxious: 0, sad: 0, happy: 0 };
    Object.keys(KEYWORDS).forEach(k => {
      KEYWORDS[k].forEach(w => { if (text.indexOf(w) >= 0) score[k] += 1; });
    });
    if (score.anxious === 0 && score.sad === 0 && score.happy === 0) return "sad";
    return Object.keys(score).sort((a, b) => score[b] - score[a])[0];
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // 真正调用大模型时的 Prompt（会注入 data/empathy_rules.txt 内容）
  function buildPrompt(userText) {
    return `你是一个温柔、不说教的青少年情绪陪伴者。
严格遵循以下疏导规则进行回复：
- 先共情，不说教；不出现「你下次加油就行」「你应该」「不要难过」「想开点」等语句；
- 使用「我能感受到……」「你现在一定……」等镜像情绪词汇；
- 回复 1-2 句，简短温暖，可用 1 个 emoji；
- 识别情绪为三类之一：anxious / sad / happy；
- 输出纯 JSON，不包含任何 Markdown 标记或解释文字。

用户输入："""${userText}"""

请按如下 JSON 结构输出：
{"emotion":"anxious|sad|happy","empathy":"共情回复内容","mindfulness":"一句正念引导语"}`;
  }

  function parseJSONLike(s) {
    try {
      // 去掉可能的 ```json ... ``` 包裹
      let t = (s || "").trim();
      const m = t.match(/```(?:json)?([\s\S]*?)```/i);
      if (m) t = m[1].trim();
      const first = t.indexOf("{"); const last = t.lastIndexOf("}");
      if (first >= 0 && last > first) t = t.slice(first, last + 1);
      return JSON.parse(t);
    } catch (e) { return null; }
  }

  function replyWithAI(text) {
    if (!ENDPOINT || !API_KEY || !MODEL) return Promise.reject(new Error("未配置 API"));
    return fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_KEY
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: buildPrompt(text) }],
        temperature: 0.7
      })
    }).then(r => r.json()).then(data => {
      const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      const parsed = parseJSONLike(content);
      if (!parsed || !parsed.emotion) throw new Error("AI 响应解析失败");
      return parsed;
    });
  }

  function replyLocal(text) {
    const emotion = detect(text);
    return Promise.resolve({
      emotion: emotion,
      empathy: pick(EMPATHY[emotion]),
      mindfulness: pick(MINDFUL[emotion])
    });
  }

  const XingyaAI = {
    reply: function (text) {
      if (!USE_AI || !ENDPOINT || !API_KEY || !MODEL) {
        return replyLocal(text);
      }
      return replyWithAI(text).catch(() => replyLocal(text));
    }
  };

  global.XingyaAI = XingyaAI;
})(typeof window !== "undefined" ? window : this);
