// Re-export shared constants and types that are relevant to Electron
export {
  ENV_PROMPT,
  ENV_TITLE,
  ENV_TIMEOUT,
  ENV_FEEDBACK_FILE,
  DEFAULT_WINDOW_TITLE,
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  writeFeedbackToFile,
} from "@get-user-feedback/shared";

// Export the path to the main.js file
export const MAIN_PATH = __filename;
