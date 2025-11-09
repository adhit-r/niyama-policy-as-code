#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
  console.log('Created screenshots directory');
}

async function captureScreenshots() {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 720 });
  
  try {
    console.log('Capturing dashboard screenshot...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/dashboard.png', fullPage: true });
    console.log('✓ Dashboard screenshot saved');
    
    console.log('Capturing policies screenshot...');
    await page.goto('http://localhost:3001/policies', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/policies.png', fullPage: true });
    console.log('✓ Policies screenshot saved');
    
    console.log('Capturing templates screenshot...');
    await page.goto('http://localhost:3001/templates', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/templates.png', fullPage: true });
    console.log('✓ Templates screenshot saved');
    
    console.log('Capturing compliance screenshot...');
    await page.goto('http://localhost:3001/compliance', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/compliance.png', fullPage: true });
    console.log('✓ Compliance screenshot saved');
    
  } catch (error) {
    console.error('✗ Error capturing screenshots:', error.message);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

console.log('Generating screenshots using Playwright...');
captureScreenshots()
  .then(() => {
    console.log('Screenshot generation complete!');
    console.log('Screenshots saved to the screenshots/ directory');
  })
  .catch(error => {
    console.error('✗ Failed to generate screenshots:', error.message);
    process.exit(1);
  });