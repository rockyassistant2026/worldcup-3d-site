#!/usr/bin/env node
import { chromium } from 'playwright';
import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testCanvasRendering() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('\n=== TEST: Canvas content inspection ===');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  
  // Get canvas info
  const canvasInfo = await page.evaluate(() => {
    const liveScene = document.getElementById('live-scene-canvas');
    const canvas = document.querySelector('canvas');
    
    if (!canvas) {
      return { error: 'No canvas found' };
    }
    
    const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    return {
      canvasExists: true,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      liveSceneDivExists: !!liveScene,
      webglContextExists: !!ctx,
      canvasParent: canvas.parentElement?.id || canvas.parentElement?.className || 'unknown',
    };
  });
  
  console.log('Canvas info:', canvasInfo);
  
  // Take screenshot of live-scene
  console.log('\nTaking screenshot of #live-scene-canvas...');
  const screenshot = await page.locator('#live-scene-canvas').screenshot();
  
  // Analyze pixels
  console.log(`Screenshot size: ${screenshot.length} bytes`);
  
  // Save for visual inspection
  writeFileSync(join(__dirname, 'test-canvas-content.png'), screenshot);
  console.log('Saved test-canvas-content.png');
  
  // Now try to call the capture function and see what happens
  console.log('\n=== Testing __setCaptureProgress ===');
  const captureResult = await page.evaluate(async () => {
    console.log('About to call __setCaptureProgress(0.0)');
    const result = await window.__setCaptureProgress(0.0);
    console.log('__setCaptureProgress returned');
    return result;
  });
  
  console.log('Capture result:', captureResult);
  
  // Take another screenshot
  await page.waitForTimeout(500);
  const screenshot2 = await page.locator('#live-scene-canvas').screenshot();
  writeFileSync(join(__dirname, 'test-canvas-after-capture.png'), screenshot2);
  console.log('Saved test-canvas-after-capture.png');
  
  const hash1 = createHash('md5').update(screenshot).digest('hex');
  const hash2 = createHash('md5').update(screenshot2).digest('hex');
  
  console.log(`\nBefore capture: ${hash1}`);
  console.log(`After capture:  ${hash2}`);
  console.log(`Same: ${hash1 === hash2}`);
  
  await browser.close();
  console.log('\n=== Test complete ===');
}

testCanvasRendering().catch(console.error);
