let currentLetter = null;
let unlockedSet = new Set();

const bgMusic = document.getElementById("bgMusic");
const letterMusic = document.getElementById("letterMusic");
const catImg = document.getElementById("catImg");
bgMusic.volume = 0.4;

// ── PopCat ───────────────────────────────────────────────────────────────────
catImg.addEventListener("mouseenter", () => { catImg.src = "images/pop2.png"; });
catImg.addEventListener("mouseleave", () => { if (bgMusic.paused) catImg.src = "images/pop1.png"; });
catImg.addEventListener("click", () => {
  if (bgMusic.paused) { bgMusic.play(); catImg.src = "images/pop2.png"; }
  else { bgMusic.pause(); catImg.src = "images/pop1.png"; }
});

// ── Lịch mở thư ──────────────────────────────────────────────────────────────
function buildSchedule() {
  const s = []; let n = 1, y = 2026;
  while (n <= 100) {
    if (n <= 100) s.push({ letter: n++, day: 28, month: 8, year: y });
    if (n <= 100) s.push({ letter: n++, day: 27, month: 1, year: y + 1 });
    y++;
  }
  return s;
}
const SCHEDULE = buildSchedule();
function getUnlockLabel(num) {
  const e = SCHEDULE.find(x => x.letter === num);
  if (!e) return "";
  return `${String(e.day).padStart(2,"0")}/${String(e.month).padStart(2,"0")}/${e.year}`;
}

// ── Build danh sách thư ───────────────────────────────────────────────────────
const grid = document.getElementById("letterGrid");
for (let i = 1; i <= 100; i++) {
  const box = document.createElement("div");
  box.className = "box locked";
  box.id = "box-" + i;
  box.innerHTML = `
    <div class="box-icon">🔒</div>
    <div class="box-info">
      <div class="box-title">Thư #${i}</div>
      <div class="box-date">Mở vào ${getUnlockLabel(i)}</div>
    </div>`;
  box.onclick = () => openModal(i);
  grid.appendChild(box);
}

// ── Load thư đã mở ────────────────────────────────────────────────────────────
async function loadUnlockedLetters() {
  try {
    const res = await fetch("/unlocked-letters");
    const data = await res.json();
    unlockedSet = new Set(data.unlocked);
    unlockedSet.forEach(num => {
      const box = document.getElementById("box-" + num);
      if (box) {
        box.classList.replace("locked", "unlocked");
        box.innerHTML = `
          <div class="box-icon">💌</div>
          <div class="box-info">
            <div class="box-title">Thư #${num}</div>
            <div class="box-date">Đã mở · ${getUnlockLabel(num)}</div>
          </div>`;
      }
    });
  } catch (err) { console.error("Lỗi load thư:", err); }

  gsap.registerPlugin(ScrollTrigger);

  gsap.from("h1", { y: -40, opacity: 0, duration: 1, ease: "power3.out" });

  gsap.utils.toArray(".box").forEach((box, i) => {
    gsap.from(box, {
      scrollTrigger: { trigger: box, start: "top 90%", toggleActions: "play none none none" },
      x: -60, opacity: 0, duration: 0.5,
      delay: (i % 5) * 0.06, ease: "power2.out",
    });
  });
}
loadUnlockedLetters();

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(num) {
  currentLetter = num;
  document.getElementById("modalTitle").innerText = "Thư #" + num;
  document.getElementById("modal").style.display = "block";
  document.getElementById("letterContent").style.display = "none";
  document.getElementById("passwordSection").style.display = "block";
  document.getElementById("passwordInput").value = "";
  document.getElementById("error").innerText = !unlockedSet.has(num)
    ? `🔒 Thư này mở vào ${getUnlockLabel(num)}` : "";

  gsap.fromTo(".modal-content",
    { scale: 0.85, opacity: 0, y: 30 },
    { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }
  );
}

