import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 720 });
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);

// Check 1: scrollHeight fixed?
const scrollInfo = await page.evaluate(() => ({
  bodyScrollHeight: document.body.scrollHeight,
  docElScrollHeight: document.documentElement.scrollHeight,
}));
console.log('1. Scroll height:', JSON.stringify(scrollInfo));

// Check 2: debug text gone in normal mode?
const debugText = await page.locator('text=/Frame:.*Loaded/').count();
console.log('2. Debug text visible (should be 0):', debugText);

// Check 3: capture mechanism actually varies the scene
await page.waitForFunction(() => window.__setCaptureProgress !== undefined, { timeout: 10000 }).catch(e => console.log('  wait failed:', e.message));
const hashes = [];
for (const prog of [0.0, 0.5, 1.0]) {
  await page.evaluate((p) => window.__setCaptureProgress(p), prog);
  await page.waitForTimeout(300);
  const hudVisible = await page.locator('text=MATCHDAY').count();
  await page.locator('#live-scene-canvas canvas').screenshot({ path: `/tmp/final-${prog}.jpg`, type: 'jpeg', quality: 90 });
  console.log(`  progress=${prog} HUD visible=${hudVisible > 0}`);
}
await browser.close();
