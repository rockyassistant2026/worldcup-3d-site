import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, LatheGeometry, Vector2 } from "three";

/**
 * Trophy centerpiece: a stylized gold trophy composed of a lathe-based cup form,
 * stem, and base. Placed at the halfway line with a subtle rotation and spotlight.
 */

function TrophyMesh() {
  // Create a lathe-based trophy shape
  // The profile is rotated around the Y axis to form the 3D shape
  const points: Vector2[] = [
    // Base (wide)
    new Vector2(0.6, 0),
    new Vector2(0.6, 0.3),
    // Stem (narrow)
    new Vector2(0.15, 0.5),
    new Vector2(0.15, 1.2),
    // Cup bowl (curves outward)
    new Vector2(0.3, 1.4),
    new Vector2(0.5, 1.6),
    new Vector2(0.6, 1.85),
    // Top (narrow rim)
    new Vector2(0.45, 2.0),
    new Vector2(0.4, 2.1),
  ];

  // Adjust points to center vertically
  points.forEach((p) => {
    p.y -= 1.05;
  });

  const geometry = new LatheGeometry(
    points,
    32,
    0,
    Math.PI * 2,
  );

  return (
    <mesh geometry={geometry} position={[0, 0.2, 0]} castShadow receiveShadow>
      <meshStandardMaterial
        color="#ffd700"
        roughness={0.3}
        metalness={0.8}
        emissive="#ffaa00"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function TrophyPedestal() {
  return (
    <group>
      {/* Main pedestal block */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.4, 1.2]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Pedestal detailing: black marble look with subtle relief */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.1, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}

export function Trophy() {
  const groupRef = useRef<Group>(null);

  // Subtle continuous rotation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group position={[0, 0, 0]} ref={groupRef}>
      <TrophyMesh />
      <TrophyPedestal />

      {/* Spotlight on trophy */}
      <pointLight
        position={[0, 3, 0]}
        intensity={2}
        distance={15}
        color="#ffeecc"
        castShadow
      />

      {/* Ambient light to softly illuminate from above */}
      <pointLight
        position={[2, 2.5, 2]}
        intensity={1}
        distance={12}
        color="#ffffff"
      />
    </group>
  );
}
