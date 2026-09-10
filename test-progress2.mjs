import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  page.on('console', msg => {
    if (msg.text().includes('Moved')) console.log(msg.text());
  });
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);
  
  // Test with proper await
  console.log('\nTest: Call with progress 0.0...');
  const start0 = Date.now();
  await page.evaluate(() => window.__setCaptureProgress(0.0));
  console.log(`Completed in ${Date.now() - start0}ms`);
  
  console.log('\nTest: Call with progress 0.5...');
  const start50 = Date.now();
  await page.evaluate(() => window.__setCaptureProgress(0.5));
  console.log(`Completed in ${Date.now() - start50}ms`);
  
  await browser.close();
}

test().catch(console.error);
