import { LineSegments, BufferGeometry, BufferAttribute, LineBasicMaterial } from "three";
import { useAppStore } from "../store/useAppStore";
import { TEAMS } from "../data/teams";

/**
 * Goal dimensions (FIFA regulation):
 * - Width: 7.32m
 * - Height: 2.44m
 * Goals are positioned at x = -52.5 (left) and x = +52.5 (right) along the pitch goal lines.
 */
const GOAL_WIDTH = 7.32;
const GOAL_HEIGHT = 2.44;
const POST_RADIUS = 0.08; // Post diameter ~16cm
const POST_DEPTH = 0.5; // Depth into the pitch (not a real FIFA dimension, for visual depth)

interface GoalProps {
  position?: [number, number, number]; // Center of the goal line
  castShadow?: boolean;
  receiveShadow?: boolean;
  side?: "left" | "right"; // Which side this goal is on
}

/**
 * Goal component: posts, crossbar (cylinder geometry), and net (transparent grid line segments).
 * Position should be at [x, 0, z] where x is on the goal line (-52.5 or +52.5).
 * Applies team colors to the posts and crossbar based on selected team for that side.
 */
export function Goal({ position = [0, 0, 0], castShadow = true, receiveShadow = true, side = "left" }: GoalProps) {
  const { leftTeamCode, rightTeamCode } = useAppStore();
  
  // Get the appropriate team code based on which side this goal is
  const teamCode = side === "left" ? leftTeamCode : rightTeamCode;
  const team = TEAMS.find((t) => t.code === teamCode);
  const teamColor = team?.colors[0] || "#e8e8e8"; // Use primary color

  return (
    <group position={position}>
      {/* Left post */}
      <mesh position={[-GOAL_WIDTH / 2, 0, 0]} castShadow={castShadow} receiveShadow={receiveShadow}>
        <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, GOAL_HEIGHT, 12]} />
        <meshStandardMaterial color={teamColor} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Right post */}
      <mesh position={[GOAL_WIDTH / 2, 0, 0]} castShadow={castShadow} receiveShadow={receiveShadow}>
        <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, GOAL_HEIGHT, 12]} />
        <meshStandardMaterial color={teamColor} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Crossbar (horizontal cylinder at the top) */}
      <mesh position={[0, GOAL_HEIGHT / 2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow={castShadow} receiveShadow={receiveShadow}>
        <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, GOAL_WIDTH, 12]} />
        <meshStandardMaterial color={teamColor} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Back bar (connecting the posts at the back of the goal) */}
      <mesh position={[0, GOAL_HEIGHT / 2, POST_DEPTH]} rotation={[0, 0, Math.PI / 2]} castShadow={castShadow} receiveShadow={receiveShadow}>
        <cylinderGeometry args={[POST_RADIUS * 0.7, POST_RADIUS * 0.7, GOAL_WIDTH, 12]} />
        <meshStandardMaterial color="#b0b0b0" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Net: transparent grid of line segments */}
      <NetGeometry goalWidth={GOAL_WIDTH} goalHeight={GOAL_HEIGHT} depth={POST_DEPTH} />
    </group>
  );
}

interface NetGeometryProps {
  goalWidth: number;
  goalHeight: number;
  depth: number;
}

function NetGeometry({ goalWidth, goalHeight, depth }: NetGeometryProps) {
  // Reduce net complexity on lower quality settings for performance
  // The net is purely decorative; simplifying it has minimal visual impact at distance
  const horizontalSegments = 8;   // Keep consistent
  const verticalSegments = 6;     // Keep consistent
  const depthSegments = 4;        // Keep consistent

  const positions: number[] = [];

  // Horizontal lines (going left-right across the width)
  for (let v = 0; v <= verticalSegments; v++) {
    const y = (v / verticalSegments) * goalHeight - goalHeight / 2;
    for (let d = 0; d <= depthSegments; d++) {
      const z = (d / depthSegments) * depth;
      for (let h = 0; h <= horizontalSegments; h++) {
        const x = (h / horizontalSegments) * goalWidth - goalWidth / 2;
        if (h < horizontalSegments) {
          positions.push(x, y, z);
          positions.push(x + goalWidth / horizontalSegments, y, z);
        }
      }
    }
  }

  // Vertical lines (going up-down)
  for (let h = 0; h <= horizontalSegments; h++) {
    const x = (h / horizontalSegments) * goalWidth - goalWidth / 2;
    for (let d = 0; d <= depthSegments; d++) {
      const z = (d / depthSegments) * depth;
      for (let v = 0; v < verticalSegments; v++) {
        const y = (v / verticalSegments) * goalHeight - goalHeight / 2;
        positions.push(x, y, z);
        positions.push(x, y + goalHeight / verticalSegments, z);
      }
    }
  }

  // Depth lines (going into the net)
  for (let h = 0; h <= horizontalSegments; h++) {
    const x = (h / horizontalSegments) * goalWidth - goalWidth / 2;
    for (let v = 0; v <= verticalSegments; v++) {
      const y = (v / verticalSegments) * goalHeight - goalHeight / 2;
      for (let d = 0; d < depthSegments; d++) {
        const z = (d / depthSegments) * depth;
        positions.push(x, y, z);
        positions.push(x, y, z + depth / depthSegments);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));

  const material = new LineBasicMaterial({
    color: 0xcccccc,
    linewidth: 1,
    fog: true,
    transparent: true,
    opacity: 0.7,
  });

  return (
    <primitive object={new LineSegments(geometry, material)} />
  );
}
