import {
  AUTOSAVE_STORAGE_KEY,
  AUTO_DIMENSION_STYLE,
  BOARD_BOUNDS,
  DEFAULT_LABEL_FONT_SIZE,
  DEFAULT_UNITS_PER_MM,
  DIMENSION_STYLE,
  DOUBLE_TAP_DELAY,
  EXPORT_IMAGE_SCALE,
  HISTORY_LIMIT,
  LONG_PRESS_DELAY,
  MOVE_THRESHOLD,
  SNAP_STYLE,
  TOOL_HINTS,
} from "./constants.js";
import { getEditorElements } from "./elements.js";
import { readFileAsDataUrl } from "./files.js";
import {
  createAnnotationFromToolFlow,
  createAnnotationFromToolPatchedFlow,
} from "./annotation-module.js";
import {
  getLineAngleDegrees as getLineAngleDegreesDomain,
  getLineLikeShape as getLineLikeShapeDomain,
  getLineMetrics as getLineMetricsDomain,
  normalizeLine as normalizeLineDomain,
  setLineFromLengthAngle as setLineFromLengthAngleDomain,
} from "./line-geometry.js";
import {
  buildArcShape as buildArcShapeDomain,
  clampRoundRectRadius as clampRoundRectRadiusDomain,
  flipArcSide as flipArcSideDomain,
  getArcBulge as getArcBulgeDomain,
  getArcSpan as getArcSpanDomain,
  getRectMetrics as getRectMetricsDomain,
  getRoundRectRadii as getRoundRectRadiiDomain,
  getRoundRectRadius as getRoundRectRadiusDomain,
  getSemicircleRadius as getSemicircleRadiusDomain,
  rectFromPoints as rectFromPointsDomain,
  setAllRoundRectRadii as setAllRoundRectRadiiDomain,
  setArcBulge as setArcBulgeDomain,
  setArcSpan as setArcSpanDomain,
  setCircleRadius as setCircleRadiusDomain,
  setRectSize as setRectSizeDomain,
  setRoundRectRadii as setRoundRectRadiiDomain,
  setRoundRectSize as setRoundRectSizeDomain,
  setSemicircleRadius as setSemicircleRadiusDomain,
} from "./shape-geometry.js";
import { getPolarProfileCartesianPoints, getPolarProfilePath } from "./polar-profile.js";
import {
  applyImportedDrawingFlow,
  buildDrawingSnapshotFlow,
  clearCanvasFlow,
  copySelectedFlow,
  deleteSelectedFlow,
  downloadFileFlow,
  exportDrawingFileFlow,
  importDrawingFileFlow,
} from "./editor-actions-module.js";
import {
  commitPolarProfilePointFlow,
  finalizePolarProfileDraftFlow,
  startPolarProfileDraftFlow,
  updatePolarProfileDraftFlow,
} from "./polar-profile-module.js";
import {
  createExportSvgMarkupFlow,
  loadDemoFlow,
  openBackgroundFileFlow,
  saveBoardAsImageFlow,
} from "./workspace-actions-module.js";
import {
  finalizeDrawingFlow,
  placeManualTextFlow,
  startBoxDrawingFlow,
  startCircleDrawingFlow,
  startHiddenLineDrawingFlow,
  startLineDrawingFlow,
  startLineVariantDrawingFlow,
  startManualLineDrawingFlow,
  updateDrawingFlow,
} from "./drawing-module.js";
import {
  beginAnnotationMoveFlow,
  beginSelectionMoveFlow,
  beginShapeMoveFlow,
  updateAnnotationMoveFlow,
  updateSelectionMoveFlow,
  updateShapeMoveFlow,
} from "./move-module.js";
import {
  beginSelectionBoxFlow,
  finishSelectionBoxFlow,
  getSelectionBoxBoundsFlow,
  getShapeSelectionBoundsFlow,
  updateSelectionBoxFlow,
} from "./selection-box-module.js";
import {
  isAutoAnnotationToolActive,
  isDrawingToolActive,
  isManualLineToolActive,
  isManualToolActive,
  setToolState,
  switchToSelectTool,
} from "./tool-module.js";
import {
  getSelectionIds,
  isSelectionMatch,
  setSelectionState,
} from "./selection-module.js";
import {
  renderAngleAnnotationView,
  renderArcMeasureAnnotationView,
  renderInsideDiameterAnnotationView,
  renderLengthAnnotationView,
  labelBubbleView,
  renderManualDimensionLineLabeledView,
  renderManualDimensionLineView,
  renderManualExtensionLineView,
  renderManualSingleArrowView,
  renderManualTextView,
  renderPolarCoordinateAnnotationView,
  renderRadiusAnnotationView,
} from "./annotations.js?v=20260603b";
import { buildDraftMarkup } from "./draft.js";
import {
  buildAnnotationLayerMarkup,
  buildBackgroundMarkup,
  buildGuidesMarkup,
  buildShapeLayerMarkup,
} from "./layers.js";
import {
  renderArcShapeView,
  renderCircleShapeView,
  renderLineShapeView,
  renderPolarProfileShapeView,
  renderRectLikeShapeView,
} from "./shapes.js";
import {
  applySnapshot as applySnapshotState,
  createSnapshot,
  persistAutosave as persistAutosaveState,
  pushHistory as pushHistoryState,
  redoHistory,
  restoreAutosave as restoreAutosaveState,
  undoHistory,
} from "./history.js";
import { createEditorState, createUidGenerator } from "./editor-state.js";
import {
  add,
  clampMagnitude,
  clone,
  distance,
  dot,
  normalize,
  normalizeReadableRotation,
  pointToSegmentDistance,
  scale,
  sub,
  toDegrees,
} from "./geometry.js";

const {
  svg,
  backgroundLayer,
  guideLayer,
  shapeLayer,
  annotationLayer,
  draftLayer,
  gridRect,
  gridLayer,
  boardHint,
  statusText,
  selectionMeta,
  lineField,
  lineLengthRange,
  lineLengthInput,
  lineAngleRange,
  lineAngleInput,
  rectField,
  rectWidthRange,
  rectWidthInput,
  rectHeightRange,
  rectHeightInput,
  roundRadiusField,
  roundRectWidthRange,
  roundRectWidthInput,
  roundRectHeightRange,
  roundRectHeightInput,
  roundRadiusTlInput,
  roundRadiusTlNumber,
  roundRadiusTrInput,
  roundRadiusTrNumber,
  roundRadiusBrInput,
  roundRadiusBrNumber,
  roundRadiusBlInput,
  roundRadiusBlNumber,
  circleField,
  circleRadiusRange,
  circleRadiusInput,
  semicircleField,
  semicircleRadiusInput,
  semicircleRadiusNumber,
  semicircleRadiusValue,
  semicircleFlipBtn,
  arcField,
  arcSpanInput,
  arcSpanNumber,
  arcSpanValue,
  arcBulgeInput,
  arcBulgeNumber,
  arcBulgeValue,
  arcFlipBtn,
  labelInput,
  labelSizeInput,
  labelDirectionSelect,
  labelRotationInput,
  shapeLineTypeSelect,
  copyBtn,
  resetLabelBtn,
  deleteBtn,
  openImageBtn,
  clearImageBtn,
  backgroundInput,
  importDrawingBtn,
  exportDrawingBtn,
  saveImageBtn,
  drawingFileInput,
  undoBtn,
  redoBtn,
  demoBtn,
  clearBtn,
  gridToggleBtn,
  fullscreenBtn,
  orthoToggle,
  liveMetrics,
  scaleRatioInput,
  toolButtons,
} = getEditorElements(document);

const state = createEditorState(DEFAULT_UNITS_PER_MM);
const uid = createUidGenerator(state);

let longPressTimer = null;
let lastShapeTap = null;
let selectionBox = null;
let backgroundObjectUrl = null;

function buildSnapshot() {
  return createSnapshot(state, clone);
}

function releaseBackgroundObjectUrl() {
  if (backgroundObjectUrl) {
    URL.revokeObjectURL(backgroundObjectUrl);
    backgroundObjectUrl = null;
  }
}

function applySnapshot(snapshot) {
  applySnapshotState({
    snapshot,
    state,
    clone,
    releaseBackgroundObjectUrl,
    defaultUnitsPerMm: DEFAULT_UNITS_PER_MM,
    scaleRatioInput,
    orthoToggle,
  });
}

function persistAutosave() {
  persistAutosaveState({
    storageKey: AUTOSAVE_STORAGE_KEY,
    snapshot: buildSnapshot(),
  });
}

function restoreAutosave() {
  return restoreAutosaveState({
    storageKey: AUTOSAVE_STORAGE_KEY,
    onRestore: (snapshot) => {
      applySnapshot(snapshot);
      state.history.undoStack = [];
      state.history.redoStack = [];
    },
  });
}

function offsetShapeForCopy(shape, offset = 18) {
  const next = clone(shape);
  if (isLineShape(next)) {
    next.x1 += offset;
    next.y1 += offset;
    next.x2 += offset;
    next.y2 += offset;
    return next;
  }
  if (next.type === "rect" || next.type === "roundrect" || next.type === "semicircle" || next.type === "arc") {
    next.x += offset;
    next.y += offset;
    return next;
  }
  if (next.type === "circle") {
    next.cx += offset;
    next.cy += offset;
    return next;
  }
  return next;
}

function offsetAnnotationForCopy(annotation, shapeMap, offset = 18) {
  const next = clone(annotation);
  if (next.shapeId && shapeMap.has(next.shapeId)) {
    next.shapeId = shapeMap.get(next.shapeId);
  }
  if (typeof next.x1 === "number") next.x1 += offset;
  if (typeof next.y1 === "number") next.y1 += offset;
  if (typeof next.x2 === "number") next.x2 += offset;
  if (typeof next.y2 === "number") next.y2 += offset;
  if (typeof next.offset === "number") next.offset += offset * 0.5;
  if (typeof next.angle === "number") next.angle += Math.PI / 18;
  if (typeof next.labelOffset === "number") next.labelOffset += offset * 0.25;
  if (typeof next.startExtensionLength === "number") next.startExtensionLength += offset * 0.25;
  if (typeof next.endExtensionLength === "number") next.endExtensionLength += offset * 0.25;
  return next;
}

function pushHistory() {
  pushHistoryState({
    state,
    snapshot: buildSnapshot(),
    historyLimit: HISTORY_LIMIT,
  });
}

function setStatus(text) {
  statusText.textContent = text;
}

function setSidebarButtonLabel(button, text) {
  const label = button.querySelector(".tool-label");
  if (label) {
    label.textContent = text;
    return;
  }
  button.textContent = text;
}

function syncGridVisibility() {
  if (gridLayer) {
    gridLayer.style.display = state.showGrid ? "" : "none";
  } else {
    gridRect.hidden = !state.showGrid;
  }
  setSidebarButtonLabel(gridToggleBtn, state.showGrid ? "隐藏网格" : "显示网格");
}

function syncFullscreenButton() {
  setSidebarButtonLabel(fullscreenBtn, document.fullscreenElement ? "退出全屏" : "全屏");
}

function clearLongPressTimer() {
  if (!longPressTimer) {
    return;
  }
  clearTimeout(longPressTimer);
  longPressTimer = null;
}

function isRepeatedShapeTap(shapeId, point) {
  const now = performance.now();
  const matched =
    lastShapeTap &&
    lastShapeTap.shapeId === shapeId &&
    now - lastShapeTap.time <= DOUBLE_TAP_DELAY &&
    distance(lastShapeTap.point, point) <= 18;
  lastShapeTap = { shapeId, point, time: now };
  return matched;
}

function openShapeParameterPanel(shapeId) {
  clearLongPressTimer();
  state.interaction = null;
  state.draft = null;
  state.guides = [];
  setSelection("shape", shapeId);
  enterShapeParameterEdit(shapeId);
  render();
  setStatus("已打开参数面板。");
}

function finishShapeTap(shapeId, point) {
  if (isRepeatedShapeTap(shapeId, point)) {
    openShapeParameterPanel(shapeId);
    return;
  }
  setSelection("shape", shapeId);
  render();
}

function positionPanelOnBoardRight(panel, fallbackHeight = 180) {
  const frameRect = svg.parentElement.getBoundingClientRect();
  const panelHeight = panel.offsetHeight || fallbackHeight;
  const top = Math.max(12, Math.min(18, frameRect.height - panelHeight - 12));
  panel.style.left = "auto";
  panel.style.right = "18px";
  panel.style.top = `${top}px`;
}

function positionLinePanel(shape, force = false) {
  if (!shape || !isLineShape(shape)) {
    lineField.hidden = true;
    return;
  }
  if (!force && state.floatingPanelLock === "line" && !lineField.hidden) {
    return;
  }

  positionPanelOnBoardRight(lineField, 130);
}

function positionRectPanel(shape, force = false) {
  if (!shape || shape.type !== "rect") {
    rectField.hidden = true;
    return;
  }
  if (!force && state.floatingPanelLock === "rect" && !rectField.hidden) {
    return;
  }

  positionPanelOnBoardRight(rectField, 120);
}

function positionFloatingRadiusPanel(shape, force = false) {
  if (!shape || shape.type !== "roundrect") {
    roundRadiusField.hidden = true;
    return;
  }
  if (!force && state.floatingPanelLock === "roundrect" && !roundRadiusField.hidden) {
    return;
  }

  positionPanelOnBoardRight(roundRadiusField, 260);
}

function positionCirclePanel(shape, force = false) {
  if (!shape || shape.type !== "circle") {
    circleField.hidden = true;
    return;
  }
  if (!force && state.floatingPanelLock === "circle" && !circleField.hidden) {
    return;
  }

  positionPanelOnBoardRight(circleField, 100);
}

function positionSemicirclePanel(shape, force = false) {
  if (!shape || shape.type !== "semicircle") {
    semicircleField.hidden = true;
    return;
  }
  if (!force && state.floatingPanelLock === "semicircle" && !semicircleField.hidden) {
    return;
  }

  positionPanelOnBoardRight(semicircleField, 180);
}

function positionArcPanel(shape, force = false) {
  if (!shape || shape.type !== "arc") {
    arcField.hidden = true;
    return;
  }
  if (!force && state.floatingPanelLock === "arc" && !arcField.hidden) {
    return;
  }

  positionPanelOnBoardRight(arcField, 180);
}

function positionSelectedFloatingPanel(force = false) {
  if (!state.selected || state.selected.kind !== "shape") {
    return;
  }
  if (Array.isArray(state.selected.ids)) {
    return;
  }
  const shape = getShape(state.selected.id);
  if (isLineShape(shape)) {
    positionLinePanel(shape, force);
  } else if (shape?.type === "rect") {
    positionRectPanel(shape, force);
  } else if (shape?.type === "roundrect") {
    positionFloatingRadiusPanel(shape, force);
  } else if (shape?.type === "circle") {
    positionCirclePanel(shape, force);
  } else if (shape?.type === "semicircle") {
    positionSemicirclePanel(shape, force);
  } else if (shape?.type === "arc") {
    positionArcPanel(shape, force);
  }
}

function lockFloatingPanel(panelName) {
  state.floatingPanelLock = panelName;
}

function unlockFloatingPanel(panelName) {
  if (state.floatingPanelLock !== panelName) {
    return;
  }
  state.floatingPanelLock = null;
  positionSelectedFloatingPanel(true);
}

function setTool(tool) {
  setToolState({
    state,
    tool,
    hideFloatingPanels,
    isDrawingTool,
    isManualTool,
    toolButtons,
    setStatus,
    toolHints: TOOL_HINTS,
    render,
  });
}

function switchToSelectAfterDrawing() {
  switchToSelectTool({ state, toolButtons });
}

function isDrawingTool(tool = state.tool) {
  return isDrawingToolActive(tool);
}

function isManualTool(tool = state.tool) {
  return isManualToolActive(tool);
}

function isManualLineTool(tool = state.tool) {
  return isManualLineToolActive(tool);
}

function isAutoAnnotationTool(tool = state.tool) {
  return isAutoAnnotationToolActive(tool);
}

function isLineShape(shape) {
  return ["line", "symmetry-line", "chain-line"].includes(shape?.type);
}

function getShapeLineType(shape) {
  return shape?.lineType === "hidden" ? "hidden" : "solid";
}

function getCurrentLineType() {
  return state.currentLineType === "hidden" ? "hidden" : "solid";
}

function setCurrentLineType(lineType) {
  state.currentLineType = lineType === "hidden" ? "hidden" : "solid";
}

function canShapeUseLineType(shape) {
  return ["line", "rect", "roundrect", "circle", "semicircle", "arc", "polar-profile"].includes(shape?.type);
}

function getShapeStrokeClass(shape, baseClass = "shape-stroke") {
  const classes = ["shape-stroke", baseClass];
  if (getShapeLineType(shape) === "hidden") {
    classes.push("shape-stroke-thin", "shape-stroke-dashed");
  }
  return classes.join(" ");
}

function isArcLikeShape(shape) {
  return shape?.type === "semicircle" || shape?.type === "arc";
}

function isPolarProfileShape(shape) {
  return shape?.type === "polar-profile";
}

function getShapeLiveMetrics(shape) {
  if (!shape) {
    return "XFCad 就绪 | 单位：mm";
  }
  if (isLineShape(shape)) {
    const metrics = getLineMetrics(shape);
    const mid = metrics.mid;
    return `位置 ${formatCoordinate(mid)} | 长度 ${formatMillimeter(metrics.length)} | 角度 ${formatNumber(getLineAngleDegrees(shape))}°`;
  }
  if (shape.type === "rect") {
    return `位置 ${formatCoordinate({ x: shape.x, y: shape.y })} | 长 ${formatMillimeter(shape.width)} | 宽 ${formatMillimeter(shape.height)}`;
  }
  if (shape.type === "roundrect") {
    const radii = getRoundRectRadii(shape);
    return `位置 ${formatCoordinate({ x: shape.x, y: shape.y })} | 长 ${formatMillimeter(shape.width)} | 宽 ${formatMillimeter(shape.height)} | 圆角 ${formatMillimeter(radii.tl)}/${formatMillimeter(radii.tr)}/${formatMillimeter(radii.br)}/${formatMillimeter(radii.bl)}`;
  }
  if (shape.type === "circle") {
    return `圆心 ${formatCoordinate({ x: shape.cx, y: shape.cy })} | 半径 ${formatMillimeter(shape.r)} | 直径 ${formatMillimeter(shape.r * 2)}`;
  }
  if (shape.type === "semicircle") {
    const { center } = getRectMetrics(shape);
    const radius = getSemicircleRadius(shape);
    return `圆心 ${formatCoordinate(center)} | 半径 ${formatMillimeter(radius)} | 直径 ${formatMillimeter(radius * 2)} | 开口 ${shape.side === "top" ? "向上" : shape.side === "bottom" ? "向下" : shape.side === "left" ? "向左" : "向右"}`;
  }
  if (shape.type === "arc") {
    const { center } = getRectMetrics(shape);
    return `中心 ${formatCoordinate(center)} | 跨度 ${formatMillimeter(getArcSpan(shape))} | 弓高 ${formatMillimeter(getArcBulge(shape))} | 开口 ${shape.side === "top" ? "向上" : shape.side === "bottom" ? "向下" : shape.side === "left" ? "向左" : "向右"}`;
  }
  if (isPolarProfileShape(shape)) {
    const previewPoint = shape.previewPoint || null;
    if (previewPoint) {
      const radius = distance(shape.center, previewPoint);
      const angle = ((Math.atan2(shape.center.y - previewPoint.y, previewPoint.x - shape.center.x) * 180) / Math.PI + 360) % 360;
      return `凸轮预览 | 中心 ${formatCoordinate(shape.center)} | 半径 ${formatMillimeter(radius)} | 角度 ${formatNumber(angle)}° | 已定点 ${(shape.basePoints || shape.points || []).length} 个`;
    }
    return `凸轮曲线 | 中心 ${formatCoordinate(shape.center)} | 控制点 ${(shape.points || []).length} 个`;
  }
  return "XFCad 就绪 | 单位：mm";
}

function getDraftLiveMetrics() {
  if (!state.draft) {
    return null;
  }
  return getShapeLiveMetrics(state.draft);
}

function setLiveMetricsText(text, { mirrorStatus = false } = {}) {
  if (liveMetrics) {
    liveMetrics.textContent = text;
  }
  if (mirrorStatus && statusText) {
    statusText.textContent = text;
  }
}

