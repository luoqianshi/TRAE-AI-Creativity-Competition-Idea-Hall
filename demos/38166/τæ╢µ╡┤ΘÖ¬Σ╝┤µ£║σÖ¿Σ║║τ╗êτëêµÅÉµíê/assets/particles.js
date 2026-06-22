(function () {
  var canvas = document.getElementById('particles');
  if (!canvas) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var width = 0;
  var height = 0;
  var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  var rafId = null;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function hexToRgb(hex) {
    var value = hex.replace('#', '');
    if (value.length === 3) {
      value = value.split('').map(function (char) { return char + char; }).join('');
    }
    var number = parseInt(value, 16);
    return {
      r: (number >> 16) & 255,
      g: (number >> 8) & 255,
      b: number & 255
    };
  }

  function rgba(hex, alpha) {
    var rgb = hexToRgb(hex);
    return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')';
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createParticles();
  }

  function createParticles() {
    var count = reduceMotion ? 28 : Math.min(110, Math.floor((width * height) / 13000));
    particles = [];
    for (var i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        radius: 0.8 + Math.random() * 2.2,
        glow: 0.12 + Math.random() * 0.38,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    var accent = cssVar('--accent');
    var accent2 = cssVar('--accent2');
    var rule = cssVar('--rule');

    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i += 1) {
      var p = particles[i];
      if (!reduceMotion) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.012;
      }

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      var pulse = p.glow + Math.sin(p.phase) * 0.08;
      var fill = i % 3 === 0 ? accent2 : accent;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(fill, Math.max(0.08, pulse));
      ctx.shadowColor = rgba(fill, 0.45);
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    for (var a = 0; a < particles.length; a += 1) {
      for (var b = a + 1; b < particles.length; b += 1) {
        var pa = particles[a];
        var pb = particles[b];
        var dx = pa.x - pb.x;
        var dy = pa.y - pb.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.strokeStyle = rgba(rule, (1 - dist / 130) * 0.32);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (!reduceMotion) {
      rafId = window.requestAnimationFrame(draw);
    }
  }

  window.addEventListener('resize', resize);
  resize();
  draw();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !reduceMotion && !rafId) {
      rafId = window.requestAnimationFrame(draw);
    }
  });
})();
