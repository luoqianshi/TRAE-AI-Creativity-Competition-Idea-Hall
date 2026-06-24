const scenarios = {
  hospital: {
    title: "医院线上挂号",
    steps: [
      "先打开医院 App 或医院公众号，不要从陌生短信里的链接进入。",
      "点击“预约挂号”，选择常去的院区和科室。身体不舒服但不确定科室时，先选“全科/普通内科”。",
      "选择医生和时间。看清楚日期、上午或下午，不要着急付款。",
      "确认就诊人姓名和身份证信息，只确认自己的信息，不替陌生人操作。",
      "支付成功后，把挂号记录截图保存。到医院后拿截图给导诊台工作人员看。"
    ],
    question: "如果收到短信说“点击链接重新挂号”，你应该怎么做？",
    options: [
      { text: "马上点链接", ok: false },
      { text: "先打开官方 App 或打医院电话确认", ok: true },
      { text: "把身份证和验证码发过去", ok: false }
    ]
  },
  taxi: {
    title: "手机打车",
    steps: [
      "打开常用打车 App，先确认手机定位已经打开。",
      "在“你要去哪儿”里输入目的地，可以让家人提前帮你收藏常去地址。",
      "看清楚预估价格和车型，不要选择明显过贵的服务。",
      "司机接单后，核对车牌号、车型和司机信息，确认一致再上车。",
      "上车后可以点击“分享行程”给家人，路上不要给陌生司机转账或扫码付款。"
    ],
    question: "车到了以后，最重要先确认什么？",
    options: [
      { text: "车牌号和 App 显示一致", ok: true },
      { text: "司机说什么都相信", ok: false },
      { text: "先把钱转给司机", ok: false }
    ]
  },
  payment: {
    title: "扫码支付",
    steps: [
      "付款前先确认商家名称和金额，金额不对就不要继续。",
      "别人扫你的付款码时，不要把付款码截图发给任何人。",
      "你扫商家收款码时，输入金额后再确认一次小数点。",
      "支付需要密码、人脸或指纹时，确认是自己正在买的东西。",
      "付款完成后看一眼支付记录，如果金额异常，立刻联系家人或银行。"
    ],
    question: "陌生人让你把付款码截图发给他，你应该？",
    options: [
      { text: "发给他比较方便", ok: false },
      { text: "不发送，付款码不能给别人", ok: true },
      { text: "先发一半截图", ok: false }
    ]
  }
};

const answerBank = [
  {
    keys: ["验证码", "短信码", "动态码"],
    answer:
      "验证码就像家门钥匙。别人拿到验证码，就可能进入你的账户、转走钱或修改信息。任何陌生人要验证码，都先不要给，先问家人或拨打官方电话确认。"
  },
  {
    keys: ["链接", "短信", "点开"],
    answer:
      "陌生短信里的链接不要随便点。真正的医院、银行、社保通知，通常可以从官方 App、公众号或客服电话核实。先核实，再操作。"
  },
  {
    keys: ["支付", "付款", "转账", "银行卡"],
    answer:
      "付款和转账前先停 10 秒，看清楚收款人、金额和用途。只要对方催你、吓你、让你保密，就很可能有风险。"
  },
  {
    keys: ["挂号", "医院", "看病"],
    answer:
      "线上挂号时，尽量从医院官方 App、公众号或医院现场工作人员提供的入口进入。不要从陌生短信链接进入，也不要把身份证、银行卡和验证码发给别人。"
  }
];

const riskRules = [
  { key: "验证码", label: "索要验证码", score: 3 },
  { key: "银行卡", label: "索要银行卡信息", score: 3 },
  { key: "转账", label: "要求转账", score: 3 },
  { key: "手续费", label: "先交手续费", score: 3 },
  { key: "链接", label: "引导点击陌生链接", score: 2 },
  { key: "冻结", label: "制造账户冻结恐慌", score: 2 },
  { key: "异常", label: "制造账户异常恐慌", score: 2 },
  { key: "中奖", label: "中奖诱导", score: 2 },
  { key: "身份证", label: "索要身份信息", score: 2 },
  { key: "立即", label: "制造紧迫感", score: 1 }
];

