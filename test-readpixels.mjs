import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import crypto from 'crypto';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(3000);
  
  // Try to get pixel data using readPixels
  console.log('Attempting to get pixel data at progress 0.0...');
  await page.evaluate(() => window.__setCaptureProgress(0.0));
  await page.waitForTimeout(300);
  
  const pixelData0 = await page.evaluate(() => {
    const canvas = document.querySelector('#live-scene-canvas canvas');
    if (!canvas) return { error: 'No canvas' };
    
    // Try WebGL context
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No WebGL context' };
    
    try {
      const pixels = new Uint8Array(1280 * 720 * 4);
      gl.readPixels(0, 0, 1280, 720, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      
      // Get first and last pixel values
      const first = Array.from(pixels.slice(0, 8));
      const last = Array.from(pixels.slice(-8));
      
      return {
        width: canvas.width,
        height: canvas.height,
        firstPixels: first,
        lastPixels: last,
        allZero: pixels.every(v => v === 0),
        someNonZero: pixels.some(v => v !== 0),
        max: Math.max(...pixels),
        checksum: pixels.reduce((a, b) => a + b, 0)
      };
    } catch (e) {
      return { error: e.message };
    }
  });
  
  console.log('Pixel data at 0.0:', JSON.stringify(pixelData0, null, 2));
  
  // Try at progress 0.5
  console.log('\nAttempting to get pixel data at progress 0.5...');
  await page.evaluate(() => window.__setCaptureProgress(0.5));
  await page.waitForTimeout(300);
  
  const pixelData50 = await page.evaluate(() => {
    const canvas = document.querySelector('#live-scene-canvas canvas');
    if (!canvas) return { error: 'No canvas' };
    
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No WebGL context' };
    
    try {
      const pixels = new Uint8Array(1280 * 720 * 4);
      gl.readPixels(0, 0, 1280, 720, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      
      const first = Array.from(pixels.slice(0, 8));
      const last = Array.from(pixels.slice(-8));
      
      return {
        width: canvas.width,
        height: canvas.height,
        firstPixels: first,
        lastPixels: last,
        allZero: pixels.every(v => v === 0),
        someNonZero: pixels.some(v => v !== 0),
        max: Math.max(...pixels),
        checksum: pixels.reduce((a, b) => a + b, 0)
      };
    } catch (e) {
      return { error: e.message };
    }
  });
  
  console.log('Pixel data at 0.5:', JSON.stringify(pixelData50, null, 2));
  
  if (pixelData0.checksum !== undefined && pixelData50.checksum !== undefined) {
    console.log('\nChecksums:');
    console.log('Progress 0.0:', pixelData0.checksum);
    console.log('Progress 0.5:', pixelData50.checksum);
    console.log('Identical?', pixelData0.checksum === pixelData50.checksum);
  }
  
  await browser.close();
}

test().catch(console.error);
