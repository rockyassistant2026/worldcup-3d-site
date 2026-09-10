import { useAppStore } from "../store/useAppStore";

/**
 * Post-processing layer: controls tone mapping, shadows, and future effects.
 * Currently relies on:
 * - ACESFilmicToneMapping in renderer (RendererSetup in Experience)
 * - Environment map for reflections (Environment preset in Experience)
 * - MeshPhysicalMaterial clearcoat for ball sheen
 *
 * Post-processing is optional and gated by quality:
 * - low: minimal effects, rely on built-in tone mapping only
 * - medium: tone mapping + environment reflections
 * - high: full features including shadows and environment
 *
 * @react-three/postprocessing is not installed to avoid bundle bloat.
 * Effects are achieved through native Three.js features instead.
 */
export function PostProcessing() {
  const quality = useAppStore((s) => s.quality);

  // Post-processing is conditional but always returns null for now.
  // The quality flag is used in:
  // - Canvas/Lights: shadow map resolution
  // - Experience: environment intensity
  // - App.tsx: DPR capping and shadow enablement
  // - Pitch.tsx: texture resolution

  if (quality === "low") {
    // Minimal rendering path: no shadows, lower DPR, smaller textures
    // (see corresponding quality checks in other components)
    return null;
  }

  // medium/high: full scene with environment and optional future bloom
  // Future: Add EffectComposer with Bloom/SMAA for medium+ quality if needed
  return null;
}
