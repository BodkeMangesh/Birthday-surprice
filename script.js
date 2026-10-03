/* =====================================================
   BIRTHDAY SURPRISE: script.js
   Change ONLY the config below to personalize the site.
   ===================================================== */

const birthdayConfig = {
  friendName: "Sadhnn", // <-- her name goes here
  birthday: "2026-10-04", // YYYY-MM-DD
  musicVolume: 0.25, // 0.2 – 0.3 is soft background level

  photos: [
    "assets/photos/photo1.jpg",
    "assets/photos/photo2.jpg",
    "assets/photos/photo3.jpg",
    "assets/photos/photo4.jpg",
    "assets/photos/photo5.jpg",
    "assets/photos/photo6.jpg",
  ],

  captions: [
    "That smile ❤️",
    "One beautiful memory.",
    "A moment worth keeping.",
    "Just being you.",
    "Another little memory.",
    "Always unforgettable.",
  ],
};

/* ---------- Small helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function escapeHTML(text) {
  return text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
// Replace {name} in any text with the friend's name
function fillName(text) {
  return text.split("{name}").join(birthdayConfig.friendName);
}

function lockScroll() {
  document.body.classList.add("is-locked");
}
function unlockScroll() {
  document.body.classList.remove("is-locked");
}

/* ---------- Apply the config to the page ---------- */
function applyConfig() {
  const { friendName, photos, captions } = birthdayConfig;
  document.title = `A Birthday Surprise for ${friendName}`;

  // Every <span data-name> shows her name
  $$("[data-name]").forEach((el) => (el.textContent = friendName));

  // Intro + final lines that contain {name}
  $$(".intro-line, .final-line").forEach((el) => {
    el.innerHTML = el.innerHTML.split("{name}").join(escapeHTML(friendName));
  });

  // Gallery photos and captions come from the config
  $$(".polaroid").forEach((card, i) => {
    const img = $("img", card);
    img.src = photos[i] || img.src;
    img.alt = `Photo ${i + 1} of ${friendName}`;
    $("figcaption", card).textContent = captions[i] || "";
    $(".polaroid-btn", card).setAttribute("aria-label", `Open photo ${i + 1}`);
  });
}

/* =====================================================
   GATE: locked countdown shown before the birthday
   Before birthdayConfig.birthday, this is ALL the visitor sees.
   ===================================================== */
let gateTimer = null;

function initGate() {
  const target = new Date(`${birthdayConfig.birthday}T00:00:00`);
  if (target - new Date() <= 0) {
    // Already her birthday (or later): skip straight to the wishes popup
    $("#gate").hidden = true;
    showTease();
    return;
  }
  runGateCountdown(target);
}

function runGateCountdown(target) {
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    const diff = target - new Date();
    if (diff <= 0) {
      clearInterval(gateTimer);
      const gate = $("#gate");
      gate.style.transition = "opacity 0.8s ease";
      gate.style.opacity = "0";
      setTimeout(() => {
        gate.hidden = true;
        showTease();
      }, 800);
      return;
    }
    $("#gate-days").textContent = pad(Math.floor(diff / 86400000));
    $("#gate-hours").textContent = pad(Math.floor(diff / 3600000) % 24);
    $("#gate-minutes").textContent = pad(Math.floor(diff / 60000) % 60);
    $("#gate-seconds").textContent = pad(Math.floor(diff / 1000) % 60);
  }
  tick();
  gateTimer = setInterval(tick, 1000);
}

/* =====================================================
   TEASE: midnight wishes popup
   ===================================================== */
function showTease() {
  $("#tease").hidden = false;
  createHearts(10);
}

function initTease() {
  $("#tease-continue").addEventListener("click", () => {
    $("#tease").hidden = true;
    $("#promise").hidden = false;
  });
}

/* =====================================================
   PROMISE: playful yes/no question before the surprise opens
   "No" dodges away so it can never actually be pressed.
   ===================================================== */