function renderLiveMetrics() {
  if (state.draft) {
    setLiveMetricsText(getDraftLiveMetrics() || "绘制中", { mirrorStatus: true });
    return;
  }
  if (state.interaction?.type === "move-shape" && state.interaction.shapeId) {
    setLiveMetricsText(getShapeLiveMetrics(getShape(state.interaction.shapeId)), { mirrorStatus: true });
    return;
  }
  if (state.interaction?.type === "move-shape-group") {
    setLiveMetricsText(`已选 ${state.interaction.shapeIds.length} 个图形`, { mirrorStatus: true });
    return;
  }
  if (state.selected?.kind === "shape") {
    if (Array.isArray(state.selected.ids) && state.selected.ids.length > 1) {
      setLiveMetricsText(`已选 ${state.selected.ids.length} 个图形`);
      return;
    }
    setLiveMetricsText(getShapeLiveMetrics(getShape(state.selected.id)));
    return;
  }
  setLiveMetricsText("XFCad 就绪 | 单位：mm");
}

function getLineVisualClass(shape) {
  if (getShapeLineType(shape) === "hidden") {
    return "shape-stroke-thin shape-stroke-dashed";
  }
  if (shape?.type === "symmetry-line") {
    return "shape-stroke-thin shape-stroke-chain";
  }
  if (shape?.type === "chain-line") {
    return "shape-stroke-thin shape-stroke-chain";
  }
  return "shape-stroke";
}

function hideFloatingPanels() {
  lineField.hidden = true;
  rectField.hidden = true;
  roundRadiusField.hidden = true;
  circleField.hidden = true;
  semicircleField.hidden = true;
  arcField.hidden = true;
  state.floatingPanelLock = null;
}

function enterShapeParameterEdit(shapeId) {
  state.editingShapeId = shapeId;
}

function exitShapeParameterEdit() {
  state.editingShapeId = null;
  hideFloatingPanels();
}

function toggleGrid() {
  state.showGrid = !state.showGrid;
  syncGridVisibility();
  setStatus(state.showGrid ? "已显示网格。" : "已隐藏网格。");
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    setStatus("当前环境暂不支持全屏。");
  }
}

function undo() {
  const restored = undoHistory({
    state,
    currentSnapshot: buildSnapshot(),
    applySnapshot,
  });
  if (!restored) {
    setStatus("没有可撤销的操作。");
    return;
  }
  render();
  persistAutosave();
  setStatus("已撤销上一步。");
}

function redo() {
  const restored = redoHistory({
    state,
    currentSnapshot: buildSnapshot(),
    applySnapshot,
  });
  if (!restored) {
    setStatus("没有可重做的操作。");
    return;
  }
  render();
  persistAutosave();
  setStatus("已重做上一步。");
}

function getSvgPoint(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const transformed = point.matrixTransform(svg.getScreenCTM().inverse());
  return { x: transformed.x, y: transformed.y };
}

function avoidDiameterAxisAngle(angle) {
  const minimumOffset = Math.PI / 12;
  const axes = [0, Math.PI / 2, Math.PI, -Math.PI / 2, -Math.PI];
  let nextAngle = Math.atan2(Math.sin(angle), Math.cos(angle));
  axes.forEach((axis) => {
    const delta = Math.atan2(Math.sin(nextAngle - axis), Math.cos(nextAngle - axis));
    if (Math.abs(delta) < minimumOffset) {
      nextAngle = axis + (delta < 0 ? -minimumOffset : minimumOffset);
    }
  });
  return nextAngle;
}

function estimateLabelWidth(text, fontSize = DEFAULT_LABEL_FONT_SIZE) {
  const scaleRatio = Math.max(0.6, fontSize / DEFAULT_LABEL_FONT_SIZE);
  return Math.max(48 * scaleRatio, (text.replace(/\s+/g, "").length * 13 + 26) * scaleRatio);
}

function getAnnotationFontSize(annotation) {
  return Math.max(10, Math.min(72, Number(annotation?.fontSize) || DEFAULT_LABEL_FONT_SIZE));
}

function getAnnotationTextDirection(annotation) {
  if (annotation?.textDirection === "left") {
    return "left";
  }
  if (annotation?.textDirection === "up") {
    return "up";
  }
  return "auto";
}

function getReadableRotation(annotation, angleDegrees) {
  const direction = getAnnotationTextDirection(annotation);
  if (direction === "left") {
    return -90;
  }
  if (direction === "up") {
    return 0;
  }
  return normalizeReadableRotation(angleDegrees);
}

function getDiameterLabelRotation(annotation, angleDegrees) {
  return getReadableRotation(annotation, angleDegrees);
}

function getTextTopTowardRotation(direction) {
  const unit = normalize(direction);
  return toDegrees(Math.atan2(unit.x, -unit.y));
}

function getArcDimensionLabelRotation(annotation, labelPoint, center) {
  const direction = getAnnotationTextDirection(annotation);
  if (direction === "left") {
    return -90 + getAnnotationTextRotationOffset(annotation);
  }
  if (direction === "up") {
    return getAnnotationTextRotationOffset(annotation);
  }
  let rotation = getTextTopTowardRotation(sub(center, labelPoint)) + 180;
  if (rotation > 180) {
    rotation -= 360;
  }
  return rotation + getAnnotationTextRotationOffset(annotation);
}

function normalizeRotationOffset(value) {
  let rotation = Number(value) || 0;
  while (rotation > 180) {
    rotation -= 360;
  }
  while (rotation <= -180) {
    rotation += 360;
  }
  return rotation;
}

function getAnnotationTextRotationOffset(annotation) {
  return normalizeRotationOffset(annotation?.textRotationOffset);
}

function formatNumber(value) {
  return `${Math.round(value)}`;
}

function toMillimeters(value) {
  return value / Math.max(1, Number(state.unitsPerMm) || DEFAULT_UNITS_PER_MM);
}

function toCanvasUnits(valueMm) {
  return (Number(valueMm) || 0) * Math.max(1, Number(state.unitsPerMm) || DEFAULT_UNITS_PER_MM);
}

function formatMillimeter(value) {
  return `${formatNumber(toMillimeters(value))} mm`;
}

function formatDimensionValue(value) {
  return formatNumber(toMillimeters(value));
}

function formatCoordinate(point) {
  return `${formatNumber(toMillimeters(point.x))},${formatNumber(toMillimeters(point.y))} mm`;
}

function escapeText(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rectFromPoints(start, end) {
  return rectFromPointsDomain(start, end);
}

function getRectMetrics(rect) {
  return getRectMetricsDomain(rect);
}

function getRoundRectRadius(shape) {
  return getRoundRectRadiusDomain(shape);
}

function clampRoundRectRadius(shape, value) {
  return clampRoundRectRadiusDomain(shape, value);
}

function getRoundRectRadii(shape) {
  return getRoundRectRadiiDomain(shape);
}

function approximatelyEqual(a, b, tolerance = 0.5) {
  return Math.abs(a - b) <= tolerance;
}

function isLeftRightSymmetricShape(shape) {
  if (!shape) {
    return false;
  }
  if (shape.type === "rect" || shape.type === "circle") {
    return true;
  }
  if (shape.type === "roundrect") {
    const radii = getRoundRectRadii(shape);
    return approximatelyEqual(radii.tl, radii.tr) && approximatelyEqual(radii.bl, radii.br);
  }
  if (shape.type === "semicircle" || shape.type === "arc") {
    return shape.orientation === "horizontal";
  }
  return false;
}

function getShapeVerticalSymmetryAxis(shape) {
  if (!isLeftRightSymmetricShape(shape)) {
    return null;
  }
  if (shape.type === "circle") {
    const extension = Math.max(18, shape.r * 0.16);
    return {
      x1: shape.cx,
      y1: shape.cy - shape.r - extension,
      x2: shape.cx,
      y2: shape.cy + shape.r + extension,
    };
  }
  const { top, bottom, center } = getRectMetrics(shape);
  const extension = Math.max(18, Math.min(shape.width, shape.height) * 0.16);
  return {
    x1: center.x,
    y1: top - extension,
    x2: center.x,
    y2: bottom + extension,
  };
}

function setRoundRectRadii(shape, radii) {
  setRoundRectRadiiDomain(shape, radii);
}

function setAllRoundRectRadii(shape, radius) {
  setAllRoundRectRadiiDomain(shape, radius);
}

function setRectSize(shape, width, height) {
  setRectSizeDomain(shape, width, height);
}

function setRoundRectSize(shape, width, height) {
  setRoundRectSizeDomain(shape, width, height);
}

function setCircleRadius(shape, radius) {
  setCircleRadiusDomain(shape, radius);
}

function getLineAngleDegrees(line) {
  return getLineAngleDegreesDomain(line, normalizeReadableRotation, toDegrees);
}

function setLineFromLengthAngle(line, length, angleDegrees) {
  setLineFromLengthAngleDomain(line, length, angleDegrees, getLineMetrics);
}

function getRoundRectPath(shape) {
  const { x, y, width, height } = shape;
  const radii = getRoundRectRadii(shape);
  const right = x + width;
  const bottom = y + height;
  return [
    `M ${x + radii.tl} ${y}`,
    `H ${right - radii.tr}`,
    radii.tr ? `A ${radii.tr} ${radii.tr} 0 0 1 ${right} ${y + radii.tr}` : `L ${right} ${y}`,
    `V ${bottom - radii.br}`,
    radii.br ? `A ${radii.br} ${radii.br} 0 0 1 ${right - radii.br} ${bottom}` : `L ${right} ${bottom}`,
    `H ${x + radii.bl}`,
    radii.bl ? `A ${radii.bl} ${radii.bl} 0 0 1 ${x} ${bottom - radii.bl}` : `L ${x} ${bottom}`,
    `V ${y + radii.tl}`,
    radii.tl ? `A ${radii.tl} ${radii.tl} 0 0 1 ${x + radii.tl} ${y}` : `L ${x} ${y}`,
    "Z",
  ].join(" ");
}

function getSemicircleRadius(shape) {
  return getSemicircleRadiusDomain(shape);
}

function setSemicircleRadius(shape, radius) {
  setSemicircleRadiusDomain(shape, radius);
}

function getArcSpan(shape) {
  return getArcSpanDomain(shape);
}

function getArcBulge(shape) {
  return getArcBulgeDomain(shape);
}

function setArcSpan(shape, span) {
  setArcSpanDomain(shape, span);
}

function setArcBulge(shape, bulge) {
  setArcBulgeDomain(shape, bulge);
}

function flipArcSide(shape) {
  flipArcSideDomain(shape);
}

function buildArcShape(kind, start, end) {
  return buildArcShapeDomain(kind, start, end);
}

function normalizeAnglePositive(angle) {
  const tau = Math.PI * 2;
  return ((angle % tau) + tau) % tau;
}

function getArcGeometry(shape) {
  const { left, top, right, bottom, center } = getRectMetrics(shape);
  let start;
  let end;
  let control;

  if (shape.orientation === "vertical") {
    start = { x: center.x, y: top };
    end = { x: center.x, y: bottom };
    control = shape.side === "right" ? { x: right, y: center.y } : { x: left, y: center.y };
  } else {
    start = { x: left, y: center.y };
    end = { x: right, y: center.y };
    control = shape.side === "bottom" ? { x: center.x, y: bottom } : { x: center.x, y: top };
  }

  const x1 = start.x;
  const y1 = start.y;
  const x2 = control.x;
  const y2 = control.y;
  const x3 = end.x;
  const y3 = end.y;
  const determinant = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));

  if (Math.abs(determinant) < 0.001) {
    const radius = Math.max(distance(start, end) / 2, 1);
    return {
      start,
      end,
      control,
      center: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
      radius,
      largeArcFlag: 0,
      sweepFlag: 0,
      spanRad: Math.PI,
    };
  }

  const ux =
    ((x1 * x1 + y1 * y1) * (y2 - y3) +
      (x2 * x2 + y2 * y2) * (y3 - y1) +
      (x3 * x3 + y3 * y3) * (y1 - y2)) /
    determinant;
  const uy =
    ((x1 * x1 + y1 * y1) * (x3 - x2) +
      (x2 * x2 + y2 * y2) * (x1 - x3) +
      (x3 * x3 + y3 * y3) * (x2 - x1)) /
    determinant;
  const arcCenter = { x: ux, y: uy };
  const radius = Math.max(distance(arcCenter, start), 1);

  const startAngle = normalizeAnglePositive(Math.atan2(start.y - arcCenter.y, start.x - arcCenter.x));
  const endAngle = normalizeAnglePositive(Math.atan2(end.y - arcCenter.y, end.x - arcCenter.x));
  const controlAngle = normalizeAnglePositive(Math.atan2(control.y - arcCenter.y, control.x - arcCenter.x));

  const clockwiseSpan = normalizeAnglePositive(endAngle - startAngle);
  const counterClockwiseSpan = normalizeAnglePositive(startAngle - endAngle);
  const clockwiseContainsControl = normalizeAnglePositive(controlAngle - startAngle) <= clockwiseSpan + 0.0001;
  const counterClockwiseContainsControl =
    normalizeAnglePositive(startAngle - controlAngle) <= counterClockwiseSpan + 0.0001;

  const sweepFlag = clockwiseContainsControl && !counterClockwiseContainsControl ? 1 : 0;
  const chosenSpan = sweepFlag ? clockwiseSpan : counterClockwiseSpan;

  return {
    start,
    end,
    control,
    center: arcCenter,
    radius,
    largeArcFlag: chosenSpan > Math.PI ? 1 : 0,
    sweepFlag,
    spanRad: chosenSpan,
  };
}

