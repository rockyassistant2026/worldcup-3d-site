---
name: 3d-qa-deploy
description: Playwright canvas smoke, Lighthouse budgets, and Vercel deploy.
---

# 3D QA & Deploy

Use this when testing or shipping the 3D website.

## When to Use
- E2E, cross-browser, WebXR detect, CI, Vercel/Netlify
- Don't use for implementing scene features

## Procedure
1. `npx playwright test` — visit `/`, wait for `canvas`, assert no `pageerror`, screenshot `test-results/canvas.png`.
2. Typecheck + production build must pass before deploy.
3. Lighthouse on the production preview. Record perf score; do not invent it.
4. WebXR: feature-detect `navigator.xr`. Fallback is orbit canvas, not a blank page.
5. Deploy: `npx vercel --prod` or Netlify, only with env secrets already set remotely.
6. CI via GitHub Actions: install, typecheck, unit/e2e, build.

## Verification
- Live URL returns 200. Screenshot exists. CI green. No API keys in the built JS (`rg -i "sk-|hf_|ghp_" dist` is empty).
