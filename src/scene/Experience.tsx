import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { ACESFilmicToneMapping, PCFSoftShadowMap } from "three";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Lights } from "./Lights";
import { Pitch } from "./Pitch";
import { Stadium } from "./Stadium";
import { Floodlights } from "./Floodlights";
import { Football } from "./Football";
import { Goal } from "./Goal";
import { PostProcessing } from "./PostProcessing";
import { PhysicsScene } from "./Physics";
import { Trophy } from "./Trophy";
import { Flags } from "./Flags";
import { Confetti } from "./Confetti";
import { AdvertisingBanners } from "./Banners";
import { RunningPlayers } from "./RunningPlayers";
import { useAppStore } from "../store/useAppStore";
import { getHeroCameraPath } from "./HeroIntro";

function RendererSetup() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.shadowMap.type = PCFSoftShadowMap;
  }, [gl]);
  return null;
}

// Separate component to handle the render loop and capture
function CaptureController() {
  const camera = useThree((s) => s.camera);
  const orbitControlsRef = useRef<any>(null);

  // Expose capture functions through window. Hiding the HUD/hero overlay is
  // driven by the isCapturingFrames store flag (read declaratively in
  // App.tsx), set ONCE for the whole capture session here and cleared ONCE
  // by __endCapture — not toggled per-frame, which previously raced with the
  // capture script's own screenshot timing (the overlay was restored before
  // the caller ever got control back to take its screenshot).
  useEffect(() => {
    (window as any).__setCaptureProgress = (progress: number) => {
      return new Promise<void>((resolve) => {
        if (!camera) {
          console.error('❌ Camera not available');
          resolve();
          return;
        }

        if (!useAppStore.getState().isCapturingFrames) {
          useAppStore.getState().setCapturingFrames(true);
        }

        const cameraState = getHeroCameraPath(progress);
        console.log(`📹 Applying camera state for progress ${progress.toFixed(3)}`);

        // Disable OrbitControls
        if (orbitControlsRef?.current) {
          orbitControlsRef.current.enabled = false;
        }

        // Set camera position and lookAt
        const oldPos = [camera.position.x, camera.position.y, camera.position.z];

        camera.position.set(
          cameraState.position[0],
          cameraState.position[1],
          cameraState.position[2]
        );
        camera.lookAt(
          cameraState.lookAt[0],
          cameraState.lookAt[1],
          cameraState.lookAt[2]
        );
        camera.updateProjectionMatrix();

        console.log(`  Moved from [${oldPos}] to [${cameraState.position}]`);

        // Request render and wait
        let frameCount = 0;
        const checkFrame = () => {
          frameCount++;
          if (frameCount < 2) {
            requestAnimationFrame(checkFrame);
          } else {
            window.__frameReady = true;
            console.log(`🎬 Frame ${progress.toFixed(3)} ready for capture`);
            resolve();
          }
        };

        requestAnimationFrame(checkFrame);
      });
    };

    (window as any).__endCapture = () => {
      window.__frameReady = false;
      useAppStore.getState().setCapturingFrames(false);
    };
  }, [camera]);

  return null;
}

export function Experience() {
  const quality = useAppStore((s) => s.quality);
  const environmentIntensity = quality === "low" ? 0.25 : quality === "medium" ? 0.4 : 0.6;

  const cameraRef = useRef<any>(null);
  const orbitControlsRef = useRef<any>(null);

  return (
    <PhysicsScene>
      <RendererSetup />
      <CaptureController />
      <color attach="background" args={["#04070d"]} />

      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 62, 132]}
        fov={38}
        near={0.5}
        far={1000}
      />
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enableDamping
        target={[0, 0, 0]}
        minDistance={25}
        maxDistance={220}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enablePan={false}
      />

      <Lights />
      <Environment preset="sunset" environmentIntensity={environmentIntensity} />
      <PostProcessing />

      <Pitch />
      <Stadium />
      <Floodlights />
      <Trophy />
      <Flags />
      <Confetti />
      <AdvertisingBanners />
      <RunningPlayers />

      <Football position={[0, 0.11, 0]} />

      {/* Left goal at x = -52.5 */}
      <Goal position={[-52.5, 0, 0]} side="left" />

      {/* Right goal at x = +52.5 */}
      <Goal position={[52.5, 0, 0]} side="right" />
    </PhysicsScene>
  );
}
