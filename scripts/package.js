/**
 * Production Packaging Script for Chrome Web Store
 * Creates a clean, validated distribution ZIP containing only production extension files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const BUILD_STAGING_DIR = path.join(DIST_DIR, 'staging');

const manifestPath = path.join(ROOT_DIR, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('Error: manifest.json not found!');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const version = manifest.version || '1.0.0';
const extName = 'ai-o-meter';
const zipFileName = `${extName}-v${version}.zip`;
const zipFilePath = path.join(DIST_DIR, zipFileName);

console.log(`📦 Packaging ${extName} v${version} for Chrome Web Store...`);

// Clean staging & dist
if (fs.existsSync(BUILD_STAGING_DIR)) {
  fs.rmSync(BUILD_STAGING_DIR, { recursive: true, force: true });
}
fs.mkdirSync(BUILD_STAGING_DIR, { recursive: true });

// Production files to include
const PRODUCTION_FILES = [
  'manifest.json',
  'icons/icon-16.png',
  'icons/icon-48.png',
  'icons/icon-128.png',
  'src/analyzer.js',
  'src/cliches.js',
  'src/text-extractor.js',
  'background/background.js',
  'content/content.js',
  'popup/popup.html',
  'popup/popup.css',
  'popup/popup.js'
];

let allValid = true;
PRODUCTION_FILES.forEach(relPath => {
  const src = path.join(ROOT_DIR, relPath);
  const dest = path.join(BUILD_STAGING_DIR, relPath);

  if (!fs.existsSync(src)) {
    console.error(`❌ Missing required file: ${relPath}`);
    allValid = false;
    return;
  }

  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(src, dest);
  console.log(`  ✓ Added: ${relPath}`);
});

if (!allValid) {
  console.error('Packaging aborted due to missing files.');
  process.exit(1);
}

// Remove old zip if exists
if (fs.existsSync(zipFilePath)) {
  fs.unlinkSync(zipFilePath);
}

// Compress staging directory into ZIP using powershell Compress-Archive
try {
  const psCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${BUILD_STAGING_DIR}/*' -DestinationPath '${zipFilePath}' -Force"`;
  execSync(psCommand, { stdio: 'inherit' });

  // Clean staging
  fs.rmSync(BUILD_STAGING_DIR, { recursive: true, force: true });

  const stats = fs.statSync(zipFilePath);
  console.log(`\n🎉 Successfully generated production package!`);
  console.log(`📍 File: ${zipFilePath}`);
  console.log(`⚖️ Size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`✅ Ready to upload to Chrome Developer Dashboard!`);
} catch (err) {
  console.error('Error creating ZIP archive:', err);
  process.exit(1);
}