function getArcPath(shape) {
  const { start, end, radius, largeArcFlag, sweepFlag } = getArcGeometry(shape);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

function normalizeLine(line) {
  return normalizeLineDomain(line);
}

function getLineMetrics(line) {
  return getLineMetricsDomain(line);
}

function getLineLikeShape(shape) {
  return getLineLikeShapeDomain(shape, isLineShape);
}

function getArcRadius(shape) {
  if (!isArcLikeShape(shape)) {
    return null;
  }
  return getArcGeometry(shape).radius;
}

function getArcRadiusAnchor(shape, angle = 0) {
  const { start, center: arcCenter, radius } = getArcGeometry(shape);
  if (shape.type === "semicircle") {
    const { center } = getRectMetrics(shape);
    return {
      center,
      rim: {
        x: center.x + Math.cos(angle) * getSemicircleRadius(shape),
        y: center.y + Math.sin(angle) * getSemicircleRadius(shape),
      },
      radius: getSemicircleRadius(shape),
    };
  }
  const rim =
    angle !== null
      ? { x: arcCenter.x + Math.cos(angle) * radius, y: arcCenter.y + Math.sin(angle) * radius }
      : start;
  return { center: arcCenter, rim, radius };
}

function getArcMidAngle(shape) {
  const geometry = getArcGeometry(shape);
  const startAngle = Math.atan2(geometry.start.y - geometry.center.y, geometry.start.x - geometry.center.x);
  const spanRad = Math.max(0, Math.min(Math.PI * 2, Number(geometry.spanRad) || 0));
  return geometry.sweepFlag ? startAngle + spanRad / 2 : startAngle - spanRad / 2;
}

function getArcMidPoint(shape) {
  const geometry = getArcGeometry(shape);
  const midAngle = getArcMidAngle(shape);
  return {
    x: geometry.center.x + Math.cos(midAngle) * geometry.radius,
    y: geometry.center.y + Math.sin(midAngle) * geometry.radius,
  };
}

function getAngleAnnotationGeometry(shape, annotation) {
  if (shape?.type !== "arc" || annotation?.type !== "angle") {
    return null;
  }

  const geometry = getArcGeometry(shape);
  const spanRad = Math.max(0, Math.min(Math.PI * 2, Number(geometry.spanRad) || 0));
  if (spanRad <= 0.001) {
    return null;
  }

  const offset = Number.isFinite(annotation.offset) ? annotation.offset : 28;
  const dimRadius = Math.max(8, geometry.radius + offset);
  const startExtensionOvershoot = Number.isFinite(annotation.startExtensionOvershoot)
    ? annotation.startExtensionOvershoot
    : 20;
  const endExtensionOvershoot = Number.isFinite(annotation.endExtensionOvershoot)
    ? annotation.endExtensionOvershoot
    : 20;
  const startAngle = Math.atan2(geometry.start.y - geometry.center.y, geometry.start.x - geometry.center.x);
  const endAngle = Math.atan2(geometry.end.y - geometry.center.y, geometry.end.x - geometry.center.x);
  const midAngle = geometry.sweepFlag ? startAngle + spanRad / 2 : startAngle - spanRad / 2;
  const startDirection = { x: Math.cos(startAngle), y: Math.sin(startAngle) };
  const endDirection = { x: Math.cos(endAngle), y: Math.sin(endAngle) };
  const dimStart = {
    x: geometry.center.x + startDirection.x * dimRadius,
    y: geometry.center.y + startDirection.y * dimRadius,
  };
  const dimEnd = {
    x: geometry.center.x + endDirection.x * dimRadius,
    y: geometry.center.y + endDirection.y * dimRadius,
  };
  const extensionStartEnd = {
    x: geometry.center.x + startDirection.x * (dimRadius + startExtensionOvershoot),
    y: geometry.center.y + startDirection.y * (dimRadius + startExtensionOvershoot),
  };
  const extensionEndEnd = {
    x: geometry.center.x + endDirection.x * (dimRadius + endExtensionOvershoot),
    y: geometry.center.y + endDirection.y * (dimRadius + endExtensionOvershoot),
  };
  const defaultLabelPoint = {
    x: geometry.center.x + Math.cos(midAngle) * dimRadius,
    y: geometry.center.y + Math.sin(midAngle) * dimRadius,
  };
  const labelOffset = annotation.labelOffset || { x: 0, y: 0 };
  const labelPoint = add(defaultLabelPoint, labelOffset);
  const labelRotation = getArcDimensionLabelRotation(annotation, labelPoint, geometry.center);
  const tangentAtStart = geometry.sweepFlag
    ? { x: -Math.sin(startAngle), y: Math.cos(startAngle) }
    : { x: Math.sin(startAngle), y: -Math.cos(startAngle) };
  const tangentAtEnd = geometry.sweepFlag
    ? { x: Math.sin(endAngle), y: -Math.cos(endAngle) }
    : { x: -Math.sin(endAngle), y: Math.cos(endAngle) };
  const angleDeg = toDegrees(spanRad);

  return {
    center: geometry.center,
    start: geometry.start,
    end: geometry.end,
    arcRadius: geometry.radius,
    startDirection,
    endDirection,
    dimRadius,
    dimStart,
    dimEnd,
    extensionStartEnd,
    extensionEndEnd,
    defaultLabelPoint,
    labelPoint,
    labelRotation,
    angleDeg,
    label: annotation.customLabel?.trim() || `${formatNumber(angleDeg)}°`,
    arcPath: `M ${dimStart.x} ${dimStart.y} A ${dimRadius} ${dimRadius} 0 ${spanRad > Math.PI ? 1 : 0} ${geometry.sweepFlag} ${dimEnd.x} ${dimEnd.y}`,
    startArrow: createArrowHead(dimStart, tangentAtStart),
    endArrow: createArrowHead(dimEnd, tangentAtEnd),
  };
}

function getArcMeasureAnnotationGeometry(shape, annotation) {
  if (shape?.type !== "arc" || (annotation?.type !== "arc-chord" && annotation?.type !== "arc-length")) {
    return null;
  }

  const geometry = getArcGeometry(shape);
  const spanRad = Math.max(0, Math.min(Math.PI * 2, Number(geometry.spanRad) || 0));
  if (spanRad <= 0.001) {
    return null;
  }

  const offset = Number.isFinite(annotation.offset) ? annotation.offset : 52;
  const startAngle = Math.atan2(geometry.start.y - geometry.center.y, geometry.start.x - geometry.center.x);
  const endAngle = Math.atan2(geometry.end.y - geometry.center.y, geometry.end.x - geometry.center.x);
  const midAngle = geometry.sweepFlag ? startAngle + spanRad / 2 : startAngle - spanRad / 2;
  const startDirection = { x: Math.cos(startAngle), y: Math.sin(startAngle) };
  const endDirection = { x: Math.cos(endAngle), y: Math.sin(endAngle) };
  const midDirection = { x: Math.cos(midAngle), y: Math.sin(midAngle) };
  const chordUnit = normalize(sub(geometry.end, geometry.start));
  const chordNormalRaw = { x: -chordUnit.y, y: chordUnit.x };
  const chordNormal = dot(chordNormalRaw, midDirection) >= 0 ? chordNormalRaw : scale(chordNormalRaw, -1);
  const startExtensionOvershoot = Number.isFinite(annotation.startExtensionOvershoot)
    ? annotation.startExtensionOvershoot
    : 20;
  const endExtensionOvershoot = Number.isFinite(annotation.endExtensionOvershoot)
    ? annotation.endExtensionOvershoot
    : 20;

  if (annotation.type === "arc-chord") {
    const dimStart = add(geometry.start, scale(chordNormal, offset));
    const dimEnd = add(geometry.end, scale(chordNormal, offset));
    const midPoint = { x: (dimStart.x + dimEnd.x) / 2, y: (dimStart.y + dimEnd.y) / 2 };
    const defaultLabelPoint = add(midPoint, scale(chordNormal, AUTO_DIMENSION_STYLE.labelOffset));
    const labelOffset = annotation.labelOffset || { x: 0, y: 0 };
    const labelPoint = add(defaultLabelPoint, labelOffset);
    return {
      kind: "chord",
      start: geometry.start,
      end: geometry.end,
      dimStart,
      dimEnd,
      startExtensionEnd: add(dimStart, scale(chordNormal, startExtensionOvershoot)),
      endExtensionEnd: add(dimEnd, scale(chordNormal, endExtensionOvershoot)),
      defaultLabelPoint,
      labelPoint,
      labelRotation: getArcDimensionLabelRotation(annotation, labelPoint, geometry.center),
      label: annotation.customLabel?.trim() || formatDimensionValue(distance(geometry.start, geometry.end)),
      startArrow: createArrowHead(dimStart, chordUnit),
      endArrow: createArrowHead(dimEnd, scale(chordUnit, -1)),
    };
  }

  const dimRadius = Math.max(8, geometry.radius + offset);
  const dimStart = add(geometry.center, scale(startDirection, dimRadius));
  const dimEnd = add(geometry.center, scale(endDirection, dimRadius));
  const defaultLabelPoint = add(geometry.center, scale(midDirection, dimRadius + AUTO_DIMENSION_STYLE.labelOffset));
  const labelOffset = annotation.labelOffset || { x: 0, y: 0 };
  const labelPoint = add(defaultLabelPoint, labelOffset);
  const tangentAtStart = geometry.sweepFlag
    ? { x: -Math.sin(startAngle), y: Math.cos(startAngle) }
    : { x: Math.sin(startAngle), y: -Math.cos(startAngle) };
  const tangentAtEnd = geometry.sweepFlag
    ? { x: Math.sin(endAngle), y: -Math.cos(endAngle) }
    : { x: -Math.sin(endAngle), y: Math.cos(endAngle) };
  const arcLength = geometry.radius * spanRad;

  return {
    kind: "arc-length",
    center: geometry.center,
    start: geometry.start,
    end: geometry.end,
    arcRadius: geometry.radius,
    dimRadius,
    dimStart,
    dimEnd,
    extensionStartEnd: add(geometry.center, scale(startDirection, dimRadius + startExtensionOvershoot)),
    extensionEndEnd: add(geometry.center, scale(endDirection, dimRadius + endExtensionOvershoot)),
    defaultLabelPoint,
    labelPoint,
    labelRotation: getArcDimensionLabelRotation(annotation, labelPoint, geometry.center),
    label: annotation.customLabel?.trim() || `⌒${formatDimensionValue(arcLength)}`,
    arcPath: `M ${dimStart.x} ${dimStart.y} A ${dimRadius} ${dimRadius} 0 ${spanRad > Math.PI ? 1 : 0} ${geometry.sweepFlag} ${dimEnd.x} ${dimEnd.y}`,
    startArrow: createArrowHead(dimStart, tangentAtStart),
    endArrow: createArrowHead(dimEnd, tangentAtEnd),
  };
}

function getRoundRectCornerInfo(shape, point) {
  if (shape?.type !== "roundrect") {
    return null;
  }
  const radii = getRoundRectRadii(shape);
  const corners = [
    { key: "tl", center: { x: shape.x + radii.tl, y: shape.y + radii.tl }, radius: radii.tl },
    { key: "tr", center: { x: shape.x + shape.width - radii.tr, y: shape.y + radii.tr }, radius: radii.tr },
    { key: "br", center: { x: shape.x + shape.width - radii.br, y: shape.y + shape.height - radii.br }, radius: radii.br },
    { key: "bl", center: { x: shape.x + radii.bl, y: shape.y + shape.height - radii.bl }, radius: radii.bl },
  ].filter((corner) => corner.radius > 0);
  if (!corners.length) {
    return null;
  }
  const nearest = corners
    .map((corner) => ({ ...corner, distance: distance(point, corner.center) }))
    .sort((a, b) => a.distance - b.distance)[0];
  return nearest || null;
}

function getRectSegmentLine(rect, segment) {
  const { left, top, right, bottom } = getRectMetrics(rect);
  if (rect.type === "roundrect") {
    const radii = getRoundRectRadii(rect);
    if (segment === "right") {
      return {
        x1: right,
        y1: Math.min(top + radii.tr, bottom - radii.br),
        x2: right,
        y2: Math.max(top + radii.tr, bottom - radii.br),
      };
    }
    if (segment === "bottom") {
      return {
        x1: Math.min(left + radii.bl, right - radii.br),
        y1: bottom,
        x2: Math.max(left + radii.bl, right - radii.br),
        y2: bottom,
      };
    }
    if (segment === "left") {
      return {
        x1: left,
        y1: Math.min(top + radii.tl, bottom - radii.bl),
        x2: left,
        y2: Math.max(top + radii.tl, bottom - radii.bl),
      };
    }
    return {
      x1: Math.min(left + radii.tl, right - radii.tr),
      y1: top,
      x2: Math.max(left + radii.tl, right - radii.tr),
      y2: top,
    };
  }
  if (segment === "right") {
    return { x1: right, y1: top, x2: right, y2: bottom };
  }
  if (segment === "bottom") {
    return { x1: left, y1: bottom, x2: right, y2: bottom };
  }
  if (segment === "left") {
    return { x1: left, y1: top, x2: left, y2: bottom };
  }
  return { x1: left, y1: top, x2: right, y2: top };
}

function getRoundRectLengthReference(shape, segment) {
  const { left, top, right, bottom } = getRectMetrics(shape);
  const radii = getRoundRectRadii(shape);
  if (segment === "right") {
    return {
      x1: right,
      y1: top,
      x2: right,
      y2: bottom,
      ext1: { x: right - radii.tr, y: top },
      ext2: { x: right - radii.br, y: bottom },
    };
  }
  if (segment === "bottom") {
    return {
      x1: left,
      y1: bottom,
      x2: right,
      y2: bottom,
      ext1: { x: left, y: bottom - radii.bl },
      ext2: { x: right, y: bottom - radii.br },
    };
  }
  if (segment === "left") {
    return {
      x1: left,
      y1: top,
      x2: left,
      y2: bottom,
      ext1: { x: left + radii.tl, y: top },
      ext2: { x: left + radii.bl, y: bottom },
    };
  }
  return {
    x1: left,
    y1: top,
    x2: right,
    y2: top,
    ext1: { x: left, y: top + radii.tl },
    ext2: { x: right, y: top + radii.tr },
  };
}

function getNearestRectSegment(rect, point) {
  const distances = ["top", "right", "bottom", "left"].map((segment) => {
    const line = getRectSegmentLine(rect, segment);
    return {
      segment,
      value: pointToSegmentDistance(point, { x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 }),
    };
  });
  distances.sort((a, b) => a.value - b.value);
  return distances[0].segment;
}

function createSymmetryLineFromShape(shape) {
  const axis = getShapeVerticalSymmetryAxis(shape);
  if (!axis) {
    setStatus("当前图形没有可自动识别的左右对称轴。");
    return;
  }
  pushHistory();
  const line = normalizeLine({ id: uid("shape"), type: "symmetry-line", ...axis });
  state.shapes.push(line);
  setSelection("shape", line.id);
  render();
  setStatus("已自动生成左右对称轴。");
}

function getLengthReference(shape, segment) {
  if (!shape) {
    return null;
  }
  if (isLineShape(shape)) {
    return getLineLikeShape(shape);
  }
  if (shape.type === "roundrect") {
    return getRoundRectLengthReference(shape, segment || "top");
  }
  if (shape.type === "rect") {
    return getRectSegmentLine(shape, segment || "top");
  }
  return null;
}

function getContourSegments(ignoreShapeId = null) {
  const segments = [];
  state.shapes.forEach((shape) => {
    if (shape.id === ignoreShapeId) {
      return;
    }
    if (isLineShape(shape)) {
      segments.push({ a: { x: shape.x1, y: shape.y1 }, b: { x: shape.x2, y: shape.y2 } });
      return;
    }
    if (shape.type === "rect" || shape.type === "roundrect") {
      ["top", "right", "bottom", "left"].forEach((segment) => {
        const edge = getRectSegmentLine(shape, segment);
        segments.push({ a: { x: edge.x1, y: edge.y1 }, b: { x: edge.x2, y: edge.y2 } });
      });
    }
  });
  return segments;
}

function crossProduct(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function isPointOnSegment(point, a, b) {
  const tolerance = 0.01;
  return (
    Math.abs(crossProduct(a, b, point)) <= tolerance &&
    point.x >= Math.min(a.x, b.x) - tolerance &&
    point.x <= Math.max(a.x, b.x) + tolerance &&
    point.y >= Math.min(a.y, b.y) - tolerance &&
    point.y <= Math.max(a.y, b.y) + tolerance
  );
}

function segmentsIntersect(a, b, c, d) {
  const abC = crossProduct(a, b, c);
  const abD = crossProduct(a, b, d);
  const cdA = crossProduct(c, d, a);
  const cdB = crossProduct(c, d, b);

  if (Math.sign(abC) !== Math.sign(abD) && Math.sign(cdA) !== Math.sign(cdB)) {
    return true;
  }
  return isPointOnSegment(c, a, b) || isPointOnSegment(d, a, b) || isPointOnSegment(a, c, d) || isPointOnSegment(b, c, d);
}

function segmentToSegmentDistance(a, b, c, d) {
  if (segmentsIntersect(a, b, c, d)) {
    return 0;
  }
  return Math.min(
    pointToSegmentDistance(a, c, d),
    pointToSegmentDistance(b, c, d),
    pointToSegmentDistance(c, a, b),
    pointToSegmentDistance(d, a, b)
  );
}

function raySegmentIntersectionDistance(origin, direction, a, b) {
  const ray = normalize(direction);
  const segment = sub(b, a);
  const denominator = ray.x * segment.y - ray.y * segment.x;
  if (Math.abs(denominator) < 0.0001) {
    return null;
  }
  const delta = sub(a, origin);
  const t = (delta.x * segment.y - delta.y * segment.x) / denominator;
  const u = (delta.x * ray.y - delta.y * ray.x) / denominator;
  if (t <= 0 || u < 0 || u > 1) {
    return null;
  }
  return t;
}

function safeOutwardPoint(tip, direction, contourSegments, preferredLength) {
  const unit = normalize(direction);
  const nearestHit = contourSegments.reduce((nearest, segment) => {
    const hitDistance = raySegmentIntersectionDistance(tip, unit, segment.a, segment.b);
    return hitDistance === null ? nearest : Math.min(nearest, hitDistance);
  }, Infinity);
  if (!Number.isFinite(nearestHit)) {
    return {
      point: add(tip, scale(unit, preferredLength)),
      blocked: false,
      room: preferredLength,
    };
  }
  const safeLength = Math.max(DIMENSION_STYLE.arrowLength + 3, Math.min(preferredLength, nearestHit - 6));
  return {
    point: add(tip, scale(unit, safeLength)),
    blocked: nearestHit <= DIMENSION_STYLE.arrowLength + 8,
    room: Math.max(0, nearestHit),
  };
}

function buildAxisGuide(axis, value) {
  if (axis === "x") {
    return { x1: value, y1: 0, x2: value, y2: BOARD_BOUNDS.height };
  }
  return { x1: 0, y1: value, x2: BOARD_BOUNDS.width, y2: value };
}

function buildDiagonalGuide(a, b) {
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}

function addRectSnapPoints(points, shape) {
  const { left, top, right, bottom, center } = getRectMetrics(shape);
  points.push(
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
    { x: center.x, y: top },
    { x: right, y: center.y },
    { x: center.x, y: bottom },
    { x: left, y: center.y },
    center
  );
}

function collectSnapPoints(ignoreShapeId = null) {
  const points = [];
  state.shapes.forEach((shape) => {
    if (shape.id === ignoreShapeId) {
      return;
    }

    if (isLineShape(shape)) {
      points.push(
        { x: shape.x1, y: shape.y1 },
        { x: shape.x2, y: shape.y2 },
        { x: (shape.x1 + shape.x2) / 2, y: (shape.y1 + shape.y2) / 2 }
      );
      return;
    }

    if (shape.type === "rect" || shape.type === "roundrect") {
      addRectSnapPoints(points, shape);
      return;
    }

    if (shape.type === "circle") {
      points.push(
        { x: shape.cx, y: shape.cy },
        { x: shape.cx - shape.r, y: shape.cy },
        { x: shape.cx + shape.r, y: shape.cy },
        { x: shape.cx, y: shape.cy - shape.r },
        { x: shape.cx, y: shape.cy + shape.r }
      );
      return;
    }

    if (isPolarProfileShape(shape)) {
      points.push(shape.center, ...getPolarProfileCartesianPoints(shape));
      return;
    }

    if (shape.type === "semicircle" || shape.type === "arc") {
      const { start, end, control, center } = getArcGeometry(shape);
      addRectSnapPoints(points, shape);
      points.push(start, end, control);
      if (shape.type === "arc") {
        points.push(center);
      }
    }
  });
  state.annotations.forEach((annotation) => {
    if (annotation.shapeId && annotation.shapeId === ignoreShapeId) {
      return;
    }

    if (
      annotation.type === "manual-dimension-line" ||
      annotation.type === "manual-extension-line" ||
      annotation.type === "manual-single-arrow"
    ) {
      if (annotation.id === ignoreShapeId) {
        return;
      }
      points.push(
        { x: annotation.x1, y: annotation.y1 },
        { x: annotation.x2, y: annotation.y2 },
        { x: (annotation.x1 + annotation.x2) / 2, y: (annotation.y1 + annotation.y2) / 2 }
      );
      return;
    }

    if (annotation.type === "diameter") {
      const shape = getShape(annotation.shapeId);
      if (shape?.type !== "circle") {
        return;
      }
      const safeAngle = avoidDiameterAxisAngle(annotation.angle);
      const direction = normalize({ x: Math.cos(safeAngle), y: Math.sin(safeAngle) });
      const start = add({ x: shape.cx, y: shape.cy }, scale(direction, -shape.r));
      const end = add({ x: shape.cx, y: shape.cy }, scale(direction, shape.r));
      if (useOutsideDiameter(annotation, shape)) {
        const geometry = getOutsideDiameterGeometry(annotation, shape, direction);
        points.push(geometry.startOuter, geometry.startArrow.baseCenter, geometry.endArrow.baseCenter, geometry.endOuter);
      } else {
        const startArrow = createArrowHead(start, direction);
        const endArrow = createArrowHead(end, scale(direction, -1));
        points.push(start, end, startArrow.baseCenter, endArrow.baseCenter, { x: shape.cx, y: shape.cy });
      }
      return;
    }

    if (annotation.type === "length") {
      const geometry = getLengthAnnotationGeometry(annotation);
      if (geometry) {
        points.push(geometry.dim1, geometry.dim2, geometry.startExtensionEnd, geometry.endExtensionEnd);
      }
      return;
    }

    if (annotation.type === "radius") {
      const shape = getShape(annotation.shapeId);
      const geometry = getRadiusAnnotationGeometry(shape, annotation);
      if (geometry) {
        points.push(geometry.center, geometry.rim, geometry.tail, geometry.arrow.baseCenter);
      }
      return;
    }

    if (annotation.type === "polar-coordinate") {
      const shape = getShape(annotation.shapeId);
      const geometry = getPolarCoordinateAnnotationGeometry(shape, annotation);
      if (geometry) {
        points.push(
          geometry.center,
          geometry.point,
          geometry.basePoint,
          geometry.arcPoint,
          geometry.outerPoint,
          geometry.baseAxisStart,
          geometry.baseAxisEnd,
          geometry.radiusLabelPoint,
          geometry.angleLabelPoint
        );
      }
    }

    if (annotation.type === "angle") {
      const shape = getShape(annotation.shapeId);
      const geometry = getAngleAnnotationGeometry(shape, annotation);
      if (geometry) {
        points.push(
          geometry.center,
          geometry.start,
          geometry.end,
          geometry.dimStart,
          geometry.dimEnd,
          geometry.extensionStartEnd,
          geometry.extensionEndEnd,
          geometry.labelPoint
        );
      }
    }
  });
  return points;
}

function snapPoint(rawPoint, options = {}) {
  const { allowPointSnap = true, snapX = true, snapY = true, ignoreShapeId = null } = options;
  const point = { x: rawPoint.x, y: rawPoint.y };
  const guides = [];
  const candidates = collectSnapPoints(ignoreShapeId);

  if (allowPointSnap && snapX && snapY) {
    let nearestPoint = null;
    let bestDistance = SNAP_STYLE.pointTolerance + 1;
    candidates.forEach((candidate) => {
      const d = distance(rawPoint, candidate);
      if (d < bestDistance) {
        bestDistance = d;
        nearestPoint = candidate;
      }
    });
    if (nearestPoint && bestDistance <= SNAP_STYLE.pointTolerance) {
      point.x = nearestPoint.x;
      point.y = nearestPoint.y;
      guides.push(buildAxisGuide("x", nearestPoint.x), buildAxisGuide("y", nearestPoint.y));
      return { point, guides };
    }
  }

  if (snapX) {
    let nearestX = null;
    let bestDeltaX = SNAP_STYLE.axisTolerance + 1;
    candidates.forEach((candidate) => {
      const dx = Math.abs(candidate.x - rawPoint.x);
      if (dx < bestDeltaX) {
        bestDeltaX = dx;
        nearestX = candidate.x;
      }
    });
    if (nearestX !== null && bestDeltaX <= SNAP_STYLE.axisTolerance) {
      point.x = nearestX;
      guides.push(buildAxisGuide("x", nearestX));
    }
  }

  if (snapY) {
    let nearestY = null;
    let bestDeltaY = SNAP_STYLE.axisTolerance + 1;
    candidates.forEach((candidate) => {
      const dy = Math.abs(candidate.y - rawPoint.y);
      if (dy < bestDeltaY) {
        bestDeltaY = dy;
        nearestY = candidate.y;
      }
    });
    if (nearestY !== null && bestDeltaY <= SNAP_STYLE.axisTolerance) {
      point.y = nearestY;
      guides.push(buildAxisGuide("y", nearestY));
    }
  }

  return { point, guides };
}

function orthogonalLock(start, point) {
  const dx = Math.abs(point.x - start.x);
  const dy = Math.abs(point.y - start.y);
  if (dx >= dy) {
    return { x: point.x, y: start.y };
  }
  return { x: start.x, y: point.y };
}

function snapCircleToRectEqualMargin(rawCenter, ignoreShapeId = null) {
  const threshold = SNAP_STYLE.axisTolerance;
  let best = null;
  state.shapes.forEach((shape) => {
    if (shape.id === ignoreShapeId) {
      return;
    }
    if (shape.type !== "rect" && shape.type !== "roundrect") {
      return;
    }
    const { left, top, right, bottom } = getRectMetrics(shape);
    const candidates = [
      {
        key: "tl",
        delta: (rawCenter.x - left) - (rawCenter.y - top),
        project: (rawCenter.x - left + rawCenter.y - top) / 2,
        point: (project) => ({ x: left + project, y: top + project }),
        guide: (project) => [{ x: left, y: top + project }, { x: left + project, y: top }],
      },
      {
        key: "tr",
        delta: (right - rawCenter.x) - (rawCenter.y - top),
        project: (right - rawCenter.x + rawCenter.y - top) / 2,
        point: (project) => ({ x: right - project, y: top + project }),
        guide: (project) => [{ x: right - project, y: top }, { x: right, y: top + project }],
      },
      {
        key: "br",
        delta: (right - rawCenter.x) - (bottom - rawCenter.y),
        project: (right - rawCenter.x + bottom - rawCenter.y) / 2,
        point: (project) => ({ x: right - project, y: bottom - project }),
        guide: (project) => [{ x: right, y: bottom - project }, { x: right - project, y: bottom }],
      },
      {
        key: "bl",
        delta: (rawCenter.x - left) - (bottom - rawCenter.y),
        project: (rawCenter.x - left + bottom - rawCenter.y) / 2,
        point: (project) => ({ x: left + project, y: bottom - project }),
        guide: (project) => [{ x: left, y: bottom - project }, { x: left + project, y: bottom }],
      },
    ];
    candidates.forEach((candidate) => {
      if (Math.abs(candidate.delta) > threshold) {
        return;
      }
      const margin = candidate.project;
      const point = candidate.point(margin);
      const dist = distance(rawCenter, point);
      if (!best || Math.abs(candidate.delta) < best.delta || (Math.abs(candidate.delta) === best.delta && dist < best.dist)) {
        best = {
          point,
          guides: [
            buildAxisGuide("x", point.x),
            buildAxisGuide("y", point.y),
            buildDiagonalGuide(...candidate.guide(margin)),
          ],
          delta: Math.abs(candidate.delta),
          dist,
          shapeId: shape.id,
          corner: candidate.key,
        };
      }
    });
  });
  return best;
}

function getUpperNormal(direction) {
  const a = { x: -direction.y, y: direction.x };
  const b = { x: direction.y, y: -direction.x };
  if (a.y < b.y) {
    return a;
  }
  if (b.y < a.y) {
    return b;
  }
  return a.x <= b.x ? a : b;
}

function createArrowHead(tip, direction) {
  const unit = normalize(direction);
  const normal = { x: -unit.y, y: unit.x };
  const baseCenter = add(tip, scale(unit, DIMENSION_STYLE.arrowLength));
  const left = add(baseCenter, scale(normal, DIMENSION_STYLE.arrowHalfWidth));
  const right = add(baseCenter, scale(normal, -DIMENSION_STYLE.arrowHalfWidth));
  return {
    baseCenter,
    svg: `<polygon class="arrow-head" points="${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}" />`,
  };
}

function useOutsideDiameter(annotation, circle) {
  return circle.r * 2 < estimateLabelWidth(annotationLabel(annotation), getAnnotationFontSize(annotation)) + 46;
}

function getOutsideDiameterLength(annotation, circle, side) {
  const fallback = Math.max(34, circle.r * 1.05);
  const custom = side === "start" ? annotation.startExtensionLength : annotation.endExtensionLength;
  return Math.max(DIMENSION_STYLE.arrowLength + 8, custom ?? fallback);
}

function getOutsideDiameterGeometry(annotation, circle, direction) {
  const contourSegments = getContourSegments(circle.id);
  const start = add({ x: circle.cx, y: circle.cy }, scale(direction, -circle.r));
  const end = add({ x: circle.cx, y: circle.cy }, scale(direction, circle.r));
  const outwardStart = scale(direction, -1);
  const outwardEnd = direction;
  const startOuter = safeOutwardPoint(start, outwardStart, contourSegments, getOutsideDiameterLength(annotation, circle, "start")).point;
  const endOuter = safeOutwardPoint(end, outwardEnd, contourSegments, getOutsideDiameterLength(annotation, circle, "end")).point;
  const startArrow = createArrowHead(start, outwardStart);
  const endArrow = createArrowHead(end, outwardEnd);
  return {
    start,
    end,
    outwardStart,
    outwardEnd,
    startOuter,
    endOuter,
    startArrow,
    endArrow,
  };
}

function getRadiusOuterLength(annotation, labelWidth) {
  const fallback = Math.max(92, labelWidth + 36);
  return Math.max(DIMENSION_STYLE.arrowLength + 18, annotation.outerLength ?? fallback);
}

function getRadiusAnnotationGeometry(shape, annotation) {
  if (!shape || annotation?.type !== "radius") {
    return null;
  }

  let center;
  let rim;
  let preferInside = false;

  if (shape.type === "circle") {
    const direction = normalize({ x: Math.cos(annotation.angle), y: Math.sin(annotation.angle) });
    center = { x: shape.cx, y: shape.cy };
    rim = add(center, scale(direction, shape.r));
  } else if (isArcLikeShape(shape)) {
    const anchor = getArcRadiusAnchor(shape, annotation.angle);
    center = anchor.center;
    rim = anchor.rim;
    preferInside = shape.type === "arc" && annotation.placement !== "outside";
  } else if (shape.type === "roundrect") {
    const corner = annotation.corner || "tl";
    const radii = getRoundRectRadii(shape);
    const corners = {
      tl: { x: shape.x + radii.tl, y: shape.y + radii.tl, radius: radii.tl },
      tr: { x: shape.x + shape.width - radii.tr, y: shape.y + radii.tr, radius: radii.tr },
      br: { x: shape.x + shape.width - radii.br, y: shape.y + shape.height - radii.br, radius: radii.br },
      bl: { x: shape.x + radii.bl, y: shape.y + shape.height - radii.bl, radius: radii.bl },
    };
    const target = corners[corner];
    if (!target || target.radius <= 0) {
      return null;
    }
    center = { x: target.x, y: target.y };
    rim = {
      x: target.x + Math.cos(annotation.angle) * target.radius,
      y: target.y + Math.sin(annotation.angle) * target.radius,
    };
  } else {
    return null;
  }

  const direction = normalize(sub(rim, center));
  const normal = { x: -direction.y, y: direction.x };
  const label = annotationLabel(annotation);
  const labelWidth = estimateLabelWidth(label, getAnnotationFontSize(annotation));
  const insideTailDistance = Math.max(
    24,
    Math.min(Math.max(24, distance(center, rim) - DIMENSION_STYLE.arrowLength - 12), distance(center, rim) * 0.55)
  );
  const tail = preferInside
    ? add(center, scale(direction, insideTailDistance))
    : add(rim, scale(direction, getRadiusOuterLength(annotation, labelWidth)));
  const arrow = createArrowHead(rim, preferInside ? scale(direction, -1) : direction);
  const defaultLabelOffset = scale(normal, -AUTO_DIMENSION_STYLE.radiusLabelGap);
  const labelOffset = annotation.labelOffset || defaultLabelOffset;
  const labelPoint = add(tail, labelOffset);
  const radiusAngleDegrees = toDegrees(Math.atan2(direction.y, direction.x));
  const isNearlyVerticalRadius = Math.abs(direction.y) >= Math.abs(direction.x) * 3;
  const textDirection = getAnnotationTextDirection(annotation);
  let labelRotation = isNearlyVerticalRadius && textDirection === "auto" ? -90 : getReadableRotation(annotation, radiusAngleDegrees);
  if (textDirection === "left") {
    labelRotation = -90;
  } else if (textDirection === "up") {
    labelRotation = 0;
  }
  labelRotation += getAnnotationTextRotationOffset(annotation);

  return {
    center,
    rim,
    tail,
    direction,
    label,
    labelWidth,
    arrow,
    labelOffset,
    labelPoint,
    labelRotation,
  };
}

function getPolarCoordinateAnnotationGeometry(shape, annotation) {
  if (!shape || annotation?.type !== "polar-coordinate" || !isPolarProfileShape(shape)) {
    return null;
  }

  const center = shape.center;
  const angleDeg = Number(annotation.angleDeg);
  const baseAngleDeg = Number(annotation.baseAngleDeg);
  const profilePoint = Number.isInteger(annotation.pointIndex) ? shape.points?.[annotation.pointIndex] : null;
  const radius = Number(profilePoint?.radius ?? annotation.radius);
  if (!Number.isFinite(angleDeg) || !Number.isFinite(baseAngleDeg) || !Number.isFinite(radius) || radius <= 0) {
    return null;
  }

  const angleRad = (angleDeg * Math.PI) / 180;
  const baseAngleRad = (baseAngleDeg * Math.PI) / 180;
  const point = {
    x: center.x + Math.cos(angleRad) * radius,
    y: center.y - Math.sin(angleRad) * radius,
  };

  const profilePoints = getPolarProfileCartesianPoints(shape);
  const profileMaxRadius = profilePoints.length
    ? Math.max(...profilePoints.map((profilePoint) => distance(center, profilePoint)))
    : radius;

  const extensionRadius = Math.max(profileMaxRadius, radius) + 42;
  const labelRadius = extensionRadius + 36;
  const arcRadius = extensionRadius;
  const basePoint = {
    x: center.x + Math.cos(baseAngleRad) * arcRadius,
    y: center.y - Math.sin(baseAngleRad) * arcRadius,
  };
  const arcPoint = {
    x: center.x + Math.cos(angleRad) * arcRadius,
    y: center.y - Math.sin(angleRad) * arcRadius,
  };
  const outerPoint = {
    x: center.x + Math.cos(angleRad) * labelRadius,
    y: center.y - Math.sin(angleRad) * labelRadius,
  };
  const radialDirection = {
    x: Math.cos(angleRad),
    y: -Math.sin(angleRad),
  };
  const deltaAngle = ((angleDeg - baseAngleDeg) % 360 + 360) % 360;
  const largeArcFlag = deltaAngle > 180 ? 1 : 0;
  const sweepFlag = 0;
  const arcPath = `M ${basePoint.x} ${basePoint.y} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} ${sweepFlag} ${arcPoint.x} ${arcPoint.y}`;
  const isInitialPolarAxis = Math.abs(baseAngleDeg) < 0.001;
  const baseAxisStart = isInitialPolarAxis ? { x: center.x - 18, y: center.y } : { x: center.x, y: center.y };
  const baseAxisEnd = isInitialPolarAxis
    ? { x: center.x + labelRadius + 12, y: center.y }
    : {
        x: basePoint.x + (basePoint.x - center.x) * ((labelRadius + 12 - arcRadius) / Math.max(1, arcRadius)),
        y: basePoint.y + (basePoint.y - center.y) * ((labelRadius + 12 - arcRadius) / Math.max(1, arcRadius)),
      };
  const radiusBasePoint = {
    x: center.x + Math.cos(angleRad) * (extensionRadius + 26),
    y: center.y - Math.sin(angleRad) * (extensionRadius + 26),
  };
  const radiusUnit = radialDirection;
  const radiusLabelOffsetBase = 14;
  const radialLineAngle = normalizeReadableRotation((Math.atan2(radiusUnit.y, radiusUnit.x) * 180) / Math.PI);
  const isNearlyHorizontalRadius = Math.abs(radiusUnit.x) >= 0.98;
  let defaultRadiusLabelPoint = { ...radiusBasePoint };
  if (!isNearlyHorizontalRadius) {
    const sideSign = radiusUnit.x < 0 ? 1 : -1;
    const normalOffset = {
      x: -radiusUnit.y * sideSign * radiusLabelOffsetBase,
      y: radiusUnit.x * sideSign * radiusLabelOffsetBase,
    };
    defaultRadiusLabelPoint = add(radiusBasePoint, normalOffset);
  } else {
    defaultRadiusLabelPoint = add(radiusBasePoint, { x: 0, y: -radiusLabelOffsetBase });
  }

  const radiusLabelOffset = annotation.radiusLabelOffset || { x: 0, y: 0 };
  const radiusLabelPoint = add(defaultRadiusLabelPoint, radiusLabelOffset);
  const radiusLabel = annotation.customRadiusLabel?.trim() || `${formatDimensionValue(radius)}`;
  let radiusLabelRotation = radialLineAngle;
  if (annotation?.textDirection === "left") {
    radiusLabelRotation = -90;
  } else if (annotation?.textDirection === "up") {
    radiusLabelRotation = 0;
  }
  radiusLabelRotation += getAnnotationTextRotationOffset(annotation);

  const angleMidRad = baseAngleRad + (((angleRad - baseAngleRad) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) / 2;
  const defaultAngleLabelPoint = {
    x: center.x + Math.cos(angleMidRad) * arcRadius,
    y: center.y - Math.sin(angleMidRad) * arcRadius,
  };
  const angleLabelOffset = annotation.angleLabelOffset || { x: 0, y: 0 };
  const angleLabelPoint = add(defaultAngleLabelPoint, angleLabelOffset);
  const angleLabel = annotation.customAngleLabel?.trim() || `${formatNumber(deltaAngle)}\u00B0`;
  const angleLabelRotation = 90 - ((baseAngleDeg + deltaAngle / 2) % 360);

  return {
    center,
    point,
    outerPoint,
    basePoint,
    arcPoint,
    arcPath,
    isInitialPolarAxis,
    baseAxisStart,
    baseAxisEnd,
    radiusArrow: createArrowHead(point, { x: -radialDirection.x, y: -radialDirection.y }),
    baseArcArrow: createArrowHead(basePoint, { x: -Math.sin(baseAngleRad), y: -Math.cos(baseAngleRad) }),
    angleArcArrow: createArrowHead(arcPoint, { x: Math.sin(angleRad), y: Math.cos(angleRad) }),
    radiusLabel,
    angleLabel,
    defaultRadiusLabelPoint,
    defaultAngleLabelPoint,
    radiusLabelPoint,
    angleLabelPoint,
    radiusLabelRotation,
    angleLabelRotation,
  };
}

function getRadiusDragDetails(annotation, point, target) {
  if (target?.closest?.(".label-bubble")) {
    return { dragMode: "move-label", dragSide: null };
  }

  const shape = getShape(annotation.shapeId);
  const geometry = getRadiusAnnotationGeometry(shape, annotation);
  if (!geometry) {
    return { dragMode: "adjust-angle", dragSide: null };
  }

  if (distance(point, geometry.rim) <= 24) {
    return { dragMode: "adjust-angle", dragSide: null };
  }

  return { dragMode: "adjust-length", dragSide: null };
}

function getLengthAnnotationGeometry(annotation) {
  const shape = getShape(annotation.shapeId);
  const reference = getLengthReference(shape, annotation.segment);
  if (!reference) {
    return null;
  }
  const metrics = getLineMetrics(reference);
  const sign = annotation.offset >= 0 ? 1 : -1;
  const dim1 = add(metrics.p1, scale(metrics.normal, annotation.offset));
  const dim2 = add(metrics.p2, scale(metrics.normal, annotation.offset));
  const startExtensionOvershoot = Number.isFinite(annotation.startExtensionOvershoot) ? annotation.startExtensionOvershoot : 12;
  const endExtensionOvershoot = Number.isFinite(annotation.endExtensionOvershoot) ? annotation.endExtensionOvershoot : 12;
  return {
    ...metrics,
    source1: reference.ext1 || metrics.p1,
    source2: reference.ext2 || metrics.p2,
    sign,
    dim1,
    dim2,
    startExtensionEnd: add(dim1, scale(metrics.normal, startExtensionOvershoot * sign)),
    endExtensionEnd: add(dim2, scale(metrics.normal, endExtensionOvershoot * sign)),
  };
}

function getLengthDragDetails(annotation, point) {
  const geometry = getLengthAnnotationGeometry(annotation);
  if (!geometry) {
    return { dragMode: null, dragSide: null };
  }
  const startDistance = distance(point, geometry.startExtensionEnd);
  const endDistance = distance(point, geometry.endExtensionEnd);
  if (startDistance <= 20 || endDistance <= 20) {
    return {
      dragMode: "adjust-extension",
      dragSide: startDistance <= endDistance ? "start" : "end",
    };
  }
  return { dragMode: "adjust-offset", dragSide: null };
}

function getAngleDragDetails(annotation, point, target = null) {
  if (target?.closest?.(".label-bubble")) {
    return { dragMode: "move-label", dragSide: null };
  }

  const shape = getShape(annotation.shapeId);
  const geometry = getAngleAnnotationGeometry(shape, annotation);
  if (!geometry) {
    return { dragMode: null, dragSide: null };
  }

  const startDistance = Math.min(distance(point, geometry.dimStart), distance(point, geometry.extensionStartEnd));
  const endDistance = Math.min(distance(point, geometry.dimEnd), distance(point, geometry.extensionEndEnd));
  if (startDistance <= 22 || endDistance <= 22) {
    return {
      dragMode: "adjust-offset",
      dragSide: startDistance <= endDistance ? "start" : "end",
    };
  }

  return { dragMode: "adjust-offset", dragSide: null };
}

function getOutsideDiameterDragDetails(annotation, circle, point) {
  const safeAngle = avoidDiameterAxisAngle(annotation.angle);
  const direction = normalize({ x: Math.cos(safeAngle), y: Math.sin(safeAngle) });
  const geometry = getOutsideDiameterGeometry(annotation, circle, direction);
  const startSegmentDistance = pointToSegmentDistance(point, geometry.startOuter, geometry.startArrow.baseCenter);
  const endSegmentDistance = pointToSegmentDistance(point, geometry.endOuter, geometry.endArrow.baseCenter);
  const centerSegmentDistance = pointToSegmentDistance(point, geometry.startArrow.baseCenter, geometry.endArrow.baseCenter);

  if (Math.min(startSegmentDistance, endSegmentDistance) <= centerSegmentDistance + 4) {
    return {
      dragMode: "adjust-length",
      dragSide: startSegmentDistance <= endSegmentDistance ? "start" : "end",
    };
  }

  return { dragMode: "adjust-angle", dragSide: null };
}

function getAnnotationDragDetails(annotation, point, target = null) {
  if (annotation.type === "length") {
    return getLengthDragDetails(annotation, point);
  }

  if (annotation.type === "manual-extension-line") {
    const start = { x: annotation.x1, y: annotation.y1 };
    const end = { x: annotation.x2, y: annotation.y2 };
    if (distance(point, start) <= 18) {
      return { dragMode: "resize-start", dragSide: "start" };
    }
    if (distance(point, end) <= 18) {
      return { dragMode: "resize-end", dragSide: "end" };
    }
    return { dragMode: "move-line", dragSide: null };
  }

  if (annotation.type === "radius") {
    return getRadiusDragDetails(annotation, point, target);
  }

  if (annotation.type === "angle") {
    return getAngleDragDetails(annotation, point, target);
  }

  if (annotation.type === "arc-chord" || annotation.type === "arc-length") {
    if (target?.closest?.(".label-bubble")) {
      return { dragMode: "move-label", dragSide: null };
    }
    return { dragMode: "adjust-offset", dragSide: null };
  }

  if (annotation.type === "polar-coordinate") {
    if (target?.closest?.(".polar-angle-label")) {
      return { dragMode: "move-angle-label", dragSide: null };
    }
    if (target?.closest?.(".polar-radius-label")) {
      return { dragMode: "move-radius-label", dragSide: null };
    }
    return { dragMode: null, dragSide: null };
  }

  if (annotation.type === "diameter") {
    if (target?.closest?.(".label-bubble")) {
      return { dragMode: "move-label", dragSide: null };
    }
    const shape = getShape(annotation.shapeId);
    if (shape?.type === "circle" && useOutsideDiameter(annotation, shape)) {
      return getOutsideDiameterDragDetails(annotation, shape, point);
    }
  }

  return { dragMode: null, dragSide: null };
}

function getDiameterOutsideGeometry(circle, labelWidth, preferredDirection) {
  const preferredAngle = Math.atan2(preferredDirection.y, preferredDirection.x);
  const candidateAngles = [preferredAngle];
  const uniqueAngles = [];
  candidateAngles.forEach((angle) => {
    const normalized = Math.atan2(Math.sin(angle), Math.cos(angle));
    if (!uniqueAngles.some((existing) => Math.abs(Math.atan2(Math.sin(existing - normalized), Math.cos(existing - normalized))) < 0.01)) {
      uniqueAngles.push(normalized);
    }
  });

  const contourSegments = getContourSegments(circle.id);
  const extensionLength = Math.max(34, circle.r * 1.05);
  const shelfLength = Math.max(80, labelWidth + 32);
  const candidates = uniqueAngles.map((angle, index) => {
    const direction = normalize({ x: Math.cos(angle), y: Math.sin(angle) });
    const start = add({ x: circle.cx, y: circle.cy }, scale(direction, -circle.r));
    const end = add({ x: circle.cx, y: circle.cy }, scale(direction, circle.r));
    const outwardStart = scale(direction, -1);
    const outwardEnd = direction;
    const startOuterResult = safeOutwardPoint(start, outwardStart, contourSegments, extensionLength);
    const endOuterResult = safeOutwardPoint(end, outwardEnd, contourSegments, extensionLength);
    const startOuter = startOuterResult.point;
    const endOuter = endOuterResult.point;

    const upperTip = start.y <= end.y ? start : end;
    const upperOutward = upperTip === start ? outwardStart : outwardEnd;
    const elbow = add(upperTip, scale(upperOutward, Math.max(42, circle.r * 1.16)));
    const shelfDirection = upperOutward.x >= 0 ? 1 : -1;
    const shelfEnd = { x: elbow.x + shelfDirection * shelfLength, y: elbow.y };
    const labelPoint = { x: (elbow.x + shelfEnd.x) / 2, y: elbow.y - AUTO_DIMENSION_STYLE.shelfLabelGap };
    const annotationSegments = [
      { a: startOuter, b: start },
      { a: start, b: end },
      { a: end, b: endOuter },
      { a: upperTip, b: elbow },
      { a: elbow, b: shelfEnd },
    ];

    let intersections = 0;
    let minimumGap = Infinity;
    annotationSegments.forEach((annotationSegment) => {
      contourSegments.forEach((contourSegment) => {
        if (segmentsIntersect(annotationSegment.a, annotationSegment.b, contourSegment.a, contourSegment.b)) {
          intersections += 1;
          minimumGap = 0;
          return;
        }
        minimumGap = Math.min(
          minimumGap,
          segmentToSegmentDistance(annotationSegment.a, annotationSegment.b, contourSegment.a, contourSegment.b)
        );
      });
    });

    const labelClearance = contourSegments.reduce(
      (best, segment) => Math.min(best, pointToSegmentDistance(labelPoint, segment.a, segment.b)),
      Infinity
    );
    const preferredPenalty = Math.abs(Math.atan2(Math.sin(angle - preferredAngle), Math.cos(angle - preferredAngle))) * 8;
    const axisPenalty =
      Math.abs(direction.y) <= Math.abs(direction.x) * 0.2 || Math.abs(direction.x) <= Math.abs(direction.y) * 0.2
        ? 7000
        : 0;
    const blockedPenalty = (startOuterResult.blocked || endOuterResult.blocked ? 1 : 0) * 5000;
    const shortRoomPenalty = Math.max(0, 28 - Math.min(startOuterResult.room, endOuterResult.room)) * 120;
    const score =
      intersections * 10000 +
      blockedPenalty +
      shortRoomPenalty -
      Math.min(minimumGap, 80) -
      Math.min(labelClearance, 80) * 0.35 +
      preferredPenalty +
      axisPenalty +
      index;
    return {
      direction,
      start,
      end,
      outwardStart,
      outwardEnd,
      startOuter,
      endOuter,
      upperTip,
      upperOutward,
      elbow,
      shelfEnd,
      labelPoint,
      score,
    };
  });

  candidates.sort((a, b) => a.score - b.score);
  return candidates[0];
}

function getDiameterFoldVector(direction) {
  if (Math.abs(direction.y) <= Math.abs(direction.x) * 0.2) {
    return { x: 0, y: 1 };
  }
  if (Math.abs(direction.x) <= Math.abs(direction.y) * 0.2) {
    return { x: 1, y: 0 };
  }
  return null;
}

function renderFoldedDiameterOutside(annotation, outside, circle, label, labelWidth) {
  const selected = isSelected("annotation", annotation.id) ? " is-selected" : "";
  const contourSegments = getContourSegments(circle.id);
  const shelfLength = Math.max(80, labelWidth + 32);
  const startArrow = createArrowHead(outside.start, outside.outwardStart);
  const endArrow = createArrowHead(outside.end, outside.outwardEnd);
  const lowerOuter = outside.startOuter.y >= outside.endOuter.y ? outside.startOuter : outside.endOuter;
  const shelfCandidates = [-1, 1].map((direction, index) => {
    const shelfEnd = { x: lowerOuter.x + direction * shelfLength, y: lowerOuter.y };
    const labelPoint = { x: (lowerOuter.x + shelfEnd.x) / 2, y: lowerOuter.y - AUTO_DIMENSION_STYLE.shelfLabelGap };
    const segments = [{ a: lowerOuter, b: shelfEnd }];
    let intersections = 0;
    let minimumGap = Infinity;
    segments.forEach((segment) => {
      contourSegments.forEach((contourSegment) => {
        if (segmentsIntersect(segment.a, segment.b, contourSegment.a, contourSegment.b)) {
          intersections += 1;
          minimumGap = 0;
          return;
        }
        minimumGap = Math.min(minimumGap, segmentToSegmentDistance(segment.a, segment.b, contourSegment.a, contourSegment.b));
      });
    });
    const labelClearance = contourSegments.reduce(
      (best, segment) => Math.min(best, pointToSegmentDistance(labelPoint, segment.a, segment.b)),
      Infinity
    );
    const awayFromCirclePenalty = direction === (lowerOuter.x < circle.cx ? -1 : 1) ? 0 : 16;
    const score =
      intersections * 10000 -
      Math.min(minimumGap, 80) -
      Math.min(labelClearance, 80) * 0.35 +
      awayFromCirclePenalty +
      index;
    return { shelfEnd, labelPoint, score };
  });
  shelfCandidates.sort((a, b) => a.score - b.score);
  const bestShelf = shelfCandidates[0];
  const diameterPoints = [
    outside.startOuter,
    startArrow.baseCenter,
    endArrow.baseCenter,
    outside.endOuter,
  ]
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <polyline class="hit-target" points="${diameterPoints}" />
      <line class="hit-target" x1="${lowerOuter.x}" y1="${lowerOuter.y}" x2="${bestShelf.shelfEnd.x}" y2="${bestShelf.shelfEnd.y}" />
      <polyline class="annotation-line" points="${diameterPoints}" />
      <line class="annotation-line" x1="${lowerOuter.x}" y1="${lowerOuter.y}" x2="${bestShelf.shelfEnd.x}" y2="${bestShelf.shelfEnd.y}" />
      ${startArrow.svg}
      ${endArrow.svg}
      ${labelBubble(label, bestShelf.labelPoint.x, bestShelf.labelPoint.y)}
    </g>
  `;
}

function renderOutsideDiameterArrows(annotation, circle, direction) {
  const selected = isSelected("annotation", annotation.id) ? " is-selected" : "";
  const geometry = getOutsideDiameterGeometry(annotation, circle, direction);
  const label = annotationLabel(annotation);
  const labelRotation = getDiameterLabelRotation(annotation, toDegrees(Math.atan2(direction.y, direction.x)));
  const defaultLabelOffset = scale(getUpperNormal(direction), AUTO_DIMENSION_STYLE.outsideDiameterCenterOffset);
  const labelOffset = annotation.labelOffset || defaultLabelOffset;
  const labelPoint = add({ x: circle.cx, y: circle.cy }, labelOffset);
  const diameterPoints = [geometry.startOuter, geometry.startArrow.baseCenter, geometry.endArrow.baseCenter, geometry.endOuter]
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <polyline class="hit-target" points="${diameterPoints}" />
      <polyline class="annotation-line" points="${diameterPoints}" />
      ${geometry.startArrow.svg}
      ${geometry.endArrow.svg}
      ${labelBubble(label, labelPoint.x, labelPoint.y, { rotation: labelRotation, fontSize: getAnnotationFontSize(annotation) })}
    </g>
  `;
}

function getShape(id) {
  return state.shapes.find((shape) => shape.id === id) || null;
}

function getAnnotation(id) {
  return state.annotations.find((annotation) => annotation.id === id) || null;
}

function getRadiusLabelValue(shape, annotation) {
  if (!shape) {
    return "";
  }
  if (shape.type === "circle") {
    return formatDimensionValue(shape.r);
  }
  if (shape.type === "semicircle") {
    return formatDimensionValue(getSemicircleRadius(shape));
  }
  if (shape.type === "arc") {
    return formatDimensionValue(getArcRadius(shape) || 0);
  }
  if (shape.type === "roundrect") {
    const radii = getRoundRectRadii(shape);
    return formatDimensionValue(radii[annotation?.corner || "tl"] || 0);
  }
  return "";
}

function getNearestPolarProfilePointIndex(shape, point) {
  if (!isPolarProfileShape(shape)) {
    return -1;
  }
  const points = getPolarProfileCartesianPoints(shape);
  let nearestIndex = -1;
  let bestDistance = Infinity;
  points.forEach((candidate, index) => {
    const currentDistance = distance(candidate, point);
    if (currentDistance < bestDistance) {
      bestDistance = currentDistance;
      nearestIndex = index;
    }
  });
  return nearestIndex;
}

function createPolarCoordinateAnnotation(shape, point) {
  if (!isPolarProfileShape(shape)) {
    return null;
  }
  const pointIndex = getNearestPolarProfilePointIndex(shape, point);
  const profilePoint = Number.isInteger(pointIndex) ? shape.points?.[pointIndex] : null;
  const dx = point.x - shape.center.x;
  const dy = shape.center.y - point.y;
  const radius = Number(profilePoint?.radius ?? Math.hypot(dx, dy));
  if (radius < 6) {
    return null;
  }
  const angleDeg = Number(profilePoint?.angleDeg ?? ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360);
  const previousPolarAnnotation = [...state.annotations]
    .reverse()
    .find((annotation) => annotation.type === "polar-coordinate" && annotation.shapeId === shape.id);
  return {
    id: uid("ann"),
    type: "polar-coordinate",
    shapeId: shape.id,
    angleDeg,
    baseAngleDeg: Number.isFinite(previousPolarAnnotation?.angleDeg) ? previousPolarAnnotation.angleDeg : 0,
    radius,
    pointIndex,
    radiusLabelOffset: null,
    angleLabelOffset: null,
    fontSize: DEFAULT_LABEL_FONT_SIZE,
    textDirection: "auto",
    customLabel: "",
    customRadiusLabel: "",
    customAngleLabel: "",
  };
}

function createRadiusAnnotation(shape, point) {
  if (shape.type === "circle") {
    return {
      id: uid("ann"),
      type: "radius",
      shapeId: shape.id,
      angle: Math.atan2(point.y - shape.cy, point.x - shape.cx) || -Math.PI / 4,
      labelOffset: null,
      outerLength: null,
      fontSize: DEFAULT_LABEL_FONT_SIZE,
      textDirection: "auto",
      customLabel: "",
    };
  }
  if (shape.type === "semicircle" || shape.type === "arc") {
    const anchor = getArcRadiusAnchor(shape);
    const radiusPoint = shape.type === "arc" ? getArcMidPoint(shape) : point;
    const defaultAngle = Math.atan2(radiusPoint.y - anchor.center.y, radiusPoint.x - anchor.center.x);
    return {
      id: uid("ann"),
      type: "radius",
      shapeId: shape.id,
      angle: Number.isFinite(defaultAngle) ? defaultAngle : -Math.PI / 4,
      labelOffset: null,
      outerLength: null,
      fontSize: DEFAULT_LABEL_FONT_SIZE,
      textDirection: "auto",
      customLabel: "",
    };
  }
  if (shape.type === "roundrect") {
    const corner = getRoundRectCornerInfo(shape, point);
    if (!corner) {
      return null;
    }
    return {
      id: uid("ann"),
      type: "radius",
      shapeId: shape.id,
      corner: corner.key,
      angle: Math.atan2(point.y - corner.center.y, point.x - corner.center.x) || -Math.PI / 4,
      labelOffset: null,
      outerLength: null,
      fontSize: DEFAULT_LABEL_FONT_SIZE,
      textDirection: "auto",
      customLabel: "",
    };
  }
  return null;
}

function createAnnotationFromToolPatched(shape, point) {
  return createAnnotationFromToolPatchedFlow(
    {
      state,
      isLineShape,
      setStatus,
      pushHistory,
      getNearestRectSegment,
      createLengthAnnotation,
      clampMagnitude,
      setSelection,
      clone,
      render,
      getExistingDiameterAnnotationForCircleGroup,
      createCircleAnnotation,
      createRadiusAnnotation,
    },
    shape,
    point,
  );
}

function setSelection(kind, id) {
  setSelectionState(state, kind, id);
}

function isSelected(kind, id) {
  return isSelectionMatch(state, kind, id);
}

function getSelectedIds(kind) {
  return getSelectionIds(state, kind);
}

function getSameSizeCircles(circle) {
  if (!circle || circle.type !== "circle") {
    return [];
  }
  const targetDiameterLabel = formatDimensionValue(circle.r * 2);
  return state.shapes.filter(
    (shape) => shape.type === "circle" && formatDimensionValue((shape.r || 0) * 2) === targetDiameterLabel
  );
}

function getExistingDiameterAnnotationForCircleGroup(circle, excludeAnnotationId = null) {
  const sameSizeIds = new Set(
    getSameSizeCircles(circle)
      .map((shape) => shape.id)
      .filter((id) => id === circle.id),
  );
  return (
    state.annotations.find(
      (annotation) =>
        annotation.id !== excludeAnnotationId &&
        annotation.type === "diameter" &&
        sameSizeIds.has(annotation.shapeId)
    ) || null
  );
}

function defaultAnnotationLabel(annotation) {
  const shape = getShape(annotation.shapeId);
  if (annotation.type === "length") {
    const reference = getLengthReference(shape, annotation.segment);
    return reference ? formatDimensionValue(getLineMetrics(reference).length) : "";
  }
  if (annotation.type === "diameter" && shape?.type === "circle") {
    const sameSizeCount = getSameSizeCircles(shape).length;
    const baseLabel = `⌀${formatDimensionValue(shape.r * 2)}`;
    return sameSizeCount > 1 ? `${sameSizeCount}×${baseLabel}` : baseLabel;
  }
  if (annotation.type === "radius") {
    const value = getRadiusLabelValue(shape, annotation);
    return value ? `R${value}` : "";
  }
  if (annotation.type === "angle") {
    const geometry = getAngleAnnotationGeometry(shape, annotation);
    return geometry ? `${formatNumber(geometry.angleDeg)}°` : "";
  }
  if (annotation.type === "arc-chord" || annotation.type === "arc-length") {
    const geometry = getArcMeasureAnnotationGeometry(shape, annotation);
    return geometry?.label || "";
  }
  if (annotation.type === "polar-coordinate" && isPolarProfileShape(shape)) {
    if (
      !Number.isFinite(annotation.radius) ||
      !Number.isFinite(annotation.angleDeg) ||
      !Number.isFinite(annotation.baseAngleDeg)
    ) {
      return "";
    }
    const deltaAngle = ((annotation.angleDeg - annotation.baseAngleDeg) % 360 + 360) % 360;
    const radiusLabel = annotation.customRadiusLabel?.trim() || `${formatDimensionValue(annotation.radius)}`;
    const angleLabel = annotation.customAngleLabel?.trim() || `${formatNumber(deltaAngle)}°`;
    return `${radiusLabel} / ${angleLabel}`;
  }
  return "";
}

function annotationLabel(annotation) {
  if (annotation.type === "polar-coordinate") {
    return defaultAnnotationLabel(annotation);
  }
  return annotation.customLabel?.trim() || defaultAnnotationLabel(annotation);
}

function getManualDimensionLineLabel(annotation) {
  const line = { x1: annotation.x1, y1: annotation.y1, x2: annotation.x2, y2: annotation.y2 };
  return annotation.text?.trim() || formatDimensionValue(getLineMetrics(line).length);
}

function createLengthAnnotation(shape, segment = null) {
  return {
    id: uid("ann"),
    type: "length",
    shapeId: shape.id,
    segment,
    offset: -72,
    fontSize: DEFAULT_LABEL_FONT_SIZE,
    textDirection: "auto",
    customLabel: "",
  };
}

function createAngleAnnotation(shape) {
  if (shape?.type !== "arc") {
    return null;
  }
  return {
    id: uid("ann"),
    type: "angle",
    shapeId: shape.id,
    offset: 28,
    labelOffset: null,
    fontSize: DEFAULT_LABEL_FONT_SIZE,
    textDirection: "auto",
    customLabel: "",
  };
}

function createArcMeasureAnnotation(shape, type) {
  if (shape?.type !== "arc" || (type !== "arc-chord" && type !== "arc-length")) {
    return null;
  }
  return {
    id: uid("ann"),
    type,
    shapeId: shape.id,
    offset: type === "arc-length" ? 48 : 52,
    labelOffset: null,
    fontSize: DEFAULT_LABEL_FONT_SIZE,
    textDirection: "auto",
    customLabel: "",
  };
}

function createCircleAnnotation(circle, type, angle) {
  return {
    id: uid("ann"),
    type,
    shapeId: circle.id,
    angle,
    labelOffset: null,
    startExtensionLength: null,
    endExtensionLength: null,
    fontSize: DEFAULT_LABEL_FONT_SIZE,
    textDirection: "auto",
    customLabel: "",
  };
}

function createManualDimensionLine(draft) {
  return {
    id: uid("ann"),
    type: "manual-dimension-line",
    x1: draft.x1,
    y1: draft.y1,
    x2: draft.x2,
    y2: draft.y2,
    fontSize: DEFAULT_LABEL_FONT_SIZE,
    textDirection: "auto",
  };
}

function createManualDimensionLineLabeled(draft) {
  return {
    id: uid("ann"),
    type: "manual-dimension-line-labeled",
    x1: draft.x1,
    y1: draft.y1,
    x2: draft.x2,
    y2: draft.y2,
    text: "",
    labelOffset: null,
    fontSize: DEFAULT_LABEL_FONT_SIZE,
    textDirection: "auto",
  };
}

function createManualExtensionLine(draft) {
  return {
    id: uid("ann"),
    type: "manual-extension-line",
    x1: draft.x1,
    y1: draft.y1,
    x2: draft.x2,
    y2: draft.y2,
  };
}

function createManualText(point) {
  return { id: uid("ann"), type: "manual-text", x: point.x, y: point.y, text: "100", fontSize: DEFAULT_LABEL_FONT_SIZE, textDirection: "auto" };
}

function isManualAnnotation(annotation) {
  return ["manual-dimension-line", "manual-dimension-line-labeled", "manual-extension-line", "manual-single-arrow", "manual-text"].includes(annotation?.type);
}

function removeOrphanAnnotations() {
  const ids = new Set(state.shapes.map((shape) => shape.id));
  state.annotations = state.annotations.filter((annotation) => !annotation.shapeId || ids.has(annotation.shapeId));
}

function labelBubble(text, x, y, options = {}) {
  return labelBubbleView(
    {
      escapeText,
      defaultLabelFontSize: DEFAULT_LABEL_FONT_SIZE,
    },
    text,
    x,
    y,
    options,
  );
}

function renderLineShape(line) {
  return renderLineShapeView({ isSelected, state, getLineVisualClass }, line);
}

function renderRectLikeShape(shape, rounded = false) {
  return renderRectLikeShapeView({ isSelected, state, getRectMetrics, getShapeStrokeClass, getRoundRectPath }, shape, rounded);
}

function renderCircleShape(circle) {
  return renderCircleShapeView({ isSelected, state, getShapeStrokeClass }, circle);
}

function renderArcShape(shape) {
  return renderArcShapeView({ isSelected, state, getArcPath, getArcGeometry, getShapeStrokeClass }, shape);
}

function renderPolarProfileShape(shape) {
  return renderPolarProfileShapeView(
    { isSelected, state, getPolarProfilePath, getPolarProfileCartesianPoints, getShapeStrokeClass },
    shape,
  );
}

function renderLengthAnnotation(annotation, line) {
  return renderLengthAnnotationView(
    {
      isSelected,
      getLineMetrics,
      add,
      scale,
      createArrowHead,
      autoDimensionStyle: AUTO_DIMENSION_STYLE,
      getReadableRotation,
      getAnnotationTextRotationOffset,
      toDegrees,
      annotationLabel,
      getAnnotationFontSize,
      escapeText,
      defaultLabelFontSize: DEFAULT_LABEL_FONT_SIZE,
    },
    annotation,
    line,
  );
}

function renderDiameterAnnotation(annotation, circle) {
  const safeAngle = avoidDiameterAxisAngle(annotation.angle);
  const direction = normalize({ x: Math.cos(safeAngle), y: Math.sin(safeAngle) });
  const useOutside = useOutsideDiameter(annotation, circle);

  if (useOutside) {
    return renderOutsideDiameterArrows(annotation, circle, direction);
  }
  return renderInsideDiameterAnnotationView(
    {
      isSelected,
      add,
      scale,
      annotationLabel,
      getUpperNormal,
      autoDimensionStyle: AUTO_DIMENSION_STYLE,
      getDiameterLabelRotation,
      getAnnotationTextRotationOffset,
      toDegrees,
      createArrowHead,
      getAnnotationFontSize,
      escapeText,
      defaultLabelFontSize: DEFAULT_LABEL_FONT_SIZE,
    },
    annotation,
    circle,
    direction,
  );
}

function renderRadiusAnnotation(annotation, circle) {
  return renderRadiusAnnotationView(
    {
      isSelected,
      getRadiusAnnotationGeometry,
      getAnnotationTextRotationOffset,
      getAnnotationFontSize,
      escapeText,
      defaultLabelFontSize: DEFAULT_LABEL_FONT_SIZE,
    },
    annotation,
    circle,
  );
}

function renderGenericRadiusAnnotation(annotation, shape) {
  return renderRadiusAnnotationView(
    {
      isSelected,
      getRadiusAnnotationGeometry,
      getAnnotationTextRotationOffset,
      getAnnotationFontSize,
      escapeText,
      defaultLabelFontSize: DEFAULT_LABEL_FONT_SIZE,
    },
    annotation,
    shape,
  );
}

function renderAngleAnnotation(annotation, shape) {
  return renderAngleAnnotationView(
    {
      isSelected,
      getAngleAnnotationGeometry,
      getAnnotationTextRotationOffset,
      getAnnotationFontSize,
      labelBubble,
    },
    annotation,
    shape,
  );
}

function renderArcMeasureAnnotation(annotation, shape) {
  return renderArcMeasureAnnotationView(
    {
      isSelected,
      getArcMeasureAnnotationGeometry,
      getAnnotationTextRotationOffset,
      getAnnotationFontSize,
      labelBubble,
    },
    annotation,
    shape,
  );
}

function renderPolarCoordinateAnnotation(annotation, shape) {
  return renderPolarCoordinateAnnotationView(
    {
      isSelected,
      getPolarCoordinateAnnotationGeometry,
      getAnnotationTextRotationOffset,
      getAnnotationFontSize,
      labelBubble,
    },
    annotation,
    shape,
  );
}

function renderManualDimensionLine(annotation) {
  return renderManualDimensionLineView({ isSelected, getLineMetrics, createArrowHead, scale }, annotation);
}

function renderManualDimensionLineLabeled(annotation) {
  return renderManualDimensionLineLabeledView(
    {
      isSelected,
      getLineMetrics,
      createArrowHead,
      scale,
      add,
      getManualDimensionLineLabel,
      autoDimensionStyle: AUTO_DIMENSION_STYLE,
      getReadableRotation,
      getAnnotationTextRotationOffset,
      toDegrees,
      getAnnotationFontSize,
      escapeText,
      defaultLabelFontSize: DEFAULT_LABEL_FONT_SIZE,
    },
    annotation,
  );
}

function renderManualExtensionLine(annotation) {
  return renderManualExtensionLineView({ isSelected }, annotation);
}

function renderManualSingleArrow(annotation) {
  return renderManualSingleArrowView({ isSelected, getLineMetrics, createArrowHead, scale }, annotation);
}

function renderManualText(annotation) {
  return renderManualTextView(
    {
      isSelected,
      getReadableRotation,
      getAnnotationTextRotationOffset,
      getAnnotationFontSize,
      escapeText,
      defaultLabelFontSize: DEFAULT_LABEL_FONT_SIZE,
    },
    annotation,
  );
}

function renderBackground() {
  backgroundLayer.innerHTML = buildBackgroundMarkup(state.background);
}

function renderGuides() {
  guideLayer.innerHTML = buildGuidesMarkup(state.guides, selectionBox);
}

function renderDraft() {
  draftLayer.innerHTML = buildDraftMarkup(
    {
      renderManualDimensionLine,
      renderManualDimensionLineLabeled,
      renderManualExtensionLine,
      getRoundRectRadius,
      getArcPath,
      getPolarProfilePath,
      getPolarProfileCartesianPoints,
      renderLineShape,
      renderManualSingleArrow,
    },
    state.draft,
  );
}

function renderInspector() {
  const selectedShapeIds = getSelectedIds("shape");
  const isMultiShapeSelection = selectedShapeIds.length > 1;
  const isEditingSelectedShape =
    state.selected?.kind === "shape" &&
    !isMultiShapeSelection &&
    state.editingShapeId === state.selected.id &&
    !state.interaction?.type?.startsWith("drawing-");

  if (
    !isEditingSelectedShape &&
    (state.interaction?.type?.startsWith("drawing-") || ((isDrawingTool() || isManualTool()) && !state.selected))
  ) {
    hideFloatingPanels();
    selectionMeta.textContent = isManualTool() ? "正在手动标注。" : "正在绘制图形。";
    labelInput.value = "";
    labelInput.disabled = true;
    if (shapeLineTypeSelect) {
      shapeLineTypeSelect.value = getShapeLineType(state.draft) || getCurrentLineType();
      shapeLineTypeSelect.disabled = false;
    }
    if (copyBtn) {
      copyBtn.disabled = true;
    }
    resetLabelBtn.disabled = true;
    deleteBtn.disabled = true;
    return;
  }

  if (!state.selected) {
    hideFloatingPanels();
    selectionMeta.textContent = "还没有选中对象。可以先选择线型，再画一条线、矩形、圆、半圆弧或圆弧。";
    labelInput.value = "";
    labelInput.disabled = true;
    if (shapeLineTypeSelect) {
      shapeLineTypeSelect.value = getCurrentLineType();
      shapeLineTypeSelect.disabled = false;
    }
    if (copyBtn) {
      copyBtn.disabled = true;
    }
    resetLabelBtn.disabled = true;
    deleteBtn.disabled = true;
    return;
  }

  deleteBtn.disabled = false;
  if (copyBtn) {
    copyBtn.disabled = isMultiShapeSelection;
  }

  if (state.selected.kind === "shape") {
    if (isMultiShapeSelection) {
      hideFloatingPanels();
      selectionMeta.textContent = `已选中 ${selectedShapeIds.length} 个图形，可拖动整体移动。`;
      labelInput.value = "";
      labelInput.disabled = true;
      if (shapeLineTypeSelect) {
        shapeLineTypeSelect.value = "solid";
        shapeLineTypeSelect.disabled = true;
      }
      resetLabelBtn.disabled = true;
      return;
    }
    const shape = getShape(state.selected.id);
    if (!shape) {
      setSelection(null, null);
      renderInspector();
      return;
    }

    if (!isEditingSelectedShape) {
      hideFloatingPanels();
      if (isLineShape(shape)) {
        selectionMeta.innerHTML = `直线<br>长度：${formatMillimeter(getLineMetrics(shape).length)}<br>角度：${formatNumber(getLineAngleDegrees(shape))}°`;
      } else if (shape.type === "rect") {
        selectionMeta.innerHTML = `矩形<br>长：${formatMillimeter(shape.width)}<br>宽：${formatMillimeter(shape.height)}`;
      } else if (shape.type === "roundrect") {
        const radii = getRoundRectRadii(shape);
        selectionMeta.innerHTML = `圆角矩形<br>长：${formatMillimeter(shape.width)}<br>宽：${formatMillimeter(shape.height)}<br>左上/右上/右下/左下：${formatMillimeter(radii.tl)} / ${formatMillimeter(radii.tr)} / ${formatMillimeter(radii.br)} / ${formatMillimeter(radii.bl)}`;
      } else if (shape.type === "circle") {
        selectionMeta.innerHTML = `圆<br>半径：${formatMillimeter(shape.r)}<br>直径：${formatMillimeter(shape.r * 2)}`;
      } else if (shape.type === "semicircle") {
        selectionMeta.innerHTML = `半圆弧<br>半径：${formatMillimeter(getSemicircleRadius(shape))}<br>直径：${formatMillimeter(getSemicircleRadius(shape) * 2)}`;
      } else if (shape.type === "arc") {
        selectionMeta.innerHTML = `圆弧<br>跨度：${formatMillimeter(getArcSpan(shape))}<br>弓高：${formatMillimeter(getArcBulge(shape))}`;
      } else if (shape.type === "polar-profile") {
        selectionMeta.innerHTML = `凸轮曲线<br>中心：${formatCoordinate(shape.center)}<br>控制点：${(shape.points || []).length} 个`;
      }
      labelInput.value = "";
      labelInput.disabled = true;
      if (shapeLineTypeSelect) {
        shapeLineTypeSelect.disabled = false;
        shapeLineTypeSelect.value = getShapeLineType(shape);
      }
      resetLabelBtn.disabled = true;
      return;
    }

    if (isLineShape(shape)) {
      lineField.hidden = false;
      lineLengthRange.value = `${Math.round(toMillimeters(getLineMetrics(shape).length))}`;
      lineLengthInput.value = `${Math.round(toMillimeters(getLineMetrics(shape).length))}`;
      lineAngleRange.value = `${Math.round(getLineAngleDegrees(shape))}`;
      lineAngleInput.value = `${Math.round(getLineAngleDegrees(shape))}`;
      positionLinePanel(shape);
      const metrics = getLineMetrics(shape);
      selectionMeta.innerHTML = `直线<br>长度：${formatMillimeter(metrics.length)}<br>角度：${formatNumber(getLineAngleDegrees(shape))}°`;
    } else if (shape.type === "rect") {
      rectField.hidden = false;
      rectWidthRange.value = `${Math.round(toMillimeters(shape.width))}`;
      rectWidthInput.value = `${Math.round(toMillimeters(shape.width))}`;
      rectHeightRange.value = `${Math.round(toMillimeters(shape.height))}`;
      rectHeightInput.value = `${Math.round(toMillimeters(shape.height))}`;
      positionRectPanel(shape);
      selectionMeta.innerHTML = `矩形<br>长：${formatMillimeter(shape.width)}<br>宽：${formatMillimeter(shape.height)}`;
    } else if (shape.type === "roundrect") {
      const radii = getRoundRectRadii(shape);
      roundRadiusField.hidden = false;
      roundRectWidthRange.value = `${Math.round(toMillimeters(shape.width))}`;
      roundRectWidthInput.value = `${Math.round(toMillimeters(shape.width))}`;
      roundRectHeightRange.value = `${Math.round(toMillimeters(shape.height))}`;
      roundRectHeightInput.value = `${Math.round(toMillimeters(shape.height))}`;
      roundRadiusTlInput.value = `${Math.round(toMillimeters(radii.tl))}`;
      roundRadiusTlNumber.value = `${Math.round(toMillimeters(radii.tl))}`;
      roundRadiusTrInput.value = `${Math.round(toMillimeters(radii.tr))}`;
      roundRadiusTrNumber.value = `${Math.round(toMillimeters(radii.tr))}`;
      roundRadiusBrInput.value = `${Math.round(toMillimeters(radii.br))}`;
      roundRadiusBrNumber.value = `${Math.round(toMillimeters(radii.br))}`;
      roundRadiusBlInput.value = `${Math.round(toMillimeters(radii.bl))}`;
      roundRadiusBlNumber.value = `${Math.round(toMillimeters(radii.bl))}`;
      positionFloatingRadiusPanel(shape);
      selectionMeta.innerHTML = `圆角矩形<br>长：${formatMillimeter(shape.width)}<br>宽：${formatMillimeter(shape.height)}<br>左上/右上/右下/左下：${formatMillimeter(radii.tl)} / ${formatMillimeter(radii.tr)} / ${formatMillimeter(radii.br)} / ${formatMillimeter(radii.bl)}`;
    } else if (shape.type === "circle") {
      circleField.hidden = false;
      circleRadiusRange.value = `${Math.round(toMillimeters(shape.r))}`;
      circleRadiusInput.value = `${Math.round(toMillimeters(shape.r))}`;
      positionCirclePanel(shape);
      selectionMeta.innerHTML = `圆<br>半径：${formatMillimeter(shape.r)}<br>直径：${formatMillimeter(shape.r * 2)}`;
    } else if (shape.type === "semicircle") {
      semicircleField.hidden = false;
      semicircleRadiusInput.value = `${Math.round(toMillimeters(getSemicircleRadius(shape)))}`;
      semicircleRadiusNumber.value = `${Math.round(toMillimeters(getSemicircleRadius(shape)))}`;
      semicircleRadiusValue.textContent = `${formatNumber(toMillimeters(getSemicircleRadius(shape)))}`;
      positionSemicirclePanel(shape);
      selectionMeta.innerHTML = `半圆弧<br>半径：${formatMillimeter(getSemicircleRadius(shape))}<br>直径：${formatMillimeter(getSemicircleRadius(shape) * 2)}`;
    } else if (shape.type === "arc") {
      arcField.hidden = false;
      arcSpanInput.value = `${Math.round(toMillimeters(getArcSpan(shape)))}`;
      arcSpanNumber.value = `${Math.round(toMillimeters(getArcSpan(shape)))}`;
      arcSpanValue.textContent = `${formatNumber(toMillimeters(getArcSpan(shape)))}`;
      arcBulgeInput.value = `${Math.round(toMillimeters(getArcBulge(shape)))}`;
      arcBulgeNumber.value = `${Math.round(toMillimeters(getArcBulge(shape)))}`;
      arcBulgeValue.textContent = `${formatNumber(toMillimeters(getArcBulge(shape)))}`;
      positionArcPanel(shape);
      selectionMeta.innerHTML = `圆弧<br>跨度：${formatMillimeter(getArcSpan(shape))}<br>弓高：${formatMillimeter(getArcBulge(shape))}`;
    } else if (shape.type === "polar-profile") {
      selectionMeta.innerHTML = `凸轮曲线<br>中心：${formatCoordinate(shape.center)}<br>控制点：${(shape.points || []).length} 个`;
    }

    labelInput.value = "";
    labelInput.disabled = true;
    if (shapeLineTypeSelect) {
      shapeLineTypeSelect.disabled = false;
      shapeLineTypeSelect.value = getShapeLineType(shape);
    }
    resetLabelBtn.disabled = true;
    return;
  }

  const annotation = getAnnotation(state.selected.id);
  if (!annotation) {
    setSelection(null, null);
    renderInspector();
    return;
  }

  if (annotation.type === "manual-dimension-line") {
    selectionMeta.innerHTML = "手动尺寸线<br>可拖动调整位置，删除键可移除。";
    labelInput.value = "";
    labelInput.disabled = true;
    if (shapeLineTypeSelect) {
      shapeLineTypeSelect.value = "solid";
      shapeLineTypeSelect.disabled = true;
    }
    resetLabelBtn.disabled = true;
    return;
  }

  if (annotation.type === "manual-extension-line") {
    selectionMeta.innerHTML = "细实线<br>可拖动调整位置，删除键可移除。";
    labelInput.value = "";
    labelInput.disabled = true;
    if (shapeLineTypeSelect) {
      shapeLineTypeSelect.value = "solid";
      shapeLineTypeSelect.disabled = true;
    }
    resetLabelBtn.disabled = true;
    return;
  }

  if (annotation.type === "manual-text") {
    selectionMeta.innerHTML = "尺寸数字<br>可拖动调整位置，左侧输入框可修改数字。";
    labelInput.disabled = false;
    labelInput.value = annotation.text || "";
    labelInput.placeholder = "输入尺寸数字";
    if (shapeLineTypeSelect) {
      shapeLineTypeSelect.value = "solid";
      shapeLineTypeSelect.disabled = true;
    }
    resetLabelBtn.disabled = true;
    return;
  }

  if (annotation.type === "manual-dimension-line-labeled") {
    selectionMeta.innerHTML = "带字尺寸线<br>可拖动尺寸线，也可拖动中间数字位置。";
    labelInput.disabled = false;
    labelInput.value = annotation.text || "";
    labelInput.placeholder = getManualDimensionLineLabel(annotation);
    if (shapeLineTypeSelect) {
      shapeLineTypeSelect.value = "solid";
      shapeLineTypeSelect.disabled = true;
    }
    resetLabelBtn.disabled = true;
    return;
  }

  const typeMapCn = {
    length: "长度标注",
    diameter: "直径标注",
    radius: "半径标注",
    angle: "角度标注",
    "arc-chord": "圆弧弦长标注",
    "arc-length": "圆弧弧长标注",
    "polar-coordinate": "极坐标标注",
  };
  selectionMeta.innerHTML = `${typeMapCn[annotation.type]}<br>自动数字：${escapeText(defaultAnnotationLabel(annotation))}<br>当前显示：${escapeText(annotationLabel(annotation))}`;
  labelInput.disabled = false;
  labelInput.value =
    annotation.type === "polar-coordinate"
      ? `${annotation.customRadiusLabel || ""}${annotation.customRadiusLabel || annotation.customAngleLabel ? "\n" : ""}${annotation.customAngleLabel || ""}`
      : annotation.customLabel || "";
  labelInput.placeholder =
    annotation.type === "polar-coordinate"
      ? `第一行半径文字\n第二行角度文字`
      : defaultAnnotationLabel(annotation);
  if (shapeLineTypeSelect) {
    shapeLineTypeSelect.value = "solid";
    shapeLineTypeSelect.disabled = true;
  }
  resetLabelBtn.disabled = !annotation.customLabel;
}

function render() {
  removeOrphanAnnotations();
  syncGridVisibility();
  syncFullscreenButton();
  renderBackground();
  renderGuides();

  shapeLayer.innerHTML = buildShapeLayerMarkup(state.shapes, (shape) => {
    if (isLineShape(shape)) {
      return renderLineShape(shape);
    }
    if (shape.type === "rect") {
      return renderRectLikeShape(shape, false);
    }
    if (shape.type === "roundrect") {
      return renderRectLikeShape(shape, true);
    }
    if (shape.type === "circle") {
      return renderCircleShape(shape);
    }
    if (shape.type === "polar-profile") {
      return renderPolarProfileShape(shape);
    }
    return renderArcShape(shape);
  });

  annotationLayer.innerHTML = buildAnnotationLayerMarkup(state.annotations, (annotation) => {
    if (annotation.type === "manual-dimension-line") {
      return renderManualDimensionLine(annotation);
    }
    if (annotation.type === "manual-dimension-line-labeled") {
      return renderManualDimensionLineLabeled(annotation);
    }
    if (annotation.type === "manual-extension-line") {
      return renderManualExtensionLine(annotation);
    }
    if (annotation.type === "manual-single-arrow") {
      return renderManualSingleArrow(annotation);
    }
    if (annotation.type === "manual-text") {
      return renderManualText(annotation);
    }
    const shape = getShape(annotation.shapeId);
    if (!shape) {
      return "";
    }
    if (annotation.type === "length" && (isLineShape(shape) || shape.type === "rect" || shape.type === "roundrect")) {
      const reference = getLengthReference(shape, annotation.segment);
      return reference ? renderLengthAnnotation(annotation, reference) : "";
    }
    if (annotation.type === "diameter" && shape.type === "circle") {
      return renderDiameterAnnotation(annotation, shape);
    }
    if (annotation.type === "radius" && shape.type === "circle") {
      return renderRadiusAnnotation(annotation, shape);
    }
    if (annotation.type === "radius" && (shape.type === "semicircle" || shape.type === "arc" || shape.type === "roundrect")) {
      return renderGenericRadiusAnnotation(annotation, shape);
    }
    if (annotation.type === "angle" && shape.type === "arc") {
      return renderAngleAnnotation(annotation, shape);
    }
    if ((annotation.type === "arc-chord" || annotation.type === "arc-length") && shape.type === "arc") {
      return renderArcMeasureAnnotation(annotation, shape);
    }
    if (annotation.type === "polar-coordinate" && shape.type === "polar-profile") {
      return renderPolarCoordinateAnnotation(annotation, shape);
    }
    return "";
  });

  renderDraft();
  renderInspector();
  renderLiveMetrics();
  syncAnnotationControls();
  boardHint.hidden = state.shapes.length > 0 || Boolean(state.background);
  clearImageBtn.disabled = !state.background;
  undoBtn.disabled = state.history.undoStack.length === 0;
  persistAutosave();
}

function syncAnnotationControls() {
  if (!state.selected || state.selected.kind !== "annotation") {
    labelSizeInput.value = `${DEFAULT_LABEL_FONT_SIZE}`;
    labelSizeInput.disabled = true;
    labelDirectionSelect.value = "auto";
    labelDirectionSelect.disabled = true;
    if (labelRotationInput) {
      labelRotationInput.value = "0";
      labelRotationInput.disabled = true;
    }
    return;
  }

  const annotation = getAnnotation(state.selected.id);
  if (!annotation) {
    labelSizeInput.value = `${DEFAULT_LABEL_FONT_SIZE}`;
    labelSizeInput.disabled = true;
    labelDirectionSelect.value = "auto";
    labelDirectionSelect.disabled = true;
    if (labelRotationInput) {
      labelRotationInput.value = "0";
      labelRotationInput.disabled = true;
    }
    return;
  }

  const supportsTextStyle =
    annotation.type === "length" ||
    annotation.type === "diameter" ||
    annotation.type === "radius" ||
    annotation.type === "angle" ||
    annotation.type === "arc-chord" ||
    annotation.type === "arc-length" ||
    annotation.type === "polar-coordinate" ||
    annotation.type === "manual-text" ||
    annotation.type === "manual-dimension-line-labeled";

  labelSizeInput.value = `${getAnnotationFontSize(annotation)}`;
  labelSizeInput.disabled = !supportsTextStyle;
  labelDirectionSelect.value = getAnnotationTextDirection(annotation);
  labelDirectionSelect.disabled = !supportsTextStyle;
  if (labelRotationInput) {
    labelRotationInput.value = `${getAnnotationTextRotationOffset(annotation)}`;
    labelRotationInput.disabled = !supportsTextStyle;
  }
}

function startBoxDrawing(kind, point) {
  startBoxDrawingFlow(
    {
      snapPoint,
      setSelection,
      hideFloatingPanels,
      state,
      buildArcShape,
      renderGuides,
      renderLiveMetrics,
      getCurrentLineType,
      canShapeUseLineType,
    },
    kind,
    point,
  );
}

function startDrawingLine(point) {
  startLineDrawingFlow(
    { snapPoint, setSelection, hideFloatingPanels, state, renderGuides, renderLiveMetrics, getCurrentLineType, canShapeUseLineType },
    point,
  );
}

function startDrawingHiddenLine(point) {
  startHiddenLineDrawingFlow({ snapPoint, setSelection, hideFloatingPanels, state, renderGuides, renderLiveMetrics }, point);
}

function updateSelectionBox(point) {
  selectionBox = updateSelectionBoxFlow(selectionBox, point, renderGuides);
}

function getSelectionBoxBounds() {
  return getSelectionBoxBoundsFlow(selectionBox);
}

function getShapeSelectionBounds(shape) {
  return getShapeSelectionBoundsFlow(shape, isLineShape, getRectMetrics);
}

function finishSelectionBox() {
  selectionBox = finishSelectionBoxFlow({ state, isLineShape, getRectMetrics, setSelection, selectionMeta, render }, selectionBox);
}

function startDrawingLineVariant(type, point) {
  startLineVariantDrawingFlow(
    { snapPoint, setSelection, hideFloatingPanels, state, renderGuides, renderLiveMetrics },
    type,
    point,
  );
}

function startDrawingCircle(point) {
  startCircleDrawingFlow(
    { snapPoint, setSelection, hideFloatingPanels, state, renderGuides, renderLiveMetrics, getCurrentLineType },
    point,
  );
}

function startManualLineDrawing(type, point) {
  startManualLineDrawingFlow(
    { snapPoint, setSelection, hideFloatingPanels, state, renderGuides, renderLiveMetrics },
    type,
    point,
  );
}

function placeManualText(point) {
  placeManualTextFlow({ snapPoint, pushHistory, createManualText, state, setSelection, render, setStatus }, point);
}

function beginShapeMove(shape, point) {
  beginShapeMoveFlow({ pushHistory, state, clone, exitShapeParameterEdit, setSelection }, shape, point);
}

function beginSelectionMove(shapeIds, point) {
  beginSelectionMoveFlow({ pushHistory, state, clone, getShape, exitShapeParameterEdit, setSelection }, shapeIds, point);
}

function beginSelectionBox(point) {
  selectionBox = beginSelectionBoxFlow(state, point, setSelection, exitShapeParameterEdit);
}

function scheduleShapeLongPress(shapeId, pointerType) {
  if (pointerType !== "touch" && pointerType !== "pen") {
    return;
  }
  clearLongPressTimer();
  longPressTimer = setTimeout(() => {
    const interaction = state.interaction;
    if (interaction?.type !== "move-shape" || interaction.shapeId !== shapeId || interaction.hasMoved) {
      return;
    }
    state.history.undoStack.pop();
    state.interaction = null;
    setSelection("shape", shapeId);
    enterShapeParameterEdit(shapeId);
    render();
    setStatus("已打开参数面板。");
  }, LONG_PRESS_DELAY);
}

function beginAnnotationMove(annotation, point, target = null) {
  beginAnnotationMoveFlow({ pushHistory, getAnnotationDragDetails, state, clone, setSelection }, annotation, point, target);
}

function createAnnotationFromTool(shape, point) {
  createAnnotationFromToolFlow(
    {
      state,
      isLineShape,
      setStatus,
      pushHistory,
      getNearestRectSegment,
      createLengthAnnotation,
      clampMagnitude,
      setSelection,
      clone,
      render,
      getExistingDiameterAnnotationForCircleGroup,
      createCircleAnnotation,
      createRadiusAnnotation,
      createAngleAnnotation,
      createArcMeasureAnnotation,
      createPolarCoordinateAnnotation,
      createAnnotationFromToolPatched,
    },
    shape,
    point,
  );
}

function isShapeSupportedForAutoAnnotation(shape, tool = state.tool) {
  if (!shape) {
    return false;
  }
  if (tool === "length") {
    return isLineShape(shape) || shape.type === "rect" || shape.type === "roundrect";
  }
  if (tool === "diameter") {
    return shape.type === "circle";
  }
  if (tool === "radius") {
    return shape.type === "circle" || shape.type === "semicircle" || shape.type === "arc" || shape.type === "roundrect";
  }
  if (tool === "angle") {
    return shape.type === "arc";
  }
  if (tool === "arc-chord" || tool === "arc-length") {
    return shape.type === "arc";
  }
  if (tool === "polar-coordinate") {
    return shape.type === "polar-profile";
  }
  return false;
}

function getArcLikeHitDistance(shape, point) {
  const geometry = getArcGeometry(shape);
  const startAngle = Math.atan2(geometry.start.y - geometry.center.y, geometry.start.x - geometry.center.x);
  const spanRad = Math.max(0, Math.min(Math.PI * 2, Number(geometry.spanRad) || 0));
  const steps = Math.max(16, Math.ceil((spanRad / Math.PI) * 48));
  let minDistance = Infinity;
  let previous = geometry.start;
  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps;
    const angle = geometry.sweepFlag ? startAngle + spanRad * progress : startAngle - spanRad * progress;
    const current = {
      x: geometry.center.x + Math.cos(angle) * geometry.radius,
      y: geometry.center.y + Math.sin(angle) * geometry.radius,
    };
    minDistance = Math.min(minDistance, pointToSegmentDistance(point, previous, current));
    previous = current;
  }
  return minDistance;
}

function getShapeAutoHitDistance(shape, point, tool = state.tool) {
  if (!isShapeSupportedForAutoAnnotation(shape, tool)) {
    return Infinity;
  }
  if (isLineShape(shape)) {
    const line = getLineLikeShape(shape);
    return pointToSegmentDistance(point, { x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 });
  }
  if (shape.type === "rect" || shape.type === "roundrect") {
    const { left, top, right, bottom } = getRectMetrics(shape);
    if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) {
      return 0;
    }
    const dx = Math.max(left - point.x, 0, point.x - right);
    const dy = Math.max(top - point.y, 0, point.y - bottom);
    return Math.hypot(dx, dy);
  }
  if (shape.type === "circle") {
    const radialDistance = distance(point, { x: shape.cx, y: shape.cy });
    return radialDistance <= shape.r ? 0 : radialDistance - shape.r;
  }
  if (shape.type === "semicircle" || shape.type === "arc") {
    return getArcLikeHitDistance(shape, point);
  }
  if (shape.type === "polar-profile") {
    const points = getPolarProfileCartesianPoints(shape);
    if (!points.length) {
      return distance(point, shape.center);
    }
    return points.reduce((minDistance, profilePoint, index) => {
      const nextPoint = points[(index + 1) % points.length];
      return Math.min(minDistance, pointToSegmentDistance(point, profilePoint, nextPoint));
    }, Infinity);
  }
  return Infinity;
}

function findAutoAnnotationShapeAtPoint(point, entity = null) {
  if (entity?.dataset.kind === "shape") {
    const shape = getShape(entity.dataset.id);
    if (isShapeSupportedForAutoAnnotation(shape)) {
      return shape;
    }
  }
  if (entity?.dataset.kind === "annotation") {
    const annotation = getAnnotation(entity.dataset.id);
    const shape = getShape(annotation?.shapeId);
    if (isShapeSupportedForAutoAnnotation(shape)) {
      return shape;
    }
  }
  const tolerance = state.tool === "angle" || state.tool === "arc-chord" || state.tool === "arc-length" || state.tool === "radius" ? 30 : 22;
  let best = null;
  for (const shape of state.shapes) {
    const hitDistance = getShapeAutoHitDistance(shape, point);
    if (hitDistance <= tolerance && (!best || hitDistance < best.hitDistance)) {
      best = { shape, hitDistance };
    }
  }
  return best?.shape || null;
}

function updateDrawing(point) {
  if (state.interaction?.type === "drawing-polar-profile") {
    updatePolarProfileDraftFlow({ state, snapPoint, distance, renderDraft, renderGuides, renderLiveMetrics }, point);
    return;
  }
  updateDrawingFlow(
    {
      state,
      distance,
      snapPoint,
      renderDraft,
      renderGuides,
      renderLiveMetrics,
      buildArcShape,
      rectFromPoints,
      orthogonalLock,
      getCurrentLineType,
      canShapeUseLineType,
    },
    point,
  );
}

function updateShapeMove(point) {
  updateShapeMoveFlow(
    {
      state,
      distance,
      moveThreshold: MOVE_THRESHOLD,
      clearLongPressTimer,
      clearLastShapeTap: () => {
        lastShapeTap = null;
      },
      getShape,
      sub,
      isLineShape,
      snapCircleToRectEqualMargin,
      snapPoint,
      render,
      renderGuides,
    },
    point,
  );
}

function updateSelectionMove(point) {
  updateSelectionMoveFlow(
    {
      state,
      distance,
      moveThreshold: MOVE_THRESHOLD,
      sub,
      getShape,
      isLineShape,
      render,
    },
    point,
  );
}

function updateAnnotationMove(point) {
  updateAnnotationMoveFlow(
    {
      state,
      distance,
      moveThreshold: MOVE_THRESHOLD,
      getAnnotation,
      getShape,
      getLengthReference,
      getLineMetrics,
      clampMagnitude,
      dot,
      sub,
      render,
      getRadiusAnnotationGeometry,
      getAngleAnnotationGeometry,
      getArcMeasureAnnotationGeometry,
      getPolarCoordinateAnnotationGeometry,
      isArcLikeShape,
      getArcRadiusAnchor,
      getRoundRectCornerInfo,
      dimensionStyle: DIMENSION_STYLE,
      useOutsideDiameter,
      avoidDiameterAxisAngle,
      normalize,
      getOutsideDiameterGeometry,
      snapPoint,
      renderGuides,
    },
    point,
  );
}

function finalizeDrawing() {
  if (state.interaction?.type === "drawing-polar-profile") {
    finalizePolarProfileDraftFlow({ state, pushHistory, uid, setSelection, render, setStatus });
    return;
  }
  finalizeDrawingFlow({
    state,
    distance,
    pushHistory,
    normalizeLine,
    uid,
    setSelection,
    setStatus,
    createManualDimensionLine,
    createManualExtensionLine,
    createManualDimensionLineLabeled,
    getRoundRectRadius,
  });
}

function deleteSelected() {
  deleteSelectedFlow({ state, pushHistory, getSelectedIds, setSelection, exitShapeParameterEdit, render, setStatus });
}

function copySelected() {
  copySelectedFlow({
    state,
    getShape,
    pushHistory,
    offsetShapeForCopy,
    uid,
    getAnnotation,
    offsetAnnotationForCopy,
    setSelection,
    render,
    setStatus,
  });
}

function clearCanvas() {
  clearCanvasFlow({ state, pushHistory, releaseBackgroundObjectUrl, render, setStatus });
}

function downloadFile(name, blob) {
  downloadFileFlow(name, blob);
}

function buildDrawingSnapshot() {
  return buildDrawingSnapshotFlow(state, clone);
}

function exportDrawingFile() {
  exportDrawingFileFlow({ state, clone, setStatus });
}

function applyImportedDrawing(payload) {
  applyImportedDrawingFlow({
    state,
    pushHistory,
    applySnapshot,
    render,
    defaultUnitsPerMm: DEFAULT_UNITS_PER_MM,
  }, payload);
}

function importDrawingFile(file) {
  importDrawingFileFlow({
    applyImportedDrawing,
    setStatus,
  }, file);
}

function createExportSvgMarkup() {
  return createExportSvgMarkupFlow({ svg, boardBounds: BOARD_BOUNDS });
}

function saveBoardAsImage() {
  saveBoardAsImageFlow({
    svg,
    boardBounds: BOARD_BOUNDS,
    exportImageScale: EXPORT_IMAGE_SCALE,
    downloadFile,
    setStatus,
  });
}

function loadDemo() {
  loadDemoFlow({
    releaseBackgroundObjectUrl,
    state,
    uid,
    normalizeLine,
    setSelection,
    render,
    setStatus,
  });
}

async function openBackgroundFile(file) {
  await openBackgroundFileFlow({
    readFileAsDataUrl,
    pushHistory,
    releaseBackgroundObjectUrl,
    state,
    render,
    setStatus,
  }, file);
}

svg.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  svg.focus();
  if (svg.setPointerCapture) {
    svg.setPointerCapture(event.pointerId);
  }
  const point = getSvgPoint(event);
  const entity = event.target.closest("[data-kind]");
  clearLongPressTimer();

  if (state.tool === "draw-cam") {
    lastShapeTap = null;
    if (state.interaction?.type === "drawing-polar-profile") {
      commitPolarProfilePointFlow({ state, snapPoint, distance, render, setStatus, finalizePolarProfileDraft: () => finalizePolarProfileDraftFlow({ state, pushHistory, uid, setSelection, render, setStatus }) }, point);
    } else {
      startPolarProfileDraftFlow({ state, setSelection, hideFloatingPanels, render, setStatus }, point);
    }
    return;
  }

  if (state.interaction?.type?.startsWith("drawing-")) {
    lastShapeTap = null;
    updateDrawing(point);
    finalizeDrawing();
    state.interaction = null;
    state.draft = null;
    state.guides = [];
    render();
    return;
  }

  if (state.tool === "manual-dim-text") {
    lastShapeTap = null;
    placeManualText(point);
    return;
  }
  if (state.tool === "manual-dim-line") {
    lastShapeTap = null;
    startManualLineDrawing("manual-dimension-line", point);
    return;
  }
  if (state.tool === "manual-dim-line-labeled") {
    lastShapeTap = null;
    startManualLineDrawing("manual-dimension-line-labeled", point);
    return;
  }
  if (state.tool === "manual-extension-line") {
    lastShapeTap = null;
    startManualLineDrawing("manual-extension-line", point);
    return;
  }
  if (state.tool === "manual-single-arrow") {
    lastShapeTap = null;
    startManualLineDrawing("manual-single-arrow", point);
    return;
  }

  if (entity) {
    const kind = entity.dataset.kind;
    const id = entity.dataset.id;

    if (state.tool === "draw-symmetry-line" && kind === "shape") {
      const shape = getShape(id);
      if (shape) {
        createSymmetryLineFromShape(shape);
      }
      return;
    }

    if (isAutoAnnotationTool()) {
      const shape = findAutoAnnotationShapeAtPoint(point, entity);
      if (!shape) {
        setStatus("请点击要标注的图形轮廓附近。");
        return;
      }
      createAnnotationFromTool(shape, point);
      return;
    }

    if (isAutoAnnotationTool()) {
      if (kind !== "shape") {
        setStatus("标注工具需要先点选图形本体。");
        return;
      }
      const shape = getShape(id);
      if (shape) {
        createAnnotationFromTool(shape, point);
      }
      return;
    }

    if (state.tool === "select" && kind === "shape") {
      const shape = getShape(id);
      if (shape) {
        const selectedShapeIds = getSelectedIds("shape");
        if (selectedShapeIds.length > 1 && selectedShapeIds.includes(shape.id)) {
          beginSelectionMove(selectedShapeIds, point);
          return;
        }
        beginShapeMove(shape, point);
        scheduleShapeLongPress(shape.id, event.pointerType);
      }
      return;
    }

    const annotation = state.tool === "select" ? getAnnotation(id) : null;
    if (annotation) {
      beginAnnotationMove(annotation, point, event.target);
      return;
    }
  }

  if (isAutoAnnotationTool()) {
    const shape = findAutoAnnotationShapeAtPoint(point);
    if (!shape) {
      setStatus("请点击要标注的图形轮廓附近。");
      return;
    }
    createAnnotationFromTool(shape, point);
    return;
  }

  if (state.tool === "draw-line") {
    lastShapeTap = null;
    startDrawingLine(point);
    return;
  }
  if (state.tool === "draw-hidden-line") {
    lastShapeTap = null;
    startDrawingHiddenLine(point);
    return;
  }
  if (state.tool === "draw-symmetry-line") {
    lastShapeTap = null;
    startDrawingLineVariant("symmetry-line", point);
    return;
  }
  if (state.tool === "draw-chain-line") {
    lastShapeTap = null;
    startDrawingLineVariant("chain-line", point);
    return;
  }
  if (state.tool === "draw-rect") {
    lastShapeTap = null;
    startBoxDrawing("rect", point);
    return;
  }
  if (state.tool === "draw-roundrect") {
    lastShapeTap = null;
    startBoxDrawing("roundrect", point);
    return;
  }
  if (state.tool === "draw-semicircle") {
    lastShapeTap = null;
    startBoxDrawing("semicircle", point);
    return;
  }
  if (state.tool === "draw-arc") {
    lastShapeTap = null;
    startBoxDrawing("arc", point);
    return;
  }
  if (state.tool === "draw-circle") {
    lastShapeTap = null;
    startDrawingCircle(point);
    return;
  }

  if (state.tool === "select") {
    lastShapeTap = null;
    beginSelectionBox(point);
    renderGuides();
    return;
  }

  setStatus("请先点击对应图元生成自动标注，或切换手动标注工具在空白处绘制。");
});

