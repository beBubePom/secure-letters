let currentLetter = null;
let unlockedSet = new Set();

const bgMusic = document.getElementById("bgMusic");
const letterMusic = document.getElementById("letterMusic");
const catImg = document.getElementById("catImg");
bgMusic.volume = 0.35;

// ══════════════════════════════════════════════════════════════════════════════
// CURSOR TUỲ CHỈNH + TRAIL
// ══════════════════════════════════════════════════════════════════════════════
const cursor     = document.getElementById("cursor");
const cursorRing = document.getElementById("cursor-ring");
let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

const TRAIL_COUNT = 12;
const trails = Array.from({ length: TRAIL_COUNT }, (_, i) => {
  const div = document.createElement("div");
  div.className = "cursor-trail";
  const sz = 3 - i * 0.18;
  div.style.cssText = `width:${sz}px;height:${sz}px;opacity:0;background:rgba(${180 - i*5},${100 - i*2},${240 - i*3},${0.7 - i*0.05})`;
  document.body.appendChild(div);
  return { el: div, x: 0, y: 0 };
});

document.addEventListener("mousemove", e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + "px";
  cursor.style.top  = mouseY + "px";
});

function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + "px";
  cursorRing.style.top  = ringY + "px";

  for (let i = TRAIL_COUNT - 1; i > 0; i--) {
    trails[i].x += (trails[i-1].x - trails[i].x) * 0.35;
    trails[i].y += (trails[i-1].y - trails[i].y) * 0.35;
    trails[i].el.style.left    = trails[i].x + "px";
    trails[i].el.style.top     = trails[i].y + "px";
    trails[i].el.style.opacity = (1 - i / TRAIL_COUNT) * 0.5;
  }
  trails[0].x += (mouseX - trails[0].x) * 0.5;
  trails[0].y += (mouseY - trails[0].y) * 0.5;
  trails[0].el.style.left    = trails[0].x + "px";
  trails[0].el.style.top     = trails[0].y + "px";
  trails[0].el.style.opacity = 0.6;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover effect trên clickable
