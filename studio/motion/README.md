# /studio/motion

Owner: `motion-director` (HERMES MVP v1.0 spec, Agent 3).

Expected file: `motion-system.md` — the centralized scroll-progress -> master-timeline
pipeline and the reusable primitives (ScrollTimeline, SceneTransition, CameraRig,
RevealText, Parallax, MagneticButton, ImageSequence, VideoScrubber, PageTransition).
Reusable motion code itself lives in `src/motion/` (create when the first primitive is
actually built, not pre-scaffolded empty) and `src/hero/` (existing scroll-scrubbed hero).
