# Changelog

All notable changes to the Luh Gerald Eco System are logged here.

## 2026-08-01
- Initial repo scaffold created
- Added README.md with department overview
- Created folder structure for 6 departments: Marketing Suite, Content Studio, Dev Bay, Operations Hub, Finance Office, Research Lab
- Built the frontend foundation: Next.js (App Router) + TypeScript + Tailwind app in `frontend/`
  - Homepage / AI Command Center with status panel and department grid
  - Shared navigation and module screen layout
  - One route per department (Marketing Suite, Content Studio, Dev Bay, Operations Hub, Finance Office, Research Lab)
  - Verified with a clean production build
- Redesigned the dashboard to match the ecosystem concept art
  - AI Command Center hero with live system status, activity log, and interactive quick actions
  - Neon department grid styled after the space-station reference image
  - Refreshed all 6 module screens with matching glow styling
- Added email + password authentication
  - `/login` and `/signup` screens, session persisted client-side
  - Dashboard and all module routes now redirect to `/login` when signed out
- Added Vercel deployment configuration (`frontend/vercel.json`) and `DEPLOYMENT.md` with setup instructions
