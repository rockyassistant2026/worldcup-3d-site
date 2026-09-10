import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 720 });

// Test 1: does headless chromium support WebGL at all?
await page.goto('data:text/html,<canvas id="c"></canvas>');
const glSupport = await page.evaluate(() => {
  const c = document.getElementById('c');
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  return gl ? gl.getParameter(gl.RENDERER) : 'NO WEBGL CONTEXT';
});
console.log('1. Headless WebGL support:', glSupport);

// Test 2: does the NORMAL live site (no captureFrame) render non-black pixels?
await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000); // give HDR/physics time, matching what we know it needs
const normalPixels = await page.evaluate(() => {
  const canvases = [...document.querySelectorAll('canvas')];
  return canvases.map(c => {
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return { tag: 'no-gl', w: c.width, h: c.height };
    const px = new Uint8Array(4);
    try {
      gl.readPixels(Math.floor(c.width/2), Math.floor(c.height/2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    } catch(e) { return { tag: 'readPixels-failed: ' + e.message, w: c.width, h: c.height }; }
    return { tag: 'ok', w: c.width, h: c.height, centerPixel: [...px] };
  });
});
console.log('2. Normal site canvases:', JSON.stringify(normalPixels));

await browser.close();
