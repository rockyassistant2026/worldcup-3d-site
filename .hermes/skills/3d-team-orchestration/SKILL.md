---
name: 3d-team-orchestration
description: Decompose 3D website work across the seven Hermes profiles.
---

# 3D Team Orchestration

Use this when the user wants a feature, scene, or release from the 3D website team.

## When to Use
- Any multi-file 3D website request
- Don't use for a one-line config tweak you can do yourself

## Procedure
1. Outcome sentence + constraints (device, brand, deadline).
2. Split into kanban cards on board `3d-website`, one owner each:
   - `scene-architect` — canvas, camera, lights, layout
   - `asset-engineer` — models, compression, clips
   - `shader-artist` — materials, FX
   - `interaction-dev` — input, physics, store
   - `perf-optimizer` — budgets, instancing, splitting
   - `qa-deployer` — tests, CI, deploy
3. Acceptance criteria are testable (file path + behavior + budget).
4. Quality gate: `npm run typecheck`, canvas error boundary present, no secret files, perf budget not obviously blown.
5. Close with what shipped, what was measured, what is blocked.

## Swarm example
```
hermes kanban swarm --board 3d-website \
  --worker scene-architect:"Scene + lighting" \
  --worker asset-engineer:"GLB pipeline" \
  --worker shader-artist:"PBR materials" \
  --worker interaction-dev:"Orbit + hotspots" \
  --verifier perf-optimizer \
  --synthesizer orchestrator \
  "Build a 3D product showcase"
```
