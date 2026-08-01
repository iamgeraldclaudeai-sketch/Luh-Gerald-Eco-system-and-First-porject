# Luh Gerald Eco System — Frontend

The front-end foundation for the Luh Gerald Eco System dashboard, built with
Next.js (App Router), TypeScript, and Tailwind CSS.

## Structure

- `app/page.tsx` — homepage / AI Command Center (status panel + department grid)
- `app/<module>/page.tsx` — one screen per department:
  - `marketing-suite`
  - `content-studio`
  - `dev-bay`
  - `operations-hub`
  - `finance-office`
  - `research-lab`
- `components/Nav.tsx` — shared top navigation across all screens
- `components/ModuleScreen.tsx` — shared layout used by every department screen
- `lib/modules.ts` — single source of truth for department metadata (name, tagline, color, widgets)

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000.

## Status

This is the front-end foundation: routing, navigation, and screen layout are
in place. Each module screen currently shows placeholder widgets — real data
and actions plug in next.
