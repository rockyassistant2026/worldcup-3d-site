import { chromium } from 'playwright';

async function test() {
  console.log('Starting non-headless browser test...');
  console.log('A browser window will open. Check if the 3D scene is visible.');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(3000);
  
  // Add helper
  await page.evaluate(() => {
    window.__captureChecksum = () => {
      const canvas = document.querySelector('#live-scene-canvas canvas');
      if (!canvas) return { error: 'No canvas' };
      
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return { error: 'No WebGL context' };
      
      try {
        const pixels = new Uint8Array(1280 * 720 * 4);
        gl.readPixels(0, 0, 1280, 720, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        
        let nonZero = 0;
        let checksum = 0;
        for (let i = 0; i < pixels.length; i++) {
          if (pixels[i] !== 0) nonZero++;
          checksum += pixels[i];
        }
        
        return {
          width: canvas.width,
          height: canvas.height,
          checksum: checksum,
          nonZeroPixels: nonZero,
          allZero: nonZero === 0
        };
      } catch (e) {
        return { error: e.message };
      }
    };
  });
  
  console.log('Checking pixel content...');
  await page.evaluate(() => window.__setCaptureProgress(0.0));
  await page.waitForTimeout(2000);
  
  const data = await page.evaluate(() => window.__captureChecksum());
  console.log('Pixel data:', JSON.stringify(data, null, 2));
  
  console.log('\nBrowser will close in 10 seconds...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('Test complete.');
}

test().catch(console.error);
