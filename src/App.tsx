import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { useEffect } from "react";
import { CanvasErrorBoundary } from "./scene/ErrorBoundary";
import { Experience } from "./scene/Experience";
import { useAppStore } from "./store/useAppStore";
import { HUD } from "./ui/HUD";
import { ScrollHero } from "./hero/ScrollHero";
import { SubscribeCTA } from "./ui/SubscribeCTA";

export default function App() {
  const quality = useAppStore((s) => s.quality);
  const dpr: [number, number] = quality === "low" ? [1, 1] : [1, 2];

  const {
    isAiming,
    aimPower,
    aimDirection,
    setAiming,
    setAimPower,
    setAimDirection,
    resetBall,
    isCapturingFrames,
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();

        if (!isAiming) {
          // Start aiming with space
          setAiming(true);
        }
      }

      // Arrow keys for aiming adjustment
      if (isAiming) {
        if (e.code === "ArrowUp") {
          e.preventDefault();
          setAimPower(Math.min(aimPower + 0.1, 1));
        } else if (e.code === "ArrowDown") {
          e.preventDefault();
          setAimPower(Math.max(aimPower - 0.1, 0));
        } else if (e.code === "ArrowLeft") {
          e.preventDefault();
          // Rotate aim direction counterclockwise
          const angle = Math.atan2(aimDirection.z, aimDirection.x) + 0.1;
          setAimDirection({
            x: Math.cos(angle),
            z: Math.sin(angle),
          });
        } else if (e.code === "ArrowRight") {
          e.preventDefault();
          // Rotate aim direction clockwise
          const angle = Math.atan2(aimDirection.z, aimDirection.x) - 0.1;
          setAimDirection({
            x: Math.cos(angle),
            z: Math.sin(angle),
          });
        }
      }

      // 'R' key to reset ball
      if (e.code === "KeyR") {
        e.preventDefault();
        resetBall();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && isAiming) {
        e.preventDefault();
        // Kick: will be handled by physics when aiming ends
        setAiming(false);
        setAimPower(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isAiming, aimPower, aimDirection, setAiming, setAimPower, setAimDirection, resetBall]);

  return (
    <>
      <CanvasErrorBoundary>
        <div id="live-scene-canvas">
          <Canvas
            dpr={dpr}
            shadows={quality !== "low"}
            gl={{ antialias: true, powerPreference: "high-performance" }}
          >
            <Experience />
          </Canvas>
        </div>
      </CanvasErrorBoundary>
      {!isCapturingFrames && (
        <>
          <ScrollHero />
          <div className="hud">
            <h1>Matchday Stadium</h1>
            <p>Drag to orbit · scroll to zoom the pitch</p>
          </div>
          <HUD />
          <SubscribeCTA />
        </>
      )}
      <Leva hidden={!import.meta.env.DEV} collapsed />
    </>
  );
}
