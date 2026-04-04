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
