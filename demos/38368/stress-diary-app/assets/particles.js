// particles.js — Particle systems and interactive demos for 解压日记
(function() {

  // ============ HERO PARTICLES (background ambient) ============
  function initHeroParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var DPR = window.devicePixelRatio || 1;
    var W = 0, H = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var COLORS = ['#ef5a3d', '#5b6ee0', '#7aa890', '#f0b429', '#28201a'];
    var particles = [];
    var COUNT = 60;
    for (var i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 4 + 1.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: Math.random() * 0.5 + 0.15,
        phase: Math.random() * Math.PI * 2
      });
    }

    var mouseX = -1000, mouseY = -1000;
    canvas.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', function() { mouseX = -1000; mouseY = -1000; });

    var t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.012;

      // soft connecting lines between near particles
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 14000) {
            ctx.strokeStyle = 'rgba(40,32,26,' + (0.06 * (1 - d2 / 14000)).toFixed(3) + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < particles.length; k++) {
        var p = particles[k];
        // mouse repel
        var mdx = p.x - mouseX, mdy = p.y - mouseY;
        var md2 = mdx * mdx + mdy * mdy;
        if (md2 < 10000) {
          var f = (1 - md2 / 10000) * 0.6;
          p.vx += (mdx / Math.sqrt(md2 + 1)) * f;
          p.vy += (mdy / Math.sqrt(md2 + 1)) * f;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        // base float
        p.vx += Math.sin(t + p.phase) * 0.005;
        p.vy += Math.cos(t + p.phase) * 0.005;

        // wrap
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        var pulse = 1 + Math.sin(t * 2 + p.phase) * 0.2;
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fill();

        // glow
        ctx.globalAlpha = p.a * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ============ EMOTION DEMO CANVAS ============
  function initEmotionDemo() {
    var canvas = document.getElementById('demo-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var DPR = window.devicePixelRatio || 1;
    var W = 0, H = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    // emotion profiles
    var profiles = {
      calm: {
        label: 'EMOTION · CALM · 平静',
        count: 50,
        colors: ['#7aa890', '#a8c8b8', '#cfe0d6'],
        speed: 0.3,
        size: [2, 5],
        gravity: 0,
        spread: 'float',
        bg: 'linear-gradient(140deg, #f1f7f3, #e8f0eb)'
      },
      happy: {
        label: 'EMOTION · HAPPY · 愉悦',
        count: 90,
        colors: ['#f0b429', '#ffd66e', '#ef5a3d', '#ffb09a'],
        speed: 1.4,
        size: [2, 6],
        gravity: -0.04,
        spread: 'burst',
        bg: 'linear-gradient(140deg, #fff8e8, #ffe9d8)'
      },
      angry: {
        label: 'EMOTION · ANGRY · 愤怒',
        count: 120,
        colors: ['#ef5a3d', '#c8341c', '#ff8366', '#28201a'],
        speed: 2.4,
        size: [1.5, 4],
        gravity: 0.02,
        spread: 'chaos',
        bg: 'linear-gradient(140deg, #ffe5dd, #ffcfbf)'
      },
      sad: {
        label: 'EMOTION · SAD · 低落',
        count: 70,
        colors: ['#5b6ee0', '#8c98d9', '#bcc4e8', '#28201a'],
        speed: 0.6,
        size: [1, 3],
        gravity: 0.08,
        spread: 'rain',
        bg: 'linear-gradient(140deg, #e6ebf7, #d4dcef)'
      }
    };

    var current = profiles.calm;
    var particles = [];
    var running = true;

    function spawn(n) {
      particles = [];
      for (var i = 0; i < n; i++) particles.push(makeParticle());
    }

    function makeParticle() {
      var sz = current.size;
      var p = {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * (sz[1] - sz[0]) + sz[0],
        c: current.colors[Math.floor(Math.random() * current.colors.length)],
        a: Math.random() * 0.6 + 0.3,
        life: Math.random() * 200 + 100,
        age: 0
      };
      assignVelocity(p);
      return p;
    }

    function assignVelocity(p) {
      var sp = current.speed;
      if (current.spread === 'float') {
        p.vx = (Math.random() - 0.5) * sp;
        p.vy = (Math.random() - 0.5) * sp;
      } else if (current.spread === 'burst') {
        var ang = Math.random() * Math.PI * 2;
        var mag = Math.random() * sp + 0.5;
        p.vx = Math.cos(ang) * mag;
        p.vy = Math.sin(ang) * mag;
      } else if (current.spread === 'chaos') {
        p.vx = (Math.random() - 0.5) * sp * 2;
        p.vy = (Math.random() - 0.5) * sp * 2;
      } else if (current.spread === 'rain') {
        p.vx = (Math.random() - 0.5) * 0.3;
        p.vy = Math.random() * sp + 0.4;
        p.x = Math.random() * W;
        p.y = -10 - Math.random() * 100;
      }
    }

    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += current.gravity;
        p.age++;

        if (current.spread === 'chaos') {
          p.vx += (Math.random() - 0.5) * 0.3;
          p.vy += (Math.random() - 0.5) * 0.3;
        }
        if (current.spread === 'rain' && (p.y > H + 10 || p.x < -10 || p.x > W + 10)) {
          assignVelocity(p);
          continue;
        }

        if (current.spread !== 'rain') {
          if (p.x < -10) p.x = W + 10;
          if (p.x > W + 10) p.x = -10;
          if (p.y < -10) p.y = H + 10;
          if (p.y > H + 10) p.y = -10;
        }

        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = p.a * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(step);
    }

    function setEmotion(name) {
      current = profiles[name] || profiles.calm;
      var label = document.getElementById('emo-label');
      if (label) label.textContent = current.label;
      var demo = canvas.parentElement;
      if (demo) demo.style.background = current.bg;
      spawn(current.count);
    }

    resize();
    window.addEventListener('resize', function() { resize(); spawn(current.count); });
    setEmotion('calm');
    step();

    document.querySelectorAll('.emo-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.emo-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        setEmotion(btn.dataset.emo);
      });
    });
  }

  // ============ PHONE MOOD SWITCHER ============
  window.setPhoneMood = function(mood) {
    var screen = document.getElementById('phone-screen');
    var toast = document.getElementById('comfort-toast');
    if (!screen) return;
    screen.classList.remove('calm', 'angry', 'sad');
    screen.classList.add(mood);

    if (toast) {
      var msgs = {
        calm: '今天的心情就像一片湖，把它写下来，便不再翻涌。',
        angry: '愤怒是因为你在乎，把它写出来的那一刻，你已经比刚才更勇敢了。',
        sad: '今晚就允许自己什么也不做吧，明天的太阳依然会替你升起。'
      };
      toast.textContent = msgs[mood] || msgs.calm;
      toast.classList.remove('show');
      setTimeout(function() { toast.classList.add('show'); }, 80);
    }

    if (mood === 'angry' && navigator.vibrate) {
      try { navigator.vibrate([50, 80, 50]); } catch (e) {}
    }
  };

  // ---- bootstrap ----
  function boot() {
    initHeroParticles();
    initEmotionDemo();
    // Show the initial comfort toast after a short delay
    setTimeout(function() {
      var toast = document.getElementById('comfort-toast');
      if (toast) toast.classList.add('show');
    }, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
