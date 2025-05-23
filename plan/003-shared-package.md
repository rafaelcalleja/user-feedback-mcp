# Phase 2: Shared Package Implementation

This phase focuses on implementing the shared package that contains common code, constants, types, and utilities used by both the MCP server and Electron GUI components.

## 1. Shared Types and Interfaces

### Tasks:

1. **Define Common Types**
   - Create interfaces for tool requests and responses
   - Define types for configuration options
   - Create enums for status codes and message types

2. **Create Communication Protocol Types**
   - Define interfaces for file-based communication
   - Create types for serialization/deserialization

### Technical Details:

**src/types.ts:**
```typescript
/**
 * Interface for the user feedback request
 */
export interface UserFeedbackRequest {
  /**
   * The prompt to display to the user
   */
  prompt: string;
  
  /**
   * Optional title for the feedback window
   */
  title?: string;
  
  /**
   * Optional timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Interface for the user feedback response
 */
export interface UserFeedbackResponse {
  /**
   * The feedback text provided by the user
   */
  feedback: string;
  
  /**
   * Status of the feedback operation
   */
  status: FeedbackStatus;
  
  /**
   * Error message if status is ERROR
   */
  error?: string;
}

/**
 * Enum for feedback operation status
 */
export enum FeedbackStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled'
}

/**
 * Interface for the file-based communication
 */
export interface FeedbackFile {
  /**
   * The feedback text provided by the user
   */
  feedback: string;
  
  /**
   * Timestamp when the feedback was submitted
   */
  timestamp: number;
}
```

## 2. Constants and Configuration

### Tasks:

1. **Define File Paths and Names**
   - Create constants for temporary file paths
   - Define default timeout values
   - Set up configuration defaults

2. **Create Environment Variable Names**
   - Define environment variable names for configuration
   - Create constants for command-line arguments

### Technical Details:

**src/constants.ts:**
```typescript
import * as path from 'path';
import * as os from 'os';

/**
 * Default timeout for waiting for user feedback (in milliseconds)
 */
export const DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Default window title
 */
export const DEFAULT_WINDOW_TITLE = 'User Feedback';

/**
 * Default window width
 */
export const DEFAULT_WINDOW_WIDTH = 600;

/**
 * Default window height
 */
export const DEFAULT_WINDOW_HEIGHT = 400;

/**
 * Base directory for temporary files
 */
export const TEMP_DIR = path.join(os.tmpdir(), 'user-feedback-mcp');

/**
 * File name for the feedback file
 */
export const FEEDBACK_FILE_NAME = 'feedback.json';

/**
 * Environment variable for the prompt
 */
export const ENV_PROMPT = 'USER_FEEDBACK_PROMPT';

/**
 * Environment variable for the window title
 */
export const ENV_TITLE = 'USER_FEEDBACK_TITLE';

/**
 * Environment variable for the timeout
 */
export const ENV_TIMEOUT = 'USER_FEEDBACK_TIMEOUT';

/**
 * Environment variable for the feedback file path
 */
export const ENV_FEEDBACK_FILE = 'USER_FEEDBACK_FILE';
```

## 3. Utility Functions

### Tasks:

1. **File System Utilities**
   - Create functions for temporary file management
   - Implement file reading and writing utilities
   - Add cleanup functions

2. **Serialization Utilities**
   - Implement functions to serialize/deserialize messages
   - Create validation utilities

3. **Error Handling Utilities**
   - Create custom error classes
   - Implement error handling utilities

### Technical Details:

**src/file-utils.ts:**
```typescript
import * as fs from 'fs-extra';
import * as path from 'path';
import { TEMP_DIR, FEEDBACK_FILE_NAME } from './constants';
import { FeedbackFile, UserFeedbackResponse, FeedbackStatus } from './types';

/**
 * Ensures the temporary directory exists
 */
export async function ensureTempDir(): Promise<void> {
  await fs.ensureDir(TEMP_DIR);
}

/**
 * Generates a unique file path for the feedback file
 */
export function generateFeedbackFilePath(): string {
  const uniqueId = Date.now().toString();
  return path.join(TEMP_DIR, `${uniqueId}-${FEEDBACK_FILE_NAME}`);
}

/**
 * Writes feedback data to a file
 */
export async function writeFeedbackToFile(
  filePath: string, 
  feedback: string
): Promise<void> {
  const data: FeedbackFile = {
    feedback,
    timestamp: Date.now()
  };
  
  await fs.writeJson(filePath, data, { spaces: 2 });
}

/**
 * Reads feedback data from a file
 */
export async function readFeedbackFromFile(
  filePath: string
): Promise<UserFeedbackResponse> {
  try {
    const data = await fs.readJson(filePath) as FeedbackFile;
    
    return {
      feedback: data.feedback,
      status: FeedbackStatus.SUCCESS
    };
  } catch (error) {
    return {
      feedback: '',
      status: FeedbackStatus.ERROR,
      error: `Failed to read feedback file: ${error.message}`
    };
  }
}

/**
 * Cleans up the feedback file
 */
export async function cleanupFeedbackFile(filePath: string): Promise<void> {
  try {
    await fs.remove(filePath);
  } catch (error) {
    console.error(`Failed to clean up feedback file: ${error.message}`);
  }
}
```

**src/error-utils.ts:**
```typescript
import { FeedbackStatus, UserFeedbackResponse } from './types';

/**
 * Custom error class for feedback operation errors
 */
export class FeedbackError extends Error {
  status: FeedbackStatus;
  
  constructor(message: string, status: FeedbackStatus) {
    super(message);
    this.name = 'FeedbackError';
    this.status = status;
  }
}

/**
 * Creates an error response
 */
export function createErrorResponse(
  error: Error | string,
  status: FeedbackStatus = FeedbackStatus.ERROR
): UserFeedbackResponse {
  const message = typeof error === 'string' ? error : error.message;
  
  return {
    feedback: '',
    status,
    error: message
  };
}

/**
 * Creates a timeout response
 */
export function createTimeoutResponse(): UserFeedbackResponse {
  return {
    feedback: '',
    status: FeedbackStatus.TIMEOUT,
    error: 'Operation timed out waiting for user feedback'
  };
}
```

## 4. Index Exports

### Tasks:

1. **Create Index File**
   - Export all types, constants, and utilities
   - Set up barrel exports for clean imports

### Technical Details:

**src/index.ts:**
```typescript
// Export types
export * from './types';

// Export constants
export * from './constants';

// Export utilities
export * from './file-utils';
export * from './error-utils';
```

## Expected Outcome

After completing this phase, we will have:

1. A shared package with common types, constants, and utilities
2. File system utilities for the file-based communication
3. Error handling utilities for robust error management
4. A clean API for importing shared code in other packages

## Next Steps

Once the shared package is implemented, we can proceed to implement the MCP server and Electron GUI components, which will depend on this shared code.
