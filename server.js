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

// POST /visit/reset — reset counter về 0 (cần password)
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

// ── ĐẦU TƯ: Portfolio data (JSON file) ────────────────────────────────────────
const PORTFOLIO_FILE = path.join(__dirname, "data", "portfolio.json");

function readPortfolio() {
  try {
    return JSON.parse(fs.readFileSync(PORTFOLIO_FILE, "utf8"));
  } catch {
    return null;
  }
}

app.get("/api/portfolio", (req, res) => {
  const data = readPortfolio();
  if (!data) return res.status(500).json({ message: "Không đọc được portfolio data" });
  res.json(data);
});

app.post("/api/portfolio", (req, res) => {
  const { password, data } = req.body;
  if (password !== GLOBAL_PASSWORD) {
    return res.status(401).json({ message: "Sai mật khẩu 🔐" });
  }
  if (!data || typeof data !== "object") {
    return res.status(400).json({ message: "Data không hợp lệ" });
  }
  try {
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(data, null, 2));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: "Không ghi được file: " + e.message });
  }
});

// ── ĐẦU TƯ: Giá stock (Yahoo Finance proxy) ───────────────────────────────────
let yahooFinance = null;
import("yahoo-finance2")
  .then((mod) => {
    yahooFinance = mod.default;
    if (yahooFinance.suppressNotices) yahooFinance.suppressNotices(["yahooSurvey"]);
    console.log("yahoo-finance2 loaded ✅");
  })
  .catch((e) => console.log("yahoo-finance2 chưa được cài — chạy npm install:", e.message));

// Cache giá 5 phút để không spam Yahoo
const priceCache = { data: {}, time: {} };
const CACHE_MS = 5 * 60 * 1000;

app.get("/api/prices", async (req, res) => {
  if (!yahooFinance) return res.status(500).json({ message: "yahoo-finance2 chưa cài" });
  const symbols = (req.query.symbols || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (!symbols.length) return res.status(400).json({ message: "Thiếu symbols" });

  const out = {};
  const need = [];
  const now = Date.now();
  for (const s of symbols) {
    if (priceCache.data[s] && now - priceCache.time[s] < CACHE_MS) {
      out[s] = priceCache.data[s];
    } else {
      need.push(s);
    }
  }

  if (need.length) {
    try {
      const quotes = await yahooFinance.quote(need);
      const arr = Array.isArray(quotes) ? quotes : [quotes];
      for (const q of arr) {
        const info = {
          symbol: q.symbol,
          price: q.regularMarketPrice ?? null,
          change: q.regularMarketChange ?? null,
          changePct: q.regularMarketChangePercent ?? null,
          currency: q.currency || "USD",
          name: q.shortName || q.longName || q.symbol,
        };
        out[q.symbol] = info;
        priceCache.data[q.symbol] = info;
        priceCache.time[q.symbol] = now;
      }
    } catch (e) {
      console.error("Yahoo quote error:", e.message);
    }
  }
  res.json(out);
});

// Lịch sử giá cho biểu đồ (6 tháng, daily)
app.get("/api/history", async (req, res) => {
  if (!yahooFinance) return res.status(500).json({ message: "yahoo-finance2 chưa cài" });
  const symbol = (req.query.symbol || "").trim().toUpperCase();
  if (!symbol) return res.status(400).json({ message: "Thiếu symbol" });

  const cacheKey = "hist_" + symbol;
  const now = Date.now();
  if (priceCache.data[cacheKey] && now - priceCache.time[cacheKey] < 30 * 60 * 1000) {
    return res.json(priceCache.data[cacheKey]);
  }

  try {
    const start = new Date();
    start.setMonth(start.getMonth() - 6);
    const result = await yahooFinance.chart(symbol, {
      period1: start,
      interval: "1d",
    });
    const points = (result.quotes || [])
      .filter((q) => q.close != null)
      .map((q) => ({ date: q.date.toISOString().slice(0, 10), close: Math.round(q.close * 100) / 100 }));
    const payload = { symbol, points };
    priceCache.data[cacheKey] = payload;
    priceCache.time[cacheKey] = now;
    res.json(payload);
  } catch (e) {
    res.status(500).json({ message: "Không lấy được lịch sử giá: " + e.message });
  }
});

// ── ĐẦU TƯ: Crypto (CoinGecko proxy) ──────────────────────────────────────────
app.get("/api/crypto", async (req, res) => {
  const cacheKey = "crypto_btc_eth";
  const now = Date.now();
  if (priceCache.data[cacheKey] && now - priceCache.time[cacheKey] < CACHE_MS) {
    return res.json(priceCache.data[cacheKey]);
  }
  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"
    );
    const data = await r.json();
    priceCache.data[cacheKey] = data;
    priceCache.time[cacheKey] = now;
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: "Không lấy được giá crypto: " + e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} | TEST_MODE=${TEST_MODE}`);
  if (!TEST_MODE) {
    const unlocked = Array.from(getUnlockedLetterNumbers());
    console.log(`Unlocked: ${unlocked.length ? unlocked.join(", ") : "none yet"}`);
    console.log(`Next unlock: ${getUnlockDate(unlocked.length + 1) || "all done!"}`);
  }
});