svg.addEventListener("dblclick", (event) => {
  if (state.tool === "draw-cam" && state.interaction?.type === "drawing-polar-profile") {
    event.preventDefault();
    finalizeDrawing();
    return;
  }
  const entity = event.target.closest("[data-kind]");
  if (!entity || entity.dataset.kind !== "shape") {
    return;
  }
  const shape = getShape(entity.dataset.id);
  if (!shape) {
    return;
  }
  openShapeParameterPanel(shape.id);
});

svg.addEventListener("click", (event) => {
  if (event.detail < 2) {
    return;
  }
  const entity = event.target.closest("[data-kind]");
  if (!entity || entity.dataset.kind !== "shape") {
    return;
  }
  const shape = getShape(entity.dataset.id);
  if (!shape) {
    return;
  }
  openShapeParameterPanel(shape.id);
});

svg.addEventListener("pointermove", (event) => {
  if (!state.interaction) {
    return;
  }
  const point = getSvgPoint(event);
  if (state.interaction.type.startsWith("drawing-")) {
    updateDrawing(point);
    return;
  }
  if (state.interaction.type === "selection-box") {
    state.interaction.hasMoved = distance(point, state.interaction.startPointer) >= MOVE_THRESHOLD;
    updateSelectionBox(point);
    return;
  }
  if (state.interaction.type === "move-shape") {
    updateShapeMove(point);
    return;
  }
  if (state.interaction.type === "move-shape-group") {
    updateSelectionMove(point);
    return;
  }
  if (state.interaction.type === "move-annotation") {
    updateAnnotationMove(point);
  }
});

