export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(point, factor) {
  return { x: point.x * factor, y: point.y * factor };
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

export function normalize(point) {
  const len = Math.hypot(point.x, point.y) || 1;
  return { x: point.x / len, y: point.y / len };
}

export function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

export function normalizeReadableRotation(degrees) {
  let rotation = ((degrees + 180) % 360 + 360) % 360 - 180;
  if (rotation > 90) {
    rotation -= 180;
  }
  if (rotation < -90) {
    rotation += 180;
  }
  return rotation;
}

export function clampMagnitude(value, minimum) {
  if (Math.abs(value) >= minimum) {
    return value;
  }
  return value >= 0 ? minimum : -minimum;
}

export function pointToSegmentDistance(point, a, b) {
  const ab = sub(b, a);
  const lengthSquared = ab.x * ab.x + ab.y * ab.y || 1;
  const t = Math.max(0, Math.min(1, dot(sub(point, a), ab) / lengthSquared));
  return distance(point, add(a, scale(ab, t)));
}
