import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import {
  ENV_PROMPT,
  ENV_TITLE,
  ENV_TIMEOUT,
  ENV_FEEDBACK_FILE,
  DEFAULT_WINDOW_TITLE,
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  writeFeedbackToFile,
} from "@user-feedback-mcp/shared";

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

// Get parameters from environment variables
const prompt = process.env[ENV_PROMPT] || "";
const title = process.env[ENV_TITLE] || DEFAULT_WINDOW_TITLE;
const timeout = parseInt(process.env[ENV_TIMEOUT] || "0", 10);
const feedbackFilePath = process.env[ENV_FEEDBACK_FILE] || "";

// Validate required parameters
if (!prompt) {
  console.error("Prompt is required");
  app.exit(1);
}

if (!feedbackFilePath) {
  console.error("Feedback file path is required");
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
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the index.html file
  const indexPath = path.join(__dirname, "../renderer/index.html");
  mainWindow.loadURL(
    url.format({
      pathname: indexPath,
      protocol: "file:",
      slashes: true,
    })
  );

  // Set up timeout if specified
  if (timeout > 0) {
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.close();
      }
    }, timeout);
  }

  // Handle window close
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.on("ready", () => {
  createWindow();
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  app.quit();
});

// Handle IPC messages from renderer
ipcMain.handle("get-prompt", () => {
  return prompt;
});

ipcMain.handle("submit-feedback", async (_event, feedback: string) => {
  try {
    // Write feedback to file
    await writeFeedbackToFile(feedbackFilePath, feedback);

    // Close the window
    if (mainWindow) {
      mainWindow.close();
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to write feedback:", error);
    return { success: false, error: error.message };
  }
});

// Error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);

  if (mainWindow) {
    mainWindow.webContents.send("error", error.message);
  }

  // Exit with error code
  app.exit(1);
});
