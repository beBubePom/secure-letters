let currentLetter = null;
let unlockedSet = new Set();

const bgMusic = document.getElementById("bgMusic");
const letterMusic = document.getElementById("letterMusic");
const catImg = document.getElementById("catImg");
bgMusic.volume = 0.18;

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
const BOX_COLORS = [
  { border:"rgb(200,140,255)",  hover:"rgb(225,180,255)",  bg:"rgba(190,120,255,0.18)", glow:"rgba(200,140,255,0.6)" },
  { border:"rgb(100,195,255)",  hover:"rgb(150,220,255)",  bg:"rgba(100,190,255,0.18)", glow:"rgba(100,195,255,0.6)" },
  { border:"rgb(255,140,165)",  hover:"rgb(255,180,198)",  bg:"rgba(255,130,155,0.16)", glow:"rgba(255,140,165,0.6)" },
  { border:"rgb(60,230,180)",   hover:"rgb(100,255,210)",  bg:"rgba(60,225,175,0.16)",  glow:"rgba(60,230,180,0.6)"  },
  { border:"rgb(255,210,80)",   hover:"rgb(255,232,130)",  bg:"rgba(255,205,70,0.16)",  glow:"rgba(255,210,80,0.6)"  },
  { border:"rgb(140,210,255)",  hover:"rgb(185,230,255)",  bg:"rgba(135,205,255,0.18)", glow:"rgba(140,210,255,0.6)" },
  { border:"rgb(230,120,255)",  hover:"rgb(248,160,255)",  bg:"rgba(225,115,255,0.16)", glow:"rgba(230,120,255,0.6)" },
  { border:"rgb(80,248,210)",   hover:"rgb(120,255,228)",  bg:"rgba(75,242,205,0.16)",  glow:"rgba(80,248,210,0.6)"  },
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

  // Set màu viền trực tiếp
  box.style.borderLeftColor = c.border;

  box.innerHTML = `
    <div class="box-icon">—</div>
    <div class="box-info">
      <div class="box-title">Thư #${i}</div>
      <div class="box-date">mở vào ${getUnlockLabel(i)}</div>
    </div>`;

  // Hover effect trực tiếp bằng JS
  box.addEventListener("mouseenter", () => {
    if (box.classList.contains("locked")) {
      box.style.borderLeftColor = c.hover;
      box.style.opacity = "0.55";
      return;
    }
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
    if (box.classList.contains("locked")) {
      box.style.borderLeftColor = c.border;
      box.style.opacity = "0.28";
      return;
    }
    box.style.paddingLeft = "14px";
    box.style.borderLeftColor = c.border;
    box.style.borderLeftWidth = "2.5px";
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
              letterMusic.volume = 0.25;
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