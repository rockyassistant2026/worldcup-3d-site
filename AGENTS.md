# AGENTS

This repo is the shared workspace for the Hermes 3D website team. Each agent is an isolated Hermes profile. Never point two running agent processes at the same profile home.

## Profiles

| Profile | Alias | Driver | Owns |
|---------|-------|--------|------|
| orchestrator | `orchestrator` | hermes-nemo (local, :8080) | Decomposition, kanban, quality gates |
| scene-architect | `scene-architect` | claude-haiku-4-5 | Canvas, camera, lights, environment |
| shader-artist | `shader-artist` | claude-haiku-4-5 | GLSL/TSL, PBR, post-processing |
| asset-engineer | `asset-engineer` | claude-haiku-4-5 | GLTF pipeline, LODs, clips |
| interaction-dev | `interaction-dev` | claude-haiku-4-5 | Raycasting, physics, Zustand |
| perf-optimizer | `perf-optimizer` | claude-haiku-4-5 | FPS, draw calls, splitting |
| qa-deployer | `qa-deployer` | claude-haiku-4-5 | Playwright, CI, Vercel/Netlify |
| motion-director | `motion-director` | claude-haiku-4-5 | Scroll-scrubbed cinematic reveals (camera path -> frame capture -> scroll-scrub player) |

**Two-tier architecture.** The "Driver" column is only the loop/decision model
— cheap, and what actually reasons about the kanban task and decides what to
do. All real code editing happens one level down, through the `claude-task`
wrapper (`~/.local/bin/claude-task`), which shells out to the Claude Code CLI
on **claude-opus-5** with a scoped `--allowedTools` permission set (no
`--dangerously-skip-permissions`). Every SOUL.md instructs the agent never to
call `claude` directly, always through that wrapper. Hermes resolves the
Anthropic credential from the Claude Code CLI login
(`~/.claude/.credentials.json`) — no API key is stored in this repo or in any
profile `.env`. All eight profiles fall back to local `hermes-nemo` (:8080) if
Anthropic is unreachable.

An earlier design ran the driver itself on `qwen2.5:32b` / `qwen2.5-coder:7b`
via Ollama. Ollama has since been fully removed from this Mac (models too
large for 16 GB RAM, plus repeated store corruption on the exFAT model
volume) — there is no Ollama dependency anywhere in this stack any more.

## Stack

Three.js + React Three Fiber + @react-three/drei + Leva + Zustand + Vite + TypeScript.

## Rules

- Typed TypeScript. R3F declarative JSX. Error boundary around the canvas.
- `useFrame` mutates refs only. Durable state in Zustand.
- 60fps desktop mid-tier. Quality flag `low | medium | high`.
- Do not invent FPS, Lighthouse, or GitHub star numbers.
- Work only in this directory unless a task says otherwise.

## Chat with a specialist

```bash
cd /Users/teemohamed83gmail.com/.hermes/workspaces/3d-website
orchestrator chat
scene-architect chat
# or: hermes -p shader-artist chat
```
