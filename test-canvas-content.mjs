import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);
  
  // Try to get canvas pixel data
  const data = await page.evaluate(() => {
    const canvas = document.querySelector('#live-scene-canvas canvas');
    if (!canvas) {
      return { error: 'No canvas found' };
    }
    
    return {
      width: canvas.width,
      height: canvas.height,
      hasCanvas: true,
      tagName: canvas.tagName,
      className: canvas.className,
      visible: canvas.offsetHeight > 0
    };
  });
  
  console.log('Canvas info:', JSON.stringify(data, null, 2));
  
  await browser.close();
}

test().catch(console.error);