function finishPointer(event) {
  clearLongPressTimer();
  if (svg.releasePointerCapture) {
    try {
      svg.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }
  if (state.interaction?.type === "drawing-polar-profile") {
    return;
  }
  if (state.interaction?.type?.startsWith("drawing-") && !state.interaction.hasDragged) {
    state.interaction = null;
    state.draft = null;
    state.guides = [];
    render();
    return;
  }
  if (state.interaction?.type === "selection-box") {
    const hasMoved = state.interaction.hasMoved;
    state.interaction = null;
    state.guides = [];
    if (!hasMoved) {
      selectionBox = null;
      setSelection(null, null);
      render();
      return;
    }
    finishSelectionBox();
    return;
  }
  if ((state.interaction?.type === "move-shape" || state.interaction?.type === "move-annotation") && !state.interaction.hasMoved) {
    const tapInteraction = state.interaction;
    state.history.undoStack.pop();
    state.interaction = null;
    if (tapInteraction.type === "move-shape") {
      finishShapeTap(tapInteraction.shapeId, tapInteraction.startPointer);
      return;
    }
    render();
    return;
  }
  if (state.interaction?.type === "move-shape" || state.interaction?.type === "move-annotation") {
    state.interaction = null;
    render();
    return;
  }
  if (state.interaction?.type === "move-shape-group") {
    if (!state.interaction.hasMoved) {
      state.history.undoStack.pop();
    }
    state.interaction = null;
    render();
    return;
  }
  finalizeDrawing();
  state.interaction = null;
  state.draft = null;
  state.guides = [];
  render();
}

svg.addEventListener("pointerup", finishPointer);
svg.addEventListener("pointercancel", finishPointer);

toolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setTool(button.dataset.tool);
  });
});

