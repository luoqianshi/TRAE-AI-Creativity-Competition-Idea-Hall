export function labelBubbleView(ctx, text, x, y, options = {}) {
  const safeText = ctx.escapeText(text);
  const rotation = options.rotation || 0;
  const fontSize = Math.max(10, Math.min(72, Number(options.fontSize) || ctx.defaultLabelFontSize));
  const yOffset = Number.isFinite(Number(options.yOffset)) ? Number(options.yOffset) : -4;
  const transform = rotation ? `rotate(${rotation})` : "";
  const textTransform = transform ? ` transform="${transform}"` : "";
  return `
    <g class="label-bubble" transform="translate(${x} ${y})">
      <text text-anchor="middle" dominant-baseline="middle" y="${yOffset}" font-size="${fontSize}"${textTransform}>${safeText}</text>
    </g>
  `;
}

export function renderManualDimensionLineView(ctx, annotation) {
  const selected = ctx.isSelected("annotation", annotation.id) ? " is-selected" : "";
  const line = { x1: annotation.x1, y1: annotation.y1, x2: annotation.x2, y2: annotation.y2 };
  const metrics = ctx.getLineMetrics(line);
  const startArrow = ctx.createArrowHead(metrics.p1, metrics.unit);
  const endArrow = ctx.createArrowHead(metrics.p2, ctx.scale(metrics.unit, -1));
  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <line class="hit-target" x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" />
      <line class="annotation-line" x1="${startArrow.baseCenter.x}" y1="${startArrow.baseCenter.y}" x2="${endArrow.baseCenter.x}" y2="${endArrow.baseCenter.y}" />
      ${startArrow.svg}
      ${endArrow.svg}
    </g>
  `;
}

export function renderManualDimensionLineLabeledView(ctx, annotation) {
  const selected = ctx.isSelected("annotation", annotation.id) ? " is-selected" : "";
  const line = { x1: annotation.x1, y1: annotation.y1, x2: annotation.x2, y2: annotation.y2 };
  const metrics = ctx.getLineMetrics(line);
  const startArrow = ctx.createArrowHead(metrics.p1, metrics.unit);
  const endArrow = ctx.createArrowHead(metrics.p2, ctx.scale(metrics.unit, -1));
  const label = ctx.getManualDimensionLineLabel(annotation);
  const defaultLabelOffset = ctx.scale(metrics.normal, -ctx.autoDimensionStyle.labelOffset);
  const labelOffset = annotation.labelOffset || defaultLabelOffset;
  const labelPoint = ctx.add(metrics.mid, labelOffset);
  const rotation =
    ctx.getReadableRotation(annotation, ctx.toDegrees(Math.atan2(metrics.unit.y, metrics.unit.x))) +
    (ctx.getAnnotationTextRotationOffset?.(annotation) || 0);
  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <line class="hit-target" x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" />
      <line class="annotation-line" x1="${startArrow.baseCenter.x}" y1="${startArrow.baseCenter.y}" x2="${endArrow.baseCenter.x}" y2="${endArrow.baseCenter.y}" />
      ${startArrow.svg}
      ${endArrow.svg}
      ${labelBubbleView(ctx, label, labelPoint.x, labelPoint.y, { rotation, fontSize: ctx.getAnnotationFontSize(annotation) })}
    </g>
  `;
}

export function renderManualExtensionLineView(ctx, annotation) {
  const selected = ctx.isSelected("annotation", annotation.id) ? " is-selected" : "";
  const markers = selected
    ? `
      <circle class="endpoint-dot" cx="${annotation.x1}" cy="${annotation.y1}" r="5.5" />
      <circle class="endpoint-dot" cx="${annotation.x2}" cy="${annotation.y2}" r="5.5" />
    `
    : "";
  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <line class="hit-target" x1="${annotation.x1}" y1="${annotation.y1}" x2="${annotation.x2}" y2="${annotation.y2}" />
      <line class="annotation-line-thin" x1="${annotation.x1}" y1="${annotation.y1}" x2="${annotation.x2}" y2="${annotation.y2}" />
      ${markers}
    </g>
  `;
}

export function renderManualSingleArrowView(ctx, annotation) {
  const selected = ctx.isSelected("annotation", annotation.id) ? " is-selected" : "";
  const line = { x1: annotation.x1, y1: annotation.y1, x2: annotation.x2, y2: annotation.y2 };
  const metrics = ctx.getLineMetrics(line);
  const arrow = ctx.createArrowHead(metrics.p2, ctx.scale(metrics.unit, -1));
  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <line class="hit-target" x1="${annotation.x1}" y1="${annotation.y1}" x2="${annotation.x2}" y2="${annotation.y2}" />
      <line class="annotation-line-thin" x1="${annotation.x1}" y1="${annotation.y1}" x2="${arrow.baseCenter.x}" y2="${arrow.baseCenter.y}" />
      ${arrow.svg}
    </g>
  `;
}

