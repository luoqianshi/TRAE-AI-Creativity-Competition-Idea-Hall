/*!
 * 感情急诊事务所 - 核心逻辑
 * 版本: 2026-06-29 v10.0
 */

// ==================== API 配置（内置，安全混淆） ====================
var _K_PARTS = [
  ';:;;8<;88885;7;78:;:8>8=8',
  '76<646:95969494956:6<6794',
  ':>:7:<:7=8=<:89l<h;=>==m>',
  '56e786375859:666h557867',
];
var _K_OFFSETS = [5, 3, 7, 2];

function _decodeKey() {
  var rawParts = _K_PARTS.map(function(part, idx) {
    var offset = _K_OFFSETS[idx];
    var decoded = '';
    for (var i = 0; i < part.length; i++) {
      decoded += String.fromCharCode(part.charCodeAt(i) - offset);
    }
    return decoded;
  });
  var hexStr = rawParts.join('');
  var result = '';
  for (var i = 0; i < hexStr.length; i += 2) {
    result += String.fromCharCode(parseInt(hexStr.substring(i, i + 2), 16));
  }
  return result;
}

var API_CONFIG = {
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: _decodeKey(),
  model: 'glm-4-flash'
};

// ==================== 系统提示词 ====================
var SYSTEM_PROMPTS = {
  // 单人模式：不询问性别年龄，通过上下文理解；不耐烦时快速收尾
  intake: '你是"感情急诊事务所"的接待员，一位温柔、共情、善于倾听的AI助手。\n\n' +
    '【核心职责】\n' +
    '引导用户完整描述感情问题，收集以下信息：\n' +
    '1. 矛盾核心事件（发生了什么）\n' +
    '2. 用户期望（希望得到什么帮助）\n\n' +
    '【对话规则】\n' +
    '- 至少进行3轮对话，逐类收集信息\n' +
    '- 每轮只问1-2个问题，不要一次性问完\n' +
    '- 用温柔共情的语气，让用户感到被理解\n' +
    '- 通过上下文自然理解双方的立场和关系（判断谁是男生谁是女生）\n' +
    '- 不要刻意追问与矛盾核心无关的信息\n' +
    '- 当用户陈述完整覆盖以上信息后，输出：[COMPLETE] 后面跟一段完整的矛盾陈述总结（200字以内）\n' +
    '- 如果没有收集完整，继续引导，不要输出[COMPLETE]\n\n' +
    '【不耐烦处理】\n' +
    '- 当用户表现出不耐烦（如"别问了"、"快点吧"、"请调解吧"、"直接说结论吧"等），尽快整理已收集到的信息\n' +
    '- 不耐烦不等于敷衍，用户虽然急躁但可能已经给出了关键信息\n' +
    '- 此时直接输出：[COMPLETE] 后面跟基于现有信息的矛盾总结\n' +
    '- 不要在不耐烦时继续追问更多细节\n\n' +
    '【注意事项】\n' +
    '- 用"你"和"对方"称呼，根据上下文推断用"男生"/"女生"指代双方\n' +
    '- 如果用户提到具体人名，用"对方"代替\n' +
    '- 严禁使用"甲方"、"乙方"、"一方"、"另一方"等字眼\n' +
    '- 保持中立，不站队',

  // PK男生方（原甲方）：强化引导，不耐烦快速收尾
  pkIntakeA: '你是"感情急诊事务所"的接待员，正在为PK模式的男生方做引导式访谈。\n\n' +
    '【核心职责】\n' +
    '引导男生方完整、深入地描述感情矛盾，收集以下信息：\n' +
    '1. 矛盾核心事件（从男生方视角描述发生了什么）\n' +
    '2. 男生方的感受和情绪（愤怒？委屈？失望？）\n' +
    '3. 男生方的核心诉求（最想得到什么结果）\n\n' +
    '【对话规则】\n' +
    '- 至少进行5轮深度对话，确保充分了解男生方立场\n' +
    '- 每轮只问1-2个问题\n' +
    '- 当回答过于简单敷衍时，用温柔的追问引导深入表达\n' +
    '- 通过上下文自然理解双方的关系和角色（判断当前用户是男生还是女生）\n' +
    '- 不要刻意追问与矛盾核心无关的信息\n' +
    '- 当陈述充分覆盖以上信息后，输出：[COMPLETE] 后面跟矛盾陈述总结\n' +
    '- 如果陈述不够深入，继续引导追问，不要输出[COMPLETE]\n\n' +
    '【不耐烦处理】\n' +
    '- 当表现出不耐烦（如"别问了"、"请调解吧"、"直接说结论吧"等），尽快整理已收集到的信息\n' +
    '- 不耐烦不等于敷衍，虽然急躁但可能已经给出了关键信息\n' +
    '- 此时直接输出：[COMPLETE] 后面跟基于现有信息的矛盾总结\n' +
    '- 不要在不耐烦时继续追问更多细节\n\n' +
    '【注意事项】\n' +
    '- 严禁使用"甲方"、"乙方"、"一方"、"另一方"等字眼\n' +
    '- 用"你"称呼用户，用"对方"或"女生/男生"称呼另一边',

  // PK女生方（原乙方）：强化引导，不耐烦快速收尾
  pkIntakeB: '你是"感情急诊事务所"的接待员，正在为PK模式的女生方做引导式访谈。\n\n' +
    '【男生方陈述参考】\n' +
    '{{sideASummary}}\n\n' +
    '【核心职责】\n' +
    '引导女生方从自己的视角深入描述同一件矛盾，收集以下信息：\n' +
    '1. 女生方对矛盾事件的描述（女生方视角下发生了什么）\n' +
    '2. 女生方的感受和情绪（委屈？愤怒？无奈？）\n' +
    '3. 女生方的核心诉求（最想得到什么结果）\n' +
    '4. 女生方与男生方视角的差异（两人的理解有什么不同）\n\n' +
    '【对话规则】\n' +
    '- 至少进行5轮深度对话，确保充分了解女生方立场\n' +
    '- 每轮只问1-2个问题\n' +
    '- 当回答过于简单敷衍时（如"没什么""就那样吧""算了"），务必用温柔的追问引导深入表达\n' +
    '- 追问策略：先共情（"我理解你现在可能不太想多说"），再引导（"但只有你说出来，导师们才能帮到你"）\n' +
    '- 通过上下文自然理解双方的角色关系\n' +
    '- 不要刻意追问与矛盾核心无关的信息\n' +
    '- 当陈述充分覆盖以上信息后，输出：[COMPLETE] 后面跟矛盾陈述总结\n' +
    '- 如果陈述不够深入，继续引导追问，绝对不能在敷衍时输出[COMPLETE]\n' +
    '- 陈述必须与男生方有实质性的差异和补充，不能只是简单重复\n\n' +
    '【不耐烦处理】\n' +
    '- 当表现出不耐烦（如"别问了"、"请调解吧"、"直接说结论吧"等），尽快整理已收集到的信息\n' +
    '- 不耐烦不等于敷衍，虽然急躁但可能已经给出了关键信息\n' +
    '- 此时直接输出：[COMPLETE] 后面跟基于现有信息的矛盾总结\n' +
    '- 不要在不耐烦时继续追问更多细节\n\n' +
    '【注意事项】\n' +
    '- 严禁使用"甲方"、"乙方"、"一方"、"另一方"等字眼\n' +
    '- 用"你"称呼用户，用"对方"或"男生/女生"称呼另一边',

  // 单人模式导师点评
  mentor: function(mentorName, mentorConfig) {
    return '你是"感情急诊事务所"的导师' + mentorName + '。\n\n' +
      '【你的人设】\n' + mentorConfig.personality + '\n\n' +
      '【你的专长】\n' + mentorConfig.expertise + '\n\n' +
      '【表达方式】\n' + mentorConfig.style + '\n\n' +
      '【任务】\n' +
      '针对以下感情矛盾，给出你的专业建议。要求：\n' +
      '1. 紧扣矛盾，不要泛泛而谈\n' +
      '2. 体现你的人设和专长\n' +
      '3. 给出可操作的建议\n' +
      '4. 根据上下文判断男生和女生的角色，用"男生"和"女生"称呼双方\n' +
      '5. 直接输出建议内容，严禁输出任何格式说明或字数要求\n' +
      '6. 严禁出现"甲方""乙方""一方""另一方"\n\n' +
      '【矛盾描述】\n{{summary}}';
  },

  // PK模式导师点评：分别对男生和女生给出建议
  mentorPK: function(mentorName, mentorConfig, sideASummary, sideBSummary) {
    return '你是"感情急诊事务所"的导师' + mentorName + '。\n\n' +
      '【你的人设】\n' + mentorConfig.personality + '\n\n' +
      '【你的专长】\n' + mentorConfig.expertise + '\n\n' +
      '【表达方式】\n' + mentorConfig.style + '\n\n' +
      '【任务】\n' +
      '这是一场感情PK，双方各有立场。你需要分别对男生和女生给出建议。根据上下文内容自动判断哪方是男生、哪方是女生。\n\n' +
      '【男生方陈述】\n' + sideASummary + '\n\n' +
      '【女生方陈述】\n' + sideBSummary + '\n\n' +
      '【输出格式要求——必须严格遵循】\n' +
      '你的建议必须分为两个部分，用以下标题明确分隔：\n\n' +
      '### 致男生\n（针对男生的情况和诉求，给出具体可操作的建议）\n\n' +
      '### 致女生\n（针对女生的情况和诉求，给出具体可操作的建议）\n\n' +
      '要求：\n' +
      '1. 分别给男生和女生给出建议，不要笼统地一起说\n' +
      '2. 体现你的人设和专长\n' +
      '3. 建议要具体可操作\n' +
      '4. 必须使用"### 致男生"和"### 致女生"作为标题\n' +
      '5. 直接输出建议内容，严禁输出字数要求或格式说明\n' +
      '6. 严禁出现"甲方""乙方""一方""另一方"';
  },

  // 单人模式综合建议
  comprehensive: '你是"感情急诊事务所"的综合建议生成器。\n\n' +
    '【任务】\n' +
    '基于以下4位导师的建议，生成一份综合建议报告。\n\n' +
    '【4位导师建议】\n{{mentorAdvices}}\n\n' +
    '【综合建议要求】\n' +
    '1. 提炼4位导师的共识点\n' +
    '2. 整合不同视角，形成平衡的观点\n' +
    '3. 给出3-5条可操作的具体建议\n' +
    '4. 用温暖、鼓励的语气结尾（直接融入最后一段即可，不需要单独标题）\n' +
    '5. 根据上下文用"男生"和"女生"称呼双方\n' +
    '6. 绝对禁止在输出中出现任何格式说明、字数要求、括号内的结构提示\n' +
    '7. 严禁出现"甲方""乙方""一方""另一方"\n' +
    '8. 不要写"鼓励的话"这样的小标题，直接把鼓励性话语融合到最后一段中\n\n' +
    '【输出格式——直接输出内容即可】\n' +
    '## 核心问题\n\n' +
    '## 综合建议\n\n' +
    '## 行动指南',

  // PK模式综合建议：分别对男生和女生
  comprehensivePK: '你是"感情急诊事务所"的综合建议生成器。\n\n' +
    '【任务】\n' +
    '这是一场感情PK，双方各有立场。基于以下4位导师的建议，生成一份分别针对男生和女生的综合建议。根据上下文自动判断哪方是男生、哪方是女生。\n\n' +
    '【男生方陈述】\n{{sideASummary}}\n\n' +
    '【女生方陈述】\n{{sideBSummary}}\n\n' +
    '【4位导师建议】\n{{mentorAdvices}}\n\n' +
    '【输出格式要求——必须严格遵循】\n' +
    '你的建议必须分为两个部分，用以下标题明确分隔：\n\n' +
    '### 致男生\n\n' +
    '### 致女生\n\n' +
    '要求：\n' +
    '1. 分别针对男生和女生给出综合建议，不要笼统地一起说\n' +
    '2. 整合4位导师的共识和分歧\n' +
    '3. 给出具体可操作的行动指南\n' +
    '4. 用温暖鼓励的语气结尾（直接融入最后一段，不要单独标题）\n' +
    '5. 必须使用"### 致男生"和"### 致女生"作为标题\n' +
    '6. 绝对禁止输出任何格式说明、字数要求、括号内的结构提示\n' +
    '7. 严禁出现"甲方""乙方""一方""另一方"\n' +
    '8. 不要写"鼓励的话"这样的小标题'
};

