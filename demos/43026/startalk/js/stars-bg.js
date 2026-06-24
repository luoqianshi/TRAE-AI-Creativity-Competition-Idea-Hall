// Animated starfield background
(function() {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStars(n) {
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        speed: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      const alpha = 0.3 + 0.5 * Math.sin(ts * 0.001 * s.speed + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createStars(180); });
  resize();
  createStars(180);
  requestAnimationFrame(draw);
})();
