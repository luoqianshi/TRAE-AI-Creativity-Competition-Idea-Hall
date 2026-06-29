const recommendations = {
  awake: {
    name: "雾森柑橘复方油",
    note: "适合晨间扩香或办公前呼吸练习。"
  },
  balanced: {
    name: "清泉乳香复方油",
    note: "适合冥想、按摩和午后压力缓释。"
  },
  rest: {
    name: "月息薰衣草复方油",
    note: "适合睡前沐浴、枕边扩香和放松拉伸。"
  }
};

const ritualForm = document.querySelector(".ritual-panel");
const strength = document.querySelector("#strength");
const strengthValue = document.querySelector("#strengthValue");
const ritualResult = document.querySelector("#ritualResult");
const productButtons = document.querySelectorAll("[data-product]");
const contactForm = document.querySelector(".contact-form");
const formNote = document.querySelector(".form-note");
const revealItems = document.querySelectorAll(".reveal");

function updateRitual() {
  if (!ritualForm || !strength || !strengthValue || !ritualResult) return;

  const mood = ritualForm.elements.mood.value;
  const drops = strength.value;
  const recommendation = recommendations[mood];

  strengthValue.textContent = `${drops} 滴`;
  ritualResult.innerHTML = `
    <span>推荐：${recommendation.name}</span>
    <strong>扩香 ${drops} 滴，${recommendation.note}</strong>
  `;
}

if (ritualForm) {
  ritualForm.addEventListener("input", updateRitual);
}

productButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.add("is-added");
    button.textContent = "已加入愿望清单";
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formNote.textContent = "已收到预约信息，我们会尽快联系你。";
    contactForm.reset();
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