export function renderManualTextView(ctx, annotation) {
  const selected = ctx.isSelected("annotation", annotation.id) ? " is-selected" : "";
  const safeText = annotation.text?.trim() || "100";
  const rotation = ctx.getReadableRotation(annotation, 0) + (ctx.getAnnotationTextRotationOffset?.(annotation) || 0);
  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <rect class="hit-target" x="${annotation.x - 30}" y="${annotation.y - 18}" width="60" height="36" rx="4" ry="4" />
      ${labelBubbleView(ctx, safeText, annotation.x, annotation.y, { rotation, fontSize: ctx.getAnnotationFontSize(annotation) })}
    </g>
  `;
}

export function renderLengthAnnotationView(ctx, annotation, line) {
  const selected = ctx.isSelected("annotation", annotation.id) ? " is-selected" : "";
  const { dx, dy, normal, unit, p1, p2 } = ctx.getLineMetrics(line);
  const source1 = line.ext1 || p1;
  const source2 = line.ext2 || p2;
  const sign = annotation.offset >= 0 ? 1 : -1;
  const dim1 = ctx.add(p1, ctx.scale(normal, annotation.offset));
  const dim2 = ctx.add(p2, ctx.scale(normal, annotation.offset));
  const startExtensionOvershoot = Number.isFinite(annotation.startExtensionOvershoot) ? annotation.startExtensionOvershoot : 12;
  const endExtensionOvershoot = Number.isFinite(annotation.endExtensionOvershoot) ? annotation.endExtensionOvershoot : 12;
  const startExtensionEnd = ctx.add(dim1, ctx.scale(normal, startExtensionOvershoot * sign));
  const endExtensionEnd = ctx.add(dim2, ctx.scale(normal, endExtensionOvershoot * sign));
  const startArrow = ctx.createArrowHead(dim1, unit);
  const endArrow = ctx.createArrowHead(dim2, ctx.scale(unit, -1));
  const midPoint = { x: (dim1.x + dim2.x) / 2, y: (dim1.y + dim2.y) / 2 };
  const isHorizontal = Math.abs(dx) >= Math.abs(dy) * 3;
  const isVertical = Math.abs(dy) >= Math.abs(dx) * 3;
  const labelSideNormal = sign >= 0 ? normal : ctx.scale(normal, -1);
  let labelPoint = ctx.add(midPoint, ctx.scale(labelSideNormal, ctx.autoDimensionStyle.labelOffset));
  let labelRotation = 0;
  if (isHorizontal) {
    labelPoint = { x: midPoint.x, y: midPoint.y - ctx.autoDimensionStyle.labelOffset };
  } else if (isVertical) {
    labelPoint = { x: midPoint.x - (ctx.autoDimensionStyle.labelOffset + ctx.autoDimensionStyle.verticalInset), y: midPoint.y };
    labelRotation = -90;
  }
  if (!isHorizontal && !isVertical) {
    labelRotation = ctx.getReadableRotation(annotation, ctx.toDegrees(Math.atan2(unit.y, unit.x)));
  } else {
    labelRotation = ctx.getReadableRotation(annotation, labelRotation);
  }
  labelRotation += ctx.getAnnotationTextRotationOffset?.(annotation) || 0;
  const extensionMarkers = selected
    ? `
      <circle class="hit-target extension-end-hit" cx="${startExtensionEnd.x}" cy="${startExtensionEnd.y}" r="12" />
      <circle class="hit-target extension-end-hit" cx="${endExtensionEnd.x}" cy="${endExtensionEnd.y}" r="12" />
      <circle class="endpoint-dot" cx="${startExtensionEnd.x}" cy="${startExtensionEnd.y}" r="5.5" />
      <circle class="endpoint-dot" cx="${endExtensionEnd.x}" cy="${endExtensionEnd.y}" r="5.5" />
    `
    : "";
  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <line class="hit-target" x1="${dim1.x}" y1="${dim1.y}" x2="${dim2.x}" y2="${dim2.y}" />
      <line class="extension-line" x1="${source1.x}" y1="${source1.y}" x2="${startExtensionEnd.x}" y2="${startExtensionEnd.y}" />
      <line class="extension-line" x1="${source2.x}" y1="${source2.y}" x2="${endExtensionEnd.x}" y2="${endExtensionEnd.y}" />
      <line class="annotation-line" x1="${startArrow.baseCenter.x}" y1="${startArrow.baseCenter.y}" x2="${endArrow.baseCenter.x}" y2="${endArrow.baseCenter.y}" />
      ${startArrow.svg}
      ${endArrow.svg}
      ${extensionMarkers}
      ${labelBubbleView(ctx, ctx.annotationLabel(annotation), labelPoint.x, labelPoint.y, { rotation: labelRotation, fontSize: ctx.getAnnotationFontSize(annotation) })}
    </g>
  `;
}

