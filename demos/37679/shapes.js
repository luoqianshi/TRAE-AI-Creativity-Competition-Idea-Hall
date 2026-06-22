export function renderLineShapeView(ctx, line) {
  const selected = ctx.isSelected("shape", line.id) ? ` is-selected${ctx.state.tool === "select" ? " is-select-mode" : ""}` : "";
  const markers = selected
    ? `<circle class="endpoint-dot" cx="${line.x1}" cy="${line.y1}" r="7" /><circle class="endpoint-dot" cx="${line.x2}" cy="${line.y2}" r="7" />`
    : "";
  const lineClass = ctx.getLineVisualClass(line);
  return `
    <g class="entity${selected}" data-kind="shape" data-id="${line.id}">
      <line class="hit-target" x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" />
      <line class="${lineClass}" x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" />
      ${markers}
    </g>
  `;
}

export function renderRectLikeShapeView(ctx, shape, rounded = false) {
  const selected = ctx.isSelected("shape", shape.id) ? ` is-selected${ctx.state.tool === "select" ? " is-select-mode" : ""}` : "";
  const { left, top, right, bottom } = ctx.getRectMetrics(shape);
  const markers = selected
    ? `
      <circle class="endpoint-dot" cx="${left}" cy="${top}" r="6" />
      <circle class="endpoint-dot" cx="${right}" cy="${top}" r="6" />
      <circle class="endpoint-dot" cx="${right}" cy="${bottom}" r="6" />
      <circle class="endpoint-dot" cx="${left}" cy="${bottom}" r="6" />
    `
    : "";
  const cls = rounded ? ctx.getShapeStrokeClass(shape, "shape-roundrect") : ctx.getShapeStrokeClass(shape, "shape-rect");
  const body = rounded
    ? `
      <path class="hit-target" d="${ctx.getRoundRectPath(shape)}" />
      <path class="${cls}" d="${ctx.getRoundRectPath(shape)}" />
    `
    : `
      <rect class="hit-target" x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" />
      <rect class="${cls}" x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" />
    `;
  return `
    <g class="entity${selected}" data-kind="shape" data-id="${shape.id}">
      ${body}
      ${markers}
    </g>
  `;
}

export function renderCircleShapeView(ctx, circle) {
  const selected = ctx.isSelected("shape", circle.id) ? ` is-selected${ctx.state.tool === "select" ? " is-select-mode" : ""}` : "";
  const extension = Math.max(16, circle.r * 0.16);
  const center = selected ? `<circle class="shape-center-mark" cx="${circle.cx}" cy="${circle.cy}" r="5" />` : "";
  const circleClass = ctx.getShapeStrokeClass(circle, "shape-circle");
  return `
    <g class="entity${selected}" data-kind="shape" data-id="${circle.id}">
      <circle class="hit-target" cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" />
      <line class="center-line" x1="${circle.cx - circle.r - extension}" y1="${circle.cy}" x2="${circle.cx + circle.r + extension}" y2="${circle.cy}" />
      <line class="center-line" x1="${circle.cx}" y1="${circle.cy - circle.r - extension}" x2="${circle.cx}" y2="${circle.cy + circle.r + extension}" />
      <circle class="${circleClass}" cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" />
      ${center}
    </g>
  `;
}

export function renderArcShapeView(ctx, shape) {
  const selected = ctx.isSelected("shape", shape.id) ? ` is-selected${ctx.state.tool === "select" ? " is-select-mode" : ""}` : "";
  const path = ctx.getArcPath(shape);
  const { start, end, control, center } = ctx.getArcGeometry(shape);
  const centerMark =
    shape.type === "arc"
      ? `
      <line class="center-line" x1="${center.x - 14}" y1="${center.y}" x2="${center.x + 14}" y2="${center.y}" />
      <line class="center-line" x1="${center.x}" y1="${center.y - 14}" x2="${center.x}" y2="${center.y + 14}" />
      <circle class="shape-center-mark" cx="${center.x}" cy="${center.y}" r="4.5" />
    `
      : "";
  const markers = selected
    ? `
      <circle class="endpoint-dot" cx="${start.x}" cy="${start.y}" r="6" />
      <circle class="endpoint-dot" cx="${end.x}" cy="${end.y}" r="6" />
      <circle class="endpoint-dot" cx="${control.x}" cy="${control.y}" r="6" />
    `
    : "";
  const cls = shape.type === "semicircle" ? ctx.getShapeStrokeClass(shape, "shape-semicircle") : ctx.getShapeStrokeClass(shape, "shape-arc");
  return `
    <g class="entity${selected}" data-kind="shape" data-id="${shape.id}">
      <path class="hit-target" d="${path}" />
      <path class="${cls}" d="${path}" />
      ${centerMark}
      ${markers}
    </g>
  `;
}

export function renderPolarProfileShapeView(ctx, shape) {
  const selected = ctx.isSelected("shape", shape.id) ? ` is-selected${ctx.state.tool === "select" ? " is-select-mode" : ""}` : "";
  const path = ctx.getPolarProfilePath(shape);
  const centerMark = `
      <line class="center-line" x1="${shape.center.x - 18}" y1="${shape.center.y}" x2="${shape.center.x + 18}" y2="${shape.center.y}" />
      <line class="center-line" x1="${shape.center.x}" y1="${shape.center.y - 18}" x2="${shape.center.x}" y2="${shape.center.y + 18}" />
      <circle class="shape-center-mark" cx="${shape.center.x}" cy="${shape.center.y}" r="4.5" />
    `;
  const markers = selected
    ? ctx
        .getPolarProfileCartesianPoints(shape)
        .map((point) => `<circle class="endpoint-dot" cx="${point.x}" cy="${point.y}" r="5" />`)
        .join("")
    : "";
  const cls = ctx.getShapeStrokeClass(shape, "shape-arc");
  return `
    <g class="entity${selected}" data-kind="shape" data-id="${shape.id}">
      <path class="hit-target" d="${path}" />
      ${centerMark}
      <path class="${cls}" d="${path}" />
      ${markers}
    </g>
  `;
}
