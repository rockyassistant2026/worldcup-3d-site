import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace } from "three";
import { useAppStore } from "../store/useAppStore";

/**
 * Pitch orientation (shared contract with the goal/football components):
 * - Length (105m, goal-line to goal-line) runs along world X, from x=-52.5 to x=+52.5.
 * - Width (68m, touchline to touchline) runs along world Z, from z=-34 to z=+34.
 * - Top surface sits at y = 0.
 * - Goals belong on the goal lines at x = -52.5 and x = +52.5.
 */

const PITCH_LENGTH = 105;
const PITCH_WIDTH = 68;
const LINE_WIDTH_M = 0.12;
const CENTRE_CIRCLE_RADIUS = 9.15;
const PENALTY_AREA_WIDTH = 40.32;
const PENALTY_AREA_DEPTH = 16.5;
const GOAL_AREA_WIDTH = 18.32;
const GOAL_AREA_DEPTH = 5.5;
const PENALTY_SPOT_DISTANCE = 11;
const CORNER_ARC_RADIUS = 1;

function normalizeAngle(angle: number): number {
  const twoPi = Math.PI * 2;
  let a = angle % twoPi;
  if (a < 0) a += twoPi;
  return a;
}

/** Strokes the arc of a circle that passes through the
 * angle nearest `midPx`, between the angles toward `p1Px` and `p2Px`. Used for penalty arcs
 * and corner arcs where only a portion of a circle should be drawn. */
function strokeArcThroughMidpoint(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  mid: { x: number; y: number },
) {
  const a1 = normalizeAngle(Math.atan2(p1.y - cy, p1.x - cx));
  const a2 = normalizeAngle(Math.atan2(p2.y - cy, p2.x - cx));
  const aMid = normalizeAngle(Math.atan2(mid.y - cy, mid.x - cx));

  const end = a2 <= a1 ? a2 + Math.PI * 2 : a2;
  const midAdj = aMid < a1 ? aMid + Math.PI * 2 : aMid;
  const includesMid = midAdj >= a1 && midAdj <= end;

  ctx.beginPath();
  if (includesMid) {
    ctx.arc(cx, cy, r, a1, end, false);
  } else {
    const start = a1 <= a2 ? a1 + Math.PI * 2 : a1;
    ctx.arc(cx, cy, r, a2, start, false);
  }
  ctx.stroke();
}