orthoToggle.addEventListener("change", () => {
  state.ortho = orthoToggle.checked;
  setStatus(state.ortho ? "已开启正交锁定。" : "已关闭正交锁定。");
});

scaleRatioInput?.addEventListener("change", () => {
  state.unitsPerMm = Math.max(1, Number(scaleRatioInput.value) || DEFAULT_UNITS_PER_MM);
  if (scaleRatioInput) {
    scaleRatioInput.value = `${Math.round(state.unitsPerMm)}`;
  }
  render();
  setStatus(`已设置比例尺：1 mm = ${Math.round(state.unitsPerMm)} 画布单位。`);
});

labelInput.addEventListener("change", () => {
  if (!state.selected || state.selected.kind !== "annotation") {
    return;
  }
  const annotation = getAnnotation(state.selected.id);
  if (!annotation) {
    return;
  }
  pushHistory();
  if (annotation.type === "manual-text") {
    annotation.text = labelInput.value.trim() || "100";
    render();
    setStatus("已更新手动尺寸数字。");
    return;
  }
  if (annotation.type === "manual-dimension-line-labeled") {
    annotation.text = labelInput.value.trim();
    render();
    setStatus("已更新带字尺寸线数字。");
    return;
  }
  if (annotation.type === "polar-coordinate") {
    const [radiusLine = "", angleLine = ""] = String(labelInput.value || "").split(/\r?\n/);
    annotation.customRadiusLabel = radiusLine.trim();
    annotation.customAngleLabel = angleLine.trim();
    render();
    setStatus(annotation.customRadiusLabel || annotation.customAngleLabel ? "已更新极坐标标注文字。" : "已恢复自动极坐标数字。");
    return;
  }
  annotation.customLabel = labelInput.value.trim();
  render();
  setStatus(annotation.customLabel ? "已改为自定义数字。" : "已恢复自动数字。");
});

