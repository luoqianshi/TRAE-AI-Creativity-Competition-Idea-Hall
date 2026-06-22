export function setToolState({
  state,
  tool,
  hideFloatingPanels,
  isDrawingTool,
  isManualTool,
  toolButtons,
  setStatus,
  toolHints,
  render,
}) {
  state.tool = tool;
  state.interaction = null;
  state.draft = null;
  state.guides = [];
  state.editingShapeId = null;
  hideFloatingPanels();
  if (isDrawingTool(tool) || isManualTool(tool)) {
    state.selected = null;
  }
  toolButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tool === tool);
  });
  setStatus(toolHints[tool] || "");
  render();
}

export function switchToSelectTool({ state, toolButtons }) {
  state.tool = "select";
  state.editingShapeId = null;
  toolButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tool === "select");
  });
}

export function isDrawingToolActive(tool) {
  return tool.startsWith("draw-");
}

export function isManualToolActive(tool) {
  return tool.startsWith("manual-");
}

export function isManualLineToolActive(tool) {
  return (
    tool === "manual-dim-line" ||
    tool === "manual-dim-line-labeled" ||
    tool === "manual-extension-line" ||
    tool === "manual-single-arrow"
  );
}

export function isAutoAnnotationToolActive(tool) {
  return (
    tool === "length" ||
    tool === "diameter" ||
    tool === "radius" ||
    tool === "angle" ||
    tool === "arc-chord" ||
    tool === "arc-length" ||
    tool === "polar-coordinate"
  );
}
