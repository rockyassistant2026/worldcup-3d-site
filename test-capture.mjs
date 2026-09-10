import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import crypto from 'crypto';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);
  
  // Capture frame at progress 0.0
  console.log('Capturing frame at progress 0.0...');
  await page.evaluate(() => window.__setCaptureProgress(0.0));
  const canvas0 = page.locator('#live-scene-canvas canvas');
  await canvas0.screenshot({ path: '/tmp/test-frame-0.jpg', type: 'jpeg', quality: 75 });
  console.log('Saved /tmp/test-frame-0.jpg');
  
  // Capture frame at progress 0.5
  console.log('Capturing frame at progress 0.5...');
  await page.evaluate(() => window.__setCaptureProgress(0.5));
  await page.waitForTimeout(100);
  const canvas50 = page.locator('#live-scene-canvas canvas');
  await canvas50.screenshot({ path: '/tmp/test-frame-50.jpg', type: 'jpeg', quality: 75 });
  console.log('Saved /tmp/test-frame-50.jpg');
  
  // Capture frame at progress 1.0
  console.log('Capturing frame at progress 1.0...');
  await page.evaluate(() => window.__setCaptureProgress(1.0));
  await page.waitForTimeout(100);
  const canvas100 = page.locator('#live-scene-canvas canvas');
  await canvas100.screenshot({ path: '/tmp/test-frame-100.jpg', type: 'jpeg', quality: 75 });
  console.log('Saved /tmp/test-frame-100.jpg');
  
  // Compare MD5s
  const file0 = await fs.readFile('/tmp/test-frame-0.jpg');
  const file50 = await fs.readFile('/tmp/test-frame-50.jpg');
  const file100 = await fs.readFile('/tmp/test-frame-100.jpg');
  
  const hash0 = crypto.createHash('md5').update(file0).digest('hex');
  const hash50 = crypto.createHash('md5').update(file50).digest('hex');
  const hash100 = crypto.createHash('md5').update(file100).digest('hex');
  
  console.log('\nMD5 Hashes:');
  console.log('Progress 0.0:', hash0);
  console.log('Progress 0.5:', hash50);
  console.log('Progress 1.0:', hash100);
  console.log('\nAll identical?', hash0 === hash50 && hash50 === hash100);
  
  await browser.close();
}

test().catch(console.error);
