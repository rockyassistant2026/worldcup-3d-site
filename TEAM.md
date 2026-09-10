# 3D Website — Hermes agent team

Built from `3D_Website_Agent_Team_Research` (Spartan, 2026-09-08).

Default Hermes profile on this Mac is still **Nemo** (marketing). These seven profiles are extra, isolated agents. Do not run `hermes profile use` unless you intend to change the sticky default.

## Talk to an agent

```bash
cd /Users/teemohamed83gmail.com/.hermes/workspaces/3d-website

orchestrator chat          # project lead (hermes-nemo @ :8080)
scene-architect chat       # scene / camera / lights
shader-artist chat         # materials / GLSL / postfx
asset-engineer chat        # GLTF / Draco / LODs
interaction-dev chat       # input / physics / Zustand
perf-optimizer chat        # FPS / draw calls
qa-deployer chat           # Playwright / CI / deploy
```

Equivalent: `hermes -p <profile> chat`.

## Supervisor workflow (kanban swarm)

```bash
hermes kanban boards use 3d-website

hermes kanban swarm \
  --worker scene-architect:"Scene, lighting, camera" \
  --worker asset-engineer:"GLB pipeline and LODs" \
  --worker shader-artist:"PBR / metal / glass materials" \
  --worker interaction-dev:"Orbit, hotspots, color picker" \
  --verifier perf-optimizer \
  --synthesizer orchestrator \
  "Build an interactive 3D product showcase"
```

## Local app

```bash
npm install
npm run dev          # Vite
npm run typecheck
npm run build
npm run test:e2e     # Playwright canvas smoke
```

## Models

Ollama's store is an **APFS sparsebundle** at `/Volumes/SSD/OllamaModels.sparsebundle`,
mounted on `/Volumes/OllamaModels` and symlinked from `~/.ollama/models`. A LaunchAgent
(`~/Library/LaunchAgents/com.local.ollama-models-mount.plist`) attaches it at login and
sets the Ollama memory limits — without it, Ollama starts against an unmounted path after
a reboot and every agent silently loses its model.

| Profile | Model | Endpoint |
|---------|-------|----------|
| orchestrator | `hermes-nemo` | `127.0.0.1:8080/v1` (llama-server) |
| the other six | `qwen2.5-coder:7b` | `127.0.0.1:11434/v1` (Ollama) |
| scene-architect, perf-optimizer, qa-deployer | + `qwen2.5vl:7b` vision aux | `127.0.0.1:11434/v1` |

This machine has **16 GB** of unified memory, which drives two rules:

1. **All six workers share one model tag.** Ollama then loads `qwen2.5-coder:7b` (~4.7 GB)
   exactly once and serves all six concurrently. Giving any worker a different tag forces
   a second resident model and starts evict/reload thrashing.
2. **The orchestrator stays off Ollama.** It reuses the `llama-server` already running on
   `:8080`, so the lead costs no additional Ollama memory.

`OLLAMA_MAX_LOADED_MODELS=2` caps residency at the shared coder model plus one vision
model (~10.7 GB), leaving headroom rather than paging.

### Why not qwen2.5:32b

The team was previously wired to `qwen2.5:32b` — **19.9 GB, which cannot be resident on a
16 GB machine.** That was a workaround for `qwen2.5-coder:7b` / `qwen2.5vl:7b` pulls
failing a SHA-256 check. The real cause was the model store living on `/Volumes/SSD`,
which is **exFAT**: exFAT has no extended-attribute support, so macOS wrote AppleDouble
`._*` sidecars (including `._blobs` and `._manifests`) that Ollama then read as blob
files, corrupting digest verification. Moving the store onto APFS fixed the pulls.

Do not point this team back at a model larger than ~8 GB, and do not put the Ollama store
on an exFAT or FAT volume.

If Ollama is down, each profile falls back to `hermes-nemo` at `http://127.0.0.1:8080/v1`.

## Gateways

Messaging gateways (`hermes gateway start`) are for Telegram/Discord/WhatsApp. They are **not** required for this team. Use `chat` and kanban instead. Starting seven gateways without a platform configured only wastes processes.

## Isolation rule

Never point two agent processes at the same profile home. Each profile writes memory automatically; two writers corrupt the system prompt.
