# Phase 3: MCP Server Implementation

This phase focuses on implementing the MCP server component that exposes the `get_user_feedback` tool over the Model Context Protocol (MCP) using the stdio transport.

## 1. MCP Server Core

### Tasks:

1. **Set Up MCP SDK Integration**
   - Install and configure MCP SDK
   - Implement stdio transport
   - Create server initialization

2. **Tool Registration**
   - Register the `get_user_feedback` tool
   - Define tool schema and metadata
   - Implement tool handler registration

### Technical Details:

First, we need to install the MCP SDK:

```bash
cd packages/mcp-server
npm install --save @anthropic-ai/sdk # or appropriate MCP SDK
```

**src/index.ts:**
```typescript
import { MCPServer, StdioTransport } from '@anthropic-ai/sdk'; // Replace with actual MCP SDK
import { registerUserFeedbackTool } from './tools';

/**
 * Main entry point for the MCP server
 */
export async function startMCPServer(): Promise<void> {
  try {
    // Create MCP server with stdio transport
    const transport = new StdioTransport();
    const server = new MCPServer({ transport });
    
    // Register tools
    registerUserFeedbackTool(server);
    
    // Start the server
    await server.start();
    
    console.log('MCP server started successfully');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Start the server if this file is executed directly
if (require.main === module) {
  startMCPServer();
}
```

**src/tools/index.ts:**
```typescript
export * from './user-feedback';
```

**src/tools/user-feedback.ts:**
```typescript
import { MCPServer, ToolDefinition } from '@anthropic-ai/sdk'; // Replace with actual MCP SDK
import { getUserFeedback } from '../handlers/user-feedback';

/**
 * Tool definition for the get_user_feedback tool
 */
const userFeedbackToolDefinition: ToolDefinition = {
  name: 'get_user_feedback',
  description: 'Opens a GUI window to collect feedback from the user',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'The prompt to display to the user'
      },
      title: {
        type: 'string',
        description: 'Optional title for the feedback window'
      },
      timeout: {
        type: 'number',
        description: 'Optional timeout in milliseconds'
      }
    },
    required: ['prompt']
  },
  returns: {
    type: 'object',
    properties: {
      feedback: {
        type: 'string',
        description: 'The feedback provided by the user'
      },
      status: {
        type: 'string',
        enum: ['success', 'error', 'timeout', 'cancelled'],
        description: 'Status of the feedback operation'
      },
      error: {
        type: 'string',
        description: 'Error message if status is not success'
      }
    },
    required: ['feedback', 'status']
  }
};

/**
 * Registers the get_user_feedback tool with the MCP server
 */
export function registerUserFeedbackTool(server: MCPServer): void {
  server.registerTool(userFeedbackToolDefinition, getUserFeedback);
}
```

## 2. Tool Handler Implementation

### Tasks:

1. **Create Handler Function**
   - Implement the `getUserFeedback` handler
   - Parse and validate tool parameters
   - Handle errors and timeouts

2. **Subprocess Management**
   - Implement Electron GUI subprocess spawning
   - Set up environment variables for parameter passing
   - Handle subprocess lifecycle

### Technical Details:

**src/handlers/user-feedback.ts:**
```typescript
import { spawn } from 'child_process';
import * as path from 'path';
import {
  UserFeedbackRequest,
  UserFeedbackResponse,
  FeedbackStatus,
  DEFAULT_TIMEOUT,
  DEFAULT_WINDOW_TITLE,
  ENV_PROMPT,
  ENV_TITLE,
  ENV_TIMEOUT,
  ENV_FEEDBACK_FILE,
  generateFeedbackFilePath,
  readFeedbackFromFile,
  cleanupFeedbackFile,
  createErrorResponse,
  createTimeoutResponse,
  ensureTempDir
} from '@user-feedback-mcp/shared';

/**
 * Handler for the get_user_feedback tool
 */
export async function getUserFeedback(
  params: UserFeedbackRequest
): Promise<UserFeedbackResponse> {
  // Validate parameters
  if (!params.prompt) {
    return createErrorResponse('Prompt is required');
  }
  
  // Generate a unique file path for this feedback request
  await ensureTempDir();
  const feedbackFilePath = generateFeedbackFilePath();
  
  try {
    // Get the path to the Electron GUI executable
    const electronGuiPath = getElectronGuiPath();
    
    // Set up environment variables for the subprocess
    const env = {
      ...process.env,
      [ENV_PROMPT]: params.prompt,
      [ENV_TITLE]: params.title || DEFAULT_WINDOW_TITLE,
      [ENV_TIMEOUT]: String(params.timeout || DEFAULT_TIMEOUT),
      [ENV_FEEDBACK_FILE]: feedbackFilePath
    };
    
    // Launch the Electron GUI subprocess
    const result = await launchElectronGui(electronGuiPath, env, params.timeout || DEFAULT_TIMEOUT);
    
    if (result.status === FeedbackStatus.TIMEOUT) {
      return createTimeoutResponse();
    }
    
    if (result.status === FeedbackStatus.ERROR) {
      return createErrorResponse(result.error || 'Unknown error', result.status);
    }
    
    // Read the feedback from the file
    const response = await readFeedbackFromFile(feedbackFilePath);
    
    return response;
  } catch (error) {
    return createErrorResponse(error);
  } finally {
    // Clean up the feedback file
    await cleanupFeedbackFile(feedbackFilePath);
  }
}

/**
 * Gets the path to the Electron GUI executable
 */
function getElectronGuiPath(): string {
  // In development, use the local path
  if (process.env.NODE_ENV === 'development') {
    return path.resolve(__dirname, '../../../electron-gui/dist/main.js');
  }
  
  // In production, use the installed path
  return require.resolve('@user-feedback-mcp/electron-gui');
}

/**
 * Launches the Electron GUI subprocess
 */
async function launchElectronGui(
  electronGuiPath: string,
  env: NodeJS.ProcessEnv,
  timeout: number
): Promise<{ status: FeedbackStatus; error?: string }> {
  return new Promise((resolve) => {
    // Set up timeout handler
    const timeoutId = setTimeout(() => {
      if (electronProcess && !electronProcess.killed) {
        electronProcess.kill();
      }
      resolve({ status: FeedbackStatus.TIMEOUT });
    }, timeout);
    
    // Spawn the Electron process
    const electronProcess = spawn('electron', [electronGuiPath], { env });
    
    // Handle process exit
    electronProcess.on('exit', (code) => {
      clearTimeout(timeoutId);
      
      if (code === 0) {
        resolve({ status: FeedbackStatus.SUCCESS });
      } else {
        resolve({
          status: FeedbackStatus.ERROR,
          error: `Electron process exited with code ${code}`
        });
      }
    });
    
    // Handle process error
    electronProcess.on('error', (error) => {
      clearTimeout(timeoutId);
      resolve({
        status: FeedbackStatus.ERROR,
        error: `Failed to start Electron process: ${error.message}`
      });
    });
    
    // Log stdout and stderr for debugging
    electronProcess.stdout.on('data', (data) => {
      console.log(`Electron stdout: ${data}`);
    });
    
    electronProcess.stderr.on('data', (data) => {
      console.error(`Electron stderr: ${data}`);
    });
  });
}
```