function initPromise() {
  const noBtn = $("#promise-no");
  const hint = $("#promise-hint");
  const dodgeLines = [
    "Nice try 😏",
    "Nope, try again 😄",
    "Not happening 😆",
    "So close! (not really)",
    "Keep trying 💕",
  ];

  function dodgeNo() {
    const margin = 56;
    const maxX = Math.max(
      margin,
      window.innerWidth - noBtn.offsetWidth - margin,
    );
    const maxY = Math.max(
      margin,
      window.innerHeight - noBtn.offsetHeight - margin,
    );
    noBtn.classList.add("is-dodging");
    noBtn.style.left = `${rand(margin, maxX)}px`;
    noBtn.style.top = `${rand(margin, maxY)}px`;
    hint.textContent = pick(dodgeLines);
  }

  // Desktop: dodges the moment the cursor gets near it.
  noBtn.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "touch") dodgeNo();
  });
  // Mobile: dodges on the very first touch, so the tap never lands.
  noBtn.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      dodgeNo();
    },
    { passive: false },
  );
  // Safety net in case a click ever slips through.
  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    dodgeNo();
  });

  $("#promise-yes").addEventListener("click", () => {
    $("#promise").hidden = true;
    initOpening(); // the surprise itself only begins now
  });
}

/* =====================================================
   SECTION 1: OPENING (typewriter)
   ===================================================== */
function startTypewriter(el, text, speed = 55) {
  return new Promise((resolve) => {
    const chars = Array.from(text); // Array.from keeps emojis intact
    if (reduceMotion) {
      el.textContent = text;
      return resolve();
    }
    el.textContent = "";
    el.classList.add("is-typing");
    let i = 0;
    (function typeNext() {
      if (i < chars.length) {
        el.textContent += chars[i++];
        setTimeout(typeNext, speed);
      } else {
        el.classList.remove("is-typing");
        resolve();
      }
    })();
  });
}

async function initOpening() {
  $("#opening").hidden = false;
  await sleep(700);
  for (const line of $$("#opening .type-line")) {
    await startTypewriter(line, fillName(line.dataset.text));
    await sleep(800);
  }
  $(".opening-cta").hidden = false; // shows "Open Your Surprise" button
}

/* =====================================================
   SECTION 2: INTRO SEQUENCE (about 20 seconds)
   ===================================================== */
let introTimers = [];
let introEnded = false;

function initIntro() {
  $("#open-surprise").addEventListener("click", startIntroSequence);
  $("#skip-intro").addEventListener("click", endIntro);
}

function startIntroSequence() {
  $("#opening").hidden = true;
  $("#intro").hidden = false;
  startAmbientHearts();

  let lastEnd = 0;
  $$(".intro-line").forEach((line) => {
    const start = Number(line.dataset.start) * 1000;
    const end = Number(line.dataset.end) * 1000;
    lastEnd = Math.max(lastEnd, end);
    introTimers.push(setTimeout(() => line.classList.add("is-active"), start));
    introTimers.push(setTimeout(() => line.classList.remove("is-active"), end));
  });
  introTimers.push(setTimeout(endIntro, lastEnd));
}

function endIntro() {
  if (introEnded) return;
  introEnded = true;
  introTimers.forEach(clearTimeout);
  introTimers = [];

  const intro = $("#intro");
  intro.style.transition = "opacity 0.8s ease";
  intro.style.opacity = "0";
  setTimeout(() => {
    intro.hidden = true;
    showSite();
  }, 800);
}

// Reveals the main website, nav and music button
function showSite() {
  $("#opening").hidden = true;
  $("#site").hidden = false;
  $("#floating-nav").hidden = false;
  $("#music-btn").hidden = false;
  unlockScroll();
  window.scrollTo(0, 0);
  initScrollReveal();
  initNav();
  createHearts(12);
}

/* =====================================================
   SCROLL REVEAL + NAVIGATION
   ===================================================== */
function initScrollReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  items.forEach((el) => observer.observe(el));
}

function initNav() {
  const links = $$("#floating-nav a");
  // Smooth scroll on click
  links.forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = $(link.getAttribute("href"));
      if (target)
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }),
  );
  // Highlight the section currently on screen
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) =>
          l.classList.toggle(
            "is-current",
            l.getAttribute("href") === `#${entry.target.id}`,
          ),
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  $$("#site .section").forEach((s) => observer.observe(s));
}

/* =====================================================
   SECTION 3: GALLERY + LIGHTBOX
   ===================================================== */
let currentPhoto = 0;
let lastFocused = null;

