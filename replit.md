# Wanderlust Travel (Lumina Voyage)

A travel platform built with React 19 + TypeScript + Vite, featuring flight/hotel bookings, trip planning (including AI-assisted), a travel diary, social features, and translation tools. The UI is in Traditional Chinese.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion, Wouter (routing)
- **Build Tool**: Vite 7
- **Package Manager**: pnpm
- **Server**: Express (static file server for production only)

## Project Structure

- `client/` — React frontend source (pages, components, contexts, hooks, lib)
- `server/` — Express server (serves static files in production)
- `shared/` — Shared constants/types used by both client and server
- `dist/public/` — Built frontend output

## Key Pages

- **Home** (`Home.tsx`) — Hero, feature cards with smooth zoom-navigate animation, CTA hidden when logged in
- **Spots** (`Spots.tsx`) — 25 spots with smooth modal detail view (opacity+scale entrance), category filter
- **Hotels** (`Hotels.tsx`) — 15 hotels with toolbox shortcut buttons (翻譯/匯率/天氣/導航), booking dialog
- **Planner** (`Planner.tsx`) — Trip itinerary with AI generation (Gemini), travel time between activities, image upload
- **Diary** (`Diary.tsx`) — Travel diary with image upload, user's published entries in history tab, social features
- **Tools** (`Tools.tsx`) — AI translation (Gemini), live currency rates, live weather, Google Maps navigation, sticky mobile bottom nav
- **Profile** (`Profile.tsx`) — Avatar upload (file + URL + presets), name/phone/bio editing, third-party account linking
- **Login** (`Login.tsx`) — Email/password + social login (Google, Facebook, Apple, LINE, X)

## Features

- Image upload with FileReader (5MB limit) for diary, planner activities, and profile avatar
- User diary entries persisted in `localStorage("wanderlust_user_diaries")`
- Profile extra data in `localStorage("lumina_profile_extra")`
- Auth state in `localStorage("wanderlust_user")` via AuthContext
- Live currency rates via `exchangerate-api.com`
- Live weather via `wttr.in` API
- AI translation and trip planning via Gemini API (key hardcoded)
- Google Maps navigation with geolocation

## Development

```bash
pnpm install
pnpm run dev  # starts Vite dev server on port 5000
```

## Deployment

- **Type**: Static site deployment
- **Build**: `pnpm run build` (Vite builds to `dist/public/`)
- **Serve**: Static files from `dist/public/`

## Configuration Notes

- Vite is configured to run on port 5000 with `host: "0.0.0.0"` and `allowedHosts: "all"` for Replit proxy compatibility
- pnpm `onlyBuiltDependencies` includes `@tailwindcss/oxide` and `esbuild` for native module builds
- Path aliases: `@` → `client/src`, `@shared` → `shared`
