# Agent Rules

These are enforced, not aspirational — several were learned the hard way this project
(see `DECISIONS.md` for the incidents behind them).

## Implementation control

- Every agent's reasoning/decomposition runs on its own driver model
  (`claude-haiku-4-5`, falling back to local `hermes-nemo`). **No agent writes code
  directly.** All real implementation goes through `~/.local/bin/claude-task`, which
  shells out to the Claude Code CLI on `claude-opus-5` with a scoped `--allowedTools`
  permission set.
- Never call `claude` directly. Never pass `--dangerously-skip-permissions` or
  `--permission-mode bypassPermissions`, for any agent, under any circumstance.
- No profile's `platform_toolsets.cli` includes Hermes's native `delegation` toolset —
  physically removed from every profile so an agent cannot bypass `claude-task` by
  delegating to a sub-agent that inherits an unrestricted toolset.

## Verify before claiming done

- A completed kanban task must state which files were actually changed and what
  `npm run typecheck` printed — read the changed files back yourself, don't trust the
  `claude-task` wrapper's own summary of what it did.
- Typecheck/build passing is **not sufficient** to claim a visual or runtime feature
  works. This project's own history has multiple cases where both passed cleanly on code
  with real bugs (a Rules-of-Hooks violation that crashed the canvas, a memory leak, an
  off-pitch position teleport) — all only caught by direct verification.
- Screenshot-based headless verification of live canvas motion is known to be unreliable
  in this project's sandboxed test environment (WebGL readback can freeze while the
  render loop is genuinely still advancing). Prefer state-level checks — DOM text, store
  values, mount/unmount counters, or console-logged position sampling from inside the
  actual game loop — and say plainly when a check could only be done state-level.
- Never fabricate task IDs, file names, user messages, FPS numbers, Lighthouse scores, or
  GitHub star counts. If you didn't measure it or read it with a tool, you don't know it.

## Task template

Kanban tasks have native `status`, `assignee`, `priority`, and dependency (`--parent`)
fields but no native OBJECTIVE/FILES/ACCEPTANCE-CRITERIA/TEST-METHOD fields. Encode those
as a convention inside the task body:

```
Title: [<ROLE-PREFIX>-<NNN>] <short objective>

OBJECTIVE: <one sentence>
FILES: <expected files touched>
ACCEPTANCE CRITERIA:
- <bullet>
- <bullet>
TEST METHOD: <how this will be verified — Playwright, manual browser check, typecheck>
```

Role prefixes: `CD` (creative-director), `UX`, `MO` (motion-director), `FE`
(frontend-architect), `3D` (3d-engineer), `BE` (backend-infra), `CO` (content-seo), `QA`.

Dependencies use the existing `--parent` flag. Priority uses the existing `--priority`
flag.

## Git conventions

Branch per agent, created on demand via kanban's `--branch` flag when that agent picks up
its first task (not pre-created empty): `agent/creative`, `agent/ux`, `agent/motion`,
`agent/frontend`, `agent/3d`, `agent/backend`, `agent/content`, `agent/qa`.

Commit types: `feat`, `fix`, `perf`, `refactor`, `design`, `test`, `docs`. Example:
`feat(hero): implement cinematic hero sequence`, `perf(webgl): optimize hero texture
memory`.

## Scope

Work only in `/Users/teemohamed83gmail.com/.hermes/workspaces/3d-website` unless a task
explicitly says otherwise. Do not introduce Next.js, Tailwind, or a backend without an
explicit task calling for it — see `DECISIONS.md`.
