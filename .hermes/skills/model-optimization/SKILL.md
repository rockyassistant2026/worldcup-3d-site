---
name: model-optimization
description: Cut polycounts, build LODs, and compress textures.
---

# Model Optimization

Use this when an asset misses size, draw-call, or FPS budgets.

## When to Use
- LOD, atlas, instance, decimate, texture resize
- Don't use for shader look-dev

## Procedure
1. Measure: triangles, meshes, textures, draw calls (drei `StatsGl` + Spector).
2. Merge static meshes that share a material. Instance repeated meshes (`<instancedMesh>`).
3. LOD: high / mid / low glb or `THREE.LOD`. Swap at 8m / 20m by default.
4. Textures: power-of-two, max 2K for hero, 1K otherwise, Basis/KTX2 if the pipeline supports it.
5. Remove unused nodes, cameras, and lights from imported GLTFs.

## Verification
- Before/after triangle count, GLB bytes, and draw calls are written down. Hero still looks correct at the default camera.
