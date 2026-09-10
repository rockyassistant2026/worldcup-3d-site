import { useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";

const MAST_HEIGHT = 40;
const LAMP_COLUMNS = 4;
const LAMP_ROWS = 3;
const LAMP_SPACING = 0.7;
const LAMP_SIZE = 0.4;

type FloodlightPylonProps = {
  position: [number, number, number];
};

function FloodlightPylon({ position }: FloodlightPylonProps) {
  const [x, , z] = position;
  // Yaw that rotates local +Z to face the pitch centre at the origin.
  const yaw = Math.atan2(-x, -z);

  const lamps = useMemo(() => {
    const out: Array<{ key: string; position: [number, number, number] }> = [];
    const gridWidth = (LAMP_COLUMNS - 1) * LAMP_SPACING;
    const gridHeight = (LAMP_ROWS - 1) * LAMP_SPACING;
    for (let row = 0; row < LAMP_ROWS; row++) {
      for (let col = 0; col < LAMP_COLUMNS; col++) {
        out.push({
          key: `${row}-${col}`,
          position: [col * LAMP_SPACING - gridWidth / 2, row * LAMP_SPACING - gridHeight / 2, 0.15],
        });
      }
    }
    return out;
  }, []);

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Tapered mast */}
      <mesh position={[0, MAST_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.55, MAST_HEIGHT, 12]} />
        <meshStandardMaterial color="#7a7f87" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Truss head */}
      <mesh position={[0, MAST_HEIGHT + 0.6, 0]} castShadow>
        <boxGeometry args={[3.2, 1.2, 0.6]} />
        <meshStandardMaterial color="#4a4d52" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Lamp panel grid */}
      <group position={[0, MAST_HEIGHT + 0.6, 0]}>
        <Instances limit={lamps.length}>
          <boxGeometry args={[LAMP_SIZE, LAMP_SIZE, 0.1]} />
          <meshStandardMaterial
            color="#fffbe0"
            emissive="#fff6c8"
            emissiveIntensity={3}
            toneMapped={false}
          />
          {lamps.map((lamp) => (
            <Instance key={lamp.key} position={lamp.position} />
          ))}
        </Instances>
      </group>
    </group>
  );
}

const PYLON_POSITIONS: Array<[number, number, number]> = [
  [72, 0, 52],
  [72, 0, -52],
  [-72, 0, 52],
  [-72, 0, -52],
];

export function Floodlights() {
  return (
    <>
      {PYLON_POSITIONS.map((position) => (
        <FloodlightPylon key={position.join(",")} position={position} />
      ))}
    </>
  );
}
