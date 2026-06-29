const MASTER_PALETTE = [
  "#ffffff", "#f2f6f8", "#d9dee4", "#a8adb5", "#6f747a", "#2e3238", "#050505", "#3d210f",
  "#6d2d10", "#8e3b12", "#ae5516", "#c86d17", "#d78c32", "#e8a44b", "#f8c764", "#ffe08a",
  "#fff1b3", "#ffe0cc", "#ffc2b0", "#ff9a8d", "#f86e7d", "#e74f82", "#cf3f91", "#ad48a8",
  "#8b45b6", "#6d43b6", "#5545b3", "#3f4fac", "#315fbd", "#2d73d6", "#2586d1", "#1d9ac5",
  "#1aa8b7", "#22a7a0", "#249782", "#237a60", "#1f604f", "#194d48", "#6d8d2b", "#93ad35",
  "#b7ca3f", "#d6d94f", "#eef06b", "#ffd75d", "#ffb04b", "#f6893c", "#ee6745", "#df4c52",
  "#c83945", "#9d2f3d", "#7f2435", "#f6a5bd", "#f47aa7", "#e95d9b", "#cce8ff", "#98cdfa",
  "#6aacf4", "#3e8dec", "#236bd9", "#174b9d", "#133572", "#a7e4d7", "#72d0be", "#3bb49c"
].map(hexToRgb);

const state = {
  image: null,
  beadSize: 2.6,
  paletteSize: 32,
  gridCells: 116,
  autoEnhance: true,
  palette: [],
  grid: null,
  coverage: 89,
  sourceName: "demo"
};

const els = {
  imageInput: document.querySelector("#imageInput"),
  dropZone: document.querySelector("#dropZone"),
  originalCanvas: document.querySelector("#originalCanvas"),
  previewCanvas: document.querySelector("#previewCanvas"),
  generateBtn: document.querySelector("#generateBtn"),
  topGenerateBtn: document.querySelector("#topGenerateBtn"),
  changeImageBtn: document.querySelector("#changeImageBtn"),
  densitySlider: document.querySelector("#densitySlider"),
  densityLabel: document.querySelector("#densityLabel"),
  autoEnhance: document.querySelector("#autoEnhance"),
  paletteCountText: document.querySelector("#paletteCountText"),
  swatchGrid: document.querySelector("#swatchGrid"),
  sizeText: document.querySelector("#sizeText"),
  gridText: document.querySelector("#gridText"),
  usedColorText: document.querySelector("#usedColorText"),
  coverageText: document.querySelector("#coverageText"),
  beadCountText: document.querySelector("#beadCountText"),
  weightText: document.querySelector("#weightText"),
  downloadBtn: document.querySelector("#downloadBtn"),
  pdfBtn: document.querySelector("#pdfBtn"),
  shareBtn: document.querySelector("#shareBtn"),
  editPaletteBtn: document.querySelector("#editPaletteBtn"),
  toast: document.querySelector("#toast")
};

let toastTimer = null;
let resizeTimer = null;
let generateTimer = null;

init();

async function init() {
  bindEvents();
  state.image = await createDemoImage();
  renderOriginal();
  generatePattern(false);
}

function bindEvents() {
  els.imageInput.addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (file) loadFile(file);
  });

  els.changeImageBtn.addEventListener("click", () => els.imageInput.click());
  els.generateBtn.addEventListener("click", () => generatePattern(true));
  els.topGenerateBtn.addEventListener("click", () => generatePattern(true));

  document.querySelectorAll("[data-size]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-size]").forEach(item => item.classList.remove("is-active"));
      button.classList.add("is-active");
      state.beadSize = Number(button.dataset.size);
      updateStats();
    });
  });

  document.querySelectorAll("[data-palette]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-palette]").forEach(item => item.classList.remove("is-active"));
      button.classList.add("is-active");
      state.paletteSize = Number(button.dataset.palette);
      generatePattern(true);
    });
  });

  els.densitySlider.addEventListener("input", () => {
    state.gridCells = Number(els.densitySlider.value);
    updateDensityLabel();
    updateStats();
    clearTimeout(generateTimer);
    generateTimer = setTimeout(() => generatePattern(false), 180);
  });

  els.autoEnhance.addEventListener("change", () => {
    state.autoEnhance = els.autoEnhance.checked;
    generatePattern(true);
  });

  ["dragenter", "dragover"].forEach(name => {
    els.dropZone.addEventListener(name, event => {
      event.preventDefault();
      els.dropZone.classList.add("is-over");
    });
  });

  ["dragleave", "drop"].forEach(name => {
    els.dropZone.addEventListener(name, event => {
      event.preventDefault();
      els.dropZone.classList.remove("is-over");
    });
  });

  els.dropZone.addEventListener("drop", event => {
    const file = event.dataTransfer?.files?.[0];
    if (file) loadFile(file);
  });

  els.editPaletteBtn.addEventListener("click", () => {
    showToast("点击任意色珠即可手动换色");
  });

  els.downloadBtn.addEventListener("click", downloadPng);
  els.pdfBtn.addEventListener("click", exportPdf);
  els.shareBtn.addEventListener("click", shareApp);

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderOriginal();
      renderPreview();
    }, 120);
  });
}

