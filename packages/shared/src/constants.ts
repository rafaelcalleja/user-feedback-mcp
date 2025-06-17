import * as path from "path";
import * as os from "os";

/**
 * Window title for the feedback window
 */
export const WINDOW_TITLE = "User Feedback";

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
export const TEMP_DIR = path.join(os.tmpdir(), "get-user-feedback");

/**
 * File name for the feedback file
 */
export const FEEDBACK_FILE_NAME = "feedback.json";

/**
 * Environment variable for the prompt
 */
export const ENV_PROMPT = "USER_FEEDBACK_PROMPT";

// No environment variables for title or timeout as they are now fixed

/**
 * Environment variable for the feedback file path
 */
export const ENV_FEEDBACK_FILE = "USER_FEEDBACK_FILE";

/**
 * Environment variable to enable the universal knowledge database tool
 */
export const ENV_ENABLE_KNOWLEDGE_DB = "ENABLE_KNOWLEDGE_DB";

/**
 * Environment variable to enable the UI tester tool
 */
export const ENV_ENABLE_UI_TESTER = "ENABLE_UI_TESTER";
