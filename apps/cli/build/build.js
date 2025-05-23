const esbuild = require('esbuild');
const { mkdirSync, existsSync, rmSync, copyFileSync, readdirSync } = require('fs');
const path = require('path');

// Clean up previous build artifacts
console.log('Cleaning up previous build artifacts...');
if (existsSync('./dist')) {
  rmSync('./dist', { recursive: true, force: true });
}

// Copy necessary assets
console.log('Copying assets...');
const electronAssetsDir = path.join(__dirname, '../../../packages/electron-gui/assets');
const distAssetsDir = path.join(__dirname, '../dist/electron/assets');

if (existsSync(electronAssetsDir)) {
  // Create assets directory
  mkdirSync(distAssetsDir, { recursive: true });

  // Copy all files from assets directory
  const assetFiles = readdirSync(electronAssetsDir);
  assetFiles.forEach(file => {
    const sourcePath = path.join(electronAssetsDir, file);
    const destPath = path.join(distAssetsDir, file);
    copyFileSync(sourcePath, destPath);
    console.log(`Copied asset: ${file}`);
  });
}

// Build CLI with all dependencies bundled
console.log('Building CLI...');
esbuild.buildSync({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: './dist/cli.js',
  banner: { js: '#!/usr/bin/env node' },
  external: [
    'electron', // Don't bundle electron as it's a native dependency
    '@modelcontextprotocol/sdk', // MCP SDK
    'commander', // Command-line parsing
    'fs-extra', // File system operations
    'winston', // Logging
    'zod', // Schema validation
    'electron-store', // Electron storage
  ],
  minify: false,
  sourcemap: false,
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  // Use tsconfig paths
  resolveExtensions: ['.ts', '.js', '.json'],
  tsconfig: '../../tsconfig.json',
});

// Build Electron main process entry point
console.log('Building Electron main process entry point...');
esbuild.buildSync({
  entryPoints: ['../../packages/electron-gui/src/main-entry.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: './dist/electron/main.js',
  external: [
    'electron', // Don't bundle electron
    'fs-extra', // File system operations
    'electron-store', // Electron storage
  ], // Don't bundle these dependencies
  minify: true,
  sourcemap: false,
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  // Use tsconfig paths
  resolveExtensions: ['.ts', '.js', '.json'],
  tsconfig: '../../tsconfig.json',
});

// Build Electron preload script
console.log('Building Electron preload script...');
esbuild.buildSync({
  entryPoints: ['../../packages/electron-gui/src/preload.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: './dist/electron/preload.js',
  external: [
    'electron', // Don't bundle electron
    'fs-extra', // File system operations
    'electron-store', // Electron storage
  ], // Don't bundle these dependencies
  minify: true,
  sourcemap: false,
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  // Use tsconfig paths
  resolveExtensions: ['.ts', '.js', '.json'],
  tsconfig: '../../tsconfig.json',
});

// Copy renderer files (HTML, CSS, JS)
console.log('Copying renderer files...');
const rendererDir = path.join(__dirname, '../../../packages/electron-gui/renderer');
const distRendererDir = path.join(__dirname, '../dist/electron/renderer');

// Create renderer directory if it doesn't exist
if (!existsSync(distRendererDir)) {
  mkdirSync(distRendererDir, { recursive: true });
}

// Copy all files from renderer directory
if (existsSync(rendererDir)) {
  const rendererFiles = readdirSync(rendererDir);
  rendererFiles.forEach(file => {
    const sourcePath = path.join(rendererDir, file);
    const destPath = path.join(distRendererDir, file);
    copyFileSync(sourcePath, destPath);
    console.log(`Copied renderer file: ${file}`);
  });
}

console.log('Build completed successfully!');
