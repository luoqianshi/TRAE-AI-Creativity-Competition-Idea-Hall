// Stardust Canvas Engine — TRAE AI Creativity Competition
// All particle physics and visual effects computed in real-time
(function() {
  'use strict';

  // ─── Configuration ─────────────────────────────────────────
  var MAX_PARTICLES = 3000;
  var MAX_NEBULAE = 50;
  var MAX_CONSTELLATION_POINTS = 200;
  var BG_STAR_COUNT = 300;

  // ─── State ────────────────────────────────────────────────
  var state = {
    started: false,
    mode: 'nebula',        // nebula | constellation | shooting | gravity
    color: '#00e5a0',
    mouseX: 0,
    mouseY: 0,
    prevMouseX: 0,
    prevMouseY: 0,
    isMouseDown: false,
    isMouseMoving: false,
    particleCount: 0,
    nebulaCount: 0,
    constellationCount: 0,
    particles: [],
    nebulae: [],
    constellationPoints: [],
    constellationLines: [],
    gravityWells: [],
    shootingStars: [],
    bgStars: [],
    frameCount: 0
  };

  // ─── DOM Elements ───────────────────────────────────────────
  var canvas = document.getElementById('stardust-canvas');
  var ctx = canvas.getContext('2d');
  var bgCanvas = document.getElementById('bg-stars');
  var bgCtx = bgCanvas.getContext('2d');
  var cursorGlow = document.getElementById('cursor-glow');
  var welcomeOverlay = document.getElementById('welcome');
  var startBtn = document.getElementById('start-btn');
  var toastEl = document.getElementById('toast');
  var infoModal = document.getElementById('info-modal');
  var closeModal = document.getElementById('close-modal');
  var infoBtn = document.getElementById('info-btn');
  var clearBtn = document.getElementById('clear-btn');
  var screenshotBtn = document.getElementById('screenshot-btn');
  var particleCountEl = document.getElementById('particle-count');
  var nebulaCountEl = document.getElementById('nebula-count');
  var constellationCountEl = document.getElementById('constellation-count');

  // ─── Utility ───────────────────────────────────────────────
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function dist(x1, y1, x2, y2) { return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1,3), 16);
    var g = parseInt(hex.slice(3,5), 16);
    var b = parseInt(hex.slice(5,7), 16);
    return { r: r, g: g, b: b };
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(function() { toastEl.classList.remove('show'); }, 2000);
  }

  // ─── Canvas Setup ───────────────────────────────────────────
  function resizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    bgCanvas.width = window.innerWidth * dpr;
    bgCanvas.height = window.innerHeight * dpr;
    bgCanvas.style.width = window.innerWidth + 'px';
    bgCanvas.style.height = window.innerHeight + 'px';
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBgStars();
  }

  // ─── Background Stars ─────────────────────────────────────
  function initBgStars() {
    state.bgStars = [];
    for (var i = 0; i < BG_STAR_COUNT; i++) {
      state.bgStars.push({
        x: rand(0, window.innerWidth),
        y: rand(0, window.innerHeight),
        r: rand(0.3, 1.8),
        alpha: rand(0.2, 0.8),
        twinkleSpeed: rand(0.005, 0.02),
        twinkleOffset: rand(0, Math.PI * 2)
      });
    }
  }

  function drawBgStars() {
    bgCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    var t = state.frameCount;
    for (var i = 0; i < state.bgStars.length; i++) {
      var s = state.bgStars[i];
      var alpha = s.alpha * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset));
      bgCtx.beginPath();
      bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      bgCtx.fillStyle = 'rgba(200, 210, 255, ' + alpha + ')';
      bgCtx.fill();
    }
  }

  // ─── Particle Class ─────────────────────────────────────────
  function createParticle(x, y, opts) {
    opts = opts || {};
    var rgb = hexToRgb(state.color);
    return {
      x: x,
      y: y,
      vx: opts.vx || rand(-1.5, 1.5),
      vy: opts.vy || rand(-1.5, 1.5),
      life: opts.life || rand(60, 180),
      maxLife: opts.life || rand(60, 180),
      size: opts.size || rand(1, 3.5),
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      alpha: 1,
      decay: opts.decay || rand(0.003, 0.012),
      gravity: opts.gravity || 0,
      friction: opts.friction || 0.99,
      glow: opts.glow || false,
      trail: opts.trail || false,
      trailPoints: []
    };
  }

  // ─── Nebula Mode ──────────────────────────────────────────
  function emitNebulaParticles(x, y) {
    var count = randInt(3, 8);
    for (var i = 0; i < count; i++) {
      if (state.particles.length >= MAX_PARTICLES) break;
      var angle = rand(0, Math.PI * 2);
      var speed = rand(0.3, 2.5);
      var p = createParticle(x + rand(-10, 10), y + rand(-10, 10), {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(80, 200),
        size: rand(1.5, 5),
        decay: rand(0.004, 0.01),
        glow: Math.random() > 0.5,
        trail: Math.random() > 0.6
      });
      state.particles.push(p);
      state.particleCount++;
    }
  }

  // ─── Constellation Mode ───────────────────────────────────
  function addConstellationPoint(x, y) {
    var point = { x: x, y: y, alpha: 1, pulsePhase: 0 };
    state.constellationPoints.push(point);

    // Connect to nearby points
    for (var i = 0; i < state.constellationPoints.length - 1; i++) {
      var prev = state.constellationPoints[i];
      var d = dist(prev.x, prev.y, x, y);
      if (d < 250) {
        state.constellationLines.push({
          x1: prev.x, y1: prev.y,
          x2: x, y2: y,
          alpha: 0,
          maxAlpha: Math.max(0.15, 0.6 - d / 500)
        });
      }
    }

    // Emit sparkle particles
    for (var j = 0; j < 12; j++) {
      if (state.particles.length >= MAX_PARTICLES) break;
      var angle = rand(0, Math.PI * 2);
      var speed = rand(0.5, 2);
      state.particles.push(createParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(30, 80),
        size: rand(0.8, 2),
        decay: rand(0.015, 0.03)
      }));
      state.particleCount++;
    }

    state.constellationCount++;
  }

  // ─── Shooting Star Mode ───────────────────────────────────
  function launchShootingStar(x, y) {
    var angle = rand(-Math.PI * 0.8, -Math.PI * 0.2);
    var speed = rand(8, 18);
    state.shootingStars.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: rand(40, 80),
      maxLife: 80,
      trail: [],
      rgb: hexToRgb(state.color)
    });
  }

  // ─── Gravity Mode ──────────────────────────────────────────
  function addGravityWell(x, y) {
    state.gravityWells.push({
      x: x, y: y,
      strength: rand(0.3, 0.8),
      life: rand(300, 600),
      maxLife: 600,
      pulsePhase: 0
    });

    // Burst particles
    for (var i = 0; i < 20; i++) {
      if (state.particles.length >= MAX_PARTICLES) break;
      var angle = rand(0, Math.PI * 2);
      var speed = rand(2, 5);
      state.particles.push(createParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(100, 200),
        size: rand(1, 3),
        decay: rand(0.005, 0.01),
        glow: true
      }));
      state.particleCount++;
    }
  }

  // ─── Update ────────────────────────────────────────────────
  function update() {
    state.frameCount++;

    // Update particles
    for (var i = state.particles.length - 1; i >= 0; i--) {
      var p = state.particles[i];

      // Apply gravity wells
      for (var g = 0; g < state.gravityWells.length; g++) {
        var well = state.gravityWells[g];
        var dx = well.x - p.x;
        var dy = well.y - p.y;
        var d = Math.max(30, dist(p.x, p.y, well.x, well.y));
        var force = well.strength * 50 / (d * d);
        p.vx += dx / d * force;
        p.vy += dy / d * force;
      }

      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.trail) {
        p.trailPoints.push({ x: p.x, y: p.y, alpha: p.alpha });
        if (p.trailPoints.length > 15) p.trailPoints.shift();
      }

      if (p.life <= 0) {
        state.particles.splice(i, 1);
      }
    }

    // Update shooting stars
    for (var s = state.shootingStars.length - 1; s >= 0; s--) {
      var star = state.shootingStars[s];
      star.trail.push({ x: star.x, y: star.y });
      if (star.trail.length > 30) star.trail.shift();
      star.x += star.vx;
      star.y += star.vy;
      star.vy += 0.05; // slight gravity
      star.life--;
      if (star.life <= 0 || star.x < -50 || star.x > window.innerWidth + 50 || star.y > window.innerHeight + 50) {
        state.shootingStars.splice(s, 1);
      }
    }

    // Update gravity wells
    for (var w = state.gravityWells.length - 1; w >= 0; w--) {
      var well = state.gravityWells[w];
      well.life--;
      well.pulsePhase += 0.05;
      if (well.life <= 0) {
        state.gravityWells.splice(w, 1);
      }
    }

    // Update constellation lines alpha
    for (var l = 0; l < state.constellationLines.length; l++) {
      var line = state.constellationLines[l];
      if (line.alpha < line.maxAlpha) {
        line.alpha = Math.min(line.maxAlpha, line.alpha + 0.02);
      }
    }

    // Update constellation point pulse
    for (var c = 0; c < state.constellationPoints.length; c++) {
      state.constellationPoints[c].pulsePhase += 0.03;
    }

    // Nebula mode: continuous emission while mouse moves
    if (state.isMouseMoving && state.mode === 'nebula') {
      emitNebulaParticles(state.mouseX, state.mouseY);
    }

    // Random ambient shooting stars
    if (Math.random() < 0.003) {
      var sx = rand(0, window.innerWidth);
      var sy = rand(0, window.innerHeight * 0.3);
      var angle = rand(0.2, 0.8);
      var spd = rand(6, 12);
      state.shootingStars.push({
        x: sx, y: sy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: rand(30, 60),
        maxLife: 60,
        trail: [],
        rgb: { r: 200, g: 220, b: 255 }
      });
    }

    // Update stats
    particleCountEl.textContent = state.particles.length;
    nebulaCountEl.textContent = state.nebulaCount;
    constellationCountEl.textContent = state.constellationCount;
  }

  // ─── Draw ──────────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Draw gravity wells
    for (var w = 0; w < state.gravityWells.length; w++) {
      var well = state.gravityWells[w];
      var wellAlpha = (well.life / well.maxLife) * 0.3;
      var pulse = 1 + 0.2 * Math.sin(well.pulsePhase);
      var rgb = hexToRgb(state.color);

      // Concentric rings
      for (var ring = 1; ring <= 3; ring++) {
        var radius = ring * 40 * pulse;
        ctx.beginPath();
        ctx.arc(well.x, well.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (wellAlpha / ring) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Center glow
      var grad = ctx.createRadialGradient(well.x, well.y, 0, well.x, well.y, 30 * pulse);
      grad.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + wellAlpha + ')');
      grad.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0)');
      ctx.beginPath();
      ctx.arc(well.x, well.y, 30 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Draw constellation lines
    for (var l = 0; l < state.constellationLines.length; l++) {
      var line = state.constellationLines[l];
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      var rgb = hexToRgb(state.color);
      ctx.strokeStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + line.alpha + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw constellation points
    for (var c = 0; c < state.constellationPoints.length; c++) {
      var cp = state.constellationPoints[c];
      var pulse = 1 + 0.3 * Math.sin(cp.pulsePhase);
      var rgb = hexToRgb(state.color);

      // Outer glow
      var grad = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, 12 * pulse);
      grad.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.6)');
      grad.addColorStop(0.5, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.15)');
      grad.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0)');
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 12 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
    }

    // Draw particles
    for (var i = 0; i < state.particles.length; i++) {
      var p = state.particles[i];

      // Trail
      if (p.trail && p.trailPoints.length > 1) {
        for (var t = 0; t < p.trailPoints.length - 1; t++) {
          var tp = p.trailPoints[t];
          var trailAlpha = (t / p.trailPoints.length) * p.alpha * 0.4;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + trailAlpha + ')';
          ctx.fill();
        }
      }

      // Glow effect
      if (p.glow) {
        var glowSize = p.size * 4;
        var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        grad.addColorStop(0, 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + (p.alpha * 0.3) + ')');
        grad.addColorStop(1, 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Core particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + p.alpha + ')';
      ctx.fill();
    }

    // Draw shooting stars
    for (var s = 0; s < state.shootingStars.length; s++) {
      var star = state.shootingStars[s];
      var starAlpha = star.life / star.maxLife;

      // Trail
      if (star.trail.length > 1) {
        for (var t = 0; t < star.trail.length - 1; t++) {
          var tp = star.trail[t];
          var trailAlpha = (t / star.trail.length) * starAlpha * 0.6;
          var trailSize = (t / star.trail.length) * 2;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, trailSize, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + star.rgb.r + ',' + star.rgb.g + ',' + star.rgb.b + ',' + trailAlpha + ')';
          ctx.fill();
        }
      }

      // Head
      ctx.beginPath();
      ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + starAlpha + ')';
      ctx.fill();

      // Head glow
      var grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 15);
      grad.addColorStop(0, 'rgba(' + star.rgb.r + ',' + star.rgb.g + ',' + star.rgb.b + ',' + (starAlpha * 0.5) + ')');
      grad.addColorStop(1, 'rgba(' + star.rgb.r + ',' + star.rgb.g + ',' + star.rgb.b + ',0)');
      ctx.beginPath();
      ctx.arc(star.x, star.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // ─── Animation Loop ───────────────────────────────────────
  function animate() {
    if (state.started) {
      update();
      draw();
      if (state.frameCount % 3 === 0) drawBgStars();
    }
    requestAnimationFrame(animate);
  }

  // ─── Event Handlers ───────────────────────────────────────
  function handleMouseMove(e) {
    state.prevMouseX = state.mouseX;
    state.prevMouseY = state.mouseY;
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    state.isMouseMoving = true;

    // Update cursor glow
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';

    // Update cursor glow color
    var rgb = hexToRgb(state.color);
    cursorGlow.style.background = 'radial-gradient(circle, rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.08) 0%, transparent 70%)';

    clearTimeout(state.moveTimeout);
    state.moveTimeout = setTimeout(function() { state.isMouseMoving = false; }, 100);
  }

  function handleMouseDown(e) {
    state.isMouseDown = true;
    var x = e.clientX;
    var y = e.clientY;

    if (state.mode === 'constellation') {
      addConstellationPoint(x, y);
    } else if (state.mode === 'shooting') {
      launchShootingStar(x, y);
    } else if (state.mode === 'gravity') {
      addGravityWell(x, y);
    } else if (state.mode === 'nebula') {
      // Burst effect on click
      for (var i = 0; i < 30; i++) {
        if (state.particles.length >= MAX_PARTICLES) break;
        var angle = rand(0, Math.PI * 2);
        var speed = rand(1, 5);
        state.particles.push(createParticle(x, y, {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: rand(60, 150),
          size: rand(2, 6),
          decay: rand(0.005, 0.015),
          glow: true,
          trail: true
        }));
        state.particleCount++;
      }
      state.nebulaCount++;
    }
  }

  function handleMouseUp() {
    state.isMouseDown = false;
  }

  function handleTouchMove(e) {
    e.preventDefault();
    var touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }

  function handleTouchStart(e) {
    e.preventDefault();
    var touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
  }

  function handleTouchEnd(e) {
    handleMouseUp();
  }

  // ─── UI Controls ──────────────────────────────────────────
  function setupControls() {
    // Start button
    startBtn.addEventListener('click', function() {
      state.started = true;
      welcomeOverlay.classList.add('hidden');
      showToast('欢迎来到星尘画布，移动鼠标开始创造');
    });

    // Mode buttons
    var modeBtns = document.querySelectorAll('[data-mode]');
    modeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        modeBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.mode = btn.getAttribute('data-mode');
        var modeNames = {
          nebula: '星云笔刷',
          constellation: '星座连线',
          shooting: '流星雨',
          gravity: '引力场'
        };
        showToast('已切换到 ' + modeNames[state.mode] + ' 模式');
      });
    });

    // Color dots
    var colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        colorDots.forEach(function(d) { d.classList.remove('active'); });
        dot.classList.add('active');
        state.color = dot.getAttribute('data-color');
      });
    });

    // Clear button
    clearBtn.addEventListener('click', function() {
      state.particles = [];
      state.constellationPoints = [];
      state.constellationLines = [];
      state.gravityWells = [];
      state.shootingStars = [];
      state.particleCount = 0;
      state.nebulaCount = 0;
      state.constellationCount = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      showToast('画布已清空');
    });

    // Screenshot button
    screenshotBtn.addEventListener('click', function() {
      // Create a composite canvas for screenshot
      var shotCanvas = document.createElement('canvas');
      shotCanvas.width = window.innerWidth * 2;
      shotCanvas.height = window.innerHeight * 2;
      var shotCtx = shotCanvas.getContext('2d');
      shotCtx.setTransform(2, 0, 0, 2, 0, 0);

      // Draw background
      shotCtx.fillStyle = '#050510';
      shotCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw bg stars
      shotCtx.drawImage(bgCanvas, 0, 0, window.innerWidth, window.innerHeight);

      // Draw main canvas
      shotCtx.drawImage(canvas, 0, 0, window.innerWidth, window.innerHeight);

      // Add watermark
      shotCtx.font = '14px "Outfit", sans-serif';
      shotCtx.fillStyle = 'rgba(106, 106, 138, 0.5)';
      shotCtx.textAlign = 'right';
      shotCtx.fillText('Stardust Canvas · TRAE AI Creativity Competition', window.innerWidth - 20, window.innerHeight - 16);

      // Download
      var link = document.createElement('a');
      link.download = 'stardust-canvas-' + Date.now() + '.png';
      link.href = shotCanvas.toDataURL('image/png');
      link.click();
      showToast('截图已保存');
    });

    // Info modal
    infoBtn.addEventListener('click', function() {
      infoModal.classList.add('show');
    });
    closeModal.addEventListener('click', function() {
      infoModal.classList.remove('show');
    });
    infoModal.addEventListener('click', function(e) {
      if (e.target === infoModal) infoModal.classList.remove('show');
    });
  }

  // ─── Keyboard Shortcuts ───────────────────────────────────
  function setupKeyboard() {
    document.addEventListener('keydown', function(e) {
      switch(e.key) {
        case '1': document.querySelector('[data-mode="nebula"]').click(); break;
        case '2': document.querySelector('[data-mode="constellation"]').click(); break;
        case '3': document.querySelector('[data-mode="shooting"]').click(); break;
        case '4': document.querySelector('[data-mode="gravity"]').click(); break;
        case 'c': case 'C': clearBtn.click(); break;
        case 's': case 'S': if (e.ctrlKey || e.metaKey) { e.preventDefault(); screenshotBtn.click(); } break;
        case 'Escape': infoModal.classList.remove('show'); break;
      }
    });
  }

  // ─── Init ─────────────────────────────────────────────────
  function init() {
    resizeCanvas();
    initBgStars();
    drawBgStars();
    setupControls();
    setupKeyboard();

    window.addEventListener('resize', function() {
      resizeCanvas();
      initBgStars();
    });

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    animate();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
