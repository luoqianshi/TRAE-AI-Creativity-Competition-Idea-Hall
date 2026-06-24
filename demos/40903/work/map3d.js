import * as THREE from "three";
import { OrbitControls } from "three/addons/OrbitControls.js";

/**
 * PoetryMap3D - 3D 诗词足迹地图
 * 将中国省级 GeoJSON 渲染为带地形起伏的 3D 地图，
 * 支持节点发光标记、云雾粒子、水墨光影与对联垂落动画。
 */

const GRID_SEGMENTS_X = 120;
const GRID_SEGMENTS_Y = 80;
const BASE_ELEVATION = 0;
const PROVINCE_ELEVATION = 12;
const OCEAN_COLOR = 0xcfe5f2;
const PROVINCE_PALETTE = [
  0xfbe5c3, 0xf6c9c0, 0xfde2a7, 0xcfe6c5, 0xcfd9ee,
  0xf3d4d4, 0xe7d4ee, 0xfde7c2, 0xd4eee4, 0xf0d4b8,
  0xe7e3c8, 0xcfd9ee, 0xf6c9c0, 0xcfe6c5, 0xfde2a7,
  0xfbe5c3, 0xe7d4ee, 0xfde7c2, 0xd4eee4, 0xf3d4d4,
  0xf0d4b8, 0xe7e3c8, 0xcfd9ee, 0xf6c9c0, 0xcfe6c5,
  0xfde2a7, 0xfbe5c3, 0xe7d4ee, 0xfde7c2, 0xd4eee4,
  0xf3d4d4, 0xf0d4b8, 0xe7e3c8, 0xcfd9ee
];

function hashColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PROVINCE_PALETTE[h % PROVINCE_PALETTE.length];
}

