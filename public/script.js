let currentLetter = null;
let unlockedSet = new Set();

const bgMusic = document.getElementById("bgMusic");
const letterMusic = document.getElementById("letterMusic");
const catImg = document.getElementById("catImg");
bgMusic.volume = 0.09;

// ── Volume slider ─────────────────────────────────────────────────────────────
const volumeSlider = document.getElementById("volumeSlider");
const volIcon      = document.getElementById("volIcon");
if (volumeSlider) {
  volumeSlider.value = Math.round(bgMusic.volume * 100);
  volumeSlider.addEventListener("input", () => {
    const v = volumeSlider.value / 100;
    bgMusic.volume = v;
    letterMusic.volume = v * 0.25 / 0.09; // scale letterMusic proportionally
    volIcon.textContent = v === 0 ? "🔇" : v < 0.4 ? "🔈" : "🔊";
  });
}

// ── Playlist shuffle ─────────────────────────────────────────────────────────
const PLAYLIST = [
  "music/background.mp3",
  "music/background2.mp3",
  "music/background3.mp3",
  "music/background4.mp3",
  "music/background5.mp3",
  "music/background6.mp3",
  "music/background7.mp3",
  "music/background8.mp3",
  "music/background9.mp3",
  "music/background10.mp3",
];

// Shuffle playlist ngẫu nhiên
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let shuffled = shuffleArray(PLAYLIST);
// Bắt đầu từ vị trí random trong playlist
let currentTrack = Math.floor(Math.random() * shuffled.length);

// Load bài random ngay từ đầu
bgMusic.src = shuffled[currentTrack];

function loadTrack(idx) {
  const wasPlaying = !bgMusic.paused;
  bgMusic.src = shuffled[idx];
  bgMusic.load();
  if (wasPlaying) bgMusic.play().catch(() => {});
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % shuffled.length;
  // Hết 1 vòng → shuffle lại
  if (currentTrack === 0) shuffled = shuffleArray(PLAYLIST);
  loadTrack(currentTrack);
}

// Tự động chuyển bài khi hết nhạc
bgMusic.addEventListener("ended", () => nextTrack());



// ══════════════════════════════════════════════════════════════════════════════
// CURSOR CHẤM — dùng cho pre-welcome và welcome screen
// ══════════════════════════════════════════════════════════════════════════════
(function initDotCursor() {
  const dot = document.createElement("div");
  dot.id = "dotCursor";
  dot.style.cssText = [
    "position:fixed",
    "width:8px", "height:8px",
    "border-radius:50%",
    "background:rgba(220,190,255,0.9)",
    "pointer-events:none",
    "z-index:999999999",
    "transform:translate(-50%,-50%)",
    "transition:opacity 0.3s",
    "box-shadow:0 0 10px rgba(200,160,255,0.6)",
  ].join(";");
  document.body.appendChild(dot);

  // Sparkle trail
  const sparks = [];
  let mx = -999, my = -999;

  document.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + "px";
    dot.style.top  = my + "px";

    // Chỉ hiện dot cursor khi chưa vào trang web
    const preW = document.getElementById("preWelcome");
    const intro = document.getElementById("introScreen");
    const onIntroLayer = (preW && preW.style.display !== "none") ||
                         (intro && intro.style.display !== "none");
    dot.style.opacity = onIntroLayer ? "1" : "0";

    if (!onIntroLayer) return;
    for (let i = 0; i < 2; i++) {
      sparks.push({
        x: mx + (Math.random()-0.5)*10,
        y: my + (Math.random()-0.5)*10,
        r: Math.random()*2+0.5,
        life: 1,
        vx: (Math.random()-0.5)*1.5,
        vy: (Math.random()-0.5)*1.5 - 0.4,
      });
    }
  });

  // Sparkle canvas
  const sc = document.createElement("canvas");
  sc.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:999999998;";
  document.body.appendChild(sc);
  const sctx = sc.getContext("2d");

  function resizeSC() { sc.width = window.innerWidth; sc.height = window.innerHeight; }
  resizeSC(); window.addEventListener("resize", resizeSC);

  (function loopDot() {
    requestAnimationFrame(loopDot);
    sctx.clearRect(0, 0, sc.width, sc.height);

    const preW  = document.getElementById("preWelcome");
    const intro = document.getElementById("introScreen");
    const show  = (preW && preW.style.display !== "none") ||
                  (intro && intro.style.display !== "none");
    if (!show) return;

    for (let i = sparks.length-1; i >= 0; i--) {
      const s = sparks[i];
      s.life -= 0.05; s.x += s.vx; s.y += s.vy; s.r *= 0.94;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      sctx.save();
      sctx.globalAlpha = s.life * 0.8;
      sctx.fillStyle = "rgba(220,190,255,1)";
      sctx.shadowColor = "rgba(200,160,255,0.8)"; sctx.shadowBlur = 6;
      sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, Math.PI*2); sctx.fill();
      sctx.restore();
    }
  })();
})();