function loadFile(file) {
  if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
    showToast("请上传 JPG、PNG 或 WebP 图片");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showToast("图片不能超过 10MB");
    return;
  }

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    state.image = img;
    state.sourceName = file.name.replace(/\.[^.]+$/, "") || "pattern";
    URL.revokeObjectURL(url);
    renderOriginal();
    generatePattern(true);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    showToast("图片读取失败，请换一张试试");
  };
  img.src = url;
}

function renderOriginal() {
  if (!state.image) return;
  const canvas = els.originalCanvas;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawImageCover(ctx, state.image, 0, 0, canvas.width, canvas.height);
}

function generatePattern(showMessage = false) {
  if (!state.image) return;

  const cells = state.gridCells;
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = cells;
  sourceCanvas.height = cells;
  const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  sourceCtx.imageSmoothingEnabled = true;
  sourceCtx.imageSmoothingQuality = "high";
  drawImageCover(sourceCtx, state.image, 0, 0, cells, cells);

  const imageData = sourceCtx.getImageData(0, 0, cells, cells);
  if (state.autoEnhance) enhancePixels(imageData.data);

  const samples = collectSamples(imageData.data, 10000);
  const centers = medianCut(samples, state.paletteSize);
  state.palette = snapToMasterPalette(centers, state.paletteSize);

  const assignment = assignPixels(imageData.data, state.palette);
  state.grid = assignment.grid;
  state.coverage = assignment.coverage;

  renderSwatches();
  renderPreview();
  updateStats();

  if (showMessage) showToast("图纸已重新生成");
}

function renderPreview() {
  if (!state.grid || !state.palette.length) return;
  const canvas = els.previewCanvas;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  drawPattern(canvas.getContext("2d"), canvas.width, canvas.height, state.gridCells, state.gridCells, state.grid, state.palette);
}

function renderSwatches() {
  els.swatchGrid.replaceChildren();
  state.palette.forEach((rgb, index) => {
    const color = rgbToHex(rgb);
    const swatch = document.createElement("button");
    swatch.className = "swatch";
    swatch.type = "button";
    swatch.style.setProperty("--swatch", color);
    swatch.title = color.toUpperCase();

    const input = document.createElement("input");
    input.type = "color";
    input.value = color;
    input.setAttribute("aria-label", `调整第 ${index + 1} 个颜色`);
    input.addEventListener("input", event => {
      state.palette[index] = hexToRgb(event.target.value);
      swatch.style.setProperty("--swatch", event.target.value);
      renderPreview();
      updateStats();
    });

    swatch.append(input);
    els.swatchGrid.append(swatch);
  });
}

function updateStats() {
  updateDensityLabel();
  const cells = state.gridCells;
  const sizeCm = (cells * state.beadSize) / 10;
  const beadCount = cells * cells;
  const weight = beadCount * beadWeightGram(state.beadSize);
  const usedColors = state.palette.length || state.paletteSize;

  els.paletteCountText.textContent = usedColors;
  els.sizeText.textContent = `${sizeCm.toFixed(1)}×${sizeCm.toFixed(1)} cm`;
  els.gridText.textContent = `${cells} × ${cells} 格`;
  els.usedColorText.textContent = `${usedColors} 种`;
  els.coverageText.textContent = `覆盖率 ${state.coverage}%`;
  els.beadCountText.textContent = `${beadCount.toLocaleString("zh-CN")} 颗`;
  els.weightText.textContent = `预估重量 约 ${Math.round(weight)}g`;
}

function updateDensityLabel() {
  const value = Number(els.densitySlider.value);
  state.gridCells = value;
  if (value < 88) els.densityLabel.textContent = "低";
  else if (value > 124) els.densityLabel.textContent = "高";
  else els.densityLabel.textContent = "中等";
}

