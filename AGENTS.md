# AGENTS

This repo is the shared workspace for the Hermes 3D website studio team, structured per
the HERMES MVP v1.0 studio spec: Hermes (Agent 0) coordinates 8 specialist agents through
an `orchestrator` PM/task-planner layer. Each agent is an isolated Hermes profile. Never
point two running agent processes at the same profile home.

Kanban board: **`football-3d`** (the live board with real history). The `3d-website`
board holds only stale, never-executed tasks from initial scaffolding — archived, not
deleted.

## Profiles

| Profile | Alias | Driver | Owns |
|---------|-------|--------|------|
| orchestrator | `orchestrator` | claude-haiku-4-5 | Decomposition, kanban, quality gates |
| creative-director | `creative-director` | claude-haiku-4-5 | Vision, storytelling, page architecture |
| ux-ui-designer | `ux-ui-designer` | claude-haiku-4-5 | IA, layouts, design system, accessibility spec |
| motion-director | `motion-director` | claude-haiku-4-5 | Scroll-scrubbed cinematics, motion system, rigged character animation |
| frontend-architect | `frontend-architect` | claude-haiku-4-5 | App/component architecture, cross-cutting state |
| 3d-engineer | `3d-engineer` | claude-haiku-4-5 | Scene, camera, lighting, shaders, GLTF pipeline, physics, GPU performance |
| backend-infra | `backend-infra` | claude-haiku-4-5 | APIs, CMS, deploy infra (dormant — no backend exists yet) |
| content-seo | `content-seo` | claude-haiku-4-5 | Copy, messaging, metadata, SEO, conversion |
| qa-deployer | `qa-deployer` | claude-haiku-4-5 | Playwright, accessibility, performance budgets, CI, deploys |

`3d-engineer` consolidates what were 5 separate profiles (`scene-architect`,
`shader-artist`, `asset-engineer`, `interaction-dev`, `perf-optimizer`) into one role,
per the studio spec's single "Agent 5" — those 5 profiles have been deleted.

**Every profile's primary driver is `claude-haiku-4-5` (Anthropic), with `hermes-nemo`
(local `llama-server` on `:8080`) as automatic fallback if Anthropic is unreachable.**
There is no per-agent difference in driver model — the orchestrator is not an exception.

**Two-tier architecture.** The driver above is only the loop/decision model — cheap, and
what actually reasons about the kanban task and decides what to do. All real code editing
happens one level down, through the `claude-task` wrapper (`~/.local/bin/claude-task`),
which shells out to the Claude Code CLI on **claude-opus-5** with a scoped
`--allowedTools` permission set (no `--dangerously-skip-permissions`). Every SOUL.md
instructs the agent never to call `claude` directly, always through that wrapper. Hermes
resolves the Anthropic credential from the Claude Code CLI login
(`~/.claude/.credentials.json`) — no API key is stored in this repo or in any profile
`.env`.

There is no Ollama dependency anywhere in this stack — an earlier design that ran the
driver on `qwen2.5:32b` / `qwen2.5-coder:7b` via Ollama was abandoned (models too large
for 16 GB RAM, plus store corruption on the exFAT model volume) in favor of the
`claude-haiku-4-5` driver used today.

## Stack

Vite + React + React Three Fiber + `@react-three/drei` + Leva + Zustand + TypeScript. **No
Next.js, no Tailwind, no backend** — the studio spec this team is modeled on assumes
those; this project deliberately does not use them. Don't introduce them without an
explicit task asking for it.

## Governance docs

Process/state docs live in `/studio/**` (per-agent detailed specs) and at repo root
(shared quick-status): `PROJECT_STATE.md`, `ARCHITECTURE.md`, `AGENT_RULES.md`,
`DECISIONS.md`, `TASK_BOARD.md`, `QUALITY_REPORT.md`.

## Rules

- Typed TypeScript. R3F declarative JSX. Error boundary around the canvas.
- `useFrame` mutates refs only. Durable state in Zustand.
- 60fps desktop mid-tier. Quality flag `low | medium | high`.
- Do not invent FPS, Lighthouse, or GitHub star numbers.
- Work only in this directory unless a task says otherwise.
- No agent bypasses `claude-task` for implementation, and no agent's toolset includes
  Hermes's native `delegation` toolset (physically removed from every profile) — both
  would reintroduce the unscoped-permission problem this team was explicitly rebuilt to
  avoid.

## Chat with a specialist

```bash
cd /Users/teemohamed83gmail.com/.hermes/workspaces/3d-website
orchestrator chat
3d-engineer chat
# or: hermes -p ux-ui-designer chat
```
