---
name: post-processing
description: Add an optional EffectComposer stack with quality flags.
---

# Post-Processing

Use this when adding bloom, SMAA, vignette, SSAO, or other screen passes.

## When to Use
- `@react-three/postprocessing` / `EffectComposer` work
- Don't use for per-material GLSL (see `glsl-shaders`)

## Procedure
1. `<EffectComposer enabled={quality !== "low"}>` wrapping `<SMAA />` and look-dev passes.
2. Bloom: modest `intensity` / `luminanceThreshold`. Never bloom the whole framebuffer as a default.
3. SSAO/SSR are high-tier only. They kill mobile FPS.
4. One composer. Do not nest. Disable on `quality === "low"` or `prefers-reduced-motion`.
5. Expose pass toggles in Leva under `postfx.*`.

## Verification
- Toggling `quality` to low removes the composer (Spector.js shows no extra passes). Desktop still 60fps with bloom on a mid-tier scene.
