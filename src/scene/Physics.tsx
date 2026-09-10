import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Physics as RapierPhysics, RigidBody } from "@react-three/rapier";
import { useAppStore } from "../store/useAppStore";

const FOOTBALL_RADIUS = 0.11;
const BALL_MASS = 0.43;
const PITCH_LENGTH = 105;
const PITCH_WIDTH = 68;

/**
 * PhysicsSetup: Manages ball physics state synchronization and kick impulse
 * This component should be placed inside Experience after RapierPhysics setup
 */
function PhysicsSetupImpl() {
  const ballRigidBodyRef = useRef<any>(null);
  const lastScoredRef = useRef<"left" | "right" | null>(null);
  const lastKickTimeRef = useRef(0);
  const prevAimingRef = useRef(false);
  // Reuse impulse object to avoid per-frame allocation
  const impulseRef = useRef({ x: 0, y: 0, z: 0 });

  const {
    setBallPosition,
    setBallVelocity,
    scored,
    leftGoals,
    rightGoals,
  } = useAppStore();

  // Syncing and physics step
  useFrame(() => {
    if (!ballRigidBodyRef.current) return;

    const rigidBody = ballRigidBodyRef.current;
    const pos = rigidBody.translation();
    const vel = rigidBody.linvel();

    setBallPosition([pos.x, pos.y, pos.z]);
    setBallVelocity([vel.x, vel.y, vel.z]);

    // Check if ball went out of bounds (below pitch or too far)
    if (pos.y < -5 || Math.abs(pos.x) > 60 || Math.abs(pos.z) > 40) {
      // Reset ball
      rigidBody.setTranslation({ x: 0, y: 0.11, z: 0 }, true);
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    // Check for kick impulse application
    const state = useAppStore.getState();
    const isCurrentlyAiming = state.isAiming;

    // Detect transition from aiming to not aiming
    if (prevAimingRef.current && !isCurrentlyAiming) {
      const now = Date.now();

      // Throttle kicks (can't kick twice within 200ms)
      if (now - lastKickTimeRef.current > 200) {
        lastKickTimeRef.current = now;

        const kickForce = 15; // Tuned for reasonable distance
        // Reuse impulse object instead of creating new one
        impulseRef.current.x = state.aimDirection.x * state.aimPower * kickForce;
        impulseRef.current.y = 0.5; // Small upward component for elevation
        impulseRef.current.z = state.aimDirection.z * state.aimPower * kickForce;
        rigidBody.applyImpulse(impulseRef.current, true);
      }
    }

    prevAimingRef.current = isCurrentlyAiming;
  });

  // Goal detection
  useEffect(() => {
    const checkGoals = () => {
      if (!ballRigidBodyRef.current) return;
      const pos = ballRigidBodyRef.current.translation();

      // Left goal: x < -50 and y in goal height range, z within goal width
      if (
        pos.x < -50 &&
        pos.y > 0.5 &&
        pos.y < 2.9 &&
        Math.abs(pos.z) < 4 &&
        lastScoredRef.current !== "left"
      ) {
        lastScoredRef.current = "left";
        scored("left");
        setTimeout(() => {
          if (ballRigidBodyRef.current) {
            ballRigidBodyRef.current.setTranslation(
              { x: 0, y: 0.11, z: 0 },
              true
            );
            ballRigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            lastScoredRef.current = null;
          }
        }, 1500);
      }

      // Right goal: x > 50 and y in goal height range, z within goal width
      if (
        pos.x > 50 &&
        pos.y > 0.5 &&
        pos.y < 2.9 &&
        Math.abs(pos.z) < 4 &&
        lastScoredRef.current !== "right"
      ) {
        lastScoredRef.current = "right";
        scored("right");
        setTimeout(() => {
          if (ballRigidBodyRef.current) {
            ballRigidBodyRef.current.setTranslation(
              { x: 0, y: 0.11, z: 0 },
              true
            );
            ballRigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            lastScoredRef.current = null;
          }
        }, 1500);
      }

      // Reset flag when ball leaves goal zone
      if (
        (pos.x > -50 || pos.x < 50) &&
        (pos.y < 0.5 || pos.y > 2.9 || Math.abs(pos.z) > 4)
      ) {
        lastScoredRef.current = null;
      }
    };

    const interval = setInterval(checkGoals, 16); // Check ~60fps
    return () => clearInterval(interval);
  }, [scored, leftGoals, rightGoals]);

  return (
    <>
      {/* Static ground collider */}
      <RigidBody type="fixed" position={[0, -0.1, 0]}>
        <mesh>
          <boxGeometry args={[PITCH_LENGTH + 20, 0.2, PITCH_WIDTH + 20]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* Ball physics */}
      <RigidBody
        ref={ballRigidBodyRef}
        type="dynamic"
        position={[0, 0.11, 0]}
        mass={BALL_MASS}
        linearDamping={0.05}
        angularDamping={0.1}
      >
        <mesh>
          <sphereGeometry args={[FOOTBALL_RADIUS, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
    </>
  );
}

/**
 * Physics wrapper component - use this to wrap the Experience content
 */
export function PhysicsScene({ children }: { children: React.ReactNode }) {
  return (
    <RapierPhysics gravity={[0, -9.81, 0]}>
      <PhysicsSetupImpl />
      {children}
    </RapierPhysics>
  );
}
