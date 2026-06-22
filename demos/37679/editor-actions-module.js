export function deleteSelectedFlow(ctx) {
  if (!ctx.state.selected) {
    return;
  }
  ctx.pushHistory();
  if (ctx.state.selected.kind === "shape") {
    const selectedShapeIds = new Set(ctx.getSelectedIds("shape"));
    ctx.state.shapes = ctx.state.shapes.filter((shape) => !selectedShapeIds.has(shape.id));
    ctx.state.annotations = ctx.state.annotations.filter((annotation) => !selectedShapeIds.has(annotation.shapeId));
  } else {
    const annotationId = ctx.state.selected.id;
    ctx.state.annotations = ctx.state.annotations.filter((annotation) => annotation.id !== annotationId);
  }
  ctx.setSelection(null, null);
  ctx.exitShapeParameterEdit();
  ctx.render();
  ctx.setStatus("已删除选中对象。");
}

export function copySelectedFlow(ctx) {
  if (!ctx.state.selected) {
    return;
  }
  const offset = 18;
  if (ctx.state.selected.kind === "shape") {
    const source = ctx.getShape(ctx.state.selected.id);
    if (!source) {
      return;
    }
    ctx.pushHistory();
    const copiedShape = ctx.offsetShapeForCopy(source, offset);
    copiedShape.id = ctx.uid("shape");
    ctx.state.shapes.push(copiedShape);

    const shapeMap = new Map([[source.id, copiedShape.id]]);
    ctx.state.annotations
      .filter((annotation) => annotation.shapeId === source.id)
      .forEach((annotation) => {
        const copiedAnnotation = ctx.offsetAnnotationForCopy(annotation, shapeMap, offset);
        copiedAnnotation.id = ctx.uid("ann");
        ctx.state.annotations.push(copiedAnnotation);
      });

    ctx.setSelection("shape", copiedShape.id);
    ctx.render();
    ctx.setStatus("已复制选中图形。");
    return;
  }

  const source = ctx.getAnnotation(ctx.state.selected.id);
  if (!source) {
    return;
  }
  ctx.pushHistory();
  const copiedAnnotation = ctx.offsetAnnotationForCopy(source, new Map(), offset);
  copiedAnnotation.id = ctx.uid("ann");
  ctx.state.annotations.push(copiedAnnotation);
  ctx.setSelection("annotation", copiedAnnotation.id);
  ctx.render();
  ctx.setStatus("已复制选中标注。");
}

export function clearCanvasFlow(ctx) {
  if (!ctx.state.shapes.length && !ctx.state.annotations.length && !ctx.state.background) {
    return;
  }
  ctx.pushHistory();
  ctx.releaseBackgroundObjectUrl();
  ctx.state.background = null;
  ctx.state.shapes = [];
  ctx.state.annotations = [];
  ctx.state.selected = null;
  ctx.state.editingShapeId = null;
  ctx.state.interaction = null;
  ctx.state.draft = null;
  ctx.state.guides = [];
  ctx.render();
  ctx.setStatus("画布与底图已全部清空。");
}

export function downloadFileFlow(name, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function buildDrawingSnapshotFlow(state, clone) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    unitsPerMm: state.unitsPerMm,
    background: state.background
      ? {
          name: state.background.name || "background",
          url: state.background.url,
        }
      : null,
    shapes: clone(state.shapes),
    annotations: clone(state.annotations),
  };
}

export function exportDrawingFileFlow(ctx) {
  const payload = JSON.stringify(buildDrawingSnapshotFlow(ctx.state, ctx.clone), null, 2);
  downloadFileFlow("mechanical-drawing.json", new Blob([payload], { type: "application/json" }));
  ctx.setStatus("已导出图稿文件。");
}

export function applyImportedDrawingFlow(ctx, payload) {
  if (!payload || !Array.isArray(payload.shapes) || !Array.isArray(payload.annotations)) {
    throw new Error("invalid-drawing");
  }
  ctx.pushHistory();
  ctx.applySnapshot({
    background: payload.background || null,
    shapes: payload.shapes || [],
    annotations: payload.annotations || [],
    selected: null,
    nextId:
      Math.max(
        0,
        ...payload.shapes.map((shape) => Number(String(shape.id || "").split("-").pop()) || 0),
        ...payload.annotations.map((annotation) => Number(String(annotation.id || "").split("-").pop()) || 0),
      ) + 1,
    unitsPerMm: Math.max(1, Number(payload.unitsPerMm) || ctx.defaultUnitsPerMm),
    showGrid: ctx.state.showGrid,
    ortho: ctx.state.ortho,
  });
  ctx.render();
}

export function importDrawingFileFlow(ctx, file) {
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result || ""));
      applyImportedDrawingFlow(ctx, payload);
      ctx.setStatus("已导入图稿文件。");
    } catch {
      ctx.setStatus("导入失败：图稿文件格式不正确。");
    }
  };
  reader.onerror = () => {
    ctx.setStatus("导入失败：无法读取图稿文件。");
  };
  reader.readAsText(file, "utf-8");
}