// ══════════════════════════════════════════════════════════════════════════════
// CURSOR VẾT MỰC
// ══════════════════════════════════════════════════════════════════════════════
(function initInkCursor() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99999999;width:100%;height:100%;opacity:0";
  document.body.appendChild(canvas);
  // Chỉ hiện sau khi vào trang web
  document.addEventListener("introEnded", () => {
    canvas.style.transition = "opacity 0.8s";
    canvas.style.opacity = "1";
  }, {once: true});

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
catImg.addEventListener("mouseleave", () => { catImg.src = "images/pop1.png"; });
catImg.addEventListener("click", () => {
  // Đổi sang bài tiếp theo (hoặc phát nếu đang dừng)
  if (bgMusic.paused) {
    bgMusic.play();
  } else {
    nextTrack();
  }
  // Nhấp nháy pop2 rồi về pop1 sau 200ms
  catImg.src = "images/pop2.png";
  catImg.style.filter = "brightness(2) drop-shadow(0 0 12px rgba(240,150,165,0.9))";
  setTimeout(() => {
    catImg.src = "images/pop1.png";
    catImg.style.filter = "drop-shadow(0 0 8px rgba(240,150,165,0.4))";
  }, 200);
});

// ══════════════════════════════════════════════════════════════════════════════
// TYPING TITLE
// ══════════════════════════════════════════════════════════════════════════════
// Thêm 100 câu hỏi nữa
// ALL_QUESTIONS loaded from questions.js

// Chọn câu hỏi theo ngày — mỗi ngày 1 câu, xoay vòng 200 câu
const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % ALL_QUESTIONS.length;
const TITLE_TEXT = ALL_QUESTIONS[dayIndex];
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
// typeTitle will be triggered after intro ends

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
  { border:"rgb(100,190,255)",  hover:"rgb(150,220,255)",  bg:"rgba(80,175,245,0.15)",  glow:"rgba(100,190,255,0.7)"  }, // xanh băng
  { border:"rgb(80,220,210)",   hover:"rgb(120,248,235)",  bg:"rgba(70,210,200,0.15)",  glow:"rgba(80,220,210,0.7)"   }, // ngọc xanh
  { border:"rgb(140,180,255)",  hover:"rgb(175,210,255)",  bg:"rgba(125,168,250,0.15)", glow:"rgba(140,180,255,0.7)"  }, // xanh lavender lạnh
  { border:"rgb(80,200,240)",   hover:"rgb(120,228,255)",  bg:"rgba(68,190,232,0.15)",  glow:"rgba(80,200,240,0.7)"   }, // xanh cobalt
  { border:"rgb(160,220,255)",  hover:"rgb(195,238,255)",  bg:"rgba(145,210,252,0.15)", glow:"rgba(160,220,255,0.7)"  }, // xanh trời
  { border:"rgb(100,240,220)",  hover:"rgb(140,255,238)",  bg:"rgba(88,232,214,0.15)",  glow:"rgba(100,240,220,0.7)"  }, // aqua
  { border:"rgb(120,160,255)",  hover:"rgb(158,195,255)",  bg:"rgba(108,150,248,0.15)", glow:"rgba(120,160,255,0.7)"  }, // xanh indigo
  { border:"rgb(80,225,200)",   hover:"rgb(118,252,228)",  bg:"rgba(68,218,192,0.15)",  glow:"rgba(80,225,200,0.7)"   }, // teal
  { border:"rgb(170,200,255)",  hover:"rgb(200,225,255)",  bg:"rgba(158,190,252,0.15)", glow:"rgba(170,200,255,0.7)"  }, // periwinkle
  { border:"rgb(90,210,250)",   hover:"rgb(130,235,255)",  bg:"rgba(78,200,245,0.15)",  glow:"rgba(90,210,250,0.7)"   }, // sky
  { border:"rgb(180,210,255)",  hover:"rgb(210,232,255)",  bg:"rgba(168,200,252,0.15)", glow:"rgba(180,210,255,0.7)"  }, // ice blue
  { border:"rgb(70,230,195)",   hover:"rgb(108,255,220)",  bg:"rgba(60,222,188,0.15)",  glow:"rgba(70,230,195,0.7)"   }, // mint lạnh
];