function initGallery() {
  $$(".polaroid-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      openLightbox(Number(btn.closest(".polaroid").dataset.index)),
    );
  });
  $("#lb-close").addEventListener("click", closeLightbox);
  $("#lb-next").addEventListener("click", showNextPhoto);
  $("#lb-prev").addEventListener("click", showPreviousPhoto);

  const lb = $("#lightbox");
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  }); // click outside photo

  // Keyboard: Esc, arrows, Tab stays inside the lightbox
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNextPhoto();
    if (e.key === "ArrowLeft") showPreviousPhoto();
    if (e.key === "Tab") {
      const f = [$("#lb-prev"), $("#lb-next"), $("#lb-close")];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
    }
  });

  // Swipe left/right on phones
  let startX = 0;
  lb.addEventListener(
    "touchstart",
    (e) => {
      startX = e.changedTouches[0].clientX;
    },
    { passive: true },
  );
  lb.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) (dx < 0 ? showNextPhoto : showPreviousPhoto)();
    },
    { passive: true },
  );
}

function renderLightbox() {
  const { photos, captions, friendName } = birthdayConfig;
  const img = $("#lb-img");
  img.src = photos[currentPhoto];
  img.alt = `Photo ${currentPhoto + 1} of ${friendName}`;
  $("#lb-caption").textContent = captions[currentPhoto] || "";
  // Re-trigger the small entrance animation
  img.style.animation = "none";
  void img.offsetWidth;
  img.style.animation = "";
}

function openLightbox(index) {
  currentPhoto = index;
  lastFocused = document.activeElement;
  renderLightbox();
  $("#lightbox").hidden = false;
  lockScroll();
  $("#lb-close").focus();
}

function closeLightbox() {
  $("#lightbox").hidden = true;
  unlockScroll();
  if (lastFocused) lastFocused.focus();
}

function showNextPhoto() {
  currentPhoto = (currentPhoto + 1) % birthdayConfig.photos.length;
  renderLightbox();
}
function showPreviousPhoto() {
  currentPhoto =
    (currentPhoto - 1 + birthdayConfig.photos.length) %
    birthdayConfig.photos.length;
  renderLightbox();
}

/* =====================================================
   SECTION 5: READ MORE
   ===================================================== */
function initReadMore() {
  const btn = $("#read-more");
  const more = $("#letter-more");
  btn.addEventListener("click", () => {
    const open = more.classList.toggle("is-open");
    more.setAttribute("aria-hidden", String(!open));
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Show Less ❤️" : "Read More ❤️";
  });
}

/* =====================================================
   SECTION 9: COUNTDOWN
   ===================================================== */
function startCountdown() {
  const target = new Date(`${birthdayConfig.birthday}T00:00:00`); // local midnight
  const box = $("#countdown");
  const title = $("#countdown-title");
  const grid = $("#countdown-grid");
  const pad = (n) => String(n).padStart(2, "0");
  let timer;

  function tick() {
    const diff = target - new Date();
    if (diff > 0) {
      $("#cd-days").textContent = pad(Math.floor(diff / 86400000));
      $("#cd-hours").textContent = pad(Math.floor(diff / 3600000) % 24);
      $("#cd-minutes").textContent = pad(Math.floor(diff / 60000) % 60);
      $("#cd-seconds").textContent = pad(Math.floor(diff / 1000) % 60);
      return;
    }
    // The day has arrived (or passed)
    clearInterval(timer);
    grid.hidden = true;
    const now = new Date();
    const sameDay = now.toDateString() === target.toDateString();
    title.textContent = sameDay
      ? "Today is your day! 🎂❤️"
      : "Hope your special day was magical ❤️";
    if (sameDay) box.classList.add("is-today");
  }
  tick();
  timer = setInterval(tick, 1000);
}

/* =====================================================
   SECTION 6: ONE LAST SURPRISE
   ===================================================== */
function initSurprise() {
  const btn = $("#surprise-btn");
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = "Happy Birthday! 🎉";

    launchConfetti(180);
    createHearts(30);
    setTimeout(() => launchConfetti(120), 1400);

    const card = $("#birthday-card");
    card.hidden = false;
    setTimeout(
      () =>
        card.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
        }),
      300,
    );

    // After a moment, tease the final surprise
    setTimeout(() => {
      $("#final-teaser").hidden = false;
      $("#final-teaser").scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    }, 5500);
  });
}

