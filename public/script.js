let currentLetter = null;
let unlockedSet = new Set();

const bgMusic = document.getElementById("bgMusic");
const letterMusic = document.getElementById("letterMusic");
const catImg = document.getElementById("catImg");
bgMusic.volume = 0.18;

// ── Playlist ──────────────────────────────────────────────────────────────────
const PLAYLIST = [
  "music/background.mp3",
  "music/background2.mp3",
];
let currentTrack = 0;

function loadTrack(idx) {
  const wasPlaying = !bgMusic.paused;
  bgMusic.src = PLAYLIST[idx];
  bgMusic.load();
  if (wasPlaying) bgMusic.play().catch(() => {});
}


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
catImg.addEventListener("mouseleave", () => { catImg.src = "images/pop1.png"; });
catImg.addEventListener("click", () => {
  // Đổi sang bài tiếp theo (hoặc phát nếu đang dừng)
  if (bgMusic.paused) {
    bgMusic.play();
  } else {
    currentTrack = (currentTrack + 1) % PLAYLIST.length;
    loadTrack(currentTrack);
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
const TITLE_QUESTIONS = [
  "Hạnh phúc có hình hài gì vậy?",
  "Em có biết anh nghĩ gì lúc thức dậy không?",
  "Nếu thời gian dừng lại, em muốn dừng ở khoảnh khắc nào?",
  "Em thấy bình yên nhất khi nào?",
  "Điều gì khiến em mỉm cười mà không hay biết?",
  "Nếu có thể nói một điều với anh mà không sợ gì, em sẽ nói gì?",
  "Em nghĩ tình yêu trông như thế nào?",
  "Kỷ niệm nào của chúng mình em hay nghĩ tới nhất?",
  "Em ước mình và anh sẽ cùng nhau làm gì?",
  "Điều nhỏ nhặt nào khiến em thấy được yêu thương?",
  "Nếu viết một lá thư cho bản thân 10 năm sau, em sẽ viết gì?",
  "Em thích nhất điều gì ở chính mình?",
  "Âm thanh nào khiến em thấy dễ chịu nhất?",
  "Em mơ về tương lai như thế nào?",
  "Nếu hôm nay là ngày cuối cùng, em sẽ làm gì?",
  "Điều gì ở anh khiến em bất ngờ nhất?",
  "Em cảm thấy thế nào khi được ở bên anh?",
  "Nơi nào trên thế giới em muốn cùng anh đến?",
  "Khi buồn, điều gì giúp em tốt hơn?",
  "Em thích mình nhất vào lúc nào trong ngày?",
  "Nếu cuộc sống là một bài hát, em muốn nó nghe như thế nào?",
  "Điều em sợ mất nhất là gì?",
  "Em có bí mật nhỏ nào muốn kể cho anh không?",
  "Khoảnh khắc nào em thấy mình dũng cảm nhất?",
  "Em nghĩ chúng mình hợp nhau ở điểm nào nhất?",
  "Nếu có một điều ước, em sẽ ước gì?",
  "Mùa nào trong năm em yêu thích nhất và tại sao?",
  "Em nghĩ về tương lai của chúng mình như thế nào?",
  "Điều gì em muốn anh hiểu hơn về em?",
  "Khi nhìn bầu trời đêm, em nghĩ đến điều gì?",
  "Em cảm thấy thế nào khi được gọi là vợ yêu?",
  "Nếu có thể quay lại một ngày trong quá khứ, em chọn ngày nào?",
  "Điều gì khiến em thấy cuộc sống đáng sống?",
  "Em muốn chúng mình già đi như thế nào?",
  "Kỷ niệm đầu tiên về anh mà em nhớ nhất là gì?",
  "Em thấy bản thân mình thay đổi như thế nào từ khi có anh?",
  "Điều nhỏ nhặt nào của anh khiến em yêu anh hơn?",
  "Nếu tình yêu có màu sắc, em nghĩ nó màu gì?",
  "Em muốn ngủ mơ thấy điều gì đêm nay?",
  "Khi nào em cảm thấy tự hào về bản thân nhất?",
  "Em thích được ôm hay được cầm tay hơn?",
  "Nếu chúng mình là nhân vật trong truyện, câu chuyện đó sẽ như thế nào?",
  "Điều gì khiến em cười nhiều nhất?",
  "Em nghĩ tình bạn và tình yêu khác nhau ở chỗ nào?",
  "Khoảnh khắc nào em cảm thấy mình được hiểu nhất?",
  "Em muốn mình và anh học điều gì cùng nhau?",
  "Nếu có thể gặp lại bản thân 5 năm trước, em sẽ nói gì?",
  "Em nghĩ nhà là gì?",
  "Điều gì khiến em thấy ấm lòng nhất?",
  "Em mong muốn điều gì nhất cho chúng mình?",
  "Nếu một ngày không có điện thoại, em sẽ làm gì?",
  "Âm nhạc nào gợi nhớ về anh cho em?",
  "Em thích ngồi im và suy nghĩ hay nói chuyện hơn?",
  "Điều gì em làm tốt mà ít người biết?",
  "Khi trưởng thành hơn, em muốn giữ lại điều gì của hiện tại?",
  "Em nghĩ sự im lặng giữa hai người có ý nghĩa gì?",
  "Nếu có thể chọn lại, em vẫn chọn anh không?",
  "Em thấy mình may mắn nhất ở điều gì?",
  "Điều gì em chưa nói với anh mà muốn nói?",
  "Khoảnh khắc nào em thấy chúng mình gần nhau nhất?",
  "Em nghĩ tình yêu cần điều kiện gì để bền vững?",
  "Nếu anh là một cuốn sách, em sẽ đọc trang nào trước?",
  "Em muốn con cái chúng mình lớn lên như thế nào?",
  "Điều gì trong cuộc sống khiến em thấy biết ơn nhất?",
  "Em thích sáng sớm hay đêm muộn hơn?",
  "Nếu không có giới hạn nào, em muốn làm gì?",
  "Em nghĩ chúng mình cần gì để hạnh phúc hơn?",
  "Khoảnh khắc nào em cảm thấy tự do nhất?",
  "Điều gì ở cuộc sống hiện tại em muốn giữ mãi?",
  "Em nghĩ về bản thân như thế nào khi nhìn vào gương?",
  "Nếu viết nhật ký, hôm nay em sẽ viết gì?",
  "Em muốn anh nhớ đến mình như thế nào?",
  "Điều gì khiến em cảm thấy được chở che?",
  "Em thích mưa hay nắng hơn và tại sao?",
  "Nếu một ngày chỉ làm một việc, em chọn việc gì?",
  "Em nghĩ điều gì quan trọng nhất trong một mối quan hệ?",
  "Khi em vui, em muốn chia sẻ với ai đầu tiên?",
  "Em mong muốn mình trở thành người như thế nào?",
  "Điều gì của anh khiến em cảm thấy an toàn?",
  "Nếu có thể đi đến bất kỳ đâu ngay lúc này, em chọn đâu?",
  "Em nghĩ về tuổi già như thế nào?",
  "Điều gì em thấy đẹp nhất trong cuộc sống?",
  "Khoảnh khắc nào của chúng mình em muốn chụp lại nhất?",
  "Em thích được nghe gì nhất từ anh?",
  "Nếu tình yêu là một chuyến đi, chúng mình đang ở đâu?",
  "Em cảm thấy thế nào khi nghĩ đến 10 năm nữa bên anh?",
  "Điều gì em muốn làm cho anh nhưng chưa có dịp?",
  "Em nghĩ những khoảnh khắc bình thường có ý nghĩa gì?",
  "Nếu có thể thay đổi một điều về thế giới, em chọn điều gì?",
  "Em thích giữ kỷ niệm bằng cách nào?",
  "Điều gì em hy vọng anh luôn nhớ về em?",
  "Em cảm thấy thế nào khi đọc những lá thư này?",
  "Nếu hạnh phúc là một nơi chốn, nó ở đâu với em?",
  "Em muốn chúng mình cùng nhau vượt qua điều gì?",
  "Điều gì khiến em tin vào tình yêu?",
  "Khi nhắm mắt lại và nghĩ về bình yên, em thấy gì?",
  "Em muốn nói gì với anh vào lúc này?",
];

// Thêm 100 câu hỏi nữa
const TITLE_QUESTIONS_2 = [
  "Em thấy anh khác những người khác ở điểm nào?",
  "Nếu chúng mình có một bài hát riêng, đó sẽ là bài gì?",
  "Em muốn được biết điều gì về anh mà anh chưa kể?",
  "Khi mệt mỏi nhất, điều gì giúp em đứng dậy?",
  "Em nghĩ tình yêu thật sự có nghĩa là gì?",
  "Nếu có thể sống ở bất kỳ thời đại nào, em chọn thời nào?",
  "Điều gì em muốn con cái chúng mình được thừa hưởng từ em?",
  "Em cảm thấy thế nào khi anh không ở bên?",
  "Nếu mỗi ngày là một trang giấy, hôm nay em viết gì?",
  "Điều gì ở em mà anh làm em trân trọng hơn?",
  "Em nghĩ về sự cô đơn như thế nào?",
  "Khoảnh khắc nào em muốn thì thầm vào tai anh?",
  "Nếu tình yêu là một mùa, đó là mùa gì?",
  "Em thấy mình khỏe mạnh nhất — cả thể xác lẫn tâm hồn — khi nào?",
  "Điều gì trong cuộc sống em chưa dám thử mà muốn thử?",
  "Em nghĩ hai chúng mình bổ sung cho nhau ở điểm nào?",
  "Nếu có thể ôm anh ngay lúc này, em sẽ ôm bao lâu?",
  "Điều gì khiến em nghĩ đây là tình yêu đúng đắn?",
  "Em thích phiên bản nào của mình nhất?",
  "Khi nhìn trời mưa, em nghĩ đến điều gì?",
  "Nếu chúng mình cùng mở một quán, đó sẽ là quán gì?",
  "Em muốn học được gì từ anh?",
  "Điều gì trong cuộc sống em thấy đang thay đổi theo hướng tốt?",
  "Em nghĩ giây phút nào chúng mình trở nên thật sự gần nhau?",
  "Nếu viết một bài thơ cho anh, câu đầu tiên sẽ là gì?",
  "Em thích nhất khi anh làm gì?",
  "Điều gì khiến em thấy mình được lắng nghe?",
  "Nếu cuộc đời là một bức tranh, em muốn vẽ nó như thế nào?",
  "Em nghĩ sự hy sinh trong tình yêu là gì?",
  "Khoảnh khắc nào em cảm thấy anh hiểu em nhất?",
  "Em muốn chúng mình có những buổi tối như thế nào?",
  "Điều gì em thấy mình cần cải thiện nhất?",
  "Nếu có thể nói chuyện với sao đêm, em hỏi điều gì?",
  "Em nghĩ về sự kiên nhẫn như thế nào?",
  "Khi cười thật sự, em nghĩ đến điều gì?",
  "Điều gì anh làm khiến em thấy được trân trọng?",
  "Em muốn sống chậm lại ở khoảnh khắc nào?",
  "Nếu tình yêu là một loài hoa, đó là hoa gì?",
  "Em nghĩ về sự tha thứ như thế nào trong tình yêu?",
  "Điều gì em muốn trải nghiệm lần đầu cùng anh?",
  "Khi nhìn ảnh cũ của mình, em nghĩ gì?",
  "Em thích được anh gọi bằng tên gì nhất?",
  "Nếu có thể viết lại một kỷ niệm, em viết lại gì?",
  "Điều gì trong tương lai khiến em hào hứng nhất?",
  "Em nghĩ về sự trưởng thành trong tình yêu như thế nào?",
  "Khoảnh khắc nào em thấy mình đang thật sự sống?",
  "Nếu chỉ có một từ để mô tả chúng mình, đó là từ gì?",
  "Em muốn anh biết điều gì mà chưa nói được?",
  "Điều gì em làm mỗi ngày mà không nhận ra là thói quen?",
  "Nếu tình yêu có mùi, em nghĩ nó thơm như gì?",
  "Em thấy điều gì ở anh ngày càng em yêu thêm?",
  "Khi đi bộ một mình, em thường nghĩ về điều gì?",
  "Điều gì khiến em cảm thấy nhớ nhà?",
  "Nếu có thể ngủ và tỉnh dậy ở bất kỳ đâu, em chọn đâu?",
  "Em nghĩ về sự chung thủy như thế nào?",
  "Khoảnh khắc nào em thấy mình đang yêu nhất?",
  "Điều gì khiến em tin rằng chúng mình được sinh ra cho nhau?",
  "Nếu có thể gửi một món quà qua thời gian, em gửi gì?",
  "Em nghĩ về giấc ngủ và những giấc mơ như thế nào?",
  "Điều gì em làm vì anh mà anh không biết?",
  "Khi nghe một bài nhạc hay, em muốn chia sẻ với ai đầu tiên?",
  "Em muốn chúng mình cùng nhau xây dựng điều gì?",
  "Nếu có thể chọn một siêu năng lực, em chọn gì?",
  "Điều gì khiến em thấy cuộc sống thú vị hơn khi có anh?",
  "Em nghĩ về sự chấp nhận trong tình yêu như thế nào?",
  "Khoảnh khắc nào em muốn time lapse lại?",
  "Nếu viết một câu trên bầu trời, em viết gì?",
  "Điều gì em đang học cách yêu thương hơn về bản thân?",
  "Em cảm thấy thế nào khi nghĩ đến việc già đi cùng anh?",
  "Khi anh không ở đây, em làm gì để cảm thấy anh gần hơn?",
  "Điều gì khiến em thấy mình đặc biệt?",
  "Nếu có thể hỏi tương lai một câu, em hỏi gì?",
  "Em nghĩ về sự dũng cảm trong tình yêu như thế nào?",
  "Khoảnh khắc nào của cuộc sống hàng ngày em thấy đẹp nhất?",
  "Điều gì em muốn giữ lại từ tuổi thơ?",
  "Nếu một ngày em là anh, em sẽ làm gì đầu tiên?",
  "Em thích được anh nhìn theo cách nào?",
  "Điều gì khiến em cảm thấy cuộc sống đang mỉm cười với mình?",
  "Khi trời tối, em thường làm gì một mình?",
  "Em nghĩ về sự bình thường trong tình yêu như thế nào?",
  "Nếu có thể ăn một bữa ăn cuối cùng, em chọn món gì?",
  "Điều gì em muốn anh làm nhiều hơn?",
  "Khoảnh khắc nào em thấy thời gian trôi quá nhanh?",
  "Em nghĩ chúng mình sẽ nhớ năm nay như thế nào?",
  "Nếu tình yêu là một căn phòng, em muốn nó trông như thế nào?",
  "Điều gì em thấy mình đã dũng cảm khi chọn anh?",
  "Khi nhìn anh ngủ, em nghĩ gì?",
  "Em muốn chúng mình cùng nhau vẽ tương lai như thế nào?",
  "Điều gì em biết ơn nhất về chính mình?",
  "Nếu có thể gửi một lá thư cho anh của 10 năm sau, em viết gì?",
  "Em nghĩ tình yêu trưởng thành trông như thế nào?",
  "Khoảnh khắc nào em thấy mình hoàn toàn là chính mình?",
  "Điều gì em muốn thế giới biết về tình yêu của chúng mình?",
  "Nếu phải mô tả anh bằng một loài cây, đó là cây gì?",
  "Em cảm thấy thế nào khi đọc câu hỏi hôm nay?",
  "Điều gì khiến em muốn tiếp tục yêu và được yêu?",
  "Khi anh hỏi em có ổn không, em thật sự muốn nói gì?",
  "Nếu chỉ có một điều em muốn anh nhớ mãi về em, đó là gì?",
];

const ALL_QUESTIONS = [...TITLE_QUESTIONS, ...TITLE_QUESTIONS_2];

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
  { border:"rgb(240,150,165)",  hover:"rgb(255,185,200)",  bg:"rgba(230,130,148,0.18)", glow:"rgba(240,150,165,0.7)"  }, // hồng bụi
  { border:"rgb(100,200,255)",  hover:"rgb(140,225,255)",  bg:"rgba(90,185,240,0.15)",  glow:"rgba(100,200,255,0.7)"  }, // xanh băng
  { border:"rgb(180,240,160)",  hover:"rgb(210,255,190)",  bg:"rgba(160,225,140,0.15)", glow:"rgba(180,240,160,0.7)"  }, // xanh mint
  { border:"rgb(255,210,100)",  hover:"rgb(255,232,140)",  bg:"rgba(240,195,80,0.15)",  glow:"rgba(255,210,100,0.7)"  }, // vàng mật
  { border:"rgb(200,140,255)",  hover:"rgb(225,175,255)",  bg:"rgba(185,120,245,0.15)", glow:"rgba(200,140,255,0.7)"  }, // tím lavender
  { border:"rgb(255,160,100)",  hover:"rgb(255,192,140)",  bg:"rgba(240,145,85,0.15)",  glow:"rgba(255,160,100,0.7)"  }, // cam đào
  { border:"rgb(100,235,210)",  hover:"rgb(140,255,230)",  bg:"rgba(85,220,195,0.15)",  glow:"rgba(100,235,210,0.7)"  }, // ngọc bích
  { border:"rgb(255,140,180)",  hover:"rgb(255,175,210)",  bg:"rgba(240,120,162,0.15)", glow:"rgba(255,140,180,0.7)"  }, // hồng sen
  { border:"rgb(160,200,255)",  hover:"rgb(195,225,255)",  bg:"rgba(140,185,245,0.15)", glow:"rgba(160,200,255,0.7)"  }, // xanh bầu trời
  { border:"rgb(255,200,160)",  hover:"rgb(255,222,190)",  bg:"rgba(240,182,138,0.15)", glow:"rgba(255,200,160,0.7)"  }, // vàng hồng
  { border:"rgb(210,160,255)",  hover:"rgb(235,190,255)",  bg:"rgba(195,140,248,0.15)", glow:"rgba(210,160,255,0.7)"  }, // tím hoa
  { border:"rgb(120,240,180)",  hover:"rgb(155,255,210)",  bg:"rgba(100,225,162,0.15)", glow:"rgba(120,240,180,0.7)"  }, // xanh lá non
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