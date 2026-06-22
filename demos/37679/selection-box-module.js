export function updateSelectionBoxFlow(selectionBox, point, renderGuides) {
  if (!selectionBox) {
    return selectionBox;
  }
  selectionBox.x2 = point.x;
  selectionBox.y2 = point.y;
  renderGuides();
  return selectionBox;
}

export function getSelectionBoxBoundsFlow(selectionBox) {
  if (!selectionBox) {
    return null;
  }
  return {
    left: Math.min(selectionBox.x1, selectionBox.x2),
    right: Math.max(selectionBox.x1, selectionBox.x2),
    top: Math.min(selectionBox.y1, selectionBox.y2),
    bottom: Math.max(selectionBox.y1, selectionBox.y2),
  };
}

export function getShapeSelectionBoundsFlow(shape, isLineShape, getRectMetrics) {
  if (isLineShape(shape)) {
    return {
      left: Math.min(shape.x1, shape.x2),
      right: Math.max(shape.x1, shape.x2),
      top: Math.min(shape.y1, shape.y2),
      bottom: Math.max(shape.y1, shape.y2),
    };
  }
  if (shape.type === "rect" || shape.type === "roundrect" || shape.type === "semicircle" || shape.type === "arc") {
    const { left, top, right, bottom } = getRectMetrics(shape);
    return { left, top, right, bottom };
  }
  if (shape.type === "circle") {
    return { left: shape.cx - shape.r, right: shape.cx + shape.r, top: shape.cy - shape.r, bottom: shape.cy + shape.r };
  }
  if (shape.type === "polar-profile") {
    const points = shape.points || [];
    if (!points.length) {
      return null;
    }
    const cartesian = points.map((point) => {
      const angleRad = (point.angleDeg * Math.PI) / 180;
      return {
        x: shape.center.x + Math.cos(angleRad) * point.radius,
        y: shape.center.y - Math.sin(angleRad) * point.radius,
      };
    });
    return {
      left: Math.min(...cartesian.map((point) => point.x)),
      right: Math.max(...cartesian.map((point) => point.x)),
      top: Math.min(...cartesian.map((point) => point.y)),
      bottom: Math.max(...cartesian.map((point) => point.y)),
    };
  }
  return null;
}

export function finishSelectionBoxFlow(ctx, selectionBox) {
  const bounds = getSelectionBoxBoundsFlow(selectionBox);
  const ids = [];
  if (bounds) {
    ctx.state.shapes.forEach((shape) => {
      const box = getShapeSelectionBoundsFlow(shape, ctx.isLineShape, ctx.getRectMetrics);
      if (!box) {
        return;
      }
      if (box.left >= bounds.left && box.right <= bounds.right && box.top >= bounds.top && box.bottom <= bounds.bottom) {
        ids.push(shape.id);
      }
    });
  }
  if (ids.length) {
    ctx.setSelection("shape", ids);
    ctx.selectionMeta.textContent = `已框选 ${ids.length} 个图形。可拖动整体移动。`;
    ctx.render();
    return null;
  }
  ctx.setSelection(null, null);
  ctx.render();
  return null;
}

export function beginSelectionBoxFlow(state, point, setSelection, exitShapeParameterEdit) {
  state.interaction = {
    type: "selection-box",
    startPointer: point,
    hasMoved: false,
  };
  setSelection(null, null);
  exitShapeParameterEdit();
  return { x1: point.x, y1: point.y, x2: point.x, y2: point.y };
}
