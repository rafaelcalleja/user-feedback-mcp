# Phase 5: CLI Application and Integration

This phase focuses on implementing the CLI application that serves as the entry point for users, and integrating all components together.

## 1. CLI Application Implementation

### Tasks:

1. **Create CLI Entry Point**
   - Implement command-line argument parsing
   - Create help and version commands
   - Set up subcommands for different operations

2. **Implement Start Command**
   - Create command to start the MCP server
   - Add options for configuration
   - Implement logging and error handling

### Technical Details:

**src/index.ts:**
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { startMCPServer } from '@user-feedback-mcp/mcp-server';
import { version } from '../package.json';

// Create the command-line program
const program = new Command();

// Set up basic information
program
  .name('user-feedback-mcp')
  .description('Local User Feedback Interface for MCP Tool')
  .version(version);

// Add start command
program
  .command('start')
  .description('Start the MCP server')
  .option('-d, --debug', 'Enable debug logging')
  .option('-p, --port <port>', 'Port for the server (if applicable)')
  .option('-t, --timeout <timeout>', 'Default timeout for feedback requests (in milliseconds)')
  .action(async (options) => {
    try {
      // Set debug mode if specified
      if (options.debug) {
        process.env.DEBUG = 'true';
        console.log('Debug mode enabled');
      }
      
      // Set timeout if specified
      if (options.timeout) {
        process.env.DEFAULT_TIMEOUT = options.timeout;
        console.log(`Default timeout set to ${options.timeout}ms`);
      }
      
      // Start the MCP server
      console.log('Starting MCP server...');
      await startMCPServer();
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      process.exit(1);
    }
  });

// Add test command for quick testing
program
  .command('test')
  .description('Test the user feedback tool')
  .option('-p, --prompt <prompt>', 'Prompt to display', 'Please provide your feedback:')
  .option('-t, --timeout <timeout>', 'Timeout in milliseconds', '300000')
  .action(async (options) => {
    try {
      // Import dynamically to avoid circular dependencies
      const { getUserFeedback } = await import('@user-feedback-mcp/mcp-server/dist/handlers/user-feedback');
      
      console.log(`Testing with prompt: "${options.prompt}"`);
      
      const result = await getUserFeedback({
        prompt: options.prompt,
        timeout: parseInt(options.timeout, 10)
      });
      
      console.log('Result:', result);
    } catch (error) {
      console.error('Test failed:', error);
      process.exit(1);
    }
  });

// Parse command-line arguments
program.parse();
```

**package.json (CLI package):**
```json
{
  "name": "user-feedback-mcp",
  "version": "0.1.0",
  "description": "Local User Feedback Interface for MCP Tool",
  "bin": {
    "user-feedback-mcp": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src --ext .ts,.js",
    "test": "jest",
    "start": "node ./dist/index.js start"
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

## 2. Integration Testing

### Tasks:

1. **End-to-End Testing**
   - Test the complete flow from CLI to MCP server to Electron GUI
   - Validate feedback collection and return
   - Test error handling and edge cases

2. **Performance Testing**
   - Test resource usage
   - Measure startup time
   - Evaluate memory consumption

### Technical Details:

**tests/integration.test.ts:**
```typescript
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';

// Path to the CLI executable
const cliPath = path.resolve(__dirname, '../dist/index.js');

describe('Integration Tests', () => {
  it('should start the MCP server and handle a feedback request', async () => {
    // Start the CLI in test mode
    const cliProcess = spawn('node', [cliPath, 'test', '--prompt', 'Integration test prompt']);
    
    // Collect stdout and stderr
    let stdout = '';
    let stderr = '';
    
    cliProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    cliProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Wait for the process to exit
    const exitCode = await new Promise<number>((resolve) => {
      cliProcess.on('exit', resolve);
    });
    
    // Check the results
    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toContain('Testing with prompt: "Integration test prompt"');
    expect(stdout).toContain('Result:');
    
    // Note: This test will require manual interaction in a real environment
    // For automated testing, we would need to mock the Electron GUI
  }, 30000); // Increase timeout for manual interaction
  
  // Add more integration tests for different scenarios
});
```

## 3. Documentation

### Tasks:

1. **Create README**
   - Write comprehensive installation instructions
   - Document usage examples
   - Explain configuration options

2. **Generate API Documentation**
   - Document public APIs
   - Create TypeScript type definitions
   - Add JSDoc comments

### Technical Details:

**README.md:**
```markdown
# User Feedback MCP Tool

A local Model Context Protocol (MCP) server that exposes a tool for collecting user feedback through a GUI window.

## Installation

```bash
# Install globally
npm install -g user-feedback-mcp

# Or run directly with npx
npx user-feedback-mcp
```

## Usage

### Starting the MCP Server

```bash
# Start the MCP server
user-feedback-mcp start

# Start with debug logging
user-feedback-mcp start --debug

# Set a custom timeout
user-feedback-mcp start --timeout 60000
```

### Testing the Tool

```bash
# Test the tool with a custom prompt
user-feedback-mcp test --prompt "What do you think about this feature?"
```

### Using with an LLM

The MCP server exposes a tool named `get_user_feedback` that can be called by an LLM agent. The tool accepts the following parameters:

- `prompt` (required): The prompt to display to the user
- `title` (optional): The title of the feedback window
- `timeout` (optional): Timeout in milliseconds

Example:

```json
{
  "name": "get_user_feedback",
  "parameters": {
    "prompt": "What do you think about this feature?",
    "title": "Feature Feedback",
    "timeout": 300000
  }
}
```

## Configuration

The tool can be configured using environment variables:

- `DEBUG`: Enable debug logging
- `DEFAULT_TIMEOUT`: Default timeout for feedback requests (in milliseconds)

## Development

### Prerequisites

- Node.js 14 or later
- npm 7 or later

### Setup

```bash
# Clone the repository
git clone https://github.com/example/user-feedback-mcp.git
cd user-feedback-mcp

# Install dependencies
npm install

# Build all packages
npm run build
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific package
npm test -- --selectProjects mcp-server
```

### Project Structure

- `packages/mcp-server`: MCP server implementation
- `packages/electron-gui`: Electron GUI implementation
- `packages/shared`: Shared utilities and types
- `apps/cli`: Command-line interface

## License

MIT
```

## 4. Packaging and Distribution

### Tasks:

1. **Configure NPM Package**
   - Set up package.json for publishing
   - Configure files to include
   - Set up binary entry points

2. **Create Release Process**
   - Set up versioning
   - Configure build pipeline
   - Create release scripts

### Technical Details:

**package.json (root):**
```json
{
  "name": "user-feedback-mcp-monorepo",
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
    "test": "turbo run test",
    "clean": "turbo run clean",
    "version": "changeset version",
    "release": "npm run build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "turbo": "^1.10.0"
  }
}
```

**.changeset/config.json:**
```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

**Release script (scripts/release.sh):**
```bash
#!/bin/bash
set -e

# Build all packages
npm run build

# Run tests
npm test

# Create a new version
npm run version

# Publish to npm
npm run release
```

## Expected Outcome

After completing this phase, we will have:

1. A fully functional CLI application that serves as the entry point for users
2. Comprehensive integration tests for the entire system
3. Complete documentation for installation, usage, and development
4. A configured release process for publishing to npm

## Next Steps

Once the CLI application and integration are complete, we can proceed to the final phase: testing, refinement, and deployment.