resetLabelBtn.addEventListener("click", () => {
  if (!state.selected || state.selected.kind !== "annotation") {
    return;
  }
  const annotation = getAnnotation(state.selected.id);
  if (!annotation) {
    return;
  }
  pushHistory();
  if (annotation.type === "polar-coordinate") {
    annotation.customRadiusLabel = "";
    annotation.customAngleLabel = "";
    render();
    setStatus("已恢复自动极坐标数字。");
    return;
  }
  annotation.customLabel = "";
  render();
  setStatus("已恢复自动数字。");
});

labelSizeInput.addEventListener("change", () => {
  if (!state.selected || state.selected.kind !== "annotation") {
    return;
  }
  const annotation = getAnnotation(state.selected.id);
  if (!annotation) {
    return;
  }
  if (
    annotation.type !== "length" &&
    annotation.type !== "diameter" &&
    annotation.type !== "radius" &&
    annotation.type !== "angle" &&
    annotation.type !== "arc-chord" &&
    annotation.type !== "arc-length" &&
    annotation.type !== "polar-coordinate" &&
    annotation.type !== "manual-text" &&
    annotation.type !== "manual-dimension-line-labeled"
  ) {
    return;
  }
  pushHistory();
  annotation.fontSize = Math.max(10, Math.min(72, Number(labelSizeInput.value) || DEFAULT_LABEL_FONT_SIZE));
  render();
  setStatus("已更新尺寸数字字号。");
});

