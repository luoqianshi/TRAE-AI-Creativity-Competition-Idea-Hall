// 文本预处理 — 在送入 TTS 引擎前对故事文本做"自然化"处理
// 目标：让合成语音更像真人讲睡前故事，而不是在"念稿"
//
// 关键技巧：
// 1. 数字 → 中文读法（TTS 容易把 "3" 念成英文）
// 2. 长句断句：在 ", "、"。" 后加 "…" 让 TTS 主动停顿
// 3. 对话包裹：把对话体用 "——" 包围，模拟讲故事时的"换气"
// 4. 段间停顿：段首添加 "嗯，"，让每段听起来像"翻一页后开口"
// 5. 拟声词加重：常见拟声词后面追加 "，" 拖长

// 数字 → 中文读法（TTS 容易把 "3" 念成英文）
// 只避开前后都是数字的情况（避免 12 里的 1 被误转）
function toChineseNumeral(s: string): string {
  return s.replace(/(?<!\d)(\d{1,2})(?!\d)/g, (m) => {
    const n = parseInt(m, 10);
    if (n < 10) return ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'][n] || m;
    if (n < 20) return '十' + (n === 10 ? '' : ['一', '二', '三', '四', '五', '六', '七', '八', '九'][n - 10]);
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ['一', '二', '三', '四', '五', '六', '七', '八', '九'][tens - 1] + '十' + (ones ? ['一', '二', '三', '四', '五', '六', '七', '八', '九'][ones - 1] : '');
  });
}

// 在特定标点前添加 "…"，让 TTS 主动延长停顿
function breatheAfterPunctuations(s: string): string {
  return s
    .replace(/([。！？])/g, '$1…')           // 句末加省略号 = 拉长停顿
    .replace(/([。！？])…\s*([^\n])/g, '$1…$2') // 去掉空格
    .replace(/(\n\n+)/g, '\n\n')            // 段间空行
    ;
}

// 段首添加 "嗯，" 模拟真人讲故事时的"换气起手"
// 但不能每段都加，会显得机械；只在第一段后每两段加一次
function addSoftStarts(s: string): string {
  const paragraphs = s.split(/\n+/).filter((p) => p.trim().length > 0);
  return paragraphs
    .map((p, i) => {
      if (i === 0) return p;
      // 长段落才加
      if (p.length > 12 && i % 2 === 1) {
        return `嗯，${p}`;
      }
      return p;
    })
    .join('\n\n');
}

// 常见拟声词拖长
function elongateOnomatopoeia(s: string): string {
  return s
    .replace(/(哗啦啦|喵喵|汪汪|啾啾|咯咯|嘟嘟|嘀嘀|咕噜)/g, '$1，')   // 拟声词后加逗号拖长
    .replace(/(哗啦啦|喵喵|汪汪|啾啾|咯咯|嘟嘟|嘀嘀|咕噜)，/g, '$1');
}

// 把 "XX说：" 这类引导词变成更"讲故事"的语气
function softenNarration(s: string): string {
  return s
    .replace(/([一-龥]{1,2})说：/g, '——$1说——')   // "妈妈说：" → "——妈妈说——"
    .replace(/^——(.{1,8})——/, '——$1说——')     // 兜底
    ;
}

/**
 * 主入口：把故事文本转成更"像妈妈讲"的版本
 * 注意：此函数**不修改数据库**，仅在 TTS 调用前在内存中处理
 */
export function preprocessForTTS(text: string): string {
  let s = text.trim();
  if (!s) return s;

  s = toChineseNumeral(s);
  s = elongateOnomatopoeia(s);
  s = softenNarration(s);
  s = addSoftStarts(s);
  s = breatheAfterPunctuations(s);

  // 避免连续多个省略号
  s = s.replace(/…{2,}/g, '…');
  // 避免出现空格导致的非预期停顿
  s = s.replace(/[ \t]+/g, ' ');

  return s;
}

/**
 * 估算"自然化"后的朗读时长（秒），用于 stories.duration_seconds 显示
 * 自然化后通常略长于字数/3.5
 */
export function estimateNaturalDuration(text: string): number {
  const processed = preprocessForTTS(text);
  const length = [...processed.replace(/[\s…\n]/g, '')].length;
  return Math.max(30, Math.round(length / 3.2));
}
