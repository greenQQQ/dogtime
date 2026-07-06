# <img src="docs/icon-192.png" width="32" height="32" alt="貓咪時光 icon"> 貓咪時光

**每小時誕生一隻 AI 貓咪！** 🐱 由 QQQ、布藍里和朋友們主演的自動貓咪相簿。

每小時自動生成一張獨特的貓咪圖片：從當日新聞找靈感、由 AI 構思場景與小故事、再用 **gpt-image-2**（透過自架 [codex-image-service](https://github.com/yazelin/codex-image-service)，走 ChatGPT 訂閱額度）畫出來，上傳到 GitHub Release 並更新相簿。103+ 種藝術風格——從浮世繪到賽博龐克。每隻貓都有自己的故事，新聞靈感的貓還能點回新聞出處。

- 🌐 **相簿：** [greenqqq.github.io/catime](https://greenqqq.github.io/catime/)
- 📘 **Facebook：** [lphotoimpact](https://www.facebook.com/lphotoimpact/)
- 🐙 **GitHub：** [greenQQQ](https://github.com/greenQQQ)

> 📖 Other languages: [English](README.en.md)

## 贊助

喜歡貓咪時光的話，歡迎 [🧋 請我喝珍奶](https://greenqqq.bobaboba.me/)！

## 常駐角色

相簿裡有固定出場的貓咪角色，各有外型與個性：

- **QQQ** — 圓滾滾的橘貓，貪吃憨厚，聽到罐頭聲移動速度超越物理極限（本喵真實存在）
- **布藍里（Blanli）** — 翠綠眼睛的虎斑貓，高冷觀察家，溫柔藏在細節裡（本喵真實存在）
- **雪球（Snowball）** — 藍寶石眼睛的布偶貓，貓咪咖啡廳的人氣小公主
- **奧利奧（Oreo）** — 穿燕尾服的賓士貓，巷子裡最有名的紳士搗蛋鬼
- **花花（Huahua）** — 據說會帶來好運的三花貓，哪裡熱鬧去哪裡

角色圖鑑：[greenqqq.github.io/catime/character.html](https://greenqqq.github.io/catime/character.html)

## 運作原理

| 元件 | 說明 |
|------|------|
| **圖片生成** | `gpt-image-2`，透過本機 [codex-image-service](https://github.com/yazelin/codex-image-service)（Codex CLI + FastAPI），使用 ChatGPT 訂閱額度（`CAT_IMAGE_FALLBACK=none`，不退回 Gemini 生圖） |
| **文字構思** | Google Gemini（新聞搜尋 + 靈感 + prompt 撰寫），新聞附來源連結 |
| **圖片存放** | GitHub Release assets |
| **月度相簿** | GitHub issue（自動建立） |
| **元資料** | repo 中的 `catlist.json` 與 `cats/*.json` |
| **網頁相簿** | [GitHub Pages](https://greenqqq.github.io/catime/) 瀑布流排版 |
| **排程** | 本機 Windows 工作排程器每小時執行（`scripts/generate_cat.py`） |

## 致謝

本專案基於 [**yazelin/catime**](https://github.com/yazelin/catime) 改造而成，包括整體架構、生成管線、網頁相簿與 [codex-image-service](https://github.com/yazelin/codex-image-service)。由衷感謝原作者 [@yazelin](https://github.com/yazelin) 的無私開源分享 ❤️

## 授權

MIT License（沿用原專案授權，見 [LICENSE](LICENSE)）