## 3. Error Handling and Logging

### Tasks:

1. **Implement Error Handling**
   - Add try-catch blocks for robust error handling
   - Create custom error types
   - Implement error logging

2. **Add Logging**
   - Implement logging for debugging
   - Add log levels for different environments
   - Create log rotation for production

### Technical Details:

**src/utils/logger.ts:**
```typescript
import * as winston from 'winston';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Create logger
const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Set log level based on environment
if (process.env.NODE_ENV === 'production') {
  logger.level = 'info';
} else {
  logger.level = 'debug';
}

export default logger;
```

Update the handler to use the logger:

```typescript
import logger from '../utils/logger';

// In getUserFeedback function:
logger.info('Received user feedback request', { prompt: params.prompt });

// In error handling:
logger.error('Error in getUserFeedback', { error: error.message });
```

## 4. Testing

### Tasks:

1. **Unit Tests**
   - Write tests for the tool handler
   - Mock subprocess spawning
   - Test error handling

2. **Integration Tests**
   - Test end-to-end flow with mock LLM requests
   - Validate file-based communication

### Technical Details:

**tests/user-feedback.test.ts:**
```typescript
import { getUserFeedback } from '../src/handlers/user-feedback';
import { FeedbackStatus } from '@user-feedback-mcp/shared';
import * as childProcess from 'child_process';
import * as fs from 'fs-extra';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs-extra');

describe('getUserFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return error when prompt is missing', async () => {
    const result = await getUserFeedback({} as any);
    
    expect(result.status).toBe(FeedbackStatus.ERROR);
    expect(result.error).toContain('Prompt is required');
  });
  
  it('should spawn Electron process with correct parameters', async () => {
    // Mock successful process
    const mockSpawn = childProcess.spawn as jest.Mock;
    mockSpawn.mockImplementation(() => {
      const mockProcess = {
        on: jest.fn(),
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        killed: false
      };
      
      // Simulate successful exit
      setTimeout(() => {
        mockProcess.on.mock.calls.find(call => call[0] === 'exit')[1](0);
      }, 100);
      
      return mockProcess;
    });
    
    // Mock successful file read
    const mockReadJson = fs.readJson as jest.Mock;
    mockReadJson.mockResolvedValue({
      feedback: 'Test feedback',
      timestamp: Date.now()
    });
    
    const result = await getUserFeedback({
      prompt: 'Test prompt',
      title: 'Test title'
    });
    
    expect(result.status).toBe(FeedbackStatus.SUCCESS);
    expect(result.feedback).toBe('Test feedback');
    
    // Verify spawn was called with correct parameters
    expect(mockSpawn).toHaveBeenCalledWith(
      'electron',
      expect.any(Array),
      expect.objectContaining({
        env: expect.objectContaining({
          USER_FEEDBACK_PROMPT: 'Test prompt',
          USER_FEEDBACK_TITLE: 'Test title'
        })
      })
    );
  });
  
  // Add more tests for timeout, error handling, etc.
});
```

## Expected Outcome

After completing this phase, we will have:

1. A fully functional MCP server that exposes the `get_user_feedback` tool
2. Robust error handling and logging
3. Subprocess management for launching the Electron GUI
4. Unit and integration tests for the server component

## Next Steps

Once the MCP server is implemented, we can proceed to implement the Electron GUI component that will display the feedback prompt and collect user input.
