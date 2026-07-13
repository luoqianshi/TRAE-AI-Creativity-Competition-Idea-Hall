/* ============================================================
   FormulaLab — Main Interactive Scripts
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Utilities ---------- */
  var dpr = window.devicePixelRatio || 1;

  function setupCanvas(canvas, cssW, cssH) {
    canvas.width  = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
  }

  function drawGrid(ctx, w, h, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    // vertical
    for (var x = w / 2 % 40; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    // horizontal
    for (var y = h / 2 % 40; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }

  function drawAxes(ctx, w, h, color) {
    ctx.strokeStyle = color || 'rgba(232,236,244,0.25)';
    ctx.lineWidth = 1;
    // X axis
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    // Y axis
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
  }

  /* ==========================================================
     1. Hero Sine Wave — Interactive Demo
     ========================================================== */
  var heroCanvas = document.getElementById('hero-canvas');
  var sliderA = document.getElementById('slider-a');
  var sliderW = document.getElementById('slider-w');
  var sliderP = document.getElementById('slider-p');
  var valA = document.getElementById('val-a');
  var valW = document.getElementById('val-w');
  var valP = document.getElementById('val-p');
  var formulaDisplay = document.getElementById('formula-display');

  if (heroCanvas) {
    var heroW = heroCanvas.parentElement.clientWidth - 32; // padding
    if (heroW < 200) heroW = 400;
    var heroH = 200;
    var heroCtx = setupCanvas(heroCanvas, heroW, heroH);

    function drawHeroWave() {
      var a = parseFloat(sliderA.value);
      var omega = parseFloat(sliderW.value);
      var phi = parseFloat(sliderP.value);

      valA.textContent = a.toFixed(1);
      valW.textContent = omega.toFixed(1);
      valP.textContent = phi.toFixed(2);

      formulaDisplay.innerHTML =
        'y = ' + a.toFixed(1) + ' &middot; sin(' + omega.toFixed(1) + ' &middot; x + ' + phi.toFixed(2) + ')';

      var ctx = heroCtx;
      ctx.clearRect(0, 0, heroW, heroH);

      // Grid
      drawGrid(ctx, heroW, heroH, 'rgba(42,53,80,0.25)');
      drawAxes(ctx, heroW, heroH, 'rgba(232,236,244,0.15)');

      // Glow effect
      ctx.shadowColor = '#00e5a0';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#00e5a0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var px = 0; px < heroW; px++) {
        var x = (px - heroW / 2) / 40;
        var y = a * Math.sin(omega * x + phi);
        var py = heroH / 2 - y * 40;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Second wave (ghost trail)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0,180,216,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var px2 = 0; px2 < heroW; px2++) {
        var x2 = (px2 - heroW / 2) / 40;
        var y2 = Math.sin(x2 + phi); // reference sin(x)
        var py2 = heroH / 2 - y2 * 40;
        if (px2 === 0) ctx.moveTo(px2, py2);
        else ctx.lineTo(px2, py2);
      }
      ctx.stroke();
    }

    sliderA.addEventListener('input', drawHeroWave);
    sliderW.addEventListener('input', drawHeroWave);
    sliderP.addEventListener('input', drawHeroWave);

    // Auto-animate omega slightly
    var t = 0;
    function animateWave() {
      t += 0.02;
      // subtle breathing on the ghost line (optional)
      drawHeroWave();
      requestAnimationFrame(animateWave);
    }
    animateWave();

    // Resize handler
    window.addEventListener('resize', function () {
      heroW = heroCanvas.parentElement.clientWidth - 32;
      if (heroW < 200) heroW = 400;
      heroCtx = setupCanvas(heroCanvas, heroW, heroH);
      drawHeroWave();
    });
  }

  /* ==========================================================
     2. Code Sandbox — Tab Switching + Canvas Rendering
     ========================================================== */
  var sandboxTabs = document.querySelectorAll('.sandbox-tab');
  var sandboxCode = document.getElementById('sandbox-code-content');
  var sandboxCanvas = document.getElementById('sandbox-canvas');

  var sandboxExamples = {
    quadratic: {
      code:
        '<span class="cm">// 二次函数: y = ax\u00B2 + bx + c</span>\n' +
        '<span class="kw">const</span> a = <span class="num">1</span>, b = <span class="num">0</span>, c = <span class="num">-2</span>;\n\n' +
        '<span class="kw">function</span> <span class="fn">draw</span>(ctx, w, h) {\n' +
        '  ctx.<span class="fn">clearRect</span>(<span class="num">0</span>, <span class="num">0</span>, w, h);\n' +
        '  <span class="cm">// 绘制坐标轴</span>\n' +
        '  <span class="fn">drawAxes</span>(ctx, w, h);\n' +
        '  <span class="cm">// 绘制抛物线</span>\n' +
        '  ctx.strokeStyle = <span class="str">\'#00e5a0\'</span>;\n' +
        '  ctx.lineWidth = <span class="num">2.5</span>;\n' +
        '  ctx.<span class="fn">beginPath</span>();\n' +
        '  <span class="kw">for</span> (<span class="kw">let</span> px = <span class="num">0</span>; px &lt; w; px++) {\n' +
        '    <span class="kw">const</span> x = (px - w/<span class="num">2</span>) / <span class="num">40</span>;\n' +
        '    <span class="kw">const</span> y = a*x*x + b*x + c;\n' +
        '    <span class="kw">const</span> py = h/<span class="num">2</span> - y * <span class="num">40</span>;\n' +
        '    px === <span class="num">0</span> ? ctx.<span class="fn">moveTo</span>(px, py)\n' +
        '                  : ctx.<span class="fn">lineTo</span>(px, py);\n' +
        '  }\n' +
        '  ctx.<span class="fn">stroke</span>();\n' +
        '}',
      render: function (canvas) {
        var rect = canvas.parentElement;
        var w = rect.clientWidth;
        var h = 280;
        var ctx = setupCanvas(canvas, w, h);
        ctx.clearRect(0, 0, w, h);
        drawGrid(ctx, w, h, 'rgba(42,53,80,0.25)');
        drawAxes(ctx, w, h, 'rgba(232,236,244,0.15)');
        var a = 1, b = 0, c = -2;
        // Draw parabola
        ctx.shadowColor = '#00e5a0';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00e5a0';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (var px = 0; px < w; px++) {
          var x = (px - w / 2) / 40;
          var y = a * x * x + b * x + c;
          var py = h / 2 - y * 40;
          if (px === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Mark vertex
        var vx = -b / (2 * a);
        var vy = a * vx * vx + b * vx + c;
        var vpx = w / 2 + vx * 40;
        var vpy = h / 2 - vy * 40;
        ctx.fillStyle = '#00e5a0';
        ctx.beginPath();
        ctx.arc(vpx, vpy, 5, 0, Math.PI * 2);
        ctx.fill();
        // Label
        ctx.fillStyle = 'rgba(232,236,244,0.7)';
        ctx.font = '12px GeistMono, monospace';
        ctx.fillText('vertex(' + vx.toFixed(1) + ', ' + vy.toFixed(1) + ')', vpx + 10, vpy - 10);
      }
    },
    fourier: {
      code:
        '<span class="cm">// 傅里叶级数: 方波近似</span>\n' +
        '<span class="cm">// f(x) \u2248 (4/\u03C0) \u2211 sin((2k-1)x)/(2k-1)</span>\n\n' +
        '<span class="kw">const</span> N = <span class="num">5</span>; <span class="cm">// 谐波数量</span>\n\n' +
        '<span class="kw">function</span> <span class="fn">draw</span>(ctx, w, h) {\n' +
        '  ctx.<span class="fn">clearRect</span>(<span class="num">0</span>, <span class="num">0</span>, w, h);\n' +
        '  <span class="fn">drawAxes</span>(ctx, w, h);\n\n' +
        '  <span class="cm">// 理想方波 (虚线)</span>\n' +
        '  ctx.setLineDash([<span class="num">4</span>, <span class="num">4</span>]);\n' +
        '  ctx.strokeStyle = <span class="str">\'rgba(139,92,246,0.4)\'</span>;\n' +
        '  ctx.<span class="fn">drawSquareWave</span>(ctx, w, h);\n\n' +
        '  <span class="cm">// 傅里叶近似</span>\n' +
        '  ctx.setLineDash([]);\n' +
        '  ctx.strokeStyle = <span class="str">\'#00b4d8\'</span>;\n' +
        '  ctx.<span class="fn">drawFourier</span>(ctx, w, h, N);\n' +
        '}',
      render: function (canvas) {
        var rect = canvas.parentElement;
        var w = rect.clientWidth;
        var h = 280;
        var ctx = setupCanvas(canvas, w, h);
        var N = 5;
        ctx.clearRect(0, 0, w, h);
        drawGrid(ctx, w, h, 'rgba(42,53,80,0.25)');
        drawAxes(ctx, w, h, 'rgba(232,236,244,0.15)');

        // Ideal square wave (dashed)
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(139,92,246,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (var px = 0; px < w; px++) {
          var x = (px - w / 2) / 30;
          var y = Math.sign(Math.sin(x)) * 1.2;
          var py = h / 2 - y * 50;
          if (px === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Fourier approximation
        ctx.shadowColor = '#00b4d8';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00b4d8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (var px2 = 0; px2 < w; px2++) {
          var x2 = (px2 - w / 2) / 30;
          var y2 = 0;
          for (var k = 1; k <= N; k++) {
            y2 += Math.sin((2 * k - 1) * x2) / (2 * k - 1);
          }
          y2 *= 4 / Math.PI * 1.2;
          var py2 = h / 2 - y2 * 50;
          if (px2 === 0) ctx.moveTo(px2, py2);
          else ctx.lineTo(px2, py2);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Legend
        ctx.fillStyle = 'rgba(139,92,246,0.6)';
        ctx.fillRect(10, 12, 16, 3);
        ctx.fillStyle = 'rgba(232,236,244,0.6)';
        ctx.font = '11px GeistMono, monospace';
        ctx.fillText('Ideal Square Wave', 32, 17);

        ctx.fillStyle = '#00b4d8';
        ctx.fillRect(10, 26, 16, 3);
        ctx.fillStyle = 'rgba(232,236,244,0.6)';
        ctx.fillText('Fourier N=' + N, 32, 31);
      }
    },
    lorenz: {
      code:
        '<span class="cm">// 洛伦兹吸引子</span>\n' +
        '<span class="cm">// dx/dt = \u03C3(y - x)</span>\n' +
        '<span class="cm">// dy/dt = x(\u03C1 - z) - y</span>\n' +
        '<span class="cm">// dz/dt = xy - \u03B2z</span>\n\n' +
        '<span class="kw">const</span> \u03C3 = <span class="num">10</span>, \u03C1 = <span class="num">28</span>, \u03B2 = <span class="num">8/3</span>;\n' +
        '<span class="kw">const</span> dt = <span class="num">0.005</span>, steps = <span class="num">8000</span>;\n\n' +
        '<span class="kw">let</span> x=<span class="num">1</span>, y=<span class="num">1</span>, z=<span class="num">1</span>;\n' +
        '<span class="kw">const</span> pts = [];\n' +
        '<span class="kw">for</span> (<span class="kw">let</span> i=<span class="num">0</span>; i&lt;steps; i++) {\n' +
        '  <span class="cm">// Euler integration</span>\n' +
        '  x += \u03C3*(y-x)*dt;\n' +
        '  y += (x*(\u03C1-z)-y)*dt;\n' +
        '  z += (x*y-\u03B2*z)*dt;\n' +
        '  pts.<span class="fn">push</span>({x, z});\n' +
        '}',
      render: function (canvas) {
        var rect = canvas.parentElement;
        var w = rect.clientWidth;
        var h = 280;
        var ctx = setupCanvas(canvas, w, h);
        ctx.clearRect(0, 0, w, h);
        drawGrid(ctx, w, h, 'rgba(42,53,80,0.15)');

        var sigma = 10, rho = 28, beta = 8 / 3;
        var dt = 0.005;
        var steps = 8000;
        var x = 1, y = 1, z = 1;
        var pts = [];
        for (var i = 0; i < steps; i++) {
          var dx = sigma * (y - x) * dt;
          var dy = (x * (rho - z) - y) * dt;
          var dz = (x * y - beta * z) * dt;
          x += dx; y += dy; z += dz;
          pts.push({ x: x, z: z });
        }

        // Find bounds
        var minX = Infinity, maxX = -Infinity;
        var minZ = Infinity, maxZ = -Infinity;
        for (var j = 0; j < pts.length; j++) {
          if (pts[j].x < minX) minX = pts[j].x;
          if (pts[j].x > maxX) maxX = pts[j].x;
          if (pts[j].z < minZ) minZ = pts[j].z;
          if (pts[j].z > maxZ) maxZ = pts[j].z;
        }
        var padX = (maxX - minX) * 0.1;
        var padZ = (maxZ - minZ) * 0.1;
        minX -= padX; maxX += padX; minZ -= padZ; maxZ += padZ;

        var margin = 30;
        var drawW = w - margin * 2;
        var drawH = h - margin * 2;

        function mapX(v) { return margin + (v - minX) / (maxX - minX) * drawW; }
        function mapZ(v) { return h - margin - (v - minZ) / (maxZ - minZ) * drawH; }

        // Draw with color gradient
        for (var k = 1; k < pts.length; k++) {
          var alpha = 0.15 + 0.85 * (k / pts.length);
          var hue = 160 + (k / pts.length) * 60; // cyan to green
          ctx.strokeStyle = 'hsla(' + hue + ', 90%, 60%, ' + alpha + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mapX(pts[k - 1].x), mapZ(pts[k - 1].z));
          ctx.lineTo(mapX(pts[k].x), mapZ(pts[k].z));
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = 'rgba(232,236,244,0.5)';
        ctx.font = '11px GeistMono, monospace';
        ctx.fillText('Lorenz Attractor (XZ plane, \u03C3=10, \u03C1=28, \u03B2=8/3)', 10, 18);
      }
    }
  };

  var currentTab = 'quadratic';

  function activateTab(tabName) {
    currentTab = tabName;
    // Update tab buttons
    sandboxTabs.forEach(function (tab) {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });
    // Update code
    var ex = sandboxExamples[tabName];
    if (ex && sandboxCode) {
      sandboxCode.innerHTML = ex.code;
    }
    // Render canvas
    if (ex && sandboxCanvas) {
      ex.render(sandboxCanvas);
    }
  }

  sandboxTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateTab(tab.getAttribute('data-tab'));
    });
  });

  // Initial render of sandbox
  if (sandboxCanvas) {
    activateTab('quadratic');
    window.addEventListener('resize', function () {
      var ex = sandboxExamples[currentTab];
      if (ex && sandboxCanvas) {
        ex.render(sandboxCanvas);
      }
    });
  }

  /* ==========================================================
     3. Scroll-triggered fade-in animation
     ========================================================== */
  var animEls = document.querySelectorAll('.pain-card, .feature-card, .value-card, .user-card, .arch-card, .stat-item');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    animEls.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(el);
    });
  }

})();