const ICONS_UNLOCKED = ["♡","✦","◈","❋","✿","◇","⟡","❀","✧","◉","꩜","⌘","✺","⊹","❁","⋆","◈","✾","⟢","❃",
  "♡","✦","◈","❋","✿","◇","⟡","❀","✧","◉","꩜","⌘","✺","⊹","❁","⋆","◈","✾","⟢","❃",
  "♡","✦","◈","❋","✿","◇","⟡","❀","✧","◉","꩜","⌘","✺","⊹","❁","⋆","◈","✾","⟢","❃",
  "♡","✦","◈","❋","✿","◇","⟡","❀","✧","◉","꩜","⌘","✺","⊹","❁","⋆","◈","✾","⟢","❃",
  "♡","✦","◈","❋","✿","◇","⟡","❀","✧","◉","꩜","⌘","✺","⊹","❁","⋆","◈","✾","⟢","❃"];

// Apply hover style
function applyHover(box, c, on) {
  if (on) {
    box.style.paddingLeft     = "20px";
    box.style.borderLeftColor = c.hover;
    box.style.borderLeftWidth = "3px";
    box.style.background      = c.bg;
    box.style.boxShadow       = `2px 0 0 ${c.glow}, 4px 0 24px ${c.glow}, 8px 0 40px ${c.glow}`;
    const title = box.querySelector(".box-title");
    const icon  = box.querySelector(".box-icon");
    if (title) { title.style.color = "#f0f5ff"; title.style.textShadow = `0 0 16px ${c.glow}`; }
    if (icon)  { icon.style.transform = "scale(1.18)"; icon.style.filter = `drop-shadow(0 0 6px ${c.glow})`; }
  } else {
    box.style.paddingLeft     = "14px";
    box.style.borderLeftColor = c.border;
    box.style.borderLeftWidth = "3px";
    box.style.background      = "transparent";
    box.style.boxShadow       = "none";
    const title = box.querySelector(".box-title");
    const icon  = box.querySelector(".box-icon");
    if (title) { title.style.color = "#b0c0da"; title.style.textShadow = "none"; }
    if (icon)  { icon.style.transform = "scale(1)"; icon.style.filter = "none"; }
  }
}

// Window mousemove — update hover real-time, no lag
let _lastHovered = null;
window.addEventListener("mousemove", (e) => {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const box = el ? el.closest(".box") : null;

  if (box === _lastHovered) return; // same box, skip

  // Un-hover previous
  if (_lastHovered && _lastHovered._color) {
    _lastHovered._hovered = false;
    applyHover(_lastHovered, _lastHovered._color, false);
  }

  // Hover new
  if (box && box._color) {
    box._hovered = true;
    applyHover(box, box._color, true);
  }

  _lastHovered = box;
}, { passive: true });

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

  // Hover effect dùng window mousemove để không bị lag khi scroll
  box._color = c;
  box.addEventListener("mouseenter", () => { box._hovered = true; applyHover(box, c, true); });
  box.addEventListener("mouseleave", () => { box._hovered = false; applyHover(box, c, false); });

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

  // Box reveal handled by scroll event below
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
                // 🎉 Confetti!
                setTimeout(() => launchConfetti(), 300);
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
  function randomQuote() {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }

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
    <div class="cd-quote" id="cdQuote">${randomQuote()}</div>
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
  // Đổi câu quote mỗi 30 giây
  setInterval(() => {
    const el = document.getElementById("cdQuote");
    if (el) el.textContent = randomQuote();
  }, 30000);

  // Mobile tap — phát sáng rồi tắt
  wrap.addEventListener("touchstart", () => {
    wrap.classList.remove("tapped");
    void wrap.offsetWidth; // reset animation
    wrap.classList.add("tapped");
  }, { passive: true });
  wrap.addEventListener("animationend", () => {
    wrap.classList.remove("tapped");
  });
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

