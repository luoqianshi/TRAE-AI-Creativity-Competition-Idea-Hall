export function startBoxDrawingTool(ctx, kind, point) {
  const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
  ctx.setSelection(null, null);
  ctx.hideFloatingPanels();
  ctx.state.interaction = { type: `drawing-${kind}`, start: snapped.point, hasDragged: false };
  ctx.state.guides = snapped.guides;
  if (kind === "semicircle" || kind === "arc") {
    ctx.state.draft = ctx.buildArcShape(kind, snapped.point, snapped.point);
  } else {
    ctx.state.draft = { type: kind, x: snapped.point.x, y: snapped.point.y, width: 0, height: 0 };
  }
  if (ctx.canShapeUseLineType?.(ctx.state.draft)) {
    ctx.state.draft.lineType = ctx.getCurrentLineType?.() || "solid";
  }
  ctx.renderGuides();
  ctx.renderLiveMetrics();
}

export function startLineDrawingTool(ctx, type, point) {
  const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
  ctx.setSelection(null, null);
  ctx.hideFloatingPanels();
  ctx.state.interaction = { type: `drawing-${type}`, start: snapped.point, hasDragged: false };
  ctx.state.guides = snapped.guides;
  ctx.state.draft = { type, x1: snapped.point.x, y1: snapped.point.y, x2: snapped.point.x, y2: snapped.point.y };
  if (ctx.canShapeUseLineType?.(ctx.state.draft)) {
    ctx.state.draft.lineType = ctx.getCurrentLineType?.() || "solid";
  }
  ctx.renderGuides();
  ctx.renderLiveMetrics();
}

export function startHiddenLineDrawingTool(ctx, point) {
  const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
  ctx.setSelection(null, null);
  ctx.hideFloatingPanels();
  ctx.state.interaction = { type: "drawing-hidden-line", start: snapped.point, hasDragged: false };
  ctx.state.guides = snapped.guides;
  ctx.state.draft = { type: "line", lineType: "hidden", x1: snapped.point.x, y1: snapped.point.y, x2: snapped.point.x, y2: snapped.point.y };
  ctx.renderGuides();
  ctx.renderLiveMetrics();
}

export function startCircleDrawingTool(ctx, point) {
  const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
  ctx.setSelection(null, null);
  ctx.hideFloatingPanels();
  ctx.state.interaction = { type: "drawing-circle", start: snapped.point, hasDragged: false };
  ctx.state.guides = snapped.guides;
  ctx.state.draft = { type: "circle", cx: snapped.point.x, cy: snapped.point.y, r: 0 };
  ctx.state.draft.lineType = ctx.getCurrentLineType?.() || "solid";
  ctx.renderGuides();
  ctx.renderLiveMetrics();
}

export function startManualLineDrawingTool(ctx, type, point) {
  const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
  ctx.setSelection(null, null);
  ctx.hideFloatingPanels();
  ctx.state.interaction = { type: `drawing-${type}`, start: snapped.point, hasDragged: false };
  ctx.state.guides = snapped.guides;
  ctx.state.draft = { type, x1: snapped.point.x, y1: snapped.point.y, x2: snapped.point.x, y2: snapped.point.y };
  ctx.renderGuides();
  ctx.renderLiveMetrics();
}

