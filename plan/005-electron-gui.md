# Phase 4: Electron GUI Implementation

This phase focuses on implementing the Electron GUI component that displays a prompt to the user and collects their feedback.

## 1. Electron Application Setup

### Tasks:

1. **Create Main Process**
   - Set up Electron main process entry point
   - Configure window creation and management
   - Implement IPC between main and renderer processes

2. **Configure Build Process**
   - Set up Electron Builder configuration
   - Configure packaging options
   - Set up development scripts

### Technical Details:

**src/main.ts:**
```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import {
  ENV_PROMPT,
  ENV_TITLE,
  ENV_TIMEOUT,
  ENV_FEEDBACK_FILE,
  DEFAULT_WINDOW_TITLE,
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  writeFeedbackToFile
} from '@user-feedback-mcp/shared';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

// Get parameters from environment variables
const prompt = process.env[ENV_PROMPT] || '';
const title = process.env[ENV_TITLE] || DEFAULT_WINDOW_TITLE;
const timeout = parseInt(process.env[ENV_TIMEOUT] || '0', 10);
const feedbackFilePath = process.env[ENV_FEEDBACK_FILE] || '';

// Validate required parameters
if (!prompt) {
  console.error('Prompt is required');
  app.exit(1);
}

if (!feedbackFilePath) {
  console.error('Feedback file path is required');
  app.exit(1);
}

/**
 * Creates the main window
 */
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
    title,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html file
  const indexPath = path.join(__dirname, '../renderer/index.html');
  mainWindow.loadURL(url.format({
    pathname: indexPath,
    protocol: 'file:',
    slashes: true
  }));

  // Set up timeout if specified
  if (timeout > 0) {
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.close();
      }
    }, timeout);
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});

// Handle IPC messages from renderer
ipcMain.handle('get-prompt', () => {
  return prompt;
});

ipcMain.handle('submit-feedback', async (_event, feedback: string) => {
  try {
    // Write feedback to file
    await writeFeedbackToFile(feedbackFilePath, feedback);
    
    // Close the window
    if (mainWindow) {
      mainWindow.close();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to write feedback:', error);
    return { success: false, error: error.message };
  }
});
```

**src/preload.ts:**
```typescript
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  getPrompt: () => ipcRenderer.invoke('get-prompt'),
  submitFeedback: (feedback: string) => ipcRenderer.invoke('submit-feedback', feedback)
});
```

**electron-builder.json:**
```json
{
  "appId": "com.example.user-feedback-mcp",
  "productName": "User Feedback",
  "directories": {
    "output": "dist"
  },
  "files": [
    "dist/**/*",
    "renderer/**/*"
  ],
  "extraMetadata": {
    "main": "dist/main.js"
  }
}
```

## 2. User Interface Development

### Tasks:

1. **Create HTML/CSS Structure**
   - Design the feedback form
   - Implement responsive layout
   - Add basic styling

2. **Implement JavaScript Logic**
   - Add form submission handling
   - Implement validation
   - Connect to IPC API

### Technical Details:

**renderer/index.html:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Feedback</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div id="prompt-container" class="prompt-container">
      <!-- Prompt will be inserted here -->
    </div>
    
    <form id="feedback-form" class="feedback-form">
      <textarea 
        id="feedback-input" 
        class="feedback-input" 
        placeholder="Type your feedback here..." 
        required
      ></textarea>
      
      <div class="button-container">
        <button type="submit" class="submit-button">Submit</button>
      </div>
    </form>
    
    <div id="status-message" class="status-message"></div>
  </div>
  
  <script src="app.js"></script>
</body>
</html>
```

**renderer/styles.css:**
```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.prompt-container {
  background-color: #fff;
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feedback-form {
  background-color: #fff;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feedback-input {
  width: 100%;
  min-height: 150px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  margin-bottom: 15px;
}

.button-container {
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #357ab8;
}

.status-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  display: none;
}

.status-message.success {
  background-color: #dff0d8;
  color: #3c763d;
  display: block;
}

