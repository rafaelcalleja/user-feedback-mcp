# Phase 7: Future Enhancements

This phase outlines potential future enhancements for the Local User Feedback Interface for MCP Tool, as mentioned in the PRD. These enhancements can be implemented after the initial release to add more functionality and improve the user experience.

## 1. Structured Input and Metadata

### Tasks:

1. **Extend Tool Schema**
   - Add support for structured input types
   - Implement metadata fields
   - Update tool definition

2. **Enhance UI for Structured Input**
   - Create UI components for different input types
   - Implement validation for structured input
   - Add metadata collection UI

3. **Update Communication Protocol**
   - Extend file format to support structured data
   - Implement serialization/deserialization
   - Update handlers to process structured data

### Technical Details:

**Extended Tool Definition:**
```typescript
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
      },
      inputType: {
        type: 'string',
        enum: ['text', 'rating', 'choice', 'boolean'],
        description: 'Type of input to collect from the user'
      },
      options: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Options for choice input type'
      },
      metadata: {
        type: 'object',
        description: 'Additional metadata to collect from the user'
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
      structuredFeedback: {
        type: 'object',
        description: 'Structured feedback data'
      },
      metadata: {
        type: 'object',
        description: 'Additional metadata collected from the user'
      },
      confidence: {
        type: 'number',
        description: 'User confidence level (0-1)'
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
    required: ['status']
  }
};
```

