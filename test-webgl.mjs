#!/usr/bin/env node
import { chromium } from 'playwright';

async function checkWebGL() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const logs = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (msg.type() === 'error') {
      errors.push(text);
      console.log(`🔴 ERROR: ${text}`);
    }
  });
  
  console.log('Loading page...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check WebGL capabilities
  const webglInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas found' };
    
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No WebGL context' };
    
    return {
      hasCanvas: true,
      hasWebGL: true,
      canvasTag: canvas.tagName,
      webglVersion: gl instanceof WebGL2RenderingContext ? '2.0' : '1.0',
      isContextLost: gl.isContextLost?.(),
    };
  });
  
  console.log('\nWebGL Info:', webglInfo);
  console.log(`\nError count: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }
  
  await browser.close();
}

checkWebGL().catch(console.error);
