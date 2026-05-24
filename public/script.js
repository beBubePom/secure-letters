let currentLetter = null;
let unlockedSet = new Set();

const bgMusic = document.getElementById("bgMusic");
const letterMusic = document.getElementById("letterMusic");
const catImg = document.getElementById("catImg");
bgMusic.volume = 0.18;

// ══════════════════════════════════════════════════════════════════════════════
// CURSOR VẾT MỰC
// ══════════════════════════════════════════════════════════════════════════════
(function initInkCursor() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;width:100%;height:100%";
  document.body.appendChild(canvas);

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener("resize", resize);

  const ctx = canvas.getContext("2d");
  const SEGMENTS = [];
  const MAX_AGE  = 45;
  const MAX_LEN  = 32;
  let lastX = -1, lastY = -1, mx = -1, my = -1;

  document.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    if (lastX >= 0) {
      SEGMENTS.push({ x1: lastX, y1: lastY, x2: mx, y2: my, age: 0 });
      if (SEGMENTS.length > MAX_LEN) SEGMENTS.shift();
    }
    lastX = mx; lastY = my;
  });

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = SEGMENTS.length - 1; i >= 0; i--) {
      SEGMENTS[i].age++;
      if (SEGMENTS[i].age > MAX_AGE) SEGMENTS.splice(i, 1);
    }

    SEGMENTS.forEach((s, idx) => {
      const lifeRatio = 1 - s.age / MAX_AGE;
      const posRatio  = (idx + 1) / SEGMENTS.length;
      const alpha = lifeRatio * posRatio * 0.78;
      const width = 1.5 + posRatio * 2.5;
      const hue = 260 + posRatio * 40;
      const l   = 60 + posRatio * 20;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `hsl(${345 + posRatio * 15}, 75%, ${l}%)`;
      ctx.lineWidth   = width;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.shadowColor = `hsla(${hue}, 80%, ${l}%, 0.45)`;
      ctx.shadowBlur  = 4;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      ctx.restore();
    });

    // Cursor dot
    if (mx >= 0) {
      ctx.save();
      ctx.fillStyle = "rgba(255,180,190,0.95)";
      ctx.shadowColor = "rgba(240,140,160,0.6)";
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  loop();
})();

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
const TITLE_TEXT = "Hạnh phúc có hình hài gì vậy?";
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
const BOX_COLORS = [
  { border:"rgb(240,150,165)",  hover:"rgb(255,185,198)",  bg:"rgba(230,130,148,0.18)", glow:"rgba(240,150,165,0.7)" },
  { border:"rgb(245,170,155)",  hover:"rgb(255,200,185)",  bg:"rgba(235,155,138,0.18)", glow:"rgba(245,170,155,0.7)" },
  { border:"rgb(255,160,180)",  hover:"rgb(255,195,210)",  bg:"rgba(245,140,162,0.18)", glow:"rgba(255,160,180,0.7)" },
  { border:"rgb(230,140,160)",  hover:"rgb(248,175,192)",  bg:"rgba(220,120,142,0.18)", glow:"rgba(230,140,160,0.7)" },
  { border:"rgb(255,175,170)",  hover:"rgb(255,205,200)",  bg:"rgba(245,158,152,0.18)", glow:"rgba(255,175,170,0.7)" },
  { border:"rgb(240,155,175)",  hover:"rgb(255,188,205)",  bg:"rgba(230,138,158,0.18)", glow:"rgba(240,155,175,0.7)" },
  { border:"rgb(250,145,168)",  hover:"rgb(255,180,200)",  bg:"rgba(238,128,152,0.18)", glow:"rgba(250,145,168,0.7)" },
  { border:"rgb(235,160,155)",  hover:"rgb(252,192,188)",  bg:"rgba(225,142,138,0.18)", glow:"rgba(235,160,155,0.7)" },
];

const ICONS_UNLOCKED = ["♡","✦","◈","❋","✿","◇","⟡","❀","✧","◉","꩜","⌘","✺","⊹","❁","⋆","◈","✾","⟢","❃",
  "♡","✦","◈","❋","✿","◇","⟡","❀","✧","◉","꩜","⌘","✺","⊹","❁","⋆","◈","✾","⟢","❃",
  "♡","✦","◈","❋","✿","◇","⟡","❀","✧","◉","꩜","⌘","✺","⊹","❁","⋆","◈","✾","⟢","❃",
  "♡","✦","◈","❋","✿","◇","⟡","❀","✧","◉","꩜","⌘","✺","⊹","❁","⋆","◈","✾","⟢","❃",
  "♡","✦","◈","❋","✿","◇","⟡","❀","✧","◉","꩜","⌘","✺","⊹","❁","⋆","◈","✾","⟢","❃"];

