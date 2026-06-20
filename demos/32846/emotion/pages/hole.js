(function () {

  // 1. 三类情绪关键词 —— 带权重（强词=3，中词=2，弱词=1）
  var KEYWORDS = {
    anxious: [
      { w: "焦虑", weight: 3 }, { w: "崩溃", weight: 3 }, { w: "快疯了", weight: 3 },
      { w: "喘不过气", weight: 3 }, { w: "压力好大", weight: 3 }, { w: "慌了", weight: 3 },
      { w: "太紧张", weight: 3 }, { w: "怕到", weight: 3 }, { w: "绝望", weight: 3 },
      { w: "担心死了", weight: 3 },
      { w: "担心", weight: 2 }, { w: "害怕", weight: 2 }, { w: "紧张", weight: 2 },
      { w: "压力", weight: 2 }, { w: "睡不着", weight: 2 }, { w: "失眠", weight: 2 },
      { w: "考试", weight: 2 }, { w: "考砸", weight: 2 }, { w: "怕", weight: 2 },
      { w: "心慌", weight: 2 }, { w: "心跳", weight: 2 }, { w: "坐不住", weight: 2 },
      { w: "演讲", weight: 2 }, { w: "面试", weight: 2 }, { w: "没把握", weight: 2 },
      { w: "没准备好", weight: 2 }, { w: "万一", weight: 2 }, { w: "怕错", weight: 2 },
      { w: "怕做不好", weight: 2 }, { w: "怕失败", weight: 2 }, { w: "考不好", weight: 2 },
      { w: "考不上", weight: 2 }, { w: "答辩", weight: 2 }, { w: "赶工", weight: 2 },
      { w: "熬夜", weight: 2 },
      { w: "慌", weight: 1 }, { w: "忐忑", weight: 1 }, { w: "不安", weight: 1 },
      { w: "烦", weight: 1 }, { w: "烦躁", weight: 1 }, { w: "心乱", weight: 1 },
      { w: "紧绷", weight: 1 }
    ],
    sad: [
      { w: "难过死了", weight: 3 }, { w: "心碎", weight: 3 }, { w: "哭了", weight: 3 },
      { w: "撑不住", weight: 3 }, { w: "不想活", weight: 3 }, { w: "想不开", weight: 3 },
      { w: "活着没意思", weight: 3 }, { w: "好难过", weight: 3 }, { w: "特别伤心", weight: 3 },
      { w: "被甩", weight: 3 }, { w: "分手", weight: 3 }, { w: "很受伤", weight: 3 },
      { w: "难过", weight: 2 }, { w: "伤心", weight: 2 }, { w: "委屈", weight: 2 },
      { w: "孤独", weight: 2 }, { w: "失去", weight: 2 }, { w: "不理我", weight: 2 },
      { w: "吵架", weight: 2 }, { w: "被骂", weight: 2 }, { w: "难受", weight: 2 },
      { w: "失望", weight: 2 }, { w: "遗憾", weight: 2 }, { w: "好累", weight: 2 },
      { w: "没意思", weight: 2 }, { w: "一个人", weight: 2 }, { w: "走了", weight: 2 },
      { w: "哭", weight: 2 }, { w: "不被理解", weight: 2 }, { w: "不被在乎", weight: 2 },
      { w: "被冷落", weight: 2 }, { w: "被排挤", weight: 2 }, { w: "孤独感", weight: 2 },
      { w: "低落", weight: 2 }, { w: "抑郁", weight: 2 }, { w: "空虚", weight: 2 },
      { w: "心痛", weight: 2 }, { w: "不开心", weight: 2 }, { w: "不快乐", weight: 2 },
      { w: "很丧", weight: 2 }, { w: "丧", weight: 2 }, { w: "emo", weight: 2 },
      { w: "没人", weight: 1 }, { w: "心里空", weight: 1 }, { w: "闷闷的", weight: 1 },
      { w: "提不起劲", weight: 1 }, { w: "没精神", weight: 1 }, { w: "累", weight: 1 }
    ],
    happy: [
      { w: "超级开心", weight: 3 }, { w: "太棒了", weight: 3 }, { w: "太幸福了", weight: 3 },
      { w: "爱死了", weight: 3 }, { w: "好到爆", weight: 3 }, { w: "超满足", weight: 3 },
      { w: "开心", weight: 2 }, { w: "高兴", weight: 2 }, { w: "喜欢", weight: 2 },
      { w: "棒", weight: 2 }, { w: "成功", weight: 2 }, { w: "通过了", weight: 2 },
      { w: "中奖", weight: 2 }, { w: "奖状", weight: 2 }, { w: "表扬", weight: 2 },
      { w: "赢了", weight: 2 }, { w: "恭喜", weight: 2 }, { w: "爱", weight: 2 },
      { w: "满足", weight: 2 }, { w: "幸福", weight: 2 }, { w: "生日", weight: 2 },
      { w: "礼物", weight: 2 }, { w: "考得好", weight: 2 }, { w: "收到了", weight: 2 },
      { w: "被夸", weight: 2 }, { w: "被认可", weight: 2 }, { w: "被爱", weight: 2 },
      { w: "暖心", weight: 2 }, { w: "温暖", weight: 2 }, { w: "很开心", weight: 2 },
      { w: "特别开心", weight: 2 },
      { w: "嘻嘻", weight: 1 }, { w: "哈哈", weight: 1 }, { w: "嘿嘿", weight: 1 },
      { w: "乐", weight: 1 }, { w: "不错", weight: 1 }, { w: "挺好", weight: 1 }
    ]
  };

  // 2. 否定词反义检测
  var NEGATIONS = ["不", "没", "无", "非", "别", "难以", "无法"];
  var NEG_SCAN_RANGE = 6;

  // 3. 场景关键词识别
  var SCENES = {
    exam: ["考试", "考砸", "考不好", "考不上", "成绩", "分数", "排名", "复习", "备考", "中考", "高考", "期末", "期中", "作业", "交作业", "没做完", "不会做", "题"],
    work: ["上班", "工作", "老板", "同事", "加班", "离职", "辞职", "面试", "被裁", "裁员", "项目", "汇报", "PPT", "ppt", "加班到", "累死", "KPI", "kpi", "绩效"],
    love: ["男朋友", "女朋友", "恋爱", "分手", "前任", "前男友", "前女友", "暗恋", "表白", "被拒绝", "暧昧", "对象", "在一起", "吵架了", "冷战", "喜欢的人"],
    family: ["爸", "妈", "爸妈", "父母", "家里", "家人", "爷爷", "奶奶", "外公", "外婆", "家长", "妈骂", "爸骂", "我妈", "我爸"],
    friend: ["朋友", "同学", "室友", "闺蜜", "哥们", "姐妹", "兄弟", "被排挤", "孤立", "小团体"],
    body: ["睡不着", "失眠", "头疼", "头晕", "胸闷", "吃不下", "没胃口", "胃痛", "身体", "疲惫", "没力气", "恶心"]
  };

  // 4. 共情回复模板
  var OPENINGS = {
    anxious: [
      "我都听到了，你现在心里一定像揣着一团拧在一起的小云朵🌫️",
      "嗯，那种被什么东西紧紧压着的感觉，我陪你一起慢慢松开来。",
      "我在这儿陪着你，你可以慢慢说，不用立刻整理出什么漂亮答案。"
    ],
    sad: [
      "我能感觉到你心里那片湿湿的、很重的地方😔",
      "谢谢你愿意告诉我，能说出这些，已经很不容易了。",
      "嗯，我都认真听着呢。"
    ],
    happy: [
      "哇，我隔着屏幕都能感觉到你亮起来的样子🌟",
      "看到你开心，我也跟着笑出声来～",
      "让我也来分享一下你的小太阳☀️"
    ]
  };

  var SCENE_EMPATHY = {
    exam: {
      anxious: "为了考试绷紧了这么久，那种「万一考砸」的担心，真的会把人一点一点抽干。",
      sad:     "努力了却没拿到想要的结果，那种落差真的会让人整个人沉下来。",
      happy:   "为你高兴！备考的那些夜晚终于有回响了✨"
    },
    work: {
      anxious: "工作上总被追着跑，还要担心做不好，那种一直悬着的感觉真的很累人。",
      sad:     "在工作里受的委屈，往往只能自己悄悄咽下去，辛苦你了。",
      happy:   "被认可的感觉太好了，恭喜你，这是你应得的～"
    },
    love: {
      anxious: "在感情里悬着一颗心的滋味，像是整个人都轻飘飘找不到落脚点。",
      sad:     "为一个人动了心，那份落空真的很疼，好好难过一会儿没关系的。",
      happy:   "被爱中的人眼睛会发光～祝福你们呀💞"
    },
    family: {
      anxious: "家里的压力有时候最沉，因为在乎所以更容易被搅动。",
      sad:     "被最亲近的人不理解，那种滋味比什么都疼。你不是一个人在扛。",
      happy:   "家人之间的温暖，最值得被好好珍藏。"
    },
    friend: {
      anxious: "在一群人里却觉得孤零零，那种不被看见的感觉真的很难受。",
      sad:     "和朋友之间的失落，看似小却会在心里留很久，好好陪自己一会儿。",
      happy:   "被朋友包围时整个人都会亮起来～"
    },
    body: {
      anxious: "身体和心情是连在一起的——心跳、睡不着，都在替你说「你累了」。",
      sad:     "身体都发出信号了。它在替你的心累说话，先好好抱抱它。",
      happy:   "身体也跟着你一起高兴呢，感觉整个人都松下来了～"
    }
  };

  var GENTLE_LINES = {
    anxious: [
      "你已经做得很好了——虽然你可能还不太相信这句话。",
      "这些事不必立刻解决，先让自己喝口水，坐一会儿。",
      "你不必一个人扛，能说出口就已经是很大的勇气。",
      "此时此刻，你是安全的。"
    ],
    sad: [
      "不必急着「变好」，难过多久都没关系。",
      "哭一会儿也没关系，眼泪是心在说话。",
      "你不是矫情，你只是被一些事真正伤到了。",
      "先对自己温柔一点，别的事都可以等一等。"
    ],
    happy: [
      "让这份开心多停留一会儿，不急着翻篇。",
      "把这份好感觉记进你心里的「小太阳盒子」里吧。",
      "你值得所有开心的事情继续发生✨"
    ]
  };

  // 5. 说教句式黑名单
  var PREACH_BLACKLIST = [
    "你要加油", "你加油", "加油就行", "想开点", "别想太多",
    "别难过了", "别伤心", "别担心", "别紧张",
    "没事的", "没关系的", "以后会好", "都会过去",
    "你应该", "看开点", "振作", "你要坚强", "你太敏感",
    "这点小事", "算什么"
  ];

  function isPreachy(text) {
    var low = text.toLowerCase();
    var result = false;
    PREACH_BLACKLIST.forEach(function (p) {
      if (low.indexOf(p.toLowerCase()) >= 0) result = true;
    });
    return result;
  }

  // 6. 正念引导语
  var MINDFULNESS = {
    anxious: [
      "🌿 试着慢慢深呼吸三次：吸气 4 秒……呼气 6 秒……让身体跟随呼吸慢下来。",
      "🌿 把一只手轻轻放在胸口，感受它的一起一伏。你在呼吸，你就在当下。",
      "🌿 想象那些担心的想法是头顶经过的云朵——它们会来，也会离开。",
      "🌿 告诉自己：我已经做到当下能做到的最好了，其他的，交给时间。",
      "🌿 喝一口温水，感受它流过喉咙的温度——这是你此刻真正拥有的片刻。"
    ],
    sad: [
      "💧 抱抱自己——把两只手交叉放在胸前，轻轻压一压，感受「被抱着」的感觉。",
      "💧 不必急着「变好」。情绪像潮水，有涨就有落。此刻它来了，你陪着它。",
      "💧 写下 3 件今天你「勉强做到了」的小事——它们是你默默努力的证据。",
      "💧 如果哭出来会轻松一点，那就让它哭出来吧。眼泪是心在说话。",
      "💧 把悲伤想象成一场雨，它会下，也一定会停。天晴的时候，你还是你。"
    ],
    happy: [
      "☀️ 深呼吸，把这份开心带到身体的每一个角落，让它像阳光一样铺开。",
      "☀️ 记录下此刻让你开心的这件事——以后再翻到它时，它是你的小小充电宝。",
      "☀️ 和身边人分享一个笑容吧，快乐的涟漪会越扩越大。",
      "☀️ 在心里对自己说一句：谢谢你，一直没有放弃。",
      "☀️ 让好感觉停留 30 秒，不急着回到下一件事。你值得被这份好心情好好养一养。"
    ]
  };

  // 7. 工具函数
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function normalize(text) { return text.replace(/\s+/g, " ").trim(); }

  function detectScene(text) {
    var hits = {};
    Object.keys(SCENES).forEach(function (k) {
      hits[k] = 0;
      SCENES[k].forEach(function (kw) { if (text.indexOf(kw) >= 0) hits[k] += 1; });
    });
    var sorted = Object.keys(hits).sort(function (a, b) { return hits[b] - hits[a]; });
    return (hits[sorted[0]] > 0) ? sorted[0] : null;
  }

  function detectEmotion(text) {
    var score = { anxious: 0, sad: 0, happy: 0 };
    var matched = 0;
    Object.keys(KEYWORDS).forEach(function (emotion) {
      KEYWORDS[emotion].forEach(function (item) {
        var kw = item.w;
        var pos = text.indexOf(kw);
        while (pos >= 0) {
          matched += 1;
          var start = Math.max(0, pos - NEG_SCAN_RANGE);
          var before = text.substring(start, pos);
          var negated = false;
          NEGATIONS.forEach(function (n) { if (before.indexOf(n) >= 0) negated = true; });
          if (negated) {
            if (emotion === "happy") score.sad += item.weight;
            else score.happy += item.weight;
          } else {
            score[emotion] += item.weight;
          }
          pos = text.indexOf(kw, pos + 1);
        }
      });
    });
    if (matched === 0) return "sad";
    var sorted = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; });
    return sorted[0];
  }

  function buildEmpathy(emotion, scene, originalText) {
    var parts = [];
    parts.push(pick(OPENINGS[emotion]));
    if (scene && SCENE_EMPATHY[scene] && SCENE_EMPATHY[scene][emotion]) {
      parts.push(SCENE_EMPATHY[scene][emotion]);
    }
    var pool = GENTLE_LINES[emotion].slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var chosen = null;
    for (var k = 0; k < pool.length; k++) {
      if (!isPreachy(pool[k])) { chosen = pool[k]; break; }
    }
    if (chosen) parts.push(chosen);
    if (originalText.indexOf("!") >= 0 || originalText.indexOf("！") >= 0 || originalText.length > 60) {
      parts.push("能愿意说出来，已经是很大的一步了——我都听到了。");
    }
    var joined = parts.join(" ");
    if (isPreachy(joined)) {
      return "我在这儿认真听你说，不管发生什么，你的感受都是真实且重要的。";
    }
    return joined;
  }

  function emotionLabel(e) {
    if (e === "anxious") return "🌿 识别到:有点焦虑";
    if (e === "happy") return "☀️ 识别到:很开心";
    return "💧 识别到:有点难过";
  }

  var SCENE_NAME = {
    exam: "学业 / 考试",
    work: "工作",
    love: "感情",
    family: "家庭",
    friend: "朋友 / 同学",
    body: "身体感受"
  };

  // 8. 渲染
  function padNum(n) { return (n < 10 ? "0" + n : "" + n); }

  function nowTime() {
    var d = new Date();
    return padNum(d.getHours()) + ":" + padNum(d.getMinutes());
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" };
      return map[c];
    });
  }

  function renderUserBubble(text) {
    var area = document.getElementById("replyArea");
    if (!area) return;
    var wrap = document.createElement("div");
    wrap.className = "bubble-row user-row fade-in";
    wrap.innerHTML =
      '<div class="bubble user-bubble">' +
        '<div class="bubble-text">' + escapeHtml(text) + '</div>' +
        '<div class="bubble-time">我 · ' + nowTime() + '</div>' +
      '</div>' +
      '<div class="avatar avatar-user">🙂</div>';
    area.appendChild(wrap);
  }

  function renderReplyCard(emotion, empathyText, mindfulnessText, sceneText) {
    var area = document.getElementById("replyArea");
    if (!area) return;
    var wrap = document.createElement("div");
    wrap.className = "bubble-row star-row fade-in";
    var sceneTag = sceneText ? ('<span class="scene-tag">🔍 ' + sceneText + '</span>') : "";
    wrap.innerHTML =
      '<div class="avatar avatar-star">🌱</div>' +
      '<div class="reply-card">' +
        '<div class="reply-header">' +
          '<span class="emotion-tag">' + emotionLabel(emotion) + '</span>' +
          sceneTag +
          '<span class="reply-time">星芽 · ' + nowTime() + '</span>' +
        '</div>' +
        '<div class="reply-text">' + empathyText + '</div>' +
        '<div class="mindfulness">' +
          '<span class="mindfulness-label">🍃 正念小引导</span>' +
          '<div class="mindfulness-text">' + mindfulnessText + '</div>' +
        '</div>' +
      '</div>';
    area.appendChild(wrap);
    setTimeout(function () { window.scrollTo(0, document.body.scrollHeight); }, 80);
  }

  // 9. 事件绑定
  function onTipClick(tipEl, inputEl) {
    return function () {
      inputEl.value = tipEl.getAttribute("data-tip") || tipEl.textContent;
      inputEl.focus();
    };
  }

  function init() {
    var input = document.getElementById("inputText");
    var btn = document.getElementById("submitBtn");
    var area = document.getElementById("replyArea");
    if (!input || !btn || !area) return;

    if (!area.innerHTML.trim()) {
      var hint = document.createElement("div");
      hint.className = "hole-welcome fade-in";
      hint.innerHTML =
        '<div class="welcome-title">🌱 欢迎来到情绪树洞</div>' +
        '<div class="welcome-text">把今天想说的写下来——开心的、难过的、焦虑的都可以。<br/>这里没有人会评判你，也没有人会催你「快点变好」。</div>' +
        '<div class="welcome-tips">' +
          '<span class="tip-label">📝 可以试试：</span>' +
          '<span class="tip-chip" data-tip="考试考砸了，心里好难受……">考试考砸了，心里好难受</span>' +
          '<span class="tip-chip" data-tip="最近工作压力好大，感觉撑不住">工作压力好大，感觉撑不住</span>' +
          '<span class="tip-chip" data-tip="今天收到好朋友的礼物，超开心！">收到好朋友的礼物，超开心！</span>' +
        '</div>';
      area.appendChild(hint);
      var chips = area.querySelectorAll(".tip-chip");
      for (var i = 0; i < chips.length; i++) {
        chips[i].addEventListener("click", onTipClick(chips[i], input));
      }
    }

    function onSubmit() {
      var originalText = (input.value || "").trim();
      if (!originalText) { input.focus(); return; }
      var text = normalize(originalText);
      btn.textContent = "星芽正在倾听……";
      btn.disabled = true;
      var emotion = detectEmotion(text);
      var scene = detectScene(text);
      var empathy = buildEmpathy(emotion, scene, text);
      var mindfulness = pick(MINDFULNESS[emotion]);
      renderUserBubble(originalText);
      input.value = "";
      setTimeout(function () {
        renderReplyCard(emotion, empathy, mindfulness, scene ? SCENE_NAME[scene] : null);
        btn.textContent = "说给星芽听 💌";
        btn.disabled = false;
        input.focus();
      }, 750);
    }

    btn.addEventListener("click", onSubmit);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSubmit(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
