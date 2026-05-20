const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();

app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://fonts.googleapis.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
      ],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
    },
  },
}));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;

// ── Password ───────────────────────────────────────────────────────────────────
const GLOBAL_PASSWORD = process.env.PASSWORD || "yeuem100";

// ── TEST MODE ─────────────────────────────────────────────────────────────────
const TEST_MODE = process.env.TEST_MODE === "true" || false;

// ── Lịch mở thư ───────────────────────────────────────────────────────────────
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

function datePassed(month, day, year) {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const y = now.getFullYear();
  if (y > year) return true;
  if (y === year && m > month) return true;
  if (y === year && m === month && d >= day) return true;
  return false;
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