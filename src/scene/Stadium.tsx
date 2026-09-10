import { useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";
import { useAppStore } from "../store/useAppStore";

const PITCH_HALF_LENGTH = 52.5;
const PITCH_HALF_WIDTH = 34;
const TRACK_DEPTH = 8;
const CONCOURSE_DEPTH = 4;

const STAND_INNER_NS = PITCH_HALF_WIDTH + TRACK_DEPTH + CONCOURSE_DEPTH; // touchline stands
const STAND_INNER_EW = PITCH_HALF_LENGTH + TRACK_DEPTH + CONCOURSE_DEPTH; // goal-line stands

const ROW_HEIGHT = 0.5;
const RISE_STEP = 0.4;
const DEPTH_STEP = 0.8;

const SEAT_COLOR_A = "#b23a2e";
const SEAT_COLOR_B = "#1f2a44";
const SEAT_BAND_SIZE = 4;

type RowInstance = {
  key: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
};

function buildStandRows(
  rows: number,
  standLength: number,
  inset: number,
  axis: "x" | "z",
  side: 1 | -1,
  keyPrefix: string,
): RowInstance[] {
  const out: RowInstance[] = [];
  for (let i = 0; i < rows; i++) {
    const forwardOffset = inset + i * DEPTH_STEP + DEPTH_STEP / 2;
    const y = i * RISE_STEP + ROW_HEIGHT / 2;
    const color = Math.floor(i / SEAT_BAND_SIZE) % 2 === 0 ? SEAT_COLOR_A : SEAT_COLOR_B;

    const position: [number, number, number] =
      axis === "z" ? [0, y, side * forwardOffset] : [side * forwardOffset, y, 0];
    const scale: [number, number, number] =
      axis === "z" ? [standLength, ROW_HEIGHT, DEPTH_STEP] : [DEPTH_STEP, ROW_HEIGHT, standLength];

    out.push({ key: `${keyPrefix}-${i}`, position, scale, color });
  }
  return out;
}

export function Stadium() {
  const quality = useAppStore((s) => s.quality);
  const rows = quality === "high" ? 32 : quality === "medium" ? 24 : 16;

  const seatRows = useMemo(() => {
    const northSouthLength = PITCH_HALF_LENGTH * 2 + 20;
    const eastWestLength = PITCH_HALF_WIDTH * 2 + 30;
    return [
      ...buildStandRows(rows, northSouthLength, STAND_INNER_NS, "z", 1, "north"),
      ...buildStandRows(rows, northSouthLength, STAND_INNER_NS, "z", -1, "south"),
      ...buildStandRows(rows, eastWestLength, STAND_INNER_EW, "x", 1, "east"),
      ...buildStandRows(rows, eastWestLength, STAND_INNER_EW, "x", -1, "west"),
    ];
  }, [rows]);

  const hoardingSegments = useMemo(() => {
    const h = 1;
    const t = 0.25;
    const gap = 0.4;
    const segs: RowInstance[] = [
      {
        key: "hoard-north",
        position: [0, h / 2, PITCH_HALF_WIDTH + gap],
        scale: [PITCH_HALF_LENGTH * 2 + t, h, t],
        color: "#0e2f57",
      },
      {
        key: "hoard-south",
        position: [0, h / 2, -(PITCH_HALF_WIDTH + gap)],
        scale: [PITCH_HALF_LENGTH * 2 + t, h, t],
        color: "#0e2f57",
      },
      {
        key: "hoard-east",
        position: [PITCH_HALF_LENGTH + gap, h / 2, 0],
        scale: [t, h, PITCH_HALF_WIDTH * 2 + t],
        color: "#0e2f57",
      },
      {
        key: "hoard-west",
        position: [-(PITCH_HALF_LENGTH + gap), h / 2, 0],
        scale: [t, h, PITCH_HALF_WIDTH * 2 + t],
        color: "#0e2f57",
      },
    ];
    return segs;
  }, []);

  const trackOuterLength = (PITCH_HALF_LENGTH + TRACK_DEPTH) * 2;
  const trackOuterWidth = (PITCH_HALF_WIDTH + TRACK_DEPTH) * 2;
  const concourseOuterLength = (PITCH_HALF_LENGTH + TRACK_DEPTH + CONCOURSE_DEPTH) * 2;
  const concourseOuterWidth = (PITCH_HALF_WIDTH + TRACK_DEPTH + CONCOURSE_DEPTH) * 2;

  return (
    <group>
      {/* Concourse ring (outermost, grey) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[concourseOuterLength, concourseOuterWidth]} />
        <meshStandardMaterial color="#3a3d42" roughness={0.95} />
      </mesh>

      {/* Running track ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[trackOuterLength, trackOuterWidth]} />
        <meshStandardMaterial color="#9c3b2e" roughness={0.9} />
      </mesh>

      {/* Perimeter advertising hoarding */}
      <Instances limit={hoardingSegments.length} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.6} metalness={0.1} />
        {hoardingSegments.map((seg) => (
          <Instance key={seg.key} position={seg.position} scale={seg.scale} color={seg.color} />
        ))}
      </Instances>

      {/* Tiered seating, instanced per row across all four stands */}
      <Instances limit={seatRows.length} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.8} metalness={0} />
        {seatRows.map((row) => (
          <Instance key={row.key} position={row.position} scale={row.scale} color={row.color} />
        ))}
      </Instances>
    </group>
  );
}
