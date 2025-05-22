import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import { existsSync } from "fs";
import {
  ENV_PROMPT,
  ENV_FEEDBACK_FILE,
  WINDOW_TITLE,
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  writeFeedbackToFile,
} from "@user-feedback-mcp/shared";

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

// Get parameters from environment variables
const prompt = process.env[ENV_PROMPT] || "Test";
// Title is now fixed to "User Feedback"
const feedbackFilePath =
  process.env[ENV_FEEDBACK_FILE] ||
  "/Users/jan/projects/private/user-feedback-mcp/apps/cli/pack/feedback.json";

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
    title: WINDOW_TITLE,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the index.html file
  // Try multiple possible paths for the HTML file
  let indexPath;

  // First try the bundled path (in electron directory)
  const bundledPath = path.join(__dirname, "renderer/index.html");
  if (existsSync(bundledPath)) {
    indexPath = bundledPath;
  }
  // Then try the development path
  else {
    const devPath = path.join(__dirname, "../renderer/index.html");
    if (existsSync(devPath)) {
      indexPath = devPath;
    } else {
      // Fallback to the old path structure
      indexPath = path.join(__dirname, "../renderer/index.html");
    }
  }

  // Log the path being used
  console.log(`Loading HTML from: ${indexPath}`);

  mainWindow.loadURL(
    url.format({
      pathname: indexPath,
      protocol: "file:",
      slashes: true,
    })
  );

  // Timeout for auto-closing has been removed to allow the window to stay open indefinitely
  // The window will only close when the user submits feedback or manually closes the window

  // Handle window close
  mainWindow.on("close", async (event) => {
    // Check if the window is being closed by the user (not by our code)
    // We can detect this by checking if the window is still defined
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        // Write a cancelled status to the feedback file
        await writeFeedbackToFile(feedbackFilePath, "", true);
        console.log("User cancelled feedback by closing the window");
      } catch (error) {
        console.error("Failed to write cancelled status:", error);
      }
    }
  });

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
