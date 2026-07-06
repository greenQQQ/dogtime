# <img src="docs/icon-192.png" width="32" height="32" alt="狗狗時光 icon"> 狗狗時光

**每小時誕生一隻 AI 狗狗！** 🐶 由麻吉、布丁和朋友們主演的自動狗狗相簿。

每小時自動生成一張獨特的狗狗圖片：從當日新聞找靈感、由 AI 構思場景與小故事、再用 **gpt-image-2**（透過自架 [codex-image-service](https://github.com/yazelin/codex-image-service)，走 ChatGPT 訂閱額度）畫出來，上傳到 GitHub Release 並更新相簿。103+ 種藝術風格，每隻狗都有自己的故事，新聞靈感的狗還能點回新聞出處。

- 🌐 **相簿：** [greenqqq.github.io/dogtime](https://greenqqq.github.io/dogtime/)
- 🐱 **姊妹站：** [貓咪時光](https://greenqqq.github.io/catime/)
- 📘 **Facebook：** [lphotoimpact](https://www.facebook.com/lphotoimpact/)
- 🐙 **GitHub：** [greenQQQ](https://github.com/greenQQQ)

## 贊助

喜歡狗狗時光的話，歡迎 [🧋 請我喝珍奶](https://greenqqq.bobaboba.me/)！

## 常駐角色

- **麻吉（Machi）** — 傲嬌赤柴犬，臉頰兩團麻糬毛，尾巴捲成完美圈圈
- **布丁（Pudding）** — 電臀柯基，堅信自己是大型犬（腿在路上弄丟了一截）
- **拿鐵（Latte）** — 紅貴賓小公主，泰迪頭比誰都圓
- **阿金（A-gin）** — 黃金獵犬大暖男，見人就要叼禮物
- **小嗚（Wuwu）** — 哈士奇戲精，夢想是拆掉全世界（目前進度：一顆抱枕未遂）

角色圖鑑：[greenqqq.github.io/dogtime/character.html](https://greenqqq.github.io/dogtime/character.html)

## 運作原理

與[貓咪時光](https://github.com/greenQQQ/catime)相同：gpt-image-2 生圖（本機 codex-image-service，ChatGPT 訂閱額度）、Gemini 文字構思（新聞附來源連結）、GitHub Release 存圖、本機排程每小時執行。

## 致謝

本專案基於 [**yazelin/catime**](https://github.com/yazelin/catime) 改造而成。由衷感謝原作者 [@yazelin](https://github.com/yazelin) 的無私開源分享 ❤️

## 授權

MIT License（沿用原專案授權，見 [LICENSE](LICENSE)）
