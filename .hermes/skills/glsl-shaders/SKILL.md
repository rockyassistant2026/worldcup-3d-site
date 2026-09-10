---
name: glsl-shaders
description: Author GLSL/TSL materials with Leva-bound uniforms.
---

# GLSL Shaders

Use this when a MeshStandardMaterial cannot express the look.

## When to Use
- Custom vertex/fragment, TSL, fresnel, dissolve, water, glass beyond PBR
- Don't use for EffectComposer passes (see `post-processing`)

## Procedure
1. Start from `THREE.MeshStandardMaterial` onBeforeCompile *or* `shaderMaterial` from drei. Full `ShaderMaterial` only when you need a unique lighting model.
2. Uniforms: `{ uTime: 0, uColor: new THREE.Color(), ... }` updated in `useFrame` via ref, bound to Leva in DEV.
3. Precision: `precision highp float` on mobile-critical shaders. Avoid `discard` and dependent texture reads in the fragment hot path.
4. Include Three chunks (`#include <common>`, lights_physical_fragment) when you need scene lights. Otherwise you will unlit-break the look.
5. Keep `.vert` / `.frag` (or TSL) next to the component. Do not inline 200-line GLSL in TSX.

## Verification
- Shader compiles (no `THREE.WebGLProgram` errors). Leva sliders change the look live. Low quality flag swaps back to MeshStandardMaterial.
