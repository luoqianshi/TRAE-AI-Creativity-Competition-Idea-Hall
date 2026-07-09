import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

initHeroCane();
initRouteReplay();

const revealElements = document.querySelectorAll(".reveal");
const numberElements = document.querySelectorAll(".data-number");
const cursorGlow = document.querySelector(".cursor-glow");

if (prefersReducedMotion) {
  revealElements.forEach((element) => element.classList.add("revealed"));
  numberElements.forEach((element) => {
    element.textContent = `${element.dataset.target}${element.dataset.suffix || ""}`;
  });
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach((element) => revealObserver.observe(element));

  const numberObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        numberObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.45 });

  numberElements.forEach((element) => numberObserver.observe(element));
}

function initHeroCane() {
  const canvas = document.querySelector("#hero-cane-canvas");

  if (!canvas) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0.1, 0.22, 9.15);
  camera.lookAt(-0.48, -0.32, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance"
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  const renderPass = new RenderPass(scene, camera);
  bloomComposer.addPass(renderPass);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(1, 1),
    1.08,
    0.54,
    0.48
  );
  bloomComposer.addPass(bloomPass);

  const bloomCompositeScene = new THREE.Scene();
  const bloomCompositeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const bloomCompositeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tBloom: { value: null }
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;

      uniform sampler2D tBloom;
      varying vec2 vUv;

      void main() {
        vec3 bloom = texture2D(tBloom, vUv).rgb;
        float alpha = clamp(max(max(bloom.r, bloom.g), bloom.b) * 0.96, 0.0, 0.94);
        gl_FragColor = vec4(bloom, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false
  });
  const bloomCompositeQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bloomCompositeMaterial);
  bloomCompositeScene.add(bloomCompositeQuad);

  const cane = new THREE.Group();
  cane.scale.setScalar(0.58);
  cane.rotation.z = -0.07;
  cane.rotation.y = -0.08;
  cane.position.y = 0.58;
  scene.add(cane);

  const carbonFiberTexture = createCarbonFiberTexture();
  carbonFiberTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const matteHandle = new THREE.MeshStandardMaterial({
    color: 0xd4d8cf,
    map: carbonFiberTexture,
    bumpMap: carbonFiberTexture,
    bumpScale: 0.034,
    metalness: 0.07,
    roughness: 0.58
  });
  const handleInset = new THREE.MeshStandardMaterial({
    color: 0x454843,
    metalness: 0.03,
    roughness: 0.94
  });
  const handleStatus = new THREE.MeshStandardMaterial({
    color: 0x32f08c,
    emissive: 0x32f08c,
    emissiveIntensity: 4.2,
    metalness: 0,
    roughness: 0.32
  });
  const handleStatusGlow = new THREE.MeshBasicMaterial({
    color: 0x32f08c,
    transparent: true,
    opacity: 0.46,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const shaftMetal = new THREE.MeshStandardMaterial({
    color: 0xb7c0b9,
    metalness: 0.92,
    roughness: 0.16
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: 0x070909,
    metalness: 0.2,
    roughness: 0.5
  });
  const handleLength = 3.7;
  const attachX = -0.72;
  const handleY = 1.7;

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, handleLength, 48), matteHandle);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, handleY, 0);
  cane.add(handle);

  const leftCap = new THREE.Mesh(new THREE.SphereGeometry(0.185, 32, 16), matteHandle);
  leftCap.scale.set(1, 1, 0.82);
  leftCap.position.set(-handleLength / 2, handleY, 0);
  cane.add(leftCap);

  const rightCap = new THREE.Mesh(new THREE.SphereGeometry(0.205, 32, 16), matteHandle);
  rightCap.scale.set(1, 1, 0.82);
  rightCap.position.set(handleLength / 2, handleY, 0);
  cane.add(rightCap);

  const shaftLength = 6.1;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.12, shaftLength, 44), shaftMetal);
  shaft.position.set(attachX, -1.35, 0);
  cane.add(shaft);

  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.34, 36), rubber);
  tip.position.set(attachX, -4.56, 0);
  cane.add(tip);

  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.12, 48), rubber);
  foot.position.set(attachX, -4.82, 0);
  cane.add(foot);

  const controlPill = new THREE.Group();
  controlPill.position.set(0.48, handleY + 0.12, 0.162);
  cane.add(controlPill);

  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.052, 0.026), handleInset);
  controlPill.add(panel);

  [-0.29, 0.29].forEach((x) => {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.034, 24, 12), handleInset);
    cap.scale.set(1.05, 0.78, 0.34);
    cap.position.set(x, 0, 0);
    controlPill.add(cap);
  });

  const statusHalo = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.038, 0.006), handleStatusGlow);
  statusHalo.position.set(-0.02, 0.003, 0.019);
  controlPill.add(statusHalo);

  const statusLight = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.012, 0.016), handleStatus);
  statusLight.position.set(-0.02, 0.003, 0.024);
  controlPill.add(statusLight);

  scene.add(new THREE.AmbientLight(0xd9d8d2, 0.54));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
  keyLight.position.set(2.2, 3.6, 3.6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
  rimLight.position.set(-2.8, 1.8, 2.4);
  scene.add(rimLight);

  const warmLight = new THREE.PointLight(0xd7b58a, 1.0, 7);
  warmLight.position.set(2.4, 0.2, 2.2);
  scene.add(warmLight);

  const mouseLight = new THREE.PointLight(0xffffff, 5.6, 13, 2);
  mouseLight.position.set(0, 0.8, 3.2);
  scene.add(mouseLight);

  const mouseWorld = new THREE.Vector3(0, 0.8, 3.2);
  const mouseTarget = new THREE.Vector3(0, 0.8, 3.2);
  const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2.6);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(0, 0);
  const modelTilt = new THREE.Vector2(0, 0);
  const modelTiltTarget = new THREE.Vector2(0, 0);

  const updatePointer = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    modelTiltTarget.set(pointer.x, pointer.y);

    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(mousePlane, mouseTarget);
  };

  const onPointerMove = (event) => {
    updatePointer(event.clientX, event.clientY);
  };

  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  const resize = () => {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    bloomComposer.setSize(width, height);
    bloomPass.setSize(width, height);
  };

  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();

  const render = () => {
    const elapsed = clock.getElapsedTime();
    const motion = prefersReducedMotion ? 0 : 1;
    const entryProgress = prefersReducedMotion ? 1 : Math.min(elapsed / 1.85, 1);
    const entryEase = 1 - Math.pow(1 - entryProgress, 3);
    const entryRest = 1 - entryEase;
    modelTilt.lerp(modelTiltTarget, prefersReducedMotion ? 0.08 : 0.075);
    cane.rotation.x = -0.12 * entryRest + modelTilt.y * 0.035 * motion * entryEase;
    cane.rotation.y =
      -0.1 +
      0.32 * entryRest +
      Math.sin(elapsed * 0.35) * 0.055 * motion * entryEase +
      modelTilt.x * 0.12 * motion * entryEase;
    cane.rotation.z = -0.07 - 0.18 * entryRest - modelTilt.x * 0.018 * motion * entryEase;
    cane.position.y = 0.58 + 2.2 * entryRest + Math.sin(elapsed * 0.8) * 0.025 * motion * entryEase;
    mouseWorld.lerp(mouseTarget, prefersReducedMotion ? 0.18 : 0.12);
    mouseLight.position.copy(mouseWorld);
    mouseLight.intensity = prefersReducedMotion ? 2.8 : 5.2 + Math.sin(elapsed * 3.2) * 0.28;
    bloomComposer.render();
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);
    bloomCompositeMaterial.uniforms.tBloom.value = bloomComposer.readBuffer.texture;
    renderer.autoClear = false;
    renderer.render(bloomCompositeScene, bloomCompositeCamera);
    renderer.autoClear = true;
    requestAnimationFrame(render);
  };

  render();
}

