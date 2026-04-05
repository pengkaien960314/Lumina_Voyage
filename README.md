# 🌟 Lumina Voyage

一款以旅行為核心的全端 Web App，支援景點瀏覽、行程規劃、旅館與機票預訂、AI 行程生成、多語言翻譯、旅遊日記等功能。目標是打包成手機 App（Android / iOS）。

-----

## 📱 功能總覽

- 🗺️ **景點瀏覽** — 精選全球景點，含評分、票價、交通資訊
- 📅 **行程規劃** — 拖拉式行程編輯器
- 🤖 **AI 行程生成** — 使用 Google Gemini 自動產生旅遊行程
- 🌐 **AI 翻譯** — 多語言即時翻譯，支援旅遊常用語句
- 🏨 **旅館預訂** — 模擬預訂流程，含評價與設施資訊
- ✈️ **機票查詢** — 模擬比價與訂票
- 📖 **旅遊日記** — 記錄旅途回憶
- 👥 **好友系統** — 邀請好友、共享行程
- 🏆 **里程碑** — 旅遊成就系統
- 🌙 **深色模式** — 支援明暗主題切換
- 🗣️ **多語言** — 繁中、簡中、英、日、韓、泰、越

-----

## 🛠️ 技術架構

|層級   |技術                   |
|-----|---------------------|
|前端框架 |React 19 + TypeScript|
|路由   |Wouter               |
|樣式   |Tailwind CSS v4      |
|UI 元件|Radix UI + shadcn/ui |
|動畫   |Framer Motion        |
|後端   |Express.js           |
|建構工具 |Vite 7               |
|套件管理 |pnpm                 |
|AI   |Google Gemini API    |

-----

## 🚀 本機開發

### 前置需求

- Node.js 20+
- pnpm 10+

### 安裝與啟動

```bash
# 1. Clone 專案
git clone https://github.com/pengkaien960314/Lumina_Voyage.git
cd Lumina_Voyage

# 2. 安裝套件
pnpm install

# 3. 設定環境變數（複製範本）
cp .env.example .env
# 填入你的 API Key

# 4. 啟動開發伺服器
pnpm dev
```

開啟瀏覽器：`http://localhost:5000`

-----

## 🔧 環境變數

在根目錄建立 `.env` 檔案（不可 commit 進 git）：

```env
VITE_GEMINI_API_KEY=你的_Google_Gemini_API_Key
```

### 如何取得 Gemini API Key

1. 前往 [Google AI Studio](https://aistudio.google.com)
1. 點選 **Get API Key**
1. 建立新的 API Key
1. 填入 `.env` 檔案

-----

## 📦 部署

### 建構 Production 版本

```bash
pnpm build
pnpm start
```

### Replit 部署

專案已設定 `.replit`，直接在 Replit 開啟即可運行。

### 環境變數（部署時）

部署到任何平台時，需設定以下環境變數：

|變數名稱                 |說明                  |
|---------------------|--------------------|
|`VITE_GEMINI_API_KEY`|Google Gemini API 金鑰|

-----

## 📱 手機 App 開發計畫

### 目前階段

- [x] Web App 核心功能完成
- [x] 手機版底部 Tab Bar
- [x] Safe Area 支援（iPhone / Android）
- [ ] PWA 設定（離線支援）
- [ ] Capacitor Android 打包
- [ ] iOS 版本（需要 Mac + Xcode）

### 即將加入

- 推播通知
- 生物辨識登入
- 離線模式
- App icon / Splash screen

-----

## 📁 專案結構

```
Lumina_Voyage/
├── client/               # 前端 React App
│   └── src/
│       ├── components/   # 共用元件（Navbar、BottomNav 等）
│       ├── contexts/     # React Context（Auth、Booking、Friend 等）
│       ├── pages/        # 頁面元件
│       ├── hooks/        # 自訂 Hooks
│       └── lib/          # 工具函式
├── server/               # Express 後端
│   └── index.ts
├── shared/               # 前後端共用型別
├── .env.example          # 環境變數範本
└── package.json
```

-----

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request。

-----

## 📄 授權

MIT License
