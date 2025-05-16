import { spawn } from "child_process";
import * as path from "path";
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
      [ENV_TITLE]: params.title || DEFAULT_WINDOW_TITLE,
      [ENV_TIMEOUT]: String(params.timeout || DEFAULT_TIMEOUT),
      [ENV_FEEDBACK_FILE]: feedbackFilePath,
    };

    logger.debug("Launching Electron GUI", {
      electronGuiPath,
      feedbackFilePath,
      timeout: params.timeout || DEFAULT_TIMEOUT,
    });

    // Launch the Electron GUI subprocess
    const result = await launchElectronGui(
      electronGuiPath,
      env,
      params.timeout || DEFAULT_TIMEOUT
    );

    if (result.status === FeedbackStatus.TIMEOUT) {
      logger.warn("User feedback request timed out");
      return createTimeoutResponse();
    }

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
    const electronProcess = spawn(electronPath, [electronGuiPath], { env });

    // Handle process exit
    electronProcess.on("exit", (code) => {
      clearTimeout(timeoutId);

      if (code === 0) {
        resolve({ status: FeedbackStatus.SUCCESS });
      } else {
        resolve({
          status: FeedbackStatus.ERROR,
          error: `Electron process exited with code ${code}`,
        });
      }
    });

    // Handle process error
    electronProcess.on("error", (error) => {
      clearTimeout(timeoutId);
      resolve({
        status: FeedbackStatus.ERROR,
        error: `Failed to start Electron process: ${error.message}`,
      });
    });

    // Log stdout and stderr for debugging
    electronProcess.stdout.on("data", (data) => {
      logger.debug(`Electron stdout: ${data}`);
    });

    electronProcess.stderr.on("data", (data) => {
      logger.error(`Electron stderr: ${data}`);
    });
  });
}
