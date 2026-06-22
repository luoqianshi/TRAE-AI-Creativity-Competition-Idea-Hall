export function createSnapshot(state, clone) {
  return {
    background: clone(state.background),
    shapes: clone(state.shapes),
    annotations: clone(state.annotations),
    selected: clone(state.selected),
    nextId: state.nextId,
    unitsPerMm: state.unitsPerMm,
    showGrid: state.showGrid,
    ortho: state.ortho,
  };
}

export function applySnapshot({
  snapshot,
  state,
  clone,
  releaseBackgroundObjectUrl,
  defaultUnitsPerMm,
  scaleRatioInput,
  orthoToggle,
}) {
  if (!snapshot) {
    return;
  }
  releaseBackgroundObjectUrl();
  state.background = clone(snapshot.background) || null;
  state.shapes = clone(snapshot.shapes) || [];
  state.annotations = clone(snapshot.annotations) || [];
  state.selected = clone(snapshot.selected) || null;
  state.nextId = Number(snapshot.nextId) || 1;
  state.unitsPerMm = Math.max(1, Number(snapshot.unitsPerMm) || defaultUnitsPerMm);
  state.showGrid = snapshot.showGrid !== false;
  state.ortho = snapshot.ortho !== false;
  state.editingShapeId = null;
  state.interaction = null;
  state.draft = null;
  state.guides = [];
  state.floatingPanelLock = null;
  if (scaleRatioInput) {
    scaleRatioInput.value = `${Math.round(state.unitsPerMm)}`;
  }
  if (orthoToggle) {
    orthoToggle.checked = state.ortho;
  }
}

export function persistAutosave({ storageKey, snapshot }) {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        snapshot,
      }),
    );
  } catch {
    // Ignore storage failures and keep the editor usable.
  }
}

export function restoreAutosave({ storageKey, onRestore }) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw);
    if (!parsed?.snapshot || !Array.isArray(parsed.snapshot.shapes) || !Array.isArray(parsed.snapshot.annotations)) {
      return false;
    }
    onRestore(parsed.snapshot);
    return true;
  } catch {
    return false;
  }
}

export function pushHistory({ state, snapshot, historyLimit }) {
  state.history.undoStack.push(snapshot);
  state.history.redoStack = [];
  if (state.history.undoStack.length > historyLimit) {
    state.history.undoStack.shift();
  }
}

export function undoHistory({ state, currentSnapshot, applySnapshot }) {
  const snapshot = state.history.undoStack.pop();
  if (!snapshot) {
    return false;
  }
  state.history.redoStack.push(currentSnapshot);
  applySnapshot(snapshot);
  return true;
}

export function redoHistory({ state, currentSnapshot, applySnapshot }) {
  const snapshot = state.history.redoStack.pop();
  if (!snapshot) {
    return false;
  }
  state.history.undoStack.push(currentSnapshot);
  applySnapshot(snapshot);
  return true;
}