function collectSamples(data, maxSamples) {
  const all = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) continue;
    all.push([data[i], data[i + 1], data[i + 2]]);
  }

  if (all.length <= maxSamples) return all;

  const step = Math.ceil(all.length / maxSamples);
  const samples = [];
  for (let i = 0; i < all.length; i += step) samples.push(all[i]);
  return samples;
}

function medianCut(samples, target) {
  if (!samples.length) return [hexToRgb("#ffffff")];

  let boxes = [samples];
  while (boxes.length < target) {
    let splitIndex = -1;
    let splitChannel = 0;
    let bestScore = -1;

    boxes.forEach((box, index) => {
      if (box.length < 2) return;
      const ranges = channelRanges(box);
      const channel = ranges.indexOf(Math.max(...ranges));
      const score = ranges[channel] * box.length;
      if (score > bestScore) {
        bestScore = score;
        splitIndex = index;
        splitChannel = channel;
      }
    });

    if (splitIndex === -1) break;

    const box = boxes.splice(splitIndex, 1)[0];
    box.sort((a, b) => a[splitChannel] - b[splitChannel]);
    const middle = Math.max(1, Math.floor(box.length / 2));
    boxes.push(box.slice(0, middle), box.slice(middle));
  }

  return boxes
    .filter(box => box.length)
    .map(box => {
      const total = box.reduce(
        (sum, color) => {
          sum[0] += color[0];
          sum[1] += color[1];
          sum[2] += color[2];
          return sum;
        },
        [0, 0, 0]
      );
      return total.map(value => Math.round(value / box.length));
    });
}

function channelRanges(colors) {
  let minR = 255;
  let minG = 255;
  let minB = 255;
  let maxR = 0;
  let maxG = 0;
  let maxB = 0;

  colors.forEach(color => {
    minR = Math.min(minR, color[0]);
    minG = Math.min(minG, color[1]);
    minB = Math.min(minB, color[2]);
    maxR = Math.max(maxR, color[0]);
    maxG = Math.max(maxG, color[1]);
    maxB = Math.max(maxB, color[2]);
  });

  return [maxR - minR, maxG - minG, maxB - minB];
}

function snapToMasterPalette(centers, target) {
  const used = new Set();
  const palette = [];

  centers.forEach(center => {
    const ranked = MASTER_PALETTE
      .map(color => ({ color, distance: colorDistance(center, color) }))
      .sort((a, b) => a.distance - b.distance);
    const next = ranked.find(item => !used.has(rgbToHex(item.color))) || ranked[0];
    const key = rgbToHex(next.color);
    used.add(key);
    palette.push([...next.color]);
  });

  if (palette.length < target) {
    const average = averageColor(centers);
    const ranked = MASTER_PALETTE
      .map(color => ({ color, distance: colorDistance(average, color) }))
      .sort((a, b) => a.distance - b.distance);
    for (const item of ranked) {
      const key = rgbToHex(item.color);
      if (used.has(key)) continue;
      palette.push([...item.color]);
      used.add(key);
      if (palette.length >= target) break;
    }
  }

  return palette.slice(0, target);
}

function assignPixels(data, palette) {
  const grid = new Uint16Array(state.gridCells * state.gridCells);
  let error = 0;

  for (let pixel = 0, out = 0; pixel < data.length; pixel += 4, out += 1) {
    const color = [data[pixel], data[pixel + 1], data[pixel + 2]];
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < palette.length; i += 1) {
      const distance = colorDistance(color, palette[i]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    grid[out] = bestIndex;
    error += Math.sqrt(bestDistance);
  }

  const averageError = error / grid.length;
  const coverage = Math.round(Math.max(72, Math.min(98, 100 - averageError / 2.35)));
  return { grid, coverage };
}

function drawPattern(ctx, width, height, columns, rows, grid, palette) {
  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#f9fcff");
  background.addColorStop(1, "#dfedf9");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const cellW = width / columns;
  const cellH = height / rows;
  const radius = Math.max(1.15, Math.min(cellW, cellH) * 0.44);
  const holeRadius = radius * 0.32;
  const strokeWidth = Math.max(0.55, radius * 0.18);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const index = grid[row * columns + col];
      const color = palette[index] || palette[0];
      const x = col * cellW + cellW / 2;
      const y = row * cellH + cellH / 2;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = rgbToHex(color);
      ctx.fill();
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = "rgba(255,255,255,0.82)";
      ctx.stroke();

      if (radius > 1.8) {
        ctx.beginPath();
        ctx.arc(x, y, holeRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 24, 42, 0.38)";
        ctx.fill();
      }
    }
  }
}

