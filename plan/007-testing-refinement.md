# Phase 6: Testing, Refinement, and Deployment

This phase focuses on comprehensive testing, refinement based on feedback, and final deployment of the Local User Feedback Interface for MCP Tool.

## 1. Comprehensive Testing

### Tasks:

1. **Unit Testing**
   - Complete unit tests for all components
   - Ensure high test coverage
   - Test edge cases and error handling

2. **Integration Testing**
   - Test end-to-end flows
   - Validate cross-component communication
   - Test with real LLM integration if possible

3. **Cross-Platform Testing**
   - Test on Windows, macOS, and Linux
   - Validate file path handling
   - Test Electron GUI on different platforms

### Technical Details:

**Unit Test Coverage Goals:**
- MCP Server: >80% coverage
- Electron GUI: >70% coverage
- Shared Utilities: >90% coverage
- CLI Application: >80% coverage

**Integration Test Scenarios:**
1. Basic feedback collection
2. Timeout handling
3. Error handling (file access issues, process failures)
4. Multiple concurrent requests
5. Long feedback text
6. Special characters in feedback

**Cross-Platform Test Matrix:**
| Platform | Test Cases |
|----------|------------|
| Windows  | File paths, process spawning, GUI rendering |
| macOS    | File paths, process spawning, GUI rendering |
| Linux    | File paths, process spawning, GUI rendering |

**Testing Script (scripts/test-all.sh):**
```bash
#!/bin/bash
set -e

# Run unit tests
echo "Running unit tests..."
npm test

# Run integration tests
echo "Running integration tests..."
cd apps/cli
npm run test:integration

# Run cross-platform tests (if available)
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Running macOS tests..."
  npm run test:macos
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  echo "Running Linux tests..."
  npm run test:linux
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  echo "Running Windows tests..."
  npm run test:windows
fi

echo "All tests completed successfully!"
```

## 2. Performance Optimization

### Tasks:

1. **Startup Time Optimization**
   - Measure and optimize MCP server startup time
   - Improve Electron GUI launch speed
   - Optimize module loading

2. **Memory Usage Optimization**
   - Monitor and reduce memory consumption
   - Implement proper cleanup of resources
   - Optimize file handling

3. **Resource Management**
   - Ensure proper process cleanup
   - Implement timeout handling
   - Optimize file system operations

### Technical Details:

**Performance Benchmarking Script (scripts/benchmark.js):**
```javascript
const { performance } = require('perf_hooks');
const { spawn } = require('child_process');
const path = require('path');

// Path to the CLI executable
const cliPath = path.resolve(__dirname, '../apps/cli/dist/index.js');

// Measure startup time
async function measureStartupTime() {
  const startTime = performance.now();
  
  const cliProcess = spawn('node', [cliPath, 'start']);
  
  // Wait for the server to be ready
  await new Promise((resolve) => {
    cliProcess.stdout.on('data', (data) => {
      if (data.toString().includes('MCP server started successfully')) {
        resolve();
      }
    });
  });
  
  const endTime = performance.now();
  const startupTime = endTime - startTime;
  
  console.log(`MCP server startup time: ${startupTime.toFixed(2)}ms`);
  
  // Kill the process
  cliProcess.kill();
}

// Measure memory usage
async function measureMemoryUsage() {
  const cliProcess = spawn('node', [cliPath, 'start']);
  
  // Wait for the server to be ready
  await new Promise((resolve) => {
    cliProcess.stdout.on('data', (data) => {
      if (data.toString().includes('MCP server started successfully')) {
        resolve();
      }
    });
  });
  
  // Wait a bit for the server to stabilize
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Get the process ID
  const pid = cliProcess.pid;
  
  // Use ps to get memory usage
  const psProcess = spawn('ps', ['-p', pid, '-o', 'rss=']);
  
  const memoryUsage = await new Promise((resolve) => {
    psProcess.stdout.on('data', (data) => {
      resolve(parseInt(data.toString().trim(), 10));
    });
  });
  
  console.log(`MCP server memory usage: ${memoryUsage}KB`);
  
  // Kill the process
  cliProcess.kill();
}

// Run benchmarks
async function runBenchmarks() {
  console.log('Running performance benchmarks...');
  
  await measureStartupTime();
  await measureMemoryUsage();
  
  console.log('Benchmarks completed!');
}

runBenchmarks().catch(console.error);
```

