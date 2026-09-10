---
name: r3f-patterns
description: Declarative R3F patterns for state, frames, and events.
---

# R3F Patterns

Use this when writing React Three Fiber components, not vanilla Three.js.

## When to Use
- New R3F components, `useFrame`, pointer events, Zustand wiring
- Don't use for GLSL authoring or GLTF compression

## Rules
1. Declare scene graph in JSX. Imperative `scene.add` only inside `useLayoutEffect` with cleanup.
2. `useFrame` must be a mutation of refs (`mesh.rotation.y += dt`), never `setState`.
3. Transient interaction state (hover, drag) in refs. Durable UI state (selected SKU, color) in Zustand *outside* the canvas.
4. Memoize geometries/materials with `useMemo` or drei's `useGLTF` / `<meshStandardMaterial />` JSX.
5. Pointer events: `onPointerOver`/`Out`/`Click` on meshes. Set `event.stopPropagation()`. Cursor CSS via store, not `document.body` from every mesh.
6. Drei first: `OrbitControls`, `ContactShadows`, `Environment`, `Float`, `Html`, `useGLTF`, `useAnimations`.
7. Keep components small. One mesh family per file. Re-renders of a parent re-create children — hoist static subtrees.

## Verification
- React Profiler (or a `console.count` in the component body) does not fire every frame. Pointer events hit the intended mesh.
