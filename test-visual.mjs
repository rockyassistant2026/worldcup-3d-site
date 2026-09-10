import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  await page.goto('http://localhost:5174');
  console.log('Page loaded. Waiting 3 seconds...');
  await page.waitForTimeout(3000);
  
  console.log('Applying progress 0.0...');
  await page.evaluate(() => window.__setCaptureProgress(0.0));
  await page.waitForTimeout(2000);
  
  console.log('Applying progress 0.5...');
  await page.evaluate(() => window.__setCaptureProgress(0.5));
  await page.waitForTimeout(2000);
  
  console.log('Applying progress 1.0...');
  await page.evaluate(() => window.__setCaptureProgress(1.0));
  await page.waitForTimeout(2000);
  
  console.log('Closing in 5 seconds...');
  await page.waitForTimeout(5000);
  
  await browser.close();
}

test().catch(console.error);
