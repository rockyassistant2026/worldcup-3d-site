import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--enable-gpu',
      '--enable-features=SharedArrayBuffer',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  });
  
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
  
  console.log('GPU-enabled headless browser test:');
  await page.evaluate(() => window.__setCaptureProgress(0.0));
  await page.waitForTimeout(300);
  
  const data = await page.evaluate(() => window.__captureChecksum());
  console.log(JSON.stringify(data, null, 2));
  
  await browser.close();
}

test().catch(console.error);
