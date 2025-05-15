const esbuild = require('esbuild');
const { mkdirSync, existsSync, rmSync } = require('fs');

// Clean up previous build artifacts
console.log('Cleaning up previous build artifacts...');
if (existsSync('./dist')) {
  rmSync('./dist', { recursive: true, force: true });
}

// Ensure dist directory exists
mkdirSync('./dist', { recursive: true });

// Ensure electron directory exists
mkdirSync('./dist/electron', { recursive: true });

// Build CLI
console.log('Building CLI...');
esbuild.buildSync({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: './dist/cli.js',
  banner: { js: '#!/usr/bin/env node' },
  external: ['electron'], // Don't bundle electron
  minify: true,
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  // Use tsconfig paths
  resolveExtensions: ['.ts', '.js', '.json'],
  tsconfig: '../../tsconfig.json',
});

// Build MCP Server (for use as a library)
console.log('Building MCP Server library...');
esbuild.buildSync({
  entryPoints: ['../../packages/mcp-server/src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: './dist/mcp.js',
  external: ['electron'], // Don't bundle electron
  minify: true,
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  // Use tsconfig paths
  resolveExtensions: ['.ts', '.js', '.json'],
  tsconfig: '../../tsconfig.json',
});

// Build Electron components as a library
console.log('Building Electron components library...');
esbuild.buildSync({
  entryPoints: ['../../packages/electron-gui/src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: './dist/electron/index.js',
  external: ['electron'], // Don't bundle electron
  minify: true,
  sourcemap: true,
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
  external: ['electron'], // Don't bundle electron
  minify: true,
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  // Use tsconfig paths
  resolveExtensions: ['.ts', '.js', '.json'],
  tsconfig: '../../tsconfig.json',
});

console.log('Build completed successfully!');
