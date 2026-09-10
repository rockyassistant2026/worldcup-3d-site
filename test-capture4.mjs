import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import crypto from 'crypto';

async function test() {
  const browser = await chromium.launch({ headless: true, args: ['--enable-gpu', '--use-gl=angle'] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  page.on('console', msg => {
    if (msg.text().includes('Rendering') || msg.text().includes('Moved')) {
      console.log('LOG:', msg.text());
    }
  });
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(3000);
  
  // Capture frame at progress 0.0
  console.log('\nCapturing frame at progress 0.0...');
  await page.evaluate(() => window.__setCaptureProgress(0.0));
  await page.waitForTimeout(300);
  const canvas0 = page.locator('#live-scene-canvas canvas');
  await canvas0.screenshot({ path: '/tmp/test-frame4-0.jpg', type: 'jpeg', quality: 75 });
  const stat0 = await fs.stat('/tmp/test-frame4-0.jpg');
  console.log('Saved /tmp/test-frame4-0.jpg (' + stat0.size + ' bytes)');
  
  // Capture frame at progress 0.5
  console.log('\nCapturing frame at progress 0.5...');
  await page.evaluate(() => window.__setCaptureProgress(0.5));
  await page.waitForTimeout(300);
  const canvas50 = page.locator('#live-scene-canvas canvas');
  await canvas50.screenshot({ path: '/tmp/test-frame4-50.jpg', type: 'jpeg', quality: 75 });
  const stat50 = await fs.stat('/tmp/test-frame4-50.jpg');
  console.log('Saved /tmp/test-frame4-50.jpg (' + stat50.size + ' bytes)');
  
  // Compare MD5s
  const file0 = await fs.readFile('/tmp/test-frame4-0.jpg');
  const file50 = await fs.readFile('/tmp/test-frame4-50.jpg');
  
  const hash0 = crypto.createHash('md5').update(file0).digest('hex');
  const hash50 = crypto.createHash('md5').update(file50).digest('hex');
  
  console.log('\nMD5 Hashes:');
  console.log('Progress 0.0:', hash0);
  console.log('Progress 0.5:', hash50);
  console.log('Identical?', hash0 === hash50);
  
  await browser.close();
}

test().catch(console.error);