export function updateDrawingTool(ctx, point) {
  if (!ctx.state.interaction || !ctx.state.draft) {
    return;
  }
  if (ctx.distance(ctx.state.interaction.start, point) >= 4) {
    ctx.state.interaction.hasDragged = true;
  }

  if (
    ctx.state.interaction.type === "drawing-line" ||
    ctx.state.interaction.type === "drawing-hidden-line" ||
    ctx.state.interaction.type === "drawing-symmetry-line" ||
    ctx.state.interaction.type === "drawing-chain-line" ||
    ctx.state.interaction.type === "drawing-manual-dimension-line" ||
    ctx.state.interaction.type === "drawing-manual-extension-line" ||
    ctx.state.interaction.type === "drawing-manual-single-arrow" ||
    ctx.state.interaction.type === "drawing-manual-dimension-line-labeled"
  ) {
    const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
    const target = ctx.state.ortho ? ctx.orthogonalLock(ctx.state.interaction.start, snapped.point) : snapped.point;
    ctx.state.guides = snapped.guides;
    ctx.state.draft.x2 = target.x;
    ctx.state.draft.y2 = target.y;
    ctx.renderDraft();
    ctx.renderGuides();
    ctx.renderLiveMetrics();
    return;
  }

  if (ctx.state.interaction.type === "drawing-rect" || ctx.state.interaction.type === "drawing-roundrect") {
    const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
    const rect = ctx.rectFromPoints(ctx.state.interaction.start, snapped.point);
    ctx.state.guides = snapped.guides;
    ctx.state.draft.x = rect.x;
    ctx.state.draft.y = rect.y;
    ctx.state.draft.width = rect.width;
    ctx.state.draft.height = rect.height;
    ctx.renderDraft();
    ctx.renderGuides();
    ctx.renderLiveMetrics();
    return;
  }

  if (ctx.state.interaction.type === "drawing-semicircle" || ctx.state.interaction.type === "drawing-arc") {
    const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
    ctx.state.guides = snapped.guides;
    ctx.state.draft = ctx.buildArcShape(ctx.state.draft.type, ctx.state.interaction.start, snapped.point);
    if (ctx.canShapeUseLineType?.(ctx.state.draft)) {
      ctx.state.draft.lineType = ctx.getCurrentLineType?.() || "solid";
    }
    ctx.renderDraft();
    ctx.renderGuides();
    ctx.renderLiveMetrics();
    return;
  }

  if (ctx.state.interaction.type === "drawing-circle") {
    const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
    ctx.state.guides = snapped.guides;
    ctx.state.draft.r = Math.max(0, ctx.distance(ctx.state.interaction.start, snapped.point));
    ctx.renderDraft();
    ctx.renderGuides();
    ctx.renderLiveMetrics();
  }
}

