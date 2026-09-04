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
// Thêm nhạc nền của bạn vào đây (đặt file vào thư mục music/)
const PLAYLIST = [
  // "music/tên-bài-của-bạn.mp3",
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
let currentTrack = Math.floor(Math.random() * Math.max(1, shuffled.length));

// Load bài random ngay từ đầu (nếu có nhạc)
if (shuffled.length > 0) {
  bgMusic.src = shuffled[currentTrack];
}

function loadTrack(idx) {
  if (shuffled.length === 0) return;
  const wasPlaying = !bgMusic.paused;
  bgMusic.src = shuffled[idx];
  bgMusic.load();
  if (wasPlaying) bgMusic.play().catch(() => {});
}

function nextTrack() {
  if (shuffled.length === 0) return;
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

  // Khi scroll, clear trail cũ để tránh vệt nằm sai chỗ (cursor vẫn fixed theo viewport)
  window.addEventListener("scroll", () => {
    SEGMENTS.length = 0;
    lastX = -1; lastY = -1;
  }, { passive: true });

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
  if (shuffled.length > 0) {
    if (bgMusic.paused) {
      bgMusic.play();
    } else {
      nextTrack();
    }
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
    if (!response.ok) { document.getElementById("error").innerText = "lỗi rồi, thử lại nhé em"; return; }

    // Step 1: Thông báo thành công
    const errorEl = document.getElementById("error");
    errorEl.style.color = "rgba(180,255,200,0.95)";
    errorEl.style.fontSize = "15px";
    errorEl.style.fontStyle = "italic";
    errorEl.innerText = "vợ yêu mở thư được rồi nhé!!";
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
  if (shuffled.length > 0) bgMusic.play().catch(() => {});

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

    // Fade out after 6s (để vợ kịp đọc)
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = isLeft
        ? "translateY(calc(-50% - 18px))"
        : "translate(-100%, calc(-50% - 18px))";
      setTimeout(() => el.remove(), 500);
    }, 6000);
  }

  // Click trên nền sao — bỏ qua tất cả UI elements
  document.addEventListener("click", (e) => {
    const ignore = [
      ".box", "#modal", "button", "input", "textarea",
      "#musicCat", "#volumeBar", "#introScreen", "#preWelcome",
      "#tabNav", "#countdown", ".side-panel",
      "#weatherWrap", "#weatherCard-fremont", "#weatherCard-spokane",
      ".weather-city-card", ".weatherMsg", ".wReminder",
      "#gallerySection", "#galleryHeader", "#galleryBody",
      ".modal-content", "#exitModal", "#secretModal",
      "#secretGrid", ".secret-card",
      "#moodWrap", "#moodPicker", ".mood-pick",
      "nav", "a", "select",
    ].join(", ");

    if (e.target.closest(ignore)) return;

    // Chỉ hiện khi click trên background / canvas / letter-list
    showStarQuote(e.clientX, e.clientY);
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// ẢNH CHỤP CHUNG
// Thêm ảnh: bỏ file vào public/images/photos/ rồi khai báo một dòng ở đây.
//   date    — ngày chụp, hiện dưới ảnh
//   caption — chú thích ngắn
//   url     — đường dẫn file, ví dụ "images/photos/spokane-1.jpg"
//             (để trống "" thì hiện ô placeholder 📷)
// ══════════════════════════════════════════════════════════════════════════════
const GALLERY_PHOTOS = [
  { date: "29/06/2026", caption: "lần đầu gặp nhau ở Spokane", url: "" },
  { date: "30/06/2026", caption: "ngày mình thành của nhau",   url: "" },
  { date: "25/08/2026", caption: "sinh nhật đầu tiên có em",   url: "" },
  { date: "26/08/2026", caption: "Silverwood Park",            url: "" },
];

(function initGallery() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  // ── Dựng lưới ảnh ──────────────────────────────────────────────────────────
  GALLERY_PHOTOS.forEach((photo, i) => {
    const card = document.createElement("div");
    card.className = "photo-card";
    card.dataset.index = i;

    const imgHTML = photo.url
      ? `<img class="photo-img" src="${photo.url}" alt="${photo.caption}" loading="lazy">`
      : `<div class="photo-img-placeholder">📷</div>`;

    card.innerHTML = `
      ${imgHTML}
      <div class="photo-meta">
        <div class="photo-date">${photo.date}</div>
        <div class="photo-caption">${photo.caption}</div>
      </div>`;

    // Chỉ mở xem lớn khi ảnh đã có file thật
    if (photo.url) card.addEventListener("click", () => openLightbox(i));
    grid.appendChild(card);
  });

  // ── Xem ảnh phóng to ───────────────────────────────────────────────────────
  const lb        = document.getElementById("lightbox");
  const lbImg     = document.getElementById("lightboxImg");
  const lbDate    = document.getElementById("lightboxDate");
  const lbCaption = document.getElementById("lightboxCaption");
  let current = 0;

  function openLightbox(i) {
    const withPhoto = GALLERY_PHOTOS.map((p, idx) => p.url ? idx : -1).filter(x => x >= 0);
    if (!withPhoto.length) return;
    current = i;
    render();
    lb.classList.add("show");
  }

  function render() {
    const p = GALLERY_PHOTOS[current];
    lbImg.src = p.url;
    lbImg.alt = p.caption;
    lbDate.textContent = p.date;
    lbCaption.textContent = p.caption;
  }

  function step(dir) {
    const withPhoto = GALLERY_PHOTOS.map((p, idx) => p.url ? idx : -1).filter(x => x >= 0);
    if (withPhoto.length < 2) return;
    const pos = withPhoto.indexOf(current);
    current = withPhoto[(pos + dir + withPhoto.length) % withPhoto.length];
    render();
  }

  function closeLightbox() { lb.classList.remove("show"); }

  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  document.getElementById("lightboxPrev").addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
  document.getElementById("lightboxNext").addEventListener("click", (e) => { e.stopPropagation(); step(1); });
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("show")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // ── Hiện dần từng ảnh khi mở tab ───────────────────────────────────────────
  function revealGallery() {
    grid.querySelectorAll(".photo-card").forEach((c, i) => {
      setTimeout(() => c.classList.add("show"), i * 90);
    });
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.dataset.tab === "gallery") {
      btn.addEventListener("click", () => setTimeout(revealGallery, 100));
    }
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
      if (shuffled.length > 0) bgMusic.play().catch(()=>{});
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

// ══════════════════════════════════════════════════════════════════════════════
// TAB NAVIGATION
// ══════════════════════════════════════════════════════════════════════════════
(function initTabs() {
  // Show nav after intro ends
  document.addEventListener("introEnded", () => {
    setTimeout(() => {
      const nav = document.getElementById("tabNav");
      if (nav) nav.classList.add("visible");
    }, 800);
  });

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;

      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-page").forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const page = document.getElementById("page-" + tab);
      if (page) {
        page.classList.add("active");
        // Fade + slide nhẹ
        page.style.animation = "none";
        requestAnimationFrame(() => {
          page.style.animation = "tabFadeIn 0.5s ease";
        });
      }

      // Scroll to top when switching tabs
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// 100 ĐIỀU ANH TỰ HÀO VỀ EM
// ══════════════════════════════════════════════════════════════════════════════
(function initThings() {
  // Thêm từng điều tự hào vào đây, mỗi dòng 1 item
  const THINGS = [
    "em bé tình cảm lắm",
    // "điều thứ 2...",
    // "điều thứ 3...",
    // ... tiếp tục tới 100
  ];

  const list = document.getElementById("thingsList");
  if (!list) return;

  THINGS.forEach((text, i) => {
    const card = document.createElement("div");
    card.className = "thing-card";
    card.innerHTML = `
      <div class="thing-num">${String(i + 1).padStart(2, "0")}</div>
      <div class="thing-text">${text}</div>
    `;
    list.appendChild(card);
  });

  function revealThings() {
    list.querySelectorAll(".thing-card").forEach((c, i) => {
      setTimeout(() => c.classList.add("show"), i * 60);
    });
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.dataset.tab === "things") {
      btn.addEventListener("click", () => setTimeout(revealThings, 100));
    }
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// BONG BÓNG TÂM TRẠNG
// ══════════════════════════════════════════════════════════════════════════════
(function initMoodBubbles() {
  const MOODS = [
    { name:"hạnh phúc",   emoji:"😊", c1:"#ff85b3", c2:"#ff4488", glow:"rgba(255,80,140,0.5)"  },
    { name:"yêu người ấy",emoji:"🥰", c1:"#ff6b9d", c2:"#e0006a", glow:"rgba(220,0,100,0.5)"   },
    { name:"vui vẻ",      emoji:"😄", c1:"#ffe066", c2:"#ffaa00", glow:"rgba(255,180,0,0.5)"    },
    { name:"bình yên",    emoji:"😌", c1:"#7de8ff", c2:"#00b4d8", glow:"rgba(0,180,220,0.5)"   },
    { name:"xúc động",    emoji:"🥺", c1:"#ffb3d9", c2:"#d4006a", glow:"rgba(210,0,100,0.45)"  },
    { name:"nhớ người ấy",emoji:"💜", c1:"#c77dff", c2:"#7b2fff", glow:"rgba(150,50,255,0.5)"  },
    { name:"buồn",        emoji:"😢", c1:"#6a85c9", c2:"#1a3a7a", glow:"rgba(30,60,160,0.5)"   },
    { name:"mệt mỏi",     emoji:"😮‍💨",c1:"#9b8ec4", c2:"#4a3880", glow:"rgba(80,50,160,0.4)" },
    { name:"lo lắng",     emoji:"😰", c1:"#ffb347", c2:"#b05a00", glow:"rgba(180,80,0,0.45)"   },
    { name:"tức giận",    emoji:"😤", c1:"#ff6b6b", c2:"#c00000", glow:"rgba(200,0,0,0.5)"     },
    { name:"cô đơn",      emoji:"🌧️", c1:"#5a6ea0", c2:"#1e2a50", glow:"rgba(40,50,120,0.4)" },
    { name:"trống rỗng",  emoji:"🫙", c1:"#909098", c2:"#303040", glow:"rgba(60,60,100,0.35)"  },
  ];

  const MAX_SELECT = 12; // không giới hạn thực tế
  let who = "vo";
  // Store selected moods per person (array, multiple allowed)
  const picks = { vo: [], chong: [] };
  const pickerEl = document.getElementById("moodPicker");
  const hintEl   = document.getElementById("moodHint");

  if (!pickerEl) return;

  // Build picker
  const pickEls = [];
  MOODS.forEach((m, i) => {
    const wrap = document.createElement("div"); wrap.className = "mood-pick";
    const bub  = document.createElement("div"); bub.className = "mood-bubble";
    bub.style.background = `radial-gradient(circle at 35% 35%, ${m.c1}, ${m.c2})`;
    bub.style.boxShadow  = `0 4px 18px ${m.glow}`;
    bub.textContent = m.emoji;
    const lbl = document.createElement("div"); lbl.className = "mood-label"; lbl.textContent = m.name;
    wrap.appendChild(bub); wrap.appendChild(lbl);

    wrap.addEventListener("click", () => {
      const arr = picks[who];
      const idx = arr.indexOf(m);
      if (idx > -1) {
        arr.splice(idx, 1); // deselect
      } else {
        arr.push(m); // select thêm
      }
      updatePickerUI();
      renderFeed("vo");
      renderFeed("chong");
      const n = picks[who].length;
      showToast(n === 0
        ? "đã bỏ chọn"
        : picks[who].map(x => x.emoji).join(" "));
    });

    pickEls.push({ el: wrap, mood: m });
    pickerEl.appendChild(wrap);
  });

  function updatePickerUI() {
    const arr = picks[who];
    pickEls.forEach(({ el, mood }) => {
      el.classList.toggle("sel", arr.includes(mood));
    });
    const n = arr.length;
    hintEl.textContent = n === 0
      ? "chạm vào tâm trạng hôm nay, chọn bao nhiêu cũng được"
      : `đã chọn ${n} tâm trạng, chạm lại để bỏ`;
  }

  // Who buttons
  document.querySelectorAll(".mood-who-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      who = btn.dataset.who;
      document.querySelectorAll(".mood-who-btn").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      updatePickerUI();
    });
  });

  // Render feed — bong bóng to nhỏ theo tỉ lệ
  function renderFeed(w) {
    const el = document.getElementById(w + "Feed");
    if (!el) return;
    el.innerHTML = "";
    const arr = picks[w];
    if (!arr.length) {
      el.innerHTML = `<span class="mood-empty">chưa chọn</span>`;
      return;
    }
    const total = arr.length;
    // Count
    const counts = {};
    arr.forEach(m => { counts[m.name] = (counts[m.name] || 0) + 1; });
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, cnt]) => {
        const m = MOODS.find(x => x.name === name);
        const pct  = Math.round(cnt / total * 100);
        // size: nhiều chọn → to, ít → nhỏ
        const size = Math.max(36, Math.min(90, 36 + pct * 0.65));
        const wrap = document.createElement("div"); wrap.className = "mf-wrap";
        const bub  = document.createElement("div"); bub.className = "mf-bubble";
        bub.style.cssText = `width:${size}px;height:${size}px;background:radial-gradient(circle at 35% 35%, ${m.c1}, ${m.c2});box-shadow:0 4px 20px ${m.glow};font-size:${Math.round(size * 0.44)}px`;
        bub.textContent = m.emoji;
        const p = document.createElement("div"); p.className = "mf-pct";
        p.textContent = pct + "%";
        wrap.appendChild(bub); wrap.appendChild(p);
        el.appendChild(wrap);
      });
  }

  // Toast
  let toastTimer;
  function showToast(msg) {
    let t = document.getElementById("moodToast");
    if (!t) {
      t = document.createElement("div"); t.id = "moodToast";
      document.body.appendChild(t);
    }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
  }

  renderFeed("vo");
  renderFeed("chong");
})();



// ══════════════════════════════════════════════════════════════════════════════
// THỜI TIẾT — Fremont CA + Spokane Valley WA
// ══════════════════════════════════════════════════════════════════════════════
(function initWeather() {
  const REMINDERS = {
    rain: [
      "đừng ra ngoài nếu không cần thiết nha em, mưa ở Spokane hay to lắm",
      "nhớ để dù trong xe lúc nào cũng có nha em",
      "đường Spokane mưa dễ trơn, lái xe cẩn thận nha",
    ],
    sun: [
      "nắng Spokane mùa hè nóng lắm, nhớ bôi kem chống nắng trước khi ra ngoài",
      "nhớ để chai nước trong túi mọi lúc nha em",
      "nắng đẹp thế này đi dạo một chút cũng tốt, nhưng nhớ đội nón",
    ],
    cloud: [
      "Spokane nhiều mây kiểu này hay mưa bất chợt, mang theo áo khoác nha em",
      "trời âm u mà độ ẩm cao thì dễ mệt lắm, nhớ uống nước nha",
      "nhiều mây ở Spokane hay chuyển thành mưa hoặc tuyết bất ngờ đó em",
    ],
    snow: [
      "đường Spokane tuyết rất trơn, đi cẩn thận hoặc ở nhà nha em",
      "nhớ làm ấm xe trước khi lái và cạo tuyết trên kính nha em",
      "mặc đủ lớp áo ấm nha em: áo trong, áo giữa rồi áo ngoài chống gió",
    ],
    fog: [
      "sương mù Spokane dày lắm, lái xe chậm và bật đèn nha em",
      "sương mù này ra ngoài nhớ mặc ấm, ẩm lạnh khó chịu lắm",
    ],
  };

  const CITIES = [
    { id: "fremont", lat: 37.5485, lon: -121.9886, name: "Fremont, CA" },
    { id: "spokane", lat: 47.6732, lon: -117.2394, name: "Spokane Valley, WA" },
  ];

  const MSGS = {
    rain: [
      "nhớ mang dù theo nha em, trời mưa rồi đó",
      "mưa rồi em ơi, cẩn thận không bị cảm nha",
      "trời mưa thế này nhớ giữ ấm đôi chân nha em",
      "hôm nay mưa, đừng để ướt tóc nha, dễ cảm lắm",
      "mưa nhiều thì đừng đi đâu nếu không cần thiết nhé em",
      "trời mưa mà chồng không ở cạnh em được, em nhớ giữ sức khỏe nha",
      "mưa to rồi, em ở trong nhà không? đừng ra ngoài không cần thiết",
      "trời mưa lạnh, nhớ mặc áo ấm vào nha em",
      "hôm nay mưa, chồng nhớ em nhiều hơn bình thường",
      "mưa kiểu này dễ buồn ngủ lắm, cẩn thận nếu đang lái xe nha",
      "mưa rồi, nhớ ăn gì ấm ấm nha em",
      "trời mưa chồng chỉ muốn ôm em ngồi nghe mưa thôi",
      "mưa mà không có dù thì vào trú mưa đã nhé, đừng dầm mưa",
      "cẩn thận đường trơn khi đi mưa nha em",
      "ngày mưa kiểu này uống ly trà ấm là tuyệt nhất đó em",
    ],
    sun: [
      "trời nắng to lắm, nhớ uống nước nhiều nha em",
      "nắng gắt rồi, nhớ bôi kem chống nắng trước khi ra ngoài nhé",
      "hôm nay nóng, nhớ mặc đồ thoáng mát nha em",
      "nắng nhiều thế này, mang theo nước uống nha em",
      "em có ra ngoài không? nhớ đội nón đó nha",
      "nắng kiểu này dễ mệt lắm, nhớ nghỉ ngơi đủ nha em",
      "trời nắng đẹp quá, nhớ tận hưởng nhưng đừng để bị nắng nha",
      "nắng to mà không uống đủ nước là mệt lắm đó em",
      "trời nắng, chồng muốn được đi dạo cùng em quá",
      "nắng mà gió nhẹ kiểu này là đẹp trời nhất đó em",
      "ngày nắng đẹp, chồng hi vọng em đang có một ngày tốt",
      "trời nắng đẹp hôm nay, nhớ nạp vitamin D nha em",
      "nắng rồi, ngày mới bắt đầu đẹp, chồng muốn em vui nha",
      "nắng mà độ ẩm thấp thì khô da lắm, nhớ dưỡng ẩm nha em",
      "trời đẹp thế này em có ra ngoài hít thở không?",
    ],
    cloud: [
      "trời nhiều mây nhỉ, mang áo khoác mỏng phòng hờ nha em",
      "mây nhiều mà không mưa, kiểu trời đẹp chồng thích lắm",
      "trời nhiều mây mà độ ẩm cao thì dễ mệt, nhớ uống nước nha",
      "hôm nay trời mây đẹp lắm, ước gì được đi dạo cùng em",
      "mây xám xịt rồi, cẩn thận có thể mưa sau nha em",
      "trời nhiều mây mà không nóng là kiểu thời tiết dễ chịu nhất đó",
      "mây nhiều nhìn lên trời đẹp lắm, em có để ý không?",
      "trời mây hôm nay đẹp kiểu lãng mạn lắm, tự nhiên chồng nhớ em",
      "mây nhiều thế này nhìn buồn buồn, nhưng miễn em vui là được",
      "trời nhiều mây, chăm sóc sức khỏe nha em vì mùa này hay bệnh",
      "nhiều mây mà gió nhẹ thì đi ra ngoài rất dễ chịu đó em",
      "trời mây mà độ ẩm cao thì tóc dễ xoăn lắm nha em haha",
      "mây nhiều kiểu này chồng thấy muốn nằm ngủ thêm ghê",
      "trời nhiều mây nhưng đẹp, em có vui không?",
      "hôm nay trời mây, nhớ mang áo ấm nha em",
    ],
    snow: [
      "tuyết rơi rồi kìa em ơi! mặc thật ấm vào nha",
      "tuyết đẹp lắm nhỉ, nhưng lạnh ghê, mặc thêm áo vào nha em",
      "trời tuyết nhớ đi giày ấm nha, đừng để lạnh chân",
      "tuyết rơi mà chồng không ở cạnh em, em nhớ giữ ấm nha",
      "lạnh quá rồi em ơi, nhớ uống gì ấm ấm vào nha",
      "tuyết trắng đẹp lắm nhưng đường trơn, đi cẩn thận nha em",
      "trời tuyết thế này chồng chỉ muốn ôm em cho ấm thôi",
      "tuyết rơi, nhớ mang găng tay và khăn quàng nha em",
      "lạnh thế này dễ bị cảm lắm, nhớ giữ ấm vùng cổ nha em",
      "tuyết rơi, nhớ đừng lái xe nếu không cần thiết nha em",
      "lạnh kiểu này uống ca cao ấm là nhất, em có uống không?",
      "tuyết đẹp lắm, chồng ước gì được chụp ảnh tuyết cùng em",
      "trời tuyết lạnh, nhớ bật máy sưởi và giữ ấm nha em",
      "tuyết trắng cả trời luôn, em có ngắm không? đẹp lắm đó",
      "tuyết mà lạnh quá thì ở trong nhà thôi nha em",
    ],
    fog: [
      "sương mù dày, đi đường cẩn thận bật đèn nha em",
      "hôm nay có sương mù, tầm nhìn kém nên lái xe chậm thôi nha",
      "sương mù rồi, đi ra ngoài nhớ mặc ấm vì ẩm lạnh lắm đó",
      "sương mù dày, em có ra ngoài không? nhớ cẩn thận nha",
      "sương mù kiểu này huyền bí lắm, nhưng nhớ cẩn thận nha em",
    ],
  };

  const msgIdxMap = {};

  window.nextWeatherMsg = function(cityId) {
    const arr = window._weatherMsgs?.[cityId];
    if (!arr) return;
    msgIdxMap[cityId] = ((msgIdxMap[cityId] || 0) + 1) % arr.length;
    document.getElementById("wMsgText-" + cityId).textContent = arr[msgIdxMap[cityId]];
  };

  function getType(code, humidity) {
    if ([71,73,75,77,85,86].includes(code)) return "snow";
    if ([45,48].includes(code)) return "fog";
    if ([51,53,55,61,63,65,66,67,80,81,82,95,96,99].includes(code)) return "rain";
    if ([0,1].includes(code)) return "sun";
    return "cloud";
  }

  function getIcon(code) {
    if (code===0) return "☀️";
    if (code===1) return "🌤️";
    if (code===2) return "⛅";
    if (code===3) return "☁️";
    if ([45,48].includes(code)) return "🌫️";
    if ([51,53,55].includes(code)) return "🌦️";
    if ([61,63,65,66,67,80,81,82].includes(code)) return "🌧️";
    if ([71,73,75,77,85,86].includes(code)) return "❄️";
    if ([95,96,99].includes(code)) return "⛈️";
    return "🌡️";
  }

  function getDesc(code) {
    const m = {0:"QUANG ĐÃNG",1:"TRỜI ĐẸP",2:"MÂY CỤC BỘ",3:"U ÁM",
      45:"SƯƠNG MÙ",48:"SƯƠNG GIÁ",51:"MƯA PHÙN",53:"MƯA PHÙN",55:"MƯA PHÙN",
      61:"MƯA NHẸ",63:"MƯA VỪA",65:"MƯA TO",66:"MƯA ĐÓNG BĂNG",67:"MƯA ĐÓNG BĂNG",
      71:"TUYẾT NHẸ",73:"TUYẾT VỪA",75:"TUYẾT DÀY",77:"HẠT TUYẾT",
      80:"MƯA RÀO",81:"MƯA RÀO NẶN",82:"MƯA RÀO DỮ DỘI",
      85:"TUYẾT RÀO",86:"TUYẾT RÀO DÀY",95:"GIÔNG BÃO",96:"GIÔNG+MƯA ĐÁ",99:"GIÔNG DỮ DỘI"};
    return m[code] || "KHÔNG RÕ";
  }

  function renderCity(cityId, data) {
    const cur   = data.current;
    const code  = cur.weather_code;
    const temp  = Math.round(cur.temperature_2m);
    const feels = Math.round(cur.apparent_temperature);
    const hum   = cur.relative_humidity_2m;
    const wind  = Math.round(cur.wind_speed_10m);
    const type  = getType(code, hum);

    const card = document.getElementById("weatherCard-" + cityId);
    card.style.display = "block";
    card.className = "weather-city-card " + type;

    document.getElementById("wIcon-" + cityId).textContent     = getIcon(code);
    document.getElementById("wTemp-" + cityId).textContent     = temp + "°C";
    document.getElementById("wDesc-" + cityId).textContent     = getDesc(code);
    document.getElementById("wHumidity-" + cityId).textContent = "Độ ẩm " + hum + "%";
    document.getElementById("wWind-" + cityId).textContent     = "Gió " + wind + " km/h";
    document.getElementById("wFeels-" + cityId).textContent    = "Cảm giác " + feels + "°C";

    // Reminder chỉ cho Spokane (vợ)
    if (cityId === "spokane") {
      const remPool = REMINDERS[type] || [];
      const rem = remPool[Math.floor(Math.random() * remPool.length)] || "";
      const remEl = document.getElementById("wReminderText-spokane");
      if (remEl) remEl.textContent = rem;
    }
  }

  function loadWeather() {
    document.getElementById("weatherLoading").style.display = "block";
    let loaded = 0;
    CITIES.forEach(city => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh&timezone=auto`;
      fetch(url)
        .then(r => r.json())
        .then(data => {
          renderCity(city.id, data);
          loaded++;
          if (loaded === CITIES.length) {
            document.getElementById("weatherLoading").style.display = "none";
          }
        })
        .catch(() => {
          document.getElementById("weatherLoading").textContent = "không thể lấy thời tiết, kiểm tra kết nối nha em";
        });
    });
  }

  let weatherLoaded = false;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.tab === "weather" && !weatherLoaded) {
        weatherLoaded = true;
        loadWeather();
      }
    });
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// ĐẾM THỜI GIAN BÊN NHAU (từ lúc tỏ tình)
// ══════════════════════════════════════════════════════════════════════════════
(function initDaysTogether() {
  // Ngày giờ tỏ tình: 30/06/2026 lúc 11:00 (giờ Spokane / Pacific Time)
  const START_DATE = new Date("2026-06-30T11:00:00-07:00");

  const numEl = document.getElementById("daysNum");
  const labelEl = document.getElementById("daysLabel");
  if (!numEl) return;

  function update() {
    const now = new Date();
    let diff = Math.floor((now - START_DATE) / 1000); // giây
    if (diff < 0) diff = 0;

    const days    = Math.floor(diff / 86400);
    const hours   = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    numEl.textContent = days;
    if (labelEl) {
      labelEl.innerHTML = `ngày bên nhau<br><span style="font-size:12px;opacity:0.7">${hours} giờ ${minutes} phút</span>`;
    }
  }

  update();
  setInterval(update, 1000 * 30); // cập nhật mỗi 30 giây
})();

// ══════════════════════════════════════════════════════════════════════════════
// PARALLAX SAO KHI SCROLL
// ══════════════════════════════════════════════════════════════════════════════
(function initParallaxStars() {
  // Tìm canvas/layer sao nền hiện có
  document.addEventListener("introEnded", () => {
    let ticking = false;

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // Di chuyển các lớp sao với tốc độ khác nhau
          const starCanvas = document.querySelector("#starCanvas, #starfield, .star-layer, #bgCanvas");
          if (starCanvas) {
            starCanvas.style.transform = `translateY(${scrollY * 0.15}px)`;
          }

          // KHÔNG áp parallax lên canvas cursor (gây lệch con trỏ khi scroll)
          // Chỉ áp lên star canvas nền nếu có id cụ thể (đã xử lý ở trên)

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// RADIO ♡
// ══════════════════════════════════════════════════════════════════════════════
(function initRadio() {
  // Thêm bài hát ở đây — id lấy từ link YouTube (phần sau v=)
  const TRACKS = [
    {
      id: "LIKOvbJ-DZg",
      name: "Vết Thương - fishy",
      note: "bài chồng hay nghe khi buồn",
    },
    // Thêm bài mới theo mẫu:
    // { id: "VIDEO_ID", name: "Tên bài", note: "ghi chú của chồng" },
  ];

  const list = document.getElementById("radioList");
  if (!list) return;

  TRACKS.forEach((t, i) => {
    const track = document.createElement("div");
    track.className = "radio-track";
    track.innerHTML = `
      <div class="radio-head">
        <div class="radio-play">▶</div>
        <div class="radio-info">
          <div class="radio-name">${t.name}</div>
          <div class="radio-note">${t.note}</div>
        </div>
      </div>
      <div class="radio-embed" id="embed-${i}"></div>
    `;

    const head  = track.querySelector(".radio-head");
    const play  = track.querySelector(".radio-play");
    const embed = track.querySelector(".radio-embed");
    let loaded = false;

    head.addEventListener("click", () => {
      const isOpen = embed.classList.contains("open");

      // Đóng tất cả track khác
      document.querySelectorAll(".radio-embed.open").forEach(e => {
        e.classList.remove("open");
        e.innerHTML = "";
        const p = e.closest(".radio-track").querySelector(".radio-play");
        if (p) p.textContent = "▶";
      });

      if (!isOpen) {
        embed.innerHTML = `<iframe src="https://www.youtube.com/embed/${t.id}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        embed.classList.add("open");
        play.textContent = "❚❚";
      }
    });

    list.appendChild(track);
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// SAO BĂNG NGẪU NHIÊN
// ══════════════════════════════════════════════════════════════════════════════
(function initShootingStars() {
  document.addEventListener("introEnded", () => {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2;";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    const stars = [];

    function spawnStar() {
      // Bắt đầu từ vùng trên, bay chéo xuống
      const startX = Math.random() * canvas.width * 0.7 + canvas.width * 0.2;
      const startY = Math.random() * canvas.height * 0.3;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4; // ~45 độ
      const speed = 6 + Math.random() * 5;
      stars.push({
        x: startX, y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 60 + Math.random() * 80,
        life: 1,
        hue: 250 + Math.random() * 60, // tím-xanh
      });
    }

    function loop() {
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.012;
        if (s.life <= 0 || s.x > canvas.width + 100 || s.y > canvas.height + 100) {
          stars.splice(i, 1);
          continue;
        }

        // Vẽ đuôi sao băng
        const tailX = s.x - s.vx * (s.len / 10);
        const tailY = s.y - s.vy * (s.len / 10);
        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `hsla(${s.hue}, 80%, 85%, ${s.life})`);
        grad.addColorStop(1, `hsla(${s.hue}, 80%, 70%, 0)`);

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.shadowColor = `hsla(${s.hue}, 90%, 80%, ${s.life * 0.6})`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Đầu sáng
        ctx.fillStyle = `hsla(${s.hue}, 90%, 92%, ${s.life})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    loop();

    // Spawn ngẫu nhiên mỗi 4-12 giây
    function scheduleNext() {
      const delay = 4000 + Math.random() * 8000;
      setTimeout(() => {
        spawnStar();
        scheduleNext();
      }, delay);
    }
    scheduleNext();
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// AURORA NỀN MỜ ẢO
// ══════════════════════════════════════════════════════════════════════════════
(function initAurora() {
  document.addEventListener("introEnded", () => {
    const aurora = document.createElement("div");
    aurora.id = "auroraBg";
    aurora.style.cssText = `
      position: fixed; inset: 0; z-index: 0;
      pointer-events: none; opacity: 0;
      transition: opacity 4s ease;
      overflow: hidden;
    `;
    aurora.innerHTML = `
      <div class="aurora-band aurora-1"></div>
      <div class="aurora-band aurora-2"></div>
      <div class="aurora-band aurora-3"></div>
    `;
    document.body.appendChild(aurora);
    requestAnimationFrame(() => { aurora.style.opacity = "1"; });
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// LỜI CHÀO THEO THỜI ĐIỂM
// ══════════════════════════════════════════════════════════════════════════════
(function initGreeting() {
  document.addEventListener("introEnded", () => {
    const hour = new Date().getHours();
    let greeting;
    if      (hour >= 5  && hour < 11) greeting = "chào buổi sáng của chồng";
    else if (hour >= 11 && hour < 14) greeting = "buổi trưa rồi, em ăn gì chưa?";
    else if (hour >= 14 && hour < 18) greeting = "buổi chiều dịu dàng nha em";
    else if (hour >= 18 && hour < 22) greeting = "buổi tối an lành nha em yêu";
    else                              greeting = "khuya rồi đó, nhớ ngủ sớm nha em";

    const el = document.createElement("div");
    el.id = "greetingToast";
    el.textContent = greeting;
    el.style.cssText = `
      position: fixed; top: 24px; left: 50%;
      transform: translateX(-50%) translateY(-60px);
      background: rgba(15,10,32,0.92);
      border: 1px solid rgba(180,150,255,0.2);
      border-radius: 30px; padding: 10px 26px;
      font-size: 14px; font-style: italic;
      color: rgba(215,200,255,0.85);
      font-family: 'Cormorant Garamond', Georgia, serif;
      letter-spacing: 1px; z-index: 9998;
      opacity: 0; pointer-events: none; white-space: nowrap;
      backdrop-filter: blur(10px);
      transition: transform 0.7s cubic-bezier(0.2,0.8,0.3,1), opacity 0.7s ease;
      box-shadow: 0 4px 30px rgba(160,120,255,0.12);
    `;
    document.body.appendChild(el);

    setTimeout(() => {
      el.style.transform = "translateX(-50%) translateY(0)";
      el.style.opacity = "1";
    }, 1500);

    setTimeout(() => {
      el.style.transform = "translateX(-50%) translateY(-60px)";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 800);
    }, 6000);
  });
})();


// ══════════════════════════════════════════════════════════════════════════════
// TIMELINE — HÀNH TRÌNH CỦA MÌNH
// ══════════════════════════════════════════════════════════════════════════════
(function initTimeline() {
  const EVENTS = [
    {
      date: "29 THÁNG 6, 2026",
      title: "lần đầu gặp nhau ở Spokane",
      desc: "ngày đầu tiên anh thật sự được đứng cạnh em. cảm giác là lạ, nhưng cũng vui lắm, vì cuối cùng anh cũng gặp được người mà anh thương trong lòng.",
    },
    {
      date: "30 THÁNG 6, 2026",
      title: "anh tỏ tình với em",
      desc: "cuối cùng anh cũng nói ra được điều giấu trong lòng bấy lâu, theo đúng cách mà em muốn được nghe nhất. và sau tất cả, em đã chọn bước ra khỏi quá khứ để đi tiếp cùng anh. cảm ơn em vì đã tin tưởng anh, anh sẽ không để em phải hối hận đâu.",
      badge: "ngày bắt đầu ♡",
    },
    {
      date: "4 THÁNG 7, 2026",
      title: "anh phải về rồi",
      desc: "tạm biệt em bé của anh nhá. tới giờ anh phải về rồi. anh yêu em nhiều lắm, và lần gặp tiếp theo sẽ tới nhanh thôi.",
    },
    {
      date: "25 THÁNG 8, 2026",
      title: "qua lại Spokane thăm em",
      desc: "tự nhiên cảm thấy trong lòng có nhiều chút hồi hộp hơn cả lần đầu, xen chút cảm giác lạ lẫm nữa không hiểu tại sao, nhưng khi ôm em lần đầu thì cảm thấy siêu ấm áp. còn được em tổ chức sinh nhật cho nữa, anh vui lắm, cũng là lần đầu tiên anh được đón sinh nhật cùng người anh yêu, lần đầu tiên anh được nhận nhiều sự chu đáo tới vậy.",
      badge: "sinh nhật đầu tiên có em ♡",
    },
    {
      date: "26 THÁNG 8, 2026",
      title: "Silverwood Park",
      desc: "đi Silverwood Park chơi, chơi được vài trò sợ toát cả mồ hôi, nhưng mà có em nên... vẫn sợ. cuối cùng cũng kịp đi miniso để mua gấu bông cho em, còn có cả móc khóa đôi nữa.",
    },
    {
      date: "27 THÁNG 8, 2026",
      title: "anh phải về rồi, lần nữa",
      desc: "mặc dù biết là lần sau vẫn sẽ tới nhanh thôi nhưng anh vẫn cảm thấy buồn với nhớ em nhiều lắm, anh muốn được ôm em mãi. anh nhớ cảm giác em nằm gọn trong lòng anh, làm anh mãi mãi không bao giờ muốn khoảnh khắc đấy kết thúc. ước gì lần sau lần sau và lần sau nữa, anh vẫn có thể ôm bé Như nhỏ như cục kẹo của anh ở gọn trong lòng.",
    },
  ];

  const list = document.getElementById("timelineList");
  if (!list) return;

  EVENTS.forEach((ev, i) => {
    const item = document.createElement("div");
    item.className = "tl-item";
    item.innerHTML = `
      <div class="tl-dot ${ev.badge ? "first" : ""}"></div>
      <div class="tl-date">${ev.date}</div>
      <div class="tl-title">${ev.title}</div>
      <div class="tl-desc">${ev.desc}</div>
      ${ev.badge ? `<div class="tl-badge">${ev.badge}</div>` : ""}
    `;
    list.appendChild(item);
  });

  // Reveal khi tab timeline được mở
  function revealTimeline() {
    const items = list.querySelectorAll(".tl-item");
    items.forEach((item, i) => {
      setTimeout(() => item.classList.add("show"), i * 120);
    });
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.dataset.tab === "timeline") {
      btn.addEventListener("click", () => setTimeout(revealTimeline, 100));
    }
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// LẦN ĐẦU — những lần đầu tiên của anh
// ══════════════════════════════════════════════════════════════════════════════
(function initFirsts() {
  // Thêm/sửa "lần đầu" của bạn ở đây
  const FIRSTS = [
    {
      title: "lần đầu anh mua trà sữa cho một ai đó",
      desc: "trước em, anh chưa từng nghĩ đến việc mua trà sữa cho ai. em là người đầu tiên.",
    },
    {
      title: "lần đầu anh uống nhiều trà sữa đến thế",
      desc: "chỉ vì được ở cạnh em, anh làm cả những điều mình chưa từng làm.",
    },
    {
      title: "lần đầu anh đi ăn cùng một người con gái",
      desc: "cũng là lần đầu anh ăn Haidilao. anh mừng vì người ngồi đối diện là em.",
    },
    {
      title: "lần đầu anh lái xe xuyên đêm vì một người",
      desc: "cả quãng đường dài từ Seattle về Spokane, chỉ để được ở bên em thêm chút nữa.",
    },
    {
      title: "lần đầu anh nắm tay một ai đó",
      desc: "một điều tưởng như rất bình thường, vậy mà anh phải đợi tới khi có em mới biết nó là gì.",
    },
    {
      title: "lần đầu anh ôm một ai đó",
      desc: "và anh chỉ ước khoảnh khắc đó đừng bao giờ kết thúc.",
    },
    {
      title: "lần đầu anh hôn một ai đó",
      desc: "anh đã đợi rất lâu để dành nó cho đúng người. hóa ra người đó là em.",
    },
    {
      title: "lần đầu anh tỏ tình với ai đó",
      desc: "và cũng là lần đầu anh chắc chắn đến vậy về cảm xúc của mình.",
    },
    {
      title: "lần đầu anh trở thành của một ai đó",
      desc: "ngày anh thôi đứng ngoài câu chuyện của em, để trở thành một phần trong đó.",
    },
    {
      title: "lần đầu anh đi coi phim cùng người anh yêu",
      desc: "anh chẳng nhớ phim chiếu gì, chỉ nhớ em ngồi ngay bên cạnh.",
    },
    {
      title: "lần đầu anh được nhận quà sinh nhật từ người anh yêu",
      desc: "cũng là lần đầu anh thấy sinh nhật của mình có ý nghĩa tới vậy.",
    },
  ];

  const list = document.getElementById("firstsList");
  if (!list) return;

  FIRSTS.forEach((f, i) => {
    const card = document.createElement("div");
    card.className = "first-card";
    card.innerHTML = `
      <div class="first-num">${String(i+1).padStart(2,"0")}</div>
      ${f.date ? `<div class="first-date">${f.date}</div>` : ""}
      <div class="first-title">${f.title}</div>
      ${f.desc ? `<div class="first-desc">${f.desc}</div>` : ""}
    `;
    list.appendChild(card);
  });

  function revealFirsts() {
    list.querySelectorAll(".first-card").forEach((c, i) => {
      setTimeout(() => c.classList.add("show"), i * 120);
    });
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.dataset.tab === "firsts") {
      btn.addEventListener("click", () => setTimeout(revealFirsts, 100));
    }
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// NHẬT KÝ — viết vào những ngày có điều muốn nói ra
// Thêm entry mới lên ĐẦU mảng DIARY (mới nhất nằm trên)
// Dùng \n\n để xuống đoạn trong content
// ══════════════════════════════════════════════════════════════════════════════
(function initDiary() {
  const DIARY = [
    {
      date: "27 THÁNG 8, 2026",
      content: `hôm đấy tự nhiên chuyến bay bị delayed nên chồng được ở bên cạnh em thêm một lúc nữa lận. đáng lẽ phải vui lắm, vì tự nhiên có thêm chút thời gian với em, nhưng lúc đó chồng lại cứ có cảm giác như mọi thứ đang đếm ngược vậy.
ở bên em mà trong đầu cứ nghĩ: à, lại sắp phải về rồi, sắp không được gặp em nữa rồi.
thành ra càng ngồi cạnh em lâu bao nhiêu, chồng lại càng không muốn thời gian trôi tiếp bấy nhiêu.
chồng thích cảm giác được ở cạnh em lắm. thật ra chẳng cần làm gì đặc biệt hết, chỉ cần quay sang thấy em ở đó, được nghe em nói chuyện ngay bên cạnh, được ôm em, được chạm vào em một cách rất bình thường thôi là chồng đã thấy vui rồi.
đến lúc phải đi mới thấy hụt hẫng kinh khủng. vừa mới ở cạnh nhau đó thôi mà đã bắt đầu nhớ.
nhớ cảm giác quay qua là thấy em.
nhớ giọng em ở ngay bên cạnh.
nhớ cả những thứ rất nhỏ mà lúc ở gần nhau chồng chẳng để ý.
chắc vì vậy nên mỗi lần rời em, chồng lại chỉ mong thật nhanh tới lần tiếp theo được gặp lại. cho tới khi ở trên máy bay, chồng cũng nghĩ về em mãi, mong thời gian trôi thật nhanh để anh được gặp vợ anh nữa.`,
    },
    {
      date: "4 THÁNG 7, 2026",
      content: `Cái hôm mà chồng đáp xuống sân bay, chồng đã biết là ngày mai sẽ không thể nhìn thấy vợ ngay lập tức nữa rồi. Điều làm chồng lạ lẫm nhất không phải là chuyến bay dài, mà là cảm giác phải tạm gác lại một cuộc sống rất ồn ào bên vợ để quay về với những ngày bình thường. Đến lúc ấy chồng mới nhận ra, hóa ra chồng đã quen với việc có em ở cạnh nhiều đến thế.

Hôm đó ở khắp nơi người ta bắn pháo hoa, nhưng chỗ chồng lại im lìm lạ thường. Ngồi trên xe với ba mẹ, mọi thứ vẫn như cũ, chỉ là chẳng còn những câu chuyện xàm xí, những tiếng cười hay những lần mình trêu chọc nhau không ngừng. Chồng cứ thấy thiếu thiếu một điều gì đó, rồi mới nhận ra... điều chồng thiếu chính là em.

Có lẽ sau mỗi lần gặp nhau, điều khó nhất không phải là khoảng cách, mà là phải tập quen lại với một cuộc sống không có vợ ở ngay bên cạnh. Chồng nhớ em nhiều lắm, nhớ cả những điều nhỏ nhặt nhất mà lúc ở cạnh nhau chồng từng nghĩ là rất bình thường.

Chồng chỉ mong thời gian trôi nhanh hơn một chút, để lần gặp tiếp theo của mình đến sớm hơn.`,
    },
    // Thêm entry mới theo mẫu (đặt lên trên cùng):
    // {
    //   date: "10 THÁNG 7, 2026",
    //   content: `nội dung...`,
    // },
  ];

  const feed = document.getElementById("diaryFeed");
  if (!feed) return;

  DIARY.forEach(entry => {
    const card = document.createElement("div");
    card.className = "diary-card";
    const paragraphs = entry.content
      .split("\n\n")
      .map(p => `<p class="diary-p">${p.trim().replace(/\n/g, "<br>")}</p>`)
      .join("");
    card.innerHTML = `
      <div class="diary-date"><span class="diary-dot">✦</span>${entry.date}</div>
      <div class="diary-content">${paragraphs}</div>
    `;
    feed.appendChild(card);
  });

  function revealDiary() {
    feed.querySelectorAll(".diary-card").forEach((c, i) => {
      setTimeout(() => c.classList.add("show"), i * 150);
    });
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.dataset.tab === "diary") {
      btn.addEventListener("click", () => setTimeout(revealDiary, 100));
    }
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// DỰ ĐỊNH TƯƠNG LAI — thay thế tab Đầu Tư cũ
// ══════════════════════════════════════════════════════════════════════════════
(function initFuture() {
  // Thêm từng dự định vào đây
  const FUTURE = [
    {
      title: "cùng nhau đi du lịch một chuyến thật xa",
      desc: "không cần đi đâu quá sang, chỉ cần đủ xa để cả hai đứa tạm quên hết mọi thứ còn lại.",
    },
    {
      title: "đi Halloween cùng em",
      desc: "anh muốn xem em hóa trang thành gì, rồi hai đứa cùng đi chơi cả tối.",
    },
    {
      title: "đi về Việt Nam cùng em",
      desc: "dẫn em về nơi anh lớn lên, đi ăn những món anh vẫn nhớ, và có em ở đó cùng anh.",
    },
  ];

  const list = document.getElementById("futureList");
  if (!list) return;

  FUTURE.forEach((f, i) => {
    const card = document.createElement("div");
    card.className = "future-card";
    card.innerHTML = `
      <div class="future-num">${String(i + 1).padStart(2, "0")}</div>
      <div class="future-title">${f.title}</div>
      ${f.desc ? `<div class="future-desc">${f.desc}</div>` : ""}
    `;
    list.appendChild(card);
  });

  function revealFuture() {
    list.querySelectorAll(".future-card").forEach((c, i) => {
      setTimeout(() => c.classList.add("show"), i * 60);
    });
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.dataset.tab === "future") {
      btn.addEventListener("click", () => setTimeout(revealFuture, 100));
    }
  });
})();



// ══════════════════════════════════════════════════════════════════════════════
// CHỦ ĐỀ THEO TỪNG TAB v3 — mặt trăng siêu chi tiết + hoa đào ≠ vườn hồng rõ rệt
// ══════════════════════════════════════════════════════════════════════════════
(function initTabThemes() {
  const canvas = document.getElementById("themeCanvas");
  if (!canvas || !document.body) return;

  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener("resize", () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
  const ctx = canvas.getContext("2d");

  // ── 8 chủ đề ─────────────────────────────────────────────────────────────
  const THEMES = {
    home: {
      bodyBg: "radial-gradient(140% 100% at 50% -10%, #1a1030 0%, #0a0618 45%, #050310 100%)",
      particle: "stars", accentType: "moon",
      accent: { cx: 0.88, cy: 0.15, r: 42, color: "222,215,250" },
    },
    timeline: { // hoa đào — nhẹ, gió cuốn, cụm hoa 5 cánh thật
      bodyBg: "radial-gradient(140% 100% at 15% -10%, #3a1a30 0%, #200f22 45%, #12081a 100%)",
      particle: "petals", petalMode: "blossom", secondary: "bokeh",
      accentType: "branch",
      accent: { color: "255,190,215" },
      petalColor: ["255,205,225", "255,180,210"],
    },
    gallery: {
      bodyBg: "radial-gradient(140% 100% at 50% 110%, #063a48 0%, #042230 50%, #02121c 100%)",
      particle: "bubbles", accentType: "wave",
      accent: { color: "120,220,235" },
    },
    diary: {
      bodyBg: "radial-gradient(140% 100% at 20% 0%, #402508 0%, #22140a 50%, #140b06 100%)",
      particle: "fireflies", accentType: "haze",
      accent: { color: "255,200,130" },
    },
    things: { // vườn hồng — nặng hơn, rơi thẳng, nụ hồng thật, đom đóm tim ấm
      bodyBg: "radial-gradient(140% 100% at 15% -10%, #4a1020 0%, #2a0a15 50%, #170509 100%)",
      particle: "petals", petalMode: "rose", secondary: "hearts",
      accentType: "vine",
      accent: { color: "255,70,115" },
      petalColor: ["230,55,100", "150,20,55"],
    },
    firsts: {
      bodyBg: "radial-gradient(140% 100% at 50% 105%, #6a2606 0%, #3d1506 50%, #1c0803 100%)",
      particle: "embers", accentType: "sun",
      accent: { cx: 0.82, cy: 0.86, r: 60, color: "255,175,90" },
    },
    radio: {
      bodyBg: "radial-gradient(140% 100% at 20% -10%, #34164f 0%, #1c0c2e 50%, #0f0619 100%)",
      particle: "notes", accentType: "moon",
      accent: { cx: 0.86, cy: 0.17, r: 38, color: "212,180,255" },
    },
    future: {
      bodyBg: "radial-gradient(140% 100% at 50% 100%, #1c3a2a 0%, #0c2436 55%, #061420 100%)",
      particle: "sparks", accentType: "sunrise",
      accent: { cx: 0.5, cy: 0.92, r: 70, color: "255,220,160" },
    },
  };

  document.body.style.transition = "background 1.8s ease";

  // ── MẶT TRĂNG SIÊU CHI TIẾT ─────────────────────────────────────────────────
  // Miệng núi lửa cố định (sinh 1 lần, giữ nguyên vị trí suốt phiên)
  const MOON_CRATERS = Array.from({ length: 11 }, () => ({
    dx: (Math.random() - 0.5) * 1.1,
    dy: (Math.random() - 0.5) * 1.1,
    dr: 0.05 + Math.random() * 0.16,
    depth: 0.22 + Math.random() * 0.3,
  })).filter(c => Math.hypot(c.dx, c.dy) < 0.82);

  function drawDetailedMoon(cx, cy, r, color) {
    ctx.save();
    // Quầng khí quyển nhiều lớp
    for (let i = 3; i >= 1; i--) {
      const gr = r * (1.7 + i * 1.0);
      const g = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, gr);
      g.addColorStop(0, `rgba(${color},${0.11 / i})`);
      g.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, gr, 0, Math.PI * 2); ctx.fill();
    }

    // Khối cầu — ánh sáng chiếu từ trên-trái, tạo cảm giác 3D
    const sphere = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.38, r * 0.08, cx, cy, r * 1.05);
    sphere.addColorStop(0, "rgba(255,255,252,0.98)");
    sphere.addColorStop(0.45, `rgba(${color},0.96)`);
    sphere.addColorStop(0.8, `rgba(${color},0.85)`);
    sphere.addColorStop(1, `rgba(${color},0.62)`);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = sphere; ctx.fill();

    // Cắt vùng để vẽ chi tiết bề mặt gọn trong hình tròn
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();

    // Miệng núi lửa — mỗi cái có bóng đổ + viền sáng nhẹ
    MOON_CRATERS.forEach(c => {
      const px = cx + c.dx * r, py = cy + c.dy * r, pr = c.dr * r;
      const cg = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0, px, py, pr);
      cg.addColorStop(0, `rgba(110,100,135,${c.depth})`);
      cg.addColorStop(1, `rgba(110,100,135,0)`);
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();
      ctx.beginPath(); ctx.arc(px - pr * 0.18, py - pr * 0.18, pr * 0.85, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${c.depth * 0.3})`;
      ctx.lineWidth = Math.max(0.4, pr * 0.07);
      ctx.stroke();
    });

    // Đường ranh sáng-tối (terminator) — tạo chiều sâu hình cầu
    const term = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    term.addColorStop(0, "rgba(15,10,30,0.4)");
    term.addColorStop(0.5, "rgba(15,10,30,0)");
    term.addColorStop(1, "rgba(15,10,30,0)");
    ctx.fillStyle = term;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Viền sáng mảnh quanh mép trăng
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vài ngôi sao nhỏ lấp lánh quanh trăng
    const starOffsets = [[-2.1, -0.6, 1.4], [1.9, -1.1, 1.1], [-1.4, 1.3, 1], [2.4, 0.9, 1.2]];
    starOffsets.forEach(([ox, oy, sz], i) => {
      const sx = cx + ox * r, sy = cy + oy * r;
      const a = 0.35 + 0.55 * Math.abs(Math.sin(tt * 0.9 + i * 1.7));
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(sx, sy, sz, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }

  // ── Hoa đào — cánh mỏng, khía đầu, đung đưa theo gió ────────────────────────
  function drawBlossomPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const s = p.r;
    const g = ctx.createLinearGradient(0, -s, 0, s);
    g.addColorStop(0, `rgba(${p.c[0]},0.9)`);
    g.addColorStop(1, `rgba(${p.c[1]},0.5)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.85, -s * 0.25, s * 0.65, s * 0.7, 0, s * 0.92);
    ctx.quadraticCurveTo(0, s * 0.68, -s * 0.14, s * 0.92);
    ctx.bezierCurveTo(-s * 0.65, s * 0.7, -s * 0.85, -s * 0.25, 0, -s);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, -s * 0.75); ctx.lineTo(0, s * 0.65); ctx.stroke();
    ctx.restore();
  }

  // ── Hoa hồng — cánh dày, tròn hơn, gợn nhung, nặng hơn hoa đào ──────────────
  function drawRosePetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const s = p.r;
    const g = ctx.createRadialGradient(-s * 0.2, -s * 0.3, s * 0.1, 0, 0, s * 1.1);
    g.addColorStop(0, `rgba(${p.c[0]},0.95)`);
    g.addColorStop(0.6, `rgba(${p.c[1]},0.85)`);
    g.addColorStop(1, `rgba(${p.c[1]},0.55)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.95);
    ctx.bezierCurveTo(s * 1.05, -s * 0.5, s * 0.9, s * 0.55, 0, s);
    ctx.bezierCurveTo(-s * 0.9, s * 0.55, -s * 1.05, -s * 0.5, 0, -s * 0.95);
    ctx.closePath(); ctx.fill();
    // gợn nhung — vài đường cong mờ bên trong
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.5); ctx.quadraticCurveTo(0, 0, -s * 0.2, s * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.5); ctx.quadraticCurveTo(0, 0, s * 0.2, s * 0.6); ctx.stroke();
    ctx.restore();
  }

  function drawBubble(p) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    const g = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 0, p.x, p.y, p.r);
    g.addColorStop(0, `rgba(${p.c},0.35)`);
    g.addColorStop(0.7, `rgba(${p.c},0.08)`);
    g.addColorStop(1, `rgba(${p.c},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(${p.c},0.8)`;
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath(); ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawFirefly(p, a) {
    ctx.save();
    ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
    g.addColorStop(0, `rgba(${p.c},0.9)`);
    g.addColorStop(0.4, `rgba(${p.c},0.25)`);
    g.addColorStop(1, `rgba(${p.c},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,250,230,0.95)";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawEmber(p) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life) * 0.85;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
    g.addColorStop(0, `rgba(${p.c},1)`);
    g.addColorStop(0.5, `rgba(${p.c},0.35)`);
    g.addColorStop(1, `rgba(${p.c},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = "rgba(255,235,200,0.95)";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawNote(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = 0.75;
    const s = p.r / 14;
    ctx.fillStyle = `rgba(${p.c},0.9)`;
    ctx.strokeStyle = `rgba(${p.c},0.9)`;
    ctx.lineWidth = 1.6 * s;
    ctx.save(); ctx.rotate(-0.35);
    ctx.beginPath(); ctx.ellipse(0, 0, 5.5 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(5 * s, -1 * s); ctx.lineTo(5 * s, -16 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5 * s, -16 * s);
    ctx.quadraticCurveTo(11 * s, -13 * s, 9 * s, -7 * s); ctx.stroke();
    ctx.restore();
  }

  function drawSpark(p, a) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = a;
    ctx.strokeStyle = `rgba(${p.c},0.95)`;
    ctx.lineWidth = 1.1;
    ctx.shadowColor = `rgba(${p.c},0.9)`; ctx.shadowBlur = 6;
    const s = p.r * 2.2;
    ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, p.r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fill();
    ctx.restore();
  }

  // ── Bokeh mềm — trôi lơ lửng cho chủ đề hoa đào ─────────────────────────────
  function drawBokeh(p) {
    ctx.save();
    ctx.globalAlpha = p.a;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    g.addColorStop(0, `rgba(${p.c},0.28)`);
    g.addColorStop(1, `rgba(${p.c},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ── Trái tim ấm — trôi lên cho chủ đề vườn hồng ─────────────────────────────
  function drawHeart(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = p.a;
    const s = p.r;
    ctx.fillStyle = `rgba(${p.c},0.8)`;
    ctx.shadowColor = `rgba(${p.c},0.7)`; ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s, -s * 0.5, -s * 0.5, -s * 1.15, 0, -s * 0.4);
    ctx.bezierCurveTo(s * 0.5, -s * 1.15, s, -s * 0.5, 0, s * 0.35);
    ctx.fill();
    ctx.restore();
  }

  // ── Particle pool chính + pool phụ ──────────────────────────────────────────
  let pool = [], secondaryPool = [];
  let currentType = null, currentSecondary = null;
  let petalColors = ["255,205,225", "255,180,210"];
  let petalMode = "blossom";

  function spawn(type) {
    const p = { type };
    if (type === "stars") {
      p.x = Math.random() * W; p.y = Math.random() * H;
      p.r = Math.random() * 1.5 + 0.4;
      p.tw = Math.random() * Math.PI * 2;
      p.c = "225,212,255";
    } else if (type === "petals") {
      p.x = Math.random() * W; p.y = -30;
      p.mode = petalMode;
      if (petalMode === "rose") {
        p.r = 11 + Math.random() * 9;
        p.vx = (Math.random() - 0.5) * 0.35;
        p.vy = 0.35 + Math.random() * 0.5;
        p.vrot = (Math.random() - 0.5) * 0.015;
        p.windK = 0.18;
      } else {
        p.r = 7 + Math.random() * 6;
        p.vx = (Math.random() - 0.5) * 0.6;
        p.vy = 0.7 + Math.random() * 1.0;
        p.vrot = (Math.random() - 0.5) * 0.045;
        p.windK = 0.75;
      }
      p.rot = Math.random() * Math.PI * 2;
      p.sway = Math.random() * Math.PI * 2;
      p.c = petalColors;
    } else if (type === "bubbles") {
      p.x = Math.random() * W; p.y = H + 30;
      p.r = 4 + Math.random() * 9;
      p.vy = -(0.4 + Math.random() * 0.7);
      p.sway = Math.random() * Math.PI * 2;
      p.c = "140,220,240";
    } else if (type === "fireflies") {
      p.x = Math.random() * W; p.y = Math.random() * H;
      p.r = 1.6 + Math.random() * 1.6;
      p.vx = (Math.random() - 0.5) * 0.3;
      p.vy = (Math.random() - 0.5) * 0.3;
      p.tw = Math.random() * Math.PI * 2;
      p.twSpeed = 0.02 + Math.random() * 0.03;
      p.c = "255,205,120";
    } else if (type === "embers") {
      p.x = Math.random() * W; p.y = H + 30;
      p.r = 1.8 + Math.random() * 2.6;
      p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = -(0.5 + Math.random() * 1);
      p.life = 1;
      p.c = Math.random() > 0.5 ? "255,160,70" : "255,120,55";
    } else if (type === "notes") {
      p.x = Math.random() * W; p.y = H + 30;
      p.r = 14 + Math.random() * 8;
      p.vx = (Math.random() - 0.5) * 0.35;
      p.vy = -(0.3 + Math.random() * 0.45);
      p.sway = Math.random() * Math.PI * 2;
      p.c = "200,170,255";
    } else if (type === "sparks") {
      p.x = Math.random() * W; p.y = H + 30;
      p.r = 1.4 + Math.random() * 1.8;
      p.vx = (Math.random() - 0.5) * 0.25;
      p.vy = -(0.35 + Math.random() * 0.55);
      p.tw = Math.random() * Math.PI * 2;
      p.c = Math.random() > 0.5 ? "255,220,170" : "170,215,255";
    }
    return p;
  }

  function spawnSecondary(type) {
    if (type === "bokeh") {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: 30 + Math.random() * 55,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(0.05 + Math.random() * 0.1),
        a: 0.15 + Math.random() * 0.25,
        c: "255,190,215",
      };
    }
    if (type === "hearts") {
      return {
        x: Math.random() * W, y: H + 30,
        r: 6 + Math.random() * 7,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(0.25 + Math.random() * 0.35),
        a: 0, aMax: 0.35 + Math.random() * 0.25, aDir: 1,
        c: "255,110,150",
      };
    }
  }

  function initPool(type) {
    const counts = { stars: 100, petals: petalMode === "rose" ? 30 : 42, bubbles: 36, fireflies: 42, embers: 42, notes: 18, sparks: 42 };
    pool = Array.from({ length: counts[type] || 40 }, () => spawn(type));
  }
  function initSecondary(type) {
    const counts = { bokeh: 9, hearts: 14 };
    secondaryPool = type ? Array.from({ length: counts[type] || 0 }, () => spawnSecondary(type)) : [];
  }

  // ── Cụm hoa đào 5 cánh thật (dùng cho cành hoa) ─────────────────────────────
  function drawBlossomCluster(cx, cy, color, size) {
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      ctx.save();
      ctx.rotate(ang);
      ctx.translate(0, -size * 0.55);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.6);
      g.addColorStop(0, `rgba(${color},0.85)`);
      g.addColorStop(1, `rgba(${color},0.3)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.42, size * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = "rgba(255,225,120,0.9)";
    ctx.beginPath(); ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ── Nụ hồng thật (nhiều lớp cánh xoắn) cho dây leo ──────────────────────────
  function drawRoseBud(cx, cy, color, size) {
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 4; i++) {
      const ang = i * 0.9 + 0.3;
      const sc = size * (1 - i * 0.16);
      ctx.save();
      ctx.rotate(ang);
      const g = ctx.createRadialGradient(-sc * 0.2, -sc * 0.2, 0, 0, 0, sc);
      g.addColorStop(0, `rgba(255,140,170,0.9)`);
      g.addColorStop(1, `rgba(${color},0.85)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, sc * 0.62, sc * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // ── Accent trang trí ─────────────────────────────────────────────────────
  let waveOffset = 0;
  function drawAccent(theme) {
    if (!theme || !theme.accentType) return;
    const a = theme.accent || {};
    if (theme.accentType === "moon") {
      drawDetailedMoon(W * a.cx, H * a.cy, a.r, a.color);
    } else if (theme.accentType === "sun" || theme.accentType === "sunrise") {
      const cx = W * a.cx, cy = H * a.cy;
      ctx.save();
      const pulse = 1 + Math.sin(tt * 0.8) * 0.05;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, a.r * 3.4 * pulse);
      g.addColorStop(0, `rgba(${a.color},0.35)`);
      g.addColorStop(1, `rgba(${a.color},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, a.r * 3.4 * pulse, 0, Math.PI * 2); ctx.fill();
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, a.r);
      g2.addColorStop(0, "rgba(255,245,225,0.98)");
      g2.addColorStop(1, `rgba(${a.color},0.85)`);
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.arc(cx, cy, a.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (theme.accentType === "wave") {
      waveOffset += 0.012;
      ctx.save();
      for (let layer = 0; layer < 2; layer++) {
        const baseY = H - 40 - layer * 26;
        ctx.beginPath(); ctx.moveTo(0, baseY);
        for (let x = 0; x <= W; x += 18) {
          const y = baseY + Math.sin(x * 0.012 + waveOffset * (layer ? 1.4 : 1) + layer) * (10 - layer * 3);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        ctx.fillStyle = `rgba(${a.color},${0.08 - layer * 0.03})`;
        ctx.fill();
      }
      ctx.restore();
    } else if (theme.accentType === "branch") {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = `rgba(${a.color},0.45)`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.bezierCurveTo(80, 60, 40, 140, 130, 210);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(30, 90);
      ctx.bezierCurveTo(70, 100, 90, 130, 95, 165);
      ctx.stroke();
      const blossoms = [[10, 15], [50, 80], [95, 155], [70, 105], [110, 190]];
      blossoms.forEach(([bx, by], i) => {
        const bob = Math.sin(tt * 0.6 + i) * 2;
        drawBlossomCluster(bx, by + bob, a.color, 9 + (i % 2) * 3);
      });
      ctx.restore();
    } else if (theme.accentType === "vine") {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = `rgba(${a.color},0.4)`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(W + 10, 0);
      ctx.bezierCurveTo(W - 80, 70, W - 30, 150, W - 120, 230);
      ctx.stroke();
      // gai dọc dây leo
      for (let i = 0; i < 7; i++) {
        const t = i / 6;
        const tx = W + 10 - t * 110, ty = t * 220;
        ctx.save();
        ctx.translate(tx, ty); ctx.rotate(-0.6 + t);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7, -3); ctx.lineTo(0, 3); ctx.closePath();
        ctx.fillStyle = `rgba(${a.color},0.5)`; ctx.fill();
        ctx.restore();
      }
      const buds = [[W - 30, 25], [W - 70, 95], [W - 100, 175]];
      buds.forEach(([bx, by], i) => {
        const bob = Math.sin(tt * 0.5 + i * 1.3) * 2;
        drawRoseBud(bx, by + bob, a.color, 12 + (i % 2) * 3);
      });
      ctx.restore();
    } else if (theme.accentType === "haze") {
      ctx.save();
      [[0.12, 0.88, 130], [0.85, 0.9, 160]].forEach(([fx, fy, r]) => {
        const cx = W * fx, cy = H * fy;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(${a.color},0.1)`);
        g.addColorStop(1, `rgba(${a.color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    }
  }

  let tt = 0, windPhase = 0;
  let activeThemeKey = "home";
  function loop() {
    requestAnimationFrame(loop);
    if (!currentType) return;
    ctx.clearRect(0, 0, W, H);
    tt += 0.016;
    windPhase += 0.006;
    const wind = Math.sin(windPhase);

    drawAccent(THEMES[activeThemeKey]);

    // Pool phụ vẽ trước (nằm sau particle chính 1 lớp cảm giác chiều sâu)
    secondaryPool.forEach((p, i) => {
      if (p.type === undefined) { /* bokeh/hearts không cần type check riêng */ }
      if (currentSecondary === "bokeh") {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -p.r) { secondaryPool[i] = spawnSecondary("bokeh"); secondaryPool[i].y = H + p.r; }
        drawBokeh(p);
      } else if (currentSecondary === "hearts") {
        p.x += p.vx + Math.sin(tt + i) * 0.15; p.y += p.vy;
        if (p.aDir === 1) { p.a += 0.006; if (p.a >= p.aMax) p.aDir = -1; }
        else { p.a -= 0.004; }
        if (p.y < -20 || p.a <= 0 && p.aDir === -1) secondaryPool[i] = spawnSecondary("hearts");
        drawHeart(p);
      }
    });

    pool.forEach((p, i) => {
      if (p.type === "stars") {
        const alpha = 0.25 + 0.6 * Math.abs(Math.sin(tt * 0.6 + p.tw));
        ctx.save(); ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${p.c})`;
        ctx.shadowColor = `rgba(${p.c},0.65)`; ctx.shadowBlur = 5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (p.type === "petals") {
        p.sway += p.mode === "rose" ? 0.012 : 0.024;
        p.x += p.vx + Math.sin(p.sway) * (p.mode === "rose" ? 0.25 : 0.55) + wind * p.windK;
        p.y += p.vy;
        p.rot += p.vrot + wind * 0.002;
        if (p.y > H + 30) pool[i] = spawn("petals");
        if (p.mode === "rose") drawRosePetal(p); else drawBlossomPetal(p);
      } else if (p.type === "bubbles") {
        p.sway += 0.03; p.x += Math.sin(p.sway) * 0.3; p.y += p.vy;
        if (p.y < -30) pool[i] = spawn("bubbles");
        drawBubble(p);
      } else if (p.type === "fireflies") {
        p.tw += p.twSpeed; p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        drawFirefly(p, 0.2 + 0.75 * Math.abs(Math.sin(p.tw)));
      } else if (p.type === "embers") {
        p.x += p.vx; p.y += p.vy; p.life -= 0.006;
        if (p.life <= 0 || p.y < -30) pool[i] = spawn("embers");
        drawEmber(p);
      } else if (p.type === "notes") {
        p.sway += 0.02; p.x += p.vx + Math.sin(p.sway) * 0.6; p.y += p.vy;
        if (p.y < -30) pool[i] = spawn("notes");
        drawNote(p);
      } else if (p.type === "sparks") {
        p.tw += 0.035; p.x += p.vx; p.y += p.vy;
        if (p.y < -30) pool[i] = spawn("sparks");
        drawSpark(p, 0.35 + 0.55 * Math.abs(Math.sin(p.tw)));
      }
    });
  }
  loop();

  function applyTheme(tab) {
    const t = THEMES[tab] || THEMES.home;
    activeThemeKey = THEMES[tab] ? tab : "home";
    document.body.style.background = t.bodyBg;
    const modeChanged = t.petalMode && t.petalMode !== petalMode;
    if (t.petalColor) petalColors = t.petalColor;
    if (t.petalMode) petalMode = t.petalMode;
    if (t.particle !== currentType || modeChanged) {
      currentType = t.particle;
      initPool(currentType);
    }
    const sec = t.secondary || null;
    if (sec !== currentSecondary) {
      currentSecondary = sec;
      initSecondary(sec);
    }
    canvas.classList.add("visible");
  }

  document.addEventListener("introEnded", () => {
    setTimeout(() => applyTheme("home"), 600);
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.tab));
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// HOVER TAB — bung ra chùm hạt nhỏ đúng chủ đề của tab đó
// ══════════════════════════════════════════════════════════════════════════════
(function initTabHoverBurst() {
  // Ký tự + màu tương ứng từng chủ đề
  const BURST = {
    home:     { glyphs: ["✦", "✧", "⋆"], color: "200,180,255" },
    timeline: { glyphs: ["🌸", "❀", "✿"], color: "255,175,205" },
    gallery:  { glyphs: ["○", "◦", "°"],  color: "110,215,235" },
    diary:    { glyphs: ["✦", "·", "✧"],  color: "255,200,130" },
    things:   { glyphs: ["🌹", "❤", "✿"], color: "255,105,145" },
    firsts:   { glyphs: ["✦", "◦", "⋆"],  color: "255,165,90"  },
    radio:    { glyphs: ["♪", "♫", "♩"],  color: "200,165,255" },
    future:   { glyphs: ["✧", "✦", "⋆"],  color: "150,205,255" },
  };

  let lastBurst = 0;

  function burst(btn) {
    const now = Date.now();
    if (now - lastBurst < 400) return;   // tránh spam khi rê chuột qua lại
    lastBurst = now;

    const cfg = BURST[btn.dataset.tab] || BURST.home;
    const rect = btn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + 12;

    for (let i = 0; i < 7; i++) {
      const el = document.createElement("div");
      el.textContent = cfg.glyphs[Math.floor(Math.random() * cfg.glyphs.length)];
      const size = 8 + Math.random() * 7;
      el.style.cssText = `
        position: fixed;
        left: ${originX}px;
        top: ${originY}px;
        font-size: ${size}px;
        color: rgba(${cfg.color}, 0.95);
        text-shadow: 0 0 10px rgba(${cfg.color}, 0.9);
        pointer-events: none;
        z-index: 9996;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.3);
        transition: transform 1s cubic-bezier(0.2, 0.8, 0.3, 1), opacity 1s ease;
        will-change: transform, opacity;
      `;
      document.body.appendChild(el);

      // Bay tỏa ra hình quạt, hơi chếch lên trên
      const angle = (-140 + Math.random() * 100) * (Math.PI / 180);
      const dist = 26 + Math.random() * 40;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const rot = (Math.random() - 0.5) * 180;

      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform =
          `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot}deg)`;
      });

      setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform =
          `translate(calc(-50% + ${dx * 1.4}px), calc(-50% + ${dy * 1.4 - 14}px)) scale(0.5) rotate(${rot * 1.5}deg)`;
      }, 520);

      setTimeout(() => el.remove(), 1600);
    }
  }

  // Chỉ chạy trên thiết bị có chuột thật (bỏ qua mobile để không nặng)
  if (window.matchMedia("(hover: hover)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("mouseenter", () => burst(btn));
    });
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// CUỘN THƯ MƯỢT + THANH CUỘN TỰ VẼ
// - Cuộn từ từ có quán tính thay vì nhảy một mạch
// - Thanh cuộn tự vẽ nên con trỏ mặc định không bao giờ hiện ra
// ══════════════════════════════════════════════════════════════════════════════
(function initSmoothLetterScroll() {
  const lc = document.getElementById("letterContent");
  if (!lc) return;

  const modal = lc.closest(".modal-content") || lc.parentElement;
  if (modal && getComputedStyle(modal).position === "static") {
    modal.style.position = "relative";
  }

  // ── Tạo thanh cuộn tự vẽ ───────────────────────────────────────────────────
  const track = document.createElement("div");
  track.id = "letterScrollTrack";
  const thumb = document.createElement("div");
  thumb.id = "letterScrollThumb";
  track.appendChild(thumb);
  modal.appendChild(track);

  // ── Trạng thái cuộn mượt ───────────────────────────────────────────────────
  let target = 0;         // vị trí muốn tới
  let current = 0;        // vị trí đang hiển thị
  let rafId = null;
  let animating = false;

  const EASE = 0.12;       // càng nhỏ càng trôi chậm/mượt
  const WHEEL_STEP = 0.9;  // hệ số nhân cho mỗi nấc lăn chuột

  function maxScroll() {
    return Math.max(0, lc.scrollHeight - lc.clientHeight);
  }

  function syncTrackGeometry() {
    const max = maxScroll();
    // Không có gì để cuộn thì ẩn thanh
    if (max <= 1) {
      track.classList.remove("visible");
      return;
    }
    const lcRect = lc.getBoundingClientRect();
    const mRect = modal.getBoundingClientRect();
    // Đặt track bám mép phải khung thư
    track.style.top = (lcRect.top - mRect.top + 10) + "px";
    track.style.height = (lcRect.height - 20) + "px";
    track.style.left = (lcRect.right - mRect.left - 16) + "px";
    track.classList.add("visible");

    const trackH = lcRect.height - 20;
    const ratio = lc.clientHeight / lc.scrollHeight;
    const thumbH = Math.max(26, trackH * ratio);
    thumb.style.height = thumbH + "px";
  }

  function updateThumbPos() {
    const max = maxScroll();
    if (max <= 1) return;
    const trackH = track.clientHeight;
    const thumbH = thumb.offsetHeight;
    const p = current / max;
    thumb.style.top = (p * (trackH - thumbH)) + "px";
  }

  function tick() {
    const diff = target - current;
    if (Math.abs(diff) < 0.4) {
      current = target;
      lc.scrollTop = current;
      updateThumbPos();
      animating = false;
      rafId = null;
      return;
    }
    current += diff * EASE;
    lc.scrollTop = current;
    updateThumbPos();
    rafId = requestAnimationFrame(tick);
  }

  function startAnim() {
    if (!animating) {
      animating = true;
      rafId = requestAnimationFrame(tick);
    }
  }

  function scrollBy(delta) {
    const max = maxScroll();
    target = Math.min(max, Math.max(0, target + delta));
    startAnim();
  }

  function scrollTo(pos) {
    const max = maxScroll();
    target = Math.min(max, Math.max(0, pos));
    startAnim();
  }

  // ── Lăn chuột: chặn mặc định, tự cuộn từ từ ────────────────────────────────
  lc.addEventListener("wheel", (e) => {
    if (maxScroll() <= 1) return;
    e.preventDefault();
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 18;        // cuộn theo dòng
    else if (e.deltaMode === 2) d *= lc.clientHeight; // cuộn theo trang
    scrollBy(d * WHEEL_STEP);
  }, { passive: false });

  // ── Phím mũi tên / PageUp / PageDown / Home / End ──────────────────────────
  lc.setAttribute("tabindex", "0");
  lc.style.outline = "none";
  lc.addEventListener("keydown", (e) => {
    const page = lc.clientHeight * 0.85;
    const keys = {
      ArrowDown: 60, ArrowUp: -60,
      PageDown: page, PageUp: -page,
    };
    if (e.key in keys) { e.preventDefault(); scrollBy(keys[e.key]); }
    else if (e.key === "Home") { e.preventDefault(); scrollTo(0); }
    else if (e.key === "End")  { e.preventDefault(); scrollTo(maxScroll()); }
  });

  // ── Kéo thanh cuộn tự vẽ ───────────────────────────────────────────────────
  let dragging = false;
  let dragStartY = 0;
  let dragStartScroll = 0;

  thumb.addEventListener("mousedown", (e) => {
    e.preventDefault();
    dragging = true;
    dragStartY = e.clientY;
    dragStartScroll = current;
    track.classList.add("dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    e.preventDefault();
    const trackH = track.clientHeight;
    const thumbH = thumb.offsetHeight;
    const usable = trackH - thumbH;
    if (usable <= 0) return;
    const dy = e.clientY - dragStartY;
    // Kéo tới đâu nhảy tới đó luôn cho khớp tay, không cần easing
    const max = maxScroll();
    const pos = dragStartScroll + (dy / usable) * max;
    target = current = Math.min(max, Math.max(0, pos));
    lc.scrollTop = current;
    updateThumbPos();
  }, { passive: false });

  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("dragging");
  });

  // Click vào phần trống của track → nhảy tới vị trí đó (có easing)
  track.addEventListener("mousedown", (e) => {
    if (e.target === thumb) return;
    const rect = track.getBoundingClientRect();
    const thumbH = thumb.offsetHeight;
    const p = (e.clientY - rect.top - thumbH / 2) / (rect.height - thumbH);
    scrollTo(p * maxScroll());
  });

  // ── Cảm ứng: giữ hành vi cuộn tự nhiên của mobile ──────────────────────────
  lc.addEventListener("touchstart", () => {
    if (rafId) cancelAnimationFrame(rafId);
    animating = false;
    current = target = lc.scrollTop;
  }, { passive: true });

  lc.addEventListener("scroll", () => {
    // Đồng bộ khi cuộn bằng cảm ứng hoặc nguồn khác
    if (!animating && !dragging) {
      current = target = lc.scrollTop;
      updateThumbPos();
    }
  }, { passive: true });

  // ── Đồng bộ lại mỗi khi mở thư / đổi kích thước ────────────────────────────
  function resetScroll() {
    current = target = 0;
    lc.scrollTop = 0;
    syncTrackGeometry();
    updateThumbPos();
  }

  // Theo dõi việc thư được hiển thị để canh lại thanh cuộn
  const mo = new MutationObserver(() => {
    if (lc.style.display !== "none") {
      setTimeout(() => { syncTrackGeometry(); updateThumbPos(); }, 60);
      setTimeout(() => { syncTrackGeometry(); updateThumbPos(); }, 700);
    } else {
      track.classList.remove("visible");
    }
  });
  mo.observe(lc, { attributes: true, attributeFilter: ["style"], childList: true });

  window.addEventListener("resize", () => {
    syncTrackGeometry();
    updateThumbPos();
  });

  // Đóng modal → ẩn thanh cuộn
  const closeBtn = document.getElementById("closeBtn");
  if (closeBtn) closeBtn.addEventListener("click", () => track.classList.remove("visible"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") track.classList.remove("visible");
  });

  // Cho phép nơi khác gọi lại khi cần
  window.resetLetterScroll = resetScroll;
})();

// ══════════════════════════════════════════════════════════════════════════════
// CHỐNG COPY NỘI DUNG
// Chặn chuột phải, Ctrl+C/X/A/S/P/U, kéo thả chữ, và menu giữ-lâu trên mobile.
// Ô nhập mật khẩu vẫn dùng bình thường.
// ══════════════════════════════════════════════════════════════════════════════
(function initAntiCopy() {
  // Cho phép thao tác bình thường bên trong ô nhập liệu
  const isInput = (el) =>
    el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

  // ── Chặn chuột phải ────────────────────────────────────────────────────────
  document.addEventListener("contextmenu", (e) => {
    if (isInput(e.target)) return;
    e.preventDefault();
  });

  // ── Chặn copy / cắt / kéo thả ──────────────────────────────────────────────
  ["copy", "cut", "dragstart"].forEach((ev) => {
    document.addEventListener(ev, (e) => {
      if (isInput(e.target)) return;
      e.preventDefault();
    });
  });

  // ── Chặn bôi đen ngoài ô nhập liệu ─────────────────────────────────────────
  document.addEventListener("selectstart", (e) => {
    if (isInput(e.target)) return;
    e.preventDefault();
  });

  // ── Chặn phím tắt sao chép / lưu / xem nguồn ───────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (isInput(e.target)) return;

    const k = e.key.toLowerCase();
    const combo = e.ctrlKey || e.metaKey;

    // Ctrl/Cmd + C, X, A, S, P, U
    if (combo && ["c", "x", "a", "s", "p", "u"].includes(k)) {
      e.preventDefault();
      return;
    }
    // Ctrl/Cmd + Shift + I / J / C  (mở devtools)
    if (combo && e.shiftKey && ["i", "j", "c"].includes(k)) {
      e.preventDefault();
      return;
    }
    // F12
    if (e.key === "F12") {
      e.preventDefault();
    }
  }, { capture: true });
})();