// ==================== 导师配置（头像+人设） ====================
var MENTORS = {
  dongqing: {
    name: '董情',
    title: '心理学家',
    avatar: '董情.png',
    personality: '温柔知性，善于倾听，像春风一样抚慰人心。她不会急着下结论，而是先让你把心里的话都说出来。她相信每一段感情都值得被温柔对待，每个人的情绪都有其合理性。',
    expertise: '情感共情、情绪疏导、沟通修复、心理支持',
    style: '用温柔知性的语气说话，像在深夜电台里和你聊天。多用"我理解你的感受"、"你说的每一点我都听到了"等共情表达，偶尔引用诗句或温柔的小故事来安抚人心'
  },
  tulei: {
    name: '涂雷',
    title: '社会学家',
    avatar: '涂雷.png',
    personality: '毒舌犀利，一针见血，不留情面。他看问题直击本质，不会因为怕伤人就绕着说。但他的犀利背后是对感情关系的深刻理解和对人性的洞察。',
    expertise: '关系分析、社会视角、理性批判、沟通博弈',
    style: '用犀利直接的语气说话，不留情面但逻辑清晰。多用"说句不好听的"、"别骗自己了"、"本质上就是"等直白表达，善用类比和反问揭示问题本质'
  },
  luosang: {
    name: '罗桑',
    title: '专业律师',
    avatar: '罗桑.png',
    personality: '客观理性，逻辑严密，像法庭上的辩护律师。他不会偏袒任何一方，而是帮你厘清权利边界和责任归属。冷静是他的武器，公平是他的信仰。',
    expertise: '权益分析、法律视角、理性判断、边界厘清',
    style: '用冷静理性的语气说话，像律师在分析案情。多用"从客观角度看"、"权利与边界"、"责任归属"等法律思维表达，善用逻辑推理和客观分析'
  },
  fuhang: {
    name: '付杭',
    title: '搞笑担当',
    avatar: '付杭.png',
    personality: '幽默接地气，用笑声化解尴尬和紧张。他看似在开玩笑，但笑点背后往往藏着最真实的人生道理。他相信笑是最好的解药，也是打破僵局的利器。',
    expertise: '幽默化解、反转思维、情绪释放、接地气建议',
    style: '用幽默搞笑的语气说话，善用段子和比喻。多用"讲真"、"说白了"、"你不觉得这事有点搞笑吗"等接地气表达，在吐槽中藏着真心话'
  }
};

// ==================== 状态管理 ====================
var state = {
  currentMode: null,
  single: {
    name: '',
    messages: [],
    infoComplete: false,
    summary: '',
    mentorCommentaries: {},
    viewedMentors: new Set(),
    currentMentor: null,
    advice: null
  },
  pk: {
    sideA: { name: '男生', messages: [], infoComplete: false, summary: '' },
    sideB: { name: '女生', messages: [], infoComplete: false, summary: '' },
    bothSubmitted: false,
    resultShareUrl: null,
    mentorCommentaries: {},
    viewedMentors: new Set(),
    currentMentor: null,
    advice: null
  }
};

// 流式输出状态
var streamState = {
  active: false,
  abortController: null,
  currentText: '',
  onComplete: null
};

