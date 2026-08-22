/**
 * Automated Screenshot & Store Graphics Generator for Chrome Web Store
 * Uses headless Chrome to capture exact pixel-perfect store assets.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const STORE_ASSETS_DIR = path.join(ROOT_DIR, 'store-assets');

if (!fs.existsSync(STORE_ASSETS_DIR)) {
  fs.mkdirSync(STORE_ASSETS_DIR, { recursive: true });
}

// Locate Chrome or Edge
const BROWSER_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let browserExe = null;
for (const p of BROWSER_PATHS) {
  if (fs.existsSync(p)) {
    browserExe = p;
    break;
  }
}

if (!browserExe) {
  console.error('❌ Could not find Chrome or Edge executable on system.');
  process.exit(1);
}

console.log(`🌐 Using browser: ${browserExe}`);

const ASSETS = [
  {
    name: 'screenshot-1-human.png',
    width: 1280,
    height: 800,
    file: 'test/shots/shot-1-human.html'
  },
  {
    name: 'screenshot-2-mixed.png',
    width: 1280,
    height: 800,
    file: 'test/shots/shot-2-mixed.html'
  },
  {
    name: 'screenshot-3-ai.png',
    width: 1280,
    height: 800,
    file: 'test/shots/shot-3-robot.html'
  },
  {
    name: 'small-promo-tile.png',
    width: 440,
    height: 280,
    file: 'test/shots/promo-small.html'
  },
  {
    name: 'marquee-promo-tile.png',
    width: 1400,
    height: 560,
    file: 'test/shots/promo-marquee.html'
  }
];

console.log('📸 Generating Chrome Web Store promotional assets and screenshots...\n');

let allSuccess = true;

ASSETS.forEach(asset => {
  const htmlPath = path.join(ROOT_DIR, asset.file);
  const outPath = path.join(STORE_ASSETS_DIR, asset.name);
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  // Headless Chrome CLI screenshot command
  const cmd = `"${browserExe}" --headless=new --disable-gpu --hide-scrollbars --window-size=${asset.width},${asset.height} --screenshot="${outPath}" "${fileUrl}"`;

  try {
    execSync(cmd, { stdio: 'pipe' });
    if (fs.existsSync(outPath)) {
      const stats = fs.statSync(outPath);
      console.log(`  ✓ Created: ${asset.name} (${asset.width}x${asset.height}, ${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`  ❌ Failed to generate: ${asset.name}`);
      allSuccess = false;
    }
  } catch (err) {
    console.error(`  ❌ Error generating ${asset.name}:`, err.message);
    allSuccess = false;
  }
});

if (allSuccess) {
  console.log('\n🎉 All Chrome Web Store screenshots & promo tiles successfully generated!');
  console.log(`📁 Assets directory: ${STORE_ASSETS_DIR}`);
} else {
  console.error('\n⚠️ Some store assets failed to generate.');
  process.exit(1);
}
