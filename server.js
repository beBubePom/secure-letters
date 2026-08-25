const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;

// ── Password ───────────────────────────────────────────────────────────────────
const GLOBAL_PASSWORD = process.env.PASSWORD || "porsche911";

// ── TEST MODE ─────────────────────────────────────────────────────────────────
const TEST_MODE = process.env.TEST_MODE === "true" || false;

// ── Lịch mở thư ───────────────────────────────────────────────────────────────
// Ngày trong SCHEDULE là ngày HIỂN THỊ cho em thấy (28/08 và 27/01).
// Thư thật sự mở sớm hơn UNLOCK_EARLY_DAYS ngày so với ngày hiển thị.
const UNLOCK_EARLY_DAYS = 2;

function buildSchedule() {
  const schedule = [];
  let letterNum = 1;
  let year = 2026;
  while (letterNum <= 100) {
    if (letterNum <= 100) schedule.push({ letter: letterNum++, month: 8, day: 28, year: year });
    if (letterNum <= 100) schedule.push({ letter: letterNum++, month: 1, day: 27, year: year + 1 });
    year++;
  }
  return schedule;
}

const SCHEDULE = buildSchedule();

// Lấy ngày/tháng/năm hiện tại theo giờ California (Pacific Time),
// bất kể server host chạy ở timezone nào (Render mặc định chạy UTC)
function getCaliforniaNow() {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = fmt.formatToParts(new Date());
  const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10);
  return { year: get("year"), month: get("month"), day: get("day") };
}

// Đổi y/m/d thành số YYYYMMDD để so sánh cho gọn
function toNum(y, m, d) {
  return y * 10000 + m * 100 + d;
}

// Ngày mở thật = ngày hiển thị trừ đi UNLOCK_EARLY_DAYS ngày
function getRealUnlockDate(month, day, year) {
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - UNLOCK_EARLY_DAYS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

function datePassed(month, day, year) {
  const now = getCaliforniaNow();
  const real = getRealUnlockDate(month, day, year);
  return toNum(now.year, now.month, now.day) >= toNum(real.year, real.month, real.day);
}

function getUnlockedLetterNumbers() {
  if (TEST_MODE) return new Set(Array.from({ length: 100 }, (_, i) => i + 1));
  const unlocked = new Set();
  for (const entry of SCHEDULE) {
    if (datePassed(entry.month, entry.day, entry.year)) unlocked.add(entry.letter);
  }
  return unlocked;
}

function getUnlockDate(number) {
  const entry = SCHEDULE.find((e) => e.letter === number);
  if (!entry) return null;
  return `${String(entry.day).padStart(2, "0")}/${String(entry.month).padStart(2, "0")}/${entry.year}`;
}

// ── Letter data ────────────────────────────────────────────────────────────────
const letters = require("./letters");

// ── Visit counter (IP-based) ───────────────────────────────────────────────────
// Nhận diện theo IP: anh mở ?chong=1 một lần để đăng ký IP hiện tại là "anh".
// Mọi IP đã đăng ký = anh, còn lại = em. Format mới tự reset counter cũ.
const VISITS_FILE = path.join(__dirname, "visits.json");

app.set("trust proxy", true);

function getClientIP(req) {
  return (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip || "unknown";
}

function readVisits() {
  try {
    const v = JSON.parse(fs.readFileSync(VISITS_FILE, "utf8"));
    if (!Array.isArray(v.anhIPs)) {
      return { anh: 0, em: 0, anhIPs: [] };
    }
    return v;
  } catch {
    return { anh: 0, em: 0, anhIPs: [] };
  }
}

function writeVisits(v) {
  try {
    fs.writeFileSync(VISITS_FILE, JSON.stringify(v));
  } catch (e) {
    console.error("Không ghi được visits.json:", e.message);
  }
}

// GET /visit/whoami — server tự nhận diện qua IP; ?chong=1 để đăng ký IP là anh
app.get("/visit/whoami", (req, res) => {
  const ip = getClientIP(req);
  const visits = readVisits();
  if (req.query.chong === "1" && !visits.anhIPs.includes(ip)) {
    visits.anhIPs.push(ip);
    writeVisits(visits);
  }
  res.json({ role: visits.anhIPs.includes(ip) ? "anh" : "em" });
});

// POST /visit — server tự xác định anh/em qua IP, client không cần gửi gì
app.post("/visit", (req, res) => {
  const ip = getClientIP(req);
  const visits = readVisits();
  const key = visits.anhIPs.includes(ip) ? "anh" : "em";
  visits[key] = (visits[key] || 0) + 1;
  writeVisits(visits);
  res.json({ anh: visits.anh, em: visits.em });
});

// GET /visits — chỉ đọc số hiện tại
app.get("/visits", (req, res) => {
  const v = readVisits();
  res.json({ anh: v.anh, em: v.em });
});

// POST /visit/reset — reset counter về 0 (cần mật khẩu chính)
app.post("/visit/reset", (req, res) => {
  if (req.body.password !== GLOBAL_PASSWORD) {
    return res.status(401).json({ message: "Sai mật khẩu 🔐" });
  }
  const v = readVisits();
  writeVisits({ anh: 0, em: 0, anhIPs: v.anhIPs });
  res.json({ ok: true, anh: 0, em: 0 });
});

// ── API: danh sách thư đã mở ──────────────────────────────────────────────────
app.get("/unlocked-letters", (req, res) => {
  res.json({ unlocked: Array.from(getUnlockedLetterNumbers()) });
});

// ── API: đọc thư ──────────────────────────────────────────────────────────────
app.post("/read-letter", (req, res) => {
  const { number, password } = req.body;

  if (!number || typeof number !== "number" || number < 1 || number > 100) {
    return res.status(400).json({ message: "Số thư không hợp lệ" });
  }

  if (!TEST_MODE && password !== GLOBAL_PASSWORD) {
    return res.status(401).json({ message: "Sai mật khẩu 🔐" });
  }

  const unlocked = getUnlockedLetterNumbers();
  if (!unlocked.has(number)) {
    const unlockDate = getUnlockDate(number) || "???";
    return res.status(403).json({ message: `Thư này sẽ mở vào ngày ${unlockDate} 🕰️` });
  }

  const letter = letters[number];
  if (!letter) return res.status(404).json({ message: "Không tìm thấy thư" });

  console.log(`[TEST_MODE=${TEST_MODE}] Letter #${number} opened`);
  res.json({ content: letter.content, music: letter.music });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} | TEST_MODE=${TEST_MODE}`);
  if (!TEST_MODE) {
    const unlocked = Array.from(getUnlockedLetterNumbers());
    console.log(`Unlocked: ${unlocked.length ? unlocked.join(", ") : "none yet"}`);
    console.log(`Next unlock: ${getUnlockDate(unlocked.length + 1) || "all done!"}`);
  }
});