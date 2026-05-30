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
// BOX_COLORS theo giờ trong ngày
function getBoxColors() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return [ // sáng — hồng
    { border:"rgb(240,130,180)", hover:"rgb(255,170,210)", bg:"rgba(230,110,165,0.15)", glow:"rgba(240,130,180,0.7)" },
    { border:"rgb(255,150,200)", hover:"rgb(255,185,220)", bg:"rgba(245,130,185,0.15)", glow:"rgba(255,150,200,0.7)" },
    { border:"rgb(220,110,160)", hover:"rgb(248,150,195)", bg:"rgba(210,95,148,0.15)",  glow:"rgba(220,110,160,0.7)" },
    { border:"rgb(255,120,175)", hover:"rgb(255,158,205)", bg:"rgba(245,105,162,0.15)", glow:"rgba(255,120,175,0.7)" },
    { border:"rgb(235,140,185)", hover:"rgb(255,175,215)", bg:"rgba(225,122,172,0.15)", glow:"rgba(235,140,185,0.7)" },
    { border:"rgb(255,160,195)", hover:"rgb(255,192,220)", bg:"rgba(245,142,178,0.15)", glow:"rgba(255,160,195,0.7)" },
    { border:"rgb(210,100,155)", hover:"rgb(240,140,190)", bg:"rgba(200,85,142,0.15)",  glow:"rgba(210,100,155,0.7)" },
    { border:"rgb(255,135,180)", hover:"rgb(255,170,210)", bg:"rgba(245,118,168,0.15)", glow:"rgba(255,135,180,0.7)" },
    { border:"rgb(230,120,170)", hover:"rgb(252,158,202)", bg:"rgba(220,104,158,0.15)", glow:"rgba(230,120,170,0.7)" },
    { border:"rgb(255,145,190)", hover:"rgb(255,180,218)", bg:"rgba(245,128,175,0.15)", glow:"rgba(255,145,190,0.7)" },
    { border:"rgb(215,105,160)", hover:"rgb(245,142,194)", bg:"rgba(205,88,148,0.15)",  glow:"rgba(215,105,160,0.7)" },
    { border:"rgb(250,130,178)", hover:"rgb(255,165,208)", bg:"rgba(240,113,165,0.15)", glow:"rgba(250,130,178,0.7)" },
  ];
  if (h >= 10 && h < 17) return [ // trưa — xanh
    { border:"rgb(100,190,255)", hover:"rgb(150,220,255)", bg:"rgba(80,175,245,0.15)",  glow:"rgba(100,190,255,0.7)" },
    { border:"rgb(80,220,210)",  hover:"rgb(120,248,235)", bg:"rgba(70,210,200,0.15)",  glow:"rgba(80,220,210,0.7)"  },
    { border:"rgb(140,210,255)", hover:"rgb(175,238,255)", bg:"rgba(125,198,252,0.15)", glow:"rgba(140,210,255,0.7)" },
    { border:"rgb(80,200,240)",  hover:"rgb(120,228,255)", bg:"rgba(68,190,232,0.15)",  glow:"rgba(80,200,240,0.7)"  },
    { border:"rgb(160,220,255)", hover:"rgb(195,238,255)", bg:"rgba(145,210,252,0.15)", glow:"rgba(160,220,255,0.7)" },
    { border:"rgb(100,240,220)", hover:"rgb(140,255,238)", bg:"rgba(88,232,214,0.15)",  glow:"rgba(100,240,220,0.7)" },
    { border:"rgb(120,200,255)", hover:"rgb(158,228,255)", bg:"rgba(108,188,248,0.15)", glow:"rgba(120,200,255,0.7)" },
    { border:"rgb(80,225,200)",  hover:"rgb(118,252,228)", bg:"rgba(68,218,192,0.15)",  glow:"rgba(80,225,200,0.7)"  },
    { border:"rgb(170,215,255)", hover:"rgb(200,238,255)", bg:"rgba(158,202,252,0.15)", glow:"rgba(170,215,255,0.7)" },
    { border:"rgb(90,210,250)",  hover:"rgb(130,235,255)", bg:"rgba(78,200,245,0.15)",  glow:"rgba(90,210,250,0.7)"  },
    { border:"rgb(140,230,215)", hover:"rgb(175,255,238)", bg:"rgba(128,220,204,0.15)", glow:"rgba(140,230,215,0.7)" },
    { border:"rgb(100,195,255)", hover:"rgb(140,225,255)", bg:"rgba(88,182,248,0.15)",  glow:"rgba(100,195,255,0.7)" },
  ];
  if (h >= 17 && h < 21) return [ // chiều — tím
    { border:"rgb(180,120,255)", hover:"rgb(210,158,255)", bg:"rgba(168,105,248,0.15)", glow:"rgba(180,120,255,0.7)" },
    { border:"rgb(200,140,255)", hover:"rgb(228,172,255)", bg:"rgba(188,125,248,0.15)", glow:"rgba(200,140,255,0.7)" },
    { border:"rgb(160,100,240)", hover:"rgb(195,135,255)", bg:"rgba(148,88,232,0.15)",  glow:"rgba(160,100,240,0.7)" },
    { border:"rgb(210,150,255)", hover:"rgb(235,182,255)", bg:"rgba(198,135,248,0.15)", glow:"rgba(210,150,255,0.7)" },
    { border:"rgb(175,115,255)", hover:"rgb(205,150,255)", bg:"rgba(162,100,248,0.15)", glow:"rgba(175,115,255,0.7)" },
    { border:"rgb(220,160,255)", hover:"rgb(245,190,255)", bg:"rgba(208,145,248,0.15)", glow:"rgba(220,160,255,0.7)" },
    { border:"rgb(155,90,235)",  hover:"rgb(188,125,255)", bg:"rgba(142,78,225,0.15)",  glow:"rgba(155,90,235,0.7)"  },
    { border:"rgb(195,130,255)", hover:"rgb(222,162,255)", bg:"rgba(182,115,248,0.15)", glow:"rgba(195,130,255,0.7)" },
    { border:"rgb(170,105,248)", hover:"rgb(200,138,255)", bg:"rgba(158,92,238,0.15)",  glow:"rgba(170,105,248,0.7)" },
    { border:"rgb(205,145,255)", hover:"rgb(232,178,255)", bg:"rgba(192,130,248,0.15)", glow:"rgba(205,145,255,0.7)" },
    { border:"rgb(185,125,255)", hover:"rgb(215,158,255)", bg:"rgba(172,110,248,0.15)", glow:"rgba(185,125,255,0.7)" },
    { border:"rgb(215,155,255)", hover:"rgb(240,185,255)", bg:"rgba(202,140,248,0.15)", glow:"rgba(215,155,255,0.7)" },
  ];
  return [ // đêm — xanh cobalt lạnh
    { border:"rgb(80,150,220)",  hover:"rgb(120,185,250)", bg:"rgba(68,138,212,0.15)",  glow:"rgba(80,150,220,0.7)"  },
    { border:"rgb(60,200,190)",  hover:"rgb(95,230,222)",  bg:"rgba(50,190,182,0.15)",  glow:"rgba(60,200,190,0.7)"  },
    { border:"rgb(100,165,235)", hover:"rgb(138,198,255)", bg:"rgba(88,152,225,0.15)",  glow:"rgba(100,165,235,0.7)" },
    { border:"rgb(70,185,210)",  hover:"rgb(105,218,240)", bg:"rgba(60,175,202,0.15)",  glow:"rgba(70,185,210,0.7)"  },
    { border:"rgb(110,175,240)", hover:"rgb(148,205,255)", bg:"rgba(98,162,232,0.15)",  glow:"rgba(110,175,240,0.7)" },
    { border:"rgb(65,195,185)",  hover:"rgb(100,225,218)", bg:"rgba(55,185,178,0.15)",  glow:"rgba(65,195,185,0.7)"  },
    { border:"rgb(90,158,228)",  hover:"rgb(128,192,255)", bg:"rgba(78,145,220,0.15)",  glow:"rgba(90,158,228,0.7)"  },
    { border:"rgb(75,205,195)",  hover:"rgb(110,235,225)", bg:"rgba(62,195,188,0.15)",  glow:"rgba(75,205,195,0.7)"  },
    { border:"rgb(105,170,238)", hover:"rgb(142,202,255)", bg:"rgba(92,158,228,0.15)",  glow:"rgba(105,170,238,0.7)" },
    { border:"rgb(72,190,215)",  hover:"rgb(108,222,245)", bg:"rgba(60,180,208,0.15)",  glow:"rgba(72,190,215,0.7)"  },
    { border:"rgb(95,162,232)",  hover:"rgb(132,195,255)", bg:"rgba(82,150,222,0.15)",  glow:"rgba(95,162,232,0.7)"  },
    { border:"rgb(68,198,188)",  hover:"rgb(104,228,220)", bg:"rgba(56,188,180,0.15)",  glow:"rgba(68,198,188,0.7)"  },
  ];
}
const BOX_COLORS = getBoxColors();

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

                // Thêm chữ ký vào cuối
                const sigHtml = `<div id="letterSig" style="
                  margin-top:32px; padding-top:20px;
                  border-top:1px solid rgba(200,180,255,0.12);
                  text-align:right; opacity:0;
                  transition: opacity 1.2s ease 0.8s;
                ">
                  <div style="font-family:'Dancing Script',cursive;font-size:28px;color:rgba(210,190,255,0.8);line-height:1.4">Phong</div>
                  <div style="font-size:10px;letter-spacing:3px;color:rgba(160,140,200,0.35);font-family:sans-serif;margin-top:4px">chồng yêu của vợ</div>
                </div>`;
                lc.innerHTML = data.content.replace(/\n/g,'<br>') + sigHtml;

                gsap.fromTo(lc,
                  { opacity: 0, y: 20 },
                  { opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
                    onComplete: () => {
                      const sig = document.getElementById("letterSig");
                      if (sig) sig.style.opacity = "1";
                    }
                  }
                );
                // 🎉 Particles + border cycle
                setTimeout(() => launchConfetti(), 300);
                startModalBorderCycle();
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
  stopConfetti();
  clearInterval(_borderInterval);
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
// BẦU TRỜI SAO TƯƠNG TÁC — click vào sao để hiện quote
// ══════════════════════════════════════════════════════════════════════════════
(function initStarClick() {
  const STAR_QUOTES = [
    "chồng nhớ vợ quá điiiiii",
    "hôm nay điều chồng thích nhất là được nói chuyện với vợ đóoo",
    "có những lúc chồng đang làm gì đó tự nhiên lại nhớ vợ ngang luôn á",
    "vợ biết không, chồng thích được gọi em là vợ lắm luônnn",
    "chồng nghĩ người làm chồng hạnh phúc nhất hiện tại chính là vợ đó nhaaa",
    "nhiều khi chồng nhìn tin nhắn của vợ rồi cười một mình vậy đó!!!",
    "chồng nhớ giọng vợ ghê luônnn",
    "có những ngày chẳng có gì vui hết, nhưng có vợ ở cạnh làm chồng yên tâm hơn đó",
    "chồng thích nhất là cảm giác được vợ quan tâm áaaa",
    "vợ ơiiiii, sao vợ đáng yêu dữ vậy trời",
    "chồng nghĩ mình nghiện vợ mất rồi đóoo",
    "đôi lúc chồng chỉ muốn được ở bên vợ thật lâu thuiii",
    "cảm giác được yêu vợ là một điều rất rất đẹp luôn ấy",
    "chồng nhớ những lần hai đứa ngồi nói chuyện tới khuyaaaa",
    "có những lúc đang đi đâu đó, tự nhiên chồng ước gì vợ ở cạnh",
    "chồng thích nghe vợ kể linh tinh lắm luônnn",
    "kể cả lúc vợ kể những chuyện chẳng đâu vào đâu áaa",
    "chồng thấy may mắn ghê vì được gặp vợ",
    "chồng thương em bé của chồng dữ lắm đó nhaaa",
    "có khi nào vợ nhớ chồng nhiều như chồng nhớ vợ honggg",
    "chồng thích những lần vợ gọi 'chồng ơi' lắm lắm",
    "nghe vợ nói yêu xong trong lòng bình yên hẳn luôn á trờiii",
    "nhiều lúc chồng chẳng biết diễn tả sao nữa, chỉ biết là thương vợ lắm",
    "nếu được chọn nơi bình yên nhất thì chắc chồng chọn chỗ có vợ!!!",
    "hôm nay chồng lại nhớ vợ thêm một chút nữaaaa",
    "có những ngày chồng vui chỉ vì vợ cười thôi đó",
    "chồng thích nhìn vợ hạnh phúc lắm luônnn",
    "chồng yêu em lắm",
    "chồng cảm thấy cuộc sống dễ thương hơn từ khi có vợ",
    "đôi lúc chồng ngồi nghĩ về tương lai rồi lại thầm mong vợ vẫn ở trong đóooo",
    "tự nhiên thấy vui ghê luôn á, vì có vợ yêu",
    "chồng nhớ nụ cười của vợ quáaaa",
    "nhớ cái cách vợ nói chuyện nữaaaa",
    "nhớ tất cả mọi thứ thuộc về vợ luôn áaa",
    "chồng thích được chăm sóc vợ lắm nhaaa",
    "thấy vợ vui là chồng vui theo luôn",
    "vợ là điều đẹp nhất xảy ra với chồng trong một khoảng thời gian rất dài đóoo",
    "chồng vẫn còn bất ngờ vì mình lại yêu vợ nhiều như vậy",
    "nhiều hơn chồng nghĩ luôn áaa",
    "có những lúc chồng nhớ vợ tới mức chẳng muốn làm gì khác nữa",
    "chỉ muốn tìm vợ thuiii",
    "chồng thích những cuộc gọi dài thật dàiiii với vợ",
    "chồng thích nghe vợ cười!!!",
    "thích lắm luônnn",
    "nhiều khi nhìn ảnh vợ thôi cũng thấy vui rồi",
    "chồng nghĩ một trong những điều đúng đắn nhất mình từng làm là yêu vợ",
    "vợ làm cho những ngày bình thường trở nên đặc biệt ghê á",
    "chồng mong sau này mình có thật nhiều kỷ niệm cùng nhau nhaaa",
    "chồng nhớ vợ òoooo",
    "và chồng yêu vợ nữaaaa",
    "chồng vừa thấy một thứ dễ thương, tự nhiên lại nghĩ tới vợ",
    "không biết giờ này vợ đang làm gì nhỉii",
    "chồng thích cái cảm giác được kể với vợ về những chuyện xảy ra trong ngày lắm",
    "có những chuyện chẳng đáng để kể với ai hết, nhưng chồng vẫn muốn kể cho vợ nghe",
    "nhiều khi chồng thấy một cảnh đẹp rồi tiếc vì vợ chưa ở đó cùng chồng",
    "vợ có biết mình xuất hiện trong suy nghĩ của chồng nhiều tới mức nào honggg",
    "chồng vừa định tập trung làm việc á, xong lại nhớ vợ",
    "yêu vợ thiệt sự luôn đóoo",
    "có những ngày chồng mở điện thoại lên chỉ để xem vợ có nhắn gì chưa",
    "nhìn thấy tên vợ hiện lên là tâm trạng tốt hơn hẳn luôn á",
    "chồng thích những lúc vợ kể về tuổi thơ của vợ",
    "cảm giác như chồng đang được hiểu em nhiều hơn một chút",
    "chồng mong sau này sẽ biết hết những câu chuyện mà vợ từng trải qua",
    "kể cả những chuyện vui",
    "kể cả những chuyện khiến vợ buồn",
    "vì chồng muốn hiểu vợ thật nhiều",
    "có những đêm chồng nằm nghĩ về vợ lâu hơn dự định",
    "xong tới lúc nhìn đồng hồ mới giật mình luônnn",
    "chồng thích nghe vợ cười tới mức khó giải thích luôn á",
    "kiểu nghe một cái là thấy ngày hôm đó đáng giá rồi",
    "đôi khi chồng thấy hạnh phúc chỉ vì được tồn tại trong cuộc sống của vợ",
    "nghe hơi sến nhưng mà là thật đóooo",
    "có những lúc chồng đọc lại tin nhắn cũ của hai đứa",
    "rồi ngồi cười một mình!!!",
    "chồng thích cách vợ xuất hiện trong những ngày bình thường nhất",
    "chẳng cần làm gì đặc biệt hết",
    "chỉ cần là vợ thôi",
    "nhiều lúc chồng nghĩ nếu gặp vợ sớm hơn thì hay biết mấy",
    "nhưng mà gặp đúng lúc thế này chắc cũng là điều đẹp nhất rồi",
    "chồng mong sau này mình có thật nhiều ảnh chụp cùng nhau",
    "để lúc già còn ngồi xem lại nữa",
    "nghĩ tới thôi đã thấy dễ thương rồi đóoo",
    "có những ngày chồng nhớ vợ nhiều tới mức chẳng biết phải làm sao luôn",
    "chỉ biết tìm vợ thôi àaa",
    "chồng thích nghe vợ kể hôm nay ăn gì lắm",
    "nghe vô tri vậy thôi chứ chồng thích thiệt",
    "vì đó là chuyện của vợ màaa",
    "đôi lúc chồng tự hỏi không biết kiếp trước mình làm gì tốt mà gặp được vợ nữa",
    "chồng thấy vợ đáng yêu nhất vào những lúc vợ không biết mình đáng yêu",
    "mấy lúc đó tim chồng chịu không nổi luôn á",
    "có những chuyện chồng chưa từng kể ai",
    "nhưng lại muốn kể cho vợ nghe",
    "chồng thích cảm giác được tin tưởng vợ",
    "và được vợ tin tưởng nữa",
    "nếu một ngày thật sự mệt mỏi, điều đầu tiên chồng nghĩ tới là tìm vợ",
    "vì vợ làm chồng thấy yên tâm lắm",
    "chồng mong những ngày không vui của vợ sẽ ngắn hơn một chút nhaaa",
    "còn những ngày vui thì dài thật dàiiii",
    "có em trong cuộc đời là điều khiến chồng biết ơn rất nhiều",
    "vợ ơiiii, chồng thương vợ hơn những gì chồng nói ra nữa đóooo",
  ];

  let quoteIdx = Math.floor(Math.random() * STAR_QUOTES.length);

  function showStarQuote(x, y) {
    // Burst effect
    const burst = document.createElement("div");
    burst.style.cssText = `
      position:fixed; left:${x}px; top:${y}px;
      width:40px; height:40px;
      border-radius:50%;
      background:radial-gradient(circle, rgba(255,255,200,0.9) 0%, rgba(255,230,100,0.3) 50%, transparent 70%);
      transform:translate(-50%,-50%) scale(0);
      pointer-events:none; z-index:9990;
      transition: transform 0.4s cubic-bezier(0.2,0.8,0.3,1), opacity 0.4s ease;
    `;
    document.body.appendChild(burst);
    requestAnimationFrame(() => {
      burst.style.transform = "translate(-50%,-50%) scale(3)";
      burst.style.opacity = "0";
    });
    setTimeout(() => burst.remove(), 500);

    // Quote bubble
    const quote = STAR_QUOTES[quoteIdx % STAR_QUOTES.length];
    quoteIdx++;

    const el = document.createElement("div");
    // Position: keep inside viewport
    const isLeft = x < window.innerWidth / 2;
    el.style.cssText = `
      position:fixed;
      left:${isLeft ? x + 16 : x - 16}px;
      top:${y - 10}px;
      transform:${isLeft ? "translateY(-50%)" : "translate(-100%,-50%)"};
      background:rgba(8,5,20,0.85);
      border:1px solid rgba(220,210,255,0.25);
      border-radius:12px;
      padding:10px 14px;
      font-size:12px;
      font-family:'Be Vietnam Pro', sans-serif;
      font-style:italic;
      color:rgba(220,210,255,0.9);
      max-width:220px;
      line-height:1.6;
      pointer-events:none;
      z-index:9991;
      opacity:0;
      box-shadow: 0 0 20px rgba(180,160,255,0.15);
      transition: opacity 0.4s ease, transform 0.4s ease;
      white-space:normal;
    `;
    el.textContent = quote;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = isLeft
        ? "translateY(calc(-50% - 6px))"
        : "translate(-100%, calc(-50% - 6px))";
    });

    // Fade out after 3s
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = isLeft
        ? "translateY(calc(-50% - 18px))"
        : "translate(-100%, calc(-50% - 18px))";
      setTimeout(() => el.remove(), 500);
    }, 3000);
  }

  // Click on particle canvas → find nearest star
  document.addEventListener("click", (e) => {
    // Bỏ qua click vào box thư, modal, button
    if (e.target.closest(".box, #modal, button, input, #musicCat, #volumeBar, #introScreen, #preWelcome")) return;
    showStarQuote(e.clientX, e.clientY);
  });
})();

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

      // Đổi màu theo giờ — 4 tone chủ đạo
      (function applyTimeTheme() {
        const hr = new Date().getHours();
        let theme;

        if (hr >= 5 && hr < 10) {
          // Sáng — HỒNG nhẹ
          theme = {
            bg: "#080410",
            accent: "rgba(240,150,200,VAL)",
            glow: "rgba(220,120,180,VAL)",
            text: "rgba(240,200,230,VAL)",
            border1: "rgb(230,130,180)",
            border2: "rgb(200,100,160)",
          };
        } else if (hr >= 10 && hr < 17) {
          // Trưa — XANH
          theme = {
            bg: "#050810",
            accent: "rgba(100,190,255,VAL)",
            glow: "rgba(80,170,240,VAL)",
            text: "rgba(190,225,255,VAL)",
            border1: "rgb(100,190,255)",
            border2: "rgb(80,220,210)",
          };
        } else if (hr >= 17 && hr < 21) {
          // Chiều — TÍM
          theme = {
            bg: "#080510",
            accent: "rgba(180,120,255,VAL)",
            glow: "rgba(160,100,240,VAL)",
            text: "rgba(220,190,255,VAL)",
            border1: "rgb(180,120,255)",
            border2: "rgb(140,100,240)",
          };
        } else {
          // Đêm — ĐEN XANH
          theme = {
            bg: "#030308",
            accent: "rgba(80,150,220,VAL)",
            glow: "rgba(60,130,200,VAL)",
            text: "rgba(160,200,240,VAL)",
            border1: "rgb(80,150,220)",
            border2: "rgb(60,200,190)",
          };
        }

        // Apply bg
        document.body.style.transition = "background 3s ease";
        document.body.style.background = theme.bg;

        // Apply CSS variables for dynamic theming
        const root = document.documentElement;
        root.style.setProperty("--time-accent", theme.accent.replace("VAL", "0.8"));
        root.style.setProperty("--time-glow",   theme.glow.replace("VAL", "0.5"));
        root.style.setProperty("--time-text",   theme.text.replace("VAL", "0.85"));

        // Đổi màu BOX_COLORS theo theme — xoay vòng 2 màu chủ đạo
        const boxes = document.querySelectorAll(".box");
        boxes.forEach((box, i) => {
          const c = BOX_COLORS[i % BOX_COLORS.length];
          // Blend màu gốc với tone theme
          box.style.borderLeftColor = i % 2 === 0 ? theme.border1 : (theme.border2 || c.border);
        });

        // Đổi màu chữ title + subtitle
        const h1 = document.getElementById("mainTitle");
        const sub = document.querySelector(".subtitle");
        if (h1)  h1.style.color  = theme.text.replace("VAL", "0.92");
        if (sub) sub.style.color = theme.text.replace("VAL", "0.4");

        // Đổi màu countdown số
        const cdDays = document.getElementById("cdDays");
        if (cdDays) {
          cdDays.style.color = theme.text.replace("VAL", "0.9");
          cdDays.style.textShadow = `0 0 40px ${theme.glow.replace("VAL", "0.4")}`;
        }

      })();
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
// HẠT MÀU RƠI KHI MỞ THƯ — liên tục tới khi đóng
// ══════════════════════════════════════════════════════════════════════════════
let _particleCanvas = null;
let _particleRunning = false;

