import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // Add debug logging to page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);
  
  // Check if function exists
  const hasFn = await page.evaluate(() => typeof window.__setCaptureProgress === 'function');
  console.log('Has __setCaptureProgress:', hasFn);
  
  if (hasFn) {
    console.log('\nTest 1: Call with progress 0.0...');
    const result1 = await page.evaluate(() => {
      return window.__setCaptureProgress(0.0);
    });
    console.log('Returned promise:', result1);
    
    console.log('\nTest 2: Call with progress 0.5...');
    const result2 = await page.evaluate(() => {
      return window.__setCaptureProgress(0.5);
    });
    console.log('Returned promise:', result2);
  }
  
  await browser.close();
}

test().catch(console.error);
