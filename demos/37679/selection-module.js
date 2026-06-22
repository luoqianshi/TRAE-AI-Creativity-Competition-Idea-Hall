export function setSelectionState(state, kind, id) {
  if (Array.isArray(id) && id.length > 0) {
    state.selected = { kind, ids: id.slice() };
    return;
  }
  state.selected = kind && id ? { kind, id } : null;
}

export function isSelectionMatch(state, kind, id) {
  if (!state.selected || state.selected.kind !== kind) {
    return false;
  }
  if (Array.isArray(state.selected.ids)) {
    return state.selected.ids.includes(id);
  }
  return state.selected.id === id;
}

export function getSelectionIds(state, kind) {
  if (!state.selected || state.selected.kind !== kind) {
    return [];
  }
  return Array.isArray(state.selected.ids) ? state.selected.ids.slice() : [state.selected.id];
}
