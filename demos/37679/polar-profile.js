export function defaultPolarProfilePoints() {
  return [
    { angleDeg: 0, radius: 24 },
    { angleDeg: 20, radius: 24.5 },
    { angleDeg: 40, radius: 26.5 },
    { angleDeg: 60, radius: 30 },
    { angleDeg: 80, radius: 34 },
    { angleDeg: 100, radius: 37.5 },
    { angleDeg: 120, radius: 40 },
    { angleDeg: 140, radius: 42 },
    { angleDeg: 160, radius: 41 },
    { angleDeg: 180, radius: 38 },
    { angleDeg: 200, radius: 33.5 },
    { angleDeg: 220, radius: 28 },
    { angleDeg: 240, radius: 24 },
    { angleDeg: 270, radius: 22 },
    { angleDeg: 300, radius: 21 },
    { angleDeg: 330, radius: 22.5 },
  ];
}

export function createPolarProfileShape(id, center, points = defaultPolarProfilePoints()) {
  return {
    id,
    type: "polar-profile",
    center: { x: center.x, y: center.y },
    closed: true,
    interpolation: "smooth",
    points: points.map((point) => ({
      angleDeg: Number(point.angleDeg) || 0,
      radius: Math.max(6, Number(point.radius) || 6),
    })),
  };
}

export function polarPointToCartesian(center, point) {
  const angleRad = (point.angleDeg * Math.PI) / 180;
  return {
    x: center.x + Math.cos(angleRad) * point.radius,
    y: center.y - Math.sin(angleRad) * point.radius,
  };
}

export function getPolarProfileCartesianPoints(shape) {
  return (shape.points || []).map((point) => polarPointToCartesian(shape.center, point));
}

export function getPolarProfilePath(shape) {
  const points = getPolarProfileCartesianPoints(shape);
  if (!points.length) {
    return "";
  }
  if (points.length < 3 || shape.interpolation === "linear") {
    const commands = [`M ${points[0].x} ${points[0].y}`];
    for (let i = 1; i < points.length; i += 1) {
      commands.push(`L ${points[i].x} ${points[i].y}`);
    }
    if (shape.closed !== false) {
      commands.push("Z");
    }
    return commands.join(" ");
  }

  const smoothness = 1;
  const getPoint = (index) => points[(index + points.length) % points.length];
  const commands = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length; i += 1) {
    const p0 = getPoint(i - 1);
    const p1 = getPoint(i);
    const p2 = getPoint(i + 1);
    const p3 = getPoint(i + 2);

    const cp1 = {
      x: p1.x + ((p2.x - p0.x) * smoothness) / 6,
      y: p1.y + ((p2.y - p0.y) * smoothness) / 6,
    };
    const cp2 = {
      x: p2.x - ((p3.x - p1.x) * smoothness) / 6,
      y: p2.y - ((p3.y - p1.y) * smoothness) / 6,
    };

    commands.push(`C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p2.x} ${p2.y}`);
  }

  if (shape.closed !== false) {
    commands.push("Z");
  }
  return commands.join(" ");
}

export function createPolarPoint(center, point) {
  const dx = point.x - center.x;
  const dy = center.y - point.y;
  return {
    angleDeg: ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360,
    radius: Math.max(6, Math.hypot(dx, dy)),
  };
}

export function serializePolarProfilePoints(points) {
  return (points || [])
    .map((point) => `${Math.round(point.angleDeg)}:${Math.round(point.radius)}`)
    .join("\n");
}

export function parsePolarProfilePoints(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const points = lines.map((line) => {
    const [anglePart, radiusPart] = line.split(":");
    const angleDeg = Number(anglePart);
    const radius = Number(radiusPart);
    if (!Number.isFinite(angleDeg) || !Number.isFinite(radius)) {
      throw new Error("invalid-polar-point");
    }
    return {
      angleDeg,
      radius: Math.max(6, radius),
    };
  });
  if (points.length < 3) {
    throw new Error("not-enough-points");
  }
  return points.sort((a, b) => a.angleDeg - b.angleDeg);
}
