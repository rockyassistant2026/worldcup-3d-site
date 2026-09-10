#!/usr/bin/env node
import { chromium } from 'playwright';
import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testHeroFix() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('\n=== Loading and waiting for scene to render ===');
  await page.goto('http://localhost:5173');
  
  // Wait MUCH longer for WebGL to initialize
  console.log('Waiting 5 seconds for scene to fully initialize...');
  await page.waitForTimeout(5000);
  
  // Manually scroll or interact to trigger rendering
  await page.evaluate(() => {
    window.scrollBy(0, 100);
    window.scrollBy(0, -100);
  });
  
  await page.waitForTimeout(2000);
  
  console.log('\n=== TEST 1: Check scroll height ===');
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log(`document.body.scrollHeight: ${scrollHeight}`);
  
  if (scrollHeight <= 720) {
    console.log(`❌ FAIL: scrollHeight is ${scrollHeight}`);
  } else {
    console.log(`✅ PASS: scrollHeight is ${scrollHeight} (greater than 720)`);
  }
  
  console.log('\n=== TEST 2: Capture different progress values ===');
  const hashes = [];
  
  for (const progress of [0.0, 0.5, 1.0]) {
    console.log(`\nProgress ${progress}:`);
    
    // Reset page
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);
    
    // Call capture
    await page.evaluate((p) => {
      return window.__setCaptureProgress(p);
    }, progress);
    
    // Wait for rendering
    await page.waitForTimeout(1000);
    
    // Screenshot
    const screenshot = await page.locator('#live-scene-canvas').screenshot();
    const hash = createHash('md5').update(screenshot).digest('hex');
    hashes.push(hash);
    
    console.log(`  Hash: ${hash.substring(0, 16)}...`);
    
    if (progress === 0.0) {
      writeFileSync(join(__dirname, 'test-final-frame-0.png'), screenshot);
    }
  }
  
  console.log('\n=== Hash comparison ===');
  const uniqueHashes = new Set(hashes);
  console.log(`Frame 0.0: ${hashes[0]}`);
  console.log(`Frame 0.5: ${hashes[1]}`);
  console.log(`Frame 1.0: ${hashes[2]}`);
  console.log(`Unique hashes: ${uniqueHashes.size}/3`);
  
  if (uniqueHashes.size === 3) {
    console.log('✅ PASS: All three frames are different!');
  } else {
    console.log(`⚠️  Got ${uniqueHashes.size} unique frames (expected 3)`);
  }
  
  await browser.close();
  process.exit(uniqueHashes.size === 3 ? 0 : 1);
}

testHeroFix().catch(console.error);
