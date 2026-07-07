/* 時光小夥伴：右下角桌寵（麻吉）。
   純 CSS/JS 零依賴：呼吸晃動、點擊蹦跳＋聰明對話泡泡（今日張數/生日/同題提示）、
   閒置入睡、X 關閉記憶 7 天。tv.html 不載入。 */
(function () {
  "use strict";
  if (localStorage.getItem("pet-off") && Date.now() - (+localStorage.getItem("pet-off")) < 7 * 86400 * 1000) return;

  var AVATAR = "avatars/machi.webp";
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

  /* ── 樣式 ── */
  var css = [
    ".pet-wrap{position:fixed;right:14px;bottom:14px;z-index:150;user-select:none;-webkit-tap-highlight-color:transparent;}",
    "@media (max-width:600px){.pet-wrap{bottom:calc(var(--tabbar-h,64px) + 12px);right:10px;}}",
    ".pet-face{width:74px;height:74px;border-radius:50%;cursor:pointer;display:block;",
    "  border:3px solid #fff;box-shadow:0 5px 16px rgba(0,0,0,.22);object-fit:cover;",
    "  animation:pet-bob 3.2s ease-in-out infinite;transition:transform .18s ease,filter .4s ease;}",
    ".pet-face:hover{transform:scale(1.08) rotate(-4deg);}",
    "@keyframes pet-bob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-4px) rotate(1.6deg)}}",
    ".pet-wrap.jump .pet-face{animation:pet-jump .55s ease;}",
    "@keyframes pet-jump{0%{transform:translateY(0) scale(1)}30%{transform:translateY(-20px) scale(1.06) rotate(-6deg)}60%{transform:translateY(0) scale(.94,.9)}80%{transform:translateY(-6px) scale(1.02)}100%{transform:translateY(0) scale(1)}}",
    ".pet-wrap.sleep .pet-face{animation:pet-sleep-bob 5.5s ease-in-out infinite;filter:saturate(.55) brightness(.9);}",
    "@keyframes pet-sleep-bob{0%,100%{transform:translateY(0) rotate(6deg)}50%{transform:translateY(-2px) rotate(6deg)}}",
    ".pet-bubble{position:absolute;right:64px;bottom:58px;max-width:200px;",
    "  font:700 .82rem 'LXGW WenKai TC','Nunito',system-ui,sans-serif;line-height:1.6;",
    "  color:#6b5344;background:#fffdf7;border:1.5px solid rgba(130,95,60,.2);border-radius:14px 14px 3px 14px;",
    "  padding:.5rem .75rem;box-shadow:0 4px 14px rgba(120,80,50,.18);",
    "  opacity:0;transform:translateY(6px) scale(.9);transform-origin:bottom right;",
    "  transition:opacity .22s ease,transform .22s ease;pointer-events:none;white-space:normal;}",
    ".pet-wrap.talk .pet-bubble{opacity:1;transform:none;}",
    ".pet-x{position:absolute;top:-7px;right:-4px;width:20px;height:20px;border-radius:50%;",
    "  border:0;cursor:pointer;font:700 11px/1 sans-serif;color:#fff;background:rgba(90,70,55,.75);",
    "  opacity:0;transition:opacity .2s ease;}",
    ".pet-wrap:hover .pet-x{opacity:.9;}",
    "[data-theme=dark] .pet-bubble{color:#eddcc7;background:#382d22;border-color:rgba(255,255,255,.14);}",
  ].join("");
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* ── DOM ── */
  var wrap = document.createElement("div");
  wrap.className = "pet-wrap";
  wrap.innerHTML =
    "<div class='pet-bubble' id='petBubble'></div>" +
    "<img class='pet-face' id='petFace' src='" + AVATAR + "' alt='" + NAME + "' title='" + NAME + "'>" +
    "<button class='pet-x' id='petX' aria-label='收起小夥伴' title='收起（一週）'>✕</button>";
  document.body.appendChild(wrap);
  var bubble = document.getElementById("petBubble");

  /* ── 聰明台詞（吃現成資料） ── */
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
      if (c.crossover) smart.push("今天貓狗畫了同一則新聞，快去看『今日同題』");
    });
  }).catch(function () {});

  function pickLine() {
    var pools = [MEOW, TIPS];
    if (smart.length) pools.push(smart, smart);   // 聰明台詞加權
    var pool = pools[Math.floor(Math.random() * pools.length)];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  var talkTimer = null, sleepTimer = null, quipTimer = null;
  function say(text, ms) {
    bubble.textContent = text;
    wrap.classList.add("talk");
    clearTimeout(talkTimer);
    talkTimer = setTimeout(function () { wrap.classList.remove("talk"); }, ms || 4200);
  }
  function jump() {
    wrap.classList.remove("jump");
    void wrap.offsetWidth;   // restart animation
    wrap.classList.add("jump");
  }
  function goSleep() { wrap.classList.add("sleep"); say("Zzz… 💤", 3200); }
  function wake() {
    if (wrap.classList.contains("sleep")) { wrap.classList.remove("sleep"); say("汪!? 我沒有在睡", 2600); }
    resetSleep();
  }
  function resetSleep() {
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(goSleep, 150000);   // 2.5 分鐘沒動靜就睡
  }

  document.getElementById("petFace").addEventListener("click", function () {
    wake(); jump(); say(pickLine());
  });
  document.getElementById("petX").addEventListener("click", function (e) {
    e.stopPropagation();
    localStorage.setItem("pet-off", String(Date.now()));
    wrap.remove();
  });
  ["scroll", "mousemove", "touchstart"].forEach(function (ev) {
    var throttled = false;
    window.addEventListener(ev, function () {
      if (throttled) return;
      throttled = true;
      setTimeout(function () { throttled = false; }, 3000);
      if (wrap.classList.contains("sleep")) wake(); else resetSleep();
    }, { passive: true });
  });

  /* 開場招呼＋不定時碎念 */
  setTimeout(function () { say("嗨~ 我是" + NAME + " 🐾", 3600); }, 1600);
  function quipLoop() {
    quipTimer = setTimeout(function () {
      if (!wrap.classList.contains("sleep") && !document.hidden) say(pickLine());
      quipLoop();
    }, 45000 + Math.random() * 50000);
  }
  quipLoop();
  resetSleep();
})();