/* =====================================================
   SECTION 7: FINAL FULL-SCREEN REVEAL
   ===================================================== */
let finalTimers = [];
let fireworksTimer = null;

function initFinal() {
  $("#final-btn").addEventListener("click", startFinalReveal);
  $("#final-close").addEventListener("click", closeFinalReveal);
}

function startFinalReveal() {
  const screen = $("#final");
  const lines = $$(".final-line");
  lines.forEach((l) => l.classList.remove("is-shown"));
  $("#final-close").hidden = true;
  screen.hidden = false;
  lockScroll();

  lines.forEach((line, i) => {
    finalTimers.push(
      setTimeout(
        () => {
          // Fade the previous line out (the last line stays)
          if (i > 0) lines[i - 1].classList.remove("is-shown");
          line.classList.add("is-shown");
          if (i === 0 || i === 4) createHearts(20);
          if (line.classList.contains("final-last")) {
            launchConfetti(160);
            launchFireworks(3);
            fireworksTimer = setInterval(() => launchFireworks(2), 2500);
            finalTimers.push(
              setTimeout(() => {
                $("#final-close").hidden = false;
              }, 3000),
            );
          }
        },
        Number(line.dataset.delay) * 1000,
      ),
    );
  });
}

function closeFinalReveal() {
  finalTimers.forEach(clearTimeout);
  finalTimers = [];
  clearInterval(fireworksTimer);
  $("#final").hidden = true;
  unlockScroll();
}

/* =====================================================
   EFFECTS: HEARTS
   ===================================================== */
const HEARTS = ["❤️", "💖", "💗", "💕", "🩷"];
let ambientTimer = null;

function createHearts(count = 15) {
  if (reduceMotion) return;
  const layer = $("#hearts-layer");
  for (let i = 0; i < count; i++) {
    setTimeout(
      () => {
        const heart = document.createElement("span");
        heart.className = "heart";
        heart.textContent = pick(HEARTS);
        heart.style.setProperty("--x", `${rand(2, 96)}%`);
        heart.style.setProperty("--size", `${rand(1, 2.3)}rem`);
        heart.style.setProperty("--dur", `${rand(5, 9)}s`);
        heart.style.setProperty("--drift", `${rand(-70, 70)}px`);
        heart.addEventListener("animationend", () => heart.remove());
        layer.appendChild(heart);
      },
      i * rand(60, 160),
    );
  }
}

// A gentle heart every couple of seconds (skips when the tab is hidden)
function startAmbientHearts() {
  if (ambientTimer) return;
  ambientTimer = setInterval(() => {
    if (!document.hidden && $("#hearts-layer").children.length < 25)
      createHearts(1);
  }, 2000);
}

/* =====================================================
   EFFECTS: CONFETTI + FIREWORKS (one shared canvas)
   ===================================================== */
const COLORS = [
  "#ff9ec7",
  "#e8557f",
  "#e8c98a",
  "#ffffff",
  "#c9a7f5",
  "#ff7fb0",
];
const fx = {
  canvas: null,
  ctx: null,
  w: 0,
  h: 0,
  confetti: [],
  sparks: [],
  running: false,
};

function resizeFxCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  fx.w = window.innerWidth;
  fx.h = window.innerHeight;
  fx.canvas.width = fx.w * dpr;
  fx.canvas.height = fx.h * dpr;
  fx.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function initEffects() {
  fx.canvas = $("#confetti");
  fx.ctx = fx.canvas.getContext("2d");
  resizeFxCanvas();
  window.addEventListener("resize", resizeFxCanvas);
}

function launchConfetti(count = 150) {
  if (reduceMotion) return;
  for (let i = 0; i < count; i++) {
    const fromCannon = i % 2 === 0; // half rain from the top, half burst from the bottom
    fx.confetti.push({
      x: fromCannon ? fx.w / 2 + rand(-40, 40) : rand(0, fx.w),
      y: fromCannon ? fx.h + 10 : rand(-60, -10),
      vx: fromCannon ? rand(-6, 6) : rand(-1.5, 1.5),
      vy: fromCannon ? -rand(10, 19) : rand(1.5, 4),
      w: rand(6, 11),
      h: rand(4, 8),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.2, 0.2),
      color: pick(COLORS),
      round: Math.random() < 0.25,
    });
  }
  runEffects();
}

