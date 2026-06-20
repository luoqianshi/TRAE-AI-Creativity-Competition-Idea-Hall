const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -10% 0px",
  }
);

reveals.forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
  observer.observe(el);
});

const header = document.querySelector(".site-header");
const onScroll = () => {
  if (window.scrollY > 12) {
    header?.classList.add("scrolled");
  } else {
    header?.classList.remove("scrolled");
  }
};

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".site-nav a");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isActive);
      });
    });
  },
  {
    threshold: 0.35,
    rootMargin: "-18% 0px -40% 0px",
  }
);

sections.forEach((section) => sectionObserver.observe(section));

const heroStage = document.querySelector(".hero-stage");

if (heroStage) {
  heroStage.addEventListener("mousemove", (event) => {
    const rect = heroStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const tiltX = (x - 0.5) * 5;
    const tiltY = (0.5 - y) * 4;

    heroStage.style.setProperty("--tilt-x", tiltX.toFixed(2));
    heroStage.style.setProperty("--tilt-y", tiltY.toFixed(2));
  });

  heroStage.addEventListener("mouseleave", () => {
    heroStage.style.setProperty("--tilt-x", "0");
    heroStage.style.setProperty("--tilt-y", "0");
  });
}
