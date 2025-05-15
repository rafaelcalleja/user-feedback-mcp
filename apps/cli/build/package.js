const { writeFileSync, readFileSync, copyFileSync, existsSync, mkdirSync, rmSync } = require('fs');
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
  main: 'mcp.js',
  files: [
    'cli.js',
    'mcp.js',
    'electron/**/*',
    'main.js'
  ],
  dependencies: {
    // Only include runtime dependencies, not dev dependencies
    "@modelcontextprotocol/sdk": packageJson.dependencies["@modelcontextprotocol/sdk"],
    "commander": packageJson.dependencies["commander"],
    "fs-extra": packageJson.dependencies["fs-extra"],
    "winston": packageJson.dependencies["winston"],
    "zod": packageJson.dependencies["zod"]
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

copyFileSync(
  join(__dirname, '../dist/mcp.js'),
  join(packDir, 'mcp.js')
);

// Copy the electron directory
if (existsSync(join(__dirname, '../dist/electron'))) {
  console.log('Copying Electron files...');
  // Create electron directory if it doesn't exist
  if (!existsSync(join(packDir, 'electron'))) {
    mkdirSync(join(packDir, 'electron'), { recursive: true });
  }

  // Copy files directly without creating nested directories
  const electronFiles = ['index.js', 'index.js.map', 'main.js', 'main.js.map'];
  electronFiles.forEach(file => {
    if (existsSync(join(__dirname, '../dist/electron', file))) {
      copyFileSync(
        join(__dirname, '../dist/electron', file),
        join(packDir, 'electron', file)
      );
    }
  });

  // Copy main.js to the root directory for easier resolution
  if (existsSync(join(__dirname, '../dist/electron/main.js'))) {
    copyFileSync(
      join(__dirname, '../dist/electron/main.js'),
      join(packDir, 'main.js')
    );
  }
}

// No type declarations needed for CLI tool

// Copy README and LICENSE if they exist
if (existsSync(join(__dirname, '../../..', 'README.md'))) {
  copyFileSync(
    join(__dirname, '../../..', 'README.md'),
    join(packDir, 'README.md')
  );
}

if (existsSync(join(__dirname, '../../..', 'LICENSE'))) {
  copyFileSync(
    join(__dirname, '../../..', 'LICENSE'),
    join(packDir, 'LICENSE')
  );
}

console.log('Package preparation completed!');
console.log('To publish, run:');
console.log('cd apps/cli/pack && npm publish');
