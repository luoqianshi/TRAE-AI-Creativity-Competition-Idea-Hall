export function buildDraftMarkup(ctx, draft) {
  if (!draft) {
    return "";
  }
  if (draft.type === "line") {
    const draftClass = draft.lineType === "hidden" ? "draft-stroke draft-stroke-hidden" : "draft-stroke";
    return `<line class="${draftClass}" x1="${draft.x1}" y1="${draft.y1}" x2="${draft.x2}" y2="${draft.y2}" />`;
  }
  if (draft.type === "manual-dimension-line") {
    return ctx.renderManualDimensionLine(draft);
  }
  if (draft.type === "manual-dimension-line-labeled") {
    return ctx.renderManualDimensionLineLabeled(draft);
  }
  if (draft.type === "manual-extension-line") {
    return ctx.renderManualExtensionLine(draft);
  }
  if (draft.type === "rect" || draft.type === "roundrect") {
    const radius = draft.type === "roundrect" ? ctx.getRoundRectRadius(draft) : 0;
    return `<rect class="draft-stroke" x="${draft.x}" y="${draft.y}" width="${draft.width}" height="${draft.height}" rx="${radius}" ry="${radius}" />`;
  }
  if (draft.type === "semicircle" || draft.type === "arc") {
    return `<path class="draft-stroke" d="${ctx.getArcPath(draft)}" />`;
  }
  if (draft.type === "symmetry-line" || draft.type === "chain-line") {
    return ctx.renderLineShape(draft);
  }
  if (draft.type === "polar-profile") {
    const path = ctx.getPolarProfilePath(draft);
    const points = ctx.getPolarProfileCartesianPoints(draft);
    const helperLines = points
      .map((point) => `<line class="snap-guide" x1="${draft.center.x}" y1="${draft.center.y}" x2="${point.x}" y2="${point.y}" />`)
      .join("");
    const pointDots = points
      .map((point) => `<circle class="endpoint-dot" cx="${point.x}" cy="${point.y}" r="4.5" />`)
      .join("");
    const previewDot = draft.previewPoint
      ? `<circle class="shape-center-mark" cx="${draft.previewPoint.x}" cy="${draft.previewPoint.y}" r="5" />`
      : "";
    const previewLine = draft.previewPoint
      ? `<line class="draft-stroke" x1="${draft.center.x}" y1="${draft.center.y}" x2="${draft.previewPoint.x}" y2="${draft.previewPoint.y}" />`
      : "";
    const centerDot = `<circle class="shape-center-mark" cx="${draft.center.x}" cy="${draft.center.y}" r="5" />`;
    const previewPath = path ? `<path class="draft-stroke" d="${path}" />` : "";
    return `${helperLines}${previewPath}${previewLine}${centerDot}${pointDots}${previewDot}`;
  }
  if (draft.type === "manual-single-arrow") {
    return ctx.renderManualSingleArrow(draft);
  }
  return `<circle class="draft-stroke" cx="${draft.cx}" cy="${draft.cy}" r="${draft.r}" />`;
}