const state = {
  scenario: "hospital"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function renderScenario(key) {
  const scenario = scenarios[key];
  state.scenario = key;
  $("#scenarioTitle").textContent = scenario.title;
  $("#steps").innerHTML = scenario.steps.map((step) => `<li>${step}</li>`).join("");
  $("#practiceQuestion").textContent = scenario.question;
  $("#practiceFeedback").textContent = "";
  $("#practiceOptions").innerHTML = scenario.options
    .map((option) => `<button type="button" data-ok="${option.ok}">${option.text}</button>`)
    .join("");

  $$(".scenario").forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === key);
  });
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    alert("当前浏览器暂不支持语音朗读，可以直接阅读步骤卡片。");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
}

function checkFraud() {
  const text = $("#fraudText").value.trim();
  const hits = riskRules.filter((rule) => text.includes(rule.key));
  const score = hits.reduce((sum, rule) => sum + rule.score, 0);
  const result = $("#fraudResult");

  let level = "低风险";
  let className = "safe";
  let advice = "暂未发现明显诈骗关键词，但仍建议从官方渠道核实，不要向陌生人透露个人信息。";

  if (score >= 6) {
    level = "高风险，疑似诈骗";
    className = "risky";
    advice = "不要点击链接，不要转账，不要提供验证码、身份证或银行卡。建议立刻联系家人，或拨打官方客服电话核实。";
  } else if (score >= 3) {
    level = "中风险，需要核实";
    className = "warning";
    advice = "内容里出现了容易被诈骗利用的说法。先暂停操作，从官方 App、客服电话或线下窗口确认。";
  }

  result.className = `result-card ${className}`;
  result.innerHTML = `
    <p class="eyebrow">识别结果</p>
    <h3>${level}</h3>
    <p>${advice}</p>
    ${
      hits.length
        ? `<strong>发现的风险点：</strong><ul class="risk-list">${hits
            .map((hit) => `<li>${hit.label}</li>`)
            .join("")}</ul>`
        : "<p>没有命中高危关键词，但现实中仍要保持谨慎。</p>"
    }
  `;
}

function answerQuestion() {
  const question = $("#questionInput").value.trim();
  const matched = answerBank.find((item) => item.keys.some((key) => question.includes(key)));
  const answer = matched
    ? matched.answer
    : "这个问题可以先按“三不一问”处理：不点陌生链接、不发验证码、不急着转账，先问家人或官方客服。银龄桥会把复杂操作拆成一步一步的小卡片，陪你慢慢练。";

  $("#answerBox").innerHTML = `<strong>银龄桥回答：</strong><p>${answer}</p>`;
}

function addFamilyCard(event) {
  event.preventDefault();
  const title = $("#customTitle").value.trim();
  const note = $("#customNote").value.trim();
  if (!title || !note) return;

  const li = document.createElement("li");
  li.innerHTML = `<strong>${title}</strong><span>${note}</span>`;
  $("#familyCards").prepend(li);
  $("#familyForm").reset();
}

function bindEvents() {
  $$(".scenario").forEach((button) => {
    button.addEventListener("click", () => renderScenario(button.dataset.scenario));
  });

  $("#practiceOptions").addEventListener("click", (event) => {
    if (event.target.tagName !== "BUTTON") return;
    const ok = event.target.dataset.ok === "true";
    $("#practiceFeedback").textContent = ok
      ? "答对了！遇到不确定的操作，先核实官方入口。"
      : "这个选择有风险。记住：陌生链接、验证码、转账都要先停下来。";
    $("#practiceFeedback").style.color = ok ? "#0f766e" : "#dc2626";
  });

  $("#readSteps").addEventListener("click", () => {
    const scenario = scenarios[state.scenario];
    speak(`${scenario.title}。${scenario.steps.join("。")}`);
  });

  $("#checkFraud").addEventListener("click", checkFraud);
  $("#askButton").addEventListener("click", answerQuestion);
  $("#familyForm").addEventListener("submit", addFamilyCard);

  $$(".sample").forEach((button) => {
    button.addEventListener("click", () => {
      $("#fraudText").value = button.dataset.sample;
      checkFraud();
    });
  });

  $("[data-jump='coach']").addEventListener("click", () => $("#coach").scrollIntoView({ behavior: "smooth" }));
  $$("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = $(`#${button.dataset.jump}`);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  $("#largeTextToggle").addEventListener("click", () => {
    document.body.classList.toggle("large-text");
    $("#largeTextToggle").textContent = document.body.classList.contains("large-text") ? "关闭超大字" : "开启超大字";
  });
}

renderScenario("hospital");
bindEvents();
