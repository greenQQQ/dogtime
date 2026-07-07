/* 首頁加料：今日頭條 + 今日時光牆 + 貓狗同題對比。
   全部吃現成資料（catlist / 月度明細 / 姊妹站 catlist），載入失敗就整段隱藏。 */
(function () {
  "use strict";
  var OWNER = "greenQQQ/dogtime";
  var SISTER_OWNER = "greenQQQ/catime";
  var SISTER_NAME = "貓咪時光";
  var SISTER_URL = "https://greenqqq.github.io/catime/";
  var SELF_EMOJI = "🐶", SISTER_EMOJI = "🐱";
  var RAW = "https://raw.githubusercontent.com/" + OWNER + "/main/";
  var SISTER_RAW = "https://raw.githubusercontent.com/" + SISTER_OWNER + "/main/";

  function parseTs(ts) {
    var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/.exec(ts || "");
    if (!m) return null;
    return new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5]));
  }
  function sameLocalDay(d, ref) {
    return d && d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
  }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  fetch(RAW + "catlist.json").then(function (r) { return r.json(); }).then(function (list) {
    var ok = list.filter(function (c) { return c.status !== "failed" && c.url; });
    if (!ok.length) return;
    var today = new Date();
    var todays = ok.filter(function (c) { return sameLocalDay(parseTs(c.timestamp), today); });

    buildClockWall(ok, todays, today);
    buildHeadline(ok, todays);
    buildCrossover(ok);
  }).catch(function () {});

  /* ── ⏰ 今日時光牆：24 小時格，走完一圈就是一天。
        今天缺席的過去小時 → 用「最近某天同一小時」的作品回顧填充（調暗＋標日期），
        牆永遠是滿的，又不假裝是今天生的。 ── */
  function buildClockWall(ok, todays, today) {
    var host = document.getElementById("clock-wall");
    if (!host) return;
    var byHour = {};
    todays.forEach(function (c) {
      var d = parseTs(c.timestamp);
      if (d) byHour[d.getHours()] = c;   // 本地時區小時
    });
    // 回顧池：由新到舊，找每個小時「非今天」的最近一張
    var pastByHour = {};
    var filledCount = 0;
    for (var i = ok.length - 1; i >= 0 && filledCount < 24; i--) {
      var d0 = parseTs(ok[i].timestamp);
      if (!d0 || sameLocalDay(d0, today)) continue;
      var hh = d0.getHours();
      if (!(hh in pastByHour)) { pastByHour[hh] = ok[i]; filledCount++; }
    }
    var nowH = today.getHours();
    var frag = document.createDocumentFragment();
    for (var h = 0; h < 24; h++) {
      var todayCat = byHour[h];
      var pastCat = !todayCat && h <= nowH ? pastByHour[h] : null;
      var dog = todayCat || pastCat;
      var cell = document.createElement(dog ? "a" : "div");
      cell.className = "cw-cell" + (h === nowH ? " now" : "") +
        (todayCat ? " filled" : "") + (pastCat ? " filled past" : "");
      var label = "<span class='cw-h'>" + (h < 10 ? "0" + h : h) + "</span>";
      if (dog) {
        cell.href = "#";
        cell.title = "#" + dog.number + (dog.title ? " " + dog.title : "");
        var badge = "";
        if (pastCat) {
          var pd = parseTs(pastCat.timestamp);
          var dateTag = pd ? (pd.getMonth() + 1) + "/" + pd.getDate() : "";
          badge = "<span class='cw-past'>回顧 " + dateTag + "</span>";
          cell.title = "這小時今天休息，回顧 " + dateTag + " 的 " + cell.title;
        }
        cell.innerHTML = label + "<img loading='lazy' src='" + dog.url + "' alt='" + esc(cell.title) + "'>" + badge;
        (function (c2) {
          cell.addEventListener("click", function (e) {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent("open-dog-lightbox", { detail: c2 }));
          });
        })(dog);
      } else {
        cell.innerHTML = label + "<span class='cw-zzz'>💤</span>";
        cell.title = h <= nowH ? "這個小時休息了" : "還沒到";
      }
      frag.appendChild(cell);
    }
    host.appendChild(frag);
    host.parentElement.classList.remove("hidden");
  }

  /* ── 📰 今日頭條：挑今天最有故事的一張，配完整小故事 ── */
  function buildHeadline(ok, todays) {
    var host = document.getElementById("headline");
    if (!host) return;
    var pool = todays.length ? todays : ok.slice(-24);
    var pick = null;
    for (var i = pool.length - 1; i >= 0; i--) {   // 從最新往回找：優先聯動、再新聞靈感
      var c = pool[i];
      if (c.crossover) { pick = c; break; }
      if (!pick && c.inspiration && c.inspiration !== "original") pick = c;
    }
    if (!pick) pick = pool[pool.length - 1];
    if (!pick) return;

    var month = (pick.timestamp || "").slice(0, 7);
    fetch(RAW + "cats/" + month + ".json")
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (details) {
        var d = (details || []).filter(function (x) { return x.number === pick.number; })[0] || {};
        var story = d.story || "";
        var isNews = pick.inspiration && pick.inspiration !== "original";
        var srcUrl = pick.inspiration_url || d.inspiration_url;
        host.innerHTML =
          "<span class='hl-ribbon'>📰 今日頭條</span>" +
          "<div class='hl-inner'>" +
          "<a class='hl-img' href='#'><img src='" + pick.url + "' alt='" + esc(pick.title || "") + "'></a>" +
          "<div class='hl-body'>" +
          "<div class='hl-title'>#" + pick.number + (pick.title ? "　" + esc(pick.title) : "") + "</div>" +
          "<div class='hl-meta'>" + esc(pick.timestamp || "") + (pick.character_name ? " · 主演 " + esc(pick.character_name) : "") + "</div>" +
          (story ? "<p class='hl-story'>" + esc(story) + "</p>" : "") +
          (isNews ? "<p class='hl-src'>靈感：" + esc(pick.inspiration) +
            (srcUrl ? " <a href='" + srcUrl + "' target='_blank' rel='noopener'>看新聞 ↗</a>" : "") + "</p>" : "") +
          "</div></div>";
        host.querySelector(".hl-img").addEventListener("click", function (e) {
          e.preventDefault();
          document.dispatchEvent(new CustomEvent("open-dog-lightbox", { detail: pick }));
        });
        host.classList.remove("hidden");
      });
  }

  /* ── 🐾 今日同題：貓狗吃同一則新聞的對比（有 crossover 資料才顯示） ── */
  function buildCrossover(ok) {
    var host = document.getElementById("crossover");
    if (!host) return;
    var mine = null;
    for (var i = ok.length - 1; i >= 0; i--) { if (ok[i].crossover) { mine = ok[i]; break; } }
    if (!mine) return;
    var myDay = (mine.timestamp || "").slice(0, 10);

    fetch(SISTER_RAW + "catlist.json")
      .then(function (r) { return r.json(); })
      .catch(function () { return []; })
      .then(function (slist) {
        var theirs = null;
        for (var i = slist.length - 1; i >= 0; i--) {
          var c = slist[i];
          if (c.crossover && c.status !== "failed" && (c.timestamp || "").slice(0, 10) === myDay) { theirs = c; break; }
        }
        var half = function (dog, emoji, external) {
          if (!dog) return "<div class='xo-half xo-wait'><span>" + emoji + "</span><p>另一半還在畫…</p></div>";
          var img = "<img loading='lazy' src='" + dog.url + "' alt='" + esc(dog.title || "") + "'>";
          var cap = "<div class='xo-cap'>" + emoji + " #" + dog.number + (dog.title ? " " + esc(dog.title) : "") + "</div>";
          if (external) return "<a class='xo-half' href='" + SISTER_URL + "' target='_blank' rel='noopener'>" + img + cap + "</a>";
          return "<div class='xo-half xo-mine'>" + img + cap + "</div>";
        };
        host.innerHTML =
          "<div class='xo-head'>🐾 今日同題　<span class='xo-sub'>同一則新聞，兩種反應</span></div>" +
          (mine.inspiration && mine.inspiration !== "original"
            ? "<p class='xo-news'>📰 " + esc(mine.inspiration) +
              (mine.inspiration_url ? " <a href='" + mine.inspiration_url + "' target='_blank' rel='noopener'>出處 ↗</a>" : "") + "</p>"
            : "") +
          "<div class='xo-pair'>" + half(mine, SELF_EMOJI, false) + half(theirs, SISTER_EMOJI, true) + "</div>";
        var mineEl = host.querySelector(".xo-mine");
        if (mineEl) mineEl.addEventListener("click", function () {
          document.dispatchEvent(new CustomEvent("open-dog-lightbox", { detail: mine }));
        });
        host.classList.remove("hidden");
      });
  }
})();
