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
  ".section-head, .row, .cell, blockquote, .contact-info, .contact-map, .hero-copy, .hero-visual"
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
const panel = document.querySelector(".hero-panel");
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

// ---- Course row / card spotlight follow ----
document.querySelectorAll(".cell, .row").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
  });
});
