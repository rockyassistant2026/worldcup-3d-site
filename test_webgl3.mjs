import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 720 });
page.on('console', msg => console.log('  [console]', msg.text()));
page.on('pageerror', err => console.log('  [pageerror]', err.message));
await page.goto('http://localhost:5174/?captureFrame=0.5', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

const frameReady = await page.evaluate(() => (window).__frameReady);
console.log('window.__frameReady:', frameReady);

const hudVisible = await page.locator('text=MATCHDAY').count();
console.log('HUD title still visible:', hudVisible > 0);

const canvases = page.locator('canvas');
const count = await canvases.count();
console.log('canvas count:', count);
for (let i = 0; i < count; i++) {
  await canvases.nth(i).screenshot({ path: `/tmp/capture-canvas-${i}.jpg`, type: 'jpeg', quality: 90 });
}
await browser.close();
