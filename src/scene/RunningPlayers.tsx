import { useRef, useEffect, useState, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "../store/useAppStore";

interface RunningPlayerProps {
  playerId: number; // 0, 1, or 2 for staggering
}

interface DecorativeShotProps {
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  duration: number; // ~1 second
  onComplete: () => void;
}

/**
 * DecorativeShot: a simple parametric arc from player to goal that fades out.
 * Uses lerp + sine-based height arc, NOT physics.
 *
 * IMPORTANT: this component does NOT unmount itself. `elapsedRef` is a ref,
 * and mutating a ref never triggers a re-render, so a render-time check like
 * `if (elapsedRef.current >= duration) return null` would only ever be
 * evaluated once (at mount, when it's still 0) and would never fire again —
 * every shot ever created would stay mounted and keep running its useFrame
 * callback forever (confirmed: ~60MB of heap growth in 60s from exactly this
 * before the onComplete callback was added). The PARENT owns removal: this
 * component calls onComplete() exactly once when it reaches full progress,
 * and the parent removes it from state, which is what actually unmounts it.
 */
function DecorativeShot({ startPos, endPos, duration, onComplete }: DecorativeShotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const elapsedRef = useRef(0);
  const completedRef = useRef(false);

  useFrame((_, delta) => {
    if (!meshRef.current || completedRef.current) return;

    elapsedRef.current += delta;
    const progress = Math.min(1, elapsedRef.current / duration);

    // Parametric arc: lerp horizontally, sine wave for height
    const arcHeight = 0.5; // How high the ball arcs
    const height = Math.sin(progress * Math.PI) * arcHeight;

    const position = startPos.clone().lerp(endPos, progress);
    position.y += height;

    meshRef.current.position.copy(position);

    // Fade out near the end
    const fadeStartProgress = 0.7;
    if (progress > fadeStartProgress) {
      const fadeProgress = (progress - fadeStartProgress) / (1 - fadeStartProgress);
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, 1 - fadeProgress);
    }

    if (progress >= 1) {
      completedRef.current = true;
      onComplete();
    }
  });

  return (
    <mesh ref={meshRef} position={startPos}>
      <sphereGeometry args={[0.22, 16, 16]} />
      <meshStandardMaterial
        color="#ffffff"
        transparent
        opacity={1}
        emissive="#ffffaa"
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

/**
 * Individual running player in the ambient loop.
 * Spawns near midfield → runs toward right goal (x=+50) → decorative shot → idle → reset.
 * Each player has independent timing and Z variation for staggering.
 */
function RunningPlayer({ playerId }: RunningPlayerProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Soldier.glb");
  const { actions } = useAnimations(animations, group);

  // Cycle state machine
  const cyclePhaseRef = useRef<
    "running" | "shooting" | "idle" | "reset"
  >("running");
  const cycleStartTimeRef = useRef(Date.now());
  const runProgressRef = useRef(0);

  // Spawn positions vary by playerId for staggering
  const spawnX = -10 - playerId * 5; // -10, -15, -20
  const spawnYRef = useRef(0.5);
  const spawnZRef = useRef(-15 + playerId * 15); // -15, 0, 15

  // Track when to fire the shot (when close to goal)
  const hasShotRef = useRef(false);
  // Store shot DATA, not JSX elements — each shot removes itself from this
  // array via onComplete, which is what actually unmounts its mesh/geometry.
  // Without this removal, shots accumulated forever (~60MB heap growth/min).
  const [decorativeShots, setDecorativeShots] = useState<
    { id: string; startPos: THREE.Vector3; endPos: THREE.Vector3 }[]
  >([]);

  // Timing constants (in seconds)
  const RUN_DURATION = 3;
  const SHOOT_DURATION = 0.5; // Brief shooting animation
  const IDLE_DURATION = 0.8; // Pause before reset
  const RESET_DURATION = 0.5; // Time to reset position

  // Stagger start times so players are not in sync
  const staggerDelayRef = useRef(playerId * 0.8);

  const getElapsedInPhase = () => {
    return (Date.now() - cycleStartTimeRef.current) / 1000 - staggerDelayRef.current;
  };

  // Initialize animation
  useEffect(() => {
    // Play Run animation on mount and keep it running
    const run = actions["Run"];
    if (run) {
      run.reset().fadeIn(0.3).play();
      return () => {
        run.fadeOut(0.3);
      };
    }
  }, [actions]);

  // Every frame: update cycle state and position
  useFrame(() => {
    if (!group.current) return;

    // Mutable: reset to 0 below when a cycle completes and restarts, so the
    // SAME frame's position calculation uses the fresh value. Previously this
    // was `const`, computed once from the pre-reset cycleStartTimeRef — the
    // reset branch below updated cycleStartTimeRef for the NEXT frame but
    // this frame's position math still used the old, large elapsed value,
    // causing a one-frame teleport (observed: x=91.4, off the 105-unit pitch)
    // every ~4.8s cycle.
    let elapsed = getElapsedInPhase();

    // Gate the entire update behind the stagger delay
    if (elapsed < 0) {
      return;
    }

    // State machine: running → shooting → idle → reset → running (repeat)
    const runningEndTime = RUN_DURATION;
    const shootingEndTime = runningEndTime + SHOOT_DURATION;
    const idleEndTime = shootingEndTime + IDLE_DURATION;
    const resetEndTime = idleEndTime + RESET_DURATION;

    // Determine current phase
    let newPhase = cyclePhaseRef.current;
    if (elapsed < runningEndTime) {
      newPhase = "running";
    } else if (elapsed < shootingEndTime) {
      newPhase = "shooting";
    } else if (elapsed < idleEndTime) {
      newPhase = "idle";
    } else if (elapsed < resetEndTime) {
      newPhase = "reset";
    } else {
      // Cycle complete, restart
      cycleStartTimeRef.current = Date.now();
      elapsed = 0; // this frame must use the fresh value too, not the stale one
      hasShotRef.current = false;
      newPhase = "running";
      // Vary spawn Z position each cycle for natural look
      spawnZRef.current = -15 + playerId * 15 + (Math.random() - 0.5) * 6;
    }

    cyclePhaseRef.current = newPhase;

    // Position updates based on phase
    if (newPhase === "running") {
      const phaseProgress = elapsed / runningEndTime;
      runProgressRef.current = phaseProgress;

      // Move from spawn toward goal (x=+50)
      const currentX = spawnX + (50 - spawnX) * phaseProgress;
      group.current.position.set(currentX, spawnYRef.current, spawnZRef.current);
      group.current.lookAt(50, spawnYRef.current, spawnZRef.current);

      // Fire decorative shot when close enough to goal (around 80% through run)
      if (phaseProgress > 0.8 && !hasShotRef.current) {
        hasShotRef.current = true;
        const playerPos = group.current.position.clone();
        const goalPos = new THREE.Vector3(50, 1, spawnZRef.current);
        const id = `shot-${playerId}-${Date.now()}`;
        setDecorativeShots((prev) => [...prev, { id, startPos: playerPos, endPos: goalPos }]);
      }
    } else if (newPhase === "shooting") {
      // Brief pause, player stays at goal area
      group.current.position.set(45, spawnYRef.current, spawnZRef.current);
      group.current.lookAt(50, spawnYRef.current, spawnZRef.current);
    } else if (newPhase === "idle") {
      // Idle at goal area
      group.current.position.set(45, spawnYRef.current, spawnZRef.current);
    } else if (newPhase === "reset") {
      // Move back toward spawn
      const phaseProgress = (elapsed - idleEndTime) / RESET_DURATION;
      const resetX = 45 + (spawnX - 45) * phaseProgress;
      group.current.position.set(resetX, spawnYRef.current, spawnZRef.current);
      group.current.lookAt(50, spawnYRef.current, spawnZRef.current);
    }

    // Keep Run animation playing
    const run = actions["Run"];
    if (run && !run.isRunning()) {
      run.reset().play();
    }
  });

  // Clone the scene to avoid skeleton sharing issues. Memoized: this must
  // run once per player instance, not on every render — decorative shots
  // firing every ~4s would otherwise re-clone the whole rigged model each
  // time a shot is added or removed.
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <>
      <primitive ref={group} object={clonedScene} scale={1} />
      {decorativeShots.map((shot) => (
        <DecorativeShot
          key={shot.id}
          startPos={shot.startPos}
          endPos={shot.endPos}
          duration={1}
          onComplete={() =>
            setDecorativeShots((prev) => prev.filter((s) => s.id !== shot.id))
          }
        />
      ))}
    </>
  );
}

/**
 * RunningPlayers: persistent ambient loop of 2-3 players running on the pitch.
 * No camera hijacking, no play-once gating. Purely decorative background activity.
 */
export function RunningPlayers() {
  const quality = useAppStore((s) => s.quality);

  // Every hook below is called on EVERY render, unconditionally — Rules of Hooks.
  // Gate behavior INSIDE hook bodies, not before hooks.
  const shouldSkip = quality === "low";

  // Return null AFTER all hooks have been called
  if (shouldSkip) {
    return null;
  }

  return (
    <>
      {/* Three staggered running players */}
      <RunningPlayer playerId={0} />
      <RunningPlayer playerId={1} />
      <RunningPlayer playerId={2} />
    </>
  );
}

// Preload the Soldier model
useGLTF.preload("/models/Soldier.glb");
