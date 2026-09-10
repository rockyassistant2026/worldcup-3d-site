import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 720 });
await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);

const canvases = page.locator('canvas');
const count = await canvases.count();
console.log('canvas count:', count);
for (let i = 0; i < count; i++) {
  await canvases.nth(i).screenshot({ path: `/tmp/canvas-${i}.jpg`, type: 'jpeg', quality: 90 });
  console.log(`saved canvas ${i}`);
}
await browser.close();