// ══════════════════════════════════════════════════════════════════════════════
// GALLERY ẢNH KỶ NIỆM
// Thêm ảnh vào đây: { date, caption, url } — url là link Cloudinary
// ══════════════════════════════════════════════════════════════════════════════
const GALLERY_PHOTOS = [
  { date: "28/08/2024", caption: "lần đầu gặp nhau", url: "" },
  { date: "14/02/2025", caption: "valentine đầu tiên", url: "" },
  { date: "01/04/2025", caption: "chuyến đi biển",    url: "" },
  { date: "15/05/2025", caption: "sinh nhật em",       url: "" },
];

(function initGallery() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  GALLERY_PHOTOS.forEach(photo => {
    const card = document.createElement("div");
    card.className = "photo-card";

    const imgHTML = photo.url
      ? `<img class="photo-img" src="${photo.url}" alt="${photo.caption}" loading="lazy">`
      : `<div class="photo-img-placeholder">📷</div>`;

    card.innerHTML = `
      ${imgHTML}
      <div class="photo-meta">
        <div class="photo-date">${photo.date}</div>
        <div class="photo-caption">${photo.caption}</div>
      </div>`;
    grid.appendChild(card);
  });
})();

let galleryOpen = true;
function toggleGallery() {
  galleryOpen = !galleryOpen;
  const body    = document.getElementById("galleryBody");
  const chevron = document.getElementById("galleryChevron");
  body.style.display    = galleryOpen ? "block" : "none";
  chevron.style.transform = galleryOpen ? "rotate(0deg)" : "rotate(-90deg)";
}

