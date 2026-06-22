import {
  finalizeDrawingTool,
  startBoxDrawingTool,
  startCircleDrawingTool,
  startHiddenLineDrawingTool,
  startLineDrawingTool,
  startManualLineDrawingTool,
  updateDrawingTool,
} from "./drawing.js";

export function startBoxDrawingFlow(ctx, kind, point) {
  startBoxDrawingTool(ctx, kind, point);
}

export function startLineDrawingFlow(ctx, point) {
  startLineDrawingTool(ctx, "line", point);
}

export function startHiddenLineDrawingFlow(ctx, point) {
  startHiddenLineDrawingTool(ctx, point);
}

export function startLineVariantDrawingFlow(ctx, type, point) {
  startLineDrawingTool(ctx, type, point);
}

export function startCircleDrawingFlow(ctx, point) {
  startCircleDrawingTool(ctx, point);
}

export function startManualLineDrawingFlow(ctx, type, point) {
  startManualLineDrawingTool(ctx, type, point);
}

export function placeManualTextFlow(ctx, point) {
  const snapped = ctx.snapPoint(point, { allowPointSnap: true, snapX: true, snapY: true });
  ctx.pushHistory();
  const annotation = ctx.createManualText(snapped.point);
  ctx.state.annotations.push(annotation);
  ctx.setSelection("annotation", annotation.id);
  ctx.state.guides = [];
  ctx.render();
  ctx.setStatus("已放置手动尺寸数字，可在左侧输入框修改。");
}

export function updateDrawingFlow(ctx, point) {
  updateDrawingTool(ctx, point);
}

export function finalizeDrawingFlow(ctx) {
  if (
    ctx.state.interaction &&
    ctx.state.draft &&
    ctx.state.interaction.type === "drawing-manual-dimension-line-labeled"
  ) {
    const start = { x: ctx.state.draft.x1, y: ctx.state.draft.y1 };
    const end = { x: ctx.state.draft.x2, y: ctx.state.draft.y2 };
    if (ctx.distance(start, end) >= 8) {
      ctx.pushHistory();
      const annotation = ctx.createManualDimensionLineLabeled(ctx.state.draft);
      ctx.state.annotations.push(annotation);
      ctx.setSelection("annotation", annotation.id);
      ctx.setStatus("已创建带字尺寸线。");
    } else {
      ctx.setStatus("拖动距离太短，没有创建手动标注线。");
    }
    ctx.state.draft = null;
    ctx.state.guides = [];
    return;
  }

  finalizeDrawingTool(ctx);
}
