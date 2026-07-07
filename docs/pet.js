/* 時光小夥伴 v2：全身 2D 桌寵（麻吉）。
   SVG 向量貓 + 狀態機：底部散步（自動轉身）、追毛線球撲擊、坐下搖尾巴、
   閒置入睡 💤、點擊蹦跳＋聰明對話泡泡（今日張數/生日/同題）。✕ 收起記憶 7 天。 */
(function () {
  "use strict";
  if (localStorage.getItem("pet-off") && Date.now() - (+localStorage.getItem("pet-off")) < 7 * 86400 * 1000) return;

  var NAME = "麻吉";
  var RAW = "https://raw.githubusercontent.com/green麻吉/catime/main/catlist.json";
  var MEOW = ["汪!", "嗚嗚~", "汪汪?"];
  var TIPS = [
    "點上面的『猜靈感』來玩一局?",
    "時光牆一格一小時，走完就是一天",
    "電視牆可以放客廳當電子相框喔",
    "去時光小鎮看看大家的關係~",
    "每小時都有新朋友誕生",
  ];
  var WAKE_LINE = "汪!? 我沒有在睡";
  var HELLO = "嗨~ 我是" + NAME + " 🐾";

  /* ── 全身 SVG（側面朝左；麻吉：橘虎斑＋白圍兜＋琥珀眼） ── */
  var PET_SVG =
    '<svg viewBox="0 0 132 96" width="112" height="82" xmlns="http://www.w3.org/2000/svg">' +
    '<g class="tail-g"><path class="tail" d="M104 50 C120 38 124 22 110 20 C99 18.5 97 32 107 36" fill="none" stroke="#C96F33" stroke-width="10" stroke-linecap="round"/>' +
    '<path d="M108 24 C104 24 102 28 105 31" fill="none" stroke="#FFF6E8" stroke-width="4" stroke-linecap="round"/></g>' +
    '<g class="leg leg-b1"><rect x="88" y="66" width="10" height="24" rx="5" fill="#C96F33"/></g>' +
    '<g class="leg leg-f1"><rect x="34" y="66" width="10" height="24" rx="5" fill="#C96F33"/></g>' +
    '<ellipse class="body" cx="66" cy="58" rx="42" ry="26" fill="#D98243"/>' +
    '<ellipse cx="54" cy="74" rx="24" ry="11" fill="#FFF6E8"/>' +
    '<g class="leg leg-b2"><rect x="96" y="66" width="10" height="24" rx="5" fill="#D98243"/></g>' +
    '<g class="leg leg-f2"><rect x="46" y="66" width="10" height="24" rx="5" fill="#D98243"/></g>' +
    '<g class="head-g">' +
    '<path d="M8 24 L17 2 L30 16 Z" fill="#C96F33"/><path d="M13 19 L17 8 L23 14 Z" fill="#FCC9A0"/>' +
    '<path d="M32 15 L46 0 L54 18 Z" fill="#C96F33"/><path d="M38 13 L45 6 L49 15 Z" fill="#FCC9A0"/>' +
    '<circle cx="30" cy="36" r="24" fill="#D98243"/>' +
    '<ellipse cx="10" cy="42" rx="9" ry="8" fill="#FFF6E8"/><ellipse cx="50" cy="42" rx="9" ry="8" fill="#FFF6E8"/>' +
    '<ellipse cx="27" cy="46" rx="14" ry="11" fill="#FFF6E8"/>' +
    '<circle cx="15.5" cy="26" r="2" fill="#FFF6E8"/><circle cx="41.5" cy="26" r="2" fill="#FFF6E8"/>' +
    '<g class="eyes-open"><path d="M13 33 q4 -3.6 8 0" stroke="#3A2A18" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M36 33 q4 -3.6 8 0" stroke="#3A2A18" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>' +
    '<g class="eyes-shut" style="display:none"><path d="M13 33 q4 3 8 0 M36 33 q4 3 8 0" stroke="#3A2A18" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>' +
    '<ellipse cx="27" cy="39" rx="4" ry="3" fill="#2A1E14"/>' +
    '<path d="M27 42 q0 3 0 3 M23 46 q4 3.4 8 0" fill="none" stroke="#3A2A18" stroke-width="2" stroke-linecap="round"/>' +
    '</g></svg>';

  /* ── 樣式 ── */
  var css = [
    ".petw{position:fixed;bottom:6px;right:0;z-index:160;user-select:none;-webkit-tap-highlight-color:transparent;",
    "  width:118px;height:96px;will-change:transform;}",
    "@media (max-width:600px){.petw{bottom:calc(var(--tabbar-h,64px) + 6px);}}",
    ".pet-svg{display:block;cursor:pointer;filter:drop-shadow(0 4px 8px rgba(0,0,0,.28));transition:transform .25s ease;}",
    ".petw.face-right .pet-svg{transform:scaleX(-1);}",
    /* 待機呼吸 + 尾巴搖 */
    ".pet-svg .body,.pet-svg .head-g{animation:pet-breath 3.4s ease-in-out infinite;transform-origin:60px 60px;}",
    "@keyframes pet-breath{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6px)}}",
    ".pet-svg .tail-g{transform-origin:110px 62px;animation:tail-swish 2.6s ease-in-out infinite;}",
    "@keyframes tail-swish{0%,100%{transform:rotate(0deg)}50%{transform:rotate(14deg)}}",
    /* 走路：腿擺動＋身體小彈跳 */
    ".petw.walk .leg{animation:leg-a .34s ease-in-out infinite;transform-origin:center 66px;}",
    ".petw.walk .leg-f2,.petw.walk .leg-b1{animation-delay:.17s;}",
    "@keyframes leg-a{0%,100%{transform:rotate(14deg)}50%{transform:rotate(-14deg)}}",
    ".petw.walk .pet-svg{animation:walk-bob .34s ease-in-out infinite;}",
    ".petw.walk.face-right .pet-svg{animation:walk-bob-r .34s ease-in-out infinite;}",
    "@keyframes walk-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}",
    "@keyframes walk-bob-r{0%,100%{transform:translateY(0) scaleX(-1)}50%{transform:translateY(-2.5px) scaleX(-1)}}",
    /* 撲擊 */
    ".petw.pounce .pet-svg{animation:pounce .5s ease;}",
    ".petw.pounce.face-right .pet-svg{animation:pounce-r .5s ease;}",
    "@keyframes pounce{0%{transform:none}35%{transform:translateY(-22px) rotate(-8deg)}70%{transform:translateY(0) scale(1.06,.88)}100%{transform:none}}",
    "@keyframes pounce-r{0%{transform:scaleX(-1)}35%{transform:translateY(-22px) rotate(8deg) scaleX(-1)}70%{transform:translateY(0) scale(-1.06,.88)}100%{transform:scaleX(-1)}}",
    /* 睡覺：趴平＋灰一點 */
    ".petw.sleep .pet-svg{transform:scaleY(.82) translateY(8px);filter:saturate(.6) brightness(.9) drop-shadow(0 4px 8px rgba(0,0,0,.28));}",
    ".petw.sleep .tail-g{animation-duration:6s;}",
    ".petw.sleep .leg{display:none;}",
    /* 泡泡：在貓上方、貼著視窗右緣時自動靠左 */
    ".pet-bub{position:absolute;bottom:92px;right:0;min-width:90px;max-width:230px;width:max-content;",
    "  font:700 .84rem 'LXGW WenKai TC','Nunito',system-ui,sans-serif;line-height:1.65;",
    "  color:#6b5344;background:#fffdf7;border:1.5px solid rgba(130,95,60,.22);border-radius:14px 14px 3px 14px;",
    "  padding:.5rem .8rem;box-shadow:0 4px 14px rgba(120,80,50,.2);",
    "  opacity:0;transform:translateY(6px) scale(.92);transform-origin:bottom right;",
    "  transition:opacity .22s ease,transform .22s ease;pointer-events:none;z-index:161;}",
    ".petw.talk .pet-bub{opacity:1;transform:none;}",
    "[data-theme=dark] .pet-bub{color:#eddcc7;background:#382d22;border-color:rgba(255,255,255,.16);}",
    /* 毛線球 */
    ".pet-ball{position:fixed;bottom:12px;z-index:159;font-size:24px;transition:transform .5s ease;",
    "  animation:ball-roll 1.2s linear infinite;pointer-events:none;}",
    "@keyframes ball-roll{from{rotate:0deg}to{rotate:360deg}}",
    /* 收起鈕 */
    ".pet-x{position:absolute;top:-4px;right:2px;width:20px;height:20px;border-radius:50%;",
    "  border:0;cursor:pointer;font:700 11px/1 sans-serif;color:#fff;background:rgba(90,70,55,.75);",
    "  opacity:0;transition:opacity .2s ease;z-index:162;}",
    ".petw:hover .pet-x{opacity:.9;}",
  ].join("");
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* ── DOM ── */
  var wrap = document.createElement("div");
  wrap.className = "petw";
  wrap.innerHTML = "<div class='pet-bub' id='petBub'></div>" + PET_SVG +
    "<button class='pet-x' id='petX' aria-label='收起小夥伴' title='收起（一週）'>✕</button>";
  var svg = null;
  document.body.appendChild(wrap);
  svg = wrap.querySelector("svg");
  svg.classList.add("pet-svg");
  var bub = document.getElementById("petBub");

  /* ── 聰明台詞 ── */
  var smart = [];
  fetch(RAW).then(function (r) { return r.json(); }).then(function (list) {
    var ok = list.filter(function (c) { return c.status !== "failed" && c.url; });
    var today = new Date();
    var todays = ok.filter(function (c) {
      var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/.exec(c.timestamp || "");
      if (!m) return false;
      var d = new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5]));
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    });
    if (todays.length) smart.push("今天已經誕生 " + todays.length + " 張囉");
    smart.push("目前全部累積 " + ok.length + " 張作品~");
    todays.forEach(function (c) {
      if (c.is_birthday && c.character_name) smart.push("今天是" + c.character_name + "的生日 🎂");
      if (c.crossover) smart.push("今天貓狗畫了同一則新聞，去看『今日同題』");
    });
  }).catch(function () {});
  function pickLine() {
    var pools = [MEOW, TIPS];
    if (smart.length) pools.push(smart, smart);
    var pool = pools[Math.floor(Math.random() * pools.length)];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* ── 狀態機 ── */
  var x = 0;                       // 目前位移（0 = 靠右緣；往左為正）
  var facingRight = false;
  var busy = false, sleeping = false;
  var talkTimer, sleepTimer, loopTimer;
  var railGap = window.matchMedia("(min-width: 1025px)").matches ? 140 : 6; // 桌面避開時間軸
  function bounds() {
    var maxLeft = Math.min(window.innerWidth * 0.5, 520);
    return { min: railGap, max: Math.max(railGap + 40, maxLeft) };
  }
  x = bounds().min;
  apply();
  function apply() { wrap.style.transform = "translateX(" + (-x) + "px)"; }
  function face(right) {
    facingRight = right;
    wrap.classList.toggle("face-right", right);
  }
  function eyes(shut) {
    svg.querySelector(".eyes-open").style.display = shut ? "none" : "";
    svg.querySelector(".eyes-shut").style.display = shut ? "" : "none";
  }

  function walkTo(target, cb) {
    var b = bounds();
    target = Math.max(b.min, Math.min(b.max, target));
    var dist = Math.abs(target - x);
    if (dist < 12) { cb && cb(); return; }
    face(target < x);              // 位移變小 = 視覺往右
    wrap.classList.add("walk");
    var dur = dist / 55;           // 55px/秒
    wrap.style.transition = "transform " + dur + "s linear";
    requestAnimationFrame(function () { x = target; apply(); });
    setTimeout(function () {
      wrap.classList.remove("walk");
      wrap.style.transition = "";
      cb && cb();
    }, dur * 1000 + 60);
  }

  function playBall(cb) {
    var b = bounds();
    var ballX = Math.min(b.max, x + 150 + Math.random() * 80);
    var ball = document.createElement("div");
    ball.className = "pet-ball";
    ball.textContent = "🧶";
    ball.style.right = "0px";
    ball.style.transform = "translateX(" + (-ballX) + "px)";
    document.body.appendChild(ball);
    setTimeout(function () {
      walkTo(ballX - 40, function () {
        wrap.classList.add("pounce");
        say("汪!");
        setTimeout(function () { wrap.classList.remove("pounce"); }, 550);
        var out = Math.min(b.max + 120, ballX + 200);
        ball.style.transition = "transform .9s ease-out, opacity .6s ease .5s";
        ball.style.opacity = "0";
        ball.style.transform = "translateX(" + (-out) + "px)";
        setTimeout(function () { ball.remove(); cb && cb(); }, 1000);
      });
    }, 350);
  }

  function say(text, ms) {
    bub.textContent = text;
    wrap.classList.add("talk");
    clearTimeout(talkTimer);
    talkTimer = setTimeout(function () { wrap.classList.remove("talk"); }, ms || 4200);
  }
  function goSleep() {
    sleeping = true;
    wrap.classList.add("sleep");
    eyes(true);
    say("Zzz… 💤", 3200);
  }
  function wake() {
    if (sleeping) {
      sleeping = false;
      wrap.classList.remove("sleep");
      eyes(false);
      say(WAKE_LINE, 2600);
    }
    resetSleep();
  }
  function resetSleep() {
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(goSleep, 150000);
  }

  /* 行為迴圈：散步 / 玩球 / 眨眼放空 */
  function loop() {
    loopTimer = setTimeout(function () {
      if (!sleeping && !busy && !document.hidden) {
        busy = true;
        var r = Math.random();
        var done = function () { busy = false; face(false); loop(); };
        if (r < 0.42) {
          var b = bounds();
          walkTo(b.min + Math.random() * (b.max - b.min), done);
          return;
        } else if (r < 0.58) {
          playBall(done);
          return;
        } else if (r < 0.72) {
          eyes(true);
          setTimeout(function () { if (!sleeping) eyes(false); busy = false; loop(); }, 900);
          return;
        }
        busy = false;
      }
      loop();
    }, 9000 + Math.random() * 14000);
  }

  svg.addEventListener("click", function () {
    wake();
    wrap.classList.remove("pounce");
    void wrap.offsetWidth;
    wrap.classList.add("pounce");
    setTimeout(function () { wrap.classList.remove("pounce"); }, 550);
    say(pickLine());
  });
  document.getElementById("petX").addEventListener("click", function (e) {
    e.stopPropagation();
    localStorage.setItem("pet-off", String(Date.now()));
    clearTimeout(loopTimer); clearTimeout(sleepTimer);
    wrap.remove();
  });
  ["scroll", "mousemove", "touchstart"].forEach(function (ev) {
    var throttled = false;
    window.addEventListener(ev, function () {
      if (throttled) return;
      throttled = true;
      setTimeout(function () { throttled = false; }, 3000);
      if (sleeping) wake(); else resetSleep();
    }, { passive: true });
  });

  setTimeout(function () { say(HELLO, 3600); }, 1500);
  var quip = function () {
    setTimeout(function () {
      if (!sleeping && !document.hidden && !busy) say(pickLine());
      quip();
    }, 50000 + Math.random() * 50000);
  };
  quip();
  resetSleep();
  loop();
})();
