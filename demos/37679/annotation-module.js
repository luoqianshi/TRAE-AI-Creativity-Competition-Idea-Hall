export function createAnnotationFromToolPatchedFlow(ctx, shape, point) {
  if (ctx.state.tool === "length") {
    if (!(ctx.isLineShape(shape) || shape.type === "rect" || shape.type === "roundrect")) {
      ctx.setStatus("当前对象不支持长度标注。");
      return true;
    }
    ctx.pushHistory();
    const segment = ctx.isLineShape(shape) ? null : ctx.getNearestRectSegment(shape, point);
    const annotation = ctx.createLengthAnnotation(shape, segment);
    annotation.offset = ctx.clampMagnitude(-72, 24);
    ctx.state.annotations.push(annotation);
    ctx.setSelection("annotation", annotation.id);
    ctx.state.interaction = {
      type: "move-annotation",
      annotationId: annotation.id,
      startPointer: point,
      original: ctx.clone(annotation),
    };
    ctx.render();
    ctx.setStatus("已生成长度标注，可继续拖动微调位置。");
    return true;
  }

  if (ctx.state.tool === "diameter") {
    if (shape.type !== "circle") {
      ctx.setStatus("直径标注仅支持圆。");
      return true;
    }
    const existingAnnotation = ctx.getExistingDiameterAnnotationForCircleGroup(shape);
    if (existingAnnotation) {
      ctx.setSelection("annotation", existingAnnotation.id);
      ctx.render();
      ctx.setStatus("相同尺寸的圆已存在直径标注。");
      return true;
    }
    ctx.pushHistory();
    const annotation = ctx.createCircleAnnotation(shape, "diameter", Math.atan2(point.y - shape.cy, point.x - shape.cx) || -Math.PI / 4);
    ctx.state.annotations.push(annotation);
    ctx.setSelection("annotation", annotation.id);
    ctx.state.interaction = {
      type: "move-annotation",
      annotationId: annotation.id,
      startPointer: point,
      original: ctx.clone(annotation),
    };
    ctx.render();
    ctx.setStatus("已生成直径标注，可继续拖动调整方向。");
    return true;
  }

  if (ctx.state.tool === "radius") {
    const annotation = ctx.createRadiusAnnotation(shape, point);
    if (!annotation) {
      ctx.setStatus("当前对象不支持半径标注。");
      return true;
    }
    ctx.pushHistory();
    ctx.state.annotations.push(annotation);
    ctx.setSelection("annotation", annotation.id);
    ctx.state.interaction = {
      type: "move-annotation",
      annotationId: annotation.id,
      startPointer: point,
      original: ctx.clone(annotation),
    };
    ctx.render();
    ctx.setStatus("已生成半径标注，可继续拖动调整方向。");
    return true;
  }

  if (ctx.state.tool === "angle") {
    const annotation = ctx.createAngleAnnotation(shape);
    if (!annotation) {
      ctx.setStatus("圆弧角度标注仅支持圆弧。");
      return true;
    }
    ctx.pushHistory();
    ctx.state.annotations.push(annotation);
    ctx.setSelection("annotation", annotation.id);
    ctx.render();
    ctx.setStatus("已生成圆弧角度标注；切回选择工具可拖动角度数字微调位置。");
    return true;
  }

  if (ctx.state.tool === "arc-chord" || ctx.state.tool === "arc-length") {
    const annotation = ctx.createArcMeasureAnnotation(shape, ctx.state.tool);
    if (!annotation) {
      ctx.setStatus("圆弧弦长/弧长标注仅支持圆弧。");
      return true;
    }
    ctx.pushHistory();
    ctx.state.annotations.push(annotation);
    ctx.setSelection("annotation", annotation.id);
    ctx.render();
    ctx.setStatus(ctx.state.tool === "arc-chord" ? "已生成圆弧弦长标注。" : "已生成圆弧弧长标注。");
    return true;
  }

  if (ctx.state.tool === "polar-coordinate") {
    const annotation = ctx.createPolarCoordinateAnnotation(shape, point);
    if (!annotation) {
      ctx.setStatus("请点击凸轮曲线轮廓来生成极坐标标注。");
      return true;
    }
    ctx.pushHistory();
    ctx.state.annotations.push(annotation);
    ctx.setSelection("annotation", annotation.id);
    ctx.render();
    ctx.setStatus("已生成凸轮极坐标标注；切回选择工具可拖动半径/角度数字，也可配合手动尺寸线、细实线和箭头继续补标。");
    return true;
  }

  return false;
}

export function createAnnotationFromToolFlow(ctx, shape, point) {
  if (createAnnotationFromToolPatchedFlow(ctx, shape, point)) {
    return;
  }

  if (ctx.state.tool === "length") {
    if (!(ctx.isLineShape(shape) || shape.type === "rect" || shape.type === "roundrect")) {
      ctx.setStatus("长度标注仅支持直线、矩形和圆角矩形边。");
      return;
    }
    ctx.pushHistory();
    const segment = ctx.isLineShape(shape) ? null : ctx.getNearestRectSegment(shape, point);
    const annotation = ctx.createLengthAnnotation(shape, segment);
    annotation.offset = ctx.clampMagnitude(-72, 24);
    ctx.state.annotations.push(annotation);
    ctx.setSelection("annotation", annotation.id);
    ctx.state.interaction = {
      type: "move-annotation",
      annotationId: annotation.id,
      startPointer: point,
      original: ctx.clone(annotation),
    };
    ctx.render();
    ctx.setStatus("长度标注已生成，继续拖动可以微调位置。");
    return;
  }

  if (shape.type !== "circle") {
    ctx.setStatus("直径和半径标注仅支持圆。");
    return;
  }

  ctx.pushHistory();
  const type = ctx.state.tool === "diameter" ? "diameter" : "radius";
  const rawAngle = Math.atan2(point.y - shape.cy, point.x - shape.cx) || -Math.PI / 4;
  const annotation = ctx.createCircleAnnotation(shape, type, rawAngle);
  ctx.state.annotations.push(annotation);
  ctx.setSelection("annotation", annotation.id);
  ctx.state.interaction = {
    type: "move-annotation",
    annotationId: annotation.id,
    startPointer: point,
    original: ctx.clone(annotation),
  };
  ctx.render();
  ctx.setStatus(`${type === "diameter" ? "直径" : "半径"}标注已生成，继续拖动可以调整方向。`);
}
