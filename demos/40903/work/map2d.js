/**
 * PoetryMap2D - 2D 古风诗词足迹地图
 * 使用 Canvas 2D 绘制山水长卷风格的中国地图，
 * 节点按真实经纬度定位，支持悬停、点击与时间轨迹。
 */

const PROVINCE_PALETTE = [
  "#c4d4b0", "#d8c8a8", "#b8cfa0", "#e0d0a0", "#a8b898",
  "#d8c090", "#c8b880", "#b0d0a0", "#d8c8a0", "#c4d0a0",
  "#e2d0a0", "#b8c8a0", "#d8c8a8", "#c4d4b0", "#e0d0a0",
  "#b8cfa0", "#d8c090", "#c8b880", "#a8b898", "#d8c8a0",
  "#c4d0a0", "#b0d0a0", "#e2d0a0", "#b8c8a0", "#c4d4b0",
  "#d8c8a8", "#e0d0a0", "#b8cfa0", "#d8c090", "#c8b880",
  "#a8b898", "#d8c8a0", "#c4d0a0"
];

const OCEAN_COLOR = "#e6dcc0";
const GRATICULE_COLOR = "rgba(90, 70, 50, 0.22)";
const PROVINCE_BORDER_COLOR = "rgba(70, 55, 40, 0.45)";
const COASTLINE_COLOR = "rgba(70, 55, 40, 0.75)";
const NATIONAL_BORDER_COLOR = "rgba(138, 28, 28, 0.85)";

function hashColor(name) {
  if (!name) return PROVINCE_PALETTE[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PROVINCE_PALETTE[h % PROVINCE_PALETTE.length];
}

function extractRings(geometry) {
  const rings = [];
  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach((ring) => rings.push(ring));
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((polygon) => {
      polygon.forEach((ring) => rings.push(ring));
    });
  }
  return rings;
}

export class PoetryMap2D {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.onNodeClick = options.onNodeClick || (() => {});
    this.canvas = this.container;
    this.ctx = this.canvas.getContext("2d");

    this.nodes = [];
    this.activeNodeId = null;
    this.hoveredNodeId = null;
    this.animationSeed = 0;
    this.textureLoaded = false;
    this.chinaGeoJson = null;
    this.chinaMesh = null;
    this.projection = null;
    this.path = null;

    // 视图变换：缩放与平移（默认放大，让节点与轨迹更醒目）
    this.viewScale = 1.5;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.lastOffsetX = 0;
    this.lastOffsetY = 0;

