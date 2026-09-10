import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(3000);
  
  // Add helper to window
  await page.evaluate(() => {
    window.__captureChecksum = () => {
      const canvas = document.querySelector('#live-scene-canvas canvas');
      if (!canvas) return { error: 'No canvas' };
      
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return { error: 'No WebGL context' };
      
      try {
        const pixels = new Uint8Array(1280 * 720 * 4);
        gl.readPixels(0, 0, 1280, 720, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        
        let checksum = 0;
        for (let i = 0; i < pixels.length; i += 100) {
          checksum += pixels[i];
        }
        
        return {
          width: canvas.width,
          height: canvas.height,
          checksum: checksum,
          allZero: pixels.every(v => v === 0),
          someNonZero: pixels.some(v => v !== 0),
          max: Math.max(...Array.from(pixels).slice(0, 1000))
        };
      } catch (e) {
        return { error: e.message };
      }
    };
  });
  
  // Capture at progress 0.0
  console.log('Attempting to get checksum at progress 0.0...');
  await page.evaluate(() => window.__setCaptureProgress(0.0));
  await page.waitForTimeout(300);
  
  const data0 = await page.evaluate(() => window.__captureChecksum());
  console.log('Checksum at 0.0:', JSON.stringify(data0, null, 2));
  
  // Capture at progress 0.5
  console.log('\nAttempting to get checksum at progress 0.5...');
  await page.evaluate(() => window.__setCaptureProgress(0.5));
  await page.waitForTimeout(300);
  
  const data50 = await page.evaluate(() => window.__captureChecksum());
  console.log('Checksum at 0.5:', JSON.stringify(data50, null, 2));
  
  if (data0.checksum !== undefined && data50.checksum !== undefined) {
    console.log('\nComparison:');
    console.log('Checksum at 0.0:', data0.checksum);
    console.log('Checksum at 0.5:', data50.checksum);
    console.log('Identical?', data0.checksum === data50.checksum);
    console.log('AllZero at 0.0?', data0.allZero);
    console.log('AllZero at 0.5?', data50.allZero);
  }
  
  await browser.close();
}

test().catch(console.error);
