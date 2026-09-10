#!/usr/bin/env node
import { chromium } from 'playwright';
import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testWithLogs() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });  // non-headless for debugging
  const page = await browser.newPage();
  
  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  
  console.log('\n=== Loading page ===');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('\n=== Calling __setCaptureProgress(0.0) ===');
  await page.evaluate(() => {
    return window.__setCaptureProgress(0.0);
  });
  
  await page.waitForTimeout(2000);
  
  console.log('\n=== Browser console logs ===');
  consoleLogs.forEach(log => console.log(log));
  
  await browser.close();
}

testWithLogs().catch(console.error);