function createCarbonFiberTexture() {
  const size = 192;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  context.fillStyle = "#252923";
  context.fillRect(0, 0, size, size);

  for (let y = -size; y < size * 2; y += 18) {
    const gradientA = context.createLinearGradient(0, y, size, y + size);
    gradientA.addColorStop(0, "rgba(255,255,255,0.035)");
    gradientA.addColorStop(0.45, "rgba(255,255,255,0.22)");
    gradientA.addColorStop(0.55, "rgba(0,0,0,0.28)");
    gradientA.addColorStop(1, "rgba(255,255,255,0.04)");
    context.strokeStyle = gradientA;
    context.lineWidth = 9;
    context.beginPath();
    context.moveTo(-size, y);
    context.lineTo(size * 2, y + size * 1.25);
    context.stroke();

    const gradientB = context.createLinearGradient(size, y, 0, y + size);
    gradientB.addColorStop(0, "rgba(0,0,0,0.28)");
    gradientB.addColorStop(0.48, "rgba(255,255,255,0.18)");
    gradientB.addColorStop(0.62, "rgba(255,255,255,0.04)");
    gradientB.addColorStop(1, "rgba(0,0,0,0.24)");
    context.strokeStyle = gradientB;
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(size * 2, y);
    context.lineTo(-size, y + size * 1.18);
    context.stroke();
  }

  context.globalCompositeOperation = "lighter";
  for (let y = -size; y < size * 2; y += 24) {
    context.strokeStyle = "rgba(220, 232, 218, 0.22)";
    context.lineWidth = 2.2;
    context.beginPath();
    context.moveTo(-size, y + 5);
    context.lineTo(size * 2, y + size * 1.25 + 5);
    context.stroke();

    context.strokeStyle = "rgba(210, 220, 208, 0.14)";
    context.lineWidth = 1.6;
    context.beginPath();
    context.moveTo(size * 2, y + 13);
    context.lineTo(-size, y + size * 1.18 + 13);
    context.stroke();
  }
  context.globalCompositeOperation = "source-over";

  context.globalAlpha = 0.26;
  for (let x = 0; x < size; x += 12) {
    context.fillStyle = x % 24 === 0 ? "#2f332e" : "#161814";
    context.fillRect(x, 0, 5, size);
  }
  context.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5.8, 1.9);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function animateNumber(element) {
  const target = Number(element.dataset.target || 0);
  const suffix = element.dataset.suffix || "";
  const duration = 1800;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const value = Math.round(target * eased);
    element.textContent = `${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = `${target}${suffix}`;
    }
  };

  requestAnimationFrame(tick);
}

function initRouteReplay() {
  const replayItems = document.querySelectorAll(".replay-item");
  const title = document.querySelector("[data-replay-title]");
  const copy = document.querySelector("[data-replay-copy]");

  if (!replayItems.length || !title || !copy) {
    return;
  }

  replayItems.forEach((item) => {
    item.addEventListener("click", () => {
      replayItems.forEach((button) => button.classList.remove("is-active"));
      item.classList.add("is-active");
      title.textContent = item.dataset.title || "";
      copy.textContent = item.dataset.copy || "";
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  });
});

let ticking = false;

window.addEventListener("scroll", () => {
  if (ticking || prefersReducedMotion) {
    return;
  }

  ticking = true;
  requestAnimationFrame(() => {
    document.documentElement.style.setProperty("--scroll-y", String(window.scrollY));
    ticking = false;
  });
}, { passive: true });

if (cursorGlow && window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion) {
  document.addEventListener("mousemove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
    cursorGlow.style.opacity = "1";
  });

  document.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
  });
}
