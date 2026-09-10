import { useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";

/**
 * Advertising banners along the pitch perimeter walls.
 * OPTIMIZED: Already uses drei Instances for efficient rendering (~1 draw call).
 * Reuse turf/stadium materials for consistency with surrounding environment.
 */

interface BannerSegment {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}

export function AdvertisingBanners() {
  const PITCH_HALF_LENGTH = 52.5;
  const PITCH_HALF_WIDTH = 34;
  const BANNER_HEIGHT = 0.8;

  const bannerSegments: BannerSegment[] = useMemo(() => {
    const segments: BannerSegment[] = [];

    // North side banners (along z = +PITCH_HALF_WIDTH + gap)
    const northBanners = 8;
    const northSpacing = (PITCH_HALF_LENGTH * 2) / northBanners;
    const northColors = ["#E53935", "#1976D2", "#00AA00", "#FFB300"];
    for (let i = 0; i < northBanners; i++) {
      segments.push({
        position: [
          -PITCH_HALF_LENGTH + (i + 0.5) * northSpacing,
          BANNER_HEIGHT / 2 + 0.2,
          PITCH_HALF_WIDTH + 0.5,
        ],
        scale: [northSpacing - 0.1, BANNER_HEIGHT, 0.15],
        color: northColors[i % northColors.length],
      });
    }

    // South side banners
    const southBanners = 8;
    const southSpacing = (PITCH_HALF_LENGTH * 2) / southBanners;
    const southColors = ["#D32F2F", "#0288D1", "#388E3C", "#FDD835"];
    for (let i = 0; i < southBanners; i++) {
      segments.push({
        position: [
          -PITCH_HALF_LENGTH + (i + 0.5) * southSpacing,
          BANNER_HEIGHT / 2 + 0.2,
          -(PITCH_HALF_WIDTH + 0.5),
        ],
        scale: [southSpacing - 0.1, BANNER_HEIGHT, 0.15],
        color: southColors[i % southColors.length],
      });
    }

    // East side banners
    const eastBanners = 6;
    const eastSpacing = (PITCH_HALF_WIDTH * 2) / eastBanners;
    const eastColors = ["#C62828", "#1565C0", "#2E7D32", "#F57F17"];
    for (let i = 0; i < eastBanners; i++) {
      segments.push({
        position: [
          PITCH_HALF_LENGTH + 0.5,
          BANNER_HEIGHT / 2 + 0.2,
          -PITCH_HALF_WIDTH + (i + 0.5) * eastSpacing,
        ],
        scale: [0.15, BANNER_HEIGHT, eastSpacing - 0.1],
        color: eastColors[i % eastColors.length],
      });
    }

    // West side banners
    const westBanners = 6;
    const westSpacing = (PITCH_HALF_WIDTH * 2) / westBanners;
    const westColors = ["#AD1457", "#0D47A1", "#1B5E20", "#F57C00"];
    for (let i = 0; i < westBanners; i++) {
      segments.push({
        position: [
          -(PITCH_HALF_LENGTH + 0.5),
          BANNER_HEIGHT / 2 + 0.2,
          -PITCH_HALF_WIDTH + (i + 0.5) * westSpacing,
        ],
        scale: [0.15, BANNER_HEIGHT, westSpacing - 0.1],
        color: westColors[i % westColors.length],
      });
    }

    return segments;
  }, []);

  return (
    <Instances limit={bannerSegments.length} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.7} metalness={0.1} />
      {bannerSegments.map((seg, idx) => (
        <Instance
          key={`banner-${idx}`}
          position={seg.position}
          scale={seg.scale}
          color={seg.color}
        />
      ))}
    </Instances>
  );
}