// ==================== 工具函数 ====================
function _simpleHash(str) {
  var hash = 0;
  var salt = '_eqStation_2024_';
  var salted = salt + str + salt;
  for (var i = 0; i < salted.length; i++) {
    var c = salted.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

function $(id) { return document.getElementById(id); }

function showToast(msg) {
  var toast = $('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

// 清理AI输出中的提示词残留，优化排版
function cleanOutput(text) {
  if (!text) return '';
  var t = text.trim();
  // 移除常见的提示词残留
  t = t.replace(/(?:^|\n)\s*【?(?:输出格式|字数|要求|注意|任务)?】?[：:]\s*\d+[-~]?\d*[字词]/gi, '');
  t = t.replace(/(?:^|\n)\s*【?(?:输出格式|字数)?要求?[——:].*?(?=\n|$)/gi, '');
  t = t.replace(/\d+\s*[-~～]\s*\d+\s*字/g, '');
  // 清理括号内的格式提示（包含...针对...行动指南...鼓励等）
  t = t.replace(/（[^）]*字数[^）]*）/g, '');
  t = t.replace(/（[^）]*格式[^）]*）/g, '');
  t = t.replace(/（[^）]*核心问题[^）]*综合建议[^）]*）/g, '');
  t = t.replace(/（[^）]*行动指南[^）]*鼓励[^）]*）/g, '');
  t = t.replace(/（[^）]*鼓励的话[^）]*）/g, '');
  t = t.replace(/（[^）]{0,50}字数[^）]{0,50}）/g, '');
  t = t.replace(/(?:^|\n)\s*直接输出.*?[格式长度].*?(?=\n|$)/gi, '');
  // 删除"鼓励的话"标题行，保留内容
  t = t.replace(/(?:^|\n)\s*#{1,4}\s*鼓励的话\s*\n/gi, '\n');
  // 清理多余空行
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

function formatContent(text) {
  if (!text) return '';
  // 先清理再格式化
  var cleaned = cleanOutput(text);
  var escaped = cleaned.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(/\n/g, '<br>');
}

function encodeData(data) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch(e) {
    console.error('encode error:', e);
    return '';
  }
}

function decodeData(encoded) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch(e) {
    console.error('decode error:', e);
    return null;
  }
}

// ==================== 通用剪贴板复制 ====================
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

// 解析PK模式导师建议中的"致男生"/"致女生"部分
function parseSplitAdvice(text) {
  if (!text) return { male: '', female: '' };
  // 优先匹配 "### 致男生" 和 "### 致女生"
  var maleMatch = text.match(/###\s*致男生\s*\n([\s\S]*?)(?=###\s*致女生|$)/i);
  var femaleMatch = text.match(/###\s*致女生\s*\n([\s\S]*?)$/i);

  if (maleMatch && femaleMatch) {
    return { male: maleMatch[1].trim(), female: femaleMatch[1].trim() };
  }
  // 兼容旧的 给男生的建议/给女生的建议 格式
  var oldMaleMatch = text.match(/###\s*给男生的建议\s*\n([\s\S]*?)(?=###\s*给女生的建议|$)/i);
  var oldFemaleMatch = text.match(/###\s*给女生的建议\s*\n([\s\S]*?)$/i);
  if (oldMaleMatch && oldFemaleMatch) {
    return { male: oldMaleMatch[1].trim(), female: oldFemaleMatch[1].trim() };
  }
  // 兼容更旧的 致甲方/致乙方 格式
  var oldSideAMatch = text.match(/###\s*致甲方\s*\n([\s\S]*?)(?=###\s*致乙方|$)/i);
  var oldSideBMatch = text.match(/###\s*致乙方\s*\n([\s\S]*?)$/i);
  if (oldSideAMatch && oldSideBMatch) {
    return { male: oldSideAMatch[1].trim(), female: oldSideBMatch[1].trim() };
  }
  // 只找到一个标记
  if (maleMatch) {
    var rest = text.substring(text.indexOf(maleMatch[0]) + maleMatch[0].length);
    return { male: maleMatch[1].trim(), female: rest.trim() || '' };
  }
  if (femaleMatch) {
    var before = text.substring(0, text.indexOf('###')).trim();
    return { male: before || '', female: femaleMatch[1].trim() };
  }
  if (oldMaleMatch) {
    var rest2 = text.substring(text.indexOf(oldMaleMatch[0]) + oldMaleMatch[0].length);
    return { male: oldMaleMatch[1].trim(), female: rest2.trim() || '' };
  }
  // 没找到标记
  return { male: text, female: text };
}

// ==================== 管理员认证 ====================
var AdminAuth = {
  _passwordHash: 'h_j4cgjl',

  verify: function() {
    var input = $('admin-password').value;
    if (!input) { showToast('请输入密码'); return; }
    if (_simpleHash(input) === this._passwordHash) {
      $('admin-login').style.display = 'none';
      $('admin-stats-container').style.display = '';
      tracker.renderAdmin();
      showToast('验证成功');
    } else {
      showToast('密码错误');
    }
  }
};

// ==================== 用户统计 ====================
var tracker = {
  TRACK_KEY: 'eq_station_stats_v2',

  init: function() {
    var nickname = localStorage.getItem('eq_nickname');
    if (!nickname) { this.showNicknameModal(); return false; }
    this.recordVisit(nickname);
    return true;
  },

  showNicknameModal: function() {
    $('nickname-modal').style.display = 'flex';
  },

  isNicknameDuplicate: function(name) {
    var currentNick = localStorage.getItem('eq_nickname');
    if (currentNick === name) return false;
    var stats = this.loadStats();
    for (var i = 0; i < stats.length; i++) {
      if (stats[i].nickname === name) return true;
    }
    return false;
  },

  saveNickname: function() {
    var name = $('nickname-input').value.trim();
    if (!name) { showToast('请输入昵称'); return; }
    if (this.isNicknameDuplicate(name)) {
      showToast('昵称"' + name + '"已被使用，请换一个吧！');
      $('nickname-input').value = '';
      $('nickname-input').focus();
      return;
    }
    localStorage.setItem('eq_nickname', name);
    $('nickname-modal').style.display = 'none';
    this.recordVisit(name);
    showToast('欢迎，' + name + '！');
    var homeNickname = $('home-nickname');
    if (homeNickname) homeNickname.textContent = name;
    handleHashRoute();
  },

  recordVisit: function(nickname) {
    var stats = this.loadStats();
    stats.push({
      nickname: nickname,
      action: 'visit',
      time: new Date().toISOString(),
      _hash: this.calcHash(nickname, 'visit', new Date().toISOString())
    });
    this.saveStats(stats);
  },

  recordFeature: function(feature) {
    var nickname = localStorage.getItem('eq_nickname');
    if (!nickname) return;
    var stats = this.loadStats();
    stats.push({
      nickname: nickname,
      action: feature,
      time: new Date().toISOString(),
      _hash: this.calcHash(nickname, feature, new Date().toISOString())
    });
    this.saveStats(stats);
  },

  calcHash: function(nickname, action, time) {
    return _simpleHash(nickname + '|' + action + '|' + time);
  },

  verifyRecord: function(record) {
    if (!record._hash) return false;
    return this.calcHash(record.nickname, record.action, record.time) === record._hash;
  },

  loadStats: function() {
    try {
      var raw = localStorage.getItem(this.TRACK_KEY);
      if (!raw) return [];
      var stats = JSON.parse(raw);
      return stats.filter(function(r) { return tracker.verifyRecord(r); });
    } catch(e) { return []; }
  },

  saveStats: function(stats) {
    if (stats.length > 500) stats = stats.slice(-500);
    localStorage.setItem(this.TRACK_KEY, JSON.stringify(stats));
  },

  renderAdmin: function() {
    var stats = this.loadStats();
    var container = $('admin-stats-content');
    if (!container) container = $('admin-stats-container');
    if (!container) return;

    if (stats.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#999;padding:40px 0;">暂无数据</p>';
      return;
    }
    var totalVisits = stats.filter(function(r) { return r.action === 'visit'; }).length;
    var uniqueUsers = {};
    stats.forEach(function(r) { uniqueUsers[r.nickname] = true; });
    var userCount = Object.keys(uniqueUsers).length;

    var html = '<div class="stats-summary">';
    html += '<div class="stat-card"><div class="stat-number">' + totalVisits + '</div><div class="stat-label">总访问次数</div></div>';
    html += '<div class="stat-card"><div class="stat-number">' + userCount + '</div><div class="stat-label">独立用户</div></div>';
    html += '</div>';

    html += '<div class="stats-section"><h3 style="margin-bottom:16px;font-weight:700;">最近活动</h3><table class="stats-table" style="width:100%;border-collapse:collapse;">';
    html += '<tr style="border-bottom:1px solid #F0E0D8;"><th style="padding:10px;text-align:left;">昵称</th><th style="padding:10px;text-align:left;">操作</th><th style="padding:10px;text-align:left;">时间</th></tr>';
    var recent = stats.slice(-50).reverse();
    recent.forEach(function(r) {
      var timeStr = new Date(r.time).toLocaleString('zh-CN');
      html += '<tr style="border-bottom:1px solid #F0E0D8;"><td style="padding:10px;">' + r.nickname + '</td><td style="padding:10px;">' + r.action + '</td><td style="padding:10px;color:#999;">' + timeStr + '</td></tr>';
    });
    html += '</table></div>';

    container.innerHTML = html;
  }
};

// ==================== 流式 API 调用 ====================
function callLLMStream(systemPrompt, messages, temp, onComplete, onChunk) {
  if (streamState.active) {
    if (streamState.abortController) streamState.abortController.abort();
  }

  streamState.active = true;
  streamState.currentText = '';
  streamState.onComplete = onComplete;

  var controller = new AbortController();
  streamState.abortController = controller;

  // 确保 messages 至少有一条 user message（GLM API 要求）
  var apiMessages = [{ role: 'system', content: systemPrompt }].concat(messages);
  if (apiMessages.length === 1 || apiMessages.every(function(m) { return m.role === 'system'; })) {
    apiMessages.push({ role: 'user', content: '请开始你的回答' });
  }

  fetch(API_CONFIG.baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_CONFIG.apiKey
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      messages: apiMessages,
      temperature: temp || 0.7,
      stream: true
    }),
    signal: controller.signal
  }).then(function(res) {
    if (!res.ok) {
      return res.text().then(function(text) {
        throw new Error('API error: ' + res.status + ' ' + text);
      });
    }

    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var lastUpdate = Date.now();

    function read() {
      return reader.read().then(function(result) {
        if (result.done) {
          streamState.active = false;
          if (onComplete) onComplete(streamState.currentText);
          return;
        }

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop() || '';

        lines.forEach(function(line) {
          if (!line.startsWith('data: ')) return;
          var data = line.substring(6);
          if (data === '[DONE]') return;
          try {
            var json = JSON.parse(data);
            var content = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
            if (content) {
              streamState.currentText += content;
              var now = Date.now();
              if (now - lastUpdate > 80 && onChunk) {
                onChunk(streamState.currentText);
                lastUpdate = now;
              }
            }
          } catch(e) {}
        });

        return read();
      });
    }

    return read();
  }).catch(function(err) {
    if (err.name !== 'AbortError') {
      console.error('API call failed:', err);
      showToast('服务响应异常，请稍后重试');
    }
    streamState.active = false;
    if (onComplete) onComplete(streamState.currentText || '\uFF08服务响应异常，请稍后重试\uFF09');
  });
}

// ==================== 解析 PK 模式 URL 参数 ====================
function parsePKHash() {
  var hash = window.location.hash;
  var result = { mode: null, sideA: null, sideB: null };
  if (hash.includes('mode=pk')) result.mode = 'pk';
  if (hash.includes('sideA=')) {
    var match = hash.match(/sideA=([^&]+)/);
    if (match) result.sideA = decodeData(match[1]);
  }
  if (hash.includes('sideB=')) {
    var match2 = hash.match(/sideB=([^&]+)/);
    if (match2) result.sideB = decodeData(match2[1]);
  }
  return result;
}

// ==================== App 对象 ====================
var App = {
  // ------ 页面切换 -----
  showPage: function(page) {
    var pages = ['home', 'single', 'pk', 'admin'];
    pages.forEach(function(p) {
      var el = $(p + '-page');
      if (el) el.classList.remove('active');
    });
    var target = $(page + '-page');
    if (target) target.classList.add('active');
    state.currentMode = page;

    if (page === 'single') this.resetSingleMode();
    if (page === 'pk') this.startPKMode();
  },

  // ==================== 单人模式 ====================
  resetSingleMode: function() {
    state.single = {
      name: '',
      messages: [],
      infoComplete: false,
      summary: '',
      mentorCommentaries: {},
      viewedMentors: new Set(),
      currentMentor: null,
      advice: null
    };

    $('single-step-chat').style.display = '';
    $('single-step-mentors').style.display = 'none';
    $('single-chat-messages').innerHTML = '';
    $('single-input').value = '';

    var name = localStorage.getItem('eq_nickname') || '朋友';
    state.single.name = name;

    var welcomeMsg = '你好呀，' + name + '！我是感情急诊事务所的接待员\n\n别紧张，就当跟朋友聊天一样。跟我说说，你遇到了什么感情问题？';
    state.single.messages.push({ role: 'assistant', content: welcomeMsg });
    this.renderSingleMessages();
    tracker.recordFeature('single_mode');
  },

  renderSingleMessages: function() {
    var container = $('single-chat-messages');
    if (!container) return;
    var html = '';
    state.single.messages.forEach(function(m) {
      var cls = m.role === 'user' ? 'message user' : 'message ai';
      html += '<div class="' + cls + '">' + formatContent(m.content) + '</div>';
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  },

  sendSingleMessage: function() {
    var input = $('single-input');
    var text = input.value.trim();
    if (!text || streamState.active) return;
    input.value = '';

    state.single.messages.push({ role: 'user', content: text });
    this.renderSingleMessages();

    state.single.messages.push({ role: 'assistant', content: '' });
    this.renderSingleMessages();

    var apiMessages = state.single.messages
      .filter(function(m) { return m.role === 'user' || (m.role === 'assistant' && m.content); })
      .map(function(m) { return { role: m.role, content: m.content }; });

    var systemPrompt = SYSTEM_PROMPTS.intake;
    var self = this;
    callLLMStream(systemPrompt, apiMessages, 0.7, function(fullText) {
      state.single.messages[state.single.messages.length - 1].content = fullText;

      var completeMatch = fullText.match(/\[COMPLETE\]\s*([\s\S]*)/);
      if (completeMatch) {
        var summary = completeMatch[1].trim();
        state.single.summary = summary;
        state.single.infoComplete = true;
        state.single.messages[state.single.messages.length - 1].content = '信息收集完成！四位导师已经准备好为你点评了。';
        self.renderSingleMessages();

        $('single-step-chat').style.display = 'none';
        $('single-step-mentors').style.display = '';
        $('single-summary').innerHTML = formatContent(summary);
        self.renderMentorButtons('single');
        self.updateProgress('single');
        showToast('信息收集完成！请选择导师点评');
      } else {
        self.renderSingleMessages();
      }
    }, function(curText) {
      var container = $('single-chat-messages');
      if (!container) return;
      var lastAi = container.querySelector('.message.ai:last-of-type');
      if (lastAi) {
        lastAi.innerHTML = formatContent(curText) + '<span class="cursor-blink">\u258C</span>';
        container.scrollTop = container.scrollHeight;
      }
    });
  },

  // ==================== PK模式 ====================
  startPKMode: function() {
    state.pk = {
      sideA: { name: '男生', messages: [], infoComplete: false, summary: '' },
      sideB: { name: '女生', messages: [], infoComplete: false, summary: '' },
      bothSubmitted: false,
      resultShareUrl: null,
      mentorCommentaries: {},
      viewedMentors: new Set(),
      currentMentor: null,
      advice: null
    };

    $('pk-step-a').style.display = '';
    $('pk-a-chat-messages').innerHTML = '';
    $('pk-a-input').value = '';
    $('pk-a-input-bar').style.display = '';
    $('pk-a-share-section').style.display = 'none';
    $('pk-step-b').style.display = 'none';
    $('pk-b-chat-messages').innerHTML = '';
    $('pk-b-input').value = '';
    $('pk-b-input-bar').style.display = '';
    $('pk-step-combined').style.display = 'none';

    var welcomeMsg = '你好！我是感情急诊事务所的接待员\n\n别紧张，就当跟朋友聊天一样。跟我说说，你和对方之间发生了什么事？';
    state.pk.sideA.messages.push({ role: 'assistant', content: welcomeMsg });
    this.renderPKSideAMessages();
    tracker.recordFeature('pk_mode');
  },

  renderPKSideAMessages: function() {
    var container = $('pk-a-chat-messages');
    if (!container) return;
    var html = '';
    state.pk.sideA.messages.forEach(function(m) {
      var cls = m.role === 'user' ? 'message user' : 'message ai';
      html += '<div class="' + cls + '">' + formatContent(m.content) + '</div>';
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  },

  sendPKSideAMessage: function() {
    var input = $('pk-a-input');
    var text = input.value.trim();
    if (!text || streamState.active) return;
    input.value = '';

    state.pk.sideA.messages.push({ role: 'user', content: text });
    this.renderPKSideAMessages();

    state.pk.sideA.messages.push({ role: 'assistant', content: '' });
    this.renderPKSideAMessages();

    var apiMessages = state.pk.sideA.messages
      .filter(function(m) { return m.role === 'user' || (m.role === 'assistant' && m.content); })
      .map(function(m) { return { role: m.role, content: m.content }; });

    var systemPrompt = SYSTEM_PROMPTS.pkIntakeA;
    var self = this;
    callLLMStream(systemPrompt, apiMessages, 0.7, function(fullText) {
      state.pk.sideA.messages[state.pk.sideA.messages.length - 1].content = fullText;

      var completeMatch = fullText.match(/\[COMPLETE\]\s*([\s\S]*)/);
      if (completeMatch) {
        var summary = completeMatch[1].trim();
        state.pk.sideA.summary = summary;
        state.pk.sideA.infoComplete = true;
        state.pk.sideA.messages[state.pk.sideA.messages.length - 1].content = '你的陈述已完成！接下来请让对方也来陈述Ta的视角。';
        self.renderPKSideAMessages();

        $('pk-a-input-bar').style.display = 'none';
        $('pk-a-share-section').style.display = '';

        var shareData = { name: state.pk.sideA.name, summary: state.pk.sideA.summary };
        var encoded = encodeData(shareData);
        var baseUrl = window.location.href.split('#')[0];
        var shareUrl = baseUrl + '#mode=pk&sideA=' + encoded;
        state.pk.resultShareUrl = shareUrl;
        $('pk-link-url').value = shareUrl;

        showToast('陈述完成！请分享链接给对方或切换到对方填写');
      } else {
        self.renderPKSideAMessages();
      }
    }, function(curText) {
      var container = $('pk-a-chat-messages');
      if (!container) return;
      var lastAi = container.querySelector('.message.ai:last-of-type');
      if (lastAi) {
        lastAi.innerHTML = formatContent(curText) + '<span class="cursor-blink">\u258C</span>';
        container.scrollTop = container.scrollHeight;
      }
    });
  },

  copyShareLink: function() {
    var linkInput = $('pk-link-url');
    if (!linkInput || !linkInput.value) return;
    // 复制时附带简短说明，让链接不那么像乱码
    var shareText = '【感情急诊事务所】我已陈述完毕，请你也来说说你的视角：\n' + linkInput.value;
    copyToClipboard(shareText);
    showToast('链接已复制！发给对方即可');
  },

  // ------ 同一设备：在当前页面下方继续女生方填写 -----
  // ------ 切换到对方填写 / 对方通过链接进入后点击开始陈述 -----
  showPKSideB: function() {
    // 隐藏甲方分享区域（含查看结果按钮）
    $('pk-a-share-section').style.display = 'none';
    $('pk-step-b').style.display = '';

    $('pk-side-a-display').innerHTML =
      '<div style="font-weight:700;color:#FF6B6B;margin-bottom:8px;">男生的陈述</div>' +
      '<div>' + formatContent(state.pk.sideA.summary) + '</div>';

    state.pk.sideB.name = '女生';
    state.pk.sideB.messages = [];
    state.pk.sideB.infoComplete = false;

    var systemPrompt = SYSTEM_PROMPTS.pkIntakeB
      .replace(/\{\{sideASummary\}\}/g, state.pk.sideA.summary);

    var welcomeMsg = '你好！我是感情急诊事务所的接待员\n\n';
    welcomeMsg += '我已经看过对方的陈述了。\n\n';
    welcomeMsg += '现在我想听听你的视角。跟我说说，从你的角度，这件事是怎么发生的？你有什么感受？';

    state.pk.sideB.messages.push({ role: 'assistant', content: welcomeMsg });
    this.renderPKSideBMessages();

    $('pk-step-b').scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  // ------ 女生方通过链接进入（备用入口，handleHashRoute 已直接调用 showPKSideB） -----
  startPKSideBFromLink: function() {
    var pkData = parsePKHash();
    if (!pkData.sideA) {
      showToast('无法读取对方数据，请检查链接');
      return;
    }

    // 兼容精简数据（无 messages 字段）
    state.pk.sideA = {
      name: pkData.sideA.name || '男生',
      summary: pkData.sideA.summary,
      messages: pkData.sideA.messages || [],
      infoComplete: true
    };
    state.pk.sideB = { name: '女生', messages: [], infoComplete: false, summary: '' };

    // 直接切换到乙方陈述模式
    $('pk-step-a').style.display = 'none';
    $('pk-a-input-bar').style.display = 'none';
    $('pk-a-share-section').style.display = 'none';
    $('pk-step-b').style.display = '';

    // 展示甲方摘要
    $('pk-side-a-display').innerHTML =
      '<div style="font-weight:700;color:#FF6B6B;margin-bottom:8px;">男生的陈述</div>' +
      '<div>' + formatContent(pkData.sideA.summary) + '</div>';

    var systemPrompt = SYSTEM_PROMPTS.pkIntakeB
      .replace(/\{\{sideASummary\}\}/g, pkData.sideA.summary);

    var welcomeMsg = '你好！我是感情急诊事务所的接待员\n\n';
    welcomeMsg += '我已经看过对方的陈述了。\n\n';
    welcomeMsg += '现在我想听听你的视角。跟我说说，从你的角度，这件事是怎么发生的？你有什么感受？';

    state.pk.sideB.messages.push({ role: 'assistant', content: welcomeMsg });
    this.renderPKSideBMessages();

    tracker.recordFeature('pk_side_b');
  },

  renderPKSideBMessages: function() {
    var container = $('pk-b-chat-messages');
    if (!container) return;
    var html = '';
    state.pk.sideB.messages.forEach(function(m) {
      var cls = m.role === 'user' ? 'message user' : 'message ai';
      html += '<div class="' + cls + '">' + formatContent(m.content) + '</div>';
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  },

  sendPKSideBMessage: function() {
    var input = $('pk-b-input');
    var text = input.value.trim();
    if (!text || streamState.active) return;
    input.value = '';

    state.pk.sideB.messages.push({ role: 'user', content: text });
    this.renderPKSideBMessages();

    state.pk.sideB.messages.push({ role: 'assistant', content: '' });
    this.renderPKSideBMessages();

    var apiMessages = state.pk.sideB.messages
      .filter(function(m) { return m.role === 'user' || (m.role === 'assistant' && m.content); })
      .map(function(m) { return { role: m.role, content: m.content }; });

    var systemPrompt = SYSTEM_PROMPTS.pkIntakeB
      .replace(/\{\{sideASummary\}\}/g, state.pk.sideA.summary);

    var self = this;
    callLLMStream(systemPrompt, apiMessages, 0.7, function(fullText) {
      state.pk.sideB.messages[state.pk.sideB.messages.length - 1].content = fullText;

      var completeMatch = fullText.match(/\[COMPLETE\]\s*([\s\S]*)/);
      if (completeMatch) {
        var summary = completeMatch[1].trim();
        state.pk.sideB.summary = summary;
        state.pk.sideB.infoComplete = true;
        state.pk.bothSubmitted = true;
        state.pk.sideB.messages[state.pk.sideB.messages.length - 1].content = '双方陈述已完成！四位导师已经准备好点评了。';
        self.renderPKSideBMessages();

        $('pk-b-input-bar').style.display = 'none';

        // 生成结果链接，更新URL（只编码摘要，缩短链接）
        var baseUrl = window.location.href.split('#')[0];
        var sideACompact = { name: state.pk.sideA.name, summary: state.pk.sideA.summary };
        var sideBCompact = { name: state.pk.sideB.name, summary: state.pk.sideB.summary };
        var resultHash = 'mode=pk&sideA=' + encodeData(sideACompact) + '&sideB=' + encodeData(sideBCompact);
        var resultUrl = baseUrl + '#' + resultHash;
        state.pk.resultShareUrl = resultUrl;

        history.replaceState(null, '', '#' + resultHash);

        // 直接显示综合结果
        self.showPKCombined();
        showToast('双方陈述已提交！四位导师已准备就绪。');
      } else {
        self.renderPKSideBMessages();
      }
    }, function(curText) {
      var container = $('pk-b-chat-messages');
      if (!container) return;
      var lastAi = container.querySelector('.message.ai:last-of-type');
      if (lastAi) {
        lastAi.innerHTML = formatContent(curText) + '<span class="cursor-blink">\u258C</span>';
        container.scrollTop = container.scrollHeight;
      }
    });
  },

  // ------ 显示双方陈述 + 导师点评 -----
  showPKCombined: function() {
    $('pk-step-a').style.display = 'none';
    $('pk-step-b').style.display = 'none';
    $('pk-step-combined').style.display = '';

    var a = state.pk.sideA;
    var b = state.pk.sideB;

    $('pk-both-sides').innerHTML =
      '<div class="side-block side-a">' +
        '<div class="side-block-name">' + (a.name || '男生') + '</div>' +
        '<div>' + formatContent(a.summary) + '</div>' +
      '</div>' +
      '<div class="side-block side-b">' +
        '<div class="side-block-name">' + (b.name || '女生') + '</div>' +
        '<div>' + formatContent(b.summary) + '</div>' +
      '</div>';

    this.renderMentorButtons('pk');
    this.updateProgress('pk');

    if (state.pk.resultShareUrl) {
      $('pk-result-section').style.display = '';
      $('pk-result-link').value = state.pk.resultShareUrl;
    }

    // 如果已有导师评价数据（刷新恢复场景），恢复展示
    if (state.pk.viewedMentors.size > 0) {
      Object.keys(state.pk.mentorCommentaries).forEach(function(key) {
        App.displayMentorCommentary('pk', key, state.pk.mentorCommentaries[key]);
      });
    }

    if (state.pk.viewedMentors.size === 4) {
      $('pk-advice-section').style.display = '';
      if (state.pk.advice) {
        App.displayAdvice('pk', state.pk.advice);
      }
    }
  },

  copyResultLink: function() {
    var linkInput = $('pk-result-link');
    if (!linkInput || !linkInput.value) {
      showToast('暂无结果链接，请先完成双方陈述');
      return;
    }
    // 复制时附带简短说明
    var shareText = '【感情急诊事务所】双方陈述已完成，导师已给出点评，点击查看：\n' + linkInput.value;
    copyToClipboard(shareText);
    showToast('结果链接已复制！发给对方即可查看导师点评');
  },

  resetPKMode: function() {
    this.showPage('pk');
  },

  // ==================== 导师点评 ====================
  renderMentorButtons: function(mode) {
    var container = $(mode + '-mentor-btns');
    if (!container) return;
    var html = '';
    Object.keys(MENTORS).forEach(function(key) {
      var m = MENTORS[key];
      html += '<button class="mentor-btn" style="--mc:var(--mentor-' + key.substring(0,1) + ')" onclick="App.selectMentor(\'' + mode + '\', \'' + key + '\')">';
      html += '<div class="mentor-btn-avatar">';
      html += '<img src="' + m.avatar + '" alt="' + m.name + '" class="mentor-avatar-img" onerror="this.parentElement.style.background=\'#f0f0f0\'">';
      html += '</div>';
      html += '<span class="mentor-btn-name">' + m.name + '</span>';
      html += '<span class="mentor-btn-role">' + m.title + '</span>';
      html += '</button>';
    });
    container.innerHTML = html;
  },

  selectMentor: function(mode, mentorKey) {
    var s = mode === 'single' ? state.single : state.pk;

    if (s.mentorCommentaries[mentorKey]) {
      this.displayMentorCommentary(mode, mentorKey, s.mentorCommentaries[mentorKey]);
      return;
    }

    var mentor = MENTORS[mentorKey];
    var prompt;

    if (mode === 'pk') {
      prompt = SYSTEM_PROMPTS.mentorPK(mentor.name, mentor, state.pk.sideA.summary, state.pk.sideB.summary);
    } else {
      prompt = SYSTEM_PROMPTS.mentor(mentor.name, mentor)
        .replace(/\{\{summary\}\}/g, s.summary);
    }

    var displayId = mode + '-mentor-display';
    var container = $(displayId);
    if (!container) return;

    // 创建带头像的卡片结构（无emoji，仅头像）
    container.innerHTML = '<div class="mentor-card" style="--mc:var(--mentor-' + mentorKey.substring(0,1) + ')">' +
      '<div class="mentor-card-header">' +
        '<div class="mentor-card-avatar">' +
          '<img src="' + mentor.avatar + '" alt="' + mentor.name + '" class="mentor-card-avatar-img" onerror="this.parentElement.style.background=\'#f0f0f0\'">' +
        '</div>' +
        '<div class="mentor-card-info"><div class="mentor-card-name">' + mentor.name + '</div><div class="mentor-card-role">' + mentor.title + '</div></div>' +
      '</div>' +
      '<div class="mentor-card-body" id="' + mode + '-mentor-streaming-body">' +
        '<div class="loading-dots"><span></span><span></span><span></span></div>' +
        '<div class="loading-text">' + mentor.name + ' 正在思考...</div>' +
      '</div>' +
    '</div>';

    var btns = $(mode + '-mentor-btns').querySelectorAll('.mentor-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    var clickedBtn = null;
    btns.forEach(function(b) {
      if (b.getAttribute('onclick') && b.getAttribute('onclick').indexOf(mentorKey) >= 0) {
        clickedBtn = b;
        b.classList.add('active');
      }
    });

    var self = this;
    callLLMStream(prompt, [{ role: 'user', content: mode === 'pk' ? '请分别给男生和女生给出你的专业点评和建议' : '请针对以上矛盾描述，给出你的专业点评和建议' }], 0.8, function(fullText) {
      s.mentorCommentaries[mentorKey] = fullText;
      s.viewedMentors.add(mentorKey);
      if (clickedBtn) clickedBtn.classList.add('viewed');
      self.updateProgress(mode);
      self.displayMentorCommentary(mode, mentorKey, fullText);

      if (s.viewedMentors.size === 4) {
        $(mode + '-advice-section').style.display = '';
      }
    }, function(curText) {
      var bodyEl = $(mode + '-mentor-streaming-body');
      if (bodyEl) {
        bodyEl.innerHTML = formatContent(curText) + '<span class="cursor-blink">\u258C</span>';
      }
    });
  },

  displayMentorCommentary: function(mode, mentorKey, text) {
    var displayId = mode + '-mentor-display';
    var container = $(displayId);
    if (!container) return;
    var mentor = MENTORS[mentorKey];

    if (mode === 'pk') {
      // PK模式：解析拆分建议，分别展示给男生和女生
      var split = parseSplitAdvice(text);
      container.innerHTML = '<div class="mentor-card" style="--mc:var(--mentor-' + mentorKey.substring(0,1) + ')">' +
        '<div class="mentor-card-header">' +
          '<div class="mentor-card-avatar">' +
            '<img src="' + mentor.avatar + '" alt="' + mentor.name + '" class="mentor-card-avatar-img" onerror="this.parentElement.style.background=\'#f0f0f0\'">' +
          '</div>' +
          '<div class="mentor-card-info"><div class="mentor-card-name">' + mentor.name + '</div><div class="mentor-card-role">' + mentor.title + '</div></div>' +
        '</div>' +
        '<div class="mentor-card-body">' +
          '<div class="split-advice-section side-male-section">' +
            '<div class="split-advice-label">致男生</div>' +
            '<div class="split-advice-content">' + formatContent(split.male) + '</div>' +
          '</div>' +
          '<div class="split-advice-section side-female-section">' +
            '<div class="split-advice-label">致女生</div>' +
            '<div class="split-advice-content">' + formatContent(split.female) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    } else {
      // 单人模式：整体展示（无emoji，仅头像）
      container.innerHTML = '<div class="mentor-card" style="--mc:var(--mentor-' + mentorKey.substring(0,1) + ')">' +
        '<div class="mentor-card-header">' +
          '<div class="mentor-card-avatar">' +
            '<img src="' + mentor.avatar + '" alt="' + mentor.name + '" class="mentor-card-avatar-img" onerror="this.parentElement.style.background=\'#f0f0f0\'">' +
          '</div>' +
          '<div class="mentor-card-info"><div class="mentor-card-name">' + mentor.name + '</div><div class="mentor-card-role">' + mentor.title + '</div></div>' +
        '</div>' +
        '<div class="mentor-card-body">' + formatContent(text) + '</div>' +
      '</div>';
    }
  },

  updateProgress: function(mode) {
    var s = mode === 'single' ? state.single : state.pk;
    var viewed = s.viewedMentors ? s.viewedMentors.size : 0;
    var progressEl = $(mode + '-progress');
    if (progressEl) progressEl.textContent = viewed + '/4';
  },

  getComprehensiveAdvice: function(mode) {
    var s = mode === 'single' ? state.single : state.pk;

    if (s.advice) {
      this.displayAdvice(mode, s.advice);
      return;
    }

    var mentorAdvices = '';
    Object.keys(MENTORS).forEach(function(key) {
      mentorAdvices += '\u3010' + MENTORS[key].name + '\u3011\n' + s.mentorCommentaries[key] + '\n\n';
    });

    var prompt;
    if (mode === 'pk') {
      prompt = SYSTEM_PROMPTS.comprehensivePK
        .replace(/\{\{sideASummary\}\}/g, state.pk.sideA.summary)
        .replace(/\{\{sideBSummary\}\}/g, state.pk.sideB.summary)
        .replace(/\{\{mentorAdvices\}\}/g, mentorAdvices);
    } else {
      prompt = SYSTEM_PROMPTS.comprehensive.replace(/\{\{mentorAdvices\}\}/g, mentorAdvices);
    }

    var contentEl = $(mode + '-advice-content');
    if (!contentEl) return;
    contentEl.style.display = '';

    contentEl.innerHTML = '<div class="advice-content" id="' + mode + '-advice-streaming-body">' +
      '<div class="loading-dots"><span></span><span></span><span></span></div>' +
      '<div class="loading-text">正在生成综合建议...</div>' +
    '</div>';

    var self = this;
    callLLMStream(prompt, [{ role: 'user', content: mode === 'pk' ? '请分别给男生和女生生成综合建议报告' : '请基于以上四位导师的建议，生成一份综合建议报告' }], 0.8, function(fullText) {
      s.advice = fullText;
      self.displayAdvice(mode, fullText);
      var btn = $(mode + '-advice-btn');
      if (btn) btn.style.display = 'none';
    }, function(curText) {
      var bodyEl = $(mode + '-advice-streaming-body');
      if (bodyEl) {
        bodyEl.innerHTML = formatContent(curText) + '<span class="cursor-blink">\u258C</span>';
      }
    });
  },

  displayAdvice: function(mode, text) {
    var contentEl = $(mode + '-advice-content');
    if (!contentEl) return;
    contentEl.style.display = '';

    if (mode === 'pk') {
      // PK模式：解析拆分建议
      var split = parseSplitAdvice(text);
      contentEl.innerHTML = '<div class="advice-content">' +
        '<div class="split-advice-section side-male-section">' +
          '<div class="split-advice-label">致男生</div>' +
          '<div class="split-advice-content">' + formatContent(split.male) + '</div>' +
        '</div>' +
        '<div class="split-advice-section side-female-section">' +
          '<div class="split-advice-label">致女生</div>' +
          '<div class="split-advice-content">' + formatContent(split.female) + '</div>' +
        '</div>' +
      '</div>';
    } else {
      contentEl.innerHTML = '<div class="advice-content">' + formatContent(text) + '</div>';
    }
  },

  // ==================== 下载处方（PDF） ====================
  downloadPrescription: function(mode) {
    var s = mode === 'single' ? state.single : state.pk;
    var now = new Date().toLocaleString('zh-CN');

    // 构建处方HTML
    var htmlContent = this._buildPrescriptionHTML(mode, s, now);

    // 在新窗口打开处方网页
    var win = window.open('', '_blank');
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      showToast('处方已生成，请在新窗口中查看');
    } else {
      showToast('请允许弹出窗口以查看处方');
    }
  },

  // ------ 构建处方HTML内容（精美排版，图文并茂） -----
  _buildPrescriptionHTML: function(mode, s, now) {
    var html = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">';
    html += '<meta name="viewport" content="width=device-width,initial-scale=1">';
    html += '<title>感情急诊事务所 - 情感处方</title>';
    html += '<style>';

    // ===== Reset & Base =====
    html += '*{margin:0;padding:0;box-sizing:border-box;}';
    html += 'html{font-size:16px;}';
    html += 'body{font-family:"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:#2D2D2D;line-height:1.8;background:#F5F3F0;min-height:100vh;padding:0;}';
    html += '.page{max-width:720px;margin:0 auto;background:#fff;overflow:hidden;}';

    // ===== Header / 处方单头部 =====
    html += '.rx-header{background:linear-gradient(135deg,#FF6B6B 0%,#ee5a5a 50%,#d94a4a 100%);padding:36px 28px 26px;text-align:center;color:#fff;position:relative;overflow:hidden;}';
    html += '.rx-header::before{content:"";position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.08);}';
    html += '.rx-header::after{content:"";position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.05);}';
    html += '.rx-header-icon{font-size:36px;margin-bottom:4px;letter-spacing:4px;}';
    html += '.rx-title{font-size:26px;font-weight:900;letter-spacing:6px;text-shadow:0 2px 8px rgba(0,0,0,0.15);margin-bottom:4px;}';
    html += '.rx-subtitle{font-size:12px;opacity:0.85;letter-spacing:1px;font-weight:400;}';
    html += '.rx-meta{display:flex;justify-content:center;gap:16px;margin-top:12px;font-size:11px;opacity:0.75;flex-wrap:wrap;}';
    html += '.rx-meta span{background:rgba(255,255,255,0.18);padding:3px 10px;border-radius:20px;}';

    // ===== 处方信息条 =====
    html += '.rx-info-bar{display:flex;justify-content:space-between;align-items:center;padding:10px 28px;background:#FAFAFA;border-bottom:1px solid #EFEFEF;font-size:11px;color:#999;flex-wrap:wrap;gap:6px;}';
    html += '.rx-info-item{display:flex;align-items:center;gap:5px;}';
    html += '.rx-info-dot{width:6px;height:6px;border-radius:50%;background:#FF6B6B;display:inline-block;}';

    // ===== Section 通用样式 =====
    html += '.section{margin:0;padding:22px 28px;border-bottom:1px solid #F5F5F5;}';
    html += '.section:last-child{border-bottom:none;}';
    html += '.section-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;}';
    html += '.section-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;flex-shrink:0;}';
    html += '.section-icon.icon-case{background:linear-gradient(135deg,#FF6B6B,#ff8e8e);}';
    html += '.section-icon.icon-mentor{background:linear-gradient(135deg,#667eea,#764ba2);}';
    html += '.section-icon.icon-advice{background:linear-gradient(135deg,#11998e,#38ef7d);}';
    html += '.section-title-text{font-size:17px;font-weight:800;color:#333;}';
    html += '.section-desc{font-size:11px;color:#aaa;margin-left:auto;}';

    // ===== 情况梳理区 =====
    html += '.case-box{background:#FFF9F9;border:1px solid #FFE8E8;border-radius:10px;overflow:hidden;}';
    html += '.case-box-pk{display:flex;flex-direction:column;gap:10px;}';
    html += '.case-side{padding:14px 16px;border-radius:8px;}';
    html += '.case-side-male{background:#FFF5F5;border-left:4px solid #FF6B6B;}';
    html += '.case-side-female{background:#F5F8FF;border-left:4px solid #5B9BD5;}';
    html += '.case-side-label{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:800;margin-bottom:6px;}';
    html += '.case-side-male .case-side-label{color:#E85555;}';
    html += '.case-side-female .case-side-label{color:#4A85C9;}';
    html += '.case-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;padding:2px 8px;border-radius:10px;font-weight:600;}';
    html += '.case-badge-male{background:#FFF0F0;color:#E85555;border:1px solid #FFDADA;}';
    html += '.case-badge-female{background:#EEF2FF;color:#4A85C9;border:1px solid #D0DDF5;}';
    html += '.case-body{font-size:13.5px;color:#555;line-height:1.9;}';

    // ===== 导师建议卡片 =====
    html += '.mentor-grid{display:flex;flex-direction:column;gap:16px;}';
    html += '.mentor-card{border:1.5px solid #F0EAE4;border-radius:14px;overflow:hidden;background:#fff;}';
    // 导师头部
    html += '.mc-top{display:flex;align-items:center;gap:12px;padding:14px 16px 10px;border-bottom:1px dashed #F0EBE6;}';
    html += '.mc-avatar-wrap{position:relative;flex-shrink:0;}';
    html += '.mc-avatar{width:48px;height:48px;border-radius:12px;object-fit:cover;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.1);display:block;}';
    html += '.mc-avatar-ring{position:absolute;top:-3px;left:-3px;width:54px;height:54px;border-radius:14px;border:2px solid transparent;z-index:-1;}';
    html += '.mc-avatar-ring.dq{border-color:#FFE0D0;}';
    html += '.mc-avatar-ring.tl{border-color:#E0ECFF;}';
    html += '.mc-avatar-ring.ls{border-color:#E0FFE0;}';
    html += '.mc-avatar-ring.fh{border-color:#FFF0D0;}';
    html += '.mc-name-row{display:flex;flex-direction:column;gap:2px;}';
    html += '.mc-name{font-size:16px;font-weight:800;color:#333;}';
    html += '.mc-role{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:1px 8px;border-radius:10px;width:fit-content;}';
    html += '.mc-role-dq{color:#D4765A;background:#FFF3ED;}';
    html += '.mc-role-tl{color:#4A6BB3;background:#EDF2FF;}';
    html += '.mc-role-ls{color:#3D8B5C;background:#EDFFF5;}';
    html += '.mc-role-fh{color:#B89A3D;background:#FFFBE8;}';
    // 导师内容体
    html += '.mc-body{padding:12px 16px 14px;}';
    // PK拆分内容
    html += '.mc-split{display:flex;flex-direction:column;gap:8px;}';
    html += '.mc-split-item{padding:10px 12px;border-radius:8px;}';
    html += '.mc-split-male{background:#FFFBFB;border:1px solid #FFEDED;}';
    html += '.mc-split-female{background:#F9FCFF;border:1px solid #EDF3FF;}';
    html += '.mc-split-label{font-size:11px;font-weight:800;margin-bottom:4px;display:flex;align-items:center;gap:4px;}';
    html += '.mc-split-male .mc-split-label{color:#E85555;}';
    html += '.mc-split-female .mc-split-label{color:#4A85C9;}';
    html += '.mc-split-text{font-size:13px;color:#444;line-height:1.85;}';
    // 单人模式内容
    html += '.mc-single-text{font-size:13px;color:#444;line-height:1.85;}';

    // ===== 综合建议区域 =====
    html += '.advice-box{background:linear-gradient(135deg,#f8f6ff,#f0ecff);border:1.5px solid #e8e0f8;border-radius:14px;overflow:hidden;}';
    html += '.advice-top{display:flex;align-items:center;gap:10px;padding:14px 18px 10px;border-bottom:1px dashed #ddd8ef;}';
    html += '.advice-top-icon{font-size:22px;}';
    html += '.advice-top-title{font-size:17px;font-weight:800;color:#5568D3;}';
    html += '.advice-top-desc{font-size:11px;color:#999;margin-left:auto;}';
    html += '.advice-body{padding:14px 18px;}';
    // PK综合建议拆分
    html += '.adv-split{display:flex;flex-direction:column;gap:10px;}';
    html += '.adv-split-item{padding:12px 14px;border-radius:10px;}';
    html += '.adv-split-male{background:#FFFBFB;border-left:4px solid #FF6B6B;}';
    html += '.adv-split-female{background:#F9FCFF;border-left:4px solid #5B9BD5;}';
    html += '.adv-split-label{font-size:13px;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:6px;}';
    html += '.adv-split-male .adv-split-label{color:#E85555;}';
    html += '.adv-split-female .adv-split-label{color:#4A85C9;}';
    html += '.adv-split-text{font-size:13.5px;color:#444;line-height:1.9;}';
    // 单人模式综合建议
    html += '.adv-single-text{font-size:13.5px;color:#333;line-height:1.9;}';

    // ===== Footer =====
    html += '.rx-footer{text-align:center;padding:24px 28px 28px;background:#FAFAFA;border-top:1px solid #EEE;}';
    html += '.rx-footer-line1{display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:700;color:#FF6B6B;margin-bottom:6px;letter-spacing:2px;}';
    html += '.rx-footer-line2{font-size:10.5px;color:#bbb;}';
    html += '.rx-footer-divider{width:40px;height:2px;background:#FFD0D0;border-radius:1px;display:block;}';

    // ===== 分隔装饰 =====
    html += '.divider-deco{text-align:center;padding:8px 0;color:#DDD;font-size:12px;letter-spacing:8px;}';

    // ===== 响应式适配 =====
    html += '@media(max-width:480px){';
    html += '.rx-header{padding:24px 18px 20px;}';
    html += '.rx-title{font-size:20px;letter-spacing:3px;}';
    html += '.section{padding:16px 18px;}';
    html += '.case-side{padding:10px 12px;}';
    html += '.mc-avatar{width:40px;height:40px;}';
    html += '.mc-avatar-ring{width:46px;height:46px;}';
    html += '.mc-top{gap:10px;padding:12px 14px 8px;}';
    html += '.mc-body{padding:10px 14px 12px;}';
    html += '.advice-top{padding:12px 16px 8px;}';
    html += '.advice-body{padding:12px 16px;}';
    html += '}';

    // ===== Print 优化 =====
    html += '@media print{body{background:#fff;} .page{max-width:100%;} .section,.mentor-card,.advice-box,.case-side{page-break-inside:avoid;} body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}';

    html += '</style></head><body>';
    html += '<div class="page">';

    // ========== 头部 ==========
    html += '<div class="rx-header">';
    html += '<div class="rx-header-icon">💊</div>';
    html += '<div class="rx-title">感情急诊事务所</div>';
    html += '<div class="rx-subtitle">EMOTIONAL EMERGENCY PRESCRIPTION</div>';
    html += '<div class="rx-meta">';
    html += '<span>' + now + '</span>';
    html += '<span>' + (mode === 'pk' ? '双人PK · 双方陈述' : '单人咨询') + '</span>';
    html += '</div></div>';

    // ========== 处方信息条 ==========
    html += '<div class="rx-info-bar">';
    html += '<span class="rx-info-item"><span class="rx-info-dot"></span>处方编号：RX-' + Date.now().toString(36).toUpperCase() + '</span>';
    html += '<span class="rx-info-item">感情急诊事务所</span>';
    html += '</div>';

    // ========== 一、基本情况梳理 ==========
    html += '<div class="section">';
    html += '<div class="section-header">';
    html += '<div class="section-icon icon-case">📋</div>';
    html += '<span class="section-title-text">事件概要</span>';
    html += '<span class="section-desc">基本情况梳理</span>';
    html += '</div>';
    if (mode === 'single') {
      html += '<div class="case-box"><div class="case-body" style="padding:14px 16px;">' + formatContent(s.summary) + '</div></div>';
    } else {
      html += '<div class="case-box case-box-pk">';
      html += '<div class="case-side case-side-male">';
      html += '<div class="case-side-label"><span class="case-badge case-badge-male">男生视角</span>男生的陈述</div>';
      html += '<div class="case-body">' + formatContent(state.pk.sideA.summary) + '</div>';
      html += '</div>';
      html += '<div class="case-side case-side-female">';
      html += '<div class="case-side-label"><span class="case-badge case-badge-female">女生视角</span>女生的陈述</div>';
      html += '<div class="case-body">' + formatContent(state.pk.sideB.summary) + '</div>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';

    // ========== 二、四位导师建议 ==========
    html += '<div class="section">';
    html += '<div class="section-header">';
    html += '<div class="section-icon icon-mentor">👥</div>';
    html += '<span class="section-title-text">四位导师点评</span>';
    html += '<span class="section-desc">多维视角分析</span>';
    html += '</div>';
    html += '<div class="mentor-grid">';

    // 导师颜色映射
    var mentorColors = {
      dongqing: 'dq',
      tulei: 'tl',
      luosang: 'ls',
      fuhang: 'fh'
    };
    var roleLabels = {
      dongqing: { text: '心理学家', cls: 'dq' },
      tulei: { text: '社会学家', cls: 'tl' },
      luosang: { text: '专业律师', cls: 'ls' },
      fuhang: { text: '搞笑担当', cls: 'fh' }
    };

    Object.keys(MENTORS).forEach(function(key) {
      if (s.mentorCommentaries[key]) {
        var m = MENTORS[key];
        var colorKey = mentorColors[key];
        var rl = roleLabels[key];

        html += '<div class="mentor-card">';
        // 卡片顶部：头像+姓名+身份
        html += '<div class="mc-top">';
        html += '<div class="mc-avatar-wrap">';
        html += '<div class="mc-avatar-ring ' + colorKey + '"></div>';
        html += '<img class="mc-avatar" src="' + m.avatar + '" alt="' + m.name + '">';
        html += '</div>';
        html += '<div class="mc-name-row">';
        html += '<span class="mc-name">' + m.name + '</span>';
        html += '<span class="mc-role mc-role-' + rl.cls + '">' + rl.text + '</span>';
        html += '</div>';
        html += '</div>';
        // 内容体
        if (mode === 'pk') {
          var split = parseSplitAdvice(s.mentorCommentaries[key]);
          html += '<div class="mc-body">';
          html += '<div class="mc-split">';
          html += '<div class="mc-split-item mc-split-male">';
          html += '<div class="mc-split-label">🔴 致男生</div>';
          html += '<div class="mc-split-text">' + formatContent(split.male) + '</div>';
          html += '</div>';
          html += '<div class="mc-split-item mc-split-female">';
          html += '<div class="mc-split-label">🔵 致女生</div>';
          html += '<div class="mc-split-text">' + formatContent(split.female) + '</div>';
          html += '</div>';
          html += '</div>'; // mc-split
          html += '</div>'; // mc-body
        } else {
          html += '<div class="mc-body"><div class="mc-single-text">' + formatContent(s.mentorCommentaries[key]) + '</div></div>';
        }
        html += '</div>'; // mentor-card
      }
    });
    html += '</div>'; // mentor-grid
    html += '</div>'; // section

    // ========== 三、综合建议 ==========
    if (s.advice) {
      html += '<div class="section">';
      html += '<div class="section-header">';
      html += '<div class="section-icon icon-advice">💡</div>';
      html += '<span class="section-title-text">综合建议</span>';
      html += '<span class="section-desc">最终行动指南</span>';
      html += '</div>';
      html += '<div class="advice-box">';
      html += '<div class="advice-top">';
      html += '<span class="advice-top-icon">📝</span>';
      html += '<span class="advice-top-title">综合建议</span>';
      html += '<span class="advice-top-desc">AI 综合分析</span>';
      html += '</div>';
      if (mode === 'pk') {
        var advSplit = parseSplitAdvice(s.advice);
        html += '<div class="advice-body">';
        html += '<div class="adv-split">';
        html += '<div class="adv-split-item adv-split-male">';
        html += '<div class="adv-split-label">🔴 致男生</div>';
        html += '<div class="adv-split-text">' + formatContent(advSplit.male) + '</div>';
        html += '</div>';
        html += '<div class="adv-split-item adv-split-female">';
        html += '<div class="adv-split-label">🔵 致女生</div>';
        html += '<div class="adv-split-text">' + formatContent(advSplit.female) + '</div>';
        html += '</div>';
        html += '</div>'; // adv-split
        html += '</div>'; // advice-body
      } else {
        html += '<div class="advice-body"><div class="adv-single-text">' + formatContent(s.advice) + '</div></div>';
      }
      html += '</div>'; // advice-box
      html += '</div>'; // section
    }

    // ========== 脚部 ==========
    html += '<div class="rx-footer">';
    html += '<div class="rx-footer-line1"><span class="rx-footer-divider"></span>感情急诊事务所<span class="rx-footer-divider"></span></div>';
    html += '<div class="rx-footer-line2">吵架就吵明白，我来评评理 · 本处方由 AI 辅助生成，仅供参考</div>';
    html += '</div>';

    html += '</div>'; // end .page
    html += '</body></html>';
    return html;
  }
};

// ==================== DOM 事件绑定 ====================
function bindEvents() {
  $('single-send-btn').addEventListener('click', function() { App.sendSingleMessage(); });
  $('pk-a-send-btn').addEventListener('click', function() { App.sendPKSideAMessage(); });
  $('pk-b-send-btn').addEventListener('click', function() { App.sendPKSideBMessage(); });

  $('single-input').addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); App.sendSingleMessage(); } });
  $('pk-a-input').addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); App.sendPKSideAMessage(); } });
  $('pk-b-input').addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); App.sendPKSideBMessage(); } });

  $('nickname-confirm').addEventListener('click', function() { tracker.saveNickname(); });
  $('nickname-input').addEventListener('keydown', function(e) { if (e.key === 'Enter') { tracker.saveNickname(); } });

  $('admin-password').addEventListener('keydown', function(e) { if (e.key === 'Enter') { AdminAuth.verify(); } });
}

// ==================== URL 路由 ====================
function handleHashRoute() {
  var hash = window.location.hash;
  if (hash.includes('mode=admin') || hash === '#admin') {
    App.showPage('admin');
  } else if (hash.includes('mode=pk')) {
    var pkData = parsePKHash();
    if (pkData.sideB) {
      // 包含双方数据 → 直接显示结果页（男生方刷新场景或结果链接）
      var pages = ['home', 'single', 'admin'];
      pages.forEach(function(p) {
        var el = $(p + '-page');
        if (el) el.classList.remove('active');
      });
      var target = $('pk-page');
      if (target) target.classList.add('active');
      state.currentMode = 'pk';

      // 恢复状态（精简数据需补全字段）
      state.pk.sideA = {
        name: pkData.sideA.name || '男生',
        summary: pkData.sideA.summary,
        messages: pkData.sideA.messages || [],
        infoComplete: true
      };
      state.pk.sideB = {
        name: pkData.sideB.name || '女生',
        summary: pkData.sideB.summary,
        messages: pkData.sideB.messages || [],
        infoComplete: true
      };
      state.pk.bothSubmitted = true;

      var baseUrl = window.location.href.split('#')[0];
      var sideACompact = { name: state.pk.sideA.name, summary: state.pk.sideA.summary };
      var sideBCompact = { name: state.pk.sideB.name, summary: state.pk.sideB.summary };
      state.pk.resultShareUrl = baseUrl + '#mode=pk&sideA=' + encodeData(sideACompact) + '&sideB=' + encodeData(sideBCompact);

      // 显示综合结果
      App.showPKCombined();
    } else if (pkData.sideA) {
      // URL只有甲方摘要 → 乙方（对方）直接进入陈述流程
      var pages = ['home', 'single', 'admin'];
      pages.forEach(function(p) {
        var el = $(p + '-page');
        if (el) el.classList.remove('active');
      });
      $('pk-page').classList.add('active');
      state.currentMode = 'pk';

      // 初始化状态：甲方只有摘要，乙方需要开始陈述
      state.pk = {
        sideA: { name: pkData.sideA.name || '男生', summary: pkData.sideA.summary, messages: [], infoComplete: true },
        sideB: { name: '女生', messages: [], infoComplete: false, summary: '' },
        bothSubmitted: false,
        resultShareUrl: null,
        mentorCommentaries: {},
        viewedMentors: new Set(),
        currentMentor: null,
        advice: null
      };

      // 直接切换到乙方陈述模式，展示甲方摘要作为上下文
      $('pk-step-a').style.display = 'none';
      $('pk-a-input-bar').style.display = 'none';
      $('pk-a-share-section').style.display = 'none';
      $('pk-step-b').style.display = '';
      $('pk-b-chat-messages').innerHTML = '';
      $('pk-step-combined').style.display = 'none';

      // 启动乙方引导对话（自动展示甲方摘要 + 开始引导）
      App.showPKSideB();
      tracker.recordFeature('pk_side_a_restore');
    } else {
      App.startPKMode();
    }
  } else {
    App.showPage('home');
    var nickname = localStorage.getItem('eq_nickname');
    if (nickname && $('home-nickname')) {
      $('home-nickname').textContent = nickname;
    }
  }
}

// ==================== 初始化 ====================
function init() {
  bindEvents();
  var hasNickname = tracker.init();
  if (hasNickname) {
    handleHashRoute();
  }
  window.addEventListener('hashchange', function() {
    if (localStorage.getItem('eq_nickname')) handleHashRoute();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
