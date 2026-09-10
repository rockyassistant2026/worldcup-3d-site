import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace, Vector3, Mesh, PerspectiveCamera } from "three";
import { useAppStore } from "../store/useAppStore";

const FOOTBALL_DIAMETER = 0.22; // meters
const FOOTBALL_RADIUS = FOOTBALL_DIAMETER / 2;

/**
 * Draws a 32-panel football (soccer ball) texture with classic black and white pentagon/hexagon pattern.
 * Uses a canvas-based approach to generate the texture.
 */
function drawFootballTexture(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Fill with white background (for the hexagon panels)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Draw the classic football pattern: 12 pentagons (black) and 20 hexagons (white)
  // Using a UV sphere projection approximation with simple geometric patterns
  const centerX = width / 2;
  const centerY = height / 2;
  const sphereRadius = Math.min(width, height) / 2.2;

  // Draw black pentagons at regular intervals
  // 12 pentagons arranged in an icosahedron-like pattern
  const penagonPositions = [
    // Top pentagon
    [0, 0.1],
    // Upper ring (5 pentagons)
    [0.309, 0.245],
    [0.809, 0.245],
    [-0.309, 0.245],
    [-0.809, 0.245],
    [0, 0.245],
    // Bottom ring (5 pentagons)
    [0.309, 0.755],
    [0.809, 0.755],
    [-0.309, 0.755],
    [-0.809, 0.755],
    [0, 0.755],
    // Bottom pentagon
    [0, 0.9],
  ] as const;

  ctx.fillStyle = "#000000";
  const penRadius = sphereRadius * 0.08;

  for (const [normX, normY] of penagonPositions) {
    const x = centerX + normX * sphereRadius * 1.2;
    const y = centerY + normY * sphereRadius * 1.2;

    // Draw regular pentagon
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const px = x + penRadius * Math.cos(angle);
      const py = y + penRadius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  // Add some additional black patches to achieve the 32-panel look
  // Black hexagons/patches strategically placed
  const patchPositions = [
    [0.5, 0.5],
    [0.2, 0.3],
    [0.8, 0.3],
    [0.35, 0.7],
    [0.65, 0.7],
    [0.15, 0.5],
    [0.85, 0.5],
  ] as const;

  ctx.fillStyle = "#000000";
  const patchRadius = sphereRadius * 0.04;

  for (const [normX, normY] of patchPositions) {
    const x = centerX + (normX - 0.5) * sphereRadius * 1.5;
    const y = centerY + (normY - 0.5) * sphereRadius * 1.5;
    ctx.beginPath();
    ctx.arc(x, y, patchRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

interface FootballProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/**
 * Ball material: PBR with slight clearcoat sheen for a realistic leather-like appearance.
 * Uses MeshPhysicalMaterial for advanced PBR features.
 * 
 * This component handles:
 * - Rendering the ball mesh
 * - Click-drag aiming interaction
 * - Visual position sync from physics (via Zustand store)
 */
export function Football({
  position = [0, 0.11, 0],
  rotation = [0, 0, 0],
  castShadow = true,
  receiveShadow = true,
}: FootballProps) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const quality = useAppStore((s) => s.quality);

  const meshRef = useRef<Mesh>(null);
  const pointerStartRef = useRef<{ x: number; y: number; worldPos: Vector3 } | null>(null);
  // Reusable vectors for aim calculations (avoid per-frame allocations)
  const forwardRef = useRef(new Vector3());
  const rightRef = useRef(new Vector3());
  const aimDirRef = useRef(new Vector3());

  const {
    setAiming,
    setAimPower,
    setAimDirection,
    isAiming,
    ballPosition,
  } = useAppStore();

  // Sphere resolution based on quality (high: 32x32, medium: 24x24, low: 16x16)
  const sphereResolution = quality === "high" ? 32 : quality === "medium" ? 24 : 16;

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    drawFootballTexture(canvas);

    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = gl.capabilities.getMaxAnisotropy();
    tex.needsUpdate = true;
    return tex;
  }, [gl]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  // Update mesh position from store (physics-driven)
  // Mutation only, no allocation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(ballPosition[0], ballPosition[1], ballPosition[2]);
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    setAiming(true);
    
    if (meshRef.current) {
      const worldPos = meshRef.current.getWorldPosition(new Vector3());
      pointerStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        worldPos,
      };
    }
    
    e.stopPropagation();
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isAiming || !pointerStartRef.current) {
      return;
    }

    const deltaX = e.clientX - pointerStartRef.current.x;
    const deltaY = e.clientY - pointerStartRef.current.y;
    const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Power: 0-1 based on drag distance (max 200px = 1.0 power)
    const power = Math.min(dragDistance / 200, 1.0);
    setAimPower(power);

    // Direction: screen-space drag to world direction (reuse vectors)
    const camera_ = camera as PerspectiveCamera;
    forwardRef.current.set(0, 0, -1).applyQuaternion(camera_.quaternion);
    rightRef.current.set(1, 0, 0).applyQuaternion(camera_.quaternion);
    
    // Project to XZ plane
    forwardRef.current.y = 0;
    forwardRef.current.normalize();
    rightRef.current.y = 0;
    rightRef.current.normalize();

    // Combine: right drag adds to right direction, down drag adds to forward
    // Reuse aimDir vector instead of allocating new one
    aimDirRef.current.copy(rightRef.current).multiplyScalar(deltaX / 200);
    aimDirRef.current.addScaledVector(forwardRef.current, -deltaY / 200);
    aimDirRef.current.normalize();

    setAimDirection({
      x: aimDirRef.current.x,
      z: aimDirRef.current.z,
    });

    e.stopPropagation();
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isAiming) return;

    // The actual kick impulse will be applied by PhysicsSetup
    // which uses the Rapier rigid body directly. This component
    // just handles the UI state.

    setAiming(false);
    setAimPower(0);
    pointerStartRef.current = null;
    e.stopPropagation();
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <sphereGeometry args={[FOOTBALL_RADIUS, sphereResolution, sphereResolution]} />
      <meshPhysicalMaterial
        map={texture}
        roughness={0.35}
        metalness={0.0}
        clearcoat={0.5}
        clearcoatRoughness={0.08}
        reflectivity={0.6}
      />
    </mesh>
  );
}