**UI Components for Structured Input:**
```typescript
// In renderer/components/input-types.ts
export function renderInputComponent(type: string, options?: string[]) {
  switch (type) {
    case 'text':
      return renderTextInput();
    case 'rating':
      return renderRatingInput();
    case 'choice':
      return renderChoiceInput(options || []);
    case 'boolean':
      return renderBooleanInput();
    default:
      return renderTextInput();
  }
}

function renderTextInput() {
  return `
    <textarea 
      id="feedback-input" 
      class="feedback-input" 
      placeholder="Type your feedback here..." 
      required
    ></textarea>
  `;
}

function renderRatingInput() {
  return `
    <div class="rating-input">
      <p>Please rate on a scale of 1-5:</p>
      <div class="rating-buttons">
        ${[1, 2, 3, 4, 5].map(rating => `
          <button type="button" class="rating-button" data-rating="${rating}">
            ${rating}
          </button>
        `).join('')}
      </div>
      <input type="hidden" id="rating-value" name="rating" required>
    </div>
  `;
}

function renderChoiceInput(options: string[]) {
  return `
    <div class="choice-input">
      <p>Please select an option:</p>
      <div class="choice-options">
        ${options.map((option, index) => `
          <div class="choice-option">
            <input type="radio" id="option-${index}" name="choice" value="${option}" required>
            <label for="option-${index}">${option}</label>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderBooleanInput() {
  return `
    <div class="boolean-input">
      <p>Please select:</p>
      <div class="boolean-buttons">
        <button type="button" class="boolean-button" data-value="true">Yes</button>
        <button type="button" class="boolean-button" data-value="false">No</button>
      </div>
      <input type="hidden" id="boolean-value" name="boolean" required>
    </div>
  `;
}
```

## 2. JSON Response Format

### Tasks:

1. **Update Response Format**
   - Implement JSON response format
   - Add schema validation
   - Update handlers to process JSON

2. **Extend File Format**
   - Update file format to use JSON
   - Implement versioning for backward compatibility
   - Add validation for file format

3. **Update Documentation**
   - Document JSON response format
   - Provide examples of JSON responses
   - Update API reference

### Technical Details:

**JSON Response Format:**
```typescript
export interface UserFeedbackJsonResponse {
  version: string;
  status: FeedbackStatus;
  data?: {
    feedback: string;
    structuredFeedback?: any;
    metadata?: Record<string, any>;
    confidence?: number;
    timestamp: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

**File Format Implementation:**
```typescript
// In shared/src/file-utils.ts
export async function writeFeedbackToJsonFile(
  filePath: string,
  feedback: string,
  structuredFeedback?: any,
  metadata?: Record<string, any>,
  confidence?: number
): Promise<void> {
  const data: UserFeedbackJsonResponse = {
    version: '1.0.0',
    status: FeedbackStatus.SUCCESS,
    data: {
      feedback,
      structuredFeedback,
      metadata,
      confidence,
      timestamp: Date.now()
    }
  };
  
  await fs.writeJson(filePath, data, { spaces: 2 });
}

export async function readFeedbackFromJsonFile(
  filePath: string
): Promise<UserFeedbackJsonResponse> {
  try {
    const data = await fs.readJson(filePath) as UserFeedbackJsonResponse;
    
    // Validate version and format
    if (!data.version) {
      // Handle legacy format
      return convertLegacyFormat(data);
    }
    
    return data;
  } catch (error) {
    return {
      version: '1.0.0',
      status: FeedbackStatus.ERROR,
      error: {
        code: 'FILE_READ_ERROR',
        message: `Failed to read feedback file: ${error.message}`
      }
    };
  }
}

function convertLegacyFormat(legacyData: any): UserFeedbackJsonResponse {
  // Convert legacy format to new format
  return {
    version: '1.0.0',
    status: FeedbackStatus.SUCCESS,
    data: {
      feedback: legacyData.feedback || '',
      timestamp: legacyData.timestamp || Date.now()
    }
  };
}
```

## 3. Improved Inter-Process Communication

### Tasks:

1. **Implement IPC Communication**
   - Replace file-based communication with IPC
   - Implement socket-based communication as an option
   - Add robust error handling for IPC

2. **Create Communication Protocol**
   - Define message format for IPC
   - Implement serialization/deserialization
   - Add protocol versioning

3. **Update Components**
   - Modify MCP server to use IPC
   - Update Electron GUI to use IPC
   - Add fallback to file-based communication

### Technical Details:

**IPC Implementation:**
```typescript
// In shared/src/ipc-utils.ts
import * as net from 'net';
import { EventEmitter } from 'events';

export interface IpcMessage {
  type: string;
  payload: any;
  id: string;
}

export class IpcServer extends EventEmitter {
  private server: net.Server;
  private clients: Map<string, net.Socket> = new Map();
  
  constructor(private socketPath: string) {
    super();
    this.server = net.createServer(this.handleConnection.bind(this));
  }
  
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.socketPath, () => {
        resolve();
      });
      
      this.server.on('error', reject);
    });
  }
  
  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        resolve();
      });
    });
  }
  
  public send(clientId: string, type: string, payload: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = this.clients.get(clientId);
      
      if (!client) {
        reject(new Error(`Client ${clientId} not found`));
        return;
      }
      
      const message: IpcMessage = {
        type,
        payload,
        id: Date.now().toString()
      };
      
      client.write(JSON.stringify(message) + '\n', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
  private handleConnection(socket: net.Socket): void {
    const clientId = Date.now().toString();
    this.clients.set(clientId, socket);
    
    socket.on('data', (data) => {
      const messages = data.toString().split('\n').filter(Boolean);
      
      for (const message of messages) {
        try {
          const parsed = JSON.parse(message) as IpcMessage;
          this.emit('message', clientId, parsed);
        } catch (error) {
          console.error('Failed to parse IPC message:', error);
        }
      }
    });
    
    socket.on('close', () => {
      this.clients.delete(clientId);
      this.emit('disconnect', clientId);
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', clientId, error);
    });
    
    this.emit('connect', clientId);
  }
}

export class IpcClient extends EventEmitter {
  private socket: net.Socket;
  private connected: boolean = false;
  
  constructor(private socketPath: string) {
    super();
    this.socket = new net.Socket();
  }
  
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.connect(this.socketPath, () => {
        this.connected = true;
        resolve();
      });
      
      this.socket.on('data', (data) => {
        const messages = data.toString().split('\n').filter(Boolean);
        
        for (const message of messages) {
          try {
            const parsed = JSON.parse(message) as IpcMessage;
            this.emit('message', parsed);
          } catch (error) {
            console.error('Failed to parse IPC message:', error);
          }
        }
      });
      
      this.socket.on('close', () => {
        this.connected = false;
        this.emit('disconnect');
      });
      
      this.socket.on('error', (error) => {
        if (!this.connected) {
          reject(error);
        } else {
          this.emit('error', error);
        }
      });
    });
  }
  
  public send(type: string, payload: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('Not connected'));
        return;
      }
      
      const message: IpcMessage = {
        type,
        payload,
        id: Date.now().toString()
      };
      
      this.socket.write(JSON.stringify(message) + '\n', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
  public disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.socket.end(() => {
        this.connected = false;
        resolve();
      });
    });
  }
}
```

## 4. Timeouts and Cancellation

### Tasks:

1. **Implement Timeout Handling**
   - Add configurable timeouts
   - Implement graceful timeout handling
   - Add timeout notifications

2. **Add Cancellation Support**
   - Implement cancellation from LLM side
   - Add cancellation API
   - Handle cancellation gracefully

3. **Update UI for Timeouts and Cancellation**
   - Add countdown timer for timeouts
   - Implement cancellation UI
   - Add notifications for timeout/cancellation

### Technical Details:

**Timeout Implementation:**
```typescript
// In mcp-server/src/handlers/user-feedback.ts
export async function getUserFeedback(
  params: UserFeedbackRequest,
  context: ToolContext
): Promise<UserFeedbackResponse> {
  // ... existing code ...
  
  // Set up timeout
  const timeout = params.timeout || DEFAULT_TIMEOUT;
  const timeoutPromise = new Promise<UserFeedbackResponse>((resolve) => {
    setTimeout(() => {
      // Kill the Electron process if it's still running
      if (electronProcess && !electronProcess.killed) {
        electronProcess.kill();
      }
      
      resolve(createTimeoutResponse());
    }, timeout);
  });
  
  // Set up cancellation
  const cancellationPromise = new Promise<UserFeedbackResponse>((resolve) => {
    context.onCancel(() => {
      // Kill the Electron process if it's still running
      if (electronProcess && !electronProcess.killed) {
        electronProcess.kill();
      }
      
      resolve({
        feedback: '',
        status: FeedbackStatus.CANCELLED,
        error: 'Operation cancelled by LLM'
      });
    });
  });
  
  // Race between normal completion, timeout, and cancellation
  return Promise.race([
    feedbackPromise,
    timeoutPromise,
    cancellationPromise
  ]);
}
```

**UI Countdown Timer:**
```javascript
// In renderer/app.js
function startCountdownTimer(timeout) {
  const timerElement = document.createElement('div');
  timerElement.className = 'countdown-timer';
  document.querySelector('.container').appendChild(timerElement);
  
  let remainingTime = Math.floor(timeout / 1000);
  
  function updateTimer() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    timerElement.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (remainingTime <= 10) {
      timerElement.classList.add('countdown-warning');
    }
    
    if (remainingTime <= 0) {
      timerElement.textContent = 'Time expired!';
      return;
    }
    
    remainingTime--;
    setTimeout(updateTimer, 1000);
  }
  
  updateTimer();
}