function drawPitchTexture(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const scale = width / PITCH_LENGTH;

  const toPxX = (x: number) => (x + PITCH_LENGTH / 2) * scale;
  const toPxY = (z: number) => (z + PITCH_WIDTH / 2) * scale;

  // --- Mowing stripes (base grass) ---
  const stripeWidthM = 5;
  const stripeCount = Math.round(PITCH_LENGTH / stripeWidthM);
  const colorA = "#2f8f3d";
  const colorB = "#2a7f36";
  for (let i = 0; i < stripeCount; i++) {
    const xStart = -PITCH_LENGTH / 2 + i * stripeWidthM;
    ctx.fillStyle = i % 2 === 0 ? colorA : colorB;
    ctx.fillRect(toPxX(xStart), 0, stripeWidthM * scale, height);
  }

  // subtle vignette for lighting variation
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    height * 0.1,
    width / 2,
    height / 2,
    width * 0.7,
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // --- Line markings ---
  const lineWidthPx = Math.max(2, LINE_WIDTH_M * scale);
  ctx.strokeStyle = "#f5f5f5";
  ctx.fillStyle = "#f5f5f5";
  ctx.lineWidth = lineWidthPx;

  const drawRectWorld = (xMin: number, xMax: number, zMin: number, zMax: number) => {
    const x = toPxX(xMin);
    const y = toPxY(zMin);
    const w = toPxX(xMax) - x;
    const h = toPxY(zMax) - y;
    ctx.strokeRect(x, y, w, h);
  };

  // Outer boundary (touchlines + goal lines), inset half a line-width so the stroke stays on-canvas
  const halfLine = lineWidthPx / 2;
  ctx.strokeRect(halfLine, halfLine, width - lineWidthPx, height - lineWidthPx);

  // Halfway line
  ctx.beginPath();
  ctx.moveTo(toPxX(0), toPxY(-PITCH_WIDTH / 2));
  ctx.lineTo(toPxX(0), toPxY(PITCH_WIDTH / 2));
  ctx.stroke();

  // Centre circle + spot
  ctx.beginPath();
  ctx.arc(toPxX(0), toPxY(0), CENTRE_CIRCLE_RADIUS * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(toPxX(0), toPxY(0), 0.15 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Corner arcs (radius 1m), one per corner, quarter-circle facing the pitch interior
  const corners: Array<{ x: number; z: number }> = [
    { x: -PITCH_LENGTH / 2, z: -PITCH_WIDTH / 2 },
    { x: -PITCH_LENGTH / 2, z: PITCH_WIDTH / 2 },
    { x: PITCH_LENGTH / 2, z: -PITCH_WIDTH / 2 },
    { x: PITCH_LENGTH / 2, z: PITCH_WIDTH / 2 },
  ];
  for (const corner of corners) {
    const signX = corner.x > 0 ? -1 : 1;
    const signZ = corner.z > 0 ? -1 : 1;
    const cx = toPxX(corner.x);
    const cy = toPxY(corner.z);
    const r = CORNER_ARC_RADIUS * scale;
    const p1 = { x: toPxX(corner.x + signX * CORNER_ARC_RADIUS), y: cy };
    const p2 = { x: cx, y: toPxY(corner.z + signZ * CORNER_ARC_RADIUS) };
    const mid = {
      x: toPxX(corner.x + signX * CORNER_ARC_RADIUS * 0.7071),
      y: toPxY(corner.z + signZ * CORNER_ARC_RADIUS * 0.7071),
    };
    strokeArcThroughMidpoint(ctx, cx, cy, r, p1, p2, mid);
  }

  // Per-end markings (goal line at x = +/- 52.5)
  for (const endSign of [1, -1] as const) {
    const goalLineX = endSign * (PITCH_LENGTH / 2);
    const inward = -endSign; // direction from the goal line toward the pitch centre

    // Penalty area
    const penaltyFrontX = goalLineX + inward * PENALTY_AREA_DEPTH;
    drawRectWorld(
      Math.min(goalLineX, penaltyFrontX),
      Math.max(goalLineX, penaltyFrontX),
      -PENALTY_AREA_WIDTH / 2,
      PENALTY_AREA_WIDTH / 2,
    );

    // Goal area
    const goalAreaFrontX = goalLineX + inward * GOAL_AREA_DEPTH;
    drawRectWorld(
      Math.min(goalLineX, goalAreaFrontX),
      Math.max(goalLineX, goalAreaFrontX),
      -GOAL_AREA_WIDTH / 2,
      GOAL_AREA_WIDTH / 2,
    );

    // Penalty spot
    const spotX = goalLineX + inward * PENALTY_SPOT_DISTANCE;
    ctx.beginPath();
    ctx.arc(toPxX(spotX), toPxY(0), 0.15 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Penalty arc: the portion of the 9.15m circle around the penalty spot that lies
    // outside the penalty area (clipped at the penalty area's front edge).
    const cx = toPxX(spotX);
    const cy = toPxY(0);
    const r = CENTRE_CIRCLE_RADIUS * scale;
    const dxToFront = penaltyFrontX - spotX; // signed distance from spot to box edge along X
    const halfChord = Math.sqrt(Math.max(CENTRE_CIRCLE_RADIUS ** 2 - dxToFront ** 2, 0));
    const p1 = { x: toPxX(penaltyFrontX), y: toPxY(halfChord) };
    const p2 = { x: toPxX(penaltyFrontX), y: toPxY(-halfChord) };
    const bulgeX = spotX + inward * CENTRE_CIRCLE_RADIUS;
    const mid = { x: toPxX(bulgeX), y: cy };
    strokeArcThroughMidpoint(ctx, cx, cy, r, p1, p2, mid);
  }
}

export function Pitch() {
  const quality = useAppStore((s) => s.quality);
  const gl = useThree((s) => s.gl);

  const canvasWidth = quality === "high" ? 4096 : quality === "medium" ? 2048 : 1024;
  const canvasHeight = Math.round(canvasWidth * (PITCH_WIDTH / PITCH_LENGTH));

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    drawPitchTexture(canvas);

    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = gl.capabilities.getMaxAnisotropy();
    tex.needsUpdate = true;
    return tex;
    // Depend on quality change (which determines canvasWidth/Height)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, gl.capabilities]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[PITCH_LENGTH, PITCH_WIDTH]} />
      <meshStandardMaterial map={texture} roughness={0.85} metalness={0} />
    </mesh>
  );
}
