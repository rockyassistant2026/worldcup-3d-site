import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);
  
  // Get canvas element
  const canvasHandle = await page.locator('#live-scene-canvas canvas').first();
  const box = await canvasHandle.boundingBox();
  console.log('Canvas bounding box:', box);
  
  await browser.close();
}

test().catch(console.error);