async function checkPassword() {
  const password = document.getElementById("passwordInput").value.trim();
  try {
    const response = await fetch("/read-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: currentLetter, password: password || "" }),
    });
    let data;
    try { data = await response.json(); } catch { data = {}; }

    if (response.status === 401) { document.getElementById("error").innerText = "Sai mật khẩu rồi vợ yêu ơi!!! ^^"; return; }
    if (response.status === 403) { document.getElementById("error").innerText = data.message || "Sắp mở rồi, đợi thêm xíu nha vợ yêu!!!"; return; }
    if (!response.ok) { document.getElementById("error").innerText = `Lỗi ${response.status} — thử lại nhé 😥`; return; }

    bgMusic.pause(); bgMusic.currentTime = 0;
    if (data.music) { letterMusic.src = data.music; letterMusic.volume = 0.6; letterMusic.play().catch(() => {}); }

    document.getElementById("passwordSection").style.display = "none";
    document.getElementById("letterContent").style.display = "block";
    document.getElementById("letterContent").innerText = data.content;

    gsap.fromTo("#letterContent",
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  } catch { document.getElementById("error").innerText = "Vợ đợi thêm 1 xíu nữa nha!!!"; }
}

document.getElementById("passwordInput").addEventListener("keydown", e => {
  if (e.key === "Enter") checkPassword();
});

function closeModal() {
  letterMusic.pause(); letterMusic.currentTime = 0;
  bgMusic.play().catch(() => {});

  // Ẩn modal thẳng, không dùng GSAP để tránh conflict
  const modal = document.getElementById("modal");
  const mc = document.querySelector(".modal-content");
  modal.style.display = "none";
  // Reset GSAP inline styles nếu có
  gsap.set(mc, { clearProps: "all" });
  document.getElementById("passwordSection").style.display = "block";
  document.getElementById("letterContent").style.display = "none";
}

