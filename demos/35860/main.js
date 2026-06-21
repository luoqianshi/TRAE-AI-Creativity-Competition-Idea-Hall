const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, amount) => start + (end - start) * amount;

const loader = document.querySelector(".loader");
const loaderCube = document.querySelector("[data-loader-cube]");
const tunnel = document.querySelector(".tunnel");
const tunnelScene = document.querySelector("[data-tunnel-scene]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const loaderSteps = [
  { x: 5, y: 4, z: 80, rx: 6, ry: -6.5, rz: 5 },
  { x: -5, y: 2, z: 220, rx: 7, ry: 10, rz: -5 },
  { x: 6, y: 0, z: 360, rx: -1, ry: -30, rz: 5 },
];

const state = {
  scrollProgress: 0,
  targetTiltX: 0,
  targetTiltY: 0,
  targetRoll: 0,
  tiltX: 0,
  tiltY: 0,
  roll: 0,
};

function setLoaderTransform(step, scale) {
  const size = Math.min(window.innerWidth, window.innerHeight);
  loaderCube.style.transform = [
    `translate3d(${(size * step.x) / 100}px, ${(size * step.y) / 100}px, ${(size * step.z) / 100}px)`,
    `rotateX(${step.rx}deg)`,
    `rotateY(${step.ry}deg)`,
    `rotateZ(${step.rz}deg)`,
    `scale(${scale})`,
  ].join(" ");
}

function removeLoader() {
  loader?.remove();
}

function animateLoader() {
  if (!loader || !loaderCube || reduceMotion) {
    removeLoader();
    return;
  }

  const totalDuration = 3000;
  const fadeDuration = 320;
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    const progress = clamp(elapsed / totalDuration, 0, 1);
    const segment = Math.min(loaderSteps.length - 1, Math.floor(progress * loaderSteps.length));
    const localStart = segment / loaderSteps.length;
    const localEnd = (segment + 1) / loaderSteps.length;
    const local = clamp((progress - localStart) / (localEnd - localStart), 0, 1);
    const eased = 0.5 - Math.cos(local * Math.PI) / 2;
    const previous = loaderSteps[Math.max(segment - 1, 0)];
    const current = loaderSteps[segment];
    const interpolated = {
      x: lerp(previous.x, current.x, eased),
      y: lerp(previous.y, current.y, eased),
      z: lerp(previous.z, current.z, eased),
      rx: lerp(previous.rx, current.rx, eased),
      ry: lerp(previous.ry, current.ry, eased),
      rz: lerp(previous.rz, current.rz, eased),
    };

    setLoaderTransform(interpolated, lerp(0.5, 1, progress * progress));

    if (elapsed > totalDuration - fadeDuration) {
      loader.style.opacity = String(1 - (elapsed - (totalDuration - fadeDuration)) / fadeDuration);
    }

    if (elapsed < totalDuration) {
      requestAnimationFrame(frame);
    } else {
      removeLoader();
    }
  }

  requestAnimationFrame(frame);
}

function updateScrollProgress() {
  const rect = tunnel.getBoundingClientRect();
  const max = Math.max(tunnel.offsetHeight - window.innerHeight, 1);
  state.scrollProgress = clamp(-rect.top / max, 0, 1);
}

function updatePointer(event) {
  if (reduceMotion) return;
  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;
  state.targetTiltX = x * 7;
  state.targetTiltY = -y * 6;
  state.targetRoll = x * 2.8;
}

function renderTunnel() {
  state.tiltX = lerp(state.tiltX, state.targetTiltX, 0.08);
  state.tiltY = lerp(state.tiltY, state.targetTiltY, 0.08);
  state.roll = lerp(state.roll, state.targetRoll, 0.08);

  const angle = -state.scrollProgress * 270;
  tunnelScene.style.setProperty("--angle", `${angle + state.tiltX}deg`);
  tunnelScene.style.setProperty("--tilt-y", `${state.tiltY}deg`);
  tunnelScene.style.setProperty("--roll", `${state.roll}deg`);
  tunnelScene.style.setProperty("--edge-opacity", `${clamp(state.scrollProgress * 3, 0, 1)}`);

  requestAnimationFrame(renderTunnel);
}

function initReveals() {
  const elements = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );

  elements.forEach((element) => observer.observe(element));
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
window.addEventListener("pointermove", updatePointer, { passive: true });

updateScrollProgress();
initReveals();
animateLoader();
renderTunnel();
