/* =====================================================
   吃出健康 · 宝妈饮食与情绪助手 —— 交互逻辑
   所有数据保存在 localStorage；纯前端。
   ===================================================== */

(function () {
  "use strict";

  // ---------- 小工具 ----------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const safeLS = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    },
  };

  const todayStr = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const prettyDate = (yyyy_mm_dd) => {
    const [y, m, d] = yyyy_mm_dd.split("-");
    return `${+m}/${+d}`;
  };

  const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 逐字显示的"打字机"效果
  function typewrite(el, text, speed = 28) {
    el.textContent = "";
    el.classList.remove("is-done");
    let i = 0;
    const len = text.length;
    const tick = () => {
      if (i >= len) { el.classList.add("is-done"); return; }
      el.textContent += text[i++];
      setTimeout(tick, speed + Math.random() * 20);
    };
    tick();
  }

  // ---------- Tab 切换 ----------
  function initTabs() {
    const tabs = $$(".tab");
    const panels = $$(".panel");
    tabs.forEach((t) => {
      t.addEventListener("click", () => {
        const target = t.dataset.target;
        tabs.forEach((x) => {
          x.classList.toggle("is-active", x === t);
          x.setAttribute("aria-selected", x === t ? "true" : "false");
        });
        panels.forEach((p) => p.classList.toggle("is-active", p.id === target));
      });
    });
  }

  // =====================================================
  // 功能一：剩菜大变身
  // =====================================================
  const LEFTOVER_RECIPES = {
    "米饭": {
      title: "低卡伪炒饭",
      words: "别直接吃啦！把米饭和其他剩菜混合，加点黄瓜丁和魔芋丝，摇身一变成一碗清爽的伪炒饭。既没浪费粮食，又控制了热量，妈妈吃得开心，宝宝明天还能看到你充满活力的样子哦～",
      steps: [
        "米饭中加入黄瓜丁、胡萝卜丝、魔芋丝（帮助增加饱腹感）。",
        "用不粘锅加 1 小勺橄榄油，先下蔬菜炒软，再加入米饭。",
        "最后撒一点点海盐 + 黑胡椒，或淋 1 勺生抽（别放多）。",
        "可以配一个水煮蛋，蛋白让你一整下午都不饿。",
      ],
      tip: "一小碗 150g 米饭 ≈ 170 kcal，加大量蔬菜后体积翻倍、热量只多一点点。",
    },
    "面条": {
      title: "清爽凉拌面",
      words: "剩下的面条别再回锅加热变一坨了！冲一冲冷水，拌一点蔬菜丝和低脂酱汁，变成一碗夏日感满满的凉拌面。清爽又不油腻，妈妈的胃也会轻轻说声谢谢。",
      steps: [
        "面条用冷水冲 1–2 分钟，沥干，保持 Q 弹。",
        "黄瓜、胡萝卜、紫甘蓝切丝铺在面上。",
        "酱汁：1 勺生抽 + 半勺香醋 + 几滴香油 + 少许蒜末（可选）。",
        "喜欢的话，再加一勺焯水过的鸡胸肉丝。",
      ],
      tip: "少用油、多放蔬菜，是把剩面从 400 kcal 减到 250 kcal 的秘密。",
    },
    "排骨": {
      title: "脱骨肉碎拌饭",
      words: "糖醋排骨好吃，但糖和油也不少。把肉剔下来切碎，和米饭、蔬菜丁一起拌一拌，就是一碗温柔又满足的肉碎拌饭。肉香还在，负担却少了一半。",
      steps: [
        "把排骨上的肉剔下、切碎；丢弃过多的脂肪和骨边油。",
        "和米饭一起放入平底锅，加少量水煮开使肉回温。",
        "加黄瓜丁 / 玉米粒 / 豌豆，增加颜色和口感。",
        "最后淋一点生抽 + 白胡椒提味，别再加糖啦。",
      ],
      tip: "2 块小排骨的肉大约 70–80 kcal；和一碗 150g 米饭搭配，控制在 300 kcal 内很轻松。",
    },
    "红烧肉": {
      title: "瘦肉切丁蔬菜卷",
      words: "红烧肉是家里的爱，但油脂真的很多。挑出瘦肉部分切成小丁，用生菜卷着吃，或和黄瓜、番茄一起夹在生菜叶里做小卷。既解馋，又不会像直接吃那样有负担。",
      steps: [
        "从红烧肉中夹出瘦肉部分，切成约 1cm 小丁。",
        "准备大片生菜叶 / 娃娃菜叶做底。",
        "叶上放瘦肉丁 + 黄瓜条 + 胡萝卜丝 + 一点香葱。",
        "卷起来吃；可蘸少量生抽 + 少许辣椒酱提味。",
      ],
      tip: "红烧肉中肥肉部分的热量是瘦肉的 3 倍，去掉肥肉，一餐的负担就能减半。",
    },
    "炒蛋": {
      title: "蛋丝蔬菜沙拉",
      words: "冷掉的炒蛋回锅会老掉。不如把它切成细丝，铺在新鲜蔬菜上，做成一碗温柔的蛋丝沙拉。蛋黄的香 + 蔬菜的脆，健康又满足。",
      steps: [
        "炒蛋切成细丝。",
        "准备生菜、小番茄、黄瓜片、玉米粒等喜欢的蔬菜。",
        "用一点橄榄油 + 黑醋 + 少许蜂蜜 / 生抽做酱汁。",
        "也可以用无糖酸奶 + 柠檬汁 + 黑胡椒做更轻盈的沙拉酱。",
      ],
      tip: "1 个鸡蛋 ≈ 75 kcal，搭配大量蔬菜，整碗沙拉也只在 200 kcal 左右。",
    },
    "鸡肉": {
      title: "手撕鸡黄瓜沙拉",
      words: "剩下的鸡肉是最棒的蛋白质！撕成鸡丝，和黄瓜、玉米粒一起做成清爽鸡丝沙拉。吃起来满足，又比重新加热炒回锅健康得多。",
      steps: [
        "鸡肉撕成细条。",
        "与黄瓜丝、胡萝卜丝、玉米粒混合。",
        "酱汁：无糖酸奶 + 少量盐 + 黑胡椒 + 几滴柠檬汁。",
        "可以夹在生菜叶里当小卷吃。",
      ],
      tip: "100g 鸡胸肉 ≈ 165 kcal，是减脂期的好朋友。记得不要淋过多沙拉酱。",
    },
    "鱼肉": {
      title: "鱼松蔬菜拌饭",
      words: "剩下的鱼肉可以轻轻拆成鱼松，和米饭、蔬菜丁拌在一起。鱼肉的鲜 + 蔬菜的脆，是一碗温柔又不油腻的低卡餐。",
      steps: [
        "将鱼肉仔细去骨刺后，用手撕成细条或用叉子压成鱼松。",
        "和少量米饭、黄瓜丁、胡萝卜丁混合。",
        "淋少量生抽 + 几滴香油，撒一点点熟芝麻。",
        "加一点海苔碎，风味更佳。",
      ],
      tip: "鱼肉脂肪少、蛋白质高，注意小刺，小宝宝想吃也可以单独拨一点点无刺的。",
    },
    "蔬菜": {
      title: "蔬菜蛋花汤",
      words: "剩下的蔬菜不要回锅炒得黄黄的！改成一碗清淡蔬菜蛋花汤，温热又暖胃，也让妈妈在忙碌的一天结束时，胃里依然清清爽爽。",
      steps: [
        "蔬菜切成适口大小，放入小锅中加清水煮至断生。",
        "调一个打散的鸡蛋，慢慢倒入汤中形成蛋花。",
        "加盐 + 白胡椒 + 几滴香油即可。",
        "可以和一小碗米饭搭配，做一顿简单晚餐。",
      ],
      tip: "这一碗只有 80–120 kcal，是晚上怕饿又怕胖时最温柔的选择。",
    },
  };

  const LEFTOVER_DEFAULT = {
    title: "温柔混搭餐",
    words: "妈妈你看，不管桌上剩下的是什么，都可以拆成「主食 + 蛋白质 + 蔬菜」的三件套，分量减一点，油盐少一点，用新鲜蔬菜填一填体积。这样一来，没有浪费粮食，你的胃也不会自责。",
    steps: [
      "从剩菜中夹出一小份主食（米饭 / 面条），约一小碗。",
      "从荤菜中挑出瘦肉 / 蛋 / 鱼肉部分，切碎或撕成丝。",
      "补一大盘新鲜或焯水的蔬菜：黄瓜、生菜、番茄、胡萝卜都可。",
      "拌在一起，或用生菜叶卷着吃，少加一次油盐。",
    ],
    tip: "一小份 + 大量蔬菜 + 少量蛋白 = 饱腹感满满的低卡一餐。",
  };

  // 关键词匹配；支持多关键词合并
  function matchLeftover(text) {
    if (!text || !text.trim()) return [LEFTOVER_DEFAULT];
    const t = text.replace(/\s+/g, "");
    const matched = [];
    Object.keys(LEFTOVER_RECIPES).forEach((k) => {
      if (t.includes(k)) matched.push({ key: k, recipe: LEFTOVER_RECIPES[k] });
    });
    if (matched.length === 0) return [LEFTOVER_DEFAULT];
    // 最多取 2 个，避免太长
    return matched.slice(0, 2);
  }

  function renderLeftover(list) {
    const card = $("#leftover-response");
    const titleEl = $("#leftover-title");
    const metaEl = $("#leftover-meta");
    const wordsEl = $("#leftover-words");
    const stepsEl = $("#leftover-steps");
    const tipEl = $("#leftover-tip");

    card.hidden = false;
    stepsEl.innerHTML = "";

    if (list.length === 1) {
      titleEl.textContent = list[0].recipe.title;
      metaEl.textContent  = "为你的「" + list[0].key + "」准备的温柔做法";
      typewrite(wordsEl, list[0].recipe.words);
      list[0].recipe.steps.forEach((s) => {
        const li = document.createElement("li");
        li.textContent = s;
        stepsEl.appendChild(li);
      });
      tipEl.textContent = "小提示：" + list[0].recipe.tip;
    } else {
      titleEl.textContent = "一份温柔的双拼改造";
      metaEl.textContent = "识别到「" + list.map((x) => x.key).join(" + ") + "」，我帮你把它们合在一起做一餐";
      // 组合话术
      const combinedWords = list.map((x) => `· ${x.key}：${x.recipe.words}`).join("\n\n");
      typewrite(wordsEl, combinedWords);
      list.forEach((item) => {
        item.recipe.steps.slice(0, 2).forEach((s) => {
          const li = document.createElement("li");
          li.textContent = `【${item.key}】${s}`;
          stepsEl.appendChild(li);
        });
      });
      tipEl.textContent = list[0].recipe.tip;
    }
    // 滚动到卡片
    setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }

  function pushLeftoverHistory(input, recipe) {
    const key = "leftover_history";
    const list = safeLS.get(key, []);
    list.unshift({ date: todayStr(), input: input.slice(0, 80), title: recipe.title });
    while (list.length > 3) list.pop();
    safeLS.set(key, list);
    renderLeftoverHistory();
  }

  function renderLeftoverHistory() {
    const listEl = $("#leftover-history-list");
    const list = safeLS.get("leftover_history", []);
    if (list.length === 0) {
      listEl.innerHTML = '<li class="history__empty">还没有记录，先去试一试上面的输入吧～</li>';
      return;
    }
    listEl.innerHTML = "";
    list.forEach((item) => {
      const li = document.createElement("li");
      li.className = "history__item";
      li.innerHTML = `<strong>${item.date} · ${item.title}</strong><br/>你的输入：${item.input}`;
      listEl.appendChild(li);
    });
  }

  function initLeftover() {
    const input  = $("#leftover-input");
    const submit = $("#leftover-submit");

    // 标签插入
    $$("[data-insert]").forEach((btn) => {
      if (btn.closest("#tab-leftover")) {
        btn.addEventListener("click", () => {
          const cur = input.value.trim();
          input.value = cur ? cur + " + " + btn.dataset.insert : btn.dataset.insert;
          input.focus();
        });
      }
    });

    submit.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) {
        input.focus();
        input.setAttribute("placeholder", "告诉我剩下的是什么？例如「半碗米饭 + 几块排骨」～");
        return;
      }
      const result = matchLeftover(text);
      renderLeftover(result);
      pushLeftoverHistory(text, result[0].recipe);
    });

    input.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit.click();
    });

    renderLeftoverHistory();
  }

  // =====================================================
  // 功能二：情绪急救站
  // =====================================================
  const MOOD_KITS = {
    sweet: [
      {
        title: "为想吃甜的你",
        words: "带娃辛苦啦！想吃甜的不是你的错，是身体在向你求救。血糖低、睡眠不足、压力大的时候，大脑都会疯狂喊「给我糖」。允许自己放松——但我们可以换一个温柔的方式。",
        alternatives: [
          "一小盒无糖酸奶 + 蓝莓 / 草莓 + 少量燕麦脆",
          "一小块（约 15g）85% 以上黑巧克力",
          "一颗温水煮的红枣 + 一小把原味坚果",
          "半根香蕉 + 无糖酸奶打成的奶昔",
        ],
        tip: "糖能让人快乐 10 分钟，然后是 2 小时的自责。给自己选一个「甜而不腻」的答案，妈妈你值得被温柔对待。",
      },
      {
        title: "给疲惫的你一点甜",
        words: "别着急否定自己。带了一整天娃的妈妈想吃甜，再正常不过。我们不用对它妥协，但可以好好款待一下自己——用一份不重、又温暖的小甜。",
        alternatives: [
          "烤红薯 1 个（小），用空气炸锅或烤箱即可",
          "自制拿铁：无糖豆浆 / 牛奶 + 1 勺速溶咖啡 + 少量肉桂粉",
          "一小把冻蓝莓，像吃冰淇淋",
          "苹果切片 + 少量花生酱（1 小勺）",
        ],
        tip: "甜的感觉来自碳水 + 温度，不用糖也可以获得。",
      },
    ],
    crush: [
      {
        title: "给崩溃的你一个拥抱",
        words: "带娃真的很难。你已经尽力了，不必因为一次情绪而责怪自己。崩溃的时刻不是你的软弱，而是身体在说「我需要被看见」。",
        alternatives: [
          "找一个安静的地方，做 3 分钟深呼吸，闻一闻你喜欢的护手霜 / 茶",
          "喝一杯温热的花草茶（洋甘菊 / 玫瑰花 / 路易波士）",
          "戴上耳机听 5 分钟白噪音或慢节奏音乐",
          "给信任的朋友发一句：我今天累坏了",
        ],
        tip: "允许自己在 10 分钟内什么也不做。你不是机器，你是一个真实的妈妈。",
      },
      {
        title: "当你只想塞东西的时候",
        words: "那种「想把一切塞进嘴里」的冲动，往往不是因为饿——而是空虚、疲惫、或者被忽略的委屈。先停 1 分钟，问问自己：我现在真正想要的是什么。",
        alternatives: [
          "用一个大杯子装满温水或花草茶，先慢慢喝完",
          "切一个苹果 / 黄瓜片沾少许希腊酸奶",
          "一小份（15–20g）原味坚果慢慢嚼",
          "走出阳台深呼吸 10 次，再决定要不要吃",
        ],
        tip: "塞东西 ≠ 解决情绪。你真正需要的，是被好好理解的 1 分钟。",
      },
    ],
    salty: [
      {
        title: "想吃咸口的时候",
        words: "想吃咸的，通常意味着身体缺水、或者缺电解质。也可能是你今天太累了——咸的东西会带来快速的满足感。没关系，我们选一个不那么负担的方式。",
        alternatives: [
          "一小碗味噌汤（低钠）+ 嫩豆腐 + 海带",
          "1 个水煮蛋撒一点点海盐 + 黑胡椒",
          "无盐坚果 + 少量海苔片",
          "黄瓜 / 胡萝卜条，沾少量无糖希腊酸奶 + 黑胡椒",
        ],
        tip: "吃完咸的记得多喝 200ml 温水。明天醒来你会感谢今天的自己。",
      },
      {
        title: "咸口是身体的信号",
        words: "今天是不是出汗多、喝的水不够、或者晚上太累了想吃重口味？身体其实在说「我需要电解质」。满足它，但换一种更轻盈的方式。",
        alternatives: [
          "清汤一碗（番茄鸡蛋汤 / 紫菜蛋花汤）",
          "一小份水煮毛豆，撒少许海盐",
          "小番茄 + 黄瓜片 + 少量橄榄油 + 盐",
          "一片全麦吐司 + 半个牛油果 + 撒点盐",
        ],
        tip: "咸 + 油 + 糖 才是真正的罪恶组合。选其一，就已经很棒了。",
      },
    ],
    praise: [
      {
        title: "给今天的你一封小信",
        words: "你今天已经很了不起了。宝宝的一顿饭、一次洗澡、一次哭闹的安抚——所有这些微小的事，都是一个妈妈的伟大。你不需要别人来证明。",
        alternatives: [
          "走到镜子前，对自己说 3 遍：「我做得很好」",
          "花 2 分钟做一个你喜欢的面膜 / 护手霜按摩",
          "坐下来喝一杯温水，慢慢地",
          "把一件小小的家事从清单上划掉，认真夸自己 10 秒",
        ],
        tip: "妈妈的价值，从来不是做了多少事，而是你把孩子好好地、温柔地爱着。",
      },
      {
        title: "你值得被温柔对待",
        words: "你每天为孩子、为家人、为这个家做的事，或许没人一一数出来，但它们都在——在宝宝的笑容里，在餐桌上的饭香里，在家人的安心呼吸里。",
        alternatives: [
          "今晚睡前给自己 10 分钟——只属于你",
          "做一次身体扫描：从脚趾到头顶，慢慢放松每一处",
          "写 3 句话给自己：今天我做对的 3 件小事",
          "闻一闻你最喜欢的味道（护手霜、茶、香水）",
        ],
        tip: "一个被温柔对待的妈妈，才能养出被温柔对待的孩子。",
      },
    ],
  };

  function renderMood(mood) {
    const kit = sample(MOOD_KITS[mood]);
    const card = $("#mood-response");
    card.hidden = false;
    $("#mood-title").textContent = kit.title;
    typewrite($("#mood-words"), kit.words);

    const ul = $("#mood-alternatives");
    ul.innerHTML = "";
    kit.alternatives.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      ul.appendChild(li);
    });
    $("#mood-tip").textContent = kit.tip;

    setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }

  function initMood() {
    $$(".mood-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        // 简单的按压反馈（动画交给 CSS）
        btn.blur();
        renderMood(btn.dataset.mood);
      });
    });
  }

  // =====================================================
  // 功能三：自我关怀打卡
  // =====================================================
  const CHECKIN_KEY = "self_care_checkins";
  const CHECKIN_TEMPLATES = [
    // 按关键词匹配
    { match: ["早餐", "早饭"], words: "今天你好好吃了早餐，这就是对自己最温柔的一件事。记得哦：一个会好好吃饭的妈妈，就是给孩子最好的榜样。" },
    { match: ["睡", "早睡", "睡觉"], words: "昨晚你让自己早睡了一会儿，这是今天你能给宝宝最好的礼物——一个更有耐心的妈妈。" },
    { match: ["水", "喝水", "补水"], words: "你今天认真喝了水，身体在偷偷感谢你。继续保持，水是最被低估的快乐来源。" },
    { match: ["散步", "运动", "走"], words: "出去走了一圈的你，今天又多了一次发光的机会。流汗的每一步，都是在对自己说「我在乎你」。" },
    { match: ["剩饭", "不剩饭", "拒绝", "浪费"], words: "你拒绝了吃不必要的剩菜，选择让身体更轻松。这不只是不浪费食物，也是不浪费你自己。" },
    { match: ["菜", "蔬菜", "水果"], words: "为自己加了一份蔬菜或水果的你，正在温柔地照顾自己。妈妈的胃，也值得被认真对待。" },
    { match: ["爱", "温柔", "抱抱", "拥抱"], words: "你给了自己温柔的一瞬间，这会像涟漪一样传给宝宝的。今天的你，闪闪发光。" },
  ];
  const CHECKIN_DEFAULT = [
    "你为自己做了一件小小的好事——这就是今天最值得记录的事。一个闪闪发光的妈妈，就是给孩子最好的榜样。",
    "每一次好好对待自己，都是在对宝宝说：「你也值得被温柔对待。」今天的你，真的很棒。",
    "不必等到完美。你愿意为自己停下来、记录下这一刻，已经很了不起了。",
  ];

  function getCheckinWords(text) {
    if (!text || !text.trim()) return sample(CHECKIN_DEFAULT);
    for (const t of CHECKIN_TEMPLATES) {
      if (t.match.some((k) => text.includes(k))) return t.words;
    }
    return sample(CHECKIN_DEFAULT);
  }

  function getCheckins() {
    return safeLS.get(CHECKIN_KEY, []);
  }
  function saveCheckins(list) {
    // 最多保留 30 条
    while (list.length > 30) list.pop();
    safeLS.set(CHECKIN_KEY, list);
  }

  function computeStreaks(list) {
    // list: [{date: 'YYYY-MM-DD', ...}]，返回 {current, total}
    const dates = new Set(list.map((x) => x.date));
    let total = dates.size;
    let current = 0;
    const today = new Date();
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    while (true) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (dates.has(key)) {
        current++;
        d.setDate(d.getDate() - 1);
      } else {
        // 允许今天还没打卡
        if (current === 0 && key === todayStr()) {
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return { current, total };
  }

  function renderCheckinStatus() {
    const list = getCheckins();
    const today = todayStr();
    const done = list.some((x) => x.date === today);
    const dot = $("#checkin-dot");
    const txt = $("#checkin-status-text");
    if (done) {
      dot.classList.remove("status-dot--off");
      txt.textContent = "今天已经打卡啦，记得明天也要对自己温柔一点～";
    } else {
      dot.classList.add("status-dot--off");
      txt.textContent = "今日尚未打卡，去记录一件温暖的小事吧";
    }

    const { current, total } = computeStreaks(list);
    $("#checkin-streak").textContent = `连续 ${current} 天 · 累计 ${total} 天`;
  }

  function renderCheckinStreakRow() {
    const row = $("#streak-row");
    const list = getCheckins();
    const byDate = new Map(list.map((x) => [x.date, x]));
    const today = new Date();

    row.innerHTML = "";
    // 过去 7 天：从 6 天前 -> 今天
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const isToday = key === todayStr();
      const done = byDate.has(key);

      const li = document.createElement("li");
      li.className = "streak-day" + (isToday ? " is-today" : "") + (done && !isToday ? " is-done" : "");
      const emoji = done ? "🌼" : isToday ? "🫶" : "·";
      li.innerHTML = `
        <span class="streak-day__emoji">${emoji}</span>
        <span class="streak-day__date">${prettyDate(key)}</span>
      `;
      if (done) {
        li.title = byDate.get(key).text || "";
      }
      row.appendChild(li);
    }
  }

  function renderCheckinResponse(text) {
    const card = $("#checkin-response");
    card.hidden = false;
    $("#checkin-meta").textContent = `于 ${todayStr()} 记录`;
    typewrite($("#checkin-words"), getCheckinWords(text));
    setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }

  function initCheckin() {
    const input  = $("#checkin-input");
    const submit = $("#checkin-submit");

    // 快捷标签插入
    $$("[data-insert]").forEach((btn) => {
      if (btn.closest("#tab-checkin")) {
        btn.addEventListener("click", () => {
          const cur = input.value.trim();
          input.value = cur ? cur + "，" + btn.dataset.insert : btn.dataset.insert;
          input.focus();
        });
      }
    });

    submit.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) {
        input.focus();
        input.setAttribute("placeholder", "写一句话记录今天为自己做的小事吧～");
        return;
      }
      const list = getCheckins();
      const today = todayStr();
      // 同一天允许多次写入，但取最后一次为主；这里实现：同一天追加也可以
      const idx = list.findIndex((x) => x.date === today);
      const item = { date: today, text, ai: getCheckinWords(text) };
      if (idx >= 0) list.splice(idx, 1, item); // 同一天覆盖
      else list.unshift(item);
      saveCheckins(list);

      renderCheckinResponse(text);
      renderCheckinStatus();
      renderCheckinStreakRow();
      input.value = "";
    });

    input.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit.click();
    });

    renderCheckinStatus();
    renderCheckinStreakRow();
  }

  // ---------- 启动 ----------
  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initLeftover();
    initMood();
    initCheckin();
  });
})();