export function finalizeDrawingTool(ctx) {
  if (!ctx.state.interaction || !ctx.state.draft) {
    ctx.state.draft = null;
    return;
  }

  if (
    ctx.state.interaction.type === "drawing-line" ||
    ctx.state.interaction.type === "drawing-hidden-line" ||
    ctx.state.interaction.type === "drawing-symmetry-line" ||
    ctx.state.interaction.type === "drawing-chain-line"
  ) {
    const start = { x: ctx.state.draft.x1, y: ctx.state.draft.y1 };
    const end = { x: ctx.state.draft.x2, y: ctx.state.draft.y2 };
    if (ctx.distance(start, end) >= 12) {
      ctx.pushHistory();
      const line = ctx.normalizeLine({ id: ctx.uid("shape"), ...ctx.state.draft });
      ctx.state.shapes.push(line);
      ctx.setSelection("shape", line.id);
      ctx.setStatus(ctx.state.interaction.type === "drawing-hidden-line" ? "已创建细虚线。" : "已创建线条。");
    } else {
      ctx.setStatus("拖动距离太短，没有创建线条。");
    }
  }

  if (
    ctx.state.interaction.type === "drawing-manual-dimension-line" ||
    ctx.state.interaction.type === "drawing-manual-extension-line" ||
    ctx.state.interaction.type === "drawing-manual-single-arrow"
  ) {
    const start = { x: ctx.state.draft.x1, y: ctx.state.draft.y1 };
    const end = { x: ctx.state.draft.x2, y: ctx.state.draft.y2 };
    if (ctx.distance(start, end) >= 8) {
      ctx.pushHistory();
      const annotation =
        ctx.state.draft.type === "manual-dimension-line"
          ? ctx.createManualDimensionLine(ctx.state.draft)
          : ctx.state.draft.type === "manual-single-arrow"
            ? { id: ctx.uid("ann"), type: "manual-single-arrow", x1: ctx.state.draft.x1, y1: ctx.state.draft.y1, x2: ctx.state.draft.x2, y2: ctx.state.draft.y2 }
            : ctx.createManualExtensionLine(ctx.state.draft);
      ctx.state.annotations.push(annotation);
      ctx.setSelection("annotation", annotation.id);
      ctx.setStatus(ctx.state.draft.type === "manual-dimension-line" ? "已创建手动尺寸线。" : "已创建细实线。");
    } else {
      ctx.setStatus("拖动距离太短，没有创建手动标注线。");
    }
  }

  if (ctx.state.interaction.type === "drawing-rect") {
    if (ctx.state.draft.width >= 12 && ctx.state.draft.height >= 12) {
      ctx.pushHistory();
      const rect = { id: ctx.uid("shape"), ...ctx.state.draft };
      ctx.state.shapes.push(rect);
      ctx.setSelection("shape", rect.id);
      ctx.setStatus("已创建矩形。");
    } else {
      ctx.setStatus("矩形太小，没有创建。");
    }
  }

  if (ctx.state.interaction.type === "drawing-roundrect") {
    if (ctx.state.draft.width >= 12 && ctx.state.draft.height >= 12) {
      ctx.pushHistory();
      const defaultRadius = ctx.getRoundRectRadius(ctx.state.draft);
      const roundrect = {
        id: ctx.uid("shape"),
        ...ctx.state.draft,
        cornerRadius: defaultRadius,
        cornerRadii: { tl: defaultRadius, tr: defaultRadius, br: defaultRadius, bl: defaultRadius },
      };
      ctx.state.shapes.push(roundrect);
      ctx.setSelection("shape", roundrect.id);
      ctx.setStatus("已创建圆角矩形。");
    } else {
      ctx.setStatus("圆角矩形太小，没有创建。");
    }
  }

  if (ctx.state.interaction.type === "drawing-semicircle" || ctx.state.interaction.type === "drawing-arc") {
    if (ctx.state.draft.width >= 12 && ctx.state.draft.height >= 12) {
      ctx.pushHistory();
      const shape = { id: ctx.uid("shape"), ...ctx.state.draft };
      ctx.state.shapes.push(shape);
      ctx.setSelection("shape", shape.id);
      ctx.setStatus(ctx.state.draft.type === "semicircle" ? "已创建半圆弧。" : "已创建圆弧。");
    } else {
      ctx.setStatus("图形太小，没有创建。");
    }
  }

  if (ctx.state.interaction.type === "drawing-circle") {
    if (ctx.state.draft.r >= 12) {
      ctx.pushHistory();
      const circle = { id: ctx.uid("shape"), ...ctx.state.draft };
      ctx.state.shapes.push(circle);
      ctx.setSelection("shape", circle.id);
      ctx.setStatus("已创建圆。");
    } else {
      ctx.setStatus("拖动距离太短，没有创建圆。");
    }
  }

  ctx.state.draft = null;
  ctx.state.guides = [];
}