const grid = document.getElementById("letterGrid");
for (let i = 1; i <= 100; i++) {
  const box = document.createElement("div");
  box.className = "box locked";
  box.id = "box-" + i;
  const c = BOX_COLORS[(i - 1) % BOX_COLORS.length];

  // Viền luôn sáng, không phân biệt locked/unlocked
  box.style.borderLeftColor = c.border;
  box.style.borderLeftWidth = '3px';

  box.innerHTML = `
    <div class="box-icon">—</div>
    <div class="box-info">
      <div class="box-title">Thư #${i}</div>
      <div class="box-date">mở vào ${getUnlockLabel(i)}</div>
    </div>`;

  // Hover effect — chỉ animate, không reset màu viền về tối
  box.addEventListener("mouseenter", () => {
    box.style.paddingLeft = "20px";
    box.style.borderLeftColor = c.hover;
    box.style.borderLeftWidth = "3px";
    box.style.background = c.bg;
    box.style.boxShadow = `2px 0 0 ${c.glow}, 4px 0 24px ${c.glow}, 8px 0 40px ${c.glow}`;
    const title = box.querySelector(".box-title");
    const icon  = box.querySelector(".box-icon");
    if (title) { title.style.color = "#f0f5ff"; title.style.textShadow = `0 0 16px ${c.glow}`; }
    if (icon)  { icon.style.transform = "scale(1.18)"; icon.style.filter = `drop-shadow(0 0 6px ${c.glow})`; }
  });

  box.addEventListener("mouseleave", () => {
    box.style.paddingLeft = "14px";
    box.style.borderLeftColor = c.border;  // luôn về màu sáng, không tối
    box.style.borderLeftWidth = "3px";
    box.style.background = "transparent";
    box.style.boxShadow = "none";
    const title = box.querySelector(".box-title");
    const icon  = box.querySelector(".box-icon");
    if (title) { title.style.color = "#b0c0da"; title.style.textShadow = "none"; }
    if (icon)  { icon.style.transform = "scale(1)"; icon.style.filter = "none"; }
  });

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
        const icon = ICONS_UNLOCKED[(num - 1) % ICONS_UNLOCKED.length];
        box.innerHTML = `
          <div class="box-icon">${icon}</div>
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

    // Step 1: Thông báo thành công
    const errorEl = document.getElementById("error");
    errorEl.style.color = "rgba(180,255,200,0.95)";
    errorEl.style.fontSize = "15px";
    errorEl.style.fontStyle = "italic";
    errorEl.innerText = "vợ yêu mở thư được rồi nhé!! 🖤";
    document.getElementById("passwordInput").style.opacity = "0";
    document.querySelector("#passwordSection button").style.opacity = "0";

    // Step 2: Đợi 2s rồi animate phong bì
    setTimeout(() => {
      const flap = document.getElementById("envelopeFlap");
      const seal = document.getElementById("envelopeSeal");
      gsap.to(seal, { opacity: 0, duration: 0.25 });
      setTimeout(() => {
        gsap.to(flap, {
          rotateX: -170, duration: 0.75, ease: "power2.inOut",
          onComplete: () => {
            gsap.to("#envelopeWrap", { opacity: 0, y: -12, duration: 0.4,
              onComplete: () => {
                document.getElementById("envelopeWrap").style.display = "none";
                document.getElementById("passwordSection").style.display = "none";
                const lc = document.getElementById("letterContent");
                lc.style.display = "block";
                lc.innerText = data.content;
                gsap.fromTo(lc,
                  { opacity: 0, y: 20 },
                  { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
                );
                bgMusic.pause(); bgMusic.currentTime = 0;
                if (data.music) {
                  letterMusic.src = data.music;
                  letterMusic.volume = 0.25;
                  letterMusic.play().catch(() => {});
                }
              }
            });
          }
        });
      }, 250);
    }, 2000);

  } catch { document.getElementById("error").innerText = "vợ đợi thêm 1 xíu nha!"; }
}

document.getElementById("passwordInput").addEventListener("keydown", e => {
  if (e.key === "Enter") checkPassword();
});

function closeModal() {
  letterMusic.pause(); letterMusic.currentTime = 0;
  bgMusic.play().catch(() => {});

  // Animation đóng modal
  gsap.to(".modal-content", {
    scale: 0.9, opacity: 0, y: 16, duration: 0.22, ease: "power2.in",
    onComplete: () => {
      document.getElementById("modal").style.display = "none";
      gsap.set(".modal-content", { clearProps: "all" });
      gsap.set("#envelopeWrap",  { clearProps: "all" });
      gsap.set("#envelopeFlap",  { clearProps: "all" });
      gsap.set("#envelopeSeal",  { clearProps: "all" });

      document.getElementById("passwordSection").style.display = "block";
      document.getElementById("envelopeWrap").style.display = "block";
      document.getElementById("letterContent").style.display = "none";

      const pw  = document.getElementById("passwordInput");
      const btn = document.querySelector("#passwordSection button");
      if (pw)  { pw.style.opacity = "1"; pw.value = ""; }
      if (btn) btn.style.opacity = "1";

      const err = document.getElementById("error");
      err.innerText = "";
      err.style.color = "";
      err.style.fontSize = "";
      err.style.fontStyle = "";
    }
  });
}

document.getElementById("closeBtn").onclick = closeModal;
document.getElementById("modal").addEventListener("click", e => {
  if (e.target === document.getElementById("modal")) closeModal();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });




// ══════════════════════════════════════════════════════════════════════════════
// ĐẾÂM NGƯỢC THƯ TIẾP THEO
// ══════════════════════════════════════════════════════════════════════════════
(function initCountdown() {
  const QUOTES = [
    "vợ yêu của chồng đợi thêm chút nữa nhé",
    "vợ yêu của chồng đợi thêm chút nữa nhé",
    "vợ yêu của chồng đợi thêm chút nữa nhé",
    "vợ yêu của chồng đợi thêm chút nữa nhé",
    "vợ yêu của chồng đợi thêm chút nữa nhé",
  ];

  function getNext() {
    const now = new Date();
    for (const e of SCHEDULE) {
      const d = new Date(e.year, e.month - 1, e.day, 0, 0, 0);
      if (d > now) return { ...e, date: d };
    }
    return null;
  }

  const next = getNext();
  const wrap = document.getElementById("countdown");
  if (!next || !wrap) return;

  const dateStr = `ngày ${String(next.day).padStart(2,"0")}/${String(next.month).padStart(2,"0")}/${next.year}`;
  const quote   = QUOTES[(next.letter - 1) % QUOTES.length];

  wrap.innerHTML = `
    <div class="cd-label">thư tiếp theo mở trong</div>
    <div class="cd-col">
      <div class="cd-days" id="cdDays">000</div>
      <div class="cd-unit">ngày</div>
    </div>
    <div class="cd-row">
      <div class="cd-col"><div class="cd-small" id="cdHours">00</div><div class="cd-unit">giờ</div></div>
      <div class="cd-dot">·</div>
      <div class="cd-col"><div class="cd-small" id="cdMinutes">00</div><div class="cd-unit">phút</div></div>
      <div class="cd-dot">·</div>
      <div class="cd-col"><div class="cd-small" id="cdSeconds">00</div><div class="cd-unit">giây</div></div>
    </div>
    <div class="cd-separator"></div>
    <div class="cd-badge">Thư #${next.letter}</div>
    <div class="cd-quote">${quote}</div>
    <div class="cd-date">${dateStr}</div>
  `;

  function tick() {
    const diff = next.date - new Date();
    if (diff <= 0) return;
    document.getElementById("cdDays").textContent    = String(Math.floor(diff/(1000*60*60*24))).padStart(3,"0");
    document.getElementById("cdHours").textContent   = String(Math.floor((diff%(1000*60*60*24))/(1000*60*60))).padStart(2,"0");
    document.getElementById("cdMinutes").textContent = String(Math.floor((diff%(1000*60*60))/(1000*60))).padStart(2,"0");
    document.getElementById("cdSeconds").textContent = String(Math.floor((diff%(1000*60))/1000)).padStart(2,"0");
  }
  tick();
  setInterval(tick, 1000);
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
    this.r = 1 + Math.random() * 2.5;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.vy = 0.2 + Math.random() * 0.5;
    this.vx = 0.15 + Math.random() * 0.35;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.008 + Math.random() * 0.015;
    this.alpha = Math.random() * 0.5;
    this.alphaDir = 1;
    this.alphaSpeed = 0.004 + Math.random() * 0.01;
    this.alphaMax = 0.6 + Math.random() * 0.35;
    this.glow = Math.random() > 0.45;
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
const dusts = Array.from({ length: 150 }, () => new Dust(true));
function animateDust() {
  ctx.clearRect(0, 0, W, H);
  dusts.forEach(d => { d.update(); d.draw(); });
  requestAnimationFrame(animateDust);
}
animateDust();