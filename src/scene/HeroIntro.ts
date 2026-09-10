import { Vector3 } from 'three';

// Define keyframe points for the camera journey
const KEYFRAMES = [
  // 0.0: Close orbit around trophy
  { progress: 0.0, position: new Vector3(20, 40, 20), lookAt: new Vector3(0, 35, 0) },
  // 0.2: Still on trophy, orbit slightly different angle
  { progress: 0.2, position: new Vector3(-25, 35, 15), lookAt: new Vector3(0, 32, 0) },
  // 0.4: Start pulling back, see more of stadium
  { progress: 0.4, position: new Vector3(0, 60, 100), lookAt: new Vector3(0, 30, 0) },
  // 0.6: Full stadium + flags visible
  { progress: 0.6, position: new Vector3(50, 80, 120), lookAt: new Vector3(0, 25, -10) },
  // 0.75: Begin sweep down to match camera
  { progress: 0.75, position: new Vector3(30, 70, 100), lookAt: new Vector3(0, 15, 0) },
  // 1.0: Settle on live game camera position (from Experience.tsx)
  { progress: 1.0, position: new Vector3(0, 62, 132), lookAt: new Vector3(0, 0, 0) },
];

interface CameraState {
  position: [number, number, number];
  lookAt: [number, number, number];
}

/**
 * Get camera position and lookAt point for a given progress value (0..1)
 * Uses CatmullRomCurve3 for smooth interpolation between keyframes
 */
export function getHeroCameraPath(progress: number): CameraState {
  // Clamp progress to 0..1
  const t = Math.max(0, Math.min(1, progress));

  // Find the two surrounding keyframes
  let keyframeIndex = 0;
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (t >= KEYFRAMES[i].progress && t <= KEYFRAMES[i + 1].progress) {
      keyframeIndex = i;
      break;
    }
  }

  const kf1 = KEYFRAMES[keyframeIndex];
  const kf2 = KEYFRAMES[keyframeIndex + 1];

  // Compute local interpolation value (0..1 within this segment)
  const segmentRange = kf2.progress - kf1.progress;
  const localT = (t - kf1.progress) / segmentRange;

  // Use cubic easing for smooth motion
  const easedT = localT < 0.5 
    ? 2 * localT * localT 
    : 1 - Math.pow(-2 * localT + 2, 2) / 2;

  // Interpolate position and lookAt
  const pos = kf1.position.clone().lerp(kf2.position, easedT);
  const look = kf1.lookAt.clone().lerp(kf2.lookAt, easedT);

  return {
    position: [pos.x, pos.y, pos.z],
    lookAt: [look.x, look.y, look.z],
  };
}

/**
 * Setup hero capture mode for Playwright frame capture
 * Returns an object with isCapturing flag
 */
export function setupHeroCapture(cameraRef: any, orbitControlsRef: any) {
  const params = new URLSearchParams(window.location.search);
  const captureFrameParam = params.get('captureFrame');
  const isCapturing = captureFrameParam !== null;

  if (isCapturing) {
    const progress = parseFloat(captureFrameParam || '0');
    applyCameraState(cameraRef, orbitControlsRef, progress);
  }

  // Expose window.__setCaptureProgress for single-load capture approach
  if (isCapturing || true) {
    (window as any).__setCaptureProgress = (progress: number) => {
      return new Promise<void>((resolve) => {
        // Apply camera state
        applyCameraState(cameraRef, orbitControlsRef, progress);

        // Wait for TWO frames to ensure render pipeline completes
        let frameCount = 0;
        const requestFrame = () => {
          frameCount++;
          if (frameCount < 2) {
            // After first frame, request second frame
            requestAnimationFrame(requestFrame);
          } else {
            // After second frame, signal ready
            window.__frameReady = true;
            console.log(`🎬 Frame ${progress.toFixed(3)} ready for capture`);
            
            // Resolve promise after a brief delay
            setTimeout(() => {
              window.__frameReady = false;
              resolve();
            }, 0);
          }
        };
        
        requestAnimationFrame(requestFrame);
      });
    };
  }

  return () => {};
}

/**
 * Apply camera state from the hero camera path
 */
function applyCameraState(cameraRef: any, orbitControlsRef: any, progress: number) {
  if (!cameraRef?.current) {
    console.error('❌ Camera ref not ready', { hasRef: !!cameraRef, hasCurrent: !!cameraRef?.current });
    return;
  }

  const cameraState = getHeroCameraPath(progress);
  console.log(`📹 Applying camera state for progress ${progress.toFixed(3)}:`, {
    pos: cameraState.position,
    look: cameraState.lookAt,
  });

  // Disable OrbitControls
  if (orbitControlsRef?.current) {
    orbitControlsRef.current.enabled = false;
  }

  // Set camera position and lookAt
  const camera = cameraRef.current;
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
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    __frameReady?: boolean;
    __setCaptureProgress?: (progress: number) => Promise<void>;
    __endCapture?: () => void;
  }
}
