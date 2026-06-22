export function getLineAngleDegrees(line, normalizeReadableRotation, toDegrees) {
  return normalizeReadableRotation(toDegrees(Math.atan2(line.y2 - line.y1, line.x2 - line.x1)));
}

export function setLineFromLengthAngle(line, length, angleDegrees, getLineMetrics) {
  const nextLength = Math.max(12, Number(length) || 12);
  const angle = ((Number(angleDegrees) || 0) * Math.PI) / 180;
  const { mid } = getLineMetrics(line);
  const half = nextLength / 2;
  const dx = Math.cos(angle) * half;
  const dy = Math.sin(angle) * half;
  line.x1 = mid.x - dx;
  line.y1 = mid.y - dy;
  line.x2 = mid.x + dx;
  line.y2 = mid.y + dy;
}

export function normalizeLine(line) {
  const horizontalBias = Math.abs(line.x2 - line.x1) >= Math.abs(line.y2 - line.y1);
  if (horizontalBias && line.x1 > line.x2) {
    return { ...line, x1: line.x2, y1: line.y2, x2: line.x1, y2: line.y1 };
  }
  if (!horizontalBias && line.y1 > line.y2) {
    return { ...line, x1: line.x2, y1: line.y2, x2: line.x1, y2: line.y1 };
  }
  return line;
}

export function getLineMetrics(line) {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = Math.hypot(dx, dy) || 1;
  const unit = { x: dx / length, y: dy / length };
  const normal = { x: -unit.y, y: unit.x };
  const p1 = { x: line.x1, y: line.y1 };
  const p2 = { x: line.x2, y: line.y2 };
  const mid = { x: (line.x1 + line.x2) / 2, y: (line.y1 + line.y2) / 2 };
  return { dx, dy, length, unit, normal, p1, p2, mid };
}

export function getLineLikeShape(shape, isLineShape) {
  if (!isLineShape(shape)) {
    return null;
  }
  return { x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 };
}