.status-message.error {
  background-color: #f2dede;
  color: #a94442;
  display: block;
}
```

**renderer/app.js:**
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const promptContainer = document.getElementById('prompt-container');
  const feedbackForm = document.getElementById('feedback-form');
  const feedbackInput = document.getElementById('feedback-input');
  const statusMessage = document.getElementById('status-message');
  
  // Get the prompt from the main process
  try {
    const prompt = await window.api.getPrompt();
    promptContainer.textContent = prompt;
  } catch (error) {
    showError('Failed to load prompt');
    console.error(error);
  }
  
  // Handle form submission
  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const feedback = feedbackInput.value.trim();
    
    if (!feedback) {
      showError('Please enter your feedback');
      return;
    }
    
    try {
      // Disable form while submitting
      setFormEnabled(false);
      
      // Submit feedback to main process
      const result = await window.api.submitFeedback(feedback);
      
      if (result.success) {
        showSuccess('Feedback submitted successfully');
        
        // Close the window after a short delay
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        showError(`Failed to submit feedback: ${result.error}`);
        setFormEnabled(true);
      }
    } catch (error) {
      showError('An error occurred while submitting feedback');
      console.error(error);
      setFormEnabled(true);
    }
  });
  
  // Helper functions
  function showError(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message error';
  }
  
  function showSuccess(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message success';
  }
  
  function setFormEnabled(enabled) {
    feedbackInput.disabled = !enabled;
    feedbackForm.querySelector('button').disabled = !enabled;
  }
});
```

## 3. Error Handling and Validation

### Tasks:

1. **Implement Input Validation**
   - Add client-side validation for feedback
   - Implement length limits and required fields

2. **Add Error Handling**
   - Implement error handling for IPC communication
   - Add user-friendly error messages
   - Implement fallback mechanisms

### Technical Details:

Add validation to the app.js file:

```javascript
// In the submit event handler:
const feedback = feedbackInput.value.trim();

if (!feedback) {
  showError('Please enter your feedback');
  return;
}

if (feedback.length > 10000) {
  showError('Feedback is too long (maximum 10,000 characters)');
  return;
}
```

Add error handling to the main process:

```typescript
// In main.ts:
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  
  if (mainWindow) {
    mainWindow.webContents.send('error', error.message);
  }
  
  // Exit with error code
  app.exit(1);
});
```

## 4. Testing

### Tasks:

1. **Unit Tests**
   - Write tests for the main process
   - Test IPC communication
   - Validate file writing

2. **End-to-End Tests**
   - Test the complete UI flow
   - Validate form submission
   - Test error handling

### Technical Details:

**tests/main.test.ts:**
```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs-extra';

// Mock dependencies
jest.mock('electron', () => ({
  app: {
    on: jest.fn(),
    exit: jest.fn()
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    on: jest.fn(),
    webContents: {
      send: jest.fn()
    }
  })),
  ipcMain: {
    handle: jest.fn()
  }
}));

jest.mock('fs-extra');
jest.mock('path');

describe('Electron Main Process', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up environment variables
    process.env.USER_FEEDBACK_PROMPT = 'Test prompt';
    process.env.USER_FEEDBACK_FILE = '/tmp/feedback.json';
  });
  
  it('should create a browser window on app ready', () => {
    // Trigger the app ready event
    const readyCallback = app.on.mock.calls.find(call => call[0] === 'ready')[1];
    readyCallback();
    
    expect(BrowserWindow).toHaveBeenCalled();
  });
  
  it('should handle get-prompt IPC message', () => {
    // Get the handler for get-prompt
    const getPromptHandler = ipcMain.handle.mock.calls.find(call => call[0] === 'get-prompt')[1];
    
    // Call the handler
    const result = getPromptHandler();
    
    expect(result).toBe('Test prompt');
  });
  
  it('should handle submit-feedback IPC message', async () => {
    // Mock writeFeedbackToFile
    const mockWriteFile = fs.writeJson as jest.Mock;
    mockWriteFile.mockResolvedValue(undefined);
    
    // Get the handler for submit-feedback
    const submitFeedbackHandler = ipcMain.handle.mock.calls.find(call => call[0] === 'submit-feedback')[1];
    
    // Call the handler
    const result = await submitFeedbackHandler({}, 'Test feedback');
    
    expect(result).toEqual({ success: true });
    expect(mockWriteFile).toHaveBeenCalledWith(
      '/tmp/feedback.json',
      expect.objectContaining({
        feedback: 'Test feedback'
      }),
      expect.any(Object)
    );
  });
  
  // Add more tests for error handling, timeout, etc.
});
```

## Expected Outcome

After completing this phase, we will have:

1. A fully functional Electron GUI that displays a prompt and collects user feedback
2. Robust error handling and validation
3. Clean and responsive user interface
4. Unit and end-to-end tests for the GUI component

## Next Steps

Once the Electron GUI is implemented, we can proceed to implement the CLI application that will serve as the entry point for users, and then integrate all components together.
