export function rectFromPoints(start, end) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

export function getRectMetrics(rect) {
  const left = rect.x;
  const top = rect.y;
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;
  return {
    left,
    top,
    right,
    bottom,
    center: { x: (left + right) / 2, y: (top + bottom) / 2 },
  };
}

export function getRoundRectRadius(shape) {
  const maxRadius = Math.max(4, Math.min(shape.width, shape.height) / 2);
  const fallback = Math.max(10, Math.min(28, Math.min(shape.width, shape.height) * 0.18));
  const source = typeof shape.cornerRadius === "number" ? shape.cornerRadius : fallback;
  return Math.max(4, Math.min(maxRadius, source));
}

export function clampRoundRectRadius(shape, value) {
  const maxRadius = Math.max(0, Math.min(shape.width, shape.height) / 2);
  return Math.max(0, Math.min(maxRadius, Number(value) || 0));
}

export function getRoundRectRadii(shape) {
  const fallback = getRoundRectRadius(shape);
  const source = shape.cornerRadii || {};
  return {
    tl: clampRoundRectRadius(shape, source.tl ?? fallback),
    tr: clampRoundRectRadius(shape, source.tr ?? fallback),
    br: clampRoundRectRadius(shape, source.br ?? fallback),
    bl: clampRoundRectRadius(shape, source.bl ?? fallback),
  };
}

export function setRoundRectRadii(shape, radii) {
  const current = getRoundRectRadii(shape);
  shape.cornerRadii = {
    tl: clampRoundRectRadius(shape, radii.tl ?? current.tl),
    tr: clampRoundRectRadius(shape, radii.tr ?? current.tr),
    br: clampRoundRectRadius(shape, radii.br ?? current.br),
    bl: clampRoundRectRadius(shape, radii.bl ?? current.bl),
  };
  shape.cornerRadius = Math.round((shape.cornerRadii.tl + shape.cornerRadii.tr + shape.cornerRadii.br + shape.cornerRadii.bl) / 4);
}

export function setAllRoundRectRadii(shape, radius) {
  const nextRadius = clampRoundRectRadius(shape, radius);
  setRoundRectRadii(shape, { tl: nextRadius, tr: nextRadius, br: nextRadius, bl: nextRadius });
}

export function setRectSize(shape, width, height) {
  const { center } = getRectMetrics(shape);
  const nextWidth = Math.max(12, Number(width) || 12);
  const nextHeight = Math.max(12, Number(height) || 12);
  shape.x = center.x - nextWidth / 2;
  shape.y = center.y - nextHeight / 2;
  shape.width = nextWidth;
  shape.height = nextHeight;
}

export function setRoundRectSize(shape, width, height) {
  setRectSize(shape, width, height);
  setRoundRectRadii(shape, getRoundRectRadii(shape));
}

export function setCircleRadius(shape, radius) {
  shape.r = Math.max(6, Number(radius) || 6);
}

export function getSemicircleRadius(shape) {
  return Math.max(6, Math.min(shape.width, shape.height) / 2);
}

export function setSemicircleRadius(shape, radius) {
  const nextRadius = Math.max(6, Number(radius) || 6);
  const { center } = getRectMetrics(shape);
  shape.x = center.x - nextRadius;
  shape.y = center.y - nextRadius;
  shape.width = nextRadius * 2;
  shape.height = nextRadius * 2;
}

export function getArcSpan(shape) {
  return Math.max(12, shape.orientation === "vertical" ? shape.height : shape.width);
}

export function getArcBulge(shape) {
  return Math.max(12, shape.orientation === "vertical" ? shape.width : shape.height);
}

export function setArcSpan(shape, span) {
  const nextSpan = Math.max(12, Number(span) || 12);
  const { center } = getRectMetrics(shape);
  if (shape.orientation === "vertical") {
    shape.y = center.y - nextSpan / 2;
    shape.height = nextSpan;
    return;
  }
  shape.x = center.x - nextSpan / 2;
  shape.width = nextSpan;
}

export function setArcBulge(shape, bulge) {
  const nextBulge = Math.max(12, Number(bulge) || 12);
  const { center } = getRectMetrics(shape);
  if (shape.orientation === "vertical") {
    shape.x = center.x - nextBulge / 2;
    shape.width = nextBulge;
    return;
  }
  shape.y = center.y - nextBulge / 2;
  shape.height = nextBulge;
}

export function flipArcSide(shape) {
  if (shape.side === "top") shape.side = "bottom";
  else if (shape.side === "bottom") shape.side = "top";
  else if (shape.side === "left") shape.side = "right";
  else if (shape.side === "right") shape.side = "left";
}

export function buildArcShape(kind, start, end) {
  const rect = rectFromPoints(start, end);
  if (kind === "semicircle") {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const radius = Math.max(6, Math.max(Math.abs(dx), Math.abs(dy)) / 2);
    const orientation = Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
    const side =
      orientation === "horizontal"
        ? dy < 0
          ? "top"
          : "bottom"
        : dx < 0
          ? "left"
          : "right";
    return {
      type: kind,
      x: start.x - radius,
      y: start.y - radius,
      width: radius * 2,
      height: radius * 2,
      orientation,
      side,
    };
  }
  const orientation = rect.width >= rect.height ? "horizontal" : "vertical";
  const side =
    orientation === "horizontal"
      ? end.y < start.y
        ? "top"
        : "bottom"
      : end.x < start.x
        ? "left"
        : "right";
  return {
    type: kind,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    orientation,
    side,
  };
}
