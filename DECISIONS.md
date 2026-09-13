# Decisions

Newest first.

## 2026-09-13 — Consolidate 5 3D specialists into one `3d-engineer` profile

The HERMES MVP v1.0 studio spec defines exactly one "Agent 5: 3D/WebGL/WebGPU Engineer."
The existing team had 5 separate profiles covering that ground (`scene-architect`,
`shader-artist`, `asset-engineer`, `interaction-dev`, `perf-optimizer`). Chose to merge
them literally into one profile rather than keep them as sub-specialists under a shared
umbrella, per explicit user instruction ("modify and follow same mvp"). Tradeoff accepted
knowingly: `3d-engineer`'s SOUL.md is large, covering scene/camera/lighting, shaders,
GLTF pipeline, physics/interaction, and performance all at once.

## 2026-09-13 — Keep Vite + React Three Fiber, do not migrate to Next.js/Tailwind

The studio spec assumes Next.js + Tailwind (section 8). The existing site is a working,
deployed Vite SPA. Migrating frameworks is a separate, much larger, riskier project than
reorganizing the agent team — explicitly declined by the user. `frontend-architect` and
`ux-ui-designer` SOUL.md files note this and are told not to introduce either stack
without an explicit task calling for it.

## 2026-09-09 — Route every agent's implementation through `claude-task`, never direct API or bypass flags

User instruction: "make them use claude cli, even nemo." Every profile's real code
editing goes through `~/.local/bin/claude-task` -> Claude Code CLI on `claude-opus-5`
with scoped `--allowedTools`, never `--dangerously-skip-permissions`. Reason: Hermes has
no Anthropic credentials of its own baked in, and unscoped delegation (via Hermes's
native `delegation` toolset, or a raw `claude-control`-style full-bypass wrapper found
during a later audit) would let an agent's driver model hand off to an unrestricted
Claude session. `delegation` was physically removed from every profile's
`platform_toolsets.cli` to make this a capability restriction, not just a documented
instruction agents could ignore.

## 2026-09-08 — Model store moved off exFAT to an APFS sparsebundle, then Ollama abandoned entirely

Original 7-agent team pointed at `qwen2.5:32b` (19.9 GB, too large for the 16 GB M4) with
model pulls failing SHA-256 verification because of AppleDouble `._*` sidecar corruption
on an exFAT-mounted model store. Fixed the store, but ultimately replaced the whole
Ollama-based driver approach with `claude-haiku-4-5` direct (Anthropic) as every agent's
driver, falling back to local `hermes-nemo` (`llama-server`, already running for other
profiles) rather than Ollama. Ollama is no longer installed on this machine.
