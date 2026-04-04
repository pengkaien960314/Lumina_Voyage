# Lumina Voyage

> 讓旅行成為生命的詩篇

Lumina Voyage 是一站式智慧旅行平台，整合景點瀏覽、AI 行程規劃、旅館預訂、機票查詢、旅遊日記、即時翻譯、匯率換算、天氣預報與地圖導航等功能。

## Features

- **景點瀏覽** — 25+ 精選景點，分類篩選與搜尋
- **AI 行程規劃** — Gemini AI 自動生成多日行程，手動編輯活動
- **旅館預訂** — 15+ 旅館，價格篩選、詳情瀏覽與預訂
- **旅遊日記** — 發布圖文日記，按讚與留言社群互動
- **即時翻譯** — 支援 16 種語言，AI 翻譯 + 對話模式 + 旅行用語
- **匯率換算** — 18 種貨幣即時匯率
- **天氣預報** — 全球城市即時天氣與未來預報
- **地圖導航** — Google Maps 路線規劃（開車 / 步行 / 大眾運輸）
- **會員系統** — 登入 / 註冊 / 社群登入 / 個人檔案管理

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS 4, Radix UI, Framer Motion |
| Routing | Wouter |
| Server | Express + Helmet + CORS + Rate Limiting |
| AI | Google Gemini API |
| Maps | Google Maps via Frontend Forge |
| Package Manager | pnpm |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend Forge API key for Google Maps | Yes |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend Forge API URL | No (has default) |
| `PORT` | Server port (default: 3000) | No |

### Development

```bash
pnpm run dev
```

Opens the dev server at `http://localhost:5000`.

### Production Build

```bash
pnpm run build
pnpm start
```

Builds the frontend to `dist/public/` and starts the Express server on port 3000.

## Project Structure

```
lumina-voyage/
├── client/              # React frontend
│   ├── index.html       # HTML entry point with full meta tags
│   ├── public/          # Static assets (favicon, images)
│   └── src/
│       ├── components/  # Reusable UI components (shadcn/ui)
│       ├── contexts/    # React contexts (Auth, Booking, Friends)
│       ├── hooks/       # Custom hooks
│       ├── lib/         # Utilities
│       └── pages/       # Route pages
├── server/              # Express server
│   └── index.ts         # Server with Helmet, CORS, rate-limit
├── shared/              # Shared types/constants
├── .env.example         # Environment variable template
├── vite.config.ts       # Vite configuration
└── package.json
```

## Deployment

### Replit (Recommended)

The project is configured for Replit static deployment:

- **Build**: `pnpm run build`
- **Output**: `dist/public/`
- **Type**: Static site deployment

### Other Platforms

Build and serve the `dist/public/` directory as a static site, or run the Express server for SPA routing support:

```bash
pnpm run build
NODE_ENV=production node dist/index.js
```

## License

MIT
