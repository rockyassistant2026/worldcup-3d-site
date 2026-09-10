import { CanvasTexture, SRGBColorSpace } from "three";

/**
 * Badge texture generator and cache for team circular badges.
 * Generates a circular badge with color split (top half primary, bottom half secondary)
 * and 3-letter country code centered in white text.
 *
 * Uses a Map cache to avoid regenerating identical badges per render.
 */

class BadgeTextureCache {
  private cache = new Map<string, CanvasTexture>();

  private generateCacheKey(code: string, primaryColor: string, secondaryColor: string): string {
    return `${code}_${primaryColor}_${secondaryColor}`;
  }

  /**
   * Generate or retrieve a cached circular badge texture.
   * Badge is 512x512 with:
   * - Top semicircle: primary color
   * - Bottom semicircle: secondary color
   * - Center text: 3-letter code in white
   */
  getOrCreate(code: string, primaryColor: string, secondaryColor: string): CanvasTexture {
    const key = this.generateCacheKey(code, primaryColor, secondaryColor);

    // Return cached texture if it exists
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Generate new badge texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context for badge generation");
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2;

    // Draw circle background as primary color (full circle)
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw secondary color in bottom half (split badge)
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI);
    ctx.fill();

    // Draw subtle border around the circle
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw country code text in center
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 120px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Add text shadow for better readability
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillText(code, centerX + 2, centerY + 2);

    // Draw white text
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(code, centerX, centerY);

    // Create and cache the texture
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;

    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Clear all cached textures (useful for cleanup or memory management).
   */
  clear(): void {
    this.cache.forEach((texture) => {
      texture.dispose();
    });
    this.cache.clear();
  }

  /**
   * Get cache statistics for debugging.
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance for app-wide use
export const badgeTextureCache = new BadgeTextureCache();
