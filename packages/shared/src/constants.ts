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