function pointInRing(px, py, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
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

export class PoetryMap3D {
  constructor(containerId, options = {}) {
    console.log("[map3d] constructor");
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container #${containerId} not found`);
    }
    this.onNodeClick = options.onNodeClick || (() => {});
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0d12);
    this.scene.fog = new THREE.FogExp2(0x0b0d12, 0.0008);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 4000);
    this.camera.position.set(0, 900, 900);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    if (!this.renderer.getContext()) {
      this._showFallback("WebGL 不可用，请使用支持 WebGL 的浏览器（如 Chrome/Firefox/Edge）查看 3D 地图。");
      throw new Error("WebGL not available");
    }
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.minDistance = 400;
    this.controls.maxDistance = 2500;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.nodes = [];
    this.nodeMeshes = [];
    this.landMesh = null;
    this.clouds = null;
    this.time = 0;

    this._initLights();
    this._initStars();
    this._bindEvents();
    this._animate();
  }

  _initLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambient);

    this.sunLight = new THREE.DirectionalLight(0xfff4e6, 1.2);
    this.sunLight.position.set(400, 800, 300);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 3000;
    this.sunLight.shadow.camera.left = -1000;
    this.sunLight.shadow.camera.right = 1000;
    this.sunLight.shadow.camera.top = 1000;
    this.sunLight.shadow.camera.bottom = -1000;
    this.scene.add(this.sunLight);

    const fill = new THREE.DirectionalLight(0xaaccff, 0.35);
    fill.position.set(-400, 200, -300);
    this.scene.add(fill);
  }

  _initStars() {
    const count = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3000;
      positions[i * 3 + 1] = Math.random() * 1200 + 300;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3000;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xfffadd,
      size: 2.5,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  _showFallback(message) {
    this.container.innerHTML = `
      <div style="display:flex;height:100%;align-items:center;justify-content:center;color:#f2e6c9;font-size:16px;text-align:center;padding:24px;">
        <div>${message}</div>
      </div>
    `;
  }

  _bindEvents() {
    window.addEventListener("resize", () => this._onResize());
    this.renderer.domElement.addEventListener("pointerdown", (e) => this._onPointerDown(e));
  }

  _onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  _onPointerDown(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.nodeMeshes, true);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      const group = obj.parent && obj.parent.userData && obj.parent.userData.node ? obj.parent : obj;
      const node = group.userData.node;
      if (node) {
        this.onNodeClick(node);
        this._showCouplet(node, group.position);
      }
    }
  }

  async loadData(geoUrl, meshUrl) {
    console.log("[map3d] loadData start");
    const [geoRes, meshRes] = await Promise.all([fetch(geoUrl), fetch(meshUrl)]);
    this.geoData = await geoRes.json();
    this.meshData = await meshRes.json();
    console.log("[map3d] geoData features:", this.geoData.features.length);
    this._buildTerrain();
    console.log("[map3d] terrain built");
    this._buildOcean();
    this._buildClouds();
    console.log("[map3d] loadData done");
    return this;
  }

  _buildProjection() {
    const width = this.width;
    const height = this.height;
    this.projection = d3.geoMercator().fitExtent(
      [[0, 0], [width, height]],
      this.geoData
    );
    this.bounds = d3.geoPath(this.projection).bounds(this.geoData);
  }

  _buildTerrain() {
    this._buildProjection();
    const [minX, minY] = this.bounds[0];
    const [maxX, maxY] = this.bounds[1];
    const w = maxX - minX;
    const h = maxY - minY;

    // 预投影省份到平面坐标，加速点在多边形内判断
    const rawProvinces = this.geoData.features.filter(
      (f) => String(f.properties.adcode) !== "100000_JD"
    );
    const simplify = (ring, step = 4) => {
      const out = [];
      for (let i = 0; i < ring.length; i += step) {
        out.push(ring[i]);
      }
      if (out.length < 4) return ring;
      return out;
    };

    const provinces = rawProvinces.map((f) => {
      const rawRings = extractRings(f.geometry);
      return {
        name: f.properties.name || "",
        rings: rawRings.map((ring) =>
          simplify(ring).map(([lng, lat]) => this.projection([lng, lat]))
        )
      };
    });

    // 构建地形网格
    const geometry = new THREE.PlaneGeometry(w, h, GRID_SEGMENTS_X, GRID_SEGMENTS_Y);
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);
    const count = positions.length / 3;

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      const worldX = x + minX + w / 2;
      const worldZ = z + minY + h / 2;
      let elev = BASE_ELEVATION;
      let color = new THREE.Color(OCEAN_COLOR);

      for (const prov of provinces) {
        let inside = false;
        for (const ring of prov.rings) {
          if (pointInRing(worldX, worldZ, ring)) {
            inside = !inside;
          }
        }
        if (inside) {
          elev = PROVINCE_ELEVATION + (Math.random() - 0.5) * 3;
          color.setHex(hashColor(prov.name));
          color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.06);
          break;
        }
      }

      positions[i * 3 + 1] = elev;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: false,
      side: THREE.DoubleSide
    });

    this.landMesh = new THREE.Mesh(geometry, material);
    this.landMesh.position.set(-(minX + w / 2), 0, -(minY + h / 2));
    this.landMesh.receiveShadow = true;
    this.landMesh.castShadow = true;

    const cx = this.landMesh.position.x;
    const cz = this.landMesh.position.z;
    console.log("[map3d] terrain center:", cx, cz);
    this.scene.add(this.landMesh);

    // 调整相机俯瞰地图中心
    this.controls.target.set(cx, 0, cz);
    this.camera.position.set(cx, 900, cz + 700);
    this.controls.update();

    // 存储地形数据用于后续节点高度查询
    this.terrain = { positions, minX, minY, w, h, segX: GRID_SEGMENTS_X, segY: GRID_SEGMENTS_Y };

    // 添加省份名称标签
    this._buildProvinceLabels(provinces);
  }

  _buildProvinceLabels(provinces) {
    if (this.provinceLabels) {
      this.scene.remove(this.provinceLabels);
    }
    const labelGroup = new THREE.Group();

    const centroid = (rings) => {
      const ring = rings[0];
      let cx = 0, cy = 0, a = 0;
      for (let i = 0; i < ring.length; i++) {
        const [x0, y0] = ring[i];
        const [x1, y1] = ring[(i + 1) % ring.length];
        const cross = x0 * y1 - x1 * y0;
        a += cross;
        cx += (x0 + x1) * cross;
        cy += (y0 + y1) * cross;
      }
      a *= 0.5;
      return [cx / (6 * a), cy / (6 * a)];
    };

    provinces.forEach((prov) => {
      const [cx, cy] = centroid(prov.rings);
      const yElev = this._sampleTerrainHeight(cx, cy) + 16;

      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 32;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "rgba(30,22,17,0.55)";
      ctx.fillRect(0, 0, 128, 32);
      ctx.fillStyle = "#f2e6c9";
      ctx.font = "18px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(prov.name, 64, 16);

      const tex = new THREE.CanvasTexture(c);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.85 });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(cx, yElev, cy);
      sprite.scale.set(40, 10, 1);
      labelGroup.add(sprite);
    });

    this.provinceLabels = labelGroup;
    this.scene.add(labelGroup);
  }

  _buildOcean() {
    const [minX, minY] = this.bounds[0];
    const [maxX, maxY] = this.bounds[1];
    const w = maxX - minX;
    const h = maxY - minY;

    const geometry = new THREE.PlaneGeometry(w * 1.6, h * 1.4, 80, 60);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.MeshStandardMaterial({
      color: OCEAN_COLOR,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75
    });
    this.ocean = new THREE.Mesh(geometry, material);
    this.ocean.position.set(-(minX + w / 2), -2, -(minY + h / 2));
    this.ocean.receiveShadow = true;
    this.scene.add(this.ocean);
  }

  _buildClouds() {
    const count = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1600;
      positions[i * 3 + 1] = Math.random() * 120 + 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1200;
      sizes[i] = Math.random() * 30 + 15;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // 用圆点纹理模拟云雾
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,0.35)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 40,
      map: texture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.clouds = new THREE.Points(geometry, material);
    this.clouds.userData = { speeds: Array(count).fill(0).map(() => Math.random() * 0.15 + 0.05) };
    this.scene.add(this.clouds);
  }

  _sampleTerrainHeight(worldX, worldZ) {
    if (!this.terrain) return PROVINCE_ELEVATION;
    const { minX, minY, w, h, segX, segY, positions } = this.terrain;
    const localX = worldX + (minX + w / 2);
    const localZ = worldZ + (minY + h / 2);
    const gx = (localX / w) * segX;
    const gy = (localZ / h) * segY;
    const ix = Math.floor(gx);
    const iy = Math.floor(gy);
    if (ix < 0 || ix >= segX || iy < 0 || iy >= segY) return 0;
    const idx = (iy * (segX + 1) + ix) * 3;
    return positions[idx + 1];
  }

  setNodes(nodes) {
    // 清除旧节点
    this.nodeMeshes.forEach((m) => this.scene.remove(m));
    this.nodeMeshes = [];
    this.nodes = nodes;

    nodes.forEach((node) => {
      const [x, y] = this.projection([node.lng, node.lat]);
      const z = y;
      const yElev = this._sampleTerrainHeight(x, z) + 4;
      const group = new THREE.Group();
      group.position.set(x, yElev, z);

      // 光柱
      const pillarGeo = new THREE.CylinderGeometry(0.6, 0.6, 28, 16);
      pillarGeo.translate(0, 14, 0);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: 0xd6ab62,
        transparent: true,
        opacity: 0.25
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      group.add(pillar);

      // 节点球
      const sphereGeo = new THREE.SphereGeometry(3.5, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xc0392b,
        emissive: 0x441111,
        roughness: 0.3,
        metalness: 0.4
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.castShadow = true;
      group.add(sphere);

      // 外环
      const ringGeo = new THREE.RingGeometry(5, 6, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xd6ab62,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.5;
      group.add(ring);

      group.userData = { node };
      this.scene.add(group);
      this.nodeMeshes.push(group);
    });
  }

  focusNode(node) {
    const target = this.nodeMeshes.find((g) => g.userData.node === node);
    if (!target) return;
    const pos = target.position;
    this.controls.target.set(pos.x, pos.y, pos.z);
    this.controls.update();
  }

  _showCouplet(node, position) {
    // 移除旧对联
    if (this.coupletGroup) {
      this.scene.remove(this.coupletGroup);
    }

    const group = new THREE.Group();
    group.position.set(position.x, position.y + 120, position.z);

    // 上联
    const upGeo = new THREE.PlaneGeometry(14, 70);
    const upMat = new THREE.MeshStandardMaterial({
      color: 0x8a1c1c,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    const up = new THREE.Mesh(upGeo, upMat);
    up.position.set(-12, -35, 0);
    up.castShadow = true;
    group.add(up);

    // 下联
    const down = new THREE.Mesh(upGeo, upMat.clone());
    down.position.set(12, -35, 0);
    down.castShadow = true;
    group.add(down);

    // 横批
    const hGeo = new THREE.PlaneGeometry(44, 10);
    const hMesh = new THREE.Mesh(hGeo, upMat.clone());
    hMesh.position.set(0, 6, 0);
    group.add(hMesh);

    // 添加文字使用 CanvasTexture（竖排）
    const makeTextTexture = (text, tw, th, fontSize = 24) => {
      const c = document.createElement("canvas");
      c.width = tw;
      c.height = th;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#8a1c1c";
      ctx.fillRect(0, 0, tw, th);
      ctx.fillStyle = "#fff4db";
      ctx.font = `${fontSize}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // 竖排：旋转画布后居中书写
      ctx.save();
      ctx.translate(tw / 2, th / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(text, 0, 0);
      ctx.restore();
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    const upTex = makeTextTexture(node.title, 64, 256, 28);
    up.material.map = upTex;
    up.material.needsUpdate = true;

    const downTex = makeTextTexture(node.location, 64, 256, 24);
    down.material.map = downTex;
    down.material.needsUpdate = true;

    const hTex = makeTextTexture(`${node.year} · ${node.type}`, 256, 48, 24);
    hMesh.material.map = hTex;
    hMesh.material.needsUpdate = true;

    // 动画：从空中垂落
    group.userData = { startY: position.y + 180, endY: position.y + 50, t: 0 };
    group.position.y = group.userData.startY;

    this.scene.add(group);
    this.coupletGroup = group;

    // 6 秒后移除
    setTimeout(() => {
      if (this.coupletGroup === group) {
        this.scene.remove(group);
        this.coupletGroup = null;
      }
    }, 6000);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    if (this.time === 0) console.log("[map3d] first animate frame");
    this.time += 0.01;

    // 缓慢旋转光源营造动态光影
    if (this.sunLight) {
      this.sunLight.position.x = 400 * Math.cos(this.time * 0.2);
      this.sunLight.position.z = 400 * Math.sin(this.time * 0.2) + 300;
    }

    // 云雾飘动
    if (this.clouds) {
      const positions = this.clouds.geometry.attributes.position.array;
      const speeds = this.clouds.userData.speeds;
      for (let i = 0; i < speeds.length; i++) {
        positions[i * 3] += speeds[i];
        if (positions[i * 3] > 800) positions[i * 3] = -800;
      }
      this.clouds.geometry.attributes.position.needsUpdate = true;
    }

    // 节点呼吸光
    this.nodeMeshes.forEach((g, i) => {
      const ring = g.children[2];
      if (ring) {
        const s = 1 + Math.sin(this.time * 2 + i) * 0.15;
        ring.scale.set(s, s, s);
      }
    });

    // 对联垂落动画
    if (this.coupletGroup) {
      const d = this.coupletGroup.userData;
      if (d.t < 1) {
        d.t += 0.02;
        const ease = 1 - Math.pow(1 - d.t, 3);
        this.coupletGroup.position.y = d.startY + (d.endY - d.startY) * ease;
        this.coupletGroup.rotation.y = Math.sin(d.t * Math.PI) * 0.1;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this._animate);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