document.addEventListener("mouseover", e => {
  if (e.target.closest("button, .box.unlocked, #closeBtn, #musicCat")) {
    cursor.style.transform = "translate(-50%,-50%) scale(1.8)";
    cursorRing.style.width  = "48px";
    cursorRing.style.height = "48px";
    cursorRing.style.borderColor = "rgba(200,130,255,0.6)";
  }
});
document.addEventListener("mouseout", e => {
  if (e.target.closest("button, .box.unlocked, #closeBtn, #musicCat")) {
    cursor.style.transform = "translate(-50%,-50%) scale(1)";
    cursorRing.style.width  = "32px";
    cursorRing.style.height = "32px";
    cursorRing.style.borderColor = "rgba(180,100,220,0.4)";
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POPCAT
// ══════════════════════════════════════════════════════════════════════════════
catImg.addEventListener("mouseenter", () => { catImg.src = "images/pop2.png"; });
catImg.addEventListener("mouseleave", () => { if (bgMusic.paused) catImg.src = "images/pop1.png"; });
catImg.addEventListener("click", () => {
  if (bgMusic.paused) { bgMusic.play(); catImg.src = "images/pop2.png"; }
  else { bgMusic.pause(); catImg.src = "images/pop1.png"; }
});

// ══════════════════════════════════════════════════════════════════════════════
// TYPING TITLE
// ══════════════════════════════════════════════════════════════════════════════
const TITLE_TEXT = "100 Lá Thư Cho Em";
const typingEl   = document.getElementById("typingText");
let   charIdx    = 0;

function typeTitle() {
  if (charIdx < TITLE_TEXT.length) {
    typingEl.textContent += TITLE_TEXT[charIdx++];
    setTimeout(typeTitle, 80 + Math.random() * 40);
  } else {
    document.getElementById("typingCursor").style.animationPlayState = "running";
  }
}
setTimeout(typeTitle, 600);

// ══════════════════════════════════════════════════════════════════════════════
// LỊCH MỞ THƯ
// ══════════════════════════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════════════════════════
// BUILD DANH SÁCH THƯ
// ══════════════════════════════════════════════════════════════════════════════
const grid = document.getElementById("letterGrid");
for (let i = 1; i <= 100; i++) {
  const box = document.createElement("div");
  box.className = "box locked";
  box.id = "box-" + i;
  box.innerHTML = `
    <div class="box-icon">—</div>
    <div class="box-info">
      <div class="box-title">Thư #${i}</div>
      <div class="box-date">mở vào ${getUnlockLabel(i)}</div>
    </div>`;
  box.onclick = () => openModal(i);
  grid.appendChild(box);
}

// ══════════════════════════════════════════════════════════════════════════════
// LOAD THƯ ĐÃ MỞ + GSAP
// ══════════════════════════════════════════════════════════════════════════════
async function loadUnlockedLetters() {
  try {
    const res  = await fetch("/unlocked-letters");
    const data = await res.json();
    unlockedSet = new Set(data.unlocked);
    unlockedSet.forEach(num => {
      const box = document.getElementById("box-" + num);
      if (box) {
        box.classList.replace("locked", "unlocked");
        box.innerHTML = `
          <div class="box-icon">♡</div>
          <div class="box-info">
            <div class="box-title">Thư #${num}</div>
            <div class="box-date">đã mở · ${getUnlockLabel(num)}</div>
          </div>`;
      }
    });
  } catch (err) { console.error("Lỗi load thư:", err); }

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".box").forEach((box, i) => {
    gsap.from(box, {
      scrollTrigger: { trigger: box, start: "top 92%", toggleActions: "play none none none" },
      x: -40, opacity: 0, duration: 0.6,
      delay: (i % 8) * 0.04, ease: "power2.out",
    });
  });
}
loadUnlockedLetters();

// ══════════════════════════════════════════════════════════════════════════════
// MODAL + ENVELOPE ANIMATION
// ══════════════════════════════════════════════════════════════════════════════
function openModal(num) {
  currentLetter = num;
  document.getElementById("modalTitle").innerText = "Thư #" + num;
  document.getElementById("modal").style.display = "block";
  document.getElementById("letterContent").style.display = "none";
  document.getElementById("passwordSection").style.display = "block";
  document.getElementById("envelopeWrap").style.display = "block";
  document.getElementById("passwordInput").value = "";
  document.getElementById("error").innerText = !unlockedSet.has(num)
    ? `mở vào ${getUnlockLabel(num)}` : "";

  // Reset envelope
  const flap = document.getElementById("envelopeFlap");
  const seal = document.getElementById("envelopeSeal");
  flap.style.transform = "rotateX(0deg)";
  seal.style.opacity = "1";

  gsap.fromTo(".modal-content",
    { scale: 0.88, opacity: 0, y: 24 },
    { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.5)" }
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

    if (response.status === 401) { document.getElementById("error").innerText = "sai mật khẩu rồi vợ yêu ơi ^^"; return; }
    if (response.status === 403) { document.getElementById("error").innerText = data.message || "sắp mở rồi, đợi thêm xíu nha vợ yêu"; return; }
    if (!response.ok) { document.getElementById("error").innerText = "lỗi — thử lại nhé em"; return; }

    // Animate envelope opening
    const flap = document.getElementById("envelopeFlap");
    const seal = document.getElementById("envelopeSeal");

    gsap.to(seal, { opacity: 0, duration: 0.3 });
    gsap.to(flap, {
      rotateX: -150, duration: 0.7, ease: "power2.inOut",
      onComplete: () => {
        gsap.to("#envelopeWrap", { opacity: 0, y: -10, duration: 0.4,
          onComplete: () => {
            document.getElementById("envelopeWrap").style.display = "none";
            document.getElementById("passwordSection").style.display = "none";
            document.getElementById("letterContent").style.display = "block";
            document.getElementById("letterContent").innerText = data.content;

            bgMusic.pause(); bgMusic.currentTime = 0;
            if (data.music) {
              letterMusic.src = data.music;
              letterMusic.volume = 0.5;
              letterMusic.play().catch(() => {});
            }
          }
        });
      }
    });

  } catch { document.getElementById("error").innerText = "vợ đợi thêm 1 xíu nha!"; }
}

document.getElementById("passwordInput").addEventListener("keydown", e => {
  if (e.key === "Enter") checkPassword();
});

function closeModal() {
  letterMusic.pause(); letterMusic.currentTime = 0;
  bgMusic.play().catch(() => {});
  document.getElementById("modal").style.display = "none";
  gsap.set(".modal-content", { clearProps: "all" });
  gsap.set("#envelopeWrap", { clearProps: "all" });
  document.getElementById("passwordSection").style.display = "block";
  document.getElementById("envelopeWrap").style.display = "block";
  document.getElementById("letterContent").style.display = "none";
}

document.getElementById("closeBtn").onclick = closeModal;
document.getElementById("modal").addEventListener("click", e => {
  if (e.target === document.getElementById("modal")) closeModal();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ══════════════════════════════════════════════════════════════════════════════
// THREE.JS MOON 3D
// ══════════════════════════════════════════════════════════════════════════════
(function initMoon() {
  const container = document.getElementById("moonContainer");
  const W = 220, H = 220;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.z = 2.8;

  // Tạo texture mặt trăng bằng canvas
  function makeMoonTexture() {
    const c   = document.createElement("canvas");
    c.width   = 512; c.height = 512;
    const ctx = c.getContext("2d");

    // Nền xám lunar
    ctx.fillStyle = "#8a96aa";
    ctx.fillRect(0, 0, 512, 512);

    // Noise texture
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 1.5;
      const v = Math.floor(Math.random() * 50 + 110);
      ctx.fillStyle = `rgb(${v},${v+4},${v+12})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mare (vùng tối)
    const mares = [
      { x: 200, y: 200, rx: 80, ry: 60 },
      { x: 340, y: 280, rx: 55, ry: 45 },
      { x: 140, y: 340, rx: 45, ry: 35 },
    ];
    mares.forEach(m => {
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, Math.max(m.rx, m.ry));
      g.addColorStop(0,   "rgba(70,78,95,0.55)");
      g.addColorStop(0.6, "rgba(80,88,105,0.3)");
      g.addColorStop(1,   "rgba(90,98,115,0)");
      ctx.fillStyle = g;
      ctx.save();
      ctx.scale(m.rx / Math.max(m.rx, m.ry), m.ry / Math.max(m.rx, m.ry));
      ctx.beginPath();
      ctx.arc(m.x / (m.rx / Math.max(m.rx, m.ry)), m.y / (m.ry / Math.max(m.rx, m.ry)),
        Math.max(m.rx, m.ry), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Crater
    const craters = [
      { x: 160, y: 170, r: 32 }, { x: 310, y: 230, r: 22 },
      { x: 200, y: 360, r: 18 }, { x: 380, y: 150, r: 14 },
      { x: 95,  y: 290, r: 16 }, { x: 260, y: 420, r: 11 },
      { x: 430, y: 370, r: 19 }, { x: 80,  y: 120, r: 9  },
      { x: 350, y: 420, r: 8  }, { x: 450, y: 220, r: 13 },
    ];
    craters.forEach(({ x, y, r }) => {
      // Bowl shadow
      const shadow = ctx.createRadialGradient(x + r*0.2, y + r*0.25, r*0.05, x, y, r);
      shadow.addColorStop(0,   "rgba(50,58,75,0.6)");
      shadow.addColorStop(0.65,"rgba(65,73,90,0.35)");
      shadow.addColorStop(1,   "rgba(100,110,130,0)");
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // Rim highlight
      const rim = ctx.createRadialGradient(x - r*0.4, y - r*0.35, r*0.6, x, y, r * 1.05);
      rim.addColorStop(0,   "rgba(200,210,230,0)");
      rim.addColorStop(0.85,"rgba(185,195,215,0)");
      rim.addColorStop(1,   "rgba(185,195,215,0.22)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.05, 0, Math.PI * 2);
      ctx.fill();
    });

    return new THREE.CanvasTexture(c);
  }

  // Bump map
  function makeBumpTexture() {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 256, 256);
    const craters = [
      {x:80,y:85,r:16},{x:155,y:115,r:11},{x:100,y:180,r:9},
      {x:190,y:75,r:7},{x:48,y:145,r:8},{x:130,y:210,r:6},
    ];
    craters.forEach(({ x, y, r }) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(0,0,0,0.8)");
      g.addColorStop(0.7,"rgba(0,0,0,0.3)");
      g.addColorStop(1, "rgba(255,255,255,0.2)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    return new THREE.CanvasTexture(c);
  }

  const moonTexture = makeMoonTexture();
  const bumpTexture = makeBumpTexture();

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({
    map:         moonTexture,
    bumpMap:     bumpTexture,
    bumpScale:   0.04,
    shininess:   4,
    specular:    new THREE.Color(0x222233),
  });
  const moon = new THREE.Mesh(geometry, material);
  scene.add(moon);

  // Ánh sáng
  const sunLight = new THREE.DirectionalLight(0xd0d8ff, 1.1);
  sunLight.position.set(-2.5, 1.5, 2);
  scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(0x1a1030, 0.6);
  scene.add(ambientLight);

  // Mouse parallax
  let targetRotX = 0, targetRotY = 0;
  document.addEventListener("mousemove", e => {
    targetRotY = (e.clientX / window.innerWidth  - 0.5) * 0.3;
    targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.2;
  });

  // Scroll parallax
  let scrollY = 0;
  window.addEventListener("scroll", () => { scrollY = window.scrollY; });

  // Animate
  function renderMoon() {
    requestAnimationFrame(renderMoon);
    moon.rotation.y += 0.0012;
    moon.rotation.x += (targetRotX - moon.rotation.x) * 0.03;
    moon.rotation.y += (targetRotY - moon.rotation.y) * 0.03;

    // Parallax scroll
    container.style.transform = `translateY(${scrollY * 0.15}px)`;

    renderer.render(scene, camera);
  }
  renderMoon();
})();

// ══════════════════════════════════════════════════════════════════════════════
// HẠT BỤI LẤPLÁNH
// ══════════════════════════════════════════════════════════════════════════════
const canvas = document.getElementById("particleCanvas");
const ctx    = canvas.getContext("2d");
let W = canvas.width  = window.innerWidth;
let H = canvas.height = window.innerHeight;
window.addEventListener("resize", () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });

const COLORS = ["255,255,255","220,200,255","200,180,255","180,220,255","255,220,240"];

class Dust {
  constructor(init = false) { this.reset(init); }
  reset(init = false) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : -10;
    this.r = 0.5 + Math.random() * 1.6;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.vy = 0.2 + Math.random() * 0.5;
    this.vx = 0.15 + Math.random() * 0.35;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.008 + Math.random() * 0.015;
    this.alpha = Math.random() * 0.5;
    this.alphaDir = 1;
    this.alphaSpeed = 0.004 + Math.random() * 0.01;
    this.alphaMax = 0.4 + Math.random() * 0.4;
    this.glow = Math.random() > 0.6;
  }
  update() {
    this.wobble += this.wobbleSpeed;
    this.x += this.vx + Math.sin(this.wobble) * 0.2;
    this.y += this.vy;
    this.alpha += this.alphaDir * this.alphaSpeed;
    if (this.alpha >= this.alphaMax) { this.alpha = this.alphaMax; this.alphaDir = -1; }
    if (this.alpha <= 0.05)          { this.alpha = 0.05;          this.alphaDir =  1; }
    if (this.y > H + 8 || this.x > W + 8) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    if (this.glow) {
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 5);
      g.addColorStop(0,   `rgba(${this.color},${this.alpha * 0.8})`);
      g.addColorStop(0.4, `rgba(${this.color},${this.alpha * 0.2})`);
      g.addColorStop(1,   `rgba(${this.color},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(${this.color},1)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Ít hạt hơn — thưa, điểm đạm
const dusts = Array.from({ length: 70 }, () => new Dust(true));
function animateDust() {
  ctx.clearRect(0, 0, W, H);
  dusts.forEach(d => { d.update(); d.draw(); });
  requestAnimationFrame(animateDust);
}
animateDust();