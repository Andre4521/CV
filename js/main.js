const CATCHPHRASE = "Transformando minério em valor com processo e liderança.";

const catchphraseEl = document.getElementById("catchphrase");
const progressEl = document.getElementById("progress");
const glowEl = document.getElementById("cursorGlow");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const themeToggle = document.getElementById("themeToggle");
const canvas = document.getElementById("neuralCanvas");
const ctx = canvas.getContext("2d");

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggle.setAttribute(
    "aria-label",
    theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"
  );
}

function toggleTheme() {
  setTheme(getTheme() === "light" ? "dark" : "light");
}

function typeCatchphrase(text, speed = 46) {
  let i = 0;
  catchphraseEl.innerHTML = '<span class="typed"></span><span class="cursor"></span>';
  const typed = catchphraseEl.querySelector(".typed");

  const tick = () => {
    typed.textContent = text.slice(0, i);
    i += 1;
    if (i <= text.length) {
      window.setTimeout(tick, speed);
    }
  };

  tick();
}

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressEl.style.width = `${value}%`;
}

function highlightNav() {
  const sections = document.querySelectorAll("section[id]");
  const fromTop = window.scrollY + 110;

  sections.forEach((section) => {
    const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);
    if (!link) return;
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    link.classList.toggle("active", fromTop >= top && fromTop < bottom);
  });
}

function observeReveals() {
  const items = document.querySelectorAll(
    ".timeline-item.reveal, .edu-card.reveal, .lang-card.reveal, .project-card.reveal, .section-head.reveal"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          const meter = entry.target.querySelector(".meter");
          if (meter) {
            const bar = meter.querySelector("span");
            bar.style.width = `${meter.dataset.level}%`;
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  items.forEach((item) => observer.observe(item));
}

const nodes = [];
let width = 0;
let height = 0;

function resizeCanvas() {
  const hero = document.querySelector(".hero");
  width = hero.clientWidth;
  height = hero.clientHeight;
  canvas.width = width;
  canvas.height = height;
}

function createNodes() {
  nodes.length = 0;
  const count = Math.max(28, Math.floor((width * height) / 28000));
  for (let i = 0; i < count; i += 1) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.6,
    });
  }
}

function networkColors() {
  const light = getTheme() === "light";
  return {
    node: light ? "rgba(184, 134, 46, 0.55)" : "rgba(212, 168, 83, 0.55)",
    line: light ? [184, 134, 46] : [232, 146, 58],
  };
}

function drawNetwork() {
  ctx.clearRect(0, 0, width, height);
  const colors = networkColors();

  nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;

    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;

    ctx.beginPath();
    ctx.fillStyle = colors.node;
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140) {
        const [r, g, bl] = colors.line;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${bl}, ${0.18 - dist / 900})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawNetwork);
}

themeToggle.addEventListener("click", toggleTheme);
setTheme(getTheme());

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

window.addEventListener("mousemove", (event) => {
  glowEl.style.opacity = "1";
  glowEl.style.left = `${event.clientX}px`;
  glowEl.style.top = `${event.clientY}px`;
});

window.addEventListener("mouseleave", () => {
  glowEl.style.opacity = "0";
});

window.addEventListener("scroll", () => {
  updateProgress();
  highlightNav();
});

window.addEventListener("resize", () => {
  resizeCanvas();
  createNodes();
});

typeCatchphrase(CATCHPHRASE);
updateProgress();
highlightNav();
observeReveals();
resizeCanvas();
createNodes();
drawNetwork();