export function renderRadiusAnnotationView(ctx, annotation, shape) {
  const selected = ctx.isSelected("annotation", annotation.id) ? " is-selected" : "";
  const geometry = ctx.getRadiusAnnotationGeometry(shape, annotation);
  if (!geometry) {
    return "";
  }
  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <line class="hit-target" x1="${geometry.tail.x}" y1="${geometry.tail.y}" x2="${geometry.rim.x}" y2="${geometry.rim.y}" />
      <line class="annotation-line-thin" x1="${geometry.center.x}" y1="${geometry.center.y}" x2="${geometry.rim.x}" y2="${geometry.rim.y}" />
      <line class="annotation-line" x1="${geometry.tail.x}" y1="${geometry.tail.y}" x2="${geometry.arrow.baseCenter.x}" y2="${geometry.arrow.baseCenter.y}" />
      ${geometry.arrow.svg}
      ${labelBubbleView(ctx, geometry.label, geometry.labelPoint.x, geometry.labelPoint.y, {
        rotation: geometry.labelRotation ?? (ctx.getAnnotationTextRotationOffset?.(annotation) || 0),
        fontSize: ctx.getAnnotationFontSize(annotation),
      })}
    </g>
  `;
}

export function renderAngleAnnotationView(ctx, annotation, shape) {
  const selected = ctx.isSelected("annotation", annotation.id) ? " is-selected" : "";
  const geometry = ctx.getAngleAnnotationGeometry(shape, annotation);
  if (!geometry) {
    return "";
  }
  const extensionMarkers = selected
    ? `
      <circle class="hit-target extension-end-hit" cx="${geometry.dimStart.x}" cy="${geometry.dimStart.y}" r="12" />
      <circle class="hit-target extension-end-hit" cx="${geometry.dimEnd.x}" cy="${geometry.dimEnd.y}" r="12" />
      <circle class="endpoint-dot" cx="${geometry.dimStart.x}" cy="${geometry.dimStart.y}" r="5.5" />
      <circle class="endpoint-dot" cx="${geometry.dimEnd.x}" cy="${geometry.dimEnd.y}" r="5.5" />
    `
    : "";
  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <path class="hit-target" d="${geometry.arcPath}" />
      <line class="extension-line" x1="${geometry.center.x}" y1="${geometry.center.y}" x2="${geometry.extensionStartEnd.x}" y2="${geometry.extensionStartEnd.y}" />
      <line class="extension-line" x1="${geometry.center.x}" y1="${geometry.center.y}" x2="${geometry.extensionEndEnd.x}" y2="${geometry.extensionEndEnd.y}" />
      <path class="annotation-line" d="${geometry.arcPath}" />
      ${geometry.startArrow.svg}
      ${geometry.endArrow.svg}
      ${extensionMarkers}
      <g class="angle-label">
        ${ctx.labelBubble(geometry.label, geometry.labelPoint.x, geometry.labelPoint.y, {
          rotation: geometry.labelRotation ?? (ctx.getAnnotationTextRotationOffset?.(annotation) || 0),
          fontSize: ctx.getAnnotationFontSize(annotation),
          yOffset: 0,
        })}
      </g>
    </g>
  `;
}

