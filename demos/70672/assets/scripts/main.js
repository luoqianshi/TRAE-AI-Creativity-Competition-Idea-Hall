const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: '0px 0px -10% 0px',
  }
);

revealElements.forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
  revealObserver.observe(element);
});

const canvas = document.getElementById('ink-canvas');
const context = canvas.getContext('2d');

let width = 0;
let height = 0;
let particles = [];

const resizeCanvas = () => {
  width = window.innerWidth;
  height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const baseCount = Math.max(36, Math.min(72, Math.floor(width / 24)));
  particles = Array.from({ length: baseCount }, createAmbientParticle);
};

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const createAmbientParticle = () => ({
  x: randomBetween(0, width),
  y: randomBetween(0, height),
  radius: randomBetween(0.6, 2.3),
  alpha: randomBetween(0.08, 0.34),
  speedX: randomBetween(-0.22, 0.22),
  speedY: randomBetween(-0.18, 0.18),
  color:
    Math.random() > 0.55
      ? `rgba(240, 199, 124, ${randomBetween(0.08, 0.28)})`
      : `rgba(122, 142, 190, ${randomBetween(0.04, 0.18)})`,
});

const drawAmbientParticles = () => {
  particles.forEach((particle) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < -30) particle.x = width + 30;
    if (particle.x > width + 30) particle.x = -30;
    if (particle.y < -30) particle.y = height + 30;
    if (particle.y > height + 30) particle.y = -30;

    context.beginPath();
    context.fillStyle = particle.color;
    context.shadowBlur = 12;
    context.shadowColor = particle.color;
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  });
};

const render = () => {
  context.clearRect(0, 0, width, height);
  drawAmbientParticles();
  context.shadowBlur = 0;
  requestAnimationFrame(render);
};

window.addEventListener('resize', resizeCanvas);

resizeCanvas();

render();
