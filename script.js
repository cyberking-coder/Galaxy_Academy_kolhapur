// Year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// ---- Scroll progress bar + nav state + back-to-top ----
const nav = document.getElementById("nav");
const progress = document.getElementById("scrollProgress");
const toTop = document.getElementById("toTop");

function onScroll() {
  const st = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (st / h) * 100 : 0) + "%";
  nav.classList.toggle("scrolled", st > 20);
  toTop.classList.toggle("show", st > 500);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

toTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);

// ---- Mobile menu ----
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  })
);

// ---- Reveal on scroll ----
const revealEls = document.querySelectorAll(
  ".section-head, .feature, .course, .step, blockquote, .contact-info, .contact-map, .hero-copy, .hero-visual, .cta-inner"
);
revealEls.forEach((el, i) => {
  el.classList.add("reveal");
  el.style.setProperty("--d", (i % 6) * 70 + "ms");
});
const revealIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revealIO.unobserve(e.target);
      }
    });
  },
  { threshold: 0.14 }
);
revealEls.forEach((el) => revealIO.observe(el));

// ---- Count-up stats ----
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.dec || "0", 10);
  const suffix = el.dataset.suffix || "";
  const dur = 1500;
  const start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const val = target * (1 - Math.pow(1 - p, 3));
    el.textContent = (dec ? val.toFixed(dec) : Math.round(val)) + suffix;
    if (p < 1) requestAnimationFrame(step);
  })(start);
}
const statIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        countUp(e.target);
        statIO.unobserve(e.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => statIO.observe(el));

// ---- Active nav link highlight ----
const sections = document.querySelectorAll("section[id]");
const linkMap = {};
navLinks.querySelectorAll('a[href^="#"]').forEach((a) => {
  linkMap[a.getAttribute("href").slice(1)] = a;
});
const spyIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        Object.values(linkMap).forEach((a) => a && a.classList.remove("active"));
        const a = linkMap[e.target.id];
        if (a) a.classList.add("active");
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => spyIO.observe(s));

// ---- Hero panel parallax tilt (pointer) ----
const panel = document.querySelector(".hero-card");
const visual = document.querySelector(".hero-visual");
if (panel && visual && window.matchMedia("(pointer:fine)").matches) {
  visual.addEventListener("pointermove", (e) => {
    const r = visual.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
    panel.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  visual.addEventListener("pointerleave", () => {
    panel.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
  });
}

// ---- Reviews slider ----
(function () {
  const track = document.getElementById("revTrack");
  if (!track) return;
  const slides = Array.from(track.children);
  const dotsWrap = document.getElementById("revDots");
  const prev = document.getElementById("revPrev");
  const next = document.getElementById("revNext");
  const slider = document.getElementById("reviewSlider");
  let i = 0;
  let timer;

  const dots = slides.map((_, n) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Go to review " + (n + 1));
    b.addEventListener("click", () => go(n, true));
    dotsWrap.appendChild(b);
    return b;
  });

  function render() {
    track.style.transform = `translateX(${-i * 100}%)`;
    dots.forEach((d, n) => d.classList.toggle("active", n === i));
  }
  function go(n, stop) {
    i = (n + slides.length) % slides.length;
    render();
    if (stop) restart();
  }
  function auto() {
    timer = setInterval(() => go(i + 1), 5000);
  }
  function restart() {
    clearInterval(timer);
    auto();
  }

  next.addEventListener("click", () => go(i + 1, true));
  prev.addEventListener("click", () => go(i - 1, true));
  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", auto);

  // keyboard
  slider.setAttribute("tabindex", "0");
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go(i + 1, true);
    if (e.key === "ArrowLeft") go(i - 1, true);
  });

  // touch swipe
  let x0 = null;
  const vp = slider.querySelector(".slider-viewport");
  vp.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  vp.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), true);
    x0 = null;
  });

  render();
  auto();
})();

// ---- Course row / card spotlight follow ----
document.querySelectorAll(".course").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
  });
});