export function updateShapeMoveTool(ctx, point) {
  const interaction = ctx.state.interaction;
  if (!interaction || interaction.type !== "move-shape") {
    return;
  }
  if (ctx.distance(point, interaction.startPointer) < ctx.moveThreshold) {
    return;
  }
  ctx.clearLongPressTimer();
  ctx.clearLastShapeTap();
  interaction.hasMoved = true;
  const shape = ctx.getShape(interaction.shapeId);
  if (!shape) {
    return;
  }
  const delta = ctx.sub(point, interaction.startPointer);
  ctx.state.guides = [];
  if (ctx.isLineShape(shape)) {
    shape.x1 = interaction.original.x1 + delta.x;
    shape.y1 = interaction.original.y1 + delta.y;
    shape.x2 = interaction.original.x2 + delta.x;
    shape.y2 = interaction.original.y2 + delta.y;
  } else if (shape.type === "circle") {
    const rawCenter = {
      x: interaction.original.cx + delta.x,
      y: interaction.original.cy + delta.y,
    };
    const cornerSnap = ctx.snapCircleToRectEqualMargin(rawCenter, shape.id);
    const snapped =
      cornerSnap ||
      ctx.snapPoint(rawCenter, {
        allowPointSnap: true,
        snapX: true,
        snapY: true,
        ignoreShapeId: shape.id,
      });
    shape.cx = snapped.point.x;
    shape.cy = snapped.point.y;
    ctx.state.guides = snapped.guides;
  } else if (shape.type === "polar-profile") {
    const rawCenter = {
      x: interaction.original.center.x + delta.x,
      y: interaction.original.center.y + delta.y,
    };
    const snapped = ctx.snapPoint(rawCenter, {
      allowPointSnap: true,
      snapX: true,
      snapY: true,
      ignoreShapeId: shape.id,
    });
    shape.center = snapped.point;
    ctx.state.guides = snapped.guides;
  } else {
    shape.x = interaction.original.x + delta.x;
    shape.y = interaction.original.y + delta.y;
  }
  ctx.render();
  ctx.renderGuides();
}

export function updateSelectionMoveTool(ctx, point) {
  const interaction = ctx.state.interaction;
  if (!interaction || interaction.type !== "move-shape-group") {
    return;
  }
  if (ctx.distance(point, interaction.startPointer) < ctx.moveThreshold) {
    return;
  }
  interaction.hasMoved = true;
  const delta = ctx.sub(point, interaction.startPointer);
  interaction.shapeIds.forEach((shapeId) => {
    const shape = ctx.getShape(shapeId);
    const original = interaction.originals[shapeId];
    if (!shape || !original) {
      return;
    }
    if (ctx.isLineShape(shape)) {
      shape.x1 = original.x1 + delta.x;
      shape.y1 = original.y1 + delta.y;
      shape.x2 = original.x2 + delta.x;
      shape.y2 = original.y2 + delta.y;
      return;
    }
    if (shape.type === "circle") {
      shape.cx = original.cx + delta.x;
      shape.cy = original.cy + delta.y;
      return;
    }
    if (shape.type === "polar-profile") {
      shape.center = {
        x: original.center.x + delta.x,
        y: original.center.y + delta.y,
      };
      return;
    }
    shape.x = original.x + delta.x;
    shape.y = original.y + delta.y;
  });
  ctx.render();
}