function launchFireworks(bursts = 3) {
  if (reduceMotion) return;
  for (let b = 0; b < bursts; b++) {
    setTimeout(() => {
      const x = rand(fx.w * 0.15, fx.w * 0.85),
        y = rand(fx.h * 0.15, fx.h * 0.5);
      const color = pick(COLORS);
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60,
          speed = rand(1.5, 5);
        fx.sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: rand(0.012, 0.024),
          color,
        });
      }
      runEffects();
    }, b * 350);
  }
}

function runEffects() {
  if (fx.running) return;
  fx.running = true;
  requestAnimationFrame(drawEffects);
}

function drawEffects() {
  const { ctx } = fx;
  ctx.clearRect(0, 0, fx.w, fx.h);

  fx.confetti = fx.confetti.filter((p) => p.y < fx.h + 40);
  for (const p of fx.confetti) {
    p.vy += 0.16;
    p.vx *= 0.985;
    p.vy *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.round) {
      ctx.beginPath();
      ctx.arc(0, 0, p.h / 2, 0, Math.PI * 2);
      ctx.fill();
    } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }

  fx.sparks = fx.sparks.filter((s) => s.life > 0);
  for (const s of fx.sparks) {
    s.vx *= 0.98;
    s.vy = s.vy * 0.98 + 0.04;
    s.x += s.vx;
    s.y += s.vy;
    s.life -= s.decay;
    ctx.globalAlpha = Math.max(s.life, 0);
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (fx.confetti.length || fx.sparks.length)
    requestAnimationFrame(drawEffects);
  else {
    fx.running = false;
    ctx.clearRect(0, 0, fx.w, fx.h);
  }
}

/* =====================================================
   EFFECTS: BACKGROUND PARTICLES (soft floating dots)
   ===================================================== */
function initParticles() {
  if (reduceMotion) return;
  const canvas = $("#particles");
  const ctx = canvas.getContext("2d");
  let w,
    h,
    dots = [],
    raf;

  function setup() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = w < 600 ? 35 : 65; // fewer dots on phones = smoother
    dots = Array.from({ length: count }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.8, 2.6),
      speed: rand(0.15, 0.5),
      phase: rand(0, Math.PI * 2),
      color: Math.random() < 0.3 ? "232,201,138" : "255,158,199",
    }));
  }

  function frame(time) {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.y -= d.speed;
      if (d.y < -10) {
        d.y = h + 10;
        d.x = rand(0, w);
      }
      const alpha = 0.25 + 0.25 * Math.sin(time / 900 + d.phase); // twinkle
      ctx.fillStyle = `rgba(${d.color},${alpha})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }

  setup();
  raf = requestAnimationFrame(frame);
  window.addEventListener("resize", setup);
  // Pause when the tab is not visible to save battery
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(frame);
  });
}

/* =====================================================
   SECTION 8: MUSIC
   ===================================================== */
function toggleMusic() {
  const audio = $("#birthday-audio");
  const btn = $("#music-btn");
  const label = $(".music-label", btn);

  if (audio.paused) {
    audio.volume = birthdayConfig.musicVolume;
    audio
      .play()
      .then(() => {
        btn.classList.add("is-playing");
        btn.setAttribute("aria-pressed", "true");
        btn.setAttribute("aria-label", "Pause music");
        label.textContent = "Playing";
      })
      .catch(() => {
        // File missing or blocked: the site still works fine without music
        label.textContent = "No music file";
        setTimeout(() => (label.textContent = "Music"), 2000);
      });
  } else {
    audio.pause();
    btn.classList.remove("is-playing");
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Play music");
    label.textContent = "Music";
  }
}

/* =====================================================
   BUTTON CLICK RIPPLE
   ===================================================== */
function initRipples() {
  document.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
}

/* =====================================================
   START EVERYTHING
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initEffects();
  initParticles();
  initRipples();
  initIntro();
  initGallery();
  initReadMore();
  initSurprise();
  initFinal();
  startCountdown();
  $("#music-btn").addEventListener("click", toggleMusic);
  initTease();
  initPromise();
  initGate(); // locks the site until the birthday, then leads into initOpening()
});