document.getElementById("closeBtn").onclick = closeModal;
document.getElementById("modal").addEventListener("click", e => { if (e.target === document.getElementById("modal")) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ── Hạt bụi lấp lánh ─────────────────────────────────────────────────────────
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;
window.addEventListener("resize", () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });

const COLORS = ["255,255,255","255,200,220","255,230,150","200,180,255","180,230,255"];

class Dust {
  constructor(initial = false) { this.init(initial); }
  init(initial = false) {
    this.x = Math.random() * W;
    this.y = initial ? Math.random() * H : -10;
    this.r = 0.8 + Math.random() * 2.2;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.speedY = 0.3 + Math.random() * 0.8;
    this.speedX = 0.4 + Math.random() * 0.6;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.015 + Math.random() * 0.025;
    this.alpha = Math.random();
    this.alphaDir = Math.random() > 0.5 ? 1 : -1;
    this.alphaSpeed = 0.008 + Math.random() * 0.018;
    this.alphaMin = 0.1;
    this.alphaMax = 0.85 + Math.random() * 0.15;
    this.glow = Math.random() > 0.55;
  }
  update() {
    this.wobble += this.wobbleSpeed;
    this.x += this.speedX + Math.sin(this.wobble) * 0.3;
    this.y += this.speedY;
    this.alpha += this.alphaDir * this.alphaSpeed;
    if (this.alpha >= this.alphaMax) { this.alpha = this.alphaMax; this.alphaDir = -1; }
    if (this.alpha <= this.alphaMin) { this.alpha = this.alphaMin; this.alphaDir = 1; }
    if (this.y > H + 10 || this.x > W + 10) this.init();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    if (this.glow) {
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
      grad.addColorStop(0, `rgba(${this.color},${this.alpha})`);
      grad.addColorStop(0.4, `rgba(${this.color},${this.alpha * 0.4})`);
      grad.addColorStop(1, `rgba(${this.color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(${this.color},1)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const dusts = Array.from({ length: 120 }, () => new Dust(true));
function animateDust() {
  ctx.clearRect(0, 0, W, H);
  dusts.forEach(d => { d.update(); d.draw(); });
  requestAnimationFrame(animateDust);
}
animateDust();

// ── Background theo giờ thực ──────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpC(r1,g1,b1,r2,g2,b2,t) {
  return [Math.round(lerp(r1,r2,t)), Math.round(lerp(g1,g2,t)), Math.round(lerp(b1,b2,t))];
}

const TIME_COLORS = [
  { h:  0, r:  8, g:  5, b: 10 },
  { h:  5, r:  8, g:  5, b: 10 },
  { h:  6, r: 80, g: 35, b: 15 },
  { h:  8, r: 95, g: 58, b: 32 },
  { h: 12, r:100, g: 65, b: 38 },
  { h: 17, r: 90, g: 52, b: 28 },
  { h: 19, r: 60, g: 28, b: 18 },
  { h: 21, r: 18, g: 10, b: 14 },
  { h: 24, r:  8, g:  5, b: 10 },
];

function getBgColor() {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  let a = TIME_COLORS[TIME_COLORS.length - 1], b = TIME_COLORS[0];
  for (let i = 0; i < TIME_COLORS.length - 1; i++) {
    if (hour >= TIME_COLORS[i].h && hour < TIME_COLORS[i+1].h) { a = TIME_COLORS[i]; b = TIME_COLORS[i+1]; break; }
  }
  const t = (hour - a.h) / (b.h - a.h);
  const [r,g,bl] = lerpC(a.r,a.g,a.b, b.r,b.g,b.b, t);
  return `radial-gradient(circle at top, rgb(${r+14},${g+10},${bl+8}), rgb(${r},${g},${bl}) 70%)`;
}
function updateBg() { document.body.style.background = getBgColor(); }
updateBg();
setInterval(updateBg, 60000);

// ── Mặt trời → Mặt trăng theo scroll ─────────────────────────────────────────
const cel = document.getElementById("celestialCanvas");
const celCtx = cel.getContext("2d");
const SZ = 220;
cel.width = cel.height = SZ;
const CX = SZ / 2, CY = SZ / 2, R = 48;

const CRATERS = [
  { ox: -0.22, oy: -0.28, r: 0.11 }, { ox:  0.28, oy: -0.12, r: 0.08 },
  { ox: -0.08, oy:  0.33, r: 0.13 }, { ox:  0.20, oy:  0.25, r: 0.07 },
  { ox: -0.36, oy:  0.12, r: 0.06 }, { ox:  0.06, oy: -0.40, r: 0.05 },
];
const STARS = [
  { ox:  1.9, oy: -1.5, r: 1.8 }, { ox:  1.3, oy: -2.0, r: 1.2 },
  { ox: -1.7, oy: -1.2, r: 1.5 }, { ox:  2.1, oy:  0.6, r: 1.1 },
  { ox: -1.4, oy:  1.7, r: 1.7 }, { ox:  0.8, oy:  2.1, r: 1.2 },
  { ox: -2.1, oy:  0.4, r: 1.4 },
];

function drawCelestial(p) {
  p = Math.max(0, Math.min(1, p));
  celCtx.clearRect(0, 0, SZ, SZ);

  const [cr,cg,cb] = lerpC(255,210,0, 220,235,255, p);
  const [gr,gg,gb] = lerpC(255,140,0, 120,160,255, p);

  const glowR = lerp(R * 2.4, R * 3.0, p);
  const glowA = lerp(0.18, 0.38, p);
  const glow = celCtx.createRadialGradient(CX, CY, R * 0.5, CX, CY, glowR);
  glow.addColorStop(0, `rgba(${gr},${gg},${gb},${glowA})`);
  glow.addColorStop(0.45, `rgba(${gr},${gg},${gb},${glowA * 0.3})`);
  glow.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
  celCtx.fillStyle = glow;
  celCtx.beginPath();
  celCtx.arc(CX, CY, glowR, 0, Math.PI * 2);
  celCtx.fill();

  const rayA = Math.max(0, 1 - p * 2.8);
  if (rayA > 0.01) {
    celCtx.save();
    celCtx.globalAlpha = rayA;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const wobble = Math.sin(Date.now() * 0.0012 + i * 0.9) * 1.8;
      const g2 = celCtx.createLinearGradient(
        CX + Math.cos(angle) * (R+6), CY + Math.sin(angle) * (R+6),
        CX + Math.cos(angle) * (R+30+wobble), CY + Math.sin(angle) * (R+30+wobble)
      );
      g2.addColorStop(0, `rgba(${cr},${cg},${cb},0.95)`);
      g2.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      celCtx.strokeStyle = g2;
      celCtx.lineWidth = 2.5;
      celCtx.lineCap = "round";
      celCtx.beginPath();
      celCtx.moveTo(CX + Math.cos(angle) * (R+6), CY + Math.sin(angle) * (R+6));
      celCtx.lineTo(CX + Math.cos(angle) * (R+30+wobble), CY + Math.sin(angle) * (R+30+wobble));
      celCtx.stroke();
    }
    celCtx.restore();
  }

  const off = new OffscreenCanvas(SZ, SZ);
  const offCtx = off.getContext("2d");

  const bodyGrad = offCtx.createRadialGradient(CX - R*0.28, CY - R*0.28, 0, CX, CY, R);
  if (p < 0.5) {
    bodyGrad.addColorStop(0, `rgb(255,252,180)`);
    bodyGrad.addColorStop(0.35, `rgb(255,220,50)`);
    bodyGrad.addColorStop(0.75, `rgb(${cr},${Math.round(cg*0.85)},0)`);
    bodyGrad.addColorStop(1, `rgb(${Math.round(cr*0.65)},${Math.round(cg*0.5)},0)`);
  } else {
    bodyGrad.addColorStop(0, `rgb(245,250,255)`);
    bodyGrad.addColorStop(0.4, `rgb(${cr},${cg},${cb})`);
    bodyGrad.addColorStop(0.78, `rgb(${Math.round(cr*0.74)},${Math.round(cg*0.80)},${Math.round(cb*0.84)})`);
    bodyGrad.addColorStop(1, `rgb(${Math.round(cr*0.42)},${Math.round(cg*0.50)},${Math.round(cb*0.62)})`);
  }
  offCtx.fillStyle = bodyGrad;
  offCtx.beginPath();
  offCtx.arc(CX, CY, R, 0, Math.PI * 2);
  offCtx.fill();

  if (p > 0.45) {
    const cA = Math.min(1, (p - 0.45) / 0.4);
    CRATERS.forEach(c => {
      const cx2 = CX + c.ox * R, cy2 = CY + c.oy * R, cr2 = c.r * R;
      const cGrad = offCtx.createRadialGradient(cx2 - cr2*0.35, cy2 - cr2*0.35, 0, cx2, cy2, cr2);
      cGrad.addColorStop(0, `rgba(200,215,230,${cA*0.20})`);
      cGrad.addColorStop(0.5, `rgba(110,130,155,${cA*0.38})`);
      cGrad.addColorStop(0.85, `rgba(65,85,110,${cA*0.55})`);
      cGrad.addColorStop(1, `rgba(40,60,90,${cA*0.25})`);
      offCtx.fillStyle = cGrad;
      offCtx.beginPath();
      offCtx.arc(cx2, cy2, cr2, 0, Math.PI * 2);
      offCtx.fill();
    });
  }

  if (p > 0.35) {
    const sp = Math.min(1, (p - 0.35) / 0.65);
    offCtx.globalCompositeOperation = "destination-out";
    offCtx.beginPath();
    offCtx.arc(CX + lerp(0, R*0.80, sp), CY, lerp(R*0.75, R*1.06, sp), 0, Math.PI * 2);
    offCtx.fill();
    offCtx.globalCompositeOperation = "source-over";
  }

  celCtx.drawImage(off, 0, 0);

  if (p > 0.5) {
    const starA = Math.min(1, (p - 0.5) / 0.4);
    STARS.forEach(st => {
      const twinkle = 0.4 + 0.6 * Math.sin(Date.now() * 0.0018 + st.ox * 3.7);
      celCtx.save();
      celCtx.globalAlpha = starA * twinkle;
      celCtx.fillStyle = `rgb(${cr},${cg},${cb})`;
      celCtx.shadowColor = `rgba(${gr},${gg},${gb},0.9)`;
      celCtx.shadowBlur = 10;
      celCtx.beginPath();
      celCtx.arc(CX + st.ox * R, CY + st.oy * R, st.r, 0, Math.PI * 2);
      celCtx.fill();
      celCtx.restore();
    });
  }
}

function getScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

(function celestialLoop() {
  drawCelestial(getScrollProgress());
  requestAnimationFrame(celestialLoop);
})();