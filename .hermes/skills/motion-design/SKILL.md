---
name: motion-design
description: Broadcast-style motion graphics and rigged character animation for marketing/promo sites — GSAP for scroll/timeline-driven UI motion (title reveals, CTA buttons, transitions), Lottie for shipping After-Effects-authored graphics, Rive for interactive vector micro-interactions, and Three.js skeletal character animation (useAnimations + GLTF action clips) for things like a player running toward goal. Use when the user asks for cinematic reveals, broadcast/promo polish, a "subscribe" or CTA animation, motion graphics, title/lower-third style graphics, or an animated/rigged character (running, walking, celebrating). Trigger keywords: motion design, motion graphics, GSAP, ScrollTrigger, Lottie, Rive, broadcast, promo, CTA animation, rigged character, skeletal animation, running animation, useAnimations.
---

# Motion Design

Four tools, four different jobs. Don't reach for GSAP to animate a 3D mesh, and
don't reach for a shader when a CSS/DOM transition is all that's needed.

| Need | Tool |
|---|---|
| DOM/UI timeline animation (reveals, CTA motion, scroll-triggered transitions) | **GSAP** |
| Ship an After-Effects-authored graphic (lower-third, logo sting, title card) | **Lottie** |
| Interactive vector animation with states (hover/click-driven, e.g. a subscribe button) | **Rive** |
| Animate a rigged 3D character already in the Three.js scene (player running, celebrating) | **Three.js skeletal animation** (`useAnimations` from `drei`) |

## GSAP — timeline & scroll-driven UI motion

Already usable without any new install decision beyond `npm i gsap` (core +
ScrollTrigger are both free, no paywall since GSAP joined Webflow in 2025).

```bash
npm i gsap
```

```tsx
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function TitleReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".title-word", {
        y: 80,
        opacity: 0,
        stagger: 0.08,
        ease: "power3.out",
        duration: 1,
      });

      gsap.to(".cta-button", {
        scrollTrigger: { trigger: ".cta-button", start: "top 85%" },
        scale: 1,
        opacity: 1,
        ease: "back.out(1.7)",
        duration: 0.6,
      });
    }, ref);

    return () => ctx.revert(); // cleanup — always scope + revert in React
  }, []);

  return <div ref={ref}>{/* ... */}</div>;
}
```

**Gotchas**
- Always wrap in `gsap.context()` + `ctx.revert()` on unmount in React — otherwise tweens/ScrollTriggers leak across remounts (especially bad with Vite HMR).
- `ScrollTrigger` conflicts with a manually-driven `scrollY` reader (like a scroll-scrubbed hero) if both attach listeners to the same scroll container — pick one owner per scroll region.
- For number/text count-up effects (e.g. a subscriber counter), use `gsap.to(obj, { value: 1000, onUpdate: () => setDisplay(Math.round(obj.value)) })`, not CSS.

## Lottie — After-Effects graphics on the web

For a motion designer's `.json` export (logo stings, lower-thirds, animated
badges). `lottie-web` is the renderer; `@lottiefiles/dotlottie-react` is the
lighter modern wrapper (compressed `.lottie` format, smaller payload).

```bash
npm i @lottiefiles/dotlottie-react
```

```tsx
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

<DotLottieReact
  src="/motion/subscribe-badge.lottie"
  loop
  autoplay
  style={{ width: 120, height: 120 }}
/>
```

**Gotcha:** a raw `.json` Lottie export can be large (uncompressed vector
keyframes) — prefer the `.lottie` (zipped) format when the designer's tool
supports exporting it, or compress with `@lottiefiles/lottie-to-dotlottie`.

## Rive — interactive state-machine animation

Best for a single polished interactive element (subscribe button, animated
logo) where hover/click states matter, not full-page motion.

```bash
npm i @rive-app/react-canvas
```

```tsx
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

function SubscribeButton() {
  const { rive, RiveComponent } = useRive({
    src: "/motion/subscribe.riv",
    stateMachines: "SubscribeSM",
    autoplay: true,
  });
  const hoverInput = useStateMachineInput(rive, "SubscribeSM", "isHovered");

  return (
    <div
      onMouseEnter={() => hoverInput && (hoverInput.value = true)}
      onMouseLeave={() => hoverInput && (hoverInput.value = false)}
    >
      <RiveComponent />
    </div>
  );
}
```

**Gotcha:** the `.riv` file is authored in the Rive editor (a design tool, not
code) — this library only plays it back. If no `.riv` asset exists yet, use
GSAP or CSS for the button instead of blocking on a design tool.

## Three.js skeletal character animation (rigged player running)

For an actual rigged 3D character in the scene — not a DOM element. Use
`useGLTF` + `useAnimations` from `drei` (already a dependency in this
project). The reference asset for a proven Idle/Walk/Run rig is the official
three.js example character:

`https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Soldier.glb`

This is the exact asset used across the Three.js ecosystem's own skeletal
animation examples — mature, CC0-equivalent, zero licensing risk. It is a
**generic athletic figure**, not a likeness of any real person — keep it that
way; real player likenesses are a rights issue independent of asset
availability.

```tsx
import { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function RunningPlayer({ path, speed = 4 }: { path: THREE.Vector3[]; speed?: number }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Soldier.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Clip names on Soldier.glb: "Idle", "Walk", "Run", "TPose"
    const run = actions["Run"];
    run?.reset().fadeIn(0.3).play();
    return () => { run?.fadeOut(0.3); };
  }, [actions]);

  // Move the character along a path each frame — useFrame, not useState,
  // for anything per-frame (see three-best-practices skill).
  const progress = useRef(0);
  useFrame((_, delta) => {
    if (!group.current || path.length < 2) return;
    progress.current = Math.min(1, progress.current + delta * (speed / 100));
    const i = Math.min(path.length - 2, Math.floor(progress.current * (path.length - 1)));
    const t = progress.current * (path.length - 1) - i;
    const pos = path[i].clone().lerp(path[i + 1], t);
    group.current.position.copy(pos);
    group.current.lookAt(path[i + 1]);
  });

  return <primitive ref={group} object={scene} scale={1} />;
}
useGLTF.preload("/models/Soldier.glb");
```

**Gotchas**
- Clip names are asset-specific — always log `animations.map(a => a.name)` once
  to confirm the actual names before wiring `actions["..."]`.
- `useGLTF` caches by URL — multiple `RunningPlayer` instances sharing one path
  automatically share the loaded geometry/animations (drei handles cloning the
  scene graph per instance via `clone()`; for many instances, prefer
  `SkeletonUtils.clone(scene)` explicitly to avoid skeleton-sharing bugs).
- Blend between clips with `fadeIn`/`fadeOut` (shown above), never snap —
  snapping between Idle and Run pops visibly.
- A running character needs its OWN moving shadow-casting light frustum
  consideration if `shadows` are on — a static shadow camera sized for the
  pitch may clip a player running near midfield edges; check `shadow.camera`
  bounds in `Lights.tsx` cover the full running path, not just the ball area.

## Choosing for this project

For a broadcast-marketing site (trophy reveal → players running toward goal →
live match → subscribe): the running players are Three.js skeletal animation
(they're in the 3D scene), the title/subscribe-button polish layered on top of
the DOM/HUD is GSAP, and Lottie/Rive are there for whenever a motion designer
hands off an actual `.lottie`/`.riv` asset — don't block on them if none exists
yet.