labelDirectionSelect.addEventListener("change", () => {
  if (!state.selected || state.selected.kind !== "annotation") {
    return;
  }
  const annotation = getAnnotation(state.selected.id);
  if (!annotation) {
    return;
  }
  if (
    annotation.type !== "length" &&
    annotation.type !== "diameter" &&
    annotation.type !== "radius" &&
    annotation.type !== "angle" &&
    annotation.type !== "arc-chord" &&
    annotation.type !== "arc-length" &&
    annotation.type !== "polar-coordinate" &&
    annotation.type !== "manual-text" &&
    annotation.type !== "manual-dimension-line-labeled"
  ) {
    return;
  }
  pushHistory();
  annotation.textDirection = ["left", "up"].includes(labelDirectionSelect.value) ? labelDirectionSelect.value : "auto";
  render();
  setStatus(
    annotation.textDirection === "left"
      ? "已设置字头朝左。"
      : annotation.textDirection === "up"
        ? "已设置字头朝上。"
        : "已恢复自动字向。"
  );
});

labelRotationInput?.addEventListener("change", () => {
  if (!state.selected || state.selected.kind !== "annotation") {
    labelRotationInput.value = "0";
    labelRotationInput.disabled = true;
    return;
  }
  const annotation = getAnnotation(state.selected.id);
  if (!annotation) {
    labelRotationInput.value = "0";
    labelRotationInput.disabled = true;
    return;
  }
  if (
    annotation.type !== "length" &&
    annotation.type !== "diameter" &&
    annotation.type !== "radius" &&
    annotation.type !== "angle" &&
    annotation.type !== "arc-chord" &&
    annotation.type !== "arc-length" &&
    annotation.type !== "polar-coordinate" &&
    annotation.type !== "manual-text" &&
    annotation.type !== "manual-dimension-line-labeled"
  ) {
    return;
  }
  pushHistory();
  annotation.textRotationOffset = normalizeRotationOffset(labelRotationInput.value);
  labelRotationInput.value = `${annotation.textRotationOffset}`;
  render();
  setStatus(`已设置数字旋转角度：${annotation.textRotationOffset}°`);
});

shapeLineTypeSelect?.addEventListener("change", () => {
  const nextType = shapeLineTypeSelect.value === "hidden" ? "hidden" : "solid";
  if (state.draft && canShapeUseLineType(state.draft)) {
    setCurrentLineType(nextType);
    state.draft.lineType = nextType;
    renderDraft();
    renderLiveMetrics();
    setStatus(nextType === "hidden" ? "当前绘制线型：细虚线。" : "当前绘制线型：轮廓实线。");
    return;
  }
  if (!state.selected) {
    setCurrentLineType(nextType);
    renderInspector();
    setStatus(nextType === "hidden" ? "默认线型已设为细虚线，之后绘制的轮廓将作为不可见轮廓线。" : "默认线型已设为轮廓实线。");
    return;
  }
  if (state.selected.kind !== "shape") {
    shapeLineTypeSelect.value = getCurrentLineType();
    shapeLineTypeSelect.disabled = true;
    return;
  }
  const shape = getShape(state.selected.id);
  if (!shape) {
    render();
    return;
  }
  if (!canShapeUseLineType(shape)) {
    shapeLineTypeSelect.value = "solid";
    shapeLineTypeSelect.disabled = true;
    return;
  }
  if (getShapeLineType(shape) === nextType) {
    return;
  }
  pushHistory();
  shape.lineType = nextType;
  render();
  setStatus(nextType === "hidden" ? "已切换为细虚线。适合表示不可见轮廓线。" : "已恢复为轮廓实线。");
});

function mirrorInputs(source, target) {
  target.value = source.value;
}

function isCompleteNumberInput(input) {
  return input.value !== "" && input.value !== "-" && !Number.isNaN(Number(input.value));
}

function bindRangeAndNumber(range, input, onChange) {
  range.addEventListener("input", () => {
    mirrorInputs(range, input);
    onChange(range.value);
  });
  input.addEventListener("input", () => {
    if (isCompleteNumberInput(input)) {
      range.value = input.value;
    }
  });
  input.addEventListener("change", () => {
    if (!isCompleteNumberInput(input)) {
      input.value = range.value;
      return;
    }
    range.value = input.value;
    onChange(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    input.blur();
  });
}

function updateSelectedLine(length, angle) {
  if (!state.selected || state.selected.kind !== "shape") return;
  const shape = getShape(state.selected.id);
  if (!shape || !isLineShape(shape)) return;
  setLineFromLengthAngle(shape, toCanvasUnits(length), angle);
  render();
}

const originalFinalizeDrawing = finalizeDrawing;
finalizeDrawing = function patchedFinalizeDrawing() {
  if (
    state.interaction &&
    state.draft &&
    state.interaction.type === "drawing-manual-dimension-line-labeled"
  ) {
    const start = { x: state.draft.x1, y: state.draft.y1 };
    const end = { x: state.draft.x2, y: state.draft.y2 };
    if (distance(start, end) >= 8) {
      pushHistory();
      const annotation = createManualDimensionLineLabeled(state.draft);
      state.annotations.push(annotation);
      setSelection("annotation", annotation.id);
      setStatus("已创建带字尺寸线。");
    } else {
      setStatus("拖动距离太短，没有创建手动标注线。");
    }
    state.draft = null;
    state.guides = [];
    return;
  }

  originalFinalizeDrawing();
};

function updateSelectedRectSize(width, height) {
  if (!state.selected || state.selected.kind !== "shape") return;
  const shape = getShape(state.selected.id);
  if (!shape || shape.type !== "rect") return;
  setRectSize(shape, toCanvasUnits(width), toCanvasUnits(height));
  render();
}

function updateSelectedRoundRectSize(width, height) {
  if (!state.selected || state.selected.kind !== "shape") return;
  const shape = getShape(state.selected.id);
  if (!shape || shape.type !== "roundrect") return;
  setRoundRectSize(shape, toCanvasUnits(width), toCanvasUnits(height));
  render();
}

function updateSelectedCircleRadius(radius) {
  if (!state.selected || state.selected.kind !== "shape") return;
  const shape = getShape(state.selected.id);
  if (!shape || shape.type !== "circle") return;
  setCircleRadius(shape, toCanvasUnits(radius));
  render();
}

function updateSelectedRoundRectCorner(corner, value) {
  if (!state.selected || state.selected.kind !== "shape") return;
  const shape = getShape(state.selected.id);
  if (!shape || shape.type !== "roundrect") return;
  setRoundRectRadii(shape, { [corner]: toCanvasUnits(value) });
  render();
}

bindRangeAndNumber(lineLengthRange, lineLengthInput, (value) => updateSelectedLine(value, lineAngleInput.value));
bindRangeAndNumber(lineAngleRange, lineAngleInput, (value) => updateSelectedLine(lineLengthInput.value, value));
bindRangeAndNumber(rectWidthRange, rectWidthInput, (value) => updateSelectedRectSize(value, rectHeightInput.value));
bindRangeAndNumber(rectHeightRange, rectHeightInput, (value) => updateSelectedRectSize(rectWidthInput.value, value));
bindRangeAndNumber(roundRectWidthRange, roundRectWidthInput, (value) => updateSelectedRoundRectSize(value, roundRectHeightInput.value));
bindRangeAndNumber(roundRectHeightRange, roundRectHeightInput, (value) => updateSelectedRoundRectSize(roundRectWidthInput.value, value));
bindRangeAndNumber(circleRadiusRange, circleRadiusInput, updateSelectedCircleRadius);
bindRangeAndNumber(roundRadiusTlInput, roundRadiusTlNumber, (value) => updateSelectedRoundRectCorner("tl", value));
bindRangeAndNumber(roundRadiusTrInput, roundRadiusTrNumber, (value) => updateSelectedRoundRectCorner("tr", value));
bindRangeAndNumber(roundRadiusBrInput, roundRadiusBrNumber, (value) => updateSelectedRoundRectCorner("br", value));
bindRangeAndNumber(roundRadiusBlInput, roundRadiusBlNumber, (value) => updateSelectedRoundRectCorner("bl", value));

[lineLengthRange, lineLengthInput, lineAngleRange, lineAngleInput].forEach((input) => {
  input.addEventListener("pointerdown", () => lockFloatingPanel("line"));
  input.addEventListener("focus", () => lockFloatingPanel("line"));
  input.addEventListener("blur", () => unlockFloatingPanel("line"));
});

svg.addEventListener("pointerleave", (event) => {
  if (!state.interaction?.type?.startsWith("drawing-") || state.interaction.hasDragged) {
    return;
  }
  updateDrawing(getSvgPoint(event));
});

[rectWidthRange, rectWidthInput, rectHeightRange, rectHeightInput].forEach((input) => {
  input.addEventListener("pointerdown", () => lockFloatingPanel("rect"));
  input.addEventListener("focus", () => lockFloatingPanel("rect"));
  input.addEventListener("blur", () => unlockFloatingPanel("rect"));
});

[roundRectWidthRange, roundRectWidthInput, roundRectHeightRange, roundRectHeightInput, roundRadiusTlInput, roundRadiusTlNumber, roundRadiusTrInput, roundRadiusTrNumber, roundRadiusBrInput, roundRadiusBrNumber, roundRadiusBlInput, roundRadiusBlNumber].forEach((input) => {
  input.addEventListener("pointerdown", () => lockFloatingPanel("roundrect"));
  input.addEventListener("focus", () => lockFloatingPanel("roundrect"));
  input.addEventListener("blur", () => unlockFloatingPanel("roundrect"));
});

[circleRadiusRange, circleRadiusInput].forEach((input) => {
  input.addEventListener("pointerdown", () => lockFloatingPanel("circle"));
  input.addEventListener("focus", () => lockFloatingPanel("circle"));
  input.addEventListener("blur", () => unlockFloatingPanel("circle"));
});

function updateSelectedSemicircleRadius(radius) {
  if (!state.selected || state.selected.kind !== "shape") {
    return;
  }
  const shape = getShape(state.selected.id);
  if (!shape || shape.type !== "semicircle") {
    return;
  }
  setSemicircleRadius(shape, toCanvasUnits(radius));
  render();
}

function updateSelectedSemicircle(mutator) {
  if (!state.selected || state.selected.kind !== "shape") {
    return;
  }
  const shape = getShape(state.selected.id);
  if (!shape || shape.type !== "semicircle") {
    return;
  }
  mutator(shape);
  render();
}

function updateSelectedArc(mutator) {
  if (!state.selected || state.selected.kind !== "shape") {
    return;
  }
  const shape = getShape(state.selected.id);
  if (!shape || shape.type !== "arc") {
    return;
  }
  mutator(shape);
  render();
}

semicircleRadiusInput.addEventListener("input", () => {
  mirrorInputs(semicircleRadiusInput, semicircleRadiusNumber);
  semicircleRadiusValue.textContent = semicircleRadiusInput.value;
  updateSelectedSemicircleRadius(semicircleRadiusInput.value);
});

semicircleRadiusNumber.addEventListener("input", () => {
  if (isCompleteNumberInput(semicircleRadiusNumber)) {
    mirrorInputs(semicircleRadiusNumber, semicircleRadiusInput);
  }
  semicircleRadiusValue.textContent = semicircleRadiusNumber.value;
});

semicircleRadiusNumber.addEventListener("change", () => {
  if (!isCompleteNumberInput(semicircleRadiusNumber)) {
    semicircleRadiusNumber.value = semicircleRadiusInput.value;
    semicircleRadiusValue.textContent = semicircleRadiusInput.value;
    return;
  }
  mirrorInputs(semicircleRadiusNumber, semicircleRadiusInput);
  semicircleRadiusValue.textContent = semicircleRadiusNumber.value;
  updateSelectedSemicircleRadius(semicircleRadiusNumber.value);
});

[semicircleRadiusInput, semicircleRadiusNumber].forEach((input) => {
  input.addEventListener("pointerdown", () => {
    lockFloatingPanel("semicircle");
  });
  input.addEventListener("focus", () => {
    lockFloatingPanel("semicircle");
  });
  input.addEventListener("blur", () => {
    unlockFloatingPanel("semicircle");
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      input.blur();
    }
  });
});

semicircleFlipBtn.addEventListener("click", () => {
  updateSelectedSemicircle((shape) => {
    flipArcSide(shape);
  });
});

arcSpanInput.addEventListener("input", () => {
  mirrorInputs(arcSpanInput, arcSpanNumber);
  arcSpanValue.textContent = arcSpanInput.value;
  updateSelectedArc((shape) => {
    setArcSpan(shape, toCanvasUnits(arcSpanInput.value));
  });
});

arcSpanNumber.addEventListener("input", () => {
  if (isCompleteNumberInput(arcSpanNumber)) {
    mirrorInputs(arcSpanNumber, arcSpanInput);
  }
  arcSpanValue.textContent = arcSpanNumber.value;
});

arcSpanNumber.addEventListener("change", () => {
  if (!isCompleteNumberInput(arcSpanNumber)) {
    arcSpanNumber.value = arcSpanInput.value;
    arcSpanValue.textContent = arcSpanInput.value;
    return;
  }
  mirrorInputs(arcSpanNumber, arcSpanInput);
  arcSpanValue.textContent = arcSpanNumber.value;
  updateSelectedArc((shape) => {
    setArcSpan(shape, toCanvasUnits(arcSpanNumber.value));
  });
});

arcBulgeInput.addEventListener("input", () => {
  mirrorInputs(arcBulgeInput, arcBulgeNumber);
  arcBulgeValue.textContent = arcBulgeInput.value;
  updateSelectedArc((shape) => {
    setArcBulge(shape, toCanvasUnits(arcBulgeInput.value));
  });
});

arcBulgeNumber.addEventListener("input", () => {
  if (isCompleteNumberInput(arcBulgeNumber)) {
    mirrorInputs(arcBulgeNumber, arcBulgeInput);
  }
  arcBulgeValue.textContent = arcBulgeNumber.value;
});

arcBulgeNumber.addEventListener("change", () => {
  if (!isCompleteNumberInput(arcBulgeNumber)) {
    arcBulgeNumber.value = arcBulgeInput.value;
    arcBulgeValue.textContent = arcBulgeInput.value;
    return;
  }
  mirrorInputs(arcBulgeNumber, arcBulgeInput);
  arcBulgeValue.textContent = arcBulgeNumber.value;
  updateSelectedArc((shape) => {
    setArcBulge(shape, toCanvasUnits(arcBulgeNumber.value));
  });
});

arcFlipBtn.addEventListener("click", () => {
  updateSelectedArc((shape) => {
    flipArcSide(shape);
  });
});

[arcSpanInput, arcSpanNumber, arcBulgeInput, arcBulgeNumber].forEach((input) => {
  input.addEventListener("pointerdown", () => {
    lockFloatingPanel("arc");
  });
  input.addEventListener("focus", () => {
    lockFloatingPanel("arc");
  });
  input.addEventListener("blur", () => {
    unlockFloatingPanel("arc");
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      input.blur();
    }
  });
});

window.addEventListener("pointerup", () => {
  if (state.floatingPanelLock === "line") {
    unlockFloatingPanel("line");
  } else if (state.floatingPanelLock === "rect") {
    unlockFloatingPanel("rect");
  } else if (state.floatingPanelLock === "roundrect") {
    unlockFloatingPanel("roundrect");
  } else if (state.floatingPanelLock === "circle") {
    unlockFloatingPanel("circle");
  } else if (state.floatingPanelLock === "semicircle") {
    unlockFloatingPanel("semicircle");
  } else if (state.floatingPanelLock === "arc") {
    unlockFloatingPanel("arc");
  }
});

window.addEventListener("pointercancel", () => {
  if (state.floatingPanelLock === "line") {
    unlockFloatingPanel("line");
  } else if (state.floatingPanelLock === "rect") {
    unlockFloatingPanel("rect");
  } else if (state.floatingPanelLock === "roundrect") {
    unlockFloatingPanel("roundrect");
  } else if (state.floatingPanelLock === "circle") {
    unlockFloatingPanel("circle");
  } else if (state.floatingPanelLock === "semicircle") {
    unlockFloatingPanel("semicircle");
  } else if (state.floatingPanelLock === "arc") {
    unlockFloatingPanel("arc");
  }
});

openImageBtn.addEventListener("click", () => {
  backgroundInput.click();
});

backgroundInput.addEventListener("change", () => {
  const [file] = backgroundInput.files || [];
  void openBackgroundFile(file);
  backgroundInput.value = "";
});

importDrawingBtn?.addEventListener("click", () => {
  drawingFileInput?.click();
});

drawingFileInput?.addEventListener("change", () => {
  const [file] = drawingFileInput.files || [];
  importDrawingFile(file);
  drawingFileInput.value = "";
});

exportDrawingBtn?.addEventListener("click", () => {
  exportDrawingFile();
});

saveImageBtn?.addEventListener("click", () => {
  saveBoardAsImage();
});

clearImageBtn.addEventListener("click", () => {
  if (!state.background) {
    return;
  }
  pushHistory();
  releaseBackgroundObjectUrl();
  state.background = null;
  render();
  setStatus("已清除底图。");
});

gridToggleBtn.addEventListener("click", toggleGrid);
fullscreenBtn.addEventListener("click", toggleFullscreen);
copyBtn?.addEventListener("click", copySelected);
deleteBtn.addEventListener("click", deleteSelected);
undoBtn.addEventListener("click", undo);
redoBtn?.addEventListener("click", redo);
clearBtn.addEventListener("click", clearCanvas);
demoBtn.addEventListener("click", loadDemo);

document.addEventListener("fullscreenchange", syncFullscreenButton);

if (scaleRatioInput) {
  scaleRatioInput.value = `${DEFAULT_UNITS_PER_MM}`;
}

window.addEventListener("resize", () => {
  if (!state.selected || state.selected.kind !== "shape") {
    return;
  }
  const shape = getShape(state.selected.id);
  if (isLineShape(shape)) {
    positionLinePanel(shape);
  } else if (shape?.type === "rect") {
    positionRectPanel(shape);
  } else if (shape?.type === "roundrect") {
    positionFloatingRadiusPanel(shape);
  } else if (shape?.type === "circle") {
    positionCirclePanel(shape);
  } else if (shape?.type === "semicircle") {
    positionSemicirclePanel(shape);
  } else if (shape?.type === "arc") {
    positionArcPanel(shape);
  }
});

window.addEventListener("keydown", (event) => {
  const activeElement = document.activeElement;
  const isEditingControl =
    activeElement &&
    (activeElement.matches("input, textarea, select, button") || activeElement.isContentEditable);
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
    event.preventDefault();
    redo();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "z") {
    event.preventDefault();
    redo();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undo();
    return;
  }
  if ((event.key === "Delete" || event.key === "Backspace") && !isEditingControl) {
    event.preventDefault();
    deleteSelected();
    return;
  }
  if (state.interaction?.type === "drawing-polar-profile" && !isEditingControl) {
    if (event.key === "Enter") {
      event.preventDefault();
      finalizeDrawing();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      state.interaction = null;
      state.draft = null;
      state.guides = [];
      render();
      setStatus("已取消凸轮绘制。");
      return;
    }
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c" && state.selected && !isEditingControl) {
    event.preventDefault();
    copySelected();
  }
});

if (new URLSearchParams(window.location.search).get("demo") === "1") {
  window.addEventListener(
    "load",
    () => {
      loadDemo();
    },
    { once: true },
  );
}

if (restoreAutosave()) {
  render();
  setStatus("已恢复上次自动保存的图稿。");
}

setTool("select");
