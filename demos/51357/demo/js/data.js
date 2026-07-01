/* ============================================================
   示例数据 —— 取自产品真实模块的单词/句子/题目
   ============================================================ */

window.DEMO_DATA = {
  // 单词消消乐：英文 <-> 中文 配对（取真实词表）
  match: [
    { en: "China", zh: "中国" },
    { en: "teacher", zh: "老师" },
    { en: "student", zh: "学生" },
    { en: "apple", zh: "苹果" },
    { en: "happy", zh: "快乐的" },
    { en: "school", zh: "学校" },
  ],

  // 连词成句：多组句子
  sentences: [
    { blocks: ["I", "am", "a", "student"], answer: "I am a student", zh: "我是一名学生。" },
    { blocks: ["She", "is", "very", "happy", "today"], answer: "She is very happy today", zh: "她今天非常开心。" },
    { blocks: ["We", "go", "to", "school", "by", "bus"], answer: "We go to school by bus", zh: "我们乘公交车上学。" },
  ],

  // 看图选单词
  picture: [
    { emoji: "🍎", bg: "#FFCDD2", answer: "apple", zh: "苹果", opts: ["apple", "banana", "cherry", "grape"] },
    { emoji: "🚗", bg: "#BBDEFB", answer: "car", zh: "汽车", opts: ["bus", "car", "bike", "train"] },
    { emoji: "🐶", bg: "#D7CCC8", answer: "dog", zh: "狗", opts: ["cat", "mouse", "dog", "rabbit"] },
    { emoji: "🌞", bg: "#FFF9C4", answer: "sun", zh: "太阳", opts: ["moon", "star", "sun", "cloud"] },
    { emoji: "⚽", bg: "#C8E6C9", answer: "soccer", zh: "足球", opts: ["soccer", "tennis", "basketball", "golf"] },
  ],

  // 单词训练用词卡（含音标/释义）
  trainWords: [
    { word: "apple", ipa: "/ˈæpl/", zh: "苹果" },
    { word: "banana", ipa: "/bəˈnɑːnə/", zh: "香蕉" },
    { word: "elephant", ipa: "/ˈelɪfənt/", zh: "大象" },
    { word: "beautiful", ipa: "/ˈbjuːtɪfl/", zh: "美丽的" },
    { word: "computer", ipa: "/kəmˈpjuːtər/", zh: "计算机" },
    { word: "water", ipa: "/ˈwɔːtər/", zh: "水" },
  ],

  // 黄金三秒：看词秒答中文（多选一）
  speed: [
    { word: "happy", zh: "快乐的", opts: ["快乐的", "悲伤的", "饥饿的", "困倦的"] },
    { word: "school", zh: "学校", opts: ["医院", "学校", "公园", "商店"] },
    { word: "water", zh: "水", opts: ["火", "风", "水", "土"] },
    { word: "apple", zh: "苹果", opts: ["香蕉", "葡萄", "樱桃", "苹果"] },
  ],

  // 盲盒听力：听音选词
  listening: [
    { word: "banana", zh: "香蕉", opts: ["banana", "bandana", "panama", "manner"] },
    { word: "computer", zh: "计算机", opts: ["commuter", "computer", "compute", "completer"] },
    { word: "beautiful", zh: "美丽的", opts: ["beautiful", "bountiful", "dutiful", "beauty"] },
  ],

  // 学前检测：标记 YES/NO
  pretest: [
    { word: "apple", ipa: "/ˈæpl/", zh: "苹果" },
    { word: "elephant", ipa: "/ˈelɪfənt/", zh: "大象" },
    { word: "beautiful", ipa: "/ˈbjuːtɪfl/", zh: "美丽的" },
    { word: "computer", ipa: "/kəmˈpjuːtər/", zh: "计算机" },
    { word: "water", ipa: "/ˈwɔːtər/", zh: "水" },
  ],

  // 能力测试（词力定标）：自适应词汇题
  abilityQuiz: [
    { word: "happy", q: "happy 的意思是？", opts: ["快乐的", "生气的", "昂贵的", "安静的"], answer: 0 },
    { word: "enormous", q: "enormous 的意思是？", opts: ["微小的", "巨大的", "普通的", "圆形的"], answer: 1 },
    { word: "generous", q: "generous 的意思是？", opts: ["自私的", "懒惰的", "慷慨的", "胆小的"], answer: 2 },
    { word: "reluctant", q: "reluctant 的意思是？", opts: ["渴望的", "诚实的", "勤奋的", "不情愿的"], answer: 3 },
    { word: "meticulous", q: "meticulous 的意思是？", opts: ["一丝不苟的", "粗心的", "友好的", "短暂的"], answer: 0 },
  ],

  // AI 对话陪练：脚本化问答
  chat: {
    greet: "Hi! I'm your AI speaking partner. 我们来聊聊吧，试着用英文问我点什么？",
    quick: ["What's your favorite food?", "How's the weather?", "Tell me a joke"],
    replies: {
      "what's your favorite food?": "I love pizza! 🍕 It's warm, cheesy and perfect for sharing. What about you — what food makes you happy?",
      "how's the weather?": "It looks sunny and bright today! ☀️ A great day for a walk. Did you go outside today?",
      "tell me a joke": "Why did the student eat his homework? 📚 Because the teacher said it was a piece of cake! 😄",
      "_default": "That's interesting! 你说得很好。Let me ask you back: can you tell me more about it in one full sentence?",
    },
  },

  // AI 作文批改
  essay: {
    title: "My Weekend",
    // 片段：t=普通文本, err=错误（含批注/修正）, fix=已修正
    parts: [
      { t: "Last weekend I " },
      { err: "go", fix: "went", note: "时态错误：叙述过去要用过去式" },
      { t: " to the park with my friends. The weather " },
      { err: "is", fix: "was", note: "时态一致：过去式 was" },
      { t: " very nice. We " },
      { err: "playing", fix: "played", note: "谓语动词应为过去式 played" },
      { t: " football and " },
      { err: "eated", fix: "ate", note: "eat 的过去式是 ate，不规则动词" },
      { t: " ice cream. " },
      { good: "It was a wonderful day!", note: "句式地道，结尾收束自然 👍" },
    ],
    score: 86,
    summary: "整体表达流畅、结构完整，主要问题集中在动词时态。建议复习一般过去时与不规则动词变形。",
  },

  // 绘本阅读
  storybook: [
    { emoji: "🐰", bg: "#FFF3E0", en: ["Once there was a little ", { hl: "rabbit" }, "."], zh: "从前有一只小兔子。" },
    { emoji: "🥕", bg: "#E8F5E9", en: ["He loved to eat ", { hl: "carrots" }, " every day."], zh: "他每天都喜欢吃胡萝卜。" },
    { emoji: "🌳", bg: "#E3F2FD", en: ["One day he found a big ", { hl: "tree" }, "."], zh: "一天，他发现了一棵大树。" },
    { emoji: "🌈", bg: "#F3E5F5", en: ["Behind it was a beautiful ", { hl: "rainbow" }, "!"], zh: "树后面是一道美丽的彩虹！" },
  ],

  // 选词生文
  genWords: ["rabbit", "carrot", "garden", "happy", "sunny", "friend"],
  genTemplate: "On a {sunny} morning, a little {rabbit} hopped into the {garden}. " +
    "It found a big orange {carrot} and felt so {happy}. " +
    "Then it shared the carrot with a good {friend}. What a lovely day!",
};
