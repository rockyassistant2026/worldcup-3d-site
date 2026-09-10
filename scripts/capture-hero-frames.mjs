import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import { join } from 'path';

const TOTAL_FRAMES = 120;
const BASE_URL = 'http://localhost:5173'; // Vite dev server
const OUTPUT_DIR = 'public/hero-frames';
const CANVAS_TIMEOUT = 10000; // 10 seconds per frame

async function captureFrames() {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const page = await browser.newPage();
    
    // Set viewport size to match our canvas output
    await page.setViewportSize({ width: 1280, height: 720 });

    let successCount = 0;
    let failCount = 0;

    console.log(`📹 Loading page once...`);
    
    // Load page ONCE without captureFrame param to avoid initial capture mode
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      console.log(`✅ Page loaded`);
    } catch (e) {
      console.error(`❌ Failed to load page: ${e.message}`);
      await browser.close();
      process.exit(1);
    }

    // Wait for __setCaptureProgress function to be available
    console.log(`⏳ Waiting for capture progress function...`);
    try {
      await page.waitForFunction(
        () => window.__setCaptureProgress !== undefined,
        { timeout: 5000 }
      );
      console.log(`✅ Capture progress function available`);
    } catch (e) {
      console.error(`❌ Failed to find __setCaptureProgress: ${e.message}`);
      await browser.close();
      process.exit(1);
    }

    console.log(`\n📹 Capturing ${TOTAL_FRAMES} frames...`);

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const progress = i === TOTAL_FRAMES ? 1.0 : (i - 1) / (TOTAL_FRAMES - 1);
      const frameStr = String(i).padStart(4, '0');

      try {
        console.log(`  Frame ${frameStr} (${progress.toFixed(3)})...`);

        // Call window.__setCaptureProgress and wait for it to complete
        try {
          await page.evaluate(
            (prog) => window.__setCaptureProgress(prog),
            progress
          );
        } catch (e) {
          console.warn(`    ⚠️ Progress call failed (continuing): ${e.message}`);
        }

        // Wait longer for rendering to complete
        await page.waitForTimeout(200);

        // Get the canvas within the live-scene-canvas div
        const canvasLocator = page.locator('#live-scene-canvas canvas');
        const canvasCount = await canvasLocator.count();

        if (canvasCount === 0) {
          console.warn(`    ❌ No canvas found in #live-scene-canvas`);
          failCount++;
          continue;
        }

        try {
          // Screenshot only the canvas area
          const screenshotPath = join(OUTPUT_DIR, `frame-${frameStr}.jpg`);
          await canvasLocator.screenshot({
            path: screenshotPath,
            type: 'jpeg',
            quality: 75,
          });

          console.log(`    ✅ Saved`);
          successCount++;
        } catch (e) {
          console.warn(`    ❌ Screenshot failed: ${e.message}`);
          failCount++;
        }
      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
        failCount++;
      }
    }

    // Restore the HUD/hero overlay (isCapturingFrames -> false) now that all
    // frames are captured. Doing this once here (not per-frame) is what
    // actually keeps the overlay hidden for the whole capture session.
    await page.evaluate(() => window.__endCapture && window.__endCapture());

    await page.close();

    console.log(`\n✨ Capture complete:`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Total frames: ${successCount + failCount}`);
    
    if (successCount > 0) {
      console.log(`\n📍 Frames saved to: ${OUTPUT_DIR}`);
    }

  } finally {
    await browser.close();
  }
}

// Run the capture
captureFrames().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