**Optimization Targets:**
- MCP Server startup time: <500ms
- Electron GUI launch time: <1000ms
- Memory usage: <100MB for MCP server, <200MB for Electron GUI

## 3. User Experience Refinement

### Tasks:

1. **UI/UX Improvements**
   - Refine the Electron GUI design
   - Improve responsiveness
   - Add keyboard shortcuts

2. **Error Message Improvements**
   - Create user-friendly error messages
   - Add troubleshooting information
   - Implement better error reporting

3. **Accessibility Improvements**
   - Ensure keyboard navigation
   - Add screen reader support
   - Improve color contrast

### Technical Details:

**UI/UX Improvements:**
- Add focus states for form elements
- Implement keyboard shortcuts (Ctrl+Enter to submit)
- Add loading indicators
- Improve error message presentation

**Updated CSS (renderer/styles.css):**
```css
/* Add focus styles */
.feedback-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
}

/* Add keyboard shortcut hint */
.keyboard-hint {
  font-size: 12px;
  color: #666;
  text-align: right;
  margin-top: 5px;
}

/* Improve loading indicator */
.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4a90e2;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Improve accessibility */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Keyboard Shortcut Implementation (renderer/app.js):**
```javascript
// Add keyboard shortcut for submission
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    
    // Trigger form submission
    const submitButton = document.querySelector('.submit-button');
    if (submitButton && !submitButton.disabled) {
      submitButton.click();
    }
  }
});

// Add keyboard shortcut hint
const keyboardHint = document.createElement('div');
keyboardHint.className = 'keyboard-hint';
keyboardHint.textContent = 'Press Ctrl+Enter to submit';
document.querySelector('.button-container').appendChild(keyboardHint);
```

## 4. Documentation and Examples

### Tasks:

1. **Complete Documentation**
   - Finalize README and documentation
   - Create API reference
   - Add troubleshooting guide

2. **Create Examples**
   - Implement example integrations
   - Create usage examples
   - Add code snippets

3. **Create Demo**
   - Implement a demo script
   - Create a demo video
   - Add screenshots to documentation

### Technical Details:

**Examples Directory Structure:**
```
examples/
├── basic-usage/
│   ├── index.js
│   └── README.md
├── custom-styling/
│   ├── index.js
│   ├── custom-styles.css
│   └── README.md
└── llm-integration/
    ├── index.js
    ├── llm-example.js
    └── README.md
```

**Basic Usage Example (examples/basic-usage/index.js):**
```javascript
const { spawn } = require('child_process');
const path = require('path');

// Start the MCP server
const mcpProcess = spawn('npx', ['user-feedback-mcp', 'start'], {
  stdio: 'inherit'
});

// Simulate an LLM calling the tool
setTimeout(() => {
  console.log('Simulating LLM tool call...');
  
  // Call the test command to simulate a tool call
  const testProcess = spawn('npx', [
    'user-feedback-mcp',
    'test',
    '--prompt',
    'What do you think about this example?'
  ], {
    stdio: 'inherit'
  });
  
  testProcess.on('exit', () => {
    console.log('Tool call completed!');
    
    // Clean up
    mcpProcess.kill();
  });
}, 2000);
```

**Demo Script (scripts/demo.js):**
```javascript
const { spawn } = require('child_process');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Start the MCP server
console.log('Starting MCP server...');
const mcpProcess = spawn('npx', ['user-feedback-mcp', 'start'], {
  stdio: 'pipe'
});

mcpProcess.stdout.on('data', (data) => {
  console.log(`MCP server: ${data}`);
});

