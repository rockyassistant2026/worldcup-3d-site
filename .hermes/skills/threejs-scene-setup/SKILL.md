---
name: threejs-scene-setup
description: Scaffold an R3F canvas with lights, camera, and error boundary.
---

# Three.js Scene Setup

Use this when creating or rewriting the root 3D scene for the interactive website.

Workspace: `src/scene/` in the 3d-website project.

## When to Use
- New canvas, camera rig, lighting, environment, or scene graph
- Don't use for shaders, GLTF compression, or physics (other skills)

## Procedure
1. Canvas lives in `src/App.tsx`. Wrap with an error boundary. `dpr={[1, 2]}`. `gl={{ antialias: true, powerPreference: "high-performance" }}`.
2. `Experience` composes `Lights`, camera (`PerspectiveCamera` from drei or `CameraControls`), environment (`Environment` / HDRI), and meshes. No raw `new THREE.WebGLRenderer()` in R3F.
3. Lighting: ambient + one directional (sun) with explicit shadow map size (1024 or 2048). Tone mapping ACES on the canvas `gl.toneMapping`.
4. Camera default position `[0, 1.4, 4]`, fov 35–45 for product shots, 50–60 for exploratory scenes.
5. `Suspense` around every loader. Fallback is a drei `Html` spinner or a placeholder mesh, never a blank canvas.
6. Leva panel only in `import.meta.env.DEV`.

## Verification
- Typecheck passes. Canvas mounts. Resizing the window does not stretch the scene. Error boundary catches a thrown mesh.