// Start the timer when the page loads
const timeout = parseInt(new URLSearchParams(window.location.search).get('timeout') || '300000', 10);
if (timeout > 0) {
  startCountdownTimer(timeout);
}
```

## 5. Persistent User Input History

### Tasks:

1. **Implement Storage**
   - Create storage mechanism for feedback history
   - Add configuration for storage location
   - Implement data retention policies

2. **Add History API**
   - Create API for accessing feedback history
   - Implement filtering and searching
   - Add pagination for large histories

3. **Create History UI**
   - Implement UI for viewing feedback history
   - Add search and filter capabilities
   - Create visualization for feedback trends

### Technical Details:

**Storage Implementation:**
```typescript
// In shared/src/storage.ts
import * as fs from 'fs-extra';
import * as path from 'path';
import { UserFeedbackJsonResponse } from './types';

export interface StorageOptions {
  storageDir?: string;
  maxEntries?: number;
  retentionDays?: number;
}

export class FeedbackStorage {
  private storageDir: string;
  private maxEntries: number;
  private retentionDays: number;
  
  constructor(options: StorageOptions = {}) {
    this.storageDir = options.storageDir || path.join(process.env.HOME || process.env.USERPROFILE || '', '.user-feedback-mcp', 'history');
    this.maxEntries = options.maxEntries || 1000;
    this.retentionDays = options.retentionDays || 30;
  }
  
