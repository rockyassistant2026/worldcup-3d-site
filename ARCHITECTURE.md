# Architecture

## Stack

Vite + React 19 + TypeScript + React Three Fiber + `@react-three/drei` +
`@react-three/rapier` + Zustand + Leva + GSAP. Single-page app, no router. Deployed as a
static build to GitHub Pages via GitHub Actions
(`.github/workflows/deploy-pages.yml`).

**No Next.js. No Tailwind. No backend, database, or CMS.** The HERMES studio spec this
team's structure is drawn from assumes those — this project deliberately doesn't use
them. See `DECISIONS.md`.

## Directory layout

```
src/
  App.tsx          top-level composition, keyboard controls, capture-mode gating
  main.tsx
  scene/           R3F scene graph — owned by 3d-engineer
  ui/              HUD, SubscribeCTA — owned by ux-ui-designer / frontend-architect
  store/           Zustand (useAppStore.ts) — cross-cutting app state
  hero/            scroll-scrubbed cinematic hero — motion-director + 3d-engineer
  assets/
  data/
public/
  models/          compressed GLB assets (Draco/meshopt where it helps)
  hero-frames/      captured frame sequences for scroll-scrubbed reveals
e2e/               Playwright specs
scripts/           frame-capture and asset-pull scripts
studio/            per-agent detailed docs (see each subdirectory's README)
```

`src/components`, `src/hooks`, and `src/lib` do not exist yet — created only when a real
task's code needs that separation, not pre-scaffolded.

## Agent roster

See `AGENTS.md` for the full 9-profile team (orchestrator + 8 specialists) and the
two-tier driver/implementation-engine model.

## Kanban

Board `football-3d` is live (see `TASK_BOARD.md`). Board `3d-website` holds only
archived, stale scaffolding-era tasks.
