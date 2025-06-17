import { spawn } from "child_process";
import * as path from "path";
import {
  UserFeedbackRequest,
  UserFeedbackResponse,
  FeedbackStatus,
  WINDOW_TITLE,
  ENV_PROMPT,
  ENV_FEEDBACK_FILE,
  generateFeedbackFilePath,
  readFeedbackFromFile,
  cleanupFeedbackFile,
  createErrorResponse,
  ensureTempDir,
} from "@user-feedback-mcp/shared";
import logger from "../utils/logger";
import { existsSync } from "fs";

/**
 * Handler for the get_user_feedback tool
 */
export async function getUserFeedback(
  params: UserFeedbackRequest
): Promise<UserFeedbackResponse> {
  logger.info("Received user feedback request", { prompt: params.prompt });

  // Validate parameters
  if (!params.prompt) {
    logger.error("Missing required parameter: prompt");
    return createErrorResponse("Prompt is required");
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
      [ENV_FEEDBACK_FILE]: feedbackFilePath,
      // Ensure X11 environment variables are preserved
      DISPLAY: process.env.DISPLAY || ':0',
      XDG_CURRENT_DESKTOP: process.env.XDG_CURRENT_DESKTOP,
      XDG_SESSION_TYPE: process.env.XDG_SESSION_TYPE,
      WAYLAND_DISPLAY: process.env.WAYLAND_DISPLAY,
    };

    logger.debug("Launching Electron GUI", {
      electronGuiPath,
      feedbackFilePath,
    });

    // Launch the Electron GUI subprocess
    const result = await launchElectronGui(electronGuiPath, env);

    // Timeout status has been removed

    if (result.status === FeedbackStatus.ERROR) {
      logger.error("Error in Electron GUI subprocess", { error: result.error });
      return createErrorResponse(
        result.error || "Unknown error",
        result.status
      );
    }

    // Read the feedback from the file
    logger.debug("Reading feedback from file", { feedbackFilePath });
    const response = await readFeedbackFromFile(feedbackFilePath);

    logger.info("User feedback received", {
      status: response.status,
      feedbackLength: response.feedback.length,
    });

    return response;
  } catch (error: any) {
    logger.error("Error in getUserFeedback", {
      error: error.message || String(error),
    });
    return createErrorResponse(error);
  } finally {
    // Clean up the feedback file
    await cleanupFeedbackFile(feedbackFilePath);
  }
}

export function getElectronGuiPath(): string {
  try {
    // In bundled mode, the electron-gui main file should be at a relative path
    // from the current file's directory
    const bundledPath = path.join(__dirname, "electron", "main.js");

    if (existsSync(bundledPath)) {
      logger.debug(`Using bundled Electron GUI path: ${bundledPath}`);
      return bundledPath;
    }

    // If we can't find the bundled path, try to resolve it using require.resolve
    // but store the result to avoid multiple resolutions
    const resolvedPath = require.resolve("./electron/main.js");

    if (existsSync(resolvedPath)) {
      logger.debug(`Using resolved Electron GUI path: ${resolvedPath}`);
      return resolvedPath;
    }

    throw new Error("Could not find Electron GUI path");
  } catch (error: any) {
    logger.error("Failed to resolve Electron GUI path", {
      error: error.message || String(error),
    });
    throw new Error(
      `Failed to resolve Electron GUI path: ${error.message || String(error)}`
    );
  }
}

/**
 * Launches the Electron GUI subprocess
 */
async function launchElectronGui(
  electronGuiPath: string,
  env: NodeJS.ProcessEnv
): Promise<{ status: FeedbackStatus; error?: string }> {
  return new Promise((resolve) => {
    // No timeout handler - window stays open until user submits feedback or closes it

    // Try to find the local Electron executable
    let electronPath = "electron"; // Default to global electron
    try {
      // Try to resolve the electron path from node_modules
      electronPath = require.resolve("electron/cli.js");
      logger.debug(`Using local Electron executable: ${electronPath}`);
    } catch (error) {
      logger.debug(
        `Could not find local Electron executable, using global: ${error}`
      );
    }

    // Spawn the Electron process
    delete env.ELECTRON_RUN_AS_NODE;
    
    // Add Electron flags for better X11 compatibility
    const electronArgs = [
      electronGuiPath,
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu-sandbox'
    ];
    
    const electronProcess = spawn(electronPath, electronArgs, { env });

    // Capture stdout and stderr
    let stdoutData = '';
    let stderrData = '';

    // Handle process exit
    electronProcess.on("exit", (code, signal) => {
      if (code === 0) {
        logger.debug("Electron process exited successfully", { code, signal });
        resolve({ status: FeedbackStatus.SUCCESS });
      } else {
        const errorDetails = {
          exitCode: code,
          signal: signal,
          electronPath: electronPath,
          electronGuiPath: electronGuiPath,
          processId: electronProcess.pid,
          env: {
            [ENV_PROMPT]: env[ENV_PROMPT],
            [ENV_FEEDBACK_FILE]: env[ENV_FEEDBACK_FILE],
          },
          spawnArgs: electronArgs,
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          stdout: stdoutData.trim(),
          stderr: stderrData.trim(),
        };
        
        logger.error("Electron process exited with error v1", errorDetails);
        
        const detailedErrorMessage = `Electron process exited with code ${code}. Details: ${JSON.stringify(errorDetails, null, 2)}`;
        
        resolve({
          status: FeedbackStatus.ERROR,
          error: detailedErrorMessage,
        });
      }
    });

    // Handle process error
    electronProcess.on("error", (error) => {
      const errorDetails = {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
        electronPath: electronPath,
        electronGuiPath: electronGuiPath,
        spawnArgs: electronArgs,
        env: {
          [ENV_PROMPT]: env[ENV_PROMPT],
          [ENV_FEEDBACK_FILE]: env[ENV_FEEDBACK_FILE],
        },
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        cwd: process.cwd(),
        stdout: stdoutData.trim(),
        stderr: stderrData.trim(),
      };
      
      logger.error("Failed to start Electron process", errorDetails);
      
      const detailedErrorMessage = `Failed to start Electron process: ${error.message}. Details: ${JSON.stringify(errorDetails, null, 2)}`;
      
      resolve({
        status: FeedbackStatus.ERROR,
        error: detailedErrorMessage,
      });
    });

    // Capture stdout and stderr data
    electronProcess.stdout.on("data", (data) => {
      const output = data.toString();
      stdoutData += output;
      logger.debug(`Electron stdout: ${output}`);
    });

    electronProcess.stderr.on("data", (data) => {
      const output = data.toString();
      stderrData += output;
      logger.error(`Electron stderr: ${output}`);
    });
  });
}
