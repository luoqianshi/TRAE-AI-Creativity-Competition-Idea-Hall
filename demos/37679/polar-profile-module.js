import {
  createPolarPoint,
  polarPointToCartesian,
  createPolarProfileShape,
  defaultPolarProfilePoints,
  parsePolarProfilePoints,
  serializePolarProfilePoints,
} from "./polar-profile.js";

export function createPolarProfileFromCenterFlow(ctx, center) {
  ctx.pushHistory();
  const shape = createPolarProfileShape(ctx.uid("shape"), center, defaultPolarProfilePoints());
  ctx.state.shapes.push(shape);
  ctx.setSelection("shape", shape.id);
  ctx.render();
  ctx.setStatus("已创建凸轮曲线。");
}

export function startPolarProfileDraftFlow(ctx, center) {
  ctx.setSelection(null, null);
  ctx.hideFloatingPanels();
  ctx.state.interaction = {
    type: "drawing-polar-profile",
    stage: "placing-points",
    start: center,
    hasDragged: false,
  };
  ctx.state.guides = [];
  ctx.state.draft = {
    type: "polar-profile",
    center: { x: center.x, y: center.y },
    points: [],
    closed: true,
    interpolation: "smooth",
    previewPoint: null,
  };
  ctx.render();
  ctx.setStatus("已确定凸轮中心，继续点击添加轮廓点，双击结束。");
}

export function updatePolarProfileDraftFlow(ctx, point) {
  if (!ctx.state.draft || ctx.state.draft.type !== "polar-profile") {
    return;
  }
  const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
  ctx.state.guides = snapped.guides;
  ctx.state.draft.previewPoint = snapped.point;
  if (ctx.distance(ctx.state.draft.center, snapped.point) >= 4) {
    ctx.state.interaction.hasDragged = true;
  }
  const previewPolarPoint = createPolarPoint(ctx.state.draft.center, snapped.point);
  ctx.state.draft.points = [...(ctx.state.draft.basePoints || []), previewPolarPoint];
  ctx.renderDraft();
  ctx.renderGuides();
  ctx.renderLiveMetrics();
}

export function commitPolarProfilePointFlow(ctx, point) {
  if (!ctx.state.draft || ctx.state.draft.type !== "polar-profile") {
    return false;
  }
  const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
  const basePoints = ctx.state.draft.basePoints || [];
  if (basePoints.length >= 3) {
    const firstPoint = polarPointToCartesian(ctx.state.draft.center, basePoints[0]);
    if (ctx.distance(snapped.point, firstPoint) <= 16) {
      return ctx.finalizePolarProfileDraft();
    }
  }
  const polarPoint = createPolarPoint(ctx.state.draft.center, snapped.point);
  const nextPoints = [...basePoints, polarPoint];
  ctx.state.draft.basePoints = nextPoints;
  ctx.state.draft.points = nextPoints;
  ctx.state.draft.previewPoint = snapped.point;
  ctx.state.guides = snapped.guides;
  ctx.render();
  ctx.setStatus(`已添加第 ${nextPoints.length} 个凸轮点；点击起始点附近、双击或按 Enter 可闭合。`);
  return true;
}

export function finalizePolarProfileDraftFlow(ctx) {
  if (!ctx.state.draft || ctx.state.draft.type !== "polar-profile") {
    return false;
  }
  const points = ctx.state.draft.basePoints || [];
  if (points.length < 3) {
    ctx.setStatus("至少需要 3 个点才能生成凸轮曲线。");
    return false;
  }
  ctx.pushHistory();
  const shape = createPolarProfileShape(ctx.uid("shape"), ctx.state.draft.center, points);
  ctx.state.shapes.push(shape);
  ctx.setSelection("shape", shape.id);
  ctx.state.draft = null;
  ctx.state.guides = [];
  ctx.state.interaction = null;
  ctx.render();
  ctx.setStatus("已创建凸轮曲线。");
  return true;
}

export function updateSelectedPolarProfilePointsFlow(ctx, text) {
  if (!ctx.state.selected || ctx.state.selected.kind !== "shape") {
    return false;
  }
  const shape = ctx.getShape(ctx.state.selected.id);
  if (!shape || shape.type !== "polar-profile") {
    return false;
  }
  const points = parsePolarProfilePoints(text);
  ctx.pushHistory();
  shape.points = points;
  ctx.render();
  ctx.setStatus("已更新凸轮曲线点列。");
  return true;
}

export function getSelectedPolarProfileTextFlow(ctx) {
  if (!ctx.state.selected || ctx.state.selected.kind !== "shape") {
    return "";
  }
  const shape = ctx.getShape(ctx.state.selected.id);
  if (!shape || shape.type !== "polar-profile") {
    return "";
  }
  return serializePolarProfilePoints(shape.points);
}