function drawImageCover(ctx, image, x, y, width, height) {
  const sourceRatio = image.width / image.height;
  const targetRatio = width / height;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;

  if (sourceRatio > targetRatio) {
    sw = image.height * targetRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / targetRatio;
    sy = (image.height - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function enhancePixels(data) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r = (r - 128) * 1.08 + 128;
    g = (g - 128) * 1.08 + 128;
    b = (b - 128) * 1.08 + 128;

    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    data[i] = clamp(gray + (r - gray) * 1.12);
    data[i + 1] = clamp(gray + (g - gray) * 1.12);
    data[i + 2] = clamp(gray + (b - gray) * 1.12);
  }
}

function downloadPng() {
  if (!state.grid) return;
  const canvas = document.createElement("canvas");
  canvas.width = 2200;
  canvas.height = 2200;
  drawPattern(canvas.getContext("2d"), canvas.width, canvas.height, state.gridCells, state.gridCells, state.grid, state.palette);

  const link = document.createElement("a");
  link.download = `${safeFileName(state.sourceName)}-拼豆图纸.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  showToast("PNG 图纸已开始下载");
}

function exportPdf() {
  if (!state.grid) return;
  const canvas = document.createElement("canvas");
  canvas.width = 1800;
  canvas.height = 1800;
  drawPattern(canvas.getContext("2d"), canvas.width, canvas.height, state.gridCells, state.gridCells, state.grid, state.palette);
  const image = canvas.toDataURL("image/png");

  const win = window.open("", "_blank");
  if (!win) {
    showToast("浏览器拦截了弹窗，请允许弹窗后再试");
    return;
  }

  const sizeCm = ((state.gridCells * state.beadSize) / 10).toFixed(1);
  win.document.write(`
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(state.sourceName)} 拼豆图纸</title>
        <style>
          body { margin: 0; padding: 28px; font-family: Arial, "Microsoft YaHei", sans-serif; color: #172033; }
          h1 { margin: 0 0 14px; font-size: 24px; }
          .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
          .meta div { border: 1px solid #d8e1ee; border-radius: 8px; padding: 10px 12px; }
          .meta span { display: block; color: #667085; font-size: 12px; margin-bottom: 5px; }
          .meta strong { font-size: 16px; }
          img { width: 100%; max-width: 760px; display: block; margin: 0 auto; border: 1px solid #d8e1ee; }
          @page { size: A4; margin: 12mm; }
          @media print { body { padding: 0; } button { display: none; } }
        </style>
      </head>
      <body>
        <h1>拼豆图纸</h1>
        <div class="meta">
          <div><span>尺寸</span><strong>${sizeCm} × ${sizeCm} cm</strong></div>
          <div><span>网格</span><strong>${state.gridCells} × ${state.gridCells}</strong></div>
          <div><span>颜色</span><strong>${state.palette.length} 种</strong></div>
          <div><span>颗粒</span><strong>${(state.gridCells * state.gridCells).toLocaleString("zh-CN")} 颗</strong></div>
        </div>
        <img src="${image}" alt="拼豆图纸" />
        <script>window.onload = () => setTimeout(() => window.print(), 250);<\/script>
      </body>
    </html>
  `);
  win.document.close();
  showToast("已打开打印窗口，可保存为 PDF");
}

async function shareApp() {
  const text = "我用拼豆图纸生成器做了一张拼豆图纸";
  if (navigator.share) {
    try {
      await navigator.share({ title: "拼豆图纸生成器", text, url: location.href });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(location.href);
    showToast("链接已复制");
  } catch {
    showToast("当前浏览器不支持分享");
  }
}

async function createDemoImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 850;
  const ctx = canvas.getContext("2d");

  const sky = ctx.createLinearGradient(0, 0, 0, 470);
  sky.addColorStop(0, "#6fa7e9");
  sky.addColorStop(0.42, "#cadcff");
  sky.addColorStop(0.78, "#ffe0b5");
  sky.addColorStop(1, "#f8a977");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.54)";
  drawCloud(ctx, 140, 170, 95);
  drawCloud(ctx, 920, 130, 70);

  const mountain = ctx.createLinearGradient(370, 210, 780, 570);
  mountain.addColorStop(0, "#f5f6ff");
  mountain.addColorStop(0.28, "#8899c3");
  mountain.addColorStop(0.66, "#334b82");
  mountain.addColorStop(1, "#172f5d");
  ctx.fillStyle = mountain;
  ctx.beginPath();
  ctx.moveTo(205, 515);
  ctx.lineTo(615, 148);
  ctx.lineTo(1020, 515);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.moveTo(615, 148);
  ctx.lineTo(520, 348);
  ctx.lineTo(604, 306);
  ctx.lineTo(652, 390);
  ctx.lineTo(704, 322);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(27, 53, 99, 0.72)";
  ctx.beginPath();
  ctx.moveTo(615, 148);
  ctx.lineTo(1020, 515);
  ctx.lineTo(712, 515);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#263d64";
  ctx.fillRect(0, 500, canvas.width, 46);
  ctx.fillStyle = "#1d2d45";
  for (let x = 0; x < canvas.width; x += 18) {
    const h = 18 + ((x * 17) % 31);
    ctx.fillRect(x, 502 - h, 13, h + 36);
  }

  const water = ctx.createLinearGradient(0, 540, 0, canvas.height);
  water.addColorStop(0, "#365d8f");
  water.addColorStop(0.38, "#1c5d98");
  water.addColorStop(0.72, "#f1a86f");
  water.addColorStop(1, "#243c72");
  ctx.fillStyle = water;
  ctx.fillRect(0, 540, canvas.width, 310);

  ctx.save();
  ctx.globalAlpha = 0.36;
  ctx.translate(0, 1086);
  ctx.scale(1, -0.62);
  ctx.drawImage(canvas, 0, 0, canvas.width, 548);
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.32)";
  ctx.lineWidth = 2;
  for (let y = 575; y < 825; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 60) {
      ctx.lineTo(x, y + Math.sin((x + y) / 45) * 5);
    }
    ctx.stroke();
  }

  drawCherryBranch(ctx, 806, 80, -0.25, 1.04);
  drawCherryBranch(ctx, 960, 560, 2.55, 1.08);

  return loadImage(canvas.toDataURL("image/png"));
}

function drawCloud(ctx, x, y, scale) {
  ctx.beginPath();
  ctx.ellipse(x, y, scale * 1.3, scale * 0.34, 0, 0, Math.PI * 2);
  ctx.ellipse(x + scale * 0.52, y - scale * 0.08, scale * 0.84, scale * 0.28, 0, 0, Math.PI * 2);
  ctx.ellipse(x - scale * 0.48, y + scale * 0.02, scale * 0.8, scale * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCherryBranch(ctx, x, y, angle, scale) {
  const rand = seededRandom(Math.round(x * 13 + y * 7));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#4c271d";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(95, 24, 180, 55, 320, 70);
  ctx.stroke();

  for (let branch = 0; branch < 7; branch += 1) {
    const start = 36 + branch * 42;
    const up = branch % 2 === 0 ? -1 : 1;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(start, 16 + branch * 8);
    ctx.quadraticCurveTo(start + 44, up * (22 + branch * 4), start + 94, up * (36 + rand() * 28));
    ctx.stroke();
  }

  for (let i = 0; i < 120; i += 1) {
    const px = rand() * 360;
    const py = (rand() - 0.42) * 130;
    const size = 4 + rand() * 7;
    const hue = rand() > 0.35 ? "#f9a1b7" : "#f56f93";
    ctx.fillStyle = hue;
    ctx.beginPath();
    for (let p = 0; p < 5; p += 1) {
      const a = (Math.PI * 2 * p) / 5;
      ctx.ellipse(px + Math.cos(a) * size * 0.58, py + Math.sin(a) * size * 0.58, size * 0.42, size * 0.26, a, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.fillStyle = "#ffd7e2";
    ctx.beginPath();
    ctx.arc(px, py, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function averageColor(colors) {
  if (!colors.length) return [255, 255, 255];
  const total = colors.reduce(
    (sum, color) => {
      sum[0] += color[0];
      sum[1] += color[1];
      sum[2] += color[2];
      return sum;
    },
    [0, 0, 0]
  );
  return total.map(value => Math.round(value / colors.length));
}

function colorDistance(a, b) {
  const rMean = (a[0] + b[0]) / 2;
  const r = a[0] - b[0];
  const g = a[1] - b[1];
  const blue = a[2] - b[2];
  return ((512 + rMean) * r * r) / 256 + 4 * g * g + ((767 - rMean) * blue * blue) / 256;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16)
  ];
}

function rgbToHex(rgb) {
  return `#${rgb.map(value => clamp(value).toString(16).padStart(2, "0")).join("")}`;
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function beadWeightGram(size) {
  if (size <= 3) return 0.011;
  if (size <= 6) return 0.045;
  return 0.21;
}

function safeFileName(name) {
  return name.replace(/[\\/:*?"<>|]+/g, "-").slice(0, 80) || "pattern";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function seededRandom(seed) {
  let value = seed || 1;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
}
