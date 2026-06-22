export function buildBackgroundMarkup(background) {
  if (!background) {
    return "";
  }
  return `
    <image class="background-image" href="${background.url}" x="60" y="60" width="1080" height="660" preserveAspectRatio="xMidYMid meet" />
  `;
}

export function buildGuidesMarkup(guides, selectionBox) {
  const guidesMarkup = guides
    .map((guide) => `<line class="snap-guide" x1="${guide.x1}" y1="${guide.y1}" x2="${guide.x2}" y2="${guide.y2}" />`)
    .join("");
  const selectionMarkup = selectionBox
    ? (() => {
        const x = Math.min(selectionBox.x1, selectionBox.x2);
        const y = Math.min(selectionBox.y1, selectionBox.y2);
        const width = Math.abs(selectionBox.x2 - selectionBox.x1);
        const height = Math.abs(selectionBox.y2 - selectionBox.y1);
        return `<rect class="selection-box" x="${x}" y="${y}" width="${width}" height="${height}" />`;
      })()
    : "";
  return `${guidesMarkup}${selectionMarkup}`;
}

export function buildShapeLayerMarkup(shapes, renderShape) {
  return shapes.map((shape) => renderShape(shape)).join("");
}

export function buildAnnotationLayerMarkup(annotations, renderAnnotation) {
  return annotations.map((annotation) => renderAnnotation(annotation)).join("");
}
