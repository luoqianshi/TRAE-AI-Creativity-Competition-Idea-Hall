const mealPlans = [
  [
    {
      time: "早",
      title: "温牛奶燕麦糊 + 蒸蛋羹",
      desc: "燕麦打细煮软，蛋羹过筛，入口温度控制在不烫口。",
      tags: ["流质", "高蛋白", "易吞咽"],
    },
    {
      time: "午",
      title: "鱼泥豆腐羹 + 南瓜米汤",
      desc: "鱼肉去刺打泥，豆腐压碎同煮，少盐不放葱姜辣椒。",
      tags: ["补蛋白", "低刺激", "少渣"],
    },
    {
      time: "晚",
      title: "鸡肉蔬菜浓汤",
      desc: "鸡胸肉和胡萝卜煮熟后破壁，质地细腻再入口。",
      tags: ["恢复期", "低脂", "温和"],
    },
  ],
  [
    {
      time: "早",
      title: "豆腐脑 + 无糖酸奶",
      desc: "选择原味少糖，酸奶若刺激口腔可换成常温牛奶。",
      tags: ["软嫩", "蛋白", "好入口"],
    },
    {
      time: "午",
      title: "虾仁蛋花粥",
      desc: "虾仁打碎后入粥，粥体煮至顺滑，不保留明显颗粒。",
      tags: ["半流质", "补锌", "易消化"],
    },
    {
      time: "晚",
      title: "山药牛肉泥羹",
      desc: "牛肉少量多次，打细后和山药同煮，避免纤维感明显。",
      tags: ["补铁", "增能量", "少盐"],
    },
  ],
];

const recipes = {
  optimize: [
    {
      title: "把白粥升级成蛋白粥",
      desc: "在白粥里加入蛋液、鱼泥或豆腐泥，提升蛋白密度，仍保持顺滑质地。",
      tags: ["现有饮食优化", "蛋白提升"],
    },
    {
      title: "把果汁换成果泥奶昔",
      desc: "香蕉或熟梨打成泥，加入牛奶或酸奶。避免酸味水果刺激口腔。",
      tags: ["加餐", "少刺激"],
    },
  ],
  generate: [
    {
      title: "三餐一加餐流质方案",
      desc: "早餐蛋羹奶糊，午餐鱼泥豆腐羹，下午酸奶，晚餐鸡肉蔬菜浓汤。",
      tags: ["从零生成", "第 1-7 天"],
    },
    {
      title: "半流质过渡方案",
      desc: "适合 8-30 天：软烂面片、虾仁蛋花粥、肉末豆腐和细碎软菜。",
      tags: ["阶段过渡", "8-30 天"],
    },
  ],
};

const ingredientMap = {
  "牛奶": {
    status: "ok",
    label: "适合",
    text: "可作为蛋白和能量来源。建议常温或温热饮用，乳糖不耐受可换无乳糖奶或酸奶。",
  },
  "鱼肉": {
    status: "ok",
    label: "适合",
    text: "优质蛋白，当前阶段需去刺、打泥、煮软，避免煎炸和重口调味。",
  },
  "辣椒": {
    status: "no",
    label: "不建议",
    text: "颌面术后阶段应避开辛辣刺激，可能加重疼痛、水肿或黏膜不适。",
  },
  "坚果": {
    status: "no",
    label: "不建议",
    text: "颗粒硬且渣多，容易摩擦创口或卡在口腔内。恢复到普通饮食后再少量尝试。",
  },
  "酸奶": {
    status: "warn",
    label: "看情况",
    text: "蛋白友好，但酸味可能刺激口腔。优先选原味、低糖、常温，若刺痛就暂停。",
  },
};

let planIndex = 0;
let currentMode = "optimize";

const mealTimeline = document.querySelector("#mealTimeline");
const recipeList = document.querySelector("#recipeList");
const ingredientInput = document.querySelector("#ingredientInput");
const ingredientResult = document.querySelector("#ingredientResult");
const recordForm = document.querySelector("#recordForm");
const feedbackCard = document.querySelector("#feedbackCard");

function renderMeals() {
  mealTimeline.innerHTML = mealPlans[planIndex]
    .map(
      (meal) => `
        <article class="meal-card">
          <div class="meal-time">${meal.time}</div>
          <div>
            <h3>${meal.title}</h3>
            <p>${meal.desc}</p>
            <div class="tag-row">${meal.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderRecipes() {
  recipeList.innerHTML = recipes[currentMode]
    .map(
      (item) => `
        <article class="recipe-card">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <div class="tag-row">${item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </article>
      `,
    )
    .join("");
}

function renderIngredient(name = "牛奶") {
  const key = Object.keys(ingredientMap).find((item) => name.includes(item));
  const data = ingredientMap[key] || {
    status: "warn",
    label: "需确认",
    text: "当前 demo 暂无该食材规则。建议先判断是否辛辣、坚硬、多渣、过酸或过烫，再结合医生建议。",
  };

  ingredientResult.innerHTML = `
    <span class="status ${data.status}">${data.label}</span>
    <h3>${name || "输入食材"}</h3>
    <p>${data.text}</p>
  `;
}

function switchView(viewName) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === viewName);
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
}

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelector("#refreshPlan").addEventListener("click", () => {
  planIndex = (planIndex + 1) % mealPlans.length;
  renderMeals();
});

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    currentMode = button.dataset.mode;
    document.querySelectorAll("[data-mode]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderRecipes();
  });
});

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const sheet = document.querySelector(`#${button.dataset.open}`);
    sheet.classList.add("open");
    sheet.setAttribute("aria-hidden", "false");
  });
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const sheet = document.querySelector(`#${button.dataset.close}`);
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
  });
});

ingredientInput.addEventListener("input", (event) => {
  renderIngredient(event.target.value.trim() || "输入食材");
});

document.querySelectorAll("[data-ingredient]").forEach((button) => {
  button.addEventListener("click", () => {
    ingredientInput.value = button.dataset.ingredient;
    renderIngredient(button.dataset.ingredient);
  });
});

recordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const mealType = document.querySelector("#mealType").value;
  const mealText = document.querySelector("#mealText").value || "未填写具体食物";
  const feel = document.querySelector("#mealFeel").value;

  feedbackCard.innerHTML = `
    <h3>${mealType}已记录</h3>
    <p>${mealText}。吞咽顺畅度 ${feel}/5。系统建议下一餐继续保持细软少渣，若蛋白不足，可补充蛋羹、鱼泥或豆腐脑。</p>
  `;
  recordForm.reset();
});

renderMeals();
renderRecipes();
renderIngredient();
