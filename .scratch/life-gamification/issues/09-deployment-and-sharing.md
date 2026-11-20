# 09: Free deployment and sharing configuration

**What to build:** Deployment pipeline and configuration for 100% free hosting (GitHub Pages / Cloudflare Pages / Vercel), allowing users to access their PWA from any device, install it on mobile home screens, and share it with friends. Includes automated GitHub Actions workflow for zero-config GitHub Pages deployment and detailed deployment guide in documentation.

**Blocked by:** 08: Celebratory micro-interactions, confetti, and Web Audio effects

**Status:** resolved

- [x] Vite base path configuration compatible with GitHub Pages subpath deployment (`/` or `./`).
- [x] GitHub Actions workflow (`.github/workflows/deploy.yml`) building and deploying `dist/` to GitHub Pages.
- [x] Step-by-step deployment guide in documentation (GitHub Pages, Cloudflare Pages, Vercel) in `docs/DEPLOYMENT.md`.
- [x] Verification of production build and offline PWA service worker with relative/absolute base paths.