export function renderArcMeasureAnnotationView(ctx, annotation, shape) {
  const selected = ctx.isSelected("annotation", annotation.id) ? " is-selected" : "";
  const geometry = ctx.getArcMeasureAnnotationGeometry(shape, annotation);
  if (!geometry) {
    return "";
  }
  if (geometry.kind === "chord") {
    const extensionMarkers = selected
      ? `
        <circle class="hit-target extension-end-hit" cx="${geometry.startExtensionEnd.x}" cy="${geometry.startExtensionEnd.y}" r="12" />
        <circle class="hit-target extension-end-hit" cx="${geometry.endExtensionEnd.x}" cy="${geometry.endExtensionEnd.y}" r="12" />
        <circle class="endpoint-dot" cx="${geometry.dimStart.x}" cy="${geometry.dimStart.y}" r="5.5" />
        <circle class="endpoint-dot" cx="${geometry.dimEnd.x}" cy="${geometry.dimEnd.y}" r="5.5" />
      `
      : "";
    return `
      <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
        <line class="hit-target" x1="${geometry.dimStart.x}" y1="${geometry.dimStart.y}" x2="${geometry.dimEnd.x}" y2="${geometry.dimEnd.y}" />
        <line class="extension-line" x1="${geometry.start.x}" y1="${geometry.start.y}" x2="${geometry.startExtensionEnd.x}" y2="${geometry.startExtensionEnd.y}" />
        <line class="extension-line" x1="${geometry.end.x}" y1="${geometry.end.y}" x2="${geometry.endExtensionEnd.x}" y2="${geometry.endExtensionEnd.y}" />
        <line class="annotation-line" x1="${geometry.startArrow.baseCenter.x}" y1="${geometry.startArrow.baseCenter.y}" x2="${geometry.endArrow.baseCenter.x}" y2="${geometry.endArrow.baseCenter.y}" />
        ${geometry.startArrow.svg}
        ${geometry.endArrow.svg}
        ${extensionMarkers}
        ${ctx.labelBubble(geometry.label, geometry.labelPoint.x, geometry.labelPoint.y, {
          rotation: geometry.labelRotation,
          fontSize: ctx.getAnnotationFontSize(annotation),
          yOffset: 0,
        })}
      </g>
    `;
  }

  const arcMarkers = selected
    ? `
      <circle class="hit-target extension-end-hit" cx="${geometry.dimStart.x}" cy="${geometry.dimStart.y}" r="12" />
      <circle class="hit-target extension-end-hit" cx="${geometry.dimEnd.x}" cy="${geometry.dimEnd.y}" r="12" />
      <circle class="endpoint-dot" cx="${geometry.dimStart.x}" cy="${geometry.dimStart.y}" r="5.5" />
      <circle class="endpoint-dot" cx="${geometry.dimEnd.x}" cy="${geometry.dimEnd.y}" r="5.5" />
    `
    : "";
  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <path class="hit-target" d="${geometry.arcPath}" />
      <line class="extension-line" x1="${geometry.start.x}" y1="${geometry.start.y}" x2="${geometry.extensionStartEnd.x}" y2="${geometry.extensionStartEnd.y}" />
      <line class="extension-line" x1="${geometry.end.x}" y1="${geometry.end.y}" x2="${geometry.extensionEndEnd.x}" y2="${geometry.extensionEndEnd.y}" />
      <path class="annotation-line" d="${geometry.arcPath}" />
      ${geometry.startArrow.svg}
      ${geometry.endArrow.svg}
      ${arcMarkers}
      ${ctx.labelBubble(geometry.label, geometry.labelPoint.x, geometry.labelPoint.y, {
        rotation: geometry.labelRotation ?? (ctx.getAnnotationTextRotationOffset?.(annotation) || 0),
        fontSize: ctx.getAnnotationFontSize(annotation),
        yOffset: 0,
      })}
    </g>
  `;
}

export function renderInsideDiameterAnnotationView(ctx, annotation, circle, direction) {
  const selected = ctx.isSelected("annotation", annotation.id) ? " is-selected" : "";
  const start = ctx.add({ x: circle.cx, y: circle.cy }, ctx.scale(direction, -circle.r));
  const end = ctx.add({ x: circle.cx, y: circle.cy }, ctx.scale(direction, circle.r));
  const label = ctx.annotationLabel(annotation);
  const upperNormal = ctx.getUpperNormal(direction);
  const defaultLabelOffset = ctx.scale(
    upperNormal,
    Math.min(
      ctx.autoDimensionStyle.insideDiameterMaxOffset,
      Math.max(ctx.autoDimensionStyle.insideDiameterMinOffset, circle.r * ctx.autoDimensionStyle.insideDiameterScale),
    ),
  );
  const labelOffset = annotation.labelOffset || defaultLabelOffset;
  const labelPoint = ctx.add({ x: circle.cx, y: circle.cy }, labelOffset);
  const labelRotation =
    ctx.getDiameterLabelRotation(annotation, ctx.toDegrees(Math.atan2(direction.y, direction.x))) +
    (ctx.getAnnotationTextRotationOffset?.(annotation) || 0);
  const startArrow = ctx.createArrowHead(start, direction);
  const endArrow = ctx.createArrowHead(end, ctx.scale(direction, -1));
  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <line class="hit-target" x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" />
      <line class="annotation-line" x1="${startArrow.baseCenter.x}" y1="${startArrow.baseCenter.y}" x2="${endArrow.baseCenter.x}" y2="${endArrow.baseCenter.y}" />
      ${startArrow.svg}
      ${endArrow.svg}
      ${labelBubbleView(ctx, label, labelPoint.x, labelPoint.y, { rotation: labelRotation, fontSize: ctx.getAnnotationFontSize(annotation) })}
    </g>
  `;
}

