const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;

// ── Password ───────────────────────────────────────────────────────────────────
const GLOBAL_PASSWORD = process.env.PASSWORD || "yeuem100";

// ── TEST MODE ─────────────────────────────────────────────────────────────────
// Đặt thành false khi deploy thật — khi true tất cả thư đều mở được ngay
const TEST_MODE = true;

// ── Lịch mở thư ───────────────────────────────────────────────────────────────
// Thứ tự: 28/08 trước, 27/01 sau, bắt đầu từ 2026
//
//   28/08/2026 → thư #1
//   27/01/2027 → thư #2
//   28/08/2027 → thư #3
//   27/01/2028 → thư #4  ...

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
const letters = {};
for (let i = 1; i <= 100; i++) {
  letters[i] = {
    content: `babe, nay sinh nhật anh đóaa. người yêu của anh chắc không quên đâu ha, tại anh biết em chu đáo lắm, em bé của anh còn rất là tình cảm nữa, lúc nào cũng hay lo lắng cho anh vì sự vụng về của anh và anh cũng hay làm em phải lo nữa.. nhưng cũng thật nhẹ nhõm vì em ở đây với anh rồi, anh cảm thấy mình được nhận được sự yêu thương từ em nhiều lắm. sao babi thương anh quá dợ, babi đang diễn hửm, nếu là diễn thì babi diễn cả đời luôn có được không?? thật lòng với em nha... em là hạnh phúc lớn nhất của anh từ trước tới giờ đó. giữa rất nhiều người ngoài kia, em có nhiều sự lựa chọn, thậm chí là ở ngay xung quanh em thôi, nhưng em vẫn chọn ở lại với anh, vẫn yêu thương anh bằng cách dịu dàng nhất của em. cái ngày em xuất hiện á, anh bắt đầu muốn nói chuyện với em nhiều hơn dù chẳng có điểm gì chung, nói chuyện cũng chẳng biết phải bắt đầu ra sao nữa, nhiều khi mở mess xong vào tin nhắn với em xong cứ chần chừ hoài. mà nghĩ lại vậy thôi chứ cứ mỗi lần nghĩ tới thấy chạnh lòng 1 xíu á, mà chắc cũng không sao đâu, rồi cũng quen ấy mà. chắc đơn giản mà nói thì tại vì anh lỡ thương em mất rồi, nhưng nghe những thứ về em, anh đơn giản nghĩ rằng bản thân mình nên lùi lại 1 chút. chắc là vì thấy em yêu 1 người tới như vậy, sự xuất hiện của anh cũng không có ý nghĩa gì với em nữa đâu. anh ghét việc bản thân mình phải yêu 1 ai đó, anh cũng dần dần chấp nhận rằng tình yêu không dành cho anh nữa. anh từng nghĩ người như em sẽ chẳng bao giờ nhìn về phía anh cả. tại anh biết cảm giác yêu ai đó hết lòng là như nào mà… nên anh cũng hiểu nếu trong tim em lúc đó vẫn còn hình bóng khác thì anh có cố gắng cũng chẳng thay đổi được gì. tại tính của anh nó vậy đó, anh không thích làm ảnh hưởng tới ai hết cũng không muốn ai phải vì mình hết á. anh thích tự làm mọi thứ 1 mình, ở 1 mình, chịu đựng 1 mình, chơi 1 mình, có chuyện gì buồn cũng tự cho qua. có lẽ trước giờ dù có bạn có bè nhưng chưa bao giờ anh cảm thấy anh được nhận sự quan tâm đặc biệt từ ai đó tới như vậy.. kiểu như họ để ý tới cảm xúc của anh, nhớ những điều nhỏ bé của anh thành ra anh cứ sống kiểu thu mình lại như vậy lâu tới mức anh nghĩ chắc cuộc sống của anh sẽ luôn như thế từ giờ cho tới lúc già quá. sinh nhật những năm trước của anh khác lắm, anh còn chẳng tổ chức nữa cơ, bình thường ba mẹ anh vẫn sẽ nấu những món gì đó hoặc ra ngoài ăn gì đó, nhưng thú thật mà nói cứ mỗi lần sinh nhật tới là trong lòng lại thấy buồn. không phải vì không có ai ở bên cạnh.. mà là vì anh chẳng thể nào cảm nhận được niềm vui như trước nữa rồi. anh thích yên tĩnh dù sự yên tĩnh đó có thể gặm mòn tâm hồn mình.. nhưng biết sao được đây vì dù gì anh cũng chẳng bao giờ cảm thấy bản thân anh thuộc về bất kì thứ gì cả. `,
    music: `/music/${i}.mp3`,
  };
}

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

  if (password !== GLOBAL_PASSWORD) {
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