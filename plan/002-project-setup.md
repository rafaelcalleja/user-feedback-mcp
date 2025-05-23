# Phase 1: Project Setup and Infrastructure

This phase focuses on setting up the Turborepo monorepo structure, initializing the packages, and configuring the development environment.

## 1. Monorepo Initialization

### Tasks:

1. **Create Root Project Structure**
   - Initialize the root package.json
   - Configure Turborepo with turbo.json
   - Set up root-level .gitignore, .eslintrc, etc.

2. **Configure Workspaces**
   - Set up npm workspaces in the root package.json
   - Create the packages/ and apps/ directories

3. **Initialize Git Repository**
   - Set up Git with appropriate .gitignore
   - Configure initial commit

### Technical Details:

```bash
# Initialize the project
mkdir -p user-feedback-mcp
cd user-feedback-mcp

# Initialize package.json
npm init -y

# Install Turborepo
npm install -D turbo

# Create basic structure
mkdir -p packages/mcp-server/src
mkdir -p packages/electron-gui/src
mkdir -p packages/shared/src
mkdir -p apps/cli/src

# Initialize Git
git init
```

**Root package.json Configuration:**
```json
{
  "name": "user-feedback-mcp",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

**turbo.json Configuration:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

## 2. Package Initialization

### Tasks:

1. **Initialize MCP Server Package**
   - Create package.json with dependencies
   - Set up TypeScript configuration
   - Configure build scripts

2. **Initialize Electron GUI Package**
   - Create package.json with Electron dependencies
   - Set up TypeScript configuration
   - Configure build scripts

3. **Initialize Shared Package**
   - Create package.json
   - Set up TypeScript configuration
   - Define shared types and constants

4. **Initialize CLI Package**
   - Create package.json
   - Set up TypeScript configuration
   - Configure build and packaging scripts

### Technical Details:

**MCP Server package.json:**
```json
{
  "name": "@user-feedback-mcp/mcp-server",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src --ext .ts,.js",
    "test": "jest"
  },
  "dependencies": {
    "@user-feedback-mcp/shared": "*",
    "fs-extra": "^11.1.1"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.1",
    "@types/node": "^18.16.0",
    "typescript": "^5.0.4"
  }
}
```

**Electron GUI package.json:**
```json
{
  "name": "@user-feedback-mcp/electron-gui",
  "version": "0.1.0",
  "main": "dist/main.js",
  "scripts": {
    "build": "tsc && electron-builder",
    "dev": "tsc --watch",
    "start": "electron .",
    "lint": "eslint src --ext .ts,.js",
    "test": "jest"
  },
  "dependencies": {
    "@user-feedback-mcp/shared": "*",
    "electron-store": "^8.1.0"
  },
  "devDependencies": {
    "electron": "^25.0.0",
    "electron-builder": "^24.4.0",
    "typescript": "^5.0.4"
  }
}
```

**Shared package.json:**
```json
{
  "name": "@user-feedback-mcp/shared",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src --ext .ts,.js",
    "test": "jest"
  },
  "devDependencies": {
    "@types/node": "^18.16.0",
    "typescript": "^5.0.4"
  }
}
```

**CLI package.json:**
```json
{
  "name": "user-feedback-mcp",
  "version": "0.1.0",
  "bin": {
    "user-feedback-mcp": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src --ext .ts,.js",
    "test": "jest"
  },
  "dependencies": {
    "@user-feedback-mcp/mcp-server": "*",
    "@user-feedback-mcp/electron-gui": "*",
    "@user-feedback-mcp/shared": "*",
    "commander": "^10.0.1"
  },
  "devDependencies": {
    "@types/node": "^18.16.0",
    "typescript": "^5.0.4"
  }
}
```

## 3. Development Environment Configuration

### Tasks:

1. **TypeScript Configuration**
   - Set up tsconfig.json for each package
   - Configure path aliases for imports

2. **ESLint and Prettier Setup**
   - Configure ESLint for TypeScript
   - Set up Prettier for code formatting
   - Create shared configuration

3. **Jest Configuration**
   - Set up Jest for testing
   - Configure TypeScript support

### Technical Details:

**Root tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Package-specific tsconfig.json (example for mcp-server):**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../shared" }
  ]
}
```

**ESLint Configuration (.eslintrc.js):**
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: {
    node: true
  }
};
```

## 4. Dependencies Installation

### Tasks:

1. **Install Core Dependencies**
   - Install MCP SDK for Node.js
   - Install Electron and related packages
   - Install shared utilities

2. **Install Development Dependencies**
   - Install TypeScript, ESLint, Prettier
   - Install testing frameworks
   - Install build tools

### Technical Details:

```bash
# Install dependencies for all packages
npm install

# Install specific dependencies for MCP server
cd packages/mcp-server
npm install --save fs-extra
npm install --save-dev @types/fs-extra

# Install specific dependencies for Electron GUI
cd ../electron-gui
npm install --save electron-store
npm install --save-dev electron electron-builder

# Install specific dependencies for CLI
cd ../../apps/cli
npm install --save commander
```

## Expected Outcome

After completing this phase, we will have:

1. A fully configured Turborepo monorepo structure
2. Initialized packages with appropriate dependencies
3. Configured TypeScript, ESLint, and testing frameworks
4. A development environment ready for implementation

## Next Steps

Once the project setup is complete, we can proceed to implement the core functionality of each component, starting with the shared utilities, followed by the MCP server and Electron GUI.
