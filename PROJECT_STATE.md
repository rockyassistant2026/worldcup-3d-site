# Project State

CURRENT PHASE:
Agent-team restructuring onto the HERMES MVP v1.0 studio spec (9 profiles: orchestrator
+ 8 specialists). No application code changed as part of this phase — profile configs
and docs only.

COMPLETED:
- Interactive World Cup 3D website: stadium, pitch, trophy, flags, banners, confetti,
  team-select carousel, kick physics, goal scoring.
- Scroll-scrubbed cinematic hero intro (trophy reveal -> stadium flyover -> live match).
- Public deploy: https://rockyassistant2026.github.io/worldcup-3d-site/
- Ambient running-players loop (3 rigged players, persistent, non-blocking of live
  gameplay) — verified: no memory leak, no off-pitch teleport, score integrity intact,
  SubscribeCTA renders, typecheck/build/e2e all pass.
- Team restructured: `3d-engineer` consolidates 5 retired 3D-specialist profiles;
  `creative-director`, `ux-ui-designer`, `frontend-architect`, `backend-infra`,
  `content-seo` created net-new; `orchestrator`/`motion-director`/`qa-deployer` SOUL.md
  rewritten; stale `claude-control` full-bypass instructions removed from all profiles.

ACTIVE:
- None queued yet under the new team structure — awaiting the next task from the user.

BLOCKED:
none

KNOWN RISKS:
- Headless/sandboxed canvas screenshot verification is unreliable for motion (see
  `AGENT_RULES.md` and `qa-deployer`'s SOUL.md) — the render loop can genuinely advance
  while pixel readback stays frozen. Use state-level checks instead.
- `backend-infra` and `content-seo` are net-new roles with no track record yet on this
  project.

NEXT ACTIONS:
- Board `football-3d` is the live kanban board going forward; `3d-website`'s 4 stale
  scaffolding-era tasks have been archived (superseded by the real work already done on
  `football-3d`).
- First real task under the new roster should exercise at least one new profile
  (`creative-director` or `ux-ui-designer`) to validate the restructuring end-to-end.