    this._initSize();
    this._loadTexture();
    this._bindEvents();
  }

  _initSize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  _loadTexture() {
    this.textureImage = new Image();
    this.textureImage.src = "./assets/ancient-map-clean.jpg";
    this.textureImage.onload = () => {
      this.textureLoaded = true;
    };
  }

  _bindEvents() {
    window.addEventListener("resize", () => {
      this._initSize();
      if (this.chinaGeoJson) {
        // 保留当前缩放比例，重新计算投影与居中偏移
        this._initProjection();
        this._positionNodesFromGeo();
      }
    });

    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      const p = this._getCanvasPoint(e);
      this.dragStartX = p.x;
      this.dragStartY = p.y;
      this.lastOffsetX = this.offsetX;
      this.lastOffsetY = this.offsetY;
      this.canvas.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", (e) => {
      if (!this.isDragging) return;

      const p = this._getCanvasPoint(e);
      const moveDistance = Math.hypot(p.x - this.dragStartX, p.y - this.dragStartY);
      this.isDragging = false;
      this.canvas.style.cursor = "default";

      // 移动距离小于 5px 且鼠标在 canvas 内视为点击，触发节点选择
      const inCanvas = e.target === this.canvas || this.canvas.contains(e.target);
      if (moveDistance < 5 && inCanvas) {
        const worldP = this._toWorld(p.x, p.y);
        const node = this._getNodeAt(worldP.x, worldP.y);
        if (node) {
          this.activeNodeId = node.id;
          this.onNodeClick(node);
        }
      }
    });

    this.canvas.addEventListener("mousemove", (e) => {
      const p = this._getCanvasPoint(e);

      if (this.isDragging) {
        this.offsetX = this.lastOffsetX + (p.x - this.dragStartX);
        this.offsetY = this.lastOffsetY + (p.y - this.dragStartY);
        return;
      }

      const worldP = this._toWorld(p.x, p.y);
      const node = this._getNodeAt(worldP.x, worldP.y);
      this.hoveredNodeId = node?.id || null;
      this.canvas.style.cursor = node ? "pointer" : "grab";
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.hoveredNodeId = null;
      this.isDragging = false;
      this.canvas.style.cursor = "default";
    });

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const p = this._getCanvasPoint(e);
      const zoomIntensity = 0.001;
      const delta = -e.deltaY * zoomIntensity;
      const newScale = Math.min(Math.max(this.viewScale + delta, 0.6), 4);

      // 以鼠标位置为中心缩放
      const worldX = (p.x - this.offsetX) / this.viewScale;
      const worldY = (p.y - this.offsetY) / this.viewScale;
      this.offsetX = p.x - worldX * newScale;
      this.offsetY = p.y - worldY * newScale;
      this.viewScale = newScale;
    }, { passive: false });
  }

  _getCanvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  _toWorld(screenX, screenY) {
    return {
      x: (screenX - this.offsetX) / this.viewScale,
      y: (screenY - this.offsetY) / this.viewScale
    };
  }

  _getNodeAt(x, y) {
    return this.nodes.find((node) => Math.hypot(node.x - x, node.y - y) <= 10);
  }

  async loadData(geoUrl, meshUrl) {
    const [geo, mesh] = await Promise.all([
      fetch(geoUrl).then((r) => r.json()),
      fetch(meshUrl).then((r) => r.json())
    ]);
    this.chinaGeoJson = geo;
    this.chinaMesh = mesh;
    return this;
  }

  _initProjection() {
    // 使用完整的中国行政区划作为底图，确保行政区划准确、完整
    this.projection = d3.geoMercator().fitExtent(
      [[60, 50], [this.canvas.width - 60, this.canvas.height - 50]],
      this.chinaGeoJson
    );
    this.path = d3.geoPath(this.projection, this.ctx);

    // 默认以全国视图居中，同时应用初始缩放让核心区域更醒目
    const [[minX, minY], [maxX, maxY]] = this.path.bounds(this.chinaGeoJson);
    const mapW = (maxX - minX) * this.viewScale;
    const mapH = (maxY - minY) * this.viewScale;
    this.offsetX = (this.canvas.width - mapW) / 2 - minX * this.viewScale;
    this.offsetY = (this.canvas.height - mapH) / 2 - minY * this.viewScale;
  }

  _positionNodesFromGeo() {
    this.nodes.forEach((node) => {
      if (node.lat != null && node.lng != null) {
        const projected = this.projection([node.lng, node.lat]);
        if (projected) {
          node.x = projected[0];
          node.y = projected[1];
        }
      }
    });
  }

  setNodes(nodes) {
    this.nodes = nodes;
    if (!this.projection) {
      this._initProjection();
    }
    this._positionNodesFromGeo();
    if (!this._loopStarted) {
      this._loopStarted = true;
      this._drawLoop();
    }
  }

  focusNode(node) {
    this.activeNodeId = node.id;
  }

  _getActiveNode() {
    return this.nodes.find((item) => item.id === this.activeNodeId) || this.nodes[0];
  }

  _getMeshFeature(type) {
    if (!this.chinaMesh) return null;
    return this.chinaMesh.features.find((f) => f.properties.type === type);
  }

  /* 绘制层 */
  _drawPaperBackground() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 宣纸底色
    ctx.fillStyle = OCEAN_COLOR;
    ctx.fillRect(0, 0, w, h);

    // 淡淡的远山晕染
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.8);
    grad.addColorStop(0, "rgba(120, 140, 110, 0.08)");
    grad.addColorStop(1, "rgba(120, 140, 110, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  _drawGraticule() {
    if (!this.projection) return;
    this.ctx.save();
    this.ctx.strokeStyle = GRATICULE_COLOR;
    this.ctx.lineWidth = 0.6;
    this.ctx.setLineDash([2, 5]);
    this.ctx.beginPath();
    for (let lng = 70; lng <= 140; lng += 5) {
      const a = this.projection([lng, 0]);
      const b = this.projection([lng, 60]);
      if (a && b) {
        this.ctx.moveTo(a[0], a[1]);
        this.ctx.lineTo(b[0], b[1]);
      }
    }
    for (let lat = 0; lat <= 60; lat += 5) {
      const a = this.projection([60, lat]);
      const b = this.projection([140, lat]);
      if (a && b) {
        this.ctx.moveTo(a[0], a[1]);
        this.ctx.lineTo(b[0], b[1]);
      }
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  _drawProvinces() {
    if (!this.chinaGeoJson || !this.path) return;

    this.chinaGeoJson.features.forEach((feature) => {
      const name = feature.properties.name;
      if (!name || String(feature.properties.adcode) === "100000_JD") return;
      this.ctx.beginPath();
      this.path(feature);
      this.ctx.fillStyle = hashColor(name);
      this.ctx.fill();
    });

    const mesh = this._getMeshFeature("mesh");
    if (mesh) {
      this.ctx.beginPath();
      this.path(mesh);
      this.ctx.strokeStyle = PROVINCE_BORDER_COLOR;
      this.ctx.lineWidth = 1.1;
      this.ctx.stroke();
    }

    const outline = this._getMeshFeature("outline");
    if (outline) {
      this.ctx.beginPath();
      this.path(outline);
      this.ctx.strokeStyle = COASTLINE_COLOR;
      this.ctx.lineWidth = 1.8;
      this.ctx.stroke();
    }
  }

  _drawNationalBorder() {
    const outline = this._getMeshFeature("outline");
    if (!outline || !this.path) return;
    this.ctx.save();
    this.ctx.beginPath();
    this.path(outline);
    this.ctx.strokeStyle = NATIONAL_BORDER_COLOR;
    this.ctx.lineWidth = 2.4;
    this.ctx.stroke();
    this.ctx.restore();
  }

  _drawNineDashLine() {
    const jd = this.chinaGeoJson && this.chinaGeoJson.features.find(
      (f) => String(f.properties.adcode) === "100000_JD"
    );
    if (!jd || !this.path) return;
    this.ctx.save();
    this.ctx.strokeStyle = NATIONAL_BORDER_COLOR;
    this.ctx.lineWidth = 1.6;
    this.ctx.setLineDash([5, 6]);
    this.ctx.beginPath();
    this.path(jd);
    this.ctx.stroke();
    this.ctx.restore();
  }

  _drawProvinceLabels() {
    if (!this.chinaGeoJson || !this.path) return;
    const provincesWithNodes = new Set(
      this.nodes.map((n) => this._matchProvince(n.lng, n.lat)).filter(Boolean)
    );

    this.ctx.save();
    this.ctx.font = "bold 13px serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.chinaGeoJson.features.forEach((feature) => {
      const name = feature.properties.name;
      if (!name || String(feature.properties.adcode) === "100000_JD") return;
      if (!provincesWithNodes.has(name)) return;
      const centroid = this.path.centroid(feature);
      if (!isFinite(centroid[0]) || !isFinite(centroid[1])) return;
      this.ctx.fillStyle = "rgba(60, 45, 30, 0.7)";
      this.ctx.fillText(name, centroid[0], centroid[1]);
    });
    this.ctx.restore();
  }

  _matchProvince(lng, lat) {
    if (!this.chinaGeoJson) return null;
    for (const f of this.chinaGeoJson.features) {
      if (!f.properties.name || String(f.properties.adcode) === "100000_JD") continue;
      if (d3.geoContains(f, [lng, lat])) return f.properties.name;
    }
    return null;
  }

  _drawInkTexture() {
    if (!this.textureLoaded) return;
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.globalAlpha = 0.22;

    const imgRatio = this.textureImage.width / this.textureImage.height;
    const cvsRatio = this.canvas.width / this.canvas.height;
    let sx, sy, sw, sh;
    if (imgRatio > cvsRatio) {
      sh = this.textureImage.height;
      sw = this.textureImage.height * cvsRatio;
      sx = (this.textureImage.width - sw) / 2;
      sy = 0;
    } else {
      sw = this.textureImage.width;
      sh = this.textureImage.width / cvsRatio;
      sx = 0;
      sy = (this.textureImage.height - sh) / 2;
    }
    this.ctx.drawImage(this.textureImage, sx, sy, sw, sh, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    // 暖褐色调统一
    this.ctx.save();
    this.ctx.globalAlpha = 0.08;
    this.ctx.fillStyle = "rgba(72, 46, 22, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  _drawBaseMap() {
    this._drawPaperBackground();
    this._drawGraticule();
    if (this.chinaGeoJson && this.chinaMesh && this.path) {
      this._drawProvinces();
      this._drawNationalBorder();
      this._drawNineDashLine();
    } else {
      this.ctx.save();
      this.ctx.fillStyle = "rgba(90, 60, 40, 0.55)";
      this.ctx.font = "16px serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("地图数据加载中…", this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.restore();
    }
    if (this.chinaGeoJson && this.chinaMesh && this.path) {
      this._drawProvinceLabels();
    }
    this._drawInkTexture();
  }

  _drawFrame() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = "rgba(90, 60, 40, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, this.canvas.width - 40, this.canvas.height - 40);
    ctx.strokeStyle = "rgba(184, 134, 11, 0.25)";
    ctx.strokeRect(28, 28, this.canvas.width - 56, this.canvas.height - 56);
    ctx.restore();
  }

  _drawRoute() {
    if (this.nodes.length < 2) return;

    // 按时间顺序排序，确保轨迹逻辑连贯
    const routeNodes = [...this.nodes].sort((a, b) => Number(a.year) - Number(b.year));

    this.ctx.save();
    this.ctx.beginPath();
    routeNodes.forEach((node, index) => {
      if (index === 0) {
        this.ctx.moveTo(node.x, node.y);
        return;
      }
      this.ctx.lineTo(node.x, node.y);
    });

    // 水墨渐变轨迹
    const first = routeNodes[0];
    const last = routeNodes[routeNodes.length - 1];
    const grad = this.ctx.createLinearGradient(first.x, first.y, last.x, last.y);
    grad.addColorStop(0, "rgba(140, 30, 30, 0.85)");
    grad.addColorStop(0.5, "rgba(160, 100, 20, 0.65)");
    grad.addColorStop(1, "rgba(140, 30, 30, 0.85)");

    this.ctx.strokeStyle = grad;
    this.ctx.lineWidth = 2.0;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.setLineDash([10, 10]);
    this.ctx.lineDashOffset = -this.animationSeed * 0.35;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "rgba(120, 40, 30, 0.35)";
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // 在数据点中心绘制连接锚点，强化"连线精确对准中心"的视觉提示
    routeNodes.forEach((node) => {
      this.ctx.beginPath();
      this.ctx.fillStyle = "rgba(255, 248, 230, 0.9)";
      this.ctx.arc(node.x, node.y, 1.6, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.restore();
  }

  _drawInkDrop(x, y, radius, alpha) {
    const ctx = this.ctx;
    ctx.save();
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(120, 60, 40, ${alpha})`);
    grad.addColorStop(0.4, `rgba(120, 60, 40, ${alpha * 0.4})`);
    grad.addColorStop(1, "rgba(120, 60, 40, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawNodes() {
    const active = this._getActiveNode();
    const pulse = (Math.sin(this.animationSeed / 18) + 1) / 2;

    this.nodes.forEach((node) => {
      const isActive = node.id === active.id;
      const isHovered = node.id === this.hoveredNodeId;
      const isApprox = node.approximate === true;
      const radius = isActive ? 7 + pulse * 1.5 : isHovered ? 6 : 4.5;

      this.ctx.save();

      if (isActive) {
        this._drawInkDrop(node.x, node.y, radius + 5 + pulse * 1.5, 0.08 + pulse * 0.03);
        this._drawInkDrop(node.x, node.y, radius + 2, 0.10);
      } else {
        this._drawInkDrop(node.x, node.y, radius + 2, isHovered ? 0.06 : 0.03);
      }

      if (isApprox) {
        this.ctx.beginPath();
        this.ctx.setLineDash([4, 4]);
        this.ctx.strokeStyle = isActive ? "rgba(192, 57, 43, 0.75)" : "rgba(184, 134, 11, 0.6)";
        this.ctx.lineWidth = 1.5;
        this.ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }

      // 外圈：普通节点金色描边，active 节点朱砂红描边
      this.ctx.beginPath();
      this.ctx.strokeStyle = isActive ? "rgba(160, 30, 30, 0.9)" : "rgba(220, 180, 80, 0.9)";
      this.ctx.lineWidth = isActive ? 2.4 : 2.0;
      this.ctx.arc(node.x, node.y, radius + 0.5, 0, Math.PI * 2);
      this.ctx.stroke();

      // 内填：普通节点亮金色，active 节点朱砂红
      this.ctx.beginPath();
      this.ctx.fillStyle = isActive ? "#b03020" : "#d4a83a";
      this.ctx.shadowBlur = isActive ? 18 : 10;
      this.ctx.shadowColor = isActive ? "rgba(160, 30, 30, 0.55)" : "rgba(180, 140, 40, 0.45)";
      this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // 内环点缀
      this.ctx.beginPath();
      this.ctx.strokeStyle = isActive ? "rgba(240, 210, 140, 0.85)" : "rgba(120, 60, 30, 0.75)";
      this.ctx.lineWidth = 1.2;
      this.ctx.arc(node.x, node.y, radius * 0.6, 0, Math.PI * 2);
      this.ctx.stroke();

      // 高光
      this.ctx.beginPath();
      this.ctx.fillStyle = "rgba(255, 248, 230, 0.95)";
      this.ctx.arc(node.x - radius * 0.25, node.y - radius * 0.25, radius * 0.22, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  _drawLabel(node, align = "right") {
    if (!node) return;
    const text = `${node.year} · ${node.title}`;
    this.ctx.save();
    this.ctx.font = "bold 13px serif";
    const paddingX = 12;
    const width = this.ctx.measureText(text).width + paddingX * 2;
    const height = 32;
    const x = align === "left" ? node.x - width - 18 : node.x + 18;
    const y = node.y - 36;

    this.ctx.fillStyle = "rgba(250, 243, 224, 0.92)";
    this.ctx.strokeStyle = "rgba(184, 134, 11, 0.45)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, 12);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = "#5a4030";
    this.ctx.fillText(text, x + paddingX, y + 21);
    this.ctx.restore();
  }

  _drawCornerTitle() {
    this.ctx.save();
    this.ctx.fillStyle = "rgba(250, 243, 224, 0.82)";
    this.ctx.strokeStyle = "rgba(184, 134, 11, 0.35)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(36, 32, 260, 70, 16);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = "#7a1f1f";
    this.ctx.font = "bold 24px serif";
    this.ctx.fillText("诗词创作足迹长卷", 56, 64);
    this.ctx.font = "12px serif";
    this.ctx.fillStyle = "rgba(90, 64, 48, 0.78)";
    this.ctx.fillText("Poetry · Place · Time · Memory", 56, 86);
    this.ctx.restore();
  }

  _drawLoading() {
    this.ctx.save();
    this.ctx.fillStyle = "rgba(90, 60, 40, 0.55)";
    this.ctx.font = "16px serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("地图数据加载中…", this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.restore();
  }

  _resetTransform() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  _applyTransform() {
    this.ctx.setTransform(this.viewScale, 0, 0, this.viewScale, this.offsetX, this.offsetY);
  }

  _drawLoop() {
    requestAnimationFrame(() => this._drawLoop());
    this.animationSeed += 1;

    this._resetTransform();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.projection) {
      this._drawLoading();
      return;
    }

    this._applyTransform();
    this._drawBaseMap();
    this._drawRoute();
    this._drawNodes();

    const active = this._getActiveNode();
    if (active && active.x != null) {
      this._drawLabel(active, active.x > (this.canvas.width - this.offsetX) / this.viewScale - 240 ? "left" : "right");
      if (this.hoveredNodeId && this.hoveredNodeId !== this.activeNodeId) {
        const hovered = this.nodes.find((item) => item.id === this.hoveredNodeId);
        if (hovered) {
          this._drawLabel(hovered, hovered.x > (this.canvas.width - this.offsetX) / this.viewScale - 240 ? "left" : "right");
        }
      }
    }

    // 固定元素不受缩放影响
    this._resetTransform();
    this._drawFrame();
    this._drawCornerTitle();
  }
}
