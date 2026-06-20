/* ==========================================================
   年年有印 · 创作流程（勾线→刻版→套色→印制）
   ========================================================== */

(function () {
  // 全局状态
  const state = {
    step: 1,
    template: "door",
    keyword: "",
    style: "classic",
    lineSvg: null,
    colors: {
      main: "#b7282e",
      accent: "#c9a24b",
      line: "#1d1a16",
      bg: "#fdf6e3"
    },
    paper: "xuan",
    gold: false,
    vignette: true,
    stamp: "",
    history: [],
    historyIdx: -1
  };

  function $(sel, root = document) { return root.querySelector(sel); }
  function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function showToast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function goStep(n) {
    state.step = n;
    $$(".work-step").forEach((s) => {
      s.classList.toggle("active", Number(s.dataset.step) === n);
    });
    $$(".ps-item").forEach((it, idx) => {
      const sn = idx + 1;
      it.classList.toggle("active", sn === n);
      it.classList.toggle("done", sn < n);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (n === 2) initCarve();
    if (n === 3) initColor();
    if (n === 4) initPrint();
  }

  /* ========== 模板 SVG ========== */
  function plum(x, y, r, main, accent, line) {
    return `<g transform="translate(${x}, ${y})">
      <circle cx="0" cy="-${r}" r="${r * 0.9}" fill="${main}" stroke="${line}" stroke-width="1.5"/>
      <circle cx="${r}" cy="0" r="${r * 0.9}" fill="${main}" stroke="${line}" stroke-width="1.5"/>
      <circle cx="0" cy="${r}" r="${r * 0.9}" fill="${main}" stroke="${line}" stroke-width="1.5"/>
      <circle cx="-${r}" cy="0" r="${r * 0.9}" fill="${main}" stroke="${line}" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="${r * 0.6}" fill="${main}" stroke="${line}" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="${r * 0.25}" fill="${accent}"/>
    </g>`;
  }

  function buildTemplate(tpl, opts) {
    const main = opts.FILL_MAIN, accent = opts.FILL_ACCENT, bg = opts.FILL_BG, line = opts.LINE_STROKE;
    if (tpl === "door") {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520"><rect width="400" height="520" fill="${bg}"/>
        <rect x="30" y="30" width="340" height="460" fill="none" stroke="${line}" stroke-width="3"/>
        <rect x="40" y="40" width="320" height="440" fill="none" stroke="${line}" stroke-width="1"/>
        <path d="M140 140 Q200 90 260 140 L260 170 L140 170 Z" fill="${main}" stroke="${line}" stroke-width="3"/>
        <circle cx="200" cy="135" r="12" fill="${accent}" stroke="${line}" stroke-width="2"/>
        <ellipse cx="200" cy="210" rx="50" ry="55" fill="#f5cfb0" stroke="${line}" stroke-width="3"/>
        <path d="M170 195 L190 190 M230 190 L210 195" stroke="${line}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <ellipse cx="183" cy="208" rx="6" ry="4" fill="${line}"/>
        <ellipse cx="217" cy="208" rx="6" ry="4" fill="${line}"/>
        <path d="M175 245 Q170 280 190 310 M225 245 Q230 280 220 310" stroke="${line}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M185 245 Q200 255 215 245" stroke="${line}" stroke-width="3" fill="none"/>
        <path d="M130 280 L270 280 L290 420 L110 420 Z" fill="${main}" stroke="${line}" stroke-width="3"/>
        <g stroke="${line}" stroke-width="2"><path d="M150 305 L250 305"/><path d="M150 330 L250 330"/><path d="M150 355 L250 355"/><path d="M150 380 L250 380"/></g>
        <circle cx="200" cy="340" r="22" fill="${accent}" stroke="${line}" stroke-width="3"/>
        <circle cx="200" cy="340" r="10" fill="${main}" stroke="${line}" stroke-width="1.5"/>
        <line x1="90" y1="250" x2="90" y2="460" stroke="${line}" stroke-width="5"/>
        <path d="M70 250 L110 250 L100 220 Z" fill="${main}" stroke="${line}" stroke-width="2"/>
        <line x1="310" y1="250" x2="310" y2="460" stroke="${line}" stroke-width="5"/>
        <path d="M290 250 L330 250 L300 220 Z" fill="${main}" stroke="${line}" stroke-width="2"/>
        <circle cx="80" cy="480" r="16" fill="${main}" stroke="${line}" stroke-width="2"/>
        <circle cx="320" cy="480" r="16" fill="${main}" stroke="${line}" stroke-width="2"/>
        <g transform="translate(300, 430)"><rect width="65" height="65" fill="${main}" stroke="${line}" stroke-width="2"/>
        <text x="32" y="28" font-family="serif" font-size="16" fill="${bg}" text-anchor="middle" font-weight="bold">鎮宅</text>
        <text x="32" y="52" font-family="serif" font-size="16" fill="${bg}" text-anchor="middle" font-weight="bold">納福</text></g></svg>`;
    }
    if (tpl === "fish") {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520"><rect width="400" height="520" fill="${bg}"/>
        <rect x="30" y="30" width="340" height="460" fill="none" stroke="${line}" stroke-width="3"/>
        <ellipse cx="200" cy="260" rx="100" ry="110" fill="#f5cfb0" stroke="${line}" stroke-width="3"/>
        <circle cx="200" cy="160" r="65" fill="#f5cfb0" stroke="${line}" stroke-width="3"/>
        <path d="M145 140 Q170 100 200 105 Q230 100 255 140 Q250 125 235 120 Q215 118 200 118 Q185 118 165 120 Q150 125 145 140 Z" fill="${line}"/>
        <circle cx="200" cy="100" r="12" fill="${line}"/>
        <circle cx="170" cy="170" r="14" fill="${main}" opacity="0.4"/>
        <circle cx="230" cy="170" r="14" fill="${main}" opacity="0.4"/>
        <path d="M175 150 Q185 145 195 150" stroke="${line}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M205 150 Q215 145 225 150" stroke="${line}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="185" cy="150" r="3" fill="${line}"/>
        <circle cx="215" cy="150" r="3" fill="${line}"/>
        <path d="M190 180 Q200 188 210 180" stroke="${line}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M140 230 L260 230 L280 330 L120 330 Z" fill="${main}" stroke="${line}" stroke-width="3"/>
        <circle cx="200" cy="280" r="18" fill="${accent}" stroke="${line}" stroke-width="2"/>
        <path d="M60 370 Q100 340 200 355 Q280 345 340 370 Q300 420 200 415 Q100 420 60 370 Z" fill="${main}" stroke="${line}" stroke-width="3"/>
        <path d="M335 370 L375 345 L360 375 L380 385 L360 395 L375 425 L335 400 Z" fill="${main}" stroke="${line}" stroke-width="3"/>
        <circle cx="85" cy="362" r="10" fill="${bg}" stroke="${line}" stroke-width="2"/>
        <circle cx="83" cy="362" r="5" fill="${line}"/>
        <path d="M180 345 Q170 320 195 325 Q210 330 200 350 Z" fill="${accent}" stroke="${line}" stroke-width="2"/>
        ${plum(80, 440, 10, main, accent, line)}
        <g transform="translate(300, 450)"><rect width="70" height="70" fill="${main}" stroke="${line}" stroke-width="2"/>
        <text x="35" y="30" font-family="serif" font-size="17" fill="${bg}" text-anchor="middle" font-weight="bold">連年</text>
        <text x="35" y="55" font-family="serif" font-size="17" fill="${bg}" text-anchor="middle" font-weight="bold">有餘</text></g></svg>`;
    }
    if (tpl === "fortune") {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520"><rect width="400" height="520" fill="${bg}"/>
        <rect x="30" y="30" width="340" height="460" fill="none" stroke="${line}" stroke-width="3"/>
        <path d="M130 130 L270 130 L280 170 L120 170 Z" fill="${main}" stroke="${line}" stroke-width="3"/>
        <rect x="180" y="110" width="40" height="25" fill="${accent}" stroke="${line}" stroke-width="2"/>
        <ellipse cx="200" cy="210" rx="50" ry="55" fill="#f5cfb0" stroke="${line}" stroke-width="3"/>
        <path d="M165 185 Q180 175 195 190" stroke="${line}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M205 190 Q220 175 235 185" stroke="${line}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="180" cy="205" r="5" fill="${line}"/>
        <circle cx="220" cy="205" r="5" fill="${line}"/>
        <path d="M180 245 Q170 310 190 380 M220 245 Q230 310 210 380" stroke="${line}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M190 245 Q200 255 210 245" stroke="${line}" stroke-width="3" fill="none"/>
        <path d="M110 270 L290 270 L320 460 L80 460 Z" fill="${main}" stroke="${line}" stroke-width="3"/>
        <rect x="110" y="330" width="180" height="25" fill="${accent}" stroke="${line}" stroke-width="2"/>
        <g transform="translate(140, 400)"><path d="M0 30 Q0 0 60 0 Q120 0 120 30 Z" fill="${accent}" stroke="${line}" stroke-width="2"/>
        <ellipse cx="60" cy="25" rx="55" ry="8" fill="${accent}" stroke="${line}" stroke-width="2"/>
        <rect x="20" y="8" width="80" height="14" fill="${accent}" stroke="${line}" stroke-width="2"/></g>
        <path d="M300 280 L340 360 L325 365 L285 285 Z" fill="${accent}" stroke="${line}" stroke-width="2"/>
        <circle cx="332" cy="360" r="12" fill="${main}" stroke="${line}" stroke-width="2"/>
        <text x="80" y="120" font-family="serif" font-size="60" fill="${main}" font-weight="bold" stroke="${line}" stroke-width="1.5">福</text>
        <g transform="translate(305, 60)"><rect width="55" height="55" fill="${main}" stroke="${line}" stroke-width="2"/>
        <text x="27" y="24" font-family="serif" font-size="14" fill="${bg}" text-anchor="middle" font-weight="bold">招財</text>
        <text x="27" y="44" font-family="serif" font-size="14" fill="${bg}" text-anchor="middle" font-weight="bold">進寶</text></g></svg>`;
    }
    if (tpl === "spring") {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520"><rect width="400" height="520" fill="${bg}"/>
        <rect x="30" y="30" width="340" height="460" fill="none" stroke="${line}" stroke-width="3"/>
        <g stroke="${line}" stroke-width="4" fill="none" stroke-linecap="round">
        <path d="M60 480 Q80 420 120 380 Q140 340 180 320 Q220 280 280 260 Q320 240 360 230"/>
        <path d="M120 380 L100 350"/><path d="M180 320 L200 290"/>
        <path d="M280 260 L300 210"/><path d="M220 280 L250 250"/></g>
        ${[
          [100, 350, 14], [125, 390, 12], [175, 315, 15], [195, 285, 11],
          [220, 270, 13], [250, 250, 12], [285, 255, 14], [310, 215, 11], [340, 235, 13]
        ].map(([x, y, r]) => plum(x, y, r, main, accent, line)).join("")}
        <g transform="translate(180, 130)">
        <ellipse cx="0" cy="0" rx="40" ry="28" fill="${line}"/>
        <circle cx="-35" cy="-15" r="18" fill="${line}"/>
        <circle cx="-42" cy="-18" r="3" fill="${accent}"/>
        <path d="M-50 -15 L-65 -10 L-50 -8 Z" fill="${accent}" stroke="${line}" stroke-width="1.5"/>
        <path d="M30 5 L70 -15 L65 10 Z" fill="${line}"/>
        <path d="M-5 -10 Q10 -25 25 -5 Q15 5 -5 0 Z" fill="#3a3228" stroke="${line}" stroke-width="1.5"/>
        <line x1="-10" y1="25" x2="-10" y2="45" stroke="${line}" stroke-width="3"/>
        <line x1="10" y1="25" x2="10" y2="45" stroke="${line}" stroke-width="3"/></g>
        <text x="200" y="490" font-family="serif" font-size="70" fill="${main}" font-weight="bold" text-anchor="middle" stroke="${line}" stroke-width="2">春</text>
        <g transform="translate(300, 430)"><rect width="70" height="70" fill="${main}" stroke="${line}" stroke-width="2"/>
        <text x="35" y="30" font-family="serif" font-size="17" fill="${bg}" text-anchor="middle" font-weight="bold">喜上</text>
        <text x="35" y="55" font-family="serif" font-size="17" fill="${bg}" text-anchor="middle" font-weight="bold">眉梢</text></g></svg>`;
    }
    if (tpl === "magpie") {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520"><rect width="400" height="520" fill="${bg}"/>
        <rect x="30" y="30" width="340" height="460" fill="none" stroke="${line}" stroke-width="3"/>
        <circle cx="280" cy="180" r="60" fill="${accent}" opacity="0.35" stroke="${line}" stroke-width="2"/>
        <circle cx="280" cy="180" r="48" fill="${bg}" stroke="${line}" stroke-width="2"/>
        <g stroke="${line}" stroke-width="5" fill="none" stroke-linecap="round">
        <path d="M50 490 Q100 400 160 380 Q230 360 280 300 Q320 260 360 240"/>
        <path d="M160 380 Q180 360 210 350"/>
        <path d="M280 300 Q300 290 330 290"/></g>
        ${[[150, 300, 1], [290, 250, 0.85]].map(([cx, cy, s]) => `
        <g transform="translate(${cx}, ${cy}) scale(${s})">
        <ellipse cx="0" cy="0" rx="35" ry="22" fill="${line}"/>
        <circle cx="-30" cy="-12" r="15" fill="${line}"/>
        <circle cx="-36" cy="-14" r="2.5" fill="${accent}"/>
        <path d="M-42 -12 L-55 -8 L-42 -6 Z" fill="${accent}"/>
        <path d="M28 5 L60 -10 L55 12 Z" fill="${line}"/></g>`).join("")}
        ${[[180, 370, 10], [230, 360, 9], [310, 280, 10], [340, 295, 9], [100, 430, 11]]
          .map(([x, y, r]) => plum(x, y, r, main, accent, line)).join("")}
        <text x="100" y="160" font-family="serif" font-size="80" fill="${main}" font-weight="bold" stroke="${line}" stroke-width="2">喜</text>
        <g transform="translate(300, 450)"><rect width="70" height="70" fill="${main}" stroke="${line}" stroke-width="2"/>
        <text x="35" y="30" font-family="serif" font-size="16" fill="${bg}" text-anchor="middle" font-weight="bold">迎春</text>
        <text x="35" y="55" font-family="serif" font-size="16" fill="${bg}" text-anchor="middle" font-weight="bold">納福</text></g></svg>`;
    }
    if (tpl === "fu") {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520"><rect width="400" height="520" fill="${bg}"/>
        <rect x="30" y="30" width="340" height="460" fill="none" stroke="${line}" stroke-width="3"/>
        <g transform="translate(200 260) rotate(45)">
        <rect x="-150" y="-150" width="300" height="300" fill="${main}" stroke="${line}" stroke-width="4"/>
        <rect x="-135" y="-135" width="270" height="270" fill="none" stroke="${accent}" stroke-width="2"/></g>
        <text x="200" y="330" font-family="serif" font-size="280" fill="${bg}" font-weight="900" text-anchor="middle" stroke="${line}" stroke-width="3">福</text>
        <g fill="${accent}" stroke="${line}" stroke-width="2">
        ${[[80, 100], [320, 100], [80, 420], [320, 420]].map(([x, y]) =>
          `<g transform="translate(${x}, ${y})"><path d="M0 0 Q-15 -10 -25 0 Q-15 5 0 0 Q15 5 25 0 Q15 -10 0 0 Z"/></g>`
        ).join("")}</g>
        <text x="200" y="80" font-family="serif" font-size="28" fill="${main}" font-weight="bold" text-anchor="middle" letter-spacing="8">五福臨門</text>
        <g transform="translate(305, 450)"><rect width="65" height="65" fill="${accent}" stroke="${line}" stroke-width="2"/>
        <text x="32" y="28" font-family="serif" font-size="16" fill="${bg}" text-anchor="middle" font-weight="bold">吉祥</text>
        <text x="32" y="52" font-family="serif" font-size="16" fill="${bg}" text-anchor="middle" font-weight="bold">如意</text></g></svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520"><rect width="400" height="520" fill="${bg}"/></svg>`;
  }

  function getSvg(forLine) {
    const opts = {
      FILL_MAIN: forLine ? state.colors.bg : state.colors.main,
      FILL_ACCENT: forLine ? state.colors.bg : state.colors.accent,
      FILL_BG: state.colors.bg,
      LINE_STROKE: state.colors.line
    };
    if (forLine) opts.LINE_STROKE = "#1d1a16";
    return buildTemplate(state.template, opts);
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  /* ========== 步骤 1：勾线 ========== */
  function renderLinePreview() {
    const frame = document.getElementById("canvas1");
    if (!frame) return;
    const pl = frame.querySelector(".canvas-placeholder");
    if (pl) pl.remove();
    let old = frame.querySelector("svg, .svg-wrap");
    if (old) old.remove();

    const svg = getSvg(true);
    state.lineSvg = svg;
    const wrap = document.createElement("div");
    wrap.className = "svg-wrap";
    wrap.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;";
    wrap.innerHTML = svg;
    frame.appendChild(wrap);

    const names = { door: "门神", fish: "连年有余", fortune: "财神", spring: "春回", magpie: "喜上眉梢", fu: "大福字" };
    const styles = { classic: "传统线稿", modern: "现代极简", heavy: "粗线条" };
    document.getElementById("canvas1Title").textContent = names[state.template] || "自定义";
    document.getElementById("canvas1Style").textContent = styles[state.style];
  }

  function setupStep1() {
    $$(".tp-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".tp-item").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.template = btn.dataset.tpl;
        renderLinePreview();
      });
    });
    const tpl = getQueryParam("template");
    if (tpl && TEMPLATES !== undefined) {
      const hit = $$(".tp-item").find((b) => b.dataset.tpl === tpl);
      if (hit) hit.click();
    }

    const kw = document.getElementById("keyword");
    if (kw) kw.addEventListener("input", (e) => state.keyword = e.target.value);

    // 风格 seg-group（只针对 data-style）
    $$(".seg-group").forEach((group) => {
      const items = group.querySelectorAll(".seg-item[data-style]");
      if (items.length === 0) return;
      items.forEach((btn) => {
        btn.addEventListener("click", () => {
          items.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          state.style = btn.dataset.style;
          renderLinePreview();
        });
      });
    });

    const genBtn = document.getElementById("btnGenLine");
    if (genBtn) {
      genBtn.addEventListener("click", () => {
        const frame = document.getElementById("canvas1");
        const loader = document.createElement("div");
        loader.className = "loading-overlay";
        loader.innerHTML = `<div class="loading-icon">✦</div><div class="loading-text">AI 勾画中...</div>`;
        frame.appendChild(loader);
        setTimeout(() => {
          loader.remove();
          renderLinePreview();
          showToast("线稿生成完成");
          let nextBtn = document.getElementById("btnLineToCarve");
          if (!nextBtn) {
            nextBtn = document.createElement("button");
            nextBtn.id = "btnLineToCarve";
            nextBtn.className = "btn btn-primary btn-block";
            nextBtn.style.marginTop = "14px";
            nextBtn.textContent = "→ 进入刻版工序";
            nextBtn.addEventListener("click", () => goStep(2));
            document.querySelector("#line .work-panel").appendChild(nextBtn);
          }
        }, 800);
      });
    }
    renderLinePreview();
  }

  // 暴露到全局，供其它文件使用
  window.__nainian = { goStep, state, buildTemplate };
  window.goStep = goStep;

  setupStep1();

  /* ========== 步骤 2：刻版 ========== */
  let carveCanvas, carveCtx;
  let carving = false;
  let carveTool = "erase";
  let carveBrush = 14;

  function initCarve() {
    setTimeout(() => {
      carveCanvas = document.getElementById("carveCanvas");
      if (!carveCanvas) return;
      const rect = carveCanvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const W = rect.width, H = rect.height;
      carveCanvas.width = W * dpr;
      carveCanvas.height = H * dpr;
      carveCanvas.style.width = W + "px";
      carveCanvas.style.height = H + "px";
      carveCtx = carveCanvas.getContext("2d");
      carveCtx.scale(dpr, dpr);

      drawCarveBase(W, H);

      if (!initCarve._bound) {
        bindCarveEvents();
        initCarve._bound = true;
      }
      state.history = [];
      state.historyIdx = -1;
      pushHistory();
      updateCarveStat();
    }, 80);
  }

  function drawCarveBase(W, H) {
    const grad = carveCtx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#e8c98a");
    grad.addColorStop(1, "#d4a870");
    carveCtx.fillStyle = grad;
    carveCtx.fillRect(0, 0, W, H);
    carveCtx.strokeStyle = "rgba(90, 60, 30, 0.22)";
    carveCtx.lineWidth = 1;
    for (let y = 0; y < H; y += 5 + Math.random() * 5) {
      carveCtx.beginPath();
      carveCtx.moveTo(0, y);
      for (let x = 0; x < W; x += 20) carveCtx.lineTo(x, y + (Math.random() - 0.5) * 2);
      carveCtx.stroke();
    }
    if (state.lineSvg) {
      const img = new Image();
      const blob = new Blob([state.lineSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const ratio = img.width / img.height;
        let drawW, drawH, dx, dy;
        if (W / H > ratio) { drawH = H * 0.9; drawW = drawH * ratio; }
        else { drawW = W * 0.9; drawH = drawW / ratio; }
        dx = (W - drawW) / 2; dy = (H - drawH) / 2;
        carveCtx.drawImage(img, dx, dy, drawW, drawH);
        URL.revokeObjectURL(url);
        pushHistory();
        updateCarveStat();
      };
      img.src = url;
    }
  }

  function bindCarveEvents() {
    $$(".tool-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".tool-item").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        carveTool = btn.dataset.tool;
      });
    });
    const slider = document.getElementById("brushSize");
    const val = document.getElementById("brushVal");
    if (slider) {
      slider.addEventListener("input", () => {
        carveBrush = Number(slider.value);
        if (val) val.textContent = carveBrush;
      });
    }
    const overlay = carveCanvas;
    const getPos = (e) => {
      const r = overlay.getBoundingClientRect();
      const ev = e.touches ? e.touches[0] : e;
      return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    };
    let moved = false;
    const startDraw = (e) => {
      e.preventDefault();
      carving = true;
      moved = false;
      const { x, y } = getPos(e);
      applyCarve(x, y);
    };
    const moveDraw = (e) => {
      if (!carving) return;
      e.preventDefault();
      moved = true;
      const { x, y } = getPos(e);
      applyCarve(x, y);
    };
    const endDraw = () => {
      if (carving) {
        carving = false;
        if (moved) { pushHistory(); updateCarveStat(); }
      }
    };
    overlay.addEventListener("mousedown", startDraw);
    overlay.addEventListener("mousemove", moveDraw);
    overlay.addEventListener("mouseup", endDraw);
    overlay.addEventListener("mouseleave", endDraw);
    overlay.addEventListener("touchstart", startDraw, { passive: false });
    overlay.addEventListener("touchmove", moveDraw, { passive: false });
    overlay.addEventListener("touchend", endDraw);

    document.getElementById("btnUndo").addEventListener("click", () => {
      if (state.historyIdx > 0) { state.historyIdx--; restoreHistory(); updateCarveStat(); }
    });
    document.getElementById("btnRedo").addEventListener("click", () => {
      if (state.historyIdx < state.history.length - 1) { state.historyIdx++; restoreHistory(); updateCarveStat(); }
    });
    document.getElementById("btnReset").addEventListener("click", () => {
      const W = carveCanvas.getBoundingClientRect().width;
      const H = carveCanvas.getBoundingClientRect().height;
      drawCarveBase(W, H);
      state.history = []; state.historyIdx = -1; pushHistory();
      showToast("已重置木版");
    });
    document.getElementById("btnToColor").addEventListener("click", () => {
      if (carveCanvas) state.carveData = carveCanvas.toDataURL("image/png");
      goStep(3);
    });
  }

  function applyCarve(x, y) {
    if (!carveCtx) return;
    if (carveTool === "erase") {
      carveCtx.save();
      carveCtx.globalCompositeOperation = "destination-out";
      carveCtx.beginPath();
      carveCtx.arc(x, y, carveBrush, 0, Math.PI * 2);
      carveCtx.fill();
      carveCtx.restore();
      carveCtx.save();
      carveCtx.globalCompositeOperation = "destination-over";
      carveCtx.fillStyle = "rgba(90, 60, 30, 0.15)";
      carveCtx.beginPath();
      carveCtx.arc(x, y, carveBrush, 0, Math.PI * 2);
      carveCtx.fill();
      carveCtx.restore();
    } else if (carveTool === "restore") {
      const grad = carveCtx.createRadialGradient(x, y, 0, x, y, carveBrush);
      grad.addColorStop(0, "#f0d9a8");
      grad.addColorStop(1, "#c89a6c");
      carveCtx.fillStyle = grad;
      carveCtx.beginPath();
      carveCtx.arc(x, y, carveBrush, 0, Math.PI * 2);
      carveCtx.fill();
    } else if (carveTool === "select") {
      carveCtx.save();
      carveCtx.strokeStyle = "rgba(183, 40, 46, 0.85)";
      carveCtx.lineWidth = 2;
      carveCtx.setLineDash([6, 6]);
      carveCtx.beginPath();
      carveCtx.arc(x, y, carveBrush * 2, 0, Math.PI * 2);
      carveCtx.stroke();
      carveCtx.restore();
      setTimeout(updateCarveStat, 50);
    }
  }

  function pushHistory() {
    if (!carveCanvas) return;
    const data = carveCanvas.toDataURL("image/png");
    if (state.historyIdx < state.history.length - 1) {
      state.history = state.history.slice(0, state.historyIdx + 1);
    }
    state.history.push(data);
    state.historyIdx++;
    if (state.history.length > 20) { state.history.shift(); state.historyIdx--; }
  }

  function restoreHistory() {
    if (!carveCanvas || !state.history[state.historyIdx]) return;
    const data = state.history[state.historyIdx];
    const img = new Image();
    img.onload = () => {
      const W = carveCanvas.getBoundingClientRect().width;
      const H = carveCanvas.getBoundingClientRect().height;
      carveCtx.clearRect(0, 0, W, H);
      carveCtx.drawImage(img, 0, 0, W, H);
    };
    img.src = data;
  }

  function updateCarveStat() {
    const el = document.getElementById("carveStat");
    if (!el || !carveCanvas) return;
    try {
      const W = carveCanvas.width, H = carveCanvas.height;
      const data = carveCtx.getImageData(0, 0, W, H).data;
      let dark = 0, total = 0;
      for (let i = 3; i < data.length; i += 800) {
        total++;
        if (data[i] > 30) {
          const r = data[i - 3], g = data[i - 2], b = data[i - 1];
          if (r < 200 || g < 200 || b < 180) dark++;
        }
      }
      const ratio = Math.round((dark / total) * 100);
      el.textContent = `保留线条/色块约 ${ratio}%`;
    } catch (e) {}
  }

  /* ========== 步骤 3：套色 ========== */
  const colorSet = {
    main: ["#b7282e", "#d9484e", "#8a1c22", "#c9a24b", "#e8c98a", "#8b6a2a",
           "#4f7a4a", "#6b9560", "#2e5a2a", "#2a5a8a", "#4a7ab5", "#1e3e5e",
           "#8a4aa8", "#a86ac5", "#f5cfb0", "#3a3228"],
    accent: ["#c9a24b", "#e8c98a", "#b7282e", "#f5cfb0", "#4f7a4a", "#2a5a8a",
             "#a86ac5", "#ffd700", "#ff6b4a", "#8a6a2a"],
    line: ["#1d1a16", "#3a3228", "#5a3c1e", "#8a1c22", "#4f7a4a", "#2a5a8a", "#ffffff"]
  };

  function initColor() {
    if (!initColor._built) buildColorGrid();
    if (!initColor._boundPreset) { bindPresets(); initColor._boundPreset = true; }
    if (!initColor._bound) {
      document.getElementById("addGold").addEventListener("change", (e) => {
        state.gold = e.target.checked; drawColorCanvas();
      });
      document.getElementById("addVignette").addEventListener("change", (e) => {
        state.vignette = e.target.checked; drawColorCanvas();
      });
      document.getElementById("btnToPrint").addEventListener("click", () => goStep(4));
      initColor._bound = true;
    }
    setTimeout(drawColorCanvas, 50);
  }

  function buildColorGrid() {
    const fill = (id, list, key) => {
      const c = document.getElementById(id);
      c.innerHTML = "";
      list.forEach((col) => {
        const el = document.createElement("div");
        el.className = "color-swatch";
        el.style.background = col;
        el.addEventListener("click", () => {
          c.querySelectorAll(".color-swatch").forEach((e) => e.classList.remove("active"));
          el.classList.add("active");
          state.colors[key] = col;
          drawColorCanvas();
        });
        c.appendChild(el);
      });
      if (c.children[0]) c.children[0].classList.add("active");
    };
    fill("colorMain", colorSet.main, "main");
    fill("colorAccent", colorSet.accent, "accent");
    fill("colorLine", colorSet.line, "line");
    initColor._built = true;
  }

  function bindPresets() {
    const presets = {
      classic: { main: "#b7282e", accent: "#c9a24b", line: "#1d1a16" },
      spring: { main: "#d9484e", accent: "#4f7a4a", line: "#1d1a16" },
      elegant: { main: "#2a5a8a", accent: "#c9a24b", line: "#3a3228" },
      bold: { main: "#8a1c22", accent: "#ffd700", line: "#1d1a16" }
    };
    $$(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = presets[btn.dataset.preset];
        if (!p) return;
        state.colors.main = p.main; state.colors.accent = p.accent; state.colors.line = p.line;
        highlight("colorMain", p.main); highlight("colorAccent", p.accent); highlight("colorLine", p.line);
        drawColorCanvas();
        showToast("已应用：" + btn.textContent.trim());
      });
    });
    function highlight(id, hex) {
      const c = document.getElementById(id);
      c.querySelectorAll(".color-swatch").forEach((e) => {
        const bg = e.style.background;
        if (bg && (bg.toLowerCase() === hex.toLowerCase() || rgbFromHex(hex).toLowerCase() === bg.toLowerCase())) {
          c.querySelectorAll(".color-swatch").forEach((x) => x.classList.remove("active"));
          e.classList.add("active");
        }
      });
    }
  }

  function rgbFromHex(hex) {
    const n = parseInt(hex.slice(1), 16);
    return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
  }

  function drawColorCanvas() {
    const canvas = document.getElementById("colorCanvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;

    ctx.fillStyle = state.colors.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(138, 100, 50, 0.08)";
    for (let i = 0; i < 300; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);

    const svg = buildTemplate(state.template, {
      FILL_MAIN: state.colors.main,
      FILL_ACCENT: state.colors.accent,
      FILL_BG: state.colors.bg,
      LINE_STROKE: state.colors.line
    });

    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const ratio = img.width / img.height;
      let drawW, drawH, dx, dy;
      if (W / H > ratio) { drawH = H * 0.92; drawW = drawH * ratio; }
      else { drawW = W * 0.92; drawH = drawW / ratio; }
      dx = (W - drawW) / 2; dy = (H - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
      URL.revokeObjectURL(url);

      if (state.gold) {
        ctx.fillStyle = "rgba(201, 162, 75, 0.35)";
        for (let i = 0; i < 30; i++) {
          const r = 2 + Math.random() * 3;
          ctx.beginPath();
          ctx.arc(Math.random() * W, Math.random() * H, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (state.vignette) {
        const vg = ctx.createRadialGradient(W/2, H/2, Math.min(W, H) * 0.35, W/2, H/2, Math.max(W, H) * 0.7);
        vg.addColorStop(0, "rgba(0,0,0,0)");
        vg.addColorStop(1, "rgba(90, 60, 30, 0.2)");
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      }
      ctx.strokeStyle = state.colors.line;
      ctx.lineWidth = 2;
      ctx.strokeRect(dx, dy, drawW, drawH);

      state.colorDataUrl = canvas.toDataURL("image/png");
    };
    img.src = url;
  }

  /* ========== 步骤 4：印制 / 下载 ========== */
  function initPrint() {
    drawPrintCanvas();
    if (!initPrint._bound) {
      initPrint._bound = true;
      bindPrintControls();
    }
  }

  function drawPrintCanvas() {
    const canvas = document.getElementById("printCanvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;

    let bg = state.colors.bg;
    if (state.paper === "kraft") bg = "#d4a870";
    else if (state.paper === "cotton") bg = "#f0e4c8";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(90, 60, 30, 0.1)";
    for (let i = 0; i < 400; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);

    const svg = buildTemplate(state.template, {
      FILL_MAIN: state.colors.main,
      FILL_ACCENT: state.colors.accent,
      FILL_BG: bg,
      LINE_STROKE: state.colors.line
    });
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const ratio = img.width / img.height;
      let drawW, drawH, dx, dy;
      if (W / H > ratio) { drawH = H * 0.9; drawW = drawH * ratio; }
      else { drawW = W * 0.9; drawH = drawW / ratio; }
      dx = (W - drawW) / 2; dy = (H - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
      URL.revokeObjectURL(url);

      // 印章
      if (state.stamp) {
        const sx = dx + drawW - 80;
        const sy = dy + drawH - 100;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(-0.15);
        ctx.fillStyle = state.colors.main;
        ctx.fillRect(0, 0, 70, 70);
        ctx.fillStyle = bg;
        ctx.font = "bold 18px serif";
        ctx.textAlign = "center";
        const lines = state.stamp.match(/.{1,2}/g) || [state.stamp];
        lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 35, 30 + i * 22));
        ctx.strokeStyle = state.colors.line;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 70, 70);
        ctx.restore();
      }

      if (state.gold) {
        ctx.fillStyle = "rgba(201, 162, 75, 0.35)";
        for (let i = 0; i < 30; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * W, Math.random() * H, 2 + Math.random() * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (state.vignette) {
        const vg = ctx.createRadialGradient(W/2, H/2, Math.min(W, H) * 0.35, W/2, H/2, Math.max(W, H) * 0.7);
        vg.addColorStop(0, "rgba(0,0,0,0)");
        vg.addColorStop(1, "rgba(90, 60, 30, 0.22)");
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      }
      ctx.strokeStyle = state.colors.line;
      ctx.lineWidth = 2;
      ctx.strokeRect(dx, dy, drawW, drawH);

      state.printDataUrl = canvas.toDataURL("image/png");
      document.getElementById("printMeta").textContent = "成品预览 · 可下载 PNG / JPG";
    };
    img.src = url;
  }

  function bindPrintControls() {
    // 纸张
    document.querySelectorAll('.seg-group .seg-item[data-paper]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const siblings = btn.parentElement.querySelectorAll(".seg-item[data-paper]");
        siblings.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.paper = btn.dataset.paper;
        drawPrintCanvas();
      });
    });
    // 盖章
    document.getElementById("stampText").addEventListener("input", (e) => state.stamp = e.target.value);
    document.getElementById("btnApplyStamp").addEventListener("click", drawPrintCanvas);
    // 印制动画
    document.getElementById("btnPrint").addEventListener("click", () => {
      const mask = document.getElementById("printMask");
      if (!mask) return;
      mask.style.background = "#1d1a16";
      mask.style.position = "absolute";
      mask.style.inset = "0";
      mask.style.transition = "none";
      mask.style.transform = "translateY(0)";
      mask.style.opacity = "1";
      mask.style.pointerEvents = "none";
      showToast("正在印制...");
      setTimeout(() => {
        mask.style.transition = "transform 1.2s ease-out";
        mask.style.transform = "translateY(-100%)";
      }, 100);
      setTimeout(() => {
        mask.style.opacity = "0";
        showToast("印制完成！");
      }, 1500);
    });

    // 下载
    document.getElementById("btnDownloadPng").addEventListener("click", () => downloadImage("png"));
    document.getElementById("btnDownloadJpg").addEventListener("click", () => downloadImage("jpeg"));

    document.getElementById("btnSaveGallery").addEventListener("click", () => {
      const works = JSON.parse(localStorage.getItem("nainian_works") || "[]");
      works.unshift({
        dataUrl: state.printDataUrl || state.colorDataUrl,
        template: state.template,
        colors: { ...state.colors },
        stamp: state.stamp,
        time: new Date().toISOString()
      });
      localStorage.setItem("nainian_works", JSON.stringify(works.slice(0, 50)));
      showToast("已保存到作品画廊 ✓");
    });

    document.getElementById("btnRestart").addEventListener("click", () => {
      // 重置状态
      state.template = "door"; state.keyword = ""; state.style = "classic";
      state.colors = { main: "#b7282e", accent: "#c9a24b", line: "#1d1a16", bg: "#fdf6e3" };
      state.gold = false; state.vignette = true; state.stamp = "";
      const firstTpl = document.querySelector('.tp-item[data-tpl="door"]');
      if (firstTpl) firstTpl.click();
      goStep(1);
    });
  }

  function downloadImage(type) {
    const canvas = document.getElementById("printCanvas");
    if (!canvas) return;
    const mime = "image/" + type;
    const a = document.createElement("a");
    a.href = canvas.toDataURL(mime, 0.95);
    a.download = `年年有印_${state.template}_${Date.now()}.${type === "jpeg" ? "jpg" : "png"}`;
    a.click();
    showToast("已下载");
  }
})();
