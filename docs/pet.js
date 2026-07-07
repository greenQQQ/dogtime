/* 時光小夥伴 v3：Q 版貼紙桌寵（麻吉）。
   原地待機（呼吸浮動）、可拖曳到任何位置（記住）、點擊蹦跳＋聰明泡泡、
   閒置入睡換睡姿貼紙、✕ 收起記憶 7 天。不亂走、不擋路。 */
(function () {
  "use strict";
  if (localStorage.getItem("pet-off") && Date.now() - (+localStorage.getItem("pet-off")) < 7 * 86400 * 1000) return;

  var NAME = "麻吉";
  var IMG_SIT = "pet-sit.png?v=3";
  var IMG_SLEEP = "pet-sleep.png?v=3";
  var RAW = "https://raw.githubusercontent.com/green麻吉/catime/main/catlist.json";
  var MEOW = ["汪!", "嗚嗚~", "汪汪?"];
  var TIPS = [
    "點上面的『猜靈感』來玩一局?",
    "時光牆一格一小時，走完就是一天",
    "電視牆可以放客廳當電子相框喔",
    "去時光小鎮看看大家的關係~",
    "每小時都有新朋友誕生",
    "抓住我可以搬家喔~",
  ];
  var WAKE_LINE = "汪!? 我沒有在睡";
  var HELLO = "嗨~ 我是" + NAME + " 🐾";

  var css = [
    ".petw{position:fixed;z-index:160;width:96px;user-select:none;touch-action:none;-webkit-tap-highlight-color:transparent;}",
    ".pet-img{display:block;width:96px;cursor:grab;filter:drop-shadow(0 5px 10px rgba(0,0,0,.30));",
    "  animation:pet-bob 3.4s ease-in-out infinite;transition:filter .4s ease;}",
    ".petw.drag .pet-img{cursor:grabbing;animation:none;transform:scale(1.06) rotate(-3deg);}",
    "@keyframes pet-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}",
    ".petw.jump .pet-img{animation:pet-jump .55s ease;}",
    "@keyframes pet-jump{0%{transform:translateY(0)}30%{transform:translateY(-24px) rotate(-5deg)}60%{transform:translateY(0) scale(1.05,.9)}80%{transform:translateY(-7px)}100%{transform:translateY(0)}}",
    ".petw.sleep .pet-img{animation:pet-sleep 6s ease-in-out infinite;filter:saturate(.65) brightness(.92) drop-shadow(0 5px 10px rgba(0,0,0,.30));}",
    "@keyframes pet-sleep{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-1.5px) scale(1.015)}}",
    ".pet-bub{position:absolute;bottom:calc(100% + 8px);right:0;min-width:80px;max-width:230px;width:max-content;",
    "  font:700 .84rem 'LXGW WenKai TC','Nunito',system-ui,sans-serif;line-height:1.65;",
    "  color:#6b5344;background:#fffdf7;border:1.5px solid rgba(130,95,60,.22);border-radius:14px 14px 3px 14px;",
    "  padding:.5rem .8rem;box-shadow:0 4px 14px rgba(120,80,50,.2);",
    "  opacity:0;transform:translateY(6px) scale(.92);transform-origin:bottom right;",
    "  transition:opacity .22s ease,transform .22s ease;pointer-events:none;z-index:161;}",
    ".petw.b-left .pet-bub{right:auto;left:0;border-radius:14px 14px 14px 3px;transform-origin:bottom left;}",
    ".petw.b-below .pet-bub{bottom:auto;top:calc(100% + 8px);border-radius:3px 14px 14px 14px;transform-origin:top right;}",
    ".petw.b-below.b-left .pet-bub{border-radius:14px 3px 14px 14px;transform-origin:top left;}",
    ".petw.talk .pet-bub{opacity:1;transform:none;}",
    "[data-theme=dark] .pet-bub{color:#eddcc7;background:#382d22;border-color:rgba(255,255,255,.16);}",
    ".pet-x{position:absolute;top:-8px;right:-6px;width:20px;height:20px;border-radius:50%;",
    "  border:0;cursor:pointer;font:700 11px/1 sans-serif;color:#fff;background:rgba(90,70,55,.78);",
    "  opacity:0;transition:opacity .2s ease;z-index:162;}",
    ".petw:hover .pet-x{opacity:.92;}",
  ].join("");
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var wrap = document.createElement("div");
  wrap.className = "petw";
  wrap.innerHTML =
    "<div class='pet-bub' id='petBub'></div>" +
    "<img class='pet-img' id='petImg' src='" + IMG_SIT + "' alt='" + NAME + "' title='" + NAME + "（可以拖我）' draggable='false'>" +
    "<button class='pet-x' id='petX' aria-label='收起小夥伴' title='收起（一週）'>✕</button>";
  document.body.appendChild(wrap);
  var img = document.getElementById("petImg");
  var bub = document.getElementById("petBub");
  // 貼紙還沒部署（404）→ 整隻先隱身，不留破圖
  img.addEventListener("error", function () { wrap.remove(); });

  /* ── 位置：預設右下角；拖過會記住（存視窗比例，換裝置也合理） ── */
  function defaultPos() {
    var mobile = window.matchMedia("(max-width: 600px)").matches;
    var bottomGap = mobile ? 84 : 16;
    return { x: window.innerWidth - 96 - 14, y: window.innerHeight - 100 - bottomGap };
  }
  function clamp(p) {
    p.x = Math.max(2, Math.min(window.innerWidth - 98, p.x));
    p.y = Math.max(2, Math.min(window.innerHeight - 102, p.y));
    return p;
  }
  function loadPos() {
    try {
      var s = JSON.parse(localStorage.getItem("pet-pos") || "null");
      if (s && typeof s.rx === "number") {
        return clamp({ x: s.rx * window.innerWidth, y: s.ry * window.innerHeight });
      }
    } catch (e) {}
    return clamp(defaultPos());
  }
  var pos = loadPos();
  function apply() {
    wrap.style.left = pos.x + "px";
    wrap.style.top = pos.y + "px";
    // 泡泡翻邊：貼近上緣→往下開；貼近左緣→往右開
    wrap.classList.toggle("b-below", pos.y < 150);
    wrap.classList.toggle("b-left", pos.x < 250);
  }
  apply();
  window.addEventListener("resize", function () { pos = clamp(pos); apply(); });

  /* ── 拖曳（pointer events；拖動後不觸發點擊） ── */
  var dragging = false, moved = false, offX = 0, offY = 0;
  img.addEventListener("pointerdown", function (e) {
    dragging = true; moved = false;
    offX = e.clientX - pos.x; offY = e.clientY - pos.y;
    img.setPointerCapture(e.pointerId);
    wrap.classList.add("drag");
    e.preventDefault();
  });
  img.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var nx = e.clientX - offX, ny = e.clientY - offY;
    if (!moved && Math.abs(nx - pos.x) + Math.abs(ny - pos.y) > 6) moved = true;
    if (moved) { pos = clamp({ x: nx, y: ny }); apply(); }
  });
  img.addEventListener("pointerup", function (e) {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove("drag");
    img.releasePointerCapture(e.pointerId);
    if (moved) {
      localStorage.setItem("pet-pos", JSON.stringify({ rx: pos.x / window.innerWidth, ry: pos.y / window.innerHeight }));
      wake();
      say("這裡視野不錯~", 2400);
    } else {
      poke();
    }
  });

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

  /* ── 說話 / 睡覺 / 蹦跳 ── */
  var talkTimer, sleepTimer;
  var sleeping = false;
  function say(text, ms) {
    bub.textContent = text;
    wrap.classList.add("talk");
    clearTimeout(talkTimer);
    talkTimer = setTimeout(function () { wrap.classList.remove("talk"); }, ms || 4200);
  }
  function goSleep() {
    sleeping = true;
    wrap.classList.add("sleep");
    img.src = IMG_SLEEP;
    say("Zzz… 💤", 3200);
  }
  function wake() {
    if (sleeping) {
      sleeping = false;
      wrap.classList.remove("sleep");
      img.src = IMG_SIT;
      say(WAKE_LINE, 2600);
    }
    resetSleep();
  }
  function resetSleep() {
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(goSleep, 150000);
  }
  function poke() {
    var wasSleeping = sleeping;
    wake();
    if (wasSleeping) return;
    wrap.classList.remove("jump");
    void wrap.offsetWidth;
    wrap.classList.add("jump");
    setTimeout(function () { wrap.classList.remove("jump"); }, 560);
    say(pickLine());
  }

  document.getElementById("petX").addEventListener("click", function (e) {
    e.stopPropagation();
    localStorage.setItem("pet-off", String(Date.now()));
    clearTimeout(sleepTimer); clearTimeout(talkTimer);
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
  (function quip() {
    setTimeout(function () {
      if (!sleeping && !document.hidden && !dragging) say(pickLine());
      quip();
    }, 50000 + Math.random() * 50000);
  })();
  resetSleep();
})();