function getTimeColors() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return [[255,150,200],[255,180,220],[255,120,180],[240,160,210],[255,200,230],[255,255,255]];
  if (h >= 10 && h < 17) return [[100,200,255],[80,230,210],[140,210,255],[160,240,220],[200,230,255],[255,255,255]];
  if (h >= 17 && h < 21) return [[180,120,255],[200,150,255],[160,100,240],[220,180,255],[140,100,220],[255,255,255]];
  return [[80,160,240],[60,200,200],[120,180,255],[100,220,220],[160,200,255],[255,255,255]];
}

function launchConfetti() {
  if (_particleCanvas) return;
  _particleRunning = true;
  const canvas = document.createElement("canvas");
  canvas.id = "particleRain";
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99998;";
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  _particleCanvas = canvas;
  const ctx = canvas.getContext("2d");
  const COLORS = getTimeColors();
  const pool = [];
  let spawnTimer = 0;

  function spawnParticle() {
    const [r,g,b] = COLORS[Math.floor(Math.random() * COLORS.length)];
    pool.push({
      x: Math.random() * canvas.width, y: -10,
      r: 1.5 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 0.4 + Math.random() * 0.8,
      alpha: 0.7 + Math.random() * 0.3,
      col: [r,g,b],
      tw: Math.random() * Math.PI * 2,
      twSpeed: 0.04 + Math.random() * 0.06,
    });
  }

  function drawP(p, a) {
    const [r,g,b] = p.col;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (_particleRunning) {
      spawnTimer++;
      if (spawnTimer % 2 === 0) spawnParticle();
    }
    let anyAlive = false;
    for (let i = pool.length-1; i >= 0; i--) {
      const p = pool[i];
      p.tw += p.twSpeed;
      p.x  += p.vx + Math.sin(p.tw) * 0.5;
      p.y  += p.vy;
      if (!_particleRunning) p.alpha -= 0.03;
      if (p.alpha <= 0 || p.y > canvas.height+10) { pool.splice(i,1); continue; }
      anyAlive = true;
      const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(p.tw * 2.5));
      drawP(p, p.alpha * twinkle);
    }
    if (!_particleRunning && !anyAlive) { canvas.remove(); _particleCanvas = null; return; }
    requestAnimationFrame(loop);
  }
  loop();
}

