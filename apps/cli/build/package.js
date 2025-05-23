const { writeFileSync, readFileSync, copyFileSync, existsSync, mkdirSync, rmSync, cpSync, readdirSync } = require('fs');
const { join } = require('path');

// Clean up previous packaging artifacts
console.log('Cleaning up previous packaging artifacts...');
const packDir = join(__dirname, '../pack');
if (existsSync(packDir)) {
  rmSync(packDir, { recursive: true, force: true });
}

// Create the packaging directory
mkdirSync(packDir, { recursive: true });

// Create a temporary package.json for publishing
console.log('Creating package.json for publishing...');
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

// Modify package.json for publishing
const publishPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  bin: {
    "user-feedback-mcp": "./cli.js"
  },
  main: './cli.js',
  files: [
    'cli.js',
    'electron/**/*'
  ],
  dependencies: {
    "electron": packageJson.devDependencies["electron"],
    "@modelcontextprotocol/sdk": packageJson.dependencies["@modelcontextprotocol/sdk"],
    "commander": packageJson.dependencies["commander"],
    "fs-extra": packageJson.dependencies["fs-extra"],
    "winston": packageJson.dependencies["winston"],
    "zod": packageJson.dependencies["zod"],
    "electron-store": packageJson.dependencies["electron-store"],
  },
  keywords: [
    'mcp',
    'user-feedback',
    'cli'
  ],
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/nowaythatworked/user-feedback-mcp'
  }
};

// Write the modified package.json to the pack directory
writeFileSync(
  join(packDir, 'package.json'),
  JSON.stringify(publishPackageJson, null, 2)
);

// Copy the built files to the pack directory
console.log('Copying built files...');
copyFileSync(
  join(__dirname, '../dist/cli.js'),
  join(packDir, 'cli.js')
);

// Copy the electron directory recursively
if (existsSync(join(__dirname, '../dist/electron'))) {
  console.log('Copying Electron files...');
  // Create electron directory if it doesn't exist
  if (!existsSync(join(packDir, 'electron'))) {
    mkdirSync(join(packDir, 'electron'), { recursive: true });
  }

  // Use recursive copy for the entire electron directory
  cpSync(
    join(__dirname, '../dist/electron'),
    join(packDir, 'electron'),
    { recursive: true }
  );
}

// Copy README and LICENSE if they exist
if (existsSync(join(__dirname, '..', 'README.md'))) {
  copyFileSync(
    join(__dirname, '..', 'README.md'),
    join(packDir, 'README.md')
  );
}

console.log('Package preparation completed!');
console.log('To publish, run:');
console.log('cd apps/cli/pack && npm publish');