export function updateAnnotationMoveTool(ctx, point) {
  const interaction = ctx.state.interaction;
  if (!interaction || interaction.type !== "move-annotation") {
    return;
  }
  if (ctx.distance(point, interaction.startPointer) < ctx.moveThreshold) {
    return;
  }
  interaction.hasMoved = true;
  const annotation = ctx.getAnnotation(interaction.annotationId);
  if (!annotation) {
    return;
  }
  const shape = ctx.getShape(annotation.shapeId);
  if (annotation.type === "length") {
    if (!shape) {
      return;
    }
    const reference = ctx.getLengthReference(shape, annotation.segment);
    if (!reference) {
      return;
    }
    const { normal, p1, p2 } = ctx.getLineMetrics(reference);
    const sign = annotation.offset >= 0 ? 1 : -1;
    if (interaction.dragMode === "adjust-extension") {
      const basePoint = interaction.dragSide === "start" ? p1 : p2;
      const extensionValue = Math.max(0, ctx.dot(ctx.sub(point, basePoint), normal) * sign - Math.abs(annotation.offset));
      if (interaction.dragSide === "start") {
        annotation.startExtensionOvershoot = extensionValue;
      } else {
        annotation.endExtensionOvershoot = extensionValue;
      }
    } else {
      annotation.offset = ctx.clampMagnitude(ctx.dot(ctx.sub(point, p1), normal), 24);
    }
    ctx.render();
    return;
  }
  if (
    annotation.type === "manual-dimension-line" ||
    annotation.type === "manual-dimension-line-labeled" ||
    annotation.type === "manual-extension-line" ||
    annotation.type === "manual-single-arrow" ||
    annotation.type === "manual-text"
  ) {
    const delta = ctx.sub(point, interaction.startPointer);
    if (
      annotation.type === "manual-dimension-line" ||
      annotation.type === "manual-dimension-line-labeled" ||
      annotation.type === "manual-extension-line" ||
      annotation.type === "manual-single-arrow"
    ) {
      if (annotation.type === "manual-extension-line" && interaction.dragMode?.startsWith("resize-")) {
        const snapped = ctx.snapPoint(point, {
          allowPointSnap: true,
          snapX: true,
          snapY: true,
          ignoreShapeId: annotation.id,
        });
        ctx.state.guides = snapped.guides;
        if (interaction.dragMode === "resize-start") {
          annotation.x1 = snapped.point.x;
          annotation.y1 = snapped.point.y;
        } else {
          annotation.x2 = snapped.point.x;
          annotation.y2 = snapped.point.y;
        }
      } else if (annotation.type === "manual-dimension-line-labeled" && interaction.dragMode === "move-label") {
        const line = {
          x1: interaction.original.x1,
          y1: interaction.original.y1,
          x2: interaction.original.x2,
          y2: interaction.original.y2,
        };
        const metrics = ctx.getLineMetrics(line);
        annotation.labelOffset = ctx.sub(point, metrics.mid);
      } else {
        annotation.x1 = interaction.original.x1 + delta.x;
        annotation.y1 = interaction.original.y1 + delta.y;
        annotation.x2 = interaction.original.x2 + delta.x;
        annotation.y2 = interaction.original.y2 + delta.y;
      }
    } else {
      annotation.x = interaction.original.x + delta.x;
      annotation.y = interaction.original.y + delta.y;
    }
    ctx.render();
    if (annotation.type === "manual-extension-line" && interaction.dragMode?.startsWith("resize-")) {
      ctx.renderGuides?.();
    }
    return;
  }
  if (annotation.type === "radius") {
    const geometry = ctx.getRadiusAnnotationGeometry(shape, annotation);
    if (!geometry) {
      return;
    }
    if (interaction.dragMode === "adjust-angle") {
      if (shape?.type === "circle") {
        annotation.angle = Math.atan2(point.y - shape.cy, point.x - shape.cx);
      } else if (ctx.isArcLikeShape(shape)) {
        const anchor = ctx.getArcRadiusAnchor(shape);
        annotation.angle = Math.atan2(point.y - anchor.center.y, point.x - anchor.center.x);
      } else if (shape?.type === "roundrect") {
        const corner = ctx.getRoundRectCornerInfo(shape, point);
        if (corner) {
          annotation.corner = corner.key;
          annotation.angle = Math.atan2(point.y - corner.center.y, point.x - corner.center.x);
        }
      }
    } else if (interaction.dragMode === "adjust-length") {
      annotation.outerLength = Math.max(ctx.dimensionStyle.arrowLength + 18, ctx.dot(ctx.sub(point, geometry.rim), geometry.direction));
    } else {
      annotation.labelOffset = ctx.sub(point, geometry.tail);
    }
    ctx.render();
    return;
  }
  if (annotation.type === "angle") {
    const geometry = ctx.getAngleAnnotationGeometry(shape, annotation);
    if (!geometry) {
      return;
    }
    if (interaction.dragMode === "move-label") {
      annotation.labelOffset = ctx.sub(point, geometry.defaultLabelPoint);
      ctx.render();
    } else if (interaction.dragMode === "adjust-offset") {
      const direction =
        interaction.dragSide === "end"
          ? geometry.endDirection
          : interaction.dragSide === "start"
            ? geometry.startDirection
            : ctx.normalize(ctx.sub(point, geometry.center));
      const projectedRadius = ctx.dot(ctx.sub(point, geometry.center), direction);
      annotation.offset = Math.max(16, projectedRadius - geometry.arcRadius);
      ctx.render();
    }
    return;
  }
  if (annotation.type === "arc-chord" || annotation.type === "arc-length") {
    const geometry = ctx.getArcMeasureAnnotationGeometry(shape, annotation);
    if (!geometry) {
      return;
    }
    if (interaction.dragMode === "move-label" && geometry.defaultLabelPoint) {
      annotation.labelOffset = ctx.sub(point, geometry.defaultLabelPoint);
    } else if (annotation.type === "arc-length") {
      const direction = ctx.normalize(ctx.sub(point, geometry.center));
      const projectedRadius = ctx.dot(ctx.sub(point, geometry.center), direction);
      annotation.offset = Math.max(16, projectedRadius - geometry.arcRadius);
    } else {
      const baselinePoint = geometry.start;
      const offsetVector = ctx.sub(geometry.dimStart, geometry.start);
      const normal = ctx.normalize(offsetVector);
      annotation.offset = Math.max(16, ctx.dot(ctx.sub(point, baselinePoint), normal));
    }
    ctx.render();
    return;
  }
  if (annotation.type === "polar-coordinate") {
    const geometry = ctx.getPolarCoordinateAnnotationGeometry(shape, annotation);
    if (!geometry) {
      return;
    }
    if (interaction.dragMode === "move-radius-label") {
      annotation.radiusLabelOffset = ctx.sub(point, geometry.defaultRadiusLabelPoint);
    } else if (interaction.dragMode === "move-angle-label") {
      annotation.angleLabelOffset = ctx.sub(point, geometry.defaultAngleLabelPoint);
    }
    ctx.render();
    return;
  }
  if (annotation.type === "diameter" && shape?.type === "circle" && ctx.useOutsideDiameter(annotation, shape)) {
    const safeAngle = ctx.avoidDiameterAxisAngle(annotation.angle);
    const direction = ctx.normalize({ x: Math.cos(safeAngle), y: Math.sin(safeAngle) });
    const geometry = ctx.getOutsideDiameterGeometry(annotation, shape, direction);
    if (interaction.dragMode === "move-label") {
      annotation.labelOffset = ctx.sub(point, { x: shape.cx, y: shape.cy });
    } else if (interaction.dragMode === "adjust-length") {
      if (interaction.dragSide === "start") {
        annotation.startExtensionLength = Math.max(
          ctx.dimensionStyle.arrowLength + 8,
          ctx.dot(ctx.sub(point, geometry.start), geometry.outwardStart),
        );
      } else {
        annotation.endExtensionLength = Math.max(
          ctx.dimensionStyle.arrowLength + 8,
          ctx.dot(ctx.sub(point, geometry.end), geometry.outwardEnd),
        );
      }
    } else {
      annotation.angle = Math.atan2(point.y - shape.cy, point.x - shape.cx);
    }
    ctx.render();
    return;
  }
  if (shape?.type === "circle") {
    if (annotation.type === "diameter" && interaction.dragMode === "move-label") {
      annotation.labelOffset = ctx.sub(point, { x: shape.cx, y: shape.cy });
    } else {
      annotation.angle = Math.atan2(point.y - shape.cy, point.x - shape.cx);
    }
    ctx.render();
    return;
  }
  if (annotation.type === "radius" && ctx.isArcLikeShape(shape)) {
    const anchor = ctx.getArcRadiusAnchor(shape);
    annotation.angle = Math.atan2(point.y - anchor.center.y, point.x - anchor.center.x);
    ctx.render();
    return;
  }
  if (annotation.type === "radius" && shape?.type === "roundrect") {
    const corner = ctx.getRoundRectCornerInfo(shape, point);
    if (corner) {
      annotation.corner = corner.key;
      annotation.angle = Math.atan2(point.y - corner.center.y, point.x - corner.center.x);
      ctx.render();
    }
  }
}
