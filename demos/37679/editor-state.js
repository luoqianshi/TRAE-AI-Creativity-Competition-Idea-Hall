export function createEditorState(defaultUnitsPerMm) {
  return {
    tool: "select",
    currentLineType: "solid",
    ortho: true,
    showGrid: true,
    background: null,
    guides: [],
    shapes: [],
    annotations: [],
    selected: null,
    editingShapeId: null,
    draft: null,
    interaction: null,
    floatingPanelLock: null,
    unitsPerMm: defaultUnitsPerMm,
    history: {
      undoStack: [],
      redoStack: [],
    },
    nextId: 1,
  };
}

export function createUidGenerator(state) {
  return function uid(prefix) {
    const id = `${prefix}-${state.nextId}`;
    state.nextId += 1;
    return id;
  };
}
