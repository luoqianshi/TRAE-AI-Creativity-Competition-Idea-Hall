export function createExportSvgMarkupFlow(ctx) {
  const serializer = new XMLSerializer();
  const cloneSvg = ctx.svg.cloneNode(true);
  const styleTag = document.createElementNS("http://www.w3.org/2000/svg", "style");
  const embeddedStyles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((node) => {
      if (node.tagName.toLowerCase() === "style") {
        return node.textContent || "";
      }
      try {
        const sheet = Array.from(document.styleSheets).find((item) => item.href === node.href);
        return Array.from(sheet?.cssRules || [])
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .join("\n");
  cloneSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  cloneSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  cloneSvg.setAttribute("width", `${ctx.boardBounds.width}`);
  cloneSvg.setAttribute("height", `${ctx.boardBounds.height}`);
  styleTag.textContent = embeddedStyles;
  cloneSvg.prepend(styleTag);
  cloneSvg.style.background = "#ffffff";
  cloneSvg.querySelectorAll(".hit-target, .endpoint-dot").forEach((node) => node.remove());
  cloneSvg.querySelectorAll(".entity.is-selected").forEach((node) => node.classList.remove("is-selected"));
  return serializer.serializeToString(cloneSvg);
}

export function saveBoardAsImageFlow(ctx) {
  const svgMarkup = createExportSvgMarkupFlow(ctx);
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = ctx.boardBounds.width * ctx.exportImageScale;
    canvas.height = ctx.boardBounds.height * ctx.exportImageScale;
    const context = canvas.getContext("2d");
    if (!context) {
      URL.revokeObjectURL(url);
      ctx.setStatus("保存失败：当前环境不支持画布导出。");
      return;
    }
    context.scale(ctx.exportImageScale, ctx.exportImageScale);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, ctx.boardBounds.width, ctx.boardBounds.height);
    context.drawImage(image, 0, 0);
    canvas.toBlob((pngBlob) => {
      URL.revokeObjectURL(url);
      if (!pngBlob) {
        ctx.setStatus("保存失败：无法生成图片。");
        return;
      }
      ctx.downloadFile("mechanical-drawing.png", pngBlob);
      ctx.setStatus("已保存图片。");
    }, "image/png");
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    ctx.setStatus("保存失败：无法渲染图片。");
  };
  image.src = url;
}

export function loadDemoFlow(ctx) {
  ctx.releaseBackgroundObjectUrl();
  ctx.state.background = null;
  ctx.state.shapes = [];
  ctx.state.annotations = [];
  ctx.state.selected = null;
  ctx.state.editingShapeId = null;
  ctx.state.draft = null;
  ctx.state.interaction = null;
  ctx.state.guides = [];
  ctx.state.history.undoStack = [];
  ctx.state.history.redoStack = [];
  ctx.state.nextId = 1;

  const baseLine = ctx.normalizeLine({ id: ctx.uid("shape"), type: "line", x1: 180, y1: 220, x2: 540, y2: 220 });
  const sideLine = ctx.normalizeLine({ id: ctx.uid("shape"), type: "line", x1: 300, y1: 120, x2: 300, y2: 360 });
  const centerLine = ctx.normalizeLine({ id: ctx.uid("shape"), type: "chain-line", x1: 140, y1: 150, x2: 540, y2: 150 });
  const rect = { id: ctx.uid("shape"), type: "rect", x: 610, y: 168, width: 130, height: 104 };
  const roundrect = { id: ctx.uid("shape"), type: "roundrect", x: 610, y: 330, width: 150, height: 92, cornerRadius: 18 };
  const circle = { id: ctx.uid("shape"), type: "circle", cx: 860, cy: 278, r: 92 };
  const semicircle = { id: ctx.uid("shape"), type: "semicircle", x: 130, y: 460, width: 180, height: 120, orientation: "horizontal", side: "top" };
  const arc = { id: ctx.uid("shape"), type: "arc", x: 360, y: 470, width: 180, height: 110, orientation: "horizontal", side: "top" };
  ctx.state.shapes.push(baseLine, sideLine, centerLine, rect, roundrect, circle, semicircle, arc);
  ctx.state.annotations.push(
    { id: ctx.uid("ann"), type: "length", shapeId: baseLine.id, offset: -72, customLabel: "" },
    { id: ctx.uid("ann"), type: "length", shapeId: rect.id, segment: "top", offset: -72, customLabel: "" },
    { id: ctx.uid("ann"), type: "diameter", shapeId: circle.id, angle: 0.58, customLabel: "" },
    { id: ctx.uid("ann"), type: "radius", shapeId: circle.id, angle: -0.92, customLabel: "" },
  );
  ctx.setSelection("annotation", ctx.state.annotations[0].id);
  ctx.render();
  ctx.setStatus("示例已载入，可以直接拖动或继续绘制。");
}

export async function openBackgroundFileFlow(ctx, file) {
  if (!file) {
    return;
  }
  try {
    const dataUrl = await ctx.readFileAsDataUrl(file);
    ctx.pushHistory();
    ctx.releaseBackgroundObjectUrl();
    ctx.state.background = { name: file.name, url: dataUrl };
    ctx.render();
    ctx.setStatus(`已打开底图：${file.name}`);
  } catch {
    ctx.setStatus("打开底图失败：无法读取图片文件。");
  }
}