// ══════════════════════════════════════════════════════════════════════════════
// INTRO SCREEN — cánh cửa mở ra ký ức (full features)
// ══════════════════════════════════════════════════════════════════════════════
(function initIntro() {
  const screen    = document.getElementById("introScreen");
  const preScreen = document.getElementById("preWelcome");

  // ── Pre-welcome: click anywhere → vào welcome screen ──────────────────
  screen.style.display    = "none"; // Ẩn intro
  screen.style.visibility = "hidden";

  function enterWelcome() {
    // Start welcome music
    welcomeMusic.volume = 0.18;
    welcomeMusic.play().catch(() => {});

    // Show intro screen ngay lập tức (đằng sau pre-welcome)
    screen.style.display    = "flex";
    screen.style.visibility = "visible";
    startIntroAnimation();

    // Fade out pre-welcome sau đó
    preScreen.style.opacity = "0";
    setTimeout(() => {
      preScreen.style.display = "none";
    }, 1000);
  }

  preScreen.addEventListener("click",      enterWelcome, { once: true });
  preScreen.addEventListener("touchstart", enterWelcome, { once: true, passive: true });

  const cv = document.getElementById("introCanvas");
  const cx     = cv.getContext("2d");
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  const W = cv.width, H = cv.height;

  // ── 6. Màu nền theo giờ ─────────────────────────────────────────────────
  const hour = new Date().getHours();
  let bgColor;
  if      (hour >= 5  && hour < 9)  bgColor = "#071520"; // bình minh — xanh băng navy
  else if (hour >= 9  && hour < 17) bgColor = "#080510"; // ban ngày — tím xanh trung tính
  else if (hour >= 17 && hour < 20) bgColor = "#0a0618"; // chiều — tím đêm
  else                               bgColor = "#020308"; // đêm — đen xanh sâu
  screen.style.background = bgColor;
  screen.style.transition = "background 3s ease";

  // ── Stars background (setup, runs always) ──────────────────────────────
  const STARS = Array.from({length: 150}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    vx: (Math.random()-.5)*.25, vy: (Math.random()-.5)*.25,
    r: Math.random()*1.6+.3,
    a: Math.random()*.55+.08,
    c: ['255,255,255','210,190,255','175,215,255','255,210,240'][Math.floor(Math.random()*4)],
    tw: Math.random()*Math.PI*2,
  }));

  // ── 4. Hình trái tim mờ bằng hạt sao ────────────────────────────────────
  const HEART_STARS = Array.from({length: 80}, (_, i) => {
    const t = (i / 80) * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t));
    const scale = Math.min(W, H) * 0.028;
    return {
      bx: W/2 + hx*scale + (Math.random()-0.5)*scale*0.8,
      by: H/2 + hy*scale + (Math.random()-0.5)*scale*0.8,
      r: Math.random()*1.2+0.3,
      tw: Math.random()*Math.PI*2,
      alpha: 0,
    };
  });
  let heartVisible = false;

  // ── 1. Cursor sparkle trail ──────────────────────────────────────────────
  const sparkles = [];
  let mx = -999, my = -999;
  screen.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    for (let i = 0; i < 3; i++) {
      sparkles.push({
        x: mx + (Math.random()-0.5)*12,
        y: my + (Math.random()-0.5)*12,
        r: Math.random()*2.5+0.5,
        life: 1,
        vx: (Math.random()-0.5)*1.2,
        vy: (Math.random()-0.5)*1.2 - 0.5,
        c: ['200,230,255','160,210,255','140,225,250','220,240,255'][Math.floor(Math.random()*4)],
      });
    }
  });

  let tt = 0, done = false;
  function loopIntro() {
    requestAnimationFrame(loopIntro);
    cx.clearRect(0, 0, W, H);
    tt += .01;

    // Stars
    STARS.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      const a = p.a*(0.35+0.65*Math.sin(tt+p.tw));
      cx.save(); cx.globalAlpha=a;
      cx.fillStyle=`rgb(${p.c})`;
      cx.shadowColor=`rgba(${p.c},.55)`; cx.shadowBlur=7;
      cx.beginPath(); cx.arc(p.x,p.y,p.r,0,Math.PI*2); cx.fill();
      cx.restore();
    });

    // Heart stars
    if (heartVisible) {
      HEART_STARS.forEach(p => {
        if (p.alpha < 0.06) p.alpha += 0.0008;
        cx.save(); cx.globalAlpha = p.alpha*(0.5+0.5*Math.sin(tt*1.5+p.tw));
        cx.fillStyle = "rgba(220,180,255,1)";
        cx.shadowColor = "rgba(200,150,255,0.6)"; cx.shadowBlur = 4;
        cx.beginPath(); cx.arc(p.bx,p.by,p.r,0,Math.PI*2); cx.fill();
        cx.restore();
      });
    }

    // Sparkles
    for (let i = sparkles.length-1; i >= 0; i--) {
      const s = sparkles[i];
      s.life -= 0.045;
      s.x += s.vx; s.y += s.vy;
      s.r *= 0.96;
      if (s.life <= 0) { sparkles.splice(i,1); continue; }
      cx.save(); cx.globalAlpha = s.life * 0.9;
      cx.fillStyle = `rgb(${s.c})`;
      cx.shadowColor = `rgba(${s.c},0.8)`; cx.shadowBlur = 8;
      cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, Math.PI*2); cx.fill();
      // Star shape
      cx.restore();
    }
  }
  loopIntro();

  const ov = document.getElementById("introOv");
  const iw = document.getElementById("introWrap");
  const fl = document.getElementById("introFl");

  // ── 5. Typewriter sound ──────────────────────────────────────────────────
  // Dùng 1 AudioContext duy nhất
  let _actx = null;
  function getACtx() {
    if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
    return _actx;
  }

  function playClick(ch) {
    // Bỏ qua khoảng trắng và dấu câu
    if (!ch || " .,!?…·–".includes(ch)) return;
    try {
      const actx = getACtx();
      const osc  = actx.createOscillator();
      const gain = actx.createGain();
      osc.connect(gain); gain.connect(actx.destination);
      // Tần số ngẫu nhiên nhẹ — giống máy đánh chữ
      const freq = 480 + Math.random() * 180;
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, actx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.06, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.04);
      osc.start(actx.currentTime);
      osc.stop(actx.currentTime + 0.04);
    } catch(e){}
  }

  // ── Typing function — sound sync với chữ ────────────────────────────────
  function typeText(el, text, speed, callback) {
    el.textContent = "";
    let i = 0;
    function next() {
      if (i >= text.length) { if(callback) callback(); return; }
      const ch = text[i++];
      el.textContent += ch;
      playClick(ch);
      setTimeout(next, speed + (ch === " " ? 0 : Math.random() * 15));
    }
    setTimeout(next, 0);
  }

  // ── 2. Glow theo cursor + màu theo giờ ─────────────────────────────────
  const h = new Date().getHours();
  let charColor;
  if      (h >= 5  && h < 9)  charColor = "rgba(140,210,255,1)";  // sáng — xanh băng
  else if (h >= 9  && h < 17) charColor = "rgba(160,220,255,1)";  // trưa — xanh trời
  else if (h >= 17 && h < 20) charColor = "rgba(140,190,255,1)";  // chiều — xanh cobalt
  else                         charColor = "rgba(170,200,255,1)";  // đêm — xanh bạc

  function makeRipple(el) {
    const text = el.textContent;
    el.innerHTML = text.split("").map((ch, i) =>
      ch === " " ? `<span style="display:inline-block;width:0.28em"> </span>` :
      `<span class="rch" data-i="${i}" style="display:inline-block;transition:color 0.2s,text-shadow 0.2s">${ch}</span>`
    ).join("");

    // Chỉ đúng chữ đang hover mới sáng + nhô lên
    el.querySelectorAll(".rch").forEach(s => {
      s.addEventListener("mouseenter", () => {
        s.style.color      = charColor;
        s.style.textShadow = `0 0 20px ${charColor}, 0 0 40px ${charColor}`;
        s.style.transform  = "translateY(-5px) scale(1.25)";
      });
      s.addEventListener("mouseleave", () => {
        s.style.color = ""; s.style.textShadow = ""; s.style.transform = "";
      });
    });
  }

  // ── Sequence ─────────────────────────────────────────────────────────────
  const welcomeMusic = document.getElementById("welcomeMusic");

  // welcomeMusic started in enterWelcome
  // Fade in overlay
  function startIntroAnimation() {
  setTimeout(() => { ov.style.opacity = "0"; }, 300);
  setTimeout(() => {
    iw.classList.add("show");
    const big  = document.getElementById("introBig");
    const sml  = document.getElementById("introSmall");
    const btn  = document.getElementById("introBtn");
    const cred = document.getElementById("introCredit");
    const div  = document.getElementById("introDivider");
    const dots = document.getElementById("introDots");

    big.textContent=""; sml.textContent="";
    btn.textContent=""; cred.textContent="";
    div.style.opacity="0";

    typeText(big, "Hạnh phúc có hình hài gì vậy?", 55, () => {
      makeRipple(big);
      // Heart xuất hiện
      setTimeout(() => { heartVisible = true; }, 400);

      setTimeout(() => {
        div.style.transition="opacity 0.8s";
        div.style.opacity="1";
      }, 300);

      setTimeout(() => {
        typeText(sml, "Có lẽ… là những ký ức chưa từng rời đi.", 45, () => {

          // ── 3. Countdown dots với tick to ────────────────────────────
          function playTick(freq, vol) {
            try {
              const actx = new (window.AudioContext || window.webkitAudioContext)();
              const osc  = actx.createOscillator();
              const gain = actx.createGain();
              osc.connect(gain); gain.connect(actx.destination);
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, actx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(freq * 0.5, actx.currentTime + 0.12);
              gain.gain.setValueAtTime(vol, actx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.18);
              osc.start(); osc.stop(actx.currentTime + 0.2);
            } catch(e){}
          }

          let dotCount = 0;
          dots.style.opacity = "1";
          const dotInterval = setInterval(() => {
            dotCount++;
            dots.textContent = "✦".repeat(dotCount);
            // Tick to dần lên — 3 tiếng đếm ngược
            if      (dotCount === 1) playTick(420, 0.18);
            else if (dotCount === 2) playTick(520, 0.22);
            else if (dotCount === 3) playTick(680, 0.30);
            if (dotCount >= 3) {
              clearInterval(dotInterval);
              setTimeout(() => {
                dots.style.opacity = "0";
                setTimeout(() => {
                  typeText(btn, "chạm để bước vào nơi lưu giữ kí ức của bọn mình nhé", 28, () => {
                    setTimeout(() => {
                      typeText(cred, "được tạo bởi Pom · được nuôi dưỡng bằng tình cảm của bé Bư", 22);
                    }, 300);
                  });
                }, 300);
              }, 400);
            }
          }, 500);
        });
      }, 600);
    });
  }, 1400);

  } // end startIntroAnimation

  // ── Click enter ──────────────────────────────────────────────────────────
  document.getElementById("introBtn").addEventListener("click", () => {
    if (done) return; done = true;

    iw.style.transition = "filter 1.4s ease, opacity 1.4s ease, transform 1.4s ease";
    iw.style.filter     = "blur(14px)";
    iw.style.opacity    = "0";
    iw.style.transform  = "translateY(-28px) scale(1.04)";
    cv.style.transition = "opacity 1.5s ease";
    cv.style.opacity    = "0";

    setTimeout(() => { fl.style.transition="opacity 0.3s"; fl.style.opacity="0.12"; }, 500);
    setTimeout(() => { fl.style.transition="opacity 1.3s"; fl.style.opacity="0";    }, 820);
    setTimeout(() => { ov.style.transition="opacity 1.3s"; ov.style.opacity="1";    }, 1100);
    setTimeout(() => {
      // Fade out welcome music
      const wm = document.getElementById("welcomeMusic");
      if (wm) {
        const fadeOut = setInterval(() => {
          if (wm.volume > 0.02) wm.volume = Math.max(0, wm.volume - 0.02);
          else { wm.pause(); wm.currentTime = 0; clearInterval(fadeOut); }
        }, 80);
      }
      screen.style.display = "none";
      bgMusic.play().catch(()=>{});
      document.dispatchEvent(new Event("introEnded"));

      // Đổi màu nền trang chính theo giờ
      const hr = new Date().getHours();
      let mainBg;
      if      (hr >= 5  && hr < 9)  mainBg = "#071520"; // bình minh — xanh băng
      else if (hr >= 9  && hr < 17) mainBg = "#080510"; // ban ngày — tím xanh
      else if (hr >= 17 && hr < 20) mainBg = "#0a0618"; // chiều — tím đêm
      else                           mainBg = "#020308"; // đêm — đen sâu
      document.body.style.transition = "background 2s ease";
      document.body.style.background = mainBg;
      // Show cat + volume bar + typing cursor
      setTimeout(() => {
        const cat = document.getElementById("musicCat");
        const vol = document.getElementById("volumeBar");
        const cur = document.getElementById("typingCursor");
        if (cat) cat.style.opacity = "1";
        if (vol) vol.style.opacity = "1";
        if (cur) cur.style.display = "inline";
      }, 500);

      // ── Reveal trang web từ từ sau intro ────────────────────────────────
      function slideIn(el, delay, fromLeft) {
        if (!el) return;
        el.style.opacity   = "0";
        el.style.transform = fromLeft ? "translateX(-40px)" : "translateX(40px)";
        el.style.transition = "none";
        setTimeout(() => {
          el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
          el.style.opacity    = "1";
          el.style.transform  = "translateX(0)";
        }, delay);
      }

      function typeEl(el, text, speed, delay, callback) {
        if (!el) return;
        setTimeout(() => {
          el.textContent = "";
          el.style.opacity = "1";
          el.style.transform = "none";
          let i = 0;
          const iv = setInterval(() => {
            el.textContent += text[i]; i++;
            if (i >= text.length) { clearInterval(iv); if(callback) callback(); }
          }, speed);
        }, delay);
      }

      // 1. Gallery fade in
      const galEl = document.getElementById("gallerySection");
      if (galEl) { galEl.style.opacity="0"; setTimeout(()=>{ galEl.style.transition="opacity 0.7s ease"; galEl.style.opacity="1"; }, 300); }

      // 2. Layout chính trôi vào từ dưới
      const layout = document.querySelector(".main-layout");
      if (layout) {
        layout.style.opacity = "0";
        setTimeout(() => {
          layout.style.transition = "opacity 0.8s ease";
          layout.style.opacity    = "1";
        }, 600);
      }

      // 3. Countdown fade in
      const spEl = document.querySelector(".side-panel");
      if (spEl) { spEl.style.opacity="0"; setTimeout(()=>{ spEl.style.transition="opacity 0.7s ease"; spEl.style.opacity="1"; }, 900); }

      // Ẩn tất cả text trước
      const titleEl    = document.getElementById("mainTitle");
      const subtitleEl = document.querySelector(".subtitle");
      const msgEl      = document.getElementById("galleryMessage");
      const galTitle   = document.querySelector("#galleryTitle");

      if (titleEl)    { titleEl.style.opacity = "0"; typingEl.textContent = ""; }
      if (subtitleEl) { subtitleEl.style.opacity = "0"; subtitleEl.textContent = ""; }
      if (msgEl)      { msgEl.style.opacity = "0"; msgEl.textContent = ""; }
      if (galTitle)   galTitle.style.opacity = "0";

      // Delay rồi bắt đầu sequence gõ chữ
      setTimeout(() => {
        // Step 1: Title gõ (dùng typeTitle gốc)
        if (titleEl) titleEl.style.opacity = "1";
        typeTitle();

        // Step 2: Subtitle sau title
        const subDelay = TITLE_TEXT.length * 90 + 300;
        setTimeout(() => {
          if (subtitleEl) {
            subtitleEl.style.opacity = "1";
            const subText = "mong rằng sự đồng hành cùng em có thể giúp anh hiểu hơn về nó";
            let i = 0;
            const iv = setInterval(() => {
              subtitleEl.textContent += subText[i]; i++;
              if (i >= subText.length) clearInterval(iv);
            }, 30);
          }
        }, subDelay);

        // Step 3: Gallery title
        const galDelay = subDelay + 60 * 30 + 300;
        setTimeout(() => {
          if (galTitle) {
            galTitle.style.transition = "opacity 0.6s";
            galTitle.style.opacity = "1";
          }
        }, galDelay);

        // Step 4: Gallery message gõ
        setTimeout(() => {
          if (msgEl) {
            msgEl.style.opacity = "1";
            const msgText = "Vợ chồng mình chưa có nhiều câu chuyện chung để kể, chưa có quá nhiều khoảnh khắc đáng nhớ được lưu lại, nhưng chồng nghĩ điều đó không quan trọng bằng việc mình vẫn còn ở đây, vẫn còn muốn bước tiếp cùng nhau. Vì kỷ niệm không phải thứ tự nhiên có, mà là thứ được tạo ra từ những ngày mình chọn ở bên nhau. Vậy cùng chồng viết lên đây những câu chuyện riêng của bọn mình nhé!!";
            let i = 0;
            const iv = setInterval(() => {
              msgEl.textContent += msgText[i]; i++;
              if (i >= msgText.length) clearInterval(iv);
            }, 16);
          }
        }, galDelay + 500);

      }, 800);

      // 6. Từng lá thư xuất hiện từ trên xuống, đúng thứ tự
      setTimeout(() => {
        const boxes = Array.from(document.querySelectorAll(".box"));
        const revealed = new Set();

        boxes.forEach(box => {
          box.style.opacity    = "0";
          box.style.filter     = "blur(6px)";
          box.style.transition = "none";
        });

        function revealBoxes() {
          const vh = window.innerHeight;
          // Lấy tất cả box chưa reveal và đang trong viewport, sort theo vị trí trên xuống
          const toReveal = boxes.filter(box => {
            if (revealed.has(box)) return false;
            const rect = box.getBoundingClientRect();
            return rect.top < vh + 40;
          });

          // Reveal theo thứ tự index với delay nhỏ
          toReveal.forEach((box, i) => {
            revealed.add(box);
            setTimeout(() => {
              box.style.transition = "opacity 0.6s ease, filter 0.6s ease";
              box.style.opacity    = "1";
              box.style.filter     = "blur(0px)";
              box.style.transform  = "none";
            }, i * 60);
          });
        }

        revealBoxes();
        window.addEventListener("scroll", revealBoxes, { passive: true });
      }, 1000);
    }, 2600);
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// CONFETTI KHI MỞ THƯ
// ══════════════════════════════════════════════════════════════════════════════
function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99998;";
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const COLORS = [
    "rgba(100,190,255,0.9)",  // xanh băng
    "rgba(80,220,210,0.9)",   // ngọc
    "rgba(160,200,255,0.9)",  // xanh nhạt
    "rgba(200,220,255,0.9)",  // trắng xanh
    "rgba(140,180,255,0.9)",  // lavender
    "rgba(255,255,255,0.85)", // trắng
  ];

  const particles = Array.from({length: 80}, () => ({
    x: window.innerWidth  * Math.random(),
    y: window.innerHeight * Math.random() - window.innerHeight,
    w: 5 + Math.random() * 7,
    h: 3 + Math.random() * 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 4,
    vr: (Math.random() - 0.5) * 0.2,
    alpha: 1,
  }));

  let frame = 0;
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    let alive = false;

    particles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.08; // gravity
      p.rot += p.vr;
      if (frame > 80) p.alpha -= 0.015;
      if (p.alpha <= 0) return;
      alive = true;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });

    if (alive) requestAnimationFrame(loop);
    else canvas.remove();
  }
  loop();
}