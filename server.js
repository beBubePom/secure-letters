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
const PORTFOLIO_FILE = path.join(__dirname, "portfolio.json");

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

// ── ĐẦU TƯ: Giá stock (gọi thẳng Yahoo Finance chart API, không cần package) ──
const YAHOO_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" };

async function yahooChart(symbol, range, interval) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const r = await fetch(url, { headers: YAHOO_HEADERS });
  if (!r.ok) throw new Error(`Yahoo trả về ${r.status}`);
  const json = await r.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(json?.chart?.error?.description || "Không có data");
  return result;
}

// Cache giá 5 phút để không spam Yahoo
const priceCache = { data: {}, time: {} };
const CACHE_MS = 5 * 60 * 1000;

app.get("/api/prices", async (req, res) => {
  const symbols = (req.query.symbols || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (!symbols.length) return res.status(400).json({ message: "Thiếu symbols" });

  const out = {};
  const now = Date.now();
  const need = symbols.filter((s) => {
    if (priceCache.data[s] && now - priceCache.time[s] < CACHE_MS) {
      out[s] = priceCache.data[s];
      return false;
    }
    return true;
  });

  await Promise.all(need.map(async (s) => {
    try {
      const result = await yahooChart(s, "1d", "5m");
      const meta = result.meta || {};
      const price = meta.regularMarketPrice ?? null;
      const prev = meta.chartPreviousClose ?? meta.previousClose ?? null;
      const info = {
        symbol: s,
        price,
        change: price != null && prev != null ? Math.round((price - prev) * 100) / 100 : null,
        changePct: price != null && prev != null && prev !== 0 ? ((price - prev) / prev) * 100 : null,
        currency: meta.currency || "USD",
        name: meta.shortName || meta.longName || s,
      };
      out[s] = info;
      priceCache.data[s] = info;
      priceCache.time[s] = now;
    } catch (e) {
      console.error(`Yahoo quote error (${s}):`, e.message);
    }
  }));
  res.json(out);
});

// Lịch sử giá cho biểu đồ — range giống Robinhood: 1d, 1w, 1m, 3m, ytd, 1y, 5y, max
const RANGE_MAP = {
  "1d":  { yr: "1d",  interval: "5m",  intraday: true },
  "1w":  { yr: "5d",  interval: "30m", intraday: true },
  "1m":  { yr: "1mo", interval: "1d" },
  "3m":  { yr: "3mo", interval: "1d" },
  "ytd": { yr: "ytd", interval: "1d" },
  "1y":  { yr: "1y",  interval: "1d" },
  "5y":  { yr: "5y",  interval: "1wk" },
  "max": { yr: "max", interval: "1mo" },
};

app.get("/api/history", async (req, res) => {
  const symbol = (req.query.symbol || "").trim().toUpperCase();
  const range = (req.query.range || "1y").toLowerCase();
  if (!symbol) return res.status(400).json({ message: "Thiếu symbol" });
  const cfg = RANGE_MAP[range] || RANGE_MAP["1y"];

  const cacheKey = `hist_${symbol}_${range}`;
  const now = Date.now();
  const histCacheMs = cfg.intraday ? 5 * 60 * 1000 : 30 * 60 * 1000;
  if (priceCache.data[cacheKey] && now - priceCache.time[cacheKey] < histCacheMs) {
    return res.json(priceCache.data[cacheKey]);
  }

  try {
    const result = await yahooChart(symbol, cfg.yr, cfg.interval);
    const ts = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const points = [];
    for (let i = 0; i < ts.length; i++) {
      if (closes[i] == null) continue;
      const d = new Date(ts[i] * 1000);
      points.push({
        date: cfg.intraday
          ? d.toISOString().slice(5, 16).replace("T", " ")
          : d.toISOString().slice(0, 10),
        close: Math.round(closes[i] * 100) / 100,
      });
    }
    const payload = { symbol, range, points };
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