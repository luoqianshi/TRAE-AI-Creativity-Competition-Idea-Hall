(function () {
  var messages = document.getElementById("messages");
  var form = document.getElementById("chatForm");
  var input = document.getElementById("userInput");
  var quickButtons = document.querySelectorAll("[data-prompt]");
  var exerciseButtons = document.querySelectorAll("[data-exercise]");
  var exerciseBody = document.getElementById("exerciseBody");

  var crisisWords = ["自杀", "轻生", "不想活", "结束生命", "伤害自己", "杀了", "报复", "活不下去"];

  var replies = [
    "我听见了。你现在承受的东西可能比表面看起来重很多，我们先不急着解决全部问题。你可以先告诉我：这件事里最让你难受的是“发生了什么”，还是“你对自己的评价”？",
    "这不是矫情。人在压力很大时，大脑会自动把事情想得更糟，也会更容易否定自己。我们先把它拆小一点：现在最影响你的，是情绪、关系、选择，还是身体状态？",
    "你能把这些说出来，本身就说明你还在努力照顾自己。先做一个很小的步骤：把你最担心的结果写成一句话，然后我们一起看看它有多大概率发生，以及你能控制哪一部分。",
    "听起来你不是不够好，而是最近太累、太孤单，或者被某些事情消耗太久了。此刻不需要马上变强，先让自己缓一口气：慢慢吸气四秒，停一秒，再呼气六秒。"
  ];

  var exercises = {
    breath: {
      title: "一分钟呼吸练习",
      steps: ["坐稳，双脚踩地，肩膀自然放松。", "吸气 4 秒，感受空气进入身体。", "停顿 1 秒，不用憋得很用力。", "呼气 6 秒，想象紧绷感慢慢出去。", "重复 5 轮，再观察身体有没有松一点。"]
    },
    diary: {
      title: "情绪日记",
      steps: ["现在发生了什么？只写事实，不评价。", "我感到什么？可以写焦虑、委屈、愤怒、空、累。", "这个情绪在提醒我什么需求？", "今天我能为自己做的一件小事是什么？"]
    },
    reframe: {
      title: "认知重构",
      steps: ["写下脑中最刺耳的一句话，比如“我很失败”。", "问自己：这句话是事实，还是压力下的判断？", "找一个更平衡的说法，比如“我现在遇到了困难，但不等于我整个人失败”。", "选择一个 10 分钟内能完成的小行动。"]
    },
    conflict: {
      title: "冲突复盘",
      steps: ["对方说了什么、做了什么？先记录事实。", "我当时最强烈的感受是什么？", "我真正希望被理解的是什么？", "如果重新表达，我可以用一句更清楚的话怎么说？"]
    }
  };

  function addMessage(text, type) {
    var bubble = document.createElement("div");
    bubble.className = "msg " + type;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function isCrisis(text) {
    return crisisWords.some(function (word) {
      return text.indexOf(word) !== -1;
    });
  }

  function getReply(text) {
    if (isCrisis(text)) {
      return "我很重视你刚刚说的内容。现在最重要的是先保证安全：请尽快联系身边可信赖的人，让他陪在你身边；如果你可能马上伤害自己或别人，请立刻拨打当地紧急电话或前往最近的急诊。AI 可以陪你说话，但这种情况需要真人立即介入。";
    }
    if (text.indexOf("焦虑") !== -1 || text.indexOf("停不下来") !== -1 || text.indexOf("害怕") !== -1) {
      return "焦虑常常像脑子里的警报器，一直提醒你“可能会出事”。我们先不用和它硬拼，可以先问三个问题：我现在担心的具体是什么？这个担心有没有证据？此刻我能做的最小一步是什么？";
    }
    if (text.indexOf("没用") !== -1 || text.indexOf("失败") !== -1 || text.indexOf("做不好") !== -1) {
      return "你现在对自己的评价很重，但它不一定是事实。很多人在长期受挫或疲惫时，会把“事情没做好”理解成“我这个人不好”。我们先把人和事情分开：最近最让你产生这种感觉的一件事是什么？";
    }
    if (text.indexOf("吵架") !== -1 || text.indexOf("关系") !== -1 || text.indexOf("分手") !== -1) {
      return "关系里的难受往往不只是那一次争吵，而是“我有没有被在乎、被理解”。你可以先不用急着判断谁对谁错，先说说：对方哪句话或哪个动作最刺痛你？";
    }
    if (text.indexOf("孤独") !== -1 || text.indexOf("没人") !== -1 || text.indexOf("理解") !== -1) {
      return "孤独感很难受，尤其是身边有人却依然觉得没人真正懂自己。你愿意把这种孤独形容成一个画面吗？比如像一个房间、一条路，或者一阵天气。这样我们可以慢慢靠近它。";
    }
    return replies[Math.floor(Math.random() * replies.length)];
  }

  function submitText(text) {
    var clean = text.trim();
    if (!clean) return;
    addMessage(clean, "user");
    input.value = "";
    window.setTimeout(function () {
      addMessage(getReply(clean), "ai");
    }, 520);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    submitText(input.value);
  });

  quickButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      submitText(button.getAttribute("data-prompt"));
    });
  });

  function renderExercise(key) {
    var item = exercises[key];
    exerciseBody.innerHTML = "<h3>" + item.title + "</h3><ol>" + item.steps.map(function (step) {
      return "<li>" + step + "</li>";
    }).join("") + "</ol>";
  }

  exerciseButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      exerciseButtons.forEach(function (b) { b.classList.remove("active"); });
      button.classList.add("active");
      renderExercise(button.getAttribute("data-exercise"));
    });
  });

  renderExercise("breath");
})();
