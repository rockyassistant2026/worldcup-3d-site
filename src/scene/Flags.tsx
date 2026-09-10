import { useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import {
  ShaderMaterial,
  InstancedMesh,
  Object3D,
} from "three";
import { useAppStore } from "../store/useAppStore";
import { badgeTextureCache } from "../data/badgeTextures";
import { TEAMS } from "../data/teams";
import wavingVertShader from "./waving-flag.vert?raw";
import wavingFragShader from "./waving-flag.frag?raw";

/**
 * National flags on poles positioned around the stadium perimeter.
 * OPTIMIZED: Uses InstancedMesh for poles to reduce draw calls from 24+ to ~3.
 * On medium/high quality: shader-driven waving animation with badge textures.
 * On low quality: static flags with simpler rendering.
 */

interface FlagConfig {
  position: [number, number, number];
  rotation: [number, number, number];
  teamCode: string; // 3-letter ISO code
  label: string;
}

// Map 8 stadium flag positions to team codes
const FLAG_POSITIONS: FlagConfig[] = [
  { position: [60, 0, 45], rotation: [0, -Math.PI / 4, 0], teamCode: "ARG", label: "Flag1" },
  { position: [-60, 0, 45], rotation: [0, Math.PI / 4, 0], teamCode: "BRA", label: "Flag2" },
  { position: [-60, 0, -45], rotation: [0, -Math.PI / 4, 0], teamCode: "FRA", label: "Flag3" },
  { position: [60, 0, -45], rotation: [0, Math.PI / 4, 0], teamCode: "DEU", label: "Flag4" },
  { position: [0, 0, 55], rotation: [0, 0, 0], teamCode: "ESP", label: "Flag5" },
  { position: [0, 0, -55], rotation: [0, Math.PI, 0], teamCode: "ITA", label: "Flag6" },
  { position: [70, 0, 0], rotation: [0, -Math.PI / 2, 0], teamCode: "NLD", label: "Flag7" },
  { position: [-70, 0, 0], rotation: [0, Math.PI / 2, 0], teamCode: "ENG", label: "Flag8" },
];

export function Flags() {
  const gl = useThree((s) => s.gl);
  const quality = useAppStore((s) => s.quality);
  const polesInstancedRef = useRef<InstancedMesh>(null);
  const basesInstancedRef = useRef<InstancedMesh>(null);
  const shaderMaterialRef = useRef<ShaderMaterial>(null);
  const poleHeight = 8;

  // Instance matrices for poles and bases (reused across all flags)
  const poleMatrices = useMemo(() => {
    const dummy = new Object3D();
    const matrices = FLAG_POSITIONS.map((config) => {
      dummy.position.set(config.position[0], config.position[1] + poleHeight / 2, config.position[2]);
      dummy.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      return dummy.matrix.clone();
    });
    return matrices;
  }, []);

  const baseMatrices = useMemo(() => {
    const dummy = new Object3D();
    const matrices = FLAG_POSITIONS.map((config) => {
      dummy.position.set(config.position[0], config.position[1] - 0.2, config.position[2]);
      dummy.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      return dummy.matrix.clone();
    });
    return matrices;
  }, []);

  // Initialize instanced matrices on mount
  useMemo(() => {
    if (polesInstancedRef.current) {
      poleMatrices.forEach((matrix, i) => {
        polesInstancedRef.current!.setMatrixAt(i, matrix);
      });
      polesInstancedRef.current.instanceMatrix.needsUpdate = true;
    }
    if (basesInstancedRef.current) {
      baseMatrices.forEach((matrix, i) => {
        basesInstancedRef.current!.setMatrixAt(i, matrix);
      });
      basesInstancedRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [poleMatrices, baseMatrices]);

  // Shader material for flag planes on medium/high quality
  const shaderMaterial = useMemo(() => {
    if (quality === "low") return null;

    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWaveStrength: { value: 0.15 },
        uWaveFrequency: { value: 3.0 },
      },
      vertexShader: wavingVertShader,
      fragmentShader: wavingFragShader,
      transparent: true,
      side: 2, // THREE.DoubleSide
    });
  }, [quality]);

  // Update shader time uniformly across all flags
  useFrame(() => {
    if (shaderMaterialRef.current && quality !== "low") {
      shaderMaterialRef.current.uniforms.uTime.value += 0.016; // ~60fps
    }
  });

  if (quality === "low") {
    // Low quality: instanced poles and bases only
    return (
      <group>
        {/* Instanced poles */}
        <instancedMesh
          ref={polesInstancedRef}
          args={[undefined, undefined, FLAG_POSITIONS.length]}
          castShadow
        >
          <cylinderGeometry args={[0.12, 0.15, poleHeight, 16]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.8} metalness={0.2} />
        </instancedMesh>

        {/* Instanced bases */}
        <instancedMesh
          ref={basesInstancedRef}
          args={[undefined, undefined, FLAG_POSITIONS.length]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1, 0.4, 1]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.9} metalness={0} />
        </instancedMesh>

        {/* Static flag planes without texture for low quality */}
        {FLAG_POSITIONS.map((config) => (
          <mesh
            key={`flag-low-${config.label}`}
            position={[
              config.position[0] + Math.cos(config.rotation[1]) * 1.2,
              config.position[1] + poleHeight - 0.4,
              config.position[2] + Math.sin(config.rotation[1]) * 1.2,
            ]}
            receiveShadow
          >
            <planeGeometry args={[3, 2]} />
            <meshStandardMaterial color="#cccccc" roughness={0.7} metalness={0} side={2} />
          </mesh>
        ))}
      </group>
    );
  }

  // Medium/High quality: instanced poles/bases + individual shader flag planes
  return (
    <group>
      {/* Instanced poles */}
      <instancedMesh
        ref={polesInstancedRef}
        args={[undefined, undefined, FLAG_POSITIONS.length]}
        castShadow
      >
        <cylinderGeometry args={[0.12, 0.15, poleHeight, 16]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.8} metalness={0.2} />
      </instancedMesh>

      {/* Instanced bases */}
      <instancedMesh
        ref={basesInstancedRef}
        args={[undefined, undefined, FLAG_POSITIONS.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 0.4, 1]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} metalness={0} />
      </instancedMesh>

      {/* Individual shader-driven flag planes (one draw call per plane, but unified shader time) */}
      {FLAG_POSITIONS.map((config) => {
        const team = TEAMS.find((t) => t.code === config.teamCode);
        const teamColors = team?.colors || ["#CCCCCC", "#FFFFFF"];
        const flagTexture = badgeTextureCache.getOrCreate(
          config.teamCode,
          teamColors[0],
          teamColors[1]
        );
        flagTexture.anisotropy = gl.capabilities.getMaxAnisotropy();

        return (
          <mesh
            key={`flag-high-${config.label}`}
            position={[
              config.position[0] + Math.cos(config.rotation[1]) * 1.2,
              config.position[1] + poleHeight - 0.4,
              config.position[2] + Math.sin(config.rotation[1]) * 1.2,
            ]}
            rotation={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <planeGeometry args={[3, 2]} />
            <shaderMaterial
              ref={shaderMaterialRef}
              uniforms={{
                ...shaderMaterial!.uniforms,
                uTexture: { value: flagTexture },
              }}
              vertexShader={wavingVertShader}
              fragmentShader={wavingFragShader}
              transparent
              side={2}
            />
          </mesh>
        );
      })}
    </group>
  );
}
