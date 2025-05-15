import * as fs from "fs-extra";
import * as path from "path";
import { TEMP_DIR, FEEDBACK_FILE_NAME } from "./constants";
import { FeedbackFile, UserFeedbackResponse, FeedbackStatus } from "./types";

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
    timestamp: Date.now(),
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
    const data = (await fs.readJson(filePath)) as FeedbackFile;

    return {
      feedback: data.feedback,
      status: FeedbackStatus.SUCCESS,
    };
  } catch (error: any) {
    return {
      feedback: "",
      status: FeedbackStatus.ERROR,
      error: `Failed to read feedback file: ${error.message || String(error)}`,
    };
  }
}

/**
 * Cleans up the feedback file
 */
export async function cleanupFeedbackFile(filePath: string): Promise<void> {
  try {
    await fs.remove(filePath);
  } catch (error: any) {
    console.error(
      `Failed to clean up feedback file: ${error.message || String(error)}`
    );
  }
}