function stopConfetti() { _particleRunning = false; }


// ══════════════════════════════════════════════════════════════════════════════
// MODAL VIỀN ĐỔI MÀU MỖI 15S
// ══════════════════════════════════════════════════════════════════════════════
let _borderInterval = null;
const BORDER_COLORS = [
  "rgba(100,190,255,0.5)",  // xanh băng
  "rgba(180,120,255,0.5)",  // tím
  "rgba(240,150,200,0.5)",  // hồng
  "rgba(80,220,210,0.5)",   // ngọc
  "rgba(200,200,255,0.5)",  // lavender
  "rgba(140,210,255,0.5)",  // sky
];
let _borderIdx = 0;

function startModalBorderCycle() {
  clearInterval(_borderInterval);
  const modal = document.querySelector(".modal-content");
  if (!modal) return;
  modal.style.transition = "border-color 2s ease, box-shadow 2s ease";

  function applyBorder() {
    const c = BORDER_COLORS[_borderIdx % BORDER_COLORS.length];
    const glow = c.replace("0.5)", "0.15)");
    modal.style.borderColor = c;
    modal.style.boxShadow   = `0 0 40px ${glow}, 0 0 80px ${glow}`;
    _borderIdx++;
  }
  applyBorder();
  _borderInterval = setInterval(applyBorder, 15000);
}