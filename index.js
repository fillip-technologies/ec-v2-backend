/**
 * Root Index Entry Point for Hostinger / Cloud Process Managers
 * Automatically resolves compiled NestJS entrypoint across all build structures.
 */
const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, 'backend', 'dist', 'src', 'main.js'),
  path.join(__dirname, 'backend', 'dist', 'main.js'),
  path.join(__dirname, 'dist', 'src', 'main.js'),
  path.join(__dirname, 'dist', 'main.js'),
  path.join(__dirname, 'dist', 'main'),
];

let entryPoint = null;
for (const candidate of candidates) {
  if (fs.existsSync(candidate)) {
    entryPoint = candidate;
    break;
  }
}

if (entryPoint) {
  require(entryPoint);
} else {
  console.error('[HOSTINGER-BOOT] Error: dist/ directory not found. Please run "npm run build" in your Hostinger console first.');
  process.exit(1);
}
