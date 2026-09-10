import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import crypto from 'crypto';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(3000);
  
  // Capture using canvas.toDataURL instead of Playwright screenshot
  console.log('Capturing frame at progress 0.0 using toDataURL...');
  await page.evaluate(() => window.__setCaptureProgress(0.0));
  await page.waitForTimeout(300);
  
  const dataURL0 = await page.evaluate(() => {
    const canvas = document.querySelector('#live-scene-canvas canvas');
    if (!canvas) return null;
    return canvas.toDataURL('image/jpeg', 0.75);
  });
  
  if (dataURL0) {
    const buffer0 = Buffer.from(dataURL0.split(',')[1], 'base64');
    await fs.writeFile('/tmp/test-dataurl-0.jpg', buffer0);
    console.log('Saved /tmp/test-dataurl-0.jpg (' + buffer0.length + ' bytes)');
  } else {
    console.log('ERROR: No canvas dataURL');
  }
  
  // Capture at progress 0.5
  console.log('\nCapturing frame at progress 0.5 using toDataURL...');
  await page.evaluate(() => window.__setCaptureProgress(0.5));
  await page.waitForTimeout(300);
  
  const dataURL50 = await page.evaluate(() => {
    const canvas = document.querySelector('#live-scene-canvas canvas');
    if (!canvas) return null;
    return canvas.toDataURL('image/jpeg', 0.75);
  });
  
  if (dataURL50) {
    const buffer50 = Buffer.from(dataURL50.split(',')[1], 'base64');
    await fs.writeFile('/tmp/test-dataurl-50.jpg', buffer50);
    console.log('Saved /tmp/test-dataurl-50.jpg (' + buffer50.length + ' bytes)');
  } else {
    console.log('ERROR: No canvas dataURL');
  }
  
  // Compare
  if (dataURL0 && dataURL50) {
    const hash0 = crypto.createHash('md5').update(dataURL0).digest('hex');
    const hash50 = crypto.createHash('md5').update(dataURL50).digest('hex');
    console.log('\nMD5 of dataURLs:');
    console.log('Progress 0.0:', hash0);
    console.log('Progress 0.5:', hash50);
    console.log('Identical?', hash0 === hash50);
  }
  
  await browser.close();
}

test().catch(console.error);
