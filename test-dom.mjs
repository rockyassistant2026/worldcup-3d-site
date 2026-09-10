#!/usr/bin/env node
import { chromium } from 'playwright';

async function testDOMHiding() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('\n=== Testing hero section hiding ===');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  // Check initial state
  let heroDisplay = await page.evaluate(() => {
    const hero = document.querySelector('.hero-section');
    return window.getComputedStyle(hero).display;
  });
  console.log(`Hero display initially: ${heroDisplay}`);
  
  // Now trigger capture and monitor hero visibility
  console.log('\nCalling __setCaptureProgress(0.5)...');
  
  const monitoring = page.evaluate(async () => {
    const hero = document.querySelector('.hero-section');
    const heroStyle = hero.style;
    
    // Monitor for changes
    let changeCount = 0;
    let lastDisplay = window.getComputedStyle(hero).display;
    
    const checkLoop = setInterval(() => {
      const currentDisplay = window.getComputedStyle(hero).display;
      if (currentDisplay !== lastDisplay) {
        console.log(`[Monitor] Hero display changed: ${lastDisplay} -> ${currentDisplay}`);
        lastDisplay = currentDisplay;
        changeCount++;
      }
    }, 100);
    
    // Return immediately but keep checking
    return new Promise(resolve => {
      setTimeout(() => {
        clearInterval(checkLoop);
        resolve({
          changeCount,
          finalDisplay: window.getComputedStyle(hero).display,
          styleDisplay: hero.style.display,
        });
      }, 2000);
    });
  });
  
  // Simultaneously call the capture function
  await page.evaluate(() => {
    return window.__setCaptureProgress(0.5);
  });
  
  const result = await monitoring;
  console.log('Monitoring result:', result);
  
  await browser.close();
}

testDOMHiding().catch(console.error);
