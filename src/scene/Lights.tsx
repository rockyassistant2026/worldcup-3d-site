import { useAppStore } from "../store/useAppStore";

const CORNER_LIGHTS: Array<[number, number, number]> = [
  [-70, 38, -50],
  [70, 38, -50],
  [-70, 38, 50],
];

export function Lights() {
  const quality = useAppStore((s) => s.quality);
  const shadowsEnabled = quality !== "low";
  const shadowSize = quality === "high" ? 2048 : quality === "medium" ? 1024 : 0;

  return (
    <>
      <hemisphereLight args={["#8fb6ff", "#1a2b1a", 0.5]} />
      <ambientLight intensity={0.12} />

      {/* Dominant floodlight, high above one corner, casts the primary pitch shadow */}
      <directionalLight
        position={[70, 42, 50]}
        intensity={2.2}
        color="#fff6da"
        castShadow={shadowsEnabled}
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-camera-near={1}
        shadow-camera-far={250}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />

      {/* Cheaper fill lights from the other three pylons, no shadow casting */}
      {CORNER_LIGHTS.map((position) => (
        <directionalLight
          key={position.join(",")}
          position={position}
          intensity={0.9}
          color="#fff6da"
          castShadow={false}
        />
      ))}
    </>
  );
}