  public async initialize(): Promise<void> {
    await fs.ensureDir(this.storageDir);
  }
  
  public async saveFeedback(feedback: UserFeedbackJsonResponse): Promise<string> {
    const id = Date.now().toString();
    const filePath = path.join(this.storageDir, `${id}.json`);
    
    await fs.writeJson(filePath, feedback, { spaces: 2 });
    
    // Clean up old entries
    await this.cleanupOldEntries();
    
    return id;
  }
  
  public async getFeedback(id: string): Promise<UserFeedbackJsonResponse | null> {
    const filePath = path.join(this.storageDir, `${id}.json`);
    
    try {
      return await fs.readJson(filePath);
    } catch (error) {
      return null;
    }
  }
  
  public async listFeedback(options: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  } = {}): Promise<{ total: number; items: Array<{ id: string; feedback: UserFeedbackJsonResponse }> }> {
    const files = await fs.readdir(this.storageDir);
    
    // Filter and sort files
    let filteredFiles = files
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        const aTime = parseInt(path.basename(a, '.json'), 10);
        const bTime = parseInt(path.basename(b, '.json'), 10);
        return bTime - aTime; // Newest first
      });
    
    // Apply date filters
    if (options.startDate || options.endDate) {
      filteredFiles = filteredFiles.filter(file => {
        const timestamp = parseInt(path.basename(file, '.json'), 10);
        const date = new Date(timestamp);
        
        if (options.startDate && date < options.startDate) {
          return false;
        }
        
        if (options.endDate && date > options.endDate) {
          return false;
        }
        
        return true;
      });
    }
    
    const total = filteredFiles.length;
    
    // Apply pagination
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    
    filteredFiles = filteredFiles.slice(offset, offset + limit);
    
    // Load feedback data
    const items = await Promise.all(
      filteredFiles.map(async file => {
        const id = path.basename(file, '.json');
        const filePath = path.join(this.storageDir, file);
        
        try {
          const feedback = await fs.readJson(filePath);
          
          // Apply search filter
          if (options.search && feedback.data?.feedback) {
            if (!feedback.data.feedback.toLowerCase().includes(options.search.toLowerCase())) {
              return null;
            }
          }
          
          return { id, feedback };
        } catch (error) {
          return null;
        }
      })
    );
    
    return {
      total,
      items: items.filter(Boolean) as Array<{ id: string; feedback: UserFeedbackJsonResponse }>
    };
  }
  
  private async cleanupOldEntries(): Promise<void> {
    const files = await fs.readdir(this.storageDir);
    
    // Check if we need to clean up based on max entries
    if (files.length <= this.maxEntries) {
      return;
    }
    
    // Sort files by creation time (oldest first)
    const sortedFiles = files
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        const aTime = parseInt(path.basename(a, '.json'), 10);
        const bTime = parseInt(path.basename(b, '.json'), 10);
        return aTime - bTime;
      });
    
    // Delete oldest files to get back to max entries
    const filesToDelete = sortedFiles.slice(0, sortedFiles.length - this.maxEntries);
    
    for (const file of filesToDelete) {
      await fs.remove(path.join(this.storageDir, file));
    }
    
    // Clean up old entries based on retention days
    const cutoffTime = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
    
    for (const file of sortedFiles) {
      const timestamp = parseInt(path.basename(file, '.json'), 10);
      
      if (timestamp < cutoffTime) {
        await fs.remove(path.join(this.storageDir, file));
      }
    }
  }
}
```

## Expected Outcome

After implementing these future enhancements, we will have:

1. Support for structured input and metadata collection
2. JSON response format for more flexible data handling
3. Improved inter-process communication using IPC or sockets
4. Robust timeout and cancellation support
5. Persistent storage for feedback history

These enhancements will significantly improve the functionality and user experience of the Local User Feedback Interface for MCP Tool, making it more versatile and powerful for a wider range of use cases.
