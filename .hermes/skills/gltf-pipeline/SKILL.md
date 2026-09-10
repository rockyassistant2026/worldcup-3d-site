---
name: gltf-pipeline
description: Import GLTF/GLB with Draco, meshopt, and KTX2.
---

# GLTF Pipeline

Use this when ingesting or converting 3D models for the web.

## When to Use
- New GLB/GLTF/USDZ assets, Draco, KTX2, model-viewer
- Don't use for runtime scene graph (see `threejs-scene-setup`)

## Procedure
1. Drop sources in `raw-assets/` (gitignored if huge). Output to `public/models/<name>.glb`.
2. Compress: `npx gltf-pipeline -i in.gltf -o out.glb -d` (Draco) and/or `gltf-transform optimize` with meshopt + KTX2.
3. Load with `useGLTF('/models/<name>.glb')` and `useGLTF.preload`.
4. Record clip names, polycount, and license in `ASSETS.md`.
5. `<model-viewer>` only for standalone AR embeds, not the main R3F canvas.

## Verification
- GLB size vs budget (hero < 8MB). Model renders. Animations play by named clip. Console has no DRACO/KTX2 loader errors.