export function renderPolarCoordinateAnnotationView(ctx, annotation, shape) {
  const selected = ctx.isSelected("annotation", annotation.id) ? " is-selected" : "";
  const geometry = ctx.getPolarCoordinateAnnotationGeometry?.(shape, annotation);
  if (!geometry) {
    return "";
  }
  const baseAxisMarkup = geometry.isInitialPolarAxis
    ? `<line class="center-line" x1="${geometry.baseAxisStart.x}" y1="${geometry.baseAxisStart.y}" x2="${geometry.baseAxisEnd.x}" y2="${geometry.baseAxisEnd.y}" />`
    : `<line class="extension-line" x1="${geometry.baseAxisStart.x}" y1="${geometry.baseAxisStart.y}" x2="${geometry.baseAxisEnd.x}" y2="${geometry.baseAxisEnd.y}" />`;
  return `
    <g class="entity${selected}" data-kind="annotation" data-id="${annotation.id}">
      <path class="hit-target" d="${geometry.arcPath}" />
      <line class="hit-target" x1="${geometry.center.x}" y1="${geometry.center.y}" x2="${geometry.point.x}" y2="${geometry.point.y}" />
      ${baseAxisMarkup}
      <line class="extension-line" x1="${geometry.center.x}" y1="${geometry.center.y}" x2="${geometry.outerPoint.x}" y2="${geometry.outerPoint.y}" />
      <line class="annotation-line" x1="${geometry.center.x}" y1="${geometry.center.y}" x2="${geometry.radiusArrow.baseCenter.x}" y2="${geometry.radiusArrow.baseCenter.y}" />
      <path class="annotation-line" d="${geometry.arcPath}" />
      ${geometry.radiusArrow.svg}
      ${geometry.baseArcArrow.svg}
      ${geometry.angleArcArrow.svg}
      <g class="polar-radius-label">
        ${ctx.labelBubble(geometry.radiusLabel, geometry.radiusLabelPoint.x, geometry.radiusLabelPoint.y, {
          rotation: geometry.radiusLabelRotation,
          fontSize: ctx.getAnnotationFontSize(annotation),
          yOffset: 0,
        })}
      </g>
      <g class="polar-angle-label">
        ${ctx.labelBubble(geometry.angleLabel, geometry.angleLabelPoint.x, geometry.angleLabelPoint.y, {
          rotation: geometry.angleLabelRotation,
          fontSize: ctx.getAnnotationFontSize(annotation),
          yOffset: 0,
        })}
      </g>
    </g>
  `;
}
