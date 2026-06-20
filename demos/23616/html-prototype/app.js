const root = document.documentElement;
const viewport = document.getElementById("appViewport");
const toast = document.getElementById("toast");
const tabScreens = new Set(["library", "search", "create", "import", "settings"]);

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("lifetips-prototype-theme", theme);
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.themeChoice === theme);
  });
  renderQr();
}

function showScreen(name) {
  const screen = document.querySelector(`[data-screen="${name}"]`);
  if (!screen) return;

  document.querySelectorAll(".screen").forEach((item) => {
    item.classList.toggle("is-active", item === screen);
  });

  viewport.classList.toggle("no-tab", screen.dataset.tab === "false");

  document.querySelectorAll(".tab-bar [data-go]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.go === name && tabScreens.has(name));
  });

  screen.scrollTop = 0;
  renderQr();
  refreshIcons();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 1700);
}

function renderQr() {
  const canvas = document.getElementById("qrCanvas");
  if (!canvas || !window.QRious) return;

  const isDark = root.dataset.theme === "dark";
  new window.QRious({
    element: canvas,
    value: "lifetips://import?payload=demo-water-kettle-tip-v1",
    size: 120,
    level: "M",
    foreground: isDark ? "#111513" : "#17201b",
    background: "#ffffff",
    padding: 8,
  });
}

document.addEventListener("click", (event) => {
  const themeButton = event.target.closest("[data-theme-choice]");
  if (themeButton) {
    setTheme(themeButton.dataset.themeChoice);
    return;
  }

  const navButton = event.target.closest("[data-go]");
  if (navButton) {
    showScreen(navButton.dataset.go);
    return;
  }

  const chip = event.target.closest(".chip");
  if (chip && chip.parentElement?.classList.contains("chip-row")) {
    chip.parentElement.querySelectorAll(".chip").forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");
  }
});

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-mode]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    document.getElementById("pastePanel").hidden = button.dataset.mode !== "paste";
    refreshIcons();
  });
});

document.getElementById("clearSearch")?.addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("resultCount").textContent = "0";
  document.querySelector(".result-list").innerHTML = `
    <div class="result-row">
      <strong>没找到相关妙招</strong>
      <span>可以减少筛选条件，或新建一个妙招。</span>
    </div>
  `;
});

document.getElementById("saveTip")?.addEventListener("click", () => {
  showScreen("detail");
  showToast("妙招已保存");
});

document.getElementById("saveCard")?.addEventListener("click", () => showToast("分享卡片已保存"));
document.getElementById("albumSave")?.addEventListener("click", () => showToast("已保存到相册"));
document.getElementById("confirmSave")?.addEventListener("click", () => {
  showScreen("library");
  showToast("已保存到本地妙招库");
});

const savedTheme = localStorage.getItem("lifetips-prototype-theme") || "clean";
setTheme(savedTheme);
showScreen("library");
refreshIcons();
