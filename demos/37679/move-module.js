import {
  updateAnnotationMoveTool,
  updateSelectionMoveTool,
  updateShapeMoveTool,
} from "./drawing.js";

export function beginShapeMoveFlow(ctx, shape, point) {
  ctx.pushHistory();
  ctx.state.interaction = {
    type: "move-shape",
    shapeId: shape.id,
    startPointer: point,
    original: ctx.clone(shape),
    hasMoved: false,
  };
  ctx.exitShapeParameterEdit();
  ctx.setSelection("shape", shape.id);
}

export function beginSelectionMoveFlow(ctx, shapeIds, point) {
  const originals = shapeIds
    .map((id) => ctx.getShape(id))
    .filter(Boolean)
    .map((shape) => [shape.id, ctx.clone(shape)]);
  if (!originals.length) {
    return;
  }
  ctx.pushHistory();
  ctx.state.interaction = {
    type: "move-shape-group",
    shapeIds: originals.map(([id]) => id),
    originals: Object.fromEntries(originals),
    startPointer: point,
    hasMoved: false,
  };
  ctx.exitShapeParameterEdit();
  ctx.setSelection("shape", ctx.state.interaction.shapeIds);
}

export function beginAnnotationMoveFlow(ctx, annotation, point, target = null) {
  const dragDetails = ctx.getAnnotationDragDetails(annotation, point, target);
  if ((annotation?.type === "polar-coordinate" || annotation?.type === "angle") && !dragDetails.dragMode) {
    ctx.setSelection("annotation", annotation.id);
    return;
  }
  ctx.pushHistory();
  ctx.state.interaction = {
    type: "move-annotation",
    annotationId: annotation.id,
    startPointer: point,
    original: ctx.clone(annotation),
    dragMode: dragDetails.dragMode,
    dragSide: dragDetails.dragSide,
    hasMoved: false,
  };
  ctx.setSelection("annotation", annotation.id);
}

export function updateShapeMoveFlow(ctx, point) {
  updateShapeMoveTool(ctx, point);
}

export function updateSelectionMoveFlow(ctx, point) {
  updateSelectionMoveTool(ctx, point);
}

export function updateAnnotationMoveFlow(ctx, point) {
  updateAnnotationMoveTool(ctx, point);
}