// Wait for server to start
setTimeout(() => {
  console.log('\n--- Demo Menu ---');
  console.log('1. Basic feedback request');
  console.log('2. Feedback request with custom title');
  console.log('3. Feedback request with timeout');
  console.log('4. Exit demo');
  
  rl.question('\nSelect an option: ', (answer) => {
    switch (answer) {
      case '1':
        runTest('Basic feedback request', 'What do you think about this tool?');
        break;
      case '2':
        runTest('Custom title', 'What do you think about this tool?', '--title', 'Custom Feedback Form');
        break;
      case '3':
        runTest('Timeout example', 'Please respond within 10 seconds...', '--timeout', '10000');
        break;
      case '4':
        console.log('Exiting demo...');
        mcpProcess.kill();
        rl.close();
        break;
      default:
        console.log('Invalid option!');
        break;
    }
  });
}, 2000);

function runTest(name, prompt, ...args) {
  console.log(`\nRunning: ${name}`);
  
  const testArgs = ['user-feedback-mcp', 'test', '--prompt', prompt, ...args];
  
  const testProcess = spawn('npx', testArgs, {
    stdio: 'inherit'
  });
  
  testProcess.on('exit', () => {
    console.log('Test completed!');
    
    // Return to menu
    setTimeout(() => {
      console.log('\n--- Demo Menu ---');
      console.log('1. Basic feedback request');
      console.log('2. Feedback request with custom title');
      console.log('3. Feedback request with timeout');
      console.log('4. Exit demo');
      
      rl.question('\nSelect an option: ', (answer) => {
        // Handle menu selection
      });
    }, 1000);
  });
}
```

## 5. Final Deployment

### Tasks:

1. **Prepare for NPM Publishing**
   - Finalize package.json files
   - Create .npmignore files
   - Set up access control

2. **Create Release**
   - Tag release in Git
   - Create GitHub release
   - Publish to NPM

3. **Post-Release Verification**
   - Verify installation from NPM
   - Test published package
   - Document release notes

### Technical Details:

**NPM Publishing Script (scripts/publish.sh):**
```bash
#!/bin/bash
set -e

# Ensure we're on the main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Error: Must be on main branch to publish"
  exit 1
fi

# Ensure working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory is not clean"
  exit 1
fi

# Build all packages
echo "Building packages..."
npm run build

# Run tests
echo "Running tests..."
npm test

# Create a new version using changesets
echo "Creating new version..."
npm run version

# Commit the version changes
git add .
git commit -m "Release: version bump"

# Create a tag
VERSION=$(node -p "require('./apps/cli/package.json').version")
git tag "v$VERSION"

# Push changes and tag
git push origin main
git push origin "v$VERSION"

# Publish to NPM
echo "Publishing to NPM..."
npm run release

echo "Published version $VERSION successfully!"
```

**Post-Release Verification Script (scripts/verify-release.sh):**
```bash
#!/bin/bash
set -e

# Get the latest version
VERSION=$(node -p "require('./apps/cli/package.json').version")

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Initialize a test project
npm init -y

# Install the published package
npm install user-feedback-mcp@$VERSION

# Verify the installation
if [ -d "node_modules/user-feedback-mcp" ]; then
  echo "Package installed successfully!"
else
  echo "Error: Package installation failed"
  exit 1
fi

# Test the CLI
npx user-feedback-mcp --version

# Clean up
cd -
rm -rf "$TEMP_DIR"

echo "Release verification completed successfully!"
```

## Expected Outcome

After completing this phase, we will have:

1. A thoroughly tested and optimized application
2. Refined user experience with improved UI and error handling
3. Comprehensive documentation and examples
4. A published NPM package ready for use

## Next Steps

After successful deployment, consider implementing the future enhancements mentioned in the PRD:

1. Accept structured input or additional metadata
2. Return JSON instead of plain text
3. Use IPC or sockets for more robust messaging
4. Allow timeouts or cancellation from the LLM side
5. Persist user input history for future reference or learning
